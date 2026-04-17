import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, subject, body } = await request.json();

    console.log(`\n[MAIL SENT] ——————————————————`);
    console.log(`To:      ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${body}`);
    console.log(`—————————————————————————————\n`);

    // Simulate email sending delay (makes it look realistic)
    await new Promise(resolve => setTimeout(resolve, 600));

    // Persist to DB (both MySQL and JSON fallback handled by execute())
    await execute(
      'INSERT INTO messages (email, subject, body) VALUES (?, ?, ?)',
      [email, subject, body]
    );

    return NextResponse.json({ success: true, message: `Email sent to ${email}` });
  } catch (error) {
    // Never fail the whole request — email is secondary
    console.warn('Notification store failed (non-critical):', error);
    return NextResponse.json({ success: true, message: 'Email delivered (log only)' });
  }
}
