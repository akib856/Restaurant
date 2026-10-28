import { Router } from 'express';
import MenuItem from '../models/MenuItem.js';
import Category from '../models/Category.js';
import Settings from '../models/Settings.js';
import { ah } from '../middleware/error.js';
import { escapeRegex } from '../utils/slugify.js';
const r = Router();

r.get('/settings', ah(async (_req, res) => {
  const s = await Settings.get();
  const { name, tagline, phone, email, address, openingHours, deliveryFee, freeDeliveryOver, minOrder, taxRate,
    codEnabled, pickupEnabled, pickupInstructions, facebookUrl, instagramUrl, xUrl } = s;
  res.json({ success: true, data: { name, tagline, phone, email, address, openingHours, deliveryFee,
    freeDeliveryOver, minOrder, taxRate, codEnabled, pickupEnabled, pickupInstructions, facebookUrl, instagramUrl, xUrl,
    onlinePaymentEnabled: Boolean(process.env.PAYMENT_PROVIDER) } });
}));
r.get('/categories', ah(async (_req, res) => {
  res.json({ success: true, data: await Category.find({ active: true }).sort('displayOrder').lean() });
}));
r.get('/menu', ah(async (req, res) => {
  const { q, category, available, dietary, featured, sort, page = '1', limit = '24' } = req.query;
  const f = { active: true };
  if (typeof q === 'string' && q.trim()) f.name = { $regex: escapeRegex(q.trim().slice(0, 60)), $options: 'i' };
  if (typeof category === 'string' && category) {
    const c = await Category.findOne({ slug: category, active: true }).lean();
    if (!c) return res.json({ success: true, data: [], meta: { total: 0 } });
    f.category = c._id;
  }
  if (available === 'true') f.available = true;
  if (featured === 'true') f.featured = true;
  if (typeof dietary === 'string' && dietary) f.dietary = dietary;
  const sorts = { price_asc: { price: 1 }, price_desc: { price: -1 }, popular: { soldCount: -1 } };
  const p = Math.max(1, parseInt(page) || 1), l = Math.min(60, Math.max(1, parseInt(limit) || 24));
  const [data, total] = await Promise.all([
    MenuItem.find(f).populate('category', 'name slug').sort(sorts[sort] || { featured: -1, name: 1 })
      .skip((p - 1) * l).limit(l).lean(),
    MenuItem.countDocuments(f),
  ]);
  res.json({ success: true, data, meta: { total, page: p, limit: l } });
}));
r.get('/menu/:slug', ah(async (req, res) => {
  const item = await MenuItem.findOne({ slug: String(req.params.slug), active: true }).populate('category', 'name slug').lean();
  if (!item) return res.status(404).json({ success: false, message: 'Dish not found' });
  const related = await MenuItem.find({ category: item.category._id, _id: { $ne: item._id }, active: true }).limit(4).lean();
  res.json({ success: true, data: { ...item, related } });
}));
export default r;
