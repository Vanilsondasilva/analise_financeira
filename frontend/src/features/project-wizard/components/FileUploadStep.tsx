import React, { useRef, useState } from "react";
import { UploadCloud, FileText, X, ArrowLeft, ArrowRight, Eye, CheckCircle2, Loader2 } from "lucide-react";
import { apiClient } from "@/core/api/client";

interface FileUploadStepProps {
  data: { benefFile: File | null; fichaFile: File | null };
  // Adicione estas props se não estiverem vindo do pai, 
  // mas vamos tentar usar o que temos.
  // Se o hook pai gerencia o upload, vamos criar uma função local para o preview.
  projectId?: string; 
  roundId?: string;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export default function FileUploadStep({ data, onUpdate, onNext, onBack, isLoading, projectId, roundId = "R1" }: FileUploadStepProps) {
  
  // Estados locais apenas para o Preview
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previews, setPreviews] = useState<{ benef: any[], ficha: any[] } | null>(null);
  const [stats, setStats] = useState({ rowsBen: 0, rowsFicha: 0 });

  // Input de Arquivo (Visual)
  const FileInput = ({ label, fileKey, currentFile, colorClass }: any) => {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
      <div className="flex-1">
        <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
        {!currentFile ? (
          <div onClick={() => inputRef.current?.click()} className={`border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all ${colorClass}`}>
            <UploadCloud size={32} className="mb-2 opacity-50" />
            <span className="text-sm font-medium text-slate-500">Selecionar Arquivo</span>
            <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => e.target.files?.[0] && onUpdate({ [fileKey]: e.target.files[0] })} />
          </div>
        ) : (
          <div className="border border-emerald-200 bg-emerald-50/30 rounded-xl p-4 flex items-center justify-between h-40">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0"><FileText size={20} /></div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-slate-700 truncate">{currentFile.name}</p>
                <p className="text-xs text-slate-400">{(currentFile.size/1024/1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button onClick={() => { onUpdate({ [fileKey]: null }); setPreviews(null); }} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full"><X size={18} /></button>
          </div>
        )}
      </div>
    );
  };

  // Lógica LOCAL para buscar o preview sem avançar o passo
  const handlePreview = async () => {
    if (!data.benefFile || !data.fichaFile) return alert("Selecione os arquivos primeiro.");
    // Se o projectId não vier por prop (dependendo do seu hook), avise.
    // Assumindo que o projeto já foi criado no passo 1.
    if (!projectId) return alert("ID do Projeto não encontrado. Volte e avance novamente.");

    setPreviewLoading(true);
    const formData = new FormData();
    formData.append("beneficiarios", data.benefFile);
    formData.append("ficha", data.fichaFile);

    try {
      const res = await apiClient.post(`/upload/${projectId}/${roundId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setStats({ rowsBen: res.data.rows_benef, rowsFicha: res.data.rows_ficha });
      setPreviews({ benef: res.data.preview_benef, ficha: res.data.preview_ficha });
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar preview.");
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-5xl mx-auto">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Upload e Validação</h3>

        {/* INPUTS */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <FileInput label="Beneficiários" fileKey="benefFile" currentFile={data.benefFile} colorClass="border-purple-200 text-purple-500" />
          <FileInput label="Ficha Financeira" fileKey="fichaFile" currentFile={data.fichaFile} colorClass="border-cyan-200 text-cyan-500" />
        </div>

        {/* BOTÃO DE PREVIEW (A DEMANDA SOLICITADA) */}
        <div className="flex justify-center mb-8">
           <button 
             onClick={handlePreview}
             disabled={!data.benefFile || !data.fichaFile || previewLoading}
             className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-medium transition-colors disabled:opacity-50"
           >
             {previewLoading ? <Loader2 className="animate-spin" size={16} /> : <Eye size={16} />}
             {previews ? "Atualizar Visualização" : "Carregar & Visualizar Bases"}
           </button>
        </div>

        {/* ÁREA DE PREVIEW (TABELAS) */}
        {previews && (
          <div className="space-y-6 animate-in slide-in-from-top-2 mb-8 border-t border-slate-100 pt-6">
            <PreviewTable title="Beneficiários" count={stats.rowsBen} data={previews.benef} color="bg-purple-500" />
            <PreviewTable title="Ficha Financeira" count={stats.rowsFicha} data={previews.ficha} color="bg-cyan-500" />
          </div>
        )}

        {/* FOOTER NAVEGAÇÃO */}
        <div className="flex justify-between pt-4 border-t border-slate-100">
          <button onClick={onBack} disabled={isLoading} className="px-6 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-medium flex items-center gap-2"><ArrowLeft size={18} /> Voltar</button>
          
          <button onClick={onNext} disabled={!data.benefFile || !data.fichaFile || isLoading} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-50">
            {isLoading ? "Processando..." : <>Próximo: Mapear <ArrowRight size={18} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

// Subcomponente de Tabela com Scroll (50 linhas)
function PreviewTable({ title, count, data, color }: any) {
  if (!data || data.length === 0) return null;
  const headers = Object.keys(data[0]);
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
      <div className="px-4 py-2 bg-white border-b border-slate-200 flex items-center gap-2 text-xs font-bold uppercase text-slate-700">
        <div className={`w-2 h-2 rounded-full ${color}`}></div> {title} ({count.toLocaleString()} linhas)
      </div>
      <div className="overflow-auto max-h-[300px]">
        <table className="w-full text-left text-xs text-slate-600 border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>{headers.map(h => <th key={h} className="px-4 py-2 border-b border-slate-200 bg-slate-50 whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {data.map((row: any, i: number) => (
              <tr key={i} className="hover:bg-blue-50/30">
                {headers.map(h => <td key={h} className="px-4 py-2 whitespace-nowrap border-r border-slate-50 last:border-0 max-w-[200px] truncate" title={String(row[h])}>{row[h]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}