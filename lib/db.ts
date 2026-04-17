import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const SIM_DB_PATH = path.join(process.cwd(), 'simdb.json');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'stadium_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Initialize Simulated DB if it doesn't exist
if (!fs.existsSync(SIM_DB_PATH)) {
  fs.writeFileSync(SIM_DB_PATH, JSON.stringify({
    users: [
      { id: 1, name: 'Admin', email: 'admin@stadiumhub.com', password: 'password123', role: 'admin' },
      { id: 2, name: 'Demo User', email: 'user@stadiumhub.com', password: 'password123', role: 'user' }
    ],
    bookings: [],
    messages: [],
    events: [
      { id: 1, name: 'Stadium Tour', date: 'APR 25', description: 'A complete guided tour of the stadium facilities including pitch, locker rooms, and VIP boxes.', capacity: 5000 },
      { id: 2, name: 'Champions League Final', date: 'MAY 24', description: 'The biggest club football match of the year between the giants of Europe.', capacity: 85000 },
      { id: 3, name: 'World Music Festival', date: 'JUN 15', description: 'A weekend of incredible live performances by the world\'s top artists.', capacity: 55000 },
      { id: 4, name: 'Athletics World Championship', date: 'JUL 10', description: 'Watch elite athletes compete for gold at the premier track and field event.', capacity: 70000 },
      { id: 5, name: 'International Cricket T20', date: 'AUG 03', description: 'High-octane T20 cricket action between rival national teams.', capacity: 45000 },
      { id: 6, name: 'Formula E Night Race', date: 'SEP 20', description: 'Electrifying electric racing under the stadium lights.', capacity: 30000 }
    ]
  }, null, 2));
}

let pool: any = null;
try {
  pool = mysql.createPool(dbConfig);
} catch (e) {
  console.warn("MySQL Pool creation failed, using Presentation Mode (JSON).");
}

function getSimData() {
  return JSON.parse(fs.readFileSync(SIM_DB_PATH, 'utf-8'));
}

function saveSimData(data: any) {
  fs.writeFileSync(SIM_DB_PATH, JSON.stringify(data, null, 2));
}

export async function query(sql: string, values?: any[]) {
  try {
    if (!pool) throw new Error("Pool not initialized");
    const [rows] = await pool.execute(sql, values);
    return rows;
  } catch (err) {
    console.warn("DB Query failed, using Simulated Data fallback.");
    const data = getSimData();
    const upperSql = sql.toUpperCase();
    
    if (upperSql.includes('FROM USERS')) {
      if (values?.[0]) return data.users.filter((u: any) => u.email === values[0]);
      return data.users;
    }
    if (upperSql.includes('FROM MESSAGES')) {
       return data.messages;
    }
    if (upperSql.includes('FROM EVENTS')) {
      return data.events;
    }
    if (upperSql.includes('FROM BOOKINGS') || upperSql.includes('SELECT B.*')) {
      if (values?.[0]) return data.bookings.filter((b: any) => b.user_id == values[0]);
      return data.bookings;
    }
    return [];
  }
}

export async function execute(sql: string, values?: any[]) {
  try {
    if (!pool) throw new Error("Pool not initialized");
    return await pool.execute(sql, values);
  } catch (err) {
    console.warn("DB Execute failed, using Simulated Data update.");
    const data = getSimData();
    const upperSql = sql.toUpperCase();

    if (upperSql.includes('INSERT INTO BOOKINGS')) {
      const newBooking = { 
        id: data.bookings.length + 1, 
        user_id: values?.[0], 
        event_id: values?.[1], 
        seat_number: values?.[2], 
        status: 'Confirmed',
        event_name: 'Stadium Tour'
      };
      data.bookings.push(newBooking);
      saveSimData(data);
      return [{ insertId: newBooking.id }];
    }
    
    if (upperSql.includes('INSERT INTO MESSAGES')) {
      data.messages.push({ email: values?.[0], subject: values?.[1], body: values?.[2], created_at: new Date() });
      saveSimData(data);
      return [{ insertId: 1 }];
    }

    if (upperSql.includes('INSERT INTO USERS')) {
      const newUser = { id: data.users.length + 1, name: values?.[0], email: values?.[1], password: values?.[2], role: 'user' };
      data.users.push(newUser);
      saveSimData(data);
      return [{ insertId: newUser.id }];
    }

    return [{}];
  }
}