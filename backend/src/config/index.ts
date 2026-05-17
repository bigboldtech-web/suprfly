import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function required(key: string): string {
  const value = process.env[key];
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || '';
}

function optional(key: string, fallback: string = ''): string {
  return process.env[key] || fallback;
}

export const config = {
  nodeEnv: optional('NODE_ENV', 'development'),
  port: parseInt(optional('PORT', '5000'), 10),
  appUrl: optional('APP_URL', 'http://localhost:3000'),
  apiUrl: optional('API_URL', 'http://localhost:5000'),
  frontendUrl: optional('FRONTEND_URL', 'http://localhost:3000'),

  databaseUrl: required('DATABASE_URL'),
  redisUrl: optional('REDIS_URL', 'redis://localhost:6379'),

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiry: optional('JWT_ACCESS_EXPIRY', '15m'),
    refreshExpiry: optional('JWT_REFRESH_EXPIRY', '30d'),
  },

  encryptionKey: required('ENCRYPTION_KEY'),

  ai: {
    anthropicApiKey: optional('ANTHROPIC_API_KEY'),
    openaiApiKey: optional('OPENAI_API_KEY'),
    model: optional('AI_MODEL', 'claude-3-haiku-20240307'),
    fallbackModel: optional('AI_FALLBACK_MODEL', 'gpt-4o-mini'),
  },

  smtp: {
    host: optional('SMTP_HOST', 'smtp.gmail.com'),
    port: parseInt(optional('SMTP_PORT', '587'), 10),
    user: optional('SMTP_USER'),
    pass: optional('SMTP_PASS'),
  },
  emailFrom: optional('EMAIL_FROM', 'noreply@suprfly.io'),
  emailFromName: optional('EMAIL_FROM_NAME', 'Suprfly'),

  stripe: {
    secretKey: optional('STRIPE_SECRET_KEY'),
    webhookSecret: optional('STRIPE_WEBHOOK_SECRET'),
    starterMonthlyPriceId: optional('STRIPE_STARTER_MONTHLY_PRICE_ID'),
    starterYearlyPriceId: optional('STRIPE_STARTER_YEARLY_PRICE_ID'),
    growthMonthlyPriceId: optional('STRIPE_GROWTH_MONTHLY_PRICE_ID'),
    growthYearlyPriceId: optional('STRIPE_GROWTH_YEARLY_PRICE_ID'),
    agencyMonthlyPriceId: optional('STRIPE_AGENCY_MONTHLY_PRICE_ID'),
    agencyYearlyPriceId: optional('STRIPE_AGENCY_YEARLY_PRICE_ID'),
  },

  razorpay: {
    keyId: optional('RAZORPAY_KEY_ID'),
    keySecret: optional('RAZORPAY_KEY_SECRET'),
  },

  sentryDsn: optional('SENTRY_DSN'),

  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',
};
