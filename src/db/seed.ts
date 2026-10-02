import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db } from "./index";
import { jobs, userJobs, users, jobSource, roleCategory, argentinaFit, jobStatus } from "./schema";
import fs from "fs";

async function main() {
  const data = fs.readFileSync("./mock_jobs.json", "utf-8");
  const parsed = JSON.parse(data);

  console.log(`Inserting ${parsed.length} jobs...`);
  
  await db.delete(userJobs);
  await db.delete(jobs);
  await db.delete(users);

  // Create a dummy user for the seed
  const [user] = await db.insert(users).values({
    email: "test@example.com",
    name: "Test User"
  }).returning();
  
  for (const item of parsed) {
    try {
      // Map priority string "1 alta" to integer
      let priority = 3;
      if (item.prioridad?.includes("1")) priority = 1;
      else if (item.prioridad?.includes("2")) priority = 2;

      // Map accepts_argentina to enum
      let acceptsAr: "yes" | "maybe" = "maybe";
      if (item.acepta_argentina === "si") acceptsAr = "yes";

      const fakeHqs = [
        "San Francisco, CA", "New York, NY", "London, UK", "Austin, TX", 
        "Seattle, WA", "Berlin, Germany", "Miami, FL", null, "Boston, MA", null
      ];
      const randomHq = fakeHqs[Math.floor(Math.random() * fakeHqs.length)];

      const [insertedJob] = await db.insert(jobs).values({
        externalId: item.id || Math.random().toString(36).substring(7),
        title: item.titulo || "Untitled",
        company: item.empresa || "Unknown",
        companySize: item.empleados ? parseInt(item.empleados) : null,
        companyHq: randomHq,
        salary: item.salario ? String(item.salario) : null,
        locations: item.ubicaciones,
        locationMatch: item.motivo,
        publishedAt: item.fecha_publicacion || null,
        applyUrl: item.url_aplicar || "https://example.com",
        priority,
        roleCategory: "ic",
        acceptsArgentina: acceptsAr,
        source: item.id?.startsWith("yc:") ? "yc" : item.id?.startsWith("ashby:") ? "ashby" : "manual",
        companyLinkedin: item.linkedin_empresa,
        linkedinPeopleAr: item.linkedin_people_ar,
      }).onConflictDoNothing().returning();

      if (insertedJob) {
        await db.insert(userJobs).values({
          userId: user.id,
          jobId: insertedJob.id,
          status: "SAVED",
        }).onConflictDoNothing();
      }
    } catch (e) {
      console.error("Error inserting job", item.id, e);
    }
  }
  
  console.log("Seeding complete!");
}

main().catch(console.error);
