import { describe, expect, it } from 'vitest';
import { signSession, verifySession } from '@/lib/session';

describe('session cookie', () => {
  it('round-trips a valid session', async () => {
    const s = await verifySession(await signSession(7, 'user'));
    expect(s?.uid).toBe(7);
    expect(s?.role).toBe('user');
  });

  it('rejects a token whose role was edited to admin', async () => {
    const [payload, sig] = (await signSession(7, 'user')).split('.');
    const forged = Buffer.from(Buffer.from(payload, 'base64url').toString().replace('"user"', '"admin"')).toString('base64url');
    expect(await verifySession(`${forged}.${sig}`)).toBeNull();
  });

  it('rejects garbage and missing tokens', async () => {
    expect(await verifySession(undefined)).toBeNull();
    expect(await verifySession('abc')).toBeNull();
    expect(await verifySession('a.b')).toBeNull();
  });
});
