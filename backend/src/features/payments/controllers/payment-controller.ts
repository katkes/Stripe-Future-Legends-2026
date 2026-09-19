import type { Request, Response } from 'express';
import { env } from '../../../config/env.js';
import { AppError } from '../../../core/errors/app-error.js';
import { createCheckoutSession, failCheckoutSession, fulfillCheckoutSession, pantryPayload } from '../services/checkout-service.js';
import { getStripe } from '../stripe-client.js';

export async function postCheckoutSession(request: Request, response: Response) {
  const result = await createCheckoutSession(request.user!, request.body?.items ?? []);
  response.json(result);
}

export async function handleStripeWebhook(request: Request, response: Response) {
  if (!env.stripeWebhookSecret) throw new AppError(503, 'STRIPE_WEBHOOK_SECRET is not configured.');
  const signature = request.header('stripe-signature');
  if (!signature) throw new AppError(400, 'Missing Stripe-Signature header.');
  const stripe = getStripe();
  const event = stripe.webhooks.constructEvent(request.body, signature, env.stripeWebhookSecret);

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object as { id: string; payment_status?: string };
    const order = await fulfillCheckoutSession(session.id, session.payment_status);
    if (order) {
      console.info('Marketplace order paid', pantryPayload(order));
    }
  }
  if (event.type === 'checkout.session.async_payment_failed') {
    const session = event.data.object as { id: string };
    await failCheckoutSession(session.id);
  }

  response.json({ received: true });
}
