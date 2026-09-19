import mongoose from 'mongoose';
import { env } from './env.js';

/** Connect only when the local Atlas configuration supplies a database URI. */
export async function connectDatabase() {
  if (!env.mongoUri) { console.info('MongoDB is not configured; API is running in scaffold mode.'); return; }
  try {
    await mongoose.connect(env.mongoUri, {
      user: env.mongoUsername || undefined,
      pass: env.mongoPassword || undefined,
      serverSelectionTimeoutMS: 8000,
    });
    console.info('Connected to MongoDB.');
  } catch (error) {
    console.error('MongoDB connection failed; API is running in scaffold mode.', error);
  }
}
