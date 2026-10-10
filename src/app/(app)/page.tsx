import { db } from "@/db";
import { jobs, userJobs, ignoredKeywords, companies, favoriteCompanies, hiddenCompanies } from "@/db/schema";
import { and, desc, eq, isNotNull, or, sql } from "drizzle-orm";
import JobsClientView from "@/components/JobsClientView";
import { getCurrentUser } from "@/lib/auth";
import Image from "next/image";
import type { JobWithUserState } from "@/db/schema";

import hunterBanner from "@/assets/background-hunter.jpg";

export const revalidate = 0 // dynamically render since data changes

// Flag de servidor (sin NEXT_PUBLIC: no llega al cliente). Se prende el día que
// producción tenga los avisos clasificados (classified_at); mientras esté apagado,
// Hunter muestra todos los avisos como antes. Se activa con HUNTER_CLASSIFIED_ONLY=true.
const CLASSIFIED_ONLY = process.env.HUNTER_CLASSIFIED_ONLY === 'true';

export default async function Home() {
  const user = await getCurrentUser();
  const userId = user?.sub ?? 0;

  // Query jobs LEFT-JOINed with per-user state
  const rows = await db
    .select({
      // Job columns
      id: jobs.id,
      externalId: jobs.externalId,
      title: jobs.title,
      description: jobs.description,
      applyUrl: jobs.applyUrl,
      locations: jobs.locations,
      publishedAt: jobs.publishedAt,
      republishedAt: jobs.republishedAt,
      detectedAt: jobs.detectedAt,
      lastSeenAt: jobs.lastSeenAt,
      closedAt: jobs.closedAt,
      priority: jobs.priority,
      roleCategory: jobs.roleCategory,
      acceptsArgentina: jobs.acceptsArgentina,
      locationMatch: jobs.locationMatch,
      source: jobs.source,
      salary: jobs.salary,
      salaryMaxK: jobs.salaryMaxK,
      salaryCurrency: jobs.salaryCurrency,
      companyId: jobs.companyId,
      company: jobs.company,
      companySlug: jobs.companySlug,
      companyHq: jobs.companyHq,
      companySize: jobs.companySize,
      companyStage: jobs.companyStage,
      companyLinkedin: jobs.companyLinkedin,
      linkedinPeopleAr: jobs.linkedinPeopleAr,
      createdAt: jobs.createdAt,
      updatedAt: jobs.updatedAt,
      // Per-user state (nullable when no row in user_jobs)
      userStatus: userJobs.status,
      userNotes: userJobs.notes,
      userAppliedAt: userJobs.appliedAt,
      userExpectedSalary: userJobs.expectedSalary,
    })
    .from(jobs)
    .leftJoin(
      userJobs,
      sql`${userJobs.jobId} = ${jobs.id} AND ${userJobs.userId} = ${userId}`
    )
    .where(
      CLASSIFIED_ONLY
        ? or(
            // El usuario ya interactuo con este aviso: nunca se esconde,
            // aunque no este clasificado o sea de otra funcion.
            isNotNull(userJobs.jobId),
            and(
              // Permanente: un aviso sin clasificar todavia no esta listo.
              isNotNull(jobs.classifiedAt),
              eq(jobs.eligible, true)
            )
          )
        : undefined
    )
    .orderBy(desc(jobs.createdAt));

  const jobsList: JobWithUserState[] = rows as JobWithUserState[];

  const keywords = userId ? await db.select()
    .from(ignoredKeywords)
    .where(eq(ignoredKeywords.userId, userId))
    .orderBy(desc(ignoredKeywords.createdAt)) : [];

  const favorites = userId ? await db.select()
    .from(favoriteCompanies)
    .where(eq(favoriteCompanies.userId, userId)) : [];
  const initialFavoriteCompanies = favorites.map((f: any) => f.companyName);

  const hidden = userId ? await db.select()
    .from(hiddenCompanies)
    .where(eq(hiddenCompanies.userId, userId)) : [];
  const initialHiddenCompanies = hidden.map((h: any) => h.companyName);


  return (
    <div className="min-h-screen relative selection:bg-primary/30 p-4 sm:p-6 lg:p-8">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-[1600px] mx-auto">
        {/* Banner */}
        <div className="relative w-full h-[220px] sm:h-[300px] rounded-t-2xl overflow-hidden border border-border/50 shadow-lg">
          <Image 
            src={hunterBanner} 
            alt="Hunter Banner" 
            fill 
            className="object-cover object-[center_35%] opacity-70 hover:scale-105 transition-transform duration-700"
            priority
            quality={100}
            unoptimized
          />
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0f] via-[#0c0c0f]/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-6 sm:p-8 w-full">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-lg">
              Hunter
            </h1>
            <p className="text-gray-200 text-sm sm:text-base mt-1.5 max-w-xl drop-shadow-md font-medium">
              Descubre las mejores ofertas para roles de liderazgo en tech.
            </p>
          </div>
        </div>

        <JobsClientView initialJobs={jobsList} initialKeywords={keywords} initialFavoriteCompanies={initialFavoriteCompanies} initialHiddenCompanies={initialHiddenCompanies} userId={userId} />
      </div>
    </div>
  )
}

