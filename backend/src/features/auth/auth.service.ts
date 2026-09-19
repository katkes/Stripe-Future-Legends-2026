import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AppError } from '../../core/errors/app-error.js';

const TOKEN_NAME = 'openbasket_token';

function secret() {
  if (!env.jwtSecret) throw new AppError(500, 'JWT_SECRET is not configured.');
  return env.jwtSecret;
}

export function createAccessToken(userId: string) {
  return jwt.sign({ sub: userId }, secret(), { expiresIn: '7d' });
}

export function readAccessToken(token: string) {
  const payload = jwt.verify(token, secret());
  if (typeof payload === 'string' || !payload.sub) throw new AppError(401, 'Invalid authentication token.');
  return payload.sub;
}

export async function hashPassword(password: string) { return bcrypt.hash(password, 12); }
export async function verifyPassword(password: string, hash: string) { return bcrypt.compare(password, hash); }

export const authCookie = (token: string) => ({
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax' as const,
  maxAge: 1000 * 60 * 60 * 24 * 7,
});
export { TOKEN_NAME };
