import dotenv from 'dotenv';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const backendRoot = resolve(here, '../..');
dotenv.config({ path: [resolve(backendRoot, 'atlas-credentials.env'), resolve(backendRoot, '.env')], quiet: true });

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? '',
  mongoUsername: process.env.MONGODB_USERNAME ?? '',
  mongoPassword: process.env.MONGODB_PASSWORD ?? '',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET ?? '',
  ocrSpaceApiKey: process.env.OCR_SPACE_API_KEY ?? '',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  openaiBaseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
};
