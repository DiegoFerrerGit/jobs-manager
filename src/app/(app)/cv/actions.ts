"use server";

import { db } from "@/db";
import { userCvs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
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
      console.error("DB INSERT FAILED:", err);
      try {
        await db.update(userCvs)
          .set({ content, updatedAt: new Date() })
          .where(eq(userCvs.userId, user.id));
      } catch (updateErr: any) {
        console.error("DB FALLBACK UPDATE FAILED:", updateErr);
        throw err; // Actually throw to client so the button doesn't hide
      }
    }
  }

  revalidatePath("/cv");
  return { success: true };
}
