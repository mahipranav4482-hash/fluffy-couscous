import React, { useState } from 'react';
import { BEFORE_AFTER_DATA, BeforeAfterImageryRecord } from '../data/beforeAfterData.js';
import { BeforeAfterViewer } from './BeforeAfterViewer.js';
import {
  X,
  Satellite,
  Activity,
  Waves,
  Mountain,
  Flame,
  Droplets,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Compass,
} from 'lucide-react';

interface BeforeAfterGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDisasterId?: string;
}

export const BeforeAfterGalleryModal: React.FC<BeforeAfterGalleryModalProps> = ({
  isOpen,
  onClose,
  initialDisasterId,
}) => {
  if (!isOpen) return null;

  const [selectedRecordId, setSelectedRecordId] = useState<string>(() => {
    if (initialDisasterId) {
      const match = BEFORE_AFTER_DATA.find((r) => r.disasterId === initialDisasterId);
      if (match) return match.id;
    }
    return BEFORE_AFTER_DATA[0].id;
  });

  const currentRecord =
    BEFORE_AFTER_DATA.find((r) => r.id === selectedRecordId) || BEFORE_AFTER_DATA[0];

  const getHazardIcon = (type: string) => {
    switch (type) {
      case 'TSUNAMI':
      case 'FLOOD':
        return <Waves className="w-3.5 h-3.5 text-cyan-400" />;
      case 'CLOUDBURST':
        return <Droplets className="w-3.5 h-3.5 text-blue-400" />;
      case 'LANDSLIDE':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'VOLCANO':
        return <Mountain className="w-3.5 h-3.5 text-red-400" />;
      case 'EARTHQUAKE':
        return <Activity className="w-3.5 h-3.5 text-yellow-400" />;
      case 'WILDFIRE':
        return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      default:
        return <Satellite className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 md:p-6 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-950 border-2 border-slate-700 w-full max-w-5xl max-h-[94vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 relative z-[100000]"
      >
        {/* Top Modal Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-700/80 text-cyan-400 shadow-inner">
              <Satellite className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-wide">
                  Live Before & After Satellite Imagery Studio
                </h2>
                <span className="bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-500/30">
                  Space-Borne Change Detection
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Earth's 8 Landmark Disasters: Pre-Event Landscape vs Post-Cataclysm Ground Truth
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disaster Quick-Selector Chips */}
        <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/80 overflow-x-auto flex items-center gap-2 text-xs scrollbar-none">
          {BEFORE_AFTER_DATA.map((record) => {
            const isSelected = record.id === selectedRecordId;
            return (
              <button
                key={record.id}
                onClick={() => setSelectedRecordId(record.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold flex items-center gap-1.5 transition text-xs shrink-0 ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {getHazardIcon(record.hazardType)}
                <span>{record.disasterName.split('(')[0]}</span>
                <span className="text-[10px] font-mono opacity-80">({record.year})</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Viewer Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          <BeforeAfterViewer record={currentRecord} />

          {/* Educational Change Detection Methodology Banner */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
            <span className="font-mono text-amber-400 font-bold uppercase text-[11px] block">
              🛰️ How Satellite Disaster Change Detection Works:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-300">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-emerald-400 block mb-0.5">1. Optical Spectral Difference (NDVI/NDWI)</strong>
                Compares near-infrared reflectivity before and after to quantify destroyed vegetation, scoured land, and new standing water.
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-cyan-400 block mb-0.5">2. SAR Coherence Loss (Radar)</strong>
                Synthetic Aperture Radar penetrates cloud cover and compares microwave bounce-back; destroyed buildings and landslides show sharp coherence loss.
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-rose-400 block mb-0.5">3. Thermal Hotspots & InSAR</strong>
                Pinpoints active wildfire fronts and volcanic lava extrusion in real time; InSAR measures millimeter ground fault slip.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
