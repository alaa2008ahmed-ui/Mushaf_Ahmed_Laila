import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Plus, Minus, Volume2, ChevronRight, ChevronLeft, ChevronDown, Type } from 'lucide-react';
import { safeHtml2Canvas } from '../../utils/canvasHelper';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { FONTS, SURAH_NAMES_AR, toArabic, getAyahCountText, isDarkQuranTheme } from './constants';
import { renderTajweedTextHtml } from './MushafPage';
import { useLanguage } from '../../context/LanguageContext';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import {
    SHARE_CARD_DESIGNS,
    ShareDesignId,
    getSelectedShareDesign,
    setSelectedShareDesign,
    getDesignTypographyTheme,
    renderDesignBackdropToDataUrl,
    renderDesignMotifDataUrl,
    encodeHighResCompactImage,
} from '../../utils/shareAsImage';
import { SHARE_DESIGN_CHANGE_EVENT } from '../../utils/shareCardDesigns';
import { DARK_EXTRA_SHARE_DESIGN_IDS } from '../../utils/shareCardDesignsExtra';
import {
    prewarmShareDesignThumbs,
    getShareDesignThumbsSnapshot,
    subscribeShareDesignThumbs,
} from '../MainMenu/ShareDesignSelectorSection';

const IslamicFlourish: React.FC<{ color: string; scale?: number }> = ({ color, scale = 1 }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', margin: `${10 * scale}px 0`, opacity: 0.85, pointerEvents: 'none' }}>
            <svg width={220 * scale} height={20 * scale} viewBox="0 0 220 20" fill="none">
                <path d="M10 10h65m70 0h65" stroke={color} strokeWidth={1.5 * scale} strokeLinecap="round" opacity="0.6" />
                <circle cx="82" cy="10" r={2.5 * scale} fill={color} />
                <circle cx="138" cy="10" r={2.5 * scale} fill={color} />
                <path d="M110 2l6 8-6 8-6-8z" fill={color} opacity="0.9" />
                <circle cx="110" cy="10" r={1.8 * scale} fill="#ffffff" opacity="0.75" />
            </svg>
        </div>
    );
};

interface ShareAyahModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentAyah: { s: number; a: number };
    quranData: any;
    currentTheme: any;
    readingMode?: 'mushaf' | 'tafseer' | 'meanings' | 'translation' | 'bilingual';
    settings?: any;
    showToast?: (msg: string) => void;
    isLandscape?: boolean;
    instantShareMode?: boolean;
    instantShareNonce?: number;
}

const SHARE_STUDIO_PREFS_KEY = 'quran_share_studio_prefs_v1';

interface ShareStudioPrefs {
    bgId?: string;
    frameId?: string;
    fontId?: string;
    fontSize?: number;
    textColor?: string;
    customText?: string;
    showBismillah?: boolean;
    shareType?: 'text' | 'image' | 'page' | 'audio';
}

function loadShareStudioPrefs(): ShareStudioPrefs {
    try {
        const raw = localStorage.getItem(SHARE_STUDIO_PREFS_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function saveShareStudioPrefs(prefs: ShareStudioPrefs): void {
    try {
        localStorage.setItem(SHARE_STUDIO_PREFS_KEY, JSON.stringify(prefs));
    } catch {
        // ignore storage quota errors
    }
}

interface ShareBgOption {
    id: string;
    designId?: ShareDesignId;
    name: string;
    nameEn?: string;
    type: 'share_design' | 'gradient' | 'solid' | 'pattern';
    value: string;
    border: string;
    accent: string;
    brandColor?: string;
    defaultTextColor?: string;
    sourceColor?: string;
    dividerColor?: string;
    overlay?: string;
    isLight?: boolean;
    category: 'share_designs' | 'gradients' | 'solids';
}

const DARK_SHARE_DESIGNS = new Set<ShareDesignId>([
    'lapis_turquoise',
    'obsidian_gold',
    'royal_amethyst',
    ...DARK_EXTRA_SHARE_DESIGN_IDS,
]);

const SHARE_DESIGN_BGS: ShareBgOption[] = SHARE_CARD_DESIGNS.map((d) => {
    const typo = getDesignTypographyTheme(d.id);
    const isLight = !DARK_SHARE_DESIGNS.has(d.id);
    return {
        id: `design_${d.id}`,
        designId: d.id,
        name: d.nameAr,
        nameEn: d.nameEn,
        type: 'share_design',
        value: `linear-gradient(155deg, ${d.previewColors[0]} 0%, ${d.previewColors[1]} 55%, ${d.previewColors[2]} 100%)`,
        border: typo.badgeBorder,
        accent: typo.bismillahColor,
        brandColor: typo.brandColor,
        defaultTextColor: typo.bodyColor,
        sourceColor: typo.sourceColor,
        dividerColor: typo.sourceDividerColor,
        isLight,
        category: 'share_designs',
    };
});

const BACKGROUNDS: ShareBgOption[] = [
    // --- 1. Shared App Share Card Designs (تصاميم المشاركة العشرة المعتمدة) ---
    ...SHARE_DESIGN_BGS,

    // --- 2. High-End Color Gradients (تدرجات لونية زاهية وفخمة) ---
    { 
        id: 'bg_pure_gold_foil', 
        name: 'رقائق الذهب الملكية', 
        type: 'gradient', 
        value: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 35%, #d97706 70%, #92400e 100%)', 
        border: '#fef08a', 
        accent: '#451a03', 
        category: 'gradients' 
    },
    { 
        id: 'bg_turquoise_teal', 
        name: 'فيروزي إسلامي زاهي', 
        type: 'gradient', 
        value: 'linear-gradient(135deg, #042f2e 0%, #0d9488 50%, #14b8a6 100%)', 
        border: '#5eead4', 
        accent: '#fde047', 
        category: 'gradients' 
    },
    { 
        id: 'bg_ruby_crimson', 
        name: 'ياقوت أندلسي فاخر', 
        type: 'gradient', 
        value: 'linear-gradient(135deg, #4c0519 0%, #881337 50%, #e11d48 100%)', 
        border: '#fda4af', 
        accent: '#fef08a', 
        category: 'gradients' 
    },
    { 
        id: 'bg_deep_purple_gold', 
        name: 'بنفسج ملكي مذهب', 
        type: 'gradient', 
        value: 'linear-gradient(135deg, #2e1065 0%, #581c87 50%, #9333ea 100%)', 
        border: '#d8b4fe', 
        accent: '#fde047', 
        category: 'gradients' 
    },
    { 
        id: 'bg_deep_sapphire', 
        name: 'أزرق سماوي عميق', 
        type: 'gradient', 
        value: 'linear-gradient(135deg, #082f49 0%, #0369a1 50%, #0284c7 100%)', 
        border: '#7dd3fc', 
        accent: '#fef08a', 
        category: 'gradients' 
    },
    { 
        id: 'bg_royal', 
        name: 'أرجواني ذهبي', 
        type: 'gradient', 
        value: 'linear-gradient(135deg, #4c1d95 0%, #7e22ce 100%)', 
        border: '#c084fc', 
        accent: '#fde047', 
        category: 'gradients' 
    },
    { 
        id: 'bg_sand', 
        name: 'رمال ذهبية', 
        type: 'gradient', 
        value: 'linear-gradient(to right, #fef3c7, #fde68a)', 
        border: '#d97706', 
        accent: '#78350f', 
        category: 'gradients',
        isLight: true
    },
    { 
        id: 'bg_sage', 
        name: 'أخضر ناعم', 
        type: 'gradient', 
        value: 'linear-gradient(to bottom right, #ecfdf5, #d1fae5)', 
        border: '#059669', 
        accent: '#064e3b', 
        category: 'gradients',
        isLight: true
    },
    { 
        id: 'bg_mesh_1', 
        name: 'طيف زمردي ونيلي', 
        type: 'gradient', 
        value: 'radial-gradient(at 0% 0%, #064e3b 0px, transparent 50%), radial-gradient(at 100% 100%, #1e1b4b 0px, transparent 50%), linear-gradient(to right, #0f766e, #312e81)', 
        border: '#10b981', 
        accent: '#fbbf24', 
        category: 'gradients' 
    },
    { 
        id: 'bg_mesh_2', 
        name: 'طيف كهرماني وأرجوان', 
        type: 'gradient', 
        value: 'radial-gradient(at 100% 0%, #7c2d12 0px, transparent 50%), radial-gradient(at 0% 100%, #4c1d95 0px, transparent 50%), linear-gradient(to right, #9a3412, #6b21a8)', 
        border: '#fb923c', 
        accent: '#fde047', 
        category: 'gradients' 
    },

    // --- 3. Solid Colors & Light Patterns (ألوان ونقوش فاتحة) ---
    { id: 'bg_white', name: 'أبيض ناصع', type: 'solid', value: '#ffffff', border: '#e2e8f0', accent: '#0f172a', category: 'solids', isLight: true },
    { id: 'bg_light_cream', name: 'كريمي عاجي ناعم', type: 'solid', value: '#faf8f5', border: '#d97706', accent: '#78350f', category: 'solids', isLight: true },
    { id: 'bg_light_parchment', name: 'رق قرآني مذهب', type: 'gradient', value: 'linear-gradient(135deg, #fffdfa 0%, #fef3c7 60%, #fde68a 100%)', border: '#f59e0b', accent: '#451a03', category: 'solids', isLight: true },
    { id: 'bg_light_mint', name: 'نعناعي لؤلؤي', type: 'gradient', value: 'linear-gradient(135deg, #f0fdf4 0%, #e6f4ea 50%, #d1fae5 100%)', border: '#10b981', accent: '#064e3b', category: 'solids', isLight: true },
    { id: 'bg_light_sky', name: 'سماوي ناصع', type: 'gradient', value: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)', border: '#0284c7', accent: '#0369a1', category: 'solids', isLight: true },
    { id: 'bg_light_rose', name: 'وردي حريري', type: 'gradient', value: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fecdd3 100%)', border: '#f43f5e', accent: '#881337', category: 'solids', isLight: true },
    { id: 'bg_light_gold', name: 'رقائق لؤلؤية ذهبية', type: 'gradient', value: 'linear-gradient(135deg, #fffbeb 0%, #fef9c3 50%, #fef08a 100%)', border: '#eab308', accent: '#713f12', category: 'solids', isLight: true },
    { id: 'bg_light_lavender', name: 'لافندر عاجي', type: 'gradient', value: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)', border: '#a855f7', accent: '#581c87', category: 'solids', isLight: true },
    { id: 'bg_light_turquoise', name: 'فيروزي ناعم', type: 'gradient', value: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #99f6e4 100%)', border: '#14b8a6', accent: '#042f2e', category: 'solids', isLight: true },
    { id: 'bg_light_pattern_dots', name: 'نقاط إسلامية فاتحة', type: 'pattern', value: 'radial-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(to right, #f8fafc, #f1f5f9)', border: '#94a3b8', accent: '#0f172a', category: 'solids', isLight: true },
    { id: 'bg_light_marble', name: 'رخام ملكي ناصع', type: 'gradient', value: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)', border: '#cbd5e1', accent: '#1e293b', category: 'solids', isLight: true },
    { id: 'bg_black', name: 'أسود كربوني', type: 'solid', value: '#0f172a', border: '#334155', accent: '#fbbf24', category: 'solids' },
    { id: 'bg_pattern_1', name: 'خطوط هندسية', type: 'pattern', value: 'repeating-linear-gradient(45deg, #0f172a, #0f172a 10px, #1e293b 10px, #1e293b 20px)', border: '#64748b', accent: '#fbbf24', category: 'solids' },
    { id: 'bg_pattern_2', name: 'دوائر هندسية', type: 'pattern', value: 'repeating-radial-gradient(circle at 0 0, transparent 0, #064e3b 15px), repeating-linear-gradient(#022c22, #022c22)', border: '#10b981', accent: '#fef08a', category: 'solids' }
];

const FRAMES = [
    { id: 'none', name: 'بدون إطار', type: 'none', color: 'transparent', category: 'all' },
    // براويز إسلامية مميزة
    { id: 'f_mamluk_gold', name: 'مملوكي ذهبي', type: 'mamluk-star', color: '#FFD700', category: 'islamic' },
    { id: 'f_mamluk_white', name: 'مملوكي أبيض', type: 'mamluk-star', color: '#ffffff', category: 'islamic' },
    { id: 'f_trefoil_gold', name: 'تاج المحراب ذهبي', type: 'trefoil-arch', color: '#FFD700', category: 'islamic' },
    { id: 'f_trefoil_white', name: 'تاج المحراب أبيض', type: 'trefoil-arch', color: '#ffffff', category: 'islamic' },
    { id: 'f_andalusian_gold', name: 'زخرفة أندلسية ذهبي', type: 'andalusian-lace', color: '#FFD700', category: 'islamic' },
    { id: 'f_andalusian_white', name: 'زخرفة أندلسية أبيض', type: 'andalusian-lace', color: '#ffffff', category: 'islamic' },
    { id: 'f_quranic_gold', name: 'مصحف مذهب فاخر', type: 'quranic-royal', color: '#FFD700', category: 'islamic' },
    { id: 'f_quranic_white', name: 'مصحف قرآني أبيض', type: 'quranic-royal', color: '#ffffff', category: 'islamic' },
    { id: 'f_ottoman_gold', name: 'عثماني ملكي ذهبي', type: 'ottoman-crest', color: '#FFD700', category: 'islamic' },
    { id: 'f_ottoman_white', name: 'عثماني ملكي أبيض', type: 'ottoman-crest', color: '#ffffff', category: 'islamic' },
    { id: 'f5', name: 'محراب ذهبي', type: 'mihrab', color: '#FFD700', category: 'islamic' },
    { id: 'f6', name: 'محراب أبيض', type: 'mihrab', color: '#ffffff', category: 'islamic' },
    { id: 'f7', name: 'محراب دبل ذهبي', type: 'mihrab-double', color: '#FFD700', category: 'islamic' },
    { id: 'f8', name: 'محراب دبل أبيض', type: 'mihrab-double', color: '#ffffff', category: 'islamic' },
    { id: 'f9', name: 'كلاسيكي إسلامي ذهبي', type: 'classic-islamic', color: '#FFD700', category: 'islamic' },
    { id: 'f10', name: 'كلاسيكي إسلامي أبيض', type: 'classic-islamic', color: '#ffffff', category: 'islamic' },
    // البراويز الكلاسيكية
    { id: 'f1', name: 'مزدوج ذهبي', type: 'double', color: '#FFD700', category: 'classic' },
    { id: 'f2', name: 'مزدوج أبيض', type: 'double', color: '#ffffff', category: 'classic' },
    { id: 'f_ornate_1', name: 'أنيق ذهبي', type: 'elegant', color: '#FFD700', category: 'classic' },
    { id: 'f_ornate_2', name: 'أنيق أبيض', type: 'elegant', color: '#ffffff', category: 'classic' },
    { id: 'f3', name: 'زوايا ذهبي', type: 'corner-diamonds', color: '#FFD700', category: 'classic' },
    { id: 'f4', name: 'زوايا أبيض', type: 'corner-diamonds', color: '#ffffff', category: 'classic' },
];

const FrameOverlay = ({ frame, scale = 1 }: { frame: typeof FRAMES[0], scale?: number }) => {
    if (frame.type === 'none') return null;
    
    const color = frame.color;
    const padding = 10 * scale;
    const borderW = 3 * scale;
    const cornerW = 8 * scale;
    const cornerOffset = -4 * scale;

    if (frame.type === 'double') {
        return <div style={{ position: 'absolute', top: `${padding}px`, left: `${padding}px`, right: `${padding}px`, bottom: `${padding}px`, border: `${borderW}px double ${color}`, borderRadius: `${8 * scale}px`, pointerEvents: 'none', zIndex: 5 }} />;
    }
    if (frame.type === 'corner-diamonds') {
        return (
            <div style={{ position: 'absolute', top: `${14 * scale}px`, left: `${14 * scale}px`, right: `${14 * scale}px`, bottom: `${14 * scale}px`, border: `${1 * scale}px solid ${color}`, pointerEvents: 'none', zIndex: 5 }}>
                <div style={{ position: 'absolute', top: `${cornerOffset}px`, left: `${cornerOffset}px`, width: `${cornerW}px`, height: `${cornerW}px`, backgroundColor: color, transform: 'rotate(45deg)' }} />
                <div style={{ position: 'absolute', top: `${cornerOffset}px`, right: `${cornerOffset}px`, width: `${cornerW}px`, height: `${cornerW}px`, backgroundColor: color, transform: 'rotate(45deg)' }} />
                <div style={{ position: 'absolute', bottom: `${cornerOffset}px`, left: `${cornerOffset}px`, width: `${cornerW}px`, height: `${cornerW}px`, backgroundColor: color, transform: 'rotate(45deg)' }} />
                <div style={{ position: 'absolute', bottom: `${cornerOffset}px`, right: `${cornerOffset}px`, width: `${cornerW}px`, height: `${cornerW}px`, backgroundColor: color, transform: 'rotate(45deg)' }} />
            </div>
        );
    }
    if (frame.type === 'mihrab') {
        return (
            <div style={{ position: 'absolute', top: `${padding}px`, left: `${padding}px`, right: `${padding}px`, bottom: `${padding}px`, border: `${2 * scale}px solid ${color}`, borderTopLeftRadius: `${60 * scale}px`, borderTopRightRadius: `${60 * scale}px`, borderBottomLeftRadius: `${8 * scale}px`, borderBottomRightRadius: `${8 * scale}px`, pointerEvents: 'none', zIndex: 5 }} />
        );
    }
    if (frame.type === 'elegant') {
        return (
            <div style={{ position: 'absolute', top: `${padding}px`, left: `${padding}px`, right: `${padding}px`, bottom: `${padding}px`, border: `${1 * scale}px solid ${color}`, borderRadius: `${12 * scale}px`, pointerEvents: 'none', zIndex: 5 }}>
                <div style={{ position: 'absolute', top: `${4 * scale}px`, left: `${4 * scale}px`, right: `${4 * scale}px`, bottom: `${4 * scale}px`, border: `${1 * scale}px solid ${color}`, borderRadius: `${8 * scale}px`, opacity: 0.5 }} />
            </div>
        );
    }
    if (frame.type === 'mihrab-double') {
        return (
            <div style={{ position: 'absolute', top: `${padding}px`, left: `${padding}px`, right: `${padding}px`, bottom: `${padding}px`, border: `${2 * scale}px solid ${color}`, borderTopLeftRadius: `${60 * scale}px`, borderTopRightRadius: `${60 * scale}px`, borderBottomLeftRadius: `${8 * scale}px`, borderBottomRightRadius: `${8 * scale}px`, pointerEvents: 'none', zIndex: 5 }}>
                <div style={{ position: 'absolute', top: `${4 * scale}px`, left: `${4 * scale}px`, right: `${4 * scale}px`, bottom: `${4 * scale}px`, border: `${1 * scale}px dashed ${color}`, borderTopLeftRadius: `${56 * scale}px`, borderTopRightRadius: `${56 * scale}px`, borderBottomLeftRadius: `${4 * scale}px`, borderBottomRightRadius: `${4 * scale}px`, opacity: 0.6 }} />
            </div>
        );
    }
    if (frame.type === 'classic-islamic') {
        const cSize = 25 * scale;
        return (
            <div style={{ position: 'absolute', top: `${padding}px`, left: `${padding}px`, right: `${padding}px`, bottom: `${padding}px`, pointerEvents: 'none', zIndex: 5, border: `${1 * scale}px solid ${color}`}}>
                <div style={{ position: 'absolute', top: `${3 * scale}px`, left: `${3 * scale}px`, right: `${3 * scale}px`, bottom: `${3 * scale}px`, border: `${2 * scale}px solid ${color}`, opacity: 0.9 }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${cSize}px`, height: `${cSize}px`, borderRight: `${2 * scale}px solid ${color}`, borderBottom: `${2 * scale}px solid ${color}`, backgroundColor: 'transparent', borderBottomRightRadius: '100%', opacity: 0.9 }} />
                    <div style={{ position: 'absolute', top: 0, right: 0, width: `${cSize}px`, height: `${cSize}px`, borderLeft: `${2 * scale}px solid ${color}`, borderBottom: `${2 * scale}px solid ${color}`, backgroundColor: 'transparent', borderBottomLeftRadius: '100%', opacity: 0.9 }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: `${cSize}px`, height: `${cSize}px`, borderRight: `${2 * scale}px solid ${color}`, borderTop: `${2 * scale}px solid ${color}`, backgroundColor: 'transparent', borderTopRightRadius: '100%', opacity: 0.9 }} />
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: `${cSize}px`, height: `${cSize}px`, borderLeft: `${2 * scale}px solid ${color}`, borderTop: `${2 * scale}px solid ${color}`, backgroundColor: 'transparent', borderTopLeftRadius: '100%', opacity: 0.9 }} />
                </div>
            </div>
        );
    }
    if (frame.type === 'mamluk-star') {
        const starSize = 22 * scale;
        const starOffset = -11 * scale;
        return (
            <div style={{ position: 'absolute', top: `${padding + 6 * scale}px`, left: `${padding + 6 * scale}px`, right: `${padding + 6 * scale}px`, bottom: `${padding + 6 * scale}px`, border: `${2 * scale}px solid ${color}`, pointerEvents: 'none', zIndex: 5 }}>
                <div style={{ position: 'absolute', top: `${4 * scale}px`, left: `${4 * scale}px`, right: `${4 * scale}px`, bottom: `${4 * scale}px`, border: `${1 * scale}px solid ${color}`, opacity: 0.6 }} />
                {/* 4 Islamic 8-Point Rub-el-Hizb Stars at corners */}
                <div style={{ position: 'absolute', top: `${starOffset}px`, left: `${starOffset}px`, width: `${starSize}px`, height: `${starSize}px` }}>
                    <svg width={starSize} height={starSize} viewBox="0 0 24 24">
                        <rect x="4" y="4" width="16" height="16" fill={color} />
                        <rect x="4" y="4" width="16" height="16" fill={color} transform="rotate(45 12 12)" />
                        <circle cx="12" cy="12" r="3" fill="#ffffff" opacity="0.85" />
                    </svg>
                </div>
                <div style={{ position: 'absolute', top: `${starOffset}px`, right: `${starOffset}px`, width: `${starSize}px`, height: `${starSize}px` }}>
                    <svg width={starSize} height={starSize} viewBox="0 0 24 24">
                        <rect x="4" y="4" width="16" height="16" fill={color} />
                        <rect x="4" y="4" width="16" height="16" fill={color} transform="rotate(45 12 12)" />
                        <circle cx="12" cy="12" r="3" fill="#ffffff" opacity="0.85" />
                    </svg>
                </div>
                <div style={{ position: 'absolute', bottom: `${starOffset}px`, left: `${starOffset}px`, width: `${starSize}px`, height: `${starSize}px` }}>
                    <svg width={starSize} height={starSize} viewBox="0 0 24 24">
                        <rect x="4" y="4" width="16" height="16" fill={color} />
                        <rect x="4" y="4" width="16" height="16" fill={color} transform="rotate(45 12 12)" />
                        <circle cx="12" cy="12" r="3" fill="#ffffff" opacity="0.85" />
                    </svg>
                </div>
                <div style={{ position: 'absolute', bottom: `${starOffset}px`, right: `${starOffset}px`, width: `${starSize}px`, height: `${starSize}px` }}>
                    <svg width={starSize} height={starSize} viewBox="0 0 24 24">
                        <rect x="4" y="4" width="16" height="16" fill={color} />
                        <rect x="4" y="4" width="16" height="16" fill={color} transform="rotate(45 12 12)" />
                        <circle cx="12" cy="12" r="3" fill="#ffffff" opacity="0.85" />
                    </svg>
                </div>
            </div>
        );
    }
    if (frame.type === 'trefoil-arch') {
        return (
            <div style={{ position: 'absolute', top: `${padding}px`, left: `${padding}px`, right: `${padding}px`, bottom: `${padding}px`, border: `${2.5 * scale}px solid ${color}`, borderTopLeftRadius: `${70 * scale}px`, borderTopRightRadius: `${70 * scale}px`, borderBottomLeftRadius: `${16 * scale}px`, borderBottomRightRadius: `${16 * scale}px`, pointerEvents: 'none', zIndex: 5 }}>
                <div style={{ position: 'absolute', top: `${5 * scale}px`, left: `${5 * scale}px`, right: `${5 * scale}px`, bottom: `${5 * scale}px`, border: `${1 * scale}px solid ${color}`, borderTopLeftRadius: `${65 * scale}px`, borderTopRightRadius: `${65 * scale}px`, borderBottomLeftRadius: `${12 * scale}px`, borderBottomRightRadius: `${12 * scale}px`, opacity: 0.65 }} />
                <div style={{ position: 'absolute', top: `${-12 * scale}px`, left: '50%', transform: 'translateX(-50%)', width: `${30 * scale}px`, height: `${24 * scale}px` }}>
                    <svg width={30 * scale} height={24 * scale} viewBox="0 0 30 24" fill="none">
                        <path d="M15 0 L18 8 L24 9 L19 14 L20 20 L15 16 L10 20 L11 14 L6 9 L12 8 Z" fill={color} />
                        <circle cx="15" cy="10" r="2.5" fill="#ffffff" />
                    </svg>
                </div>
            </div>
        );
    }
    if (frame.type === 'andalusian-lace') {
        const cLen = 35 * scale;
        return (
            <div style={{ position: 'absolute', top: `${padding}px`, left: `${padding}px`, right: `${padding}px`, bottom: `${padding}px`, border: `${1.5 * scale}px solid ${color}`, borderRadius: `${12 * scale}px`, pointerEvents: 'none', zIndex: 5 }}>
                <div style={{ position: 'absolute', top: `${6 * scale}px`, left: `${6 * scale}px`, right: `${6 * scale}px`, bottom: `${6 * scale}px`, border: `${1 * scale}px dashed ${color}`, borderRadius: `${8 * scale}px`, opacity: 0.7 }} />
                <svg style={{ position: 'absolute', top: 0, left: 0 }} width={cLen} height={cLen} viewBox="0 0 35 35" fill="none">
                    <path d="M2 33 V12 C2 6 6 2 12 2 H33" stroke={color} strokeWidth={2.5 * scale} strokeLinecap="round" />
                    <circle cx="12" cy="12" r="3" fill={color} />
                    <path d="M12 2 C12 8 8 12 2 12" stroke={color} strokeWidth={1.5 * scale} />
                </svg>
                <svg style={{ position: 'absolute', top: 0, right: 0 }} width={cLen} height={cLen} viewBox="0 0 35 35" fill="none">
                    <path d="M33 33 V12 C33 6 29 2 23 2 H2" stroke={color} strokeWidth={2.5 * scale} strokeLinecap="round" />
                    <circle cx="23" cy="12" r="3" fill={color} />
                    <path d="M23 2 C23 8 27 12 33 12" stroke={color} strokeWidth={1.5 * scale} />
                </svg>
                <svg style={{ position: 'absolute', bottom: 0, left: 0 }} width={cLen} height={cLen} viewBox="0 0 35 35" fill="none">
                    <path d="M2 2 V23 C2 29 6 33 12 33 H33" stroke={color} strokeWidth={2.5 * scale} strokeLinecap="round" />
                    <circle cx="12" cy="23" r="3" fill={color} />
                    <path d="M12 33 C12 27 8 23 2 23" stroke={color} strokeWidth={1.5 * scale} />
                </svg>
                <svg style={{ position: 'absolute', bottom: 0, right: 0 }} width={cLen} height={cLen} viewBox="0 0 35 35" fill="none">
                    <path d="M33 2 V23 C33 29 29 33 23 33 H2" stroke={color} strokeWidth={2.5 * scale} strokeLinecap="round" />
                    <circle cx="23" cy="23" r="3" fill={color} />
                    <path d="M23 33 C23 27 27 23 33 23" stroke={color} strokeWidth={1.5 * scale} />
                </svg>
            </div>
        );
    }
    if (frame.type === 'quranic-royal') {
        const cSize = 28 * scale;
        return (
            <div style={{ position: 'absolute', top: `${padding}px`, left: `${padding}px`, right: `${padding}px`, bottom: `${padding}px`, border: `${3 * scale}px solid ${color}`, pointerEvents: 'none', zIndex: 5 }}>
                <div style={{ position: 'absolute', top: `${5 * scale}px`, left: `${5 * scale}px`, right: `${5 * scale}px`, bottom: `${5 * scale}px`, border: `${1 * scale}px solid ${color}` }}>
                    <div style={{ position: 'absolute', top: `${4 * scale}px`, left: `${4 * scale}px`, right: `${4 * scale}px`, bottom: `${4 * scale}px`, border: `${1 * scale}px solid ${color}`, opacity: 0.6 }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${cSize}px`, height: `${cSize}px`, borderRight: `${1.5 * scale}px solid ${color}`, borderBottom: `${1.5 * scale}px solid ${color}`, borderBottomRightRadius: '100%' }} />
                    <div style={{ position: 'absolute', top: 0, right: 0, width: `${cSize}px`, height: `${cSize}px`, borderLeft: `${1.5 * scale}px solid ${color}`, borderBottom: `${1.5 * scale}px solid ${color}`, borderBottomLeftRadius: '100%' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: `${cSize}px`, height: `${cSize}px`, borderRight: `${1.5 * scale}px solid ${color}`, borderTop: `${1.5 * scale}px solid ${color}`, borderTopRightRadius: '100%' }} />
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: `${cSize}px`, height: `${cSize}px`, borderLeft: `${1.5 * scale}px solid ${color}`, borderTop: `${1.5 * scale}px solid ${color}`, borderTopLeftRadius: '100%' }} />
                </div>
            </div>
        );
    }
    if (frame.type === 'ottoman-crest') {
        return (
            <div style={{ position: 'absolute', top: `${padding + 4 * scale}px`, left: `${padding + 4 * scale}px`, right: `${padding + 4 * scale}px`, bottom: `${padding + 4 * scale}px`, border: `${2 * scale}px solid ${color}`, borderRadius: `${18 * scale}px`, pointerEvents: 'none', zIndex: 5 }}>
                <div style={{ position: 'absolute', top: `${6 * scale}px`, left: `${6 * scale}px`, right: `${6 * scale}px`, bottom: `${6 * scale}px`, border: `${1 * scale}px solid ${color}`, borderRadius: `${12 * scale}px`, opacity: 0.7 }} />
                <div style={{ position: 'absolute', top: `${-8 * scale}px`, left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.4)', padding: `0 ${8 * scale}px`, borderRadius: '9999px' }}>
                    <svg width={36 * scale} height={16 * scale} viewBox="0 0 36 16" fill="none">
                        <circle cx="18" cy="8" r="4" fill={color} />
                        <path d="M2 8h10m12 0h10" stroke={color} strokeWidth={1.5 * scale} strokeLinecap="round" />
                    </svg>
                </div>
                <div style={{ position: 'absolute', bottom: `${-8 * scale}px`, left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.4)', padding: `0 ${8 * scale}px`, borderRadius: '9999px' }}>
                    <svg width={36 * scale} height={16 * scale} viewBox="0 0 36 16" fill="none">
                        <circle cx="18" cy="8" r="4" fill={color} />
                        <path d="M2 8h10m12 0h10" stroke={color} strokeWidth={1.5 * scale} strokeLinecap="round" />
                    </svg>
                </div>
            </div>
        );
    }
    return null;
};

const TEXT_COLORS = [
    '#ffffff', '#000000', '#f1c40f', '#e74c3c', '#2ecc71', '#3498db',
    '#e67e22', '#1abc9c', '#ecf0f1', '#95a5a6', '#34495e',
    '#ff9ff3', '#feca57', '#ff6b6b', '#5f27cd'
];

const EXCLUDED_SHARE_FONT_IDS = new Set([
    "var(--font-katibeh)",
    "var(--font-qalam)",
    "'KFGQPC Uthman Taha Naskh'",
]);
const SHARE_FONTS = FONTS.filter((f) => !EXCLUDED_SHARE_FONT_IDS.has(f.id));

const SHORT_FONT_NAMES_AR: Record<string, string> = {
    "var(--font-amiri)": "نسخ",
    "var(--font-noto)": "حديث",
    "var(--font-lateef)": "تراثي",
    "var(--font-thuluth)": "ثلوث",
    "var(--font-aref)": "رقعة",
    "var(--font-harmattan)": "ورش",
    "var(--font-amiri-quran)": "حفص",
    "'Me Quran'": "مصحف",
    "var(--font-katibeh)": "قطيبة",
    "var(--font-qalam)": "قلم",
    "var(--font-kufi)": "كوفي",
    "'KFGQPC Uthman Taha Naskh'": "الفهد",
    "var(--font-scheherazade)": "مجود",
    "var(--font-mirza)": "ميرزا",
};

const SHORT_FONT_NAMES_EN: Record<string, string> = {
    "var(--font-amiri)": "Naskh",
    "var(--font-noto)": "Modern",
    "var(--font-lateef)": "Trad.",
    "var(--font-thuluth)": "Thuluth",
    "var(--font-aref)": "Ruq'ah",
    "var(--font-harmattan)": "Warsh",
    "var(--font-amiri-quran)": "Hafs",
    "'Me Quran'": "Mushaf",
    "var(--font-katibeh)": "Katibeh",
    "var(--font-qalam)": "Qalam",
    "var(--font-kufi)": "Kufi",
    "'KFGQPC Uthman Taha Naskh'": "Fahd",
    "var(--font-scheherazade)": "Mujaw.",
    "var(--font-mirza)": "Mirza",
};

const getShortFontLabel = (font: { id: string; name: string; nameEn?: string }, isEn: boolean): string => {
    if (isEn) {
        return SHORT_FONT_NAMES_EN[font.id] || (font.nameEn || font.name).split(' ')[0];
    }
    return SHORT_FONT_NAMES_AR[font.id] || font.name.split(' ')[0];
};

const ShareAyahModal: React.FC<ShareAyahModalProps> = ({
    isOpen,
    onClose,
    currentAyah,
    quranData,
    currentTheme,
    readingMode = 'mushaf',
    settings: propSettings,
    showToast,
    instantShareMode = false,
    instantShareNonce
}) => {
    const { language } = useLanguage();
    const isEn = language === 'en';

    const getDefaultBgForOpen = (prefs?: ShareStudioPrefs): ShareBgOption => {
        const savedPrefs = prefs ?? loadShareStudioPrefs();
        if (savedPrefs.bgId) {
            const matched = SHARE_DESIGN_BGS.find((b) => b.id === savedPrefs.bgId);
            if (matched) return matched;
        }
        const activeDesignId = getSelectedShareDesign();
        return SHARE_DESIGN_BGS.find((b) => b.designId === activeDesignId) || SHARE_DESIGN_BGS[0];
    };

    const getDefaultFrameForOpen = () => {
        return FRAMES[0];
    };

    const getDefaultFontForOpen = (prefs?: ShareStudioPrefs) => {
        const savedPrefs = prefs ?? loadShareStudioPrefs();
        if (savedPrefs.fontId && SHARE_FONTS.some((f) => f.id === savedPrefs.fontId)) {
            return savedPrefs.fontId;
        }
        return SHARE_FONTS[0].id;
    };

    const getDefaultFontSizeForOpen = (prefs?: ShareStudioPrefs) => {
        const savedPrefs = prefs ?? loadShareStudioPrefs();
        if (typeof savedPrefs.fontSize === 'number' && savedPrefs.fontSize >= 12 && savedPrefs.fontSize <= 48) {
            return savedPrefs.fontSize;
        }
        return 20;
    };

    const getDefaultTextColorForOpen = (bg: ShareBgOption, prefs?: ShareStudioPrefs) => {
        const savedPrefs = prefs ?? loadShareStudioPrefs();
        if (typeof savedPrefs.textColor === 'string' && savedPrefs.textColor) {
            return savedPrefs.textColor;
        }
        return bg.defaultTextColor || (bg.isLight ? TEXT_COLORS[1] : TEXT_COLORS[0]);
    };

    const initialPrefsRef = useRef<ShareStudioPrefs | null>(null);
    if (!initialPrefsRef.current) {
        initialPrefsRef.current = loadShareStudioPrefs();
    }
    const initialPrefs = initialPrefsRef.current;
    const initialBgResolved = getDefaultBgForOpen(initialPrefs);

    const [shareType, setShareType] = useState<'text' | 'image' | 'page' | 'audio'>(() =>
        instantShareMode ? 'image' : (initialPrefs.shareType || 'image')
    );
    const [fromAyah, setFromAyah] = useState(currentAyah.a);
    const [toAyah, setToAyah] = useState(currentAyah.a);
    const [selectedAyahs, setSelectedAyahs] = useState<{ s: number; a: number }[]>([currentAyah]);

    const [selectedBg, setSelectedBg] = useState<ShareBgOption>(() => initialBgResolved);
    const [selectedFrame, setSelectedFrame] = useState(() => getDefaultFrameForOpen());
    const [selectedFont, setSelectedFont] = useState(() => getDefaultFontForOpen(initialPrefs));
    const [fontSize, setFontSize] = useState(() => getDefaultFontSizeForOpen(initialPrefs));
    const [textColor, setTextColor] = useState(() => getDefaultTextColorForOpen(initialBgResolved, initialPrefs));
    const [studioGroup, setStudioGroup] = useState<'typography' | null>(null);
    const [hideDesktopCustomization, setHideDesktopCustomization] = useState(false);
    const isPointerDraggingRef = useRef(false);
    const dragStartXRef = useRef(0);
    const dragStartYRef = useRef(0);
    const draggedFarRef = useRef(false);
    const [dragOffset, setDragOffset] = useState(0);
    const [isCopiedFeedback, setIsCopiedFeedback] = useState(false);
    const [shareDesignThumbs, setShareDesignThumbs] = useState<Record<string, string>>(() =>
        getShareDesignThumbsSnapshot(isEn)
    );

    const suppressDesignSyncRef = useRef(false);
    const handleSelectBg = (bg: ShareBgOption) => {
        setSelectedBg(bg);
        if (bg.type === 'share_design' && bg.designId) {
            suppressDesignSyncRef.current = true;
            setSelectedShareDesign(bg.designId);
            setTimeout(() => {
                suppressDesignSyncRef.current = false;
            }, 0);
        }
        if (bg.type === 'share_design' && bg.defaultTextColor) {
            setTextColor(bg.defaultTextColor);
        } else if (bg.id === 'bg_white' || bg.isLight) {
            const isCurrentLightText =
                textColor === '#ffffff' ||
                textColor === '#F8FAFC' ||
                textColor === '#FFFDF7' ||
                textColor === '#FAF5FF' ||
                textColor === '#FFFBEB' ||
                textColor === '#FFFDF9';
            if (isCurrentLightText) setTextColor('#000000');
        } else {
            if (textColor === '#000000' || selectedBg.isLight) setTextColor('#ffffff');
        }
    };
    const [isRangePickerOpen, setIsRangePickerOpen] = useState(false);
    const [rangeSelectionMode, setRangeSelectionMode] = useState<'single' | 'range'>('single');
    const [rangeActiveStep, setRangeActiveStep] = useState<'from' | 'to'>('from');
    const [customText, setCustomText] = useState(() =>
        typeof initialPrefs.customText === 'string' ? initialPrefs.customText : ''
    );
    const [showBismillah, setShowBismillah] = useState<boolean>(() =>
        typeof initialPrefs.showBismillah === 'boolean' ? initialPrefs.showBismillah : true
    );
    const [isSharing, setIsSharing] = useState(false);
    const [isCopying, setIsCopying] = useState(false);
    const [explanationData, setExplanationData] = useState<any>(null);
    const [explanationReady, setExplanationReady] = useState(() => readingMode === 'mushaf');
    const [appSettings, setAppSettings] = useState<any>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const previewStageRef = useRef<HTMLDivElement>(null);
    const [stageSize, setStageSize] = useState<{ w: number; h: number }>({ w: 340, h: 480 });
    const hiddenImageCaptureRef = useRef<HTMLDivElement>(null);
    const hiddenCapturePagesRef = useRef<(HTMLDivElement | null)[]>([]);
    const hiddenCaptureRef = useRef<HTMLDivElement>(null);
    const selectedAyahRef = useRef<HTMLButtonElement>(null);
    const rangeListRef = useRef<HTMLDivElement>(null);
    const modalBackdropRef = useRef<HTMLDivElement>(null);
    const studioShellRef = useRef<HTMLDivElement>(null);
    const activeColorBtnRef = useRef<HTMLButtonElement>(null);
    const activeFontBtnRef = useRef<HTMLButtonElement>(null);
    const [currentImagePageIndex, setCurrentImagePageIndex] = useState(0);

    useEffect(() => {
        if (studioGroup !== 'typography') return;
        const t = setTimeout(() => {
            activeColorBtnRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            activeFontBtnRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }, 70);
        return () => clearTimeout(t);
    }, [studioGroup]);

    useEffect(() => {
        if (instantShareMode) return;
        setShareDesignThumbs(getShareDesignThumbsSnapshot(isEn));
        const unsub = subscribeShareDesignThumbs(() => {
            setShareDesignThumbs(getShareDesignThumbsSnapshot(isEn));
        });
        if (isOpen) {
            prewarmShareDesignThumbs(isEn);
        }
        return unsub;
    }, [isEn, isOpen, instantShareMode]);

    useEffect(() => {
        if (!isOpen || (shareType !== 'image' && shareType !== 'page')) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            const total = SHARE_DESIGN_BGS.length;
            const curIdx = Math.max(0, SHARE_DESIGN_BGS.findIndex((bg) => bg.id === selectedBg.id));
            if (e.key === 'ArrowRight') {
                const prevIdx = (curIdx - 1 + total) % total;
                handleSelectBg(SHARE_DESIGN_BGS[prevIdx]);
            } else if (e.key === 'ArrowLeft') {
                const nextIdx = (curIdx + 1) % total;
                handleSelectBg(SHARE_DESIGN_BGS[nextIdx]);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, shareType, selectedBg.id]);

    const shareDesignAssets = useMemo(() => {
        if (selectedBg.type !== 'share_design' || !selectedBg.designId) return null;
        const backdropUrl = renderDesignBackdropToDataUrl(selectedBg.designId, 1920);
        return {
            exportBackdropUrl: backdropUrl,
            previewBackdropUrl: backdropUrl,
            upperMotifUrl: renderDesignMotifDataUrl(selectedBg.designId, 'upper'),
            lowerMotifUrl: renderDesignMotifDataUrl(selectedBg.designId, 'lower'),
        };
    }, [selectedBg]);

    useEffect(() => {
        if (!isRangePickerOpen) return;
        const timer = setTimeout(() => {
            const container = rangeListRef.current;
            const item = selectedAyahRef.current;
            if (container && item) {
                const containerRect = container.getBoundingClientRect();
                const itemRect = item.getBoundingClientRect();
                const itemOffsetWithinContainer = itemRect.top - containerRect.top + container.scrollTop;
                const targetScrollTop = itemOffsetWithinContainer - (container.clientHeight - itemRect.height) / 2;
                const maxScroll = Math.max(0, container.scrollHeight - container.clientHeight);
                container.scrollTop = Math.max(0, Math.min(maxScroll, targetScrollTop));
            }
            if (modalBackdropRef.current) modalBackdropRef.current.scrollTop = 0;
            if (studioShellRef.current) studioShellRef.current.scrollTop = 0;
        }, 60);
        return () => clearTimeout(timer);
    }, [isRangePickerOpen, rangeActiveStep, rangeSelectionMode]);

    useEffect(() => {
        if (!isOpen || instantShareMode) return;
        if (modalBackdropRef.current) modalBackdropRef.current.scrollTop = 0;
        if (studioShellRef.current) studioShellRef.current.scrollTop = 0;
        if (previewStageRef.current) previewStageRef.current.scrollTop = 0;
    }, [isOpen, instantShareMode, isRangePickerOpen, fromAyah, toAyah, shareType]);

    useEffect(() => {
        if (!isOpen || instantShareMode) return;
        const unregister = registerBackInterceptor(() => {
            if (isRangePickerOpen) {
                setIsRangePickerOpen(false);
                return true;
            }
            if (studioGroup !== null) {
                setStudioGroup(null);
                return true;
            }
            onClose();
            return true;
        });
        return unregister;
    }, [isOpen, instantShareMode, isRangePickerOpen, studioGroup, onClose]);

    useEffect(() => {
        if (!isOpen || instantShareMode) return;
        const el = previewStageRef.current;
        if (!el) return;
        const measure = () => {
            const cs = window.getComputedStyle(el);
            const padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
            const padY = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
            const innerW = Math.max(0, el.clientWidth - padX);
            const innerH = Math.max(0, el.clientHeight - padY);
            if (innerW > 0 && innerH > 0) {
                setStageSize({ w: innerW, h: innerH });
            }
        };
        measure();
        let ro: ResizeObserver | null = null;
        if (typeof ResizeObserver !== 'undefined') {
            ro = new ResizeObserver(() => measure());
            ro.observe(el);
        }
        window.addEventListener('resize', measure);
        return () => {
            ro?.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [isOpen, instantShareMode, shareType, studioGroup]);

    useEffect(() => {
        if (isOpen && currentAyah?.a) {
            setFromAyah(currentAyah.a);
            setToAyah(currentAyah.a);
            setSelectedAyahs([currentAyah]);
        }
    }, [isOpen, currentAyah?.s, currentAyah?.a]);

    useEffect(() => {
        const saved = localStorage.getItem('quran_settings');
        if (saved) {
            try {
                setAppSettings(JSON.parse(saved));
            } catch (e) {}
        }
    }, []);

    useEffect(() => {
        if (readingMode === 'mushaf') {
            setExplanationReady(true);
            return;
        }
        let active = true;
        setExplanationReady(false);
        const fetchExplanation = async () => {
            try {
                let url = '';
                const activeMode = readingMode;
                
                if (activeMode === 'tafseer') url = '/assets/data/ar.jalalayn.json';
                else if (activeMode === 'meanings') url = '/tafseer.json';
                else if (activeMode === 'translation' || activeMode === 'bilingual') url = '/en.json';
                
                if (url) {
                    const res = await fetch(url);
                    const data = await res.json();
                    if (active) setExplanationData(data);
                }
            } catch (e) {
                console.error('Error fetching explanation for share:', e);
            } finally {
                if (active) setExplanationReady(true);
            }
        };
        fetchExplanation();
        return () => {
            active = false;
        };
    }, [readingMode, propSettings?.tafseer]);

    useEffect(() => {
        const handleExternalDesignChange = (e: Event) => {
            if (suppressDesignSyncRef.current) return;
            const detail = (e as CustomEvent)?.detail;
            const designId = detail?.designId;
            if (!designId) return;
            const matched = BACKGROUNDS.find((b) => b.designId === designId);
            if (matched) {
                setSelectedBg(matched);
                const nextColor = matched.defaultTextColor || (matched.isLight ? TEXT_COLORS[1] : TEXT_COLORS[0]);
                setTextColor(nextColor);
                const prev = loadShareStudioPrefs();
                saveShareStudioPrefs({ ...prev, bgId: matched.id, textColor: nextColor });
            }
        };
        window.addEventListener(SHARE_DESIGN_CHANGE_EVENT, handleExternalDesignChange);
        return () => window.removeEventListener(SHARE_DESIGN_CHANGE_EVENT, handleExternalDesignChange);
    }, []);

    useEffect(() => {
        if (isOpen) {
            const savedPrefs = loadShareStudioPrefs();
            const restoredBg = getDefaultBgForOpen(savedPrefs);
            const restoredFrame = getDefaultFrameForOpen();
            const restoredFont = getDefaultFontForOpen(savedPrefs);
            const restoredFontSize = getDefaultFontSizeForOpen(savedPrefs);
            const restoredTextColor = getDefaultTextColorForOpen(restoredBg, savedPrefs);
            const restoredCustomText = typeof savedPrefs.customText === 'string' ? savedPrefs.customText : '';
            const restoredShowBismillah = typeof savedPrefs.showBismillah === 'boolean' ? savedPrefs.showBismillah : true;

            setFromAyah(currentAyah.a);
            setToAyah(currentAyah.a);
            setSelectedAyahs([currentAyah]);
            setSelectedBg(restoredBg);
            setSelectedFrame(restoredFrame);
            setFontSize(restoredFontSize);
            setTextColor(restoredTextColor);
            setSelectedFont(restoredFont);
            setCustomText(restoredCustomText);
            setShowBismillah(restoredShowBismillah);
            setShareType(instantShareMode ? 'image' : (savedPrefs.shareType || 'image'));
            setStudioGroup(null);
            setHideDesktopCustomization(false);
            setIsRangePickerOpen(false);
            setRangeSelectionMode('single');
            setRangeActiveStep('from');
            setCurrentImagePageIndex(0);
        }
    }, [isOpen, currentAyah.s, currentAyah.a, instantShareMode]);

    // Persist studio customizations automatically whenever changed inside Share Page
    useEffect(() => {
        if (!isOpen || instantShareMode) return;
        saveShareStudioPrefs({
            bgId: selectedBg.id,
            frameId: selectedFrame.id,
            fontId: selectedFont,
            fontSize,
            textColor,
            customText,
            showBismillah,
            shareType,
        });
    }, [isOpen, instantShareMode, selectedBg, selectedFrame, selectedFont, fontSize, textColor, customText, showBismillah, shareType]);

    useEffect(() => {
        const start = Math.min(fromAyah, toAyah);
        const end = Math.max(fromAyah, toAyah);
        const newSelected = [];
        for (let a = start; a <= end; a++) {
            newSelected.push({ s: currentAyah.s, a });
        }
        setSelectedAyahs(newSelected);
        setCurrentImagePageIndex(0);
    }, [fromAyah, toAyah, currentAyah.s, shareType]);

    const handleShareRef = useRef<(shareMode?: 'all' | 'current') => Promise<void>>(async () => {});
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;
    const instantShareTriggeredNonceRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isOpen || !instantShareMode || !quranData) return;
        const nonce = instantShareNonce ?? 1;
        if (instantShareTriggeredNonceRef.current === nonce) return;
        if (!explanationReady) return;
        if (fromAyah !== currentAyah.a || toAyah !== currentAyah.a) return;
        if (!hiddenImageCaptureRef.current) return;

        instantShareTriggeredNonceRef.current = nonce;
        (async () => {
            try {
                await handleShareRef.current('current');
            } finally {
                onCloseRef.current();
            }
        })();
    }, [isOpen, instantShareMode, instantShareNonce, quranData, explanationReady, fromAyah, toAyah, currentAyah.s, currentAyah.a]);

    if (!isOpen || !quranData) return null;

    const stripTajweedTags = (text: string) => {
        return text;
    };

    const fixQuranText = (text: string) => {
        if (!text) return "";
        return text.replace(/۞/g, '');
    };

    const getAyahText = (s: number, a: number, strip: boolean = true) => {
        const surah = quranData.surahs[s - 1];
        if (!surah) return '';
        const ayah = surah.ayahs.find((ay: any) => ay.numberInSurah === a);
        if (!ayah) return '';
        let text = strip ? stripTajweedTags(ayah.text) : ayah.text;
        text = fixQuranText(text);
        if (s !== 1 && s !== 9 && a === 1) {
            text = text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').replace('بِّسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').trim();
        }
        return text;
    };

    const getSurahName = (s: number) => {
        return SURAH_NAMES_AR[s - 1] || '';
    };

    const getExplanationText = (s: number, a: number) => {
        if (!explanationData) return '';
        if (readingMode === 'mushaf') return '';
        
        const activeMode: any = readingMode;

        if (activeMode === 'tafseer' || activeMode === 'ar.jalalayn') {
            return explanationData.data?.surahs?.[s - 1]?.ayahs?.[a - 1]?.text || explanationData[s - 1]?.ayahs?.[a - 1]?.text || '';
        }
        if (activeMode === 'meanings' || activeMode === 'tafseer.json') {
            return explanationData.find((m: any) => m.number === String(s) && m.aya === String(a))?.text || '';
        }
        if (activeMode === 'translation' || activeMode === 'bilingual' || activeMode === 'en.json') {
            return explanationData[s - 1]?.verses?.[a - 1]?.translation || '';
        }
        return '';
    };

    const combinedText = selectedAyahs.map(ay => getAyahText(ay.s, ay.a) + ` ﴿${toArabic(ay.a)}﴾`).join(' ');
    const combinedExplanation = selectedAyahs.map(ay => getExplanationText(ay.s, ay.a)).filter(t => t).join('\n');
    const firstAyah = selectedAyahs[0];
    const lastAyah = selectedAyahs[selectedAyahs.length - 1];
    const getSurahMetadata = (s: number) => {
        const surah = quranData.surahs[s - 1];
        if (!surah) return '';
        const revelationType = surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية';
        return `${getAyahCountText(surah.ayahs.length)} | ${revelationType}`;
    };

    const surahInfo = firstAyah.s === lastAyah.s 
        ? (firstAyah.a === lastAyah.a 
            ? `سورة ${getSurahName(firstAyah.s)} - آية ${toArabic(firstAyah.a)} (${getSurahMetadata(firstAyah.s)})`
            : `سورة ${getSurahName(firstAyah.s)} - آية ${toArabic(firstAyah.a)} إلى آية ${toArabic(lastAyah.a)} (${getSurahMetadata(firstAyah.s)})`)
        : `سورة ${getSurahName(firstAyah.s)} آية ${toArabic(firstAyah.a)} - سورة ${getSurahName(lastAyah.s)} آية ${toArabic(lastAyah.a)}`;

    const getAyahLength = (ay: { s: number; a: number }) => {
        const text = getAyahText(ay.s, ay.a, false) || '';
        const exp = getExplanationText(ay.s, ay.a) || '';
        return text.length + 8 + (exp ? exp.length * 0.8 : 0);
    };

    const pageNum = useMemo(() => {
        return quranData?.surahs?.[currentAyah.s - 1]?.ayahs?.find((ay: any) => ay.numberInSurah === currentAyah.a)?.page || 1;
    }, [quranData, currentAyah.s, currentAyah.a]);

    const pageAyahs = useMemo(() => {
        const items: any[] = [];
        if (!quranData?.surahs) return items;
        quranData.surahs.forEach((surah: any, sIdx: number) => {
            surah.ayahs.forEach((ayah: any) => {
                if (ayah.page === pageNum) {
                    items.push({
                        ...ayah,
                        sNum: sIdx + 1,
                        numberInSurah: ayah.numberInSurah,
                        sName: surah.name,
                        juz: ayah.juz,
                        hizbQuarter: ayah.hizbQuarter,
                    });
                }
            });
        });
        return items;
    }, [quranData, pageNum]);

    const activeSourceAyahs = useMemo(() => {
        if (shareType === 'page' && pageAyahs.length > 0) {
            return pageAyahs.map((ay) => ({ s: ay.sNum, a: ay.numberInSurah }));
        }
        return selectedAyahs;
    }, [shareType, pageAyahs, selectedAyahs]);

    // Calculate page chunks for image & page sharing:
    // - Keep all selected verses (or full Mushaf page) in ONE single image whenever their combined content fits within
    //   a full Mushaf page (even if the selected verses straddle two Mushaf pages, e.g. 2-5 verses).
    // - Split into multiple balanced images ONLY when the selected verses exceed a full Mushaf page.
    const pageChunks = useMemo(() => {
        if (!activeSourceAyahs || activeSourceAyahs.length === 0 || !quranData) return [];

        const SINGLE_PAGE_MAX_CHARS = 1320;
        const TARGET_CHUNK_CHARS = 1150;

        // Precompute full Mushaf page text lengths for touched pages to measure true page coverage
        const touchedPages = new Set<number>();
        const ayahItems = activeSourceAyahs.map((ay) => {
            const ayahObj = quranData?.surahs?.[ay.s - 1]?.ayahs?.find((x: any) => x.numberInSurah === ay.a);
            const page = ayahObj?.page || 1;
            touchedPages.add(page);
            const weightedLen = getAyahLength(ay);
            const rawTextLen = (getAyahText(ay.s, ay.a, false) || '').length + 8;
            return { ay, page, weightedLen, rawTextLen };
        });

        const fullMushafPageChars = new Map<number, number>();
        if (quranData?.surahs) {
            for (const surah of quranData.surahs) {
                for (const ayah of surah.ayahs || []) {
                    if (touchedPages.has(ayah.page)) {
                        const prev = fullMushafPageChars.get(ayah.page) || 0;
                        fullMushafPageChars.set(ayah.page, prev + ((ayah.text || '').length + 8));
                    }
                }
            }
        }

        const totalWeightedChars = ayahItems.reduce((sum, item) => sum + item.weightedLen, 0);
        const totalMushafPageCoverage = ayahItems.reduce((sum, item) => {
            // Use at least a standard 15-line Mushaf page baseline (~1150 chars) so short ornamental
            // pages (like p.1-2 or short Juz Amma pages with surah headers) don't prematurely split
            const effectivePageCap = Math.max(1150, fullMushafPageChars.get(item.page) || 1150);
            return sum + item.rawTextLen / effectivePageCap;
        }, 0);

        const allSameMushafPage = touchedPages.size === 1;
        const fitsInSinglePage =
            ayahItems.length <= 1 ||
            (allSameMushafPage && readingMode === 'mushaf') ||
            (totalMushafPageCoverage <= 1.05 && totalWeightedChars <= SINGLE_PAGE_MAX_CHARS);

        const rawGroups: { ayahs: { s: number; a: number }[]; startPage: number; endPage: number }[] = [];

        if (fitsInSinglePage) {
            rawGroups.push({
                ayahs: ayahItems.map((i) => i.ay),
                startPage: ayahItems[0].page,
                endPage: ayahItems[ayahItems.length - 1].page,
            });
        } else {
            const estimatedChunks = Math.max(
                2,
                Math.ceil(Math.max(totalMushafPageCoverage, totalWeightedChars / TARGET_CHUNK_CHARS))
            );
            let chunksLeft = estimatedChunks;
            let remainingChars = totalWeightedChars;
            let currentItems: typeof ayahItems = [];
            let currentLen = 0;

            for (const item of ayahItems) {
                if (currentItems.length === 0) {
                    currentItems.push(item);
                    currentLen = item.weightedLen;
                    remainingChars -= item.weightedLen;
                    continue;
                }

                const wouldExceedMax = currentLen + item.weightedLen > SINGLE_PAGE_MAX_CHARS;
                let shouldSplitForBalance = false;

                if (!wouldExceedMax && chunksLeft > 1) {
                    const idealTarget = (currentLen + remainingChars) / chunksLeft;
                    const closerWithoutItem =
                        currentLen >= idealTarget ||
                        Math.abs(currentLen - idealTarget) <= Math.abs(currentLen + item.weightedLen - idealTarget);
                    const restCanFit = remainingChars <= (chunksLeft - 1) * SINGLE_PAGE_MAX_CHARS;
                    if (closerWithoutItem && restCanFit) {
                        shouldSplitForBalance = true;
                    }
                }

                if (wouldExceedMax || shouldSplitForBalance) {
                    rawGroups.push({
                        ayahs: currentItems.map((i) => i.ay),
                        startPage: currentItems[0].page,
                        endPage: currentItems[currentItems.length - 1].page,
                    });
                    chunksLeft = Math.max(1, chunksLeft - 1);
                    currentItems = [item];
                    currentLen = item.weightedLen;
                    remainingChars -= item.weightedLen;
                } else {
                    currentItems.push(item);
                    currentLen += item.weightedLen;
                    remainingChars -= item.weightedLen;
                }
            }

            if (currentItems.length > 0) {
                rawGroups.push({
                    ayahs: currentItems.map((i) => i.ay),
                    startPage: currentItems[0].page,
                    endPage: currentItems[currentItems.length - 1].page,
                });
            }
        }

        const totalPages = rawGroups.length;

        return rawGroups.map((grp, idx) => {
            const first = grp.ayahs[0];
            const last = grp.ayahs[grp.ayahs.length - 1];
            const pageNum = idx + 1;
            const extraSurahHeaderCount = grp.ayahs.reduce(
                (cnt, ay, i) => cnt + (i > 0 && ay.a === 1 ? 1 : 0),
                0
            );
            const totalChars =
                grp.ayahs.reduce((sum, ay) => sum + getAyahLength(ay), 0) +
                extraSurahHeaderCount * 110;

            const surahName = getSurahName(first.s);
            let surahInfoText = '';
            if (first.s === last.s) {
                if (first.a === last.a) {
                    surahInfoText = `سورة ${surahName} - آية ${toArabic(first.a)}`;
                } else {
                    surahInfoText = `سورة ${surahName} - الآيات ${toArabic(first.a)} إلى ${toArabic(last.a)}`;
                }
            } else {
                surahInfoText = `سورة ${surahName} آية ${toArabic(first.a)} - سورة ${getSurahName(last.s)} آية ${toArabic(last.a)}`;
            }

            if (totalPages > 1) {
                surahInfoText += ` (صورة ${toArabic(pageNum)} من ${toArabic(totalPages)})`;
            }

            return {
                pageNumber: pageNum,
                totalPages,
                mushafPage: grp.startPage,
                endMushafPage: grp.endPage,
                ayahs: grp.ayahs,
                fromAyah: first.a,
                toAyah: last.a,
                totalChars,
                surahInfoText
            };
        });
    }, [activeSourceAyahs, quranData, explanationData, readingMode]);

    const safePageIndex = Math.min(currentImagePageIndex, Math.max(0, (pageChunks.length || 1) - 1));
    const currentPageChunk = pageChunks[safePageIndex] || pageChunks[0];

    const userRatio = (fontSize || 20) / 20;

    const getChunkTypography = (chunkChars: number, ratio: number = 1) => {
        let baseSize: number;
        let lineHeight: number;
        let bismillahSize: number;

        if (chunkChars < 60) {
            baseSize = 124;
            lineHeight = 2.45;
            bismillahSize = 64;
        } else if (chunkChars < 120) {
            baseSize = 108;
            lineHeight = 2.35;
            bismillahSize = 60;
        } else if (chunkChars < 220) {
            baseSize = 94;
            lineHeight = 2.25;
            bismillahSize = 56;
        } else if (chunkChars < 350) {
            baseSize = 82;
            lineHeight = 2.15;
            bismillahSize = 52;
        } else if (chunkChars < 500) {
            baseSize = 72;
            lineHeight = 2.08;
            bismillahSize = 48;
        } else if (chunkChars < 680) {
            baseSize = 65;
            lineHeight = 2.02;
            bismillahSize = 46;
        } else if (chunkChars < 880) {
            baseSize = 60;
            lineHeight = 1.98;
            bismillahSize = 44;
        } else if (chunkChars < 1080) {
            baseSize = 54;
            lineHeight = 1.90;
            bismillahSize = 42;
        } else if (chunkChars < 1240) {
            baseSize = 48;
            lineHeight = 1.82;
            bismillahSize = 40;
        } else if (chunkChars < 1420) {
            baseSize = 42;
            lineHeight = 1.72;
            bismillahSize = 36;
        } else {
            baseSize = 38;
            lineHeight = 1.65;
            bismillahSize = 34;
        }

        const maxSafeFontSize = chunkChars >= 1350 ? 64 : chunkChars >= 1150 ? 74 : chunkChars >= 900 ? 86 : 145;
        const ayahFontSize = Math.min(maxSafeFontSize, Math.max(20, Math.round(baseSize * ratio)));
        const explanationFontSize = Math.max(16, Math.round(ayahFontSize * 0.62));
        return { ayahFontSize, lineHeight, bismillahSize, explanationFontSize };
    };

    const [toolbarHeights, setToolbarHeights] = useState({ top: 56, bottom: 64 });

    useEffect(() => {
        const header = document.getElementById('header');
        const footer = document.getElementById('bottom-bar');
        if (header && footer) {
            setToolbarHeights({
                top: header.offsetHeight,
                bottom: footer.offsetHeight
            });
        }
    }, []);

    const handleShare = async (shareMode: 'all' | 'current' = 'all') => {
        if (isSharing) return;
        setIsSharing(true);
        
        let shareText = `${surahInfo}\nآيات من القرآن الكريم . بواسطة : مصحف أحمد و ليلى`;
        
        if (shareType === 'page') {
            let pageSurahInfo = surahInfo;
            if (pageAyahs.length > 0) {
                const firstPageAyah = pageAyahs[0];
                const lastPageAyah = pageAyahs[pageAyahs.length - 1];
                pageSurahInfo = firstPageAyah.sNum === lastPageAyah.sNum 
                    ? `سورة ${getSurahName(firstPageAyah.sNum)} - آية ${toArabic(firstPageAyah.numberInSurah)} إلى آية ${toArabic(lastPageAyah.numberInSurah)}`
                    : `سورة ${getSurahName(firstPageAyah.sNum)} آية ${toArabic(firstPageAyah.numberInSurah)} - سورة ${getSurahName(lastPageAyah.sNum)} آية ${toArabic(lastPageAyah.numberInSurah)}`;
            }
            
            shareText = `صفحة ${toArabic(pageNum)} - ${pageSurahInfo}\nآيات من القرآن الكريم . بواسطة : مصحف أحمد و ليلى`;
        }
        
        const fullText = `${combinedText}\n\n${combinedExplanation ? combinedExplanation + '\n\n' : ''}${shareText}`;

        const blobToBase64 = (blob: Blob): Promise<string> => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        };

        try {
            if (shareType === 'text') {
                if (Capacitor.isNativePlatform()) {
                    await Share.share({
                        title: 'مشاركة آية',
                        text: fullText,
                        dialogTitle: 'مشاركة عبر'
                    });
                } else if (navigator.share) {
                    await navigator.share({
                        title: 'مشاركة آية',
                        text: fullText,
                    }).catch(e => {
                        if (e.name !== 'AbortError') throw e;
                    });
                } else {
                    showToast?.("المشاركة غير مدعومة في هذا المتصفح");
                }
            } else if (shareType === 'image' || shareType === 'page') {
                const isPageShare = shareType === 'page';
                try {
                    setIsSharing(true);
                    const isSinglePage = pageChunks.length <= 1 || shareMode === 'current';
                    const targetChunks = isSinglePage ? [currentPageChunk] : pageChunks;
                    const targetIndices = isSinglePage ? [safePageIndex] : pageChunks.map((_, i) => i);

                    const capturedImages: { dataUrl: string; chunk: typeof currentPageChunk }[] = [];

                    for (let i = 0; i < targetIndices.length; i++) {
                        const chunkIdx = targetIndices[i];
                        const captureElement = hiddenCapturePagesRef.current[chunkIdx] || hiddenImageCaptureRef.current;
                        if (!captureElement) continue;

                        const originalStyle = captureElement.style.cssText;
                        
                        // Force rendering for capture - using absolute and far off-screen
                        captureElement.style.position = 'absolute';
                        captureElement.style.left = '-9999px';
                        captureElement.style.top = '-9999px';
                        captureElement.style.visibility = 'visible';
                        captureElement.style.display = 'flex';
                        captureElement.style.zIndex = '-1000';

                        // Wait for fonts & any inline data-URL images
                        await document.fonts.ready;
                        const captureImgs = Array.from(captureElement.querySelectorAll('img'));
                        await Promise.all(
                            captureImgs.map((img) =>
                                typeof img.decode === 'function' ? img.decode().catch(() => {}) : Promise.resolve()
                            )
                        );
                        if (!instantShareMode) {
                            await new Promise(r => setTimeout(r, 40));
                        }

                        const targetW = 1890;
                        const targetH = 3360;
                        const canvas = await safeHtml2Canvas(captureElement, {
                            scale: 1.75, // High-DPI 1890x3360 (safely under 4096px GPU limits)
                            backgroundColor: null,
                            useCORS: true,
                            logging: false,
                            imageTimeout: 15000,
                            removeContainer: true
                        });
                        
                        // Guarantee crisp 9:16 high-DPI dimensions for story/status format
                        let finalCanvas = canvas;
                        if (canvas.width !== targetW || canvas.height !== targetH) {
                            const resized = document.createElement('canvas');
                            resized.width = targetW;
                            resized.height = targetH;
                            const rCtx = resized.getContext('2d')!;
                            rCtx.imageSmoothingEnabled = true;
                            rCtx.imageSmoothingQuality = 'high';
                            rCtx.drawImage(canvas, 0, 0, targetW, targetH);
                            finalCanvas = resized;
                        }
                        
                        const dataUrl = encodeHighResCompactImage(finalCanvas, 420 * 1024, 0.88, 0.68);
                        captureElement.style.cssText = originalStyle;

                        if (dataUrl && dataUrl !== 'data:,') {
                            capturedImages.push({ dataUrl, chunk: targetChunks[i] });
                        }
                    }

                    if (capturedImages.length === 0) {
                        throw new Error('Failed to generate image data');
                    }

                    const dataUrlToBlob = (url: string): Blob => {
                        const parts = url.split(',');
                        const mimeMatch = parts[0].match(/:(.*?);/);
                        const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
                        const binary = atob(parts[1] || '');
                        const bytes = new Uint8Array(binary.length);
                        for (let idx = 0; idx < binary.length; idx++) {
                            bytes[idx] = binary.charCodeAt(idx);
                        }
                        return new Blob([bytes], { type: mime });
                    };

                    const downloadCapturedImages = async () => {
                        for (let i = 0; i < capturedImages.length; i++) {
                            const link = document.createElement('a');
                            link.download = `quran_page_${capturedImages[i].chunk.mushafPage}_part_${i + 1}_${Date.now()}.jpg`;
                            link.href = capturedImages[i].dataUrl;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            if (capturedImages.length > 1) {
                                await new Promise(r => setTimeout(r, 150));
                            }
                        }
                        showToast?.(
                            capturedImages.length > 1
                                ? `تم حفظ ${toArabic(capturedImages.length)} صور بنجاح`
                                : isPageShare
                                ? (isEn ? 'Page card saved successfully' : 'تم حفظ بطاقة الصفحة للمشاركة')
                                : (isEn ? 'Ayah card saved successfully' : 'تم حفظ بطاقة الآية للمشاركة')
                        );
                    };

                    if (Capacitor.isNativePlatform()) {
                        const fileUris: string[] = [];
                        for (let i = 0; i < capturedImages.length; i++) {
                            const fileName = `quran_page_${capturedImages[i].chunk.mushafPage}_part${i + 1}_${Date.now()}.jpg`;
                            const base64Data = capturedImages[i].dataUrl.split(',')[1];
                            const savedFile = await Filesystem.writeFile({
                                path: fileName,
                                data: base64Data,
                                directory: Directory.Cache,
                            });
                            fileUris.push(savedFile.uri);
                        }
                        
                        if (fileUris.length > 1) {
                            await Share.share({
                                title: isPageShare ? 'مشاركة صفحة' : 'مشاركة آيات قرآنية',
                                text: shareText,
                                files: fileUris,
                                dialogTitle: 'مشاركة الصور عبر'
                            });
                        } else {
                            await Share.share({
                                title: isPageShare ? 'مشاركة صفحة' : 'مشاركة آية',
                                text: shareText,
                                url: fileUris[0],
                                dialogTitle: 'مشاركة عبر'
                            });
                        }
                    } else if (navigator.share) {
                        try {
                            const files: File[] = capturedImages.map((item, i) => {
                                const blob = dataUrlToBlob(item.dataUrl);
                                return new File([blob], `quran_page_${item.chunk.mushafPage}_part_${i + 1}.jpg`, { type: 'image/jpeg' });
                            });
                            
                            if (navigator.canShare && navigator.canShare({ files })) {
                                await navigator.share({
                                    title: isPageShare ? 'مشاركة صفحة' : 'مشاركة آيات قرآنية',
                                    text: shareText,
                                    files: files,
                                });
                            } else {
                                await downloadCapturedImages();
                            }
                        } catch (e: any) {
                            const errorMsg = e?.message || String(e);
                            if (e?.name === 'AbortError' || errorMsg.includes('Share canceled') || errorMsg.includes('canceled')) {
                                console.log('Image share interaction finished');
                            } else {
                                console.warn('Browser share unavailable or blocked, falling back to image download:', e);
                                await downloadCapturedImages();
                            }
                        }
                    } else {
                        await downloadCapturedImages();
                    }
                } catch (e: any) {
                    const errorMsg = e?.message || String(e);
                    if (e.name === 'AbortError' || errorMsg.includes('Share canceled') || errorMsg.includes('canceled')) {
                        console.log('Image share interaction cancelled or failed');
                    } else {
                        console.error('Error sharing image:', e);
                        showToast?.("حدث خطأ أثناء إنشاء الصورة. حاول مرة أخرى");
                    }
                }
            } else if (shareType === 'audio') {
                let reader = propSettings?.reader || appSettings?.reader || 'Alafasy_128kbps';
                // Map some common IDs if they come in different formats
                const readerMap: Record<string, string> = {
                    'ar.alafasy': 'Alafasy_128kbps',
                    'ar.abdulbasitmurattal': 'Abdul_Basit_Murattal_192kbps',
                    'ar.abdulbasitmujawwad': 'Abdul_Basit_Mujawwad_128kbps',
                    'ar.abdullahbasfar': 'Abdullah_Basfar_192kbps',
                    'ar.abdurrahmaansudais': 'Abdurrahmaan_As-Sudais_192kbps',
                    'ar.hudhaify': 'Hudhaify_128kbps',
                    'ar.minshawi': 'Minshawy_Murattal_128kbps',
                    'ar.minshawimujawwad': 'Minshawy_Mujawwad_64kbps',
                    'ar.husary': 'Husary_128kbps',
                    'ar.mahermuaiqly': 'MaherAlMuaiqly128kbps',
                    // RECITERS mappings (mp3quran.net to everyayah.com)
                    'https://server11.mp3quran.net/shatri': 'Abu_Bakr_Ash-Shaatree_128kbps',
                    'https://server10.mp3quran.net/ajm': 'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net',
                    'https://server6.mp3quran.net/akdr': 'Ibrahim_Akhdar_32kbps',
                    'https://server6.mp3quran.net/kurdi': 'Raad_Al_Kurdi_128kbps',
                    'https://server7.mp3quran.net/s_gmd': 'Ghamadi_40kbps',
                    'https://server7.mp3quran.net/shur': 'Saood_ash-Shuraym_128kbps',
                    'https://server6.mp3quran.net/shl': 'Sahl_Yassin_128kbps',
                    'https://server8.mp3quran.net/bu_khtr': 'Salaah_AbdulRahman_Bukhatir_128kbps',
                    'https://server8.mp3quran.net/basit': 'Abdul_Basit_Murattal_192kbps',
                    'https://server11.mp3quran.net/sds': 'Abdurrahmaan_As-Sudais_192kbps',
                    'https://server12.mp3quran.net/kyat': 'Abdullah_Khayat_128kbps',
                    'https://server8.mp3quran.net/mtrod': 'Abdullah_Matroud_128kbps',
                    'https://server9.mp3quran.net/hthfi': 'Hudhaify_128kbps',
                    'https://server8.mp3quran.net/frs_a': 'Fares_Abbad_64kbps',
                    'https://server12.mp3quran.net/maher': 'MaherAlMuaiqly128kbps',
                    'https://server10.mp3quran.net/minsh': 'Minshawy_Murattal_128kbps',
                    'https://server12.mp3quran.net/tblawi': 'Mohammad_al_Tablaway_128kbps',
                    'https://server13.mp3quran.net/husr': 'Husary_128kbps',
                    'https://server8.mp3quran.net/bna': 'Mahmoud_Ali_Al_Banna_32kbps',
                    'https://server8.mp3quran.net/afs': 'Alafasy_128kbps',
                    'https://server8.mp3quran.net/mustafa': 'Mustafa_Ismail_48kbps',
                    'https://server6.mp3quran.net/qtm': 'Nasser_Alqatami_128kbps',
                    'https://server11.mp3quran.net/yasser': 'Yasser_Ad-Dussary_128kbps'
                };
                const audioReader = readerMap[reader] || reader;
                
                // Ensure we have the latest selected ayahs
                const start = Math.min(fromAyah, toAyah);
                const end = Math.max(fromAyah, toAyah);
                const ayahsToShare = [];
                for (let a = start; a <= end; a++) {
                    ayahsToShare.push({ s: currentAyah.s, a });
                }

                // Custom file name formatted exactly: سورة [اسم السورة] الايه01 أو سورة [اسم السورة] الايه من 01 الى 20
                const surahName = getSurahName(currentAyah.s);
                const fromStr = String(start).padStart(2, '0');
                const toStr = String(end).padStart(2, '0');
                const fileName = start === end 
                    ? `سورة ${surahName} الايه${fromStr}.mp3` 
                    : `سورة ${surahName} الايه من ${fromStr} الى ${toStr}.mp3`;

                try {
                        // Helper to strip ID3v2, ID3v1 tags, and neutralize Xing/Info headers
                        const cleanAudioBuffer = (buffer: ArrayBuffer) => {
                            let uint8 = new Uint8Array(buffer);
                            let startOffset = 0;
                            let endOffset = uint8.length;

                            // Strip ID3v2 (at the beginning)
                            if (uint8.length > 10 && uint8[0] === 0x49 && uint8[1] === 0x44 && uint8[2] === 0x33) { // "ID3"
                                // The size is encoded as syncsafe integer
                                const size = (uint8[6] << 21) | (uint8[7] << 14) | (uint8[8] << 7) | uint8[9];
                                startOffset = size + 10;
                            }

                            // Strip ID3v1 (at the end - 128 bytes starting with "TAG")
                            if (uint8.length > 128) {
                                const tagOffset = uint8.length - 128;
                                if (uint8[tagOffset] === 0x54 && uint8[tagOffset + 1] === 0x41 && uint8[tagOffset + 2] === 0x47) { // "TAG"
                                    endOffset = tagOffset;
                                }
                            }

                            // Only slice if offsets are valid
                            if (startOffset > 0 || endOffset < uint8.length) {
                                if (startOffset >= endOffset) return buffer;
                                return buffer.slice(startOffset, endOffset);
                            }
                            return buffer;
                        };

                    // Fetch ayahs sequentially to prevent memory/network crash
                    const buffers: ArrayBuffer[] = [];
                    
                    if (Capacitor.isNativePlatform()) {
                        let isFirst = true;
                        for (const ay of ayahsToShare) {
                            const sStr = String(ay.s).padStart(3, '0');
                            const aStr = String(ay.a).padStart(3, '0');
                            let audioUrl = `https://everyayah.com/data/${audioReader}/${sStr}${aStr}.mp3`;
                            if (/^[a-z]{2,3}\./.test(audioReader)) {
                                const globalAyahNum = quranData?.surahs[ay.s - 1]?.ayahs[ay.a - 1]?.number;
                                if (globalAyahNum) {
                                    audioUrl = `https://cdn.islamic.network/quran/audio/128/${audioReader}/${globalAyahNum}.mp3`;
                                }
                            }
                            
                            const res = await fetch(audioUrl);
                            if (!res.ok) throw new Error(`Failed to fetch audio for ayah ${ay.a}`);
                            const buffer = await res.arrayBuffer();
                            const cleanedBuffer = cleanAudioBuffer(buffer);
                            
                            const base64Data = await blobToBase64(new Blob([cleanedBuffer]));
                            const dataToWrite = base64Data.split(',')[1];
                            
                            if (isFirst) {
                                await Filesystem.writeFile({
                                    path: fileName,
                                    data: dataToWrite,
                                    directory: Directory.Cache,
                                });
                                isFirst = false;
                            } else {
                                await Filesystem.appendFile({
                                    path: fileName,
                                    data: dataToWrite,
                                    directory: Directory.Cache,
                                });
                            }
                        }
                        
                        const savedFile = await Filesystem.getUri({
                            path: fileName,
                            directory: Directory.Cache,
                        });
                        
                        await Share.share({
                            title: 'مشاركة تلاوة',
                            text: shareText,
                            url: savedFile.uri,
                            dialogTitle: 'مشاركة عبر'
                        });
                    } else {
                        // Web fallback
                        for (const ay of ayahsToShare) {
                            const sStr = String(ay.s).padStart(3, '0');
                            const aStr = String(ay.a).padStart(3, '0');
                            let audioUrl = `https://everyayah.com/data/${audioReader}/${sStr}${aStr}.mp3`;
                            if (/^[a-z]{2,3}\./.test(audioReader)) {
                                const globalAyahNum = quranData?.surahs[ay.s - 1]?.ayahs[ay.a - 1]?.number;
                                if (globalAyahNum) {
                                    audioUrl = `https://cdn.islamic.network/quran/audio/128/${audioReader}/${globalAyahNum}.mp3`;
                                }
                            }
                            
                            const res = await fetch(audioUrl);
                            if (!res.ok) throw new Error(`Failed to fetch audio for ayah ${ay.a}`);
                            const buffer = await res.arrayBuffer();
                            buffers.push(cleanAudioBuffer(buffer));
                        }
                        
                        const combinedBlob = new Blob(buffers, { type: 'audio/mpeg' });
                        const file = new File([combinedBlob], fileName, { type: 'audio/mpeg' });
                        if (navigator.canShare && navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                title: 'مشاركة تلاوة',
                                text: shareText,
                                files: [file],
                            });
                        } else {
                            const link = document.createElement('a');
                            link.download = fileName;
                            link.href = URL.createObjectURL(combinedBlob);
                            link.click();
                        }
                    }
                } catch (e: any) {
                    const errorMsg = e?.message || String(e);
                    if (e.name === 'AbortError' || errorMsg.includes('Share canceled') || errorMsg.includes('canceled')) {
                        console.log('Share canceled by user');
                    } else {
                        console.error('Error sharing audio file:', e);
                        showToast?.("حدث خطأ أثناء تحميل الملفات الصوتية");
                    }
                }
            }
        } catch (error) {
            console.error('Error sharing:', error);
        } finally {
            setIsSharing(false);
        }
    };
    handleShareRef.current = handleShare;

    const handleCopy = async () => {
        if (isCopying) return;
        setIsCopying(true);
        const shareText = `${surahInfo}\nآيات من القرآن الكريم . بواسطة : مصحف أحمد و ليلى`;
        const fullText = `${combinedText}\n\n${combinedExplanation ? combinedExplanation + '\n\n' : ''}${shareText}`;
        
        try {
            await navigator.clipboard.writeText(fullText);
            setIsCopiedFeedback(true);
            setTimeout(() => setIsCopiedFeedback(false), 1600);
            showToast?.("تم نسخ نص الآيات بنجاح إلى الحافظة");
        } catch (err) {
            console.error('Failed to copy text: ', err);
            showToast?.("فشل نسخ النص");
        } finally {
            setIsCopying(false);
        }
    };

    // Removed redundant calculation

    const hiddenCaptureNodes = (
        <>
            {/* Hidden capture elements for High Quality Image & Page Share (Exact 1080x1920 Story format) */}
            <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', pointerEvents: 'none' }} aria-hidden="true">
                {pageChunks.map((chunk, chunkIdx) => {
                    const chunkTypo = getChunkTypography(chunk.totalChars, userRatio);
                    const isShort = chunk.totalChars < 280;
                    const chunkExplanation = chunk.ayahs.map(ay => getExplanationText(ay.s, ay.a)).filter(t => t).join('\n');
                    const firstChunkAyah = chunk.ayahs[0];
                    const hasMultipleSurahsInChunk = chunk.ayahs.some((ay, idx) => idx > 0 && ay.s !== firstChunkAyah?.s);
                    const showTopBismillah =
                        showBismillah &&
                        readingMode === 'mushaf' &&
                        !(firstChunkAyah?.s === 9 && firstChunkAyah?.a === 1);
                    const showTopSurahLabel =
                        shareType === 'page' &&
                        hasMultipleSurahsInChunk &&
                        firstChunkAyah?.a === 1;
                    return (
                        <div 
                            key={`capture-chunk-${chunkIdx}`}
                            id={chunkIdx === 0 ? "hidden-image-capture" : `hidden-image-capture-${chunkIdx}`}
                            ref={chunkIdx === 0 ? hiddenImageCaptureRef : (el) => { hiddenCapturePagesRef.current[chunkIdx] = el; }}
                            style={{
                                position: 'relative',
                                width: '1080px',
                                height: '1920px',
                                minHeight: '1920px',
                                maxHeight: '1920px',
                                boxSizing: 'border-box',
                                borderRadius: selectedBg.type === 'share_design' ? '0px' : '36px',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding:
                                    selectedBg.type === 'share_design'
                                        ? selectedFrame.id !== 'none'
                                            ? '164px 128px 162px 128px'
                                            : '152px 118px 150px 118px'
                                        : selectedFrame.id !== 'none'
                                        ? '92px 110px 116px 110px'
                                        : '68px 64px 56px 64px',
                                textAlign: 'center',
                                backgroundColor: selectedBg.type === 'solid' ? selectedBg.value : undefined,
                                backgroundImage: selectedBg.type !== 'solid' ? selectedBg.value : undefined,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                border: selectedBg.type === 'share_design' ? 'none' : `12px solid ${selectedBg.border}`,
                                direction: isEn ? 'ltr' : 'rtl'
                            }}
                        >
                            {selectedBg.type === 'share_design' && shareDesignAssets?.exportBackdropUrl ? (
                                <img
                                    src={shareDesignAssets.exportBackdropUrl}
                                    alt=""
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'fill',
                                        pointerEvents: 'none',
                                        zIndex: 0
                                    }}
                                />
                            ) : (
                                selectedBg.id !== 'bg_white' &&
                                !selectedBg.isLight && (
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: selectedBg.overlay || 'rgba(0, 0, 0, 0.22)' }}></div>
                                )
                            )}
                            <FrameOverlay frame={selectedFrame} scale={4} />
                            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: '100%', flex: 1, boxSizing: 'border-box' }}>
                                {/* Top Bismillah Header */}
                                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '8px' }}>
                                    {showTopSurahLabel && (
                                        <p
                                            style={{
                                                fontFamily: 'var(--font-amiri-quran), var(--font-hafs), serif',
                                                fontSize: `${Math.round(chunkTypo.bismillahSize * 0.92)}px`,
                                                color: selectedBg.accent,
                                                margin: '0 0 4px 0',
                                                textShadow: (selectedBg.id === 'bg_white' || selectedBg.isLight) ? 'none' : '0 4px 10px rgba(0,0,0,0.45)',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            سُورَةُ {getSurahName(firstChunkAyah.s)}
                                        </p>
                                    )}
                                    {showTopBismillah && (
                                        <p 
                                            style={{ 
                                                fontFamily: 'var(--font-amiri-quran), var(--font-hafs), serif', 
                                                fontSize: `${chunkTypo.bismillahSize}px`, 
                                                color: selectedBg.accent, 
                                                margin: 0,
                                                textShadow: (selectedBg.id === 'bg_white' || selectedBg.isLight) ? 'none' : '0 6px 12px rgba(0,0,0,0.5)',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                                        </p>
                                    )}
                                    {isShort && (
                                        selectedBg.type === 'share_design' && shareDesignAssets?.upperMotifUrl ? (
                                            <img
                                                src={shareDesignAssets.upperMotifUrl}
                                                alt=""
                                                style={{
                                                    width: '580px',
                                                    height: '128px',
                                                    objectFit: 'contain',
                                                    pointerEvents: 'none',
                                                    margin: '8px 0'
                                                }}
                                            />
                                        ) : (
                                            <IslamicFlourish color={selectedBg.accent} scale={2} />
                                        )
                                    )}
                                </div>

                                {/* Middle Verse & Explanation auto-centered & adaptively sized to fill full page */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', padding: selectedFrame.id !== 'none' ? '12px 28px' : '12px 0', minHeight: 0, boxSizing: 'border-box' }}>
                                    <p 
                                        className="share-preview-text"
                                        style={{ 
                                            lineHeight: chunkTypo.lineHeight,
                                            fontFamily: selectedFont,
                                            fontSize: `${chunkTypo.ayahFontSize}px`, 
                                            color: textColor,
                                            textShadow: (selectedBg.id === 'bg_white' || selectedBg.isLight) ? 'none' : '0 6px 14px rgba(0,0,0,0.55)',
                                            margin: 0,
                                            fontWeight: 'bold',
                                            whiteSpace: 'normal',
                                            letterSpacing: 0,
                                            wordBreak: 'keep-all',
                                            fontFeatureSettings: '"kern", "liga", "clig", "calt", "ccmp"',
                                            textRendering: 'optimizeLegibility',
                                            textAlign: 'center',
                                            width: '100%',
                                            padding: selectedFrame.id !== 'none' ? '0 20px' : '0',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        {chunk.ayahs.map((ay, idx) => {
                                            const isNewMidChunkSurah = idx > 0 && ay.a === 1;
                                            return (
                                                <React.Fragment key={`${ay.s}-${ay.a}-${idx}`}>
                                                    {isNewMidChunkSurah && (
                                                        <>
                                                            <span
                                                                style={{
                                                                    display: 'block',
                                                                    fontFamily: 'var(--font-amiri-quran), var(--font-hafs), serif',
                                                                    fontSize: `${Math.round(chunkTypo.bismillahSize * 0.9)}px`,
                                                                    color: selectedBg.accent,
                                                                    marginTop: '14px',
                                                                    marginBottom: '2px',
                                                                    lineHeight: 1.4,
                                                                    fontWeight: 'bold',
                                                                    textShadow: (selectedBg.id === 'bg_white' || selectedBg.isLight) ? 'none' : '0 4px 10px rgba(0,0,0,0.45)',
                                                                }}
                                                            >
                                                                سُورَةُ {getSurahName(ay.s)}
                                                            </span>
                                                            {showBismillah && ay.s !== 9 && (
                                                                <span
                                                                    style={{
                                                                        display: 'block',
                                                                        fontFamily: 'var(--font-amiri-quran), var(--font-hafs), serif',
                                                                        fontSize: `${Math.round(chunkTypo.bismillahSize * 0.88)}px`,
                                                                        color: selectedBg.accent,
                                                                        marginBottom: '8px',
                                                                        lineHeight: 1.4,
                                                                        fontWeight: 'bold',
                                                                        textShadow: (selectedBg.id === 'bg_white' || selectedBg.isLight) ? 'none' : '0 4px 10px rgba(0,0,0,0.45)',
                                                                    }}
                                                                >
                                                                    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                    <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: renderTajweedTextHtml(getAyahText(ay.s, ay.a, false)) }} />
                                                    {` ﴿${toArabic(ay.a)}﴾ `}
                                                </React.Fragment>
                                            );
                                        })}
                                    </p>
                                    {chunkExplanation && (
                                        <p style={{
                                            fontFamily: 'var(--font-cairo), sans-serif',
                                            fontSize: `${chunkTypo.explanationFontSize}px`,
                                            color: textColor,
                                            opacity: 0.92,
                                            marginTop: '28px',
                                            textAlign: 'center',
                                            lineHeight: '1.65',
                                            textShadow: (selectedBg.id === 'bg_white' || selectedBg.isLight) ? 'none' : '0 4px 8px rgba(0,0,0,0.5)',
                                            maxWidth: '94%'
                                        }}>
                                            {chunkExplanation}
                                        </p>
                                    )}
                                    {isShort && (
                                        selectedBg.type === 'share_design' && shareDesignAssets?.lowerMotifUrl ? (
                                            <img
                                                src={shareDesignAssets.lowerMotifUrl}
                                                alt=""
                                                style={{
                                                    width: '580px',
                                                    height: '128px',
                                                    objectFit: 'contain',
                                                    pointerEvents: 'none',
                                                    margin: '10px 0'
                                                }}
                                            />
                                        ) : (
                                            <IslamicFlourish color={selectedBg.accent} scale={2} />
                                        )
                                    )}
                                </div>

                                {/* Bottom Metadata & Footer */}
                                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingBottom: customText ? (selectedFrame.id !== 'none' ? '20px' : '16px') : (selectedFrame.id !== 'none' ? '12px' : '8px'), gap: customText ? '10px' : '14px', boxSizing: 'border-box' }}>
                                    <p style={{ fontFamily: selectedFont, color: textColor, textShadow: (selectedBg.id === 'bg_white' || selectedBg.isLight) ? 'none' : '0 3px 6px rgba(0,0,0,0.5)', fontSize: '38px', fontWeight: 'bold', opacity: 0.96, textAlign: 'center', margin: 0, lineHeight: 1.35 }}>
                                        {chunk.surahInfoText}
                                    </p>
                                    <div style={{ width: '60%', borderTop: `2px solid ${selectedBg.dividerColor || (selectedBg.isLight ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.35)')}` }}></div>
                                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                        <a 
                                            href="https://play.google.com/store/apps/details?id=com.mushaf.ahmedandlayla"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ fontFamily: 'var(--font-lateef), serif', color: selectedBg.brandColor || selectedBg.accent, textShadow: (selectedBg.id === 'bg_white' || selectedBg.isLight) ? 'none' : '0 4px 10px rgba(0,0,0,0.85)', fontSize: '50px', fontWeight: 700, lineHeight: 1.25, textAlign: 'center', textDecoration: 'none' }} 
                                            dir={isEn ? 'ltr' : 'rtl'}
                                        >
                                            {isEn ? 'Mushaf Ahmed & Laila' : 'مصحف أحمد و ليلى'}
                                        </a>
                                        {customText ? (
                                            <span 
                                                style={{ fontFamily: selectedFont, color: textColor, textShadow: (selectedBg.id === 'bg_white' || selectedBg.isLight) ? 'none' : '0 3px 6px rgba(0,0,0,0.5)', fontSize: '48px', fontWeight: 600, maxWidth: '82%', textAlign: 'center', lineHeight: 1.25, opacity: 0.94, overflowWrap: 'anywhere', wordBreak: 'break-word' }} 
                                            >
                                                {customText}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );

    if (instantShareMode) {
        return hiddenCaptureNodes;
    }

    return (
        <>
            {hiddenCaptureNodes}
            <div
                ref={modalBackdropRef}
                className="fixed inset-0 z-[1200] bg-black/55 flex items-center justify-center overflow-clip"
                dir="rtl"
                onClick={onClose}
            >

            {(() => {
                const isDark = isDarkQuranTheme(currentTheme);
                const isDeepBlack = currentTheme?.id === 'deep_black';
                const rawAccent = isDeepBlack ? '#D97706' : (currentTheme?.accent || '#D97706');
                const accentBg = currentTheme?.id === 'gold' ? '#D97706' : rawAccent;
                const accentLip = isDark ? '#050507' : 'rgba(15, 23, 42, 0.28)';
                const accentText = isDeepBlack ? '#000000' : '#FFFFFF';
                const studioBg = isDark ? (currentTheme?.bg || '#09090B') : '#F8FAFC';
                const surfaceBg = isDark ? (currentTheme?.cardBg || '#141418') : '#FFFFFF';
                const trackBg = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)';
                const dividerColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.07)';
                const textPrimary = isDark ? '#FFFFFF' : '#0F172A';
                const textMuted = isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(15, 23, 42, 0.58)';

                const tactileNeutralShadow = isDark
                    ? '0 3.5px 0 #050507, 0 8px 16px rgba(0,0,0,0.65), inset 0 1.5px 1px rgba(255,255,255,0.16), inset 0 -1.5px 2px rgba(0,0,0,0.45)'
                    : '0 3.5px 0 rgba(148,163,184,0.34), 0 8px 16px -3px rgba(15,23,42,0.09), inset 0 1.5px 1px rgba(255,255,255,0.95), inset 0 -1.5px 2px rgba(15,23,42,0.04)';

                const tactileActiveShadow = isDark
                    ? `0 4px 0 #050507, 0 10px 20px rgba(0,0,0,0.75), inset 0 1.5px 1.5px rgba(255,255,255,0.35), inset 0 -2px 3px rgba(0,0,0,0.3)`
                    : `0 4px 0 ${accentLip}, 0 10px 20px -3px ${accentBg}48, inset 0 1.5px 1.5px rgba(255,255,255,0.38), inset 0 -2px 3px rgba(0,0,0,0.2)`;

                const tactileInsetShadow = isDark
                    ? 'inset 0 2px 5px rgba(0,0,0,0.68), inset 0 -1px 1px rgba(255,255,255,0.08)'
                    : 'inset 0 2px 5px rgba(15,23,42,0.12), inset 0 -1px 1px rgba(255,255,255,0.85)';

                const tactileCardShadow = isDark
                    ? '0 6px 0 #050507, 0 22px 44px rgba(0,0,0,0.78), inset 0 1.5px 1px rgba(255,255,255,0.14), inset 0 -2px 3px rgba(0,0,0,0.45)'
                    : '0 6px 0 rgba(148,163,184,0.32), 0 22px 44px -8px rgba(15,23,42,0.16), inset 0 1.5px 1px rgba(255,255,255,0.95), inset 0 -2px 3px rgba(15,23,42,0.05)';

                // 9:16 WYSIWYG Artboard sizing (side mini-cards hidden; side rails shown only when typography controls are active)
                const totalDesigns = SHARE_DESIGN_BGS.length;
                const currentDesignIndex = Math.max(0, SHARE_DESIGN_BGS.findIndex((bg) => bg.id === selectedBg.id));
                const leftDesignIndex = (currentDesignIndex - 1 + totalDesigns) % totalDesigns;
                const rightDesignIndex = (currentDesignIndex + 1) % totalDesigns;
                const leftBg = SHARE_DESIGN_BGS[leftDesignIndex];
                const rightBg = SHARE_DESIGN_BGS[rightDesignIndex];

                const hasMultiImagePager = (shareType === 'image' || shareType === 'page') && pageChunks.length > 1;
                const pagerHeight = hasMultiImagePager ? 44 : 0;

                const stageW = Math.max(260, stageSize.w);
                const stageH = Math.max(180, stageSize.h);

                const isWideStage = stageW >= 560;
                const showSideTypographyRails =
                    studioGroup === 'typography' && (shareType === 'image' || shareType === 'page');
                const railW = showSideTypographyRails
                    ? Math.max(50, Math.min(62, Math.floor(stageW * 0.165)))
                    : 0;

                const horizontalSideSpace = showSideTypographyRails
                    ? (railW * 2) + (isWideStage ? 28 : 16)
                    : (isWideStage ? 24 : 16);
                const maxCenterW = Math.max(140, stageW - horizontalSideSpace);
                const maxCenterH = Math.max(120, stageH - pagerHeight - 4);
                const sideColumnH = maxCenterH;

                const artboardW = 360;
                const artboardH = 640;
                const fitScale = Math.min(maxCenterW / artboardW, maxCenterH / artboardH, 1.05);
                const scaledW = Math.round(artboardW * fitScale);
                const scaledH = Math.round(artboardH * fitScale);

                const rangeSummaryLabel = shareType === 'page'
                    ? `${getSurahName(currentAyah.s)} · ${isEn ? `Page ${pageNum}` : `صفحة ${toArabic(pageNum)}`}`
                    : `${getSurahName(currentAyah.s)} · ${fromAyah === toAyah
                        ? (isEn ? `Ayah ${fromAyah}` : `آية ${toArabic(fromAyah)}`)
                        : (isEn ? `Ayah ${fromAyah}-${toAyah}` : `آيات ${toArabic(fromAyah)} – ${toArabic(toAyah)}`)}`;

                const shareModeOptions: { id: 'image' | 'text' | 'page' | 'audio'; label: string }[] = [
                    { id: 'image', label: isEn ? 'Image' : 'صورة' },
                    { id: 'text', label: isEn ? 'Text' : 'نص' },
                    { id: 'page', label: isEn ? 'Page' : 'صفحة' },
                    { id: 'audio', label: isEn ? 'Audio' : 'صوت' },
                ];

                const primaryShareLabel =
                    shareType === 'image' ? (isEn ? 'Share Image' : 'مشاركة الصورة') :
                    shareType === 'text' ? (isEn ? 'Share Text' : 'مشاركة النص') :
                    shareType === 'page' ? (isEn ? 'Share Page' : 'مشاركة الصفحة') :
                    (isEn ? 'Share Audio' : 'مشاركة التلاوة');

                const renderCustomizationPanelBody = () => {
                    // Typography + Text Color + Optional Caption merged cleanly
                    return (
                        <div className="space-y-2.5">
                            {/* Font Family Row */}
                            <div>
                                <div className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 hide-scrollbar">
                                    {SHARE_FONTS.map((font) => {
                                        const isSelected = selectedFont === font.id;
                                        return (
                                            <button
                                                key={font.id}
                                                type="button"
                                                onClick={() => setSelectedFont(font.id)}
                                                className="px-3 py-2 rounded-xl shrink-0 border-0 transition-transform active:scale-95 text-xs font-bold cursor-pointer whitespace-nowrap"
                                                style={{
                                                    fontFamily: 'var(--font-ui)',
                                                    backgroundColor: isSelected ? accentBg : surfaceBg,
                                                    color: isSelected ? accentText : textPrimary,
                                                    boxShadow: isSelected ? tactileActiveShadow : tactileNeutralShadow,
                                                }}
                                            >
                                                {font.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Size Stepper + Color Swatches Row */}
                            <div className="flex items-center gap-2.5">
                                <div
                                    className="flex items-center gap-1.5 p-1.5 rounded-xl shrink-0"
                                    style={{ backgroundColor: trackBg, boxShadow: tactileInsetShadow }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setFontSize((prev) => Math.max(12, prev - 2))}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center border-0 cursor-pointer active:translate-y-0.5 active:scale-95 transition-all"
                                        style={{ backgroundColor: surfaceBg, color: textPrimary, boxShadow: tactileNeutralShadow }}
                                        title={isEn ? 'Decrease font size' : 'تصغير الخط'}
                                    >
                                        <Minus size={14} strokeWidth={2.5} />
                                    </button>
                                    <span className="text-xs font-black min-w-[28px] text-center tabular-nums" style={{ color: textPrimary }}>
                                        {fontSize}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setFontSize((prev) => Math.min(48, prev + 2))}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center border-0 cursor-pointer active:translate-y-0.5 active:scale-95 transition-all"
                                        style={{ backgroundColor: surfaceBg, color: textPrimary, boxShadow: tactileNeutralShadow }}
                                        title={isEn ? 'Increase font size' : 'تكبير الخط'}
                                    >
                                        <Plus size={14} strokeWidth={2.5} />
                                    </button>
                                </div>

                                <div
                                    className="flex-1 flex items-center gap-2 overflow-x-auto px-2.5 py-2 rounded-xl hide-scrollbar"
                                    style={{ backgroundColor: trackBg, boxShadow: tactileInsetShadow }}
                                >
                                    {TEXT_COLORS.map((color) => {
                                        const isSelected = textColor === color;
                                        return (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setTextColor(color)}
                                                className={`w-6 h-6 rounded-full shrink-0 cursor-pointer transition-transform active:scale-90 ${
                                                    isSelected ? 'scale-120' : 'opacity-90 hover:opacity-100'
                                                }`}
                                                style={{
                                                    backgroundColor: color,
                                                    border: isSelected ? `2.5px solid ${accentBg}` : '1.5px solid rgba(148,163,184,0.45)',
                                                    boxShadow: isSelected
                                                        ? `0 0 0 2px ${surfaceBg}, 0 3px 8px rgba(0,0,0,0.24)`
                                                        : 'inset 0 1.5px 2px rgba(255,255,255,0.4), inset 0 -1.5px 2px rgba(0,0,0,0.2), 0 2.5px 5px rgba(0,0,0,0.18)',
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Optional Custom Caption Input + Bismillah Toggle */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={customText}
                                    onChange={(e) => setCustomText(e.target.value)}
                                    placeholder={isEn ? 'Optional note / caption...' : 'نص إضافي يظهر أسفل البطاقة (اختياري)...'}
                                    className="flex-1 min-w-0 px-3 py-2.5 text-xs font-semibold rounded-xl outline-none transition-all border-0"
                                    style={{
                                        backgroundColor: trackBg,
                                        color: textPrimary,
                                        boxShadow: tactileInsetShadow,
                                    }}
                                    maxLength={50}
                                    dir={isEn ? 'ltr' : 'rtl'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowBismillah((prev) => !prev)}
                                    className="px-3 py-2.5 rounded-xl text-xs font-extrabold shrink-0 border-0 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                                    style={{
                                        backgroundColor: showBismillah ? accentBg : surfaceBg,
                                        color: showBismillah ? accentText : textMuted,
                                        boxShadow: showBismillah ? tactileActiveShadow : tactileNeutralShadow,
                                    }}
                                    title={isEn ? (showBismillah ? 'Hide Bismillah' : 'Show Bismillah') : (showBismillah ? 'إخفاء البسملة من التصميم' : 'إظهار البسملة في التصميم')}
                                    aria-pressed={showBismillah}
                                >
                                    {isEn ? 'Bismillah' : 'البسملة'}
                                </button>
                            </div>
                        </div>
                    );
                };

                const renderPrimaryShareCTA = (compactDesktop?: boolean) => (
                    <div className={`flex items-center justify-center gap-2 mx-auto ${compactDesktop ? 'w-full' : 'w-full'}`}>
                        {(shareType === 'image' || shareType === 'page') && pageChunks.length > 1 ? (
                            <div className="flex items-center justify-center gap-2 w-full max-w-[380px] mx-auto">
                                <button
                                    type="button"
                                    onClick={() => handleShare('current')}
                                    disabled={isSharing}
                                    className="flex-1 py-2 px-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center transition-all active:translate-y-0.5 disabled:opacity-70 border-0 cursor-pointer whitespace-nowrap"
                                    style={{
                                        backgroundColor: surfaceBg,
                                        color: textPrimary,
                                        boxShadow: tactileNeutralShadow,
                                    }}
                                    title="مشاركة الصورة المعروضة حالياً فقط"
                                >
                                    {isSharing ? (
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <span>{isEn ? `Current (${safePageIndex + 1})` : `مشاركة الحالية (${toArabic(safePageIndex + 1)})`}</span>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleShare('all')}
                                    disabled={isSharing}
                                    className="flex-[1.15] py-2 px-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center transition-all active:translate-y-0.5 disabled:opacity-70 border-0 cursor-pointer whitespace-nowrap"
                                    style={{
                                        backgroundColor: accentBg,
                                        color: accentText,
                                        boxShadow: tactileActiveShadow,
                                    }}
                                    title={`مشاركة جميع الصور (${pageChunks.length})`}
                                >
                                    {isSharing ? (
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <span>{isEn ? `Share All (${pageChunks.length})` : `مشاركة الكل (${toArabic(pageChunks.length)})`}</span>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-[0.8] py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center transition-all active:translate-y-0.5 border-0 cursor-pointer whitespace-nowrap"
                                    style={{
                                        backgroundColor: surfaceBg,
                                        color: textPrimary,
                                        boxShadow: tactileNeutralShadow,
                                    }}
                                >
                                    <span>{isEn ? 'Cancel' : 'إلغاء'}</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2.5 w-full max-w-[330px] mx-auto">
                                <button
                                    type="button"
                                    onClick={() => handleShare('all')}
                                    disabled={isSharing}
                                    className="flex-[1.35] py-2 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center transition-all active:translate-y-0.5 disabled:opacity-70 border-0 cursor-pointer whitespace-nowrap"
                                    style={{
                                        backgroundColor: accentBg,
                                        color: accentText,
                                        boxShadow: tactileActiveShadow,
                                    }}
                                >
                                    {isSharing ? (
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <span>{primaryShareLabel}</span>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-2 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center transition-all active:translate-y-0.5 border-0 cursor-pointer whitespace-nowrap"
                                    style={{
                                        backgroundColor: surfaceBg,
                                        color: textPrimary,
                                        boxShadow: tactileNeutralShadow,
                                    }}
                                >
                                    <span>{isEn ? 'Cancel' : 'إلغاء'}</span>
                                </button>
                            </div>
                        )}
                    </div>
                );

                // Proportional 1/3 coordinates matching hidden 1080x1920 capture canvas 1:1
                const renderLiveImageArtboard = () => {
                    if (!currentPageChunk) return null;
                    const currentChunkTypo = getChunkTypography(currentPageChunk.totalChars, userRatio);
                    const previewAyahSize = Math.max(7, Math.round((currentChunkTypo.ayahFontSize / 3) * 10) / 10);
                    const previewBismillahSize = Math.max(8, Math.round((currentChunkTypo.bismillahSize / 3) * 10) / 10);
                    const previewExplanationSize = Math.max(7, Math.round((currentChunkTypo.explanationFontSize / 3) * 10) / 10);
                    const previewIsShort = currentPageChunk.totalChars < 280;
                    const previewExplanation = currentPageChunk.ayahs
                        .map((ay) => getExplanationText(ay.s, ay.a))
                        .filter((t) => t)
                        .join('\n');
                    const firstPreviewAyah = currentPageChunk.ayahs[0];
                    const hasMultiplePreviewSurahs = currentPageChunk.ayahs.some((ay, idx) => idx > 0 && ay.s !== firstPreviewAyah?.s);
                    const showPreviewTopBismillah =
                        showBismillah &&
                        readingMode === 'mushaf' &&
                        !(firstPreviewAyah?.s === 9 && firstPreviewAyah?.a === 1);
                    const showPreviewTopSurahLabel =
                        shareType === 'page' &&
                        hasMultiplePreviewSurahs &&
                        firstPreviewAyah?.a === 1;

                    // Pointer & touch swipe handlers for smoothly browsing designs
                    const handlePointerDown = (e: React.PointerEvent) => {
                        if (e.pointerType === 'mouse' && e.button !== 0) return;
                        isPointerDraggingRef.current = true;
                        dragStartXRef.current = e.clientX;
                        dragStartYRef.current = e.clientY;
                        draggedFarRef.current = false;
                        setDragOffset(0);
                    };

                    const handlePointerMove = (e: React.PointerEvent) => {
                        if (!isPointerDraggingRef.current) return;
                        const diffX = e.clientX - dragStartXRef.current;
                        const diffY = e.clientY - dragStartYRef.current;
                        if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
                            draggedFarRef.current = true;
                        }
                        if (Math.abs(diffX) > Math.abs(diffY)) {
                            setDragOffset(Math.max(-85, Math.min(85, diffX * 0.75)));
                        }
                    };

                    const handlePointerUp = (e: React.PointerEvent) => {
                        if (!isPointerDraggingRef.current) return;
                        isPointerDraggingRef.current = false;
                        const diffX = e.clientX - dragStartXRef.current;
                        const diffY = e.clientY - dragStartYRef.current;
                        if (Math.abs(diffX) > 18 && Math.abs(diffX) > Math.abs(diffY)) {
                            if (diffX > 0) {
                                handleSelectBg(leftBg);
                            } else {
                                handleSelectBg(rightBg);
                            }
                        }
                        setDragOffset(0);
                    };

                    const handlePointerCancel = () => {
                        isPointerDraggingRef.current = false;
                        setDragOffset(0);
                    };

                    const handleTouchStart = (e: React.TouchEvent) => {
                        if (e.touches.length !== 1) return;
                        isPointerDraggingRef.current = true;
                        dragStartXRef.current = e.touches[0].clientX;
                        dragStartYRef.current = e.touches[0].clientY;
                        draggedFarRef.current = false;
                        setDragOffset(0);
                    };

                    const handleTouchMove = (e: React.TouchEvent) => {
                        if (!isPointerDraggingRef.current || e.touches.length !== 1) return;
                        const diffX = e.touches[0].clientX - dragStartXRef.current;
                        const diffY = e.touches[0].clientY - dragStartYRef.current;
                        if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
                            draggedFarRef.current = true;
                        }
                        if (Math.abs(diffX) > Math.abs(diffY)) {
                            setDragOffset(Math.max(-85, Math.min(85, diffX * 0.75)));
                        }
                    };

                    const handleTouchEnd = (e: React.TouchEvent) => {
                        if (!isPointerDraggingRef.current) return;
                        isPointerDraggingRef.current = false;
                        const diffX = (e.changedTouches?.[0]?.clientX ?? dragStartXRef.current) - dragStartXRef.current;
                        const diffY = (e.changedTouches?.[0]?.clientY ?? dragStartYRef.current) - dragStartYRef.current;
                        if (Math.abs(diffX) > 18 && Math.abs(diffX) > Math.abs(diffY)) {
                            if (diffX > 0) {
                                handleSelectBg(leftBg);
                            } else {
                                handleSelectBg(rightBg);
                            }
                        }
                        setDragOffset(0);
                    };

                    return (
                        <div
                            className="flex flex-col items-center justify-center w-full h-full min-h-0 overflow-clip relative"
                            onClick={() => {
                                if (studioGroup !== null) setStudioGroup(null);
                            }}
                        >
                            {/* 3D Coverflow Row: Left Small Card, Center Live Card, Right Small Card */}
                            <div
                                className="flex items-center justify-center gap-2 sm:gap-3.5 relative select-none touch-pan-y"
                                dir="ltr"
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                                onPointerDown={handlePointerDown}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerCancel}
                            >
                                {/* Left Column: Full-Height Vertical Short Fonts Rail + Increase Font Button */}
                                {showSideTypographyRails && (
                                    <div
                                        className="lg:hidden shrink-0 flex flex-col items-center justify-between"
                                        style={{ width: `${railW}px`, height: `${sideColumnH}px` }}
                                        onClick={(e) => e.stopPropagation()}
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onTouchStart={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex-1 min-h-0 w-full flex flex-col items-center animate-fadeIn">
                                            <div className="w-full h-full overflow-y-auto hide-scrollbar overscroll-contain touch-pan-y flex flex-col gap-1.5 px-1 py-1">
                                                {SHARE_FONTS.map((font) => {
                                                    const isSelected = selectedFont === font.id;
                                                    return (
                                                        <button
                                                            key={font.id}
                                                            ref={isSelected ? activeFontBtnRef : undefined}
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedFont(font.id);
                                                            }}
                                                            className="w-full py-1.5 px-1 rounded-xl shrink-0 border-0 cursor-pointer transition-all active:scale-95 flex items-center justify-center text-center leading-tight"
                                                            style={{
                                                                fontFamily: 'var(--font-ui)',
                                                                fontSize: '10.5px',
                                                                fontWeight: 700,
                                                                backgroundColor: isSelected ? accentBg : surfaceBg,
                                                                color: isSelected ? accentText : textPrimary,
                                                                boxShadow: isSelected ? tactileActiveShadow : tactileNeutralShadow,
                                                            }}
                                                            title={isEn ? (font.nameEn || font.name) : font.name}
                                                        >
                                                            <span className="truncate w-full text-center">
                                                                {getShortFontLabel(font, isEn)}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="shrink-0 w-full flex items-center justify-center pt-2 animate-fadeIn">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFontSize((prev) => Math.min(48, prev + 2));
                                                }}
                                                disabled={fontSize >= 48}
                                                className="w-10 h-10 rounded-full border-0 cursor-pointer flex items-center justify-center transition-all active:translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                                style={{
                                                    backgroundColor: surfaceBg,
                                                    color: textPrimary,
                                                    border: `1px solid ${dividerColor}`,
                                                    boxShadow: tactileNeutralShadow,
                                                }}
                                                title={isEn ? 'Increase font size' : 'تكبير الخط'}
                                                aria-label={isEn ? 'Increase font size' : 'تكبير الخط'}
                                            >
                                                <Plus size={18} strokeWidth={2.75} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Exact scaled 9:16 wrapper so layout never overflows or clips */}
                                <div
                                    className="cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (draggedFarRef.current) return;
                                        if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
                                            setHideDesktopCustomization((prev) => !prev);
                                        } else {
                                            setStudioGroup((prev) => (prev === 'typography' ? null : 'typography'));
                                        }
                                    }}
                                    style={{
                                        width: `${scaledW}px`,
                                        height: `${scaledH}px`,
                                        position: 'relative',
                                        flexShrink: 0,
                                        borderRadius: '20px',
                                        overflow: 'hidden',
                                        transform: dragOffset ? `translateX(${dragOffset}px)` : undefined,
                                        transition: isPointerDraggingRef.current ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                                        boxShadow: isDark
                                            ? '0 22px 45px -10px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.12)'
                                            : '0 22px 45px -10px rgba(15,23,42,0.28), 0 0 0 1px rgba(15,23,42,0.06)',
                                    }}
                                >
                                <div
                                    ref={previewRef}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: `${artboardW}px`,
                                        height: `${artboardH}px`,
                                        transform: `scale(${fitScale})`,
                                        transformOrigin: 'top left',
                                        boxSizing: 'border-box',
                                        borderRadius: selectedBg.type === 'share_design' ? '0px' : '12px',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding:
                                            selectedBg.type === 'share_design'
                                                ? selectedFrame.id !== 'none'
                                                    ? '55px 43px 54px 43px'
                                                    : '51px 39px 50px 39px'
                                                : selectedFrame.id !== 'none'
                                                ? '31px 37px 39px 37px'
                                                : '23px 21px 19px 21px',
                                        textAlign: 'center',
                                        backgroundColor: selectedBg.type === 'solid' ? selectedBg.value : undefined,
                                        backgroundImage: selectedBg.type !== 'solid' ? selectedBg.value : undefined,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        border: selectedBg.type === 'share_design' ? 'none' : `4px solid ${selectedBg.border}`,
                                        direction: isEn ? 'ltr' : 'rtl',
                                    }}
                                >
                                    {selectedBg.type === 'share_design' && shareDesignAssets?.previewBackdropUrl ? (
                                        <img
                                            src={shareDesignAssets.previewBackdropUrl}
                                            alt=""
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'fill',
                                                pointerEvents: 'none',
                                                zIndex: 0,
                                            }}
                                        />
                                    ) : (
                                        selectedBg.id !== 'bg_white' &&
                                        !selectedBg.isLight && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    backgroundColor: selectedBg.overlay || 'rgba(0, 0, 0, 0.22)',
                                                }}
                                            />
                                        )
                                    )}

                                    <FrameOverlay frame={selectedFrame} scale={4 / 3} />

                                    <div
                                        style={{
                                            position: 'relative',
                                            zIndex: 10,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            width: '100%',
                                            height: '100%',
                                            flex: 1,
                                            boxSizing: 'border-box',
                                        }}
                                    >
                                        {/* Top Bismillah Header */}
                                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '3px' }}>
                                            {showPreviewTopSurahLabel && (
                                                <p
                                                    style={{
                                                        fontFamily: 'var(--font-amiri-quran), var(--font-hafs), serif',
                                                        fontSize: `${Math.round(previewBismillahSize * 0.92 * 10) / 10}px`,
                                                        color: selectedBg.accent,
                                                        margin: '0 0 1px 0',
                                                        textShadow: selectedBg.id === 'bg_white' || selectedBg.isLight ? 'none' : '0 1.5px 3.5px rgba(0,0,0,0.45)',
                                                        fontWeight: 'bold',
                                                    }}
                                                >
                                                    سُورَةُ {getSurahName(firstPreviewAyah.s)}
                                                </p>
                                            )}
                                            {showPreviewTopBismillah && (
                                                <p
                                                    style={{
                                                        fontFamily: 'var(--font-amiri-quran), var(--font-hafs), serif',
                                                        fontSize: `${previewBismillahSize}px`,
                                                        color: selectedBg.accent,
                                                        margin: 0,
                                                        textShadow: selectedBg.id === 'bg_white' || selectedBg.isLight ? 'none' : '0 2px 4px rgba(0,0,0,0.5)',
                                                        fontWeight: 'bold',
                                                    }}
                                                >
                                                    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                                                </p>
                                            )}
                                            {previewIsShort &&
                                                (selectedBg.type === 'share_design' && shareDesignAssets?.upperMotifUrl ? (
                                                    <img
                                                        src={shareDesignAssets.upperMotifUrl}
                                                        alt=""
                                                        style={{
                                                            width: '193px',
                                                            height: '43px',
                                                            objectFit: 'contain',
                                                            pointerEvents: 'none',
                                                            margin: '3px 0',
                                                        }}
                                                    />
                                                ) : (
                                                    <IslamicFlourish color={selectedBg.accent} scale={2 / 3} />
                                                ))}
                                        </div>

                                        {/* Center Ayah & Optional Explanation */}
                                        <div
                                            style={{
                                                flex: 1,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                width: '100%',
                                                padding: selectedFrame.id !== 'none' ? '4px 9px' : '4px 0',
                                                minHeight: 0,
                                                boxSizing: 'border-box',
                                            }}
                                        >
                                            <p
                                                className="share-preview-text"
                                                style={{
                                                    lineHeight: currentChunkTypo.lineHeight,
                                                    fontFamily: selectedFont,
                                                    fontSize: `${previewAyahSize}px`,
                                                    color: textColor,
                                                    textShadow: selectedBg.id === 'bg_white' || selectedBg.isLight ? 'none' : '0 2px 5px rgba(0,0,0,0.55)',
                                                    margin: 0,
                                                    fontWeight: 'bold',
                                                    whiteSpace: 'normal',
                                                    letterSpacing: 0,
                                                    wordBreak: 'keep-all',
                                                    fontFeatureSettings: '"kern", "liga", "clig", "calt", "ccmp"',
                                                    textRendering: 'optimizeLegibility',
                                                    textAlign: 'center',
                                                    width: '100%',
                                                    padding: selectedFrame.id !== 'none' ? '0 7px' : '0',
                                                    boxSizing: 'border-box',
                                                }}
                                            >
                                                {currentPageChunk.ayahs.map((ay, idx) => {
                                                    const isNewMidChunkSurah = idx > 0 && ay.a === 1;
                                                    return (
                                                        <React.Fragment key={`${ay.s}-${ay.a}-${idx}`}>
                                                            {isNewMidChunkSurah && (
                                                                <>
                                                                    <span
                                                                        style={{
                                                                            display: 'block',
                                                                            fontFamily: 'var(--font-amiri-quran), var(--font-hafs), serif',
                                                                            fontSize: `${Math.round(previewBismillahSize * 0.9 * 10) / 10}px`,
                                                                            color: selectedBg.accent,
                                                                            marginTop: '5px',
                                                                            marginBottom: '1px',
                                                                            lineHeight: 1.4,
                                                                            fontWeight: 'bold',
                                                                            textShadow: selectedBg.id === 'bg_white' || selectedBg.isLight ? 'none' : '0 1.5px 3.5px rgba(0,0,0,0.45)',
                                                                        }}
                                                                    >
                                                                        سُورَةُ {getSurahName(ay.s)}
                                                                    </span>
                                                                    {showBismillah && ay.s !== 9 && (
                                                                        <span
                                                                            style={{
                                                                                display: 'block',
                                                                                fontFamily: 'var(--font-amiri-quran), var(--font-hafs), serif',
                                                                                fontSize: `${Math.round(previewBismillahSize * 0.88 * 10) / 10}px`,
                                                                                color: selectedBg.accent,
                                                                                marginBottom: '3px',
                                                                                lineHeight: 1.4,
                                                                                fontWeight: 'bold',
                                                                                textShadow: selectedBg.id === 'bg_white' || selectedBg.isLight ? 'none' : '0 1.5px 3.5px rgba(0,0,0,0.45)',
                                                                            }}
                                                                        >
                                                                            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                                                                        </span>
                                                                    )}
                                                                </>
                                                            )}
                                                            <span
                                                                style={{ display: 'contents' }}
                                                                dangerouslySetInnerHTML={{
                                                                    __html: renderTajweedTextHtml(getAyahText(ay.s, ay.a, false)),
                                                                }}
                                                            />
                                                            {` ﴿${toArabic(ay.a)}﴾ `}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </p>

                                            {previewExplanation && (
                                                <p
                                                    style={{
                                                        fontFamily: 'var(--font-cairo), sans-serif',
                                                        fontSize: `${previewExplanationSize}px`,
                                                        color: textColor,
                                                        opacity: 0.92,
                                                        marginTop: '9px',
                                                        textAlign: 'center',
                                                        lineHeight: '1.6',
                                                        textShadow: selectedBg.id === 'bg_white' || selectedBg.isLight ? 'none' : '0 1px 3px rgba(0,0,0,0.5)',
                                                        maxWidth: '94%',
                                                    }}
                                                >
                                                    {previewExplanation}
                                                </p>
                                            )}

                                            {previewIsShort &&
                                                (selectedBg.type === 'share_design' && shareDesignAssets?.lowerMotifUrl ? (
                                                    <img
                                                        src={shareDesignAssets.lowerMotifUrl}
                                                        alt=""
                                                        style={{
                                                            width: '193px',
                                                            height: '43px',
                                                            objectFit: 'contain',
                                                            pointerEvents: 'none',
                                                            margin: '3px 0',
                                                        }}
                                                    />
                                                ) : (
                                                    <IslamicFlourish color={selectedBg.accent} scale={2 / 3} />
                                                ))}
                                        </div>

                                        {/* Bottom Metadata & App Footer */}
                                        <div
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                flexShrink: 0,
                                                paddingBottom: customText
                                                    ? selectedFrame.id !== 'none'
                                                        ? '7px'
                                                        : '5px'
                                                    : selectedFrame.id !== 'none'
                                                    ? '4px'
                                                    : '3px',
                                                gap: customText ? '3.5px' : '5px',
                                                boxSizing: 'border-box',
                                            }}
                                        >
                                            <p
                                                style={{
                                                    fontFamily: selectedFont,
                                                    color: textColor,
                                                    textShadow: selectedBg.id === 'bg_white' || selectedBg.isLight ? 'none' : '0 1px 2px rgba(0,0,0,0.5)',
                                                    fontSize: '12.5px',
                                                    fontWeight: 'bold',
                                                    opacity: 0.96,
                                                    textAlign: 'center',
                                                    margin: 0,
                                                    lineHeight: 1.35,
                                                }}
                                            >
                                                {currentPageChunk.surahInfoText}
                                            </p>
                                            <div
                                                style={{
                                                    width: '60%',
                                                    borderTop: `1px solid ${selectedBg.dividerColor || (selectedBg.isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.35)')}`,
                                                }}
                                            />
                                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                <span
                                                    style={{
                                                        fontFamily: 'var(--font-lateef), serif',
                                                        color: selectedBg.brandColor || selectedBg.accent,
                                                        textShadow: selectedBg.id === 'bg_white' || selectedBg.isLight ? 'none' : '0 1px 3px rgba(0,0,0,0.85)',
                                                        fontSize: '16.5px',
                                                        fontWeight: 700,
                                                        lineHeight: 1.25,
                                                        textAlign: 'center',
                                                    }}
                                                    dir={isEn ? 'ltr' : 'rtl'}
                                                >
                                                    {isEn ? 'Mushaf Ahmed & Laila' : 'مصحف أحمد و ليلى'}
                                                </span>
                                                {customText ? (
                                                    <span
                                                        style={{
                                                            fontFamily: selectedFont,
                                                            color: textColor,
                                                            textShadow: selectedBg.id === 'bg_white' || selectedBg.isLight ? 'none' : '0 1px 2px rgba(0,0,0,0.5)',
                                                            fontSize: '16px',
                                                            fontWeight: 600,
                                                            maxWidth: '82%',
                                                            textAlign: 'center',
                                                            lineHeight: 1.25,
                                                            opacity: 0.94,
                                                            overflowWrap: 'anywhere',
                                                            wordBreak: 'break-word',
                                                        }}
                                                    >
                                                        {customText}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                    {/* Left & Right Design Scroll Buttons on Current Design */}
                                    <button
                                        type="button"
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onTouchStart={(e) => e.stopPropagation()}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelectBg(leftBg);
                                        }}
                                        className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-0 cursor-pointer transition-transform active:scale-90"
                                        style={{
                                            backgroundColor: surfaceBg,
                                            color: textPrimary,
                                            border: `1px solid ${dividerColor}`,
                                            boxShadow: tactileNeutralShadow,
                                        }}
                                        title={leftBg.name}
                                        aria-label={isEn ? 'Previous design' : 'التصميم السابق'}
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onTouchStart={(e) => e.stopPropagation()}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelectBg(rightBg);
                                        }}
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-0 cursor-pointer transition-transform active:scale-90"
                                        style={{
                                            backgroundColor: surfaceBg,
                                            color: textPrimary,
                                            border: `1px solid ${dividerColor}`,
                                            boxShadow: tactileNeutralShadow,
                                        }}
                                        title={rightBg.name}
                                        aria-label={isEn ? 'Next design' : 'التصميم التالي'}
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>

                                {/* Right Column: Full-Height Vertical Colors Rail + Decrease Font Button */}
                                {showSideTypographyRails && (
                                    <div
                                        className="lg:hidden shrink-0 flex flex-col items-center justify-between"
                                        style={{ width: `${railW}px`, height: `${sideColumnH}px` }}
                                        onClick={(e) => e.stopPropagation()}
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onTouchStart={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex-1 min-h-0 w-full flex flex-col items-center animate-fadeIn">
                                            <div className="w-full h-full overflow-y-auto hide-scrollbar overscroll-contain touch-pan-y flex flex-col items-center gap-2 px-1 py-1">
                                                {TEXT_COLORS.map((color) => {
                                                    const isSelected = textColor === color;
                                                    return (
                                                        <button
                                                            key={color}
                                                            ref={isSelected ? activeColorBtnRef : undefined}
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setTextColor(color);
                                                            }}
                                                            className={`w-7 h-7 rounded-full shrink-0 cursor-pointer transition-transform active:scale-90 ${
                                                                isSelected ? 'scale-110' : 'opacity-90 hover:opacity-100'
                                                            }`}
                                                            style={{
                                                                backgroundColor: color,
                                                                border: isSelected
                                                                    ? `2.5px solid ${accentBg}`
                                                                    : '1.5px solid rgba(148,163,184,0.45)',
                                                                boxShadow: isSelected
                                                                    ? `0 0 0 2px ${surfaceBg}, 0 3px 8px rgba(0,0,0,0.24)`
                                                                    : 'inset 0 1.5px 2px rgba(255,255,255,0.4), inset 0 -1.5px 2px rgba(0,0,0,0.2), 0 3px 6px rgba(0,0,0,0.2)',
                                                            }}
                                                            aria-label={color}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="shrink-0 w-full flex items-center justify-center pt-2 animate-fadeIn">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFontSize((prev) => Math.max(12, prev - 2));
                                                }}
                                                disabled={fontSize <= 12}
                                                className="w-10 h-10 rounded-full border-0 cursor-pointer flex items-center justify-center transition-all active:translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                                style={{
                                                    backgroundColor: surfaceBg,
                                                    color: textPrimary,
                                                    border: `1px solid ${dividerColor}`,
                                                    boxShadow: tactileNeutralShadow,
                                                }}
                                                title={isEn ? 'Decrease font size' : 'تصغير الخط'}
                                                aria-label={isEn ? 'Decrease font size' : 'تصغير الخط'}
                                            >
                                                <Minus size={18} strokeWidth={2.75} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sleek Floating Carousel Pager when Ayahs split into multiple images */}
                            {hasMultiImagePager && (
                                <div
                                    className="flex items-center justify-between gap-2 mt-2 px-2.5 py-1.5 rounded-full shrink-0"
                                    style={{
                                        backgroundColor: surfaceBg,
                                        boxShadow: tactileNeutralShadow,
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setCurrentImagePageIndex((prev) => Math.max(0, prev - 1))}
                                        disabled={safePageIndex === 0}
                                        className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-30 border-0 cursor-pointer transition-all active:translate-y-0.5 active:scale-90"
                                        style={{ backgroundColor: surfaceBg, color: textPrimary, boxShadow: tactileNeutralShadow }}
                                        title="الصورة السابقة"
                                    >
                                        <ChevronRight size={15} />
                                    </button>
                                    <span className="text-[11px] font-extrabold px-1.5 tabular-nums whitespace-nowrap" style={{ color: textPrimary }}>
                                        {isEn ? `Slide ${safePageIndex + 1} / ${pageChunks.length}` : `صورة ${toArabic(safePageIndex + 1)} من ${toArabic(pageChunks.length)}`}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentImagePageIndex((prev) => Math.min(pageChunks.length - 1, prev + 1))}
                                        disabled={safePageIndex >= pageChunks.length - 1}
                                        className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-30 border-0 cursor-pointer transition-all active:translate-y-0.5 active:scale-90"
                                        style={{ backgroundColor: surfaceBg, color: textPrimary, boxShadow: tactileNeutralShadow }}
                                        title="الصورة التالية"
                                    >
                                        <ChevronLeft size={15} />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                };

                const renderNonImagePreview = () => {
                    if (shareType === 'text') {
                        return (
                            <div
                                className="w-full max-w-[440px] max-h-full rounded-3xl p-5 flex flex-col gap-3.5 overflow-y-auto"
                                style={{
                                    backgroundColor: surfaceBg,
                                    boxShadow: tactileCardShadow,
                                }}
                            >
                                <div className="flex items-center justify-between gap-2 pb-2 border-b" style={{ borderColor: dividerColor }}>
                                    <span className="text-xs font-extrabold" style={{ color: accentBg }}>
                                        {surahInfo}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleCopy}
                                        disabled={isCopying}
                                        className="px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center border-0 cursor-pointer transition-all active:translate-y-0.5 active:scale-95 shrink-0"
                                        style={{
                                            backgroundColor: isCopiedFeedback ? accentBg : surfaceBg,
                                            color: isCopiedFeedback ? accentText : textPrimary,
                                            boxShadow: isCopiedFeedback ? tactileActiveShadow : tactileNeutralShadow,
                                        }}
                                    >
                                        <span>{isCopiedFeedback ? (isEn ? 'Copied' : 'تم النسخ') : (isEn ? 'Copy' : 'نسخ النص')}</span>
                                    </button>
                                </div>

                                <p
                                    className="text-lg sm:text-xl leading-[2] font-bold text-center"
                                    style={{ fontFamily: 'var(--font-amiri-quran), serif', color: textPrimary }}
                                >
                                    {combinedText}
                                </p>

                                {combinedExplanation && (
                                    <div
                                        className="pt-3 border-t text-xs sm:text-sm leading-relaxed text-justify"
                                        style={{ borderColor: dividerColor, color: textMuted }}
                                    >
                                        {combinedExplanation}
                                    </div>
                                )}

                                <div className="pt-2 border-t text-center text-[11px] font-semibold" style={{ borderColor: dividerColor, color: textMuted }}>
                                    {isEn ? 'Shared via Mushaf Ahmed & Laila' : 'آيات من القرآن الكريم · بواسطة مصحف أحمد و ليلى'}
                                </div>
                            </div>
                        );
                    }

                    // audio preview
                    const start = Math.min(fromAyah, toAyah);
                    const end = Math.max(fromAyah, toAyah);
                    const audioFileName =
                        start === end
                            ? `سورة ${getSurahName(currentAyah.s)} الايه${String(start).padStart(2, '0')}.mp3`
                            : `سورة ${getSurahName(currentAyah.s)} الايه من ${String(start).padStart(2, '0')} الى ${String(end).padStart(2, '0')}.mp3`;

                    return (
                        <div
                            className="w-full max-w-[360px] rounded-3xl p-6 flex flex-col items-center text-center gap-4"
                            style={{
                                backgroundColor: surfaceBg,
                                boxShadow: tactileCardShadow,
                            }}
                        >
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                style={{ backgroundColor: accentBg, color: accentText, boxShadow: tactileActiveShadow }}
                            >
                                <Volume2 size={30} />
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-base font-black" style={{ color: textPrimary }}>
                                    {isEn ? 'Audio Recitation MP3' : 'تلاوة قرآنية بصيغة MP3'}
                                </h4>
                                <p className="text-xs font-semibold" style={{ color: textMuted }}>
                                    {surahInfo}
                                </p>
                            </div>

                            {/* Clean Visual Waveform Bars */}
                            <div className="flex items-center justify-center gap-1.5 h-10 w-full px-4" aria-hidden="true">
                                {[28, 52, 76, 44, 92, 64, 84, 38, 72, 96, 56, 40, 78, 48, 30].map((hPct, idx) => (
                                    <span
                                        key={idx}
                                        className="w-1.5 rounded-full"
                                        style={{
                                            height: `${hPct}%`,
                                            backgroundColor: accentBg,
                                            opacity: idx % 2 === 0 ? 0.88 : 0.45,
                                            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.35), 0 2px 4px rgba(0,0,0,0.12)',
                                        }}
                                    />
                                ))}
                            </div>

                            <div
                                className="w-full px-3 py-2 rounded-xl text-[11px] font-bold truncate"
                                style={{ backgroundColor: trackBg, color: textPrimary, boxShadow: tactileInsetShadow }}
                                dir="rtl"
                            >
                                {audioFileName}
                            </div>
                        </div>
                    );
                };

                return (
                    <>
                        <div
                            ref={studioShellRef}
                            className="w-full h-full flex flex-col overflow-clip"
                            style={{ backgroundColor: studioBg, color: textPrimary }}
                            dir={isEn ? 'ltr' : 'rtl'}
                            onClick={(e) => e.stopPropagation()}
                        >
                        {/* 1. Compact Studio Top Bar */}
                        <header
                            className="share-studio-header px-3.5 pb-2.5 flex items-center justify-center gap-2.5 shrink-0 border-b z-20"
                            style={{
                                backgroundColor: surfaceBg,
                                borderColor: dividerColor,
                                paddingTop: 'calc(0.6rem + var(--app-safe-top, 0px))',
                                boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.42)' : '0 4px 14px rgba(15,23,42,0.06)',
                            }}
                        >
                            {/* Font & Caption button on mobile image & page tabs */}
                            {(shareType === 'image' || shareType === 'page') && (
                                <button
                                    type="button"
                                    onClick={() => setStudioGroup((prev) => (prev === 'typography' ? null : 'typography'))}
                                    className="lg:hidden px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border-0 cursor-pointer transition-transform active:translate-y-0.5 active:scale-95 whitespace-nowrap shrink-0"
                                    style={{
                                        backgroundColor: studioGroup === 'typography' ? accentBg : surfaceBg,
                                        color: studioGroup === 'typography' ? accentText : textPrimary,
                                        boxShadow: studioGroup === 'typography' ? tactileActiveShadow : tactileNeutralShadow,
                                    }}
                                >
                                    <Type size={13} className="shrink-0" />
                                    <span>{isEn ? 'Font' : 'الخط والنص'}</span>
                                </button>
                            )}

                            {/* Unified Ayah Range Chip */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (shareType === 'page') return;
                                    setRangeSelectionMode(fromAyah === toAyah ? 'single' : 'range');
                                    setRangeActiveStep('from');
                                    setIsRangePickerOpen(true);
                                }}
                                disabled={shareType === 'page'}
                                className={`min-w-0 max-w-full px-3 py-1.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-extrabold border-0 transition-transform ${
                                    shareType === 'page' ? 'opacity-70 cursor-default' : 'cursor-pointer active:translate-y-0.5 active:scale-95'
                                }`}
                                style={{
                                    backgroundColor: surfaceBg,
                                    color: textPrimary,
                                    boxShadow: tactileNeutralShadow,
                                }}
                            >
                                <span className="truncate">{rangeSummaryLabel}</span>
                                {shareType !== 'page' && <ChevronDown size={13} className="shrink-0 opacity-70" />}
                            </button>
                        </header>

                        {/* Main Studio Body: Single-column Mobile Portrait OR Dual-column Desktop / Landscape */}
                        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-clip">
                            {/* Mobile-Only Compact Mode Segmented Track */}
                            <div
                                className="lg:hidden px-3.5 pt-2.5 pb-1 shrink-0"
                                style={{ backgroundColor: studioBg }}
                            >
                                <div
                                    className="grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl"
                                    style={{ backgroundColor: trackBg, boxShadow: tactileInsetShadow }}
                                >
                                    {shareModeOptions.map((opt) => {
                                        const isActive = shareType === opt.id;
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setShareType(opt.id)}
                                                className="py-1.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center transition-all active:translate-y-0.5 border-0 cursor-pointer whitespace-nowrap"
                                                style={{
                                                    backgroundColor: isActive ? accentBg : surfaceBg,
                                                    color: isActive ? accentText : textPrimary,
                                                    boxShadow: isActive ? tactileActiveShadow : tactileNeutralShadow,
                                                }}
                                            >
                                                <span>{opt.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Center Showcase Stage (Auto-fits 9:16 card with ZERO clipping) */}
                            <div
                                ref={previewStageRef}
                                className="flex-1 min-h-0 min-w-0 flex flex-col items-center justify-center p-2.5 sm:p-4 overflow-clip relative"
                                style={{
                                    background: isDark
                                        ? 'radial-gradient(circle at 50% 45%, rgba(255,255,255,0.04) 0%, transparent 70%)'
                                        : 'radial-gradient(circle at 50% 45%, rgba(217,119,6,0.06) 0%, transparent 72%)',
                                }}
                            >
                                {(shareType === 'image' || shareType === 'page') ? renderLiveImageArtboard() : renderNonImagePreview()}
                            </div>

                            {/* Desktop / Landscape Right Control Panel */}
                            <aside
                                className="hidden lg:flex lg:w-[400px] xl:w-[430px] shrink-0 flex-col border-s overflow-hidden"
                                style={{
                                    backgroundColor: surfaceBg,
                                    borderColor: dividerColor,
                                    boxShadow: isDark ? '-6px 0 22px rgba(0,0,0,0.45)' : '-6px 0 22px rgba(15,23,42,0.06)',
                                }}
                            >
                                <div className="p-4 border-b shrink-0" style={{ borderColor: dividerColor }}>
                                    <div className="grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl" style={{ backgroundColor: trackBg, boxShadow: tactileInsetShadow }}>
                                        {shareModeOptions.map((opt) => {
                                            const isActive = shareType === opt.id;
                                            return (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => setShareType(opt.id)}
                                                    className="py-1.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center transition-all active:translate-y-0.5 border-0 cursor-pointer whitespace-nowrap"
                                                    style={{
                                                        backgroundColor: isActive ? accentBg : surfaceBg,
                                                        color: isActive ? accentText : textPrimary,
                                                        boxShadow: isActive ? tactileActiveShadow : tactileNeutralShadow,
                                                    }}
                                                >
                                                    <span>{opt.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
                                    {(shareType === 'image' || shareType === 'page') ? (
                                        !hideDesktopCustomization ? (
                                            <div className="space-y-3 animate-fadeIn">
                                                <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: dividerColor }}>
                                                    <Type size={14} style={{ color: accentBg }} />
                                                    <span className="text-xs font-black" style={{ color: textPrimary }}>
                                                        {isEn ? 'Font & Caption' : 'الخط والنص'}
                                                    </span>
                                                </div>
                                                {renderCustomizationPanelBody()}
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setHideDesktopCustomization(false)}
                                                className="w-full rounded-2xl p-4 text-center border-0 cursor-pointer transition-all active:translate-y-0.5 animate-fadeIn"
                                                style={{ backgroundColor: surfaceBg, boxShadow: tactileNeutralShadow }}
                                            >
                                                <p className="text-xs font-bold" style={{ color: textPrimary }}>
                                                    {isEn ? 'Click the design to show colors, fonts & caption' : 'اضغط على التصميم لإظهار الألوان والخطوط والنص الإضافي'}
                                                </p>
                                            </button>
                                        )
                                    ) : (
                                        <div className="rounded-2xl p-4 space-y-2" style={{ backgroundColor: trackBg, boxShadow: tactileInsetShadow }}>
                                            <p className="text-xs font-extrabold" style={{ color: textPrimary }}>
                                                {shareType === 'text'
                                                    ? (isEn ? 'Text Share Ready' : 'جاهز للمشاركة النصية')
                                                    : (isEn ? 'Audio Recitation MP3' : 'مشاركة التلاوة الصوتية')}
                                            </p>
                                            <p className="text-xs leading-relaxed" style={{ color: textMuted }}>
                                                {surahInfo}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 border-t shrink-0" style={{ borderColor: dividerColor }}>
                                    {renderPrimaryShareCTA(true)}
                                </div>
                            </aside>
                        </div>

                        {/* Mobile Bottom Dock: Collapsible Live Drawer + Sculpted 3D Primary Share CTA */}
                        <div
                            data-toast-bottom-bar="true"
                            className="lg:hidden shrink-0 border-t z-20"
                            style={{
                                backgroundColor: surfaceBg,
                                borderColor: dividerColor,
                                boxShadow: isDark ? '0 -4px 18px rgba(0,0,0,0.48)' : '0 -4px 16px rgba(15,23,42,0.06)',
                            }}
                        >
                            {/* Compact Mobile Caption Bar + Bismillah Toggle (Fonts, Colors & +/- Size are positioned in the left/right stage rails) */}
                            {(shareType === 'image' || shareType === 'page') && studioGroup !== null && (
                                <div
                                    className="px-3.5 py-2 border-b animate-fadeIn flex items-center gap-2"
                                    style={{ borderColor: dividerColor, backgroundColor: surfaceBg }}
                                >
                                    <input
                                        type="text"
                                        value={customText}
                                        onChange={(e) => setCustomText(e.target.value)}
                                        placeholder={isEn ? 'Optional note / caption...' : 'نص إضافي يظهر أسفل البطاقة (اختياري)...'}
                                        className="flex-1 min-w-0 px-3 py-2 text-xs font-semibold rounded-xl outline-none transition-all border-0"
                                        style={{
                                            backgroundColor: trackBg,
                                            color: textPrimary,
                                            boxShadow: tactileInsetShadow,
                                        }}
                                        maxLength={50}
                                        dir={isEn ? 'ltr' : 'rtl'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowBismillah((prev) => !prev)}
                                        className="px-3 py-2 rounded-xl text-xs font-extrabold shrink-0 border-0 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                                        style={{
                                            backgroundColor: showBismillah ? accentBg : surfaceBg,
                                            color: showBismillah ? accentText : textMuted,
                                            boxShadow: showBismillah ? tactileActiveShadow : tactileNeutralShadow,
                                        }}
                                        title={isEn ? (showBismillah ? 'Hide Bismillah' : 'Show Bismillah') : (showBismillah ? 'إخفاء البسملة من التصميم' : 'إظهار البسملة في التصميم')}
                                        aria-pressed={showBismillah}
                                    >
                                        {isEn ? 'Bismillah' : 'البسملة'}
                                    </button>
                                </div>
                            )}

                            <div className="px-3.5 pt-2.5 modal-sheet-safe-bottom">
                                {renderPrimaryShareCTA()}
                            </div>
                        </div>

                        </div>

                        {/* Unified Ayah Range Picker Modal (Single Tap Ayah or From -> To Range with Verse Snippets) */}
                        {isRangePickerOpen && (
                            <div
                                className="fixed inset-0 z-[1220] bg-black/60 flex items-center justify-center p-4 overflow-clip"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsRangePickerOpen(false);
                                }}
                            >
                                <div
                                    className="w-full max-w-[360px] flex flex-col max-h-[75dvh] overflow-clip rounded-3xl border-0"
                                    style={{ backgroundColor: surfaceBg, color: textPrimary, boxShadow: tactileCardShadow }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Range Header */}
                                    <div className="p-3.5 pb-2.5 border-b space-y-2.5 shrink-0" style={{ borderColor: dividerColor }}>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm font-black" style={{ color: textPrimary }}>
                                                {isEn ? `Select Verses · ${getSurahName(currentAyah.s)}` : `تحديد الآيات · سورة ${getSurahName(currentAyah.s)}`}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setIsRangePickerOpen(false)}
                                                className="w-8 h-8 rounded-full flex items-center justify-center border-0 cursor-pointer transition-all active:translate-y-0.5 active:scale-90"
                                                style={{ backgroundColor: surfaceBg, color: textPrimary, boxShadow: tactileNeutralShadow }}
                                            >
                                                <X size={15} />
                                            </button>
                                        </div>

                                        {/* Mode Switch: Single Ayah vs Multi-Ayah Range */}
                                        <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl" style={{ backgroundColor: trackBg, boxShadow: tactileInsetShadow }}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setRangeSelectionMode('single');
                                                    setRangeActiveStep('from');
                                                }}
                                                className="py-1.5 px-2 rounded-xl text-xs font-extrabold border-0 cursor-pointer transition-all active:translate-y-0.5"
                                                style={{
                                                    backgroundColor: rangeSelectionMode === 'single' ? accentBg : surfaceBg,
                                                    color: rangeSelectionMode === 'single' ? accentText : textPrimary,
                                                    boxShadow: rangeSelectionMode === 'single' ? tactileActiveShadow : tactileNeutralShadow,
                                                }}
                                            >
                                                {isEn ? 'Single Ayah' : 'آية واحدة'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setRangeSelectionMode('range');
                                                }}
                                                className="py-1.5 px-2 rounded-xl text-xs font-extrabold border-0 cursor-pointer transition-all active:translate-y-0.5"
                                                style={{
                                                    backgroundColor: rangeSelectionMode === 'range' ? accentBg : surfaceBg,
                                                    color: rangeSelectionMode === 'range' ? accentText : textPrimary,
                                                    boxShadow: rangeSelectionMode === 'range' ? tactileActiveShadow : tactileNeutralShadow,
                                                }}
                                            >
                                                {isEn ? 'Verse Range' : 'من آية إلى آية'}
                                            </button>
                                        </div>

                                        {rangeSelectionMode === 'range' && (
                                            <div className="grid grid-cols-2 gap-2 pt-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() => setRangeActiveStep('from')}
                                                    className="py-2 px-3 rounded-xl text-xs font-extrabold border-0 cursor-pointer flex items-center justify-center gap-1.5 transition-all active:translate-y-0.5"
                                                    style={{
                                                        backgroundColor: rangeActiveStep === 'from' ? accentBg : surfaceBg,
                                                        color: rangeActiveStep === 'from' ? accentText : textPrimary,
                                                        boxShadow: rangeActiveStep === 'from' ? tactileActiveShadow : tactileNeutralShadow,
                                                    }}
                                                >
                                                    <span>{isEn ? 'From:' : 'من الآية:'}</span>
                                                    <span className="tabular-nums">{toArabic(fromAyah)}</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setRangeActiveStep('to')}
                                                    className="py-2 px-3 rounded-xl text-xs font-extrabold border-0 cursor-pointer flex items-center justify-center gap-1.5 transition-all active:translate-y-0.5"
                                                    style={{
                                                        backgroundColor: rangeActiveStep === 'to' ? accentBg : surfaceBg,
                                                        color: rangeActiveStep === 'to' ? accentText : textPrimary,
                                                        boxShadow: rangeActiveStep === 'to' ? tactileActiveShadow : tactileNeutralShadow,
                                                    }}
                                                >
                                                    <span>{isEn ? 'To:' : 'إلى الآية:'}</span>
                                                    <span className="tabular-nums">{toArabic(toAyah)}</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Verses List with Clean Number + Full Quranic Text */}
                                    <div ref={rangeListRef} className="flex-1 min-h-0 overflow-y-auto px-3.5 py-3 space-y-2.5">
                                        {quranData.surahs[currentAyah.s - 1].ayahs.map((ay: any) => {
                                            const val = ay.numberInSurah;
                                            const startVal = Math.min(fromAyah, toAyah);
                                            const endVal = Math.max(fromAyah, toAyah);
                                            const isEndpoint =
                                                rangeSelectionMode === 'single'
                                                    ? fromAyah === val
                                                    : (rangeActiveStep === 'from' ? fromAyah === val : toAyah === val);
                                            const inRange = rangeSelectionMode === 'range' && val >= startVal && val <= endVal;
                                            const snippet = getAyahText(currentAyah.s, val);

                                            return (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    ref={isEndpoint ? selectedAyahRef : undefined}
                                                    onClick={() => {
                                                        if (rangeSelectionMode === 'single') {
                                                            setFromAyah(val);
                                                            setToAyah(val);
                                                            setIsRangePickerOpen(false);
                                                        } else if (rangeActiveStep === 'from') {
                                                            setFromAyah(val);
                                                            if (val > toAyah) setToAyah(val);
                                                            setRangeActiveStep('to');
                                                        } else {
                                                            if (val < fromAyah) {
                                                                setToAyah(fromAyah);
                                                                setFromAyah(val);
                                                            } else {
                                                                setToAyah(val);
                                                            }
                                                            setIsRangePickerOpen(false);
                                                        }
                                                    }}
                                                    className="w-full py-2 px-3.5 rounded-2xl border-0 flex items-center gap-3 text-start cursor-pointer transition-transform active:scale-[0.98]"
                                                    style={{
                                                        backgroundColor: isEndpoint
                                                            ? accentBg
                                                            : inRange
                                                            ? `${accentBg}22`
                                                            : surfaceBg,
                                                        color: isEndpoint ? accentText : textPrimary,
                                                        boxShadow: isEndpoint ? tactileActiveShadow : tactileNeutralShadow,
                                                    }}
                                                >
                                                    <span
                                                        className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-sm font-black tabular-nums"
                                                        style={{
                                                            fontFamily: 'var(--font-ui)',
                                                            backgroundColor: isEndpoint ? 'rgba(255,255,255,0.22)' : surfaceBg,
                                                            color: isEndpoint ? accentText : accentBg,
                                                            border: isEndpoint ? '1px solid rgba(255,255,255,0.28)' : `1px solid ${dividerColor}`,
                                                            boxShadow: isEndpoint
                                                                ? '0 3px 0 rgba(0,0,0,0.22), 0 6px 12px rgba(0,0,0,0.18), inset 0 1.5px 1.5px rgba(255,255,255,0.45), inset 0 -1.5px 2px rgba(0,0,0,0.18)'
                                                                : tactileNeutralShadow,
                                                        }}
                                                    >
                                                        {toArabic(val)}
                                                    </span>
                                                    <span
                                                        className="flex-1 min-w-0 block text-[15px] leading-[2.3] py-1 truncate text-right"
                                                        style={{ fontFamily: 'var(--font-amiri-quran), serif' }}
                                                        dir="rtl"
                                                    >
                                                        {snippet}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {rangeSelectionMode === 'range' && (
                                        <div className="p-3 border-t shrink-0" style={{ borderColor: dividerColor }}>
                                            <button
                                                type="button"
                                                onClick={() => setIsRangePickerOpen(false)}
                                                className="w-full py-2.5 rounded-2xl text-xs font-extrabold border-0 cursor-pointer transition-transform active:scale-95"
                                                style={{
                                                    backgroundColor: accentBg,
                                                    color: accentText,
                                                    boxShadow: tactileActiveShadow,
                                                }}
                                            >
                                                {isEn
                                                    ? `Apply (${fromAyah} – ${toAyah})`
                                                    : `تطبيق النطاق (${toArabic(Math.min(fromAyah, toAyah))} – ${toArabic(Math.max(fromAyah, toAyah))})`}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                );
            })()}
            </div>
        </>
    );
};

export default ShareAyahModal;
