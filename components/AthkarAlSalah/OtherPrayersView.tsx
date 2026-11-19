import React, { useState, useEffect, useMemo } from 'react';
import {
    OTHER_PRAYERS_DATA,
    OTHER_PRAYER_CATEGORIES,
    OtherPrayerCategory,
    OtherPrayerItem,
} from '../../data/otherPrayersData';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';

interface OtherPrayersViewProps {
    theme: any;
    themeKey?: string;
    isBlackTheme: boolean;
    isDefaultTheme: boolean;
    isEn: boolean;
    activeTab: 'grid' | 'list';
    searchQuery: string;
    selectedCategory: OtherPrayerCategory | 'all';
    onSelectCategory: (cat: OtherPrayerCategory | 'all') => void;
    onSelectPrayer: (prayer: OtherPrayerItem) => void;
}

interface OtherPrayerDetailViewProps {
    prayer: OtherPrayerItem;
    theme: any;
    isBlackTheme: boolean;
    isEn: boolean;
    onZoom: (data: any) => void;
    setToastMessage: (msg: string) => void;
}

const toArabicNums = (val: string | number) =>
    String(val).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);

export function getCategoryLabel(cat: OtherPrayerCategory, isEn: boolean): string {
    const found = OTHER_PRAYER_CATEGORIES.find((c) => c.id === cat);
    if (!found) return isEn ? 'Compendium of Prayers' : 'جوامع الصلوات';
    return isEn ? found.labelEn : found.labelAr;
}

export function buildOtherPrayerPlainText(prayer: OtherPrayerItem, isEn: boolean): string {
    if (isEn) {
        const lines = [
            prayer.titleEn,
            `Category: ${getCategoryLabel(prayer.category, true)}`,
            `Ruling: ${prayer.rulingEn}`,
            `Rak'ahs: ${prayer.rakahsEn}`,
            `Time: ${prayer.timeEn}`,
            '',
            prayer.summaryEn,
            '',
            `Virtue & Evidence: ${prayer.virtueEn}`,
            '',
            'How to Perform:',
            ...prayer.stepsEn.map((s, idx) => `${idx + 1}. ${s}`),
        ];
        if (prayer.supplication) {
            lines.push('', `${prayer.supplication.labelEn}:`, prayer.supplication.textEn);
        }
        if (prayer.notesEn) {
            lines.push('', prayer.notesEn);
        }
        return lines.join('\n');
    }

    const lines = [
        prayer.title,
        `التصنيف: ${getCategoryLabel(prayer.category, false)}`,
        `الحكم: ${prayer.ruling}`,
        `عدد الركعات: ${prayer.rakahs}`,
        `وقت الصلاة: ${prayer.time}`,
        '',
        prayer.summary,
        '',
        `الفضل والدليل: ${prayer.virtue}`,
        '',
        'كيفية الصلاة بالتفصيل:',
        ...prayer.steps.map((s, idx) => `${toArabicNums(idx + 1)}. ${s}`),
    ];
    if (prayer.supplication) {
        lines.push('', `${prayer.supplication.labelAr}:`, prayer.supplication.textAr);
    }
    if (prayer.notes) {
        lines.push('', prayer.notes);
    }
    return lines.join('\n');
}

export function buildOtherPrayerZoomHtml(
    prayer: OtherPrayerItem,
    accentPrimary: string,
    accentSecondary: string,
    isEn: boolean
): string {
    const dir = isEn ? 'ltr' : 'rtl';
    const align = isEn ? 'text-center font-sans' : 'text-center font-cairo';

    const rulingLabel = isEn ? 'Ruling:' : 'الحكم:';
    const rakahsLabel = isEn ? "Rak'ahs:" : 'عدد الركعات:';
    const timeLabel = isEn ? 'Prescribed Time:' : 'وقت الصلاة:';
    const virtueLabel = isEn ? 'Virtue & Evidence' : 'الفضل والدليل';
    const stepsLabel = isEn ? 'How to Perform Step-by-Step' : 'كيفية الصلاة بالتفصيل';

    const stepsHtml = (isEn ? prayer.stepsEn : prayer.steps)
        .map(
            (step, idx) => `
            <div class="app-page-card border-0 bg-white dark:bg-[#1E293B] p-3.5 rounded-2xl mb-2.5 text-center">
                <p class="leading-relaxed text-center">
                    <span class="font-bold" style="color: ${accentPrimary};">${isEn ? `${idx + 1}.` : `${toArabicNums(idx + 1)}ـ`}</span>
                    ${step}
                </p>
            </div>`
        )
        .join('');

    const supplicationHtml = prayer.supplication
        ? `
            <div class="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 rounded-2xl mt-3 text-center">
                <h4 class="font-bold mb-1.5 text-center" style="color: ${accentSecondary};">${isEn ? prayer.supplication.labelEn : prayer.supplication.labelAr}</h4>
                <p class="leading-loose font-medium text-center">${isEn ? prayer.supplication.textEn : prayer.supplication.textAr}</p>
            </div>`
        : '';

    const noteText = isEn ? prayer.notesEn : prayer.notes;
    const notesHtml = noteText
        ? `
            <div class="p-3.5 rounded-2xl mt-3 border border-black/10 dark:border-white/10 opacity-90 text-center">
                <p class="text-sm leading-relaxed text-center">${noteText}</p>
            </div>`
        : '';

    return `
        <div class="space-y-4 ${align} pb-2" dir="${dir}">
            <div class="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 rounded-2xl space-y-2 text-center">
                <p class="leading-relaxed opacity-90 text-center">${isEn ? prayer.summaryEn : prayer.summary}</p>
                <div class="pt-2 space-y-1.5 border-t border-black/10 dark:border-white/10 text-center">
                    <p class="text-center"><b style="color: ${accentPrimary};">${rulingLabel}</b> ${isEn ? prayer.rulingEn : prayer.ruling}</p>
                    <p class="text-center"><b style="color: ${accentPrimary};">${rakahsLabel}</b> ${isEn ? prayer.rakahsEn : prayer.rakahs}</p>
                    <p class="text-center"><b style="color: ${accentPrimary};">${timeLabel}</b> ${isEn ? prayer.timeEn : prayer.time}</p>
                </div>
            </div>

            <div class="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 rounded-2xl text-center">
                <h4 class="font-bold mb-1.5 text-center" style="color: ${accentSecondary};">${virtueLabel}</h4>
                <p class="leading-relaxed opacity-95 text-center">${isEn ? prayer.virtueEn : prayer.virtue}</p>
            </div>

            <div class="text-center">
                <h4 class="font-bold mb-2 text-center" style="color: ${accentPrimary};">${stepsLabel}</h4>
                ${stepsHtml}
            </div>

            ${supplicationHtml}
            ${notesHtml}
        </div>
    `;
}

export function createOtherPrayerZoomPayload(
    prayer: OtherPrayerItem,
    theme: any,
    isEn: boolean,
    isBlackTheme: boolean
) {
    const accentPrimary = isBlackTheme ? '#FFFFFF' : (theme?.palette?.[0] || theme?.accent || '#2E7D5E');
    const accentSecondary = isBlackTheme ? '#CBD5E1' : (theme?.palette?.[1] || accentPrimary);
    const catAr = getCategoryLabel(prayer.category, false);
    const catEn = getCategoryLabel(prayer.category, true);

    return {
        title: prayer.title,
        titleEn: prayer.titleEn,
        text: buildOtherPrayerZoomHtml(prayer, accentPrimary, accentSecondary, false),
        textEn: buildOtherPrayerZoomHtml(prayer, accentPrimary, accentSecondary, true),
        note: `${prayer.rakahs} • ${prayer.ruling}`,
        noteEn: `${prayer.rakahsEn} • ${prayer.rulingEn}`,
        category: `جوامع الصلوات • ${catAr}`,
        categoryEn: `Compendium of Prayers • ${catEn}`,
        isHtml: true,
        isQuran: false,
    };
}

export const OtherPrayerDetailView: React.FC<OtherPrayerDetailViewProps> = ({
    prayer,
    theme,
    isBlackTheme,
    isEn,
    onZoom,
    setToastMessage,
}) => {
    const primaryColor = isBlackTheme ? '#FFFFFF' : (theme?.palette?.[0] || theme?.accent || '#2E7D5E');
    const secondaryColor = isBlackTheme ? '#CBD5E1' : (theme?.palette?.[1] || primaryColor);

    const [playingKey, setPlayingKey] = useState<'main' | 'dua' | null>(null);
    const [copiedKey, setCopiedKey] = useState<'main' | 'dua' | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeTTS((playingText) => {
            if (!playingText) {
                setPlayingKey(null);
            }
        });
        return () => {
            unsubscribe();
            stopTTS();
        };
    }, []);

    const handleCopyMain = () => {
        const plain = buildOtherPrayerPlainText(prayer, isEn);
        navigator.clipboard.writeText(`${plain}\n\nمصحف أحمد و ليلى`);
        setCopiedKey('main');
        setTimeout(() => setCopiedKey(null), 2000);
        setToastMessage(isEn ? 'Copied to clipboard' : 'تم النسخ إلى الحافظة');
    };

    const handlePlayMain = () => {
        if (playingKey === 'main') {
            stopTTS();
            setPlayingKey(null);
        } else {
            const plain = buildOtherPrayerPlainText(prayer, isEn);
            setPlayingKey('main');
            playTTS(plain, {
                isSalah: true,
                isEn,
                onToast: (msg) => setToastMessage(msg),
            });
        }
    };

    const handleShareMain = async () => {
        const plain = buildOtherPrayerPlainText(prayer, isEn);
        await shareAsImage({
            text: plain,
            title: isEn ? prayer.titleEn : prayer.title,
            source: isEn ? prayer.rulingEn : prayer.ruling,
            category: isEn
                ? `Compendium of Prayers • ${getCategoryLabel(prayer.category, true)}`
                : `جوامع الصلوات • ${getCategoryLabel(prayer.category, false)}`,
            theme,
            isEn,
            language: isEn ? 'en' : 'ar',
            setToastMessage,
        });
    };

    const handleOpenMainZoom = () => {
        onZoom(createOtherPrayerZoomPayload(prayer, theme, isEn, isBlackTheme));
    };

    const handleCopyDua = () => {
        if (!prayer.supplication) return;
        const text = isEn ? prayer.supplication.textEn : prayer.supplication.textAr;
        navigator.clipboard.writeText(`${text}\n\nمصحف أحمد و ليلى`);
        setCopiedKey('dua');
        setTimeout(() => setCopiedKey(null), 2000);
        setToastMessage(isEn ? 'Copied to clipboard' : 'تم النسخ إلى الحافظة');
    };

    const handlePlayDua = () => {
        if (!prayer.supplication) return;
        if (playingKey === 'dua') {
            stopTTS();
            setPlayingKey(null);
        } else {
            const text = isEn ? prayer.supplication.textEn : prayer.supplication.textAr;
            setPlayingKey('dua');
            playTTS(text, {
                isSalah: true,
                isEn,
                onToast: (msg) => setToastMessage(msg),
            });
        }
    };

    const handleShareDua = async () => {
        if (!prayer.supplication) return;
        await shareAsImage({
            text: isEn ? prayer.supplication.textEn : prayer.supplication.textAr,
            title: isEn ? prayer.supplication.labelEn : prayer.supplication.labelAr,
            source: isEn ? prayer.titleEn : prayer.title,
            category: isEn ? 'Compendium of Prayers' : 'جوامع الصلوات',
            theme,
            isEn,
            language: isEn ? 'en' : 'ar',
            setToastMessage,
        });
    };

    const handleOpenDuaZoom = () => {
        if (!prayer.supplication) return;
        onZoom({
            title: prayer.supplication.labelAr,
            titleEn: prayer.supplication.labelEn,
            text: prayer.supplication.textAr,
            textEn: prayer.supplication.textEn,
            note: prayer.title,
            noteEn: prayer.titleEn,
            category: `جوامع الصلوات • ${prayer.title}`,
            categoryEn: `Compendium of Prayers • ${prayer.titleEn}`,
            isHtml: false,
            isQuran: false,
        });
    };

    return (
        <div className="space-y-4 pb-8 pt-1" dir={isEn ? 'ltr' : 'rtl'}>
            {/* Prayer Hero Summary + 4 Action Icons */}
            <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-3.5">
                    <div
                        className="app-3d-badge w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                        style={{
                            backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.12)' : `${primaryColor}1A`,
                            color: primaryColor,
                        }}
                    >
                        <i className={`fa-solid ${prayer.icon} text-xl`}></i>
                    </div>
                    <div className="min-w-0 flex-1">
                        <span
                            className="app-3d-badge inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold mb-1"
                            style={{
                                backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.1)' : `${primaryColor}14`,
                                color: primaryColor,
                            }}
                        >
                            {getCategoryLabel(prayer.category, isEn)}
                        </span>
                        <h2
                            className="font-bold text-lg sm:text-xl leading-snug"
                            style={{ color: primaryColor }}
                        >
                            {isEn ? prayer.titleEn : prayer.title}
                        </h2>
                    </div>
                </div>

                <p className="text-sm sm:text-base leading-relaxed opacity-90">
                    {isEn ? prayer.summaryEn : prayer.summary}
                </p>

                {/* Key Info Rows: Ruling, Rak'ahs, Time */}
                <div className="space-y-2 pt-3 border-t border-black/5 dark:border-white/10 text-sm">
                    <div className="leading-relaxed">
                        <span className="font-bold" style={{ color: primaryColor }}>
                            {isEn ? 'Ruling: ' : 'الحكم: '}
                        </span>
                        <span className="opacity-90">{isEn ? prayer.rulingEn : prayer.ruling}</span>
                    </div>
                    <div className="leading-relaxed">
                        <span className="font-bold" style={{ color: primaryColor }}>
                            {isEn ? "Rak'ahs: " : 'عدد الركعات: '}
                        </span>
                        <span className="opacity-90">{isEn ? prayer.rakahsEn : prayer.rakahs}</span>
                    </div>
                    <div className="leading-relaxed">
                        <span className="font-bold" style={{ color: primaryColor }}>
                            {isEn ? 'Prescribed Time: ' : 'وقت الصلاة: '}
                        </span>
                        <span className="opacity-90">{isEn ? prayer.timeEn : prayer.time}</span>
                    </div>
                </div>

                {/* 4 Action Icons (Audio, Share Image, Copy, Zoom Modal) */}
                <div className="flex items-center justify-center gap-3 sm:gap-4 pt-3 border-t border-black/5 dark:border-white/10 overflow-visible">
                    <button
                        type="button"
                        onClick={handlePlayMain}
                        className={`app-page-card border-0 w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer ${
                            isBlackTheme ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                        }`}
                        style={{
                            color: playingKey === 'main' ? '#ef4444' : isBlackTheme ? '#ffffff' : undefined,
                        }}
                        title={
                            isEn
                                ? playingKey === 'main'
                                    ? 'Stop audio'
                                    : 'Play audio'
                                : playingKey === 'main'
                                  ? 'إيقاف الصوت'
                                  : 'استماع صوتي'
                        }
                    >
                        <i
                            className={`fa-solid ${
                                playingKey === 'main'
                                    ? 'fa-circle-pause text-red-500 animate-pulse text-base'
                                    : 'fa-volume-high text-sm'
                            }`}
                        ></i>
                    </button>

                    <button
                        type="button"
                        onClick={handleShareMain}
                        className={`app-page-card border-0 w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer ${
                            isBlackTheme ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                        }`}
                        title={isEn ? 'Share Image' : 'مشاركة كصورة'}
                    >
                        <i className="fa-solid fa-share-nodes text-sm"></i>
                    </button>

                    <button
                        type="button"
                        onClick={handleCopyMain}
                        className={`app-page-card border-0 w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer ${
                            isBlackTheme ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                        }`}
                        title={isEn ? 'Copy' : 'نسخ'}
                    >
                        <i
                            className={`fa-${
                                copiedKey === 'main' ? 'solid fa-check text-emerald-500' : 'regular fa-copy'
                            } text-sm`}
                        ></i>
                    </button>

                    <button
                        type="button"
                        onClick={handleOpenMainZoom}
                        className={`app-page-card border-0 w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer ${
                            isBlackTheme ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                        }`}
                        title={isEn ? 'Zoom & Read' : 'تكبير وقراءة'}
                    >
                        <i className="fa-solid fa-magnifying-glass-plus text-sm"></i>
                    </button>
                </div>
            </div>

            {/* Virtue & Authentic Evidence */}
            <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-2xl">
                <h3 className="font-bold text-sm sm:text-base mb-2" style={{ color: secondaryColor }}>
                    {isEn ? 'Virtue & Authentic Evidence' : 'الفضل والدليل من الكتاب والسنة'}
                </h3>
                <p className="text-sm sm:text-base leading-loose opacity-90">
                    {isEn ? prayer.virtueEn : prayer.virtue}
                </p>
            </div>

            {/* Step-by-Step Guide */}
            <div className="space-y-2.5">
                <h3 className="font-bold text-sm sm:text-base px-1" style={{ color: primaryColor }}>
                    {isEn ? 'How to Perform Step-by-Step' : 'صفة الصلاة وخطواتها بالتفصيل'}
                </h3>
                {(isEn ? prayer.stepsEn : prayer.steps).map((step, idx) => (
                    <div
                        key={idx}
                        className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 rounded-2xl text-sm sm:text-base flex items-start gap-3"
                    >
                        <span
                            className="app-3d-badge w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                            style={{
                                backgroundColor: isBlackTheme
                                    ? 'rgba(255,255,255,0.16)'
                                    : `${primaryColor}20`,
                                color: primaryColor,
                            }}
                        >
                            {isEn ? idx + 1 : toArabicNums(idx + 1)}
                        </span>
                        <p className="leading-loose opacity-90">{step}</p>
                    </div>
                ))}
            </div>

            {/* Specific Supplication Card (if applicable) with dedicated Zoom & Actions */}
            {prayer.supplication && (
                <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-2xl space-y-3">
                    <h3 className="font-bold text-sm sm:text-base text-center" style={{ color: secondaryColor }}>
                        {isEn ? prayer.supplication.labelEn : prayer.supplication.labelAr}
                    </h3>
                    <p className="text-base sm:text-lg leading-loose font-medium text-center">
                        {isEn ? prayer.supplication.textEn : prayer.supplication.textAr}
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-3 border-t border-black/5 dark:border-white/10">
                        <button
                            type="button"
                            onClick={handlePlayDua}
                            className={`app-page-card border-0 w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer ${
                                isBlackTheme ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                            }`}
                            style={{
                                color: playingKey === 'dua' ? '#ef4444' : isBlackTheme ? '#ffffff' : undefined,
                            }}
                            title={isEn ? 'Play audio' : 'استماع صوتي'}
                        >
                            <i
                                className={`fa-solid ${
                                    playingKey === 'dua'
                                        ? 'fa-circle-pause text-red-500 animate-pulse text-sm'
                                        : 'fa-volume-high text-xs'
                                }`}
                            ></i>
                        </button>
                        <button
                            type="button"
                            onClick={handleShareDua}
                            className={`app-page-card border-0 w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer ${
                                isBlackTheme ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                            }`}
                            title={isEn ? 'Share Image' : 'مشاركة كصورة'}
                        >
                            <i className="fa-solid fa-share-nodes text-xs"></i>
                        </button>
                        <button
                            type="button"
                            onClick={handleCopyDua}
                            className={`app-page-card border-0 w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer ${
                                isBlackTheme ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                            }`}
                            title={isEn ? 'Copy' : 'نسخ'}
                        >
                            <i
                                className={`fa-${
                                    copiedKey === 'dua' ? 'solid fa-check text-emerald-500' : 'regular fa-copy'
                                } text-xs`}
                            ></i>
                        </button>
                        <button
                            type="button"
                            onClick={handleOpenDuaZoom}
                            className={`app-page-card border-0 w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer ${
                                isBlackTheme ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                            }`}
                            title={isEn ? 'Zoom' : 'تكبير وقراءة'}
                        >
                            <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                        </button>
                    </div>
                </div>
            )}

            {/* Scholarly Note */}
            {(isEn ? prayer.notesEn : prayer.notes) && (
                <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed opacity-90">
                    {isEn ? prayer.notesEn : prayer.notes}
                </div>
            )}
        </div>
    );
};

export const OtherPrayersView: React.FC<OtherPrayersViewProps> = ({
    theme,
    isBlackTheme,
    isDefaultTheme,
    isEn,
    activeTab,
    searchQuery,
    selectedCategory,
    onSelectCategory,
    onSelectPrayer,
}) => {
    const primaryColor = isBlackTheme ? '#FFFFFF' : (theme?.palette?.[0] || theme?.accent || '#2E7D5E');
    const secondaryColor = isBlackTheme ? '#CBD5E1' : (theme?.palette?.[1] || primaryColor);

    const filteredPrayers = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return OTHER_PRAYERS_DATA.filter((item) => {
            if (selectedCategory !== 'all' && item.category !== selectedCategory) {
                return false;
            }
            if (!q) return true;
            const haystacks = [
                item.title,
                item.titleEn,
                item.ruling,
                item.rulingEn,
                item.rakahs,
                item.rakahsEn,
                item.time,
                item.timeEn,
                item.summary,
                item.summaryEn,
                item.virtue,
                item.virtueEn,
                ...item.steps,
                ...item.stepsEn,
                item.supplication?.textAr || '',
                item.supplication?.textEn || '',
            ];
            return haystacks.some((h) => h.toLowerCase().includes(q));
        });
    }, [selectedCategory, searchQuery]);

    const getActiveTabStyle = () => {
        if (isBlackTheme) return { backgroundColor: '#FFFFFF', color: '#000000' };
        if (isDefaultTheme) return { backgroundColor: '#000000', color: '#FFFFFF' };
        return { backgroundColor: theme.palette[0], color: '#FFFFFF' };
    };

    return (
        <div className="space-y-4 pb-6" dir={isEn ? 'ltr' : 'rtl'}>
            {/* Category Filter Strip - Clean text-only tabs */}
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-1 px-0.5">
                {OTHER_PRAYER_CATEGORIES.map((cat) => {
                    const isActive = selectedCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => onSelectCategory(cat.id)}
                            className={`app-page-card tasbeeh-pressable border-0 shrink-0 px-4 py-2 rounded-2xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                                isActive ? '' : 'bg-white dark:bg-[#1E293B] opacity-85 hover:opacity-100'
                            }`}
                            style={isActive ? getActiveTabStyle() : { color: 'var(--text-color)' }}
                        >
                            <span>{isEn ? cat.labelEn : cat.labelAr}</span>
                        </button>
                    );
                })}
            </div>

            {/* Empty Search State */}
            {filteredPrayers.length === 0 ? (
                <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] rounded-2xl p-10 text-center opacity-75">
                    <i className="fa-solid fa-magnifying-glass text-3xl mb-3" style={{ color: primaryColor }}></i>
                    <p className="font-bold text-sm sm:text-base">
                        {isEn ? 'No matching prayers found' : 'لا توجد صلوات مطابقة للبحث'}
                    </p>
                </div>
            ) : activeTab === 'grid' ? (
                /* Clean 2-Column 3D Grid View */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {filteredPrayers.map((prayer) => (
                        <div
                            key={prayer.id}
                            id={`other-prayer-card-${prayer.id}`}
                            onClick={() => onSelectPrayer(prayer)}
                            className="app-page-card tasbeeh-pressable border-0 bg-white dark:bg-[#1E293B] p-4 rounded-2xl flex flex-col justify-between gap-3 cursor-pointer transition-all overflow-visible scroll-mt-3"
                        >
                            <div className="flex items-start justify-between gap-2.5">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div
                                        className="app-3d-badge w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                                        style={{
                                            backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.12)' : `${primaryColor}18`,
                                            color: primaryColor,
                                        }}
                                    >
                                        <i className={`fa-solid ${prayer.icon} text-lg`}></i>
                                    </div>
                                    <div className="min-w-0">
                                        <span
                                            className="text-[10px] font-bold opacity-75 block truncate"
                                            style={{ color: isBlackTheme ? '#CBD5E1' : secondaryColor }}
                                        >
                                            {getCategoryLabel(prayer.category, isEn)}
                                        </span>
                                        <h3
                                            className="font-bold text-sm sm:text-base leading-snug line-clamp-2"
                                            style={{ color: primaryColor }}
                                        >
                                            {isEn ? prayer.titleEn : prayer.title}
                                        </h3>
                                    </div>
                                </div>
                                <span
                                    className="app-3d-badge w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                    style={{
                                        backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.1)' : `${primaryColor}14`,
                                        color: primaryColor,
                                    }}
                                >
                                    <i className={`fa-solid ${isEn ? 'fa-chevron-right' : 'fa-chevron-left'} text-xs`}></i>
                                </span>
                            </div>

                            <div className="space-y-1.5 text-xs opacity-85 border-t border-black/5 dark:border-white/5 pt-2.5">
                                <p className="line-clamp-1">
                                    <span className="font-bold">{isEn ? "Rak'ahs: " : 'الركعات: '}</span>
                                    {isEn ? prayer.rakahsEn : prayer.rakahs}
                                </p>
                                <p className="line-clamp-1">
                                    <span className="font-bold">{isEn ? 'Time: ' : 'الوقت: '}</span>
                                    {isEn ? prayer.timeEn : prayer.time}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Clean List View — Clicking any prayer opens it in a full page with Top Bar */
                <div className="space-y-3.5">
                    {filteredPrayers.map((prayer) => (
                        <div
                            key={prayer.id}
                            id={`other-prayer-card-${prayer.id}`}
                            onClick={() => onSelectPrayer(prayer)}
                            className="app-page-card tasbeeh-pressable border-0 bg-white dark:bg-[#1E293B] p-4 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all group overflow-visible scroll-mt-3"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div
                                    className="app-3d-badge w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0"
                                    style={{
                                        backgroundColor: isBlackTheme ? '#27272a' : `${primaryColor}1A`,
                                        color: primaryColor,
                                    }}
                                >
                                    <i className={`fa-solid ${prayer.icon} text-lg`}></i>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3
                                        className="font-bold text-sm sm:text-base leading-snug truncate"
                                        style={{ color: primaryColor }}
                                    >
                                        {isEn ? prayer.titleEn : prayer.title}
                                    </h3>
                                    <p className="text-xs opacity-75 truncate mt-0.5">
                                        {isEn ? prayer.rakahsEn : prayer.rakahs}
                                    </p>
                                </div>
                            </div>

                            <div
                                className="app-3d-badge border-0 w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                style={{
                                    backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.12)' : `${primaryColor}14`,
                                    color: primaryColor,
                                }}
                            >
                                <i className={`fa-solid ${isEn ? 'fa-chevron-right' : 'fa-chevron-left'} text-xs`}></i>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OtherPrayersView;
