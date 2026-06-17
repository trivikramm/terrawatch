/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import L from 'leaflet';
import { 
  KeyRound, 
  Mail, 
  UserPlus, 
  LogIn, 
  User, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  Loader2,
  Globe,
  Server
} from 'lucide-react';

interface OperatorTerminalProps {
  token: string | null;
  user: { id: string; email: string; name: string } | null;
  onAuthSuccess: (token: string, user: { id: string; email: string; name: string }) => void;
  onLogout: () => void;
}

export default function OperatorTerminal({ token, user, onAuthSuccess, onLogout }: OperatorTerminalProps) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const gatewayMapRef = useRef<HTMLDivElement>(null);
  const gatewayMapInstRef = useRef<L.Map | null>(null);

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
    if (!gatewayMapRef.current) return;

    if (!gatewayMapInstRef.current) {
      const map = L.map(gatewayMapRef.current, {
        center: [30.0, -10.0],
        zoom: 1,
        minZoom: 1,
        maxZoom: 5,
        attributionControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map);

      gatewayMapInstRef.current = map;

      const centralHub: [number, number] = [64.1466, -21.9426];
      const perimeterNodes: { name: string; pos: [number, number] }[] = [
        { name: 'Seattle Node A', pos: [47.6062, -122.3321] },
        { name: 'Kochi Terminal B', pos: [9.9312, 76.2673] },
        { name: 'Yokohama Core C', pos: [35.4437, 139.6380] },
        { name: 'Anchorage Outpost D', pos: [61.2181, -149.9003] },
        { name: 'Christchurch Vault E', pos: [-43.5321, 172.6362] }
      ];

      L.circleMarker(centralHub, {
        radius: 8,
        fillColor: '#10b981',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map).bindPopup('<b>REYKJAVIK FEDERATION VAULT (PRIMARY)</b><br>State: Sync-Active', { closeButton: false });

      perimeterNodes.forEach((node) => {
        L.circleMarker(node.pos, {
          radius: 5,
          fillColor: '#06b6d4',
          color: '#ffffff',
          weight: 1,
          opacity: 0.9,
          fillOpacity: 0.65
        }).addTo(map).bindPopup(`<b>GATEWAY NODE: ${node.name}</b><br>Protocol: TLS 1.3 Active`, { closeButton: false });

        L.polyline([centralHub, node.pos], {
          color: '#06b6d4',
          weight: 1,
          dashArray: '3, 6',
          opacity: 0.5
        }).addTo(map);
      });
    }
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('All credential corridors must be populated.');
      return;
    }

    setLoading(true);
    const endpoint = isLoginView ? '/api/auth/login' : '/api/auth/register';
    const payload = isLoginView ? { email, password } : { email, password, name };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Authorization rejected.');
      }

      if (isLoginView) {
        setSuccessMsg('Session approved. Core access active.');
        // Notify parent
        onAuthSuccess(data.token, data.user);
      } else {
        setSuccessMsg('Operator register approval registered. Switch to login corridor.');
        setIsLoginView(true);
        setPassword('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Federated Auth Gate returned unauthorized status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch my-6" id="operator-terminal-grid-root">
      
      {/* LEFT FORM COLUMN */}
      <div className="md:col-span-5 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 shadow-sm select-none animate-fade-in w-full flex flex-col justify-center">
      
      <AnimatePresence mode="wait">
        {token && user ? (
          /* LOGGED IN SCREEN */
          <motion.div
            key="logged-in-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 text-center"
          >
            <div className="relative inline-flex items-center justify-center p-4 bg-emerald-500/10 rounded-full border border-emerald-500/30 text-emerald-500 mx-auto">
              <ShieldCheck className="h-10 w-10 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Terminal Access Approved</h3>
              <p className="text-xs text-slate-500">You are securely connected to the central climate telemetry nodes.</p>
            </div>

            {/* Operator specs */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-xl text-left text-xs font-mono text-slate-600 dark:text-slate-400 space-y-2">
              <div className="flex justify-between border-b border-slate-200/55 dark:border-slate-850/60 pb-1.5">
                <span>OPERATOR NAME:</span>
                <span className="font-bold text-slate-800 dark:text-white uppercase">{user.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/55 dark:border-slate-850/60 pb-1.5">
                <span>ACCESS CORRIDOR:</span>
                <span className="text-cyan-400 font-bold">{user.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/55 dark:border-slate-850/60 pb-1.5">
                <span>SECURITY KEY:</span>
                <span className="text-amber-500 font-bold">HS256 JWT Signed</span>
              </div>
              <div className="flex justify-between">
                <span>DATABASE PERSISTENCE:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>ONLINE</span>
              </div>
            </div>

            <button
              id="terminal-auth-logout-btn"
              onClick={onLogout}
              className="w-full bg-slate-900 hover:bg-slate-850 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-white py-3 px-4 rounded-xl font-bold uppercase text-[10px] tracking-widest cursor-pointer transition-all active:scale-95 shadow"
            >
              Sever Security Session Link (Log Out)
            </button>
          </motion.div>
        ) : (
          /* LOGIN / REGISTER SCREEN */
          <motion.div
            key="logged-out-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            <div className="text-center space-y-1">
              <div className="inline-flex p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-555 mb-2.5">
                <KeyRound className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-black uppercase text-slate-800 dark:text-white tracking-widest">
                {isLoginView ? 'Operations Security Gateway' : 'Create Operator Profile'}
              </h3>
              <p className="text-[10px] text-slate-450 leading-relaxed">
                {isLoginView 
                  ? 'Sign in using credentials to access emergency dispatch authority.' 
                  : 'Register a node warden account securely with client password encryption.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-650 dark:text-slate-400">
              
              {!isLoginView && (
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-[9px] block text-slate-450">Full Operator Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      id="auth-name-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Chief Warden"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 py-3 pl-10 pr-3 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                      required={!isLoginView}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-[9px] block text-slate-450">Operator Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    id="auth-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. warden@terrawatch.gov"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 py-3 pl-10 pr-3 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-[9px] block text-slate-450">Warden Passkey</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    id="auth-pass-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 py-3 pl-10 pr-3 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                id="auth-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-650 hover:bg-indigo-600 disabled:bg-indigo-950 text-white border border-indigo-700 py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-wider transition-all cursor-pointer shadow active:scale-95 text-[10px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    <span>Cryptographic verify in process...</span>
                  </>
                ) : (
                  <>
                    {isLoginView ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                    <span>{isLoginView ? 'Approve Terminal Session' : 'Approve Profile Creation'}</span>
                  </>
                )}
              </button>

              {/* Status and Errors blocks */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-3 rounded-lg text-red-800 dark:text-red-400 flex items-start gap-2 text-[11px]"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p>{errorMsg}</p>
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900 p-3 rounded-lg text-emerald-800 dark:text-emerald-400 flex items-start gap-2 text-[11px]"
                  >
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <p>{successMsg}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Toggler */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginView(!isLoginView);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-[11px] text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold underline focus:outline-none cursor-pointer"
                >
                  {isLoginView ? "Don't have an operator profile? Create one now" : 'Already have an operator profile? Authenticate'}
                </button>
              </div>

            </form>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* RIGHT NETWORK DIAGRAM MAP COLUMN */}
      <div className="md:col-span-7 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 rounded-2xl p-4 shadow-sm animate-fade-in flex flex-col min-h-[400px]">
        <div className="p-3 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-400">
            <Globe className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span>Central Telemetry Gateway Router Map</span>
          </div>
          <span className="text-[9px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 px-1 py-0.5 rounded font-mono font-bold">5 Nodes Linked</span>
        </div>
        
        <div className="flex-1 p-2 flex flex-col justify-between">
          <div 
            ref={gatewayMapRef} 
            className="w-full h-[280px] rounded-xl overflow-hidden shadow-inner border border-slate-150 dark:border-slate-850 z-10 animate-fade-in mt-3" 
          />
          <div className="mt-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150 dark:border-slate-850 text-left">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-800 dark:text-white">
              <Server className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span>Federated Protocol Diagnostics</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
              All client operations terminals establish a secure peer channel to the central repository and replicate alert logs using a signed HS256 WebSocket tunnel of climate sensor arrays.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
