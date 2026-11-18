import React, { useState, useEffect } from 'react';
import ModalWrapper from './ModalWrapper';
import TasbeehChartModal from './TasbeehChartModal';
import { TasbeehSkinType } from './TasbeehCounter';
import { Theme } from '../../context/themes';
import { useLanguage } from '../../context/LanguageContext';
import { tTasbeeh, formatTasbeehNumber, getPhraseDisplay } from '../../utils/tasbeehTranslations';

interface TasbeehModalsProps {
    modals: any;
    setModals: React.Dispatch<React.SetStateAction<any>>;
    targetInputRef: React.RefObject<HTMLInputElement>;
    target: number;
    handleSetTarget: () => void;
    newPhraseInputRef: React.RefObject<HTMLInputElement>;
    handleAddPhrase: (text: string) => void;
    phrases: { id: number; text: string }[];
    handleDeletePhrase: (text: string) => void;
    activePhrase: string;
    setActivePhrase: React.Dispatch<React.SetStateAction<string>>;
    handleReset: () => void;
    colorOptions: string[];
    handleSetCounterColor: (color: string) => void;
    counterColor: string;
    theme: Theme;
    dailyStats: {date: string, count: number}[];
    skin: string;
    handleSetSkin: (skin: TasbeehSkinType) => void;
    themeKey?: string;
    cardBorderColor?: string;
    onNavigate?: (pageId: string, params?: any) => void;
}

const TasbeehModals: React.FC<TasbeehModalsProps> = ({
    modals, setModals, targetInputRef, target, handleSetTarget,
    newPhraseInputRef, handleAddPhrase, phrases, handleDeletePhrase,
    activePhrase, setActivePhrase, handleReset, colorOptions,
    handleSetCounterColor, counterColor, theme, dailyStats, skin, handleSetSkin,
    themeKey = 'default',
    cardBorderColor,
    onNavigate
}) => {
    const { language, isRTL } = useLanguage();
    const [newPhraseText, setNewPhraseText] = useState('');

    useEffect(() => {
        if (!modals.add) {
            setNewPhraseText('');
        }
    }, [modals.add]);

    const canAddPhrase = newPhraseText.trim().length > 0;
    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'اسود' || theme.name === 'black' || themeKey === 'black_gold';
    const isDarkSurface = Boolean(theme.isDark) || isBlackTheme;
    const recessedInputShadow = isDarkSurface
        ? 'inset 0 3px 6px rgba(0, 0, 0, 0.8), inset 0 -1px 1.5px rgba(255, 255, 255, 0.12)'
        : 'inset 0 3px 6px rgba(15, 23, 42, 0.14), inset 0 -1.5px 2px rgba(255, 255, 255, 0.9), 0 1px 0 rgba(255, 255, 255, 0.85)';
    const recessedInputSurfaceClass = isBlackTheme
        ? 'bg-[#27272a] text-white placeholder:text-zinc-500'
        : 'bg-slate-100/90 dark:bg-[#0F172A] text-slate-800 dark:text-white placeholder:text-slate-400';
    const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.palette?.[0] || theme.accent || '#2E7D5E');
    const activeBorderColor = isBlackTheme ? 'rgba(255, 255, 255, 0.1)' : 'transparent';

    const previewAccent = (!counterColor || counterColor === '#000000') && !isBlackTheme
        ? primaryColor
        : (counterColor || primaryColor);
    const isPreviewWhite = previewAccent === '#FFFFFF' || previewAccent === 'white' || previewAccent === '#fff';
    const vividAccent = isPreviewWhite
        ? (theme.palette?.[0] || '#F59E0B')
        : previewAccent;

    const renderSkinMiniPreview = (skinId: TasbeehSkinType, isSelected: boolean) => {
        const beadBase = `radial-gradient(circle at 30% 28%, rgba(255,255,255,0.88) 0%, ${vividAccent} 48%, #09090b 100%)`;

        const renderInnerPreview = () => {
            if (skinId === 'modern') {
                return (
                    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                        <div
                            className="absolute inset-0 rounded-full"
                            style={{
                                border: `2.5px solid ${vividAccent}55`
                            }}
                        />
                        <div
                            className="w-9 h-9 rounded-full flex items-center justify-center"
                            style={{
                                background: beadBase,
                                boxShadow: '0 4px 0 rgba(0,0,0,0.22), 0 6px 12px rgba(0,0,0,0.22), inset 0 2px 3px rgba(255,255,255,0.75)'
                            }}
                        >
                            <span
                                className="text-[10px] font-black"
                                style={{ color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.45)' }}
                            >
                                {formatTasbeehNumber(33, language)}
                            </span>
                        </div>
                    </div>
                );
            }

            if (skinId === 'classic') {
                return (
                    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                        <div
                            className="w-9 h-12 rounded-[14px] p-1.5 flex flex-col items-center justify-between"
                            style={{
                                background: `linear-gradient(155deg, ${vividAccent} 0%, rgba(0,0,0,0.34) 100%)`,
                                backgroundColor: vividAccent,
                                boxShadow: '0 4px 0 rgba(0,0,0,0.25), 0 6px 10px rgba(0,0,0,0.22), inset 0 1.5px 2px rgba(255,255,255,0.65)'
                            }}
                        >
                            <div
                                className="w-full h-3.5 rounded-[5px] flex items-center justify-center"
                                style={{
                                    background: '#cbd5c0',
                                    boxShadow: 'inset 0 1.5px 3px rgba(0,0,0,0.4)'
                                }}
                            >
                                <span className="text-[7px] font-mono font-black text-slate-800 leading-none">33</span>
                            </div>
                            <div
                                className="w-4 h-4 rounded-full"
                                style={{
                                    background: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #cbd5e1 100%)',
                                    boxShadow: '0 2px 0 #64748b, 0 3px 4px rgba(0,0,0,0.25)'
                                }}
                            />
                        </div>
                    </div>
                );
            }

            if (skinId === 'beads') {
                return (
                    <div className="relative w-12 h-12 flex flex-col items-center justify-center shrink-0">
                        <div className={`w-0.5 h-11 rounded-full absolute ${isBlackTheme && !isSelected ? 'bg-zinc-500/70' : 'bg-slate-400/80'}`} />
                        <div className="flex flex-col items-center gap-0.5 relative z-10">
                            <div
                                className="w-3.5 h-3.5 rounded-full"
                                style={{ background: beadBase, boxShadow: '0 2px 4px rgba(0,0,0,0.25)' }}
                            />
                            <div
                                className="w-5 h-5 rounded-full relative"
                                style={{ background: beadBase, boxShadow: '0 3px 6px rgba(0,0,0,0.3), inset 0 1.5px 2px rgba(255,255,255,0.75)' }}
                            >
                                <div className="w-1.5 h-1 rounded-full bg-white/75 absolute top-1 left-1" />
                            </div>
                            <div
                                className="w-3.5 h-3.5 rounded-full"
                                style={{ background: beadBase, boxShadow: '0 2px 4px rgba(0,0,0,0.25)' }}
                            />
                        </div>
                    </div>
                );
            }

            if (skinId === 'wheel') {
                const miniBeads = 11;
                const r = 17;
                return (
                    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                        {Array.from({ length: miniBeads }).map((_, idx) => {
                            const a = ((idx * 360) / miniBeads - 90) * (Math.PI / 180);
                            const x = Math.cos(a) * r;
                            const y = Math.sin(a) * r;
                            return (
                                <div
                                    key={idx}
                                    className="absolute rounded-full"
                                    style={{
                                        width: idx === 0 ? '7px' : '5.5px',
                                        height: idx === 0 ? '7px' : '5.5px',
                                        transform: `translate(${x}px, ${y}px)`,
                                        background: idx === 0
                                            ? 'radial-gradient(circle at 30% 25%, #fef08a 0%, #d97706 80%)'
                                            : beadBase,
                                        boxShadow: '0 1.5px 3px rgba(0,0,0,0.3)'
                                    }}
                                />
                            );
                        })}
                        <div
                            className="w-5 h-5 rounded-full"
                            style={{
                                background: beadBase,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.25), inset 0 1px 2px rgba(255,255,255,0.8)'
                            }}
                        />
                    </div>
                );
            }

            if (skinId === 'mechanical') {
                return (
                    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                        <div
                            className="w-11 h-9 rounded-xl p-1 flex flex-col items-center justify-between"
                            style={{
                                background: `linear-gradient(155deg, ${vividAccent} 0%, rgba(0,0,0,0.34) 100%)`,
                                backgroundColor: vividAccent,
                                boxShadow: '0 3.5px 0 rgba(0,0,0,0.25), 0 5px 8px rgba(0,0,0,0.22), inset 0 1px 2px rgba(255,255,255,0.65)'
                            }}
                        >
                            {/* 3 Miniature Drum Reels */}
                            <div className="w-full h-3.5 rounded bg-slate-900/90 p-0.5 flex gap-0.5 items-center justify-center">
                                {[0, 3, 3].map((n, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 h-full rounded-[2px] bg-white flex items-center justify-center"
                                        style={{ boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.25)' }}
                                    >
                                        <span className="text-[6px] font-black text-slate-900 leading-none">{formatTasbeehNumber(n, language)}</span>
                                    </div>
                                ))}
                            </div>
                            {/* Tactile Rocker Bar */}
                            <div
                                className="w-full h-2.5 rounded-md bg-white"
                                style={{ boxShadow: '0 1.5px 0 #94a3b8' }}
                            />
                        </div>
                    </div>
                );
            }

            // 'crystal'
            return (
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                    <div
                        className="w-10 h-10 rounded-xl p-1 flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(155deg, #e2e8f0 0%, #94a3b8 100%)',
                            boxShadow: '0 3px 0 #64748b, 0 5px 10px rgba(0,0,0,0.24)'
                        }}
                    >
                        <div
                            className="w-full h-full rounded-lg relative overflow-hidden flex items-center justify-center"
                            style={{
                                background: `linear-gradient(135deg, rgba(255,255,255,0.52) 0%, ${vividAccent} 48%, rgba(0,0,0,0.32) 100%)`,
                                backgroundColor: vividAccent,
                                boxShadow: 'inset 0 1.5px 2px rgba(255,255,255,0.85)'
                            }}
                        >
                            <div className="w-4 h-4 rounded-sm rotate-45 border border-white/70 bg-white/25" />
                        </div>
                    </div>
                </div>
            );
        };

        if (isSelected) {
            return (
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all"
                    style={{
                        backgroundColor: isBlackTheme ? '#18181b' : '#ffffff',
                        boxShadow: isBlackTheme
                            ? '0 3px 8px rgba(0,0,0,0.32), inset 0 1px 1px rgba(255,255,255,0.16)'
                            : '0 3px 10px rgba(0,0,0,0.22), inset 0 1.5px 2px rgba(255,255,255,0.95)'
                    }}
                >
                    {renderInnerPreview()}
                </div>
            );
        }

        return renderInnerPreview();
    };

    const skinOptions: { id: TasbeehSkinType; label: string }[] = [
        { id: 'modern', label: tTasbeeh('skinModern', language) },
        { id: 'classic', label: tTasbeeh('skinClassic', language) },
        { id: 'beads', label: tTasbeeh('skinBeads', language) },
        { id: 'wheel', label: tTasbeeh('skinWheel', language) },
        { id: 'crystal', label: tTasbeeh('skinCrystal', language) },
        { id: 'mechanical', label: tTasbeeh('skinMechanical', language) },
    ];

    return (
        <>
            {/* Target Modal */}
            <ModalWrapper isOpen={modals.target} onClose={() => setModals((p: any) => ({...p, target: false}))} title={tTasbeeh('targetModalTitle', language)} cardBorderColor={activeBorderColor}>
                <input 
                    ref={targetInputRef} 
                    id="target-input" 
                    type="text" 
                    inputMode="numeric" 
                    dir={isRTL ? 'rtl' : 'ltr'} 
                    defaultValue={target > 0 ? formatTasbeehNumber(target, language) : ''}
                    placeholder={tTasbeeh('targetModalTitle', language)}
                    onInput={(e) => (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(/[^0-9٠-٩]/g, '')}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSetTarget();
                        }
                    }}
                    className={`border-0 w-full p-3.5 rounded-2xl text-center text-2xl font-bold focus:outline-none focus:ring-2 transition-all ${recessedInputSurfaceClass}`}
                    style={{ boxShadow: recessedInputShadow }}
                />
                <div className="flex gap-3 pt-1">
                    <button 
                        type="button"
                        onClick={() => setModals((p: any) => ({...p, target: false}))} 
                        className="app-page-card border-0 flex-1 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] text-modal-text font-bold transition-all cursor-pointer"
                    >
                        {tTasbeeh('cancel', language)}
                    </button>
                    <button 
                        type="button"
                        onClick={handleSetTarget} 
                        className="app-page-card border-0 flex-1 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] text-modal-text font-bold transition-all cursor-pointer"
                    >
                        {tTasbeeh('save', language)}
                    </button>
                </div>
            </ModalWrapper>

            {/* Add Phrase Modal */}
            <ModalWrapper isOpen={modals.add} onClose={() => { setNewPhraseText(''); setModals((p: any) => ({...p, add: false})); }} title={tTasbeeh('addModalTitle', language)} cardBorderColor={activeBorderColor}>
                 <input 
                     ref={newPhraseInputRef} 
                     id="new-phrase-input" 
                     type="text" 
                     value={newPhraseText}
                     onChange={(e) => setNewPhraseText(e.target.value)}
                     onKeyDown={(e) => {
                         if (e.key === 'Enter' && canAddPhrase) {
                             handleAddPhrase(newPhraseText);
                             setNewPhraseText('');
                         }
                     }}
                     placeholder={tTasbeeh('addModalPlaceholder', language)} 
                     dir={isRTL ? 'rtl' : 'ltr'} 
                     className={`border-0 w-full p-3.5 rounded-2xl text-lg font-semibold focus:outline-none focus:ring-2 transition-all ${recessedInputSurfaceClass}`}
                     style={{ boxShadow: recessedInputShadow }}
                 />
                <div className="flex gap-3 pt-1">
                    <button 
                        type="button"
                        onClick={() => { setNewPhraseText(''); setModals((p: any) => ({...p, add: false})); }} 
                        className="app-page-card border-0 flex-1 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] text-modal-text font-bold transition-all cursor-pointer"
                    >
                        {tTasbeeh('cancel', language)}
                    </button>
                    <button 
                        type="button"
                        disabled={!canAddPhrase}
                        onClick={() => {
                            if (!canAddPhrase) return;
                            handleAddPhrase(newPhraseText);
                            setNewPhraseText('');
                        }} 
                        className={`app-page-card border-0 flex-1 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] text-modal-text font-bold transition-all ${
                            canAddPhrase ? 'cursor-pointer opacity-100' : 'opacity-45 cursor-not-allowed'
                        }`}
                    >
                        {tTasbeeh('addBtn', language)}
                    </button>
                </div>
            </ModalWrapper>
            
            {/* Delete Phrase Modal */}
            <ModalWrapper isOpen={modals.delete} onClose={() => setModals((p: any) => ({...p, delete: false}))} title={tTasbeeh('deleteModalTitle', language)} cardBorderColor={activeBorderColor}>
                 <div className="space-y-3 overflow-y-auto max-h-64 px-1 py-1">
                    {phrases.length > 0 ? (
                         phrases.map(p => (
                             <div key={p.id} className="app-page-card border-0 p-2.5 rounded-xl flex items-center justify-between bg-white dark:bg-[#1E293B] gap-2">
                                 <span className="text-base flex-grow font-amiri text-modal-text">
                                     {getPhraseDisplay(p.text, language)}
                                 </span>
                                 <button 
                                     onClick={() => handleDeletePhrase(p.text)} 
                                     className="px-3 h-8 text-xs font-bold rounded-lg bg-red-500 text-white flex-shrink-0 hover:bg-red-600 transition-all cursor-pointer active:translate-y-[2px]"
                                     style={{
                                         boxShadow: '0 3px 0 #b91c1c, inset 0 1px 1px rgba(255,255,255,0.35)'
                                     }}
                                 >
                                     {tTasbeeh('delete', language)}
                                 </button>
                             </div>
                         ))
                    ) : (
                        <p className="text-center opacity-60 py-4">
                            {tTasbeeh('noPhrasesToDelete', language)}
                        </p>
                    )}
                 </div>
                 <div className="pt-2">
                     <button onClick={() => setModals((p: any) => ({...p, delete: false}))} className="app-page-card border-0 w-full py-2.5 rounded-xl bg-white dark:bg-[#1E293B] text-modal-text font-bold transition-all cursor-pointer">
                         {tTasbeeh('close', language)}
                     </button>
                 </div>
            </ModalWrapper>

            {/* Select Phrase Modal */}
            <ModalWrapper
                isOpen={modals.phrase}
                onClose={() => setModals((p: any) => ({...p, phrase: false}))}
                title={tTasbeeh('phraseModalTitle', language)}
                cardBorderColor={activeBorderColor}
                className="max-w-sm"
            >
                <div className="flex flex-col gap-3 max-h-[58dvh] overflow-y-auto px-1 py-1.5 no-scrollbar">
                    {phrases.map((p) => {
                        const isSelected = activePhrase === p.text;
                        return (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                    setActivePhrase(p.text);
                                    handleReset();
                                    setModals((prev: any) => ({ ...prev, phrase: false }));
                                }}
                                className={`${
                                    isSelected
                                        ? 'border-0 active:translate-y-[3px]'
                                        : 'app-page-card border-0 bg-white dark:bg-[#1E293B] text-modal-text'
                                } w-full py-3 px-4 rounded-2xl font-bold transition-all cursor-pointer flex items-center justify-between gap-3`}
                                style={isSelected ? {
                                    backgroundColor: isBlackTheme ? '#FFFFFF' : primaryColor,
                                    color: isBlackTheme ? '#000000' : '#ffffff',
                                    boxShadow: '0 6px 0 rgba(0, 0, 0, 0.24), 0 12px 22px -2px rgba(0, 0, 0, 0.2), inset 0 2px 2px rgba(255, 255, 255, 0.4)'
                                } : undefined}
                            >
                                <span className="text-base leading-relaxed font-amiri flex-1 text-start">
                                    {getPhraseDisplay(p.text, language)}
                                </span>
                                {isSelected && (
                                    <div
                                        className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full"
                                        style={{
                                            backgroundColor: isBlackTheme ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.22)',
                                            color: isBlackTheme ? '#000000' : '#ffffff'
                                        }}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
                <div className="pt-2">
                    <button
                        type="button"
                        onClick={() => setModals((p: any) => ({ ...p, phrase: false }))}
                        className="app-page-card border-0 w-full py-2.5 rounded-xl bg-white dark:bg-[#1E293B] text-modal-text font-bold transition-all cursor-pointer"
                    >
                        {tTasbeeh('close', language)}
                    </button>
                </div>
            </ModalWrapper>
            
            {/* Color Modal */}
            <ModalWrapper isOpen={modals.color} onClose={() => setModals((p: any) => ({...p, color: false}))} title={tTasbeeh('colorModalTitle', language)} cardBorderColor={activeBorderColor}>
                <div className="grid grid-cols-4 gap-4 pt-1 pb-1 justify-items-center">
                    {colorOptions.map(color => (
                        <button
                            key={color}
                            onClick={() => handleSetCounterColor(color)}
                            className={`w-12 h-12 rounded-full transition-all transform cursor-pointer active:translate-y-[2px] ${counterColor === color ? 'ring-2 ring-offset-2 ring-offset-modal-bg ring-primary scale-105' : 'hover:scale-105'}`}
                            style={{
                                background: color === '#FFFFFF'
                                    ? 'radial-gradient(circle at 30% 28%, #ffffff 0%, #e2e8f0 85%)'
                                    : `radial-gradient(circle at 30% 28%, rgba(255,255,255,0.45) 0%, ${color} 55%, rgba(0,0,0,0.28) 100%)`,
                                backgroundColor: color,
                                boxShadow: '0 4px 0 rgba(0,0,0,0.18), 0 6px 12px rgba(0,0,0,0.16), inset 0 2px 3px rgba(255,255,255,0.65)'
                            }}
                        />
                    ))}
                </div>
                <div className="pt-2">
                    <button onClick={() => setModals((p: any) => ({...p, color: false}))} className="app-page-card border-0 w-full py-2.5 rounded-xl bg-white dark:bg-[#1E293B] text-modal-text font-bold transition-all cursor-pointer">
                        {tTasbeeh('close', language)}
                    </button>
                </div>
            </ModalWrapper>

            {/* Skins Modal - 5 3D Sculpted Tasbeeh Designs */}
            <ModalWrapper isOpen={modals.skins} onClose={() => setModals((p: any) => ({...p, skins: false}))} title={tTasbeeh('skinsModalTitle', language)} cardBorderColor={activeBorderColor} className="max-w-sm">
                <div className="flex flex-col gap-3 max-h-[68dvh] overflow-y-auto px-1 py-1 no-scrollbar">
                    {skinOptions.map((item) => {
                        const isSelected = skin === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => handleSetSkin(item.id)}
                                className={`${
                                    isSelected
                                        ? 'border-0 active:translate-y-[3px]'
                                        : 'app-page-card border-0 bg-white dark:bg-[#1E293B] text-modal-text'
                                } w-full py-2.5 px-4 rounded-2xl font-bold transition-all cursor-pointer flex items-center justify-between gap-3`}
                                style={isSelected ? {
                                    backgroundColor: isBlackTheme ? '#FFFFFF' : primaryColor,
                                    color: isBlackTheme ? '#000000' : '#ffffff',
                                    boxShadow: '0 6px 0 rgba(0, 0, 0, 0.24), 0 12px 22px -2px rgba(0, 0, 0, 0.2), inset 0 2px 2px rgba(255, 255, 255, 0.4)'
                                } : {}}
                            >
                                <span className="text-sm sm:text-base font-bold text-start flex-1">
                                    {item.label}
                                </span>
                                {renderSkinMiniPreview(item.id, isSelected)}
                            </button>
                        );
                    })}
                </div>
                <div className="pt-2">
                    <button onClick={() => setModals((p: any) => ({...p, skins: false}))} className="app-page-card border-0 w-full py-2.5 rounded-xl bg-white dark:bg-[#1E293B] text-modal-text font-bold transition-all cursor-pointer">
                        {tTasbeeh('close', language)}
                    </button>
                </div>
            </ModalWrapper>

            {/* Stats & Charts Modal */}
            <TasbeehChartModal
                isOpen={modals.stats}
                onClose={() => setModals((p: any) => ({...p, stats: false}))}
                dailyStats={dailyStats}
                theme={theme}
                themeKey={themeKey}
                onNavigate={onNavigate}
            />
        </>
    );
};

export default TasbeehModals;
