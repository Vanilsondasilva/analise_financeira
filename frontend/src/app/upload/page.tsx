"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Database, FileSpreadsheet, Loader2, CheckCircle2 } from "lucide-react";
import UploadZone from "@/components/UploadZone";

export default function UploadPage() {
  const [benefFile, setBenefFile] = useState<File | null>(null);
  const [fichaFile, setFichaFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success">("idle");

  const handleStartAnalysis = async () => {
    if (!benefFile || !fichaFile) return;
    setStatus("uploading");
    
    // Simulando o envio para o seu FastAPI (Port 8000)
    const formData = new FormData();
    formData.append("beneficiarios", benefFile);
    formData.append("ficha", fichaFile);

    try {
      // Use a URL pública do seu backend aqui
      const response = await fetch("https://seu-codespace-8000.app.github.dev/upload/p1/r1", {
        method: "POST",
        body: formData,
      });
      if (response.ok) setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("idle");
    }
  };

  return (
    <div className="p-12 max-w-5xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-black tracking-tight mb-2">Ingestão de Dados</h1>
        <p className="text-slate-400">Envie as bases para iniciar o processamento das coortes de saúde.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-widest px-2">
            <Database size={14} /> Base de Beneficiários
          </div>
          <UploadZone 
            label="Arraste o arquivo de beneficiários" 
            file={benefFile} 
            onFileSelect={setBenefFile} 
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-widest px-2">
            <FileSpreadsheet size={14} /> Ficha de Utilização
          </div>
          <UploadZone 
            label="Arraste a ficha médica (utilizações)" 
            file={fichaFile} 
            onFileSelect={setFichaFile} 
          />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleStartAnalysis}
        disabled={!benefFile || !fichaFile || status === "uploading"}
        className={`w-full py-6 rounded-[2rem] font-black text-xl flex items-center justify-center transition-all shadow-2xl ${
          status === "success" 
            ? "bg-green-500 text-white" 
            : "bg-gradient-to-r from-cyan-600 to-blue-700 text-white disabled:opacity-20"
        }`}
      >
        {status === "idle" && "INICIAR PROCESSAMENTO PREDITIVO"}
        {status === "uploading" && <><Loader2 className="animate-spin mr-3" /> ANALISANDO BASES...</>}
        {status === "success" && <><CheckCircle2 className="mr-3" /> BASES PRONTAS PARA MAPEAMENTO</>}
      </motion.button>
    </div>
  );
}