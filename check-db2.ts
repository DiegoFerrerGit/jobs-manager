import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await client.connect();
  try {
    const res = await client.query('SELECT * FROM user_cvs');
    console.log("Rows:", res.rows);
  } catch (e: any) {
    console.error("Error:", e.message);
  }
  await client.end();
}
check();
