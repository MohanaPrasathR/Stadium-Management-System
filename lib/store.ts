/**
 * Data access layer.
 *
 * - With DB_HOST set, everything goes to MySQL (schema in lib/setup-db.js).
 * - Without it, an in-memory demo store is used: seeded on start, reset on restart, and it
 *   works on read-only hosts like Vercel. It is never used as a silent fallback when MySQL
 *   fails. Database errors surface as errors instead of quietly writing somewhere else.
 */
import mysql from 'mysql2/promise';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import type { BookingRow, EventRow, PublicUser, Stats, UserRow } from './types';

export class CapacityError extends Error {}

const ticketsLeftMessage = (left: number) =>
  left <= 0 ? "Sold out." : `Only ${left} ticket${left === 1 ? "" : "s"} left.`;

export interface NewBooking {
  user_id: number;
  event_id: number;
  quantity: number;
  tour_slot: string | null;
  total_price: number;
}

export interface Store {
  findUserByEmail(email: string): Promise<UserRow | null>;
  findUserById(id: number): Promise<UserRow | null>;
  createUser(u: Omit<UserRow, 'id' | 'created_at'>): Promise<UserRow>;
  listUsers(): Promise<PublicUser[]>;
  listEvents(): Promise<EventRow[]>;
  getEvent(id: number): Promise<EventRow | null>;
  createEvent(e: Omit<EventRow, 'id'>): Promise<EventRow>;
  listBookings(filter: { userId?: number }): Promise<BookingRow[]>;
  getBooking(id: number): Promise<BookingRow | null>;
  /** Inserts only if the event (or tour slot) still has room. Atomic. */
  createBooking(b: NewBooking, capacity: number): Promise<BookingRow>;
  cancelBooking(id: number): Promise<void>;
  stats(): Promise<Stats>;
}

export const newReference = () => 'AP-' + randomBytes(4).toString('hex').toUpperCase();

// ------------------------------------------------------------------ demo data
const inDays = (d: number) => new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);

export const DEMO_EVENTS: Omit<EventRow, 'id'>[] = [
  { name: 'Stadium Tour', date: inDays(0), description: 'Guided tour of the pitch, dressing rooms, press box and VIP lounges. Runs daily; choose a date and time slot.', capacity: 25, price: 499, is_tour: true },
  { name: 'ISL: Chennaiyin FC vs Bengaluru FC', date: inDays(12), description: 'Southern derby under the lights. Gates open 90 minutes before kick-off.', capacity: 40000, price: 650, is_tour: false },
  { name: 'Monsoon Music Festival', date: inDays(26), description: 'Two stages, twelve artists and a closing fireworks show.', capacity: 30000, price: 1499, is_tour: false },
  { name: 'State Athletics Championship', date: inDays(40), description: 'Track and field finals featuring national record holders.', capacity: 20000, price: 250, is_tour: false },
  { name: 'T20 Charity Cricket Match', date: inDays(55), description: 'Legends XI vs Stars XI. All proceeds go to children\'s sports programmes.', capacity: 35000, price: 400, is_tour: false },
];

// ------------------------------------------------------------------ memory store
class MemoryStore implements Store {
  private users: UserRow[] = [];
  private events: EventRow[] = [];
  private bookings: BookingRow[] = [];
  private ready: Promise<void>;

  constructor() {
    this.ready = this.seed();
  }

  private async seed() {
    const hash = await bcrypt.hash(process.env.DEMO_PASSWORD || 'Arena@2026', 10);
    const now = new Date().toISOString();
    this.users.push({ id: 1, name: 'Admin', email: 'admin@arenapass.demo', password_hash: hash, role: 'admin', created_at: now });
    this.users.push({ id: 2, name: 'Demo Fan', email: 'fan@arenapass.demo', password_hash: hash, role: 'user', created_at: now });
    DEMO_EVENTS.forEach((e, i) => this.events.push({ ...e, id: i + 1 }));
  }

  private enrich(b: BookingRow): BookingRow {
    const ev = this.events.find((e) => e.id === b.event_id);
    const u = this.users.find((x) => x.id === b.user_id);
    return { ...b, event_name: ev?.name, event_date: ev?.date, user_name: u?.name };
  }

  async findUserByEmail(email: string) { await this.ready; return this.users.find((u) => u.email === email) ?? null; }
  async findUserById(id: number) { await this.ready; return this.users.find((u) => u.id === id) ?? null; }
  async createUser(u: Omit<UserRow, 'id' | 'created_at'>) {
    await this.ready;
    if (this.users.some((x) => x.email === u.email)) throw new Error('DUPLICATE_EMAIL');
    const row = { ...u, id: this.users.length + 1, created_at: new Date().toISOString() };
    this.users.push(row);
    return row;
  }
  async listUsers() { await this.ready; return this.users.map(({ password_hash: _, ...u }) => u); }
  async listEvents() { await this.ready; return [...this.events].sort((a, b) => a.date.localeCompare(b.date)); }
  async getEvent(id: number) { await this.ready; return this.events.find((e) => e.id === id) ?? null; }
  async createEvent(e: Omit<EventRow, 'id'>) {
    await this.ready;
    const row = { ...e, id: Math.max(0, ...this.events.map((x) => x.id)) + 1 };
    this.events.push(row);
    return row;
  }
  async listBookings({ userId }: { userId?: number }) {
    await this.ready;
    return this.bookings.filter((b) => userId === undefined || b.user_id === userId)
      .map((b) => this.enrich(b)).sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  async getBooking(id: number) { await this.ready; const b = this.bookings.find((x) => x.id === id); return b ? this.enrich(b) : null; }
  async createBooking(b: NewBooking, capacity: number) {
    await this.ready;
    // single-threaded JS: check-and-insert cannot interleave
    const sold = this.bookings
      .filter((x) => x.event_id === b.event_id && x.status === 'confirmed' && x.tour_slot === b.tour_slot)
      .reduce((s, x) => s + x.quantity, 0);
    if (sold + b.quantity > capacity) throw new CapacityError(ticketsLeftMessage(capacity - sold));
    const row: BookingRow = { ...b, id: this.bookings.length + 1, reference: newReference(), status: 'confirmed',
      created_at: new Date().toISOString() };
    this.bookings.push(row);
    return this.enrich(row);
  }
  async cancelBooking(id: number) { await this.ready; const b = this.bookings.find((x) => x.id === id); if (b) b.status = 'cancelled'; }
  async stats(): Promise<Stats> {
    await this.ready;
    const active = this.bookings.filter((b) => b.status === 'confirmed');
    return { users: this.users.length, events: this.events.length, bookings: this.bookings.length,
      activeBookings: active.length, ticketsSold: active.reduce((s, b) => s + b.quantity, 0),
      revenue: active.reduce((s, b) => s + b.total_price, 0) };
  }
}

// ------------------------------------------------------------------ MySQL store
class MySqlStore implements Store {
  private pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'stadium_management',
    waitForConnections: true,
    connectionLimit: 10,
    dateStrings: true,
  });

  private async rows<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    const [rows] = await this.pool.execute(sql, params as any[]);
    return rows as T[];
  }

  private static readonly BOOKING_SELECT = `
    SELECT b.*, u.name AS user_name, e.name AS event_name, DATE_FORMAT(e.date, '%Y-%m-%d') AS event_date
    FROM bookings b JOIN users u ON u.id = b.user_id JOIN events e ON e.id = b.event_id`;

  private static toEvent = (e: any): EventRow => ({ ...e, is_tour: !!e.is_tour, price: Number(e.price) });
  private static toBooking = (b: any): BookingRow => ({ ...b, total_price: Number(b.total_price) });

  async findUserByEmail(email: string) { return (await this.rows<UserRow>('SELECT * FROM users WHERE email = ?', [email]))[0] ?? null; }
  async findUserById(id: number) { return (await this.rows<UserRow>('SELECT * FROM users WHERE id = ?', [id]))[0] ?? null; }
  async createUser(u: Omit<UserRow, 'id' | 'created_at'>) {
    try {
      const [res]: any = await this.pool.execute(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [u.name, u.email, u.password_hash, u.role]);
      return (await this.findUserById(res.insertId))!;
    } catch (e: any) {
      if (e.code === 'ER_DUP_ENTRY') throw new Error('DUPLICATE_EMAIL');
      throw e;
    }
  }
  async listUsers() { return this.rows<PublicUser>('SELECT id, name, email, role, created_at FROM users ORDER BY id'); }
  async listEvents() {
    return (await this.rows<any>("SELECT id, name, DATE_FORMAT(date, '%Y-%m-%d') AS date, description, capacity, price, is_tour FROM events ORDER BY date"))
      .map(MySqlStore.toEvent);
  }
  async getEvent(id: number) {
    const e = (await this.rows<any>("SELECT id, name, DATE_FORMAT(date, '%Y-%m-%d') AS date, description, capacity, price, is_tour FROM events WHERE id = ?", [id]))[0];
    return e ? MySqlStore.toEvent(e) : null;
  }
  async createEvent(e: Omit<EventRow, 'id'>) {
    const [res]: any = await this.pool.execute(
      'INSERT INTO events (name, date, description, capacity, price, is_tour) VALUES (?, ?, ?, ?, ?, ?)',
      [e.name, e.date, e.description, e.capacity, e.price, e.is_tour ? 1 : 0]);
    return (await this.getEvent(res.insertId))!;
  }
  async listBookings({ userId }: { userId?: number }) {
    const where = userId === undefined ? '' : ' WHERE b.user_id = ?';
    return (await this.rows<any>(MySqlStore.BOOKING_SELECT + where + ' ORDER BY b.created_at DESC',
      userId === undefined ? [] : [userId])).map(MySqlStore.toBooking);
  }
  async getBooking(id: number) {
    const b = (await this.rows<any>(MySqlStore.BOOKING_SELECT + ' WHERE b.id = ?', [id]))[0];
    return b ? MySqlStore.toBooking(b) : null;
  }
  async createBooking(b: NewBooking, capacity: number) {
    const conn = await this.pool.getConnection();
    try {
      await conn.beginTransaction();
      // lock the event row so two buyers can't both take the last tickets
      await conn.execute('SELECT id FROM events WHERE id = ? FOR UPDATE', [b.event_id]);
      const [soldRows]: any = await conn.execute(
        `SELECT COALESCE(SUM(quantity), 0) AS sold FROM bookings
         WHERE event_id = ? AND status = 'confirmed' AND (tour_slot <=> ?)`, [b.event_id, b.tour_slot]);
      const sold = Number(soldRows[0].sold);
      if (sold + b.quantity > capacity) throw new CapacityError(ticketsLeftMessage(capacity - sold));
      const [res]: any = await conn.execute(
        `INSERT INTO bookings (reference, user_id, event_id, quantity, tour_slot, status, total_price)
         VALUES (?, ?, ?, ?, ?, 'confirmed', ?)`,
        [newReference(), b.user_id, b.event_id, b.quantity, b.tour_slot, b.total_price]);
      await conn.commit();
      return (await this.getBooking(res.insertId))!;
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }
  async cancelBooking(id: number) { await this.pool.execute("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [id]); }
  async stats(): Promise<Stats> {
    const [r] = await this.rows<any>(`SELECT
      (SELECT COUNT(*) FROM users) AS users, (SELECT COUNT(*) FROM events) AS events,
      (SELECT COUNT(*) FROM bookings) AS bookings,
      (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed') AS activeBookings,
      (SELECT COALESCE(SUM(quantity), 0) FROM bookings WHERE status = 'confirmed') AS ticketsSold,
      (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status = 'confirmed') AS revenue`);
    return Object.fromEntries(Object.entries(r).map(([k, v]) => [k, Number(v)])) as unknown as Stats;
  }
}

// one instance per server process (survives Next.js hot reload in dev)
const g = globalThis as unknown as { __arenaStore?: Store };
export function store(): Store {
  if (!g.__arenaStore) g.__arenaStore = process.env.DB_HOST ? new MySqlStore() : new MemoryStore();
  return g.__arenaStore;
}
export const usingDemoStore = () => !process.env.DB_HOST;
