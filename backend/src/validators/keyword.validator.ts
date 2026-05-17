import { z } from 'zod';

export const addKeywordSchema = z.object({
  body: z.object({
    keyword: z.string().min(1).max(100),
  }),
});
