import { env } from '../../../config/env.js';
import { isMongoReady } from '../../../config/database.js';
import { AppError } from '../../../core/errors/app-error.js';
import { memoryStore } from '../../../shared/memory-store.js';
import type { AuthUser } from '../../auth/types.js';
import { ProductModel, PRODUCT_UNITS, type ProductUnit } from '../models/product.js';
import { VendorModel } from '../models/vendor.js';
import { createRecipientAccount, isStripeConfigured, recipientTransfersActive, getStripe } from '../../payments/stripe-client.js';

type PublicVendor = {
  id: string;
  name: string;
  bio: string;
  neighbourhood: string;
  payoutReady: boolean;
};

type PublicProduct = {
  id: string;
  vendorId: string;
  name: string;
  unit: string;
  priceCents: number;
  currency: string;
  stock: number;
  active: boolean;
};

function publicVendor(vendor: { id?: string; _id?: unknown; name: string; bio?: string; neighbourhood?: string; payoutReady?: boolean }): PublicVendor {
  return {
    id: vendor.id ?? String(vendor._id),
    name: vendor.name,
    bio: vendor.bio ?? '',
    neighbourhood: vendor.neighbourhood ?? 'Toronto, ON',
    payoutReady: Boolean(vendor.payoutReady),
  };
}

function publicProduct(product: {
  id?: string;
  _id?: unknown;
  name: string;
  unit: string;
  priceCents: number;
  currency?: string;
  stock: number;
  active?: boolean;
  vendorId: unknown;
}): PublicProduct {
  return {
    id: product.id ?? String(product._id),
    vendorId: String(product.vendorId),
    name: product.name,
    unit: product.unit,
    priceCents: product.priceCents,
    currency: product.currency ?? 'cad',
    stock: product.stock,
    active: product.active !== false,
  };
}

async function connectVendorToStripe(name: string, email: string) {
  let stripeAccountId = env.stripeConnectedAccountId;
  let payoutReady = Boolean(stripeAccountId);
  if (!stripeAccountId && isStripeConfigured()) {
    try {
      const account = await createRecipientAccount(name, email);
      stripeAccountId = account.id;
      payoutReady = recipientTransfersActive(account) || env.nodeEnv !== 'production';
    } catch (error) {
      console.warn('Could not create a Stripe connected account for this vendor.', error);
    }
  }
  return { stripeAccountId: stripeAccountId ?? '', payoutReady };
}

export async function listVendors() {
  if (!isMongoReady()) return [...memoryStore.vendors].sort((a, b) => a.name.localeCompare(b.name)).map(publicVendor);
  const vendors = await VendorModel.find().sort({ name: 1 });
  return vendors.map(publicVendor);
}

export async function getVendorStore(vendorId: string) {
  if (!isMongoReady()) {
    const vendor = memoryStore.findVendorById(vendorId);
    if (!vendor) throw new AppError(404, 'Farm not found.');
    return {
      vendor: publicVendor(vendor),
      products: memoryStore.productsForVendor(vendor.id, true).map(publicProduct),
    };
  }
  const vendor = await VendorModel.findById(vendorId);
  if (!vendor) throw new AppError(404, 'Farm not found.');
  const products = await ProductModel.find({ vendorId: vendor._id, active: true }).sort({ name: 1 });
  return { vendor: publicVendor(vendor), products: products.map(publicProduct) };
}

export async function getMyVendor(user: AuthUser) {
  if (!isMongoReady()) {
    const vendor = memoryStore.findVendorByUserId(user.id);
    if (!vendor) return undefined;
    return {
      vendor: { ...publicVendor(vendor), stripeAccountId: vendor.stripeAccountId },
      products: memoryStore.productsForVendor(vendor.id).map(publicProduct),
    };
  }
  const vendor = await VendorModel.findOne({ userId: user.id });
  if (!vendor) return undefined;
  const products = await ProductModel.find({ vendorId: vendor._id }).sort({ name: 1 });
  return { vendor: { ...publicVendor(vendor), stripeAccountId: vendor.stripeAccountId }, products: products.map(publicProduct) };
}

export async function upsertMyVendor(user: AuthUser, body: { name?: string; bio?: string; neighbourhood?: string }) {
  const name = body.name?.trim() || user.displayName;
  const bio = body.bio?.trim() ?? '';
  const neighbourhood = body.neighbourhood?.trim() || user.neighbourhood;

  if (!isMongoReady()) {
    const existing = memoryStore.findVendorByUserId(user.id);
    if (existing) {
      existing.name = name;
      existing.bio = bio;
      existing.neighbourhood = neighbourhood;
      return getMyVendor(user);
    }
    const stripe = await connectVendorToStripe(name, user.email || `${user.id}@vendors.openbasket.local`);
    memoryStore.addVendor({ userId: user.id, name, bio, neighbourhood, ...stripe });
    return getMyVendor(user);
  }

  let vendor = await VendorModel.findOne({ userId: user.id });
  if (vendor) {
    vendor.name = name;
    vendor.bio = bio;
    vendor.neighbourhood = neighbourhood;
    await vendor.save();
    return getMyVendor(user);
  }
  const stripe = await connectVendorToStripe(name, user.email || `${user.id}@vendors.openbasket.local`);
  await VendorModel.create({ userId: user.id, name, bio, neighbourhood, ...stripe });
  return getMyVendor(user);
}

function parseUnit(value: unknown): ProductUnit {
  if (typeof value === 'string' && PRODUCT_UNITS.includes(value as ProductUnit)) return value as ProductUnit;
  throw new AppError(400, 'Unit must be lb, bunch, or each.');
}

export async function createProduct(
  user: AuthUser,
  body: { name?: string; unit?: unknown; priceCents?: unknown; stock?: unknown },
) {
  const name = body.name?.trim();
  if (!name) throw new AppError(400, 'Product name is required.');
  const priceCents = Number(body.priceCents);
  const stock = Number(body.stock);
  if (!Number.isInteger(priceCents) || priceCents < 1) throw new AppError(400, 'Price must be a whole number of cents.');
  if (!Number.isInteger(stock) || stock < 0) throw new AppError(400, 'Stock must be a whole number.');
  const unit = parseUnit(body.unit);

  if (!isMongoReady()) {
    const mine = memoryStore.findVendorByUserId(user.id);
    if (!mine) throw new AppError(400, 'Create your farm profile before adding produce.');
    return publicProduct(memoryStore.addProduct({ vendorId: mine.id, name, unit, priceCents, currency: 'cad', stock, active: true }));
  }

  const mine = await VendorModel.findOne({ userId: user.id });
  if (!mine) throw new AppError(400, 'Create your farm profile before adding produce.');
  const product = await ProductModel.create({
    vendorId: mine._id,
    name,
    unit,
    priceCents,
    currency: 'cad',
    stock,
    active: true,
  });
  return publicProduct(product);
}

export async function updateProduct(
  user: AuthUser,
  productId: string,
  body: { name?: string; unit?: unknown; priceCents?: unknown; stock?: unknown; active?: unknown },
) {
  const apply = <T extends { name: string; unit: string; priceCents: number; stock: number; active: boolean }>(product: T) => {
    if (body.name !== undefined) {
      const name = body.name.trim();
      if (!name) throw new AppError(400, 'Product name is required.');
      product.name = name;
    }
    if (body.unit !== undefined) product.unit = parseUnit(body.unit);
    if (body.priceCents !== undefined) {
      const priceCents = Number(body.priceCents);
      if (!Number.isInteger(priceCents) || priceCents < 1) throw new AppError(400, 'Price must be a whole number of cents.');
      product.priceCents = priceCents;
    }
    if (body.stock !== undefined) {
      const stock = Number(body.stock);
      if (!Number.isInteger(stock) || stock < 0) throw new AppError(400, 'Stock must be a whole number.');
      product.stock = stock;
    }
    if (body.active !== undefined) product.active = Boolean(body.active);
    return product;
  };

  if (!isMongoReady()) {
    const mine = memoryStore.findVendorByUserId(user.id);
    if (!mine) throw new AppError(404, 'Farm profile not found.');
    const product = memoryStore.products.find((item) => item.id === productId && item.vendorId === mine.id);
    if (!product) throw new AppError(404, 'Product not found.');
    return publicProduct(apply(product));
  }

  const mine = await VendorModel.findOne({ userId: user.id });
  if (!mine) throw new AppError(404, 'Farm profile not found.');
  const product = await ProductModel.findOne({ _id: productId, vendorId: mine._id });
  if (!product) throw new AppError(404, 'Product not found.');
  apply(product);
  await product.save();
  return publicProduct(product);
}

export async function archiveProduct(user: AuthUser, productId: string) {
  return updateProduct(user, productId, { active: false });
}

export async function loadCatalogForCheckout(productIds: string[]) {
  if (!isMongoReady()) {
    const products = productIds.map((id) => memoryStore.findProduct(id)).filter((product) => product && product.active);
    const vendorIds = [...new Set(products.map((product) => product!.vendorId))];
    const vendors = vendorIds.map((id) => memoryStore.findVendorById(id)).filter(Boolean);
    return {
      products: products.map((product) => publicProduct(product!)),
      vendors: vendors.map((vendor) => ({
        id: vendor!.id,
        name: vendor!.name,
        stripeAccountId: vendor!.stripeAccountId,
        payoutReady: vendor!.payoutReady,
      })),
    };
  }
  const products = await ProductModel.find({ _id: { $in: productIds }, active: true });
  const vendorIds = [...new Set(products.map((product) => String(product.vendorId)))];
  const vendors = await VendorModel.find({ _id: { $in: vendorIds } });
  return {
    products: products.map((product) => publicProduct(product)),
    vendors: vendors.map((vendor) => ({
      id: String(vendor._id),
      name: vendor.name,
      stripeAccountId: vendor.stripeAccountId ?? '',
      payoutReady: Boolean(vendor.payoutReady),
    })),
  };
}

export async function decrementStock(lines: { productId: string; quantity: number }[]) {
  for (const line of lines) {
    if (!isMongoReady()) {
      const product = memoryStore.findProduct(line.productId);
      if (product) product.stock = Math.max(0, product.stock - line.quantity);
      continue;
    }
    await ProductModel.updateOne({ _id: line.productId }, { $inc: { stock: -line.quantity } });
  }
}
