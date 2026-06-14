
import React, { useState, useEffect, useRef } from 'react';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import ThemePageLock from '../components/ThemePageLock';
import { baseAthkar, specialZikr, prayerOptions, fajrDhikr, fajrMaghribDhikr } from '../data/athkarAlSalahData';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { motion, AnimatePresence } from 'motion/react';
import { shareAsImage } from '../utils/shareAsImage';

const SalahZikrCard = ({ zikr, theme, onDecrement, onZoom, setToastMessage }: { zikr: any; theme: any; onDecrement: () => void; onZoom: () => void; setToastMessage: (msg: string) => void }) => {
    const [isFav, setIsFav] = useState(false);
    const isFinished = zikr.currentCount === 0;
    const textClass = zikr.isQuran ? 'font-amiri text-2xl text-center leading-relaxed' : 'text-lg leading-loose font-medium';

    useEffect(() => {
        const favs = JSON.parse(localStorage.getItem('favorite_dhikr') || '[]');
        setIsFav(favs.includes(zikr.text));
    }, [zikr.text]);

    const toggleFav = (e: React.MouseEvent) => {
        e.stopPropagation();
        const favs = JSON.parse(localStorage.getItem('favorite_dhikr') || '[]');
        let newFavs;
        if (isFav) {
            newFavs = favs.filter((t: string) => t !== zikr.text);
        } else {
            newFavs = [...favs, zikr.text];
        }
        localStorage.setItem('favorite_dhikr', JSON.stringify(newFavs));
        setIsFav(!isFav);
    };

    return (
        <div className={`themed-card p-5 pb-2 rounded-2xl border relative overflow-hidden group mb-4 transition-all duration-300 ${isFinished ? 'opacity-60' : ''}`} onClick={onDecrement}>
            <div className="flex justify-between items-start mb-2">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold shadow-sm" style={{backgroundColor: theme.palette[1]+'30', color: theme.palette[1]}}>{zikr.note}</span>
                <div className={`count-badge w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md transform transition-transform`} style={isFinished ? {backgroundColor: 'var(--badge-finished-bg)', color: 'var(--badge-finished-text)'} : {backgroundImage: `linear-gradient(to bottom right, ${theme.palette[0]}, ${theme.palette[1]})`, color: theme.textColor}}>
                    {isFinished ? <i className="fa-solid fa-check"></i> : zikr.currentCount}
                </div>
            </div>
            {zikr.title && <h3 className="text-center font-bold mb-2 text-sm" style={{color: theme.palette[1]}}>{zikr.title}</h3>}
            <div className={`${textClass} select-none`} dangerouslySetInnerHTML={{ __html: zikr.text }}></div>
            
            <div className="flex justify-between items-center mt-4 mb-3 pt-3 border-t border-black/5 dark:border-white/5">
                <button onClick={toggleFav} className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors">
                    <i className={`fa-heart ${isFav ? 'fa-solid text-red-500' : 'fa-regular text-gray-500 dark:text-gray-400'}`}></i>
                </button>
                <div className="flex gap-2">
                   <button onClick={(e) => { e.stopPropagation(); onZoom(); }} className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors text-gray-600 dark:text-gray-300">
                       <i className="fa-solid fa-magnifying-glass-plus"></i>
                   </button>
                   <button onClick={(e) => {
                       e.stopPropagation();
                       const tempDiv = document.createElement("div");
                       tempDiv.innerHTML = zikr.text;
                       navigator.clipboard.writeText(tempDiv.textContent || tempDiv.innerText || "");
                   }} className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors text-gray-600 dark:text-gray-300">
                       <i className="fa-regular fa-copy"></i>
                   </button>
                   <button onClick={async (e) => {
                       e.stopPropagation();
                       await shareAsImage({
                           text: zikr.text,
                           source: zikr.note,
                           category: zikr.title || 'أذكار الصلاة',
                           theme,
                           setToastMessage
                       });
                   }} className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors text-gray-600 dark:text-gray-300">
                       <i className="fa-solid fa-share-nodes"></i>
                   </button>
                </div>
            </div>

            {!isFinished && <div className="absolute inset-0 opacity-0 group-active:opacity-100 transition pointer-events-none" style={{backgroundColor: theme.palette[0]+'15'}}></div>}
        </div>
    );
};

function AthkarAlSalah({ onBack, onNavigate }) {
    const { theme, themeKey } = useTheme();
    const isBlackTheme = theme.bgColor === '#000000';
    const [currentPrayer, setCurrentPrayer] = useState(null);
    const [athkarList, setAthkarList] = useState([]);
    const [zoomedZikr, setZoomedZikr] = useState(null);
    const [toastMessage, setToastMessage] = useState('');
    const [isFavoritesView, setIsFavoritesView] = useState(false);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuOpenDirection, setMenuOpenDirection] = useState('up');
    const fabRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const loadFavs = () => {
            const favs = JSON.parse(localStorage.getItem('favorite_dhikr') || '[]');
            setFavorites(favs);
        };
        loadFavs();
        window.addEventListener('storage', loadFavs);
        return () => window.removeEventListener('storage', loadFavs);
    }, []);

    useEffect(() => {
        const interceptor = () => {
            if (zoomedZikr) {
                setZoomedZikr(null);
                return true;
            }
            if (isFavoritesView) {
                setIsFavoritesView(false);
                return true;
            }
            if (currentPrayer) {
                setCurrentPrayer(null);
                return true;
            }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [zoomedZikr, currentPrayer]);

    const handleFabClick = () => {
        if (!isMenuOpen && fabRef.current) {
            const rect = fabRef.current.getBoundingClientRect();
            if (rect.top < window.innerHeight / 2) {
                setMenuOpenDirection('down');
            } else {
                setMenuOpenDirection('up');
            }
        }
        setIsMenuOpen(!isMenuOpen);
    };

    const openPrayer = (prayerId, titleText) => {
        let currentAthkarData = JSON.parse(JSON.stringify(baseAthkar));

        // Handle common Fajr/Maghrib changes
        if (prayerId === 'fajr' || prayerId === 'maghrib') {
            // Change Mu'awwidhat count to 3
            currentAthkarData.forEach(z => {
                if (['ikhlas', 'falaq', 'naas'].includes(z.id)) {
                    z.count = 3;
                    z.note = "3 مرات";
                }
            });
            
            // Add 10x Tahleel before tasbeeh
            const tasbeehIndex = currentAthkarData.findIndex(z => z.id === 'tasbeeh');
            if (tasbeehIndex !== -1) {
                currentAthkarData.splice(tasbeehIndex, 0, specialZikr);
            }
        }
        
        // Find index to insert prayer-specific athkar
        const afterEveryPrayerIndex = currentAthkarData.findIndex(z => z.id === 'after_every_prayer');

        if (afterEveryPrayerIndex !== -1) {
            if (prayerId === 'fajr') {
                // Insert for Fajr prayer. Splicing in reverse order of appearance to maintain order.
                currentAthkarData.splice(afterEveryPrayerIndex + 1, 0, fajrMaghribDhikr);
                currentAthkarData.splice(afterEveryPrayerIndex + 1, 0, fajrDhikr);
            } else if (prayerId === 'maghrib') {
                // Insert for Maghrib prayer
                currentAthkarData.splice(afterEveryPrayerIndex + 1, 0, fajrMaghribDhikr);
            }
        }

        const listWithCounts = currentAthkarData.map(z => ({ ...z, currentCount: z.count }));
        setAthkarList(listWithCounts);
        setCurrentPrayer({ id: prayerId, title: titleText });
    };

    const handleDecrement = (zikrId) => {
        setAthkarList(prevList =>
            prevList.map(zikr =>
                zikr.id === zikrId && zikr.currentCount > 0
                    ? { ...zikr, currentCount: zikr.currentCount - 1 }
                    : zikr
            )
        );
    };

    const handleHomeClick = () => {
        if (zoomedZikr) {
            setZoomedZikr(null);
        } else if (isFavoritesView) {
            setIsFavoritesView(false);
        } else if (currentPrayer) {
            setCurrentPrayer(null);
        } else {
            onBack();
        }
    };

    const allPossibleAthkar = [
        ...baseAthkar,
        specialZikr,
        fajrDhikr,
        fajrMaghribDhikr
    ];
    const favoriteAthkar = allPossibleAthkar.filter(z => favorites.includes(z.text)).map(z => ({ ...z, currentCount: z.count }));

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-transparent">
            <header className="app-top-bar">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full">
                        <div className="absolute left-0">
                            <ThemePageLock />
                        </div>
                        <h1 className="app-top-bar__title text-2xl font-kufi">
                            {currentPrayer ? currentPrayer.title : (isFavoritesView ? "الأذكار المفضلة" : "أذكار الصلوات")}
                        </h1>
                    </div>
                    <p className="app-top-bar__subtitle px-4">
                        {currentPrayer 
                            ? `أذكار ما بعد صلاة ${currentPrayer.title.split(' ')[2] || currentPrayer.title}` 
                            : (isFavoritesView ? "أذكارك التي اخترتها للوصول السريع" : "أذكار ما بعد الصلاة مع عدّاد تفاعلي وتنقل سهل بين")}
                    </p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto hide-scrollbar relative max-w-md mx-auto w-full px-4 pb-4 flex flex-col">
                {isFavoritesView ? (
                    <div className="space-y-4">
                        {favoriteAthkar.length > 0 ? (
                            <>
                                {favoriteAthkar.map(zikr => (
                                    <SalahZikrCard 
                                        key={zikr.id} 
                                        zikr={zikr} 
                                        theme={theme} 
                                        onDecrement={() => {}} 
                                        onZoom={() => setZoomedZikr(zikr)} 
                                        setToastMessage={setToastMessage}
                                    />
                                ))}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 opacity-50 text-center">
                                <i className="fa-solid fa-heart text-5xl mb-4"></i>
                                <p className="font-bold">لا توجد أذكار مفضلة لعرضها حالياً</p>
                            </div>
                        )}
                    </div>
                ) : !currentPrayer ? (
                    <>
                        <div id="prayersMenu" className="space-y-4">
                            {prayerOptions.map(prayer => (
                                 <div key={prayer.id} onClick={() => openPrayer(prayer.id, `أذكار ${prayer.title}`)} 
                                      className={`themed-card p-4 rounded-xl shadow-sm border-r-4 flex items-center justify-between cursor-pointer active:scale-95 transition`}
                                      style={{ borderRightColor: prayer.color === 'primary' ? theme.palette[0] : theme.palette[1] }}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${themeKey === 'default' ? 'shadow-inner border border-black/5' : ''}`} 
                                             style={{
                                                 backgroundColor: themeKey === 'default' ? '#FFFFFF' : (prayer.color === 'primary' ? theme.palette[0]+'20' : theme.palette[1]+'20'), 
                                                 color: themeKey === 'default' ? '#000000' : (prayer.color === 'primary' ? theme.palette[0] : theme.palette[1])
                                             }}>
                                            <i className={`fa-solid ${prayer.icon} text-xl`}></i>
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-lg">{prayer.title}</h2>
                                        </div>
                                    </div>
                                    <i className="fa-solid fa-angle-left themed-text-muted"></i>
                                </div>
                            ))}
                        </div>
                        <div className="mt-auto pt-6">
                            <div 
                                className="themed-card p-4 rounded-xl border-t-4"
                                style={{ borderColor: theme.palette[0] }}
                            >
                                <h3 className="font-bold text-sm mb-3 text-center" style={{ color: theme.palette[1] }}>
                                    <i className="fa-solid fa-mosque text-xs ml-2"></i> سنن الصلوات (الرواتب)
                                </h3>
                                <div className="space-y-2 text-sm font-amiri themed-text-muted" dir="rtl">
                                    <div className="flex justify-between border-b border-card-border pb-1">
                                        <span>صلاة الفجر:</span>
                                        <span className="font-bold">2 ركعة قبلية</span>
                                    </div>
                                    <div className="flex justify-between border-b border-card-border pb-1">
                                        <span>صلاة الظهر:</span>
                                        <span className="font-bold">4 قبلية و 2 بعدية</span>
                                    </div>
                                    <div className="flex justify-between border-b border-card-border pb-1">
                                        <span>صلاة العصر:</span>
                                        <span className="opacity-60 italic">ليس لها سنة راتبة</span>
                                    </div>
                                    <div className="flex justify-between border-b border-card-border pb-1">
                                        <span>صلاة المغرب:</span>
                                        <span className="font-bold">2 ركعة بعدية</span>
                                    </div>
                                    <div className="flex justify-between border-b border-card-border pb-1">
                                        <span>صلاة العشاء:</span>
                                        <span className="font-bold">2 ركعة بعدية</span>
                                    </div>
                                    <div className="pt-2 text-center font-bold" style={{ color: theme.palette[0] }}>
                                        المجموع: 12 ركعة في اليوم
                                    </div>
                                </div>
                                <div className="flex justify-center mt-3 pt-2 border-t border-card-border">
                                    <button 
                                        onClick={() => setZoomedZikr({
                                            title: "سنن الصلوات (الرواتب)",
                                            text: `
                                                <div class="space-y-4 text-2xl">
                                                    <div class="flex justify-between border-b border-black/10 pb-2"><span>الفجر:</span> <b>2 ركعة قبلية</b></div>
                                                    <div class="flex justify-between border-b border-black/10 pb-2"><span>الظهر:</span> <b>4 قبلية و 2 بعدية</b></div>
                                                    <div class="flex justify-between border-b border-black/10 pb-2"><span>العصر:</span> <i class="opacity-60">ليس لها سنة راتبة</i></div>
                                                    <div class="flex justify-between border-b border-black/10 pb-2"><span>المغرب:</span> <b>2 ركعة بعدية</b></div>
                                                    <div class="flex justify-between border-b border-black/10 pb-2"><span>العشاء:</span> <b>2 ركعة بعدية</b></div>
                                                </div>
                                            `,
                                            note: "الرواتب المؤكدة"
                                        })} 
                                        className="p-2 rounded-full hover:bg-card-bg-hover transition-colors"
                                    >
                                        <i className="fa-solid fa-magnifying-glass-plus text-lg themed-text-muted"></i>
                                    </button>
                                </div>
                            </div>

                            <div 
                                className="themed-card p-4 rounded-xl border-t-4 mt-4"
                                style={{ borderColor: theme.palette[1] }}
                            >
                                <h3 className="font-bold text-sm mb-3 text-center" style={{ color: theme.palette[0] }}>
                                    <i className="fa-solid fa-scroll text-xs ml-2"></i> أحاديث في فضل السنن
                                </h3>
                                <div className="space-y-4 text-sm font-amiri themed-text-muted" dir="rtl">
                                    <div className="bg-card-bg-hover p-3 rounded-lg border-r-2" style={{ borderRightColor: theme.palette[0] }}>
                                        <p className="leading-relaxed">
                                            عن أم حبيبة رضي الله عنها قالت: سمعت رسول الله ﷺ يقول: <span className="text-primary font-bold">"مَنْ صَلَّى فِي يَوْمٍ وَلَيْلَةٍ ثِنْتَيْ عَشْرَةَ رَكْعَةً بُنِيَ لَهُ بَيْتٌ فِي الْجَنَّةِ"</span>.
                                        </p>
                                        <p className="text-left text-[10px] mt-1 opacity-70">- رواه مسلم</p>
                                    </div>
                                    
                                    <div className="bg-card-bg-hover p-3 rounded-lg border-r-2" style={{ borderRightColor: theme.palette[1] }}>
                                        <p className="leading-relaxed">
                                            عن عائشة رضي الله عنها عن النبي ﷺ قال: <span className="text-secondary font-bold">"رَكْعَتَا الْفَجْرِ خَيْرٌ مِنَ الدُّنْيَا وَمَا فِيهَا"</span>.
                                        </p>
                                        <p className="text-left text-[10px] mt-1 opacity-70">- رواه مسلم</p>
                                    </div>

                                    <div className="bg-card-bg-hover p-3 rounded-lg border-r-2" style={{ borderRightColor: theme.palette[0] }}>
                                        <p className="leading-relaxed">
                                            عن ابن عمر رضي الله عنهما أن النبي ﷺ قال: <span className="text-primary font-bold">"رَحِمَ اللَّهُ امْرَأً صَلَّى قَبْلَ الْعَصْرِ أَرْبَعًا"</span>.
                                        </p>
                                        <p className="text-left text-[10px] mt-1 opacity-70">- رواه الترمذي وأبو داود</p>
                                    </div>

                                    <div className="bg-card-bg-hover p-3 rounded-lg border-r-2" style={{ borderRightColor: theme.palette[1] }}>
                                        <p className="leading-relaxed">
                                            عن أم حبيبة رضي الله عنها قالت: قال رسول الله ﷺ: <span className="text-secondary font-bold">"مَنْ حَافَظَ عَلَى أَرْبَعِ رَكَعَاتٍ قَبْلَ الظُّهْرِ وَأَرْبَعٍ بَعْدَهَا حَرَّمَهُ اللَّهُ عَلَى النَّارِ"</span>.
                                        </p>
                                        <p className="text-left text-[10px] mt-1 opacity-70">- رواه الترمذي وأبو داود</p>
                                    </div>
                                </div>
                                <div className="flex justify-center mt-3 pt-2 border-t border-card-border">
                                    <button 
                                        onClick={() => setZoomedZikr({
                                            title: "أحاديث في فضل السنن",
                                            text: `
                                                <div class="space-y-6 text-xl md:text-2xl text-right" dir="rtl">
                                                    <div class="border-b border-black/5 dark:border-white/5 pb-4 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-lg transition-colors">
                                                        <p class="leading-relaxed font-amiri">عن أم حبيبة رضي الله عنها قالت: سمعت رسول الله ﷺ يقول: <span style="color: ${theme.palette[0]}; font-weight: bold;">"مَنْ صَلَّى فِي يَوْمٍ وَلَيْلَةٍ ثِنْتَيْ عَشْرَةَ رَكْعَةً بُنِيَ لَهُ بَيْتٌ فِي الْجَنَّةِ"</span>.</p>
                                                        <p class="text-sm mt-2 opacity-60 font-sans">- رواه مسلم</p>
                                                    </div>
                                                    <div class="border-b border-black/5 dark:border-white/5 pb-4 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-lg transition-colors">
                                                        <p class="leading-relaxed font-amiri">عن عائشة رضي الله عنها عن النبي ﷺ قال: <span style="color: ${theme.palette[1]}; font-weight: bold;">"رَكْعَتَا الْفَجْرِ خَيْرٌ مِنَ الدُّنْيَا وَمَا فِيهَا"</span>.</p>
                                                        <p class="text-sm mt-2 opacity-60 font-sans">- رواه مسلم</p>
                                                    </div>
                                                    <div class="border-b border-black/5 dark:border-white/5 pb-4 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-lg transition-colors">
                                                        <p class="leading-relaxed font-amiri">عن ابن عمر رضي الله عنهما أن النبي ﷺ قال: <span style="color: ${theme.palette[0]}; font-weight: bold;">"رَحِمَ اللَّهُ امْرَأً صَلَّى قَبْلَ الْعَصْرِ أَرْبَعًا"</span>.</p>
                                                        <p class="text-sm mt-2 opacity-60 font-sans">- رواه الترمذي وأبو داود</p>
                                                    </div>
                                                    <div class="border-b border-black/5 dark:border-white/5 pb-4 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-lg transition-colors">
                                                        <p class="leading-relaxed font-amiri">عن أم حبيبة رضي الله عنها قالت: قال رسول الله ﷺ: <span style="color: ${theme.palette[1]}; font-weight: bold;">"مَنْ حَافَظَ عَلَى أَرْبَعِ رَكَعَاتٍ قَبْلَ الظُّهْرِ وَأَرْبَعٍ بَعْدَهَا حَرَّمَهُ اللَّهُ عَلَى النَّارِ"</span>.</p>
                                                        <p class="text-sm mt-2 opacity-60 font-sans">- رواه الترمذي وأبو داود</p>
                                                    </div>
                                                </div>
                                            `,
                                            note: "أحاديث صحيحة"
                                        })} 
                                        className="p-2 rounded-full hover:bg-card-bg-hover transition-colors"
                                    >
                                        <i className="fa-solid fa-magnifying-glass-plus text-lg themed-text-muted"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div id="athkarDetails" className="space-y-4">
                        {athkarList.map(zikr => (
                            <SalahZikrCard 
                                key={zikr.id} 
                                zikr={zikr} 
                                theme={theme} 
                                onDecrement={() => handleDecrement(zikr.id)} 
                                onZoom={() => setZoomedZikr(zikr)} 
                                setToastMessage={setToastMessage}
                            />
                        ))}
                    </div>
                )}
                <div className="shrink-0 w-full h-32"></div>
            </main>

            <BottomBar onHomeClick={handleHomeClick} onThemesClick={() => {}} showThemes={false} />

            {/* Floating Menu & FAB */}
            <div className="fixed bottom-20 right-4 z-[90] flex flex-col items-end">
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: menuOpenDirection === 'up' ? 20 : -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: menuOpenDirection === 'up' ? 20 : -20, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className={`absolute right-0 ${menuOpenDirection === 'up' ? 'bottom-full mb-4 origin-bottom-right' : 'top-full mt-4 origin-top-right'} themed-card rounded-2xl shadow-xl border p-2 flex flex-col gap-1 overflow-hidden w-48 z-0`}
                            style={{ borderColor: 'var(--card-border)', color: 'var(--text-color)' }}
                        >
                            <button 
                                onClick={() => { setIsFavoritesView(true); setCurrentPrayer(null); setIsMenuOpen(false); }}
                                className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${isFavoritesView ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                style={isFavoritesView ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
                            >
                                المفضلة
                                <i className="fa-solid fa-heart text-xs opacity-70"></i>
                            </button>
                            <div className="h-px bg-black/5 dark:bg-white/5 my-1 mx-2" />
                            {prayerOptions.map(prayer => (
                                <button 
                                    key={prayer.id}
                                    onClick={() => { openPrayer(prayer.id, `أذكار ${prayer.title}`); setIsMenuOpen(false); }}
                                    className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${currentPrayer?.id === prayer.id ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                    style={currentPrayer?.id === prayer.id ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
                                >
                                    {prayer.title}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <button 
                    ref={fabRef}
                    onClick={handleFabClick}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer relative z-10 ${themeKey === 'default' ? 'text-black' : (isBlackTheme ? 'text-black' : 'text-white')}`}
                    style={
                        themeKey === 'default'
                        ? { backgroundColor: '#ffffff', border: '1px solid #000000' }
                        : { backgroundColor: isBlackTheme ? '#FFFFFF' : theme.palette[0] }
                    }
                >
                    <i className={`fa-solid ${isMenuOpen ? 'fa-times' : 'fa-list-ul'} text-xl`}></i>
                </button>
            </div>

            {zoomedZikr && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex justify-center items-center p-4 backdrop-blur-sm" onClick={() => setZoomedZikr(null)}>
                    <div className="bg-modal-bg text-modal-text p-8 rounded-3xl w-full max-w-2xl text-center relative scale-in shadow-2xl border-2 border-modal-border flex flex-col max-h-[90vh]" style={{ fontFamily: theme.font }} onClick={e => e.stopPropagation()}>
                        <div className="overflow-y-auto hide-scrollbar flex-1 py-4">
                            {zoomedZikr.title && <h3 className="text-xl font-bold mb-4" style={{ color: theme.palette[1] }}>{zoomedZikr.title}</h3>}
                            <div 
                                className="text-3xl md:text-4xl leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: zoomedZikr.text }}
                            ></div>
                            {zoomedZikr.note && (
                                <p className="text-lg mt-6 font-bold" style={{ color: theme.palette[0] }}>
                                    {zoomedZikr.count !== undefined ? `التكرار المطلوب: ${zoomedZikr.note}` : zoomedZikr.note}
                                </p>
                            )}
                        </div>

                        <div className="mt-6 shrink-0">
                            <button onClick={() => setZoomedZikr(null)} className="w-full py-3 rounded-xl font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:opacity-90 transition-opacity">إغلاق</button>
                        </div>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {toastMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[101] bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 whitespace-nowrap border border-white/10"
                    >
                        <i className="fa-solid fa-spinner fa-spin text-primary" style={{ color: theme.palette[0] }}></i>
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default AthkarAlSalah;
