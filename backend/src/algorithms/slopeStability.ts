/**
 * Infinite Slope Stability Model (1D Limit Equilibrium Analysis)
 * Computes the Factor of Safety (FoS) for planar slope failure.
 *
 * FoS = (c' + (γ_sat * z - u) * cos²θ * tan φ') / (γ_sat * z * sin θ * cos θ)
 */

export interface GeotechnicalParameters {
  cohesionKPa: number;          // Effective cohesion c' in kPa (kN/m²)
  frictionAngleDeg: number;     // Effective internal friction angle φ' in degrees
  soilUnitWeightKNm3: number;   // Saturated unit weight γ_sat in kN/m³ (typical: 18-20)
  waterUnitWeightKNm3: number;  // Water unit weight γ_w in kN/m³ (9.81)
  failurePlaneDepthM: number;   // Depth to potential slip surface z in meters (1.5 - 4.0m)
}

export interface DynamicHydrologyState {
  slopeAngleDeg: number;         // Slope gradient θ in degrees
  porePressureRatioRu: number;   // Ru = u / (γ * z) [0.0 = completely dry, 0.5 = saturated table at surface]
}

export interface FactorOfSafetyResult {
  factorOfSafety: number;
  isStable: boolean;
  failureRiskCategory: 'STABLE' | 'MARGINALLY_STABLE' | 'IMMINENT_FAILURE' | 'ACTIVE_FAILURE';
  resistingShearStressKPa: number;
  drivingShearStressKPa: number;
}

export function calculateFactorOfSafety(
  geo: GeotechnicalParameters,
  hydro: DynamicHydrologyState
): FactorOfSafetyResult {
  const thetaRad = (hydro.slopeAngleDeg * Math.PI) / 180;
  const phiRad = (geo.frictionAngleDeg * Math.PI) / 180;

  // Prevent division by zero on flat terrain
  if (hydro.slopeAngleDeg < 2.0) {
    return {
      factorOfSafety: 99.0,
      isStable: true,
      failureRiskCategory: 'STABLE',
      resistingShearStressKPa: 100.0,
      drivingShearStressKPa: 1.0,
    };
  }

  const totalOverburdenKPa = geo.soilUnitWeightKNm3 * geo.failurePlaneDepthM; // γ * z
  const poreWaterPressureKPa = hydro.porePressureRatioRu * totalOverburdenKPa; // u

  // Driving shear stress τ_d = γ * z * sin θ * cos θ
  const drivingStress = totalOverburdenKPa * Math.sin(thetaRad) * Math.cos(thetaRad);

  // Effective normal stress σ'_n = (γ * z - u) * cos²θ
  const effectiveNormalStress = Math.max(0, (totalOverburdenKPa - poreWaterPressureKPa) * Math.pow(Math.cos(thetaRad), 2));

  // Resisting shear strength τ_r = c' + σ'_n * tan φ'
  const resistingStrength = geo.cohesionKPa + effectiveNormalStress * Math.tan(phiRad);

  const fos = drivingStress > 0 ? resistingStrength / drivingStress : 99.0;
  const roundedFoS = Math.round(fos * 100) / 100;

  let category: FactorOfSafetyResult['failureRiskCategory'] = 'STABLE';
  if (roundedFoS < 1.0) {
    category = 'ACTIVE_FAILURE';
  } else if (roundedFoS <= 1.15) {
    category = 'IMMINENT_FAILURE';
  } else if (roundedFoS <= 1.30) {
    category = 'MARGINALLY_STABLE';
  }

  return {
    factorOfSafety: roundedFoS,
    isStable: roundedFoS >= 1.25,
    failureRiskCategory: category,
    resistingShearStressKPa: Math.round(resistingStrength * 100) / 100,
    drivingShearStressKPa: Math.round(drivingStress * 100) / 100,
  };
}
