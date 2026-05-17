import { InteractionStyle, WritingStyle } from '@prisma/client';
import { prisma } from '../config/database';

export async function listTones(userId: string) {
  return prisma.tone.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { workflows: true } },
    },
  });
}

export async function getTone(userId: string, id: string) {
  const tone = await prisma.tone.findFirst({
    where: { id, userId },
    include: {
      workflows: {
        select: { id: true, name: true, isActive: true },
      },
    },
  });
  if (!tone) throw Object.assign(new Error('Tone not found'), { statusCode: 404 });
  return tone;
}

export async function createTone(userId: string, data: {
  name: string;
  interactionStyle?: InteractionStyle;
  writingStyle?: WritingStyle;
  customPrompt?: string;
}) {
  // Enforce unique name per user
  const existing = await prisma.tone.findUnique({
    where: { userId_name: { userId, name: data.name } },
  });
  if (existing) {
    throw Object.assign(new Error('A tone with this name already exists'), { statusCode: 409 });
  }

  return prisma.tone.create({
    data: {
      userId,
      name: data.name,
      interactionStyle: data.interactionStyle ?? 'FRIENDLY',
      writingStyle: data.writingStyle ?? 'CONVERSATIONAL',
      customPrompt: data.customPrompt ?? '',
    },
  });
}

export async function updateTone(userId: string, id: string, data: {
  name?: string;
  interactionStyle?: InteractionStyle;
  writingStyle?: WritingStyle;
  customPrompt?: string;
}) {
  const tone = await prisma.tone.findFirst({ where: { id, userId } });
  if (!tone) throw Object.assign(new Error('Tone not found'), { statusCode: 404 });

  if (data.name && data.name !== tone.name) {
    const dup = await prisma.tone.findUnique({
      where: { userId_name: { userId, name: data.name } },
    });
    if (dup) throw Object.assign(new Error('A tone with this name already exists'), { statusCode: 409 });
  }

  return prisma.tone.update({ where: { id }, data });
}

export async function deleteTone(userId: string, id: string) {
  const tone = await prisma.tone.findFirst({
    where: { id, userId },
    include: { workflows: { select: { id: true, name: true } } },
  });
  if (!tone) throw Object.assign(new Error('Tone not found'), { statusCode: 404 });

  if (tone.workflows.length > 0) {
    throw Object.assign(
      new Error(
        `Cannot delete tone — used by ${tone.workflows.length} workflow(s): ${tone.workflows.map(w => w.name).join(', ')}`
      ),
      { statusCode: 409, blockingWorkflows: tone.workflows }
    );
  }

  await prisma.tone.delete({ where: { id } });
}

export function buildToneInstructions(tone: {
  interactionStyle: InteractionStyle;
  writingStyle: WritingStyle;
  customPrompt: string;
}): string {
  if (tone.customPrompt && tone.customPrompt.trim().length > 0) {
    return tone.customPrompt.trim();
  }
  return [
    `Interaction style: ${interactionStyleDescription(tone.interactionStyle)}`,
    `Writing style: ${writingStyleDescription(tone.writingStyle)}`,
  ].join('\n');
}

function interactionStyleDescription(style: InteractionStyle): string {
  switch (style) {
    case 'BOLD_CHALLENGING': return 'Bold & Challenging — push back respectfully, question assumptions';
    case 'FRIENDLY': return 'Friendly — warm and encouraging';
    case 'CURIOUS': return 'Curious — ask thoughtful questions that invite further discussion';
    case 'PROFESSIONAL': return 'Professional — polished and respectful';
    case 'SUPPORTIVE': return 'Supportive — affirm and amplify the original point';
    case 'CONTRARIAN': return 'Contrarian — offer a different angle or perspective';
  }
}

function writingStyleDescription(style: WritingStyle): string {
  switch (style) {
    case 'SHARP_FLOWING': return 'Sharp & Flowing — reads easily, clear rhythm, vivid over elegant, concrete over smooth';
    case 'CONVERSATIONAL': return 'Conversational — casual and natural, like talking to a colleague';
    case 'POLISHED': return 'Polished — refined and formal';
    case 'PUNCHY': return 'Punchy — short, direct sentences';
    case 'STORY_DRIVEN': return 'Story-driven — open or weave in a brief anecdote';
    case 'ANALYTICAL': return 'Analytical — data and reasoning forward';
  }
}
