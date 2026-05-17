import { z } from 'zod';

export const addCreatorSchema = z.object({
  body: z.object({
    platform: z.enum(['LINKEDIN', 'TWITTER']),
    creatorProfileId: z.string().min(1),
    creatorName: z.string().min(1).max(200),
    creatorUsername: z.string().optional(),
    creatorAvatarUrl: z.string().url().optional(),
    creatorProfileUrl: z.string().url().optional(),
    followerCount: z.number().int().optional(),
  }),
});

export const searchProfilesSchema = z.object({
  body: z.object({
    platform: z.enum(['LINKEDIN', 'TWITTER']),
    query: z.string().min(1).max(200),
    accountId: z.string().optional(),
  }),
});
