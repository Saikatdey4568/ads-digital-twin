import pandas as pd
import numpy as np
from typing import Dict, Any


def run_simulation(df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
    """
    Run admixture dosing simulation on historical telemetry.

    The simulation recalculates:
    - dosing_amount based on pressure difference and configured thresholds
    - pump_status based on RPM and pressure conditions
    - avg_pressure as a smoothed response
    - tank_level as a depleting reservoir
    """

    sim = df.copy()
    n = len(sim)
    if hasattr(params, "dict"):
        params = params.dict()

    # ── Unpack parameters ──────────────────────────────────────
    dose_time           = float(params.get("dose_time", 8))
    dose_amount         = float(params.get("dose_amount", 0.5))
    max_dose_trip       = float(params.get("max_dose_trip", 5.0))
    tank_level_limit    = float(params.get("tank_level_limit", 5.0))

    transit_rpm_min     = float(params.get("transit_rpm_min", 0))
    transit_rpm_max     = float(params.get("transit_rpm_max", 2))
    load_rpm_min        = float(params.get("load_rpm_min", 3))
    load_rpm_max        = float(params.get("load_rpm_max", 8))

    idle_pressure       = float(params.get("idle_pressure", 5))
    non_idle_pressure   = float(params.get("non_idle_pressure", 5))
    master_pressure_time= float(params.get("master_pressure_time", 900))
    dosing_decide_time  = float(params.get("dosing_decide_time", 300))

    flow_pulse          = float(params.get("flow_pulse", 80))
    flow_factor         = float(params.get("flow_factor", 0.5))

    # ── Per-row simulation ─────────────────────────────────────
    sim_dosing   = np.zeros(n)
    sim_pump     = np.zeros(n)
    sim_tank     = sim["tank_level"].values.copy().astype(float)
    sim_avg_p    = sim["avg_pressure"].values.copy().astype(float)
    sim_curr_p   = sim["current_pressure"].values.copy().astype(float)

    trip_dose_total = 0.0
    last_dose_idx   = -999

    rpm_arr  = sim["rpm"].values
    curr_p   = sim["current_pressure"].values.astype(float)
    master_p = sim["master_pressure"].values.astype(float)
    dir_arr  = sim["direction"].values

    for i in range(n):
        rpm  = rpm_arr[i]
        cp   = curr_p[i]
        mp   = master_p[i]
        pressure_diff = cp - mp

        # Determine if mixer is in LOAD or TRANSIT state
        in_load    = load_rpm_min  <= rpm <= load_rpm_max
        in_transit = transit_rpm_min <= rpm <= transit_rpm_max

        # Pump activation condition
        if in_load and pressure_diff > non_idle_pressure and sim_tank[i] > tank_level_limit:
            if (i - last_dose_idx) >= max(1, int(dosing_decide_time / 60)):
                # Check trip dose limit
                if trip_dose_total + dose_amount <= max_dose_trip:
                    sim_pump[i]  = 1
                    dose_vol     = dose_amount * (flow_pulse * flow_factor / 1000.0)
                    sim_dosing[i]= dose_vol
                    trip_dose_total += dose_vol
                    last_dose_idx   = i
                    # Deplete tank
                    if i + 1 < n:
                        sim_tank[i + 1] = max(0, sim_tank[i] - dose_vol)
        elif in_transit:
            # Reset trip counter when in transit (new trip)
            trip_dose_total = 0.0
            sim_pump[i] = 0
        else:
            sim_pump[i] = 0

        # Propagate tank level forward
        if i + 1 < n and sim_tank[i + 1] == sim["tank_level"].values[i + 1]:
            sim_tank[i + 1] = sim_tank[i]

        # Simulated average pressure: exponential smoothing with pressure diff influence
        alpha = 0.05
        pressure_noise = np.random.normal(0, 0.5)
        if i == 0:
            sim_avg_p[i] = cp
        else:
            target = cp + pressure_diff * 0.3 + pressure_noise
            sim_avg_p[i] = alpha * target + (1 - alpha) * sim_avg_p[i - 1]

        # Current pressure: add small perturbation
        sim_curr_p[i] = cp + np.random.normal(0, 0.2) * (1 + abs(pressure_diff) * 0.01)

    sim["dosing_amount"]   = sim_dosing
    sim["pump_status"]     = sim_pump
    sim["tank_level"]      = sim_tank
    sim["avg_pressure"]    = np.clip(sim_avg_p, -100, 500)
    sim["current_pressure"]= np.clip(sim_curr_p, -100, 500)

    return sim
