import React from "react";

export default function Loading() {
  return (
    <div className="bg-[#FAFAF8] text-[#0E1512] fixed inset-0 flex flex-col font-sans z-[100] overflow-hidden items-center justify-center">
      {/* Main Loader Content */}
      <div className="relative z-10 flex flex-col items-center justify-center animate-in fade-in duration-500">
        
        {/* The Loader Graphic (Animated Logo) */}
        <div className="relative flex flex-col items-center justify-center p-8">
          <div className="relative flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/branding/logo-mark-animated.svg" 
              alt="Loading..." 
              width={120} 
              height={120} 
            />
          </div>
        </div>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0E1512] animate-pulse">
          Cargando...
        </h2>
        <p className="mt-2 text-[#5B6B63] text-sm tracking-wide">Preparando tu espacio de trabajo</p>
      </div>
    </div>
  );
}
