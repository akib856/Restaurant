import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { env, UPLOAD_DIR } from './config/env.js';
import { loadUser, csrfGuard } from './middleware/auth.js';
import { notFound, errorHandler } from './middleware/error.js';
import { noOperators } from './middleware/validate.js';
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use(noOperators);
  app.use(csrfGuard);
  app.use(loadUser);
  app.get('/api/v1/health', (_req, res) => res.json({ success: true, data: { status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' } }));
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1', menuRoutes);
  app.use('/api/v1', orderRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/uploads', express.static(UPLOAD_DIR, { fallthrough: false, maxAge: '30d', dotfiles: 'deny' }));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
