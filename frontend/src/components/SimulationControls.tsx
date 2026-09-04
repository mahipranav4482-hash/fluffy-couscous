import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CloudLightning, Sun, CloudRain, Clock } from 'lucide-react';
import { SimulationState } from '../types.js';

interface SimulationControlsProps {
  simState: SimulationState | null;
  onUpdateSimulation: (scenario: 'NORMAL' | 'MONSOON_SURGE' | 'CLOUDBURST', hour: number) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  simState,
  onUpdateSimulation,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const currentHour = simState?.hour ?? 0;
  const currentScenario = simState?.scenario ?? 'NORMAL';

  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        const nextHour = (currentHour + 1) % 25;
        onUpdateSimulation(currentScenario, nextHour);
        if (nextHour === 24) {
          setIsPlaying(false);
        }
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentHour, currentScenario, onUpdateSimulation]);

  return (
    <div className="h-14 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-4 z-20 shrink-0 select-none">
      {/* Scenario Selector */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
          Scenario:
        </span>
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => onUpdateSimulation('NORMAL', currentHour)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium ${
              currentScenario === 'NORMAL'
                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5" /> Normal
          </button>
          <button
            onClick={() => onUpdateSimulation('MONSOON_SURGE', currentHour)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium ${
              currentScenario === 'MONSOON_SURGE'
                ? 'bg-amber-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" /> Monsoon Surge
          </button>
          <button
            onClick={() => onUpdateSimulation('CLOUDBURST', currentHour)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium ${
              currentScenario === 'CLOUDBURST'
                ? 'bg-red-600 text-white font-bold shadow-sm animate-pulse'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudLightning className="w-3.5 h-3.5 text-yellow-300" /> Cloudburst (NH-10)
          </button>
        </div>
      </div>

      {/* 24-Hour Timeline Scrubbing Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl mx-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition border border-slate-700 shadow-sm"
          title={isPlaying ? 'Pause simulation' : 'Play simulation'}
        >
          {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
        </button>

        <button
          onClick={() => {
            setIsPlaying(false);
            onUpdateSimulation(currentScenario, 0);
          }}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition border border-slate-700"
          title="Reset to 00:00"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="flex-1 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="range"
            min="0"
            max="24"
            step="1"
            value={currentHour}
            onChange={(e) => {
              setIsPlaying(false);
              onUpdateSimulation(currentScenario, Number(e.target.value));
            }}
            className="w-full accent-red-600 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        <span className="font-mono text-xs font-bold text-slate-200 min-w-[70px] text-right bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          T+{String(currentHour).padStart(2, '0')}:00 hrs
        </span>
      </div>
    </div>
  );
};
