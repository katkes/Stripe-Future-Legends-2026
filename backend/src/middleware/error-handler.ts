import type { ErrorRequestHandler } from 'express';
import { AppError } from '../core/errors/app-error.js';

function mongoUnavailableMessage(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  if (/buffering timed out|ServerSelectionError|MongoNetworkError|ECONNREFUSED/i.test(message)) {
    return 'MongoDB is not connected. Allow this machine’s IP in Atlas Network Access, confirm backend/atlas-credentials.env, then restart the API.';
  }
  return null;
}

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const mongoMessage = mongoUnavailableMessage(error);
  if (mongoMessage) {
    response.status(503).json({ error: mongoMessage });
    return;
  }
  const status = error instanceof AppError ? error.statusCode : 500;
  response.status(status).json({ error: error.message || 'Unexpected server error' });
};
