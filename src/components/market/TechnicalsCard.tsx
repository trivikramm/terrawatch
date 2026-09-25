/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TechnicalAnalysis } from '../../types/market.ts';
import { ShieldCheck, Activity, Gauge, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TechnicalsCardProps {
  technicals: TechnicalAnalysis;
  symbol: string;
  theme?: string;
}

export const TechnicalsCard: React.FC<TechnicalsCardProps> = ({ technicals, symbol, theme = 'dark' }) => {
  const getRegimeBadge = (regime: TechnicalAnalysis['regime']) => {
    switch (regime) {
      case 'strong_bullish':
        return {
          label: 'STRONG BULLISH',
          color: 'bg-emerald-950/80 text-emerald-400 border-emerald-600/60',
          icon: TrendingUp,
        };
      case 'bullish':
        return {
          label: 'BULLISH',
          color: 'bg-teal-950/80 text-teal-400 border-teal-600/60',
          icon: TrendingUp,
        };
      case 'strong_bearish':
        return {
          label: 'STRONG BEARISH',
          color: 'bg-rose-950/80 text-rose-400 border-rose-600/60',
          icon: TrendingDown,
        };
      case 'bearish':
        return {
          label: 'BEARISH',
          color: 'bg-orange-950/80 text-orange-400 border-orange-600/60',
          icon: TrendingDown,
        };
      default:
        return {
          label: 'NEUTRAL / CONSOLIDATION',
          color: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: Minus,
        };
    }
  };

  const badge = getRegimeBadge(technicals.regime);
  const IconComponent = badge.icon;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-4 transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          <h3 className="text-xs font-black tracking-wider uppercase text-slate-800 dark:text-slate-200">
            TECHNICAL INDICATOR LAYER: {symbol}
          </h3>
        </div>

        <div className={`px-2.5 py-1 rounded-full border text-[10px] font-black tracking-wider flex items-center gap-1.5 ${badge.color}`}>
          <IconComponent className="h-3 w-3" />
          <span>{badge.label}</span>
        </div>
      </div>

      {/* Primary Technical Score Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-mono">
          <span className="text-slate-600 dark:text-slate-400">Momentum Consensus Score:</span>
          <span className={`font-bold ${technicals.score >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {technicals.score > 0 ? `+${technicals.score}` : technicals.score} / 100
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden flex border border-slate-200 dark:border-transparent">
          <div
            className={`h-full transition-all duration-500 ${
              technicals.score >= 0 ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 ml-auto' : 'bg-gradient-to-r from-rose-500 to-orange-500'
            }`}
            style={{ width: `${Math.min(100, Math.abs(technicals.score))}%` }}
          />
        </div>
      </div>

      {/* Grid of indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {/* RSI */}
        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 p-2.5 rounded-lg space-y-1 font-mono">
          <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400">RSI (14)</span>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-baseline justify-between">
            <span>{technicals.rsi}</span>
            <span
              className={`text-[9px] font-sans px-1.5 py-0.2 rounded font-bold ${
                technicals.rsi >= 70
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                  : technicals.rsi <= 30
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {technicals.rsi >= 70 ? 'OVERBOUGHT' : technicals.rsi <= 30 ? 'OVERSOLD' : 'NEUTRAL'}
            </span>
          </div>
        </div>

        {/* MACD */}
        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 p-2.5 rounded-lg space-y-1 font-mono">
          <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400">MACD (12,26,9)</span>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-baseline justify-between">
            <span>{technicals.macd.histogram > 0 ? `+${technicals.macd.histogram}` : technicals.macd.histogram}</span>
            <span
              className={`text-[9px] font-sans px-1.5 py-0.2 rounded font-bold ${
                technicals.macd.trend === 'bullish' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
              }`}
            >
              {technicals.macd.trend.toUpperCase()}
            </span>
          </div>
        </div>

        {/* SMA 20 */}
        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 p-2.5 rounded-lg space-y-1 font-mono">
          <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400">SMA (20)</span>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-baseline justify-between">
            <span>₹{technicals.movingAverages.sma20.toFixed(1)}</span>
            <span
              className={`text-[9px] font-sans px-1.5 py-0.2 rounded font-bold ${
                technicals.movingAverages.aboveSma20 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
              }`}
            >
              {technicals.movingAverages.aboveSma20 ? 'ABOVE' : 'BELOW'}
            </span>
          </div>
        </div>

        {/* Bollinger Bandwidth */}
        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 p-2.5 rounded-lg space-y-1 font-mono">
          <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400">BB WIDTH</span>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-baseline justify-between">
            <span>{technicals.bollingerBands.bandWidthPercent}%</span>
            <span className="text-[9px] font-sans px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold">
              EXPANDED
            </span>
          </div>
        </div>
      </div>

      {/* Support and Resistance Pivot Deck */}
      <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 p-3 rounded-lg space-y-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400 font-bold block">
          Structural Key Levels & Pivot Boundaries (INR)
        </span>
        <div className="grid grid-cols-4 gap-2 text-xs font-mono text-center">
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 p-1.5 rounded">
            <div className="text-[9px] text-rose-600 dark:text-rose-400 font-bold">S2 (Major)</div>
            <div className="font-bold text-slate-800 dark:text-slate-200">₹{technicals.supportResistance.support2.toFixed(1)}</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-1.5 rounded">
            <div className="text-[9px] text-amber-600 dark:text-amber-400 font-bold">S1 (Immediate)</div>
            <div className="font-bold text-slate-800 dark:text-slate-200">₹{technicals.supportResistance.support1.toFixed(1)}</div>
          </div>
          <div className="bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/40 p-1.5 rounded">
            <div className="text-[9px] text-cyan-700 dark:text-cyan-400 font-bold">R1 (Immediate)</div>
            <div className="font-bold text-slate-800 dark:text-slate-200">₹{technicals.supportResistance.resistance1.toFixed(1)}</div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 p-1.5 rounded">
            <div className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold">R2 (Major)</div>
            <div className="font-bold text-slate-800 dark:text-slate-200">₹{technicals.supportResistance.resistance2.toFixed(1)}</div>
          </div>
        </div>
      </div>

      {/* Analytical Summary Rationale */}
      <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 p-2.5 rounded-lg flex items-start gap-2">
        <Activity className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">{technicals.summaryText}</p>
      </div>
    </div>
  );
};
