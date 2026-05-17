import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import * as authService from '../services/auth.service';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const result = await authService.register(email, password, name);
  sendSuccess(res, 201, 'Account created successfully', result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  sendSuccess(res, 200, 'Login successful', result);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshToken(refreshToken);
  sendSuccess(res, 200, 'Tokens refreshed', tokens);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  await authService.logout(refreshToken);
  sendSuccess(res, 200, 'Logged out');
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email);
  sendSuccess(res, 200, 'If that email exists, a reset link has been sent');
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);
  sendSuccess(res, 200, 'Password reset successfully');
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  await authService.verifyEmail(req.params.token as string);
  sendSuccess(res, 200, 'Email verified');
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.id);
  sendSuccess(res, 200, 'Profile fetched', user);
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.updateProfile(req.user!.id, req.body);
  sendSuccess(res, 200, 'Profile updated', user);
});
