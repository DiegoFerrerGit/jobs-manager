"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton({ className, isCollapsed }: { className?: string, isCollapsed?: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleLogout}
      disabled={isLoading}
      title="Cerrar Sesión"
      className={`inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 hover:bg-red-500/10 text-red-400 ${className || 'w-full py-2 px-3 border border-transparent'}`}
    >
      <LogOut className="w-5 h-5 shrink-0" />
      {!isCollapsed && <span>{isLoading ? "Saliendo..." : "Cerrar Sesión"}</span>}
    </button>
  );
}
