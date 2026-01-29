"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Compass, CheckCircle2, AlertCircle, Save, Loader2 } from "lucide-react";

export default function MappingPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mapping, setMapping] = useState({ beneficiarios: {}, ficha: {} });
  
  // URL da porta 8000 do Codespaces
  const API_URL = "https://seu-codespace-8000.app.github.dev";

  useEffect(() => {
    fetch(`${API_URL}/mapping/suggestions/p1/r1`)
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        // Pré-seleciona a sugestão com maior score de cada conceito
        const initialBenef = {};
        Object.keys(resData.beneficiarios.suggestions).forEach(concept => {
          initialBenef[concept] = resData.beneficiarios.suggestions[concept][0]?.[0] || "";
        });
        setMapping(prev => ({ ...prev, beneficiarios: initialBenef }));
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    const res = await fetch(`${API_URL}/mapping/save/p1/r1`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mapping)
    });
    if (res.ok) alert("Mapeamento salvo com sucesso!");
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#020617]">
      <Loader2 className="animate-spin text-cyan-500" size={48} />
    </div>
  );

  return (
    <div className="p-12 max-w-7xl mx-auto">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Conferência de Dados</h1>
          <p className="text-slate-400">Garanta que o motor identifique corretamente as colunas financeiras e clínicas.</p>
        </div>
        <button onClick={handleSave} className="bg-cyan-500 hover:bg-cyan-400 text-black px-8 py-3 rounded-2xl font-bold flex items-center transition-all">
          <Save size={20} className="mr-2" /> Salvar Configuração
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Lado A: Beneficiários */}
        <section className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-cyan-400">
            <CheckCircle2 size={20} /> Base de Beneficiários
          </h3>
          <div className="space-y-6">
            {Object.keys(data.beneficiarios.suggestions).map(concept => (
              <div key={concept} className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">{concept}</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 ring-cyan-500 outline-none"
                  value={mapping.beneficiarios[concept]}
                  onChange={(e) => setMapping({ ...mapping, beneficiarios: { ...mapping.beneficiarios, [concept]: e.target.value } })}
                >
                  <option value="">Selecione a coluna...</option>
                  {data.beneficiarios.columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>

        {/* Lado B: Ficha Médica */}
        <section className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-purple-400">
            <Compass size={20} /> Ficha de Utilização
          </h3>
          <div className="space-y-6">
            {["atendimento", "custos", "codigo_servico", "agrupamento_assistencial"].map(concept => (
              <div key={concept} className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">{concept}</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 ring-purple-500 outline-none"
                  // Lógica similar de alteração de estado...
                >
                  <option value="">Selecione a coluna...</option>
                  {data.ficha.columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}