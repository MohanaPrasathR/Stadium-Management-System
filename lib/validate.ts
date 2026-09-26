import { HttpError } from './http';

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i;
export const TOUR_TIMES = ['10:00', '11:30', '13:00', '14:30', '16:00'];

export function str(v: unknown, field: string, min = 1, max = 255): string {
  if (typeof v !== 'string' || v.trim().length < min || v.trim().length > max) {
    throw new HttpError(400, `${field} must be ${min}-${max} characters.`);
  }
  return v.trim();
}

export function int(v: unknown, field: string, min: number, max: number): number {
  const n = typeof v === 'string' ? Number(v) : v;
  if (typeof n !== 'number' || !Number.isInteger(n) || n < min || n > max) {
    throw new HttpError(400, `${field} must be a whole number from ${min} to ${max}.`);
  }
  return n;
}

export function email(v: unknown): string {
  const e = str(v, 'Email', 3, 255).toLowerCase();
  if (!EMAIL_RE.test(e)) throw new HttpError(400, 'Enter a valid email address.');
  return e;
}

export function password(v: unknown): string {
  if (typeof v !== 'string' || v.length < 8 || v.length > 128) {
    throw new HttpError(400, 'Password must be 8-128 characters.');
  }
  if (!/[a-zA-Z]/.test(v) || !/\d/.test(v)) throw new HttpError(400, 'Password needs at least one letter and one number.');
  return v;
}

export function isoDate(v: unknown, field = 'Date'): string {
  const s = str(v, field, 10, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(Date.parse(s))) throw new HttpError(400, `${field} must be YYYY-MM-DD.`);
  return s;
}

/** Tour slot must be a real future date within 60 days and one of the fixed start times. */
export function tourSlot(date: unknown, time: unknown, now = new Date()): string {
  const d = isoDate(date, 'Tour date');
  if (typeof time !== 'string' || !TOUR_TIMES.includes(time)) throw new HttpError(400, 'Pick one of the listed tour times.');
  const start = new Date(`${d}T${time}:00`);
  if (start.getTime() < now.getTime()) throw new HttpError(400, 'That tour time has already started.');
  if (start.getTime() > now.getTime() + 60 * 86400000) throw new HttpError(400, 'Tours can be booked up to 60 days ahead.');
  return `${d} ${time}`;
}
