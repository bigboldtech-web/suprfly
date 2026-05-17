import { Job } from 'bullmq';
import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';

export async function processDailyReset(_job: Job) {
  const today = new Date();

  // Reset all three counters
  await Promise.all([
    prisma.connectedAccount.updateMany({
      data: { commentsTodayCount: 0, commentsTodayDate: today },
    }),
    prisma.workflow.updateMany({
      data: { commentsTodayCount: 0, commentsTodayDate: today },
    }),
    prisma.user.updateMany({
      data: { globalCommentsTodayCount: 0, globalCommentsTodayDate: today },
    }),
  ]);

  // Aggregate yesterday's analytics per account
  const accounts = await prisma.connectedAccount.findMany({
    where: { isActive: true },
    select: { id: true, userId: true, platform: true },
  });

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  for (const account of accounts) {
    const [commentsPosted, likes] = await Promise.all([
      prisma.comment.count({
        where: {
          accountId: account.id,
          status: 'POSTED',
          postedAt: {
            gte: new Date(`${yesterdayStr}T00:00:00Z`),
            lt: new Date(`${yesterdayStr}T23:59:59Z`),
          },
        },
      }),
      prisma.comment.aggregate({
        where: {
          accountId: account.id,
          status: 'POSTED',
          postedAt: {
            gte: new Date(`${yesterdayStr}T00:00:00Z`),
            lt: new Date(`${yesterdayStr}T23:59:59Z`),
          },
        },
        _sum: { likesCount: true, viewsCount: true },
      }),
    ]);

    if (commentsPosted > 0) {
      await prisma.analyticsSnapshot.upsert({
        where: {
          userId_accountId_platform_date: {
            userId: account.userId,
            accountId: account.id,
            platform: account.platform,
            date: new Date(yesterdayStr),
          },
        },
        update: {
          commentsPosted,
          likes: likes._sum.likesCount ?? 0,
          impressions: likes._sum.viewsCount ?? 0,
        },
        create: {
          userId: account.userId,
          accountId: account.id,
          platform: account.platform,
          date: new Date(yesterdayStr),
          commentsPosted,
          likes: likes._sum.likesCount ?? 0,
          impressions: likes._sum.viewsCount ?? 0,
        },
      });
    }
  }

  logger.info(`Daily reset complete. Processed ${accounts.length} accounts.`);
}
