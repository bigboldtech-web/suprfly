import { Job } from 'bullmq';
import { prisma } from '../../config/database';
import { commentGenQueue } from './index';
import * as linkedinDiscovery from '../linkedin/postDiscovery';
import * as twitterDiscovery from '../twitter/postDiscovery';
import { logger } from '../../utils/logger';
import { RATE_LIMITS } from '../../utils/constants';
import { canCommentOnWorkflow } from '../quota.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface DiscoveryJobData {
  workflowId: string;
}

export async function processPostDiscovery(job: Job<DiscoveryJobData>) {
  const { workflowId } = job.data;

  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: {
      account: true,
      keywords: { where: { isActive: true } },
      creators: { where: { isActive: true } },
      user: { select: { isActive: true } },
    },
  });

  if (!workflow || !workflow.isActive) return;
  if (!workflow.user.isActive) return;
  if (!workflow.account.sessionValid || !workflow.account.isActive) return;

  // Quota gates (workflow / account / global)
  const quota = await canCommentOnWorkflow(workflowId);
  if (!quota.ok) {
    logger.info(`Workflow ${workflow.name}: quota gate ${quota.reason} — skipping discovery`);
    return;
  }

  // Active-hours window
  const platform = workflow.account.platform;
  const limits = RATE_LIMITS[platform.toLowerCase() as 'linkedin' | 'twitter'];
  const now = dayjs().tz(workflow.timezone);
  const hour = now.hour();
  if (hour < limits.activeHoursStart || hour >= limits.activeHoursEnd) {
    logger.debug(`Workflow ${workflow.id}: outside active hours (${hour}h ${workflow.timezone})`);
    return;
  }

  const newPostIds: string[] = [];
  const discover = platform === 'LINKEDIN' ? linkedinDiscovery : twitterDiscovery;

  if (workflow.targetType === 'KEYWORD' && workflow.keywords.length > 0) {
    const ids = await discover.discoverByKeywords(workflow.account as any, workflow.keywords);
    newPostIds.push(...ids);
  }

  if (workflow.targetType === 'CREATOR' && workflow.creators.length > 0) {
    const ids = await discover.discoverByCreators(workflow.account as any, workflow.creators);
    newPostIds.push(...ids);
  }

  // Jitter so multiple workflows on the same account don't burst
  const jitterMs = Math.floor(Math.random() * 8000);

  for (const postId of newPostIds) {
    await commentGenQueue.add(
      `gen-${postId}`,
      { postId, workflowId },
      { jobId: `gen-${postId}-${workflowId}`, delay: jitterMs },
    );
  }

  logger.info(
    `Workflow ${workflow.name}: discovered ${newPostIds.length} new posts (${workflow.targetType.toLowerCase()})`,
  );
}

export async function enqueueDiscoveryForAllActiveWorkflows(queue: { add: (name: string, data: any, opts?: any) => Promise<any> }) {
  const workflows = await prisma.workflow.findMany({
    where: { isActive: true, account: { isActive: true, sessionValid: true } },
    select: { id: true },
  });
  for (const wf of workflows) {
    await queue.add(`discover-${wf.id}`, { workflowId: wf.id }, { jobId: `discover-${wf.id}` });
  }
  return workflows.length;
}
