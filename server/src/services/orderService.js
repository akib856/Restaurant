import crypto from 'node:crypto';
import MenuItem from '../models/MenuItem.js';
import Coupon from '../models/Coupon.js';
import Settings from '../models/Settings.js';
import Order from '../models/Order.js';
import { priceLine, computeTotals, PricingError } from './pricing.js';

const orderNumber = () => 'VT-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' +
  crypto.randomBytes(3).toString('hex').toUpperCase();

export async function quote({ items, fulfilment, couponCode }) {
  const settings = await Settings.get();
  if (fulfilment === 'pickup' && !settings.pickupEnabled) throw new PricingError('Pickup is unavailable');
  const ids = [...new Set(items.map((i) => i.menuItemId))];
  const docs = await MenuItem.find({ _id: { $in: ids } }).lean();
  const byId = new Map(docs.map((d) => [String(d._id), d]));
  const lines = items.map((i) => priceLine(byId.get(i.menuItemId), i.quantity, i.options));
  const coupon = couponCode ? await Coupon.findOne({ code: couponCode.toUpperCase() }).lean() : null;
  if (couponCode && !coupon) throw new PricingError('Invalid coupon code');
  return { lines, settings, coupon, totals: computeTotals({ lines, fulfilment, settings, coupon }) };
}

export async function createOrder(input, user) {
  const existing = await Order.findOne({ idempotencyKey: input.idempotencyKey });
  if (existing) return { order: existing, duplicate: true };
  const { lines, settings, coupon, totals } = await quote(input);
  if (input.paymentMethod === 'cod' && !settings.codEnabled) throw new PricingError('Cash on delivery is unavailable');
  const status = input.paymentMethod === 'online' ? 'pending_payment' : 'pending_confirmation';
  const guestToken = user ? undefined : crypto.randomBytes(24).toString('hex');
  try {
    const order = await Order.create({
      orderNumber: orderNumber(), customer: user?._id, guestToken,
      contact: input.contact, fulfilment: input.fulfilment,
      address: input.fulfilment === 'delivery' ? input.address : undefined,
      notes: input.notes, items: lines, ...totals, couponCode: coupon?.code,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentMethod === 'online' ? 'pending' : 'unpaid',
      status, statusHistory: [{ status, at: new Date() }],
      idempotencyKey: input.idempotencyKey,
    });
    if (coupon) await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } });
    await Promise.all(lines.map((l) => MenuItem.updateOne({ _id: l.menuItem }, { $inc: { soldCount: l.quantity } })));
    return { order, guestToken, duplicate: false };
  } catch (e) {
    if (e.code === 11000 && e.keyPattern?.idempotencyKey) {
      return { order: await Order.findOne({ idempotencyKey: input.idempotencyKey }), duplicate: true };
    }
    throw e;
  }
}
