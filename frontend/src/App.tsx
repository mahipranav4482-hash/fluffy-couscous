import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header.js';
import { TerrainMap } from './components/TerrainMap.js';
import { CellInspector } from './components/CellInspector.js';
import { SimulationControls } from './components/SimulationControls.js';
import { AlertCenter } from './components/AlertCenter.js';
import { CrowdsourceModal } from './components/CrowdsourceModal.js';
import { OfflinePwaView } from './components/OfflinePwaView.js';
import { GlobalDisasterView } from './components/GlobalDisasterView.js';
import { HistoricalArchiveView } from './components/HistoricalArchiveView.js';
import { DisasterDetailModal } from './components/DisasterDetailModal.js';
import { EmergencyBuzzerModal } from './components/EmergencyBuzzerModal.js';
import { BeforeAfterGalleryModal } from './components/BeforeAfterGalleryModal.js';
import {
  HazardFeature,
  SimulatedZoneState,
  SimulationState,
  WeatherStation,
  ProximityEvaluationResult,
  GlobalDisaster,
} from './types.js';

export const App: React.FC = () => {
  const [zones, setZones] = useState<HazardFeature[]>([]);
  const [scars, setScars] = useState<any[]>([]);
  const [infrastructure, setInfrastructure] = useState<any[]>([]);
  const [weatherStations, setWeatherStations] = useState<WeatherStation[]>([]);
  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [selectedZone, setSelectedZone] = useState<SimulatedZoneState | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('SIKKIM');
  const [wsConnected, setWsConnected] = useState<boolean>(false);

  // Operating Mode: Default to 'GLOBAL_MONITOR', or switch to 'HISTORICAL_ARCHIVE' or 'REGIONAL_LEWS'
  const [activeMode, setActiveMode] = useState<'REGIONAL_LEWS' | 'GLOBAL_MONITOR' | 'HISTORICAL_ARCHIVE'>('GLOBAL_MONITOR');

  // Modals, Focused Disaster & 500m Proximity Alarm state
  const [isAlertCenterOpen, setIsAlertCenterOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPwaViewOpen, setIsPwaViewOpen] = useState(false);
  const [isBuzzerModalOpen, setIsBuzzerModalOpen] = useState(false);
  const [isSatelliteGalleryOpen, setIsSatelliteGalleryOpen] = useState(false);
  const [galleryDisasterId, setGalleryDisasterId] = useState<string | undefined>(undefined);
  const [proximityAlertResult, setProximityAlertResult] = useState<ProximityEvaluationResult | null>(null);
  const [focusedHistoricalDisaster, setFocusedHistoricalDisaster] = useState<GlobalDisaster | null>(null);
  const [selectedArchiveDisaster, setSelectedArchiveDisaster] = useState<GlobalDisaster | null>(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);

  // Fetch initial datasets
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [zonesRes, scarsRes, infraRes, stationsRes] = await Promise.all([
          fetch('/api/v1/zones').then((r) => r.json()),
          fetch('/api/v1/scars').then((r) => r.json()),
          fetch('/api/v1/infrastructure').then((r) => r.json()),
          fetch('/api/v1/stations').then((r) => r.json()),
        ]);

        setZones(zonesRes.features || []);
        setScars(scarsRes.features || []);
        setInfrastructure(infraRes.features || []);
        setWeatherStations(stationsRes || []);

        if (zonesRes.features && zonesRes.features.length > 0) {
          const firstLive = zonesRes.features[0].properties.liveState;
          if (firstLive) setSelectedZone(firstLive);
        }
      } catch (err) {
        console.error('Error fetching initial GIS data:', err);
      }
    };

    fetchData();
  }, []);

  // WebSocket connection for real-time alerts and proximity triggers
  useEffect(() => {
    const connectWs = () => {
      const wsUrl = `ws://${window.location.hostname}:5000/api/v1/ws/alerts`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'INITIAL_STATE' || message.type === 'SIMULATION_UPDATE') {
            const newState: SimulationState = message.data;
            setSimState(newState);

            // Update zone features live state
            if (newState.zones) {
              const zoneMap = new Map(newState.zones.map((z) => [z.zoneId, z]));
              setZones((prev) =>
                prev.map((f) => {
                  const live = zoneMap.get(f.properties.zone_id);
                  return live
                    ? {
                        ...f,
                        properties: {
                          ...f.properties,
                          liveState: live,
                          currentAlertLevel: live.evalResult.alertLevel,
                          currentDti: live.evalResult.dynamicTriggerIndex,
                          currentFoS: live.currentFoS.factorOfSafety,
                        },
                      }
                    : f;
                })
              );

              setSelectedZone((prev) => {
                if (!prev) return newState.zones[0] || null;
                const updated = zoneMap.get(prev.zoneId);
                return updated || prev;
              });
            }
          } else if (message.type === 'PROXIMITY_BUZZER_TRIGGER') {
            // Live broadcast of a 500m proximity breach
            setProximityAlertResult({
              closestDisaster: message.data.disaster,
              distanceToEpicenterMeters: message.data.distanceMeters,
              distanceToPerimeterMeters: Math.max(0, message.data.distanceMeters - (message.data.disaster?.radius_meters || 0)),
              isInsideHazardRadius: true,
              isWithin500mMargins: true,
              triggerBuzzer: true,
              alertLevel: 'CRITICAL_BUZZER',
              voiceAlertText: message.data.voiceAlertText,
              safeEvacuationBearingDegrees: 180,
              safeBearingCardinal: message.data.safeBearing || 'S',
            });
            setIsBuzzerModalOpen(true);
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        setTimeout(connectWs, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    };

    connectWs();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const handleUpdateSimulation = async (
    scenario: 'NORMAL' | 'MONSOON_SURGE' | 'CLOUDBURST',
    hour: number
  ) => {
    try {
      await fetch('/api/v1/simulation/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario, hour }),
      });
    } catch (err) {
      console.error('Failed to update simulation:', err);
    }
  };

  const handleSubmitReport = async (reportData: any) => {
    await fetch('/api/v1/crowdsource/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });
  };

  // Quick 500m proximity alarm simulator trigger
  const handleTest500mAlert = async () => {
    try {
      // Test location: coordinates ~248m from Mount Merapi volcano
      const res = await fetch('/api/v1/global/proximity-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: -7.542, longitude: 110.441 }),
      });
      const data: ProximityEvaluationResult = await res.json();
      setProximityAlertResult(data);
      setIsBuzzerModalOpen(true);
    } catch (err) {
      console.error('500m proximity test failed:', err);
    }
  };

  // Open the Multi-Temporal Before & After Satellite Studio
  const handleOpenSatelliteStudio = (disasterId?: string) => {
    setGalleryDisasterId(disasterId);
    setIsSatelliteGalleryOpen(true);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Application Bar with Earth vs Regional Switcher & 500m Alert Test Button */}
      <Header
        simState={simState}
        wsConnected={wsConnected}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onTogglePwaView={() => setIsPwaViewOpen(!isPwaViewOpen)}
        isPwaViewOpen={isPwaViewOpen}
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        onTest500mAlert={handleTest500mAlert}
        onOpenSatelliteStudio={() => handleOpenSatelliteStudio()}
      />

      {/* Main Workspace Render */}
      {activeMode === 'GLOBAL_MONITOR' ? (
        /* 1. Global Earth Multi-Hazard View (All Countries, States, Anomalies, 500m Proximity) */
        <GlobalDisasterView
          onTriggerProximityAlert={(res) => {
            setProximityAlertResult(res);
            setIsBuzzerModalOpen(true);
          }}
          onOpenHistoricalArchive={() => setActiveMode('HISTORICAL_ARCHIVE')}
          onOpenSatelliteStudio={handleOpenSatelliteStudio}
          focusedDisaster={focusedHistoricalDisaster}
        />
      ) : activeMode === 'HISTORICAL_ARCHIVE' ? (
        /* 2. Comprehensive Historical Disaster & Abnormality Archive (Till Date) */
        <HistoricalArchiveView
          onSelectDisaster={(d) => {
            setSelectedArchiveDisaster(d);
            setIsArchiveModalOpen(true);
          }}
          onLocateOnMap={(d) => {
            setFocusedHistoricalDisaster(d);
            setActiveMode('GLOBAL_MONITOR');
          }}
          onOpenSatelliteStudio={handleOpenSatelliteStudio}
        />
      ) : (
        /* 3. Specialized NER-LEWS 3D Slope Physics & InSAR Terrain Mode */
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex overflow-hidden relative">
            <TerrainMap
              zones={zones}
              selectedZone={selectedZone}
              onSelectZone={(z) => setSelectedZone(z)}
              selectedRegion={selectedRegion}
              weatherStations={weatherStations}
              historicalScars={scars}
              infrastructure={infrastructure}
            />

            <CellInspector
              zone={selectedZone}
              onClose={() => setSelectedZone(null)}
            />
          </div>

          <SimulationControls
            simState={simState}
            onUpdateSimulation={handleUpdateSimulation}
          />
        </div>
      )}

      {/* 500-Meter Emergency Audio Siren & Evacuation Modal */}
      <EmergencyBuzzerModal
        proximityResult={proximityAlertResult}
        isOpen={isBuzzerModalOpen}
        onClose={() => setIsBuzzerModalOpen(false)}
      />

      {/* Historical Disaster Universal Dialog Modal */}
      <DisasterDetailModal
        disaster={selectedArchiveDisaster}
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onOpenSatelliteGallery={handleOpenSatelliteStudio}
        onTest500mAlert={async (targetDisaster) => {
          const testLat = targetDisaster.coordinates[1] + 0.0025;
          const testLon = targetDisaster.coordinates[0];
          try {
            const res = await fetch('/api/v1/global/proximity-check', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ latitude: testLat, longitude: testLon }),
            });
            const data: ProximityEvaluationResult = await res.json();
            setProximityAlertResult(data);
            setIsBuzzerModalOpen(true);
          } catch (err) {
            console.error('Proximity test failed:', err);
          }
        }}
      />

      {/* Live Multi-Temporal Before & After Satellite Studio Gallery Modal */}
      <BeforeAfterGalleryModal
        isOpen={isSatelliteGalleryOpen}
        onClose={() => setIsSatelliteGalleryOpen(false)}
        initialDisasterId={galleryDisasterId}
      />

      {/* Other Modals & Dialogs */}
      <AlertCenter
        zones={simState?.zones || []}
        isOpen={isAlertCenterOpen}
        onClose={() => setIsAlertCenterOpen(false)}
      />

      <CrowdsourceModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitReport={handleSubmitReport}
      />

      <OfflinePwaView
        isOpen={isPwaViewOpen}
        onClose={() => setIsPwaViewOpen(false)}
        activeZone={selectedZone}
      />
    </div>
  );
};
