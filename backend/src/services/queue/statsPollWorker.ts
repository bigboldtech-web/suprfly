import { Job } from 'bullmq';
import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';
import { fetchCommentStats } from '../linkedin/voyagerApi';
import { fetchTweetStats } from '../twitter/twitterApi';

// Polls engagement stats (likes / replies / views) for recently-posted comments.
// Cadence: every 30 minutes for the first 7 days, then ~daily until 30 days post-post.
export async function processStatsPoll(_job: Job) {
  const now = new Date();
  const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Comments posted in last 7 days — poll if last polled > 30 min ago.
  // Comments posted 7-30 days ago — poll once a day.
  const candidates = await prisma.comment.findMany({
    where: {
      status: 'POSTED',
      platformCommentId: { not: null },
      postedAt: { gte: thirtyDaysAgo },
      OR: [
        { statsLastPolledAt: null },
        {
          AND: [
            { postedAt: { gte: sevenDaysAgo } },
            { statsLastPolledAt: { lt: thirtyMinAgo } },
          ],
        },
        {
          AND: [
            { postedAt: { lt: sevenDaysAgo } },
            { statsLastPolledAt: { lt: oneDayAgo } },
          ],
        },
      ],
    },
    include: { account: { select: { sessionData: true, platform: true } } },
    take: 100,
  });

  let polled = 0;
  for (const comment of candidates) {
    try {
      const stats =
        comment.platform === 'LINKEDIN'
          ? await fetchCommentStats(comment.account.sessionData, comment.platformCommentId!)
          : await fetchTweetStats(comment.account.sessionData, comment.platformCommentId!);

      if (stats) {
        await prisma.comment.update({
          where: { id: comment.id },
          data: {
            likesCount: stats.likes,
            repliesCount: stats.replies,
            viewsCount: stats.views,
            statsLastPolledAt: now,
          },
        });
        polled++;
      } else {
        // No platform helper available yet — at least mark as polled so we don't refetch immediately.
        await prisma.comment.update({
          where: { id: comment.id },
          data: { statsLastPolledAt: now },
        });
      }
    } catch (err) {
      logger.warn(`Stats poll failed for comment ${comment.id}: ${(err as Error).message}`);
    }
  }

  logger.info(`Stats poll: ${polled}/${candidates.length} comments updated`);
}
