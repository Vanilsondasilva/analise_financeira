# Roadmap

## Curto prazo
- Parametrizar URL da API por ambiente (atualmente hardcoded no `api/client.ts`).
- Expor `analysis_details` em `/analysis/results` para alimentar plenamente `ScenariosTab`.
- Padronizar tipagens TypeScript e reduzir uso de `any`.

## Médio prazo
- Suporte nativo a múltiplas rodadas no frontend.
- Persistência de cenários e comparações entre rodadas.
- Auditoria de qualidade de dados (camada `audit/`).

## Longo prazo
- Camada de autenticação e autorização.
- Storage desacoplado (S3/object storage).
- Modelos preditivos mais robustos (não-lineares).

## Dependências de roadmap
[[Decisoes Arquiteturais]] · [[Dependencias e Matriz]]
