import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Crown, BookOpen } from 'lucide-react';
import { ahlAlQuranService, CalendarType } from '../../services/ahlAlQuranService';
import { communityService } from '../../services/communityService';
import { shareAsImage } from '../../utils/shareAsImage';
import { toArabic } from '../QuranReader/constants';

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
  const [topLeaders, setTopLeaders] = useState<any[]>([]);
  const [monthName, setMonthName] = useState<string>('');

  const updateLeaders = useCallback(() => {
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

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    let shareBody = '';
    if (topLeaders.length > 0) {
      const rankTitles = ['المركز الأول 🥇', 'المركز الثاني 🥈', 'المركز الثالث 🥉'];
      const lines = topLeaders.map((item, idx) => {
        const title = rankTitles[idx] || `المركز ${toArabic(item.rank)}`;
        const progress = item.khatmas > 0 
          ? `${toArabic(item.khatmas)} ختمة • ${item.formattedProgress.summaryText}` 
          : item.formattedProgress.summaryText;
        return `👑 ${title}: ${item.displayName}\n📖 الإنجاز: ${progress}`;
      }).join('\n\n');

      shareBody = `🏆 لوحة شرف متصدري أهل القرآن 🏆\n📅 ${monthName}\n\n${lines}\n\nقال تعالى: ﴿وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ﴾`;
    } else {
      shareBody = `🏆 لوحة شرف متصدري أهل القرآن 🏆\n📅 ${monthName}\n\nكن أول المتصدرين في قراءة وختم القرآن الكريم لهذا الشهر المبارك!\n\nقال تعالى: ﴿وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ﴾`;
    }

    await shareAsImage({
      text: shareBody,
      title: 'متصدرو أهل القرآن',
      category: `لوحة الشرف • ${monthName}`,
      source: 'مصحف أحمد وليلى • تلاوة وتدبر',
      theme,
      setToastMessage
    });
  };

  const isBlackTheme = theme?.bgColor === '#000000' || theme?.name === 'اسود' || theme?.name === 'black';
  const primaryAccent = isBlackTheme ? '#FFFFFF' : (theme?.palette?.[0] || '#10b981');

  return (
    <div 
      className="w-full mt-1 py-3.5 px-4 sm:px-5 rounded-2xl shadow-lg border-2 relative overflow-hidden flex flex-col gap-2.5 cursor-pointer transition-all duration-300 hover:shadow-xl active:scale-[0.99]"
      style={{ 
        borderColor: primaryAccent, 
        backgroundColor: theme?.cardBg || 'rgba(255, 255, 255, 0.8)',
        fontFamily: theme?.font
      }}
      dir="rtl"
      onClick={() => onNavigate('ahl-al-quran')}
    >
      {/* Header with Title, Month badge and Action buttons */}
      <div className="flex items-center justify-between z-10 w-full relative">
        <div className="flex items-center gap-2" style={{ color: primaryAccent }}>
          <Trophy className="w-4 h-4 shrink-0" />
          <span className="text-[12px] font-bold font-kufi">متصدرو أهل القرآن</span>
          {monthName && (
            <span 
              className="text-[10px] px-2 py-0.5 rounded-full font-bold opacity-90 truncate max-w-[130px] sm:max-w-none"
              style={{ 
                backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.18)' : `${primaryAccent}15`, 
                color: primaryAccent
              }}
            >
              {monthName}
            </span>
          )}
        </div>

        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <button 
            type="button"
            onClick={handleShare}
            className="p-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            title="مشاركة كصورة"
            style={{ color: primaryAccent }}
          >
            <i className="fa-solid fa-share-nodes text-xs"></i>
          </button>
        </div>
      </div>

      {/* Body: Top 3 List or Motivational Empty State */}
      {topLeaders.length > 0 ? (
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
                {/* Right: Medal + Avatar + Username */}
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
                      {leader.displayName ? leader.displayName.charAt(0) : 'ق'}
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
                        أنت
                      </span>
                    )}
                  </div>
                </div>

                {/* Left: Progress info */}
                <div className="flex items-center gap-1.5 shrink-0 text-left">
                  <span 
                    className="text-[11px] font-bold font-kufi"
                    style={{ color: theme?.textColor }}
                  >
                    {leader.formattedProgress.summaryText}
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
                      <span>{toArabic(leader.khatmas)}</span>
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
            كن أول المتصدرين في قراءة القرآن لهذا الشهر! 🌟
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
            <span>ابدأ القراءة الآن</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TopLeadersCard;
