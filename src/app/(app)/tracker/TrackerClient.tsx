"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, Eye, EyeOff, GripVertical, Trash2, CheckCircle2, Check, Undo2, Filter, XCircle, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TrackerJob, TrackerConfig, DEFAULT_SELECT_OPTIONS } from "./types";
import JobPanel from "./components/JobPanel";
import { updateJobAction, updateJobColumnAction, deleteJobAction, updateColumnsAction, updateConfigAction } from "./actions";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Sector } from "recharts";

const extractHexColor = (colorClass?: string) => {
  if (!colorClass) return '#5c5c5c';
  const match = colorClass.match(/bg-\[#([0-9a-fA-F]{3,6})\]/);
  if (match) return `#${match[1]}`;
  if (colorClass.startsWith('#')) return colorClass;
  return '#5c5c5c';
};

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: `drop-shadow(0px 0px 8px ${fill}) saturate(2)`, outline: 'none' }}
      />
    </g>
  );
};
// Updated mock data with vibrant Notion dark mode colors
const initialColumns = {
  "people": {
    id: "people",
    title: "People / Screening",
    badge: "bg-[#9f6b53] text-white",
    wrapperBg: "bg-[#291d17]",
    cardBg: "bg-[#3f2c21]",
    cardHover: "hover:bg-[#4c3629]",
    jobs: [
      { id: "job-1", name: "Alpaca", location: "US 🗽", role: "Director of Engineering", salarioAnual: 240000, salarioMensual: 20000 },
      { id: "job-2", name: "Tapi", location: "Argentina", role: "Technical Manager", salarioAnual: 120000, salarioMensual: 10000 },
      { id: "job-3", name: "AssureSoft", role: "Engineering Manager", salarioAnual: 102000, salarioMensual: 8500 },
      { id: "job-5", name: "Globant", location: "Remote 🌎", role: "VP of Engineering", salarioAnual: 180000, salarioMensual: 15000 }
    ] as TrackerJob[]
  },
  "hiring": {
    id: "hiring",
    title: "Hiring Manager",
    badge: "bg-[#c14c8a] text-white",
    wrapperBg: "bg-[#281b21]",
    cardBg: "bg-[#402232]",
    cardHover: "hover:bg-[#4c293c]",
    jobs: [] as TrackerJob[]
  },
  "tecnica": {
    id: "tecnica",
    title: "Técnica",
    badge: "bg-[#9065b0] text-white",
    wrapperBg: "bg-[#231f2b]",
    cardBg: "bg-[#322a3d]",
    cardHover: "hover:bg-[#3c3349]",
    jobs: [] as TrackerJob[]
  },
  "clevel": {
    id: "clevel",
    title: "C-Level / Culture",
    badge: "bg-[#cb912f] text-white",
    wrapperBg: "bg-[#2b2718]",
    cardBg: "bg-[#3d3822]",
    cardHover: "hover:bg-[#494328]",
    jobs: [] as TrackerJob[]
  },
  "oferta": {
    id: "oferta",
    title: "Oferta",
    badge: "bg-[#337ea9] text-white",
    wrapperBg: "bg-[#1c242c]",
    cardBg: "bg-[#263645]",
    cardHover: "hover:bg-[#2d4052]",
    jobs: [] as TrackerJob[]
  },
  "hold": {
    id: "hold",
    title: "Hold",
    badge: "bg-[#787774] text-white",
    wrapperBg: "bg-[#202020]",
    cardBg: "bg-[#2f2f2f]",
    cardHover: "hover:bg-[#383838]",
    jobs: [
      { id: "job-4", name: "Katapult", location: "Colombia", role: "Head Of Engineering", salarioAnual: 96000, salarioMensual: 8000 }
    ] as TrackerJob[]
  },
  "aceptada": {
    id: "aceptada",
    title: "Aceptada",
    badge: "bg-[#448361] text-white",
    wrapperBg: "bg-[#1e2621]",
    cardBg: "bg-[#283a2d]",
    cardHover: "hover:bg-[#304536]",
    jobs: [] as TrackerJob[]
  },
  "nocontinua": {
    id: "nocontinua",
    title: "No continuamos",
    badge: "bg-[#d44c47] text-white",
    wrapperBg: "bg-[#2d1d1d]",
    cardBg: "bg-[#422828]",
    cardHover: "hover:bg-[#4f3030]",
    jobs: [] as TrackerJob[]
  }
};

const COLUMN_COLORS = {
  gris: { name: "Gris", badge: "bg-[#787774] text-white", wrapperBg: "bg-[#202020]", cardBg: "bg-[#2f2f2f]", cardHover: "hover:bg-[#383838]" },
  marron: { name: "Marrón", badge: "bg-[#9f6b53] text-white", wrapperBg: "bg-[#291d17]", cardBg: "bg-[#3f2c21]", cardHover: "hover:bg-[#4c3629]" },
  naranja: { name: "Naranja", badge: "bg-[#d9730d] text-white", wrapperBg: "bg-[#2e2118]", cardBg: "bg-[#453022]", cardHover: "hover:bg-[#523928]" },
  amarillo: { name: "Amarillo", badge: "bg-[#cb912f] text-white", wrapperBg: "bg-[#2b2718]", cardBg: "bg-[#3d3822]", cardHover: "hover:bg-[#494328]" },
  verde: { name: "Verde", badge: "bg-[#448361] text-white", wrapperBg: "bg-[#1e2621]", cardBg: "bg-[#283a2d]", cardHover: "hover:bg-[#304536]" },
  azul: { name: "Azul", badge: "bg-[#337ea9] text-white", wrapperBg: "bg-[#1c242c]", cardBg: "bg-[#263645]", cardHover: "hover:bg-[#2d4052]" },
  morado: { name: "Morado", badge: "bg-[#9065b0] text-white", wrapperBg: "bg-[#231f2b]", cardBg: "bg-[#322a3d]", cardHover: "hover:bg-[#3c3349]" },
  rosa: { name: "Rosa", badge: "bg-[#c14c8a] text-white", wrapperBg: "bg-[#281b21]", cardBg: "bg-[#402232]", cardHover: "hover:bg-[#4c293c]" },
  rojo: { name: "Rojo", badge: "bg-[#d44c47] text-white", wrapperBg: "bg-[#2d1d1d]", cardBg: "bg-[#422828]", cardHover: "hover:bg-[#4f3030]" }
};

type ColumnData = {
  id: string;
  title: string;
  badge: string;
  wrapperBg: string;
  cardBg: string;
  cardHover: string;
  jobs: TrackerJob[];
};

export default function TrackerClient({ initialData, currentUser }: { initialData: any, currentUser?: { name: string; picture?: string } }) {

  // -- MIGRATION LOGIC (Run once on initialData) --
  const getAnnualSalaryLocal = (job: any) => job.salarioAnual || (job.salarioMensual ? job.salarioMensual * 12 : 0);
  const sortJobsLocal = (jobs: any[]) => [...jobs].sort((a, b) => getAnnualSalaryLocal(b) - getAnnualSalaryLocal(a));

  const initialColumns = { ...initialData.columns };
  let initialOrder = [...(initialData.columnOrder || [])];

  const acceptedJobs: any[] = [];
  const rejectedJobs: any[] = [];
  const idsToRemove = new Set<string>();

  Object.keys(initialColumns).forEach(colId => {
    const titleLower = initialColumns[colId].title.toLowerCase();
    if (titleLower.includes('aceptada')) {
      acceptedJobs.push(...initialColumns[colId].jobs);
      idsToRemove.add(colId);
    } else if (titleLower.includes('no continuam') || titleLower.includes('rechazad')) {
      rejectedJobs.push(...initialColumns[colId].jobs);
      idsToRemove.add(colId);
    }
  });

  idsToRemove.forEach(id => delete initialColumns[id]);
  initialOrder = initialOrder.filter(id => !idsToRemove.has(id) && id !== 'col-accepted' && id !== 'col-rejected');

  if (!initialColumns['col-accepted']) {
    initialColumns['col-accepted'] = { id: 'col-accepted', title: 'Aceptadas', jobs: sortJobsLocal(acceptedJobs), badge: 'bg-green-500/20 text-green-500', wrapperBg: 'bg-[#1e2621]', cardBg: 'bg-[#283a2d]', cardHover: 'hover:bg-[#304536]' };
  } else {
    initialColumns['col-accepted'].jobs.push(...acceptedJobs);
    initialColumns['col-accepted'].jobs = sortJobsLocal(initialColumns['col-accepted'].jobs);
    initialColumns['col-accepted'].wrapperBg = 'bg-[#1e2621]';
    initialColumns['col-accepted'].cardBg = 'bg-[#283a2d]';
    initialColumns['col-accepted'].cardHover = 'hover:bg-[#304536]';
  }

  if (!initialColumns['col-rejected']) {
    initialColumns['col-rejected'] = { id: 'col-rejected', title: 'No Continuamos', jobs: sortJobsLocal(rejectedJobs), badge: 'bg-red-500/20 text-red-500', wrapperBg: 'bg-[#2d1d1d]', cardBg: 'bg-[#422828]', cardHover: 'hover:bg-[#4f3030]' };
  } else {
    initialColumns['col-rejected'].jobs.push(...rejectedJobs);
    initialColumns['col-rejected'].jobs = sortJobsLocal(initialColumns['col-rejected'].jobs);
    initialColumns['col-rejected'].wrapperBg = 'bg-[#2d1d1d]';
    initialColumns['col-rejected'].cardBg = 'bg-[#422828]';
    initialColumns['col-rejected'].cardHover = 'hover:bg-[#4f3030]';
  }
  // -- END MIGRATION LOGIC --

  const [columns, setColumns] = useState<Record<string, ColumnData>>(initialColumns);
  const [columnOrder, setColumnOrder] = useState<string[]>(initialOrder);

  const [config, setConfig] = useState<TrackerConfig>(initialData.config || { options: DEFAULT_SELECT_OPTIONS });
  const [isMounted, setIsMounted] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownRect, setDropdownRect] = useState<{ top: number, left: number } | null>(null);
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  
  // Column title editing state
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnTitle, setEditingColumnTitle] = useState<string>("");

  // Panel state
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);

  // Delete modal state
  const [jobToDelete, setJobToDelete] = useState<{ jobId: string, columnId: string } | null>(null);
  const [jobToFinalize, setJobToFinalize] = useState<{ jobId: string, columnId: string, currentColumnTitle: string } | null>(null);
  const [jobToRestore, setJobToRestore] = useState<{ jobId: string, currentColumnId: string } | null>(null);
  const [restoreTargetCol, setRestoreTargetCol] = useState<string>("");
  const [filterEmpresa, setFilterEmpresa] = useState<Record<string, string>>({});
  const [filterRole, setFilterRole] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState<Record<string, string>>({});
  const [sortOrder, setSortOrder] = useState<Record<string, 'recent' | 'salary' | 'score'>>({});

  const [finalizeCategory, setFinalizeCategory] = useState<string>("");
  const [finalizeCLevelSuccess, setFinalizeCLevelSuccess] = useState<boolean | null>(null);
  const [chartMotivoFilter, setChartMotivoFilter] = useState<string | null>(null);
  const [chartInstanciaFilter, setChartInstanciaFilter] = useState<string | null>(null);
  const [activeMotivoIndex, setActiveMotivoIndex] = useState<number>(-1);

  // Exchange rate for ARS to USD
  const [dolarBlue, setDolarBlue] = useState<number | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem('dolarBlue');
    const cachedTime = localStorage.getItem('dolarBlue_time');
    const now = Date.now();

    // Cache for 24 hours (86400000 ms)
    if (cached && cachedTime && now - parseInt(cachedTime) < 86400000) {
      setDolarBlue(parseFloat(cached));
      return;
    }

    fetch('https://dolarapi.com/v1/dolares')
      .then(res => res.json())
      .then((data: any[]) => {
        const blue = data.find(d => d.casa === 'blue' || d.nombre === 'Blue');
        if (blue && blue.venta) {
          setDolarBlue(blue.venta);
          localStorage.setItem('dolarBlue', blue.venta.toString());
          localStorage.setItem('dolarBlue_time', now.toString());
        }
      })
      .catch(console.error);
  }, []);

  const renderJobCard = (job: TrackerJob, columnId: string, column: ColumnData, providedJob?: any, snapshotJob?: any, isFinalized = false) => {
    return (
      <div
        ref={providedJob?.innerRef}
        {...providedJob?.draggableProps}
        {...providedJob?.dragHandleProps}
        className={`${isFinalized ? "w-full sm:w-[270px] min-h-[187.5px]" : "mb-3 min-h-[145px]"} rounded-xl p-3 shadow-sm cursor-pointer group relative transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 flex flex-col gap-3 ${column.cardBg} ${column.cardHover} border border-white/5 ${snapshotJob?.isDragging ? "ring-2 ring-primary shadow-lg" : ""} ${selectedJobId === job.id ? "ring-2 ring-inset ring-blue-500 bg-white/5" : ""}`}
        style={providedJob ? { ...providedJob.draggableProps.style } : undefined}
        onClick={() => {
          setSelectedJobId(job.id);
          setSelectedColumnId(columnId);
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setJobToDelete({ jobId: job.id, columnId });
          }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-black/40 hover:bg-destructive/80 text-white/50 hover:text-white rounded-md transition-all z-50 cursor-pointer"
          title="Eliminar tarjeta"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {isFinalized && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setJobToRestore({ jobId: job.id, currentColumnId: columnId });
            }}
            className="absolute top-2 right-9 opacity-0 group-hover:opacity-100 p-1.5 bg-black/40 hover:bg-white/10 text-white/50 hover:text-white rounded-md transition-all z-50 cursor-pointer"
            title="Volver a Kanban"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
        )}

        {!isFinalized && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setJobToFinalize({ jobId: job.id, columnId, currentColumnTitle: column.title });
              setFinalizeCategory("");
              setFinalizeCLevelSuccess(null);
            }}
            className="absolute top-2 right-9 opacity-0 group-hover:opacity-100 p-1.5 bg-[#202020] hover:bg-green-500/20 text-muted-foreground hover:text-green-500 rounded-md transition-all z-10"
            title="Finalizar proceso"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>
        )}

        <h3 className="font-bold text-[15px] text-foreground pr-10">{job.name}</h3>

        <div className="flex flex-col gap-1.5 items-start">
          {job.score ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium leading-tight bg-yellow-500/20 text-yellow-500">
              ⭐ {job.score}/10
            </span>
          ) : null}
          {job.location && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium leading-tight ${config?.options?.location?.find((o: any) => o.label === job.location)?.color || 'bg-white/10 text-white/80'}`}>
              {job.location}
            </span>
          )}
          {job.role && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium leading-tight ${config?.options?.role?.find((o: any) => o.label === job.role)?.color || 'bg-white/10 text-white/80'}`}>
              {job.role}
            </span>
          )}
          {job.categoriaCierre && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium leading-tight ${config?.options?.categoriaCierre?.find((o: any) => o.label === job.categoriaCierre)?.color || 'bg-white/10 text-white/80'}`}>
              Motivo: {job.categoriaCierre}
            </span>
          )}
        </div>

        {(Boolean(job.salarioMensual) || Boolean(job.salarioAnual)) && (
          <div className={`mt-1 flex flex-col gap-1.5 text-[12px] font-semibold ${job.monedaSalario === 'ARS' ? 'text-sky-400' : 'text-emerald-400'}`}>
            {Boolean(job.salarioAnual) && (
              <span>
                {job.monedaSalario === 'ARS' ? '$ ' : 'US$ '}{job.salarioAnual!.toLocaleString(job.monedaSalario === 'ARS' ? 'es-AR' : 'en-US')}
                {job.monedaSalario === 'ARS' && dolarBlue && <span className="text-emerald-500/90 font-medium ml-1">- US$ {Math.round(job.salarioAnual! / dolarBlue).toLocaleString('en-US')}</span>}
              </span>
            )}
            {Boolean(job.salarioMensual) && (
              <span>
                {job.monedaSalario === 'ARS' ? '$ ' : 'US$ '}{job.salarioMensual!.toLocaleString(job.monedaSalario === 'ARS' ? 'es-AR' : 'en-US')}
                {job.monedaSalario === 'ARS' && dolarBlue && <span className="text-emerald-500/90 font-medium ml-1">- US$ {Math.round(job.salarioMensual! / dolarBlue).toLocaleString('en-US')}</span>}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const getAnnualSalary = (job: TrackerJob) => {
    return job.salarioAnual || (job.salarioMensual ? job.salarioMensual * 12 : 0);
  };



  const renderFilters = (colId: string) => {
    const jobs = columns[colId]?.jobs || [];
    if (jobs.length === 0) return null;

    const emp = filterEmpresa[colId] || '';
    const rol = filterRole[colId] || '';
    const sort = sortOrder[colId] || 'recent';

    return (
      <div className="flex flex-wrap items-center gap-3 ml-auto">
        <div className="flex items-center gap-2 bg-[#202020] rounded-lg px-2 py-1 border border-white/5 transition-all">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={emp}
            onChange={e => setFilterEmpresa(prev => ({ ...prev, [colId]: e.target.value }))}
            className="bg-transparent text-xs font-medium text-foreground outline-none w-32 cursor-pointer"
          >
            <option value="">Todas las empresas</option>
            {Array.from(new Set(jobs.map(j => j.name))).filter(Boolean).sort().map(eName => (
              <option key={eName as string} value={eName as string}>{eName as string}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-[#202020] rounded-lg px-2 py-1 border border-white/5 transition-all">
          <select
            value={rol}
            onChange={e => setFilterRole(prev => ({ ...prev, [colId]: e.target.value }))}
            className="bg-transparent text-xs font-medium text-foreground outline-none w-28 cursor-pointer"
          >
            <option value="">Todos los roles</option>
            {Array.from(new Set(jobs.map(j => j.role))).filter(Boolean).sort().map(r => (
              <option key={r as string} value={r as string}>{r as string}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-[#202020] rounded-lg px-2 py-1 border border-white/5 transition-all">
          <select
            value={sort}
            onChange={e => setSortOrder(prev => ({ ...prev, [colId]: e.target.value as 'recent' | 'salary' | 'score' }))}
            className="bg-transparent text-xs font-medium text-foreground outline-none cursor-pointer"
          >
            <option value="recent">Más recientes</option>
            <option value="salary">Mayor salario</option>
            <option value="score">Mayor puntaje</option>
          </select>
        </div>

        {(emp || rol || sort !== 'recent' || chartMotivoFilter || chartInstanciaFilter) && (
          <button
            onClick={() => {
              setFilterEmpresa(prev => ({ ...prev, [colId]: '' }));
              setFilterRole(prev => ({ ...prev, [colId]: '' }));
              setSearchQuery(prev => ({ ...prev, [colId]: '' }));
              setSortOrder(prev => ({ ...prev, [colId]: 'recent' }));
              if (colId === 'col-rejected') {
                setChartMotivoFilter(null);
                setChartInstanciaFilter(null);
              }
            }}
            className="text-muted-foreground hover:text-white p-1 bg-[#202020] hover:bg-white/10 rounded-md transition-colors border border-white/5 cursor-pointer"
            title="Limpiar filtros"
          >
            <XCircle className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  };

  const getProcessedFinalizedJobs = (jobs: any[], colId: string, ignoreChartFilters = false) => {
    let result = [...jobs];
    const emp = filterEmpresa[colId];
    const rol = filterRole[colId];
    const query = searchQuery[colId]?.toLowerCase() || '';
    const sort = sortOrder[colId] || 'recent';

    if (emp) {
      result = result.filter(j => j.name === emp);
    }
    if (rol) {
      result = result.filter(j => j.role === rol);
    }
    if (query) {
      result = result.filter(j => 
        (j.name && j.name.toLowerCase().includes(query)) ||
        (j.role && j.role.toLowerCase().includes(query))
      );
    }

    // Apply chart filters (only applicable for col-rejected)
    if (colId === 'col-rejected' && !ignoreChartFilters) {
      if (chartMotivoFilter) {
        result = result.filter(j => j.categoriaCierre === chartMotivoFilter);
      }
      if (chartInstanciaFilter) {
        result = result.filter(j => j.instanciaCierre === chartInstanciaFilter);
      }
    }

    if (sort === 'salary') {
      result = sortJobsLocal(result);
    } else if (sort === 'score') {
      result.sort((a, b) => (b.score || 0) - (a.score || 0));
    } else {
      result.sort((a, b) => {
        const da = a.closedAt ? new Date(a.closedAt).getTime() : 0;
        const db = b.closedAt ? new Date(b.closedAt).getTime() : 0;
        return db - da;
      });
    }
    return result;
  };

  const sortJobsBySalary = (jobs: TrackerJob[]) => {
    return [...jobs].sort((a, b) => getAnnualSalary(b) - getAnnualSalary(a));
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);



  const deleteColumn = (id: string) => {
    setColumnOrder(prev => prev.filter(c => c !== id));
    setActiveDropdown(null);
  };

  const addNewColumn = () => {
    const colorKeys = Object.keys(COLUMN_COLORS);
    // Pick a color that's visually different - cycle through based on column count
    const usedCount = columnOrder.length;
    const colorKey = colorKeys[usedCount % colorKeys.length] as keyof typeof COLUMN_COLORS;
    const color = COLUMN_COLORS[colorKey];

    const newId = `col-${Date.now()}`;
    setColumns(prev => ({
      ...prev,
      [newId]: {
        id: newId,
        title: "Nueva columna",
        badge: color.badge,
        wrapperBg: color.wrapperBg,
        cardBg: color.cardBg,
        cardHover: color.cardHover,
        jobs: []
      }
    }));
    setColumnOrder(prev => [...prev, newId]);
  };

  const changeColumnColor = (id: string, colorDef: typeof COLUMN_COLORS[keyof typeof COLUMN_COLORS]) => {
    setColumns(prev => {
      const newColumns = {
        ...prev,
        [id]: {
          ...prev[id],
          badge: colorDef.badge,
          wrapperBg: colorDef.wrapperBg,
          cardBg: colorDef.cardBg,
          cardHover: colorDef.cardHover
        }
      };
      updateColumnsAction(newColumns).catch(console.error);
      return newColumns;
    });
    setActiveDropdown(null);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'column') {
      const newColumnOrder = Array.from(columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, result.draggableId);

      const newOrder = Array.from(columnOrder);
      const [reorderedItem] = newOrder.splice(source.index, 1);
      newOrder.splice(destination.index, 0, reorderedItem);
      setColumnOrder(newOrder);
      // Optional: save order to DB
      return;

    }

    if (source.droppableId === destination.droppableId) {
      const column = columns[source.droppableId];
      const copiedItems = [...column.jobs];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          jobs: sortJobsBySalary(copiedItems)
        }
      });
    } else {
      const sourceCol = columns[source.droppableId];
      const destCol = columns[destination.droppableId];

      const sourceItems = [...sourceCol.jobs];
      const destItems = [...destCol.jobs];

      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      removed.instanciaCierre = destCol.title;
      updateJobColumnAction(result.draggableId, destination.droppableId, destCol.title).catch(console.error);

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceCol,
          jobs: sortJobsBySalary(sourceItems)
        },
        [destination.droppableId]: {
          ...destCol,
          jobs: sortJobsBySalary(destItems)
        }
      });
    }
  };

  if (!isMounted) return null;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#101014]">
        <div className="flex justify-between items-center mb-6 shrink-0 relative">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <span>🗃️</span> Jobs Tracking
            </h1>
          </div>
          <div className="relative flex items-center gap-3">
            <button
              onClick={addNewColumn}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4 text-muted-foreground" />
              Nueva Columna
            </button>
            <button
              onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              Grupos
            </button>

            {isColumnDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsColumnDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#202020] border border-[#303030] rounded-xl shadow-2xl z-50 overflow-hidden text-[13px] text-muted-foreground">
                  <div className="max-h-[300px] overflow-y-auto py-1 custom-scrollbar">
                    {Object.keys(columns).map(colId => {
                      const col = columns[colId];
                      const isVisible = columnOrder.includes(colId);
                      return (
                        <div key={colId} className="flex items-center justify-between px-3 py-1.5 hover:bg-[#303030] transition-colors group">
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className={`px-2 py-0.5 rounded text-xs font-medium ${col.badge}`}>
                              {col.title}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (isVisible) {
                                setColumnOrder(prev => prev.filter(id => id !== colId));
                              } else {
                                setColumnOrder(prev => [...prev, colId]);
                              }
                            }}
                            className={`${isVisible ? 'text-foreground' : 'text-muted-foreground/50 hover:text-muted-foreground'} transition-colors`}
                          >
                            {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <Droppable droppableId="board" type="column" direction="horizontal">
            {(provided) => (
              <div
                className="flex min-w-max items-start"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {columnOrder.map((columnId, index) => {
                  const column = columns[columnId as keyof typeof columns];
                  if (!column) return null;
                  return (
                    <Draggable key={columnId} draggableId={columnId} index={index}>
                      {(providedCol, snapshotCol) => (
                        <div
                          className={`w-[275px] shrink-0 mr-4 flex flex-col max-h-[72vh] rounded-xl p-2 transition-colors ${column.wrapperBg} ${snapshotCol.isDragging ? 'ring-2 ring-primary shadow-2xl opacity-80' : ''}`}
                          ref={providedCol.innerRef}
                          {...providedCol.draggableProps}
                        >
                          {/* Column Header */}
                          <div className="flex items-center justify-between mb-3 px-1 pt-1 shrink-0 relative">
                            <div
                              className="flex items-center gap-2 cursor-grab active:cursor-grabbing flex-1"
                              {...providedCol.dragHandleProps}
                            >
                              {editingColumnId === columnId ? (
                                <input
                                  autoFocus
                                  className={`px-2 py-0.5 rounded text-sm font-medium ${column.badge.replace('text-white', 'text-white/90')} outline-none bg-black/20 focus:ring-1 focus:ring-white/50 w-full max-w-[150px]`}
                                  value={editingColumnTitle}
                                  onChange={(e) => setEditingColumnTitle(e.target.value)}
                                  onBlur={() => {
                                    if (editingColumnTitle.trim() !== "" && editingColumnTitle !== column.title) {
                                      setColumns(prev => {
                                        const newCols = { ...prev, [columnId]: { ...prev[columnId], title: editingColumnTitle.trim() } };
                                        updateColumnsAction(newCols).catch(console.error);
                                        return newCols;
                                      });
                                    }
                                    setEditingColumnId(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.currentTarget.blur();
                                    } else if (e.key === 'Escape') {
                                      setEditingColumnId(null);
                                    }
                                  }}
                                />
                              ) : (
                                <div
                                  className={`px-2 py-0.5 rounded text-sm font-medium ${column.badge} cursor-text hover:brightness-110 transition-all`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingColumnId(columnId);
                                    setEditingColumnTitle(column.title);
                                  }}
                                  title="Click para editar"
                                >
                                  {column.title}
                                </div>
                              )}
                              <span className="text-muted-foreground text-sm font-medium shrink-0">{column.jobs.length}</span>
                            </div>
                            <div className="relative flex items-center text-muted-foreground/60">
                              <button
                                type="button"
                                className="cursor-pointer hover:bg-white/10 p-1.5 rounded-md transition-colors flex items-center justify-center border-0 bg-transparent"
                                onClick={(e) => {
                                  if (activeDropdown === columnId) {
                                    setActiveDropdown(null);
                                  } else {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setDropdownRect({ top: rect.bottom, left: rect.right - 220 });
                                    setActiveDropdown(columnId);
                                  }
                                }}
                              >
                                <span className="text-xl leading-none pb-2">...</span>
                              </button>

                              {activeDropdown === columnId && isMounted && createPortal(
                                <>
                                  <div
                                    className="fixed inset-0 z-[100]"
                                    onClick={() => setActiveDropdown(null)}
                                  />
                                  <div 
                                    className="fixed w-[220px] bg-[#202020] border border-[#303030] rounded-xl shadow-2xl z-[101] overflow-hidden text-[13px] text-muted-foreground"
                                    style={{ top: dropdownRect?.top ? dropdownRect.top + 8 : 0, left: dropdownRect?.left }}
                                  >
                                    <div className="p-1">
                                      <button
                                        type="button"
                                        className="w-full text-left px-3 py-1.5 hover:bg-[#303030] rounded text-foreground transition-colors flex items-center gap-2"
                                        onClick={() => { deleteColumn(columnId); }}
                                      >
                                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                                        Ocultar columna
                                      </button>
                                      <button
                                        type="button"
                                        className="w-full text-left px-3 py-1.5 hover:bg-[#303030] rounded text-red-500 hover:text-red-400 font-medium transition-colors flex items-center gap-2"
                                        onClick={() => deleteColumn(columnId)}
                                      >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                        Eliminar columna
                                      </button>
                                    </div>
                                    <div className="border-t border-[#303030] my-1"></div>
                                    <div className="p-1 max-h-[400px] overflow-y-auto">
                                      {Object.entries(COLUMN_COLORS).map(([colorKey, colorDef]) => {
                                        const isSelected = column.badge === colorDef.badge;
                                        return (
                                          <button
                                            type="button"
                                            key={colorKey}
                                            className="w-full text-left px-3 py-1.5 hover:bg-[#303030] rounded text-foreground transition-colors flex items-center justify-between gap-2"
                                            onClick={() => changeColumnColor(columnId, colorDef)}
                                          >
                                            <div className="flex items-center gap-2">
                                              <div className={`w-3.5 h-3.5 rounded-sm ${colorDef.badge.split(' ')[0]}`}></div>
                                              {colorDef.name}
                                            </div>
                                            {isSelected && <Check className="w-3.5 h-3.5 text-foreground" />}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </>,
                                document.body
                              )}
                            </div>
                          </div>

                          <Droppable droppableId={columnId}>
                            {(providedDrop, snapshotDrop) => (
                              <div
                                {...providedDrop.droppableProps}
                                ref={providedDrop.innerRef}
                                className={`w-full overflow-y-auto custom-scrollbar-v flex-1 min-h-[60px] rounded-lg ${snapshotDrop.isDraggingOver ? 'ring-2 ring-white/20' : ''}`}
                              >
                                {/* Items Container */}
                                <div className="flex flex-col min-h-[10px]">
                                    {column.jobs.map((job, idx) => (
                                      <Draggable key={job.id} draggableId={job.id} index={idx}>
                                        {(providedJob, snapshotJob) => renderJobCard(job, columnId, column, providedJob, snapshotJob)}
                                      </Draggable>
                                    ))}
                                    {providedDrop.placeholder}

                                    {/* Add new button */}
                                    {column.title === 'People / Screening' && (
                                      <button
                                        className="flex items-center gap-2 text-sm p-2 rounded-lg transition-colors w-full mt-1 text-muted-foreground/60 hover:bg-white/5 hover:text-muted-foreground"
                                        onClick={() => {
                                          const newJobId = `job-${Date.now()}`;
                                          setColumns(prev => ({
                                            ...prev,
                                            [columnId]: {
                                              ...prev[columnId],
                                              jobs: sortJobsBySalary([...prev[columnId].jobs, { id: newJobId, name: "Nuevo proceso" } as TrackerJob])
                                            }
                                          }));
                                          setSelectedJobId(newJobId);
                                          setSelectedColumnId(columnId);
                                        }}
                                      >
                                        <Plus className="w-4 h-4" />
                                        Nuevo proceso
                                      </button>
                                    )}
                                  </div>
                              </div>
                            )}
                          </Droppable>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}

              </div>
            )}
          </Droppable>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
          .custom-scrollbar::-webkit-scrollbar {
            height: 12px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.02);
            border-radius: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.12);
            border-radius: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
          }
          .custom-scrollbar-v::-webkit-scrollbar {
            width: 5px;
          }
          .custom-scrollbar-v::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar-v::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.08);
            border-radius: 3px;
          }
          .custom-scrollbar-v::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.15);
          }
        `}} />

        {/* Job Panel rendering */}
        <AnimatePresence>
          {selectedJobId && selectedColumnId && columns[selectedColumnId] && (
            <JobPanel
              currentUser={currentUser}
              job={columns[selectedColumnId].jobs.find(j => j.id === selectedJobId)!}
              columnId={selectedColumnId}
              columns={Object.values(columns).map(c => ({ id: c.id, title: c.title, badge: c.badge, cardBg: c.cardBg, wrapperBg: c.wrapperBg }))}
              config={config}
              onUpdateConfig={(newConf) => {
                setConfig(newConf);
                updateConfigAction(newConf).catch(console.error);
              }}
              onClose={() => {
                setSelectedJobId(null);
                setSelectedColumnId(null);
              }}
              onUpdate={(updatedJob, targetColumnId) => {
                setColumns(prev => {
                  const newColumns = { ...prev };

                  if (targetColumnId && targetColumnId !== selectedColumnId) {
                    // Move to new column
                    const sourceCol = newColumns[selectedColumnId];
                    const destCol = newColumns[targetColumnId];

                    sourceCol.jobs = sourceCol.jobs.filter(j => j.id !== selectedJobId);
                    destCol.jobs = sortJobsBySalary([...destCol.jobs, updatedJob]);

                    setSelectedColumnId(targetColumnId);
                  } else {
                    // Update in same column
                    const column = newColumns[selectedColumnId];
                    column.jobs = sortJobsBySalary(column.jobs.map(j => j.id === selectedJobId ? updatedJob : j));
                  }

                  return newColumns;
                });

                updateJobAction(selectedJobId, targetColumnId || selectedColumnId, updatedJob).catch(console.error);
              }}
            />
          )}
        </AnimatePresence>

        {/* Procesos Finalizados Section */}
        {(columns['col-accepted']?.jobs?.length > 0 || columns['col-rejected']?.jobs?.length > 0) && (
          <div className="mt-12 mb-8 w-full max-w-full">

            <h2 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-3 mb-6">
              <span>🏁</span> Procesos Finalizados
            </h2>

            <div className="flex flex-col gap-6 w-full">
              {/* Rechazadas (No Continuamos) */}
              {columns['col-rejected']?.jobs?.length > 0 && (() => {
                const processedJobs = getProcessedFinalizedJobs(columns['col-rejected'].jobs, 'col-rejected');
                const chartBaseJobs = getProcessedFinalizedJobs(columns['col-rejected'].jobs, 'col-rejected', true);

                const motivosMap = new Map();
                chartBaseJobs.forEach(job => {
                  if (job.categoriaCierre) {
                    motivosMap.set(job.categoriaCierre, (motivosMap.get(job.categoriaCierre) || 0) + 1);
                  }
                });
                const motivosData = Array.from(motivosMap.entries()).map(([name, value]) => {
                  const opt = config?.options?.categoriaCierre?.find((o: any) => o.label === name);
                  return { name, value, color: extractHexColor(opt?.color) };
                }).sort((a, b) => b.value - a.value);

                const instanciaMap = new Map();
                chartBaseJobs.forEach(job => {
                  if (job.instanciaCierre) {
                    instanciaMap.set(job.instanciaCierre, (instanciaMap.get(job.instanciaCierre) || 0) + 1);
                  }
                });
                const instanciaData = Array.from(instanciaMap.entries()).map(([name, value]) => {
                  const opt = config?.options?.instanciaCierre?.find((o: any) => o.label === name);
                  return { name, value, color: extractHexColor(opt?.color) };
                });

                return (
                  <div className="bg-[#1a1a1f] rounded-2xl border border-white/5 p-5 w-full">
                    {/* Título arriba a la izquierda */}
                    <div className="mb-6">
                      <div className="inline-block px-2.5 py-1 rounded-md text-[13px] font-bold bg-[#d44c47] text-white shadow-sm tracking-wide uppercase">
                        No Continuamos
                      </div>
                    </div>

                    {/* Gráficos */}
                    {processedJobs.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-black/20 rounded-xl border border-white/5 p-4 flex flex-col items-center h-[380px]">
                          <h4 className="text-muted-foreground text-sm font-semibold mb-4 text-center">Causas de Cierre</h4>
                          {motivosData.length > 0 ? (() => {
                            const totalMotivos = motivosData.reduce((acc, curr) => acc + curr.value, 0);
                            return (
                              <div className="flex-1 flex flex-row items-center w-full">
                                {/* Leyenda (Izquierda) */}
                                <div className="w-1/3 flex flex-col gap-3 justify-center pl-4 z-10">
                                  {motivosData.map((entry, index) => (
                                    <div 
                                      key={`legend-${index}`} 
                                      className={`flex items-center gap-2.5 cursor-pointer transition-opacity duration-300 ${chartMotivoFilter && chartMotivoFilter !== entry.name ? 'opacity-30' : 'hover:opacity-80'} ${activeMotivoIndex === index ? 'opacity-100 scale-105' : ''}`}
                                      onClick={() => setChartMotivoFilter(chartMotivoFilter === entry.name ? null : entry.name)}
                                      onMouseEnter={() => setActiveMotivoIndex(index)}
                                      onMouseLeave={() => setActiveMotivoIndex(-1)}
                                    >
                                      <div 
                                        className="w-5 h-3 rounded-[3px] border border-white/20 transition-all duration-300" 
                                        style={{ backgroundColor: entry.color, boxShadow: activeMotivoIndex === index ? `0 0 10px ${entry.color}80` : `0 0 0px ${entry.color}00` }} 
                                      />
                                      <span className="text-xs text-zinc-300 font-medium leading-tight select-none">{entry.name}</span>
                                    </div>
                                  ))}
                                </div>

                                {/* Gráfico Donut (Derecha) */}
                                <div className="w-2/3 h-[300px] relative flex justify-center items-center">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <PieChart style={{ filter: "drop-shadow(0px 8px 12px rgba(0,0,0,0.85)) saturate(1.8) brightness(1.2)", cursor: "pointer" }}>
                                      <Pie
                                        data={motivosData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={100}
                                        outerRadius={138}
                                        dataKey="value"
                                        stroke="none"
                                        {...({ activeIndex: activeMotivoIndex !== -1 ? activeMotivoIndex : undefined } as any)}
                                        activeShape={(props: any) => {
                                          const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                                          return (
                                            <Sector
                                              cx={cx}
                                              cy={cy}
                                              innerRadius={innerRadius - 5}
                                              outerRadius={outerRadius + 10}
                                              startAngle={startAngle}
                                              endAngle={endAngle}
                                              fill={fill}
                                              style={{ transition: 'all 0.3s ease' }}
                                            />
                                          );
                                        }}
                                        onClick={(data: any) => setChartMotivoFilter(chartMotivoFilter === data.name ? null : (data.name || null))}
                                        onMouseEnter={(_: any, index: number) => setActiveMotivoIndex(index)}
                                        onMouseLeave={() => setActiveMotivoIndex(-1)}
                                      >
                                        {motivosData.map((entry, index) => (
                                          <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            style={{ 
                                              cursor: 'pointer',
                                              opacity: chartMotivoFilter && chartMotivoFilter !== entry.name ? 0.2 : 0.9,
                                              transition: 'all 0.3s ease',
                                            }}
                                          />
                                        ))}
                                      </Pie>
                                    </PieChart>
                                  </ResponsiveContainer>

                                  {/* Centro del Donut (Hover State) */}
                                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    {activeMotivoIndex !== -1 ? (
                                      <div 
                                        className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-200"
                                        style={{ filter: "drop-shadow(0px 2px 10px rgba(0,0,0,0.5)) saturate(1.8) brightness(1.2)" }}
                                      >
                                        <span className="text-[10px] font-bold uppercase tracking-widest mb-1 text-center px-2 max-w-[150px] line-clamp-2 leading-tight" style={{ color: motivosData[activeMotivoIndex].color, textShadow: "0px 1px 2px rgba(0,0,0,0.8)" }}>
                                          {motivosData[activeMotivoIndex].name}
                                        </span>
                                        <div className="flex items-baseline gap-1.5" style={{ color: motivosData[activeMotivoIndex].color, textShadow: "0px 2px 4px rgba(0,0,0,0.8)" }}>
                                          <span className="text-4xl font-black">{motivosData[activeMotivoIndex].value}</span>
                                          <span className="text-sm font-bold opacity-80">
                                            ({((motivosData[activeMotivoIndex].value / totalMotivos) * 100).toFixed(0)}%)
                                          </span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center justify-center text-zinc-200" style={{ filter: "drop-shadow(0px 2px 10px rgba(0,0,0,0.5)) saturate(1.8) brightness(1.2)" }}>
                                        <span className="text-xs font-medium uppercase tracking-widest mb-1">Total</span>
                                        <span className="text-3xl font-black">{totalMotivos}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })() : (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs text-center">
                              No hay motivos de cierre cargados.
                            </div>
                          )}
                        </div>

                        <div className="bg-black/20 rounded-xl border border-white/5 p-4 flex flex-col items-center h-[380px]">
                          <h4 className="text-muted-foreground text-sm font-semibold mb-2">Última Instancia Alcanzada</h4>
                          {instanciaData.length > 0 ? (
                            <div className="w-full h-full flex-1 relative">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={instanciaData} margin={{ top: 20, right: 10, left: -25, bottom: 0 }} style={{ filter: "drop-shadow(0px 8px 12px rgba(0,0,0,0.8)) saturate(1.8) brightness(1.2)" }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                  <XAxis
                                    dataKey="name"
                                    tick={{ fill: '#71717a', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                  />
                                  <YAxis
                                    tick={{ fill: '#71717a', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                  />
                                  <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: '#1f1f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value: any) => [value, 'Cantidad']}
                                  />
                                  <Bar
                                    dataKey="value"
                                    radius={[6, 6, 0, 0]}
                                    onClick={(data) => setChartInstanciaFilter(chartInstanciaFilter === data.name ? null : (data.name || null))}
                                    activeBar={{ filter: "brightness(1.3)", stroke: "rgba(255,255,255,0.3)", strokeWidth: 2 }}
                                  >
                                    {instanciaData.map((entry, index) => (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        style={{ cursor: 'pointer', transition: 'all 0.2s ease', opacity: chartInstanciaFilter && chartInstanciaFilter !== entry.name ? 0.3 : 1 }}
                                      />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          ) : (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs text-center">
                              No hay instancias de cierre cargadas.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Filtros y contador bajan arriba de las tarjetas */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground font-medium">Procesos:</span>
                        <span className="bg-red-500/10 text-red-500 text-xs font-bold px-2.5 py-1 rounded-full">
                          {processedJobs.length}
                        </span>
                        <div className="ml-2 relative">
                          <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input 
                            type="text" 
                            placeholder="Buscar empresa o rol..." 
                            value={searchQuery['col-rejected'] || ''}
                            onChange={e => setSearchQuery(prev => ({ ...prev, 'col-rejected': e.target.value }))}
                            className="bg-[#202020] text-xs text-white placeholder:text-muted-foreground border border-white/5 rounded-lg pl-7 pr-3 py-1.5 focus:outline-none focus:border-white/20 w-48 transition-all"
                          />
                        </div>
                        {(chartMotivoFilter || chartInstanciaFilter) && (
                          <button
                            onClick={() => {
                              setChartMotivoFilter(null);
                              setChartInstanciaFilter(null);
                            }}
                            className="ml-2 px-3 py-1 bg-white/5 hover:bg-white/10 text-xs font-medium text-white border border-white/10 rounded-md transition-colors shadow-sm"
                          >
                            Restaurar Filtros
                          </button>
                        )}
                      </div>
                      {renderFilters('col-rejected')}
                    </div>

                    <div className="w-full">
                      <div className="flex flex-wrap justify-center gap-4">
                        <AnimatePresence mode="popLayout">
                          {processedJobs.map(job => (
                            <motion.div
                              key={job.id}
                              layout
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.2 }}
                            >
                              {renderJobCard(job, 'col-rejected', columns['col-rejected'], undefined, undefined, true)}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Aceptadas */}
              {columns['col-accepted']?.jobs?.length > 0 && (
                <div className="bg-[#1a1a1f] rounded-2xl border border-white/5 p-5 w-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="px-2.5 py-1 rounded-md text-[13px] font-bold bg-[#448361] text-white shadow-sm tracking-wide uppercase">
                        Propuestas Aceptadas
                      </div>
                      <span className="bg-green-500/10 text-green-500 text-xs font-bold px-2.5 py-1 rounded-full">
                        {columns['col-accepted']?.jobs?.length}
                      </span>
                    </div>
                    {renderFilters('col-accepted')}
                  </div>
                  <div className="w-full">
                    <div className="flex flex-wrap justify-center gap-4">
                      <AnimatePresence mode="popLayout">
                        {getProcessedFinalizedJobs(columns['col-accepted'].jobs, 'col-accepted').map(job => (
                          <motion.div
                            key={job.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            {renderJobCard(job, 'col-accepted', columns['col-accepted'], undefined, undefined, true)}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>


      {/* Restore Modal */}
      {jobToRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setJobToRestore(null)}>
          <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-6 w-[90%] max-w-[400px] shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 text-foreground">Volver a Kanban</h3>
            <p className="text-muted-foreground mb-4">Selecciona a qué columna deseas devolver esta tarjeta:</p>

            <select
              className="w-full bg-[#202020] border border-white/5 rounded-lg px-3 py-2 text-foreground outline-none mb-6 focus:border-[#444] transition-colors"
              value={restoreTargetCol}
              onChange={e => setRestoreTargetCol(e.target.value)}
            >
              <option value="" disabled>Selecciona una columna</option>
              {columnOrder.map(cId => (
                <option key={cId} value={cId}>{columns[cId]?.title}</option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setJobToRestore(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={!restoreTargetCol}
                onClick={() => {
                  if (!restoreTargetCol || !jobToRestore) return;
                  const { jobId, currentColumnId } = jobToRestore;

                  // Optimistic UI update
                  setColumns(prev => {
                    const newCols = { ...prev };
                    const sourceCol = newCols[currentColumnId];
                    const targetCol = newCols[restoreTargetCol];

                    const job = sourceCol.jobs.find(j => j.id === jobId);
                    if (job) {
                      sourceCol.jobs = sourceCol.jobs.filter(j => j.id !== jobId);
                      job.closedAt = null;
                      targetCol.jobs.push(job);
                      targetCol.jobs = sortJobsBySalary(targetCol.jobs);
                    }
                    return newCols;
                  });

                  updateJobColumnAction(jobId, restoreTargetCol).catch(console.error);

                  setJobToRestore(null);
                  setRestoreTargetCol("");
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {jobToDelete && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-[#202020] border border-[#303030] p-6 rounded-xl shadow-2xl max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4 text-foreground">Confirmar eliminación</h3>
            <p className="text-muted-foreground mb-6">¿Estás seguro que quieres eliminar esta tarjeta? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setJobToDelete(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!jobToDelete) return;

                  // Update UI first
                  setColumns(prev => {
                    const newCols = { ...prev };
                    newCols[jobToDelete.columnId].jobs = newCols[jobToDelete.columnId].jobs.filter(j => j.id !== jobToDelete.jobId);
                    return newCols;
                  });

                  // Delete from DB
                  deleteJobAction(jobToDelete.jobId).catch(console.error);
                  setJobToDelete(null);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Finalización */}
      {jobToFinalize && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-[#202020] border border-[#303030] p-6 rounded-xl shadow-2xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-2 text-foreground">Finalizar proceso</h3>
            <p className="text-sm text-muted-foreground mb-6">Selecciona el resultado final para esta posición.</p>

            <div className="space-y-4 mb-6">
              <div className="bg-[#1a1a1f] p-4 rounded-lg border border-white/5">
                <p className="text-xs text-muted-foreground mb-1">Instancia de cierre detectada:</p>
                <p className="font-medium text-foreground">{jobToFinalize.currentColumnTitle}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Categoría de cierre (Obligatorio para "No continuamos")</label>
                <select
                  className="w-full bg-[#141414] border border-[#303030] rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                  value={finalizeCategory}
                  onChange={(e) => setFinalizeCategory(e.target.value)}
                >
                  <option value="">Seleccionar motivo...</option>
                  {config?.options?.categoriaCierre?.map((opt: any, i: number) => (
                    <option key={i} value={opt.label}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {jobToFinalize.currentColumnTitle === "C-Level / Culture" && (
                <div className="mt-4 p-4 border border-[#303030] bg-[#1a1a1f] rounded-lg">
                  <label className="block text-sm font-medium text-muted-foreground mb-3">¿Te fue bien en este paso de C-Level/Culture?</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer hover:text-primary transition-colors">
                      <input 
                        type="radio" 
                        name="clevelSuccess" 
                        checked={finalizeCLevelSuccess === true} 
                        onChange={() => setFinalizeCLevelSuccess(true)}
                        className="accent-primary"
                      />
                      Sí
                    </label>
                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer hover:text-primary transition-colors">
                      <input 
                        type="radio" 
                        name="clevelSuccess" 
                        checked={finalizeCLevelSuccess === false} 
                        onChange={() => setFinalizeCLevelSuccess(false)}
                        className="accent-primary"
                      />
                      No
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2 gap-2">
              <button
                onClick={() => setJobToFinalize(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors mr-auto"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  if (!finalizeCategory) {
                    alert("Debes seleccionar una categoría de cierre para descartar la tarjeta.");
                    return;
                  }

                  if (jobToFinalize.currentColumnTitle === "C-Level / Culture" && finalizeCLevelSuccess === null) {
                    alert("Debes indicar si te fue bien en el paso de C-Level / Culture.");
                    return;
                  }

                  const targetJob = columns[jobToFinalize.columnId].jobs.find(j => j.id === jobToFinalize.jobId);
                  if (!targetJob) return;

                  let finalInstanciaCierre = jobToFinalize.currentColumnTitle;
                  if (jobToFinalize.currentColumnTitle === "C-Level / Culture" && finalizeCLevelSuccess === true) {
                    finalInstanciaCierre = "Proceso completo";
                  }

                  const updatedJob = {
                    ...targetJob,
                    instanciaCierre: finalInstanciaCierre,
                    categoriaCierre: finalizeCategory
                  };

                  setColumns(prev => {
                    const newCols = { ...prev };
                    newCols[jobToFinalize.columnId].jobs = newCols[jobToFinalize.columnId].jobs.filter(j => j.id !== jobToFinalize.jobId);
                    if (!newCols['col-rejected']) newCols['col-rejected'] = { id: 'col-rejected', title: 'No Continuamos', jobs: [], badge: 'bg-red-500/20 text-red-500', wrapperBg: 'bg-[#2d1d1d]', cardBg: 'bg-[#422828]', cardHover: 'hover:bg-[#4f3030]' };
                    newCols['col-rejected'].jobs = sortJobsBySalary([...newCols['col-rejected'].jobs, updatedJob]);
                    return newCols;
                  });

                  updateJobAction(jobToFinalize.jobId, 'col-rejected', updatedJob).catch(console.error);
                  setJobToFinalize(null);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
              >
                No continuamos
              </button>

              <button
                onClick={() => {
                  const targetJob = columns[jobToFinalize.columnId].jobs.find(j => j.id === jobToFinalize.jobId);
                  if (!targetJob) return;

                  const updatedJob = {
                    ...targetJob,
                    instanciaCierre: jobToFinalize.currentColumnTitle,
                    categoriaCierre: finalizeCategory || "Aceptada"
                  };

                  setColumns(prev => {
                    const newCols = { ...prev };
                    newCols[jobToFinalize.columnId].jobs = newCols[jobToFinalize.columnId].jobs.filter(j => j.id !== jobToFinalize.jobId);
                    if (!newCols['col-accepted']) newCols['col-accepted'] = { id: 'col-accepted', title: 'Aceptadas', jobs: [], badge: 'bg-green-500/20 text-green-500', wrapperBg: 'bg-[#1e2621]', cardBg: 'bg-[#283a2d]', cardHover: 'hover:bg-[#304536]' };
                    newCols['col-accepted'].jobs = sortJobsBySalary([...newCols['col-accepted'].jobs, updatedJob]);
                    return newCols;
                  });

                  updateJobAction(jobToFinalize.jobId, 'col-accepted', updatedJob).catch(console.error);
                  setJobToFinalize(null);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-green-500/20 text-green-500 hover:bg-green-500/30 transition-colors"
              >
                Propuesta Aceptada
              </button>
            </div>
          </div>
        </div>
      )}
    </DragDropContext>
  );
}
