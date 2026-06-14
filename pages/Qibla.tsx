
import React, { useState, useEffect, useRef } from 'react';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import ThemePageLock from '../components/ThemePageLock';
import { usePrayerTimes } from '../context/PrayerTimesContext';
import { VisualQibla, ARQibla, SunMoonQibla, ShadowQibla } from '../components/QiblaModes';

// --- Helper Functions ---
const toRad = (deg) => deg * Math.PI / 180;
const toDeg = (rad) => rad * 180 / Math.PI;

function Qibla({ onBack, onNavigate }) {
    const { theme, themeKey } = useTheme();
    const isDefaultTheme = themeKey === 'default';
    const { config, refreshLocation } = usePrayerTimes();
    const [heading, setHeading] = useState(0);
    const [qiblaDirection, setQiblaDirection] = useState(null);
    const [isAligned, setIsAligned] = useState(false);
    const [error, setError] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeMode, setActiveMode] = useState('compass'); // compass, visual, ar, sun_moon, shadow
    
    const compassCircleRef = useRef(null);
    const qiblaPointerRef = useRef(null);
    const [permissionStatus, setPermissionStatus] = useState('unknown'); // 'unknown', 'granted', 'denied'

    const handleOrientation = (event) => {
        let angle;
        if (event.webkitCompassHeading) {
            // iOS
            angle = event.webkitCompassHeading;
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

    const requestPermission = async () => {
        if (typeof (window.DeviceOrientationEvent as any)?.requestPermission === 'function') {
            try {
                const permission = await (window.DeviceOrientationEvent as any).requestPermission();
                if (permission === 'granted') {
                    setPermissionStatus('granted');
                    window.addEventListener('deviceorientation', handleOrientation);
                } else {
                    setPermissionStatus('denied');
                    setError('تم رفض إذن الوصول إلى البوصلة.');
                }
            } catch (e) {
                setError('حدث خطأ أثناء طلب الإذن.');
            }
        } else {
            // Non-iOS or older iOS
            setPermissionStatus('granted');
            if ('ondeviceorientationabsolute' in window) {
                (window as any).addEventListener('deviceorientationabsolute', handleOrientation);
            } else {
                (window as any).addEventListener('deviceorientation', handleOrientation);
            }
        }
    };

    const handleRefreshLocation = async () => {
        setIsRefreshing(true);
        setError('');
        try {
            await refreshLocation();
        } catch (e) {
            setError('حدث خطأ أثناء تحديث الموقع.');
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        // Use location from PrayerTimesContext
        if (config && config.location) {
            calculateQiblaDirection(config.location.lat, config.location.lng);
        } else {
            setError('تعذر تحديد الموقع من إعدادات مواقيت الصلاة.');
        }

        // Auto-start if not iOS (iOS requires user gesture)
        if (typeof (window.DeviceOrientationEvent as any)?.requestPermission !== 'function') {
            if ('ondeviceorientationabsolute' in window) {
                (window as any).addEventListener('deviceorientationabsolute', handleOrientation);
            } else {
                (window as any).addEventListener('deviceorientation', handleOrientation);
            }
            setPermissionStatus('granted');
        }

        return () => {
            (window as any).removeEventListener('deviceorientation', handleOrientation);
            (window as any).removeEventListener('deviceorientationabsolute', handleOrientation);
        };
    }, [config.location]);

    const calculateQiblaDirection = (latitude, longitude) => {
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
            setIsAligned(diff <= 3); // Threshold of 3 degrees
        }

        if (compassCircleRef.current) {
             compassCircleRef.current.style.transform = `rotate(${-heading}deg)`;
        }
    }, [heading, qiblaDirection]);

    return (
        <div className="h-screen w-screen relative overflow-hidden bg-transparent">
            <header className="app-top-bar">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full">
                        <div className="absolute left-0 flex items-center gap-2">
                             <ThemePageLock />
                             <i onClick={handleRefreshLocation} className={`text-xl cursor-pointer ${isRefreshing ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-location-crosshairs active:rotate-180 duration-700'}`} style={{ color: theme.name === 'أبيض وأسود' ? '#ffffff' : theme.palette[0] }}></i>
                        </div>
                        <h1 className="app-top-bar__title text-2xl font-kufi">اتجاه القبلة</h1>
                    </div>
                    <p className="app-top-bar__subtitle text-center">
                        {config?.location?.cityGov ? `حسب موقعك في: ${config.location.cityGov}` : 'تحديد اتجاه القبلة بدقة'}
                    </p>
                </div>
            </header>

            {/* Modes Tabs - Independent Floating Scrollable Row - 100% Transparent */}
            <div className="w-full overflow-x-auto no-scrollbar scroll-smooth z-30 relative bg-transparent mt-2">
                <div className="flex items-center gap-3 px-6 min-w-max py-4 bg-transparent pt-4">
                    {[
                        { id: 'compass', label: 'البوصلة', icon: 'fa-compass' },
                        { id: 'visual', label: 'المرئية', icon: 'fa-map-location-dot' },
                        { id: 'ar', label: 'الواقع معزز', icon: 'fa-vr-cardboard' },
                        { id: 'sun_moon', label: 'الشمس والقمر', icon: 'fa-cloud-sun' },
                        { id: 'shadow', label: 'الظل', icon: 'fa-person-rays' }
                    ].map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => setActiveMode(mode.id)}
                            className={`whitespace-nowrap px-6 py-3 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 border-none active:scale-95 shadow-lg ${activeMode === mode.id ? 'scale-105 z-10' : 'opacity-90 hover:opacity-100 hover:scale-105'}`}
                            style={{
                                backgroundColor: activeMode === mode.id 
                                    ? (isDefaultTheme ? '#000000' : (theme.name === 'أبيض وأسود' ? '#ffffff' : theme.palette[0])) 
                                    : 'var(--card-bg)',
                                color: activeMode === mode.id 
                                    ? (isDefaultTheme ? '#ffffff' : (theme.name === 'أبيض وأسود' ? '#000000' : '#ffffff')) 
                                    : 'var(--text-color)',
                                boxShadow: activeMode === mode.id 
                                    ? `0 12px 24px -10px ${isDefaultTheme ? 'rgba(0,0,0,0.4)' : (theme.name === 'أبيض وأسود' ? 'rgba(255,255,255,0.4)' : `${theme.palette[0]}50`)}` 
                                    : '0 4px 15px -1px rgba(0,0,0,0.2)'
                            }}
                        >
                            <i className={`fa-solid ${mode.icon} text-lg`}></i>
                            <span>{mode.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <main className="absolute inset-0 w-full flex flex-col items-center justify-start p-4 gap-4 text-center overflow-y-auto overflow-x-hidden pt-44 pb-24 z-10">
                 {error && <p className="themed-card p-3 rounded-lg w-full" style={{backgroundColor: '#ef4444', color: 'white'}}>{error}</p>}
                 {qiblaDirection === null && !error && <p className="themed-text w-full">جاري تحديد اتجاه القبلة...</p>}
                 
                 {permissionStatus === 'unknown' && activeMode === 'compass' && (
                     <button 
                         onClick={requestPermission}
                         className="themed-card p-4 rounded-xl font-bold flex flex-col items-center gap-2 animate-pulse"
                         style={{ borderColor: theme.palette[0], borderWidth: '2px' }}
                     >
                         <i className="fa-solid fa-compass text-3xl" style={{ color: theme.palette[0] }}></i>
                         <span>اضغط هنا لتفعيل البوصلة</span>
                     </button>
                 )}

                {activeMode === 'compass' && (
                    <div className="flex-1 flex flex-col items-center justify-center w-full">
                        <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center themed-card transition-all duration-300" style={{boxShadow: isAligned ? `0 0 20px ${theme.name === 'أبيض وأسود' ? '#ffffff' : theme.palette[0]}90` : 'var(--card-shadow)'}}>
                            
                            <div ref={compassCircleRef} className="absolute w-full h-full transition-transform duration-500 ease-out">
                                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 text-2xl font-bold" style={{color: isDefaultTheme ? '#000000' : (theme.name === 'أبيض وأسود' ? '#ffffff' : theme.palette[0])}}>ش</div>
                                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -mb-2 text-base themed-text-muted">ج</div>
                                 <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 text-base themed-text-muted">غ</div>
                                 <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 text-base themed-text-muted">ش</div>
                                 {/* Minor tick marks */}
                                {Array.from({length: 12}).map((_, i) => (
                                  <div key={i} className="absolute top-0 left-1/2 w-px h-2 bg-current opacity-20" style={{transform: `translateX(-50%) rotate(${i * 30}deg)`, transformOrigin: '0 128px'}}></div>
                                ))}
                            </div>
                            
                            {qiblaDirection !== null && (
                                 <div ref={qiblaPointerRef} className="absolute w-full h-full transition-transform duration-500 ease-out">
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
                            <div className="themed-card p-4 rounded-xl transition-all duration-300 w-64 mt-12 mb-8" style={{borderColor: isAligned ? (theme.name === 'أبيض وأسود' ? '#ffffff' : theme.palette[0]) : 'var(--card-border)', borderWidth: '2px'}}>
                                <p className="text-lg font-bold transition-colors" style={{color: isAligned ? (theme.name === 'أبيض وأسود' ? '#ffffff' : theme.palette[0]) : 'var(--text-color)'}}>
                                     {isAligned ? "هذا هو اتجاه القبلة" : `اتجاه القبلة: ${Math.round(qiblaDirection)}°`}
                                </p>
                                <p className="text-xs themed-text-muted mt-1">
                                    {isAligned ? "تقبل الله طاعتكم" : `قم بمحاذاة السهم ${isDefaultTheme ? 'الأسود' : 'الأخضر'} مع علامة الشمال (ش)`}
                                </p>
                            </div>
                        )}
                        
                        <p className="text-center text-sm mt-4 opacity-70 themed-text-muted">
                            (يجب تفعيل الموقع للهاتف لحساب الموقع بدقه)
                        </p>
                    </div>
                )}

                {activeMode === 'visual' && config?.location && (
                    <VisualQibla lat={config.location.lat} lng={config.location.lng} theme={theme} />
                )}

                {activeMode === 'ar' && qiblaDirection !== null && (
                    <ARQibla qiblaDirection={qiblaDirection} heading={heading} isAligned={isAligned} theme={theme} />
                )}

                {activeMode === 'sun_moon' && config?.location && qiblaDirection !== null && (
                    <SunMoonQibla lat={config.location.lat} lng={config.location.lng} qiblaDirection={qiblaDirection} heading={heading} theme={theme} />
                )}

                {activeMode === 'shadow' && config?.location && qiblaDirection !== null && (
                    <ShadowQibla lat={config.location.lat} lng={config.location.lng} qiblaDirection={qiblaDirection} heading={heading} theme={theme} />
                )}
                <div className="w-full h-24 shrink-0"></div>
            </main>
            
            <BottomBar onHomeClick={onBack} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
}

export default Qibla;
