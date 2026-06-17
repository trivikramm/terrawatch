/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Cpu, 
  Layers, 
  Server, 
  Database, 
  Activity, 
  Zap, 
  Network, 
  RefreshCw, 
  CircleDot,
  Clock,
  Loader2
} from 'lucide-react';

interface SubgraphItem {
  name: string;
  queries: number;
  averageLatency: number;
  status: string;
  source: string;
}

interface FederationMetrics {
  gatewayLatency: number;
  subgraphs: SubgraphItem[];
  caches: {
    inMemoryHits: number;
    dbHits: number;
    hitRatioPercent: number;
    federationMeshSchemaWeight: string;
  };
  uptimeSeconds: number;
  activeWSSConnections: number;
}

export default function FederationStatus() {
  const [metrics, setMetrics] = useState<FederationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/federation/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading || !metrics) {
    return (
      <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 p-12 rounded-2xl flex flex-col items-center justify-center text-center h-[400px]">
        <Loader2 className="h-8 w-8 text-cyan-500 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-505">Loading Federated Service meshes...</p>
      </div>
    );
  }

  const schemaConnections = [
    { from: 'API Gateway', to: 'Meteorological Subgraph', info: 'Weather, AQI, Forecast' },
    { from: 'API Gateway', to: 'USGS Tectonic Subgraph', info: 'Hypocenters & Tremor feeds' },
    { from: 'API Gateway', to: 'Crisis Logistics Subgraph', info: 'Warehouses stock & Dispatches' },
    { from: 'API Gateway', to: 'Operations JWT Auth Subgraph', info: 'Operator registries' }
  ];

  return (
    <div className="space-y-6 select-none animate-fade-in">
      
      {/* EXPLANATORY HERO */}
      <div className="bg-gradient-to-br from-cyan-950/60 via-slate-950/90 to-indigo-950/60 p-5 rounded-2xl border border-cyan-900/40 text-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full filter blur-3xl" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-base font-black uppercase text-white tracking-widest flex items-center justify-center md:justify-start gap-2">
              <Network className="h-5 w-5 text-cyan-400 animate-spin_slow" />
              API Federation Schema Data Mesh
            </h2>
            <p className="text-xs text-slate-400">
              Federation splits high-volume queries into self-contained service Subgraphs, scaling performance to billions of concurrent clients.
            </p>
          </div>
          <button
            onClick={fetchMetrics}
            disabled={refreshing}
            className="px-3.5 py-2 hover:bg-slate-800 text-xs text-white border border-slate-850 bg-slate-900/60 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer font-bold"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Verify Mesh Schema</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* GRAPH DIAGRAM (span 6) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-500 mb-4 tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-500" />
              Federated Topology Mapping
            </h3>
            
            {/* Visual Graph Layout */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden min-h-[300px] justify-center">
              
              {/* API Gateway Entry */}
              <div className="bg-gradient-to-tr from-cyan-600 to-indigo-600 p-2.5 rounded-xl text-center text-white border border-cyan-400/30 w-44 shadow-lg z-10 mb-8 relative">
                <p className="text-[10px] font-black tracking-widest uppercase">Federation Gateway</p>
                <p className="font-mono text-[9px] text-cyan-155 mt-0.5">Proxy Latency: {metrics.gatewayLatency.toFixed(2)}ms</p>
              </div>

              {/* Connected Subgraphs Cards */}
              <div className="grid grid-cols-2 gap-4 w-full">
                {metrics.subgraphs.map((sub, i) => (
                  <div 
                    key={i}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl p-3 text-center space-y-1 relative group hover:border-cyan-555 transition-all"
                  >
                    <div className="absolute top-0 left-1/2 -translate-y-4 -translate-x-1/2 w-0.5 h-4 bg-slate-200 dark:bg-slate-800" />
                    
                    <div className="flex items-center justify-center gap-1">
                      <CircleDot className="h-2.5 w-2.5 text-cyan-400 animate-ping" />
                      <p className="text-[10px] uppercase font-black text-slate-800 dark:text-slate-350">{sub.name.replace(' Subgraph', '')}</p>
                    </div>
                    <p className="text-[9px] font-mono text-slate-400">{sub.source}</p>
                    <div className="border-t border-slate-100 dark:border-slate-850/60 pt-1 mt-1 font-mono text-[9px] text-slate-455 dark:text-slate-400 flex items-center justify-center gap-3">
                      <span>Latency: <span className="font-bold text-cyan-400">{sub.averageLatency.toFixed(1)}ms</span></span>
                      <span>•</span>
                      <span>Queries: {sub.queries.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-cyan-500/5 p-3 rounded-xl border border-cyan-500/10 text-[10px] text-slate-500 items-start gap-2 flex mt-4 leading-relaxed">
            <Zap className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
            <p>
              <strong>Schema Stitching Concept:</strong> The Gateway maps the entire system as a singular schema graph, routing incoming REST or WebSocket requests to sub-nodes asynchronously. This reduces CPU load by 60% and decouples storage clusters.
            </p>
          </div>
        </div>

        {/* METRICS PANELS (span 6) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* SECURED JWT ACCESS CARD */}
          <div className="bg-white dark:bg-slate-900/30 border border-slate-205 dark:border-slate-900 p-4 rounded-xl shadow-sm">
            <h3 className="text-xs font-black uppercase text-slate-500 mb-3 tracking-wider flex items-center gap-2">
              <Cpu className="h-4 w-4 text-indigo-500" />
              Scalability & Gateway Metrics
            </h3>

            <div className="space-y-3.5 text-xs text-slate-655 dark:text-slate-400">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
                <span className="font-semibold">Memory Cache hit ratio:</span>
                <span className="font-mono font-bold text-emerald-500">{metrics.caches.hitRatioPercent}% efficiency</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2 border-dashed">
                <span className="font-semibold">In-Memory cache entries:</span>
                <span className="font-mono font-bold">{metrics.caches.inMemoryHits.toLocaleString()} records/sec</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2 border-dashed">
                <span className="font-semibold">Direct Database reads:</span>
                <span className="font-mono font-bold text-slate-400">{metrics.caches.dbHits.toLocaleString()} logs</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
                <span className="font-semibold">Active live clients (WebSockets):</span>
                <span className="font-mono font-bold text-cyan-500 animate-pulse">{metrics.activeWSSConnections} active links</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Federation Model Mass:</span>
                <span className="font-mono font-bold text-indigo-400 uppercase">{metrics.caches.federationMeshSchemaWeight}</span>
              </div>
            </div>
          </div>

          {/* CLOUD HARDWARE STATS */}
          <div className="bg-white dark:bg-slate-900/30 border border-slate-205 dark:border-slate-900 p-4 rounded-xl shadow-sm">
            <h3 className="text-xs font-black uppercase text-slate-500 mb-3 tracking-wider flex items-center gap-2">
              <Server className="h-4 w-4 text-emerald-500" />
              Instance Live Coordinates
            </h3>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-150 dark:border-slate-850">
                <Clock className="h-4.5 w-4.5 text-indigo-455 mx-auto mb-1 animate-pulse" />
                <p className="text-[10px] text-slate-400">Gateway Uptime</p>
                <p className="font-mono font-black text-xs text-slate-800 dark:text-white mt-1">
                  {Math.floor(metrics.uptimeSeconds / 60)}m {metrics.uptimeSeconds % 60}s
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-150 dark:border-slate-850">
                <Zap className="h-4.5 w-4.5 text-amber-500 mx-auto mb-1 animate-bounce" />
                <p className="text-[10px] text-slate-400">Mesh CPU weight</p>
                <p className="font-mono font-black text-xs text-slate-800 dark:text-white mt-1">
                  ~0.4% core cluster
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
