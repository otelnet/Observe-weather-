export interface LocationInfo {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  elevation: number; // in meters
  isHKO: boolean;
}

export interface HKOWarningItem {
  code: string;
  name: string;
  type: 'cyclone' | 'rainstorm' | 'landslide' | 'thunderstorm' | 'temperature' | 'monsoon' | 'fire' | 'special';
  level: string; // e.g. T1, T3, T8NE, T8SE, T8NW, T8SW, T9, T10, Amber, Red, Black, Yellow, Red, Cold, Very Hot
  issueTime: string;
  updateTime?: string;
  headline: string;
  details?: string;
  iconUrl?: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
}

export interface WeatherData {
  location: LocationInfo;
  timestamp: string;
  temp: number; // °C
  feelsLike: number; // °C
  humidity: number; // %
  pressure: number; // hPa
  windSpeed: number; // km/h
  windGust: number; // km/h
  windDirection: number; // degrees
  windDirectionText: string;
  condition: string;
  conditionCode: string; // e.g. 'sunny', 'cloudy', 'rain', 'heavy_rain', 'thunderstorm', 'typhoon'
  uvIndex: number;
  visibility: number; // km
  airQualityIndex: number; // 1-5 or US AQI 0-500
  rainfallPastHour: number; // mm
  hourlyForecast: HourlyForecastItem[];
  dailyForecast: ForecastDay[];
  hkoWarnings?: HKOWarningItem[];
  specialTips?: string[];
}

export interface HourlyForecastItem {
  time: string; // e.g. '14:00'
  temp: number;
  rainProb: number; // %
  rainfall: number; // mm
  windSpeed: number; // km/h
  condition: string;
}

export interface ForecastDay {
  date: string; // YYYY-MM-DD
  dayName: string; // e.g. 'Mon'
  maxTemp: number;
  minTemp: number;
  humidityMax: number;
  humidityMin: number;
  condition: string;
  rainProb: number;
  windDesc: string;
  uvIndexMax: number;
}

export interface HistoricalPreset {
  id: string;
  name: string;
  locationName: string;
  dateStr: string;
  description: string;
  category: 'Typhoon' | 'Rainstorm' | 'Cold Surge' | 'Heatwave' | 'Custom';
  params: SimulationParams;
}

export interface SimulationParams {
  locationName: string;
  lat: number;
  lon: number;
  elevationMeters: number;
  baseTempC: number;
  tempOffsetC: number;
  seaSurfaceTempC: number;
  centralPressureDropHpa: number; // pressure drop from standard 1013 hPa
  relativeHumidityPct: number;
  windShearKts: number;
  co2Ppm: number; // GHG baseline e.g. 420
  urbanHeatIslandFactor: number; // 0.0 - 1.0
  durationHours: number; // e.g., 24, 48, 72
}

export interface SimulationDataPoint {
  hour: number;
  timeLabel: string;
  temperature: number; // °C
  pressure: number; // hPa
  windSpeed: number; // km/h
  windGust: number; // km/h
  rainIntensity: number; // mm/h
  stormSurgeMeters: number; // meters above mean sea level
  discomfortIndex: number; // Heat index or chill factor score 0-100
}

export interface SimulationAnalysis {
  presetName?: string;
  peakWindSpeed: number; // km/h
  peakGust: number; // km/h
  minPressure: number; // hPa
  totalAccumulatedRainfall: number; // mm
  maxStormSurge: number; // meters
  hkoSignalEquivalent: string; // e.g. "T10 Signal + Black Rainstorm"
  severityScore: number; // 1 - 100
  keyImpacts: string[];
  infrastructureRisk: {
    coastalFlooding: 'Low' | 'Moderate' | 'High' | 'Catastrophic';
    aviationDisruption: 'None' | 'Minor Delays' | 'Mass Cancellations' | 'Total Shutdown';
    powerGrid: 'Stable' | 'Localized Outages' | 'Widespread Outages';
    landslideRisk: 'Low' | 'Moderate' | 'High' | 'Critical';
  };
  aiScenarioReport?: string;
}

export interface RegionalTrend {
  regionId: string;
  regionName: string;
  coordinates: string;
  baselinePeriod: string;
  targetHorizon: '2030' | '2040' | '2050';
  tempAnomalyC: number;
  seaLevelRiseCm: number;
  extremePrecipitationChangePct: number;
  severeStormFrequencyFactor: number; // e.g. 1.25x
  vulnerabilityIndex: number; // 1-100
  keyClimateDrivers: string[];
  mitigationStrategies: string[];
}
