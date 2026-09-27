"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Download, Loader2, Play, Search, Maximize, Minimize, Info, X, Save } from "lucide-react";
import { saveCvCode } from "./actions";

export function CvClient({ initialCode }: { initialCode: string }) {
  const [code, setCode] = useState(initialCode);
  const [savedCode, setSavedCode] = useState(initialCode);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Debounce refs
  const compileTimeout = useRef<NodeJS.Timeout | null>(null);

  const compilePdf = useCallback(async (currentCode: string) => {
    setIsCompiling(true);
    setError(null);
    try {
      const response = await fetch("/api/typst", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: currentCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to compile PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      setPdfUrl((prevUrl) => {
        if (prevUrl) {
          URL.revokeObjectURL(prevUrl); // Clean up previous URL
        }
        return url;
      });
    } catch (err: any) {
      setError(err.message || "An error ocurrió durante la compilación.");
    } finally {
      setIsCompiling(false);
    }
  }, []);

  // Initial compilation
  useEffect(() => {
    compilePdf(code);
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || "";
    setCode(newCode);

    if (compileTimeout.current) {
      clearTimeout(compileTimeout.current);
    }
    compileTimeout.current = setTimeout(() => {
      compilePdf(newCode);
    }, 1000); // 1 second debounce for compiling
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Small artificial delay so the user actually sees the loading effect
      await new Promise(resolve => setTimeout(resolve, 800));
      await saveCvCode(code);
      setSavedCode(code);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = "Cv-Last.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const hasUnsavedChanges = code !== savedCode;

  return (
    <div className="flex h-screen w-full flex-col bg-[#1e1e1e] text-white font-sans relative">
      
      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#252526] border border-white/10 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#1e1e1e]">
              <h3 className="font-bold text-lg text-emerald-400 flex items-center gap-2">
                <Info className="w-5 h-5" />
                ¿Qué es esto?
              </h3>
              <button 
                onClick={() => setShowInfo(false)}
                className="p-1 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-slate-300 text-sm leading-relaxed">
              <p>
                Este es un editor de currículums basado en <strong className="text-white">Typst</strong>, un lenguaje de marcado moderno diseñado para crear documentos profesionales con calidad de impresión (mucho más fácil y rápido que LaTeX).
              </p>
              <div className="bg-[#1e1e1e] p-3 rounded-lg border border-white/5 space-y-3">
                <div>
                  <p><span className="text-blue-400 font-mono">#import</span>: Carga una plantilla desde la nube. En este caso, usas un diseño ATS-friendly.</p>
                  <a 
                    href="https://typst.app/universe/search/?kind=template" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20"
                  >
                    <Search className="w-3 h-3" />
                    Explorar más templates en Typst Universe
                  </a>
                </div>
                <p><span className="text-blue-400 font-mono">#section</span>: Crea un título de sección (ej: Experiencia, Educación).</p>
                <p><span className="text-emerald-400 font-mono">[Texto entre corchetes]</span>: Es el contenido visual que se imprimirá en el PDF.</p>
              </div>
              <p>
                <strong className="text-white">¿Cómo funciona?</strong> Solo edita tu información en el código de la izquierda. El sistema compilará y actualizará tu PDF a la derecha automáticamente y se guardará en la nube. ¡Si cometes un error de sintaxis, verás el mensaje de error en la pantalla de la derecha!
              </p>
            </div>
            <div className="p-4 bg-[#1e1e1e] border-t border-white/10 flex justify-end">
              <button 
                onClick={() => setShowInfo(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium transition-colors"
              >
                ¡Entendido!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-white/10 bg-[#1e1e1e] px-4 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 font-bold text-white shadow-lg">
            CV
          </div>
          <h1 className="text-sm font-semibold tracking-wide text-slate-200 hidden sm:block">
            Editor de CV - Typst
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {isCompiling && (
            <div className="flex items-center gap-2 text-xs text-blue-400 mr-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Compilando...</span>
            </div>
          )}
          
          <button
            onClick={() => setShowInfo(true)}
            className="flex items-center gap-2 rounded-md border border-emerald-600/30 bg-emerald-600/10 px-3 py-1.5 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-600/20"
          >
            <Info className="h-4 w-4" />
            <span className="hidden md:inline">Ayuda</span>
          </button>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`flex items-center gap-2 rounded-md border ${isFullscreen ? 'border-emerald-600 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20' : 'border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800'} px-3 py-1.5 text-sm font-medium transition-colors`}
          >
            {isFullscreen ? (
              <>
                <Minimize className="h-4 w-4" />
                <span className="hidden md:inline">Ver editor</span>
              </>
            ) : (
              <>
                <Maximize className="h-4 w-4" />
                <span className="hidden md:inline">Ver completo</span>
              </>
            )}
          </button>
          
          {!isFullscreen && hasUnsavedChanges && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50 shadow-lg shadow-amber-500/20 animate-in fade-in zoom-in duration-200"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span className="hidden lg:inline">{isSaving ? "Guardando..." : "Guardar cambios"}</span>
            </button>
          )}
          
          <button
            onClick={handleDownload}
            disabled={!pdfUrl || isCompiling}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span className="hidden md:inline">Descargar PDF</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Pane - Editor */}
        {!isFullscreen && (
          <div className="flex w-full md:w-[55%] flex-col border-r border-white/10 shrink-0">
            <div className="flex h-10 items-center justify-between bg-[#252526] px-4 text-xs font-medium uppercase tracking-wider text-slate-400 shrink-0">
              <div className="flex items-center gap-2">
                <span>main.typ</span>
                {hasUnsavedChanges && <span className="w-2 h-2 rounded-full bg-amber-500" title="Cambios sin guardar"></span>}
              </div>
              {error && <span className="text-red-400 normal-case bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20">Error de compilación</span>}
            </div>
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                defaultLanguage="markdown" // Use markdown since typst isn't natively supported, provides okayish fallback
                theme="vs-dark"
                value={code}
                onChange={handleEditorChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: "on",
                  lineNumbers: "on",
                  padding: { top: 16 },
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                }}
              />
            </div>
          </div>
        )}

        {/* Right Pane - PDF Preview */}
        <div className={`relative flex flex-col bg-[#2d2d30] ${isFullscreen ? 'w-full' : 'hidden md:flex md:w-[45%]'}`}>
          <div className="flex h-10 items-center bg-[#252526] px-4 text-xs font-medium uppercase tracking-wider text-slate-400 shrink-0">
            Preview {isFullscreen && "- Pantalla Completa"}
          </div>
          <div className="flex-1 bg-slate-900/50 p-4 relative min-h-0 overflow-auto">
            {error ? (
              <div className="flex h-full items-center justify-center rounded-lg border border-red-500/20 bg-[#1e1e1e] p-6 text-red-400 text-sm shadow-xl m-4">
                <div className="max-w-xl w-full">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    Typst encontró un error
                  </h3>
                  <pre className="whitespace-pre-wrap font-mono bg-black/40 p-4 rounded-md border border-white/5 text-xs overflow-x-auto leading-relaxed">
                    {error}
                  </pre>
                  <p className="mt-4 text-slate-400 text-xs">Corrige el código en el editor de la izquierda y el PDF se regenerará automáticamente.</p>
                </div>
              </div>
            ) : pdfUrl ? (
              <iframe
                src={pdfUrl + "#toolbar=0&navpanes=0&scrollbar=0&view=Fit"}
                className="h-full w-full rounded-md shadow-2xl bg-white"
                title="PDF Preview"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin opacity-50" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
