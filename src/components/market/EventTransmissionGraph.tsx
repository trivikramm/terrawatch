/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EventMarketTransmission } from '../../types/market.ts';
import {
  Network,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Layers,
  Flame,
  Globe,
  Compass,
  Ship,
  Wind,
  Activity,
  History,
} from 'lucide-react';

interface EventTransmissionGraphProps {
  transmissions: EventMarketTransmission[];
  onSelectSymbol?: (symbol: string) => void;
  theme?: string;
}

export const EventTransmissionGraph: React.FC<EventTransmissionGraphProps> = ({
  transmissions,
  onSelectSymbol,
  theme = 'dark',
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(transmissions[0]?.id || '');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filtered = filterCategory === 'all'
    ? transmissions
    : transmissions.filter((t) => t.eventCategory === filterCategory);

  const activeEvent = transmissions.find((t) => t.id === selectedEventId) || transmissions[0];

  const getCategoryIcon = (category: EventMarketTransmission['eventCategory']) => {
    switch (category) {
      case 'environmental':
        return Activity;
      case 'geopolitical':
        return Globe;
      case 'energy':
        return Flame;
      default:
        return Compass;
    }
  };

  const getSeverityBadge = (severity: EventMarketTransmission['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-400 border-red-300 dark:border-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-950/80 dark:text-orange-400 border-orange-300 dark:border-orange-800';
      case 'medium':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400 border-amber-300 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls: Filter by category */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-sm transition-colors">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            EVENT-TO-MARKET TRANSMISSION ENGINE
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">Domain:</span>
          {['all', 'environmental', 'geopolitical'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer capitalize text-[11px] font-bold ${
                filterCategory === cat
                  ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-800/80'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Event Selector on Left, Visual Transmission Graph on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Event List (Left, 4 columns) */}
        <div className="lg:col-span-4 space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
            Active Shock & Macro Catalysts ({filtered.length})
          </span>

          <div className="space-y-2">
            {filtered.map((item) => {
              const IconComp = getCategoryIcon(item.eventCategory);
              const isSelected = item.id === activeEvent?.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedEventId(item.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-50 dark:bg-slate-800 border-cyan-500 shadow-sm ring-1 ring-cyan-500/20'
                      : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 flex items-center gap-1">
                      <IconComp className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
                      {item.eventCategory}
                    </span>
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border font-bold ${getSeverityBadge(item.severity)}`}>
                      {item.severity}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                    {item.headline}
                  </h4>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    <span className="text-slate-700 dark:text-slate-300">
                      {new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span>Risk-Off: <span className="text-rose-600 dark:text-rose-400 font-bold">{item.riskOffProbabilityPercent}%</span></span>
                    <span>{item.affectedSectors.length} Sectors</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Transmission Pipeline & Asset Exposure (Right, 8 columns) */}
        {activeEvent && (
          <div className="lg:col-span-8 space-y-4">
            {/* Header of Active Event */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-2 shadow-sm transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-800/80 font-bold">
                  TRANSMISSION GRAPH ARCHITECTURE
                </span>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                  <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
                    Date: {new Date(activeEvent.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span>•</span>
                  <span>Catalyst ID: #{activeEvent.id}</span>
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                {activeEvent.headline}
              </h3>
            </div>

            {/* Visual Transmission Chain Flow */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3 shadow-sm transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                Propagation Vector (Physical Shock → Capital Impact)
              </span>

              <div className="space-y-2">
                {activeEvent.transmissionChain.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-700/80 flex items-center justify-center text-[10px] font-bold font-mono text-cyan-700 dark:text-cyan-400 shrink-0">
                        {idx + 1}
                      </div>
                      {idx < activeEvent.transmissionChain.length - 1 && (
                        <div className="w-0.5 h-6 bg-slate-200 dark:bg-slate-800 my-0.5" />
                      )}
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 p-2.5 rounded-lg flex-1 text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed">
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Affected Commodities & Raw Inputs */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-2.5 shadow-sm transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                Immediate Commodity & Pricing Vectors
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {activeEvent.affectedCommodities.map((comm, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 p-2.5 rounded-lg space-y-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-200">{comm.name}</div>
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                        comm.expectedImpact === 'bullish'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : comm.expectedImpact === 'bearish'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                      }`}>
                        {comm.expectedImpact}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">Conf: {comm.confidencePercent}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sector Impact Matrix */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3 shadow-sm transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                Sectoral Divergence & Exposure Analysis
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeEvent.affectedSectors.map((sec, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 p-3 rounded-lg space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-200">{sec.sector}</span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          sec.impactDirection === 'positive'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                            : sec.impactDirection === 'negative'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                        }`}
                      >
                        {sec.impactDirection} ({sec.exposureDegree})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {sec.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Exposed Equities with Direct Terminal Link */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Direct Indian Equity Exposure Sensitivity
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {activeEvent.exposedCompanies.map((comp) => (
                  <button
                    key={comp.symbol}
                    onClick={() => onSelectSymbol && onSelectSymbol(comp.symbol)}
                    className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-cyan-500/80 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-cyan-400 group-hover:text-cyan-300 font-mono">
                        {comp.symbol}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1 py-0.2 rounded ${
                          comp.direction === 'positive'
                            ? 'text-emerald-400'
                            : comp.direction === 'negative'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {comp.direction}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{comp.name}</div>
                    <div className="text-[9px] text-slate-500 font-mono mt-1">{comp.sensitivity}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Historical Analogue Card */}
            {activeEvent.historicalAnalogues.length > 0 && (
              <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px] uppercase">
                  <History className="h-3.5 w-3.5" />
                  <span>Historical Empirical Precedent</span>
                </div>
                {activeEvent.historicalAnalogues.map((analogue, idx) => (
                  <div key={idx} className="text-slate-300 text-[11px] leading-relaxed">
                    <span className="font-bold text-slate-200">{analogue.name} ({analogue.year}):</span>{' '}
                    <span>{analogue.marketReaction}</span> (Mean normalization: <span className="font-mono text-cyan-400 font-bold">{analogue.recoveryHorizonDays} days</span>).
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
