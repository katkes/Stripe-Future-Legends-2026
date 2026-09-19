import type { RequestHandler } from 'express';
import { readAccessToken, TOKEN_NAME } from './auth.service.js';

/** Attach a user when a valid cookie or bearer token is present; otherwise continue as a guest. */
export const optionalAuth: RequestHandler = (request, _response, next) => {
  const bearer = request.header('authorization')?.replace(/^Bearer\s+/i, '');
  const token = bearer || request.cookies?.[TOKEN_NAME];
  if (!token) return next();
  try { request.auth = { userId: readAccessToken(token) }; }
  catch { /* guests can still request AI recipes */ }
  next();
};
