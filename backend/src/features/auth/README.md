# Auth

Owns users, sessions, dietary preferences, and authorization.

Marketplace uses the same JWT cookie auth as pantry and receipts:

- `POST /api/v1/auth/signup` — `{ name, email, password, role? }` where `role` is `customer` (default) or `vendor`
- `POST /api/v1/auth/login` — `{ email, password }`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

The browser stores `openbasket_token` as an httpOnly cookie (`credentials: 'include'`). `JWT_SECRET` must be set in `backend/.env`.

`User` documents expose `id`, `name`, `email`, `role` (`customer` | `vendor`), and `neighbourhood`. Vendor-only routes live under `/api/v1/vendors/me*`. Customer checkout is `POST /api/v1/payments/checkout-sessions`.
