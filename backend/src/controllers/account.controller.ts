import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import * as accountService from '../services/account.service';

export const listAccounts = asyncHandler(async (req: Request, res: Response) => {
  const accounts = await accountService.listAccounts(req.user!.id);
  sendSuccess(res, 200, 'Accounts fetched', accounts);
});

export const syncSession = asyncHandler(async (req: Request, res: Response) => {
  const { platform, cookies, accountKind, organizationUrn, organizationName, organizationLogoUrl, organizationVanity } = req.body;
  const account = await accountService.syncSession(req.user!.id, platform, cookies, {
    accountKind,
    organizationUrn,
    organizationName,
    organizationLogoUrl,
    organizationVanity,
  });
  sendSuccess(res, 200, 'Session synced', account);
});

export const toggleAccount = asyncHandler(async (req: Request, res: Response) => {
  const account = await accountService.toggleAccount(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, 'Account toggled', account);
});

export const disconnectAccount = asyncHandler(async (req: Request, res: Response) => {
  await accountService.disconnectAccount(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, 'Account disconnected');
});

export const getAccountStatus = asyncHandler(async (req: Request, res: Response) => {
  const status = await accountService.getAccountStatus(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, 'Account status fetched', status);
});

export const refreshSession = asyncHandler(async (req: Request, res: Response) => {
  const status = await accountService.refreshSession(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, 'Session refreshed', status);
});

export const listOrganizations = asyncHandler(async (req: Request, res: Response) => {
  const orgs = await accountService.listOrganizations(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, 'Organizations fetched', orgs);
});
