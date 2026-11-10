import { PRESET_MEMORIZATION_PLANS, MemorizationPlanItem } from '../utils/quranMemorizationUtils';
import { quranData as quranJsonData } from '../utils/quranData';

export type MasteryLevel = 'perfect' | 'good' | 'needs_work';

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
    masteryLevel?: MasteryLevel;
    easeFactor?: number; // SM-2 ease factor (default 2.5)
    intervalDays?: number; // Days until next review
    consecutiveSuccess?: number;
    title?: string;
    totalAyahs?: number;
    isMastered?: boolean; // When confirmed as fully memorized / fixed
}

export interface UserPlanProgress {
    planId: string;
    startedAt: number;
    currentDay: number;
    completedDays: number[];
    isCompleted: boolean;
    lastActiveDate: string; // YYYY-MM-DD
}

export interface MemorizationStats {
    totalRanges: number;
    totalAyahsMemorized: number;
    dueTodayCount: number;
    streakDays: number;
    perfectCount: number;
    goodCount: number;
    needsWorkCount: number;
}

const STORAGE_KEY = 'memorized_ranges_v1';
const PLANS_STORAGE_KEY = 'memorization_user_plans_v1';
const STREAK_KEY = 'memorization_streak_v1';

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

    private calculateAyahCount(fromSurah: number, fromAyah: number, toSurah: number, toAyah: number): number {
        let count = 0;
        for (let s = fromSurah; s <= toSurah; s++) {
            const surah = quranJsonData.surahs[s - 1];
            if (!surah) continue;
            const startA = s === fromSurah ? fromAyah : 1;
            const endA = s === toSurah ? toAyah : surah.ayahs.length;
            count += Math.max(0, endA - startA + 1);
        }
        return count;
    }

    saveRange(range: Omit<MemorizedRange, 'id' | 'timestamp'>): MemorizedRange {
        const ranges = this.getMemorizedRanges();
        
        // Check if range already exists
        const existing = ranges.find(r => 
            r.fromSurah === range.fromSurah && 
            r.fromAyah === range.fromAyah && 
            r.toSurah === range.toSurah && 
            r.toAyah === range.toAyah
        );

        this.recordActivity();

        if (existing) {
            existing.timestamp = Date.now();
            if (range.readerId) existing.readerId = range.readerId;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(ranges));
            return existing;
        }

        const ayahsCount = this.calculateAyahCount(range.fromSurah, range.fromAyah, range.toSurah, range.toAyah);

        const newRange: MemorizedRange = {
            ...range,
            id: Math.random().toString(36).substring(2, 9),
            timestamp: Date.now(),
            lastReviewed: Date.now(),
            nextReviewDate: Date.now() + 24 * 60 * 60 * 1000, // Tomorrow
            reviewCount: 0,
            masteryLevel: range.masteryLevel || 'good',
            easeFactor: 2.5,
            intervalDays: 1,
            consecutiveSuccess: 0,
            totalAyahs: ayahsCount
        };

        ranges.unshift(newRange);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ranges));
        return newRange;
    }

    deleteRange(id: string): void {
        const ranges = this.getMemorizedRanges();
        const filtered = ranges.filter(r => r.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }

    updateReviewStatus(id: string): void {
        this.updateReviewMastery(id, 'perfect');
    }

    toggleMasteryStatus(id: string): MemorizedRange | null {
        const ranges = this.getMemorizedRanges();
        const range = ranges.find(r => r.id === id);
        if (!range) return null;

        range.isMastered = !range.isMastered;
        if (range.isMastered) {
            range.masteryLevel = 'perfect';
            // Extend next review date into the future (30 days) so it doesn't disturb current reviews
            range.nextReviewDate = Date.now() + 30 * 24 * 60 * 60 * 1000;
        } else {
            range.nextReviewDate = Date.now() + 24 * 60 * 60 * 1000;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(ranges));
        this.recordActivity();
        return range;
    }

    /**
     * Enhanced SuperMemo-2 (SM-2) Spaced Repetition Algorithm
     * @param id The range ID
     * @param grade 'perfect' (grade 5) | 'good' (grade 3) | 'needs_work' (grade 1)
     */
    updateReviewMastery(id: string, grade: MasteryLevel): MemorizedRange | null {
        const ranges = this.getMemorizedRanges();
        const range = ranges.find(r => r.id === id);
        if (!range) return null;

        this.recordActivity();

        range.lastReviewed = Date.now();
        range.reviewCount = (range.reviewCount || 0) + 1;
        range.masteryLevel = grade;

        let ease = range.easeFactor || 2.5;
        let consecutive = range.consecutiveSuccess || 0;
        let interval = range.intervalDays || 1;

        if (grade === 'perfect') {
            consecutive += 1;
            ease = Math.min(3.0, ease + 0.15);
            if (consecutive === 1) {
                interval = 2;
            } else if (consecutive === 2) {
                interval = 5;
            } else {
                interval = Math.round(interval * ease);
            }
        } else if (grade === 'good') {
            consecutive += 1;
            if (consecutive === 1) {
                interval = 1;
            } else if (consecutive === 2) {
                interval = 3;
            } else {
                interval = Math.round(interval * 1.4);
            }
        } else {
            // needs_work -> reset consecutive success, review tomorrow!
            consecutive = 0;
            ease = Math.max(1.3, ease - 0.2);
            interval = 1; // 1 day
        }

        range.consecutiveSuccess = consecutive;
        range.easeFactor = ease;
        range.intervalDays = interval;
        range.nextReviewDate = Date.now() + interval * 24 * 60 * 60 * 1000;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(ranges));
        return range;
    }

    // Daily streak management
    recordActivity(): void {
        const todayStr = new Date().toISOString().split('T')[0];
        try {
            const raw = localStorage.getItem(STREAK_KEY);
            let data = raw ? JSON.parse(raw) : { lastDate: '', streak: 0 };
            if (data.lastDate === todayStr) return;

            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            if (data.lastDate === yesterday) {
                data.streak += 1;
            } else {
                data.streak = 1;
            }
            data.lastDate = todayStr;
            localStorage.setItem(STREAK_KEY, JSON.stringify(data));
        } catch (e) {}
    }

    getStreak(): number {
        try {
            const raw = localStorage.getItem(STREAK_KEY);
            if (!raw) return 0;
            const data = JSON.parse(raw);
            const todayStr = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            if (data.lastDate === todayStr || data.lastDate === yesterday) {
                return data.streak || 0;
            }
            return 0;
        } catch (e) {
            return 0;
        }
    }

    // Plans progress
    getUserPlans(): Record<string, UserPlanProgress> {
        try {
            const raw = localStorage.getItem(PLANS_STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    startPlan(planId: string): UserPlanProgress {
        const plans = this.getUserPlans();
        const todayStr = new Date().toISOString().split('T')[0];
        const newProgress: UserPlanProgress = {
            planId,
            startedAt: Date.now(),
            currentDay: 1,
            completedDays: [],
            isCompleted: false,
            lastActiveDate: todayStr
        };
        plans[planId] = newProgress;
        localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
        return newProgress;
    }

    completePlanDay(planId: string, dayNumber: number): UserPlanProgress | null {
        const plans = this.getUserPlans();
        const progress = plans[planId];
        if (!progress) return null;

        if (!progress.completedDays.includes(dayNumber)) {
            progress.completedDays.push(dayNumber);
        }
        progress.lastActiveDate = new Date().toISOString().split('T')[0];
        
        const preset = PRESET_MEMORIZATION_PLANS.find(p => p.id === planId);
        const total = preset?.totalDays || 30;
        if (progress.completedDays.length >= total) {
            progress.isCompleted = true;
        } else {
            progress.currentDay = Math.min(total, Math.max(...progress.completedDays, 0) + 1);
        }

        plans[planId] = progress;
        localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
        this.recordActivity();
        return progress;
    }

    getStats(): MemorizationStats {
        const ranges = this.getMemorizedRanges();
        const now = Date.now();
        let totalAyahs = 0;
        let dueToday = 0;
        let perfect = 0;
        let good = 0;
        let needsWork = 0;

        ranges.forEach(r => {
            totalAyahs += (r.totalAyahs || this.calculateAyahCount(r.fromSurah, r.fromAyah, r.toSurah, r.toAyah));
            if ((r.nextReviewDate || 0) <= now) {
                dueToday++;
            }
            if (r.masteryLevel === 'perfect') perfect++;
            else if (r.masteryLevel === 'needs_work') needsWork++;
            else good++;
        });

        return {
            totalRanges: ranges.length,
            totalAyahsMemorized: totalAyahs,
            dueTodayCount: dueToday,
            streakDays: this.getStreak(),
            perfectCount: perfect,
            goodCount: good,
            needsWorkCount: needsWork
        };
    }
}

export const memorizationService = new MemorizationService();
