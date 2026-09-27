import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CvClient } from "./CvClient";
import { getCvCode } from "./actions";
import { defaultCode } from "./defaultCode";

export default async function CVPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const savedCode = await getCvCode();

  return (
    <div className="flex h-screen w-full bg-[#1e1e1e] flex-col">
      <CvClient initialCode={savedCode || defaultCode} />
    </div>
  );
}
