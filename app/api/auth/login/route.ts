import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { body, clientIp, handler, HttpError, rateLimit } from '@/lib/http';
import { cookieOptions, SESSION_COOKIE, signSession } from '@/lib/session';
import { store } from '@/lib/store';
import { email as vEmail } from '@/lib/validate';

// Compared against when the email doesn't exist, so response time doesn't reveal registered emails.
const DUMMY_HASH = bcrypt.hashSync('timing-equaliser-not-a-password', 10);

export const POST = handler(async (req: NextRequest) => {
  const b = await body(req);
  const email = vEmail(b.email);
  rateLimit(`login:${clientIp(req)}:${email}`, 10, 15 * 60 * 1000);
  const user = await store().findUserByEmail(email);
  const ok = await bcrypt.compare(String(b.password ?? ''), user?.password_hash ?? DUMMY_HASH);
  if (!user || !ok) throw new HttpError(401, 'Incorrect email or password.');

  const res = NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  res.cookies.set(SESSION_COOKIE, await signSession(user.id, user.role), cookieOptions);
  return res;
});
