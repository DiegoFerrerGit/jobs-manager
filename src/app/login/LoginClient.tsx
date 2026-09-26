"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
    if (mode !== "login") return;

    const loadGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
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
        window.google.accounts.id.renderButton(
          document.getElementById("google-button"),
          { theme: "filled_black", size: "large", text: "signin_with", shape: "pill" }
        );
      }
    };

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
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
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
      
      <div className="glass-card max-w-md w-full p-8 rounded-3xl relative z-10">
        <div className="text-center mb-8 flex flex-col items-center">
          <img src="/logo.jpg" alt="Jobs Manager Logo" className="w-16 h-16 rounded-xl object-contain shadow-lg shadow-teal-500/20 ring-1 ring-border/50 mb-4" />
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-200 to-purple-400 mb-2">
            Jobs Manager
          </h1>
          <p className="text-muted-foreground">
            {mode === "login" ? "Inicia sesión para descubrir oportunidades." : "Registro en fase Beta (Requiere invitación)"}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-sm mb-6 text-center">
            {success}
          </div>
        )}

        {mode === "login" ? (
          <div className="flex flex-col items-center">
            <div id="google-button" className="h-[44px] mb-6 min-w-[200px] flex justify-center"></div>
            <button 
              onClick={() => { setMode("beta"); setError(""); setSuccess(""); }}
              className="text-xs text-muted-foreground hover:text-primary transition-colors underline mb-4"
            >
              ¿Tienes un código beta? Habilita tu acceso.
            </button>
            <a href="/privacy" className="text-xs text-muted-foreground/60 hover:text-primary/80 transition-colors">
              Política de Privacidad
            </a>
          </div>
        ) : (
          <form onSubmit={handleBetaSignup} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1 ml-1">Email (El mismo de Google)</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1 ml-1">Secret Code</label>
              <input 
                type="password" 
                required 
                value={secret}
                onChange={e => setSecret(e.target.value)}
                placeholder="BETA_SIGNUP_SECRET"
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg px-4 py-2.5 mt-2 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Validando..." : "Habilitar Acceso"}
            </button>
            <button 
              type="button"
              onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-2 text-center"
            >
              Volver al inicio de sesión
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
