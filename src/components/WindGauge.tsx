/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Compass, Wind, Navigation } from 'lucide-react';

interface WindGaugeProps {
  speed: number; // m/s
  deg: number; // degrees
  gust?: number; // m/s
}

export default function WindGauge({ speed, deg, gust }: WindGaugeProps) {
  // Convert m/s to km/h and knots
  const speedKmh = speed * 3.6;
  const speedKnots = speed * 1.94384;
  const gustKmh = gust ? gust * 3.6 : null;

  // Get compass direction abbreviation
  const getDirectionName = (heading: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const idx = Math.round(((heading % 360) / 22.5)) % 16;
    return directions[idx];
  };

  // Convert wind speed to description using Beaufort Scale
  const getBeaufortDescription = (windSpeedMs: number) => {
    if (windSpeedMs < 0.3) return 'Calm';
    if (windSpeedMs < 1.5) return 'Light air';
    if (windSpeedMs < 3.3) return 'Light breeze';
    if (windSpeedMs < 5.5) return 'Gentle breeze';
    if (windSpeedMs < 7.9) return 'Moderate breeze';
    if (windSpeedMs < 10.7) return 'Fresh breeze';
    if (windSpeedMs < 13.8) return 'Strong breeze';
    if (windSpeedMs < 17.1) return 'High wind / Near gale';
    if (windSpeedMs < 20.7) return 'Gale Force';
    if (windSpeedMs < 24.4) return 'Strong gale';
    if (windSpeedMs < 28.4) return 'Storm';
    return 'Violent Storm / Typhoon';
  };

  const directionName = getDirectionName(deg);
  const beaufortDesc = getBeaufortDescription(speed);

  return (
    <div id="wind-gauge-panel" className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-lg backdrop-blur-md relative overflow-hidden flex flex-col justify-start gap-4 h-auto transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
          <Wind className="h-4 w-4 text-cyan-600 dark:text-cyan-400" /> Wind Velocity Direction
        </h3>
        <span className="text-[10px] bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 rounded-full px-2.5 py-0.5 font-mono shadow-sm">
          Live Telemetry
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Animated Compass Dial */}
        <div className="flex justify-center items-center">
          <div className="relative w-36 h-36 rounded-full border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center shadow-inner transition-colors duration-300">
            {/* Compass ticks */}
            <span className="absolute top-1 text-[9px] font-bold text-red-500">N</span>
            <span className="absolute right-1.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 font-mono">E</span>
            <span className="absolute bottom-1 text-[9px] font-bold text-slate-400 dark:text-slate-500 font-mono">S</span>
            <span className="absolute left-1.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 font-mono">W</span>

            {/* Inner rotating arrow */}
            <div
              className="w-12 h-12 flex items-center justify-center transition-transform duration-1000 ease-out"
              style={{ transform: `rotate(${deg}deg)` }}
            >
              <Navigation className="h-8 w-8 text-cyan-500 dark:text-cyan-400 fill-cyan-500 dark:fill-cyan-400 transform -rotate-45" />
            </div>

            {/* Micro Degree Indicator overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-20">
              <span className="text-[10px] font-mono bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 border border-slate-200 dark:border-slate-800 rounded shadow-sm">
                {deg}° {directionName}
              </span>
            </div>
          </div>
        </div>

        {/* Speed Stats details block */}
        <div className="space-y-3.5">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Wind Velocity</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                {speed.toFixed(1)}
              </span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">m/s</span>
            </div>
            <div className="flex gap-2.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1">
              <span>{speedKmh.toFixed(1)} km/h</span>
              <span>•</span>
              <span>{speedKnots.toFixed(1)} knots</span>
            </div>
          </div>

          {gustKmh && (
            <div className="pt-2.5 border-t border-slate-150 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Atmospheric Gusts</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
                  {gust.toFixed(1)}
                </span>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-500">m/s</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">({gustKmh.toFixed(1)} km/h)</span>
              </div>
            </div>
          )}

          <div className="bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-805/40">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase tracking-wider font-bold">Sea State Index</span>
            <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-300 mt-0.5 block">{beaufortDesc}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
