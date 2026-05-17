import { Worker } from 'bullmq';
import { bullConnection } from '../../config/redis';
import { processPostDiscovery } from './postDiscoveryWorker';
import { processCommentGeneration } from './commentGenWorker';
import { processCommentPosting } from './commentPostWorker';
import { processSessionHealth } from './sessionHealthWorker';
import { processDailyReset } from './dailyResetWorker';
import { processStatsPoll } from './statsPollWorker';
import { logger } from '../../utils/logger';

const opts = bullConnection;

export function startWorkers() {
  const postDiscoveryWorker = new Worker('post-discovery', processPostDiscovery, {
    ...opts,
    concurrency: 3,
  });

  const commentGenWorker = new Worker('comment-generation', processCommentGeneration, {
    ...opts,
    concurrency: 5,
  });

  const commentPostWorker = new Worker('comment-posting', processCommentPosting, {
    ...opts,
    concurrency: 2,
  });

  const sessionHealthWorker = new Worker('session-health', processSessionHealth, {
    ...opts,
    concurrency: 5,
  });

  const dailyResetWorker = new Worker('daily-reset', processDailyReset, opts);
  const statsPollWorker = new Worker('stats-poll', processStatsPoll, { ...opts, concurrency: 2 });

  const workers = [
    { name: 'post-discovery', worker: postDiscoveryWorker },
    { name: 'comment-generation', worker: commentGenWorker },
    { name: 'comment-posting', worker: commentPostWorker },
    { name: 'session-health', worker: sessionHealthWorker },
    { name: 'daily-reset', worker: dailyResetWorker },
    { name: 'stats-poll', worker: statsPollWorker },
  ];

  for (const { name, worker } of workers) {
    worker.on('completed', (job) => {
      logger.debug(`[${name}] Job ${job.id} completed`);
    });
    worker.on('failed', (job, err) => {
      logger.error(`[${name}] Job ${job?.id} failed: ${err.message}`);
    });
  }

  logger.info('All BullMQ workers started');
}
