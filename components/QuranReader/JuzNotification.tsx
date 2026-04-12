import React, { FC } from 'react';
import { BookOpen } from 'lucide-react';

const JuzNotification: FC<{isVisible: boolean, text: string, currentTheme: any}> = ({isVisible, text, currentTheme}) => {
    return (
        <div 
            className={`fixed z-[96] transition-all duration-500 pointer-events-none flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border-2`}
            style={{ 
                bottom: 'calc(4.5rem + env(safe-area-inset-bottom) + 70px)', 
                right: isVisible ? 'calc(16px + env(safe-area-inset-right))' : '-400px',
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
