
import React from 'react';
import { useTheme } from '../context/ThemeContext';

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
    const { theme, themeKey } = useTheme();

    const isSingleButton = !showHome || !showThemes;
    const homeButtonClass = `bar-button btn-3d-effect ${isSingleButton ? 'w-full max-w-[160px] mx-auto py-2.5 px-4 rounded-xl shadow-lg' : 'max-w-[120px]'}`;
    const themesButtonClass = `bar-button btn-3d-effect ${isSingleButton ? 'w-full max-w-[160px] mx-auto py-2.5 px-4 rounded-xl shadow-lg' : 'max-w-[120px]'}`;

    return (
        <nav className="app-bottom-bar" style={{ border: theme.barBorder || `2px solid ${theme.palette[0]}` }}>
            <div className="app-bottom-bar__inner">
                {showHome && (
                    <button 
                        onClick={onHomeClick} 
                        className={homeButtonClass}
                        style={{ background: themeKey === 'olive_grove' ? '#4D7C0F' : theme.palette[0], color: 'white', fontFamily: theme.font, border: theme.btnBorder || 'none' }}
                    >
                        <span className="text-xl">🏠</span>
                        <span className="hidden sm:inline">{homeLabel}</span>
                    </button>
                )}
                
                {leftButton && <div className="mx-1">{leftButton}</div>}
                
                {showThemes && (
                    <button 
                        id="themes-btn"
                        onClick={onThemesClick} 
                        className={themesButtonClass}
                        style={{ 
                            background: themeKey === 'olive_grove' ? '#65A30D' : theme.palette[1], 
                            color: 'white', 
                            fontFamily: theme.font, 
                            border: theme.btnBorder || 'none' 
                        }}
                        data-id="theme-toggle-button"
                    >
                         <span className="text-xl">🎨</span>
                        <span>الثيمات</span>
                    </button>
                )}
                
                {rightButton && <div className="mx-1">{rightButton}</div>}
            </div>
        </nav>
    );
}

export default BottomBar;