import React from 'react';
import { Download, Sparkles } from 'lucide-react';
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
    const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
    if (!isOpen) return null;

    const handleUpdate = () => {
        window.open(updateUrl, '_blank');
    };

    const isBlackTheme = Boolean(
        isNightMode ||
        themeKey === 'black_gold' ||
        themeKey === 'deep_black' ||
        theme?.bgColor === '#000000' ||
        theme?.name === 'أبيض وأسود' ||
        theme?.name === 'اسود' ||
        theme?.name === 'black'
    );
    const isSkyTheme = !isBlackTheme && (themeKey === 'sky_mode' || homeThemeVariant === 'sky');
    const isEmeraldTheme = !isBlackTheme && (themeKey === 'emerald_mode' || homeThemeVariant === 'emerald');
    const isBurgundyTheme = !isBlackTheme && (themeKey === 'burgundy_mode' || homeThemeVariant === 'burgundy');

    const styles = (() => {
        if (isBlackTheme) {
            return {
                primaryColor: '#F59E0B',
                secondaryColor: '#D97706',
                modalBg: 'linear-gradient(168deg, #1b1b22 0%, #121216 55%, #0b0b0f 100%)',
                modalShadow:
                    '0 9px 0 #050507, 0 26px 54px rgba(0, 0, 0, 0.9), inset 0 2px 2px rgba(255, 255, 255, 0.16), inset 0 -3px 6px rgba(0, 0, 0, 0.65)',
                titleColor: '#FFFFFF',
                subtextColor: '#D4D4D8',
                iconBoxBg: 'linear-gradient(180deg, #322a18 0%, #1e1910 100%)',
                iconBoxColor: '#F59E0B',
                iconBoxShadow:
                    '0 4px 0 #09090b, 0 8px 16px rgba(0, 0, 0, 0.65), inset 0 1.5px 1px rgba(245, 158, 11, 0.35)',
                badgeBg: 'linear-gradient(180deg, #2e2e38 0%, #22222b 100%)',
                badgeColor: '#FCD34D',
                badgeShadow:
                    '0 3.5px 0 #09090b, 0 6px 12px rgba(0, 0, 0, 0.65), inset 0 1.5px 1px rgba(255, 255, 255, 0.18)',
                primaryBtnBg: 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)',
                primaryBtnText: '#09090B',
                primaryBtnShadow:
                    '0 5px 0 #78350F, 0 12px 22px rgba(245, 158, 11, 0.28), inset 0 2px 1.5px rgba(255, 255, 255, 0.45)',
                secondaryBtnBg: 'linear-gradient(180deg, #32323e 0%, #24242e 100%)',
                secondaryBtnText: '#F4F4F5',
                secondaryBtnShadow:
                    '0 4.5px 0 #09090d, 0 10px 18px rgba(0, 0, 0, 0.55), inset 0 1.5px 1px rgba(255, 255, 255, 0.18), inset 0 -1.5px 2px rgba(0, 0, 0, 0.45)',
            };
        }

        if (isSkyTheme) {
            return {
                primaryColor: '#0284C7',
                secondaryColor: '#0369A1',
                modalBg: 'linear-gradient(168deg, #F0F9FF 0%, #E0F2FE 100%)',
                modalShadow:
                    '0 9px 0 rgba(2, 132, 199, 0.22), 0 26px 52px rgba(15, 23, 42, 0.3), inset 0 2.5px 2px rgba(255, 255, 255, 0.98), inset 0 -3px 6px rgba(2, 132, 199, 0.1)',
                titleColor: '#0F172A',
                subtextColor: '#475569',
                iconBoxBg: 'linear-gradient(180deg, #FFFFFF 0%, #E0F2FE 100%)',
                iconBoxColor: '#0284C7',
                iconBoxShadow:
                    '0 4.5px 0 rgba(2, 132, 199, 0.22), 0 8px 16px rgba(2, 132, 199, 0.14), inset 0 2px 1.5px rgba(255, 255, 255, 0.98)',
                badgeBg: 'linear-gradient(180deg, #FFFFFF 0%, #F0F9FF 100%)',
                badgeColor: '#0369A1',
                badgeShadow:
                    '0 3.5px 0 rgba(2, 132, 199, 0.2), 0 6px 12px rgba(2, 132, 199, 0.12), inset 0 1.5px 1px rgba(255, 255, 255, 0.96)',
                primaryBtnBg: 'linear-gradient(180deg, #0284C7 0%, #0369A1 100%)',
                primaryBtnText: '#FFFFFF',
                primaryBtnShadow:
                    '0 5px 0 #075985, 0 12px 22px rgba(2, 132, 199, 0.28), inset 0 2px 1.5px rgba(255, 255, 255, 0.4)',
                secondaryBtnBg: 'linear-gradient(180deg, #FFFFFF 0%, #F0F9FF 65%, #E0F2FE 100%)',
                secondaryBtnText: '#0369A1',
                secondaryBtnShadow:
                    '0 4.5px 0 rgba(2, 132, 199, 0.2), 0 10px 18px rgba(2, 132, 199, 0.12), inset 0 2px 1.5px rgba(255, 255, 255, 0.96)',
            };
        }

        if (isEmeraldTheme) {
            return {
                primaryColor: '#059669',
                secondaryColor: '#047857',
                modalBg: 'linear-gradient(168deg, #F0FDF4 0%, #DCFCE7 100%)',
                modalShadow:
                    '0 9px 0 rgba(5, 150, 105, 0.22), 0 26px 52px rgba(15, 23, 42, 0.3), inset 0 2.5px 2px rgba(255, 255, 255, 0.98), inset 0 -3px 6px rgba(5, 150, 105, 0.1)',
                titleColor: '#0F172A',
                subtextColor: '#475569',
                iconBoxBg: 'linear-gradient(180deg, #FFFFFF 0%, #DCFCE7 100%)',
                iconBoxColor: '#059669',
                iconBoxShadow:
                    '0 4.5px 0 rgba(5, 150, 105, 0.22), 0 8px 16px rgba(5, 150, 105, 0.14), inset 0 2px 1.5px rgba(255, 255, 255, 0.98)',
                badgeBg: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)',
                badgeColor: '#047857',
                badgeShadow:
                    '0 3.5px 0 rgba(5, 150, 105, 0.2), 0 6px 12px rgba(5, 150, 105, 0.12), inset 0 1.5px 1px rgba(255, 255, 255, 0.96)',
                primaryBtnBg: 'linear-gradient(180deg, #059669 0%, #047857 100%)',
                primaryBtnText: '#FFFFFF',
                primaryBtnShadow:
                    '0 5px 0 #065F46, 0 12px 22px rgba(5, 150, 105, 0.28), inset 0 2px 1.5px rgba(255, 255, 255, 0.4)',
                secondaryBtnBg: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 65%, #DCFCE7 100%)',
                secondaryBtnText: '#047857',
                secondaryBtnShadow:
                    '0 4.5px 0 rgba(5, 150, 105, 0.2), 0 10px 18px rgba(5, 150, 105, 0.12), inset 0 2px 1.5px rgba(255, 255, 255, 0.96)',
            };
        }

        if (isBurgundyTheme) {
            return {
                primaryColor: '#BE123C',
                secondaryColor: '#881337',
                modalBg: 'linear-gradient(168deg, #FFF1F2 0%, #FFE4E6 100%)',
                modalShadow:
                    '0 9px 0 rgba(159, 18, 57, 0.22), 0 26px 52px rgba(15, 23, 42, 0.3), inset 0 2.5px 2px rgba(255, 255, 255, 0.98), inset 0 -3px 6px rgba(159, 18, 57, 0.1)',
                titleColor: '#0F172A',
                subtextColor: '#475569',
                iconBoxBg: 'linear-gradient(180deg, #FFFFFF 0%, #FFE4E6 100%)',
                iconBoxColor: '#BE123C',
                iconBoxShadow:
                    '0 4.5px 0 rgba(159, 18, 57, 0.22), 0 8px 16px rgba(159, 18, 57, 0.14), inset 0 2px 1.5px rgba(255, 255, 255, 0.98)',
                badgeBg: 'linear-gradient(180deg, #FFFFFF 0%, #FFF1F2 100%)',
                badgeColor: '#881337',
                badgeShadow:
                    '0 3.5px 0 rgba(159, 18, 57, 0.2), 0 6px 12px rgba(159, 18, 57, 0.12), inset 0 1.5px 1px rgba(255, 255, 255, 0.96)',
                primaryBtnBg: 'linear-gradient(180deg, #BE123C 0%, #881337 100%)',
                primaryBtnText: '#FFFFFF',
                primaryBtnShadow:
                    '0 5px 0 #4C0519, 0 12px 22px rgba(159, 18, 57, 0.28), inset 0 2px 1.5px rgba(255, 255, 255, 0.4)',
                secondaryBtnBg: 'linear-gradient(180deg, #FFFFFF 0%, #FFF1F2 65%, #FFE4E6 100%)',
                secondaryBtnText: '#881337',
                secondaryBtnShadow:
                    '0 4.5px 0 rgba(159, 18, 57, 0.2), 0 10px 18px rgba(159, 18, 57, 0.12), inset 0 2px 1.5px rgba(255, 255, 255, 0.96)',
            };
        }

        // Default Gold Theme (Home Page Gold 3D style)
        return {
            primaryColor: '#D97706',
            secondaryColor: '#B45309',
            modalBg: 'linear-gradient(168deg, #FFFDF2 0%, #FEF3C7 100%)',
            modalShadow:
                '0 9px 0 rgba(180, 83, 9, 0.22), 0 26px 52px rgba(15, 23, 42, 0.3), inset 0 2.5px 2px rgba(255, 255, 255, 0.98), inset 0 -3px 6px rgba(180, 83, 9, 0.1)',
            titleColor: '#1C1917',
            subtextColor: '#57534E',
            iconBoxBg: 'linear-gradient(180deg, #FFFFFF 0%, #FEF3C7 100%)',
            iconBoxColor: '#B45309',
            iconBoxShadow:
                '0 4.5px 0 rgba(180, 83, 9, 0.22), 0 8px 16px rgba(180, 83, 9, 0.14), inset 0 2px 1.5px rgba(255, 255, 255, 0.98)',
            badgeBg: 'linear-gradient(180deg, #FFFFFF 0%, #FFFBEB 100%)',
            badgeColor: '#92400E',
            badgeShadow:
                '0 3.5px 0 rgba(180, 83, 9, 0.2), 0 6px 12px rgba(180, 83, 9, 0.12), inset 0 1.5px 1px rgba(255, 255, 255, 0.96)',
            primaryBtnBg: 'linear-gradient(180deg, #D97706 0%, #B45309 100%)',
            primaryBtnText: '#FFFFFF',
            primaryBtnShadow:
                '0 5px 0 #78350F, 0 12px 22px rgba(180, 83, 9, 0.28), inset 0 2px 1.5px rgba(255, 255, 255, 0.4)',
            secondaryBtnBg: 'linear-gradient(180deg, #FFFFFF 0%, #FFFBEB 65%, #FEF3C7 100%)',
            secondaryBtnText: '#92400E',
            secondaryBtnShadow:
                '0 4.5px 0 rgba(180, 83, 9, 0.2), 0 10px 18px rgba(180, 83, 9, 0.12), inset 0 2px 1.5px rgba(255, 255, 255, 0.96)',
        };
    })();

    return (
        <div
            className={`fixed inset-0 z-[1000] flex items-center justify-center ${isLandscape ? 'p-3' : 'p-4'} bg-black/60 backdrop-blur-[2px] select-none`}
            onClick={onClose}
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                className="border-0 relative overflow-hidden w-full max-w-[330px] rounded-[2rem]"
                style={{ 
                    background: styles.modalBg,
                    color: styles.titleColor,
                    boxShadow: styles.modalShadow,
                    fontFamily: theme.font
                }}
                dir="rtl"
            >
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none" 
                     style={{ background: `radial-gradient(circle, ${styles.primaryColor} 0%, transparent 70%)` }} />
                <div className="absolute bottom-0 left-0 w-24 h-24 opacity-10 pointer-events-none" 
                     style={{ background: `radial-gradient(circle, ${styles.secondaryColor} 0%, transparent 70%)` }} />

                {/* Compact Header */}
                <div className="p-6 pb-2 text-center relative mt-2">
                    <div
                        className="border-0 w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                        style={{
                            background: styles.iconBoxBg,
                            color: styles.iconBoxColor,
                            boxShadow: styles.iconBoxShadow,
                        }}
                    >
                        <Sparkles size={22} />
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <h2 className="text-xl font-black" style={{ color: styles.titleColor }}>تحديث جديد!</h2>
                    </div>
                    {newVersion && (
                        <span
                            className="border-0 inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1"
                            style={{
                                background: styles.badgeBg,
                                color: styles.badgeColor,
                                boxShadow: styles.badgeShadow,
                            }}
                        >
                            الإصدار {newVersion}
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 pt-2 text-center">
                    <p className="text-sm leading-relaxed mb-6 font-medium" style={{ color: styles.subtextColor }}>
                        يتوفر إصدار جديد بلمسات محسنة وميزات رائعة. نوصيك بالتحديث الآن لتجربة أفضل.
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={handleUpdate}
                            className="unified-3d-btn border-0 w-full py-3.5 px-6 rounded-2xl font-black flex items-center justify-center gap-2 cursor-pointer"
                            style={{
                                background: styles.primaryBtnBg,
                                color: styles.primaryBtnText,
                                boxShadow: styles.primaryBtnShadow,
                            }}
                        >
                            <Download size={18} />
                            تحديث الآن
                        </button>
                        
                        <button
                            type="button"
                            onClick={onClose}
                            className="unified-3d-btn border-0 w-full py-2.5 px-6 rounded-2xl text-sm font-bold cursor-pointer"
                            style={{
                                background: styles.secondaryBtnBg,
                                color: styles.secondaryBtnText,
                                boxShadow: styles.secondaryBtnShadow,
                            }}
                        >
                            ربما لاحقاً
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateNotificationModal;
