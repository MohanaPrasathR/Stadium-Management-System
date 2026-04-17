import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, action } = await request.json();

    if (action === 'login') {
      const users: any = await query('SELECT * FROM users WHERE email = ?', [email]);
      const user = users[0];

      if (!user || user.password !== password) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      return NextResponse.json({ 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      });
    } else if (action === 'register') {
      // Check if user exists
      const existing: any = await query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 });
      }

      const [result] = await execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, password, 'user']
      );

      return NextResponse.json({ 
        id: (result as any).insertId, 
        name, 
        email, 
        role: 'user' 
      }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}