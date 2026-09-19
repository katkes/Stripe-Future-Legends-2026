import { env } from '../../config/env.js';
import { isMongoReady } from '../../config/database.js';
import { hashPassword } from '../auth/auth.service.js';
import { UserModel } from '../auth/models/user.js';
import { memoryStore } from '../../shared/memory-store.js';
import { ProductModel } from './models/product.js';
import { VendorModel } from './models/vendor.js';

const SEED_VENDOR_EMAIL = 'greenacres@openbasket.local';
const SEED_VENDOR_PASSWORD = 'openbasket-dev';

const seedProducts = [
  { name: 'Baby spinach', unit: 'bunch', priceCents: 399, stock: 24 },
  { name: 'Roma tomatoes', unit: 'lb', priceCents: 452, stock: 40 },
  { name: 'Sourdough loaf', unit: 'each', priceCents: 549, stock: 12 },
  { name: 'Farm eggs', unit: 'each', priceCents: 799, stock: 18 },
];

function seedMemory() {
  if (memoryStore.users.some((user) => user.email === SEED_VENDOR_EMAIL)) return;
  const vendorUser = memoryStore.addUser({
    role: 'vendor',
    displayName: 'Green Acres Farm',
    neighbourhood: 'Toronto, ON',
    email: SEED_VENDOR_EMAIL,
  });
  const vendor = memoryStore.addVendor({
    userId: vendorUser.id,
    name: 'Green Acres Farm',
    bio: 'A neighbourhood farm stall for greens, roots, and eggs.',
    neighbourhood: 'Toronto, ON',
    stripeAccountId: env.stripeConnectedAccountId,
    payoutReady: Boolean(env.stripeConnectedAccountId) || env.nodeEnv !== 'production',
  });
  for (const product of seedProducts) {
    memoryStore.addProduct({
      vendorId: vendor.id,
      name: product.name,
      unit: product.unit,
      priceCents: product.priceCents,
      currency: 'cad',
      stock: product.stock,
      active: true,
    });
  }
}

export async function seedMarketplace() {
  if (!isMongoReady()) {
    seedMemory();
    return;
  }

  let vendorUser = await UserModel.findOne({ email: SEED_VENDOR_EMAIL });
  if (!vendorUser) {
    vendorUser = await UserModel.create({
      name: 'Green Acres Farm',
      email: SEED_VENDOR_EMAIL,
      passwordHash: await hashPassword(SEED_VENDOR_PASSWORD),
      role: 'vendor',
      neighbourhood: 'Toronto, ON',
    });
  }

  let vendor = await VendorModel.findOne({ userId: vendorUser._id });
  if (!vendor) {
    vendor = await VendorModel.create({
      userId: vendorUser._id,
      name: 'Green Acres Farm',
      bio: 'A neighbourhood farm stall for greens, roots, and eggs.',
      neighbourhood: 'Toronto, ON',
      stripeAccountId: env.stripeConnectedAccountId,
      payoutReady: Boolean(env.stripeConnectedAccountId) || env.nodeEnv !== 'production',
    });
  } else if (env.stripeConnectedAccountId && vendor.stripeAccountId !== env.stripeConnectedAccountId) {
    vendor.stripeAccountId = env.stripeConnectedAccountId;
    vendor.payoutReady = true;
    await vendor.save();
  }

  const existing = await ProductModel.countDocuments({ vendorId: vendor._id });
  if (existing === 0) {
    await ProductModel.insertMany(
      seedProducts.map((product) => ({
        vendorId: vendor._id,
        name: product.name,
        unit: product.unit,
        priceCents: product.priceCents,
        currency: 'cad',
        stock: product.stock,
        active: true,
      })),
    );
  }
}
