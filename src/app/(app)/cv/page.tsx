import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";

export default async function CVPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70 tracking-tight">
            Curriculum Vitae
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión y personalización de tu CV.
          </p>
        </div>
      </div>
      <div className="glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
        <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-foreground">En construcción</h3>
        <p className="text-muted-foreground">Aquí podrás gestionar tu CV próximamente.</p>
      </div>
    </div>
  );
}
