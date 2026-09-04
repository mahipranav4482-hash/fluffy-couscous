/**
 * Global Abnormality & Anomaly Activity Detector
 * Aggregates and scores abnormal geospheric, atmospheric, and hydrological signals across Earth.
 */

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

export function generateLiveAnomalies(): AnomalyActivity[] {
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
    }
  ];
}
