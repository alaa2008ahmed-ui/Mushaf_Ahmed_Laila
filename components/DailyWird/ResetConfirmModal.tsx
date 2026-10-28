import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
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

    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود' || themeKey === 'deep_black';
    const isBlackAndWhite = themeKey === 'deep_black' || theme.name === 'أبيض وأسود';
    const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.accent || (isBlackAndWhite ? '#FFFFFF' : (theme.palette?.[0] || '#2E7D5E')));
    const btnTextColor = isBlackTheme ? '#000000' : '#FFFFFF';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" dir={isEn ? 'ltr' : 'rtl'}>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm rounded-[28px] p-6 shadow-2xl bg-white dark:bg-zinc-900 border-0 overflow-hidden"
                        style={{ 
                            fontFamily: theme.font,
                            color: 'var(--text-color)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center relative z-10">
                            <div 
                                className="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm"
                                style={{
                                    backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: isBlackTheme ? '#FFFFFF' : '#EF4444'
                                }}
                            >
                                <RotateCcw size={32} className="animate-spin-slow" />
                            </div>

                            <h3 className="text-xl font-bold mb-2">
                                {isEn ? 'Reset Khatma Plan' : 'إعادة تعيين الختمة'}
                            </h3>
                            
                            <div className="flex items-center gap-1.5 mb-3 px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0">
                                <AlertTriangle size={14} />
                                <span>{isEn ? 'Irreversible Action' : 'إجراء لا يمكن التراجع عنه'}</span>
                            </div>

                            <p className="mb-6 leading-relaxed text-xs opacity-70">
                                {isEn 
                                    ? 'Are you sure you want to reset the current khatma? All your progress will be cleared and you will start over.' 
                                    : 'هل أنت متأكد من رغبتك في إعادة تعيين الختمة الحالية؟ سيتم مسح جميع التقدم الذي أحرزته والبدء من جديد.'}
                            </p>

                            <div className="flex w-full gap-3">
                                <button 
                                    type="button"
                                    onClick={onConfirm} 
                                    className="flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 border-0 cursor-pointer"
                                    style={{
                                        backgroundColor: primaryColor,
                                        color: btnTextColor
                                    }}
                                >
                                    <RotateCcw size={16} />
                                    <span>{isEn ? 'Confirm' : 'تأكيد'}</span>
                                </button>
                                <button 
                                    type="button"
                                    onClick={onClose} 
                                    className="flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 border-0 cursor-pointer"
                                    style={{ color: 'var(--text-color)' }}
                                >
                                    <X size={16} />
                                    <span>{isEn ? 'Cancel' : 'إلغاء'}</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ResetConfirmModal;
