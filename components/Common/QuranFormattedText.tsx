import React from 'react';

export interface QuranFormattedTextProps {
    text: string;
    source?: string;
    title?: string;
    isEn?: boolean;
    isQuran?: boolean;
    accentColor: string;
    showSurahHeader?: boolean;
    fontSize?: number;
    className?: string;
    nonQuranClassName?: string;
    style?: React.CSSProperties;
}

export function getThemeQuranAccentColor(theme: any, themeKey?: string): string {
    const isPureBlackWhite =
        themeKey === 'deep_black' ||
        theme?.name === 'اسود' ||
        theme?.name === 'أبيض وأسود';
    if (isPureBlackWhite) {
        return '#CBD5E1';
    }
    return theme?.palette?.[0] || theme?.accent || '#D97706';
}

export function isQuranicContent(
    text: string,
    source?: string,
    title?: string,
    explicitIsQuran?: boolean
): boolean {
    if (explicitIsQuran) return true;
    if (!text) return false;
    if (/\([٠-٩]+\)/.test(text)) return true;
    if (/^(آية الكرسي:|سورة الإخلاص والمعوذتين:)/m.test(text.trim())) return true;
    if (
        /\(\d+\)/.test(text) &&
        /\b(Surah|Surahs|Ayat Al-Kursi|Qur'an|Quran)\b/i.test(`${source || ''} ${title || ''}`)
    ) {
        return true;
    }
    if (
        /^(Surah|Ayat Al-Kursi)\b/i.test((title || '').trim()) &&
        !/\b(Supplication|Dua|Hadith)\b/i.test(title || '')
    ) {
        return true;
    }
    return false;
}

export function extractSurahName(
    text: string,
    source?: string,
    title?: string,
    isEn: boolean = false
): string {
    const combined = `${title || ''} ${source || ''} ${text || ''}`;

    if (isEn) {
        if (/Ayat Al-Kursi/i.test(combined) || /Allah\s*[-–!]\s*there is no deity except Him.*Ever-Living/i.test(text)) {
            return 'Surah Al-Baqarah • Ayat Al-Kursi';
        }
        const titleSurah = (title || '').match(/\b(Surah\s+[^,:()\/\n•]+?)(?:\s*\(|$)/i);
        if (titleSurah?.[1]) {
            return titleSurah[1].trim();
        }
        const srcSurah = (source || '').match(/\b(Surah\s+[^,:()\/\n•]+)/i);
        if (srcSurah?.[1]) {
            return srcSurah[1].trim();
        }
        return '';
    }

    if (/آية الكرسي/.test(combined) || /اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ/.test(text)) {
        return 'سورة البقرة • آية الكرسي';
    }

    if (/آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ/.test(text) || /لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ/.test(text)) {
        if (!/سورة\s+/.test(`${title || ''} ${source || ''}`)) {
            return 'سورة البقرة';
        }
    }

    if (title) {
        const titleMatch = title.match(/(سورة\s+[^،:()\/\n•\-]+)/);
        if (titleMatch?.[1]) {
            return titleMatch[1].trim();
        }
    }

    if (source) {
        const srcMatch = source.match(/(سورة\s+[^،:()\/\n•\-]+)/);
        if (srcMatch?.[1]) {
            return srcMatch[1].trim();
        }
        if (/القرآن الكريم:\s*البقرة/.test(source)) {
            return 'سورة البقرة';
        }
    }

    return '';
}

function normalizeQuranLineBreaks(raw: string): string {
    return raw
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .trim();
}

function renderAyahTokens(line: string, accentColor: string, isEn: boolean): React.ReactNode {
    const regex = isEn ? /(\(\d+\))/g : /(\([٠-٩]+\))/g;
    const parts = line.split(regex);
    if (parts.length === 1) return line;
    return parts.map((part, idx) => {
        if ((isEn && /^\(\d+\)$/.test(part)) || (!isEn && /^\([٠-٩]+\)$/.test(part))) {
            return (
                <span
                    key={idx}
                    className="font-bold mx-0.5"
                    style={{ color: accentColor }}
                >
                    {part}
                </span>
            );
        }
        return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
}

function isMuawidhatMultiSurah(normalized: string, isEn: boolean): boolean {
    if (isEn) {
        return (
            /He is Allah, \[who is\] One/i.test(normalized) &&
            /Lord of daybreak/i.test(normalized) &&
            /Lord of mankind/i.test(normalized)
        );
    }
    return (
        /قُلْ هُوَ اللَّهُ أَحَدٌ/.test(normalized) &&
        /قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ/.test(normalized) &&
        /قُلْ أَعُوذُ بِرَبِّ النَّاسِ/.test(normalized)
    );
}

function isKawtharNasrMultiSurah(normalized: string): boolean {
    return /إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ/.test(normalized) && /إِذَا جَاءَ نَصْرُ اللَّهِ/.test(normalized);
}

export const QuranFormattedText: React.FC<QuranFormattedTextProps> = ({
    text,
    source,
    title,
    isEn = false,
    isQuran,
    accentColor,
    showSurahHeader = true,
    fontSize,
    className = '',
    nonQuranClassName = '',
    style,
}) => {
    const isQuranItem = isQuranicContent(text, source, title, isQuran);

    if (!isQuranItem) {
        return (
            <p
                className={nonQuranClassName || className}
                dir={isEn ? 'ltr' : 'rtl'}
                style={{
                    ...(fontSize ? { fontSize: `${fontSize}px` } : {}),
                    ...style,
                }}
            >
                {text}
            </p>
        );
    }

    const normalized = normalizeQuranLineBreaks(text);
    const dir = isEn ? 'ltr' : 'rtl';
    const alignClass = isEn ? 'text-left' : 'text-right';
    const headerFontSize = fontSize ? `${Math.max(13, Math.round(fontSize * 0.68))}px` : undefined;

    // 1. Special multi-surah: Al-Ikhlas + Al-Falaq + An-Nas (المعوذات)
    if (isMuawidhatMultiSurah(normalized, isEn)) {
        const cleaned = normalized
            .replace(/^سورة الإخلاص والمعوذتين:\s*\n?/, '')
            .trim();
        const blocks = cleaned.split(/\n{2,}/).map(b => b.trim()).filter(Boolean);

        return (
            <div
                className={`space-y-4 select-none ${alignClass} ${className}`}
                dir={dir}
                style={{
                    ...(fontSize ? { fontSize: `${fontSize}px` } : {}),
                    ...style,
                }}
            >
                {blocks.map((block, bIdx) => {
                    let blockSurahName = '';
                    if (isEn) {
                        if (/He is Allah/i.test(block)) blockSurahName = 'Surah Al-Ikhlas';
                        else if (/Lord of daybreak/i.test(block)) blockSurahName = 'Surah Al-Falaq';
                        else if (/Lord of mankind/i.test(block)) blockSurahName = 'Surah An-Nas';
                    } else {
                        if (/قُلْ هُوَ اللَّهُ أَحَدٌ/.test(block)) blockSurahName = 'سورة الإخلاص';
                        else if (/قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ/.test(block)) blockSurahName = 'سورة الفلق';
                        else if (/قُلْ أَعُوذُ بِرَبِّ النَّاسِ/.test(block)) blockSurahName = 'سورة الناس';
                    }

                    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);

                    return (
                        <div key={bIdx} className="space-y-1">
                            {blockSurahName && (
                                <div
                                    className="font-bold text-sm sm:text-base leading-snug"
                                    style={{
                                        color: accentColor,
                                        ...(headerFontSize ? { fontSize: headerFontSize } : {}),
                                    }}
                                >
                                    {blockSurahName}
                                </div>
                            )}
                            {lines.map((line, lIdx) => (
                                <p key={lIdx} className="leading-loose">
                                    {renderAyahTokens(line, accentColor, isEn)}
                                </p>
                            ))}
                        </div>
                    );
                })}
            </div>
        );
    }

    // 2. Special multi-surah in Ruqyah: Al-Kawthar & An-Nasr
    if (!isEn && isKawtharNasrMultiSurah(normalized)) {
        const blocks = normalized.split(/\n*\s*•\s*\n*/).map(b => b.trim()).filter(Boolean);
        return (
            <div
                className={`space-y-4 select-none ${alignClass} ${className}`}
                dir={dir}
                style={{
                    ...(fontSize ? { fontSize: `${fontSize}px` } : {}),
                    ...style,
                }}
            >
                {blocks.map((block, bIdx) => {
                    const blockSurahName = /إِنَّا أَعْطَيْنَاكَ/.test(block)
                        ? 'سورة الكوثر'
                        : /إِذَا جَاءَ نَصْرُ/.test(block)
                        ? 'سورة النصر'
                        : '';
                    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
                    return (
                        <div key={bIdx} className="space-y-1">
                            {blockSurahName && (
                                <div
                                    className="font-bold text-sm sm:text-base leading-snug"
                                    style={{
                                        color: accentColor,
                                        ...(headerFontSize ? { fontSize: headerFontSize } : {}),
                                    }}
                                >
                                    {blockSurahName}
                                </div>
                            )}
                            {lines.map((line, lIdx) => (
                                <p key={lIdx} className="leading-loose">
                                    {renderAyahTokens(line, accentColor, isEn)}
                                </p>
                            ))}
                        </div>
                    );
                })}
            </div>
        );
    }

    // 3. Standard single Surah / Quranic verse(s)
    const cleanedBody = normalized
        .replace(/^(آية الكرسي|سورة الإخلاص|سورة الفلق|سورة الناس):\s*\n?/, '')
        .trim();

    const surahLabel = showSurahHeader ? extractSurahName(text, source, title, isEn) : '';
    const lines = cleanedBody.split('\n').map(l => l.trim()).filter(Boolean);

    return (
        <div
            className={`space-y-1.5 select-none ${alignClass} ${className}`}
            dir={dir}
            style={{
                ...(fontSize ? { fontSize: `${fontSize}px` } : {}),
                ...style,
            }}
        >
            {surahLabel && (
                <div
                    className="font-bold text-sm sm:text-base leading-snug mb-1"
                    style={{
                        color: accentColor,
                        ...(headerFontSize ? { fontSize: headerFontSize } : {}),
                    }}
                >
                    {surahLabel}
                </div>
            )}
            {lines.map((line, idx) => (
                <p key={idx} className="leading-loose">
                    {renderAyahTokens(line, accentColor, isEn)}
                </p>
            ))}
        </div>
    );
};

export default QuranFormattedText;
