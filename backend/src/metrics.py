from __future__ import annotations
import pandas as pd
import numpy as np

def _to_numeric(s: pd.Series) -> pd.Series:
    """Converte para numérico forçando ponto como decimal de forma robusta."""
    # Se já for numérico, retorna direto
    if pd.api.types.is_numeric_dtype(s):
        return s
        
    s = s.astype(str).str.replace(r"[^0-9,\.-]", "", regex=True)
    has_comma = s.str.contains(",")
    has_dot = s.str.contains(r"\.")
    s2 = s.copy()
    
    # Se tem vírgula e não tem ponto, assume que vírgula é decimal (padrão BR)
    mask = has_comma & ~has_dot
    s2.loc[mask] = s2.loc[mask].str.replace(",", ".", regex=False)
    
    return pd.to_numeric(s2, errors="coerce")

def ensure_numeric_cols(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    # Garante conversão segura
    out["custos_num"] = _to_numeric(out["custos"]) if "custos" in out.columns else 0.0
    out["qtde_usada_num"] = _to_numeric(out["qtde_usada"]).fillna(1) if "qtde_usada" in out.columns else 1
    
    # Atualiza a coluna original para garantir que somas funcionem
    out["custos"] = out["custos_num"].fillna(0.0) 
    return out

def measures(df: pd.DataFrame, id_col: str = "__id__") -> dict:
    df = ensure_numeric_cols(df)
    custos = df["custos_num"]
    qtd = df["qtde_usada_num"]
    
    # Fallback para identifier se __id__ não existir
    use_id = id_col
    if use_id not in df.columns and "identifier" in df.columns:
        use_id = "identifier"
        
    n_users = df[use_id].nunique(dropna=True) if use_id in df.columns else 0

    # Evita divisão por zero
    soma_custo = float(custos.sum(skipna=True))
    soma_qtd = float(qtd.sum(skipna=True))

    out = {
        "custo": soma_custo,
        "qtde_usada": soma_qtd,
        "n_usuarios": int(n_users),
        "custo_medio_unitario": (soma_custo / soma_qtd) if soma_qtd > 0 else None,
        "media_utilizacao_usuario": (soma_qtd / n_users) if n_users > 0 else None,
        "custo_medio_usuario": (soma_custo / n_users) if n_users > 0 else None,
    }
    return out

def pivot_antes_depois(df: pd.DataFrame, base_total_users: int | None = None, id_col: str = "identifier") -> list[dict]:
    """
    Gera o comparativo Antes vs Depois.
    Retorna LISTA DE DICT para ser serializável em JSON (importante!).
    """
    if "antes_depois" not in df.columns:
        return []

    keep = df[df["antes_depois"].isin(["Antes", "Depois"])].copy()
    rows = []
    
    for label in ["Antes", "Depois"]:
        part = keep[keep["antes_depois"] == label]
        m = measures(part, id_col=id_col)
        
        n_total = base_total_users if base_total_users else m["n_usuarios"]
        custo_medio_total = (m["custo"] / n_total) if (n_total and n_total > 0) else 0.0
        
        rows.append({
            "Momento": label,
            "Custos": m["custo"],
            "N. Usuários com Utilizações": m["n_usuarios"],
            "Custo Médio Usuário (com utilização)": m["custo_medio_usuario"] or 0.0,
            "N. Usuários Base total": n_total,
            "Custo Médio Usuários Total": custo_medio_total,
        })

    # Lógica de diferença e %
    if len(rows) == 2:
        diff = {"Momento": "Diferença", "N. Usuários Base total": 0}
        pct = {"Momento": "%", "N. Usuários Base total": 0}
        
        cols_to_diff = ["Custos", "N. Usuários com Utilizações", "Custo Médio Usuário (com utilização)", "Custo Médio Usuários Total"]
        
        antes = rows[0]
        depois = rows[1]

        for c in cols_to_diff:
            val_a = antes.get(c, 0) or 0
            val_d = depois.get(c, 0) or 0
            
            diff[c] = val_d - val_a
            
            if val_a != 0:
                pct[c] = ((val_d / val_a) - 1.0) * 100
            else:
                pct[c] = 0.0

        rows.append(diff)
        rows.append(pct)

    return rows

def analyze_cost_drivers(df: pd.DataFrame) -> dict:
    """
    Gera as análises para a aba de Cenários (Pareto, Top Procedimentos, Top Vidas).
    """
    df = ensure_numeric_cols(df)
    
    # Mapeamento seguro de colunas
    col_grupo = "agrupamento_assistencial" if "agrupamento_assistencial" in df.columns else None
    col_proc = "descricao_servico" if "descricao_servico" in df.columns else None
    col_custo = "custos"
    # Tenta achar a coluna de ID
    col_id = "__id__" if "__id__" in df.columns else ("identifier" if "identifier" in df.columns else None)

    results = {
        "groups": [],
        "procedures": [],
        "beneficiaries": []
    }

    # 1. Análise por Grupo (Pareto)
    if col_grupo:
        grp = df.groupby(col_grupo)[col_custo].sum().reset_index()
        grp = grp.sort_values(by=col_custo, ascending=False)
        total_grp = grp[col_custo].sum()
        if total_grp > 0:
            grp["share"] = grp[col_custo] / total_grp
        else:
            grp["share"] = 0
        results["groups"] = grp.head(15).to_dict(orient="records")

    # 2. Análise por Procedimento (Top 20)
    if col_proc:
        proc = df.groupby(col_proc).agg({
            col_custo: "sum",
            "qtde_usada_num": "sum"
        }).reset_index()
        proc = proc.sort_values(by=col_custo, ascending=False)
        results["procedures"] = proc.head(20).to_dict(orient="records")

    # 3. Top Beneficiários (Ofensores)
    if col_id:
        users = df.groupby(col_id)[col_custo].sum().reset_index()
        users = users.sort_values(by=col_custo, ascending=False)
        total_pool = users[col_custo].sum()
        
        top_users = users.head(20).copy()
        if total_pool > 0:
            top_users["share"] = top_users[col_custo] / total_pool
        else:
            top_users["share"] = 0
            
        results["beneficiaries"] = top_users.to_dict(orient="records")

    return results