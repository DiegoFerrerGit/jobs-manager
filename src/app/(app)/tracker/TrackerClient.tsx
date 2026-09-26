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

export default function TrackerClient() {
  const [columns, setColumns] = useState(initialColumns);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      const column = columns[source.droppableId as keyof typeof columns];
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
      const sourceCol = columns[source.droppableId as keyof typeof columns];
      const destCol = columns[destination.droppableId as keyof typeof columns];
      
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
    <div className="flex-1 p-4 md:p-8 h-screen flex flex-col overflow-hidden bg-[#101014]">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <span>🗃️</span> Jobs
          </h1>
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 h-full min-w-max items-start">
            {Object.entries(columns).map(([columnId, column]) => (
              <div key={columnId} className={`w-[280px] shrink-0 flex flex-col max-h-full rounded-xl p-2 ${column.wrapperBg}`}>
                
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1 pt-1">
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-0.5 rounded text-sm font-medium ${column.badge}`}>
                      {column.title}
                    </div>
                    <span className="text-muted-foreground text-sm font-medium">{column.jobs.length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground/60">
                    <span className="text-lg leading-none cursor-pointer hover:text-muted-foreground pb-2">...</span>
                    <Plus className="w-4 h-4 cursor-pointer hover:text-muted-foreground" />
                  </div>
                </div>
                
                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`min-h-[10px] flex flex-col gap-2 transition-colors ${
                        snapshot.isDraggingOver ? "brightness-110" : ""
                      }`}
                    >
                      {column.jobs.map((job, index) => (
                        <Draggable key={job.id} draggableId={job.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`rounded-xl p-3 shadow-sm cursor-grab active:cursor-grabbing transition-colors ${column.cardBg} ${column.cardHover} border border-white/5 ${
                                snapshot.isDragging ? "ring-2 ring-primary shadow-lg" : ""
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
            ))}
          </div>
        </DragDropContext>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
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
  );
}
