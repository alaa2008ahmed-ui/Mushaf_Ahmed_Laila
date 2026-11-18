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
    cardBg?: string;
    modalBg?: string;
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
    isBlackTheme,
    cardBg,
    modalBg: propModalBg
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

    const surfaceBg = cardBg || (isBlackTheme ? '#18181b' : '#ffffff');
    const modalSurfaceBg = propModalBg || (isBlackTheme ? '#121214' : '#ffffff');
    const card3dShadow = isBlackTheme
        ? '0 5px 0 #09090b, 0 12px 24px rgba(0, 0, 0, 0.72), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.16), inset 0 -2px 4px rgba(0, 0, 0, 0.45)'
        : '0 5px 0 rgba(0, 0, 0, 0.13), 0 10px 20px -2px rgba(0, 0, 0, 0.11), inset 0 2px 2px rgba(255, 255, 255, 0.95), inset 0 -2px 4px rgba(0, 0, 0, 0.05)';
    const item3dShadow = isBlackTheme
        ? '0 4px 0 #09090b, 0 8px 16px rgba(0, 0, 0, 0.65), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.14), inset 0 -2px 4px rgba(0, 0, 0, 0.45)'
        : '0 4px 0 rgba(0, 0, 0, 0.12), 0 8px 16px -2px rgba(0, 0, 0, 0.09), inset 0 2px 2px rgba(255, 255, 255, 0.95), inset 0 -2px 4px rgba(0, 0, 0, 0.04)';
    const modalShadow = isBlackTheme
        ? '0 8px 0 #050507, 0 24px 50px rgba(0, 0, 0, 0.85), inset 0 2px 2px rgba(255, 255, 255, 0.14)'
        : '0 8px 0 rgba(0, 0, 0, 0.16), 0 24px 48px rgba(0, 0, 0, 0.30), inset 0 2px 2px rgba(255, 255, 255, 0.92)';
    const activeAccentBg = isBlackTheme ? '#FFFFFF' : primaryColor;
    const activeAccentText = isBlackTheme ? '#000000' : '#ffffff';
    const activeLip = isBlackTheme ? '#52525b' : 'rgba(0, 0, 0, 0.24)';

    const allToneOptions = [
        { name: 'بدون تنبيه', value: 'none' },
        ...internetTones.map(t => ({ name: t.name, value: t.path })),
        { name: 'اختيار نغمة', value: 'custom' },
    ];

    return (
        <div dir={dir}>
            <label className="block text-[10px] font-black mb-2 uppercase tracking-widest text-center" style={{ color: isBlackTheme ? '#FFFFFF' : primaryColor }}>
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
                    className="unified-3d-btn flex-1 flex items-center justify-between p-3 rounded-2xl cursor-pointer font-bold text-xs sm:text-sm border-0"
                    style={{ 
                        backgroundColor: surfaceBg,
                        color: isBlackTheme ? '#FFFFFF' : primaryColor,
                        boxShadow: card3dShadow
                    }}
                >
                    <div className="flex items-center gap-2.5 min-w-0">
                        <Volume2 className="w-4 h-4 shrink-0" style={{ color: isBlackTheme ? '#FFFFFF' : primaryColor }} />
                        <span className="truncate">{getToneDisplayName(selectedName, language)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 opacity-80">
                        <span className="text-[10px] font-medium hidden sm:inline" style={{ color: isBlackTheme ? '#FFFFFF' : primaryColor }}>
                            {tPrayer('changeTone', language)}
                        </span>
                        <ChevronDown className="w-4 h-4" style={{ color: isBlackTheme ? '#FFFFFF' : primaryColor }} />
                    </div>
                </button>

                {/* Live Preview Button for Currently Selected Tone */}
                {currentPlayableSource && (
                    <button
                        type="button"
                        onClick={(e) => handleTogglePreview(currentPlayableSource, e)}
                        className={`unified-3d-btn p-3 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer border-0 ${
                            playingTone === currentPlayableSource ? 'tone-3d-active' : ''
                        }`}
                        style={playingTone === currentPlayableSource ? {
                            backgroundColor: activeAccentBg,
                            backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(0,0,0,0.08) 100%)',
                            color: activeAccentText,
                            boxShadow: `0 5px 0 ${activeLip}, 0 10px 18px -2px rgba(0,0,0,0.22), inset 0 1.5px 1px rgba(255,255,255,0.4)`
                        } : {
                            backgroundColor: surfaceBg,
                            color: isBlackTheme ? '#ffffff' : primaryColor,
                            boxShadow: card3dShadow
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
                <p className="text-center text-[10px] mt-1 truncate" style={{ color: isBlackTheme ? '#a1a1aa' : secondaryColor }}>
                    {tPrayer('currentToneFile', language)} {selectedName || currentTone.name}
                </p>
            )}

            {/* Dedicated Tone Selection Modal */}
            {isModalOpen && (
                <div 
                    className="fixed inset-0 bg-black/65 z-[70] flex items-center justify-center p-4"
                    onClick={handleCloseModal}
                    dir={dir}
                >
                    <div 
                        className="rounded-[2.5rem] w-full max-w-xs sm:max-w-sm max-h-[88dvh] flex flex-col p-5 sm:p-6 border-0"
                        style={{ 
                            backgroundColor: modalSurfaceBg, 
                            color: isBlackTheme ? '#ffffff' : '#0f172a',
                            boxShadow: modalShadow
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div 
                            className="flex justify-between items-center mb-4 pb-2.5 border-b shrink-0"
                            style={{ borderColor: isBlackTheme ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)' }}
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className="app-3d-badge w-8 h-8 rounded-xl flex items-center justify-center"
                                    style={{
                                        backgroundColor: isBlackTheme ? '#27272a' : '#ffffff',
                                        boxShadow: isBlackTheme
                                            ? '0 2.5px 0 #09090b, inset 0 1px 1px rgba(255,255,255,0.14)'
                                            : '0 2.5px 0 rgba(0,0,0,0.12), inset 0 1.5px 1px rgba(255,255,255,0.95)'
                                    }}
                                >
                                    <Music className="w-4 h-4" style={{ color: isBlackTheme ? '#FFFFFF' : primaryColor }} />
                                </span>
                                <h3 className="font-black text-sm sm:text-base font-kufi" style={{ color: isBlackTheme ? '#FFFFFF' : primaryColor }}>
                                    {tPrayer('selectToneModalTitle', language)}
                                </h3>
                            </div>
                            <button 
                                type="button"
                                onClick={handleCloseModal} 
                                className="tone-modal-close unified-3d-btn w-8 h-8 rounded-full flex items-center justify-center hover:text-red-500 cursor-pointer border-0"
                                style={{ 
                                    backgroundColor: isBlackTheme ? '#27272a' : '#ffffff',
                                    color: isBlackTheme ? '#e4e4e7' : '#475569',
                                    boxShadow: isBlackTheme
                                        ? '0 3px 0 #09090b, 0 5px 10px rgba(0,0,0,0.45), inset 0 1px 1px rgba(255,255,255,0.14)'
                                        : '0 3px 0 rgba(0,0,0,0.12), 0 5px 10px rgba(0,0,0,0.08), inset 0 1.5px 1px rgba(255,255,255,0.95)'
                                }}
                                title={tPrayer('close', language)}
                                aria-label={tPrayer('close', language)}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Tone List as 3D Framed Items with Direct Audition */}
                        <div className="space-y-2.5 overflow-y-auto flex-1 min-h-0 max-h-[62dvh] py-1 px-1 no-scrollbar">
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
                                            className={`unified-3d-btn flex-1 py-2.5 px-4 rounded-2xl text-center font-bold text-xs sm:text-sm flex items-center justify-between relative cursor-pointer border-0 ${
                                                isSelected ? 'tone-3d-active' : ''
                                            }`}
                                            style={isSelected ? {
                                                backgroundColor: activeAccentBg,
                                                backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(0,0,0,0.08) 100%)',
                                                color: activeAccentText,
                                                boxShadow: `0 4px 0 ${activeLip}, 0 8px 16px -2px rgba(0,0,0,0.22), inset 0 1.5px 1px rgba(255,255,255,0.4)`
                                            } : {
                                                backgroundColor: surfaceBg,
                                                color: isBlackTheme ? '#ffffff' : '#0f172a',
                                                boxShadow: item3dShadow
                                            }}
                                        >
                                            <span className="font-bold truncate">{getToneDisplayName(tone.name, language)}</span>
                                            {isSelected && (
                                                <Check className={`w-4 h-4 shrink-0 ${
                                                    isBlackTheme ? 'text-black' : 'text-white'
                                                }`} />
                                            )}
                                        </button>

                                        {isPlayable && (
                                            <button
                                                type="button"
                                                onClick={(e) => handleTogglePreview(tone.value, e)}
                                                className={`unified-3d-btn p-2.5 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer border-0 ${
                                                    isTonePlaying ? 'tone-3d-active' : ''
                                                }`}
                                                style={isTonePlaying ? {
                                                    backgroundColor: activeAccentBg,
                                                    backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(0,0,0,0.08) 100%)',
                                                    color: activeAccentText,
                                                    boxShadow: `0 4px 0 ${activeLip}, 0 8px 14px -2px rgba(0,0,0,0.22), inset 0 1.5px 1px rgba(255,255,255,0.4)`
                                                } : {
                                                    backgroundColor: surfaceBg,
                                                    color: isBlackTheme ? '#ffffff' : primaryColor,
                                                    boxShadow: item3dShadow
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
