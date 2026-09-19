import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { isMongoReady } from './config/database.js';
import { env } from './config/env.js';
import { handleStripeWebhook } from './features/payments/controllers/payment-controller.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFound } from './middleware/not-found.js';
import { apiRouter } from './routes/index.js';

export const app = express();
const allowedOrigins = Array.from(new Set([env.clientOrigin, 'http://localhost:3000', 'http://127.0.0.1:3000']));
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), (request, response, next) => {
  void handleStripeWebhook(request, response).catch(next);
});
app.use(express.json());
app.use(cookieParser());
app.get('/health', (_request, response) =>
  response.json({
    name: 'openbasket-api',
    status: 'ok',
    mode: isMongoReady() ? 'mongo' : 'memory',
    mongo: isMongoReady() ? 'connected' : 'disconnected',
    marketplace: true,
  }),
);
app.use('/api/v1', apiRouter);
app.use(notFound);
app.use(errorHandler);
