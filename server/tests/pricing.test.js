import { describe, it, expect } from 'vitest';
import { priceLine, computeTotals, couponDiscount } from '../src/services/pricing.js';
const pizza = { _id: 'p1', name: 'Pizza', price: 80000, active: true, available: true,
  options: [{ name: 'Size', type: 'single', required: true, choices: [{ name: 'Regular', priceDelta: 0 }, { name: 'Large', priceDelta: 20000 }] },
            { name: 'Extras', type: 'multiple', required: false, choices: [{ name: 'Cheese', priceDelta: 5000 }] }] };
const settings = { minOrder: 30000, deliveryFee: 6000, freeDeliveryOver: 150000, taxRate: 0.05 };

describe('priceLine', () => {
  it('uses server prices plus option deltas', () => {
    const l = priceLine(pizza, 2, [{ group: 'Size', choice: 'Large' }, { group: 'Extras', choice: 'Cheese' }]);
    expect(l.unitPrice).toBe(105000); expect(l.lineTotal).toBe(210000);
  });
  it('rejects missing required option', () => expect(() => priceLine(pizza, 1, [])).toThrow(/Size/));
  it('rejects sold-out items', () => expect(() => priceLine({ ...pizza, available: false }, 1, [{ group: 'Size', choice: 'Regular' }])).toThrow(/sold out/));
  it('rejects unknown options', () => expect(() => priceLine(pizza, 1, [{ group: 'Size', choice: 'Huge' }])).toThrow());
  it('rejects bad quantity', () => expect(() => priceLine(pizza, 0, [{ group: 'Size', choice: 'Regular' }])).toThrow());
});
describe('computeTotals', () => {
  const lines = [{ lineTotal: 100000 }];
  it('charges delivery fee for delivery', () => {
    const t = computeTotals({ lines, fulfilment: 'delivery', settings });
    expect(t).toEqual({ subtotal: 100000, discount: 0, deliveryFee: 6000, tax: 5000, total: 111000 });
  });
  it('no delivery fee for pickup', () => expect(computeTotals({ lines, fulfilment: 'pickup', settings }).deliveryFee).toBe(0));
  it('free delivery above threshold', () => expect(computeTotals({ lines: [{ lineTotal: 200000 }], fulfilment: 'delivery', settings }).deliveryFee).toBe(0));
  it('enforces minimum order', () => expect(() => computeTotals({ lines: [{ lineTotal: 100 }], fulfilment: 'pickup', settings })).toThrow(/minimum/));
});
describe('coupons', () => {
  it('percent with cap', () => expect(couponDiscount({ active: true, type: 'percent', value: 50, maxDiscount: 10000 }, 100000)).toBe(10000));
  it('expired', () => expect(() => couponDiscount({ active: true, type: 'fixed', value: 1, expiresAt: new Date(0) }, 1000)).toThrow(/expired/));
});
