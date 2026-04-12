import React, { useState, useEffect } from 'react';

interface PasscodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    isLandscape?: boolean;
}

const PasscodeModal: React.FC<PasscodeModalProps> = ({ isOpen, onClose, onSuccess, isLandscape }) => {
    const [passcode, setPasscode] = useState('');
    const CORRECT_PASSCODE = '0120301012';
    const PASSCODE_LENGTH = CORRECT_PASSCODE.length;

    useEffect(() => {
        if (isOpen) {
            setPasscode('');
        }
    }, [isOpen]);

    const handleNumberClick = (num: string) => {
        if (passcode.length < PASSCODE_LENGTH) {
            const newPasscode = passcode + num;
            setPasscode(newPasscode);
            
            if (newPasscode === CORRECT_PASSCODE) {
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 200);
            } else if (newPasscode.length === PASSCODE_LENGTH) {
                setTimeout(() => {
                    setPasscode('');
                    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
                }, 300);
            }
        }
    };

    const handleClear = () => {
        setPasscode('');
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 backdrop-blur-md ${isLandscape ? 'p-0' : 'p-4'} fade-in`}>
            <div className={`bg-white dark:bg-gray-900 ${isLandscape ? 'max-w-4xl h-full rounded-none' : 'max-w-xs rounded-3xl'} shadow-2xl w-full overflow-hidden flex flex-col p-6 border border-gray-200 dark:border-gray-800 justify-center`}>
                <div className={isLandscape ? 'max-w-xs mx-auto w-full' : ''}>
                    <div className="text-center mb-8">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">أدخل الرقم السري</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">للوصول إلى إعدادات التخصيص</p>
                    </div>

                    <div className="flex justify-center gap-1.5 mb-10">
                        {Array.from({ length: PASSCODE_LENGTH }).map((_, i) => (
                            <div 
                                key={i}
                                className={`w-2.5 h-2.5 rounded-full border transition-all duration-200 ${
                                    passcode.length > i 
                                        ? 'bg-emerald-500 border-emerald-500 scale-110 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                                        : 'border-gray-300 dark:border-gray-700'
                                }`}
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleNumberClick(num.toString())}
                                className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 text-2xl font-bold text-gray-800 dark:text-white active:bg-emerald-100 dark:active:bg-emerald-900/30 active:scale-90 transition-all flex items-center justify-center"
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={handleClear}
                            className="w-16 h-16 rounded-full text-gray-500 dark:text-gray-400 font-bold active:scale-90 transition-all flex items-center justify-center"
                        >
                            مسح
                        </button>
                        <button
                            onClick={() => handleNumberClick('0')}
                            className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 text-2xl font-bold text-gray-800 dark:text-white active:bg-emerald-100 dark:active:bg-emerald-900/30 active:scale-90 transition-all flex items-center justify-center"
                        >
                            0
                        </button>
                        <button
                            onClick={onClose}
                            className="w-16 h-16 rounded-full text-red-500 font-bold active:scale-90 transition-all flex items-center justify-center"
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PasscodeModal;
