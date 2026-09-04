// Utility functions and standardized short codes for simple disaster categorization
// e.g. Landslide -> LS, Earthquake -> EQ, Flood -> FL, Tsunami -> TS, etc.

export interface DisasterCodeDefinition {
  code: string;
  name: string;
  shortLabel: string;
  fullLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  pinColor: string;
  description: string;
}

export const DISASTER_CODES_MAP: Record<string, DisasterCodeDefinition> = {
  LANDSLIDE: {
    code: 'LS',
    name: 'Landslide',
    shortLabel: 'LS',
    fullLabel: 'LS • Landslide',
    badgeBg: 'bg-amber-950/80',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-700/80',
    pinColor: '#d97706',
    description: 'Mass slope failure & debris avalanche',
  },
  EARTHQUAKE: {
    code: 'EQ',
    name: 'Earthquake',
    shortLabel: 'EQ',
    fullLabel: 'EQ • Earthquake',
    badgeBg: 'bg-rose-950/80',
    badgeText: 'text-rose-400',
    badgeBorder: 'border-rose-700/80',
    pinColor: '#e11d48',
    description: 'Tectonic fault rupture & seismic shockwave',
  },
  FLOOD: {
    code: 'FL',
    name: 'Flood',
    shortLabel: 'FL',
    fullLabel: 'FL • Flood',
    badgeBg: 'bg-blue-950/80',
    badgeText: 'text-blue-400',
    badgeBorder: 'border-blue-700/80',
    pinColor: '#2563eb',
    description: 'Riverine overflow & flash inundation',
  },
  TSUNAMI: {
    code: 'TS',
    name: 'Tsunami',
    shortLabel: 'TS',
    fullLabel: 'TS • Tsunami',
    badgeBg: 'bg-cyan-950/80',
    badgeText: 'text-cyan-400',
    badgeBorder: 'border-cyan-700/80',
    pinColor: '#0891b2',
    description: 'Sub-sea megathrust ocean surge',
  },
  CYCLONE_HURRICANE: {
    code: 'CY',
    name: 'Cyclone / Hurricane',
    shortLabel: 'CY',
    fullLabel: 'CY • Cyclone',
    badgeBg: 'bg-teal-950/80',
    badgeText: 'text-teal-300',
    badgeBorder: 'border-teal-700/80',
    pinColor: '#0d9488',
    description: 'Tropical cyclone, typhoon & storm surge',
  },
  WILDFIRE: {
    code: 'WF',
    name: 'Wildfire',
    shortLabel: 'WF',
    fullLabel: 'WF • Wildfire',
    badgeBg: 'bg-orange-950/80',
    badgeText: 'text-orange-400',
    badgeBorder: 'border-orange-700/80',
    pinColor: '#ea580c',
    description: 'Forest mega-conflagration & bushfire',
  },
  VOLCANO: {
    code: 'VO',
    name: 'Volcano',
    shortLabel: 'VO',
    fullLabel: 'VO • Volcano',
    badgeBg: 'bg-red-950/80',
    badgeText: 'text-red-400',
    badgeBorder: 'border-red-700/80',
    pinColor: '#dc2626',
    description: 'Plinian caldera eruption & pyroclastic density',
  },
  CLOUDBURST: {
    code: 'CB',
    name: 'Cloudburst',
    shortLabel: 'CB',
    fullLabel: 'CB • Cloudburst',
    badgeBg: 'bg-indigo-950/80',
    badgeText: 'text-indigo-400',
    badgeBorder: 'border-indigo-700/80',
    pinColor: '#4f46e5',
    description: 'High-intensity convective deluge (>100mm/hr)',
  },
  COSMIC_ATMOSPHERIC: {
    code: 'CA',
    name: 'Cosmic / Space Weather',
    shortLabel: 'CA',
    fullLabel: 'CA • Cosmic / Atmospheric',
    badgeBg: 'bg-yellow-950/80',
    badgeText: 'text-yellow-400',
    badgeBorder: 'border-yellow-700/80',
    pinColor: '#ca8a04',
    description: 'Solar geomagnetic storm & bolide airburst',
  },
};

export const getDisasterCode = (type?: string): string => {
  if (!type) return 'DS';
  const key = type.toUpperCase();
  return DISASTER_CODES_MAP[key]?.code || key.slice(0, 2);
};

export const getDisasterCodeInfo = (type?: string): DisasterCodeDefinition => {
  if (!type) {
    return {
      code: 'DS',
      name: 'Disaster',
      shortLabel: 'DS',
      fullLabel: 'DS • Disaster',
      badgeBg: 'bg-slate-800',
      badgeText: 'text-slate-300',
      badgeBorder: 'border-slate-700',
      pinColor: '#64748b',
      description: 'General hazard event',
    };
  }
  const key = type.toUpperCase();
  if (DISASTER_CODES_MAP[key]) {
    return DISASTER_CODES_MAP[key];
  }

  // Fallback if type matches partial
  if (key.includes('LANDSLIDE')) return DISASTER_CODES_MAP.LANDSLIDE;
  if (key.includes('EARTHQUAKE')) return DISASTER_CODES_MAP.EARTHQUAKE;
  if (key.includes('FLOOD')) return DISASTER_CODES_MAP.FLOOD;
  if (key.includes('TSUNAMI')) return DISASTER_CODES_MAP.TSUNAMI;
  if (key.includes('CYCLONE') || key.includes('HURRICANE') || key.includes('TYPHOON')) return DISASTER_CODES_MAP.CYCLONE_HURRICANE;
  if (key.includes('WILD') || key.includes('FIRE')) return DISASTER_CODES_MAP.WILDFIRE;
  if (key.includes('VOLCAN')) return DISASTER_CODES_MAP.VOLCANO;
  if (key.includes('CLOUD') || key.includes('BURST')) return DISASTER_CODES_MAP.CLOUDBURST;
  if (key.includes('COSMIC') || key.includes('SOLAR')) return DISASTER_CODES_MAP.COSMIC_ATMOSPHERIC;

  return {
    code: key.slice(0, 2),
    name: type,
    shortLabel: key.slice(0, 2),
    fullLabel: `${key.slice(0, 2)} • ${type}`,
    badgeBg: 'bg-slate-800',
    badgeText: 'text-slate-300',
    badgeBorder: 'border-slate-700',
    pinColor: '#64748b',
    description: type,
  };
};

// Standard simple legend items for UI header/legend strips
export const ALL_DISASTER_CODE_LEGENDS: DisasterCodeDefinition[] = [
  DISASTER_CODES_MAP.LANDSLIDE,          // LS
  DISASTER_CODES_MAP.EARTHQUAKE,          // EQ
  DISASTER_CODES_MAP.FLOOD,               // FL
  DISASTER_CODES_MAP.TSUNAMI,             // TS
  DISASTER_CODES_MAP.CYCLONE_HURRICANE,   // CY
  DISASTER_CODES_MAP.WILDFIRE,            // WF
  DISASTER_CODES_MAP.VOLCANO,             // VO
  DISASTER_CODES_MAP.CLOUDBURST,          // CB
  DISASTER_CODES_MAP.COSMIC_ATMOSPHERIC,  // CA
];
