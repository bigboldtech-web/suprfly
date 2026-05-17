import { z } from 'zod';

export const listCommentsSchema = z.object({
  query: z.object({
    tab: z.enum(['POSTED', 'PENDING']).optional(),
    workflowId: z.string().optional(),
    accountId: z.string().optional(),
    platform: z.enum(['LINKEDIN', 'TWITTER']).optional(),
    status: z.enum(['PENDING_REVIEW', 'APPROVED', 'QUEUED', 'POSTING', 'POSTED', 'FAILED', 'REJECTED', 'FILTERED']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const editCommentSchema = z.object({
  body: z.object({
    commentText: z.string().min(1).max(2000),
  }),
});

export const rejectCommentSchema = z.object({
  body: z.object({
    reason: z.string().max(500).optional(),
  }),
});
