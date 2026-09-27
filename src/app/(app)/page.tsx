import { db } from "@/db";
import { jobs, ignoredKeywords, companies, favoriteCompanies } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import JobsClientView from "@/components/JobsClientView";
import { getCurrentUser } from "@/lib/auth";
import Image from "next/image";

import hunterBanner from "@/assets/background-hunter.jpg";

export const revalidate = 0 // dynamically render since data changes

export default async function Home() {
  const user = await getCurrentUser();
  const jobsList = await db.select().from(jobs).orderBy(desc(jobs.createdAt));
  
  const keywords = user?.sub ? await db.select()
    .from(ignoredKeywords)
    .where(eq(ignoredKeywords.userId, user.sub))
    .orderBy(desc(ignoredKeywords.createdAt)) : [];

  const favorites = user?.sub ? await db.select()
    .from(favoriteCompanies)
    .where(eq(favoriteCompanies.userId, user.sub)) : [];
  const initialFavoriteCompanies = favorites.map((f: any) => f.companyName);

  const manualCompanies = await db.select()
    .from(companies)
    .where(eq(companies.source, 'manual'))
    .orderBy(desc(companies.createdAt));

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

        <JobsClientView initialJobs={jobsList} initialKeywords={keywords} initialCompanies={manualCompanies} initialFavoriteCompanies={initialFavoriteCompanies} userId={user?.sub || 0} />
      </div>
    </div>
  )
}
