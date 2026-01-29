from fastapi import FastAPI, UploadFile, File, Form, Query, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
import json
import io

# --- IMPORTS DOS MÓDULOS LOCAIS ---
from database import store  # O arquivo database.py que criamos
from src.mapping import suggest_mapping, apply_mapping, BENEF_CONCEPTS, FICHA_CONCEPTS
from src.compute import consolidate, compute_tempo_programa, compute_ultima_competencia_ref, compute_momento_mes
from src.metrics import pivot_antes_depois, ensure_numeric_cols
from src.prediction import calculate_linear_trend
from src.outliers import detect_outliers_user_cost
from src.io import read_table

app = FastAPI()

# Configuração de CORS para aceitar requisições do Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROTAS DE PROJETOS ---

@app.get("/projects")
def list_projects():
    """Lista todos os projetos cadastrados no index.json."""
    return store.list_projects()

@app.get("/projects/{project_id}")
def read_project(project_id: str):
    """Retorna os metadados de um projeto específico (Nome, Unimed, etc)."""
    p = store.read_project(project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    return p

@app.post("/projects/create")
def create_project(data: dict):
    """Cria um novo projeto e retorna o ID."""
    pid = store.create_project(name=data["name"], unimed=data.get("unimed", ""))
    return {"project_id": pid, "status": "created"}

@app.delete("/projects/{project_id}")
def delete_project_endpoint(project_id: str):
    """Deleta um projeto e seus arquivos físicos."""
    success = store.delete_project(project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    return {"status": "deleted", "id": project_id}

# --- ROTAS DE UPLOAD E MAPEAMENTO ---

@app.post("/upload/{project_id}/{round_id}")
async def upload_files(
    project_id: str, 
    round_id: str,
    beneficiarios: UploadFile = File(...),
    ficha: UploadFile = File(...)
):
    """Recebe arquivos CSV/Excel, converte e salva como Parquet na pasta inputs."""
    try:
        # Garante que a rodada existe
        try:
             store.create_round(project_id, name=round_id)
        except Exception:
             pass 
        
        # Lê os arquivos usando o módulo IO robusto
        df_ben = read_table(beneficiarios)
        df_ficha = read_table(ficha)
        
        # Salva
        store.save_inputs(project_id, round_id, df_ben, df_ficha)
        
        # Pegamos as 5 primeiras linhas e preenchemos NaNs com "" para não quebrar o JSON
        preview_ben = df_ben.head(50).fillna("").to_dict(orient="records")
        preview_ficha = df_ficha.head(50).fillna("").to_dict(orient="records")
        
        return {
            "status": "success", 
            "rows_benef": len(df_ben), 
            "rows_ficha": len(df_ficha),
            "preview_benef": preview_ben, # <--- Enviando dados
            "preview_ficha": preview_ficha # <--- Enviando dados
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/mapping/suggestions/{project_id}/{round_id}")
def get_mapping_suggestions(project_id: str, round_id: str):
    """Gera sugestões de De-Para baseadas nos nomes das colunas."""
    inputs = store.load_inputs(project_id, round_id)
    if inputs["benef_df"] is None or inputs["ficha_df"] is None:
        raise HTTPException(status_code=404, detail="Arquivos não encontrados em inputs/")
    
    sug_b = suggest_mapping(list(inputs["benef_df"].columns), BENEF_CONCEPTS)
    sug_f = suggest_mapping(list(inputs["ficha_df"].columns), FICHA_CONCEPTS)
    
    return {
        "beneficiarios": {"columns": list(inputs["benef_df"].columns), "suggestions": sug_b},
        "ficha": {"columns": list(inputs["ficha_df"].columns), "suggestions": sug_f}
    }


@app.post("/analysis/preview/{project_id}/{round_id}")
async def preview_calculation(project_id: str, round_id: str, payload: dict):
    """
    Simula o cálculo do Tempo de Programa e retorna as primeiras 50 linhas
    para o usuário conferir antes de finalizar.
    """
    try:
        # 1. Carrega os inputs brutos salvos no passo de Upload
        inputs = store.load_inputs(project_id, round_id)
        df_ben = inputs["benef_df"]
        
        if df_ben is None:
            raise HTTPException(status_code=404, detail="Base de beneficiários não encontrada.")

        # 2. Prepara os dados do payload (igual ao submit final)
        config = payload
        mapping_ben = config["mapping"]["benef_mapping"]
        
        # 3. Define a Data de Referência
        ref_date_str = config.get("ultima_comp_ref")
        # Converte string YYYY-MM-DD para Timestamp
        ref_ts = pd.to_datetime(ref_date_str)
        # Usa sua função de cálculo de competência (normalização)
        ultima_ref = compute_ultima_competencia_ref(ref_ts)
        
        # 4. Aplica o Mapeamento (Renomeia colunas, etc)
        # Remove a chave 'identifier' pois o apply_mapping espera apenas de-para de colunas
        map_clean = {k: v for k, v in mapping_ben.items() if k != "identifier" and v}
        df_mapped = apply_mapping(df_ben, map_clean)
        
        # 5. Calcula o Tempo de Programa
        df_calculated = compute_tempo_programa(df_mapped, ultima_ref)
        
        # 6. Retorna o Preview (50 linhas)
        # Convertemos datas para string para não quebrar o JSON
        preview = df_calculated.head(50).fillna("").astype(str).to_dict(orient="records")
        
        return {
            "status": "success",
            "ref_calculada": str(ultima_ref.date()),
            "preview": preview,
            "total_linhas": len(df_calculated)
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# --- ROTA: DOWNLOAD EXCEL COMPLETO ---
@app.post("/analysis/download_preview/{project_id}/{round_id}")
async def download_preview_excel(project_id: str, round_id: str, payload: dict = Body(...)):
    """
    Recalcula o Tempo de Programa (com a config atual) e baixa o Excel COMPLETO.
    """
    try:
        inputs = store.load_inputs(project_id, round_id)
        df_ben = inputs["benef_df"]
        if df_ben is None: raise HTTPException(status_code=404, detail="Base não encontrada.")

        # Recalcula igual ao preview
        config = payload
        mapping_ben = config["mapping"]["benef_mapping"]
        ref_ts = pd.to_datetime(config.get("ultima_comp_ref"))
        ultima_ref = compute_ultima_competencia_ref(ref_ts)
        map_clean = {k: v for k, v in mapping_ben.items() if k != "identifier" and v}
        df_mapped = apply_mapping(df_ben, map_clean)
        df_calculated = compute_tempo_programa(df_mapped, ultima_ref)
        
        # Gera Excel em memória (Buffer)
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df_calculated.to_excel(writer, index=False, sheet_name="Base_Calculada")
        
        output.seek(0)
        
        headers = {
            'Content-Disposition': 'attachment; filename="base_calculada_completa.xlsx"'
        }
        
        return StreamingResponse(output, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', headers=headers)

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# --- ROTA DE ANÁLISE (ETL + CÁLCULO) ---
@app.post("/analysis/run/{project_id}/{round_id}")
async def run_analysis(project_id: str, round_id: str, config: dict = Body(...)):
    """Executa o pipeline completo: Mapeamento -> ETL -> Métricas -> AI -> Salvar."""
    try:
        # 1. Carrega inputs
        inputs = store.load_inputs(project_id, round_id)
        if inputs["benef_df"] is None or inputs["ficha_df"] is None:
             raise HTTPException(status_code=404, detail="Dados de entrada não encontrados")

        # 2. Salva configurações
        store.save_config(
            project_id, round_id, 
            mapping=config["mapping"], 
            analysis_config={"ultima_comp_ref": config["ultima_comp_ref"]},
            filters=None
        )

        b_map = config["mapping"]["benef_mapping"]
        f_map = config["mapping"]["ficha_mapping"]
        
        def sanitize_map(mapping):
            clean = {}
            for k, v in mapping.items():
                if k == "identifier": continue
                if isinstance(v, list):
                    if len(v) > 0: clean[k] = v[0]
                elif isinstance(v, str) and v:
                    clean[k] = v
            return clean

        # 3. Processamento de Beneficiários (Apenas TP, pois idade pode não estar aqui)
        clean_b_map = sanitize_map(b_map)
        benef = apply_mapping(inputs["benef_df"], clean_b_map)
        
        ultima_ref = compute_ultima_competencia_ref(pd.Timestamp(config["ultima_comp_ref"]))
        
        # Calcula Tempo de Programa (depende da data de inclusão que está no benef)
        benef = compute_tempo_programa(benef, ultima_ref)
        
        # 4. Processamento de Ficha Financeira (Renomeia 'idade' -> 'idade' aqui)
        clean_f_map = sanitize_map(f_map)
        ficha = apply_mapping(inputs["ficha_df"], clean_f_map)
        
        id_benef = b_map["identifier"][0] if isinstance(b_map["identifier"], list) else b_map["identifier"]
        id_ficha = f_map["identifier"][0] if isinstance(f_map["identifier"], list) else f_map["identifier"]

        # 5. Consolidação (Join das Tabelas)
        # O DataFrame 'merged' agora tem colunas do benef (TP, Sexo se tiver) + colunas da ficha (Idade, Custos)
        merged = consolidate(benef, ficha, id_benef, id_ficha)
        
        # Alias para compatibilidade
        merged["identifier"] = merged["__id__"]

        # --- CÁLCULO DEMOGRÁFICO CORRIGIDO (MOVIDO PARA CÁ) ---
        # Agora ele pode acessar a coluna 'idade' que veio da ficha financeira
        from src.compute import compute_demographics 
        merged = compute_demographics(merged, ultima_ref)
        # ------------------------------------------------------

        merged = compute_momento_mes(merged)
        
        # 6. Conversão Numérica Robusta
        merged = ensure_numeric_cols(merged)
        
        # 7. Geração de Métricas e KPIs
        res_dentro = pivot_antes_depois(merged, base_total_users=merged["identifier"].nunique(), id_col="identifier")
        
        trend = calculate_linear_trend(merged[merged["momento_mes"] > 0])
        outliers = detect_outliers_user_cost(merged)
        
        # 8. Salva Resultados
        store.save_outputs(
            project_id, round_id, 
            consolidated_df=merged, 
            outliers_df=outliers, 
            trend_json=trend
        )
        
        return {"status": "success"}
    except Exception as e:
        import traceback
        traceback.print_exc() 
        raise HTTPException(status_code=500, detail=str(e))

# --- ROTA DE RESULTADOS (DASHBOARD) ---
@app.get("/analysis/results/{project_id}/{round_id}")
async def get_results(
    project_id: str,
    round_id: str,
    periodo: str = Query("dentro"),        # dentro | fora | ambos
    momentoZero: bool = Query(False),
    janela: int = Query(24),

    # ✅ multi-select (React manda grupos=TP_01&grupos=TP_02...)
    grupos: Optional[List[str]] = Query(None),
    agrupamento_assistencial: Optional[List[str]] = Query(None),
):
    try:
        outputs = store.load_outputs(project_id, round_id)
        config = store.load_config(project_id, round_id)

        df = outputs.get("consolidated_df")
        trend_data = outputs.get("trend") or {}

        ref_date = None
        if config and config.get("analysis_config"):
            ref_date = config["analysis_config"].get("ultima_comp_ref")

        if df is None:
            return {"status": "processing", "message": "Análise ainda não processada."}

        df = ensure_numeric_cols(df)

        id_col = "__id__" if "__id__" in df.columns else ("identifier" if "identifier" in df.columns else None)
        if not id_col:
            raise ValueError("Não encontrei coluna de ID (__id__ ou identifier) no consolidated_df.")

        # =====================================================================================
        # 1) BASE DE VIDAS (COORTE) -> usada pra "N. Usuários Base total" (igual antigo)
        # =====================================================================================
        base = df.drop_duplicates(subset=[id_col]).copy()

        # Excluir não elegíveis (se existir status)
        if "tempo_programa_status" in base.columns:
            base = base[base["tempo_programa_status"].fillna("") == "OK"]

        # Filtro por grupos (TP) na base (coorte)
        if grupos and "grupos" in base.columns:
            base = base[base["grupos"].isin(grupos)]

        # Aqui NÃO aplicamos agrupamento_assistencial na base, porque é evento (assistencial) e não "vida".
        # Se você quiser "base por assistencial", aí a base deixa de ser coorte e vira "vida com evento daquele assistencial".

        base_total_users = int(base[id_col].nunique())

        # =====================================================================================
        # 2) DATASET DE EVENTOS (linhas) -> aqui aplicamos assistencial, dentro/fora por TP individual etc.
        # =====================================================================================
        dff = df.copy()

        # Mantém só vidas elegíveis (pra bater com o antigo)
        if "tempo_programa_status" in dff.columns:
            dff = dff[dff["tempo_programa_status"].fillna("") == "OK"]

        # Filtro por grupos (TP)
        if grupos and "grupos" in dff.columns:
            dff = dff[dff["grupos"].isin(grupos)]

        # Filtro por agrupamento assistencial (multi)
        if agrupamento_assistencial and "agrupamento_assistencial" in dff.columns:
            dff = dff[dff["agrupamento_assistencial"].isin(agrupamento_assistencial)]

        # Momento zero
        if "momento_mes" in dff.columns and not momentoZero:
            dff = dff[dff["momento_mes"] != 0]

        # ==========================
        # Dentro/Fora RESPEITANDO TP
        # ==========================
        if "momento_mes" in dff.columns and periodo != "ambos":
            # precisa ter tempo_programa pra respeitar janela individual
            if "tempo_programa" not in dff.columns:
                raise ValueError("Não existe coluna tempo_programa no consolidated_df. Sem isso não dá pra respeitar TP por vida.")

            tp = pd.to_numeric(dff["tempo_programa"], errors="coerce")
            win = tp.clip(lower=0).fillna(0).astype(int)
            win = np.minimum(win, int(janela))

            m = pd.to_numeric(dff["momento_mes"], errors="coerce").fillna(0).astype(int)
            inside = (m.abs() <= win)

            if periodo == "dentro":
                dff = dff[inside]
            elif periodo == "fora":
                dff = dff[~inside]
            else:
                # valor inválido -> assume "dentro"
                dff = dff[inside]

        # =====================================================================================
        # 3) KPIs / Comparative / Timeline (AGORA sobre dff)
        # =====================================================================================
        total_vidas_com_evento = int(dff[id_col].nunique())
        custo_total = float(dff["custos"].sum()) if "custos" in dff.columns else 0.0
        pmpm = (custo_total / base_total_users) if base_total_users > 0 else 0.0  # ✅ base total (igual antigo)

        comparative = pivot_antes_depois(
            dff,
            base_total_users=base_total_users,   # ✅ coorte, não "vida com evento"
            id_col=id_col
        )

        # Timeline (sobre dff)
        if "momento_mes" in dff.columns and "custos" in dff.columns:
            timeline = (
                dff[dff["momento_mes"] > 0]
                .groupby("momento_mes")["custos"]
                .sum()
                .reset_index()
                .sort_values("momento_mes")
            )
        else:
            timeline = pd.DataFrame({"momento_mes": [], "custos": []})

        # Raw data (demográfico) -> envia da BASE (coorte), não de dff (evento)
        cols_interest = ["sexo", "idade", "faixa_etaria", "tempo_programa", "grupos", "nascimento"]
        cols_to_keep = [id_col] + [c for c in cols_interest if c in base.columns]

        unique_lives_df = base[cols_to_keep].copy()
        unique_lives_df = unique_lives_df.fillna({
            "sexo": "N/I",
            "faixa_etaria": "N/I",
            "grupos": "N/I",
            "tempo_programa": 0,
            "idade": 0
        })
        demographic_sample = unique_lives_df.to_dict(orient="records")

        return {
            "status": "success",
            "meta": {"ref_date": ref_date},
            "kpis": {
                "lives": base_total_users,                 # ✅ base total elegível
                "lives_with_events": total_vidas_com_evento,  # útil pra auditoria
                "total_cost": custo_total,
                "pmpm": float(pmpm),
                "prediction": trend_data.get("prediction", 0),
            },
            "charts": {
                "timeline": {
                    "x": timeline["momento_mes"].tolist() if "momento_mes" in timeline.columns else [],
                    "y": timeline["custos"].tolist() if "custos" in timeline.columns else [],
                },
                "trend": trend_data,
            },
            "raw_data": demographic_sample,
            "comparative": comparative,
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# --- OPTIONS PARA FILTROS (Dropdowns) ---
@app.get("/analysis/filter-options/{project_id}/{round_id}")
async def get_filter_options(project_id: str, round_id: str):
    outputs = store.load_outputs(project_id, round_id)
    df = outputs.get("consolidated_df")
    if df is None:
        return {"status": "processing", "message": "Análise ainda não processada."}

    opts = {}

    if "grupos" in df.columns:
        opts["grupos"] = sorted([x for x in df["grupos"].dropna().unique().tolist()])

    if "agrupamento_assistencial" in df.columns:
        opts["agrupamento_assistencial"] = sorted(
            [x for x in df["agrupamento_assistencial"].dropna().unique().tolist()]
        )

    return {"status": "success", "options": opts}
