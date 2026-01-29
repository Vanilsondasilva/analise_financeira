"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FolderOpen, Calendar, ArrowRight, Loader2, AlertTriangle, Trash2, Users } from "lucide-react";
import { apiClient } from "@/core/api/client"; 
import { toast } from "sonner";

interface Project {
  project_id: string;
  name: string;
  unimed: string;
  created_at: string;
  status?: string;
  lives?: number;
}

export default function ProjectList({ viewMode }: { viewMode: "grid" | "list" }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data } = await apiClient.get("/projects");
      const sorted = data.sort((a: Project, b: Project) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setProjects(sorted);
      setIsError(false);
    } catch (error) {
      console.error(error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("ATENÇÃO: Deseja excluir este projeto permanentemente?")) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.project_id !== id));
      toast.success("Projeto excluído.");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir.");
    } finally {
      setDeletingId(null);
    }
  };

  // Helper para Status Badge
  const StatusBadge = ({ status }: { status?: string }) => {
    const isProcessed = status === "Processado";
    return (
      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${
        isProcessed 
          ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800" 
          : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
      }`}>
        {status || "Rascunho"}
      </span>
    );
  };

  if (isLoading) return <div className="flex flex-col items-center justify-center py-20 text-slate-400"><Loader2 className="animate-spin mb-2" size={32} /><p>Carregando projetos...</p></div>;
  if (isError) return <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-red-50 rounded-lg border border-red-200"><AlertTriangle size={32} className="mb-2" /><p>Erro ao carregar projetos.</p></div>;
  if (!projects || projects.length === 0) return <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700"><h3 className="text-lg font-bold text-slate-600 dark:text-slate-400">Nenhum projeto encontrado</h3><p className="text-slate-500 text-sm">Clique em "Novo Projeto" para começar.</p></div>;

  return (
    <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in" : "flex flex-col gap-3 animate-in fade-in"}>
      {projects.map((project) => (
        <div key={project.project_id} className="relative group">
            
            <Link href={`/dashboard/${project.project_id}`}>
              <div className={`
                pro-card cursor-pointer hover:border-blue-400 dark:hover:border-blue-500/50 transition-all duration-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl
                ${viewMode === 'list' ? 'flex items-center justify-between p-4' : 'p-6 flex flex-col justify-between h-full'}
              `}>
                
                {/* 1. CABEÇALHO (Ícone + Nome) */}
                <div className={`flex items-center gap-4 ${viewMode === 'grid' ? 'mb-6' : 'flex-1'}`}>
                  <div className={`
                    flex items-center justify-center rounded-xl text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-600 group-hover:text-white transition-colors
                    ${viewMode === 'list' ? 'w-10 h-10' : 'w-12 h-12'}
                  `}>
                    <FolderOpen size={viewMode === 'list' ? 20 : 24} />
                  </div>
                  
                  <div className="min-w-0 pr-8"> 
                    <h3 className="font-bold text-slate-800 dark:text-white leading-tight truncate" title={project.name}>{project.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <Calendar size={12} /> {new Date(project.created_at).toLocaleDateString('pt-BR')}
                      {project.unimed && <span className="hidden sm:inline">• Unimed {project.unimed}</span>}
                    </div>
                  </div>
                </div>

                {/* 2. CONTEÚDO GRID (Completo) */}
                {viewMode === "grid" && (
                  <div className="border-t border-slate-100 dark:border-slate-700/50 pt-4 mt-auto">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-xs">
                        <span className="block text-slate-400 uppercase font-bold text-[10px]">Vidas Ativas</span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                          {(project.lives || 0).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <StatusBadge status={project.status} />
                    </div>
                    
                    <button className="w-full py-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center gap-2">
                      Acessar Painel <ArrowRight size={14} />
                    </button>
                  </div>
                )}

                {/* 3. CONTEÚDO LISTA (Agora com Vidas e Status também) */}
                {viewMode === "list" && (
                  <div className="flex items-center gap-8 mr-12 hidden md:flex"> 
                    <div className="text-right">
                      <span className="block text-slate-400 uppercase font-bold text-[9px]">Vidas</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-xs">
                         {(project.lives || 0).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                )}

              </div>
            </Link>

            {/* 4. BOTÃO DE EXCLUIR (LIXEIRA) */}
            <button 
              onClick={(e) => handleDelete(e, project.project_id)}
              disabled={deletingId === project.project_id}
              className={`
                absolute z-10 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors
                ${viewMode === 'grid' ? 'top-4 right-4' : 'top-1/2 -translate-y-1/2 right-4'}
              `}
              title="Excluir Projeto"
            >
              {deletingId === project.project_id ? (
                <Loader2 size={18} className="animate-spin text-red-500" />
              ) : (
                <Trash2 size={18} />
              )}
            </button>

        </div>
      ))}
    </div>
  );
}