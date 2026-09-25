/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { HistoricalBar } from '../../types/market.ts';
import { Sliders, Eye, EyeOff } from 'lucide-react';

interface TerminalChartProps {
  bars: HistoricalBar[];
  symbol: string;
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
  currentPrice: number;
  theme?: string;
}

export const TerminalChart: React.FC<TerminalChartProps> = ({
  bars,
  symbol,
  timeframe,
  onTimeframeChange,
  currentPrice,
  theme = 'dark',
}) => {
  const [showSma20, setShowSma20] = useState(true);
  const [showSma50, setShowSma50] = useState(true);
  const [showBB, setShowBB] = useState(true);
  const [showVolume, setShowVolume] = useState(true);

  const timeframes = ['15m', '1h', '1D', '1W'];

  const latestBar = bars.length > 0 ? bars[bars.length - 1] : null;
  const latestDateFormatted = latestBar?.timestamp
    ? new Date(latestBar.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as HistoricalBar;
      const barDate = data.timestamp
        ? new Date(data.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : null;

      return (
        <div className="bg-white dark:bg-slate-950/95 border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1 font-mono text-slate-800 dark:text-slate-200 min-w-[190px]">
          <div className="font-bold text-cyan-600 dark:text-cyan-400 border-b border-slate-200 dark:border-slate-800 pb-1 flex justify-between items-center">
            <span>{data.timeStr}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">{barDate || symbol}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-2 pt-1 text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">Open:</span>
            <span className="text-right">₹{data.open.toFixed(2)}</span>
            <span className="text-slate-500 dark:text-slate-400">High:</span>
            <span className="text-right text-emerald-600 dark:text-emerald-400">₹{data.high.toFixed(2)}</span>
            <span className="text-slate-500 dark:text-slate-400">Low:</span>
            <span className="text-right text-rose-600 dark:text-rose-400">₹{data.low.toFixed(2)}</span>
            <span className="text-slate-500 dark:text-slate-400">Close:</span>
            <span className="text-right font-bold text-slate-900 dark:text-white">₹{data.close.toFixed(2)}</span>
          </div>
          {data.sma20 && (
            <div className="flex justify-between text-[10px] text-amber-600 dark:text-amber-400 pt-1 border-t border-slate-200 dark:border-slate-800/80">
              <span>SMA (20):</span>
              <span>₹{data.sma20.toFixed(2)}</span>
            </div>
          )}
          {data.sma50 && (
            <div className="flex justify-between text-[10px] text-purple-400">
              <span>SMA (50):</span>
              <span>₹{data.sma50.toFixed(2)}</span>
            </div>
          )}
          {data.upperBB && (
            <div className="flex justify-between text-[10px] text-cyan-300">
              <span>BB Upper:</span>
              <span>₹{data.upperBB.toFixed(2)}</span>
            </div>
          )}
          {data.volume && (
            <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
              <span>Volume:</span>
              <span>{data.volume.toLocaleString()}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Min and max bounds for nice charting
  const prices = bars.map((b) => b.close);
  const minPrice = prices.length ? Math.min(...prices) * 0.985 : currentPrice * 0.95;
  const maxPrice = prices.length ? Math.max(...prices) * 1.015 : currentPrice * 1.05;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3 transition-colors">
      {/* Top Chart Header with Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>{symbol}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-800/60 font-mono font-bold">
              ₹{currentPrice.toFixed(2)}
            </span>
          </h3>

          {/* Timeframe Selector */}
          <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-950 p-0.5 border border-slate-200 dark:border-slate-800 text-xs font-bold font-mono">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  timeframe === tf
                    ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm border border-slate-200/80 dark:border-transparent'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Date Indicator Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-[11px] font-mono text-slate-700 dark:text-slate-300">
            <span className="text-slate-500">Date:</span>
            <span className="font-bold text-cyan-600 dark:text-cyan-300">{latestDateFormatted}</span>
            {latestBar?.timeStr && (
              <span className="text-slate-500 dark:text-slate-400">({latestBar.timeStr})</span>
            )}
          </div>
        </div>

        {/* Technical Overlays Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="text-slate-500 flex items-center gap-1">
            <Sliders className="h-3 w-3" /> Overlays:
          </span>

          <button
            onClick={() => setShowSma20(!showSma20)}
            className={`px-2 py-0.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
              showSma20
                ? 'bg-amber-950/40 border-amber-600/50 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-500 line-through'
            }`}
          >
            <span>SMA 20</span>
          </button>

          <button
            onClick={() => setShowSma50(!showSma50)}
            className={`px-2 py-0.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
              showSma50
                ? 'bg-purple-950/40 border-purple-600/50 text-purple-300'
                : 'bg-slate-950 border-slate-800 text-slate-500 line-through'
            }`}
          >
            <span>SMA 50</span>
          </button>

          <button
            onClick={() => setShowBB(!showBB)}
            className={`px-2 py-0.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
              showBB
                ? 'bg-cyan-950/40 border-cyan-600/50 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-500 line-through'
            }`}
          >
            <span>Bollinger Bands</span>
          </button>

          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`px-2 py-0.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
              showVolume
                ? 'bg-slate-800 border-slate-700 text-slate-300'
                : 'bg-slate-950 border-slate-800 text-slate-500 line-through'
            }`}
          >
            {showVolume ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
            <span>Vol</span>
          </button>
        </div>
      </div>

      {/* Primary Chart Canvas */}
      <div className="h-[360px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={bars} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} opacity={0.6} vertical={false} />

            <XAxis
              dataKey="timeStr"
              stroke={isDark ? '#64748b' : '#94a3b8'}
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
            />

            <YAxis
              yAxisId="priceAxis"
              domain={[minPrice, maxPrice]}
              orientation="right"
              stroke={isDark ? '#64748b' : '#94a3b8'}
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
              tickFormatter={(val) => `₹${val.toFixed(0)}`}
            />

            {showVolume && (
              <YAxis
                yAxisId="volumeAxis"
                orientation="left"
                stroke="#475569"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                domain={[0, 'dataMax * 3']}
                hide
              />
            )}

            <Tooltip content={<CustomTooltip />} />

            {/* Volume bars in background */}
            {showVolume && (
              <Bar
                yAxisId="volumeAxis"
                dataKey="volume"
                fill="#334155"
                opacity={0.35}
                radius={[2, 2, 0, 0]}
              />
            )}

            {/* Bollinger Band Upper & Lower */}
            {showBB && (
              <Line
                yAxisId="priceAxis"
                type="monotone"
                dataKey="upperBB"
                stroke="#38bdf8"
                strokeDasharray="4 4"
                strokeWidth={1}
                dot={false}
                isAnimationActive={false}
              />
            )}
            {showBB && (
              <Line
                yAxisId="priceAxis"
                type="monotone"
                dataKey="lowerBB"
                stroke="#38bdf8"
                strokeDasharray="4 4"
                strokeWidth={1}
                dot={false}
                isAnimationActive={false}
              />
            )}

            {/* SMA 50 */}
            {showSma50 && (
              <Line
                yAxisId="priceAxis"
                type="monotone"
                dataKey="sma50"
                stroke="#c084fc"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            )}

            {/* SMA 20 */}
            {showSma20 && (
              <Line
                yAxisId="priceAxis"
                type="monotone"
                dataKey="sma20"
                stroke="#fbbf24"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            )}

            {/* Main Close Price Area */}
            <Area
              yAxisId="priceAxis"
              type="monotone"
              dataKey="close"
              stroke="#06b6d4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#priceGradient)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Chart Status Bar */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800">
        <div className="flex items-center gap-4">
          <span>Bars: {bars.length}</span>
          <span>Timeframe: {timeframe}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-0.5 bg-amber-400"></span> SMA 20
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-0.5 bg-purple-400"></span> SMA 50
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-0.5 border-b border-dashed border-cyan-400"></span> BB Envelopes
          </span>
        </div>
      </div>
    </div>
  );
};
