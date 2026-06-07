# Visao Geral

## Objetivo do sistema
Analisar impacto financeiro de programas de saúde por beneficiário e por coorte de tempo de programa.

## Problema que resolve
- Falta de visão padronizada de custo antes/depois da inclusão.
- Dificuldade de consolidar base cadastral + base de eventos financeiros.
- Necessidade de leitura demográfica e identificação de ofensores de custo.

## Quem utiliza
- Coordenação de programas de saúde
- Inteligência de negócios em operadoras
- Times técnicos de dados e auditoria assistencial

## Valor gerado
- Evidência objetiva de efetividade financeira.
- Segmentação por coorte (TP_xx), sexo, faixa etária e grupo assistencial.
- Base para tomada de decisão, priorização e negociação.

## Macrofluxo ponta a ponta
Criação de projeto → Upload de bases → Mapeamento de colunas → Configuração de referência e IDs → Processamento ETL/Analytics → Dashboard com filtros.

## Resultado produzido
- Dataset consolidado (`consolidated.parquet`)
- Outliers (`outliers.parquet`)
- Tendência (`trend.json`)
- KPIs e comparativos consumidos pelo frontend

## Contexto de reutilização
- **Reutilizável:** pipeline genérico de comparação antes/depois e cálculo de KPIs por coorte.
- **Específico do negócio:** nomenclatura assistencial e semântica de Tempo de Programa para saúde suplementar.

## Links
[[Arquitetura do Sistema]] · [[Processo - Pipeline Analitico]] · [[Indicadores]] · [[Entidades de Dados]]
