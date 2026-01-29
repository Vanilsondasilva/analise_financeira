import pandas as pd
import sys
from pathlib import Path

# --- CONFIGURAÇÃO ---
# Ajuste aqui o ID do seu projeto se for diferente
PROJECT_ID = "projeto-1" 
ROUND_ID = "R1"
# --------------------

def run_debug():
    # 1. Localizar o arquivo
    base_dir = Path("data/projects") / PROJECT_ID / "rounds" / ROUND_ID / "outputs"
    file_path = base_dir / "consolidated.parquet"

    print(f"\n🔎 DIAGNÓSTICO DE DADOS: {file_path}")
    print("="*60)

    if not file_path.exists():
        print(f"❌ ERRO CRÍTICO: Arquivo não encontrado em:\n{file_path.absolute()}")
        print("Dica: Verifique se PROJECT_ID está correto no script.")
        return

    # 2. Carregar o arquivo
    try:
        df = pd.read_parquet(file_path)
        print(f"✅ Arquivo carregado. Total de linhas: {len(df)}")
        print(f"📋 Colunas disponíveis ({len(df.columns)}): {list(df.columns)}")
    except Exception as e:
        print(f"❌ Erro ao ler Parquet: {e}")
        return

    print("-" * 60)

    # 3. Investigar 'antes_depois'
    if "antes_depois" not in df.columns:
        print("❌ COLUNA 'antes_depois' NÃO EXISTE!")
        print("   -> Causa provável: Erro na etapa de 'compute_momento_mes' ou 'consolidate'.")
    else:
        print("📊 CONTAGEM DE VALORES EM 'antes_depois':")
        vc = df["antes_depois"].value_counts(dropna=False)
        print(vc)
        
        if "Antes" not in vc or "Depois" not in vc:
            print("\n⚠️  ALERTA: Faltam valores 'Antes' ou 'Depois'. A tabela ficará vazia.")

    print("-" * 60)

    # 4. Investigar 'tempo_programa_status' (Elegibilidade)
    if "tempo_programa_status" not in df.columns:
        print("⚠️  Coluna 'tempo_programa_status' NÃO EXISTE.")
        print("   -> O filtro de elegibilidade (OK) vai falhar se estiver ativado.")
    else:
        print("📊 CONTAGEM DE VALORES EM 'tempo_programa_status':")
        print(df["tempo_programa_status"].value_counts(dropna=False))

    print("-" * 60)

    # 5. Investigar Interseção (O motivo real do vazio)
    if "antes_depois" in df.columns and "tempo_programa_status" in df.columns:
        print("🕵️  VERIFICAÇÃO CRUZADA (Elegíveis + Momento):")
        mask_ok = df["tempo_programa_status"] == "OK"
        df_ok = df[mask_ok]
        
        print(f"   -> Linhas com status='OK': {len(df_ok)}")
        if not df_ok.empty:
            print("   -> Valores de 'antes_depois' dentro dos Elegíveis:")
            print(df_ok["antes_depois"].value_counts(dropna=False))
        else:
            print("   -> Zero linhas elegíveis. O dashboard vai mostrar vazio.")

if __name__ == "__main__":
    run_debug()