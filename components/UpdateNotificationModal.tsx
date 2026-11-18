import React from 'react';
import { Download, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getCalculator3DStyles } from '../utils/calculator3DStyles';

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

    const s3d = getCalculator3DStyles(theme, themeKey, isNightMode, homeThemeVariant);
    const primaryColor = s3d.primaryColor;
    const secondaryColor = theme.palette[1] || primaryColor;

    return (
        <div
            className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 settings-3d-adia-scope ${s3d.isDark ? 'settings-3d-dark' : ''}`}
            onClick={onClose}
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                className={`app-page-card border-0 relative overflow-hidden w-full max-w-[330px] rounded-[2rem] ${s3d.surfaceCardClass}`}
                    style={{ 
                        color: s3d.textColor,
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
                    <div className="p-6 pb-2 text-center relative mt-2">
                        <div
                            className="app-3d-badge border-0 w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                            style={{ backgroundColor: s3d.softResultBg, color: s3d.noticeAccent }}
                        >
                            <Sparkles size={22} />
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <h2 className="text-xl font-black">تحديث جديد!</h2>
                        </div>
                        {newVersion && (
                            <span
                                className="app-3d-badge border-0 inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1"
                                style={{ backgroundColor: s3d.softResultBg, color: s3d.noticeAccent }}
                            >
                                الإصدار {newVersion}
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6 pt-2 text-center">
                        <p className="text-sm leading-relaxed mb-6 font-medium" style={{ color: s3d.subtextColor }}>
                            يتوفر إصدار جديد بلمسات محسنة وميزات رائعة. نوصيك بالتحديث الآن لتجربة أفضل.
                        </p>

                        <div className="flex flex-col gap-2.5">
                            <button
                                type="button"
                                onClick={handleUpdate}
                                className="app-page-card unified-3d-btn border-0 w-full py-3.5 px-6 rounded-2xl font-black flex items-center justify-center gap-2 transition-all cursor-pointer"
                                style={
                                    s3d.isBlackTheme
                                        ? s3d.primary3DStyle
                                        : {
                                            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                                            color: '#FFFFFF',
                                            boxShadow: s3d.primary3DShadow
                                        }
                                }
                            >
                                <Download size={18} />
                                تحديث الآن
                            </button>
                            
                            <button
                                type="button"
                                onClick={onClose}
                                className={`app-page-card unified-3d-btn border-0 w-full py-2.5 px-6 rounded-2xl text-sm font-bold transition-all cursor-pointer ${s3d.innerCardClass}`}
                                style={{ color: s3d.subtextColor }}
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
