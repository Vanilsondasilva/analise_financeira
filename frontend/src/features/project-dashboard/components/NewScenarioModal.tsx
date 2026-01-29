"use client";
import React, { useState } from "react";
import { X, Save, Loader2, Layers } from "lucide-react";
import { apiClient } from "@/core/api/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ModalProps {
  projectId: string;
  roundId: string;
  onClose: () => void;
}

export default function NewScenarioModal({ projectId, roundId, onClose }: ModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados do Filtro
  const [name, setName] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [gender, setGender] = useState("all");
  const [group, setGroup] = useState(""); // Filtro de Grupo (TP)

  const handleCreate = async () => {
    if (!name) return toast.warning("Dê um nome ao cenário.");
    
    setIsLoading(true);
    try {
      const payload = {
        name,
        filters: {
          age_min: ageMin ? parseInt(ageMin) : null,
          age_max: ageMax ? parseInt(ageMax) : null,
          gender: gender === "all" ? null : gender,
          group: group || null // Envia o grupo se estiver preenchido
        }
      };

      const { data } = await apiClient.post(`/analysis/scenario/${projectId}/${roundId}`, payload);
      
      toast.success("Cenário criado com sucesso!");
      // Redireciona para a página do novo cenário
      router.push(`/dashboard/${projectId}/cenario/${data.scenario_id}`);
      onClose();
      
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar cenário.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h3 className="font-bold text-slate-800 dark:text-white">Novo Cenário de Análise</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nome do Cenário</label>
            <input 
              type="text" 
              placeholder="Ex: Grupo TP_12" 
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Campo de Grupo (TP) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
               <Layers size={12} /> Grupo (Tempo de Programa)
            </label>
            <input 
              type="text" 
              placeholder="Ex: TP_06, TP_12..." 
              className="w-full p-2 border border-slate-300 rounded-lg uppercase"
              value={group}
              onChange={(e) => setGroup(e.target.value.toUpperCase())}
            />
            <p className="text-[10px] text-slate-400 mt-1">Digite o código exato do grupo (ex: TP_12).</p>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 my-2"></div>
          <p className="text-xs font-bold text-slate-400 uppercase">Filtros Adicionais (Opcional)</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Idade Mínima</label>
              <input 
                type="number" 
                placeholder="0" 
                className="w-full p-2 border border-slate-300 rounded-lg"
                value={ageMin}
                onChange={(e) => setAgeMin(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Idade Máxima</label>
              <input 
                type="number" 
                placeholder="100" 
                className="w-full p-2 border border-slate-300 rounded-lg"
                value={ageMax}
                onChange={(e) => setAgeMax(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gênero</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="g" checked={gender === "all"} onChange={() => setGender("all")} /> Todos
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="g" checked={gender === "M"} onChange={() => setGender("M")} /> Masc.
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="g" checked={gender === "F"} onChange={() => setGender("F")} /> Fem.
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700">Cancelar</button>
          <button 
            onClick={handleCreate} 
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Criar Cenário
          </button>
        </div>

      </div>
    </div>
  );
}