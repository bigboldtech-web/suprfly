import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import * as keywordService from '../services/keyword.service';

export const listKeywords = asyncHandler(async (req: Request, res: Response) => {
  const workflowId = req.params.workflowId as string;
  const keywords = await keywordService.listKeywords(req.user!.id, workflowId);
  sendSuccess(res, 200, 'Keywords fetched', keywords);
});

export const addKeyword = asyncHandler(async (req: Request, res: Response) => {
  const workflowId = req.params.workflowId as string;
  const { keyword } = req.body;
  const created = await keywordService.addKeyword(req.user!.id, workflowId, keyword);
  sendSuccess(res, 201, 'Keyword added', created);
});

export const deleteKeyword = asyncHandler(async (req: Request, res: Response) => {
  await keywordService.deleteKeyword(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, 'Keyword deleted');
});

export const getPerformance = asyncHandler(async (req: Request, res: Response) => {
  const workflowId = (req.query.workflowId as string | undefined) ?? undefined;
  const performance = await keywordService.getPerformance(req.user!.id, workflowId);
  sendSuccess(res, 200, 'Keyword performance fetched', performance);
});
