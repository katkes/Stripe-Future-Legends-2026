import cors from 'cors';
import express from 'express';
import { isDatabaseConnected } from './config/database.js';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFound } from './middleware/not-found.js';
import { apiRouter } from './routes/index.js';

export const app = express();
const allowedOrigins = Array.from(new Set([env.clientOrigin, 'http://localhost:3000', 'http://127.0.0.1:3000']));
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.get('/health', (_request, response) => response.json({
  name: 'openbasket-api',
  status: 'ok',
  mode: isDatabaseConnected() ? 'connected' : 'scaffold',
  mongo: isDatabaseConnected() ? 'connected' : 'disconnected',
}));
app.use('/api/v1', apiRouter);
app.use(notFound);
app.use(errorHandler);
import cookieParser from 'cookie-parser';
