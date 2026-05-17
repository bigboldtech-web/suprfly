import { z } from 'zod';

const INTERACTION_STYLES = [
  'BOLD_CHALLENGING',
  'FRIENDLY',
  'CURIOUS',
  'PROFESSIONAL',
  'SUPPORTIVE',
  'CONTRARIAN',
] as const;

const WRITING_STYLES = [
  'SHARP_FLOWING',
  'CONVERSATIONAL',
  'POLISHED',
  'PUNCHY',
  'STORY_DRIVEN',
  'ANALYTICAL',
] as const;

export const createToneSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(60),
    interactionStyle: z.enum(INTERACTION_STYLES).default('FRIENDLY'),
    writingStyle: z.enum(WRITING_STYLES).default('CONVERSATIONAL'),
    customPrompt: z.string().max(4000).optional().default(''),
  }),
});

export const updateToneSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(60).optional(),
    interactionStyle: z.enum(INTERACTION_STYLES).optional(),
    writingStyle: z.enum(WRITING_STYLES).optional(),
    customPrompt: z.string().max(4000).optional(),
  }),
});
