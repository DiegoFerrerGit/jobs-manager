"use client";

import { Eye } from "lucide-react";

export default function HiddenCompaniesManager({ companies, onShow }: { companies: string[], onShow: (name: string) => void }) {
  return (
    <div className="w-full">
      <div className="p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            Empresas Ocultas
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Las propuestas de estas empresas no aparecen en el listado. Tocá el ojo para volver a verlas.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {companies.length === 0 ? (
            <div className="w-full text-center py-8 text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border/50">
              No hay empresas ocultas.
            </div>
          ) : (
            companies.map((name) => (
              <div key={name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-colors shadow-sm">
                <span className="font-medium text-sm">{name}</span>
                <button
                  onClick={() => onShow(name)}
                  className="text-sky-400/70 hover:text-emerald-400 p-0.5 rounded-full hover:bg-emerald-500/10 transition-colors cursor-pointer"
                  title="Volver a mostrar esta empresa"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
