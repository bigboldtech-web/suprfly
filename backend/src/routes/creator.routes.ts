import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { searchProfilesSchema } from '../validators/creator.validator';
import * as ctrl from '../controllers/creator.controller';

// Top-level creator routes provide profile search + performance summaries.
// Per-workflow CRUD lives on /api/v1/workflows/:workflowId/creators.
const router = Router();

router.use(authenticate);

router.get('/performance', ctrl.getPerformance);
router.post('/search', validate(searchProfilesSchema), ctrl.searchProfiles);

export default router;
