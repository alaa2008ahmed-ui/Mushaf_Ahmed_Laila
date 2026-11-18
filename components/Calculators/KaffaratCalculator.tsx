import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { RefreshCw } from 'lucide-react';
import { getCalculator3DStyles } from '../../utils/calculator3DStyles';

const KaffaratCalculator: React.FC<{ cardBorderColor?: string }> = () => {
    const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
    const s3d = getCalculator3DStyles(theme, themeKey, isNightMode, homeThemeVariant);
    const { language } = useLanguage();
    const isEn = language === 'en';
    
    const [missedFastingDays, setMissedFastingDays] = useState('');
    const [fidyahFeedingCost, setFidyahFeedingCost] = useState('');
    const [yaminFeedingCost, setYaminFeedingCost] = useState('');

    const clearAll = () => {
        setMissedFastingDays('');
        setFidyahFeedingCost('');
        setYaminFeedingCost('');
    };

    const fidyahTotal = (parseFloat(missedFastingDays) || 0) * (parseFloat(fidyahFeedingCost) || 0);
    const yaminTotal = (parseFloat(yaminFeedingCost) || 0) * 10;

    return (
        <div className="space-y-4 animate-fade-in" dir={isEn ? 'ltr' : 'rtl'}>
            {/* Header Actions */}
            <div id="kaffarat-header-actions" className="flex justify-between items-center mb-2 overflow-visible">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2.5" style={{ color: s3d.textColor }}>
                    <span className={`app-3d-badge w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>
                        <i className="fa-solid fa-hand-holding-heart" style={{ color: s3d.primaryColor }}></i>
                    </span>
                    <span>{isEn ? 'Expiations (Kaffarat) Calculator' : 'حساب الكفارات'}</span>
                </h2>
                <button 
                    id="btn-kaffarat-reset" 
                    onClick={clearAll} 
                    className={`app-page-card border-0 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${s3d.surfaceCardClass}`}
                >
                    <RefreshCw size={14} /> 
                    <span>{isEn ? 'Reset' : 'إعادة ضبط'}</span>
                </button>
            </div>

            {/* Fidyah */}
            <div 
                id="kaffarat-card-fidyah" 
                className={`app-page-card border-0 p-5 rounded-3xl transition-all ${s3d.surfaceCardClass}`}
            >
                <h3 className="text-base sm:text-lg font-bold mb-1.5 flex items-center gap-2.5">
                    <span className={`app-3d-badge w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>
                        <i className="fa-solid fa-bowl-food text-sm" style={{ color: s3d.primaryColor }}></i>
                    </span>
                    <span>{isEn ? 'Fasting Fidyah (Fidyat al-Siyam)' : 'فدية الصيام'}</span>
                </h3>
                <p className="text-xs mb-4 opacity-80 font-normal" style={{ color: s3d.subtextColor }}>
                    {isEn 
                        ? 'Obligatory upon those permanently unable to fast due to chronic illness or old age.' 
                        : 'تجب على من عجز عن الصيام عجزاً لا يُرجى برؤه (كالكبير في السن والمريض مرضاً مزمناً).'}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                        <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1.5 px-1">
                            <span className="text-xs sm:text-sm font-bold">
                                {isEn ? 'Missed Fasting Days' : 'عدد الأيام المفطرة'}
                            </span>
                            <span className="text-[11px] opacity-80 font-normal" style={{ color: s3d.subtextColor }}>
                                {isEn ? 'Unfasted days of Ramadan' : 'أيام رمضان غير المصومة'}
                            </span>
                        </div>
                        <input 
                            type="number" 
                            placeholder={isEn ? 'Number of days' : 'عدد الأيام'} 
                            value={missedFastingDays} 
                            onChange={e => setMissedFastingDays(e.target.value)} 
                            className={`app-3d-recessed-field border-0 w-full p-3.5 rounded-2xl focus:ring-2 focus:ring-primary/40 focus:outline-hidden transition-all text-sm font-bold tabular-nums ${s3d.recessedInputClass} ${isEn ? 'text-left' : 'text-right'}`}
                        />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1.5 px-1">
                            <span className="text-xs sm:text-sm font-bold">
                                {isEn ? 'Feeding Cost per Poor Person' : 'تكلفة إطعام مسكين واحد'}
                            </span>
                            <span className="text-[11px] opacity-80 font-normal" style={{ color: s3d.subtextColor }}>
                                {isEn ? 'Average cost of a satisfying meal' : 'متوسط قيمة وجبة مشبعة'}
                            </span>
                        </div>
                        <input 
                            type="number" 
                            placeholder={isEn ? 'Meal cost' : 'التكلفة'} 
                            value={fidyahFeedingCost} 
                            onChange={e => setFidyahFeedingCost(e.target.value)} 
                            className={`app-3d-recessed-field border-0 w-full p-3.5 rounded-2xl focus:ring-2 focus:ring-primary/40 focus:outline-hidden transition-all text-sm font-bold tabular-nums ${s3d.recessedInputClass} ${isEn ? 'text-left' : 'text-right'}`}
                        />
                    </div>
                </div>
                
                <div 
                    className="app-inner-3d-box border-0 mt-4 p-4 rounded-2xl flex justify-between items-center"
                    style={{ backgroundColor: s3d.softResultBg }}
                >
                    <span className="font-bold text-sm">
                        {isEn ? 'Total Fasting Fidyah: ' : 'إجمالي فدية الصيام: '}
                    </span>
                    <span className="text-xl sm:text-2xl font-black font-sans tabular-nums" style={{ color: s3d.primaryColor }}>
                        {fidyahTotal > 0 ? fidyahTotal.toFixed(2) : '0.00'}
                    </span>
                </div>
            </div>

            {/* Kaffarat Yamin */}
            <div 
                id="kaffarat-card-yamin" 
                className={`app-page-card border-0 p-5 rounded-3xl transition-all ${s3d.surfaceCardClass}`}
            >
                <h3 className="text-base sm:text-lg font-bold mb-1.5 flex items-center gap-2.5">
                    <span className={`app-3d-badge w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>
                        <i className="fa-solid fa-hand-sparkles text-sm" style={{ color: s3d.primaryColor }}></i>
                    </span>
                    <span>{isEn ? 'Oath Expiation (Kaffarat al-Yamin)' : 'كفارة اليمين'}</span>
                </h3>
                <p className="text-xs mb-4 opacity-80 font-normal" style={{ color: s3d.subtextColor }}>
                    {isEn 
                        ? 'Obligatory upon breaking an unfulfilled oath. It consists of feeding ten needy persons with the average food you feed your families.' 
                        : 'تجب عند الحنث في اليمين (الرجوع عن حلف). وهي إطعام عشرة مساكين من أوسط ما تطعمون أهليكم.'}
                </p>
                
                <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1.5 px-1">
                        <span className="text-xs sm:text-sm font-bold">
                            {isEn ? 'Cost of One Meal' : 'تكلفة الوجبة الواحدة'}
                        </span>
                        <span className="text-[11px] opacity-80 font-normal" style={{ color: s3d.subtextColor }}>
                            {isEn ? 'Average cost of a satisfying meal' : 'متوسط قيمة وجبة مشبعة'}
                        </span>
                    </div>
                    <input 
                        type="number" 
                        placeholder={isEn ? 'Meal cost' : 'التكلفة'} 
                        value={yaminFeedingCost} 
                        onChange={e => setYaminFeedingCost(e.target.value)} 
                        className={`app-3d-recessed-field border-0 w-full p-3.5 rounded-2xl focus:ring-2 focus:ring-primary/40 focus:outline-hidden transition-all text-sm font-bold tabular-nums ${s3d.recessedInputClass} ${isEn ? 'text-left' : 'text-right'}`}
                    />
                </div>
                
                <div 
                    className="app-inner-3d-box border-0 mt-4 p-4 rounded-2xl flex justify-between items-center"
                    style={{ backgroundColor: s3d.softResultBg }}
                >
                    <span className="font-bold text-sm">
                        {isEn ? 'Total Oath Expiation (10 Persons): ' : 'إجمالي كفارة اليمين (10 مساكين): '}
                    </span>
                    <span className="text-xl sm:text-2xl font-black font-sans tabular-nums" style={{ color: s3d.primaryColor }}>
                        {yaminTotal > 0 ? yaminTotal.toFixed(2) : '0.00'}
                    </span>
                </div>
            </div>

            {/* Note */}
            <div 
                id="kaffarat-card-notes" 
                className={`app-page-card border-0 p-4 rounded-3xl text-xs opacity-90 leading-relaxed ${s3d.surfaceCardClass} ${isEn ? 'text-left' : 'text-center'}`}
            >
                {isEn 
                    ? '* Note: The primary Islamic ruling for Kaffarat and Fidyah is to distribute actual staple food (rice, wheat, dates) in the amount of a Mudd or half-Sa\' depending on the school of jurisprudence. Cash value is permitted by a group of scholars to facilitate relief for the poor.' 
                    : '* ملاحظة: الأصل في الكفارات والفدية هو إخراج الطعام عيناً (أرز، قمح، تمر) بمقدار مد أو نصف صاع حسب المذهب، وتجوز القيمة النقدية عند جماعة من أهل العلم تيسيراً على الفقراء.'}
            </div>
        </div>
    );
};

export default KaffaratCalculator;
