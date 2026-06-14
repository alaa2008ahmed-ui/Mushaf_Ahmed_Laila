import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mushaf.ahmedandlayla',
  appName: 'مصحف أحمد وليلى',
  webDir: 'dist',
  backgroundColor: '#000000',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Keyboard: {
      resize: 'native' as any,
      style: 'dark' as any,
    },
    LocalNotifications: {
      smallIcon: "ic_stat_name",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
};

export default config;
