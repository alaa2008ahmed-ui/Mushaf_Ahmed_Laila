import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Crown, BookOpen, UserPlus } from 'lucide-react';
import { ahlAlQuranService, CalendarType } from '../../services/ahlAlQuranService';
import { communityService } from '../../services/communityService';
import { shareAsImage } from '../../utils/shareAsImage';
import { toArabic } from '../QuranReader/constants';
import { markPageAsSeen } from '../../utils/badgeManager';
import { useLanguage } from '../../context/LanguageContext';

interface TopLeadersCardProps {
  theme: any;
  onNavigate: (pageId: string, params?: any) => void;
  setToastMessage: (msg: string) => void;
}

export const TopLeadersCard: React.FC<TopLeadersCardProps> = ({
  theme,
  onNavigate,
  setToastMessage,
}) => {
  const { language, dir, t, formatNumber } = useLanguage();
  const [topLeaders, setTopLeaders] = useState<any[]>([]);
  const [monthName, setMonthName] = useState<string>('');
  const [isRegistered, setIsRegistered] = useState<boolean>(() => communityService.isProfileComplete());

  const updateLeaders = useCallback(() => {
    const registered = communityService.isProfileComplete();
    setIsRegistered(registered);

    if (!registered) {
      setTopLeaders([]);
      setMonthName('');
      return;
    }

    let calType: CalendarType = 'hijri';
    try {
      const saved = localStorage.getItem('ahl_al_quran_calendar_type');
      if (saved === 'hijri' || saved === 'gregorian') calType = saved as CalendarType;
    } catch (e) {}

    const cur = communityService.getCurrentUser();
    const curMonthKey = calType === 'hijri' 
      ? ahlAlQuranService.getCurrentHijriKey() 
      : ahlAlQuranService.getCurrentGregorianKey();

    let displayMonthName = calType === 'hijri'
      ? ahlAlQuranService.getHijriMonthName(curMonthKey)
      : ahlAlQuranService.getGregorianMonthName(curMonthKey);

    const board = ahlAlQuranService.getLeaderboard(curMonthKey, cur?.userId);
    let activeUsers = board.filter(item => item.pages > 0 || item.khatmas > 0);

    // If no reads recorded yet in current month, check lifetime stats
    if (activeUsers.length === 0) {
      const lifetimeBoard = ahlAlQuranService.getLeaderboard('lifetime', cur?.userId);
      const activeLifetime = lifetimeBoard.filter(item => item.pages > 0 || item.khatmas > 0);
      if (activeLifetime.length > 0) {
        activeUsers = activeLifetime;
        displayMonthName = 'الإجمالي التراكمي';
      }
    }

    setTopLeaders(activeUsers.slice(0, 3));
    setMonthName(displayMonthName);
  }, []);

  useEffect(() => {
    updateLeaders();
    const unsub = ahlAlQuranService.subscribe(() => {
      updateLeaders();
    });

    const handleUpdate = () => updateLeaders();
    window.addEventListener('ahl_al_quran_updated', handleUpdate);
    window.addEventListener('ahl_al_quran_page_recorded', handleUpdate);
    window.addEventListener('community_user_updated', handleUpdate);
    window.addEventListener('community_user_deleted', handleUpdate);

    return () => {
      unsub();
      window.removeEventListener('ahl_al_quran_updated', handleUpdate);
      window.removeEventListener('ahl_al_quran_page_recorded', handleUpdate);
      window.removeEventListener('community_user_updated', handleUpdate);
      window.removeEventListener('community_user_deleted', handleUpdate);
    };
  }, [updateLeaders]);

  const translateMonthBadge = (badge: string) => {
    if (language === 'ar' || !badge) return badge;
    if (badge === 'الإجمالي التراكمي' || badge === 'جميع الأوقات (التراكمي)') {
      return t('top_leaders.all_time', 'All-Time Total');
    }

    const hijriMap: Record<string, string> = {
      'محرم': 'Muharram',
      'صفر': 'Safar',
      'ربيع الأول': "Rabi' al-Awwal",
      'ربيع الآخر': "Rabi' al-Thani",
      'جمادى الأولى': 'Jumada al-Ula',
      'جمادى الآخرة': 'Jumada al-Thaniyah',
      'رجب': 'Rajab',
      'شعبان': "Sha'ban",
      'رمضان': 'Ramadan',
      'شوال': 'Shawwal',
      'ذو القعدة': "Dhu al-Qi'dah",
      'ذو الحجة': 'Dhu al-Hijjah'
    };

    const gregMap: Record<string, string> = {
      'يناير': 'January', 'فبراير': 'February', 'مارس': 'March', 'أبريل': 'April',
      'مايو': 'May', 'يونيو': 'June', 'يوليو': 'July', 'أغسطس': 'August',
      'سبتمبر': 'September', 'أكتوبر': 'October', 'نوفمبر': 'November', 'ديسمبر': 'December'
    };

    let translated = badge;
    for (const [ar, en] of Object.entries(hijriMap)) {
      if (translated.includes(ar)) {
        translated = translated.replace(ar, en);
        translated = translated.replace(/هـ$/, ' AH').replace(/هـ/g, ' AH');
        return translated;
      }
    }

    for (const [ar, en] of Object.entries(gregMap)) {
      if (translated.includes(ar)) {
        translated = translated.replace(ar, en);
        translated = translated.replace(/م$/, ' AD').replace(/م/g, ' AD');
        return translated;
      }
    }

    return translated;
  };

  const formatProgressText = (summaryText: string) => {
    if (language === 'ar' || !summaryText) return summaryText;
    return summaryText
      .replace(/صفحة واحدة/g, '1 Page')
      .replace(/صفحتان/g, '2 Pages')
      .replace(/(\d+)\s*صفحات/g, '$1 Pages')
      .replace(/(\d+)\s*صفحة/g, '$1 Pages')
      .replace(/جزء واحد/g, "1 Juz'")
      .replace(/جزآن/g, "2 Juz'")
      .replace(/(\d+)\s*أجزاء/g, "$1 Juz'")
      .replace(/(\d+)\s*جزء/g, "$1 Juz'")
      .replace(/ختمة واحدة/g, '1 Khatmah')
      .replace(/ختمتان/g, '2 Khatmahs')
      .replace(/(\d+)\s*ختمات/g, '$1 Khatmahs')
      .replace(/(\d+)\s*ختمة/g, '$1 Khatmah');
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const isEn = language === 'en';
    const rawMonth = monthName === 'الإجمالي التراكمي' ? t('top_leaders.all_time', 'الإجمالي التراكمي') : monthName;
    const displayMonth = translateMonthBadge(rawMonth);
    let shareBody = '';

    if (topLeaders.length > 0) {
      const rankTitles = isEn 
        ? ['1st Place 🥇', '2nd Place 🥈', '3rd Place 🥉'] 
        : ['المركز الأول 🥇', 'المركز الثاني 🥈', 'المركز الثالث 🥉'];
      const lines = topLeaders.map((item, idx) => {
        const title = rankTitles[idx] || (isEn ? `Rank ${item.rank}` : `المركز ${toArabic(item.rank)}`);
        const progress = item.khatmas > 0 
          ? (isEn 
              ? `${item.khatmas} Khatmah • ${formatProgressText(item.formattedProgress.summaryText)}` 
              : `${toArabic(item.khatmas)} ختمة • ${item.formattedProgress.summaryText}`)
          : formatProgressText(item.formattedProgress.summaryText);
        return isEn 
          ? `👑 ${title}: ${item.displayName}\n📖 Achievement: ${progress}`
          : `👑 ${title}: ${item.displayName}\n📖 الإنجاز: ${progress}`;
      }).join('\n\n');

      shareBody = isEn
        ? `🏆 Ahl Al-Qur'an Honor Leaderboard 🏆\n📅 ${displayMonth}\n\n${lines}\n\nAllah says: "And for this let the competitors compete." [83:26]`
        : `🏆 لوحة شرف متصدري أهل القرآن 🏆\n📅 ${displayMonth}\n\n${lines}\n\nقال تعالى: ﴿وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ﴾`;
    } else {
      shareBody = isEn
        ? `🏆 Ahl Al-Qur'an Honor Leaderboard 🏆\n📅 ${displayMonth}\n\nBe the first to lead in reading and completing the Holy Qur'an this blessed month!\n\nAllah says: "And for this let the competitors compete." [83:26]`
        : `🏆 لوحة شرف متصدري أهل القرآن 🏆\n📅 ${displayMonth}\n\nكن أول المتصدرين في قراءة وختم القرآن الكريم لهذا الشهر المبارك!\n\nقال تعالى: ﴿وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ﴾`;
    }

    await shareAsImage({
      text: shareBody,
      title: isEn ? 'Ahl Al-Qur\'an Leaders' : 'متصدرو أهل القرآن',
      category: isEn ? `Honor Board • ${displayMonth}` : `لوحة الشرف • ${displayMonth}`,
      source: isEn ? 'Mushaf Ahmed & Laila • Recitation & Reflection' : 'مصحف أحمد وليلى • تلاوة وتدبر',
      theme,
      setToastMessage
    });
  };

  const isBlackTheme = theme?.bgColor === '#000000' || theme?.name === 'اسود' || theme?.name === 'black' || theme?.name?.includes?.('أسود') || theme?.name?.includes?.('اسود');
  const primaryAccent = isBlackTheme ? '#FFFFFF' : (theme?.palette?.[0] || '#10b981');
  const displayMonth = translateMonthBadge(monthName);

  return (
    <div 
      className="w-full mt-1 py-3.5 px-4 sm:px-5 rounded-2xl shadow-lg border-2 relative overflow-hidden flex flex-col gap-2.5 cursor-pointer transition-all duration-300 hover:shadow-xl active:scale-[0.99]"
      style={{ 
        borderColor: primaryAccent, 
        backgroundColor: theme?.cardBg || 'rgba(255, 255, 255, 0.8)',
        fontFamily: theme?.font
      }}
      dir={dir}
      onClick={() => {
        if (!isRegistered) {
          onNavigate('community');
        } else {
          markPageAsSeen('ahl-al-quran');
          onNavigate('ahl-al-quran');
        }
      }}
    >
      {/* Header with Title, Month badge and Action buttons */}
      <div className="flex items-center justify-between z-10 w-full relative">
        <div className="flex items-center gap-2" style={{ color: primaryAccent }}>
          <Trophy className="w-4 h-4 shrink-0" />
          <span className="text-[12px] font-bold font-kufi">{t('top_leaders.title', 'متصدرو أهل القرآن')}</span>
          {isRegistered && monthName && (
            <span 
              className="text-[10px] px-2 py-0.5 rounded-full font-bold opacity-90 truncate max-w-[130px] sm:max-w-none"
              style={{ 
                backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.18)' : `${primaryAccent}15`, 
                color: primaryAccent
              }}
            >
              {displayMonth}
            </span>
          )}
        </div>

        {isRegistered && (
          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button"
              onClick={handleShare}
              className="p-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              title={t('top_leaders.share_tooltip', 'مشاركة كصورة')}
              style={{ color: primaryAccent }}
            >
              <i className="fa-solid fa-share-nodes text-xs"></i>
            </button>
          </div>
        )}
      </div>

      {/* Body: Prompt to register if unregistered; otherwise Top 3 List or Empty State */}
      {!isRegistered ? (
        <div className="flex flex-col items-center justify-center py-2.5 px-3 text-center gap-2 relative z-10">
          <div 
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${primaryAccent}15`, color: primaryAccent }}
          >
            <Trophy className="w-5 h-5 opacity-90" />
          </div>
          <p className="text-xs font-bold leading-relaxed" style={{ color: theme?.textColor }}>
            {t('top_leaders.register_prompt', 'سجّل اسمك في مجتمع التواصل لتظهر لك بيانات وتصنيف متصدري أهل القرآن وتشاركهم التنافس الإيماني! 🌟')}
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('community');
            }}
            className="px-4 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            style={{
              backgroundColor: isBlackTheme ? '#000000' : primaryAccent,
              color: isBlackTheme ? '#FFFFFF' : (theme?.btnText || '#FFFFFF'),
              border: isBlackTheme ? '1px solid #FFFFFF' : undefined
            }}
          >
            <UserPlus size={14} />
            <span>{t('top_leaders.register_btn', 'التسجيل في مجتمع التواصل')}</span>
          </button>
        </div>
      ) : topLeaders.length > 0 ? (
        <div className="flex flex-col gap-1.5 w-full relative z-10">
          {topLeaders.map((leader, idx) => {
            const rank = idx + 1;
            const rankColor = rank === 1 ? '#D4AF37' : rank === 2 ? '#94A3B8' : '#CD7F32';
            const medalIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';

            return (
              <div
                key={leader.record.userId || idx}
                className="flex items-center justify-between py-2 px-2.5 rounded-xl transition-all border"
                style={{
                  backgroundColor: `${rankColor}0a`,
                  borderColor: `${rankColor}35`,
                }}
              >
                {/* Medal + Avatar + Username */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base select-none shrink-0">{medalIcon}</span>

                  {leader.displayAvatar ? (
                    <img 
                      src={leader.displayAvatar} 
                      alt="" 
                      className="w-7 h-7 rounded-full object-cover shrink-0 border"
                      style={{ borderColor: rankColor }}
                    />
                  ) : (
                    <div 
                      className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 border"
                      style={{ 
                        backgroundColor: `${rankColor}20`, 
                        color: rankColor,
                        borderColor: rankColor
                      }}
                    >
                      {leader.displayName ? leader.displayName.charAt(0) : 'Q'}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 min-w-0">
                    <span 
                      className="font-bold text-xs truncate max-w-[125px] sm:max-w-[180px]"
                      style={{ color: rankColor }}
                    >
                      {leader.displayName}
                    </span>
                    {leader.isCurrentUser && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                        {t('top_leaders.you', 'أنت')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress info */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span 
                    className="text-[11px] font-bold font-kufi"
                    style={{ color: theme?.textColor }}
                  >
                    {formatProgressText(leader.formattedProgress.summaryText)}
                  </span>
                  {leader.khatmas > 0 && (
                    <span 
                      className="text-[9px] px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5"
                      style={{ 
                        backgroundColor: `${primaryAccent}20`, 
                        color: primaryAccent 
                      }}
                    >
                      <Crown size={10} />
                      <span>{formatNumber(leader.khatmas)}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-2 px-3 text-center gap-2 relative z-10">
          <div 
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${primaryAccent}15`, color: primaryAccent }}
          >
            <Trophy className="w-5 h-5 opacity-90" />
          </div>
          <p className="text-xs font-bold leading-relaxed" style={{ color: theme?.textColor }}>
            {t('top_leaders.empty_prompt', 'كن أول المتصدرين في قراءة القرآن لهذا الشهر! 🌟')}
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('quran');
            }}
            className="px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            style={{
              backgroundColor: primaryAccent,
              color: theme?.btnText || '#FFFFFF'
            }}
          >
            <BookOpen size={13} />
            <span>{t('top_leaders.start_reading', 'ابدأ القراءة الآن')}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TopLeadersCard;
