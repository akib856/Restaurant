import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { ShoppingBag, Menu as MenuIcon, X, User, Phone, MapPin, Clock } from 'lucide-react';
import { useCart } from '../store/cart.js';
import { useSettings, useMe } from '../hooks/queries.js';
import { useConsent } from '../store/consent.js';
import CookieBanner from './CookieBanner.jsx';
const links = [['/', 'Home'], ['/menu', 'Menu'], ['/about', 'About'], ['/contact', 'Contact']];
// [settings key, label, SVG path] — brand logos (Simple Icons), links set in Admin → Settings
const SOCIAL = [
  ['facebookUrl', 'Facebook', 'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z'],
  ['instagramUrl', 'Instagram', 'M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.805.249 2.227.413.56.218.96.478 1.38.898.42.42.68.82.898 1.38.164.422.36 1.057.413 2.227.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.249 1.805-.413 2.227-.218.56-.478.96-.898 1.38-.42.42-.82.68-1.38.898-.422.164-1.057.36-2.227.413-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.805-.249-2.227-.413a3.71 3.71 0 0 1-1.38-.898 3.71 3.71 0 0 1-.898-1.38c-.164-.422-.36-1.057-.413-2.227-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.054-1.17.249-1.805.413-2.227.218-.56.478-.96.898-1.38.42-.42.82-.68 1.38-.898.422-.164 1.057-.36 2.227-.413 1.266-.058 1.646-.07 4.85-.07M12 0C8.741 0 8.333.014 7.053.072 5.775.13 4.902.333 4.14.63a5.88 5.88 0 0 0-2.126 1.384A5.88 5.88 0 0 0 .63 4.14C.333 4.902.13 5.775.072 7.053.014 8.333 0 8.741 0 12s.014 3.667.072 4.947c.058 1.278.261 2.15.558 2.913a5.88 5.88 0 0 0 1.384 2.126A5.88 5.88 0 0 0 4.14 23.37c.763.297 1.635.5 2.913.558C8.333 23.986 8.741 24 12 24s3.667-.014 4.947-.072c1.278-.058 2.15-.261 2.913-.558a5.88 5.88 0 0 0 2.126-1.384 5.88 5.88 0 0 0 1.384-2.126c.297-.763.5-1.635.558-2.913.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.058-1.278-.261-2.15-.558-2.913a5.88 5.88 0 0 0-1.384-2.126A5.88 5.88 0 0 0 19.86.63C19.097.333 18.225.13 16.947.072 15.667.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z'],
  ['xUrl', 'X', 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z'],
];
export default function Layout() {
  const [open, setOpen] = useState(false);
  const count = useCart((s) => s.items.reduce((a, i) => a + i.quantity, 0));
  const { data: s } = useSettings();
  const { data: me } = useMe();
  const openCookies = useConsent((c) => c.openPanel);
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-forest/10 bg-cream/90 backdrop-blur">
        <div className="container-x flex h-18 items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest font-serif text-lg text-gold">V</span>
            <span className="font-serif text-2xl font-semibold text-forest">{s?.name || 'Verdant Table'}</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {links.map(([to, l]) => <NavLink key={to} to={to} end className={({ isActive }) => `text-sm ${isActive ? 'text-forest font-semibold' : 'text-charcoal/70 hover:text-forest'}`}>{l}</NavLink>)}
          </nav>
          <div className="flex items-center gap-2">
            <Link to={me ? (['admin', 'staff'].includes(me.role) ? '/admin' : '/account') : '/login'} className="rounded-full p-2 text-forest hover:bg-forest/5" aria-label="Account"><User size={20} /></Link>
            <Link to="/cart" className="relative rounded-full p-2 text-forest hover:bg-forest/5" aria-label="Cart">
              <ShoppingBag size={20} />
              {count > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-semibold text-charcoal">{count}</span>}
            </Link>
            <Link to="/menu" className="btn-primary hidden !py-2 sm:inline-flex">Order Now</Link>
            <button className="rounded-full p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <MenuIcon />}</button>
          </div>
        </div>
        {open && <nav className="container-x flex flex-col gap-3 pb-4 md:hidden">
          {links.map(([to, l]) => <Link key={to} to={to} onClick={() => setOpen(false)} className="py-1 text-forest">{l}</Link>)}
          <Link to="/menu" onClick={() => setOpen(false)} className="btn-primary">Order Now</Link>
        </nav>}
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="mt-20 bg-forest text-cream/80">
        <div className="container-x grid gap-10 py-14 md:grid-cols-4">
          <div><p className="font-serif text-3xl text-cream">{s?.name}</p><p className="mt-2 text-sm">{s?.tagline}</p></div>
          <div className="space-y-2 text-sm">
            <p className="flex gap-2"><MapPin size={16} className="text-gold" />{s?.address}</p>
            <p className="flex gap-2"><Phone size={16} className="text-gold" />{s?.phone}</p>
            <p className="flex gap-2"><Clock size={16} className="text-gold" />{s?.openingHours}</p>
            <div className="flex gap-3 pt-2">
              {SOCIAL.filter(([k]) => s?.[k]).map(([k, label, path]) => (
                <a key={k} href={s[k]} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/10 text-cream transition hover:bg-gold hover:text-charcoal">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d={path} /></svg>
                </a>))}
            </div>
          </div>
          <div className="flex flex-col gap-2 text-sm"><Link to="/menu">Menu</Link><Link to="/delivery">Delivery & pickup</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link></div>
          <div className="flex flex-col items-start gap-2 text-sm"><Link to="/privacy">Privacy policy</Link><Link to="/terms">Terms & conditions</Link><Link to="/cookies">Cookie policy</Link>
            <button onClick={openCookies} className="text-left hover:text-cream">Cookie settings</button></div>
        </div>
        <p className="border-t border-cream/10 py-5 text-center text-xs">© {new Date().getFullYear()} {s?.name}. All rights reserved.</p>
      </footer>
      <CookieBanner />
    </div>
  );
}
