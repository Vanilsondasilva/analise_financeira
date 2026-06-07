# Processo - Ingestao de Dados

## Objetivo
Receber duas bases (beneficiários e ficha financeira), validar formato e persistir para pipeline.

## Entradas
Arquivos `.csv`, `.xlsx`, `.xls`.

## Saídas
`beneficiarios.parquet`, `ficha.parquet`, `inputs_hash.json`, preview de 50 linhas.

## Atividades
- [[Atividade - Upload de Arquivos]]
- [[Atividade - Leitura de Tabelas]]
- [[Atividade - Persistir Inputs]]

## Regras
[[Regras de Negocio#RN002 - Dois arquivos obrigatórios]]
[[Regras de Negocio#RN003 - Formatos aceitos]]
[[Regras de Negocio#RN004 - CSV com fallback de separador]]

## Dados utilizados
`inputs/beneficiarios.parquet`, `inputs/ficha.parquet`, `inputs_hash.json`.

## APIs relacionadas
`POST /upload/{project_id}/{round_id}`.

## Módulos relacionados
`backend/src/io.py`, `backend/database.py`, `frontend/.../FileUploadStep.tsx`.

## Componentes relacionados
`UploadZone`, `FileUploadStep`.

## Dependências
Pandas, OpenPyXL, PyArrow, python-multipart.

## Reutilização
SIM — pipeline de ingestão tabular genérico para qualquer domínio com duas fontes correlacionáveis.
