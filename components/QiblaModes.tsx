import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SunCalc from 'suncalc';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

export const VisualQibla = ({ lat, lng, theme }: { lat: number, lng: number, theme: any }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

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
            <div className="w-full h-full rounded-2xl flex flex-col items-center justify-center p-6 text-center themed-card border-2" style={{ borderColor: `${theme.palette[0]}30` }}>
                <i className="fa-solid fa-wifi text-6xl mb-4 opacity-50" style={{ color: theme.palette[0] }}></i>
                <h3 className="text-xl font-bold mb-2">لا يوجد اتصال بالإنترنت</h3>
                <p className="opacity-70">الخريطة المرئية تتطلب اتصالاً بالإنترنت لتحميل الخرائط. يرجى التحقق من اتصالك والمحاولة مرة أخرى.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg border-2 relative z-0" style={{ borderColor: `${theme.palette[0]}30` }}>
            <MapContainer center={[lat, lng]} zoom={4} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[lat, lng]} />
                <Marker position={[KAABA_LAT, KAABA_LNG]} />
                <Polyline positions={[[lat, lng], [KAABA_LAT, KAABA_LNG]]} color="red" weight={3} dashArray="5, 10" />
            </MapContainer>
        </div>
    );
};

export const ARQibla = ({ qiblaDirection, heading, isAligned, theme }: any) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let stream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.muted = true;
                    const playPromise = videoRef.current.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(err => {
                            if (err.name !== 'AbortError') {
                                console.error('Video play failed:', err);
                            }
                        });
                    }
                }
            } catch (err) {
                setError('تعذر الوصول إلى الكاميرا. يرجى منح الصلاحية.');
            }
        };
        startCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const rotation = qiblaDirection - heading;

    return (
        <div className="w-full h-full relative rounded-2xl overflow-hidden bg-black flex flex-col items-center justify-center shadow-lg">
            {error ? (
                <p className="text-red-500 p-4 text-center">{error}</p>
            ) : (
                <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-60" />
            )}
            
            <div className="relative z-10 flex flex-col items-center justify-center flex-1">
                <div className="w-64 h-64 rounded-full border-4 flex items-center justify-center transition-all duration-300" 
                     style={{ borderColor: isAligned ? '#22c55e' : 'rgba(255,255,255,0.3)' }}>
                    <div className="absolute w-full h-full transition-transform duration-500 ease-out" style={{ transform: `rotate(${rotation}deg)` }}>
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <i className="fa-solid fa-kaaba text-5xl" style={{ color: isAligned ? '#22c55e' : '#ffffff' }}></i>
                            <i className="fa-solid fa-chevron-down text-2xl mt-2 animate-bounce" style={{ color: isAligned ? '#22c55e' : '#ffffff' }}></i>
                        </div>
                    </div>
                    {isAligned && (
                        <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse"></div>
                    )}
                </div>
                <div className="mt-8 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full text-white font-bold text-lg border border-white/20">
                    {isAligned ? 'أنت متجه للقبلة' : 'وجه الكاميرا نحو الكعبة'}
                </div>
            </div>
        </div>
    );
};

export const SunMoonQibla = ({ lat, lng, qiblaDirection, heading, theme }: any) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const sunPos = SunCalc.getPosition(time, lat, lng);
    const moonPos = SunCalc.getMoonPosition(time, lat, lng);

    const sunHeading = (sunPos.azimuth * 180 / Math.PI + 180) % 360;
    const moonHeading = (moonPos.azimuth * 180 / Math.PI + 180) % 360;

    const sunDiff = Math.abs(sunHeading - qiblaDirection);
    const moonDiff = Math.abs(moonHeading - qiblaDirection);

    const CompassDial = ({ targetHeading, targetIcon, targetColor, label }: any) => (
        <div className="relative w-64 h-64 rounded-full border-4 flex items-center justify-center mx-auto my-6 shadow-lg" style={{ borderColor: `${theme.palette[0]}50`, backgroundColor: `${theme.palette[0]}0a` }}>
            {/* Phone heading indicator (fixed at top) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 w-8 h-8 rounded-full bg-red-500 z-20 shadow-md flex items-center justify-center border-2 border-white dark:border-gray-800">
                <i className="fa-solid fa-mobile-screen text-white text-sm"></i>
            </div>
            
            {/* Rotating dial */}
            <div className="absolute w-full h-full transition-transform duration-300 ease-out" style={{ transform: `rotate(${-heading}deg)` }}>
                {/* North marker */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-sm font-bold opacity-50" style={{ color: theme.palette[0] }}>N</div>
                
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
            <div className="w-4 h-4 rounded-full z-10 border-2 border-white dark:border-gray-800" style={{ backgroundColor: theme.palette[0] }}></div>
        </div>
    );

    return (
        <div className="w-full shrink-0 flex flex-col gap-6 pb-8">
            <div className="themed-card p-8 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden shadow-md">
                <div className="absolute top-4 right-4 text-yellow-500 opacity-10"><i className="fa-solid fa-sun text-6xl"></i></div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: theme.palette[0] }}>تحديد القبلة عن طريق الشمس</h3>
                
                <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 max-w-sm shadow-sm backdrop-blur-sm">
                    <p className="text-sm leading-relaxed font-bold text-yellow-700 dark:text-yellow-300">
                        وجه هاتفك (العلامة الحمراء) نحو الشمس في السماء، وسيشير سهم الكعبة إلى القبلة.
                    </p>
                </div>
                
                <CompassDial targetHeading={sunHeading} targetIcon="fa-sun" targetColor="#eab308" label="الشمس" />

                <div className="w-full space-y-2 mb-4">
                    <div className="flex justify-between items-center p-3 rounded-lg themed-bg-alt">
                        <span className="text-sm font-bold">اتجاه الشمس:</span>
                        <span className="font-mono text-lg">{Math.round(sunHeading)}°</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg themed-bg-alt">
                        <span className="text-sm font-bold">اتجاه القبلة:</span>
                        <span className="font-mono text-lg">{Math.round(qiblaDirection)}°</span>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 w-full">
                    <p className="font-bold text-yellow-600 dark:text-yellow-400 text-sm">
                        القبلة تبعد عن الشمس بـ {Math.round(sunDiff)} درجة
                    </p>
                </div>
            </div>

            <div className="themed-card p-8 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden shadow-md">
                <div className="absolute top-4 right-4 text-blue-400 opacity-10"><i className="fa-solid fa-moon text-6xl"></i></div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: theme.palette[0] }}>تحديد القبلة عن طريق القمر</h3>
                
                <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 max-w-sm shadow-sm backdrop-blur-sm">
                    <p className="text-sm leading-relaxed font-bold text-blue-700 dark:text-blue-300">
                        وجه هاتفك (العلامة الحمراء) نحو القمر في السماء، وسيشير سهم الكعبة إلى القبلة.
                    </p>
                </div>
                
                <CompassDial targetHeading={moonHeading} targetIcon="fa-moon" targetColor="#60a5fa" label="القمر" />

                <div className="w-full space-y-2 mb-4">
                    <div className="flex justify-between items-center p-3 rounded-lg themed-bg-alt">
                        <span className="text-sm font-bold">اتجاه القمر:</span>
                        <span className="font-mono text-lg">{Math.round(moonHeading)}°</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg themed-bg-alt">
                        <span className="text-sm font-bold">اتجاه القبلة:</span>
                        <span className="font-mono text-lg">{Math.round(qiblaDirection)}°</span>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 w-full">
                    <p className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                        القبلة تبعد عن القمر بـ {Math.round(moonDiff)} درجة
                    </p>
                </div>
            </div>
        </div>
    );
};

export const ShadowQibla = ({ lat, lng, qiblaDirection, heading, theme }: any) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const sunPos = SunCalc.getPosition(time, lat, lng);
    const sunHeading = (sunPos.azimuth * 180 / Math.PI + 180) % 360;
    const shadowHeading = (sunHeading + 180) % 360;
    const shadowDiff = Math.abs(shadowHeading - qiblaDirection);

    return (
        <div className="w-full shrink-0 flex flex-col items-center justify-start themed-card p-8 rounded-2xl text-center relative overflow-hidden shadow-md mb-8">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
                <i className="fa-solid fa-person-rays text-[15rem]"></i>
            </div>
            
            <div className="z-10 flex flex-col items-center w-full">
                <h3 className="text-2xl font-bold mb-4" style={{ color: theme.palette[0] }}>تحديد القبلة عن طريق الظل</h3>
                
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 w-full max-w-md shadow-sm backdrop-blur-sm">
                    <p className="text-sm leading-relaxed font-bold text-emerald-700 dark:text-emerald-300">
                        ضع عصا بشكل عمودي على الأرض المستوية. ظل العصا يشير إلى الاتجاه المعاكس للشمس. وجه هاتفك (العلامة الحمراء) نحو الظل، وسيشير سهم الكعبة إلى القبلة.
                    </p>
                </div>

                <div className="relative w-64 h-64 rounded-full border-4 flex items-center justify-center mx-auto my-6 shadow-lg" style={{ borderColor: `${theme.palette[0]}50`, backgroundColor: `${theme.palette[0]}0a` }}>
                    {/* Phone heading indicator */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 w-8 h-8 rounded-full bg-red-500 z-20 shadow-md flex items-center justify-center border-2 border-white dark:border-gray-800">
                        <i className="fa-solid fa-mobile-screen text-white text-sm"></i>
                    </div>
                    
                    {/* Rotating dial */}
                    <div className="absolute w-full h-full transition-transform duration-300 ease-out" style={{ transform: `rotate(${-heading}deg)` }}>
                        {/* North marker */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-sm font-bold opacity-50" style={{ color: theme.palette[0] }}>N</div>
                        
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
                                <i className="fa-solid fa-person-rays text-4xl" style={{ color: theme.palette[0] }}></i>
                            </div>
                            {/* Line to Shadow */}
                            <div className="absolute top-16 bottom-1/2 left-1/2 w-1 -translate-x-1/2 opacity-50 rounded-full" style={{ backgroundColor: theme.palette[0] }}></div>
                        </div>
                    </div>
                    
                    {/* Center dot */}
                    <div className="w-4 h-4 rounded-full z-10 border-2 border-white dark:border-gray-800" style={{ backgroundColor: theme.palette[0] }}></div>
                </div>

                <div className="w-full space-y-3 mt-4">
                    <div className="flex justify-between items-center p-3 rounded-lg themed-bg-alt">
                        <span className="text-sm font-bold">اتجاه الظل الحالي:</span>
                        <span className="font-mono text-lg">{Math.round(shadowHeading)}°</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg themed-bg-alt">
                        <span className="text-sm font-bold">اتجاه القبلة:</span>
                        <span className="font-mono text-lg">{Math.round(qiblaDirection)}°</span>
                    </div>
                </div>

                <div className="mt-4 p-4 rounded-xl border w-full" style={{ backgroundColor: `${theme.palette[0]}1a`, borderColor: `${theme.palette[0]}4d` }}>
                    <p className="font-bold text-sm" style={{ color: theme.palette[0] }}>
                        القبلة تبعد عن الظل بـ {Math.round(shadowDiff)} درجة
                    </p>
                </div>
            </div>
        </div>
    );
};
