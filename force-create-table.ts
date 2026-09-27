import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function createTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_cvs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        content TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log("Table created successfully");
  } catch (e: any) {
    console.error("Failed to create table:", e.message);
  } finally {
    await pool.end();
  }
}
createTable();
