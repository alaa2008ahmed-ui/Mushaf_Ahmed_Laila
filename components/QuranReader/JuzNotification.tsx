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

    return (
        <div 
            className={`fixed z-[3000] transition-all duration-500 pointer-events-none flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border-2`}
            style={{ 
                bottom: 'calc(5rem + var(--app-safe-bottom, 0px) + 5rem)', 
                right: isVisible ? 'calc(16px + env(safe-area-inset-right, 0px))' : '-400px',
                backgroundColor: currentTheme.bg || '#ffffff',
                color: currentTheme.text || '#000000',
                borderColor: currentTheme.accent || '#10b981',
                fontFamily: currentTheme.font || 'var(--font-amiri)'
            }}
        >
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-inner" style={{ backgroundColor: currentTheme.accent || '#10b981' }}>
                <BookOpen size={20} />
            </div>
            <div className="font-bold text-lg">{text}</div>
        </div>
    );
};

export default JuzNotification;
