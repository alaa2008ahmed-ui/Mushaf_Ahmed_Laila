import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import ThemePageLock from '../components/ThemePageLock';
import { usePrayerTimes } from '../context/PrayerTimesContext';
import { VisualQibla, ARQibla, SunMoonQibla, ShadowQibla } from '../components/QiblaModes';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { useLanguage } from '../context/LanguageContext';
import { HelpCircle } from 'lucide-react';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { QIBLA_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';

// --- Helper Functions ---
const toRad = (deg: number) => deg * Math.PI / 180;
const toDeg = (rad: number) => rad * 180 / Math.PI;

function Qibla({ onBack, onNavigate }: { onBack: () => void, onNavigate: (page: string) => void }) {
    const { theme, themeKey } = useTheme();
    const { t, language } = useLanguage();
    const isEn = language === 'en';
    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود';
    const isDefaultTheme = themeKey === 'default' || !themeKey;
    const cardBorderColor = isDefaultTheme 
        ? '#000000' 
        : (isBlackTheme 
            ? '#FFFFFF' 
            : (theme.palette?.[0] || '#000000'));
    const { config, refreshLocation } = usePrayerTimes();
    const [heading, setHeading] = useState(0);
    const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
    const [isAligned, setIsAligned] = useState(false);
    const [error, setError] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeMode, setActiveMode] = useState('compass'); // compass, visual, ar, sun_moon, shadow
    const [showGuide, setShowGuide] = useState(false);
    
    useEffect(() => {
        markPageAsSeen('qibla');
        if (!getGuideSeen('qibla_page_spotlight')) {
            setShowGuide(true);
        }
    }, []);
    
    const compassCircleRef = useRef<HTMLDivElement>(null);
    const qiblaPointerRef = useRef<HTMLDivElement>(null);
    const hasVibratedRef = useRef(false);
    const [permissionStatus, setPermissionStatus] = useState('granted');

    const handleOrientation = (event: DeviceOrientationEvent) => {
        let angle: number | undefined;
        if ((event as any).webkitCompassHeading) {
            // iOS
            angle = (event as any).webkitCompassHeading;
        } else if (event.absolute && event.alpha !== null) {
            // Android absolute
            angle = (360 - event.alpha) % 360;
        } else if (event.alpha !== null) {
            // Android relative
            angle = (360 - event.alpha) % 360;
        }
        
        if (typeof angle !== 'undefined') {
            setHeading(angle);
        }
    };

    const handleRefreshLocation = async () => {
        setIsRefreshing(true);
        setError('');
        try {
            await refreshLocation();
        } catch (e) {
            setError(isEn ? 'An error occurred while updating location.' : 'حدث خطأ أثناء تحديث الموقع.');
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        // Use location from PrayerTimesContext
        if (config && config.location) {
            calculateQiblaDirection(config.location.lat, config.location.lng);
        } else {
            setError(isEn ? 'Unable to determine location from Prayer Times settings.' : 'تعذر تحديد الموقع من إعدادات مواقيت الصلاة.');
        }

        // Auto-start compass orientation on entering the page
        const startCompass = async () => {
            if (typeof (window.DeviceOrientationEvent as any)?.requestPermission === 'function') {
                try {
                    const permission = await (window.DeviceOrientationEvent as any).requestPermission();
                    if (permission === 'granted') {
                        setPermissionStatus('granted');
                        window.addEventListener('deviceorientation', handleOrientation);
                        return;
                    }
                } catch (e) {
                    // Ignore error if gesture is required; fallback to standard listeners
                }
            }

            setPermissionStatus('granted');
            if ('ondeviceorientationabsolute' in window) {
                (window as any).addEventListener('deviceorientationabsolute', handleOrientation);
            }
            (window as any).addEventListener('deviceorientation', handleOrientation);
        };

        startCompass();

        return () => {
            (window as any).removeEventListener('deviceorientation', handleOrientation);
            (window as any).removeEventListener('deviceorientationabsolute', handleOrientation);
        };
    }, [config?.location, isEn]);

    const calculateQiblaDirection = (latitude: number, longitude: number) => {
        const kaabaLat = 21.4225;
        const kaabaLng = 39.8262;

        const userLatRad = toRad(latitude);
        const kaabaLatRad = toRad(kaabaLat);
        const lngDiffRad = toRad(kaabaLng - longitude);

        const y = Math.sin(lngDiffRad) * Math.cos(kaabaLatRad);
        const x = Math.cos(userLatRad) * Math.sin(kaabaLatRad) - Math.sin(userLatRad) * Math.cos(kaabaLatRad) * Math.cos(lngDiffRad);
        
        let direction = toDeg(Math.atan2(y, x));
        direction = (direction + 360) % 360;
        
        setQiblaDirection(direction);
    };

    useEffect(() => {
        if (qiblaDirection !== null) {
            const finalRotation = qiblaDirection - heading;
            if (qiblaPointerRef.current) {
                qiblaPointerRef.current.style.transform = `rotate(${finalRotation}deg)`;
            }
            
            let diff = Math.abs(qiblaDirection - heading);
            if (diff > 180) {
                diff = 360 - diff;
            }
            const aligned = diff <= 3;
            setIsAligned(aligned);

            const perfectAligned = diff <= 1.5; // 100% precision alignment
            if (perfectAligned && !hasVibratedRef.current) {
                hasVibratedRef.current = true;
                if (Capacitor.isNativePlatform()) {
                    Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
                }
                if ('vibrate' in navigator) {
                    navigator.vibrate([150, 50, 150]);
                }
            } else if (!perfectAligned && diff > 3.5) {
                hasVibratedRef.current = false;
            }
        }

        if (compassCircleRef.current) {
             compassCircleRef.current.style.transform = `rotate(${-heading}deg)`;
        }
    }, [heading, qiblaDirection]);

    const handleBack = () => {
        onBack();
    };

    const handleGoHome = () => {
        onNavigate('home');
    };

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-transparent" dir={isEn ? 'ltr' : 'rtl'}>
            <header className="app-top-bar shrink-0" dir={isEn ? 'ltr' : 'rtl'}>
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        {/* زر الرجوع للخلف وأيقونة الموقع */}
                        <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center gap-1`}>
                            <button
                                onClick={handleBack}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={isEn ? 'Go Back' : 'رجوع للخلف'}
                                aria-label={isEn ? 'Go Back' : 'رجوع للخلف'}
                            >
                                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                            </button>
                            <button
                                onClick={handleRefreshLocation}
                                className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={isEn ? "Refresh Location" : "تحديث الموقع"}
                                aria-label={isEn ? "Refresh Location" : "تحديث الموقع"}
                            >
                                <i className={`text-lg ${isRefreshing ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-location-crosshairs active:rotate-180 duration-700'}`} style={{ color: theme.name === 'أبيض وأسود' ? '#ffffff' : theme.palette[0] }}></i>
                            </button>
                        </div>

                        {/* عنوان الصفحة في الوسط */}
                        <div className="text-center px-12 min-w-0">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
                                {isEn ? 'Qibla Direction' : t('page.qibla_title', 'اتجاه القبلة')}
                            </h1>
                        </div>

                        {/* أيقونات الإجراءات (الرئيسية وقفل الثيم): على اليسار في العربي، وعلى اليمين في الإنجليزي */}
                        <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                            <button
                                type="button"
                                onClick={() => setShowGuide(true)}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ color: 'var(--top-bar-text, inherit)' }}
                                title={isEn ? "Qibla Guide" : "دليل اتجاه القبلة"}
                                aria-label={isEn ? "Qibla Guide" : "دليل اتجاه القبلة"}
                            >
                                <HelpCircle size={19} />
                            </button>
                            {isEn ? (
                                <>
                                    <ThemePageLock />
                                    <button
                                        onClick={handleGoHome}
                                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                        title="Home"
                                        aria-label="Home"
                                    >
                                        <i className="fa-solid fa-house text-xl"></i>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <ThemePageLock />
                                    <button
                                        onClick={handleGoHome}
                                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                        title="الصفحة الرئيسية"
                                        aria-label="الصفحة الرئيسية"
                                    >
                                        <i className="fa-solid fa-house text-xl"></i>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Modes Tabs - In a single unified card container with a border */}
            <div className="w-full shrink-0 flex justify-center px-4 pt-2.5 pb-1 z-20">
                <div className="max-w-full overflow-x-auto no-scrollbar py-1">
                    <div 
                        className="p-1.5 rounded-2xl flex items-center justify-center gap-1 sm:gap-1.5 min-w-max shadow-md transition-all"
                        style={{
                            backgroundColor: 'var(--card-bg)',
                            borderColor: cardBorderColor,
                            borderWidth: '1.5px',
                            borderStyle: 'solid',
                            boxShadow: 'var(--card-shadow)'
                        }}
                    >
                        {[
                            { id: 'compass', label: isEn ? 'Compass' : 'البوصلة', icon: 'fa-compass' },
                            { id: 'visual', label: isEn ? 'Visual Map' : 'المرئية', icon: 'fa-map-location-dot' },
                            { id: 'ar', label: isEn ? 'AR View' : 'الواقع المعزز', icon: 'fa-vr-cardboard' },
                            { id: 'sun_moon', label: isEn ? 'Sun & Moon' : 'الشمس والقمر', icon: 'fa-cloud-sun' },
                            { id: 'shadow', label: isEn ? 'Shadow' : 'الظل', icon: 'fa-person-rays' }
                        ].map(mode => {
                            const isActive = activeMode === mode.id;
                            return (
                                <button
                                    key={mode.id}
                                    onClick={() => setActiveMode(mode.id)}
                                    className={`whitespace-nowrap px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer active:scale-95 ${
                                        isActive ? 'shadow-sm scale-[1.02]' : 'opacity-80 hover:opacity-100 hover:scale-[1.01]'
                                    }`}
                                    style={{
                                        backgroundColor: isActive 
                                            ? (isDefaultTheme ? '#000000' : (theme.name === 'أبيض وأسود' ? '#ffffff' : theme.palette[0])) 
                                            : 'transparent',
                                        color: isActive 
                                            ? (isDefaultTheme ? '#ffffff' : (theme.name === 'أبيض وأسود' ? '#000000' : '#ffffff')) 
                                            : 'var(--text-color)',
                                    }}
                                >
                                    <i className={`fa-solid ${mode.icon} text-sm sm:text-base`}></i>
                                    <span>{mode.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <main className="flex-1 w-full flex flex-col items-center justify-start p-4 gap-4 text-center overflow-y-auto overflow-x-hidden pb-24 z-10">
                 {error && (
                     <p 
                         className="themed-card p-3 rounded-lg w-full max-w-md shrink-0" 
                         style={{backgroundColor: '#ef4444', color: 'white', borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid'}}
                     >
                         {error}
                     </p>
                 )}
                 {qiblaDirection === null && !error && (
                     <p className="themed-text w-full py-8">
                         {isEn ? 'Determining Qibla direction...' : 'جاري تحديد اتجاه القبلة...'}
                     </p>
                 )}
                 
                {activeMode === 'compass' && (
                    <div className="flex-1 flex flex-col items-center justify-start w-full pt-8 sm:pt-10">
                        <div 
                            className="relative w-64 h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center themed-card transition-all duration-300" 
                            style={{
                                borderColor: isAligned ? (theme.name === 'أبيض وأسود' ? '#ffffff' : (isDefaultTheme ? '#000000' : theme.palette[0])) : cardBorderColor, 
                                borderWidth: '2px', 
                                borderStyle: 'solid', 
                                boxShadow: isAligned ? `0 0 20px ${theme.name === 'أبيض وأسود' ? '#ffffff' : theme.palette[0]}90` : 'var(--card-shadow)'
                            }}
                        >
                            
                            <div ref={compassCircleRef} className="absolute w-full h-full transition-transform duration-500 ease-out">
                                 {/* Direction letters outside the circle: North (N / ش), South (S / ج), West (W / غ), East (E / ق) */}
                                 <div 
                                     className="absolute -top-9 left-1/2 -translate-x-1/2 text-2xl font-black select-none" 
                                     style={{color: isDefaultTheme ? '#000000' : (theme.name === 'أبيض وأسود' ? '#ffffff' : theme.palette[0])}}
                                 >
                                     {isEn ? 'N' : 'ش'}
                                 </div>
                                 <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-base font-bold themed-text-muted select-none">
                                     {isEn ? 'S' : 'ج'}
                                 </div>
                                 <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-base font-bold themed-text-muted select-none">
                                     {isEn ? 'W' : 'غ'}
                                 </div>
                                 <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-base font-bold themed-text-muted select-none">
                                     {isEn ? 'E' : 'ق'}
                                 </div>

                                 {/* Minor tick marks */}
                                 {Array.from({length: 24}).map((_, i) => (
                                   <div 
                                     key={i} 
                                     className="absolute top-0 left-1/2 w-full h-1/2 pointer-events-none -translate-x-1/2" 
                                     style={{ transform: `rotate(${i * 15}deg)`, transformOrigin: '50% 100%' }}
                                   >
                                     <div className={`mx-auto w-0.5 ${i % 6 === 0 ? 'h-3 opacity-60' : (i % 2 === 0 ? 'h-2 opacity-35' : 'h-1.5 opacity-20')} bg-current rounded-full`}></div>
                                   </div>
                                 ))}
                            </div>
                            
                            {qiblaDirection !== null && (
                                 <div ref={qiblaPointerRef} className="absolute w-full h-full transition-transform duration-500 ease-out pointer-events-none">
                                     <svg viewBox="0 0 100 100" className="w-full h-full" style={{filter: `drop-shadow(0 2px 4px ${isDefaultTheme ? 'rgba(0,0,0,0.2)' : (theme.name === 'أبيض وأسود' ? 'rgba(255,255,255,0.4)' : `${theme.palette[0]}50`)})`}}>
                                        <path d="M50 0 L60 20 L50 15 L40 20 Z" fill={isDefaultTheme ? '#000000' : (theme.name === 'أبيض وأسود' ? '#ffffff' : theme.palette[0])} />
                                    </svg>
                                </div>
                            )}
                            
                            {/* Kaaba Icon or Center Dot */}
                            <div className="transition-all duration-500" style={{opacity: isAligned ? 1 : 0, transform: isAligned ? 'scale(1)' : 'scale(0)'}}>
                                 <i className="fa-solid fa-kaaba text-6xl" style={{ color: theme.name === 'أبيض وأسود' ? '#ffffff' : theme.palette[1], transform: `rotate(${heading}deg)` }}></i>
                            </div>
                            
                            {!isAligned && <div className="absolute w-3 h-3 rounded-full border-2 shadow-lg transition-opacity" style={{backgroundColor: theme.name === 'أبيض وأسود' ? '#ffffff' : theme.palette[1], borderColor: 'var(--card-bg)'}}></div>}
                        </div>
                        
                        {qiblaDirection !== null && (
                            <div 
                                className="themed-card p-4 rounded-xl transition-all duration-300 w-64 mt-10 mb-6 shrink-0" 
                                style={{
                                    borderColor: isAligned ? (theme.name === 'أبيض وأسود' ? '#ffffff' : (isDefaultTheme ? '#000000' : theme.palette[0])) : cardBorderColor, 
                                    borderWidth: '1.5px', 
                                    borderStyle: 'solid'
                                }}
                            >
                                <p className="text-lg font-bold transition-colors" style={{color: isAligned ? (theme.name === 'أبيض وأسود' ? '#ffffff' : theme.palette[0]) : 'var(--text-color)'}}>
                                     {isAligned 
                                        ? (isEn ? "Facing Qibla" : "هذا هو اتجاه القبلة") 
                                        : (isEn ? `Qibla Direction: ${Math.round(qiblaDirection)}°` : `اتجاه القبلة: ${Math.round(qiblaDirection)}°`)}
                                </p>
                                <p className="text-xs themed-text-muted mt-1">
                                     {isAligned 
                                        ? (isEn ? "May Allah accept your prayers" : "تقبل الله طاعتكم") 
                                        : (isEn 
                                            ? `Align the ${isDefaultTheme ? 'black' : 'colored'} arrow with the North mark (N)` 
                                            : `قم بمحاذاة السهم ${isDefaultTheme ? 'الأسود' : 'الأخضر'} مع علامة الشمال (ش)`)}
                                </p>
                            </div>
                        )}
                        
                        <p className="text-center text-sm opacity-70 themed-text-muted shrink-0 pb-4">
                            {isEn ? '(Location must be enabled to calculate exact position)' : '(يجب تفعيل الموقع للهاتف لحساب الموقع بدقه)'}
                        </p>
                    </div>
                )}

                {activeMode === 'visual' && config?.location && (
                    <div className="w-full flex-1 min-h-[460px] max-w-2xl flex flex-col">
                        <VisualQibla lat={config.location.lat} lng={config.location.lng} theme={theme} cardBorderColor={cardBorderColor} />
                    </div>
                )}

                {activeMode === 'ar' && qiblaDirection !== null && (
                    <div className="w-full flex-1 min-h-[460px] max-w-2xl flex flex-col">
                        <ARQibla qiblaDirection={qiblaDirection} heading={heading} isAligned={isAligned} theme={theme} cardBorderColor={cardBorderColor} />
                    </div>
                )}

                {activeMode === 'sun_moon' && config?.location && qiblaDirection !== null && (
                    <div className="w-full flex-1 min-h-[460px] max-w-2xl flex flex-col">
                        <SunMoonQibla lat={config.location.lat} lng={config.location.lng} qiblaDirection={qiblaDirection} heading={heading} theme={theme} cardBorderColor={cardBorderColor} />
                    </div>
                )}

                {activeMode === 'shadow' && config?.location && qiblaDirection !== null && (
                    <div className="w-full flex-1 min-h-[460px] max-w-2xl flex flex-col">
                        <ShadowQibla lat={config.location.lat} lng={config.location.lng} qiblaDirection={qiblaDirection} heading={heading} theme={theme} cardBorderColor={cardBorderColor} />
                    </div>
                )}
                <div className="w-full h-6 shrink-0"></div>
            </main>
            <CommunitySpotlightGuide
                isOpen={showGuide}
                onClose={() => {
                    setShowGuide(false);
                    markPageAsSeen('qibla');
                }}
                steps={QIBLA_PAGE_STEPS}
                guideKey="qibla_page_spotlight"
                isEn={isEn}
            />
        </div>
    );
}

export default Qibla;
