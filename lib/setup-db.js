const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'stadium_management',
};

async function setup() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
    });

    // Create database if not exists
    await connection.query('CREATE DATABASE IF NOT EXISTS stadium_management');
    await connection.changeUser({ database: 'stadium_management' });

    console.log('Database ensured.');

    // Create Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Events table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Bookings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        event_id INT,
        seat_number VARCHAR(100),
        status VARCHAR(50) DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      )
    `);

    // Insert dummy events if empty
    const [events] = await connection.query('SELECT id FROM events LIMIT 1');
    if ((events).length === 0) {
      await connection.query("INSERT INTO events (id, name, description) VALUES (1, 'Stadium Tour', 'A complete tour of the stadium facilities.')");
      console.log('Inserted default Tour event.');
    }

    // Insert dummy admin if empty
    const [admins] = await connection.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if ((admins).length === 0) {
      await connection.query("INSERT INTO users (name, email, password, role) VALUES ('Admin', 'admin@stadiumhub.com', 'password123', 'admin')");
      console.log('Inserted default admin.');
    }

    console.log('Database setup complete.');
    process.exit(0);
  } catch (err) {
    console.error('Setup failed:', err);
    process.exit(1);
  }
}

setup();
