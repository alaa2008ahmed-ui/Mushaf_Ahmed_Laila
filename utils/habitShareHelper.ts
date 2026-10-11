import { safeHtml2Canvas } from './canvasHelper';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import moment from 'moment-hijri';
import { DailyRecord, CustomHabit } from '../hooks/useHabitTracker';

interface ShareDailyCardOptions {
  date: string;
  record: DailyRecord;
  progress: number;
  customHabits: CustomHabit[];
  theme: any;
  hexColor: string;
  isBlackTheme: boolean;
  setToastMessage?: (msg: string) => void;
}

const ARABIC_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export const shareDailyHabitCard = async ({
  date,
  record,
  progress,
  customHabits,
  theme,
  hexColor,
  isBlackTheme,
  setToastMessage
}: ShareDailyCardOptions) => {
  if (setToastMessage) setToastMessage('جاري تجهيز صورة إنجاز العبادات... ⏳');

  const containerId = `daily-habit-share-${Date.now()}`;
  const container = document.createElement('div');
  container.id = containerId;

  try {
    // Ensure fonts ready
    try {
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, 2000))
      ]);
    } catch (e) {
      console.warn('Font loading timeout, continuing');
    }

    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '750px';
    container.style.direction = 'rtl';
    container.style.fontFamily = '"Cairo", "Amiri", sans-serif';

    const mDate = moment(date);
    const dayName = ARABIC_DAYS[mDate.day()];
    const gregorianDateStr = mDate.locale('ar').format('D MMMM YYYY');
    const hijriDateStr = `${mDate.iDate()} ${mDate.locale('ar-SA').format('iMMMM')} ${mDate.iYear()} هـ`;

    // Prayers stats
    let completedFard = 0;
    let completedSunnah = 0;
    const fardKeys = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const sunnahKeys = ['fajrSunnah', 'dhuhrSunnah', 'asrSunnah', 'maghribSunnah', 'ishaSunnah'];
    const naflKeys = ['duha', 'qiyam', 'witr', 'masjid', 'tasbih', 'hajah', 'tawbah', 'istikharah'];
    let completedNafl = 0;

    if (record.prayers) {
      fardKeys.forEach((k) => { if ((record.prayers as any)[k]) completedFard++; });
      sunnahKeys.forEach((k) => { if ((record.prayers as any)[k]) completedSunnah++; });
      naflKeys.forEach((k) => { if ((record.prayers as any)[k]) completedNafl++; });
    }

    // Quran stats
    const quranPages = record.quran?.pages || 0;
    const quranDone = !!record.quran?.completed;

    // Adhkar stats
    const adhkarNames: { key: string; label: string }[] = [
      { key: 'sabah', label: 'أذكار الصباح' },
      { key: 'masaa', label: 'أذكار المساء' },
      { key: 'istighfar', label: 'الاستغفار' },
      { key: 'adia', label: 'الأدعية' }
    ];
    const completedAdhkar: string[] = [];
    if (record.adhkar) {
      adhkarNames.forEach((a) => {
        if ((record.adhkar as any)[a.key]) completedAdhkar.push(a.label);
      });
    }

    // Ethics & Good deeds
    const ethicsNames: { key: string; label: string }[] = [
      { key: 'parents', label: 'بر الوالدين' },
      { key: 'charity', label: 'الصدقة' },
      { key: 'visitFamily', label: 'صلة الرحم' },
      { key: 'visitSick', label: 'عيادة المريض' }
    ];
    const completedEthics: string[] = [];
    if (record.ethics) {
      ethicsNames.forEach((e) => {
        if ((record.ethics as any)[e.key]) completedEthics.push(e.label);
      });
    }

    // Custom habits
    const completedCustom: string[] = [];
    if (record.custom) {
      customHabits.forEach((h) => {
        if (record.custom && record.custom[h.id]) {
          completedCustom.push(`${h.icon || '⭐'} ${h.title}`);
        }
      });
    }

    const primaryColor = theme?.palette?.[0] || hexColor || '#059669';
    const secondaryColor = theme?.palette?.[1] || '#047857';

    const bgGradient = isBlackTheme
      ? 'linear-gradient(145deg, #09090b 0%, #18181b 100%)'
      : `linear-gradient(145deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;

    // Achievement title & subtitle
    let achievementTitle = 'إنجاز يومي مبارك 🌿';
    let achievementDesc = 'نسأل الله القبول والثبات على طاعته';
    if (progress === 100) {
      achievementTitle = 'إنجاز كامل ما شاء الله 🌟';
      achievementDesc = 'يوم مليء بالطاعات والفرائض والسنن';
    } else if (progress >= 80) {
      achievementTitle = 'همة عالية ومثابرة طيبة 🥈';
      achievementDesc = 'أقبلت على الطاعات وحافظت على جلّ العبادات';
    } else if (progress >= 50) {
      achievementTitle = 'خطوات مباركة في طريق الخير 🥉';
      achievementDesc = 'أحب الأعمال إلى الله أدومها وإن قل';
    }

    container.innerHTML = `
      <div style="
        background: ${bgGradient};
        padding: 34px 30px;
        color: #ffffff;
        border-radius: 26px;
        border: 2px solid rgba(255, 255, 255, 0.22);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        position: relative;
        overflow: hidden;
        box-sizing: border-box;
      ">
        <!-- Subtle Pattern Overlay -->
        <div style="
          position: absolute;
          inset: 0;
          opacity: 0.08;
          background-image: radial-gradient(circle, #ffffff 1px, transparent 1px);
          background-size: 18px 18px;
          pointer-events: none;
        "></div>

        <!-- Header -->
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
          border-bottom: 1px solid rgba(255,255,255,0.2);
          padding-bottom: 16px;
          position: relative;
          z-index: 1;
        ">
          <div style="text-align: right;">
            <div style="font-size: 24px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
              <span>مربّي العبادات</span>
              <span style="font-size: 22px;">🌙</span>
            </div>
            <div style="font-size: 13px; opacity: 0.9; margin-top: 4px;">
              يوم ${dayName} • ${gregorianDateStr}
            </div>
          </div>
          <div style="text-align: left;">
            <div style="font-size: 18px; font-weight: 800; color: #fef08a;">
              مصحف أحمد وليلى
            </div>
            <div style="font-size: 12px; opacity: 0.85; margin-top: 4px;">
              ${hijriDateStr}
            </div>
          </div>
        </div>

        <!-- Hero Percentage Card -->
        <div style="
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 20px;
          padding: 22px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 22px;
          position: relative;
          z-index: 1;
        ">
          <div>
            <div style="font-size: 22px; font-weight: 800; color: #fef08a; margin-bottom: 6px;">
              ${achievementTitle}
            </div>
            <div style="font-size: 14px; opacity: 0.92; line-height: 1.6;">
              ${achievementDesc}
            </div>
          </div>
          <div style="
            width: 90px;
            height: 90px;
            border-radius: 50%;
            border: 4px solid rgba(255,255,255,0.25);
            border-top-color: #fef08a;
            border-right-color: #fef08a;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.2);
            flex-shrink: 0;
          ">
            <span style="font-size: 26px; font-weight: 900; font-family: sans-serif; color: #ffffff;">
              ${progress}%
            </span>
            <span style="font-size: 11px; opacity: 0.85;">إنجاز اليوم</span>
          </div>
        </div>

        <!-- 4 Key Categories Grid -->
        <div style="
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 22px;
          position: relative;
          z-index: 1;
        ">
          <!-- Prayers Box -->
          <div style="
            background: rgba(255, 255, 255, 0.09);
            border: 1px solid rgba(255, 255, 255, 0.16);
            border-radius: 16px;
            padding: 16px;
            text-align: right;
          ">
            <div style="font-size: 13px; opacity: 0.9; margin-bottom: 6px;">🕌 الصلوات المكتوبة والسنن</div>
            <div style="font-size: 20px; font-weight: 800; color: #ffffff;">
              ${completedFard} / 5 <span style="font-size: 13px; font-weight: normal; opacity: 0.85;">فريضة</span>
            </div>
            <div style="font-size: 12px; opacity: 0.85; margin-top: 4px;">
              ${completedSunnah > 0 ? `+ ${completedSunnah} سنن رواتب` : 'لم تسجل سنن'} 
              ${completedNafl > 0 ? `• ${completedNafl} نوافل` : ''}
            </div>
          </div>

          <!-- Quran Box -->
          <div style="
            background: rgba(255, 255, 255, 0.09);
            border: 1px solid rgba(255, 255, 255, 0.16);
            border-radius: 16px;
            padding: 16px;
            text-align: right;
          ">
            <div style="font-size: 13px; opacity: 0.9; margin-bottom: 6px;">📖 الورد القرآني</div>
            <div style="font-size: 20px; font-weight: 800; color: #ffffff;">
              ${quranPages} <span style="font-size: 13px; font-weight: normal; opacity: 0.85;">صفحة</span>
            </div>
            <div style="font-size: 12px; opacity: 0.85; margin-top: 4px;">
              ${quranDone ? '✓ تم إتمام الورد القرآني' : quranPages > 0 ? 'قراءة متواصلة مباركة' : 'لم يسجل ورد'}
            </div>
          </div>

          <!-- Adhkar Box -->
          <div style="
            background: rgba(255, 255, 255, 0.09);
            border: 1px solid rgba(255, 255, 255, 0.16);
            border-radius: 16px;
            padding: 16px;
            text-align: right;
          ">
            <div style="font-size: 13px; opacity: 0.9; margin-bottom: 6px;">📿 الأذكار اليومية</div>
            <div style="font-size: 16px; font-weight: 700; color: #ffffff; line-height: 1.4;">
              ${completedAdhkar.length > 0 ? completedAdhkar.join(' • ') : '<span style="opacity:0.7; font-weight:normal;">لم تسجل الأذكار</span>'}
            </div>
          </div>

          <!-- Ethics & Custom Habits Box -->
          <div style="
            background: rgba(255, 255, 255, 0.09);
            border: 1px solid rgba(255, 255, 255, 0.16);
            border-radius: 16px;
            padding: 16px;
            text-align: right;
          ">
            <div style="font-size: 13px; opacity: 0.9; margin-bottom: 6px;">🤍 البر والسنن المستحبة</div>
            <div style="font-size: 14px; font-weight: 700; color: #ffffff; line-height: 1.4;">
              ${[...completedEthics, ...completedCustom].length > 0
                ? [...completedEthics, ...completedCustom].slice(0, 3).join(' • ') + ([...completedEthics, ...completedCustom].length > 3 ? '...' : '')
                : '<span style="opacity:0.7; font-weight:normal;">لم تسجل بعد</span>'}
            </div>
          </div>
        </div>

        <!-- Footer Hadith & Dedication -->
        <div style="
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.2);
          padding-top: 16px;
          position: relative;
          z-index: 1;
        ">
          <div style="font-size: 16px; font-weight: 700; color: #fef08a; font-family: 'Amiri', serif; margin-bottom: 6px;">
            «أَحَبُّ الأَعْمَالِ إِلَى اللهِ أَدْوَمُهَا وَإِنْ قَلَّ»
          </div>
          <div style="font-size: 12px; opacity: 0.85; font-family: 'Amiri', serif;">
            جعله الله في ميزان حسناتكم وصدقة جارية عن أرواح أحمد وليلى 🤍
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Give time for layout and fonts
    await new Promise((r) => setTimeout(r, 400));

    const canvas = await safeHtml2Canvas(container, {
      scale: 2.8,
      backgroundColor: null,
      useCORS: true,
      logging: false,
      imageTimeout: 15000
    });

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    if (!dataUrl || dataUrl === 'data:,') {
      throw new Error('Failed to generate image data');
    }

    // Share logic matching shareAsImage.ts EXACTLY:
    // When using Capacitor native share, ONLY passing url (file uri) ensures
    // Android shows the image intent resolver ("صورة واحدة") with installed apps.
    if (Capacitor.isNativePlatform()) {
      const fileName = `habit_tracker_${Date.now()}.jpg`;
      const base64Data = dataUrl.split(',')[1];

      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache
      });

      await Share.share({
        title: 'مشاركة',
        url: savedFile.uri,
        dialogTitle: 'مشاركة عبر'
      });
    } else if (navigator.share) {
      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `habit_tracker_${date}.jpg`, { type: 'image/jpeg' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'مشاركة'
          });
        } else {
          downloadImage(dataUrl, date, setToastMessage);
        }
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.error('Navigator share failed', e);
          downloadImage(dataUrl, date, setToastMessage);
        }
      }
    } else {
      downloadImage(dataUrl, date, setToastMessage);
    }

    if (setToastMessage) setToastMessage('تمت المشاركة بنجاح 🌟');
  } catch (err) {
    console.error('Habit tracker share error:', err);
    if (setToastMessage) setToastMessage('تعذر مشاركة الصورة');
  } finally {
    if (document.getElementById(containerId)) {
      document.body.removeChild(container);
    }
    setTimeout(() => {
      if (setToastMessage) setToastMessage('');
    }, 3000);
  }
};

const downloadImage = (dataUrl: string, date: string, setToastMessage?: (msg: string) => void) => {
  try {
    const link = document.createElement('a');
    link.download = `habit_tracker_${date}.jpg`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (setToastMessage) setToastMessage('تم تحميل صورة الإنجاز للمشاركة 🌟');
  } catch (e) {
    console.error('Download failed', e);
    if (setToastMessage) setToastMessage('فشل تحميل الصورة');
  }
};
