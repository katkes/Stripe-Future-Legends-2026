import { Router } from 'express';
import { requireMongo } from '../../config/database.js';
import { AppError } from '../../core/errors/app-error.js';
import { User } from './user.model.js';
import { authCookie, createAccessToken, hashPassword, TOKEN_NAME, verifyPassword } from './auth.service.js';
import { requireAuth } from './require-auth.js';

export const authRouter = Router();
const presentUser = (user: { _id: unknown; name: string; email: string; role?: string; neighbourhood?: string }) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role === 'vendor' ? 'vendor' : 'customer',
  neighbourhood: user.neighbourhood || 'Toronto, ON',
});

function parseRole(value: unknown) {
  return value === 'vendor' ? 'vendor' : 'customer';
}

authRouter.post('/signup', async (request, response, next) => {
  try {
    requireMongo();
    const { name, email, password, role } = request.body as { name?: string; email?: string; password?: string; role?: string };
    if (!name || !email || !password || password.length < 8) throw new AppError(400, 'Name, email, and an 8+ character password are required.');
    if (await User.exists({ email: email.toLowerCase() })) throw new AppError(409, 'An account already exists for this email.');
    const user = await User.create({ name, email, passwordHash: await hashPassword(password), role: parseRole(role) });
    const token = createAccessToken(String(user._id));
    response.status(201).cookie(TOKEN_NAME, token, authCookie(token)).json({ user: presentUser(user) });
  } catch (error) { next(error); }
});

authRouter.post('/login', async (request, response, next) => {
  try {
    requireMongo();
    const { email, password } = request.body as { email?: string; password?: string };
    const user = email ? await User.findOne({ email: email.toLowerCase() }).select('+passwordHash') : null;
    if (!user || !password || !(await verifyPassword(password, user.passwordHash))) throw new AppError(401, 'Invalid email or password.');
    const token = createAccessToken(String(user._id));
    response.cookie(TOKEN_NAME, token, authCookie(token)).json({ user: presentUser(user) });
  } catch (error) { next(error); }
});

authRouter.post('/logout', (_request, response) => response.clearCookie(TOKEN_NAME).status(204).send());
authRouter.get('/me', requireAuth, async (request, response, next) => {
  try {
    requireMongo();
    const user = await User.findById(request.auth!.userId);
    if (!user) throw new AppError(404, 'User not found.');
    response.json({ user: presentUser(user) });
  } catch (error) { next(error); }
});
