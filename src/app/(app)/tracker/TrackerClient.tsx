"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";

// Initial mock data based on the screenshot
const initialColumns = {
  "people": {
    id: "people",
    title: "People / Screening",
    color: "bg-orange-900/40 text-orange-200 border-orange-700/50",
    jobs: [
      { id: "job-1", company: "Alpaca", location: "US", role: "Director of Engineering", salary: "240.000 US$", equity: "20.000 US$" },
      { id: "job-2", company: "Tapi", location: "Argentina", role: "Technical Manager", salary: "", equity: "" }
    ]
  },
  "hiring": {
    id: "hiring",
    title: "Hiring Manager",
    color: "bg-pink-900/40 text-pink-200 border-pink-700/50",
    jobs: []
  },
  "tecnica": {
    id: "tecnica",
    title: "Técnica",
    color: "bg-purple-900/40 text-purple-200 border-purple-700/50",
    jobs: []
  },
  "clevel": {
    id: "clevel",
    title: "C-Level / Culture",
    color: "bg-yellow-900/40 text-yellow-200 border-yellow-700/50",
    jobs: []
  },
  "oferta": {
    id: "oferta",
    title: "Oferta",
    color: "bg-blue-900/40 text-blue-200 border-blue-700/50",
    jobs: []
  },
  "hold": {
    id: "hold",
    title: "Hold",
    color: "bg-slate-800/60 text-slate-200 border-slate-600/50",
    jobs: [
      { id: "job-3", company: "Katapult", location: "Colombia", role: "Head Of Engineering", salary: "96.000 US$", equity: "8000 US$" }
    ]
  },
  "aceptada": {
    id: "aceptada",
    title: "Aceptada",
    color: "bg-emerald-900/40 text-emerald-200 border-emerald-700/50",
    jobs: []
  },
  "nocontinua": {
    id: "nocontinua",
    title: "No continuamos",
    color: "bg-red-900/40 text-red-200 border-red-700/50",
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
                  <div className={`px-2 py-0.5 rounded text-xs font-semibold border ${column.color}`}>
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
                      className={`flex-1 rounded-xl p-2 min-h-[100px] flex flex-col gap-2 transition-colors ${
                        snapshot.isDraggingOver ? "bg-secondary/40" : "bg-transparent"
                      }`}
                    >
                      {column.jobs.map((job, index) => (
                        <Draggable key={job.id} draggableId={job.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-[#1c1c21] hover:bg-[#25252a] rounded-lg p-4 border border-border/40 shadow-sm cursor-grab active:cursor-grabbing transition-colors ${
                                snapshot.isDragging ? "ring-2 ring-primary shadow-lg" : ""
                              }`}
                              style={{ ...provided.draggableProps.style }}
                            >
                              <h3 className="font-bold text-sm text-foreground mb-3">{job.company}</h3>
                              
                              <div className="flex flex-col gap-1.5">
                                {job.location && (
                                  <span className="inline-flex w-fit bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 text-[10px] px-1.5 py-0.5 rounded">
                                    {job.location}
                                  </span>
                                )}
                                {job.role && (
                                  <span className="inline-flex w-fit bg-purple-900/30 text-purple-300 border border-purple-800/50 text-[10px] px-1.5 py-0.5 rounded">
                                    {job.role}
                                  </span>
                                )}
                              </div>
                              
                              {(job.salary || job.equity) && (
                                <div className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground/80">
                                  {job.salary && <span>{job.salary}</span>}
                                  {job.equity && <span>{job.equity}</span>}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {/* Add new button */}
                      <button className="flex items-center gap-2 text-xs text-muted-foreground/70 hover:text-foreground p-2 rounded-lg hover:bg-secondary/50 transition-colors w-full mt-1">
                        <Plus className="w-3 h-3" />
                        Nueva página
                      </button>
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
