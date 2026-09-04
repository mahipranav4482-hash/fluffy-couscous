import React, { useState } from 'react';
import { Camera, MapPin, Send, CheckCircle2 } from 'lucide-react';

interface CrowdsourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (report: any) => Promise<void>;
}

export const CrowdsourceModal: React.FC<CrowdsourceModalProps> = ({
  isOpen,
  onClose,
  onSubmitReport,
}) => {
  const [hazardType, setHazardType] = useState('Road Cutting Mudslip');
  const [severity, setSeverity] = useState('MODERATE');
  const [roadBlocked, setRoadBlocked] = useState(true);
  const [highway, setHighway] = useState('NH-10');
  const [description, setDescription] = useState('');
  const [reporterRole, setReporterRole] = useState('Citizen / Local Commuter');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitReport({
        latitude: 27.135,
        longitude: 88.498,
        hazardType,
        severity,
        roadBlocked,
        highway,
        description: description || 'Visual observation of active slope movement reported from field.',
        reporterRole,
        photoBase64: 'mock_webp_image_payload',
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-5 text-xs text-slate-200 relative z-[100000]"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-amber-400" /> Crowdsource Ground Incident Report
            </h2>
            <p className="text-[11px] text-slate-400">
              Offline-capable field reporter for Gram Panchayats, BRO staff, and citizens.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            ✕
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Report Successfully Synced</h3>
            <p className="text-slate-400">Transmitted to Sikkim District Disaster Control Room (DDMA).</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Hazard Classification:
              </label>
              <select
                value={hazardType}
                onChange={(e) => setHazardType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="Road Cutting Mudslip">Road Cutting Mudslip / Debris Slip</option>
                <option value="Tension Cracks on Slope">Tension Cracks on Hillside / Road Edge</option>
                <option value="Rockfall & Boulder Tumbling">Rockfall & Boulder Tumbling</option>
                <option value="River Turbidity Surge">Sudden River Damming / Muddy Surge</option>
                <option value="Retaining Wall Bulge">Retaining Wall Bulge / Collapse</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Severity Level:
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                >
                  <option value="LOW">Low (Minor debris)</option>
                  <option value="MODERATE">Moderate (One lane affected)</option>
                  <option value="HIGH">High (Full road cutoff)</option>
                  <option value="CRITICAL">Critical (Settlement threatened)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Corridor / Road:
                </label>
                <input
                  type="text"
                  value={highway}
                  onChange={(e) => setHighway(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                  placeholder="e.g. NH-10 Mile 29"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <input
                type="checkbox"
                id="roadBlock"
                checked={roadBlocked}
                onChange={(e) => setRoadBlocked(e.target.checked)}
                className="rounded accent-red-600"
              />
              <label htmlFor="roadBlock" className="font-semibold text-slate-200 cursor-pointer">
                Road Traffic Blocked (Requires BRO machinery dispatch)
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Visual Description / Observations:
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Observed continuous sliding mud and falling stones along 29th mile road cut..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
              />
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> GPS Tag: 27.135°N, 88.498°E
              </span>
              <span className="text-emerald-400 font-bold">Accuracy: ±4.2m</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-amber-600 hover:bg-amber-500 font-bold text-slate-950 py-2.5 rounded-lg transition flex items-center justify-center gap-2 text-xs shadow-lg"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Syncing with Disaster Network...' : 'Submit Real-Time Report'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
