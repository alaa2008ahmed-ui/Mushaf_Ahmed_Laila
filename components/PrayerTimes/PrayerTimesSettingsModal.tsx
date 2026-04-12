import React from 'react';
import ToneSelector from './ToneSelector';

interface PrayerTimesSettingsModalProps {
    isOpen: boolean;
    currentEditingKey: string | null;
    prayerNamesAr: Record<string, string>;
    primaryColor: string;
    secondaryColor: string;
    isBlackAndWhite: boolean;
    closeModal: () => void;
    tempOffset: number;
    setTempOffset: React.Dispatch<React.SetStateAction<number>>;
    tempIqama: number;
    setTempIqama: React.Dispatch<React.SetStateAction<number>>;
    times: Record<string, string>;
    formatTime12_EN: (time: string) => string;
    applyOffset: (timeStr: string, offsetMins: number) => string;
    configTones: Record<string, any>;
    internetTones: { name: string; path: string }[];
    handleToneSelection: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    handleToneUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    saveUserConfig: () => void;
    isSummerTime?: boolean;
}

const PrayerTimesSettingsModal: React.FC<PrayerTimesSettingsModalProps> = ({
    isOpen,
    currentEditingKey,
    prayerNamesAr,
    primaryColor,
    secondaryColor,
    isBlackAndWhite,
    closeModal,
    tempOffset,
    setTempOffset,
    tempIqama,
    setTempIqama,
    times,
    formatTime12_EN,
    applyOffset,
    configTones,
    internetTones,
    handleToneSelection,
    handleToneUpload,
    saveUserConfig,
    isSummerTime
}) => {
    if (!isOpen || !currentEditingKey) return null;

    const totalPreviewOffset = tempOffset + (isSummerTime ? 60 : 0);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6 scale-in">
            <div className="rounded-[2.5rem] w-full max-w-xs p-6 shadow-2xl" style={{ backgroundColor: 'var(--modal-bg)', color: 'var(--modal-text)' }}>
                <div className="flex justify-between items-center mb-6 pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                    <h3 className="font-black text-sm" style={{ color: primaryColor }}>إعدادات صلاة {prayerNamesAr[currentEditingKey]}</h3>
                    <button onClick={closeModal} className="hover:text-red-500" style={{ color: secondaryColor }}>
                        <i className="fa-solid fa-circle-xmark text-2xl"></i>
                    </button>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black mb-3 uppercase tracking-widest text-center" style={{ color: secondaryColor }}>تعديل وقت الأذان (بالدقائق)</label>
                        <div className="flex items-center justify-between themed-bg-alt p-2 rounded-2xl border themed-card-border shadow-inner">
                            <button onClick={() => setTempOffset(p => p - 1)} className="control-btn text-red-500 shadow-sm"><i className="fa-solid fa-minus"></i></button>
                            <div className="text-center">
                                <div className="text-lg font-black en-digits" style={{ color: primaryColor }}>{formatTime12_EN(applyOffset(times[currentEditingKey], totalPreviewOffset))}</div>
                                <div className="text-[10px] font-bold mt-0.5 en-digits" style={{color: secondaryColor}}>{tempOffset > 0 ? "+" : ""}{tempOffset} min</div>
                            </div>
                            <button onClick={() => setTempOffset(p => p + 1)} className="control-btn shadow-sm" style={{color: primaryColor}}><i className="fa-solid fa-plus"></i></button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black mb-3 uppercase tracking-widest text-center" style={{ color: secondaryColor }}>تنبيه الإقامة (بالدقائق)</label>
                        <div className="flex items-center justify-between themed-bg-alt p-2 rounded-2xl border themed-card-border shadow-inner">
                            <button onClick={() => setTempIqama(p => Math.max(0, p - 1))} className="control-btn text-red-500 shadow-sm"><i className="fa-solid fa-minus"></i></button>
                            <div className="text-center">
                                <div className="text-lg font-black en-digits" style={{ color: primaryColor }}>{tempIqama}</div>
                                <div className="text-[10px] font-bold mt-0.5 uppercase tracking-tighter" style={{color: secondaryColor}}>min</div>
                            </div>
                            <button onClick={() => setTempIqama(p => p + 1)} className="control-btn shadow-sm" style={{color: primaryColor}}><i className="fa-solid fa-plus"></i></button>
                        </div>
                    </div>
                    <ToneSelector 
                        currentEditingKey={currentEditingKey}
                        configTones={configTones}
                        internetTones={internetTones}
                        handleToneSelection={handleToneSelection}
                        handleToneUpload={handleToneUpload}
                        secondaryColor={secondaryColor}
                        primaryColor={primaryColor}
                    />
                </div>
                <button onClick={saveUserConfig} className="w-full mt-8 text-white py-4 rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-all" style={{backgroundColor: primaryColor, color: isBlackAndWhite ? '#000' : '#FFF'}}>حفظ التغييرات</button>
            </div>
        </div>
    );
};

export default PrayerTimesSettingsModal;
