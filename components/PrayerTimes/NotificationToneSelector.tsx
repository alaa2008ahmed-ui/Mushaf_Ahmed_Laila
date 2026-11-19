import React, { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Bell, ChevronDown, Check, X, Play, Square } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { tPrayer, getToneDisplayName } from '../../utils/prayerTimesTranslations';
import { playNotificationSound, stopNotificationSound } from '../../utils/prayerTimesUtils';
import { pickNativePhoneNotificationTone } from '../../utils/silentMode';
import { shortNotificationTones, DEFAULT_NOTIFICATION_TONE } from '../../data/prayerTimesData';

export interface NotificationToneState {
    id: string;
    name: string;
    data: string;
    fileName?: string;
    channelId?: string;
}

interface NotificationToneSelectorProps {
    currentTone?: NotificationToneState;
    onToneChange: (tone: NotificationToneState) => void;
    secondaryColor: string;
    primaryColor: string;
    cardBorderColor?: string;
    isDefaultTheme?: boolean;
    isBlackTheme?: boolean;
    hideLabel?: boolean;
    hidePreviewButton?: boolean;
    use3dAdiaStyle?: boolean;
    cardBg?: string;
    modalBg?: string;
}

const NotificationToneSelector: React.FC<NotificationToneSelectorProps> = ({
    currentTone = DEFAULT_NOTIFICATION_TONE,
    onToneChange,
    secondaryColor,
    primaryColor,
    cardBorderColor,
    isDefaultTheme,
    isBlackTheme,
    hideLabel = false,
    hidePreviewButton = false,
    use3dAdiaStyle = false,
    cardBg,
    modalBg: propModalBg
}) => {
    const { language, dir } = useLanguage();
    const { theme, themeKey, homeThemeVariant, isNightMode } = useTheme();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [playingTone, setPlayingTone] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        return () => {
            stopNotificationSound();
        };
    }, []);

    // Resolve active selection info
    let selectedId = currentTone?.id || 'chime';
    let selectedName = currentTone?.name || 'رنين هادئ';
    let selectedSource = currentTone?.data || '/assets/audio/chime.mp3';

    if (currentTone?.data === 'none' || currentTone?.id === 'none') {
        selectedId = 'none';
        selectedName = 'بدون صوت';
        selectedSource = 'none';
    } else if (currentTone?.id === 'phone_ringtone' || (currentTone?.data && currentTone.data.startsWith('content://'))) {
        selectedId = 'phone_ringtone';
        selectedName = currentTone.name || (language === 'en' ? 'Phone Tone' : 'نغمة من الهاتف');
        selectedSource = currentTone.data;
    } else if (currentTone?.id === 'custom' || (currentTone?.data && currentTone.data.startsWith('data:'))) {
        selectedId = 'custom';
        selectedName = currentTone.name || 'نغمة مخصصة';
        selectedSource = currentTone.data;
    } else {
        const found = shortNotificationTones.find(t => 
            t.id === currentTone?.id || 
            t.path === currentTone?.data || 
            t.fileName === currentTone?.fileName ||
            t.name === currentTone?.name
        );
        if (found) {
            selectedId = found.id;
            selectedName = found.name;
            selectedSource = found.path;
        }
    }

    const currentPlayableSource = selectedSource !== 'none' ? selectedSource : null;

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

    const handleSelectOption = async (option: { id: string; name: string; path?: string; fileName?: string }) => {
        if (option.id === 'phone_ringtone') {
            stopNotificationSound();
            setPlayingTone(null);
            if (Capacitor.getPlatform() === 'android') {
                const picked = await pickNativePhoneNotificationTone(
                    selectedId === 'phone_ringtone' ? selectedSource : undefined,
                    language === 'en' ? 'Phone Tones' : 'نغمات الهاتف'
                );
                if (picked.cancelled) {
                    return;
                }
                if (picked.silent || !picked.uri) {
                    onToneChange({
                        id: 'none',
                        name: 'بدون صوت',
                        data: 'none',
                        fileName: ''
                    });
                    setIsModalOpen(false);
                    return;
                }
                const toneName = picked.name || (language === 'en' ? 'Phone Tone' : 'نغمة من الهاتف');
                onToneChange({
                    id: 'phone_ringtone',
                    name: toneName,
                    data: picked.uri,
                    fileName: toneName,
                    channelId: picked.channelId
                });
                playNotificationSound(picked.uri, true);
                setIsModalOpen(false);
                return;
            }
            fileInputRef.current?.click();
            return;
        }

        if (option.id === 'custom') {
            stopNotificationSound();
            setPlayingTone(null);
            fileInputRef.current?.click();
            return;
        }

        stopNotificationSound();
        setPlayingTone(null);

        if (option.id === 'none') {
            onToneChange({
                id: 'none',
                name: 'بدون صوت',
                data: 'none',
                fileName: ''
            });
        } else {
            const path = option.path || '/assets/audio/chime.mp3';
            onToneChange({
                id: option.id,
                name: option.name,
                data: path,
                fileName: option.fileName || 'chime.mp3'
            });
            playNotificationSound(path, true);
        }
        setIsModalOpen(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            if (dataUrl) {
                stopNotificationSound();
                setPlayingTone(null);
                const customTone: NotificationToneState = {
                    id: 'custom',
                    name: file.name,
                    data: dataUrl,
                    fileName: file.name
                };
                onToneChange(customTone);
                playNotificationSound(dataUrl, true);
                setIsModalOpen(false);
            }
        };
        reader.readAsDataURL(file);
        // Reset file input value so re-selecting the same file fires onChange
        e.target.value = '';
    };

    const handleCloseModal = () => {
        stopNotificationSound();
        setPlayingTone(null);
        setIsModalOpen(false);
    };

    const effectiveBlack = Boolean(
        isBlackTheme ||
        isNightMode ||
        theme?.isDark ||
        themeKey === 'deep_black' ||
        theme?.bgColor === '#000000'
    );
    const fallbackAccent = themeKey === 'sky_mode' || homeThemeVariant === 'sky'
        ? '#0284c7'
        : (themeKey === 'emerald_mode' || homeThemeVariant === 'emerald'
            ? '#059669'
            : (themeKey === 'burgundy_mode' || homeThemeVariant === 'burgundy'
                ? '#be123c'
                : '#ca8a04'));
    const resolvedAccent = effectiveBlack ? '#FFFFFF' : (primaryColor || fallbackAccent);
    const defaultModalBg = effectiveBlack
        ? '#121214'
        : (theme?.bgColor && theme.bgColor.toLowerCase() !== '#ffffff'
            ? theme.bgColor
            : (themeKey === 'sky_mode' || homeThemeVariant === 'sky'
                ? '#F0F9FF'
                : (themeKey === 'emerald_mode' || homeThemeVariant === 'emerald'
                    ? '#F0FDF4'
                    : (themeKey === 'burgundy_mode' || homeThemeVariant === 'burgundy'
                        ? '#FFF1F2'
                        : '#FEF9C3'))));
    const modalSurfaceBg = propModalBg || defaultModalBg;
    const modalShadow = effectiveBlack
        ? '0 8px 0 #050507, 0 24px 50px rgba(0, 0, 0, 0.85), inset 0 2px 2px rgba(255, 255, 255, 0.14)'
        : '0 8px 0 rgba(0, 0, 0, 0.16), 0 24px 48px rgba(0, 0, 0, 0.30), inset 0 2px 2px rgba(255, 255, 255, 0.92)';
    const lipShadow = effectiveBlack ? '#09090b' : 'rgba(0,0,0,0.14)';
    const insetBevel = effectiveBlack ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.95)';
    const surfaceBg = cardBg || (effectiveBlack ? '#18181b' : '#ffffff');
    const badgeBg = effectiveBlack ? '#27272a' : '#ffffff';
    const closeTextColor = effectiveBlack ? '#e4e4e7' : '#475569';
    const activeAccentBg = effectiveBlack ? '#FFFFFF' : resolvedAccent;
    const activeAccentText = effectiveBlack ? '#000000' : '#ffffff';

    const phoneToneLabel = language === 'en' ? 'Phone Tones' : 'نغمات الهاتف';
    const selectToneLabel = language === 'en' ? 'Select tone' : 'اختيار نغمة';

    const optionsList: Array<{ id: string; name: string; path?: string; fileName?: string }> = [
        { id: 'none', name: 'بدون صوت' },
        ...shortNotificationTones,
        {
            id: 'phone_ringtone',
            name: selectedId === 'phone_ringtone' && selectedName ? `${phoneToneLabel} (${selectedName})` : phoneToneLabel,
            path: selectedId === 'phone_ringtone' && selectedSource && selectedSource !== 'none' ? selectedSource : undefined
        },
        { 
            id: 'custom', 
            name: selectedId === 'custom' && selectedName ? `${selectToneLabel} (${selectedName})` : selectToneLabel,
            path: selectedId === 'custom' && selectedSource && selectedSource !== 'none' ? selectedSource : undefined
        }
    ];

    return (
        <div dir={dir} className="mt-1">
            {!hideLabel && (
                <label 
                    className="block text-[10px] font-black mb-2 uppercase tracking-widest text-center" 
                    style={{ color: effectiveBlack ? '#FFFFFF' : secondaryColor }}
                >
                    {tPrayer('notificationToneLabel', language)}
                </label>
            )}
            
            {/* Notification Tone Row: Modal Trigger Button + Live Audition/Preview Button */}
            <div className="flex items-center gap-2.5 overflow-visible">
                <button
                    type="button"
                    onClick={() => {
                        stopNotificationSound();
                        setPlayingTone(null);
                        setIsModalOpen(true);
                    }}
                    className={use3dAdiaStyle
                        ? "flex-1 flex items-center justify-between p-3.5 rounded-2xl transition-all cursor-pointer font-bold text-xs sm:text-sm app-page-card border-0"
                        : "unified-3d-btn flex-1 flex items-center justify-between p-3.5 rounded-2xl transition-all cursor-pointer font-bold text-xs sm:text-sm border-0"
                    }
                    style={use3dAdiaStyle ? {
                        backgroundColor: surfaceBg,
                        color: resolvedAccent
                    } : { 
                        backgroundColor: surfaceBg,
                        color: resolvedAccent,
                        boxShadow: `0 4.5px 0 ${lipShadow}, 0 8px 16px -3px rgba(0,0,0,0.12), inset 0 2px 1.5px ${insetBevel}`
                    }}
                >
                    <div className="flex items-center gap-2.5 min-w-0">
                        <span className="truncate">{getToneDisplayName(selectedName, language)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 opacity-75">
                        <span className="text-[10px] font-medium hidden sm:inline" style={{ color: effectiveBlack ? '#FFFFFF' : undefined }}>
                            {tPrayer('changeTone', language)}
                        </span>
                        <ChevronDown className="w-4 h-4" style={{ color: effectiveBlack ? '#FFFFFF' : undefined }} />
                    </div>
                </button>

                {/* Live Preview Button for Selected Tone */}
                {!hidePreviewButton && currentPlayableSource && (
                    <button
                        type="button"
                        onClick={(e) => handleTogglePreview(currentPlayableSource, e)}
                        className={use3dAdiaStyle
                            ? "p-3.5 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer transition-all app-page-card border-0"
                            : "unified-3d-btn p-3.5 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer transition-all border-0"
                        }
                        style={use3dAdiaStyle ? {
                            backgroundColor: playingTone === currentPlayableSource
                                ? activeAccentBg
                                : surfaceBg,
                            color: playingTone === currentPlayableSource
                                ? activeAccentText
                                : resolvedAccent
                        } : {
                            backgroundColor: playingTone === currentPlayableSource
                                ? (isDefaultTheme ? '#000000' : activeAccentBg)
                                : surfaceBg,
                            color: playingTone === currentPlayableSource
                                ? (isDefaultTheme ? '#ffffff' : activeAccentText)
                                : resolvedAccent,
                            boxShadow: `0 4.5px 0 ${lipShadow}, 0 8px 16px -3px rgba(0,0,0,0.12), inset 0 2px 1.5px ${insetBevel}`
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
                ref={fileInputRef}
                type="file" 
                id="notification-sound-file-input" 
                accept="audio/*" 
                className="sr-only absolute w-0 h-0 opacity-0 overflow-hidden pointer-events-none" 
                onChange={handleFileUpload}
            />

            {selectedId === 'custom' && (
                <p className="text-center text-[10px] mt-1 truncate" style={{ color: effectiveBlack ? '#a1a1aa' : secondaryColor }}>
                    {tPrayer('currentToneFile', language)} {selectedName}
                </p>
            )}

            {/* Dedicated Notification Tone Selection Modal */}
            {isModalOpen && (
                <div 
                    className="fixed inset-0 bg-black/65 z-[70] flex items-center justify-center p-4"
                    onClick={handleCloseModal}
                    dir={dir}
                >
                    <div 
                        className={`settings-3d-adia-scope ${effectiveBlack ? 'settings-3d-dark' : ''} rounded-[2.5rem] w-full max-w-xs sm:max-w-sm max-h-[88dvh] flex flex-col p-5 sm:p-6 border-0`}
                        style={{
                            backgroundColor: modalSurfaceBg,
                            color: effectiveBlack ? '#ffffff' : '#0f172a',
                            boxShadow: modalShadow
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div 
                            className="flex justify-between items-center mb-4 pb-2.5 border-b shrink-0"
                            style={{ borderColor: effectiveBlack ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)' }}
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span
                                    className="app-3d-badge w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                                    style={{
                                        backgroundColor: badgeBg,
                                        boxShadow: effectiveBlack
                                            ? '0 2.5px 0 #09090b, inset 0 1px 1px rgba(255,255,255,0.14)'
                                            : '0 2.5px 0 rgba(0,0,0,0.12), inset 0 1.5px 1px rgba(255,255,255,0.95)'
                                    }}
                                >
                                    <Bell className="w-4 h-4" style={{ color: resolvedAccent }} />
                                </span>
                                <h3 className="font-black text-sm sm:text-base font-cairo truncate" style={{ color: resolvedAccent }}>
                                    {tPrayer('selectNotificationToneModalTitle', language)}
                                </h3>
                            </div>
                            <button 
                                type="button"
                                onClick={handleCloseModal} 
                                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center hover:text-red-500 transition-colors cursor-pointer shrink-0"
                                style={{
                                    backgroundColor: badgeBg,
                                    color: closeTextColor
                                }}
                                title={tPrayer('close', language)}
                                aria-label={tPrayer('close', language)}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Tone List as 3D Framed Items with Direct Audition */}
                        <div className="space-y-3 py-2 px-1.5 overflow-y-auto flex-1 min-h-0 max-h-[62dvh] no-scrollbar">
                            {optionsList.map((option) => {
                                const isSelected = selectedId === option.id;
                                const isPlayable = option.id !== 'none' && !!option.path;
                                const isTonePlaying = playingTone === option.path;

                                return (
                                    <div
                                        key={option.id}
                                        className="w-full flex items-center gap-2.5 overflow-visible"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSelectOption(option)}
                                            className={`flex-1 py-2.5 px-4 rounded-2xl text-center font-bold text-xs sm:text-sm transition-all flex items-center justify-between relative cursor-pointer app-page-card border-0 ${
                                                isSelected ? 'quran-raised-btn-selected' : ''
                                            }`}
                                            style={isSelected ? {
                                                backgroundColor: activeAccentBg,
                                                backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(0,0,0,0.08) 100%)',
                                                color: activeAccentText
                                            } : {
                                                backgroundColor: surfaceBg,
                                                color: effectiveBlack ? '#ffffff' : '#0f172a'
                                            }}
                                        >
                                            <span className="font-bold truncate">{getToneDisplayName(option.name, language)}</span>
                                            {isSelected && (
                                                <Check className={`w-4 h-4 shrink-0 ${
                                                    effectiveBlack ? 'text-black' : 'text-white'
                                                }`} />
                                            )}
                                        </button>

                                        {isPlayable && (
                                            <button
                                                type="button"
                                                onClick={(e) => handleTogglePreview(option.path!, e)}
                                                className={`p-2.5 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer transition-all app-page-card border-0 ${
                                                    isTonePlaying ? 'quran-raised-btn-selected' : ''
                                                }`}
                                                style={isTonePlaying ? {
                                                    backgroundColor: activeAccentBg,
                                                    backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(0,0,0,0.08) 100%)',
                                                    color: activeAccentText
                                                } : {
                                                    backgroundColor: surfaceBg,
                                                    color: resolvedAccent
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

export default NotificationToneSelector;
