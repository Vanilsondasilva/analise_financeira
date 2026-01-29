"use client";
import React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from "recharts";
import { Activity, Users, AlertCircle } from "lucide-react";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#6366f1"];

// Formata moeda (R$)
const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function ScenariosTab({ data }: { data: any }) {
  
  // Se não houver dados ou a estrutura estiver vazia
  if (!data || !data.groups) {
    return (
      <div className="p-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-center flex flex-col items-center">
        <div className="p-3 bg-white dark:bg-slate-800 rounded-full mb-3 shadow-sm">
            <Activity className="text-slate-400" size={24} />
        </div>
        <h3 className="text-slate-900 dark:text-white font-medium">Análise Detalhada Indisponível</h3>
        <p className="text-slate-500 text-sm mt-1">Não foi possível carregar os ofensores de custo para esta visualização.</p>
      </div>
    );
  }

  const { groups, procedures, beneficiaries } = data;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      
      {/* 1. GRÁFICO DE PARETO (GRUPOS DE DESPESA) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
           <Activity size={18} className="text-blue-500" /> Distribuição de Custos por Grupo (Pareto)
        </h3>
        <p className="text-sm text-slate-500 mb-6">Quais grupos assistenciais consomem a maior parte do recurso?</p>
        
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              layout="vertical" 
              data={groups} 
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="agrupamento_assistencial" 
                type="category" 
                width={180} 
                tick={{fill: '#64748b', fontSize: 11}} 
                interval={0}
              />
              <Tooltip 
                cursor={{fill: '#f1f5f9'}}
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Bar dataKey="custos" radius={[0, 4, 4, 0]} barSize={18}>
                {groups.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 2. TOP PROCEDIMENTOS (TABELA) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
             <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Activity size={18} className="text-emerald-500" /> Top Procedimentos (Ofensores)
             </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white dark:bg-slate-900 text-xs text-slate-500 uppercase font-bold border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3">Procedimento</th>
                  <th className="px-6 py-3 text-right">Custo Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {procedures && procedures.slice(0, 10).map((proc: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]" title={proc.descricao_servico}>
                      {proc.descricao_servico || "Não Identificado"}
                    </td>
                    <td className="px-6 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                      {formatCurrency(proc.custos)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. TOP BENEFICIÁRIOS (TABELA) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
             <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Users size={18} className="text-rose-500" /> Top 10 Beneficiários (High Users)
             </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white dark:bg-slate-900 text-xs text-slate-500 uppercase font-bold border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3">ID / Beneficiário</th>
                  <th className="px-6 py-3 text-right">Gasto Acumulado</th>
                  <th className="px-6 py-3 text-right">Share (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {beneficiaries && beneficiaries.slice(0, 10).map((user: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-3 font-bold text-blue-600 dark:text-blue-400">
                      {user.__id__ || user.identifier}
                    </td>
                    <td className="px-6 py-3 text-right font-mono font-bold text-slate-700 dark:text-slate-200">
                      {formatCurrency(user.custos)}
                    </td>
                    <td className="px-6 py-3 text-right text-xs text-slate-500">
                      {(user.share * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}