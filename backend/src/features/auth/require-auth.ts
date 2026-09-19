import type { RequestHandler } from 'express';
import { AppError } from '../../core/errors/app-error.js';
import { readAccessToken, TOKEN_NAME } from './auth.service.js';

export const optionalAuth: RequestHandler = (request, _response, next) => {
  const bearer = request.header('authorization')?.replace(/^Bearer\s+/i, '');
  const token = bearer || request.cookies?.[TOKEN_NAME];
  if (!token) return next();
  try { request.auth = { userId: readAccessToken(token) }; }
  catch { /* anonymous demo pantry */ }
  next();
};

export const requireAuth: RequestHandler = (request, _response, next) => {
  const bearer = request.header('authorization')?.replace(/^Bearer\s+/i, '');
  const token = bearer || request.cookies?.[TOKEN_NAME];
  if (!token) return next(new AppError(401, 'Authentication is required.'));
  try { request.auth = { userId: readAccessToken(token) }; next(); }
  catch (error) { next(error); }
};
