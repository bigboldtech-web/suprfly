import { CommentLength, CommentTone, TargetType } from '@prisma/client';
import { prisma } from '../config/database';

export async function listWorkflows(userId: string) {
  return prisma.workflow.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      account: {
        select: { id: true, platform: true, platformUsername: true, avatarUrl: true, accountKind: true },
      },
      tone: { select: { id: true, name: true } },
      _count: { select: { keywords: true, creators: true, comments: true } },
    },
  });
}

export async function getWorkflow(userId: string, id: string) {
  const wf = await prisma.workflow.findFirst({
    where: { id, userId },
    include: {
      account: {
        select: { id: true, platform: true, platformUsername: true, avatarUrl: true, accountKind: true, commentsTodayCount: true },
      },
      tone: true,
      keywords: { orderBy: { createdAt: 'desc' } },
      creators: { orderBy: { createdAt: 'desc' } },
      _count: { select: { comments: true } },
    },
  });
  if (!wf) throw Object.assign(new Error('Workflow not found'), { statusCode: 404 });
  return wf;
}

export async function createWorkflow(userId: string, data: {
  accountId: string;
  toneId: string;
  name: string;
  targetType?: TargetType;
  timezone?: string;
  autoPost?: boolean;
  language?: string;
  commentTone?: CommentTone;
  emojiEnabled?: boolean;
  commentLength?: CommentLength;
  dailyLimit?: number;
  isActive?: boolean;
}) {
  // Verify account + tone ownership
  const [account, tone, user] = await Promise.all([
    prisma.connectedAccount.findFirst({ where: { id: data.accountId, userId } }),
    prisma.tone.findFirst({ where: { id: data.toneId, userId } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { maxWorkflowsPerAccount: true, maxCommentsDayPerAccount: true },
    }),
  ]);

  if (!account) throw Object.assign(new Error('Account not found'), { statusCode: 404 });
  if (!tone) throw Object.assign(new Error('Tone not found'), { statusCode: 404 });
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  const existingCount = await prisma.workflow.count({ where: { accountId: data.accountId, userId } });
  if (existingCount >= user.maxWorkflowsPerAccount) {
    throw Object.assign(
      new Error(`Workflow limit reached for this account (${user.maxWorkflowsPerAccount}). Upgrade your plan to add more.`),
      { statusCode: 403 }
    );
  }

  const dailyLimit = Math.min(data.dailyLimit ?? 10, user.maxCommentsDayPerAccount);

  return prisma.workflow.create({
    data: {
      userId,
      accountId: data.accountId,
      toneId: data.toneId,
      name: data.name,
      targetType: data.targetType ?? 'KEYWORD',
      timezone: data.timezone ?? 'Asia/Kolkata',
      autoPost: data.autoPost ?? false,
      language: data.language ?? 'en-US',
      commentTone: data.commentTone ?? 'PROFESSIONAL_TONE',
      emojiEnabled: data.emojiEnabled ?? false,
      commentLength: data.commentLength ?? 'SHORT',
      dailyLimit,
      isActive: data.isActive ?? true,
    },
  });
}

export async function updateWorkflow(userId: string, id: string, data: Partial<{
  name: string;
  toneId: string;
  targetType: TargetType;
  timezone: string;
  autoPost: boolean;
  language: string;
  commentTone: CommentTone;
  emojiEnabled: boolean;
  commentLength: CommentLength;
  dailyLimit: number;
  isActive: boolean;
}>) {
  const wf = await prisma.workflow.findFirst({ where: { id, userId } });
  if (!wf) throw Object.assign(new Error('Workflow not found'), { statusCode: 404 });

  if (data.toneId && data.toneId !== wf.toneId) {
    const tone = await prisma.tone.findFirst({ where: { id: data.toneId, userId } });
    if (!tone) throw Object.assign(new Error('Tone not found'), { statusCode: 404 });
  }

  if (typeof data.dailyLimit === 'number') {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { maxCommentsDayPerAccount: true },
    });
    if (user && data.dailyLimit > user.maxCommentsDayPerAccount) {
      data.dailyLimit = user.maxCommentsDayPerAccount;
    }
  }

  return prisma.workflow.update({ where: { id }, data });
}

export async function deleteWorkflow(userId: string, id: string) {
  const wf = await prisma.workflow.findFirst({ where: { id, userId } });
  if (!wf) throw Object.assign(new Error('Workflow not found'), { statusCode: 404 });
  await prisma.workflow.delete({ where: { id } });
}

export async function setActive(userId: string, id: string, isActive: boolean) {
  const wf = await prisma.workflow.findFirst({ where: { id, userId } });
  if (!wf) throw Object.assign(new Error('Workflow not found'), { statusCode: 404 });
  return prisma.workflow.update({ where: { id }, data: { isActive } });
}
