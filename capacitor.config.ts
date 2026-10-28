import { CapacitorConfig } from '@capacitor/cli';

const config: any = {
  appId: 'com.mushaf.ahmedandlayla',
  appName: 'مصحف أحمد وليلى',
  webDir: 'dist',
  backgroundColor: '#000000',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      '*.google.com',
      'accounts.google.com',
      'ssl.gstatic.com'
    ]
  },
  plugins: {
    Keyboard: {
      resize: 'native' as any,
      style: 'dark' as any,
    },
    LocalNotifications: {
      smallIcon: "ic_stat_name",
      iconColor: "#2E7D5E",
      sound: "chime.mp3",
    },
  },
};

export default config as CapacitorConfig;
