"use client";
import React from "react";
import { BarChart3, GitCompare, TrendingUp, PieChart } from "lucide-react";

const TABS = [
  { id: "summary", label: "Resumo Executivo", icon: BarChart3 },
  { id: "trend", label: "Tendência Temporal", icon: TrendingUp },
  { id: "compare", label: "Antes vs Depois", icon: GitCompare },
  { id: "mix", label: "Mix de Custo", icon: PieChart },
];

export default function AnalysisLayout({ children, activeTab, onTabChange }: any) {
  return (
    <div className="flex flex-col h-full">
      {/* Abas de Navegação Tipo "Excel" */}
      <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 pt-4 flex gap-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-all
                ${isActive 
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-x border-t border-slate-200 dark:border-slate-800 relative -mb-px shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"}
              `}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Área de Conteúdo com Scroll */}
      <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900">
        {children}
      </div>
    </div>
  );
}