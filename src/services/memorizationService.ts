
export interface MemorizedRange {
    id: string;
    fromSurah: number;
    fromAyah: number;
    toSurah: number;
    toAyah: number;
    date: number;
    nextReviewDate: number;
    reviewCount: number;
    readerId: string;
}

const STORAGE_KEY = 'memorized_ranges_v1';

export const memorizationService = {
    getMemorizedRanges: (): MemorizedRange[] => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveRange: (range: Omit<MemorizedRange, 'id' | 'date' | 'nextReviewDate' | 'reviewCount'>) => {
        const ranges = memorizationService.getMemorizedRanges();
        const newRange: MemorizedRange = {
            ...range,
            id: Math.random().toString(36).substr(2, 9),
            date: Date.now(),
            nextReviewDate: Date.now() + 24 * 60 * 60 * 1000, // Next review in 1 day
            reviewCount: 0
        };
        ranges.push(newRange);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ranges));
        return newRange;
    },

    updateReview: (id: string, success: boolean) => {
        const ranges = memorizationService.getMemorizedRanges();
        const index = ranges.findIndex(r => r.id === id);
        if (index !== -1) {
            const range = ranges[index];
            range.reviewCount += 1;
            
            // Simple Spaced Repetition logic (1, 3, 7, 14, 30 days)
            const intervals = [1, 3, 7, 14, 30, 60, 90];
            const nextInterval = intervals[Math.min(range.reviewCount, intervals.length - 1)];
            
            if (success) {
                range.nextReviewDate = Date.now() + nextInterval * 24 * 60 * 60 * 1000;
            } else {
                // If failed, reset or reduce interval
                range.nextReviewDate = Date.now() + 24 * 60 * 60 * 1000;
            }
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(ranges));
        }
    },

    deleteRange: (id: string) => {
        const ranges = memorizationService.getMemorizedRanges().filter(r => r.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ranges));
    }
};
