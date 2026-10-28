import mongoose from 'mongoose';
const s = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['percent', 'fixed'], required: true },
  value: { type: Number, required: true, min: 0 },
  maxDiscount: Number,
  minOrder: { type: Number, default: 0 },
  expiresAt: Date,
  usageLimit: Number,
  usedCount: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });
export default mongoose.model('Coupon', s);
