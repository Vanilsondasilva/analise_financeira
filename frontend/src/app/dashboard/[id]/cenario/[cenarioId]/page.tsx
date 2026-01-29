"use client";
import React, { useState } from "react";
import ContextBar from "@/features/analysis/components/ContextBar";
import AnalysisLayout from "@/features/analysis/layouts/AnalysisLayout";
import KpiCard from "@/components/KpiCard"; // Nosso card profissional
import { ArrowLeft, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ScenarioPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState("summary");

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] -m-6 lg:-m-8"> 
      {/* Header Fixo de Navegação */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center gap-4">
        <Link 
          href={`/dashboard/${params.id}`} 
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-500" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white leading-none">
            Análise: Hipertensos {'>'} 50 anos
          </h1>
          <p className="text-xs text-slate-500 mt-1">Projeto: Unimed Campinas • Safra 2024</p>
        </div>
      </header>

      {/* Barra de Filtros (Contexto) */}
      <ContextBar />

      {/* Conteúdo das Abas */}
      <AnalysisLayout activeTab={activeTab} onTabChange={setActiveTab}>
        
        {activeTab === "summary" && (
          <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
            {/* Linha de KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <KpiCard title="Custo PMPM" value="R$ 840" delta={12.5} colorHex="#ef4444" />
              <KpiCard title="Sinistralidade" value="82.1%" delta={-2.4} colorHex="#22c55e" />
              <KpiCard title="Internações/1000" value="142" delta={5.0} colorHex="#f59e0b" />
              <KpiCard title="Consultas/Ano" value="6.4" delta={0} colorHex="#3b82f6" />
            </div>

            {/* Exemplo de Gráfico Grande (Placeholder Profissional) */}
            <div className="pro-card p-8 h-[400px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-950 border-dashed">
              <TrendingUp size={48} className="mb-4 opacity-20" />
              <p className="font-medium">O Gráfico de Evolução de Custo será renderizado aqui.</p>
              <p className="text-xs mt-2">Dados carregados do motor: {params.cenarioId}</p>
            </div>
          </div>
        )}

        {activeTab === "compare" && (
          <div className="text-center py-20 text-slate-500">
            Módulo de Comparação (Antes vs Depois) em desenvolvimento.
          </div>
        )}

      </AnalysisLayout>
    </div>
  );
}