import { db } from "./src/db";
import { userCvs } from "./src/db/schema";
import { getCurrentUser } from "./src/lib/auth";

async function run() {
  try {
    const cvs = await db.select().from(userCvs);
    console.log("Total CVs stored:", cvs.length);
    if (cvs.length > 0) {
      console.log("Sample length of content:", cvs[0].content.length);
    }
  } catch (e: any) {
    console.error(e.message);
  }
}
run();
