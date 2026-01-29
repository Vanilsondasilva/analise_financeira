import React from "react";
import { Check } from "lucide-react";

export default function WizardSteps({ currentStep }: { currentStep: number }) {
  const steps = [
    { id: 1, label: "Dados" },
    { id: 2, label: "Upload" },
    { id: 3, label: "Mapeamento" },
    { id: 4, label: "Configuração" }
  ];

  return (
    <div className="relative flex justify-between w-full max-w-3xl mx-auto mb-12">
      {/* Linha de fundo */}
      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 -translate-y-1/2 rounded-full" />
      
      {/* Linha de progresso ativa */}
      <div 
        className="absolute top-1/2 left-0 h-1 bg-blue-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-500"
        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} 
      />

      {steps.map((step) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;

        return (
          <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
            <div 
              className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300
                ${isActive ? 'border-blue-500 text-blue-500 bg-white scale-110 shadow-lg shadow-blue-100' : ''}
                ${isCompleted ? 'border-blue-500 bg-blue-500 text-white' : ''}
                ${!isActive && !isCompleted ? 'border-slate-200 text-slate-300' : ''}
              `}
            >
              {isCompleted ? <Check size={18} /> : step.id}
            </div>
            <span className={`text-xs font-medium transition-colors ${isActive || isCompleted ? 'text-slate-700' : 'text-slate-300'}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}