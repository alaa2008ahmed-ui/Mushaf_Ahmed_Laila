import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { RotateCcw, X, AlertTriangle } from 'lucide-react';

interface ResetConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const { theme, themeKey } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';

    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود' || theme.name === 'اسود' || theme.name === 'black' || themeKey === 'deep_black';
    const isBlackAndWhite = themeKey === 'deep_black' || theme.name === 'أبيض وأسود';
    const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.accent || (isBlackAndWhite ? '#FFFFFF' : (theme.palette?.[0] || '#2E7D5E')));
    const btnTextColor = isBlackTheme ? '#000000' : '#FFFFFF';

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" dir={isEn ? 'ltr' : 'rtl'}>
            {/* Backdrop */}
            <div 
                onClick={onClose}
                className="absolute inset-0 bg-black/65"
            />

            {/* Modal Content */}
            <div 
                className={`app-page-card border-0 relative w-full max-w-sm rounded-[28px] p-6 overflow-hidden ${
                    isBlackTheme ? 'bg-[#18181b] text-white' : 'bg-white dark:bg-[#1E293B] text-slate-800 dark:text-white'
                }`}
                        style={{ fontFamily: theme.font }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center relative z-10">
                            <div 
                                className={`app-3d-badge border-0 w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                                    isBlackTheme ? 'bg-white/10' : 'bg-red-50 dark:bg-red-950/40'
                                }`}
                                style={{
                                    color: isBlackTheme ? '#FFFFFF' : '#EF4444'
                                }}
                            >
                                <RotateCcw size={32} className="animate-spin-slow" />
                            </div>

                            <h3 className="text-xl font-black mb-2">
                                {isEn ? 'Reset Khatma Plan' : 'إعادة تعيين الختمة'}
                            </h3>
                            
                            <div className="app-inner-3d-box border-0 flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                                <AlertTriangle size={14} />
                                <span>{isEn ? 'Irreversible Action' : 'إجراء لا يمكن التراجع عنه'}</span>
                            </div>

                            <p className="mb-6 leading-relaxed text-xs opacity-70">
                                {isEn 
                                    ? 'Are you sure you want to reset the current khatma? All your progress will be cleared and you will start over.' 
                                    : 'هل أنت متأكد من رغبتك في إعادة تعيين الختمة الحالية؟ سيتم مسح جميع التقدم الذي أحرزته والبدء من جديد.'}
                            </p>

                            <div className="flex w-full gap-3 overflow-visible pb-1">
                                <button 
                                    type="button"
                                    onClick={onConfirm} 
                                    className="app-page-card border-0 flex-1 py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    style={{ backgroundColor: primaryColor, color: btnTextColor }}
                                >
                                    <RotateCcw size={16} />
                                    <span>{isEn ? 'Confirm' : 'تأكيد'}</span>
                                </button>
                                <button 
                                    type="button"
                                    onClick={onClose} 
                                    className={`app-page-card border-0 flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                        isBlackTheme ? 'bg-[#18181b] text-white' : 'bg-white dark:bg-[#1E293B] text-slate-800 dark:text-white'
                                    }`}
                                >
                                    <X size={16} />
                                    <span>{isEn ? 'Cancel' : 'إلغاء'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
    );
};

export default ResetConfirmModal;
