# Processo - Dashboard e Exploracao

## Objetivo
Disponibilizar resultados com filtros para análise executiva e operacional.

## Entradas
Outputs processados + parâmetros de filtro.

## Saídas
KPIs, comparativos, timeline, amostra demográfica, opções de filtro.

## Atividades
- [[Atividade - Carregar Resultados do Dashboard]]
- [[Atividade - Recalcular por Filtros]]
- [[Atividade - Montar Opcoes de Filtro]]

## Regras
[[Regras de Negocio#RN013 - Filtro dentro/fora respeita janela individual]]
[[Regras de Negocio#RN014 - Momento zero opcional]]

## Dados utilizados
`consolidated.parquet`, `trend.json`.

## APIs relacionadas
`GET /analysis/results/{project_id}/{round_id}`, `GET /analysis/filter-options/{project_id}/{round_id}`.

## Módulos relacionados
`backend/main.py`, `frontend/src/app/dashboard/[id]/page.tsx`, `ResultControls`.

## Componentes relacionados
`KpiCard`, `ComparativesTab`, `DemographicsTab`, `ScenariosTab`, `ResultControls`.

## Dependências
Recharts, Axios.

## Reutilização
SIM — camada de consumo analítico para qualquer dashboard de coortes.
