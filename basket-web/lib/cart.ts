import type { Cart, CartItem, Product, Vendor } from './types';

const KEY = 'openbasket_cart';

export function readCart(): Cart | undefined {
  if (typeof window === 'undefined') return undefined;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as Cart;
  } catch {
    return undefined;
  }
}

export function writeCart(cart: Cart | undefined) {
  if (typeof window === 'undefined') return;
  if (!cart || cart.items.length === 0) window.localStorage.removeItem(KEY);
  else window.localStorage.setItem(KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('openbasket-cart'));
}

export function cartCount(cart = readCart()) {
  return cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
}

export function addToCart(vendor: Vendor, product: Product, quantity = 1): { replaced: boolean } {
  const qty = Math.min(Math.max(1, Math.floor(quantity) || 1), Math.max(1, product.stock));
  const current = readCart();
  if (current && current.vendorId !== vendor.id) {
    const ok = window.confirm(`Your cart is from ${current.vendorName}. Replace it with items from ${vendor.name}?`);
    if (!ok) return { replaced: false };
    writeCart({
      vendorId: vendor.id,
      vendorName: vendor.name,
      items: [{ productId: product.id, name: product.name, unit: product.unit, priceCents: product.priceCents, quantity: qty }],
    });
    return { replaced: true };
  }
  const items: CartItem[] = current?.items ?? [];
  const existing = items.find((item) => item.productId === product.id);
  if (existing) existing.quantity = Math.min(existing.quantity + qty, product.stock);
  else items.push({ productId: product.id, name: product.name, unit: product.unit, priceCents: product.priceCents, quantity: qty });
  writeCart({ vendorId: vendor.id, vendorName: vendor.name, items });
  return { replaced: false };
}

export function setQuantity(productId: string, quantity: number) {
  const cart = readCart();
  if (!cart) return;
  cart.items = cart.items
    .map((item) => (item.productId === productId ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);
  writeCart(cart.items.length ? cart : undefined);
}

export function clearCart() {
  writeCart(undefined);
}
