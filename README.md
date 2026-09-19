# OpenBasket

OpenBasket is an AI-powered grocery companion for turning receipts into a pantry, cooking what you already have, and shopping more thoughtfully with your community.

## Current starter

`basket-web/` contains a polished, responsive React dashboard UI built with static demo content. It has no backend, AI, payments, storage, receipt upload, or live data wired in yet.

`backend/` is a separate Express + TypeScript + MongoDB-ready API scaffold. It contains no product logic: feature endpoints are intentional placeholders until the respective team takes ownership. See [the backend architecture](backend/ARCHITECTURE.md) for the feature map and API boundaries.

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

## Setup and run

Install each application once:

```bash
cd basket-web && npm install
cd ../backend && npm install
```

Configure the backend without committing credentials:

```bash
cd backend
cp .env.example .env
cp atlas-credentials.env.example atlas-credentials.env
```

Keep your supplied Atlas values in `backend/atlas-credentials.env`. The backend loads `MONGODB_USERNAME`, `MONGODB_PASSWORD`, and `MONGODB_URI` from that file automatically. Do not commit or paste this file into source control.

Add your OCR.space API key to `backend/.env` after registration. Recipe recommendations call OpenAI Chat Completions with `OPENAI_API_KEY` when set, otherwise this same key:

```bash
OCR_SPACE_API_KEY=your-key-goes-here
OPENAI_API_KEY=
JWT_SECRET=replace-with-a-long-random-local-secret
```

### Web UI

```bash
cd basket-web
npm run dev
```

The UI runs at `http://localhost:3000`.

Open `http://localhost:3000/scanner` for signup, login, and receipt upload. Open `http://localhost:3000/recipes` for AI recipe recommendations from your pantry.

### API

```bash
cd backend
npm run dev
```

The API runs at `http://localhost:4000`; confirm it with `http://localhost:4000/health`.

### Whole project

Use two terminals to run the UI and API concurrently:

```bash
npm run dev:web
```

```bash
npm run dev:api
```

From the repository root, build both applications with:

```bash
npm run build
```
