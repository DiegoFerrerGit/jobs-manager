"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";

// Updated mock data with colors perfectly matching Notion's dark mode
const initialColumns = {
  "people": {
    id: "people",
    title: "People / Screening",
    badge: "bg-[#5c3b21] text-[#e0a475]",
    button: "border-[#5c3b21] bg-[#5c3b21]/10 text-[#e0a475] hover:bg-[#5c3b21]/30",
    columnBg: "bg-[#5c3b21]/[0.03]",
    jobs: [
      { id: "job-1", company: "Alpaca", location: "US", locationColor: "bg-[#1e5033] text-[#78d2a0]", role: "Director of Engineering", roleColor: "bg-[#4a2b6b] text-[#c18ee8]", salary: "240.000 US$", equity: "20.000 US$" },
      { id: "job-2", company: "Tapi", location: "Argentina", locationColor: "bg-[#1a4b6b] text-[#74bde8]", role: "Technical Manager", roleColor: "bg-[#1a4b6b] text-[#74bde8]", salary: "", equity: "" }
    ]
  },
  "hiring": {
    id: "hiring",
    title: "Hiring Manager",
    badge: "bg-[#6b2a4a] text-[#e88eb7]",
    button: "border-[#6b2a4a] bg-[#6b2a4a]/10 text-[#e88eb7] hover:bg-[#6b2a4a]/30",
    columnBg: "bg-[#6b2a4a]/[0.03]",
    jobs: []
  },
  "tecnica": {
    id: "tecnica",
    title: "Técnica",
    badge: "bg-[#4a2b6b] text-[#c18ee8]",
    button: "border-[#4a2b6b] bg-[#4a2b6b]/10 text-[#c18ee8] hover:bg-[#4a2b6b]/30",
    columnBg: "bg-[#4a2b6b]/[0.03]",
    jobs: []
  },
  "clevel": {
    id: "clevel",
    title: "C-Level / Culture",
    badge: "bg-[#6b5a1a] text-[#e8d274]",
    button: "border-[#6b5a1a] bg-[#6b5a1a]/10 text-[#e8d274] hover:bg-[#6b5a1a]/30",
    columnBg: "bg-[#6b5a1a]/[0.03]",
    jobs: []
  },
  "oferta": {
    id: "oferta",
    title: "Oferta",
    badge: "bg-[#1a4b6b] text-[#74bde8]",
    button: "border-[#1a4b6b] bg-[#1a4b6b]/10 text-[#74bde8] hover:bg-[#1a4b6b]/30",
    columnBg: "bg-[#1a4b6b]/[0.03]",
    jobs: []
  },
  "hold": {
    id: "hold",
    title: "Hold",
    badge: "bg-[#3f4044] text-[#b4b5b9]",
    button: "border-[#3f4044] bg-[#3f4044]/10 text-[#b4b5b9] hover:bg-[#3f4044]/30",
    columnBg: "bg-[#3f4044]/[0.03]",
    jobs: [
      { id: "job-3", company: "Katapult", location: "Colombia", locationColor: "bg-[#5c3b21] text-[#e0a475]", role: "Head Of Engineering", roleColor: "bg-[#3f4044] text-[#b4b5b9]", salary: "96.000 US$", equity: "8000 US$" }
    ]
  },
  "aceptada": {
    id: "aceptada",
    title: "Aceptada",
    badge: "bg-[#1e5033] text-[#78d2a0]",
    button: "border-[#1e5033] bg-[#1e5033]/10 text-[#78d2a0] hover:bg-[#1e5033]/30",
    columnBg: "bg-[#1e5033]/[0.03]",
    jobs: []
  },
  "nocontinua": {
    id: "nocontinua",
    title: "No continuamos",
    badge: "bg-[#5c2323] text-[#e58282]",
    button: "border-[#5c2323] bg-[#5c2323]/10 text-[#e58282] hover:bg-[#5c2323]/30",
    columnBg: "bg-[#5c2323]/[0.03]",
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

    // Moving within the same column
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
      // Moving to a different column
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

  if (!isMounted) return null; // Avoid hydration mismatch on drag and drop

  return (
    <div className="flex-1 p-4 md:p-8 h-screen flex flex-col overflow-hidden bg-[#101014]">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <span>🗃️</span> Jobs
          </h1>
        </div>
      </div>
      
      {/* Scrollable Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 h-full min-w-max items-start">
            {Object.entries(columns).map(([columnId, column]) => (
              <div key={columnId} className="w-[280px] shrink-0 flex flex-col max-h-full">
                {/* Column Header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className={`px-2 py-0.5 rounded text-xs font-semibold ${column.badge}`}>
                    {column.title}
                  </div>
                  <span className="text-muted-foreground text-xs font-medium">{column.jobs.length}</span>
                </div>
                
                {/* Droppable Area */}
                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 rounded-xl p-2 min-h-[100px] flex flex-col gap-2 transition-colors ${column.columnBg} ${
                        snapshot.isDraggingOver ? "brightness-125" : ""
                      }`}
                    >
                      {column.jobs.map((job, index) => (
                        <Draggable key={job.id} draggableId={job.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-[#1e1e24] hover:bg-[#25252a] rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing transition-colors ${
                                snapshot.isDragging ? "ring-2 ring-primary shadow-lg" : ""
                              }`}
                              style={{ ...provided.draggableProps.style }}
                            >
                              <h3 className="font-bold text-sm text-foreground mb-2.5">{job.company}</h3>
                              
                              <div className="flex flex-col gap-1.5 items-start">
                                {job.location && (
                                  <span className={`inline-flex ${job.locationColor} text-[10px] px-1.5 py-0.5 rounded font-medium`}>
                                    {job.location}
                                  </span>
                                )}
                                {job.role && (
                                  <span className={`inline-flex ${job.roleColor} text-[10px] px-1.5 py-0.5 rounded font-medium`}>
                                    {job.role}
                                  </span>
                                )}
                              </div>
                              
                              {(job.salary || job.equity) && (
                                <div className="mt-3 flex flex-col gap-0.5 text-xs text-muted-foreground/80">
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
                        <button className={`flex items-center gap-2 text-xs p-2 rounded-lg transition-colors w-full mt-1 border ${column.button}`}>
                          <Plus className="w-3 h-3" />
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
