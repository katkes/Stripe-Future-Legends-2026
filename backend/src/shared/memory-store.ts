import { randomUUID } from 'node:crypto';
import type { AuthUser, UserRole } from '../features/auth/types.js';

export type MemoryUser = AuthUser;
export type MemoryVendor = {
  id: string;
  userId: string;
  name: string;
  bio: string;
  neighbourhood: string;
  stripeAccountId: string;
  payoutReady: boolean;
};
export type MemoryProduct = {
  id: string;
  vendorId: string;
  name: string;
  unit: string;
  priceCents: number;
  currency: string;
  stock: number;
  active: boolean;
};
export type MemoryOrder = {
  id: string;
  customerId: string;
  vendorId: string;
  stripeSessionId: string;
  status: 'pending' | 'paid' | 'failed';
  currency: string;
  subtotalCents: number;
  applicationFeeCents: number;
  lines: { productId: string; name: string; unit: string; quantity: number; unitAmountCents: number }[];
};

const users: MemoryUser[] = [];
const vendors: MemoryVendor[] = [];
const products: MemoryProduct[] = [];
const orders: MemoryOrder[] = [];

export const memoryStore = {
  users,
  vendors,
  products,
  orders,
  id: () => randomUUID(),
  findUserById: (id: string) => users.find((user) => user.id === id),
  addUser: (user: Omit<MemoryUser, 'id'> & { id?: string }) => {
    const created = { ...user, id: user.id ?? randomUUID() };
    users.push(created);
    return created;
  },
  findVendorById: (id: string) => vendors.find((vendor) => vendor.id === id),
  findVendorByUserId: (userId: string) => vendors.find((vendor) => vendor.userId === userId),
  addVendor: (vendor: Omit<MemoryVendor, 'id'> & { id?: string }) => {
    const created = { ...vendor, id: vendor.id ?? randomUUID() };
    vendors.push(created);
    return created;
  },
  productsForVendor: (vendorId: string, activeOnly = false) =>
    products.filter((product) => product.vendorId === vendorId && (!activeOnly || product.active)),
  addProduct: (product: Omit<MemoryProduct, 'id'> & { id?: string }) => {
    const created = { ...product, id: product.id ?? randomUUID() };
    products.push(created);
    return created;
  },
  findProduct: (id: string) => products.find((product) => product.id === id),
  findOrderBySession: (sessionId: string) => orders.find((order) => order.stripeSessionId === sessionId),
  addOrder: (order: Omit<MemoryOrder, 'id'> & { id?: string }) => {
    const created = { ...order, id: order.id ?? randomUUID() };
    orders.push(created);
    return created;
  },
};

export function toAuthUser(user: MemoryUser): AuthUser {
  return {
    id: user.id,
    role: user.role as UserRole,
    displayName: user.displayName,
    neighbourhood: user.neighbourhood,
    email: user.email,
  };
}
