import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(express.json({ limit: '200kb' }));
  app.use(cookieParser());
  if (env.nodeEnv !== 'test') app.use(morgan('dev', { skip: (req) => req.path.startsWith('/api/map/tiles') }));
  app.use('/images', express.static(path.join(publicDir, 'images'), { maxAge: '7d', fallthrough: false }));
  app.use('/api', apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
