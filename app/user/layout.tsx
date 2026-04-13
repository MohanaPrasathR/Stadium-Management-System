import Link from 'next/link';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-dark">
      {/* Top Nav */}
      <nav className="h-16 border-b border-white/5 bg-dark/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-dark font-black text-sm">S</span>
          </div>
          <span className="font-bold tracking-tight">STADIUM<span className="text-primary italic">HUB</span></span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-6 text-sm font-medium text-text-muted">
            <Link href="/user" className="hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/events" className="hover:text-primary transition-colors">Browse Events</Link>
            <Link href="/bookings" className="hover:text-primary transition-colors">My Tickets</Link>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-dark font-bold text-xs cursor-pointer">
            JD
          </div>
        </div>
      </nav>

      <main className="p-6 md:p-10 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
