import React, { useState, useEffect } from 'react';
import { LocationInfo, WeatherData, HKOWarningItem } from './types';
import { GLOBAL_PRESET_LOCATIONS } from './data/locations';
import { fetchHKOWeatherData, fetchGlobalWeatherData } from './services/weatherService';
import { Navbar } from './components/Navbar';
import { AtmosphericCanvas } from './components/AtmosphericCanvas';
import { RealTimeWeatherView } from './components/RealTimeWeatherView';
import { SevereWarningsCenter } from './components/SevereWarningsCenter';
import { WeatherSimulationEngine } from './components/WeatherSimulationEngine';
import { RegionalTrendForecaster } from './components/RegionalTrendForecaster';
import { RefreshCw, Radio } from 'lucide-react';

export default function App() {
  const [currentLocation, setCurrentLocation] = useState<LocationInfo>(GLOBAL_PRESET_LOCATIONS[0]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'realtime' | 'warnings' | 'simulation' | 'trends'>('realtime');

  const loadWeatherData = async (loc: LocationInfo) => {
    setIsLoading(true);
    setError(null);
    try {
      let data: WeatherData;
      if (loc.isHKO) {
        data = await fetchHKOWeatherData();
      } else {
        data = await fetchGlobalWeatherData(loc.lat, loc.lon, loc.name);
      }
      setWeather(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load weather data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeatherData(currentLocation);
  }, [currentLocation]);

  const activeWarnings: HKOWarningItem[] = weather?.hkoWarnings || [];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans relative selection:bg-cyan-500 selection:text-black">
      {/* Dynamic Background Atmospheric Canvas Particles */}
      <AtmosphericCanvas
        conditionCode={weather?.conditionCode || 'cloudy'}
        windSpeed={weather?.windSpeed || 15}
      />

      {/* Main Top Header Navbar */}
      <Navbar
        currentLocation={currentLocation}
        onSelectLocation={setCurrentLocation}
        activeWarnings={activeWarnings}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10 space-y-6">
        {/* Secondary Bar with Refresh & HKO Status */}
        <div className="flex items-center justify-between text-xs text-slate-400 bg-black/40 p-3 rounded-2xl border border-white/10 backdrop-blur-xl font-mono uppercase tracking-wider shadow-xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
            <span className="font-bold text-cyan-300">
              Station: {currentLocation.name}
            </span>
            <span className="text-slate-500 hidden sm:inline text-[11px]">
              ({currentLocation.lat.toFixed(2)}°N, {currentLocation.lon.toFixed(2)}°E)
            </span>
          </div>

          <button
            onClick={() => loadWeatherData(currentLocation)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold hover:bg-cyan-500/20 transition disabled:opacity-50 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.2)]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Observations</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-mono">
            {error}
          </div>
        )}

        {/* View Router */}
        {activeTab === 'realtime' && weather && (
          <RealTimeWeatherView
            weather={weather}
            isLoading={isLoading}
            onRefresh={() => loadWeatherData(currentLocation)}
          />
        )}

        {activeTab === 'warnings' && (
          <SevereWarningsCenter warnings={activeWarnings} />
        )}

        {activeTab === 'simulation' && <WeatherSimulationEngine />}

        {activeTab === 'trends' && <RegionalTrendForecaster />}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/50 text-slate-500 py-6 text-xs text-center relative z-10 font-mono tracking-wider uppercase">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Data Source: Hong Kong Observatory (HKO) Open Data API • Global Meteorology
          </div>
          <div className="text-cyan-400/80">
            Powered by Google AI Studio Gemini Server Engine
          </div>
        </div>
      </footer>
    </div>
  );
}
