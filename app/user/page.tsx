'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../components/AuthProvider';
import { supabase } from '../../lib/supabaseClient';

interface Booking {
  id: number;
  user_name: string;
  event_name: string;
  seat_number: string;
  status: string;
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    async function loadBookings() {
      if (!user) return;
      const { data } = await supabase
        .from('bookings')
        .select('id, guests, status, events(name)')
        .eq('user_id', (user as any).id);

      if (data && data.length > 0) {
        setBookings(data.map((b: any) => ({
          id: b.id,
          user_name: user.name,
          event_name: b.events?.name || 'Unknown Event',
          seat_number: `${b.guests || 1} Slot(s)`,
          status: b.status || 'Confirmed'
        } as Booking)));
      } else {
        setBookings([]);
      }
    }
    loadBookings();
  }, [user]);

  const stats = [
    { label: 'Active Tickets', value: bookings.filter(b => b.status === 'Confirmed').length, color: 'text-primary' },
    { label: 'Pending', value: bookings.filter(b => b.status === 'Pending').length, color: 'text-yellow-400' },
    { label: 'Past Events', value: 3, color: 'text-text-muted' },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <section>
        <h1 className="text-4xl font-black mb-2">Welcome back, <span className="text-primary italic">{user?.name || 'Guest'}</span></h1>
        <p className="text-text-muted">You have {bookings.filter(b => b.status === 'Confirmed').length} upcoming events this week.</p>
      </section>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="card relative overflow-hidden group">
            <div className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">{stat.label}</div>
            <div className={`text-5xl font-black ${stat.color} transition-transform group-hover:scale-110`}>{stat.value}</div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/5 rounded-full blur-2xl" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* My Bookings Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-2xl font-bold">Your Bookings</h2>
            <Link href="/bookings" className="text-primary text-sm font-bold hover:underline">See All</Link>
          </div>

          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="card text-center py-20 bg-card/20 border-dashed border-2">
                <div className="text-text-muted mb-4 italic">No active bookings found</div>
                <Link href="/events" className="btn-primary inline-block">Browse Events</Link>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="card flex flex-col md:flex-row gap-6 items-center group">
                  <div className="w-full md:w-32 h-20 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shrink-0">
                    <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{booking.event_name}</h3>
                    <div className="text-text-muted text-sm mt-1">
                      Seat: <span className="text-white font-bold">{booking.seat_number}</span> • Gate 4 • Section B
                    </div>
                  </div>
                  <div className="flex flex-col items-center md:items-end gap-2">
                    <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                      booking.status === 'Confirmed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-primary/10 text-primary border border-primary/20'
                    }`}>
                      {booking.status}
                    </span>
                    <button className="text-sm font-bold hover:text-primary transition-colors underline underline-offset-4">Download PDF</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar: Recommended */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Trending Now</h2>
          <div className="card space-y-6">
            {[
              { name: 'Champions League Final', cate: 'Sports', img: '⚽' },
              { name: 'World Music Festival', cate: 'Concert', img: '🎵' },
              { name: 'Red Bull Racing Expo', cate: 'Exhibit', img: '🏎️' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 group cursor-pointer">
                <div className="w-12 h-12 flex items-center justify-center text-3xl bg-dark rounded-xl border border-white/5 transition-transform group-hover:scale-110">
                  {item.img}
                </div>
                <div>
                  <div className="font-bold group-hover:text-primary transition-colors">{item.name}</div>
                  <div className="text-xs text-text-muted font-bold uppercase tracking-wider">{item.cate}</div>
                </div>
              </div>
            ))}
            <button className="w-full py-3 border border-white/5 rounded-xl text-sm font-bold hover:bg-white/5 transition-colors mt-4">
              Explore Discover
            </button>
          </div>

          <div className="card bg-gradient-to-br from-primary/20 to-cyan-500/10 border-primary/30 relative overflow-hidden group">
             <div className="relative z-10">
               <h3 className="text-lg font-black mb-2 italic">UPGRADE TO VIP</h3>
               <p className="text-xs text-text-muted mb-4">Get exclusive access to private boxes and meet-and-greet sessions.</p>
               <button className="text-xs font-bold px-4 py-2 bg-primary text-dark rounded-lg hover:bg-primary-hover">Learn More</button>
             </div>
             <div className="absolute -bottom-8 -right-8 text-8xl opacity-10 blur-sm group-hover:scale-125 transition-transform">💎</div>
          </div>
        </div>
      </div>
    </div>
  );
}