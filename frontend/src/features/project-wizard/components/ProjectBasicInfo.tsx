import React from "react";
import { ArrowRight } from "lucide-react";

interface ProjectBasicInfoProps {
  data: { name: string; unimed: string };
  onUpdate: (data: Partial<{ name: string; unimed: string }>) => void;
  onNext: () => void;
}

export default function ProjectBasicInfo({ data, onUpdate, onNext }: ProjectBasicInfoProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Informações da Carteira</h3>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nome do Projeto <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={data.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Ex: Carteira Ouro 2024"
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Código/Nome da Unimed</label>
            <input 
              type="text" 
              value={data.unimed}
              onChange={(e) => onUpdate({ unimed: e.target.value })}
              placeholder="Ex: 001 ou Unimed Campinas"
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={onNext}
            disabled={!data.name.trim()}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}