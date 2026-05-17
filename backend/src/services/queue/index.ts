import { Queue } from 'bullmq';
import { bullConnection } from '../../config/redis';

const defaultOpts = bullConnection;

export const postDiscoveryQueue = new Queue('post-discovery', {
  ...defaultOpts,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 30000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  },
});

export const commentGenQueue = new Queue('comment-generation', {
  ...defaultOpts,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 10000 },
    removeOnComplete: { count: 5000 },
    removeOnFail: { count: 5000 },
  },
});

export const commentPostQueue = new Queue('comment-posting', {
  ...defaultOpts,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 60000 },
    removeOnComplete: { count: 10000 },
    removeOnFail: { count: 5000 },
  },
});

export const sessionHealthQueue = new Queue('session-health', defaultOpts);
export const dailyResetQueue = new Queue('daily-reset', defaultOpts);
export const statsPollQueue = new Queue('stats-poll', defaultOpts);
