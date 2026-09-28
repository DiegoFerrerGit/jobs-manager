"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, Eye, EyeOff, GripVertical, Trash2 } from "lucide-react";
import { TrackerJob, TrackerConfig, DEFAULT_SELECT_OPTIONS } from "./types";
import JobPanel from "./components/JobPanel";

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

export default function TrackerClient() {
  const [columns, setColumns] = useState<Record<string, ColumnData>>(initialColumns);
  const [columnOrder, setColumnOrder] = useState(Object.keys(initialColumns));
  const [config, setConfig] = useState<TrackerConfig>({ options: DEFAULT_SELECT_OPTIONS });
  const [isMounted, setIsMounted] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);

  // Panel state
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  
  // Delete modal state
  const [jobToDelete, setJobToDelete] = useState<{jobId: string, columnId: string} | null>(null);

  const getAnnualSalary = (job: TrackerJob) => {
    return job.salarioAnual || (job.salarioMensual ? job.salarioMensual * 12 : 0);
  };

  const sortJobsBySalary = (jobs: TrackerJob[]) => {
    return [...jobs].sort((a, b) => getAnnualSalary(b) - getAnnualSalary(a));
  };

  useEffect(() => {
    // Hydrate from localStorage
    const savedColumns = localStorage.getItem("jobs-tracker-columns");
    const savedOrder = localStorage.getItem("jobs-tracker-column-order");
    const savedConfig = localStorage.getItem("jobs-tracker-config");
    
    if (savedColumns) {
      try { 
        const parsedColumns = JSON.parse(savedColumns);
        const OLD_TO_NEW_COLORS: Record<string, string> = {
          "bg-[#454545] text-[#cccccc]": "bg-[#787774] text-white",
          "bg-[#67442f] text-[#e2c8b5]": "bg-[#9f6b53] text-white",
          "bg-[#673c1d] text-[#e6bc9c]": "bg-[#d9730d] text-white",
          "bg-[#5f4f22] text-[#e5d4a1]": "bg-[#cb912f] text-white",
          "bg-[#2c4a35] text-[#b4deb8]": "bg-[#448361] text-white",
          "bg-[#2b4b66] text-[#b3d3ed]": "bg-[#337ea9] text-white",
          "bg-[#443560] text-[#c9b7e3]": "bg-[#9065b0] text-white",
          "bg-[#672b49] text-[#e6c1d3]": "bg-[#c14c8a] text-white",
          "bg-[#602e2e] text-[#e8b5b5]": "bg-[#d44c47] text-white",
        };
        // Migration: migrate old data if they have 'company' or 'salary' instead of new schema
        Object.keys(parsedColumns).forEach(colKey => {
          if (OLD_TO_NEW_COLORS[parsedColumns[colKey].badge]) {
            parsedColumns[colKey].badge = OLD_TO_NEW_COLORS[parsedColumns[colKey].badge];
          }
          parsedColumns[colKey].jobs = sortJobsBySalary(parsedColumns[colKey].jobs.map((j: any) => {
            const newJob = { ...j };
            if (j.company) {
              newJob.name = j.company;
              delete newJob.company;
            }
            if (j.salary) {
              const num = parseInt(j.salary.replace(/[^0-9]/g, ''));
              if (!isNaN(num)) newJob.salarioAnual = num;
              delete newJob.salary;
            }
            if (j.equity) delete newJob.equity;
            if (j.locationColor) delete newJob.locationColor;
            if (j.roleColor) delete newJob.roleColor;
            return newJob;
          }));
        });
        setColumns(parsedColumns);
      } catch (e) { console.error(e); }
    }
    if (savedOrder) {
      try { setColumnOrder(JSON.parse(savedOrder)); } catch (e) { console.error(e); }
    }
    if (savedConfig) {
      try { setConfig(JSON.parse(savedConfig)); } catch (e) { console.error(e); }
    }
    
    setIsMounted(true);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("jobs-tracker-columns", JSON.stringify(columns));
    }
  }, [columns, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("jobs-tracker-column-order", JSON.stringify(columnOrder));
    }
  }, [columnOrder, isMounted]);

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
    setColumns(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        badge: colorDef.badge,
        wrapperBg: colorDef.wrapperBg,
        cardBg: colorDef.cardBg,
        cardHover: colorDef.cardHover
      }
    }));
    setActiveDropdown(null);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'column') {
      const newColumnOrder = Array.from(columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, result.draggableId);
      setColumnOrder(newColumnOrder);
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
          <div className="relative">
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
                className="flex h-full min-w-max items-start"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {columnOrder.map((columnId, index) => {
                  const column = columns[columnId as keyof typeof columns];
                  return (
                    <Draggable key={columnId} draggableId={columnId} index={index}>
                      {(providedCol, snapshotCol) => (
                        <div 
                          className={`w-[280px] shrink-0 mr-4 h-[85vh] ${snapshotCol.isDragging ? 'opacity-80' : ''}`}
                          ref={providedCol.innerRef}
                          {...providedCol.draggableProps}
                        >
                          <Droppable droppableId={columnId}>
                            {(providedDrop, snapshotDrop) => (
                              <div
                                {...providedDrop.droppableProps}
                                ref={providedDrop.innerRef}
                                className="w-full h-full overflow-y-auto custom-scrollbar-v"
                              >
                                <div className={`flex flex-col rounded-xl p-2 h-fit min-h-[60px] transition-colors ${column.wrapperBg} ${snapshotDrop.isDraggingOver ? 'ring-2 ring-white/20' : ''} ${snapshotCol.isDragging ? 'ring-2 ring-primary shadow-2xl' : ''}`}>
                                  {/* Column Header */}
                                  <div className="flex items-center justify-between mb-3 px-1 pt-1">
                                    <div 
                                      className="flex items-center gap-2 cursor-grab active:cursor-grabbing flex-1"
                                      {...providedCol.dragHandleProps}
                                    >
                                      <div className={`px-2 py-0.5 rounded text-sm font-medium ${column.badge}`}>
                                        {column.title}
                                      </div>
                                      <span className="text-muted-foreground text-sm font-medium">{column.jobs.length}</span>
                                    </div>
                                    <div className="relative flex items-center text-muted-foreground/60">
                                      <button 
                                        type="button"
                                        className="cursor-pointer hover:bg-white/10 p-1.5 rounded-md transition-colors flex items-center justify-center border-0 bg-transparent"
                                        onClick={() => setActiveDropdown(prev => prev === columnId ? null : columnId)}
                                      >
                                        <span className="text-xl leading-none pb-2">...</span>
                                      </button>
                                      
                                      {activeDropdown === columnId && (
                                        <>
                                          <div 
                                            className="fixed inset-0 z-40" 
                                            onClick={() => setActiveDropdown(null)}
                                          />
                                          <div className="absolute right-0 top-8 w-[220px] bg-[#202020] border border-[#303030] rounded-xl shadow-2xl z-50 overflow-hidden text-[13px] text-muted-foreground">
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
                                            <div className="p-1 max-h-[280px] overflow-y-auto">
                                              {Object.entries(COLUMN_COLORS).map(([colorKey, colorDef]) => (
                                                <button 
                                                  type="button"
                                                  key={colorKey}
                                                  className="w-full text-left px-3 py-1.5 hover:bg-[#303030] rounded text-foreground transition-colors flex items-center gap-2"
                                                  onClick={() => changeColumnColor(columnId, colorDef)}
                                                >
                                                  <div className={`w-3.5 h-3.5 rounded-sm ${colorDef.badge.split(' ')[0]}`}></div>
                                                  {colorDef.name}
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {/* Items Container */}
                                  <div className="flex flex-col min-h-[10px]">
                                    {column.jobs.map((job, idx) => (
                                      <Draggable key={job.id} draggableId={job.id} index={idx}>
                                        {(providedJob, snapshotJob) => (
                                          <div
                                            ref={providedJob.innerRef}
                                            {...providedJob.draggableProps}
                                            {...providedJob.dragHandleProps}
                                            className={`mb-3 rounded-xl p-3 shadow-sm cursor-pointer group relative transition-colors flex flex-col gap-3 ${column.cardBg} ${column.cardHover} border border-white/5 ${snapshotJob.isDragging ? "ring-2 ring-primary shadow-lg" : ""} ${selectedJobId === job.id ? "ring-2 ring-inset ring-blue-500 bg-white/5" : ""}`}
                                            style={{ ...providedJob.draggableProps.style }}
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
                                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-[#202020] hover:bg-destructive/80 text-muted-foreground hover:text-white rounded-md transition-all"
                                              title="Eliminar tarjeta"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                            
                                            <h3 className="font-bold text-[15px] text-foreground mb-2.5">{job.name}</h3>
              
                                            <div className="flex flex-col gap-1.5 items-start">
                                              {job.location && (
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium leading-tight ${config.options.location.find(o => o.label === job.location)?.color || 'bg-white/10 text-white/80'}`}>
                                                  {job.location}
                                                </span>
                                              )}
                                              {job.role && (
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium leading-tight ${config.options.role.find(o => o.label === job.role)?.color || 'bg-white/10 text-white/80'}`}>
                                                  {job.role}
                                                </span>
                                              )}
                                            </div>
              
                                            {(job.salarioMensual || job.salarioAnual) && (
                                              <div className="mt-2 flex flex-col gap-1.5 text-[12px] text-foreground font-semibold">
                                                {job.salarioAnual && <span>{job.monedaSalario === 'ARS' ? '$ ' : 'US$ '}{job.salarioAnual.toLocaleString(job.monedaSalario === 'ARS' ? 'es-AR' : 'en-US')}</span>}
                                                {job.salarioMensual && <span>{job.monedaSalario === 'ARS' ? '$ ' : 'US$ '}{job.salarioMensual.toLocaleString(job.monedaSalario === 'ARS' ? 'es-AR' : 'en-US')}</span>}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {providedDrop.placeholder}
              
                                    {/* Add new button */}
                                    {columnId === 'people' && (
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
                              </div>
                            )}
                          </Droppable>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}

                {/* Add new column button */}
                <div className="w-[280px] shrink-0 p-2">
                  <button 
                    type="button"
                    onClick={addNewColumn}
                    className="flex items-center gap-2 text-sm p-3 rounded-xl transition-colors w-full text-muted-foreground hover:bg-white/5 hover:text-foreground border border-dashed border-white/10 hover:border-white/20 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar columna
                  </button>
                </div>
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
        {selectedJobId && selectedColumnId && columns[selectedColumnId] && (
          <JobPanel 
            job={columns[selectedColumnId].jobs.find(j => j.id === selectedJobId)!}
            columnId={selectedColumnId}
            columns={Object.values(columns).map(c => ({ id: c.id, title: c.title, badge: c.badge, cardBg: c.cardBg, wrapperBg: c.wrapperBg }))}
            config={config}
            onUpdateConfig={setConfig}
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
            }}
          />
        )}

        {/* Metrics Section */}
        <div className="mt-10 mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <span>📊</span> Metrics
          </h2>
          <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center text-muted-foreground/50">
            <p className="text-sm">Próximamente: gráficos y estadísticas de tus procesos</p>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}
