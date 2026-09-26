"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
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
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20 disabled:opacity-50"
    >
      <LogOut className="w-3.5 h-3.5" />
      {isLoading ? "Saliendo..." : "Cerrar Sesión"}
    </button>
  );
}
