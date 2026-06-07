# APIs - Endpoints

## Projetos
### GET /projects
- Objetivo: listar projetos.
- Resposta: array de projetos.
- Módulos: `main.py:list_projects`, `ProjectStore.list_projects`.

### GET /projects/{project_id}
- Objetivo: ler metadados de projeto.
- Erros: 404 se não encontrado.

### POST /projects/create
- Objetivo: criar projeto.
- Body: `{name, unimed}`.
- Resposta: `{project_id, status}`.

### DELETE /projects/{project_id}
- Objetivo: remover projeto.

## Upload e mapeamento
### POST /upload/{project_id}/{round_id}
- Objetivo: salvar inputs e retornar preview.
- FormData: `beneficiarios`, `ficha`.

### GET /mapping/suggestions/{project_id}/{round_id}
- Objetivo: retornar sugestões fuzzy por conceito.

## Pré-processamento
### POST /analysis/preview/{project_id}/{round_id}
- Objetivo: simular TP e retornar preview.

### POST /analysis/download_preview/{project_id}/{round_id}
- Objetivo: exportar Excel com base calculada de TP.
- Resposta: stream de arquivo xlsx.

## Pipeline e consumo
### POST /analysis/run/{project_id}/{round_id}
- Objetivo: executar pipeline completo.
- Body: mapping + `ultima_comp_ref`.

### GET /analysis/results/{project_id}/{round_id}
- Objetivo: retornar KPIs e datasets para dashboard.
- Query: `periodo`, `momentoZero`, `janela`, `grupos[]`, `agrupamento_assistencial[]`.

### GET /analysis/filter-options/{project_id}/{round_id}
- Objetivo: opções únicas para dropdowns.

## Reutilização
- **ALTA:** desenho REST por processo.
- **ESPECÍFICA:** payload e semântica de coorte assistencial.

## Links
[[Processo - Ingestao de Dados]] · [[Processo - Pipeline Analitico]] · [[Fluxos de Dados]]
