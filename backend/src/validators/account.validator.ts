import { z } from 'zod';

export const syncSessionSchema = z.object({
  body: z.object({
    platform: z.enum(['LINKEDIN', 'TWITTER']),
    cookies: z.record(z.any()),
    accountKind: z.enum(['PERSONAL', 'COMPANY']).optional(),
    organizationUrn: z.string().optional(),
    organizationName: z.string().optional(),
    organizationLogoUrl: z.string().url().optional(),
    organizationVanity: z.string().optional(),
  }),
});
