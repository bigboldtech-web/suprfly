import Redis from 'ioredis';
import { config } from './index';
import { logger } from '../utils/logger';

export const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 5000);
    return delay;
  },
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error('Redis error:', err));

// BullMQ connection config (reusable for queues)
export const bullConnection = {
  connection: {
    host: new URL(config.redisUrl).hostname || 'localhost',
    port: parseInt(new URL(config.redisUrl).port || '6379', 10),
  },
};
