import express, { Router } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { UPLOAD_DIR } from '../config/env.js';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import Settings from '../models/Settings.js';
import AuditLog from '../models/AuditLog.js';
import { requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ah } from '../middleware/error.js';
import { statusSchema, menuItemSchema, couponSchema } from '../validators/schemas.js';
import { canTransition } from '../services/orderStatus.js';
import { slugify, escapeRegex } from '../utils/slugify.js';
import { audit } from '../utils/audit.js';
const r = Router();
r.use(requireRole('admin', 'staff'));
const adminOnly = requireRole('admin');

// Revenue = sum of totals of non-cancelled orders whose payment is 'paid'.
r.get('/stats', ah(async (req, res) => {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const days = Math.min(90, parseInt(req.query.days) || 7);
  const since = new Date(Date.now() - days * 864e5);
  const [ordersToday, pending, paid, unpaid, revenueAgg, popular, recent, daily] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: start } }),
    Order.countDocuments({ status: { $in: ['pending_confirmation', 'pending_payment'] } }),
    Order.countDocuments({ paymentStatus: 'paid' }),
    Order.countDocuments({ paymentStatus: { $in: ['unpaid', 'pending'] }, status: { $ne: 'cancelled' } }),
    Order.aggregate([{ $match: { paymentStatus: 'paid', status: { $ne: 'cancelled' }, createdAt: { $gte: since } } },
      { $group: { _id: null, total: { $sum: '$total' } } }]),
    MenuItem.find({ active: true }).sort('-soldCount').limit(5).select('name soldCount').lean(),
    Order.find().sort('-createdAt').limit(8).lean(),
    Order.aggregate([{ $match: { paymentStatus: 'paid', status: { $ne: 'cancelled' }, createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } }]),
  ]);
  res.json({ success: true, data: { ordersToday, pending, paid, unpaid, revenue: revenueAgg[0]?.total || 0, popular, recent, daily, days } });
}));

r.get('/orders', ah(async (req, res) => {
  const { status, fulfilment, paymentStatus, q, from, to, page = '1' } = req.query;
  const f = {};
  if (typeof status === 'string' && status) f.status = status;
  if (typeof fulfilment === 'string' && fulfilment) f.fulfilment = fulfilment;
  if (typeof paymentStatus === 'string' && paymentStatus) f.paymentStatus = paymentStatus;
  if (typeof q === 'string' && q) f.$or = [{ orderNumber: { $regex: escapeRegex(q), $options: 'i' } },
    { 'contact.phone': { $regex: escapeRegex(q) } }, { 'contact.name': { $regex: escapeRegex(q), $options: 'i' } }];
  if (from || to) f.createdAt = { ...(from && { $gte: new Date(String(from)) }), ...(to && { $lte: new Date(String(to)) }) };
  const p = Math.max(1, parseInt(page) || 1);
  const [data, total] = await Promise.all([Order.find(f).sort('-createdAt').skip((p - 1) * 25).limit(25).lean(), Order.countDocuments(f)]);
  res.json({ success: true, data, meta: { total, page: p, limit: 25 } });
}));
r.patch('/orders/:id/status', validate(statusSchema), ah(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (!canTransition(order, req.valid.status))
    return res.status(409).json({ success: false, message: `Cannot change from ${order.status} to ${req.valid.status}` });
  const from = order.status;
  order.status = req.valid.status; order.statusHistory.push({ status: order.status, at: new Date(), by: req.user._id });
  await order.save(); audit(req, 'order.status', 'Order', order._id, { from, to: order.status });
  res.json({ success: true, data: order });
}));
r.post('/orders/:id/cash-collected', ah(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.paymentMethod !== 'cod' || order.paymentStatus === 'paid' || order.status === 'cancelled')
    return res.status(409).json({ success: false, message: 'Cash cannot be recorded for this order' });
  order.paymentStatus = 'paid'; await order.save();
  audit(req, 'order.cash_collected', 'Order', order._id, { amount: order.total });
  res.json({ success: true, data: order });
}));

// Menu
r.get('/menu', ah(async (_req, res) => res.json({ success: true, data: await MenuItem.find().populate('category', 'name').sort('name').lean() })));
r.post('/menu', adminOnly, validate(menuItemSchema), ah(async (req, res) => {
  const item = await MenuItem.create({ ...req.valid, slug: slugify(req.valid.name) + '-' + Date.now().toString(36) });
  audit(req, 'menu.create', 'MenuItem', item._id); res.status(201).json({ success: true, data: item });
}));
r.put('/menu/:id', adminOnly, validate(menuItemSchema), ah(async (req, res) => {
  const item = await MenuItem.findByIdAndUpdate(req.params.id, req.valid, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ success: false, message: 'Not found' });
  audit(req, 'menu.update', 'MenuItem', item._id); res.json({ success: true, data: item });
}));
r.patch('/menu/:id/flags', ah(async (req, res) => {
  const upd = {};
  for (const k of ['available', 'featured', 'active']) if (typeof req.body?.[k] === 'boolean') upd[k] = req.body[k];
  if ((upd.featured !== undefined || upd.active !== undefined) && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
  const item = await MenuItem.findByIdAndUpdate(req.params.id, upd, { new: true });
  if (!item) return res.status(404).json({ success: false, message: 'Not found' });
  audit(req, 'menu.flags', 'MenuItem', item._id, upd); res.json({ success: true, data: item });
}));

// Categories
r.get('/categories', ah(async (_req, res) => res.json({ success: true, data: await Category.find().sort('displayOrder').lean() })));
r.post('/categories', adminOnly, ah(async (req, res) => {
  const { name, description = '', imageUrl, displayOrder = 0, active = true } = req.body || {};
  if (typeof name !== 'string' || name.trim().length < 2) return res.status(400).json({ success: false, message: 'Name required' });
  const c = await Category.create({ name: name.trim(), slug: slugify(name), description: String(description), imageUrl, displayOrder: Number(displayOrder), active: Boolean(active) });
  audit(req, 'category.create', 'Category', c._id); res.status(201).json({ success: true, data: c });
}));
r.patch('/categories/:id', adminOnly, ah(async (req, res) => {
  const upd = {};
  for (const k of ['name', 'description', 'imageUrl']) if (typeof req.body?.[k] === 'string') upd[k] = req.body[k];
  if (typeof req.body?.displayOrder === 'number') upd.displayOrder = req.body.displayOrder;
  if (typeof req.body?.active === 'boolean') upd.active = req.body.active;
  const c = await Category.findByIdAndUpdate(req.params.id, upd, { new: true });
  audit(req, 'category.update', 'Category', req.params.id); res.json({ success: true, data: c });
}));

// Customers
r.get('/customers', adminOnly, ah(async (_req, res) => res.json({ success: true, data: (await User.find({ role: 'customer' }).sort('-createdAt').limit(200)).map((u) => u.toSafe()) })));
r.patch('/customers/:id/status', adminOnly, ah(async (req, res) => {
  const status = req.body?.status === 'disabled' ? 'disabled' : 'active';
  const u = await User.findOneAndUpdate({ _id: req.params.id, role: 'customer' }, { status }, { new: true });
  if (!u) return res.status(404).json({ success: false, message: 'Not found' });
  audit(req, 'customer.status', 'User', u._id, { status }); res.json({ success: true, data: u.toSafe() });
}));

// Coupons, settings, audit
r.get('/coupons', adminOnly, ah(async (_req, res) => res.json({ success: true, data: await Coupon.find().sort('-createdAt').lean() })));
r.post('/coupons', adminOnly, validate(couponSchema), ah(async (req, res) => {
  const c = await Coupon.create(req.valid); audit(req, 'coupon.create', 'Coupon', c._id); res.status(201).json({ success: true, data: c });
}));
r.get('/settings', adminOnly, ah(async (_req, res) => res.json({ success: true, data: await Settings.get() })));
r.put('/settings', adminOnly, ah(async (req, res) => {
  const allowed = ['name', 'tagline', 'phone', 'email', 'address', 'openingHours', 'deliveryFee', 'freeDeliveryOver', 'minOrder', 'taxRate', 'codEnabled', 'pickupEnabled', 'pickupInstructions', 'facebookUrl', 'instagramUrl', 'xUrl'];
  const upd = Object.fromEntries(Object.entries(req.body || {}).filter(([k]) => allowed.includes(k)));
  const s = await Settings.findOneAndUpdate({ key: 'main' }, upd, { new: true, upsert: true, runValidators: true });
  audit(req, 'settings.update', 'Settings', s._id, { keys: Object.keys(upd) }); res.json({ success: true, data: s });
}));
r.get('/audit', adminOnly, ah(async (_req, res) => res.json({ success: true, data: await AuditLog.find().sort('-createdAt').limit(100).populate('actor', 'name email').lean() })));
// Image upload: raw body, type checked by magic bytes (not just the header), random file name.
const IMAGE_TYPES = { 'image/jpeg': ['jpg', [0xff, 0xd8, 0xff]], 'image/png': ['png', [0x89, 0x50, 0x4e, 0x47]], 'image/webp': ['webp', [0x52, 0x49, 0x46, 0x46]] };
r.post('/uploads', adminOnly, express.raw({ type: Object.keys(IMAGE_TYPES), limit: '5mb' }), ah(async (req, res) => {
  const t = IMAGE_TYPES[req.headers['content-type']];
  const buf = req.body;
  if (!t || !Buffer.isBuffer(buf) || !t[1].every((b, i) => buf[i] === b)) return res.status(400).json({ success: false, message: 'Please choose a JPG, PNG or WebP image' });
  const name = `${crypto.randomUUID()}.${t[0]}`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
  res.status(201).json({ success: true, data: { url: `/api/v1/uploads/${name}` } });
}));

export default r;
