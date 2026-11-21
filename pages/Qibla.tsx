import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePrayerTimes } from '../context/PrayerTimesContext';
import { VisualQibla, ARQibla, SunMoonQibla, ShadowQibla } from '../components/QiblaModes';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { useLanguage } from '../context/LanguageContext';
import { Compass, MapPin, Sun } from 'lucide-react';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { QIBLA_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';
import { openLocationSettings, requestLocationPermission } from '../utils/permissionHelper';
import { hexToRgba } from '../utils/flatDesignTokens';
import { Kaaba3DIcon, Qibla3DArrow, Compass3DLetter, Compass3DCenterDome } from '../components/Qibla3DIcons';

// --- Helper Functions ---
const toRad = (deg: number) => deg * Math.PI / 180;
const toDeg = (rad: number) => rad * 180 / Math.PI;

function Qibla({ onBack, onNavigate }: { onBack: () => void, onNavigate: (page: string) => void }) {
    const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
    const { t, language } = useLanguage();
    const isEn = language === 'en';
    
    // Dynamic theme tokens matching active theme variant & night mode
    const isBlackTheme = isNightMode || themeKey === 'black_gold' || themeKey === 'deep_black' || theme.bgColor === '#000000' || theme.name === 'أبيض وأسود' || theme.name === 'اسود';
    
    let primaryColor = '#b45309';
    if (isBlackTheme) {
        primaryColor = '#FFFFFF';
    } else if (homeThemeVariant === 'sky' || themeKey === 'sky_mode') {
        primaryColor = '#0284c7';
    } else if (homeThemeVariant === 'emerald' || themeKey === 'emerald_mode') {
        primaryColor = '#059669';
    } else if (homeThemeVariant === 'burgundy' || themeKey === 'burgundy_mode') {
        primaryColor = '#9f1239';
    } else {
        primaryColor = theme.palette?.[0] || theme.accent || theme.btnBg || '#b45309';
    }

    const pageBgColor = isBlackTheme ? '#000000' : (theme.bgColor || '#F8FAFC');
    const btnTextColor = isBlackTheme ? '#000000' : '#FFFFFF';
    const surfaceCardClass = isBlackTheme
        ? 'bg-[#18181b] text-white'
        : 'bg-white dark:bg-[#1E293B] text-slate-800 dark:text-white';

    const { config, refreshLocation } = usePrayerTimes();
    const [heading, setHeading] = useState(0);
    const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
    const [isAligned, setIsAligned] = useState(false);
    const [error, setError] = useState('');
    const [, setIsRefreshing] = useState(false);
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
    const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
    const [isSensorActive, setIsSensorActive] = useState(false);

    // Continuous unwrapped heading tracking to eliminate 0°/360° spinning glitches
    const lastRawAngleRef = useRef<number | null>(null);
    const unwrappedHeadingRef = useRef<number>(0);
    const isDraggingRef = useRef(false);
    const dragStartAngleRef = useRef<number>(0);
    const dragStartHeadingRef = useRef<number>(0);

    const updateHeadingValue = (rawAngle: number) => {
        // Account for screen orientation angle (e.g. landscape mode)
        let screenAngle = 0;
        if (typeof window !== 'undefined') {
            if (window.orientation !== undefined) {
                screenAngle = Number(window.orientation) || 0;
            } else if (window.screen && window.screen.orientation && window.screen.orientation.angle !== undefined) {
                screenAngle = window.screen.orientation.angle || 0;
            }
        }

        const normalizedAngle = (rawAngle + screenAngle + 360) % 360;

        if (lastRawAngleRef.current === null) {
            lastRawAngleRef.current = normalizedAngle;
            unwrappedHeadingRef.current = normalizedAngle;
        } else {
            // Shortest angle delta (-180 to +180)
            let delta = (normalizedAngle - (unwrappedHeadingRef.current % 360) + 540) % 360 - 180;
            unwrappedHeadingRef.current += delta;
            lastRawAngleRef.current = normalizedAngle;
        }

        setIsSensorActive(true);
        const finalNormalized = (unwrappedHeadingRef.current % 360 + 360) % 360;
        setHeading(finalNormalized);
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
        let angle: number | undefined;
        if ((event as any).webkitCompassHeading !== undefined && (event as any).webkitCompassHeading !== null) {
            // iOS Magnetic North Heading
            angle = (event as any).webkitCompassHeading;
        } else if (event.absolute !== false && event.alpha !== null) {
            // Android Absolute North
            angle = (360 - event.alpha) % 360;
        } else if (event.alpha !== null) {
            // Android Relative North
            angle = (360 - event.alpha) % 360;
        }
        
        if (typeof angle === 'number' && !isNaN(angle)) {
            updateHeadingValue(angle);
        }
    };

    const waitingForLocationSettingsRef = useRef(false);

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
        const handleReturnFromSettings = () => {
            if (document.visibilityState === 'hidden') return;
            if (waitingForLocationSettingsRef.current) {
                waitingForLocationSettingsRef.current = false;
                handleRefreshLocation();
            }
        };
        window.addEventListener('focus', handleReturnFromSettings);
        document.addEventListener('visibilitychange', handleReturnFromSettings);
        let appListener: any = null;
        if (Capacitor.isNativePlatform()) {
            appListener = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
                if (isActive && waitingForLocationSettingsRef.current) {
                    waitingForLocationSettingsRef.current = false;
                    handleRefreshLocation();
                }
            });
        }
        return () => {
            window.removeEventListener('focus', handleReturnFromSettings);
            document.removeEventListener('visibilitychange', handleReturnFromSettings);
            if (appListener && typeof appListener.then === 'function') {
                appListener.then((l: any) => l.remove()).catch(() => {});
            }
        };
    }, []);

    const handleOpenLocationSettings = async () => {
        if (Capacitor.isNativePlatform()) {
            waitingForLocationSettingsRef.current = true;
            const opened = await openLocationSettings();
            if (!opened) {
                waitingForLocationSettingsRef.current = false;
                await requestLocationPermission();
                await handleRefreshLocation();
            }
        } else {
            await requestLocationPermission();
            await handleRefreshLocation();
        }
    };

    const requestSensorPermission = async () => {
        if (typeof (window.DeviceOrientationEvent as any)?.requestPermission === 'function') {
            try {
                const permission = await (window.DeviceOrientationEvent as any).requestPermission();
                if (permission === 'granted') {
                    setPermissionStatus('granted');
                    window.addEventListener('deviceorientation', handleOrientation, true);
                    return true;
                } else {
                    setPermissionStatus('denied');
                    return false;
                }
            } catch (e) {
                setPermissionStatus('denied');
                return false;
            }
        }
        return true;
    };

    useEffect(() => {
        // Use location from PrayerTimesContext
        if (config?.location && typeof config.location.lat === 'number' && typeof config.location.lng === 'number') {
            setError('');
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
                        window.addEventListener('deviceorientation', handleOrientation, true);
                        return;
                    } else {
                        setPermissionStatus('prompt');
                    }
                } catch (e) {
                    setPermissionStatus('prompt');
                }
            } else {
                setPermissionStatus('granted');
            }

            if ('ondeviceorientationabsolute' in window) {
                (window as any).addEventListener('deviceorientationabsolute', handleOrientation, true);
            }
            (window as any).addEventListener('deviceorientation', handleOrientation, true);
        };

        startCompass();

        return () => {
            (window as any).removeEventListener('deviceorientation', handleOrientation, true);
            (window as any).removeEventListener('deviceorientationabsolute', handleOrientation, true);
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
            const currentUnwrapped = unwrappedHeadingRef.current;
            const pointerRotation = qiblaDirection - currentUnwrapped;
            const dialRotation = -currentUnwrapped;

            if (qiblaPointerRef.current) {
                qiblaPointerRef.current.style.transform = `rotate(${pointerRotation}deg)`;
            }

            if (compassCircleRef.current) {
                compassCircleRef.current.style.transform = `rotate(${dialRotation}deg)`;
            }

            // Circular angle difference (exact)
            const circularDiff = Math.abs((heading - qiblaDirection + 540) % 360 - 180);
            const isFacingQibla = circularDiff <= 4;

            setIsAligned(isFacingQibla);

            if (isFacingQibla) {
                if (!hasVibratedRef.current) {
                    if (Capacitor.isNativePlatform()) {
                        Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
                    } else if (navigator.vibrate) {
                        try { navigator.vibrate(200); } catch (e) {}
                    }
                    hasVibratedRef.current = true;
                }
            } else {
                hasVibratedRef.current = false;
            }
        }
    }, [heading, qiblaDirection]);

    // Manual Touch/Mouse Rotation Fallback for Desktop or Devices without compass hardware
    const handleTouchOrMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (isSensorActive) return; // Ignore drag if hardware compass sensor is active
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        isDraggingRef.current = true;
        dragStartAngleRef.current = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
        dragStartHeadingRef.current = heading;
    };

    const handleTouchOrMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDraggingRef.current || isSensorActive) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const currentTouchAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
        const delta = currentTouchAngle - dragStartAngleRef.current;
        const newHeading = (dragStartHeadingRef.current - delta + 360) % 360;
        
        updateHeadingValue(newHeading);
    };

    const handleTouchOrMouseUp = () => {
        isDraggingRef.current = false;
    };

    const handleGoHome = () => {
        onNavigate('home');
    };

    return (
        <div 
            className="h-[100dvh] flex flex-col font-cairo overflow-hidden select-none" 
            style={{ backgroundColor: pageBgColor, color: isBlackTheme ? '#FFFFFF' : (theme.textColor || '#1E293B') }} 
            dir={isEn ? 'ltr' : 'rtl'}
        >
            <header className="app-top-bar" dir={isEn ? 'ltr' : 'rtl'}>
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-between w-full min-h-[44px]">
                        {/* زر الرجوع للخلف وأيقونة تحديث الموقع */}
                        <div className={`flex items-center gap-1 z-10 ${isEn ? 'order-1' : 'order-1'}`}>
                            <button
                                onClick={onBack}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer border-0"
                                title={isEn ? 'Back' : 'رجوع'}
                                aria-label={isEn ? 'Back' : 'رجوع'}
                            >
                                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                            </button>
                            <button
                                onClick={handleRefreshLocation}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer border-0"
                                title={isEn ? 'Refresh Location' : 'تحديث الموقع'}
                                aria-label={isEn ? 'Refresh Location' : 'تحديث الموقع'}
                            >
                                <i className="fa-solid fa-location-crosshairs text-lg"></i>
                            </button>
                        </div>

                        {/* عنوان الصفحة في الوسط */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-cairo font-bold truncate px-28">
                                {isEn ? 'Qibla Direction' : t('page.qibla_title', 'اتجاه القبلة')}
                            </h1>
                        </div>

                        {/* أيقونات الإجراءات (دليل الاستخدام، قفل الثيم، الرئيسية) */}
                        <div className={`flex items-center gap-1 z-10 ${isEn ? 'order-3' : 'order-3'}`}>
                            <button
                                type="button"
                                onClick={() => setShowGuide(true)}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer border-0"
                                style={{ color: 'var(--top-bar-text, inherit)' }}
                                title={isEn ? "Qibla Guide" : "دليل اتجاه القبلة"}
                                aria-label={isEn ? "Qibla Guide" : "دليل اتجاه القبلة"}
                            >
                                <i className="fa-solid fa-circle-question text-lg"></i>
                            </button>
                            <button
                                onClick={handleGoHome}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer border-0"
                                title={isEn ? "Home" : "الصفحة الرئيسية"}
                                aria-label={isEn ? "Home" : "الصفحة الرئيسية"}
                            >
                                <i className="fa-solid fa-house text-lg"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* أزرار التبديل العلوية (Modes Tabs) */}
            <div className="w-full shrink-0 flex justify-center px-4 pt-3 pb-1 z-20 overflow-visible">
                <div className="max-w-full overflow-x-auto no-scrollbar py-2 px-1">
                    <div 
                        className={`app-page-card border-0 p-1.5 rounded-2xl flex items-center justify-center gap-1.5 min-w-max transition-all overflow-visible ${surfaceCardClass}`}
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
                                    type="button"
                                    onClick={() => setActiveMode(mode.id)}
                                    className={`app-page-card border-0 whitespace-nowrap px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                                        isActive 
                                            ? 'font-black' 
                                            : `font-bold ${surfaceCardClass}`
                                    }`}
                                    style={isActive ? { backgroundColor: primaryColor, color: btnTextColor } : undefined}
                                >
                                    <i className={`fa-solid ${mode.icon} text-sm`}></i>
                                    <span>{mode.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <main className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden px-4 pt-4 text-center app-scroll-safe z-10">
                 {error && (
                     <div 
                         className="app-page-card border-0 p-3.5 rounded-2xl w-full max-w-md mx-auto mb-4 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold text-xs" 
                     >
                         {error}
                     </div>
                 )}
                 {qiblaDirection === null && !error && (
                     <p className="text-slate-500 dark:text-zinc-400 w-full py-8 text-sm font-medium">
                         {isEn ? 'Determining Qibla direction...' : 'جاري تحديد اتجاه القبلة...'}
                     </p>
                 )}
                 
                {activeMode === 'compass' && (
                    <div className="flex flex-col items-center justify-start w-full pt-8 sm:pt-10">
                        {/* واجهة البوصلة ثلاثية الأبعاد المجسمة */}
                        <div 
                            onMouseDown={handleTouchOrMouseDown}
                            onMouseMove={handleTouchOrMouseMove}
                            onMouseUp={handleTouchOrMouseUp}
                            onMouseLeave={handleTouchOrMouseUp}
                            onTouchStart={handleTouchOrMouseDown}
                            onTouchMove={handleTouchOrMouseMove}
                            onTouchEnd={handleTouchOrMouseUp}
                            className={`relative w-64 h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center transition-all duration-300 cursor-grab active:cursor-grabbing ${
                                isAligned ? 'ring-4 ring-green-500/90' : ''
                            }`}
                            style={{
                                background: isBlackTheme
                                    ? 'linear-gradient(145deg, #3f3f46 0%, #18181b 52%, #09090b 100%)'
                                    : 'linear-gradient(145deg, #ffffff 0%, #e2e8f0 55%, #cbd5e1 100%)',
                                padding: '10px',
                                boxShadow: isAligned
                                    ? (isBlackTheme
                                        ? '0 10px 0 #09090b, 0 22px 38px rgba(34,197,94,0.35), inset 0 2px 3px rgba(255,255,255,0.28)'
                                        : '0 10px 0 #94a3b8, 0 22px 38px rgba(34,197,94,0.32), inset 0 2px 4px rgba(255,255,255,0.95)')
                                    : (isBlackTheme
                                        ? '0 10px 0 #050507, 0 22px 36px rgba(0,0,0,0.78), inset 0 2px 3px rgba(255,255,255,0.22)'
                                        : '0 10px 0 #cbd5e1, 0 22px 36px rgba(15,23,42,0.2), inset 0 2px 4px rgba(255,255,255,0.98)')
                            }}
                        >
                            {/* القرص الداخلي الغائر والمجسم */}
                            <div
                                className="relative w-full h-full rounded-full flex items-center justify-center"
                                style={{
                                    background: isBlackTheme
                                        ? 'radial-gradient(circle at 35% 28%, #27272a 0%, #18181b 58%, #09090b 100%)'
                                        : 'radial-gradient(circle at 35% 28%, #ffffff 0%, #f8fafc 60%, #e2e8f0 100%)',
                                    boxShadow: isBlackTheme
                                        ? 'inset 0 6px 14px rgba(0,0,0,0.85), inset 0 -3px 8px rgba(255,255,255,0.08)'
                                        : 'inset 0 6px 14px rgba(15,23,42,0.14), inset 0 -4px 10px rgba(255,255,255,0.95)'
                                }}
                            >
                                {/* حلقات زخرفية غائرة داخل القرص لتعزيز العمق */}
                                <div
                                    className="absolute inset-5 rounded-full pointer-events-none"
                                    style={{
                                        border: isBlackTheme ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(15,23,42,0.07)',
                                        boxShadow: isBlackTheme ? 'inset 0 1px 2px rgba(0,0,0,0.6)' : 'inset 0 1px 2px rgba(15,23,42,0.06)'
                                    }}
                                />
                                <div
                                    className="absolute inset-11 rounded-full pointer-events-none"
                                    style={{
                                        border: isBlackTheme ? '1px dashed rgba(255,255,255,0.07)' : '1px dashed rgba(15,23,42,0.06)'
                                    }}
                                />

                                {/* لمعة زجاجية علوية خفيفة */}
                                <div
                                    className="absolute inset-1.5 rounded-full pointer-events-none"
                                    style={{
                                        background: isBlackTheme
                                            ? 'linear-gradient(155deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0) 44%)'
                                            : 'linear-gradient(155deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 46%)'
                                    }}
                                />

                                <div ref={compassCircleRef} className="absolute w-full h-full transition-transform duration-300 ease-out pointer-events-none">
                                    {/* أحرف الاتجاهات المجسمة ثلاثية الأبعاد على جوانب الدائرة */}
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 select-none flex items-center justify-center">
                                        <Compass3DLetter
                                            letter={isEn ? 'N' : 'ش'}
                                            color={primaryColor}
                                            size={42}
                                            isPrimary
                                        />
                                    </div>
                                    <div className="absolute -bottom-11 left-1/2 -translate-x-1/2 select-none flex items-center justify-center">
                                        <Compass3DLetter
                                            letter={isEn ? 'S' : 'ج'}
                                            color={isBlackTheme ? '#a1a1aa' : '#94a3b8'}
                                            size={34}
                                        />
                                    </div>
                                    <div className="absolute -left-11 top-1/2 -translate-y-1/2 select-none flex items-center justify-center">
                                        <Compass3DLetter
                                            letter={isEn ? 'W' : 'غ'}
                                            color={isBlackTheme ? '#a1a1aa' : '#94a3b8'}
                                            size={34}
                                        />
                                    </div>
                                    <div className="absolute -right-11 top-1/2 -translate-y-1/2 select-none flex items-center justify-center">
                                        <Compass3DLetter
                                            letter={isEn ? 'E' : 'ق'}
                                            color={isBlackTheme ? '#a1a1aa' : '#94a3b8'}
                                            size={34}
                                        />
                                    </div>

                                    {/* علامات الدرجات والتدريج المجسمة */}
                                    {Array.from({ length: 24 }).map((_, i) => (
                                      <div 
                                        key={i} 
                                        className="absolute top-0 left-1/2 w-full h-1/2 pointer-events-none -translate-x-1/2" 
                                        style={{ transform: `rotate(${i * 15}deg)`, transformOrigin: '50% 100%' }}
                                      >
                                        <div 
                                           className={`mx-auto rounded-full ${
                                               i % 6 === 0 
                                                   ? 'w-1 h-3.5 mt-1' 
                                                   : (i % 2 === 0 
                                                       ? 'w-0.5 h-2.5 mt-1' 
                                                       : 'w-0.5 h-1.5 mt-1')
                                           }`}
                                           style={{
                                               background: i % 6 === 0
                                                   ? (isBlackTheme ? 'linear-gradient(180deg, #e4e4e7, #71717a)' : 'linear-gradient(180deg, #64748b, #cbd5e1)')
                                                   : (isBlackTheme ? 'rgba(255,255,255,0.28)' : 'rgba(148,163,184,0.55)'),
                                               boxShadow: i % 6 === 0
                                                   ? '0 1px 1px rgba(0,0,0,0.22)'
                                                   : undefined
                                           }}
                                        ></div>
                                      </div>
                                    ))}
                                </div>
                                
                                {/* سهم اتجاه القبلة المجسم ثلاثي الأبعاد */}
                                {qiblaDirection !== null && (
                                     <div ref={qiblaPointerRef} className="absolute w-full h-full transition-transform duration-300 ease-out pointer-events-none">
                                         <Qibla3DArrow color={primaryColor} />
                                    </div>
                                )}
                                
                                {/* أيقونة الكعبة المشرفة عند المحاذاة التامة */}
                                <div className="transition-all duration-500 pointer-events-none z-10 flex items-center justify-center" style={{ opacity: isAligned ? 1 : 0, transform: isAligned ? 'scale(1)' : 'scale(0)' }}>
                                    <Kaaba3DIcon
                                        size={76}
                                        style={{
                                            filter: `drop-shadow(0 6px 14px ${primaryColor}55)`
                                        }}
                                    />
                                </div>
                                
                                {/* القبة المركزية المجسمة */}
                                {!isAligned && (
                                    <div className="absolute pointer-events-none z-10 flex items-center justify-center">
                                        <Compass3DCenterDome color={primaryColor} size={26} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {permissionStatus === 'prompt' && (
                            <button
                                type="button"
                                onClick={requestSensorPermission}
                                className="app-page-card border-0 mt-5 px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer"
                                style={{ backgroundColor: primaryColor, color: btnTextColor }}
                            >
                                {isEn ? 'Enable Motion Sensors' : 'تفعيل حساس البوصلة والحركة'}
                            </button>
                        )}
                        
                        {/* بطاقة المعلومات السفلية */}
                        {qiblaDirection !== null && (
                            <div 
                                className={`app-page-card border-0 p-4 sm:p-5 rounded-2xl transition-all duration-300 w-72 mt-9 mb-4 shrink-0 text-center space-y-1.5 ${surfaceCardClass}`}
                            >
                                {/* زاوية القبلة */}
                                <div className="flex items-center justify-center">
                                    <span 
                                        className="app-3d-badge border-0 px-4 py-1.5 rounded-2xl text-3xl font-black font-mono tracking-tight leading-none tabular-nums"
                                        style={{
                                            backgroundColor: hexToRgba(primaryColor, isBlackTheme ? 0.2 : 0.1),
                                            color: primaryColor
                                        }}
                                    >
                                        {Math.round(qiblaDirection)}°
                                    </span>
                                </div>

                                <p className="text-sm font-black pt-1">
                                     {isAligned 
                                        ? (isEn ? "Facing Qibla" : "هذا هو اتجاه القبلة") 
                                        : (isEn ? "Qibla Direction" : "اتجاه القبلة")}
                                </p>
                                <p className={`text-xs leading-relaxed ${isBlackTheme ? 'text-zinc-400' : 'text-slate-500 dark:text-zinc-400'}`}>
                                     {isAligned 
                                        ? (isEn ? "May Allah accept your prayers" : "تقبل الله طاعتكم 🤲") 
                                        : (isEn 
                                            ? `Align the pointer arrow with the North mark (N)` 
                                            : `قم بمحاذاة سهم القبلة مع علامة الشمال (ش)`)}
                                </p>
                            </div>
                        )}
                        
                        <div className="flex justify-center mt-1 mb-3 shrink-0 px-2">
                            <button
                                type="button"
                                onClick={handleOpenLocationSettings}
                                className={`app-page-card border-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-center text-xs sm:text-sm font-black transition-all cursor-pointer ${surfaceCardClass}`}
                                style={{
                                    color: isBlackTheme ? '#FBBF24' : primaryColor,
                                }}
                                title={isEn ? 'Open device location (GPS) settings' : 'الدخول إلى صفحة إعدادات الموقع (GPS) بالهاتف'}
                            >
                                <MapPin className="w-4 h-4 shrink-0" />
                                <span>
                                    {isEn
                                        ? 'Location service (GPS) must be enabled to calculate Qibla direction accurately'
                                        : 'يجب تفعيل خدمة الموقع (GPS) لحساب اتجاه القبلة بدقه'}
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {activeMode === 'visual' && config?.location && (
                    <div className="w-full h-full min-h-[460px] max-w-2xl mx-auto flex flex-col">
                        <VisualQibla lat={config.location.lat} lng={config.location.lng} theme={theme} />
                    </div>
                )}

                {activeMode === 'ar' && qiblaDirection !== null && (
                    <div className="w-full h-full min-h-[460px] max-w-2xl mx-auto flex flex-col">
                        <ARQibla
                            qiblaDirection={qiblaDirection}
                            heading={heading}
                            isAligned={isAligned}
                            theme={theme}
                            themeKey={themeKey}
                            isNightMode={isNightMode}
                            homeThemeVariant={homeThemeVariant}
                        />
                    </div>
                )}

                {activeMode === 'sun_moon' && config?.location && qiblaDirection !== null && (
                    <div className="w-full max-w-2xl mx-auto flex flex-col">
                        <SunMoonQibla lat={config.location.lat} lng={config.location.lng} qiblaDirection={qiblaDirection} heading={heading} theme={theme} />
                    </div>
                )}

                {activeMode === 'shadow' && config?.location && qiblaDirection !== null && (
                    <div className="w-full max-w-2xl mx-auto flex flex-col">
                        <ShadowQibla lat={config.location.lat} lng={config.location.lng} qiblaDirection={qiblaDirection} heading={heading} theme={theme} />
                    </div>
                )}
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
