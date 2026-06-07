# Processo - Gestão de Projetos

## Objetivo
Criar, listar, consultar e excluir projetos analíticos.

## Entradas
Nome do projeto, operadora/unimed.

## Saídas
`project_id`, registro em `index.json`, pasta do projeto criada.

## Atividades
- [[Atividade - Criar Projeto]]
- [[Atividade - Listar Projetos]]
- [[Atividade - Excluir Projeto]]

## Regras
[[Regras de Negocio#RN001 - Nome de projeto obrigatório]]

## Dados utilizados
`index.json`, `project.json`.

## APIs relacionadas
`GET /projects`, `GET /projects/{project_id}`, `POST /projects/create`, `DELETE /projects/{project_id}`.

## Módulos relacionados
`backend/main.py`, `backend/database.py`, `frontend/src/features/projects/*`, `frontend/src/features/project-wizard/*`.

## Componentes relacionados
`ProjectList`, `ProjectBasicInfo`, hook `useProjects`, hook `useProjectWizard`.

## Dependências
FastAPI, Axios, React Query.

## Reutilização
SIM — aplicável a qualquer solução de analytics multi-projeto.
