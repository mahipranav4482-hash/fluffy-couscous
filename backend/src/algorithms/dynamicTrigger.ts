/**
 * Dynamic Trigger Index (DTI) & Empirical Intensity-Duration (I-D) Thresholds
 * Calibrated specifically for the geomorphology of the North Eastern Region (NER).
 */

export interface HydrologicalObservation {
  rainfall1hMm: number;        // Instantaneous hourly rainfall
  rainfall24hMm: number;       // Cumulative 24-hour rainfall
  rainfall72hMm: number;       // Cumulative 72-hour rainfall
  antecedentRainfall15dMm: number; // 15-day Antecedent Rainfall Index (ARI)
  soilSaturationPct: number;   // Volumetric soil moisture saturation percentage (0 - 100%)
  insarDisplacementMmPerWeek: number; // Ground deformation velocity from Sentinel-1 SAR
}

export interface TerrainVulnerability {
  susceptibilityScore: number; // Baseline static susceptibility index (0.0 to 1.0)
  slopeDegrees: number;        // Slope angle in degrees
  lithologyClass: string;      // Structural unit (e.g., 'Phyllites and Schists', 'Sandstone')
}

export type AlertLevel = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';

export interface AlertEvaluationResult {
  alertLevel: AlertLevel;
  dynamicTriggerIndex: number;
  idThresholdExceeded: boolean;
  thresholdIntensityMmPerHr: number;
  actualIntensityMmPerHr: number;
  actionRequired: string;
  recommendedEvacStage: 'NONE' | 'STANDBY_ALERT' | 'ROAD_CLOSURE_ADVISORY' | 'MANDATORY_EVACUATION';
}

/**
 * Empirical I-D Threshold for Eastern Himalayas (GSI / CSTEP regional calibration):
 * I = α * D^(-β) where α = 18.5, β = 0.52
 * D in hours, I in mm/hour.
 */
export function calculateIDThreshold(durationHours: number): number {
  const alpha = 18.5;
  const beta = 0.52;
  const effectiveDuration = Math.max(1, durationHours);
  return alpha * Math.pow(effectiveDuration, -beta);
}

/**
 * Compute the Dynamic Trigger Index (DTI)
 * Scales between 0.0 (baseline dry) and > 1.0 (extreme trigger event)
 */
export function evaluateDynamicRisk(
  hydro: HydrologicalObservation,
  terrain: TerrainVulnerability
): AlertEvaluationResult {
  // 1. Normalized hydrological contributions
  const norm1h = hydro.rainfall1hMm / 35.0;            // 35 mm/h is torrential cloudburst
  const norm24h = hydro.rainfall24hMm / 115.0;         // 115 mm/24h is IMD Heavy Rain threshold
  const normAri = hydro.antecedentRainfall15dMm / 280.0; // 280 mm saturated threshold
  const normInSar = Math.abs(hydro.insarDisplacementMmPerWeek) / 4.0; // 4 mm/week deformation

  // Weighted composite dynamic trigger
  const rawTrigger = (
    norm1h * 0.30 +
    norm24h * 0.40 +
    normAri * 0.15 +
    normInSar * 0.15
  );

  // Terrain vulnerability multiplier (amplifies response on steeper/shattered rock slopes)
  // Low: 0.7x, Mod: 1.0x, High: 1.3x, Very High: 1.6x
  const terrainMultiplier = 0.6 + terrain.susceptibilityScore * 1.0;
  const dynamicTriggerIndex = Math.min(1.5, Math.round(rawTrigger * terrainMultiplier * 100) / 100);

  // 2. Check Empirical 24-hour I-D Curve
  const mean24hIntensity = hydro.rainfall24hMm / 24.0;
  const idThreshold24h = calculateIDThreshold(24);
  const idThresholdExceeded = mean24hIntensity >= idThreshold24h || hydro.rainfall1hMm >= calculateIDThreshold(1);

  // 3. Multi-tier Alert Arbitrator
  let alertLevel: AlertLevel = 'GREEN';
  let action = 'Normal conditions. Regular periodic hydrological monitoring.';
  let evacStage: AlertEvaluationResult['recommendedEvacStage'] = 'NONE';

  if (dynamicTriggerIndex >= 0.85 || (idThresholdExceeded && dynamicTriggerIndex >= 0.70)) {
    alertLevel = 'RED';
    action = 'CRITICAL: Imminent slope collapse failure detected. Trigger immediate evacuation of vulnerable settlements, shut down NH corridors, and sound emergency sirens.';
    evacStage = 'MANDATORY_EVACUATION';
  } else if (dynamicTriggerIndex >= 0.65 || idThresholdExceeded) {
    alertLevel = 'ORANGE';
    action = 'WARNING: Heavy saturation and high trigger threshold breached. Mobilize NDRF/SDRF staging units, alert BRO for debris clearance, and advise vulnerable downslope residences.';
    evacStage = 'ROAD_CLOSURE_ADVISORY';
  } else if (dynamicTriggerIndex >= 0.45) {
    alertLevel = 'YELLOW';
    action = 'ADVISORY: Elevated soil saturation and steady rainfall. Increase automated sensor telemetry polling to 15-minute intervals.';
    evacStage = 'STANDBY_ALERT';
  }

  return {
    alertLevel,
    dynamicTriggerIndex,
    idThresholdExceeded,
    thresholdIntensityMmPerHr: Math.round(idThreshold24h * 100) / 100,
    actualIntensityMmPerHr: Math.round(mean24hIntensity * 100) / 100,
    actionRequired: action,
    recommendedEvacStage: evacStage,
  };
}
