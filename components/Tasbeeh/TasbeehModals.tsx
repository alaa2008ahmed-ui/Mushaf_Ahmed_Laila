import React from 'react';
import ModalWrapper from './ModalWrapper';
import { toArabicNumerals, toEnglishNumerals } from '../../utils/tasbeehUtils';
import { Theme } from '../../context/themes';

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
}

const TasbeehModals: React.FC<TasbeehModalsProps> = ({
    modals, setModals, targetInputRef, target, handleSetTarget,
    newPhraseInputRef, handleAddPhrase, phrases, handleDeletePhrase,
    activePhrase, setActivePhrase, handleReset, colorOptions,
    handleSetCounterColor, counterColor, theme
}) => {
    return (
        <>
            <ModalWrapper isOpen={modals.target} onClose={() => setModals((p: any) => ({...p, target: false}))}>
                <h3 className="text-xl font-bold text-center border-b pb-2 border-modal-border">تعيين الهدف</h3>
                <p className='text-sm text-center opacity-80'>أدخل العدد المستهدف (مثل 33). أدخل 0 للإلغاء.</p>
                <input ref={targetInputRef} id="target-input" type="text" inputMode="numeric" dir="rtl" defaultValue={toArabicNumerals(target > 0 ? target : '')}
                    onInput={(e) => (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(/[^0-9٠-٩]/g, '')}
                    className="w-full p-3 rounded-xl text-center text-2xl font-bold focus:outline-none focus:ring-2 bg-card-bg-hover text-modal-text border border-modal-border"/>
                <div className="flex gap-3 pt-2">
                    <button onClick={() => setModals((p: any) => ({...p, target: false}))} className="flex-1 py-2 rounded-lg bg-gray-500/20 text-modal-text font-bold hover:bg-gray-500/30 transition-colors">إلغاء</button>
                    <button onClick={handleSetTarget} className="flex-1 py-2 rounded-lg text-white font-bold" style={{backgroundColor: theme.palette[0]}}>حفظ</button>
                </div>
            </ModalWrapper>

            <ModalWrapper isOpen={modals.add} onClose={() => setModals((p: any) => ({...p, add: false}))}>
                 <h3 className="text-xl font-bold text-center border-b pb-2 border-modal-border">إضافة تسبيح</h3>
                 <input ref={newPhraseInputRef} id="new-phrase-input" type="text" placeholder="اكتب الذكر هنا..." dir="rtl" className="w-full p-3 rounded-xl text-right text-lg focus:outline-none focus:ring-2 bg-card-bg-hover text-modal-text border border-modal-border"/>
                <div className="flex gap-3 pt-2">
                    <button onClick={() => setModals((p: any) => ({...p, add: false}))} className="flex-1 py-2 rounded-lg bg-gray-500/20 text-modal-text font-bold hover:bg-gray-500/30 transition-colors">إلغاء</button>
                    <button onClick={() => handleAddPhrase(newPhraseInputRef.current?.value || '')} className="flex-1 py-2 rounded-lg text-white font-bold" style={{backgroundColor: theme.palette[0]}}>إضافة</button>
                </div>
            </ModalWrapper>
            
            <ModalWrapper isOpen={modals.delete} onClose={() => setModals((p: any) => ({...p, delete: false}))}>
                 <h3 className="text-xl font-bold text-center border-b pb-3 border-modal-border">حذف تسبيح</h3>
                 <div className="space-y-3 overflow-y-auto max-h-60 pr-2">
                    {phrases.length > 0 ? (
                         phrases.map(p => (
                             <div key={p.id} className="p-2 rounded-lg flex items-center justify-between bg-card-bg-hover border border-modal-border">
                                 <span className="text-right text-base flex-grow pl-2 font-amiri text-modal-text">{p.text}</span>
                                 <button onClick={() => handleDeletePhrase(p.text)} className="w-14 h-8 text-xs font-bold rounded-md bg-red-500 text-white flex-shrink-0 hover:bg-red-600 transition-colors">حذف</button>
                             </div>
                         ))
                    ) : (
                        <p className="text-center opacity-60 py-4">لا يوجد أذكار لحذفها.</p>
                    )}
                 </div>
                 <div className="pt-4 mt-2 border-t border-modal-border">
                     <button onClick={() => setModals((p: any) => ({...p, delete: false}))} className="w-full py-2 rounded-lg bg-gray-500/20 text-modal-text font-bold hover:bg-gray-500/30 transition-colors">
                         إغلاق
                     </button>
                 </div>
            </ModalWrapper>

            <ModalWrapper isOpen={modals.phrase} onClose={() => setModals((p: any) => ({...p, phrase: false}))}>
                <h3 className="text-xl font-bold text-center border-b pb-3 border-modal-border">اختر الذكر</h3>
                <div className="space-y-3 overflow-y-auto max-h-60 pr-2">
                    {phrases.map(p => (
                        <div key={p.id} onClick={() => { setActivePhrase(p.text); handleReset(); setModals((p: any) => ({...p, phrase: false})); }}
                             className={`p-3 rounded-xl cursor-pointer flex items-center justify-between border-2 ${activePhrase === p.text ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-card-bg-hover bg-card-bg-hover/50'}`}>
                            <span className="text-right text-lg font-amiri text-modal-text">{p.text}</span>
                            {activePhrase === p.text && <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0"></div>}
                        </div>
                    ))}
                </div>
            </ModalWrapper>
            
            {/* FIX: Added a new modal for selecting the counter color. */}
            <ModalWrapper isOpen={modals.color} onClose={() => setModals((p: any) => ({...p, color: false}))}>
                <h3 className="text-xl font-bold text-center border-b pb-2 border-modal-border">اختر لون العداد</h3>
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
                        إغلاق
                    </button>
                </div>
            </ModalWrapper>
        </>
    );
};

export default TasbeehModals;
