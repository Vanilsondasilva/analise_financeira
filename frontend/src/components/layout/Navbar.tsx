"use client";
import React from "react";
import { Search, Bell, User, Settings, Moon, Sun, Maximize2 } from "lucide-react";
import { useTheme } from "@/core/providers/theme-provider"; // Hook correto

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <nav className="h-16 bg-[#2563eb] dark:bg-[#0f172a] flex items-center justify-between px-6 sticky top-0 z-40 shadow-md transition-colors duration-300 flex-shrink-0">
      {/* Lado Esquerdo: Marca e Busca */}
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-2">
          <span className="font-black text-2xl tracking-tighter text-white italic">NEXT</span>
        </div>

        <div className="relative hidden md:flex items-center">
          <input
            type="text"
            placeholder="Pesquisar projetos..."
            className="bg-white/15 border-none rounded-lg py-2 pl-4 pr-10 w-80 text-sm text-white placeholder:text-blue-100 focus:ring-2 ring-white/50 outline-none transition-all"
          />
          <Search size={18} className="absolute right-3 text-blue-100" />
        </div>
      </div>

      {/* Lado Direito: Ações */}
      <div className="flex items-center gap-4">
        {/* Toggle de Tema via Hook */}
        <button 
          onClick={() => setTheme(isDark ? "light" : "dark")} 
          className="p-2 hover:bg-white/10 rounded-full text-white transition-all active:scale-95"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button className="p-2 hover:bg-white/10 rounded-full text-white hidden sm:block">
          <Maximize2 size={20} />
        </button>

        {/* Notificações com Badge */}
        <div className="relative p-2 hover:bg-white/10 rounded-full text-white cursor-pointer">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 border-2 border-blue-600 rounded-full text-[10px] flex items-center justify-center font-bold">
            3
          </span>
        </div>

        {/* Perfil do Usuário */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/20">
          <div className="flex flex-col items-end hidden lg:flex text-white">
            <span className="text-xs font-bold leading-none">Admin User</span>
            <span className="text-[10px] opacity-70">Disponível</span>
          </div>
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center border border-white/30 text-white cursor-pointer hover:bg-white/30 transition-all">
            <User size={20} />
          </div>
          <Settings size={20} className="text-white cursor-pointer hover:rotate-90 transition-transform duration-500" />
        </div>
      </div>
    </nav>
  );
}