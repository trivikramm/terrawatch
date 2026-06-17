/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Sun,
  CloudLightning,
  CloudRain,
  Cloud,
  Snowflake,
  Eye,
  Gauge,
  Droplets,
  Sunset,
  Sunrise,
  Compass,
} from 'lucide-react';
import { WeatherData } from '../types';

interface WeatherCardProps {
  weather: WeatherData;
}

export default function WeatherCard({ weather }: WeatherCardProps) {
  const { current } = weather;

  // Format epoch timestamps to standard time strings
  const formatTime = (epoch: number) => {
    return new Date(epoch * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Select dynamic weather icons and visual gradient theme depending on "current.main" state
  const getWeatherTheme = (category: string) => {
    const minCategory = category.toLowerCase();
    if (minCategory.includes('thunderstorm')) {
      return {
        gradient: 'from-violet-50 via-slate-50 to-violet-100 dark:from-violet-950/70 dark:via-slate-900/80 dark:to-slate-950/80 border-violet-250 dark:border-violet-800/40',
        textColor: 'text-violet-600 dark:text-violet-400',
        glowColor: 'shadow-violet-200/50 dark:shadow-violet-950/30',
        icon: <CloudLightning className="h-16 w-16 text-violet-600 dark:text-violet-400 animate-bounce" />,
      };
    }
    if (minCategory.includes('rain') || minCategory.includes('drizzle')) {
      return {
        gradient: 'from-blue-50 via-slate-50 to-blue-100 dark:from-blue-950/70 dark:via-slate-900/80 dark:to-slate-950/80 border-blue-250 dark:border-blue-800/40',
        textColor: 'text-blue-600 dark:text-blue-400',
        glowColor: 'shadow-blue-200/50 dark:shadow-blue-950/30',
        icon: <CloudRain className="h-16 w-16 text-blue-500 dark:text-blue-450 animate-pulse" />,
      };
    }
    if (minCategory.includes('snow')) {
      return {
        gradient: 'from-sky-50 via-slate-50 to-sky-100 dark:from-sky-950/60 dark:via-slate-900/80 dark:to-slate-950/80 border-sky-200 dark:border-sky-800',
        textColor: 'text-sky-605 dark:text-sky-300',
        glowColor: 'shadow-sky-100 dark:shadow-sky-950/20',
        icon: <Snowflake className="h-16 w-16 text-sky-500 dark:text-sky-250 animate-spin_slow" />,
      };
    }
    if (minCategory.includes('clear')) {
      return {
        gradient: 'from-amber-50 via-slate-50 to-amber-100 dark:from-amber-950/50 dark:via-slate-900/80 dark:to-slate-950/80 border-amber-250 dark:border-amber-800/30',
        textColor: 'text-amber-600 dark:text-amber-400',
        glowColor: 'shadow-amber-100 dark:shadow-amber-950/20',
        icon: <Sun className="h-16 w-16 text-amber-500 dark:text-amber-400 animate-pulse" />,
      };
    }
    // Default / Clouds / Fog
    return {
      gradient: 'from-slate-100 via-slate-50 to-slate-100/80 dark:from-slate-900/60 dark:via-slate-900/80 dark:to-slate-950/80 border-slate-200 dark:border-slate-800/60',
      textColor: 'text-cyan-600 dark:text-cyan-450',
      glowColor: 'shadow-slate-100 dark:shadow-slate-950/30',
      icon: <Cloud className="h-16 w-16 text-slate-500 dark:text-slate-300" />,
    };
  };

  const theme = getWeatherTheme(current.main);

  // Compass direction name (0 to 360)
  const getWindDirectionName = (heading: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const idx = Math.round(((heading % 360) / 45)) % 8;
    return directions[idx];
  };

  // UV index category label
  const getUVBadge = (uv: number) => {
    if (uv <= 2) return { label: 'Low Risk', style: 'bg-emerald-950 text-emerald-400 border-emerald-900' };
    if (uv <= 5) return { label: 'Moderate', style: 'bg-yellow-950 text-yellow-400 border-yellow-900' };
    if (uv <= 7) return { label: 'High Exposure', style: 'bg-orange-950 text-orange-400 border-orange-900' };
    return { label: 'EXTREME UV', style: 'bg-red-950 text-red-400 border-red-900 font-bold animate-pulse' };
  };

  const uvBadge = getUVBadge(current.uvi);

  return (
    <div id="meteorology-focal-card" className={`relative bg-gradient-to-br ${theme.gradient} border rounded-2xl p-6 shadow-2xl backdrop-blur-md overflow-hidden ${theme.glowColor}`}>
      {/* Decorative backdrop elements */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Title & Coordinate Info Row */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-ping inline-block" /> Active Weather Intelligence
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1.5 leading-tight break-words">{weather.city}</h2>
          </div>
          <div className="text-left sm:text-right shrink-0 mt-1 sm:mt-2">
            <span className="text-[10px] bg-slate-100/80 dark:bg-slate-900/80 border border-slate-205 dark:border-slate-800 rounded px-2.5 py-1 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap inline-block shadow-sm">
              {new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase mt-0.5">
          Coordinate Focus: Lat {weather.lat.toFixed(3)} | Lon {weather.lon.toFixed(3)}
        </p>
      </div>

      {/* Temperature & Main Description block */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-805/40 mb-6">
        <div className="flex items-center gap-4">
          <div className="shrink-0">{theme.icon}</div>
          <div>
            <div className="flex items-baseline">
              <span className="text-5xl font-black font-mono tracking-tighter text-slate-900 dark:text-white">
                {current.temp.toFixed(1)}
              </span>
              <span className="text-2xl font-bold text-slate-500 dark:text-slate-300 ml-0.5">°C</span>
            </div>
            <p className="text-sm font-semibold capitalize text-slate-700 dark:text-slate-300 mt-1">{current.description}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Feels like <span className="text-slate-800 dark:text-slate-200 font-bold">{current.feels_like.toFixed(1)}°C</span>
            </p>
          </div>
        </div>

        {/* Sunrise/Sunset widgets */}
        <div className="flex gap-4">
          <div className="bg-slate-100/70 dark:bg-slate-950/40 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
            <Sunrise className="h-5 w-5 text-amber-500 dark:text-amber-400" />
            <div>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">Sunrise</span>
              <span className="text-xs font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                {formatTime(current.sunrise)}
              </span>
            </div>
          </div>

          <div className="bg-slate-100/70 dark:bg-slate-950/40 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
            <Sunset className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            <div>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">Sunset</span>
              <span className="text-xs font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                {formatTime(current.sunset)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Parameters Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="bg-slate-100/50 dark:bg-slate-950/30 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between min-h-[90px] transition-all">
          <div className="flex items-center gap-1.5">
            <Droplets className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
            <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Humidity</span>
          </div>
          <div className="mt-1">
            <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white block leading-tight">
              {current.humidity}%
            </span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-mono leading-none mt-1">Dew: {current.dew_point.toFixed(1)}°C</span>
          </div>
        </div>

        <div className="bg-slate-100/50 dark:bg-slate-950/30 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between min-h-[90px] transition-all">
          <div className="flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Pressure</span>
          </div>
          <div className="mt-1">
            <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white block leading-tight">
              {typeof current.pressure === 'number' ? Math.round(current.pressure) : current.pressure} <span className="text-[10px] text-slate-500 dark:text-slate-450 font-normal">hPa</span>
            </span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-mono leading-none mt-1">MSL Atmospheric</span>
          </div>
        </div>

        <div className="bg-slate-100/50 dark:bg-slate-950/30 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between min-h-[90px] transition-all">
          <div className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Visibility</span>
          </div>
          <div className="mt-1">
            <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white block leading-tight">
              {(current.visibility / 1000).toFixed(1)} <span className="text-[10px] text-slate-500 dark:text-slate-450 font-normal font-sans">km</span>
            </span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-mono leading-none mt-1">Aerosol Clarity</span>
          </div>
        </div>

        <div className="bg-slate-100/50 dark:bg-slate-950/30 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between min-h-[90px] transition-all">
          <div className="flex items-center gap-1.5">
            <Sun className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">UV Index</span>
          </div>
          <div className="mt-1 flex flex-col gap-1">
            <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white block leading-none">
              {current.uvi.toFixed(1)}
            </span>
            <span className={`text-[8px] font-bold border rounded px-1.5 py-0.5 block w-max uppercase leading-none ${uvBadge.style}`}>
              {uvBadge.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
