import React, { useState, useEffect } from 'react';
import { NAWAWI_DATA } from '../data/nawawiData';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import { registerBackInterceptor } from '../hooks/useBackButton';

const HadithModal = ({ hadith, onClose }) => {
    const { theme, themeKey } = useTheme();
    const [fontSize, setFontSize] = useState(18);
    const isBlackAndWhite = themeKey === 'black_and_white';
    const primaryColor = isBlackAndWhite ? '#FFFFFF' : theme.palette[0];

    const increaseFontSize = () => {
        setFontSize(prev => (prev >= 32 ? 18 : prev + 4));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col" style={{ backgroundColor: 'var(--modal-bg)', color: 'var(--modal-text)' }} onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--card-border)' }}>
                    <div className="w-10"></div> {/* Spacer for centering */}
                    <h3 className="text-xl font-bold font-kufi text-center flex-1" style={{ color: 'var(--modal-text)' }}>{hadith.title}</h3>
                    <button 
                        onClick={increaseFontSize}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition"
                        style={{ backgroundColor: 'var(--card-bg-hover)', color: 'var(--modal-text)' }}
                        title="تكبير النص"
                    >
                        <i className="fas fa-search-plus text-lg"></i>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto leading-loose text-right font-amiri" style={{ fontSize: `${fontSize}px`, color: 'var(--modal-text)' }}>
                    <p>{hadith.hadith}</p>
                </div>
                <div className="p-3 border-t" style={{ borderColor: 'var(--card-border)' }}>
                    <button onClick={onClose} className="w-full py-2.5 rounded-lg font-bold transition hover:opacity-90" style={{ backgroundColor: 'var(--card-bg-hover)', color: 'var(--modal-text)' }}>
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

const Nawawi = ({ onBack }) => {
    const { theme, themeKey } = useTheme();
    const [selectedHadith, setSelectedHadith] = useState(null);
    const isBlackAndWhite = themeKey === 'black_and_white';
    const primaryColor = isBlackAndWhite ? '#FFFFFF' : theme.palette[0];

    useEffect(() => {
        const interceptor = () => {
            if (selectedHadith) {
                setSelectedHadith(null);
                return true;
            }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [selectedHadith]);

    return (
        <div className="h-screen flex flex-col font-cairo overflow-hidden" style={{ backgroundColor: 'transparent', color: theme.textColor }}>
            <header className="app-top-bar">
                <div className="app-top-bar__inner">
                    <h1 className="app-top-bar__title text-2xl font-kufi">الأربعون النووية</h1>
                    <p className="app-top-bar__subtitle">متن الأربعين حديثًا في مباني الإسلام وقواعد الأحكام</p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 pb-24 space-y-3">
                {NAWAWI_DATA.map(hadith => (
                    <div key={hadith.id} onClick={() => setSelectedHadith(hadith)} className="themed-card p-4 rounded-xl shadow-md cursor-pointer transition-all hover:bg-card-bg-hover active:scale-95">
                        <p className="font-bold text-base" style={{ color: primaryColor }}>{hadith.title}</p>
                    </div>
                ))}
            </main>

            {selectedHadith && <HadithModal hadith={selectedHadith} onClose={() => setSelectedHadith(null)} />}

            <BottomBar onHomeClick={onBack} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
};

export default Nawawi;
