import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.babnisa',
  appName: 'Bab-un-Nisa',
  webDir: 'client/dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: ['*']
  },
  android: {
    buildOptions: {
      releaseType: 'APK'
    }
  }
};

export default config;
