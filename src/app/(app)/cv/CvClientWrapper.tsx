"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const CvClientDynamic = dynamic(() => import("./CvClient").then(m => m.CvClient), { 
  ssr: false, 
  loading: () => <div className="flex h-full w-full items-center justify-center text-slate-400 bg-[#1e1e1e]"><Loader2 className="h-6 w-6 animate-spin mr-2" />Cargando compilador de Typst (WASM)...</div> 
});

export function CvClientWrapper({ initialCode }: { initialCode: string }) {
  return <CvClientDynamic initialCode={initialCode} />;
}
