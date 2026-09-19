import Stripe from 'stripe';
import { env } from '../../config/env.js';

let client: Stripe | undefined;

export function getStripe(): Stripe {
  if (!env.stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured.');
  }
  client ??= new Stripe(env.stripeSecretKey, {
    apiVersion: '2026-08-26.dahlia',
    typescript: true,
  });
  return client;
}

export function isStripeConfigured() {
  return Boolean(env.stripeSecretKey);
}

export async function createRecipientAccount(displayName: string, email: string) {
  const stripe = getStripe();
  const account = await stripe.v2.core.accounts.create({
    display_name: displayName,
    contact_email: email,
    dashboard: 'express',
    identity: { country: 'ca' },
    defaults: {
      responsibilities: {
        fees_collector: 'application',
        losses_collector: 'application',
      },
    },
    configuration: {
      recipient: {
        capabilities: {
          stripe_balance: { stripe_transfers: { requested: true } },
        },
      },
    },
  });
  return account;
}

export function recipientTransfersActive(account: {
  configuration?: { recipient?: { capabilities?: { stripe_balance?: { stripe_transfers?: { status?: string } } } } };
}) {
  return account.configuration?.recipient?.capabilities?.stripe_balance?.stripe_transfers?.status === 'active';
}

export function randomIntegrationSuffix() {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length: 8 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
}
