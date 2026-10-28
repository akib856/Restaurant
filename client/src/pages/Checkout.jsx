import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Truck, Store, Banknote, CreditCard, Loader2 } from 'lucide-react';
import { checkoutSchema } from '../schemas/checkout.js';
import { useCart } from '../store/cart.js';
import { useSettings, useMe } from '../hooks/queries.js';
import { api } from '../services/api.js';
import { money } from '../utils/format.js';
import { ErrorBox, Empty } from '../components/ui.jsx';
const Field = ({ label, error, children }) => <div><label className="label">{label}</label>{children}{error && <p className="mt-1 text-xs text-red-700">{error.message}</p>}</div>;
const Choice = ({ active, onClick, icon: I, title, sub, disabled }) => (
  <button type="button" disabled={disabled} onClick={onClick} className={`flex flex-1 items-center gap-3 rounded-2xl border p-4 text-left transition disabled:opacity-40 ${active ? 'border-forest bg-forest/5 ring-2 ring-forest/20' : 'border-charcoal/10 bg-white'}`}>
    <I className="text-forest" /><span><span className="block font-semibold">{title}</span><span className="text-xs text-charcoal/60">{sub}</span></span></button>
);
export default function Checkout() {
  const nav = useNavigate();
  const { items, coupon, clear } = useCart();
  const { data: s } = useSettings();
  const { data: me } = useMe();
  const [idemKey] = useState(() => crypto.randomUUID());
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutSchema), defaultValues: { fulfilment: 'delivery', paymentMethod: 'cod' } });
  useEffect(() => { if (me) reset((v) => ({ ...v, name: me.name, phone: me.phone || '', email: me.email, line1: me.addresses?.[0]?.line1 || '', area: me.addresses?.[0]?.area || '' })); }, [me, reset]);
  const fulfilment = watch('fulfilment'); const paymentMethod = watch('paymentMethod');
  const payloadItems = useMemo(() => items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity, options: i.options })), [items]);
  const quote = useQuery({ queryKey: ['quote', payloadItems, fulfilment, coupon], enabled: items.length > 0, retry: false,
    queryFn: () => api('/orders/quote', { method: 'POST', body: { items: payloadItems, fulfilment, couponCode: coupon || undefined } }).then((r) => r.data) });
  const place = useMutation({
    mutationFn: (v) => api('/orders', { method: 'POST', body: {
      idempotencyKey: idemKey, items: payloadItems, fulfilment: v.fulfilment, couponCode: coupon || undefined,
      contact: { name: v.name, phone: v.phone, email: v.email || undefined },
      address: v.fulfilment === 'delivery' ? { line1: v.line1, area: v.area, city: 'Dhaka', instructions: v.instructions } : undefined,
      notes: v.notes, paymentMethod: v.paymentMethod } }),
    onSuccess: async ({ data }) => {
      clear();
      if (data.paymentMethod === 'online') {
        try { const r = await api(`/payments/init/${data._id}`, { method: 'POST' }); window.location.href = r.data.redirectUrl; return; }
        catch { /* provider not configured: show order page with pending payment */ }
      }
      nav(`/order-success/${data._id}`);
    },
  });
  if (!items.length && !place.isSuccess) return <div className="container-x py-14"><Empty title="Nothing to check out"><Link to="/menu" className="underline">Browse the menu</Link></Empty></div>;
  const q = quote.data;
  return (
    <div className="container-x py-14">
      <h1 className="text-5xl text-forest">Checkout</h1>
      {!me && <p className="mt-2 text-sm text-charcoal/70">Ordering as a guest. <Link to="/login?next=/checkout" className="text-forest underline">Log in</Link> to save your order history.</p>}
      <form onSubmit={handleSubmit((v) => place.mutate(v))} className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card space-y-4 p-6">
            <h2 className="text-2xl text-forest">Your details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.name}><input className="input" {...register('name')} /></Field>
              <Field label="Phone" error={errors.phone}><input className="input" {...register('phone')} placeholder="01XXXXXXXXX" /></Field>
            </div>
            <Field label="Email (optional)" error={errors.email}><input className="input" {...register('email')} /></Field>
          </section>
          <section className="card space-y-4 p-6">
            <h2 className="text-2xl text-forest">Delivery or pickup</h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Choice active={fulfilment === 'delivery'} onClick={() => setValue('fulfilment', 'delivery')} icon={Truck} title="Home delivery" sub="30–45 minutes" />
              <Choice active={fulfilment === 'pickup'} disabled={s && !s.pickupEnabled} onClick={() => setValue('fulfilment', 'pickup')} icon={Store} title="Pickup" sub="No delivery fee" />
            </div>
            {fulfilment === 'delivery' ? (<div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Field label="Street address" error={errors.line1}><input className="input" {...register('line1')} placeholder="House, road, block" /></Field></div>
              <Field label="Area"><input className="input" {...register('area')} placeholder="Gulshan, Banani…" /></Field>
              <Field label="Rider instructions"><input className="input" {...register('instructions')} placeholder="Gate code, landmark" /></Field>
            </div>) : (<div className="rounded-xl bg-cream p-4 text-sm"><p className="font-semibold">{s?.address}</p><p className="mt-1 text-charcoal/70">{s?.pickupInstructions}</p></div>)}
            <Field label="Order notes (optional)"><textarea className="input" rows={2} {...register('notes')} placeholder="Allergies, spice level…" /></Field>
          </section>
          <section className="card space-y-4 p-6">
            <h2 className="text-2xl text-forest">Payment</h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Choice active={paymentMethod === 'cod'} disabled={s && !s.codEnabled} onClick={() => setValue('paymentMethod', 'cod')} icon={Banknote} title={fulfilment === 'pickup' ? 'Pay at pickup' : 'Cash on delivery'} sub="Pay when you receive" />
              <Choice active={paymentMethod === 'online'} disabled={!s?.onlinePaymentEnabled} onClick={() => setValue('paymentMethod', 'online')} icon={CreditCard} title="Pay online" sub={s?.onlinePaymentEnabled ? 'bKash, Nagad, cards' : 'Coming soon'} />
            </div>
          </section>
        </div>
        <aside className="card h-fit p-6 lg:sticky lg:top-24">
          <h2 className="text-2xl text-forest">Order summary</h2>
          <ul className="mt-4 space-y-2 text-sm">{items.map((i) => <li key={i.key} className="flex justify-between gap-2"><span>{i.quantity} × {i.name}{i.options.length > 0 && <span className="text-charcoal/50"> ({i.options.map((o) => o.choice).join(', ')})</span>}</span><span>{money(i.unitPrice * i.quantity)}</span></li>)}</ul>
          <hr className="my-4 border-charcoal/10" />
          {quote.isLoading ? <p className="flex items-center gap-2 text-sm"><Loader2 className="animate-spin" size={14} /> Calculating…</p>
            : quote.error ? <ErrorBox error={quote.error} />
            : q && <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(q.subtotal)}</dd></div>
              {q.discount > 0 && <div className="flex justify-between text-forest"><dt>Discount ({coupon.toUpperCase()})</dt><dd>−{money(q.discount)}</dd></div>}
              <div className="flex justify-between"><dt>Delivery</dt><dd>{q.deliveryFee ? money(q.deliveryFee) : 'Free'}</dd></div>
              <div className="flex justify-between"><dt>VAT</dt><dd>{money(q.tax)}</dd></div>
              <div className="flex justify-between pt-2 text-lg font-semibold text-forest"><dt>Total</dt><dd>{money(q.total)}</dd></div>
            </dl>}
          {place.error && <div className="mt-4"><ErrorBox error={place.error} /></div>}
          <button className="btn-primary mt-6 w-full" disabled={place.isPending || !q}>{place.isPending ? <><Loader2 className="animate-spin" size={16} /> Placing order…</> : 'Place order'}</button>
          <p className="mt-3 text-center text-xs text-charcoal/50">By ordering you agree to our <Link to="/terms" className="underline">terms</Link>.</p>
        </aside>
      </form>
    </div>
  );
}
