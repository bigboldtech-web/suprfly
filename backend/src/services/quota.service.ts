import { prisma } from '../config/database';
import dayjs from 'dayjs';

export interface QuotaCheck {
  ok: boolean;
  reason?: 'GLOBAL' | 'ACCOUNT' | 'WORKFLOW';
  message?: string;
}

const todayStr = () => dayjs().format('YYYY-MM-DD');

function dateMatchesToday(date: Date | null | undefined) {
  if (!date) return false;
  return dayjs(date).format('YYYY-MM-DD') === todayStr();
}

export async function canCommentOnWorkflow(workflowId: string): Promise<QuotaCheck> {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: {
      account: true,
      user: {
        select: {
          maxCommentsDayPerAccount: true,
          maxCommentsDayGlobal: true,
          globalCommentsTodayCount: true,
          globalCommentsTodayDate: true,
        },
      },
    },
  });
  if (!workflow || !workflow.isActive) return { ok: false, reason: 'WORKFLOW', message: 'Workflow inactive or missing' };

  const workflowCount = dateMatchesToday(workflow.commentsTodayDate) ? workflow.commentsTodayCount : 0;
  if (workflowCount >= workflow.dailyLimit) {
    return { ok: false, reason: 'WORKFLOW', message: `Workflow daily limit reached (${workflow.dailyLimit})` };
  }

  const accountCount = dateMatchesToday(workflow.account.commentsTodayDate) ? workflow.account.commentsTodayCount : 0;
  if (accountCount >= workflow.user.maxCommentsDayPerAccount) {
    return { ok: false, reason: 'ACCOUNT', message: `Account daily limit reached (${workflow.user.maxCommentsDayPerAccount})` };
  }

  const globalCount = dateMatchesToday(workflow.user.globalCommentsTodayDate) ? workflow.user.globalCommentsTodayCount : 0;
  if (globalCount >= workflow.user.maxCommentsDayGlobal) {
    return { ok: false, reason: 'GLOBAL', message: `Global daily limit reached (${workflow.user.maxCommentsDayGlobal})` };
  }

  return { ok: true };
}

export async function incrementCounters(workflowId: string, accountId: string, userId: string) {
  const today = new Date();
  await prisma.$transaction([
    prisma.workflow.update({
      where: { id: workflowId },
      data: {
        commentsTodayCount: { increment: 1 },
        commentsTodayDate: today,
      },
    }),
    prisma.connectedAccount.update({
      where: { id: accountId },
      data: {
        commentsTodayCount: { increment: 1 },
        commentsTodayDate: today,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        globalCommentsTodayCount: { increment: 1 },
        globalCommentsTodayDate: today,
      },
    }),
  ]);
}

export async function getQuotaSnapshot(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      maxCommentsDayGlobal: true,
      maxCommentsDayPerAccount: true,
      globalCommentsTodayCount: true,
      globalCommentsTodayDate: true,
      accounts: {
        select: {
          id: true,
          platform: true,
          platformUsername: true,
          commentsTodayCount: true,
          commentsTodayDate: true,
        },
      },
    },
  });
  if (!user) return null;

  const globalUsed = dateMatchesToday(user.globalCommentsTodayDate) ? user.globalCommentsTodayCount : 0;

  return {
    globalUsed,
    globalMax: user.maxCommentsDayGlobal,
    accounts: user.accounts.map((a) => ({
      accountId: a.id,
      platform: a.platform,
      platformUsername: a.platformUsername,
      used: dateMatchesToday(a.commentsTodayDate) ? a.commentsTodayCount : 0,
      max: user.maxCommentsDayPerAccount,
    })),
  };
}
