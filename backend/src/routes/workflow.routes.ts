import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { checkWorkflowLimit, checkKeywordLimit, checkCreatorLimit } from '../middleware/planLimiter';
import { createWorkflowSchema, updateWorkflowSchema } from '../validators/workflow.validator';
import { addKeywordSchema } from '../validators/keyword.validator';
import { addCreatorSchema } from '../validators/creator.validator';
import * as wf from '../controllers/workflow.controller';
import * as kw from '../controllers/keyword.controller';
import * as cr from '../controllers/creator.controller';

const router = Router();

router.use(authenticate);

router.get('/', wf.listWorkflows);
router.post('/', validate(createWorkflowSchema), checkWorkflowLimit, wf.createWorkflow);
router.get('/:id', wf.getWorkflow);
router.put('/:id', validate(updateWorkflowSchema), wf.updateWorkflow);
router.delete('/:id', wf.deleteWorkflow);
router.post('/:id/activate', wf.activateWorkflow);
router.post('/:id/deactivate', wf.deactivateWorkflow);

// Nested keyword routes (per workflow)
router.get('/:workflowId/keywords', kw.listKeywords);
router.post('/:workflowId/keywords', validate(addKeywordSchema), checkKeywordLimit, kw.addKeyword);
router.delete('/:workflowId/keywords/:id', kw.deleteKeyword);

// Nested creator routes (per workflow)
router.get('/:workflowId/creators', cr.listCreators);
router.post('/:workflowId/creators', validate(addCreatorSchema), checkCreatorLimit, cr.addCreator);
router.delete('/:workflowId/creators/:id', cr.deleteCreator);

export default router;
