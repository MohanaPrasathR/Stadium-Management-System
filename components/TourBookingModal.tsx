'use client';
import { useState } from 'react';

interface TourBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
}

export function TourBookingModal({ isOpen, onClose, userEmail, userName }: TourBookingModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('1');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && time && guests) {
      // Simulate API Booking Call
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-card-border p-8 rounded-2xl w-full max-w-md relative shadow-glass animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {isSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ✓
            </div>
            <h2 className="text-2xl font-black mb-2">Tour Confirmed!</h2>
            <p className="text-text-muted text-sm">
              Your stadium tour is scheduled for <strong className="text-white">{date}</strong> at <strong className="text-white">{time}</strong>.
              <br/>We've sent a detailed itinerary to {userEmail}.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-black mb-2">Book a Stadium Tour</h2>
            <p className="text-text-muted mb-8 text-sm">Select your preferred date and time to secure your visit.</p>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Date</label>
                <input 
                  type="date" 
                  className="input-field w-full mt-1" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
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
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="3:30 PM">3:30 PM</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Guests</label>
                  <input 
                    type="number" 
                    className="input-field w-full mt-1" 
                    min="1" 
                    max="10"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl mt-2 flex justify-between items-center text-sm font-bold">
                <span className="text-primary tracking-wide">Total Price:</span>
                <span className="font-black text-xl">${parseInt(guests) * 25 || 25}</span>
              </div>

              <button type="submit" className="w-full btn-primary py-4 mt-2 text-lg text-center font-black tracking-wide">
                Confirm Booking
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
