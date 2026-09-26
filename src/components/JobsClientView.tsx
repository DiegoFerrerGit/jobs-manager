"use client";

import { useState, useMemo } from "react";
import { Briefcase, Building2, MapPin, DollarSign, Calendar, ExternalLink, Globe2, LayoutGrid, List, SlidersHorizontal, ArrowUpDown, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Job } from "@/db/schema";
import { toggleJobStatus } from "@/app/actions";

export default function JobsClientView({ initialJobs }: { initialJobs: Job[] }) {
  const [view, setView] = useState<"grid" | "table">("grid");
  const [sortParam, setSortParam] = useState<"date" | "salary" | "priority">("priority");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterLatam, setFilterLatam] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"unapplied" | "all" | "applied">("unapplied");
  
  // Basic salary parser to extract number for sorting
  const extractSalary = (sal: string | null) => {
    if (!sal) return 0;
    const match = sal.match(/\$?\s?(\d+)[kK]?/);
    return match ? parseInt(match[1]) : 0;
  };
  
  // Priority parser
  const getPriorityWeight = (pri: string | null) => {
    if (!pri) return 99;
    if (pri.includes("alta") || pri.includes("1")) return 1;
    if (pri.includes("media") || pri.includes("2")) return 2;
    return 3;
  };

  const processedJobs = useMemo(() => {
    let result = [...initialJobs];
    
    // Filter
    if (filterLatam !== "all") {
      result = result.filter(j => j.acepta_argentina === filterLatam);
    }
    
    // Status Filter
    if (filterStatus === "unapplied") {
      result = result.filter(j => j.status !== "APPLIED");
    } else if (filterStatus === "applied") {
      result = result.filter(j => j.status === "APPLIED");
    }
    
    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortParam === "salary") {
        cmp = extractSalary(a.salario) - extractSalary(b.salario);
      } else if (sortParam === "priority") {
        cmp = getPriorityWeight(a.prioridad) - getPriorityWeight(b.prioridad);
      } else {
        // Date sorting (default)
        const dateA = new Date(a.fecha_detectada || a.createdAt).getTime();
        const dateB = new Date(b.fecha_detectada || b.createdAt).getTime();
        cmp = dateA - dateB;
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });
    
    return result;
  }, [initialJobs, sortParam, sortOrder, filterLatam, filterStatus]);

  return (
    <div className="w-full">
      {/* TOOLBAR */}
      <div className="glass-card mb-8 p-4 rounded-xl flex flex-col sm:flex-row gap-4 justify-between items-center">
        
        {/* Filters & Sort */}
        <div className="flex flex-wrap items-center gap-3 text-sm w-full sm:w-auto">
          <div className="flex flex-1 sm:flex-none items-center gap-2 bg-secondary/50 px-3 py-2 rounded-lg border border-border">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <select 
              className="bg-transparent text-foreground outline-none border-none cursor-pointer w-full"
              value={filterLatam}
              onChange={(e) => setFilterLatam(e.target.value)}
            >
              <option value="all">Todo LATAM</option>
              <option value="si">LATAM Ok</option>
              <option value="posible">LATAM Posible</option>
            </select>
          </div>
          
          <div className="flex flex-1 sm:flex-none items-center gap-2 bg-secondary/50 px-3 py-2 rounded-lg border border-border">
            <CheckCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <select 
              className="bg-transparent text-foreground outline-none border-none cursor-pointer w-full"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="unapplied">Por aplicar</option>
              <option value="all">Mostrar todas</option>
              <option value="applied">Aplicadas</option>
            </select>
          </div>
          
          <div className="flex flex-1 sm:flex-none items-center gap-2 bg-secondary/50 px-3 py-2 rounded-lg border border-border">
            <ArrowUpDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <select 
              className="bg-transparent text-foreground outline-none border-none cursor-pointer w-full"
              value={sortParam}
              onChange={(e) => setSortParam(e.target.value as any)}
            >
              <option value="date">Fecha</option>
              <option value="salary">Salario</option>
              <option value="priority">Prioridad</option>
            </select>
            <button 
              onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
              className="ml-2 hover:text-primary text-muted-foreground transition-colors font-bold px-2 py-0.5 bg-background rounded border border-border"
            >
              {sortOrder === "asc" ? "Asc" : "Desc"}
            </button>
          </div>
        </div>

        {/* View Toggles */}
        <div className="flex items-center p-1 bg-secondary/50 rounded-lg border border-border self-end sm:self-auto">
          <button 
            onClick={() => setView("grid")}
            className={`p-2 rounded-md transition-all ${view === "grid" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
            aria-label="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setView("table")}
            className={`p-2 rounded-md transition-all ${view === "table" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
            aria-label="Table view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {processedJobs.length === 0 ? (
        <div className="text-center py-24 glass-card rounded-2xl">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground">No hay ofertas que coincidan</h3>
        </div>
      ) : view === "grid" ? (
        // GRID VIEW
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {processedJobs.map((job, idx) => (
            <div 
              key={job.id} 
              className="glass-card rounded-xl p-4 hover-lift flex flex-col h-full relative group overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-1.5 flex-nowrap shrink-0 overflow-x-auto no-scrollbar max-w-[70%]">
                  <span className={`inline-flex shrink-0 items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${job.prioridad?.includes("alta") ? "bg-red-500/10 text-red-400 border-red-500/20" : job.prioridad?.includes("media") ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                    {job.prioridad?.includes("alta") ? "Alta" : job.prioridad?.includes("media") ? "Media" : "Baja"}
                  </span>
                  {(job.acepta_argentina === "si" || job.acepta_argentina === "posible") && (
                    <span className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold border ${job.acepta_argentina === "si" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>
                      🇦🇷 {job.acepta_argentina === "si" ? "LATAM Ok" : "Posible"}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md font-mono shrink-0 ml-2">
                  {job.externalId?.split(':')[0]?.toUpperCase()}
                </span>
              </div>

              <h2 className="text-base font-bold text-foreground mb-1.5 line-clamp-2 leading-tight">
                {job.titulo}
              </h2>
              
              <div className="flex items-center gap-1.5 text-muted-foreground mb-3 text-xs">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                {job.linkedin_empresa ? (
                  <a href={job.linkedin_empresa} target="_blank" rel="noopener noreferrer" className="font-medium text-primary/80 hover:text-primary hover:underline truncate">
                    {job.empresa}
                  </a>
                ) : (
                  <span className="font-medium text-primary/80 truncate">{job.empresa}</span>
                )}
                {job.empleados && (
                  <span className="text-[10px] px-1 py-0.5 rounded-sm bg-secondary/50 whitespace-nowrap">
                    {job.empleados} empleados
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-4 flex-grow text-xs">
                {job.salario && (
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-green-500/10 text-green-400 shrink-0">
                      <DollarSign className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium text-green-100">{job.salario}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-blue-500/10 text-blue-400 shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span className="line-clamp-1 text-muted-foreground">{job.ubicaciones}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-purple-500/10 text-purple-400 shrink-0">
                    <Globe2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="line-clamp-1 text-muted-foreground">{job.motivo || job.visa || "Global"}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-orange-500/10 text-orange-400 shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <span className="line-clamp-1 text-muted-foreground">{job.fecha_publicacion || job.fecha_detectada}</span>
                </div>
              </div>

              <div className="mt-auto pt-3 border-t border-border flex justify-end items-center">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleJobStatus(job.id, job.status)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 border cursor-pointer shadow-sm ${job.status === "APPLIED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" : "bg-secondary text-muted-foreground border-transparent hover:text-foreground hover:border-border hover:bg-secondary/80"}`}
                  >
                    <CheckCircle className="w-3 h-3" />
                    {job.status === "APPLIED" ? "Aplicada" : "Marcar"}
                  </button>
                  
                  {job.url_aplicar && (
                    <Link 
                      href={job.url_aplicar} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium transition-all duration-200 hover:bg-primary/90 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                    >
                      Aplicar
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // TABLE VIEW
        <div className="glass-card rounded-xl overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Rol / Empresa</th>
                <th className="px-6 py-4 whitespace-nowrap">Empleados</th>
                <th className="px-6 py-4 whitespace-nowrap">Salario</th>
                <th className="px-6 py-4 whitespace-nowrap">Ubicación</th>
                <th className="px-6 py-4 whitespace-nowrap">Prioridad</th>
                <th className="px-6 py-4 whitespace-nowrap">LATAM</th>
                <th className="px-6 py-4 whitespace-nowrap">Fecha</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {processedJobs.map((job, idx) => (
                <tr 
                  key={job.id} 
                  className="border-b border-border/50 hover:bg-secondary/20 transition-colors group animate-fade-in-up"
                  style={{ animationDelay: `${idx * 20}ms` }}
                >
                  <td className="px-6 py-4">
                    <p className="font-bold text-foreground text-base mb-1">{job.titulo}</p>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                      <Building2 className="w-3 h-3" />
                      {job.linkedin_empresa ? (
                        <a href={job.linkedin_empresa} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">
                          {job.empresa}
                        </a>
                      ) : (
                        <span>{job.empresa}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs font-medium">
                    {job.empleados ? job.empleados : "-"}
                  </td>
                  <td className="px-6 py-4 font-medium text-green-400">
                    {job.salario || "-"}
                  </td>
                  <td className="px-6 py-4 max-w-[200px] truncate text-muted-foreground" title={job.ubicaciones || ""}>
                    {job.ubicaciones}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${job.prioridad?.includes("alta") ? "bg-red-500/10 text-red-400 border-red-500/20" : job.prioridad?.includes("media") ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                      {job.prioridad?.includes("alta") ? "Alta" : job.prioridad?.includes("media") ? "Media" : "Baja"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {(job.acepta_argentina === "si" || job.acepta_argentina === "posible") ? (
                      <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold border ${job.acepta_argentina === "si" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>
                        🇦🇷 {job.acepta_argentina === "si" ? "Ok" : "Posible"}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">
                    {job.fecha_publicacion || job.fecha_detectada || "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => toggleJobStatus(job.id, job.status)}
                        className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 hover:scale-110 active:scale-95 border cursor-pointer shadow-sm ${job.status === "APPLIED" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary/80"}`}
                        title={job.status === "APPLIED" ? "Deshacer" : "Marcar como aplicada"}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                      
                      {job.url_aplicar && (
                        <Link 
                          href={job.url_aplicar} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary transition-all duration-200 hover:bg-primary hover:text-primary-foreground text-xs font-medium border border-primary/20 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                        >
                          Aplicar
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
