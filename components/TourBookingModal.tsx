'use client';
import { useEffect, useState } from 'react';

interface TourBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

interface TourEvent { id: number; price: number; capacity: number; is_tour: boolean }

const TOUR_TIMES = ['10:00', '11:30', '13:00', '14:30', '16:00'];
const MAX_GUESTS = 6;
const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

export function TourBookingModal({ isOpen, onClose, userEmail }: TourBookingModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('1');
  const [tour, setTour] = useState<TourEvent | null>(null);
  const [reference, setReference] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || tour) return;
    fetch('/api/events')
      .then((r) => r.json())
      .then((events: TourEvent[]) => setTour(events.find((e) => e.is_tour) ?? null))
      .catch(() => setError('Could not load tour details. Please try again.'));
  }, [isOpen, tour]);

  if (!isOpen) return null;
  const isSuccess = !!reference;
  const guestCount = Math.min(MAX_GUESTS, Math.max(1, parseInt(guests) || 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tour) return;
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: tour.id, quantity: guestCount, tour_date: date, tour_time: time }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Booking failed. Please try again.');
      setReference(data.reference);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const close = () => { setReference(''); setError(''); onClose(); };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-card-border p-8 rounded-2xl w-full max-w-md relative shadow-glass">
        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-4 text-text-muted hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {isSuccess ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              ✓
            </div>
            <h2 className="text-2xl font-black mb-3">Tour Confirmed!</h2>
            <p className="text-text-muted text-sm leading-relaxed">
              Your stadium tour is booked for{' '}
              <strong className="text-white">{date}</strong> at{' '}
              <strong className="text-white">{time}</strong>.
              <br />
              <br />
              Booking reference <strong className="text-primary">{reference}</strong>
              {userEmail && <span className="block mt-2">We&apos;ll send the confirmation to {userEmail}.</span>}
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-black mb-2">Book a Stadium Tour</h2>
            <p className="text-text-muted mb-8 text-sm">Select your preferred date and time to secure your visit.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  className="input-field w-full mt-1"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Time Slot</label>
                  <select
                    className="input-field w-full mt-1 appearance-none bg-card"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select Time</option>
                    {TOUR_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Guests</label>
                  <input
                    type="number"
                    className="input-field w-full mt-1"
                    min="1"
                    max={MAX_GUESTS}
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl mt-2 flex justify-between items-center text-sm font-bold">
                <span className="text-primary tracking-wide">Total Price:</span>
                <span className="font-black text-xl">{tour ? inr(tour.price * guestCount) : '…'}</span>
              </div>

              <button
                type="submit"
                disabled={isLoading || !tour}
                className="w-full btn-primary py-4 mt-2 text-lg text-center font-black tracking-wide disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Booking...
                  </span>
                ) : 'Confirm Booking'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
