"use client";
import React, { useState, useMemo } from "react";
import { ArrowLeft, Play, Calendar, Link2, Calculator, Table as TableIcon, Download, Search, Maximize2, Minimize2 } from "lucide-react";

interface ConfigurationStepProps {
  benefCols: string[];
  fichaCols: string[];
  mappedBenefIds: string[];
  mappedFichaIds: string[];
  configData: {
    ultima_comp_ref: string;
    benef_id: string;
    ficha_id: string;
  };
  onUpdate: (key: string, value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  onPreview: () => void;
  previewData: { data: any[], ref_calculada: string } | null;
  onDownload: () => void;
}

export default function ConfigurationStep({
  benefCols, fichaCols, mappedBenefIds, mappedFichaIds,
  configData, onUpdate, onBack, onSubmit, isLoading,
  onPreview, previewData, onDownload
}: ConfigurationStepProps) {

  const [inputType, setInputType] = useState("text");
  
  // --- NOVOS ESTADOS PARA AS FUNCIONALIDADES DA TABELA ---
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Formata data
  const formatDisplayDate = (isoDate: string) => {
    if (!isoDate) return "";
    const [y, m, d] = isoDate.split("-");
    return `${d}/${m}/${y}`;
  };

  // --- LÓGICA DE FILTRO (BUSCA) ---
  const filteredData = useMemo(() => {
    if (!previewData || !previewData.data) return [];
    if (!searchTerm) return previewData.data;
    
    const lowerTerm = searchTerm.toLowerCase();
    return previewData.data.filter((row) => 
      Object.values(row).some((val) => 
        String(val).toLowerCase().includes(lowerTerm)
      )
    );
  }, [previewData, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* 1. DATA DE REFERÊNCIA */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Calendar className="text-blue-500" size={20} /> 
          1) Referência Temporal
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Informe a última competência disponível (fechada) para o cálculo do Tempo de Programa.
        </p>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Última Competência</label>
          <div className="relative w-full md:w-1/3">
            <input 
              type={inputType}
              value={inputType === "text" ? formatDisplayDate(configData.ultima_comp_ref) : configData.ultima_comp_ref}
              onFocus={() => setInputType("date")}
              onBlur={() => setInputType("text")}
              onChange={(e) => onUpdate("ultima_comp_ref", e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-400"
              placeholder="dd/mm/aaaa"
            />
            {inputType === "text" && (
               <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            )}
          </div>
        </div>
      </div>

      {/* 2. ESCOLHA DE CHAVES (JOIN) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Link2 className="text-emerald-500" size={20} /> 
          2) Chave de Análise (Join)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-purple-700 uppercase mb-1">Beneficiários (ID)</label>
            <select 
              value={configData.benef_id}
              onChange={(e) => onUpdate("benef_id", e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="">Selecione...</option>
              {mappedBenefIds.length > 0 && (
                <optgroup label="Sugeridos no Mapeamento">
                  {mappedBenefIds.map(col => <option key={col} value={col}>{col}</option>)}
                </optgroup>
              )}
              <optgroup label="Todas as Colunas">
                {benefCols.map(col => <option key={col} value={col}>{col}</option>)}
              </optgroup>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-cyan-700 uppercase mb-1">Ficha Financeira (ID)</label>
            <select 
              value={configData.ficha_id}
              onChange={(e) => onUpdate("ficha_id", e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-cyan-500 outline-none"
            >
              <option value="">Selecione...</option>
              {mappedFichaIds.length > 0 && (
                <optgroup label="Sugeridos no Mapeamento">
                  {mappedFichaIds.map(col => <option key={col} value={col}>{col}</option>)}
                </optgroup>
              )}
              <optgroup label="Todas as Colunas">
                {fichaCols.map(col => <option key={col} value={col}>{col}</option>)}
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* 3. SIMULAÇÃO DE CÁLCULO (AGORA COM AS FERRAMENTAS) */}
      <div className={`bg-slate-50 p-6 rounded-xl border border-slate-200 transition-all duration-300 ${isExpanded ? 'fixed inset-4 z-50 shadow-2xl flex flex-col' : ''}`}>
          
          {/* Header da Tabela */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
             <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Calculator className="text-orange-500" size={20} />
                    3) Pré-visualizar Cálculo
                </h3>
                {!isExpanded && (
                  <p className="text-sm text-slate-500">
                      Simule o cálculo do <strong>Tempo de Programa</strong> antes de finalizar.
                  </p>
                )}
             </div>

             <div className="flex items-center gap-2 flex-wrap">
                {previewData && (
                  <>
                    {/* BARRA DE FERRAMENTAS */}
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input 
                        type="text" 
                        placeholder="Buscar na tabela..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-48"
                      />
                    </div>
                    
                    {/* BOTÃO DE DOWNLOAD (CHAMA A FUNÇÃO DO BACKEND) */}
                    <button 
                      onClick={onDownload}
                      className="p-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                      title="Baixar Excel Completo (.xlsx)"
                    >
                      <Download size={16} />
                    </button>

                    <button 
                      onClick={() => setIsExpanded(!isExpanded)}
                      className={`p-2 border rounded-lg transition-colors ${isExpanded ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                      title={isExpanded ? "Minimizar" : "Expandir"}
                    >
                      {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                  </>
                )}

                <button 
                  onClick={onPreview}
                  disabled={isLoading}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
                >
                  {isLoading ? "Calculando..." : <><TableIcon size={16} /> {previewData ? "Recalcular" : "Simular"}</>}
                </button>
             </div>
          </div>

          {/* Área da Tabela */}
          {previewData && (
              <div className={`animate-in fade-in slide-in-from-top-2 flex-1 flex flex-col ${isExpanded ? 'h-full overflow-hidden' : ''}`}>
                  {!isExpanded && (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-2 rounded-lg text-sm mb-4 font-medium flex justify-between items-center">
                       <span>Data de Referência Calculada: <strong>{formatDisplayDate(previewData.ref_calculada)}</strong></span>
                       <span className="text-xs text-emerald-600 font-normal">{filteredData.length} linhas filtradas (visualização parcial)</span>
                    </div>
                  )}
                  
                  <div className={`bg-white border border-slate-200 rounded-lg overflow-hidden flex-1 ${isExpanded ? 'shadow-inner' : ''}`}>
                      <div className={`overflow-auto ${isExpanded ? 'h-full' : 'max-h-[300px]'}`}>
                          <table className="w-full text-left text-xs text-slate-600 border-collapse">
                              <thead className="bg-slate-50 sticky top-0 shadow-sm z-10">
                                  <tr>
                                      {previewData.data.length > 0 && Object.keys(previewData.data[0]).map(h => (
                                          <th key={h} className="px-4 py-3 font-bold text-slate-700 border-b border-slate-200 bg-slate-50 whitespace-nowrap">
                                              {h}
                                          </th>
                                      ))}
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                  {filteredData.length > 0 ? (
                                    filteredData.map((row, i) => (
                                        <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                                            {Object.values(row).map((val: any, j) => (
                                                <td key={j} className="px-4 py-2 whitespace-nowrap border-r border-slate-50 last:border-0">
                                                    {val}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan={100} className="p-8 text-center text-slate-400">
                                        Nenhum dado encontrado para "{searchTerm}"
                                      </td>
                                    </tr>
                                  )}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          )}
      </div>

      {/* FOOTER */}
      <div className="flex justify-between pt-4">
        <button onClick={onBack} disabled={isLoading} className="px-6 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-medium transition-colors flex items-center gap-2">
          <ArrowLeft size={18} /> Voltar
        </button>
        <button 
          onClick={onSubmit}
          disabled={!configData.benef_id || !configData.ficha_id || !configData.ultima_comp_ref || isLoading}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processando..." : (
            <>Calcular e Finalizar <Play size={18} /></>
          )}
        </button>
      </div>
    </div>
  );
}