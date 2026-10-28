import mongoose from 'mongoose';
const s = new mongoose.Schema({
  key: { type: String, default: 'main', unique: true },
  name: { type: String, default: 'Verdant Table' },
  tagline: { type: String, default: 'Seasonal plates, crafted with care' },
  phone: { type: String, default: '+880 1700-000000' },
  email: { type: String, default: 'hello@verdanttable.com' },
  address: { type: String, default: 'House 12, Road 7, Gulshan 1, Dhaka' },
  openingHours: { type: String, default: 'Daily 11:00 AM - 11:00 PM' },
  deliveryFee: { type: Number, default: 6000 },
  freeDeliveryOver: { type: Number, default: 150000 },
  minOrder: { type: Number, default: 30000 },
  taxRate: { type: Number, default: 0.05 },
  codEnabled: { type: Boolean, default: true },
  pickupEnabled: { type: Boolean, default: true },
  pickupInstructions: { type: String, default: 'Collect at the front counter. Ready in ~25 minutes.' },
  // Social links shown in the footer; empty hides the icon. Only https links allowed.
  facebookUrl: { type: String, default: 'https://facebook.com', match: /^(https:\/\/\S+)?$/ },
  instagramUrl: { type: String, default: 'https://instagram.com', match: /^(https:\/\/\S+)?$/ },
  xUrl: { type: String, default: 'https://x.com', match: /^(https:\/\/\S+)?$/ },
}, { timestamps: true });
s.statics.get = async function () {
  return (await this.findOne({ key: 'main' })) || this.create({ key: 'main' });
};
export default mongoose.model('Settings', s);
