import React from 'react';
import { 
  Globe, 
  TrendingUp, 
  Activity, 
  Bell, 
  Smartphone,
  Sun,
  Moon
} from 'lucide-react';
import { nativeAndroid } from '../services/nativeAndroid';

interface AndroidBottomNavProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  onOpenAndroidCompanion: () => void;
  alertCount?: number;
  eqCount?: number;
  theme?: 'light' | 'dark';
  onThemeToggle?: (theme: 'light' | 'dark') => void;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenAndroidCompanion,
  alertCount = 0,
  eqCount = 0,
  theme = 'dark',
  onThemeToggle,
}) => {
  const isDark = theme === 'dark';

  const navItems = [
    { id: 'dashboard', label: 'Command', icon: Globe, badge: 0 },
    { id: 'market', label: 'Market', icon: TrendingUp, badge: 0, glow: true },
    { id: 'seismic', label: 'Seismic', icon: Activity, badge: eqCount },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: alertCount },
  ];

  const handleTabClick = (tabId: string) => {
    nativeAndroid.hapticImpact('light');
    onTabChange(tabId);
  };

  const handleAndroidClick = () => {
    nativeAndroid.hapticImpact('medium');
    onOpenAndroidCompanion();
  };

  const handleThemeSwitch = () => {
    if (onThemeToggle) {
      nativeAndroid.hapticImpact('light');
      onThemeToggle(isDark ? 'light' : 'dark');
    }
  };

  return (
    <nav
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 pb-safe transition-colors duration-200 ${
        isDark 
          ? 'bg-[#090a0f]/95 border-t border-zinc-800/80 backdrop-blur-md text-zinc-100' 
          : 'bg-white/95 border-t border-slate-200 backdrop-blur-md shadow-lg text-slate-800'
      }`}
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-14 px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 relative transition-all active:scale-95 cursor-pointer ${
                isActive
                  ? isDark ? 'text-cyan-400 font-medium' : 'text-cyan-600 font-bold'
                  : isDark 
                    ? 'text-zinc-400 hover:text-zinc-200' 
                    : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-cyan-500' : ''}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
                {item.glow && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight truncate max-w-[64px] ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
              )}
            </button>
          );
        })}

        {/* Android Native Hub Button */}
        <button
          onClick={handleAndroidClick}
          className={`flex-1 flex flex-col items-center justify-center py-1 relative transition-all active:scale-95 group cursor-pointer ${
            isDark ? 'text-zinc-400 hover:text-emerald-400' : 'text-slate-500 hover:text-emerald-600'
          }`}
          title="Open Android Native Hub"
        >
          <div className="relative p-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 group-hover:bg-emerald-500/20 transition">
            <Smartphone className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight text-emerald-600 dark:text-emerald-400 font-mono font-medium">
            Android
          </span>
        </button>

        {/* Quick Theme Switch Button in Mobile Bottom Nav */}
        {onThemeToggle && (
          <button
            onClick={handleThemeSwitch}
            className={`flex-1 flex flex-col items-center justify-center py-1 relative transition-all active:scale-95 cursor-pointer ${
              isDark ? 'text-amber-400 hover:text-amber-300' : 'text-zinc-700 hover:text-zinc-900'
            }`}
            title={`Switch to ${isDark ? 'White' : 'Dark'} theme`}
          >
            <div className="p-1 rounded-full transition">
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-700" />
              )}
            </div>
            <span className="text-[9px] mt-0.5 tracking-tight font-medium">
              {isDark ? 'White' : 'Dark'}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
};
