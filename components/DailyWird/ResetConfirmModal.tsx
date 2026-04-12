
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
    const { theme } = useTheme();

    const isGlass = theme.isGlass;
    const isGolden = theme.name.includes('ذهب') || theme.name.includes('Golden');
    const isEmerald = theme.name.includes('زمرد') || theme.name.includes('Emerald');

    const modalBg = theme.isGlass 
        ? (isGolden ? '#451a03' : isEmerald ? '#064E3B' : '#1e293b')
        : 'var(--modal-bg)';
    
    const modalTextColor = theme.isGlass ? '#FFFFFF' : 'var(--modal-text)';

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
                        className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl border overflow-hidden"
                        style={{ 
                            backgroundColor: modalBg, 
                            borderColor: theme.cardBorder || theme.palette[0],
                            fontFamily: theme.font,
                            color: modalTextColor
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Decorative background element */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: theme.palette[0] }} />
                        
                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg" 
                                 style={{ backgroundColor: `${theme.palette[0]}20`, color: theme.palette[0] }}>
                                <RotateCcw size={32} className="animate-spin-slow" />
                            </div>

                            <h3 className="text-xl font-bold mb-2">إعادة تعيين الختمة</h3>
                            
                            <div className="flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-xs font-bold" 
                                 style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                                <AlertTriangle size={14} />
                                <span>إجراء لا يمكن التراجع عنه</span>
                            </div>

                            <p className="mb-8 opacity-80 leading-relaxed">
                                هل أنت متأكد من رغبتك في إعادة تعيين الختمة الحالية؟ سيتم مسح جميع التقدم الذي أحرزته والبدء من جديد.
                            </p>

                            <div className="flex w-full gap-3">
                                <button 
                                    onClick={onClose} 
                                    className="flex-1 py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                                    style={{
                                        backgroundColor: theme.isGlass ? 'rgba(255, 255, 255, 0.1)' : (theme.isOriginal ? '#f3f4f6' : 'rgba(255, 255, 255, 0.05)'),
                                        color: modalTextColor,
                                        border: `1px solid ${theme.isGlass ? 'rgba(255, 255, 255, 0.2)' : (theme.cardBorder || '#d1d5db')}`
                                    }}
                                >
                                    <X size={18} />
                                    إلغاء
                                </button>
                                <button 
                                    onClick={onConfirm} 
                                    className="flex-1 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
                                    style={{
                                        backgroundColor: theme.palette[0] || '#ef4444',
                                        color: '#ffffff',
                                        boxShadow: `0 8px 20px -6px ${theme.palette[0]}60`
                                    }}
                                >
                                    <RotateCcw size={18} />
                                    تأكيد
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
