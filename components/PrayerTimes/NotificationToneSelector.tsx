import React, { useState, useEffect, useRef } from 'react';
import { Bell, ChevronDown, Check, X, Play, Square } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { tPrayer, getToneDisplayName } from '../../utils/prayerTimesTranslations';
import { playNotificationSound, stopNotificationSound } from '../../utils/prayerTimesUtils';
import { shortNotificationTones, DEFAULT_NOTIFICATION_TONE, NotificationToneOption } from '../../data/prayerTimesData';

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
    hidePreviewButton = false
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
                        <span className="truncate">{getToneDisplayName(selectedName, language)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 opacity-70">
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
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
                    onClick={handleCloseModal}
                    dir={dir}
                >
                    <div 
                        className="rounded-[2.5rem] w-full max-w-xs sm:max-w-sm max-h-[88dvh] flex flex-col p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
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
                                <Bell className="w-4 h-4" style={{ color: isBlackTheme ? '#FFFFFF' : primaryColor }} />
                                <h3 className="font-black text-sm sm:text-base font-kufi" style={{ color: isBlackTheme ? '#FFFFFF' : primaryColor }}>
                                    {tPrayer('selectNotificationToneModalTitle', language)}
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
                        <div className="space-y-2 overflow-y-auto flex-1 min-h-0 max-h-[62dvh] py-1 px-1 no-scrollbar">
                            {optionsList.map((option) => {
                                const isSelected = selectedId === option.id;
                                const isPlayable = option.id !== 'none' && !!option.path;
                                const isTonePlaying = playingTone === option.path;

                                return (
                                    <div
                                        key={option.id}
                                        className="w-full flex items-center gap-2"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSelectOption(option)}
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
                                            <span className="font-bold truncate">{getToneDisplayName(option.name, language)}</span>
                                            {isSelected && (
                                                <Check className={`w-4 h-4 shrink-0 ${
                                                    isDefaultTheme ? 'text-white' : (isBlackTheme ? 'text-black' : 'text-white')
                                                }`} />
                                            )}
                                        </button>

                                        {isPlayable && (
                                            <button
                                                type="button"
                                                onClick={(e) => handleTogglePreview(option.path!, e)}
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

export default NotificationToneSelector;
