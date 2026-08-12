import React from 'react';
import { WeatherData } from '../types';
import { Wind, Droplets, Compass, Sun, Eye, Activity, Umbrella, AlertCircle, Sparkles, Star } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAuth } from '../context/AuthContext';

interface RealTimeWeatherViewProps {
  weather: WeatherData;
  isLoading: boolean;
  onRefresh: () => void;
}

export const RealTimeWeatherView: React.FC<RealTimeWeatherViewProps> = ({ weather, isLoading, onRefresh }) => {
  const { user, isFavorite, addFavorite, removeFavorite, signInWithGoogle } = useAuth();
  const isFav = isFavorite(weather.location.id);

  const handleToggleFavorite = async () => {
    if (!user) {
      signInWithGoogle();
      return;
    }
    if (isFav) {
      await removeFavorite(weather.location.id);
    } else {
      await addFavorite(weather.location);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
        <p className="text-xs font-mono tracking-widest uppercase text-cyan-400">
          Syncing atmospheric telemetry with HKO & Global radar...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Current Condition Hero Dashboard Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-black/80 via-[#020617] to-slate-950 border border-white/10 shadow-2xl p-6 md:p-10 backdrop-blur-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sun className="w-80 h-80 text-cyan-400" />
        </div>

        {/* Ambient Radial Glow */}
        <div className="absolute inset-0 bg-radial-at-t from-cyan-900/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          {/* Location & Primary Temperature */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                {weather.location.isHKO ? 'Hong Kong Observatory Official' : 'Global Station'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date(weather.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} HKT
              </span>
            </div>

            <div>
              <div className="text-xs font-semibold tracking-[0.3em] uppercase text-cyan-400 font-mono mb-1">
                {weather.location.region}, {weather.location.country}
              </div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
                  {weather.location.name}
                </h2>
                <button
                  onClick={handleToggleFavorite}
                  className={`p-2 rounded-full border transition cursor-pointer ${
                    isFav
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-amber-300 hover:bg-white/10'
                  }`}
                  title={isFav ? 'Remove from Firebase favorites' : 'Save station to Firebase'}
                >
                  <Star className={`w-5 h-5 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
              </div>
            </div>

            <div className="relative inline-block pt-2">
              <div className="text-[100px] sm:text-[130px] font-thin leading-none tracking-tighter text-white">
                {Math.round(weather.temp)}<span className="text-5xl sm:text-6xl align-top mt-4 inline-block font-light text-cyan-400">°C</span>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 text-cyan-500/10 text-8xl font-black select-none pointer-events-none font-mono uppercase">
                {weather.conditionCode}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
              <span className="text-cyan-300">Feels Like {Math.round(weather.feelsLike)}°C</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 uppercase">{weather.condition}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Elev {weather.location.elevation}m</span>
            </div>
          </div>

          {/* Quick Metric Grid Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 text-slate-200">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-inner backdrop-blur-md space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-mono tracking-wider">
                <span>Wind Speed</span>
                <Wind className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-thin tracking-tight text-white">{weather.windSpeed} <span className="text-xs text-slate-400">km/h</span></div>
              <div className="text-[10px] text-cyan-400 font-mono">{weather.windDirectionText} ({weather.windDirection}°)</div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-inner backdrop-blur-md space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-mono tracking-wider">
                <span>Humidity</span>
                <Droplets className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-thin tracking-tight text-white">{weather.humidity}<span className="text-xs text-slate-400">%</span></div>
              <div className="text-[10px] text-slate-400 font-mono">Dew ~{Math.round(weather.temp - (100 - weather.humidity)/5)}°C</div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-inner backdrop-blur-md space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-mono tracking-wider">
                <span>Pressure</span>
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-thin tracking-tight text-white">{weather.pressure} <span className="text-xs text-slate-400">hPa</span></div>
              <div className="text-[10px] text-emerald-400 font-mono">Mean Sea Level</div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-inner backdrop-blur-md space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-mono tracking-wider">
                <span>UV Index</span>
                <Sun className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-thin tracking-tight text-white">{weather.uvIndex} <span className="text-xs text-slate-400">/ 11+</span></div>
              <div className="text-[10px] text-amber-300 font-mono">{weather.uvIndex >= 8 ? 'Very High' : weather.uvIndex >= 6 ? 'High' : 'Moderate'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Special HKO Bulletins & Weather Tips */}
      {weather.specialTips && weather.specialTips.length > 0 && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-inner backdrop-blur-md flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-slate-300">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              HKO Weather Bulletin & Operational Guidance
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-300 leading-relaxed font-mono text-[11px]">
              {weather.specialTips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Hourly Forecast Temperature & Rainfall Chart */}
      <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
              <Umbrella className="w-4 h-4" />
              24-Hour Atmospheric Telemetry
            </h3>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-0.5 font-mono">
              Temperature (°C) & Precipitation Probability (%)
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weather.hourlyForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#020617',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
              />
              <Area type="monotone" dataKey="temp" name="Temp (°C)" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#tempGradient)" />
              <Area type="monotone" dataKey="rainProb" name="Rain Prob (%)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#rainGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 7-Day Forecast Grid */}
      <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 backdrop-blur-xl">
        <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-400" />
          7-Day Meteorological Outlook
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {weather.dailyForecast.map((day, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 shadow-inner backdrop-blur-md transition space-y-2 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-cyan-300 uppercase tracking-wider">{day.dayName}</span>
                <span className="text-[10px] text-slate-500 font-mono">{day.date.substring(5)}</span>
              </div>

              <div className="text-center py-2 space-y-1">
                <div className="text-[11px] text-slate-300 font-medium line-clamp-1">{day.condition}</div>
                <div className="flex items-center justify-center gap-2 text-base font-light">
                  <span className="text-amber-300 font-semibold">{Math.round(day.maxTemp)}°</span>
                  <span className="text-slate-600 text-xs">/</span>
                  <span className="text-cyan-400 font-semibold">{Math.round(day.minTemp)}°</span>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-white/10 text-[10px] text-slate-400 font-mono">
                <div className="flex justify-between items-center">
                  <span>Rain Prob:</span>
                  <span className="font-semibold text-cyan-400">{day.rainProb}%</span>
                </div>
                <div className="flex justify-between items-center truncate">
                  <span className="truncate">{day.windDesc}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
