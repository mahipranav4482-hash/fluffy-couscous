import React, { useState } from 'react';
import { SimulatedZoneState } from '../types.js';
import { Bell, ShieldAlert, MessageSquare, Code, CheckCircle, Volume2, Copy } from 'lucide-react';

interface AlertCenterProps {
  zones: SimulatedZoneState[];
  isOpen: boolean;
  onClose: () => void;
}

export const AlertCenter: React.FC<AlertCenterProps> = ({ zones, isOpen, onClose }) => {
  const [selectedZoneForCap, setSelectedZoneForCap] = useState<SimulatedZoneState | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const criticalZones = zones.filter(
    (z) => z.evalResult.alertLevel === 'RED' || z.evalResult.alertLevel === 'ORANGE'
  );

  const activeCapZone = selectedZoneForCap || criticalZones[0] || zones[0];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-xs relative z-[100000]"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Emergency Alert & Dispatch Hub
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                  C-DOT CAP v1.2 / CBEA Standard
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Multi-channel broadcast to District Disaster Authorities, State Police, BRO, and Citizens.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Left: Active Alerts Feed */}
          <div className="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] font-mono">
              Active Trigger Alerts ({criticalZones.length})
            </span>

            {criticalZones.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                No active Red or Orange triggers. All monitored corridors are operating at baseline safety.
              </div>
            ) : (
              criticalZones.map((z) => (
                <div
                  key={z.zoneId}
                  onClick={() => setSelectedZoneForCap(z)}
                  className={`p-3 rounded-xl border transition cursor-pointer ${
                    activeCapZone?.zoneId === z.zoneId
                      ? 'bg-slate-800/80 border-slate-600 ring-1 ring-white/20'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-200">{z.zoneId}</span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        z.evalResult.alertLevel === 'RED'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-orange-950 text-orange-400 border border-orange-800'
                      }`}
                    >
                      {z.evalResult.alertLevel} ALERT
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-200 mt-1">{z.name}</h3>
                  <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-2">
                    {z.evalResult.actionRequired}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-slate-800/80 pt-1.5">
                    <span>24h: {z.rainfall24h}mm</span>
                    <span>FoS: {z.currentFoS.factorOfSafety}</span>
                    <span>DTI: {z.evalResult.dynamicTriggerIndex}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right: CAP XML & Compact Reverse-SMS Payload Preview */}
          <div className="p-4 space-y-3 flex flex-col bg-slate-950/40">
            {activeCapZone ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] font-mono flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-cyan-400" /> C-DOT CAP XML Payload ({activeCapZone.zoneId})
                  </span>
                  <button
                    onClick={() => copyToClipboard(activeCapZone.capXml)}
                    className="flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300 transition"
                  >
                    <Copy className="w-3 h-3" />
                    {copied ? 'Copied!' : 'Copy XML'}
                  </button>
                </div>

                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[10px] text-emerald-400 overflow-x-auto max-h-48 whitespace-pre-wrap leading-relaxed">
                  {activeCapZone.capXml}
                </pre>

                {/* Compact Reverse-SMS for Low Bandwidth 2G Fallback */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] font-mono flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" /> 2G/EDGE Reverse-SMS Fallback Payload
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {activeCapZone.compactSms.length} chars (Limit: 160)
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] text-amber-300 flex items-center justify-between">
                    <code>{activeCapZone.compactSms}</code>
                    <button
                      onClick={() => copyToClipboard(activeCapZone.compactSms)}
                      className="ml-2 text-slate-400 hover:text-white"
                      title="Copy SMS"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Format: <code>LEWS:[LVL]:[ZONE]:[HRS]:[LAT,LON]:[DTI]:[CHECKSUM]</code>. Transmitted via Indian telecom DLT SMS gateway to remote tribal village handsets when 4G/fiber lines collapse.
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
