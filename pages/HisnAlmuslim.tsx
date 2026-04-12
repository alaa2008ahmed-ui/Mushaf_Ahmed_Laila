
import React, { useState, useEffect } from 'react';
import BottomBar from '../components/BottomBar';
import { registerBackInterceptor } from '../hooks/useBackButton';
import HisnHeader from '../components/HisnAlmuslim/HisnHeader';
import CategoryList from '../components/HisnAlmuslim/CategoryList';
import CategoryDetail from '../components/HisnAlmuslim/CategoryDetail';
import ZoomModal from '../components/HisnAlmuslim/ZoomModal';

function HisnAlmuslim({ onBack }) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [zoomedItem, setZoomedItem] = useState(null);

    const openZoomModal = (item) => {
        setZoomedItem(item);
    };

    const closeZoomModal = () => {
        setZoomedItem(null);
    };

    useEffect(() => {
        const interceptor = () => {
            if (zoomedItem) {
                setZoomedItem(null);
                return true;
            } else if (selectedCategory) {
                setSelectedCategory(null);
                return true;
            }
            return false;
        };

        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [selectedCategory, zoomedItem]);

    const handleHomeClick = () => {
        if (selectedCategory) {
            setSelectedCategory(null);
        } else {
            onBack();
        }
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-transparent">
            <HisnHeader 
                title={selectedCategory ? selectedCategory.title : 'حصن المسلم'} 
                subtitle={selectedCategory ? `أذكار ${selectedCategory.title}` : 'استعرض أبواب وأذكار حصن المسلم بسهولة.'} 
            />

            <main className="flex-1 overflow-y-auto hide-scrollbar relative max-w-md mx-auto w-full p-4 pb-24">
                {selectedCategory ? <CategoryDetail selectedCategory={selectedCategory} onZoom={openZoomModal} /> : <CategoryList onSelectCategory={setSelectedCategory} />}
            </main>

            <BottomBar onHomeClick={handleHomeClick} onThemesClick={() => {}} showThemes={false} />

            <ZoomModal zoomedItem={zoomedItem} onClose={closeZoomModal} />
        </div>
    );
}

export default HisnAlmuslim;
