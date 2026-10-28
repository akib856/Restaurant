import mongoose from 'mongoose';
const addressSchema = new mongoose.Schema({ label: String, line1: String, area: String, city: String }, { _id: true });
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'staff', 'admin'], default: 'customer' },
  status: { type: String, enum: ['active', 'disabled'], default: 'active' },
  addresses: [addressSchema],
}, { timestamps: true });
userSchema.methods.toSafe = function () {
  const { _id, name, email, phone, role, status, addresses } = this;
  return { id: _id, name, email, phone, role, status, addresses };
};
export default mongoose.model('User', userSchema);
