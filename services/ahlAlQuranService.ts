import { db } from '../lib/firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, deleteDoc, onSnapshot 
} from 'firebase/firestore';
import { communityService, CommunityUser } from './communityService';
import { gregorianMonths, hijriMonths } from '../data/calendarData';

export type PrivacyMode = 'public' | 'anonymous' | 'hidden';
export type CalendarType = 'gregorian' | 'hijri';

export interface MonthlyReadingStats {
  pages: number;
  khatmas: number;
  lastReadTimestamp: number;
}

export interface AhlAlQuranUserRecord {
  userId: string;
  username: string;
  avatarUrl?: string;
  country?: string;
  accountCode?: string;
  privacyMode: PrivacyMode; // 'public' | 'anonymous' | 'hidden'
  totalLifetimePages: number;
  totalLifetimeKhatmas: number;
  lastReadTimestamp: number;
  // Maps monthKey -> { pages, khatmas, lastReadTimestamp }
  // Gregorian keys: "g_2026-10"
  // Hijri keys: "h_1448-04"
  monthlyStats: Record<string, MonthlyReadingStats>;
}

export interface MonthOption {
  key: string; // e.g. 'g_2026-10' or 'h_1448-04'
  name: string; // e.g. 'أكتوبر 2026' or 'ربيع الآخر 1448 هـ'
  isCurrent: boolean;
}

const STORAGE_KEY_LOCAL_STATS = 'mushaf_ahl_al_quran_cache_v2';
const STORAGE_KEY_PRIVACY = 'mushaf_ahl_al_quran_privacy_pref_v1';
const STORAGE_KEY_WIPE_V2 = 'mushaf_ahl_al_quran_wiped_v2';

class AhlAlQuranService {
  private recordsCache: Map<string, AhlAlQuranUserRecord> = new Map();
  private isListening = false;
  private lastRecordedPage: { page: number; timestamp: number } | null = null;
  private unsubscribeFirestore: (() => void) | null = null;
  private listeners: Set<(records: AhlAlQuranUserRecord[]) => void> = new Set();

  constructor() {
    // One-time total wipe per user request to start leaderboard completely fresh and empty
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('mushaf_ahl_al_quran_cache_v1');
        localStorage.removeItem('mushaf_ahl_al_quran_stats');
        localStorage.removeItem('ahl_al_quran_stats');

        if (!localStorage.getItem(STORAGE_KEY_WIPE_V2)) {
          localStorage.removeItem(STORAGE_KEY_LOCAL_STATS);
          localStorage.setItem(STORAGE_KEY_WIPE_V2, 'true');
        }
      }
    } catch (e) {}

    this.loadFromLocalStorage();
    this.initFirestoreListener();
    this.setupCommunityListeners();
  }

  private setupCommunityListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('community_user_deleted', (e: any) => {
      const deletedId = e.detail?.userId;
      if (deletedId) {
        this.deleteUserStatsLocally(deletedId);
      }
    });

    window.addEventListener('community_user_updated', () => {
      this.cleanupDeletedUsers();
    });
  }

  // --- Hijri & Gregorian Date Utilities ---

  public getHijriDateDetails(date: Date = new Date()) {
    try {
      const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      });
      const parts = formatter.formatToParts(date);
      const find = (type: string) => parts.find(p => p.type === type)?.value || '0';
      
      const day = parseInt(find('day'), 10) || 1;
      const month = parseInt(find('month'), 10) || 1;
      const year = parseInt(find('year'), 10) || 1448;
      const monthName = hijriMonths[month - 1]?.name || 'شهر هجري';

      return { day, month, year, monthName };
    } catch (e) {
      return { day: 1, month: 4, year: 1448, monthName: 'ربيع الآخر' };
    }
  }

  public getCurrentGregorianKey(date: Date = new Date()): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `g_${y}-${m}`;
  }

  public getCurrentHijriKey(date: Date = new Date()): string {
    const { year, month } = this.getHijriDateDetails(date);
    return `h_${year}-${String(month).padStart(2, '0')}`;
  }

  public getGregorianMonthName(key: string): string {
    // format: g_YYYY-MM
    const clean = key.replace('g_', '');
    const [yStr, mStr] = clean.split('-');
    const m = parseInt(mStr, 10);
    const mName = gregorianMonths.find(gm => gm.id === m)?.name || mStr;
    return `${mName} ${yStr}م`;
  }

  public getHijriMonthName(key: string): string {
    // format: h_YYYY-MM
    const clean = key.replace('h_', '');
    const [yStr, mStr] = clean.split('-');
    const m = parseInt(mStr, 10);
    const mName = hijriMonths[m - 1]?.name || mStr;
    return `${mName} ${yStr}هـ`;
  }

  /**
   * Generates a list of available months (current + past 11 archived months)
   */
  public getAvailableMonths(type: CalendarType): MonthOption[] {
    const options: MonthOption[] = [];
    const now = new Date();

    if (type === 'gregorian') {
      const currentKey = this.getCurrentGregorianKey(now);
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = this.getCurrentGregorianKey(d);
        options.push({
          key,
          name: this.getGregorianMonthName(key),
          isCurrent: key === currentKey
        });
      }
    } else {
      const currentKey = this.getCurrentHijriKey(now);
      const currentHijri = this.getHijriDateDetails(now);
      
      let curYear = currentHijri.year;
      let curMonth = currentHijri.month;

      for (let i = 0; i < 12; i++) {
        const key = `h_${curYear}-${String(curMonth).padStart(2, '0')}`;
        options.push({
          key,
          name: this.getHijriMonthName(key),
          isCurrent: key === currentKey
        });

        curMonth -= 1;
        if (curMonth < 1) {
          curMonth = 12;
          curYear -= 1;
        }
      }
    }

    return options;
  }

  // --- Formatting Ajza and Pages (as specified in prompt) ---
  /**
   * وتظهر كعدد صفحات اولا واذا زادت عن عدد صفحات جزء يتم كتابه جزء وعدد الصفحات الباقيه
   * بحيث يتم دائما احتساب عدد الصفحات وتقسيمها على عدد صفحات الجزء لتحويل النتيجه الى اجزاء
   * مثال: قام مستخدم بقراءة 30 صفحه مثلا فيظهر بالتصنيف كـ: جزء و10 صفحات.
   */
  public formatAjzaAndPages(pages: number): {
    summaryText: string;
    ajza: number;
    remainingPages: number;
    fullDetail: string;
  } {
    const safePages = Math.max(0, Math.floor(pages || 0));
    const PAGES_PER_JUZ = 20; // 20 standard pages per Juz' in standard Madinah Mushaf (604 pages total)
    const ajza = Math.floor(safePages / PAGES_PER_JUZ);
    const remainingPages = safePages % PAGES_PER_JUZ;

    if (safePages === 0) {
      return {
        summaryText: 'لم يبدأ بعد',
        ajza: 0,
        remainingPages: 0,
        fullDetail: '0 صفحة'
      };
    }

    if (safePages < PAGES_PER_JUZ) {
      const pageWord = safePages === 1 ? 'صفحة واحدة' : safePages === 2 ? 'صفحتان' : safePages <= 10 ? `${safePages} صفحات` : `${safePages} صفحة`;
      return {
        summaryText: pageWord,
        ajza: 0,
        remainingPages: safePages,
        fullDetail: pageWord
      };
    }

    // Format Juz' string in Arabic
    let ajzaWord = '';
    if (ajza === 1) {
      ajzaWord = 'جزء';
    } else if (ajza === 2) {
      ajzaWord = 'جزآن';
    } else if (ajza >= 3 && ajza <= 10) {
      ajzaWord = `${ajza} أجزاء`;
    } else {
      ajzaWord = `${ajza} جزءاً`;
    }

    // Format Remaining Pages in Arabic
    let remWord = '';
    if (remainingPages === 1) {
      remWord = 'وصفحة واحدة';
    } else if (remainingPages === 2) {
      remWord = 'وصفحتان';
    } else if (remainingPages >= 3 && remainingPages <= 10) {
      remWord = `و${remainingPages} صفحات`;
    } else if (remainingPages > 10) {
      remWord = `و${remainingPages} صفحة`;
    }

    const summaryText = remWord ? `${ajzaWord} ${remWord}` : ajzaWord;
    const fullDetail = `${summaryText} (${safePages} صفحة)`;

    return {
      summaryText,
      ajza,
      remainingPages,
      fullDetail
    };
  }

  // --- User Registration & Privacy ---

  public isUserRegistered(): boolean {
    const cur = communityService.getCurrentUser();
    return !!(cur && cur.userId);
  }

  public getCurrentUserPrivacy(): PrivacyMode {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRIVACY);
      if (saved === 'public' || saved === 'anonymous' || saved === 'hidden') {
        return saved;
      }
    } catch (e) {}

    const cur = communityService.getCurrentUser();
    if (cur?.userId && this.recordsCache.has(cur.userId)) {
      return this.recordsCache.get(cur.userId)!.privacyMode || 'public';
    }
    return 'public';
  }

  public async setPrivacyMode(mode: PrivacyMode): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY_PRIVACY, mode);
    } catch (e) {}

    const cur = communityService.getCurrentUser();
    if (!cur?.userId) return;

    const record = this.getOrCreateRecord(cur.userId, cur.username || 'قارئ المصحف', cur.avatarUrl, cur.country, cur.accountCode);
    record.privacyMode = mode;
    this.recordsCache.set(cur.userId, record);
    this.saveToLocalStorage();
    this.notifyListeners();

    try {
      await setDoc(doc(db, 'ahl_al_quran_stats', cur.userId), record, { merge: true });
    } catch (e) {
      console.warn('Failed to save privacy mode to Firestore:', e);
    }
  }

  // --- Reading Progress Recording ---

  /**
   * Validates if a page reading qualifies according to:
   * 1. Not fast skimming: Must spend at least MIN_PAGE_READ_SECONDS (8s) on the page
   * 2. Auto-scrolling: Accepted at all normal speeds (from 3 mins per juz)
   */
  public async validateAndRecordPage(
    pageNumber: number,
    durationSeconds: number,
    options: {
      isAutoScroll?: boolean;
      scrollMinutes?: number;
      isPlayingAudio?: boolean;
    } = {}
  ): Promise<{ success: boolean; reason?: string }> {
    if (!pageNumber || pageNumber < 1 || pageNumber > 604) {
      return { success: false, reason: 'رقم صفحة غير صالح' };
    }

    const cur = communityService.getCurrentUser();
    if (!cur?.userId) {
      return { success: false, reason: 'المستخدم غير متاح' };
    }

    const { isAutoScroll = false, scrollMinutes = 20, isPlayingAudio = false } = options;

    // Condition 1: If auto-scrolling, reject excessive speed (< 3 minutes per juz)
    if (isAutoScroll && scrollMinutes < 3 && !isPlayingAudio) {
      return { success: false, reason: 'سرعة التمرير التلقائي كبيرة جداً ولا تُعتمد' };
    }

    // Condition 2: Minimum dwell time on page (reject rapid manual flipping/skimming)
    // 8 seconds minimum allows genuine tadabbur, normal recitation, and auto-scroll
    const MIN_PAGE_READ_SECONDS = 8;
    if (durationSeconds < MIN_PAGE_READ_SECONDS && !isPlayingAudio) {
      return { success: false, reason: 'تمرير سريع للصفحة أقل من الحد الأدنى للقراءة' };
    }

    // Qualified! Record the page
    await this.recordPageRead(pageNumber);
    return { success: true };
  }

  /**
   * Called by QuranReader when the user reads/views a page
   */
  public async recordPageRead(pageNumber: number): Promise<void> {
    if (!pageNumber || pageNumber < 1 || pageNumber > 604) return;

    const cur = communityService.getCurrentUser();
    if (!cur?.userId) return;

    const now = Date.now();
    // Debounce: prevent registering the exact same page within 4 seconds
    if (
      this.lastRecordedPage &&
      this.lastRecordedPage.page === pageNumber &&
      now - this.lastRecordedPage.timestamp < 4000
    ) {
      return;
    }
    this.lastRecordedPage = { page: pageNumber, timestamp: now };

    const gKey = this.getCurrentGregorianKey();
    const hKey = this.getCurrentHijriKey();

    const record = this.getOrCreateRecord(cur.userId, cur.username || 'قارئ المصحف', cur.avatarUrl, cur.country, cur.accountCode);

    // Update Gregorian
    if (!record.monthlyStats[gKey]) {
      record.monthlyStats[gKey] = { pages: 0, khatmas: 0, lastReadTimestamp: now };
    }
    record.monthlyStats[gKey].pages += 1;
    if (record.monthlyStats[gKey].pages > 0 && record.monthlyStats[gKey].pages % 604 === 0) {
      record.monthlyStats[gKey].khatmas += 1;
    }
    record.monthlyStats[gKey].lastReadTimestamp = now;

    // Update Hijri
    if (!record.monthlyStats[hKey]) {
      record.monthlyStats[hKey] = { pages: 0, khatmas: 0, lastReadTimestamp: now };
    }
    record.monthlyStats[hKey].pages += 1;
    if (record.monthlyStats[hKey].pages > 0 && record.monthlyStats[hKey].pages % 604 === 0) {
      record.monthlyStats[hKey].khatmas += 1;
    }
    record.monthlyStats[hKey].lastReadTimestamp = now;

    // Lifetime
    record.totalLifetimePages += 1;
    if (record.totalLifetimePages > 0 && record.totalLifetimePages % 604 === 0) {
      record.totalLifetimeKhatmas += 1;
    }
    record.lastReadTimestamp = now;

    this.recordsCache.set(cur.userId, record);
    this.saveToLocalStorage();
    this.notifyListeners();

    try {
      window.dispatchEvent(new CustomEvent('ahl_al_quran_page_recorded', {
        detail: { pageNumber, totalPages: record.totalLifetimePages }
      }));
    } catch (e) {}

    // Async save to Firestore (debounced in background)
    this.syncRecordToFirestore(cur.userId, record);
  }

  /**
   * Called when a user completes a Khatma (604 pages or clicks completed khatma)
   */
  public async recordKhatmaCompleted(): Promise<void> {
    if (!this.isUserRegistered()) return;
    const cur = communityService.getCurrentUser();
    if (!cur?.userId) return;

    const now = Date.now();
    const gKey = this.getCurrentGregorianKey();
    const hKey = this.getCurrentHijriKey();

    const record = this.getOrCreateRecord(cur.userId, cur.username, cur.avatarUrl, cur.country, cur.accountCode);

    if (!record.monthlyStats[gKey]) {
      record.monthlyStats[gKey] = { pages: 0, khatmas: 0, lastReadTimestamp: now };
    }
    record.monthlyStats[gKey].khatmas += 1;
    record.monthlyStats[gKey].lastReadTimestamp = now;

    if (!record.monthlyStats[hKey]) {
      record.monthlyStats[hKey] = { pages: 0, khatmas: 0, lastReadTimestamp: now };
    }
    record.monthlyStats[hKey].khatmas += 1;
    record.monthlyStats[hKey].lastReadTimestamp = now;

    record.totalLifetimeKhatmas += 1;
    record.lastReadTimestamp = now;

    this.recordsCache.set(cur.userId, record);
    this.saveToLocalStorage();
    this.notifyListeners();

    this.syncRecordToFirestore(cur.userId, record);
  }

  // --- Leaderboard Queries ---

  /**
   * Retrieves and ranks users for a given monthKey or all-time
   */
  public getLeaderboard(
    monthKey: string,
    currentUserId?: string
  ): {
    rank: number;
    record: AhlAlQuranUserRecord;
    displayName: string;
    displayAvatar?: string;
    pages: number;
    khatmas: number;
    formattedProgress: {
      summaryText: string;
      ajza: number;
      remainingPages: number;
      fullDetail: string;
    };
    isCurrentUser: boolean;
    isAnonymous: boolean;
  }[] {
    const curUser = communityService.getCurrentUser();
    const isCurSetup = communityService.isProfileSetup();

    const results: Array<{
      record: AhlAlQuranUserRecord;
      displayName: string;
      displayAvatar?: string;
      pages: number;
      khatmas: number;
      isCurrentUser: boolean;
      isAnonymous: boolean;
    }> = [];

    for (const [uid, record] of Array.from(this.recordsCache.entries())) {
      const isCur = currentUserId === uid;
      
      // CRITICAL REQUIREMENT:
      // When a user is deleted from the community, and they were in the ranking,
      // they MUST be automatically removed from the ranking because their account no longer exists.
      const userProfile = communityService.getUserById(uid);
      const isCurValid = isCur && isCurSetup && !!curUser?.userId;

      if (!userProfile && !isCurValid) {
        // User account does not exist in community anymore - purge from cache
        this.recordsCache.delete(uid);
        continue;
      }

      // 1. Privacy filter: Hidden users do not appear unless it's the current user themselves viewing
      if (record.privacyMode === 'hidden' && !isCur) {
        continue;
      }

      // 2. Stats for the given monthKey
      let pages = 0;
      let khatmas = 0;

      if (monthKey === 'lifetime') {
        pages = record.totalLifetimePages || 0;
        khatmas = record.totalLifetimeKhatmas || 0;
      } else if (record.monthlyStats && record.monthlyStats[monthKey]) {
        pages = record.monthlyStats[monthKey].pages || 0;
        khatmas = record.monthlyStats[monthKey].khatmas || 0;
      }

      // Even if 0 pages, if current user, show them so they know their status
      if (pages === 0 && khatmas === 0 && !isCur) {
        continue;
      }

      const isAnon = record.privacyMode === 'anonymous' && !isCur;
      const displayName = isAnon 
        ? 'فاعل خير (قارئ للقرآن)' 
        : (userProfile?.username || (isCur ? (curUser?.username || 'قارئ المصحف (أنت)') : record.username || 'قارئ المصحف'));
      const displayAvatar = isAnon ? undefined : (userProfile?.avatarUrl || (isCur ? curUser?.avatarUrl : record.avatarUrl));

      results.push({
        record,
        displayName,
        displayAvatar,
        pages,
        khatmas,
        isCurrentUser: isCur,
        isAnonymous: isAnon
      });
    }

    // Sort: First by Khatmas descending, then by Pages descending
    results.sort((a, b) => {
      if (b.khatmas !== a.khatmas) {
        return b.khatmas - a.khatmas;
      }
      return b.pages - a.pages;
    });

    return results.map((item, index) => ({
      ...item,
      rank: index + 1,
      formattedProgress: this.formatAjzaAndPages(item.pages)
    }));
  }

  /**
   * Retrieves the current user's active rank in Ahl Al-Quran if it exists.
   * A rank exists if the user has an account, is not hidden, and has recorded reading (pages > 0 || khatmas > 0).
   * Checks current month first; falls back to lifetime ranking if they have lifetime progress.
   */
  public getCurrentUserRank(): {
    rank: number;
    pages: number;
    khatmas: number;
    monthKey: string;
  } | null {
    const cur = communityService.getCurrentUser();
    if (!cur?.userId) return null;

    const privacy = this.getCurrentUserPrivacy();
    if (privacy === 'hidden') return null;

    let calType: CalendarType = 'hijri';
    try {
      const saved = localStorage.getItem('ahl_al_quran_calendar_type');
      if (saved === 'hijri' || saved === 'gregorian') calType = saved as CalendarType;
    } catch (e) {}

    const curMonthKey = calType === 'hijri' ? this.getCurrentHijriKey() : this.getCurrentGregorianKey();

    // 1. Check current month first
    const currentMonthBoard = this.getLeaderboard(curMonthKey, cur.userId);
    const userEntryMonth = currentMonthBoard.find(item => item.isCurrentUser);

    if (userEntryMonth && (userEntryMonth.pages > 0 || userEntryMonth.khatmas > 0)) {
      return {
        rank: userEntryMonth.rank,
        pages: userEntryMonth.pages,
        khatmas: userEntryMonth.khatmas,
        monthKey: curMonthKey
      };
    }

    // 2. If no progress in current month, check lifetime
    const lifetimeBoard = this.getLeaderboard('lifetime', cur.userId);
    const userEntryLifetime = lifetimeBoard.find(item => item.isCurrentUser);

    if (userEntryLifetime && (userEntryLifetime.pages > 0 || userEntryLifetime.khatmas > 0)) {
      return {
        rank: userEntryLifetime.rank,
        pages: userEntryLifetime.pages,
        khatmas: userEntryLifetime.khatmas,
        monthKey: 'lifetime'
      };
    }

    return null;
  }

  // --- User deletion & ranking cleanup methods ---

  public deleteUserStatsLocally(userId: string): void {
    if (!userId) return;
    if (this.recordsCache.has(userId)) {
      this.recordsCache.delete(userId);
      this.saveToLocalStorage();
      this.notifyListeners();
    }
  }

  public async deleteUserStats(userId: string): Promise<void> {
    if (!userId) return;
    this.deleteUserStatsLocally(userId);
    try {
      await deleteDoc(doc(db, 'ahl_al_quran_stats', userId));
    } catch (e) {
      console.warn('Error deleting ahl_al_quran_stats for user in Firestore:', e);
    }
  }

  public cleanupDeletedUsers(): void {
    let changed = false;
    const cur = communityService.getCurrentUser();
    const isCurSetup = communityService.isProfileSetup();

    for (const uid of Array.from(this.recordsCache.keys())) {
      const existsInCommunity = !!communityService.getUserById(uid) || (uid === cur?.userId && isCurSetup);
      if (!existsInCommunity) {
        this.recordsCache.delete(uid);
        changed = true;
      }
    }

    if (changed) {
      this.saveToLocalStorage();
      this.notifyListeners();
      try {
        window.dispatchEvent(new CustomEvent('ahl_al_quran_updated'));
      } catch (e) {}
    }
  }

  public async resetAllRankings(): Promise<void> {
    this.recordsCache.clear();
    this.saveToLocalStorage();
    this.notifyListeners();
    try {
      const snapshot = await getDocs(collection(db, 'ahl_al_quran_stats'));
      const deletes = snapshot.docs.map(d => deleteDoc(doc(db, 'ahl_al_quran_stats', d.id)));
      await Promise.all(deletes);
    } catch (e) {
      console.warn('Error resetting all rankings:', e);
    }
    try {
      window.dispatchEvent(new CustomEvent('ahl_al_quran_updated'));
    } catch (e) {}
  }

  // --- Firestore Integration & Real-time Listeners ---

  private getOrCreateRecord(
    userId: string,
    username: string,
    avatarUrl?: string,
    country?: string,
    accountCode?: string
  ): AhlAlQuranUserRecord {
    const existing = this.recordsCache.get(userId);
    if (existing) {
      if (username) existing.username = username;
      if (avatarUrl) existing.avatarUrl = avatarUrl;
      if (country) existing.country = country;
      if (accountCode) existing.accountCode = accountCode;
      return existing;
    }

    const savedPrivacy = this.getCurrentUserPrivacy();
    const newRecord: AhlAlQuranUserRecord = {
      userId,
      username: username || 'قارئ',
      avatarUrl,
      country: country || 'مصر 🇪🇬',
      accountCode,
      privacyMode: savedPrivacy,
      totalLifetimePages: 0,
      totalLifetimeKhatmas: 0,
      lastReadTimestamp: Date.now(),
      monthlyStats: {}
    };
    this.recordsCache.set(userId, newRecord);
    return newRecord;
  }

  private async syncRecordToFirestore(userId: string, record: AhlAlQuranUserRecord): Promise<void> {
    try {
      await setDoc(doc(db, 'ahl_al_quran_stats', userId), record, { merge: true });
    } catch (e) {
      // Quietly log
      console.warn('Sync ahl_al_quran_stats error:', e);
    }
  }

  private initFirestoreListener() {
    if (this.isListening) return;
    this.isListening = true;

    try {
      this.unsubscribeFirestore = onSnapshot(collection(db, 'ahl_al_quran_stats'), (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data() as AhlAlQuranUserRecord;
          const uid = data?.userId || change.doc.id;
          if (uid) {
            if (change.type === 'removed') {
              this.recordsCache.delete(uid);
            } else {
              // Ensure user account actually exists in the community before caching
              const userProfile = communityService.getUserById(uid);
              const curUid = communityService.getCurrentUser()?.userId;
              if (userProfile || (uid === curUid && communityService.isProfileSetup())) {
                this.recordsCache.set(uid, {
                  ...data,
                  userId: uid,
                  monthlyStats: data.monthlyStats || {}
                });
              } else {
                this.recordsCache.delete(uid);
              }
            }
          }
        });
        this.saveToLocalStorage();
        this.notifyListeners();
      }, (err) => {
        console.warn('Firestore onSnapshot error for ahl_al_quran_stats:', err);
      });
    } catch (e) {
      console.warn('Failed to attach ahl_al_quran_stats listener:', e);
    }
  }

  public subscribe(listener: (records: AhlAlQuranUserRecord[]) => void): () => void {
    this.listeners.add(listener);
    listener(Array.from(this.recordsCache.values()));
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const list = Array.from(this.recordsCache.values());
    this.listeners.forEach(fn => fn(list));
  }

  private loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LOCAL_STATS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((rec: AhlAlQuranUserRecord) => {
            if (rec && rec.userId) {
              this.recordsCache.set(rec.userId, rec);
            }
          });
        }
      }
    } catch (e) {}
  }

  private saveToLocalStorage() {
    try {
      const list = Array.from(this.recordsCache.values());
      localStorage.setItem(STORAGE_KEY_LOCAL_STATS, JSON.stringify(list));
    } catch (e) {}
  }
}

export const ahlAlQuranService = new AhlAlQuranService();

/**
 * Returns color styling for user rank number:
 * - 1st: Gold (#D4AF37)
 * - 2nd: Silver (#94A3B8)
 * - 3rd: Bronze (#CD7F32)
 * - Any other: Black (#000000)
 */
export const getAhlAlQuranRankColor = (rank: number): {
  textColor: string;
  borderColor: string;
  bg: string;
  shadowColor: string;
} => {
  if (rank === 1) {
    return {
      textColor: '#D4AF37', // ذهبي
      borderColor: '#D4AF37',
      bg: '#FFFFFF',
      shadowColor: 'rgba(212, 175, 55, 0.4)'
    };
  }
  if (rank === 2) {
    return {
      textColor: '#94A3B8', // فضي
      borderColor: '#94A3B8',
      bg: '#FFFFFF',
      shadowColor: 'rgba(148, 163, 184, 0.4)'
    };
  }
  if (rank === 3) {
    return {
      textColor: '#CD7F32', // برونزي
      borderColor: '#CD7F32',
      bg: '#FFFFFF',
      shadowColor: 'rgba(205, 127, 50, 0.4)'
    };
  }
  return {
    textColor: '#000000', // أسود
    borderColor: '#000000',
    bg: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.25)'
  };
};

