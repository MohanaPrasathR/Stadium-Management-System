/**
 * Creates the MySQL schema and seeds events plus one admin account.
 *   DB_HOST=localhost DB_USER=root DB_PASSWORD=... ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='S0me-strong-pass' npm run setup-db
 */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const inDays = (d) => new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);

async function setup() {
  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  if (!adminEmail || adminPassword.length < 10) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (10+ characters). No default admin password is created.');
    process.exit(1);
  }
  const dbName = process.env.DB_NAME || 'stadium_management';
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await conn.changeUser({ database: dbName });

  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash CHAR(60) NOT NULL,
      role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      date DATE NOT NULL,
      description TEXT,
      capacity INT NOT NULL CHECK (capacity > 0),
      price DECIMAL(10, 2) NOT NULL DEFAULT 0,
      is_tour BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      reference VARCHAR(16) NOT NULL UNIQUE,
      user_id INT NOT NULL,
      event_id INT NOT NULL,
      quantity TINYINT NOT NULL CHECK (quantity BETWEEN 1 AND 6),
      tour_slot VARCHAR(16) NULL,
      status ENUM('confirmed', 'cancelled') NOT NULL DEFAULT 'confirmed',
      total_price DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_event_slot (event_id, tour_slot, status),
      INDEX idx_user (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )`);

  const [[{ n }]] = await conn.query('SELECT COUNT(*) AS n FROM events');
  if (n === 0) {
    const events = [
      ['Stadium Tour', inDays(0), 'Guided tour of the pitch, dressing rooms, press box and VIP lounges.', 25, 499, true],
      ['ISL: Chennaiyin FC vs Bengaluru FC', inDays(12), 'Southern derby under the lights.', 40000, 650, false],
      ['Monsoon Music Festival', inDays(26), 'Two stages, twelve artists and a closing fireworks show.', 30000, 1499, false],
      ['State Athletics Championship', inDays(40), 'Track and field finals.', 20000, 250, false],
    ];
    await conn.query('INSERT INTO events (name, date, description, capacity, price, is_tour) VALUES ?', [events]);
    console.log(`Inserted ${events.length} events.`);
  }
  const hash = await bcrypt.hash(adminPassword, 12);
  await conn.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ('Admin', ?, ?, 'admin')
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'admin'`, [adminEmail, hash]);
  console.log(`Admin account ready: ${adminEmail}`);
  await conn.end();
}

setup().catch((err) => { console.error('Setup failed:', err.message); process.exit(1); });
