import React, { useState, useEffect } from 'react';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import { gregorianMonths, hijriMonths } from '../data/calendarData';

const ARABIC_TO_ENGLISH_NUMERALS = { '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9' };

// --- Helper Functions ---
// FIX: Correctly convert digits to numbers for array indexing.
function toArabicNumerals(num) {
    if (num === null || num === undefined) return '';
    return String(num).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
}

function toEnglishNumerals(str) {
    if (str === null || str === undefined) return '';
    let result = str.toString();
    for (const [arabic, english] of Object.entries(ARABIC_TO_ENGLISH_NUMERALS)) {
        result = result.split(arabic).join(english);
    }
    return result;
}

function gregorianToHijri(year, month, day) {
    const parsedYear = parseInt(toEnglishNumerals(year), 10);
    const parsedMonth = parseInt(month, 10);
    const parsedDay = parseInt(toEnglishNumerals(day), 10);
    if (isNaN(parsedYear) || isNaN(parsedMonth) || isNaN(parsedDay) || parsedYear < 622) return 'تاريخ غير صالح';
    try {
        const date = new Date(parsedYear, parsedMonth - 1, parsedDay);
        date.setHours(12, 0, 0, 0);
        return new Intl.DateTimeFormat('ar-SA-islamic', {
            day: 'numeric', month: 'long', year: 'numeric', calendar: 'islamic-umalqura', timeZone: 'Asia/Riyadh'
        }).format(date).replace(/هـ/, '').trim() + ' هـ';
    } catch (e) { return 'خطأ في التحويل'; }
}

function hijriToGregorian(hy, hm, hd) {
    const targetHy = parseInt(toEnglishNumerals(hy), 10);
    const targetHm = parseInt(hm, 10);
    const targetHd = parseInt(toEnglishNumerals(hd), 10);
    if (isNaN(targetHy) || isNaN(targetHm) || isNaN(targetHd) || targetHy < 1) return 'تاريخ هجري غير صالح';
    
    try {
         const estimatedGy = Math.floor(targetHy * 0.97 + 620);
         const searchStartDate = new Date(estimatedGy, 0, 1);
         searchStartDate.setHours(12, 0, 0, 0);
         
         const testFormatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', calendar: 'islamic-umalqura', timeZone: 'UTC' });
         
         for (let i = 0; i < 2000; i++) { 
            const tempDate = new Date(searchStartDate);
            tempDate.setDate(tempDate.getDate() + i);
            tempDate.setHours(12, 0, 0, 0);
            
            try {
                const parts = testFormatter.formatToParts(tempDate).filter(p => p.type !== 'literal');
                const hYear = parseInt(parts.find(p => p.type === 'year')?.value, 10);
                const hMonth = parseInt(parts.find(p => p.type === 'month')?.value, 10);
                const hDay = parseInt(parts.find(p => p.type === 'day')?.value, 10);

                if (hYear === targetHy && hMonth === targetHm && hDay === targetHd) {
                    return new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }).format(tempDate).replace(/,/g, '').trim() + ' م';
                }
            } catch(e) { continue; }
         }
        return 'لم يتم العثور على التاريخ المقابل';
    } catch (e) { return 'خطأ في التحويل'; }
}


// --- Component ---
function HijriCalendar({ onBack }) {
    const { theme, themeKey } = useTheme();
    
    const isBlackAndWhite = themeKey === 'black_and_white';
    const primaryColor = isBlackAndWhite ? '#FFFFFF' : theme.palette[0];
    const secondaryColor = isBlackAndWhite ? '#FFFFFF' : theme.palette[1];
    
    const [activeTab, setActiveTab] = useState('hijriToGregorian');
    const [result, setResult] = useState('');
    const [message, setMessage] = useState('أدخل التاريخ الهجري للتحويل');
    
    const [currentDates, setCurrentDates] = useState({
        gregorian: { dayOfWeek: '', day: 1, month: '', year: 2024, monthId: 1 },
        hijri: { day: 1, month: '', year: 1445, monthId: 1 }
    });

    const [inputs, setInputs] = useState({
        gDay: 1, gMonth: 1, gYear: '2024',
        hDay: 1, hMonth: 1, hYear: '1445'
    });

    const [historicalEvent, setHistoricalEvent] = useState(null);

    const historicalEvents = [
        {
            title: "الهجرة النبوية الشريفة",
            hijriYear: "1 هـ",
            gregorianYear: "622 م",
            description: "هجرة النبي محمد ﷺ من مكة إلى المدينة المنورة (يثرب). تعتبر نقطة التحول الكبرى في التاريخ الإسلامي، حيث تأسست أول دولة إسلامية، وبها بدأ التأريخ الهجري الذي اعتمده عمر بن الخطاب رضي الله عنه."
        },
        {
            title: "غزوة بدر الكبرى",
            hijriYear: "2 هـ",
            gregorianYear: "624 م",
            description: "أول معركة فاصلة في تاريخ الإسلام. التقى فيها المسلمون (313 مقاتل) بجيش قريش (1000 مقاتل). انتهت بنصر مؤزر للمسلمين، مما عزز مكانة الدولة الإسلامية الناشئة في شبه الجزيرة العربية."
        },
        {
            title: "غزوة الخندق (الأحزاب)",
            hijriYear: "5 هـ",
            gregorianYear: "627 م",
            description: "حصار ضربته قبائل العرب واليهود (الأحزاب) على المدينة. أشار سلمان الفارسي بحفر خندق لحماية المدينة. انتهى الحصار بهزيمة الأحزاب بفضل الله ثم الرياح الشديدة التي اقتلعت خيامهم."
        },
        {
            title: "صلح الحديبية",
            hijriYear: "6 هـ",
            gregorianYear: "628 م",
            description: "معاهدة سلام بين المسلمين وقريش لمدة 10 سنوات. رغم شروطها التي بدت مجحفة ظاهرياً، اعتبرها القرآن 'فتحاً مبيناً' لأنها أتاحت للمسلمين نشر الدعوة بأمان وتفرغوا لدعوة القبائل والملوك."
        },
        {
            title: "فتح مكة",
            hijriYear: "8 هـ",
            gregorianYear: "630 م",
            description: "دخول النبي ﷺ مكة بجيش قوامه 10 آلاف مقاتل دون إراقة دماء بعد نقض قريش لصلح الحديبية. تم تطهير الكعبة من الأصنام، وأعلن النبي العفو العام قائلاً: 'اذهبوا فأنتم الطلقاء'."
        },
        {
            title: "حجة الوداع ووفاة النبي ﷺ",
            hijriYear: "10-11 هـ",
            gregorianYear: "632 م",
            description: "الحجة الوحيدة التي أداها النبي ﷺ وألقى فيها خطبته الشهيرة التي أرست مبادئ حقوق الإنسان والمساواة. وفي العام التالي توفي النبي ﷺ، وبدأت الخلافة الراشدة باختيار أبي بكر الصديق."
        },
        {
            title: "معركة اليرموك",
            hijriYear: "15 هـ",
            gregorianYear: "636 م",
            description: "معركة حاسمة بقيادة خالد بن الوليد ضد الإمبراطورية البيزنطية. استمرت 6 أيام وانتهت بانتصار ساحق للمسلمين، مما أدى إلى إنهاء السيطرة الرومانية على بلاد الشام وفتح أبواب القدس."
        },
        {
            title: "معركة القادسية",
            hijriYear: "15 هـ",
            gregorianYear: "636 م",
            description: "من أهم المعارك في التاريخ الإسلامي بقيادة سعد بن أبي وقاص ضد الإمبراطورية الساسانية (الفرس). استمرت 4 أيام وانتهت بانتصار المسلمين وسقوط عاصمة الفرس المدائن لاحقاً."
        },
        {
            title: "فتح مصر",
            hijriYear: "20 هـ",
            gregorianYear: "641 م",
            description: "دخول الإسلام إلى مصر بقيادة عمرو بن العاص في عهد عمر بن الخطاب. تم بناء مدينة الفسطاط وإنشاء جامع عمرو بن العاص، أول مسجد في إفريقيا، وأصبحت مصر ولاية إسلامية."
        },
        {
            title: "فتح الأندلس",
            hijriYear: "92 هـ",
            gregorianYear: "711 م",
            description: "عبور طارق بن زياد مضيق جبل طارق بجيش إسلامي، تلاه موسى بن نصير. تم فتح شبه الجزيرة الأيبيرية وبدأت حضارة إسلامية عظيمة في الأندلس استمرت لقرابة 8 قرون أضاءت أوروبا بعلومها."
        },
        {
            title: "معركة بلاط الشهداء (تور-بواتييه)",
            hijriYear: "114 هـ",
            gregorianYear: "732 م",
            description: "معركة وقعت في فرنسا بين جيش المسلمين بقيادة عبد الرحمن الغافقي وقوات الفرنجة. استشهد فيها الغافقي وتوقف التمدد الإسلامي في غرب أوروبا عند هذا الحد."
        },
        {
            title: "تأسيس مدينة بغداد",
            hijriYear: "145 هـ",
            gregorianYear: "762 م",
            description: "بناء الخليفة العباسي أبو جعفر المنصور لمدينة بغداد (مدينة السلام) لتكون عاصمة الخلافة العباسية. أصبحت لاحقاً أكبر مركز علمي وثقافي وتجاري في العالم خلال العصر الذهبي للإسلام."
        },
        {
            title: "تأسيس الجامع الأزهر",
            hijriYear: "359 هـ",
            gregorianYear: "970 م",
            description: "بناء الجامع الأزهر في القاهرة على يد جوهر الصقلي بأمر من الخليفة الفاطمي المعز لدين الله. تحول لاحقاً إلى أقدم جامعة إسلامية مستمرة في العالم ومنارة للعلوم الشرعية والعربية."
        },
        {
            title: "معركة ملاذكرد",
            hijriYear: "463 هـ",
            gregorianYear: "1071 م",
            description: "انتصار حاسم للسلاجقة بقيادة السلطان ألب أرسلان على الإمبراطورية البيزنطية. أدت المعركة إلى أسر الإمبراطور البيزنطي وفتحت أبواب الأناضول (تركيا الحالية) أمام الاستيطان الإسلامي."
        },
        {
            title: "معركة حطين",
            hijriYear: "583 هـ",
            gregorianYear: "1187 م",
            description: "معركة فاصلة بقيادة صلاح الدين الأيوبي ضد الصليبيين. تم فيها تدمير الجيش الصليبي وأسر ملك القدس، مما مهد الطريق لاستعادة المسلمين لمدينة القدس بعد 88 عاماً من الاحتلال الصليبي."
        },
        {
            title: "سقوط بغداد",
            hijriYear: "656 هـ",
            gregorianYear: "1258 م",
            description: "اجتياح المغول بقيادة هولاكو لعاصمة الخلافة العباسية بغداد. تم تدمير المدينة وقتل الخليفة ومئات الآلاف من سكانها، وحرق مكتبة بغداد العظيمة، مما شكل صدمة كبرى للعالم الإسلامي."
        },
        {
            title: "معركة عين جالوت",
            hijriYear: "658 هـ",
            gregorianYear: "1260 م",
            description: "معركة مصيرية في فلسطين بقيادة السلطان المظفر قطز والظاهر بيبرس. تم فيها إلحاق أول هزيمة حاسمة بجيش المغول، مما أوقف زحفهم وأنقذ مصر والعالم الإسلامي من الدمار الشامل."
        },
        {
            title: "فتح القسطنطينية",
            hijriYear: "857 هـ",
            gregorianYear: "1453 م",
            description: "نجاح السلطان العثماني محمد الفاتح في فتح عاصمة الإمبراطورية البيزنطية بعد حصار دام 53 يوماً. تحقق بذلك حديث النبي ﷺ، وتم تحويل اسمها إلى 'إسلام بول' (إسطنبول) لتصبح عاصمة الخلافة العثمانية."
        },
        {
            title: "سقوط غرناطة",
            hijriYear: "897 هـ",
            gregorianYear: "1492 م",
            description: "تسليم أبو عبد الله الصغير، آخر ملوك المسلمين في الأندلس، مفاتيح مدينة غرناطة للملكين الكاثوليكيين فرناندو وإيزابيلا. وبذلك انتهى الوجود السياسي الإسلامي في شبه الجزيرة الأيبيرية."
        },
        {
            title: "معركة وادي المخازن (معركة الملوك الثلاثة)",
            hijriYear: "986 هـ",
            gregorianYear: "1578 م",
            description: "معركة كبرى في المغرب انتصر فيها الجيش المغربي بقيادة عبد الملك السعدي على الجيش البرتغالي الصليبي. أدت المعركة إلى انهيار الإمبراطورية البرتغالية وحماية شمال إفريقيا من الاحتلال."
        }
    ];

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * historicalEvents.length);
        setHistoricalEvent(historicalEvents[randomIndex]);
        
        const date = new Date();
        const locale = 'ar-SA';
        const gDayOfWeek = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
        const gDay = date.getDate();
        const gMonthId = date.getMonth() + 1;
        const gMonth = gregorianMonths.find(m => m.id === gMonthId)?.name || '';
        const gYear = date.getFullYear();

        let hDay = 1, hMonthId = 1, hYear = 1446;
        try {
             const hijriParts = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', { year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(date).filter(p => p.type !== 'literal');
             hYear = parseInt(hijriParts.find(p => p.type === 'year')?.value, 10);
             hMonthId = parseInt(hijriParts.find(p => p.type === 'month')?.value, 10);
             hDay = parseInt(hijriParts.find(p => p.type === 'day')?.value, 10);
        } catch (e) { console.warn("Could not get Hijri date automatically.", e); }
        
        const hMonthName = hijriMonths.find(m => m.id === hMonthId)?.name || '';
        
        const newDates = {
            gregorian: { dayOfWeek: gDayOfWeek, day: gDay, month: gMonth, year: gYear, monthId: gMonthId },
            hijri: { day: hDay, month: hMonthName, year: hYear, monthId: hMonthId }
        };

        setCurrentDates(newDates);
        setInputs({
            gDay: newDates.gregorian.day, gMonth: newDates.gregorian.monthId, gYear: String(newDates.gregorian.year),
            hDay: newDates.hijri.day, hMonth: newDates.hijri.monthId, hYear: String(newDates.hijri.year)
        });

    }, []);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setResult('');
        setMessage(tab === 'gregorianToHijri' ? 'أدخل التاريخ الميلادي للتحويل' : 'أدخل التاريخ الهجري للتحويل');
    };

    const handleInputChange = (key, value) => {
        setInputs(prev => ({ ...prev, [key]: value.replace(/[^0-9٠-٩]/g, '') }));
    };

    const handleSelectChange = (key, value) => {
        setInputs(prev => ({ ...prev, [key]: parseInt(value, 10) }));
    };

    const handleConversion = () => {
        let convResult = '', convMsg = '';
        if (activeTab === 'gregorianToHijri') {
            convResult = gregorianToHijri(inputs.gYear, inputs.gMonth, inputs.gDay);
            convMsg = 'النتيجة (تقويم أم القرى):';
        } else {
            convResult = hijriToGregorian(inputs.hYear, inputs.hMonth, inputs.hDay);
            convMsg = 'النتيجة (الموافق ميلادي):';
        }
        if (convResult.includes('خطأ') || convResult.includes('صالح') || convResult.includes('العثور')) {
            convMsg = '⚠️ تنبيه:';
        }
        setResult(convResult);
        setMessage(convMsg);
    };
    
    const renderSelect = (value, options, key) => {
        return (
            <div className="relative flex-1">
                <select 
                    value={value} 
                    onChange={(e) => handleSelectChange(key, e.target.value)}
                    className="w-full appearance-none px-2 py-3 rounded-xl text-center font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 themed-card"
                >
                   {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>
        );
    };

    const renderYearInput = (value, key, placeholder) => {
        return (
             <div className="relative flex-1">
                <input 
                    type="text" 
                    value={toArabicNumerals(value)} 
                    onInput={(e) => handleInputChange(key, (e.target as HTMLInputElement).value)} 
                    inputMode="numeric" 
                    placeholder={toArabicNumerals(placeholder)} 
                    className="w-full px-3 py-3 rounded-xl text-center font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 themed-card" 
                    maxLength={4}
                />
            </div>
        );
    };
    
    const gDays = Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: toArabicNumerals(i + 1) }));
    const hDays = Array.from({ length: 30 }, (_, i) => ({ value: i + 1, label: toArabicNumerals(i + 1) }));
    const gMonthsOpts = gregorianMonths.map(m => ({ value: m.id, label: m.name }));
    const hMonthsOpts = hijriMonths.map(m => ({ value: m.id, label: m.name }));

    return (
        <div className={`h-screen flex flex-col bg-transparent`}>
            <header className="app-top-bar">
                <div className="app-top-bar__inner">
                    <h1 className="app-top-bar__title text-xl sm:text-2xl font-kufi">التقويم الهجري الذكي</h1>
                    <p className="app-top-bar__subtitle">حوّل بين التاريخين الهجري والميلادي بسرعة مع عرض يومي دقيق</p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-4 py-2 flex flex-col items-center pb-24">
                 <div className={`w-full max-w-lg p-3 sm:p-4 rounded-2xl themed-card text-center mb-4 shrink-0`}>
                    <p className={`text-xs themed-text-muted mb-1`}>تاريخ اليوم:</p>
                    <p className={`text-base sm:text-lg font-extrabold mb-1`} style={{color: primaryColor}}>
                        {currentDates.gregorian.dayOfWeek}، {toArabicNumerals(currentDates.gregorian.day)} {currentDates.gregorian.month} {toArabicNumerals(currentDates.gregorian.year)}
                    </p>
                    <div className="border-t themed-text-muted/30 my-2"></div>
                    <p className={`text-xl sm:text-2xl font-extrabold`} style={{color: secondaryColor}}>
                        {toArabicNumerals(currentDates.hijri.day)} {currentDates.hijri.month} {toArabicNumerals(currentDates.hijri.year)} هـ
                    </p>
                </div>
                
                <div className={`w-full max-w-lg flex p-1 rounded-xl themed-bg-alt mb-4 text-sm shrink-0`}>
                    <button onClick={() => handleTabChange('hijriToGregorian')} className={`flex-1 py-2 sm:py-3 px-1 text-center rounded-lg font-bold transition-all ${activeTab === 'hijriToGregorian' ? `shadow-md text-white` : `themed-text-muted`}`} style={activeTab === 'hijriToGregorian' ? {backgroundColor: secondaryColor, color: isBlackAndWhite ? '#000' : '#FFF'} : {}}>هجري إلى ميلادي</button>
                    <button onClick={() => handleTabChange('gregorianToHijri')} className={`flex-1 py-2 sm:py-3 px-1 text-center rounded-lg font-bold transition-all ${activeTab === 'gregorianToHijri' ? `shadow-md text-white` : `themed-text-muted`}`} style={activeTab === 'gregorianToHijri' ? {backgroundColor: secondaryColor, color: isBlackAndWhite ? '#000' : '#FFF'} : {}}>ميلادي إلى هجري</button>
                </div>

                <div className="w-full max-w-lg flex flex-col justify-start">
                    <div className="space-y-3 sm:space-y-4">
                        {activeTab === 'gregorianToHijri' ? (
                            <div className="flex gap-2 input-section">
                                {renderSelect(inputs.gDay, gDays, 'gDay')}
                                {renderSelect(inputs.gMonth, gMonthsOpts, 'gMonth')}
                                {renderYearInput(inputs.gYear, 'gYear', currentDates.gregorian.year)}
                            </div>
                        ) : (
                            <div className="flex gap-2 input-section">
                                {renderSelect(inputs.hDay, hDays, 'hDay')}
                                {renderSelect(inputs.hMonth, hMonthsOpts, 'hMonth')}
                                {renderYearInput(inputs.hYear, 'hYear', currentDates.hijri.year)}
                            </div>
                        )}
                        <div className="pt-1">
                            <button onClick={handleConversion} className="w-full rounded-full font-extrabold cursor-pointer transform active:translate-y-1 active:shadow-none focus:outline-none overflow-hidden py-3 px-4 text-lg" style={{ background: isBlackAndWhite ? '#FFFFFF' : `linear-gradient(to top, ${theme.palette[0]} 0%, ${theme.palette[1]} 100%)`, color: isBlackAndWhite ? '#000000' : '#FFF', boxShadow: isBlackAndWhite ? 'none' : `0 4px 0 0 ${theme.palette[0]}CC, 0 8px 15px rgba(0,0,0,0.3)`, borderBottom: isBlackAndWhite ? 'none' : `4px solid ${theme.palette[0]}CC` }}>
                                {activeTab === 'gregorianToHijri' ? "تحويل إلى هجري" : "تحويل إلى ميلادي"}
                            </button>
                        </div>
                        <div className={`w-full p-4 sm:p-6 rounded-xl text-center font-extrabold themed-card min-h-[90px] flex flex-col justify-center mb-6`}>
                            <p className={`text-xs themed-text-muted mb-1`}>{message}</p>
                            <p className={`text-2xl sm:text-3xl leading-tight`} style={{color: primaryColor}}>{result || '---'}</p>
                        </div>

                        {historicalEvent && (
                            <div className="themed-card p-5 rounded-2xl border-r-4 shadow-lg fade-in mb-4" style={{ borderRightColor: secondaryColor }}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: isBlackAndWhite ? '#333' : theme.palette[1] + '20', color: secondaryColor }}>
                                        <i className="fa-solid fa-clock-rotate-left text-lg"></i>
                                    </div>
                                    <h3 className="font-bold text-lg" style={{ color: secondaryColor }}>حدث تاريخي عظيم</h3>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-extrabold" style={{ color: primaryColor }}>{historicalEvent.title}</h4>
                                    <div className="flex gap-4 text-sm font-bold themed-text-muted">
                                        <span><i className="fa-solid fa-calendar-check ml-1"></i> {historicalEvent.hijriYear}</span>
                                        <span><i className="fa-solid fa-calendar-day ml-1"></i> {historicalEvent.gregorianYear}</span>
                                    </div>
                                    <p className="text-sm leading-relaxed font-amiri themed-text-muted pt-2 border-t border-black/5 dark:border-white/5">
                                        {historicalEvent.description}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <BottomBar onHomeClick={onBack} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
}

export default HijriCalendar;