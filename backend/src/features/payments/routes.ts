import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/require-auth.js';
import { postCheckoutSession } from './controllers/payment-controller.js';

export const paymentRouter = Router();
paymentRouter.post('/checkout-sessions', requireAuth, requireRole('customer'), (request, response, next) => {
  void postCheckoutSession(request, response).catch(next);
});
