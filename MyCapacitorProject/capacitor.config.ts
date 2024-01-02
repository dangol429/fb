import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.facebook.app',
  appName: 'facebook',
  webDir: '../build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
