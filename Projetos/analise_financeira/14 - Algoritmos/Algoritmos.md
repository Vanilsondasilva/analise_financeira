# Algoritmos

## Fuzzy Matching de Colunas
- Objetivo: sugerir de-para.
- Entradas: nomes de colunas, conceitos e sinônimos.
- Saídas: ranking por conceito.
- Fórmula: `WRatio` com limiar > 60.
- Complexidade: O(conceitos * sinônimos * colunas).
- Vantagens: onboarding rápido.
- Limitações: depende da qualidade dos nomes.
- Reutilização: **ALTA**.

## Tempo de Programa
- Objetivo: calcular meses de exposição no programa.
- Entradas: `data_inclusao`, `data_inativacao`, `ultima_comp_ref`.
- Saídas: `tempo_programa`, `tempo_programa_status`, `grupos`.
- Fórmula: diferença mensal entre inclusão e fim.
- Complexidade: O(n).
- Vantagens: segmentação por maturidade.
- Limitações: sensível à qualidade de datas.
- Reutilização: **MÉDIA/ESPECÍFICA SAÚDE**.

## Momento Mês
- Objetivo: posicionar evento no eixo pré/pós inclusão.
- Fórmula: `ceil(|dias|/30)` com sinal.
- Saídas: `momento_mes`, `antes_depois`.
- Reutilização: **ALTA**.

## Conversão Numérica Robusta
- Objetivo: padronizar campos monetários com formato BR.
- Fórmula: troca de vírgula decimal e cast numérico.
- Reutilização: **ALTA**.

## Comparativo Antes vs Depois
- Objetivo: medir impacto por período.
- Fórmulas: soma, média por usuário, diferença e variação percentual.
- Reutilização: **ALTA**.

## Regressão Linear Simples
- Objetivo: tendência e previsão do próximo mês.
- Fórmula: `numpy.polyfit(x,y,1)`.
- Complexidade: baixa.
- Limitações: linearidade implícita.
- Reutilização: **ALTA**.

## Outlier Detection por Z-Score
- Objetivo: identificar beneficiários de alto custo extremo.
- Fórmula: `z > 3`.
- Reutilização: **ALTA**.
