export type Role = 'user' | 'admin';

export interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  created_at: string;
}

export type PublicUser = Omit<UserRow, 'password_hash'>;

export interface EventRow {
  id: number;
  name: string;
  date: string;          // ISO date, e.g. 2026-11-21
  description: string;
  capacity: number;      // total tickets, or visitors per time slot for tours
  price: number;         // INR per ticket
  is_tour: boolean;
}

export type BookingStatus = 'confirmed' | 'cancelled';

export interface BookingRow {
  id: number;
  reference: string;     // human-friendly code shown on the ticket
  user_id: number;
  event_id: number;
  quantity: number;
  tour_slot: string | null;  // "2026-10-05 11:00" for stadium tours
  status: BookingStatus;
  total_price: number;
  created_at: string;
  user_name?: string;
  event_name?: string;
  event_date?: string;
}

export interface Stats {
  users: number;
  events: number;
  bookings: number;
  activeBookings: number;
  ticketsSold: number;
  revenue: number;
}
