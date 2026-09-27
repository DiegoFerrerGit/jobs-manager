"use client";

import { useState } from "react";
import { addManualCompany, toggleCompanyStatus } from "@/app/actions";
import { Plus, Check, X, Building2 } from "lucide-react";
import { Company } from "@/db/schema";

export default function ManualCompanyManager({ initialCompanies }: { initialCompanies: Company[] }) {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState(initialCompanies);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;

    const newUrl = input.trim();
    setInput("");
    setError(null);
    setIsSubmitting(true);

    try {
      const newCompany = await addManualCompany(newUrl);
      if (newCompany) {
        setCompanies([newCompany, ...companies]);
      }
    } catch (e: any) {
      setError(e.message || "Error al agregar la empresa");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: "active" | "inactive") => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    // Optimistic update
    setCompanies(companies.map(c => c.id === id ? { ...c, status: newStatus } : c));
    try {
      await toggleCompanyStatus(id, newStatus);
    } catch (e) {
      console.error(e);
      // Revert
      setCompanies(companies);
    }
  };

  return (
    <div className="w-full mt-4 border-t border-border/50">
      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            Empresas manuales
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Agrega URLs de páginas de empleo que el descubrimiento automático no encuentra. 
            El sistema detectará automáticamente la plataforma (Greenhouse, Lever, etc.) si es conocida.
          </p>
        </div>

        <form onSubmit={handleAdd} className="flex flex-col gap-3 mb-8">
          <div className="flex gap-3">
            <input 
              type="url" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://jobs.lever.co/empresa"
              className="flex-1 bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/70"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </div>
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
        </form>

        <div className="flex flex-col gap-2">
          {companies.length === 0 ? (
            <div className="w-full text-center py-8 text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border/50">
              No hay empresas manuales cargadas.
            </div>
          ) : (
            companies.map((company) => (
              <div key={company.id} className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${company.status === 'active' ? 'bg-secondary/20 border-border' : 'bg-secondary/10 border-border/50 opacity-60'}`}>
                <div className="flex flex-col">
                  <span className="font-medium text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    {company.name}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
                      {company.ats}
                    </span>
                    {company.status === 'inactive' && (
                      <span className="text-xs text-amber-500/80 font-medium">Inactiva</span>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => handleToggleStatus(company.id, company.status)}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${company.status === 'active' ? 'text-green-500 hover:bg-green-500/10' : 'text-muted-foreground hover:bg-secondary'}`}
                  title={company.status === 'active' ? "Desactivar" : "Activar"}
                >
                  {company.status === 'active' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
