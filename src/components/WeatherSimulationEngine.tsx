import React, { useState, useEffect } from 'react';
import { HistoricalPreset, SimulationAnalysis, SimulationDataPoint, SimulationParams } from '../types';
import { HISTORICAL_PRESETS, runAtmosphericSimulation } from '../utils/simulationEngine';
import { fetchGeminiSimulationAnalysis } from '../services/weatherService';
import { Cpu, Play, RotateCcw, Sparkles, Wind, Droplets, ShieldAlert, BarChart2, Layers, Compass, Sliders, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';

export const WeatherSimulationEngine: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('mangkhut_2018');
  const [params, setParams] = useState<SimulationParams>(HISTORICAL_PRESETS[0].params);
  
  const [simulationData, setSimulationData] = useState<{
    points: SimulationDataPoint[];
    summary: SimulationAnalysis;
  } | null>(null);

  const [aiReport, setAiReport] = useState<any | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Run deterministic atmospheric model whenever parameters change
  useEffect(() => {
    const result = runAtmosphericSimulation(params);
    setSimulationData(result);
  }, [params]);

  const handleSelectPreset = (preset: HistoricalPreset) => {
    setSelectedPresetId(preset.id);
    setParams({ ...preset.params });
    setAiReport(null);
    setAiError(null);
  };

  const handleRunAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const result = await fetchGeminiSimulationAnalysis(params);
      setAiReport(result);
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate AI scenario report');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight uppercase">
              Interactive Weather & Severe Event Simulation Engine
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Model historical HK benchmarks or adjust atmospheric parameters for hydro-dynamic forecasting.
            </p>
          </div>
        </div>
      </div>

      {/* Historical Event Preset Selector Row */}
      <div className="bg-black/40 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-3 backdrop-blur-xl">
        <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center justify-between">
          <span>Historical Extreme Benchmarks & Climate Scenarios</span>
          <span className="text-slate-400 font-mono text-[10px]">Select preset to load telemetry</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {HISTORICAL_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`text-left p-4 rounded-xl border transition flex flex-col justify-between space-y-2 backdrop-blur-md ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:border-cyan-500/30 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider">{preset.name}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-black/50 text-cyan-400 font-mono border border-cyan-500/30">
                    {preset.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-mono">
                  {preset.description}
                </p>
                <div className="text-[10px] text-cyan-400 font-mono tracking-wider uppercase pt-1">
                  {preset.locationName} • {preset.dateStr}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Sliders & Live Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Parameter Panel (5 cols) */}
        <div className="lg:col-span-5 bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              Atmospheric Parameter Controls
            </h3>
            <button
              onClick={() => {
                const preset = HISTORICAL_PRESETS.find((p) => p.id === selectedPresetId);
                if (preset) setParams({ ...preset.params });
              }}
              className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 font-mono uppercase tracking-wider"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Location & Elevation */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold flex justify-between uppercase">
                <span>Location Name</span>
                <span className="text-cyan-400">{params.locationName}</span>
              </label>
              <input
                type="text"
                value={params.locationName}
                onChange={(e) => setParams({ ...params, locationName: e.target.value })}
                className="w-full bg-[#020617] border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-cyan-500 outline-none"
              />
            </div>

            {/* Central Pressure Drop (hPa) */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold uppercase">
                <span className="text-slate-300">Central Pressure Drop</span>
                <span className="text-cyan-400">
                  -{params.centralPressureDropHpa} hPa ({1013 - params.centralPressureDropHpa} hPa)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={params.centralPressureDropHpa}
                onChange={(e) => setParams({ ...params, centralPressureDropHpa: Number(e.target.value) })}
                className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Sea Surface Temperature (°C) */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold uppercase">
                <span className="text-slate-300">Sea Surface Temp (SST °C)</span>
                <span className="text-amber-400">{params.seaSurfaceTempC}°C</span>
              </div>
              <input
                type="range"
                min="18"
                max="34"
                step="0.5"
                value={params.seaSurfaceTempC}
                onChange={(e) => setParams({ ...params, seaSurfaceTempC: Number(e.target.value) })}
                className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Base Temp & Offset */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold uppercase">
                <span className="text-slate-300">Climate Temp Offset</span>
                <span className="text-purple-400">
                  {params.tempOffsetC > 0 ? `+${params.tempOffsetC}` : params.tempOffsetC}°C
                </span>
              </div>
              <input
                type="range"
                min="-12"
                max="8"
                step="0.5"
                value={params.tempOffsetC}
                onChange={(e) => setParams({ ...params, tempOffsetC: Number(e.target.value) })}
                className="w-full accent-purple-400 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Relative Humidity (%) */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold uppercase">
                <span className="text-slate-300">Relative Humidity</span>
                <span className="text-blue-400">{params.relativeHumidityPct}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                step="1"
                value={params.relativeHumidityPct}
                onChange={(e) => setParams({ ...params, relativeHumidityPct: Number(e.target.value) })}
                className="w-full accent-blue-400 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Wind Shear (kts) */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold uppercase">
                <span className="text-slate-300">Tropospheric Wind Shear</span>
                <span className="text-slate-400">{params.windShearKts} kts</span>
              </div>
              <input
                type="range"
                min="2"
                max="45"
                step="1"
                value={params.windShearKts}
                onChange={(e) => setParams({ ...params, windShearKts: Number(e.target.value) })}
                className="w-full accent-slate-400 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* CO2 Baseline (ppm) */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold uppercase">
                <span className="text-slate-300">Greenhouse CO2</span>
                <span className="text-emerald-400">{params.co2Ppm} ppm</span>
              </div>
              <input
                type="range"
                min="350"
                max="650"
                step="5"
                value={params.co2Ppm}
                onChange={(e) => setParams({ ...params, co2Ppm: Number(e.target.value) })}
                className="w-full accent-emerald-400 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>
          </div>
        </div>

        {/* Live Simulation Output & Charts (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {simulationData && (
            <>
              {/* Summary Impact Scorecard Card */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                      HKO Equivalent Signal Prediction
                    </div>
                    <div className="text-xl font-black text-white uppercase tracking-tight">
                      {simulationData.summary.hkoSignalEquivalent}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 uppercase font-mono tracking-wider">Severity Index</div>
                    <div className="text-3xl font-thin text-amber-400 font-mono">
                      {simulationData.summary.severityScore}<span className="text-xs text-slate-500">/100</span>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 shadow-inner backdrop-blur-md">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Peak Gust Speed</div>
                    <div className="text-lg font-thin text-cyan-300 font-mono">{simulationData.summary.peakGust} <span className="text-xs text-slate-400">km/h</span></div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 shadow-inner backdrop-blur-md">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Min Pressure</div>
                    <div className="text-lg font-thin text-blue-300 font-mono">{simulationData.summary.minPressure} <span className="text-xs text-slate-400">hPa</span></div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 shadow-inner backdrop-blur-md">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Total Rainfall</div>
                    <div className="text-lg font-thin text-indigo-300 font-mono">{simulationData.summary.totalAccumulatedRainfall} <span className="text-xs text-slate-400">mm</span></div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 shadow-inner backdrop-blur-md">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Peak Storm Surge</div>
                    <div className="text-lg font-thin text-rose-300 font-mono">+{simulationData.summary.maxStormSurge} <span className="text-xs text-slate-400">m</span></div>
                  </div>
                </div>

                {/* Infrastructure Risk Badges */}
                <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2 text-[10px] font-mono uppercase">
                  <span className="px-3 py-1 rounded-full bg-black/50 text-slate-300 border border-white/10">
                    Coastal Flooding: <strong className="text-rose-400">{simulationData.summary.infrastructureRisk.coastalFlooding}</strong>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-black/50 text-slate-300 border border-white/10">
                    Aviation: <strong className="text-amber-400">{simulationData.summary.infrastructureRisk.aviationDisruption}</strong>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-black/50 text-slate-300 border border-white/10">
                    Landslide Hazard: <strong className="text-purple-400">{simulationData.summary.infrastructureRisk.landslideRisk}</strong>
                  </span>
                </div>
              </div>

              {/* Simulation Time Series Graph: Wind & Pressure */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-3 backdrop-blur-xl">
                <div className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center justify-between">
                  <span>Simulated Wind Speed (km/h) & Pressure Drop (hPa)</span>
                  <span className="text-slate-500 font-mono text-[10px]">T+0h to T+36h Timeline</span>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simulationData.points} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                      <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)', fontSize: '11px', fontFamily: 'monospace' }} />
                      <Line type="monotone" dataKey="windGust" name="Peak Gust (km/h)" stroke="#ef4444" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="windSpeed" name="Sustained Wind" stroke="#06b6d4" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Simulation Time Series Graph: Rain & Surge */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-3 backdrop-blur-xl">
                <div className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center justify-between">
                  <span>Precipitation Rate (mm/h) & Storm Surge Level (m)</span>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={simulationData.points} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                      <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)', fontSize: '11px', fontFamily: 'monospace' }} />
                      <Area type="monotone" dataKey="rainIntensity" name="Rain Intensity (mm/h)" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="stormSurgeMeters" name="Storm Surge (m)" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* AI Gemini Scenario Report Trigger Button */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Gemini AI Extreme Weather Impact Analysis
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Generate physics-grounded AI scenario assessment & disaster response strategies.
                </p>
              </div>

              <button
                onClick={handleRunAiAnalysis}
                disabled={isAiLoading}
                className="px-4 py-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold text-xs uppercase tracking-wider rounded-full shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:bg-cyan-500/30 disabled:opacity-50 transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                {isAiLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    Analyzing Climate Physics...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" /> Run AI Scenario Deep-Dive
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-mono">
                {aiError}
              </div>
            )}

            {/* AI Generated Structured Report Card */}
            {aiReport && (
              <div className="mt-4 bg-[#020617] border border-white/10 rounded-xl p-5 space-y-4 text-xs text-slate-200 animate-fadeIn font-mono">
                <div className="space-y-1">
                  <h4 className="font-bold text-cyan-300 text-xs uppercase tracking-wider">Overview & Climate Physics</h4>
                  <p className="leading-relaxed text-slate-300 text-[11px]">{aiReport.overview}</p>
                </div>

                {aiReport.comparisonToHistorical && (
                  <div className="space-y-1 pt-2 border-t border-white/10">
                    <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider">Comparison to Real Historical Benchmarks</h4>
                    <p className="leading-relaxed text-slate-300 text-[11px]">{aiReport.comparisonToHistorical}</p>
                  </div>
                )}

                {aiReport.coastalAndSurgeImpact && (
                  <div className="space-y-1 pt-2 border-t border-white/10">
                    <h4 className="font-bold text-rose-400 text-xs uppercase tracking-wider">Storm Surge & Coastal Inundation Risk</h4>
                    <p className="leading-relaxed text-slate-300 text-[11px]">{aiReport.coastalAndSurgeImpact}</p>
                  </div>
                )}

                {aiReport.urbanInfrastructureRisk && (
                  <div className="space-y-1 pt-2 border-t border-white/10">
                    <h4 className="font-bold text-purple-300 text-xs uppercase tracking-wider">Urban Infrastructure & Transportation Resilience</h4>
                    <p className="leading-relaxed text-slate-300 text-[11px]">{aiReport.urbanInfrastructureRisk}</p>
                  </div>
                )}

                {aiReport.disasterPreparednessAdvice && (
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider">Recommended Emergency Action Plan</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                      {Array.isArray(aiReport.disasterPreparednessAdvice)
                        ? aiReport.disasterPreparednessAdvice.map((adv: string, idx: number) => (
                            <li key={idx}>{adv}</li>
                          ))
                        : <li>{String(aiReport.disasterPreparednessAdvice)}</li>}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
