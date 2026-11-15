import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRDbre0eogQtQDlyPowjcNSii1jMqURYKK8UjFm9Y2zsZDU5oT9ZmOJgmbz_UarqXp3aduvrlHuGU5F/pub?output=csv';

interface FloatingNeonTickerProps {
  layoutMode?: 'classic' | 'modern';
  isGolden?: boolean;
}

interface TickerData {
  status: string;
  messageAr: string;
  messageEn?: string;
}

function parseCSVRow(rowStr: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < rowStr.length; i++) {
    const ch = rowStr[i];
    if (ch === '"') {
      if (inQuotes && rowStr[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

function cleanCSVCell(cell: string): string {
  let val = cell.trim();
  if (val.startsWith('"') && val.endsWith('"') && val.length >= 2) {
    val = val.substring(1, val.length - 1);
  }
  return val.replace(/""/g, '"').trim();
}

function syncTranslateArabicToEnglish(arMessage: string, customEn?: string): string {
  if (!arMessage) return '';
  
  // If custom English translation is explicitly provided in CSV, use it
  if (customEn && customEn.trim() && customEn.trim().toLowerCase() !== arMessage.trim().toLowerCase()) {
    return customEn.trim();
  }

  // If the text is already primarily English, return as is
  const latinCount = (arMessage.match(/[a-zA-Z]/g) || []).length;
  const arabicCount = (arMessage.match(/[\u0600-\u06FF]/g) || []).length;
  if (latinCount > arabicCount) {
    return arMessage;
  }

  const cleanText = arMessage.replace(/[\u064B-\u065F\u0670]/g, '').trim();
  const normalized = cleanText
    .replace(/[إأآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');

  // Occasions & Greetings
  if (normalized.includes('كل عام وانتم بخير') || normalized.includes('كل عام وانتم بالف خير') || normalized.includes('كل عام وانتم طيبين') || normalized.includes('كل سنه وانتم طيبين')) {
    return 'Best wishes & happy occasions to you and your family! May you be in goodness every year.';
  }
  if (normalized.includes('رمضان كريم') || normalized.includes('رمضان مبارك')) {
    return 'Ramadan Kareem! May Allah accept your fasting and prayers.';
  }
  if (normalized.includes('عيد مبارك') || normalized.includes('عيدكم مبارك') || normalized.includes('تقبل الله طاعتكم')) {
    return 'Blessed Eid to you and your loved ones! May Allah accept our good deeds.';
  }
  if (normalized.includes('جمعه مباركه') || normalized.includes('جمعة مباركة')) {
    return 'Blessed Friday (Jumaah Mubarakah) to all.';
  }

  // App Sharing & Benefit
  if (
    normalized.includes('اعجبكم') || 
    normalized.includes('اعجبك') || 
    (normalized.includes('نشر') && normalized.includes('الاجر')) ||
    (normalized.includes('نشر') && normalized.includes('ثواب')) ||
    normalized.includes('شارك التطبيق') ||
    normalized.includes('انشر التطبيق')
  ) {
    return 'If you benefit from the app, please share it to gain the reward. May Allah reward you with goodness.';
  }

  // Sadaqah Jariyah & Deceased
  if (normalized.includes('صدقه جاريه') || normalized.includes('عن روح') || normalized.includes('للمرحوم') || normalized.includes('للمتوفي')) {
    const detail = cleanText.replace(/صدقة جارية|صدقه جاريه/g, '').trim();
    return detail 
      ? `Ongoing Charity (Sadaqah Jariyah): ${detail} - May Allah grant them mercy and forgiveness.`
      : 'Ongoing Charity (Sadaqah Jariyah) - Kindly pray for mercy and forgiveness for the deceased.';
  }

  // Salawat
  if (normalized.includes('صلوا علي النبي') || normalized.includes('صلي علي النبي') || normalized.includes('الصلاه علي النبي')) {
    return 'Send blessings and peace upon our Prophet Muhammad ﷺ.';
  }

  // Athkar
  if (normalized.includes('سبحان الله وبحمده') || normalized.includes('سبحان الله العظيم')) {
    return 'Glory be to Allah and praise Him, Glory be to Allah the Almighty.';
  }
  if (normalized.includes('لا اله الا الله')) {
    return 'There is no deity worthy of worship except Allah alone.';
  }
  if (normalized.includes('استغفر الله')) {
    return 'I seek forgiveness from Allah the Almighty.';
  }

  // Duas
  if (normalized.includes('دعائكم') || normalized.includes('ادعوا') || normalized.includes('لاتنسونا')) {
    return 'Please remember us in your sincere prayers and supplications.';
  }

  // App Updates
  if (normalized.includes('تحديث') || normalized.includes('جديد') || normalized.includes('اصدار')) {
    return 'New update & features available in the Holy Quran application.';
  }

  // Phrase Replacements
  const translationsMap: Array<[RegExp, string]> = [
    [/كل عام/gi, 'Every year'],
    [/وانتم بخير/gi, 'wishing you peace & goodness'],
    [/اذا اعجبك/gi, 'If you like'],
    [/اذا اعجبكم/gi, 'If you like'],
    [/التطبيق/gi, 'the app'],
    [/المصحف/gi, 'the Quran'],
    [/شاركه/gi, 'share it'],
    [/انشره/gi, 'share it'],
    [/بنشر/gi, 'by sharing'],
    [/لتنالوا/gi, 'to gain'],
    [/الاجر/gi, 'the reward'],
    [/الثواب/gi, 'the blessing'],
    [/معنا/gi, 'with us'],
    [/جزاكم الله خيرا/gi, 'May Allah reward you with goodness'],
    [/جزاكم الله خير/gi, 'May Allah reward you with goodness'],
    [/بارك الله فيكم/gi, 'May Allah bless you all'],
    [/رحمه الله/gi, 'May Allah have mercy on him'],
    [/رحمها الله/gi, 'May Allah have mercy on her'],
    [/رحمهم الله/gi, 'May Allah have mercy on them'],
    [/دعواتكم/gi, 'your prayers'],
    [/نرجوا الدعاء/gi, 'Kindly pray'],
    [/لجميع المسلمين/gi, 'for all Muslims'],
    [/والمسلمات/gi, 'and Muslim women'],
    [/الاحياء منهم والاموات/gi, 'the living and the deceased'],
  ];

  let translated = cleanText;
  translationsMap.forEach(([regex, replacement]) => {
    translated = translated.replace(regex, replacement);
  });

  const hasEnglishWords = /[a-zA-Z]{3,}/.test(translated);
  if (hasEnglishWords) {
    return translated.replace(/\s+/g, ' ').trim();
  }

  // Ultimate fallback if offline/unmatched: return clear English announcement header so no raw Arabic is shown in English mode
  return `Announcement: ${cleanText}`;
}

// Live Online Translation Function with fallback
async function fetchOnlineTranslation(arText: string): Promise<string> {
  if (!arText || !arText.trim()) return '';

  const cleanText = arText.replace(/[\u064B-\u065F\u0670]/g, '').trim();

  // 1. Try Google Translate free endpoint
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(cleanText)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translatedSegments = data[0].map((seg: any) => seg[0]).filter(Boolean).join(' ');
        if (translatedSegments && translatedSegments.trim()) {
          const result = translatedSegments.trim();
          // Ensure it's in English
          if (!/[\u0600-\u06FF]/.test(result) || (result.match(/[a-zA-Z]/g) || []).length > 3) {
            return result;
          }
        }
      }
    }
  } catch (e) {
    // network error fallback
  }

  // 2. Try MyMemory Translation API
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=ar|en`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data?.responseData?.translatedText) {
        const result = data.responseData.translatedText.trim();
        if (result && (!/[\u0600-\u06FF]/.test(result) || (result.match(/[a-zA-Z]/g) || []).length > 3)) {
          return result;
        }
      }
    }
  } catch (e) {
    // network error fallback
  }

  // 3. Fallback to synchronous dictionary translation
  return syncTranslateArabicToEnglish(arText);
}

const FloatingNeonTicker: React.FC<FloatingNeonTickerProps> = ({ layoutMode, isGolden }) => {
  const [tickerData, setTickerData] = useState<TickerData | null>(null);
  const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const isNight = isNightMode || themeKey === 'black_gold' || themeKey === 'deep_black' || theme.bgColor === '#000000';
  const isSky = !isNight && (homeThemeVariant === 'sky' || themeKey === 'sky_mode');
  const isEmerald = !isNight && (homeThemeVariant === 'emerald' || themeKey === 'emerald_mode');
  const isBurgundy = !isNight && (homeThemeVariant === 'burgundy' || themeKey === 'burgundy_mode');
  const isGold = !isNight && (homeThemeVariant === 'gold' || themeKey === 'shiny_gold' || (!isSky && !isEmerald && !isBurgundy && layoutMode === 'modern'));

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;
    
    const fetchTicker = async () => {
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`${CSV_URL}&t=${timestamp}`);
        if (!response.ok) return;
        
        const text = await response.text();
        if (!isMounted) return;

        if (text.trim().toLowerCase().startsWith('<!doctype html>')) {
          return;
        }

        const rows = text.split(/\r?\n/).filter(row => row.trim() !== '');
        
        if (rows.length >= 2) {
          const headers = parseCSVRow(rows[0]).map(h => cleanCSVCell(h).toLowerCase());
          const dataCells = parseCSVRow(rows[1]);

          const statusIdx = headers.findIndex(h => h.includes('status'));
          const messageArIdx = headers.findIndex(h => h === 'message' || h === 'messagear' || h === 'message_ar' || h.includes('عرب'));
          const messageEnIdx = headers.findIndex(h => h === 'messageen' || h === 'message_en' || h === 'english' || h.includes('en'));

          let status = cleanCSVCell(statusIdx !== -1 ? dataCells[statusIdx] : dataCells[0] || '').toUpperCase();
          let messageAr = cleanCSVCell(messageArIdx !== -1 ? dataCells[messageArIdx] : (dataCells.length > 1 ? dataCells[1] : ''));
          let messageEn = cleanCSVCell(messageEnIdx !== -1 ? dataCells[messageEnIdx] : (dataCells.length > 2 ? dataCells[2] : ''));

          if (!messageAr && dataCells.length === 1 && dataCells[0].includes(',')) {
            const firstComma = dataCells[0].indexOf(',');
            status = cleanCSVCell(dataCells[0].substring(0, firstComma)).toUpperCase();
            messageAr = cleanCSVCell(dataCells[0].substring(firstComma + 1));
          }

          // Initial quick translation from dictionary
          let translatedEn = syncTranslateArabicToEnglish(messageAr, messageEn);

          if (status === 'OFF') {
            setTickerData(null);
          } else if (status === 'ON') {
            setTickerData(prev => {
              if (
                prev?.messageAr === messageAr &&
                prev?.messageEn &&
                prev?.status === status
              ) return prev;
              return { status, messageAr, messageEn: translatedEn };
            });

            // Perform live online translation in background if no customEn was supplied
            if (messageAr && (!messageEn || messageEn.trim().toLowerCase() === messageAr.trim().toLowerCase())) {
              fetchOnlineTranslation(messageAr).then(onlineTranslated => {
                if (isMounted && onlineTranslated && onlineTranslated !== translatedEn) {
                  setTickerData(prev => prev ? { ...prev, messageEn: onlineTranslated } : null);
                }
              });
            }
          }
        }
      } catch (error) {
        // Ignore errors
      }
    };

    fetchTicker();
    intervalId = setInterval(fetchTicker, 60000);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  if (!tickerData || tickerData.status !== 'ON') {
    return null;
  }

  const themeStyles = (() => {
    if (isNight) {
      return {
        containerBg: 'linear-gradient(140deg, #1d1d28 0%, #15151e 50%, #0d0d12 100%)',
        borderColor: '#f59e0b',
        boxShadow: '0 3px 12px rgba(0, 0, 0, 0.7), 0 0 10px rgba(245, 158, 11, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
        textColors: ['#ffffff', '#f8fafc', '#ffffff'],
        textShadow: '0 0 6px rgba(255, 255, 255, 0.5), 0 1px 2px rgba(0, 0, 0, 0.9)'
      };
    }
    if (isSky) {
      return {
        containerBg: 'linear-gradient(140deg, #f0f9ff 0%, #e0f2fe 35%, #bae6fd 70%, #7dd3fc 100%)',
        borderColor: '#0284c7',
        boxShadow: '0 3px 10px rgba(2, 132, 199, 0.25), inset 0 2px 2px rgba(255, 255, 255, 0.95), inset 0 -2px 3px rgba(3, 105, 161, 0.15)',
        textColors: ['#0369a1', '#0284c7', '#075985'],
        textShadow: '0 1px 1px rgba(255, 255, 255, 0.95)'
      };
    }
    if (isEmerald) {
      return {
        containerBg: 'linear-gradient(140deg, #f0fdf4 0%, #dcfce7 35%, #a7f3d0 70%, #6ee7b7 100%)',
        borderColor: '#047857',
        boxShadow: '0 3px 10px rgba(4, 120, 87, 0.25), inset 0 2px 2px rgba(255, 255, 255, 0.95), inset 0 -2px 3px rgba(6, 95, 70, 0.15)',
        textColors: ['#047857', '#059669', '#065f46'],
        textShadow: '0 1px 1px rgba(255, 255, 255, 0.95)'
      };
    }
    if (isBurgundy) {
      return {
        containerBg: 'linear-gradient(140deg, #fff1f2 0%, #ffe4e6 35%, #fecdd3 70%, #fda4af 100%)',
        borderColor: '#881337',
        boxShadow: '0 3px 10px rgba(136, 19, 55, 0.25), inset 0 2px 2px rgba(255, 255, 255, 0.95), inset 0 -2px 3px rgba(159, 18, 57, 0.15)',
        textColors: ['#881337', '#9f1239', '#4c0519'],
        textShadow: '0 1px 1px rgba(255, 255, 255, 0.95)'
      };
    }
    if (isGold) {
      return {
        containerBg: 'linear-gradient(140deg, #FFFDF7 0%, #FEF8E7 18%, #FCE8AB 50%, #F5D374 80%, #E8BE48 100%)',
        borderColor: '#D97706',
        boxShadow: '0 3px 10px rgba(180, 115, 20, 0.28), inset 0 2px 2px rgba(255, 255, 255, 0.95), inset 0 -2px 3px rgba(146, 64, 14, 0.16)',
        textColors: ['#451A03', '#78350F', '#B45309'],
        textShadow: '0 1px 1px rgba(255, 255, 255, 0.95)'
      };
    }

    const primary = theme.palette?.[0] || theme.accent || '#10b981';
    return {
      containerBg: theme.cardBg || theme.bgColor || '#1e293b',
      borderColor: theme.cardBorder || primary,
      boxShadow: `0 3px 10px ${primary}30`,
      textColors: [theme.textColor || '#ffffff', primary, theme.textColor || '#ffffff'],
      textShadow: 'none'
    };
  })();

  const rawDisplay = isEn 
    ? (tickerData.messageEn || syncTranslateArabicToEnglish(tickerData.messageAr)) 
    : tickerData.messageAr;

  // Guarantee that in English mode, if rawDisplay still contains Arabic characters, we clean it up so no raw Arabic shows in English mode
  const displayMessage = (isEn && /[\u0600-\u06FF]/.test(rawDisplay))
    ? syncTranslateArabicToEnglish(tickerData.messageAr)
    : rawDisplay;

  return (
    <div 
      className="absolute top-0 left-0 right-0 z-10 w-full overflow-hidden rounded-full"
      style={{ height: '27.5px', minHeight: '27.5px', contain: 'layout style paint' }}
    >
      <style>
        {`
          @keyframes themed-ticker-track-ltr {
            0% { transform: translate3d(0%, 0, 0); }
            100% { transform: translate3d(100%, 0, 0); }
          }

          @keyframes themed-ticker-inner-ltr {
            0% { transform: translate3d(-100%, 0, 0); }
            100% { transform: translate3d(0%, 0, 0); }
          }

          @keyframes themed-ticker-track-rtl {
            0% { transform: translate3d(100%, 0, 0); }
            100% { transform: translate3d(0%, 0, 0); }
          }

          @keyframes themed-ticker-inner-rtl {
            0% { transform: translate3d(0%, 0, 0); }
            100% { transform: translate3d(-100%, 0, 0); }
          }

          .ticker-track {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            will-change: transform;
            pointer-events: none;
            animation: ${isEn ? 'themed-ticker-track-rtl' : 'themed-ticker-track-ltr'} 40s linear infinite;
          }

          .ticker-content {
            display: inline-block;
            white-space: nowrap;
            width: max-content;
            will-change: transform;
            animation: ${isEn ? 'themed-ticker-inner-rtl' : 'themed-ticker-inner-ltr'} 40s linear infinite;
          }

          .themed-ticker-container {
            position: absolute;
            inset: 0;
            z-index: 10;
            pointer-events: none;
            overflow: hidden;
            display: flex;
            align-items: center;
            background: ${themeStyles.containerBg};
            border: 1.5px solid ${themeStyles.borderColor};
            border-radius: 9999px;
            box-shadow: ${themeStyles.boxShadow};
            contain: layout style paint;
          }

          .themed-ticker-text {
            font-weight: 800;
            font-size: 1.05rem;
            line-height: normal;
            letter-spacing: 0.5px;
            font-family: 'Cairo', sans-serif;
            display: inline-block;
            color: ${themeStyles.textColors[0]};
            text-shadow: ${themeStyles.textShadow};
          }
        `}
      </style>
      <div 
        id="floating-neon-ticker" 
        className="themed-ticker-container"
        dir="ltr"
      >
        <div key={isEn ? `ticker-en-${displayMessage}` : `ticker-ar-${displayMessage}`} className="ticker-track" dir="ltr">
          <div className="ticker-content">
            <span 
              className="themed-ticker-text" 
              dir={isEn ? "ltr" : "rtl"}
              dangerouslySetInnerHTML={{ __html: displayMessage }}
            ></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(FloatingNeonTicker);
