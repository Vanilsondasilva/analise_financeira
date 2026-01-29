"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Settings2, Calendar, Info, Check, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Periodo = "dentro" | "fora" | "ambos";

interface ResultControlsProps {
  currentFilters: {
    periodo: Periodo;
    momentoZero: boolean;
    janela: number; // ex: 24 meses
    grupos?: string[]; // multi
    agrupamento_assistencial?: string[]; // multi
    excluirNaoElegiveis?: boolean; // default true
  };
  options?: {
    grupos?: string[];
    agrupamento_assistencial?: string[];
  };
  onRecalculate: (newFilters: any) => void;
}

export default function ResultControls({
  currentFilters,
  options,
  onRecalculate,
}: ResultControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Estado local para edição
  const [filters, setFilters] = useState(() => ({
    ...currentFilters,
    grupos: currentFilters.grupos ?? [],
    agrupamento_assistencial: currentFilters.agrupamento_assistencial ?? [],
    excluirNaoElegiveis:
      typeof currentFilters.excluirNaoElegiveis === "boolean"
        ? currentFilters.excluirNaoElegiveis
        : true,
  }));

  // Mantém o estado local sincronizado quando o pai atualiza (recalc)
  useEffect(() => {
    setFilters({
      ...currentFilters,
      grupos: currentFilters.grupos ?? [],
      agrupamento_assistencial: currentFilters.agrupamento_assistencial ?? [],
      excluirNaoElegiveis:
        typeof currentFilters.excluirNaoElegiveis === "boolean"
          ? currentFilters.excluirNaoElegiveis
          : true,
    });
  }, [currentFilters]);

  const periodoLabel: Record<Periodo, string> = {
    dentro: "Dentro do Período (Metodologia Padrão)",
    fora: "Fora do Período (Audit)",
    ambos: "Comparativo Completo",
  };

  // Helpers multi-select
  const toggleItem = (arr: string[], item: string, checked: boolean) => {
    if (checked) return Array.from(new Set([...arr, item]));
    return arr.filter((x) => x !== item);
  };

  const gruposOptionsFiltered = useMemo(() => {
    const all = options?.grupos ?? [];
    if (!filters.excluirNaoElegiveis) return all;

    // regra simples: remove qualquer label que contenha "Não Elegível" (case-insensitive)
    return all.filter((g) => !String(g).toLowerCase().includes("não eleg"));
  }, [options?.grupos, filters.excluirNaoElegiveis]);

  const periodoChip = periodoLabel[filters.periodo];

  const agrupSelectedCount = filters.agrupamento_assistencial?.length ?? 0;
  const gruposSelectedCount = filters.grupos?.length ?? 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm mb-6 overflow-hidden">
      {/* 1. BARRA DE RESUMO */}
      <div className="px-6 py-3 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wider text-xs">
            <Settings2 size={14} /> Parâmetros de Cálculo:
          </div>

          {/* Chip: Metodologia */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium">
            <Calendar size={12} />
            {periodoChip}
          </div>

          {/* Chip: Momento Zero */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 border rounded-full text-xs font-medium ${
              filters.momentoZero
                ? "bg-purple-50 text-purple-700 border-purple-100"
                : "bg-slate-100 text-slate-500 border-slate-200"
            }`}
          >
            {filters.momentoZero ? "Incluindo Mês 0" : "Excluindo Mês 0 (Carência)"}
          </div>

          {/* Chip: Resumo filtros */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
              TP: {gruposSelectedCount > 0 ? `${gruposSelectedCount} selecionado(s)` : "Todos"}
            </span>
            <span className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
              Assist: {agrupSelectedCount > 0 ? `${agrupSelectedCount} selecionado(s)` : "Todos"}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
        >
          {isOpen ? "Ocultar Filtros" : "Alterar Parâmetros"}
        </button>
      </div>

      {/* 2. PAINEL DE EDIÇÃO */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 dark:border-slate-800"
          >
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Coluna 1: Metodologia */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-white mb-3">
                  Período de Análise
                </label>

                <div className="space-y-2">
                  {[
                    { val: "dentro", label: "Dentro do Período (TP)", desc: "Respeita a janela individual de cada usuário." },
                    { val: "fora", label: "Fora do Período", desc: "Analisa o que ocorreu fora da janela do programa." },
                    { val: "ambos", label: "Visão Completa", desc: "Mostra os dois cenários lado a lado." },
                  ].map((opt) => (
                    <label
                      key={opt.val}
                      className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name="periodo"
                        checked={filters.periodo === opt.val}
                        onChange={() => setFilters({ ...filters, periodo: opt.val as Periodo })}
                        className="mt-1"
                      />
                      <div>
                        <span className="block text-sm font-medium text-slate-800">{opt.label}</span>
                        <span className="block text-xs text-slate-500">{opt.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Coluna 2: Regras + Filtros */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-white mb-3">
                  Regras de Cálculo
                </label>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                  {/* Momento zero */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        filters.momentoZero ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300"
                      }`}
                    >
                      {filters.momentoZero && <Check size={14} className="text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={filters.momentoZero}
                      onChange={(e) => setFilters({ ...filters, momentoZero: e.target.checked })}
                    />
                    <div>
                      <span className="block text-sm font-medium text-slate-700">Incluir Momento Zero</span>
                      <span className="block text-xs text-slate-500">Mês de entrada/evento gatilho.</span>
                    </div>
                  </label>

                  {/* Janela */}
                  <div className="pt-4 border-t border-slate-200">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                      Janela de Observação (Meses)
                    </label>
                    <input
                      type="range"
                      min="6"
                      max="60"
                      step="6"
                      value={filters.janela}
                      onChange={(e) => setFilters({ ...filters, janela: parseInt(e.target.value) })}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>+/- 6m</span>
                      <span className="font-bold text-blue-600">+/- {filters.janela} meses</span>
                      <span>+/- 60m</span>
                    </div>
                  </div>

                  {/* Filtros de Carteira */}
                  <div className="pt-4 border-t border-slate-200 space-y-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase">
                      Filtros de Carteira
                    </label>

                    {/* Excluir não elegíveis */}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          filters.excluirNaoElegiveis ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300"
                        }`}
                      >
                        {filters.excluirNaoElegiveis && <Check size={14} className="text-white" />}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={!!filters.excluirNaoElegiveis}
                        onChange={(e) => setFilters({ ...filters, excluirNaoElegiveis: e.target.checked })}
                      />
                      <div>
                        <span className="block text-sm font-medium text-slate-700">Excluir “Não elegíveis”</span>
                        <span className="block text-xs text-slate-500">Aplica para os grupos (TP).</span>
                      </div>
                    </label>

                    {/* Multi: Agrupamento Assistencial */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600">Agrupamento Assistencial</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setFilters({
                                ...filters,
                                agrupamento_assistencial: options?.agrupamento_assistencial ?? [],
                              })
                            }
                            className="text-xs font-bold text-blue-600 hover:underline"
                          >
                            Selecionar todos
                          </button>
                          <button
                            type="button"
                            onClick={() => setFilters({ ...filters, agrupamento_assistencial: [] })}
                            className="text-xs font-bold text-slate-500 hover:underline"
                          >
                            Limpar
                          </button>
                        </div>
                      </div>

                      <div className="max-h-40 overflow-auto rounded-lg border border-slate-200 bg-white p-2 space-y-2">
                        {(options?.agrupamento_assistencial ?? []).map((a) => {
                          const checked = (filters.agrupamento_assistencial ?? []).includes(a);
                          return (
                            <label key={a} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) =>
                                  setFilters({
                                    ...filters,
                                    agrupamento_assistencial: toggleItem(
                                      filters.agrupamento_assistencial ?? [],
                                      a,
                                      e.target.checked
                                    ),
                                  })
                                }
                              />
                              <span>{a}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Multi: Grupos (TP) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600">Grupos (TP)</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setFilters({ ...filters, grupos: gruposOptionsFiltered })}
                            className="text-xs font-bold text-blue-600 hover:underline"
                          >
                            Selecionar todos
                          </button>
                          <button
                            type="button"
                            onClick={() => setFilters({ ...filters, grupos: [] })}
                            className="text-xs font-bold text-slate-500 hover:underline"
                          >
                            Limpar
                          </button>
                        </div>
                      </div>

                      <div className="max-h-40 overflow-auto rounded-lg border border-slate-200 bg-white p-2 space-y-2">
                        {gruposOptionsFiltered.map((g) => {
                          const checked = (filters.grupos ?? []).includes(g);
                          return (
                            <label key={g} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) =>
                                  setFilters({
                                    ...filters,
                                    grupos: toggleItem(filters.grupos ?? [], g, e.target.checked),
                                  })
                                }
                              />
                              <span>{g}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna 3: Ação */}
              <div className="flex flex-col justify-end">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                  <div className="flex items-start gap-2">
                    <Info size={16} className="text-blue-600 mt-0.5" />
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Ao alterar esses parâmetros, o sistema irá recalcular o comparativo "Antes vs Depois" e a linha de tendência.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onRecalculate(filters)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <RefreshCw size={18} />
                  Aplicar e Recalcular
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
