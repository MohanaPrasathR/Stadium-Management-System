import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { body, clientIp, handler, HttpError, rateLimit } from '@/lib/http';
import { cookieOptions, SESSION_COOKIE, signSession } from '@/lib/session';
import { store } from '@/lib/store';
import { email as vEmail, password as vPassword, str } from '@/lib/validate';

export const POST = handler(async (req: NextRequest) => {
  rateLimit(`register:${clientIp(req)}`, 5, 60 * 60 * 1000);
  const b = await body(req);
  const name = str(b.name, 'Name', 2, 100);
  const email = vEmail(b.email);
  const password = vPassword(b.password);
  let user;
  try {
    // role is always 'user': admins are created in the database, never from the public form
    user = await store().createUser({ name, email, password_hash: await bcrypt.hash(password, 10), role: 'user' });
  } catch (e) {
    if ((e as Error).message === 'DUPLICATE_EMAIL') throw new HttpError(409, 'An account with this email already exists.');
    throw e;
  }
  const res = NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role }, { status: 201 });
  res.cookies.set(SESSION_COOKIE, await signSession(user.id, user.role), cookieOptions);
  return res;
});
