# Processo - Pipeline Analitico

## Objetivo
Executar ETL analítico completo e gerar métricas de negócio.

## Entradas
Inputs parquet + mapeamento + data de referência.

## Saídas
`consolidated.parquet`, `outliers.parquet`, `trend.json`, status processado.

## Atividades
- [[Atividade - Aplicar Mapeamento]]
- [[Atividade - Calcular Tempo de Programa]]
- [[Atividade - Consolidar Bases]]
- [[Atividade - Calcular Demografia]]
- [[Atividade - Calcular Momento Mes]]
- [[Atividade - Converter Campos Numéricos]]
- [[Atividade - Gerar Comparativo Antes Depois]]
- [[Atividade - Calcular Tendencia Linear]]
- [[Atividade - Detectar Outliers]]
- [[Atividade - Persistir Outputs]]

## Regras
[[Regras de Negocio#RN009 - Elegibilidade de TP]]
[[Regras de Negocio#RN010 - Join por identificador normalizado]]
[[Regras de Negocio#RN011 - PMPM usa base total da coorte]]
[[Regras de Negocio#RN012 - Outlier por z-score maior que 3]]

## Dados utilizados
[[Entidades de Dados]].

## APIs relacionadas
`POST /analysis/run/{project_id}/{round_id}`.

## Módulos relacionados
`compute.py`, `metrics.py`, `prediction.py`, `outliers.py`, `database.py`.

## Componentes relacionados
Execução iniciada por `useProjectWizard.submitAnalysis`.

## Dependências
Pandas, NumPy, PyArrow.

## Reutilização
SIM — núcleo reutilizável em projetos de impacto antes/depois com dados transacionais.
