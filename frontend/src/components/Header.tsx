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
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-30 shrink-0 select-none">
      {/* Brand & Ministry Info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 via-amber-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-red-950/40 border border-slate-700">
          <ShieldAlert className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold text-white tracking-wide flex items-center gap-1.5">
              Global Disaster Managing Web <span className="text-xs bg-red-500/20 text-red-400 font-mono px-2 py-0.5 rounded border border-red-500/30">EWS 2026</span>
            </h1>
            <span className="text-xs text-slate-400 hidden md:inline">|</span>
            <span className="text-xs font-medium text-slate-300 hidden md:inline">Earth-Scale Disaster Response Platform</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Live Screen Mapping • Multi-Hazard Anomaly Detection • 500m Emergency Buzzer
          </p>
        </div>
      </div>

      {/* Operating Mode Switcher & Controls */}
      <div className="flex items-center gap-3">
        {/* Triple Mode Switcher: Live Map, Historical Archive, Regional LEWS */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs shadow-inner">
          <button
            onClick={() => setActiveMode('GLOBAL_MONITOR')}
            className={`px-3 py-1.5 rounded-lg transition font-bold flex items-center gap-1.5 ${
              activeMode === 'GLOBAL_MONITOR'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> Earth Live Map
          </button>

          <button
            onClick={() => setActiveMode('HISTORICAL_ARCHIVE')}
            className={`px-3 py-1.5 rounded-lg transition font-bold flex items-center gap-1.5 ${
              activeMode === 'HISTORICAL_ARCHIVE'
                ? 'bg-amber-600 text-slate-950 font-extrabold shadow-md'
                : 'text-amber-400 hover:text-amber-200'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Historical World Archive
          </button>

          <button
            onClick={() => setActiveMode('REGIONAL_LEWS')}
            className={`px-3 py-1.5 rounded-lg transition font-bold flex items-center gap-1.5 ${
              activeMode === 'REGIONAL_LEWS'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> NER 3D LEWS
          </button>
        </div>

        {/* If in Regional mode, show Sikkim/Meghalaya switcher */}
        {activeMode === 'REGIONAL_LEWS' && (
          <div className="hidden xl:flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedRegion('SIKKIM')}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                selectedRegion === 'SIKKIM' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sikkim (NH-10)
            </button>
            <button
              onClick={() => setSelectedRegion('MEGHALAYA')}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                selectedRegion === 'MEGHALAYA' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Meghalaya
            </button>
          </div>
        )}

        {/* Global 500m Alarm Test Button */}
        <button
          onClick={onTest500mAlert}
          className="bg-red-600/90 hover:bg-red-500 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs transition shadow-lg pulse-red border border-red-500/50 flex items-center gap-1.5"
          title="Test hyper-local 500m audio buzzer and evacuation screen"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          <span>🚨 Test 500m Buzzer</span>
        </button>

        {/* Live Before & After Satellite Imagery Studio Button */}
        <button
          onClick={onOpenSatelliteStudio}
          className="bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 font-extrabold px-3 py-1.5 rounded-lg text-xs transition shadow-md flex items-center gap-1.5"
          title="View Before & After Live Satellite Imagery for Earth's Landmark Disasters"
        >
          <Satellite className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden lg:inline">🛰️ Before & After Satellite Studio</span>
          <span className="lg:hidden">🛰️ Sat Images</span>
        </button>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReportModal}
            className="hidden sm:flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-sm"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Field Report</span>
          </button>

          <button
            onClick={onTogglePwaView}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
              isPwaViewOpen
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Offline PWA</span>
          </button>

          {/* WebSocket Status */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-mono ${
              wsConnected
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-400'
            }`}
          >
            {wsConnected ? <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">{wsConnected ? 'LIVE' : 'OFFLINE'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
