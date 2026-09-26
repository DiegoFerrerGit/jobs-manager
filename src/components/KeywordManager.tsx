"use client";

import { useState } from "react";
import { addKeyword, deleteKeyword } from "@/app/actions";
import { Plus, X } from "lucide-react";
import { IgnoredKeyword } from "@/db/schema";

export default function KeywordManager({ keywords, userId }: { keywords: IgnoredKeyword[], userId: number }) {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [optimisticKeywords, setOptimisticKeywords] = useState(keywords);

  // Sync state if server updates
  if (keywords !== optimisticKeywords && !isSubmitting) {
    setOptimisticKeywords(keywords);
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;

    const newKw = input.trim();
    setInput("");
    setIsSubmitting(true);

    // Optimistic UI
    const tempId = Date.now();
    setOptimisticKeywords([{ id: tempId, keyword: newKw, userId, createdAt: new Date() }, ...optimisticKeywords]);

    try {
      await addKeyword(userId, newKw);
    } catch (e) {
      console.error(e);
      setOptimisticKeywords(keywords); // Revert
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setOptimisticKeywords(optimisticKeywords.filter(k => k.id !== id));
    try {
      await deleteKeyword(id);
    } catch (e) {
      console.error(e);
      setOptimisticKeywords(keywords); // Revert
    }
  };

  return (
    <div className="w-full">
      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            Filtros para N8N (Excluir Roles)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Añade palabras clave o roles que no te interesan (por ejemplo: <span className="text-primary font-mono bg-primary/10 px-1 rounded">Staff QA</span>, <span className="text-primary font-mono bg-primary/10 px-1 rounded">Junior</span>).
            Estas reglas serán utilizadas por el flujo de automatización (n8n) para filtrar automáticamente las nuevas posiciones antes de llegar a esta base de datos.
          </p>
        </div>

        <form onSubmit={handleAdd} className="flex gap-3 mb-8">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe una palabra clave o rol..."
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
        </form>

        <div className="flex flex-wrap gap-2">
          {optimisticKeywords.length === 0 ? (
            <div className="w-full text-center py-8 text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border/50">
              No hay palabras ignoradas configuradas.
            </div>
          ) : (
            optimisticKeywords.map((kw) => (
              <div key={kw.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20 hover:bg-pink-500/20 transition-colors group shadow-sm">
                <span className="font-medium text-sm">{kw.keyword}</span>
                <button 
                  onClick={() => handleDelete(kw.id)}
                  className="text-pink-500/70 hover:text-red-400 p-0.5 rounded-full hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Eliminar regla"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
