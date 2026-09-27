"use client";

import { useState, useMemo, useEffect } from "react";
import { Briefcase, Building2, MapPin, DollarSign, Calendar, ExternalLink, Globe2, LayoutGrid, List, SlidersHorizontal, ArrowUpDown, CheckCircle, XCircle, Search, EyeOff, Eye, Settings, X, Star } from "lucide-react";
import Link from "next/link";
import { Job, IgnoredKeyword, Company } from "@/db/schema";
import { toggleJobStatus, hideJob, toggleFavoriteCompany } from "@/app/actions";
import { filterJobsBySearch } from "@/utils/search";
import KeywordManager from "./KeywordManager";
import ManualCompanyManager from "./ManualCompanyManager";

const getSourceBadge = (source: string | null | undefined, externalId: string | null | undefined) => {
  const src = source || (externalId ? externalId.split(':')[0] : null);
  if (!src) return null;
  
  const s = src.toLowerCase();
  if (s.includes('gh') || s.includes('greenhouse')) {
    return (
      <span className="text-[11px] text-[#00b289] bg-[#00b289]/10 border border-[#00b289]/20 px-2 py-0.5 rounded-md font-bold shrink-0 ml-2 shadow-sm">
        Greenhouse
      </span>
    );
  }
  if (s.includes('ashby')) {
    return (
      <span className="text-[11px] text-[#8e49ff] bg-[#8e49ff]/10 border border-[#8e49ff]/20 px-2 py-0.5 rounded-md font-bold shrink-0 ml-2 shadow-sm">
        Ashby
      </span>
    );
  }
  if (s.includes('lever')) {
    return (
      <span className="text-[11px] text-[#2c84cc] bg-[#2c84cc]/10 border border-[#2c84cc]/20 px-2 py-0.5 rounded-md font-bold shrink-0 ml-2 shadow-sm">
        Lever
      </span>
    );
  }
  if (s.includes('yc')) {
    return (
      <span className="text-[11px] text-orange-500 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md font-bold shrink-0 ml-2 shadow-sm">
        YCombinator
      </span>
    );
  }
  if (s.includes('teamtailor')) {
    return (
      <span className="text-[11px] text-pink-500 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-md font-bold shrink-0 ml-2 shadow-sm">
        TeamTailor
      </span>
    );
  }
  
  return (
    <span className="text-[11px] text-muted-foreground bg-secondary px-2 py-1 rounded-md font-mono shrink-0 ml-2">
      {src.toUpperCase()}
    </span>
  );
};

export default function JobsClientView({ initialJobs, initialKeywords, initialCompanies, initialFavoriteCompanies, userId }: { initialJobs: Job[], initialKeywords: IgnoredKeyword[], initialCompanies: Company[], initialFavoriteCompanies: string[], userId: number }) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [favoriteCompanies, setFavoriteCompanies] = useState<Set<string>>(new Set(initialFavoriteCompanies || []));
  const [view, setView] = useState<"grid" | "table">("grid");
  const [sortParam, setSortParam] = useState<"date" | "salary" | "priority" | "latam" | "employees">("priority");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterLatam, setFilterLatam] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"unapplied" | "all" | "applied" | "hidden" | "closed">("unapplied");
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  const hasFiltersChanged = filterLatam !== "all" || filterStatus !== "unapplied" || sortParam !== "priority" || sortOrder !== "asc" || searchQuery !== "" || filterCompany !== "all";

  const handleClearFilters = () => {
    setFilterLatam("all");
    setFilterStatus("unapplied");
    setSortParam("priority");
    setSortOrder("asc");
    setSearchQuery("");
    setFilterCompany("all");
  };

  const handleToggleFavoriteCompany = async (companyName: string) => {
    if (!userId) return;
    const isCurrentlyFav = favoriteCompanies.has(companyName);
    const newFavs = new Set(favoriteCompanies);
    if (isCurrentlyFav) {
      newFavs.delete(companyName);
    } else {
      newFavs.add(companyName);
    }
    setFavoriteCompanies(newFavs);
    try {
      await toggleFavoriteCompany(userId, companyName, !isCurrentlyFav);
    } catch (e) {
      console.error("Failed to toggle favorite company", e);
      // Revert on error
      setFavoriteCompanies(favoriteCompanies);
    }
  };

  const companyOptions = useMemo(() => {
    const uniqueCompanies = Array.from(new Set(jobs.map(j => j.company))).filter(Boolean).sort((a, b) => a.localeCompare(b));
    const favs: string[] = [];
    const nonFavs: string[] = [];
    uniqueCompanies.forEach(c => {
      if (favoriteCompanies.has(c)) favs.push(c);
      else nonFavs.push(c);
    });
    return { favs, nonFavs };
  }, [jobs, favoriteCompanies]);

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "APPLIED" ? "SAVED" : "APPLIED";

    // Optimistic update
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: newStatus as any } : j));

    try {
      await toggleJobStatus(id, currentStatus);
    } catch (error) {
      console.error(error);
      // Revert on error
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status: currentStatus as any } : j));
    }
  };

  const handleHide = async (id: number, currentStatus: string) => {
    // If it's already rejected, un-hide it back to SAVED
    const newStatus = currentStatus === "REJECTED" ? "SAVED" : "REJECTED";

    // Save previous state for reverting
    const prevJobs = [...jobs];

    // Optimistic UI
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: newStatus as any } : j));

    try {
      await hideJob(id, newStatus);
    } catch (error) {
      console.error("Failed to hide", error);
      setJobs(prevJobs); // Revert
    }
  };

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
    let result = [...jobs];

    // Exclude jobs with ignored keywords
    if (initialKeywords && initialKeywords.length > 0) {
      const lowerKeywords = initialKeywords.map(k => k.keyword.toLowerCase());
      result = result.filter(j => {
        const titleLower = j.title.toLowerCase();
        return !lowerKeywords.some(kw => titleLower.includes(kw));
      });
    }

    // Filter
    if (filterLatam !== "all") {
      result = result.filter(j => j.acceptsArgentina === filterLatam);
    }

    // Filter by Status
    if (filterStatus === "unapplied") {
      result = result.filter(j => 
        j.status !== "APPLIED" && 
        j.status !== "REJECTED" && 
        (j.closedAt === null || j.status !== "SAVED")
      );
    } else if (filterStatus === "applied") {
      result = result.filter(j => j.status === "APPLIED");
    } else if (filterStatus === "hidden") {
      result = result.filter(j => j.status === "REJECTED");
    } else if (filterStatus === "closed") {
      result = result.filter(j => j.closedAt !== null);
    }

    // Filter by Company
    if (filterCompany !== "all") {
      result = result.filter(j => j.company === filterCompany);
    }

    // Search Query
    if (searchQuery.trim() !== "") {
      result = filterJobsBySearch(result, searchQuery);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortParam === "salary") {
        cmp = extractSalary(a.salary) - extractSalary(b.salary);
      } else if (sortParam === "priority") {
        cmp = (a.priority || 3) - (b.priority || 3);
      } else if (sortParam === "employees") {
        const empA = a.companySize || 0;
        const empB = b.companySize || 0;
        cmp = empA - empB;
      } else if (sortParam === "latam") {
        const getLatamWeight = (val: string | null) => {
          if (val === "yes") return 3;
          if (val === "maybe") return 2;
          return 1;
        };
        cmp = getLatamWeight(a.acceptsArgentina) - getLatamWeight(b.acceptsArgentina);
      } else {
        // Date sorting (default)
        const dateA = new Date(a.detectedAt || a.createdAt).getTime();
        const dateB = new Date(b.detectedAt || b.createdAt).getTime();
        cmp = dateA - dateB;
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return result;
  }, [jobs, sortParam, sortOrder, filterLatam, filterStatus, filterCompany, searchQuery, initialKeywords, favoriteCompanies]);

  const handleHeaderSort = (param: "date" | "salary" | "priority" | "latam" | "employees") => {
    if (sortParam === param) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortParam(param);
      setSortOrder("asc");
    }
  };

  return (
    <div className="w-full">
      {/* TOOLBAR */}
      <div className="glass-card mb-8 p-4 rounded-b-2xl rounded-t-none border-t-0 flex flex-wrap gap-4 items-center justify-between shadow-md relative z-10 -mt-1">

        {/* Left Side: Search & Filters */}
        <div className="flex flex-wrap items-center gap-3 text-sm flex-1">
          {/* Search */}
          <div className="relative w-full sm:max-w-xs shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar rol o empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/70 text-foreground"
            />
          </div>

          {/* Filters & Sort */}
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
              <option value="hidden">Ocultas</option>
              <option value="closed">Cerradas</option>
            </select>
          </div>

          <div className="flex flex-1 sm:flex-none items-center gap-2 bg-secondary/50 px-3 py-2 rounded-lg border border-border">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <select
              className="bg-transparent text-foreground outline-none border-none cursor-pointer w-full"
              value={filterLatam}
              onChange={(e) => setFilterLatam(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="si">LATAM Ok</option>
              <option value="posible">LATAM Posible</option>
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
              <option value="latam">LATAM</option>
              <option value="employees">Empleados</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
              className="ml-2 hover:text-primary text-muted-foreground transition-colors font-bold px-2 py-0.5 bg-background rounded border border-border cursor-pointer"
            >
              {sortOrder === "asc" ? "Asc" : "Desc"}
            </button>
          </div>

          <div className="flex flex-1 sm:flex-none items-center gap-2 bg-secondary/50 px-3 py-2 rounded-lg border border-border">
            <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <select
              className="bg-transparent text-foreground outline-none border-none cursor-pointer w-full max-w-[150px] truncate"
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
            >
              <option value="all">Todas las empresas</option>
              {companyOptions.favs.length > 0 && (
                <optgroup label="⭐ Favoritas">
                  {companyOptions.favs.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </optgroup>
              )}
              {companyOptions.nonFavs.length > 0 && (
                <optgroup label="Otras">
                  {companyOptions.nonFavs.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {hasFiltersChanged && (
            <button
              onClick={handleClearFilters}
              className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors text-xs font-semibold shadow-sm shrink-0"
              title="Limpiar filtros y búsqueda"
            >
              <XCircle className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
          
          {/* Job Count */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-bold shrink-0 shadow-sm">
            <span>{processedJobs.length}</span>
            <span className="font-medium text-[11px] opacity-80 uppercase tracking-wide">
              {processedJobs.length === 1 ? 'Job' : 'Jobs'}
            </span>
          </div>
        </div>

        {/* Right Side: View Toggles */}
        <div className="flex items-center p-1 bg-secondary/50 rounded-lg border border-border shrink-0 self-start sm:self-auto">
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
          <div className="w-px h-5 bg-border mx-1" />
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-md transition-all text-muted-foreground hover:text-foreground hover:bg-secondary"
            title="Ajustes y Filtros N8N"
          >
            <Settings className="w-4 h-4" />
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
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold border ${job.priority === 1 ? "bg-red-500/10 text-red-400 border-red-500/20" : job.priority === 2 ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                    {job.priority === 1 ? "Alta" : job.priority === 2 ? "Media" : "Baja"}
                  </span>
                  {(job.acceptsArgentina === "yes" || job.acceptsArgentina === "maybe") && (
                    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold border ${job.acceptsArgentina === "yes" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>
                      🇦🇷 {job.acceptsArgentina === "yes" ? "LATAM Ok" : "Posible"}
                    </span>
                  )}
                  {job.closedAt && (
                    <span className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold border bg-secondary/80 text-muted-foreground border-border/60 shadow-sm">
                      Cerrada
                    </span>
                  )}
                </div>
                {getSourceBadge(job.source, job.externalId)}
              </div>

              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h2 className={`text-base font-bold line-clamp-2 leading-tight ${job.status === "REJECTED" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {job.title}
                </h2>
                <button
                  onClick={() => handleHide(job.id, job.status)}
                  className={`p-1.5 rounded-md transition-all shrink-0 cursor-pointer ${job.status === "REJECTED"
                      ? "text-primary bg-primary/10 hover:bg-primary/20 opacity-100"
                      : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10"
                    }`}
                  title={job.status === "REJECTED" ? "Mostrar oferta" : "Ocultar oferta"}
                >
                  {job.status === "REJECTED" ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-muted-foreground mb-3 text-xs">
                <button
                  onClick={() => handleToggleFavoriteCompany(job.company)}
                  className="p-0.5 rounded-sm hover:bg-secondary transition-colors"
                  title="Marcar empresa como favorita"
                >
                  <Star className={`w-3.5 h-3.5 ${favoriteCompanies.has(job.company) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/70 hover:text-yellow-500"}`} />
                </button>
                {job.companyLinkedin ? (
                  <a href={job.companyLinkedin} target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-400 hover:text-sky-300 hover:underline">
                    {job.company}
                  </a>
                ) : (
                  <span className="font-semibold text-sky-400">{job.company}</span>
                )}
                {job.companyHq && (
                  <>
                    <span className="text-muted-foreground/50 shrink-0">-</span>
                    <span className="text-muted-foreground" title={job.companyHq}>📍 {job.companyHq}</span>
                  </>
                )}
                {job.companySize != null && job.companySize > 0 && (
                  <span className="text-[10px] px-1 py-0.5 rounded-sm bg-secondary/50 whitespace-nowrap">
                    {job.companySize} empleados
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-4 flex-grow text-xs">
                {job.salary && (
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-green-500/10 text-green-400 shrink-0">
                      <DollarSign className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium text-green-100">{job.salary}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-blue-500/10 text-blue-400 shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span className="line-clamp-1 text-muted-foreground">{job.locations}</span>
                </div>



                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-orange-500/10 text-orange-400 shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <span className="line-clamp-1 text-muted-foreground">{job.publishedAt || job.detectedAt}</span>
                </div>
              </div>

              <div className="mt-auto pt-3 border-t border-border flex justify-end items-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(job.id, job.status)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 border cursor-pointer shadow-sm ${job.status === "APPLIED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" : "bg-secondary text-muted-foreground border-transparent hover:text-foreground hover:border-border hover:bg-secondary/80"}`}
                  >
                    <CheckCircle className="w-3 h-3" />
                    {job.status === "APPLIED" ? "Aplicada" : "Marcar como aplicado"}
                  </button>

                  {job.applyUrl && (
                    <Link
                      href={job.applyUrl}
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
            <thead className="text-[11px] text-muted-foreground uppercase bg-secondary/30 border-b border-border">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Rol / Empresa</th>
                <th
                  className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-secondary/50 transition-colors select-none group"
                  onClick={() => handleHeaderSort("employees")}
                >
                  <div className="flex items-center gap-1">
                    Empleados
                    <ArrowUpDown className={`w-3 h-3 ${sortParam === 'employees' ? 'text-primary' : 'opacity-0 group-hover:opacity-50'}`} />
                  </div>
                </th>
                <th
                  className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-secondary/50 transition-colors select-none group"
                  onClick={() => handleHeaderSort("salary")}
                >
                  <div className="flex items-center gap-1">
                    Salario
                    <ArrowUpDown className={`w-3 h-3 ${sortParam === 'salary' ? 'text-primary' : 'opacity-0 group-hover:opacity-50'}`} />
                  </div>
                </th>
                <th className="px-6 py-4 whitespace-nowrap">Ubicación</th>
                <th
                  className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-secondary/50 transition-colors select-none group"
                  onClick={() => handleHeaderSort("priority")}
                >
                  <div className="flex items-center gap-1">
                    Prioridad
                    <ArrowUpDown className={`w-3 h-3 ${sortParam === 'priority' ? 'text-primary' : 'opacity-0 group-hover:opacity-50'}`} />
                  </div>
                </th>
                <th
                  className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-secondary/50 transition-colors select-none group"
                  onClick={() => handleHeaderSort("latam")}
                >
                  <div className="flex items-center gap-1">
                    LATAM
                    <ArrowUpDown className={`w-3 h-3 ${sortParam === 'latam' ? 'text-primary' : 'opacity-0 group-hover:opacity-50'}`} />
                  </div>
                </th>
                <th
                  className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-secondary/50 transition-colors select-none group"
                  onClick={() => handleHeaderSort("date")}
                >
                  <div className="flex items-center gap-1">
                    Fecha
                    <ArrowUpDown className={`w-3 h-3 ${sortParam === 'date' ? 'text-primary' : 'opacity-0 group-hover:opacity-50'}`} />
                  </div>
                </th>
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
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col mb-1">
                        <div className="flex items-center gap-2">
                          <p className={`font-bold text-base ${job.status === "REJECTED" ? "text-muted-foreground line-through" : "text-foreground"}`}>{job.title}</p>
                          {job.closedAt && (
                            <span className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-secondary/80 border border-border/60 text-muted-foreground">
                              Cerrada
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleHide(job.id, job.status)}
                        className={`transition-all p-1.5 rounded-md cursor-pointer ${job.status === "REJECTED"
                            ? "text-primary hover:bg-primary/10 opacity-100"
                            : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10"
                          }`}
                        title={job.status === "REJECTED" ? "Mostrar oferta" : "Ocultar oferta"}
                      >
                        {job.status === "REJECTED" ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-muted-foreground text-xs">
                      <button
                        onClick={() => handleToggleFavoriteCompany(job.company)}
                        className="p-0.5 rounded-sm hover:bg-secondary transition-colors"
                        title="Marcar empresa como favorita"
                      >
                        <Star className={`w-3.5 h-3.5 ${favoriteCompanies.has(job.company) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/70 hover:text-yellow-500"}`} />
                      </button>
                      {job.companyLinkedin ? (
                        <a href={job.companyLinkedin} target="_blank" rel="noopener noreferrer" className="text-sky-400 font-semibold hover:text-sky-300 hover:underline">
                          {job.company}
                        </a>
                      ) : (
                        <span className="text-sky-400 font-semibold">{job.company}</span>
                      )}
                      {job.companyHq && (
                        <>
                          <span className="text-muted-foreground/50 shrink-0">-</span>
                          <span className="text-muted-foreground" title={job.companyHq}>📍 {job.companyHq}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs font-medium">
                    {job.companySize ? job.companySize : "-"}
                  </td>
                  <td className="px-6 py-4 font-medium text-green-400">
                    {job.salary || "-"}
                  </td>
                  <td className="px-6 py-4 max-w-[200px] truncate text-muted-foreground" title={job.locations || ""}>
                    {job.locations}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${job.priority === 1 ? "bg-red-500/10 text-red-400 border-red-500/20" : job.priority === 2 ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                      {job.priority === 1 ? "Alta" : job.priority === 2 ? "Media" : "Baja"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {(job.acceptsArgentina === "yes" || job.acceptsArgentina === "maybe") ? (
                      <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold border ${job.acceptsArgentina === "yes" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>
                        🇦🇷 {job.acceptsArgentina === "yes" ? "Ok" : "Posible"}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">
                    {job.publishedAt || job.detectedAt || "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(job.id, job.status)}
                        className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 hover:scale-110 active:scale-95 border cursor-pointer shadow-sm ${job.status === "APPLIED" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary/80"}`}
                        title={job.status === "APPLIED" ? "Deshacer" : "Marcar como aplicada"}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>

                      {job.applyUrl && (
                        <Link
                          href={job.applyUrl}
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

      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)} />
          <div className="relative w-full max-w-2xl bg-background rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-border bg-secondary/20">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Ajustes de Jobs Manager
              </h2>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[80vh] overflow-y-auto p-2">
              <KeywordManager keywords={initialKeywords} userId={userId} />
              <ManualCompanyManager initialCompanies={initialCompanies} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
