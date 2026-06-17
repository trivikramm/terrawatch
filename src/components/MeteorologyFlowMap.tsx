/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import L from 'leaflet';
import { WeatherData } from '../types';
import { 
  Wind, 
  Thermometer, 
  Droplets, 
  Sun, 
  Gauge, 
  Cloud, 
  Activity, 
  MapPin, 
  Sliders, 
  Layers, 
  HelpCircle, 
  Play, 
  Pause,
  RotateCcw,
  Zap,
  Radio,
  Clock,
  Compass,
  Download,
  Database,
  Terminal as TerminalIcon,
  ChevronsRight
} from 'lucide-react';

const MAP_STYLES = [
  { id: 'hybrid', label: '🛰️ Satellite Hybrid', url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}' },
  { id: 'satellite', label: '🌍 Pure Satellite', url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}' },
  { id: 'terrain', label: '🏔️ Google Terrain', url: 'https://mt1.google.com/vt/lyrs=t,r&x={x}&y={y}&z={z}' },
  { id: 'topo', label: '🗺️ OpenTopo', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' },
  { id: 'dark', label: '🌌 Cyber Dark', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' },
  { id: 'voyager', label: '📊 Vector Light', url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png' }
] as const;

interface MeteorologyFlowMapProps {
  weather: WeatherData;
  theme?: 'light' | 'dark';
  wsConnected?: boolean;
  microShifts?: {
    windShift: number;
    gustShift: number;
    pressureShift: number;
  };
}

// Particle class for Wind flow waves and AQI smog
class FlowParticle {
  x: number = 0;
  y: number = 0;
  prevX: number = 0;
  prevY: number = 0;
  age: number = 0;
  life: number = 0;
  speedMultiplier: number = 1;
  color: string = '#22d3ee';
  size: number = 1.2;
  isGust: boolean = false;

  constructor(width: number, height: number, color: string, isGust = false) {
    this.reset(width, height, color, isGust);
    this.age = Math.random() * this.life;
  }

  reset(width: number, height: number, color: string, isGust = false) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.prevX = this.x;
    this.prevY = this.y;
    this.life = 60 + Math.random() * 90;
    this.age = 0;
    this.color = color;
    this.size = isGust ? 2.5 : (0.8 + Math.random() * 1.0);
    this.isGust = isGust;
  }

  update(
    width: number, 
    height: number, 
    vx: number, 
    vy: number, 
    color: string
  ) {
    this.prevX = this.x;
    this.prevY = this.y;
    
    // Smooth step integration
    this.x += vx;
    this.y += vy;
    this.age++;

    // Boundaries wrap around
    if (this.x < 0 || this.x > width || this.y < 0 || this.y > height || this.age >= this.life) {
      this.reset(width, height, color, this.isGust);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.size;
    ctx.lineCap = 'round';
    
    ctx.moveTo(this.prevX, this.prevY);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();

    if (this.isGust) {
      ctx.beginPath();
      ctx.fillStyle = '#f59e0b';
      ctx.arc(this.x, this.y, this.size * 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Particle class for Rain Simulation
class RainParticle {
  x: number = 0;
  y: number = 0;
  vy: number = 0;
  vx: number = 0;
  length: number = 0;
  opacity: number = 0;

  constructor(width: number, height: number) {
    this.reset(width, height);
    this.y = Math.random() * height; // scatter vertically at start
  }

  reset(width: number, height: number) {
    this.x = Math.random() * width;
    this.y = -20;
    this.vy = 8 + Math.random() * 6;
    this.vx = -1.5 - Math.random() * 2.0; // matching default wind draft
    this.length = 10 + Math.random() * 12;
    this.opacity = 0.15 + Math.random() * 0.45;
  }

  update(width: number, height: number, windSpeedX: number) {
    this.y += this.vy;
    this.x += (this.vx + windSpeedX * 0.4);

    if (this.y > height || this.x < -20 || this.x > width + 20) {
      this.reset(width, height);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(56, 189, 248, ${this.opacity})`;
    ctx.lineWidth = 1.2;
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.vx * 0.5, this.y + this.length);
    ctx.stroke();
  }
}

// Thermal bubble class for rising warm air plumes
class ThermalBubble {
  x: number = 0;
  y: number = 0;
  radius: number = 4;
  vx: number = 0;
  vy: number = 0;
  opacity: number = 1;
  life: number = 0;
  age: number = 0;

  constructor(cx: number, cy: number, maxRadius: number) {
    this.reset(cx, cy, maxRadius);
  }

  reset(cx: number, cy: number, maxRadius: number) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * maxRadius * 0.8;
    this.x = cx + Math.cos(angle) * distance;
    this.y = cy + Math.sin(angle) * distance;
    
    this.radius = 3 + Math.random() * 6;
    this.vx = (Math.random() * 0.5 - 0.25);
    this.vy = -(0.5 + Math.random() * 1.5); // Rising plumes
    
    this.life = 50 + Math.random() * 60;
    this.age = 0;
    this.opacity = 0.1 + Math.random() * 0.45;
  }

  update(cx: number, cy: number, maxRadius: number) {
    this.x += this.vx;
    this.y += this.vy;
    this.age++;
    this.opacity = Math.max(0, (1 - this.age / this.life) * 0.5);
  }

  draw(ctx: CanvasRenderingContext2D, color: string) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.globalAlpha = this.opacity;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0; // reset
  }
}

export default function MeteorologyFlowMap({ 
  weather, 
  theme = 'dark',
  wsConnected = false,
  microShifts = { windShift: 0, gustShift: 0, pressureShift: 0 }
}: MeteorologyFlowMapProps) {
  const [streamPackets, setStreamPackets] = useState<{ id: string; time: string; wind: string; gust: string; press: string; status: string }[]>([]);

  useEffect(() => {
    if (!microShifts) return;
    if (microShifts.windShift === 0 && microShifts.gustShift === 0 && microShifts.pressureShift === 0) return;
    
    const stamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const id = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newPacket = {
      id,
      time: stamp,
      wind: `${microShifts.windShift >= 0 ? '+' : ''}${microShifts.windShift.toFixed(2)}`,
      gust: `${microShifts.gustShift >= 0 ? '+' : ''}${microShifts.gustShift.toFixed(2)}`,
      press: `${microShifts.pressureShift >= 0 ? '+' : ''}${microShifts.pressureShift.toFixed(3)}`,
      status: wsConnected ? 'SUCCESS' : 'STALE'
    };
    setStreamPackets((prev) => [newPacket, ...prev].slice(0, 4));
  }, [microShifts, wsConnected]);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const weatherMarkerRef = useRef<L.Marker | null>(null);

  // Time-Lapse active cycle states - 24Hr clock (Enterprise temporal forecasting)
  const [isPlayingTimeline, setIsPlayingTimeline] = useState<boolean>(true);
  const [timelineHour, setTimelineHour] = useState<number>(12); // Noon standard start

  // Tab controller for externalized stream and matrices
  const [activeMeteoTab, setActiveMeteoTab] = useState<'coordinates' | 'matrices'>('coordinates');

  // Master Override Playground State
  const [useSandbox, setUseSandbox] = useState<boolean>(false);
  const [sandboxWindSpeed, setSandboxWindSpeed] = useState<number>(weather.current.wind_speed);
  const [sandboxWindDeg, setSandboxWindDeg] = useState<number>(weather.current.wind_deg);
  const [sandboxTemp, setSandboxTemp] = useState<number>(weather.current.temp);
  const [sandboxHumidity, setSandboxHumidity] = useState<number>(weather.current.humidity);
  const [sandboxUvi, setSandboxUvi] = useState<number>(weather.current.uvi);
  const [sandboxAqi, setSandboxAqi] = useState<number>(weather.aqi.aqi);
  const [sandboxPressure, setSandboxPressure] = useState<number>(weather.current.pressure);
  const [sandboxClouds, setSandboxClouds] = useState<number>(weather.current.clouds);

  // Console active system log messages for enterprise feel
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'Initializing tactical synoptic weather radar...',
    'Synced with coordinate loops successfully.',
    'Ready for diagnostic telemetry analyses.'
  ]);

  // Particle Density Multiplier State to make it super customizable
  const [particleDensity, setParticleDensity] = useState<number>(120);

  // Active map custom styled format
  const [activeStyle, setActiveStyle] = useState<string>('hybrid');

  // Layer switches states
  const [layers, setLayers] = useState({
    all: true,
    wind: true,
    thermal: true,
    humidity: false,
    aqi: false,
    uv: false,
    pressure: true,
    clouds: false,
    rain: true,
  });

  // Inject Leaflet CSS stylesheet dynamically if missing (Crucial inside sandbox viewframes)
  useEffect(() => {
    const selector = 'link[href*="leaflet"]';
    const existing = document.querySelector(selector);
    if (!existing) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.id = 'leaflet-core-stylesheet';
      document.head.appendChild(link);
    }
  }, []);

  // DIURNAL TIME-LAPSE STEP ENGINE: Adjust values over hours to simulate organic weather drift
  useEffect(() => {
    if (!isPlayingTimeline) return;

    const timer = setInterval(() => {
      setTimelineHour((prev) => (prev + 1) % 24);
    }, 2800); // Shift simulated forecast hour every 2.8 seconds

    return () => clearInterval(timer);
  }, [isPlayingTimeline]);

  // Compute meteorological variations based on current diurnal hours automatically
  const computeTimeShiftedValue = (base: number, config: { amp: number; offset: number; factor: number }) => {
    const angle = ((timelineHour - config.offset) * 2 * Math.PI) / 24;
    return base + Math.sin(angle) * config.amp + (Math.cos(angle * 2) * config.factor);
  };

  // Drifting weather variables based on diurnal timeline hours
  const liveHourWindSpeed = computeTimeShiftedValue(weather.current.wind_speed, { amp: 2.2, offset: 6, factor: 0.5 });
  const liveHourWindDeg = Math.floor(computeTimeShiftedValue(weather.current.wind_deg, { amp: 25, offset: 12, factor: 8 }) + 360) % 360;
  const liveHourTemp = computeTimeShiftedValue(weather.current.temp, { amp: 4.5, offset: 14, factor: -1.0 });
  const liveHourHumidity = Math.max(0, Math.min(100, computeTimeShiftedValue(weather.current.humidity, { amp: 14, offset: 2, factor: 3 })));
  const liveHourUvi = Math.max(0, timelineHour >= 6 && timelineHour <= 18 ? Math.max(0, 10 - Math.abs(timelineHour - 12) * 1.5) : 0);
  const liveHourPressure = computeTimeShiftedValue(weather.current.pressure, { amp: 3.5, offset: 18, factor: 1.0 });

  // Resolve active states taking Sandbox Overrides OR Diurnal Time-Lapse into account
  const wind_speed = useSandbox ? sandboxWindSpeed : liveHourWindSpeed;
  const wind_deg = useSandbox ? sandboxWindDeg : liveHourWindDeg;
  const temp = useSandbox ? sandboxTemp : liveHourTemp;
  const humidity = useSandbox ? sandboxHumidity : liveHourHumidity;
  const uvi = useSandbox ? sandboxUvi : liveHourUvi;
  const aqi_val = useSandbox ? sandboxAqi : weather.aqi.aqi;
  const pressure = useSandbox ? sandboxPressure : liveHourPressure;
  const clouds = useSandbox ? sandboxClouds : weather.current.clouds;

  // Add system terminal diagnostic prints
  const pushLog = (msg: string) => {
    const stamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTerminalLogs((prev) => [`[${stamp}] ${msg}`, ...prev].slice(0, 5));
  };

  // Re-log state shifts on parameters modifications
  useEffect(() => {
    pushLog(`Synoptic updates: Wind vectors recalculating for Heading ${wind_deg.toFixed(0)}° at Velocities of ${wind_speed.toFixed(1)} m/s.`);
  }, [wind_deg, wind_speed]);

  // Leaflet Base Map rendering with beautiful custom CSS styling injectors
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

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
      const map = L.map(container, {
        center: [weather.lat, weather.lon],
        zoom: 3,
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: true,
      });

      // Choose base tile standard dynamically based on user format selector selection
      const styleConfig = MAP_STYLES.find((s) => s.id === activeStyle) || MAP_STYLES[0];

      const tileOptions: L.TileLayerOptions = {
        maxZoom: 20,
      };
      if (activeStyle === 'topo') {
        tileOptions.subdomains = 'abc';
      }

      L.tileLayer(styleConfig.url, tileOptions).addTo(map);

      // Setup clean tactical cyber scale grid
      L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

      mapInstanceRef.current = map;

    } catch (err) {
      console.error('Leaflet map loading error:', err);
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
  }, [weather.lat, weather.lon, activeStyle]);

  // Update weather station map cursor
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (weatherMarkerRef.current) {
      map.removeLayer(weatherMarkerRef.current);
    }

    const customIcon = L.divIcon({
      className: 'meteorology-radar-pin-pulse',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute h-14 w-14 animate-ping bg-emerald-500/10 rounded-full border border-emerald-500/20"></div>
          <div class="absolute h-8 w-8 animate-pulse bg-cyan-400/20 rounded-full border border-cyan-400/40"></div>
          <div class="h-6 w-6 rounded-full border-2 border-slate-900 bg-slate-950 shadow-2xl flex items-center justify-center select-none text-[8px] font-black text-cyan-400">
            MET
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const marker = L.marker([weather.lat, weather.lon], { icon: customIcon })
      .addTo(map)
      .bindPopup(`
        <div class="p-3 bg-slate-950 border border-slate-800 text-white rounded-lg font-sans w-[220px]">
          <h4 class="text-xs font-black text-cyan-400 border-b border-slate-900 pb-1.5 flex items-center gap-1.5 uppercase">
            <Radio class="h-3.5 w-3.5 animate-pulse text-cyan-400" /> W.A.R. Telemetry Pin
          </h4>
          <div class="mt-2 space-y-1 text-[10px] font-mono text-slate-350">
            <div class="flex justify-between"><span>STATION:</span> <span class="text-white font-sans font-bold">${weather.city}</span></div>
            <div class="flex justify-between"><span>LATITUDE:</span> <span>${weather.lat.toFixed(4)}° N</span></div>
            <div class="flex justify-between"><span>LONGITUDE:</span> <span>${weather.lon.toFixed(4)}° E</span></div>
            <div class="flex justify-between"><span>DIURNAL HR:</span> <span class="text-amber-450">${timelineHour}:00</span></div>
          </div>
        </div>
      `, { className: 'tactical-geojson-popup' });

    weatherMarkerRef.current = marker;
  }, [weather.lat, weather.lon, weather.city, timelineHour, mapInstanceRef.current]);

  // Master Fluid Canvas Dynamics Loop (Curves, vortices, Coriolis swirls, raindrop splashes)
  useEffect(() => {
    const canvas = canvasRef.current;
    const map = mapInstanceRef.current;
    if (!canvas || !map) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fluid container sizing observer
    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Initialize customized wind stream particle vectors
    const windColor = theme === 'light' ? 'rgba(6, 182, 212, 0.55)' : 'rgba(34, 211, 238, 0.7)';
    const particlesList: FlowParticle[] = [];
    for (let i = 0; i < particleDensity; i++) {
      particlesList.push(new FlowParticle(canvas.width, canvas.height, windColor));
    }

    // Quick fast gust vectors
    const excessGusts = Math.floor(wind_speed * 1.5);
    for (let i = 0; i < excessGusts; i++) {
      particlesList.push(new FlowParticle(canvas.width, canvas.height, 'rgba(245, 158, 11, 0.8)', true));
    }

    // Initialize physical rainfall streaks
    const rainParticles: RainParticle[] = [];
    const maxRainCount = Math.floor((clouds / 100) * 80 + (humidity / 100) * 120);
    for (let i = 0; i < maxRainCount; i++) {
      rainParticles.push(new RainParticle(canvas.width, canvas.height));
    }

    // Initialize rising convective heat plumes
    const thermals: ThermalBubble[] = [];
    const maxThermals = Math.max(10, Math.floor(temp * 1.2));

    // Dynamic angles and wave cycle oscillations
    let uvPulseAngle = 0;
    let smogAngle = 0;
    let rainSplashes: Array<{ x: number; y: number; s: number; l: number }> = [];

    // Frame Renderer
    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Wipe frame clean to overlay smoothly above GIS scale
      ctx.clearRect(0, 0, w, h);

      // Coordinate pinpoint pixel transformation
      const pointLatLng = L.latLng(weather.lat, weather.lon);
      const pixelPoint = map.latLngToContainerPoint(pointLatLng);
      const cx = pixelPoint.x;
      const cy = pixelPoint.y;

      const currentZoom = map.getZoom();
      const zoomFactor = Math.max(0.2, currentZoom / 5.5);
      const dynamicRadius = Math.min(w, h) * 0.42 * zoomFactor;

      // RENDER LAYER A: THERMAL HEAT PLUMES
      if (layers.all || layers.thermal) {
        let heatGradTheme = 'rgba(244, 63, 94, 0.12)'; // Chilly soft purple-rose base
        let thermalAccentColor = 'rgba(244, 63, 94, 0.45)';
        if (temp >= 32) {
          heatGradTheme = 'rgba(239, 68, 68, 0.18)'; // Fierce orange-crimson
          thermalAccentColor = 'rgba(239, 68, 68, 0.55)';
        } else if (temp >= 20) {
          heatGradTheme = 'rgba(245, 158, 11, 0.15)'; // Radiant gold
          thermalAccentColor = 'rgba(245, 158, 11, 0.5)';
        } else if (temp >= 10) {
          heatGradTheme = 'rgba(16, 185, 129, 0.13)'; // Clean temperate emerald
          thermalAccentColor = 'rgba(16, 185, 129, 0.45)';
        } else if (temp < 0) {
          heatGradTheme = 'rgba(168, 85, 247, 0.16)'; // Subzero polar violet
          thermalAccentColor = 'rgba(168, 85, 247, 0.55)';
        }

        const heatGradient = ctx.createRadialGradient(cx, cy, 15, cx, cy, dynamicRadius * 1.15);
        heatGradient.addColorStop(0, heatGradTheme);
        heatGradient.addColorStop(0.5, heatGradTheme.replace('0.1', '0.04'));
        heatGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.fillStyle = heatGradient;
        ctx.arc(cx, cy, dynamicRadius * 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Plume simulation
        if (thermals.length < maxThermals) {
          thermals.push(new ThermalBubble(cx, cy, dynamicRadius * 0.8));
        }
        thermals.forEach((tb) => {
          tb.update(cx, cy, dynamicRadius * 0.8);
          tb.draw(ctx, thermalAccentColor);
        });
      }

      // RENDER LAYER B: COGNITIVE PHYSICAL WIND VECTOR FLUID ENGINE
      if (layers.all || layers.wind) {
        // Convert wind degrees to base vector headings
        const defaultAngle = ((wind_deg - 90) * Math.PI) / 180;
        const windBaseVel = Math.max(0.4, wind_speed * 0.95);

        particlesList.forEach((p) => {
          // WIND VECTOR FIELD EQUATIONS:
          // Particles don't just fly straight! They swirl organically around low-pressure storms (cyclonic) or spill outward around high-pressure (anticyclonic).
          const dx = p.x - cx;
          const dy = p.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let vx = Math.cos(defaultAngle) * windBaseVel * 0.45;
          let vy = Math.sin(defaultAngle) * windBaseVel * 0.45;

          // Coriolis vortex perturbations near core coordinate station
          const isLowPressure = pressure < 1013;
          const targetPressIndex = Math.abs(1013 - pressure) / 25; // scaling strength
          const interactRadius = dynamicRadius * 1.35;

          if (dist < interactRadius && targetPressIndex > 0.05) {
            const pullForce = (1 - dist / interactRadius) * targetPressIndex * 1.6;
            
            // Perpendicular swirl vector components (Coriolis Effect)
            const swirlAngle = isLowPressure ? -Math.PI / 2 : Math.PI / 2; // Cyclonic CCW vs Anticyclonic CW
            const swirlX = (-dy / (dist || 1)) * Math.cos(swirlAngle) - (dx / (dist || 1)) * Math.sin(swirlAngle);
            const swirlY = (dx / (dist || 1)) * Math.cos(swirlAngle) - (dy / (dist || 1)) * Math.sin(swirlAngle);

            vx = vx * (1 - pullForce) + swirlX * windBaseVel * pullForce * 1.45;
            vy = vy * (1 - pullForce) + swirlY * windBaseVel * pullForce * 1.45;
          }

          p.update(w, h, vx, vy, windColor);
          p.draw(ctx);
        });
      }

      // RENDER LAYER C: DIGITAL MOISTURE RIPPLES & HUMIDITY PULSES
      if (layers.all || layers.humidity) {
        smogAngle += 0.006;
        const rippleFactor = (humidity / 100);
        const maxConcentric = 3;

        for (let idx = 0; idx < maxConcentric; idx++) {
          const radiusOscillation = (smogAngle * 45 + idx * 75) % (dynamicRadius * 0.95);
          const rawOpacity = 1 - (radiusOscillation / (dynamicRadius * 0.95));
          const opacity = Math.max(0, rawOpacity * rippleFactor * 0.35);

          ctx.beginPath();
          ctx.strokeStyle = `rgba(14, 165, 233, ${opacity})`;
          ctx.lineWidth = 1.4 + rippleFactor * 3.5;
          ctx.arc(cx, cy, radiusOscillation, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // RENDER LAYER D: LOCALIZED RAINDROP STREAMING & LANDFALL SPLASHES
      if ((layers.all || layers.rain) && (clouds > 35 || humidity > 50)) {
        rainParticles.forEach((r) => {
          // Wind vector impact on rain angle
          const defaultWindAngle = ((wind_deg - 90) * Math.PI) / 180;
          const windSpeedX = Math.cos(defaultWindAngle) * wind_speed;
          
          r.update(w, h, windSpeedX);
          r.draw(ctx);

          // Physical floor collision splash check with probability threshold
          if (r.y > h - 15 && Math.random() < 0.12) {
            rainSplashes.push({
              x: r.x,
              y: h - Math.random() * 8,
              s: 1.0,
              l: 12 + Math.random() * 8
            });
          }
        });

        // Draw and update animated floor splash waves representing live ground precipitation
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 0.8;
        rainSplashes.forEach((splash, sIdx) => {
          ctx.beginPath();
          ctx.arc(splash.x, splash.y, splash.s, 0, Math.PI, true);
          ctx.stroke();
          
          splash.s += 0.6; // Splash growing outward
          if (splash.s > splash.l) {
            rainSplashes.splice(sIdx, 1);
          }
        });
      }

      // RENDER LAYER E: ACTINIC SOLAR UV CORONA FILAMENTS
      if (layers.all || layers.uv) {
        uvPulseAngle += 0.016 * Math.max(1, uvi);
        const uviCount = Math.max(8, Math.floor(uvi * 1.5));
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.shadowColor = 'rgba(236, 72, 153, 0.45)';
        ctx.shadowBlur = 12;

        for (let ray = 0; ray < uviCount; ray++) {
          const rotationAngle = (ray * 2 * Math.PI) / uviCount + (uvPulseAngle * 0.04);
          const rayStretch = dynamicRadius * 0.55 * (1 + Math.sin(uvPulseAngle + ray) * 0.14);

          ctx.beginPath();
          const gX = Math.cos(rotationAngle) * rayStretch;
          const gY = Math.sin(rotationAngle) * rayStretch;

          const fillGrd = ctx.createLinearGradient(0, 0, gX, gY);
          fillGrd.addColorStop(0, 'rgba(236, 72, 153, 0.7)'); // Actinic UV rose
          fillGrd.addColorStop(0.5, 'rgba(124, 58, 237, 0.35)'); // Hot violet
          fillGrd.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.strokeStyle = fillGrd;
          ctx.lineWidth = 1.5 + uvi * 0.62;
          ctx.moveTo(0, 0);
          ctx.lineTo(gX, gY);
          ctx.stroke();
        }
        ctx.restore();
      }

      // RENDER LAYER F: AIR ISObar CONTRAST BAROMETRIC VECTORS
      if (layers.all || layers.pressure) {
        const isLowPressure = pressure < 1013;
        const pressureWaves = [0.4, 0.7, 1.05];
        
        pressureWaves.forEach((layerScale, idx) => {
          const r = dynamicRadius * 1.15 * layerScale;
          ctx.beginPath();
          ctx.strokeStyle = isLowPressure ? 'rgba(244, 63, 94, 0.16)' : 'rgba(14, 165, 233, 0.16)';
          ctx.lineWidth = 1.1;
          ctx.setLineDash([8, 12]);
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]); // cleanup

          // Coriolis rotating pressure text labels
          const staticRadAngle = (smogAngle * 0.45 * (isLowPressure ? -1 : 1)) + (idx * Math.PI * 0.65);
          const tx = cx + Math.cos(staticRadAngle) * r;
          const ty = cy + Math.sin(staticRadAngle) * r;

          ctx.save();
          ctx.translate(tx, ty);
          ctx.rotate(staticRadAngle + Math.PI / 2);
          ctx.fillStyle = isLowPressure ? 'rgba(244, 63, 94, 0.8)' : 'rgba(56, 189, 248, 0.8)';
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.fillText(`ISOBAR: ${pressure.toFixed(1)} hPa`, -28, 3);
          ctx.restore();
        });
      }

      // RENDER LAYER G: AIR QUALITY CRITICAL SMOG ORBITS
      if (layers.all || layers.aqi) {
        let smogColor = 'rgba(16, 185, 129, 0.45)';
        if (aqi_val === 5) smogColor = 'rgba(239, 68, 68, 0.75)'; // Hazardous Smog alerts
        else if (aqi_val === 4) smogColor = 'rgba(249, 115, 22, 0.65)';
        else if (aqi_val === 3) smogColor = 'rgba(245, 158, 11, 0.55)';
        else if (aqi_val === 2) smogColor = 'rgba(163, 230, 53, 0.5)';

        const orbitCount = 4;
        const subSmogs = aqi_val * 7;

        for (let layerOrb = 1; layerOrb <= orbitCount; layerOrb++) {
          const radiusSweep = dynamicRadius * 0.22 * layerOrb;
          ctx.beginPath();
          ctx.strokeStyle = smogColor.replace('0.', '0.04');
          ctx.lineWidth = 0.6;
          ctx.arc(cx, cy, radiusSweep, 0, Math.PI * 2);
          ctx.stroke();

          for (let pIdx = 0; pIdx < subSmogs; pIdx++) {
            const rotAngle = (smogAngle * (layerOrb % 2 === 0 ? 1 : -1)) + (pIdx * (Math.PI * 2) / subSmogs);
            const px = cx + Math.cos(rotAngle) * radiusSweep;
            const py = cy + Math.sin(rotAngle) * radiusSweep;

            ctx.beginPath();
            ctx.fillStyle = smogColor;
            ctx.arc(px, py, 1.8 + Math.random() * 1.3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      resizeObserver.disconnect();
    };

  }, [
    weather.lat,
    weather.lon,
    wind_speed,
    wind_deg,
    temp,
    humidity,
    uvi,
    aqi_val,
    pressure,
    clouds,
    layers,
    particleDensity,
    theme,
  ]);

  const toggleLayer = (key: keyof typeof layers) => {
    if (key === 'all') {
      const state = !layers.all;
      setLayers({
        all: state,
        wind: state,
        thermal: state,
        humidity: state,
        aqi: state,
        uv: state,
        pressure: state,
        clouds: state,
        rain: state,
      });
      pushLog(`System overlays ${state ? 'ENABLED' : 'DISABLED'} on synoptic radar.`);
    } else {
      setLayers((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        pushLog(`Layer '${String(key)}' status altered to: ${next[key] ? 'VISIBLE' : 'HIDDEN'}.`);
        return next;
      });
    }
  };

  const getAQIStatusBadge = (val: number) => {
    const dataSet = [
      { text: 'GOOD / SECURE', style: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
      { text: 'MODERATE', style: 'bg-lime-500/10 border-lime-500/30 text-lime-400' },
      { text: 'UNHEALTHY AEROSOL', style: 'bg-amber-500/10 border-amber-500/30 text-amber-500' },
      { text: 'SEVERE HAZARD', style: 'bg-orange-500/10 border-orange-500/30 text-orange-400 font-bold' },
      { text: 'CRITICAL RESPIRATORY WARNING', style: 'bg-red-500/20 border-red-500/40 text-red-400 font-black animate-pulse' }
    ];
    return dataSet[val - 1] || { text: 'BASELINE', style: 'bg-slate-900 border-slate-800 text-slate-400' };
  };

  const aqiBadge = getAQIStatusBadge(aqi_val);

  return (
    <div id="enterprise-meteo-core" className="grid grid-cols-1 xl:grid-cols-12 gap-6 bg-[#0a071b] dark:bg-[#0a071b] border border-cyan-500/15 rounded-3xl p-6 shadow-[0_0_50px_rgba(34,211,238,0.02)] transition-all">
      
      {/* ENTERPRISE TITLE BLOCK */}
      <div className="xl:col-span-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-cyan-500/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <h1 className="text-sm font-black tracking-widest text-cyan-400 uppercase font-sans flex items-center gap-2">
              <Database className="h-4 w-4 text-cyan-400 animate-spin_slow" /> Synoptic Micro-Vortex Flow Analyzer
            </h1>
          </div>
          <p className="text-xs text-[#bcb8d0] font-sans mt-1">
            W.A.R. Climate Warden Terminal: Simulating thermodynamic fluid loops, wind velocities & particulate drifts at focus coordinates.
          </p>
        </div>

        {/* Temporal Playpause controllers */}
        <div className="flex flex-wrap items-center gap-3">
          {/* timeline playing status */}
          <div className="bg-slate-950/85 border border-cyan-500/15 rounded-xl px-3.5 py-1.5 flex items-center gap-3 font-mono text-xs">
            <Clock className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span className="text-[#bcb8d0] font-bold">PROJECTION HOUR:</span>
            <span className="text-amber-400 font-black tracking-wider text-sm">{timelineHour}:00 {timelineHour >= 12 ? 'PM' : 'AM'}</span>
          </div>

          <button
            onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
            className={`p-2 rounded-xl border cursor-pointer hover:scale-105 transition-all text-xs font-bold flex items-center gap-1.5 ${
              isPlayingTimeline 
                ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300' 
                : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'
            }`}
          >
            {isPlayingTimeline ? <Pause className="h-3.5 w-3.5 text-cyan-400" /> : <Play className="h-3.5 w-3.5 text-amber-500" />}
            {isPlayingTimeline ? 'Pause Projection' : 'Play Hourly Evolution'}
          </button>

          <button
            onClick={() => {
              setUseSandbox(!useSandbox);
              pushLog(`Simulation paradigm shifted to: ${!useSandbox ? 'CRUCIAL OVERRIDE SANDBOX' : 'SYNOPTIC DIURNAL TIMELINE'}.`);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              useSandbox 
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                : 'bg-slate-950/80 border-slate-850 text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>{useSandbox ? 'Override Active' : 'Master Sandbox Override'}</span>
          </button>
        </div>
      </div>

      {/* REAL-TIME CLIENT-SERVER TELEMETRY COMPLIANCE AND PACKET LOGS BAR */}
      <div id="synoptic-live-telemetry-synapse" className="xl:col-span-12 bg-slate-950/40 border border-cyan-500/10 rounded-2xl p-4 flex flex-col lg:flex-row gap-5 justify-between items-stretch shadow-inner backdrop-blur-md">
        
        {/* Connection status section */}
        <div className="flex items-center gap-4 border-r border-cyan-500/10 lg:pr-6 shrink-0">
          <div className="relative flex items-center justify-center">
            <span className={`absolute inline-flex h-4 w-4 rounded-full ${wsConnected ? 'bg-[#00f3ff]' : 'bg-rose-500'} opacity-30 ${wsConnected ? 'animate-ping' : ''}`}></span>
            <div className={`h-2.5 w-2.5 rounded-full ${wsConnected ? 'bg-[#00f3ff]' : 'bg-rose-500'} shadow-[0_0_10px_rgba(0,243,255,0.8)]`}></div>
          </div>
          <div>
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 font-mono">
              <Radio className={`h-3 w-3 ${wsConnected ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} /> 
              Telemetry Link: <span className={wsConnected ? 'text-[#00f3ff]' : 'text-[#00f3ff]'}>{wsConnected ? 'ON-AIR / DIRECT' : 'STANDBY'}</span>
            </div>
            <div className="text-[9px] font-mono text-slate-500 mt-0.5 flex items-center gap-2">
              <span>RATE: 2.5 kb/s</span>
              <span>•</span>
              <span className="text-cyan-500/80 animate-pulse">LATENCY: {wsConnected ? `${Math.floor(80 + Math.random() * 40)}ms` : '---'}</span>
            </div>
          </div>
        </div>

        {/* Live Micro-Shifts Oscilloscope visualization */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center px-2 lg:px-4 min-w-[280px]">
          {/* Wind Shift */}
          <div className="space-y-1 bg-slate-950/70 border border-cyan-500/5 rounded-xl px-3 py-1.5 flex flex-col justify-center">
            <div className="flex justify-between items-center text-[8px] font-mono uppercase text-slate-400 tracking-widest">
              <span>Live Wind Drift</span>
              <span className={`font-bold ${microShifts.windShift >= 0 ? 'text-[#00f3ff]' : 'text-rose-400'}`}>
                {microShifts.windShift >= 0 ? '▲' : '▼'}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-xs font-black text-white">
                {microShifts.windShift >= 0 ? '+' : ''}{microShifts.windShift.toFixed(2)} <span className="text-[9px] font-normal text-slate-500">m/s</span>
              </span>
              <div className="w-12 h-1 bg-slate-900 rounded-full overflow-hidden shrink-0">
                <div 
                  className={`h-full rounded-full ${microShifts.windShift >= 0 ? 'bg-cyan-500' : 'bg-rose-500'}`} 
                  style={{ width: `${Math.min(100, Math.floor(Math.abs(microShifts.windShift) * 45))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Gust Shift */}
          <div className="space-y-1 bg-slate-950/70 border border-cyan-500/5 rounded-xl px-3 py-1.5 flex flex-col justify-center">
            <div className="flex justify-between items-center text-[8px] font-mono uppercase text-slate-400 tracking-widest">
              <span>Live Gust Delta</span>
              <span className="font-bold text-amber-500">▲</span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-xs font-black text-white">
                +{microShifts.gustShift.toFixed(2)} <span className="text-[9px] font-normal text-slate-500">m/s</span>
              </span>
              <div className="w-12 h-1 bg-slate-900 rounded-full overflow-hidden shrink-0">
                <div 
                  className="h-full rounded-full bg-amber-500" 
                  style={{ width: `${Math.min(100, Math.floor(microShifts.gustShift * 35))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Pressure Ripple */}
          <div className="space-y-1 bg-slate-950/70 border border-cyan-500/5 rounded-xl px-3 py-1.5 flex flex-col justify-center">
            <div className="flex justify-between items-center text-[8px] font-mono uppercase text-slate-400 tracking-widest">
              <span>Barometric Wave</span>
              <span className={`font-bold ${microShifts.pressureShift >= 0 ? 'text-[#00f3ff]' : 'text-[#818cf8]'}`}>
                ~
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-xs font-black text-white">
                {microShifts.pressureShift >= 0 ? '+' : ''}{microShifts.pressureShift.toFixed(3)} <span className="text-[9px] font-normal text-slate-500">hPa</span>
              </span>
              <div className="w-12 h-1 bg-slate-900 rounded-full overflow-hidden shrink-0">
                <div 
                  className={`h-full rounded-full ${microShifts.pressureShift >= 0 ? 'bg-cyan-400' : 'bg-[#818cf8]'}`} 
                  style={{ width: `${Math.min(100, Math.floor(Math.abs(microShifts.pressureShift) * 150))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Stream Packets Feed Scroll / Ledger */}
        <div className="lg:border-l border-cyan-500/10 lg:pl-6 flex items-center justify-between gap-3 overflow-hidden min-w-[240px]">
          <div className="flex flex-col shrink-0">
            <span className="text-[8px] font-bold text-slate-500 tracking-widest font-mono uppercase">STREAM LEDGER</span>
            <span className="text-[9px] font-black text-cyan-400 font-sans tracking-wide">METEO OVER-THE-AIR</span>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none max-w-[280px]">
            {streamPackets.length === 0 ? (
              <div className="text-[9px] font-mono text-slate-600 animate-pulse">Awaiting live telemetry packet arrival...</div>
            ) : (
              streamPackets.map((pkt) => (
                <div key={pkt.id} className="bg-slate-950/85 border border-cyan-500/10 rounded-lg px-2.5 py-1 text-[8.5px] font-mono flex items-center gap-2 shrink-0 shadow-sm">
                  <span className="text-emerald-400">● {pkt.time}</span>
                  <span className="text-slate-500">PKT-{pkt.id}</span>
                  <span className="text-cyan-400 font-bold">W:{pkt.wind}</span>
                  <span className="text-amber-400 font-bold">G:{pkt.gust}</span>
                  <span className="text-[#818cf8]">P:{pkt.press}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* METEOROLOGY MAIN GIS RADAR INTERACTIVE MAP (SPAN 12) */}
      <div className="xl:col-span-12 flex flex-col gap-4">
        
        {/* Animated Meteorological Control Tabs Section */}
        <div id="meteo-control-deck" className="flex flex-col gap-3.5 bg-slate-950/70 border border-cyan-500/15 p-4 rounded-3xl backdrop-blur-md shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-[10px] uppercase font-black tracking-widest text-[#bcb8d0] font-sans">
                Meteorological Lab Control Deck
              </span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveMeteoTab('coordinates');
                  pushLog("Shifted deck focus to: GIS Geometry Stream coordinates.");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black tracking-wider transition-all cursor-pointer ${
                  activeMeteoTab === 'coordinates'
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.15)] scale-105'
                    : 'bg-slate-950/50 border-slate-850 text-slate-500 hover:text-slate-300'
                }`}
              >
                <Compass className={`h-3.5 w-3.5 ${activeMeteoTab === 'coordinates' ? 'animate-spin_slow text-cyan-400' : 'text-slate-500'}`} />
                <span>🛰️ GIS Geometry Stream</span>
              </button>
              
              <button
                onClick={() => {
                  setActiveMeteoTab('matrices');
                  pushLog("Shifted deck focus to: Active Weather Matrices.");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black tracking-wider transition-all cursor-pointer ${
                  activeMeteoTab === 'matrices'
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.15)] scale-105'
                    : 'bg-slate-950/50 border-slate-850 text-slate-500 hover:text-slate-300'
                }`}
              >
                <Layers className={`h-3.5 w-3.5 ${activeMeteoTab === 'matrices' ? 'animate-pulse text-cyan-400' : 'text-slate-500'}`} />
                <span>📊 Active Weather Matrices</span>
              </button>
            </div>
          </div>

          <div className="relative min-h-[96px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {activeMeteoTab === 'coordinates' ? (
                <motion.div
                  key="gis-coords-stream"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono text-[11px]"
                >
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-cyan-500/10 shadow-lg flex flex-col justify-between">
                    <span className="text-[8px] uppercase font-bold text-slate-500 block mb-1">Target Station</span>
                    <span className="font-sans font-black text-white text-xs truncate">{weather.city}</span>
                  </div>
                  <div className="bg-slate-905/60 p-3 rounded-xl border border-cyan-500/10 shadow-lg flex flex-col justify-between">
                    <span className="text-[8px] uppercase font-bold text-slate-500 block mb-1">GIS Latitude</span>
                    <span className="text-cyan-400 font-bold text-xs">{weather.lat.toFixed(4)}° N</span>
                  </div>
                  <div className="bg-slate-905/60 p-3 rounded-xl border border-cyan-500/10 shadow-lg flex flex-col justify-between">
                    <span className="text-[8px] uppercase font-bold text-slate-500 block mb-1">GIS Longitude</span>
                    <span className="text-cyan-400 font-bold text-xs">{weather.lon.toFixed(4)}° E</span>
                  </div>
                  <div className="bg-slate-905/60 p-3 rounded-xl border border-cyan-500/10 shadow-lg flex flex-col justify-between">
                    <span className="text-[8px] uppercase font-bold text-slate-500 block mb-1">Wind Angle Origin</span>
                    <span className="text-amber-400 font-bold text-xs">{wind_deg.toFixed(0)}° ({getWindDirLabel(wind_deg)})</span>
                  </div>
                  <div className="col-span-2 md:col-span-1 bg-slate-905/60 p-3 rounded-xl border border-cyan-500/10 shadow-lg flex flex-col justify-between flex-1">
                    <span className="text-[8px] uppercase font-bold text-slate-500 block mb-1">Atmospheric Isobar</span>
                    <span className="text-sky-400 font-bold text-xs">{pressure.toFixed(1)} hPa</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="weather-matrices-deck"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3"
                >
                  {/* MASTER TRIGGER & SELECTOR */}
                  <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-900/60 border border-cyan-500/10 p-3 rounded-xl flex flex-col justify-between h-[96px] shadow-lg">
                      <div>
                        <span className="text-[8.5px] uppercase font-black text-cyan-400 block font-mono">Combo Matrix</span>
                        <p className="text-[9px] text-slate-500 leading-normal mt-0.5">Toggle cumulative shaders</p>
                      </div>
                      <label className="flex items-center justify-between text-[10px] text-white font-black cursor-pointer hover:text-cyan-300 select-none">
                        <span className="flex items-center gap-1 font-mono text-[9px]">
                          <span className={`w-1.5 h-1.5 rounded-full ${layers.all ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.7)]' : 'bg-slate-600'}`}></span>
                          COMBINED ALL
                        </span>
                        <input 
                          type="checkbox" 
                          checked={layers.all} 
                          onChange={() => toggleLayer('all')}
                          className="rounded border-slate-800 bg-slate-950 text-cyan-600 focus:ring-cyan-500 h-3.5 w-3.5 cursor-pointer"
                        />
                      </label>
                    </div>

                    <div className="bg-slate-900/60 border border-cyan-500/10 p-3 rounded-xl flex flex-col justify-between h-[96px] shadow-lg">
                      <div>
                        <span className="text-[8.5px] uppercase font-black text-slate-400 block font-mono">Basemap style</span>
                        <p className="text-[9px] text-slate-500 leading-normal mt-0.5">Underlying physical layer</p>
                      </div>
                      <select
                        value={activeStyle}
                        onChange={(e) => {
                          setActiveStyle(e.target.value);
                          pushLog(`Map configuration change: Set basemap style to '${e.target.value}'.`);
                        }}
                        className="w-full bg-slate-950 border border-cyan-500/15 rounded-lg py-1 px-1.5 text-[9px] font-bold text-slate-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
                      >
                        {MAP_STYLES.map((s) => (
                          <option key={s.id} value={s.id} className="bg-slate-950 text-white">
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* HIGH-GRADE BOOLEAN SHADERS */}
                  <div className="md:col-span-8 bg-slate-900/40 border border-cyan-500/10 p-3 rounded-xl shadow-lg">
                    <span className="text-[8.5px] uppercase font-black text-slate-400 block font-mono mb-2">Simulated Kinetic Shaders</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {([
                        { key: 'wind', name: 'Wind Streamlines', icon: <Wind className="h-3 w-3 text-cyan-400" /> },
                        { key: 'thermal', name: 'Thermo convective', icon: <Thermometer className="h-3 w-3 text-rose-455" /> },
                        { key: 'humidity', name: 'Dew Moisture', icon: <Droplets className="h-3 w-3 text-sky-400" /> },
                        { key: 'aqi', name: 'Aerosol AQI Smog', icon: <Activity className="h-3 w-3 text-emerald-400" /> },
                        { key: 'uv', name: 'UV Actinic Corona', icon: <Sun className="h-3 w-3 text-pink-400" /> },
                        { key: 'pressure', name: 'Barometric Isobar', icon: <Gauge className="h-3 w-3 text-blue-400" /> },
                        { key: 'clouds', name: 'Cloud Cover Vecs', icon: <Cloud className="h-3 w-3 text-slate-350" /> },
                        { key: 'rain', name: 'Precip Streams', icon: <ChevronsRight className="h-3 w-3 text-cyan-350" /> },
                      ] as const).map((item) => (
                        <label key={item.key} className="flex items-center justify-between text-[10px] text-[#bcb8d0] hover:text-white cursor-pointer select-none bg-slate-950/40 border border-slate-900 hover:border-cyan-500/10 px-2 py-1.5 rounded-lg transition-all truncate">
                          <span className="flex items-center gap-1.5 font-sans font-medium truncate">
                            {item.icon}
                            <span className="truncate">{item.name}</span>
                          </span>
                          <input 
                            type="checkbox" 
                            checked={layers[item.key]} 
                            onChange={() => toggleLayer(item.key)}
                            className="rounded border-cyan-500/20 bg-slate-955 text-cyan-500 focus:ring-cyan-400 h-3 w-3 cursor-pointer ml-1 text-[9px]"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Radar Viewport layer container */}
        <div className="relative w-full h-[540px] rounded-3xl overflow-hidden border border-cyan-500/10 bg-slate-950 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
          
          {/* Leaflet map base raster */}
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Overlay high performance synoptic vectors */}
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 z-20 pointer-events-none mix-blend-screen"
          />

          {/* Time Projection slider overlap */}
          <div className="absolute bottom-4 left-4 right-4 z-30 bg-slate-950/90 backdrop-blur-md border border-cyan-500/15 rounded-2xl p-4 shadow-3xl text-xs flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-1.5 shrink-0">
              <Clock className="h-4 w-4 text-cyan-400" />
              <span className="font-black text-cyan-400 uppercase tracking-widest text-[9px] font-sans">Timeline slider Projection</span>
            </div>
            
            <div className="flex-1 w-full flex items-center gap-3">
              <span className="font-mono text-[9px] text-slate-500">00:00</span>
              <input 
                type="range"
                min="0"
                max="23"
                value={timelineHour}
                onChange={(e) => {
                  setTimelineHour(parseInt(e.target.value));
                  setIsPlayingTimeline(false); // Stop loop when user manually scrubs
                  pushLog(`Temporal state anchored to direct hour target: ${e.target.value}:00.`);
                }}
                className="flex-1 accent-cyan-450 bg-slate-900 h-1.5 rounded-lg cursor-pointer"
              />
              <span className="font-mono text-[10px] text-cyan-400 font-bold bg-cyan-950/30 px-2 py-0.5 border border-cyan-500/15 rounded">{timelineHour}:00</span>
              <span className="font-mono text-[9px] text-slate-500">23:00</span>
            </div>
          </div>

        </div>

        {/* Dynamic customized physical wind volume slider */}
        <div className="bg-slate-950/40 border border-cyan-500/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <div>
              <p className="text-[10px] font-black uppercase text-white tracking-widest">Fluid Streamline Density</p>
              <p className="text-[8px] text-slate-500 mt-0.5">Control active simulation particles streaming parallelly on tactical viewport canvas.</p>
            </div>
          </div>

          <div className="w-full md:w-[320px] flex items-center gap-3">
            <span className="font-mono text-[9px] text-slate-550">40</span>
            <input 
              type="range"
              min="40"
              max="200"
              value={particleDensity}
              onChange={(e) => {
                setParticleDensity(parseInt(e.target.value));
              }}
              className="flex-1 accent-cyan-400 bg-slate-900 h-1.5 rounded-lg cursor-pointer"
            />
            <span className="font-mono text-xs text-white font-bold bg-slate-950 border border-cyan-500/10 px-2 py-0.5 rounded-md">{particleDensity} vectors</span>
          </div>
        </div>

      </div>

      {/* RIGHT TELEMETRY CONTROL OVERLOAD DECKS (SPAN 12 - BELOW THE MAP) */}
      <div className="xl:col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">

        {/* COLUMN 1: LIVE SENSOR READOUTS */}
        <div className="flex flex-col gap-6">
          {/* ACTIVE SENSORS DIGITAL METRICS READOUT DECK */}
        <div className="bg-[#141125] border border-cyan-500/10 rounded-3xl p-5 shadow-2xl flex flex-col justify-between gap-4 min-h-[340px]">
          <div>
            <div className="flex items-center justify-between border-b border-cyan-500/5 pb-3">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#bcb8d0] flex items-center gap-1.5">
                <Radio className="h-4 w-4 text-cyan-400 animate-pulse" /> Stream telemetry live
              </span>
              <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-md font-mono font-bold animate-pulse">
                SYS_ONLINE
              </span>
            </div>
            
            <p className="text-xs text-[#bcb8d0] mt-3 leading-relaxed">
              Synthesized synoptic sensors reading digital micro-shifts at Coordinates:
              <span className="font-mono font-black text-cyan-400"> {weather.city}</span>.
            </p>
          </div>

          <div className="space-y-3.5 my-1">
            {/* WIND STREAM DIRECTION ALIGNMENT */}
            <div className="flex items-center justify-between bg-slate-950/40 border border-cyan-500/5 p-2.5 rounded-2xl">
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-cyan-400" />
                <div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Wind Velocity & Mag</p>
                  <p className="text-xs font-black text-white font-mono mt-0.5">{wind_speed.toFixed(1)} m/s <span className="text-slate-400 font-sans font-medium">({wind_deg.toFixed(0)}° {getWindDirLabel(wind_deg)})</span></p>
                </div>
              </div>
              {/* COMPASS COMPACT CIRCULAR INDICATOR */}
              <div className="h-10 w-10 rounded-full border border-cyan-500/25 relative flex items-center justify-center bg-slate-950">
                <div className="absolute inset-1.5 border border-dashed border-cyan-500/10 rounded-full"></div>
                <div 
                  className="w-1 bg-cyan-400 h-4 rounded absolute top-1 pivot-origin-bottom"
                  style={{ transform: `rotate(${wind_deg}deg)`, transformOrigin: 'bottom center' }}
                />
                <span className="text-[7px] font-black text-slate-500 absolute bottom-1">N</span>
              </div>
            </div>

            {/* TEMP READOUT */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/40 border border-cyan-500/5 p-2.5 rounded-2xl">
                <p className="text-[8px] text-slate-500 font-bold uppercase">Thermal Energy</p>
                <p className="text-sm font-black text-rose-400 mt-1 font-mono">{temp.toFixed(1)}°C</p>
              </div>

              <div className="bg-slate-950/40 border border-cyan-500/5 p-2.5 rounded-2xl">
                <p className="text-[8px] text-slate-500 font-bold uppercase">Humidity vapour</p>
                <p className="text-sm font-black text-sky-400 mt-1 font-mono">{humidity.toFixed(0)}%</p>
              </div>
            </div>

            {/* ACTINIC UV AND SOLID PRESSURES */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/40 border border-cyan-500/5 p-2.5 rounded-2xl">
                <p className="text-[8px] text-slate-500 font-bold uppercase">Solar Actinic UV</p>
                <p className="text-sm font-black text-pink-400 mt-1 font-mono">UVI {uvi.toFixed(1)}</p>
              </div>

              <div className="bg-slate-950/40 border border-cyan-500/5 p-2.5 rounded-2xl">
                <p className="text-[8px] text-slate-500 font-bold uppercase">Clouds density</p>
                <p className="text-sm font-black text-slate-300 mt-1 font-mono">{clouds}% Cover</p>
              </div>
            </div>

            {/* AIR VALUE QUALITY HIGHLIGHT */}
            <div className="bg-slate-950/40 border border-cyan-500/5 p-2.5 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[8px] text-slate-500 font-bold uppercase">Air Quality PM2.5 Grid</p>
                <p className="text-[10px] font-black text-white font-mono mt-0.5">WHO Tier Rank: {aqi_val}</p>
              </div>
              <span className={`text-[8px] border px-2 py-0.5 rounded font-black tracking-wider ${aqiBadge.style}`}>
                {aqiBadge.text}
              </span>
            </div>
          </div>

          <div className="bg-cyan-500/5 border border-cyan-500/10 p-3 rounded-2xl text-[9px] text-[#bcb8d0] font-sans leading-relaxed">
            <span className="font-black text-cyan-400 flex items-center gap-1 uppercase mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              Live Synoptic Feed Synced
            </span>
            Canvas shaders update dynamically on map coordinates. Time projection is fully calibrated.
          </div>
        </div>

        </div>

        {/* COLUMN 2: OVERRIDES AND DIAGNOSTIC LOGS */}
        <div className="flex flex-col gap-6">
          {/* INTERACTIVE STATE SLIDERS (IF OVERRIDE MODE ENABLED) */}
          {useSandbox && (
          <div id="simulation-slider-control-deck" className="bg-[#141125] border border-amber-500/15 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2.5 border-b border-amber-500/10">
              <span className="text-[10px] font-black uppercase text-amber-500 flex items-center gap-1.5">
                <Sliders className="h-4 w-4 animate-pulse" /> Sandbox Command Slate
              </span>
              <button
                onClick={() => {
                  setSandboxWindSpeed(weather.current.wind_speed);
                  setSandboxWindDeg(weather.current.wind_deg);
                  setSandboxTemp(weather.current.temp);
                  setSandboxHumidity(weather.current.humidity);
                  setSandboxUvi(weather.current.uvi);
                  setSandboxAqi(weather.aqi.aqi);
                  setSandboxPressure(weather.current.pressure);
                  setSandboxClouds(weather.current.clouds);
                  setUseSandbox(false);
                  pushLog('Sandbox configurations purges; aligned coordinates back to Live Radar feed.');
                }}
                className="text-[9px] uppercase font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 px-2 h-6 rounded-md hover:bg-amber-500/20 cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="h-3 w-3" /> Reset Coords
              </button>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal">
              You hold Climate Master command clearance. Drag metrics directly to synthesize climate extremes and stress test radar dynamics.
            </p>

            <div className="space-y-3.5 mt-2">
              
              {/* Wind Speed */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold">
                  <span className="text-slate-400">Wind stream velocity</span>
                  <span className="font-mono text-amber-450">{sandboxWindSpeed.toFixed(1)} m/s</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="45"
                  step="0.5"
                  value={sandboxWindSpeed}
                  onChange={(e) => {
                    setSandboxWindSpeed(parseFloat(e.target.value));
                    pushLog(`Overrode wind speed to ${e.target.value} m/s.`);
                  }}
                  className="w-full accent-amber-500 bg-slate-900 h-1 px-0.5 rounded cursor-pointer"
                />
              </div>

              {/* Wind Deg */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold">
                  <span className="text-slate-400">Wind degrees angular heading</span>
                  <span className="font-mono text-amber-450">{sandboxWindDeg}° N-E</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="360"
                  value={sandboxWindDeg}
                  onChange={(e) => {
                    setSandboxWindDeg(parseInt(e.target.value));
                    pushLog(`Overrode wind direction to ${e.target.value}°.`);
                  }}
                  className="w-full accent-amber-500 bg-slate-900 h-1 px-0.5 rounded cursor-pointer"
                />
              </div>

              {/* Temperatures */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold">
                  <span className="text-slate-400">Thermal heat indicator</span>
                  <span className="font-mono text-amber-450">{sandboxTemp.toFixed(1)} °C</span>
                </div>
                <input 
                  type="range"
                  min="-20"
                  max="52"
                  step="0.5"
                  value={sandboxTemp}
                  onChange={(e) => {
                    setSandboxTemp(parseFloat(e.target.value));
                    pushLog(`Overrode thermal index to ${e.target.value}°C.`);
                  }}
                  className="w-full accent-amber-500 bg-slate-900 h-1 px-0.5 rounded cursor-pointer"
                />
              </div>

              {/* Rain levels proxy: Clouds */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold">
                  <span className="text-slate-400">Rain & Clouds vapor Cover</span>
                  <span className="font-mono text-amber-450">{sandboxClouds}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={sandboxClouds}
                  onChange={(e) => {
                    setSandboxClouds(parseInt(e.target.value));
                    pushLog(`Overrode atmospheric clouds cover to ${e.target.value}%.`);
                  }}
                  className="w-full accent-amber-500 bg-slate-900 h-1 px-0.5 rounded cursor-pointer"
                />
              </div>

              {/* Barometric Pressure */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold">
                  <span className="text-slate-400">Atmospheric air Isobars weighting</span>
                  <span className="font-mono text-amber-450">{sandboxPressure} hPa</span>
                </div>
                <input 
                  type="range"
                  min="960"
                  max="1040"
                  value={sandboxPressure}
                  onChange={(e) => {
                    setSandboxPressure(parseInt(e.target.value));
                    pushLog(`Overrode barometric isobars weight to ${e.target.value} hPa.`);
                  }}
                  className="w-full accent-amber-500 bg-slate-900 h-1 px-0.5 rounded cursor-pointer"
                />
              </div>

              {/* UV index */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold">
                  <span className="text-slate-400">Solar UV Radiation index</span>
                  <span className="font-mono text-amber-450">UVI {sandboxUvi.toFixed(1)}</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="15"
                  step="0.2"
                  value={sandboxUvi}
                  onChange={(e) => {
                    setSandboxUvi(parseFloat(e.target.value));
                    pushLog(`Overrode UV Actinic level to ${e.target.value}.`);
                  }}
                  className="w-full accent-amber-500 bg-slate-900 h-1 px-0.5 rounded cursor-pointer"
                />
              </div>

            </div>
          </div>
        )}

        {/* REGIONAL LOGS - REAL-TIME DIAGNOSTIC DECK TYPE */}
        <div className="bg-[#141125] border border-cyan-500/10 rounded-3xl p-5 space-y-3.5">
          <span className="text-[10px] font-black uppercase text-[#bcb8d0] flex items-center gap-1.5 font-sans">
            <TerminalIcon className="h-4 w-4 text-cyan-400" /> Active System Diagnostic Log
          </span>
          <div className="bg-slate-950/70 rounded-2xl p-3 border border-cyan-500/5 min-h-[110px] flex flex-col justify-end">
            <div className="space-y-1.5 mt-1 font-mono text-[9px] text-cyan-300">
              {terminalLogs.map((log, lIdx) => (
                <div key={lIdx} className="opacity-90 flex items-start gap-1 leading-normal">
                  <span className="text-cyan-500 select-none">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        </div>

        {/* COLUMN 3: SYSTEM REFERENCE LEGENDS */}
        <div className="flex flex-col gap-6">
          {/* DETAILED PHYSICS WAVEFORM LEGENDS - DETAILED MATHEMATICAL READOUT */}
          <div id="detailed-synoptic-legend" className="bg-[#141125] border border-cyan-500/10 rounded-3xl p-5 space-y-4">
          <span className="text-[10px] font-black uppercase text-cyan-400 flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-cyan-450 animate-pulse" /> Advanced Waves Synoptic Legend
          </span>
          
          <div className="text-[10px] text-slate-400 space-y-3 font-sans leading-relaxed">
            <div className="pb-2 border-b border-cyan-500/5">
              <p className="font-bold text-white flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>Wind Vector streamlines</p>
              <p className="text-[9px] text-[#bcb8d0] mt-0.5">Synthesizes particle speed paths. Velocity controls trailing vector lifetimes, Coriolis algorithms draw curves swirling clockwise or counter-clockwise according to sea weights.</p>
            </div>

            <div className="pb-2 border-b border-cyan-500/5">
              <p className="font-bold text-white flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>Thermo Convective plumes</p>
              <p className="text-[9px] text-[#bcb8d0] mt-0.5">Colors range from icy violet (temperatures below 0°C) to extreme golden-crimson (above 32°C). Rising convective heat bubbles trace core up-drafts.</p>
            </div>

            <div className="pb-2 border-b border-cyan-500/5">
              <p className="font-bold text-white flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-350"></span>Cloud Rain Splashback</p>
              <p className="text-[9px] text-[#bcb8d0] mt-0.5">Precipitation particles fall along vertical axis. Falling velocities depend on cloud thickness vectors, triggering concentric ground rings on landfall splashes.</p>
            </div>

            <div className="pb-2 border-b border-cyan-500/5">
              <p className="font-bold text-white flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>Actinic UV Radiation rays</p>
              <p className="text-[9px] text-[#bcb8d0] mt-0.5">Triggers pink radial filaments of actinic wavelengths blasting outward from coordinate center, changing corona sizes according to simulated solar angle.</p>
            </div>

            <div>
              <p className="font-bold text-white flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>Smog haze systems</p>
              <p className="text-[9px] text-[#bcb8d0] mt-0.5">Particulate dust orbits representing WHO quality tiers. Higher smog causes dense particulate haze blockages, warning operator safety.</p>
            </div>
          </div>
        </div>

        </div>

      </div>

    </div>
  );
}

// Compact helper to identify compass headings from wind degrees
function getWindDirLabel(deg: number) {
  const headings = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.floor((deg + 11.25) / 22.5) % 16;
  return headings[index];
}
