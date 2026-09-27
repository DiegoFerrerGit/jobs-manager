import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CvClientWrapper } from "./CvClientWrapper";
import { getCvCode } from "./actions";
import fs from "fs";
import path from "path";

// Leemos el template directamente de disco. Nunca se escribe, sólo sirve de semilla.
const defaultCode = fs.readFileSync(path.join(process.cwd(), "src/app/(app)/cv/default-template.typ"), "utf8");
export default async function CVPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const savedCode = await getCvCode();

  return (
    <div className="flex h-screen w-full bg-[#1e1e1e] flex-col">
      <CvClientWrapper initialCode={savedCode || defaultCode} />
    </div>
  );
}
