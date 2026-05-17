import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { prisma } from '../config/database';
import * as stripeService from '../services/billing/stripe.service';
import * as razorpayService from '../services/billing/razorpay.service';
import * as appsumoService from '../services/billing/appsumo.service';

export const getPlan = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      plan: true, planExpiresAt: true, appSumoTier: true,
      maxAccounts: true, maxWorkflowsPerAccount: true,
      maxKeywordsPerWorkflow: true, maxCreatorsPerWorkflow: true,
      maxCommentsDayPerAccount: true, maxCommentsDayGlobal: true,
    },
  });
  const subscription = await prisma.subscription.findFirst({
    where: { userId: req.user!.id, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });
  sendSuccess(res, 200, 'Plan fetched', { ...user, subscription });
});

export const createCheckout = asyncHandler(async (req: Request, res: Response) => {
  const { plan, interval, provider } = req.body;

  if (provider === 'razorpay') {
    const order = await razorpayService.createOrder(req.user!.id, plan, interval);
    return sendSuccess(res, 200, 'Razorpay order created', order);
  }

  // Default: Stripe
  const url = await stripeService.createCheckoutSession(req.user!.id, plan, interval);
  sendSuccess(res, 200, 'Checkout session created', { url });
});

export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  await stripeService.handleWebhook(req.body, signature);
  res.status(200).json({ received: true });
});

export const razorpayWebhook = asyncHandler(async (req: Request, res: Response) => {
  await razorpayService.handleWebhook(req.body);
  res.status(200).json({ received: true });
});

export const redeemAppSumo = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.body;
  if (!code) return sendError(res, 400, 'AppSumo code is required');
  const result = await appsumoService.redeemCode(req.user!.id, code);
  sendSuccess(res, 200, 'AppSumo code redeemed!', result);
});

export const getInvoices = asyncHandler(async (req: Request, res: Response) => {
  const invoices = await stripeService.getInvoices(req.user!.id);
  sendSuccess(res, 200, 'Invoices fetched', invoices);
});

export const cancelSubscription = asyncHandler(async (req: Request, res: Response) => {
  await stripeService.cancelSubscription(req.user!.id);
  sendSuccess(res, 200, 'Subscription cancelled. Your plan remains active until the current period ends.');
});
