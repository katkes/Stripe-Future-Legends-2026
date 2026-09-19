export const USER_ROLES = ['customer', 'vendor'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type AuthUser = {
  id: string;
  role: UserRole;
  displayName: string;
  neighbourhood: string;
  email?: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
