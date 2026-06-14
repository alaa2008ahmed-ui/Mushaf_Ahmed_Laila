
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../context/ThemeContext';

function WhatsAppButton() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const openWhatsApp = () => {
        const phoneNumber = '966592166023';
        const waWebUrl = `https://wa.me/${phoneNumber}`;
        window.open(waWebUrl, '_blank');
        toggleMenu(); // Close menu after clicking
    };

    const primaryColor = theme.palette[0] || '#10b981';
    const isPrimaryWhite = primaryColor.toLowerCase() === '#ffffff' || primaryColor.toLowerCase() === 'white' || primaryColor.toLowerCase() === 'rgb(255, 255, 255)';

    return (
        <>
            <div id="whatsapp-button-container" className="relative">
                <button
                    onClick={toggleMenu}
                    className="rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110 active:scale-95"
                    style={{
                        width: 'calc(3rem * 0.75)',
                        height: 'calc(3rem * 0.75)',
                        backgroundColor: primaryColor,
                        border: isPrimaryWhite ? '2px solid #ccc' : '2px solid white'
                    }}
                >
                    <svg viewBox="0 0 24 24" style={{ width: 'calc(1.5rem * 0.75)', height: 'calc(1.5rem * 0.75)' }}>
                        <path
                            fill={isPrimaryWhite ? '#000000' : 'white'}
                            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.361.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                        />
                    </svg>
                </button>
            </div>

            {isMenuOpen && mounted && createPortal(
                <div className="whatsapp-portal-root">
                    {/* Full screen backdrop to block all interactions without darkening */}
                    <div 
                        className="fixed inset-0 z-[10000] pointer-events-auto" 
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleMenu();
                        }}
                    />
                    
                    {/* Menu positioned in the middle of the screen */}
                    <div 
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 p-6 w-[280px] z-[10001] font-cairo animate-in zoom-in-95 fade-in duration-300"
                    >
                        <button 
                            onClick={toggleMenu} 
                            className="absolute top-2 left-2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all"
                        >
                            <span className="text-xl font-bold leading-none">×</span>
                        </button>
                        
                        <div className="text-center pt-4 pb-2">
                            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-7 h-7 text-emerald-500" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.361.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-emerald-600 mb-1">للتواصل والاقتراحات</h3>
                            <p className="text-gray-500 text-sm mb-4">علاء أحمد</p>
                            <button
                                className="w-full text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                                style={{ backgroundColor: primaryColor }}
                                onClick={(e) => { e.preventDefault(); openWhatsApp(); }}
                            >
                                <span>تواصل عبر الواتساب</span>
                            </button>
                            <p className="mt-3 text-[10px] text-gray-400" dir="ltr">+966 59 216 6023</p>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

export default WhatsAppButton;
