// Configuration centralisée. Les valeurs sensibles viennent uniquement du fichier .env (non versionné).
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/bivyswiss',
  tileCacheDir: path.resolve(serverRoot, process.env.TILE_CACHE_DIR ?? './data/tiles'),
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? '',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL ?? '',
  },
};

export const isProduction = env.nodeEnv === 'production';
