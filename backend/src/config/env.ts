import dotenv from 'dotenv';
import { resolve } from 'node:path';

// `atlas-credentials.env` is intentionally ignored by Git. Its values take
// precedence over general local server settings when both files define a key.
dotenv.config({ path: [resolve(process.cwd(), 'atlas-credentials.env'), resolve(process.cwd(), '.env')], quiet: true });

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? '',
  mongoUsername: process.env.MONGODB_USERNAME ?? '',
  mongoPassword: process.env.MONGODB_PASSWORD ?? '',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET ?? '',
  ocrSpaceApiKey: process.env.OCR_SPACE_API_KEY ?? '',
};
