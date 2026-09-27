"use server";

import { db } from "@/db";
import { userCvs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

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

  // Attempt to update first
  const updated = await db.update(userCvs)
    .set({ content, updatedAt: new Date() })
    .where(eq(userCvs.userId, user.id))
    .returning({ id: userCvs.id });

  // If no rows were updated, it means it doesn't exist, so insert
  if (updated.length === 0) {
    try {
      await db.insert(userCvs).values({ userId: user.id, content });
    } catch (err: any) {
      // In case of a race condition where another request just inserted it, 
      // the insert might fail with a unique constraint error. We can safely ignore it 
      // or run update again, but usually ignoring is fine for a CV code debounce.
      await db.update(userCvs)
        .set({ content, updatedAt: new Date() })
        .where(eq(userCvs.userId, user.id));
    }
  }

  return { success: true };
}
