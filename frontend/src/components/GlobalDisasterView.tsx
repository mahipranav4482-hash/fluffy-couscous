import React, { useState, useEffect, useRef } from 'react';
import {
  GlobalDisaster,
  CountryInfo,
  DisasterType,
  AnomalyActivity,
  ProximityEvaluationResult,
} from '../types.js';
import { DisasterDetailModal } from './DisasterDetailModal.js';
import {
  getDisasterCodeInfo,
  getDisasterCode,
  ALL_DISASTER_CODE_LEGENDS,
} from '../utils/disasterCodes.js';
import { DataService } from '../services/dataService.js';
import {
  Globe,
  Flame,
  Waves,
  Wind,
  Mountain,
  Activity,
  AlertTriangle,
  Radio,
  MapPin,
  Volume2,
  Filter,
  Layers,
  Search,
  List,
  Compass,
  History,
  Sun,
  Calendar,
  Satellite,
  Eye,
  Crosshair,
} from 'lucide-react';

declare const L: any;

interface GlobalDisasterViewProps {
  onTriggerProximityAlert: (result: ProximityEvaluationResult) => void;
  onOpenHistoricalArchive?: () => void;
  onOpenSatelliteStudio?: (disasterId?: string) => void;
  focusedDisaster?: GlobalDisaster | null;
}

const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  India: [20.59, 78.96],
  'United States': [37.09, -95.71],
  Japan: [36.20, 138.25],
  Indonesia: [-0.78, 113.92],
  Chile: [-35.67, -71.54],
  Turkey: [38.96, 35.24],
  Bangladesh: [23.68, 90.35],
  China: [35.86, 104.19],
  Italy: [41.87, 12.56],
  Australia: [-25.27, 133.77],
  Peru: [-9.19, -75.01],
  Canada: [56.13, -106.34],
  Tonga: [-21.17, -175.19],
  Germany: [51.16, 10.45],
  Nepal: [28.39, 84.12],
  Haiti: [18.97, -72.28],
  Philippines: [12.87, 121.77],
  Pakistan: [30.37, 69.34],
  Russia: [61.52, 105.31],
  Portugal: [39.39, -8.22],
};

export const GlobalDisasterView: React.FC<GlobalDisasterViewProps> = ({
  onTriggerProximityAlert,
  onOpenHistoricalArchive,
  onOpenSatelliteStudio,
  focusedDisaster,
}) => {
  const [countries, setCountries] = useState<CountryInfo[]>([]);
  const [disasters, setDisasters] = useState<GlobalDisaster[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyActivity[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedEra, setSelectedEra] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mapTileMode, setMapTileMode] = useState<'DARK' | 'SATELLITE' | 'STREET'>('DARK');
  const [anomalyFilterCountry, setAnomalyFilterCountry] = useState<string>('ALL');

  // Selected disaster for detail modal
  const [activeModalDisaster, setActiveModalDisaster] = useState<GlobalDisaster | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showCardsDrawer, setShowCardsDrawer] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current && typeof L !== 'undefined') {
      const map = L.map(mapContainerRef.current, {
        center: [22, 10],
        zoom: 2.5,
        minZoom: 1.8,
        maxZoom: 18,
        zoomControl: true,
        attributionControl: false,
      });

      // Default Dark Tactical Tile Layer (Esri World Dark Gray Base & Reference - Keyless & Watermark-Free)
      const baseTile = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          maxNativeZoom: 16,
        }
      );
      const refTile = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          maxNativeZoom: 16,
        }
      );
      const initialTileGroup = L.layerGroup([baseTile, refTile]).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      tileLayerRef.current = initialTileGroup;
      markersLayerRef.current = markersGroup;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Tile Layer Switching (Dark, Satellite, Street) - All Keyless & Watermark-Free
  useEffect(() => {
    if (!mapInstanceRef.current || typeof L === 'undefined') return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    let newLayer: any = null;

    if (mapTileMode === 'DARK') {
      const base = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, maxNativeZoom: 16 }
      );
      const ref = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, maxNativeZoom: 16 }
      );
      newLayer = L.layerGroup([base, ref]);
    } else if (mapTileMode === 'SATELLITE') {
      const sat = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, maxNativeZoom: 18 }
      );
      const borders = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, maxNativeZoom: 18 }
      );
      newLayer = L.layerGroup([sat, borders]);
    } else if (mapTileMode === 'STREET') {
      newLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      });
    }

    if (newLayer) {
      newLayer.addTo(mapInstanceRef.current);
      tileLayerRef.current = newLayer;
    }
  }, [mapTileMode]);

  // Fetch Country directory & Anomalies
  useEffect(() => {
    DataService.getCountries().then(setCountries);
    DataService.getLiveAnomalies().then(setAnomalies);
  }, []);

  // Fetch filtered disasters
  useEffect(() => {
    DataService.getGlobalDisasters({
      country: selectedCountry,
      state: selectedState,
      status: selectedStatus,
      type: selectedType,
      era: selectedEra,
    }).then((data) => {
      setDisasters(data.disasters || []);
    });
  }, [selectedCountry, selectedState, selectedStatus, selectedType, selectedEra]);

  // Handle flyTo when country changes
  const handleCountryChange = (c: string) => {
    setSelectedCountry(c);
    setSelectedState('ALL');

    if (mapInstanceRef.current) {
      if (c === 'ALL') {
        mapInstanceRef.current.flyTo([22, 10], 2.5, { duration: 1.2 });
      } else if (COUNTRY_COORDINATES[c]) {
        mapInstanceRef.current.flyTo(COUNTRY_COORDINATES[c], 5, { duration: 1.5 });
      } else {
        const countryDisaster = disasters.find((d) => d.country.toLowerCase() === c.toLowerCase());
        if (countryDisaster) {
          mapInstanceRef.current.flyTo([countryDisaster.coordinates[1], countryDisaster.coordinates[0]], 5, { duration: 1.5 });
        }
      }
    }
  };

  const handleStateChange = (s: string) => {
    setSelectedState(s);
    if (s !== 'ALL' && mapInstanceRef.current) {
      const stateDisaster = disasters.find(
        (d) => d.state_province.toLowerCase() === s.toLowerCase()
      );
      if (stateDisaster) {
        mapInstanceRef.current.flyTo([stateDisaster.coordinates[1], stateDisaster.coordinates[0]], 7, { duration: 1.5 });
      }
    }
  };

  // If a disaster was passed to focus on (e.g. from Historical Archive)
  useEffect(() => {
    if (focusedDisaster && mapInstanceRef.current) {
      setActiveModalDisaster(focusedDisaster);
      setIsDetailModalOpen(true);
      mapInstanceRef.current.flyTo([focusedDisaster.coordinates[1], focusedDisaster.coordinates[0]], 6.5, {
        duration: 1.5,
      });
    }
  }, [focusedDisaster]);

  const currentCountryObj = countries.find((c) => c.country === selectedCountry);
  const availableStates = currentCountryObj ? currentCountryObj.states : [];

  // Filter disasters by search query and simple disaster code
  const filteredDisasters = disasters.filter((d) => {
    if (selectedType !== 'ALL') {
      const codeInfo = getDisasterCodeInfo(d.type);
      if (codeInfo.code !== selectedType && d.type !== selectedType) return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      d.name.toLowerCase().includes(q) ||
      d.country.toLowerCase().includes(q) ||
      d.state_province.toLowerCase().includes(q) ||
      d.type.toLowerCase().includes(q) ||
      String(d.year || '').includes(q) ||
      getDisasterCode(d.type).toLowerCase() === q
    );
  });

  // Render Leaflet Markers & Circles
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || typeof L === 'undefined') return;

    markersLayerRef.current.clearLayers();

    filteredDisasters.forEach((d) => {
      const lat = d.coordinates[1];
      const lon = d.coordinates[0];
      const isActive = d.status === 'ACTIVE_NOW';
      const isUpcoming = d.status === 'UPCOMING_PREDICTED';

      const codeInfo = getDisasterCodeInfo(d.type);
      const themeColor = isActive ? '#ef4444' : isUpcoming ? '#f59e0b' : codeInfo.pinColor;
      const badgeText = isActive ? 'ACTIVE NOW' : isUpcoming ? 'UPCOMING' : d.year ? `${d.year} AD` : 'PAST';

      // Custom pulsing HTML Pin displaying simple form (LS, EQ, FL, TS, CY, WF, VO, CB, CA)
      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 48px; height: 48px;">
          ${isActive ? `<div class="absolute inset-0 rounded-full bg-red-500 opacity-50 animate-ping"></div>` : ''}
          <div class="w-9 h-9 rounded-full flex items-center justify-center border-2 border-white shadow-2xl transition transform group-hover:scale-125 font-mono" style="background-color: ${codeInfo.pinColor}; box-shadow: 0 0 16px ${codeInfo.pinColor};">
            <span class="text-[12px] font-black text-white tracking-tighter">${codeInfo.code}</span>
          </div>
          <div class="absolute -bottom-5 whitespace-nowrap bg-slate-950/95 text-white font-bold text-[9px] px-2 py-0.5 rounded-full border border-slate-700 shadow-lg pointer-events-none flex items-center gap-1">
            <span style="color: ${codeInfo.pinColor}; font-weight: 900;">${codeInfo.code}</span>
            <span class="text-slate-400">•</span>
            <span>${badgeText}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-disaster-pin',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      // Impact Zone Circle
      const radiusCircle = L.circle([lat, lon], {
        radius: Math.max(10000, d.radius_meters || 25000),
        color: themeColor,
        weight: isActive ? 2.5 : 1.5,
        fillColor: themeColor,
        fillOpacity: isActive ? 0.22 : 0.12,
        dashArray: isUpcoming ? '6, 6' : undefined,
      });

      // Marker
      const marker = L.marker([lat, lon], { icon: customIcon });

      // Click to open Universal Dialog Box
      marker.on('click', () => {
        openDisasterDetail(d);
      });
      radiusCircle.on('click', () => {
        openDisasterDetail(d);
      });

      markersLayerRef.current.addLayer(radiusCircle);
      markersLayerRef.current.addLayer(marker);
    });
  }, [filteredDisasters]);

  const openDisasterDetail = (d: GlobalDisaster) => {
    setActiveModalDisaster(d);
    setIsDetailModalOpen(true);
  };

  const trigger500mProximitySiren = async (targetDisaster: GlobalDisaster) => {
    const testLat = targetDisaster.coordinates[1] + 0.0025;
    const testLon = targetDisaster.coordinates[0];

    try {
      const data = await DataService.checkProximity(testLat, testLon);
      onTriggerProximityAlert(data);
    } catch (err) {
      console.error('Proximity check failed:', err);
    }
  };

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
      case 'LANDSLIDE':
      case 'CLOUDBURST':
      default:
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    }
  };

  const filteredAnomalies = anomalies.filter((a) => {
    if (anomalyFilterCountry === 'ALL') return true;
    return a.country.toLowerCase() === anomalyFilterCountry.toLowerCase();
  });

  return (
    <div className="relative flex-1 w-full h-full bg-[#030712] overflow-hidden select-none flex flex-col">
      {/* 1. TOP FLOATING GLASS HUD: Country, State, Search, Status & Era Tabs */}
      <div
        className={`absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2.5 pointer-events-none transition-opacity duration-200 ${
          isDetailModalOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Single Streamlined Floating Bar: Country, Search, Hazard Pills & Map Controls */}
        <div className="flex items-center flex-wrap gap-2 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 p-1.5 rounded-2xl shadow-2xl pointer-events-auto text-xs">
          {/* Country Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={selectedCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs"
            >
              <option value="ALL">🌍 All Countries</option>
              {countries.map((c) => (
                <option key={c.country} value={c.country} className="bg-slate-900">
                  {c.country} ({c.totalDisasters})
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
            <Search className="w-3 h-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search disaster / city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white placeholder:text-slate-500 outline-none w-28 md:w-36 text-xs font-medium"
            />
          </div>

          {/* Simple Form Hazard Pills: ALL | LS | EQ | FL | CY | WF | TS | VO */}
          <div className="flex items-center gap-1 text-[11px] font-mono">
            <button
              onClick={() => setSelectedType('ALL')}
              className={`px-2 py-0.5 rounded-lg transition font-extrabold ${
                selectedType === 'ALL'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
              }`}
            >
              ALL
            </button>
            {ALL_DISASTER_CODE_LEGENDS.map((leg) => {
              const isSelected = selectedType === leg.code || selectedType === leg.name.toUpperCase();
              return (
                <button
                  key={leg.code}
                  onClick={() => setSelectedType(isSelected ? 'ALL' : leg.code)}
                  className={`px-2 py-0.5 rounded-lg transition font-bold flex items-center gap-1 border ${
                    isSelected
                      ? `${leg.badgeBg} ${leg.badgeText} ${leg.badgeBorder} ring-2 ring-cyan-400 font-black shadow`
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600 hover:text-white'
                  }`}
                  title={`${leg.name} (${leg.code}): ${leg.description}`}
                >
                  <span className={`font-mono font-black ${leg.badgeText}`}>
                    {leg.code}
                  </span>
                  <span className="hidden xl:inline text-[10px]">{leg.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right HUD Controls: Satellite toggle & Cards list */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 p-1.5 rounded-2xl shadow-2xl pointer-events-auto flex items-center gap-1.5 text-xs">
          {/* Map Layer Mode Switcher: Dark vs Satellite */}
          <button
            onClick={() => setMapTileMode(mapTileMode === 'DARK' ? 'SATELLITE' : 'DARK')}
            className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold flex items-center gap-1 text-xs transition"
            title="Toggle Map Style"
          >
            {mapTileMode === 'DARK' ? (
              <>
                <Satellite className="w-3.5 h-3.5 text-cyan-400" />
                <span>Satellite</span>
              </>
            ) : (
              <>
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Dark Map</span>
              </>
            )}
          </button>

          {/* Cards Drawer Toggle */}
          <button
            onClick={() => setShowCardsDrawer(!showCardsDrawer)}
            className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 transition whitespace-nowrap text-xs ${
              showCardsDrawer
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>{showCardsDrawer ? 'Hide' : `Cards (${filteredDisasters.length})`}</span>
          </button>
        </div>
      </div>

      {/* 2. REAL INTERACTIVE LEAFLET WORLD MAP CANVAS */}
      <div className="relative w-full h-full flex-1 z-10">
        <div ref={mapContainerRef} id="globalMapContainer" className="w-full h-full" />
      </div>

      {/* 3. FLOATING BOTTOM-LEFT: COUNTRY-FILTERABLE ABNORMAL ACTIVITY SENSOR FEED */}
      <div
        className={`absolute bottom-4 left-4 z-[1000] max-w-md w-full bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-3.5 shadow-2xl text-xs select-none transition-opacity duration-200 ${
          isDetailModalOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
          <span className="font-extrabold text-red-400 font-mono flex items-center gap-1.5 text-xs uppercase tracking-wider">
            <Radio className="w-4 h-4 animate-pulse text-red-400" /> Live Abnormal Activity Feed
          </span>

          {/* Anomaly Country Filter */}
          <select
            value={anomalyFilterCountry}
            onChange={(e) => setAnomalyFilterCountry(e.target.value)}
            className="bg-slate-950 text-cyan-400 font-bold border border-slate-800 rounded-lg px-2 py-0.5 text-[10px] outline-none cursor-pointer"
          >
            <option value="ALL">All Countries</option>
            {countries.map((c) => (
              <option key={c.country} value={c.country}>
                {c.country}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
          {filteredAnomalies.length === 0 ? (
            <div className="text-[11px] text-slate-500 py-2 text-center">
              No active abnormal telemetry spikes recorded for {anomalyFilterCountry} right now.
            </div>
          ) : (
            filteredAnomalies.map((a) => (
              <div
                key={a.id}
                className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/80 flex items-start justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                    <span>{a.country} ({a.state})</span>
                    <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded border ${getDisasterCodeInfo(a.hazardType).badgeBg} ${getDisasterCodeInfo(a.hazardType).badgeText} ${getDisasterCodeInfo(a.hazardType).badgeBorder}`}>
                      [{getDisasterCodeInfo(a.hazardType).code}] {getDisasterCodeInfo(a.hazardType).name}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-300 mt-0.5">
                    {a.metricObserved}: <strong className="text-cyan-300">{a.currentObserved}</strong> (Normal: {a.baselineNorm})
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-red-950 text-red-400 border border-red-800/80 shrink-0">
                  +{a.deviationSigma}σ SPIKE
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. FLOATING RIGHT DRAWER: DISASTER CARDS QUICK LIST */}
      {showCardsDrawer && (
        <div
          className={`absolute top-20 right-4 bottom-4 w-92 max-w-[90vw] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl z-[1000] flex flex-col overflow-hidden text-xs select-none transition-opacity duration-200 ${
            isDetailModalOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
            <span className="font-extrabold text-white font-mono uppercase text-xs flex items-center gap-1.5">
              <List className="w-4 h-4 text-cyan-400" />
              Disaster Records ({filteredDisasters.length})
            </span>
            <button
              onClick={() => setShowCardsDrawer(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-base font-bold"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredDisasters.map((d) => (
              <div
                key={d.id}
                onClick={() => {
                  openDisasterDetail(d);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([d.coordinates[1], d.coordinates[0]], 6.5, { duration: 1 });
                  }
                }}
                className="p-3 rounded-2xl bg-slate-950/85 border border-slate-800 hover:border-cyan-500 transition cursor-pointer group shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {getHazardIcon(d.type)}
                    <span className={`font-mono font-black text-[10px] px-1.5 py-0.5 rounded border ${getDisasterCodeInfo(d.type).badgeBg} ${getDisasterCodeInfo(d.type).badgeText} ${getDisasterCodeInfo(d.type).badgeBorder}`}>
                      [{getDisasterCodeInfo(d.type).code}] {getDisasterCodeInfo(d.type).name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {d.year && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        {d.year} AD
                      </span>
                    )}
                    <span
                      className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full ${
                        d.status === 'ACTIVE_NOW'
                          ? 'bg-red-600 text-white'
                          : d.status === 'UPCOMING_PREDICTED'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {d.status === 'ACTIVE_NOW' ? 'ACTIVE' : d.status === 'UPCOMING_PREDICTED' ? 'UPCOMING' : 'PAST'}
                    </span>
                  </div>
                </div>

                <h3 className="font-extrabold text-white text-xs mt-1.5 leading-snug group-hover:text-cyan-300 transition">
                  {d.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {d.state_province}, {d.country}
                </p>
                {d.resource_losses && (
                  <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800">
                    <span className="text-rose-400 font-bold truncate max-w-[140px]" title={d.resource_losses.humanLife?.deathsConfirmed}>
                      💀 {d.resource_losses.humanLife?.deathsConfirmed?.split(';')[0]?.split('(')[0] || d.casualties_estimate}
                    </span>
                    <span className="text-yellow-400 font-bold shrink-0">
                      💵 {d.resource_losses.builtAndEconomicResources?.financialLossUSD?.split(' ')[0] || d.economic_damage}
                    </span>
                  </div>
                )}

                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-cyan-400 font-bold">
                  <span className="text-amber-400">{d.magnitude || d.primary_attribute_value?.split('(')[0]}</span>
                  <span className="text-slate-400 font-normal">Click for Details →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. UNIVERSAL HUMAN-ACCESSIBLE DISASTER DETAIL DIALOG MODAL */}
      <DisasterDetailModal
        disaster={activeModalDisaster}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onTest500mAlert={trigger500mProximitySiren}
        onOpenSatelliteGallery={onOpenSatelliteStudio}
      />
    </div>
  );
};
