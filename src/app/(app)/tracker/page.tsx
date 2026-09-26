export default function TrackerPage() {
  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Tracker
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualiza y da seguimiento a tus aplicaciones.
          </p>
        </div>
      </div>
      
      <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px] border border-border/50 text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">Próximamente</h2>
        <p className="text-muted-foreground max-w-md">
          Esta sección está en construcción. Aquí podrás gestionar y analizar el progreso de todas tus aplicaciones de trabajo.
        </p>
      </div>
    </div>
  );
}
