export const ORDER_STATUSES = ['pending_payment', 'pending_confirmation', 'confirmed', 'preparing',
  'ready_for_pickup', 'out_for_delivery', 'completed', 'cancelled'];

const T = {
  pending_payment: ['pending_confirmation', 'cancelled'],
  pending_confirmation: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready_for_pickup', 'out_for_delivery'],
  ready_for_pickup: ['completed'],
  out_for_delivery: ['completed'],
  completed: [],
  cancelled: [],
};

export function canTransition(order, next) {
  if (!(T[order.status] || []).includes(next)) return false;
  if (next === 'ready_for_pickup' && order.fulfilment !== 'pickup') return false;
  if (next === 'out_for_delivery' && order.fulfilment !== 'delivery') return false;
  if (next === 'completed' && order.paymentMethod === 'online' && order.paymentStatus !== 'paid') return false;
  return true;
}
export const customerCanCancel = (order) => ['pending_payment', 'pending_confirmation'].includes(order.status);
