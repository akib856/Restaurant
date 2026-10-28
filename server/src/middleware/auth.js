import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
export const COOKIE = 'vt_session';
export const cookieOpts = { httpOnly: true, sameSite: 'strict', secure: env.nodeEnv === 'production', maxAge: 7 * 864e5 };
export const sign = (user) => jwt.sign({ sub: String(user._id) }, env.jwtSecret, { expiresIn: '7d' });

export async function loadUser(req, _res, next) {
  const t = req.cookies?.[COOKIE];
  if (t) {
    try {
      const { sub } = jwt.verify(t, env.jwtSecret);
      const u = await User.findById(sub);
      if (u && u.status === 'active') req.user = u;
    } catch { /* invalid token -> anonymous */ }
  }
  next();
}
export const requireAuth = (req, res, next) => req.user ? next() : res.status(401).json({ success: false, message: 'Please log in' });
export const requireRole = (...roles) => (req, res, next) =>
  req.user && roles.includes(req.user.role) ? next() : res.status(403).json({ success: false, message: 'Forbidden' });

// CSRF: cookies are SameSite=strict, and every state-changing request must carry a custom header,
// which browsers will not send cross-site without a CORS preflight that we reject.
export function csrfGuard(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method) || req.path.startsWith('/api/v1/payments/webhook')) return next();
  if (req.get('X-Requested-With') !== 'XMLHttpRequest') return res.status(403).json({ success: false, message: 'CSRF check failed' });
  next();
}
