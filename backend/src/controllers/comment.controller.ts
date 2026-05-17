import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import * as commentService from '../services/comment.service';

export const listComments = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    tab: req.query.tab as any,
    workflowId: req.query.workflowId as string,
    accountId: req.query.accountId as string,
    platform: req.query.platform as any,
    status: req.query.status as any,
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string,
    page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
  };
  const result = await commentService.listComments(req.user!.id, filters);
  sendSuccess(res, 200, 'Comments fetched', { items: result.comments, counts: result.counts }, result.pagination);
});

export const getComment = asyncHandler(async (req: Request, res: Response) => {
  const comment = await commentService.getComment(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, 'Comment fetched', comment);
});

export const approveComment = asyncHandler(async (req: Request, res: Response) => {
  const comment = await commentService.approveComment(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, 'Comment approved', comment);
});

export const editComment = asyncHandler(async (req: Request, res: Response) => {
  const comment = await commentService.editComment(req.user!.id, req.params.id as string, req.body.commentText);
  sendSuccess(res, 200, 'Comment updated', comment);
});

export const rejectComment = asyncHandler(async (req: Request, res: Response) => {
  const comment = await commentService.rejectComment(req.user!.id, req.params.id as string, req.body?.reason);
  sendSuccess(res, 200, 'Comment rejected', comment);
});

export const exportCsv = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    tab: req.query.tab as any,
    workflowId: req.query.workflowId as string,
    accountId: req.query.accountId as string,
    platform: req.query.platform as any,
    status: req.query.status as any,
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string,
  };
  const csv = await commentService.exportCsv(req.user!.id, filters);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=suprfly-comments.csv');
  res.send(csv);
});

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await commentService.getStats(
    req.user!.id,
    req.query.accountId as string,
    req.query.startDate as string,
    req.query.endDate as string
  );
  sendSuccess(res, 200, 'Comment stats fetched', stats);
});
