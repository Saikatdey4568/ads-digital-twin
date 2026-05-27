import pandas as pd
import numpy as np
from typing import Dict, Any


def run_simulation(df: pd.DataFrame, params) -> pd.DataFrame:
    """
    ADS Digital Twin Simulator.

    Key fix: avg_pressure is PRESERVED from original telemetry
    and only slightly modified by pump activity.
    current_pressure is also preserved — not recalculated from zero.

    Only dosing_amount, pump_status, and tank_level are actively simulated.
    """

    sim = df.copy()
    n   = len(sim)

    # ── Pydantic model → dict ──────────────────────────────────────────────
    if hasattr(params, "model_dump"):
        p = params.model_dump()
    elif hasattr(params, "dict"):
        p = params.dict()
    else:
        p = dict(params)

    # ── Unpack parameters ──────────────────────────────────────────────────
    dose_amount         = float(p.get("dose_amount",         0.5))
    dosing_amt_per_trip = float(p.get("dosing_amt_per_trip", 5.0))
    tank_level_limit    = float(p.get("tank_level_limit",    5.0))
    transit_rpm_min     = float(p.get("transit_rpm_min",     0.0))
    transit_rpm_max     = float(p.get("transit_rpm_max",     2.0))
    load_rpm_min        = float(p.get("load_rpm_min",        3.0))
    load_rpm_max        = float(p.get("load_rpm_max",        8.0))
    idle_pressure       = float(p.get("idle_pressure",       5.0))
    non_idle_pressure   = float(p.get("non_idle_pressure",   5.0))
    dosing_decide_time  = float(p.get("dosing_decide_time",  300.0))
    flow_pulse          = float(p.get("flow_pulse",          80.0))
    flow_factor         = float(p.get("flow_factor",         0.5))
    master_pressure_time= float(p.get("master_pressure_time",600.0))
    stop_dosing_time    = float(p.get("stop_dosing_time",    10800.0))
    Prev_PWindow_size   = int(p.get("Prev_PWindow_size",     12))
    Prev_AWindow_size   = int(p.get("Prev_AWindow_size",     5))
    Prev_max_pressure   = float(p.get("Prev_max_pressure",   400.0))
    Prev_min_pressure   = float(p.get("Prev_min_pressure",   0.0))

    # ── Clean input telemetry ──────────────────────────────────────────────
    numeric_cols = ["avg_pressure", "current_pressure", "master_pressure",
                    "rpm", "tank_level", "dosing_amount", "pump_status", "direction"]
    for col in numeric_cols:
        sim[col] = pd.to_numeric(sim[col], errors="coerce")
    sim[numeric_cols] = sim[numeric_cols].ffill().fillna(0)

    # ── Input arrays ───────────────────────────────────────────────────────
    rpm_arr      = sim["rpm"].values.astype(float)
    curr_p_arr   = sim["current_pressure"].values.astype(float)
    master_p_arr = sim["master_pressure"].values.astype(float)
    orig_avg_p   = sim["avg_pressure"].values.astype(float)     # PRESERVE THIS
    direction_arr= sim["direction"].values.astype(float)

    # ── Output arrays ─────────────────────────────────────────────────────
    sim_dosing = np.zeros(n)
    sim_pump   = np.zeros(n)
    sim_tank   = sim["tank_level"].values.copy().astype(float)

    # KEY FIX: start avg_pressure from original values, not zeros
    sim_avg_p  = orig_avg_p.copy()
    sim_curr_p = curr_p_arr.copy()

    # ── Pressure window (matches firmware PWindow/AWindow) ─────────────────
    pwin = max(1, Prev_PWindow_size)
    awin = max(1, Prev_AWindow_size)
    p_window = []

    # ── State variables ────────────────────────────────────────────────────
    trip_dose_total   = 0.0
    last_dose_idx     = -9999
    stop_dosing_start = 0
    STOP_DOSING_ACTIVE= False
    ROW_SECONDS       = 65   # each row ≈ publish_time seconds

    # ── Main loop ──────────────────────────────────────────────────────────
    for i in range(n):
        rpm       = rpm_arr[i]
        cp        = curr_p_arr[i]
        mp        = master_p_arr[i]
        orig_ap   = orig_avg_p[i]
        tank      = float(sim_tank[i])

        # Pressure window — mirrors firmware running_pressure_average()
        p_window.append(orig_ap)
        if len(p_window) > pwin:
            p_window.pop(0)
        running_avg = float(np.mean(p_window[-awin:]))

        # KEY FIX:
        # Use the windowed average of the ORIGINAL avg_pressure
        # Do NOT replace with cp (which may be 0/sparse).
        # Only add a tiny pump boost when dosing.
        pump_boost   = sim_pump[i - 1] * 0.8 if i > 0 else 0.0
        sim_avg_p[i] = float(np.clip(
            running_avg + pump_boost + np.random.normal(0, 0.05),
            Prev_min_pressure, Prev_max_pressure
        ))

        # Current pressure — preserve original, clip to configured range
        sim_curr_p[i] = float(np.clip(
            cp + np.random.normal(0, 0.1),
            Prev_min_pressure, Prev_max_pressure
        ))

        pressure_diff = cp - mp

        # ── State detection ────────────────────────────────────────────────
        in_load    = load_rpm_min    <= rpm <= load_rpm_max
        in_transit = transit_rpm_min <= rpm <= transit_rpm_max and rpm > 0
        is_idle    = running_avg < idle_pressure

        # Reset trip on transit
        if in_transit:
            trip_dose_total   = 0.0
            STOP_DOSING_ACTIVE= False

        # ── Dosing decision ────────────────────────────────────────────────
        if is_idle:
            sim_pump[i] = 0
        elif in_load and not is_idle:
            min_gap  = max(1, int(dosing_decide_time / ROW_SECONDS))
            rows_since= i - last_dose_idx

            # stop_dosing_time check
            if STOP_DOSING_ACTIVE:
                if (i - stop_dosing_start) * ROW_SECONDS > stop_dosing_time:
                    STOP_DOSING_ACTIVE = False

            can_dose = (
                not STOP_DOSING_ACTIVE
                and rows_since >= min_gap
                and running_avg > non_idle_pressure
                and pressure_diff > 0
                and trip_dose_total < dosing_amt_per_trip
                and tank > tank_level_limit
            )

            if can_dose:
                # Dose volume = dose_amount * flow_pulse * flow_factor / 1000
                # Mirrors firmware: helpin.pulse_to_litre()
                dose_vol = dose_amount * (flow_pulse * flow_factor / 1000.0)
                dose_vol = min(dose_vol, dosing_amt_per_trip - trip_dose_total)

                sim_pump[i]    = 1
                sim_dosing[i]  = round(dose_vol, 4)
                trip_dose_total += dose_vol
                last_dose_idx   = i

                if not STOP_DOSING_ACTIVE:
                    stop_dosing_start = i
                    STOP_DOSING_ACTIVE = True

                if i + 1 < n:
                    sim_tank[i + 1] = max(0.0, tank - dose_vol)
            else:
                sim_pump[i] = 0
                if i + 1 < n:
                    sim_tank[i + 1] = sim_tank[i]
        else:
            sim_pump[i] = 0
            if i + 1 < n:
                sim_tank[i + 1] = sim_tank[i]

    # ── Write results ──────────────────────────────────────────────────────
    sim["avg_pressure"]     = np.clip(sim_avg_p,  Prev_min_pressure, Prev_max_pressure)
    sim["current_pressure"] = np.clip(sim_curr_p, Prev_min_pressure, Prev_max_pressure)
    sim["dosing_amount"]    = np.round(sim_dosing, 4)
    sim["pump_status"]      = sim_pump
    sim["tank_level"]       = np.clip(np.round(sim_tank, 3), 0, 30)

    sim.replace([np.inf, -np.inf], 0, inplace=True)
    sim.fillna(0, inplace=True)

    return sim