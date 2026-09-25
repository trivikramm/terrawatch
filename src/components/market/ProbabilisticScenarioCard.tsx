/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ProbabilisticForecast } from '../../types/market.ts';
import { Cpu, AlertTriangle, CheckCircle, Info, Sparkles, HelpCircle } from 'lucide-react';

interface ProbabilisticScenarioCardProps {
  forecast: ProbabilisticForecast;
  theme?: string;
}

export const ProbabilisticScenarioCard: React.FC<ProbabilisticScenarioCardProps> = ({ forecast, theme = 'dark' }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-4 transition-colors">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          <h3 className="text-xs font-black tracking-wider uppercase text-slate-800 dark:text-slate-200">
            PROBABILISTIC SCENARIO ENGINE: {forecast.symbol} ({forecast.horizon} HORIZON)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
            Model: <span className="text-cyan-600 dark:text-cyan-400 font-bold">{forecast.modelVersion}</span>
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            CONFIDENCE: {forecast.modelConfidence.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Probability Triad (Bullish / Neutral / Bearish) */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            Statistical Direction Distribution
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Σ Probabilities = 100%</span>
        </div>

        {/* Stacked Visual Bar */}
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-950 rounded-lg overflow-hidden flex font-mono text-[10px] font-bold text-slate-900 shadow-inner border border-slate-200 dark:border-transparent">
          <div
            style={{ width: `${forecast.probabilities.bullish}%` }}
            className="bg-emerald-500 flex items-center justify-center transition-all duration-500 text-slate-950"
            title={`P(Bullish): ${forecast.probabilities.bullish}%`}
          >
            {forecast.probabilities.bullish}%
          </div>
          <div
            style={{ width: `${forecast.probabilities.neutral}%` }}
            className="bg-slate-400 flex items-center justify-center transition-all duration-500 text-slate-950"
            title={`P(Neutral): ${forecast.probabilities.neutral}%`}
          >
            {forecast.probabilities.neutral}%
          </div>
          <div
            style={{ width: `${forecast.probabilities.bearish}%` }}
            className="bg-rose-500 flex items-center justify-center transition-all duration-500 text-slate-950"
            title={`P(Bearish): ${forecast.probabilities.bearish}%`}
          >
            {forecast.probabilities.bearish}%
          </div>
        </div>

        {/* Labels under bar */}
        <div className="grid grid-cols-3 text-center text-[11px] font-mono pt-1">
          <div className="text-emerald-600 dark:text-emerald-400">
            <span className="font-bold">P(Bullish)</span>: {forecast.probabilities.bullish}%
          </div>
          <div className="text-slate-600 dark:text-slate-400">
            <span className="font-bold">P(Neutral)</span>: {forecast.probabilities.neutral}%
          </div>
          <div className="text-rose-600 dark:text-rose-400">
            <span className="font-bold">P(Bearish)</span>: {forecast.probabilities.bearish}%
          </div>
        </div>
      </div>

      {/* Expected Return Range (Quantile Distribution) */}
      <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 p-3 rounded-lg space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Expected Return Distribution Percentiles ({forecast.horizon})
          </span>
          <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
            Median: {forecast.expectedReturnPercent.median >= 0 ? '+' : ''}
            {forecast.expectedReturnPercent.median}%
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 text-center font-mono">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded shadow-xs">
            <div className="text-[9px] text-rose-600 dark:text-rose-400 font-bold">10th %ile</div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-300">{forecast.expectedReturnPercent.p10}%</div>
            <div className="text-[8px] text-slate-400 dark:text-slate-500">Adverse Tail</div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded shadow-xs">
            <div className="text-[9px] text-orange-600 dark:text-orange-400 font-bold">25th %ile</div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-300">{forecast.expectedReturnPercent.p25}%</div>
            <div className="text-[8px] text-slate-400 dark:text-slate-500">Conservative</div>
          </div>
          <div className="bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-700/50 p-1.5 rounded shadow-xs">
            <div className="text-[9px] text-cyan-700 dark:text-cyan-400 font-bold">Median (50th)</div>
            <div className="text-xs font-bold text-cyan-700 dark:text-cyan-300">
              {forecast.expectedReturnPercent.median >= 0 ? '+' : ''}
              {forecast.expectedReturnPercent.median}%
            </div>
            <div className="text-[8px] text-cyan-600/80 dark:text-cyan-400/80">Expectation</div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded shadow-xs">
            <div className="text-[9px] text-teal-600 dark:text-teal-400 font-bold">75th %ile</div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-300">+{forecast.expectedReturnPercent.p75}%</div>
            <div className="text-[8px] text-slate-400 dark:text-slate-500">Favorable</div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded shadow-xs">
            <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">90th %ile</div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-300">+{forecast.expectedReturnPercent.p90}%</div>
            <div className="text-[8px] text-slate-400 dark:text-slate-500">Upside Tail</div>
          </div>
        </div>
      </div>

      {/* Multi-Column Factor Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Primary Drivers */}
        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 p-3 rounded-lg space-y-2">
          <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-bold text-[11px] uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Primary Model Drivers</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300">
            {forecast.primaryDrivers.map((driver, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-cyan-600 dark:text-cyan-400 font-bold mt-0.5">•</span>
                <span>{driver}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Invalidation Conditions */}
        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 p-3 rounded-lg space-y-2">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-[11px] uppercase">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Thesis Invalidation Triggers</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300">
            {forecast.invalidationConditions.map((cond, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-amber-600 dark:text-amber-400 font-bold mt-0.5">✕</span>
                <span>{cond}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Historical Analogue */}
      <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 p-3 rounded-lg flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
        <Info className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-bold text-slate-900 dark:text-slate-200">
            Historical Analogue: {forecast.historicalAnalogue.eventTitle} ({forecast.historicalAnalogue.date})
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Correlation score: <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{forecast.historicalAnalogue.correlationScore}</span>. Outcome: {forecast.historicalAnalogue.historicalOutcome}.
          </p>
        </div>
      </div>

      {/* Statistical Compliance Disclaimer */}
      <div className="text-[10px] text-slate-500 font-mono italic border-t border-slate-200 dark:border-slate-800/80 pt-2 flex items-center gap-1.5">
        <HelpCircle className="h-3 w-3 shrink-0 text-slate-400 dark:text-slate-500" />
        <span>{forecast.disclaimer}</span>
      </div>
    </div>
  );
};
