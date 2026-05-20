from pydantic import BaseModel
try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings

import os

class Settings(BaseSettings):
    TB_HOST: str = "https://thingsboard.cloud"
    TB_USERNAME: str = ""
    TB_PASSWORD: str = ""
    TB_DEVICE_ID: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

class SimulationConfig(BaseModel):
    Prev_PWindow_size: float = 12.0
    Prev_AWindow_size: float = 5.0
    Prev_max_pressure: float = 400.0
    Prev_min_pressure: float = 0.0
    dosing_amt_per_trip: float = 5.0
    tank_level_limit: float = 5.0
    flow_pulse: float = 80.0
    flow_factor: float = 0.5
    transit_rpm_max: float = 2.0
    transit_rpm_min: float = 0.0
    load_rpm_max: float = 8.0
    load_rpm_min: float = 3.0
    idle_pressure: float = 5.0
    non_idle_pressure: float = 5.0
    idle_time: float = 300.0
    non_zero_time: float = 600.0
    master_pressure_time: float = 600.0
    transit_time: float = 60.0
    dosing_decide_time: float = 300.0
    stop_dosing_time: float = 10800.0
    publish_time: float = 65.0
    dose_time: float = 8.0
    dose_amount: float = 0.5

def build_deploy_payload(cfg: SimulationConfig) -> dict:
    return {
        "config": {
            "sensor_data": {
                "PWindow_size": cfg.Prev_PWindow_size,
                "AWindow_size": cfg.Prev_AWindow_size,
                "max_pressure": cfg.Prev_max_pressure,
                "min_pressure": cfg.Prev_min_pressure,
                "flow_pulse": cfg.flow_pulse,
            },
            "timers": {
                "idle_time": cfg.idle_time,
                "non_zero_time": cfg.non_zero_time,
                "master_pressure_time": cfg.master_pressure_time,
                "transit_time": cfg.transit_time,
                "dosing_decide_time": cfg.dosing_decide_time,
                "stop_dosing_time": cfg.stop_dosing_time,
                "publish_time": cfg.publish_time,
            },
            "controls": {
                "dosing_amt_per_trip": cfg.dosing_amt_per_trip,
                "tank_level_limit": cfg.tank_level_limit,
                "load_rpm_max": cfg.load_rpm_max,
                "load_rpm_min": cfg.load_rpm_min,
                "transit_rpm_max": cfg.transit_rpm_max,
                "transit_rpm_min": cfg.transit_rpm_min,
                "idle_pressure": cfg.idle_pressure,
                "non_idle_pressure": cfg.non_idle_pressure,
                "dose_time": cfg.dose_time,
                "dose_amount": cfg.dose_amount,
                "flow_factor": cfg.flow_factor,
            },
        }
    }
