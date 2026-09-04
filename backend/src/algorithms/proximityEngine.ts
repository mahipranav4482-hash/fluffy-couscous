/**
 * Hyper-Local 500-Meter Proximity & Emergency Buzzer Engine
 * Evaluates real-time distance between citizen coordinates and active disaster centroids/perimeters.
 */

export interface DisasterGeoPoint {
  id: string;
  name: string;
  type: string;
  country: string;
  state_province: string;
  coordinates: [number, number]; // [lon, lat]
  radius_meters: number;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'ADVISORY';
  status: 'ACTIVE_NOW' | 'UPCOMING_PREDICTED' | 'PAST_HISTORICAL';
  emergencyDirectives: string;
  [key: string]: any;
}

export interface ProximityEvaluation {
  closestDisaster: DisasterGeoPoint | null;
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

/**
 * Calculates great-circle distance between two coordinates on Earth in meters using the Haversine formula.
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Mean Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Calculates the forward azimuth / bearing from Point A to Point B in degrees (0 - 360)
 */
export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);
  return Math.round(((theta * 180) / Math.PI + 360) % 360);
}

export function degreesToCardinal(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

/**
 * Evaluates proximity against all active and upcoming disasters on Earth.
 * If user is within 500 meters of the disaster's epicenter or boundary perimeter,
 * it triggers the high-decibel emergency audio buzzer flag.
 */
export function evaluate500mProximity(
  userLat: number,
  userLon: number,
  disasters: DisasterGeoPoint[]
): ProximityEvaluation {
  // Filter only active or upcoming threats (exclude past historical)
  const activeDisasters = disasters.filter((d) => d.status !== 'PAST_HISTORICAL');

  if (activeDisasters.length === 0) {
    return {
      closestDisaster: null,
      distanceToEpicenterMeters: 9999999,
      distanceToPerimeterMeters: 9999999,
      isInsideHazardRadius: false,
      isWithin500mMargins: false,
      triggerBuzzer: false,
      alertLevel: 'SAFE',
      voiceAlertText: 'All monitored zones operating at baseline safety.',
      safeEvacuationBearingDegrees: 0,
      safeBearingCardinal: 'N',
    };
  }

  let minDistanceEpicenter = Infinity;
  let minDistancePerimeter = Infinity;
  let closest: DisasterGeoPoint = activeDisasters[0];

  for (const d of activeDisasters) {
    const distToCenter = calculateHaversineDistanceMeters(
      userLat,
      userLon,
      d.coordinates[1],
      d.coordinates[0]
    );

    const distToPerimeter = Math.max(0, distToCenter - d.radius_meters);

    if (distToCenter < minDistanceEpicenter) {
      minDistanceEpicenter = distToCenter;
      minDistancePerimeter = distToPerimeter;
      closest = d;
    }
  }

  // Check 500-meter rule:
  // User is within 500m of the epicenter OR within 500m outside the active danger perimeter
  const isInside = minDistanceEpicenter <= closest.radius_meters;
  const isWithin500m = isInside || minDistancePerimeter <= 500 || minDistanceEpicenter <= 500;

  // Opposite bearing for evacuation (pointing directly away from epicenter)
  const bearingToDanger = calculateBearing(userLat, userLon, closest.coordinates[1], closest.coordinates[0]);
  const safeBearing = (bearingToDanger + 180) % 360;

  let alertLevel: ProximityEvaluation['alertLevel'] = 'SAFE';
  let triggerBuzzer = false;
  let voicePrompt = '';

  if (isWithin500m) {
    alertLevel = 'CRITICAL_BUZZER';
    triggerBuzzer = true;
    const distanceDisplay = Math.round(isInside ? minDistanceEpicenter : minDistancePerimeter);
    voicePrompt = `EMERGENCY ALERT! You are within ${distanceDisplay} meters of the ${closest.name} impact zone. Immediate catastrophic danger. Evacuate heading ${degreesToCardinal(safeBearing)} immediately!`;
  } else if (minDistancePerimeter <= 3000) {
    alertLevel = 'WARNING_PERIMETER';
    voicePrompt = `WARNING: Approaching high hazard perimeter for ${closest.name}. Prepare for potential evacuation.`;
  } else if (minDistancePerimeter <= 10000) {
    alertLevel = 'REGIONAL_ADVISORY';
    voicePrompt = `Advisory: ${closest.name} active in your region. Monitor official broadcasts.`;
  } else {
    alertLevel = 'SAFE';
    voicePrompt = 'Location outside immediate danger zones.';
  }

  return {
    closestDisaster: closest,
    distanceToEpicenterMeters: minDistanceEpicenter,
    distanceToPerimeterMeters: minDistancePerimeter,
    isInsideHazardRadius: isInside,
    isWithin500mMargins: isWithin500m,
    triggerBuzzer,
    alertLevel,
    voiceAlertText: voicePrompt,
    safeEvacuationBearingDegrees: safeBearing,
    safeBearingCardinal: degreesToCardinal(safeBearing),
  };
}
