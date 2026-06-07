# Dependencias e Matriz

## Bibliotecas backend
- fastapi, uvicorn
- pandas, numpy, pyarrow
- openpyxl, rapidfuzz
- python-multipart

## Bibliotecas frontend
- next, react, react-dom, typescript
- axios, @tanstack/react-query
- recharts, framer-motion, lucide-react
- tailwindcss, clsx, tailwind-merge, sonner

## Frameworks/APIs
- FastAPI REST
- Next.js App Router

## Arquivos e módulos críticos
- `backend/main.py` → orquestração
- `backend/database.py` → persistência
- `backend/src/*` → motor analítico
- `frontend/src/core/api/client.ts` → integração backend

## Matriz Origem → Destino
- `frontend/useProjectWizard` → `POST /projects/create`, `POST /upload`, `GET /mapping/suggestions`, `POST /analysis/preview`, `POST /analysis/download_preview`, `POST /analysis/run`
- `frontend/dashboard/page.tsx` → `GET /projects/{id}`, `GET /analysis/results`, `GET /analysis/filter-options`
- `main.py` → `database.py` (`load_*`, `save_*`, `create_*`)
- `main.py` → `src/mapping.py`, `src/compute.py`, `src/metrics.py`, `src/prediction.py`, `src/outliers.py`, `src/io.py`
- `database.py` → filesystem (`storage/projects/**`)

## Dependências de reutilização
- **Base reutilizável:** ingestão, mapeamento, agregação, tendência, outliers.
- **Dependência específica do negócio:** conceitos assistenciais e regras de coorte.
