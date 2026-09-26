import { NextRequest } from 'next/server';
import { body, handler, HttpError, json, rateLimit, requireUser } from '@/lib/http';
import { CapacityError, store } from '@/lib/store';
import { int, tourSlot } from '@/lib/validate';

const MAX_TICKETS_PER_BOOKING = 6;

/** Users see their own bookings; admins can pass ?scope=all to see everyone's. */
export const GET = handler(async (req: NextRequest) => {
  const user = await requireUser(req);
  const all = user.role === 'admin' && req.nextUrl.searchParams.get('scope') === 'all';
  return json(await store().listBookings(all ? {} : { userId: user.id }));
});

export const POST = handler(async (req: NextRequest) => {
  const user = await requireUser(req);          // the booking owner comes from the session, never the request body
  rateLimit(`book:${user.id}`, 20, 60 * 60 * 1000);
  const b = await body(req);
  const event = await store().getEvent(int(b.event_id, 'Event', 1, 1e9));
  if (!event) throw new HttpError(404, 'Event not found.');
  const quantity = int(b.quantity ?? 1, 'Tickets', 1, MAX_TICKETS_PER_BOOKING);

  let slot: string | null = null;
  if (event.is_tour) {
    slot = tourSlot(b.tour_date, b.tour_time);
  } else if (new Date(`${event.date}T23:59:59`).getTime() < Date.now()) {
    throw new HttpError(400, 'This event has already taken place.');
  }
  try {
    const booking = await store().createBooking(
      { user_id: user.id, event_id: event.id, quantity, tour_slot: slot, total_price: event.price * quantity },
      event.capacity,
    );
    console.info(`[mail] booking ${booking.reference} confirmed for ${user.email}`); // hook for a real mailer
    return json(booking, 201);
  } catch (e) {
    if (e instanceof CapacityError) throw new HttpError(409, e.message);
    throw e;
  }
});
