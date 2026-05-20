from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import json

from telemetry_loader import load_csv, df_to_records
from simulator import run_simulation
from config_manager import SimulationConfig

router = APIRouter()

# In-memory store (single session)
_original_df = None


@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    global _original_df
    if not file.filename.endswith(".csv"):
        raise HTTPException(400, "Only CSV files are supported.")
    try:
        content = await file.read()
        _original_df = load_csv(content)
        records = df_to_records(_original_df)
        return {"status": "ok", "rows": len(records), "data": records}
    except Exception as e:
        raise HTTPException(400, str(e))


@router.post("/simulate")
async def simulate(config: SimulationConfig):
    global _original_df
    if _original_df is None:
        raise HTTPException(400, "No CSV uploaded. Please upload telemetry data first.")
    try:
        sim_df = run_simulation(_original_df, config.model_dump())
        records = df_to_records(sim_df)
        return {"status": "ok", "rows": len(records), "data": records}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/original")
async def get_original():
    global _original_df
    if _original_df is None:
        raise HTTPException(400, "No CSV uploaded.")
    return {"status": "ok", "data": df_to_records(_original_df)}


@router.get("/health")
async def health():
    return {"status": "ok", "loaded": _original_df is not None}
