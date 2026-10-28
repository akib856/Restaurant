import mongoose from 'mongoose';
import { ORDER_STATUSES } from '../services/orderStatus.js';
const item = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name: String, imageUrl: String,
  options: [{ group: String, choice: String, priceDelta: Number }],
  quantity: Number, unitPrice: Number, lineTotal: Number,
}, { _id: false });
const s = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  guestToken: { type: String, select: false },
  contact: { name: String, phone: String, email: String },
  fulfilment: { type: String, enum: ['delivery', 'pickup'], required: true },
  address: { line1: String, area: String, city: String, instructions: String },
  notes: String,
  items: [item],
  subtotal: Number, deliveryFee: Number, discount: Number, tax: Number, total: Number,
  currency: { type: String, default: 'BDT' },
  couponCode: String,
  paymentMethod: { type: String, enum: ['cod', 'online'], required: true },
  paymentStatus: { type: String, enum: ['unpaid', 'pending', 'paid', 'failed', 'refunded'], default: 'unpaid' },
  status: { type: String, enum: ORDER_STATUSES, required: true },
  statusHistory: [{ status: String, at: Date, by: mongoose.Schema.Types.ObjectId }],
  idempotencyKey: { type: String, required: true, unique: true },
}, { timestamps: true });
export default mongoose.model('Order', s);
