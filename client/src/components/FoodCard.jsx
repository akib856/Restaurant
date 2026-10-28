import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { money } from '../utils/format.js';
import { useCart } from '../store/cart.js';
export default function FoodCard({ item }) {
  const add = useCart((s) => s.add);
  const needsOptions = item.options?.some((g) => g.required);
  return (
    <div className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(24,60,50,0.12)]">
      <Link to={`/menu/${item.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        <img src={item.imageUrl} alt={item.name} loading="lazy" className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${!item.available ? 'grayscale' : ''}`} />
        <div className="absolute left-3 top-3 flex gap-2">
          {item.featured && <span className="rounded-full bg-gold px-3 py-1 text-xs font-medium text-charcoal">Chef's pick</span>}
          {item.popular && <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-forest">Popular</span>}
        </div>
        {!item.available && <span className="absolute inset-0 flex items-center justify-center bg-charcoal/40 text-sm font-semibold uppercase tracking-widest text-white">Sold out</span>}
      </Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/menu/${item.slug}`}><h3 className="text-2xl leading-tight text-forest">{item.name}</h3></Link>
          <span className="whitespace-nowrap font-semibold text-forest">{money(item.price)}</span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-charcoal/70">{item.description}</p>
        <div className="mt-4">
          {!item.available ? <button className="btn-ghost w-full" disabled>Unavailable</button>
            : needsOptions ? <Link to={`/menu/${item.slug}`} className="btn-ghost w-full">Choose options</Link>
            : <button className="btn-primary w-full" onClick={() => add(item, 1, [], item.price)}><Plus size={16} /> Add to cart</button>}
        </div>
      </div>
    </div>
  );
}
