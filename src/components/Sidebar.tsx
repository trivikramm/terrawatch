/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Menu, 
  X, 
  Globe, 
  Activity, 
  Sun, 
  Truck, 
  Bot, 
  Network, 
  KeyRound, 
  LogOut,
  Sparkles,
  User,
  ShieldAlert,
  Bell,
  Plane
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  user: { id: string; email: string; name: string } | null;
  onLogout: () => void;
  eqCount: number;
  cargoCount: number;
  theme?: 'light' | 'dark';
}

// Highly operational advanced logo with orbiting indicators
export function TerraWatchLogo({ size = 32 }: { size?: number }) {
  return (
    <div className="relative shrink-0 flex items-center justify-center select-none" style={{ width: size, height: size }}>
      {/* Dynamic atmospheric outer orbit */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full animate-spin"
        style={{ animationDuration: '14s' }}
      >
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="var(--brand-normal)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="15 30 15 30"
          className="opacity-70"
        />
        <circle cx="50" cy="8" r="2.5" fill="var(--brand-normal)" />
      </svg>
      {/* Tectonic / Seismic wave ring (reverse rotate) */}
      <svg
        viewBox="0 0 100 105"
        className="absolute inset-0 w-full h-full animate-spin"
        style={{ animationDuration: '8s', animationDirection: 'reverse' }}
      >
        <circle
          cx="50"
          cy="50"
          r="28"
          stroke="var(--accent-turquoise)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="30 15 5 15"
          className="opacity-95"
        />
        {/* Core seismic nodes */}
        <circle cx="50" cy="22" r="3" fill="var(--accent-yellow)" />
        <circle cx="50" cy="78" r="3" fill="var(--accent-yellow)" />
      </svg>
      {/* Glow Center geosphere core */}
      <div className="absolute w-[44%] h-[44%] rounded-full bg-gradient-to-tr from-brand-dark to-brand-normal p-1 shadow-lg shadow-brand-normal/40 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-full h-full text-white animate-pulse" style={{ animationDuration: '3s' }}>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 2a8 8 0 0 1 8 8c0 4.41-3.59 8-8 8s-8-3.59-8-8 3.59-8 8-8zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
          />
        </svg>
      </div>
    </div>
  );
}

export default function Sidebar({
  activeTab,
  onTabChange,
  user,
  onLogout,
  eqCount,
  cargoCount,
  theme = 'dark',
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSidebarDark = theme === 'dark';

  const navItems = [
    { id: 'dashboard', label: 'Operations Command', icon: Globe, count: 0 },
    { id: 'alerts', label: 'Warden Alerts', icon: Bell, count: 0 },
    { id: 'seismic', label: 'Seismic Tectonics', icon: Activity, count: eqCount },
    { id: 'meteo', label: 'Meteorological Lab', icon: Sun, count: 0 },
    { id: 'airspace', label: 'Aero & Incident Watch', icon: Plane, count: 0, highlighted: true },
    { id: 'supplyChain', label: 'Crisis Logistics Hub', icon: Truck, count: cargoCount },
    { id: 'chat', label: 'Op Intelligence Liaison', icon: Bot, count: 0, highlighted: true },
    { id: 'federation', label: 'Federated Schema Status', icon: Network, count: 0 },
    { id: 'terminal', label: 'Operator Terminal', icon: KeyRound, count: 0 },
  ];

  const handleSelectTab = (id: string) => {
    onTabChange(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* MOBILE HEADER BAR */}
      <div className={`lg:hidden ${
        isSidebarDark 
          ? 'bg-slate-950 border-b border-slate-900 text-slate-100' 
          : 'bg-white border-b border-slate-200 text-slate-800'
      } flex items-center justify-between p-3 sticky top-0 z-[1001] w-full transition-colors duration-300`}>
        <div className="flex items-center gap-3">
          {/* Menu button is now on the left, before the app name */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isSidebarDark 
                ? 'hover:bg-slate-900 text-slate-400 hover:text-white' 
                : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
            }`}
            id="mobile-menu-toggle-btn"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          
          <div className="flex items-center gap-2">
            <TerraWatchLogo size={24} />
            <h1 className={`text-sm font-black tracking-tight uppercase flex items-center gap-1 select-none ${
              isSidebarDark ? 'text-white' : 'text-slate-900'
            }`}>
              TERRAWATCH <span className="text-brand-normal font-bold">AI</span>
            </h1>
          </div>
        </div>

        {/* Alerts / Bell Indicator on the right side */}
        <div className={`flex items-center gap-2 ${isSidebarDark ? 'text-slate-400' : 'text-slate-550'}`} id="header-alerts-section">
          {eqCount > 0 && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-450 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
          <Bell className="h-5 w-5 animate-pulse" />
        </div>
      </div>

      {/* MOBILE NAV SLIDEOUT OVERLAY */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[1002] transition-opacity"
        />
      )}

      {/* MOBILE DRAWER */}
      <aside className={`lg:hidden fixed top-0 left-0 h-full w-[270px] z-[1003] flex flex-col justify-between p-4 transform transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        isSidebarDark 
          ? 'bg-slate-950 border-r border-slate-900 text-slate-200' 
          : 'bg-white border-r border-slate-200 text-slate-800 shadow-xl'
      }`}>
        <div className="space-y-6">
          <div className={`flex items-center justify-between pb-4 border-b ${
            isSidebarDark ? 'border-slate-900' : 'border-slate-100'
          }`}>
            <div className="flex items-center gap-2">
              <TerraWatchLogo size={26} />
              <h2 className={`font-black tracking-wide text-xs uppercase select-none ${
                isSidebarDark ? 'text-white' : 'text-slate-900'
              }`}>Telemetry Node V4</h2>
            </div>
            <button onClick={() => setMobileOpen(false)} className={isSidebarDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}>
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between p-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    isActive
                      ? isSidebarDark 
                        ? 'bg-slate-900 text-white border-slate-800 font-extrabold'
                        : 'bg-slate-100 text-slate-900 border-slate-200 font-extrabold'
                      : isSidebarDark
                        ? 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/50'
                        : 'text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4.5 w-4.5 ${
                      isActive 
                        ? isSidebarDark ? 'text-cyan-400' : 'text-cyan-600'
                        : isSidebarDark ? 'text-slate-500' : 'text-slate-400'
                    }`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count > 0 && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold border ${
                      isSidebarDark 
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}>
                      {item.count}
                    </span>
                  )}
                  {item.highlighted && !isActive && (
                    <Sparkles className="h-3 w-3 text-indigo-400 animate-pulse shrink-0 fill-indigo-400" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User state in sidebar bottom */}
        <div className={`pt-4 border-t space-y-2.5 ${
          isSidebarDark ? 'border-slate-900' : 'border-slate-100'
        }`}>
          {user ? (
            <div className={`flex items-center justify-between p-2 rounded-xl border text-[11px] ${
              isSidebarDark 
                ? 'bg-slate-900 border-slate-850 text-slate-300' 
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold font-mono text-[10px] ${
                  isSidebarDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-105 bg-emerald-500/10 text-emerald-600'
                }`}>ON</div>
                <span className="truncate max-w-[130px] font-bold">{user.name}</span>
              </div>
              <button onClick={onLogout} className={isSidebarDark ? 'text-slate-400 hover:text-red-400' : 'text-slate-500 hover:text-red-600'}>
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className={`flex items-center gap-2 p-2.5 rounded-xl border text-[10px] italic ${
              isSidebarDark 
                ? 'bg-slate-900/40 border-slate-900 text-slate-400' 
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              <ShieldAlert className="h-4 w-4 text-slate-500 shrink-0" />
              <span>Operating in Guest Sandbox. Login at Terminal.</span>
            </div>
          )}
        </div>
      </aside>


      {/* DESKTOP SIDEBAR */}
      <aside className={`hidden lg:flex flex-col justify-between border-r shrink-0 transition-all duration-300 ${
        collapsed ? 'w-[74px] p-2' : 'w-[250px] p-4'
      } ${
        isSidebarDark 
          ? 'bg-slate-950 border-slate-900 text-slate-200' 
          : 'bg-white border-slate-200 text-slate-800'
      } min-h-screen sticky top-0 z-40 transition-colors duration-300`}>
        
        <div className="space-y-6">
          {/* Sidebar header logo */}
          <div className={`flex items-center justify-between pb-3.5 border-b transition-colors ${
            isSidebarDark ? 'border-slate-900' : 'border-slate-100'
          }`}>
            {!collapsed ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCollapsed(true)}
                  className={`p-1 rounded-lg transition-colors cursor-pointer mr-0.5 shrink-0 ${
                    isSidebarDark 
                      ? 'hover:bg-slate-900 text-slate-400 hover:text-white' 
                      : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                  }`}
                  title="Collapse sidebar"
                >
                  <Menu className="h-4.5 w-4.5" />
                </button>
                <div className="flex items-center gap-2.5">
                  <TerraWatchLogo size={32} />
                  <div>
                    <h1 className={`text-sm font-bold tracking-tight uppercase leading-none select-none ${
                        isSidebarDark ? 'text-white' : 'text-slate-900'
                    }`}>TerraWatch <span className="text-brand-normal">AI</span></h1>
                    <p className={`text-[8px] uppercase tracking-wider font-semibold mt-1 ${
                      isSidebarDark ? 'text-slate-500' : 'text-slate-400'
                    }`}>Operations Control</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 w-full">
                <button
                  onClick={() => setCollapsed(false)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isSidebarDark 
                      ? 'hover:bg-slate-900 text-slate-405 hover:text-white' 
                      : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                  }`}
                  title="Expand sidebar"
                >
                  <Menu className="h-4.5 w-4.5" />
                </button>
                <button 
                  onClick={() => setCollapsed(false)}
                  className="mx-auto flex items-center justify-center cursor-pointer hover:opacity-90 active:scale-95 transition-all"
                  title="Expand sidebar"
                >
                  <TerraWatchLogo size={32} />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Items list */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  id={`sidebar-item-${item.id}`}
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-semibold border transition-all cursor-pointer relative group ${
                    isActive
                      ? isSidebarDark 
                        ? 'bg-slate-900 border-slate-800 text-white font-extrabold shadow-sm' 
                        : 'bg-slate-100 border-slate-200 text-slate-950 font-extrabold shadow-sm'
                      : isSidebarDark
                        ? 'text-slate-405 hover:text-white border-transparent hover:bg-slate-900/60'
                        : 'text-slate-500 hover:text-slate-900 border-transparent hover:bg-slate-50'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4.5 w-4.5 transition-colors ${
                      isActive 
                        ? isSidebarDark ? 'text-cyan-400' : 'text-cyan-600'
                        : isSidebarDark ? 'text-slate-500 group-hover:text-slate-350' : 'text-slate-400 group-hover:text-slate-800'
                    }`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!collapsed && item.count > 0 && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold border ${
                      isSidebarDark 
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}>
                      {item.count}
                    </span>
                  )}

                  {!collapsed && item.highlighted && !isActive && (
                    <Sparkles className="h-3 w-3 text-indigo-400 animate-pulse fill-indigo-400 shrink-0" />
                  )}

                  {collapsed && (
                    <div className="absolute left-[80px] bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-lg text-[9px] text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-mono uppercase tracking-widest z-[1500] whitespace-nowrap shadow-2xl">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Fixed user session drawer on desktop sidebar footing */}
        <div className={`pt-4 border-t space-y-3.5 ${
          isSidebarDark ? 'border-slate-900' : 'border-slate-100'
        }`}>
          {!collapsed ? (
            user ? (
              <div className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                isSidebarDark 
                  ? 'bg-slate-900 border-slate-800 text-slate-300' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 shadow-sm'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] font-mono shadow-sm ${
                    isSidebarDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500/10 text-emerald-600'
                  }`}>
                    ON
                  </div>
                  <div className="flex flex-col text-left">
                    <span className={`font-extrabold text-[11px] truncate max-w-[110px] ${
                      isSidebarDark ? 'text-white' : 'text-slate-800'
                    }`}>{user.name}</span>
                    <span className={`text-[9px] truncate max-w-[110px] ${
                      isSidebarDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>{user.email}</span>
                  </div>
                </div>
                <button 
                  onClick={onLogout} 
                  className={`transition-colors p-1 rounded cursor-pointer ${
                    isSidebarDark 
                      ? 'text-slate-400 hover:text-red-400 hover:bg-slate-850' 
                      : 'text-slate-500 hover:text-red-600 hover:bg-slate-200'
                  }`}
                  title="Log out operator session"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => handleSelectTab('terminal')}
                className={`flex items-start gap-2 p-2.5 rounded-xl border text-[10px] leading-normal cursor-pointer transition-all ${
                  isSidebarDark 
                    ? 'bg-amber-500/10 hover:bg-indigo-500/10 border-amber-500/20 text-slate-400' 
                    : 'bg-amber-500/5 hover:bg-indigo-500/5 border-amber-500/10 text-slate-600 dark:text-slate-500'
                }`}
                title="Log in operator terminal"
              >
                <ShieldAlert className="h-4.5 w-4.5 text-amber-500 mt-0.5 shrink-0 animate-pulse" />
                <p>Operating under Guest Session. Click to authorize warden passkey.</p>
              </div>
            )
          ) : (
            user ? (
              <button 
                onClick={() => handleSelectTab('terminal')}
                className={`h-11 w-11 rounded-xl flex items-center justify-center mx-auto text-emerald-500 animate-pulse cursor-pointer shadow-inner ${
                  isSidebarDark ? 'bg-slate-900 border border-slate-800' : 'bg-slate-50 border border-slate-200'
                }`}
                title="Warden Session Active"
              >
                <User className="h-4.5 w-4.5" />
              </button>
            ) : (
              <button 
                onClick={() => handleSelectTab('terminal')}
                className={`h-11 w-11 rounded-xl flex items-center justify-center mx-auto text-amber-500 animate-pulse cursor-pointer ${
                  isSidebarDark ? 'bg-slate-900 border border-slate-800' : 'bg-slate-50 border border-slate-200'
                }`}
                title="Login to Authorized Controller"
              >
                <ShieldAlert className="h-4.5 w-4.5" />
              </button>
            )
          )}
          
          {/* Toggle sidebar width icon at the very footer */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full text-center text-[10px] font-mono tracking-widest uppercase cursor-pointer py-1 block active:scale-95 ${
              isSidebarDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-800'
            }`}
          >
            {collapsed ? '▶' : '◀ Collapse'}
          </button>
        </div>

      </aside>
    </>
  );
}
