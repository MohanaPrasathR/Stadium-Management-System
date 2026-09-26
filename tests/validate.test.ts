import { describe, expect, it } from 'vitest';
import { email, int, password, tourSlot } from '@/lib/validate';

const inDays = (d: number) => new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);

describe('validation', () => {
  it('normalises emails and rejects bad ones', () => {
    expect(email('  Fan@Example.COM ')).toBe('fan@example.com');
    expect(() => email('nope')).toThrow();
  });

  it('requires reasonable passwords', () => {
    expect(() => password('short1')).toThrow();
    expect(() => password('onlyletters')).toThrow();
    expect(password('letters123')).toBe('letters123');
  });

  it('bounds integers', () => {
    expect(int('3', 'Tickets', 1, 6)).toBe(3);
    expect(() => int(0, 'Tickets', 1, 6)).toThrow();
    expect(() => int(7, 'Tickets', 1, 6)).toThrow();
    expect(() => int(1.5, 'Tickets', 1, 6)).toThrow();
  });

  it('accepts only real future tour slots within 60 days', () => {
    expect(tourSlot(inDays(3), '11:30')).toBe(`${inDays(3)} 11:30`);
    expect(() => tourSlot(inDays(3), '12:00')).toThrow();       // not a tour time
    expect(() => tourSlot(inDays(-1), '11:30')).toThrow();      // past
    expect(() => tourSlot(inDays(90), '11:30')).toThrow();      // too far ahead
  });
});
