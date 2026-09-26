"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Target, ChevronLeft, ChevronRight, BriefcaseBusiness } from "lucide-react";
import LogoutButton from "./LogoutButton";

export default function AppLayoutClient({ children, user }: { children: React.ReactNode, user: any }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Fixed */}
      <aside className={`fixed top-0 left-0 h-screen border-r border-border/50 bg-[#0c0c0f] flex-col justify-between hidden md:flex z-50 transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}>
        
        {/* Collapse Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 bg-secondary border border-border/50 rounded-md p-1 hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors shadow-md z-10 cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div>
          <div className={`h-20 flex items-center ${isCollapsed ? 'justify-center' : 'justify-start px-6'} border-b border-border/20 transition-all overflow-hidden whitespace-nowrap`}>
            {isCollapsed ? (
              <BriefcaseBusiness className="w-8 h-8 text-pink-500" />
            ) : (
              <h1 className="text-xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 uppercase">
                Jobs Manager
              </h1>
            )}
          </div>
          
          <nav className="p-4 mt-4 space-y-2">
            <Link 
              href="/" 
              className={`flex items-center gap-3 py-2.5 rounded-lg text-sm font-bold transition-colors cursor-pointer ${pathname === '/' ? 'bg-secondary/40 text-pink-500 hover:bg-secondary/60 hover:text-pink-400' : 'text-muted-foreground hover:bg-secondary/20 hover:text-foreground'} ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
              title="Hunter"
            >
              <Target className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span>HUNTER</span>}
            </Link>
          </nav>
        </div>

        <div className={`p-4 border-t border-border/20 mt-auto transition-all ${isCollapsed ? 'items-center flex flex-col gap-4' : ''}`}>
          {user && (
            <div className={`flex items-center gap-3 mb-6 ${isCollapsed ? 'px-0 justify-center' : 'px-2'}`}>
              {user.picture ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={user.picture} alt={user.name || "Avatar"} className="w-9 h-9 rounded-full object-cover shrink-0 shadow-lg shadow-purple-500/10 ring-1 ring-border/50" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
                  <span className="text-sm font-bold text-white">{user.name?.charAt(0) || user.email?.charAt(0)}</span>
                </div>
              )}
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                </div>
              )}
            </div>
          )}
          <div className={isCollapsed ? "flex justify-center" : "px-1"}>
            <LogoutButton 
              isCollapsed={isCollapsed} 
              className={isCollapsed 
                ? 'p-2 w-10 h-10 rounded-lg flex items-center justify-center hover:bg-red-500/10 text-red-400 transition-colors' 
                : 'w-full py-2 px-3 flex items-center gap-3 rounded-lg hover:bg-red-500/10 text-red-400 font-medium transition-colors text-sm'} 
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 min-h-screen overflow-x-hidden transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        {children}
      </main>
    </div>
  );
}
