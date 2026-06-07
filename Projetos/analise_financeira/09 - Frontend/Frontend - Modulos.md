# Frontend - Modulos

## Núcleo
- `src/app/layout.tsx`: shell global (Sidebar + Navbar + providers).
- `src/core/api/client.ts`: Axios client e interceptador de erro UX.
- `src/core/providers/app-provider.tsx`: contexto global (React Query + tema).

## Catálogo e wizard
- `features/projects/components/ProjectList.tsx`: lista/grid de projetos.
- `features/projects/hooks/useProjects.ts`: consulta projetos.
- `features/project-wizard/hooks/useProjectWizard.ts`: máquina de estados dos 4 passos.
- `ProjectBasicInfo`, `FileUploadStep`, `MappingStep`, `ConfigurationStep`, `WizardSteps`.

## Dashboard
- Página `app/dashboard/[id]/page.tsx`: carrega projeto, resultados e filtros.
- `ResultControls`: filtros interativos.
- `KpiCard`, `ComparativesTab`, `DemographicsTab`, `ScenariosTab`, `ProjectHeader`.

## Classificação de reutilização
- **ALTA REUTILIZAÇÃO:** `Button`, `input`, `textarea`, `KpiCard`, `UploadZone`, `ViewToggle`, `apiClient`, hooks de query.
- **MÉDIA REUTILIZAÇÃO:** layouts (`ProjectLayout`, `AnalysisLayout`), `ResultControls`.
- **BAIXA/ESPECÍFICA:** `MappingStep`, `ConfigurationStep`, página de dashboard de coortes.

## Dependências frontend
Next.js, React, TypeScript, Axios, TanStack Query, Recharts, Framer Motion, Lucide.

## Links
[[Componentes Reutilizaveis]] · [[APIs - Endpoints]] · [[Processo - Dashboard e Exploracao]]
