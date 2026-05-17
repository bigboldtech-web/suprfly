import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import * as analyticsService from '../services/analytics.service';

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const data = await analyticsService.getSummary(req.user!.id);
  sendSuccess(res, 200, 'Summary fetched', data);
});

export const getTimeseries = asyncHandler(async (req: Request, res: Response) => {
  const range = (req.query.range as '24h' | '7d' | '30d') || '24h';
  const data = await analyticsService.getTimeseries(req.user!.id, range);
  sendSuccess(res, 200, 'Timeseries fetched', data);
});

export const getQuota = asyncHandler(async (req: Request, res: Response) => {
  const data = await analyticsService.getQuota(req.user!.id);
  sendSuccess(res, 200, 'Quota snapshot fetched', data);
});

export const getOverview = asyncHandler(async (req: Request, res: Response) => {
  const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
  const data = await analyticsService.getOverview(req.user!.id, req.query.accountId as string, days);
  sendSuccess(res, 200, 'Analytics overview fetched', data);
});

export const getPerformance = asyncHandler(async (req: Request, res: Response) => {
  const data = await analyticsService.getPerformance(req.user!.id, req.query.workflowId as string);
  sendSuccess(res, 200, 'Performance data fetched', data);
});

export const getDailyBreakdown = asyncHandler(async (req: Request, res: Response) => {
  const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
  const data = await analyticsService.getDailyBreakdown(req.user!.id, req.query.accountId as string, days);
  sendSuccess(res, 200, 'Daily breakdown fetched', data);
});
