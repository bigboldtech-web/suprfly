import { prisma } from '../config/database';
import { PLAN_LIMITS } from '../utils/constants';

export async function getStats() {
  const [totalUsers, activeUsers, paidUsers, totalCommentsAllTime] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { plan: { not: 'FREE' } } }),
    prisma.comment.count({ where: { status: 'POSTED' } }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalCommentsToday = await prisma.comment.count({
    where: { status: 'POSTED', postedAt: { gte: today } },
  });

  const linkedinAccounts = await prisma.connectedAccount.count({ where: { platform: 'LINKEDIN', isActive: true } });
  const twitterAccounts = await prisma.connectedAccount.count({ where: { platform: 'TWITTER', isActive: true } });

  const planDistribution = await prisma.user.groupBy({
    by: ['plan'],
    _count: true,
  });

  return {
    totalUsers,
    activeUsers,
    paidUsers,
    totalCommentsToday,
    totalCommentsAllTime,
    activeAccounts: { linkedin: linkedinAccounts, twitter: twitterAccounts },
    planDistribution: Object.fromEntries(planDistribution.map((p) => [p.plan, p._count])),
  };
}

export async function listUsers(page = 1, limit = 20, search?: string) {
  const where = search
    ? { OR: [{ email: { contains: search } }, { name: { contains: search } }] }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: where as any,
      select: {
        id: true, email: true, name: true, plan: true, isActive: true, createdAt: true,
        _count: { select: { accounts: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where: where as any }),
  ]);

  return {
    users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getUserDetails(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      accounts: true,
      subscriptions: { orderBy: { createdAt: 'desc' }, take: 5 },
      _count: { select: { comments: true, keywords: true, creators: true, workflows: true } },
    },
  });
}

export async function updateUser(userId: string, data: Record<string, any>) {
  // If plan is being changed, update limits too
  if (data.plan && PLAN_LIMITS[data.plan as keyof typeof PLAN_LIMITS]) {
    const limits = PLAN_LIMITS[data.plan as keyof typeof PLAN_LIMITS];
    data.maxAccounts = limits.accounts;
    data.maxWorkflowsPerAccount = limits.workflowsPerAccount;
    data.maxKeywordsPerWorkflow = limits.keywordsPerWorkflow;
    data.maxCreatorsPerWorkflow = limits.creatorsPerWorkflow;
    data.maxCommentsDayPerAccount = limits.commentsDayPerAccount;
    data.maxCommentsDayGlobal = limits.commentsDayGlobal;
  }

  return prisma.user.update({ where: { id: userId }, data });
}

export async function extendPlan(userId: string, days: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const currentExpiry = user.planExpiresAt || new Date();
  const newExpiry = new Date(currentExpiry);
  newExpiry.setDate(newExpiry.getDate() + days);

  return prisma.user.update({
    where: { id: userId },
    data: { planExpiresAt: newExpiry },
  });
}

export async function getRecentComments(limit = 50) {
  return prisma.comment.findMany({
    where: { status: 'POSTED' },
    orderBy: { postedAt: 'desc' },
    take: limit,
    include: {
      user: { select: { email: true, name: true } },
      account: { select: { platform: true, platformUsername: true } },
      post: { select: { authorName: true, postContent: true } },
    },
  });
}
