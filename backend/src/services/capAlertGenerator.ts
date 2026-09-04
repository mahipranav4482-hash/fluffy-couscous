/**
 * Common Alerting Protocol (OASIS CAP v1.2) Generator
 * Compliant with C-DOT SACHET / NDMA (India) Emergency Alert Specifications.
 * Also generates ultra-compact Reverse-SMS binary strings for low-bandwidth 2G/EDGE areas.
 */

import { AlertEvaluationResult, AlertLevel } from '../algorithms/dynamicTrigger.js';

export interface AlertContext {
  alertId: string;
  zoneId: string;
  zoneName: string;
  district: string;
  state: string;
  coordinatesPolygon: [number, number][]; // [[lon, lat], ...]
  evalResult: AlertEvaluationResult;
  currentRainfall24h: number;
  porePressureRatioRu: number;
}

export function generateCapXml(ctx: AlertContext): string {
  const sentTime = new Date().toISOString();
  const expiresTime = new Date(Date.now() + 6 * 3600 * 1000).toISOString(); // 6 hours validity

  const severityMap: Record<AlertLevel, string> = {
    GREEN: 'Minor',
    YELLOW: 'Moderate',
    ORANGE: 'Severe',
    RED: 'Extreme',
  };

  const urgencyMap: Record<AlertLevel, string> = {
    GREEN: 'Past',
    YELLOW: 'Future',
    ORANGE: 'Expected',
    RED: 'Immediate',
  };

  // CAP polygon format: "lat,lon lat,lon ..."
  const polygonStr = ctx.coordinatesPolygon
    .map(([lon, lat]) => `${lat.toFixed(4)},${lon.toFixed(4)}`)
    .join(' ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>MDoNER-LEWS-${ctx.alertId}</identifier>
  <sender>lews-engine@mdoner.gov.in</sender>
  <sent>${sentTime}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Geo</category>
    <event>Rainfall-Triggered Landslide Hazard</event>
    <urgency>${urgencyMap[ctx.evalResult.alertLevel]}</urgency>
    <severity>${severityMap[ctx.evalResult.alertLevel]}</severity>
    <certainty>Observed</certainty>
    <eventCode>
      <valueName>SAME</valueName>
      <value>LSW</value>
    </eventCode>
    <expires>${expiresTime}</expires>
    <headline>${ctx.evalResult.alertLevel} ALERT: ${ctx.zoneName} (${ctx.district}, ${ctx.state})</headline>
    <description>${ctx.evalResult.actionRequired} 24h Rain: ${ctx.currentRainfall24h}mm, Dynamic Trigger Index: ${ctx.evalResult.dynamicTriggerIndex}.</description>
    <instruction>${getEvacuationInstruction(ctx.evalResult.alertLevel)}</instruction>
    <area>
      <areaDesc>${ctx.zoneName}, ${ctx.district}, ${ctx.state}</areaDesc>
      <polygon>${polygonStr}</polygon>
    </area>
  </info>
</alert>`;
}

function getEvacuationInstruction(level: AlertLevel): string {
  switch (level) {
    case 'RED':
      return 'MANDATORY EVACUATION: Move immediately along designated green pathways toward nearest recognized shelter. Avoid valleys, steep road cuts, and riverbanks. Do not attempt to cross debris channels.';
    case 'ORANGE':
      return 'HIGH VIGILANCE: Prepare emergency kit. Fragile road sections closed to non-emergency vehicular traffic. Local SDRF units on high alert.';
    case 'YELLOW':
      return 'ADVISORY: Monitor official weather bulletins. Rural panchayats to report sudden water turbidity or ground tension cracks.';
    case 'GREEN':
    default:
      return 'Normal vigilance. No immediate movement required.';
  }
}

/**
 * Generates an ultra-compact SMS payload for 2G/EDGE fallback broadcast:
 * Format: LEWS:[LVL]:[ZONE_CODE]:[VALID_HRS]:[LAT],[LON]:[DTI]:[CHECKSUM]
 * Example: LEWS:R:SK-NH10:06:27.13,88.50:0.94:A4B
 */
export function generateCompactSmsPayload(ctx: AlertContext): string {
  const lvlChar = ctx.evalResult.alertLevel.charAt(0);
  const centroidLat = ctx.coordinatesPolygon.reduce((sum, p) => sum + p[1], 0) / ctx.coordinatesPolygon.length;
  const centroidLon = ctx.coordinatesPolygon.reduce((sum, p) => sum + p[0], 0) / ctx.coordinatesPolygon.length;
  const dti = ctx.evalResult.dynamicTriggerIndex.toFixed(2);

  const rawString = `LEWS:${lvlChar}:${ctx.zoneId}:06:${centroidLat.toFixed(3)},${centroidLon.toFixed(3)}:${dti}`;

  // Simple 3-char hex checksum
  let hash = 0;
  for (let i = 0; i < rawString.length; i++) {
    hash = (hash * 31 + rawString.charCodeAt(i)) & 0xfff;
  }
  const checksum = hash.toString(16).toUpperCase().padStart(3, '0');

  return `${rawString}:${checksum}`;
}
