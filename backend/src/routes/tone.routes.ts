import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { createToneSchema, updateToneSchema } from '../validators/tone.validator';
import * as ctrl from '../controllers/tone.controller';

const router = Router();

router.use(authenticate);

router.get('/', ctrl.listTones);
router.post('/', validate(createToneSchema), ctrl.createTone);
router.get('/:id', ctrl.getTone);
router.put('/:id', validate(updateToneSchema), ctrl.updateTone);
router.delete('/:id', ctrl.deleteTone);

export default router;
