import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SunCalc from 'suncalc';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { InAppPermissionModal } from './InAppPermissionModal';
import { requestCameraPermission } from '../utils/permissionHelper';
import { hexToRgba } from '../utils/flatDesignTokens';
import { Kaaba3DIcon, KaabaAR3DMonument, Sun3DIcon, Moon3DIcon, Shadow3DIcon, Phone3DIcon, Qibla3DArrow, Compass3DLetter, Compass3DCenterDome } from './Qibla3DIcons';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

const calcDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const buildQiblaArcPoints = (lat1: number, lng1: number, lat2: number, lng2: number, steps = 36): [number, number][] => {
    const dLat = lat2 - lat1;
    const dLng = lng2 - lng1;
    const dist = Math.hypot(dLat, dLng);
    if (dist < 0.005) {
        return [[lat1, lng1], [lat2, lng2]];
    }
    const midLat = (lat1 + lat2) / 2;
    const midLng = (lng1 + lng2) / 2;
    const arcLift = Math.min(Math.max(dist * 0.14, 0.08), 8);
    const ctrlLat = midLat + arcLift;
    const ctrlLng = midLng - (dLat / dist) * (arcLift * 0.35);

    const points: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const oneMinusT = 1 - t;
        const pLat = oneMinusT * oneMinusT * lat1 + 2 * oneMinusT * t * ctrlLat + t * t * lat2;
        const pLng = oneMinusT * oneMinusT * lng1 + 2 * oneMinusT * t * ctrlLng + t * t * lng2;
        points.push([pLat, pLng]);
    }
    return points;
};

interface VisualQiblaMapControllerProps {
    lat: number;
    lng: number;
    fitTrigger: number;
    is3DMode: boolean;
    mapInstanceRef: React.MutableRefObject<L.Map | null>;
    onZoomChange: (zoom: number) => void;
}

const VisualQiblaMapController = ({
    lat,
    lng,
    fitTrigger,
    is3DMode,
    mapInstanceRef,
    onZoomChange
}: VisualQiblaMapControllerProps) => {
    const map = useMap();

    useEffect(() => {
        mapInstanceRef.current = map;
        onZoomChange(map.getZoom());

        const handleZoomEnd = () => {
            onZoomChange(map.getZoom());
        };

        map.on('zoomend', handleZoomEnd);
        return () => {
            map.off('zoomend', handleZoomEnd);
            if (mapInstanceRef.current === map) {
                mapInstanceRef.current = null;
            }
        };
    }, [map, mapInstanceRef, onZoomChange]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            map.invalidateSize({ animate: false });
        }, 380);
        return () => window.clearTimeout(timer);
    }, [map, is3DMode]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            map.invalidateSize();
            const bounds = L.latLngBounds([
                [lat, lng],
                [KAABA_LAT, KAABA_LNG]
            ]);
            map.fitBounds(bounds, {
                padding: [62, 62],
                maxZoom: 14,
                animate: fitTrigger > 0,
                duration: 0.75
            });
        }, 120);

        return () => window.clearTimeout(timer);
    }, [map, lat, lng, fitTrigger]);

    return null;
};

const createKaabaMapIcon = (label: string, isFocused = false) =>
    L.divIcon({
        className: 'qibla-3d-divicon',
        iconSize: [78, 92],
        iconAnchor: [39, 80],
        html: `
            <div class="qibla-3d-marker-root ${isFocused ? 'is-focused' : ''}">
                <div class="qibla-3d-beacon-ring" style="color:${isFocused ? '#FBBF24' : '#F59E0B'};"></div>
                <div class="qibla-3d-marker-shadow"></div>
                <div class="qibla-3d-marker-stand">
                    <div class="qibla-3d-marker-bob">
                        <div class="qibla-3d-marker-tag" style="background:linear-gradient(135deg,#18181b,#27272a);color:#FDE68A;border:1px solid ${isFocused ? 'rgba(251,191,36,0.9)' : 'rgba(251,191,36,0.45)'};">${label}</div>
                        <svg width="52" height="56" viewBox="0 0 64 68" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 8px 10px rgba(0,0,0,0.38));">
                            <defs>
                                <linearGradient id="kMapTop" x1="12" y1="8" x2="52" y2="28" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stop-color="#475569"/>
                                    <stop offset="55%" stop-color="#1E293B"/>
                                    <stop offset="100%" stop-color="#0F172A"/>
                                </linearGradient>
                                <linearGradient id="kMapLeft" x1="10" y1="18" x2="32" y2="54" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stop-color="#334155"/>
                                    <stop offset="100%" stop-color="#0F172A"/>
                                </linearGradient>
                                <linearGradient id="kMapRight" x1="32" y1="22" x2="54" y2="54" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stop-color="#1E293B"/>
                                    <stop offset="100%" stop-color="#020617"/>
                                </linearGradient>
                                <linearGradient id="kMapGold" x1="10" y1="22" x2="54" y2="42" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stop-color="#FEF08A"/>
                                    <stop offset="45%" stop-color="#F59E0B"/>
                                    <stop offset="100%" stop-color="#B45309"/>
                                </linearGradient>
                                <linearGradient id="kMapBase" x1="8" y1="48" x2="56" y2="62" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stop-color="#F8FAFC"/>
                                    <stop offset="100%" stop-color="#CBD5E1"/>
                                </linearGradient>
                            </defs>
                            <path d="M32 63L8 51L32 39L56 51L32 63Z" fill="url(#kMapBase)" stroke="#94A3B8" stroke-width="1"/>
                            <path d="M8 51L32 63V60L8 48V51Z" fill="#94A3B8"/>
                            <path d="M56 51L32 63V60L56 48V51Z" fill="#64748B"/>
                            <path d="M12 20L32 10L52 20L32 30L12 20Z" fill="url(#kMapTop)"/>
                            <path d="M12 20L32 30V56L12 46V20Z" fill="url(#kMapLeft)"/>
                            <path d="M52 20L32 30V56L52 46V20Z" fill="url(#kMapRight)"/>
                            <path d="M12 26.5L32 36.5L52 26.5V31.5L32 41.5L12 31.5V26.5Z" fill="url(#kMapGold)"/>
                            <path d="M18 28.5L26 32.5M40 32.5L47 29" stroke="#FEF9C3" stroke-width="1.2" stroke-linecap="round" opacity="0.85"/>
                            <path d="M38.5 39.5L44.5 36.5V48.5L38.5 51.5V39.5Z" fill="url(#kMapGold)" stroke="#78350F" stroke-width="0.6"/>
                            <ellipse cx="32" cy="49" rx="1.6" ry="2.2" fill="#E2E8F0"/>
                            <ellipse cx="32" cy="49" rx="0.9" ry="1.4" fill="#0F172A"/>
                            <path d="M12 20L32 30L52 20" stroke="#FDE047" stroke-width="1.2" stroke-opacity="0.7" fill="none"/>
                        </svg>
                    </div>
                </div>
            </div>
        `
    });

const createUserLocationMapIcon = (pinColor: string, label: string, isFocused = false) =>
    L.divIcon({
        className: 'qibla-3d-divicon',
        iconSize: [70, 86],
        iconAnchor: [35, 74],
        html: `
            <div class="qibla-3d-marker-root ${isFocused ? 'is-focused' : ''}">
                <div class="qibla-3d-beacon-ring is-user" style="color:${pinColor};"></div>
                <div class="qibla-3d-marker-shadow is-user"></div>
                <div class="qibla-3d-marker-stand">
                    <div class="qibla-3d-marker-bob is-user">
                        <div class="qibla-3d-marker-tag" style="background:${pinColor};color:#FFFFFF;border:1px solid ${isFocused ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)'};">${label}</div>
                        <svg width="42" height="50" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 7px 10px rgba(0,0,0,0.34));">
                            <defs>
                                <radialGradient id="uPinBody" cx="35%" cy="28%" r="72%">
                                    <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.75"/>
                                    <stop offset="28%" stop-color="${pinColor}"/>
                                    <stop offset="100%" stop-color="#0F172A" stop-opacity="0.92"/>
                                </radialGradient>
                            </defs>
                            <path d="M24 4C13.507 4 5 12.507 5 23C5 36.2 21.4 51.2 23.15 52.75C23.63 53.18 24.37 53.18 24.85 52.75C26.6 51.2 43 36.2 43 23C43 12.507 34.493 4 24 4Z" fill="${pinColor}"/>
                            <path d="M24 4C13.507 4 5 12.507 5 23C5 36.2 21.4 51.2 23.15 52.75C23.63 53.18 24.37 53.18 24.85 52.75C26.6 51.2 43 36.2 43 23C43 12.507 34.493 4 24 4Z" fill="url(#uPinBody)" opacity="0.45"/>
                            <path d="M12.5 19.5C13.5 13 18.5 8.5 24 8.5" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" opacity="0.72"/>
                            <circle cx="24" cy="22" r="9.5" fill="#FFFFFF" fill-opacity="0.95"/>
                            <circle cx="24" cy="22" r="5" fill="${pinColor}"/>
                            <circle cx="22.3" cy="20.3" r="1.7" fill="#FFFFFF" opacity="0.9"/>
                        </svg>
                    </div>
                </div>
            </div>
        `
    });

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
    const [is3DMode, setIs3DMode] = useState(true);
    const [fitTrigger, setFitTrigger] = useState(0);
    const [focusedTarget, setFocusedTarget] = useState<'user' | 'kaaba' | null>(null);
    const [currentZoom, setCurrentZoom] = useState(4);

    const mapInstanceRef = useRef<L.Map | null>(null);
    const focusedTargetRef = useRef<'user' | 'kaaba' | null>(null);
    const previousViewRef = useRef<{ center: [number, number]; zoom: number } | null>(null);

    const { isBlackTheme, primaryColor, btnTextColor, surfaceCardClass } = getQiblaModeStyles(theme);

    const mapAccentColor = isBlackTheme ? '#D97706' : primaryColor;
    const distanceKm = useMemo(() => Math.round(calcDistanceKm(lat, lng, KAABA_LAT, KAABA_LNG)), [lat, lng]);
    const arcPoints = useMemo(() => buildQiblaArcPoints(lat, lng, KAABA_LAT, KAABA_LNG), [lat, lng]);
    const groundShadowPoints = useMemo<[number, number][]>(() => {
        const steps = 28;
        const points: [number, number][] = [];
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            points.push([
                lat + (KAABA_LAT - lat) * t,
                lng + (KAABA_LNG - lng) * t
            ]);
        }
        return points;
    }, [lat, lng]);

    const kaabaMarkerIcon = useMemo(
        () => createKaabaMapIcon(isEn ? 'Holy Kaaba' : 'الكعبة المشرفة', focusedTarget === 'kaaba'),
        [isEn, focusedTarget]
    );
    const userMarkerIcon = useMemo(
        () => createUserLocationMapIcon(mapAccentColor, isEn ? 'Your Location' : 'موقعك', focusedTarget === 'user'),
        [mapAccentColor, isEn, focusedTarget]
    );

    const handleMarkerFocusToggle = useCallback((target: 'user' | 'kaaba') => {
        const map = mapInstanceRef.current;
        if (!map) return;

        const currentFocus = focusedTargetRef.current;

        if (currentFocus === target) {
            const prev = previousViewRef.current;
            focusedTargetRef.current = null;
            setFocusedTarget(null);
            previousViewRef.current = null;

            if (prev) {
                map.flyTo(prev.center, prev.zoom, {
                    animate: true,
                    duration: 0.95
                });
            } else {
                const bounds = L.latLngBounds([
                    [lat, lng],
                    [KAABA_LAT, KAABA_LNG]
                ]);
                map.flyToBounds(bounds, {
                    padding: [62, 62],
                    maxZoom: 14,
                    animate: true,
                    duration: 0.95
                });
            }
            return;
        }

        if (currentFocus === null) {
            const center = map.getCenter();
            previousViewRef.current = {
                center: [center.lat, center.lng],
                zoom: map.getZoom()
            };
        }

        focusedTargetRef.current = target;
        setFocusedTarget(target);

        const targetCoords: [number, number] =
            target === 'kaaba' ? [KAABA_LAT, KAABA_LNG] : [lat, lng];

        map.flyTo(targetCoords, 17, {
            animate: true,
            duration: 1.15
        });
    }, [lat, lng]);

    const handleMarkerFocusToggleRef = useRef(handleMarkerFocusToggle);
    handleMarkerFocusToggleRef.current = handleMarkerFocusToggle;

    const userMarkerEventHandlers = useMemo(() => ({
        click: (e: L.LeafletMouseEvent) => {
            L.DomEvent.stopPropagation(e);
            handleMarkerFocusToggleRef.current('user');
        }
    }), []);

    const kaabaMarkerEventHandlers = useMemo(() => ({
        click: (e: L.LeafletMouseEvent) => {
            L.DomEvent.stopPropagation(e);
            handleMarkerFocusToggleRef.current('kaaba');
        }
    }), []);

    const handleCenterRoute = useCallback(() => {
        focusedTargetRef.current = null;
        setFocusedTarget(null);
        previousViewRef.current = null;
        setFitTrigger((c) => c + 1);
    }, []);

    const handleZoomIn = useCallback(() => {
        mapInstanceRef.current?.zoomIn();
    }, []);

    const handleZoomOut = useCallback(() => {
        mapInstanceRef.current?.zoomOut();
    }, []);

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
                <div className={`app-inner-3d-box border-0 w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>
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
        <div className="w-full h-full flex flex-col pt-1 pb-4">
            <div className="flex-1 min-h-0 w-full relative">
                <div className="qibla-3d-map-stage w-full h-full relative">
                    {/* Soft Floor Cast Shadow beneath the upright sculpted 3D map */}
                    <div
                        className={`qibla-3d-floor-shadow pointer-events-none ${is3DMode ? 'opacity-100' : 'opacity-0'}`}
                    />

                    {/* Upright 3D Sculpted Map Frame (no trapezoid tilt) */}
                    <div
                        className={`qibla-3d-map-board relative w-full h-full z-0 ${
                            is3DMode ? 'qibla-3d-active' : ''
                        } ${isBlackTheme ? 'qibla-3d-map-dark' : ''}`}
                    >
                        {/* Clipped Map Viewport */}
                        <div
                            className="qibla-3d-map-viewport relative w-full h-full rounded-[28px] overflow-hidden"
                            style={{
                                backgroundColor: isBlackTheme ? '#18181b' : '#e2e8f0'
                            }}
                        >
                            <MapContainer
                                center={[lat, lng]}
                                zoom={4}
                                minZoom={2}
                                maxZoom={19}
                                zoomControl={false}
                                style={{ height: '100%', width: '100%', background: 'transparent' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    maxZoom={19}
                                />
                                {is3DMode && (
                                    <TileLayer
                                        url="https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}"
                                        opacity={isBlackTheme ? 0.38 : 0.56}
                                        maxNativeZoom={16}
                                        maxZoom={19}
                                        className="qibla-3d-hillshade-layer"
                                    />
                                )}
                                <VisualQiblaMapController
                                    lat={lat}
                                    lng={lng}
                                    fitTrigger={fitTrigger}
                                    is3DMode={is3DMode}
                                    mapInstanceRef={mapInstanceRef}
                                    onZoomChange={setCurrentZoom}
                                />
                                {/* Ground-level cast shadow beneath the elevated 3D Qibla arc */}
                                {is3DMode && (
                                    <Polyline
                                        positions={groundShadowPoints}
                                        pathOptions={{
                                            color: '#0f172a',
                                            weight: 7,
                                            opacity: isBlackTheme ? 0.42 : 0.16,
                                            lineCap: 'round'
                                        }}
                                    />
                                )}
                                <Polyline
                                    positions={arcPoints}
                                    pathOptions={{
                                        color: '#0f172a',
                                        weight: is3DMode ? 9 : 6,
                                        opacity: is3DMode ? 0.2 : 0.14,
                                        lineCap: 'round'
                                    }}
                                />
                                <Polyline
                                    positions={arcPoints}
                                    pathOptions={{
                                        color: mapAccentColor,
                                        weight: is3DMode ? 6.5 : 5,
                                        opacity: is3DMode ? 0.38 : 0.28,
                                        lineCap: 'round'
                                    }}
                                />
                                <Polyline
                                    positions={arcPoints}
                                    pathOptions={{
                                        color: mapAccentColor,
                                        weight: is3DMode ? 3.8 : 3.2,
                                        opacity: 0.96,
                                        dashArray: '10 10',
                                        lineCap: 'round',
                                        className: 'qibla-3d-arc-flow'
                                    }}
                                />
                                {is3DMode && (
                                    <Polyline
                                        positions={arcPoints}
                                        pathOptions={{
                                            color: '#ffffff',
                                            weight: 1.4,
                                            opacity: 0.65,
                                            dashArray: '10 10',
                                            lineCap: 'round',
                                            className: 'qibla-3d-arc-flow'
                                        }}
                                    />
                                )}
                                <Marker
                                    position={[lat, lng]}
                                    icon={userMarkerIcon}
                                    eventHandlers={userMarkerEventHandlers}
                                />
                                <Marker
                                    position={[KAABA_LAT, KAABA_LNG]}
                                    icon={kaabaMarkerIcon}
                                    eventHandlers={kaabaMarkerEventHandlers}
                                />
                            </MapContainer>

                            {/* 3D Terrain Atmospheric Depth & Directional Lighting Sheen */}
                            {is3DMode && (
                                <>
                                    <div
                                        className="pointer-events-none absolute inset-x-0 top-0 h-20 z-[400]"
                                        style={{
                                            background: isBlackTheme
                                                ? 'linear-gradient(180deg, rgba(9,9,11,0.45) 0%, rgba(9,9,11,0) 100%)'
                                                : 'linear-gradient(180deg, rgba(15,23,42,0.12) 0%, rgba(255,255,255,0) 100%)'
                                        }}
                                    />
                                    <div
                                        className="pointer-events-none absolute inset-0 z-[400]"
                                        style={{
                                            boxShadow: isBlackTheme
                                                ? 'inset 0 8px 18px rgba(0,0,0,0.65), inset 0 -6px 14px rgba(255,255,255,0.08)'
                                                : 'inset 0 8px 18px rgba(15,23,42,0.14), inset 0 -6px 14px rgba(255,255,255,0.35)',
                                            background: isBlackTheme
                                                ? 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 44%, rgba(0,0,0,0.24) 100%)'
                                                : 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 46%, rgba(15,23,42,0.12) 100%)'
                                        }}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* إطار علوي تفاعلي يعرض المسافة وأزرار التحكم */}
                <div className="pointer-events-none absolute top-3 inset-x-3 z-20 flex items-center justify-between gap-2">
                    <div
                        className={`pointer-events-auto app-page-card border-0 px-3 py-1.5 rounded-2xl flex items-center gap-2 text-xs font-black backdrop-blur-md ${surfaceCardClass}`}
                        style={{
                            backgroundColor: isBlackTheme ? 'rgba(24,24,27,0.88)' : 'rgba(255,255,255,0.9)'
                        }}
                    >
                        <span
                            className="w-2.5 h-2.5 rounded-full animate-pulse shrink-0"
                            style={{ backgroundColor: mapAccentColor }}
                        ></span>
                        <span className="tabular-nums">
                            {distanceKm.toLocaleString(isEn ? 'en-US' : 'ar-EG')}{' '}
                            {isEn ? 'km to Kaaba' : 'كم إلى الكعبة'}
                        </span>
                    </div>

                    <div className="pointer-events-auto flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setIs3DMode((prev) => !prev)}
                            className={`app-page-card border-0 px-3 py-1.5 rounded-2xl text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${surfaceCardClass}`}
                            style={
                                is3DMode
                                    ? { backgroundColor: primaryColor, color: btnTextColor }
                                    : { backgroundColor: isBlackTheme ? 'rgba(24,24,27,0.88)' : 'rgba(255,255,255,0.9)' }
                            }
                            title={isEn ? 'Toggle 3D Map' : 'تبديل العرض ثلاثي الأبعاد'}
                        >
                            <i className="fa-solid fa-cube text-[11px]"></i>
                            <span>{is3DMode ? '3D' : '2D'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleCenterRoute}
                            className={`app-page-card border-0 w-8 h-8 rounded-2xl flex items-center justify-center transition-all active:scale-90 cursor-pointer ${surfaceCardClass}`}
                            style={{
                                backgroundColor: isBlackTheme ? 'rgba(24,24,27,0.88)' : 'rgba(255,255,255,0.9)',
                                color: mapAccentColor
                            }}
                            title={isEn ? 'Center Qibla Route' : 'توسيط مسار القبلة'}
                            aria-label={isEn ? 'Center Qibla Route' : 'توسيط مسار القبلة'}
                        >
                            <i className="fa-solid fa-crosshairs text-xs"></i>
                        </button>
                    </div>
                </div>

                {/* زرا التقريب والتبعيد (أيقونات فقط بالأسفل على الخريطة) */}
                <div className="pointer-events-none absolute bottom-3.5 left-3.5 z-20 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleZoomIn}
                        disabled={currentZoom >= 19}
                        className={`pointer-events-auto app-page-card border-0 w-9 h-9 rounded-2xl flex items-center justify-center transition-all active:scale-90 cursor-pointer disabled:opacity-45 disabled:cursor-default ${surfaceCardClass}`}
                        style={{
                            backgroundColor: isBlackTheme ? 'rgba(24,24,27,0.9)' : 'rgba(255,255,255,0.92)',
                            color: mapAccentColor
                        }}
                        title={isEn ? 'Zoom In' : 'تكبير الخريطة'}
                        aria-label={isEn ? 'Zoom In' : 'تكبير الخريطة'}
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onClick={handleZoomOut}
                        disabled={currentZoom <= 2}
                        className={`pointer-events-auto app-page-card border-0 w-9 h-9 rounded-2xl flex items-center justify-center transition-all active:scale-90 cursor-pointer disabled:opacity-45 disabled:cursor-default ${surfaceCardClass}`}
                        style={{
                            backgroundColor: isBlackTheme ? 'rgba(24,24,27,0.9)' : 'rgba(255,255,255,0.92)',
                            color: mapAccentColor
                        }}
                        title={isEn ? 'Zoom Out' : 'تصغير الخريطة'}
                        aria-label={isEn ? 'Zoom Out' : 'تصغير الخريطة'}
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const getARThemePalette = (
    theme: any,
    themeKey?: string,
    isNightMode?: boolean,
    homeThemeVariant?: string
) => {
    const isBlackTheme =
        Boolean(isNightMode) ||
        themeKey === 'black_gold' ||
        themeKey === 'deep_black' ||
        theme?.bgColor === '#000000' ||
        theme?.name === 'أبيض وأسود' ||
        theme?.name === 'اسود' ||
        theme?.name === 'black';

    if (isBlackTheme) {
        return {
            isBlackTheme: true,
            accent: '#f59e0b',
            accentLight: '#fde047',
            cardBg: 'radial-gradient(circle at 50% 42%, #27272a 0%, #18181b 54%, #09090b 100%)',
            cardBorder: '3px solid rgba(255,255,255,0.22)',
            cardShadow: '0 10px 0 #050507, 0 22px 38px rgba(0,0,0,0.82), inset 0 6px 18px rgba(0,0,0,0.72)',
            cardAlignedBorder: '3px solid rgba(34,197,94,0.8)',
            cardAlignedShadow: '0 10px 0 #064e3b, 0 22px 40px rgba(34,197,94,0.34), inset 0 6px 18px rgba(0,0,0,0.68)',
            vignetteBg: 'radial-gradient(circle at 50% 48%, rgba(245,158,11,0.08) 0%, rgba(9,9,11,0.48) 62%, rgba(9,9,11,0.86) 100%)',
            vignetteAlignedBg: 'radial-gradient(circle at 50% 48%, rgba(34,197,94,0.16) 0%, rgba(9,9,11,0.45) 62%, rgba(9,9,11,0.84) 100%)',
            gridColor: 'rgba(255,255,255,0.14)',
            pillBg: 'linear-gradient(145deg, rgba(39,39,42,0.88) 0%, rgba(9,9,11,0.92) 100%)',
            pillText: '#ffffff',
            pillBorder: '1px solid rgba(255,255,255,0.2)',
            pillShadow: '0 4px 0 rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.25)',
            dialOuterBg: 'radial-gradient(circle at 38% 30%, rgba(255,255,255,0.12) 0%, rgba(39,39,42,0.45) 65%, rgba(9,9,11,0.65) 100%)',
            dialOuterAlignedBg: 'radial-gradient(circle at 38% 30%, rgba(34,197,94,0.22) 0%, rgba(6,78,59,0.26) 65%, rgba(9,9,11,0.55) 100%)',
            dialOuterBorder: '3px solid rgba(255,255,255,0.28)',
            dialOuterShadow: '0 8px 0 rgba(0,0,0,0.65), 0 18px 34px rgba(0,0,0,0.65), inset 0 4px 16px rgba(255,255,255,0.14)',
            dialOuterAlignedShadow: '0 8px 0 rgba(20,83,45,0.85), 0 0 38px rgba(34,197,94,0.45), inset 0 4px 16px rgba(34,197,94,0.3)',
            dialInnerBg: 'radial-gradient(circle at 38% 30%, rgba(39,39,42,0.4) 0%, rgba(24,24,27,0.55) 65%, rgba(9,9,11,0.7) 100%)',
            dialInnerBorder: '1px solid rgba(255,255,255,0.16)',
            dialInnerShadow: 'inset 0 6px 18px rgba(0,0,0,0.55), inset 0 -3px 10px rgba(255,255,255,0.08)',
            ringBorder: '1.5px dashed rgba(255,255,255,0.18)',
            notchBg: 'linear-gradient(145deg, #f8fafc, #94a3b8)',
            notchIconColor: '#0f172a',
            tickColor: 'rgba(255,255,255,0.34)',
            cardinalSecondary: '#cbd5e1',
            beamGradient: 'linear-gradient(90deg, #fef08a 0%, #f59e0b 50%, #b45309 100%)',
            statusBg: 'linear-gradient(145deg, rgba(39,39,42,0.92) 0%, rgba(9,9,11,0.96) 100%)',
            statusText: '#ffffff',
            statusBorder: '1.5px solid rgba(255,255,255,0.24)',
            statusShadow: '0 5px 0 #020617, 0 12px 24px rgba(0,0,0,0.62), inset 0 1.5px 2px rgba(255,255,255,0.22)',
            errorCardBg: 'linear-gradient(145deg, rgba(39,39,42,0.92) 0%, rgba(9,9,11,0.96) 100%)',
            errorCardBorder: '1px solid rgba(248,113,113,0.4)',
            errorTextClass: 'text-red-300',
        };
    }

    const isSky = homeThemeVariant === 'sky' || themeKey === 'sky_mode' || theme?.bgColor?.toUpperCase() === '#E0F2FE';
    const isEmerald = homeThemeVariant === 'emerald' || themeKey === 'emerald_mode' || theme?.bgColor?.toUpperCase() === '#D1FAE5';
    const isBurgundy = homeThemeVariant === 'burgundy' || themeKey === 'burgundy_mode' || theme?.bgColor?.toUpperCase() === '#FFE4E6';

    if (isSky) {
        return {
            isBlackTheme: false,
            accent: '#0284c7',
            accentLight: '#7dd3fc',
            cardBg: 'linear-gradient(155deg, #FFFFFF 0%, #F0F9FF 48%, #BAE6FD 100%)',
            cardBorder: '3px solid rgba(2, 132, 199, 0.42)',
            cardShadow: '0 10px 0 rgba(3, 105, 161, 0.24), 0 20px 36px rgba(2, 132, 199, 0.18), inset 0 4px 16px rgba(255, 255, 255, 0.92)',
            cardAlignedBorder: '3px solid rgba(34,197,94,0.8)',
            cardAlignedShadow: '0 10px 0 rgba(21,128,61,0.32), 0 22px 38px rgba(34,197,94,0.24), inset 0 4px 16px rgba(255,255,255,0.9)',
            vignetteBg: 'radial-gradient(circle at 50% 48%, rgba(255,255,255,0.08) 0%, rgba(224,242,254,0.36) 64%, rgba(186,230,253,0.68) 100%)',
            vignetteAlignedBg: 'radial-gradient(circle at 50% 48%, rgba(34,197,94,0.12) 0%, rgba(220,252,231,0.36) 64%, rgba(187,247,208,0.68) 100%)',
            gridColor: 'rgba(2, 132, 199, 0.18)',
            pillBg: 'linear-gradient(180deg, #FFFFFF 0%, #F0F9FF 100%)',
            pillText: '#0C4A6E',
            pillBorder: '1px solid rgba(2, 132, 199, 0.28)',
            pillShadow: '0 4px 0 rgba(3, 105, 161, 0.18), 0 8px 16px rgba(2, 132, 199, 0.12), inset 0 1.5px 1px #FFFFFF',
            dialOuterBg: 'linear-gradient(145deg, #FFFFFF 0%, #E0F2FE 55%, #BAE6FD 100%)',
            dialOuterAlignedBg: 'radial-gradient(circle at 38% 30%, #FFFFFF 0%, #DCFCE7 60%, #86EFAC 100%)',
            dialOuterBorder: '3px solid rgba(2, 132, 199, 0.36)',
            dialOuterShadow: '0 8px 0 rgba(3, 105, 161, 0.22), 0 18px 30px rgba(2, 132, 199, 0.16), inset 0 3px 8px rgba(255, 255, 255, 0.95)',
            dialOuterAlignedShadow: '0 8px 0 rgba(21,128,61,0.32), 0 0 34px rgba(34,197,94,0.32), inset 0 4px 14px rgba(255,255,255,0.9)',
            dialInnerBg: 'radial-gradient(circle at 38% 30%, rgba(255,255,255,0.94) 0%, rgba(240,249,255,0.88) 65%, rgba(224,242,254,0.94) 100%)',
            dialInnerBorder: '1px solid rgba(2, 132, 199, 0.24)',
            dialInnerShadow: 'inset 0 5px 14px rgba(3, 105, 161, 0.14), inset 0 -3px 10px rgba(255, 255, 255, 0.9)',
            ringBorder: '1.5px dashed rgba(2, 132, 199, 0.26)',
            notchBg: 'linear-gradient(145deg, #FFFFFF, #BAE6FD)',
            notchIconColor: '#0369a1',
            tickColor: 'rgba(3, 105, 161, 0.36)',
            cardinalSecondary: '#0369a1',
            beamGradient: 'linear-gradient(90deg, #bae6fd 0%, #0284c7 50%, #075985 100%)',
            statusBg: 'linear-gradient(180deg, #FFFFFF 0%, #F0F9FF 100%)',
            statusText: '#0C4A6E',
            statusBorder: '1.5px solid rgba(2, 132, 199, 0.32)',
            statusShadow: '0 5px 0 rgba(3, 105, 161, 0.22), 0 12px 24px rgba(2, 132, 199, 0.16), inset 0 1.5px 2px #FFFFFF',
            errorCardBg: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
            errorCardBorder: '1px solid rgba(239, 68, 68, 0.28)',
            errorTextClass: 'text-red-600',
        };
    }

    if (isEmerald) {
        return {
            isBlackTheme: false,
            accent: '#059669',
            accentLight: '#6ee7b7',
            cardBg: 'linear-gradient(155deg, #FFFFFF 0%, #ECFDF5 48%, #A7F3D0 100%)',
            cardBorder: '3px solid rgba(5, 150, 105, 0.42)',
            cardShadow: '0 10px 0 rgba(4, 120, 87, 0.24), 0 20px 36px rgba(5, 150, 105, 0.18), inset 0 4px 16px rgba(255, 255, 255, 0.92)',
            cardAlignedBorder: '3px solid rgba(34,197,94,0.8)',
            cardAlignedShadow: '0 10px 0 rgba(21,128,61,0.32), 0 22px 38px rgba(34,197,94,0.24), inset 0 4px 16px rgba(255,255,255,0.9)',
            vignetteBg: 'radial-gradient(circle at 50% 48%, rgba(255,255,255,0.08) 0%, rgba(209,250,229,0.36) 64%, rgba(167,243,208,0.68) 100%)',
            vignetteAlignedBg: 'radial-gradient(circle at 50% 48%, rgba(34,197,94,0.12) 0%, rgba(220,252,231,0.36) 64%, rgba(187,247,208,0.68) 100%)',
            gridColor: 'rgba(5, 150, 105, 0.18)',
            pillBg: 'linear-gradient(180deg, #FFFFFF 0%, #ECFDF5 100%)',
            pillText: '#064E3B',
            pillBorder: '1px solid rgba(5, 150, 105, 0.28)',
            pillShadow: '0 4px 0 rgba(4, 120, 87, 0.18), 0 8px 16px rgba(5, 150, 105, 0.12), inset 0 1.5px 1px #FFFFFF',
            dialOuterBg: 'linear-gradient(145deg, #FFFFFF 0%, #D1FAE5 55%, #A7F3D0 100%)',
            dialOuterAlignedBg: 'radial-gradient(circle at 38% 30%, #FFFFFF 0%, #DCFCE7 60%, #86EFAC 100%)',
            dialOuterBorder: '3px solid rgba(5, 150, 105, 0.36)',
            dialOuterShadow: '0 8px 0 rgba(4, 120, 87, 0.22), 0 18px 30px rgba(5, 150, 105, 0.16), inset 0 3px 8px rgba(255, 255, 255, 0.95)',
            dialOuterAlignedShadow: '0 8px 0 rgba(21,128,61,0.32), 0 0 34px rgba(34,197,94,0.32), inset 0 4px 14px rgba(255,255,255,0.9)',
            dialInnerBg: 'radial-gradient(circle at 38% 30%, rgba(255,255,255,0.94) 0%, rgba(236,253,245,0.88) 65%, rgba(209,250,229,0.94) 100%)',
            dialInnerBorder: '1px solid rgba(5, 150, 105, 0.24)',
            dialInnerShadow: 'inset 0 5px 14px rgba(4, 120, 87, 0.14), inset 0 -3px 10px rgba(255, 255, 255, 0.9)',
            ringBorder: '1.5px dashed rgba(5, 150, 105, 0.26)',
            notchBg: 'linear-gradient(145deg, #FFFFFF, #A7F3D0)',
            notchIconColor: '#047857',
            tickColor: 'rgba(4, 120, 87, 0.36)',
            cardinalSecondary: '#047857',
            beamGradient: 'linear-gradient(90deg, #a7f3d0 0%, #059669 50%, #065f46 100%)',
            statusBg: 'linear-gradient(180deg, #FFFFFF 0%, #ECFDF5 100%)',
            statusText: '#064E3B',
            statusBorder: '1.5px solid rgba(5, 150, 105, 0.32)',
            statusShadow: '0 5px 0 rgba(4, 120, 87, 0.22), 0 12px 24px rgba(5, 150, 105, 0.16), inset 0 1.5px 2px #FFFFFF',
            errorCardBg: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
            errorCardBorder: '1px solid rgba(239, 68, 68, 0.28)',
            errorTextClass: 'text-red-600',
        };
    }

    if (isBurgundy) {
        return {
            isBlackTheme: false,
            accent: '#9f1239',
            accentLight: '#fda4af',
            cardBg: 'linear-gradient(155deg, #FFFFFF 0%, #FFF1F2 48%, #FECDD3 100%)',
            cardBorder: '3px solid rgba(159, 18, 57, 0.42)',
            cardShadow: '0 10px 0 rgba(136, 19, 55, 0.24), 0 20px 36px rgba(159, 18, 57, 0.18), inset 0 4px 16px rgba(255, 255, 255, 0.92)',
            cardAlignedBorder: '3px solid rgba(34,197,94,0.8)',
            cardAlignedShadow: '0 10px 0 rgba(21,128,61,0.32), 0 22px 38px rgba(34,197,94,0.24), inset 0 4px 16px rgba(255,255,255,0.9)',
            vignetteBg: 'radial-gradient(circle at 50% 48%, rgba(255,255,255,0.08) 0%, rgba(255,228,230,0.36) 64%, rgba(254,205,211,0.68) 100%)',
            vignetteAlignedBg: 'radial-gradient(circle at 50% 48%, rgba(34,197,94,0.12) 0%, rgba(220,252,231,0.36) 64%, rgba(187,247,208,0.68) 100%)',
            gridColor: 'rgba(159, 18, 57, 0.18)',
            pillBg: 'linear-gradient(180deg, #FFFFFF 0%, #FFF1F2 100%)',
            pillText: '#4C0519',
            pillBorder: '1px solid rgba(159, 18, 57, 0.28)',
            pillShadow: '0 4px 0 rgba(136, 19, 55, 0.18), 0 8px 16px rgba(159, 18, 57, 0.12), inset 0 1.5px 1px #FFFFFF',
            dialOuterBg: 'linear-gradient(145deg, #FFFFFF 0%, #FFE4E6 55%, #FECDD3 100%)',
            dialOuterAlignedBg: 'radial-gradient(circle at 38% 30%, #FFFFFF 0%, #DCFCE7 60%, #86EFAC 100%)',
            dialOuterBorder: '3px solid rgba(159, 18, 57, 0.36)',
            dialOuterShadow: '0 8px 0 rgba(136, 19, 55, 0.22), 0 18px 30px rgba(159, 18, 57, 0.16), inset 0 3px 8px rgba(255, 255, 255, 0.95)',
            dialOuterAlignedShadow: '0 8px 0 rgba(21,128,61,0.32), 0 0 34px rgba(34,197,94,0.32), inset 0 4px 14px rgba(255,255,255,0.9)',
            dialInnerBg: 'radial-gradient(circle at 38% 30%, rgba(255,255,255,0.94) 0%, rgba(255,241,242,0.88) 65%, rgba(255,228,230,0.94) 100%)',
            dialInnerBorder: '1px solid rgba(159, 18, 57, 0.24)',
            dialInnerShadow: 'inset 0 5px 14px rgba(136, 19, 55, 0.14), inset 0 -3px 10px rgba(255, 255, 255, 0.9)',
            ringBorder: '1.5px dashed rgba(159, 18, 57, 0.26)',
            notchBg: 'linear-gradient(145deg, #FFFFFF, #FECDD3)',
            notchIconColor: '#881337',
            tickColor: 'rgba(136, 19, 55, 0.36)',
            cardinalSecondary: '#881337',
            beamGradient: 'linear-gradient(90deg, #fecdd3 0%, #9f1239 50%, #4c0519 100%)',
            statusBg: 'linear-gradient(180deg, #FFFFFF 0%, #FFF1F2 100%)',
            statusText: '#4C0519',
            statusBorder: '1.5px solid rgba(159, 18, 57, 0.32)',
            statusShadow: '0 5px 0 rgba(136, 19, 55, 0.22), 0 12px 24px rgba(159, 18, 57, 0.16), inset 0 1.5px 2px #FFFFFF',
            errorCardBg: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
            errorCardBorder: '1px solid rgba(239, 68, 68, 0.28)',
            errorTextClass: 'text-red-600',
        };
    }

    // Gold (default light theme)
    return {
        isBlackTheme: false,
        accent: '#d97706',
        accentLight: '#fde047',
        cardBg: 'linear-gradient(155deg, #FFFFFF 0%, #FFFBEB 48%, #FEF08A 100%)',
        cardBorder: '3px solid rgba(217, 119, 6, 0.45)',
        cardShadow: '0 10px 0 rgba(180, 83, 9, 0.24), 0 20px 36px rgba(180, 83, 9, 0.18), inset 0 4px 16px rgba(255, 255, 255, 0.92)',
        cardAlignedBorder: '3px solid rgba(34,197,94,0.8)',
        cardAlignedShadow: '0 10px 0 rgba(21,128,61,0.32), 0 22px 38px rgba(34,197,94,0.24), inset 0 4px 16px rgba(255,255,255,0.9)',
        vignetteBg: 'radial-gradient(circle at 50% 48%, rgba(255,255,255,0.08) 0%, rgba(254,249,195,0.36) 64%, rgba(254,240,138,0.68) 100%)',
        vignetteAlignedBg: 'radial-gradient(circle at 50% 48%, rgba(34,197,94,0.12) 0%, rgba(220,252,231,0.36) 64%, rgba(187,247,208,0.68) 100%)',
        gridColor: 'rgba(180, 83, 9, 0.18)',
        pillBg: 'linear-gradient(180deg, #FFFFFF 0%, #FFFBEB 100%)',
        pillText: '#78350F',
        pillBorder: '1px solid rgba(217, 119, 6, 0.3)',
        pillShadow: '0 4px 0 rgba(180, 83, 9, 0.18), 0 8px 16px rgba(180, 83, 9, 0.12), inset 0 1.5px 1px #FFFFFF',
        dialOuterBg: 'linear-gradient(145deg, #FFFFFF 0%, #FEF3C7 55%, #FDE68A 100%)',
        dialOuterAlignedBg: 'radial-gradient(circle at 38% 30%, #FFFFFF 0%, #DCFCE7 60%, #86EFAC 100%)',
        dialOuterBorder: '3px solid rgba(217, 119, 6, 0.38)',
        dialOuterShadow: '0 8px 0 rgba(180, 83, 9, 0.22), 0 18px 30px rgba(180, 83, 9, 0.16), inset 0 3px 8px rgba(255, 255, 255, 0.95)',
        dialOuterAlignedShadow: '0 8px 0 rgba(21,128,61,0.32), 0 0 34px rgba(34,197,94,0.32), inset 0 4px 14px rgba(255,255,255,0.9)',
        dialInnerBg: 'radial-gradient(circle at 38% 30%, rgba(255,255,255,0.94) 0%, rgba(255,251,235,0.88) 65%, rgba(254,243,199,0.94) 100%)',
        dialInnerBorder: '1px solid rgba(217, 119, 6, 0.26)',
        dialInnerShadow: 'inset 0 5px 14px rgba(180, 83, 9, 0.14), inset 0 -3px 10px rgba(255, 255, 255, 0.9)',
        ringBorder: '1.5px dashed rgba(217, 119, 6, 0.28)',
        notchBg: 'linear-gradient(145deg, #FFFFFF, #FDE68A)',
        notchIconColor: '#92400e',
        tickColor: 'rgba(180, 83, 9, 0.36)',
        cardinalSecondary: '#92400e',
        beamGradient: 'linear-gradient(90deg, #fef08a 0%, #f59e0b 50%, #b45309 100%)',
        statusBg: 'linear-gradient(180deg, #FFFFFF 0%, #FFFBEB 100%)',
        statusText: '#78350F',
        statusBorder: '1.5px solid rgba(217, 119, 6, 0.34)',
        statusShadow: '0 5px 0 rgba(180, 83, 9, 0.22), 0 12px 24px rgba(180, 83, 9, 0.16), inset 0 1.5px 2px #FFFFFF',
        errorCardBg: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
        errorCardBorder: '1px solid rgba(239, 68, 68, 0.28)',
        errorTextClass: 'text-red-600',
    };
};

export const ARQibla = ({ qiblaDirection, heading, isAligned, theme, themeKey, isNightMode, homeThemeVariant }: any) => {
    const { language } = useLanguage();
    const isEn = language === 'en';
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState('');
    const [showCameraPermissionModal, setShowCameraPermissionModal] = useState(false);
    const { primaryColor, btnTextColor } = getQiblaModeStyles(theme);
    const arPalette = getARThemePalette(theme, themeKey, isNightMode, homeThemeVariant);

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
    const arAccent = isAligned ? '#22c55e' : arPalette.accent;

    return (
        <div className="w-full h-full flex flex-col pt-1 pb-4">
            <div
                className="relative w-full h-full flex-1 rounded-[28px] overflow-hidden flex flex-col items-center justify-between py-4 px-3.5 select-none"
                style={{
                    background: arPalette.cardBg,
                    border: isAligned ? arPalette.cardAlignedBorder : arPalette.cardBorder,
                    boxShadow: isAligned ? arPalette.cardAlignedShadow : arPalette.cardShadow
                }}
            >
                {/* Live Camera Backdrop */}
                {!error && (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className={`absolute inset-0 w-full h-full object-cover ${arPalette.isBlackTheme ? 'opacity-65' : 'opacity-75'}`}
                    />
                )}

                {/* 3D Atmospheric Spatial Vignette & Horizon Glow */}
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background: isAligned ? arPalette.vignetteAlignedBg : arPalette.vignetteBg
                    }}
                />

                {/* 3D Perspective Spatial Floor Grid */}
                <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-44 overflow-hidden opacity-55"
                    style={{ perspective: '340px' }}
                >
                    <div
                        className="w-full h-full origin-bottom"
                        style={{
                            transform: 'rotateX(64deg) scale(1.35)',
                            backgroundImage: `linear-gradient(to right, ${isAligned ? 'rgba(34,197,94,0.3)' : arPalette.gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${isAligned ? 'rgba(34,197,94,0.3)' : arPalette.gridColor} 1px, transparent 1px)`,
                            backgroundSize: '30px 30px',
                            maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 92%)',
                            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 92%)'
                        }}
                    />
                </div>

                {/* 4 Sculpted 3D Corner AR Viewfinder Brackets */}
                <div className="pointer-events-none absolute top-3.5 left-3.5 w-6 h-6 border-t-[3px] border-l-[3px] rounded-tl-xl" style={{ borderColor: arAccent, filter: `drop-shadow(0 0 6px ${arAccent}88)` }} />
                <div className="pointer-events-none absolute top-3.5 right-3.5 w-6 h-6 border-t-[3px] border-r-[3px] rounded-tr-xl" style={{ borderColor: arAccent, filter: `drop-shadow(0 0 6px ${arAccent}88)` }} />
                <div className="pointer-events-none absolute bottom-3.5 left-3.5 w-6 h-6 border-b-[3px] border-l-[3px] rounded-bl-xl" style={{ borderColor: arAccent, filter: `drop-shadow(0 0 6px ${arAccent}88)` }} />
                <div className="pointer-events-none absolute bottom-3.5 right-3.5 w-6 h-6 border-b-[3px] border-r-[3px] rounded-br-xl" style={{ borderColor: arAccent, filter: `drop-shadow(0 0 6px ${arAccent}88)` }} />

                <InAppPermissionModal
                    isOpen={showCameraPermissionModal}
                    type="camera"
                    onClose={() => setShowCameraPermissionModal(false)}
                    onGranted={() => {
                        setShowCameraPermissionModal(false);
                        startCamera();
                    }}
                />

                {/* Top 3D HUD Telemetry Pills */}
                <div className="relative z-10 w-full flex items-center justify-between gap-2 px-1">
                    <div
                        className="px-3 py-1.5 rounded-2xl flex items-center gap-1.5 text-xs font-black backdrop-blur-md"
                        style={{
                            background: arPalette.pillBg,
                            color: arPalette.pillText,
                            border: arPalette.pillBorder,
                            boxShadow: arPalette.pillShadow
                        }}
                    >
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: arAccent }} />
                        <span className="tabular-nums">
                            {isEn ? `Qibla ${Math.round(qiblaDirection)}°` : `القبلة ${Math.round(qiblaDirection)}°`}
                        </span>
                    </div>

                    <div
                        className="px-3 py-1.5 rounded-2xl flex items-center gap-1.5 text-xs font-black backdrop-blur-md"
                        style={{
                            background: isAligned
                                ? 'linear-gradient(145deg, #22c55e 0%, #15803d 100%)'
                                : arPalette.pillBg,
                            color: isAligned ? '#ffffff' : arPalette.pillText,
                            border: isAligned ? '1px solid rgba(134,239,172,0.7)' : arPalette.pillBorder,
                            boxShadow: isAligned
                                ? '0 4px 0 #14532d, 0 8px 18px rgba(34,197,94,0.45), inset 0 1px 1px rgba(255,255,255,0.45)'
                                : arPalette.pillShadow
                        }}
                    >
                        <i className={`fa-solid ${isAligned ? 'fa-check-circle' : 'fa-compass'} text-[11px]`}></i>
                        <span className="tabular-nums">
                            {isAligned
                                ? (isEn ? 'Aligned' : 'متجه للقبلة')
                                : (isEn ? `Heading ${Math.round(heading)}°` : `الاتجاه ${Math.round(heading)}°`)}
                        </span>
                    </div>
                </div>

                {/* Center 3D Holographic AR Gyroscopic Reticle & Kaaba Monument */}
                <div className="relative z-10 flex flex-col items-center justify-center my-auto py-2">
                    <div
                        className="relative w-[252px] h-[252px] sm:w-[276px] sm:h-[276px] rounded-full flex items-center justify-center transition-all duration-300"
                        style={{
                            background: isAligned ? arPalette.dialOuterAlignedBg : arPalette.dialOuterBg,
                            padding: '9px',
                            border: isAligned ? '3px solid rgba(74,222,128,0.88)' : arPalette.dialOuterBorder,
                            boxShadow: isAligned ? arPalette.dialOuterAlignedShadow : arPalette.dialOuterShadow
                        }}
                    >
                        {/* Fixed Top Camera Target Notch */}
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center pointer-events-none">
                            <div
                                className="w-7 h-7 rounded-full flex items-center justify-center"
                                style={{
                                    background: isAligned
                                        ? 'linear-gradient(145deg, #4ade80, #16a34a)'
                                        : arPalette.notchBg,
                                    boxShadow: arPalette.isBlackTheme
                                        ? '0 3px 0 rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.45)'
                                        : '0 3px 0 rgba(0,0,0,0.16), 0 4px 10px rgba(0,0,0,0.12), inset 0 1.5px 1px #FFFFFF'
                                }}
                            >
                                <i className="fa-solid fa-caret-down text-xs" style={{ color: isAligned ? '#ffffff' : arPalette.notchIconColor }}></i>
                            </div>
                        </div>

                        {/* Inner Recessed Glass Dial */}
                        <div
                            className="relative w-full h-full rounded-full flex items-center justify-center backdrop-blur-[2px]"
                            style={{
                                background: arPalette.dialInnerBg,
                                border: isAligned ? '1px solid rgba(134,239,172,0.5)' : arPalette.dialInnerBorder,
                                boxShadow: arPalette.dialInnerShadow
                            }}
                        >
                            {/* Concentric Holographic Ring */}
                            <div
                                className="absolute inset-8 rounded-full pointer-events-none"
                                style={{
                                    border: isAligned ? '1.5px dashed rgba(34,197,94,0.45)' : arPalette.ringBorder
                                }}
                            />

                            {/* Rotating Compass Ticks & 3D Cardinal Letters */}
                            <div
                                className="absolute w-full h-full transition-transform duration-300 ease-out pointer-events-none"
                                style={{ transform: `rotate(${-heading}deg)` }}
                            >
                                {Array.from({ length: 24 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute top-0 left-1/2 w-full h-1/2 -translate-x-1/2"
                                        style={{ transform: `rotate(${i * 15}deg)`, transformOrigin: '50% 100%' }}
                                    >
                                        <div
                                            className={`mx-auto rounded-full ${i % 6 === 0 ? 'w-1 h-2.5 mt-1 opacity-0' : (i % 2 === 0 ? 'w-0.5 h-2 mt-1' : 'w-0.5 h-1 mt-1.5')}`}
                                            style={{
                                                background: isAligned ? 'rgba(34,197,94,0.6)' : arPalette.tickColor
                                            }}
                                        />
                                    </div>
                                ))}

                                <div className="absolute top-0.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
                                    <Compass3DLetter letter={isEn ? 'N' : 'ش'} color={arPalette.accent} size={24} isPrimary />
                                </div>
                                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
                                    <Compass3DLetter letter={isEn ? 'S' : 'ج'} color={arPalette.cardinalSecondary} size={20} />
                                </div>
                                <div className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center">
                                    <Compass3DLetter letter={isEn ? 'W' : 'غ'} color={arPalette.cardinalSecondary} size={20} />
                                </div>
                                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center">
                                    <Compass3DLetter letter={isEn ? 'E' : 'ق'} color={arPalette.cardinalSecondary} size={20} />
                                </div>
                            </div>

                            {/* Rotating 3D Qibla Guidance Beam & Pointer Arrow */}
                            <div
                                className="absolute w-full h-full transition-transform duration-500 ease-out pointer-events-none"
                                style={{ transform: `rotate(${rotation}deg)` }}
                            >
                                {/* 3D Qibla Directional Arrow at Perimeter */}
                                <div className="absolute inset-0">
                                    <Qibla3DArrow color={isAligned ? '#22c55e' : arPalette.accent} />
                                </div>

                                {/* 3D Glowing Guidance Beam connecting Center Dome to Monument */}
                                <div
                                    className="absolute top-[52px] bottom-1/2 left-1/2 w-1.5 -translate-x-1/2 rounded-full"
                                    style={{
                                        background: isAligned
                                            ? 'linear-gradient(90deg, #86efac 0%, #22c55e 50%, #15803d 100%)'
                                            : arPalette.beamGradient,
                                        boxShadow: `0 0 12px ${arAccent}`
                                    }}
                                />

                                {/* Upright 3D Sculpted Kaaba Monument Orbiting in AR Space */}
                                <div
                                    className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-all duration-500"
                                    style={{
                                        top: isAligned ? '52px' : '38px',
                                        transform: `rotate(${-rotation}deg) scale(${isAligned ? 1.12 : 0.96})`
                                    }}
                                >
                                    <KaabaAR3DMonument
                                        size={isAligned ? 96 : 84}
                                        isAligned={isAligned}
                                        accentColor={arPalette.accent}
                                        accentLightColor={arPalette.accentLight}
                                    />
                                </div>
                            </div>

                            {/* Center 3D Spherical Target Dome */}
                            <div className="relative z-20 flex items-center justify-center pointer-events-none">
                                <Compass3DCenterDome color={arAccent} size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Controls: Compact 3D Camera Permission Prompt (if needed) + 3D Status Pill */}
                <div className="relative z-10 w-full flex flex-col items-center gap-2.5">
                    {error && (
                        <div
                            className="w-full max-w-sm px-3.5 py-2.5 rounded-2xl flex items-center justify-between gap-3 backdrop-blur-md"
                            style={{
                                background: arPalette.errorCardBg,
                                border: arPalette.errorCardBorder,
                                boxShadow: arPalette.isBlackTheme
                                    ? '0 6px 0 rgba(0,0,0,0.55), 0 12px 24px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.16)'
                                    : '0 4px 0 rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.08), inset 0 1.5px 1px #FFFFFF'
                            }}
                        >
                            <p className={`${arPalette.errorTextClass} text-[11px] sm:text-xs font-bold text-start leading-snug flex-1`}>
                                {error}
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowCameraPermissionModal(true)}
                                className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-black cursor-pointer transition-all active:scale-95"
                                style={{
                                    backgroundColor: arPalette.isBlackTheme ? primaryColor : arPalette.accent,
                                    color: arPalette.isBlackTheme ? btnTextColor : '#FFFFFF',
                                    boxShadow: arPalette.isBlackTheme
                                        ? '0 4px 0 rgba(0,0,0,0.45), inset 0 1px 1px rgba(255,255,255,0.45)'
                                        : '0 3px 0 rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.4)'
                                }}
                            >
                                {isEn ? 'Enable Camera' : 'تفعيل الكاميرا'}
                            </button>
                        </div>
                    )}

                    <div
                        className="px-6 py-2.5 rounded-full font-black text-sm sm:text-base flex items-center gap-2.5 backdrop-blur-md transition-all duration-300"
                        style={{
                            background: isAligned
                                ? 'linear-gradient(145deg, #22c55e 0%, #15803d 100%)'
                                : arPalette.statusBg,
                            color: isAligned ? '#ffffff' : arPalette.statusText,
                            border: isAligned ? '1.5px solid rgba(134,239,172,0.78)' : arPalette.statusBorder,
                            boxShadow: isAligned
                                ? '0 5px 0 #14532d, 0 12px 26px rgba(34,197,94,0.45), inset 0 1.5px 2px rgba(255,255,255,0.45)'
                                : arPalette.statusShadow
                        }}
                    >
                        <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{
                                backgroundColor: isAligned ? '#ffffff' : arAccent,
                                boxShadow: isAligned ? '0 0 8px #ffffff' : `0 0 8px ${arAccent}`
                            }}
                        />
                        <span>
                            {isAligned
                                ? (isEn ? 'Facing Qibla' : 'أنت متجه للقبلة الآن')
                                : (isEn ? 'Point camera towards the Kaaba' : 'وجّه الكاميرا نحو مجسم الكعبة')}
                        </span>
                    </div>
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

    const CompassDial = ({ targetHeading, targetType, targetColor }: { targetHeading: number; targetType: 'sun' | 'moon'; targetColor: string }) => (
        <div
            className="relative w-[272px] h-[272px] sm:w-[292px] sm:h-[292px] rounded-full flex items-center justify-center mx-auto mt-12 mb-6 select-none"
            style={{
                background: isBlackTheme
                    ? 'linear-gradient(145deg, #3f3f46 0%, #18181b 52%, #09090b 100%)'
                    : 'linear-gradient(145deg, #ffffff 0%, #e2e8f0 55%, #cbd5e1 100%)',
                padding: '10px',
                boxShadow: isBlackTheme
                    ? '0 10px 0 #050507, 0 22px 36px rgba(0,0,0,0.78), inset 0 2px 3px rgba(255,255,255,0.22)'
                    : '0 10px 0 #cbd5e1, 0 22px 36px rgba(15,23,42,0.2), inset 0 2px 4px rgba(255,255,255,0.98)'
            }}
        >
            {/* Phone heading indicator (fixed above top rim, borderless 3D) */}
            <div
                className="border-0 absolute -top-10 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none"
            >
                <Phone3DIcon size={38} />
            </div>

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
                {/* حلقات زخرفية غائرة لتعزيز العمق */}
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

                {/* لمعة زجاجية علوية */}
                <div
                    className="absolute inset-1.5 rounded-full pointer-events-none"
                    style={{
                        background: isBlackTheme
                            ? 'linear-gradient(155deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0) 44%)'
                            : 'linear-gradient(155deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 46%)'
                    }}
                />

                {/* Rotating dial */}
                <div className="absolute w-full h-full transition-transform duration-300 ease-out" style={{ transform: `rotate(${-heading}deg)` }}>
                    {/* علامات التدريج المعدنية المجسمة */}
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute top-0 left-1/2 w-full h-1/2 pointer-events-none -translate-x-1/2"
                            style={{ transform: `rotate(${i * 30}deg)`, transformOrigin: '50% 100%' }}
                        >
                            <div
                                className={`mx-auto rounded-full ${i % 3 === 0 ? 'w-1 h-2.5 mt-1 opacity-0' : 'w-0.5 h-2 mt-1.5'}`}
                                style={{
                                    background: isBlackTheme ? 'rgba(255,255,255,0.28)' : 'rgba(148,163,184,0.65)',
                                    boxShadow: '0 1px 1px rgba(0,0,0,0.18)'
                                }}
                            />
                        </div>
                    ))}

                    {/* أحرف الاتجاهات المجسمة ثلاثية الأبعاد */}
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
                        <Compass3DLetter letter={isEn ? 'N' : 'ش'} color={primaryColor} size={30} isPrimary />
                    </div>
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
                        <Compass3DLetter letter={isEn ? 'S' : 'ج'} color={isBlackTheme ? '#a1a1aa' : '#94a3b8'} size={24} />
                    </div>
                    <div className="absolute left-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                        <Compass3DLetter letter={isEn ? 'W' : 'غ'} color={isBlackTheme ? '#a1a1aa' : '#94a3b8'} size={24} />
                    </div>
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                        <Compass3DLetter letter={isEn ? 'E' : 'ق'} color={isBlackTheme ? '#a1a1aa' : '#94a3b8'} size={24} />
                    </div>

                    {/* Qibla marker */}
                    <div className="absolute w-full h-full" style={{ transform: `rotate(${qiblaDirection}deg)` }}>
                        <div
                            className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-10 transition-transform duration-300 ease-out"
                            style={{ transform: `rotate(${heading - qiblaDirection}deg)` }}
                        >
                            <Kaaba3DIcon size={46} tone="emerald" />
                        </div>
                        {/* 3D Cylindrical Needle to Qibla */}
                        <div
                            className="absolute top-[74px] bottom-1/2 left-1/2 w-1.5 -translate-x-1/2 rounded-full"
                            style={{
                                background: 'linear-gradient(90deg, #6ee7b7 0%, #10b981 55%, #047857 100%)',
                                boxShadow: '0 2px 6px rgba(16,185,129,0.42)'
                            }}
                        ></div>
                    </div>

                    {/* Target marker (Sun/Moon) */}
                    <div className="absolute w-full h-full" style={{ transform: `rotate(${targetHeading}deg)` }}>
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                            {targetType === 'sun' ? <Sun3DIcon size={48} /> : <Moon3DIcon size={46} />}
                        </div>
                        {/* 3D Cylindrical Needle to Target */}
                        <div
                            className="absolute top-[74px] bottom-1/2 left-1/2 w-1.5 -translate-x-1/2 rounded-full"
                            style={{
                                background: targetType === 'sun'
                                    ? 'linear-gradient(90deg, #fef08a 0%, #f59e0b 55%, #b45309 100%)'
                                    : 'linear-gradient(90deg, #bae6fd 0%, #3b82f6 55%, #1d4ed8 100%)',
                                boxShadow: `0 2px 6px ${targetColor}66`
                            }}
                        ></div>
                    </div>
                </div>

                {/* القبة المركزية المجسمة */}
                <div className="absolute z-10 flex items-center justify-center pointer-events-none">
                    <Compass3DCenterDome color={primaryColor} size={26} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full shrink-0 flex flex-col gap-5 pb-4" dir={isEn ? 'ltr' : 'rtl'}>
            <div className={`app-page-card border-0 p-6 sm:p-8 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden ${surfaceCardClass}`}>
                <div className={`absolute top-4 ${isEn ? 'left-4' : 'right-4'} text-yellow-500 opacity-10`}><i className="fa-solid fa-sun text-6xl"></i></div>
                <h3 className="text-2xl font-black mb-4" style={{ color: primaryColor }}>
                    {isEn ? 'Qibla Direction by Sun' : 'تحديد القبلة عن طريق الشمس'}
                </h3>
                
                <div className={`app-inner-3d-box border-0 mb-6 p-4 rounded-2xl max-w-sm ${isBlackTheme ? 'bg-white/10' : 'bg-amber-50/90 dark:bg-amber-950/30'}`}>
                    <p className="text-sm leading-relaxed font-bold text-amber-700 dark:text-amber-300">
                        {isEn 
                            ? 'Point your phone (red marker) toward the Sun to verify direction, then rotate your phone until the green Kaaba aligns with the red phone icon to face the Qibla.' 
                            : 'وجه هاتفك (العلامة الحمراء) نحو الشمس في السماء لمطابقة الاتجاه، ثم أدر هاتفك نحو الكعبة الخضراء حتى تتطابق مع أيقونة الهاتف الحمراء لتكون متجهاً للقبلة.'}
                    </p>
                </div>
                
                <CompassDial targetHeading={sunHeading} targetType="sun" targetColor="#eab308" />

                <div className="w-full space-y-2.5 mb-4">
                    <div className={`app-inner-3d-box border-0 flex justify-between items-center p-3.5 rounded-2xl ${softRowClass}`}>
                        <span className="text-sm font-bold opacity-80">{isEn ? 'Sun Direction:' : 'اتجاه الشمس:'}</span>
                        <span className="font-mono text-lg font-black tabular-nums">{Math.round(sunHeading)}°</span>
                    </div>
                    <div className={`app-inner-3d-box border-0 flex justify-between items-center p-3.5 rounded-2xl ${softRowClass}`}>
                        <span className="text-sm font-bold opacity-80">{isEn ? 'Qibla Direction:' : 'اتجاه القبلة:'}</span>
                        <span className="font-mono text-lg font-black tabular-nums" style={{ color: primaryColor }}>{Math.round(qiblaDirection)}°</span>
                    </div>
                </div>

                <div className={`app-inner-3d-box border-0 p-4 rounded-2xl w-full ${isBlackTheme ? 'bg-white/10' : 'bg-amber-50/90 dark:bg-amber-950/30'}`}>
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
                
                <div
                    className="app-inner-3d-box border-0 mb-6 p-4 rounded-2xl max-w-sm"
                    style={{ backgroundColor: hexToRgba(primaryColor, isBlackTheme ? 0.14 : 0.09) }}
                >
                    <p className="text-sm leading-relaxed font-bold" style={{ color: primaryColor }}>
                        {isEn 
                            ? 'Point your phone (red marker) toward the Moon to verify direction, then rotate your phone until the green Kaaba aligns with the red phone icon to face the Qibla.' 
                            : 'وجه هاتفك (العلامة الحمراء) نحو القمر في السماء لمطابقة الاتجاه، ثم أدر هاتفك نحو الكعبة الخضراء حتى تتطابق مع أيقونة الهاتف الحمراء لتكون متجهاً للقبلة.'}
                    </p>
                </div>
                
                <CompassDial targetHeading={moonHeading} targetType="moon" targetColor="#60a5fa" />

                <div className="w-full space-y-2.5 mb-4">
                    <div className={`app-inner-3d-box border-0 flex justify-between items-center p-3.5 rounded-2xl ${softRowClass}`}>
                        <span className="text-sm font-bold opacity-80">{isEn ? 'Moon Direction:' : 'اتجاه القمر:'}</span>
                        <span className="font-mono text-lg font-black tabular-nums">{Math.round(moonHeading)}°</span>
                    </div>
                    <div className={`app-inner-3d-box border-0 flex justify-between items-center p-3.5 rounded-2xl ${softRowClass}`}>
                        <span className="text-sm font-bold opacity-80">{isEn ? 'Qibla Direction:' : 'اتجاه القبلة:'}</span>
                        <span className="font-mono text-lg font-black tabular-nums" style={{ color: primaryColor }}>{Math.round(qiblaDirection)}°</span>
                    </div>
                </div>

                <div
                    className="app-inner-3d-box border-0 p-4 rounded-2xl w-full"
                    style={{ backgroundColor: hexToRgba(primaryColor, isBlackTheme ? 0.14 : 0.09) }}
                >
                    <p className="font-black text-sm" style={{ color: primaryColor }}>
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
                
                <div className={`app-inner-3d-box border-0 mb-6 p-4 rounded-2xl w-full max-w-md ${isBlackTheme ? 'bg-white/10' : 'bg-emerald-50/90 dark:bg-emerald-950/30'}`}>
                    <p className="text-sm leading-relaxed font-bold text-emerald-700 dark:text-emerald-300">
                        {isEn 
                            ? 'Place a stick vertically on flat ground; its shadow points opposite to the Sun. Point your phone (red marker) toward the shadow to verify direction, then rotate your phone until the green Kaaba aligns with the red phone icon to face the Qibla.' 
                            : 'ضع عصا بشكل عمودي على الأرض المستوية؛ ظل العصا يشير إلى الاتجاه المعاكس للشمس. وجه هاتفك (العلامة الحمراء) نحو الظل لمطابقة الاتجاه، ثم أدر هاتفك نحو الكعبة الخضراء حتى تتطابق مع أيقونة الهاتف الحمراء لتكون متجهاً للقبلة.'}
                    </p>
                </div>

                <div
                    className="relative w-[272px] h-[272px] sm:w-[292px] sm:h-[292px] rounded-full flex items-center justify-center mx-auto mt-12 mb-6 select-none"
                    style={{
                        background: isBlackTheme
                            ? 'linear-gradient(145deg, #3f3f46 0%, #18181b 52%, #09090b 100%)'
                            : 'linear-gradient(145deg, #ffffff 0%, #e2e8f0 55%, #cbd5e1 100%)',
                        padding: '10px',
                        boxShadow: isBlackTheme
                            ? '0 10px 0 #050507, 0 22px 36px rgba(0,0,0,0.78), inset 0 2px 3px rgba(255,255,255,0.22)'
                            : '0 10px 0 #cbd5e1, 0 22px 36px rgba(15,23,42,0.2), inset 0 2px 4px rgba(255,255,255,0.98)'
                    }}
                >
                    {/* Phone heading indicator (fixed above top rim, borderless 3D) */}
                    <div
                        className="border-0 absolute -top-10 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none"
                    >
                        <Phone3DIcon size={38} />
                    </div>

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
                        {/* حلقات زخرفية غائرة لتعزيز العمق */}
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

                        {/* لمعة زجاجية علوية */}
                        <div
                            className="absolute inset-1.5 rounded-full pointer-events-none"
                            style={{
                                background: isBlackTheme
                                    ? 'linear-gradient(155deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0) 44%)'
                                    : 'linear-gradient(155deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 46%)'
                            }}
                        />

                        {/* Rotating dial */}
                        <div className="absolute w-full h-full transition-transform duration-300 ease-out" style={{ transform: `rotate(${-heading}deg)` }}>
                            {/* علامات التدريج المعدنية المجسمة */}
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute top-0 left-1/2 w-full h-1/2 pointer-events-none -translate-x-1/2"
                                    style={{ transform: `rotate(${i * 30}deg)`, transformOrigin: '50% 100%' }}
                                >
                                    <div
                                        className={`mx-auto rounded-full ${i % 3 === 0 ? 'w-1 h-2.5 mt-1 opacity-0' : 'w-0.5 h-2 mt-1.5'}`}
                                        style={{
                                            background: isBlackTheme ? 'rgba(255,255,255,0.28)' : 'rgba(148,163,184,0.65)',
                                            boxShadow: '0 1px 1px rgba(0,0,0,0.18)'
                                        }}
                                    />
                                </div>
                            ))}

                            {/* أحرف الاتجاهات المجسمة ثلاثية الأبعاد */}
                            <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
                                <Compass3DLetter letter={isEn ? 'N' : 'ش'} color={primaryColor} size={30} isPrimary />
                            </div>
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
                                <Compass3DLetter letter={isEn ? 'S' : 'ج'} color={isBlackTheme ? '#a1a1aa' : '#94a3b8'} size={24} />
                            </div>
                            <div className="absolute left-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                <Compass3DLetter letter={isEn ? 'W' : 'غ'} color={isBlackTheme ? '#a1a1aa' : '#94a3b8'} size={24} />
                            </div>
                            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                <Compass3DLetter letter={isEn ? 'E' : 'ق'} color={isBlackTheme ? '#a1a1aa' : '#94a3b8'} size={24} />
                            </div>

                            {/* Qibla marker */}
                            <div className="absolute w-full h-full" style={{ transform: `rotate(${qiblaDirection}deg)` }}>
                                <div
                                    className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-10 transition-transform duration-300 ease-out"
                                    style={{ transform: `rotate(${heading - qiblaDirection}deg)` }}
                                >
                                    <Kaaba3DIcon size={46} tone="emerald" />
                                </div>
                                {/* 3D Cylindrical Needle to Qibla */}
                                <div
                                    className="absolute top-[74px] bottom-1/2 left-1/2 w-1.5 -translate-x-1/2 rounded-full"
                                    style={{
                                        background: 'linear-gradient(90deg, #6ee7b7 0%, #10b981 55%, #047857 100%)',
                                        boxShadow: '0 2px 6px rgba(16,185,129,0.42)'
                                    }}
                                ></div>
                            </div>

                            {/* Shadow marker */}
                            <div className="absolute w-full h-full" style={{ transform: `rotate(${shadowHeading}deg)` }}>
                                <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                                    <Shadow3DIcon size={48} color={primaryColor} />
                                </div>
                                {/* 3D Cylindrical Needle to Shadow */}
                                <div
                                    className="absolute top-[74px] bottom-1/2 left-1/2 w-1.5 -translate-x-1/2 rounded-full"
                                    style={{
                                        background: isBlackTheme
                                            ? 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 55%, #64748b 100%)'
                                            : `linear-gradient(90deg, ${primaryColor}bb 0%, ${primaryColor} 60%, #0f172a88 100%)`,
                                        boxShadow: `0 2px 6px ${primaryColor}55`
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* القبة المركزية المجسمة */}
                        <div className="absolute z-10 flex items-center justify-center pointer-events-none">
                            <Compass3DCenterDome color={primaryColor} size={26} />
                        </div>
                    </div>
                </div>

                <div className="w-full space-y-2.5 mt-4">
                    <div className={`app-inner-3d-box border-0 flex justify-between items-center p-3.5 rounded-2xl ${softRowClass}`}>
                        <span className="text-sm font-bold opacity-80">{isEn ? 'Current Shadow Direction:' : 'اتجاه الظل الحالي:'}</span>
                        <span className="font-mono text-lg font-black tabular-nums">{Math.round(shadowHeading)}°</span>
                    </div>
                    <div className={`app-inner-3d-box border-0 flex justify-between items-center p-3.5 rounded-2xl ${softRowClass}`}>
                        <span className="text-sm font-bold opacity-80">{isEn ? 'Qibla Direction:' : 'اتجاه القبلة:'}</span>
                        <span className="font-mono text-lg font-black tabular-nums" style={{ color: primaryColor }}>{Math.round(qiblaDirection)}°</span>
                    </div>
                </div>

                <div 
                    className="app-inner-3d-box border-0 mt-4 p-4 rounded-2xl w-full"
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
