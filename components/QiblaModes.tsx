import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SunCalc from 'suncalc';
import { useLanguage } from '../context/LanguageContext';
import { InAppPermissionModal } from './InAppPermissionModal';
import { requestCameraPermission } from '../utils/permissionHelper';
import { hexToRgba } from '../utils/flatDesignTokens';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

const getQiblaModeStyles = (theme: any) => {
    const isBlackTheme =
        theme?.bgColor === '#000000' ||
        theme?.name === 'أبيض وأسود' ||
        theme?.name === 'اسود' ||
        theme?.name === 'black';
    const primaryColor = isBlackTheme ? '#FFFFFF' : (theme?.palette?.[0] || theme?.accent || '#2E7D5E');
    const btnTextColor = isBlackTheme ? '#000000' : '#FFFFFF';
    const surfaceCardClass = isBlackTheme
        ? 'bg-[#18181b] text-white'
        : 'bg-white dark:bg-[#1E293B] text-slate-800 dark:text-white';
    const softRowClass = isBlackTheme
        ? 'bg-white/5 text-white'
        : 'bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white';

    return {
        isBlackTheme,
        primaryColor,
        btnTextColor,
        surfaceCardClass,
        softRowClass
    };
};

export const VisualQibla = ({ lat, lng, theme }: { lat: number, lng: number, theme: any, cardBorderColor?: string }) => {
    const { language } = useLanguage();
    const isEn = language === 'en';
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const { isBlackTheme, primaryColor, surfaceCardClass } = getQiblaModeStyles(theme);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOnline) {
        return (
            <div className={`app-page-card border-0 w-full h-full rounded-3xl flex flex-col items-center justify-center p-6 text-center ${surfaceCardClass}`}>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>
                    <i className="fa-solid fa-wifi text-4xl opacity-70" style={{ color: primaryColor }}></i>
                </div>
                <h3 className="text-xl font-black mb-2">
                    {isEn ? 'No Internet Connection' : 'لا يوجد اتصال بالإنترنت'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {isEn 
                        ? 'Visual map requires an active internet connection to load map tiles. Please check your network and try again.' 
                        : 'الخريطة المرئية تتطلب اتصالاً بالإنترنت لتحميل الخرائط. يرجى التحقق من اتصالك والمحاولة مرة أخرى.'}
                </p>
            </div>
        );
    }

    return (
        <div className={`app-page-card border-0 w-full h-full rounded-3xl overflow-hidden relative z-0 ${surfaceCardClass}`}>
            <MapContainer center={[lat, lng]} zoom={4} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[lat, lng]} />
                <Marker position={[KAABA_LAT, KAABA_LNG]} />
                <Polyline positions={[[lat, lng], [KAABA_LAT, KAABA_LNG]]} color={primaryColor} weight={3} dashArray="5, 10" />
            </MapContainer>
        </div>
    );
};

export const ARQibla = ({ qiblaDirection, heading, isAligned, theme }: any) => {
    const { language } = useLanguage();
    const isEn = language === 'en';
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState('');
    const [showCameraPermissionModal, setShowCameraPermissionModal] = useState(false);
    const { primaryColor, btnTextColor } = getQiblaModeStyles(theme);

    const startCamera = async () => {
        try {
            setError('');
            const perm = await requestCameraPermission();
            if (!perm.granted) {
                setError(isEn ? 'Unable to access camera. Please grant camera permission.' : 'تعذر الوصول إلى الكاميرا. يرجى منح الصلاحية.');
                setShowCameraPermissionModal(true);
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.muted = true;
                try {
                    await videoRef.current.play();
                } catch (err: any) {
                    const isAutoplayError = 
                        err.name === 'NotAllowedError' || 
                        (err.message && (
                            err.message.includes('user agent') || 
                            err.message.includes('platform') || 
                            err.message.includes('permission') ||
                            err.message.includes('interact')
                        ));

                    if (err.name !== 'AbortError' && !isAutoplayError) {
                        console.error('Camera video play failed:', err);
                    }
                }
            }
        } catch (err) {
            setError(isEn ? 'Unable to access camera. Please grant camera permission.' : 'تعذر الوصول إلى الكاميرا. يرجى منح الصلاحية.');
            setShowCameraPermissionModal(true);
        }
    };

    useEffect(() => {
        startCamera();
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isEn]);

    const rotation = qiblaDirection - heading;

    return (
        <div className="app-page-card border-0 w-full h-full relative rounded-3xl overflow-hidden bg-black flex flex-col items-center justify-center">
            {error ? (
                <div className="p-5 text-center space-y-3 z-10">
                    <p className="text-red-400 text-xs sm:text-sm font-bold">{error}</p>
                    <button
                        type="button"
                        onClick={() => setShowCameraPermissionModal(true)}
                        className="app-page-card border-0 px-5 py-2.5 rounded-2xl text-xs font-black cursor-pointer transition-all"
                        style={{ backgroundColor: primaryColor, color: btnTextColor }}
                    >
                        {isEn ? 'Grant Camera Permission' : 'منح إذن الكاميرا الآن'}
                    </button>
                </div>
            ) : (
                <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-60" />
            )}

            <InAppPermissionModal
                isOpen={showCameraPermissionModal}
                type="camera"
                onClose={() => setShowCameraPermissionModal(false)}
                onGranted={() => {
                    setShowCameraPermissionModal(false);
                    startCamera();
                }}
            />
            
            <div className="relative z-10 flex flex-col items-center justify-center flex-1 p-4">
                <div 
                    className="w-64 h-64 rounded-full border-4 flex items-center justify-center transition-all duration-300" 
                    style={{ 
                        borderColor: isAligned ? '#22c55e' : 'rgba(255,255,255,0.32)',
                        boxShadow: isAligned
                            ? '0 0 32px rgba(34, 197, 94, 0.45), inset 0 0 24px rgba(34, 197, 94, 0.25)'
                            : '0 8px 24px rgba(0, 0, 0, 0.45), inset 0 2px 6px rgba(255, 255, 255, 0.14)'
                    }}
                >
                    <div className="absolute w-full h-full transition-transform duration-500 ease-out" style={{ transform: `rotate(${rotation}deg)` }}>
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <i className="fa-solid fa-kaaba text-5xl drop-shadow-lg" style={{ color: isAligned ? '#22c55e' : '#ffffff' }}></i>
                            <i className="fa-solid fa-chevron-down text-2xl mt-2 animate-bounce" style={{ color: isAligned ? '#22c55e' : '#ffffff' }}></i>
                        </div>
                    </div>
                    {isAligned && (
                        <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse"></div>
                    )}
                </div>
                <div 
                    className="mt-8 bg-black/75 backdrop-blur-md px-6 py-3 rounded-full text-white font-black text-base sm:text-lg border-0"
                >
                    {isAligned ? (isEn ? 'Facing Qibla' : 'أنت متجه للقبلة') : (isEn ? 'Point camera towards the Kaaba' : 'وجه الكاميرا نحو الكعبة')}
                </div>
            </div>
        </div>
    );
};

export const SunMoonQibla = ({ lat, lng, qiblaDirection, heading, theme }: any) => {
    const { language } = useLanguage();
    const isEn = language === 'en';
    const [time, setTime] = useState(new Date());
    const { isBlackTheme, primaryColor, surfaceCardClass, softRowClass } = getQiblaModeStyles(theme);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const sunPos = SunCalc.getPosition(time, lat, lng);
    const moonPos = SunCalc.getMoonPosition(time, lat, lng);

    const sunHeading = (sunPos.azimuth * 180 / Math.PI + 180) % 360;
    const moonHeading = (moonPos.azimuth * 180 / Math.PI + 180) % 360;

    const sunDiff = Math.abs((sunHeading - qiblaDirection + 540) % 360 - 180);
    const moonDiff = Math.abs((moonHeading - qiblaDirection + 540) % 360 - 180);

    const CompassDial = ({ targetHeading, targetIcon, targetColor }: any) => (
        <div 
            className={`app-page-card border-0 relative w-64 h-64 rounded-full flex items-center justify-center mx-auto my-6 ${surfaceCardClass}`}
        >
            {/* Phone heading indicator (fixed at top) */}
            <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 w-9 h-9 rounded-full bg-red-500 z-20 flex items-center justify-center border-0"
            >
                <i className="fa-solid fa-mobile-screen text-white text-sm"></i>
            </div>
            
            {/* Rotating dial */}
            <div className="absolute w-full h-full transition-transform duration-300 ease-out" style={{ transform: `rotate(${-heading}deg)` }}>
                {/* North marker */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 text-sm font-black opacity-75" style={{ color: primaryColor }}>
                    {isEn ? 'N' : 'ش'}
                </div>
                
                {/* Qibla marker */}
                <div className="absolute w-full h-full" style={{ transform: `rotate(${qiblaDirection}deg)` }}>
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <i className="fa-solid fa-kaaba text-3xl" style={{ color: '#22c55e' }}></i>
                    </div>
                    {/* Line to Qibla */}
                    <div className="absolute top-16 bottom-1/2 left-1/2 w-1 -translate-x-1/2 bg-green-500 opacity-50 rounded-full"></div>
                </div>

                {/* Target marker (Sun/Moon/Shadow) */}
                <div className="absolute w-full h-full" style={{ transform: `rotate(${targetHeading}deg)` }}>
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <i className={`fa-solid ${targetIcon} text-4xl`} style={{ color: targetColor }}></i>
                    </div>
                    {/* Line to Target */}
                    <div className="absolute top-16 bottom-1/2 left-1/2 w-1 -translate-x-1/2 opacity-50 rounded-full" style={{ backgroundColor: targetColor }}></div>
                </div>
            </div>
            
            {/* Center dot */}
            <div 
                className="w-5 h-5 rounded-full z-10 border-0" 
                style={{ backgroundColor: primaryColor }}
            ></div>
        </div>
    );

    return (
        <div className="w-full shrink-0 flex flex-col gap-5 pb-4" dir={isEn ? 'ltr' : 'rtl'}>
            <div className={`app-page-card border-0 p-6 sm:p-8 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden ${surfaceCardClass}`}>
                <div className={`absolute top-4 ${isEn ? 'left-4' : 'right-4'} text-yellow-500 opacity-10`}><i className="fa-solid fa-sun text-6xl"></i></div>
                <h3 className="text-2xl font-black mb-4" style={{ color: primaryColor }}>
                    {isEn ? 'Qibla Direction by Sun' : 'تحديد القبلة عن طريق الشمس'}
                </h3>
                
                <div className={`mb-6 p-4 rounded-2xl max-w-sm ${isBlackTheme ? 'bg-white/10' : 'bg-amber-50/90 dark:bg-amber-950/30'}`}>
                    <p className="text-sm leading-relaxed font-bold text-amber-700 dark:text-amber-300">
                        {isEn 
                            ? 'Point your device (red marker) towards the Sun in the sky; the Kaaba arrow will indicate the Qibla.' 
                            : 'وجه هاتفك (العلامة الحمراء) نحو الشمس في السماء، وسيشير سهم الكعبة إلى القبلة.'}
                    </p>
                </div>
                
                <CompassDial targetHeading={sunHeading} targetIcon="fa-sun" targetColor="#eab308" />

                <div className="w-full space-y-2.5 mb-4">
                    <div className={`flex justify-between items-center p-3.5 rounded-2xl ${softRowClass}`}>
                        <span className="text-sm font-bold opacity-80">{isEn ? 'Sun Direction:' : 'اتجاه الشمس:'}</span>
                        <span className="font-mono text-lg font-black tabular-nums">{Math.round(sunHeading)}°</span>
                    </div>
                    <div className={`flex justify-between items-center p-3.5 rounded-2xl ${softRowClass}`}>
                        <span className="text-sm font-bold opacity-80">{isEn ? 'Qibla Direction:' : 'اتجاه القبلة:'}</span>
                        <span className="font-mono text-lg font-black tabular-nums" style={{ color: primaryColor }}>{Math.round(qiblaDirection)}°</span>
                    </div>
                </div>

                <div className={`p-4 rounded-2xl w-full ${isBlackTheme ? 'bg-white/10' : 'bg-amber-50/90 dark:bg-amber-950/30'}`}>
                    <p className="font-black text-amber-600 dark:text-amber-400 text-sm">
                        {isEn 
                            ? `Qibla is ${Math.round(sunDiff)}° away from the Sun` 
                            : `القبلة تبعد عن الشمس بـ ${Math.round(sunDiff)} درجة`}
                    </p>
                </div>
            </div>

            <div className={`app-page-card border-0 p-6 sm:p-8 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden ${surfaceCardClass}`}>
                <div className={`absolute top-4 ${isEn ? 'left-4' : 'right-4'} text-blue-400 opacity-10`}><i className="fa-solid fa-moon text-6xl"></i></div>
                <h3 className="text-2xl font-black mb-4" style={{ color: primaryColor }}>
                    {isEn ? 'Qibla Direction by Moon' : 'تحديد القبلة عن طريق القمر'}
                </h3>
                
                <div className={`mb-6 p-4 rounded-2xl max-w-sm ${isBlackTheme ? 'bg-white/10' : 'bg-blue-50/90 dark:bg-blue-950/30'}`}>
                    <p className="text-sm leading-relaxed font-bold text-blue-700 dark:text-blue-300">
                        {isEn 
                            ? 'Point your device (red marker) towards the Moon in the sky; the Kaaba arrow will indicate the Qibla.' 
                            : 'وجه هاتفك (العلامة الحمراء) نحو القمر في السماء، وسيشير سهم الكعبة إلى القبلة.'}
                    </p>
                </div>
                
                <CompassDial targetHeading={moonHeading} targetIcon="fa-moon" targetColor="#60a5fa" />

                <div className="w-full space-y-2.5 mb-4">
                    <div className={`flex justify-between items-center p-3.5 rounded-2xl ${softRowClass}`}>
                        <span className="text-sm font-bold opacity-80">{isEn ? 'Moon Direction:' : 'اتجاه القمر:'}</span>
                        <span className="font-mono text-lg font-black tabular-nums">{Math.round(moonHeading)}°</span>
                    </div>
                    <div className={`flex justify-between items-center p-3.5 rounded-2xl ${softRowClass}`}>
                        <span className="text-sm font-bold opacity-80">{isEn ? 'Qibla Direction:' : 'اتجاه القبلة:'}</span>
                        <span className="font-mono text-lg font-black tabular-nums" style={{ color: primaryColor }}>{Math.round(qiblaDirection)}°</span>
                    </div>
                </div>

                <div className={`p-4 rounded-2xl w-full ${isBlackTheme ? 'bg-white/10' : 'bg-blue-50/90 dark:bg-blue-950/30'}`}>
                    <p className="font-black text-blue-600 dark:text-blue-400 text-sm">
                        {isEn 
                            ? `Qibla is ${Math.round(moonDiff)}° away from the Moon` 
                            : `القبلة تبعد عن القمر بـ ${Math.round(moonDiff)} درجة`}
                    </p>
                </div>
            </div>
        </div>
    );
};

export const ShadowQibla = ({ lat, lng, qiblaDirection, heading, theme }: any) => {
    const { language } = useLanguage();
    const isEn = language === 'en';
    const [time, setTime] = useState(new Date());
    const { isBlackTheme, primaryColor, surfaceCardClass, softRowClass } = getQiblaModeStyles(theme);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const sunPos = SunCalc.getPosition(time, lat, lng);
    const sunHeading = (sunPos.azimuth * 180 / Math.PI + 180) % 360;
    const shadowHeading = (sunHeading + 180) % 360;
    const shadowDiff = Math.abs((shadowHeading - qiblaDirection + 540) % 360 - 180);

    return (
        <div className={`app-page-card border-0 w-full shrink-0 flex flex-col items-center justify-start p-6 sm:p-8 rounded-3xl text-center relative overflow-hidden mb-4 ${surfaceCardClass}`} dir={isEn ? 'ltr' : 'rtl'}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                <i className="fa-solid fa-person-rays text-[15rem]"></i>
            </div>
            
            <div className="z-10 flex flex-col items-center w-full">
                <h3 className="text-2xl font-black mb-4" style={{ color: primaryColor }}>
                    {isEn ? 'Qibla Direction by Shadow' : 'تحديد القبلة عن طريق الظل'}
                </h3>
                
                <div className={`mb-6 p-4 rounded-2xl w-full max-w-md ${isBlackTheme ? 'bg-white/10' : 'bg-emerald-50/90 dark:bg-emerald-950/30'}`}>
                    <p className="text-sm leading-relaxed font-bold text-emerald-700 dark:text-emerald-300">
                        {isEn 
                            ? 'Place a stick vertically on flat ground. Its shadow points directly opposite to the Sun. Point your device (red marker) towards the shadow, and the Kaaba arrow will point to the Qibla.' 
                            : 'ضع عصا بشكل عمودي على الأرض المستوية. ظل العصا يشير إلى الاتجاه المعاكس للشمس. وجه هاتفك (العلامة الحمراء) نحو الظل، وسيشير سهم الكعبة إلى القبلة.'}
                    </p>
                </div>

                <div 
                    className={`app-page-card border-0 relative w-64 h-64 rounded-full flex items-center justify-center mx-auto my-6 ${surfaceCardClass}`}
                >
                    {/* Phone heading indicator */}
                    <div 
                        className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 w-9 h-9 rounded-full bg-red-500 z-20 flex items-center justify-center border-0"
                    >
                        <i className="fa-solid fa-mobile-screen text-white text-sm"></i>
                    </div>
                    
                    {/* Rotating dial */}
                    <div className="absolute w-full h-full transition-transform duration-300 ease-out" style={{ transform: `rotate(${-heading}deg)` }}>
                        {/* North marker */}
                        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 text-sm font-black opacity-75" style={{ color: primaryColor }}>
                            {isEn ? 'N' : 'ش'}
                        </div>
                        
                        {/* Qibla marker */}
                        <div className="absolute w-full h-full" style={{ transform: `rotate(${qiblaDirection}deg)` }}>
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                <i className="fa-solid fa-kaaba text-3xl" style={{ color: '#22c55e' }}></i>
                            </div>
                            {/* Line to Qibla */}
                            <div className="absolute top-16 bottom-1/2 left-1/2 w-1 -translate-x-1/2 bg-green-500 opacity-50 rounded-full"></div>
                        </div>

                        {/* Shadow marker */}
                        <div className="absolute w-full h-full" style={{ transform: `rotate(${shadowHeading}deg)` }}>
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                <i className="fa-solid fa-person-rays text-4xl" style={{ color: primaryColor }}></i>
                            </div>
                            {/* Line to Shadow */}
                            <div className="absolute top-16 bottom-1/2 left-1/2 w-1 -translate-x-1/2 opacity-50 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                        </div>
                    </div>
                    
                    {/* Center dot */}
                    <div 
                        className="w-5 h-5 rounded-full z-10 border-0" 
                        style={{ backgroundColor: primaryColor }}
                    ></div>
                </div>

                <div className="w-full space-y-2.5 mt-4">
                    <div className={`flex justify-between items-center p-3.5 rounded-2xl ${softRowClass}`}>
                        <span className="text-sm font-bold opacity-80">{isEn ? 'Current Shadow Direction:' : 'اتجاه الظل الحالي:'}</span>
                        <span className="font-mono text-lg font-black tabular-nums">{Math.round(shadowHeading)}°</span>
                    </div>
                    <div className={`flex justify-between items-center p-3.5 rounded-2xl ${softRowClass}`}>
                        <span className="text-sm font-bold opacity-80">{isEn ? 'Qibla Direction:' : 'اتجاه القبلة:'}</span>
                        <span className="font-mono text-lg font-black tabular-nums" style={{ color: primaryColor }}>{Math.round(qiblaDirection)}°</span>
                    </div>
                </div>

                <div 
                    className="mt-4 p-4 rounded-2xl w-full"
                    style={{ backgroundColor: hexToRgba(primaryColor, isBlackTheme ? 0.14 : 0.09) }}
                >
                    <p className="font-black text-sm" style={{ color: primaryColor }}>
                        {isEn 
                            ? `Qibla is ${Math.round(shadowDiff)}° away from the Shadow` 
                            : `القبلة تبعد عن الظل بـ ${Math.round(shadowDiff)} درجة`}
                    </p>
                </div>

            </div>
        </div>
    );
};
