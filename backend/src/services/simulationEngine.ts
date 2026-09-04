/**
 * Real-Time Dynamic Simulation Engine
 * Simulates evolving monsoonal conditions, cloudburst events, and sensor feeds across the NER.
 */

import { evaluateDynamicRisk, AlertEvaluationResult } from '../algorithms/dynamicTrigger.js';
import { calculateFactorOfSafety, FactorOfSafetyResult } from '../algorithms/slopeStability.js';
import { generateCapXml, generateCompactSmsPayload } from './capAlertGenerator.js';

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
  currentFoS: FactorOfSafetyResult;
  evalResult: AlertEvaluationResult;
  capXml: string;
  compactSms: string;
  coordinates: [number, number][];
}

export class SimulationEngine {
  private zones: Map<string, SimulatedZoneState> = new Map();
  private simulationHour: number = 0; // 0 to 24 hours
  private scenario: 'NORMAL' | 'MONSOON_SURGE' | 'CLOUDBURST' = 'NORMAL';
  private listeners: ((event: any) => void)[] = [];

  constructor(rawGeoJson: any) {
    this.initializeZones(rawGeoJson);
  }

  public initializeZones(geoJson: any) {
    this.zones.clear();
    for (const feature of geoJson.features) {
      const p = feature.properties;
      const coords = feature.geometry.coordinates[0] as [number, number][];

      // Initial baseline values
      const initialRain1h = 2.5;
      const initialRain24h = 28.0;
      const initialRain72h = 50.0;
      const initialAri = 95.0;
      const initialSat = 45.0;
      const initialInSar = -0.5;
      const initialRu = 0.12;

      const fosResult = calculateFactorOfSafety(
        {
          cohesionKPa: p.soil_cohesion_kpa || 15.0,
          frictionAngleDeg: p.friction_angle_deg || 30.0,
          soilUnitWeightKNm3: 19.0,
          waterUnitWeightKNm3: 9.81,
          failurePlaneDepthM: 2.5,
        },
        {
          slopeAngleDeg: p.mean_slope_degrees || 35.0,
          porePressureRatioRu: initialRu,
        }
      );

      const evalResult = evaluateDynamicRisk(
        {
          rainfall1hMm: initialRain1h,
          rainfall24hMm: initialRain24h,
          rainfall72hMm: initialRain72h,
          antecedentRainfall15dMm: initialAri,
          soilSaturationPct: initialSat,
          insarDisplacementMmPerWeek: initialInSar,
        },
        {
          susceptibilityScore: p.susceptibility_score || 0.7,
          slopeDegrees: p.mean_slope_degrees || 35.0,
          lithologyClass: p.lithology || 'Schists and Phyllites',
        }
      );

      const state: SimulatedZoneState = {
        zoneId: p.zone_id,
        name: p.name,
        state: p.state,
        district: p.district,
        rainfall1h: initialRain1h,
        rainfall24h: initialRain24h,
        rainfall72h: initialRain72h,
        antecedentRainfall: initialAri,
        soilSaturationPct: initialSat,
        insarVelocityMmPerWeek: initialInSar,
        porePressureRatioRu: initialRu,
        currentFoS: fosResult,
        evalResult: evalResult,
        capXml: '',
        compactSms: '',
        coordinates: coords,
      };

      state.capXml = generateCapXml({
        alertId: `${state.zoneId}-${Date.now()}`,
        zoneId: state.zoneId,
        zoneName: state.name,
        district: state.district,
        state: state.state,
        coordinatesPolygon: state.coordinates,
        evalResult: state.evalResult,
        currentRainfall24h: state.rainfall24h,
        porePressureRatioRu: state.porePressureRatioRu,
      });

      state.compactSms = generateCompactSmsPayload({
        alertId: `${state.zoneId}-${Date.now()}`,
        zoneId: state.zoneId,
        zoneName: state.name,
        district: state.district,
        state: state.state,
        coordinatesPolygon: state.coordinates,
        evalResult: state.evalResult,
        currentRainfall24h: state.rainfall24h,
        porePressureRatioRu: state.porePressureRatioRu,
      });

      this.zones.set(p.zone_id, state);
    }
  }

  public setScenario(scenario: 'NORMAL' | 'MONSOON_SURGE' | 'CLOUDBURST') {
    this.scenario = scenario;
    this.recalculateAll();
  }

  public setSimulationHour(hour: number) {
    this.simulationHour = Math.max(0, Math.min(24, hour));
    this.recalculateAll();
  }

  public getSimulationState() {
    return {
      hour: this.simulationHour,
      scenario: this.scenario,
      zones: Array.from(this.zones.values()),
    };
  }

  public getZone(zoneId: string): SimulatedZoneState | undefined {
    return this.zones.get(zoneId);
  }

  public onUpdate(callback: (event: any) => void) {
    this.listeners.push(callback);
  }

  private notify() {
    const payload = this.getSimulationState();
    for (const cb of this.listeners) {
      cb(payload);
    }
  }

  private recalculateAll() {
    const hourFactor = this.simulationHour / 24.0;

    for (const [zoneId, z] of this.zones.entries()) {
      let rainMultiplier = 1.0;
      let ruMultiplier = 1.0;
      let insarAccel = 1.0;

      if (this.scenario === 'NORMAL') {
        rainMultiplier = 1.0 + hourFactor * 0.2;
        ruMultiplier = 1.0 + hourFactor * 0.1;
      } else if (this.scenario === 'MONSOON_SURGE') {
        rainMultiplier = 1.8 + hourFactor * 1.5;
        ruMultiplier = 1.4 + hourFactor * 0.8;
        insarAccel = 2.0;
      } else if (this.scenario === 'CLOUDBURST') {
        // High impact concentrated on NH-10 and Burtuk/Gangtok sectors
        const isEpicenter = zoneId.includes('NH10') || zoneId.includes('GTK') || zoneId.includes('SOH');
        const epicenterBoost = isEpicenter ? 3.5 : 1.5;
        rainMultiplier = 2.5 + hourFactor * 3.2 * epicenterBoost;
        ruMultiplier = 2.0 + hourFactor * 1.6 * (isEpicenter ? 1.4 : 1.0);
        insarAccel = isEpicenter ? 5.0 : 2.5;
      }

      z.rainfall1h = Math.round((3.0 * rainMultiplier) * 10) / 10;
      z.rainfall24h = Math.round((30.0 * rainMultiplier) * 10) / 10;
      z.rainfall72h = Math.round((60.0 + z.rainfall24h * 1.2) * 10) / 10;
      z.antecedentRainfall = Math.round((100.0 + z.rainfall72h * 0.7) * 10) / 10;
      z.soilSaturationPct = Math.min(99.0, Math.round((45.0 + 50.0 * (z.rainfall24h / 180.0))));
      z.porePressureRatioRu = Math.min(0.48, Math.round((0.12 * ruMultiplier) * 100) / 100);
      z.insarVelocityMmPerWeek = Math.round((-0.8 * insarAccel * (1 + hourFactor)) * 10) / 10;

      // Recompute FoS
      z.currentFoS = calculateFactorOfSafety(
        {
          cohesionKPa: 14.0,
          frictionAngleDeg: 29.0,
          soilUnitWeightKNm3: 19.5,
          waterUnitWeightKNm3: 9.81,
          failurePlaneDepthM: 2.8,
        },
        {
          slopeAngleDeg: zoneId.includes('NH10') ? 42.5 : zoneId.includes('GTK') ? 44.0 : 36.0,
          porePressureRatioRu: z.porePressureRatioRu,
        }
      );

      // Recompute Alert
      z.evalResult = evaluateDynamicRisk(
        {
          rainfall1hMm: z.rainfall1h,
          rainfall24hMm: z.rainfall24h,
          rainfall72hMm: z.rainfall72h,
          antecedentRainfall15dMm: z.antecedentRainfall,
          soilSaturationPct: z.soilSaturationPct,
          insarDisplacementMmPerWeek: z.insarVelocityMmPerWeek,
        },
        {
          susceptibilityScore: zoneId.includes('NH10') ? 0.94 : 0.82,
          slopeDegrees: zoneId.includes('NH10') ? 42.5 : 36.0,
          lithologyClass: 'Chlorite-Sericite Schists',
        }
      );

      // Regenerate CAP & SMS
      z.capXml = generateCapXml({
        alertId: `${z.zoneId}-${this.simulationHour}`,
        zoneId: z.zoneId,
        zoneName: z.name,
        district: z.district,
        state: z.state,
        coordinatesPolygon: z.coordinates,
        evalResult: z.evalResult,
        currentRainfall24h: z.rainfall24h,
        porePressureRatioRu: z.porePressureRatioRu,
      });

      z.compactSms = generateCompactSmsPayload({
        alertId: `${z.zoneId}-${this.simulationHour}`,
        zoneId: z.zoneId,
        zoneName: z.name,
        district: z.district,
        state: z.state,
        coordinatesPolygon: z.coordinates,
        evalResult: z.evalResult,
        currentRainfall24h: z.rainfall24h,
        porePressureRatioRu: z.porePressureRatioRu,
      });
    }

    this.notify();
  }
}
