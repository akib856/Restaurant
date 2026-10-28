// Pure pricing logic - all amounts in integer minor units. Never trusts client prices.
export class PricingError extends Error { constructor(m) { super(m); this.status = 422; } }

export function priceLine(menuItem, quantity, selected = []) {
  if (!menuItem || !menuItem.active) throw new PricingError('An item in your cart no longer exists');
  if (!menuItem.available) throw new PricingError(`${menuItem.name} is sold out`);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) throw new PricingError('Invalid quantity');
  const chosen = [];
  for (const group of menuItem.options || []) {
    const picks = selected.filter((s) => s.group === group.name);
    if (group.required && picks.length === 0) throw new PricingError(`Choose ${group.name} for ${menuItem.name}`);
    if (group.type === 'single' && picks.length > 1) throw new PricingError(`Only one ${group.name} allowed`);
    for (const p of picks) {
      const c = group.choices.find((x) => x.name === p.choice);
      if (!c) throw new PricingError(`Invalid option ${p.choice}`);
      chosen.push({ group: group.name, choice: c.name, priceDelta: c.priceDelta });
    }
  }
  const known = new Set((menuItem.options || []).map((g) => g.name));
  if (selected.some((s) => !known.has(s.group))) throw new PricingError('Invalid option group');
  const unitPrice = menuItem.price + chosen.reduce((a, c) => a + c.priceDelta, 0);
  return { menuItem: menuItem._id, name: menuItem.name, imageUrl: menuItem.imageUrl,
    options: chosen, quantity, unitPrice, lineTotal: unitPrice * quantity };
}

export function couponDiscount(coupon, subtotal, now = new Date()) {
  if (!coupon) return 0;
  if (!coupon.active) throw new PricingError('Coupon is not active');
  if (coupon.expiresAt && coupon.expiresAt < now) throw new PricingError('Coupon has expired');
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) throw new PricingError('Coupon usage limit reached');
  if (subtotal < (coupon.minOrder || 0)) throw new PricingError('Order does not meet the coupon minimum');
  let d = coupon.type === 'percent' ? Math.round(subtotal * coupon.value / 100) : coupon.value;
  if (coupon.maxDiscount != null) d = Math.min(d, coupon.maxDiscount);
  return Math.min(d, subtotal);
}

export function computeTotals({ lines, fulfilment, settings, coupon }) {
  const subtotal = lines.reduce((a, l) => a + l.lineTotal, 0);
  if (subtotal < settings.minOrder) throw new PricingError('Order is below the minimum order value');
  const discount = couponDiscount(coupon, subtotal);
  const deliveryFee = fulfilment === 'delivery' && subtotal < settings.freeDeliveryOver ? settings.deliveryFee : 0;
  const tax = Math.round((subtotal - discount) * settings.taxRate);
  return { subtotal, discount, deliveryFee, tax, total: subtotal - discount + deliveryFee + tax };
}
