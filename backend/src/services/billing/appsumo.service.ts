import { prisma } from '../../config/database';
import * as emailService from '../email.service';
import { logger } from '../../utils/logger';

const APPSUMO_TIERS: Record<number, {
  plan: string; accounts: number; workflowsPerAccount: number;
  keywordsPerWorkflow: number; creatorsPerWorkflow: number;
  commentsDayPerAccount: number; commentsDayGlobal: number;
}> = {
  1: { plan: 'STARTER', accounts: 1, workflowsPerAccount: 2, keywordsPerWorkflow: 5,  creatorsPerWorkflow: 20, commentsDayPerAccount: 50, commentsDayGlobal: 75  },
  2: { plan: 'GROWTH',  accounts: 2, workflowsPerAccount: 3, keywordsPerWorkflow: 5,  creatorsPerWorkflow: 20, commentsDayPerAccount: 50, commentsDayGlobal: 150 },
  3: { plan: 'GROWTH',  accounts: 3, workflowsPerAccount: 3, keywordsPerWorkflow: 5,  creatorsPerWorkflow: 20, commentsDayPerAccount: 50, commentsDayGlobal: 200 },
  4: { plan: 'AGENCY',  accounts: 5, workflowsPerAccount: 4, keywordsPerWorkflow: 5,  creatorsPerWorkflow: 20, commentsDayPerAccount: 50, commentsDayGlobal: 250 },
};

export async function redeemCode(userId: string, code: string) {
  // Validate format: SUPRFLY-XXXX-XXXX-XXXX
  if (!/^SUPRFLY-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) {
    throw new Error('Invalid AppSumo code format');
  }

  // Check if already used
  const existing = await prisma.user.findFirst({ where: { appSumoCode: code } });
  if (existing) throw new Error('This code has already been redeemed');

  // Determine tier from code (last digit before final segment)
  const tier = parseInt(code.split('-')[1]?.[0] || '1');
  const tierConfig = APPSUMO_TIERS[tier] || APPSUMO_TIERS[1];

  // Apply to user
  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: 'LIFETIME' as any,
      appSumoCode: code,
      appSumoTier: tier,
      planExpiresAt: null, // Never expires
      maxAccounts: tierConfig.accounts,
      maxWorkflowsPerAccount: tierConfig.workflowsPerAccount,
      maxKeywordsPerWorkflow: tierConfig.keywordsPerWorkflow,
      maxCreatorsPerWorkflow: tierConfig.creatorsPerWorkflow,
      maxCommentsDayPerAccount: tierConfig.commentsDayPerAccount,
      maxCommentsDayGlobal: tierConfig.commentsDayGlobal,
    },
  });

  // Create subscription record
  await prisma.subscription.create({
    data: {
      userId,
      plan: 'LIFETIME' as any,
      status: 'ACTIVE',
      provider: 'APPSUMO',
      providerSubscriptionId: code,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date('2099-12-31'), // Effectively forever
    },
  });

  // Notify
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    emailService.sendPlanActivated(user.email, `AppSumo Tier ${tier}`);
    await prisma.notification.create({
      data: {
        userId,
        type: 'SYSTEM',
        title: `AppSumo Tier ${tier} Activated!`,
        message: `Your lifetime deal is active: ${tierConfig.accounts} accounts, ${tierConfig.commentsDayGlobal} comments/day, ${tierConfig.workflowsPerAccount} workflows/account.`,
      },
    });
  }

  logger.info(`AppSumo code redeemed: ${code} → Tier ${tier} for user ${userId}`);
  return { tier, ...tierConfig };
}
