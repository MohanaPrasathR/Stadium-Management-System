'use client';

import { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Event {
  id: number;
  name: string;
  date: string;
  description: string;
  capacity: number;
}

interface Booking {
  id: number;
  user_name: string;
  event_name: string;
  seat_number: string;
  status: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setUsers([
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'User' },
      { id: 2, name: 'Admin Hub', email: 'admin@stadiumhub.com', role: 'Admin' },
      { id: 3, name: 'Sarah Jane', email: 'sarah@example.com', role: 'User' }
    ]);
    setEvents([
      { id: 1, name: 'Champions League Final', date: 'MAY 24', description: 'The biggest match of the year between the giants of Europe.', capacity: 85000 },
      { id: 2, name: 'World Music Festival', date: 'JUN 15', description: 'A weekend of incredible live performances by top artists.', capacity: 55000 },
      { id: 3, name: 'Tech Conf 2026', date: 'JUL 10', description: 'Annual technology conference featuring keynote speakers and tech demos.', capacity: 15000 },
      { id: 4, name: 'Basketball Showdown', date: 'AUG 05', description: 'National championship finals.', capacity: 20000 }
    ]);
    setBookings([
      { id: 1, user_name: 'John Doe', event_name: 'Champions League Final', seat_number: 'A-42', status: 'Confirmed' },
      { id: 2, user_name: 'Sarah Jane', event_name: 'World Music Festival', seat_number: 'VIP-12', status: 'Pending' },
      { id: 3, user_name: 'Mike Smith', event_name: 'Tech Conf 2026', seat_number: 'C-05', status: 'Confirmed' }
    ]);
  }, []);

  const stats = [
    { label: 'Total Revenue', value: '$124,500', trend: '+12.5%', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Total Bookings', value: '1,280', trend: '+5.2%', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
    { label: 'Active Events', value: '24', trend: '0%', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { label: 'Total Users', value: users.length.toString(), trend: '+2.1%', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="card relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
              </svg>
            </div>
            <div className="text-text-muted text-sm font-medium mb-1">{stat.label}</div>
            <div className="text-3xl font-black mb-2">{stat.value}</div>
            <div className={`text-xs font-bold ${stat.trend.startsWith('+') ? 'text-green-400' : 'text-text-muted'}`}>
              {stat.trend} <span className="text-text-muted ml-1 font-normal text-opacity-50">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Recent Bookings</h3>
            <button className="text-primary text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-text-muted text-sm">
                  <th className="pb-4 font-medium">User</th>
                  <th className="pb-4 font-medium">Event</th>
                  <th className="pb-4 font-medium">Seat</th>
                  <th className="pb-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings.slice(0, 5).map((booking) => (
                  <tr key={booking.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-4 font-medium">{booking.user_name}</td>
                    <td className="py-4 text-text-muted">{booking.event_name}</td>
                    <td className="py-4">{booking.seat_number}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        booking.status === 'Confirmed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                        booking.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                        'bg-primary/10 text-primary border border-primary/20'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-text-muted italic">No recent bookings found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Events List */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Upcoming Events</h3>
            <button className="text-primary text-sm font-bold hover:underline">Manage</button>
          </div>
          <div className="space-y-6">
            {events.slice(0, 4).map((event) => (
              <div key={event.id} className="flex gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-card-border flex flex-col items-center justify-center text-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                  <span className="text-xs font-bold uppercase">{event.date.split(' ')[0]}</span>
                  <span className="text-lg font-black leading-none">{event.date.split(' ')[1]}</span>
                </div>
                <div className="flex-1">
                  <div className="font-bold mb-1 group-hover:text-primary transition-colors">{event.name}</div>
                  <div className="text-sm text-text-muted truncate w-48">{event.description}</div>
                  <div className="mt-2 text-xs font-medium flex items-center gap-2">
                    <span className="text-primary">●</span> {event.capacity} Capacity
                  </div>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="py-10 text-center text-text-muted italic">No upcoming events</div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Visualization Placeholder */}
      <div className="card h-64 flex flex-col justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
        <svg className="w-full h-32 text-primary/20" viewBox="0 0 100 20">
          <path d="M0 10 Q 10 2, 20 12 T 40 8 T 60 15 T 80 5 T 100 12" fill="none" stroke="currentColor" strokeWidth="1" className="animate-pulse" />
        </svg>
        <div className="mt-4 text-center z-10">
          <div className="text-2xl font-black italic">REVENUE GROWTH GRAPH</div>
          <p className="text-text-muted">Real-time data visualization coming soon</p>
        </div>
      </div>
    </div>
  );
}