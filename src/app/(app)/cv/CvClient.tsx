"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Download, Loader2, Maximize, Minimize, Info, X, Save } from "lucide-react";
import { saveCvCode } from "./actions";
import { createTypstCompiler, loadFonts, MemoryAccessModel, FetchPackageRegistry } from "@myriaddreamin/typst.ts";
import { withAccessModel, withPackageRegistry } from "@myriaddreamin/typst.ts/options.init";

let compilerInitPromise: Promise<any> | null = null;
let globalCompiler: any = null;

export function CvClient({ initialCode }: { initialCode: string }) {
  const [code, setCode] = useState(initialCode);
  const [savedCode, setSavedCode] = useState(initialCode);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isCompilerReady, setIsCompilerReady] = useState(false);

  // Refs for compiler and state
  const compilerRef = useRef<any>(null);
  const compileTimeout = useRef<NodeJS.Timeout | null>(null);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize compiler
  useEffect(() => {
    async function initCompiler() {
      try {
        if (globalCompiler) {
          compilerRef.current = globalCompiler;
          setIsCompilerReady(true);
          return;
        }

        if (!compilerInitPromise) {
          compilerInitPromise = (async () => {
            const origin = window.location.origin;
            const compiler = createTypstCompiler();
            const accessModel = new MemoryAccessModel();
            const packageRegistry = new FetchPackageRegistry(accessModel);

            await compiler.init({
              getModule: () => `${origin}/typst_ts_web_compiler_bg.wasm`,
              beforeBuild: [
                loadFonts([
                  `${origin}/fonts/PTSerif-Regular.ttf`,
                  `${origin}/fonts/PTSerif-Bold.ttf`,
                  `${origin}/fonts/PTSerif-Italic.ttf`,
                  `${origin}/fonts/PTSerif-BoldItalic.ttf`,
                ], { assets: false }),
                withAccessModel(accessModel),
                withPackageRegistry(packageRegistry),
              ],
            });

            // Preload template files into VFS
            const libRes = await fetch("/silver-dev-cv/lib.typ");
            const libText = await libRes.text();
            compiler.addSource("/silver-dev-cv/lib.typ", libText);

            const cvRes = await fetch("/silver-dev-cv/template/cv.typ");
            const cvText = await cvRes.text();
            compiler.addSource("/silver-dev-cv/template/cv.typ", cvText);

            globalCompiler = compiler;
            return compiler;
          })();
        }

        const compiler = await compilerInitPromise;
        compilerRef.current = compiler;
        setIsCompilerReady(true);
      } catch (err) {
        console.error("Failed to initialize compiler:", err);
        setError("Error al cargar el compilador Typst (WASM)");
      }
    }
    initCompiler();
  }, []);

  const compilePdf = useCallback(async (currentCode: string) => {
    if (!compilerRef.current) return;
    
    setIsCompiling(true);
    setError(null);
    try {
      const compiler = compilerRef.current;
      compiler.addSource("/main.typ", currentCode);

      const result = await compiler.compile({
        mainFilePath: "/main.typ",
        format: 1, // PDF
        diagnostics: "unix"
      });

      if (!result.result) {
        const diagnostics = result.diagnostics || [];
        throw new Error(diagnostics.length > 0 ? diagnostics.join("\\n") : "Error de compilación de Typst.");
      }

      const blob = new Blob([result.result], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      setPdfUrl((prevUrl) => {
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        return url;
      });
      
      // Warn about diagnostics even on success
      if (result.diagnostics && result.diagnostics.length > 0) {
        console.warn("Typst Compilation warnings:", result.diagnostics.join("\\n"));
      }

    } catch (err: any) {
      setError(err.message || "Un error ocurrió durante la compilación.");
    } finally {
      setIsCompiling(false);
    }
  }, []);

  // Initial compile when ready
  useEffect(() => {
    if (isCompilerReady) {
      compilePdf(code);
    }
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompilerReady]);

  const handleSave = async (codeToSave: string) => {
    setIsSaving(true);
    try {
      await saveCvCode(codeToSave);
      setSavedCode(codeToSave);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || "";
    setCode(newCode);

    // Debounce Compilation
    if (compileTimeout.current) clearTimeout(compileTimeout.current);
    compileTimeout.current = setTimeout(() => {
      if (isCompilerReady) compilePdf(newCode);
    }, 500);

    // Debounce Autosave
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      handleSave(newCode);
    }, 2000);
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

  if (!isCompilerReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#1e1e1e] text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Cargando compilador de Typst (WASM)...</span>
      </div>
    );
  }

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
                Este es un editor de currículums basado en <strong className="text-white">Typst</strong>, corriendo íntegramente en el navegador usando WASM.
              </p>
              <div className="bg-[#1e1e1e] p-3 rounded-lg border border-white/5 space-y-3">
                <p><span className="text-blue-400 font-mono">#import</span>: Usa una plantilla de diseño local (silver-dev-cv).</p>
                <p><span className="text-blue-400 font-mono">#section</span>: Crea un título de sección (ej: Experiencia, Educación).</p>
                <p><span className="text-emerald-400 font-mono">[Texto entre corchetes]</span>: Es el contenido visual que se imprimirá en el PDF.</p>
              </div>
              <p>
                <strong className="text-white">¿Cómo funciona?</strong> Solo edita tu información en el código de la izquierda. El sistema compilará y actualizará tu PDF a la derecha automáticamente y se guardará en tu cuenta (Autosave cada 2 segundos).
              </p>
            </div>
            <div className="p-4 bg-[#1e1e1e] border-t border-white/10 flex justify-between items-center">
              <a 
                href="https://typst.app/universe/search/?category=cv" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 text-sm font-medium underline underline-offset-2 transition-colors"
              >
                Ver más templates de Typst
              </a>
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
            Editor de CV - Typst (Client)
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs mr-2 transition-colors">
            {isCompiling ? (
              <span className="text-blue-400 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Compilando...</span>
            ) : isSaving ? (
              <span className="text-amber-400 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Guardando...</span>
            ) : hasUnsavedChanges ? (
              <span className="text-amber-500">Sin guardar</span>
            ) : (
              <span className="text-emerald-500">Guardado</span>
            )}
          </div>
          
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
              </div>
              {error && <span className="text-red-400 normal-case bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20">Error de compilación</span>}
            </div>
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                defaultLanguage="markdown"
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
