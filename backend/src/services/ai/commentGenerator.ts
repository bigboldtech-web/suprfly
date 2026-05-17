import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { CommentLength, CommentTone, InteractionStyle, WritingStyle } from '@prisma/client';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import { buildToneInstructions } from '../tone.service';

interface CommentGenerationParams {
  postContent: string;
  postLanguage: string;
  authorName: string;
  platform: 'LINKEDIN' | 'TWITTER';
  tone: {
    interactionStyle: InteractionStyle;
    writingStyle: WritingStyle;
    customPrompt: string;
  };
  workflow: {
    language: string;
    commentTone: CommentTone;
    emojiEnabled: boolean;
    commentLength: CommentLength;
  };
}

interface GenerationResult {
  commentText: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  generationTimeMs: number;
}

const LENGTH_GUIDE: Record<CommentLength, string> = {
  SHORT: '1-2 sentences (30-40 words)',
  MEDIUM: '2-3 sentences (50-70 words)',
  LONG: '3-5 sentences (100-140 words)',
};

const COMMENT_TONE_GUIDE: Record<CommentTone, string> = {
  ENERGETIC: 'Punchy, dynamic, straight to the point',
  PROFESSIONAL_TONE: 'Polished and considered',
  CASUAL: 'Friendly, informal, conversational',
  WITTY: 'Light humor, clever observations',
  EMPATHETIC: 'Warm, acknowledging, supportive',
  THOUGHTFUL: 'Reflective, deeper, takes time to think',
};

class CommentGenerator {
  private anthropic: Anthropic | null = null;
  private openai: OpenAI | null = null;

  constructor() {
    if (config.ai.anthropicApiKey) {
      this.anthropic = new Anthropic({ apiKey: config.ai.anthropicApiKey });
    }
    if (config.ai.openaiApiKey) {
      this.openai = new OpenAI({ apiKey: config.ai.openaiApiKey });
    }
  }

  async generate(params: CommentGenerationParams): Promise<GenerationResult> {
    const startTime = Date.now();
    const systemPrompt = this.buildSystemPrompt(params);
    const userPrompt = this.buildUserPrompt(params);

    if (this.anthropic) {
      try {
        const result = await this.callClaude(systemPrompt, userPrompt);
        const comment = this.postProcess(result.text, params);
        return {
          commentText: comment,
          model: config.ai.model,
          promptTokens: result.inputTokens,
          completionTokens: result.outputTokens,
          generationTimeMs: Date.now() - startTime,
        };
      } catch (err) {
        logger.warn('Claude call failed, falling back to OpenAI:', err);
      }
    }

    if (this.openai) {
      try {
        const result = await this.callOpenAI(systemPrompt, userPrompt);
        const comment = this.postProcess(result.text, params);
        return {
          commentText: comment,
          model: config.ai.fallbackModel,
          promptTokens: result.promptTokens,
          completionTokens: result.completionTokens,
          generationTimeMs: Date.now() - startTime,
        };
      } catch (err) {
        logger.error('OpenAI fallback also failed:', err);
      }
    }

    throw new Error('No AI provider available or all calls failed');
  }

  private buildSystemPrompt(params: CommentGenerationParams): string {
    const toneInstructions = buildToneInstructions(params.tone);
    return `You are a social media engagement assistant. Your ONLY job is to write ONE comment/reply to a ${params.platform} post.

VOICE / TONE:
${toneInstructions}

COMMENT TONE: ${COMMENT_TONE_GUIDE[params.workflow.commentTone]}
TARGET LENGTH: ${LENGTH_GUIDE[params.workflow.commentLength]}
LANGUAGE: ${params.workflow.language} (also match the post's detected language: ${params.postLanguage || 'auto-detect from content'})

STYLE RULES (follow EXACTLY):
${params.workflow.emojiEnabled
        ? '- You MAY use 1-2 relevant emojis naturally (not at the start)'
        : '- ABSOLUTELY NO emojis. Not a single one.'}
- Use normal capitalization and grammar.
- Do NOT tag or @ the author.

ABSOLUTE RULES (NEVER break these):
1. Write the comment in the language specified above.
2. NEVER use generic phrases like: "Great post!", "Thanks for sharing!", "Interesting read!", "Couldn't agree more!", "Well said!", "This is so true!", "Love this!"
3. REFERENCE something SPECIFIC from the post content — a data point, an argument, a claim, a metaphor, an example.
4. Add GENUINE VALUE — share a related insight, a contrarian view, a real-world example, or a smart follow-up question.
5. Sound like a REAL human professional who actually READ and THOUGHT about the post.
6. NEVER reveal that you are AI, automated, or a bot.
7. NEVER comment on political, discriminatory, tragic, religious, or sexually explicit content.
8. Do NOT repeat the post's content back — add something NEW.
9. Keep the comment self-contained.
10. ${params.platform === 'TWITTER'
        ? 'X has a 280 character limit for non-premium users. Aim for under 250 characters.'
        : 'LinkedIn comments can be longer — match the target length above.'}

OUTPUT FORMAT:
- Output ONLY the comment text
- No quotes, no prefixes like "Comment:", no explanations
- Just the raw comment text, ready to post`;
  }

  private buildUserPrompt(params: CommentGenerationParams): string {
    const truncated =
      params.postContent.length > 2000
        ? params.postContent.slice(0, 2000) + '...'
        : params.postContent;
    return `Write a ${params.platform} comment for this post by ${params.authorName}:\n\n---\n${truncated}\n---`;
  }

  private postProcess(comment: string, params: CommentGenerationParams): string {
    comment = comment.replace(/^["']|["']$/g, '').trim();
    comment = comment.replace(/^(Comment|Reply|Response|Here's my comment):\s*/i, '');

    if (!params.workflow.emojiEnabled) {
      comment = comment
        .replace(
          /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/gu,
          ''
        )
        .trim();
    }

    if (params.platform === 'TWITTER' && comment.length > 275) {
      const sentences = comment.match(/[^.!?]+[.!?]+/g) || [comment];
      let truncated = '';
      for (const sentence of sentences) {
        if ((truncated + sentence).length <= 270) {
          truncated += sentence;
        } else break;
      }
      comment = truncated.trim() || comment.slice(0, 270) + '...';
    }

    return comment;
  }

  private async callClaude(systemPrompt: string, userPrompt: string) {
    const response = await this.anthropic!.messages.create({
      model: config.ai.model,
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.8,
    });

    return {
      text: response.content[0].type === 'text' ? response.content[0].text : '',
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };
  }

  private async callOpenAI(systemPrompt: string, userPrompt: string) {
    const response = await this.openai!.chat.completions.create({
      model: config.ai.fallbackModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    return {
      text: response.choices[0]?.message?.content || '',
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
    };
  }
}

export const commentGenerator = new CommentGenerator();
