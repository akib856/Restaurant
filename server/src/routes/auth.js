import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { validate } from '../middleware/validate.js';
import { ah } from '../middleware/error.js';
import { registerSchema, loginSchema } from '../validators/schemas.js';
import { COOKIE, cookieOpts, sign, requireAuth } from '../middleware/auth.js';
const r = Router();
const limiter = rateLimit({ windowMs: 15 * 60e3, limit: 20, standardHeaders: true, legacyHeaders: false });

r.post('/register', limiter, validate(registerSchema), ah(async (req, res) => {
  const { name, email, phone, password } = req.valid;   // role is never accepted from input
  if (await User.exists({ email })) return res.status(409).json({ success: false, message: 'Email already registered' });
  const user = await User.create({ name, email, phone, passwordHash: await bcrypt.hash(password, 12) });
  res.cookie(COOKIE, sign(user), cookieOpts).status(201).json({ success: true, data: user.toSafe() });
}));
r.post('/login', limiter, validate(loginSchema), ah(async (req, res) => {
  const user = await User.findOne({ email: req.valid.email }).select('+passwordHash');
  const ok = user && user.status === 'active' && await bcrypt.compare(req.valid.password, user.passwordHash);
  if (!ok) return res.status(401).json({ success: false, message: 'Invalid email or password' });
  res.cookie(COOKIE, sign(user), cookieOpts).json({ success: true, data: user.toSafe() });
}));
r.post('/logout', (req, res) => res.clearCookie(COOKIE, { ...cookieOpts, maxAge: undefined }).json({ success: true }));
r.get('/me', (req, res) => res.json({ success: true, data: req.user ? req.user.toSafe() : null }));
r.patch('/me', requireAuth, ah(async (req, res) => {
  const { name, phone, addresses } = req.body || {};
  if (typeof name === 'string' && name.trim().length >= 2) req.user.name = name.trim().slice(0, 80);
  if (typeof phone === 'string') req.user.phone = phone.trim().slice(0, 20);
  if (Array.isArray(addresses)) req.user.addresses = addresses.slice(0, 5).map((a) => ({
    label: String(a.label || '').slice(0, 30), line1: String(a.line1 || '').slice(0, 200),
    area: String(a.area || '').slice(0, 80), city: String(a.city || 'Dhaka').slice(0, 80) }));
  await req.user.save();
  res.json({ success: true, data: req.user.toSafe() });
}));
export default r;
