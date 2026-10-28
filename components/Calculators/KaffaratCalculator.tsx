import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { RefreshCw } from 'lucide-react';
import { getModernFlatTokens, hexToRgba } from '../../utils/flatDesignTokens';

const KaffaratCalculator: React.FC<{ cardBorderColor?: string }> = () => {
    const { theme, themeKey } = useTheme();
    const tokens = getModernFlatTokens(theme, themeKey);
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
        <div className="space-y-4 animate-fade-in pb-8" dir={isEn ? 'ltr' : 'rtl'}>
            {/* Header Actions */}
            <div id="kaffarat-header-actions" className="flex justify-between items-center mb-2">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2" style={{ color: tokens.textColor }}>
                    <i className="fa-solid fa-hand-holding-heart" style={{ color: tokens.primaryColor }}></i> 
                    <span>{isEn ? 'Expiations (Kaffarat) Calculator' : 'حساب الكفارات'}</span>
                </h2>
                <button 
                    id="btn-kaffarat-reset" 
                    onClick={clearAll} 
                    className="flex items-center gap-1.5 text-xs sm:text-sm text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-xl transition-colors cursor-pointer border-0"
                >
                    <RefreshCw size={14} /> 
                    <span>{isEn ? 'Reset' : 'إعادة ضبط'}</span>
                </button>
            </div>

            {/* Fidyah */}
            <div 
                id="kaffarat-card-fidyah" 
                className="p-5 rounded-[18px] border-0"
                style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
            >
                <h3 className="text-base sm:text-lg font-bold mb-1.5 flex items-center gap-2" style={{ color: tokens.textColor }}>
                    <i className="fa-solid fa-bowl-food" style={{ color: tokens.primaryColor }}></i> 
                    <span>{isEn ? 'Fasting Fidyah (Fidyat al-Siyam)' : 'فدية الصيام'}</span>
                </h3>
                <p className="text-xs mb-4 opacity-75 font-normal" style={{ color: tokens.subtextColor }}>
                    {isEn 
                        ? 'Obligatory upon those permanently unable to fast due to chronic illness or old age.' 
                        : 'تجب على من عجز عن الصيام عجزاً لا يُرجى برؤه (كالكبير في السن والمريض مرضاً مزمناً).'}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                        <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1.5">
                            <span className="text-xs sm:text-sm font-bold" style={{ color: tokens.textColor }}>
                                {isEn ? 'Missed Fasting Days' : 'عدد الأيام المفطرة'}
                            </span>
                            <span className="text-[11px] opacity-75 font-normal" style={{ color: tokens.subtextColor }}>
                                {isEn ? 'Unfasted days of Ramadan' : 'أيام رمضان غير المصومة'}
                            </span>
                        </div>
                        <input 
                            type="number" 
                            placeholder={isEn ? 'Number of days' : 'عدد الأيام'} 
                            value={missedFastingDays} 
                            onChange={e => setMissedFastingDays(e.target.value)} 
                            className={`w-full p-3 rounded-xl border-0 bg-slate-100 dark:bg-zinc-800 focus:ring-2 focus:ring-primary/40 focus:outline-hidden transition-all text-sm font-bold ${isEn ? 'text-left' : 'text-right'}`}
                            style={{ color: tokens.textColor }}
                        />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1.5">
                            <span className="text-xs sm:text-sm font-bold" style={{ color: tokens.textColor }}>
                                {isEn ? 'Feeding Cost per Poor Person' : 'تكلفة إطعام مسكين واحد'}
                            </span>
                            <span className="text-[11px] opacity-75 font-normal" style={{ color: tokens.subtextColor }}>
                                {isEn ? 'Average cost of a satisfying meal' : 'متوسط قيمة وجبة مشبعة'}
                            </span>
                        </div>
                        <input 
                            type="number" 
                            placeholder={isEn ? 'Meal cost' : 'التكلفة'} 
                            value={fidyahFeedingCost} 
                            onChange={e => setFidyahFeedingCost(e.target.value)} 
                            className={`w-full p-3 rounded-xl border-0 bg-slate-100 dark:bg-zinc-800 focus:ring-2 focus:ring-primary/40 focus:outline-hidden transition-all text-sm font-bold ${isEn ? 'text-left' : 'text-right'}`}
                            style={{ color: tokens.textColor }}
                        />
                    </div>
                </div>
                
                <div 
                    className="mt-4 p-4 rounded-2xl flex justify-between items-center"
                    style={{ backgroundColor: hexToRgba(tokens.primaryColor, 0.1) }}
                >
                    <span className="font-bold text-sm" style={{ color: tokens.textColor }}>
                        {isEn ? 'Total Fasting Fidyah: ' : 'إجمالي فدية الصيام: '}
                    </span>
                    <span className="text-xl sm:text-2xl font-black font-sans" style={{ color: tokens.primaryColor }}>
                        {fidyahTotal > 0 ? fidyahTotal.toFixed(2) : '0.00'}
                    </span>
                </div>
            </div>

            {/* Kaffarat Yamin */}
            <div 
                id="kaffarat-card-yamin" 
                className="p-5 rounded-[18px] border-0"
                style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
            >
                <h3 className="text-base sm:text-lg font-bold mb-1.5 flex items-center gap-2" style={{ color: tokens.textColor }}>
                    <i className="fa-solid fa-hand-sparkles" style={{ color: tokens.primaryColor }}></i> 
                    <span>{isEn ? 'Oath Expiation (Kaffarat al-Yamin)' : 'كفارة اليمين'}</span>
                </h3>
                <p className="text-xs mb-4 opacity-75 font-normal" style={{ color: tokens.subtextColor }}>
                    {isEn 
                        ? 'Obligatory upon breaking an unfulfilled oath. It consists of feeding ten needy persons with the average food you feed your families.' 
                        : 'تجب عند الحنث في اليمين (الرجوع عن حلف). وهي إطعام عشرة مساكين من أوسط ما تطعمون أهليكم.'}
                </p>
                
                <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1.5">
                        <span className="text-xs sm:text-sm font-bold" style={{ color: tokens.textColor }}>
                            {isEn ? 'Cost of One Meal' : 'تكلفة الوجبة الواحدة'}
                        </span>
                        <span className="text-[11px] opacity-75 font-normal" style={{ color: tokens.subtextColor }}>
                            {isEn ? 'Average cost of a satisfying meal' : 'متوسط قيمة وجبة مشبعة'}
                        </span>
                    </div>
                    <input 
                        type="number" 
                        placeholder={isEn ? 'Meal cost' : 'التكلفة'} 
                        value={yaminFeedingCost} 
                        onChange={e => setYaminFeedingCost(e.target.value)} 
                        className={`w-full p-3 rounded-xl border-0 bg-slate-100 dark:bg-zinc-800 focus:ring-2 focus:ring-primary/40 focus:outline-hidden transition-all text-sm font-bold ${isEn ? 'text-left' : 'text-right'}`}
                        style={{ color: tokens.textColor }}
                    />
                </div>
                
                <div 
                    className="mt-4 p-4 rounded-2xl flex justify-between items-center"
                    style={{ backgroundColor: hexToRgba(tokens.primaryColor, 0.1) }}
                >
                    <span className="font-bold text-sm" style={{ color: tokens.textColor }}>
                        {isEn ? 'Total Oath Expiation (10 Persons): ' : 'إجمالي كفارة اليمين (10 مساكين): '}
                    </span>
                    <span className="text-xl sm:text-2xl font-black font-sans" style={{ color: tokens.primaryColor }}>
                        {yaminTotal > 0 ? yaminTotal.toFixed(2) : '0.00'}
                    </span>
                </div>
            </div>

            {/* Note */}
            <div 
                id="kaffarat-card-notes" 
                className={`p-4 rounded-[18px] border-0 text-xs opacity-75 leading-relaxed ${isEn ? 'text-left' : 'text-center'}`}
                style={{ 
                    backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                    color: tokens.textColor
                }}
            >
                {isEn 
                    ? '* Note: The primary Islamic ruling for Kaffarat and Fidyah is to distribute actual staple food (rice, wheat, dates) in the amount of a Mudd or half-Sa\' depending on the school of jurisprudence. Cash value is permitted by a group of scholars to facilitate relief for the poor.' 
                    : '* ملاحظة: الأصل في الكفارات والفدية هو إخراج الطعام عيناً (أرز، قمح، تمر) بمقدار مد أو نصف صاع حسب المذهب، وتجوز القيمة النقدية عند جماعة من أهل العلم تيسيراً على الفقراء.'}
            </div>
        </div>
    );
};

export default KaffaratCalculator;
