import React, { useState } from 'react';
import { BeforeAfterImageryRecord } from '../data/beforeAfterData.js';
import {
  Satellite,
  Layers,
  ArrowRightLeft,
  Eye,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Cpu,
  Radio,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface BeforeAfterViewerProps {
  record: BeforeAfterImageryRecord;
}

export const BeforeAfterViewer: React.FC<BeforeAfterViewerProps> = ({ record }) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // 0 to 100%
  const [activeFilter, setActiveFilter] = useState<'NATURAL' | 'NDVI' | 'RADAR_SAR'>('NATURAL');
  const [activeTab, setActiveTab] = useState<'SLIDER' | 'SIDE_BY_SIDE'>('SLIDER');

  // SVG Visual Simulation Generators based on Disaster Type
  const renderVisualSimulation = (isAfter: boolean) => {
    switch (record.id) {
      case 'BA-001': // Banda Aceh Tsunami
        return (
          <svg viewBox="0 0 600 340" className="w-full h-full object-cover">
            <defs>
              <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0369a1" />
                <stop offset="100%" stopColor="#0c4a6e" />
              </linearGradient>
              <linearGradient id="scourGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="70%" stopColor="#451a03" />
                <stop offset="100%" stopColor="#14532d" />
              </linearGradient>
            </defs>

            {/* Ocean */}
            <rect width="200" height="340" fill="url(#oceanGrad)" />

            {/* Land Area */}
            {isAfter ? (
              <>
                {/* Brown Scoured Dead Zone */}
                <rect x="200" width="260" height="340" fill="url(#scourGrad)" />
                {/* Remaining Inland Vegetation */}
                <rect x="460" width="140" height="340" fill="#14532d" />
                {/* Coastal Saltwater Inundation Lagoons */}
                <ellipse cx="230" cy="120" rx="40" ry="80" fill="#0369a1" opacity="0.8" />
                <ellipse cx="240" cy="250" rx="30" ry="60" fill="#0369a1" opacity="0.8" />
                {/* Scour Lines */}
                <path d="M 200 40 Q 350 70, 450 60" stroke="#92400e" strokeWidth="3" fill="none" />
                <path d="M 200 160 Q 360 180, 460 170" stroke="#92400e" strokeWidth="4" fill="none" />
                <path d="M 200 280 Q 340 300, 450 290" stroke="#92400e" strokeWidth="3" fill="none" />
                {/* Solitary Baiturrahman Mosque */}
                <circle cx="360" cy="170" r="8" fill="#f8fafc" stroke="#38bdf8" strokeWidth="2" />
                <text x="375" y="174" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">
                  Baiturrahman Mosque (Standing)
                </text>
                <text x="210" y="30" fill="#f87171" fontSize="12" fontWeight="bold" fontFamily="monospace">
                  3.2 km Inland Scour Dead Zone (Stripped to Bedrock)
                </text>
              </>
            ) : (
              <>
                {/* Dense Tropical Palm Green */}
                <rect x="200" width="400" height="340" fill="#15803d" />
                {/* Sandy White Beach Strip */}
                <rect x="195" width="15" height="340" fill="#fde68a" />
                {/* Urban Grid Pattern */}
                <path d="M 230 40 L 400 40 M 230 90 L 420 90 M 230 140 L 410 140 M 230 190 L 430 190 M 230 240 L 400 240 M 230 290 L 410 290" stroke="#4ade80" strokeWidth="2" />
                <path d="M 280 20 L 280 320 M 340 20 L 340 320 M 390 20 L 390 320" stroke="#4ade80" strokeWidth="2" />
                <circle cx="360" cy="170" r="6" fill="#ffffff" />
                <text x="220" y="30" fill="#4ade80" fontSize="12" fontWeight="bold" fontFamily="monospace">
                  Pristine Green Canopy & Bustling Port City
                </text>
              </>
            )}
          </svg>
        );

      case 'BA-002': // 2011 Tohoku Tsunami
        return (
          <svg viewBox="0 0 600 340" className="w-full h-full object-cover">
            <rect width="600" height="340" fill="#020617" />
            {isAfter ? (
              <>
                {/* 560 km² Inundated Flood Water Ocean */}
                <rect width="450" height="340" fill="#0f172a" />
                {/* Inky Black Saline Water Intrusion */}
                <path d="M 0 0 L 420 0 Q 380 170, 440 340 L 0 340 Z" fill="#0369a1" fillOpacity="0.75" />
                {/* Debris Fields */}
                <circle cx="280" cy="120" r="14" fill="#78350f" opacity="0.8" />
                <circle cx="320" cy="190" r="22" fill="#78350f" opacity="0.8" />
                <circle cx="210" cy="240" r="18" fill="#78350f" opacity="0.8" />
                {/* Shattered Seawall */}
                <path d="M 120 0 L 120 340" stroke="#ef4444" strokeWidth="4" strokeDasharray="8,6" />
                <text x="135" y="40" fill="#ef4444" fontSize="11" fontWeight="bold" fontFamily="monospace">
                  Shattered Seawall Overtopped (10m)
                </text>
                {/* Miracle Pine Marker */}
                <circle cx="390" cy="160" r="5" fill="#22c55e" stroke="#ffffff" strokeWidth="1.5" />
                <text x="405" y="164" fill="#22c55e" fontSize="11" fontWeight="bold" fontFamily="monospace">
                  Sole "Miracle Pine" (1 of 70,000)
                </text>
                <text x="20" y="320" fill="#38bdf8" fontSize="12" fontWeight="bold" fontFamily="monospace">
                  561 km² Submerged • -1.2m Tectonic Subsidence
                </text>
              </>
            ) : (
              <>
                <rect width="200" height="340" fill="#0369a1" />
                {/* Solid Seawall */}
                <rect x="200" width="10" height="340" fill="#94a3b8" />
                {/* Historic Coastal Pine Forest Belt (70,000 trees) */}
                <rect x="210" width="60" height="340" fill="#14532d" />
                {/* Geometric Rice Paddies */}
                <rect x="270" width="330" height="340" fill="#166534" />
                <path d="M 270 60 L 600 60 M 270 120 L 600 120 M 270 180 L 600 180 M 270 240 L 600 240 M 270 300 L 600 300" stroke="#22c55e" strokeWidth="1" opacity="0.6" />
                <path d="M 350 0 L 350 340 M 430 0 L 430 340 M 510 0 L 510 340" stroke="#22c55e" strokeWidth="1" opacity="0.6" />
                <text x="220" y="30" fill="#4ade80" fontSize="12" fontWeight="bold" fontFamily="monospace">
                  Intact Seawall & Takata-Matsubara Pine Belt
                </text>
              </>
            )}
          </svg>
        );

      case 'BA-003': // Kedarnath Cloudburst & GLOF
        return (
          <svg viewBox="0 0 600 340" className="w-full h-full object-cover">
            <rect width="600" height="340" fill="#1e293b" />
            {isAfter ? (
              <>
                {/* Empty Moraine Crater */}
                <ellipse cx="300" cy="50" rx="80" ry="35" fill="#475569" stroke="#ef4444" strokeWidth="2.5" />
                <text x="235" y="55" fill="#ef4444" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  Breached Moraine (Empty)
                </text>
                {/* 15m Deep Slurry Debris Torrent Channel */}
                <path d="M 300 85 Q 260 140, 270 180 T 250 250 T 280 340" stroke="#64748b" strokeWidth="48" fill="none" />
                <path d="M 300 85 Q 340 140, 330 180 T 350 250 T 320 340" stroke="#64748b" strokeWidth="48" fill="none" />
                {/* 8th Century Kedarnath Temple Safe in Middle */}
                <rect x="290" y="170" width="20" height="25" fill="#f8fafc" stroke="#f59e0b" strokeWidth="2" />
                <text x="318" y="188" fill="#f59e0b" fontSize="11" fontWeight="bold" fontFamily="monospace">
                  Kedarnath Temple (Miraculous Boulder Shield)
                </text>
                <text x="180" y="310" fill="#f87171" fontSize="11" fontWeight="bold" fontFamily="monospace">
                  Rambara Settlement (100% Leveled / Erased)
                </text>
              </>
            ) : (
              <>
                {/* Full Blue Glacial Moraine Lake */}
                <ellipse cx="300" cy="50" rx="80" ry="35" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                <text x="240" y="55" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  Chorabari Glacial Lake (Full)
                </text>
                {/* Natural Alpine River Channel */}
                <path d="M 300 85 Q 305 150, 295 220 T 300 340" stroke="#0ea5e9" strokeWidth="8" fill="none" />
                {/* Alpine Valley Greenery */}
                <rect x="150" y="100" width="120" height="220" fill="#15803d" opacity="0.6" />
                <rect x="330" y="100" width="120" height="220" fill="#15803d" opacity="0.6" />
                <rect x="290" y="170" width="20" height="25" fill="#f8fafc" />
                <text x="220" y="30" fill="#4ade80" fontSize="12" fontWeight="bold" fontFamily="monospace">
                  Glacial Moraine Reservoir & Intact Valley Trail
                </text>
              </>
            )}
          </svg>
        );

      case 'BA-004': // Wayanad Landslide
        return (
          <svg viewBox="0 0 600 340" className="w-full h-full object-cover">
            <rect width="600" height="340" fill="#14532d" />
            {isAfter ? (
              <>
                {/* 8-km Red Mud Landslide Scar */}
                <path d="M 300 10 Q 250 80, 280 150 T 260 240 T 300 340" stroke="#b91c1c" strokeWidth="55" fill="none" />
                <path d="M 300 10 Q 250 80, 280 150 T 260 240 T 300 340" stroke="#7f1d1d" strokeWidth="35" fill="none" />
                {/* Washed Away Bridge Marker */}
                <circle cx="280" cy="180" r="10" fill="#000000" stroke="#ef4444" strokeWidth="2" />
                <text x="300" y="185" fill="#fca5a5" fontSize="11" fontWeight="bold" fontFamily="monospace">
                  Chooralmala Bridge (Severed)
                </text>
                <text x="30" y="40" fill="#f87171" fontSize="12" fontWeight="bold" fontFamily="monospace">
                  8.0 km Red Mud Scar • River Widened 15m → 150m (10x)
                </text>
              </>
            ) : (
              <>
                {/* Manicured Tea Plantation Patterns */}
                <rect width="600" height="340" fill="#166534" />
                <path d="M 0 50 Q 300 30, 600 50 M 0 110 Q 300 90, 600 110 M 0 170 Q 300 150, 600 170 M 0 230 Q 300 210, 600 230" stroke="#22c55e" strokeWidth="2" fill="none" opacity="0.7" />
                {/* Narrow 15m River */}
                <path d="M 300 10 Q 295 80, 305 150 T 300 240 T 300 340" stroke="#38bdf8" strokeWidth="6" fill="none" />
                <rect x="290" y="175" width="20" height="8" fill="#e2e8f0" />
                <text x="30" y="40" fill="#4ade80" fontSize="12" fontWeight="bold" fontFamily="monospace">
                  Vellarmala Dense Rainforest & Tea Estates
                </text>
              </>
            )}
          </svg>
        );

      case 'BA-006': // Pakistan 100km Inland Sea
        return (
          <svg viewBox="0 0 600 340" className="w-full h-full object-cover">
            <rect width="600" height="340" fill="#78350f" />
            {isAfter ? (
              <>
                {/* 100km Wide Inland Sea (Dark Water) */}
                <ellipse cx="300" cy="170" rx="240" ry="120" fill="#0f172a" stroke="#0284c7" strokeWidth="3" />
                {/* Submerged Islands */}
                <circle cx="220" cy="140" r="14" fill="#b45309" />
                <circle cx="340" cy="190" r="18" fill="#b45309" />
                <circle cx="380" cy="120" r="12" fill="#b45309" />
                <text x="210" y="180" fill="#38bdf8" fontSize="14" fontWeight="bold" fontFamily="monospace">
                  100 km-Wide Inland Sea (1/3 of Nation Submerged)
                </text>
              </>
            ) : (
              <>
                {/* Arid Tan Desert Soils */}
                <rect width="600" height="340" fill="#92400e" />
                {/* Meandering Indus River Ribbon */}
                <path d="M 100 0 Q 300 80, 250 170 T 450 340" stroke="#0284c7" strokeWidth="12" fill="none" />
                <text x="40" y="40" fill="#fed7aa" fontSize="12" fontWeight="bold" fontFamily="monospace">
                  Dry Sindh Soils & Narrow Indus Canal Network
                </text>
              </>
            )}
          </svg>
        );

      case 'BA-007': // 2023 Turkey Fault Rupture
        return (
          <svg viewBox="0 0 600 340" className="w-full h-full object-cover">
            <rect width="600" height="340" fill="#1e293b" />
            {isAfter ? (
              <>
                {/* Fault Rupture Line Slicing Across */}
                <line x1="300" y1="0" x2="300" y2="340" stroke="#ef4444" strokeWidth="3" strokeDasharray="6,4" />
                {/* Shifted Roads with 4-Meter Lateral Offset */}
                <line x1="50" y1="120" x2="298" y2="120" stroke="#94a3b8" strokeWidth="12" />
                <line x1="302" y1="160" x2="550" y2="160" stroke="#94a3b8" strokeWidth="12" />
                {/* Offset Arrow */}
                <path d="M 300 120 L 300 160" stroke="#facc15" strokeWidth="3" />
                <text x="315" y="145" fill="#facc15" fontSize="11" fontWeight="bold" fontFamily="monospace">
                  ← 3.8m Lateral Ground Offset →
                </text>
                {/* Collapsed Rubble Blocks */}
                <rect x="140" y="180" width="40" height="30" fill="#64748b" stroke="#ef4444" strokeWidth="1.5" />
                <rect x="420" y="70" width="40" height="30" fill="#64748b" stroke="#ef4444" strokeWidth="1.5" />
                <text x="30" y="40" fill="#f87171" fontSize="12" fontWeight="bold" fontFamily="monospace">
                  500 km Surface Rupture • 4-Meter Tectonic Offset
                </text>
              </>
            ) : (
              <>
                {/* Straight Continuous Highways and Farms */}
                <line x1="50" y1="140" x2="550" y2="140" stroke="#94a3b8" strokeWidth="12" />
                <line x1="50" y1="220" x2="550" y2="220" stroke="#94a3b8" strokeWidth="8" />
                {/* Agricultural Orchard Rows */}
                <path d="M 80 50 L 520 50 M 80 80 L 520 80 M 80 280 L 520 280" stroke="#15803d" strokeWidth="4" strokeDasharray="12,12" />
                <rect x="140" y="170" width="40" height="40" fill="#38bdf8" opacity="0.8" />
                <rect x="420" y="60" width="40" height="40" fill="#38bdf8" opacity="0.8" />
                <text x="30" y="40" fill="#4ade80" fontSize="12" fontWeight="bold" fontFamily="monospace">
                  Unbroken Continuous Highway & Olive Orchards
                </text>
              </>
            )}
          </svg>
        );

      case 'BA-008': // Australian Black Summer Megafires
        return (
          <svg viewBox="0 0 600 340" className="w-full h-full object-cover">
            <rect width="600" height="340" fill="#0f172a" />
            {isAfter ? (
              <>
                {/* 24 Million Hectares Charcoal Black Burn Scar */}
                <rect width="600" height="340" fill="#18181b" />
                <path d="M 100 80 Q 250 40, 450 120 T 550 280 T 200 320 Z" fill="#451a03" stroke="#ea580c" strokeWidth="3" opacity="0.9" />
                {/* Pyro-cumulonimbus Cloud Pillar */}
                <ellipse cx="380" cy="90" rx="90" ry="50" fill="#78716c" opacity="0.8" />
                <circle cx="340" cy="70" r="35" fill="#a8a29e" opacity="0.9" />
                <text x="30" y="40" fill="#fb923c" fontSize="12" fontWeight="bold" fontFamily="monospace">
                  24 Million Hectares Scorched • Stratospheric Smoke Plume
                </text>
              </>
            ) : (
              <>
                {/* Dense Green Eucalyptus Forest */}
                <rect width="600" height="340" fill="#14532d" />
                <path d="M 50 100 Q 200 80, 350 140 T 550 200" stroke="#16a34a" strokeWidth="15" fill="none" opacity="0.8" />
                <text x="30" y="40" fill="#4ade80" fontSize="12" fontWeight="bold" fontFamily="monospace">
                  Dense Eucalyptus Canopy & High Moisture Reserves
                </text>
              </>
            )}
          </svg>
        );

      case 'BA-005': // Mount St. Helens
      default:
        return (
          <svg viewBox="0 0 600 340" className="w-full h-full object-cover">
            <rect width="600" height="340" fill="#0f172a" />
            {isAfter ? (
              <>
                {/* Horseshoe-shaped Caldera (400m summit gone) */}
                <polygon points="120,320 250,180 350,180 480,320" fill="#475569" />
                <ellipse cx="300" cy="180" rx="70" ry="25" fill="#1e293b" stroke="#ea580c" strokeWidth="2" />
                {/* Blast Blowdown Timber Flattened */}
                <path d="M 80 80 L 140 100 M 160 60 L 220 90 M 380 70 L 440 100 M 460 60 L 520 80" stroke="#78716c" strokeWidth="3" />
                {/* Choked Spirit Lake with floating logs */}
                <ellipse cx="440" cy="220" rx="60" ry="30" fill="#451a03" stroke="#92400e" strokeWidth="2" />
                <text x="30" y="40" fill="#fb923c" fontSize="12" fontWeight="bold" fontFamily="monospace">
                  400m Summit Collapsed • 600 km² Blast Blowdown
                </text>
              </>
            ) : (
              <>
                {/* Perfect Symmetrical Peak */}
                <polygon points="120,320 300,80 480,320" fill="#334155" />
                {/* Glacial Snow Cap */}
                <polygon points="260,140 300,80 340,140 300,150" fill="#f8fafc" />
                {/* Spirit Lake Blue */}
                <ellipse cx="440" cy="240" rx="60" ry="30" fill="#0284c7" />
                <text x="30" y="40" fill="#4ade80" fontSize="12" fontWeight="bold" fontFamily="monospace">
                  Symmetrical Conical Volcano (2,950m) & Spirit Lake
                </text>
              </>
            )}
          </svg>
        );
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-xs select-none">
      {/* 1. Header with Mode Controls */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Satellite className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-extrabold text-white">
              {record.disasterName} ({record.year})
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono font-bold text-slate-300">
              {record.location}, {record.country}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Multi-Temporal Satellite Change Detection & Ground-Truth Signature
          </p>
        </div>

        {/* View Mode Switcher: Interactive Slider vs Side-by-Side */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
            <button
              onClick={() => setActiveTab('SLIDER')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'SLIDER' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Interactive Split Slider</span>
            </button>
            <button
              onClick={() => setActiveTab('SIDE_BY_SIDE')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'SIDE_BY_SIDE' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Interactive Viewer Screen */}
      <div className="p-4">
        {activeTab === 'SLIDER' ? (
          /* SLIDER MODE */
          <div className="space-y-3">
            <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-slate-800 shadow-inner bg-slate-900">
              {/* After Image Layer (Base) */}
              <div className="absolute inset-0 w-full h-full">
                {renderVisualSimulation(true)}
              </div>

              {/* Before Image Layer (Clipped by Slider) */}
              <div
                className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-cyan-400 shadow-2xl"
                style={{ width: `${sliderPos}%` }}
              >
                <div className="w-[1000px] max-w-none h-full" style={{ width: '100%' }}>
                  {renderVisualSimulation(false)}
                </div>
              </div>

              {/* Overlay Badges */}
              <div className="absolute top-3 left-3 bg-emerald-950/90 text-emerald-300 font-mono font-extrabold px-2.5 py-1 rounded-lg border border-emerald-700/80 text-[10px] shadow-lg pointer-events-none">
                ← BEFORE DISASTER
              </div>
              <div className="absolute top-3 right-3 bg-rose-950/90 text-rose-300 font-mono font-extrabold px-2.5 py-1 rounded-lg border border-rose-700/80 text-[10px] shadow-lg pointer-events-none">
                AFTER DISASTER →
              </div>

              {/* Central Draggable Handle Indicator */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-2xl pointer-events-none border-2 border-white"
                style={{ left: `${sliderPos}%` }}
              >
                <ArrowRightLeft className="w-4 h-4 font-black" />
              </div>
            </div>

            {/* Slider Range Controller */}
            <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold text-emerald-400 font-mono">100% BEFORE</span>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
              />
              <span className="text-[11px] font-bold text-rose-400 font-mono">100% AFTER</span>
            </div>
          </div>
        ) : (
          /* SIDE BY SIDE MODE */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Before Card */}
            <div className="border border-emerald-500/40 rounded-2xl overflow-hidden bg-slate-900/80 flex flex-col">
              <div className="p-2.5 bg-emerald-950/60 border-b border-emerald-900/60 flex items-center justify-between text-[11px]">
                <span className="font-extrabold text-emerald-400 font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> BEFORE THE DISASTER
                </span>
                <span className="text-slate-400 font-mono text-[10px]">{record.before.satelliteSensor}</span>
              </div>
              <div className="h-56 w-full">
                {renderVisualSimulation(false)}
              </div>
              <div className="p-3 bg-slate-950 text-slate-300 text-[11px] leading-relaxed border-t border-slate-800">
                {record.before.description}
              </div>
            </div>

            {/* After Card */}
            <div className="border border-rose-500/40 rounded-2xl overflow-hidden bg-slate-900/80 flex flex-col">
              <div className="p-2.5 bg-rose-950/60 border-b border-rose-900/60 flex items-center justify-between text-[11px]">
                <span className="font-extrabold text-rose-400 font-mono flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> AFTER THE DISASTER
                </span>
                <span className="text-slate-400 font-mono text-[10px]">{record.after.satelliteSensor}</span>
              </div>
              <div className="h-56 w-full">
                {renderVisualSimulation(true)}
              </div>
              <div className="p-3 bg-slate-950 text-slate-300 text-[11px] leading-relaxed border-t border-slate-800">
                {record.after.description}
              </div>
            </div>
          </div>
        )}

        {/* 3. Detailed Satellite Ground-Truth & Change Detection Breakdown */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Pre-Disaster Ground Truth Points */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <span className="font-bold text-emerald-400 font-mono uppercase text-[10px] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Pre-Disaster Satellite Observation
            </span>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              {record.before.groundTruthPoints.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
              Sensor: <strong className="text-slate-200">{record.before.satelliteSensor}</strong>
            </div>
          </div>

          {/* Post-Disaster Ground Truth Points */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <span className="font-bold text-rose-400 font-mono uppercase text-[10px] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Post-Disaster Ground Truth & Destruction
            </span>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              {record.after.groundTruthPoints.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
              Sensor: <strong className="text-slate-200">{record.after.satelliteSensor}</strong>
            </div>
          </div>
        </div>

        {/* 4. Satellite Scientific Change Detection Badge Banner */}
        <div className="mt-3 bg-cyan-950/40 border border-cyan-800/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          <div>
            <span className="text-[10px] text-cyan-400 block uppercase font-bold">
              🛰️ Scientific Change Detection Algorithm
            </span>
            <span className="text-white font-bold text-xs">
              {record.changeDetectionMetrics.spectralMethod}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-400 block font-sans">PRIMARY IMPACT METRIC</span>
              <span className="text-amber-400 font-extrabold text-xs">
                {record.changeDetectionMetrics.metricValue}
              </span>
            </div>

            <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-400 block font-sans">
                {record.changeDetectionMetrics.secondaryMetric.toUpperCase()}
              </span>
              <span className="text-rose-400 font-extrabold text-xs">
                {record.changeDetectionMetrics.secondaryValue}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
