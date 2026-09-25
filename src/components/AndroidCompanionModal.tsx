import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  CheckCircle2, 
  Wifi, 
  BatteryCharging, 
  Battery, 
  Vibrate, 
  ShieldCheck, 
  Terminal, 
  Download, 
  X, 
  ExternalLink, 
  Radio, 
  Share2, 
  Sun,
  Moon
} from 'lucide-react';
import { nativeAndroid, AndroidSystemStatus } from '../services/nativeAndroid';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
  onThemeToggle?: (theme: 'light' | 'dark') => void;
}

export const AndroidCompanionModal: React.FC<AndroidCompanionModalProps> = ({ 
  isOpen, 
  onClose,
  theme = 'dark',
  onThemeToggle
}) => {
  const [status, setStatus] = useState<AndroidSystemStatus | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'haptics' | 'build' | 'permissions'>('overview');
  const [hapticFeedbackMsg, setHapticFeedbackMsg] = useState<string | null>(null);
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!isOpen) return;

    // Register Android hardware back button to close modal
    const unregister = nativeAndroid.registerBackButtonHandler(() => {
      onClose();
      return true;
    });

    nativeAndroid.getDiagnostics().then(setStatus);

    return () => {
      unregister();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const triggerHaptic = async (type: 'light' | 'medium' | 'heavy' | 'warning' | 'success') => {
    if (type === 'warning' || type === 'success') {
      await nativeAndroid.hapticNotification(type);
      setHapticFeedbackMsg(`Triggered ${type.toUpperCase()} notification haptic`);
    } else {
      await nativeAndroid.hapticImpact(type);
      setHapticFeedbackMsg(`Fired ${type.toUpperCase()} impact feedback`);
    }

    setTimeout(() => setHapticFeedbackMsg(null), 2500);
  };

  const handleShare = async () => {
    await nativeAndroid.hapticImpact('light');
    await nativeAndroid.share({
      title: 'TerraWatch AI - Native Android & Market Radar',
      text: 'Monitor real-time seismic, climate, and financial contagion risks on Android.',
      url: window.location.href,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors border ${
          isDark 
            ? 'bg-[#0e1017] border-zinc-800 text-zinc-100 shadow-cyan-950/20' 
            : 'bg-white border-slate-200 text-slate-800 shadow-slate-300/50'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'border-zinc-800 bg-[#131620]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-lg font-bold tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  TerraWatch Android Bridge
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border ${
                  isDark 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {status?.isNative ? 'CAPACITOR NATIVE' : 'HYBRID / PWA READY'}
                </span>
              </div>
              <p className={`text-xs font-mono ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Package: com.terrawatch.ai • Target SDK 34
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              nativeAndroid.hapticImpact('light');
              onClose();
            }}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`flex border-b px-6 ${
          isDark ? 'border-zinc-800 bg-[#10121a]' : 'border-slate-200 bg-slate-100/60'
        }`}>
          {[
            { id: 'overview', label: 'Diagnostics' },
            { id: 'haptics', label: 'Haptic Actuator' },
            { id: 'permissions', label: 'Permissions' },
            { id: 'build', label: 'APK & Gradle' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                nativeAndroid.hapticImpact('light');
                setActiveTab(tab.id as any);
              }}
              className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition cursor-pointer ${
                activeTab === tab.id
                  ? isDark 
                    ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                    : 'border-cyan-600 text-cyan-700 bg-cyan-50 font-bold'
                  : isDark
                    ? 'border-transparent text-zinc-400 hover:text-zinc-200'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`border rounded-xl p-3.5 flex flex-col justify-between ${
                  isDark ? 'bg-[#151822] border-zinc-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`text-xs flex items-center gap-1.5 mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    <Radio className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Platform</span>
                  </div>
                  <div className={`text-sm font-semibold capitalize ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {status?.isNative ? 'Native Android' : 'Android Web / PWA'}
                  </div>
                </div>

                <div className={`border rounded-xl p-3.5 flex flex-col justify-between ${
                  isDark ? 'bg-[#151822] border-zinc-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`text-xs flex items-center gap-1.5 mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Network</span>
                  </div>
                  <div className="text-sm font-semibold text-emerald-500 uppercase font-mono">
                    {status?.networkStatus?.connectionType || 'Connected'}
                  </div>
                </div>

                <div className={`border rounded-xl p-3.5 flex flex-col justify-between ${
                  isDark ? 'bg-[#151822] border-zinc-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`text-xs flex items-center gap-1.5 mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    {status?.isCharging ? (
                      <BatteryCharging className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <Battery className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>Power / Battery</span>
                  </div>
                  <div className={`text-sm font-semibold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {status?.batteryLevel !== undefined
                      ? `${Math.round(status.batteryLevel * 100)}%`
                      : 'AC Connected'}
                  </div>
                </div>

                <div className={`border rounded-xl p-3.5 flex flex-col justify-between ${
                  isDark ? 'bg-[#151822] border-zinc-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`text-xs flex items-center gap-1.5 mb-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    <Vibrate className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Haptics Engine</span>
                  </div>
                  <div className="text-sm font-semibold text-indigo-400 uppercase font-mono">
                    Active (v4)
                  </div>
                </div>
              </div>

              {/* Install PWA / Native Card */}
              {isInstallable && (
                <div className={`p-4 border rounded-xl flex items-center justify-between gap-4 ${
                  isDark ? 'bg-gradient-to-r from-emerald-950/30 to-zinc-900 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <div>
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
                      <Download className="w-4 h-4 text-emerald-500" />
                      Install Direct on Android
                    </h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-emerald-700'}`}>
                      Pin TerraWatch AI to your Android home screen with offline caching.
                    </p>
                  </div>
                  <button
                    onClick={install}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    Install Now
                  </button>
                </div>
              )}

              {/* Share Native button */}
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold border transition cursor-pointer active:scale-98 ${
                    isDark 
                      ? 'bg-[#151822] hover:bg-[#1a1e2b] border-zinc-800 text-zinc-200' 
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                  }`}
                >
                  <Share2 className="w-4 h-4 text-cyan-500" />
                  <span>Android System Share</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'haptics' && (
            <div className="space-y-4">
              <div className={`p-4 border rounded-xl space-y-1 ${
                isDark ? 'bg-[#151822] border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Hardware Vibration & Haptic Tester
                </h3>
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Trigger native Android vibration motor actuators via Capacitor Haptics API.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { type: 'light', label: 'Light Impact', desc: 'Tab & chip clicks' },
                  { type: 'medium', label: 'Medium Impact', desc: 'Card selections' },
                  { type: 'heavy', label: 'Heavy Impact', desc: 'Modal actions' },
                  { type: 'warning', label: 'Warning Pulse', desc: 'Critical alert triggers' },
                  { type: 'success', label: 'Success Haptic', desc: 'Auth & order fills' },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => triggerHaptic(item.type as any)}
                    className={`p-3.5 border rounded-xl text-left transition active:scale-95 cursor-pointer ${
                      isDark
                        ? 'bg-[#151822] hover:bg-[#1b1f2e] border-zinc-800 hover:border-cyan-500/40'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-cyan-500/40 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {item.label}
                      </span>
                      <Vibrate className="w-3.5 h-3.5 text-cyan-500" />
                    </div>
                    <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>

              {hapticFeedbackMsg && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{hapticFeedbackMsg}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div className={`p-4 border rounded-xl space-y-1 ${
                isDark ? 'bg-[#151822] border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2 text-emerald-500 font-semibold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Configured Android Manifest Permissions</span>
                </div>
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Declared in <code className="font-mono text-cyan-500">AndroidManifest.xml</code>.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { perm: 'android.permission.INTERNET', desc: 'Enables live telemetry streaming from USGS and OpenMeteo APIs.' },
                  { perm: 'android.permission.ACCESS_NETWORK_STATE', desc: 'Allows instant offline detection and WebSocket reconnect logic.' },
                  { perm: 'android.permission.VIBRATE', desc: 'Enables tactical tactile vibration feedback for alerts and tremors.' },
                  { perm: 'android.permission.ACCESS_FINE_LOCATION', desc: 'Used for nearby seismic convergence and radar substation locks.' },
                  { perm: 'android.permission.WAKE_LOCK', desc: 'Keeps critical disaster surveillance running during active observation alerts.' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 border rounded-lg flex items-start gap-3 ${
                      isDark ? 'bg-[#151822] border-zinc-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className={`text-xs font-mono font-medium ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>{item.perm}</div>
                      <div className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'build' && (
            <div className="space-y-4">
              <div className={`p-4 border rounded-xl space-y-1 ${
                isDark ? 'bg-[#151822] border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className={`flex items-center gap-2 font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Terminal className="w-4 h-4 text-cyan-500" />
                  <span>Android Build & APK Generation</span>
                </div>
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Compile and export the native Android APK using the generated Gradle project.
                </p>
              </div>

              <div className="space-y-3">
                <div className={`p-3.5 rounded-xl border font-mono text-xs space-y-2 ${
                  isDark ? 'bg-[#090a0f] border-zinc-800 text-zinc-300' : 'bg-slate-900 border-slate-800 text-slate-200'
                }`}>
                  <div className="text-slate-500 font-semibold">// 1. Sync web assets into Android project</div>
                  <div className="text-cyan-400 select-all">npm run build && npx cap sync android</div>
                  
                  <div className="text-slate-500 font-semibold pt-2">// 2. Open project directly in Android Studio</div>
                  <div className="text-cyan-400 select-all">npx cap open android</div>

                  <div className="text-slate-500 font-semibold pt-2">// 3. Or build Debug APK directly via Gradle CLI</div>
                  <div className="text-cyan-400 select-all">cd android && ./gradlew assembleDebug</div>

                  <div className="text-slate-500 font-semibold pt-2">// Output APK location:</div>
                  <div className="text-emerald-400 select-all">android/app/build/outputs/apk/debug/app-debug.apk</div>
                </div>

                <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-500" />
                  <span>The complete native Android project directory is ready at <code className="text-cyan-600 dark:text-cyan-400 font-mono">/android</code></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Android status and theme toggle */}
        <div className={`px-6 py-3 border-t flex items-center justify-between text-xs ${
          isDark ? 'border-zinc-800 bg-[#131620] text-zinc-400' : 'border-slate-200 bg-slate-50 text-slate-600'
        }`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium">Android Runtime Active</span>
            </div>

            {/* Quick theme toggle in modal */}
            {onThemeToggle && (
              <button
                type="button"
                onClick={() => onThemeToggle(isDark ? 'light' : 'dark')}
                className={`ml-2 px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                  isDark
                    ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-amber-400'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                }`}
                title={`Switch to ${isDark ? 'White' : 'Dark'} theme`}
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span className="text-[11px] font-sans font-medium">{isDark ? 'White Theme' : 'Dark Theme'}</span>
              </button>
            )}
          </div>

          <button
            onClick={() => {
              nativeAndroid.hapticImpact('light');
              onClose();
            }}
            className={`px-4 py-1.5 rounded-lg transition font-medium cursor-pointer ${
              isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
            }`}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
