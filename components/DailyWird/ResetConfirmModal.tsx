
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, X, AlertTriangle } from 'lucide-react';

interface ResetConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const { theme, themeKey } = useTheme();
    const isDefaultTheme = themeKey === 'default';

    const isGlass = theme.isGlass;
    const isGolden = theme.name.includes('ذهب') || theme.name.includes('Golden');
    const isEmerald = theme.name.includes('زمرد') || theme.name.includes('Emerald');

    const modalBg = isDefaultTheme 
        ? '#FFFFFF'
        : (theme.isGlass 
            ? (isGolden ? '#451a03' : isEmerald ? '#064E3B' : '#1e293b')
            : 'var(--modal-bg)');
    
    const modalTextColor = isDefaultTheme ? '#000000' : (theme.isGlass ? '#FFFFFF' : 'var(--modal-text)');

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
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
                        className="relative w-full max-w-sm rounded-[32px] p-8 shadow-2xl border overflow-hidden"
                        style={{ 
                            backgroundColor: modalBg, 
                            borderColor: isDefaultTheme ? '#f3f4f6' : (theme.cardBorder || theme.palette[0]),
                            fontFamily: theme.font,
                            color: modalTextColor
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Decorative background element */}
                        <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full ${isDefaultTheme ? 'bg-[#10b981]/5' : 'opacity-10'}`} style={!isDefaultTheme ? { backgroundColor: theme.palette[0] } : {}} />
                        
                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm ${isDefaultTheme ? 'bg-[#10b981]/10 text-[#10b981]' : ''}`} 
                                 style={!isDefaultTheme ? { backgroundColor: `${theme.palette[0]}20`, color: theme.palette[0] } : {}}>
                                <RotateCcw size={40} className="animate-spin-slow" />
                            </div>

                            <h3 className="text-2xl font-black mb-3 text-black">إعادة تعيين الختمة</h3>
                            
                            <div className="flex items-center gap-2 mb-4 px-4 py-1.5 rounded-md text-xs font-bold" 
                                 style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                                <AlertTriangle size={14} />
                                <span>إجراء لا يمكن التراجع عنه</span>
                            </div>

                            <p className="mb-8 text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                                هل أنت متأكد من رغبتك في إعادة تعيين الختمة الحالية؟ سيتم مسح جميع التقدم الذي أحرزته والبدء من جديد.
                            </p>

                            <div className="flex w-full gap-4">
                                <button 
                                    onClick={onConfirm} 
                                    className="flex-1 py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
                                    style={{
                                        backgroundColor: isDefaultTheme ? '#10b981' : (theme.palette[0] || '#ef4444'),
                                        color: theme.name === 'اسود' ? '#000000' : '#ffffff',
                                        boxShadow: isDefaultTheme ? '0 10px 15px -3px rgba(16, 185, 129, 0.3)' : `0 8px 20px -6px ${theme.palette[0]}60`
                                    }}
                                >
                                    <RotateCcw size={20} />
                                    تأكيد
                                </button>
                                <button 
                                    onClick={onClose} 
                                    className="flex-1 py-4 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                                    style={{
                                        backgroundColor: isDefaultTheme ? '#f3f4f6' : (theme.isGlass ? 'rgba(255, 255, 255, 0.1)' : (theme.isOriginal ? '#f3f4f6' : 'rgba(255, 255, 255, 0.05)')),
                                        color: isDefaultTheme ? '#000000' : modalTextColor,
                                        border: isDefaultTheme ? 'none' : `1px solid ${theme.isGlass ? 'rgba(255, 255, 255, 0.2)' : (theme.cardBorder || '#d1d5db')}`
                                    }}
                                >
                                    <X size={20} />
                                    إلغاء
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
