# Atividades

## Atividade - Criar Projeto
- Objetivo: inicializar contexto analítico.
- Entradas: `name`, `unimed`.
- Saídas: `project_id`, `project.json`, atualização de `index.json`.
- Passo a passo: valida nome → POST create → persistência no store → avanço do wizard.
- Funções executadas: `create_project` (API), `ProjectStore.create_project`.
- Arquivos: `backend/main.py`, `backend/database.py`, `useProjectWizard.ts`.
- Regras: [[Regras de Negocio#RN001 - Nome de projeto obrigatório]].
- Indicadores impactados: base de projetos processados.
- Complexidade: baixa (O(1) para criação).
- Reutilização: **ALTA (REUTILIZÁVEL)**.

## Atividade - Listar Projetos
- Objetivo: recuperar portfólio.
- Entradas: nenhuma.
- Saídas: lista de projetos.
- Funções: `list_projects`, `ProjectStore.list_projects`, `useProjects`.
- Complexidade: baixa.
- Reutilização: **ALTA (REUTILIZÁVEL)**.

## Atividade - Excluir Projeto
- Objetivo: remoção lógica e física.
- Entradas: `project_id`.
- Saídas: projeto removido do índice e diretório apagado.
- Funções: `delete_project_endpoint`, `ProjectStore.delete_project`.
- Regra: exclusão só se existir.
- Complexidade: média (depende do volume de arquivos).
- Reutilização: **MÉDIA (REUTILIZÁVEL)**.

## Atividade - Upload de Arquivos
- Objetivo: envio de bases obrigatórias.
- Entradas: `beneficiarios`, `ficha`.
- Saídas: preview + contagem de linhas.
- Funções: `upload_files`, `handlePreview`.
- Complexidade: média (I/O).
- Reutilização: **ALTA (REUTILIZÁVEL)**.

## Atividade - Leitura de Tabelas
- Objetivo: converter UploadFile em DataFrame robustamente.
- Entradas: arquivo CSV/Excel.
- Saídas: DataFrame string-typed.
- Funções: `read_table`.
- Regra: fallback `;` para `,`.
- Complexidade: média O(n).
- Reutilização: **ALTA (REUTILIZÁVEL)**.

## Atividade - Persistir Inputs
- Objetivo: materializar entradas e hash.
- Entradas: `benef_df`, `ficha_df`.
- Saídas: parquets e `inputs_hash.json`.
- Funções: `save_inputs`, `_sha256_file`.
- Complexidade: média O(n).
- Reutilização: **ALTA (REUTILIZÁVEL)**.

## Atividade - Gerar Sugestoes de Mapeamento
- Objetivo: reduzir esforço manual de de-para.
- Entradas: nomes de colunas.
- Saídas: ranking de candidatos por conceito.
- Funções: `suggest_mapping`, `_norm`.
- Regra: score > 60.
- Complexidade: média/alta (conceitos × sinônimos × colunas).
- Reutilização: **ALTA (REUTILIZÁVEL)**.

## Atividade - Validar Identificadores
- Objetivo: garantir join viável.
- Entradas: mapping selecionado.
- Saídas: avanço de etapa ou bloqueio.
- Funções: `handleValidateMapping`.
- Regras: IDs obrigatórios em ambas as bases.
- Complexidade: baixa.
- Reutilização: **MÉDIA (REUTILIZÁVEL)**.

## Atividade - Simular Tempo de Programa
- Objetivo: validar coerência pré-processamento.
- Entradas: mapping + referência.
- Saídas: preview calculado TP.
- Funções: `preview_calculation`, `compute_tempo_programa`.
- Complexidade: média O(n).
- Reutilização: **ALTA (REUTILIZÁVEL)**.

## Atividade - Exportar Preview em Excel
- Objetivo: auditoria externa do cálculo de TP.
- Entradas: payload de configuração.
- Saídas: arquivo `.xlsx`.
- Funções: `download_preview_excel`.
- Complexidade: média O(n).
- Reutilização: **MÉDIA (REUTILIZÁVEL)**.

## Atividade - Aplicar Mapeamento
- Objetivo: padronizar schema.
- Entradas: DataFrame + de-para.
- Saídas: DataFrame renomeado.
- Funções: `apply_mapping`.
- Complexidade: baixa.
- Reutilização: **ALTA (REUTILIZÁVEL)**.

## Atividade - Calcular Tempo de Programa
- Objetivo: gerar `tempo_programa`, status e grupos TP.
- Entradas: `data_inclusao`, `data_inativacao`, referência.
- Saídas: TP e coorte.
- Funções: `compute_tempo_programa`, `months_diff`.
- Regras: elegibilidade e coortes.
- Complexidade: média O(n).
- Reutilização: **MÉDIA (ESPECÍFICA DO NEGÓCIO SAÚDE)**.

## Atividade - Consolidar Bases
- Objetivo: enriquecer eventos com dados cadastrais.
- Entradas: benef, ficha, colunas ID.
- Saídas: dataset unido com `__id__`.
- Funções: `consolidate`.
- Complexidade: média (merge).
- Reutilização: **ALTA (REUTILIZÁVEL)**.

## Atividade - Calcular Demografia
- Objetivo: normalizar sexo, idade e faixa etária.
- Entradas: `sexo`, `idade`, `nascimento`, `ref_date`.
- Saídas: `faixa_etaria`.
- Funções: `compute_demographics`.
- Complexidade: média O(n).
- Reutilização: **MÉDIA (REUTILIZÁVEL)**.

## Atividade - Calcular Momento Mes
- Objetivo: posicionar evento antes/depois da inclusão.
- Entradas: `atendimento`, `data_inclusao`.
- Saídas: `momento_mes`, `antes_depois`.
- Funções: `compute_momento_mes`.
- Complexidade: média O(n).
- Reutilização: **ALTA (REUTILIZÁVEL)**.

## Atividade - Converter Campos Numéricos
- Objetivo: tornar custos e quantidades agregáveis.
- Entradas: campos textuais numéricos.
- Saídas: `custos_num`, `qtde_usada_num`.
- Funções: `_to_numeric`, `ensure_numeric_cols`.
- Complexidade: média O(n).
- Reutilização: **ALTA (REUTILIZÁVEL)**.

## Atividade - Gerar Comparativo Antes Depois
- Objetivo: calcular tabela executiva de impacto.
- Entradas: dataset com `antes_depois`, IDs, custos.
- Saídas: linhas Antes, Depois, Diferença e %.
- Funções: `measures`, `pivot_antes_depois`.
- Complexidade: média.
- Reutilização: **ALTA (REUTILIZÁVEL)**.

## Atividade - Calcular Tendencia Linear
- Objetivo: projetar custo do próximo mês.
- Entradas: custos agregados por `momento_mes`.
- Saídas: slope, intercept, prediction.
- Funções: `calculate_linear_trend`.
- Complexidade: baixa.
- Reutilização: **ALTA (REUTILIZÁVEL)**.

## Atividade - Detectar Outliers
- Objetivo: identificar ofensores de custo.
- Entradas: custos por beneficiário.
- Saídas: tabela de outliers (z-score > 3).
- Funções: `detect_outliers_user_cost`.
- Complexidade: baixa/média.
- Reutilização: **ALTA (REUTILIZÁVEL)**.

## Atividade - Persistir Outputs
- Objetivo: salvar artefatos finais e status.
- Entradas: consolidated, outliers, trend.
- Saídas: arquivos em `outputs/` e projeto com status Processado.
- Funções: `save_outputs`.
- Complexidade: média.
- Reutilização: **ALTA (REUTILIZÁVEL)**.

## Atividade - Carregar Resultados do Dashboard
- Objetivo: exibir visão inicial do projeto.
- Entradas: project_id.
- Saídas: projeto, resultados e opções de filtro em tela.
- Funções: `ProjectPage.loadAllData`, APIs results/filter-options.
- Complexidade: baixa.
- Reutilização: **MÉDIA (REUTILIZÁVEL)**.

## Atividade - Recalcular por Filtros
- Objetivo: análise interativa por recorte.
- Entradas: `periodo`, `janela`, `grupos`, `agrupamento_assistencial`, `momentoZero`.
- Saídas: novo payload de resultado.
- Funções: `handleRecalculate`, `get_results`.
- Complexidade: média.
- Reutilização: **ALTA (REUTILIZÁVEL)**.

## Atividade - Montar Opcoes de Filtro
- Objetivo: popular dropdowns de filtros disponíveis.
- Entradas: `consolidated_df`.
- Saídas: listas únicas para grupos e agrupamento assistencial.
- Funções: `get_filter_options`.
- Complexidade: baixa.
- Reutilização: **ALTA (REUTILIZÁVEL)**.
