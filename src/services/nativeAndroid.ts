import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Device, DeviceInfo } from '@capacitor/device';
import { Network, ConnectionStatus } from '@capacitor/network';

export interface AndroidSystemStatus {
  isNative: boolean;
  platform: 'android' | 'ios' | 'web';
  deviceInfo: DeviceInfo | null;
  networkStatus: ConnectionStatus | null;
  batteryLevel?: number;
  isCharging?: boolean;
}

class NativeAndroidService {
  private initialized = false;
  private backButtonCallbacks: Array<() => boolean> = [];

  public isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  public isAndroid(): boolean {
    return Capacitor.getPlatform() === 'android';
  }

  public getPlatform(): 'android' | 'ios' | 'web' {
    const p = Capacitor.getPlatform();
    if (p === 'android') return 'android';
    if (p === 'ios') return 'ios';
    return 'web';
  }

  /**
   * Initializes native Android plugins (StatusBar, Splash, Listeners)
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    if (this.isNative()) {
      try {
        // Configure Native Android Status Bar
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#0B0F19' });
      } catch (e) {
        console.warn('Native StatusBar init skipped:', e);
      }

      try {
        // Hide Splash Screen after layout is ready
        setTimeout(async () => {
          try {
            await SplashScreen.hide();
          } catch {}
        }, 800);
      } catch (e) {
        console.warn('Native SplashScreen init skipped:', e);
      }

      // Android Hardware Back Button registration
      try {
        CapApp.addListener('backButton', ({ canGoBack }) => {
          // Check if any registered view/modal wants to handle back button
          for (let i = this.backButtonCallbacks.length - 1; i >= 0; i--) {
            const handled = this.backButtonCallbacks[i]();
            if (handled) return;
          }

          if (canGoBack) {
            window.history.back();
          } else {
            CapApp.exitApp();
          }
        });
      } catch (e) {
        console.warn('Native backButton listener init skipped:', e);
      }
    }
  }

  /**
   * Register a custom back-button handler (e.g. for closing active modal)
   * Return true from handler to stop default back action.
   */
  public registerBackButtonHandler(callback: () => boolean): () => void {
    this.backButtonCallbacks.push(callback);
    return () => {
      this.backButtonCallbacks = this.backButtonCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Trigger native tactile feedback
   */
  public async hapticImpact(style: 'light' | 'medium' | 'heavy' = 'light'): Promise<void> {
    try {
      if (this.isNative()) {
        const impactMap: Record<string, ImpactStyle> = {
          light: ImpactStyle.Light,
          medium: ImpactStyle.Medium,
          heavy: ImpactStyle.Heavy,
        };
        await Haptics.impact({ style: impactMap[style] || ImpactStyle.Light });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        // Web Vibration API fallback for mobile browsers
        const durations: Record<string, number> = {
          light: 15,
          medium: 35,
          heavy: 65,
        };
        navigator.vibrate(durations[style] || 20);
      }
    } catch {}
  }

  /**
   * Trigger native alert/notification tactile vibration pattern
   */
  public async hapticNotification(type: 'success' | 'warning' | 'error' = 'warning'): Promise<void> {
    try {
      if (this.isNative()) {
        const typeMap: Record<string, NotificationType> = {
          success: NotificationType.Success,
          warning: NotificationType.Warning,
          error: NotificationType.Error,
        };
        await Haptics.notification({ type: typeMap[type] || NotificationType.Warning });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const patterns: Record<string, number[]> = {
          success: [30, 60, 40],
          warning: [60, 80, 60],
          error: [100, 50, 100, 50, 100],
        };
        navigator.vibrate(patterns[type] || [50, 50]);
      }
    } catch {}
  }

  /**
   * Retrieve real-time device diagnostics
   */
  public async getDiagnostics(): Promise<AndroidSystemStatus> {
    let deviceInfo: DeviceInfo | null = null;
    let networkStatus: ConnectionStatus | null = null;
    let batteryLevel: number | undefined;
    let isCharging: boolean | undefined;

    try {
      deviceInfo = await Device.getInfo();
    } catch {
      deviceInfo = null;
    }

    try {
      const battery = await Device.getBatteryInfo();
      batteryLevel = battery.batteryLevel;
      isCharging = battery.isCharging;
    } catch {}

    try {
      networkStatus = await Network.getStatus();
    } catch {
      networkStatus = {
        connected: typeof navigator !== 'undefined' ? navigator.onLine : true,
        connectionType: 'wifi',
      };
    }

    return {
      isNative: this.isNative(),
      platform: this.getPlatform(),
      deviceInfo,
      networkStatus,
      batteryLevel,
      isCharging,
    };
  }

  /**
   * Native Share API
   */
  public async share(payload: { title: string; text: string; url?: string }): Promise<boolean> {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(payload);
        return true;
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        console.warn('Share error:', e);
      }
    }
    return false;
  }
}

export const nativeAndroid = new NativeAndroidService();
