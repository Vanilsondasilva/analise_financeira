"use client";
import { useState, useEffect } from "react";
import ViewToggle from "@/features/projects/components/ViewToggle";
import ProjectList from "@/features/projects/components/ProjectList";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function CatalogoPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Recupera a preferência do usuário ao carregar
  useEffect(() => {
    const saved = localStorage.getItem("project_view_mode");
    if (saved === "list" || saved === "grid") setViewMode(saved);
  }, []);

  // Salva a preferência
  const handleToggle = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem("project_view_mode", mode);
  };

  return (
    <div className="space-y-8 fade-in h-full">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Catálogo de Projetos</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Gerencie suas carteiras e acesse os dashboards de inteligência.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <ViewToggle viewMode={viewMode} setViewMode={handleToggle} />
          
          <Link href="/projetos/novo">
            <button className="btn-primary shadow-blue-500/20 shadow-lg hover:shadow-blue-500/40 transition-all">
                <Plus size={18} /> Novo Projeto
            </button>
          </Link>
        </div>
      </div>

      {/* Área de Listagem */}
      <ProjectList viewMode={viewMode} />
    </div>
  );
}