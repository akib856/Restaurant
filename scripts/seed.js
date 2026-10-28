// Development seed: run with `npm run seed` from the project root. Wipes menu/categories (NOT orders).
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Category from '../server/src/models/Category.js';
import MenuItem from '../server/src/models/MenuItem.js';
import User from '../server/src/models/User.js';
import Settings from '../server/src/models/Settings.js';
import Coupon from '../server/src/models/Coupon.js';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/restaurant';
if (process.env.NODE_ENV === 'production') { console.error('Refusing to seed production'); process.exit(1); }
const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=75`;
const cats = [
  ['Burgers', 'photo-1568901346375-23c9450c58cd'], ['Pizza', 'photo-1513104890138-7c749659a591'],
  ['Rice Meals', 'photo-1603133872878-684f208fb84b'], ['Pasta', 'photo-1621996346565-e3dbc646d9a9'],
  ['Drinks', 'photo-1544145945-f90425340c7e'], ['Desserts', 'photo-1551024601-bec78aea704b'],
];
const size = (l) => ({ name: 'Size', type: 'single', required: true, choices: [{ name: 'Regular', priceDelta: 0 }, { name: 'Large', priceDelta: l }] });
const dishes = {
  Burgers: [['Smoked Beef Burger', 'Aged beef, smoked cheddar, caramelised onion, brioche.', 52000, 'photo-1568901346375-23c9450c58cd', { featured: true, popular: true, options: [{ name: 'Add-ons', type: 'multiple', required: false, choices: [{ name: 'Extra cheese', priceDelta: 6000 }, { name: 'Beef bacon', priceDelta: 9000 }] }] }],
            ['Crispy Chicken Burger', 'Buttermilk fried chicken, slaw, chipotle mayo.', 42000, 'photo-1606755962773-d324e0a13086', { dietary: ['spicy', 'halal'] }]],
  Pizza: [['Margherita', 'San Marzano tomato, fior di latte, basil.', 75000, 'photo-1574071318508-1cdbab80d002', { dietary: ['vegetarian'], options: [size(30000)] }],
          ['Truffle Mushroom Pizza', 'Wild mushrooms, truffle cream, parmesan.', 98000, 'photo-1513104890138-7c749659a591', { featured: true, options: [size(35000)] }]],
  'Rice Meals': [['Kacchi Biryani', 'Slow-cooked mutton, aromatic basmati, potato.', 65000, 'photo-1563379091339-03b21ab4a4f8', { popular: true, featured: true, dietary: ['halal'] }],
                 ['Chicken Rezala Plate', 'Creamy rezala with polao and salad.', 48000, 'photo-1603133872878-684f208fb84b', { dietary: ['halal'] }]],
  Pasta: [['Prawn Linguine', 'Garlic, chilli, cherry tomato, white wine.', 82000, 'photo-1563379926898-05f4575a45d8', { dietary: ['spicy'] }],
          ['Creamy Alfredo', 'Parmesan cream, grilled chicken, parsley.', 62000, 'photo-1645112411341-6c4fd023714a', {}]],
  Drinks: [['Mint Lemonade', 'Fresh lime, mint, a touch of honey.', 18000, 'photo-1513558161293-cdaf765ed2fd', { dietary: ['vegan'] }],
           ['Iced Latte', 'Double espresso over milk and ice.', 25000, 'photo-1461023058943-07fcbe16d735', { available: false }]],
  Desserts: [['Molten Chocolate Cake', 'Warm dark chocolate centre, vanilla ice cream.', 38000, 'photo-1606313564200-e75d5e30476c', { featured: true, popular: true, dietary: ['vegetarian'] }],
             ['Mishti Doi Cheesecake', 'Baked yogurt cheesecake, jaggery glaze.', 32000, 'photo-1533134242443-d4fd215305ad', { dietary: ['vegetarian'] }]],
};
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
await mongoose.connect(uri);
await Promise.all([Category.deleteMany({}), MenuItem.deleteMany({})]);
for (const [i, [name, im]] of cats.entries()) {
  const c = await Category.create({ name, slug: slug(name), imageUrl: img(im), displayOrder: i });
  for (const [n, d, price, photo, extra] of dishes[name])
    await MenuItem.create({ name: n, slug: slug(n), description: d, price, imageUrl: img(photo), category: c._id, ...extra });
}
await Settings.get();
await Coupon.updateOne({ code: 'WELCOME10' }, { code: 'WELCOME10', type: 'percent', value: 10, maxDiscount: 20000, minOrder: 50000, active: true }, { upsert: true });
const email = 'admin@restaurant.local';
if (!(await User.exists({ email }))) {
  await User.create({ name: 'Admin', email, role: 'admin', passwordHash: await bcrypt.hash('ChangeMe123!', 12) });
  console.log(`Admin created: ${email} / ChangeMe123!  (change this password)`);
}
console.log('Seed complete'); await mongoose.disconnect();
