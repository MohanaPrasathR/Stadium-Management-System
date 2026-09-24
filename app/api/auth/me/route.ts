import { NextRequest } from 'next/server';
import { currentUser, handler, json } from '@/lib/http';
import { usingDemoStore } from '@/lib/store';

export const GET = handler(async (req: NextRequest) => {
  const u = await currentUser(req);
  return json({ user: u ? { id: u.id, name: u.name, email: u.email, role: u.role } : null, demo: usingDemoStore() });
});
