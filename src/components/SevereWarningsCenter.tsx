import React, { useState, useEffect, useRef } from 'react';
import { HKOWarningItem } from '../types';
import { ShieldAlert, AlertTriangle, Radio, Eye } from 'lucide-react';

interface SevereWarningsCenterProps {
  warnings: HKOWarningItem[];
}

export const SevereWarningsCenter: React.FC<SevereWarningsCenterProps> = ({ warnings }) => {
  const [selectedSignalTab, setSelectedSignalTab] = useState<'active' | 'guide' | 'radar'>('active');
  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Doppler Radar Canvas simulation effect
  useEffect(() => {
    if (selectedSignalTab !== 'radar') return;
    const canvas = radarCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;
    const width = (canvas.width = 600);
    const height = (canvas.height = 500);

    const renderRadar = () => {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = 220;

      // Draw concentric distance rings (64km, 128km, 256km radar range)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let r = 50; r <= maxRadius; r += 50) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#06b6d4';
        ctx.font = '10px monospace';
        ctx.fillText(`${Math.round((r / maxRadius) * 256)}km`, centerX + r + 4, centerY - 4);
      }

      // Draw crosshairs
      ctx.beginPath();
      ctx.moveTo(centerX - maxRadius, centerY);
      ctx.lineTo(centerX + maxRadius, centerY);
      ctx.moveTo(centerX, centerY - maxRadius);
      ctx.lineTo(centerX, centerY + maxRadius);
      ctx.stroke();

      // Draw simulated Doppler precipitation reflectivity rainbands (dBZ colors)
      const stormX = centerX + Math.cos(angle * 0.2) * 40;
      const stormY = centerY + Math.sin(angle * 0.2) * 30;

      const radialGrad = ctx.createRadialGradient(stormX, stormY, 10, stormX, stormY, 110);
      radialGrad.addColorStop(0, 'rgba(236, 72, 153, 0.9)'); // Magenta core > 60 dBZ
      radialGrad.addColorStop(0.2, 'rgba(239, 68, 68, 0.85)'); // Red > 50 dBZ
      radialGrad.addColorStop(0.5, 'rgba(234, 179, 8, 0.7)'); // Yellow > 35 dBZ
      radialGrad.addColorStop(0.8, 'rgba(34, 197, 94, 0.5)'); // Green > 20 dBZ
      radialGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');

      ctx.fillStyle = radialGrad;
      ctx.beginPath();
      ctx.arc(stormX, stormY, 110, 0, Math.PI * 2);
      ctx.fill();

      // Draw rotating radar beam sweep line
      angle += 0.03;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(angle) * maxRadius, centerY + Math.sin(angle) * maxRadius);
      ctx.stroke();

      // Draw sweep sector fade
      const sectorGrad = ctx.createConicGradient(angle - Math.PI / 2, centerX, centerY);
      sectorGrad.addColorStop(0, 'rgba(6, 182, 212, 0.3)');
      sectorGrad.addColorStop(0.15, 'rgba(6, 182, 212, 0.0)');
      sectorGrad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

      ctx.fillStyle = sectorGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
      ctx.fill();

      // Label HK HKO Station Center
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 11px monospace';
      ctx.fillText('HKO HQ', centerX + 8, centerY - 8);

      animId = requestAnimationFrame(renderRadar);
    };

    renderRadar();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [selectedSignalTab]);

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.4)] shrink-0">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight uppercase">
              Hong Kong Severe Weather Warning Center
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Official HKO Signal Directory • 256km Doppler Radar • Emergency Protocols
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-full border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setSelectedSignalTab('active')}
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition ${
              selectedSignalTab === 'active'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Signals ({warnings.length})
          </button>
          <button
            onClick={() => setSelectedSignalTab('radar')}
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition ${
              selectedSignalTab === 'radar'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Doppler Radar
          </button>
          <button
            onClick={() => setSelectedSignalTab('guide')}
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition ${
              selectedSignalTab === 'guide'
                ? 'bg-white/20 text-white border border-white/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Signal Directory
          </button>
        </div>
      </div>

      {/* Tab Content 1: Active Warnings */}
      {selectedSignalTab === 'active' && (
        <div className="space-y-4">
          {warnings.length === 0 ? (
            <div className="bg-black/40 border border-white/10 rounded-2xl p-12 text-center space-y-3 backdrop-blur-xl">
              <div className="w-12 h-12 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center mx-auto border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                All Clear • No Severe Weather Warnings In Force
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto font-mono">
                Hong Kong Observatory reports tranquil regional atmospheric conditions. No Tropical Cyclone, Rainstorm, or Landslide warnings are currently active.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {warnings.map((warn, i) => (
                <div
                  key={i}
                  className={`p-5 rounded-2xl border shadow-2xl space-y-3 relative overflow-hidden backdrop-blur-xl ${
                    warn.severity === 'extreme'
                      ? 'bg-red-950/30 border-red-500/50 text-red-200'
                      : warn.severity === 'severe'
                      ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                      : 'bg-white/5 border-white/10 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-black/50 border border-current">
                      {warn.level || warn.name}
                    </span>
                    <span className="text-[10px] opacity-75 font-mono uppercase">
                      Issued {new Date(warn.issueTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} HKT
                    </span>
                  </div>

                  <h3 className="text-base font-bold tracking-tight uppercase">{warn.headline}</h3>
                  <p className="text-xs leading-relaxed opacity-90">{warn.details}</p>

                  <div className="pt-2 border-t border-current/20 flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 text-red-400">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      Status: IN FORCE
                    </span>
                    <span>Hong Kong Observatory</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Radar Simulation */}
      {selectedSignalTab === 'radar' && (
        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                HKO Doppler Weather Radar (256 km Range)
              </h3>
              <p className="text-[11px] text-slate-500 uppercase font-mono mt-0.5">
                Precipitation Reflectivity (dBZ) & Storm Sweep Tracker
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Light (20dBZ)
              </span>
              <span className="flex items-center gap-1 text-yellow-400">
                <span className="w-2 h-2 rounded-full bg-yellow-500" /> Mod (35dBZ)
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Heavy (50dBZ)
              </span>
              <span className="flex items-center gap-1 text-pink-400">
                <span className="w-2 h-2 rounded-full bg-pink-500" /> Extreme (65dBZ+)
              </span>
            </div>
          </div>

          <div className="flex justify-center bg-[#020617] rounded-xl p-4 border border-white/10 overflow-hidden">
            <canvas ref={radarCanvasRef} className="max-w-full rounded-lg shadow-2xl border border-white/10" />
          </div>
        </div>
      )}

      {/* Tab Content 3: HKO Signal Directory Reference */}
      {selectedSignalTab === 'guide' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-inner backdrop-blur-md space-y-3">
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-b border-white/10 pb-2">
              Tropical Cyclone Signals
            </div>
            <ul className="text-xs text-slate-300 space-y-2 font-mono text-[11px]">
              <li className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                <strong className="text-amber-300">T1 Standby Signal:</strong> Cyclone within 800km of HK.
              </li>
              <li className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                <strong className="text-amber-400">T3 Strong Wind Signal:</strong> Winds 41-62 km/h, gusts &gt; 110 km/h.
              </li>
              <li className="p-2.5 rounded-xl bg-black/40 border border-red-500/30">
                <strong className="text-red-400">T8 Gale/Storm Signal:</strong> Winds 63-117 km/h. Transport halts.
              </li>
              <li className="p-2.5 rounded-xl bg-black/40 border border-red-500/40">
                <strong className="text-red-500">T9 Increasing Storm:</strong> Gale winds increasing rapidly.
              </li>
              <li className="p-2.5 rounded-xl bg-black/40 border border-purple-500/40">
                <strong className="text-purple-400">T10 Hurricane Signal:</strong> Winds &gt; 118 km/h, gusts &gt; 220 km/h.
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-inner backdrop-blur-md space-y-3">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-widest border-b border-white/10 pb-2">
              Rainstorm Warning Signals
            </div>
            <ul className="text-xs text-slate-300 space-y-2 font-mono text-[11px]">
              <li className="p-2.5 rounded-xl bg-black/40 border border-amber-500/30">
                <strong className="text-amber-400">Amber Rainstorm:</strong> Heavy rain exceeded 30 mm/h.
              </li>
              <li className="p-2.5 rounded-xl bg-black/40 border border-red-500/30">
                <strong className="text-red-400">Red Rainstorm:</strong> Torrential rain exceeded 50 mm/h.
              </li>
              <li className="p-2.5 rounded-xl bg-black/40 border border-purple-500/30">
                <strong className="text-purple-300">Black Rainstorm:</strong> Extreme rain exceeded 70 mm/h. Urban flood risk.
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-inner backdrop-blur-md space-y-3">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest border-b border-white/10 pb-2">
              Special Warning Signals
            </div>
            <ul className="text-xs text-slate-300 space-y-2 font-mono text-[11px]">
              <li className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                <strong className="text-amber-300">Landslide Warning:</strong> High risk of landslips on mountain slopes.
              </li>
              <li className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                <strong className="text-cyan-300">Cold Weather Warning:</strong> Temp &lt; 12°C in urban areas, high ground frost.
              </li>
              <li className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                <strong className="text-rose-300">Very Hot Weather:</strong> Severe heat risk under extreme temperature & UV.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
