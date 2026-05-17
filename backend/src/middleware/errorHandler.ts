import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { config } from '../config';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.message, { stack: err.stack });

  // Zod validation errors
  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: messages,
    });
  }

  // JWT errors
  if (err instanceof jwt.JsonWebTokenError) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err instanceof jwt.TokenExpiredError) {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      return res.status(409).json({
        success: false,
        message: `Duplicate value for: ${target}`,
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
  }

  // Default
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(config.isDev && { stack: err.stack }),
  });
};
