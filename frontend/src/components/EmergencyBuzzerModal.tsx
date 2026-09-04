import React, { useEffect, useState } from 'react';
import { ProximityEvaluationResult } from '../types.js';
import { startEmergencyBuzzer, stopEmergencyBuzzer, speakEmergencyBroadcast } from '../utils/audioBuzzer.js';
import { Volume2, VolumeX, ShieldAlert, Navigation, AlertOctagon, Compass } from 'lucide-react';

interface EmergencyBuzzerModalProps {
  proximityResult: ProximityEvaluationResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyBuzzerModal: React.FC<EmergencyBuzzerModalProps> = ({
  proximityResult,
  isOpen,
  onClose,
}) => {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (isOpen && proximityResult?.triggerBuzzer) {
      if (!isMuted) {
        startEmergencyBuzzer(0.8);
      }
      speakEmergencyBroadcast(proximityResult.voiceAlertText);
    } else {
      stopEmergencyBuzzer();
    }

    return () => {
      stopEmergencyBuzzer();
    };
  }, [isOpen, proximityResult, isMuted]);

  if (!isOpen || !proximityResult || !proximityResult.closestDisaster) return null;

  const disaster = proximityResult.closestDisaster;
  const distance = Math.round(proximityResult.distanceToEpicenterMeters);

  const toggleMute = () => {
    if (isMuted) {
      startEmergencyBuzzer(0.8);
      setIsMuted(false);
    } else {
      stopEmergencyBuzzer();
      setIsMuted(true);
    }
  };

  const handleDismiss = () => {
    stopEmergencyBuzzer();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100001] bg-red-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-pulse">
      {/* Heavy Warning Strobe Container */}
      <div className="bg-slate-950 border-4 border-red-500 rounded-3xl shadow-[0_0_80px_rgba(239,68,68,0.8)] w-full max-w-xl overflow-hidden text-slate-100 flex flex-col select-none">
        {/* Urgent Warning Header Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-4 text-center text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-7 h-7 text-white animate-bounce" />
            <div className="text-left">
              <h1 className="text-lg font-black tracking-wider uppercase font-mono">
                500M PROXIMITY BUZZER TRIGGERED
              </h1>
              <p className="text-[11px] font-bold text-red-100">
                IMMINENT CATASTROPHIC HAZARD NEAR YOUR LOCATION
              </p>
            </div>
          </div>
          <button
            onClick={toggleMute}
            className="p-2 rounded-xl bg-black/30 hover:bg-black/50 text-white transition flex items-center gap-1 text-xs font-mono"
            title={isMuted ? 'Unmute siren' : 'Mute siren'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-amber-300" /> : <Volume2 className="w-5 h-5 text-white animate-pulse" />}
            <span>{isMuted ? 'MUTED' : 'SIREN'}</span>
          </button>
        </div>

        {/* Modal Core Body */}
        <div className="p-6 space-y-4">
          {/* Distance Meter Callout */}
          <div className="bg-red-950/50 border-2 border-red-600/60 rounded-2xl p-4 text-center">
            <span className="text-xs uppercase font-mono font-bold tracking-widest text-red-400">
              DISTANCE TO DISASTER IMPACT ZONE
            </span>
            <div className="text-5xl font-black font-mono text-white tracking-tight mt-1 animate-pulse">
              {distance} <span className="text-2xl text-red-400">METERS</span>
            </div>
            <div className="mt-1 text-xs font-bold text-red-300">
              Threshold: ≤ 500m (Critical Life-Safety Margin Breached)
            </div>
          </div>

          {/* Disaster Dossier Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                {disaster.type.replace('_', ' ')} • {disaster.country} ({disaster.state_province})
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-600 text-white font-bold">
                {disaster.severity}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">{disaster.name}</h2>
            <p className="text-xs text-slate-300 leading-relaxed">{disaster.description}</p>
          </div>

          {/* Life-Saving Evacuation Directives & Bearing */}
          <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
              <span className="flex items-center gap-1.5 uppercase font-mono">
                <Navigation className="w-4 h-4 text-emerald-400" /> Immediate Escape Directive
              </span>
              <span className="font-mono bg-emerald-900 px-2 py-0.5 rounded text-emerald-200">
                Heading: {proximityResult.safeBearingCardinal} ({proximityResult.safeEvacuationBearingDegrees}°)
              </span>
            </div>
            <p className="text-xs text-emerald-100 font-medium leading-relaxed">
              {disaster.emergencyDirectives}
            </p>
            <div className="text-[11px] text-emerald-400/90 font-mono pt-1 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> Move directly away from epicenter bearing{' '}
              <strong>{proximityResult.safeBearingCardinal}</strong> toward elevated open terrain.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleDismiss}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-extrabold py-3 rounded-xl transition text-xs tracking-wider uppercase shadow-xl"
            >
              Acknowledge & Silence Siren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
