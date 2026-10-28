import { z } from 'zod';
export const checkoutSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  phone: z.string().trim().regex(/^[+0-9 -]{6,20}$/, 'Enter a valid phone number'),
  email: z.string().trim().email('Invalid email').optional().or(z.literal('')),
  fulfilment: z.enum(['delivery', 'pickup']),
  line1: z.string().optional(), area: z.string().optional(), instructions: z.string().max(300).optional(),
  notes: z.string().max(500).optional(),
  paymentMethod: z.enum(['cod', 'online']),
}).refine((v) => v.fulfilment !== 'delivery' || (v.line1 && v.line1.trim().length >= 3), { message: 'Enter your delivery address', path: ['line1'] });
