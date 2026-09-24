# ArenaPass 🏟️

**Stadium event ticketing and guided-tour booking.** Next.js 16 (App Router), TypeScript, Tailwind CSS and MySQL.
Formerly *Stadium Management System*.

## Features

- **Accounts:** register and log in with bcrypt-hashed passwords, signed HttpOnly session cookies,
  login rate limiting, and roles checked on the server (fan / admin).
- **Events:** browse upcoming events with prices, and book 1-6 tickets. Capacity is enforced in a
  database transaction with the event row locked, so two buyers can't both take the last seats.
- **Stadium tours:** pick a date (up to 60 days ahead) and a start time. Each time slot has its own
  capacity.
- **Fan dashboard:** upcoming and past bookings with reference codes, and self-service cancellation
  that releases the seats.
- **Admin dashboard:** revenue, tickets sold, all bookings, users (never their password hashes) and
  event creation. Everything is protected by server checks, not just hidden in the UI.
- **Two data backends:** MySQL when `DB_HOST` is set, otherwise a seeded in-memory demo store that
  works on read-only hosts like Vercel. Database errors are reported, never silently redirected to a
  different store.

## Security fixes in this version

The earlier version was a front-end prototype. This release replaces its shortcuts:

| Before | Now |
| --- | --- |
| Plain-text passwords in the DB and JSON file | bcrypt hashes; admin created from env vars by `npm run setup-db` |
| "Session" = `{role}` in localStorage, editable in DevTools | HMAC-signed HttpOnly cookie, role re-read from the DB on every request |
| Any email containing `stadiumhub.com` logged in when the API failed | Removed; only real credentials work |
| Simulated "Continue with Google" that logged everyone into one account | Removed |
| APIs trusted `user_id` from the request body; anyone could read all bookings | Owner comes from the session; users only see their own bookings |
| No capacity or duplicate checks; failed bookings shown as successful | Transactional capacity checks; real errors shown to the user |
| Admin page read Supabase tables from the browser; hardcoded revenue figures | Admin-only APIs with live figures |
| MySQL errors silently fell back to writing a JSON file | Explicit backend choice; errors are logged and reported |

## Run it

```bash
npm install
npm run dev                  # in-memory demo: fan@arenapass.demo / admin@arenapass.demo, password Arena@2026
```

With MySQL:

```bash
cp .env.example .env.local   # fill in DB_* and SESSION_SECRET
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-password' npm run setup-db
npm run dev
```

## Tests

```bash
npm test     # session forgery, validation, capacity per event and per tour slot, cancellation, stats
```
