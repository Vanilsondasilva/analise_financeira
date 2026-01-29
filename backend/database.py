from __future__ import annotations

import os
import json
import uuid
import hashlib
import shutil
from json import JSONDecodeError
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List

import pandas as pd


def _now_iso() -> str:
    return datetime.now().isoformat(timespec="seconds")


def _slug(s: str) -> str:
    s = "".join(ch if ch.isalnum() else "_" for ch in s.strip())
    s = "_".join([p for p in s.split("_") if p])
    return s[:60] if s else "item"


def _sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def _read_json(path, default=None):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return default
    except JSONDecodeError:
        try:
            bad_path = str(path) + ".corrupted"
            if os.path.exists(path):
                os.replace(path, bad_path)
        except Exception:
            pass
        return default
    except Exception:
        return default


def _json_default(o):
    try:
        import numpy as np
        import pandas as pd

        if isinstance(o, (np.integer,)):
            return int(o)
        if isinstance(o, (np.floating,)):
            return float(o)
        if isinstance(o, (np.bool_,)):
            return bool(o)
        if isinstance(o, (pd.Timestamp,)):
            return o.isoformat()
    except Exception:
        pass
    return str(o)


def _write_json(path, obj):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)

    tmp = path.with_suffix(path.suffix + f".{uuid.uuid4().hex}.tmp")
    try:
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(obj, f, ensure_ascii=False, indent=2, default=_json_default)
            f.flush()
            os.fsync(f.fileno())
        os.replace(str(tmp), str(path))
    except Exception:
        try:
            if tmp.exists():
                tmp.unlink()
        except Exception:
            pass

        with open(path, "w", encoding="utf-8") as f:
            json.dump(obj, f, ensure_ascii=False, indent=2, default=_json_default)


@dataclass
class RoundPaths:
    root: Path
    inputs: Path
    config: Path
    outputs: Path
    audit: Path
    reports: Path


class ProjectStore:
    def __init__(self, base_dir: str = "storage/projects"): # Ajustei para storage/projects
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self.index_path = self.base_dir / "index.json"
        self.current_path = self.base_dir / "_current.json"
        if not self.index_path.exists():
            _write_json(self.index_path, {"projects": []})

    def list_projects(self) -> List[Dict[str, Any]]:
        idx = _read_json(self.index_path, {"projects": []})
        return idx.get("projects", [])

    def _save_index(self, projects: List[Dict[str, Any]]):
        _write_json(self.index_path, {"projects": projects})
        
    def delete_project(self, project_id: str) -> bool:
        """Remove o projeto do index e apaga a pasta física."""
        # 1. Carrega e filtra o JSON
        idx = _read_json(self.index_path, {"projects": []})
        projects = idx.get("projects", [])
        
        original_count = len(projects)
        new_projects = [p for p in projects if p["project_id"] != project_id]
        
        if len(new_projects) == original_count:
            return False # Projeto não encontrado na lista
            
        # Salva o novo index sem o projeto
        self._save_index(new_projects)
        
        # 2. Apaga a pasta física recursivamente
        project_path = self.base_dir / project_id
        if project_path.exists() and project_path.is_dir():
            try:
                shutil.rmtree(project_path)
            except Exception as e:
                print(f"Erro ao apagar pasta física {project_path}: {e}")
                
        return True

    def get_current(self) -> Dict[str, Optional[str]]:
        cur = _read_json(self.current_path, {"project_id": None, "round_id": None})
        return {"project_id": cur.get("project_id"), "round_id": cur.get("round_id")}

    def set_current(self, project_id: str, round_id: str):
        _write_json(self.current_path, {"project_id": project_id, "round_id": round_id, "updated_at": _now_iso()})

    def create_project(self, name: str, unimed: str = "", tags: Optional[List[str]] = None, description: str = "") -> str:
        project_id = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{_slug(name)}"
        root = self.base_dir / project_id
        root.mkdir(parents=True, exist_ok=True)

        project_meta = {
            "project_id": project_id,
            "name": name,
            "unimed": unimed,
            "tags": tags or [],
            "description": description,
            "created_at": _now_iso(),
            "updated_at": _now_iso(),
        }
        _write_json(root / "project.json", project_meta)

        projects = self.list_projects()
        projects.append(project_meta)
        self._save_index(projects)
        return project_id

    def read_project(self, project_id: str) -> Dict[str, Any]:
        return _read_json(self.base_dir / project_id / "project.json", {})

    def list_rounds(self, project_id: str) -> List[Dict[str, Any]]:
        rounds_dir = self.base_dir / project_id / "rounds"
        if not rounds_dir.exists():
            return []
        rounds = []
        for rd in sorted(rounds_dir.iterdir()):
            if rd.is_dir():
                meta = _read_json(rd / "round.json", {})
                if meta:
                    rounds.append(meta)
        return rounds

    def create_round(self, project_id: str, name: str, competencia: str = "", notes: str = "", copy_from_round_id: Optional[str] = None) -> str:
        # Se o nome já vier no formato de ID (ex: "R1"), usamos ele, senão geramos slug
        if len(name) < 5 and name.isalnum(): 
             round_id = name
        else:
             round_id = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{_slug(name)}"
             
        rd_root = self.base_dir / project_id / "rounds" / round_id

        paths = self.round_paths(project_id, round_id)
        for p in [paths.inputs, paths.config, paths.outputs, paths.audit, paths.reports]:
            p.mkdir(parents=True, exist_ok=True)

        meta = {
            "project_id": project_id,
            "round_id": round_id,
            "name": name,
            "competencia": competencia,
            "notes": notes,
            "created_at": _now_iso(),
            "updated_at": _now_iso(),
            "copied_from": copy_from_round_id,
        }
        _write_json(rd_root / "round.json", meta)

        if copy_from_round_id:
            src = self.round_paths(project_id, copy_from_round_id)
            for fname in ["mapping.json", "analysis_config.json", "filters.json"]:
                sp = src.config / fname
                if sp.exists():
                    dp = paths.config / fname
                    dp.parent.mkdir(parents=True, exist_ok=True)
                    dp.write_bytes(sp.read_bytes())

        pm = self.read_project(project_id)
        if pm:
            pm["updated_at"] = _now_iso()
            _write_json(self.base_dir / project_id / "project.json", pm)

        return round_id

    def round_paths(self, project_id: str, round_id: str) -> RoundPaths:
        root = self.base_dir / project_id / "rounds" / round_id
        return RoundPaths(
            root=root,
            inputs=root / "inputs",
            config=root / "config",
            outputs=root / "outputs",
            audit=root / "audit",
            reports=root / "reports",
        )

    def save_inputs(self, project_id: str, round_id: str, benef_df: pd.DataFrame, ficha_df: pd.DataFrame) -> Dict[str, Any]:
        p = self.round_paths(project_id, round_id)
        benef_path = p.inputs / "beneficiarios.parquet"
        ficha_path = p.inputs / "ficha.parquet"
        benef_df.to_parquet(benef_path, index=False)
        ficha_df.to_parquet(ficha_path, index=False)
        meta = {
            "saved_at": _now_iso(),
            "beneficiarios": {"path": str(benef_path), "sha256": _sha256_file(benef_path), "rows": int(benef_df.shape[0]), "cols": int(benef_df.shape[1])},
            "ficha": {"path": str(ficha_path), "sha256": _sha256_file(ficha_path), "rows": int(ficha_df.shape[0]), "cols": int(ficha_df.shape[1])},
        }
        _write_json(p.inputs / "inputs_hash.json", meta)
        return meta

    def load_inputs(self, project_id: str, round_id: str) -> Dict[str, Optional[pd.DataFrame]]:
        p = self.round_paths(project_id, round_id)
        benef_path = p.inputs / "beneficiarios.parquet"
        ficha_path = p.inputs / "ficha.parquet"
        out = {"benef_df": None, "ficha_df": None}
        if benef_path.exists(): out["benef_df"] = pd.read_parquet(benef_path)
        if ficha_path.exists(): out["ficha_df"] = pd.read_parquet(ficha_path)
        return out

    def save_config(self, project_id: str, round_id: str, mapping: dict | None = None, analysis_config: dict | None = None, filters: dict | None = None):
        p = self.round_paths(project_id, round_id)
        if mapping is not None: _write_json(p.config / "mapping.json", mapping)
        if analysis_config is not None: _write_json(p.config / "analysis_config.json", analysis_config)
        if filters is not None: _write_json(p.config / "filters.json", filters)

    def load_config(self, project_id: str, round_id: str) -> Dict[str, Any]:
        p = self.round_paths(project_id, round_id)
        return {
            "mapping": _read_json(p.config / "mapping.json", None),
            "analysis_config": _read_json(p.config / "analysis_config.json", None),
            "filters": _read_json(p.config / "filters.json", None),
        }

    def save_outputs(self, project_id: str, round_id: str, consolidated_df: pd.DataFrame | None = None, outliers_df: pd.DataFrame | None = None, trend_json: dict | None = None):
        p = self.round_paths(project_id, round_id)
        
        # 1. Salva os arquivos físicos (Parquet/JSON)
        if consolidated_df is not None: 
            consolidated_df.to_parquet(p.outputs / "consolidated.parquet", index=False)
        if outliers_df is not None: 
            outliers_df.to_parquet(p.outputs / "outliers.parquet", index=False)
        if trend_json is not None: 
            _write_json(p.outputs / "trend.json", trend_json)
        
        # 2. Atualiza o metadata da Rodada (round.json)
        rp = p.root / "round.json"
        meta = _read_json(rp, {})
        if meta:
            meta["updated_at"] = _now_iso()
            _write_json(rp, meta)

        # 3. ATUALIZA O INDEX DO PROJETO (Para a Lista aparecer correta)
        # Calcula vidas se o DF estiver disponível
        lives_count = 0
        if consolidated_df is not None:
            # Tenta usar identifier ou __id__
            col_id = "identifier" if "identifier" in consolidated_df.columns else "__id__"
            if col_id in consolidated_df.columns:
                lives_count = int(consolidated_df[col_id].nunique())

        # Carrega a lista de projetos, atualiza o alvo e salva de volta
        projects = self.list_projects()
        updated_projects = []
        for proj in projects:
            if proj["project_id"] == project_id:
                proj["status"] = "Processado" # Muda de Rascunho para Processado
                proj["lives"] = lives_count   # Salva o número de vidas
                proj["updated_at"] = _now_iso()
            updated_projects.append(proj)
        
        self._save_index(updated_projects)

    def load_outputs(self, project_id: str, round_id: str) -> Dict[str, Any]:
        p = self.round_paths(project_id, round_id)
        out = {"consolidated_df": None, "outliers_df": None, "trend": None}
        if (p.outputs / "consolidated.parquet").exists(): out["consolidated_df"] = pd.read_parquet(p.outputs / "consolidated.parquet")
        if (p.outputs / "outliers.parquet").exists(): out["outliers_df"] = pd.read_parquet(p.outputs / "outliers.parquet")
        out["trend"] = _read_json(p.outputs / "trend.json", None)
        return out

store = ProjectStore()