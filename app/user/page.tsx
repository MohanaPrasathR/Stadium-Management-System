'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../components/AuthProvider';

interface Booking {
  id: number;
  reference: string;
  event_name: string;
  event_date: string;
  quantity: number;
  tour_slot: string | null;
  status: 'confirmed' | 'cancelled';
  total_price: number;
}

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');
const when = (b: Booking) => {
  const iso = b.tour_slot ? b.tour_slot.slice(0, 10) : b.event_date;
  const date = new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  return b.tour_slot ? `${date} · ${b.tour_slot.slice(11)}` : date;
};
const isPast = (b: Booking) => new Date(`${b.tour_slot ? b.tour_slot.slice(0, 10) : b.event_date}T23:59:59`) < new Date();

export default function UserDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/bookings');
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Could not load your bookings.');
      setBookings(await res.json());
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cancel = async (b: Booking) => {
    if (!window.confirm(`Cancel ${b.quantity} ticket(s) for ${b.event_name}?`)) return;
    const res = await fetch(`/api/bookings/${b.id}`, { method: 'DELETE' });
    if (!res.ok) setError((await res.json().catch(() => ({}))).error || 'Could not cancel the booking.');
    load();
  };

  const upcoming = bookings.filter((b) => b.status === 'confirmed' && !isPast(b));
  const stats = [
    { label: 'Upcoming bookings', value: upcoming.length, color: 'text-primary' },
    { label: 'Tickets held', value: upcoming.reduce((s, b) => s + b.quantity, 0), color: 'text-white' },
    { label: 'Past or cancelled', value: bookings.length - upcoming.length, color: 'text-text-muted' },
  ];

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-4xl font-black mb-2">Welcome back, <span className="text-primary italic">{user?.name}</span></h1>
        <p className="text-text-muted">
          {upcoming.length ? `You have ${upcoming.length} upcoming booking${upcoming.length > 1 ? 's' : ''}.` : 'No upcoming bookings yet.'}
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">{stat.label}</div>
            <div className={`text-5xl font-black ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-bold">Your bookings</h2>
          <Link href="/events" className="text-primary text-sm font-bold hover:underline">Browse events</Link>
        </div>

        {error && <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-bold">{error}</div>}

        {loading ? (
          <div className="card text-center py-16 text-text-muted">Loading your bookings…</div>
        ) : bookings.length === 0 ? (
          <div className="card text-center py-20 bg-card/20 border-dashed border-2">
            <div className="text-text-muted mb-4 italic">You haven&apos;t booked anything yet</div>
            <Link href="/events" className="btn-primary inline-block">Browse Events</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b.id} className={`card flex flex-col md:flex-row gap-6 items-center ${b.status === 'cancelled' || isPast(b) ? 'opacity-60' : ''}`}>
                <div className="w-full md:w-32 h-20 bg-primary/10 rounded-xl flex flex-col items-center justify-center border border-primary/20 shrink-0">
                  <span className="text-xs text-text-muted uppercase tracking-wider">Ref</span>
                  <span className="font-black text-primary text-sm">{b.reference}</span>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold">{b.event_name}</h3>
                  <div className="text-text-muted text-sm mt-1">
                    {when(b)} · <span className="text-white font-bold">{b.quantity} ticket{b.quantity > 1 ? 's' : ''}</span> · {inr(b.total_price)}
                  </div>
                </div>
                <div className="flex flex-col items-center md:items-end gap-2">
                  <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                    b.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {b.status === 'confirmed' && isPast(b) ? 'attended' : b.status}
                  </span>
                  {b.status === 'confirmed' && !isPast(b) && (
                    <button onClick={() => cancel(b)} className="text-sm font-bold hover:text-danger transition-colors underline underline-offset-4">
                      Cancel booking
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
