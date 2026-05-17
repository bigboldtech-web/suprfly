import { prisma } from '../config/database';
import { getQuotaSnapshot } from './quota.service';
import dayjs from 'dayjs';

const todayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export async function getSummary(userId: string) {
  const start = todayStart();
  const where = { userId, postedAt: { gte: start }, status: 'POSTED' as const };

  const [commentsToday, agg] = await Promise.all([
    prisma.comment.count({ where }),
    prisma.comment.aggregate({
      where,
      _sum: { likesCount: true, viewsCount: true, repliesCount: true },
    }),
  ]);

  // Followers today: latest analytics snapshot per account where date = today
  const todayDate = dayjs().format('YYYY-MM-DD');
  const snapshots = await prisma.analyticsSnapshot.findMany({
    where: { userId, date: new Date(todayDate) },
    select: { followers: true },
  });
  const followersToday = snapshots.reduce((sum, s) => sum + s.followers, 0);

  return {
    commentsToday,
    impressionsToday: agg._sum.viewsCount ?? 0,
    likesToday: agg._sum.likesCount ?? 0,
    repliesToday: agg._sum.repliesCount ?? 0,
    followersToday,
  };
}

export async function getTimeseries(userId: string, range: '24h' | '7d' | '30d' = '24h') {
  const now = new Date();
  let start: Date;
  let bucketHours: number;

  if (range === '24h') {
    start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    bucketHours = 1;
  } else if (range === '7d') {
    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    bucketHours = 24;
  } else {
    start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    bucketHours = 24;
  }

  const comments = await prisma.comment.findMany({
    where: { userId, status: 'POSTED', postedAt: { gte: start } },
    select: { postedAt: true, likesCount: true, viewsCount: true },
  });

  // Build bucket grid
  const buckets: { ts: number; comments: number; impressions: number; likes: number }[] = [];
  for (let t = start.getTime(); t <= now.getTime(); t += bucketHours * 60 * 60 * 1000) {
    buckets.push({ ts: t, comments: 0, impressions: 0, likes: 0 });
  }
  for (const c of comments) {
    if (!c.postedAt) continue;
    const ts = c.postedAt.getTime();
    const bucket = buckets.find((b, i) => {
      const next = buckets[i + 1]?.ts ?? Infinity;
      return ts >= b.ts && ts < next;
    });
    if (bucket) {
      bucket.comments += 1;
      bucket.impressions += c.viewsCount;
      bucket.likes += c.likesCount;
    }
  }

  return buckets.map((b) => ({
    timestamp: new Date(b.ts).toISOString(),
    comments: b.comments,
    impressions: b.impressions,
    likes: b.likes,
    followers: 0, // followers timeseries handled separately via analyticsSnapshot
  }));
}

export async function getQuota(userId: string) {
  return getQuotaSnapshot(userId);
}

export async function getOverview(userId: string, accountId?: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const where: any = { userId, date: { gte: startDate } };
  if (accountId) where.accountId = accountId;

  return prisma.analyticsSnapshot.findMany({
    where,
    orderBy: { date: 'asc' },
  });
}

export async function getPerformance(userId: string, workflowId?: string) {
  const [creators, keywords] = await Promise.all([
    prisma.creator.findMany({
      where: { userId, ...(workflowId && { workflowId }) },
      select: {
        id: true, creatorName: true, creatorUsername: true,
        commentsCount: true, platform: true,
      },
      orderBy: { commentsCount: 'desc' },
      take: 20,
    }),
    prisma.keyword.findMany({
      where: { userId, ...(workflowId && { workflowId }) },
      select: { id: true, keyword: true, commentsCount: true },
      orderBy: { commentsCount: 'desc' },
      take: 20,
    }),
  ]);

  return { creators, keywords };
}

export async function getDailyBreakdown(userId: string, accountId?: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const where: any = { userId, status: 'POSTED', postedAt: { gte: startDate } };
  if (accountId) where.accountId = accountId;

  const comments = await prisma.comment.findMany({
    where,
    select: { postedAt: true, platform: true },
    orderBy: { postedAt: 'asc' },
  });

  const daily: Record<string, { linkedin: number; twitter: number; total: number }> = {};
  for (const c of comments) {
    if (!c.postedAt) continue;
    const day = c.postedAt.toISOString().split('T')[0];
    if (!daily[day]) daily[day] = { linkedin: 0, twitter: 0, total: 0 };
    daily[day].total++;
    if (c.platform === 'LINKEDIN') daily[day].linkedin++;
    else daily[day].twitter++;
  }

  return Object.entries(daily).map(([date, counts]) => ({ date, ...counts }));
}
