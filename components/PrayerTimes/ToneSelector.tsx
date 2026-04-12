import React from 'react';

interface ToneSelectorProps {
    currentEditingKey: string | null;
    configTones: Record<string, any>;
    internetTones: { name: string; path: string }[];
    handleToneSelection: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    handleToneUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    secondaryColor: string;
    primaryColor: string;
}

const ToneSelector: React.FC<ToneSelectorProps> = ({
    currentEditingKey,
    configTones,
    internetTones,
    handleToneSelection,
    handleToneUpload,
    secondaryColor,
    primaryColor
}) => {
    if (!currentEditingKey) return null;
    
    const currentTone = configTones[currentEditingKey];
    let selectValue = '/assets/audio/takbeer1.mp3'; // Default to Takbeer 1
    if (currentTone) {
        if (currentTone.data === 'none') {
            selectValue = 'none';
        } else if (currentTone.data.startsWith('data:')) {
            selectValue = 'custom';
        } else if (currentTone.originalUrl) {
            selectValue = currentTone.originalUrl;
        } else {
            selectValue = currentTone.data;
        }
    }

    return (
        <div>
            <label className="block text-[10px] font-black mb-2 uppercase tracking-widest" style={{ color: secondaryColor }}>نغمة التنبيه</label>
            <div className="relative">
                <select value={selectValue} onChange={handleToneSelection} className="w-full appearance-none themed-bg-alt border themed-card-border rounded-xl py-3 px-4 text-xs font-bold" style={{ color: primaryColor }}>
                    <option value="none">بدون تنبيه</option>
                    {internetTones.map(tone => <option key={tone.path} value={tone.path}>{tone.name}</option>)}
                    <option value="custom">نغمة مخصصة...</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3">
                     <i className="fa-solid fa-chevron-down text-xs" style={{color: secondaryColor}}></i>
                </div>
            </div>
            <input type="file" id="sound-file-input" accept="audio/*" className="hidden" onChange={handleToneUpload}/>
            {selectValue === 'custom' && currentTone && <p className="text-center text-[10px] mt-1 truncate" style={{ color: secondaryColor }}>الملف الحالي: {currentTone.name}</p>}
        </div>
    );
};

export default ToneSelector;
