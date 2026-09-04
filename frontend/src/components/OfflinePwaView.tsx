import React, { useState } from 'react';
import { Smartphone, WifiOff, MapPin, Compass, Shield, Navigation, AlertTriangle, MessageSquare, Check } from 'lucide-react';
import { SimulatedZoneState } from '../types.js';

interface OfflinePwaViewProps {
  isOpen: boolean;
  onClose: () => void;
  activeZone: SimulatedZoneState | null;
}

export const OfflinePwaView: React.FC<OfflinePwaViewProps> = ({ isOpen, onClose, activeZone }) => {
  const [sosSent, setSosSent] = useState(false);

  if (!isOpen) return null;

  const alertLevel = activeZone ? activeZone.evalResult.alertLevel : 'RED';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
    >
      {/* Mobile Shell Wrapper */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[360px] h-[680px] bg-slate-950 border-[6px] border-slate-800 rounded-[42px] shadow-2xl flex flex-col overflow-hidden text-xs text-slate-100 select-none relative z-[100000]"
      >
        {/* Phone Notch & Status Bar */}
        <div className="h-7 bg-slate-950 flex items-center justify-between px-6 pt-1 text-[10px] font-mono text-slate-400">
          <span>06:30</span>
          <div className="w-20 h-3.5 bg-slate-900 rounded-full mx-auto"></div>
          <div className="flex items-center gap-1 text-amber-400">
            <WifiOff className="w-3 h-3" />
            <span className="text-[9px]">2G/OFF</span>
          </div>
        </div>

        {/* Top App Header */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-100 text-xs">Global Disaster Managing Web (Offline)</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs">
            ✕
          </button>
        </div>

        {/* Offline Badge */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 py-1 flex items-center justify-between text-[10px] text-amber-400 font-mono">
          <span className="flex items-center gap-1">
            <WifiOff className="w-3 h-3" /> Offline Storage Active (SQLite/IndexedDB)
          </span>
          <span className="text-[9px] bg-amber-950 px-1 rounded">Sync Queue: 0</span>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {/* Main Risk Status Card */}
          <div
            className={`p-4 rounded-2xl border text-center shadow-lg transition ${
              alertLevel === 'RED'
                ? 'bg-red-950/70 border-red-500 pulse-red'
                : alertLevel === 'ORANGE'
                ? 'bg-orange-950/70 border-orange-500'
                : alertLevel === 'YELLOW'
                ? 'bg-amber-950/70 border-amber-500'
                : 'bg-emerald-950/70 border-emerald-500'
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300">
              Current Zone Status
            </span>
            <h2 className="text-2xl font-black mt-1 tracking-tight text-white">
              {alertLevel} ALERT
            </h2>
            <p className="text-[11px] font-semibold mt-1 opacity-90">
              {alertLevel === 'RED'
                ? 'CRITICAL: High Slope Failure Imminent'
                : alertLevel === 'ORANGE'
                ? 'WARNING: Heavy Rain & Saturated Ground'
                : 'NORMAL: Regular Baseline Conditions'}
            </p>
            <div className="mt-2 text-[10px] font-mono text-slate-400 bg-black/40 py-1 px-2 rounded-lg inline-block">
              Location: NH-10 (29th Mile, Pakyong)
            </div>
          </div>

          {/* Offline Safe Evacuation Route Finder */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1 text-[11px]">
                <Navigation className="w-3.5 h-3.5 text-emerald-400" /> Offline Safe Evacuation Route
              </span>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 px-1 rounded">
                Dijkstra Solved
              </span>
            </div>

            <div className="bg-slate-950 rounded-lg p-2.5 space-y-1.5 text-[10px] font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-3 h-3 text-red-400" />
                <span>Current: 29th Mile Chasm (UNSAFE)</span>
              </div>
              <div className="border-l border-dashed border-emerald-500/60 ml-1.5 pl-3 py-0.5 text-emerald-400 text-[9px]">
                Proceed 850m North-East via Ridge Footpath (Bypassing Debris Gully)
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Shield className="w-3 h-3" />
                <span>Shelter: Pakyong Govt Senior School</span>
              </div>
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 pt-1">
              <span>Distance: <strong>850 meters</strong></span>
              <span>Est. Walking: <strong>14 mins</strong></span>
            </div>
          </div>

          {/* Fallback Reverse-SMS SOS Dispatch */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 flex items-center gap-1 text-[11px]">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> Reverse-SMS SOS Trigger
              </span>
              <span className="text-[9px] text-slate-500 font-mono">Zero Internet Needed</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Sends encrypted 43-character location ping to District Collector & SDRF via GSM cellular signaling.
            </p>

            <button
              onClick={() => {
                setSosSent(true);
                setTimeout(() => setSosSent(false), 3000);
              }}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-1.5 text-[11px] shadow-lg"
            >
              {sosSent ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  SMS Broadcast Dispatched!
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Transmit Emergency SMS Beacon
                </>
              )}
            </button>
          </div>
        </div>

        {/* Phone Bottom Home Bar */}
        <div className="h-4 bg-slate-950 flex items-center justify-center pb-1">
          <div className="w-32 h-1 bg-slate-800 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
