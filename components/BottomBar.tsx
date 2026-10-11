
import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Lock, Unlock } from 'lucide-react';

interface BottomBarProps {
    onHomeClick: () => void;
    onThemesClick: () => void;
    showHome?: boolean;
    showThemes?: boolean;
    homeLabel?: string;
    leftButton?: React.ReactNode;
    rightButton?: React.ReactNode;
}

function BottomBar({ onHomeClick, onThemesClick, showHome = true, showThemes = true, homeLabel = "الرئيسية", leftButton, rightButton }: BottomBarProps) {
    const { theme, themeKey, isPageLocked, togglePageLock, isQuranPage, currentPage } = useTheme();

    const isSingleButton = !showHome || !showThemes;
    const homeButtonClass = `bar-button btn-3d-effect ${isSingleButton ? 'w-full max-w-[160px] mx-auto py-2.5 px-4 rounded-xl shadow-lg' : 'max-w-[120px]'}`;
    const themesButtonClass = `bar-button btn-3d-effect ${isSingleButton ? 'w-full max-w-[160px] mx-auto py-2.5 px-4 rounded-xl shadow-lg' : 'max-w-[120px]'}`;

    // Fix for border style conflict - parse the border string if it exists
    const parseBorder = (borderStr: string | undefined) => {
        if (!borderStr || borderStr === 'none') return { borderWidth: 0, borderStyle: 'none' as const, borderColor: 'transparent' };
        const parts = borderStr.split(' ');
        return {
            borderWidth: parts[0] || '1px',
            borderStyle: (parts[1] || 'solid') as any,
            borderColor: parts[2] || theme.palette[0]
        };
    };

    const navBorder = parseBorder(theme.barBorder);
    const homeBtnBorder = parseBorder(theme.btnBorder);
    const themesBtnBorder = parseBorder(theme.btnBorder);

    const isMainOrMoreMenu = currentPage === 'home' || currentPage === 'more-menu';
    const isDefaultMoreMenu = themeKey === 'default' && currentPage === 'more-menu';
    const isDefaultNonQuran = themeKey === 'default' && !isQuranPage && !isMainOrMoreMenu;

    const isBlackTheme = theme.bgColor === '#000000';

    const getBtnStyle = (colorIdx: number) => {
        if (isBlackTheme) {
            return {
                background: '#000000',
                color: '#FFFFFF',
                fontFamily: theme.font,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: '#FFFFFF'
            };
        }

        // In default theme: both Home button and Themes button are white with black text and 2px black border
        if (themeKey === 'default') {
            return {
                background: '#FFFFFF',
                color: '#000000',
                fontFamily: theme.font,
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: '#000000'
            };
        }
        
        const baseBg = themeKey === 'olive_grove' ? (colorIdx === 0 ? '#4D7C0F' : '#65A30D') : (theme.palette[colorIdx] || theme.palette[0]);
        const border = colorIdx === 0 ? homeBtnBorder : themesBtnBorder;
        
        return {
            background: baseBg,
            color: theme.btnText || 'white',
            fontFamily: theme.font,
            borderWidth: border.borderWidth,
            borderStyle: border.borderStyle,
            borderColor: border.borderColor
        };
    };

    return (
        <nav className="app-bottom-bar" style={{ 
            borderTopWidth: theme.barBorder ? navBorder.borderWidth : '2px',
            borderTopStyle: theme.barBorder ? navBorder.borderStyle : 'solid',
            borderTopColor: theme.barBorder ? navBorder.borderColor : theme.palette[0],
            fontFamily: theme.font 
        }}>
            <div className="app-bottom-bar__inner">
                {leftButton && <div className="flex-1 flex justify-center">{leftButton}</div>}

                {/* Home Section */}
                {showHome && (
                    <button 
                        onClick={onHomeClick} 
                        className={homeButtonClass}
                        style={getBtnStyle(0)}
                    >
                        <span className="text-xl">🏠</span>
                        <span>{homeLabel}</span>
                    </button>
                )}
                
                {showThemes && (
                    <button 
                        id="themes-btn"
                        onClick={onThemesClick} 
                        className={themesButtonClass}
                        style={getBtnStyle(1)}
                        data-id="theme-toggle-button"
                    >
                         <span className="text-xl">🎨</span>
                        <span>الثيمات</span>
                    </button>
                )}
                
                {rightButton && <div className="flex-1 flex justify-center">{rightButton}</div>}
            </div>
        </nav>
    );
}

export default BottomBar;