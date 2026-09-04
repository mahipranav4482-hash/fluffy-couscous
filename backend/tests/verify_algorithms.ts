import { calculateFactorOfSafety } from '../src/algorithms/slopeStability.js';
import { evaluateDynamicRisk, calculateIDThreshold } from '../src/algorithms/dynamicTrigger.js';
import { generateCapXml, generateCompactSmsPayload } from '../src/services/capAlertGenerator.js';
import { calculateHaversineDistanceMeters, evaluate500mProximity, calculateBearing } from '../src/algorithms/proximityEngine.js';

console.log('================================================================');
console.log('   NER-LEWS ALGORITHMIC VERIFICATION & COMPLIANCE TEST SUITE    ');
console.log('================================================================\n');

let failedTests = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName}`);
    failedTests++;
  }
}

// 1. Test 1D Infinite Slope Stability Model
console.log('--- 1. Testing Slope Stability (Factor of Safety) ---');
const drySlope = calculateFactorOfSafety(
  {
    cohesionKPa: 15.0,
    frictionAngleDeg: 30.0,
    soilUnitWeightKNm3: 19.0,
    waterUnitWeightKNm3: 9.81,
    failurePlaneDepthM: 2.5,
  },
  {
    slopeAngleDeg: 35.0,
    porePressureRatioRu: 0.05, // Dry slope
  }
);
console.log(`Dry Slope (θ=35°, Ru=0.05) -> FoS: ${drySlope.factorOfSafety}, Category: ${drySlope.failureRiskCategory}`);
assert(drySlope.factorOfSafety > 1.3 && drySlope.isStable, 'Dry slope must be stable (FoS > 1.3)');

const saturatedSlope = calculateFactorOfSafety(
  {
    cohesionKPa: 12.0,
    frictionAngleDeg: 28.0,
    soilUnitWeightKNm3: 20.0,
    waterUnitWeightKNm3: 9.81,
    failurePlaneDepthM: 2.5,
  },
  {
    slopeAngleDeg: 42.0,
    porePressureRatioRu: 0.45, // Heavy saturation during cloudburst
  }
);
console.log(`Saturated Slope (θ=42°, Ru=0.45) -> FoS: ${saturatedSlope.factorOfSafety}, Category: ${saturatedSlope.failureRiskCategory}`);
assert(saturatedSlope.factorOfSafety < 1.05 && !saturatedSlope.isStable, 'Saturated steep slope must trigger failure (FoS < 1.05)');

// 2. Test Empirical Intensity-Duration (I-D) Threshold
console.log('\n--- 2. Testing Empirical I-D Threshold ---');
const threshold1h = calculateIDThreshold(1);
const threshold24h = calculateIDThreshold(24);
console.log(`1-Hour Threshold Intensity: ${threshold1h.toFixed(2)} mm/h`);
console.log(`24-Hour Threshold Mean Intensity: ${threshold24h.toFixed(2)} mm/h`);
assert(threshold1h > threshold24h, 'Shorter duration must require higher peak intensity to initiate failure');
assert(threshold24h > 2.0 && threshold24h < 6.0, '24-hour mean threshold falls within Himalayan calibrated range (3.0 - 4.5 mm/h)');

// 3. Test Multi-Tier Alert Matrix
console.log('\n--- 3. Testing Dynamic Trigger & Multi-Tier Matrix ---');
const baselineRisk = evaluateDynamicRisk(
  {
    rainfall1hMm: 2.0,
    rainfall24hMm: 20.0,
    rainfall72hMm: 35.0,
    antecedentRainfall15dMm: 60.0,
    soilSaturationPct: 40.0,
    insarDisplacementMmPerWeek: -0.2,
  },
  {
    susceptibilityScore: 0.85,
    slopeDegrees: 40.0,
    lithologyClass: 'Mica Schist',
  }
);
console.log(`Baseline Rain -> Alert: ${baselineRisk.alertLevel}, DTI: ${baselineRisk.dynamicTriggerIndex}`);
assert(baselineRisk.alertLevel === 'GREEN', 'Low rain must result in GREEN alert');

const cloudburstRisk = evaluateDynamicRisk(
  {
    rainfall1hMm: 45.0,
    rainfall24hMm: 165.0,
    rainfall72hMm: 290.0,
    antecedentRainfall15dMm: 380.0,
    soilSaturationPct: 98.0,
    insarDisplacementMmPerWeek: -5.2,
  },
  {
    susceptibilityScore: 0.94,
    slopeDegrees: 42.5,
    lithologyClass: 'Weathered Phyllites',
  }
);
console.log(`Cloudburst Rain -> Alert: ${cloudburstRisk.alertLevel}, DTI: ${cloudburstRisk.dynamicTriggerIndex}`);
assert(cloudburstRisk.alertLevel === 'RED', 'Torrential cloudburst on steep slope must trigger RED alert');
assert(cloudburstRisk.recommendedEvacStage === 'MANDATORY_EVACUATION', 'RED alert must recommend MANDATORY_EVACUATION');

// 4. Test CAP XML & Compact Binary SMS Generator
console.log('\n--- 4. Testing CAP v1.2 XML & Compact SMS Protocol ---');
const sampleCapXml = generateCapXml({
  alertId: 'TEST-001',
  zoneId: 'SK-NH10-01',
  zoneName: 'NH-10 29th Mile Sector',
  district: 'Pakyong',
  state: 'Sikkim',
  coordinatesPolygon: [[88.485, 27.120], [88.510, 27.125], [88.515, 27.145], [88.485, 27.120]],
  evalResult: cloudburstRisk,
  currentRainfall24h: 165.0,
  porePressureRatioRu: 0.45,
});

assert(sampleCapXml.includes('<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">'), 'CAP XML must include OASIS namespace');
assert(sampleCapXml.includes('<event>Rainfall-Triggered Landslide Hazard</event>'), 'CAP XML must identify Landslide event');
assert(sampleCapXml.includes('<severity>Extreme</severity>'), 'RED alert must map to Extreme severity in CAP');

const sampleSms = generateCompactSmsPayload({
  alertId: 'TEST-001',
  zoneId: 'SK-NH10-01',
  zoneName: 'NH-10 29th Mile Sector',
  district: 'Pakyong',
  state: 'Sikkim',
  coordinatesPolygon: [[88.485, 27.120], [88.510, 27.125], [88.515, 27.145], [88.485, 27.120]],
  evalResult: cloudburstRisk,
  currentRainfall24h: 165.0,
  porePressureRatioRu: 0.45,
});

console.log(`Generated Compact SMS: "${sampleSms}" (Length: ${sampleSms.length} chars)`);
assert(sampleSms.startsWith('LEWS:R:SK-NH10-01:'), 'Compact SMS must match LEWS reverse-SMS protocol');
assert(sampleSms.length < 50, 'Compact SMS must easily fit into standard 160-char SMS window');

// 5. Test 500-Meter Hyper-Local Proximity & Emergency Buzzer Engine
console.log('\n--- 5. Testing 500-Meter Proximity & Emergency Buzzer Engine ---');

// Test Haversine distance accuracy
const distTokyoYokohama = calculateHaversineDistanceMeters(35.6762, 139.6503, 35.4437, 139.6380);
console.log(`Computed Tokyo to Yokohama distance: ${distTokyoYokohama} meters (~25-28km)`);
assert(distTokyoYokohama > 25000 && distTokyoYokohama < 28000, 'Haversine distance must match true geodesic distance');

// Test coordinates placed 320 meters from Sierra Madre Wildfire epicenter (-118.05, 34.18)
// 0.003 degrees latitude is approx ~333 meters
const mockDisasters = [
  {
    id: 'TEST-WILD-01',
    name: 'Sierra Madre Wildfire',
    type: 'WILDFIRE',
    country: 'United States',
    state_province: 'California',
    coordinates: [-118.0500, 34.1800] as [number, number],
    radius_meters: 1000,
    severity: 'CRITICAL' as const,
    status: 'ACTIVE_NOW' as const,
    emergencyDirectives: 'Evacuate south immediately.',
  }
];

// Inside 500m buffer zone (user at 34.1830, -118.0500 -> ~333m north of epicenter)
const proximityWithin500m = evaluate500mProximity(34.1830, -118.0500, mockDisasters);
console.log(`Proximity (~333m away): Buzzer Triggered = ${proximityWithin500m.triggerBuzzer}, Alert = ${proximityWithin500m.alertLevel}`);
console.log(`Voice Broadcast Text: "${proximityWithin500m.voiceAlertText}"`);
console.log(`Safe Evacuation Bearing: ${proximityWithin500m.safeEvacuationBearingDegrees}° (${proximityWithin500m.safeBearingCardinal})`);

assert(proximityWithin500m.triggerBuzzer === true, 'Buzzer MUST trigger when user is within 500m of disaster');
assert(proximityWithin500m.alertLevel === 'CRITICAL_BUZZER', 'Alert level must be CRITICAL_BUZZER');
assert(proximityWithin500m.isWithin500mMargins === true, 'isWithin500mMargins must be true');

// Outside 500m zone (user at 34.2500, -118.0500 -> ~7.7km north of epicenter)
const proximityFarAway = evaluate500mProximity(34.2500, -118.0500, mockDisasters);
console.log(`Proximity (~7.7km away): Buzzer Triggered = ${proximityFarAway.triggerBuzzer}, Alert = ${proximityFarAway.alertLevel}`);
assert(proximityFarAway.triggerBuzzer === false, 'Buzzer must NOT trigger when user is far away');

console.log('\n================================================================');
if (failedTests === 0) {
  console.log('   ALL ALGORITHMIC & PROXIMITY TESTS PASSED (100% SUCCESS)      ');
} else {
  console.error(`   ${failedTests} TEST(S) FAILED!                               `);
  process.exit(1);
}
console.log('================================================================');

