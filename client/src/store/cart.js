import { create } from 'zustand';
import { persist } from 'zustand/middleware';
const keyOf = (id, options) => id + '|' + options.map((o) => `${o.group}:${o.choice}`).sort().join(',');
// Prices here are display estimates only; the server recalculates everything.
export const useCart = create(persist((set, get) => ({
  items: [], coupon: '',
  add: (item, quantity, options, unitPrice) => set((s) => {
    const key = keyOf(item._id, options);
    const ex = s.items.find((i) => i.key === key);
    if (ex) return { items: s.items.map((i) => i.key === key ? { ...i, quantity: Math.min(50, i.quantity + quantity) } : i) };
    return { items: [...s.items, { key, menuItemId: item._id, slug: item.slug, name: item.name, imageUrl: item.imageUrl, options, unitPrice, quantity }] };
  }),
  setQty: (key, q) => set((s) => ({ items: s.items.map((i) => i.key === key ? { ...i, quantity: Math.max(1, Math.min(50, q)) } : i) })),
  remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
  setCoupon: (coupon) => set({ coupon }),
  clear: () => set({ items: [], coupon: '' }),
  count: () => get().items.reduce((a, i) => a + i.quantity, 0),
  subtotal: () => get().items.reduce((a, i) => a + i.unitPrice * i.quantity, 0),
}), { name: 'vt-cart' }));
