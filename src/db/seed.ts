import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db } from "./index";
import { jobs } from "./schema";
import fs from "fs";

async function main() {
  const data = fs.readFileSync("./mock_jobs.json", "utf-8");
  const parsed = JSON.parse(data);

  console.log(`Inserting ${parsed.length} jobs...`);
  
  await db.delete(jobs);
  
  for (const item of parsed) {
    try {
      await db.insert(jobs).values({
        externalId: item.id,
        titulo: item.titulo || "Untitled",
        empresa: item.empresa || "Unknown",
        empleados: item.empleados ? String(item.empleados) : null,
        salario: item.salario ? String(item.salario) : null,
        ubicaciones: item.ubicaciones,
        motivo: item.motivo,
        visa: item.visa,
        fecha_publicacion: item.fecha_publicacion,
        fecha_detectada: item.fecha_detectada,
        url_aplicar: item.url_aplicar,
        prioridad: item.prioridad,
        acepta_argentina: item.acepta_argentina,
        linkedin_empresa: item.linkedin_empresa,
      });
    } catch (e) {
      console.error("Error inserting job", item.id, e);
    }
  }
  
  console.log("Seeding complete!");
}

main().catch(console.error);
