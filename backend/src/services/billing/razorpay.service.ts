import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from '../../config';
import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';
import { PLAN_LIMITS } from '../../utils/constants';
import * as emailService from '../email.service';

const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

const RAZORPAY_PLANS: Record<string, { monthly: number; yearly: number }> = {
  STARTER: { monthly: 149900, yearly: 1499000 },  // paise (INR)
  GROWTH: { monthly: 399900, yearly: 3999000 },
  AGENCY: { monthly: 1199900, yearly: 11999000 },
};

export async function createOrder(userId: string, plan: string, interval: 'monthly' | 'yearly') {
  const amount = RAZORPAY_PLANS[plan]?.[interval];
  if (!amount) throw new Error(`Invalid plan: ${plan}/${interval}`);

  const order = await razorpay.orders.create({
    amount,
    currency: 'INR',
    receipt: `order_${userId}_${Date.now()}`,
    notes: { userId, plan, interval },
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: config.razorpay.keyId,
  };
}

export async function verifyPayment(
  userId: string,
  orderId: string,
  paymentId: string,
  signature: string,
  plan: string
) {
  // Verify signature
  const body = `${orderId}|${paymentId}`;
  const expectedSig = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(body)
    .digest('hex');

  if (expectedSig !== signature) {
    throw new Error('Invalid payment signature');
  }

  // Activate plan
  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS];
  if (!limits) throw new Error('Invalid plan');

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: plan as any,
      maxAccounts: limits.accounts,
      maxWorkflowsPerAccount: limits.workflowsPerAccount,
      maxKeywordsPerWorkflow: limits.keywordsPerWorkflow,
      maxCreatorsPerWorkflow: limits.creatorsPerWorkflow,
      maxCommentsDayPerAccount: limits.commentsDayPerAccount,
      maxCommentsDayGlobal: limits.commentsDayGlobal,
    },
  });

  await prisma.subscription.create({
    data: {
      userId,
      plan: plan as any,
      status: 'ACTIVE',
      provider: 'RAZORPAY',
      providerSubscriptionId: paymentId,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    emailService.sendPlanActivated(user.email, plan);
  }

  return { success: true };
}

export async function handleWebhook(payload: any) {
  const event = payload.event;

  if (event === 'subscription.cancelled' || event === 'payment.failed') {
    const notes = payload.payload?.subscription?.entity?.notes || payload.payload?.payment?.entity?.notes;
    const userId = notes?.userId;
    if (userId) {
      const limits = PLAN_LIMITS.FREE;
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: 'FREE',
          maxAccounts: limits.accounts,
          maxWorkflowsPerAccount: limits.workflowsPerAccount,
          maxKeywordsPerWorkflow: limits.keywordsPerWorkflow,
          maxCreatorsPerWorkflow: limits.creatorsPerWorkflow,
          maxCommentsDayPerAccount: limits.commentsDayPerAccount,
          maxCommentsDayGlobal: limits.commentsDayGlobal,
        },
      });
    }
  }
}
