import { app } from './app.js';
import { connectDatabase, isMongoReady } from './config/database.js';
import { env } from './config/env.js';
import { seedMarketplace } from './features/vendors/seed.js';

async function start() {
  await connectDatabase();
  try {
    await seedMarketplace();
    console.info(`Marketplace seed is ready (${isMongoReady() ? 'mongo' : 'memory'}).`);
  } catch (error) {
    console.warn('Marketplace seed skipped.', error);
  }
  app.listen(env.port, () => console.info(`OpenBasket API listening on port ${env.port}`));
}

void start();
