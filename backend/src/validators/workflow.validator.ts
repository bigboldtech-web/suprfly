import { z } from 'zod';

const TARGET_TYPES = ['KEYWORD', 'CREATOR'] as const;
const COMMENT_TONES = ['ENERGETIC', 'PROFESSIONAL_TONE', 'CASUAL', 'WITTY', 'EMPATHETIC', 'THOUGHTFUL'] as const;
const COMMENT_LENGTHS = ['SHORT', 'MEDIUM', 'LONG'] as const;

export const createWorkflowSchema = z.object({
  body: z.object({
    accountId: z.string().min(1),
    toneId: z.string().min(1),
    name: z.string().min(1).max(80),
    targetType: z.enum(TARGET_TYPES).default('KEYWORD'),
    timezone: z.string().min(1).default('Asia/Kolkata'),
    autoPost: z.boolean().default(false),
    language: z.string().min(2).max(10).default('en-US'),
    commentTone: z.enum(COMMENT_TONES).default('PROFESSIONAL_TONE'),
    emojiEnabled: z.boolean().default(false),
    commentLength: z.enum(COMMENT_LENGTHS).default('SHORT'),
    dailyLimit: z.number().int().min(1).max(50).default(10),
    isActive: z.boolean().default(true),
  }),
});

export const updateWorkflowSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(80).optional(),
    toneId: z.string().optional(),
    targetType: z.enum(TARGET_TYPES).optional(),
    timezone: z.string().optional(),
    autoPost: z.boolean().optional(),
    language: z.string().min(2).max(10).optional(),
    commentTone: z.enum(COMMENT_TONES).optional(),
    emojiEnabled: z.boolean().optional(),
    commentLength: z.enum(COMMENT_LENGTHS).optional(),
    dailyLimit: z.number().int().min(1).max(50).optional(),
    isActive: z.boolean().optional(),
  }),
});
