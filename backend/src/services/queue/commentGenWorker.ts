import { Job } from 'bullmq';
import { prisma } from '../../config/database';
import { commentPostQueue } from './index';
import { commentGenerator } from '../ai/commentGenerator';
import { checkPostSafety } from '../ai/contentSafety';
import { detectLanguage } from '../ai/languageDetector';
import { logger } from '../../utils/logger';
import { RATE_LIMITS } from '../../utils/constants';

interface CommentGenJobData {
  postId: string;
  workflowId: string;
}

export async function processCommentGeneration(job: Job<CommentGenJobData>) {
  const { postId, workflowId } = job.data;

  const post = await prisma.discoveredPost.findUnique({ where: { id: postId } });
  if (!post || post.isProcessed) return;

  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: {
      account: true,
      tone: true,
      user: { select: { id: true } },
    },
  });
  if (!workflow) return;

  // Final content safety check
  const safety = checkPostSafety(post.postContent);
  if (!safety.safe) {
    await prisma.comment.create({
      data: {
        userId: workflow.userId,
        workflowId,
        accountId: workflow.accountId,
        postId: post.id,
        commentText: '',
        status: 'FILTERED',
        platform: post.platform,
        failureReason: safety.reason,
      },
    });
    await prisma.discoveredPost.update({
      where: { id: post.id },
      data: { isProcessed: true, processedAt: new Date(), isSensitive: true, sensitiveReason: safety.reason },
    });
    return;
  }

  const postLanguage = post.postLanguage || detectLanguage(post.postContent);

  try {
    const result = await commentGenerator.generate({
      postContent: post.postContent,
      postLanguage,
      authorName: post.authorName,
      platform: post.platform,
      tone: {
        interactionStyle: workflow.tone.interactionStyle,
        writingStyle: workflow.tone.writingStyle,
        customPrompt: workflow.tone.customPrompt,
      },
      workflow: {
        language: workflow.language,
        commentTone: workflow.commentTone,
        emojiEnabled: workflow.emojiEnabled,
        commentLength: workflow.commentLength,
      },
    });

    // Status routing — autoPost ON: APPROVED → POST; OFF: PENDING_REVIEW
    const status = workflow.autoPost ? 'APPROVED' : 'PENDING_REVIEW';

    const comment = await prisma.comment.create({
      data: {
        userId: workflow.userId,
        workflowId,
        accountId: workflow.accountId,
        postId: post.id,
        commentText: result.commentText,
        status,
        platform: post.platform,
        aiModel: result.model,
        aiPromptTokens: result.promptTokens,
        aiCompletionTokens: result.completionTokens,
        generationTimeMs: result.generationTimeMs,
        approvedAt: workflow.autoPost ? new Date() : null,
      },
    });

    if (status === 'APPROVED') {
      const delay = calculateHumanDelay(post.platform);
      await commentPostQueue.add(
        `post-${comment.id}`,
        { commentId: comment.id },
        { jobId: `post-${comment.id}`, delay },
      );
    } else {
      // Pending review — notify
      await prisma.notification.create({
        data: {
          userId: workflow.userId,
          type: 'COMMENT_PENDING_REVIEW',
          title: 'New comment awaiting review',
          message: `A new AI-generated comment for "${post.authorName}" is ready in your review queue.`,
          data: { commentId: comment.id, workflowId },
        },
      });
    }

    await prisma.discoveredPost.update({
      where: { id: post.id },
      data: { isProcessed: true, processedAt: new Date(), postLanguage },
    });

    logger.info(
      `Comment generated for post ${post.postId} [${status}] — ${result.model} (${result.generationTimeMs}ms)`,
    );
  } catch (err) {
    logger.error(`Comment generation failed for post ${post.id}:`, err);
    throw err;
  }
}

function calculateHumanDelay(platform: 'LINKEDIN' | 'TWITTER'): number {
  const limits = RATE_LIMITS[platform.toLowerCase() as 'linkedin' | 'twitter'];
  const min = limits.minDelaySeconds;
  const max = limits.maxDelaySeconds;

  const gaussian = (Math.random() + Math.random() + Math.random()) / 3;
  const delay = Math.floor(min + gaussian * (max - min));
  const jitter = Math.floor(Math.random() * 15);

  return (delay + jitter) * 1000;
}
