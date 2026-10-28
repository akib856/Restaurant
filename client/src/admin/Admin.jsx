import { useState } from 'react';
import { Navigate, NavLink, Routes, Route } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LayoutDashboard, ClipboardList, UtensilsCrossed, Users, Ticket, Settings as Cog, ScrollText, Image as ImageIcon } from 'lucide-react';
import { api, uploadImage } from '../services/api.js';
import { useMe } from '../hooks/queries.js';
import { money, statusLabel } from '../utils/format.js';
import { Spinner, ErrorBox } from '../components/ui.jsx';

const NEXT = { pending_payment: ['cancelled'], pending_confirmation: ['confirmed', 'cancelled'], confirmed: ['preparing', 'cancelled'],
  preparing: ['ready_for_pickup', 'out_for_delivery'], ready_for_pickup: ['completed'], out_for_delivery: ['completed'] };

function Stats() {
  const [days, setDays] = useState(7);
  const { data, isLoading, error } = useQuery({ queryKey: ['stats', days], queryFn: () => api('/admin/stats?days=' + days).then((r) => r.data), refetchInterval: 30000 });
  if (isLoading) return <Spinner />; if (error) return <ErrorBox error={error} />;
  const max = Math.max(1, ...data.daily.map((d) => d.revenue));
  return (<div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {[['Orders today', data.ordersToday], ['Pending', data.pending], [`Paid revenue (${days}d)`, money(data.revenue)], ['Paid orders', data.paid], ['Unpaid open orders', data.unpaid]].map(([l, v]) => (
        <div key={l} className="card p-5"><p className="text-xs uppercase tracking-wide text-charcoal/60">{l}</p><p className="mt-2 text-2xl font-semibold text-forest">{v}</p></div>))}
    </div>
    <div className="card p-6">
      <div className="flex justify-between"><h3 className="text-xl text-forest">Paid sales</h3>
        <select className="input !w-auto !py-1" value={days} onChange={(e) => setDays(+e.target.value)}>{[7, 30, 90].map((d) => <option key={d} value={d}>Last {d} days</option>)}</select></div>
      {data.daily.length === 0 ? <p className="py-10 text-center text-sm text-charcoal/60">No paid orders in this period.</p> :
        <div className="mt-6 flex h-48 items-end gap-2">{data.daily.map((d) => <div key={d._id} className="flex flex-1 flex-col items-center gap-1" title={`${d._id}: ${money(d.revenue)}`}>
          <div className="w-full rounded-t bg-forest" style={{ height: `${(d.revenue / max) * 100}%` }} /><span className="text-[10px] text-charcoal/50">{d._id.slice(5)}</span></div>)}</div>}
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card p-6"><h3 className="text-xl text-forest">Popular dishes</h3><ul className="mt-3 space-y-2 text-sm">{data.popular.map((p) => <li key={p._id} className="flex justify-between"><span>{p.name}</span><span>{p.soldCount} sold</span></li>)}</ul></div>
      <div className="card p-6"><h3 className="text-xl text-forest">Recent orders</h3><ul className="mt-3 space-y-2 text-sm">{data.recent.map((o) => <li key={o._id} className="flex justify-between"><span>{o.orderNumber}</span><span>{statusLabel(o.status)} · {money(o.total)}</span></li>)}</ul></div>
    </div>
  </div>);
}

function Orders() {
  const qc = useQueryClient();
  const [f, setF] = useState({ status: '', fulfilment: '', paymentStatus: '', q: '' });
  const [open, setOpen] = useState(null);
  const { data, isLoading, error } = useQuery({ queryKey: ['adminOrders', f], queryFn: () => api('/admin/orders?' + new URLSearchParams(f)).then((r) => r.data), refetchInterval: 15000 });
  const act = useMutation({ mutationFn: ({ id, path, body }) => api(`/admin/orders/${id}/${path}`, { method: path === 'status' ? 'PATCH' : 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminOrders'] }) });
  return (<div className="space-y-4">
    <div className="grid gap-2 sm:grid-cols-4">
      <input className="input" placeholder="Search number, name, phone" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
      <select className="input" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option value="">All statuses</option>{['pending_payment', 'pending_confirmation', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'completed', 'cancelled'].map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}</select>
      <select className="input" value={f.fulfilment} onChange={(e) => setF({ ...f, fulfilment: e.target.value })}><option value="">Delivery & pickup</option><option value="delivery">Delivery</option><option value="pickup">Pickup</option></select>
      <select className="input" value={f.paymentStatus} onChange={(e) => setF({ ...f, paymentStatus: e.target.value })}><option value="">Any payment</option>{['unpaid', 'pending', 'paid', 'failed', 'refunded'].map((s) => <option key={s}>{s}</option>)}</select>
    </div>
    {act.error && <ErrorBox error={act.error} />}
    {isLoading ? <Spinner /> : error ? <ErrorBox error={error} /> : <div className="card divide-y divide-charcoal/5">
      {data.length === 0 && <p className="p-6 text-center text-sm text-charcoal/60">No orders match.</p>}
      {data.map((o) => (<div key={o._id} className="p-4">
        <button className="flex w-full flex-wrap items-center justify-between gap-2 text-left" onClick={() => setOpen(open === o._id ? null : o._id)}>
          <span><b>{o.orderNumber}</b> <span className="text-sm text-charcoal/60">· {o.contact.name} · {o.fulfilment} · {new Date(o.createdAt).toLocaleString()}</span></span>
          <span className="text-sm"><span className="rounded-full bg-cream px-2 py-1">{statusLabel(o.status)}</span> <span className="rounded-full bg-cream px-2 py-1">{o.paymentMethod.toUpperCase()} {o.paymentStatus}</span> <b className="ml-2">{money(o.total)}</b></span>
        </button>
        {open === o._id && (<div className="mt-4 grid gap-4 rounded-xl bg-cream/60 p-4 text-sm md:grid-cols-2">
          <div><p><b>Phone:</b> <a href={`tel:${o.contact.phone}`} className="underline">{o.contact.phone}</a></p>{o.contact.email && <p><b>Email:</b> {o.contact.email}</p>}
            {o.address?.line1 && <p><b>Address:</b> {o.address.line1}, {o.address.area} {o.address.instructions && `(${o.address.instructions})`}</p>}
            {o.notes && <p><b>Notes:</b> {o.notes}</p>}
            <ul className="mt-2">{o.items.map((i, k) => <li key={k}>{i.quantity} × {i.name} {i.options.length > 0 && `(${i.options.map((x) => x.choice).join(', ')})`}</li>)}</ul></div>
          <div className="flex flex-wrap content-start gap-2">
            {(NEXT[o.status] || []).filter((s) => !(s === 'ready_for_pickup' && o.fulfilment !== 'pickup') && !(s === 'out_for_delivery' && o.fulfilment !== 'delivery')).map((s) => (
              <button key={s} className={s === 'cancelled' ? 'btn-ghost !py-2 !text-red-700' : 'btn-primary !py-2'} disabled={act.isPending}
                onClick={() => (s !== 'cancelled' || confirm('Cancel this order?')) && act.mutate({ id: o._id, path: 'status', body: { status: s } })}>{s === 'confirmed' ? 'Accept' : statusLabel(s)}</button>))}
            {o.paymentMethod === 'cod' && o.paymentStatus !== 'paid' && o.status !== 'cancelled' &&
              <button className="btn-gold !py-2" onClick={() => confirm(`Confirm ${money(o.total)} cash received?`) && act.mutate({ id: o._id, path: 'cash-collected' })}>Mark cash collected</button>}
          </div>
        </div>)}
      </div>))}
    </div>}
  </div>);
}

function ImagePicker({ value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const pick = async (e) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    setErr(''); setBusy(true);
    try { onChange(await uploadImage(file)); } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  return (<div className="flex items-center gap-3 rounded-xl border border-charcoal/15 bg-white px-3 py-2">
    {value ? <img src={value} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cream"><ImageIcon size={20} className="text-charcoal/40" /></div>}
    <div className="min-w-0 flex-1 text-sm">
      <label className="btn-ghost !cursor-pointer !px-4 !py-2">{busy ? 'Uploading…' : value ? 'Change image' : 'Choose image'}
        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={busy} onChange={pick} /></label>
      {value && !busy && <button type="button" className="ml-2 text-xs text-red-700 underline" onClick={() => onChange('')}>Remove</button>}
      {err && <p className="mt-1 text-xs text-red-700">{err}</p>}
    </div>
  </div>);
}

function MenuAdmin({ isAdmin }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['adminMenu'], queryFn: () => api('/admin/menu').then((r) => r.data) });
  const { data: cats } = useQuery({ queryKey: ['adminCats'], queryFn: () => api('/admin/categories').then((r) => r.data) });
  const [form, setForm] = useState(null);
  const flag = useMutation({ mutationFn: ({ id, body }) => api(`/admin/menu/${id}/flags`, { method: 'PATCH', body }), onSuccess: () => qc.invalidateQueries({ queryKey: ['adminMenu'] }) });
  const save = useMutation({ mutationFn: (f) => api(f._id ? `/admin/menu/${f._id}` : '/admin/menu', { method: f._id ? 'PUT' : 'POST',
      body: { name: f.name, description: f.description, category: f.category, imageUrl: f.imageUrl || undefined, price: Math.round(Number(f.priceTk) * 100), available: f.available, featured: f.featured, popular: f.popular, dietary: f.dietary || [], options: f.options || [] } }),
    onSuccess: () => { setForm(null); qc.invalidateQueries({ queryKey: ['adminMenu'] }); } });
  if (isLoading) return <Spinner />;
  const edit = (i) => setForm(i ? { ...i, category: i.category?._id, priceTk: i.price / 100 } : { name: '', description: '', category: cats?.[0]?._id, priceTk: '', imageUrl: '', available: true, featured: false, popular: false });
  return (<div className="space-y-4">
    {isAdmin && <button className="btn-primary" onClick={() => edit(null)}>+ New dish</button>}
    {form && <form className="card grid gap-3 p-6 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); save.mutate(form); }}>
      <input className="input" placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className="input" placeholder="Price (৳)" type="number" step="0.01" min="0" required value={form.priceTk} onChange={(e) => setForm({ ...form, priceTk: e.target.value })} />
      <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{cats?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
      <ImagePicker value={form.imageUrl} onChange={(imageUrl) => setForm((f) => ({ ...f, imageUrl }))} />
      <textarea className="input sm:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <div className="flex gap-4 text-sm">{['available', 'featured', 'popular'].map((k) => <label key={k} className="flex items-center gap-1"><input type="checkbox" checked={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.checked })} />{k}</label>)}</div>
      <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary" disabled={save.isPending}>Save</button></div>
      {save.error && <div className="sm:col-span-2"><ErrorBox error={save.error} /></div>}
    </form>}
    <div className="card divide-y divide-charcoal/5">{data.map((i) => (
      <div key={i._id} className={`flex flex-wrap items-center gap-4 p-4 ${!i.active ? 'opacity-50' : ''}`}>
        <img src={i.imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />
        <div className="flex-1"><p className="font-semibold">{i.name}</p><p className="text-sm text-charcoal/60">{i.category?.name} · {money(i.price)}</p></div>
        <button className={`rounded-full px-3 py-1 text-xs ${i.available ? 'bg-forest text-cream' : 'bg-red-100 text-red-800'}`} onClick={() => flag.mutate({ id: i._id, body: { available: !i.available } })}>{i.available ? 'Available' : 'Sold out'}</button>
        {isAdmin && <><button className="rounded-full bg-cream px-3 py-1 text-xs" onClick={() => flag.mutate({ id: i._id, body: { featured: !i.featured } })}>{i.featured ? '★ Featured' : '☆ Feature'}</button>
          <button className="text-xs underline" onClick={() => edit(i)}>Edit</button>
          <button className="text-xs underline" onClick={() => flag.mutate({ id: i._id, body: { active: !i.active } })}>{i.active ? 'Deactivate' : 'Activate'}</button></>}
      </div>))}</div>
  </div>);
}

function SimpleList({ path, render, title }) {
  const { data, isLoading, error } = useQuery({ queryKey: [path], queryFn: () => api(path).then((r) => r.data) });
  if (isLoading) return <Spinner />; if (error) return <ErrorBox error={error} />;
  return <div className="card divide-y divide-charcoal/5">{data.length === 0 ? <p className="p-6 text-sm">No {title} yet.</p> : data.map((d) => <div key={d._id || d.id} className="p-4 text-sm">{render(d)}</div>)}</div>;
}

function SettingsAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['adminSettings'], queryFn: () => api('/admin/settings').then((r) => r.data) });
  const [f, setF] = useState(null);
  const save = useMutation({ mutationFn: (b) => api('/admin/settings', { method: 'PUT', body: b }), onSuccess: () => { qc.invalidateQueries(); } });
  if (isLoading) return <Spinner />;
  const v = f || data;
  const text = ['name', 'tagline', 'phone', 'email', 'address', 'openingHours', 'pickupInstructions', 'facebookUrl', 'instagramUrl', 'xUrl'];
  const minor = [['deliveryFee', 'Delivery fee (৳)'], ['freeDeliveryOver', 'Free delivery over (৳)'], ['minOrder', 'Minimum order (৳)']];
  return (<form className="card grid gap-3 p-6 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); save.mutate(v); }}>
    {text.map((k) => <div key={k}><label className="label">{k}</label><input className="input" value={v[k] || ''} onChange={(e) => setF({ ...v, [k]: e.target.value })} /></div>)}
    {minor.map(([k, l]) => <div key={k}><label className="label">{l}</label><input className="input" type="number" value={v[k] / 100} onChange={(e) => setF({ ...v, [k]: Math.round(Number(e.target.value) * 100) })} /></div>)}
    <div><label className="label">VAT rate (%)</label><input className="input" type="number" step="0.1" value={v.taxRate * 100} onChange={(e) => setF({ ...v, taxRate: Number(e.target.value) / 100 })} /></div>
    <div className="flex gap-4 text-sm">{['codEnabled', 'pickupEnabled'].map((k) => <label key={k} className="flex items-center gap-1"><input type="checkbox" checked={v[k]} onChange={(e) => setF({ ...v, [k]: e.target.checked })} />{k}</label>)}</div>
    {save.error && <div className="sm:col-span-2"><ErrorBox error={save.error} /></div>}
    <div className="sm:col-span-2"><button className="btn-primary" disabled={save.isPending}>{save.isSuccess ? 'Saved ✓' : 'Save settings'}</button></div>
  </form>);
}

function Coupons() {
  const qc = useQueryClient();
  const [f, setF] = useState({ code: '', type: 'percent', value: 10, minOrderTk: 0 });
  const add = useMutation({ mutationFn: () => api('/admin/coupons', { method: 'POST', body: { code: f.code, type: f.type, value: f.type === 'fixed' ? Math.round(f.value * 100) : Number(f.value), minOrder: Math.round(f.minOrderTk * 100) } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['/admin/coupons'] }) });
  return (<div className="space-y-4">
    <form className="card flex flex-wrap gap-2 p-4" onSubmit={(e) => { e.preventDefault(); add.mutate(); }}>
      <input className="input !w-40" placeholder="CODE" required value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} />
      <select className="input !w-32" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}><option value="percent">%</option><option value="fixed">৳ fixed</option></select>
      <input className="input !w-28" type="number" value={f.value} onChange={(e) => setF({ ...f, value: +e.target.value })} />
      <input className="input !w-40" type="number" placeholder="Min order ৳" value={f.minOrderTk} onChange={(e) => setF({ ...f, minOrderTk: +e.target.value })} />
      <button className="btn-primary">Add coupon</button>{add.error && <ErrorBox error={add.error} />}
    </form>
    <SimpleList path="/admin/coupons" title="coupons" render={(c) => <span><b>{c.code}</b> · {c.type === 'percent' ? `${c.value}%` : money(c.value)} · min {money(c.minOrder)} · used {c.usedCount} · {c.active ? 'active' : 'inactive'}</span>} />
  </div>);
}

export default function Admin() {
  const { data: me, isLoading } = useMe();
  if (isLoading) return <Spinner />;
  if (!me || !['admin', 'staff'].includes(me.role)) return <Navigate to="/login?next=/admin" replace />;
  const isAdmin = me.role === 'admin';
  const nav = [['', 'Overview', LayoutDashboard], ['orders', 'Orders', ClipboardList], ['menu', 'Menu', UtensilsCrossed],
    ...(isAdmin ? [['customers', 'Customers', Users], ['coupons', 'Coupons', Ticket], ['settings', 'Settings', Cog], ['audit', 'Audit log', ScrollText]] : [])];
  return (
    <div className="container-x grid gap-6 py-10 lg:grid-cols-[220px_1fr]">
      <aside className="flex gap-1 overflow-x-auto lg:flex-col">
        {nav.map(([to, l, I]) => <NavLink key={to} to={`/admin/${to}`} end className={({ isActive }) => `flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm ${isActive ? 'bg-forest text-cream' : 'hover:bg-forest/5'}`}><I size={16} />{l}</NavLink>)}
      </aside>
      <section>
        <Routes>
          <Route index element={<Stats />} />
          <Route path="orders" element={<Orders />} />
          <Route path="menu" element={<MenuAdmin isAdmin={isAdmin} />} />
          {isAdmin && <>
            <Route path="customers" element={<SimpleList path="/admin/customers" title="customers" render={(u) => <span><b>{u.name}</b> · {u.email} · {u.phone} · {u.status}</span>} />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="settings" element={<SettingsAdmin />} />
            <Route path="audit" element={<SimpleList path="/admin/audit" title="entries" render={(a) => <span>{new Date(a.createdAt).toLocaleString()} · <b>{a.actor?.name}</b> · {a.action} · {a.entity} {a.entityId}</span>} />} />
          </>}
        </Routes>
      </section>
    </div>
  );
}
