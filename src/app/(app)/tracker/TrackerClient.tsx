"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";

// Updated mock data with colors perfectly matching Notion's dark mode "Color Columns"
const initialColumns = {
  "people": {
    id: "people",
    title: "People / Screening",
    badge: "bg-[#67442f] text-[#e2c8b5]",
    wrapperBg: "bg-[#291d17]",
    cardBg: "bg-[#3f2c21]",
    cardHover: "hover:bg-[#4c3629]",
    jobs: [
      { id: "job-1", company: "Alpaca", location: "US 🗽", locationColor: "bg-[#2c4a35] text-[#b4deb8]", role: "Director of Engineering", roleColor: "bg-[#443560] text-[#c9b7e3]", salary: "240.000 US$", equity: "20.000 US$" },
      { id: "job-2", company: "Tapi", location: "Argentina", locationColor: "bg-[#2b4b66] text-[#b3d3ed]", role: "Technical Manager", roleColor: "bg-[#2b4b66] text-[#b3d3ed]", salary: "120.000 US$", equity: "10.000 US$" },
      { id: "job-3", company: "AssureSoft", location: "", locationColor: "", role: "Engineering Manager", roleColor: "bg-[#2b4b66] text-[#b3d3ed]", salary: "102.000 US$", equity: "8500 US$" }
    ]
  },
  "hiring": {
    id: "hiring",
    title: "Hiring Manager",
    badge: "bg-[#672b49] text-[#e6c1d3]",
    wrapperBg: "bg-[#281b21]",
    cardBg: "bg-[#402232]",
    cardHover: "hover:bg-[#4c293c]",
    jobs: []
  },
  "tecnica": {
    id: "tecnica",
    title: "Técnica",
    badge: "bg-[#443560] text-[#c9b7e3]",
    wrapperBg: "bg-[#231f2b]",
    cardBg: "bg-[#322a3d]",
    cardHover: "hover:bg-[#3c3349]",
    jobs: []
  },
  "clevel": {
    id: "clevel",
    title: "C-Level / Culture",
    badge: "bg-[#5f4f22] text-[#e5d4a1]",
    wrapperBg: "bg-[#2b2718]",
    cardBg: "bg-[#3d3822]",
    cardHover: "hover:bg-[#494328]",
    jobs: []
  },
  "oferta": {
    id: "oferta",
    title: "Oferta",
    badge: "bg-[#2b4b66] text-[#b3d3ed]",
    wrapperBg: "bg-[#1c242c]",
    cardBg: "bg-[#263645]",
    cardHover: "hover:bg-[#2d4052]",
    jobs: []
  },
  "hold": {
    id: "hold",
    title: "Hold",
    badge: "bg-[#454545] text-[#cccccc]",
    wrapperBg: "bg-[#202020]",
    cardBg: "bg-[#2f2f2f]",
    cardHover: "hover:bg-[#383838]",
    jobs: [
      { id: "job-4", company: "Katapult", location: "Colombia", locationColor: "bg-[#5a3b26] text-[#dfc3b2]", role: "Head Of Engineering", roleColor: "bg-[#454545] text-[#cccccc]", salary: "96.000 US$", equity: "8000 US$" }
    ]
  },
  "aceptada": {
    id: "aceptada",
    title: "Aceptada",
    badge: "bg-[#2c4a35] text-[#b4deb8]",
    wrapperBg: "bg-[#1e2621]",
    cardBg: "bg-[#283a2d]",
    cardHover: "hover:bg-[#304536]",
    jobs: []
  },
  "nocontinua": {
    id: "nocontinua",
    title: "No continuamos",
    badge: "bg-[#602e2e] text-[#e8b5b5]",
    wrapperBg: "bg-[#2d1d1d]",
    cardBg: "bg-[#422828]",
    cardHover: "hover:bg-[#4f3030]",
    jobs: []
  }
};

const COLUMN_COLORS = {
  gris: { name: "Gris", badge: "bg-[#454545] text-[#cccccc]", wrapperBg: "bg-[#202020]", cardBg: "bg-[#2f2f2f]", cardHover: "hover:bg-[#383838]" },
  marron: { name: "Marrón", badge: "bg-[#67442f] text-[#e2c8b5]", wrapperBg: "bg-[#291d17]", cardBg: "bg-[#3f2c21]", cardHover: "hover:bg-[#4c3629]" },
  naranja: { name: "Naranja", badge: "bg-[#673c1d] text-[#e6bc9c]", wrapperBg: "bg-[#2e2118]", cardBg: "bg-[#453022]", cardHover: "hover:bg-[#523928]" },
  amarillo: { name: "Amarillo", badge: "bg-[#5f4f22] text-[#e5d4a1]", wrapperBg: "bg-[#2b2718]", cardBg: "bg-[#3d3822]", cardHover: "hover:bg-[#494328]" },
  verde: { name: "Verde", badge: "bg-[#2c4a35] text-[#b4deb8]", wrapperBg: "bg-[#1e2621]", cardBg: "bg-[#283a2d]", cardHover: "hover:bg-[#304536]" },
  azul: { name: "Azul", badge: "bg-[#2b4b66] text-[#b3d3ed]", wrapperBg: "bg-[#1c242c]", cardBg: "bg-[#263645]", cardHover: "hover:bg-[#2d4052]" },
  morado: { name: "Morado", badge: "bg-[#443560] text-[#c9b7e3]", wrapperBg: "bg-[#231f2b]", cardBg: "bg-[#322a3d]", cardHover: "hover:bg-[#3c3349]" },
  rosa: { name: "Rosa", badge: "bg-[#672b49] text-[#e6c1d3]", wrapperBg: "bg-[#281b21]", cardBg: "bg-[#402232]", cardHover: "hover:bg-[#4c293c]" },
  rojo: { name: "Rojo", badge: "bg-[#602e2e] text-[#e8b5b5]", wrapperBg: "bg-[#2d1d1d]", cardBg: "bg-[#422828]", cardHover: "hover:bg-[#4f3030]" }
};

type ColumnData = {
  id: string;
  title: string;
  badge: string;
  wrapperBg: string;
  cardBg: string;
  cardHover: string;
  jobs: { id: string; company: string; location: string; locationColor: string; role: string; roleColor: string; salary: string; equity: string; }[];
};

export default function TrackerClient() {
  const [columns, setColumns] = useState<Record<string, ColumnData>>(initialColumns);
  const [columnOrder, setColumnOrder] = useState(Object.keys(initialColumns));
  const [isMounted, setIsMounted] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    // Hydrate from localStorage
    const savedColumns = localStorage.getItem("jobs-tracker-columns");
    const savedOrder = localStorage.getItem("jobs-tracker-column-order");
    
    if (savedColumns) {
      try { setColumns(JSON.parse(savedColumns)); } catch (e) { console.error(e); }
    }
    if (savedOrder) {
      try { setColumnOrder(JSON.parse(savedOrder)); } catch (e) { console.error(e); }
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
          jobs: copiedItems
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
          jobs: sourceItems
        },
        [destination.droppableId]: {
          ...destCol,
          jobs: destItems
        }
      });
    }
  };

  if (!isMounted) return null;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex-1 p-4 md:p-8 h-screen flex flex-col overflow-hidden bg-[#101014]">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <span>🗃️</span> Jobs Tracking
            </h1>
          </div>
        </div>
        
        <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
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
                      {(provided, snapshot) => (
                        <div 
                          className={`w-[280px] shrink-0 flex flex-col max-h-full rounded-xl p-2 mr-4 ${column.wrapperBg} ${snapshot.isDragging ? 'opacity-80 ring-2 ring-primary shadow-2xl' : ''}`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          {/* Column Header */}
                          <div className="flex items-center justify-between mb-3 px-1 pt-1">
                            <div 
                              className="flex items-center gap-2 cursor-grab active:cursor-grabbing flex-1"
                              {...provided.dragHandleProps}
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
                        {/* Invisible overlay to close dropdown when clicking outside */}
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setActiveDropdown(null)}
                        />
                        <div className="absolute right-0 top-8 w-[220px] bg-[#202020] border border-[#303030] rounded-xl shadow-2xl z-50 overflow-hidden text-[13px] text-muted-foreground">
                          <div className="p-1">
                            <button 
                              type="button"
                              className="w-full text-left px-3 py-1.5 hover:bg-[#303030] rounded text-foreground transition-colors flex items-center gap-2"
                              onClick={() => { /* TODO: ocultar con filtros */ setActiveDropdown(null); }}
                            >
                              <span className="w-4 h-4 flex items-center justify-center text-lg">👁️</span>
                              Ocultar columna
                            </button>
                            <button 
                              type="button"
                              className="w-full text-left px-3 py-1.5 hover:bg-[#303030] rounded text-destructive hover:text-red-400 transition-colors flex items-center gap-2" 
                              onClick={() => deleteColumn(columnId)}
                            >
                              <span className="w-4 h-4 flex items-center justify-center text-lg">🗑️</span>
                              Eliminar columna
                            </button>
                          </div>
                          <div className="border-t border-[#303030] my-1"></div>
                          <div className="p-1 max-h-[280px] overflow-y-auto">
                            <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground/50 tracking-wider mb-1">Colores</div>
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

                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`min-h-[10px] flex flex-col transition-colors ${snapshot.isDraggingOver ? "bg-white/5" : ""
                        }`}
                    >
                      {column.jobs.map((job, index) => (
                        <Draggable key={job.id} draggableId={job.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`mb-3 rounded-xl p-3 shadow-sm cursor-grab active:cursor-grabbing transition-colors ${column.cardBg} ${column.cardHover} border border-white/5 ${snapshot.isDragging ? "ring-2 ring-primary shadow-lg" : ""
                                }`}
                              style={{ ...provided.draggableProps.style }}
                            >
                              <h3 className="font-bold text-[15px] text-foreground mb-2.5">{job.company}</h3>

                              <div className="flex flex-col gap-1.5 items-start">
                                {job.location && (
                                  <span className={`inline-flex ${job.locationColor} text-[11px] px-1.5 py-0.5 rounded font-medium`}>
                                    {job.location}
                                  </span>
                                )}
                                {job.role && (
                                  <span className={`inline-flex ${job.roleColor} text-[11px] px-1.5 py-0.5 rounded font-medium`}>
                                    {job.role}
                                  </span>
                                )}
                              </div>

                              {(job.salary || job.equity) && (
                                <div className="mt-4 flex flex-col gap-1 text-[13px] text-foreground/80 font-medium">
                                  {job.salary && <span>{job.salary}</span>}
                                  {job.equity && <span>{job.equity}</span>}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {/* Add new button (only for the first column) */}
                      {columnId === 'people' && (
                        <button className="flex items-center gap-2 text-sm p-2 rounded-lg transition-colors w-full mt-1 text-muted-foreground/60 hover:bg-white/5 hover:text-muted-foreground">
                          <Plus className="w-4 h-4" />
                          Nuevo proceso
                        </button>
                      )}
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
            height: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.02);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.15);
          }
        `}} />
      </div>
    </DragDropContext>
  );
}
