"use server";

import { db } from "@/db";
import { jobs, ignoredKeywords } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function toggleJobStatus(id: number, currentStatus: string) {
  const newStatus = currentStatus === "APPLIED" ? "SAVED" : "APPLIED";
  await db.update(jobs).set({ status: newStatus }).where(eq(jobs.id, id));
  revalidatePath("/");
}
export async function deleteJob(id: number) {
  await db.delete(jobs).where(eq(jobs.id, id));
  revalidatePath("/");
}

export async function hideJob(id: number, newStatus: string) {
  await db.update(jobs).set({ status: newStatus as any }).where(eq(jobs.id, id));
  revalidatePath("/");
}

export async function addKeyword(userId: number, keyword: string) {
  if (!keyword.trim()) return;
  await db.insert(ignoredKeywords).values({ userId, keyword: keyword.trim() });
  revalidatePath("/ajustes");
}

export async function deleteKeyword(id: number) {
  await db.delete(ignoredKeywords).where(eq(ignoredKeywords.id, id));
  revalidatePath("/ajustes");
}
