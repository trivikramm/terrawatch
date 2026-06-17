/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as L from 'leaflet';
import {
  Waves,
  Radio,
  Compass,
  AlertOctagon,
  Volume2,
  VolumeX,
  Database,
  Map,
  Activity,
  BellRing,
  Gauge,
  Zap,
  TrendingUp,
  RefreshCw,
  Clock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Earthquake } from '../types';

interface TsunamiSurveillanceProps {
  earthquakes: Earthquake[];
  theme?: 'light' | 'dark';
}

interface BuoySensor {
  id: string;
  name: string;
  lat: number;
  lon: number;
  status: 'NOMINAL' | 'ALERT' | 'STANDBY';
  seaLevelBase: number; // Base depth in meters
  currentReading: number; // Real-time reading
  distanceKm: number;
  etaMinutes: number;
}

export default function TsunamiSurveillance({ earthquakes, theme = 'dark' }: TsunamiSurveillanceProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [activeStyle, setActiveStyle] = useState<string>('dark');
  const [sirenActive, setSirenActive] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(true);

  // Filter actual catalog events with tsunami warnings
  const potentialCatalogThreats = earthquakes.filter(eq => eq.tsunami === 1);

  // Active event state (Real or Simulated)
  const [activeThreat, setActiveThreat] = useState<{
    id: string;
    place: string;
    magnitude: number;
    depth: number;
    latitude: number;
    longitude: number;
    isSimulated: boolean;
    timestamp: number;
  } | null>(null);

  // Buoy sensors list state with live simulated telemetry
  const [buoys, setBuoys] = useState<BuoySensor[]>([
    { id: 'DART-46404', name: 'Pacific Northwest Margin', lat: 45.85, lon: -128.82, status: 'NOMINAL', seaLevelBase: 2450.45, currentReading: 2450.45, distanceKm: 420, etaMinutes: 35 },
    { id: 'DART-21415', name: 'Japan Trench Outer Rise', lat: 38.50, lon: 145.20, status: 'NOMINAL', seaLevelBase: 5120.32, currentReading: 5120.32, distanceKm: 650, etaMinutes: 52 },
    { id: 'DART-51425', name: 'Hawaii Trench Sector', lat: 20.30, lon: -155.10, status: 'NOMINAL', seaLevelBase: 4180.15, currentReading: 4180.15, distanceKm: 1200, etaMinutes: 95 },
    { id: 'DART-32411', name: 'South America Chile Subduction', lat: -21.40, lon: -72.60, status: 'NOMINAL', seaLevelBase: 3870.90, currentReading: 3870.90, distanceKm: 880, etaMinutes: 70 },
    { id: 'DART-53046', name: 'South Java Subduction', lat: -9.50, lon: 115.30, status: 'NOMINAL', seaLevelBase: 4420.25, currentReading: 4420.25, distanceKm: 510, etaMinutes: 44 }
  ]);

  const [selectedBuoyId, setSelectedBuoyId] = useState<string>('DART-46404');
  const [buoyHistory, setBuoyHistory] = useState<number[]>(Array(50).fill(0));
  const [currentEbbActive, setCurrentEbbActive] = useState<boolean>(false);
  const [currentWaveHeight, setCurrentWaveHeight] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [simulatedSource, setSimulatedSource] = useState<boolean>(false);

  // Checklist of response guidelines for operational warden
  const [checklist, setChecklist] = useState([
    { id: 'alert', text: 'Issue Global Sea-Level Anomaly Flash warning to WMO and regional coastal authorities', done: false },
    { id: 'dart', text: 'Poll high-frequency DART-II / NOAA satellite oceanic telemetry arrays', done: false },
    { id: 'siren', text: 'Activate coastal evacuation sirens and cellular broadcast sirens in Threat Sector', done: false },
    { id: 'harbor', text: 'Instruct commercial maritime vessels to move to deep oceanic security zone (>150m)', done: false },
    { id: 'coordination', text: 'Establish real-time emergency disaster relay with civil defense command', done: false }
  ]);

  const pushLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
  };

  useEffect(() => {
    pushLog("System initialized. Monitoring deep-ocean wave pressure arrays (DART-II).");
  }, []);

  // Update real-time water heights for chosen buoy
  useEffect(() => {
    const interval = setInterval(() => {
      // Periodic ocean swell noise (-3cm to +3cm)
      const noise = (Math.random() - 0.5) * 0.06;

      setBuoys(prevBuoys =>
        prevBuoys.map(b => {
          let updatedReading = b.seaLevelBase + noise;
          let status = b.status;

          if (activeThreat) {
            const latDiff = Math.abs(b.lat - activeThreat.latitude);
            const lonDiff = Math.abs(b.lon - activeThreat.longitude);
            const degreeDistance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);

            // Trigger an anomaly if threat is close to the sensor
            if (degreeDistance < 25) {
              status = 'ALERT';
              const secondsSinceThreat = (Date.now() - activeThreat.timestamp) / 1000;
              
              // Ebb wave period (secs 3 - 12): water drops by several meters
              if (secondsSinceThreat > 3 && secondsSinceThreat <= 15) {
                const depFactor = Math.sin((secondsSinceThreat - 3) * Math.PI / 12);
                updatedReading = b.seaLevelBase - (6.42 * depFactor);
                if (b.id === selectedBuoyId) {
                  setCurrentEbbActive(true);
                  setCurrentWaveHeight(-6.42 * depFactor);
                }
              } 
              // Peak wave strike period (secs 15 - 32): water columns surge in huge waves
              else if (secondsSinceThreat > 15 && secondsSinceThreat <= 38) {
                const ampFactor = Math.sin((secondsSinceThreat - 15) * Math.PI / 23);
                updatedReading = b.seaLevelBase + (8.54 * ampFactor);
                if (b.id === selectedBuoyId) {
                  setCurrentEbbActive(false);
                  setCurrentWaveHeight(8.54 * ampFactor);
                }
              } else {
                // Return to normal standby / high-water trace
                updatedReading = b.seaLevelBase + (noise * 2);
                if (b.id === selectedBuoyId) {
                  setCurrentEbbActive(false);
                  setCurrentWaveHeight(0);
                }
              }
            }
          } else {
            status = 'NOMINAL';
            if (b.id === selectedBuoyId) {
              setCurrentEbbActive(false);
              setCurrentWaveHeight(0);
            }
          }

          return {
            ...b,
            status,
            currentReading: Number(updatedReading.toFixed(3))
          };
        })
      );
    }, 600);

    return () => clearInterval(interval);
  }, [activeThreat, selectedBuoyId]);

  // Maintain buoy history tick for beautiful charting
  useEffect(() => {
    const curr = buoys.find(b => b.id === selectedBuoyId);
    if (!curr) return;
    const offset = curr.currentReading - curr.seaLevelBase;

    setBuoyHistory(prev => {
      const next = [...prev.slice(1), offset];
      return next;
    });
  }, [buoys, selectedBuoyId]);

  // Leaflet map setup with dynamic wave front generation
  const mapStyleUrls: { [key: string]: string } = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    terrain: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  };

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (err) {
        console.error('Failed to remove map:', err);
      }
      mapInstanceRef.current = null;
    }

    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }
    container.innerHTML = '';

    try {
      const map = L.map(container, {
        center: activeThreat ? [activeThreat.latitude, activeThreat.longitude] : [15, 140],
        zoom: 3,
        zoomControl: true,
        attributionControl: false,
      });

      const url = mapStyleUrls[activeStyle] || mapStyleUrls.dark;
      L.tileLayer(url).addTo(map);

      mapInstanceRef.current = map;
      setMapError(null);
    } catch (err) {
      console.error(err);
      setMapError('Failed to load ocean cartography components.');
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (err) {}
        mapInstanceRef.current = null;
      }
    };
  }, [activeStyle]);

  // Update map layer markings (tsunami epicenter and concentric propagating front waves)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear dynamic sub-layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Circle || layer instanceof L.Marker) {
        if (!(layer instanceof L.TileLayer)) {
          map.removeLayer(layer);
        }
      }
    });

    // 1. Draw DART Buoys on the map
    buoys.forEach((b) => {
      let buoyColor = '#22C55E'; // green
      let markerPulseBg = 'bg-green-500/30';
      if (b.status === 'ALERT') {
        buoyColor = '#EF4444'; // red
        markerPulseBg = 'bg-red-500/40 animate-ping';
      }

      const buoyIcon = L.divIcon({
        className: `custom-buoy-marker-${b.id}`,
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute h-8 w-8 rounded-full ${markerPulseBg}"></div>
            <div class="h-4.5 w-4.5 rounded-full border-2 border-slate-900 shadow-md flex items-center justify-center" style="background-color: ${buoyColor}">
              <span class="text-[7px] text-slate-950 font-black">B</span>
            </div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const clickHandler = () => {
        setSelectedBuoyId(b.id);
        pushLog(`Diagnostic hook set to Deep-Ocean Transponder: ${b.id}`);
      };

      L.marker([b.lat, b.lon], { icon: buoyIcon })
        .addTo(map)
        .on('click', clickHandler)
        .bindPopup(`
          <div class="font-sans text-xs bg-slate-950 text-white p-2.5 border border-slate-800 rounded min-w-[180px]">
            <p class="font-bold text-cyan-400 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full ${b.status === 'ALERT' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}"></span>
              ${b.id} Sensor Array
            </p>
            <p class="text-[9px] font-mono mt-1 text-slate-400">${b.name}</p>
            <div class="h-px bg-slate-800 my-1.5"></div>
            <p class="text-[10px] font-mono text-slate-300">Base level: ${b.seaLevelBase} m</p>
            <p class="text-[10px] font-mono text-slate-200 mt-0.5">Real-time level: ${b.currentReading} m</p>
            <p class="text-[9px] font-sans font-bold text-amber-400 mt-1">EPICENTER ETA: ${b.etaMinutes} mins</p>
          </div>
        `);
    });

    // 2. Draw Active Tsunamigenic Epicenter and Propagating Ocean Wavefronts
    if (activeThreat) {
      // Epicenter Pulsing Crosshair Marker
      const epicenterIcon = L.divIcon({
        className: 'custom-epicenter-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute h-16 w-16 rounded-full border-4 border-red-500/20 animate-ping opacity-60"></div>
            <div class="absolute h-8 w-8 rounded-full border border-red-500/35 animate-ping" style="animation-duration: 2.2s;"></div>
            <div class="h-5 w-5 bg-red-650 text-white rounded border-2 border-white flex items-center justify-center font-serif text-[10px] font-black shadow-lg">⚠️</div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker([activeThreat.latitude, activeThreat.longitude], { icon: epicenterIcon })
        .addTo(map)
        .bindPopup(`
          <div class="font-sans text-xs bg-slate-150 p-2.5 rounded text-slate-900 border border-slate-200">
            <p class="font-black text-red-600 uppercase tracking-wider text-[9px]">UPLIFT EPICENTER HAZARD</p>
            <p class="font-extrabold mt-1 text-xs text-slate-850">${activeThreat.place}</p>
            <p class="font-mono text-[9px] mt-0.5 text-slate-500">Source: M${activeThreat.magnitude} Earthquake</p>
            <p class="font-sans text-[10px] text-blue-600 font-bold mt-1">Concentric Sea Wave Speed: ~720 km/h</p>
          </div>
        `);

      // Dynamic Propagating Concentric Circles Loops
      let circleRadius = 50000; // Start at 50 km radius
      const maxRadius = 1500000; // 1500 km maximum wave expanse

      const propagateWave = () => {
        circleRadius += 6500; // Propagate at simulated rate
        if (circleRadius > maxRadius) {
          circleRadius = 50000; // Loop wave pulse
        }

        // Wipe old wavefront circle marks
        map.eachLayer((layer) => {
          if (layer instanceof L.Circle && layer.options.className === 'propagation-frontier') {
            map.removeLayer(layer);
          }
        });

        // First outer wavefront limit
        L.circle([activeThreat.latitude, activeThreat.longitude], {
          radius: circleRadius,
          color: '#3B82F6',
          weight: 2.5,
          opacity: 0.65 - (circleRadius / maxRadius),
          fillColor: '#60A5FA',
          fillOpacity: 0.08 - (circleRadius / (maxRadius * 1.5)),
          className: 'propagation-frontier'
        }).addTo(map);

        // Second interior secondary wavefront
        if (circleRadius > 350000) {
          L.circle([activeThreat.latitude, activeThreat.longitude], {
            radius: circleRadius - 300000,
            color: '#1D4ED8',
            weight: 1.5,
            opacity: 0.45 - ((circleRadius - 300000) / maxRadius),
            fillColor: '#93C5FD',
            fillOpacity: 0.04,
            className: 'propagation-frontier'
          }).addTo(map);
        }
      };

      const waveInterval = setInterval(propagateWave, 100);
      return () => clearInterval(waveInterval);
    }
  }, [activeThreat, buoys, activeStyle]);

  // Handle simulated uplift hazard button
  const triggerSimuplift = () => {
    const randomPlaces = [
      { place: "Solomon Islands Trench Subduction Block", lat: -10.60, lon: 161.20, mag: 8.2, depth: 15 },
      { place: "Kuril-Kamchatka Trench Convergence Segment", lat: 46.20, lon: 153.50, mag: 7.9, depth: 18 },
      { place: "Ryukyu Arc Outer Boundary", lat: 26.50, lon: 128.90, mag: 7.6, depth: 10 },
      { place: "Aleutian Subduction Arc Sector", lat: 51.52, lon: -175.30, mag: 8.4, depth: 12 }
    ];

    const chosen = randomPlaces[Math.floor(Math.random() * randomPlaces.length)];
    const threatObj = {
      id: `sim_uplift_${Date.now()}`,
      place: chosen.place,
      magnitude: chosen.mag,
      depth: chosen.depth,
      latitude: chosen.lat,
      longitude: chosen.lon,
      isSimulated: true,
      timestamp: Date.now()
    };

    setActiveThreat(threatObj);
    setSirenActive(true);
    setSimulatedSource(true);
    
    // Automatically switch to the closest buoy sensor in simulated region
    if (chosen.lon > 100 && chosen.lon < 170) {
      setSelectedBuoyId('DART-21415'); // Japan trench buoy
    } else if (chosen.lon < -100) {
      setSelectedBuoyId('DART-46404'); // PNW buoy
    }

    pushLog(`🔴 TSUNAMIGENIC SEISMIC EVENT DETECTED: M${chosen.mag} striking at latitude ${chosen.lat}, longitude ${chosen.lon}. Potential wave displacement warning broadcast and sirens engaged!`);
  };

  // Select an actual earthquake from our real catalog prop
  const triggerRealTsunamiThreat = (eq: Earthquake) => {
    const threatObj = {
      id: eq.id,
      place: eq.place,
      magnitude: eq.magnitude,
      depth: eq.depth,
      latitude: eq.latitude,
      longitude: eq.longitude,
      isSimulated: false,
      timestamp: Date.now()
    };

    setActiveThreat(threatObj);
    setSirenActive(true);
    setSimulatedSource(false);
    pushLog(`🔴 REAL EARTHQUAKE UPLIFT: M${eq.magnitude.toFixed(1)} verified in ${eq.place} with TSUNAMI threat flag. Synchronizing sea pressure transponders.`);
    
    // Auto-focus map if possible
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([eq.latitude, eq.longitude], 4, { animate: true });
    }
  };

  const clearThreat = () => {
    setActiveThreat(null);
    setSirenActive(false);
    setSimulatedSource(false);
    pushLog("Active tsunami warning cycle cancelled. Recalibrating sensors to nominal standby telemetry.");
  };

  // Toggle state checklists
  const toggleCheck = (idx: number) => {
    setChecklist(prev =>
      prev.map((item, i) => (i === idx ? { ...item, done: !item.done } : item))
    );
  };

  const activeSensAlertCount = buoys.filter(b => b.status === 'ALERT').length;

  return (
    <div className="space-y-6">
      {/* 1. Header with Status Ribbon */}
      <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
            <Waves className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase text-slate-100 flex items-center gap-1.5 font-sans">
              Oceanic Tsunami Warnings & Surveillance Center
              {sirenActive && (
                <span className="bg-red-500 text-xs text-white px-2.5 py-0.5 rounded-full font-black animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                  FLASH ALERT ACTIVE
                </span>
              )}
            </h2>
            <p className="text-[10px] text-slate-400 font-semibold font-sans mt-0.5">
              Deep sea displacement sensing array powered by NOAA-DART protocol, providing real-time sea pressure charts.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {sirenActive && (
            <button
              onClick={clearThreat}
              className="px-3.5 py-1.5 rounded-xl border border-red-500/30 bg-red-950/40 text-red-400 font-bold text-[10px] uppercase cursor-pointer hover:bg-red-900/15 hover:border-red-500/50 transition-all"
            >
              Reset/Clear Warning System
            </button>
          )}

          <button
            onClick={triggerSimuplift}
            className="flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-blue-650 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white font-bold text-[10px] uppercase tracking-wide rounded-xl shadow-lg transition-all"
          >
            <Zap className="h-3 w-3 animate-bounce" /> Simulate Tsunamigenic Uplift
          </button>
        </div>
      </div>

      {/* Warning banner simulation is active */}
      <AnimatePresence>
        {sirenActive && activeThreat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-950/40 border border-red-500/30 rounded-2xl p-4 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4"
          >
            {/* Ambient Red Glow in background */}
            <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none"></div>

            <div className="flex items-start gap-3.5 z-10">
              <span className="p-3 bg-red-500/20 rounded-xl text-red-500 border border-red-500/40 animate-bounce">
                <AlertOctagon className="h-6 w-6" />
              </span>
              <div>
                <span className="text-[9px] uppercase font-black tracking-widest text-red-400">Threat Sector Bulletin</span>
                <h4 className="text-sm font-extrabold text-white mt-0.5">{activeThreat.place} (M{activeThreat.magnitude})</h4>
                <p className="text-[10px] text-slate-300 font-medium max-w-[550px] leading-relaxed mt-1">
                  Abrupt sea level displacement telemetry and seabed thrust anomalies detected. DART sensors are streaming warning parameters. Wave propagation eta at designated coastlines is current.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 z-10 shrink-0">
              <div className="text-right">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Threat Status</span>
                <span className="text-[#fca5a5] font-black text-xs block uppercase">CRITICAL WARNING</span>
              </div>
              <div className="h-8 w-px bg-slate-800 mx-2"></div>
              {muted ? (
                <button onClick={() => setMuted(false)} className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl">
                  <VolumeX className="h-4.5 w-4.5" />
                </button>
              ) : (
                <button onClick={() => setMuted(true)} className="p-2.5 bg-red-500/20 border border-red-500/40 text-red-400 rounded-xl animate-pulse">
                  <Volume2 className="h-4.5 w-4.5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Map & Buoy Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Map with Propagating rings */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 rounded-2xl shadow-sm p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Map className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                  Oceanic Tectonic Wavefront Map
                </span>
              </div>
              
              <div className="flex items-center gap-1.5">
                {(['dark', 'satellite', 'terrain'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => setActiveStyle(style)}
                    className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg border transition-all ${
                      activeStyle === style
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Leaflet Container */}
            <div className="relative w-full h-[360px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950">
              <div ref={mapContainerRef} className="w-full h-full z-15" />
              {mapError && (
                <p className="absolute inset-0 flex items-center justify-center bg-slate-950 text-xs text-slate-500">{mapError}</p>
              )}

              {/* Map floating status hud */}
              <div className="absolute top-4 right-4 z-20 bg-slate-950/80 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl text-[10px] flex flex-col gap-1 min-w-[130px] shadow-2xl pointer-events-none">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider pb-1.5 mb-1.5 border-b border-slate-900">Map Legend</span>
                <span className="flex items-center gap-1.5 font-bold text-green-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block border border-slate-900"></span> Nominal Buoy
                </span>
                {activeSensAlertCount > 0 && (
                  <span className="flex items-center gap-1.5 font-bold text-red-400 animate-pulse">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block border border-slate-900"></span> Sensor Displacement
                  </span>
                )}
                <span className="flex items-center gap-1.5 font-bold text-blue-400">
                  <span className="h-2.5 w-2.5 rounded bg-blue-500 inline-block border border-slate-900"></span> Tsunami Wave Expanse
                </span>
              </div>
            </div>
          </div>

          {/* DART-II Transponder Sensor Grid */}
          <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 rounded-2xl p-4 shadow-sm">
            <div className="pb-3 border-b border-slate-150 dark:border-slate-850 mb-3.5 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-400 block font-sans">
                NOAA DART-II Sensor Status Grid ({buoys.length} assets online)
              </span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold flex items-center gap-1">
                <Compass className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '6s' }} /> Pacific Tide Ring Bounds
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3.5">
              {buoys.map((b) => {
                const isActive = b.id === selectedBuoyId;
                const isAlert = b.status === 'ALERT';
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBuoyId(b.id)}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all outline-none ${
                      isActive
                        ? 'bg-blue-550/15 border-blue-500/50 text-white shadow-md shadow-blue-500/5'
                        : isAlert
                          ? 'bg-red-500/10 border-red-500/30 text-rose-300 hover:border-red-500/50'
                          : 'bg-slate-900/40 hover:bg-slate-900 border-slate-850 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-mono font-black">{b.id}</span>
                      <span className={`h-2 w-2 rounded-full ${
                        isAlert ? 'bg-red-500 animate-ping' : b.status === 'STANDBY' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold block text-slate-400 truncate max-w-[120px]">{b.name}</span>
                      <span className="text-[11px] font-mono font-extrabold text-blue-400 mt-1 block">
                        {b.currentReading.toFixed(2)} m
                      </span>
                    </div>
                    <div className="flex items-center justify-between w-full font-mono text-[8px] text-slate-500/95 mt-1 border-t border-slate-850 pt-1">
                      <span>{b.distanceKm} km</span>
                      <span>ETA: {b.etaMinutes}m</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Graph telemetry detail pane & Checklists */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Real-time Ticking graph of ocean water levels */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl shadow-xl p-4 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] uppercase font-black text-blue-400 tracking-wider font-mono">Telemetry Anomaly Analysis</span>
                <h3 className="text-xs font-black text-slate-100 flex items-center gap-1 font-sans mt-0.5">
                  <Activity className="h-4.5 w-4.5 text-blue-500" />
                  Buoy {selectedBuoyId} Flow Tracker
                </h3>
              </div>
              <div className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                100Hz Refresh Buffer
              </div>
            </div>

            {/* Custom SVG Ocean level graph with real-time dynamic shifts */}
            <div className="bg-slate-950/80 rounded-xl border border-slate-900 h-[155px] p-2.5 relative flex flex-col justify-between overflow-hidden">
              {/* Grid Lines in background */}
              <div className="absolute inset-0 grid grid-cols-5 grid-rows-4 pointer-events-none opacity-25">
                {Array(20).fill(0).map((_, i) => (
                  <div key={i} className="border-b border-r border-slate-800"></div>
                ))}
              </div>

              {/* Tide Wave rendering */}
              <div className="w-full h-[110px] relative z-10">
                <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                  {/* Baseline path */}
                  <line x1="0" y1="50" x2="300" y2="50" stroke="#1E293B" strokeWidth="1.5" strokeDasharray="3,3" />

                  {/* Ocean wave graph path */}
                  <path
                    d={`M ${
                      buoyHistory
                        .map((val, idx) => {
                          // scale value: base wave fluctuation from 50 (center line)
                          const x = (idx / (buoyHistory.length - 1)) * 300;
                          const y = 50 - (val * 4); // magnify wave depth for visualization
                          return `${x} ${y}`;
                        })
                        .join(' L ')
                    }`}
                    fill="none"
                    stroke={currentEbbActive ? '#EC4899' : currentWaveHeight > 2.0 ? '#EF4444' : '#3B82F6'}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />

                  {/* Area fill path under wave */}
                  <path
                    d={`M 0 100 L ${
                      buoyHistory
                        .map((val, idx) => {
                          const x = (idx / (buoyHistory.length - 1)) * 300;
                          const y = 50 - (val * 4);
                          return `${x} ${y}`;
                        })
                        .join(' L ')
                    } L 300 100 Z`}
                    fill={currentEbbActive ? 'url(#glow-ebb-grad)' : currentWaveHeight > 2.0 ? 'url(#glow-tsunami-grad)' : 'url(#glow-swim-grad)'}
                    className="opacity-15 transition-all duration-300"
                  />

                  {/* Declared gradients */}
                  <defs>
                    <linearGradient id="glow-swim-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="glow-ebb-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EC4899" />
                      <stop offset="100%" stopColor="#DB2777" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="glow-tsunami-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="100%" stopColor="#B91C1C" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Blinking signal dot on end of graph line */}
                <div
                  className="absolute h-3 w-3 rounded-full border border-white flex items-center justify-center animate-pulse shadow-md z-30 transition-all duration-300"
                  style={{
                    right: 0,
                    top: `calc(${50 - ((buoyHistory[buoyHistory.length - 1] || 0) * 4)}% - 6px)`,
                    backgroundColor: currentEbbActive ? '#EC4899' : currentWaveHeight > 2.0 ? '#EF4444' : '#3B82F6'
                  }}
                >
                  <span className="h-1 w-1 rounded-full bg-white"></span>
                </div>
              </div>

              {/* Legend with numerical value displacement */}
              <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-900 z-10 text-[10px] font-sans">
                <span className="text-slate-500 font-mono">Displacement Meter Range</span>
                <span className={`font-black font-mono flex items-center gap-1 ${
                  currentEbbActive ? 'text-pink-400' : currentWaveHeight > 2.0 ? 'text-red-400' : 'text-blue-400'
                }`}>
                  <TrendingUp className="h-3 w-3" />
                  {currentWaveHeight === 0 ? '±0.00' : currentWaveHeight > 0 ? `+${currentWaveHeight.toFixed(2)}` : currentWaveHeight.toFixed(2)} m
                </span>
              </div>
            </div>

            {/* Simulated tidal forecast analysis */}
            <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-850 text-[10px] space-y-2">
              <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 block">Active Buoy Attributes</span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono leading-relaxed text-slate-300">
                <div>
                  <p className="text-slate-500 text-[9px] uppercase">Base ocean floor</p>
                  <p className="font-bold">{buoys.find(b => b.id === selectedBuoyId)?.seaLevelBase} meters</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[9px] uppercase">Sampling rates</p>
                  <p className="font-bold">1 sample / 4 seconds</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[9px] uppercase">Sensor Coordinates</p>
                  <p className="font-bold">
                    Lat: {buoys.find(b => b.id === selectedBuoyId)?.lat.toFixed(2)}° N / Lon: {buoys.find(b => b.id === selectedBuoyId)?.lon.toFixed(2)}° W
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-[9px] uppercase">Acoustic Signal Signal Strength</p>
                  <p className="font-bold text-green-400">98.4% (EXCELLENT)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Catalog Tsunamigenic Earthquakes List */}
          {potentialCatalogThreats.length > 0 && (
            <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 rounded-2xl p-4 shadow-sm">
              <span className="text-xs font-black uppercase text-slate-400 block pb-2.5 border-b border-slate-100 dark:border-slate-850 mb-3 font-sans">
                Tsunamigenic Catalog Quakes ({potentialCatalogThreats.length} verified events)
              </span>
              <p className="text-[10px] text-slate-400 leading-normal pb-3 font-sans">
                Click on any seismic uplift catalog record below to synchronize warning vectors on the sea level chart:
              </p>

              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {potentialCatalogThreats.map((eq) => {
                  const isCurrentTarget = activeThreat?.id === eq.id;
                  return (
                    <button
                      key={eq.id}
                      onClick={() => triggerRealTsunamiThreat(eq)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all outline-none ${
                        isCurrentTarget
                          ? 'bg-red-500/10 border-red-500/55 dark:border-red-500/50'
                          : 'bg-slate-900/40 hover:bg-slate-900 border-slate-850 hover:border-slate-800'
                      }`}
                    >
                      <div className="h-6 w-6 rounded-lg bg-red-105 flex items-center justify-center font-bold font-mono text-[9px] text-red-400 border border-red-500/20 shrink-0">
                        {eq.magnitude.toFixed(1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-200 truncate leading-normal">{eq.place}</p>
                        <p className="font-mono text-[8px] text-slate-400 mt-0.5">Depth: {eq.depth} km | Time: {new Date(eq.time).toLocaleTimeString()}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interactive Response Checklist Card */}
          <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-black uppercase text-slate-400 block pb-2 border-b border-slate-100 dark:border-slate-800 mb-3.5 font-sans">
              Warden Coastal Protection Protocol
            </span>
            <div className="space-y-2.5">
              {checklist.map((item, idx) => (
                <label
                  key={item.id}
                  onClick={() => toggleCheck(idx)}
                  className={`w-full flex items-start gap-2.5 p-2 rounded-xl border cursor-pointer select-none transition-all ${
                    item.done
                      ? 'bg-emerald-500/5 border-emerald-500/30 text-slate-400 dark:text-slate-400'
                      : 'bg-slate-900/20 border-slate-850 hover:border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {item.done ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-500/10" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-slate-700 bg-slate-950"></div>
                    )}
                  </div>
                  <span className="text-[9.5px] font-semibold leading-snug">{item.text}</span>
                </label>
              ))}
            </div>

            <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-2.5 mt-4 flex items-center justify-between text-[9px] uppercase font-bold font-mono">
              <span className="text-slate-500">Task Completion Rate</span>
              <span className="text-emerald-400 font-extrabold text-[10px]">
                {checklist.filter(c => c.done).length} / {checklist.length} ({Math.round((checklist.filter(c => c.done).length / checklist.length) * 100)}%)
              </span>
            </div>
          </div>

          {/* Event log activity stack */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 shadow-xl flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-900">
              <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Surveillance Telemetry Stack</span>
              <button onClick={() => setLogs([])} className="text-[9px] font-bold text-slate-400 hover:text-white uppercase">Clear Logs</button>
            </div>
            
            <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <p className="text-[9px] italic text-slate-600 p-2 text-center">Logs empty. Ready for transmission...</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="text-[9px] font-mono text-slate-300 leading-snug break-words border-l border-slate-850 pl-1.5">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
