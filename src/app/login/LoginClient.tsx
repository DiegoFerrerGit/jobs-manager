"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Star, PenLine, MapPin, Calendar, CheckCircle2, AlertTriangle } from "lucide-react";
import Spinner from "@/components/Spinner";

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginClient({ clientId }: { clientId: string }) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mode, setMode] = useState<"login" | "beta">("login");
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const gsiRef = useRef<HTMLDivElement>(null);
  const googleInit = useRef(false);

  const slides = [
    {
      id: "hunter",
      title: "Ofertas que de verdad te pueden contratar",
      desc: "Avisos de cientos de empresas, filtrados por si realmente contratan desde LATAM."
    },
    {
      id: "tracker",
      title: "Seguí cada proceso y aprendé de los que se caen",
      desc: "Un tablero por etapa, y métricas que te dicen dónde y por qué se te cierran los procesos."
    },
    {
      id: "cv",
      title: "Tu currículum como código, listo para cada postulación",
      desc: "Escribe tu CV en formato texto y genera PDFs perfectos con diseño profesional en tiempo real."
    },
    {
      id: "ai",
      title: "La IA lee cada aviso y lo mide contra tu CV",
      desc: "Convierte dos mil avisos escritos de dos mil formas en campos comparables. Y te dice cuáles encajan con vos, y por qué."
    }
  ];

  const startTimer = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % 4);
    }, 6000);
  }, []);

  useEffect(() => {
    if (!isHovered) startTimer();
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [isHovered, startTimer]);

  const goToSlide = (index: number) => {
    setActiveIndex((index + 4) % 4);
    startTimer();
  };

  const nextSlide = () => {
    setActiveIndex(prev => (prev + 1) % 4);
    startTimer();
  };

  const prevSlide = () => {
    setActiveIndex(prev => (prev - 1 + 3) % 3);
    startTimer();
  };

  useEffect(() => {
    if (mode !== "login") return;

    const loadGoogle = () => {
      if (window.google && !googleInit.current) {
        googleInit.current = true;
        window.google.accounts.id.initialize({
          client_id: clientId,
          locale: "es-419",
          callback: async (response: any) => {
            try {
              setError("");
              const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken: response.credential }),
              });

              const data = await res.json();
              if (res.ok) {
                window.location.href = "/";
              } else {
                setError(data.error || "Error al iniciar sesión");
              }
            } catch (e) {
              setError("Error de red");
            }
          },
        });
        if (gsiRef.current) {
          window.google.accounts.id.renderButton(
            gsiRef.current,
            { theme: "outline", size: "large", shape: "pill", text: "continue_with", logo_alignment: "left", width: 360, locale: "es-419" }
          );
        }
        if (process.env.NODE_ENV === 'production') {
          window.google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
              console.debug('One Tap no disponible:', notification.getNotDisplayedReason?.());
            }
          });
        }
      }
    };

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client?hl=es-419";
    script.async = true;
    script.defer = true;
    script.onload = loadGoogle;

    if (window.google) {
      loadGoogle();
    } else {
      document.body.appendChild(script);
    }

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [clientId, mode]);

  const handleBetaSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, signup_secret: secret }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || "Agregado a la allowlist.");
        setEmail("");
        setSecret("");
        setTimeout(() => setMode("login"), 2000);
      } else {
        setError(data.error || "Error al registrar");
      }
    } catch (e) {
      setError("Error de red");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh' }} className="overflow-hidden bg-white">

      {/* LEFT SIDE */}
      <div style={{ flex: '1 1 50%', minWidth: 0, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 48, background: '#FAFAF8' }}>

        {/* Content Centered */}
        <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 30 }}>
            <img src="/branding/logo-mark-animated.svg" alt="" width={56} height={56} />
            <span style={{ marginTop: 10, fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 17, fontWeight: 600, letterSpacing: '0.01em', color: '#5B6B63' }}>The Jobs Manager</span>
          </div>

          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', color: '#0E1512', textAlign: 'center', margin: 0 }}>Entrá a tu cuenta</h1>
          <p style={{ marginTop: 10, fontSize: 15, lineHeight: '22px', color: '#5B6B63', textAlign: 'center', maxWidth: 340 }}>Usá tu cuenta de Google. Si ya entraste antes, seguís donde lo dejaste.</p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 text-center w-full border border-red-100">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-sm mb-6 text-center w-full border border-emerald-100">
              {success}
            </div>
          )}

          {mode === "login" ? (
            <div className="w-full flex flex-col items-center">
              {/* Google Button Overlay Wrapper */}
              <div style={{ position: 'relative', width: '100%', maxWidth: 360, height: 52, marginTop: 32 }}>

                {/* Capa VISIBLE: nuestro boton. No recibe clicks. */}
                <div aria-hidden="true" style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 10, background: '#FFFFFF', border: '1px solid #E3E7E4',
                  borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#0E1512',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continuar con Google
                </div>

                {/* Capa REAL: el boton de Google, invisible, arriba de todo */}
                <div ref={gsiRef} className="gsi-overlay" style={{
                  position: 'absolute', inset: 0, opacity: 0, zIndex: 2,
                  overflow: 'hidden'
                }} />
              </div>

              {/* Waitlist note box */}
              <div style={{ marginTop: 24, width: '100%', background: '#F2F5F3', border: '1px solid #E8ECEA', borderRadius: 10, padding: '13px 16px', textAlign: 'center', fontSize: 13, lineHeight: '19px', color: '#5B6B63' }}>
                <div>El acceso está por lista de espera.</div>
                <button
                  onClick={() => { setMode("beta"); setError(""); setSuccess(""); }}
                  style={{ color: '#00744A', fontWeight: 500, textDecoration: 'none' }}
                  className="hover:underline mt-1"
                >
                  ¿Tenés un código beta? Activá tu acceso.
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBetaSignup} className="w-full flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5 ml-1">Email (El mismo de Google)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5 ml-1">Código Secreto</label>
                <input
                  type="password"
                  required
                  value={secret}
                  onChange={e => setSecret(e.target.value)}
                  placeholder="BETA_SIGNUP_SECRET"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl px-4 py-3 mt-2 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Spinner className="w-5 h-5 text-white" />
                    <span>Validando...</span>
                  </div>
                ) : "Habilitar Acceso"}
              </button>
              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors mt-3 text-center"
              >
                Volver al inicio de sesión
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: 28, left: 48, right: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, color: '#8A9490' }}>
          <span>© 2026 The Jobs Manager</span>
          <div>
            <a href="/terms" style={{ color: '#8A9490', textDecoration: 'none' }} className="hover:text-[#0E1512]">Términos</a>
            <a href="/privacy" style={{ color: '#8A9490', textDecoration: 'none', marginLeft: 20 }} className="hover:text-[#0E1512]">Privacidad</a>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE (Redesigned completely) */}
      <div
        className="hidden min-[1200px]:flex bg-gradient-to-br from-[#06241d] to-[#020e0b] relative flex-col overflow-hidden"
        style={{ flex: '1 1 50%', minWidth: 0 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Subtle Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px]"></div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          aria-label="Anterior"
          className="absolute left-6 top-1/2 -translate-y-1/2 p-3 text-white opacity-40 hover:opacity-100 transition-opacity cursor-pointer z-50 rounded-full hover:bg-white/5"
        >
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>

        <button
          onClick={nextSlide}
          aria-label="Siguiente"
          className="absolute right-6 top-1/2 -translate-y-1/2 p-3 text-white opacity-40 hover:opacity-100 transition-opacity cursor-pointer z-50 rounded-full hover:bg-white/5"
        >
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>

        {/* Main flex column: A (mock) + B (text) + C (dots) */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full w-full" style={{ padding: '40px 56px', boxSizing: 'border-box' }}>

          {/* Block A — mock area: grows, shrinks, never overflows */}
          <div className="w-full" style={{ position: 'relative', height: 470, maxWidth: 620, flex: '1 1 auto', overflow: 'hidden', pointerEvents: 'none', userSelect: 'none', background: 'transparent', border: 'none' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >

                {/* HUNTER MOCKUP */}
                {activeIndex === 0 && (
                  <div style={{ width: '100%', height: 'auto', background: '#121215', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,0.35)', padding: 18, display: 'flex', flexDirection: 'column', gap: 12, cursor: 'default' }}>

                    {/* Top Bar Filter */}
                    <div className="flex items-center gap-3" style={{ flex: '0 0 38px' }}>
                      <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-[10px] h-[38px] flex items-center px-3 gap-2">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-zinc-500"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input type="text" placeholder="Buscar por rol o empresa" className="bg-transparent text-[13px] text-zinc-300 outline-none w-full placeholder:text-zinc-500" readOnly />
                      </div>
                      <div className="flex gap-2">
                        <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium px-3 py-[9px] rounded-[10px]">Argentina</span>
                        <span className="border border-white/10 text-zinc-400 text-xs font-medium px-3 py-[9px] rounded-[10px]">LATAM</span>
                        <span className="border border-white/10 text-zinc-400 text-xs font-medium px-3 py-[9px] rounded-[10px]">Remoto</span>
                      </div>
                    </div>

                    {/* Card 1 */}
                    <div className="bg-[#1e1e24] border border-white/5 rounded-[12px] relative shadow-lg flex flex-col overflow-hidden" style={{ flex: '0 1 auto', padding: '16px 18px' }}>
                      <div className="flex gap-2 mb-2" style={{ flex: '0 0 auto' }}>
                        <span className="bg-red-500/10 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Alta</span>
                        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">LATAM Ok</span>
                        <span className="bg-purple-500/10 text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Ashby</span>
                      </div>
                      <h3 className="text-white font-bold text-[17px] leading-tight overflow-hidden text-ellipsis whitespace-nowrap" style={{ flex: '0 0 auto' }}>Engineering Manager – Growth Foundations</h3>

                      <div className="flex items-center gap-1.5 text-[13px] mt-1.5" style={{ flex: '0 0 auto' }}>
                        <svg width="14" height="14" fill="currentColor" className="text-amber-400 shrink-0" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                        <span className="text-emerald-400 font-medium">kraken.com</span>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-emerald-400/60 ml-0.5 shrink-0"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5l13.732-13.732z" /></svg>
                        <span className="text-zinc-500 font-bold mx-0.5">·</span>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0" style={{ color: '#38BDF8' }}><path d="M12 21s-8-4.5-8-11.8A8 8 0 0112 1.2a8 8 0 018 8C20 16.5 12 21 12 21z" /><circle cx="12" cy="9.2" r="2.5" /></svg>
                        <span style={{ color: '#B8C5BE' }}>Poland</span>
                      </div>

                      <div className="flex items-center gap-2 text-[13px] mt-1 overflow-hidden text-ellipsis whitespace-nowrap" style={{ flex: '0 0 auto', color: '#B8C5BE' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0" style={{ color: '#38BDF8' }}><path d="M12 21s-8-4.5-8-11.8A8 8 0 0112 1.2a8 8 0 018 8C20 16.5 12 21 12 21z" /><circle cx="12" cy="9.2" r="2.5" /></svg>
                        Remote | United Kingdom | Brazil | Argentina
                      </div>

                      <div className="flex items-center gap-2 text-[13px] mt-1" style={{ flex: '0 0 auto', color: '#B8C5BE' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0" style={{ color: '#FB923C' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                        2026-09-18
                      </div>

                      <div style={{ flex: '0 0 auto', marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                        <button tabIndex={-1} aria-hidden="true" className="bg-emerald-600 text-white text-[13px] py-2 rounded-[10px] font-medium flex items-center gap-2" style={{ paddingLeft: 24, paddingRight: 24, cursor: 'default' }}>
                          Aplicar
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </button>
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-[#1e1e24] border border-white/5 rounded-[12px] relative shadow-lg flex flex-col overflow-hidden" style={{ flex: '0 1 auto', padding: '16px 18px' }}>
                      <div className="flex gap-2 mb-2" style={{ flex: '0 0 auto' }}>
                        <span className="bg-red-500/10 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Alta</span>
                        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">LATAM Ok</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider" style={{ background: 'rgba(255,122,47,0.14)', color: '#FF9A5C' }}>Y Combinator</span>
                      </div>
                      <h3 className="text-white font-bold text-[17px] leading-tight overflow-hidden text-ellipsis whitespace-nowrap" style={{ flex: '0 0 auto' }}>Manager, Product Support Engineer</h3>

                      <div className="flex items-center gap-1.5 text-[13px] mt-1.5" style={{ flex: '0 0 auto' }}>
                        <svg width="14" height="14" fill="currentColor" className="text-amber-400 shrink-0" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                        <span className="text-emerald-400 font-medium">Proofpoint</span>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-emerald-400/60 ml-0.5 shrink-0"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5l13.732-13.732z" /></svg>
                        <span className="text-zinc-500 font-bold mx-0.5">·</span>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0" style={{ color: '#38BDF8' }}><path d="M12 21s-8-4.5-8-11.8A8 8 0 0112 1.2a8 8 0 018 8C20 16.5 12 21 12 21z" /><circle cx="12" cy="9.2" r="2.5" /></svg>
                        <span style={{ color: '#B8C5BE' }}>2 Locations</span>
                      </div>

                      <div className="flex items-center gap-2 text-[13px] mt-1 overflow-hidden text-ellipsis whitespace-nowrap" style={{ flex: '0 0 auto', color: '#B8C5BE' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0" style={{ color: '#38BDF8' }}><path d="M12 21s-8-4.5-8-11.8A8 8 0 0112 1.2a8 8 0 018 8C20 16.5 12 21 12 21z" /><circle cx="12" cy="9.2" r="2.5" /></svg>
                        Cordoba, Argentina
                      </div>

                      <div className="flex items-center gap-2 text-[13px] mt-1" style={{ flex: '0 0 auto', color: '#B8C5BE' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0" style={{ color: '#FB923C' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                        2026-09-01
                      </div>

                      <div style={{ flex: '0 0 auto', marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                        <button tabIndex={-1} aria-hidden="true" className="bg-emerald-600 text-white text-[13px] py-2 rounded-[10px] font-medium flex items-center gap-2" style={{ paddingLeft: 24, paddingRight: 24, cursor: 'default' }}>
                          Aplicar
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TRACKER MOCKUP */}
                {activeIndex === 1 && (
                  <div style={{ width: '100%', height: 'auto', background: '#121215', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,0.35)', padding: 18, display: 'flex', flexDirection: 'column', gap: 14, cursor: 'default', pointerEvents: 'none', userSelect: 'none' }}>

                    {/* Module header bar */}
                    <div className="flex items-center gap-2 mb-3.5" style={{ height: 30, flexShrink: 0 }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" style={{ color: '#8A9A92', flexShrink: 0 }}>
                        <rect x="3" y="3" width="4" height="18" rx="1" fill="currentColor" />
                        <rect x="10" y="7" width="4" height="14" rx="1" fill="currentColor" />
                        <rect x="17" y="5" width="4" height="16" rx="1" fill="currentColor" />
                      </svg>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#E8EEEA' }}>Jobs Tracking</span>
                      <span style={{ fontSize: 11, color: '#5E6E66', marginLeft: 'auto' }}>3 procesos activos</span>
                    </div>

                    {/* 3-column kanban grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, alignItems: 'start', flexShrink: 0 }}>

                      {/* Col 1 — People / Screening */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ background: 'rgba(249,115,22,0.22)', color: '#FDBA74', fontSize: 10.5, fontWeight: 600, padding: '3px 9px', borderRadius: 6, whiteSpace: 'nowrap' }}>People / Screening</span>
                          <span style={{ fontSize: 11, color: '#8A9A92' }}>2</span>
                        </div>
                        {/* Card 1 */}
                        <div style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.18)', borderRadius: 10, padding: '10px 12px' }}>
                          <div style={{ color: '#E8EEEA', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Nubank</div>
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 7 }}>
                            <span style={{ background: 'rgba(59,130,246,0.18)', color: '#93C5FD', fontSize: 9.5, padding: '3px 7px', borderRadius: 5, whiteSpace: 'nowrap', fontWeight: 600 }}>Brasil</span>
                            <span style={{ background: 'rgba(59,130,246,0.18)', color: '#93C5FD', fontSize: 9.5, padding: '3px 7px', borderRadius: 5, whiteSpace: 'nowrap', fontWeight: 600 }}>Engineering Manager</span>
                          </div>
                          <div style={{ color: '#34D399', fontWeight: 700, fontSize: 12.5, lineHeight: 1.3 }}>US$ 180,000</div>
                          <div style={{ color: '#34D399', opacity: 0.85, fontWeight: 600, fontSize: 10.5 }}>US$ 15,000 / mes</div>
                        </div>
                        {/* Card 2 */}
                        <div style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.18)', borderRadius: 10, padding: '10px 12px' }}>
                          <div style={{ color: '#E8EEEA', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Google</div>
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 7 }}>
                            <span style={{ background: 'rgba(167,139,250,0.18)', color: '#C4B5FD', fontSize: 9.5, padding: '3px 7px', borderRadius: 5, whiteSpace: 'nowrap', fontWeight: 600 }}>LATAM</span>
                            <span style={{ background: 'rgba(249,115,22,0.18)', color: '#FDBA74', fontSize: 9.5, padding: '3px 7px', borderRadius: 5, whiteSpace: 'nowrap', fontWeight: 600 }}>Engineering Lead</span>
                          </div>
                          <div style={{ color: '#34D399', fontWeight: 700, fontSize: 12.5, lineHeight: 1.3 }}>US$ 120,000</div>
                          <div style={{ color: '#34D399', opacity: 0.85, fontWeight: 600, fontSize: 10.5 }}>US$ 10,000 / mes</div>
                        </div>
                      </div>

                      {/* Col 2 — Hiring Manager */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ background: 'rgba(236,72,153,0.22)', color: '#F9A8D4', fontSize: 10.5, fontWeight: 600, padding: '3px 9px', borderRadius: 6, whiteSpace: 'nowrap' }}>Hiring Manager</span>
                          <span style={{ fontSize: 11, color: '#8A9A92' }}>1</span>
                        </div>
                        {/* Card */}
                        <div style={{ background: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.18)', borderRadius: 10, padding: '10px 12px' }}>
                          <div style={{ color: '#E8EEEA', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>SpaceX</div>
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 7 }}>
                            <span style={{ background: 'rgba(16,185,129,0.18)', color: '#6EE7B7', fontSize: 9.5, padding: '3px 7px', borderRadius: 5, whiteSpace: 'nowrap', fontWeight: 600 }}>US</span>
                            <span style={{ background: 'rgba(167,139,250,0.18)', color: '#C4B5FD', fontSize: 9.5, padding: '3px 7px', borderRadius: 5, whiteSpace: 'nowrap', fontWeight: 600 }}>Director of Engineering</span>
                          </div>
                          <div style={{ color: '#34D399', fontWeight: 700, fontSize: 12.5, lineHeight: 1.3 }}>US$ 240,000</div>
                          <div style={{ color: '#34D399', opacity: 0.85, fontWeight: 600, fontSize: 10.5 }}>US$ 20,000 / mes</div>
                        </div>
                      </div>

                      {/* Col 3 — Técnica (empty, short box) */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ background: 'rgba(167,139,250,0.22)', color: '#C4B5FD', fontSize: 10.5, fontWeight: 600, padding: '3px 9px', borderRadius: 6, whiteSpace: 'nowrap' }}>Técnica</span>
                          <span style={{ fontSize: 11, color: '#8A9A92' }}>0</span>
                        </div>
                        <div style={{ minHeight: 110, background: 'rgba(167,139,250,0.03)', border: '1px solid rgba(167,139,250,0.10)', borderRadius: 10 }}></div>
                      </div>

                    </div>

                    {/* Block B — Metrics */}
                    <div className="bg-[#121215] border border-white/5 rounded-xl flex items-center gap-5" style={{ marginTop: 0, flexShrink: 0, padding: '18px 16px' }}>

                      {/* Donut — built with SVG conic-gradient trick via nested absolutely positioned divs */}
                      <div style={{ position: 'relative', width: 128, height: 128, flexShrink: 0 }}>
                        <svg width="128" height="128" viewBox="0 0 128 128" style={{ position: 'absolute', top: 0, left: 0 }}>
                          <circle cx="64" cy="64" r="48" fill="none" stroke="#1f2a24" strokeWidth="16" />
                          <circle cx="64" cy="64" r="48" fill="none" stroke="#10B981" strokeWidth="16"
                            strokeDasharray={`${0.28 * 301.6} ${301.6}`}
                            strokeDashoffset="0"
                            transform="rotate(-90 64 64)"
                          />
                          <circle cx="64" cy="64" r="48" fill="none" stroke="#F97316" strokeWidth="16"
                            strokeDasharray={`${0.20 * 301.6} ${301.6}`}
                            strokeDashoffset={`${-(0.28 * 301.6)}`}
                            transform="rotate(-90 64 64)"
                          />
                          <circle cx="64" cy="64" r="48" fill="none" stroke="#EC4899" strokeWidth="16"
                            strokeDasharray={`${0.20 * 301.6} ${301.6}`}
                            strokeDashoffset={`${-(0.48 * 301.6)}`}
                            transform="rotate(-90 64 64)"
                          />
                          <circle cx="64" cy="64" r="48" fill="none" stroke="#8B5CF6" strokeWidth="16"
                            strokeDasharray={`${0.32 * 301.6} ${301.6}`}
                            strokeDashoffset={`${-(0.68 * 301.6)}`}
                            transform="rotate(-90 64 64)"
                          />
                          <text x="64" y="60" textAnchor="middle" dominantBaseline="middle" fill="white" fontWeight="700" fontSize="30">25</text>
                          <text x="64" y="78" textAnchor="middle" dominantBaseline="middle" fill="#5E6E66" fontWeight="700" fontSize="9" letterSpacing="0.14em">PROCESOS</text>
                        </svg>
                      </div>

                      {/* Legend */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.07)', paddingRight: 16 }}>
                        {[
                          { color: '#10B981', label: 'Nivel Inglés', pct: '28%' },
                          { color: '#F97316', label: 'Filtro Técnico', pct: '20%' },
                          { color: '#EC4899', label: 'Ghosting', pct: '20%' },
                          { color: '#8B5CF6', label: 'Otras', pct: '32%' },
                        ].map(({ color, label, pct }) => (
                          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                            <div style={{ width: 9, height: 9, borderRadius: 2, background: color, flexShrink: 0 }}></div>
                            <span style={{ color: '#B8C5BE' }}>{label}</span>
                            <span style={{ color: '#5E6E66', fontWeight: 700, marginLeft: 'auto', paddingLeft: 8 }}>{pct}</span>
                          </div>
                        ))}
                      </div>

                      {/* Right Text */}
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ color: 'white', fontWeight: 700, fontSize: 18, lineHeight: 1.25, marginBottom: 5 }}>25 procesos cerrados</div>
                        <div style={{ color: '#8A9A92', fontSize: 13 }}>People es donde más se cae</div>
                      </div>

                    </div>
                  </div>
                )}


                {/* CV MOCKUP */}
                {activeIndex === 2 && (
                  <div style={{ width: '100%', height: 'auto', background: '#121215', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,0.35)', padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'default', pointerEvents: 'none', userSelect: 'none' }}>

                    {/* Editor chrome bar */}
                    <div style={{ height: 38, background: '#0C1210', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 14px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2E3A34' }}></div>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2E3A34' }}></div>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2E3A34' }}></div>
                      <span style={{ fontFamily: 'monospace', fontSize: 11.5, color: '#8A9A92', marginLeft: 8 }}>cv.typ</span>
                      <span style={{ marginLeft: 'auto', background: 'rgba(0,201,122,0.14)', color: '#34D399', fontSize: 10, padding: '3px 10px', borderRadius: 6 }}>PDF actualizado</span>
                    </div>

                    {/* Two-panel body */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', height: 'auto', alignItems: 'stretch' }}>

                      {/* Left: code with line numbers */}
                      <div style={{ background: '#0C1210', padding: '16px 0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 'auto', justifyContent: 'flex-start' }}>
                        {[
                          { n: 1, code: <><span style={{ color: '#C792EA' }}>#let</span> <span style={{ color: '#C7D2CC' }}>cv(name, title, body) = {'{'}</span></> },
                          { n: 2, code: <><span style={{ color: '#82AAFF' }}>  set</span> <span style={{ color: '#82AAFF' }}>text</span><span style={{ color: '#C7D2CC' }}>(font: </span><span style={{ color: '#C3E88D' }}>"Inter"</span><span style={{ color: '#C7D2CC' }}>, size: 10pt)</span></> },
                          { n: 3, code: <><span style={{ color: '#82AAFF' }}>  align</span><span style={{ color: '#C7D2CC' }}>(center)[</span></> },
                          { n: 4, code: <><span style={{ color: '#C792EA' }}>    #text</span><span style={{ color: '#C7D2CC' }}>(17pt, weight: 700)[</span><span style={{ color: '#C792EA' }}>#name</span><span style={{ color: '#C7D2CC' }}>]</span></> },
                          { n: 5, code: <><span style={{ color: '#C792EA' }}>    #v</span><span style={{ color: '#C7D2CC' }}>(2pt)</span></> },
                          { n: 6, code: <><span style={{ color: '#C792EA' }}>    #text</span><span style={{ color: '#C7D2CC' }}>(9pt, fill: gray)[</span><span style={{ color: '#C792EA' }}>#title</span><span style={{ color: '#C7D2CC' }}>]</span></> },
                          { n: 7, code: <><span style={{ color: '#C7D2CC' }}>  ]</span></> },
                          { n: 8, code: <><span style={{ color: '#82AAFF' }}>  line</span><span style={{ color: '#C7D2CC' }}>(length: 100%)</span></> },
                          { n: 9, code: <><span style={{ color: '#C7D2CC' }}>  body</span></> },
                          { n: 10, code: <><span style={{ color: '#C7D2CC' }}>{'}'}</span></> },
                          { n: 11, code: null },
                          { n: 12, code: <><span style={{ color: '#F97316' }}>=</span> <span style={{ color: '#C7D2CC' }}>Experience</span></> },
                          { n: 13, code: null },
                          { n: 14, code: <><span style={{ color: '#FB923C' }}>{`== Engineering Manager`}</span></> },
                          { n: 15, code: <><span style={{ color: '#7E8B84', fontStyle: 'italic' }}>_Stripe (2022 - Present)_</span></> },
                          { n: 16, code: <><span style={{ color: '#C7D2CC' }}>- Led a team of 15 engineers</span></> },
                          { n: 17, code: <><span style={{ color: '#C7D2CC' }}>- Architected the ledger system</span></> },
                          { n: 18, code: <><span style={{ color: '#C7D2CC' }}>- Improved team velocity by 40%</span></> },
                          { n: 19, code: null },
                          { n: 20, code: <><span style={{ color: '#FB923C' }}>{`== Senior Frontend Engineer`}</span></> },
                          { n: 21, code: <><span style={{ color: '#7E8B84', fontStyle: 'italic' }}>_Coinbase (2019 - 2022)_</span></> },
                          { n: 22, code: <><span style={{ color: '#C7D2CC' }}>- Rebuilt the trading dashboard</span></> },
                        ].map(({ n, code }) => (
                          <div key={n} style={{ display: 'flex', lineHeight: '18px', flexShrink: 0 }}>
                            <span style={{ width: 30, textAlign: 'right', paddingRight: 10, color: '#3F4C46', fontSize: 10.5, fontFamily: 'monospace', flexShrink: 0 }}>{n}</span>
                            <span style={{ fontFamily: 'monospace', fontSize: 10.5, whiteSpace: 'pre', color: '#C7D2CC' }}>{code ?? '\u00a0'}</span>
                          </div>
                        ))}
                      </div>

                      {/* Divider */}
                      <div style={{ background: 'rgba(255,255,255,0.08)' }}></div>

                      {/* Right: A4 sheet */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 20px', background: 'transparent' }}>
                        <div style={{ height: 391, width: 277, background: '#FFFFFF', borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.45)', padding: '22px 24px', boxSizing: 'border-box', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                          {/* Name */}
                          <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', color: '#111', marginBottom: 3 }}>ALEX MORGAN</div>
                          <div style={{ textAlign: 'center', fontSize: 6.5, color: '#666', marginBottom: 10 }}>Engineering Manager · Buenos Aires · alex@mail.com</div>
                          <div style={{ height: 1.5, background: '#111', marginBottom: 12 }}></div>

                          {/* Experience */}
                          <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.16em', color: '#0E9F6E', marginBottom: 5 }}>EXPERIENCE</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                            <span style={{ fontSize: 8, fontWeight: 700, color: '#111' }}>Engineering Manager, Stripe</span>
                            <span style={{ fontSize: 6.5, color: '#666' }}>2022 – Present</span>
                          </div>
                          <div style={{ height: 3.5, background: '#D9DEDB', borderRadius: 2, marginBottom: 5, width: '100%' }}></div>
                          <div style={{ height: 3.5, background: '#D9DEDB', borderRadius: 2, marginBottom: 5, width: '92%' }}></div>
                          <div style={{ height: 3.5, background: '#D9DEDB', borderRadius: 2, marginBottom: 14, width: '68%' }}></div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                            <span style={{ fontSize: 8, fontWeight: 700, color: '#111' }}>Senior Frontend, Coinbase</span>
                            <span style={{ fontSize: 6.5, color: '#666' }}>2019 – 2022</span>
                          </div>
                          <div style={{ height: 3.5, background: '#D9DEDB', borderRadius: 2, marginBottom: 5, width: '100%' }}></div>
                          <div style={{ height: 3.5, background: '#D9DEDB', borderRadius: 2, marginBottom: 5, width: '86%' }}></div>
                          <div style={{ height: 3.5, background: '#D9DEDB', borderRadius: 2, marginBottom: 14, width: '61%' }}></div>

                          {/* Skills */}
                          <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.16em', color: '#0E9F6E', marginBottom: 5 }}>SKILLS</div>
                          <div style={{ height: 3.5, background: '#D9DEDB', borderRadius: 2, marginBottom: 5, width: '100%' }}></div>
                          <div style={{ height: 3.5, background: '#D9DEDB', borderRadius: 2, marginBottom: 14, width: '74%' }}></div>

                          {/* Education */}
                          <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.16em', color: '#0E9F6E', marginBottom: 5 }}>EDUCATION</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                            <span style={{ fontSize: 8, fontWeight: 700, color: '#111' }}>Ing. en Sistemas, UBA</span>
                            <span style={{ fontSize: 6.5, color: '#666' }}>2014 – 2019</span>
                          </div>
                          <div style={{ height: 3.5, background: '#D9DEDB', borderRadius: 2, marginBottom: 5, width: '88%' }}></div>
                          <div style={{ height: 3.5, background: '#D9DEDB', borderRadius: 2, marginBottom: 14, width: '62%' }}></div>

                          {/* Languages */}
                          <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.16em', color: '#0E9F6E', marginBottom: 5 }}>LANGUAGES</div>
                          <div style={{ height: 3.5, background: '#D9DEDB', borderRadius: 2, marginBottom: 5, width: '72%' }}></div>
                          <div style={{ height: 3.5, background: '#D9DEDB', borderRadius: 2, marginBottom: 0, width: '48%' }}></div>

                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* AI Match MOCKUP */}
                {activeIndex === 3 && (
                  <div style={{ width: '100%', height: 'auto', background: '#121215', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,0.35)', padding: 18, display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'default', pointerEvents: 'none', userSelect: 'none' }}>

                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#E8EEEA' }}>Match con tu perfil</span>
                      <span style={{ background: 'rgba(0,201,122,0.14)', color: '#34D399', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', padding: '3px 10px', borderRadius: 6 }}>PRÓXIMAMENTE</span>
                    </div>

                    {/* Job card with score */}
                    <div style={{ background: '#141A17', border: '1px solid #1F2B25', borderRadius: 14, padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      {/* Left column */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.02em', background: 'rgba(239,68,68,0.15)', color: '#EF4444', padding: '2px 8px', borderRadius: 4 }}>Alta</span>
                          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.02em', background: 'rgba(16,185,129,0.15)', color: '#10B981', padding: '2px 8px', borderRadius: 4 }}>LATAM Ok</span>
                          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.02em', background: 'rgba(168,85,247,0.15)', color: '#A855F7', padding: '2px 8px', borderRadius: 4 }}>Ashby</span>
                        </div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#E8EEEA', margin: 0 }}>Staff Engineer – Payments</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8A9A92' }}>
                          <Star className="w-3.5 h-3.5 text-yellow-500" />
                          <span style={{ color: '#34D399', fontWeight: 500 }}>nubank.com</span>
                          <PenLine className="w-3 h-3" />
                          <span>·</span>
                          <MapPin className="w-3.5 h-3.5 text-sky-400" />
                          <span>São Paulo</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8A9A92' }}>
                          <MapPin className="w-3.5 h-3.5 text-sky-400" />
                          <span>Remote | Brazil | Argentina</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8A9A92' }}>
                          <Calendar className="w-3.5 h-3.5 text-orange-400" />
                          <span>2026-09-22</span>
                        </div>
                      </div>

                      {/* Right column (Score Ring) */}
                      <div style={{ width: 110, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ position: 'relative', width: 86, height: 86 }}>
                          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                            <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" />
                            <circle cx="50" cy="50" r="36" fill="none" stroke="#00C97A" strokeWidth="9" strokeLinecap="round" strokeDasharray="226.19" strokeDashoffset="29.4" />
                          </svg>
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 20, fontWeight: 700, color: '#E8EEEA' }}>87%</span>
                          </div>
                        </div>
                        <span style={{ marginTop: 6, fontSize: 10, color: '#8A9A92' }}>para tu perfil</span>
                      </div>
                    </div>

                    {/* Grid header */}
                    <div style={{ fontSize: 9.5, letterSpacing: '0.12em', color: '#5E6E66', marginBottom: 10 }}>LO QUE LA IA LEYÓ DEL AVISO</div>

                    {/* Info grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 28, rowGap: 0, marginBottom: 12 }}>
                      {/* Column 1 */}
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 26, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ fontSize: 11, color: '#5E6E66' }}>Elegibilidad</span>
                          <span style={{ fontSize: 11.5, fontWeight: 500, color: '#E8EEEA' }}>Argentina · Brasil · Uruguay</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 26, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ fontSize: 11, color: '#5E6E66' }}>Contratación</span>
                          <span style={{ fontSize: 11.5, fontWeight: 500, color: '#E8EEEA' }}>EOR, sin visa</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 26, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ fontSize: 11, color: '#5E6E66' }}>Remoto</span>
                          <span style={{ fontSize: 11.5, fontWeight: 500, color: '#E8EEEA' }}>Real, sin oficina</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 26 }}>
                          <span style={{ fontSize: 11, color: '#5E6E66' }}>Seniority</span>
                          <span style={{ fontSize: 11.5, fontWeight: 500, color: '#E8EEEA' }}>Staff</span>
                        </div>
                      </div>

                      {/* Column 2 */}
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 26, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ fontSize: 11, color: '#5E6E66' }}>Stack</span>
                          <span style={{ fontSize: 11.5, fontWeight: 500, color: '#E8EEEA' }}>Go · Postgres · K8s</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 26, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ fontSize: 11, color: '#5E6E66' }}>Salario</span>
                          <span style={{ fontSize: 11.5, fontWeight: 500, color: '#E8EEEA' }}>US$ 180k – 220k</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 26, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ fontSize: 11, color: '#5E6E66' }}>Inglés</span>
                          <span style={{ fontSize: 11.5, fontWeight: 500, color: '#FBBF24' }}>Avanzado, excluyente</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 26 }}>
                          <span style={{ fontSize: 11, color: '#5E6E66' }}>Tus skills</span>
                          <span style={{ fontSize: 11.5, fontWeight: 500, color: '#34D399' }}>7 de 9</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ fontSize: 11.5, color: '#5E6E66', textAlign: 'left' }}>
                      La IA lee el aviso una sola vez y lo guarda como datos. El match se calcula contra tu CV.
                    </div>

                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Block B — title + subtitle */}
          <div className="relative w-full text-center" style={{ flex: '0 0 auto', marginTop: 24, maxWidth: 520 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col items-center text-center"
              >
                <h2 className="text-white text-[28px] font-bold tracking-tight mb-2 leading-tight" style={{ textWrap: 'balance' as any, maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>
                  {slides[activeIndex].title}
                </h2>
                <p className="text-white opacity-70 text-[15px] leading-relaxed mx-auto">
                  {slides[activeIndex].desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Block C — pagination dots */}
          <div className="flex justify-center gap-3" style={{ flex: '0 0 auto', marginTop: 20 }}>
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Ir a slide ${i + 1}`}
                onClick={() => goToSlide(i)}
                className="h-6 flex items-center justify-center cursor-pointer group"
              >
                <div className={`h-1.5 rounded-full transition-all duration-400 ease-out ${activeIndex === i ? "bg-emerald-400 w-8" : "bg-white/30 w-4 group-hover:bg-white/60 group-hover:w-6"
                  }`} />
              </button>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
