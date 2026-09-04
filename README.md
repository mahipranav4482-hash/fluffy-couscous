# Terrain Guard
### Earth-Scale Real-Time Multi-Hazard Monitoring & 500-Meter Emergency Warning System
**SIH 2026 Problem Statement SIH26001 | Ministry of Development of North Eastern Region (MDoNER)**

**Terrain Guard** is an AI-powered, full-stack disaster intelligence and early warning platform. It enables citizens and disaster authorities to monitor past, active, and upcoming disasters across every country and state on Earth, featuring live screen mapping, anomaly detection, and an automated **500-meter hyper-local emergency audio buzzer siren**.

---

## 🌟 Key Features & Architectural Innovations

1. **Dual-Timeframe AI Engine**:
   - **Static Spatial Susceptibility**: Physics-informed machine learning (LightGBM/XGBoost + Focal Loss) regularized by the 1D Infinite Slope Factor of Safety ($FoS$).
   - **Dynamic Hydrological Trigger**: Real-time evaluation of the Dynamic Trigger Index ($DTI$) and regional Intensity-Duration ($I = \alpha \cdot D^{-\beta}$) empirical curves calibrated for the Eastern Himalayas.
2. **High-Performance 3D Web GIS Command Center**:
   - Interactive 2.5D/3D topographic elevation canvas with dynamic hazard micro-zones (Green, Yellow, Orange, Red).
   - Real-time animated Doppler Weather Radar reflectivity overlay.
   - 24-hour temporal scrubbing timeline and scenario switcher (`Normal`, `Monsoon Surge`, `Cloudburst`).
3. **Geotechnical Micro-Zonation Inspector**:
   - Instantaneous Factor of Safety gauge ($FoS = \frac{\tau_r}{\tau_d}$), pore-water pressure ratio ($R_u$), InSAR ground deformation velocity, and 1h/24h/72h rainfall accumulations.
4. **Resilient Low-Bandwidth Edge & Offline PWA**:
   - Mobile-responsive field companion operating seamlessly in zero-connectivity or 2G/EDGE cellular environments.
   - Offline Dijkstra evacuation router using local SQLite/IndexedDB vector graphs to bypass active red hazard polygons.
   - Dual emergency alerts: OASIS Common Alerting Protocol (C-DOT CAP v1.2 XML) and ultra-compact 43-character Reverse-SMS fallback.
5. **Crowdsourced Ground Incident Network**:
   - Offline-first field reporter with GPS geocoding and photo compression to log tension cracks, road collapses, and river surges.

---

## 🚀 Quick Start & Running Locally

### Prerequisites
- Node.js (v18+) and npm

### 1. Launch the Production Server
The compiled backend serves both the REST/WebSocket API and the production 3D Web GIS frontend:

```bash
# Navigate to backend directory
cd backend

# Start the server
node dist/server.js
```

Open your browser at **[http://localhost:5000](http://localhost:5000)** to launch the 3D Command Dashboard.

### 2. Run Verification Test Suite
Verify the physical slope stability equations, I-D threshold curves, and CAP XML generator:

```bash
cd backend
npm test
```

### 3. API Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | System health, service status, and WebSocket client count |
| `GET` | `/api/v1/zones` | GeoJSON hazard zones with real-time dynamic properties |
| `GET` | `/api/v1/scars` | GSI historical landslide catalog points |
| `GET` | `/api/v1/infrastructure` | Evacuation shelters, hospitals, and BRO posts |
| `POST` | `/api/v1/risk/evaluate` | Dynamic point-in-polygon risk evaluation |
| `POST` | `/api/v1/simulation/control` | Controls playback hour (0-24h) and scenario (`NORMAL`, `MONSOON_SURGE`, `CLOUDBURST`) |
| `POST` | `/api/v1/crowdsource/report` | Submits field incident report |
| `GET` | `/api/v1/alerts/cap/:zoneId` | Downloads OASIS CAP v1.2 XML for emergency broadcast |
| `WS` | `/api/v1/ws/alerts` | Real-time WebSocket stream of risk state changes |

---

## 📂 Project Structure

```
SIH/
├── backend/                  # Geospatial Engine & API
│   ├── src/
│   │   ├── algorithms/       # Slope Stability FoS, Dynamic Trigger Index, I-D Curves
│   │   ├── data/             # Calibrated GeoJSON microzones, GSI scars, Shelters
│   │   ├── services/         # CAP XML Generator, Simulation Engine
│   │   └── server.ts         # Express & WebSocket Hub
│   ├── tests/                # Automated Algorithmic Verification Suite
│   └── package.json
├── frontend/                 # 3D Web GIS Dashboard & PWA
│   ├── src/
│   │   ├── components/       # TerrainMap, CellInspector, SimulationControls, Header
│   │   ├── App.tsx           # Dashboard integration
│   │   └── index.css         # Tailwind & custom radar animations
│   └── package.json
├── ml-pipeline/              # Python Data Science & Model Training
│   ├── feature_engineering.py# DEM Zevenbergen & Thorne derivatives (Slope, Curvatures, TWI)
│   ├── train_susceptibility.py# Spatial Block Cross-Validation & Focal Loss XGBoost
│   ├── temporal_bilstm.py    # PyTorch Bi-LSTM with Attention & ONNX Exporter
│   └── requirements.txt      # Python dependencies
└── docs/                     # Architectural specifications and diagrams
```
