"use client";
import React from "react";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

interface MappingStepProps {
  mappings: {
    beneficiarios: { columns: string[], suggestions: any };
    ficha: { columns: string[], suggestions: any };
  };
  currentMapping: any;
  // Agora onUpdateMapping precisa aceitar array para o caso de multiselect
  onUpdateMapping: (category: "benef_mapping" | "ficha_mapping", key: string, value: string | string[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function MappingStep({ 
  mappings, currentMapping, onUpdateMapping, onBack, onNext 
}: MappingStepProps) {

  // Campos específicos do seu negócio (Hardcoded conforme seu snippet antigo)
  const benefFields = ["data_inclusao", "data_inativacao", "nascimento", "sexo"];
  const fichaFields = ["atendimento", "custos", "idade", "codigo_servico", "agrupamento_assistencial", "chv_internamento", "descricao_servico"];

  const renderSelect = (category: "benef_mapping" | "ficha_mapping", label: string, key: string, options: string[]) => {
    const value = currentMapping[category]?.[key];
    const singleValue = Array.isArray(value) ? value[0] : value || ""; // Garante string para o select

    return (
      <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0" key={key}>
        <div className="w-1/3">
          <span className="text-xs font-bold text-slate-600 uppercase block">{label}</span>
          <span className="text-[10px] text-slate-400 font-mono">{key}</span>
        </div>
        <ArrowRight size={12} className="text-slate-300" />
        <div className="w-1/2">
          <select 
            value={singleValue}
            onChange={(e) => onUpdateMapping(category, key, e.target.value)}
            className={`w-full p-2 text-sm rounded border ${singleValue ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200'}`}
          >
            <option value="">(Não usar / Não tenho)</option>
            {options.map(col => <option key={col} value={col}>{col}</option>)}
          </select>
        </div>
      </div>
    );
  };

  const renderMultiIdentifier = (category: "benef_mapping" | "ficha_mapping", options: string[]) => {
    // Lógica simplificada: Tratamos como um select múltiplo visual, mas salvamos array
    const current = currentMapping[category]?.["identifier"] || [];
    
    return (
      <div className="mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <label className="block text-sm font-bold text-slate-800 mb-2">
          IDENTIFICADORES (Candidatos)
        </label>
        <p className="text-xs text-slate-500 mb-2">Selecione todas as colunas que podem identificar o usuário (CPF, Carteirinha, ID...). Você escolherá qual usar no próximo passo.</p>
        
        <div className="max-h-32 overflow-y-auto border border-slate-300 bg-white rounded p-2 grid grid-cols-2 gap-2">
          {options.map(col => (
            <label key={col} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-slate-50 p-1 rounded">
              <input 
                type="checkbox"
                checked={current.includes(col)}
                onChange={(e) => {
                  const newValue = e.target.checked 
                    ? [...current, col]
                    : current.filter((c: string) => c !== col);
                  onUpdateMapping(category, "identifier", newValue);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className={current.includes(col) ? "font-bold text-blue-700" : "text-slate-600"}>{col}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LADO BENEFICIÁRIOS */}
        <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-purple-100">
             <div className="w-3 h-3 bg-purple-500 rounded-full" />
             <h3 className="font-bold text-slate-800">Beneficiários</h3>
          </div>
          
          {renderMultiIdentifier("benef_mapping", mappings.beneficiarios.columns)}
          
          <div className="space-y-1">
            {benefFields.map(field => 
              renderSelect("benef_mapping", field.replace("_", " "), field, mappings.beneficiarios.columns)
            )}
          </div>
        </div>

        {/* LADO FICHA */}
        <div className="bg-white p-5 rounded-xl border border-cyan-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-cyan-100">
             <div className="w-3 h-3 bg-cyan-500 rounded-full" />
             <h3 className="font-bold text-slate-800">Ficha Financeira</h3>
          </div>

          {renderMultiIdentifier("ficha_mapping", mappings.ficha.columns)}

          <div className="space-y-1">
             {fichaFields.map(field => 
               renderSelect("ficha_mapping", field.replace("_", " "), field, mappings.ficha.columns)
             )}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="px-6 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-medium transition-colors flex items-center gap-2">
          <ArrowLeft size={18} /> Voltar (Upload)
        </button>
        <button 
          onClick={onNext}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
        >
          Salvar e Configurar <CheckCircle2 size={18} />
        </button>
      </div>
    </div>
  );
}