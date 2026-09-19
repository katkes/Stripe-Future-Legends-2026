# Payments

Owns Stripe Checkout session creation, verified webhook handling, marketplace transfer logic, and payment records. Never expose Stripe credentials to the browser.

## Checkout

`POST /api/v1/payments/checkout-sessions` (customer only)

Body: `{ "items": [{ "productId": "...", "quantity": 1 }] }`

Rules:

- Server re-prices from Mongo.
- All items must belong to one vendor.
- Destination charge: `payment_intent_data.transfer_data.destination` + `application_fee_amount` (~8%, `PLATFORM_FEE_BPS`).
- Fulfillment is **only** from webhooks, not `/checkout/success`.

Local webhook forward:

```bash
stripe listen --forward-to localhost:4000/api/v1/payments/webhook
```

Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and optionally `STRIPE_CONNECTED_ACCOUNT_ID` for the seeded Green Acres farm.

## Pantry handoff (optional)

When an order is marked `paid`, payments logs this payload. The pantry workstream can ingest it later — do not import pantry models from here.

```json
{
  "source": "marketplace-order",
  "customerId": "user-id",
  "vendorId": "vendor-id",
  "items": [{ "name": "Baby spinach", "quantity": 2, "unit": "bunch" }]
}
```
