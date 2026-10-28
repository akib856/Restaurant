import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';
try {
  await connectDB(env.mongoUri);
} catch (e) {
  console.error('Could not connect to MongoDB:', e.message);
  process.exit(1);
}
createApp().listen(env.port, () => console.log(`API running on http://localhost:${env.port}/api/v1/health`));
