import React, { useState, useEffect } from 'react';

interface MenuItem {
    id: string;
    label: string;
}

interface MenuCustomizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    allItems: MenuItem[];
    visibleIds: string[];
    onSave: (selectedIds: string[]) => void;
    isLandscape?: boolean;
}

const MenuCustomizationModal: React.FC<MenuCustomizationModalProps> = ({ isOpen, onClose, allItems, visibleIds, onSave, isLandscape }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            setSelectedIds(visibleIds);
        }
    }, [isOpen, visibleIds]);

    const handleToggle = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id) 
                : [...prev, id]
        );
    };

    const handleSave = () => {
        onSave(selectedIds);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm ${isLandscape ? 'p-0' : 'p-4'} fade-in`}>
            <div className={`bg-white dark:bg-gray-800 ${isLandscape ? 'max-w-4xl h-full rounded-none' : 'max-w-md rounded-2xl max-h-[80vh]'} shadow-2xl w-full overflow-hidden flex flex-col`}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">تخصيص القائمة الرئيسية</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {allItems.map((item) => (
                        <div 
                            key={item.id}
                            onClick={() => handleToggle(item.id)}
                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                                selectedIds.includes(item.id)
                                    ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                                    : 'bg-gray-50 border-gray-200 dark:bg-gray-700/30 dark:border-gray-700'
                            }`}
                        >
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{item.label}</span>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                selectedIds.includes(item.id)
                                    ? 'bg-emerald-500 border-emerald-500'
                                    : 'border-gray-400 dark:border-gray-500'
                            }`}>
                                {selectedIds.includes(item.id) && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <button 
                        onClick={handleSave}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg transition-transform active:scale-95"
                    >
                        حفظ التغييرات
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MenuCustomizationModal;
