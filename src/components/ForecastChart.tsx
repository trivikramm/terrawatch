/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { Thermometer, CloudRain, Wind, Activity } from 'lucide-react';

interface ForecastChartProps {
  hourly: Array<{
    time: string;
    temp: number;
    pop: number; // probability
    wind_speed: number;
    humidity: number;
  }>;
}

type ChartMetric = 'temp' | 'rain' | 'wind' | 'humidity';

export default function ForecastChart({ hourly }: ForecastChartProps) {
  const [metric, setMetric] = useState<ChartMetric>('temp');

  if (!hourly || hourly.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-slate-500 font-sans">
        <Activity className="h-6 w-6 animate-pulse mr-2" />
        No forecast data coordinates available.
      </div>
    );
  }

  // Get active configurations based on the selected Metric
  const getMetricConfig = (type: ChartMetric) => {
    switch (type) {
      case 'temp':
        return {
          stroke: '#F43F5E', // Rose 500
          fill: 'url(#tempGrad)',
          dataKey: 'temp',
          label: 'Temperature',
          unit: '°C',
          icon: <Thermometer className="h-4 w-4 text-rose-450" />,
        };
      case 'rain':
        return {
          stroke: '#3B82F6', // Blue 500
          fill: 'url(#rainGrad)',
          dataKey: 'pop',
          label: 'Precipitation Probability',
          unit: '%',
          icon: <CloudRain className="h-4 w-4 text-blue-400" />,
        };
      case 'wind':
        return {
          stroke: '#06B6D4', // Cyan 500
          fill: 'url(#windGrad)',
          dataKey: 'wind_speed',
          label: 'Wind Speed',
          unit: ' m/s',
          icon: <Wind className="h-4 w-4 text-cyan-400" />,
        };
      case 'humidity':
        return {
          stroke: '#10B981', // Emerald 500
          fill: 'url(#humidityGrad)',
          dataKey: 'humidity',
          label: 'Humidity Content',
          unit: '%',
          icon: <Activity className="h-4 w-4 text-emerald-450" />,
        };
    }
  };

  const config = getMetricConfig(metric);

  // Custom tooltips styling for the charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-xl backdrop-blur-md font-sans text-xs transition-colors duration-300">
          <p className="font-bold text-slate-500 dark:text-slate-400">Hour: {label}</p>
          <p className="font-semibold text-slate-800 dark:text-white mt-1 flex items-center gap-1" style={{ color: config.stroke }}>
            {config.icon}
            {config.label}: <span className="font-mono font-bold">{payload[0].value.toFixed(1)}{config.unit}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="forecast-analytics-chart" className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-lg backdrop-blur-md flex flex-col justify-between transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-cyan-600 dark:text-cyan-400" /> Advanced Climate Forecast Trends
          </h3>
          <p className="text-xs text-slate-455 dark:text-slate-500 mt-0.5">Chronological 12-hour micro-atmospheric metrics forecast</p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-850 rounded-lg self-start transition-colors duration-300">
          {(['temp', 'rain', 'wind', 'humidity'] as ChartMetric[]).map((mKey) => (
            <button
              id={`forecast-tab-${mKey}`}
              key={mKey}
              onClick={() => setMetric(mKey)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all uppercase duration-300 ${
                metric === mKey
                  ? 'bg-white dark:bg-slate-800/80 text-slate-950 dark:text-white shadow font-semibold'
                  : 'text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-900/50'
              }`}
            >
              {mKey}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart viewport  */}
      <div className="w-full h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={hourly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {/* Temperature gradient color fill */}
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
              </linearGradient>
              {/* Rain gradient color fill */}
              <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              {/* Wind speed color fill */}
              <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
              </linearGradient>
              {/* Humidity color fill */}
              <linearGradient id="humidityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.2} />

            <XAxis
              dataKey="time"
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
            />

            <YAxis
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dx={-5}
              unit={config.unit}
              domain={['auto', 'auto']}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey={config.dataKey}
              stroke={config.stroke}
              strokeWidth={2}
              fill={config.fill}
              activeDot={{ r: 6, stroke: '#0F172A', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
