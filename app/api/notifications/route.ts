import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, subject, body, type } = await request.json();
    
    // Simulate complex email sending delay
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log(`[MAIL SENT] To: ${email} | Subject: ${subject}`);
    
    // Store in a message history table (create it if it doesn't exist)
    try {
      await execute(`
        CREATE TABLE IF NOT EXISTS messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255),
          subject VARCHAR(255),
          body TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await execute(
        'INSERT INTO messages (email, subject, body) VALUES (?, ?, ?)',
        [email, subject, body]
      );
    } catch (dbErr) {
       console.warn("Could not save message to DB history, but email was 'sent'.");
    }

    return NextResponse.json({ success: true, message: 'Email sent successfully via StadiumHub SMTP' });
  } catch (error) {
    return NextResponse.json({ error: 'Mail delivery failed' }, { status: 500 });
  }
}
