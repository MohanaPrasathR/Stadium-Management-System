import { beforeEach, describe, expect, it } from 'vitest';

beforeEach(() => {
  delete process.env.DB_HOST;
  (globalThis as any).__arenaStore = undefined;
});

describe('demo store', () => {
  it('seeds hashed passwords, never plain text', async () => {
    const { store } = await import('@/lib/store');
    const admin = await store().findUserByEmail('admin@arenapass.demo');
    expect(admin?.password_hash.startsWith('$2')).toBe(true);
    const users = await store().listUsers();
    expect(users.every((u) => !('password_hash' in u))).toBe(true);
  });

  it('enforces capacity per event and per tour slot', async () => {
    const { store, CapacityError } = await import('@/lib/store');
    const s = store();
    const tour = (await s.listEvents()).find((e) => e.is_tour)!;
    await s.createBooking({ user_id: 2, event_id: tour.id, quantity: 6, tour_slot: '2030-01-01 10:00', total_price: 1 }, 10);
    await expect(s.createBooking({ user_id: 2, event_id: tour.id, quantity: 5, tour_slot: '2030-01-01 10:00', total_price: 1 }, 10))
      .rejects.toBeInstanceOf(CapacityError);
    // a different slot has its own capacity
    await expect(s.createBooking({ user_id: 2, event_id: tour.id, quantity: 5, tour_slot: '2030-01-01 11:30', total_price: 1 }, 10))
      .resolves.toMatchObject({ status: 'confirmed' });
  });

  it('frees capacity when a booking is cancelled and reports real stats', async () => {
    const { store } = await import('@/lib/store');
    const s = store();
    const ev = (await s.listEvents()).find((e) => !e.is_tour)!;
    const b = await s.createBooking({ user_id: 2, event_id: ev.id, quantity: 2, tour_slot: null, total_price: ev.price * 2 }, 2);
    expect((await s.stats()).revenue).toBe(ev.price * 2);
    await s.cancelBooking(b.id);
    expect((await s.stats()).revenue).toBe(0);
    await expect(s.createBooking({ user_id: 2, event_id: ev.id, quantity: 2, tour_slot: null, total_price: 0 }, 2)).resolves.toBeTruthy();
  });

  it('rejects duplicate emails', async () => {
    const { store } = await import('@/lib/store');
    await expect(store().createUser({ name: 'X', email: 'fan@arenapass.demo', password_hash: 'x', role: 'user' }))
      .rejects.toThrow('DUPLICATE_EMAIL');
  });
});
