import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';
import { useConsent } from '../store/consent.js';

const CATEGORIES = [
  ['essential', 'Essential', 'Keep you logged in, remember your cart and keep guest orders private. The site cannot work without these.'],
  ['analytics', 'Analytics', 'Help us understand which pages and dishes are popular so we can improve the site.'],
  ['marketing', 'Marketing', 'Used to show you relevant offers on other sites, such as social media ads.'],
];

function Toggle({ checked, disabled, onChange, label }) {
  return (<button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)}
    className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-forest' : 'bg-charcoal/20'} ${disabled ? 'opacity-60' : ''}`}>
    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-5.5' : 'left-0.5'}`} />
  </button>);
}

function SettingsPanel() {
  const { choice, save, closePanel } = useConsent();
  const [sel, setSel] = useState({ essential: true, analytics: !!choice?.analytics, marketing: !!choice?.marketing });
  return (<div className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/40 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="cookie-title">
    <div className="card w-full max-w-lg p-6">
      <div className="flex items-start justify-between"><h2 id="cookie-title" className="text-2xl text-forest">Cookie settings</h2>
        <button className="rounded-full p-1 hover:bg-forest/5" onClick={closePanel} aria-label="Close"><X size={20} /></button></div>
      <ul className="mt-4 divide-y divide-charcoal/10">
        {CATEGORIES.map(([k, title, desc]) => (<li key={k} className="flex items-start justify-between gap-4 py-4">
          <div><p className="font-medium">{title}{k === 'essential' && <span className="ml-2 text-xs text-charcoal/50">Always on</span>}</p><p className="mt-1 text-sm text-charcoal/70">{desc}</p></div>
          <Toggle checked={sel[k]} disabled={k === 'essential'} label={title} onChange={(v) => setSel({ ...sel, [k]: v })} />
        </li>))}
      </ul>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button className="btn-ghost !py-2" onClick={() => save(false, false)}>Reject optional</button>
        <button className="btn-primary !py-2" onClick={() => save(sel.analytics, sel.marketing)}>Save choices</button>
      </div>
    </div>
  </div>);
}

export default function CookieBanner() {
  const { choice, panelOpen, save, openPanel } = useConsent();
  if (panelOpen) return <SettingsPanel />;
  if (choice) return null;
  return (<div className="fixed inset-x-0 bottom-0 z-50 p-4" role="region" aria-label="Cookie notice">
    <div className="card mx-auto flex max-w-4xl flex-col gap-4 p-5 sm:flex-row sm:items-center">
      <Cookie className="hidden shrink-0 text-gold sm:block" size={32} />
      <p className="flex-1 text-sm text-charcoal/80">We use essential cookies to keep you logged in and remember your cart. With your permission we'd also use
        optional cookies to improve the site. <Link to="/cookies" className="underline">Cookie policy</Link></p>
      <div className="flex flex-wrap gap-2">
        <button className="btn-ghost !px-4 !py-2" onClick={openPanel}>Customize</button>
        <button className="btn-ghost !px-4 !py-2" onClick={() => save(false, false)}>Reject</button>
        <button className="btn-primary !px-4 !py-2" onClick={() => save(true, true)}>Accept all</button>
      </div>
    </div>
  </div>);
}
