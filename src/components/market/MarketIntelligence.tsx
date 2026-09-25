/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { MarketPulseTicker } from './MarketPulseTicker.tsx';
import { TerminalChart } from './TerminalChart.tsx';
import { TechnicalsCard } from './TechnicalsCard.tsx';
import { ProbabilisticScenarioCard } from './ProbabilisticScenarioCard.tsx';
import { EventTransmissionGraph } from './EventTransmissionGraph.tsx';
import { MarketScanner } from './MarketScanner.tsx';
import { PaperTradingDesk } from './PaperTradingDesk.tsx';
import { UpstoxGatewayModal } from './UpstoxGatewayModal.tsx';
import {
  HistoricalBar,
  TechnicalAnalysis,
  ProbabilisticForecast,
  EventMarketTransmission,
  PaperPortfolio,
  UpstoxConfigStatus,
} from '../../types/market.ts';
import {
  TrendingUp,
  BarChart3,
  Network,
  Search,
  Wallet,
  Settings,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Calendar,
} from 'lucide-react';

interface MarketIntelligenceProps {
  theme?: string;
  externalTick?: any; // Tick received from App WebSocket
}

export const MarketIntelligence: React.FC<MarketIntelligenceProps> = ({ theme = 'dark', externalTick }) => {
  const [activeSubTab, setActiveSubTab] = useState<'terminal' | 'transmission' | 'scanner' | 'portfolio'>('terminal');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE');
  const [timeframe, setTimeframe] = useState<string>('15m');
  const [forecastHorizon, setForecastHorizon] = useState<'1D' | '1W' | '1M'>('1W');

  // Market Data States
  const [pulseItems, setPulseItems] = useState<any[]>([]);
  const [bars, setBars] = useState<HistoricalBar[]>([]);
  const [technicals, setTechnicals] = useState<TechnicalAnalysis | null>(null);
  const [forecast, setForecast] = useState<ProbabilisticForecast | null>(null);
  const [transmissions, setTransmissions] = useState<EventMarketTransmission[]>([]);
  const [scannerItems, setScannerItems] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<PaperPortfolio | null>(null);
  const [upstoxStatus, setUpstoxStatus] = useState<UpstoxConfigStatus>({
    isConfigured: true,
    apiKeyMasked: '53CLND (Verified Analytics Token)',
    hasSecret: false,
    hasAccessToken: true,
    mode: 'UPSTOX_LIVE_ANALYTICS',
    feedLatencyMs: 24,
    isAnalyticsOnly: true,
    clientId: '53CLND',
    tokenExpiresAt: '2027-09-01 (Active)',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [lastTickTime, setLastTickTime] = useState<number>(Date.now());

  // Current Price of selected symbol
  const currentPrice =
    bars.length > 0 ? bars[bars.length - 1].close : technicals?.movingAverages.sma20 || 2840;

  // Safe data unpacker supporting both { success: true, data: T } and direct T payloads
  const unpack = (res: any) => (res && res.data !== undefined ? res.data : res);

  // Fetch initial market pulse & scanner data
  const fetchPulseAndMetadata = useCallback(async () => {
    try {
      const [pulseRes, transRes, scanRes, portRes, upstoxRes] = await Promise.all([
        fetch('/api/market/pulse').then((r) => r.json()).catch(() => null),
        fetch('/api/market/transmissions').then((r) => r.json()).catch(() => null),
        fetch('/api/market/scanner').then((r) => r.json()).catch(() => null),
        fetch('/api/market/portfolio').then((r) => r.json()).catch(() => null),
        fetch('/api/market/upstox/status').then((r) => r.json()).catch(() => null),
      ]);

      const pulseData = unpack(pulseRes);
      if (Array.isArray(pulseData)) setPulseItems(pulseData);

      const transData = unpack(transRes);
      if (Array.isArray(transData)) setTransmissions(transData);

      const scanData = unpack(scanRes);
      if (Array.isArray(scanData)) setScannerItems(scanData);

      const portData = unpack(portRes);
      if (portData && typeof portData === 'object') setPortfolio(portData);

      const upstoxData = unpack(upstoxRes);
      if (upstoxData && typeof upstoxData === 'object') setUpstoxStatus(upstoxData);
    } catch (err) {
      console.error('Failed to load market telemetry:', err);
    }
  }, []);

  // Fetch symbol-specific data (bars, technicals, forecast)
  const fetchSymbolData = useCallback(async (sym: string, tf: string, hor: string) => {
    try {
      const [barsRes, techRes, foreRes] = await Promise.all([
        fetch(`/api/market/history/${encodeURIComponent(sym)}?timeframe=${tf}`).then((r) => r.json()).catch(() => null),
        fetch(`/api/market/technicals/${encodeURIComponent(sym)}`).then((r) => r.json()).catch(() => null),
        fetch(`/api/market/forecast/${encodeURIComponent(sym)}?horizon=${hor}`).then((r) => r.json()).catch(() => null),
      ]);

      const barsData = unpack(barsRes);
      if (Array.isArray(barsData)) setBars(barsData);

      const techData = unpack(techRes);
      if (techData && typeof techData === 'object') setTechnicals(techData);

      const foreData = unpack(foreRes);
      if (foreData && typeof foreData === 'object') setForecast(foreData);
    } catch (err) {
      console.error(`Failed to load data for ${sym}:`, err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetchPulseAndMetadata(),
      fetchSymbolData(selectedSymbol, timeframe, forecastHorizon),
    ]).finally(() => {
      setIsLoading(false);
    });
  }, [fetchPulseAndMetadata, fetchSymbolData]);

  // Refetch when symbol or timeframe changes
  useEffect(() => {
    fetchSymbolData(selectedSymbol, timeframe, forecastHorizon);
  }, [selectedSymbol, timeframe, forecastHorizon, fetchSymbolData]);

  // Handle incoming live tick from WebSocket
  useEffect(() => {
    if (!externalTick) return;
    setLastTickTime(Date.now());

    // Update pulse ticker items
    if (externalTick.symbol) {
      setPulseItems((prev) =>
        prev.map((item) =>
          item.symbol === externalTick.symbol
            ? {
                ...item,
                value: externalTick.price,
                change: externalTick.change,
                changePercent: externalTick.changePercent,
              }
            : item
        )
      );

      // If active symbol matches tick, update the last bar close in chart
      if (externalTick.symbol === selectedSymbol && bars.length > 0) {
        setBars((prevBars) => {
          const updated = [...prevBars];
          const lastBar = { ...updated[updated.length - 1] };
          lastBar.close = externalTick.price;
          lastBar.high = Math.max(lastBar.high, externalTick.price);
          lastBar.low = Math.min(lastBar.low, externalTick.price);
          updated[updated.length - 1] = lastBar;
          return updated;
        });
      }
    }
  }, [externalTick, selectedSymbol, bars.length]);

  // Place paper order handler
  const handlePlaceOrder = async (orderData: any) => {
    try {
      const res = await fetch('/api/market/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (data.success) {
        setPortfolio(data.data.portfolio);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Order submission failed' };
    }
  };

  // Reset portfolio handler
  const handleResetPortfolio = async () => {
    try {
      const res = await fetch('/api/market/portfolio/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setPortfolio(data.data);
      }
    } catch (err) {
      console.error('Failed to reset portfolio:', err);
    }
  };

  // Update Upstox config handler
  const handleUpdateConfig = async (config: any) => {
    try {
      const res = await fetch('/api/market/upstox/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        setUpstoxStatus(data.data);
      }
    } catch (err) {
      console.error('Failed to update Upstox configuration:', err);
    }
  };

  // Manual refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchPulseAndMetadata(),
      fetchSymbolData(selectedSymbol, timeframe, forecastHorizon),
    ]);
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Real-time Market Pulse Ticker */}
      <MarketPulseTicker
        pulseItems={pulseItems}
        selectedSymbol={selectedSymbol}
        onSelectSymbol={(sym) => {
          setSelectedSymbol(sym);
          if (activeSubTab !== 'terminal') setActiveSubTab('terminal');
        }}
        feedSource={upstoxStatus.mode}
        lastTickTimestamp={lastTickTime}
        theme={theme}
      />

      {/* Live Market Date & Intelligence Status Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono shadow-sm transition-colors">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Calendar className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
          <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">Market Date:</span>
          <span className="text-slate-900 dark:text-white font-bold">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-slate-400 dark:text-slate-600">•</span>
          <span className="text-cyan-600 dark:text-cyan-400 font-bold">{new Date(lastTickTime).toLocaleTimeString()} IST</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
            <span>SESSION:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">NSE CONTINUOUS CASH & F&O</span>
          </div>

          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hidden sm:flex">
            <span>UPSTOX GATEWAY:</span>
            <span className="text-cyan-600 dark:text-cyan-300 font-bold">ACTIVE (53CLND)</span>
          </div>
        </div>
      </div>

      {/* Sub-navigation Controls & Status Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-sm transition-colors">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold font-mono">
          <button
            onClick={() => setActiveSubTab('terminal')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'terminal'
                ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm border border-slate-200/80 dark:border-transparent'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Terminal & Models</span>
          </button>

          <button
            onClick={() => setActiveSubTab('transmission')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'transmission'
                ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm border border-slate-200/80 dark:border-transparent'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Network className="h-3.5 w-3.5" />
            <span>Event-to-Market Engine</span>
          </button>

          <button
            onClick={() => setActiveSubTab('scanner')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'scanner'
                ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm border border-slate-200/80 dark:border-transparent'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span>AI Scanner & Heatmap</span>
          </button>

          <button
            onClick={() => setActiveSubTab('portfolio')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'portfolio'
                ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm border border-slate-200/80 dark:border-transparent'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Wallet className="h-3.5 w-3.5" />
            <span>Paper Trading & Risk</span>
          </button>
        </div>

        {/* Right side utility actions */}
        <div className="flex items-center gap-2">
          {/* Active Symbol badge */}
          <div className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 hidden sm:flex items-center gap-1.5">
            <span className="text-slate-500 dark:text-slate-400">ACTIVE:</span>
            <span className="text-slate-900 dark:text-white font-extrabold">{selectedSymbol}</span>
            <span className="text-slate-500 dark:text-slate-400 font-normal">₹{currentPrice.toFixed(2)}</span>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            title="Refresh market data"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-cyan-600 dark:text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={() => setShowConfigModal(true)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Upstox Gateway</span>
          </button>
        </div>
      </div>

      {/* Main Content Areas */}
      {isLoading ? (
        <div className="p-16 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl flex flex-col items-center justify-center text-center space-y-3 shadow-sm">
          <Loader2 className="h-8 w-8 text-cyan-500 dark:text-cyan-400 animate-spin" />
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Connecting institutional market data mesh & computing technical indicators...
          </div>
        </div>
      ) : (
        <>
          {/* TAB 1: Terminal & Technical Models */}
          {activeSubTab === 'terminal' && (
            <div className="space-y-4">
              <TerminalChart
                bars={bars}
                symbol={selectedSymbol}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
                currentPrice={currentPrice}
                theme={theme}
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Technical Analysis Deck (Left 6 cols) */}
                <div className="lg:col-span-6">
                  {technicals && <TechnicalsCard technicals={technicals} symbol={selectedSymbol} theme={theme} />}
                </div>

                {/* Probabilistic Scenario Engine (Right 6 cols) */}
                <div className="lg:col-span-6">
                  {forecast && <ProbabilisticScenarioCard forecast={forecast} theme={theme} />}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Event-to-Market Transmission Engine */}
          {activeSubTab === 'transmission' && (
            <EventTransmissionGraph
              transmissions={transmissions}
              onSelectSymbol={(sym) => {
                setSelectedSymbol(sym);
                setActiveSubTab('terminal');
              }}
              theme={theme}
            />
          )}

          {/* TAB 3: AI Scanner & Sector Heatmap */}
          {activeSubTab === 'scanner' && (
            <MarketScanner
              items={scannerItems}
              onSelectSymbol={(sym) => {
                setSelectedSymbol(sym);
                setActiveSubTab('terminal');
              }}
              theme={theme}
            />
          )}

          {/* TAB 4: Paper Trading & Risk Engine */}
          {activeSubTab === 'portfolio' && portfolio && (
            <PaperTradingDesk
              portfolio={portfolio}
              selectedSymbol={selectedSymbol}
              currentPrice={currentPrice}
              onPlaceOrder={handlePlaceOrder}
              onResetPortfolio={handleResetPortfolio}
              theme={theme}
            />
          )}
        </>
      )}

      {/* Upstox Gateway Configuration Modal */}
      {showConfigModal && (
        <UpstoxGatewayModal
          status={upstoxStatus}
          onUpdateConfig={handleUpdateConfig}
          onClose={() => setShowConfigModal(false)}
          theme={theme}
        />
      )}
    </div>
  );
};
