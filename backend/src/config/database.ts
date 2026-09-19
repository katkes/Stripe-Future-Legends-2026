import mongoose from 'mongoose';
import { env } from './env.js';
import { AppError } from '../core/errors/app-error.js';

const MONGO_HINT = 'Allow this machine’s IP in Atlas Network Access, confirm backend/atlas-credentials.env, then restart the API.';

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

export function assertDatabaseConnected() {
  if (!isDatabaseConnected()) {
    throw new AppError(503, `MongoDB is not connected. Sign-in needs Atlas. ${MONGO_HINT}`);
  }
}

/** Connect only when the local Atlas configuration supplies a database URI. */
export async function connectDatabase() {
  mongoose.set('bufferCommands', false);
  if (!env.mongoUri) { console.info('MongoDB is not configured; API is running in scaffold mode.'); return; }
  try {
    await mongoose.connect(env.mongoUri, {
      user: env.mongoUsername || undefined,
      pass: env.mongoPassword || undefined,
      serverSelectionTimeoutMS: 8000,
    });
    console.info('Connected to MongoDB.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown MongoDB error';
    console.warn(`MongoDB is unreachable (${message}). ${MONGO_HINT}`);
  }
}
