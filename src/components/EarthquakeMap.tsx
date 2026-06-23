/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Earthquake } from '../types';
import { MapPin, AlertTriangle, HelpCircle, Layers } from 'lucide-react';

interface EarthquakeMapProps {
  earthquakes: Earthquake[];
  selectedId: string | null;
  onSelectEarthquake: (id: string | null) => void;
  weatherCoords: { lat: number; lon: number; city: string };
  theme?: 'light' | 'dark';
}

const MAP_STYLES = [
  { id: 'hybrid', label: '🛰️ Satellite Hybrid', url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', desc: 'Google Satellite with overlays and borders' },
  { id: 'satellite', label: '🌍 Pure Satellite', url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', desc: 'Google Orbit high-contrast raw imagery' },
  { id: 'terrain', label: '🏔️ Google Terrain', url: 'https://mt1.google.com/vt/lyrs=t,r&x={x}&y={y}&z={z}', desc: 'Physical relief, trees and contour elevations' },
  { id: 'topo', label: '🗺️ OpenTopo', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', desc: 'Symmetrical elevation and topography lines' },
  { id: 'dark', label: '🌌 Cyber Dark', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', desc: 'Enterprise operator dark aesthetic' },
  { id: 'voyager', label: '📊 Vector Light', url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', desc: 'Premium flat clean light schematic' }
] as const;

export default function EarthquakeMap({
  earthquakes,
  selectedId,
  onSelectEarthquake,
  weatherCoords,
  theme = 'dark',
}: EarthquakeMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.CircleMarker }>({});
  const weatherMarkerRef = useRef<L.Marker | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [activeStyle, setActiveStyle] = useState<string>('hybrid'); // Default is hyper-detailed Hybrid Satellite View
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true); // Enabled by default for rich visual presentation
  const [heatScriptLoaded, setHeatScriptLoaded] = useState(false);
  const heatLayerRef = useRef<any>(null);

  // Programmatically hook up Leaflet's CSS to ensure it displays elegantly inside our iframe
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

  // Programmatically import Leaflet Heat library to handle seismic epicenter overlays
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).L = L;
    }

    const scriptId = 'leaflet-heat-js';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js';
      script.crossOrigin = 'anonymous';
      script.async = true;
      script.onload = () => {
        setHeatScriptLoaded(true);
      };
      document.body.appendChild(script);
    } else {
      if ((L as any).heatLayer) {
        setHeatScriptLoaded(true);
      } else {
        const handleScriptLoad = () => setHeatScriptLoaded(true);
        script.addEventListener('load', handleScriptLoad);
        return () => {
          script.removeEventListener('load', handleScriptLoad);
        };
      }
    }
  }, []);

  // Sync and render/update the toggleable Epicenter Heatmap layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (heatLayerRef.current) {
      try {
        map.removeLayer(heatLayerRef.current);
      } catch (err) {
        console.error('Failed to remove heatmap layer:', err);
      }
      heatLayerRef.current = null;
    }

    if (!showHeatmap || !heatScriptLoaded) return;

    try {
      if ((L as any).heatLayer) {
        // Map earthquakes to points in [latitude, longitude, intensity]
        const points = earthquakes.map((eq) => [
          eq.latitude,
          eq.longitude,
          eq.magnitude / 6.0, // Scale intensities so strong earthquakes/epicenters are clearly highlighted
        ]);

        const heatLayer = (L as any).heatLayer(points, {
          radius: 38,
          blur: 18,
          maxZoom: 12,
          max: 1.2,
          gradient: {
            0.15: 'blue',
            0.35: 'cyan',
            0.55: 'lime',
            0.75: 'yellow',
            1.0: 'red',
          },
        }).addTo(map);

        heatLayerRef.current = heatLayer;
      }
    } catch (err) {
      console.error('Error drawing toggleable Leaflet seismic heatmap:', err);
    }
  }, [earthquakes, showHeatmap, heatScriptLoaded, activeStyle, weatherCoords.lat, weatherCoords.lon]);

  // Initialize Map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Reset container if map already exists
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (err) {
        console.error('Failed to remove map instance on change:', err);
      }
      mapInstanceRef.current = null;
    }

    // Completely reset container DOM state and delete Leaflet tracking ID
    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }
    container.innerHTML = '';

    try {
      // Set default position near the selected weather location coords
      const initialLat = weatherCoords.lat || 12.9716;
      const initialLon = weatherCoords.lon || 77.5946;

      const map = L.map(container, {
        center: [initialLat, initialLon],
        zoom: 3,
        zoomControl: true,
        attributionControl: false,
      });

      // Find selected style URL
      const styleConfig = MAP_STYLES.find((s) => s.id === activeStyle) || MAP_STYLES[0];
      
      const tileOptions: L.TileLayerOptions = {
        maxZoom: 19,
      };
      if (activeStyle === 'topo') {
        tileOptions.subdomains = 'abc';
      }

      L.tileLayer(styleConfig.url, tileOptions).addTo(map);

      mapInstanceRef.current = map;
      setMapError(null);
    } catch (err) {
      console.error('Leaflet initialization error:', err);
      setMapError('Failed to load map container elements.');
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (err) {
          console.error('Failed to remove map instance on unmount:', err);
        }
        mapInstanceRef.current = null;
      }
    };
  }, [weatherCoords.lat, weatherCoords.lon, activeStyle]); // Re-initialize map robustly if style or coordinates change!

  // Update Weather focal point marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (weatherMarkerRef.current) {
      map.removeLayer(weatherMarkerRef.current);
    }

    try {
      // Create custom div icon for current meteorological tracking point
      const customIcon = L.divIcon({
        className: 'custom-weather-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute h-8 w-8 animate-ping bg-cyan-405 opacity-45 rounded-full"></div>
            <div class="h-4 w-4 bg-cyan-500 rounded-full border-2 border-slate-900 shadow-md"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const weatherMarker = L.marker([weatherCoords.lat, weatherCoords.lon], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div class="font-sans text-xs bg-slate-950 text-white p-2 border border-slate-800 rounded min-w-[140px]">
            <p class="font-bold text-cyan-400 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              Focal Weather Station
            </p>
            <p class="mt-1 font-mono text-[10px] text-slate-300">${weatherCoords.city}</p>
            <p class="font-mono text-[9px] text-slate-400">Lat: ${weatherCoords.lat.toFixed(2)} / Lon: ${weatherCoords.lon.toFixed(2)}</p>
          </div>
        `, { className: 'custom-popup-box' });

      weatherMarkerRef.current = weatherMarker;
    } catch (err) {
      console.error('Weather icon placement error:', err);
    }
  }, [weatherCoords, mapInstanceRef.current]);

  // Update Earthquake markers whenever list changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
    markersRef.current = {};

    earthquakes.forEach((eq) => {
      // Color categories based on Magnitude:
      // Green (0-2), Yellow (2-4), Orange (4-6), Red (6+)
      let markerColor = '#10B981'; // Green (0-2)
      let markerRadius = 5;
      
      if (eq.magnitude >= 6.0) {
        markerColor = '#EF4444'; // Red (6+)
        markerRadius = 14;
      } else if (eq.magnitude >= 4.0) {
        markerColor = '#F97316'; // Orange (4-6)
        markerRadius = 10;
      } else if (eq.magnitude >= 2.0) {
        markerColor = '#EAB308'; // Yellow (2-4)
        markerRadius = 7;
      }

      const circle = L.circleMarker([eq.latitude, eq.longitude], {
        radius: markerRadius,
        fillColor: markerColor,
        color: eq.tsunami === 1 ? '#3B82F6' : '#FFFFFF', // White borders look much more modern on satelite imagery vs dark background!
        weight: eq.tsunami === 1 ? 3 : 1.5,
        opacity: 0.95,
        fillOpacity: 0.75,
      })
        .addTo(map)
        .bindPopup(`
          <div class="font-sans text-xs bg-slate-950 text-slate-100 p-2 border border-slate-800 rounded min-w-[200px]">
            <div class="flex items-center justify-between pb-1 border-b border-slate-800 mb-1.5">
              <span class="font-bold text-sm" style="color: ${markerColor}">M ${eq.magnitude.toFixed(1)}</span>
              <span class="font-mono text-[10px] text-slate-400">Depth: ${eq.depth.toFixed(1)} km</span>
            </div>
            <p class="font-bold text-slate-200 mb-1">${eq.place}</p>
            <p class="font-mono text-[9px] text-slate-400">Time: ${new Date(eq.time).toLocaleTimeString()} - ${new Date(eq.time).toLocaleDateString()}</p>
            ${
              eq.tsunami === 1
                ? '<p class="mt-1.5 flex items-center gap-1 text-[9px] text-blue-400 font-bold bg-blue-950/40 p-1 border border-blue-900 rounded"><span class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping"></span>TSUNAMI HAZARD THREAT</p>'
                : ''
            }
            ${
              eq.alert
                ? `<p class="mt-1 flex items-center justify-center text-[9px] font-bold uppercase rounded p-0.5" style="background-color: ${
                    eq.alert === 'red' ? '#7F1D1D' : eq.alert === 'orange' ? '#7C2D12' : '#14532D'
                  }; color: white;">Alert Phase: ${eq.alert}</p>`
                : ''
            }
          </div>
        `, { className: 'custom-popup-box' });

      circle.on('click', () => {
        onSelectEarthquake(eq.id);
      });

      markersRef.current[eq.id] = circle;
    });
  }, [earthquakes, mapInstanceRef.current]);

  // Handle selected earthquake centering and focus
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedId) return;

    const selectedMarker = markersRef.current[selectedId];
    if (selectedMarker) {
      const eq = earthquakes.find((e) => e.id === selectedId);
      if (eq) {
        map.setView([eq.latitude, eq.longitude], 7, { animate: true });
        selectedMarker.openPopup();
      }
    }
  }, [selectedId, earthquakes]);

  const latestTsunamiEvents = earthquakes.filter((e) => e.tsunami === 1);

  return (
    <div id="seismic-map-wrapper" className="relative w-full h-[400px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg dark:shadow-2xl bg-white dark:bg-slate-950 transition-colors duration-300">
      {mapError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400 gap-3">
          <HelpCircle className="h-10 w-10 text-red-500" />
          <p className="text-sm font-medium">{mapError}</p>
          <p className="text-xs text-slate-500">Retry by entering a different city coordinate filter</p>
        </div>
      ) : (
        <div ref={mapContainerRef} className="w-full h-full z-10" />
      )}

      {/* Modern map layers style button controls overlay */}
      <div className="absolute top-4 right-4 z-20 pointer-events-auto">
        <div className="relative">
          <button
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            className="flex items-center gap-1.5 bg-slate-950/90 text-white rounded-xl px-3 py-2 border border-slate-700 hover:border-cyan-500/80 shadow-2xl backdrop-blur-md text-[11px] font-bold cursor-pointer transition-all active:scale-95 text-slate-200"
          >
            <Layers className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span>Map Style Selector</span>
          </button>

          {showStyleMenu && (
            <div className="absolute right-0 mt-2 w-[220px] bg-slate-950/95 border border-slate-800 rounded-xl p-2.5 shadow-3xl backdrop-blur-lg flex flex-col gap-1.5 z-30 animate-in fade-in-50 duration-200">
              <span className="text-[9px] uppercase font-bold text-slate-400 pl-1.5 mb-0.5 tracking-wider block">Choose Basemap View</span>
              <div className="flex flex-col gap-1 max-h-[180px] overflow-y-auto pr-1">
                {MAP_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => {
                      setActiveStyle(style.id);
                    }}
                    className={`w-full text-left p-1.5 rounded-lg text-[10px] transition-all font-bold flex flex-col ${
                      activeStyle === style.id
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-slate-300 hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    <span>{style.label}</span>
                    <span className="text-[8px] font-normal text-slate-500 truncate leading-normal block mt-0.5">{style.desc}</span>
                  </button>
                ))}
              </div>

              <div className="h-px bg-slate-800 my-1"></div>

              <span className="text-[9px] uppercase font-bold text-slate-400 pl-1.5 mb-0.5 tracking-wider block">Map Layers Toggle</span>
              <label className="flex items-center justify-between text-[10px] text-slate-300 hover:text-white cursor-pointer select-none bg-slate-900/60 p-2 rounded-xl border border-slate-850 hover:border-slate-800 transition-all font-bold">
                <span className="flex items-center gap-1.5">
                  🔥 Epicenter Heatmap
                </span>
                <input
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-cyan-400 h-3.5 w-3.5 cursor-pointer"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Map Layers legend box */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-[10px] text-slate-700 dark:text-slate-300 shadow-lg dark:shadow-xl max-w-[210px] pointer-events-auto transition-colors duration-300">
        <p className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[9px] mb-1.5 flex items-center gap-1">
          <MapPin className="h-3 w-3 text-cyan-500 dark:text-cyan-400" /> Map Indicators
        </p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-slate-300 dark:border-slate-800 inline-block"></span>
            <span>M 6.0+ Hazardous Rupture</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 rounded-full bg-orange-500 border border-slate-300 dark:border-slate-800 inline-block h-2"></span>
            <span>M 4.0 - 5.9 Strong</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 rounded-full bg-yellow-500 border border-slate-300 dark:border-slate-800 inline-block h-1.5"></span>
            <span>M 2.0 - 3.9 Light Tremor</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1 rounded-full bg-emerald-500 border border-slate-300 dark:border-slate-800 inline-block h-1"></span>
            <span>M 0.0 - 1.9 Micro Tremor</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800 mt-1">
            <span className="w-3 h-3 rounded-full bg-blue-950 border border-blue-450 inline-block flex items-center justify-center shadow-lg"></span>
            <span className="text-blue-500 dark:text-blue-400 font-bold">Active Tsunami Vector</span>
          </div>
          {showHeatmap && (
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800 mt-1">
              <span className="w-6 h-2 rounded bg-gradient-to-r from-blue-500 via-lime-400 to-red-500 inline-block opacity-90"></span>
              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">Epicenter Intensity</span>
            </div>
          )}
        </div>
      </div>

      {/* Tsunami indicator banner in map top if active */}
      {latestTsunamiEvents.length > 0 && (
        <div className="absolute top-4 left-4 z-20 flex bg-red-950/90 hover:bg-red-900 border border-red-800/80 rounded-lg p-2 items-center gap-2 shadow-2xl animate-pulse backdrop-blur-sm pointer-events-auto max-w-[240px]">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <div className="text-[10px]">
            <p className="font-bold text-red-200">Active Tsunami Warning</p>
            <p className="text-red-405 text-[9px] font-mono leading-tight truncate">
              {latestTsunamiEvents[0].place}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
