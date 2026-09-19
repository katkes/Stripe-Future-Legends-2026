# OpenBasket backend architecture

This is a MERN-oriented API scaffold. It deliberately has no product logic yet: every feature endpoint returns `501 Not Implemented` until its owner connects it to real controllers, services, and MongoDB models.

## MongoDB connection

The API loads general server settings from `backend/.env` and Atlas values from `backend/atlas-credentials.env`. The latter must define `MONGODB_USERNAME`, `MONGODB_PASSWORD`, and `MONGODB_URI`; it is ignored by Git. The database bootstrap passes the username and password directly to MongoDB and connects automatically when the API starts. Without a URI, the API stays in scaffold mode.

## Shared layers

| Location | Responsibility |
| --- | --- |
| `src/config` | Environment parsing and MongoDB connection bootstrap |
| `src/core` | Cross-cutting errors and domain primitives |
| `src/middleware` | HTTP middleware, validation/error handling, and authorization later |
| `src/shared` | Reusable HTTP, AI-client, and data-provider adapters later |
| `src/routes` | Versioned API composition only—never product logic |

## Feature ownership

Every feature folder is reserved for one team. When implementation begins, use `controllers/`, `services/`, `models/`, `validators/`, and `types/` inside that folder; do not reach into another feature's database models directly.

| Folder | API prefix | Scope |
| --- | --- | --- |
| `features/auth` | `/api/v1/auth` | Accounts, sessions, preferences, dietary goals |
| `features/receipts` | `/api/v1/receipts` | Uploads, OCR/AI extraction, receipt confirmation |
| `features/pantry` | `/api/v1/pantry` | Pantry inventory, expiry estimates, item state changes |
| `features/recipes` | `/api/v1/recipes` | Recipes, meal plans, missing-ingredient suggestions |
| `features/grocery-lists` | `/api/v1/grocery-lists` | Smart lists, budgets, substitutions |
| `features/prices` | `/api/v1/prices` | Anonymized receipt prices, local comparisons |
| `features/impact` | `/api/v1/impact` | Nutrition, carbon, water, swaps and data sources |
| `features/community` | `/api/v1/community` | Basket templates, group orders, delivery coordination |
| `features/vendors` | `/api/v1/vendors` | Farmers, catalogues, availability, fulfilment areas |
| `features/payments` | `/api/v1/payments` | Checkout session creation, Connect transfers, webhooks |

## Payments boundary

The payments team should use a separate Stripe sandbox and a least-privilege restricted API key. For this marketplace-style checkout, start with Checkout Sessions and design vendor onboarding using Connect Accounts v2. Fulfilment must be driven from verified webhook events, not the success page.
