"use client";
import { Input } from "@/components/ui/input"; // Vamos assumir componentes UI básicos
import { Textarea } from "@/components/ui/textarea"; 

export default function Step1_ProjectDetails({ data, onUpdate }: any) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Detalhes do Projeto</h2>
        <p className="text-sm text-slate-500">Defina a identidade da análise para governança.</p>
      </div>

      <div className="grid gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Nome do Projeto *</label>
          <input 
            type="text"
            className="w-full p-3 border rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            placeholder="Ex: Monitoramento Crônicos 2024"
            value={data.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Unidade / Unimed (Opcional)</label>
          <input 
            type="text"
            className="w-full p-3 border rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            placeholder="Ex: 975"
            value={data.unimed}
            onChange={(e) => onUpdate({ unimed: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Descrição</label>
          <textarea 
            className="w-full p-3 border rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-24"
            placeholder="Objetivo da análise..."
            value={data.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}