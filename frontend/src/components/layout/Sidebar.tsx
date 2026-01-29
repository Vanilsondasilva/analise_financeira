"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
// REMOVI "Upload" DAQUI POIS NÃO É MAIS USADO
import { 
  LayoutDashboard, Compass, Settings, BarChart3, 
  Database, Activity, ChevronDown, Home
} from "lucide-react";

// Configuração dos Itens com Submenus
const menuItems = [
  { name: "Início", icon: Home, href: "/" },
  { 
    name: "Projetos", 
    icon: Database, 
    href: "/projetos",
    subItems: [
      { name: "Catálogo", href: "/projetos/catalogo" },
      { name: "Modelos de Análise", href: "/projetos/analises" }
    ]
  },
  // O Upload foi removido daqui corretamente
  { name: "Mapeamento", icon: Compass, href: "/mapeamento" },
  { name: "Resultados", icon: BarChart3, href: "/resultados" },
  { name: "Configuração", icon: Settings, href: "/configuracao" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      setOpenMenus({}); 
    }, 400); 
  };

  const toggleSubMenu = (name: string) => {
    setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <motion.aside 
      initial={{ width: 80 }}
      animate={{ width: isHovered ? 260 : 80 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="h-screen sticky top-0 bg-[#020617] border-r border-white/5 flex flex-col p-4 z-50 overflow-hidden flex-shrink-0 transition-all duration-300 ease-in-out"
    >
      {/* --- LOGO --- */}
      <div className="flex items-center gap-3 mb-10 px-2 h-10 shrink-0">
        <div className="min-w-[40px] h-10 bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
          <Activity size={24} className="text-white" />
        </div>
        <AnimatePresence>
          {isHovered && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="font-black text-xl tracking-tighter italic whitespace-nowrap text-white"
            >
              HEALTH<span className="text-cyan-400">PRO</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* --- NAVEGAÇÃO --- */}
      <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.subItems && item.subItems.some(sub => pathname === sub.href));
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isSubMenuOpen = openMenus[item.name];

          return (
            <div key={item.name} className="flex flex-col">
              <div 
                onClick={() => hasSubItems && toggleSubMenu(item.name)}
                className="cursor-pointer"
              >
                <Link href={hasSubItems ? "#" : item.href} className="no-underline">
                  <div className={`relative flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300 group ${
                    isActive ? "text-cyan-400 bg-cyan-400/5" : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                  }`}>
                    <item.icon size={22} className="shrink-0" />
                    
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-between w-full"
                        >
                          <span className="font-semibold text-sm whitespace-nowrap">{item.name}</span>
                          {hasSubItems && (
                            <ChevronDown size={14} className={`transition-transform duration-300 ${isSubMenuOpen ? 'rotate-180' : ''}`} />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {isActive && (
                      <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-6 bg-cyan-400 rounded-r-full" />
                    )}
                  </div>
                </Link>
              </div>

              {/* --- SUBMENU --- */}
              <AnimatePresence>
                {isHovered && hasSubItems && isSubMenuOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="ml-9 mt-1 flex flex-col gap-1 border-l border-white/10 pl-4 overflow-hidden"
                  >
                    {item.subItems?.map(sub => (
                      <Link key={sub.name} href={sub.href} className="text-xs text-slate-500 hover:text-cyan-400 py-2 transition-colors block">
                        {sub.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* --- FOOTER STATUS --- */}
      <div className="mt-auto p-2 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          {isHovered && (
            <motion.span 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ duration: 0.2 }}
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap"
            >
              Motor: Online
            </motion.span>
          )}
        </div>
      </div>
    </motion.aside>
  );
}