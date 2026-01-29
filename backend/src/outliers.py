import pandas as pd

def detect_outliers_user_cost(df: pd.DataFrame, z_thresh: float = 3.0) -> pd.DataFrame:
    """
    Identifica usuários cujo custo total foge muito da média (Z-Score).
    """
    if "custos" not in df.columns or "identifier" not in df.columns:
        return pd.DataFrame()

    # Agrupa por usuário
    user_costs = df.groupby("identifier")["custos"].sum().reset_index()
    
    if user_costs.empty:
        return pd.DataFrame()

    mean = user_costs["custos"].mean()
    std = user_costs["custos"].std()
    
    if std == 0:
        return pd.DataFrame()

    # Calcula Z-Score
    user_costs["z_score"] = (user_costs["custos"] - mean) / std
    
    # Filtra os outliers
    outliers = user_costs[user_costs["z_score"] > z_thresh].sort_values("custos", ascending=False)
    
    return outliers