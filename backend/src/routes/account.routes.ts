import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { checkAccountLimit } from '../middleware/planLimiter';
import { syncSessionSchema } from '../validators/account.validator';
import * as ctrl from '../controllers/account.controller';

const router = Router();

router.use(authenticate);

router.get('/', ctrl.listAccounts);
router.post('/sync-session', validate(syncSessionSchema), checkAccountLimit, ctrl.syncSession);
router.patch('/:id/toggle', ctrl.toggleAccount);
router.post('/:id/refresh', ctrl.refreshSession);
router.delete('/:id', ctrl.disconnectAccount);
router.get('/:id/status', ctrl.getAccountStatus);
router.get('/:id/organizations', ctrl.listOrganizations);

export default router;
