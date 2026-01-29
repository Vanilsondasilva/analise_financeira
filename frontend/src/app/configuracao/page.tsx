"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Calendar, Fingerprint, Play, Loader2 } from "lucide-react";

export default function ConfigPage() {
  const [date, setDate] = useState("2025-11-01");
  const [isRunning, setIsRunning] = useState(false);
  
  // URL da porta 8000 do Codespaces
  const API_URL = "https://seu-codespace-8000.app.github.dev";

  const handleStartAnalysis = async () => {
    setIsRunning(true);
    // Recupera o mapeamento salvo (deve estar no seu estado global ou Context API)
    const savedMapping = { 
      benef_mapping: { identifier: ["CPF_U"], data_inclusao: "DATA INCLUSAO" },
      ficha_mapping: { identifier: ["CPF_U"], custos: "CUSTOS", atendimento: "ATENDIMENTO" }
    };

    try {
      const res = await fetch(`${API_URL}/analysis/run/p1/r1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ultima_comp_ref: date,
          mapping: savedMapping
        })
      });
      if (res.ok) alert("✅ Motor de cálculo finalizado! Verifique os Resultados.");
    } catch (e) {
      alert("❌ Falha no processamento.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-12 max-w-4xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-black tracking-tight mb-2">Setup do Motor</h1>
        <p className="text-slate-400 font-medium">Parâmetros clínicos e financeiros para a base consolidada.</p>
      </header>

      <div className="space-y-8">
        {/* Card 1: Data de Referência [cite: 120] */}
        <section className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="text-cyan-400" />
            <h3 className="text-xl font-bold">Última Competência Fechada</h3>
          </div>
          <p className="text-sm text-slate-500 mb-6">Referência para o cálculo de Tempo de Programa (TP) dos ativos.</p>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-white/10 border-none rounded-2xl p-4 text-white font-bold outline-none ring-2 ring-transparent focus:ring-cyan-500 transition-all"
          />
        </section>

        {/* Card 2: Status do Identificador [cite: 121] */}
        <section className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] opacity-50">
          <div className="flex items-center gap-3 mb-4">
            <Fingerprint className="text-slate-400" />
            <h3 className="text-xl font-bold text-slate-400">Identificador Chave</h3>
          </div>
          <p className="text-xs font-mono bg-white/10 p-3 rounded-xl inline-block text-cyan-400">PRIMARY_KEY: CPF_U</p>
        </section>

        {/* Botão de Ignição */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStartAnalysis}
          disabled={isRunning}
          className="w-full py-6 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[2rem] font-black text-2xl flex items-center justify-center shadow-3xl shadow-cyan-900/20"
        >
          {isRunning ? (
            <><Loader2 className="animate-spin mr-3" /> CALCULANDO COORTES...</>
          ) : (
            <><Play className="mr-3" /> RODAR ANÁLISE CONSOLIDADA</>
          )}
        </motion.button>
      </div>
    </div>
  );
}