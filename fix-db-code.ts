import { db } from "@/db";
import { userCvs, users } from "@/db/schema";
import fs from 'fs';
import path from 'path';
const defaultCode = fs.readFileSync(path.join(process.cwd(), "src/app/(app)/cv/default-template.typ"), "utf8");
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function fix() {
  await db.update(userCvs).set({ content: defaultCode });
  console.log("Updated!");
  process.exit(0);
}
fix();
