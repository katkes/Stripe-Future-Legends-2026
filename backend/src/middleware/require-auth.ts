import type { RequestHandler } from 'express';
import { AppError } from '../core/errors/app-error.js';
import { requireAuth as requireJwt } from '../features/auth/require-auth.js';
import { TOKEN_NAME } from '../features/auth/auth.service.js';
import type { AuthUser, UserRole } from '../features/auth/types.js';
import { User } from '../features/auth/user.model.js';

function toAuthUser(user: { _id: unknown; name: string; email?: string; role?: string; neighbourhood?: string }): AuthUser {
  return {
    id: String(user._id),
    role: user.role === 'vendor' ? 'vendor' : 'customer',
    displayName: user.name,
    neighbourhood: user.neighbourhood || 'Toronto, ON',
    email: user.email,
  };
}

const attachUser: RequestHandler = async (request, _response, next) => {
  try {
    if (!request.auth?.userId) {
      next();
      return;
    }
    const user = await User.findById(request.auth.userId);
    if (user) request.user = toAuthUser(user);
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth: RequestHandler = (request, response, next) => {
  const bearer = request.header('authorization')?.replace(/^Bearer\s+/i, '');
  const token = bearer || request.cookies?.[TOKEN_NAME];
  if (!token) {
    next();
    return;
  }
  requireJwt(request, response, (error) => {
    if (error) {
      next();
      return;
    }
    void attachUser(request, response, next);
  });
};

export const requireAuth: RequestHandler = (request, response, next) => {
  requireJwt(request, response, (error) => {
    if (error) {
      next(error);
      return;
    }
    void attachUser(request, response, (attachError) => {
      if (attachError) {
        next(attachError);
        return;
      }
      if (!request.user) {
        next(new AppError(401, 'Authentication is required.'));
        return;
      }
      next();
    });
  });
};

export function requireRole(role: UserRole): RequestHandler {
  return (request, _response, next) => {
    if (!request.user) {
      next(new AppError(401, 'Authentication is required.'));
      return;
    }
    if (request.user.role !== role) {
      next(new AppError(403, `This action is limited to ${role}s.`));
      return;
    }
    next();
  };
}
