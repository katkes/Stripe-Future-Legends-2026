# Vendors

Owns local farmer/vendor profiles, catalogues, pricing, and stock.

Public:

- `GET /api/v1/vendors` — farms
- `GET /api/v1/vendors/:id` — farm + active products

Vendor (role `vendor`):

- `POST` / `PUT /api/v1/vendors/me` — create or update the farm (creates a Stripe connected account when keys exist)
- `POST /api/v1/vendors/me/products` — `{ name, unit: lb\|bunch\|each, priceCents, stock }`
- `PATCH /api/v1/vendors/me/products/:id`
- `DELETE /api/v1/vendors/me/products/:id` — soft archive (`active: false`)

Delivery windows are out of scope for this slice.
