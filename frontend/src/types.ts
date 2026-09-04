export type AlertLevel = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';

export interface HazardZoneProperties {
  zone_id: string;
  name: string;
  state: string;
  district: string;
  susceptibility_class: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  susceptibility_score: number;
  mean_slope_degrees: number;
  lithology: string;
  drainage_density_km2: number;
  critical_infra: string;
  currentAlertLevel?: AlertLevel;
  currentDti?: number;
  currentFoS?: number;
  currentRu?: number;
  currentRainfall24h?: number;
  liveState?: SimulatedZoneState;
}

export interface HazardFeature {
  type: 'Feature';
  properties: HazardZoneProperties;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface SimulatedZoneState {
  zoneId: string;
  name: string;
  state: string;
  district: string;
  rainfall1h: number;
  rainfall24h: number;
  rainfall72h: number;
  antecedentRainfall: number;
  soilSaturationPct: number;
  insarVelocityMmPerWeek: number;
  porePressureRatioRu: number;
  currentFoS: {
    factorOfSafety: number;
    isStable: boolean;
    failureRiskCategory: 'STABLE' | 'MARGINALLY_STABLE' | 'IMMINENT_FAILURE' | 'ACTIVE_FAILURE';
    resistingShearStressKPa: number;
    drivingShearStressKPa: number;
  };
  evalResult: {
    alertLevel: AlertLevel;
    dynamicTriggerIndex: number;
    idThresholdExceeded: boolean;
    thresholdIntensityMmPerHr: number;
    actualIntensityMmPerHr: number;
    actionRequired: string;
    recommendedEvacStage: string;
  };
  capXml: string;
  compactSms: string;
  coordinates: [number, number][];
}

export interface SimulationState {
  hour: number;
  scenario: 'NORMAL' | 'MONSOON_SURGE' | 'CLOUDBURST';
  zones: SimulatedZoneState[];
}

export interface IncidentReport {
  id: string;
  reportedAt: string;
  latitude: number;
  longitude: number;
  hazardType: string;
  severity: string;
  roadBlocked: boolean;
  highway: string;
  description: string;
  reporterRole: string;
  hasPhoto: boolean;
  syncStatus: string;
}

export interface WeatherStation {
  station_id: string;
  name: string;
  coordinates: [number, number];
  elevation_m: number;
  rainfall_1h_mm: number;
  rainfall_24h_mm: number;
  soil_moisture_pct: number;
  insar_deformation_mm_week: number;
  status: string;
}

// --- GLOBAL MULTI-HAZARD TYPES ---

export type DisasterType =
  | 'EARTHQUAKE'
  | 'CYCLONE_HURRICANE'
  | 'FLOOD'
  | 'WILDFIRE'
  | 'TSUNAMI'
  | 'VOLCANO'
  | 'LANDSLIDE'
  | 'CLOUDBURST'
  | 'COSMIC_ATMOSPHERIC';

export type DisasterStatus = 'ACTIVE_NOW' | 'UPCOMING_PREDICTED' | 'PAST_HISTORICAL';

export interface GlobalDisaster {
  id: string;
  name: string;
  type: DisasterType;
  country: string;
  state_province: string;
  continent: string;
  coordinates: [number, number]; // [lon, lat]
  radius_meters: number;
  status: DisasterStatus;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'ADVISORY';
  abnormality_score: number;
  metrics: Record<string, any>;
  timestamp: string;
  affectedPopulation: number;
  description: string;
  emergencyDirectives: string;
  primary_attribute_label?: string;
  primary_attribute_value?: string;
  magnitude?: string;
  started_at?: string;
  ended_at?: string;
  duration_text?: string;
  rainfall_normal_mm?: number;
  rainfall_actual_mm?: number;
  rainfall_abnormality_mm?: number;
  plain_language_action_steps?: string[];
  year?: number;
  era?: 'ANCIENT_PRE1900' | 'CENTURY_20TH' | 'CONTEMPORARY_2000_2019' | 'RECENT_2020_2026';
  casualties_estimate?: string;
  economic_damage?: string;
  resource_losses?: ResourceLossReport;
}

export interface ResourceLossReport {
  humanLife: {
    deathsConfirmed: string;
    deathsNumeric: number;
    injuredToll: string;
    displacedHomeless: string;
    missingPersons?: string;
    vulnerableImpact?: string;
    summary: string;
  };
  animalsAndWildlife: {
    livestockDeaths: string;
    wildlifeCasualties: string;
    endangeredSpeciesImpact?: string;
    habitatDestroyedKm2?: string;
    summary: string;
  };
  plantsAndVegetation: {
    forestLossHectares: string;
    cropsDestroyedAcres: string;
    timberOrTreeMortality?: string;
    agriculturalLossValue?: string;
    summary: string;
  };
  naturalResources: {
    freshwaterImpact: string;
    soilErosionTopsoilLoss: string;
    marineAndEcologicalLoss?: string;
    carbonEmissionsOrPollution?: string;
    summary: string;
  };
  builtAndEconomicResources: {
    housingUnitsDestroyed: string;
    criticalInfrastructureLoss: string;
    financialLossUSD: string;
    financialLossNumericBillionsUSD: number;
    economicSectorsParalyzed?: string;
    summary: string;
  };
  overallEcologicalSeverity: 'CATASTROPHIC' | 'SEVERE' | 'MODERATE' | 'LOCALIZED';
  restorationTimelineYears: string;
}

export interface GlobalLossSummary {
  totalRecordedDisasters: number;
  totalHumanDeaths: number;
  totalHumanDeathsFormatted: string;
  totalHumanDisplaced: string;
  totalLivestockAndWildlifeImpacted: string;
  totalForestAndCropsHectaresLost: string;
  totalEconomicDamageUSD: string;
  byHazardCategory: Record<string, { count: number; deaths: number; financialDamageUSD: string }>;
  worstHumanCataclysms: Array<{ id: string; name: string; year: number; country: string; deaths: string }>;
  worstEconomicCataclysms: Array<{ id: string; name: string; year: number; country: string; damageUSD: string }>;
}

export interface CountryInfo {
  country: string;
  states: string[];
  totalDisasters: number;
  activeDisasters: number;
  upcomingDisasters: number;
}

export interface ProximityEvaluationResult {
  closestDisaster: GlobalDisaster | null;
  distanceToEpicenterMeters: number;
  distanceToPerimeterMeters: number;
  isInsideHazardRadius: boolean;
  isWithin500mMargins: boolean;
  triggerBuzzer: boolean;
  alertLevel: 'CRITICAL_BUZZER' | 'WARNING_PERIMETER' | 'REGIONAL_ADVISORY' | 'SAFE';
  voiceAlertText: string;
  safeEvacuationBearingDegrees: number;
  safeBearingCardinal: string;
}

export interface AnomalyActivity {
  id: string;
  country: string;
  state: string;
  hazardType: string;
  sourceStation: string;
  metricObserved: string;
  baselineNorm: string;
  currentObserved: string;
  deviationSigma: number;
  abnormalityScore: number;
  detectedAt: string;
  urgency: 'HIGH' | 'CRITICAL';
  status: 'SURGING' | 'PEAKING' | 'SUBSIDING';
}
