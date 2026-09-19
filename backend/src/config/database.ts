import mongoose from 'mongoose';
import { AppError } from '../core/errors/app-error.js';
import { env } from './env.js';

function mongoUriLooksUsable(uri: string) {
  return Boolean(uri) && !uri.includes('<') && !uri.includes('cluster-host');
}

export function isMongoReady() {
  return mongoose.connection.readyState === 1;
}

export function requireMongo() {
  if (!isMongoReady()) {
    throw new AppError(
      503,
      'MongoDB Atlas is not connected. In Atlas → Network Access, add this computer’s IP (or 0.0.0.0/0 for a short local test), wait until the entry is Active, then restart npm run dev:api. Health at http://localhost:4000/health should show "mode":"mongo".',
    );
  }
}

/** Connect only when the local Atlas configuration supplies a database URI. */
export async function connectDatabase() {
  mongoose.set('bufferCommands', false);
  if (!mongoUriLooksUsable(env.mongoUri)) {
    console.info('MongoDB is not configured; marketplace will use in-memory storage.');
    return false;
  }
  try {
    await mongoose.connect(env.mongoUri, {
      user: env.mongoUsername || undefined,
      pass: env.mongoPassword || undefined,
      serverSelectionTimeoutMS: 5000,
    });
    console.info('Connected to MongoDB.');
    return true;
  } catch (error) {
    console.warn('MongoDB connection failed; marketplace will use in-memory storage.', error);
    return false;
  }
}
