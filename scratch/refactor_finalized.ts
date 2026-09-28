import fs from 'fs';

const filePath = 'src/app/(app)/tracker/TrackerClient.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Create renderJobCard helper inside TrackerClient
if (!content.includes('const renderJobCard =')) {
  const helperCode = `
  const renderJobCard = (job: TrackerJob, columnId: string, column: ColumnData, providedJob?: any, snapshotJob?: any, isFinalized = false) => {
    return (
      <div
        ref={providedJob?.innerRef}
        {...providedJob?.draggableProps}
        {...providedJob?.dragHandleProps}
        className={\`\${isFinalized ? "shrink-0 w-[240px]" : "mb-3"} rounded-xl p-3 shadow-sm cursor-pointer group relative transition-colors flex flex-col gap-3 \${column.cardBg} \${column.cardHover} border border-white/5 \${snapshotJob?.isDragging ? "ring-2 ring-primary shadow-lg" : ""} \${selectedJobId === job.id ? "ring-2 ring-inset ring-blue-500 bg-white/5" : ""}\`}
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
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-[#202020] hover:bg-destructive/80 text-muted-foreground hover:text-white rounded-md transition-all"
          title="Eliminar tarjeta"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        {!isFinalized && (
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
        )}
        
        <h3 className="font-bold text-[15px] text-foreground pr-10">{job.name}</h3>

        <div className="flex flex-col gap-1.5 items-start">
          {job.location && (
            <span className={\`inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium leading-tight \${config?.options?.location?.find(o => o.label === job.location)?.color || 'bg-white/10 text-white/80'}\`}>
              {job.location}
            </span>
          )}
          {job.role && (
            <span className={\`inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium leading-tight \${config?.options?.role?.find(o => o.label === job.role)?.color || 'bg-white/10 text-white/80'}\`}>
              {job.role}
            </span>
          )}
          {isFinalized && job.categoriaCierre && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium leading-tight bg-white/5 text-muted-foreground">
              Motivo: {job.categoriaCierre}
            </span>
          )}
        </div>

        {(job.salarioMensual || job.salarioAnual) && (
          <div className="mt-1 flex flex-col gap-1.5 text-[12px] text-foreground font-semibold">
            {job.salarioAnual && <span>{job.monedaSalario === 'ARS' ? '$ ' : 'US$ '}{job.salarioAnual.toLocaleString(job.monedaSalario === 'ARS' ? 'es-AR' : 'en-US')}</span>}
            {job.salarioMensual && <span>{job.monedaSalario === 'ARS' ? '$ ' : 'US$ '}{job.salarioMensual.toLocaleString(job.monedaSalario === 'ARS' ? 'es-AR' : 'en-US')}</span>}
          </div>
        )}
      </div>
    );
  };
`;
  content = content.replace('const getAnnualSalary = (job: TrackerJob) => {', helperCode + '\n  const getAnnualSalary = (job: TrackerJob) => {');
}

// 2. Replace Kanban card rendering
const kanbanCardRegex = /<Draggable key=\{job\.id\} draggableId=\{job\.id\} index=\{idx\}>\s*\{\(providedJob, snapshotJob\) => \([\s\S]*?\}\)\s*<\/div>\s*\)\}\s*<\/Draggable>/m;
if (content.match(kanbanCardRegex)) {
  content = content.replace(kanbanCardRegex, `<Draggable key={job.id} draggableId={job.id} index={idx}>
                                        {(providedJob, snapshotJob) => renderJobCard(job, columnId, column, providedJob, snapshotJob, false)}
                                      </Draggable>`);
}

// 3. Update Procesos Finalizados section
const finalizedRegex = /\{\/\* Procesos Finalizados Section \*\/\}[\s\S]*?<\/div>\s*<\/div>/;

const newFinalizedSection = `{/* Procesos Finalizados Section */}
        {(columns['col-accepted']?.jobs?.length > 0 || columns['col-rejected']?.jobs?.length > 0) && (
          <div className="mt-12 mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-3 mb-6">
              <span>🏁</span> Procesos Finalizados
            </h2>
            <div className="flex flex-col gap-6">
              {/* Rechazadas (No Continuamos) */}
              {columns['col-rejected']?.jobs?.length > 0 && (
                <div className="bg-[#1a1a1f] rounded-2xl border border-white/5 p-5 w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-red-500 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      No Continuamos
                    </h3>
                    <span className="bg-red-500/10 text-red-500 text-xs font-bold px-2.5 py-1 rounded-full">
                      {columns['col-rejected']?.jobs?.length}
                    </span>
                  </div>
                  {/* Space for future charts (25%), cards (75%) - Currently using 100% for cards */}
                  <div className="w-full">
                    <div className="flex overflow-x-auto pb-4 gap-3 custom-scrollbar">
                      {columns['col-rejected'].jobs.map(job => (
                        <div key={job.id}>
                          {renderJobCard(job, 'col-rejected', columns['col-rejected'], undefined, undefined, true)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Aceptadas */}
              {columns['col-accepted']?.jobs?.length > 0 && (
                <div className="bg-[#1a1a1f] rounded-2xl border border-white/5 p-5 w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-green-500 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Propuestas Aceptadas
                    </h3>
                    <span className="bg-green-500/10 text-green-500 text-xs font-bold px-2.5 py-1 rounded-full">
                      {columns['col-accepted']?.jobs?.length}
                    </span>
                  </div>
                  <div className="w-full">
                    <div className="flex overflow-x-auto pb-4 gap-3 custom-scrollbar">
                      {columns['col-accepted'].jobs.map(job => (
                        <div key={job.id}>
                          {renderJobCard(job, 'col-accepted', columns['col-accepted'], undefined, undefined, true)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}`;

content = content.replace(finalizedRegex, newFinalizedSection);

fs.writeFileSync(filePath, content);
console.log("Refactored Finalized UI successfully");
