import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as ctrl from '../controllers/keyword.controller';

// Top-level keyword routes are utility-only (performance summaries).
// Per-workflow CRUD lives on /api/v1/workflows/:workflowId/keywords.
const router = Router();

router.use(authenticate);

router.get('/performance', ctrl.getPerformance);

export default router;
