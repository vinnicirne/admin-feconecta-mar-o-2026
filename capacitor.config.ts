import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.feconecta.app',
  appName: 'FeConecta',
  webDir: 'out',
  server: {
    url: 'https://live-feconecta.vercel.app',
    cleartext: true
  }
};

export default config;
