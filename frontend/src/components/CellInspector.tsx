import React from 'react';
import { SimulatedZoneState } from '../types.js';
import { ShieldAlert, Mountain, Droplets, Activity, Download, FileCode, CheckCircle, AlertTriangle } from 'lucide-react';

interface CellInspectorProps {
  zone: SimulatedZoneState | null;
  onClose: () => void;
}

export const CellInspector: React.FC<CellInspectorProps> = ({ zone, onClose }) => {
  if (!zone) {
    return (
      <aside className="w-80 bg-slate-900 border-l border-slate-800 p-5 flex flex-col justify-center items-center text-center text-slate-500 text-xs">
        <Mountain className="w-12 h-12 stroke-1 text-slate-700 mb-3" />
        <p className="font-semibold text-slate-400">Micro-Zonation Inspector</p>
        <p className="mt-1 text-slate-500">Click any sector polygon on the map to inspect geotechnical parameters and real-time failure thresholds.</p>
      </aside>
    );
  }

  const fos = zone.currentFoS.factorOfSafety;
  const isFailing = fos < 1.15;
  const alertColor =
    zone.evalResult.alertLevel === 'RED'
      ? 'text-red-400 border-red-500 bg-red-950/40'
      : zone.evalResult.alertLevel === 'ORANGE'
      ? 'text-orange-400 border-orange-500 bg-orange-950/40'
      : zone.evalResult.alertLevel === 'YELLOW'
      ? 'text-amber-400 border-amber-500 bg-amber-950/40'
      : 'text-emerald-400 border-emerald-500 bg-emerald-950/40';

  const downloadCapXml = () => {
    const blob = new Blob([zone.capXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CAP_ALERT_${zone.zoneId}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <aside className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-y-auto text-xs z-20 shrink-0 select-none shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-start justify-between bg-slate-950/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
              {zone.zoneId}
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${alertColor}`}>
              {zone.evalResult.alertLevel} ALERT
            </span>
          </div>
          <h2 className="text-sm font-bold text-slate-100 mt-1.5">{zone.name}</h2>
          <p className="text-[11px] text-slate-400">{zone.district}, {zone.state}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Factor of Safety (FoS) Main Gauge */}
        <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 text-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
            1D Infinite Slope Factor of Safety (FoS)
          </span>
          <div className="flex items-baseline justify-center gap-1.5 mt-2">
            <span className={`text-4xl font-extrabold font-mono ${isFailing ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
              {fos.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ 1.00 crit</span>
          </div>
          <div className="mt-2 text-[11px] font-semibold">
            Status:{' '}
            <span className={isFailing ? 'text-red-400 font-bold' : 'text-emerald-400'}>
              {zone.currentFoS.failureRiskCategory.replace('_', ' ')}
            </span>
          </div>
          {/* FoS Progress Visualizer */}
          <div className="w-full bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 ${
                fos < 1.0 ? 'bg-red-600' : fos < 1.25 ? 'bg-orange-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (fos / 2.0) * 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
            <span>0.0 (Failure)</span>
            <span>1.0 (Critical)</span>
            <span>2.0+ (Stable)</span>
          </div>
        </div>

        {/* Real-time Hydrometeorological Telemetry */}
        <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 space-y-2.5">
          <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase font-mono">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Hydrological Telemetry
          </span>

          {/* Rainfall Accumulations */}
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">1h Intensity:</span>
              <span className="font-bold text-cyan-300">{zone.rainfall1h} mm/h</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">24h Cumulative:</span>
              <span className="font-bold text-white">{zone.rainfall24h} mm</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">72h Cumulative:</span>
              <span className="text-slate-300">{zone.rainfall72h} mm</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">15-Day Antecedent (ARI):</span>
              <span className="text-slate-300">{zone.antecedentRainfall} mm</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Soil Moisture Saturation:</span>
              <span className={`font-bold ${zone.soilSaturationPct > 85 ? 'text-red-400' : 'text-emerald-400'}`}>
                {zone.soilSaturationPct}%
              </span>
            </div>
          </div>
        </div>

        {/* Geomorphic & Structural Stress */}
        <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 space-y-2 font-mono text-[11px]">
          <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase font-sans">
            <Mountain className="w-3.5 h-3.5 text-amber-400" /> Geomorphic Stress
          </span>
          <div className="flex justify-between">
            <span className="text-slate-400">Pore Pressure Ratio (Ru):</span>
            <span className="text-white font-bold">{zone.porePressureRatioRu}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">InSAR Surface Def.:</span>
            <span className="text-rose-400 font-bold">{zone.insarVelocityMmPerWeek} mm/wk</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Driving Shear Stress:</span>
            <span className="text-slate-300">{zone.currentFoS.drivingShearStressKPa} kPa</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Resisting Strength:</span>
            <span className="text-slate-300">{zone.currentFoS.resistingShearStressKPa} kPa</span>
          </div>
        </div>

        {/* Action Directives */}
        <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 space-y-1.5">
          <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase font-mono">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Action Required
          </span>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            {zone.evalResult.actionRequired}
          </p>
        </div>

        {/* Export CAP Alert XML */}
        <div className="space-y-2 pt-1">
          <button
            onClick={downloadCapXml}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition text-xs shadow-md"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            Download OASIS CAP v1.2 XML
          </button>
        </div>
      </div>
    </aside>
  );
};
