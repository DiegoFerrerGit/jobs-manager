import { db } from "./src/db";
import { userCvs } from "./src/db/schema";
import { eq } from "drizzle-orm";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  try {
    const user_id = 1; // Assuming user ID 1 exists
    await db.insert(userCvs)
      .values({ userId: user_id, content: "test content" })
      .onConflictDoUpdate({
        target: userCvs.userId,
        set: { content: "test content updated", updatedAt: new Date() }
      });
    console.log("Upsert succeeded");
  } catch (e: any) {
    console.error("Upsert failed:", e.message);
  }
}
run();
