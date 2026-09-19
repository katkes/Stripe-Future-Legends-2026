# OpenBasket

OpenBasket is an AI-powered grocery companion for turning receipts into a pantry, cooking what you already have, and shopping more thoughtfully with your community.

## Current starter

`basket-web/` contains a polished, responsive React dashboard UI built with static demo content. It has no backend, AI, payments, storage, receipt upload, or live data wired in yet.

The dashboard already gives the team a shared visual target for these workstreams:

- Receipt scanning and pantry updates
- Recipe recommendations and meal planning
- Grocery list and local price comparison
- Nutrition, carbon, water, and product swaps
- Community baskets and group delivery
- Stripe test checkout and vendor payouts

## Suggested ownership split

| Workstream | Primary UI area |
| --- | --- |
| Receipt & pantry | Receipt prompt and “Use these soon” cards |
| Recipes | “Ideas for tonight” cards and Recipes navigation |
| Sustainability | Weekly impact card and My impact navigation |
| Community & farmers | Neighbourhood basket banner and Community navigation |
| Commerce | Grocery list navigation and later checkout flow |
| Platform | Authentication, API, MongoDB models, and shared design system |

## Run locally

```bash
cd basket-web
npm run dev
```
