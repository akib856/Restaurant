import 'dotenv/config';
import { fileURLToPath } from 'node:url';
// Uploaded dish images live in server/uploads (served at /api/v1/uploads).
export const UPLOAD_DIR = fileURLToPath(new URL('../../uploads', import.meta.url));
export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/restaurant',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret',
  paymentProvider: process.env.PAYMENT_PROVIDER || '',
};
if (env.nodeEnv === 'production' && env.jwtSecret === 'dev-only-secret') {
  throw new Error('JWT_SECRET must be set in production');
}
