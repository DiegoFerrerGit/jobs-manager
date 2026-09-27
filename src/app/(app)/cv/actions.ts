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

  const cv = await db.select().from(userCvs).where(eq(userCvs.userId, Number(user.sub))).limit(1);
  return cv.length > 0 ? cv[0].content : null;
}

export async function saveCvCode(content: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  await db.insert(userCvs)
    .values({ userId: Number(user.sub), content })
    .onConflictDoUpdate({
      target: userCvs.userId,
      set: { content, updatedAt: new Date() }
    });

  revalidatePath("/cv");
  return { success: true };
}
