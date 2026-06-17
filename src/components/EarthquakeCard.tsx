/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Earthquake } from '../types';
import { AlertCircle, Waves, Clock } from 'lucide-react';

interface EarthquakeCardProps {
  key?: string;
  eq: Earthquake;
  isSelected: boolean;
  onClick: () => void;
}

export default function EarthquakeCard({ eq, isSelected, onClick }: EarthquakeCardProps) {
  // Color classification based on magnitude
  const getMagStyle = (mag: number) => {
    if (mag >= 6.0) {
      return {
        bg: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 hover:bg-red-100 dark:hover:bg-red-500/15',
        badge: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-300 dark:border-red-900',
        line: 'bg-red-500',
      };
    }
    if (mag >= 4.0) {
      return {
        bg: 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/25 hover:bg-orange-100 dark:hover:bg-orange-500/15',
        badge: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-900',
        line: 'bg-orange-500',
      };
    }
    if (mag >= 2.0) {
      return {
        bg: 'bg-yellow-50/50 dark:bg-yellow-500/5 border-yellow-250 dark:border-yellow-500/20 hover:bg-yellow-100 dark:hover:bg-yellow-500/10',
        badge: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-750 dark:text-yellow-400 border-yellow-300 dark:border-yellow-905',
        line: 'bg-yellow-500',
      };
    }
    return {
      bg: 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-250 dark:border-emerald-500/20 hover:bg-emerald-50 dark:hover:bg-emerald-500/10',
      badge: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-705 dark:text-emerald-450 border-emerald-300 dark:border-emerald-900',
      line: 'bg-emerald-500',
    };
  };

  const style = getMagStyle(eq.magnitude);

  return (
    <div
      onClick={onClick}
      className={`relative border rounded-xl p-3.5 cursor-pointer transition-all duration-300 flex flex-col justify-between select-none ${
        isSelected
          ? 'border-cyan-500 dark:border-cyan-400 bg-cyan-50/50 dark:bg-slate-800/50 shadow-cyan-200/50 dark:shadow-cyan-950/20 shadow-md translate-x-1'
          : `${style.bg} hover:border-slate-300 dark:hover:border-slate-705`
      }`}
    >
      {/* Decorative vertical line indicating categorization strength */}
      <div className={`absolute top-0 bottom-0 left-0 w-1 rounded-l-xl ${style.line}`} />

      {/* Magnitude and Location details */}
      <div className="flex justify-between items-start gap-3 pl-1.5 mb-1.5">
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-white transition-colors duration-300 leading-snug hover:text-cyan-600 dark:hover:text-cyan-400">
            {eq.place}
          </h4>
          <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <Clock className="h-3 w-3 text-slate-400 dark:text-slate-505" />
            <span>{new Date(eq.time).toLocaleTimeString()} {new Date(eq.time).toLocaleDateString()}</span>
          </p>
        </div>

        {/* Magnitude badge shape */}
        <div className={`px-2 py-0.5 rounded border text-xs font-extrabold font-mono shrink-0 shadow-sm ${style.badge}`}>
          M {eq.magnitude.toFixed(1)}
        </div>
      </div>

      <div className="flex items-center justify-between pl-1.5 pt-2 border-t border-slate-150 dark:border-slate-850 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
        <span>Depth: {eq.depth.toFixed(1)} km</span>
        <span>Sig: {eq.significance}</span>
      </div>

      {/* Alerts or urgent tsunami risk tags */}
      {eq.tsunami === 1 && (
        <div className="mt-2 ml-1.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/50 rounded-md p-1 flex items-center gap-1 text-[9px] text-blue-600 dark:text-blue-400 animate-pulse font-bold leading-none select-none">
          <Waves className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
          <span>Coastal Tsunami Watch active</span>
        </div>
      )}

      {eq.alert && (
        <div
          className={`mt-1.5 ml-1.5 rounded p-0.5 border text-center text-[8px] font-bold uppercase ${
            eq.alert === 'red'
              ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 dark:border-red-900'
              : eq.alert === 'orange'
              ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-900'
              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-900'
          }`}
        >
          Phase: {eq.alert} Status
        </div>
      )}
    </div>
  );
}
