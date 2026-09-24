/**
 * Signed session cookie (HMAC-SHA256 via Web Crypto, so it also runs in middleware).
 * The browser only holds an opaque, tamper-proof token. Changing the role inside it
 * breaks the signature, unlike the old localStorage "session".
 */
import type { Role } from './types';

export const SESSION_COOKIE = 'arena_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 8;

export interface Session {
  uid: number;
  role: Role;
  exp: number; // unix seconds
}

const enc = new TextEncoder();

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET (32+ characters) must be set in production');
  }
  return 'dev-only-insecure-secret-change-me-please-0000';
}

const b64url = (buf: ArrayBuffer | Uint8Array) =>
  Buffer.from(buf instanceof Uint8Array ? buf : new Uint8Array(buf)).toString('base64url');

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signSession(uid: number, role: Role): Promise<string> {
  const payload = b64url(enc.encode(JSON.stringify({ uid, role, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS })));
  return `${payload}.${await hmac(payload)}`;
}

export async function verifySession(token: string | undefined | null): Promise<Session | null> {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig || !timingSafeEqual(sig, await hmac(payload))) return null;
  try {
    const s = JSON.parse(Buffer.from(payload, 'base64url').toString()) as Session;
    return s.exp > Date.now() / 1000 ? s : null;
  } catch {
    return null;
  }
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_TTL_SECONDS,
};
