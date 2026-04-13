import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'stadium_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export const pool = mysql.createPool(dbConfig);

export async function query(sql: string, values?: any[]) {
  const [rows] = await pool.execute(sql, values);
  return rows;
}

export async function execute(sql: string, values?: any[]) {
  return await pool.execute(sql, values);
}