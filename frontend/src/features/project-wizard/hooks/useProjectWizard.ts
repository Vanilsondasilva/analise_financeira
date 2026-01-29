import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/core/api/client";
import { useRouter } from "next/navigation";

export const useProjectWizard = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // ESTADO CRUCIAL: O ID DO PROJETO (Necessário para o Upload/Preview)
  const [projectId, setProjectId] = useState<string | null>(null);

  // ESTADO: Resultado do preview
  const [calculationPreview, setCalculationPreview] = useState<{
    data: any[], 
    ref_calculada: string 
  } | null>(null);

  // 1. DADOS BÁSICOS
  const [formData, setFormData] = useState({
    name: "",
    unimed: "",
    description: "",
    benefFile: null as File | null,
    fichaFile: null as File | null,
  });

  // 2. DADOS DO SERVIDOR (SUGESTÕES)
  const [mappingData, setMappingData] = useState<{
    beneficiarios: { columns: string[], suggestions: any },
    ficha: { columns: string[], suggestions: any }
  } | null>(null);

  // 3. O MAPEAMENTO (Estado do Passo 3)
  const [finalMapping, setFinalMapping] = useState({
    benef_mapping: {} as Record<string, any>, // identifier é array, resto é string
    ficha_mapping: {} as Record<string, any>
  });

  // 4. CONFIGURAÇÃO (Estado do Passo 4)
  const [configData, setConfigData] = useState({
    ultima_comp_ref: new Date().toISOString().slice(0, 10),
    benef_id: "",
    ficha_id: ""
  });

  // --- HELPERS DE UPDATE ---
  const updateData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const updateMapping = (category: "benef_mapping" | "ficha_mapping", key: string, value: string | string[]) => {
    setFinalMapping(prev => ({
      ...prev,
      [category]: { ...prev[category], [key]: value }
    }));
  };

  const updateConfig = (key: string, value: string) => {
    setConfigData(prev => ({ ...prev, [key]: value }));
  };

  // ========================================================================
  // AÇÕES DO WIZARD (REORGANIZADAS PARA O PREVIEW FUNCIONAR)
  // ========================================================================

  // 1. PASSO 1 -> 2: CRIA O PROJETO E GERA O ID
  const handleCreateProjectStep1 = async () => {
    if (!formData.name) {
        toast.warning("Preencha o nome do projeto.");
        return;
    }
    
    setIsLoading(true);
    try {
      const { data: proj } = await apiClient.post("/projects/create", {
        name: formData.name,
        unimed: formData.unimed
      });
      
      setProjectId(proj.project_id); // <--- SALVA O ID PARA O PASSO 2 USAR
      setCurrentStep(2);
      toast.success("Projeto iniciado. Faça o upload.");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar projeto.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. PASSO 2 -> 3: BUSCA E PROCESSA SUGESTÕES
  // (O Upload já foi feito pelo botão "Carregar & Visualizar" do componente)
  const handleFetchSuggestions = async () => {
    if (!projectId) return toast.error("ID do projeto perdido. Recomece.");

    setIsLoading(true);
    try {
      // Busca sugestões baseadas nos arquivos que já estão lá
      const { data: suggestions } = await apiClient.get(`/mapping/suggestions/${projectId}/R1`);
      
      setMappingData(suggestions);
      
      // --- SUA LÓGICA ORIGINAL DE PROCESSAMENTO (MANTIDA INTTACTA) ---
      const processSuggestions = (sugMap: any) => {
        const clean: any = {};
        Object.keys(sugMap).forEach(key => {
          const val = sugMap[key];
          
          // SE FOR IDENTIFIER: Mantém como Array
          if (key === "identifier") {
            clean[key] = Array.isArray(val) ? val : [];
          } 
          // SE FOR OUTROS CAMPOS: Transforma em Texto
          else {
            if (Array.isArray(val) && val.length > 0) {
              clean[key] = val[0]; 
            } else if (typeof val === "string") {
              clean[key] = val;
            } else {
              clean[key] = "";
            }
          }
        });
        return clean;
      };
      // -------------------------------------------------------------

      setFinalMapping({
        benef_mapping: processSuggestions(suggestions.beneficiarios.suggestions),
        ficha_mapping: processSuggestions(suggestions.ficha.suggestions)
      });

      setCurrentStep(3);
      toast.success("Mapeamento gerado.");

    } catch (error) {
      console.error(error);
      toast.error("Erro ao buscar sugestões. Verifique se fez o upload.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. PASSO 3 -> 4: VALIDA MAPEAMENTO
  const handleValidateMapping = () => {
    const b_ids = finalMapping.benef_mapping["identifier"];
    const f_ids = finalMapping.ficha_mapping["identifier"];

    if (!b_ids || b_ids.length === 0 || !f_ids || f_ids.length === 0) {
      toast.warning("Selecione pelo menos um Identificador para cada base.");
      return;
    }
    
    // Auto-seleciona o ID se houver apenas um
    if (b_ids.length > 0 && !configData.benef_id) updateConfig("benef_id", b_ids[0]);
    if (f_ids.length > 0 && !configData.ficha_id) updateConfig("ficha_id", f_ids[0]);

    setCurrentStep(4);
  };

  // 4. PASSO 4 -> FIM: SUBMIT FINAL
  const submitAnalysis = async () => {
    if (!projectId) return;
    setIsLoading(true);
    
    try {
      // Prepara o payload reorganizando o identifier
      const prepareMapping = (categoryMap: any, chosenId: string) => {
        const ids = categoryMap["identifier"] || [];
        // Coloca o escolhido primeiro
        const newIds = [chosenId, ...ids.filter((x: string) => x !== chosenId)];
        return { ...categoryMap, identifier: newIds };
      };

      const payload = {
        ultima_comp_ref: configData.ultima_comp_ref,
        mapping: {
          benef_mapping: prepareMapping(finalMapping.benef_mapping, configData.benef_id),
          ficha_mapping: prepareMapping(finalMapping.ficha_mapping, configData.ficha_id),
        }
      };

      await apiClient.post(`/analysis/run/${projectId}/R1`, payload);
      
      toast.success("Processamento concluído!");
      router.push(`/dashboard/${projectId}`);
      
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar análise.");
    } finally {
      setIsLoading(false);
    }
  };

  // FUNÇÃO: SIMULAR CÁLCULO (CHAMADA NO PASSO 4) ---
  const handlePreviewCalculation = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      // Prepara o payload igual ao submitAnalysis
      const prepareMapping = (map: any, id: string) => {
        const ids = map["identifier"] || [];
        const newIds = [id, ...ids.filter((x: string) => x !== id)];
        return { ...map, identifier: newIds };
      };

      const payload = {
        ultima_comp_ref: configData.ultima_comp_ref,
        mapping: {
          benef_mapping: prepareMapping(finalMapping.benef_mapping, configData.benef_id),
          // Não precisamos da ficha para calcular TP, mas mandamos vazio ou o real para manter padrão
          ficha_mapping: prepareMapping(finalMapping.ficha_mapping, configData.ficha_id),
        }
      };

      const { data } = await apiClient.post(`/analysis/preview/${projectId}/R1`, payload);
      
      setCalculationPreview({
        data: data.preview,
        ref_calculada: data.ref_calculada
      });
      
      toast.success("Cálculo simulado com sucesso!");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao simular cálculo.");
    } finally {
      setIsLoading(false);
    }
  };

  // FUNÇÃO: DOWNLOAD EXCEL ---
  const handleDownloadFullPreview = async () => {
    if (!projectId) return;
    const toastId = toast.loading("Gerando Excel completo (isso pode levar alguns segundos)...");
    
    try {
      const prepareMapping = (map: any, id: string) => {
        const ids = map["identifier"] || [];
        const newIds = [id, ...ids.filter((x: string) => x !== id)];
        return { ...map, identifier: newIds };
      };

      const payload = {
        ultima_comp_ref: configData.ultima_comp_ref,
        mapping: {
          benef_mapping: prepareMapping(finalMapping.benef_mapping, configData.benef_id),
          ficha_mapping: prepareMapping(finalMapping.ficha_mapping, configData.ficha_id),
        }
      };

      // Chama a rota de download com Blob
      const response = await apiClient.post(`/analysis/download_preview/${projectId}/R1`, payload, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'base_calculada_completa.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.dismiss(toastId);
      toast.success("Download iniciado!");
      
    } catch (e) {
      console.error(e);
      toast.dismiss(toastId);
      toast.error("Erro ao gerar Excel.");
    }
  };

  return {
    currentStep,
    formData,
    isLoading,
    mappingData,
    finalMapping,
    configData,
    projectId, // EXPONDO O ID
    
    updateData,
    updateMapping,
    updateConfig,
    
    nextStep: () => setCurrentStep(p => p + 1),
    prevStep: () => setCurrentStep(p => p - 1),
    
    // NOVAS FUNÇÕES EXPORTADAS
    handleCreateProjectStep1, // Passo 1
    handleFetchSuggestions,   // Passo 2
    handleValidateMapping,    // Passo 3
    submitAnalysis,           // Passo 4
    calculationPreview,
    handlePreviewCalculation,
    handleDownloadFullPreview
  };
};