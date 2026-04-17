import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    let sql = `
      SELECT b.*, u.name as user_name, e.name as event_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN events e ON b.event_id = e.id
    `;
    let values: any[] = [];

    if (userId) {
      sql += ' WHERE b.user_id = ?';
      values.push(userId);
    }

    const bookings = await query(sql, values);
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Fetch bookings error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user_id, event_id, seat_number } = await request.json();
    const [result] = await execute(
      'INSERT INTO bookings (user_id, event_id, seat_number, status) VALUES (?, ?, ?, ?)',
      [user_id, event_id, seat_number, 'confirmed']
    );
    return NextResponse.json({ id: (result as any).insertId, message: 'Booking created' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}