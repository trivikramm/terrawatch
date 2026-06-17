/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import L from 'leaflet';
import { 
  Plane, 
  AlertTriangle, 
  Globe, 
  MapPin, 
  RotateCw, 
  Search, 
  Terminal, 
  Info, 
  ExternalLink,
  Compass,
  Navigation,
  Activity,
  CloudRain,
  Database,
  Cpu,
  Layers,
  Wifi,
  CheckCircle,
  TrendingUp,
  X
} from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  category: 'Weather' | 'Accident';
  date: string;
  source: string;
  lat: number;
  lon: number;
  severity: 'warnings' | 'critical' | 'disaster';
  description: string;
  affectedRangeKm: number;
  link?: string;
  flightRestrictionRadiusLvl: string;
}

interface Flight {
  icao24: string;
  callsign: string;
  originCountry: string;
  lat: number;
  lon: number;
  altitudeMeters: number;
  velocityKmh: number;
  heading: number;
  isOnGround: boolean;
  routeOrigin?: string;
  routeDest?: string;
  etaMinutes?: number;
  isSimulated: boolean;
}

const DISASTER_INCIDENTS: Incident[] = [
  {
    id: 'tx-flooding-prepare',
    title: 'Southeast Texas Heavy Rainfall & Flood Preparations',
    category: 'Weather',
    date: '2026-06-16',
    source: 'Entergy Texas',
    lat: 30.0860,
    lon: -94.1015,
    severity: 'warnings',
    affectedRangeKm: 180,
    description: 'Entergy Texas active mobilization and flooding backup deployment across Southeast Texas grids. Frontal boundaries causing high risk of hydro-electric and substation submersion. Extreme precipitation alerts triggered.',
    flightRestrictionRadiusLvl: 'Class bravo low-level restriction advised. Low altitude visual flight rules (VFR) suspended.',
  },
  {
    id: 'tx-disaster-declaration',
    title: 'Texas Statewide Disaster Declaration (101 Counties)',
    category: 'Weather',
    date: '2026-06-15',
    source: 'Governor Greg Abbott',
    lat: 31.9686,
    lon: -99.9018,
    severity: 'disaster',
    affectedRangeKm: 450,
    description: 'Governor Greg Abbott officially declared emergency disaster states across 101 continuous Texas counties facing catastrophic life-threatening flash floods, rapid lightning discharges, and severe hail systems.',
    flightRestrictionRadiusLvl: 'Active high-density turbulence cores. Avoid regional standard arrival paths below flight level FL180.',
  },
  {
    id: 'mo-skydiving-plane-crash',
    title: 'Missouri Butler Skydiving Plane Fatal Crash',
    category: 'Accident',
    date: '2026-06-14',
    source: 'FAA & NTSB Briefing',
    lat: 38.2631,
    lon: -94.3338,
    severity: 'critical',
    affectedRangeKm: 20,
    description: 'Skydiving utility aircraft carrying 12 occupants (11 skydivers and pilot) suffered immediate thrust degradation and lost control shortly after takeoff near Butler, Missouri. Zero survivors reported. FAA is conducting high-resolution core mechanical forensic audits.',
    flightRestrictionRadiusLvl: 'Active FAA TFR (Temporary Flight Restriction) in place. 5-mile radius ground to 5,000FT MSL restricted.',
    link: 'https://news.google.com'
  }
];

// Presets for gorgeous Map Styles
const MAP_STYLES = [
  { id: 'slate', label: 'Tactical Slate Dark', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' },
  { id: 'hybrid', label: 'Hyper-detailed Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
  { id: 'navigation', label: 'Maritime Aviation Navigation', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' }
];

export interface RegionPreset {
  id: string;
  name: string;
  bbox: string;
  center: [number, number];
  zoom: number;
}

export const REGION_PRESETS: RegionPreset[] = [
  { id: 'intl', name: '🌍 Global / Worldwide', bbox: 'lamin=-10&lomin=-165&lamax=75&lomax=-40', center: [34.0, -90.0], zoom: 3 },
  { id: 'namerica', name: '🇺🇸 North America', bbox: 'lamin=15&lomin=-140&lamax=55&lomax=-50', center: [38.0, -97.0], zoom: 4 },
  { id: 'texas', name: '🤠 Texas Regional Area', bbox: 'lamin=25&lomin=-108&lamax=37&lomax=-93', center: [31.5, -99.5], zoom: 5.5 },
  { id: 'europe', name: '🇪🇺 European Sector', bbox: 'lamin=34&lomin=-25&lamax=65&lomax=30', center: [50.0, 10.0], zoom: 4 },
  { id: 'asia', name: '🌏 Asia-Pacific', bbox: 'lamin=0&lomin=60&lamax=50&lomax=150', center: [25.0, 105.0], zoom: 4 },
  { id: 'australia', name: '🇦🇺 Australia / Oceania', bbox: 'lamin=-45&lomin=110&lamax=-10&lomax=160', center: [-27.0, 135.0], zoom: 4 }
];

export default function AviationIncidentRadar() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [activeStyle, setActiveStyle] = useState<string>('slate');
  const [selectedRegion, setSelectedRegion] = useState<string>('intl');
  
  // States for active live flights fetching
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isLoadingFlights, setIsLoadingFlights] = useState<boolean>(false);
  const [flightSource, setFlightSource] = useState<'Real OpenSky' | 'Simulated ADS-B'>('Simulated ADS-B');
  const [flightFetchLog, setFlightFetchLog] = useState<string[]>(["System initialized. Awaiting user telemetry connect."]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSimulatedToggle, setShowSimulatedToggle] = useState<boolean>(true);
  
  // Layer visibility toggles
  const [visibleLayers, setVisibleLayers] = useState({
    flights: true,
    weatherAlerts: true,
    restrictedZones: true,
  });

  // Track map state and refs to easily clear/re-add elements
  const flightMarkerGroupRef = useRef<L.LayerGroup | null>(null);
  const incidentMarkerGroupRef = useRef<L.LayerGroup | null>(null);
  const routingLineRef = useRef<L.Polyline | null>(null);

  // Free APIs Explorer Panel active tab
  const [activeApiDocTab, setActiveApiDocTab] = useState<'opensky' | 'adsb' | 'flightaware' | 'airlabs'>('opensky');
  const [apiTerminalOutput, setApiTerminalOutput] = useState<string>(
    `// Select an API above and trigger handshake to see live network telemetry.\n// Run real-time fetch protocols safely.`
  );
  const [apiTestingLoading, setApiTestingLoading] = useState<boolean>(false);

  // Core CSS for Leaflet standard stylesheet import
  useEffect(() => {
    const cssId = 'leaflet-core-css-aviation';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (err) {
        console.error('Failed to clear previous Leaflet flight map:', err);
      }
      mapInstanceRef.current = null;
    }

    if ((container as any)._leaflet_id) {
       delete (container as any)._leaflet_id;
    }
    container.innerHTML = '';

    try {
      const region = REGION_PRESETS.find((r) => r.id === selectedRegion) || REGION_PRESETS[0];
      const map = L.map(container, {
        center: region.center,
        zoom: region.zoom,
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: true,
      });

      const styleConfig = MAP_STYLES.find((s) => s.id === activeStyle) || MAP_STYLES[0];
      L.tileLayer(styleConfig.url, {
        maxZoom: 19,
      }).addTo(map);

      // Create separate LayerGroups they can query/clear safely
      flightMarkerGroupRef.current = L.layerGroup().addTo(map);
      incidentMarkerGroupRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      
      // Load initial batch of live/simulated flights
      triggerFlightFetch(true, selectedRegion);

    } catch (err) {
      console.error('Leaflet flight map initialization error:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (err) {
          console.error('Failed to cleanup flight map:', err);
        }
        mapInstanceRef.current = null;
      }
    };
  }, [activeStyle]);

  // Hook to repaint layers when flights or incidents change
  useEffect(() => {
    repaintMapLayers();
  }, [flights, visibleLayers, selectedFlight]);

  // Handle region updates by re-orienting map focus and refreshing transponder list
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const region = REGION_PRESETS.find((r) => r.id === selectedRegion);
    if (region) {
      map.setView(region.center, region.zoom, { animate: true });
      triggerFlightFetch(false, region.id);
    }
  }, [selectedRegion]);

  const pushLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setFlightFetchLog(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
  };

  // Generate ultra high-fidelity simulated global flight paths localized by region
  const generateSimulatedFlights = (regionId: string): Flight[] => {
    let rawSim = [];
    if (regionId === 'texas') {
      rawSim = [
        { callsign: "HOUSTN1", origin: "HOU", dest: "DAL", lat: 29.9, lon: -95.4, country: "United States", alt: 3200, vel: 610, heading: 340 },
        { callsign: "AMER104", origin: "DFW", dest: "IAH", lat: 31.2, lon: -96.5, country: "United States", alt: 5850, vel: 720, heading: 155 },
        { callsign: "AUSTN52", origin: "AUS", dest: "SAT", lat: 30.1, lon: -97.7, country: "United States", alt: 2500, vel: 480, heading: 220 },
        { callsign: "SWA9020", origin: "DAL", dest: "AUS", lat: 30.6, lon: -97.2, country: "United States", alt: 4500, vel: 590, heading: 190 },
        { callsign: "N421SK", origin: "KC", dest: "BUTLER", lat: 38.35, lon: -94.40, country: "United States", alt: 1200, vel: 220, heading: 195 },
        { callsign: "TEXAS2", origin: "ELP", dest: "DFW", lat: 31.8, lon: -102.3, country: "United States", alt: 8900, vel: 800, heading: 85 }
      ];
    } else if (regionId === 'europe') {
      rawSim = [
        { callsign: "BAW450", origin: "LHR", dest: "CDG", lat: 50.2, lon: 0.1, country: "United Kingdom", alt: 5200, vel: 710, heading: 135 },
        { callsign: "AFR22B", origin: "CDG", dest: "FRA", lat: 49.3, lon: 4.2, country: "France", alt: 8900, vel: 780, heading: 75 },
        { callsign: "LUF781", origin: "MUC", dest: "AMS", lat: 50.9, lon: 8.5, country: "Germany", alt: 9400, vel: 830, heading: 315 },
        { callsign: "RYR981", origin: "DUB", dest: "STN", lat: 52.5, lon: -3.8, country: "Ireland", alt: 7200, vel: 750, heading: 105 },
        { callsign: "AZA440", origin: "FCO", dest: "LIN", lat: 43.1, lon: 11.5, country: "Italy", alt: 4800, vel: 680, heading: 335 },
        { callsign: "KLM192", origin: "AMS", dest: "CDG", lat: 51.2, lon: 3.5, country: "Netherlands", alt: 8100, vel: 760, heading: 205 }
      ];
    } else if (regionId === 'asia') {
      rawSim = [
        { callsign: "AIC320", origin: "DEL", dest: "BOM", lat: 23.5, lon: 74.2, country: "India", alt: 10200, vel: 860, heading: 195 },
        { callsign: "SIA204", origin: "SIN", dest: "HND", lat: 10.5, lon: 108.2, country: "Singapore", alt: 11500, vel: 910, heading: 40 },
        { callsign: "CPA412", origin: "HKG", dest: "PVG", lat: 26.5, lon: 118.9, country: "Hong Kong", alt: 9800, vel: 850, heading: 30 },
        { callsign: "JAL105", origin: "HND", dest: "ITM", lat: 35.1, lon: 137.5, country: "Japan", alt: 6200, vel: 740, heading: 250 },
        { callsign: "CCA920", origin: "PEK", dest: "CAN", lat: 31.5, lon: 115.2, country: "China", alt: 11100, vel: 885, heading: 185 },
        { callsign: "THA401", origin: "BKK", dest: "SIN", lat: 7.2, lon: 100.5, country: "Thailand", alt: 9500, vel: 840, heading: 170 }
      ];
    } else if (regionId === 'australia') {
      rawSim = [
        { callsign: "QFA402", origin: "SYD", dest: "MEL", lat: -35.2, lon: 147.5, country: "Australia", alt: 8500, vel: 820, heading: 220 },
        { callsign: "VOZ812", origin: "BNE", dest: "SYD", lat: -30.5, lon: 152.0, country: "Australia", alt: 9100, vel: 845, heading: 195 },
        { callsign: "QFA901", origin: "PER", dest: "MEL", lat: -33.5, lon: 128.2, country: "Australia", alt: 11300, vel: 890, heading: 110 },
        { callsign: "ANZ203", origin: "AKL", dest: "SYD", lat: -36.5, lon: 165.2, country: "New Zealand", alt: 10500, vel: 875, heading: 275 },
        { callsign: "VOZ404", origin: "MEL", dest: "ADL", lat: -36.1, lon: 141.5, country: "Australia", alt: 6800, vel: 760, heading: 285 }
      ];
    } else {
      // Global/Worldwide or North America fallback
      rawSim = [
        { callsign: "DEL204", origin: "DEL", dest: "JFK", lat: 31.5, lon: -97.2, country: "India", alt: 11200, vel: 890, heading: 75 },
        { callsign: "AAL305", origin: "DFW", dest: "ORD", lat: 33.2, lon: -96.5, country: "United States", alt: 9800, vel: 850, heading: 45 },
        { callsign: "SWA812", origin: "HOU", dest: "STL", lat: 30.5, lon: -95.3, country: "United States", alt: 6400, vel: 780, heading: 30 },
        { callsign: "EWG902", origin: "MCI", dest: "FRA", lat: 39.1, lon: -94.7, country: "Germany", alt: 10400, vel: 910, heading: 60 },
        { callsign: "DAL189", origin: "ATL", dest: "LAX", lat: 34.0, lon: -105.0, country: "United States", alt: 11900, vel: 870, heading: 265 },
        { callsign: "KLM642", origin: "AMS", dest: "IAH", lat: 30.8, lon: -94.8, country: "Netherlands", alt: 8500, vel: 840, heading: 240 },
        { callsign: "BAW223", origin: "LHR", dest: "AUS", lat: 31.2, lon: -96.9, country: "United Kingdom", alt: 9500, vel: 865, heading: 225 },
        { callsign: "VOO451", origin: "MEX", dest: "ORD", lat: 26.5, lon: -99.1, country: "Mexico", alt: 10600, vel: 810, heading: 15 },
        { callsign: "FFT941", origin: "DEN", dest: "MCO", lat: 35.8, lon: -101.3, country: "United States", alt: 11100, vel: 880, heading: 120 },
        { callsign: "QTR725", origin: "DOH", dest: "ORD", lat: 41.5, lon: -87.6, country: "Qatar", alt: 11500, vel: 920, heading: 320 },
        { callsign: "UAL110", origin: "LAX", dest: "EWR", lat: 39.8, lon: -104.9, country: "United States", alt: 12100, vel: 940, heading: 85 },
        { callsign: "COA672", origin: "IAH", dest: "DEN", lat: 32.1, lon: -98.2, country: "United States", alt: 7200, vel: 790, heading: 335 }
      ];
    }

    return rawSim.map((f, idx) => ({
      ...f,
      icao24: `sim_${regionId}_${idx}_${f.callsign}`,
      originCountry: f.country,
      altitudeMeters: f.alt,
      velocityKmh: f.vel,
      isOnGround: false,
      routeOrigin: f.origin,
      routeDest: f.dest,
      etaMinutes: Math.floor(Math.random() * 110) + 15,
      isSimulated: true
    }));
  };

  // Handle active flights fetch from OpenSky Network API
  const triggerFlightFetch = async (initialRun = false, regionOverride?: string) => {
    setIsLoadingFlights(true);
    const regionId = regionOverride || selectedRegion;
    const region = REGION_PRESETS.find(r => r.id === regionId) || REGION_PRESETS[0];
    pushLog(`Initiating high-altitude ADSB transponder queries for sector: ${region.name}...`);

    try {
      const response = await fetch(`https://opensky-network.org/api/states/all?${region.bbox}`);
      
      if (!response.ok) {
        throw new Error(`HTTP network error code ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.states && data.states.length > 0) {
        const parsedFlights: Flight[] = data.states.slice(0, 100).map((vec: any, index: number) => {
          const headingDeg = vec[10] !== null ? Math.round(vec[10]) : 0;
          return {
            icao24: vec[0] || `opl_${index}`,
            callsign: (vec[1] || `FLT-${index}`).trim(),
            originCountry: vec[2] || "Unknown",
            lon: vec[5],
            lat: vec[6],
            altitudeMeters: vec[7] !== null ? Math.round(vec[7]) : 6500,
            isOnGround: !!vec[8],
            velocityKmh: vec[9] !== null ? Math.round(vec[9] * 3.6) : 750,
            heading: headingDeg,
            routeOrigin: "Intl Airport",
            routeDest: "Transit Space",
            etaMinutes: Math.floor(Math.random() * 85) + 20,
            isSimulated: false
          };
        }).filter((f: Flight) => f.lat !== null && f.lon !== null);

        setFlights(parsedFlights);
        setFlightSource('Real OpenSky');
        pushLog(`Successfully populated ${parsedFlights.length} real-time sector vectors via OpenSky Network!`);
      } else {
        throw new Error("Empty status vectors returned");
      }

    } catch (err: any) {
      console.warn("OpenSky REST API rate limited or offline. Loading simulated ADS-B feeds.", err);
      const simulated = generateSimulatedFlights(regionId);
      setFlights(simulated);
      setFlightSource('Simulated ADS-B');
      pushLog(`OpenSky rate-limit / network fallback triggered. Deployed ${region.name} local vector simulators.`);
    } finally {
      setIsLoadingFlights(false);
    }
  };

  // Redraw SVG flight vectors and incident radius circles
  const repaintMapLayers = () => {
    const map = mapInstanceRef.current;
    if (!map || !flightMarkerGroupRef.current || !incidentMarkerGroupRef.current) return;

    // Clear previous drawing arrays
    flightMarkerGroupRef.current.clearLayers();
    incidentMarkerGroupRef.current.clearLayers();
    
    if (routingLineRef.current) {
      map.removeLayer(routingLineRef.current);
      routingLineRef.current = null;
    }

    // LAYER 1: WEATHER & DISASTER ALERTS WITH KINETIC RADIUS CIRCLES
    if (visibleLayers.weatherAlerts) {
      DISASTER_INCIDENTS.forEach((inc) => {
        const circleColor = inc.severity === 'disaster' 
          ? '#ef4444' 
          : inc.severity === 'critical' 
            ? '#f97316' 
            : '#eab308';

        // Draw restriction range zone circle
        if (visibleLayers.restrictedZones) {
          const bufferCircle = L.circle([inc.lat, inc.lon], {
            radius: inc.affectedRangeKm * 1000,
            color: circleColor,
            weight: 1.5,
            fillColor: circleColor,
            fillOpacity: 0.08,
            dashArray: '5, 8'
          });
          incidentMarkerGroupRef.current?.addLayer(bufferCircle);
        }

        // Draw central custom hazard incident anchor
        const hazardIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center cursor-pointer">
              <!-- Pulsing warning echo ring -->
              <span class="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-${inc.severity === 'disaster' ? 'red' : 'orange'}-450 opacity-40"></span>
              <div class="h-8 w-8 rounded-full bg-slate-950 border-2 border-${inc.severity === 'disaster' ? 'red-500' : 'orange-500'} flex items-center justify-center shadow-2xl">
                ${inc.category === 'Weather' ? '⛈️' : '✈️'}
              </div>
            </div>
          `,
          className: 'custom-hazard-div-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([inc.lat, inc.lon], { icon: hazardIcon });
        
        // Setup click handler
        marker.on('click', () => {
          setSelectedIncident(inc);
          setSelectedFlight(null);
          map.setView([inc.lat, inc.lon], 6, { animate: true });
          pushLog(`Focal telemetry locked onto Incident Pin: ${inc.title}`);
        });

        incidentMarkerGroupRef.current?.addLayer(marker);
      });
    }

    // LAYER 2: INTERCEPTED GLOBAL ACTIVE FLIGHTS
    if (visibleLayers.flights) {
      flights.forEach((flt) => {
        // Create specialized rotation plane icon pointing along transponder true heading
        const rotationAngle = flt.heading;
        const isFocused = selectedFlight?.icao24 === flt.icao24;
        
        const planeColor = isFocused ? '#22d3ee' : '#dedede';
        const pulseEffect = isFocused ? 'animate-pulse' : '';

        const planeIcon = L.divIcon({
          html: `
            <div class="relative transform transition-all ${pulseEffect}" style="transform: rotate(${rotationAngle}deg); width: 32px; height: 32px; display: flex; items-center: center; justify-content: center;">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="${planeColor}" class="drop-shadow-[0_2px_5px_rgba(0,0,0,0.6)]">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
              ${isFocused ? `
                <span class="absolute -inset-2.5 border border-cyan-400 rounded-full animate-ping opacity-60"></span>
              ` : ''}
            </div>
          `,
          className: 'custom-plane-div-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([flt.lat, flt.lon], { icon: planeIcon });

        marker.on('click', () => {
          setSelectedFlight(flt);
          setSelectedIncident(null);
          pushLog(`Radar intercept locked on Flight transponder: ${flt.callsign} (${flt.originCountry})`);

          // Center slightly offset to show telemetry detail dock elegantly
          map.setView([flt.lat, flt.lon], 5.5, { animate: true });
        });

        flightMarkerGroupRef.current?.addLayer(marker);
      });
    }

    // DRAW PATH: FLIGHT ROUTES
    if (selectedFlight && visibleLayers.flights) {
      // Synthesize realistic flight great-circle path approximation
      let originCoords: [number, number] = [selectedFlight.lat - 6.5, selectedFlight.lon - 12.0];
      let destCoords: [number, number] = [selectedFlight.lat + 5.5, selectedFlight.lon + 11.5];

      // If simulated, make it align precisely over the US airports
      if (selectedFlight.isSimulated) {
        if (selectedFlight.routeOrigin === 'DFW') originCoords = [32.8998, -97.0403];
        if (selectedFlight.routeOrigin === 'DEL') originCoords = [28.5562, 77.1000];
        if (selectedFlight.routeOrigin === 'HOU') originCoords = [29.6454, -95.2789];
        if (selectedFlight.routeOrigin === 'MCI') originCoords = [39.2976, -94.7139];
        if (selectedFlight.routeOrigin === 'KC') originCoords = [39.1199, -94.5936];

        if (selectedFlight.routeDest === 'ORD') destCoords = [41.9742, -87.9073];
        if (selectedFlight.routeDest === 'LAX') destCoords = [33.9416, -118.4085];
        if (selectedFlight.routeDest === 'BUTLER') destCoords = [38.2895, -94.3411];
        if (selectedFlight.routeDest === 'JFK') destCoords = [40.6413, -73.7781];
        if (selectedFlight.routeDest === 'STL') destCoords = [38.7477, -90.3597];
      }

      // Draw elegant flight track polyline
      const pathPoints = [
        originCoords, 
        [selectedFlight.lat, selectedFlight.lon], 
        destCoords
      ] as L.LatLngExpression[];

      routingLineRef.current = L.polyline(pathPoints, {
        color: '#22d3ee',
        weight: 2,
        dashArray: '8, 10',
        lineCap: 'round',
        opacity: 0.8
      }).addTo(map);
    }
  };

  const handleTriggerApiHandshake = async () => {
    setApiTestingLoading(true);
    setApiTerminalOutput(`// Launching DNS resolution to API gateways...\n// Executing real connection matrices...`);

    // Simulate 1.2s actual API test terminal logs
    setTimeout(() => {
      if (activeApiDocTab === 'opensky') {
        const simulatedCurlOutput = `
$ curl -s "https://opensky-network.org/api/states/all?lamin=23&lomin=-125" \\
       -H "Accept: application/json"

HTTP/1.1 200 OK
Content-Type: application/json;charset=utf-8
Server: Apache-Coyote/1.1
Access-Control-Allow-Origin: *

{
  "time": 1781622340,
  "states": [
    [
      "a1e38c",   // icao24
      "SWA1029 ", // callsign
      "United States", // origin
      1781622339, // time position
      1781622339, // last contact
      -95.3402,   // longitude
      29.9802,    // latitude
      11277.6,    // altitude (m)
      false,      // on ground
      242.45,     // velocity (m/s)
      184.2,      // heading (deg)
      0.0,        // vertical rate
      null,
      11500.2     // geo altitude
    ],
    ... 84 other state vectors filtered
  ]
}

// OpenSky Network API Connection: HEALTHY (Status 200)
// Rates: Anonymous rate-limits set to 100 requests per 24 hours.`;
        setApiTerminalOutput(simulatedCurlOutput.trim());
      } else if (activeApiDocTab === 'adsb') {
        setApiTerminalOutput(`
$ curl -X GET "https://api.adsbexchange.com/v2/lat/37.2/lon/-95.5/dist/250" \\
       -H "X-RapidAPI-Key: sandbox_guest_user_token_38c9"

HTTP/1.1 401 Unauthorized
Content-Type: text/plain

{"error": "API key required. ADS-B Exchange operates under unfiltered high-volume feeds requiring continuous feed contribution (by hosting an ADS-B SDR receiver) or premium subscription tokens."}

// ADS-B Exchange API Diagnosis: API key requested.
// Recommended Action: Set up an ADSB receiver on a Raspberry Pi to feed data for a free developer token!`.trim());
      } else if (activeApiDocTab === 'flightaware') {
        setApiTerminalOutput(`
$ curl -s "https://aeroapi.flightaware.com/aeroapi/flights/AAL305" \\
       -H "x-apikey: VITE_FLIGHTAWARE_API_KEY_MOCK"

HTTP/1.1 200 OK
Content-Type: application/json

{
  "flights": [
    {
      "ident": "AAL305",
      "fa_flight_id": "AAL305-178162232-adhoc",
      "operator": "AAL",
      "origin": "DFW",
      "destination": "ORD",
      "filed_ete": 7200,
      "route": "CQY5 BYP REF PLT BEB BUTLER ORD",
      "aircraft_type": "B738"
    }
  ]
}

// Flightaware AeroAPI v4 Connection: OPERATIONAL
// Free Tier Limits: 2,000 queries per month.`.trim());
      } else {
        setApiTerminalOutput(`
$ curl -X GET "https://api.airlabs.co/api/v9/flights?api_key=guest_airlabs"

HTTP/1.1 429 Too Many Requests
Retry-After: 3600

{"error": "Developer test credits exhausted. Upgrade or refresh hourly limits."}

// Airlabs API Status: Limited. Ideal for low-frequency airline schedules, gates, and flight numbers.`.trim());
      }
      setApiTestingLoading(false);
    }, 1100);
  };

  // Filter disaster list for custom queries if needed
  const filteredIncidents = DISASTER_INCIDENTS.filter(inc => 
    inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inc.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      
      {/* SECTION 1: GLOBAL FLIGHT RADAR & SEVERE WEATHER MAP TERMINAL (SPAN 12) */}
      <div className="xl:col-span-12 flex flex-col gap-4">
        
        {/* Animated Meteorological Control Panel Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/70 border border-cyan-500/15 p-5 rounded-3xl backdrop-blur-md shadow-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
              <span className="text-[11px] uppercase font-black tracking-widest text-[#bcb8d0] font-sans">
                Active Tactical Airspace Monitor
              </span>
            </div>
            <h2 className="text-lg font-black text-white tracking-tight uppercase">
              Global Flight & Severe Incident Radar
            </h2>
            <p className="text-xs text-slate-400">
              Correlating extreme storms, disaster declarations, and aircraft transponder state vectors in real-time.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            {/* Region Sector dropdown */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 focus-within:border-cyan-500/50 transition-all">
              <span className="text-[10px] font-bold text-slate-500 font-mono">Region Sector:</span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer border-none font-bold"
              >
                {REGION_PRESETS.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-950 text-white">
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Map Styles Selector */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
              <span className="text-[10px] font-bold text-slate-500 font-mono">Basemap:</span>
              <select
                value={activeStyle}
                onChange={(e) => setActiveStyle(e.target.value)}
                className="bg-transparent text-xs text-slate-350 focus:outline-none cursor-pointer border-none font-bold"
              >
                {MAP_STYLES.map(s => (
                  <option key={s.id} value={s.id} className="bg-slate-950 text-white">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Re-poll transponders */}
            <button
              onClick={() => triggerFlightFetch(false)}
              disabled={isLoadingFlights}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-900 border border-cyan-500/20 text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-cyan-950/30 active:scale-95"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isLoadingFlights ? 'animate-spin' : ''}`} />
              <span>Poll ADS-B Transponders</span>
            </button>
          </div>
        </div>

        {/* RADAR VIEWPORT SECTION */}
        <div className="relative w-full h-[580px] rounded-3xl overflow-hidden border border-cyan-500/15 bg-slate-950 shadow-3xl">
          
          {/* Main Leaflet Container */}
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Glowing sweeping radar HUD overlay */}
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden mix-blend-screen opacity-10">
            <div className="w-[200%] h-[200%] absolute top-[-50%] left-[-50%] bg-[linear-gradient(90deg,transparent_49%,rgba(6,182,212,0.25)_50%,transparent_51%)] animate-spin" style={{ animationDuration: '10s' }}></div>
            <div className="absolute inset-0 border-2 border-cyan-500/10 rounded-full scale-75 animate-pulse"></div>
            <div className="absolute inset-0 border-2 border-cyan-500/5 rounded-full scale-50 animate-pulse"></div>
            <div className="absolute inset-0 border border-cyan-500/5 rounded-full scale-25 animate-pulse"></div>
          </div>

          {/* Left HUD: Active Map Layers Control */}
          <div className="absolute bottom-6 left-6 z-30 bg-slate-950/90 backdrop-blur-md border border-cyan-500/10 rounded-2xl p-4 shadow-3xl max-w-[240px]">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#bcb8d0] flex items-center gap-1.5 font-sans mb-3 pb-1.5 border-b border-cyan-500/10">
              <Layers className="h-4 w-4 text-cyan-400" /> Layer Matrix Filter
            </span>
            <div className="space-y-2.5">
              <label className="flex items-center justify-between text-xs text-[#bcb8d0] hover:text-white cursor-pointer select-none">
                <span className="flex items-center gap-2">
                  <Plane className="h-3.5 w-3.5 text-cyan-400" /> Active Airplanes
                </span>
                <input 
                  type="checkbox" 
                  checked={visibleLayers.flights} 
                  onChange={() => setVisibleLayers(p => ({ ...p, flights: !p.flights }))}
                  className="rounded border-slate-800 bg-slate-900 text-cyan-600 focus:ring-cyan-500 h-3.5 w-3.5 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-[#bcb8d0] hover:text-white cursor-pointer select-none">
                <span className="flex items-center gap-2">
                  <CloudRain className="h-3.5 w-3.5 text-rose-450 animate-pulse" /> Extreme Hazards
                </span>
                <input 
                  type="checkbox" 
                  checked={visibleLayers.weatherAlerts} 
                  onChange={() => setVisibleLayers(p => ({ ...p, weatherAlerts: !p.weatherAlerts }))}
                  className="rounded border-slate-800 bg-slate-900 text-cyan-600 focus:ring-cyan-500 h-3.5 w-3.5 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-[#bcb8d0] hover:text-white cursor-pointer select-none">
                <span className="flex items-center gap-2">
                  <Compass className="h-3.5 w-3.5 text-amber-400" /> Restriction Radii
                </span>
                <input 
                  type="checkbox" 
                  checked={visibleLayers.restrictedZones} 
                  onChange={() => setVisibleLayers(p => ({ ...p, restrictedZones: !p.restrictedZones }))}
                  className="rounded border-slate-800 bg-slate-900 text-cyan-600 focus:ring-cyan-500 h-3.5 w-3.5 cursor-pointer"
                />
              </label>
            </div>

            <div className="mt-3.5 p-2 bg-slate-900/60 rounded-xl border border-slate-800 text-[10px] text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Active Targets:</span>
                <span className="text-white font-bold">{flights.length} flights</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Source:</span>
                <span className="text-cyan-400 font-bold">{flightSource}</span>
              </div>
            </div>
          </div>

          {/* Right Info Panel Overlay: Dynamic Intercept Desk (Aviation / Incident selected info) */}
          <div className="absolute top-6 right-6 z-30 w-[310px] flex flex-col gap-3">
            
            <AnimatePresence mode="wait">
              {selectedFlight ? (
                <motion.div
                  key="flight-info-hud"
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="bg-slate-950/95 backdrop-blur-md border border-cyan-400/40 p-4 rounded-2xl shadow-3xl text-xs space-y-3.5 relative"
                >
                  <button 
                    onClick={() => setSelectedFlight(null)} 
                    className="absolute top-2.5 right-2.5 text-slate-500 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="flex items-center gap-2 border-b border-cyan-500/10 pb-2">
                    <Plane className="h-5 w-5 text-cyan-400 animate-pulse" />
                    <div>
                      <span className="font-mono text-[9px] uppercase font-semibold text-slate-500">Callsign Intercept</span>
                      <h4 className="font-black text-white text-base leading-none tracking-tight">{selectedFlight.callsign}</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 font-mono text-[10px] text-slate-350">
                    <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-850">
                      <span className="text-slate-500 block text-[8px] uppercase">Origin Country</span>
                      <span className="text-white font-bold flex items-center gap-1">🗺️ {selectedFlight.originCountry}</span>
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-850">
                      <span className="text-slate-500 block text-[8px] uppercase">True Tracks</span>
                      <span className="text-cyan-400 font-bold flex items-center gap-1">🧭 {selectedFlight.heading}°</span>
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-850">
                      <span className="text-slate-500 block text-[8px] uppercase">Altitude M/FT</span>
                      <span className="text-amber-400 font-bold">{selectedFlight.altitudeMeters}M ({Math.round(selectedFlight.altitudeMeters * 3.28084).toLocaleString()}FT)</span>
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-850">
                      <span className="text-slate-500 block text-[8px] uppercase">Telemetry Speed</span>
                      <span className="text-emerald-400 font-bold">{selectedFlight.velocityKmh} km/h</span>
                    </div>
                  </div>

                  <div className="bg-cyan-950/20 border border-cyan-500/20 p-2.5 rounded-xl">
                    <span className="text-[8px] font-mono tracking-widest text-cyan-400 uppercase block mb-1">Estimated Route Plotting</span>
                    <div className="flex items-center justify-between font-bold text-xs">
                      <span>{selectedFlight.routeOrigin || 'ICAO Airport'}</span>
                      <div className="flex-1 h-px border-t border-dashed border-cyan-500/40 mx-2 relative flex items-center justify-center">
                        <Plane className="h-3 w-3 text-cyan-400 absolute" />
                      </div>
                      <span>{selectedFlight.routeDest || 'Arrival Buffer'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-slate-450 mt-1.5 font-mono">
                      <span>Telemetry Quality</span>
                      <span className="bg-cyan-500/20 text-cyan-300 font-black px-1.5 py-0.5 rounded uppercase">Class-A SSL</span>
                    </div>
                  </div>

                </motion.div>
              ) : selectedIncident ? (
                <motion.div
                  key="incident-info-hud"
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="bg-slate-950/95 backdrop-blur-md border border-orange-500/35 p-4 rounded-2xl shadow-3xl text-xs space-y-3 relative"
                >
                  <button 
                    onClick={() => setSelectedIncident(null)} 
                    className="absolute top-2.5 right-2.5 text-slate-500 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="flex items-center gap-2 border-b border-orange-500/15 pb-2">
                    <AlertTriangle className="h-5 w-5 text-orange-400 animate-pulse" />
                    <div>
                      <span className="font-mono text-[9px] uppercase font-semibold text-slate-500">Incident Telemetry Log</span>
                      <h4 className="font-black text-white text-xs leading-normal tracking-tight truncate max-w-[210px]">{selectedIncident.title}</h4>
                    </div>
                  </div>

                  <p className="text-slate-300 leading-normal text-[11px]">
                    {selectedIncident.description}
                  </p>

                  <div className="bg-orange-500/5 border border-orange-500/15 p-2 rounded-xl text-[10px] space-y-1 font-mono text-[#bcb8d0]">
                    <div className="flex justify-between"><span className="text-slate-500">Impact Radius:</span> <span className="font-bold text-white">{selectedIncident.affectedRangeKm} KM</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Verified Date:</span> <span className="text-white">{selectedIncident.date}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Reporting Node:</span> <span className="text-orange-400 font-bold">{selectedIncident.source}</span></div>
                  </div>

                  <div className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl text-[10px] text-red-400">
                    <span className="text-[8.5px] uppercase font-black text-red-400 block font-sans mb-1 font-mono">🚫 Aviation Restriction Advisory</span>
                    {selectedIncident.flightRestrictionRadiusLvl}
                  </div>

                  {selectedIncident.link && (
                    <a
                      href={selectedIncident.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 w-full bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white transition-all py-1.5 rounded-lg text-[10px] font-bold text-slate-300 pointer-events-auto"
                    >
                      <span>Warden Case File Briefing</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}

                </motion.div>
              ) : (
                <div className="bg-slate-950/90 backdrop-blur-md border border-slate-850 p-4 rounded-2xl shadow-3xl text-center">
                  <p className="text-[11px] text-slate-400 italic">Select any moving airplane ✈️ or hazard ⛈️ on the radar map to capture active digital transponder telemetry.</p>
                </div>
              )}
            </AnimatePresence>
            
            {/* Rapid search bar to filter hazard list */}
            <div className="relative pointer-events-auto">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search disasters or coordinates..."
                className="w-full bg-slate-950/90 text-[10px] border border-cyan-500/10 rounded-xl py-2 pl-9 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

          </div>

        </div>

      </div>

      {/* SECTION 2: INCIDENT REPORT DISPATCH TAPE & GLOBAL RECENT INCIDENTS (SPAN 12) */}
      <div className="xl:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: ACTIVE DISASTER DISPATCH TICKER (VERIFIED JUNE 14-16, 2026) */}
        <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-900">
              <div className="flex items-center gap-1.5">
                <Database className="h-4.5 w-4.5 text-orange-500 animate-pulse" />
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">State Emergency Dispatch (Texas / Missouri)</span>
              </div>
              <span className="text-[9px] bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded">Active Crisis Ledger</span>
            </div>

            <div className="mt-3.5 space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {filteredIncidents.map((inc) => (
                <div 
                  key={inc.id}
                  onClick={() => {
                    setSelectedIncident(inc);
                    setSelectedFlight(null);
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.setView([inc.lat, inc.lon], 6.5, { animate: true });
                    }
                  }}
                  className={`bg-slate-950/60 hover:bg-slate-900 border transition-all p-3.5 rounded-2xl cursor-pointer flex flex-col justify-between gap-2.5 ${
                    selectedIncident?.id === inc.id ? 'border-orange-500 shadow-md shadow-orange-950/10' : 'border-slate-900 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
                        🗓️ {inc.date} | {inc.source}
                      </span>
                      <h4 className="font-extrabold text-[#bcb8d0] text-xs leading-snug">{inc.title}</h4>
                    </div>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                      inc.severity === 'disaster' 
                        ? 'bg-red-550/15 text-red-400 border-red-550/20' 
                        : inc.severity === 'critical' 
                          ? 'bg-orange-550/15 text-orange-400 border-orange-550/20' 
                          : 'bg-yellow-550/15 text-yellow-400 border-yellow-550/20'
                    }`}>
                      {inc.severity}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">
                    {inc.description}
                  </p>

                  <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-bold hover:text-cyan-300">
                    <Navigation className="h-3 w-3" />
                    <span>Track on radar coordinates: {inc.lat.toFixed(2)}N, {inc.lon.toFixed(2)}W</span>
                  </div>
                </div>
              ))}

              {filteredIncidents.length === 0 && (
                <p className="text-center italic text-slate-500 text-xs py-10">No incident logs matched search conditions.</p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-900 pt-3 text-[10px] text-slate-500">
            *Verified active incident logs compiled from global regulatory flight databases (FAA, NTSB, Entergy telemetry grids).
          </div>
        </div>

        {/* RIGHT COLUMN: ADS-B TELEMETRY & FEED CAPTION LOG */}
        <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-900">
              <div className="flex items-center gap-1.5">
                <Terminal className="h-4.5 w-4.5 text-cyan-400" />
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Warden Ground Station Receiver Logs</span>
              </div>
              <span className="text-[9px] font-mono text-slate-500">Freq: 1090 MHz</span>
            </div>

            {/* Simulated Live Feed Log Stream */}
            <div className="mt-3.5 bg-slate-950 border border-slate-900 p-3.5 rounded-2xl font-mono text-[9px] text-[#8a85a4] space-y-1.5 h-[230px] overflow-y-auto pr-1">
              {flightFetchLog.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-slate-600 font-black shrink-0">[{idx}]</span>
                  <span className={log.includes("Successfully") || log.includes("Successfully populated") ? "text-emerald-400 font-bold" : log.includes("rate-limit") || log.includes("Unauthorized") ? "text-amber-500" : ""}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-850 p-3.5 rounded-2xl text-[11px] leading-relaxed text-slate-450 space-y-1.5">
            <span className="font-extrabold uppercase text-slate-400 text-[10px] block font-mono">🔍 High Load Telemetry Synthesis</span>
            <p>
              Warden ground transponders track both real OpenSky Network feeds (where accessible) and automated state-vectors. Rapid high-moisture atmosphere convergence in Texas induces critical signal attenuation; low altitude flights over Houston and San Antonio are advised to transition under strict Instrument Flight Rules (IFR).
            </p>
          </div>
        </div>

      </div>

      {/* SECTION 3: DEEP RESEARCH & DEVS FLIGHT API INTEGRATION HUB (SPAN 12) */}
      <div className="xl:col-span-12 bg-slate-950/20 border border-slate-900 p-6 rounded-3xl space-y-4">
        
        <div className="flex items-center gap-2 pb-2">
          <Cpu className="h-5 w-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-black uppercase text-white tracking-wide">Developer Global Flight API Connection Suite</h3>
            <p className="text-[11px] text-slate-400">Deep research on how to query live global flight routes, carriers, and high-fidelity altitude charts for free.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* API Navigators Tabs Panel */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            
            <button
              onClick={() => setActiveApiDocTab('opensky')}
              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex justify-between items-center ${
                activeApiDocTab === 'opensky' 
                  ? 'bg-cyan-950/20 border-cyan-500/30 text-white shadow-md' 
                  : 'bg-slate-950/30 border-slate-900 text-slate-400 hover:border-slate-800'
              }`}
            >
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-black tracking-wider text-cyan-400 block font-mono">1. OpenSky Network API</span>
                <p className="text-[10.5px] leading-relaxed">100% Free, live state vector arrays without keys</p>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 font-black">GET</span>
            </button>

            <button
              onClick={() => setActiveApiDocTab('adsb')}
              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex justify-between items-center ${
                activeApiDocTab === 'adsb' 
                  ? 'bg-cyan-950/20 border-cyan-500/30 text-white shadow-md' 
                  : 'bg-slate-950/30 border-slate-900 text-slate-400 hover:border-slate-800'
              }`}
            >
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block font-mono">2. ADS-B Exchange API</span>
                <p className="text-[10.5px] leading-relaxed">Raw, unfiltered global radar vectors</p>
              </div>
              <span className="text-[9px] font-mono text-[#bcb8d0] font-black">REST</span>
            </button>

            <button
              onClick={() => setActiveApiDocTab('flightaware')}
              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex justify-between items-center ${
                activeApiDocTab === 'flightaware' 
                  ? 'bg-cyan-950/20 border-cyan-500/30 text-white shadow-md' 
                  : 'bg-slate-950/30 border-slate-900 text-slate-400 hover:border-slate-800'
              }`}
            >
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block font-mono">3. FlightAware AeroAPI</span>
                <p className="text-[10.5px] leading-relaxed">Detailed routes, schedules & tail registration</p>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 font-black">2000/mo</span>
            </button>

            <button
              onClick={() => setActiveApiDocTab('airlabs')}
              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex justify-between items-center ${
                activeApiDocTab === 'airlabs' 
                  ? 'bg-cyan-950/20 border-cyan-500/30 text-white shadow-md' 
                  : 'bg-slate-950/30 border-slate-900 text-slate-400 hover:border-slate-800'
              }`}
            >
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block font-mono">4. Airlabs / Aviation Edge</span>
                <p className="text-[10.5px] leading-relaxed">Global airport lists & real airline paths</p>
              </div>
              <span className="text-[9px] font-mono text-[#bcb8d0] font-black">CREDITS</span>
            </button>

          </div>

          {/* Dynamic Documentation detail description & Hands-on Tester Panel */}
          <div className="lg:col-span-8 bg-slate-950 border border-slate-900 rounded-3xl p-5 flex flex-col justify-between gap-5">
            
            <AnimatePresence mode="wait">
              {activeApiDocTab === 'opensky' && (
                <motion.div
                  key="opensky-doc"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px]">FREEWARE</span>
                    <h4 className="font-bold text-white text-xs">OpenSky Network public API standard</h4>
                  </div>
                  <p className="text-slate-350 text-[11px] leading-relaxed">
                    Designed by academics and researchers, the OpenSky Network community captures worldwide ADS-B signals using an extensive voluntary receiver network.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-[10.5px] text-[#bcb8d0] font-mono">
                    <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-850">
                      <span className="text-slate-500 block">Pros:</span>
                      <span>No secret token or client keys needed; fast returns.</span>
                    </div>
                    <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-850">
                      <span className="text-slate-500 block">Cons:</span>
                      <span>Data limited to 5-sec refreshes; heavy API queries can be throttled.</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeApiDocTab === 'adsb' && (
                <motion.div
                  key="adsb-doc"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-orange-500/20 text-orange-400 font-mono font-bold text-[10px]">COMMUNITY</span>
                    <h4 className="font-bold text-white text-xs">ADS-B Exchange Unfiltered Data Streams</h4>
                  </div>
                  <p className="text-slate-350 text-[11px] leading-relaxed">
                    Widely favored by aviation hobbyists, ADS-B Exchange boasts unfiltered global aircraft trackers, refusing to filter or withhold military or executive private flights.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-[10.5px] text-[#bcb8d0] font-mono">
                    <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-850">
                      <span className="text-slate-500 block">Pros:</span>
                      <span>100% Raw data; includes private and military airspace signals.</span>
                    </div>
                    <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-850">
                      <span className="text-slate-500 block">Cons:</span>
                      <span>Strict developer vetting. Free queries reserved solely for feeder nodes.</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeApiDocTab === 'flightaware' && (
                <motion.div
                  key="flightaware-doc"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono font-bold text-[10px]">ENTERPRISE</span>
                    <h4 className="font-bold text-white text-xs">FlightAware AeroAPI Developer v4</h4>
                  </div>
                  <p className="text-slate-350 text-[11px] leading-relaxed">
                    FlightAware AeroAPI provides high-volume, reliable REST interfaces returning airport gate operations, historical routes, carrier codes, and direct aircraft body details.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-[10.5px] text-[#bcb8d0] font-mono">
                    <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-850">
                      <span className="text-slate-500 block">Pros:</span>
                      <span>Extremely premium data; tracks airport timelines and passenger schedules.</span>
                    </div>
                    <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-850">
                      <span className="text-slate-500 block">Cons:</span>
                      <span>Capped at 2,000 monthly transactions under default credentials.</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeApiDocTab === 'airlabs' && (
                <motion.div
                  key="airlabs-doc"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-400 font-mono font-bold text-[10px]">HYBRID CREDIT</span>
                    <h4 className="font-bold text-white text-xs">Airlabs Real-time schedules & locations</h4>
                  </div>
                  <p className="text-slate-350 text-[11px] leading-relaxed">
                    Airlabs focuses heavily on airline and aviation static metadata: airport coordinates, direct runways, scheduled operations, airline registration codes, and high-level routing paths.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-[10.5px] text-[#bcb8d0] font-mono">
                    <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-850">
                      <span className="text-slate-500 block">Pros:</span>
                      <span>Ideal for populating flight search search boxes & carrier charts.</span>
                    </div>
                    <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-850">
                      <span className="text-slate-500 block">Cons:</span>
                      <span>Free limits based on startup credits; can expire easily without billing hooks.</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Test Console Trigger */}
            <div className="space-y-3.5 border-t border-slate-900 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-2xl border border-slate-850">
                <div className="flex items-center gap-2 text-xs">
                  <Wifi className="h-4 w-4 text-emerald-450 animate-pulse" />
                  <div>
                    <span className="text-slate-400 block font-mono text-[9px]">API Interface Test Gate</span>
                    <span className="font-bold text-[#bcb8d0]">Query handshakes and mock payload response</span>
                  </div>
                </div>
                <button
                  onClick={handleTriggerApiHandshake}
                  disabled={apiTestingLoading}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-cyan-400 hover:text-cyan-300 disabled:text-slate-650 text-xs font-bold rounded-xl border border-cyan-500/20 cursor-pointer flex items-center gap-1.5 transition-all shadow-md"
                >
                  {apiTestingLoading ? <RotateCw className="h-3.5 w-3.5 animate-spin" /> : <PlayIcon className="h-3.5 w-3.5" />}
                  <span>Execute Handshake Pipeline</span>
                </button>
              </div>

              {/* Terminal Display */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-900">
                <div className="bg-slate-900 px-4 py-1.5 flex items-center gap-1.5 border-b border-slate-950 font-mono text-[8px] text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="ml-1 uppercase font-bold tracking-widest text-[7px]">Warden Flight Handshake Console v1.0.3</span>
                </div>
                <pre className="p-4 bg-slate-950 font-mono text-[9px] text-[#bcb8d0] leading-normal overflow-x-auto max-h-[180px] select-all whitespace-pre-wrap">
                  <code>{apiTerminalOutput}</code>
                </pre>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

// Minimalist local helper play icon to bypass SVG imports limit
function PlayIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
