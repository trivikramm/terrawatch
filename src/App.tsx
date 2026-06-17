/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  MapPin,
  Heart,
  Activity,
  History,
  Sparkles,
  Bell,
  X,
  Compass,
  AlertTriangle,
  Waves,
  RefreshCw,
  Globe,
  Loader2,
  ListFilter,
  Check,
  Send,
  Sun,
  Moon,
  Info
} from 'lucide-react';
import { Earthquake, WeatherData, ClimateInsights, AlertNotification } from './types';

// Importing Custom Layout Components
import WeatherCard from './components/WeatherCard';
import WindGauge from './components/WindGauge';
import AQICard from './components/AQICard';
import ForecastChart from './components/ForecastChart';
import EarthquakeMap from './components/EarthquakeMap';
import StatisticsCard from './components/StatisticsCard';
import SeismicDetailDeck from './components/SeismicDetailDeck';
import EarthquakeCard from './components/EarthquakeCard';
import AlertCard from './components/AlertCard';
import MeteorologyFlowMap from './components/MeteorologyFlowMap';

// Importing Custom Modular Subpages
import Sidebar from './components/Sidebar';
import TsunamiSurveillance from './components/TsunamiSurveillance';
import DisasterLogistics from './components/DisasterLogistics';
import CognitiveChat from './components/CognitiveChat';
import FederationStatus from './components/FederationStatus';
import OperatorTerminal from './components/OperatorTerminal';
import WardenAlerts from './components/WardenAlerts';
import AviationIncidentRadar from './components/AviationIncidentRadar';

// Default fallback selected city
const DEFAULT_CITY = { name: 'Trivandrum', lat: 8.5241, lon: 76.9366, country: 'IN' };

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'alerts' | 'seismic' | 'meteo' | 'supplyChain' | 'chat' | 'federation' | 'terminal'>('dashboard');

  // Token & Authenticated Operator States
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('terrawatch_jwt'));
  const [operator, setOperator] = useState<{ id: string; email: string; name: string } | null>(() => {
    const saved = localStorage.getItem('terrawatch_operator');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  // Track cargo count state for sidebar indicator
  const [activeCargoCount, setActiveCargoCount] = useState(0);

  // Core telemetry states
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITY);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [eqLoading, setEqLoading] = useState(true);
  const [eqErrors, setEqErrors] = useState<string | null>(null);
  const [eqPeriod, setEqPeriod] = useState<'hour' | 'day' | 'week'>('day');
  const [minMagnitude, setMinMagnitude] = useState<number>(0);
  const [selectedEqId, setSelectedEqId] = useState<string | null>(null);
  const [seismicSubTab, setSeismicSubTab] = useState<'tremors' | 'tsunamis'>('tremors');

  const [aiInsights, setAiInsights] = useState<ClimateInsights | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [pushNotifications, setPushNotifications] = useState<AlertNotification[]>([]);
  const [wsConnected, setWsConnected] = useState(false);

  // Warden Alerts states (persistent database-backed)
  const [alertsList, setAlertsList] = useState<AlertNotification[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);

  const fetchAlertsLedger = async () => {
    setAlertsLoading(true);
    try {
      const response = await fetch('/api/alerts');
      if (response.ok) {
        const data = await response.json();
        setAlertsList(data);
      }
    } catch (e) {
      console.error('Failed to retrieve security alerts:', e);
    } finally {
      setAlertsLoading(false);
    }
  };

  // Micro adjustments state representing standard second-by-second micro shifts
  const [microShifts, setMicroShifts] = useState({
    windShift: 0,
    gustShift: 0,
    pressureShift: 0,
  });

  // State to control Meteorological Forecast selection
  const [showMeteoForecast, setShowMeteoForecast] = useState(false);

  // Reference for WebSocket to enable graceful cleanup
  const wsRef = useRef<WebSocket | null>(null);

  // Global Light/Dark Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('terrawatch_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  // Track state change and set class matching theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('terrawatch_theme', theme);
  }, [theme]);

  // Initialize favorites and fetch alerts on start
  useEffect(() => {
    fetchAlertsLedger();
    const saved = localStorage.getItem('terrawatch_favs');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        setFavorites([]);
      }
    } else {
      setFavorites([]);
      localStorage.setItem('terrawatch_favs', JSON.stringify([]));
    }
  }, []);

  // Fetch Weather details
  const fetchWeather = async (lat: number, lon: number, cityName: string) => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}&city=${encodeURIComponent(cityName)}`);
      if (!response.ok) {
        throw new Error('Failed to retrieve atmospheric intelligence');
      }
      const data = await response.json();
      setWeather(data);
    } catch (err: any) {
      console.error(err);
      setWeatherError('Failed to communicate with meteorological tracking servers.');
    } finally {
      setWeatherLoading(false);
    }
  };

  // Fetch Earthquakes
  const fetchEarthquakes = async (period: 'hour' | 'day' | 'week') => {
    setEqLoading(true);
    setEqErrors(null);
    try {
      const response = await fetch(`/api/earthquakes?period=${period}`);
      if (!response.ok) {
        throw new Error('USGS Seismic server returned unsuccessful code');
      }
      const data = await response.json();
      setEarthquakes(data);
    } catch (err: any) {
      console.error(err);
      setEqErrors('Unable to parse active tectonic monitoring database.');
    } finally {
      setEqLoading(false);
    }
  };

  // Fetch live cargo transits count
  const fetchCargoCount = async () => {
    try {
      const response = await fetch('/api/logistics/cargo');
      if (response.ok) {
        const data = await response.json();
        setActiveCargoCount(data.length);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Trigger statistical and telemetry insights report
  const fetchAIInsights = async () => {
    if (!weather) return;
    setAiLoading(true);
    setAiError(null);
    try {
      // Send active weather and matching earthquakes inside bounds to analytics compiler
      const scopedEarthquakes = earthquakes.slice(0, 30);
      const response = await fetch('/api/climate-ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weather, earthquakes: scopedEarthquakes }),
      });
      if (!response.ok) {
        throw new Error('Analytics server returned unsuccessful code');
      }
      const data = await response.json();
      setAiInsights(data);
    } catch (err: any) {
      console.error(err);
      setAiError('Failed to generate real-time Insights. Try refreshing.');
    } finally {
      setAiLoading(false);
    }
  };

  // Handle City geocoding search autocomplete
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/cities/search?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        }
      } catch (e) {
        console.error('Error fetching autocomplete cities:', e);
      } finally {
        setIsSearching(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Establish live Server-to-Client WebSocket telemetry
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socketUrl = `${protocol}//${window.location.host}/ws`;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(socketUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsConnected(true);
          console.log('Telemetry link connected.');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Handles Live Micro Shifts ticking
            if (data.type === 'telemetry_tick') {
              setMicroShifts({
                windShift: data.wind_shift,
                gustShift: data.gust_shift,
                pressureShift: data.pressure_shift,
              });
            }

            // Handles push severe notifications
            if (data.type === 'push_alert' && data.alert) {
              const alert = data.alert;

              // Only show floating toast notification if it is a critical/high alert impacting human life or infrastructure
              const isHighImpactAlert = 
                alert.severity === 'critical' || 
                (alert.severity === 'warning' && (
                  // Severe hazards directly affecting human beings or vital infrastructure
                  /human|life|lives|people|person|safety|casualty|fatal|injury|population|tsunami|collapse|destruction|severe threat|imperiled/i.test(alert.title + " " + alert.message)
                ));

              if (isHighImpactAlert) {
                setPushNotifications((prev) => {
                  if (prev.some((a) => a.id === alert.id)) return prev;
                  return [alert, ...prev].slice(0, 5); // limit to 5
                });
              }

              setAlertsList((prev) => {
                if (prev.some((a) => a.id === alert.id)) return prev;
                return [alert, ...prev];
              });

              // Asynchronously dispatch free Telegram notification alert if enabled
              try {
                const telemEnabled = localStorage.getItem('terrawatch_telegram_enabled') === 'true';
                const telemToken = localStorage.getItem('terrawatch_telegram_token');
                const telemChatId = localStorage.getItem('terrawatch_telegram_chatid');
                
                if (telemEnabled && telemToken && telemChatId) {
                  const severityIcon = alert.severity === 'critical' ? '🔴' : alert.severity === 'warning' ? '⚠️' : '🔵';
                  const messageText = `${severityIcon} <b>${alert.title || 'TERRAWATCH ALERT'}</b>\n\n${alert.message || ''}\n\n<i>Severity: ${alert.severity?.toUpperCase()}</i>\n<i>Time: ${new Date(alert.timestamp).toLocaleTimeString()}</i>`;
                  fetch(`/api/telegram/send`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      token: telemToken.trim(),
                      chatId: telemChatId.trim(),
                      text: messageText
                    })
                  }).catch(err => console.error('Telegram sync dispatch proxy failed:', err));
                }
              } catch (err) {
                console.error('Telegram sync error:', err);
              }

              // Refetch cargo on dispatch/hazard simulation pushes
              fetchCargoCount();
            }
          } catch (e) {
            console.error('WS parsing error:', e);
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          // Try reconnecting in 5 seconds
          setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = (err) => {
          console.error('WS incident:', err);
        };
      } catch (err) {
        console.error('WS initialization crash:', err);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Sync data fetch on changes in selected city or earthquake timespan
  useEffect(() => {
    fetchWeather(selectedCity.lat, selectedCity.lon, selectedCity.name);
  }, [selectedCity]);

  useEffect(() => {
    fetchEarthquakes(eqPeriod);
  }, [eqPeriod]);

  useEffect(() => {
    fetchCargoCount();
  }, []);

  // Refresh trigger
  const forceRefresh = () => {
    fetchWeather(selectedCity.lat, selectedCity.lon, selectedCity.name);
    fetchEarthquakes(eqPeriod);
    fetchCargoCount();
    setAiInsights(null);
  };

  // Add / Remove from favorites list helper
  const isFavorite = favorites.some((f) => f.name.toLowerCase() === selectedCity.name.toLowerCase());
  const toggleFavorite = () => {
    let updated;
    if (isFavorite) {
      updated = favorites.filter((f) => f.name.toLowerCase() !== selectedCity.name.toLowerCase());
    } else {
      updated = [...favorites, selectedCity];
    }
    setFavorites(updated);
    localStorage.setItem('terrawatch_favs', JSON.stringify(updated));
  };

  const handleAuthSuccess = (newToken: string, newOperator: { id: string; email: string; name: string }) => {
    setToken(newToken);
    setOperator(newOperator);
    localStorage.setItem('terrawatch_jwt', newToken);
    localStorage.setItem('terrawatch_operator', JSON.stringify(newOperator));
  };

  const handleLogout = () => {
    setToken(null);
    setOperator(null);
    localStorage.removeItem('terrawatch_jwt');
    localStorage.removeItem('terrawatch_operator');
  };

  // Filter Earthquakes based on users selected magnitude threshold
  const filteredEarthquakes = earthquakes.filter((eq) => eq.magnitude >= minMagnitude);

  // Apply Micro Shifts on Wind metrics represent second-by-second tracking conditions
  const speedAdjusted = weather ? Math.max((weather.current.wind_speed + microShifts.windShift), 0) : 0;
  const gustAdjusted = weather && weather.current.wind_gust ? Math.max((weather.current.wind_gust + microShifts.gustShift), 0) : undefined;
  const pressureAdjusted = weather ? (weather.current.pressure + microShifts.pressureShift) : 1013;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col lg:flex-row selection:bg-cyan-500/25 selection:text-cyan-605 dark:selection:text-cyan-300 antialiased font-sans transition-colors duration-300">
      
      {/* GOOGLE-STYLE COLLAPSIBLE INTEGRATED NAVIGATION SIDEBAR */}
      <Sidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={operator}
        onLogout={handleLogout}
        eqCount={earthquakes.filter(e => e.magnitude >= 4.5).length}
        cargoCount={activeCargoCount}
        theme={theme}
      />

      {/* DETAILED PUSH ALERT FLOATING TOASTS */}
      <div className="fixed bottom-4 right-4 z-[9999] space-y-2.5 max-w-sm pointer-events-none">
        <AnimatePresence>
          {pushNotifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              className={`pointer-events-auto p-4 rounded-xl border-l-4 shadow-2xl flex gap-3 relative overflow-hidden transition-all duration-300 ${
                theme === 'light'
                  ? 'bg-white border-y border-r border-slate-205 shadow-2xl'
                  : 'backdrop-blur-sm bg-slate-950/90'
              } ${
                notif.severity === 'critical'
                  ? theme === 'light'
                    ? 'border-red-600 text-red-700'
                    : 'bg-red-950/90 border-red-500 text-red-200'
                  : notif.severity === 'warning'
                  ? theme === 'light'
                    ? 'border-amber-500 text-amber-750'
                    : 'bg-orange-950/90 border-orange-500 text-orange-200'
                  : theme === 'light'
                  ? 'border-cyan-500 text-cyan-750'
                  : 'bg-cyan-950/90 border-cyan-500 text-cyan-200'
              }`}
            >
              {theme !== 'light' && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-current/5 rounded-full filter blur-xl pointer-events-none" />
              )}

              <div className="shrink-0 mt-0.5">
                <Bell className={`h-5 w-5 animate-bounce ${
                  theme === 'light'
                    ? notif.severity === 'critical'
                      ? 'text-red-600'
                      : notif.severity === 'warning'
                      ? 'text-amber-600'
                      : 'text-cyan-600'
                    : 'text-current'
                }`} />
              </div>

              <div className="text-xs flex-1">
                <div className="flex items-center justify-between gap-3 font-extrabold pr-4 uppercase tracking-normal text-[11px]">
                  <span className={theme === 'light' ? 'text-black' : ''}>{notif.title}</span>
                  <span className={`font-mono text-[9px] font-normal font-sans ${theme === 'light' ? 'text-slate-600 font-bold' : 'text-slate-400'}`}>
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className={`mt-1 leading-normal font-bold ${theme === 'light' ? 'text-black' : 'text-slate-200'}`}>{notif.message}</p>
              </div>

              <button
                onClick={() => setPushNotifications((p) => p.filter((n) => n.id !== notif.id))}
                className={`absolute top-2 right-2 cursor-pointer transition-colors ${
                  theme === 'light' ? 'text-slate-600 hover:text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* CORE WORKSPACE CONTENT COLUMN */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* DESKTOP INTEGRATED SUB BAR */}
        <header className="hidden lg:block border-b border-slate-200 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-3 transition-colors duration-300">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold font-mono">
              <span>ACTIVE CLIMATE SUBSTATION:</span>
              <span className="text-slate-800 dark:text-white font-extrabold flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-cyan-500" /> {selectedCity.name} ({selectedCity.country})</span>
            </div>

            <div className="flex items-center gap-3">
              {/* WS Connectivity Indicator */}
              <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-900/40 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg">
                <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Stream: {wsConnected ? 'Connected' : 'Disconnected'}</span>
              </div>

              {/* Theme Toggle */}
              <button
                id="header-theme-toggle-btn"
                onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
                className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all active:scale-95 cursor-pointer"
              >
                {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              </button>

              {/* Refresh */}
              <button
                onClick={forceRefresh}
                className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-880 p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all active:scale-95 cursor-pointer"
                title="Refresh Active Substation telemetry"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* CONTAINER SWITCH VIEW AREA */}
        <main className="flex-grow p-4 lg:p-6">
          <AnimatePresence mode="wait">
            
            {/* 1) OPERATIONS COMMAND PORTAL PANEL */}
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* STATION SEARCH PANEL & COORD SETTINGS CARD */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  
                  {/* Presets and Search inside Dashboard */}
                  <div className="md:col-span-8 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 p-4 rounded-xl shadow-sm space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                      <input
                        id="station-search-box-dashboard"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Type city coordinates to fetch meteorology (e.g. Reykjavik, Seattle, Kochi...)"
                        className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-cyan-500"
                      />
                      {isSearching && (
                        <Loader2 className="absolute right-3.5 top-3.5 h-4 w-4 animate-spin text-slate-500" />
                      )}
                    </div>

                    <AnimatePresence>
                      {searchResults.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-900 max-h-48 overflow-y-auto"
                        >
                          {searchResults.map((cityObj, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedCity(cityObj);
                                setSearchQuery('');
                                setSearchResults([]);
                              }}
                              className="w-full p-3 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-900 flex justify-between items-center cursor-pointer"
                            >
                              <span className="font-bold">{cityObj.name}, {cityObj.state ? `${cityObj.state}, ` : ''}{cityObj.country}</span>
                              <span className="text-[10px] text-slate-400 font-mono">Lat: {cityObj.lat.toFixed(2)} | Lon: {cityObj.lon.toFixed(2)}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Quick Preset Coordinates */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Station presetting</p>
                      <div className="flex flex-wrap gap-2">
                        {favorites.map((fav, i) => {
                          const isActive = fav.name.toLowerCase() === selectedCity.name.toLowerCase();
                          return (
                            <button
                              key={i}
                              onClick={() => setSelectedCity(fav)}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 border transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-cyan-50 dark:bg-cyan-950 border-cyan-300 text-cyan-600 dark:text-cyan-400'
                                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500'
                              }`}
                            >
                              <MapPin className="h-3 w-3" />
                              <span>{fav.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Favorite save Card */}
                  <div className="md:col-span-4 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 p-4 rounded-xl shadow-sm text-center flex flex-col justify-between h-[120px] md:h-full">
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-400">Save active Substation</h4>
                      <p className="text-[11px] text-slate-500 mt-1 font-semibold">Tether current coordinates list into preset chips.</p>
                    </div>
                    <button
                      onClick={toggleFavorite}
                      className={`text-xs py-2 px-3.5 border rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold w-full ${
                        isFavorite
                          ? 'border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/10'
                          : 'border-slate-205 dark:border-slate-800 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                      <span>{isFavorite ? 'Remove from favorites' : 'Unpin Favorite'}</span>
                    </button>
                  </div>

                </div>

                {/* TWO COLUMN GRID WITH ATMOSPHERIC, MAPS, ALERTS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left panel: Important Atmospheric status feeds (Sun, AQI, Warnings) */}
                  <div className="lg:col-span-4 space-y-5">
                    {weatherLoading ? (
                      <div className="p-12 border border-slate-200 dark:border-slate-900 bg-slate-950/10 rounded-xl flex flex-col items-center justify-center text-center">
                        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mb-3" />
                        <p className="text-xs text-slate-500">Checking current meteorological weather feed...</p>
                      </div>
                    ) : (
                      <>
                        <WeatherCard weather={{
                          ...weather!,
                          current: { ...weather!.current, pressure: pressureAdjusted }
                        }} />
                        {weather?.alerts && weather.alerts.length > 0 && (
                          <div className="border border-red-550/30 rounded-xl overflow-hidden bg-red-500/5">
                            <div className="bg-red-950/70 p-2 px-4 text-[10px] font-black uppercase text-red-400 flex items-center gap-1.5">
                              <AlertTriangle className="h-4 w-4 shrink-0" /> Local Hazardous Alerts Detected
                            </div>
                            <AlertCard alerts={weather.alerts} />
                          </div>
                        )}
                        <AQICard aqi={weather!.aqi} />
                      </>
                    )}
                  </div>

                  {/* Right panel: Live map & synthesized decision bullet guidelines */}
                  <div className="lg:col-span-8 space-y-6">
                    {/* Interactive tectonic maps */}
                    <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 p-2 rounded-2xl">
                      <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-1.5">
                          <Activity className="h-4 w-4 text-orange-400" />
                          <span className="text-xs font-bold uppercase text-slate-400">Global Seismic coordinates</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">{filteredEarthquakes.length} monitors active</span>
                      </div>
                      <EarthquakeMap
                        earthquakes={filteredEarthquakes}
                        selectedId={selectedEqId}
                        onSelectEarthquake={setSelectedEqId}
                        weatherCoords={{ lat: selectedCity.lat, lon: selectedCity.lon, city: selectedCity.name }}
                        theme={theme}
                      />
                    </div>

                    {/* Neural climate synthesizer panel */}
                    <div className="bg-gradient-to-tr from-indigo-50/20 via-white to-slate-100/10 dark:from-indigo-950/20 dark:via-slate-950/50 dark:to-slate-900/10 border border-indigo-200/50 dark:border-indigo-900/35 p-5 rounded-2xl shadow-sm">
                      <div className="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-900/50 mb-3.5">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4.5 w-4.5 text-indigo-500 dark:text-indigo-400" />
                          <div>
                            <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white">Neural Insights Advisor</h3>
                            <p className="text-[9px] text-indigo-400 font-mono">Expert Systems Synthesis Model</p>
                          </div>
                        </div>
                        <button
                          onClick={fetchAIInsights}
                          disabled={aiLoading || !weather}
                          className="bg-indigo-650 hover:bg-indigo-600 disabled:bg-indigo-950 text-white text-[10px] font-bold py-2 px-3 rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                          <span>Synthesize</span>
                        </button>
                      </div>

                      {aiLoading ? (
                        <p className="text-[11px] text-slate-400 italic text-center p-3 animate-pulse">Running climate telemetry correlations...</p>
                      ) : aiInsights ? (
                        <div className="space-y-3">
                          <p className="text-xs leading-relaxed italic text-slate-700 dark:text-slate-300 font-bold">"{aiInsights.summary}"</p>
                          {(aiInsights.weatherWarning || aiInsights.seismicWarning) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                              {aiInsights.weatherWarning && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-2 flex gap-1.5"><AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {aiInsights.weatherWarning}</div>}
                              {aiInsights.seismicWarning && <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg p-2 flex gap-1.5"><AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {aiInsights.seismicWarning}</div>}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-500 italic">No real-time synthesis generated yet. Press Synthesize to compile deep telemetry audits.</p>
                      )}
                    </div>

                  </div>

                </div>

              </motion.div>
            )}

            {/* 2) SEISMOLOGY TAB MONITOR */}
            {activeTab === 'seismic' && (
              <motion.div 
                key="seismic-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Modern Child Navigation sub-tabs switcher */}
                <div className="flex border-b border-slate-200 dark:border-slate-850 gap-4 mb-4" id="seismic-child-tabs">
                  <button
                    onClick={() => setSeismicSubTab('tremors')}
                    className={`pb-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                      seismicSubTab === 'tremors'
                        ? 'border-orange-500 text-slate-900 dark:text-white'
                        : 'border-transparent text-slate-400 hover:text-slate-205'
                    }`}
                  >
                    <Activity className="h-4 w-4 text-orange-500" /> Seismotectonic Tremors Stream
                  </button>
                  <button
                    onClick={() => setSeismicSubTab('tsunamis')}
                    className={`pb-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                      seismicSubTab === 'tsunamis'
                        ? 'border-blue-500 text-slate-900 dark:text-white'
                        : 'border-transparent text-slate-400 hover:text-slate-205'
                    }`}
                  >
                    <Waves className="h-4 w-4 text-blue-400 animate-pulse" /> Tsunami Surveillance & Buoys
                  </button>
                </div>

                {seismicSubTab === 'tsunamis' ? (
                  <TsunamiSurveillance earthquakes={earthquakes} theme={theme} />
                ) : (
                  <>
                    {/* Advanced map wrapper */}
                    <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 p-3 rounded-2xl shadow-sm">
                      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 mb-3 px-1">
                        <div>
                          <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white flex items-center gap-1"><Activity className="h-4.5 w-4.5 text-orange-500" /> Interactive Seismotectonic Map Viewer</h3>
                          <p className="text-[10px] text-slate-400 font-semibold">Track epicenter convergence boundaries and hypothecated depth models.</p>
                        </div>
                        {/* Time period filter */}
                        <div className="flex border border-slate-200 dark:border-slate-800 rounded-lg p-1 text-[11px] bg-slate-50 dark:bg-slate-950 font-bold">
                          {([
                            { id: 'hour', label: '1 Hour' },
                            { id: 'day', label: '24 Hour' },
                            { id: 'week', label: '7 Day' }
                          ] as any[]).map(p => (
                            <button
                              key={p.id}
                              onClick={() => setEqPeriod(p.id)}
                              className={`px-3 py-1 rounded ${eqPeriod === p.id ? 'bg-white dark:bg-slate-800 shadow text-slate-950 dark:text-white' : 'text-slate-400'}`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <EarthquakeMap
                        earthquakes={filteredEarthquakes}
                        selectedId={selectedEqId}
                        onSelectEarthquake={setSelectedEqId}
                        weatherCoords={{ lat: selectedCity.lat, lon: selectedCity.lon, city: selectedCity.name }}
                        theme={theme}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left column: Magnitude list with filters */}
                      <div className="lg:col-span-8 space-y-4">
                        <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 p-4 rounded-xl">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850 mb-3.5">
                            <span className="text-xs font-black uppercase text-slate-400">Incoming Tremors Stream ({filteredEarthquakes.length} records)</span>
                            {/* Shifter */}
                            <div className="flex items-center gap-1">
                              <ListFilter className="h-3 w-3 text-slate-400" />
                              <select
                                id="seismic-view-mag-select"
                                value={minMagnitude}
                                onChange={(e) => setMinMagnitude(Number(e.target.value))}
                                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                              >
                                <option value={0} className="bg-white dark:bg-slate-950 text-slate-900">All Magnitudes</option>
                                <option value={2.5} className="bg-white dark:bg-slate-950 text-slate-900">M2.5+ Light</option>
                                <option value={4.5} className="bg-white dark:bg-slate-950 text-slate-900">M4.5+ Strong</option>
                                <option value={6.0} className="bg-white dark:bg-slate-950 text-slate-900">M6.0+ Hazardous</option>
                              </select>
                            </div>
                          </div>

                          {eqLoading ? (
                            <div className="text-center p-12 text-slate-550 flex flex-col items-center justify-center gap-1">
                              <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
                              <p className="text-xs">Connecting USGS GeoJSON database...</p>
                            </div>
                          ) : filteredEarthquakes.length === 0 ? (
                            <p className="p-8 text-center text-xs italic text-slate-500">No tremors reported within selected timespan.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                              {filteredEarthquakes.map(eq => (
                                <EarthquakeCard
                                  key={eq.id}
                                  eq={eq}
                                  isSelected={selectedEqId === eq.id}
                                  onClick={() => setSelectedEqId(eq.id)}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right column: Detailed live deck or Global stats */}
                      <div className="lg:col-span-4">
                        {selectedEqId ? (
                          <div className="space-y-3.5">
                            <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-1 rounded-xl text-center text-[10px] font-bold">
                              <button
                                onClick={() => setSelectedEqId(null)}
                                className="flex-1 py-1.5 px-3 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
                              >
                                📊 Toggle back to Global Statistics Overview
                              </button>
                            </div>
                            <SeismicDetailDeck
                              eq={earthquakes.find((e) => e.id === selectedEqId) || null}
                              onClose={() => setSelectedEqId(null)}
                              theme={theme}
                            />
                          </div>
                        ) : (
                          <StatisticsCard earthquakes={filteredEarthquakes} />
                        )}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* 3) METEOROLOGY & FORECASTS TAB */}
            {activeTab === 'meteo' && (
              <motion.div 
                key="meteo-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Advanced Atmospheric Flow Simulation Map */}
                {weather && (
                  <MeteorologyFlowMap 
                    weather={{
                      ...weather,
                      current: {
                        ...weather.current,
                        pressure: pressureAdjusted,
                        wind_speed: speedAdjusted,
                        wind_gust: gustAdjusted,
                      }
                    }} 
                    theme={theme} 
                    wsConnected={wsConnected}
                    microShifts={microShifts}
                  />
                )}

                {/* Meteorological gauges grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Detailed summary card (span 4) */}
                  <div className="md:col-span-4 space-y-4">
                    {weatherLoading ? (
                      <p className="text-xs text-slate-500">Synching sensors...</p>
                    ) : (
                      <>
                        <WeatherCard weather={{
                          ...weather!,
                          current: { ...weather!.current, pressure: pressureAdjusted }
                        }} />
                        <AQICard aqi={weather!.aqi} />
                      </>
                    )}
                  </div>

                  {/* Wind dials and hourly forecasts trends chart (span 8) */}
                  <div className="md:col-span-8 space-y-4">
                    
                    {/* Selector Toggle */}
                    <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-205 dark:border-slate-850 p-1 rounded-xl text-xs font-bold w-fit mb-3">
                      <button 
                        id="meteo-conditions-mode-btn"
                        type="button"
                        onClick={() => setShowMeteoForecast(false)}
                        className={`py-1.5 px-4 rounded-lg cursor-pointer transition-all ${!showMeteoForecast ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-cyan-400 font-extrabold shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        📡 Current Live Monitor
                      </button>
                      <button 
                        id="meteo-forecast-mode-btn"
                        type="button"
                        onClick={() => setShowMeteoForecast(true)}
                        className={`py-1.5 px-4 rounded-lg cursor-pointer transition-all ${showMeteoForecast ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-cyan-400 font-extrabold shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        📈 24H Forecast Trends
                      </button>
                    </div>

                    <div className="relative">
                      <AnimatePresence mode="wait">
                        {!showMeteoForecast ? (
                          <motion.div
                            key="conditions-panel"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                          >
                            {weather && <WindGauge speed={speedAdjusted} deg={weather.current.wind_deg} gust={gustAdjusted} />}
                          </motion.div>
                        ) : (
                          <motion.div
                            key="forecast-panel"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                          >
                            {weather && <ForecastChart hourly={weather.hourly || []} />}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>

                </div>
              </motion.div>
            )}

            {/* 3.5) AVIATION INCIDENTS & AIRSPACE WATCH TAB */}
            {activeTab === 'airspace' && (
              <motion.div 
                key="airspace-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <AviationIncidentRadar />
              </motion.div>
            )}

            {/* 4) CRISIS SUPPLY CHAIN LOGISTICS TAB */}
            {activeTab === 'supplyChain' && (
              <motion.div 
                key="logistics-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <DisasterLogistics 
                  token={token} 
                  onDispatchTriggered={fetchCargoCount}
                />
              </motion.div>
            )}

            {/* 4.5) WARDEN DB ALERTS LEDGER CHANNEL TAB */}
            {activeTab === 'alerts' && (
              <motion.div 
                key="alerts-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <WardenAlerts 
                  alerts={alertsList}
                  isLoading={alertsLoading}
                  onRefresh={fetchAlertsLedger}
                />
              </motion.div>
            )}

            {/* 5) INTELLIGENT AI CHAT LIAISON TAB */}
            {activeTab === 'chat' && (
              <motion.div 
                key="chat-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CognitiveChat 
                  token={token}
                  userName={operator ? operator.name : 'System Guest Operator'}
                  focalCity={selectedCity.name}
                />
              </motion.div>
            )}

            {/* 6) FEDERATED GRAPH MAP TAB */}
            {activeTab === 'federation' && (
              <motion.div 
                key="federation-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <FederationStatus />
              </motion.div>
            )}

            {/* 7) JWT OPERATIONS PASSKEY LOCKSCREEN TAB */}
            {activeTab === 'terminal' && (
              <motion.div 
                key="terminal-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <OperatorTerminal 
                  token={token}
                  user={operator}
                  onAuthSuccess={handleAuthSuccess}
                  onLogout={handleLogout}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* OPERATIONS FOOTER */}
        <footer className="border-t border-slate-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/40 py-6 px-6 text-center text-slate-500 transition-colors">
          <div className="max-w-[1400px] mx-auto space-y-1">
            <p className="text-[9px] uppercase font-mono tracking-widest text-slate-600 dark:text-slate-500 font-bold">
              TerraWatch AI Operational Security Grid Terminal
            </p>
            <p className="text-[11px] leading-relaxed text-slate-450 dark:text-slate-500">
              Federated schema mesh integrates USGS Earthquake layers, OpenMeteo forecasts, and relational dispatch databases under high-load JWT operator session guards.
            </p>
          </div>
        </footer>

      </div>

    </div>
  );
}
