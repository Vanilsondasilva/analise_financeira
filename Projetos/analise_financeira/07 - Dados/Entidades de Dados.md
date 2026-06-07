# Entidades de Dados

## Entidade: Projeto
- Descrição: metadados macro da análise.
- Origem: criação de projeto.
- Destino: `index.json`, `project.json`.
- Campos: `project_id`, `name`, `unimed`, `created_at`, `updated_at`, `status`, `lives`.
- Processos: Gestão de Projetos, Pipeline.

## Entidade: Rodada
- Descrição: unidade de execução por projeto.
- Origem: `create_round`.
- Destino: `round.json`.
- Campos: `round_id`, `name`, `competencia`, `notes`, `copied_from`.

## Entidade: Beneficiários (input)
- Origem: upload.
- Destino: `inputs/beneficiarios.parquet`.
- Campos esperados (mapeáveis): `identifier`, `data_inclusao`, `data_inativacao`, `nascimento`, `sexo`.

## Entidade: Ficha financeira (input)
- Origem: upload.
- Destino: `inputs/ficha.parquet`.
- Campos esperados: `identifier`, `atendimento`, `custos`, `qtde_usada`, `agrupamento_assistencial`, `codigo_servico`, `descricao_servico`, `idade`.

## Entidade: Hash de entradas
- Origem: persistência de inputs.
- Destino: `inputs_hash.json`.
- Campos: `sha256`, `rows`, `cols` por arquivo.

## Entidade: Mapeamento
- Origem: confirmação do usuário.
- Destino: `config/mapping.json`.
- Campos: `benef_mapping`, `ficha_mapping`.

## Entidade: Configuração de análise
- Origem: passo 4 do wizard.
- Destino: `config/analysis_config.json`.
- Campos: `ultima_comp_ref`.

## Entidade: Dataset consolidado
- Origem: pipeline.
- Destino: `outputs/consolidated.parquet`.
- Campos calculados chave: `__id__`, `identifier`, `tempo_programa`, `tempo_programa_status`, `grupos`, `momento_mes`, `antes_depois`, `idade`, `faixa_etaria`, `custos_num`, `qtde_usada_num`.

## Entidade: Outliers
- Origem: pipeline.
- Destino: `outputs/outliers.parquet`.
- Campos: `identifier`, `custos`, `z_score`.

## Entidade: Tendência
- Origem: pipeline.
- Destino: `outputs/trend.json`.
- Campos: `slope`, `intercept`, `prediction`, `x`, `y`, `trend_y`.

## Reutilização
- **Reutilizável:** modelo de dados de projeto/rodada e outputs analíticos.
- **Específico do negócio:** campos assistenciais e semântica de coortes TP.
