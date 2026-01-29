from __future__ import annotations
import math
import pandas as pd
import numpy as np

def months_diff(a: pd.Timestamp, b: pd.Timestamp) -> int:
    return (b.year - a.year) * 12 + (b.month - a.month)

def compute_ultima_competencia_ref(last_competencia: pd.Timestamp) -> pd.Timestamp:
    return pd.Timestamp(year=last_competencia.year, month=last_competencia.month, day=1)

def compute_tempo_programa(df_benef: pd.DataFrame, ultima_comp_ref: pd.Timestamp) -> pd.DataFrame:
    """Calcula TP e grupos de coortes [cite: 210-218]."""
    df = df_benef.copy()
    di = pd.to_datetime(df["data_inclusao"], errors="coerce", dayfirst=True)
    din = pd.to_datetime(df["data_inativacao"], errors="coerce", dayfirst=True) if "data_inativacao" in df.columns else pd.Series([pd.NaT]*len(df))
    
    di_m = di.dt.to_period("M").dt.to_timestamp()
    din_m = din.dt.to_period("M").dt.to_timestamp()
    fim_ref = compute_ultima_competencia_ref(ultima_comp_ref)

    tempo, status = [], []
    for i in range(len(df)):
        inc = di_m.iloc[i]
        if pd.isna(inc):
            tempo.append(np.nan); status.append("SEM DATA INCLUSÃO")
            continue
        
        fim = din_m.iloc[i] if not pd.isna(din_m.iloc[i]) else fim_ref
        if inc >= fim:
            tempo.append(np.nan); status.append("DATA DE INCLUSÃO NÃO PERMITE CÁLCULO")
        else:
            tp = months_diff(inc, fim)
            tempo.append(tp); status.append("OK")

    df["tempo_programa"] = tempo
    df["tempo_programa_status"] = status
    df["grupos"] = [f"TP_{int(tp):02d}" if s == "OK" else "Não Elegível" for tp, s in zip(tempo, status)]
    return df

def compute_momento_mes(df: pd.DataFrame) -> pd.DataFrame:
    """Determina o Antes/Depois baseado no mês de inclusão [cite: 219-223]."""
    df = df.copy()
    att = pd.to_datetime(df["atendimento"], errors="coerce", dayfirst=True)
    inc = pd.to_datetime(df["data_inclusao"], errors="coerce", dayfirst=True)
    
    momento, antes_depois = [], []
    for a, i in zip(att, inc):
        if pd.isna(a) or pd.isna(i):
            momento.append(np.nan); antes_depois.append("")
            continue
        days = (a - i).days
        m = 0 if days == 0 else int(math.copysign(math.ceil(abs(days) / 30.0), days))
        momento.append(m)
        antes_depois.append("Momento zero" if m == 0 else "Antes" if m < 0 else "Depois")
    
    df["momento_mes"] = momento
    df["antes_depois"] = antes_depois
    return df

def consolidate(benef: pd.DataFrame, ficha: pd.DataFrame, id_col_benef: str, id_col_ficha: str) -> pd.DataFrame:
    """Faz o join das bases usando o identificador [cite: 224-225]."""
    benef["__id__"] = benef[id_col_benef].astype(str).str.strip()
    ficha["__id__"] = ficha[id_col_ficha].astype(str).str.strip()
    return ficha.merge(benef.drop(columns=[id_col_benef]), on="__id__", how="left")

def compute_demographics(df: pd.DataFrame, ref_date: pd.Timestamp) -> pd.DataFrame:
    """Calcula Idade e Faixa Etária baseado no nascimento."""
    out = df.copy()
    
    # 1. Normaliza Sexo (se existir)
    if "sexo" in out.columns:
        out["sexo"] = out["sexo"].astype(str).str.upper().str.strip().str[0] # Pega F ou M
    else:
        out["sexo"] = "Não Informado"

    # 2. Prioriza a coluna 'idade' existente
    if "idade" not in out.columns:
        out["idade"] = -1 # Cria com valor padrão se não existir

    # Converte para numérico (trata "35 anos" ou textos sujos)
    out["idade"] = pd.to_numeric(out["idade"], errors="coerce").fillna(-1)

    # 3. Fallback: Se a idade for inválida (-1) E tiver nascimento, calcula
    if "nascimento" in out.columns:
        nasc = pd.to_datetime(out["nascimento"], errors="coerce", dayfirst=True)
        idade_calc = (ref_date - nasc).dt.days // 365
        
        # Só preenche onde não temos idade válida
        mask_needs_calc = (out["idade"] < 0) | (out["idade"].isna())
        out.loc[mask_needs_calc, "idade"] = idade_calc.fillna(-1)

    # Finaliza limpeza
    out["idade"] = out["idade"].fillna(-1).astype(int)

    # 4. Cria Faixas Etárias
    bins = [0, 18, 23, 28, 33, 38, 43, 48, 53, 58, 1000]
    labels = ["0-18", "19-23", "24-28", "29-33", "34-38", "39-43", "44-48", "49-53", "54-58", "59+"]
    
    out["faixa_etaria"] = pd.cut(out["idade"], bins=bins, labels=labels, right=False).astype(str).replace("nan", "Sem Data")
    out.loc[out["idade"] < 0, "faixa_etaria"] = "Sem Data"
        
    return out