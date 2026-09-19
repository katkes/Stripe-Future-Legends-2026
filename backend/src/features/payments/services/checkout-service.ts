import { env } from '../../../config/env.js';
import { isMongoReady } from '../../../config/database.js';
import { AppError } from '../../../core/errors/app-error.js';
import { memoryStore } from '../../../shared/memory-store.js';
import type { AuthUser } from '../../auth/types.js';
import { decrementStock, loadCatalogForCheckout } from '../../vendors/services/vendor-service.js';
import { OrderModel } from '../models/order.js';
import { getStripe, isStripeConfigured, randomIntegrationSuffix } from '../stripe-client.js';

type CartItem = { productId?: string; quantity?: unknown };
type OrderLine = { productId: string; name: string; unit: string; quantity: number; unitAmountCents: number };

export function platformFeeCents(subtotalCents: number) {
  return Math.max(1, Math.round((subtotalCents * env.platformFeeBps) / 10_000));
}

export async function createCheckoutSession(user: AuthUser, items: CartItem[]) {
  if (!isStripeConfigured()) {
    throw new AppError(503, 'Stripe is not configured. Add STRIPE_SECRET_KEY or STRIPE_API_KEY to backend/.env.');
  }
  const parsed = items
    .map((item) => ({ productId: String(item.productId ?? ''), quantity: Number(item.quantity) }))
    .filter((item) => item.productId && Number.isInteger(item.quantity) && item.quantity > 0);
  if (parsed.length === 0) throw new AppError(400, 'Your cart is empty.');

  const catalog = await loadCatalogForCheckout(parsed.map((item) => item.productId));
  if (catalog.vendors.length !== 1) throw new AppError(400, 'Checkout is limited to one farm per cart.');
  const vendor = catalog.vendors[0];

  const productById = new Map(catalog.products.map((product) => [product.id, product]));
  const lines: OrderLine[] = parsed.map((item) => {
    const product = productById.get(item.productId);
    if (!product || product.vendorId !== vendor.id) throw new AppError(400, 'Every item must belong to the same farm.');
    if (item.quantity > product.stock) throw new AppError(409, `${product.name} does not have enough stock.`);
    return {
      productId: product.id,
      name: product.name,
      unit: product.unit,
      quantity: item.quantity,
      unitAmountCents: product.priceCents,
    };
  });

  const subtotalCents = lines.reduce((sum, line) => sum + line.unitAmountCents * line.quantity, 0);
  const applicationFeeCents = Math.min(subtotalCents - 1, platformFeeCents(subtotalCents));
  if (subtotalCents < 50) throw new AppError(400, 'Cart total is too small for Checkout.');

  const destination = vendor.stripeAccountId || undefined;
  if (!destination) {
    console.warn('Checkout is running without a connected account; funds stay on the platform.');
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: `${env.clientOrigin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.clientOrigin}/checkout/cancel`,
    customer_email: user.email,
    client_reference_id: user.id,
    line_items: lines.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency: 'cad',
        unit_amount: line.unitAmountCents,
        product_data: { name: `${line.name} (${line.unit})` },
      },
    })),
    payment_intent_data: destination
      ? {
          application_fee_amount: applicationFeeCents,
          transfer_data: { destination },
          metadata: { vendorId: vendor.id, customerId: user.id },
        }
      : { metadata: { vendorId: vendor.id, customerId: user.id } },
    integration_identifier: `openbasket_${randomIntegrationSuffix()}`,
    metadata: { vendorId: vendor.id, customerId: user.id },
  });

  const record = {
    customerId: user.id,
    vendorId: vendor.id,
    stripeSessionId: session.id,
    status: 'pending' as const,
    currency: 'cad',
    subtotalCents,
    applicationFeeCents,
    lines,
  };
  if (isMongoReady()) await OrderModel.create(record);
  else memoryStore.addOrder(record);

  return { url: session.url, sessionId: session.id, applicationFeeCents, subtotalCents };
}

export async function fulfillCheckoutSession(sessionId: string, paymentStatus: string | null | undefined) {
  if (paymentStatus === 'unpaid') return undefined;
  if (!isMongoReady()) {
    const order = memoryStore.findOrderBySession(sessionId);
    if (!order || order.status === 'paid') return order;
    order.status = 'paid';
    await decrementStock(order.lines.map((line) => ({ productId: line.productId, quantity: line.quantity })));
    return order;
  }
  const order = await OrderModel.findOne({ stripeSessionId: sessionId });
  if (!order) return undefined;
  if (order.status === 'paid') return order;
  order.status = 'paid';
  await order.save();
  await decrementStock(order.lines.map((line: OrderLine) => ({ productId: line.productId, quantity: line.quantity })));
  return order;
}

export async function failCheckoutSession(sessionId: string) {
  if (!isMongoReady()) {
    const order = memoryStore.findOrderBySession(sessionId);
    if (!order || order.status === 'paid') return order;
    order.status = 'failed';
    return order;
  }
  const order = await OrderModel.findOne({ stripeSessionId: sessionId });
  if (!order || order.status === 'paid') return order;
  order.status = 'failed';
  await order.save();
  return order;
}

export function pantryPayload(order: {
  customerId: string;
  vendorId: string;
  lines: { name: string; quantity: number; unit: string }[];
}) {
  return {
    source: 'marketplace-order',
    customerId: order.customerId,
    vendorId: order.vendorId,
    items: order.lines.map((line) => ({
      name: line.name,
      quantity: line.quantity,
      unit: line.unit,
    })),
  };
}
