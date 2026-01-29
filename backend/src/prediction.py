import pandas as pd
import numpy as np

def calculate_linear_trend(df: pd.DataFrame):
    """
    Calcula a tendência linear dos custos (slope).
    """
    if df.empty or len(df) < 2:
        return None

    # Agrupa por mês relativo
    monthly = df.groupby("momento_mes")["custos"].sum().reset_index()
    
    if len(monthly) < 2:
        return None

    x = monthly["momento_mes"].values
    y = monthly["custos"].values

    # Ajuste linear (y = mx + b)
    slope, intercept = np.polyfit(x, y, 1)

    trend_line = (slope * x) + intercept

    return {
        "slope": float(slope),
        "intercept": float(intercept),
        "prediction": float(slope * (x.max() + 1) + intercept),
        "x": x.tolist(),
        "y": y.tolist(),
        "trend_y": trend_line.tolist()
    }