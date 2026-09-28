import fs from 'fs';

const filePath = 'src/app/(app)/tracker/TrackerClient.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add CheckCircle2 to imports
if (!content.includes('CheckCircle2')) {
  content = content.replace('Trash2, Eye, EyeOff', 'Trash2, Eye, EyeOff, CheckCircle2');
}

// 2. Add jobToFinalize state
if (!content.includes('jobToFinalize')) {
  content = content.replace(
    'const [jobToDelete, setJobToDelete] = useState<{jobId: string, columnId: string} | null>(null);',
    'const [jobToDelete, setJobToDelete] = useState<{jobId: string, columnId: string} | null>(null);\n  const [jobToFinalize, setJobToFinalize] = useState<{jobId: string, columnId: string, currentColumnTitle: string} | null>(null);\n  const [finalizeCategory, setFinalizeCategory] = useState<string>("");'
  );
}

// 3. Update useEffect for initialData
if (!content.includes('col-accepted')) {
  const replacement = `
        const colsToDelete: string[] = [];
        const acceptedJobs: any[] = [];
        const rejectedJobs: any[] = [];

        Object.keys(parsedColumns).forEach(colKey => {
          if (OLD_TO_NEW_COLORS[parsedColumns[colKey].badge]) {
            parsedColumns[colKey].badge = OLD_TO_NEW_COLORS[parsedColumns[colKey].badge];
          }
          
          const titleLower = parsedColumns[colKey].title.toLowerCase();
          if (titleLower.includes('aceptada')) {
            acceptedJobs.push(...parsedColumns[colKey].jobs);
            colsToDelete.push(colKey);
          } else if (titleLower.includes('no continuam') || titleLower.includes('rechazad')) {
            rejectedJobs.push(...parsedColumns[colKey].jobs);
            colsToDelete.push(colKey);
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
        
        colsToDelete.forEach(id => delete parsedColumns[id]);
        
        if (!parsedColumns['col-accepted']) {
          parsedColumns['col-accepted'] = {
            id: 'col-accepted', title: 'Aceptadas', jobs: sortJobsBySalary(acceptedJobs),
            badge: 'bg-green-500/20 text-green-500', wrapperBg: '', cardBg: '', cardHover: ''
          };
        } else {
          parsedColumns['col-accepted'].jobs.push(...acceptedJobs);
        }
        
        if (!parsedColumns['col-rejected']) {
          parsedColumns['col-rejected'] = {
            id: 'col-rejected', title: 'No Continuamos', jobs: sortJobsBySalary(rejectedJobs),
            badge: 'bg-red-500/20 text-red-500', wrapperBg: '', cardBg: '', cardHover: ''
          };
        } else {
          parsedColumns['col-rejected'].jobs.push(...rejectedJobs);
        }

        setColumns(parsedColumns);
      } catch (e) { console.error(e); }
    }
    if (savedOrder) {
      try { 
        let parsedOrder = JSON.parse(savedOrder);
        parsedOrder = parsedOrder.filter((id: string) => !id.includes('col-accepted') && !id.includes('col-rejected') && !colsToDelete.includes(id));
        setColumnOrder(parsedOrder); 
      } catch (e) { console.error(e); }
    }`;

  content = content.replace(/Object\.keys\(parsedColumns\)\.forEach\(colKey => \{[\s\S]*?setColumns\(parsedColumns\);\n      \} catch \(e\) \{ console\.error\(e\); \}\n    \}\n    if \(savedOrder\) \{\n      try \{ setColumnOrder\(JSON\.parse\(savedOrder\)\); \} catch \(e\) \{ console\.error\(e\); \}\n    \}/, replacement);
}

// 4. Update onDragEnd
if (!content.includes('removed.instanciaCierre = destCol.title')) {
  content = content.replace(
    /updateJobColumnAction\(result\.draggableId, destination\.droppableId\)\.catch\(console\.error\);/,
    `removed.instanciaCierre = destCol.title;\n      updateJobColumnAction(result.draggableId, destination.droppableId, destCol.title).catch(console.error);`
  );
}

// 5. Add Finalizar Proceso button
if (!content.includes('title="Finalizar proceso"')) {
  const btnReplacement = `<button 
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
                                            </button>`;
  content = content.replace(
    /<button[^>]*onClick=\{\(e\) => \{\s*e\.stopPropagation\(\);\s*setJobToDelete\(\{ jobId: job\.id, columnId \}\);\s*\}\}[^>]*>\s*<Trash2 className="w-3\.5 h-3\.5" \/>\s*<\/button>/,
    btnReplacement
  );
}

// 6. Replace Metrics section with Procesos Finalizados
const metricsRegex = /\{\/\* Metrics Section \*\/\}[\s\S]*?<\/div>\s*<\/div>/;
const finalizedSection = `{/* Procesos Finalizados Section */}
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
        </div>`;

if (!content.includes('Procesos Finalizados Section')) {
  content = content.replace(metricsRegex, finalizedSection);
}

// 7. Add Finalize Modal
if (!content.includes('Modal de Finalización')) {
  const finalizeModal = `
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
                  {config?.options?.categoriaCierre?.map(opt => (
                    <option key={opt.id} value={opt.label}>{opt.label}</option>
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
      )}`;
      
  content = content.replace('</DragDropContext>', finalizeModal + '\n    </DragDropContext>');
}

fs.writeFileSync(filePath, content);
console.log('Refactoring completed successfully.');
