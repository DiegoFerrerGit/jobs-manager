import { db } from "@/db";
import { userCvs, users } from "@/db/schema";
import { defaultCode } from "@/app/(app)/cv/defaultCode";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function fix() {
  await db.update(userCvs).set({ content: defaultCode });
  console.log("Updated!");
  process.exit(0);
}
fix();
