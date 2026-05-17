import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as ctrl from '../controllers/analytics.controller';

const router = Router();

router.use(authenticate);

router.get('/summary', ctrl.getSummary);
router.get('/timeseries', ctrl.getTimeseries);
router.get('/quota', ctrl.getQuota);
router.get('/overview', ctrl.getOverview);
router.get('/performance', ctrl.getPerformance);
router.get('/daily', ctrl.getDailyBreakdown);

export default router;
