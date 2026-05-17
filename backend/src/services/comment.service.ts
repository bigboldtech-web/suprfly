import { CommentStatus, Platform } from '@prisma/client';
import { prisma } from '../config/database';
import { stringify } from 'csv-stringify/sync';
import { commentPostQueue } from './queue';

export type CommentTab = 'POSTED' | 'PENDING';

interface CommentFilters {
  tab?: CommentTab;
  workflowId?: string;
  accountId?: string;
  platform?: Platform;
  status?: CommentStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

function buildWhere(userId: string, filters: CommentFilters) {
  const where: any = { userId };
  if (filters.workflowId) where.workflowId = filters.workflowId;
  if (filters.accountId) where.accountId = filters.accountId;
  if (filters.platform) where.platform = filters.platform;

  if (filters.tab === 'POSTED') {
    where.status = 'POSTED';
  } else if (filters.tab === 'PENDING') {
    where.status = 'PENDING_REVIEW';
  } else if (filters.status) {
    where.status = filters.status;
  }

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
    if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
  }
  return where;
}

export async function listComments(userId: string, filters: CommentFilters) {
  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 20, 100);
  const skip = (page - 1) * limit;

  const where = buildWhere(userId, filters);

  const [comments, total, postedCount, pendingCount] = await Promise.all([
    prisma.comment.findMany({
      where,
      include: {
        post: {
          select: {
            authorName: true, authorUsername: true, postContent: true,
            postUrl: true, matchType: true, matchValue: true, platform: true,
          },
        },
        account: { select: { id: true, platformUsername: true, platform: true, avatarUrl: true, accountKind: true } },
        workflow: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.comment.count({ where }),
    prisma.comment.count({ where: { userId, status: 'POSTED' } }),
    prisma.comment.count({ where: { userId, status: 'PENDING_REVIEW' } }),
  ]);

  return {
    comments,
    counts: { posted: postedCount, pending: pendingCount },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getComment(userId: string, commentId: string) {
  const comment = await prisma.comment.findFirst({
    where: { id: commentId, userId },
    include: {
      post: true,
      account: { select: { platformUsername: true, platform: true, accountKind: true } },
      workflow: { select: { id: true, name: true } },
    },
  });
  if (!comment) throw Object.assign(new Error('Comment not found'), { statusCode: 404 });
  return comment;
}

export async function approveComment(userId: string, commentId: string) {
  const comment = await prisma.comment.findFirst({
    where: { id: commentId, userId, status: 'PENDING_REVIEW' },
  });
  if (!comment) throw Object.assign(new Error('Comment not found or not pending review'), { statusCode: 404 });

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { status: 'APPROVED', approvedAt: new Date() },
  });

  // Enqueue for posting
  await commentPostQueue.add(
    `post-${commentId}`,
    { commentId },
    { jobId: `post-${commentId}` },
  );

  return updated;
}

export async function editComment(userId: string, commentId: string, newText: string) {
  const comment = await prisma.comment.findFirst({
    where: { id: commentId, userId, status: 'PENDING_REVIEW' },
  });
  if (!comment) throw Object.assign(new Error('Comment not found or not pending review'), { statusCode: 404 });

  return prisma.comment.update({
    where: { id: commentId },
    data: {
      originalText: comment.originalText || comment.commentText,
      commentText: newText,
      isEdited: true,
    },
  });
}

export async function rejectComment(userId: string, commentId: string, reason?: string) {
  const comment = await prisma.comment.findFirst({
    where: { id: commentId, userId, status: 'PENDING_REVIEW' },
  });
  if (!comment) throw Object.assign(new Error('Comment not found or not pending review'), { statusCode: 404 });

  return prisma.comment.update({
    where: { id: commentId },
    data: { status: 'REJECTED', rejectReason: reason },
  });
}

export async function exportCsv(userId: string, filters: CommentFilters) {
  const where = buildWhere(userId, filters);

  const comments = await prisma.comment.findMany({
    where,
    include: {
      post: true,
      account: { select: { platformUsername: true, accountKind: true } },
      workflow: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 5000,
  });

  const records = comments.map((c) => ({
    date: c.createdAt.toISOString(),
    posted_at: c.postedAt?.toISOString() ?? '',
    workflow: c.workflow.name,
    account: c.account.platformUsername,
    account_kind: c.account.accountKind,
    platform: c.platform,
    target: c.post.matchValue,
    target_type: c.post.matchType,
    comment: c.commentText,
    likes: c.likesCount,
    replies: c.repliesCount,
    views: c.viewsCount,
    status: c.status,
    post_url: c.post.postUrl || '',
  }));

  return stringify(records, { header: true });
}

export async function getStats(userId: string, accountId?: string, startDate?: string, endDate?: string) {
  const where: any = { userId };
  if (accountId) where.accountId = accountId;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [total, byStatus] = await Promise.all([
    prisma.comment.count({ where }),
    prisma.comment.groupBy({ by: ['status'], where, _count: true }),
  ]);

  return {
    total,
    byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item.status]: item._count }), {}),
  };
}
