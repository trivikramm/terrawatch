import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { nativeAndroid } from '../services/nativeAndroid';

export interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: (theme: 'light' | 'dark') => void;
  variant?: 'pill' | 'button' | 'sidebar' | 'compact';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onToggle,
  variant = 'pill',
  className = '',
}) => {
  const isDark = theme === 'dark';

  const handleSelect = (newTheme: 'light' | 'dark') => {
    if (newTheme === theme) return;
    try {
      nativeAndroid.hapticImpact('light');
    } catch {
      // ignore
    }
    onToggle(newTheme);
  };

  const toggleDirect = () => {
    handleSelect(isDark ? 'light' : 'dark');
  };

  // Compact single button icon toggle
  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={toggleDirect}
        className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs ${
          isDark
            ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-amber-400 hover:text-amber-300'
            : 'bg-white hover:bg-slate-100 border-slate-200 text-zinc-700 hover:text-zinc-900 shadow-sm'
        } ${className}`}
        title={`Current: ${isDark ? 'Dark Theme' : 'White Theme'}. Click to switch to ${isDark ? 'White' : 'Dark'} theme.`}
        aria-label="Toggle Dark and White theme"
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-zinc-700" />
        )}
      </button>
    );
  }

  // Sidebar dual switch with explicit White & Dark labels
  if (variant === 'sidebar') {
    return (
      <div className={`p-1 rounded-xl border flex items-center justify-between transition-colors ${
        isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-slate-100 border-slate-200'
      } ${className}`}>
        <button
          type="button"
          onClick={() => handleSelect('light')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            !isDark
              ? 'bg-white text-zinc-900 shadow-sm border border-slate-200/80 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Switch to White Theme"
        >
          <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-amber-500' : 'text-zinc-400'}`} />
          <span className="text-[11px] font-sans">White</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelect('dark')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            isDark
              ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700 font-bold'
              : 'text-zinc-500 hover:text-zinc-900'
          }`}
          title="Switch to Dark Theme"
        >
          <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-zinc-400'}`} />
          <span className="text-[11px] font-sans">Dark</span>
        </button>
      </div>
    );
  }

  // Icon Button with text description
  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={toggleDirect}
        className={`px-3 py-1.5 rounded-xl border transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 text-xs font-semibold ${
          isDark
            ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-200 shadow-sm'
            : 'bg-white hover:bg-slate-50 border-slate-200 text-zinc-800 shadow-sm'
        } ${className}`}
        title={`Current: ${isDark ? 'Dark Theme' : 'White Theme'}. Click to switch.`}
        aria-label="Toggle Dark and White theme"
      >
        {isDark ? (
          <>
            <Moon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-sans text-[11px]">Dark Theme</span>
          </>
        ) : (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-sans text-[11px]">White Theme</span>
          </>
        )}
      </button>
    );
  }

  // Default: Prominent Pill Switcher with both "White" and "Dark" tabs visible
  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-xl border transition-colors ${
        isDark
          ? 'bg-zinc-900/90 border-zinc-800'
          : 'bg-slate-100/90 border-slate-200 shadow-inner'
      } ${className}`}
      role="group"
      aria-label="Theme selector"
    >
      <button
        type="button"
        onClick={() => handleSelect('light')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer ${
          !isDark
            ? 'bg-white text-zinc-900 shadow-sm border border-slate-200/80 font-bold'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
        title="Switch to White Theme"
      >
        <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-amber-500 animate-spin_slow' : 'text-zinc-400'}`} />
        <span className="text-[11px]">White</span>
      </button>

      <button
        type="button"
        onClick={() => handleSelect('dark')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer ${
          isDark
            ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700 font-bold'
            : 'text-zinc-500 hover:text-zinc-900'
        }`}
        title="Switch to Dark Theme"
      >
        <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-zinc-400'}`} />
        <span className="text-[11px]">Dark</span>
      </button>
    </div>
  );
};

export default ThemeToggle;
