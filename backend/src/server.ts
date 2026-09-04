import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import * as turf from '@turf/turf';

import { SimulationEngine } from './services/simulationEngine.js';
import { evaluateDynamicRisk } from './algorithms/dynamicTrigger.js';
import { calculateFactorOfSafety } from './algorithms/slopeStability.js';
import { evaluate500mProximity, DisasterGeoPoint } from './algorithms/proximityEngine.js';
import { generateLiveAnomalies } from './algorithms/anomalyDetector.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Load mock datasets
const dataDir = path.resolve(__dirname, 'data');
const hazardZonesGeoJson = JSON.parse(fs.readFileSync(path.join(dataDir, 'ner_hazard_zones.json'), 'utf8'));
const historicalScarsGeoJson = JSON.parse(fs.readFileSync(path.join(dataDir, 'historical_scars.json'), 'utf8'));
const infrastructureGeoJson = JSON.parse(fs.readFileSync(path.join(dataDir, 'critical_infrastructure.json'), 'utf8'));
const weatherStations = JSON.parse(fs.readFileSync(path.join(dataDir, 'weather_stations.json'), 'utf8'));
const globalDisasters: DisasterGeoPoint[] = JSON.parse(fs.readFileSync(path.join(dataDir, 'global_disasters.json'), 'utf8'));

// Initialize Simulation Engine
const simulationEngine = new SimulationEngine(hazardZonesGeoJson);

// In-memory crowdsourced incident reports store
const incidentReports: any[] = [
  {
    id: 'RPT-2026-001',
    reportedAt: new Date(Date.now() - 3600000).toISOString(),
    latitude: 27.135,
    longitude: 88.499,
    hazardType: 'Road Cutting Mudslip',
    severity: 'MODERATE',
    roadBlocked: true,
    highway: 'NH-10',
    description: 'Minor rock debris and mud blocking one lane near 29th Mile. BRO JCB spotted clearing.',
    reporterRole: 'PWD Field Engineer',
    syncStatus: 'SYNCED',
  }
];

// Create HTTP and WebSocket servers
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/api/v1/ws/alerts' });

// Handle WebSocket connections
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  clients.add(ws);
  // Send current simulation snapshot on connect
  ws.send(JSON.stringify({
    type: 'INITIAL_STATE',
    data: simulationEngine.getSimulationState()
  }));

  ws.on('close', () => clients.delete(ws));
  ws.on('error', () => clients.delete(ws));
});

// Broadcast simulation updates to all connected clients
simulationEngine.onUpdate((state) => {
  const payload = JSON.stringify({ type: 'SIMULATION_UPDATE', data: state });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
});

// --- REST Endpoints ---

// 1. Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'NER-LEWS Core Engine',
    version: '1.0.0',
    ministry: 'MDoNER (Ministry of Development of North Eastern Region)',
    problemStatement: 'SIH26001',
    timestamp: new Date().toISOString(),
    connectedClients: clients.size,
  });
});

// 2. Spatial Hazard Zones with Real-Time Dynamic States
app.get('/api/v1/zones', (req, res) => {
  const simState = simulationEngine.getSimulationState();
  const zoneStateMap = new Map(simState.zones.map(z => [z.zoneId, z]));

  // Merge static GeoJSON with real-time dynamic properties
  const enrichedFeatures = hazardZonesGeoJson.features.map((feature: any) => {
    const live = zoneStateMap.get(feature.properties.zone_id);
    return {
      ...feature,
      properties: {
        ...feature.properties,
        liveState: live || null,
        currentAlertLevel: live ? live.evalResult.alertLevel : 'GREEN',
        currentDti: live ? live.evalResult.dynamicTriggerIndex : 0.1,
        currentFoS: live ? live.currentFoS.factorOfSafety : 1.8,
        currentRu: live ? live.porePressureRatioRu : 0.12,
        currentRainfall24h: live ? live.rainfall24h : 20.0,
      }
    };
  });

  res.json({
    type: 'FeatureCollection',
    features: enrichedFeatures,
    simulationContext: {
      hour: simState.hour,
      scenario: simState.scenario,
    }
  });
});

// 3. Historical GSI Landslide Scars
app.get('/api/v1/scars', (req, res) => {
  res.json(historicalScarsGeoJson);
});

// 4. Critical Infrastructure & Shelters
app.get('/api/v1/infrastructure', (req, res) => {
  res.json(infrastructureGeoJson);
});

// 5. Weather Station Telemetry
app.get('/api/v1/stations', (req, res) => {
  res.json(weatherStations);
});

// 6. Point-in-Polygon Risk Evaluation API
app.post('/api/v1/risk/evaluate', (req, res) => {
  const { latitude, longitude, rainfall1h, rainfall24h } = req.body;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ error: 'Valid latitude and longitude numbers are required.' });
  }

  const queryPoint = turf.point([longitude, latitude]);
  let matchedZone: any = null;

  for (const feature of hazardZonesGeoJson.features) {
    if (turf.booleanPointInPolygon(queryPoint, feature as any)) {
      matchedZone = feature;
      break;
    }
  }

  if (!matchedZone) {
    return res.json({
      status: 'GREEN',
      isInsideHazardZone: false,
      message: 'Location lies outside designated steep slope high-susceptibility microzones.',
      dti: 0.12,
      alertLevel: 'GREEN',
      recommendedAction: 'Normal baseline precautions.',
    });
  }

  const p = matchedZone.properties;
  const live = simulationEngine.getZone(p.zone_id);

  res.json({
    isInsideHazardZone: true,
    zoneId: p.zone_id,
    zoneName: p.name,
    district: p.district,
    state: p.state,
    slopeDegrees: p.mean_slope_degrees,
    susceptibilityScore: p.susceptibility_score,
    lithology: p.lithology,
    criticalInfra: p.critical_infra,
    liveEvaluation: live ? live.evalResult : null,
    currentFoS: live ? live.currentFoS : null,
    capXml: live ? live.capXml : null,
    compactSms: live ? live.compactSms : null,
  });
});

// 7. Simulation Control (Change Scenario & Playback Time)
app.post('/api/v1/simulation/control', (req, res) => {
  const { scenario, hour } = req.body;

  if (scenario && ['NORMAL', 'MONSOON_SURGE', 'CLOUDBURST'].includes(scenario)) {
    simulationEngine.setScenario(scenario);
  }

  if (typeof hour === 'number') {
    simulationEngine.setSimulationHour(hour);
  }

  res.json({
    success: true,
    message: 'Simulation updated successfully.',
    state: simulationEngine.getSimulationState(),
  });
});

// 8. Crowdsourced Field Incident Reporting
app.post('/api/v1/crowdsource/report', (req, res) => {
  const { latitude, longitude, hazardType, severity, roadBlocked, highway, description, reporterRole, photoBase64 } = req.body;

  const newReport = {
    id: `RPT-2026-${String(incidentReports.length + 1).padStart(3, '0')}`,
    reportedAt: new Date().toISOString(),
    latitude: Number(latitude) || 27.2,
    longitude: Number(longitude) || 88.5,
    hazardType: hazardType || 'Tension Crack / Ground Slump',
    severity: severity || 'MODERATE',
    roadBlocked: Boolean(roadBlocked),
    highway: highway || 'NH-10',
    description: description || 'Visual observation of active slope movement reported by local citizen.',
    reporterRole: reporterRole || 'Citizen / Gram Panchayat Member',
    hasPhoto: Boolean(photoBase64),
    syncStatus: 'SYNCED',
  };

  incidentReports.unshift(newReport);

  // Broadcast new report to connected command center clients
  const wsMsg = JSON.stringify({ type: 'NEW_INCIDENT_REPORT', data: newReport });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(wsMsg);
    }
  }

  res.status(201).json({
    success: true,
    message: 'Incident report recorded and synced successfully with District Control Room.',
    report: newReport,
  });
});

app.get('/api/v1/crowdsource/reports', (req, res) => {
  res.json(incidentReports);
});

// 9. Download OASIS CAP v1.2 XML for a given zone
app.get('/api/v1/alerts/cap/:zoneId', (req, res) => {
  const zone = simulationEngine.getZone(req.params.zoneId);
  if (!zone) {
    return res.status(404).send('Zone not found');
  }

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Content-Disposition', `attachment; filename=CAP_ALERT_${zone.zoneId}.xml`);
  res.send(zone.capXml);
});

// --- GLOBAL MULTI-HAZARD & 500M PROXIMITY ENDPOINTS ---

// 10. Country & State Hierarchy Directory
app.get('/api/v1/global/countries', (req, res) => {
  const countryMap = new Map<string, { states: Set<string>; totalDisasters: number; active: number; upcoming: number }>();

  for (const d of globalDisasters) {
    if (!countryMap.has(d.country)) {
      countryMap.set(d.country, { states: new Set<string>(), totalDisasters: 0, active: 0, upcoming: 0 });
    }
    const c = countryMap.get(d.country)!;
    c.states.add(d.state_province);
    c.totalDisasters++;
    if (d.status === 'ACTIVE_NOW') c.active++;
    if (d.status === 'UPCOMING_PREDICTED') c.upcoming++;
  }

  const result = Array.from(countryMap.entries()).map(([country, info]) => ({
    country,
    states: Array.from(info.states),
    totalDisasters: info.totalDisasters,
    activeDisasters: info.active,
    upcomingDisasters: info.upcoming,
  }));

  res.json(result);
});

// 11. Multi-Hazard Disaster Query (Country, State, Status, Type, Era, Search, Year Range)
app.get('/api/v1/global/disasters', (req, res) => {
  const { country, state, status, type, era, search, minYear, maxYear, sortBy } = req.query;

  let filtered = [...globalDisasters];

  if (country && country !== 'ALL') {
    filtered = filtered.filter((d) => d.country.toLowerCase() === String(country).toLowerCase());
  }

  if (state && state !== 'ALL') {
    filtered = filtered.filter((d) => d.state_province.toLowerCase() === String(state).toLowerCase());
  }

  if (status && status !== 'ALL') {
    filtered = filtered.filter((d) => d.status === status);
  }

  if (type && type !== 'ALL') {
    const t = String(type).toUpperCase();
    filtered = filtered.filter((d) => {
      if (d.type === t) return true;
      if (t === 'LS' && d.type === 'LANDSLIDE') return true;
      if (t === 'EQ' && d.type === 'EARTHQUAKE') return true;
      if (t === 'FL' && d.type === 'FLOOD') return true;
      if (t === 'TS' && d.type === 'TSUNAMI') return true;
      if (t === 'CY' && d.type === 'CYCLONE_HURRICANE') return true;
      if (t === 'WF' && d.type === 'WILDFIRE') return true;
      if (t === 'VO' && d.type === 'VOLCANO') return true;
      if (t === 'CB' && d.type === 'CLOUDBURST') return true;
      if (t === 'CA' && d.type === 'COSMIC_ATMOSPHERIC') return true;
      return false;
    });
  }

  if (era && era !== 'ALL') {
    filtered = filtered.filter((d) => (d as any).era === era);
  }

  if (minYear) {
    const minY = Number(minYear);
    filtered = filtered.filter((d) => (d as any).year && (d as any).year >= minY);
  }

  if (maxYear) {
    const maxY = Number(maxYear);
    filtered = filtered.filter((d) => (d as any).year && (d as any).year <= maxY);
  }

  if (search) {
    const q = String(search).toLowerCase().trim();
    filtered = filtered.filter((d) =>
      d.name.toLowerCase().includes(q) ||
      d.country.toLowerCase().includes(q) ||
      d.state_province.toLowerCase().includes(q) ||
      d.type.toLowerCase().includes(q) ||
      (d as any).description?.toLowerCase().includes(q) ||
      String((d as any).year || '').includes(q) ||
      (q === 'ls' && d.type === 'LANDSLIDE') ||
      (q === 'eq' && d.type === 'EARTHQUAKE') ||
      (q === 'fl' && d.type === 'FLOOD') ||
      (q === 'ts' && d.type === 'TSUNAMI') ||
      (q === 'cy' && d.type === 'CYCLONE_HURRICANE') ||
      (q === 'wf' && d.type === 'WILDFIRE') ||
      (q === 'vo' && d.type === 'VOLCANO') ||
      (q === 'cb' && d.type === 'CLOUDBURST') ||
      (q === 'ca' && d.type === 'COSMIC_ATMOSPHERIC')
    );
  }

  if (sortBy) {
    if (sortBy === 'year_desc') {
      filtered.sort((a: any, b: any) => (b.year || 0) - (a.year || 0));
    } else if (sortBy === 'year_asc') {
      filtered.sort((a: any, b: any) => (a.year || 0) - (b.year || 0));
    } else if (sortBy === 'abnormality') {
      filtered.sort((a: any, b: any) => (b.abnormality_score || 0) - (a.abnormality_score || 0));
    } else if (sortBy === 'rainfall_abnormality') {
      filtered.sort((a: any, b: any) => Math.abs(b.rainfall_abnormality_mm || 0) - Math.abs(a.rainfall_abnormality_mm || 0));
    } else if (sortBy === 'human_loss') {
      filtered.sort((a: any, b: any) => (b.resource_losses?.humanLife?.deathsNumeric || 0) - (a.resource_losses?.humanLife?.deathsNumeric || 0));
    } else if (sortBy === 'economic_loss') {
      filtered.sort((a: any, b: any) => (b.resource_losses?.builtAndEconomicResources?.financialLossNumericBillionsUSD || 0) - (a.resource_losses?.builtAndEconomicResources?.financialLossNumericBillionsUSD || 0));
    }
  }

  res.json({
    totalCount: filtered.length,
    disasters: filtered,
  });
});

// 11b. Global Historical Archive Summary
app.get('/api/v1/global/historical/summary', (req, res) => {
  const historical = globalDisasters.filter((d) => d.status === 'PAST_HISTORICAL');
  const eraCounts: Record<string, number> = {
    RECENT_2020_2026: 0,
    CONTEMPORARY_2000_2019: 0,
    CENTURY_20TH: 0,
    ANCIENT_PRE1900: 0,
  };
  const typeCounts: Record<string, number> = {};
  const continentCounts: Record<string, number> = {};

  for (const d of historical) {
    const era = (d as any).era || 'CENTURY_20TH';
    eraCounts[era] = (eraCounts[era] || 0) + 1;

    typeCounts[d.type] = (typeCounts[d.type] || 0) + 1;
    const cont = (d as any).continent || 'Global';
    continentCounts[cont] = (continentCounts[cont] || 0) + 1;
  }

  res.json({
    totalHistorical: historical.length,
    eraCounts,
    typeCounts,
    continentCounts,
    deadliestBenchMarks: [
      { name: '1931 Central China Yangtze River Floods', casualties: '~3,700,000 deaths', type: 'FLOOD' },
      { name: '1556 Shaanxi Earthquake', casualties: '~830,000 deaths', type: 'EARTHQUAKE' },
      { name: '1970 Great Bhola Cyclone', casualties: '~500,000 deaths', type: 'CYCLONE_HURRICANE' },
      { name: '2004 Indian Ocean Tsunami', casualties: '227,898 deaths', type: 'TSUNAMI' },
      { name: '1815 Mount Tambora Eruption', casualties: '71,000+ deaths (Global Volcanic Winter)', type: 'VOLCANO' }
    ]
  });
});

// 11c. Comprehensive Global Disaster Resource & Life Loss Audit Summary
app.get('/api/v1/global/losses/summary', (req, res) => {
  let totalDeaths = 0;
  let totalDisplacedEstimated = 0;
  let totalFinancialBillions = 0;
  const byHazardCategory: Record<string, { count: number; deaths: number; financialDamageUSD: string }> = {};

  for (const d of globalDisasters) {
    const losses = (d as any).resource_losses;
    const deaths = losses?.humanLife?.deathsNumeric || 0;
    const finBillions = losses?.builtAndEconomicResources?.financialLossNumericBillionsUSD || 0;

    totalDeaths += deaths;
    totalFinancialBillions += finBillions;

    if (!byHazardCategory[d.type]) {
      byHazardCategory[d.type] = { count: 0, deaths: 0, financialDamageUSD: '$0.0 Billion' };
    }
    byHazardCategory[d.type].count++;
    byHazardCategory[d.type].deaths += deaths;
  }

  // Format financial damage by hazard category
  for (const cat in byHazardCategory) {
    const subset = globalDisasters.filter(d => d.type === cat);
    const subTotal = subset.reduce((acc, curr) => acc + ((curr as any).resource_losses?.builtAndEconomicResources?.financialLossNumericBillionsUSD || 0), 0);
    byHazardCategory[cat].financialDamageUSD = `$${subTotal.toFixed(1)} Billion`;
  }

  // Worst Cataclysms
  const sortedByDeaths = [...globalDisasters]
    .filter(d => (d as any).resource_losses?.humanLife?.deathsNumeric > 0)
    .sort((a, b) => ((b as any).resource_losses?.humanLife?.deathsNumeric || 0) - ((a as any).resource_losses?.humanLife?.deathsNumeric || 0))
    .slice(0, 5)
    .map(d => ({
      id: d.id,
      name: d.name,
      year: (d as any).year,
      country: d.country,
      deaths: (d as any).resource_losses?.humanLife?.deathsConfirmed || (d as any).casualties_estimate
    }));

  const sortedByDamage = [...globalDisasters]
    .filter(d => (d as any).resource_losses?.builtAndEconomicResources?.financialLossNumericBillionsUSD > 0)
    .sort((a, b) => ((b as any).resource_losses?.builtAndEconomicResources?.financialLossNumericBillionsUSD || 0) - ((a as any).resource_losses?.builtAndEconomicResources?.financialLossNumericBillionsUSD || 0))
    .slice(0, 5)
    .map(d => ({
      id: d.id,
      name: d.name,
      year: (d as any).year,
      country: d.country,
      damageUSD: (d as any).resource_losses?.builtAndEconomicResources?.financialLossUSD || (d as any).economic_damage
    }));

  res.json({
    totalRecordedDisasters: globalDisasters.length,
    totalHumanDeaths: totalDeaths,
    totalHumanDeathsFormatted: totalDeaths > 1000000 ? `~${(totalDeaths / 1000000).toFixed(2)} Million Lives Lost` : `${totalDeaths.toLocaleString()} Lives Lost`,
    totalHumanDisplaced: "Over 120 Million Citizens Displaced",
    totalLivestockAndWildlifeImpacted: "Over 3.8 Billion Animals & Birds Killed/Displaced",
    totalForestAndCropsHectaresLost: "Over 52 Million Hectares Burned/Submerged",
    totalEconomicDamageUSD: `$${totalFinancialBillions.toFixed(1)} Billion (~$${(totalFinancialBillions / 1000).toFixed(2)} Trillion USD)`,
    byHazardCategory,
    worstHumanCataclysms: sortedByDeaths,
    worstEconomicCataclysms: sortedByDamage
  });
});

// 11c. Multi-Temporal Before & After Satellite Imagery
app.get('/api/v1/global/before-after-imagery', (req, res) => {
  const { disasterId } = req.query;
  const data = [
    {
      id: "BA-001",
      disasterId: "HIST-EQ-2004-001",
      disasterName: "2004 Indian Ocean Megathrust Tsunami",
      location: "Banda Aceh, Sumatra",
      country: "Indonesia",
      year: 2004,
      hazardType: "TSUNAMI",
      beforeDescription: "Dense, vibrant coastal city framed by lush tropical palm forests and emerald green agricultural plains right up to the shoreline.",
      afterDescription: "Total stripping of landscape. A 3-kilometer-wide dead zone where all trees, soil, and buildings were scoured to bare brown earth and bedrock.",
      metric: "3.2 km Inland Scour"
    },
    {
      id: "BA-002",
      disasterId: "HIST-EQ-2011-001",
      disasterName: "2011 Great East Japan Earthquake & Megatsunami",
      location: "Sendai Plains & Rikuzentakata",
      country: "Japan",
      year: 2011,
      hazardType: "TSUNAMI",
      beforeDescription: "Protective 10m seawalls, Takata-Matsubara pine forest with 70,000 trees, geometric rice paddies, and orderly fishing ports.",
      afterDescription: "Seawalls shattered. 560 sq km inky black ocean of seawater; 69,999 of 70,000 pine trees snapped like matchsticks; 1.2m coastal subsidence.",
      metric: "561 km² Submerged"
    },
    {
      id: "BA-003",
      disasterId: "HIST-FL-2013-001",
      disasterName: "2013 Kedarnath Himalayan Cloudburst & GLOF",
      location: "Kedarnath & Rambara, Uttarakhand",
      country: "India",
      year: 2013,
      hazardType: "CLOUDBURST",
      beforeDescription: "High-altitude Chorabari glacial lake behind natural moraine wall above Kedarnath. Green alpine valley with pilgrim trails.",
      afterDescription: "Moraine dam burst open, leaving empty crater. 15-meter-deep grey boulder scar around temple; entire settlement of Rambara erased.",
      metric: "100% Lake Breach / Rambara Erased"
    },
    {
      id: "BA-004",
      disasterId: "HIST-LS-2024-001",
      disasterName: "2024 Wayanad Catastrophic Monsoon Debris Flows",
      location: "Chooralmala & Mundakkai, Kerala",
      country: "India",
      year: 2024,
      hazardType: "LANDSLIDE",
      beforeDescription: "Dense green rainforest canopy transitioning into manicured, terraced tea and cardamom plantations.",
      afterDescription: "8-kilometer-long raw red-mud scar. Riverbed widened from 15m to over 150m (10x); Chooralmala bridge sheared away.",
      metric: "8.0 km Debris Scar"
    },
    {
      id: "BA-005",
      disasterId: "HIST-VO-1980-001",
      disasterName: "1980 Mount St. Helens Lateral Blast & Debris Avalanche",
      location: "Skamania County, Washington",
      country: "United States",
      year: 1980,
      hazardType: "VOLCANO",
      beforeDescription: "Snow-capped, conical volcano (2,950m) encircled by old-growth Douglas fir forests and crystal-clear Spirit Lake.",
      afterDescription: "Entire northern flank missing; horseshoe-shaped caldera; summit reduced by 400m; 600 sq km of ancient forest flattened like toothpicks.",
      metric: "400m Summit Lost"
    },
    {
      id: "BA-006",
      disasterId: "HIST-FL-2022-001",
      disasterName: "2022 Pakistan Indus Super Flood ('Monsoon on Steroids')",
      location: "Sindh & Balochistan",
      country: "Pakistan",
      year: 2022,
      hazardType: "FLOOD",
      beforeDescription: "Dry, tan desert soils with narrow, meandering blue ribbons representing the Indus River and its irrigation canals.",
      afterDescription: "Gigantic inland sea over 100 kilometers wide. What was dry farmland turned into dark standing water covering one-third of nation.",
      metric: "100 km Inland Sea"
    },
    {
      id: "BA-007",
      disasterId: "DIS-TR-001",
      disasterName: "2023 Kahramanmaraş Earthquake Fault Rupture",
      location: "East Anatolian Fault, Kahramanmaraş",
      country: "Turkey",
      year: 2023,
      hazardType: "EARTHQUAKE",
      beforeDescription: "Continuous agricultural fields, straight olive-tree orchard rows, unbroken asphalt highways, and high-speed railway tracks.",
      afterDescription: "3-to-4-meter lateral offset slicing cleanly through Earth's surface. Roads and railways shifted sideways by 4m; buildings collapsed.",
      metric: "3.5 to 4.2m Lateral Offset"
    },
    {
      id: "BA-008",
      disasterId: "HIST-WF-2019-001",
      disasterName: "2019–20 Australian 'Black Summer' Wildfires",
      location: "New South Wales & Victoria",
      country: "Australia",
      year: 2019,
      hazardType: "WILDFIRE",
      beforeDescription: "Solid dark green canopy across the Great Dividing Range eucalyptus forests, indicating dense, moisture-rich vegetation.",
      afterDescription: "Over 24 million hectares showed negative NDVI, appearing as scorched charcoal-black burn scars with towering pyrocumulonimbus plumes.",
      metric: "24.3M Hectares Burned"
    }
  ];

  if (disasterId) {
    const match = data.find((d) => d.disasterId === String(disasterId));
    return res.json(match || null);
  }

  res.json(data);
});

// 12. Hyper-Local 500-Meter Proximity & Emergency Buzzer Check
app.post('/api/v1/global/proximity-check', (req, res) => {
  const { latitude, longitude } = req.body;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ error: 'Valid latitude and longitude numbers are required.' });
  }

  const proximityResult = evaluate500mProximity(latitude, longitude, globalDisasters);

  // If 500m threshold is breached, publish emergency alarm to WebSocket
  if (proximityResult.triggerBuzzer) {
    const wsAlert = JSON.stringify({
      type: 'PROXIMITY_BUZZER_TRIGGER',
      data: {
        userLat: latitude,
        userLon: longitude,
        disaster: proximityResult.closestDisaster,
        distanceMeters: proximityResult.distanceToEpicenterMeters,
        voiceAlertText: proximityResult.voiceAlertText,
        safeBearing: proximityResult.safeBearingCardinal,
      }
    });

    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(wsAlert);
      }
    }
  }

  res.json(proximityResult);
});

// 13. Real-Time Global Anomaly Stream
app.get('/api/v1/global/anomalies', (req, res) => {
  res.json(generateLiveAnomalies());
});

// 14. Serve Frontend Single Page Application (SPA)
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

server.listen(port, () => {
  console.log(`[NER-LEWS] Server running on http://localhost:${port}`);
  console.log(`[NER-LEWS] WebSocket Alerts Hub on ws://localhost:${port}/api/v1/ws/alerts`);
});

