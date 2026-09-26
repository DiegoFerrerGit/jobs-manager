import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder";

let db: any;

if (process.env.NODE_ENV === "production") {
  const sql = neon(connectionString);
  db = drizzleNeon(sql, { schema });
} else {
  const pool = new Pool({ connectionString });
  db = drizzlePg(pool, { schema });
}

export { db };
