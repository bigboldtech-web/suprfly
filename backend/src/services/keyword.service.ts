import { prisma } from '../config/database';

async function ensureWorkflow(userId: string, workflowId: string) {
  const wf = await prisma.workflow.findFirst({ where: { id: workflowId, userId } });
  if (!wf) throw Object.assign(new Error('Workflow not found'), { statusCode: 404 });
  return wf;
}

export async function listKeywords(userId: string, workflowId: string) {
  await ensureWorkflow(userId, workflowId);
  return prisma.keyword.findMany({
    where: { workflowId, userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function addKeyword(userId: string, workflowId: string, keyword: string) {
  await ensureWorkflow(userId, workflowId);
  return prisma.keyword.create({
    data: { userId, workflowId, keyword: keyword.trim() },
  });
}

export async function deleteKeyword(userId: string, keywordId: string) {
  const keyword = await prisma.keyword.findFirst({ where: { id: keywordId, userId } });
  if (!keyword) throw Object.assign(new Error('Keyword not found'), { statusCode: 404 });
  await prisma.keyword.delete({ where: { id: keywordId } });
}

export async function getPerformance(userId: string, workflowId?: string) {
  return prisma.keyword.findMany({
    where: { userId, ...(workflowId && { workflowId }) },
    select: { id: true, keyword: true, commentsCount: true, lastCommentAt: true, isActive: true, workflowId: true },
    orderBy: { commentsCount: 'desc' },
  });
}
