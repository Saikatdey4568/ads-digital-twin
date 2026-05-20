import json, os
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from telemetry_loader import load_csv, df_to_records
from simulator import run_simulation
from config_manager import SimulationConfig, build_deploy_payload
from thingsboard import tb_client

router = APIRouter()
_original_df = None

@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    global _original_df
    try:
        content = await file.read()
        _original_df = load_csv(content)
        return {"status": "ok", "rows": len(_original_df), "data": df_to_records(_original_df)}
    except Exception as e:
        raise HTTPException(400, str(e))

@router.post("/simulate")
async def simulate(config: SimulationConfig):
    global _original_df
    if _original_df is None:
        raise HTTPException(400, "No CSV loaded. Upload telemetry first.")
    try:
        sim_df = run_simulation(_original_df, config)
        return {"status": "ok", "rows": len(sim_df), "data": df_to_records(sim_df)}
    except Exception as e:
        raise HTTPException(500, str(e))

@router.post("/deploy")
async def deploy_config(config: SimulationConfig):
    try:
        status = tb_client.get_device_status()
        if status.get("connected") and not status.get("safe_to_deploy", True):
            raise HTTPException(409, f"Device is '{status.get('event')}' — only deploy during IDLE")
        payload = build_deploy_payload(config)
        result  = tb_client.push_shared_attributes(payload)
        return {"status": "ok", "message": "Config deployed to CM4", "detail": result}
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(503, f"ThingsBoard error: {str(e)}")

@router.get("/device-status")
async def device_status():
    try:
        return tb_client.get_device_status()
    except Exception as e:
        return {"connected": False, "reason": str(e)}

PRESETS_DIR = os.path.join(os.path.dirname(__file__), "..", "presets")
os.makedirs(PRESETS_DIR, exist_ok=True)

class PresetSave(BaseModel):
    name: str
    config: SimulationConfig

@router.post("/presets/save")
async def save_preset(body: PresetSave):
    safe = "".join(c for c in body.name if c.isalnum() or c in "_ -")[:40]
    with open(os.path.join(PRESETS_DIR, f"{safe}.json"), "w") as f:
        json.dump(body.config.model_dump(), f, indent=2)
    return {"status": "ok", "name": safe}

@router.get("/presets")
async def list_presets():
    files = [f.replace(".json","") for f in os.listdir(PRESETS_DIR) if f.endswith(".json")]
    return {"presets": sorted(files)}

@router.get("/presets/{name}")
async def load_preset(name: str):
    path = os.path.join(PRESETS_DIR, f"{name}.json")
    if not os.path.exists(path):
        raise HTTPException(404, f"Preset '{name}' not found")
    with open(path) as f:
        return {"status": "ok", "name": name, "config": json.load(f)}

@router.delete("/presets/{name}")
async def delete_preset(name: str):
    path = os.path.join(PRESETS_DIR, f"{name}.json")
    if os.path.exists(path):
        os.remove(path)
    return {"status": "ok"}

@router.get("/health")
async def health():
    return {"status": "ok", "tb_configured": bool(tb_client.device_id)}
