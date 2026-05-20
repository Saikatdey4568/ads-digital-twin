# ADS Digital Twin
### Admixture Dosing System — Historical Telemetry Replay & Simulation Dashboard

---

## Overview

Industrial SCADA-style web application for replaying and simulating historical telemetry from an admixture dosing system fitted to concrete transit mixers.

**Key Features:**
- Upload historical CSV telemetry datasets
- View original sensor combined graph (8 traces, 6 subplots)
- Adjust 14 simulation parameters via sliders
- Run simulation — view recalculated dosing behavior
- Side-by-side original vs. simulated graph comparison
- Dark neon industrial aesthetic (Grafana / ThingsBoard style)

---

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 18 + Vite + Tailwind CSS + Plotly.js |
| Backend  | Python FastAPI + Pandas + NumPy |

---

## Project Structure

```
ADS-Digital-Twin/
├── backend/
│   ├── app.py                 # FastAPI entry point
│   ├── simulator.py           # Simulation engine
│   ├── telemetry_loader.py    # CSV parser & validator
│   ├── config_manager.py      # Pydantic config model
│   ├── requirements.txt
│   └── routes/
│       └── telemetry.py       # API routes
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api/telemetry.js
│       ├── components/
│       │   ├── Header.jsx
│       │   ├── Sidebar.jsx
│       │   ├── SliderControl.jsx
│       │   └── CombinedGraph.jsx
│       └── styles/index.css
│
└── sample_data/
    └── sample_telemetry.csv
```

---

## Quick Start — Linux

### 1. Clone / extract project

```bash
cd ~/
# If you have git:
# git clone <repo> ADS-Digital-Twin
cd ADS-Digital-Twin
```

### 2. Backend setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend (port 8000)
python app.py
# or: uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

Backend runs at: http://localhost:8000
API docs at:     http://localhost:8000/docs

### 3. Frontend setup (new terminal)

```bash
cd frontend

# Install Node dependencies
npm install

# Start dev server (port 5173)
npm run dev
```

Frontend runs at: http://localhost:5173

---

## CSV Dataset Format

```csv
timestamp,avg_pressure,current_pressure,master_pressure,rpm,tank_level,dosing_amount,pump_status,direction
2025-04-21 00:00:00,-14.23,10.50,5.20,0.00,25.00,0.000,0,0
2025-04-21 00:30:00,-2.46,8.30,4.90,0.00,25.00,0.000,0,0
...
```

| Column | Type | Unit | Description |
|--------|------|------|-------------|
| timestamp | datetime | - | ISO or common datetime format |
| avg_pressure | float | Bar | Smoothed average pressure |
| current_pressure | float | Bar | Real-time current pressure |
| master_pressure | float | Bar | Master reference pressure |
| rpm | float | RPM | Mixer drum RPM |
| tank_level | float | L | Admixture tank volume |
| dosing_amount | float | L | Volume dosed per event |
| pump_status | int | 0/1 | Pump on/off |
| direction | int | -1/0/1 | Drum rotation direction |

Use `sample_data/sample_telemetry.csv` to test.

---

## Simulation Parameters

### Dosing
| Param | Default | Description |
|-------|---------|-------------|
| dose_time | 8s | Duration of each dose pulse |
| dose_amount | 0.5L | Volume per dose event |
| max_dose_trip | 5L | Maximum total dose per trip |
| tank_level_limit | 5L | Minimum tank level to allow dosing |

### RPM
| Param | Default | Description |
|-------|---------|-------------|
| transit_rpm_min | 0 | Transit mode RPM lower bound |
| transit_rpm_max | 2 | Transit mode RPM upper bound |
| load_rpm_min | 3 | Load mode RPM lower bound |
| load_rpm_max | 8 | Load mode RPM upper bound |

### Pressure
| Param | Default | Description |
|-------|---------|-------------|
| idle_pressure | 5 Bar | Pressure threshold for idle detection |
| non_idle_pressure | 5 Bar | Pressure diff required to trigger dose |
| master_pressure_time | 900s | Time window for master pressure reference |
| dosing_decide_time | 300s | Minimum interval between dose events |

### Flow
| Param | Default | Description |
|-------|---------|-------------|
| flow_pulse | 80 | Pulses per litre calibration |
| flow_factor | 0.5 | Flow calculation scaling factor |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check & CSV load status |
| POST | /api/upload | Upload CSV file (multipart/form-data) |
| GET | /api/original | Get loaded original dataset |
| POST | /api/simulate | Run simulation with params, returns simulated dataset |

### Example: Run simulation

```bash
curl -X POST http://localhost:8000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{"dose_time":8,"dose_amount":0.5,"max_dose_trip":5,"tank_level_limit":5,
       "transit_rpm_min":0,"transit_rpm_max":2,"load_rpm_min":3,"load_rpm_max":8,
       "idle_pressure":5,"non_idle_pressure":5,"master_pressure_time":900,
       "dosing_decide_time":300,"flow_pulse":80,"flow_factor":0.5}'
```

---

## Production Build

```bash
# Build frontend
cd frontend
npm run build
# Output in frontend/dist/

# Serve with FastAPI static files (add to app.py):
# from fastapi.staticfiles import StaticFiles
# app.mount("/", StaticFiles(directory="../frontend/dist", html=True))

# Or use nginx to serve frontend/dist on port 80
# and proxy /api to uvicorn on port 8000
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS error | Ensure backend is running on port 8000 |
| 400 on /api/simulate | Upload a CSV first via /api/upload |
| Graphs not rendering | Check browser console; ensure Plotly loaded |
| Blank simulated graph | Click "RUN SIMULATION" after uploading CSV |
| Port 8000 in use | `lsof -i :8000` then kill the process |
