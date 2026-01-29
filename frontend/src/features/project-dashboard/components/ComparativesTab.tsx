"use client";
import React from "react";
import { ArrowDown, ArrowUp, Minus, AlertCircle } from "lucide-react";

// Helper de formatação
const formatMoney = (v: number) => 
  v !== undefined && v !== null 
    ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
    : "-";

const formatNumber = (v: number) => 
  v !== undefined && v !== null ? v.toLocaleString('pt-BR') : "-";

const formatPercent = (v: number) => {
  if (v === undefined || v === null) return "-";
  const isPos = v > 0;
  const isNeg = v < 0;
  // Regra de negócio: Custo subir (Positivo) é Ruim (Vermelho), Custo cair (Negativo) é Bom (Verde)
  // Para outros KPIs isso pode inverter, mas aqui focamos em custo/sinistro.
  return (
    <span className={`flex items-center justify-end gap-1 font-bold ${isNeg ? "text-emerald-600" : isPos ? "text-rose-600" : "text-slate-500"}`}>
      {isNeg ? <ArrowDown size={14} /> : isPos ? <ArrowUp size={14} /> : <Minus size={14} />}
      {Math.abs(v).toFixed(1)}%
    </span>
  );
};

export default function ComparativesTab({ data }: { data: any[] }) {
  // Se não houver dados, mostre um estado vazio elegante
  if (!data || data.length === 0) {
    return (
      <div className="p-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-center flex flex-col items-center">
        <div className="p-3 bg-white dark:bg-slate-800 rounded-full mb-3 shadow-sm">
            <AlertCircle className="text-slate-400" size={24} />
        </div>
        <h3 className="text-slate-900 dark:text-white font-medium">Sem dados comparativos</h3>
        <p className="text-slate-500 text-sm mt-1">A análise "Antes vs Depois" ainda não foi processada para esta rodada.</p>
      </div>
    );
  }

  // Encontra as linhas baseadas no campo "Momento"
  const antes = data.find(d => d.Momento === "Antes") || {};
  const depois = data.find(d => d.Momento === "Depois") || {};
  const diff = data.find(d => d.Momento === "Diferença") || {};
  const pct = data.find(d => d.Momento === "%") || {};

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Resumo: Antes vs Depois</h3>
        <p className="text-sm text-slate-500">Comparação direta dos indicadores nos períodos pré e pós entrada no programa.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500 uppercase font-bold border-b border-slate-100 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4">Indicador Financeiro</th>
              <th className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">Antes</th>
              <th className="px-6 py-4 text-right text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10 border-x border-blue-100 dark:border-blue-900/30">Depois</th>
              <th className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">Diferença (R$)</th>
              <th className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">Variação (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            
            {/* LINHA 1: CUSTO TOTAL */}
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
              <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">Custo Total Assistencial</td>
              <td className="px-6 py-4 text-right font-mono text-slate-600 dark:text-slate-400">{formatMoney(antes["Custos"])}</td>
              <td className="px-6 py-4 text-right font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-900/10 border-x border-blue-50 dark:border-blue-900/20">{formatMoney(depois["Custos"])}</td>
              <td className="px-6 py-4 text-right font-mono text-slate-600 dark:text-slate-400">{formatMoney(diff["Custos"])}</td>
              <td className="px-6 py-4 text-right">{formatPercent(pct["Custos"])}</td>
            </tr>

            {/* LINHA 2: PMPM (Ticket Médio Global) */}
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">Custo Médio (PMPM)</td>
              <td className="px-6 py-4 text-right font-mono text-slate-600 dark:text-slate-400">{formatMoney(antes["Custo Médio Usuários Total"])}</td>
              <td className="px-6 py-4 text-right font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-900/10 border-x border-blue-50 dark:border-blue-900/20">{formatMoney(depois["Custo Médio Usuários Total"])}</td>
              <td className="px-6 py-4 text-right font-mono text-slate-600 dark:text-slate-400">{formatMoney(diff["Custo Médio Usuários Total"])}</td>
              <td className="px-6 py-4 text-right">{formatPercent(pct["Custo Médio Usuários Total"])}</td>
            </tr>

            {/* LINHA 3: CUSTO MÉDIO DE QUEM USOU */}
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">Ticket Médio (Utilizadores)</td>
              <td className="px-6 py-4 text-right font-mono text-slate-600 dark:text-slate-400">{formatMoney(antes["Custo Médio Usuário (com utilização)"])}</td>
              <td className="px-6 py-4 text-right font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-900/10 border-x border-blue-50 dark:border-blue-900/20">{formatMoney(depois["Custo Médio Usuário (com utilização)"])}</td>
              <td className="px-6 py-4 text-right font-mono text-slate-600 dark:text-slate-400">{formatMoney(diff["Custo Médio Usuário (com utilização)"])}</td>
              <td className="px-6 py-4 text-right">{formatPercent(pct["Custo Médio Usuário (com utilização)"])}</td>
            </tr>

            {/* LINHA 4: BASES */}
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-t-2 border-slate-100 dark:border-slate-800">
              <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">Usuários com Sinistro (Absoluto)</td>
              <td className="px-6 py-4 text-right font-mono text-slate-500">{formatNumber(antes["N. Usuários com Utilizações"])}</td>
              <td className="px-6 py-4 text-right font-mono font-bold text-blue-600/80 bg-blue-50/30 dark:bg-blue-900/10 border-x border-blue-50 dark:border-blue-900/20">{formatNumber(depois["N. Usuários com Utilizações"])}</td>
              <td className="px-6 py-4 text-right font-mono text-slate-500">{formatNumber(diff["N. Usuários com Utilizações"])}</td>
              <td className="px-6 py-4 text-right">{formatPercent(pct["N. Usuários com Utilizações"])}</td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
}