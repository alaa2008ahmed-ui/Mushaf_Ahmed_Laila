import React, { FC, useState, useEffect } from 'react';
import { Volume2, VolumeX, Copy, Check, Share2, ZoomIn, ChevronDown } from 'lucide-react';
import { toArabic, isDarkQuranTheme } from './constants';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { shareAsImage } from '../../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../../utils/ttsEngine';
import { hexToRgba, getModernFlatTokens } from '../../utils/flatDesignTokens';

const SAJDAH_DUAS_TEXT = `"سَجَدَ وَجْهِي لِلَّذِي خَلَقَهُ، وَشَقَّ سَمْعَهُ وَبَصَرَهُ، بِحَوْلِهِ وَقُوَّتِهِ".\n\n"اللَّهُمَّ اكْتُبْ لِي بِهَا عِنْدَكَ أَجْرًا، وَضَعْ عَنِّي بِهَا وِزْرًا، وَاجْعَلْهَا لِي عِنْدَكَ ذُخْرًا، وَتَقَبَّلْهَا مِنِّي كَمَا تَقَبَّلْتَهَا مِنْ عَبْدِكَ دَاوُدَ".`;

const buildFullCopyText = (categoryTitle: string): string => `${categoryTitle}

1. تعريف سجود التلاوة:
هو سجود يؤديه القارئ أو المستمع عند قراءة آية من آيات السجود في القرآن الكريم، تعظيماً لله تعالى وإظهاراً للعبودية. وقد ثبت في صحيح مسلم عن أبي هريرة رضي الله عنه قال: قال رسول الله ﷺ:
"إذَا قَرَأَ ابنُ آدَمَ السَّجْدَةَ فَسَجَدَ، اعْتَزَلَ الشَّيْطَانُ يَبْكِي، يقولُ: يا وَيْلَهُ، أُمِرَ ابنُ آدَمَ بالسُّجُودِ فَسَجَدَ فَلَهُ الجَنَّةُ، وأُمِرْتُ بالسُّجُودِ فأبَيْتُ فَلِيَ النَّارُ".

2. عدد آيات السجدة ومواضعها:
اتفق جمهور العلماء على وجود آيات السجود في القرآن، وأشهر الآراء أنها 15 سجدة، وهي موزعة كالآتي:
• الأعراف: ${toArabic(206)}
• الرعد: ${toArabic(15)}
• النحل: ${toArabic(50)}
• الإسراء: ${toArabic(109)}
• مريم: ${toArabic(58)}
• الحج (سجدتان): ${toArabic(18)} و ${toArabic(77)}
• الفرقان: ${toArabic(60)}
• النمل: ${toArabic(26)}
• السجدة: ${toArabic(15)}
• ص: ${toArabic(24)}
• فصلت: ${toArabic(38)}
• النجم: ${toArabic(62)}
• الانشقاق: ${toArabic(21)}
• العلق: ${toArabic(19)}

3. حكم سجود التلاوة:
اختلف الفقهاء في حكمها على قولين مشهورين:
• جمهور العلماء (الشافعية والمالكية والحنابلة): أنها سُنّة مؤكدة وليست واجبة؛ واستدلوا بأن عمر بن الخطاب رضي الله عنه قرأ السجدة يوم الجمعة على المنبر فنزل وسجد، ثم قرأها في الجمعة التالية فلم يسجد وقال: "إن الله لم يفرض علينا السجود إلا أن نشاء".
• الحنفية: ذهبوا إلى أنها واجبة على القارئ والمستمع.

4. شروط وكيفية سجود التلاوة:
الشروط:
يشترط لها عند جمهور الفقهاء ما يشترط للصلاة (الطهارة، استقبال القبلة، ستر العورة)، بينما ذهب بعض العلماء (مثل ابن تيمية والشوكاني) إلى أنه يجوز السجود دون طهارة (مثل سجود الشكر) لأنها ليست صلاة كاملة، لكن الأفضل والأحوط هو التطهر.
الكيفية:
• التكبير: يُكبر الساجد عند الهويّ للسجود (وعند الرفع منه إذا كان داخل الصلاة).
• السجود: سجدة واحدة كسجدة الصلاة.
• الدعاء: يُشرع فيها ما يقال في سجود الصلاة "سبحان ربي الأعلى"، ويُستحب الدعاء المأثور:
"سَجَدَ وَجْهِي لِلَّذِي خَلَقَهُ، وَشَقَّ سَمْعَهُ وَبَصَرَهُ، بِحَوْلِهِ وَقُوَّتِهِ".
"اللَّهُمَّ اكْتُبْ لِي بِهَا عِنْدَكَ أَجْرًا، وَضَعْ عَنِّي بِهَا وِزْرًا، وَاجْعَلْهَا لِي عِنْدَكَ ذُخْرًا، وَتَقَبَّلْهَا مِنِّي كَمَا تَقَبَّلْتَهَا مِنْ عَبْدِكَ دَاوُدَ".

5. ملاحظات هامة:
• داخل الصلاة: إذا قرأ الإمام آية سجدة، يسجد ويسجد المأمومون معه.
• للمستمع: يشرع السجود للمستمع الذي يقصد سماع القرآن، أما "السامع" (من مرّ صدفة أو سمعها في مكان عام دون قصد) فلا يجب عليه السجود عند كثير من الفقهاء.
• العجز عن السجود: من لم يستطع السجود لسبب ما (كأن يكون في وسيلة مواصلات)، يمكنه الإيماء برأسه أو الاكتفاء بالذكر.`;

const SAJDAH_SHARE_TEXT = `1. تعريف سجود التلاوة:
هو سجود يؤديه القارئ أو المستمع عند قراءة آية من آيات السجود في القرآن الكريم، تعظيماً لله تعالى وإظهاراً للعبودية. وقد ثبت في صحيح مسلم عن أبي هريرة رضي الله عنه قال: قال رسول الله ﷺ:
"إذَا قَرَأَ ابنُ آدَمَ السَّجْدَةَ فَسَجَدَ، اعْتَزَلَ الشَّيْطَانُ يَبْكِي، يقولُ: يا وَيْلَهُ، أُمِرَ ابنُ آدَمَ بالسُّجُودِ فَسَجَدَ فَلَهُ الجَنَّةُ، وأُمِرْتُ بالسُّجُودِ فأبَيْتُ فَلِيَ النَّارُ".

2. عدد آيات السجدة ومواضعها:
اتفق جمهور العلماء على وجود آيات السجود في القرآن، وأشهر الآراء أنها 15 سجدة، وهي موزعة كالآتي:
• الأعراف (${toArabic(206)}) • الرعد (${toArabic(15)}) • النحل (${toArabic(50)}) • الإسراء (${toArabic(109)}) • مريم (${toArabic(58)})
• الحج: سجدتان (${toArabic(18)}، ${toArabic(77)}) • الفرقان (${toArabic(60)}) • النمل (${toArabic(26)}) • السجدة (${toArabic(15)}) • ص (${toArabic(24)})
• فصلت (${toArabic(38)}) • النجم (${toArabic(62)}) • الانشقاق (${toArabic(21)}) • العلق (${toArabic(19)})

4. شروط وكيفية سجود التلاوة:
• الشروط: يشترط لها عند جمهور الفقهاء ما يشترط للصلاة (الطهارة، استقبال القبلة، ستر العورة)، بينما ذهب بعض العلماء (مثل ابن تيمية والشوكاني) إلى أنه يجوز السجود دون طهارة (مثل سجود الشكر) لأنها ليست صلاة كاملة، لكن الأفضل والأحوط هو التطهر.
• الكيفية:
- التكبير: يُكبر الساجد عند الهويّ للسجود (وعند الرفع منه إذا كان داخل الصلاة).
- السجود: سجدة واحدة كسجدة الصلاة.
- الدعاء: يُشرع فيها ما يقال في سجود الصلاة "سبحان ربي الأعلى"، ويُستحب الدعاء المأثور:
"سَجَدَ وَجْهِي لِلَّذِي خَلَقَهُ، وَشَقَّ سَمْعَهُ وَبَصَرَهُ، بِحَوْلِهِ وَقُوَّتِهِ".
"اللَّهُمَّ اكْتُبْ لِي بِهَا عِنْدَكَ أَجْرًا، وَضَعْ عَنِّي بِهَا وِزْرًا، وَاجْعَلْهَا لِي عِنْدَكَ ذُخْرًا، وَتَقَبَّلْهَا مِنِّي كَمَا تَقَبَّلْتَهَا مِنْ عَبْدِكَ دَاوُدَ".

5. ملاحظات هامة:
• داخل الصلاة: إذا قرأ الإمام آية سجدة، يسجد ويسجد المأمومون معه.
• للمستمع: يشرع السجود للمستمع الذي يقصد سماع القرآن، أما "السامع" (من مرّ صدفة أو سمعها في مكان عام دون قصد) فلا يجب عليه السجود عند كثير من الفقهاء.
• العجز عن السجود: من لم يستطع السجود لسبب ما (كأن يكون في وسيلة مواصلات)، يمكنه الإيماء برأسه أو الاكتفاء بالذكر.`;

const SajdahCardModal: FC<{
    info: { show: boolean, surah: string, ayah: number, juz: number, page: number },
    onClose: () => void,
    isLandscape?: boolean,
    currentTheme?: any,
    setToastMessage?: (msg: string) => void
}> = ({ info, onClose, isLandscape, currentTheme, setToastMessage }) => {
    const { theme, themeKey } = useTheme();
    const { language } = useLanguage();
    const tokens = getModernFlatTokens(theme, themeKey);
    const isEn = language === 'en';
    const isDark = isDarkQuranTheme(currentTheme) || tokens.isDark;

    const [copied, setCopied] = useState(false);
    const [playingText, setPlayingText] = useState<string | null>(null);
    const [fontSize, setFontSize] = useState<number>(17);

    useEffect(() => {
        const unsubscribe = subscribeTTS(setPlayingText);
        return () => {
            unsubscribe();
            stopTTS();
        };
    }, []);

    if (!info.show) return null;

    const accentColor = tokens.isDeepBlack ? '#FBBF24' : tokens.primaryColor;
    const surahDisplay = info.surah
        ? (info.surah.includes('سورة') || info.surah.includes('سُورَة') ? info.surah : `سورة ${info.surah}`)
        : '';
    const categoryTitle = surahDisplay && info.ayah > 0
        ? `سجدة التلاوة • ${surahDisplay} (${toArabic(info.ayah)})`
        : 'أحكام ودعاء سجود التلاوة';

    const sheetBgColor = isDark ? '#1E293B' : '#FFFFFF';
    const sheetTextColor = isDark ? '#F8FAFC' : tokens.textColor;
    const innerBoxBgColor = isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(248, 250, 252, 0.96)';
    const actionBtnBgColor = isDark ? '#1E293B' : '#FFFFFF';

    const isPlaying = playingText === SAJDAH_DUAS_TEXT;

    const handlePlayAudio = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isPlaying) {
            stopTTS();
        } else {
            playTTS(SAJDAH_DUAS_TEXT, {
                isEn: false,
                onToast: (msg) => {
                    if (setToastMessage) setToastMessage(msg);
                }
            });
        }
    };

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        const fullText = buildFullCopyText(categoryTitle);
        const onCopySuccess = () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            if (setToastMessage) {
                setToastMessage(isEn ? 'Copied to clipboard' : 'تم النسخ إلى الحافظة');
            }
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(fullText).then(onCopySuccess).catch(() => {
                try {
                    const ta = document.createElement('textarea');
                    ta.value = fullText;
                    ta.style.position = 'fixed';
                    ta.style.opacity = '0';
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                    onCopySuccess();
                } catch {
                    // ignore
                }
            });
        }
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await shareAsImage({
            text: SAJDAH_SHARE_TEXT,
            title: 'أحكام ودعاء سجود التلاوة',
            source: surahDisplay && info.ayah > 0 ? `${surahDisplay} - آية ${toArabic(info.ayah)}` : 'سجود التلاوة',
            category: 'سجود التلاوة',
            theme,
            isEn: false,
            language: 'ar',
            setToastMessage
        });
    };

    const handleToggleZoom = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFontSize(prev => (prev >= 29 ? 15 : prev + 4));
    };

    const handleCloseModal = () => {
        stopTTS();
        onClose();
    };

    return (
        <div
            className={`fixed inset-0 bg-black/65 z-[2000] flex flex-col justify-end select-none settings-3d-adia-scope ${isDark ? 'settings-3d-dark quran-3d-dark' : ''}`}
            onClick={handleCloseModal}
            dir="rtl"
        >
            <div
                className={`app-page-card border-0 w-full max-w-xl mx-auto rounded-t-[28px] flex flex-col ${isLandscape ? 'max-h-[92dvh]' : 'max-h-[88dvh]'} overflow-hidden relative`}
                style={{
                    backgroundColor: sheetBgColor,
                    color: sheetTextColor,
                    fontFamily: "'Cairo', sans-serif",
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Top Drag Handle + Category Badge (matching Adia/Adhkar ZoomModals) */}
                <div className="pt-3 px-6 pb-2 shrink-0 flex flex-col items-center">
                    <div
                        className={`app-3d-drag-handle w-12 h-1.5 rounded-full mb-2 ${isDark ? 'bg-zinc-700' : 'bg-slate-300'}`}
                    />
                    <div className="w-full flex items-center justify-center">
                        <span
                            className="app-3d-badge px-3.5 py-1 rounded-full text-xs font-bold font-cairo"
                            style={{
                                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : hexToRgba(accentColor, 0.12),
                                color: accentColor,
                                fontFamily: "'Cairo', sans-serif"
                            }}
                        >
                            {categoryTitle}
                        </span>
                    </div>
                </div>

                {/* Scrollable Content Area with Cairo font & dynamic zoom */}
                <div
                    className="overflow-y-auto hide-scrollbar flex-1 min-h-0 px-6 py-4 space-y-5 text-right leading-relaxed font-cairo"
                    style={{
                        fontSize: `${fontSize}px`,
                        fontFamily: "'Cairo', sans-serif"
                    }}
                >
                    <div>
                        <p className="font-black mb-1.5 font-cairo" style={{ color: accentColor, fontSize: `${fontSize + 2}px` }}>
                            1. تعريف سجود التلاوة
                        </p>
                        <p className="mt-1 font-medium">
                            هو سجود يؤديه القارئ أو المستمع عند قراءة آية من آيات السجود في القرآن الكريم، تعظيماً لله تعالى وإظهاراً للعبودية. وقد ثبت في صحيح مسلم عن أبي هريرة رضي الله عنه قال: قال رسول الله ﷺ:
                        </p>
                        <blockquote
                            className="mt-2.5 p-3.5 rounded-2xl app-inner-3d-box border-0 font-semibold font-cairo leading-loose"
                            style={{
                                backgroundColor: innerBoxBgColor,
                                fontFamily: "'Cairo', sans-serif"
                            }}
                        >
                            "إذَا قَرَأَ ابنُ آدَمَ السَّجْدَةَ فَسَجَدَ، اعْتَزَلَ الشَّيْطَانُ يَبْكِي، يقولُ: يا وَيْلَهُ، أُمِرَ ابنُ آدَمَ بالسُّجُودِ فَسَجَدَ فَلَهُ الجَنَّةُ، وأُمِرْتُ بالسُّجُودِ فأبَيْتُ فَلِيَ النَّارُ".
                        </blockquote>
                    </div>

                    <div>
                        <p className="font-black mb-1.5 font-cairo" style={{ color: accentColor, fontSize: `${fontSize + 2}px` }}>
                            2. عدد آيات السجدة ومواضعها
                        </p>
                        <p className="mt-1 mb-2.5 font-medium">
                            اتفق جمهور العلماء على وجود آيات السجود في القرآن، وأشهر الآراء أنها 15 سجدة، وهي موزعة كالآتي:
                        </p>
                        <div
                            className="grid grid-cols-2 gap-x-4 gap-y-2 p-4 rounded-2xl app-inner-3d-box border-0 font-cairo"
                            style={{
                                backgroundColor: innerBoxBgColor,
                                fontSize: `${Math.max(13, fontSize - 2)}px`,
                                fontFamily: "'Cairo', sans-serif"
                            }}
                        >
                            <div className="text-right">الأعراف: <b>{toArabic(206)}</b></div>
                            <div className="text-right">النمل: <b>{toArabic(26)}</b></div>
                            <div className="text-right">الرعد: <b>{toArabic(15)}</b></div>
                            <div className="text-right">السجدة: <b>{toArabic(15)}</b></div>
                            <div className="text-right">النحل: <b>{toArabic(50)}</b></div>
                            <div className="text-right">ص: <b>{toArabic(24)}</b></div>
                            <div className="text-right">الإسراء: <b>{toArabic(109)}</b></div>
                            <div className="text-right">فصلت: <b>{toArabic(38)}</b></div>
                            <div className="text-right">مريم: <b>{toArabic(58)}</b></div>
                            <div className="text-right">النجم: <b>{toArabic(62)}</b></div>
                            <div className="text-right">الحج (سجدتان): <b>{toArabic(18)} و {toArabic(77)}</b></div>
                            <div className="text-right">الانشقاق: <b>{toArabic(21)}</b></div>
                            <div className="text-right">الفرقان: <b>{toArabic(60)}</b></div>
                            <div className="text-right">العلق: <b>{toArabic(19)}</b></div>
                        </div>
                    </div>

                    <div>
                        <p className="font-black mb-1.5 font-cairo" style={{ color: accentColor, fontSize: `${fontSize + 2}px` }}>
                            3. حكم سجود التلاوة
                        </p>
                        <p className="mt-1 mb-2 font-medium">اختلف الفقهاء في حكمها على قولين مشهورين:</p>
                        <ul className="list-disc pr-5 space-y-2 font-medium">
                            <li><b>جمهور العلماء (الشافعية والمالكية والحنابلة):</b> أنها سُنّة مؤكدة وليست واجبة؛ واستدلوا بأن عمر بن الخطاب رضي الله عنه قرأ السجدة يوم الجمعة على المنبر فنزل وسجد، ثم قرأها في الجمعة التالية فلم يسجد وقال: "إن الله لم يفرض علينا السجود إلا أن نشاء".</li>
                            <li><b>الحنفية:</b> ذهبوا إلى أنها واجبة على القارئ والمستمع.</li>
                        </ul>
                    </div>

                    <div>
                        <p className="font-black mb-1.5 font-cairo" style={{ color: accentColor, fontSize: `${fontSize + 2}px` }}>
                            4. شروط وكيفية سجود التلاوة
                        </p>
                        <div className="space-y-3 mt-1 font-medium">
                            <p>
                                <b>الشروط:</b><br />
                                يشترط لها عند جمهور الفقهاء ما يشترط للصلاة (الطهارة، استقبال القبلة، ستر العورة)، بينما ذهب بعض العلماء (مثل ابن تيمية والشوكاني) إلى أنه يجوز السجود دون طهارة (مثل سجود الشكر) لأنها ليست صلاة كاملة، لكن الأفضل والأحوط هو التطهر.
                            </p>
                            <div>
                                <p><b>الكيفية:</b></p>
                                <ul className="list-disc pr-5 space-y-2.5 mt-1">
                                    <li><b>التكبير:</b> يُكبر الساجد عند الهويّ للسجود (وعند الرفع منه إذا كان داخل الصلاة).</li>
                                    <li><b>السجود:</b> سجدة واحدة كسجدة الصلاة.</li>
                                    <li>
                                        <b>الدعاء:</b> يُشرع فيها ما يقال في سجود الصلاة "سبحان ربي الأعلى"، ويُستحب الدعاء المأثور:
                                        <blockquote
                                            className="mt-2.5 p-3.5 rounded-2xl app-inner-3d-box border-0 font-semibold font-cairo leading-loose"
                                            style={{
                                                backgroundColor: innerBoxBgColor,
                                                fontFamily: "'Cairo', sans-serif"
                                            }}
                                        >
                                            "سَجَدَ وَجْهِي لِلَّذِي خَلَقَهُ، وَشَقَّ سَمْعَهُ وَبَصَرَهُ، بِحَوْلِهِ وَقُوَّتِهِ".
                                        </blockquote>
                                        <blockquote
                                            className="mt-2.5 p-3.5 rounded-2xl app-inner-3d-box border-0 font-semibold font-cairo leading-loose"
                                            style={{
                                                backgroundColor: innerBoxBgColor,
                                                fontFamily: "'Cairo', sans-serif"
                                            }}
                                        >
                                            "اللَّهُمَّ اكْتُبْ لِي بِهَا عِنْدَكَ أَجْرًا، وَضَعْ عَنِّي بِهَا وِزْرًا، وَاجْعَلْهَا لِي عِنْدَكَ ذُخْرًا، وَتَقَبَّلْهَا مِنِّي كَمَا تَقَبَّلْتَهَا مِنْ عَبْدِكَ دَاوُدَ".
                                        </blockquote>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="font-black mb-1.5 font-cairo" style={{ color: accentColor, fontSize: `${fontSize + 2}px` }}>
                            5. ملاحظات هامة
                        </p>
                        <ul className="list-disc pr-5 space-y-2 mt-1 font-medium">
                            <li><b>داخل الصلاة:</b> إذا قرأ الإمام آية سجدة، يسجد ويسجد المأمومون معه.</li>
                            <li><b>للمستمع:</b> يشرع السجود للمستمع الذي يقصد سماع القرآن، أما "السامع" (من مرّ صدفة أو سمعها في مكان عام دون قصد) فلا يجب عليه السجود عند كثير من الفقهاء.</li>
                            <li><b>العجز عن السجود:</b> من لم يستطع السجود لسبب ما (كأن يكون في وسيلة مواصلات)، يمكنه الإيماء برأسه أو الاكتفاء بالذكر.</li>
                        </ul>
                    </div>
                </div>

                {/* Action Bar matching Adia/Adhkar ZoomModals (Audio, Share, Copy, Zoom, Close ChevronDown) */}
                <div className="px-4 pt-3 pb-2 modal-sheet-safe-bottom shrink-0 flex items-center justify-center gap-3 sm:gap-4 app-3d-divider-top overflow-visible">
                    {/* Audio Button */}
                    <button
                        type="button"
                        onClick={handlePlayAudio}
                        className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0"
                        style={{
                            backgroundColor: isPlaying ? hexToRgba(accentColor, 0.16) : actionBtnBgColor,
                            color: isPlaying ? '#EF4444' : sheetTextColor
                        }}
                        title={isEn ? (isPlaying ? 'Stop audio' : 'Play audio') : (isPlaying ? 'إيقاف الصوت' : 'استماع صوتي')}
                    >
                        {isPlaying ? <VolumeX className="w-5 h-5 text-red-500 animate-pulse" /> : <Volume2 className="w-5 h-5" />}
                    </button>

                    {/* Share Button */}
                    <button
                        type="button"
                        onClick={handleShare}
                        className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0"
                        style={{
                            backgroundColor: actionBtnBgColor,
                            color: sheetTextColor
                        }}
                        title={isEn ? 'Share Image' : 'مشاركة كصورة'}
                    >
                        <Share2 className="w-5 h-5" />
                    </button>

                    {/* Copy Button */}
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0"
                        style={{
                            backgroundColor: copied ? '#10B981' : actionBtnBgColor,
                            color: copied ? '#FFFFFF' : sheetTextColor
                        }}
                        title={isEn ? 'Copy text' : 'نسخ النص'}
                    >
                        {copied ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5" />}
                    </button>

                    {/* Zoom Button */}
                    <button
                        type="button"
                        onClick={handleToggleZoom}
                        className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0"
                        style={{
                            backgroundColor: actionBtnBgColor,
                            color: sheetTextColor
                        }}
                        title={isEn ? 'Enlarge font size' : 'تكبير حجم الخط'}
                    >
                        <ZoomIn className="w-5 h-5" />
                    </button>

                    {/* Chevron Down / Hide Modal Button */}
                    <button
                        type="button"
                        onClick={handleCloseModal}
                        className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0"
                        style={{
                            backgroundColor: actionBtnBgColor,
                            color: sheetTextColor
                        }}
                        title={isEn ? 'Hide list' : 'إخفاء القائمة'}
                    >
                        <ChevronDown className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SajdahCardModal;
