import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many auth attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const commentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many comment operations, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});
