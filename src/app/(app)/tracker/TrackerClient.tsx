"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, Eye, EyeOff, GripVertical, Trash2, CheckCircle2 } from "lucide-react";
import { TrackerJob, TrackerConfig, DEFAULT_SELECT_OPTIONS } from "./types";
import JobPanel from "./components/JobPanel";
import { updateJobAction, updateJobColumnAction, deleteJobAction, updateColumnsAction, updateConfigAction } from "./actions";

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

export default function TrackerClient({ initialData }: { initialData: any }) {
  
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
    initialColumns['col-accepted'] = { id: 'col-accepted', title: 'Aceptadas', jobs: sortJobsLocal(acceptedJobs), badge: 'bg-green-500/20 text-green-500', wrapperBg: '', cardBg: '', cardHover: '' };
  } else {
    initialColumns['col-accepted'].jobs.push(...acceptedJobs);
    initialColumns['col-accepted'].jobs = sortJobsLocal(initialColumns['col-accepted'].jobs);
  }

  if (!initialColumns['col-rejected']) {
    initialColumns['col-rejected'] = { id: 'col-rejected', title: 'No Continuamos', jobs: sortJobsLocal(rejectedJobs), badge: 'bg-red-500/20 text-red-500', wrapperBg: '', cardBg: '', cardHover: '' };
  } else {
    initialColumns['col-rejected'].jobs.push(...rejectedJobs);
    initialColumns['col-rejected'].jobs = sortJobsLocal(initialColumns['col-rejected'].jobs);
  }
  // -- END MIGRATION LOGIC --

  const [columns, setColumns] = useState<Record<string, ColumnData>>(initialColumns);
  const [columnOrder, setColumnOrder] = useState<string[]>(initialOrder);

  const [config, setConfig] = useState<TrackerConfig>(initialData.config || { options: DEFAULT_SELECT_OPTIONS });
  const [isMounted, setIsMounted] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);

  // Panel state
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  
  // Delete modal state
  const [jobToDelete, setJobToDelete] = useState<{jobId: string, columnId: string} | null>(null);
  const [jobToFinalize, setJobToFinalize] = useState<{jobId: string, columnId: string, currentColumnTitle: string} | null>(null);
  const [finalizeCategory, setFinalizeCategory] = useState<string>("");

  const getAnnualSalary = (job: TrackerJob) => {
    return job.salarioAnual || (job.salarioMensual ? job.salarioMensual * 12 : 0);
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
              if (!column) return null;
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
                                            <button 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setJobToFinalize({ jobId: job.id, columnId, currentColumnTitle: column.title });
                                                setFinalizeCategory("");
                                              }}
                                              className="absolute top-2 right-9 opacity-0 group-hover:opacity-100 p-1.5 bg-[#202020] hover:bg-green-500/20 text-muted-foreground hover:text-green-500 rounded-md transition-all"
                                              title="Finalizar proceso"
                                            >
                                              <CheckCircle2 className="w-3.5 h-3.5" />
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
              
              updateJobAction(selectedJobId, targetColumnId || selectedColumnId, updatedJob).catch(console.error);
            }}
          />
        )}

        {/* Procesos Finalizados Section */}
        <div className="mt-12 mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-3 mb-6">
            <span>🏁</span> Procesos Finalizados
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Aceptadas */}
            <div className="bg-[#1a1a1f] rounded-2xl border border-white/5 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-green-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Propuestas Aceptadas
                </h3>
                <span className="bg-green-500/10 text-green-500 text-xs font-bold px-2.5 py-1 rounded-full">
                  {columns['col-accepted']?.jobs?.length || 0}
                </span>
              </div>
              <div className="flex overflow-x-auto pb-4 gap-3 custom-scrollbar">
                {columns['col-accepted']?.jobs?.map(job => (
                  <div key={job.id} onClick={() => { setSelectedJobId(job.id); setSelectedColumnId('col-accepted'); }} className="shrink-0 w-[240px] bg-[#242429] hover:bg-[#2a2a30] transition-colors rounded-xl p-3 border border-white/5 cursor-pointer flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-foreground truncate">{job.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{job.role || 'Sin rol'}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-green-400 font-medium text-xs">{(job.salarioAnual || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}/yr</span>
                    </div>
                  </div>
                ))}
                {(!columns['col-accepted']?.jobs || columns['col-accepted'].jobs.length === 0) && (
                  <div className="w-full text-center py-8 text-muted-foreground/50 text-sm italic border border-dashed border-white/10 rounded-xl">No hay propuestas aceptadas aún</div>
                )}
              </div>
            </div>

            {/* Rechazadas */}
            <div className="bg-[#1a1a1f] rounded-2xl border border-white/5 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-red-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  No Continuamos
                </h3>
                <span className="bg-red-500/10 text-red-500 text-xs font-bold px-2.5 py-1 rounded-full">
                  {columns['col-rejected']?.jobs?.length || 0}
                </span>
              </div>
              <div className="flex overflow-x-auto pb-4 gap-3 custom-scrollbar">
                {columns['col-rejected']?.jobs?.map(job => (
                  <div key={job.id} onClick={() => { setSelectedJobId(job.id); setSelectedColumnId('col-rejected'); }} className="shrink-0 w-[240px] bg-[#242429] hover:bg-[#2a2a30] transition-colors rounded-xl p-3 border border-white/5 cursor-pointer flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-foreground truncate">{job.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{job.role || 'Sin rol'}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground truncate max-w-[120px]">{job.categoriaCierre || job.instanciaCierre || 'Rechazado'}</span>
                    </div>
                  </div>
                ))}
                {(!columns['col-rejected']?.jobs || columns['col-rejected'].jobs.length === 0) && (
                  <div className="w-full text-center py-8 text-muted-foreground/50 text-sm italic border border-dashed border-white/10 rounded-xl">Aún no hay descartes</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

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
                  
                  const targetJob = columns[jobToFinalize.columnId].jobs.find(j => j.id === jobToFinalize.jobId);
                  if (!targetJob) return;
                  
                  const updatedJob = {
                    ...targetJob,
                    instanciaCierre: jobToFinalize.currentColumnTitle,
                    categoriaCierre: finalizeCategory
                  };
                  
                  setColumns(prev => {
                    const newCols = { ...prev };
                    newCols[jobToFinalize.columnId].jobs = newCols[jobToFinalize.columnId].jobs.filter(j => j.id !== jobToFinalize.jobId);
                    if (!newCols['col-rejected']) newCols['col-rejected'] = { id: 'col-rejected', title: 'No Continuamos', jobs: [], badge: '', wrapperBg: '', cardBg: '', cardHover: '' };
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
                    if (!newCols['col-accepted']) newCols['col-accepted'] = { id: 'col-accepted', title: 'Aceptadas', jobs: [], badge: '', wrapperBg: '', cardBg: '', cardHover: '' };
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
