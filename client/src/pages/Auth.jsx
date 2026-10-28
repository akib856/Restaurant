import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api.js';
import { ErrorBox } from '../components/ui.jsx';
export default function Auth({ mode }) {
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' });
  const [err, setErr] = useState(null); const [busy, setBusy] = useState(false);
  const nav = useNavigate(); const [sp] = useSearchParams(); const qc = useQueryClient();
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr(null);
    try {
      const body = mode === 'login' ? { email: f.email, password: f.password } : { ...f, phone: f.phone || undefined };
      const r = await api('/auth/' + mode, { method: 'POST', body });
      qc.setQueryData(['me'], r.data);
      const next = sp.get('next');
      nav(next && next.startsWith('/') && !next.startsWith('//') ? next : (['admin', 'staff'].includes(r.data.role) ? '/admin' : '/account'));
    } catch (e2) { setErr(e2); } finally { setBusy(false); }
  };
  const inp = (k, type = 'text', label) => <div><label className="label">{label}</label><input className="input" type={type} required={k !== 'phone'} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>;
  return (
    <div className="container-x flex justify-center py-16">
      <form onSubmit={submit} className="card w-full max-w-md space-y-4 p-8">
        <h1 className="text-4xl text-forest">{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
        {mode === 'register' && inp('name', 'text', 'Full name')}
        {inp('email', 'email', 'Email')}
        {mode === 'register' && inp('phone', 'tel', 'Phone (optional)')}
        {inp('password', 'password', mode === 'register' ? 'Password (min 8 characters)' : 'Password')}
        {err && <ErrorBox error={err} />}
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}</button>
        <p className="text-center text-sm">{mode === 'login' ? <>New here? <Link className="text-forest underline" to="/register">Create an account</Link></> : <>Have an account? <Link className="text-forest underline" to="/login">Log in</Link></>}</p>
      </form>
    </div>
  );
}
