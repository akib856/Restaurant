import mongoose from 'mongoose';
const s = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  provider: { type: String, required: true },
  transactionId: { type: String, unique: true, sparse: true },
  amount: Number, currency: String,
  status: { type: String, enum: ['initiated', 'paid', 'failed', 'refunded'], default: 'initiated' },
  verification: mongoose.Schema.Types.Mixed,
  processedEvents: [String],
}, { timestamps: true });
export default mongoose.model('Payment', s);
