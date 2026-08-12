import React, { useState } from 'react';
import { fetchGeminiRegionalTrendForecast } from '../services/weatherService';
import { TrendingUp, Globe, Sparkles, AlertOctagon, ShieldCheck, MapPin, Play } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface RegionOption {
  id: string;
  name: string;
  coords: string;
  description: string;
  temp2050: number;
  seaLevel2050: number;
  precipChange: number;
}

const REGION_OPTIONS: RegionOption[] = [
  {
    id: 'prd',
    name: 'East Asia & Pearl River Delta',
    coords: '22.3°N, 114.1°E',
    description: 'High-density coastal megacity zone (Hong Kong, Shenzhen, Guangzhou). Vulnerable to storm surges & super-typhoon intensification.',
    temp2050: 2.8,
    seaLevel2050: 38,
    precipChange: 25,
  },
  {
    id: 'us_east',
    name: 'North America Atlantic Seaboard',
    coords: '40.7°N, 74.0°W',
    description: 'Northeastern U.S. megalopolis (New York, Boston, DC). Accelerated sea level rise & atmospheric river flooding events.',
    temp2050: 2.5,
    seaLevel2050: 42,
    precipChange: 20,
  },
  {
    id: 'us_pacific',
    name: 'North America Pacific Coast',
    coords: '34.1°N, 118.2°W',
    description: 'California & Pacific Northwest (Los Angeles, San Francisco, Seattle). Atmospheric river bombardment, prolonged megadroughts & wildfire smoke risks.',
    temp2050: 2.7,
    seaLevel2050: 32,
    precipChange: 12,
  },
  {
    id: 'weu',
    name: 'Western Europe Maritime Basin',
    coords: '51.5°N, 0.1°W',
    description: 'North Sea & English Channel coasts (London, Paris, Amsterdam). Jet stream wobbles bringing intense marine heatwaves & flash pluvial floods.',
    temp2050: 2.1,
    seaLevel2050: 30,
    precipChange: 18,
  },
  {
    id: 'med',
    name: 'Mediterranean & Southern Europe',
    coords: '41.9°N, 12.5°E',
    description: 'Southern Europe & North Africa (Rome, Madrid, Athens, Tunis). Desertification risk, extreme summer heatwaves & intense wildfire sea-breezes.',
    temp2050: 3.2,
    seaLevel2050: 28,
    precipChange: -15,
  },
  {
    id: 'sea',
    name: 'Southeast Asia Equatorial Belt',
    coords: '1.3°N, 103.8°E',
    description: 'Singapore, Jakarta, Manila, Bangkok. Extreme tropical wet-bulb heat stress, tidal inundation & shifting monsoon patterns.',
    temp2050: 3.1,
    seaLevel2050: 45,
    precipChange: 30,
  },
  {
    id: 'south_asia',
    name: 'South Asia Indian Ocean Monsoon',
    coords: '19.0°N, 72.8°E',
    description: 'Mumbai, New Delhi, Kolkata, Dhaka. Super-cyclone intensification in Bay of Bengal & volatile monsoon downpours.',
    temp2050: 3.0,
    seaLevel2050: 40,
    precipChange: 35,
  },
  {
    id: 'middle_east',
    name: 'Middle East & Arabian Gulf',
    coords: '25.2°N, 55.3°E',
    description: 'Dubai, Riyadh, Doha, Abu Dhabi. Extreme hyper-arid wet-bulb limits exceeding 50°C, dust storms & coastal infrastructure adaptation.',
    temp2050: 3.6,
    seaLevel2050: 25,
    precipChange: -20,
  },
  {
    id: 'sub_saharan',
    name: 'Sub-Saharan West & East Africa',
    coords: '6.5°N, 3.4°E',
    description: 'Lagos, Nairobi, Accra, Dakar. Coastal erosion, extreme precipitation variability & urban heat island acceleration.',
    temp2050: 3.3,
    seaLevel2050: 36,
    precipChange: 22,
  },
  {
    id: 'latam',
    name: 'Latin America & Amazon Basin',
    coords: '-23.5°S, 46.6°W',
    description: 'São Paulo, Buenos Aires, Rio, Bogotá. Amazonian rain-forest feedback shifts, intense urban flash flooding & tropical storm tracks.',
    temp2050: 2.9,
    seaLevel2050: 35,
    precipChange: 15,
  },
  {
    id: 'oceania',
    name: 'Oceania & South Pacific Basin',
    coords: '-33.8°S, 151.2°E',
    description: 'Sydney, Auckland, Suva, Pacific Coral Atolls. Marine heatwaves causing coral bleaching, extreme bushfire seasons & king tide flooding.',
    temp2050: 2.6,
    seaLevel2050: 48,
    precipChange: 10,
  },
];

export const RegionalTrendForecaster: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<RegionOption>(REGION_OPTIONS[0]);
  const [targetHorizon, setTargetHorizon] = useState<'2030' | '2040' | '2050'>('2050');
  const [aiReport, setAiReport] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateForecast = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchGeminiRegionalTrendForecast({
        regionName: selectedRegion.name,
        coordinates: selectedRegion.coords,
        targetHorizon,
      });
      setAiReport(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate regional trend forecast');
    } finally {
      setIsLoading(false);
    }
  };

  // Comparative regional data for Recharts
  const chartData = REGION_OPTIONS.map((r) => ({
    name: r.name.split(' ')[0],
    temp: r.temp2050,
    seaLevel: r.seaLevel2050,
    precip: r.precipChange,
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0">
            <TrendingUp className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight uppercase">
              Global Regional Climate Trend Forecaster
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Decadal climate trajectory models, severe storm frequency shifts & AI adaptation roadmaps.
            </p>
          </div>
        </div>

        {/* Horizon Picker */}
        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-full border border-white/10 self-start md:self-auto font-mono">
          <span className="text-[10px] text-slate-400 px-3 uppercase tracking-wider font-semibold">Horizon:</span>
          {(['2030', '2040', '2050'] as const).map((h) => (
            <button
              key={h}
              onClick={() => {
                setTargetHorizon(h);
                setAiReport(null);
              }}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition ${
                targetHorizon === h
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      {/* Region Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REGION_OPTIONS.map((reg) => {
          const isSelected = selectedRegion.id === reg.id;
          return (
            <div
              key={reg.id}
              onClick={() => {
                setSelectedRegion(reg);
                setAiReport(null);
              }}
              className={`p-5 rounded-2xl border transition cursor-pointer space-y-3 backdrop-blur-md ${
                isSelected
                  ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:border-cyan-500/30 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-white">{reg.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/50 text-cyan-400 border border-cyan-500/30">
                  {reg.coords}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-mono text-[11px]">{reg.description}</p>

              <div className="pt-2 border-t border-white/10 grid grid-cols-3 gap-2 text-[10px] font-mono text-center">
                <div className="bg-black/40 p-2 rounded-xl border border-white/10">
                  <div className="text-[9px] text-slate-500 uppercase">Temp Shift</div>
                  <div className="font-bold text-amber-300">+{reg.temp2050}°C</div>
                </div>
                <div className="bg-black/40 p-2 rounded-xl border border-white/10">
                  <div className="text-[9px] text-slate-500 uppercase">Sea Level</div>
                  <div className="font-bold text-cyan-300">+{reg.seaLevel2050} cm</div>
                </div>
                <div className="bg-black/40 p-2 rounded-xl border border-white/10">
                  <div className="text-[9px] text-slate-500 uppercase">Precip Surge</div>
                  <div className="font-bold text-blue-300">+{reg.precipChange}%</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recharts Comparative Regional Trends */}
      <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 backdrop-blur-xl">
        <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          Cross-Regional Sea Level Rise Projections by {targetHorizon} (cm)
        </h3>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)', fontSize: '12px', fontFamily: 'monospace' }} />
              <Bar dataKey="seaLevel" name="Sea Level Rise (cm)" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gemini AI Regional Trend Trigger */}
      <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Gemini AI Regional Trend Forecast ({selectedRegion.name} • {targetHorizon})
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Climate vulnerability assessments, storm frequency forecasts & strategic adaptation plans.
            </p>
          </div>

          <button
            onClick={handleGenerateForecast}
            disabled={isLoading}
            className="px-4 py-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold text-xs uppercase tracking-wider rounded-full shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:bg-cyan-500/30 disabled:opacity-50 transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                Computing Climate Models...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Generate AI Regional Report
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-mono">
            {error}
          </div>
        )}

        {/* AI Result Card */}
        {aiReport && (
          <div className="mt-4 bg-[#020617] border border-white/10 rounded-xl p-5 space-y-4 text-xs text-slate-200 animate-fadeIn font-mono">
            <div className="space-y-1">
              <h4 className="font-bold text-cyan-300 text-xs uppercase tracking-wider">Executive Regional Summary</h4>
              <p className="leading-relaxed text-slate-300 text-[11px]">{aiReport.summary}</p>
            </div>

            {aiReport.temperatureAndPrecipitationTrend && (
              <div className="space-y-1 pt-2 border-t border-white/10">
                <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider">Thermal & Precipitation Extreme Shifts</h4>
                <p className="leading-relaxed text-slate-300 text-[11px]">{aiReport.temperatureAndPrecipitationTrend}</p>
              </div>
            )}

            {aiReport.severeWeatherShift && (
              <div className="space-y-1 pt-2 border-t border-white/10">
                <h4 className="font-bold text-rose-400 text-xs uppercase tracking-wider">Typhoon & Storm Surge Intensification</h4>
                <p className="leading-relaxed text-slate-300 text-[11px]">{aiReport.severeWeatherShift}</p>
              </div>
            )}

            {aiReport.socioEconomicVulnerability && (
              <div className="space-y-1 pt-2 border-t border-white/10">
                <h4 className="font-bold text-cyan-300 text-xs uppercase tracking-wider">Infrastructure & Supply Chain Vulnerabilities</h4>
                <p className="leading-relaxed text-slate-300 text-[11px]">{aiReport.socioEconomicVulnerability}</p>
              </div>
            )}

            {aiReport.strategicAdaptations && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider">High-Priority Regional Adaptation Projects</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                  {Array.isArray(aiReport.strategicAdaptations)
                    ? aiReport.strategicAdaptations.map((strat: string, idx: number) => (
                        <li key={idx}>{strat}</li>
                      ))
                    : <li>{String(aiReport.strategicAdaptations)}</li>}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
