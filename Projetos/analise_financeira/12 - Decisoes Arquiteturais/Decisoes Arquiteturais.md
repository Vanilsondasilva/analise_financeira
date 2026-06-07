# Decisoes Arquiteturais

## DA001 - Persistência em arquivos (Parquet + JSON)
- Contexto: simplicidade operacional e portabilidade.
- Decisão: evitar banco relacional nesta fase.
- Consequência: fácil setup; menor robustez transacional concorrente.

## DA002 - Backend orquestrador com módulos especializados
- Decisão: `main.py` coordena, `src/*` executa lógica.
- Consequência: separação clara por responsabilidade.

## DA003 - Mapeamento fuzzy para onboarding de dados
- Decisão: usar RapidFuzz e sinônimos por conceito.
- Consequência: ganho de produtividade com revisão humana.

## DA004 - ETL orientado a DataFrame
- Decisão: Pandas como motor analítico.
- Consequência: agilidade para análises tabulares e custo de memória em grandes massas.

## DA005 - Dashboard com recálculo server-side por filtro
- Decisão: backend recalcula agregações filtradas.
- Consequência: consistência de regra; dependência de performance do backend.
