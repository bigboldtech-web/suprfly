import * as Sentry from '@sentry/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { config } from './config';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';
import { prisma } from './config/database';
import { startScheduler } from './cron/scheduler';
import { startWorkers } from './services/queue/workers';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import {
  postDiscoveryQueue, commentGenQueue, commentPostQueue, sessionHealthQueue, statsPollQueue
} from './services/queue';

// ── Sentry Error Monitoring ──
if (config.sentryDsn) {
  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.nodeEnv,
    tracesSampleRate: config.isProd ? 0.1 : 1.0,
  });
}

const app = express();

// Sentry request handler (must be first middleware)
if (config.sentryDsn) {
  Sentry.setupExpressErrorHandler(app);
}

// ── Stripe webhook requires RAW body — must be BEFORE json parser ──
app.post(
  '/api/v1/billing/webhook/stripe',
  express.raw({ type: 'application/json' }),
  (req, res, next) => next()
);

// Security
app.use(helmet());
app.use(
  cors({
    origin: [config.frontendUrl, config.appUrl, /chrome-extension:\/\/.*/],
    credentials: true,
  })
);

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

// ── BullMQ Admin Dashboard ──
const bullAdapter = new ExpressAdapter();
bullAdapter.setBasePath('/admin/queues');
createBullBoard({
  queues: [
    new BullMQAdapter(postDiscoveryQueue),
    new BullMQAdapter(commentGenQueue),
    new BullMQAdapter(commentPostQueue),
    new BullMQAdapter(sessionHealthQueue),
    new BullMQAdapter(statsPollQueue),
  ],
  serverAdapter: bullAdapter,
});
app.use('/admin/queues', bullAdapter.getRouter());

// Logging
app.use(
  morgan('combined', {
    stream: { write: (msg: string) => logger.info(msg.trim()) },
  })
);

// Rate limiting
app.use(generalLimiter);

// Health check
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// API routes
app.use('/api/v1', routes);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port || 5000;
app.listen(PORT, () => {
  logger.info(`Suprfly API running on port ${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);

  // Start background processing
  startScheduler();
  startWorkers();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
