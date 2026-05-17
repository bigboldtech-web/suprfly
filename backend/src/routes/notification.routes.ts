import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as notificationService from '../services/notification.service';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await notificationService.listNotifications(req.user!.id, page, limit);
    res.json({ success: true, data: result.notifications, pagination: result.pagination });
  })
);

router.get(
  '/unread-count',
  authenticate,
  asyncHandler(async (req, res) => {
    const count = await notificationService.getUnreadCount(req.user!.id);
    res.json({ success: true, data: { count } });
  })
);

router.patch(
  '/:id/read',
  authenticate,
  asyncHandler(async (req, res) => {
    await notificationService.markAsRead(req.user!.id, req.params.id as string);
    res.json({ success: true, message: 'Marked as read' });
  })
);

router.patch(
  '/read-all',
  authenticate,
  asyncHandler(async (req, res) => {
    await notificationService.markAllAsRead(req.user!.id);
    res.json({ success: true, message: 'All marked as read' });
  })
);

export default router;
