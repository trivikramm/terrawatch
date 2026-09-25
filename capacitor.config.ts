import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.terrawatch.ai',
  appName: 'TerraWatch AI',
  webDir: 'dist',
  backgroundColor: '#0B0F19',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#0B0F19',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      spinnerColor: '#3B82F6'
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0B0F19',
      overlaysWebView: false
    }
  }
};

export default config;
