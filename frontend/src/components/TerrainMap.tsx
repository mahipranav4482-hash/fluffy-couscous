import React, { useState, useEffect } from 'react';
import { Layers, Mountain, Shield, CloudRain, Crosshair, MapPin, Eye, Zap, AlertCircle } from 'lucide-react';
import { HazardFeature, SimulatedZoneState, WeatherStation } from '../types.js';

interface TerrainMapProps {
  zones: HazardFeature[];
  selectedZone: SimulatedZoneState | null;
  onSelectZone: (zone: SimulatedZoneState) => void;
  selectedRegion: string;
  weatherStations: WeatherStation[];
  historicalScars: any[];
  infrastructure: any[];
}

export const TerrainMap: React.FC<TerrainMapProps> = ({
  zones,
  selectedZone,
  onSelectZone,
  selectedRegion,
  weatherStations,
  historicalScars,
  infrastructure,
}) => {
  const [showRadar, setShowRadar] = useState(true);
  const [showScars, setShowScars] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showContours, setShowContours] = useState(true);
  const [radarIntensity, setRadarIntensity] = useState(65); // dBZ

  // Filter by active region
  const filteredZones = zones.filter((f) =>
    selectedRegion === 'SIKKIM'
      ? f.properties.state === 'Sikkim'
      : f.properties.state === 'Meghalaya'
  );

  // Dynamic color mapper
  const getAlertColor = (level?: string) => {
    switch (level) {
      case 'RED':
        return {
          fill: 'rgba(239, 68, 68, 0.45)',
          stroke: '#EF4444',
          glow: 'pulse-red',
          badge: 'bg-red-600',
        };
      case 'ORANGE':
        return {
          fill: 'rgba(249, 115, 22, 0.40)',
          stroke: '#F97316',
          glow: 'pulse-orange',
          badge: 'bg-orange-600',
        };
      case 'YELLOW':
        return {
          fill: 'rgba(245, 158, 11, 0.35)',
          stroke: '#F59E0B',
          glow: '',
          badge: 'bg-amber-600',
        };
      case 'GREEN':
      default:
        return {
          fill: 'rgba(16, 185, 129, 0.25)',
          stroke: '#10B981',
          glow: '',
          badge: 'bg-emerald-600',
        };
    }
  };

  return (
    <div className="relative flex-1 bg-slate-950 overflow-hidden flex flex-col select-none">
      {/* GIS Layer Controls (Floating Widget) */}
      <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-2xl flex flex-col gap-2.5 text-xs text-slate-300 w-56">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="font-bold tracking-wider text-slate-100 flex items-center gap-1.5 uppercase text-[11px]">
            <Layers className="w-3.5 h-3.5 text-red-400" /> GIS Active Layers
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
            WGS84 / 3D
          </span>
        </div>

        <label className="flex items-center justify-between cursor-pointer hover:text-white transition">
          <span className="flex items-center gap-2">
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" /> IMD Doppler Radar
          </span>
          <input
            type="checkbox"
            checked={showRadar}
            onChange={(e) => setShowRadar(e.target.checked)}
            className="rounded accent-red-600"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer hover:text-white transition">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-400" /> GSI Historical Scars
          </span>
          <input
            type="checkbox"
            checked={showScars}
            onChange={(e) => setShowScars(e.target.checked)}
            className="rounded accent-red-600"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer hover:text-white transition">
          <span className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" /> Evacuation Shelters
          </span>
          <input
            type="checkbox"
            checked={showShelters}
            onChange={(e) => setShowShelters(e.target.checked)}
            className="rounded accent-red-600"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer hover:text-white transition">
          <span className="flex items-center gap-2">
            <Mountain className="w-3.5 h-3.5 text-amber-400" /> Topo Contours (10m)
          </span>
          <input
            type="checkbox"
            checked={showContours}
            onChange={(e) => setShowContours(e.target.checked)}
            className="rounded accent-red-600"
          />
        </label>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 shadow-xl text-[11px] font-mono flex items-center gap-4 text-slate-300">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hazard Key:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500"></span> Normal
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-500/40 border border-amber-500"></span> Advisory
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-orange-500/50 border border-orange-500"></span> Warning
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-500/60 border border-red-500 animate-pulse"></span> Evacuation
        </div>
      </div>

      {/* 2.5D / 3D Canvas GIS Viewport */}
      <div className="relative w-full h-full bg-[#070b12] flex items-center justify-center overflow-hidden">
        {/* Topographic Background Relief Texture */}
        <svg
          viewBox="0 0 1000 650"
          className="w-full h-full object-cover select-none pointer-events-none absolute inset-0 opacity-40"
        >
          <defs>
            <radialGradient id="mountainShading" cx="40%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#0f172a" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.9" />
            </radialGradient>
            <pattern id="contourPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 0 20 Q 10 5, 20 20 T 40 20 M 0 40 Q 15 25, 30 40"
                fill="none"
                stroke="rgba(148, 163, 184, 0.08)"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          <rect width="1000" height="650" fill="url(#mountainShading)" />
          {showContours && <rect width="1000" height="650" fill="url(#contourPattern)" />}

          {/* Elevation Ridge Contours */}
          <path
            d="M 50 300 C 200 220, 350 340, 500 240 C 650 140, 800 280, 950 200"
            fill="none"
            stroke="rgba(148, 163, 184, 0.15)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <path
            d="M 20 400 C 180 320, 380 440, 550 350 C 720 260, 860 380, 980 320"
            fill="none"
            stroke="rgba(148, 163, 184, 0.12)"
            strokeWidth="2"
          />
          <path
            d="M 0 500 C 150 430, 420 540, 600 460 C 780 380, 890 490, 1000 440"
            fill="none"
            stroke="rgba(148, 163, 184, 0.08)"
            strokeWidth="1.5"
          />

          {/* Drainage Network (Teesta River / Canyon Channels) */}
          <path
            d="M 380 50 Q 420 180, 400 320 T 460 520 T 490 650"
            fill="none"
            stroke="#0284c7"
            strokeWidth="3.5"
            strokeOpacity="0.45"
          />
          <path
            d="M 680 120 Q 560 220, 460 330"
            fill="none"
            stroke="#0284c7"
            strokeWidth="2"
            strokeOpacity="0.35"
          />
        </svg>

        {/* Doppler Radar Sweep Effect */}
        {showRadar && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-35">
            <div className="relative w-[580px] h-[580px] rounded-full border border-cyan-500/20 flex items-center justify-center">
              <div className="w-[420px] h-[420px] rounded-full border border-cyan-500/25"></div>
              <div className="w-[260px] h-[260px] rounded-full border border-cyan-500/30"></div>
              <div className="w-[100px] h-[100px] rounded-full border border-cyan-500/40"></div>
              {/* Radar Rotating Beam */}
              <div
                className="absolute inset-0 radar-sweep-anim"
                style={{
                  background:
                    'conic-gradient(from 0deg at 50% 50%, rgba(6, 182, 212, 0.25) 0deg, rgba(6, 182, 212, 0.05) 45deg, transparent 90deg)',
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Interactive Hazard Zones Canvas / SVG */}
        <svg viewBox="0 0 1000 650" className="w-full h-full absolute inset-0 z-10">
          {/* Render Vector Hazard Polygons */}
          {filteredZones.map((feature, idx) => {
            const p = feature.properties;
            const live = p.liveState;
            const currentLevel = live ? live.evalResult.alertLevel : p.currentAlertLevel || 'GREEN';
            const colors = getAlertColor(currentLevel);
            const isSelected = selectedZone?.zoneId === p.zone_id;

            // Compute SVG mapped coordinate positions based on region
            const polygonOffsets: Record<string, string> = {
              'SK-NH10-01': 'M 350 280 L 460 300 L 470 380 L 370 360 Z',
              'SK-PAK-02':  'M 540 240 L 650 250 L 660 330 L 530 310 Z',
              'SK-GTK-03':  'M 600 130 L 730 140 L 740 220 L 590 210 Z',
              'SK-RNG-04':  'M 430 400 L 530 410 L 540 480 L 420 470 Z',
              'ML-SOH-05':  'M 440 260 L 610 270 L 620 410 L 430 390 Z',
              'ML-SHL-06':  'M 550 140 L 710 150 L 720 250 L 540 230 Z',
            };

            const pathD = polygonOffsets[p.zone_id] || 'M 400 250 L 520 260 L 510 350 L 390 340 Z';

            return (
              <g
                key={p.zone_id}
                onClick={() => live && onSelectZone(live)}
                className="cursor-pointer group transition-transform duration-200"
              >
                {/* Hazard Polygon with dynamic fill & glow */}
                <path
                  d={pathD}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={isSelected ? 3.5 : 2}
                  className={`transition-all duration-300 ${isSelected ? 'stroke-white' : ''} ${
                    currentLevel === 'RED' ? 'animate-pulse' : ''
                  }`}
                  filter={isSelected ? 'drop-shadow(0 0 10px rgba(255,255,255,0.6))' : ''}
                />

                {/* Zone Label & FoS Badge */}
                <foreignObject
                  x={idx === 0 ? 365 : idx === 1 ? 555 : idx === 2 ? 615 : 445}
                  y={idx === 0 ? 305 : idx === 1 ? 265 : idx === 2 ? 155 : 425}
                  width="180"
                  height="70"
                  className="pointer-events-none"
                >
                  <div
                    className={`px-2 py-1 rounded-md text-[10px] font-mono text-white shadow-lg border backdrop-blur-sm ${
                      currentLevel === 'RED'
                        ? 'bg-red-950/90 border-red-500 text-red-200 pulse-red'
                        : currentLevel === 'ORANGE'
                        ? 'bg-orange-950/90 border-orange-500 text-orange-200'
                        : currentLevel === 'YELLOW'
                        ? 'bg-amber-950/90 border-amber-500 text-amber-200'
                        : 'bg-slate-900/80 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>{p.zone_id}</span>
                      <span className="text-[9px] px-1 rounded bg-black/40">
                        {live ? `FoS: ${live.currentFoS.factorOfSafety}` : `FoS: ${p.currentFoS}`}
                      </span>
                    </div>
                    <div className="text-[9px] truncate opacity-90">{p.name}</div>
                    <div className="text-[8px] opacity-75">
                      Rain: {live ? `${live.rainfall24h}mm` : `${p.currentRainfall24h}mm`} | DTI:{' '}
                      {live ? live.evalResult.dynamicTriggerIndex : p.currentDti}
                    </div>
                  </div>
                </foreignObject>
              </g>
            );
          })}

          {/* Historical Scars Points */}
          {showScars &&
            historicalScars.map((scar, i) => {
              const cx = selectedRegion === 'SIKKIM' ? 390 + i * 80 : 490 + i * 70;
              const cy = selectedRegion === 'SIKKIM' ? 320 + (i % 2) * 50 : 330;
              return (
                <g key={`scar-${i}`} className="group cursor-help">
                  <circle cx={cx} cy={cy} r="5" fill="#f43f5e" stroke="#fff" strokeWidth="1.5" />
                  <title>{`Historical Landslide: ${scar.properties.location} (${scar.properties.year}) - Trigger: ${scar.properties.trigger}`}</title>
                </g>
              );
            })}

          {/* Critical Infrastructure / Evac Shelters */}
          {showShelters &&
            infrastructure.map((infra, i) => {
              const cx = selectedRegion === 'SIKKIM' ? 510 + i * 50 : 580;
              const cy = selectedRegion === 'SIKKIM' ? 220 + i * 60 : 290;
              return (
                <g key={`infra-${i}`} className="group cursor-help">
                  <rect
                    x={cx - 5}
                    y={cy - 5}
                    width="10"
                    height="10"
                    fill="#10b981"
                    stroke="#fff"
                    strokeWidth="1.5"
                    transform={`rotate(45 ${cx} ${cy})`}
                  />
                  <title>{`Shelter: ${infra.properties.name} (Cap: ${infra.properties.capacity_persons || 'N/A'})`}</title>
                </g>
              );
            })}
        </svg>

        {/* National Highway Lifeline Corridor Vector */}
        <svg viewBox="0 0 1000 650" className="w-full h-full absolute inset-0 pointer-events-none">
          <path
            d="M 330 390 Q 400 350, 480 340 T 570 280 T 660 170"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeDasharray="6 4"
            className="opacity-80"
          />
          <text x="360" y="345" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold">
            NH-10 Highway Corridor (Lifeline)
          </text>
        </svg>
      </div>
    </div>
  );
};
