import React, { useCallback } from 'react';

export const useQuranBookmarks = (bookmarks: any[], setBookmarks: React.Dispatch<React.SetStateAction<any[]>>, currentAyah: {s: number, a: number}, modeSuffix: string, showToast: (msg: string) => void) => {
    const saveBookmark = useCallback(() => { 
        if (!currentAyah) { showToast('اختر آية أولاً'); return; } 
        const stored = JSON.parse(localStorage.getItem('quran_bookmarks_list' + modeSuffix) || '[]'); 
        const date = new Date(); 
        const newBookmark = { 
            id: Date.now(), 
            s: currentAyah.s, 
            a: currentAyah.a, 
            date: date.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }), 
            time: date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) 
        }; 
        const newBookmarks = [newBookmark, ...stored]; 
        localStorage.setItem('quran_bookmarks_list' + modeSuffix, JSON.stringify(newBookmarks)); 
        setBookmarks(newBookmarks); 
        showToast(`تم حفظ الإشارة المرجعية`); 
    }, [currentAyah, modeSuffix, setBookmarks, showToast]);

    const deleteBookmark = useCallback((id:number) => { 
        const newBookmarks = bookmarks.filter((b:any) => b.id !== id); 
        localStorage.setItem('quran_bookmarks_list' + modeSuffix, JSON.stringify(newBookmarks)); 
        setBookmarks(newBookmarks); 
    }, [bookmarks, modeSuffix, setBookmarks]);

    return { saveBookmark, deleteBookmark };
};
