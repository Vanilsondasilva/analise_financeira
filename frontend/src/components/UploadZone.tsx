"use client";
import { useState } from "react";
import { Upload, FileCheck, Loader2 } from "lucide-react";

export default function UploadZone({ label, onFileSelect, file }: any) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div 
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files[0]) onFileSelect(e.dataTransfer.files[0]);
      }}
      className={`relative group cursor-pointer border-2 border-dashed rounded-[2rem] p-8 transition-all duration-500 flex flex-col items-center justify-center
        ${file ? "border-cyan-500/50 bg-cyan-500/5" : "border-white/10 hover:border-white/30 bg-white/5"}
        ${isDragging ? "scale-105 border-cyan-400 bg-cyan-400/10" : ""}
      `}
    >
      <input 
        type="file" 
        className="absolute inset-0 opacity-0 cursor-pointer" 
        onChange={(e) => e.target.files && onFileSelect(e.target.files[0])}
      />
      
      <div className={`p-4 rounded-full mb-4 transition-transform duration-500 ${file ? "bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]" : "bg-white/10"}`}>
        {file ? <FileCheck className="text-white" /> : <Upload className="text-slate-400" />}
      </div>
      
      <p className="text-sm font-bold text-slate-200">{file ? file.name : label}</p>
      <p className="text-xs text-slate-500 mt-1">{file ? "Arquivo pronto" : "Arraste ou clique para selecionar"}</p>
    </div>
  );
}