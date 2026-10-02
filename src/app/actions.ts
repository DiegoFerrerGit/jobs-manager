"use server";

import { db } from "@/db";
import { jobs, userJobs, ignoredKeywords, companies, favoriteCompanies } from "@/db/schema";
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

function parseCareersUrl(url: string) {
  let cleanUrl = url.trim();
  // Remove protocol
  cleanUrl = cleanUrl.replace(/^https?:\/\//, '');
  // Remove trailing slash
  cleanUrl = cleanUrl.replace(/\/$/, '');
  // Remove query strings
  cleanUrl = cleanUrl.split('?')[0];
  
  let ats: any = 'custom';
  let slug = '';
  
  if (cleanUrl.startsWith('jobs.ashbyhq.com/')) {
    ats = 'ashby';
    slug = cleanUrl.replace('jobs.ashbyhq.com/', '').split('/')[0];
  } else if (cleanUrl.startsWith('job-boards.greenhouse.io/')) {
    ats = 'greenhouse';
    slug = cleanUrl.replace('job-boards.greenhouse.io/', '').split('/')[0];
  } else if (cleanUrl.startsWith('jobs.lever.co/')) {
    ats = 'lever';
    slug = cleanUrl.replace('jobs.lever.co/', '').split('/')[0];
  } else if (cleanUrl.includes('.teamtailor.com')) {
    ats = 'teamtailor';
    slug = cleanUrl.split('.teamtailor.com')[0].split('.')[0];
  } else if (cleanUrl.includes('.myworkdayjobs.com')) {
    ats = 'workday';
    const host = cleanUrl.split('/')[0];
    const company = host.split('.')[0];
    const match = cleanUrl.match(/\/en-US\/([^\/]+)/);
    const path = match ? match[1] : '';
    slug = path ? `${company}/${path}` : company;
  } else if (cleanUrl.includes('.oraclecloud.com')) {
    ats = 'oracle';
    const host = cleanUrl.split('/')[0];
    const company = host.split('.')[0];
    const match = cleanUrl.match(/\/sites\/([^\/]+)/);
    const site = match ? match[1] : '';
    slug = site ? `${company}/${site}` : company;
  } else if (cleanUrl.startsWith('apply.workable.com/')) {
    ats = 'workable';
    slug = cleanUrl.replace('apply.workable.com/', '').split('/')[0];
  } else if (cleanUrl.includes('.workable.com') && cleanUrl.split('.workable.com')[0].replace(/^www\./, '') !== 'apply') {
    ats = 'workable';
    slug = cleanUrl.split('.workable.com')[0].replace(/^www\./, '');
  } else {
    ats = 'custom';
    const host = cleanUrl.split('/')[0];
    slug = host.replace(/^www\./, '');
  }
  
  return { ats, slug, careersUrl: cleanUrl };
}

export async function addManualCompany(url: string) {
  const { ats, slug, careersUrl } = parseCareersUrl(url);

  // Check if exists
  const existing = await db.query.companies.findFirst({
    where: and(eq(companies.ats, ats), eq(companies.slug, slug))
  });

  if (existing) {
    throw new Error("Esta empresa ya está cargada.");
  }

  const [newCompany] = await db.insert(companies).values({
    name: slug,
    slug,
    ats,
    source: 'manual',
    status: 'active',
    careersUrl,
  }).returning();

  revalidatePath("/ajustes");
  revalidatePath("/");
  return newCompany;
}

export async function toggleCompanyStatus(id: number, newStatus: "active" | "inactive") {
  await db.update(companies).set({ status: newStatus }).where(eq(companies.id, id));
  revalidatePath("/ajustes");
  revalidatePath("/");
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

export async function deleteManualCompany(id: number) {
  const result = await db.delete(companies).where(eq(companies.id, id)).returning();
  if (result.length === 0) {
    throw new Error("No se pudo borrar. Es posible que ya no exista.");
  }
  revalidatePath("/ajustes");
  revalidatePath("/");
}

export async function updateManualCompany(id: number, url: string) {
  const { ats, slug, careersUrl } = parseCareersUrl(url);

  const existing = await db.query.companies.findFirst({
    where: and(eq(companies.ats, ats), eq(companies.slug, slug))
  });

  if (existing && existing.id !== id) {
    throw new Error("Esta empresa ya está cargada con otra entrada.");
  }

  const [updatedCompany] = await db.update(companies).set({
    name: slug,
    slug,
    ats,
    careersUrl,
  }).where(eq(companies.id, id)).returning();

  revalidatePath("/ajustes");
  revalidatePath("/");
  return updatedCompany;
}

export async function updateCompanyLinkedin(companyName: string, linkedinUrl: string) {
  const manualUrl = linkedinUrl ? (linkedinUrl.includes('#manual') ? linkedinUrl : `${linkedinUrl}#manual`) : null;
  await db.update(jobs)
    .set({ companyLinkedin: manualUrl })
    .where(eq(jobs.company, companyName));
  revalidatePath("/");
}
