import React, { useState, useEffect } from 'react';
import { Volume2, Volume1, VolumeX, Play, Square } from 'lucide-react';
import { playNotificationSound, stopNotificationSound, updateActiveWebAudioVolume } from '../../utils/prayerTimesUtils';
import { useLanguage } from '../../context/LanguageContext';
import { tPrayer } from '../../utils/prayerTimesTranslations';

interface PrayerAlertVolumeSliderProps {
    volume: number;
    onChange: (vol: number) => void;
    currentTonePath?: string;
    primaryColor?: string;
    secondaryColor?: string;
    cardBorderColor?: string;
    isBlackTheme?: boolean;
    cardBg?: string;
    textColor?: string;
    subtextColor?: string;
    className?: string;
    hideHeader?: boolean;
    showDescription?: boolean;
    use3dAdiaStyle?: boolean;
}

export const PrayerAlertVolumeSlider: React.FC<PrayerAlertVolumeSliderProps> = ({
    volume,
    onChange,
    currentTonePath,
    primaryColor = '#ca8a04',
    secondaryColor = '#854d0e',
    cardBorderColor,
    isBlackTheme = false,
    cardBg,
    textColor,
    subtextColor,
    className = '',
    hideHeader = false,
    showDescription = false,
    use3dAdiaStyle = false
}) => {
    const { language, isRTL, dir } = useLanguage();
    const isEn = language === 'en';
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);

    useEffect(() => {
        return () => {
            if (isPlayingPreview) {
                stopNotificationSound();
            }
        };
    }, [isPlayingPreview]);

    const handleVolumeChange = (newVal: number) => {
        const clamped = Math.max(0, Math.min(100, Math.round(newVal)));
        onChange(clamped);

        if (isPlayingPreview) {
            if (clamped <= 0) {
                stopNotificationSound();
                setIsPlayingPreview(false);
            } else {
                updateActiveWebAudioVolume(clamped);
            }
        }
    };

    const handleTogglePreview = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isPlayingPreview) {
            stopNotificationSound();
            setIsPlayingPreview(false);
        } else {
            const toneToPlay = currentTonePath && currentTonePath !== 'none'
                ? currentTonePath
                : '/assets/audio/chime.mp3';
            setIsPlayingPreview(true);
            playNotificationSound(toneToPlay, true, volume);

            setTimeout(() => {
                setIsPlayingPreview(false);
            }, 6000);
        }
    };

    const presets = [
        { label: isEn ? 'Mute' : 'كتم', value: 0 },
        { label: '35%', value: 35 },
        { label: '70%', value: 70 },
        { label: '100%', value: 100 }
    ];

    const effectiveTextColor = textColor || (isBlackTheme ? '#ffffff' : '#0f172a');
    const effectiveSubtextColor = subtextColor || (isBlackTheme ? '#a1a1aa' : '#64748b');
    const effectiveCardBg = cardBg || (isBlackTheme ? '#18181b' : '#ffffff');
    const effectiveBorderColor = cardBorderColor || (isBlackTheme ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)');
    const selectedTextColor = (isBlackTheme && primaryColor.toLowerCase() === '#ffffff') ? '#000000' : '#ffffff';

    const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

    return (
        <div 
            dir={dir}
            className={use3dAdiaStyle
                ? `p-3.5 rounded-2xl app-page-card border-0 transition-all space-y-2.5 overflow-visible ${className}`
                : `p-3.5 rounded-2xl app-page-card border-0 transition-all space-y-2.5 overflow-visible ${className}`
            }
            style={{ backgroundColor: effectiveCardBg }}
        >
            {/* Header: Icon + Title + Value Badge + Test Button (Optional) */}
            {!hideHeader && (
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <div 
                            className="app-3d-badge w-6.5 h-6.5 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                            style={{ 
                                backgroundColor: volume === 0 ? 'rgba(239, 68, 68, 0.15)' : `${primaryColor}18`,
                                color: volume === 0 ? '#ef4444' : primaryColor
                            }}
                        >
                            <VolumeIcon className="w-3.5 h-3.5 stroke-[2.2]" />
                        </div>
                        <span className="font-bold text-xs truncate" style={{ color: effectiveTextColor }}>
                            {tPrayer('alertVolumeTitle', language)}
                        </span>
                        <span 
                            className="app-3d-badge text-[10px] font-black px-2 py-0.5 rounded-full shrink-0"
                            style={{
                                backgroundColor: volume === 0 ? 'rgba(239, 68, 68, 0.15)' : `${primaryColor}20`,
                                color: volume === 0 ? '#ef4444' : primaryColor
                            }}
                        >
                            {volume === 0 ? (isEn ? 'Muted' : 'مكتوم') : `${volume}%`}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleTogglePreview}
                        className={use3dAdiaStyle
                            ? "px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 app-page-card border-0"
                            : "unified-3d-btn px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 border-0"
                        }
                        style={use3dAdiaStyle ? {
                            backgroundColor: isPlayingPreview ? '#ef4444' : (isBlackTheme ? '#27272a' : '#ffffff'),
                            color: isPlayingPreview ? '#ffffff' : primaryColor
                        } : {
                            backgroundColor: isPlayingPreview ? '#ef4444' : (isBlackTheme ? '#27272a' : '#ffffff'),
                            color: isPlayingPreview ? '#ffffff' : primaryColor,
                            boxShadow: isBlackTheme
                                ? '0 3px 0 #09090b, 0 5px 10px rgba(0,0,0,0.45), inset 0 1px 1px rgba(255,255,255,0.16)'
                                : '0 3px 0 rgba(0,0,0,0.12), 0 5px 10px rgba(0,0,0,0.08), inset 0 1.5px 1px rgba(255,255,255,0.95)'
                        }}
                        title={isPlayingPreview ? tPrayer('stopAlertSound', language) : tPrayer('testAlertSound', language)}
                    >
                        {isPlayingPreview ? (
                            <>
                                <Square className="w-2.5 h-2.5 fill-current shrink-0" />
                                <span>{tPrayer('stopAlertSound', language)}</span>
                            </>
                        ) : (
                            <>
                                <Play className="w-2.5 h-2.5 fill-current shrink-0" />
                                <span>{tPrayer('testAlertSound', language)}</span>
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Range Slider Track */}
            <div className={`relative flex items-center ${use3dAdiaStyle ? 'py-1.5' : 'py-1.5'}`}>
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="app-3d-range w-full h-2.5 rounded-full appearance-none cursor-pointer focus:outline-hidden touch-none"
                    style={{
                        background: `linear-gradient(${isRTL ? 'to left' : 'to right'}, ${primaryColor} 0%, ${primaryColor} ${volume}%, ${isBlackTheme ? '#33333b' : '#e2e8f0'} ${volume}%, ${isBlackTheme ? '#33333b' : '#e2e8f0'} 100%)`,
                        accentColor: primaryColor
                    }}
                    aria-label={tPrayer('alertVolumeTitle', language)}
                />
            </div>

            {/* Preset 1-tap Buttons (كتم / 35% / 70% / 100%) */}
            <div className="flex items-center justify-between overflow-visible gap-2.5 pt-1 pb-1">
                {presets.map((preset) => {
                    const isSelected = volume === preset.value;
                    return (
                        <button
                            key={preset.value}
                            type="button"
                            onClick={() => handleVolumeChange(preset.value)}
                            className={use3dAdiaStyle
                                ? `flex-1 py-1.5 px-1 rounded-xl text-xs transition-all cursor-pointer text-center app-page-card border-0 ${isSelected ? 'font-extrabold' : 'font-bold'}`
                                : `unified-3d-btn flex-1 py-1.5 px-1 rounded-xl text-xs transition-all cursor-pointer text-center border-0 ${isSelected ? 'font-extrabold' : 'font-bold'}`
                            }
                            style={use3dAdiaStyle ? {
                                backgroundColor: isSelected
                                    ? primaryColor
                                    : (isBlackTheme ? '#27272a' : '#ffffff'),
                                color: isSelected ? selectedTextColor : effectiveTextColor
                            } : {
                                backgroundColor: isSelected 
                                    ? primaryColor 
                                    : (isBlackTheme ? '#27272a' : '#ffffff'),
                                color: isSelected ? selectedTextColor : effectiveTextColor,
                                boxShadow: isSelected
                                    ? (isBlackTheme
                                        ? '0 3.5px 0 #52525b, 0 6px 12px rgba(0,0,0,0.45), inset 0 1.5px 1px rgba(255,255,255,0.45)'
                                        : '0 3.5px 0 rgba(0,0,0,0.24), 0 6px 12px rgba(0,0,0,0.14), inset 0 1.5px 1px rgba(255,255,255,0.4)')
                                    : (isBlackTheme
                                        ? '0 3.5px 0 #09090b, 0 6px 12px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.14)'
                                        : '0 3.5px 0 rgba(0,0,0,0.12), 0 5px 10px rgba(0,0,0,0.08), inset 0 1.5px 1px rgba(255,255,255,0.95)')
                            }}
                        >
                            {preset.label}
                        </button>
                    );
                })}
            </div>

            {/* Concise note if enabled */}
            {showDescription && (
                <div className="pt-1.5 border-t border-black/5 dark:border-white/5 flex items-center gap-1 text-[10px] opacity-80 leading-tight" style={{ color: effectiveSubtextColor }}>
                    <span className="truncate">
                        {tPrayer('alertVolumeDesc', language)}
                    </span>
                </div>
            )}
        </div>
    );
};

export default PrayerAlertVolumeSlider;
