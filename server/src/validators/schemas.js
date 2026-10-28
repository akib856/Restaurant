import { z } from 'zod';
const objectId = z.string().regex(/^[a-f0-9]{24}$/i);
export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().min(6).max(20).optional(),
  password: z.string().min(8).max(100),
});
export const loginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(100) });
const itemSchema = z.object({
  menuItemId: objectId,
  quantity: z.number().int().min(1).max(50),
  options: z.array(z.object({ group: z.string().max(60), choice: z.string().max(60) })).max(20).default([]),
});
export const quoteSchema = z.object({
  items: z.array(itemSchema).min(1).max(50),
  fulfilment: z.enum(['delivery', 'pickup']),
  couponCode: z.string().trim().max(30).optional().or(z.literal('').transform(() => undefined)),
});
export const orderSchema = quoteSchema.extend({
  idempotencyKey: z.string().min(16).max(100),
  contact: z.object({
    name: z.string().trim().min(2).max(80),
    phone: z.string().trim().regex(/^[+0-9 -]{6,20}$/),
    email: z.string().trim().email().optional().or(z.literal('').transform(() => undefined)),
  }),
  address: z.object({ line1: z.string().trim().min(3).max(200), area: z.string().trim().max(80).optional(),
    city: z.string().trim().max(80).default('Dhaka'), instructions: z.string().max(300).optional() }).optional(),
  notes: z.string().max(500).optional(),
  paymentMethod: z.enum(['cod', 'online']),
}).refine((o) => o.fulfilment !== 'delivery' || o.address, { message: 'Delivery address is required', path: ['address'] });
export const statusSchema = z.object({ status: z.string() });
export const menuItemSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().max(1000).default(''),
  category: objectId,
  imageUrl: z.union([z.string().url(), z.string().regex(/^\/api\/v1\/uploads\/[\w-]+\.(jpg|png|webp)$/)]).optional(),
  price: z.number().int().min(0),
  available: z.boolean().default(true),
  featured: z.boolean().default(false),
  popular: z.boolean().default(false),
  dietary: z.array(z.enum(['vegetarian', 'vegan', 'spicy', 'halal', 'gluten-free'])).default([]),
  options: z.array(z.object({ name: z.string(), type: z.enum(['single', 'multiple']), required: z.boolean(),
    choices: z.array(z.object({ name: z.string(), priceDelta: z.number().int().min(0) })) })).default([]),
});
export const couponSchema = z.object({
  code: z.string().trim().min(3).max(30), type: z.enum(['percent', 'fixed']), value: z.number().min(0),
  maxDiscount: z.number().int().optional(), minOrder: z.number().int().default(0),
  expiresAt: z.coerce.date().optional(), usageLimit: z.number().int().optional(), active: z.boolean().default(true),
});
