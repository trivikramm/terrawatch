/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, ShieldCheck } from 'lucide-react';

interface PulseItem {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  category: string;
  trend: 'bullish' | 'bearish' | 'neutral';
  sentiment: string;
}

interface MarketPulseTickerProps {
  pulseItems: PulseItem[];
  selectedSymbol?: string;
  onSelectSymbol?: (symbol: string) => void;
  feedSource?: 'UPSTOX_LIVE' | 'SIMULATED_FEED' | 'UPSTOX_LIVE_ANALYTICS' | string;
  lastTickTimestamp?: number;
  theme?: string;
}

export const MarketPulseTicker: React.FC<MarketPulseTickerProps> = ({
  pulseItems,
  selectedSymbol,
  onSelectSymbol,
  feedSource = 'SIMULATED_FEED',
  lastTickTimestamp,
  theme = 'dark',
}) => {
  const isUpstox = feedSource === 'UPSTOX_LIVE' || feedSource === 'UPSTOX_LIVE_ANALYTICS';
  const effectiveTimestamp = lastTickTimestamp || Date.now();
  const dateStr = new Date(effectiveTimestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = new Date(effectiveTimestamp).toLocaleTimeString();

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-sm transition-colors">
      <div className="flex flex-wrap items-center justify-between px-2 pb-2 border-b border-slate-200 dark:border-slate-800 text-[11px] mb-2 gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-black tracking-wider uppercase text-slate-800 dark:text-slate-300 flex items-center gap-1">
            <Activity className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
            TERRAWATCH GLOBAL & INDIAN MARKET PULSE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-transparent">
            <ShieldCheck className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
            <span>FEED:</span>
            <span className={`font-bold ${isUpstox ? 'text-emerald-600 dark:text-emerald-400' : 'text-cyan-600 dark:text-cyan-400'}`}>
              {isUpstox ? 'UPSTOX ANALYTICS (LIVE V2)' : 'HIGH-FIDELITY SIMULATOR'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-700 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800/80">
            <span className="text-slate-500">Date:</span>
            <span className="text-slate-900 dark:text-slate-200 font-bold">{dateStr}</span>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{timeStr}</span>
          </div>
        </div>
      </div>

      {/* Horizontal scrolling ticker items */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
        {pulseItems.map((item) => {
          const isPositive = item.changePercent > 0;
          const isNeutral = item.changePercent === 0;
          const isSelected = selectedSymbol && item.symbol.toUpperCase().includes(selectedSymbol.toUpperCase());

          return (
            <button
              key={item.symbol}
              onClick={() => onSelectSymbol && onSelectSymbol(item.symbol.replace(/\s+/g, ''))}
              className={`shrink-0 px-3 py-2 rounded-lg border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-50 dark:bg-slate-800 border-cyan-500 text-slate-900 dark:text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white">{item.symbol}</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">{item.category}</span>
              </div>

              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                  {item.value >= 1000 ? item.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : item.value.toFixed(2)}
                </span>
                
                <div
                  className={`flex items-center text-[11px] font-bold font-mono ${
                    isPositive ? 'text-emerald-600 dark:text-emerald-400' : isNeutral ? 'text-slate-500 dark:text-slate-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3 mr-0.5 inline" />
                  ) : isNeutral ? (
                    <Minus className="h-3 w-3 mr-0.5 inline" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-0.5 inline" />
                  )}
                  <span>
                    {isPositive ? '+' : ''}
                    {item.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate mt-0.5 max-w-[150px]">
                {item.sentiment}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
