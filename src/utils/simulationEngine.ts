import { HistoricalPreset, SimulationAnalysis, SimulationDataPoint, SimulationParams } from '../types';

export const HISTORICAL_PRESETS: HistoricalPreset[] = [
  {
    id: 'mangkhut_2018',
    name: 'Super Typhoon Mangkhut (2018)',
    locationName: 'Hong Kong - Pearl River Delta',
    dateStr: 'September 16, 2018',
    description: 'Record-breaking T10 Super Typhoon with 256 km/h gusts at Waglan Island & 2.35m storm surge inundation.',
    category: 'Typhoon',
    params: {
      locationName: 'Hong Kong (HKO)',
      lat: 22.3193,
      lon: 114.1694,
      elevationMeters: 33,
      baseTempC: 27.5,
      tempOffsetC: 0,
      seaSurfaceTempC: 29.8,
      centralPressureDropHpa: 73, // Min pressure 940 hPa
      relativeHumidityPct: 95,
      windShearKts: 8, // low shear allows intense cyclone core
      co2Ppm: 408,
      urbanHeatIslandFactor: 0.6,
      durationHours: 36,
    },
  },
  {
    id: 'saola_2023',
    name: 'Super Typhoon Saola (2023)',
    locationName: 'Hong Kong Outer Waters',
    dateStr: 'September 1-2, 2023',
    description: 'Double eyewall cyclone causing T10 signal with severe maritime storm surge and 205 km/h gusts.',
    category: 'Typhoon',
    params: {
      locationName: 'Hong Kong Coastal',
      lat: 22.2500,
      lon: 114.2000,
      elevationMeters: 10,
      baseTempC: 28.0,
      tempOffsetC: 0.5,
      seaSurfaceTempC: 30.1,
      centralPressureDropHpa: 68, // Min pressure 945 hPa
      relativeHumidityPct: 92,
      windShearKts: 10,
      co2Ppm: 420,
      urbanHeatIslandFactor: 0.5,
      durationHours: 36,
    },
  },
  {
    id: 'black_rain_2023',
    name: 'Record Black Rainstorm (Sept 2023)',
    locationName: 'Hong Kong Island & Kowloon',
    dateStr: 'September 7-8, 2023',
    description: 'Trough of low pressure associated with Haikui remnants causing record 158.1 mm/hr rainfall & massive flash floods.',
    category: 'Rainstorm',
    params: {
      locationName: 'Urban Hong Kong',
      lat: 22.2800,
      lon: 114.1800,
      elevationMeters: 15,
      baseTempC: 26.0,
      tempOffsetC: 1.0,
      seaSurfaceTempC: 29.2,
      centralPressureDropHpa: 15,
      relativeHumidityPct: 99,
      windShearKts: 14,
      co2Ppm: 421,
      urbanHeatIslandFactor: 0.8,
      durationHours: 24,
    },
  },
  {
    id: 'cold_surge_2016',
    name: 'Historic Polar Vortex Cold Surge (Jan 2016)',
    locationName: 'Hong Kong & Tai Mo Shan',
    dateStr: 'January 24, 2016',
    description: 'Intense Siberian anticyclone causing temperature to drop to 3.1°C at HKO HQ and sub-zero -6.0°C icing at Tai Mo Shan.',
    category: 'Cold Surge',
    params: {
      locationName: 'Tai Mo Shan High Altitude',
      lat: 22.4100,
      lon: 114.1200,
      elevationMeters: 957,
      baseTempC: 12.0,
      tempOffsetC: -11.0,
      seaSurfaceTempC: 18.0,
      centralPressureDropHpa: -25, // High pressure ridge +25 hPa
      relativeHumidityPct: 85,
      windShearKts: 35,
      co2Ppm: 403,
      urbanHeatIslandFactor: 0.1,
      durationHours: 36,
    },
  },
  {
    id: 'heatwave_2022',
    name: 'Severe Urban Heatwave (+3.5°C Climate Warp)',
    locationName: 'Sheung Shui & New Territories',
    dateStr: 'July 24, 2022',
    description: 'Subtropical ridge subsidence producing 39.0°C extreme urban heat dome with high heat stress index.',
    category: 'Heatwave',
    params: {
      locationName: 'New Territories North',
      lat: 22.5000,
      lon: 114.1300,
      elevationMeters: 12,
      baseTempC: 32.5,
      tempOffsetC: 5.5,
      seaSurfaceTempC: 31.0,
      centralPressureDropHpa: -5,
      relativeHumidityPct: 65,
      windShearKts: 5,
      co2Ppm: 425,
      urbanHeatIslandFactor: 0.9,
      durationHours: 24,
    },
  },
  {
    id: 'hyper_cyclone_2050',
    name: '2050 Climate Projection: Category 5 Hyper-Typhoon',
    locationName: 'Pearl River Estuary Megacity',
    dateStr: 'Simulated Horizon 2050',
    description: 'High GHG trajectory (SSP3-7.0) modeling +3.2°C SST, 915 hPa central pressure, 280 km/h gusts and +3.5m storm surge.',
    category: 'Custom',
    params: {
      locationName: 'Pearl River Delta Coastal',
      lat: 22.3000,
      lon: 114.1500,
      elevationMeters: 5,
      baseTempC: 29.0,
      tempOffsetC: 2.8,
      seaSurfaceTempC: 31.5,
      centralPressureDropHpa: 98, // Min pressure ~ 915 hPa
      relativeHumidityPct: 96,
      windShearKts: 5,
      co2Ppm: 550,
      urbanHeatIslandFactor: 0.85,
      durationHours: 48,
    },
  },
];

/**
 * Runs a numerical atmospheric simulation model based on input parameters.
 * Calculates hourly time series for pressure drop, sustained wind, peak gusts, rainfall intensity, and storm surge.
 */
export function runAtmosphericSimulation(params: SimulationParams): {
  points: SimulationDataPoint[];
  summary: SimulationAnalysis;
} {
  const {
    durationHours,
    centralPressureDropHpa,
    baseTempC,
    tempOffsetC,
    seaSurfaceTempC,
    relativeHumidityPct,
    windShearKts,
    elevationMeters,
    co2Ppm,
    urbanHeatIslandFactor,
  } = params;

  const points: SimulationDataPoint[] = [];

  // Environmental Constants
  const ambientPressure = 1013.25;
  const minPressure = ambientPressure - centralPressureDropHpa;
  
  // SST thermo boost factor
  const sstBoost = Math.max(0, (seaSurfaceTempC - 26.5) * 4.5); // Warm water fuels storm
  const shearPenalty = Math.max(0, (windShearKts - 10) * 2.2); // Shear tears storms down
  
  // Peak sustained wind calculation (Holland B-parameter wind profile approximation)
  // Wind velocity Vmax ~ 3.5 * sqrt(1013 - Pmin) + sstBoost - shearPenalty
  let maxSustainedWind = 3.8 * Math.sqrt(Math.max(0, centralPressureDropHpa)) + sstBoost - shearPenalty;
  if (centralPressureDropHpa <= 5) {
    maxSustainedWind = Math.max(10, 15 + tempOffsetC * 2);
  }
  
  // Altitude temperature lapse rate (-0.0065°C / meter)
  const altitudeTempAdj = (elevationMeters / 1000) * 6.5;

  let peakWindOverall = 0;
  let peakGustOverall = 0;
  let minPressureOverall = 1013.25;
  let totalRain = 0;
  let maxSurgeMeters = 0;

  const centerHour = Math.floor(durationHours / 2);

  for (let h = 0; h <= durationHours; h++) {
    // Gaussian distance factor from storm eye (0 = at storm center, 1 = far away)
    const normalizedDistance = Math.abs(h - centerHour) / (durationHours / 2);
    const eyeFactor = Math.exp(-Math.pow(normalizedDistance * 2.5, 2));

    // Pressure profile
    const currentPressure = ambientPressure - (centralPressureDropHpa * eyeFactor);

    // Wind profile (Vortex ring peaks slightly before/after exact center - eyewall)
    const eyewallFactor = Math.sin(normalizedDistance * Math.PI) * Math.exp(-Math.pow(normalizedDistance * 1.8, 2)) * 1.6;
    const isHeatOrCold = Math.abs(centralPressureDropHpa) < 10;
    
    let currentWind = isHeatOrCold
      ? 15 + Math.random() * 10
      : (maxSustainedWind * (eyeFactor * 0.4 + eyewallFactor * 0.6));
    
    currentWind = Math.max(8, currentWind);
    const currentGust = currentWind * (1.35 + (urbanHeatIslandFactor * 0.15));

    // Rainfall intensity calculation (Moisture capacity scales with temp: Clausius-Clapeyron ~7% per °C)
    const tempFactor = Math.pow(1.07, (baseTempC + tempOffsetC - 20));
    const humidityMoisture = Math.max(0, (relativeHumidityPct - 60) / 40);
    let rainIntensity = 0;

    if (!isHeatOrCold) {
      rainIntensity = (eyeFactor * 0.8 + eyewallFactor * 0.5) * 85 * tempFactor * humidityMoisture;
    } else if (relativeHumidityPct > 80) {
      rainIntensity = (Math.sin(h / 3) * 0.5 + 0.5) * 35 * humidityMoisture;
    }

    // Storm surge equation: Inverse barometric effect + wind setup
    // 1 hPa drop ~ 1 cm water rise + wind stress factor
    const inverseBarometerCm = Math.max(0, (1013.25 - currentPressure));
    const windStressCm = Math.pow(currentWind / 35, 2) * 12;
    const currentSurgeMeters = isHeatOrCold ? 0 : Math.max(0, (inverseBarometerCm + windStressCm) / 100);

    // Temperature dynamics during storm passage
    let currentTemp = baseTempC + tempOffsetC - altitudeTempAdj;
    if (!isHeatOrCold) {
      // Rain cooling & pressure dip
      currentTemp -= (rainIntensity / 25) + (eyeFactor * 1.5);
    } else {
      // Diurnal cycle for heatwaves or cold surge
      const diurnal = Math.sin(((h % 24) - 8) * (Math.PI / 12)) * 4.5;
      currentTemp += diurnal + (urbanHeatIslandFactor * 2.2);
    }

    // Discomfort / Heat-Stress Index
    const discomfortIndex = calculateDiscomfortIndex(currentTemp, relativeHumidityPct, currentWind);

    // Track peak stats
    if (currentWind > peakWindOverall) peakWindOverall = currentWind;
    if (currentGust > peakGustOverall) peakGustOverall = currentGust;
    if (currentPressure < minPressureOverall) minPressureOverall = currentPressure;
    if (currentSurgeMeters > maxSurgeMeters) maxSurgeMeters = currentSurgeMeters;
    totalRain += (rainIntensity * 1.0); // 1 hour step

    points.push({
      hour: h,
      timeLabel: `T+${h}h`,
      temperature: Number(currentTemp.toFixed(1)),
      pressure: Number(currentPressure.toFixed(1)),
      windSpeed: Math.round(currentWind),
      windGust: Math.round(currentGust),
      rainIntensity: Number(rainIntensity.toFixed(1)),
      stormSurgeMeters: Number(currentSurgeMeters.toFixed(2)),
      discomfortIndex: Math.round(discomfortIndex),
    });
  }

  // Derive HKO Signal Equivalent
  let hkoSignalEquivalent = 'No Warning Required';
  if (peakGustOverall >= 220 || peakWindOverall >= 185) {
    hkoSignalEquivalent = 'Hurricane Signal No. 10 (T10)';
  } else if (peakWindOverall >= 118) {
    hkoSignalEquivalent = 'Increasing Gale/Storm Signal No. 9 (T9)';
  } else if (peakWindOverall >= 63) {
    hkoSignalEquivalent = 'Gale/Storm Signal No. 8 (T8)';
  } else if (peakWindOverall >= 41) {
    hkoSignalEquivalent = 'Strong Wind Signal No. 3 (T3)';
  } else if (peakWindOverall >= 25) {
    hkoSignalEquivalent = 'Standby Signal No. 1 (T1)';
  }

  const maxHourlyRain = Math.max(...points.map(p => p.rainIntensity));
  let rainWarning = '';
  if (maxHourlyRain >= 70) {
    rainWarning = ' + Black Rainstorm Warning (70+ mm/h)';
  } else if (maxHourlyRain >= 50) {
    rainWarning = ' + Red Rainstorm Warning (50+ mm/h)';
  } else if (maxHourlyRain >= 30) {
    rainWarning = ' + Amber Rainstorm Warning (30+ mm/h)';
  }

  const fullSignalText = hkoSignalEquivalent + rainWarning;

  // Derive severity score (1-100)
  const severityScore = Math.min(100, Math.round(
    (peakGustOverall / 260) * 45 +
    (totalRain / 500) * 30 +
    (maxSurgeMeters / 3.5) * 25
  ));

  // Determine Infrastructure Risk
  const floodRisk = maxSurgeMeters > 2.0 || totalRain > 350 ? 'Catastrophic' : maxSurgeMeters > 1.2 || totalRain > 200 ? 'High' : maxSurgeMeters > 0.5 ? 'Moderate' : 'Low';
  const aviationRisk = peakGustOverall > 110 ? 'Total Shutdown' : peakGustOverall > 70 ? 'Mass Cancellations' : peakGustOverall > 45 ? 'Minor Delays' : 'None';
  const powerRisk = peakGustOverall > 180 ? 'Widespread Outages' : peakGustOverall > 100 ? 'Localized Outages' : 'Stable';
  const landslideRisk = totalRain > 300 ? 'Critical' : totalRain > 180 ? 'High' : totalRain > 80 ? 'Moderate' : 'Low';

  const keyImpacts: string[] = [];
  if (peakGustOverall >= 180) keyImpacts.push(`Extreme structural damage potential from ${Math.round(peakGustOverall)} km/h peak gusts.`);
  if (maxSurgeMeters >= 1.5) keyImpacts.push(`Severe coastal inundation reaching ${maxSurgeMeters.toFixed(2)}m above mean sea level.`);
  if (totalRain >= 250) keyImpacts.push(`Torrential downpours resulting in ${Math.round(totalRain)}mm total accumulated precipitation.`);
  if (landslideRisk === 'Critical' || landslideRisk === 'High') keyImpacts.push('High vulnerability to hillside slope failures and urban flash flooding.');
  if (keyImpacts.length === 0) keyImpacts.push('Moderate seasonal weather patterns without immediate destructive triggers.');

  const summary: SimulationAnalysis = {
    presetName: params.locationName,
    peakWindSpeed: Math.round(peakWindOverall),
    peakGust: Math.round(peakGustOverall),
    minPressure: Number(minPressureOverall.toFixed(1)),
    totalAccumulatedRainfall: Math.round(totalRain),
    maxStormSurge: Number(maxSurgeMeters.toFixed(2)),
    hkoSignalEquivalent: fullSignalText,
    severityScore,
    keyImpacts,
    infrastructureRisk: {
      coastalFlooding: floodRisk,
      aviationDisruption: aviationRisk,
      powerGrid: powerRisk,
      landslideRisk,
    },
  };

  return { points, summary };
}

function calculateDiscomfortIndex(tempC: number, rhPct: number, windKmH: number): number {
  if (tempC >= 27) {
    // Heat index approximation
    const hi = tempC + (0.5555 * ((6.11 * Math.exp(5417.7530 * (1/273.16 - 1/(273.15 + tempC)))) * (rhPct/100) - 10));
    return Math.min(100, Math.round((hi / 45) * 100));
  } else if (tempC <= 10) {
    // Wind chill score
    const windMps = windKmH / 3.6;
    const chill = 13.12 + (0.6215 * tempC) - (11.37 * Math.pow(windMps, 0.16)) + (0.3965 * tempC * Math.pow(windMps, 0.16));
    return Math.max(0, Math.round(((20 - chill) / 30) * 100));
  }
  return 50;
}
