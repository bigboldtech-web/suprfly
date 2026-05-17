import { Response } from 'express';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  pagination?: Pagination
) {
  const response: any = { success: true, message };
  if (data !== undefined) response.data = data;
  if (pagination) response.pagination = pagination;
  return res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  error?: string
) {
  const response: any = { success: false, message };
  if (error) response.error = error;
  return res.status(statusCode).json(response);
}
