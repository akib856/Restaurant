import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../store/cart.js';
import { useSettings } from '../hooks/queries.js';
import { money } from '../utils/format.js';
import { Empty } from '../components/ui.jsx';
export default function Cart() {
  const { items, setQty, remove, coupon, setCoupon } = useCart();
  const { data: s } = useSettings();
  const subtotal = items.reduce((a, i) => a + i.unitPrice * i.quantity, 0);
  if (!items.length) return <div className="container-x py-14"><Empty title="Your cart is empty">Discover something delicious. <Link to="/menu" className="text-forest underline">Browse the menu</Link></Empty></div>;
  const fee = s && subtotal < s.freeDeliveryOver ? s.deliveryFee : 0;
  return (
    <div className="container-x py-14">
      <h1 className="text-5xl text-forest">Your Cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((i) => (
            <div key={i.key} className="card flex gap-4 p-4">
              <img src={i.imageUrl} alt="" className="h-24 w-24 rounded-xl object-cover" />
              <div className="flex-1">
                <div className="flex justify-between gap-2"><Link to={`/menu/${i.slug}`} className="font-serif text-xl text-forest">{i.name}</Link><span className="font-semibold">{money(i.unitPrice * i.quantity)}</span></div>
                {i.options.length > 0 && <p className="text-sm text-charcoal/60">{i.options.map((o) => o.choice).join(' · ')}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center rounded-full bg-cream">
                    <button className="p-2" onClick={() => setQty(i.key, i.quantity - 1)} aria-label="Decrease"><Minus size={14} /></button>
                    <span className="w-6 text-center text-sm">{i.quantity}</span>
                    <button className="p-2" onClick={() => setQty(i.key, i.quantity + 1)} aria-label="Increase"><Plus size={14} /></button>
                  </div>
                  <div className="flex gap-3 text-sm"><Link to={`/menu/${i.slug}`} onClick={() => remove(i.key)} className="text-forest/70 hover:text-forest">Edit</Link>
                    <button onClick={() => remove(i.key)} className="text-red-700/80 hover:text-red-700" aria-label="Remove"><Trash2 size={16} /></button></div>
                </div>
              </div>
            </div>
          ))}
          <Link to="/menu" className="inline-block text-sm text-forest underline">← Continue shopping</Link>
        </div>
        <aside className="card h-fit p-6">
          <h2 className="text-2xl text-forest">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Delivery (estimate)</dt><dd>{fee ? money(fee) : 'Free'}</dd></div>
            <div className="flex justify-between"><dt>VAT ({Math.round((s?.taxRate || 0) * 100)}%)</dt><dd>calculated at checkout</dd></div>
          </dl>
          <label className="label mt-5">Coupon code</label>
          <input className="input uppercase" value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="WELCOME10" />
          <p className="mt-1 text-xs text-charcoal/60">Validated at checkout.</p>
          {s && subtotal < s.minOrder && <p className="mt-4 text-sm text-red-700">Minimum order is {money(s.minOrder)}.</p>}
          <Link to="/checkout" className={`btn-primary mt-6 w-full ${s && subtotal < s.minOrder ? 'pointer-events-none opacity-50' : ''}`}>Proceed to checkout</Link>
        </aside>
      </div>
    </div>
  );
}
