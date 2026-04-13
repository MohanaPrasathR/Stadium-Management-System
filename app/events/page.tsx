'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Event {
  id: number;
  name: string;
  date: string;
  description: string;
  capacity: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    setEvents([
      { id: 1, name: 'Champions League Final', date: 'MAY 24', description: 'The biggest match of the year between the giants of Europe.', capacity: 85000 },
      { id: 2, name: 'World Music Festival', date: 'JUN 15', description: 'A weekend of incredible live performances by top artists.', capacity: 55000 },
      { id: 3, name: 'Tech Conf 2026', date: 'JUL 10', description: 'Annual technology conference featuring keynote speakers and tech demos.', capacity: 15000 },
      { id: 4, name: 'Basketball Showdown', date: 'AUG 05', description: 'National championship finals.', capacity: 20000 }
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-dark">
      <nav className="h-20 border-b border-white/5 bg-dark/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-dark font-black text-sm">S</span>
          </div>
          <span className="font-bold tracking-tight">STADIUM<span className="text-primary italic">HUB</span></span>
        </Link>
        <Link href="/user" className="text-primary font-bold hover:underline">Go to Dashboard →</Link>
      </nav>

      <main className="p-8 md:p-16 max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-4">Upcoming <span className="text-primary italic">Events</span></h1>
          <p className="text-text-muted text-lg">Explore and book the best experiences at our world-class venues.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.length === 0 ? (
            <div className="col-span-full card text-center py-20 bg-card/10">
              <div className="text-4xl mb-4">🎟️</div>
              <h2 className="text-xl font-bold mb-2">No events scheduled yet</h2>
              <p className="text-text-muted">Check back later for exciting matches and concerts.</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="card group overflow-hidden flex flex-col">
                <div className="h-48 bg-gradient-to-br from-primary/10 to-dark relative overflow-hidden flex items-center justify-center">
                   <div className="text-6xl opacity-50 transition-transform group-hover:scale-125 duration-500">
                     {event.name.toLowerCase().includes('match') ? '⚽' : 
                      event.name.toLowerCase().includes('concert') ? '🎸' : '🎟️'}
                   </div>
                   <div className="absolute top-4 right-4 px-3 py-1 bg-dark/80 backdrop-blur-md rounded-lg text-xs font-bold text-primary border border-primary/20">
                     {event.date}
                   </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{event.name}</h3>
                  <p className="text-text-muted text-sm leading-relaxed mb-6 line-clamp-3">
                    {event.description}
                  </p>
                  <div className="mt-auto flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 font-medium">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      {event.capacity} Slots
                    </div>
                    <button className="px-6 py-2 bg-primary text-dark font-bold rounded-lg hover:bg-primary-hover transition-all">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <footer className="py-20 border-t border-white/5 text-center">
        <p className="text-text-muted">Can't find what you're looking for? <span className="text-primary font-bold cursor-pointer hover:underline">Contact venue management hub</span></p>
      </footer>
    </div>
  );
}