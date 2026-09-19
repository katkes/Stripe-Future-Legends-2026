# Marketplace teammate contract

Commerce owns `features/vendors` and `features/payments`. Auth is the JWT cookie flow in `features/auth` (`signup` / `login` / `logout` / `me`). Persist `role` (`customer` | `vendor`) on the User model. Leave receipts, pantry, recipes, impact, grocery lists, prices, and community to their owners unless you agree otherwise.

## Paid farm order → pantry

After Stripe marks a Checkout Session paid, payments writes an `Order` and logs:

```json
{
  "source": "marketplace-order",
  "customerId": "<user id>",
  "vendorId": "<vendor id>",
  "items": [{ "name": "Roma tomatoes", "quantity": 1, "unit": "lb" }]
}
```

Pantry can later expose `POST /api/v1/pantry/ingest` for that shape. Do not import pantry schemas from payments.
