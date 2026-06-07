# Processo - Mapeamento de Colunas

## Objetivo
Padronizar nomes de colunas heterogêneas para conceitos internos do sistema.

## Entradas
Colunas originais das duas bases.

## Saídas
Sugestões de de-para e mapeamento final confirmado pelo usuário.

## Atividades
- [[Atividade - Gerar Sugestoes de Mapeamento]]
- [[Atividade - Validar Identificadores]]

## Regras
[[Regras de Negocio#RN005 - Score mínimo de similaridade]]
[[Regras de Negocio#RN006 - Identifier obrigatório]]

## Dados utilizados
Conjuntos `BENEF_CONCEPTS`, `FICHA_CONCEPTS`, `mapping.json`.

## APIs relacionadas
`GET /mapping/suggestions/{project_id}/{round_id}`.

## Módulos relacionados
`backend/src/mapping.py`, `frontend/.../MappingStep.tsx`, `useProjectWizard.ts`.

## Componentes relacionados
`MappingStep`, estados `finalMapping`, `mappingData`.

## Dependências
RapidFuzz.

## Reutilização
SIM — altamente reaproveitável para integração de dados multi-fonte.
