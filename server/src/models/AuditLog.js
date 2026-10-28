import mongoose from 'mongoose';
const s = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: String, entity: String, entityId: String, meta: mongoose.Schema.Types.Mixed,
}, { timestamps: true });
export default mongoose.model('AuditLog', s);
