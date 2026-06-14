
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Star } from 'lucide-react';
import moment from 'moment-hijri';
import { useTheme } from '../context/ThemeContext';

const MawlidNotification: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        const checkMawlid = () => {
            const today = moment();
            const isMawlid = today.iMonth() === 2 && today.iDate() === 12; // 12 Rabi' al-Awwal
            
            if (isMawlid) {
                const year = today.iYear();
                const lastShown = localStorage.getItem(`mawlid_shown_${year}`);
                
                if (!lastShown) {
                    setIsOpen(true);
                }
            }
        };

        checkMawlid();
    }, []);

    const handleClose = () => {
        const year = moment().iYear();
        localStorage.setItem(`mawlid_shown_${year}`, 'true');
        setIsOpen(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl"
                        style={{ backgroundColor: theme.bgColor, color: theme.textColor }}
                    >
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 left-0 w-full h-32 opacity-10 pointer-events-none" 
                             style={{ background: `linear-gradient(to bottom, ${theme.palette[0]}, transparent)` }}></div>
                        
                        <div className="p-8 pt-12 flex flex-col items-center text-center relative">
                            <button 
                                onClick={handleClose}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <motion.div
                                animate={{ 
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ 
                                    duration: 4, 
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="mb-6 p-4 rounded-full"
                                style={{ backgroundColor: `${theme.palette[0]}20` }}
                            >
                                <Star size={48} className="text-yellow-500 fill-yellow-500" />
                            </motion.div>

                            <h2 className="text-3xl font-bold mb-4 font-sans" style={{ color: theme.palette[0] }}>
                                مولد الهدى ﷺ
                            </h2>

                            <div className="space-y-6 mb-8">
                                <p className="text-xl italic leading-relaxed font-serif opacity-90">
                                    "وُلِدَ الهُدى فَالكائِناتُ ضِياءُ .. وَفَمُ الزَمانِ تَبَسُّمٌ وَثَناءُ"
                                </p>
                                
                                <div className="h-px w-24 mx-auto opacity-20" style={{ backgroundColor: theme.textColor }}></div>

                                <p className="text-lg leading-relaxed">
                                    نبارك لكم ذكرى مولد خير الأنام، محمد ﷺ. 
                                    <br />
                                    جعل الله أيامكم عامرة بالصلاة والسلام عليه، وأنار قلوبكم بهديه وسنته.
                                </p>
                            </div>

                            <button
                                onClick={handleClose}
                                className="w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-transform active:scale-95"
                                style={{ backgroundColor: theme.palette[0], color: theme.name === 'اسود' ? '#000000' : '#fff' }}
                            >
                                صلّوا عليه وسلّموا تسليماً
                            </button>

                            <div className="mt-6 flex items-center gap-2 opacity-60 text-sm">
                                <Heart size={14} className="fill-current" />
                                <span>كل عام وأنتم بخير</span>
                            </div>
                        </div>

                        {/* Floating Stars Decoration */}
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute pointer-events-none text-yellow-500/30"
                                initial={{ 
                                    top: `${Math.random() * 100}%`, 
                                    left: `${Math.random() * 100}%`,
                                    scale: 0
                                }}
                                animate={{ 
                                    scale: [0, 1, 0],
                                    y: [0, -20, 0]
                                }}
                                transition={{ 
                                    duration: 3 + Math.random() * 2, 
                                    repeat: Infinity,
                                    delay: Math.random() * 2
                                }}
                            >
                                <Star size={12 + Math.random() * 12} fill="currentColor" />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default MawlidNotification;
