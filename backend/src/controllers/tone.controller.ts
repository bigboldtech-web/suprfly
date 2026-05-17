import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import * as toneService from '../services/tone.service';

export const listTones = asyncHandler(async (req: Request, res: Response) => {
  const tones = await toneService.listTones(req.user!.id);
  sendSuccess(res, 200, 'Tones fetched', tones);
});

export const getTone = asyncHandler(async (req: Request, res: Response) => {
  const tone = await toneService.getTone(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, 'Tone fetched', tone);
});

export const createTone = asyncHandler(async (req: Request, res: Response) => {
  const tone = await toneService.createTone(req.user!.id, req.body);
  sendSuccess(res, 201, 'Tone created', tone);
});

export const updateTone = asyncHandler(async (req: Request, res: Response) => {
  const tone = await toneService.updateTone(req.user!.id, req.params.id as string, req.body);
  sendSuccess(res, 200, 'Tone updated', tone);
});

export const deleteTone = asyncHandler(async (req: Request, res: Response) => {
  await toneService.deleteTone(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, 'Tone deleted');
});
