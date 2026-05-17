import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import * as workflowService from '../services/workflow.service';

export const listWorkflows = asyncHandler(async (req: Request, res: Response) => {
  const workflows = await workflowService.listWorkflows(req.user!.id);
  sendSuccess(res, 200, 'Workflows fetched', workflows);
});

export const getWorkflow = asyncHandler(async (req: Request, res: Response) => {
  const workflow = await workflowService.getWorkflow(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, 'Workflow fetched', workflow);
});

export const createWorkflow = asyncHandler(async (req: Request, res: Response) => {
  const workflow = await workflowService.createWorkflow(req.user!.id, req.body);
  sendSuccess(res, 201, 'Workflow created', workflow);
});

export const updateWorkflow = asyncHandler(async (req: Request, res: Response) => {
  const workflow = await workflowService.updateWorkflow(req.user!.id, req.params.id as string, req.body);
  sendSuccess(res, 200, 'Workflow updated', workflow);
});

export const deleteWorkflow = asyncHandler(async (req: Request, res: Response) => {
  await workflowService.deleteWorkflow(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, 'Workflow deleted');
});

export const activateWorkflow = asyncHandler(async (req: Request, res: Response) => {
  const workflow = await workflowService.setActive(req.user!.id, req.params.id as string, true);
  sendSuccess(res, 200, 'Workflow activated', workflow);
});

export const deactivateWorkflow = asyncHandler(async (req: Request, res: Response) => {
  const workflow = await workflowService.setActive(req.user!.id, req.params.id as string, false);
  sendSuccess(res, 200, 'Workflow deactivated', workflow);
});
