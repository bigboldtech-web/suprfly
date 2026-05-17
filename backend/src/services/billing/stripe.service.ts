import Stripe from 'stripe';
import { config } from '../../config';
import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';
import { PLAN_LIMITS } from '../../utils/constants';
import * as emailService from '../email.service';

const stripe = new Stripe(config.stripe.secretKey, { apiVersion: '2024-12-18.acacia' as any });

const STRIPE_PLANS: Record<string, { monthly: string; yearly: string }> = {
  STARTER: { monthly: config.stripe.starterMonthlyPriceId, yearly: config.stripe.starterYearlyPriceId },
  GROWTH: { monthly: config.stripe.growthMonthlyPriceId, yearly: config.stripe.growthYearlyPriceId },
  AGENCY: { monthly: config.stripe.agencyMonthlyPriceId, yearly: config.stripe.agencyYearlyPriceId },
};

export async function createCheckoutSession(
  userId: string,
  plan: string,
  interval: 'monthly' | 'yearly'
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  // Get or create Stripe customer
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: { userId },
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: customerId } });
  }

  const priceId = STRIPE_PLANS[plan]?.[interval];
  if (!priceId) throw new Error(`Invalid plan/interval: ${plan}/${interval}`);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${config.frontendUrl}/billing?success=true`,
    cancel_url: `${config.frontendUrl}/billing?cancelled=true`,
    metadata: { userId, plan },
  });

  return session.url;
}

export async function handleWebhook(payload: Buffer, signature: string) {
  const event = stripe.webhooks.constructEvent(payload, signature, config.stripe.webhookSecret);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;
      if (userId && plan) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        await activatePlan(userId, plan as any, subscription);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as any;
      await prisma.subscription.updateMany({
        where: { providerSubscriptionId: subscription.id },
        data: {
          status: subscription.status === 'active' ? 'ACTIVE' : subscription.status === 'past_due' ? 'PAST_DUE' : 'CANCELLED',
          currentPeriodEnd: new Date((subscription.current_period_end || 0) * 1000),
        },
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const sub = await prisma.subscription.findFirst({
        where: { providerSubscriptionId: subscription.id },
      });
      if (sub) {
        await downgradeToFree(sub.userId);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customer = await stripe.customers.retrieve(invoice.customer as string);
      if (customer && !customer.deleted) {
        const user = await prisma.user.findFirst({ where: { stripeCustomerId: customer.id } });
        if (user) {
          emailService.sendPaymentFailed(user.email, user.name || 'there');
          await prisma.notification.create({
            data: {
              userId: user.id,
              type: 'SYSTEM',
              title: 'Payment failed',
              message: 'Your payment was declined. Please update your payment method to keep your plan active.',
            },
          });
        }
      }
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      const customer = await stripe.customers.retrieve(invoice.customer as string);
      if (customer && !customer.deleted) {
        const user = await prisma.user.findFirst({ where: { stripeCustomerId: customer.id } });
        if (user) {
          emailService.sendPaymentReceived(user.email, (invoice.amount_paid / 100).toFixed(2), user.plan);
        }
      }
      break;
    }
  }
}

export async function cancelSubscription(userId: string) {
  const sub = await prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE', provider: 'STRIPE' },
  });
  if (!sub?.providerSubscriptionId) throw new Error('No active subscription');

  await stripe.subscriptions.update(sub.providerSubscriptionId, {
    cancel_at_period_end: true,
  });

  await prisma.subscription.update({
    where: { id: sub.id },
    data: { status: 'CANCELLED' },
  });
}

export async function getInvoices(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.stripeCustomerId) return [];

  const invoices = await stripe.invoices.list({
    customer: user.stripeCustomerId,
    limit: 20,
  });

  return invoices.data.map((inv) => ({
    id: inv.id,
    amount: (inv.amount_paid / 100).toFixed(2),
    currency: inv.currency,
    status: inv.status,
    date: new Date(inv.created * 1000),
    pdfUrl: inv.invoice_pdf,
  }));
}

async function activatePlan(userId: string, plan: string, subscription: any) {
  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS];
  if (!limits) return;

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
      provider: 'STRIPE',
      providerSubscriptionId: subscription.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    emailService.sendPlanActivated(user.email, plan);
    await prisma.notification.create({
      data: {
        userId,
        type: 'SYSTEM',
        title: `${plan} Plan Activated!`,
        message: `Your ${plan} plan is now active. You can now use up to ${limits.commentsDayPerAccount} comments per day.`,
      },
    });
  }
}

async function downgradeToFree(userId: string) {
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

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) emailService.sendPlanExpired(user.email, user.name || 'there');
}
