'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { TourBookingModal } from '../components/TourBookingModal';

export default function Home() {
  const { user, setShowLoginModal, logout } = useAuth();
  const [showTourModal, setShowTourModal] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-dark font-black text-xl">S</span>
          </div>
          <span className="text-xl font-bold tracking-tight">STADIUM<span className="text-primary italic">HUB</span></span>
        </div>
        
        <div className="hidden md:flex gap-8 items-center text-sm font-medium">
          <Link href="#events" className="hover:text-primary transition-colors">Events</Link>
          <Link href="#facilities" className="hover:text-primary transition-colors">Facilities</Link>
          <Link href="#about" className="hover:text-primary transition-colors">About Us</Link>
        </div>

        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <span className="text-sm text-text-muted hidden md:inline">Hi, {user.name}</span>
              <Link href={user.role === 'admin' ? '/admin' : '/user'} className="px-4 py-2 bg-primary text-dark text-sm font-bold rounded-lg hover:bg-primary-hover transition-all">Dashboard</Link>
              <button onClick={logout} className="px-4 py-2 text-sm font-semibold hover:text-danger transition-colors">Logout</button>
            </>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="px-4 py-2 bg-primary text-dark text-sm font-bold rounded-lg hover:bg-primary-hover transition-all">Login</button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-dark/40 via-dark/80 to-dark z-10" />
          <Image 
            src="/hero.png" 
            alt="Stadium Hero" 
            fill 
            className="object-cover opacity-60 scale-105 animate-pulse-slow"
            priority
          />
        </div>

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            MANAGE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">STADIUM</span> <br />
            WITH FUTURE TECH
          </h1>
          <p className="text-lg md:text-xl text-text-muted mb-10 max-w-2xl mx-auto">
            Experience the most advanced stadium management platform. Real-time tracking, seamless bookings, and intelligent event scheduling.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => { if(!user) setShowLoginModal(true); else setShowTourModal(true); }}
              className="btn-primary flex items-center justify-center gap-2"
            >
              Book a Tour
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <Link href="/events" className="px-8 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition-all font-semibold inline-block">
              Explore Events
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Total Events', value: '1.2k+' },
            { label: 'Active Users', value: '50k+' },
            { label: 'Stadiums', value: '85+' },
            { label: 'Support', value: '24/7' },
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="text-4xl font-black text-primary mb-2 group-hover:scale-110 transition-transform">
                {stat.value}
              </div>
              <div className="text-text-muted font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Features Section */}
      <section id="events" className="py-20 px-6 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Management <span className="text-primary italic">Features</span></h2>
              <p className="text-text-muted">Powerful tools designed for venue owners and event organizers.</p>
            </div>
            <Link href="/events" className="text-primary font-bold hover:underline mb-2">View All Features →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card group">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Smart Scheduling</h3>
              <p className="text-text-muted leading-relaxed">AI-driven event scheduling that maximizes venue utility and minimizes conflicts.</p>
            </div>

            <div className="card group">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Ticket Lifecycle</h3>
              <p className="text-text-muted leading-relaxed">End-to-end ticketing from seat selection to digital entry with real-time analytics.</p>
            </div>

            <div className="card group">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8V12l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Live Analytics</h3>
              <p className="text-text-muted leading-relaxed">Monitor stadium occupancy, revenue streaming, and crowd flow in real-time dashboards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-dark font-black text-sm">S</span>
            </div>
            <span className="font-bold tracking-tight">STADIUMHUB</span>
          </div>
          <p className="text-text-muted text-sm text-center">© 2026 StadiumHub Management. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

      {/* Popups */}
      <TourBookingModal 
        isOpen={showTourModal} 
        onClose={() => setShowTourModal(false)}
        userEmail={user?.email}
        userName={user?.name}
      />
    </div>
  );
}
