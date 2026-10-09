import React from 'react';
import MainMenu from '../pages/MainMenu';
import AthkarAlSalah from '../pages/AthkarAlSalah';
import HijriCalendar from '../pages/HijriCalendar';
import ListenQuran from '../pages/ListenQuran';
import Tasbeeh from '../pages/Tasbeeh';
import HajjUmrah from '../pages/HajjUmrah';
import HisnAlmuslim from '../pages/HisnAlmuslim';
import PrayerTimes from '../pages/PrayerTimes';
import Qibla from '../pages/Qibla';
import AdkarSabahMasaa from '../pages/AdkarSabahMasaa';
import Adia from '../pages/Adia';
import Nawawi from '../pages/Nawawi';
import QuranReader from '../pages/QuranReader';
import QuranDownload from '../pages/QuranDownload';
import Calculators from '../pages/Calculators';
import VoiceControlPage from '../pages/VoiceControlPage';
import MoreMenuPage from '../pages/MoreMenuPage';
import MonthlyPrayerTimes from '../pages/MonthlyPrayerTimes';
import DailyWird from '../pages/DailyWird';
import Memorization from '../pages/Memorization';
import GlobalSearch from '../pages/GlobalSearch';
import AsmaulHusna from '../pages/AsmaulHusna';
import HabitTracker from '../pages/HabitTracker';
import CommunityPage from '../pages/CommunityPage';
import DirectChatPage from '../pages/DirectChatPage';
import GroupChatPage from '../pages/GroupChatPage';
import AhlAlQuranPage from '../pages/AhlAlQuranPage';
import OthersPage from '../pages/OthersPage';
import IslamicSitesPage from '../pages/IslamicSitesPage';

interface AppRouterProps {
    page: string;
    onBack: () => void;
    onNavigate: (pageId: string, params?: any) => void;
    onOpenThemes: () => void;
    onOpenSideMenu: () => void;
    navParams?: any;
}

const AppRouter: React.FC<AppRouterProps> = ({ page, onBack, onNavigate, onOpenThemes, onOpenSideMenu, navParams }) => {
    switch(page) {
      case 'quran':
        return <QuranReader page={page} onBack={onBack} onNavigate={onNavigate} onOpenThemes={onOpenThemes} initialLandscape={false} initialSurah={navParams?.surah ?? navParams?.initialSurah} initialAyah={navParams?.ayah ?? navParams?.initialAyah} initialPage={navParams?.page ?? navParams?.initialPage} isWirdMode={navParams?.isWird ?? navParams?.isWirdMode} isMemorizationMode={navParams?.isMemorization ?? navParams?.isMemorizationMode} memorizationSettings={navParams?.memorizationSettings} navParams={navParams} />;
      case 'quran-landscape':
        return <QuranReader page={page} onBack={onBack} onNavigate={onNavigate} onOpenThemes={onOpenThemes} initialLandscape={true} initialSurah={navParams?.surah ?? navParams?.initialSurah} initialAyah={navParams?.ayah ?? navParams?.initialAyah} initialPage={navParams?.page ?? navParams?.initialPage} isWirdMode={navParams?.isWird ?? navParams?.isWirdMode} isMemorizationMode={navParams?.isMemorization ?? navParams?.isMemorizationMode} memorizationSettings={navParams?.memorizationSettings} navParams={navParams} />;
      case 'quran-download':
        return <QuranDownload onBack={onBack} onNavigate={onNavigate} />;
      case 'salah-adhkar':
        return <AthkarAlSalah onBack={onBack} onNavigate={onNavigate} />;
      case 'calendar':
        return <HijriCalendar onBack={onBack} onNavigate={onNavigate} />;
      case 'listen':
        return <ListenQuran onBack={onBack} onNavigate={onNavigate} onOpenThemes={onOpenThemes} />;
      case 'tasbeeh':
        return <Tasbeeh onBack={onBack} onNavigate={onNavigate} />;
      case 'hajj-umrah':
        return <HajjUmrah onBack={onBack} onNavigate={onNavigate} />;
      case 'hisn-muslim':
        return <HisnAlmuslim onBack={onBack} onNavigate={onNavigate} />;
      case 'prayer-times':
        return <PrayerTimes onBack={onBack} onNavigate={onNavigate} />;
      case 'monthly-prayer-times':
        return <MonthlyPrayerTimes onBack={onBack} onNavigate={onNavigate} />;
      case 'qibla':
        return <Qibla onBack={onBack} onNavigate={onNavigate} />;
      case 'sabah-masaa':
        return <AdkarSabahMasaa onBack={onBack} onNavigate={onNavigate} />;
      case 'adia':
        return <Adia onBack={onBack} onNavigate={onNavigate} />;
      case 'nawawi':
        return <Nawawi onBack={onBack} onNavigate={onNavigate} />;
      case 'calculators':
        return <Calculators onBack={onBack} onNavigate={onNavigate} />;
      case 'voice-control':
        return <VoiceControlPage onBack={onBack} onNavigate={onNavigate} />;
      case 'more-menu':
        return <MoreMenuPage onBack={onBack} onNavigate={onNavigate} />;
      case 'daily-wird':
        return <DailyWird onBack={onBack} onNavigate={onNavigate} />;
      case 'memorization':
        return <Memorization onBack={onBack} onNavigate={onNavigate} />;
      case 'search':
        return <GlobalSearch onBack={onBack} onNavigate={onNavigate} />;
      case 'asmaul-husna':
        return <AsmaulHusna onBack={onBack} onNavigate={onNavigate} />;
      case 'habit-tracker':
        return <HabitTracker onBack={onBack} onNavigate={onNavigate} />;
      case 'community':
        return <CommunityPage onBack={onBack} onNavigate={onNavigate} initialTab={navParams?.initialTab || navParams?.returnTab} />;
      case 'direct-chat':
        return <DirectChatPage partnerUserId={navParams?.partnerUserId || ''} onBack={onBack} onNavigate={onNavigate} />;
      case 'group-chat':
        return <GroupChatPage groupId={navParams?.groupId || ''} onBack={onBack} onNavigate={onNavigate} />;
      case 'ahl-al-quran':
        return <AhlAlQuranPage onBack={onBack} onNavigate={onNavigate} />;
      case 'others':
        return <OthersPage onBack={onBack} onNavigate={onNavigate} onOpenThemes={onOpenThemes} />;
      case 'islamic-sites':
        return <IslamicSitesPage onBack={onBack} onNavigate={onNavigate} />;
      case 'home':
      default:
        return <MainMenu onNavigate={onNavigate} onOpenThemes={onOpenThemes} onOpenSideMenu={onOpenSideMenu} />;
    }
};

export default AppRouter;
