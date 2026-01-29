"use client";
import { Filter, Calendar, Users, X, Info } from "lucide-react";

export default function ContextBar() {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      
      {/* Lado Esquerdo: Definição do Cenário */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 pr-4">
          <Filter size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Definição do Cenário:</span>
        </div>

        {/* Chips de Filtro (Estáticos por enquanto) */}
        <div className="flex items-center gap-2">
          <div className="filter-chip bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
            <Users size={12} /> Idade: 50+
          </div>
          <div className="filter-chip bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800">
            <Calendar size={12} /> Jan/24 - Dez/24
          </div>
          <div className="filter-chip bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800">
            CID: I10 (Hipertensão)
          </div>
        </div>
      </div>

      {/* Lado Direito: Metadados */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Info size={14} /> N = 450 Vidas
        </span>
        <button className="text-blue-600 font-bold hover:underline">Editar Filtros</button>
      </div>
    </div>
  );
}