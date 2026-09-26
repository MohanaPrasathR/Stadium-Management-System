import { NextRequest } from 'next/server';
import { body, handler, json, requireAdmin } from '@/lib/http';
import { store } from '@/lib/store';
import { int, isoDate, str } from '@/lib/validate';

export const GET = handler(async () => json(await store().listEvents()));

export const POST = handler(async (req: NextRequest) => {
  await requireAdmin(req);
  const b = await body(req);
  const event = await store().createEvent({
    name: str(b.name, 'Name', 3, 120),
    date: isoDate(b.date),
    description: str(b.description ?? '', 'Description', 0, 1000),
    capacity: int(b.capacity, 'Capacity', 1, 200000),
    price: int(b.price, 'Price', 0, 100000),
    is_tour: b.is_tour === true,
  });
  return json(event, 201);
});
