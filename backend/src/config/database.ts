import mongoose from 'mongoose';
import { env } from './env.js';

/** Connect only after a MongoDB URI has been supplied by the platform workstream. */
export async function connectDatabase() {
  if (!env.mongoUri) { console.info('MongoDB is not configured; API is running in scaffold mode.'); return; }
  await mongoose.connect(env.mongoUri);
  console.info('Connected to MongoDB.');
}
