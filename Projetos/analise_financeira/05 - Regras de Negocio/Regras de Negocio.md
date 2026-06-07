# Regras de Negocio

## RN001 - Nome de projeto obrigatório
- Objetivo: evitar projetos sem identificação.
- Descrição: criação de projeto exige `name`.
- Fórmula: `if not name -> bloquear`.
- Exemplo: vazio retorna aviso no wizard.
- Impacto: impede registro inválido.
- Processos: Gestão de Projetos.
- Funções: `handleCreateProjectStep1`.
- Campos: `name`.
- Indicadores: n/a.

## RN002 - Dois arquivos obrigatórios
- Objetivo: garantir dados mínimos de análise.
- Descrição: upload exige beneficiários e ficha.
- Fórmula: `benefFile != null && fichaFile != null`.
- Impacto: sem ambas as fontes não há consolidação.
- Processos: Ingestão.
- Funções: `FileUploadStep`, `upload_files`.

## RN003 - Formatos aceitos
- Descrição: somente `.csv`, `.xlsx`, `.xls`.
- Funções: `read_table`.

## RN004 - CSV com fallback de separador
- Descrição: tenta `;` e, em falha, `,`.
- Funções: `read_table`.

## RN005 - Score mínimo de similaridade
- Descrição: sugestão fuzzy aceita score > 60.
- Funções: `suggest_mapping`.

## RN006 - Identifier obrigatório
- Descrição: cada base deve ter ao menos um identificador selecionado.
- Funções: `handleValidateMapping`.

## RN007 - Última competência normalizada no dia 1
- Descrição: data de referência vira primeiro dia do mês.
- Fórmula: `Timestamp(year, month, 1)`.
- Funções: `compute_ultima_competencia_ref`.

## RN008 - ID escolhido é priorizado
- Descrição: no submit/preview o ID selecionado vai para posição 0 no array.
- Funções: `prepareMapping` em `useProjectWizard`.

## RN009 - Elegibilidade do TP
- Descrição: se `data_inclusao` ausente ou `inclusao >= fim`, não elegível.
- Saídas: status `SEM DATA INCLUSÃO` ou `DATA DE INCLUSÃO NÃO PERMITE CÁLCULO`.
- Funções: `compute_tempo_programa`.

## RN010 - Join por identificador normalizado
- Descrição: IDs são `str.strip()` em `__id__` antes do merge.
- Funções: `consolidate`.

## RN011 - PMPM usa base total da coorte
- Fórmula: `pmpm = custo_total / base_total_users`.
- Funções: `get_results`, `pivot_antes_depois`.

## RN012 - Outlier por z-score > 3
- Fórmula: `z = (x - média)/desvio`; outlier se `z > 3`.
- Funções: `detect_outliers_user_cost`.

## RN013 - Dentro/Fora respeita janela individual
- Fórmula: `janela_individual = min(tempo_programa, janela)`; dentro se `|momento_mes| <= janela_individual`.
- Funções: `get_results`.

## RN014 - Momento zero opcional
- Descrição: quando `momentoZero=false`, remove `momento_mes == 0`.
- Funções: `get_results`.

## RN015 - Custo em formato BR convertido para numérico
- Descrição: vírgula decimal é normalizada para ponto quando não há ponto.
- Funções: `_to_numeric`, `ensure_numeric_cols`.

## RN016 - Catálogo é fonte de status do projeto
- Descrição: após processamento, `status` vira `Processado` e grava `lives`.
- Funções: `save_outputs`.

## Classificação
- **Regras reutilizáveis:** RN002, RN003, RN004, RN005, RN010, RN012, RN015.
- **Regras específicas do negócio:** RN007, RN009, RN011, RN013, RN014.
