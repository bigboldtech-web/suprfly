import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { authLimiter } from '../middleware/rateLimiter';
import {
  registerSchema, loginSchema, refreshTokenSchema,
  forgotPasswordSchema, resetPasswordSchema, updateProfileSchema,
} from '../validators/auth.validator';
import * as ctrl from '../controllers/auth.controller';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), ctrl.register);
router.post('/login', authLimiter, validate(loginSchema), ctrl.login);
router.post('/refresh', validate(refreshTokenSchema), ctrl.refresh);
router.post('/logout', ctrl.logout);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), ctrl.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), ctrl.resetPassword);
router.get('/verify-email/:token', ctrl.verifyEmail);
router.get('/me', authenticate, ctrl.getMe);
router.patch('/me', authenticate, validate(updateProfileSchema), ctrl.updateMe);

export default router;
