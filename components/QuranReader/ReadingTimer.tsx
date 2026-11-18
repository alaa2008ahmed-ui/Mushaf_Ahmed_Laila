import React, { FC } from 'react';
import { toArabic } from './constants';

interface ReadingTimerProps {
    isVisible: boolean;
    elapsedTime: number;
    currentTheme?: any;
    isEn?: boolean;
}

const ReadingTimer: FC<ReadingTimerProps> = ({ isVisible, elapsedTime, currentTheme, isEn = false }) => {
    if (!isVisible) return null;

    const minutes = Math.floor(Number(elapsedTime) / 60).toString().padStart(2, '0');
    const seconds = (Number(elapsedTime) % 60).toString().padStart(2, '0');
    const timeStr = `${minutes}:${seconds}`;
    const displayTime = isEn ? timeStr : toArabic(timeStr);

    const isGoldTheme = currentTheme?.id === 'gold';
    const isDeepBlack = currentTheme?.id === 'deep_black';

    const bg = isGoldTheme
        ? '#EAB308'
        : isDeepBlack
        ? (currentTheme?.modalBg || '#18181b')
        : (currentTheme?.modalBg || currentTheme?.bg || '#ffffff');

    const color = isGoldTheme
        ? '#000000'
        : isDeepBlack
        ? '#ffffff'
        : (currentTheme?.modalText || currentTheme?.text || '#1f2937');

    const ringAccent = isGoldTheme
        ? '#B45309'
        : isDeepBlack
        ? '#ffffff'
        : (currentTheme?.accent || currentTheme?.headerBg || '#10b981');

    const toastVars: React.CSSProperties = {
        fontFamily: currentTheme?.font,
        backgroundColor: bg,
        color,
        ...(isGoldTheme
            ? {
                  ['--toast-3d-lip' as any]: '#A16207',
                  ['--toast-3d-ring' as any]: 'rgba(180, 83, 9, 0.36)',
                  ['--toast-3d-highlight' as any]: 'rgba(255, 255, 255, 0.88)',
              }
            : isDeepBlack
            ? {
                  ['--toast-3d-lip' as any]: '#050507',
                  ['--toast-3d-ring' as any]: 'rgba(245, 158, 11, 0.34)',
                  ['--toast-3d-highlight' as any]: 'rgba(255, 255, 255, 0.24)',
              }
            : {
                  ['--toast-3d-lip' as any]: 'rgba(0, 0, 0, 0.24)',
                  ['--toast-3d-ring' as any]: `${ringAccent}38`,
                  ['--toast-3d-highlight' as any]: 'rgba(255, 255, 255, 0.92)',
              }),
    };

    return (
        <div
            dir={isEn ? 'ltr' : 'rtl'}
            className={`reading-timer app-3d-toast toast-element ${isVisible ? 'show' : ''}`}
            style={toastVars}
        >
            <span className="reading-timer-text tabular-nums">{displayTime}</span>
        </div>
    );
};

export default ReadingTimer;

