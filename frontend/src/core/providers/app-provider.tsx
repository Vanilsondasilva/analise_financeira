"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "sonner"; 

// Configuração do Cliente de Dados (Cache e Performance)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Tenta reconectar 1 vez se falhar
      refetchOnWindowFocus: false, // Não recarrega ao mudar de aba
      staleTime: 1000 * 60 * 5, // Cache de 5 minutos
    },
  },
});

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="health-engine-theme">
        {children}
        {/* Sistema de Notificações Global */}
        <Toaster position="top-right" richColors closeButton /> 
      </ThemeProvider>
    </QueryClientProvider>
  );
}