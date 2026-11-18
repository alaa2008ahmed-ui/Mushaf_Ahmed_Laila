import React, { FC, useEffect, useRef } from 'react';
import { BookOpen } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Haptics } from '@capacitor/haptics';

const triggerJuzStartVibration = () => {
    const fallbackWebVibrate = () => {
        if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
            try {
                navigator.vibrate(200);
            } catch {
                // Ignore vibration errors in unsupported environments
            }
        }
    };

    if (Capacitor.isNativePlatform()) {
        Haptics.vibrate({ duration: 250 }).catch(fallbackWebVibrate);
    } else {
        fallbackWebVibrate();
    }
};

const JuzNotification: FC<{isVisible: boolean, text: string, currentTheme: any}> = ({isVisible, text, currentTheme}) => {
    const lastVibratedTextRef = useRef<string>('');

    useEffect(() => {
        if (!isVisible) {
            lastVibratedTextRef.current = '';
            return;
        }

        const isJuzStart = text.includes('بداية الجزء') || text.includes('Start of Juz');
        if (isJuzStart && lastVibratedTextRef.current !== text) {
            lastVibratedTextRef.current = text;
            triggerJuzStartVibration();
        }
    }, [isVisible, text]);

    const isGoldTheme = currentTheme?.id === 'gold';
    const isDeepBlack = currentTheme?.id === 'deep_black';
    const bg = currentTheme?.modalBg || currentTheme?.bg || '#ffffff';
    const textColor = currentTheme?.modalText || currentTheme?.text || '#000000';
    const iconBg = isGoldTheme ? '#B45309' : isDeepBlack ? '#ffffff' : (currentTheme?.accent || '#10b981');
    const iconColor = isDeepBlack ? '#000000' : (currentTheme?.accentText || '#ffffff');

    return (
        <div 
            className={`app-3d-toast fixed z-[3000] transition-all duration-500 pointer-events-none flex items-center gap-3 px-4 py-2.5 rounded-2xl border-0`}
            style={{ 
                bottom: 'calc(5rem + var(--app-safe-bottom, 0px) + 5rem)', 
                right: isVisible ? 'calc(16px + env(safe-area-inset-right, 0px))' : '-400px',
                backgroundColor: bg,
                color: textColor,
                fontFamily: currentTheme.font || 'var(--font-amiri)'
            }}
        >
            <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{
                    backgroundColor: iconBg,
                    color: iconColor,
                    boxShadow: '0 3px 0 rgba(0, 0, 0, 0.24), 0 4px 8px rgba(0, 0, 0, 0.16), inset 0 1.5px 1px rgba(255, 255, 255, 0.48), inset 0 -1.5px 2px rgba(0, 0, 0, 0.18)'
                }}
            >
                <BookOpen size={20} />
            </div>
            <div className="font-bold text-lg">{text}</div>
        </div>
    );
};

export default JuzNotification;
