import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import * as adminService from '../services/admin.service';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// All admin routes require admin auth
router.use(authenticate, requireAdmin);

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const stats = await adminService.getStats();
    res.json({ success: true, data: stats });
  })
);

router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string | undefined;
    const result = await adminService.listUsers(page, limit, search);
    res.json({ success: true, ...result });
  })
);

router.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const user = await adminService.getUserDetails(req.params.id as string);
    res.json({ success: true, data: user });
  })
);

router.patch(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const user = await adminService.updateUser(req.params.id as string, req.body);
    res.json({ success: true, data: user });
  })
);

router.post(
  '/users/:id/extend',
  asyncHandler(async (req, res) => {
    const { days } = req.body;
    const user = await adminService.extendPlan(req.params.id as string, days);
    res.json({ success: true, data: user });
  })
);

router.get(
  '/comments/recent',
  asyncHandler(async (_req, res) => {
    const comments = await adminService.getRecentComments();
    res.json({ success: true, data: comments });
  })
);

export default router;
