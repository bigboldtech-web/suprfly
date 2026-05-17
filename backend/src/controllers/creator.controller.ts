import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import * as creatorService from '../services/creator.service';

export const listCreators = asyncHandler(async (req: Request, res: Response) => {
  const workflowId = req.params.workflowId as string;
  const creators = await creatorService.listCreators(req.user!.id, workflowId);
  sendSuccess(res, 200, 'Creators fetched', creators);
});

export const addCreator = asyncHandler(async (req: Request, res: Response) => {
  const workflowId = req.params.workflowId as string;
  const created = await creatorService.addCreator(req.user!.id, workflowId, req.body);
  sendSuccess(res, 201, 'Creator added', created);
});

export const deleteCreator = asyncHandler(async (req: Request, res: Response) => {
  await creatorService.deleteCreator(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, 'Creator deleted');
});

export const getPerformance = asyncHandler(async (req: Request, res: Response) => {
  const workflowId = (req.query.workflowId as string | undefined) ?? undefined;
  const performance = await creatorService.getPerformance(req.user!.id, workflowId);
  sendSuccess(res, 200, 'Creator performance fetched', performance);
});

export const searchProfiles = asyncHandler(async (req: Request, res: Response) => {
  const { platform, query, accountId } = req.body;
  const results = await creatorService.searchProfiles(platform, query, accountId);
  sendSuccess(res, 200, 'Search results', results);
});
