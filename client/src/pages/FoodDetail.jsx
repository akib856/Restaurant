import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Minus, Plus, Check } from 'lucide-react';
import { api } from '../services/api.js';
import { money } from '../utils/format.js';
import { useCart } from '../store/cart.js';
import FoodCard from '../components/FoodCard.jsx';
import { Spinner, ErrorBox } from '../components/ui.jsx';
export default function FoodDetail() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { data: item, isLoading, error } = useQuery({ queryKey: ['item', slug], queryFn: () => api('/menu/' + slug).then((r) => r.data) });
  const [qty, setQty] = useState(1);
  const [sel, setSel] = useState({});
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);
  const options = useMemo(() => Object.entries(sel).flatMap(([group, cs]) => cs.map((choice) => ({ group, choice }))), [sel]);
  if (isLoading) return <Spinner />;
  if (error) return <div className="container-x py-14"><ErrorBox error={error} /></div>;
  const unit = item.price + options.reduce((a, o) => a + (item.options.find((g) => g.name === o.group)?.choices.find((c) => c.name === o.choice)?.priceDelta || 0), 0);
  const missing = item.options.filter((g) => g.required && !(sel[g.name]?.length));
  const toggle = (g, c) => setSel((s) => {
    const cur = s[g.name] || [];
    return { ...s, [g.name]: g.type === 'single' ? [c] : cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c] };
  });
  return (
    <div className="container-x py-12">
      <Link to="/menu" className="text-sm text-forest/70 hover:text-forest">← Back to menu</Link>
      <div className="mt-6 grid gap-12 lg:grid-cols-2">
        <img src={item.imageUrl} alt={item.name} className="aspect-square w-full rounded-3xl object-cover" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{item.category?.name}</p>
          <h1 className="mt-2 text-5xl text-forest">{item.name}</h1>
          <p className="mt-4 text-lg leading-relaxed text-charcoal/75">{item.description}</p>
          <p className="mt-6 text-3xl font-semibold text-forest">{money(unit)}</p>
          <p className={`mt-2 text-sm ${item.available ? 'text-forest' : 'text-red-700'}`}>{item.available ? '● Available now' : '● Currently sold out'}</p>
          {item.options.map((g) => (
            <fieldset key={g._id} className="mt-7">
              <legend className="mb-3 font-semibold">{g.name} {g.required && <span className="text-xs font-normal text-gold">Required</span>}</legend>
              <div className="flex flex-wrap gap-2">
                {g.choices.map((c) => { const on = sel[g.name]?.includes(c.name); return (
                  <button key={c._id} onClick={() => toggle(g, c.name)} className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${on ? 'border-forest bg-forest text-cream' : 'border-forest/20 bg-white'}`}>
                    {on && <Check size={14} />}{c.name}{c.priceDelta > 0 && <span className="opacity-70">+{money(c.priceDelta)}</span>}
                  </button>); })}
              </div>
            </fieldset>
          ))}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-full bg-white">
              <button className="p-3" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease"><Minus size={16} /></button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button className="p-3" onClick={() => setQty(Math.min(50, qty + 1))} aria-label="Increase"><Plus size={16} /></button>
            </div>
            <button className="btn-primary flex-1" disabled={!item.available || missing.length > 0}
              onClick={() => { add(item, qty, options, unit); setAdded(true); setTimeout(() => setAdded(false), 2000); }}>
              {added ? <><Check size={16} /> Added</> : `Add to cart · ${money(unit * qty)}`}
            </button>
          </div>
          {missing.length > 0 && <p className="mt-2 text-sm text-charcoal/60">Please choose: {missing.map((g) => g.name).join(', ')}</p>}
          {added && <button className="mt-3 text-sm font-medium text-forest underline" onClick={() => nav('/cart')}>Go to cart →</button>}
        </div>
      </div>
      {item.related?.length > 0 && <section className="mt-20"><h2 className="mb-6 text-3xl text-forest">You may also like</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{item.related.map((r) => <FoodCard key={r._id} item={r} />)}</div></section>}
    </div>
  );
}
