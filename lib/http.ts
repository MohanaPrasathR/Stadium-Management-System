import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from './session';
import { store } from './store';
import type { UserRow } from './types';

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });

/** Wraps a route handler: HttpError -> JSON error; anything else -> logged 500 without leaking details. */
export function handler<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A) => {
    try {
      return await fn(...args);
    } catch (e) {
      if (e instanceof HttpError) return json({ error: e.message }, e.status);
      console.error(e);
      return json({ error: 'Something went wrong. Please try again.' }, 500);
    }
  };
}

export async function currentUser(req: NextRequest): Promise<UserRow | null> {
  const s = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  return s ? store().findUserById(s.uid) : null;   // re-read role from the DB, never trust the cookie alone
}

export async function requireUser(req: NextRequest): Promise<UserRow> {
  const u = await currentUser(req);
  if (!u) throw new HttpError(401, 'Please log in.');
  return u;
}

export async function requireAdmin(req: NextRequest): Promise<UserRow> {
  const u = await requireUser(req);
  if (u.role !== 'admin') throw new HttpError(403, 'Admins only.');
  return u;
}

export async function body(req: NextRequest): Promise<Record<string, unknown>> {
  try {
    const b = await req.json();
    if (b && typeof b === 'object' && !Array.isArray(b)) return b as Record<string, unknown>;
  } catch { /* fall through */ }
  throw new HttpError(400, 'Invalid JSON body.');
}

/** Tiny fixed-window rate limiter (per server process). */
const hits = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return;
  }
  h.count += 1;
  if (h.count > limit) throw new HttpError(429, 'Too many attempts. Please wait a few minutes and try again.');
}

export const clientIp = (req: NextRequest) =>
  (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
