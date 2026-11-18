import React, { useState, useEffect, useRef } from 'react';
import { Bell, ChevronDown, Check, X, Play, Square } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { tPrayer, getToneDisplayName } from '../../utils/prayerTimesTranslations';
import { playNotificationSound, stopNotificationSound } from '../../utils/prayerTimesUtils';
import { shortNotificationTones, DEFAULT_NOTIFICATION_TONE } from '../../data/prayerTimesData';

export interface NotificationToneState {
    id: string;
    name: string;
    data: string;
    fileName?: string;
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
    cardBg
}) => {
    const { language, dir } = useLanguage();
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

    const handleSelectOption = (option: { id: string; name: string; path?: string; fileName?: string }) => {
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

    const itemBorderColor = cardBorderColor || (isDefaultTheme ? '#000000' : (isBlackTheme ? '#FFFFFF' : primaryColor));
    const lipShadow = isBlackTheme ? '#09090b' : 'rgba(0,0,0,0.14)';
    const insetBevel = isBlackTheme ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.95)';
    const surfaceBg = cardBg || (isBlackTheme ? '#18181b' : '#ffffff');

    const optionsList: Array<{ id: string; name: string; path?: string; fileName?: string }> = [
        { id: 'none', name: 'بدون صوت' },
        ...shortNotificationTones,
        { 
            id: 'custom', 
            name: selectedId === 'custom' && selectedName ? `اختيار نغمة (${selectedName})` : 'اختيار نغمة',
            path: selectedId === 'custom' && selectedSource && selectedSource !== 'none' ? selectedSource : undefined
        }
    ];

    return (
        <div dir={dir} className="mt-1">
            {!hideLabel && (
                <label 
                    className="block text-[10px] font-black mb-2 uppercase tracking-widest text-center" 
                    style={{ color: isBlackTheme ? '#FFFFFF' : secondaryColor }}
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
                        color: isBlackTheme ? '#FFFFFF' : primaryColor
                    } : { 
                        backgroundColor: surfaceBg,
                        color: isBlackTheme ? '#FFFFFF' : primaryColor,
                        boxShadow: `0 4.5px 0 ${lipShadow}, 0 8px 16px -3px rgba(0,0,0,0.12), inset 0 2px 1.5px ${insetBevel}`
                    }}
                >
                    <div className="flex items-center gap-2.5 min-w-0">
                        <span className="truncate">{getToneDisplayName(selectedName, language)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 opacity-75">
                        <span className="text-[10px] font-medium hidden sm:inline" style={{ color: isBlackTheme ? '#FFFFFF' : undefined }}>
                            {tPrayer('changeTone', language)}
                        </span>
                        <ChevronDown className="w-4 h-4" style={{ color: isBlackTheme ? '#FFFFFF' : undefined }} />
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
                                ? (isBlackTheme ? '#FFFFFF' : primaryColor)
                                : surfaceBg,
                            color: playingTone === currentPlayableSource
                                ? (isBlackTheme ? '#000000' : '#ffffff')
                                : (isBlackTheme ? '#ffffff' : primaryColor)
                        } : {
                            backgroundColor: playingTone === currentPlayableSource
                                ? (isDefaultTheme ? '#000000' : (isBlackTheme ? '#FFFFFF' : primaryColor))
                                : surfaceBg,
                            color: playingTone === currentPlayableSource
                                ? (isDefaultTheme ? '#ffffff' : (isBlackTheme ? '#000000' : '#ffffff'))
                                : (isBlackTheme ? '#ffffff' : primaryColor),
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
                <p className="text-center text-[10px] mt-1 truncate" style={{ color: isBlackTheme ? '#FFFFFF' : secondaryColor }}>
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
                        className={`settings-3d-adia-scope ${isBlackTheme ? 'settings-3d-dark' : ''} rounded-[2.5rem] w-full max-w-xs sm:max-w-sm max-h-[88dvh] flex flex-col p-5 sm:p-6`}
                        style={{
                            backgroundColor: isBlackTheme ? '#121216' : 'var(--modal-bg, #ffffff)',
                            color: isBlackTheme ? '#ffffff' : 'var(--modal-text, #000000)',
                            border: 'none',
                            boxShadow: isBlackTheme
                                ? '0 8px 0 #09090b, 0 24px 50px rgba(0,0,0,0.85), inset 0 2px 2px rgba(255,255,255,0.14)'
                                : '0 8px 0 rgba(0,0,0,0.14), 0 24px 48px rgba(0,0,0,0.28), inset 0 2px 2px rgba(255,255,255,0.96)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div 
                            className="flex justify-between items-center mb-4 pb-2.5 border-b shrink-0"
                            style={{ borderColor: isBlackTheme ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.1)' }}
                        >
                            <div className="flex items-center gap-2.5">
                                <span
                                    className="app-3d-badge w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: isBlackTheme ? '#27272a' : '#f8fafc' }}
                                >
                                    <Bell className="w-4 h-4" style={{ color: isBlackTheme ? '#FFFFFF' : primaryColor }} />
                                </span>
                                <h3 className="font-black text-sm sm:text-base font-kufi" style={{ color: isBlackTheme ? '#FFFFFF' : primaryColor }}>
                                    {tPrayer('selectNotificationToneModalTitle', language)}
                                </h3>
                            </div>
                            <button 
                                type="button"
                                onClick={handleCloseModal} 
                                className="app-page-card border-0 w-8 h-8 rounded-full flex items-center justify-center hover:text-red-500 transition-colors cursor-pointer shrink-0"
                                style={{
                                    backgroundColor: isBlackTheme ? '#27272a' : '#ffffff',
                                    color: isBlackTheme ? '#FFFFFF' : secondaryColor
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
                                            className="flex-1 py-2.5 px-4 rounded-2xl text-center font-bold text-xs sm:text-sm transition-all flex items-center justify-between relative cursor-pointer app-page-card border-0"
                                            style={{
                                                backgroundColor: isSelected
                                                    ? (isBlackTheme ? '#FFFFFF' : primaryColor)
                                                    : surfaceBg,
                                                color: isSelected
                                                    ? (isBlackTheme ? '#000000' : '#ffffff')
                                                    : (isBlackTheme ? '#ffffff' : '#0f172a')
                                            }}
                                        >
                                            <span className="font-bold truncate">{getToneDisplayName(option.name, language)}</span>
                                            {isSelected && (
                                                <Check className={`w-4 h-4 shrink-0 ${
                                                    isBlackTheme ? 'text-black' : 'text-white'
                                                }`} />
                                            )}
                                        </button>

                                        {isPlayable && (
                                            <button
                                                type="button"
                                                onClick={(e) => handleTogglePreview(option.path!, e)}
                                                className="p-2.5 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer transition-all app-page-card border-0"
                                                style={{
                                                    backgroundColor: isTonePlaying
                                                        ? (isBlackTheme ? '#FFFFFF' : primaryColor)
                                                        : surfaceBg,
                                                    color: isTonePlaying
                                                        ? (isBlackTheme ? '#000000' : '#ffffff')
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

export default NotificationToneSelector;
