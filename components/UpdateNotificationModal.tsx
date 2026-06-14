import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface UpdateNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    newVersion: string;
    updateUrl: string;
    isLandscape?: boolean;
}

const UpdateNotificationModal: React.FC<UpdateNotificationModalProps> = ({ 
    isOpen, 
    onClose, 
    newVersion, 
    updateUrl,
    isLandscape 
}) => {
    const { theme } = useTheme();
    if (!isOpen) return null;

    const handleUpdate = () => {
        window.open(updateUrl, '_blank');
    };

    const isDark = theme.isDark;
    const primaryColor = theme.palette[0];
    const secondaryColor = theme.palette[1] || primaryColor;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-transparent">
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative overflow-hidden w-full max-w-[320px] rounded-[2rem] shadow-2xl"
                    style={{ 
                        backgroundColor: theme.cardBg || (isDark ? '#1e293b' : '#ffffff'),
                        color: theme.textColor,
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                        fontFamily: theme.font
                    }}
                    dir="rtl"
                >
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none" 
                         style={{ background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)` }} />
                    <div className="absolute bottom-0 left-0 w-24 h-24 opacity-10 pointer-events-none" 
                         style={{ background: `radial-gradient(circle, ${secondaryColor} 0%, transparent 70%)` }} />

                    {/* Compact Header */}
                    <div className="p-6 pb-2 text-center relative mt-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Sparkles size={18} style={{ color: primaryColor }} />
                            <h2 className="text-xl font-bold">تحديث جديد!</h2>
                            <Sparkles size={18} style={{ color: primaryColor }} />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 pt-0 text-center">
                        <p className="text-sm opacity-80 leading-relaxed mb-6">
                            يتوفر إصدار جديد بلمسات محسنة وميزات رائعة. نوصيك بالتحديث الآن لتجربة أفضل.
                        </p>

                        <div className="flex flex-col gap-2">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleUpdate}
                                className="w-full py-3 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
                                style={{ 
                                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                                    color: '#FFFFFF',
                                    boxShadow: `0 10px 15px -3px ${primaryColor}40`
                                }}
                            >
                                <Download size={18} />
                                تحديث الآن
                            </motion.button>
                            
                            <button
                                onClick={onClose}
                                className="w-full py-2 px-6 opacity-60 hover:opacity-100 text-sm font-medium transition-opacity mb-2"
                            >
                                ربما لاحقاً
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default UpdateNotificationModal;
