import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

export async function GET() {
  try {
    const events = await query('SELECT * FROM events');
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, date, description, capacity } = await request.json();
    const [result] = await execute(
      'INSERT INTO events (name, date, description, capacity) VALUES (?, ?, ?, ?)',
      [name, date, description, capacity]
    );
    return NextResponse.json({ id: (result as any).insertId, message: 'Event created' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}