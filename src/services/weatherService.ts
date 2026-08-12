import { WeatherData, SimulationParams, LocationInfo } from '../types';

export async function searchGlobalLocations(query: string): Promise<LocationInfo[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(`/api/global/search?q=${encodeURIComponent(query.trim())}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.locations || [];
  } catch (err) {
    console.warn('Failed to search locations:', err);
    return [];
  }
}

export async function fetchHKOWeatherData(): Promise<WeatherData> {
  const res = await fetch('/api/hko/weather');
  if (!res.ok) {
    throw new Error('Failed to fetch Hong Kong Observatory weather data');
  }
  return res.json();
}

export async function fetchGlobalWeatherData(lat: number, lon: number, locationName: string): Promise<WeatherData> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    name: locationName,
  });
  const res = await fetch(`/api/global/weather?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch weather for ${locationName}`);
  }
  return res.json();
}

export async function fetchGeminiSimulationAnalysis(simulationParams: SimulationParams): Promise<any> {
  const res = await fetch('/api/gemini/weather-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'simulation',
      simulationParams,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.details || 'Gemini API scenario analysis failed');
  }

  const data = await res.json();
  return data.result;
}

export async function fetchGeminiRegionalTrendForecast(regionalParams: {
  regionName: string;
  coordinates: string;
  targetHorizon: string;
}): Promise<any> {
  const res = await fetch('/api/gemini/weather-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'trend_forecast',
      regionalParams,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.details || 'Gemini API regional trend forecast failed');
  }

  const data = await res.json();
  return data.result;
}
