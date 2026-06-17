/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Earthquake } from '../types';
import { Activity, ShieldAlert, Award, Compass, BarChart2 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

interface StatisticsCardProps {
  earthquakes: Earthquake[];
}

export default function StatisticsCard({ earthquakes }: StatisticsCardProps) {
  const totalCount = earthquakes.length;

  // Handle empty state gracefully
  if (totalCount === 0) {
    return (
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-lg backdrop-blur-md flex flex-col items-center justify-center text-center h-full min-h-[300px]">
        <Activity className="h-8 w-8 text-slate-400 dark:text-slate-500 animate-pulse mb-2" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No Seismic Occurrences Collected</p>
        <p className="text-xs text-slate-455 dark:text-slate-500 mt-1">Check selected filters or period coverage</p>
      </div>
    );
  }

  // Calculate statistics from real data
  const magnitudes = earthquakes.map((e) => e.magnitude);
  const maxMag = Math.max(...magnitudes);
  const avgMag = magnitudes.reduce((sum, val) => sum + val, 0) / totalCount;
  const highestEvent = earthquakes.find((e) => e.magnitude === maxMag);

  const depths = earthquakes.map((e) => e.depth);
  const avgDepth = depths.reduce((sum, val) => sum + val, 0) / totalCount;

  // Count distribution categories
  let minor = 0; // 0 - 2
  let light = 0; // 2 - 4
  let strong = 0; // 4 - 6
  let hazardous = 0; // 6+

  earthquakes.forEach((eq) => {
    if (eq.magnitude >= 6.0) hazardous++;
    else if (eq.magnitude >= 4.0) strong++;
    else if (eq.magnitude >= 2.0) light++;
    else minor++;
  });

  const chartData = [
    { name: 'M0-1.9', count: minor, color: '#10B981' },
    { name: 'M2-3.9', count: light, color: '#EAB308' },
    { name: 'M4-5.9', count: strong, color: '#F97316' },
    { name: 'M6.0+', count: hazardous, color: '#EF4444' },
  ];

  return (
    <div id="seismic-statistics-panel" className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-lg backdrop-blur-md flex flex-col justify-between h-full transition-colors duration-300">
      <div>
        <h3 className="text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5 mb-4">
          <BarChart2 className="h-4 w-4 text-orange-500 dark:text-orange-400" /> Seismic Analytics Dashboard
        </h3>

        {/* Global Overview stats cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-150 dark:border-slate-850 flex flex-col justify-between transition-colors duration-300">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-bold">Total Recorders</span>
            <span className="text-2xl font-bold font-mono text-slate-950 dark:text-white mt-1">{totalCount}</span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 block leading-tight">events within frame</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-150 dark:border-slate-850 flex flex-col justify-between transition-colors duration-300">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-bold">Average Depth</span>
            <span className="text-lg font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-1">{avgDepth.toFixed(1)} <span className="text-xs">km</span></span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 block leading-tight">low hypocenter focus</span>
          </div>
        </div>

        {/* Severe Highlight Card block */}
        {highestEvent && (
          <div className="bg-orange-50 dark:bg-orange-950/15 border border-orange-200 dark:border-orange-900/40 p-3 rounded-xl mb-5">
            <div className="flex items-center gap-1.5 pb-2 border-b border-orange-200 dark:border-orange-900/30 mb-2">
              <ShieldAlert className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-300">
                Peak Rupture Register
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white max-w-[170px] truncate">{highestEvent.place}</p>
                <p className="text-[9px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                  Depth: {highestEvent.depth.toFixed(1)} km | {new Date(highestEvent.time).toLocaleTimeString()}
                </p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 font-bold font-mono text-lg px-2.5 py-0.5 rounded border border-orange-200 dark:border-orange-500/20 shadow-sm shrink-0">
                M {highestEvent.magnitude.toFixed(1)}
              </div>
            </div>
            {highestEvent.tsunami === 1 && (
              <div className="mt-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/50 rounded px-2 py-1 flex items-center justify-between text-[9px] text-blue-600 dark:text-blue-400">
                <span className="font-bold">TSUNAMI FLAG TRIGGERS ACTIVE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 animate-ping"></span>
              </div>
            )}
          </div>
        )}

        {/* Magnitude Distribution title */}
        <div className="flex justify-between items-baseline mb-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Magnitude Frequencies</span>
          <span className="text-[10px] text-slate-550 dark:text-slate-500 font-mono">Mean: M {avgMag.toFixed(2)}</span>
        </div>
      </div>

      {/* Magnitude histogram */}
      <div className="w-full h-[150px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 0, left: -30, bottom: 0 }}>
            <XAxis
              dataKey="name"
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={5}
            />
            <YAxis
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dx={-5}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }: any) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-950 border border-slate-850 p-2 rounded text-[10px] font-sans">
                      <p className="text-white font-bold">{payload[0].payload.name}</p>
                      <p className="text-slate-400 mt-0.5">Count: <span className="font-mono font-bold text-white">{payload[0].value}</span></p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={32}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.7} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
