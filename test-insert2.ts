import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function insertTest() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    const userRes = await pool.query('SELECT id FROM users LIMIT 1');
    if (userRes.rows.length === 0) {
       console.log("No users found");
       return;
    }
    const userId = userRes.rows[0].id;
    console.log("Found user ID:", userId);
    
    // UPSERT manually
    await pool.query(`
      INSERT INTO user_cvs (user_id, content) 
      VALUES ($1, $2)
      ON CONFLICT (user_id) DO UPDATE SET content = $2
    `, [userId, "THIS IS A TEST FROM BACKEND 1234"]);
    
    console.log("Inserted CV manually");
    
    const cvs = await pool.query('SELECT * FROM user_cvs');
    console.log("CVs in DB:", cvs.rows);
  } catch (e: any) {
    console.error("Error:", e.message);
  } finally {
    await pool.end();
  }
}
insertTest();
