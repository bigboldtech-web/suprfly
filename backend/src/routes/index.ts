import { Router } from 'express';
import authRoutes from './auth.routes';
import accountRoutes from './account.routes';
import keywordRoutes from './keyword.routes';
import creatorRoutes from './creator.routes';
import toneRoutes from './tone.routes';
import workflowRoutes from './workflow.routes';
import commentRoutes from './comment.routes';
import analyticsRoutes from './analytics.routes';
import billingRoutes from './billing.routes';
import notificationRoutes from './notification.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/accounts', accountRoutes);
router.use('/workflows', workflowRoutes);
router.use('/keywords', keywordRoutes);
router.use('/creators', creatorRoutes);
router.use('/tones', toneRoutes);
router.use('/comments', commentRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/billing', billingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

export default router;
