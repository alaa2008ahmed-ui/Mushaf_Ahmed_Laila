
export interface MemorizedRange {
    id: string;
    fromSurah: number;
    fromAyah: number;
    toSurah: number;
    toAyah: number;
    readerId: string;
    timestamp: number;
    lastReviewed?: number;
    nextReviewDate?: number;
    reviewCount?: number;
}

const STORAGE_KEY = 'memorized_ranges_v1';

class MemorizationService {
    getMemorizedRanges(): MemorizedRange[] {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return [];
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Failed to parse memorized ranges', e);
            return [];
        }
    }

    saveRange(range: Omit<MemorizedRange, 'id' | 'timestamp'>): MemorizedRange {
        const ranges = this.getMemorizedRanges();
        
        // Check if range already exists to avoid duplicates
        const existing = ranges.find(r => 
            r.fromSurah === range.fromSurah && 
            r.fromAyah === range.fromAyah && 
            r.toSurah === range.toSurah && 
            r.toAyah === range.toAyah
        );

        if (existing) {
            existing.timestamp = Date.now();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(ranges));
            return existing;
        }

        const newRange: MemorizedRange = {
            ...range,
            id: Math.random().toString(36).substring(2, 9),
            timestamp: Date.now(),
            lastReviewed: Date.now(),
            nextReviewDate: Date.now() + 24 * 60 * 60 * 1000,
            reviewCount: 0
        };

        ranges.push(newRange);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ranges));
        return newRange;
    }

    deleteRange(id: string): void {
        const ranges = this.getMemorizedRanges();
        const filtered = ranges.filter(r => r.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }

    updateReviewStatus(id: string): void {
        const ranges = this.getMemorizedRanges();
        const range = ranges.find(r => r.id === id);
        if (range) {
            range.lastReviewed = Date.now();
            range.reviewCount = (range.reviewCount || 0) + 1;
            const intervals = [1, 3, 7, 15, 30];
            const days = intervals[Math.min(range.reviewCount, intervals.length - 1)];
            range.nextReviewDate = Date.now() + days * 24 * 60 * 60 * 1000;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(ranges));
        }
    }
}

export const memorizationService = new MemorizationService();
