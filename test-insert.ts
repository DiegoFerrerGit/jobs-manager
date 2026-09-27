import { db } from "./src/db";
import { userCvs, users } from "./src/db/schema";
import { eq } from "drizzle-orm";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  try {
    const user = await db.select().from(users).limit(1);
    if (!user || user.length === 0) {
      console.log("no users");
      return;
    }
    const userId = user[0].id;
    const content = "my test cv content";

    const updated = await db.update(userCvs)
      .set({ content, updatedAt: new Date() })
      .where(eq(userCvs.userId, userId))
      .returning({ id: userCvs.id });

    if (updated.length === 0) {
      try {
        await db.insert(userCvs).values({ userId, content });
        console.log("inserted");
      } catch (e: any) {
        console.error("INSERT FAILED:", e.message);
      }
    } else {
      console.log("updated");
    }
  } catch (e: any) {
    console.error("error", e.message);
  }
}
run();
