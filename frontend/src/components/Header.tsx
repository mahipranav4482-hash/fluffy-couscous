import React from 'react';
import { AlertTriangle, ShieldAlert, Wifi, WifiOff, Smartphone, Radio, Compass, RefreshCw, History, Globe, Satellite } from 'lucide-react';
import { SimulationState } from '../types.js';

interface HeaderProps {
  simState: SimulationState | null;
  wsConnected: boolean;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  onOpenReportModal: () => void;
  onTogglePwaView: () => void;
  isPwaViewOpen: boolean;
  activeMode: 'REGIONAL_LEWS' | 'GLOBAL_MONITOR' | 'HISTORICAL_ARCHIVE';
  setActiveMode: (mode: 'REGIONAL_LEWS' | 'GLOBAL_MONITOR' | 'HISTORICAL_ARCHIVE') => void;
  onTest500mAlert: () => void;
  onOpenSatelliteStudio: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  simState,
  wsConnected,
  selectedRegion,
  setSelectedRegion,
  onOpenReportModal,
  onTogglePwaView,
  isPwaViewOpen,
  activeMode,
  setActiveMode,
  onTest500mAlert,
  onOpenSatelliteStudio,
}) => {
  const alertCounts = { RED: 0, ORANGE: 0, YELLOW: 0, GREEN: 0 };

  if (simState && simState.zones) {
    for (const z of simState.zones) {
      alertCounts[z.evalResult.alertLevel]++;
    }
  }

  return (
    <header className="h-14 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 z-30 shrink-0 select-none">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 via-amber-500 to-emerald-600 flex items-center justify-center shadow-md border border-slate-700">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-extrabold text-white tracking-wide flex items-center gap-1.5">
            Terrain Guard <span className="text-[10px] bg-red-500/20 text-red-400 font-mono px-1.5 py-0.5 rounded border border-red-500/30">EWS 2026</span>
          </h1>
        </div>
      </div>

      {/* Center: Primary View Mode Switcher */}
      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs shadow-inner">
        <button
          onClick={() => setActiveMode('GLOBAL_MONITOR')}
          className={`px-3 py-1.5 rounded-lg transition font-bold flex items-center gap-1.5 ${
            activeMode === 'GLOBAL_MONITOR'
              ? 'bg-red-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Live Monitor</span>
        </button>

        <button
          onClick={() => setActiveMode('HISTORICAL_ARCHIVE')}
          className={`px-3 py-1.5 rounded-lg transition font-bold flex items-center gap-1.5 ${
            activeMode === 'HISTORICAL_ARCHIVE'
              ? 'bg-amber-600 text-slate-950 font-extrabold shadow'
              : 'text-amber-400 hover:text-amber-300'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Historical Archive</span>
        </button>

        <button
          onClick={() => setActiveMode('REGIONAL_LEWS')}
          className={`px-3 py-1.5 rounded-lg transition font-bold flex items-center gap-1.5 ${
            activeMode === 'REGIONAL_LEWS'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">3D LEWS</span>
        </button>
      </div>

      {/* Right: Key Wanted Actions Only */}
      <div className="flex items-center gap-2">
        {/* 500m Alarm Test Button */}
        <button
          onClick={onTest500mAlert}
          className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow flex items-center gap-1.5"
          title="Test hyper-local 500m audio buzzer and evacuation screen"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          <span>🚨 500m Buzzer</span>
        </button>

        {/* Satellite Studio Button */}
        <button
          onClick={onOpenSatelliteStudio}
          className="bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-sm flex items-center gap-1.5"
          title="View Before & After Live Satellite Imagery for Earth's Landmark Disasters"
        >
          <Satellite className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Satellite Studio</span>
        </button>

        {/* Status Indicator */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 text-[10px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="hidden md:inline">ONLINE</span>
        </div>
      </div>
    </header>
  );
};
