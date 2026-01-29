"use client";
import React from "react";
import WizardSteps from "@/features/project-wizard/components/WizardSteps";
import ProjectBasicInfo from "@/features/project-wizard/components/ProjectBasicInfo";
import FileUploadStep from "@/features/project-wizard/components/FileUploadStep";
import MappingStep from "@/features/project-wizard/components/MappingStep";
import ConfigurationStep from "@/features/project-wizard/components/ConfigurationStep";
import { useProjectWizard } from "@/features/project-wizard/hooks/useProjectWizard";

export default function NewProjectPage() {
  const { 
    // Estados
    currentStep, 
    formData, 
    isLoading, 
    mappingData, 
    finalMapping, 
    configData,
    projectId, // <--- NOVO: Precisamos disso para o UploadStep
    
    // Ações de Update
    updateData, 
    updateMapping, 
    updateConfig, 
    
    // Navegação e Handlers Atualizados
    prevStep, 
    handleCreateProjectStep1, // Substitui o nextStep genérico no passo 1
    handleFetchSuggestions,   // Substitui o handleUploadAndNext no passo 2
    handleValidateMapping,    // Validação passo 3 -> 4
    submitAnalysis,            // Finalização passo 4
    calculationPreview,        // <--- NOVO
    handlePreviewCalculation,  // <--- NOVO
    handleDownloadFullPreview
  } = useProjectWizard();

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 fade-in min-h-screen">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
          Configuração do Projeto
        </h1>
        <p className="text-slate-500 mt-2">
          {currentStep === 1 && "Defina os dados básicos da operadora."}
          {currentStep === 2 && "Faça o upload dos dados para análise."}
          {currentStep === 3 && "Mapeie as colunas (De-Para)."}
          {currentStep === 4 && "Configure a referência e o cruzamento."}
        </p>
      </div>

      <WizardSteps currentStep={currentStep} />

      <div className="mt-8">
        {/* PASSO 1 - Criação do Projeto */}
        {currentStep === 1 && (
          <ProjectBasicInfo 
            data={formData} 
            onUpdate={updateData} 
            onNext={handleCreateProjectStep1} // <--- ALTERADO: Cria projeto e gera ID
          />
        )}

        {/* PASSO 2 - Upload com Preview */}
        {currentStep === 2 && (
          <FileUploadStep 
            data={formData} 
            projectId={projectId || ""} // <--- NOVO: Passa o ID gerado no passo 1
            roundId="R1"                // <--- NOVO: Define a rodada inicial
            onUpdate={updateData} 
            onBack={prevStep}
            onNext={handleFetchSuggestions} // <--- ALTERADO: Apenas busca sugestões (upload já foi feito)
            isLoading={isLoading}
          />
        )}

        {/* PASSO 3 - Mapeamento Detalhado */}
        {currentStep === 3 && mappingData && (
          <MappingStep 
            mappings={mappingData}
            currentMapping={finalMapping}
            onUpdateMapping={updateMapping}
            onBack={prevStep}
            onNext={handleValidateMapping}
          />
        )}

        {/* PASSO 4 - Configuração (Data + Join ID) */}
        {currentStep === 4 && mappingData && (
          <ConfigurationStep 
            benefCols={mappingData.beneficiarios.columns}
            fichaCols={mappingData.ficha.columns}
            mappedBenefIds={finalMapping.benef_mapping["identifier"] || []}
            mappedFichaIds={finalMapping.ficha_mapping["identifier"] || []}
            configData={configData}
            onUpdate={updateConfig}
            onBack={prevStep}
            onSubmit={submitAnalysis}
            isLoading={isLoading}
            onPreview={handlePreviewCalculation}
            previewData={calculationPreview}
            onDownload={handleDownloadFullPreview}
          />
        )}
      </div>
    </div>
  );
}