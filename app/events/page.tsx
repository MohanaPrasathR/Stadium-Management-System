'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../components/AuthProvider';

interface Event {
  id: number;
  name: string;
  date: string;
  description: string;
  capacity: number;
}

const EVENT_ICONS: Record<string, string> = {
  tour: '🏟️',
  match: '⚽',
  football: '⚽',
  cricket: '🏏',
  music: '🎸',
  concert: '🎵',
  festival: '🎉',
  athletics: '🏃',
  race: '🏎️',
  formula: '🏎️',
  default: '🎟️',
};

function getEventIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(EVENT_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return EVENT_ICONS.default;
}

const DEMO_EVENTS: Event[] = [
  { id: 1, name: 'Stadium Tour', date: 'APR 25', description: 'A complete guided tour of the stadium facilities including pitch, locker rooms, and VIP boxes.', capacity: 5000 },
  { id: 2, name: 'Champions League Final', date: 'MAY 24', description: 'The biggest club football match of the year between the giants of Europe.', capacity: 85000 },
  { id: 3, name: 'World Music Festival', date: 'JUN 15', description: 'A weekend of incredible live performances by the world\'s top artists.', capacity: 55000 },
  { id: 4, name: 'Athletics World Championship', date: 'JUL 10', description: 'Watch elite athletes compete for gold at the premier track and field event.', capacity: 70000 },
  { id: 5, name: 'International Cricket T20', date: 'AUG 03', description: 'High-octane T20 cricket action between rival national teams.', capacity: 45000 },
  { id: 6, name: 'Formula E Night Race', date: 'SEP 20', description: 'Electrifying electric racing under the stadium lights.', capacity: 30000 },
];

export default function EventsPage() {
  const { user, setShowLoginModal } = useAuth();
  const [events, setEvents] = useState<Event[]>(DEMO_EVENTS);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch('/api/events');
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setEvents(data);
        }
        // If empty, keep DEMO_EVENTS
      } catch {
        // Keep DEMO_EVENTS if fetch fails
      }
    }
    loadEvents();
  }, []);

  const handleBookNow = async (event: Event) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setBookingId(event.id);
    setBookingSuccess('');
    setBookingError('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: (user as any).id || 'demo-user',
          event_id: event.id,
          seat_number: `General Admission — ${event.date}`,
        }),
      });

      // Send confirmation notification (fire-and-forget)
      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          subject: `Ticket Confirmed: ${event.name}`,
          body: `Hello ${user.name},\n\nYour ticket for "${event.name}" on ${event.date} has been confirmed!\n\nCheck your dashboard to view your booking.\n\nBest regards,\nStadiumHub Team`,
        }),
      }).catch(() => {});

      setBookingSuccess(`✅ Ticket booked for ${event.name}! Check your dashboard.`);
    } catch {
      setBookingError('Booking failed. Please try again.');
    } finally {
      setBookingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Nav */}
      <nav className="h-20 border-b border-white/5 bg-dark/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-dark font-black text-sm">S</span>
          </div>
          <span className="font-bold tracking-tight">STADIUM<span className="text-primary italic">HUB</span></span>
        </Link>
        {user ? (
          <Link href={user.role === 'admin' ? '/admin' : '/user'} className="text-primary font-bold hover:underline">
            Go to Dashboard →
          </Link>
        ) : (
          <button onClick={() => setShowLoginModal(true)} className="text-primary font-bold hover:underline">
            Login to Book →
          </button>
        )}
      </nav>

      <main className="p-6 sm:p-12 lg:p-16 max-w-7xl mx-auto">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            Upcoming <span className="text-primary italic">Events</span>
          </h1>
          <p className="text-text-muted text-base sm:text-lg">
            Explore and book the best experiences at our world-class venues.
          </p>
        </div>

        {/* Global success / error banners */}
        {bookingSuccess && (
          <div className="mb-8 p-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl font-bold flex justify-between items-center">
            {bookingSuccess}
            <button onClick={() => setBookingSuccess('')} className="text-green-400/50 hover:text-green-400">✕</button>
          </div>
        )}
        {bookingError && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-bold flex justify-between items-center">
            {bookingError}
            <button onClick={() => setBookingError('')} className="text-red-400/50 hover:text-red-400">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="card group overflow-hidden flex flex-col">
              {/* Card header */}
              <div className="h-48 bg-gradient-to-br from-primary/10 via-dark to-dark/80 relative overflow-hidden flex items-center justify-center border-b border-white/5">
                <div className="text-7xl opacity-60 transition-transform group-hover:scale-125 duration-500 select-none">
                  {getEventIcon(event.name)}
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 bg-dark/80 backdrop-blur-md rounded-lg text-xs font-bold text-primary border border-primary/20">
                  {event.date}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
              </div>

              {/* Card body */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {event.name}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                  {event.description}
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-text-muted">{event.capacity?.toLocaleString()} slots</span>
                  </div>
                  <button
                    onClick={() => handleBookNow(event)}
                    disabled={bookingId === event.id}
                    className="px-5 py-2 bg-primary text-dark font-bold rounded-lg hover:bg-primary-hover transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {bookingId === event.id ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Booking…
                      </>
                    ) : 'Book Now'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-16 border-t border-white/5 text-center">
        <p className="text-text-muted">
          Can't find what you're looking for?{' '}
          <Link href="/" className="text-primary font-bold hover:underline">
            Contact venue management
          </Link>
        </p>
      </footer>
    </div>
  );
}