import React from "react";
import { Database, Calendar, Users, Activity } from "lucide-react";

interface ProjectHeaderProps {
  project: {
    name: string;
    unimed: string;
    description?: string;
    created_at?: string;
  } | null;
  kpis?: {
    lives: number;
    total_cost: number;
    pmpm: number;
  };
  refDate?: string; // Propriedade opcional que virá do backend
}

export default function ProjectHeader({ project, kpis, refDate }: ProjectHeaderProps) {
  if (!project) return null;

  // Data de HOJE (Criação do Dataset)
  const dataCriacao = project.created_at 
    ? new Date(project.created_at).toLocaleDateString('pt-BR') 
    : "--/--";

  // Lógica de Exibição da Referência:
  let labelRef = "R1";
  
  if (refDate) {
      const dateObj = new Date(refDate.includes("T") ? refDate : refDate + "T12:00:00");
      // Removendo as opções { ... }, ele volta para o padrão "dd/mm/aaaa"
      labelRef = dateObj.toLocaleDateString('pt-BR'); 
  } else if (project.created_at) {
      labelRef = new Date(project.created_at).toLocaleDateString('pt-BR');
  }

  const vidasReais = kpis?.lives 
    ? kpis.lives.toLocaleString('pt-BR') 
    : "--";

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-6 mb-8">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">
              Projeto Ativo
            </span>
            <span className="text-slate-400 text-xs">ID: {project.unimed || "000"}</span>
          </div>
          
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {project.name}
          </h1>
          
          <p className="text-slate-500 mt-2 max-w-2xl text-sm">
            {project.description || `Análise de carteira Unimed ${project.unimed} - Processamento R1`}
          </p>
        </div>

        <div className="text-right">
             <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm">
                <Activity size={16} />
                <span>Processamento Concluído</span>
             </div>
        </div>
      </div>

      <div className="flex items-center gap-6 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
        
        {/* Dataset: Data de Hoje */}
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Database size={16} className="text-blue-500" />
          <span className="font-bold">Dataset:</span> 
          <span>R1 (Criado em {dataCriacao})</span>
        </div>

        {/* Ref: Data de Novembro/2025 */}
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Calendar size={16} className="text-purple-500" />
          <span className="font-bold">Ref:</span> 
          <span className="capitalize">{labelRef}</span>
        </div>

        {/* Vidas Reais */}
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold">Vidas Ativas:</span> 
          <span className="font-mono text-slate-800 dark:text-slate-200">{vidasReais}</span>
        </div>

      </div>
    </div>
  );
}