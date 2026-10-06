"use server";

import { db } from "@/db";
import { jobs, userJobs, ignoredKeywords, companies, favoriteCompanies, hiddenCompanies } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";


export async function toggleJobStatus(userId: number, jobId: number, currentStatus: string, expectedSalary?: string | null) {
  const newStatus = currentStatus === "APPLIED" ? "SAVED" : "APPLIED";
  await db.insert(userJobs).values({
    userId,
    jobId,
    status: newStatus,
    expectedSalary: newStatus === "APPLIED" ? (expectedSalary ?? null) : null,
    appliedAt: newStatus === "APPLIED" ? new Date() : null,
  }).onConflictDoUpdate({
    target: [userJobs.userId, userJobs.jobId],
    set: {
      status: newStatus,
      expectedSalary: newStatus === "APPLIED" ? (expectedSalary ?? null) : null,
      appliedAt: newStatus === "APPLIED" ? new Date() : null,
      updatedAt: new Date(),
    },
  });
  revalidatePath("/");
}
export async function deleteJob(id: number) {
  await db.delete(jobs).where(eq(jobs.id, id));
  revalidatePath("/");
}

export async function hideJob(userId: number, jobId: number, newStatus: string) {
  await db.insert(userJobs).values({
    userId,
    jobId,
    status: newStatus as any,
  }).onConflictDoUpdate({
    target: [userJobs.userId, userJobs.jobId],
    set: {
      status: newStatus as any,
      updatedAt: new Date(),
    },
  });
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



export async function toggleFavoriteCompany(userId: number, companyName: string, isFavorite: boolean) {
  if (isFavorite) {
    // Add to favorites
    await db.insert(favoriteCompanies).values({
      userId,
      companyName,
    }).onConflictDoNothing(); // Because of unique index
  } else {
    // Remove from favorites
    await db.delete(favoriteCompanies)
      .where(and(eq(favoriteCompanies.userId, userId), eq(favoriteCompanies.companyName, companyName)));
  }
  revalidatePath("/");
}



export async function toggleHiddenCompany(userId: number, companyName: string, isHidden: boolean) {
  if (isHidden) {
    await db.insert(hiddenCompanies).values({ userId, companyName }).onConflictDoNothing();
  } else {
    await db.delete(hiddenCompanies)
      .where(and(eq(hiddenCompanies.userId, userId), eq(hiddenCompanies.companyName, companyName)));
  }
  revalidatePath("/");
}

export async function updateCompanyLinkedin(companyName: string, linkedinUrl: string) {
  const manualUrl = linkedinUrl ? (linkedinUrl.includes('#manual') ? linkedinUrl : `${linkedinUrl}#manual`) : null;
  await db.update(jobs)
    .set({ companyLinkedin: manualUrl })
    .where(eq(jobs.company, companyName));
  revalidatePath("/");
}
