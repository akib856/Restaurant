import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useCategories, useMenu } from '../hooks/queries.js';
import FoodCard from '../components/FoodCard.jsx';
import { Spinner, ErrorBox, Empty } from '../components/ui.jsx';
export default function Menu() {
  const [sp, setSp] = useSearchParams();
  const params = Object.fromEntries([...sp.entries()].filter(([, v]) => v));
  const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n, { replace: true }); };
  const { data: cats } = useCategories();
  const { data, isLoading, error } = useMenu({ limit: 60, ...params });
  return (
    <div className="container-x py-14">
      <h1 className="text-5xl text-forest">Our Menu</h1>
      <p className="mt-2 text-charcoal/70">Freshly prepared, made to order.</p>
      <div className="mt-8 flex flex-wrap gap-2">
        <button onClick={() => set('category', '')} className={`rounded-full px-4 py-2 text-sm ${!params.category ? 'bg-forest text-cream' : 'bg-white text-forest'}`}>All</button>
        {cats?.map((c) => <button key={c._id} onClick={() => set('category', c.slug)} className={`rounded-full px-4 py-2 text-sm ${params.category === c.slug ? 'bg-forest text-cream' : 'bg-white text-forest hover:bg-forest/5'}`}>{c.name}</button>)}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <label className="relative sm:col-span-2"><Search size={16} className="absolute left-4 top-3.5 text-charcoal/40" />
          <input className="input !pl-10" placeholder="Search dishes…" defaultValue={params.q || ''} onChange={(e) => set('q', e.target.value)} /></label>
        <select className="input" value={params.dietary || ''} onChange={(e) => set('dietary', e.target.value)}>
          <option value="">All diets</option>{['vegetarian', 'vegan', 'spicy', 'halal', 'gluten-free'].map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="input" value={params.sort || ''} onChange={(e) => set('sort', e.target.value)}>
          <option value="">Recommended</option><option value="popular">Most popular</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option>
        </select>
      </div>
      <label className="mt-3 inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={params.available === 'true'} onChange={(e) => set('available', e.target.checked ? 'true' : '')} /> Available now only</label>
      <div className="mt-8">
        {isLoading ? <Spinner /> : error ? <ErrorBox error={error} /> : data.length === 0 ? <Empty title="No dishes found">Try a different search or filter.</Empty>
          : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.map((i) => <FoodCard key={i._id} item={i} />)}</div>}
      </div>
    </div>
  );
}
