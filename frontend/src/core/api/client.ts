import axios from "axios";
import { toast } from "sonner"; // Biblioteca profissional de notificações

export const apiClient = axios.create({
  baseURL: "https://shiny-funicular-g4xg9qjpxjr6hjr7-8000.app.github.dev/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptador de Resposta (A Inteligência de Erro)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Logar erro silencioso para o desenvolvedor (Sentry, Datadog)
    console.error("[API_ERROR]", error);

    // 2. Traduzir erro para o usuário (Inteligência de UX)
    const message = error.response?.data?.detail || "Ocorreu um erro inesperado.";
    
    if (error.response?.status === 401) {
      toast.error("Sessão expirada. Faça login novamente.");
      // Redirecionar para login...
    } else if (error.response?.status >= 500) {
      toast.error("Erro no motor de processamento. Nossa equipe foi notificada.");
    } else {
      toast.warning(message);
    }

    return Promise.reject(error);
  }
);