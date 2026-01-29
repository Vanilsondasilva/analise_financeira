from __future__ import annotations
import re
import pandas as pd
from typing import Dict, List, Tuple, Any
from rapidfuzz import fuzz, process

BENEF_CONCEPTS = {
    "identifier": ["id_pessoa", "cpf", "cpf_u", "id_usuario", "matricula", "carteirinha", "codigo_beneficiario"],
    "data_inclusao": ["data inclusao", "inclusao", "entrada", "dt inclusao", "dt_inc", "admissao", "inicio_vigencia"],
    "data_inativacao": ["data inativacao", "inativacao", "dt inativacao", "exclusao", "dt_canc", "cancelamento", "fim_vigencia"],
    "nascimento": ["data nascimento", "dt nasc", "nascimento", "dt_nasc", "dtnasc", "data_nasc"],
    "sexo": ["sexo", "genero", "sex"]
}

FICHA_CONCEPTS = {
    "identifier": ["id_pessoa", "cpf", "cpf_u", "id_usuario", "beneficiario", "cod_beneficiario"],
    "atendimento": ["atendimento", "data atendimento", "dt atendimento", "data_evento", "dt_realizacao", "competencia"],
    "custos": ["custos", "custo", "valor", "valor_total", "vlr", "valor_pago", "valor_cobrado"],
    "qtde_usada": ["qtde usada", "quantidade", "qtde", "qtd"],
    "chv_internamento": ["chv_internamento", "internamento", "chave internamento", "num_guia", "senha"],
    "agrupamento_assistencial": ["agrupamento_assistencial_g", "agrupamento assistencial", "grupo_despesa", "tipo_despesa"],
    "codigo_servico": ["codigo_servico", "procedimento", "tuss", "cod_procedimento", "codigo"],
    "descricao_servico": ["descricao_servico", "servico", "desc_procedimento", "nome_procedimento"],
    "idade": ["idade", "idade atual", "age", "anos", "idade_beneficiario"]
}

def _norm(s: str) -> str:
    """Normaliza strings para comparação (remove acentos, especiais e espaços extras)."""
    if not isinstance(s, str):
        return str(s)
    s = s.strip().lower()
    s = re.sub(r"\s+", " ", s)
    s = re.sub(r"[^a-z0-9_ çãáàâéêíóôõúü/-]", "", s)
    return s

def suggest_mapping(columns: List[str], concepts: Dict[str, List[str]], limit: int = 5) -> Dict[str, List[str]]:
    """
    Sugere mapeamento usando lógica difusa (Fuzzy Matching).
    Retorna um dicionário onde a chave é o conceito e o valor é uma lista de colunas candidatas.
    """
    # Cria mapa de {nome_normalizado: nome_original}
    cols_norm = {_norm(c): c for c in columns}
    keys = list(cols_norm.keys())
    
    out = {}
    
    for concept, synonyms in concepts.items():
        candidates = []
        
        # 1. Busca por similaridade para cada sinônimo
        for syn in synonyms:
            # WRatio é bom para lidar com escolhas parciais e "fuzzy"
            matches = process.extract(_norm(syn), keys, scorer=fuzz.WRatio, limit=limit)
            
            for k, score, _ in matches:
                # Só aceita se a similaridade for razoável (> 60)
                if score > 60:
                    candidates.append((cols_norm[k], int(score)))
        
        # 2. Consolida os candidatos e pega os melhores
        best = {}
        for col, score in candidates:
            # Se a coluna já apareceu, mantém o maior score encontrado
            best[col] = max(best.get(col, 0), score)
        
        # Ordena pelo score (decrescente) e pega apenas os nomes das colunas
        sorted_candidates = sorted(best.items(), key=lambda x: x[1], reverse=True)
        
        # Retorna apenas a lista de nomes [ColunaA, ColunaB], sem os scores
        out[concept] = [item[0] for item in sorted_candidates][:limit]
        
    return out

def apply_mapping(df: pd.DataFrame, mapping: Dict[str, str]) -> pd.DataFrame:
    """
    Aplica o mapeamento renomeando as colunas.
    mapping: {'nome_padrao': 'nome_original_csv'}
    """
    # Inverte para o formato do Pandas: {'nome_original_csv': 'nome_padrao'}
    # Filtra apenas se o valor (coluna original) existir e não for vazio
    inv = {}
    for std_col, original_col in mapping.items():
        if original_col and isinstance(original_col, str) and original_col in df.columns:
            inv[original_col] = std_col

    # Renomeia
    df_renamed = df.rename(columns=inv)
    
    # Opcional: Se quiser manter APENAS as colunas mapeadas, descomente a linha abaixo:
    # df_renamed = df_renamed[list(inv.values())] 
    
    return df_renamed