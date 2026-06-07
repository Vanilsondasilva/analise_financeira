# Arquitetura do Sistema

## Camadas
1. Frontend Next.js (App Router) em `frontend/src`
2. Backend FastAPI em `backend/main.py`
3. Persistência em arquivos (`storage/projects`) via `ProjectStore`

## Módulos principais
- API e orquestração: `backend/main.py`
- Persistência: `backend/database.py`
- Leitura de arquivo: `backend/src/io.py`
- Mapeamento: `backend/src/mapping.py`
- Cálculo central: `backend/src/compute.py`
- Métricas/KPIs: `backend/src/metrics.py`
- Tendência: `backend/src/prediction.py`
- Outliers: `backend/src/outliers.py`

## Padrão de armazenamento
- `index.json` para catálogo de projetos
- `project.json` e `round.json` para metadados
- Parquet para datasets de entrada/saída
- JSON para configuração e tendências

## Integrações
- Frontend consome backend por Axios (`frontend/src/core/api/client.ts`)
- Upload multipart para ingestão de arquivos

## Reuso
- **Reutilizável:** arquitetura de pipeline analítico orientada a arquivos.
- **Específico do negócio:** estrutura de campos de saúde assistencial e semântica dos filtros.

## Links
[[Backend - Modulos]] · [[Frontend - Modulos]] · [[APIs - Endpoints]] · [[Fluxos de Dados]]
