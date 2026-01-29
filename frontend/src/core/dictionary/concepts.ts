// Define a "Verdade Única" sobre o que é cada dado no sistema
export const DATA_DICTIONARY = {
  financeiro: {
    custo_total: {
      label: "Custo Assistencial Total",
      description: "Soma de todos os eventos pagos na competência.",
      format: "currency", // O frontend usa isso para saber como formatar
      color: "red", // Cor padrão para gráficos
      trend_logic: "lower_is_better" // Inteligência: se subir, é ruim
    },
    ticket_medio: {
      label: "Ticket Médio",
      description: "Custo Total dividido por Vidas Ativas.",
      format: "currency",
      color: "blue"
    }
  },
  clinico: {
    vidas_ativas: {
      label: "Beneficiários Ativos",
      format: "number",
      description: "Contagem de CPFs distintos com status ativo."
    }
  }
} as const;

// Hook para consumir o dicionário
export const useConcept = (key: string) => {
  // Lógica para buscar a definição do conceito
  // Retorna label, tooltip explicativo, formatação automática...
};