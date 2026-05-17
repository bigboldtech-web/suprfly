import { Job } from 'bullmq';
import { prisma } from '../../config/database';
import { postLinkedInComment } from '../linkedin/commentPoster';
import { postTwitterReply } from '../twitter/commentPoster';
import { logger } from '../../utils/logger';
import { RATE_LIMITS } from '../../utils/constants';
import { canCommentOnWorkflow, incrementCounters } from '../quota.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface CommentPostJobData {
  commentId: string;
}

export async function processCommentPosting(job: Job<CommentPostJobData>) {
  const { commentId } = job.data;

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      post: true,
      account: true,
      workflow: { include: { account: true } },
    },
  });

  if (!comment || !['APPROVED', 'QUEUED'].includes(comment.status)) return;

  const account = comment.account;
  const workflow = comment.workflow;
  const limits = RATE_LIMITS[comment.platform.toLowerCase() as 'linkedin' | 'twitter'];

  // Quota gates
  const quota = await canCommentOnWorkflow(workflow.id);
  if (!quota.ok) {
    logger.info(`Comment ${commentId}: quota gate ${quota.reason} — rescheduling`);
    throw new Error(`QUOTA_${quota.reason}`);
  }

  // Hourly limit
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const hourlyCount = await prisma.comment.count({
    where: { accountId: account.id, status: 'POSTED', postedAt: { gte: oneHourAgo } },
  });
  if (hourlyCount >= limits.maxCommentsPerHour) {
    logger.info(`Comment ${commentId}: hourly limit reached`);
    throw new Error('HOURLY_LIMIT_REACHED');
  }

  // Active hours
  const now = dayjs().tz(workflow.timezone);
  const hour = now.hour();
  if (hour < limits.activeHoursStart || hour >= limits.activeHoursEnd) {
    logger.info(`Comment ${commentId}: outside active hours`);
    throw new Error('OUTSIDE_ACTIVE_HOURS');
  }

  await prisma.comment.update({ where: { id: commentId }, data: { status: 'POSTING' } });

  let result: { success: boolean; commentId?: string; tweetId?: string; error?: string };

  if (comment.platform === 'LINKEDIN') {
    result = await postLinkedInComment(account.sessionData, comment.post.postId, comment.commentText);
  } else {
    result = await postTwitterReply(account.sessionData, comment.post.postId, comment.commentText);
  }

  if (result.success) {
    await prisma.comment.update({
      where: { id: commentId },
      data: {
        status: 'POSTED',
        platformCommentId: result.commentId || result.tweetId,
        postedAt: new Date(),
      },
    });

    await incrementCounters(workflow.id, account.id, comment.userId);

    if (comment.post.matchType === 'KEYWORD') {
      await prisma.keyword.updateMany({
        where: { workflowId: workflow.id, keyword: comment.post.matchValue },
        data: { commentsCount: { increment: 1 }, lastCommentAt: new Date() },
      });
    } else {
      await prisma.creator.updateMany({
        where: { workflowId: workflow.id, creatorName: comment.post.matchValue },
        data: { commentsCount: { increment: 1 }, lastCommentAt: new Date() },
      });
    }

    logger.info(`Comment ${commentId} POSTED to ${comment.platform}`);
  } else {
    const isSessionError = result.error?.includes('401') || result.error?.includes('403');

    if (isSessionError) {
      await prisma.connectedAccount.update({
        where: { id: account.id },
        data: { sessionValid: false, sessionInvalidReason: 'SESSION_EXPIRED_ON_POST' },
      });

      await prisma.notification.create({
        data: {
          userId: comment.userId,
          type: 'SESSION_EXPIRED',
          title: `${comment.platform} session expired`,
          message: `Your ${comment.platform} session has expired. Please reconnect via the Chrome Extension.`,
        },
      });
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: {
        status: 'FAILED',
        failureReason: result.error,
        retryCount: { increment: 1 },
      },
    });

    logger.error(`Comment ${commentId} FAILED: ${result.error}`);

    if (!isSessionError && comment.retryCount < comment.maxRetries) {
      throw new Error(result.error);
    }
  }
}
