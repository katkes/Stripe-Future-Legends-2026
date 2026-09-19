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
app.use(cors({ origin: env.clientOrigin, credentials: true }));
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
    marketplace: true,
  }),
);
app.use('/api/v1', apiRouter);
app.use(notFound);
app.use(errorHandler);
