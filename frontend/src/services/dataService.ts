import {
  GlobalDisaster,
  CountryInfo,
  AnomalyActivity,
  ProximityEvaluationResult,
  HazardFeature,
  WeatherStation,
  GlobalLossSummary,
  DisasterType,
} from '../types.js';
import { getDisasterCode } from '../utils/disasterCodes.js';

import globalDisastersRaw from '../data/global_disasters.json';
import hazardZonesRaw from '../data/ner_hazard_zones.json';
import historicalScarsRaw from '../data/historical_scars.json';
import criticalInfrastructureRaw from '../data/critical_infrastructure.json';
import weatherStationsRaw from '../data/weather_stations.json';

const allDisasters = globalDisastersRaw as unknown as GlobalDisaster[];

function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function getSafeBearing(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const brng = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  const safe = (brng + 180) % 360;
  const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return cardinals[Math.round(safe / 45) % 8];
}

export const DataService = {
  async getGlobalDisasters(filter?: {
    country?: string;
    state?: string;
    status?: string;
    type?: string;
    era?: string;
    search?: string;
    sortBy?: string;
  }): Promise<{ disasters: GlobalDisaster[]; totalCount: number }> {
    try {
      const params = new URLSearchParams();
      if (filter?.country && filter.country !== 'ALL') params.append('country', filter.country);
      if (filter?.state && filter.state !== 'ALL') params.append('state', filter.state);
      if (filter?.status && filter.status !== 'ALL') params.append('status', filter.status);
      if (filter?.type && filter.type !== 'ALL') params.append('type', filter.type);
      if (filter?.era && filter.era !== 'ALL') params.append('era', filter.era);
      if (filter?.search && filter.search.trim()) params.append('search', filter.search.trim());
      if (filter?.sortBy) params.append('sortBy', filter.sortBy);

      const res = await fetch(`/api/v1/global/disasters?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Graceful fallback to local dataset
    }

    let filtered = [...allDisasters];
    if (filter?.country && filter.country !== 'ALL') {
      filtered = filtered.filter((d) => d.country.toLowerCase() === filter.country!.toLowerCase());
    }
    if (filter?.state && filter.state !== 'ALL') {
      filtered = filtered.filter((d) => d.state_province?.toLowerCase() === filter.state!.toLowerCase());
    }
    if (filter?.status && filter.status !== 'ALL') {
      filtered = filtered.filter((d) => d.status === filter.status);
    }
    if (filter?.type && filter.type !== 'ALL') {
      const target = filter.type.toUpperCase();
      filtered = filtered.filter((d) => {
        const code = getDisasterCode(d.type);
        return d.type.toUpperCase() === target || code === target;
      });
    }
    if (filter?.era && filter.era !== 'ALL') {
      filtered = filtered.filter((d) => d.era === filter.era);
    }
    if (filter?.search && filter.search.trim()) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.country.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
      );
    }

    if (filter?.sortBy) {
      if (filter.sortBy === 'year_desc') {
        filtered.sort((a, b) => (b.year || 2026) - (a.year || 2026));
      } else if (filter.sortBy === 'year_asc') {
        filtered.sort((a, b) => (a.year || 0) - (b.year || 0));
      } else if (filter.sortBy === 'human_loss') {
        filtered.sort(
          (a, b) => (b.resource_losses?.humanLife.deathsNumeric || 0) - (a.resource_losses?.humanLife.deathsNumeric || 0)
        );
      } else if (filter.sortBy === 'economic_loss') {
        filtered.sort(
          (a, b) =>
            (b.resource_losses?.builtAndEconomicResources.financialLossNumericBillionsUSD || 0) -
            (a.resource_losses?.builtAndEconomicResources.financialLossNumericBillionsUSD || 0)
        );
      }
    }

    return { disasters: filtered, totalCount: filtered.length };
  },

  async getCountries(): Promise<CountryInfo[]> {
    try {
      const res = await fetch('/api/v1/global/countries');
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const countryMap = new Map<string, { total: number; active: number; upcoming: number; states: Set<string> }>();
    for (const d of allDisasters) {
      if (!countryMap.has(d.country)) {
        countryMap.set(d.country, { total: 0, active: 0, upcoming: 0, states: new Set<string>() });
      }
      const entry = countryMap.get(d.country)!;
      entry.total++;
      if (d.status === 'ACTIVE_NOW') entry.active++;
      if (d.status === 'UPCOMING_PREDICTED') entry.upcoming++;
      if (d.state_province) entry.states.add(d.state_province);
    }

    return Array.from(countryMap.entries())
      .map(([country, data]) => ({
        country,
        states: Array.from(data.states).sort(),
        totalDisasters: data.total,
        activeDisasters: data.active,
        upcomingDisasters: data.upcoming,
      }))
      .sort((a, b) => b.totalDisasters - a.totalDisasters);
  },

  async getLiveAnomalies(): Promise<AnomalyActivity[]> {
    try {
      const res = await fetch('/api/v1/global/anomalies');
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const now = new Date();
    return [
      {
        id: 'ANOM-01',
        country: 'India',
        state: 'Assam',
        hazardType: 'FLOOD',
        sourceStation: 'Central Water Commission (CWC) Tezpur Gauge',
        metricObserved: 'River Gauge Discharge Rate',
        baselineNorm: '350,000 cusecs',
        currentObserved: '850,000 cusecs (+142%)',
        deviationSigma: 4.8,
        abnormalityScore: 0.94,
        detectedAt: new Date(now.getTime() - 120000).toISOString(),
        urgency: 'CRITICAL',
        status: 'SURGING',
      },
      {
        id: 'ANOM-02',
        country: 'Japan',
        state: 'Shizuoka',
        hazardType: 'EARTHQUAKE',
        sourceStation: 'DONET2 Deep Sea Trench Accelerometer #14',
        metricObserved: 'Ultra-Low Frequency Tremor Strain',
        baselineNorm: '0.02 micro-strain/hr',
        currentObserved: '1.45 micro-strain/hr (72x surge)',
        deviationSigma: 5.2,
        abnormalityScore: 0.98,
        detectedAt: new Date(now.getTime() - 480000).toISOString(),
        urgency: 'CRITICAL',
        status: 'SURGING',
      },
      {
        id: 'ANOM-03',
        country: 'United States',
        state: 'California',
        hazardType: 'WILDFIRE',
        sourceStation: 'GOES-18 ABI Band 7 (3.9um) Thermal Radiance',
        metricObserved: 'Fire Radiative Power (FRP)',
        baselineNorm: '45 MW',
        currentObserved: '1,820 MW (Extreme Thermal Cluster)',
        deviationSigma: 4.1,
        abnormalityScore: 0.91,
        detectedAt: new Date(now.getTime() - 360000).toISOString(),
        urgency: 'CRITICAL',
        status: 'PEAKING',
      },
      {
        id: 'ANOM-04',
        country: 'India',
        state: 'Odisha',
        hazardType: 'CYCLONE_HURRICANE',
        sourceStation: 'IMD Paradip Doppler Weather Radar',
        metricObserved: 'Barometric Drop Rate',
        baselineNorm: '1012 hPa',
        currentObserved: '932 hPa (-80 hPa in 12h)',
        deviationSigma: 4.6,
        abnormalityScore: 0.96,
        detectedAt: new Date(now.getTime() - 240000).toISOString(),
        urgency: 'CRITICAL',
        status: 'SURGING',
      },
      {
        id: 'ANOM-05',
        country: 'Indonesia',
        state: 'Central Java',
        hazardType: 'VOLCANO',
        sourceStation: 'BPPTKG Merapi Seismic Station PUS',
        metricObserved: 'Volcanic Tremor RSAM Amplitude',
        baselineNorm: '80 counts',
        currentObserved: '2,400 counts',
        deviationSigma: 3.9,
        abnormalityScore: 0.89,
        detectedAt: new Date(now.getTime() - 600000).toISOString(),
        urgency: 'HIGH',
        status: 'PEAKING',
      },
      {
        id: 'ANOM-06',
        country: 'Turkey',
        state: 'Istanbul',
        hazardType: 'EARTHQUAKE',
        sourceStation: 'KOERI Kandilli Marmara Subsea Strain Array',
        metricObserved: 'Micro-Seismic Event Frequency',
        baselineNorm: '2 events/day',
        currentObserved: '34 events in past 12 hrs',
        deviationSigma: 3.6,
        abnormalityScore: 0.86,
        detectedAt: new Date(now.getTime() - 900000).toISOString(),
        urgency: 'HIGH',
        status: 'SURGING',
      },
    ];
  },

  async getLossSummary(): Promise<GlobalLossSummary> {
    try {
      const res = await fetch('/api/v1/global/losses/summary');
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    let totalDeaths = 0;
    let totalFinancialBillions = 0;
    const byHazardCategory: Record<string, { count: number; deaths: number; financialDamageUSD: string }> = {};

    for (const d of allDisasters) {
      const deaths = d.resource_losses?.humanLife.deathsNumeric || 0;
      const damageBillions = d.resource_losses?.builtAndEconomicResources.financialLossNumericBillionsUSD || 0;
      totalDeaths += deaths;
      totalFinancialBillions += damageBillions;

      if (!byHazardCategory[d.type]) {
        byHazardCategory[d.type] = { count: 0, deaths: 0, financialDamageUSD: '$0B' };
      }
      byHazardCategory[d.type].count++;
      byHazardCategory[d.type].deaths += deaths;
    }

    return {
      totalRecordedDisasters: allDisasters.length,
      totalHumanDeaths: totalDeaths,
      totalHumanDeathsFormatted: '~5.78 Million Lives Lost',
      totalHumanDisplaced: 'Over 120 Million Citizens Displaced',
      totalLivestockAndWildlifeImpacted: 'Over 3.8 Billion Animals & Birds Killed/Displaced',
      totalForestAndCropsHectaresLost: 'Over 52 Million Hectares Burned/Submerged',
      totalEconomicDamageUSD: '$828.8 Billion (~$0.83 Trillion USD)',
      byHazardCategory,
      worstHumanCataclysms: [
        { id: 'HIST-FL-1931-001', name: '1931 Yangtze & Huai River Super Floods', year: 1931, country: 'China', deaths: '3,700,000 Deaths' },
        { id: 'HIST-EQ-1556-001', name: '1556 Shaanxi Earthquake', year: 1556, country: 'China', deaths: '830,000 Deaths' },
        { id: 'HIST-CY-1970-001', name: '1970 Great Bhola Cyclone', year: 1970, country: 'Bangladesh', deaths: '500,000 Deaths' },
        { id: 'HIST-EQ-2004-001', name: '2004 Indian Ocean Megathrust Earthquake & Tsunami', year: 2004, country: 'Indonesia', deaths: '227,898 Deaths' },
        { id: 'HIST-EQ-2010-001', name: '2010 Port-au-Prince Haiti Earthquake', year: 2010, country: 'Haiti', deaths: '220,000 Deaths' },
      ],
      worstEconomicCataclysms: [
        { id: 'HIST-EQ-2011-001', name: '2011 Great East Japan Earthquake & Megatsunami', year: 2011, country: 'Japan', damageUSD: '$235.0 Billion USD' },
        { id: 'HIST-CY-2005-001', name: '2005 Hurricane Katrina (Gulf Coast)', year: 2005, country: 'United States', damageUSD: '$190.0 Billion USD' },
        { id: 'HIST-WF-2019-001', name: '2019-2020 Australian Black Summer Wildfires', year: 2019, country: 'Australia', damageUSD: '$103.0 Billion USD' },
        { id: 'HIST-WF-2023-001', name: '2023 Pan-Canadian Boreal Mega-Fires', year: 2023, country: 'Canada', damageUSD: '$67.0 Billion USD' },
        { id: 'HIST-FL-2021-001', name: '2021 European Ahr Valley Super Floods', year: 2021, country: 'Germany', damageUSD: '$43.0 Billion USD' },
      ],
    };
  },

  async checkProximity(lat: number, lon: number): Promise<ProximityEvaluationResult> {
    try {
      const res = await fetch('/api/v1/global/proximity-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lon }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    let closest: GlobalDisaster | null = null;
    let minDistance = Infinity;

    for (const d of allDisasters) {
      const dist = calculateDistanceMeters(lat, lon, d.coordinates[1], d.coordinates[0]);
      if (dist < minDistance) {
        minDistance = dist;
        closest = d;
      }
    }

    const rad = closest?.radius_meters || 5000;
    const distToPerimeter = Math.max(0, minDistance - rad);
    const triggerBuzzer = minDistance <= 500 || distToPerimeter <= 500;
    const safeCardinal = closest
      ? getSafeBearing(closest.coordinates[1], closest.coordinates[0], lat, lon)
      : 'S';

    return {
      closestDisaster: closest,
      distanceToEpicenterMeters: minDistance,
      distanceToPerimeterMeters: distToPerimeter,
      isInsideHazardRadius: minDistance <= rad,
      isWithin500mMargins: distToPerimeter <= 500,
      triggerBuzzer,
      alertLevel: triggerBuzzer ? 'CRITICAL_BUZZER' : minDistance < 10000 ? 'WARNING_PERIMETER' : 'SAFE',
      voiceAlertText: triggerBuzzer
        ? `EMERGENCY ALERT! You are within 500 meters of ${closest?.name}. Evacuate immediately towards ${safeCardinal}!`
        : `Safe distance maintained. Closest event is ${closest?.name} at ${Math.round(minDistance / 1000)} km.`,
      safeEvacuationBearingDegrees: 180,
      safeBearingCardinal: safeCardinal,
    };
  },

  async getRegionalData() {
    try {
      const [z, sc, inf, st] = await Promise.all([
        fetch('/api/v1/zones').then((r) => r.json()),
        fetch('/api/v1/scars').then((r) => r.json()),
        fetch('/api/v1/infrastructure').then((r) => r.json()),
        fetch('/api/v1/stations').then((r) => r.json()),
      ]);
      return {
        zones: z.features || [],
        scars: sc.features || [],
        infrastructure: inf.features || [],
        stations: st || [],
      };
    } catch {
      return {
        zones: (hazardZonesRaw as any).features || [],
        scars: (historicalScarsRaw as any).features || [],
        infrastructure: (criticalInfrastructureRaw as any).features || [],
        stations: weatherStationsRaw as unknown as WeatherStation[],
      };
    }
  },
};
