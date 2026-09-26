'use client';

import { useEffect, useState } from 'react';

interface User { id: number; name: string; email: string; role: string; created_at: string }
interface Event { id: number; name: string; date: string; description: string; capacity: number; price: number; is_tour: boolean }
interface Booking {
  id: number; reference: string; user_name: string; event_name: string; quantity: number;
  tour_slot: string | null; status: string; total_price: number; created_at: string;
}
interface Stats { users: number; events: number; bookings: number; activeBookings: number; ticketsSold: number; revenue: number }

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');
const fmtDate = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', date: '', capacity: '1000', price: '500', description: '' });
  const [saving, setSaving] = useState(false);

  const load = () =>
    Promise.all([
      getJson<Stats>('/api/admin/stats'),
      getJson<User[]>('/api/admin/users'),
      getJson<Event[]>('/api/events'),
      getJson<Booking[]>('/api/bookings?scope=all'),
    ])
      .then(([s, u, e, b]) => { setStats(s); setUsers(u); setEvents(e); setBookings(b); setError(''); })
      .catch((e: Error) => setError(e.message));

  useEffect(() => { load(); }, []);

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, capacity: Number(form.capacity), price: Number(form.price) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not create the event.');
      setForm({ name: '', date: '', capacity: '1000', price: '500', description: '' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the event.');
    } finally {
      setSaving(false);
    }
  };

  const tiles = stats ? [
    { label: 'Revenue (confirmed)', value: inr(stats.revenue) },
    { label: 'Tickets sold', value: stats.ticketsSold.toLocaleString('en-IN') },
    { label: 'Active bookings', value: `${stats.activeBookings} / ${stats.bookings}` },
    { label: 'Registered users', value: stats.users.toString() },
  ] : [];

  return (
    <div className="space-y-8">
      {error && <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-bold">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiles.map((t) => (
          <div key={t.label} className="card">
            <div className="text-text-muted text-sm font-medium mb-1">{t.label}</div>
            <div className="text-3xl font-black">{t.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card">
          <h3 className="text-xl font-bold mb-6">Recent bookings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-text-muted text-sm">
                  <th className="pb-4 font-medium">Ref</th>
                  <th className="pb-4 font-medium">Customer</th>
                  <th className="pb-4 font-medium">Event</th>
                  <th className="pb-4 font-medium">Tickets</th>
                  <th className="pb-4 font-medium">Amount</th>
                  <th className="pb-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings.slice(0, 10).map((b) => (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 font-mono text-xs">{b.reference}</td>
                    <td className="py-4 font-medium">{b.user_name}</td>
                    <td className="py-4 text-text-muted">{b.event_name}{b.tour_slot ? ` · ${b.tour_slot}` : ''}</td>
                    <td className="py-4">{b.quantity}</td>
                    <td className="py-4">{inr(b.total_price)}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        b.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr><td colSpan={6} className="py-10 text-center text-text-muted italic">No bookings yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold mb-6">Add an event</h3>
          <form onSubmit={createEvent} className="flex flex-col gap-3">
            <input className="input-field" placeholder="Event name" required minLength={3} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-label="Event name" />
            <input className="input-field" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} aria-label="Date" />
            <div className="grid grid-cols-2 gap-3">
              <input className="input-field" type="number" min={1} required value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} aria-label="Capacity" placeholder="Capacity" />
              <input className="input-field" type="number" min={0} required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} aria-label="Price in INR" placeholder="Price ₹" />
            </div>
            <textarea className="input-field" rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} aria-label="Description" />
            <button className="btn-primary py-2 font-bold disabled:opacity-50" disabled={saving}>{saving ? 'Saving…' : 'Create event'}</button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-xl font-bold mb-6">Events ({events.length})</h3>
          <div className="space-y-4">
            {events.map((e) => (
              <div key={e.id} className="flex justify-between gap-4 border-b border-white/5 pb-3">
                <div>
                  <div className="font-bold">{e.name}</div>
                  <div className="text-sm text-text-muted">{e.is_tour ? 'Daily tour' : fmtDate(e.date)} · {inr(e.price)}</div>
                </div>
                <div className="text-sm text-text-muted whitespace-nowrap">{e.capacity.toLocaleString('en-IN')} {e.is_tour ? 'per slot' : 'capacity'}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="text-xl font-bold mb-6">Users ({users.length})</h3>
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="flex justify-between gap-4 border-b border-white/5 pb-3 text-sm">
                <span className="font-medium">{u.name}</span>
                <span className="text-text-muted truncate">{u.email}</span>
                <span className={u.role === 'admin' ? 'text-primary font-bold' : 'text-text-muted'}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
