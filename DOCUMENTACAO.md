# Documentação Completa — Análise Financeira de Coortes de Saúde

> **Projeto:** `analise_financeira`
> **Repositório:** https://github.com/Vanilsondasilva/analise_financeira
> **Tipo de sistema:** Aplicação Web Full-Stack para análise de custos assistenciais em operadoras de saúde (Unimeds/Planos de Saúde).

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura do Sistema](#2-arquitetura-do-sistema)
3. [Fases Macro](#3-fases-macro)
4. [Fases Micro (Detalhamento Técnico)](#4-fases-micro-detalhamento-técnico)
   - [Fase 1 — Gestão de Projetos](#fase-1--gestão-de-projetos)
   - [Fase 2 — Ingestão de Dados (Upload)](#fase-2--ingestão-de-dados-upload)
   - [Fase 3 — Mapeamento de Colunas (De-Para)](#fase-3--mapeamento-de-colunas-de-para)
   - [Fase 4 — Configuração e Validação](#fase-4--configuração-e-validação)
   - [Fase 5 — Pipeline de Análise (ETL + Cálculos)](#fase-5--pipeline-de-análise-etl--cálculos)
   - [Fase 6 — Dashboard de Resultados](#fase-6--dashboard-de-resultados)
5. [Módulos do Backend](#5-módulos-do-backend)
6. [Módulos do Frontend](#6-módulos-do-frontend)
7. [Fluxo de Dados Completo](#7-fluxo-de-dados-completo)
8. [Estrutura de Armazenamento](#8-estrutura-de-armazenamento)
9. [API REST — Endpoints](#9-api-rest--endpoints)
10. [Perguntas e Respostas](#10-perguntas-e-respostas)

---

## 1. Visão Geral

O sistema **Análise Financeira** é uma plataforma web de inteligência assistencial e financeira voltada a operadoras de planos de saúde (Unimeds e similares). Seu objetivo central é permitir que gestores de saúde analisem o **impacto financeiro de programas de saúde** comparando o custo assistencial dos beneficiários **antes** e **depois** da entrada em um programa.

### Problema que resolve

Operadoras de saúde gerenciam programas (de prevenção, crônicos, oncológicos, etc.) e precisam responder perguntas como:

- Os beneficiários custam **menos** depois que entram no programa?
- Qual é o **perfil demográfico** (idade, sexo, tempo no programa) dos beneficiários?
- Quais são os beneficiários que mais **concentram custos** (outliers)?
- Qual é a **tendência** futura dos custos com base no histórico?
- Como o custo se comporta ao longo dos **meses relativos** à inclusão no programa?

### Tecnologias utilizadas

| Camada     | Tecnologia             | Versão    |
|------------|------------------------|-----------|
| Backend    | Python / FastAPI        | 0.110.0   |
| Backend    | Pandas                  | 2.2.3     |
| Backend    | NumPy                   | 2.1.2     |
| Backend    | PyArrow (Parquet)       | 17.0.0    |
| Backend    | RapidFuzz (Fuzzy Match) | 3.9.7     |
| Backend    | OpenPyXL (Excel)        | 3.1.5     |
| Frontend   | Next.js (React)         | App Router|
| Frontend   | TypeScript              | —         |
| Frontend   | Tailwind CSS            | —         |
| Frontend   | Recharts                | —         |
| Frontend   | Framer Motion           | —         |
| Infra      | Docker / Docker Compose | —         |

---

## 2. Arquitetura do Sistema

```
┌──────────────────────────────────────────────────────────────┐
│                        USUÁRIO (Navegador)                     │
└──────────────────┬───────────────────────────────────────────┘
                   │  HTTP / REST
                   ▼
┌──────────────────────────────────────────────────────────────┐
│         FRONTEND — Next.js (porta 3000)                        │
│                                                                │
│  /projetos/catalogo  → Catálogo de projetos                    │
│  /projetos/novo      → Wizard de criação (4 passos)            │
│  /dashboard/:id      → Dashboard de resultados                  │
└──────────────────┬───────────────────────────────────────────┘
                   │  HTTP / REST (NEXT_PUBLIC_API_URL)
                   ▼
┌──────────────────────────────────────────────────────────────┐
│         BACKEND — FastAPI (porta 8000)                         │
│                                                                │
│  Rotas de Projetos   /projects/*                               │
│  Rotas de Upload     /upload/:project_id/:round_id             │
│  Rotas de Mapping    /mapping/suggestions/*                    │
│  Rotas de Análise    /analysis/run|preview|results/*           │
│  Rotas de Filtros    /analysis/filter-options/*                │
└──────────────────┬───────────────────────────────────────────┘
                   │  Leitura/Escrita de arquivos
                   ▼
┌──────────────────────────────────────────────────────────────┐
│         ARMAZENAMENTO — Sistema de Arquivos (Parquet + JSON)   │
│                                                                │
│  storage/projects/                                             │
│    index.json                 ← Catálogo de projetos           │
│    {project_id}/              ← Pasta do projeto               │
│      project.json             ← Metadados do projeto           │
│      rounds/{round_id}/       ← Pasta da rodada                │
│        inputs/                ← Arquivos Parquet originais     │
│        config/                ← Mapeamento e configurações     │
│        outputs/               ← Resultados processados         │
└──────────────────────────────────────────────────────────────┘
```

> **Nota:** O sistema não utiliza banco de dados relacional (SQL). Toda a persistência é feita em arquivos Parquet (para DataFrames) e JSON (para metadados e configurações), gerenciados pela classe `ProjectStore` no `database.py`.

---

## 3. Fases Macro

O sistema é organizado em **6 fases macro** que representam o ciclo completo de uma análise:

| # | Fase Macro             | Descrição Resumida                                                   |
|---|------------------------|----------------------------------------------------------------------|
| 1 | **Criação de Projeto** | O usuário define o nome e a operadora para iniciar uma nova análise. |
| 2 | **Ingestão de Dados**  | Upload das bases de beneficiários e ficha financeira (CSV ou Excel). |
| 3 | **Mapeamento**         | Correlação automática (com fuzzy matching) das colunas dos arquivos. |
| 4 | **Configuração**       | Definição da data de referência, identificadores e preview do cálculo.|
| 5 | **Processamento**      | Pipeline ETL: cálculos de TP, demographics, métricas, outliers, tendência. |
| 6 | **Visualização**       | Dashboard interativo com KPIs, gráficos, comparativos e demográficos. |

---

## 4. Fases Micro (Detalhamento Técnico)

### Fase 1 — Gestão de Projetos

**Onde acontece:** `frontend/src/features/project-wizard/`, `backend/main.py`, `backend/database.py`

**O que faz:**
- O usuário acessa o **Catálogo de Projetos** (`/projetos/catalogo`) e visualiza todos os projetos existentes (em formato grade ou lista).
- Ao clicar em "Novo Projeto", inicia o **Wizard de 4 passos** (`/projetos/novo`).
- No **Passo 1**, o usuário preenche:
  - **Nome do projeto** (ex: "Programa Hipertensão Q1 2025")
  - **Unimed/Operadora** (ex: "Unimed Campinas")
- O frontend faz um `POST /projects/create` ao backend.
- O backend gera um `project_id` único com timestamp (ex: `20250615_143022_Programa_Hipertensao_Q1`) e cria a estrutura de pastas.
- O projeto é registrado no `index.json` central com metadados (name, unimed, created_at, status: "Rascunho").

**Micro-passos:**
1. Preenchimento do formulário de dados básicos.
2. Validação: Nome é obrigatório.
3. Chamada `POST /projects/create` → backend cria pasta e retorna `project_id`.
4. Frontend armazena o `project_id` no estado do wizard para uso nas próximas etapas.
5. Avanço automático para o Passo 2.

---

### Fase 2 — Ingestão de Dados (Upload)

**Onde acontece:** `frontend/src/features/project-wizard/components/FileUploadStep.tsx`, `backend/src/io.py`, `backend/main.py` (rota `/upload`)

**O que faz:**
- O usuário faz upload de **dois arquivos obrigatórios**:
  - **Base de Beneficiários:** Contém dados cadastrais (CPF/ID, data de inclusão, data de inativação, data de nascimento, sexo).
  - **Ficha de Utilização (Financeira):** Contém dados de eventos assistenciais (identificador, data de atendimento, custo, quantidade utilizada, código/descrição do serviço, agrupamento assistencial, idade).
- Formatos aceitos: `.csv` (separado por `;` ou `,`) e `.xlsx`/`.xls`.

**Micro-passos:**
1. O usuário arrasta ou seleciona os arquivos nas duas zonas de upload (UploadZone).
2. O frontend monta um `FormData` com os dois arquivos.
3. Chamada `POST /upload/{project_id}/{round_id}` (round padrão: `R1`).
4. **Backend — módulo `src/io.py` (`read_table`):**
   - Detecta o formato pelo nome do arquivo (`.csv` ou `.xlsx`).
   - Lê o CSV tentando separador `;` e, em caso de falha, tenta `,`.
   - Todas as colunas são lidas como `dtype=str` para evitar erros de tipo.
5. Os DataFrames são salvos como **Parquet** em `inputs/beneficiarios.parquet` e `inputs/ficha.parquet`.
6. Um hash SHA-256 de cada arquivo é calculado e salvo em `inputs_hash.json` para auditoria.
7. O backend retorna um **preview das primeiras 50 linhas** de cada arquivo para o frontend exibir.
8. O usuário pode visualizar o preview na interface antes de prosseguir.

---

### Fase 3 — Mapeamento de Colunas (De-Para)

**Onde acontece:** `frontend/src/features/project-wizard/components/MappingStep.tsx`, `backend/src/mapping.py`, `backend/main.py` (rota `/mapping/suggestions`)

**O que faz:**
- As colunas dos arquivos enviados geralmente têm nomes variados entre operadoras (ex: "CPF_U", "cpf_usuario", "id_beneficiario" — todas representam o mesmo conceito de identificador).
- O sistema usa **Fuzzy Matching** (biblioteca `rapidfuzz`) para sugerir automaticamente a correspondência entre os nomes das colunas do arquivo e os conceitos padronizados do sistema.

**Conceitos padronizados — Base de Beneficiários (`BENEF_CONCEPTS`):**

| Conceito Interno   | Descrição                              |
|--------------------|----------------------------------------|
| `identifier`       | CPF, matrícula ou código único         |
| `data_inclusao`    | Data de entrada no programa            |
| `data_inativacao`  | Data de saída/cancelamento             |
| `nascimento`       | Data de nascimento                     |
| `sexo`             | Sexo biológico (M/F)                   |

**Conceitos padronizados — Ficha de Utilização (`FICHA_CONCEPTS`):**

| Conceito Interno           | Descrição                                    |
|----------------------------|----------------------------------------------|
| `identifier`               | CPF ou código para join com beneficiários    |
| `atendimento`              | Data do evento/atendimento                   |
| `custos`                   | Valor financeiro do evento                   |
| `qtde_usada`               | Quantidade utilizada                         |
| `chv_internamento`         | Chave de internação (agrupamento)            |
| `agrupamento_assistencial` | Grupo de despesa (ex: Consultas, Exames)     |
| `codigo_servico`           | Código TUSS/procedimento                     |
| `descricao_servico`        | Descrição do procedimento                    |
| `idade`                    | Idade do beneficiário na ficha               |

**Micro-passos:**
1. Frontend faz `GET /mapping/suggestions/{project_id}/R1`.
2. **Backend — `suggest_mapping` em `src/mapping.py`:**
   - Normaliza todos os nomes de colunas (remove acentos, espaços extras, transforma em minúsculas).
   - Para cada conceito, calcula a similaridade de cada sinônimo com cada coluna usando `fuzz.WRatio`.
   - Aceita apenas sugestões com similaridade > 60%.
   - Retorna lista ordenada de candidatos por score para cada conceito.
3. Frontend exibe os conceitos com dropdowns pré-selecionados com a melhor sugestão.
4. O usuário pode confirmar ou corrigir o mapeamento de cada coluna.
5. O campo `identifier` é especial: aceita múltiplas seleções (array), pois o usuário escolhe qual coluna de ID usar para o join no Passo 4.
6. Validação: Pelo menos um identificador deve ser selecionado em cada base antes de prosseguir.

---

### Fase 4 — Configuração e Validação

**Onde acontece:** `frontend/src/features/project-wizard/components/ConfigurationStep.tsx`, `backend/main.py` (rotas `/analysis/preview` e `/analysis/download_preview`)

**O que faz:**
- O usuário define os parâmetros finais antes de rodar a análise completa:
  1. **Data de Referência (Última Competência):** Mês/ano que serve como "hoje" para o cálculo do Tempo de Programa. Normalmente é o último mês com dados disponíveis.
  2. **Identificador da Base de Beneficiários:** Qual coluna de ID usar para o join (quando há múltiplos candidatos).
  3. **Identificador da Ficha Financeira:** Qual coluna de ID usar para o join.

**Funcionalidade de Preview:**
- Antes de rodar a análise completa, o usuário pode simular o cálculo do **Tempo de Programa** nas primeiras 50 linhas.
- O backend aplica o mapeamento e calcula o TP para essas linhas, retornando uma tabela de preview com colunas como `tempo_programa`, `tempo_programa_status`, `grupos`.
- O usuário também pode **baixar um Excel completo** com todos os registros calculados (sem rodar a análise completa do pipeline).

**Micro-passos:**
1. Seleção de data de referência (campo de data, default: data atual).
2. Seleção do identificador final (benef e ficha).
3. (Opcional) Clique em "Simular Cálculo" → `POST /analysis/preview/{project_id}/R1`.
4. (Opcional) Clique em "Baixar Excel" → `POST /analysis/download_preview/{project_id}/R1` → download do arquivo `.xlsx`.
5. Clique em "Processar Análise Completa" → `POST /analysis/run/{project_id}/R1`.

---

### Fase 5 — Pipeline de Análise (ETL + Cálculos)

**Onde acontece:** `backend/main.py` (rota `/analysis/run`), `backend/src/compute.py`, `backend/src/metrics.py`, `backend/src/prediction.py`, `backend/src/outliers.py`

Esta é a fase central do sistema. Ao receber o `POST /analysis/run`, o backend executa o seguinte pipeline sequencial:

#### 5.1 — Carregamento dos Inputs
- Lê `beneficiarios.parquet` e `ficha.parquet` do diretório `inputs/` da rodada.
- Salva a configuração de mapeamento e data de referência em `config/`.

#### 5.2 — Mapeamento (Renomeação de Colunas)
- **`src/mapping.py` — `apply_mapping`:** Inverte o dicionário de mapeamento (de `{conceito: coluna_original}` para `{coluna_original: conceito}`) e renomeia as colunas do DataFrame.
- Apenas colunas com valores não-nulos no mapeamento são renomeadas; as demais permanecem com seus nomes originais.

#### 5.3 — Cálculo do Tempo de Programa (TP)
- **`src/compute.py` — `compute_tempo_programa`:**
  - Converte `data_inclusao` e `data_inativacao` para período mensal (dia 1 do mês).
  - **Regra do Fim:** Se o beneficiário ainda está ativo, usa a `ultima_comp_ref` como data fim. Se inativado, usa o mês de inativação.
  - **TP = diferença em meses** entre a data de inclusão e a data fim.
  - Beneficiários com `data_inclusao >= data_fim` recebem status `"DATA DE INCLUSÃO NÃO PERMITE CÁLCULO"` e são marcados como `"Não Elegível"`.
  - Beneficiários sem data de inclusão recebem status `"SEM DATA INCLUSÃO"`.
  - Beneficiários válidos recebem **grupos de coorte**: `"TP_01"`, `"TP_02"`, ..., `"TP_24"` etc. (formato zero-padded).

#### 5.4 — Consolidação (Join das Bases)
- **`src/compute.py` — `consolidate`:**
  - Cria coluna `__id__` em ambas as bases normalizando o identificador (strip de espaços, cast para string).
  - Executa um `LEFT JOIN` da ficha financeira com os beneficiários pelo `__id__`.
  - Resultado: cada linha da ficha ganha as informações de TP e dados cadastrais do beneficiário correspondente.

#### 5.5 — Cálculo Demográfico
- **`src/compute.py` — `compute_demographics`:**
  - **Sexo:** Normaliza para `"M"` ou `"F"` (pega o primeiro caractere em maiúsculas).
  - **Idade:** Prioriza a coluna `idade` da ficha (se existir e for válida). Caso contrário, calcula a partir de `nascimento` e da `ref_date`.
  - **Faixas Etárias:** Classifica em 10 grupos: `0-18`, `19-23`, `24-28`, `29-33`, `34-38`, `39-43`, `44-48`, `49-53`, `54-58`, `59+`.

#### 5.6 — Cálculo do Momento Mês
- **`src/compute.py` — `compute_momento_mes`:**
  - Para cada evento (linha da ficha), calcula a diferença em dias entre `atendimento` e `data_inclusao`.
  - Converte para meses (arredondando para cima o valor absoluto e preservando o sinal).
  - **Momento negativo:** O evento aconteceu **antes** da inclusão no programa (período pré-programa).
  - **Momento positivo:** O evento aconteceu **depois** da inclusão (período pós-programa).
  - **Momento zero:** O evento aconteceu no mesmo dia da inclusão.
  - Adiciona colunas `momento_mes` (número) e `antes_depois` (`"Antes"`, `"Depois"` ou `"Momento zero"`).

#### 5.7 — Conversão Numérica Robusta
- **`src/metrics.py` — `ensure_numeric_cols`:**
  - Converte `custos` para numérico, tratando o formato brasileiro (vírgula como decimal).
  - Converte `qtde_usada` para numérico.
  - Preenche custos nulos com `0.0`.

#### 5.8 — Geração de Métricas Comparativas (Antes vs. Depois)
- **`src/metrics.py` — `pivot_antes_depois`:**
  - Agrupa eventos em `"Antes"` e `"Depois"`.
  - Para cada período calcula:
    - **Custo Total** (soma dos custos)
    - **N. Usuários com Utilizações** (contagem distinta de IDs com eventos)
    - **Custo Médio Usuário com Utilização** (custo total ÷ usuários com eventos)
    - **N. Usuários Base Total** (coorte completa, inclui quem não teve evento)
    - **Custo Médio Usuários Total / PMPM** (custo total ÷ coorte total)
  - Calcula as linhas de **Diferença** (Depois − Antes) e **Variação %** para cada métrica.

#### 5.9 — Cálculo de Tendência Linear
- **`src/prediction.py` — `calculate_linear_trend`:**
  - Agrupa custos por `momento_mes` (apenas eventos pós-inclusão, `momento_mes > 0`).
  - Ajusta uma regressão linear simples `y = mx + b` usando `numpy.polyfit`.
  - Retorna: coeficiente angular (`slope`), intercepto (`intercept`), **previsão para o próximo mês** (`prediction`), e vetores `x`, `y`, `trend_y` para o gráfico.

#### 5.10 — Detecção de Outliers
- **`src/outliers.py` — `detect_outliers_user_cost`:**
  - Agrega o custo total por beneficiário (`identifier`).
  - Calcula o **Z-Score** de cada beneficiário: `(custo − média) / desvio_padrão`.
  - Beneficiários com Z-Score > 3.0 são considerados **outliers** (custam muito mais que a média).
  - Retorna DataFrame ordenado por custo decrescente com os outliers identificados.

#### 5.11 — Salvamento dos Resultados
- **`database.py` — `save_outputs`:**
  - Salva `consolidated.parquet`: DataFrame completo com todos os cálculos.
  - Salva `outliers.parquet`: DataFrame dos outliers detectados.
  - Salva `trend.json`: JSON com os dados de tendência linear.
  - Atualiza o `index.json` do projeto com `status: "Processado"` e o número de vidas únicas.

---

### Fase 6 — Dashboard de Resultados

**Onde acontece:** `frontend/src/features/project-dashboard/`, `backend/main.py` (rota `/analysis/results`)

**O que faz:**
- Exibe os resultados processados em um dashboard interativo com múltiplas abas e filtros dinâmicos.

#### 6.1 — Filtros Dinâmicos
- **Período:** `"dentro"` (eventos dentro da janela do TP de cada beneficiário), `"fora"` ou `"ambos"`.
- **Janela:** Número máximo de meses a considerar como "dentro" (default: 24 meses).
- **Grupos (TP):** Filtra por coortes específicas (`TP_01`, `TP_06`, etc.).
- **Agrupamento Assistencial:** Filtra por tipo de despesa (Consultas, Exames, Internações, etc.).
- **Momento Zero:** Inclui ou exclui eventos do dia de inclusão.

#### 6.2 — KPIs Principais
| KPI                  | Descrição                                              |
|----------------------|--------------------------------------------------------|
| **Vidas (Coorte)**   | Total de beneficiários elegíveis na base               |
| **Custo Total**      | Soma de todos os custos no período/filtro selecionado  |
| **PMPM**             | Custo médio por membro por mês (custo ÷ coorte total)  |
| **Previsão**         | Valor previsto para o próximo mês (regressão linear)   |

#### 6.3 — Aba: Comparativos (Antes vs. Depois)
- Tabela com as métricas `pivot_antes_depois` para os períodos Antes e Depois.
- Colunas: Custo Total Assistencial, PMPM, Ticket Médio dos Utilizadores, Usuários com Sinistro.
- Exibe diferença em R$ e variação percentual.
- Indicadores visuais: seta vermelha ↑ (custo subiu = ruim), seta verde ↓ (custo caiu = bom).

#### 6.4 — Aba: Demográficos
- **Cards de resumo:** Total de vidas, Idade Média, Tempo Médio de Programa.
- **Gráfico de Gênero:** Pizza (donut) com distribuição Masculino/Feminino/Não Informado.
- **Gráfico de Faixa Etária:** Barras verticais com as 10 faixas etárias.
- **Gráfico de Grupos TP:** Barras horizontais mostrando quantas vidas estão em cada coorte (TP_01 a TP_N).

#### 6.5 — Gráfico de Timeline (Custos ao Longo do Tempo)
- Linha de custo total por `momento_mes` (apenas eventos pós-inclusão).
- Sobreposto com a linha de tendência linear calculada no pipeline.

#### 6.6 — Lógica de Filtro Dentro/Fora
O filtro "dentro/fora" **respeita o tempo de programa individual de cada beneficiário**:
- Para cada beneficiário, a janela é `min(tempo_programa, janela_configurada)` meses.
- Um evento está "dentro" se `|momento_mes| ≤ janela_individual`.
- Isso garante que um beneficiário com TP de 3 meses não seja comparado numa janela de 24 meses.

---

## 5. Módulos do Backend

### `main.py`
Ponto de entrada da API FastAPI. Define todas as rotas REST e orquestra as chamadas aos módulos especializados.

### `database.py` — Classe `ProjectStore`
Gerencia todo o ciclo de vida dos projetos e rodadas no sistema de arquivos.

| Método               | Descrição                                                        |
|----------------------|------------------------------------------------------------------|
| `create_project`     | Cria pasta do projeto e registra no `index.json`                 |
| `delete_project`     | Remove do `index.json` e apaga pasta física (shutil.rmtree)      |
| `create_round`       | Cria subpastas (inputs, config, outputs, audit, reports)         |
| `save_inputs`        | Salva DataFrames como Parquet + hash SHA-256                     |
| `load_inputs`        | Carrega Parquets dos inputs                                      |
| `save_config`        | Persiste mapeamento e configurações como JSON                    |
| `save_outputs`       | Salva Parquets de saída + atualiza status no index               |
| `load_outputs`       | Carrega Parquets de saída e JSON de tendência                    |

### `src/io.py` — Leitura de Arquivos
- `read_table(file)`: Lê UploadFile do FastAPI como DataFrame. Suporta CSV (`;` e `,`) e Excel.

### `src/mapping.py` — Mapeamento de Colunas
- `suggest_mapping(columns, concepts)`: Fuzzy matching para sugerir De-Para.
- `apply_mapping(df, mapping)`: Renomeia colunas conforme o mapeamento definido.

### `src/compute.py` — Cálculos Centrais
- `compute_tempo_programa(df, ultima_comp_ref)`: Calcula TP, status e grupos de coorte.
- `consolidate(benef, ficha, id_benef, id_ficha)`: Faz o join das bases pelo identificador.
- `compute_demographics(df, ref_date)`: Calcula sexo normalizado, idade e faixas etárias.
- `compute_momento_mes(df)`: Calcula posição temporal relativa à inclusão (Antes/Depois).

### `src/metrics.py` — Métricas e KPIs
- `ensure_numeric_cols(df)`: Converte custos/quantidade para numérico (formato BR).
- `measures(df, id_col)`: Calcula métricas básicas (custo, qtd, n_usuários, médias).
- `pivot_antes_depois(df, base_total_users)`: Gera tabela comparativa Antes vs. Depois.
- `analyze_cost_drivers(df)`: Análise de Pareto por grupo assistencial, top procedimentos e top beneficiários.

### `src/prediction.py` — Tendência Linear
- `calculate_linear_trend(df)`: Regressão linear sobre custos mensais pós-inclusão.

### `src/outliers.py` — Detecção de Outliers
- `detect_outliers_user_cost(df, z_thresh=3.0)`: Identifica beneficiários com Z-Score > threshold.

---

## 6. Módulos do Frontend

### `features/project-wizard/`
Wizard de 4 passos para criação de novo projeto.
- **`hooks/useProjectWizard.ts`:** Estado centralizado do wizard (dados, mapeamento, config, loading).
- **`components/WizardSteps.tsx`:** Barra de progresso visual dos 4 passos.
- **`components/ProjectBasicInfo.tsx`:** Formulário do Passo 1 (nome, operadora).
- **`components/FileUploadStep.tsx`:** Upload com preview dos dados (Passo 2).
- **`components/MappingStep.tsx`:** Interface De-Para com dropdowns (Passo 3).
- **`components/ConfigurationStep.tsx`:** Data de referência, IDs, preview e submit (Passo 4).

### `features/projects/`
Gerenciamento do catálogo de projetos.
- **`components/ProjectList.tsx`:** Lista/grid de projetos com cards.
- **`components/ViewToggle.tsx`:** Toggle entre visualização grade e lista.

### `features/project-dashboard/`
Dashboard de resultados de uma análise.
- **`components/ComparativesTab.tsx`:** Tabela Antes vs. Depois com formatação monetária.
- **`components/DemographicsTab.tsx`:** Gráficos demográficos (gênero, idade, TP).
- **`components/ResultControls.tsx`:** Painel de filtros (período, janela, grupos, assistencial).
- **`components/ProjectHeader.tsx`:** Cabeçalho com nome do projeto e metadata.
- **`components/ScenariosTab.tsx`:** Aba de cenários e análise de drivers de custo.
- **`layouts/ProjectLayout.tsx`:** Layout geral do dashboard com abas.

### `components/`
- **`KpiCard.tsx`:** Card de KPI com mini-gráfico sparkline.
- **`UploadZone.tsx`:** Componente de drag-and-drop para upload de arquivos.

### `core/api/client.ts`
Cliente Axios configurado com a URL base da API (`NEXT_PUBLIC_API_URL`).

---

## 7. Fluxo de Dados Completo

```
USUÁRIO
  │
  ├── 1. Cria Projeto (nome + operadora)
  │      └── POST /projects/create → project_id gerado
  │
  ├── 2. Upload de Arquivos
  │      ├── beneficiarios.csv / .xlsx  ─┐
  │      └── ficha.csv / .xlsx          ─┴── POST /upload/{project_id}/R1
  │                                           └── Parquet salvo em inputs/
  │
  ├── 3. Mapeamento de Colunas
  │      └── GET /mapping/suggestions/{project_id}/R1
  │             └── Fuzzy match → sugestões De-Para
  │                 └── Usuário confirma/ajusta
  │
  ├── 4. Configuração
  │      ├── Define data de referência
  │      ├── Define identificadores de join
  │      ├── (Opcional) Preview → POST /analysis/preview/{project_id}/R1
  │      └── (Opcional) Excel → POST /analysis/download_preview/{project_id}/R1
  │
  ├── 5. Processamento → POST /analysis/run/{project_id}/R1
  │      ├── apply_mapping (renomeia colunas)
  │      ├── compute_tempo_programa (TP + grupos de coorte)
  │      ├── consolidate (join benef ↔ ficha)
  │      ├── compute_demographics (sexo, idade, faixas)
  │      ├── compute_momento_mes (Antes/Depois)
  │      ├── ensure_numeric_cols (converte custos)
  │      ├── pivot_antes_depois (métricas comparativas)
  │      ├── calculate_linear_trend (tendência)
  │      └── detect_outliers_user_cost (Z-Score)
  │             └── Resultados salvos em outputs/
  │
  └── 6. Dashboard → GET /analysis/results/{project_id}/R1?...
         ├── KPIs (vidas, custo total, PMPM, previsão)
         ├── Timeline (custos por momento_mes)
         ├── Comparativos (Antes vs. Depois)
         └── Raw Data (demográficos por vida única)
```

---

## 8. Estrutura de Armazenamento

```
storage/
└── projects/
    ├── index.json                          ← Catálogo com todos os projetos
    ├── _current.json                       ← Projeto/rodada atualmente selecionado
    └── {project_id}/
        ├── project.json                    ← Metadados (nome, unimed, datas, status)
        └── rounds/
            └── {round_id}/
                ├── round.json              ← Metadados da rodada
                ├── inputs/
                │   ├── beneficiarios.parquet
                │   ├── ficha.parquet
                │   └── inputs_hash.json    ← SHA-256 e contagens de linhas
                ├── config/
                │   ├── mapping.json        ← Mapeamento De-Para confirmado
                │   ├── analysis_config.json ← Data de referência
                │   └── filters.json        ← Filtros salvos (se houver)
                ├── outputs/
                │   ├── consolidated.parquet ← Dataset completo processado
                │   ├── outliers.parquet    ← Beneficiários outliers
                │   └── trend.json          ← Regressão linear
                ├── audit/                  ← (Reservado para auditoria futura)
                └── reports/                ← (Reservado para relatórios futuros)
```

---

## 9. API REST — Endpoints

| Método   | Endpoint                                       | Descrição                                                  |
|----------|------------------------------------------------|------------------------------------------------------------|
| `GET`    | `/projects`                                    | Lista todos os projetos                                    |
| `GET`    | `/projects/{project_id}`                       | Retorna metadados de um projeto                            |
| `POST`   | `/projects/create`                             | Cria novo projeto → retorna `project_id`                   |
| `DELETE` | `/projects/{project_id}`                       | Deleta projeto e seus arquivos físicos                     |
| `POST`   | `/upload/{project_id}/{round_id}`              | Upload dos dois arquivos; retorna preview de 50 linhas     |
| `GET`    | `/mapping/suggestions/{project_id}/{round_id}` | Retorna sugestões fuzzy de mapeamento De-Para               |
| `POST`   | `/analysis/preview/{project_id}/{round_id}`    | Simula cálculo de TP (preview de 50 linhas)                |
| `POST`   | `/analysis/download_preview/{project_id}/{round_id}` | Baixa Excel completo com TP calculado               |
| `POST`   | `/analysis/run/{project_id}/{round_id}`        | Executa pipeline completo de análise                       |
| `GET`    | `/analysis/results/{project_id}/{round_id}`    | Retorna KPIs, timeline, comparativos e demográficos        |
| `GET`    | `/analysis/filter-options/{project_id}/{round_id}` | Retorna opções únicas para dropdowns de filtro         |

**Query params de `/analysis/results`:**
- `periodo`: `dentro` | `fora` | `ambos` (default: `dentro`)
- `momentoZero`: `true` | `false` (default: `false`)
- `janela`: inteiro em meses (default: `24`)
- `grupos`: lista de coortes TP (ex: `grupos=TP_01&grupos=TP_06`)
- `agrupamento_assistencial`: lista de grupos de despesa

---

## 10. Perguntas e Respostas

### Sobre o Projeto em Geral

**Q: O que é o "Tempo de Programa" (TP)?**
> É o número de **meses** que um beneficiário está cadastrado no programa de saúde. É calculado como a diferença entre o mês de inclusão e o mês de referência (ou de inativação, se o beneficiário saiu do programa). Beneficiários com TP_01 estão há 1 mês, TP_12 há 12 meses, etc. Esse indicador é fundamental para agrupar beneficiários em "coortes" com tempo de exposição similar.

---

**Q: O que são "coortes" neste contexto?**
> Uma coorte é um grupo de beneficiários que entrou no programa no mesmo período ou que tem o mesmo tempo de programa. No sistema, as coortes são identificadas pelos grupos `TP_01`, `TP_02`, ... `TP_N`. Isso permite comparar o comportamento de custo de grupos com diferentes maturidades no programa.

---

**Q: O que significa "Momento Mês"?**
> É a posição temporal de cada evento assistencial em relação à data de inclusão do beneficiário no programa. Um evento no "Momento -3" ocorreu 3 meses **antes** da inclusão; no "Momento +6" ocorreu 6 meses **depois**. Evento no "Momento 0" ocorreu no mesmo dia da inclusão. Esse eixo temporal permite visualizar como o custo evolui ao redor do ponto de entrada no programa.

---

**Q: O que é o PMPM?**
> PMPM significa **Per Member Per Month** (Por Membro Por Mês). No sistema, é calculado como o custo total dividido pelo número total de vidas na coorte (não apenas as que tiveram eventos). É o indicador padrão de sinistralidade per capita usado por operadoras de saúde.

---

**Q: Por que o sistema usa dois arquivos de entrada?**
> Os dados de saúde nas operadoras geralmente ficam em sistemas separados:
> - A **Base de Beneficiários** vem do sistema de cadastro (gestão de vidas) e contém dados cadastrais e datas de entrada/saída.
> - A **Ficha de Utilização** (ou ficha financeira) vem do sistema de processamento de contas e contém cada evento assistencial com seu custo.
> O sistema faz o join dessas duas fontes para enriquecer cada evento com os dados cadastrais do beneficiário.

---

**Q: O que acontece se um beneficiário da ficha financeira não existir na base de beneficiários?**
> O join é feito com `LEFT JOIN` da ficha para os beneficiários. Beneficiários que aparecem na ficha mas não na base de beneficiários ficam com os campos cadastrais nulos (TP, sexo, data de nascimento, etc.). Eles são incluídos nos cálculos de custo, mas podem aparecer com dados demográficos como "N/I" ou "Sem Data".

---

**Q: O que são "outliers" no sistema?**
> São beneficiários cujo custo total acumulado é muito maior do que a média dos demais. O sistema usa o **Z-Score**: calcula a média e o desvio padrão dos custos de todos os beneficiários e marca como outlier quem tem Z-Score > 3,0 (ou seja, mais de 3 desvios padrão acima da média). Esses casos geralmente representam internações de alto custo, tratamentos oncológicos ou doenças crônicas não controladas.

---

**Q: O que é a "Tendência Linear" exibida no gráfico?**
> É o resultado de uma **regressão linear simples** sobre os custos mensais pós-inclusão (`momento_mes > 0`). A linha de tendência mostra se os custos estão crescendo (slope positivo) ou caindo (slope negativo) ao longo do tempo de programa. O sistema também projeta o valor estimado para o **próximo mês** fora da série histórica.

---

**Q: Como funciona o filtro "Dentro" e "Fora" do período?**
> O filtro respeita o Tempo de Programa individual de cada beneficiário, não uma janela fixa para todos:
> - **Janela Individual** = `min(TP do beneficiário, janela configurada)`.
> - Um evento está **"dentro"** se `|momento_mes| ≤ janela_individual`.
> - Isso evita distorções: um beneficiário com TP de 3 meses não contamina a análise de uma janela de 24 meses.

---

**Q: O sistema suporta múltiplos projetos ao mesmo tempo?**
> Sim. Cada projeto é independente e armazenado em sua própria pasta. Não há limite no número de projetos. O catálogo (`/projetos/catalogo`) lista todos os projetos existentes.

---

**Q: O que são "rodadas" (rounds)?**
> Uma rodada é uma análise dentro de um projeto. O conceito permite que o mesmo projeto tenha múltiplas análises (ex: "R1" para o primeiro semestre e "R2" para o segundo semestre), mantendo o histórico. Atualmente, o wizard cria sempre a rodada `R1`, mas a estrutura do backend suporta múltiplas rodadas.

---

**Q: O sistema armazena dados em banco de dados?**
> Não. O sistema usa um **armazenamento baseado em arquivos**: DataFrames são salvos em formato **Parquet** (eficiente para grandes volumes de dados tabulares) e metadados em **JSON**. Isso facilita a portabilidade, não requer configuração de banco de dados e é suficiente para os volumes de dados típicos de uma operadora regional.

---

**Q: Quais formatos de arquivo são aceitos no upload?**
> `.csv` (com separador `;` ou `,`) e `.xlsx` / `.xls`. O sistema tenta automaticamente o separador `;` primeiro para CSV (padrão brasileiro) e cai para `,` em caso de falha.

---

**Q: O sistema faz alguma análise de Pareto?**
> Sim. O módulo `src/metrics.py` possui a função `analyze_cost_drivers` que calcula:
> 1. **Pareto por Grupo Assistencial:** Participação percentual de cada grupo de despesa no custo total (top 15).
> 2. **Top Procedimentos:** Os 20 procedimentos com maior custo total.
> 3. **Top Beneficiários (Ofensores):** Os 20 beneficiários com maior custo total e sua participação no custo do pool.

---

**Q: Como o sistema identifica o conceito de cada coluna automaticamente?**
> Usando **Fuzzy Matching** com a biblioteca `rapidfuzz`. O algoritmo `fuzz.WRatio` compara cada nome de coluna do arquivo enviado com uma lista de sinônimos pré-definidos para cada conceito (como "cpf", "matricula", "carteirinha" para o conceito `identifier`). A correspondência é aceita apenas se a similaridade for superior a 60%. O usuário pode corrigir as sugestões antes de prosseguir.

---

**Q: Posso baixar os dados calculados sem rodar a análise completa?**
> Sim. No Passo 4 do wizard, há um botão "Baixar Excel" que chama a rota `/analysis/download_preview` e retorna um arquivo `.xlsx` com todos os registros da base de beneficiários já com as colunas `tempo_programa`, `tempo_programa_status` e `grupos` calculadas, sem executar o pipeline completo (join com ficha, métricas, outliers, etc.).

---

**Q: Qual é o fluxo mínimo para ter um resultado?**
> 1. Criar projeto (nome + operadora).
> 2. Upload dos dois arquivos.
> 3. Confirmar mapeamento (as sugestões automáticas geralmente já são suficientes).
> 4. Definir data de referência e clicar em "Processar Análise Completa".
> 5. O sistema redireciona automaticamente para o dashboard de resultados.
> O fluxo completo leva tipicamente menos de 2 minutos para bases de até algumas centenas de milhares de linhas.
