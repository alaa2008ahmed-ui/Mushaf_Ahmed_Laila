import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { RefreshCw } from 'lucide-react';

const KaffaratCalculator: React.FC<{ cardBorderColor?: string }> = ({ cardBorderColor: propCardBorderColor }) => {
    const { theme, themeKey } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';

    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود';
    const isDefaultTheme = themeKey === 'default' || !themeKey;
    const cardBorderColor = propCardBorderColor || (isDefaultTheme 
        ? '#000000' 
        : (isBlackTheme 
            ? '#FFFFFF' 
            : (theme.palette?.[0] || '#000000')));
    
    const [missedFastingDays, setMissedFastingDays] = useState('');
    const [fidyahFeedingCost, setFidyahFeedingCost] = useState('');
    
    const [yaminFeedingCost, setYaminFeedingCost] = useState('');

    const inputStyle: React.CSSProperties = {
        backgroundColor: theme.isOriginal ? '#fff' : 'rgba(255,255,255,0.05)',
        borderColor: cardBorderColor,
        borderWidth: '1.5px',
        borderStyle: 'solid',
        color: theme.textColor,
        textAlign: isEn ? 'left' : 'right',
    };

    const clearAll = () => {
        setMissedFastingDays('');
        setFidyahFeedingCost('');
        setYaminFeedingCost('');
    };

    const fidyahTotal = (parseFloat(missedFastingDays) || 0) * (parseFloat(fidyahFeedingCost) || 0);
    const yaminTotal = (parseFloat(yaminFeedingCost) || 0) * 10;

    return (
        <div className="space-y-6 animate-fade-in pb-8" dir={isEn ? 'ltr' : 'rtl'}>
            {/* Header Actions */}
            <div id="kaffarat-header-actions" className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: theme.textColor }}>
                    <i className={`fa-solid fa-hand-holding-heart ${isBlackTheme ? 'text-white' : (isDefaultTheme ? 'text-black' : 'text-primary')}`}></i> 
                    <span>{isEn ? 'Expiations (Kaffarat) Calculator' : 'حساب الكفارات'}</span>
                </h2>
                <button id="btn-kaffarat-reset" onClick={clearAll} className="flex items-center gap-1 text-sm text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                    <RefreshCw size={14} /> 
                    <span>{isEn ? 'Reset' : 'إعادة ضبط'}</span>
                </button>
            </div>

            {/* Fidyah */}
            <div id="kaffarat-card-fidyah" className="themed-card p-5 rounded-xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: theme.textColor }}>
                    <i className={`fa-solid fa-bowl-food ${isBlackTheme ? 'text-white' : (isDefaultTheme ? 'text-black' : 'text-primary')}`}></i> 
                    <span>{isEn ? 'Fasting Fidyah (Fidyat al-Siyam)' : 'فدية الصيام'}</span>
                </h3>
                <p className="text-xs mb-4 opacity-80" style={{ color: theme.textColor }}>
                    {isEn 
                        ? 'Obligatory upon those permanently unable to fast due to chronic illness or old age.' 
                        : 'تجب على من عجز عن الصيام عجزاً لا يُرجى برؤه (كالكبير في السن والمريض مرضاً مزمناً).'}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1">
                            <span className="text-sm font-bold opacity-80" style={{ color: theme.textColor }}>
                                {isEn ? 'Missed Fasting Days' : 'عدد الأيام المفطرة'}
                            </span>
                            <span className="text-[11px] opacity-70 font-normal">
                                {isEn ? 'Unfasted days of Ramadan' : 'أيام رمضان غير المصومة'}
                            </span>
                        </div>
                        <input 
                            type="number" 
                            placeholder={isEn ? 'Number of days' : 'عدد الأيام'} 
                            value={missedFastingDays} 
                            onChange={e => setMissedFastingDays(e.target.value)} 
                            className="w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-primary focus:outline-hidden transition-all text-sm font-bold" 
                            style={inputStyle} 
                        />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1">
                            <span className="text-sm font-bold opacity-80" style={{ color: theme.textColor }}>
                                {isEn ? 'Feeding Cost per Poor Person' : 'تكلفة إطعام مسكين واحد'}
                            </span>
                            <span className="text-[11px] opacity-70 font-normal">
                                {isEn ? 'Average cost of a satisfying meal' : 'متوسط قيمة وجبة مشبعة'}
                            </span>
                        </div>
                        <input 
                            type="number" 
                            placeholder={isEn ? 'Meal cost' : 'التكلفة'} 
                            value={fidyahFeedingCost} 
                            onChange={e => setFidyahFeedingCost(e.target.value)} 
                            className="w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-primary focus:outline-hidden transition-all text-sm font-bold" 
                            style={inputStyle} 
                        />
                    </div>
                </div>
                
                <div className="mt-4 p-4 rounded-lg bg-primary/10 flex justify-between items-center" style={{ borderColor: cardBorderColor, borderWidth: '1px', borderStyle: 'solid' }}>
                    <span className="font-bold opacity-90" style={{ color: theme.textColor }}>
                        {isEn ? 'Total Fasting Fidyah: ' : 'إجمالي فدية الصيام: '}
                    </span>
                    <span className={`text-2xl font-black ${isBlackTheme ? 'text-white' : (isDefaultTheme ? 'text-black' : 'text-primary')}`}>
                        {fidyahTotal > 0 ? fidyahTotal.toFixed(2) : '0.00'}
                    </span>
                </div>
            </div>

            {/* Kaffarat Yamin */}
            <div id="kaffarat-card-yamin" className="themed-card p-5 rounded-xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: theme.textColor }}>
                    <i className="fa-solid fa-hand-sparkles text-blue-500"></i> 
                    <span>{isEn ? 'Oath Expiation (Kaffarat al-Yamin)' : 'كفارة اليمين'}</span>
                </h3>
                <p className="text-xs mb-4 opacity-80" style={{ color: theme.textColor }}>
                    {isEn 
                        ? 'Obligatory upon breaking an unfulfilled oath. It consists of feeding ten needy persons with the average food you feed your families.' 
                        : 'تجب عند الحنث في اليمين (الرجوع عن حلف). وهي إطعام عشرة مساكين من أوسط ما تطعمون أهليكم.'}
                </p>
                
                <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1">
                        <span className="text-sm font-bold opacity-80" style={{ color: theme.textColor }}>
                            {isEn ? 'Cost of One Meal' : 'تكلفة الوجبة الواحدة'}
                        </span>
                        <span className="text-[11px] opacity-70 font-normal">
                            {isEn ? 'Average cost of a satisfying meal' : 'متوسط قيمة وجبة مشبعة'}
                        </span>
                    </div>
                    <input 
                        type="number" 
                        placeholder={isEn ? 'Meal cost' : 'التكلفة'} 
                        value={yaminFeedingCost} 
                        onChange={e => setYaminFeedingCost(e.target.value)} 
                        className="w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all text-sm font-bold" 
                        style={inputStyle} 
                    />
                </div>
                
                <div className="mt-4 p-4 rounded-lg bg-blue-500/10 flex justify-between items-center" style={{ borderColor: cardBorderColor, borderWidth: '1px', borderStyle: 'solid' }}>
                    <span className="font-bold opacity-90" style={{ color: theme.textColor }}>
                        {isEn ? 'Total Oath Expiation (10 Persons): ' : 'إجمالي كفارة اليمين (10 مساكين): '}
                    </span>
                    <span className="text-2xl font-black text-blue-500">
                        {yaminTotal > 0 ? yaminTotal.toFixed(2) : '0.00'}
                    </span>
                </div>
            </div>

            <div id="kaffarat-card-notes" className={`p-4 rounded-xl bg-black/5 dark:bg-white/5 text-xs opacity-70 ${isEn ? 'text-left' : 'text-center'}`} style={{ color: theme.textColor, borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                {isEn 
                    ? '* Note: The primary Islamic ruling for Kaffarat and Fidyah is to distribute actual staple food (rice, wheat, dates) in the amount of a Mudd or half-Sa\' depending on the school of jurisprudence. Cash value is permitted by a group of scholars to facilitate relief for the poor.' 
                    : '* ملاحظة: الأصل في الكفارات والفدية هو إخراج الطعام عيناً (أرز، قمح، تمر) بمقدار مد أو نصف صاع حسب المذهب، وتجوز القيمة النقدية عند جماعة من أهل العلم تيسيراً على الفقراء.'}
            </div>
        </div>
    );
};

export default KaffaratCalculator;
