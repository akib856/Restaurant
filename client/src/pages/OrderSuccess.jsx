import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.js';
import { money, statusLabel } from '../utils/format.js';
import { Spinner, ErrorBox } from '../components/ui.jsx';
export function OrderView({ order }) {
  return (
    <div className="card p-6">
      <div className="flex flex-wrap justify-between gap-2"><p className="font-semibold">Order {order.orderNumber}</p><span className="rounded-full bg-cream px-3 py-1 text-xs font-medium text-forest">{statusLabel(order.status)}</span></div>
      <p className="mt-1 text-sm text-charcoal/60">{new Date(order.createdAt).toLocaleString()} · {order.fulfilment === 'delivery' ? 'Home delivery' : 'Pickup'} · {order.paymentMethod === 'cod' ? 'Cash' : 'Online'} ({statusLabel(order.paymentStatus)})</p>
      <ul className="mt-4 space-y-1 text-sm">{order.items.map((i, k) => <li key={k} className="flex justify-between"><span>{i.quantity} × {i.name}{i.options.length > 0 && ` (${i.options.map((o) => o.choice).join(', ')})`}</span><span>{money(i.lineTotal)}</span></li>)}</ul>
      <dl className="mt-4 space-y-1 border-t border-charcoal/10 pt-4 text-sm">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
        {order.discount > 0 && <div className="flex justify-between"><dt>Discount</dt><dd>−{money(order.discount)}</dd></div>}
        <div className="flex justify-between"><dt>Delivery</dt><dd>{money(order.deliveryFee)}</dd></div>
        <div className="flex justify-between"><dt>VAT</dt><dd>{money(order.tax)}</dd></div>
        <div className="flex justify-between font-semibold text-forest"><dt>Total</dt><dd>{money(order.total)}</dd></div>
      </dl>
      {order.address?.line1 && <p className="mt-4 text-sm text-charcoal/70">Deliver to: {order.address.line1}{order.address.area && `, ${order.address.area}`}</p>}
    </div>
  );
}
export default function OrderSuccess() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({ queryKey: ['order', id], queryFn: () => api('/orders/' + id).then((r) => r.data) });
  if (isLoading) return <Spinner />;
  return (
    <div className="container-x max-w-2xl py-16">
      {error ? <ErrorBox error={error} /> : <>
        <div className="text-center"><CheckCircle2 size={56} className="mx-auto text-forest" />
          <h1 className="mt-4 text-5xl text-forest">Thank you!</h1>
          <p className="mt-2 text-charcoal/70">{data.paymentMethod === 'online' && data.paymentStatus !== 'paid' ? 'Your order is saved and awaiting payment.' : "Your order has been received. We'll confirm it shortly."}</p></div>
        <div className="mt-8"><OrderView order={data} /></div>
        <div className="mt-8 flex justify-center gap-3"><Link to="/menu" className="btn-ghost">Order more</Link><Link to="/account" className="btn-primary">My orders</Link></div>
      </>}
    </div>
  );
}
