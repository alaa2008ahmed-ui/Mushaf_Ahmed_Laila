import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share2, Download, Copy, Check, Award, Calendar, Sparkles, BookOpen, Clock, Heart, Star } from 'lucide-react';
import moment from 'moment-hijri';
import { DailyRecord, CustomHabit } from '../hooks/useHabitTracker';
import { safeHtml2Canvas } from '../utils/canvasHelper';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

interface WeeklyAchievementModalProps {
  records: Record<string, DailyRecord>;
  getDailyProgress: (date: string) => number;
  customHabits: CustomHabit[];
  theme: any;
  hexColor: string;
  isBlackTheme: boolean;
  onClose: () => void;
}

const ARABIC_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export const WeeklyAchievementModal: React.FC<WeeklyAchievementModalProps> = ({
  records,
  getDailyProgress,
  customHabits,
  theme,
  hexColor,
  isBlackTheme,
  onClose
}) => {
  const [toastMsg, setToastMsg] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewRange, setViewRange] = useState<'last7' | 'thisWeek'>('last7');

  const cardRef = useRef<HTMLDivElement>(null);

  // Compute the 7 days based on viewRange
  const days = useMemo(() => {
    const list = [];
    const today = moment();

    if (viewRange === 'thisWeek') {
      // Arab week starts on Saturday (day 6 of previous week or current week)
      // Find the most recent Saturday
      const dayOfWeek = today.day(); // 0=Sun, 1=Mon, ..., 6=Sat
      const daysSinceSaturday = (dayOfWeek + 1) % 7;
      const startOfWeek = today.clone().subtract(daysSinceSaturday, 'days');
      
      for (let i = 0; i < 7; i++) {
        const d = startOfWeek.clone().add(i, 'days');
        list.push(d);
      }
    } else {
      // Last 7 days ending today
      for (let i = 6; i >= 0; i--) {
        list.push(today.clone().subtract(i, 'days'));
      }
    }
    return list;
  }, [viewRange]);

  // Aggregate stats over the 7 days
  const stats = useMemo(() => {
    let totalProgressSum = 0;
    let prayersCount = 0;
    let quranPages = 0;
    let adhkarCount = 0;
    let ethicsCount = 0;
    let customCount = 0;
    let daysWith100 = 0;
    let activeDaysCount = 0;

    const daysStats = days.map((d) => {
      const dateStr = d.format('YYYY-MM-DD');
      const rec = records[dateStr];
      const prog = getDailyProgress(dateStr);
      totalProgressSum += prog;
      if (prog === 100) daysWith100++;
      if (prog > 0) activeDaysCount++;

      let dPrayers = 0;
      let dQuran = 0;
      let dAdhkar = 0;
      let dEthics = 0;
      let dCustom = 0;

      if (rec) {
        if (rec.prayers) {
          Object.values(rec.prayers).forEach((v) => { if (v) dPrayers++; });
        }
        if (rec.quran) {
          dQuran = rec.quran.pages || 0;
        }
        if (rec.adhkar) {
          Object.values(rec.adhkar).forEach((v) => { if (v) dAdhkar++; });
        }
        if (rec.ethics) {
          Object.values(rec.ethics).forEach((v) => { if (v) dEthics++; });
        }
        if (rec.custom) {
          Object.values(rec.custom).forEach((v) => { if (v) dCustom++; });
        }
      }

      prayersCount += dPrayers;
      quranPages += dQuran;
      adhkarCount += dAdhkar;
      ethicsCount += dEthics;
      customCount += dCustom;

      const dayIndex = d.day();
      return {
        dateStr,
        dayName: ARABIC_DAYS[dayIndex],
        shortDate: d.locale('ar').format('D MMM'),
        progress: prog,
        prayers: dPrayers,
        quran: dQuran,
        isToday: dateStr === moment().format('YYYY-MM-DD'),
        isFuture: d.isAfter(moment(), 'day')
      };
    });

    const averageProgress = Math.round(totalProgressSum / 7);

    // Medal and encouraging description
    let medal = {
      title: 'وسام السابقون بالخيرات 🥇',
      desc: 'إنجاز إيماني استثنائي وثبات عظيم على الطاعات ما شاء الله',
      color: '#f59e0b'
    };

    if (averageProgress < 50) {
      medal = {
        title: 'وسام الساعي في الخير 🌸',
        desc: 'خطوات مباركة، وبداية طيبة نحو الاستمرار وعلو الهمة',
        color: '#10b981'
      };
    } else if (averageProgress < 75) {
      medal = {
        title: 'وسام المجاهد لنفسه 🥉',
        desc: 'جهاد النفس في الطاعة من أعظم القربات، استمر في العطاء',
        color: '#d97706'
      };
    } else if (averageProgress < 90) {
      medal = {
        title: 'وسام المداوم على الطاعات 🥈',
        desc: 'ثبات وهمة عالية، أحب الأعمال إلى الله أدومها وإن قل',
        color: '#3b82f6'
      };
    }

    const startDate = days[0];
    const endDate = days[days.length - 1];
    const dateRangeStr = `من ${ARABIC_DAYS[startDate.day()]} (${startDate.locale('ar').format('D MMM')}) إلى ${ARABIC_DAYS[endDate.day()]} (${endDate.locale('ar').format('D MMM')})`;

    return {
      daysStats,
      averageProgress,
      prayersCount,
      quranPages,
      adhkarCount,
      ethicsCount,
      customCount,
      goodDeedsTotal: ethicsCount + customCount,
      daysWith100,
      activeDaysCount,
      medal,
      dateRangeStr
    };
  }, [days, records, getDailyProgress]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Generate image and return data URL
  const generateCardImage = async (): Promise<string> => {
    // We create a dedicated high-res rendering node to guarantee identical, crisp layout on all screens
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '750px';
    container.style.direction = 'rtl';
    container.style.fontFamily = '"Cairo", "Amiri", sans-serif';

    const bgGradient = isBlackTheme
      ? 'linear-gradient(145deg, #09090b 0%, #18181b 100%)'
      : 'linear-gradient(145deg, #064e3b 0%, #065f46 50%, #047857 100%)';

    const primaryAccent = isBlackTheme ? '#FFFFFF' : hexColor;

    container.innerHTML = `
      <div style="
        background: ${bgGradient};
        padding: 36px 32px;
        color: #ffffff;
        border-radius: 28px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        position: relative;
        overflow: hidden;
      ">
        <!-- Decorative Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 18px;">
          <div style="text-align: right;">
            <div style="font-size: 24px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
              <span>مربّي العبادات</span>
              <span style="font-size: 20px;">🌙</span>
            </div>
            <div style="font-size: 14px; opacity: 0.85; margin-top: 4px;">
              حصاد الأسبوع الإيماني
            </div>
          </div>
          <div style="text-align: left;">
            <div style="font-size: 18px; font-weight: 700; color: #fef08a;">
              مصحف أحمد وليلى
            </div>
            <div style="font-size: 13px; opacity: 0.8; margin-top: 4px;">
              ${stats.dateRangeStr}
            </div>
          </div>
        </div>

        <!-- Hero Percentage & Medal -->
        <div style="
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        ">
          <div>
            <div style="font-size: 20px; font-weight: 800; color: #fef08a; margin-bottom: 6px;">
              ${stats.medal.title}
            </div>
            <div style="font-size: 14px; opacity: 0.9; max-width: 440px; line-height: 1.6;">
              ${stats.medal.desc}
            </div>
            <div style="margin-top: 10px; font-size: 13px; opacity: 0.8;">
              حافظت على الطاعات في <b style="color: #ffffff;">${stats.activeDaysCount} من 7 أيام</b> هذا الأسبوع
            </div>
          </div>
          <div style="
            width: 100px;
            height: 100px;
            border-radius: 50%;
            border: 5px solid rgba(255,255,255,0.3);
            border-top-color: #fef08a;
            border-right-color: #fef08a;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.25);
            flex-shrink: 0;
          ">
            <span style="font-size: 28px; font-weight: 900; line-height: 1; font-family: sans-serif;">
              ${stats.averageProgress}%
            </span>
            <span style="font-size: 11px; opacity: 0.8; margin-top: 4px;">إنجاز الأسبوع</span>
          </div>
        </div>

        <!-- 4 Stats Cards Grid -->
        <div style="
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        ">
          <!-- Prayers -->
          <div style="
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            padding: 16px;
            text-align: right;
          ">
            <div style="font-size: 13px; opacity: 0.85; margin-bottom: 6px;">🕌 الصلوات والسنن</div>
            <div style="font-size: 26px; font-weight: 800; color: #ffffff;">
              ${stats.prayersCount} <span style="font-size: 14px; font-weight: 500; opacity: 0.8;">صلاة وسنة</span>
            </div>
          </div>

          <!-- Quran -->
          <div style="
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            padding: 16px;
            text-align: right;
          ">
            <div style="font-size: 13px; opacity: 0.85; margin-bottom: 6px;">📖 الورد القرآني</div>
            <div style="font-size: 26px; font-weight: 800; color: #ffffff;">
              ${stats.quranPages} <span style="font-size: 14px; font-weight: 500; opacity: 0.8;">صفحة مقروءة</span>
            </div>
          </div>

          <!-- Adhkar -->
          <div style="
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            padding: 16px;
            text-align: right;
          ">
            <div style="font-size: 13px; opacity: 0.85; margin-bottom: 6px;">📿 الأذكار والاستغفار</div>
            <div style="font-size: 26px; font-weight: 800; color: #ffffff;">
              ${stats.adhkarCount} <span style="font-size: 14px; font-weight: 500; opacity: 0.8;">أوراد منجزة</span>
            </div>
          </div>

          <!-- Ethics & Custom Habits -->
          <div style="
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            padding: 16px;
            text-align: right;
          ">
            <div style="font-size: 13px; opacity: 0.85; margin-bottom: 6px;">🤍 البر والعادات المخصصة</div>
            <div style="font-size: 26px; font-weight: 800; color: #ffffff;">
              ${stats.goodDeedsTotal} <span style="font-size: 14px; font-weight: 500; opacity: 0.8;">طاعة وعمل صالح</span>
            </div>
          </div>
        </div>

        <!-- 7 Days Checklist -->
        <div style="
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 18px;
          padding: 16px;
          margin-bottom: 22px;
        ">
          <div style="font-size: 13px; font-weight: 700; margin-bottom: 12px; opacity: 0.9; text-align: right;">
            تقويم الأيام السبعة:
          </div>
          <div style="display: flex; justify-content: space-between; gap: 8px;">
            ${stats.daysStats.map((d) => `
              <div style="
                flex: 1;
                background: ${d.progress >= 80 ? 'rgba(16, 185, 129, 0.25)' : d.progress > 0 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.2)'};
                border: 1px solid ${d.isToday ? '#fef08a' : d.progress >= 80 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.15)'};
                border-radius: 12px;
                padding: 10px 4px;
                text-align: center;
              ">
                <div style="font-size: 11px; opacity: 0.85; margin-bottom: 4px;">${d.dayName}</div>
                <div style="font-size: 14px; font-weight: 800; font-family: sans-serif; color: ${d.progress >= 80 ? '#6ee7b7' : '#ffffff'};">
                  ${d.isFuture ? '—' : `${d.progress}%`}
                </div>
                <div style="font-size: 10px; margin-top: 4px; opacity: 0.7;">
                  ${d.progress === 100 ? '⭐' : d.progress >= 50 ? '✓' : '•'}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Hadith & Dedication Footer -->
        <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 18px;">
          <div style="font-size: 15px; font-weight: 700; color: #fef08a; font-family: 'Amiri', serif; margin-bottom: 6px;">
            «أَحَبُّ الأَعْمَالِ إِلَى اللهِ أَدْوَمُهَا وَإِنْ قَلَّ»
          </div>
          <div style="font-size: 12px; opacity: 0.8; font-family: 'Amiri', serif;">
            جعله الله في ميزان حسناتكم وصدقة جارية عن أرواح أحمد وليلى 🤍
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    try {
      // Allow fonts to render
      await new Promise((r) => setTimeout(r, 350));

      const canvas = await safeHtml2Canvas(container, {
        scale: 2.5,
        backgroundColor: null,
        useCORS: true,
        logging: false
      });

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      return dataUrl;
    } finally {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  };

  // Share as image
  const handleShareImage = async () => {
    setIsGenerating(true);
    showToast('جاري تجهيز بطاقة الإنجاز الأسبوعية...');

    try {
      const dataUrl = await generateCardImage();

      if (Capacitor.isNativePlatform()) {
        const fileName = `weekly_achievement_${Date.now()}.jpg`;
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
          const file = new File([blob], 'weekly_achievement.jpg', { type: 'image/jpeg' });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'مشاركة'
            });
          } else {
            downloadImage(dataUrl);
          }
        } catch (e: any) {
          if (e.name !== 'AbortError') {
            downloadImage(dataUrl);
          }
        }
      } else {
        downloadImage(dataUrl);
      }
    } catch (err) {
      console.error('Error sharing weekly card:', err);
      showToast('تعذر تصدير الصورة، جاري المحاولة بطريقة بديلة');
    } finally {
      setIsGenerating(false);
    }
  };

  // Direct Download
  const handleDownloadImage = async () => {
    setIsGenerating(true);
    showToast('جاري تنزيل البطاقة...');
    try {
      const dataUrl = await generateCardImage();
      downloadImage(dataUrl);
    } catch (err) {
      console.error('Download error:', err);
      showToast('تعذر تنزيل الصورة');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (dataUrl: string) => {
    const link = document.createElement('a');
    link.download = `weekly_achievement_${moment().format('YYYY-MM-DD')}.jpg`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('تم حفظ صورة الإنجاز بنجاح 🌟');
  };

  // Copy text summary
  const handleCopySummary = async () => {
    const text = `🌟 *بطاقة حصاد الأسبوع الإيماني* 🌟
📅 *الفترة:* ${stats.dateRangeStr}
🏆 *الوسام:* ${stats.medal.title}
📊 *معدل الإنجاز الإجمالي:* ${stats.averageProgress}%

🕌 *الصلوات والسنن المؤداة:* ${stats.prayersCount} صلاة وسنة
📖 *صفحات القرآن المقروءة:* ${stats.quranPages} صفحة
📿 *الأذكار والاستغفار:* ${stats.adhkarCount} ورد
🤍 *أعمال البر والعادات المخصصة:* ${stats.goodDeedsTotal} طاعة

«أَحَبُّ الأَعْمَالِ إِلَى اللهِ أَدْوَمُهَا وَإِنْ قَلَّ»
🌱 تطبيق مصحف أحمد وليلى • مربّي العبادات`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast('تم نسخ ملخص الأسبوع للمشاركة بنجاح 📋');
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      showToast('تعذر نسخ الملخص');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6" style={{ color: hexColor }} />
            <div>
              <h2 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                بطاقة الإنجاز الأسبوعية
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                شارك إنجازك وثباتك على الطاعات للتشجيع
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Range Selector */}
        <div className="px-5 pt-3 pb-1 flex gap-2 shrink-0">
          <button
            onClick={() => setViewRange('last7')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
              viewRange === 'last7'
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            آخر 7 أيام
          </button>
          <button
            onClick={() => setViewRange('thisWeek')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
              viewRange === 'thisWeek'
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            الأسبوع الحالي (السبت - الجمعة)
          </button>
        </div>

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-y-auto px-5 py-3 overscroll-contain">
          {/* Visual Card */}
          <div
            ref={cardRef}
            className="rounded-2xl p-5 shadow-lg border relative overflow-hidden text-white"
            style={{
              background: isBlackTheme
                ? 'linear-gradient(145deg, #121214 0%, #1c1c20 100%)'
                : 'linear-gradient(145deg, #064e3b 0%, #065f46 50%, #047857 100%)',
              borderColor: isBlackTheme ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.2)'
            }}
          >
            {/* Card Header */}
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-white/20">
              <div>
                <div className="font-extrabold text-lg flex items-center gap-1.5">
                  <span>مربّي العبادات</span>
                  <span>🌙</span>
                </div>
                <div className="text-xs text-white/80 mt-0.5">
                  حصاد الأسبوع الإيماني
                </div>
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-yellow-300">
                  مصحف أحمد وليلى
                </div>
                <div className="text-[11px] text-white/75 mt-0.5">
                  {stats.dateRangeStr}
                </div>
              </div>
            </div>

            {/* Medal & Progress Ring */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex items-center justify-between mb-4">
              <div className="flex-1 pr-1">
                <div className="text-base font-extrabold text-yellow-300 flex items-center gap-1.5 mb-1">
                  <span>{stats.medal.title}</span>
                </div>
                <p className="text-xs text-white/90 leading-relaxed font-sans mb-1.5">
                  {stats.medal.desc}
                </p>
                <div className="text-[11px] text-white/75">
                  أيام الطاعة النشطة: <b className="text-white">{stats.activeDaysCount} من 7 أيام</b>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-white/30 border-t-yellow-300 border-r-yellow-300 flex flex-col items-center justify-center bg-black/20 shrink-0">
                <span className="text-xl font-black font-sans leading-none">{stats.averageProgress}%</span>
                <span className="text-[9px] text-white/80 mt-0.5">إنجاز</span>
              </div>
            </div>

            {/* Stats 2x2 Grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <div className="bg-white/10 rounded-xl p-3 border border-white/15">
                <div className="text-[11px] text-white/80 flex items-center gap-1 mb-1">
                  <Clock className="w-3.5 h-3.5 text-yellow-300" />
                  <span>الصلوات والسنن</span>
                </div>
                <div className="text-lg font-bold">
                  {stats.prayersCount} <span className="text-xs font-normal text-white/70">صلاة وسنة</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-3 border border-white/15">
                <div className="text-[11px] text-white/80 flex items-center gap-1 mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-yellow-300" />
                  <span>الورد القرآني</span>
                </div>
                <div className="text-lg font-bold">
                  {stats.quranPages} <span className="text-xs font-normal text-white/70">صفحة مقروءة</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-3 border border-white/15">
                <div className="text-[11px] text-white/80 flex items-center gap-1 mb-1">
                  <Heart className="w-3.5 h-3.5 text-yellow-300" />
                  <span>الأذكار والأوراد</span>
                </div>
                <div className="text-lg font-bold">
                  {stats.adhkarCount} <span className="text-xs font-normal text-white/70">ورد منجز</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-3 border border-white/15">
                <div className="text-[11px] text-white/80 flex items-center gap-1 mb-1">
                  <Star className="w-3.5 h-3.5 text-yellow-300" />
                  <span>البر والعبادات الخاصة</span>
                </div>
                <div className="text-lg font-bold">
                  {stats.goodDeedsTotal} <span className="text-xs font-normal text-white/70">طاعة</span>
                </div>
              </div>
            </div>

            {/* 7 Days Overview */}
            <div className="bg-white/10 rounded-xl p-3 border border-white/15 mb-3">
              <div className="text-[11px] font-bold text-white/90 mb-2">
                مستوى الاستمرارية على مدار الأسبوع:
              </div>
              <div className="grid grid-cols-7 gap-1">
                {stats.daysStats.map((d, i) => (
                  <div
                    key={i}
                    className={`rounded-lg py-2 px-1 text-center border ${
                      d.progress >= 80
                        ? 'bg-emerald-500/30 border-emerald-400/50'
                        : d.progress > 0
                        ? 'bg-white/15 border-white/20'
                        : 'bg-black/20 border-white/10'
                    } ${d.isToday ? 'ring-2 ring-yellow-300' : ''}`}
                  >
                    <div className="text-[10px] text-white/80 leading-tight">{d.dayName}</div>
                    <div className="text-xs font-bold font-sans mt-0.5 text-yellow-200">
                      {d.isFuture ? '—' : `${d.progress}%`}
                    </div>
                    <div className="text-[10px] mt-0.5">
                      {d.progress === 100 ? '⭐' : d.progress >= 50 ? '✓' : '•'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hadith Note */}
            <div className="text-center pt-2 border-t border-white/15">
              <p className="text-xs font-amiri font-bold text-yellow-300">
                «أَحَبُّ الأَعْمَالِ إِلَى اللهِ أَدْوَمُهَا وَإِنْ قَلَّ»
              </p>
              <p className="text-[10px] text-white/70 font-amiri mt-0.5">
                صدقة جارية عن أرواح أحمد وليلى 🤍
              </p>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-black/5 dark:border-white/5 bg-gray-50 dark:bg-gray-800/50 flex flex-col gap-2 shrink-0">
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={isGenerating}
              onClick={handleShareImage}
              className="flex-1 py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm text-white"
              style={{ backgroundColor: hexColor }}
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة كصورة جميلة 📲</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={isGenerating}
              onClick={handleDownloadImage}
              className="py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              title="تنزيل الصورة"
            >
              <Download className="w-4 h-4" />
            </motion.button>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleCopySummary}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>نسخ ملخص الأسبوع كنص للأهل والأصدقاء</span>
          </motion.button>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-gray-900/95 text-white text-xs font-semibold py-2 px-4 rounded-full shadow-lg z-50 pointer-events-none"
            >
              {toastMsg}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default WeeklyAchievementModal;
