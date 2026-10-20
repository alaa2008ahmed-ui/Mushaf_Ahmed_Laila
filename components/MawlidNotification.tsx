import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Star, Volume2, VolumeX, Share2, Check, Sparkles, Moon, Calendar } from 'lucide-react';
import moment from 'moment-hijri';
import { useTheme } from '../context/ThemeContext';
import { playNotificationSound, stopNotificationSound } from '../utils/prayerTimesUtils';

interface OccasionDef {
    id: 'mawlid' | 'eid_fitr' | 'eid_adha' | 'islamic_new_year' | 'ramadan' | 'ramadan_last_ten';
    title: string;
    subtitle: (today: moment.Moment) => string;
    quote: string;
    description: string;
    soundFile: string;
    soundLabel: string;
    actionText: string;
    greetingShare: (today: moment.Moment) => string;
    accentColor: string;
    iconType: 'star' | 'moon' | 'sparkles' | 'calendar';
    badge: string;
    isActive: (today: moment.Moment) => boolean;
}

const ISLAMIC_OCCASIONS: OccasionDef[] = [
    {
        id: 'mawlid',
        title: 'مَولِدُ الهُدَى ﷺ',
        subtitle: () => '١٢ ربيع الأول - ذكرى ميلاد سيد الخلق أجمعين',
        quote: '«وُلِدَ الهُدَى فَالكَائِنَاتُ ضِيَاءُ .. وَفَمُ الزَّمَانِ تَبَسُّمٌ وَثَنَاءُ»',
        description: 'نبارك لكم ذكرى مولد الحبيب المصطفى محمد ﷺ، صلوات ربي وسلامه عليه. جعل الله أيامكم عامرة بنوره وسنته، وأنار قلوبكم بمحبته وطاعته.',
        soundFile: '/assets/audio/salah.mp3',
        soundLabel: 'الصلاة على النبي ﷺ',
        actionText: 'صلّوا عليه وسلّموا تسليماً',
        greetingShare: () => 'نبارك لكم ذكرى مولد خير الأنام نبينا محمد ﷺ. صلوات ربي وسلامه عليه وعلى آله وصحبه أجمعين، وكل عام وأنتم بخير.',
        accentColor: '#10b981',
        iconType: 'star',
        badge: 'ذكرى المولد النبوي الشريف',
        isActive: (today) => today.iMonth() === 2 && today.iDate() === 12
    },
    {
        id: 'eid_fitr',
        title: 'عِيدُ فِطْرٍ مُبَارَك',
        subtitle: () => 'تقبل الله طاعتكم وصالح أعمالكم',
        quote: '«اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، لا إِلَهَ إِلا اللهُ، اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، وَلِلهِ الحَمْدُ»',
        description: 'يسرنا أن نرفع إليكم أسمى آيات التهاني والتبريكات بمناسبة حلول عيد الفطر المبارك، سائلين المولى عز وجل أن يتقبل صيامكم وقيامكم، وأن يعيده عليكم باليمن والمسرات والبركات.',
        soundFile: '/assets/audio/takbeer1.mp3',
        soundLabel: 'تكبيرات العيد المبارك',
        actionText: 'تقبل الله منا ومنكم صالح الأعمال',
        greetingShare: () => 'عيد فطر مبارك! تقبل الله منا ومنكم الصيام والقيام وصالح الأعمال، وجعل أيامكم كلها أعياداً وفرحة ومسرات، وكل عام وأنتم بألف خير.',
        accentColor: '#059669',
        iconType: 'moon',
        badge: 'عيد الفطر المبارك',
        isActive: (today) => today.iMonth() === 9 && (today.iDate() >= 1 && today.iDate() <= 3)
    },
    {
        id: 'eid_adha',
        title: 'عِيدُ أَضْحَى مُبَارَك',
        subtitle: (today) => today.iDate() === 9 ? 'يوم عرفة المبارك - خير يوم طلعت عليه الشمس' : 'تقبل الله منا ومنكم الطاعات والأضاحي',
        quote: '«لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الحَمْدَ وَالنِّعْمَةَ لَكَ وَالمُلْك»',
        description: 'نهنئكم بحلول عيد الأضحى المبارك وأيام التشريق العظيمة، رزقكم الله وأحبابكم حج بيته الحرام وصالح الأعمال والمغفرة والرضوان.',
        soundFile: '/assets/audio/takbeer1.mp3',
        soundLabel: 'تكبيرات الحج والعيد',
        actionText: 'كل عام وأنتم إلى الله أقرب',
        greetingShare: () => 'عيد أضحى مبارك! لبيك اللهم لبيك.. نسأل الله أن يتقبل منكم الطاعات والأضاحي وأن يرزقنا وإياكم زيارة بيته الحرام، وكل عام وأنتم بخير.',
        accentColor: '#d97706',
        iconType: 'sparkles',
        badge: 'عيد الأضحى المبارك',
        isActive: (today) => today.iMonth() === 11 && (today.iDate() >= 9 && today.iDate() <= 13)
    },
    {
        id: 'islamic_new_year',
        title: 'عَامٌ هِجْرِيٌّ جَدِيدٌ مُبَارَك',
        subtitle: (today) => `فاتحة عام ${today.iYear()} هـ المبارك`,
        quote: '«اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالأَمْنِ وَالإِيمَانِ، وَالسَّلامَةِ وَالإِسْلامِ، وَالتَّوْفِيقِ لِمَا تُحِبُّ وَتَرْضَى»',
        description: 'نسأل الله العلي القدير أن يجعله عام خير وبركة ونصر وسلام، وأن يرزقكم فيه سعادة الدارين وتيسير كل أمر.',
        soundFile: '/assets/audio/takbeer1.mp3',
        soundLabel: 'تكبيرات وبهجة العام الجديد',
        actionText: 'نسأل الله القبول والتوفيق',
        greetingShare: (today) => `عام هجري جديد مبارك ${today.iYear()} هـ! نسأل الله أن يجعله عام فتوح وبركة وسلام وتوفيق لكم ولأسركم الكريمة، وكل عام وأنتم بخير.`,
        accentColor: '#6366f1',
        iconType: 'calendar',
        badge: 'رأس السنة الهجرية الجديدة',
        isActive: (today) => today.iMonth() === 0 && today.iDate() === 1
    },
    {
        id: 'ramadan',
        title: 'شَهْرُ رَمَضَانَ المُبَارَك',
        subtitle: (today) => `فاتحة شهر رمضان المعظم ${today.iYear()} هـ`,
        quote: '«شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِلنَّاسِ وَبَيِّنَاتٍ مِّنَ الْهُدَى وَالْفُرْقَانِ»',
        description: 'نبارك لكم حلول شهر رمضان المبارك، شهر القرآن والرحمة والمغفرة والعتق من النار. جعل الله صيامكم وقيامكم مقبولاً وضاعف لكم فيه الأجور.',
        soundFile: '/assets/audio/takbeer1.mp3',
        soundLabel: 'تهنئة شهر رمضان المبارك',
        actionText: 'مبارك عليكم شهر القرآن',
        greetingShare: (today) => `مبارك عليكم شهر رمضان المعظم ${today.iYear()} هـ! تقبل الله منا ومنكم الصيام والقيام، وجعلنا وإياكم من عتقائه من الشهر الكريم، وكل عام وأنتم بخير.`,
        accentColor: '#047857',
        iconType: 'moon',
        badge: 'شهر رمضان المبارك',
        isActive: (today) => today.iMonth() === 8 && (today.iDate() >= 1 && today.iDate() <= 3)
    },
    {
        id: 'ramadan_last_ten',
        title: 'العَشْرُ الأَوَاخِرُ مِنْ رَمَضَان',
        subtitle: (today) => `ليالي العتق من النيران والتماس ليلة القدر ${today.iYear()} هـ`,
        quote: '«كَانَ رَسُولُ اللهِ ﷺ إِذَا دَخَلَ العَشْرُ شَدَّ مِئْزَرَهُ، وَأَحْيَا لَيْلَهُ، وَأَيْقَظَ أَهْلَهُ»',
        description: 'أهلاً بالعشر الأواخر من شهر رمضان المبارك، وفيها ليلة القدر خيرٌ من ألف شهر. فاغتنموا أوقاتها بالصلاة والقيام وتلاوة القرآن، وأكثروا من دعاء: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ العَفْوَ فَاعْفُ عَنِّي".',
        soundFile: '/assets/audio/takbeer1.mp3',
        soundLabel: 'تكبيرات وذكر العشر الأواخر',
        actionText: 'اجتهدوا في القيام والدعاء',
        greetingShare: (today) => `حلّت علينا العشر الأواخر من شهر رمضان المبارك ${today.iYear()} هـ، وفيها ليلة القدر خير من ألف شهر. نسأل الله أن يبلغنا وإياكم إياها، ويتقبل منا ومنكم صالح الأعمال، ويعتق رقابنا جميعاً من النار.`,
        accentColor: '#059669',
        iconType: 'sparkles',
        badge: 'العشر الأواخر من رمضان',
        isActive: (today) => today.iMonth() === 8 && (today.iDate() >= 20 && today.iDate() <= 22)
    }
];

const MawlidNotification: React.FC = () => {
    const [currentOccasion, setCurrentOccasion] = useState<OccasionDef | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isPlayingSound, setIsPlayingSound] = useState(false);
    const [copied, setCopied] = useState(false);
    const { theme, themeKey } = useTheme();
    const isBlackTheme = theme?.bgColor === '#000000' || themeKey === 'deep_black';
    const timerRef = useRef<any>(null);

    // التحقق التلقائي عند بدء التطبيق
    useEffect(() => {
        const checkOccasions = () => {
            const today = moment();
            const year = today.iYear();

            for (const occ of ISLAMIC_OCCASIONS) {
                if (occ.isActive(today)) {
                    const storageKey = `islamic_occasion_shown_${occ.id}_${year}`;
                    const lastShown = localStorage.getItem(storageKey);
                    
                    if (!lastShown) {
                        setCurrentOccasion(occ);
                        setIsOpen(true);
                        // تشغيل النغمة الخاصة بالمناسبة تلقائياً
                        try {
                            playNotificationSound(occ.soundFile, true);
                            setIsPlayingSound(true);
                        } catch (e) {
                            console.warn("Audio autoplay blocked or failed:", e);
                        }
                    }
                    return;
                }
            }
        };

        checkOccasions();

        // الاستماع للأحداث اليدوية أو الضغط على الإشعار في شريط التنبيهات
        const handleManualTrigger = (e: CustomEvent) => {
            const detail = e.detail;
            let targetOcc: OccasionDef | undefined;
            if (detail?.occasionId) {
                if (detail.occasionId === 51) targetOcc = ISLAMIC_OCCASIONS.find(o => o.id === 'mawlid');
                if (detail.occasionId === 52) targetOcc = ISLAMIC_OCCASIONS.find(o => o.id === 'eid_fitr');
                if (detail.occasionId === 53) targetOcc = ISLAMIC_OCCASIONS.find(o => o.id === 'eid_adha');
                if (detail.occasionId === 54) targetOcc = ISLAMIC_OCCASIONS.find(o => o.id === 'islamic_new_year');
                if (detail.occasionId === 55) targetOcc = ISLAMIC_OCCASIONS.find(o => o.id === 'ramadan');
                if (detail.occasionId === 56) targetOcc = ISLAMIC_OCCASIONS.find(o => o.id === 'ramadan_last_ten');
            } else if (detail?.occasionKey) {
                targetOcc = ISLAMIC_OCCASIONS.find(o => o.id === detail.occasionKey);
            }
            if (targetOcc) {
                setCurrentOccasion(targetOcc);
                setIsOpen(true);
                playNotificationSound(targetOcc.soundFile, true);
                setIsPlayingSound(true);
            }
        };

        window.addEventListener('show-islamic-occasion-alert' as any, handleManualTrigger as any);
        window.addEventListener('preview-islamic-occasion' as any, handleManualTrigger as any);

        return () => {
            window.removeEventListener('show-islamic-occasion-alert' as any, handleManualTrigger as any);
            window.removeEventListener('preview-islamic-occasion' as any, handleManualTrigger as any);
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const handleClose = () => {
        stopNotificationSound();
        setIsPlayingSound(false);
        if (currentOccasion) {
            const year = moment().iYear();
            localStorage.setItem(`islamic_occasion_shown_${currentOccasion.id}_${year}`, 'true');
        }
        setIsOpen(false);
    };

    const toggleSound = () => {
        if (!currentOccasion) return;
        if (isPlayingSound) {
            stopNotificationSound();
            setIsPlayingSound(false);
        } else {
            playNotificationSound(currentOccasion.soundFile, true);
            setIsPlayingSound(true);
        }
    };

    const handleShare = async () => {
        if (!currentOccasion) return;
        const today = moment();
        const text = currentOccasion.greetingShare(today);

        if (navigator.share) {
            try {
                await navigator.share({
                    title: currentOccasion.title,
                    text: text,
                });
                return;
            } catch (e) {
                // Ignore cancel
            }
        }

        // Fallback to clipboard
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch (e) {
            console.error('Clipboard failed', e);
        }
    };

    if (!currentOccasion) return null;

    const accentColor = currentOccasion.accentColor || theme.palette?.[0] || '#10b981';
    const today = moment();

    const renderOccasionIcon = () => {
        switch (currentOccasion.iconType) {
            case 'moon':
                return <Moon size={46} className="text-emerald-500 fill-emerald-500/20" />;
            case 'sparkles':
                return <Sparkles size={46} className="text-amber-500 fill-amber-500/20" />;
            case 'calendar':
                return <Calendar size={46} className="text-indigo-500" />;
            case 'star':
            default:
                return <Star size={46} className="text-yellow-500 fill-yellow-500" />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[3000] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md"
                    dir="rtl"
                >
                    <motion.div 
                        initial={{ scale: 0.88, opacity: 0, y: 24 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.88, opacity: 0, y: 24 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md overflow-hidden rounded-3xl shadow-2xl border"
                        style={{ 
                            backgroundColor: isBlackTheme ? '#0f0f11' : (theme.cardBg || '#ffffff'), 
                            color: isBlackTheme ? '#ffffff' : theme.textColor,
                            borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.2)' : `${accentColor}40`
                        }}
                    >
                        {/* Decorative Top Ambient Glow */}
                        <div 
                            className="absolute top-0 left-0 right-0 h-40 opacity-20 pointer-events-none" 
                            style={{ background: `radial-gradient(ellipse at top, ${accentColor}, transparent 70%)` }}
                        />

                        {/* Top Controls: Sound Toggle + Close */}
                        <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between z-10">
                            {/* زر النغمة والتكبيرات */}
                            <button
                                type="button"
                                onClick={toggleSound}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border active:scale-95 shadow-sm cursor-pointer"
                                style={{
                                    backgroundColor: isPlayingSound ? `${accentColor}25` : (isBlackTheme ? '#1e1e24' : '#f3f4f6'),
                                    borderColor: isPlayingSound ? accentColor : 'transparent',
                                    color: isPlayingSound ? accentColor : (isBlackTheme ? '#e5e7eb' : '#4b5563')
                                }}
                                title={isPlayingSound ? "كتم النغمة" : "تشغيل النغمة"}
                            >
                                {isPlayingSound ? (
                                    <>
                                        <Volume2 size={16} className="animate-pulse" />
                                        <span>{currentOccasion.soundLabel}</span>
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-0.5" />
                                    </>
                                ) : (
                                    <>
                                        <VolumeX size={16} />
                                        <span>تشغيل النغمة</span>
                                    </>
                                )}
                            </button>

                            {/* زر الإغلاق */}
                            <button 
                                type="button"
                                onClick={handleClose}
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                aria-label="إغلاق التهنئة"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 pt-14 flex flex-col items-center text-center relative z-10">
                            
                            {/* شارة المناسبة المباركة */}
                            <div 
                                className="px-3.5 py-1 rounded-full text-xs font-bold tracking-wide mb-4 shadow-sm border"
                                style={{
                                    backgroundColor: `${accentColor}18`,
                                    color: accentColor,
                                    borderColor: `${accentColor}35`
                                }}
                            >
                                <span>{currentOccasion.badge}</span>
                            </div>

                            {/* الأيقونة المركزية المتحركة */}
                            <motion.div
                                animate={{ 
                                    scale: [1, 1.08, 1],
                                    rotate: [0, 4, -4, 0]
                                }}
                                transition={{ 
                                    duration: 4.5, 
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="mb-4 p-4 rounded-3xl shadow-lg border"
                                style={{ 
                                    backgroundColor: isBlackTheme ? '#18181b' : '#ffffff',
                                    borderColor: `${accentColor}30`
                                }}
                            >
                                {renderOccasionIcon()}
                            </motion.div>

                            {/* العنوان الرئيسي */}
                            <h2 
                                className="text-2xl sm:text-3xl font-black mb-1.5 font-['Amiri_Quran',serif]" 
                                style={{ color: accentColor }}
                            >
                                {currentOccasion.title}
                            </h2>

                            {/* العنوان الفرعي / التاريخ الهجري */}
                            <p className="text-xs sm:text-sm font-bold opacity-75 mb-4">
                                {currentOccasion.subtitle(today)}
                            </p>

                            {/* بطاقة التكبيرات / الاقتباس الإسلامي */}
                            <div 
                                className="w-full p-3.5 rounded-2xl mb-4 border relative text-center"
                                style={{
                                    backgroundColor: isBlackTheme ? '#141416' : '#f9fafb',
                                    borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'
                                }}
                            >
                                <p 
                                    className="text-sm sm:text-base font-bold italic leading-relaxed font-['Amiri_Quran',serif]"
                                    style={{ color: isBlackTheme ? '#f3f4f6' : '#1f2937' }}
                                >
                                    {currentOccasion.quote}
                                </p>
                            </div>

                            {/* النص التوضيحي والدعاء */}
                            <p className="text-xs sm:text-sm leading-relaxed opacity-90 mb-5 px-1 font-medium">
                                {currentOccasion.description}
                            </p>

                            {/* أزرار الإجراءات */}
                            <div className="w-full flex flex-col gap-2.5">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="w-full py-3 px-4 rounded-2xl font-black text-sm sm:text-base shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                                    style={{ 
                                        backgroundColor: accentColor, 
                                        color: '#ffffff' 
                                    }}
                                >
                                    <span>{currentOccasion.actionText}</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleShare}
                                    className="w-full py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm border transition-colors flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                                    style={{
                                        backgroundColor: isBlackTheme ? '#18181b' : '#f3f4f6',
                                        borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                                        color: isBlackTheme ? '#ffffff' : '#374151'
                                    }}
                                >
                                    {copied ? (
                                        <>
                                            <Check size={16} className="text-emerald-500" />
                                            <span className="text-emerald-600 dark:text-emerald-400">تم نسخ التهنئة لمشاركتها</span>
                                        </>
                                    ) : (
                                        <>
                                            <Share2 size={16} />
                                            <span>مشاركة التهنئة مع الأهل والأصدقاء</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="mt-4 flex items-center gap-1.5 opacity-60 text-xs font-semibold">
                                <Heart size={13} className="fill-current text-rose-500" />
                                <span>كل عام وأنتم بخير وتقبل الله منا ومنكم</span>
                            </div>
                        </div>

                        {/* Floating Ambient Sparkles */}
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute pointer-events-none"
                                style={{
                                    color: `${accentColor}50`,
                                    top: `${15 + (i * 18)}%`,
                                    left: `${10 + ((i * 35) % 80)}%`
                                }}
                                animate={{ 
                                    scale: [0.6, 1.2, 0.6],
                                    opacity: [0.2, 0.7, 0.2],
                                    y: [0, -12, 0]
                                }}
                                transition={{ 
                                    duration: 3 + i, 
                                    repeat: Infinity,
                                    delay: i * 0.7
                                }}
                            >
                                <Sparkles size={14} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default MawlidNotification;
