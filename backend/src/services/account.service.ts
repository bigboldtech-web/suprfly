import { AccountKind, Platform } from '@prisma/client';
import { prisma } from '../config/database';
import { encrypt, decrypt } from './encryption.service';
import { logger } from '../utils/logger';

const accountSummarySelect = {
  id: true,
  platform: true,
  accountKind: true,
  platformUserId: true,
  platformUsername: true,
  profileUrl: true,
  avatarUrl: true,
  organizationId: true,
  isActive: true,
  sessionValid: true,
  lastSessionCheck: true,
  sessionInvalidReason: true,
  commentsTodayCount: true,
  commentsTodayDate: true,
  createdAt: true,
  updatedAt: true,
  organization: {
    select: { id: true, name: true, logoUrl: true, vanityName: true },
  },
  workflows: {
    select: { id: true, name: true, isActive: true, dailyLimit: true },
    orderBy: { createdAt: 'asc' as const },
  },
} as const;

export async function listAccounts(userId: string) {
  return prisma.connectedAccount.findMany({
    where: { userId },
    select: accountSummarySelect,
    orderBy: { createdAt: 'desc' },
  });
}

export async function syncSession(
  userId: string,
  platform: Platform,
  cookies: Record<string, any>,
  options: { accountKind?: AccountKind; organizationUrn?: string; organizationName?: string; organizationLogoUrl?: string; organizationVanity?: string } = {}
) {
  const sessionData = encrypt(cookies);

  // Extract platform user ID from cookies
  let platformUserId = '';
  let platformUsername = '';
  let profileUrl: string | undefined;

  if (platform === 'LINKEDIN') {
    const liAt = cookies['li_at']?.value || '';
    if (liAt) {
      try {
        const parts = liAt.split('.');
        if (parts.length >= 2) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          platformUserId = payload.sub || payload.member_id || '';
        }
      } catch {
        // li_at may not be a standard JWT on all accounts
      }
    }
    if (!platformUserId) {
      const crypto = await import('crypto');
      platformUserId = crypto.createHash('sha256').update(liAt || `li_${userId}`).digest('hex').substring(0, 16);
    }
    platformUsername = 'linkedin-user';
    profileUrl = 'https://www.linkedin.com/in/me';
  } else {
    const twid = cookies['twid']?.value || '';
    const decoded = decodeURIComponent(twid);
    platformUserId = decoded.replace('u=', '') || '';
    if (!platformUserId) {
      const crypto = await import('crypto');
      const authToken = cookies['auth_token']?.value || `tw_${userId}`;
      platformUserId = crypto.createHash('sha256').update(authToken).digest('hex').substring(0, 16);
    }
    platformUsername = 'x-user';
    profileUrl = 'https://x.com';
  }

  // For COMPANY accounts on LinkedIn, upsert the organization
  let organizationId: string | undefined;
  if (options.accountKind === 'COMPANY' && options.organizationUrn) {
    const org = await prisma.linkedInOrganization.upsert({
      where: { orgUrn: options.organizationUrn },
      update: {
        name: options.organizationName ?? 'Company Page',
        logoUrl: options.organizationLogoUrl,
        vanityName: options.organizationVanity,
      },
      create: {
        orgUrn: options.organizationUrn,
        name: options.organizationName ?? 'Company Page',
        logoUrl: options.organizationLogoUrl,
        vanityName: options.organizationVanity,
      },
    });
    organizationId = org.id;
    platformUsername = options.organizationName ?? platformUsername;
  }

  const accountKind: AccountKind = options.accountKind ?? 'PERSONAL';

  const account = await prisma.connectedAccount.upsert({
    where: {
      userId_platform_platformUserId_accountKind: {
        userId,
        platform,
        platformUserId: accountKind === 'COMPANY' && options.organizationUrn ? options.organizationUrn : platformUserId,
        accountKind,
      },
    },
    update: {
      sessionData,
      sessionValid: true,
      lastSessionCheck: new Date(),
      sessionInvalidReason: null,
      ...(organizationId && { organizationId }),
      ...(accountKind === 'COMPANY' && options.organizationName && { platformUsername: options.organizationName }),
    },
    create: {
      userId,
      platform,
      accountKind,
      platformUserId: accountKind === 'COMPANY' && options.organizationUrn ? options.organizationUrn : platformUserId,
      platformUsername,
      profileUrl,
      sessionData,
      sessionValid: true,
      lastSessionCheck: new Date(),
      organizationId,
    },
    select: accountSummarySelect,
  });

  return account;
}

export async function listOrganizations(userId: string, accountId: string) {
  // Lists the LinkedIn organizations a personal account has admin access to.
  // The actual API call lives in linkedin/voyagerApi; this stub returns the cached
  // list when the personal account session is valid.
  const account = await prisma.connectedAccount.findFirst({
    where: { id: accountId, userId, platform: 'LINKEDIN', accountKind: 'PERSONAL' },
    select: { sessionData: true, sessionValid: true },
  });
  if (!account || !account.sessionValid) return [];

  try {
    const { fetchManagedOrganizations } = await import('./linkedin/voyagerApi');
    return await fetchManagedOrganizations(account.sessionData);
  } catch (err) {
    logger.error('Failed to fetch managed organizations', err);
    return [];
  }
}

export async function toggleAccount(userId: string, accountId: string) {
  const account = await prisma.connectedAccount.findFirst({
    where: { id: accountId, userId },
  });
  if (!account) throw Object.assign(new Error('Account not found'), { statusCode: 404 });

  return prisma.connectedAccount.update({
    where: { id: accountId },
    data: { isActive: !account.isActive },
    select: { id: true, isActive: true },
  });
}

export async function disconnectAccount(userId: string, accountId: string) {
  const account = await prisma.connectedAccount.findFirst({
    where: { id: accountId, userId },
  });
  if (!account) throw Object.assign(new Error('Account not found'), { statusCode: 404 });
  await prisma.connectedAccount.delete({ where: { id: accountId } });
}

export async function getAccountStatus(userId: string, accountId: string) {
  const account = await prisma.connectedAccount.findFirst({
    where: { id: accountId, userId },
    select: {
      id: true, platform: true, accountKind: true, platformUsername: true,
      isActive: true, sessionValid: true, lastSessionCheck: true,
      sessionInvalidReason: true, commentsTodayCount: true, commentsTodayDate: true,
    },
  });
  if (!account) throw Object.assign(new Error('Account not found'), { statusCode: 404 });
  return account;
}

export async function refreshSession(userId: string, accountId: string) {
  const account = await prisma.connectedAccount.findFirst({
    where: { id: accountId, userId },
    select: { id: true, sessionData: true, platform: true },
  });
  if (!account) throw Object.assign(new Error('Account not found'), { statusCode: 404 });

  try {
    decrypt(account.sessionData);
    return prisma.connectedAccount.update({
      where: { id: accountId },
      data: { lastSessionCheck: new Date(), sessionValid: true, sessionInvalidReason: null },
      select: { id: true, sessionValid: true, lastSessionCheck: true },
    });
  } catch {
    return prisma.connectedAccount.update({
      where: { id: accountId },
      data: { sessionValid: false, lastSessionCheck: new Date(), sessionInvalidReason: 'DECRYPTION_FAILED' },
      select: { id: true, sessionValid: true, lastSessionCheck: true, sessionInvalidReason: true },
    });
  }
}

export async function checkSessionHealth(accountId: string) {
  const account = await prisma.connectedAccount.findUnique({
    where: { id: accountId },
    select: { id: true, platform: true, sessionData: true },
  });
  if (!account) return;

  try {
    decrypt(account.sessionData);
    await prisma.connectedAccount.update({
      where: { id: accountId },
      data: { lastSessionCheck: new Date(), sessionValid: true },
    });
    return true;
  } catch (err) {
    logger.error(`Session health check failed for ${accountId}:`, err);
    await prisma.connectedAccount.update({
      where: { id: accountId },
      data: { sessionValid: false, lastSessionCheck: new Date(), sessionInvalidReason: 'DECRYPTION_FAILED' },
    });
    return false;
  }
}

export async function resetDailyCommentCount() {
  const today = new Date();
  await Promise.all([
    prisma.connectedAccount.updateMany({
      data: { commentsTodayCount: 0, commentsTodayDate: today },
    }),
    prisma.workflow.updateMany({
      data: { commentsTodayCount: 0, commentsTodayDate: today },
    }),
    prisma.user.updateMany({
      data: { globalCommentsTodayCount: 0, globalCommentsTodayDate: today },
    }),
  ]);
  logger.info('Daily comment counts reset (account + workflow + global)');
}
