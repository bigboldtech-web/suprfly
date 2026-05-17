import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../config/database';
import { sendError } from '../utils/apiResponse';
import { AuthUser } from '../types';

const userSelect = {
  id: true,
  email: true,
  plan: true,
  isActive: true,
  maxAccounts: true,
  maxWorkflowsPerAccount: true,
  maxKeywordsPerWorkflow: true,
  maxCreatorsPerWorkflow: true,
  maxCommentsDayPerAccount: true,
  maxCommentsDayGlobal: true,
} as const;

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return sendError(res, 401, 'Access token required');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: userSelect,
    });

    if (!user || !user.isActive) {
      return sendError(res, 401, 'User not found or inactive');
    }

    req.user = user as AuthUser;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return sendError(res, 401, 'Access token expired');
    }
    return sendError(res, 401, 'Invalid access token');
  }
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { isAdmin: true },
  });
  if (!user?.isAdmin) {
    return sendError(res, 403, 'Admin access required');
  }
  next();
};

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: userSelect,
    });
    if (user?.isActive) {
      req.user = user as AuthUser;
    }
  } catch {
    // ignore
  }

  next();
};
