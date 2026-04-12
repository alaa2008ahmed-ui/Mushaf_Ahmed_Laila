import React, { useState, useEffect } from 'react';
import BottomBar from '../components/BottomBar';
import { BASE_ADHKAR_MORNING, BASE_ADHKAR_EVENING } from '../data/adkarSabahMasaaData';
import { registerBackInterceptor } from '../hooks/useBackButton';
import AdkarHeader from '../components/AdkarSabahMasaa/AdkarHeader';
import AdkarTabs from '../components/AdkarSabahMasaa/AdkarTabs';
import DhikrCard from '../components/HisnAlmuslim/DhikrCard';
import ZoomModal from '../components/AdkarSabahMasaa/ZoomModal';

const ADHKAR_STATUS_KEY = 'sabah_masaa_status_v1';

function AdkarSabahMasaa({ onBack, onNavigate }) {
    const [adhkarTab, setAdhkarTab] = useState('morning');
    const [adhkarCounts, setAdhkarCounts] = useState({});
    const [zoomedDhikr, setZoomedDhikr] = useState(null);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        try {
            const stored = localStorage.getItem(ADHKAR_STATUS_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                if (data.date === today && data.counts) {
                    setAdhkarCounts(data.counts);
                    return; // Found today's data, no need to initialize
                }
            }
        } catch (e) {
            console.error("Failed to load adhkar status", e);
            // If parsing fails, remove the corrupted item
            localStorage.removeItem(ADHKAR_STATUS_KEY);
        }

        // If no valid data for today, initialize
        const initialCounts = {
            morning: Object.fromEntries(BASE_ADHKAR_MORNING.map((dhikr, i) => [i, dhikr.count])),
            evening: Object.fromEntries(BASE_ADHKAR_EVENING.map((dhikr, i) => [i, dhikr.count]))
        };
        setAdhkarCounts(initialCounts);
    }, []);

    useEffect(() => {
        const interceptor = () => {
            if (zoomedDhikr) {
                setZoomedDhikr(null);
                return true;
            }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [zoomedDhikr]);

    const handleDecrement = (index) => {
        if (zoomedDhikr) return; // Prevent decrementing when zoomed
        const currentTabCounts = adhkarCounts[adhkarTab];
        if (!currentTabCounts || currentTabCounts[index] === 0) {
            return;
        }

        const newCounts = {
            ...adhkarCounts,
            [adhkarTab]: {
                ...adhkarCounts[adhkarTab],
                [index]: currentTabCounts[index] - 1
            }
        };

        setAdhkarCounts(newCounts);

        // Save to localStorage
        const today = new Date().toISOString().split('T')[0];
        try {
            localStorage.setItem(ADHKAR_STATUS_KEY, JSON.stringify({ date: today, counts: newCounts }));
        } catch (e) {
            console.error("Failed to save adhkar status", e);
        }
    };
    
    const currentAdhkar = adhkarTab === 'morning' ? BASE_ADHKAR_MORNING : BASE_ADHKAR_EVENING;

    const openZoomModal = (dhikr) => {
        setZoomedDhikr(dhikr);
    };

    const closeZoomModal = () => {
        setZoomedDhikr(null);
    };

    return (
        <div className="h-screen flex flex-col bg-transparent">
            <AdkarHeader title="أذكار الصباح والمساء" subtitle="تابع أذكـارك اليومية مع عداد تفاعلي وواجهة سهلة" />

            <main className="w-full flex-1 flex flex-col items-center overflow-hidden p-4 pb-24">
                <AdkarTabs adhkarTab={adhkarTab} setAdhkarTab={setAdhkarTab} />
                
                <div className="w-full max-w-lg flex-1 overflow-y-auto hide-scrollbar pb-6 space-y-3">
                    {currentAdhkar.map((dhikr, index) => {
                        const currentCount = adhkarCounts[adhkarTab]?.[index] ?? dhikr.count;
                        const isFinished = currentCount === 0;

                        return (
                             <DhikrCard
                                key={index}
                                dhikr={dhikr}
                                currentCount={currentCount}
                                isFinished={isFinished}
                                onDecrement={() => !isFinished && handleDecrement(index)}
                                onZoom={() => openZoomModal(dhikr)}
                             />
                        );
                    })}
                </div>
            </main>
            
            <BottomBar onHomeClick={() => onNavigate('home')} onThemesClick={() => {}} showThemes={false} />

            <ZoomModal zoomedDhikr={zoomedDhikr} onClose={closeZoomModal} />
        </div>
    );
}

export default AdkarSabahMasaa;