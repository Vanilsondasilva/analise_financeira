"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Plus, Loader2, AlertTriangle, Calendar } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";

// Componentes
import ProjectLayout from "@/features/project-dashboard/layouts/ProjectLayout";
import ProjectHeader from "@/features/project-dashboard/components/ProjectHeader";
import KpiCard from "@/components/KpiCard"; 
import ComparativesTab from "@/features/project-dashboard/components/ComparativesTab";
import DemographicsTab from "@/features/project-dashboard/components/DemographicsTab";
import ScenariosTab from "@/features/project-dashboard/components/ScenariosTab";
import NewScenarioModal from "@/features/project-dashboard/components/NewScenarioModal";
import ResultControls from "@/features/project-dashboard/components/ResultControls";


import { apiClient } from "@/core/api/client";
import { toast } from "sonner";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;

  // Estado inicial "overview" (agora rotulado como "Resultados")
  const [activeTab, setActiveTab] = useState("overview");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  
  const [project, setProject] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);

  // Estados de Filtro (Simulação Visual por enquanto)
  const [calcFilters, setCalcFilters] = useState({
    periodo: "dentro" as "dentro" | "fora" | "ambos",
    momentoZero: false,
    janela: 24,
    grupos: [] as string[],
    agrupamento_assistencial: [] as string[],
    excluirNaoElegiveis: true,
  });


  const [filterOptions, setFilterOptions] = useState<any>({ grupos: [], agrupamento_assistencial: [] });


  useEffect(() => {
    async function loadAllData() {
      try {
        setLoading(true);

        const { data: projData } = await apiClient.get(`/projects/${projectId}`);
        setProject(projData);

        const { data: results } = await apiClient.get(`/analysis/results/${projectId}/R1`);
        if (results.status !== "processing") {
          setAnalysisData(results);
        } else {
          console.warn("Ainda processando...");
        }

        // carrega options SEMPRE (independente do results)
        const { data: opts } = await apiClient.get(`/analysis/filter-options/${projectId}/R1`);
        if (opts.status === "success") setFilterOptions(opts.options);

      } catch (err) {
        console.error("Erro ao carregar projeto:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadAllData();
  }, [projectId]);


  const handleRecalculate = async (newFilters: any) => {
    try {
      setCalcFilters(newFilters);

      const qs = new URLSearchParams();
      qs.set("periodo", newFilters.periodo);
      qs.set("momentoZero", String(newFilters.momentoZero));
      qs.set("janela", String(newFilters.janela));
      qs.set("excluirNaoElegiveis", String(newFilters.excluirNaoElegiveis ?? true));

      (newFilters.grupos || []).forEach((g: string) => qs.append("grupos", g));
      (newFilters.agrupamento_assistencial || []).forEach((a: string) => qs.append("agrupamento_assistencial", a));

      const { data } = await apiClient.get(`/analysis/results/${projectId}/R1`, {
        params: {
          periodo: newFilters.periodo,
          momentoZero: newFilters.momentoZero,
          janela: newFilters.janela,
          grupos: newFilters.grupos?.length ? newFilters.grupos : undefined,
          agrupamento_assistencial: newFilters.agrupamento_assistencial?.length
            ? newFilters.agrupamento_assistencial
            : undefined,
        },
      });


      setAnalysisData(data);
      toast.success("Resultados recalculados.");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao recalcular resultados.");
    }
  };



  // Prepara dados do gráfico de linha
  const xs = analysisData?.charts?.timeline?.x || [];
  const ys = analysisData?.charts?.timeline?.y || [];
  const chartData = xs.map((mes: number, i: number) => ({
    mes: `Mês ${mes}`,
    custo: ys[i] ?? 0,
  }));

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4 bg-slate-50">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      <p className="text-slate-500 font-medium animate-pulse">Carregando inteligência...</p>
    </div>
  );

  if (error || !project) return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-red-500">
      <AlertTriangle size={48} className="mb-4" />
      <h1 className="text-2xl font-bold">Projeto não encontrado</h1>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 bg-slate-50/50">
      <ProjectHeader project={project} kpis={analysisData?.kpis} refDate={analysisData?.meta?.ref_date} />

      <ProjectLayout activeTab={activeTab} onTabChange={setActiveTab}>
        
        {/* --- ABA PRINCIPAL: RESULTADOS (Visão Executiva + Comparativo) --- */}
        {(activeTab === "overview" || activeTab === "results") && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            
            {/* Barra de Controles/Contexto */}
            <ResultControls 
              currentFilters={calcFilters} 
              onRecalculate={handleRecalculate} 
              options={filterOptions}
            />

            {/* 1. CARDS DE KPI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCard 
                title="Custo Total" 
                value={`R$ ${analysisData?.kpis?.total_cost?.toLocaleString('pt-BR', { notation: "compact", maximumFractionDigits: 1 }) || "0"}`} 
                delta={0} 
                colorHex="#3b82f6" 
              />
              <KpiCard 
                title="Vidas Expostas" 
                value={analysisData?.kpis?.lives?.toLocaleString('pt-BR') || "0"} 
                delta={0} 
                colorHex="#10b981" 
              />
              <KpiCard 
                title="Custo Médio (PMPM)" 
                value={`R$ ${analysisData?.kpis?.pmpm?.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || "0"}`} 
                delta={0} 
                colorHex="#8b5cf6" 
              />
              <KpiCard 
                title="Previsão (IA)" 
                value={`R$ ${analysisData?.kpis?.prediction?.toLocaleString('pt-BR', { notation: "compact", maximumFractionDigits: 1 }) || "0"}`} 
                delta={0} 
                colorHex="#f59e0b" 
              />
            </div>

            {/* 2. TABELA ANTES vs DEPOIS (O Coração do Resultado) */}
            <ComparativesTab data={analysisData?.comparative || []} />

            {/* 3. GRÁFICO DE EVOLUÇÃO TEMPORAL */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-[400px]">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Calendar size={18} className="text-slate-400"/> Evolução de Custos (Timeline)
                 </h3>
                 <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">Mês -24 a Mês +24</span>
              </div>

              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                        dataKey="mes" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#64748b', fontSize: 12}} 
                        dy={10} 
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#64748b', fontSize: 12}} 
                        tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} 
                    />
                    <Tooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} 
                        formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, "Custo"]} 
                    />
                    <Line 
                        type="monotone" 
                        dataKey="custo" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                        dot={{r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff"}} 
                        activeDot={{r: 6}} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">Sem dados suficientes para gerar gráfico.</div>
              )}
            </div>
          </div>
        )}

        {/* --- ABA: PERFIL DA CARTEIRA --- */}
        {activeTab === "demographics" && (
            <DemographicsTab 
                data={analysisData?.raw_data || []} 
                refDate={analysisData?.meta?.ref_date} 
            />
        )}

        {/* --- ABA: CENÁRIOS & ANÁLISES --- */}
        {activeTab === "scenarios" && (
            <div className="space-y-6">
                {/* Botão Novo Cenário */}
                <div 
                    onClick={() => setIsScenarioModalOpen(true)} 
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-colors group h-32 w-full md:w-64"
                >
                    <div className="flex items-center gap-3 text-slate-500 group-hover:text-blue-600 transition-colors">
                        <Plus className="w-6 h-6" />
                        <span className="font-bold">Novo Cenário</span>
                    </div>
                </div>
                
                {/* Conteúdo Analítico Geral (Pareto, Top Users) */}
                <ScenariosTab data={analysisData?.analysis_details || {}} />
            </div>
        )}

        {/* Placeholders Futuros */}
        {activeTab === "compare_rounds" && (
            <div className="text-center py-20 text-slate-500">Módulo de Comparação entre Rodadas (Safra A vs Safra B) em desenvolvimento.</div>
        )}
        {activeTab === "quality" && (
            <div className="text-center py-20 text-slate-500">Módulo de Auditoria em desenvolvimento.</div>
        )}
        {activeTab === "reports" && (
            <div className="text-center py-20 text-slate-500">Módulo de Relatórios PDF em desenvolvimento.</div>
        )}

      </ProjectLayout>

      {/* MODAL DE CRIAÇÃO DE CENÁRIO */}
      {isScenarioModalOpen && (
        <NewScenarioModal 
            projectId={projectId} 
            roundId="R1" 
            onClose={() => setIsScenarioModalOpen(false)} 
        />
      )}
    </div>
  );
}