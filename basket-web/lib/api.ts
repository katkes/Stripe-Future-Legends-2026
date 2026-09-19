import type { AuthUser, UserRole } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  neighbourhood?: string;
};

export function toAuthUser(user: SessionUser): AuthUser {
  return {
    id: user.id,
    role: user.role === 'vendor' ? 'vendor' : 'customer',
    displayName: user.name,
    neighbourhood: user.neighbourhood || 'Toronto, ON',
    email: user.email,
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (response.status === 204) return undefined as T;
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

export const api = {
  signup: (body: { name: string; email: string; password: string; role: UserRole }) =>
    request<{ user: SessionUser }>('/api/v1/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<{ user: SessionUser }>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request<void>('/api/v1/auth/logout', { method: 'POST' }),
  me: () => request<{ user: SessionUser }>('/api/v1/auth/me'),
  vendors: () => request<{ vendors: import('./types').Vendor[] }>('/api/v1/vendors'),
  vendor: (id: string) =>
    request<{ vendor: import('./types').Vendor; products: import('./types').Product[] }>(`/api/v1/vendors/${id}`),
  myFarm: () =>
    request<{ vendor: import('./types').Vendor; products: import('./types').Product[] }>('/api/v1/vendors/me'),
  saveFarm: (body: { name: string; bio: string; neighbourhood: string }) =>
    request<{ vendor: import('./types').Vendor; products: import('./types').Product[] }>('/api/v1/vendors/me', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  createProduct: (body: { name: string; unit: string; priceCents: number; stock: number }) =>
    request<{ product: import('./types').Product }>('/api/v1/vendors/me/products', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateProduct: (id: string, body: Record<string, unknown>) =>
    request<{ product: import('./types').Product }>(`/api/v1/vendors/me/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  archiveProduct: (id: string) =>
    request<{ product: import('./types').Product }>(`/api/v1/vendors/me/products/${id}`, { method: 'DELETE' }),
  checkout: (items: { productId: string; quantity: number }[]) =>
    request<{ url: string; applicationFeeCents: number; subtotalCents: number }>('/api/v1/payments/checkout-sessions', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),
};

export function money(cents: number) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(cents / 100);
}
