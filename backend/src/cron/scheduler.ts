import cron from 'node-cron';
import { postDiscoveryQueue, sessionHealthQueue, dailyResetQueue, statsPollQueue } from '../services/queue';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export function startScheduler() {
  // POST DISCOVERY: Every 10 minutes — iterate active workflows
  cron.schedule('*/10 * * * *', async () => {
    try {
      const workflows = await prisma.workflow.findMany({
        where: {
          isActive: true,
          account: { isActive: true, sessionValid: true },
          user: { isActive: true },
        },
        select: { id: true },
      });

      for (const wf of workflows) {
        await postDiscoveryQueue.add(
          `discover-${wf.id}`,
          { workflowId: wf.id },
          { jobId: `discover-${wf.id}-${Date.now()}` },
        );
      }

      logger.debug(`Scheduled discovery for ${workflows.length} workflows`);
    } catch (err) {
      logger.error('Post discovery scheduler error:', err);
    }
  });

  // SESSION HEALTH CHECK: Every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      const accounts = await prisma.connectedAccount.findMany({
        where: { isActive: true },
        select: { id: true, platform: true, userId: true },
      });

      for (const account of accounts) {
        await sessionHealthQueue.add('check', {
          accountId: account.id,
          platform: account.platform,
          userId: account.userId,
        });
      }
    } catch (err) {
      logger.error('Session health scheduler error:', err);
    }
  });

  // DAILY RESET: 18:30 UTC (00:00 IST)
  cron.schedule('30 18 * * *', async () => {
    try {
      await dailyResetQueue.add('reset', { date: new Date().toISOString() });
    } catch (err) {
      logger.error('Daily reset scheduler error:', err);
    }
  });

  // STATS POLL: Every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      await statsPollQueue.add('poll', { ts: Date.now() });
    } catch (err) {
      logger.error('Stats poll scheduler error:', err);
    }
  });

  logger.info('Cron scheduler started');
}
