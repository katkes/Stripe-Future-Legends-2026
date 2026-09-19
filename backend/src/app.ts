import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { cookingSessionsRouter, groceryListItemsRouter, pantryConsumptionRouter, recipesRouter } from './features/recipes/routes.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFound } from './middleware/not-found.js';
import { apiRouter } from './routes/index.js';

const corsOrigins = [env.clientOrigin, 'http://127.0.0.1:3000', 'http://localhost:3000'];

export const app = express();
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.get('/health', (_request, response) => response.json({ name: 'openbasket-api', status: 'ok', mode: 'scaffold' }));
app.use('/api/v1', apiRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/grocery-list', groceryListItemsRouter);
app.use('/api/cooking-sessions', cookingSessionsRouter);
app.use('/api/pantry', pantryConsumptionRouter);
app.use(notFound);
app.use(errorHandler);
