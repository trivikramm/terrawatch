/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import L from 'leaflet';
import { 
  Truck, 
  Warehouse, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  TrendingUp, 
  ChevronRight, 
  CornerDownRight, 
  PlusCircle, 
  Activity, 
  Sparkles, 
  ShieldAlert,
  Loader2,
  Globe
} from 'lucide-react';

interface WarehouseInstance {
  id: string;
  name: string;
  location: string;
  lat: number;
  lon: number;
  generators?: number;
  waterContainers?: number;
  rations?: number;
  medicalKits?: number;
  supplies?: {
    generators: number;
    waterContainers: number;
    rations: number;
    medicalKits: number;
  };
}

interface CargoTransit {
  id: string;
  cargoName: string;
  warehouseId: string;
  destination: string;
  status: 'In Transit' | 'Delayed' | 'Rerouted' | 'Delivered';
  lat: number;
  lon: number;
  riskLevel: 'low' | 'medium' | 'high';
  notifiedHazard: string;
}

interface DisasterLogisticsProps {
  token: string | null;
  onDispatchTriggered?: () => void;
}

export default function DisasterLogistics({ token, onDispatchTriggered }: DisasterLogisticsProps) {
  const [warehouses, setWarehouses] = useState<WarehouseInstance[]>([]);
  const [cargoTransits, setCargoTransits] = useState<CargoTransit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states for Dispatch
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [cargoType, setCargoType] = useState('Critical Plasma & Trauma Rations');
  const [cargoQty, setCargoQty] = useState('200 Kits');
  const [destinationNode, setDestinationNode] = useState('');
  const [destLat, setDestLat] = useState('13.08');
  const [destLon, setDestLon] = useState('80.27');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Threat Sim states
  const [selectedCargoId, setSelectedCargoId] = useState('');
  const [simThreatType, setSimThreatType] = useState('Tectonic Rupture');
  const [simRiskLevel, setSimRiskLevel] = useState<'medium' | 'high'>('high');
  const [simHazardMessage, setSimHazardMessage] = useState('Nearby M6.4 earthquake compromise main bridge network on Sector 4.');
  const [isSimulating, setIsSimulating] = useState(false);

  // Fetch both datasets
  const fetchLogisticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [whRes, cargoRes] = await Promise.all([
        fetch('/api/logistics/warehouses'),
        fetch('/api/logistics/cargo')
      ]);
      if (!whRes.ok || !cargoRes.ok) {
        throw new Error('Logistics subnet report communication failed.');
      }
      const whData = await whRes.json();
      const cargoData = await cargoRes.json();
      setWarehouses(whData);
      setCargoTransits(cargoData);

      if (whData.length > 0 && !selectedWarehouseId) {
        setSelectedWarehouseId(whData[0].id);
      }
      if (cargoData.length > 0 && !selectedCargoId) {
        setSelectedCargoId(cargoData[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to establish contact with emergency logistics ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogisticsData();
  }, []);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const warehouseMarkersRef = useRef<L.Marker[]>([]);
  const cargoMarkersRef = useRef<L.CircleMarker[]>([]);
  const routesRef = useRef<L.Polyline[]>([]);

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

  useEffect(() => {
    if (!mapContainerRef.current || warehouses.length === 0) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [warehouses[0].lat, warehouses[0].lon],
        zoom: 3,
        minZoom: 1.5,
        attributionControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous elements
    warehouseMarkersRef.current.forEach((m) => m.remove());
    warehouseMarkersRef.current = [];

    cargoMarkersRef.current.forEach((m) => m.remove());
    cargoMarkersRef.current = [];

    routesRef.current.forEach((m) => m.remove());
    routesRef.current = [];

    // Custom Warehouse Icon
    const customWhIcon = L.divIcon({
      className: 'bg-transparent',
      html: `
        <div class="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600 border border-indigo-400 text-white shadow-lg">
          <svg style="width:16px;height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21h18M3 10l9-7 9 7v11H3V10z"/>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    // Plot Warehouses
    warehouses.forEach((wh) => {
      const marker = L.marker([wh.lat, wh.lon], { icon: customWhIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:sans-serif;font-size:11px;padding:3px;color:#1e293b;">
          <b style="color:#4f46e5; text-transform:uppercase;">STATION DEPOT: ${wh.name}</b>
          <p style="margin:3px 0 0;font-weight:600;">Location: ${wh.location}</p>
        </div>
      `, { closeButton: false });
      warehouseMarkersRef.current.push(marker);
    });

    // Plot Cargo & Connecting corridors
    cargoTransits.forEach((cargo) => {
      const originWh = warehouses.find((w) => w.id === cargo.warehouseId);
      const color = cargo.riskLevel === 'high' ? '#ef4444' : cargo.riskLevel === 'medium' ? '#f59e0b' : '#10b981';

      if (originWh) {
        // Draw route corridor
        const polyline = L.polyline([[originWh.lat, originWh.lon], [cargo.lat, cargo.lon]], {
          color: color,
          weight: 1.5,
          dashArray: '5, 8',
          opacity: 0.65
        }).addTo(map);
        routesRef.current.push(polyline);
      }

      // Cargo marker
      const circle = L.circleMarker([cargo.lat, cargo.lon], {
        radius: 7,
        fillColor: color,
        color: '#ffffff',
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.7
      }).addTo(map);

      circle.bindPopup(`
        <div style="font-family:sans-serif;font-size:11px;padding:3px;color:#1e293b;">
          <b style="color:${color};text-transform:uppercase;">CARGO: ${cargo.status}</b>
          <div style="font-weight:bold;margin-top:2px;">${cargo.cargoName}</div>
          <p style="margin:3px 0 0;color:#64748b;">Transit Dest: ${cargo.destination}</p>
          ${cargo.notifiedHazard ? `<p style="margin-top:3px;color:#ef4444;font-weight:bold;">⚠️ Hazard: ${cargo.notifiedHazard}</p>` : ''}
        </div>
      `, { closeButton: false });

      cargoMarkersRef.current.push(circle);
    });

    if (warehouses.length > 0) {
      try {
        const bounds = L.latLngBounds(warehouses.map((w) => [w.lat, w.lon]));
        cargoTransits.forEach((c) => bounds.extend([c.lat, c.lon]));
        map.fitBounds(bounds, { padding: [40, 40] });
      } catch (e) {
        console.error('Map fit bounds failed:', e);
      }
    }

  }, [warehouses, cargoTransits]);

  // Dispatch Action
  const handleDispatch = async (e: any) => {
    e.preventDefault();
    if (!destinationNode.trim()) return;

    setIsDispatching(true);
    setDispatchStatus(null);

    const cargoHeading = `${cargoType} (${cargoQty})`;

    try {
      const response = await fetch('/api/logistics/dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          warehouseId: selectedWarehouseId,
          cargoName: cargoHeading,
          destination: destinationNode,
          lat: Number(destLat),
          lon: Number(destLon),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setDispatchStatus({ success: true, message: data.message });
        setDestinationNode('');
        // Re-fetch
        await fetchLogisticsData();
        if (onDispatchTriggered) onDispatchTriggered();
      } else {
        setDispatchStatus({ success: false, message: data.error || 'Dispatch rejected by safety controller.' });
      }
    } catch {
      setDispatchStatus({ success: false, message: 'Focal node connection timed out.' });
    } finally {
      setIsDispatching(false);
    }
  };

  // Sim Hazard Action
  const handleSimulateHazard = async (e: any) => {
    e.preventDefault();
    if (!selectedCargoId) return;

    setIsSimulating(true);
    try {
      const response = await fetch('/api/logistics/simulate-hazard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cargoId: selectedCargoId,
          riskLevel: simRiskLevel,
          hazardMsg: `[Simulated ${simThreatType}] ${simHazardMessage}`,
        }),
      });

      if (response.ok) {
        setSimHazardMessage('');
        await fetchLogisticsData();
        if (onDispatchTriggered) onDispatchTriggered();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const getRiskStyle = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Delayed': return 'text-red-500 bg-red-100 dark:bg-red-950/45 border-red-200 dark:border-red-900';
      case 'Rerouted': return 'text-amber-500 bg-amber-100 dark:bg-amber-950/45 border-amber-200 dark:border-amber-900';
      case 'Delivered': return 'text-emerald-500 bg-emerald-100 dark:bg-emerald-950/45 border-emerald-200 dark:border-emerald-900';
      default: return 'text-cyan-500 bg-cyan-100 dark:bg-cyan-950/45 border-cyan-200 dark:border-cyan-900';
    }
  };

  if (loading && warehouses.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900/10 border border-slate-205 dark:border-slate-850 p-12 rounded-2xl flex flex-col items-center justify-center text-center h-[400px]">
        <Loader2 className="h-8 w-8 text-indigo-505 animate-spin mb-3" />
        <p className="text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400">Loading supply chain telemetry...</p>
        <p className="text-xs text-slate-450 mt-1">Interfacing with National Crisis Depot ledger network</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none max-w-full">
      
      {/* INTRO GRID */}
      <div className="bg-gradient-to-r from-teal-500/10 via-cyan-550/5 to-indigo-500/10 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-base font-black uppercase text-slate-850 dark:text-white flex items-center justify-center md:justify-start gap-2 tracking-tight">
              <Truck className="h-5 w-5 text-teal-500" />
              Emergency Supply Chain & Disaster Logistics Network
            </h2>
            <p className="text-xs text-slate-550 dark:text-slate-400">
              Dual-use command panel overseeing national disaster stock layers, dispatch scheduling, and real-time transit risk mitigation.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
            <div className="text-[10px] font-mono text-slate-300">
              <p className="font-bold">FLEET CORRIDORS</p>
              <p className="text-slate-400 text-[9px]">Active Transits: {cargoTransits.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* DEPOTS STOCKS AND CARGOS */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* INTERACTIVE CARGO ROUTING MAP */}
          <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 p-2 rounded-2xl animate-fade-in">
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-400">
                <Globe className="h-4 w-4 text-indigo-505 animate-pulse" />
                <span>Active Cargo & Depots Router Map</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-bold">{warehouses.length} depots • {cargoTransits.length} transits visible</span>
            </div>
            <div 
              ref={mapContainerRef} 
              className="w-full h-[270px] rounded-xl overflow-hidden shadow-inner z-10 border border-slate-100 dark:border-slate-850" 
            />
          </div>

          {/* DEPOTS STOCKS */}
          <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 p-4 rounded-xl shadow-sm">
            <h3 className="text-xs font-extrabold uppercase text-slate-500 mb-3 flex items-center gap-2 tracking-wider">
              <Warehouse className="h-4 w-4 text-indigo-500" />
              Disaster Storage Nodes (Depots Hub)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {warehouses.map((wh) => (
                <div 
                  key={wh.id}
                  className="bg-slate-50 dark:bg-slate-950/65 border border-slate-150 dark:border-slate-850 rounded-xl p-3.5 space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-750"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{wh.name}</h4>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {wh.location}
                      </p>
                    </div>
                    <span className="text-[9px] font-mono bg-slate-100 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                      {wh.lat.toFixed(1)}°N, {wh.lon.toFixed(1)}°E
                    </span>
                  </div>

                  {/* Stock values breakdown cards */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-white/80 dark:bg-slate-900 p-2 border border-slate-100 dark:border-slate-850 rounded-lg">
                      <p className="text-slate-400 text-[10px]">Generators</p>
                      <p className="font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">{(wh.generators ?? wh.supplies?.generators ?? 0)} units</p>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-900 p-2 border border-slate-100 dark:border-slate-850 rounded-lg">
                      <p className="text-slate-400 text-[10px]">Trauma Kits</p>
                      <p className="font-extrabold text-rose-500 dark:text-rose-400 mt-0.5">{(wh.medicalKits ?? wh.supplies?.medicalKits ?? 0)} packs</p>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-900 p-2 border border-slate-100 dark:border-slate-850 rounded-lg">
                      <p className="text-slate-400 text-[10px]">Rations</p>
                      <p className="font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">{(wh.rations ?? wh.supplies?.rations ?? 0)} crates</p>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-900 p-2 border border-slate-100 dark:border-slate-850 rounded-lg">
                      <p className="text-slate-400 text-[10px]">Potable Water</p>
                      <p className="font-extrabold text-sky-500 dark:text-sky-400 mt-0.5">{(wh.waterContainers ?? wh.supplies?.waterContainers ?? 0)}00L</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVE CARGO CORRIDORS */}
          <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 p-4 rounded-xl shadow-sm">
            <h3 className="text-xs font-extrabold uppercase text-slate-500 mb-3 flex items-center justify-between gap-2 tracking-wider">
              <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-emerald-500" /> Active Cargo Corridors Ledger</span>
              <span className="text-[10px] font-mono text-slate-400">Auto Synced / WebSocket Pushed</span>
            </h3>

            <div className="divide-y divide-slate-150 dark:divide-slate-850/70 border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950/45">
              {cargoTransits.map((cargo) => (
                <div key={cargo.id} className="p-3.5 space-y-2.5 hover:bg-slate-100/50 dark:hover:bg-slate-900/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-slate-800 dark:text-white">{cargo.cargoName}</span>
                        <span className="text-[9px] uppercase font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-850 px-1.5 rounded">
                          {cargo.id}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Warehouse className="h-3 w-3" /> Origin Depot: {cargo.warehouseId} <ChevronRight className="h-3 w-3" /> Dest: <MapPin className="h-3 w-3 mt-0.5 shrink-0" /> <span className="font-semibold text-slate-600 dark:text-slate-350">{cargo.destination}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Risk badge */}
                      <span className={`text-[9px] font-bold uppercase py-0.5 px-1.5 border rounded-md ${getRiskStyle(cargo.riskLevel)}`}>
                        {cargo.riskLevel} hazard
                      </span>

                      {/* Status badge */}
                      <span className={`text-[9px] font-extrabold uppercase py-0.5 px-2.5 border rounded-lg flex items-center gap-1 ${getStatusStyle(cargo.status)}`}>
                        {cargo.status === 'Delayed' && <Clock className="h-3 w-3 animate-spin" />}
                        {cargo.status === 'Rerouted' && <AlertTriangle className="h-3 w-3 text-amber-500 animate-pulse" />}
                        {cargo.status === 'Delivered' && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                        {cargo.status === 'In Transit' && <Truck className="h-3 w-3 animate-bounce" />}
                        {cargo.status}
                      </span>
                    </div>
                  </div>

                  {/* Hazard messages text box if risk is medium/high */}
                  <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-150 dark:border-slate-850 flex items-start gap-2.5 text-[11px] text-slate-650 dark:text-slate-400">
                    <CornerDownRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-700 dark:text-slate-300">
                        {cargo.notifiedHazard}
                      </p>
                      <p className="font-mono text-[9px] text-slate-400 mt-1">
                        GPS Coordinates: {cargo.lat.toFixed(4)}°N , {cargo.lon.toFixed(4)}°E (Enroute Corridor)
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* OPERATIONS CONTROLS COLUMN (Dispatch & Sim) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* DISPATCH SUPPLY COMMAND PANEL */}
          <div className="bg-white dark:bg-slate-900/30 border border-slate-205 dark:border-slate-900 rounded-xl p-4 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-850 pb-2.5">
              <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white flex items-center gap-1.5">
                <PlusCircle className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
                Dispatch Emergency Order
              </h3>
              <p className="text-[10px] text-slate-450 mt-0.5">Authorised route scheduler for emergency fleet items.</p>
            </div>

            <form onSubmit={handleDispatch} className="space-y-3.5 text-xs text-slate-650 dark:text-slate-400">
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-[9px] block text-slate-400">Select Source Depot</label>
                <select
                  id="logistics-source-depot-select"
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-3 rounded-lg text-slate-800 dark:text-white font-semibold focus:outline-none focus:border-indigo-500"
                >
                  {warehouses.map(w => (
                    <option key={w.id} className="bg-white dark:bg-slate-950" value={w.id}>
                      {w.name} ({w.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-[9px] block text-slate-400">Cargo Supply Type</label>
                  <select
                    id="logistics-cargo-type-select"
                    value={cargoType}
                    onChange={(e) => setCargoType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-2.5 rounded-lg text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option className="bg-white dark:bg-slate-950" value="Disaster Power Generators">Generators</option>
                    <option className="bg-white dark:bg-slate-950" value="Potable Water Tanks">Water Tanks</option>
                    <option className="bg-white dark:bg-slate-950" value="Emergency MRE Crates">MRE Crates</option>
                    <option className="bg-white dark:bg-slate-950" value="Critical Trauma Plasma">Trauma Plasma</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-[9px] block text-slate-400">Shipment Volume</label>
                  <input
                    id="logistics-cargo-volume-input"
                    type="text"
                    value={cargoQty}
                    onChange={(e) => setCargoQty(e.target.value)}
                    placeholder="e.g. 50 units"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-2.5 rounded-lg text-slate-800 dark:text-white font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-[9px] block text-slate-400">Crisis Destination Area</label>
                <input
                  id="logistics-destination-input"
                  type="text"
                  value={destinationNode}
                  onChange={(e) => setDestinationNode(e.target.value)}
                  placeholder="e.g. Chennai Disaster Center, Tokyo Shelter"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-3 rounded-lg text-slate-800 dark:text-white font-semibold focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-[8px] block text-slate-500">Destination Lat</label>
                  <input
                    id="logistics-lat-input"
                    type="number"
                    step="0.01"
                    value={destLat}
                    onChange={(e) => setDestLat(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-2.5 rounded-lg text-slate-800 dark:text-white focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-[8px] block text-slate-500">Destination Lon</label>
                  <input
                    id="logistics-lon-input"
                    type="number"
                    step="0.01"
                    value={destLon}
                    onChange={(e) => setDestLon(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-2.5 rounded-lg text-slate-800 dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <button
                id="logistics-dispatch-submit-btn"
                type="submit"
                disabled={isDispatching || !destinationNode}
                className="w-full bg-indigo-650 hover:bg-indigo-600 disabled:bg-indigo-950 text-white border border-indigo-700 py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-wider transition-all cursor-pointer shadow active:scale-95 text-[11px]"
              >
                {isDispatching ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    <span>Transmitting Dispatch Rules...</span>
                  </>
                ) : (
                  <>
                    <Truck className="h-4 w-4" />
                    <span>Approve Operational Dispatch</span>
                  </>
                )}
              </button>

              <AnimatePresence>
                {dispatchStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-3 rounded-lg border text-[11px] leading-relaxed flex items-start gap-2 ${
                      dispatchStatus.success 
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-250 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400'
                        : 'bg-red-50 dark:bg-red-950/20 border-red-250 dark:border-red-900 text-red-800 dark:text-red-400'
                    }`}
                  >
                    <span>{dispatchStatus.success ? '✓' : '⚠'}</span>
                    <p>{dispatchStatus.message}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* ACTIVE DISASTER THREAT INTERCEPT SIMULATOR */}
          <div className="bg-white dark:bg-slate-900/30 border border-slate-205 dark:border-slate-900 rounded-xl p-4 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-850 pb-2.5">
              <h3 className="text-xs font-black uppercase text-slate-850 dark:text-white flex items-center gap-1.5 text-rose-500">
                <ShieldAlert className="h-4.5 w-4.5" />
                Disaster Threat Simulator
              </h3>
              <p className="text-[10px] text-slate-450 mt-0.5">Inject tectonic/cyclone threats against active supply fleet lanes.</p>
            </div>

            {cargoTransits.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic text-center p-4">No active cargo corridors register in track list. Dispatch cargo first.</p>
            ) : (
              <form onSubmit={handleSimulateHazard} className="space-y-3.5 text-xs text-slate-650 dark:text-slate-400">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-[9px] block text-slate-400 font-mono">Select Target Fleet</label>
                  <select
                    id="logistics-sim-cargo-select"
                    value={selectedCargoId}
                    onChange={(e) => setSelectedCargoId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-2.5 rounded-lg text-slate-800 dark:text-white focus:outline-none"
                  >
                    {cargoTransits.map(c => (
                      <option key={c.id} className="bg-white dark:bg-slate-950" value={c.id}>
                        {c.id} - {c.cargoName.slice(0, 24)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold uppercase tracking-wider text-[9px] block text-slate-400">Disruption Wave</label>
                    <select
                      id="logistics-sim-threat-select"
                      value={simThreatType}
                      onChange={(e) => setSimThreatType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 p-2.5 rounded-lg text-slate-800 dark:text-white focus:outline-none select-none"
                    >
                      <option className="bg-white dark:bg-slate-950" value="Tectonic Rupture">Seismic Rupture (M6.5+)</option>
                      <option className="bg-white dark:bg-slate-950" value="Cyclone Outbreak">Cyclone Gale Outbreak</option>
                      <option className="bg-white dark:bg-slate-950" value="Bridge Collapse">Infrastructure Collapse</option>
                      <option className="bg-white dark:bg-slate-950" value="Volcanic Ash Cloud">Tectonic Geothermal Ash</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold uppercase tracking-wider text-[9px] block text-slate-400">Sim Risk Level</label>
                    <select
                      id="logistics-sim-risk-select"
                      value={simRiskLevel}
                      onChange={(e) => setSimRiskLevel(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 p-2.5 rounded-lg text-slate-800 dark:text-white focus:outline-none"
                    >
                      <option className="bg-white dark:bg-slate-950" value="medium">Medium - Force Reroute</option>
                      <option className="bg-white dark:bg-slate-950" value="high">High - Force Temp Delay</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-[9px] block text-slate-400">Threat Advisory Message</label>
                  <textarea
                    id="logistics-sim-message-textarea"
                    rows={2}
                    value={simHazardMessage}
                    onChange={(e) => setSimHazardMessage(e.target.value)}
                    placeholder="Enter precise tectonic plate or storm disruption guidelines..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 p-2.5 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <button
                  id="logistics-simulate-submit-btn"
                  type="submit"
                  disabled={isSimulating || !simHazardMessage}
                  className="w-full bg-rose-650 hover:bg-rose-605 disabled:bg-rose-950 text-white border border-rose-700 py-3.5 px-4 rounded-xl flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider transition-all cursor-pointer shadow active:scale-95 text-[11px]"
                >
                  {isSimulating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Injecting Disruption Wave...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      <span>Inject Disruption Wave</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
