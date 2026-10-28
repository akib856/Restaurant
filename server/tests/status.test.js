import { describe, it, expect } from 'vitest';
import { canTransition, customerCanCancel } from '../src/services/orderStatus.js';
describe('order status transitions', () => {
  const d = { fulfilment: 'delivery', paymentMethod: 'cod', paymentStatus: 'unpaid' };
  it('allows the normal delivery flow', () => {
    expect(canTransition({ ...d, status: 'pending_confirmation' }, 'confirmed')).toBe(true);
    expect(canTransition({ ...d, status: 'preparing' }, 'out_for_delivery')).toBe(true);
  });
  it('blocks skipping steps', () => expect(canTransition({ ...d, status: 'pending_confirmation' }, 'completed')).toBe(false));
  it('blocks pickup status on delivery order', () => expect(canTransition({ ...d, status: 'preparing' }, 'ready_for_pickup')).toBe(false));
  it('blocks completing unpaid online orders', () =>
    expect(canTransition({ fulfilment: 'pickup', paymentMethod: 'online', paymentStatus: 'pending', status: 'ready_for_pickup' }, 'completed')).toBe(false));
  it('customer can cancel only early', () => {
    expect(customerCanCancel({ status: 'pending_confirmation' })).toBe(true);
    expect(customerCanCancel({ status: 'preparing' })).toBe(false);
  });
});
