import pandas as pd
import numpy as np
import io

REQUIRED_COLUMNS = [
    "timestamp", "avg_pressure", "current_pressure", "master_pressure",
    "rpm", "tank_level", "dosing_amount", "pump_status", "direction"
]

COLUMN_ALIASES = {
    # timestamp
    "timestamp":                "timestamp",
    "time":                     "timestamp",
    "datetime":                 "timestamp",

    # avg_pressure
    "average pressure":         "avg_pressure",
    "average_pressure":         "avg_pressure",
    "avg_pressure":             "avg_pressure",
    "avg pressure":             "avg_pressure",

    # current_pressure
    "current pressure":         "current_pressure",
    "current_pressure":         "current_pressure",
    "currentpressure":          "current_pressure",
    "pressure":                 "current_pressure",

    # master_pressure
    "master pressure":          "master_pressure",
    "master_pressure":          "master_pressure",
    "masterpressure":           "master_pressure",

    # rpm
    "rpm":                      "rpm",
    "speed":                    "rpm",
    "drum rpm":                 "rpm",
    "drum_rpm":                 "rpm",

    # tank_level
    "tank level":               "tank_level",
    "tank_level":               "tank_level",
    "tank":                     "tank_level",

    # dosing_amount — ALL variants from your CSV
    "dosing amount":            "dosing_amount",
    "dosing_amount":            "dosing_amount",
    "dosingamount":             "dosing_amount",
    "dose amount":              "dosing_amount",
    "dosing amount/trip":       "dosing_amount",   # ← your CSV column
    "dosing_amount/trip":       "dosing_amount",
    "dosing amount / trip":     "dosing_amount",
    "dosing amount/trip (l)":   "dosing_amount",
    "manual dosing":            "dosing_amount",   # ← your CSV column

    # pump_status
    "pump status":              "pump_status",
    "pump_status":              "pump_status",
    "pumpstatus":               "pump_status",
    "pump":                     "pump_status",

    # direction
    "direction":                "direction",
    "dir":                      "direction",
}

# Default values for columns absent in the CSV
DEFAULTS = {
    "avg_pressure":     0.0,
    "current_pressure": 0.0,
    "master_pressure":  0.0,
    "rpm":              0.0,
    "tank_level":       25.0,
    "dosing_amount":    0.0,
    "pump_status":      0,
    "direction":        0,
}


def load_csv(file_bytes: bytes) -> pd.DataFrame:
    # Auto-detect delimiter (comma or semicolon)
    sample = file_bytes[:4096].decode("utf-8", errors="ignore")
    delimiter = ";" if sample.count(";") > sample.count(",") else ","

    df = pd.read_csv(io.BytesIO(file_bytes), sep=delimiter)

    # Normalize: strip whitespace + lowercase
    df.columns = [c.strip().lower() for c in df.columns]

    # Apply aliases
    rename_map = {col: COLUMN_ALIASES[col] for col in df.columns if col in COLUMN_ALIASES}
    df.rename(columns=rename_map, inplace=True)

    # Remove duplicate columns (keep first)
    df = df.loc[:, ~df.columns.duplicated()]

    # Fill missing required columns with defaults — never raise error
    for col, default_val in DEFAULTS.items():
        if col not in df.columns:
            df[col] = default_val

    # Timestamp must exist
    if "timestamp" not in df.columns:
        raise ValueError(f"No timestamp column found. Columns in CSV: {list(df.columns)}")

    # Keep only required columns
    df = df[REQUIRED_COLUMNS].copy()

    # Parse timestamps
    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    df = df.dropna(subset=["timestamp"])
    df = df.sort_values("timestamp").reset_index(drop=True)

    # Coerce all numeric columns — replace NaN/Inf with 0
    numeric_cols = [c for c in REQUIRED_COLUMNS if c != "timestamp"]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")
        df[col] = df[col].replace([np.inf, -np.inf], 0).fillna(0)

    return df


def df_to_records(df: pd.DataFrame) -> list:
    out = df.copy()
    out["timestamp"] = out["timestamp"].astype(str)
    numeric_cols = out.select_dtypes(include=[np.number]).columns
    out[numeric_cols] = out[numeric_cols].replace([np.inf, -np.inf], 0).fillna(0)
    out[numeric_cols] = out[numeric_cols].round(4)
    return out.to_dict(orient="records")



