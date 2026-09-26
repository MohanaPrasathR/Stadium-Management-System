import { NextRequest } from 'next/server';
import { handler, HttpError, json, requireUser } from '@/lib/http';
import { store } from '@/lib/store';

/** Cancel a booking. Owners can cancel their own; admins can cancel any. */
export const DELETE = handler(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const user = await requireUser(req);
  const booking = await store().getBooking(Number((await ctx.params).id));
  if (!booking || (booking.user_id !== user.id && user.role !== 'admin')) throw new HttpError(404, 'Booking not found.');
  if (booking.status === 'cancelled') throw new HttpError(409, 'This booking is already cancelled.');
  await store().cancelBooking(booking.id);
  return json({ ...booking, status: 'cancelled' });
});
