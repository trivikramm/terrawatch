/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shield, ShieldAlert, ShieldCheck, HeartPulse } from 'lucide-react';

interface AQICardProps {
  aqi: {
    aqi: number; // 1 to 5
    pm25: number;
    pm10: number;
    co: number;
    no2: number;
    so2: number;
    o3: number;
  };
}

export default function AQICard({ aqi }: AQICardProps) {
  // Map index level (1 to 5) to custom thresholds
  const getAQIDetails = (level: number) => {
    switch (level) {
      case 1:
        return {
          label: 'Good',
          color: 'text-emerald-400 bg-emerald-950/20 border-emerald-800',
          indicatorColor: 'bg-emerald-500',
          desc: 'Air quality is considered satisfactory, and meteorological pollution poses little or no threat.',
          tip: 'Perfect conditions for outdoor sports, recreation, and fresh room airing.'
        };
      case 2:
        return {
          label: 'Fair',
          color: 'text-yellow-400 bg-yellow-950/20 border-yellow-850',
          indicatorColor: 'bg-yellow-400',
          desc: 'Air quality is acceptable; however, some pollutants may create minor concerns for sensitive profiles.',
          tip: 'No immediate limits needed for average profiles, but observe breathing ease.'
        };
      case 3:
        return {
          label: 'Moderate',
          color: 'text-orange-400 bg-orange-950/20 border-orange-850',
          indicatorColor: 'bg-orange-500',
          desc: 'Members of sensitive groups may experience minor health discomforts or respiratory symptoms.',
          tip: 'Sensitive individuals should reduce heavy external cardiorespiratory strain.'
        };
      case 4:
        return {
          label: 'Poor / Unhealthy',
          color: 'text-red-400 bg-red-950/20 border-red-800',
          indicatorColor: 'bg-red-500',
          desc: 'Everyone may begin to feel minor effects; sensitive groups can experience more serious respiratory effects.',
          tip: 'Consider closing window airing and limit heavy aerobic outdoor exercises.'
        };
      case 5:
        return {
          label: 'Hazardous',
          color: 'text-purple-450 bg-purple-950/20 border-purple-800',
          indicatorColor: 'bg-purple-500',
          desc: 'Atmospheric emergency. Active health warning limits apply to the entire local population.',
          tip: 'Keep air purifiers on active mode. Remain indoors and keep windows sealed.'
        };
      default:
        return {
          label: 'Moderate',
          color: 'text-slate-400 bg-slate-900/40 border-slate-800',
          indicatorColor: 'bg-slate-400',
          desc: 'Standard atmospheric composition tracked with normal seasonal variability.',
          tip: 'No restrictions on standard community activities.'
        };
    }
  };

  const details = getAQIDetails(aqi.aqi);

  // Pollutants data layout details
  const pollutants = [
    { name: 'PM2.5', value: aqi.pm25, unit: 'µg/m³', limit: 25, dec: 'Fine Particulates' },
    { name: 'PM10', value: aqi.pm10, unit: 'µg/m³', limit: 50, dec: 'Coarse Particulates' },
    { name: 'CO', value: aqi.co, unit: 'µg/m³', limit: 10000, dec: 'Carbon Monoxide' },
    { name: 'NO₂', value: aqi.no2, unit: 'µg/m³', limit: 40, dec: 'Nitrogen Dioxide' },
    { name: 'SO₂', value: aqi.so2, unit: 'µg/m³', limit: 350, dec: 'Sulfur Dioxide' },
    { name: 'O₃', value: aqi.o3, unit: 'µg/m³', limit: 100, dec: 'Ozone Concentrations' },
  ];

  return (
    <div id="aqi-card-panel" className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-lg backdrop-blur-md relative overflow-hidden flex flex-col justify-start gap-4 transition-colors duration-300">
      <div>
        <div className="flex items-center justify-between mb-4.5">
          <h3 className="text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
            <HeartPulse className="h-4 w-4 text-emerald-500 dark:text-emerald-400" /> Air Quality Assessment
          </h3>
          <span className={`text-[11px] font-bold border rounded-full px-3 py-0.5 shadow-sm ${details.color}`}>
            Index: {aqi.aqi} / 5 • {details.label}
          </span>
        </div>

        {/* Global Progress bar index */}
        <div className="relative h-2.5 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden flex mb-4.5">
          <div className="h-full bg-emerald-500 flex-1" />
          <div className="h-full bg-yellow-400 flex-1" />
          <div className="h-full bg-orange-500 flex-1" />
          <div className="h-full bg-red-500 flex-1" />
          <div className="h-full bg-purple-600 flex-1" />
          
          {/* Active indicator dot marker */}
          <div
            className={`absolute top-0 bottom-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 shadow-md ${details.indicatorColor} transform -translate-y-[1px]`}
            style={{ left: `${((aqi.aqi - 0.5) / 5) * 100}%` }}
          />
        </div>

        {/* Health Insights guidelines details */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-855 flex gap-2.5 items-start mb-4.5 transition-colors duration-300">
          {aqi.aqi <= 2 ? (
            <ShieldCheck className="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <p className="font-semibold text-slate-850 dark:text-slate-205">{details.desc}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{details.tip}</p>
          </div>
        </div>
      </div>

      {/* Grid of separate pollutants elements */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {pollutants.map((p) => {
          // Calculate percentage relative to recommended WHO exposure levels
          const ratio = Math.min((p.value / p.limit) * 100, 100);
          const barColor = ratio > 80 ? 'bg-red-500' : ratio > 40 ? 'bg-amber-400' : 'bg-emerald-400';
          
          return (
            <div key={p.name} className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 p-2.5 rounded-lg flex flex-col justify-between transition-colors duration-300">
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{p.name}</span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 truncate max-w-[55px] font-mono">{p.dec}</span>
                </div>
                <div className="text-[13px] font-bold font-mono text-slate-900 dark:text-white mt-1 whitespace-nowrap">
                  {p.value.toFixed(1)} <span className="text-[9px] text-slate-500 dark:text-slate-400 font-normal">{p.unit}</span>
                </div>
              </div>
              
              {/* mini index bar */}
              <div className="w-full h-1 bg-slate-100 dark:bg-slate-855 rounded-full mt-2.5 overflow-hidden">
                <div className={`h-full ${barColor}`} style={{ width: `${ratio}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
