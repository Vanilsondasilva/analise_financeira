from __future__ import annotations
import pandas as pd
from fastapi import UploadFile

def read_table(file: UploadFile) -> pd.DataFrame:
    """Lê CSV ou Excel vindo de um UploadFile do FastAPI."""
    name = file.filename.lower()
    
    if name.endswith(".csv"):
        try:
            return pd.read_csv(file.file, sep=";", dtype=str)
        except Exception:
            file.file.seek(0)
            return pd.read_csv(file.file, sep=",", dtype=str)
            
    if name.endswith(".xlsx") or name.endswith(".xls"):
        return pd.read_excel(file.file, dtype=str)
        
    raise ValueError("Formato não suportado. Use .csv ou .xlsx")