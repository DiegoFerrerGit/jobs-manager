import { Briefcase } from "lucide-react";

export default function Loading() {
  return (
    <div className="bg-background text-foreground fixed inset-0 flex flex-col font-sans z-[100] overflow-hidden items-center justify-center">
      {/* Floating ambient lights (themed to Jobs Manager purple/blue) */}
      <div className="fixed top-[-5%] left-[-5%] pointer-events-none opacity-20 animate-pulse">
        <div className="w-96 h-96 bg-purple-600 rounded-full blur-[160px]"></div>
      </div>
      <div className="fixed bottom-[-5%] right-[-5%] pointer-events-none opacity-15 animate-pulse" style={{ animationDelay: "1.5s" }}>
        <div className="w-80 h-80 bg-blue-500 rounded-full blur-[140px]"></div>
      </div>
      <div className="fixed top-[40%] right-[10%] pointer-events-none opacity-10 animate-pulse" style={{ animationDelay: "3s" }}>
        <div className="w-64 h-64 bg-teal-500 rounded-full blur-[120px]"></div>
      </div>

      {/* Main Loader Content */}
      <div className="relative z-10 flex flex-col items-center justify-center animate-in fade-in duration-500">
        
        {/* Glow effect behind the loader */}
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-[50px] scale-150 animate-pulse"></div>
        
        {/* The Loader Graphic */}
        <div className="relative flex flex-col items-center justify-center bg-primary/5 rounded-full p-8 border border-primary/20 drop-shadow-[0_0_30px_rgba(168,85,247,0.2)]">
          <div className="relative flex items-center justify-center">
            {/* Spinning outer ring */}
            <svg className="animate-spin size-24 text-primary absolute" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-10" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle>
              <path className="opacity-70" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            
            {/* Pulsing Icon */}
            <Briefcase className="size-10 text-primary-foreground/90 animate-pulse bg-primary p-2 rounded-lg" strokeWidth={1.5} />
          </div>
        </div>

        <h2 className="mt-8 text-2xl font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-primary to-purple-400 animate-pulse">
          Buscando
        </h2>
        <p className="mt-2 text-muted-foreground text-sm tracking-wide">Analizando el mercado...</p>
      </div>
    </div>
  );
}
