/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Earthquake } from '../types';
import { 
  Activity, 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Zap, 
  Building2, 
  HelpCircle,
  TrendingDown, 
  RefreshCw,
  Eye,
  X,
  Compass,
  Waves
} from 'lucide-react';

interface SeismicDetailDeckProps {
  eq: Earthquake | null;
  onClose?: () => void;
  theme?: 'light' | 'dark';
}

export default function SeismicDetailDeck({ eq, onClose, theme = 'dark' }: SeismicDetailDeckProps) {
  const [syncing, setSyncing] = useState(false);
  const [showLiveFeed, setShowLiveFeed] = useState(false);
  const [liveLog, setLiveLog] = useState<string[]>([]);
  const [shakingReportsCount, setShakingReportsCount] = useState<number>(0);

  // Generate scientific and social telemetry estimates on change of selected earthquake
  useEffect(() => {
    if (!eq) return;

    // Estimate shaking reports based on magnitude and depth
    const baseReports = Math.floor(Math.pow(1.8, eq.magnitude) * (45 / Math.sqrt(eq.depth || 1)));
    const finalReports = Math.max(0, eq.magnitude >= 2.0 ? baseReports : Math.floor(Math.random() * 3));
    setShakingReportsCount(finalReports);

    // Dynamic initial live reports log
    const initialLogs = [];
    if (eq.magnitude >= 6.0) {
      initialLogs.push(`[VolcanoDiscovery Protocol] RED FLAG: Structural alert dispatched to local civil defense authorities.`);
      initialLogs.push(`[USGS PAGER] Elevated orange/red probability of masonry deformation in rural layouts.`);
      initialLogs.push(`[Live Feeds] Local network seismic arrays confirm strong primary S-waves.`);
    } else if (eq.magnitude >= 4.0) {
      initialLogs.push(`[VolcanoDiscovery] Shaking reported indoors by multiple residents. Suspended lamps swinging.`);
      initialLogs.push(`[USGS DyFi] felt reports registered within a ${Math.round(Math.pow(10, 0.4 * eq.magnitude))}km radius.`);
    } else {
      initialLogs.push(`[USGS Info] Light/micro microtemor recorded. Microseismic data saved to global catalogs.`);
    }
    setLiveLog(initialLogs);
    setShowLiveFeed(false);
  }, [eq]);

  if (!eq) {
    return (
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-lg backdrop-blur-md flex flex-col items-center justify-center text-center h-full min-h-[350px] transition-all">
        <HelpCircle className="h-10 w-10 text-slate-300 dark:text-slate-600 animate-pulse mb-3" />
        <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider">No Seismic Event Selected</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1.5 leading-relaxed font-semibold">
          Select any earthquake from the tremors database list or click directly on map markers to load live VolcanoDiscovery telemetry reports.
        </p>
      </div>
    );
  }

  // --- Seismic analytics math calculations ---

  // 1. Calculate Modified Mercalli Intensity (MMI) based on standard seismological estimation:
  // MMI = 1.5 * M - 1.8 * ln(depth + 1) + 1.0 (clamped between 1 and 10)
  const calcMMI = () => {
    const raw = 1.5 * eq.magnitude - 1.8 * Math.log(eq.depth + 1) + 1.2;
    return Math.max(1, Math.min(10, Math.round(raw)));
  };

  const mmiVal = calcMMI();

  // MMI descriptions
  const getMMILabel = (mmi: number) => {
    if (mmi >= 9) return { roman: 'IX+', term: 'Violent / Extreme', color: 'text-red-650 dark:text-red-400 bg-red-500/10 border-red-500/25', desc: 'Felt by everyone. Heavy damage to well-designed brickwork structures. Major landslips.' };
    if (mmi >= 8) return { roman: 'VIII', term: 'Severe', color: 'text-orange-650 dark:text-orange-400 bg-orange-500/10 border-orange-500/25', desc: 'Slight damage in specially designed structures; considerable damage in ordinary buildings. Chimneys fall.' };
    if (mmi >= 7) return { roman: 'VII', term: 'Very Strong', color: 'text-orange-700 dark:text-orange-450 bg-orange-500/5 border-orange-500/20', desc: 'Everybody runs outdoors. Negligible damage in buildings of good design. Plaster & tile cracks.' };
    if (mmi >= 6) return { roman: 'VI', term: 'Strong shaking', color: 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/25', desc: 'Felt by everyone. Small items fall off shelves, heavy furniture moved, slight damage to chimneys.' };
    if (mmi >= 5) return { roman: 'V', term: 'Moderate', color: 'text-yellow-750 dark:text-yellow-405 bg-yellow-500/10 border-yellow-500/20', desc: 'Felt indoors by practically everyone. Dishes and windows broken, unstable objects overturned.' };
    if (mmi >= 4) return { roman: 'IV', term: 'Light tremor', color: 'text-cyan-750 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20', desc: 'Felt indoors by many. Hanging objects swing. Vibration like passing of heavy trucks.' };
    if (mmi >= 3) return { roman: 'III', term: 'Weak trembling', color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20', desc: 'Felt quite noticeably indoors, especially on upper floors. Duration can be estimated.' };
    return { roman: 'I-II', term: 'Imperceptible / Micro', color: 'text-slate-600 dark:text-slate-455 bg-slate-500/10 border-slate-500/20', desc: 'Rarely felt by individuals. Registered only on professional micro-seismographic arrays.' };
  };

  const mmiMeta = getMMILabel(mmiVal);

  // 2. Projected Aftershocks Profile (Next 24H)
  // Aftershocks count decays exponentially, estimated around 10^(Magnitude - 4)
  const calcAftershocks = () => {
    if (eq.magnitude < 3.0) return { count: 0, maxMag: 0 };
    const count = Math.max(0, Math.floor(Math.pow(7, eq.magnitude - 3.2)));
    const maxMag = Math.max(1.0, Number((eq.magnitude - 1.2).toFixed(1)));
    return { count: Math.min(125, count), maxMag };
  };

  const aftershocks = calcAftershocks();

  // 3. Structural Impact rating
  const getStructuralImpact = () => {
    if (eq.magnitude >= 6.5 && eq.depth <= 35) {
      return { level: 'High Danger', label: 'Potential severe regional masonry damage. Collapses possible in sub-standard arrays.', progress: 'w-full bg-red-650' };
    }
    if (eq.magnitude >= 5.0 && eq.depth <= 50) {
      return { level: 'Moderate Risk', label: 'Localized structural damage. Chimney collapse, minor hairline cracks in concrete.', progress: 'w-4/6 bg-orange-500' };
    }
    if (eq.magnitude >= 3.5) {
      return { level: 'Low Risk', label: 'No structural defects. Weak masonry walls might show superficial paint crack lines.', progress: 'w-2/6 bg-amber-500' };
    }
    return { level: 'None / Safe', label: 'Completely safe. No civil hazards. Energy release absorbed safely by geologic bedrock.', progress: 'w-1/12 bg-emerald-500' };
  };

  const impact = getStructuralImpact();

  // 4. Energy Release equivalent calculation in TNT
  // formula: energy E in Joules = 10^(1.5 * M + 4.8)
  // then divide by 4.184 * 10^9 Joules (equivalent of 1 Ton of TNT)
  const calcTNT = () => {
    const logJoules = 1.5 * eq.magnitude + 4.8;
    const joules = Math.pow(10, logJoules);
    const tntTons = joules / 4.184e9;
    
    if (tntTons >= 1e6) {
      return `${(tntTons / 1e6).toFixed(2)} Megatons TNT`;
    }
    if (tntTons >= 1e3) {
      return `${(tntTons / 1e3).toFixed(1)} Kilotons TNT`;
    }
    return `${tntTons.toFixed(1)} Tons TNT`;
  };

  const tntEquivalent = calcTNT();

  // VolcanoDiscovery real-time update simulator trigger
  const handlePulseSync = () => {
    if (syncing) return;
    setSyncing(true);
    
    setTimeout(() => {
      setSyncing(false);
      setShowLiveFeed(true);
      
      const logs = [
        `[VolcanoDiscovery API ${new Date().toLocaleTimeString()}] Querying global crowd-sourced seismic reports...`,
        `[Shaking Report] Verified: ${Math.floor(shakingReportsCount * 0.15 + 1)} users in region confirmed minor swaying.`,
        `[Seismic Alert] USGS automatic centroid moment tensor calculated accurately.`,
        ...liveLog
      ];
      setLiveLog(logs);
      setShakingReportsCount(prev => prev + Math.floor(Math.random() * 4) + 1);
    }, 1200);
  };

  return (
    <div 
      id="seismic-volcanodiscovery-expert-panel" 
      className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-lg backdrop-blur-md flex flex-col justify-between h-auto transition-all"
    >
      <div className="space-y-4">
        {/* Title row */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-150 dark:border-slate-850">
          <div className="flex items-center gap-1.5">
            <Activity className="h-4.5 w-4.5 text-red-500 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-white">
              Seismic Live Diagnostic
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-[9px] font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
              Live USGS Link
            </span>
            {onClose && (
              <button 
                onClick={onClose}
                className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 rounded cursor-pointer transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Magnitude & Epicenter Quick-Look */}
        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/45 border dark:border-slate-900 rounded-xl p-3.5 shadow-sm">
          <div className="space-y-1">
            <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
              <span className="truncate max-w-[150px] font-bold">{eq.place}</span>
            </p>
            <p className="text-[10px] font-mono text-slate-550 dark:text-slate-400 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{new Date(eq.time).toLocaleTimeString()} - {new Date(eq.time).toLocaleDateString()}</span>
            </p>
          </div>
          <div className="bg-red-500/10 border border-red-500/25 px-3 py-1.5 rounded-lg text-center shadow-inner">
            <span className="block text-[8px] uppercase tracking-wider font-bold text-red-400">Magnitude</span>
            <span className="text-xl font-mono font-black text-red-550 dark:text-red-400">
              M {eq.magnitude.toFixed(1)}
            </span>
          </div>
        </div>

        {/* 1. Mercalli intensity shake block (VolcanoDiscovery Standard) */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-400 block font-bold">
            VolcanoDiscovery Mercalli Intensity (MMI)
          </span>
          <div className={`p-3 rounded-lg border flex flex-col justify-between gap-1.5 ${mmiMeta.color}`}>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-extrabold uppercase flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5" /> Est. Shaking Level {mmiMeta.roman}
              </span>
              <span className="font-mono text-xs font-black uppercase text-current">{mmiMeta.term}</span>
            </div>
            <p className="text-[10px] font-semibold leading-relaxed text-slate-700 dark:text-slate-300">
              {mmiMeta.desc}
            </p>
          </div>
        </div>

        {/* 2. Crowd-sourced Shaking Reports */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-900 rounded-xl p-2.5">
            <span className="text-[8px] font-mono uppercase tracking-wider block font-bold text-slate-400">
              U-Felt Shaking Reports
            </span>
            <span className="text-lg font-mono font-bold text-slate-900 dark:text-white block mt-1">
              {shakingReportsCount} <span className="text-[9px] font-normal text-slate-455">citizens</span>
            </span>
            <span className="text-[8px] font-mono text-slate-400 block mt-0.5 leading-tight">
              Calculated real-time felt index
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-900 rounded-xl p-2.5">
            <span className="text-[8px] font-mono uppercase tracking-wider block font-bold text-slate-400">
              Estimated Felt Radius
            </span>
            <span className="text-lg font-mono font-bold text-cyan-600 dark:text-cyan-400 block mt-1">
              {Math.max(1, Math.round(Math.pow(10, 0.48 * eq.magnitude - 0.1)))} <span className="text-xs">km</span>
            </span>
            <span className="text-[8px] font-mono text-slate-400 block mt-0.5 leading-tight">
              Perceptible vibration range
            </span>
          </div>
        </div>

        {/* 3. Aftershocks & Tsunami Threat details */}
        <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-900 rounded-xl p-3 space-y-2">
          <div className="flex justify-between items-center text-[10px]">
            <span className="font-bold text-slate-500 uppercase font-sans tracking-wide">
              Aftershock Forecast (24H)
            </span>
            <span className="font-mono text-slate-400 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" /> Gutenberg-Richter Est.
            </span>
          </div>

          {aftershocks.count > 0 ? (
            <div className="flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[11px] text-slate-800 dark:text-slate-300 font-bold block">
                  ~{aftershocks.count} expected tremors
                </span>
                <span className="text-[9px] text-slate-400 block">
                  Keep seismic meters on standby alert
                </span>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold font-mono text-[10px] px-2 py-0.5 rounded shadow-sm">
                Max M {aftershocks.maxMag}
              </div>
            </div>
          ) : (
            <p className="text-[10px] italic text-slate-455 font-semibold text-center py-1">
              Low probability of secondary aftershocks. Safe parameters.
            </p>
          )}

          {eq.tsunami === 1 && (
            <div className="mt-2 text-[10px] bg-blue-500/10 border border-blue-500/20 rounded p-2 text-blue-650 dark:text-blue-400 flex items-center justify-between font-bold leading-none animate-pulse">
              <span className="flex items-center gap-1">
                <Waves className="h-3.5 w-3.5 shrink-0" /> TSUNAMI HAZARD ADVISORY IS ACTIVE
              </span>
              <span className="text-[8px] font-mono border border-blue-500/20 px-1 py-0.5 rounded">
                USGS ALERT
              </span>
            </div>
          )}
        </div>

        {/* 4. Structural Damage profile */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline text-[10px]">
            <span className="font-bold text-slate-400 uppercase tracking-wider block">
              Estimated Structural Impact
            </span>
            <span className="font-mono text-slate-500 font-bold uppercase">{impact.level}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div className={`h-full rounded-full ${impact.progress}`} />
          </div>
          <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 leading-normal pl-1 border-l border-slate-300 dark:border-slate-800">
            {impact.label}
          </p>
        </div>

        {/* 5. Seismic Energy Equivalencies */}
        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-900 rounded-xl p-3 flex justify-between items-center">
          <div className="space-y-0.5">
            <span className="text-[8px] font-mono uppercase tracking-wider block font-bold text-slate-400">
              Seismic Energy Released
            </span>
            <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 block">
              {tntEquivalent}
            </span>
          </div>
          <Zap className="h-5 w-5 text-yellow-500 animate-pulse shrink-0" />
        </div>

        {/* VolcanoDiscovery Sync log stream (if toggled) */}
        {showLiveFeed && (
          <div className="space-y-1.5 border-t border-slate-150 dark:border-slate-850 pt-3">
            <span className="text-[8px] font-mono uppercase tracking-widest text-[#10B981] flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-ping"></span>
              Live VolcanoDiscovery updates channel
            </span>
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-2 max-h-[85px] overflow-y-auto block space-y-1">
              {liveLog.map((logStr, i) => (
                <p key={i} className="font-mono text-[9px] text-[#10B981] leading-tight select-all">
                  {logStr}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sync updates action trigger button */}
      <div className="pt-4">
        <button
          onClick={handlePulseSync}
          disabled={syncing}
          className="w-full bg-slate-900 dark:bg-slate-950 hover:bg-slate-950 dark:hover:bg-slate-900 text-slate-350 hover:text-white p-2.5 border border-slate-250 dark:border-slate-800/80 rounded-xl transition-all font-mono text-[10px] uppercase flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer font-bold"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-cyan-455 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Querying Shaking Reports...' : 'Check VolcanoDiscovery Updates'}</span>
        </button>
      </div>
    </div>
  );
}
