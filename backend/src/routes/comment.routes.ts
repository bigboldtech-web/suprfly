import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { commentLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validator';
import { editCommentSchema, rejectCommentSchema } from '../validators/comment.validator';
import * as ctrl from '../controllers/comment.controller';

const router = Router();

router.use(authenticate);

router.get('/', ctrl.listComments);
router.get('/export', ctrl.exportCsv);
router.get('/stats', ctrl.getStats);
router.get('/:id', ctrl.getComment);
router.post('/:id/approve', commentLimiter, ctrl.approveComment);
router.put('/:id', commentLimiter, validate(editCommentSchema), ctrl.editComment);
router.post('/:id/reject', commentLimiter, validate(rejectCommentSchema), ctrl.rejectComment);

export default router;
