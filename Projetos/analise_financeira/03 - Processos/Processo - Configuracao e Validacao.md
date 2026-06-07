# Processo - Configuracao e Validacao

## Objetivo
Definir parâmetros de cálculo e validar o resultado antes do processamento completo.

## Entradas
Data de referência, IDs escolhidos, mapeamento consolidado.

## Saídas
Preview de TP, arquivo Excel calculado, configuração persistida.

## Atividades
- [[Atividade - Simular Tempo de Programa]]
- [[Atividade - Exportar Preview em Excel]]

## Regras
[[Regras de Negocio#RN007 - Última competência normalizada no dia 1]]
[[Regras de Negocio#RN008 - ID escolhido deve ser priorizado]]

## Dados utilizados
`analysis_config.json`, `mapping.json`.

## APIs relacionadas
`POST /analysis/preview/{project_id}/{round_id}`, `POST /analysis/download_preview/{project_id}/{round_id}`.

## Módulos relacionados
`backend/main.py`, `backend/src/compute.py`, `frontend/.../ConfigurationStep.tsx`.

## Componentes relacionados
`ConfigurationStep`, `useProjectWizard`.

## Dependências
Pandas, OpenPyXL.

## Reutilização
SIM — etapa de validação pré-processamento útil em pipelines críticos.
