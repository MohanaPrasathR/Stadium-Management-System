import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

export async function GET() {
  try {
    const users = await query('SELECT id, name, email, role FROM users');
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json();
    const [result] = await execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role || 'user']
    );
    return NextResponse.json({ id: (result as any).insertId, message: 'User created' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}