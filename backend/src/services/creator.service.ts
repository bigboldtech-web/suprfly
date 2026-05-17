import { Platform } from '@prisma/client';
import { prisma } from '../config/database';

async function ensureWorkflow(userId: string, workflowId: string) {
  const wf = await prisma.workflow.findFirst({ where: { id: workflowId, userId } });
  if (!wf) throw Object.assign(new Error('Workflow not found'), { statusCode: 404 });
  return wf;
}

export async function listCreators(userId: string, workflowId: string) {
  await ensureWorkflow(userId, workflowId);
  return prisma.creator.findMany({
    where: { workflowId, userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function addCreator(
  userId: string,
  workflowId: string,
  creatorData: {
    platform: Platform;
    creatorProfileId: string;
    creatorName: string;
    creatorUsername?: string;
    creatorAvatarUrl?: string;
    creatorProfileUrl?: string;
    followerCount?: number;
  }
) {
  await ensureWorkflow(userId, workflowId);
  return prisma.creator.create({
    data: { userId, workflowId, ...creatorData },
  });
}

export async function deleteCreator(userId: string, creatorId: string) {
  const creator = await prisma.creator.findFirst({ where: { id: creatorId, userId } });
  if (!creator) throw Object.assign(new Error('Creator not found'), { statusCode: 404 });
  await prisma.creator.delete({ where: { id: creatorId } });
}

export async function getPerformance(userId: string, workflowId?: string) {
  return prisma.creator.findMany({
    where: { userId, ...(workflowId && { workflowId }) },
    select: {
      id: true, creatorName: true, creatorUsername: true,
      creatorAvatarUrl: true, followerCount: true,
      commentsCount: true, lastCommentAt: true, isActive: true, platform: true,
      workflowId: true,
    },
    orderBy: { commentsCount: 'desc' },
  });
}

export async function searchProfiles(platform: Platform, query: string, accountId?: string) {
  if (!accountId) return [];

  const account = await prisma.connectedAccount.findFirst({
    where: { id: accountId, sessionValid: true },
    select: { sessionData: true },
  });
  if (!account) return [];

  if (platform === 'LINKEDIN') {
    const { searchLinkedInProfiles } = await import('./linkedin/profileSearch');
    return searchLinkedInProfiles(account.sessionData, query);
  } else {
    const { searchTwitterProfiles } = await import('./twitter/profileSearch');
    return searchTwitterProfiles(account.sessionData, query);
  }
}
