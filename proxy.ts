import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from './lib/session';

/** Server-side page guard: /user needs a session, /admin needs an admin session. */
export async function proxy(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const { pathname } = req.nextUrl;
  if (!session || (pathname.startsWith('/admin') && session.role !== 'admin')) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('login', '1');
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/user/:path*', '/admin/:path*'] };
