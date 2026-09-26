"use server";

import { db } from "@/db";
import { jobs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function toggleJobStatus(id: number, currentStatus: string) {
  const newStatus = currentStatus === "APPLIED" ? "SAVED" : "APPLIED";
  await db.update(jobs).set({ status: newStatus }).where(eq(jobs.id, id));
  revalidatePath("/");
}
