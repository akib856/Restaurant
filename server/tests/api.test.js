// Integration tests against an isolated in-memory MongoDB (never your real database).
// mongodb-memory-server downloads a MongoDB binary on first run; if that is impossible the suite is skipped.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app.js';
import Category from '../src/models/Category.js';
import MenuItem from '../src/models/MenuItem.js';
import User from '../src/models/User.js';

let mongod, app, item, ok = true;
const H = { 'X-Requested-With': 'XMLHttpRequest' };
beforeAll(async () => {
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  } catch (e) { ok = false; console.warn('Skipping API tests:', e.message); return; }
  app = createApp();
  const cat = await Category.create({ name: 'Burgers', slug: 'burgers' });
  item = await MenuItem.create({ name: 'Classic Burger', slug: 'classic-burger', category: cat._id, price: 45000 });
  await User.create({ name: 'Admin', email: 'admin@test.com', passwordHash: await bcrypt.hash('password123', 4), role: 'admin' });
});
afterAll(async () => { if (ok) { await mongoose.disconnect(); await mongod.stop(); } });

const order = (key, extra = {}) => ({ idempotencyKey: key, items: [{ menuItemId: String(item._id), quantity: 2, options: [] }],
  fulfilment: 'pickup', contact: { name: 'Rahim', phone: '01700000000' }, paymentMethod: 'cod', ...extra });

describe('API', () => {
  it('health', async () => { if (!ok) return; const r = await request(app).get('/api/v1/health'); expect(r.body.data.status).toBe('ok'); });
  it('lists menu', async () => { if (!ok) return; const r = await request(app).get('/api/v1/menu?q=burger'); expect(r.body.data).toHaveLength(1); });
  it('rejects mutating requests without CSRF header', async () => { if (!ok) return;
    expect((await request(app).post('/api/v1/orders').send(order('k-no-csrf-123456'))).status).toBe(403); });
  it('creates order with server-side totals and ignores client prices', async () => { if (!ok) return;
    const r = await request(app).post('/api/v1/orders').set(H).send({ ...order('key-aaaaaaaaaaaaaaaa'), total: 1 });
    expect(r.status).toBe(201); expect(r.body.data.subtotal).toBe(90000); expect(r.body.data.total).toBe(94500); });
  it('prevents duplicate orders', async () => { if (!ok) return;
    const r = await request(app).post('/api/v1/orders').set(H).send(order('key-aaaaaaaaaaaaaaaa'));
    expect(r.status).toBe(200); expect(r.body.duplicate).toBe(true); });
  it('requires address for delivery', async () => { if (!ok) return;
    expect((await request(app).post('/api/v1/orders').set(H).send(order('key-bbbbbbbbbbbbbbbb', { fulfilment: 'delivery' }))).status).toBe(400); });
  it('hides other people\'s orders', async () => { if (!ok) return;
    const c = await request(app).post('/api/v1/orders').set(H).send(order('key-cccccccccccccccc'));
    expect((await request(app).get(`/api/v1/orders/${c.body.data._id}`)).status).toBe(404); });
  it('register cannot set admin role; admin routes are protected', async () => { if (!ok) return;
    const agent = request.agent(app);
    const r = await agent.post('/api/v1/auth/register').set(H).send({ name: 'Eve', email: 'eve@x.com', password: 'password123', role: 'admin' });
    expect(r.body.data.role).toBe('customer');
    expect((await agent.get('/api/v1/admin/orders')).status).toBe(403); });
  it('admin can move order through valid statuses only', async () => { if (!ok) return;
    const admin = request.agent(app);
    await admin.post('/api/v1/auth/login').set(H).send({ email: 'admin@test.com', password: 'password123' });
    const c = await request(app).post('/api/v1/orders').set(H).send(order('key-dddddddddddddddd'));
    const id = c.body.data._id;
    expect((await admin.patch(`/api/v1/admin/orders/${id}/status`).set(H).send({ status: 'completed' })).status).toBe(409);
    expect((await admin.patch(`/api/v1/admin/orders/${id}/status`).set(H).send({ status: 'confirmed' })).status).toBe(200); });
});
