import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import Order from '../models/Order.js';
import { validate } from '../middleware/validate.js';
import { ah } from '../middleware/error.js';
import { requireAuth } from '../middleware/auth.js';
import { quoteSchema, orderSchema } from '../validators/schemas.js';
import { quote, createOrder } from '../services/orderService.js';
import { customerCanCancel } from '../services/orderStatus.js';
import { getProvider } from '../services/payments.js';
const r = Router();
const orderLimiter = rateLimit({ windowMs: 10 * 60e3, limit: 30 });
const GUEST = 'vt_guest_orders';

r.post('/orders/quote', validate(quoteSchema), ah(async (req, res) => {
  const { lines, totals } = await quote(req.valid);
  res.json({ success: true, data: { lines, ...totals } });
}));

r.post('/orders', orderLimiter, validate(orderSchema), ah(async (req, res) => {
  const { order, guestToken, duplicate } = await createOrder(req.valid, req.user);
  if (guestToken) {
    // remember guest's orders in an httpOnly cookie so only this browser can view them
    const prev = (req.cookies?.[GUEST] || '').split(',').filter(Boolean).slice(-9);
    res.cookie(GUEST, [...prev, `${order._id}:${guestToken}`].join(','), { httpOnly: true, sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production', maxAge: 30 * 864e5 });
  }
  res.status(duplicate ? 200 : 201).json({ success: true, data: order, duplicate });
}));

r.get('/orders/mine', requireAuth, ah(async (req, res) => {
  res.json({ success: true, data: await Order.find({ customer: req.user._id }).sort('-createdAt').limit(50).lean() });
}));

async function loadOwnOrder(req) {
  const order = await Order.findById(req.params.id).select('+guestToken');
  if (!order) return null;
  if (req.user && (String(order.customer) === String(req.user._id) || ['admin', 'staff'].includes(req.user.role))) return order;
  const pairs = (req.cookies?.[GUEST] || '').split(',');
  if (order.guestToken && pairs.includes(`${order._id}:${order.guestToken}`)) return order;
  return null;
}
r.get('/orders/:id', ah(async (req, res) => {
  const order = await loadOwnOrder(req);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  const o = order.toObject(); delete o.guestToken; delete o.idempotencyKey;
  res.json({ success: true, data: o });
}));
r.post('/orders/:id/cancel', ah(async (req, res) => {
  const order = await loadOwnOrder(req);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (!customerCanCancel(order)) return res.status(409).json({ success: false, message: 'This order can no longer be cancelled' });
  order.status = 'cancelled'; order.statusHistory.push({ status: 'cancelled', at: new Date(), by: req.user?._id });
  await order.save();
  res.json({ success: true, data: { id: order._id, status: order.status } });
}));

r.post('/payments/init/:id', ah(async (req, res) => {
  const order = await loadOwnOrder(req);
  if (!order || order.paymentMethod !== 'online') return res.status(404).json({ success: false, message: 'Order not found' });
  const provider = getProvider();            // 503 until a real provider is configured
  const { redirectUrl } = await provider.init(order);
  res.json({ success: true, data: { redirectUrl } });
}));
r.post('/payments/webhook/:provider', ah(async (req, res) => {
  const provider = getProvider();
  await provider.handleWebhook(req);         // must verify signature, amount, currency, and dedupe event IDs
  res.json({ success: true });
}));
export default r;
