# Componentes Reutilizaveis

## ALTA REUTILIZAÇÃO
- `backend/src/io.py::read_table` — ingestão tabular.
- `backend/src/mapping.py::suggest_mapping/apply_mapping` — padronização de schema.
- `backend/src/metrics.py::ensure_numeric_cols/measures/pivot_antes_depois` — agregação comparativa.
- `backend/src/prediction.py::calculate_linear_trend` — tendência linear.
- `backend/src/outliers.py::detect_outliers_user_cost` — ofensores por estatística.
- `frontend/src/core/api/client.ts` — cliente HTTP com tratamento de erro.
- `frontend/src/components/ui/*` + `KpiCard`, `UploadZone` — blocos de UI.

## MÉDIA REUTILIZAÇÃO
- `compute_demographics` (depende de campos esperados).
- `ResultControls` (filtros adaptáveis a dashboards analíticos).
- `ProjectLayout` e `AnalysisLayout`.

## BAIXA REUTILIZAÇÃO / ESPECÍFICA DO NEGÓCIO
- `compute_tempo_programa` e `compute_momento_mes` com semântica de programa assistencial.
- fluxo de wizard de saúde (`MappingStep`, `ConfigurationStep`).

## Possíveis projetos de reaproveitamento
- Análises de programas de prevenção em saúde pública.
- Programas de fidelização com comparação antes/depois por coorte temporal.
- Auditoria financeira de jornadas de cliente com eventos transacionais.

## Dependências por componente
Ver [[Dependencias e Matriz]].
