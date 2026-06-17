/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertTriangle, Clock, ShieldAlert } from 'lucide-react';

interface AlertCardProps {
  alerts: Array<{
    sender_name: string;
    event: string;
    start: number;
    end: number;
    description: string;
    severity?: string;
  }>;
}

export default function AlertCard({ alerts }: AlertCardProps) {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  const formatEpoch = (epoch: number) => {
    return new Date(epoch * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
  };

  const getSeverityStyle = (sev?: string) => {
    const minSev = sev?.toLowerCase() || 'moderate';
    if (minSev === 'extreme' || minSev === 'severe') {
      return 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400';
    }
    if (minSev === 'moderate') {
      return 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-850 text-orange-700 dark:text-orange-400';
    }
    return 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-250 dark:border-yellow-850 text-yellow-705 dark:text-yellow-400';
  };

  return (
    <div id="severe-intelligence-alerts" className="space-y-4">
      <div className="flex items-center gap-2 mb-1.5">
        <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-500 animate-pulse" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-red-605 dark:text-red-400">
          Severe Meteorological Advisories ({alerts.length})
        </h3>
      </div>

      {alerts.map((alert, index) => {
        const severityClass = getSeverityStyle(alert.severity);
        return (
          <div
            key={index}
            className={`border rounded-xl p-4 flex flex-col justify-between transition-all duration-300 shadow-sm dark:shadow-lg ${severityClass}`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                <span className="font-extrabold text-sm tracking-tight">{alert.event}</span>
              </div>
              <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded border border-current font-mono shadow-inner tracking-widest leading-none shrink-0">
                {alert.severity || 'ACTIVE'}
              </span>
            </div>

            <p className="text-xs text-slate-705 dark:text-slate-300 leading-relaxed mb-3.5 italic">
              {alert.description}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-current/10 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              <span className="truncate max-w-[170px] font-semibold">Agency: {alert.sender_name}</span>
              <div className="flex items-center gap-1 font-semibold">
                <Clock className="h-3 w-3" />
                <span>Until: {formatEpoch(alert.end)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
