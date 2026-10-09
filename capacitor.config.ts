import { CapacitorConfig } from '@capacitor/cli';

const config: any = {
  appId: 'com.mushaf.ahmedandlayla',
  appName: 'مصحف أحمد وليلى',
  webDir: 'dist',
  backgroundColor: '#000000',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      '*.firebaseapp.com',
      '*.firebase.com',
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
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
};

export default config as CapacitorConfig;
