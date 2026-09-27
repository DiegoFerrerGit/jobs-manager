"use server";

import { db } from "@/db";
import { userCvs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCvCode() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const cv = await db.select().from(userCvs).where(eq(userCvs.userId, user.id)).limit(1);
  return cv.length > 0 ? cv[0].content : null;
}

export async function saveCvCode(content: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // We use raw SQL execution to bypass any Drizzle schema mapping issues that might be failing silently
    await db.execute(
      sql`
        INSERT INTO user_cvs (user_id, content) 
        VALUES (${user.id}, ${content})
        ON CONFLICT (user_id) 
        DO UPDATE SET content = ${content}, updated_at = NOW()
      `
    );
  } catch (err: any) {
    console.error("DB UPSERT FAILED:", err);
    throw err;
  }

  revalidatePath("/cv");
  return { success: true };
}
