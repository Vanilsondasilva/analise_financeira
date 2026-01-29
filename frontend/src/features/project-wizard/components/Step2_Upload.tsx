"use client";
import UploadZone from "@/components/UploadZone"; // Já criado anteriormente

export default function Step2_Upload({ data, onUpdate }: any) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Ingestão de Dados</h2>
        <p className="text-sm text-slate-500">Carregue as bases para a Rodada Inicial (R1).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UploadZone 
          label="Base de Beneficiários"
          file={data.benefFile}
          onFileSelect={(f: File) => onUpdate({ benefFile: f })}
        />
        <UploadZone 
          label="Ficha de Utilização"
          file={data.fichaFile}
          onFileSelect={(f: File) => onUpdate({ fichaFile: f })}
        />
      </div>
    </div>
  );
}