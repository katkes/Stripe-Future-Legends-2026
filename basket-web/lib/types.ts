export type UserRole = 'customer' | 'vendor';

export type AuthUser = {
  id: string;
  role: UserRole;
  displayName: string;
  neighbourhood: string;
  email?: string;
};

export type Vendor = {
  id: string;
  name: string;
  bio: string;
  neighbourhood: string;
  payoutReady: boolean;
};

export type Product = {
  id: string;
  vendorId: string;
  name: string;
  unit: string;
  priceCents: number;
  currency: string;
  stock: number;
  active: boolean;
};

export type CartItem = {
  productId: string;
  name: string;
  unit: string;
  priceCents: number;
  quantity: number;
};

export type Cart = {
  vendorId: string;
  vendorName: string;
  items: CartItem[];
};
