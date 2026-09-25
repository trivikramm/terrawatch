/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, ArrowUpDown, TrendingUp, TrendingDown, Layers, Filter } from 'lucide-react';

interface ScannerItem {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  currentPrice: number;
  changePercent: number;
  momentumScore: number;
  newsScore: number;
  volatilityScore: number;
  modelScore: number;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  signal: string;
}

interface MarketScannerProps {
  items: ScannerItem[];
  onSelectSymbol: (symbol: string) => void;
}

export const MarketScanner: React.FC<MarketScannerProps> = ({ items, onSelectSymbol }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [sortField, setSortField] = useState<keyof ScannerItem>('momentumScore');
  const [sortAsc, setSortAsc] = useState(false);

  const sectors = ['ALL', ...Array.from(new Set(items.map((i) => i.sector)))];

  const handleSort = (field: keyof ScannerItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredItems = items
    .filter((item) => {
      const matchesSearch =
        item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector = sectorFilter === 'ALL' || item.sector === sectorFilter;
      return matchesSearch && matchesSector;
    })
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

  // Calculate sector average performance for heatmap
  const sectorPerformance: { [sec: string]: { avgChange: number; count: number } } = {};
  items.forEach((item) => {
    if (!sectorPerformance[item.sector]) {
      sectorPerformance[item.sector] = { avgChange: 0, count: 0 };
    }
    sectorPerformance[item.sector].avgChange += item.changePercent;
    sectorPerformance[item.sector].count += 1;
  });

  return (
    <div className="space-y-4">
      {/* Sector Performance Mini-Heatmap */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            INDIAN SECTOR INTELLIGENCE HEATMAP
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Normalized Intraday Performance</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(sectorPerformance).map(([sec, data]) => {
            const avg = Number((data.avgChange / data.count).toFixed(2));
            const isPos = avg > 0;
            const isZero = avg === 0;

            return (
              <button
                key={sec}
                onClick={() => setSectorFilter(sec === sectorFilter ? 'ALL' : sec)}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  sectorFilter === sec
                    ? 'border-cyan-500 bg-slate-800'
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/50'
                }`}
              >
                <div className="text-[11px] font-bold text-slate-200 truncate">{sec}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-slate-500 font-mono">{data.count} Equities</span>
                  <span
                    className={`text-xs font-bold font-mono ${
                      isPos ? 'text-emerald-400' : isZero ? 'text-slate-400' : 'text-rose-400'
                    }`}
                  >
                    {isPos ? '+' : ''}
                    {avg}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scanner Search and Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search equity symbol or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        {/* Sector Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 py-1.5 px-3 rounded-lg focus:outline-none focus:border-cyan-500 font-mono"
          >
            {sectors.map((sec) => (
              <option key={sec} value={sec} className="bg-slate-950 text-slate-200">
                {sec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scanner Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('symbol')}>
                  <div className="flex items-center gap-1">
                    Symbol <ArrowUpDown className="h-2.5 w-2.5" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer" onClick={() => handleSort('currentPrice')}>
                  <div className="flex items-center gap-1">
                    Price (INR) <ArrowUpDown className="h-2.5 w-2.5" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer" onClick={() => handleSort('changePercent')}>
                  <div className="flex items-center gap-1">
                    Change <ArrowUpDown className="h-2.5 w-2.5" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer" onClick={() => handleSort('momentumScore')}>
                  <div className="flex items-center gap-1">
                    Momentum <ArrowUpDown className="h-2.5 w-2.5" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer" onClick={() => handleSort('newsScore')}>
                  <div className="flex items-center gap-1">
                    News Sent <ArrowUpDown className="h-2.5 w-2.5" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer" onClick={() => handleSort('modelScore')}>
                  <div className="flex items-center gap-1">
                    Model Score <ArrowUpDown className="h-2.5 w-2.5" />
                  </div>
                </th>
                <th className="py-3 px-3">Signal</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredItems.map((item) => {
                const isPositive = item.changePercent > 0;
                return (
                  <tr
                    key={item.symbol}
                    className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    onClick={() => onSelectSymbol(item.symbol)}
                  >
                    <td className="py-2.5 px-4 font-bold">
                      <div className="text-cyan-400 group-hover:text-cyan-300">{item.symbol}</div>
                      <div className="text-[10px] text-slate-500 font-sans truncate max-w-[150px]">
                        {item.name}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-bold">₹{item.currentPrice.toFixed(2)}</td>

                    <td className={`py-2.5 px-3 font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? '+' : ''}
                      {item.changePercent.toFixed(2)}%
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-950 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-cyan-400 h-full rounded-full"
                            style={{ width: `${item.momentumScore}%` }}
                          />
                        </div>
                        <span className="text-[11px]">{item.momentumScore}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-950 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-400 h-full rounded-full"
                            style={{ width: `${item.newsScore}%` }}
                          />
                        </div>
                        <span className="text-[11px]">{item.newsScore}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-950 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-400 h-full rounded-full"
                            style={{ width: `${item.modelScore}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-100">{item.modelScore}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[9px] uppercase px-2 py-0.5 rounded font-bold ${
                          item.signal.includes('bullish')
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                            : item.signal.includes('bearish')
                            ? 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {item.signal.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSymbol(item.symbol);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-400 text-[10px] font-bold transition-all border border-slate-700 hover:border-cyan-700 cursor-pointer"
                      >
                        Terminal →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
