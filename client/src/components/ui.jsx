import { Loader2 } from 'lucide-react';
export const Spinner = ({ label = 'Loading…' }) => (
  <div className="flex items-center justify-center gap-2 py-16 text-forest/70"><Loader2 className="animate-spin" size={20} />{label}</div>
);
export const ErrorBox = ({ error }) => (
  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error?.message || 'Something went wrong'}</div>
);
export const Empty = ({ title, children }) => (
  <div className="card px-6 py-14 text-center"><h3 className="text-2xl text-forest">{title}</h3><div className="mt-2 text-sm text-charcoal/70">{children}</div></div>
);
export const SectionTitle = ({ eyebrow, title, children }) => (
  <div className="mb-10 text-center">
    {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{eyebrow}</p>}
    <h2 className="mt-2 text-4xl text-forest sm:text-5xl">{title}</h2>
    {children && <p className="mx-auto mt-3 max-w-xl text-charcoal/70">{children}</p>}
  </div>
);
