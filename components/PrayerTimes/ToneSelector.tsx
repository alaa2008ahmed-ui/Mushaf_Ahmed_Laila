import React, { useState, useEffect } from 'react';
import { Volume2, ChevronDown, Check, X, Music, Play, Square } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { tPrayer, getToneDisplayName } from '../../utils/prayerTimesTranslations';
import { playNotificationSound, stopNotificationSound } from '../../utils/prayerTimesUtils';

interface ToneSelectorProps {
    currentEditingKey: string | null;
    configTones: Record<string, any>;
    internetTones: { name: string; path: string }[];
    handleToneSelection: (e: any) => void;
    handleToneUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    secondaryColor: string;
    primaryColor: string;
    cardBorderColor?: string;
    isDefaultTheme?: boolean;
    isBlackTheme?: boolean;
}

const ToneSelector: React.FC<ToneSelectorProps> = ({
    currentEditingKey,
    configTones,
    internetTones,
    handleToneSelection,
    handleToneUpload,
    secondaryColor,
    primaryColor,
    cardBorderColor,
    isDefaultTheme,
    isBlackTheme
}) => {
    const { language, isRTL, dir } = useLanguage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [playingTone, setPlayingTone] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            stopNotificationSound();
        };
    }, []);

    if (!currentEditingKey) return null;
    
    const currentTone = configTones[currentEditingKey];
    let selectValue = '/assets/audio/takbeer1.mp3'; // Default to Takbeer 1
    let selectedName = 'تكبيرة 1';

    if (currentTone) {
        const findMatch = (pathVal?: string, nameVal?: string) => {
            if (!pathVal && !nameVal) return null;
            const norm = (s: string) => (s || '').trim().toLowerCase().replace(/ة/g, 'ه').replace(/أ|إ|آ/g, 'ا');
            return internetTones.find(t => {
                if (pathVal && (t.path === pathVal || t.path.toLowerCase() === pathVal.toLowerCase())) return true;
                if (pathVal && (t.path.endsWith(pathVal) || pathVal.endsWith(t.path.replace('/assets/audio/', '')))) return true;
                if (nameVal && norm(t.name) === norm(nameVal)) return true;
                return false;
            });
        };

        if (currentTone.data === 'none') {
            selectValue = 'none';
            selectedName = 'بدون تنبيه';
        } else if (currentTone.data && currentTone.data.startsWith('data:')) {
            selectValue = 'custom';
            selectedName = currentTone.name || 'نغمة مخصصة';
        } else if (currentTone.originalUrl) {
            const match = findMatch(currentTone.originalUrl, currentTone.name);
            selectValue = match ? match.path : currentTone.originalUrl;
            selectedName = match ? match.name : (currentTone.name || 'نغمة مخصصة');
        } else {
            const match = findMatch(currentTone.data, currentTone.name);
            selectValue = match ? match.path : currentTone.data;
            selectedName = match ? match.name : (currentTone.name || 'تكبيرة 1');
        }
    }

    const currentPlayableSource = currentTone?.data && currentTone.data !== 'none'
        ? currentTone.data
        : (selectValue !== 'none' && selectValue !== 'custom' ? selectValue : null);

    const handleTogglePreview = (source: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!source || source === 'none') return;

        if (playingTone === source) {
            stopNotificationSound();
            setPlayingTone(null);
        } else {
            stopNotificationSound();
            setPlayingTone(source);
            playNotificationSound(source, true);
        }
    };

    const handleSelectTone = (toneValue: string) => {
        stopNotificationSound();
        setPlayingTone(null);
        handleToneSelection({ target: { value: toneValue } });
        setIsModalOpen(false);
    };

    const handleCloseModal = () => {
        stopNotificationSound();
        setPlayingTone(null);
        setIsModalOpen(false);
    };

    const itemBorderColor = cardBorderColor || (isDefaultTheme ? '#000000' : (isBlackTheme ? '#FFFFFF' : primaryColor));

    const allToneOptions = [
        { name: 'بدون تنبيه', value: 'none' },
        ...internetTones.map(t => ({ name: t.name, value: t.path })),
        { name: 'نغمة مخصصة من الجهاز...', value: 'custom' },
    ];

    return (
        <div dir={dir}>
            <label className="block text-[10px] font-black mb-2 uppercase tracking-widest text-center" style={{ color: isBlackTheme ? '#FFFFFF' : secondaryColor }}>
                {tPrayer('alertToneLabel', language)}
            </label>
            
            {/* Tone Selector Row: Modal Trigger Button + Live Audition/Preview Button */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => {
                        stopNotificationSound();
                        setPlayingTone(null);
                        setIsModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-between themed-bg-alt p-3 rounded-2xl shadow-xs transition-all cursor-pointer font-bold text-xs sm:text-sm hover:opacity-90"
                    style={{ 
                        border: `2px solid ${itemBorderColor}`,
                        color: isBlackTheme ? '#FFFFFF' : primaryColor
                    }}
                >
                    <div className="flex items-center gap-2.5 min-w-0">
                        <Volume2 className="w-4 h-4 shrink-0" style={{ color: isBlackTheme ? '#FFFFFF' : primaryColor }} />
                        <span className="truncate">{getToneDisplayName(selectedName, language)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 opacity-70">
                        <span className="text-[10px] font-medium hidden sm:inline" style={{ color: isBlackTheme ? '#FFFFFF' : undefined }}>
                            {tPrayer('changeTone', language)}
                        </span>
                        <ChevronDown className="w-4 h-4" style={{ color: isBlackTheme ? '#FFFFFF' : undefined }} />
                    </div>
                </button>

                {/* Live Preview Button for Currently Selected Tone */}
                {currentPlayableSource && (
                    <button
                        type="button"
                        onClick={(e) => handleTogglePreview(currentPlayableSource, e)}
                        className="p-3 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-all shadow-xs"
                        style={{
                            border: `2px solid ${itemBorderColor}`,
                            backgroundColor: playingTone === currentPlayableSource
                                ? (isDefaultTheme ? '#000000' : (isBlackTheme ? '#FFFFFF' : primaryColor))
                                : 'var(--card-bg, #ffffff)',
                            color: playingTone === currentPlayableSource
                                ? (isDefaultTheme ? '#ffffff' : (isBlackTheme ? '#000000' : '#ffffff'))
                                : (isBlackTheme ? '#ffffff' : primaryColor)
                        }}
                        title={playingTone === currentPlayableSource ? (language === 'ar' ? 'إيقاف المعاينة' : 'Stop Preview') : (language === 'ar' ? 'معاينة النغمة' : 'Preview Tone')}
                        aria-label={playingTone === currentPlayableSource ? 'Stop' : 'Play'}
                    >
                        {playingTone === currentPlayableSource ? (
                            <Square className="w-4 h-4 fill-current animate-pulse" />
                        ) : (
                            <Play className="w-4 h-4 fill-current" />
                        )}
                    </button>
                )}
            </div>

            {/* Hidden File Input for Custom Tones */}
            <input 
                type="file" 
                id="sound-file-input" 
                accept="audio/*" 
                className="sr-only absolute w-0 h-0 opacity-0 overflow-hidden pointer-events-none" 
                onChange={handleToneUpload}
            />

            {selectValue === 'custom' && currentTone && (
                <p className="text-center text-[10px] mt-1 truncate" style={{ color: isBlackTheme ? '#FFFFFF' : secondaryColor }}>
                    {tPrayer('currentToneFile', language)} {currentTone.name}
                </p>
            )}

            {/* Dedicated Tone Selection Modal Matching the User Request & Image */}
            {isModalOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
                    onClick={handleCloseModal}
                    dir={dir}
                >
                    <div 
                        className="rounded-[2.5rem] w-full max-w-xs sm:max-w-sm max-h-[85vh] flex flex-col p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
                        style={{ 
                            backgroundColor: isBlackTheme ? '#000000' : 'var(--modal-bg, #ffffff)', 
                            color: isBlackTheme ? '#ffffff' : 'var(--modal-text, #000000)',
                            border: `2px solid ${itemBorderColor}`
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div 
                            className="flex justify-between items-center mb-4 pb-2 border-b shrink-0"
                            style={{ borderColor: isBlackTheme ? '#333333' : 'var(--card-border, #e5e7eb)' }}
                        >
                            <div className="flex items-center gap-2">
                                <Music className="w-4 h-4" style={{ color: isBlackTheme ? '#FFFFFF' : primaryColor }} />
                                <h3 className="font-black text-sm sm:text-base font-kufi" style={{ color: isBlackTheme ? '#FFFFFF' : primaryColor }}>
                                    {tPrayer('selectToneModalTitle', language)}
                                </h3>
                            </div>
                            <button 
                                type="button"
                                onClick={handleCloseModal} 
                                className="hover:text-red-500 transition-colors cursor-pointer p-1 rounded-full"
                                style={{ color: isBlackTheme ? '#FFFFFF' : secondaryColor }}
                                title={tPrayer('close', language)}
                                aria-label={tPrayer('close', language)}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tone List as Rounded Framed Items with Direct Audition */}
                        <div className="space-y-2 overflow-y-auto max-h-[62vh] py-1 px-1 no-scrollbar">
                            {allToneOptions.map((tone) => {
                                const isSelected = selectValue === tone.value;
                                const isPlayable = tone.value !== 'none' && tone.value !== 'custom';
                                const isTonePlaying = playingTone === tone.value;

                                return (
                                    <div
                                        key={tone.value}
                                        className="w-full flex items-center gap-2"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSelectTone(tone.value)}
                                            className="flex-1 py-2.5 px-4 rounded-2xl text-center font-bold text-xs sm:text-sm transition-transform active:scale-95 flex items-center justify-between relative cursor-pointer"
                                            style={{
                                                border: `2px solid ${itemBorderColor}`,
                                                backgroundColor: isSelected 
                                                    ? (isDefaultTheme ? '#000000' : (isBlackTheme ? '#FFFFFF' : primaryColor)) 
                                                    : 'var(--card-bg, #ffffff)',
                                                color: isSelected 
                                                    ? (isDefaultTheme ? '#ffffff' : (isBlackTheme ? '#000000' : '#ffffff')) 
                                                    : (isBlackTheme ? '#ffffff' : '#000000')
                                            }}
                                        >
                                            <span className="font-bold truncate">{getToneDisplayName(tone.name, language)}</span>
                                            {isSelected && (
                                                <Check className={`w-4 h-4 shrink-0 ${
                                                    isDefaultTheme ? 'text-white' : (isBlackTheme ? 'text-black' : 'text-white')
                                                }`} />
                                            )}
                                        </button>

                                        {isPlayable && (
                                            <button
                                                type="button"
                                                onClick={(e) => handleTogglePreview(tone.value, e)}
                                                className="p-2.5 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer active:scale-90 transition-all shadow-xs"
                                                style={{
                                                    border: `2px solid ${itemBorderColor}`,
                                                    backgroundColor: isTonePlaying
                                                        ? (isDefaultTheme ? '#000000' : (isBlackTheme ? '#FFFFFF' : primaryColor))
                                                        : 'var(--card-bg, #ffffff)',
                                                    color: isTonePlaying
                                                        ? (isDefaultTheme ? '#ffffff' : (isBlackTheme ? '#000000' : '#ffffff'))
                                                        : (isBlackTheme ? '#ffffff' : primaryColor)
                                                }}
                                                title={isTonePlaying ? (language === 'ar' ? 'إيقاف' : 'Stop') : (language === 'ar' ? 'معاينة' : 'Preview')}
                                                aria-label={isTonePlaying ? 'Stop' : 'Preview'}
                                            >
                                                {isTonePlaying ? (
                                                    <Square className="w-3.5 h-3.5 fill-current animate-pulse" />
                                                ) : (
                                                    <Play className="w-3.5 h-3.5 fill-current" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ToneSelector;
