import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { api } from '../services/api.js';
import { useMe } from '../hooks/queries.js';
import { OrderView } from './OrderSuccess.jsx';
import { Spinner, Empty } from '../components/ui.jsx';
export default function Account() {
  const { data: me, isLoading } = useMe(); const qc = useQueryClient();
  const orders = useQuery({ queryKey: ['myOrders'], enabled: !!me, queryFn: () => api('/orders/mine').then((r) => r.data) });
  const [p, setP] = useState(null);
  const save = useMutation({ mutationFn: (b) => api('/auth/me', { method: 'PATCH', body: b }), onSuccess: (r) => qc.setQueryData(['me'], r.data) });
  const cancel = useMutation({ mutationFn: (id) => api(`/orders/${id}/cancel`, { method: 'POST' }), onSuccess: () => orders.refetch() });
  if (isLoading) return <Spinner />;
  if (!me) return <Navigate to="/login?next=/account" replace />;
  const prof = p || { name: me.name, phone: me.phone || '', line1: me.addresses?.[0]?.line1 || '', area: me.addresses?.[0]?.area || '' };
  const logout = async () => { await api('/auth/logout', { method: 'POST' }); qc.setQueryData(['me'], null); };
  return (
    <div className="container-x py-14">
      <div className="flex items-center justify-between"><h1 className="text-5xl text-forest">My account</h1><button className="btn-ghost" onClick={logout}>Log out</button></div>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <form className="card h-fit space-y-3 p-6" onSubmit={(e) => { e.preventDefault(); save.mutate({ name: prof.name, phone: prof.phone, addresses: prof.line1 ? [{ label: 'Home', line1: prof.line1, area: prof.area }] : [] }); }}>
          <h2 className="text-2xl text-forest">Profile</h2>
          <p className="text-sm text-charcoal/60">{me.email}</p>
          {[['name', 'Name'], ['phone', 'Phone'], ['line1', 'Saved address'], ['area', 'Area']].map(([k, l]) => (
            <div key={k}><label className="label">{l}</label><input className="input" value={prof[k]} onChange={(e) => setP({ ...prof, [k]: e.target.value })} /></div>))}
          <button className="btn-primary w-full" disabled={save.isPending}>{save.isSuccess ? 'Saved ✓' : 'Save'}</button>
        </form>
        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-2xl text-forest">Order history</h2>
          {orders.isLoading ? <Spinner /> : !orders.data?.length ? <Empty title="No orders yet">Your orders will appear here.</Empty>
            : orders.data.map((o) => <div key={o._id}><OrderView order={o} />
              {['pending_payment', 'pending_confirmation'].includes(o.status) && <button className="mt-2 text-sm text-red-700 underline" onClick={() => confirm('Cancel this order?') && cancel.mutate(o._id)}>Cancel order</button>}</div>)}
        </div>
      </div>
    </div>
  );
}
