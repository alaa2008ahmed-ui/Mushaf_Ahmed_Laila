import React from 'react';
import ModalWrapper from './ModalWrapper';
import TasbeehChartModal from './TasbeehChartModal';
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
    handleSetSkin: (skin: 'modern' | 'classic' | 'beads') => void;
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
    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'اسود' || theme.name === 'black';
    const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.palette?.[0] || theme.accent || '#2E7D5E');
    const activeBorderColor = isBlackTheme ? 'rgba(255, 255, 255, 0.1)' : 'transparent';

    return (
        <>
            {/* Target Modal */}
            <ModalWrapper isOpen={modals.target} onClose={() => setModals((p: any) => ({...p, target: false}))} cardBorderColor={activeBorderColor}>
                <h3 className="text-xl font-bold text-center border-b pb-2 border-modal-border">
                    {tTasbeeh('targetModalTitle', language)}
                </h3>
                <p className='text-sm text-center opacity-80'>
                    {tTasbeeh('targetModalDesc', language)}
                </p>
                <input 
                    ref={targetInputRef} 
                    id="target-input" 
                    type="text" 
                    inputMode="numeric" 
                    dir={isRTL ? 'rtl' : 'ltr'} 
                    defaultValue={target > 0 ? formatTasbeehNumber(target, language) : ''}
                    onInput={(e) => (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(/[^0-9٠-٩]/g, '')}
                    className="w-full p-3 rounded-xl text-center text-2xl font-bold focus:outline-none focus:ring-2 bg-card-bg-hover text-modal-text border border-modal-border"
                />
                <div className="flex gap-3 pt-2">
                    <button 
                        onClick={() => setModals((p: any) => ({...p, target: false}))} 
                        className="flex-1 py-2 rounded-lg bg-gray-500/20 text-modal-text font-bold hover:bg-gray-500/30 transition-colors"
                    >
                        {tTasbeeh('cancel', language)}
                    </button>
                    <button 
                        onClick={handleSetTarget} 
                        className="flex-1 py-2 rounded-lg font-bold" 
                        style={{backgroundColor: isBlackTheme ? '#FFFFFF' : theme.palette[0], color: isBlackTheme ? '#000000' : '#ffffff'}}
                    >
                        {tTasbeeh('save', language)}
                    </button>
                </div>
            </ModalWrapper>

            {/* Add Phrase Modal */}
            <ModalWrapper isOpen={modals.add} onClose={() => setModals((p: any) => ({...p, add: false}))} cardBorderColor={activeBorderColor}>
                 <h3 className="text-xl font-bold text-center border-b pb-2 border-modal-border">
                     {tTasbeeh('addModalTitle', language)}
                 </h3>
                 <input 
                     ref={newPhraseInputRef} 
                     id="new-phrase-input" 
                     type="text" 
                     placeholder={tTasbeeh('addModalPlaceholder', language)} 
                     dir={isRTL ? 'rtl' : 'ltr'} 
                     className="w-full p-3 rounded-xl text-lg focus:outline-none focus:ring-2 bg-card-bg-hover text-modal-text border border-modal-border"
                 />
                <div className="flex gap-3 pt-2">
                    <button 
                        onClick={() => setModals((p: any) => ({...p, add: false}))} 
                        className="flex-1 py-2 rounded-lg bg-gray-500/20 text-modal-text font-bold hover:bg-gray-500/30 transition-colors"
                    >
                        {tTasbeeh('cancel', language)}
                    </button>
                    <button 
                        onClick={() => handleAddPhrase(newPhraseInputRef.current?.value || '')} 
                        className="flex-1 py-2 rounded-lg font-bold" 
                        style={{backgroundColor: isBlackTheme ? '#FFFFFF' : theme.palette[0], color: isBlackTheme ? '#000000' : '#ffffff'}}
                    >
                        {tTasbeeh('addBtn', language)}
                    </button>
                </div>
            </ModalWrapper>
            
            {/* Delete Phrase Modal */}
            <ModalWrapper isOpen={modals.delete} onClose={() => setModals((p: any) => ({...p, delete: false}))} cardBorderColor={activeBorderColor}>
                 <h3 className="text-xl font-bold text-center border-b pb-3 border-modal-border">
                     {tTasbeeh('deleteModalTitle', language)}
                 </h3>
                 <div className="space-y-3 overflow-y-auto max-h-60 pr-2">
                    {phrases.length > 0 ? (
                         phrases.map(p => (
                             <div key={p.id} className="p-2 rounded-lg flex items-center justify-between bg-card-bg-hover border border-modal-border gap-2">
                                 <span className="text-base flex-grow font-amiri text-modal-text">
                                     {getPhraseDisplay(p.text, language)}
                                 </span>
                                 <button 
                                     onClick={() => handleDeletePhrase(p.text)} 
                                     className="px-3 h-8 text-xs font-bold rounded-md bg-red-500 text-white flex-shrink-0 hover:bg-red-600 transition-colors"
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
                 <div className="pt-4 mt-2 border-t border-modal-border">
                     <button onClick={() => setModals((p: any) => ({...p, delete: false}))} className="w-full py-2 rounded-lg bg-gray-500/20 text-modal-text font-bold hover:bg-gray-500/30 transition-colors">
                         {tTasbeeh('close', language)}
                     </button>
                 </div>
            </ModalWrapper>

            {/* Select Phrase Modal */}
            <ModalWrapper isOpen={modals.phrase} onClose={() => setModals((p: any) => ({...p, phrase: false}))} noStyles={true}>
                <div className="overflow-y-auto max-h-[60vh] bg-white dark:bg-[#1E293B] text-slate-800 dark:text-white shadow-2xl rounded-2xl border border-slate-100 dark:border-white/10 custom-scrollbar">
                    {phrases.map((p) => (
                        <button 
                             key={p.id} 
                             onClick={() => { setActivePhrase(p.text); handleReset(); setModals((p: any) => ({...p, phrase: false})); }}
                             className={`w-full px-4 py-3.5 flex items-center justify-between transition-all border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.99] ${activePhrase === p.text ? 'bg-black/5 dark:bg-white/10 font-bold' : ''}`}
                             style={activePhrase === p.text ? { color: primaryColor } : {}}
                        >
                            <span className="text-base leading-relaxed font-amiri flex-1 text-start">
                                {getPhraseDisplay(p.text, language)}
                            </span>
                            {activePhrase === p.text && (
                                <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                                    <svg className="w-4 h-4" transform="scale(1.1)" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </ModalWrapper>
            
            {/* Color Modal */}
            <ModalWrapper isOpen={modals.color} onClose={() => setModals((p: any) => ({...p, color: false}))} cardBorderColor={activeBorderColor}>
                <h3 className="text-xl font-bold text-center border-b pb-2 border-modal-border">
                    {tTasbeeh('colorModalTitle', language)}
                </h3>
                <div className="grid grid-cols-4 gap-4 pt-4 justify-items-center">
                    {colorOptions.map(color => (
                        <button
                            key={color}
                            onClick={() => handleSetCounterColor(color)}
                            className={`w-12 h-12 rounded-full border-4 transition-transform transform active:scale-90 ${counterColor === color ? 'ring-2 ring-offset-2 ring-offset-modal-bg ring-primary' : ''}`}
                            style={{ backgroundColor: color, borderColor: 'rgba(255,255,255,0.5)' }}
                        />
                    ))}
                </div>
                <div className="pt-4 mt-2 border-t border-modal-border">
                    <button onClick={() => setModals((p: any) => ({...p, color: false}))} className="w-full py-2 rounded-lg bg-gray-500/20 text-modal-text font-bold hover:bg-gray-500/30 transition-colors">
                        {tTasbeeh('close', language)}
                    </button>
                </div>
            </ModalWrapper>

            {/* Skins Modal */}
            <ModalWrapper isOpen={modals.skins} onClose={() => setModals((p: any) => ({...p, skins: false}))} cardBorderColor={activeBorderColor}>
                <h3 className="text-xl font-bold text-center border-b pb-2 border-modal-border">
                    {tTasbeeh('skinsModalTitle', language)}
                </h3>
                <div className="flex flex-col gap-3 pt-4">
                    <button 
                        onClick={() => handleSetSkin('modern')}
                        className={`py-3 px-4 rounded-xl font-bold transition-colors ${skin === 'modern' ? 'bg-primary text-white' : 'bg-card-bg-hover text-modal-text'}`}
                        style={skin === 'modern' ? {backgroundColor: theme.palette[0]} : {}}
                    >
                        {tTasbeeh('skinModern', language)}
                    </button>
                    <button 
                        onClick={() => handleSetSkin('classic')}
                        className={`py-3 px-4 rounded-xl font-bold transition-colors ${skin === 'classic' ? 'bg-primary text-white' : 'bg-card-bg-hover text-modal-text'}`}
                        style={skin === 'classic' ? {backgroundColor: theme.palette[0]} : {}}
                    >
                        {tTasbeeh('skinClassic', language)}
                    </button>
                    <button 
                        onClick={() => handleSetSkin('beads')}
                        className={`py-3 px-4 rounded-xl font-bold transition-colors ${skin === 'beads' ? 'bg-primary text-white' : 'bg-card-bg-hover text-modal-text'}`}
                        style={skin === 'beads' ? {backgroundColor: theme.palette[0]} : {}}
                    >
                        {tTasbeeh('skinBeads', language)}
                    </button>
                </div>
                <div className="pt-4 mt-2 border-t border-modal-border">
                    <button onClick={() => setModals((p: any) => ({...p, skins: false}))} className="w-full py-2 rounded-lg bg-gray-500/20 text-modal-text font-bold hover:bg-gray-500/30 transition-colors">
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
