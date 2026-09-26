import { db } from "@/db";
import { jobs } from "@/db/schema";
import { desc } from "drizzle-orm";
import JobsClientView from "@/components/JobsClientView";
import LogoutButton from "@/components/LogoutButton";
import { getCurrentUser } from "@/lib/auth";

export const revalidate = 0 // dynamically render since data changes

export default async function Home() {
  const user = await getCurrentUser();
  const jobsList = await db.select().from(jobs).orderBy(desc(jobs.createdAt));

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
      </div>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-200 to-purple-400">
              Jobs Hunter
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl">
              Descubre las mejores ofertas para roles de liderazgo en tech.
            </p>
          </div>
          
          {user && (
            <div className="glass-card flex items-center gap-4 px-4 py-2.5 rounded-2xl">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <LogoutButton />
            </div>
          )}
        </div>

        <JobsClientView initialJobs={jobsList} />
      </main>
    </div>
  )
}
