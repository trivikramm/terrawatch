import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import L from 'leaflet';
import { 
  Bell, 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  RefreshCw, 
  Search, 
  Trash2, 
  CheckCheck,
  FileCode,
  SlidersHorizontal,
  ChevronRight,
  Database,
  Send,
  HelpCircle,
  ExternalLink,
  Smartphone,
  Cpu,
  Globe
} from 'lucide-react';
import { AlertNotification } from '../types';

interface WardenAlertsProps {
  alerts: AlertNotification[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function WardenAlerts({ alerts, isLoading, onRefresh }: WardenAlertsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'seismic' | 'weather' | 'system'>('all');
  const [selectedAlert, setSelectedAlert] = useState<AlertNotification | null>(null);

  // Free Telegram Sync States
  const [telegramToken, setTelegramToken] = useState(() => localStorage.getItem('terrawatch_telegram_token') || '8808696850:AAHbdp_uKdT6x1j3fubLrGwHID9DATOdVGc');
  const [telegramChatId, setTelegramChatId] = useState(() => localStorage.getItem('terrawatch_telegram_chatid') || '');
  const [telegramEnabled, setTelegramEnabled] = useState(() => localStorage.getItem('terrawatch_telegram_enabled') === 'true');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testErrorMessage, setTestErrorMessage] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [isFetchingChatId, setIsFetchingChatId] = useState(false);

  // Filter alerts based on selection and search text
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch = 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesType = typeFilter === 'all' || alert.type === typeFilter;

    return matchesSearch && matchesSeverity && matchesType;
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.CircleMarker }>({});

  useEffect(() => {
    const cssId = 'leaflet-core-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }
  }, []);

  const getAlertCoordinates = (alert: AlertNotification) => {
    if (alert.latitude && alert.longitude) return [alert.latitude, alert.longitude];
    const msg = (alert.title + " " + alert.message).toLowerCase();
    if (msg.includes('reykjavik') || msg.includes('iceland')) return [64.1466, -21.9426];
    if (msg.includes('seattle') || msg.includes('washington')) return [47.6062, -122.3321];
    if (msg.includes('kochi') || msg.includes('cochin') || msg.includes('kerala')) return [9.9312, 76.2673];
    if (msg.includes('tokyo') || msg.includes('japan')) return [35.6762, 139.6503];
    if (msg.includes('sandspit') || msg.includes('seismic')) return [53.25, -131.8];
    if (msg.includes('alaska')) return [61.2, -149.9];
    
    const hash = alert.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const coordsList = [
      [64.1466, -21.9426], // Reykjavik
      [47.6062, -122.3321], // Seattle
      [9.9312, 76.2673], // Kochi
      [35.6762, 139.6503], // Tokyo
      [22.3964, 114.1095], // Hong Kong
      [34.0522, -118.2437], // Los Angeles
      [40.7128, -74.0060], // New York
      [51.5074, -0.1278] // London
    ];
    return coordsList[hash % coordsList.length];
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [25.0, 0.0],
        zoom: 2,
        minZoom: 1.5,
        attributionControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach((m) => {
      if (m) (m as L.CircleMarker).remove();
    });
    markersRef.current = {};

    filteredAlerts.forEach((alert) => {
      const [lat, lon] = getAlertCoordinates(alert);
      const isCritical = alert.severity === 'critical';
      const isWarning = alert.severity === 'warning';
      const color = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#06b6d4';

      const circle = L.circleMarker([lat, lon], {
        radius: isCritical ? 10 : isWarning ? 8 : 6,
        fillColor: color,
        color: color,
        weight: 1.5,
        opacity: 0.8,
        fillOpacity: 0.4
      }).addTo(map);

      let direction = 1;
      const interval = setInterval(() => {
        if (!circle || !map.hasLayer(circle)) {
          clearInterval(interval);
          return;
        }
        const currentRadius = circle.getRadius();
        const baseRadius = isCritical ? 10 : isWarning ? 8 : 6;
        let nextRadius = currentRadius + direction * 0.4;
        if (nextRadius > baseRadius + 3) direction = -1;
        if (nextRadius < baseRadius - 1) direction = 1;
        circle.setRadius(nextRadius);
      }, 120);

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 11px; padding: 4px; color: #1e293b;">
          <b style="text-transform: uppercase; color: ${color};">${alert.severity} • ${alert.type}</b>
          <div style="font-weight: bold; margin-top: 2px;">${alert.title}</div>
          <p style="margin-top: 4px; color: #475569; font-weight: 500; margin-bottom: 0;">${alert.message}</p>
        </div>
      `;
      circle.bindPopup(popupContent, { closeButton: false });

      circle.on('click', () => {
        setSelectedAlert(alert);
      });

      markersRef.current[alert.id] = circle;
    });

  }, [filteredAlerts]);

  useEffect(() => {
    if (selectedAlert && mapInstanceRef.current) {
      const [lat, lon] = getAlertCoordinates(selectedAlert);
      mapInstanceRef.current.setView([lat, lon], 5, { animate: true, duration: 1.2 });
      const marker = markersRef.current[selectedAlert.id];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedAlert]);

  const handleFetchChatId = async () => {
    if (!telegramToken.trim()) {
      alert('Please enter or verify your Telegram Bot Token first.');
      return;
    }
    setIsFetchingChatId(true);
    try {
      const response = await fetch(`/api/telegram/getUpdates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: telegramToken.trim() })
      });
      if (!response.ok) {
        throw new Error(`Proxy status HTTP ${response.status}`);
      }
      const data = await response.json();
      // Ensure we extract the inner results if nested inside proxy response data
      const telegramPayload = data.success && data.data ? data.data : data;

      if (telegramPayload.ok && telegramPayload.result && telegramPayload.result.length > 0) {
        // Search from newest to oldest for any message containing chat info
        let detectedId = '';
        let detectedUser = '';
        const results = telegramPayload.result;
        for (let i = results.length - 1; i >= 0; i--) {
          const u = results[i];
          const chat = u.message?.chat || u.channel_post?.chat || u.callback_query?.message?.chat;
          if (chat && chat.id) {
            detectedId = String(chat.id);
            detectedUser = chat.username || chat.title || chat.first_name || '';
            break;
          }
        }
        if (detectedId) {
          setTelegramChatId(detectedId);
          alert(`Success! Automatically found recent Chat ID: ${detectedId}${detectedUser ? ` (from sender: ${detectedUser})` : ''}. Keep in mind you can now click "Save Sync" below!`);
        } else {
          alert("Successfully connected, but couldn't find a Chat ID in the log. Make sure to open your Telegram app, search for the bot, click \"Start\" (or send a message), then try again!");
        }
      } else {
        alert("Connected successfully! However, there are no recent messages/events logged. Please open your Telegram app, search for your bot, send a message to it or click \"Start\", then try fetching again!");
      }
    } catch (e: any) {
      alert(`Failed to auto-detect Chat ID: ${e.message || 'Connection error'}. Please ensure the Bot Token is correct and that the Bot has received at least one message on Telegram.`);
    } finally {
      setIsFetchingChatId(false);
    }
  };

  const handleSaveTelegram = () => {
    localStorage.setItem('terrawatch_telegram_token', telegramToken.trim());
    localStorage.setItem('terrawatch_telegram_chatid', telegramChatId.trim());
    localStorage.setItem('terrawatch_telegram_enabled', String(telegramEnabled));
    // Also notify App window for immediate config update
    window.dispatchEvent(new Event('storage'));
    alert('Telegram notification configuration saved dynamically and locally stored!');
  };

  const handleTestTelegram = async () => {
    if (!telegramToken.trim() || !telegramChatId.trim()) {
      setTestStatus('error');
      setTestErrorMessage('Both Bot Token and Chat ID are mandatory to test integration.');
      return;
    }
    setTestStatus('testing');
    try {
      const textMessage = `🚀 <b>TerraWatch Security Dispatch</b>\n\nFree real-time critical warnings sync has been successfully configured! Any severe storm, lightning strike, or high-magnitude tectonic fault slips will instantly cascade to your Telegram channel.\n\n<b>Station Latency:</b> Nominal\n<b>Server Time:</b> ${new Date().toLocaleTimeString()}`;
      const response = await fetch(`/api/telegram/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: telegramToken.trim(),
          chatId: telegramChatId.trim(),
          text: textMessage
        })
      });
      if (response.ok) {
        setTestStatus('success');
      } else {
        const errJson = await response.json().catch(() => ({}));
        setTestStatus('error');
        setTestErrorMessage(errJson.error || errJson.message || 'Proxy replied with failure code');
      }
    } catch (e: any) {
      setTestStatus('error');
      setTestErrorMessage(e.message || 'Connection fetch timeout');
    }
  };

  return (
    <div className="space-y-6" id="warden-alerts-section-root">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-900/80 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="bg-red-500/10 text-red-500 p-2 rounded-xl border border-red-500/20">
              <Bell className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">Warden Alarms & Alerts</h2>
              <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Database className="h-3.5 w-3.5 text-cyan-500" />
                <span>Cloud SQL Relational Ledger Synced</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="bg-slate-100 hover:bg-slate-205 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-300 px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 transition-all active:scale-95 flex items-center justify-center gap-1.5 self-start sm:self-center disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Sync Log Database</span>
        </button>
      </div>

      {/* GEOSPATIAL WARNINGS DISTRIBUTION MAP */}
      <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 p-2 rounded-2xl">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-400">
            <Globe className="h-4 w-4 text-cyan-500 animate-pulse" />
            <span>Warden Geospatial Alert Watch Map</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 font-bold">{filteredAlerts.length} alarm zones monitored</span>
        </div>
        <div 
          ref={mapContainerRef} 
          className="w-full h-[250px] rounded-xl overflow-hidden shadow-inner z-10 border border-slate-100 dark:border-slate-850" 
        />
      </div>

      {/* FILTER CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search */}
        <div className="md:col-span-4 relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search alarm titles or descriptions..."
            className="w-full bg-white dark:bg-slate-900/30 text-slate-900 dark:text-white text-xs border border-slate-200 dark:border-slate-850 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-semibold"
          />
        </div>

        {/* Severity Filter */}
        <div className="md:col-span-4 flex items-center gap-2 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-855 p-1 rounded-xl">
          <span className="text-[10px] font-bold text-slate-450 uppercase pl-3 select-none">Severity:</span>
          <div className="flex-1 flex gap-1">
            {(['all', 'critical', 'warning', 'info'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                  severityFilter === sev
                    ? sev === 'critical'
                      ? 'bg-red-500/15 text-red-650 dark:text-red-400 border border-red-500/20'
                      : sev === 'warning'
                      ? 'bg-amber-500/15 text-amber-650 dark:text-amber-400 border border-amber-505/20'
                      : sev === 'info'
                      ? 'bg-cyan-500/15 text-cyan-650 dark:text-cyan-400 border border-cyan-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white border'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div className="md:col-span-4 flex items-center gap-2 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-855 p-1 rounded-xl">
          <span className="text-[10px] font-bold text-slate-450 uppercase pl-3 select-none">Source:</span>
          <div className="flex-1 flex gap-1">
            {(['all', 'seismic', 'weather', 'system'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                  typeFilter === type
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {type === 'all' ? 'All' : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CORE ALERTS LIST LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Alerts List */}
        <div className="lg:col-span-7 space-y-3">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-slate-900/20 p-12 rounded-2xl border border-slate-200 dark:border-slate-900 flex flex-col items-center justify-center text-center space-y-3"
              >
                <RefreshCw className="h-10 w-10 text-cyan-500 animate-spin" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Retrieving historical security ledger...</p>
              </motion.div>
            ) : filteredAlerts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-slate-900/25 p-16 rounded-2xl border border-slate-205 dark:border-slate-900 flex flex-col items-center justify-center text-center space-y-3"
              >
                <CheckCheck className="h-12 w-12 text-emerald-500/80" />
                <h3 className="text-sm font-black uppercase text-slate-700 dark:text-slate-300">Warden Node Clear</h3>
                <p className="text-xs text-slate-400 max-w-xs font-semibold">No active warnings or historical disasters matched current geodetic query parameters.</p>
              </motion.div>
            ) : (
              filteredAlerts.map((alert) => {
                const isCritical = alert.severity === 'critical';
                const isWarning = alert.severity === 'warning';
                
                return (
                  <motion.div
                    key={alert.id}
                    layoutId={alert.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setSelectedAlert(alert)}
                    className={`p-4 rounded-xl border bg-white dark:bg-slate-900/35 hover:shadow-md transition-all duration-200 cursor-pointer flex gap-3.5 relative overflow-hidden items-start ${
                      selectedAlert?.id === alert.id
                        ? 'border-cyan-500 ring-1 ring-cyan-500 shadow-inner'
                        : isCritical
                        ? 'border-red-200 dark:border-red-950/50 hover:border-red-300 dark:hover:border-red-900'
                        : isWarning
                        ? 'border-amber-200 dark:border-amber-950/50 hover:border-amber-300 dark:hover:border-amber-900'
                        : 'border-slate-200 dark:border-slate-900/60 hover:border-slate-305 dark:hover:border-slate-805'
                    }`}
                  >
                    {/* Severity colored left accent line */}
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${
                      isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-cyan-500'
                    }`} />

                    <div className="shrink-0 mt-0.5">
                      {isCritical ? (
                        <ShieldAlert className="h-5 w-5 text-red-500" />
                      ) : isWarning ? (
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      ) : (
                        <Info className="h-5 w-5 text-cyan-500" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1 pr-2">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wide pr-6">
                          {alert.title}
                        </h4>
                        <span className="font-mono text-[9px] text-slate-400 font-semibold">
                          {new Date(alert.timestamp).toLocaleDateString()} {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed truncate max-w-md">
                        {alert.message}
                      </p>
                    </div>

                    <ChevronRight className="h-4.5 w-4.5 text-slate-400 self-center shrink-0" />
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Selected Alert Details Panel */}
        <div className="lg:col-span-5 space-y-6">
          <AnimatePresence mode="wait">
            {selectedAlert ? (
              <motion.div
                key={selectedAlert.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-900 shadow-sm space-y-5 sticky top-24"
              >
                {/* Header details */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase border mb-2 ${
                      selectedAlert.severity === 'critical'
                        ? 'bg-red-500/10 border-red-500/20 text-red-655 dark:text-red-400'
                        : selectedAlert.severity === 'warning'
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-655 dark:text-amber-400'
                        : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-655 dark:text-cyan-400'
                    }`}>
                      {selectedAlert.severity} ALARM
                    </span>
                    <h3 className="text-sm font-black uppercase text-slate-950 dark:text-white tracking-wide">{selectedAlert.title}</h3>
                  </div>
                  
                  <button
                    onClick={() => setSelectedAlert(null)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </button>
                </div>

                {/* Body Details */}
                <div className="space-y-4 text-xs font-semibold leading-relaxed text-slate-600 dark:text-slate-355">
                  <p className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-900 leading-relaxed font-semibold">
                    {selectedAlert.message}
                  </p>

                  <div className="grid grid-cols-2 gap-3.5 pt-1.5 font-mono text-[10px]">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-950/30 rounded-lg border dark:border-slate-900">
                      <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wider">Payload ID:</span>
                      <span className="text-slate-700 dark:text-cyan-455 truncate block mt-0.5 font-bold uppercase">{selectedAlert.id}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 dark:bg-slate-950/30 rounded-lg border dark:border-slate-900">
                      <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wider">Category:</span>
                      <span className="text-slate-700 dark:text-amber-450 truncate block mt-0.5 font-bold uppercase">{selectedAlert.type}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="block text-[8px] uppercase font-bold text-slate-400 font-mono tracking-wider mb-1">Time Captured:</span>
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-955 px-2.5 py-1.5 rounded-lg border dark:border-slate-850 block">
                      {new Date(selectedAlert.timestamp).toString()}
                    </span>
                  </div>
                </div>

                {/* Live Copy Code */}
                <div className="pt-1">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(selectedAlert, null, 2));
                      alert('Alert database document telemetry payload copied to clipboard.');
                    }}
                    className="w-full bg-slate-900 dark:bg-slate-950 hover:bg-slate-950 dark:hover:bg-slate-900 text-slate-300 hover:text-white p-3 border border-slate-800 dark:border-slate-900 rounded-xl transition-all font-mono text-[10px] uppercase flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer font-bold"
                  >
                    <FileCode className="h-4 w-4 text-cyan-400" />
                    <span>Copy JSON Meta payload</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="hidden lg:block bg-slate-50 dark:bg-slate-900/10 p-8 rounded-2xl border-2 border-dashed border-slate-205 dark:border-slate-850 text-center text-slate-450 space-y-2 mt-0">
                <SlidersHorizontal className="h-8 w-8 mx-auto text-slate-400 dark:text-slate-600" />
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Inspect Alert telemetry</h4>
                <p className="text-[11px] max-w-xs mx-auto font-semibold text-slate-400">Select any active security dispatch or seismic alarm on the left to view raw relational coordinate details.</p>
              </div>
            )}
          </AnimatePresence>

          {/* TELEGRAM SYNC CONTROLLERS CARD */}
          <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-555/10 dark:bg-emerald-500/15 p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
                  <Smartphone className="h-4 w-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wide text-slate-900 dark:text-white">Instant Telegram Sync</h3>
                  <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 block">REAL-TIME MOBILITY ALERT CHANNEL</span>
                </div>
              </div>
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20 text-[8px] px-2 py-0.5 rounded-full uppercase font-mono font-bold select-none">
                100% Free
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              Propagate critical geological ruptures, lightning outbreaks, and cargo delay hazards straight to your smartphone for free. No recurring costs or SMS package limits.
            </p>

            <div className="space-y-3.5">
              {/* Bot Token Entry */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold tracking-wider text-slate-405 dark:text-slate-450 font-mono block">Telegram Bot Token:</label>
                <input
                  type="password"
                  value={telegramToken}
                  onChange={(e) => setTelegramToken(e.target.value)}
                  placeholder="e.g. 7423985721:AAHfe398B..."
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              {/* Chat ID Entry */}
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-slate-405 dark:text-slate-450 font-mono block">Recipient Chat ID / Channel ID:</label>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={handleFetchChatId}
                      disabled={isFetchingChatId}
                      className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 hover:brightness-110 cursor-pointer flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/15 duration-150 px-2.5 py-0.5 rounded border border-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                      title="Retrieves your Chat ID dynamically by looking up recent /start or message interactions with the Bot"
                    >
                      <RefreshCw className={`h-2.5 w-2.5 ${isFetchingChatId ? 'animate-spin' : ''}`} />
                      <span>{isFetchingChatId ? 'Searching...' : 'Autodetect ID'}</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowGuide(!showGuide)}
                      className="text-[9px] font-bold text-cyan-500 hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <HelpCircle className="h-3 w-3" />
                      <span>How?</span>
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder="e.g. 5629482 or -10041234123"
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <span className="text-[9.5px] font-medium text-slate-400 dark:text-slate-505 block leading-normal pt-1">
                  💡 <b>Quick Autodetect:</b> Message or tap <b>Start</b> inside your bot on Telegram, then hit the green <u>Autodetect ID</u> button above to auto-fill your Chat ID!
                </span>
              </div>

              {/* Toggle Enable State */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border dark:border-slate-900">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase text-slate-800 dark:text-white block font-sans">Sync status</span>
                  <span className="text-[9px] font-mono font-bold text-slate-450 block">STREAM ACTIVE ALERTS</span>
                </div>
                <button
                  onClick={() => setTelegramEnabled(!telegramEnabled)}
                  className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${
                    telegramEnabled ? 'bg-emerald-555 dark:bg-emerald-600' : 'bg-slate-300 dark:bg-slate-800'
                  }`}
                >
                  <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ${
                    telegramEnabled ? 'translate-x-4.5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Test Connection Display Logs */}
              {testStatus !== 'idle' && (
                <div className={`p-2.5 rounded-xl border text-[10px] font-semibold leading-relaxed font-mono ${
                  testStatus === 'testing'
                    ? 'bg-slate-50 dark:bg-slate-950/20 border-slate-200 text-slate-450 animate-pulse'
                    : testStatus === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400'
                    : 'bg-red-500/10 border-red-500/25 text-red-600 dark:text-red-400'
                }`}>
                  {testStatus === 'testing' && '⏳ Dispatching severe test payload to Telegram Servers...'}
                  {testStatus === 'success' && '✅ Test message dispatched successfully! Check your phone 🚀.'}
                  {testStatus === 'error' && `⚠️ Dispatch failed: ${testErrorMessage}`}
                </div>
              )}

              {/* Guide Overlay Panel */}
              <AnimatePresence>
                {showGuide && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-cyan-950/15 border border-cyan-500/10 rounded-xl space-y-2 text-[10px] font-semibold leading-normal text-slate-600 dark:text-cyan-200/80 overflow-hidden"
                  >
                    <span className="font-bold text-cyan-500 dark:text-cyan-400 uppercase tracking-wide block font-mono">10 second setup guide:</span>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Launch Telegram & search for <b className="text-white">@BotFather</b></li>
                      <li>Send <code className="bg-slate-150 dark:bg-slate-950 px-1 py-0.5 rounded font-mono">/newbot</code>, choose a username, and copy the token.</li>
                      <li>Search for <b className="text-white">@userinfobot</b> & tap start to instantly read your unique numeric <b className="text-white">Chat ID</b>.</li>
                      <li>Alternatively, add your bot as an Admin inside any channel to broadcast warnings.</li>
                    </ol>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Functional CTA bar */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleTestTelegram}
                  disabled={testStatus === 'testing'}
                  className="bg-slate-100 hover:bg-slate-150 dark:bg-slate-950 hover:dark:bg-slate-900 border dark:border-slate-800 text-slate-600 dark:text-slate-350 p-2.5 text-[10px] font-bold uppercase rounded-xl transition-all active:scale-95 disabled:opacity-55 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Send className="h-3 w-3 text-cyan-500" />
                  <span>Test Fire</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveTelegram}
                  className="bg-slate-900 hover:bg-slate-950 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white dark:text-slate-950 p-2.5 text-[10px] font-black uppercase rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Cpu className="h-3 w-3" />
                  <span>Save Sync</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
