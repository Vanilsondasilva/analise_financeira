# Indicadores

## Indicador: Vidas (coorte)
- Objetivo: tamanho da base elegível.
- Fórmula: `nunique(id_col)` após regras de elegibilidade.
- Campos: `__id__/identifier`, `tempo_programa_status`.
- Origem: `consolidated_df`.
- Processo: [[Processo - Dashboard e Exploracao]].
- Função: `get_results`.
- Dashboard: card "Vidas Expostas".
- Interpretação: base para normalização de custos.
- Limitações: depende de integridade dos IDs.

## Indicador: Custo Total
- Fórmula: `sum(custos)`.
- Campos: `custos`.
- Funções: `ensure_numeric_cols`, `get_results`.

## Indicador: PMPM
- Fórmula: `custo_total / base_total_users`.
- Campos: `custos`, `id_col`.
- Processo: Dashboard.
- Funções: `pivot_antes_depois`, `get_results`.
- Limitação: sensível à definição de base elegível.

## Indicador: Usuários com utilizações
- Fórmula: `nunique(id_col)` no subconjunto com eventos.
- Função: `measures`, `pivot_antes_depois`.

## Indicador: Custo médio usuário com utilização
- Fórmula: `custo_total / n_usuarios_com_evento`.
- Função: `measures`.

## Indicador: Custo médio usuários total
- Fórmula: `custo_total / n_usuarios_base_total`.
- Função: `pivot_antes_depois`.

## Indicador: Diferença e Variação % Antes/Depois
- Fórmula: `depois - antes` e `((depois/antes)-1)*100`.
- Função: `pivot_antes_depois`.

## Indicador: Previsão do próximo mês
- Fórmula: regressão linear `y=mx+b`; previsão em `x_max + 1`.
- Função: `calculate_linear_trend`.
- Limitação: modelo linear simples.

## Indicador: Z-Score de custo por beneficiário
- Fórmula: `(custo_usuario - média)/desvio`.
- Função: `detect_outliers_user_cost`.
- Uso: identificar ofensores.

## Indicadores impactados por regras
[[Regras de Negocio#RN011 - PMPM usa base total da coorte]]
[[Regras de Negocio#RN012 - Outlier por z-score maior que 3]]
[[Regras de Negocio#RN013 - Dentro/Fora respeita janela individual]]
