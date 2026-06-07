# Backend - Modulos

## Módulo: main.py
- Responsabilidade: API FastAPI e orquestração de processos.
- Dependências: FastAPI, Pandas, NumPy, módulos `src/*`, `database.py`.
- Entradas/Saídas: requests HTTP ↔ JSON/Streaming.
- Processos relacionados: todos.
- Reutilização: **ALTA** para arquiteturas API de pipeline.

## Módulo: database.py
- Responsabilidade: persistência por arquivos e ciclo de vida de projeto/rodada.
- Dependências: pathlib, json, pandas, hashlib, shutil.
- Funções/métodos chave: `_read_json`, `_write_json`, `create_project`, `create_round`, `save_inputs`, `save_config`, `save_outputs`, `load_outputs`.
- Reutilização: **ALTA**.

## Módulo: src/io.py
- Responsabilidade: leitura robusta de tabelas de upload.
- Funções: `read_table`.
- Reutilização: **ALTA**.

## Módulo: src/mapping.py
- Responsabilidade: sugestão fuzzy e aplicação de mapeamento.
- Funções: `_norm`, `suggest_mapping`, `apply_mapping`.
- Reutilização: **ALTA**.

## Módulo: src/compute.py
- Responsabilidade: cálculo de TP, momento temporal, consolidação e demografia.
- Funções: `months_diff`, `compute_ultima_competencia_ref`, `compute_tempo_programa`, `compute_momento_mes`, `consolidate`, `compute_demographics`.
- Reutilização: **MÉDIA** (parte é domínio-específica).

## Módulo: src/metrics.py
- Responsabilidade: normalização numérica, medidas agregadas e comparativos.
- Funções: `_to_numeric`, `ensure_numeric_cols`, `measures`, `pivot_antes_depois`, `analyze_cost_drivers`.
- Reutilização: **ALTA**.

## Módulo: src/prediction.py
- Responsabilidade: regressão linear simples de custos.
- Funções: `calculate_linear_trend`.
- Reutilização: **ALTA**.

## Módulo: src/outliers.py
- Responsabilidade: detecção estatística de outliers por usuário.
- Funções: `detect_outliers_user_cost`.
- Reutilização: **ALTA**.

## Catálogo de funções Python (Etapa 8)

### Funções utilitárias (REUTILIZÁVEL)
- `_now_iso`, `_slug`, `_sha256_file`, `_read_json`, `_json_default`, `_write_json`, `_norm`, `_to_numeric`, `months_diff`, `compute_ultima_competencia_ref`.

### Funções de persistência/API (REUTILIZÁVEL)
- `list_projects`, `read_project`, `create_project`, `delete_project_endpoint`, `upload_files`, `get_mapping_suggestions`, `preview_calculation`, `download_preview_excel`, `run_analysis`, `get_results`, `get_filter_options`.

### Funções analíticas (mistas)
- **REUTILIZÁVEL:** `consolidate`, `ensure_numeric_cols`, `measures`, `pivot_antes_depois`, `analyze_cost_drivers`, `calculate_linear_trend`, `detect_outliers_user_cost`.
- **ESPECÍFICA DO NEGÓCIO:** `compute_tempo_programa`, `compute_momento_mes`, `compute_demographics` (por regras de coorte e semântica assistencial).

## Links
[[Regras de Negocio]] · [[Indicadores]] · [[Algoritmos]] · [[APIs - Endpoints]]
