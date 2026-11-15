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
    showDescription = false
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
    const effectiveCardBg = cardBg || (isBlackTheme ? '#1e1e24' : '#ffffff');
    const effectiveBorderColor = cardBorderColor || (isBlackTheme ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)');

    const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

    return (
        <div 
            dir={dir}
            className={`p-3 rounded-2xl border transition-all space-y-2 shadow-2xs ${className}`}
            style={{ 
                backgroundColor: effectiveCardBg, 
                borderColor: effectiveBorderColor 
            }}
        >
            {/* Header: Icon + Title + Value Badge + Test Button (Optional) */}
            {!hideHeader && (
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <div 
                            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors"
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
                            className="text-[10px] font-black px-1.5 py-0.2 rounded-full shrink-0"
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
                        className="px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer shrink-0 shadow-2xs"
                        style={{
                            backgroundColor: isPlayingPreview ? '#ef4444' : `${primaryColor}18`,
                            color: isPlayingPreview ? '#ffffff' : primaryColor,
                            border: `1px solid ${isPlayingPreview ? '#ef4444' : `${primaryColor}35`}`
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
            <div className="relative flex items-center py-1">
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-full h-2.5 rounded-lg appearance-none cursor-pointer focus:outline-hidden touch-none"
                    style={{
                        background: `linear-gradient(${isRTL ? 'to left' : 'to right'}, ${primaryColor} 0%, ${primaryColor} ${volume}%, ${isBlackTheme ? '#33333b' : '#e2e8f0'} ${volume}%, ${isBlackTheme ? '#33333b' : '#e2e8f0'} 100%)`,
                        accentColor: primaryColor
                    }}
                    aria-label={tPrayer('alertVolumeTitle', language)}
                />
            </div>

            {/* Preset 1-tap Buttons (كتم / 35% / 70% / 100%) */}
            <div className="flex items-center justify-between gap-1.5 pt-0.5">
                {presets.map((preset) => {
                    const isSelected = volume === preset.value;
                    return (
                        <button
                            key={preset.value}
                            type="button"
                            onClick={() => handleVolumeChange(preset.value)}
                            className={`flex-1 py-1 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                                isSelected ? 'shadow-2xs scale-102 font-extrabold' : 'opacity-70 hover:opacity-100'
                            }`}
                            style={{
                                backgroundColor: isSelected 
                                    ? primaryColor 
                                    : (isBlackTheme ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                                color: isSelected ? '#ffffff' : effectiveTextColor
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
