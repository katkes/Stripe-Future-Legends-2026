import type { ErrorRequestHandler } from 'express';
import { AppError } from '../core/errors/app-error.js';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const buffering = typeof error?.message === 'string' && error.message.includes('buffering timed out');
  const status = error instanceof AppError ? error.statusCode : buffering ? 503 : 500;
  const message = buffering
    ? 'MongoDB is not connected. Put a real mongodb+srv URI in backend/atlas-credentials.env (that file overrides backend/.env). Restart the API after saving.'
    : error.message || 'Unexpected server error';
  if (status >= 500) console.error(error);
  response.status(status).json({ error: message });
};
