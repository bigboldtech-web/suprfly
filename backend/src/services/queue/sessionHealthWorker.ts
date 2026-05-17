import { Job } from 'bullmq';
import { prisma } from '../../config/database';
import { LinkedInVoyagerClient } from '../linkedin/voyagerApi';
import { TwitterApiClient } from '../twitter/twitterApi';
import * as emailService from '../email.service';
import { logger } from '../../utils/logger';

interface SessionHealthJobData {
  accountId: string;
  platform: 'LINKEDIN' | 'TWITTER';
  userId: string;
}

export async function processSessionHealth(job: Job<SessionHealthJobData>) {
  const { accountId, platform, userId } = job.data;

  const account = await prisma.connectedAccount.findUnique({
    where: { id: accountId },
    select: { id: true, sessionData: true, platformUsername: true },
  });

  if (!account) return;

  try {
    if (platform === 'LINKEDIN') {
      const client = new LinkedInVoyagerClient(account.sessionData);
      await client.getProfile(); // Will throw if session invalid
    } else {
      const client = new TwitterApiClient(account.sessionData);
      await client.getAccountInfo();
    }

    // Session valid
    await prisma.connectedAccount.update({
      where: { id: accountId },
      data: { lastSessionCheck: new Date(), sessionValid: true, sessionInvalidReason: null },
    });
  } catch (err: any) {
    const isAuthError = err.message?.includes('401') || err.message?.includes('403');

    if (isAuthError) {
      await prisma.connectedAccount.update({
        where: { id: accountId },
        data: {
          sessionValid: false,
          lastSessionCheck: new Date(),
          sessionInvalidReason: 'SESSION_EXPIRED',
        },
      });

      // Notify user
      await prisma.notification.create({
        data: {
          userId,
          type: 'SESSION_EXPIRED',
          title: `${platform} session expired`,
          message: `Your ${platform} account "${account.platformUsername}" session has expired. Reconnect via the Chrome Extension.`,
        },
      });

      // Send email alert
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
      if (user) {
        emailService.sendSessionExpiredAlert(user.email, platform, account.platformUsername);
      }

      logger.warn(`Session expired for account ${accountId} (${platform})`);
    } else {
      // Network error — don't mark invalid, just log
      logger.error(`Session health check error for ${accountId}:`, err);
    }
  }
}
