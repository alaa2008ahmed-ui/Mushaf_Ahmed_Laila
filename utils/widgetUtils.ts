import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { presetThemes } from '../context/themes';

export interface WidgetData {
  hijri: string;
  gregorian: string;
  day: string;
  city: string;
  next_prayer_name: string;
  next_prayer_id: string;
  remaining_time: string;
  target_time_millis?: number;
  midnight: string;
  last_third: string;
  times: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  timestamps?: {
    fajr: number;
    sunrise: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
    nextFajr: number;
    nextSunrise: number;
    nextDhuhr: number;
    nextAsr: number;
    nextMaghrib: number;
    nextIsha: number;
  };
  theme?: {
    themeKey: string;
    primaryColor: string;
    secondaryColor: string;
    bgColor: string;
    textColor: string;
  } | null;
}

/**
 * Updates the Android App Widget with the latest prayer times data.
 * This function stores the data in Capacitor's default SharedPreferences
 * which the native Android Widget reads from.
 */
export const updateAndroidWidget = async (data: WidgetData, syncTheme: boolean = false) => {
  if (Capacitor.getPlatform() !== 'android') return;

  try {
    const finalData = {
        ...data,
        theme: null // Force null theme to keep default widget design
    };

    // We use the default group name 'CapacitorStorage' which matches the Java side
    await Preferences.set({
      key: 'widget_prayer_data',
      value: JSON.stringify(finalData)
    });
    
    console.log('Android Widget data updated successfully');
  } catch (error) {
    console.error('Failed to update Android Widget data:', error);
  }
};
