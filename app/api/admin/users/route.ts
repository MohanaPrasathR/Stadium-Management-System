import { NextRequest } from 'next/server';
import { handler, json, requireAdmin } from '@/lib/http';
import { store } from '@/lib/store';

export const GET = handler(async (req: NextRequest) => {
  await requireAdmin(req);
  return json(await store().listUsers());   // password hashes are never returned
});
