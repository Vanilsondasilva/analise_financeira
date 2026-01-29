"use client";
import React, { useState } from "react";
import { LayoutDashboard, Layers, GitCompare, ShieldCheck, FileText, Users } from "lucide-react";

interface TabItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const TABS: TabItem[] = [
  { id: "overview", label: "Resultados", icon: LayoutDashboard },
  { id: "demographics", label: "Perfil da Carteira", icon: Users },
  { id: "scenarios", label: "Cenários & Análises", icon: Layers }, 
  { id: "compare", label: "Comparativos", icon: GitCompare },
  { id: "quality", label: "Auditoria & Qualidade", icon: ShieldCheck },
  { id: "reports", label: "Relatórios", icon: FileText },
];

export default function ProjectLayout({ children, activeTab, onTabChange }: any) {
  return (
    <div className="space-y-6">
      {/* Navegação Interna do Projeto */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex gap-6" aria-label="Tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  group flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all
                  ${isActive 
                    ? "border-blue-600 text-blue-600 dark:text-blue-400" 
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:border-slate-300"}
                `}
              >
                <tab.icon className={`mr-2 h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-500"}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conteúdo da Aba */}
      <div className="fade-in">
        {children}
      </div>
    </div>
  );
}