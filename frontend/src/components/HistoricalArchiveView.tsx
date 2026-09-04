import React, { useState, useEffect } from 'react';
import { GlobalDisaster, DisasterType, GlobalLossSummary } from '../types.js';
import { DataService } from '../services/dataService.js';
import {
  History,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Activity,
  Wind,
  Waves,
  Flame,
  Mountain,
  AlertTriangle,
  Sun,
  Droplets,
  MapPin,
  Clock,
  ExternalLink,
  Map,
  ShieldCheck,
  TrendingUp,
  Globe2,
  Satellite,
  Skull,
  PawPrint,
  Trees,
  Building2,
  DollarSign,
  Hourglass,
} from 'lucide-react';
import { BEFORE_AFTER_DATA, hasBeforeAfterImagery } from '../data/beforeAfterData.js';
import { getDisasterCodeInfo, getDisasterCode } from '../utils/disasterCodes.js';

interface HistoricalArchiveViewProps {
  onSelectDisaster: (disaster: GlobalDisaster) => void;
  onLocateOnMap: (disaster: GlobalDisaster) => void;
  onOpenSatelliteStudio?: (disasterId?: string) => void;
}

type EraFilter = 'ALL' | 'RECENT_2020_2026' | 'CONTEMPORARY_2000_2019' | 'CENTURY_20TH' | 'ANCIENT_PRE1900';

export const HistoricalArchiveView: React.FC<HistoricalArchiveViewProps> = ({
  onSelectDisaster,
  onLocateOnMap,
  onOpenSatelliteStudio,
}) => {
  const [disasters, setDisasters] = useState<GlobalDisaster[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEra, setSelectedEra] = useState<EraFilter>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'year_desc' | 'year_asc' | 'abnormality' | 'rainfall_abnormality' | 'human_loss' | 'economic_loss'>('year_desc');
  const [lossSummary, setLossSummary] = useState<GlobalLossSummary | null>(null);

  // Fetch planetary loss summary once
  useEffect(() => {
    DataService.getLossSummary()
      .then((data) => setLossSummary(data))
      .catch((err) => console.error('Failed to load global losses summary:', err));
  }, []);

  // Fetch historical archive from backend/local dataset
  useEffect(() => {
    setLoading(true);
    DataService.getGlobalDisasters({
      status: 'PAST_HISTORICAL',
      era: selectedEra,
      type: selectedType,
      search: searchQuery,
      sortBy: sortBy,
    })
      .then((data) => {
        setDisasters(data.disasters || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load historical disaster archive:', err);
        setLoading(false);
      });
  }, [selectedEra, selectedType, searchQuery, sortBy]);

  const getHazardIcon = (type: DisasterType) => {
    switch (type) {
      case 'EARTHQUAKE':
        return <Activity className="w-4 h-4 text-amber-400" />;
      case 'CYCLONE_HURRICANE':
        return <Wind className="w-4 h-4 text-cyan-400" />;
      case 'FLOOD':
      case 'TSUNAMI':
        return <Waves className="w-4 h-4 text-blue-400" />;
      case 'WILDFIRE':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'VOLCANO':
        return <Mountain className="w-4 h-4 text-red-400" />;
      case 'COSMIC_ATMOSPHERIC':
        return <Sun className="w-4 h-4 text-yellow-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    }
  };

  const getEraLabel = (era?: string) => {
    switch (era) {
      case 'RECENT_2020_2026':
        return '2020–2026 Contemporary';
      case 'CONTEMPORARY_2000_2019':
        return '2000–2019 21st Century';
      case 'CENTURY_20TH':
        return '20th Century (1900–1999)';
      case 'ANCIENT_PRE1900':
        return 'Ancient / Pre-1900';
      default:
        return 'Historical Era';
    }
  };

  return (
    <div className="flex-1 w-full h-full bg-[#050914] overflow-y-auto p-4 md:p-6 text-slate-100 flex flex-col space-y-6 select-none">
      {/* 1. HERO TITLE & ARCHIVE OVERVIEW */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <History className="w-80 h-80 text-cyan-400" />
        </div>

        <div className="max-w-4xl relative z-10">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider mb-2">
            <History className="w-4 h-4" /> Terrain Guard • Earth-Scale Historical Archive
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Every Disaster & Abnormality in Recorded History (Till Date)
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
            Explore Earth's encyclopedic archive of past catastrophes—from <strong>79 AD Mount Vesuvius</strong> and the <strong>1556 Shaanxi Earthquake</strong> to modern mega-deluges, super cyclones, tsunamis, and geomagnetic anomalies. Inspect exact magnitudes, start/duration/end timelines, and <strong>rainfall abnormalities in mm</strong>.
          </p>
        </div>

        {/* Quick Benchmark KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-6 pt-5 border-t border-slate-800/80 font-mono text-xs">
          <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">STRONGEST QUAKE</span>
            <span className="text-amber-400 font-extrabold text-sm block mt-0.5">M 9.5 Valdivia</span>
            <span className="text-[9px] text-slate-500">1960 • Chile</span>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">DEADLIEST FLOOD</span>
            <span className="text-blue-400 font-extrabold text-sm block mt-0.5">+650 mm Anomaly</span>
            <span className="text-[9px] text-slate-500">1931 • Yangtze China</span>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">HIGHEST TSUNAMI</span>
            <span className="text-cyan-400 font-extrabold text-sm block mt-0.5">524m Mega-Wave</span>
            <span className="text-[9px] text-slate-500">1958 • Lituya Bay</span>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">DEADLIEST CYCLONE</span>
            <span className="text-teal-400 font-extrabold text-sm block mt-0.5">500k Casualties</span>
            <span className="text-[9px] text-slate-500">1970 • Bhola Cyclone</span>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">MAX VOLCANO VEI</span>
            <span className="text-red-400 font-extrabold text-sm block mt-0.5">VEI 7 Tambora</span>
            <span className="text-[9px] text-slate-500">1815 • Indonesia</span>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">RECORD 24H RAIN</span>
            <span className="text-purple-400 font-extrabold text-sm block mt-0.5">944 mm Urban</span>
            <span className="text-[9px] text-slate-500">2005 • Mumbai</span>
          </div>
        </div>

        {/* Global Planetary Resource & Life Loss Audit Ledger */}
        <div className="mt-4 bg-slate-950/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-rose-950 flex items-center justify-center border border-rose-800/60">
                <Skull className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <span className="text-xs font-black text-white font-mono uppercase tracking-wider">
                Planetary Resource & Life Loss Ledger (Recorded Human History Till Date)
              </span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
              Documented Casualties: Humans, Fauna, Flora & Resources
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-900/90 p-3 rounded-xl border border-rose-900/40">
              <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1 uppercase">
                <Skull className="w-3 h-3" /> Total Human Lives Lost
              </span>
              <span className="text-white font-black text-sm md:text-base block mt-0.5">
                {lossSummary?.totalHumanDeathsFormatted || '~5.5 Million'}
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5 truncate">
                {lossSummary?.totalHumanDisplaced || 'Over 120M Citizens Displaced'}
              </span>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-amber-900/40">
              <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1 uppercase">
                <PawPrint className="w-3 h-3" /> Animals & Wildlife Loss
              </span>
              <span className="text-amber-300 font-black text-sm md:text-base block mt-0.5">
                {lossSummary?.totalLivestockAndWildlifeImpacted?.split(' ')[1] || '3.8+ Billion'}
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5 truncate">
                Livestock, native mammals, reptiles & birds
              </span>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-emerald-900/40">
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 uppercase">
                <Trees className="w-3 h-3" /> Forests & Crops Lost
              </span>
              <span className="text-emerald-300 font-black text-sm md:text-base block mt-0.5">
                {lossSummary?.totalForestAndCropsHectaresLost?.split(' ')[1] || '52+ Million'} Ha
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5 truncate">
                Canopy incinerated, scoured & salinized
              </span>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-yellow-900/40">
              <span className="text-[10px] font-bold text-yellow-400 flex items-center gap-1 uppercase">
                <Building2 className="w-3 h-3" /> Built & Economic Loss
              </span>
              <span className="text-yellow-300 font-black text-sm md:text-base block mt-0.5">
                {lossSummary?.totalEconomicDamageUSD?.split(' ')[0] || '$3.2+ Trillion'}
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5 truncate">
                Infrastructure, housing & commercial grids
              </span>
            </div>
          </div>
        </div>

        {/* Before & After Satellite Change Detection Banner */}
        {onOpenSatelliteStudio && (
          <div className="mt-4 bg-gradient-to-r from-cyan-950/90 via-slate-900 to-indigo-950/70 border border-cyan-500/60 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-900/60 border border-cyan-500/60 text-cyan-300 shadow-inner">
                <Satellite className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                    Live Before vs. After Satellite Imagery Studio
                  </h4>
                  <span className="bg-cyan-500/20 text-cyan-300 font-mono text-[9px] font-extrabold px-2 py-0.5 rounded border border-cyan-500/40">
                    Space-Borne Change Detection
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Compare pre-disaster landscape vs post-cataclysm ground truth for 8 landmark Earth disasters (2004 Sumatra Tsunami, 2011 Tohoku, 2013 Kedarnath, 2024 Wayanad, 1980 St. Helens, 2022 Pakistan, 2023 Turkey, and 2019 Australia).
                </p>
              </div>
            </div>
            <button
              onClick={() => onOpenSatelliteStudio()}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition shadow-lg flex items-center gap-1.5 whitespace-nowrap"
            >
              <Satellite className="w-4 h-4" />
              <span>Open Satellite Studio</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. INTERACTIVE CONTROLS: ERA SELECTOR, FILTERS, SEARCH & SORT */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3.5">
        {/* Era Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-400 font-sans font-bold text-xs mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" /> Historical Era:
            </span>
            {(
              [
                { id: 'ALL', label: 'All Eras (Till Date)' },
                { id: 'RECENT_2020_2026', label: '2020–2026 (Recent)' },
                { id: 'CONTEMPORARY_2000_2019', label: '2000–2019 (21st Cent.)' },
                { id: 'CENTURY_20TH', label: '1900–1999 (20th Cent.)' },
                { id: 'ANCIENT_PRE1900', label: 'Ancient / Pre-1900' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedEra(tab.id)}
                className={`px-3 py-1.5 rounded-xl transition text-xs font-bold ${
                  selectedEra === tab.id
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-cyan-400 font-bold bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            {disasters.length} Archive Records Found
          </div>
        </div>

        {/* Hazard Type Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-sans font-bold text-xs mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" /> Hazard Type:
          </span>
          {[
            { id: 'ALL', label: 'All Cataclysms', code: 'ALL' },
            { id: 'LANDSLIDE', label: 'Landslides', code: 'LS' },
            { id: 'EARTHQUAKE', label: 'Earthquakes', code: 'EQ' },
            { id: 'FLOOD', label: 'Floods', code: 'FL' },
            { id: 'TSUNAMI', label: 'Tsunamis', code: 'TS' },
            { id: 'CYCLONE_HURRICANE', label: 'Cyclones & Hurricanes', code: 'CY' },
            { id: 'WILDFIRE', label: 'Wildfires', code: 'WF' },
            { id: 'VOLCANO', label: 'Volcanoes', code: 'VO' },
            { id: 'CLOUDBURST', label: 'Cloudbursts', code: 'CB' },
            { id: 'COSMIC_ATMOSPHERIC', label: 'Cosmic & Solar', code: 'CA' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-2.5 py-1 rounded-xl transition text-xs font-semibold flex items-center gap-1.5 ${
                selectedType === type.id
                  ? 'bg-slate-100 text-slate-950 shadow-sm font-extrabold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {type.id !== 'ALL' && getHazardIcon(type.id as DisasterType)}
              <span className="font-mono font-black text-cyan-400">[{type.code}]</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>

        {/* Search & Sort Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Instant Search Bar */}
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-2xl border border-slate-800 flex-1 max-w-md text-xs">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search historical disasters by name, country, year, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white placeholder:text-slate-500 outline-none w-full font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-500 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-2xl border border-slate-800 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 font-bold">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs"
            >
              <option value="year_desc" className="bg-slate-900">Year (Newest to Oldest)</option>
              <option value="year_asc" className="bg-slate-900">Year (Oldest to Newest)</option>
              <option value="human_loss" className="bg-slate-900">Highest Human Life Loss (Deaths)</option>
              <option value="economic_loss" className="bg-slate-900">Highest Economic & Resource Damage</option>
              <option value="rainfall_abnormality" className="bg-slate-900">Rainfall Abnormality in MM</option>
              <option value="abnormality" className="bg-slate-900">Highest Abnormality Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. HISTORICAL DISASTER CARDS GRID */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-mono text-xs">Loading Earth historical disaster records...</span>
        </div>
      ) : disasters.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-2">
          <AlertTriangle className="w-10 h-10 text-amber-400" />
          <h2 className="text-base font-bold text-white">No historical disasters matched your filter</h2>
          <p className="text-xs text-slate-400">Try clearing your search query or selecting "All Eras" and "All Hazards".</p>
          <button
            onClick={() => {
              setSelectedEra('ALL');
              setSelectedType('ALL');
              setSearchQuery('');
            }}
            className="mt-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {disasters.map((d) => {
            return (
              <div
                key={d.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/80 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4 transition duration-200 group"
              >
                <div>
                  {/* Top Header: Hazard Type & Era Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold ${
                        getDisasterCodeInfo(d.type).badgeBg
                      } ${getDisasterCodeInfo(d.type).badgeBorder}`}
                    >
                      {getHazardIcon(d.type)}
                      <span className={`font-mono font-black ${getDisasterCodeInfo(d.type).badgeText}`}>
                        [{getDisasterCodeInfo(d.type).code}]
                      </span>
                      <span className="text-slate-200">{getDisasterCodeInfo(d.type).name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {d.year && (
                        <span className="px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-800/80 text-amber-300 font-mono font-extrabold text-[11px] flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {d.year} AD
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Disaster Title & Location */}
                  <h3 className="text-base font-extrabold text-white mt-3 group-hover:text-cyan-300 transition leading-snug">
                    {d.name}
                  </h3>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="font-semibold text-slate-300 truncate">
                      {d.state_province}, {d.country} {d.continent ? `(${d.continent})` : ''}
                    </span>
                  </div>

                  {/* Primary Attribute & Rainfall Abnormality Badges */}
                  <div className="mt-3.5 space-y-2">
                    {/* Primary Attribute (Magnitude, Wind, VEI) */}
                    <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800/90 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                        {d.primary_attribute_label || 'Primary Metric'}:
                      </span>
                      <span className="font-mono font-extrabold text-xs text-amber-400">
                        {d.magnitude || d.primary_attribute_value?.split('(')[0] || 'Extreme'}
                      </span>
                    </div>

                    {/* Rainfall Abnormality in MM */}
                    <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800/90 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1">
                        <Droplets className="w-3 h-3" /> Rain Abnormality:
                      </span>
                      <span className="font-mono font-extrabold text-xs text-cyan-300">
                        {d.rainfall_abnormality_mm && d.rainfall_abnormality_mm > 0
                          ? `+${d.rainfall_abnormality_mm} mm`
                          : `${d.rainfall_abnormality_mm ?? 0} mm`}
                        <span className="text-[10px] text-slate-400 font-normal ml-1">
                          ({d.rainfall_actual_mm ?? 0} mm actual)
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Timeline & Casualties Snippet */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 font-mono text-[11px] text-slate-400 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Duration:</span>
                      <span className="text-slate-300 font-semibold">{d.duration_text || 'Multi-day event'}</span>
                    </div>
                  </div>

                  {/* Resource & Life Loss Audit Badges */}
                  {d.resource_losses ? (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 space-y-1 text-[10px] font-mono">
                      <div className="flex items-center justify-between bg-rose-950/40 px-2 py-1 rounded-lg border border-rose-900/50 text-rose-300">
                        <span className="flex items-center gap-1 text-slate-400 font-semibold">
                          <Skull className="w-3 h-3 text-rose-400 shrink-0" /> Human:
                        </span>
                        <span className="font-black truncate max-w-[170px]" title={d.resource_losses.humanLife?.deathsConfirmed}>
                          {d.resource_losses.humanLife?.deathsConfirmed?.split(';')[0]?.split('(')[0] || d.casualties_estimate}
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-900/50 text-amber-300">
                        <span className="flex items-center gap-1 text-slate-400 font-semibold">
                          <PawPrint className="w-3 h-3 text-amber-400 shrink-0" /> Animals:
                        </span>
                        <span className="font-bold truncate max-w-[170px]" title={d.resource_losses.animalsAndWildlife?.livestockDeaths}>
                          {d.resource_losses.animalsAndWildlife?.livestockDeaths?.split(';')[0]?.split('(')[0] || 'Fauna impacted'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-900/50 text-emerald-300">
                        <span className="flex items-center gap-1 text-slate-400 font-semibold">
                          <Trees className="w-3 h-3 text-emerald-400 shrink-0" /> Flora:
                        </span>
                        <span className="font-bold truncate max-w-[170px]" title={d.resource_losses.plantsAndVegetation?.forestLossHectares}>
                          {d.resource_losses.plantsAndVegetation?.forestLossHectares?.split(';')[0]?.split('(')[0] || 'Flora scoured'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-yellow-950/40 px-2 py-1 rounded-lg border border-yellow-900/50 text-yellow-300">
                        <span className="flex items-center gap-1 text-slate-400 font-semibold">
                          <Building2 className="w-3 h-3 text-yellow-400 shrink-0" /> Economy:
                        </span>
                        <span className="font-black truncate max-w-[170px]" title={d.resource_losses.builtAndEconomicResources?.financialLossUSD}>
                          {d.resource_losses.builtAndEconomicResources?.financialLossUSD || d.economic_damage}
                        </span>
                      </div>
                    </div>
                  ) : d.casualties_estimate ? (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 font-mono text-[11px] text-rose-400 font-bold truncate">
                      Toll: {d.casualties_estimate}
                    </div>
                  ) : null}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => onSelectDisaster(d)}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold py-2 px-3 rounded-xl transition text-xs flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <span>Inspect Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  {hasBeforeAfterImagery(d.id) && onOpenSatelliteStudio && (
                    <button
                      onClick={() => onOpenSatelliteStudio(d.id)}
                      title="View Before vs After Satellite Change Detection"
                      className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 hover:border-indigo-400 py-2 px-2.5 rounded-xl transition text-xs flex items-center justify-center gap-1 font-bold"
                    >
                      <Satellite className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                      <span className="hidden sm:inline">Sat</span>
                    </button>
                  )}

                  <button
                    onClick={() => onLocateOnMap(d)}
                    title="Locate on Live World Map"
                    className="bg-slate-950 hover:bg-slate-800 text-cyan-400 border border-slate-800 hover:border-cyan-500/60 py-2 px-3 rounded-xl transition text-xs flex items-center justify-center gap-1 font-bold"
                  >
                    <Map className="w-3.5 h-3.5" />
                    <span>Map</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
