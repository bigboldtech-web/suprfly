import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { sendError } from '../utils/apiResponse';

export const checkAccountLimit = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user!;
  const count = await prisma.connectedAccount.count({ where: { userId: user.id } });
  if (count >= user.maxAccounts) {
    return sendError(res, 403, `Account limit reached (${user.maxAccounts}). Upgrade your plan to add more.`);
  }
  next();
};

export const checkWorkflowLimit = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user!;
  const accountId = req.body.accountId;
  if (!accountId) return next();
  const count = await prisma.workflow.count({ where: { accountId, userId: user.id } });
  if (count >= user.maxWorkflowsPerAccount) {
    return sendError(res, 403, `Workflow limit reached (${user.maxWorkflowsPerAccount} per account). Upgrade your plan to add more.`);
  }
  next();
};

export const checkKeywordLimit = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user!;
  const workflowId = req.params.workflowId || req.body.workflowId;
  if (!workflowId) return next();

  const count = await prisma.keyword.count({ where: { workflowId, userId: user.id } });
  if (count >= user.maxKeywordsPerWorkflow) {
    return sendError(res, 403, `Keyword limit reached (${user.maxKeywordsPerWorkflow}). Upgrade your plan to add more.`);
  }
  next();
};

export const checkCreatorLimit = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user!;
  const workflowId = req.params.workflowId || req.body.workflowId;
  if (!workflowId) return next();

  const count = await prisma.creator.count({ where: { workflowId, userId: user.id } });
  if (count >= user.maxCreatorsPerWorkflow) {
    return sendError(res, 403, `Creator limit reached (${user.maxCreatorsPerWorkflow}). Upgrade your plan to add more.`);
  }
  next();
};
