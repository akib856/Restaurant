import mongoose from 'mongoose';
// Prices are integers in minor units (poisha: 100 = 1 BDT)
const choice = new mongoose.Schema({ name: { type: String, required: true }, priceDelta: { type: Number, default: 0, min: 0 } });
const optionGroup = new mongoose.Schema({
  name: { type: String, required: true },      // e.g. "Size", "Toppings"
  type: { type: String, enum: ['single', 'multiple'], default: 'single' },
  required: { type: Boolean, default: false },
  choices: [choice],
});
const s = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  imageUrl: String,
  price: { type: Number, required: true, min: 0, validate: Number.isInteger },
  available: { type: Boolean, default: true },
  active: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  popular: { type: Boolean, default: false },
  dietary: [{ type: String, enum: ['vegetarian', 'vegan', 'spicy', 'halal', 'gluten-free'] }],
  options: [optionGroup],
  soldCount: { type: Number, default: 0 },
}, { timestamps: true });
s.index({ name: 'text', description: 'text' });
export default mongoose.model('MenuItem', s);
