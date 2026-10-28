import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, ShoppingBag, Clock } from 'lucide-react';
import { useSettings, useCategories, useMenu } from '../hooks/queries.js';
import FoodCard from '../components/FoodCard.jsx';
import { SectionTitle, Spinner } from '../components/ui.jsx';
const HERO = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1800&q=75';
const reviews = [
  ['Nadia R.', 'The kacchi arrived hot and perfectly spiced. Easily the best delivery in Gulshan.'],
  ['Tanvir H.', 'Beautiful plating even for pickup. The truffle pizza is unreal.'],
  ['Sarah K.', 'Ordering was effortless and the staff kept me updated the whole way.'],
];
export default function Home() {
  const { data: s } = useSettings();
  const { data: cats } = useCategories();
  const { data: featured, isLoading } = useMenu({ featured: 'true', limit: 6 });
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img src={HERO} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest/95 via-forest/75 to-forest/20" />
        <div className="container-x py-28 sm:py-40">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Fine dining · Delivered</p>
          <h1 className="mt-4 max-w-2xl text-5xl leading-[1.05] text-cream sm:text-7xl">{s?.tagline || 'Seasonal plates, crafted with care'}</h1>
          <p className="mt-6 max-w-lg text-lg text-cream/80">Restaurant-quality dishes from our kitchen to your table — order for delivery or pick up in minutes.</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/menu" className="btn-gold !px-8 !py-4 text-base">Order Now <ArrowRight size={18} /></Link>
            <Link to="/about" className="btn border border-cream/30 text-cream hover:bg-cream/10">Our story</Link>
          </div>
        </div>
      </section>

      <section className="container-x relative z-10 -mt-10 grid gap-4 sm:grid-cols-3">
        {[[Truck, 'Home delivery', 'Across Dhaka, hot and on time'], [ShoppingBag, 'Easy pickup', 'Skip the queue, no delivery fee'], [Clock, 'Open daily', s?.openingHours]].map(([I, t, d]) => (
          <div key={t} className="card flex items-center gap-4 p-5"><span className="rounded-full bg-cream p-3 text-forest"><I size={20} /></span><div><p className="font-semibold text-forest">{t}</p><p className="text-sm text-charcoal/70">{d}</p></div></div>
        ))}
      </section>

      <section className="container-x mt-24">
        <SectionTitle eyebrow="Explore" title="Browse by category" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {cats?.map((c) => (
            <Link key={c._id} to={`/menu?category=${c.slug}`} className="group relative aspect-square overflow-hidden rounded-2xl">
              <img src={c.imageUrl} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/80 to-transparent" />
              <span className="absolute bottom-3 left-4 font-serif text-xl text-cream">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-x mt-24">
        <SectionTitle eyebrow="Signature" title="Chef's favourites">Our most-loved plates, chosen by the kitchen.</SectionTitle>
        {isLoading ? <Spinner /> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{featured?.map((i) => <FoodCard key={i._id} item={i} />)}</div>}
        <div className="mt-10 text-center"><Link to="/menu" className="btn-ghost">View full menu <ArrowRight size={16} /></Link></div>
      </section>

      <section className="container-x mt-24">
        <div className="grid overflow-hidden rounded-3xl bg-forest md:grid-cols-2">
          <div className="p-10 sm:p-14">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Limited offer</p>
            <h2 className="mt-3 text-4xl text-cream sm:text-5xl">10% off your first order</h2>
            <p className="mt-4 text-cream/75">Use code <span className="rounded bg-gold/20 px-2 py-0.5 font-semibold text-gold">WELCOME10</span> at checkout on orders above ৳500.</p>
            <Link to="/menu" className="btn-gold mt-8">Start ordering</Link>
          </div>
          <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=75" alt="" className="h-72 w-full object-cover md:h-full" />
        </div>
      </section>

      <section className="container-x mt-24 grid items-center gap-12 md:grid-cols-2">
        <img src="https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1200&q=75" alt="Our kitchen" className="aspect-[4/3] w-full rounded-3xl object-cover" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">About us</p>
          <h2 className="mt-3 text-4xl text-forest sm:text-5xl">Honest ingredients, careful hands</h2>
          <p className="mt-5 leading-relaxed text-charcoal/75">We cook with produce from growers we know, blending Bangladeshi heritage recipes with modern European technique. Every order is prepared fresh, packed with care, and delivered the way it would be served at our table.</p>
          <Link to="/about" className="btn-ghost mt-8">Read our story</Link>
        </div>
      </section>

      <section className="container-x mt-24">
        <SectionTitle eyebrow="Kind words" title="What our guests say" />
        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map(([n, t]) => (
            <figure key={n} className="card p-7">
              <div className="flex gap-1 text-gold">{[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}</div>
              <blockquote className="mt-4 font-serif text-xl leading-snug text-forest">“{t}”</blockquote>
              <figcaption className="mt-4 text-sm text-charcoal/60">— {n}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
