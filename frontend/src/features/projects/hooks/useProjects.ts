import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/core/api/client";

export interface ProjectSummary {
  project_id: string;
  name: string;
  unimed: string;
  created_at: string;
  description: string;
  lives?: number;
  status?: string;
}

export const useProjects = () => {
  return useQuery({
    queryKey: ["projects-list"],
    queryFn: async () => {
      // Busca a lista de projetos do Python
      const { data } = await apiClient.get<ProjectSummary[]>("/projects");
      return data;
    },
    // Garante que a lista atualize sempre que você voltar para a tela
    staleTime: 0, 
    refetchOnWindowFocus: true
  });
};