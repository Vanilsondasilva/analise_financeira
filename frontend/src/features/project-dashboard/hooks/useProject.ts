import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/core/api/client";

// Tipagem estrita do que vem do Python
export interface ProjectDetails {
  id: string;
  name: string;
  description: string;
  created_at: string;
  status: string;
  data_ref: string;
}

export const useProject = (projectId: string) => {
  return useQuery({
    // A chave única deste dado no cache
    queryKey: ["project", projectId],
    
    // A função que vai no Python buscar a verdade
    queryFn: async () => {
      const { data } = await apiClient.get<ProjectDetails>(`/projects/${projectId}`);
      return data;
    },
    
    // Configurações de UX
    enabled: !!projectId, // Só busca se tiver ID
    staleTime: 1000 * 60 * 5, // Cache de 5 minutos
    retry: 1
  });
};