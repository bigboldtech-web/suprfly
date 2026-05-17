import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as ctrl from '../controllers/billing.controller';

const router = Router();

router.get('/plan', authenticate, ctrl.getPlan);
router.post('/checkout', authenticate, ctrl.createCheckout);
router.post('/webhook/stripe', ctrl.stripeWebhook); // No auth — verified by signature
router.post('/webhook/razorpay', ctrl.razorpayWebhook); // No auth — verified by signature
router.post('/appsumo/redeem', authenticate, ctrl.redeemAppSumo);
router.get('/invoices', authenticate, ctrl.getInvoices);
router.post('/cancel', authenticate, ctrl.cancelSubscription);

export default router;
