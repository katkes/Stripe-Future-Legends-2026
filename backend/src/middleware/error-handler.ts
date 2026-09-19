import type { ErrorRequestHandler } from 'express';
import { AppError } from '../core/errors/app-error.js';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const status = error instanceof AppError ? error.statusCode : 500;
  response.status(status).json({ error: error.message || 'Unexpected server error' });
};
