import React, { useState } from 'react';
import { GlobalDisaster } from '../types.js';
import { BEFORE_AFTER_DATA, getBeforeAfterRecord } from '../data/beforeAfterData.js';
import { getDisasterCodeInfo } from '../utils/disasterCodes.js';
import { BeforeAfterViewer } from './BeforeAfterViewer.js';
import {
  X,
  AlertTriangle,
  Clock,
  Droplets,
  Activity,
  Wind,
  Waves,
  Flame,
  Mountain,
  MapPin,
  Compass,
  Volume2,
  ShieldCheck,
  Calendar,
  Timer,
  CheckCircle2,
  Sun,
  Users,
  DollarSign,
  Landmark,
  Satellite,
  PawPrint,
  Trees,
  TreePine,
  Building2,
  Hourglass,
  Skull,
  HeartHandshake,
} from 'lucide-react';

interface DisasterDetailModalProps {
  disaster: GlobalDisaster | null;
  isOpen: boolean;
  onClose: () => void;
  onTest500mAlert: (disaster: GlobalDisaster) => void;
  onOpenSatelliteGallery?: (disasterId?: string) => void;
}

export const DisasterDetailModal: React.FC<DisasterDetailModalProps> = ({
  disaster,
  isOpen,
  onClose,
  onTest500mAlert,
  onOpenSatelliteGallery,
}) => {
  const [lossAuditTab, setLossAuditTab] = useState<'OVERVIEW' | 'HUMAN' | 'ANIMALS' | 'PLANTS' | 'NATURAL_RESOURCES' | 'BUILT_ECONOMY'>('OVERVIEW');

  if (!isOpen || !disaster) return null;

  const isEarthquake = disaster.type === 'EARTHQUAKE';
  const isFloodOrCyclone = disaster.type === 'FLOOD' || disaster.type === 'CYCLONE_HURRICANE' || disaster.type === 'CLOUDBURST';

  // Format Status Badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE_NOW':
        return (
          <span className="px-3 py-1 rounded-full bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-900/50 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            HAPPENING RIGHT NOW (ACTIVE DANGER)
          </span>
        );
      case 'UPCOMING_PREDICTED':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-900/40">
            <Clock className="w-3.5 h-3.5" />
            GOING TO HAPPEN (UPCOMING / PREDICTED)
          </span>
        );
      case 'PAST_HISTORICAL':
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
            HISTORICAL RECORD (TILL DATE)
          </span>
        );
    }
  };

  const getHazardIcon = (type: string) => {
    switch (type) {
      case 'EARTHQUAKE':
        return <Activity className="w-6 h-6 text-amber-400" />;
      case 'CYCLONE_HURRICANE':
        return <Wind className="w-6 h-6 text-cyan-400" />;
      case 'FLOOD':
      case 'TSUNAMI':
        return <Waves className="w-6 h-6 text-blue-400" />;
      case 'WILDFIRE':
        return <Flame className="w-6 h-6 text-orange-400" />;
      case 'VOLCANO':
        return <Mountain className="w-6 h-6 text-red-400" />;
      case 'COSMIC_ATMOSPHERIC':
        return <Sun className="w-6 h-6 text-yellow-400" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-rose-400" />;
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-950 border-2 border-slate-700 w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 select-none relative z-[100000]"
      >
        {/* Top Header Banner */}
        <div className="p-5 border-b border-slate-800 bg-slate-900 flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-slate-800 border border-slate-700 shadow-inner">
              {getHazardIcon(disaster.type)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {getStatusBadge(disaster.status)}
                {/* Simple form disaster code badge: [LS] Landslide, [EQ] Earthquake */}
                <span
                  className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-full border ${
                    getDisasterCodeInfo(disaster.type).badgeBg
                  } ${getDisasterCodeInfo(disaster.type).badgeText} ${
                    getDisasterCodeInfo(disaster.type).badgeBorder
                  } shadow-sm flex items-center gap-1`}
                >
                  <span>[{getDisasterCodeInfo(disaster.type).code}]</span>
                  <span>{getDisasterCodeInfo(disaster.type).name.toUpperCase()}</span>
                </span>
                {disaster.year && (
                  <span className="text-xs font-mono font-extrabold text-amber-300 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {disaster.year} AD
                  </span>
                )}
                <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {disaster.id}
                </span>
              </div>
              <h1 className="text-xl font-black text-white leading-tight">{disaster.name}</h1>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-slate-300">
                  {disaster.state_province}, {disaster.country} {disaster.continent ? `(${disaster.continent})` : ''}
                </span>
                <span>•</span>
                <span>Impact Zone: {Math.round(disaster.radius_meters / 1000)} km radius</span>
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

        {/* Scrollable Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Main Attribute & Abnormality Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Main Primary Attribute Card (Magnitude for Earthquakes, Wind Speed for Cyclones, etc.) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                {disaster.primary_attribute_label || 'Primary Disaster Strength'}
              </span>
              <div className="text-2xl font-black text-white mt-2 leading-tight">
                {isEarthquake && disaster.magnitude ? (
                  <span className="text-amber-400">{disaster.magnitude}</span>
                ) : (
                  disaster.primary_attribute_value || 'Extreme Category Event'
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-medium">
                {isEarthquake
                  ? 'Major tectonic fault rupture causing severe ground displacement.'
                  : `Peak observed metric recorded by regional weather sensors.`}
              </p>
            </div>

            {/* Rainfall Abnormality in MM Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-cyan-400 uppercase font-bold tracking-wider flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5" /> Rainfall Abnormality in MM
                </span>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800">
                  {disaster.rainfall_abnormality_mm && disaster.rainfall_abnormality_mm > 0
                    ? `+${disaster.rainfall_abnormality_mm} mm`
                    : `${disaster.rainfall_abnormality_mm ?? 0} mm`}
                </span>
              </div>

              <div className="mt-2 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-[11px]">Normal Expected Rain:</span>
                  <span className="font-bold">{disaster.rainfall_normal_mm ?? 30} mm</span>
                </div>
                <div className="flex justify-between items-center text-white">
                  <span className="text-[11px]">Actual / Forecasted Rain:</span>
                  <span className="font-extrabold text-cyan-300 text-sm">
                    {disaster.rainfall_actual_mm ?? 180} mm
                  </span>
                </div>
              </div>

              {/* Visual Abnormality Progress Bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3 flex">
                <div
                  className="bg-cyan-500 h-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      ((disaster.rainfall_actual_mm ?? 100) / 300) * 100
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {disaster.rainfall_abnormality_mm && disaster.rainfall_abnormality_mm > 100
                  ? 'Extreme cloudburst abnormality (> 300% of seasonal baseline).'
                  : 'Precipitation within monitored threshold margins.'}
              </p>
            </div>
          </div>

          {/* Timeline & Duration: Started, How Much Time It Happened, Ended */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-amber-400" /> Disaster Timeline & Duration Breakdown
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">⏱️ WHEN IT STARTED</span>
                <span className="text-white font-bold mt-1 block">
                  {disaster.started_at || 'Recently Detected'}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">⏳ HOW MUCH TIME IT HAPPENED</span>
                <span className="text-amber-400 font-bold mt-1 block">
                  {disaster.duration_text || 'Active Ongoing'}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">🏁 WHEN IT ENDED / EXPECTED END</span>
                <span className="text-emerald-400 font-bold mt-1 block">
                  {disaster.ended_at || 'Under Real-Time Observation'}
                </span>
              </div>
            </div>
          </div>

          {/* COMPREHENSIVE DISASTER RESOURCE & LIFE LOSS AUDIT */}
          {(() => {
            const losses = disaster.resource_losses;
            return (
              <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-4 space-y-3.5 shadow-xl">
                {/* Audit Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-600 to-amber-600 flex items-center justify-center shadow-md shadow-rose-950/50">
                      <Skull className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="font-black text-white text-xs font-mono uppercase tracking-wider block">
                        Comprehensive Resource & Life Loss Audit
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Documented casualties across Human Life, Animals, Plants, Natural Resources & Built Assets
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {losses?.overallEcologicalSeverity && (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black border ${
                        losses.overallEcologicalSeverity === 'CATASTROPHIC'
                          ? 'bg-rose-950 text-rose-400 border-rose-700/80 animate-pulse'
                          : losses.overallEcologicalSeverity === 'SEVERE'
                          ? 'bg-amber-950 text-amber-400 border-amber-700/80'
                          : 'bg-blue-950 text-blue-400 border-blue-700/80'
                      }`}>
                        {losses.overallEcologicalSeverity} SEVERITY
                      </span>
                    )}
                    {losses?.restorationTimelineYears && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-950 text-slate-300 border border-slate-800 flex items-center gap-1">
                        <Hourglass className="w-3 h-3 text-cyan-400" />
                        <span>Restoration: {losses.restorationTimelineYears}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Audit Category Switcher Tabs */}
                <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
                  <button
                    onClick={() => setLossAuditTab('OVERVIEW')}
                    className={`px-2.5 py-1 rounded-lg transition font-bold ${
                      lossAuditTab === 'OVERVIEW' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    OVERVIEW (ALL 5 SECTORS)
                  </button>
                  <button
                    onClick={() => setLossAuditTab('HUMAN')}
                    className={`px-2.5 py-1 rounded-lg transition font-bold flex items-center gap-1 ${
                      lossAuditTab === 'HUMAN' ? 'bg-rose-700 text-white shadow-sm' : 'text-rose-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-3 h-3" /> HUMAN LIFE
                  </button>
                  <button
                    onClick={() => setLossAuditTab('ANIMALS')}
                    className={`px-2.5 py-1 rounded-lg transition font-bold flex items-center gap-1 ${
                      lossAuditTab === 'ANIMALS' ? 'bg-amber-700 text-white shadow-sm' : 'text-amber-400 hover:text-white'
                    }`}
                  >
                    <PawPrint className="w-3 h-3" /> ANIMALS & WILDLIFE
                  </button>
                  <button
                    onClick={() => setLossAuditTab('PLANTS')}
                    className={`px-2.5 py-1 rounded-lg transition font-bold flex items-center gap-1 ${
                      lossAuditTab === 'PLANTS' ? 'bg-emerald-700 text-white shadow-sm' : 'text-emerald-400 hover:text-white'
                    }`}
                  >
                    <Trees className="w-3 h-3" /> PLANTS & CROPS
                  </button>
                  <button
                    onClick={() => setLossAuditTab('NATURAL_RESOURCES')}
                    className={`px-2.5 py-1 rounded-lg transition font-bold flex items-center gap-1 ${
                      lossAuditTab === 'NATURAL_RESOURCES' ? 'bg-cyan-700 text-white shadow-sm' : 'text-cyan-400 hover:text-white'
                    }`}
                  >
                    <Droplets className="w-3 h-3" /> NATURAL RESOURCES
                  </button>
                  <button
                    onClick={() => setLossAuditTab('BUILT_ECONOMY')}
                    className={`px-2.5 py-1 rounded-lg transition font-bold flex items-center gap-1 ${
                      lossAuditTab === 'BUILT_ECONOMY' ? 'bg-yellow-700 text-slate-950 font-black shadow-sm' : 'text-yellow-400 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-3 h-3" /> BUILT & ECONOMY
                  </button>
                </div>

                {/* TAB 1: OVERVIEW (ALL 5 AUDIT CARDS) */}
                {lossAuditTab === 'OVERVIEW' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {/* Card 1: Human Life */}
                    <div className="bg-slate-950/90 border border-rose-900/40 rounded-xl p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-rose-400 mb-1.5">
                          <span className="font-extrabold text-[11px] font-mono flex items-center gap-1">
                            <Skull className="w-3.5 h-3.5" /> 1. HUMAN LIFE
                          </span>
                          <span className="text-[10px] font-bold text-rose-500 uppercase">Fatalities</span>
                        </div>
                        <p className="text-white font-extrabold text-xs leading-snug">
                          {losses?.humanLife?.deathsConfirmed || disaster.casualties_estimate || 'Pending assessment'}
                        </p>
                        <div className="mt-2 text-[11px] text-slate-400 space-y-0.5">
                          <div>Displaced: <strong className="text-rose-300">{losses?.humanLife?.displacedHomeless || 'Mass displacement'}</strong></div>
                          <div>Injured: <span className="text-slate-300">{losses?.humanLife?.injuredToll || 'Extensive trauma'}</span></div>
                        </div>
                      </div>
                      <button
                        onClick={() => setLossAuditTab('HUMAN')}
                        className="mt-2 text-[10px] text-rose-400 hover:text-rose-300 font-bold text-left underline"
                      >
                        Deep Dive Human Audit →
                      </button>
                    </div>

                    {/* Card 2: Animals & Wildlife */}
                    <div className="bg-slate-950/90 border border-amber-900/40 rounded-xl p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-amber-400 mb-1.5">
                          <span className="font-extrabold text-[11px] font-mono flex items-center gap-1">
                            <PawPrint className="w-3.5 h-3.5" /> 2. ANIMALS & WILDLIFE
                          </span>
                          <span className="text-[10px] font-bold text-amber-500 uppercase">Fauna Toll</span>
                        </div>
                        <p className="text-white font-extrabold text-xs leading-snug">
                          {losses?.animalsAndWildlife?.livestockDeaths || 'Thousands of livestock and native wildlife lost'}
                        </p>
                        <div className="mt-2 text-[11px] text-slate-400 space-y-0.5">
                          <div>Wildlife: <span className="text-amber-300">{losses?.animalsAndWildlife?.wildlifeCasualties || 'Significant native loss'}</span></div>
                          <div>Habitat: <span className="text-slate-300">{losses?.animalsAndWildlife?.habitatDestroyedKm2 || 'Disrupted footprint'}</span></div>
                        </div>
                      </div>
                      <button
                        onClick={() => setLossAuditTab('ANIMALS')}
                        className="mt-2 text-[10px] text-amber-400 hover:text-amber-300 font-bold text-left underline"
                      >
                        Deep Dive Animal Audit →
                      </button>
                    </div>

                    {/* Card 3: Plants & Crops */}
                    <div className="bg-slate-950/90 border border-emerald-900/40 rounded-xl p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-emerald-400 mb-1.5">
                          <span className="font-extrabold text-[11px] font-mono flex items-center gap-1">
                            <Trees className="w-3.5 h-3.5" /> 3. PLANTS & FORESTS
                          </span>
                          <span className="text-[10px] font-bold text-emerald-500 uppercase">Flora Scoured</span>
                        </div>
                        <p className="text-white font-extrabold text-xs leading-snug">
                          {losses?.plantsAndVegetation?.forestLossHectares || 'Extensive forest canopy and vegetation loss'}
                        </p>
                        <div className="mt-2 text-[11px] text-slate-400 space-y-0.5">
                          <div>Crops Lost: <span className="text-emerald-300">{losses?.plantsAndVegetation?.cropsDestroyedAcres || 'Agricultural acreage ruined'}</span></div>
                          <div>Harvest Loss: <span className="text-slate-300">{losses?.plantsAndVegetation?.agriculturalLossValue || 'Critical food supply impact'}</span></div>
                        </div>
                      </div>
                      <button
                        onClick={() => setLossAuditTab('PLANTS')}
                        className="mt-2 text-[10px] text-emerald-400 hover:text-emerald-300 font-bold text-left underline"
                      >
                        Deep Dive Plant Audit →
                      </button>
                    </div>

                    {/* Card 4: Natural Resources */}
                    <div className="bg-slate-950/90 border border-cyan-900/40 rounded-xl p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-cyan-400 mb-1.5">
                          <span className="font-extrabold text-[11px] font-mono flex items-center gap-1">
                            <Droplets className="w-3.5 h-3.5" /> 4. NATURAL RESOURCES
                          </span>
                          <span className="text-[10px] font-bold text-cyan-500 uppercase">Ecology / Water</span>
                        </div>
                        <p className="text-white font-extrabold text-xs leading-snug">
                          {losses?.naturalResources?.freshwaterImpact || 'Freshwater and topsoil reserves destabilized'}
                        </p>
                        <div className="mt-2 text-[11px] text-slate-400 space-y-0.5">
                          <div>Soil Erosion: <span className="text-cyan-300">{losses?.naturalResources?.soilErosionTopsoilLoss || 'Topsoil scoured'}</span></div>
                          <div>Marine/Plume: <span className="text-slate-300">{losses?.naturalResources?.marineAndEcologicalLoss || 'Ecosystem shock'}</span></div>
                        </div>
                      </div>
                      <button
                        onClick={() => setLossAuditTab('NATURAL_RESOURCES')}
                        className="mt-2 text-[10px] text-cyan-400 hover:text-cyan-300 font-bold text-left underline"
                      >
                        Deep Dive Natural Resources →
                      </button>
                    </div>

                    {/* Card 5: Built & Economy */}
                    <div className="bg-slate-950/90 border border-yellow-900/40 rounded-xl p-3 flex flex-col justify-between col-span-1 md:col-span-2 lg:col-span-2">
                      <div>
                        <div className="flex items-center justify-between text-yellow-400 mb-1.5">
                          <span className="font-extrabold text-[11px] font-mono flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" /> 5. BUILT INFRASTRUCTURE & ECONOMIC LOSS
                          </span>
                          <span className="text-[10px] font-bold text-yellow-500 uppercase">GDP Destruction</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Total Financial Damage:</span>
                            <span className="text-yellow-300 font-black text-sm block">
                              {losses?.builtAndEconomicResources?.financialLossUSD || disaster.economic_damage || 'Multi-Billion Dollar Impact'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Homes Leveled / Destroyed:</span>
                            <span className="text-white font-bold block">
                              {losses?.builtAndEconomicResources?.housingUnitsDestroyed || 'Extensive residential damage'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 text-[11px] text-slate-300">
                          Infrastructure: <strong className="text-slate-200">{losses?.builtAndEconomicResources?.criticalInfrastructureLoss || 'Roads, bridges and utilities severed'}</strong>
                        </div>
                      </div>
                      <button
                        onClick={() => setLossAuditTab('BUILT_ECONOMY')}
                        className="mt-2 text-[10px] text-yellow-400 hover:text-yellow-300 font-bold text-left underline"
                      >
                        Deep Dive Economic Audit →
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: HUMAN LIFE DEEP DIVE */}
                {lossAuditTab === 'HUMAN' && (
                  <div className="bg-slate-950 border border-rose-900/60 rounded-xl p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-rose-950 pb-2">
                      <span className="font-extrabold text-rose-400 font-mono text-xs flex items-center gap-1.5">
                        <Users className="w-4 h-4" /> Comprehensive Human Casualty Ledger
                      </span>
                      <span className="text-[10px] font-mono bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800">
                        {losses?.humanLife?.deathsNumeric ? `${losses.humanLife.deathsNumeric.toLocaleString()} Deaths Recorded` : 'Confirmed Toll'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-rose-950">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Confirmed Fatalities</span>
                        <span className="text-rose-400 font-black text-sm block mt-0.5">
                          {losses?.humanLife?.deathsConfirmed || disaster.casualties_estimate}
                        </span>
                      </div>
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-rose-950">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Critically Injured</span>
                        <span className="text-amber-300 font-bold block mt-0.5">
                          {losses?.humanLife?.injuredToll || 'Thousands hospitalized with acute trauma'}
                        </span>
                      </div>
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-rose-950">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Displaced & Homeless</span>
                        <span className="text-white font-bold block mt-0.5">
                          {losses?.humanLife?.displacedHomeless || 'Mass citizen displacement'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                      <div>
                        <strong className="text-rose-300">Missing / Unaccounted:</strong>{' '}
                        <span className="text-slate-300">{losses?.humanLife?.missingPersons || 'Extensive search operations'}</span>
                      </div>
                      {losses?.humanLife?.vulnerableImpact && (
                        <div>
                          <strong className="text-amber-300">Vulnerable Groups Impacted:</strong>{' '}
                          <span className="text-slate-300">{losses.humanLife.vulnerableImpact}</span>
                        </div>
                      )}
                      {losses?.humanLife?.summary && (
                        <div className="pt-1.5 border-t border-slate-800/80 text-slate-300 italic">
                          "{losses.humanLife.summary}"
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: ANIMALS & WILDLIFE DEEP DIVE */}
                {lossAuditTab === 'ANIMALS' && (
                  <div className="bg-slate-950 border border-amber-900/60 rounded-xl p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-amber-950 pb-2">
                      <span className="font-extrabold text-amber-400 font-mono text-xs flex items-center gap-1.5">
                        <PawPrint className="w-4 h-4" /> Animals, Livestock & Wildlife Casualty Ledger
                      </span>
                      <span className="text-[10px] font-mono bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
                        Fauna & Biodiversity Destruction
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-amber-950">
                        <span className="text-[10px] font-bold text-amber-400 block uppercase">Domestic Livestock Mortality</span>
                        <p className="text-white font-bold mt-1 leading-snug">
                          {losses?.animalsAndWildlife?.livestockDeaths || 'Widespread death of cattle, sheep, and poultry herds'}
                        </p>
                      </div>
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-amber-950">
                        <span className="text-[10px] font-bold text-amber-400 block uppercase">Wild Animal & Bird Casualties</span>
                        <p className="text-white font-bold mt-1 leading-snug">
                          {losses?.animalsAndWildlife?.wildlifeCasualties || 'Native terrestrial, avian, and amphibian species perished'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                      {losses?.animalsAndWildlife?.endangeredSpeciesImpact && (
                        <div>
                          <strong className="text-rose-300">Endangered Species & Sanctuaries:</strong>{' '}
                          <span className="text-slate-300">{losses.animalsAndWildlife.endangeredSpeciesImpact}</span>
                        </div>
                      )}
                      {losses?.animalsAndWildlife?.habitatDestroyedKm2 && (
                        <div>
                          <strong className="text-amber-300">Total Wildlife Habitat Eradicated:</strong>{' '}
                          <span className="text-slate-300 font-mono">{losses.animalsAndWildlife.habitatDestroyedKm2}</span>
                        </div>
                      )}
                      {losses?.animalsAndWildlife?.summary && (
                        <div className="pt-1.5 border-t border-slate-800/80 text-slate-300 italic">
                          "{losses.animalsAndWildlife.summary}"
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: PLANTS & FORESTS DEEP DIVE */}
                {lossAuditTab === 'PLANTS' && (
                  <div className="bg-slate-950 border border-emerald-900/60 rounded-xl p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-emerald-950 pb-2">
                      <span className="font-extrabold text-emerald-400 font-mono text-xs flex items-center gap-1.5">
                        <Trees className="w-4 h-4" /> Plants, Forests & Agricultural Harvest Loss
                      </span>
                      <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                        Flora & Crop Devastation
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-emerald-950">
                        <span className="text-[10px] font-bold text-emerald-400 block uppercase">Forest Canopy Hectares Stripped / Burned</span>
                        <p className="text-white font-bold mt-1 leading-snug">
                          {losses?.plantsAndVegetation?.forestLossHectares || 'Extensive regional tree and forest canopy loss'}
                        </p>
                      </div>
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-emerald-950">
                        <span className="text-[10px] font-bold text-emerald-400 block uppercase">Agricultural Cropland Inundated / Ruined</span>
                        <p className="text-white font-bold mt-1 leading-snug">
                          {losses?.plantsAndVegetation?.cropsDestroyedAcres || 'Heavy loss of staple food harvests and orchards'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                      {losses?.plantsAndVegetation?.timberOrTreeMortality && (
                        <div>
                          <strong className="text-emerald-300">Tree Mortality / Timber Loss:</strong>{' '}
                          <span className="text-slate-300">{losses.plantsAndVegetation.timberOrTreeMortality}</span>
                        </div>
                      )}
                      {losses?.plantsAndVegetation?.agriculturalLossValue && (
                        <div>
                          <strong className="text-yellow-300">Estimated Harvest Financial Loss:</strong>{' '}
                          <span className="text-slate-300">{losses.plantsAndVegetation.agriculturalLossValue}</span>
                        </div>
                      )}
                      {losses?.plantsAndVegetation?.summary && (
                        <div className="pt-1.5 border-t border-slate-800/80 text-slate-300 italic">
                          "{losses.plantsAndVegetation.summary}"
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 5: NATURAL RESOURCES & ECOLOGY DEEP DIVE */}
                {lossAuditTab === 'NATURAL_RESOURCES' && (
                  <div className="bg-slate-950 border border-cyan-900/60 rounded-xl p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
                      <span className="font-extrabold text-cyan-400 font-mono text-xs flex items-center gap-1.5">
                        <Droplets className="w-4 h-4" /> Natural Resources, Freshwater & Soil Destruction
                      </span>
                      <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                        Ecological & Hydrological Scour
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-cyan-950">
                        <span className="text-[10px] font-bold text-cyan-400 block uppercase">Freshwater Aquifers & Groundwater</span>
                        <p className="text-white font-bold mt-1 leading-snug">
                          {losses?.naturalResources?.freshwaterImpact || 'Salinization or contamination of municipal drinking wells'}
                        </p>
                      </div>
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-cyan-950">
                        <span className="text-[10px] font-bold text-cyan-400 block uppercase">Topsoil Erosion & Geological Scour</span>
                        <p className="text-white font-bold mt-1 leading-snug">
                          {losses?.naturalResources?.soilErosionTopsoilLoss || 'Millions of tons of fertile agricultural topsoil scoured'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                      {losses?.naturalResources?.marineAndEcologicalLoss && (
                        <div>
                          <strong className="text-cyan-300">Marine & Coral Reef Degradation:</strong>{' '}
                          <span className="text-slate-300">{losses.naturalResources.marineAndEcologicalLoss}</span>
                        </div>
                      )}
                      {losses?.naturalResources?.carbonEmissionsOrPollution && (
                        <div>
                          <strong className="text-amber-300">Carbon Footprint & Atmospheric Plume:</strong>{' '}
                          <span className="text-slate-300">{losses.naturalResources.carbonEmissionsOrPollution}</span>
                        </div>
                      )}
                      {losses?.naturalResources?.summary && (
                        <div className="pt-1.5 border-t border-slate-800/80 text-slate-300 italic">
                          "{losses.naturalResources.summary}"
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 6: BUILT INFRASTRUCTURE & ECONOMY DEEP DIVE */}
                {lossAuditTab === 'BUILT_ECONOMY' && (
                  <div className="bg-slate-950 border border-yellow-900/60 rounded-xl p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-yellow-950 pb-2">
                      <span className="font-extrabold text-yellow-400 font-mono text-xs flex items-center gap-1.5">
                        <Building2 className="w-4 h-4" /> Built Infrastructure, Housing & Economic Damage
                      </span>
                      <span className="text-[10px] font-mono bg-yellow-950 text-yellow-300 px-2 py-0.5 rounded border border-yellow-800 font-black">
                        Direct Economic Loss: {losses?.builtAndEconomicResources?.financialLossUSD || disaster.economic_damage}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-yellow-950">
                        <span className="text-[10px] font-bold text-yellow-400 block uppercase">Housing Units Destroyed / Leveled</span>
                        <p className="text-white font-bold mt-1 leading-snug">
                          {losses?.builtAndEconomicResources?.housingUnitsDestroyed || 'Thousands of residential structures ruined'}
                        </p>
                      </div>
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-yellow-950">
                        <span className="text-[10px] font-bold text-yellow-400 block uppercase">Critical Infrastructure Severed</span>
                        <p className="text-white font-bold mt-1 leading-snug">
                          {losses?.builtAndEconomicResources?.criticalInfrastructureLoss || 'Highways, power stations, bridges and water mains severed'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                      {losses?.builtAndEconomicResources?.economicSectorsParalyzed && (
                        <div>
                          <strong className="text-rose-300">Paralyzed Economic Sectors:</strong>{' '}
                          <span className="text-slate-300">{losses.builtAndEconomicResources.economicSectorsParalyzed}</span>
                        </div>
                      )}
                      {losses?.builtAndEconomicResources?.summary && (
                        <div className="pt-1.5 border-t border-slate-800/80 text-slate-300 italic">
                          "{losses.builtAndEconomicResources.summary}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Before & After Satellite Imagery Section */}
          {(() => {
            const match = getBeforeAfterRecord(disaster.id);
            if (match) {
              return (
                <div className="border border-cyan-500/40 rounded-2xl overflow-hidden bg-slate-900/80 p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                      <Satellite className="w-4 h-4 text-cyan-400" />
                      Live Before vs. After Satellite Imagery & Ground Truth
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                        Multi-Spectral Change Detection
                      </span>
                      {onOpenSatelliteGallery && (
                        <button
                          onClick={() => onOpenSatelliteGallery(match.id)}
                          className="text-[10px] font-bold bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 px-2 py-0.5 rounded transition"
                        >
                          Open Studio ↗
                        </button>
                      )}
                    </div>
                  </div>
                  <BeforeAfterViewer record={match} />
                </div>
              );
            } else if (onOpenSatelliteGallery) {
              return (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Satellite className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white text-xs block">
                        Compare Live Before & After Satellite Signatures
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Inspect pre-event vs post-cataclysm satellite views for 8 landmark Earth disasters (2004 Sumatra, 2011 Tohoku, 2013 Kedarnath, 2024 Wayanad, etc.)
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenSatelliteGallery()}
                    className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs transition whitespace-nowrap"
                  >
                    Open Satellite Studio
                  </button>
                </div>
              );
            }
            return null;
          })()}

          {/* Detailed Description */}
          {disaster.description && (
            <div className="bg-slate-900/60 border border-slate-800/70 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed">
              <span className="text-[10px] font-mono text-cyan-400 font-bold block uppercase mb-1">
                Disaster Overview & Geological Mechanism
              </span>
              <p>{disaster.description}</p>
            </div>
          )}

          {/* Simple Human-Friendly Instructions: "What You Must Do Right Now" */}
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 space-y-2.5">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 uppercase font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> What You Must Do Right Now (Life-Safety Guide)
            </span>
            <div className="space-y-1.5 text-xs text-emerald-100 font-medium">
              {disaster.plain_language_action_steps && disaster.plain_language_action_steps.length > 0 ? (
                disaster.plain_language_action_steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-emerald-400 font-mono">{idx + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))
              ) : (
                <p>{disaster.emergencyDirectives}</p>
              )}
            </div>
          </div>

          {/* 500m Proximity Alarm Callout & Test Button */}
          <div className="bg-red-950/40 border border-red-600/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <h3 className="text-sm font-bold text-white">500-Meter Proximity Protection Engine</h3>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                If your living location is within <strong>500 meters</strong> of this disaster, an automatic high-pitch audio siren and voice alert will sound on all mobile phones.
              </p>
            </div>

            <button
              onClick={() => onTest500mAlert(disaster)}
              className="bg-red-600 hover:bg-red-500 text-white font-extrabold px-4 py-2.5 rounded-xl transition text-xs flex items-center gap-2 shadow-xl whitespace-nowrap pulse-red"
            >
              <Volume2 className="w-4 h-4 animate-bounce" />
              <span>Simulate 500m Proximity Siren</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
