import { db } from '../lib/firebase';
import { 
  collection, doc, setDoc, getDoc, getDocs, onSnapshot, 
  updateDoc, deleteDoc, writeBatch, query, where 
} from 'firebase/firestore';
import { SUPPORT_AVATAR_BASE64 } from '../src/supportAvatarBase64';
import { checkContentModeration } from '../utils/contentModerator';

export interface QuranVerseAttachment {
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  fromAyah?: number;
  toAyah?: number;
  text: string;
  audioUrl?: string;
  shareType?: 'text' | 'image' | 'page' | 'audio';
  pageNumber?: number;
  fullPageText?: string;
  reciterName?: string;
  bgValue?: string;
  bgType?: string;
  bgText?: string;
  border?: string;
  accent?: string;
  frameType?: string;
  frameColor?: string;
  textColor?: string;
  fontSize?: number;
  fontClass?: string;
  fontFamily?: string;
  customNote?: string;
}

export interface CommunityUser {
  userId: string;
  accountCode?: string;
  passcode?: string;
  username: string;
  avatarUrl?: string;
  country: string;
  bio?: string;
  email?: string;
  isGoogleAuth?: boolean;
  isOnline: boolean;
  lastSeen?: string;
  createdAt: string;
  typingToUserId?: string;
}

export interface ChatAttachment {
  type: 'image' | 'video' | 'file';
  url: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface ChatMessage {
  messageId: string;
  chatId: string;
  senderId: string;
  recipientId: string;
  targetRecipientId?: string;
  text: string;
  verseData?: QuranVerseAttachment;
  audioUrl?: string;
  attachment?: ChatAttachment;
  isRead: boolean;
  isViolationReport?: boolean;
  isBroadcast?: boolean;
  broadcastBatchId?: string;
  createdAt: string;
}

export interface ChatConversation {
  chatId: string;
  partner: CommunityUser;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export interface BlockRecord {
  blockerId: string;
  blockedId: string;
  createdAt: string;
}

export const ADMIN_USER_ID = 'usr_admin_official';
export const ADMIN_USER: CommunityUser = {
  userId: ADMIN_USER_ID,
  username: 'الدعم الفني',
  accountCode: 'ADMIN-OFFICIAL',
  country: 'الإدارة 🛡️',
  bio: 'أهلاً بك! تواصل معنا هنا في حال مواجهة أي مشكلة بالتطبيق.',
  avatarUrl: SUPPORT_AVATAR_BASE64,
  isOnline: true,
  createdAt: new Date('2026-01-01').toISOString()
};

export type ContactRequestStatus = 'none' | 'pending' | 'accepted' | 'rejected';

export interface ServerContact {
  contactId?: string;
  userId: string;
  partnerId: string;
  status?: ContactRequestStatus;
  introMessage?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GroupChat {
  groupId: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  createdBy: string;
  creatorName?: string;
  members: string[];
  memberCount?: number;
  invitedMembers?: string[];
  rejectedMembers?: string[];
  leftMembers?: string[];
  memberExitTimes?: { [userId: string]: string };
  lastMessage?: string;
  lastMessageSenderName?: string;
  lastMessageTime?: string;
  createdAt: string;
  isPublic?: boolean;
}

export interface GroupMessage {
  messageId: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string;
  senderCountry?: string;
  text: string;
  verseData?: QuranVerseAttachment;
  audioUrl?: string;
  audioDuration?: number;
  attachment?: ChatAttachment;
  createdAt: string;
}

const STORAGE_KEY_USER = 'mushaf_community_current_user_v9';
const STORAGE_KEY_USERS_ALL = 'mushaf_community_global_users_v9';
const STORAGE_KEY_MESSAGES = 'mushaf_community_messages_v9';
const STORAGE_KEY_BLOCKS = 'mushaf_community_blocks_v9';
const STORAGE_KEY_CONTACTS = 'mushaf_community_contacts_v9';
const STORAGE_KEY_GROUPS = 'mushaf_community_groups_v9';
const STORAGE_KEY_GROUP_MESSAGES = 'mushaf_community_group_messages_v9';
const STORAGE_KEY_HIDDEN_GROUPS = 'mushaf_community_hidden_groups_v9';
const STORAGE_KEY_GROUP_EXIT_TIMES = 'mushaf_community_group_exit_times_v9';

class CommunityService {
  private currentUser: CommunityUser | null = null;
  private usersMap: Map<string, CommunityUser> = new Map();
  private messagesList: ChatMessage[] = [];
  private allServerMessagesMap: Map<string, ChatMessage> = new Map();
  private blocksList: BlockRecord[] = [];
  private serverContactsList: ServerContact[] = [];
  private groupsList: GroupChat[] = [];
  private groupMessagesList: GroupMessage[] = [];
  private hiddenGroupsSet: Set<string> = new Set();
  private groupExitTimesMap: Map<string, string> = new Map();
  private pollInterval: any = null;
  private heartbeatInterval: any = null;

  constructor() {
    this.initCurrentUser();
    this.loadFromLocalStorage();
    this.purgeLegacyGoogleData();
    this.setupFirestoreListeners();
    this.setupPresenceLifecycle();
    this.fetchLatestUsers();
    this.fetchLatestGroups();
    this.fetchLatestGroupMessages();
    this.startPolling();
  }

  public isLegacyGoogleUser(u?: any): boolean {
    if (!u) return false;
    // Never filter out real users or valid registered accounts
    return false;
  }

  public async purgeLegacyGoogleData() {
    try {
      // 1. Remove legacy localStorage keys from prior versions
      if (typeof localStorage !== 'undefined') {
        const legacyKeys = [
          'mushaf_community_global_users_v8',
          'mushaf_community_current_user_v8',
          'mushaf_community_global_users_v7',
          'mushaf_community_current_user_v7',
          'mushaf_community_global_users',
          'mushaf_community_current_user',
          'mushaf_community_user',
          'quran_community_user',
          'google_user_token'
        ];
        legacyKeys.forEach(k => {
          try { localStorage.removeItem(k); } catch (e) {}
        });
      }

      // 2. Remove legacy users from in-memory map & delete from Firestore
      for (const [uid, user] of Array.from(this.usersMap.entries())) {
        if (this.isLegacyGoogleUser(user)) {
          this.usersMap.delete(uid);
          try {
            deleteDoc(doc(db, 'users', uid)).catch(() => {});
          } catch (e) {}
        }
      }

      // 3. Reset current user if legacy Google user
      if (this.currentUser && this.isLegacyGoogleUser(this.currentUser)) {
        localStorage.removeItem(STORAGE_KEY_USER);
        this.currentUser = null;
        this.initCurrentUser();
      }

      this.saveToLocalStorage();
    } catch (e) {
      console.warn('Purge legacy google data error:', e);
    }
  }

  private cleanPayload(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
      const val = obj[key];
      if (val !== undefined) {
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          cleaned[key] = this.cleanPayload(val);
        } else {
          cleaned[key] = val;
        }
      }
    });
    return cleaned;
  }

  private notifyIncomingMessage(msg: ChatMessage, sender: CommunityUser) {
    // 1. Dispatch in-app visual notification event (strictly inside the app only)
    try {
      window.dispatchEvent(
        new CustomEvent('community_inapp_notification', {
          detail: { message: msg, sender }
        })
      );
    } catch (e) {}

    // 2. In-App Audio alert (while app is open)
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {}
  }

  public generateAccountCode(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `MQ-${code}`;
  }

  public initCurrentUser(): CommunityUser {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      if (stored) {
        const u = JSON.parse(stored);
        if (u && u.userId) {
          if (!u.accountCode) {
            u.accountCode = this.generateAccountCode();
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(u));
          }
          this.currentUser = u;
          this.usersMap.set(u.userId, u);
          return this.currentUser!;
        }
      }
    } catch (e) {}

    const randomId = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
    this.currentUser = {
      userId: randomId,
      accountCode: this.generateAccountCode(),
      username: '',
      country: '',
      bio: '',
      avatarUrl: '',
      isOnline: true,
      createdAt: new Date().toISOString()
    };
    return this.currentUser;
  }

  public getCurrentUser(): CommunityUser {
    if (!this.currentUser) {
      return this.initCurrentUser();
    }
    return this.currentUser;
  }

  public normalizeDigits(str?: string): string {
    if (!str) return '';
    return str
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
      .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
      .trim();
  }

  public normalizeUsernameForMatch(str?: string): string {
    if (!str) return '';
    return str
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
      .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
      .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/[ىي]/g, 'ي')
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }

  public normalizeArabicText(str?: string): string {
    return this.normalizeUsernameForMatch(str);
  }

  public async restoreAccount(codeOrUsername: string, inputPasscode?: string): Promise<CommunityUser> {
    const rawInput = (codeOrUsername || '').trim();
    if (!rawInput) {
      throw new Error('يرجى إدخال كود الحساب (مثل MQ-XXXXX) أو اسم المستخدم بالكامل');
    }

    // 1. Gather all registered users from Firestore and in-memory cache
    const candidateMap = new Map<string, CommunityUser>();

    // Add cached users from local memory
    for (const [uid, u] of this.usersMap.entries()) {
      if (u && u.userId && u.userId !== ADMIN_USER_ID) {
        candidateMap.set(uid, u);
      }
    }

    // Also load from localStorage in case of cached offline data
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USERS_ALL);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((u: CommunityUser) => {
            if (u && u.userId && u.userId !== ADMIN_USER_ID && !candidateMap.has(u.userId)) {
              candidateMap.set(u.userId, u);
            }
          });
        }
      }
    } catch (e) {}

    // Fetch fresh snapshot from Firestore to guarantee we have every registered user
    try {
      const snap = await getDocs(collection(db, 'users'));
      for (const docSnap of snap.docs) {
        const u = docSnap.data() as CommunityUser;
        const uid = u.userId || docSnap.id;
        if (uid !== ADMIN_USER_ID) {
          const fullUser = { ...u, userId: uid };
          candidateMap.set(uid, fullUser);
          this.usersMap.set(uid, fullUser);
        }
      }
    } catch (e: any) {
      console.warn('Firestore fetch during restore:', e);
      if (candidateMap.size === 0) {
        throw new Error('تعذر الاتصال بقاعدة البيانات. يرجى التأكد من اتصال الإنترنت.');
      }
    }

    const allCandidates = Array.from(candidateMap.values());

    // 2. Prepare normalized representations
    const cleanInputPasscode = this.normalizeDigits(inputPasscode);

    const cleanCodeUpper = this.normalizeDigits(rawInput).toUpperCase().replace(/\s+/g, '');
    const cleanCodeNoMQ = cleanCodeUpper.replace(/^MQ-?/i, '');

    // Full exact username normalization (with single space between words)
    const normQuerySingleSpace = this.normalizeUsernameForMatch(rawInput);
    // No-spaces normalization (for compound words like "عبد الله" vs "عبدالله")
    const normQueryNoSpaces = normQuerySingleSpace.replace(/\s+/g, '');

    // 3. Search for candidates with strict priority
    // Priority 1: Exact Account Code Match (e.g. MQ-XXXXX or XXXXX)
    const accountCodeMatches = allCandidates.filter(u => {
      const uCode = (u.accountCode || '').toUpperCase().replace(/\s+/g, '');
      const uCodeNoMQ = uCode.replace(/^MQ-?/i, '');
      return Boolean(
        (uCode && cleanCodeUpper && uCode === cleanCodeUpper) ||
        (uCodeNoMQ && cleanCodeNoMQ && uCodeNoMQ.length >= 3 && uCodeNoMQ === cleanCodeNoMQ)
      );
    });

    // Priority 2: Exact User ID Match
    const userIdMatches = allCandidates.filter(u => {
      return u.userId && u.userId.trim() === rawInput;
    });

    // Priority 3: Exact Full Username Match
    // CRITICAL: The entire name must match exactly.
    // NEVER use substring .includes() so that:
    // - "علاء احمد" matches only "علاء احمد" and NEVER matches "علاء"
    // - "علاء" matches only "علاء" and NEVER matches "علاء احمد" or "علاء الدين"
    // - Compound / multi-part names of any length match completely and reliably.
    const usernameMatches = allCandidates.filter(u => {
      if (!u.username || !u.username.trim()) return false;
      const uNameSingle = this.normalizeUsernameForMatch(u.username);
      const uNameNoSpace = uNameSingle.replace(/\s+/g, '');

      return (
        uNameSingle === normQuerySingleSpace || 
        uNameNoSpace === normQueryNoSpaces
      );
    });

    let targetMatches: CommunityUser[] = [];
    if (accountCodeMatches.length > 0) {
      targetMatches = accountCodeMatches;
    } else if (userIdMatches.length > 0) {
      targetMatches = userIdMatches;
    } else {
      targetMatches = usernameMatches;
    }

    if (targetMatches.length === 0) {
      throw new Error('لم يتم العثور على أي حساب بهذا الاسم أو الكود. تأكد من كتابة الاسم كاملاً وبشكل صحيح أو استخدام كود الحساب.');
    }

    // 4. Resolve candidate with Passcode / PIN verification
    let foundUser: CommunityUser | null = null;

    if (cleanInputPasscode) {
      // If user entered a PIN passcode, look for candidate account whose passcode matches
      const pinMatched = targetMatches.find(u => {
        const storedPin = this.normalizeDigits(u.passcode);
        return storedPin && storedPin === cleanInputPasscode;
      });

      if (pinMatched) {
        foundUser = pinMatched;
      } else {
        // If candidate accounts have a passcode set and none matched the entered PIN
        const anyHasPasscode = targetMatches.some(u => Boolean(this.normalizeDigits(u.passcode)));
        if (anyHasPasscode) {
          throw new Error('رمز الحماية (PIN) غير صحيح لهذا الحساب.');
        } else {
          // If none of the candidate accounts have a passcode set, pick the most active/recent
          foundUser = targetMatches.sort((a, b) => 
            new Date(b.lastSeen || b.createdAt || 0).getTime() - new Date(a.lastSeen || a.createdAt || 0).getTime()
          )[0];
        }
      }
    } else {
      // User did NOT enter a PIN passcode
      const protectedAccounts = targetMatches.filter(u => Boolean(this.normalizeDigits(u.passcode)));
      const unprotectedAccounts = targetMatches.filter(u => !this.normalizeDigits(u.passcode));

      if (protectedAccounts.length > 0 && unprotectedAccounts.length === 0) {
        throw new Error('هذا الحساب محمي برمز مرور (PIN). يرجى إدخال رمز المرور للمتابعة.');
      } else if (unprotectedAccounts.length > 0) {
        // Pick the most recent unprotected account
        foundUser = unprotectedAccounts.sort((a, b) => 
          new Date(b.lastSeen || b.createdAt || 0).getTime() - new Date(a.lastSeen || a.createdAt || 0).getTime()
        )[0];
      } else {
        foundUser = targetMatches.sort((a, b) => 
          new Date(b.lastSeen || b.createdAt || 0).getTime() - new Date(a.lastSeen || a.createdAt || 0).getTime()
        )[0];
      }
    }

    if (!foundUser) {
      throw new Error('لم يتم العثور على أي حساب مطابق.');
    }

    // Activate restored user session
    const nowIso = new Date().toISOString();
    foundUser.isOnline = true;
    foundUser.lastSeen = nowIso;
    if (!foundUser.country || !foundUser.country.trim()) {
      foundUser.country = 'دولة أخرى 🌍';
    }
    if (!foundUser.avatarUrl || !foundUser.avatarUrl.trim()) {
      foundUser.avatarUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
    }
    if (!foundUser.accountCode) {
      foundUser.accountCode = this.generateAccountCode();
    }

    this.currentUser = foundUser;
    this.usersMap.set(foundUser.userId, foundUser);

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(foundUser));
    this.saveToLocalStorage();

    // Mark online in Firestore
    try {
      await updateDoc(doc(db, 'users', foundUser.userId), {
        isOnline: true,
        lastSeen: nowIso
      });
    } catch (e) {
      try {
        await setDoc(doc(db, 'users', foundUser.userId), this.cleanPayload(foundUser), { merge: true });
      } catch (err) {}
    }

    // Fetch messages for restored user
    this.fetchLatestMessages().catch(() => {});

    window.dispatchEvent(new CustomEvent('community_user_updated', { detail: foundUser }));
    window.dispatchEvent(new CustomEvent('community_messages_updated'));
    this.sendHeartbeat();

    return foundUser;
  }

  public logoutAccount() {
    const userToSignOut = this.currentUser;
    if (userToSignOut && userToSignOut.userId) {
      updateDoc(doc(db, 'users', userToSignOut.userId), {
        isOnline: false,
        lastSeen: new Date().toISOString()
      }).catch(() => {});
    }

    localStorage.removeItem(STORAGE_KEY_USER);
    this.currentUser = null;
    const freshUser = this.initCurrentUser();
    window.dispatchEvent(new CustomEvent('community_user_updated', { detail: freshUser }));
    window.dispatchEvent(new CustomEvent('community_messages_updated'));
  }

  private setupPresenceLifecycle() {
    if (typeof window === 'undefined') return;

    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    // Send heartbeat every 15 seconds while app is open
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 15000);

    // Initial heartbeat on boot
    this.sendHeartbeat();

    // 1. Web visibilitychange - offline when minimized or hidden, online when visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.sendHeartbeat();
      } else {
        this.setOfflineStatusSync();
      }
    });

    // 2. Window focus & blur
    window.addEventListener('focus', () => {
      this.sendHeartbeat();
    });

    window.addEventListener('blur', () => {
      // Don't mark offline on simple blur, let visibilitychange handle it
    });

    // 3. Unload & pagehide
    window.addEventListener('beforeunload', () => {
      this.setOfflineStatusSync();
    });

    window.addEventListener('pagehide', () => {
      this.setOfflineStatusSync();
    });

    // 4. Native Capacitor Android app state listener
    try {
      import('@capacitor/app').then(({ App }) => {
        App.addListener('appStateChange', (state) => {
          if (state.isActive) {
            this.sendHeartbeat();
          } else {
            this.setOfflineStatusSync();
          }
        }).catch(() => {});
      }).catch(() => {});
    } catch (e) {}
  }

  public getUserById(userId: string): CommunityUser | undefined {
    if (userId === ADMIN_USER_ID) return ADMIN_USER;
    return this.usersMap.get(userId);
  }

  public async sendHeartbeat() {
    const user = this.currentUser;
    if (!user || !user.userId || !this.isProfileComplete()) return;
    const nowIso = new Date().toISOString();
    user.isOnline = true;
    user.lastSeen = nowIso;
    this.usersMap.set(user.userId, user);

    try {
      await updateDoc(doc(db, 'users', user.userId), {
        isOnline: true,
        lastSeen: nowIso
      });
    } catch (e) {
      try {
        await setDoc(doc(db, 'users', user.userId), {
          isOnline: true,
          lastSeen: nowIso
        }, { merge: true });
      } catch (err) {}
    }
  }

  public async setOfflineStatusSync() {
    const user = this.currentUser;
    if (!user || !user.userId || !this.isProfileComplete()) return;
    const nowIso = new Date().toISOString();
    user.isOnline = false;
    user.lastSeen = nowIso;
    this.usersMap.set(user.userId, user);

    try {
      await updateDoc(doc(db, 'users', user.userId), {
        isOnline: false,
        lastSeen: nowIso
      });
    } catch (e) {
      try {
        await setDoc(doc(db, 'users', user.userId), {
          isOnline: false,
          lastSeen: nowIso
        }, { merge: true });
      } catch (err) {}
    }
  }

  public async updateLastSeen() {
    const user = this.currentUser;
    if (!user || !user.userId || !this.isProfileComplete()) return;
    const nowIso = new Date().toISOString();
    user.lastSeen = nowIso;
    try {
      await updateDoc(doc(db, 'users', user.userId), {
        lastSeen: nowIso
      });
    } catch (e) {}
  }

  public isUserOnline(user?: CommunityUser | null): boolean {
    if (!user) return false;
    // Current user viewing the app is online
    if (this.currentUser && user.userId === this.currentUser.userId) return true;

    // If explicitly marked as not online, they are offline immediately
    if (user.isOnline !== true) return false;
    if (!user.lastSeen) return false;

    const lastSeenTime = new Date(user.lastSeen).getTime();
    if (isNaN(lastSeenTime)) return false;

    // Heartbeat is sent every 15s. A user is online if heartbeat was within last 70 seconds
    const diffSeconds = (Date.now() - lastSeenTime) / 1000;
    return diffSeconds >= -70 && diffSeconds <= 70;
  }

  public getUserStatusText(user?: CommunityUser | null): string {
    if (!user) return 'غير متصل';
    if (this.isUserOnline(user)) return 'متصل الآن';

    if (!user.lastSeen) return 'غير متصل';
    const lastSeenTime = new Date(user.lastSeen).getTime();
    if (isNaN(lastSeenTime)) return 'غير متصل';

    const diffSeconds = Math.max(0, Math.floor((Date.now() - lastSeenTime) / 1000));
    if (diffSeconds < 60) return 'متوقف منذ لحظات';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `متوقف منذ ${diffMinutes} د`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `متوقف منذ ${diffHours} س`;
    const diffDays = Math.floor(diffHours / 24);
    return `متوقف منذ ${diffDays} يوم`;
  }

  public isProfileComplete(): boolean {
    const user = this.getCurrentUser();
    return Boolean(
      user &&
      user.username && user.username.trim().length >= 2
    );
  }

  public isProfileSetup(): boolean {
    return this.isProfileComplete();
  }

  public async saveCurrentUser(
    username: string, 
    country: string = 'دولة أخرى 🌍', 
    bio?: string, 
    avatarUrl?: string,
    passcode?: string
  ): Promise<CommunityUser> {
    const user = this.getCurrentUser();
    user.username = username.trim();
    user.country = country && country.trim() ? country.trim() : 'دولة أخرى 🌍';
    if (bio !== undefined) user.bio = bio;
    
    // Fallback safe avatar if empty or oversized
    let safeAvatar = avatarUrl && avatarUrl.trim() ? avatarUrl.trim() : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
    if (safeAvatar.length > 250000) {
      // If unexpectedly huge data URI, replace with clean preset
      safeAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
    }
    user.avatarUrl = safeAvatar;

    if (passcode !== undefined) {
      user.passcode = this.normalizeDigits(passcode);
    }
    if (!user.accountCode) {
      user.accountCode = this.generateAccountCode();
    }
    user.isOnline = true;
    user.lastSeen = new Date().toISOString();

    this.currentUser = user;
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      this.usersMap.set(user.userId, user);
      
      const payload = this.cleanPayload(user);
      await setDoc(doc(db, 'users', user.userId), payload, { merge: true });

      this.saveToLocalStorage();
      window.dispatchEvent(new CustomEvent('community_user_updated', { detail: user }));
    } catch (e: any) {
      console.error('Error saving user to Firestore:', e);
      throw new Error(e?.message || 'تعذر حفظ البيانات على الخادم، يرجى التأكد من اتصال الإنترنت.');
    }

    return user;
  }

  public async createNewAccount(
    username: string, 
    country: string = 'دولة أخرى 🌍', 
    bio?: string, 
    avatarUrl?: string,
    passcode?: string
  ): Promise<CommunityUser> {
    const randomId = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
    const newCode = this.generateAccountCode();

    let safeAvatar = avatarUrl && avatarUrl.trim() ? avatarUrl.trim() : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
    if (safeAvatar.length > 250000) {
      safeAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
    }

    const newUser: CommunityUser = {
      userId: randomId,
      accountCode: newCode,
      username: username.trim(),
      country: country && country.trim() ? country.trim() : 'دولة أخرى 🌍',
      bio: bio || '',
      avatarUrl: safeAvatar,
      passcode: this.normalizeDigits(passcode),
      isOnline: true,
      lastSeen: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    this.currentUser = newUser;
    this.usersMap.set(newUser.userId, newUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));

    try {
      const payload = this.cleanPayload(newUser);
      await setDoc(doc(db, 'users', newUser.userId), payload, { merge: true });

      this.saveToLocalStorage();
      this.sendHeartbeat();
      window.dispatchEvent(new CustomEvent('community_user_updated', { detail: newUser }));
    } catch (e: any) {
      console.error('Error creating new account in Firestore:', e);
      throw new Error(e?.message || 'تعذر إنشاء الحساب على الخادم، يرجى التأكد من اتصال الإنترنت.');
    }

    return newUser;
  }

  private loadFromLocalStorage() {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEY_USERS_ALL);
      if (storedUsers) {
        const arr: CommunityUser[] = JSON.parse(storedUsers);
        arr.forEach(u => {
          if (u && u.userId && !this.isLegacyGoogleUser(u) && u.userId !== ADMIN_USER_ID) {
            this.usersMap.set(u.userId, u);
          }
        });
      }
      this.usersMap.set(ADMIN_USER_ID, ADMIN_USER);

      const storedMsgs = localStorage.getItem(STORAGE_KEY_MESSAGES);
      if (storedMsgs) {
        const parsed: ChatMessage[] = JSON.parse(storedMsgs);
        this.messagesList = parsed.filter(m => !this.isViolationReportMessage(m));
      }

      const storedBlocks = localStorage.getItem(STORAGE_KEY_BLOCKS);
      if (storedBlocks) {
        this.blocksList = JSON.parse(storedBlocks);
      }

      const storedContacts = localStorage.getItem(STORAGE_KEY_CONTACTS);
      if (storedContacts) {
        this.serverContactsList = JSON.parse(storedContacts);
      }

      const storedGroups = localStorage.getItem(STORAGE_KEY_GROUPS);
      if (storedGroups) {
        const parsed = JSON.parse(storedGroups);
        this.groupsList = Array.isArray(parsed) ? parsed : [];
      }
      this.ensureStarterGroupsExist();

      const storedGroupMsgs = localStorage.getItem(STORAGE_KEY_GROUP_MESSAGES);
      if (storedGroupMsgs) {
        this.groupMessagesList = JSON.parse(storedGroupMsgs);
      }

      const storedHidden = localStorage.getItem(STORAGE_KEY_HIDDEN_GROUPS);
      if (storedHidden) {
        try {
          this.hiddenGroupsSet = new Set(JSON.parse(storedHidden));
        } catch (e) {}
      }

      const storedExitTimes = localStorage.getItem(STORAGE_KEY_GROUP_EXIT_TIMES);
      if (storedExitTimes) {
        try {
          const parsed = JSON.parse(storedExitTimes);
          this.groupExitTimesMap = new Map(Object.entries(parsed));
        } catch (e) {}
      }
    } catch (e) {}
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_USERS_ALL, JSON.stringify(Array.from(this.usersMap.values())));
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(this.messagesList));
      localStorage.setItem(STORAGE_KEY_BLOCKS, JSON.stringify(this.blocksList));
      localStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(this.serverContactsList));
      localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(this.groupsList));
      localStorage.setItem(STORAGE_KEY_GROUP_MESSAGES, JSON.stringify(this.groupMessagesList));
      localStorage.setItem(STORAGE_KEY_HIDDEN_GROUPS, JSON.stringify(Array.from(this.hiddenGroupsSet)));
      const exitObj: Record<string, string> = {};
      this.groupExitTimesMap.forEach((v, k) => { exitObj[k] = v; });
      localStorage.setItem(STORAGE_KEY_GROUP_EXIT_TIMES, JSON.stringify(exitObj));
    } catch (e) {}
  }

  private activeTab: 'users' | 'chats' | 'community' | 'blocked' = 'users';

  public hasUserAnyConversations(): boolean {
    const current = this.getCurrentUser();
    if (!current || !current.userId) return false;

    return this.messagesList.some(m => 
      (m.senderId === current.userId || m.recipientId === current.userId) &&
      !this.isViolationReportMessage(m)
    );
  }

  public getDefaultTab(): 'users' | 'chats' {
    return this.hasUserAnyConversations() ? 'chats' : 'users';
  }

  public getActiveTab(): 'users' | 'chats' | 'community' | 'blocked' {
    if (this.activeTab && ['users', 'chats', 'community', 'blocked'].includes(this.activeTab)) {
      return this.activeTab;
    }
    try {
      const saved = (sessionStorage.getItem('community_active_tab') || localStorage.getItem('community_active_tab')) as any;
      if (saved && ['users', 'chats', 'community', 'blocked'].includes(saved)) {
        return saved;
      }
    } catch (e) {}
    return this.getDefaultTab();
  }

  public setActiveTab(tab: 'users' | 'chats' | 'community' | 'blocked') {
    this.activeTab = tab;
    try {
      sessionStorage.setItem('community_active_tab', tab);
      localStorage.setItem('community_active_tab', tab);
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('community_tab_changed', { detail: { tab } }));
  }

  public async clearAllServerData() {
    try {
      // 1. Delete all users from Firestore
      const usersSnap = await getDocs(collection(db, 'users'));
      const userDeletes = usersSnap.docs.map((d) => deleteDoc(doc(db, 'users', d.id)));
      await Promise.all(userDeletes);

      // 2. Delete all messages from Firestore
      const msgsSnap = await getDocs(collection(db, 'messages'));
      const msgDeletes = msgsSnap.docs.map((d) => deleteDoc(doc(db, 'messages', d.id)));
      await Promise.all(msgDeletes);

      // 3. Delete all blocks from Firestore
      const blocksSnap = await getDocs(collection(db, 'blocks'));
      const blockDeletes = blocksSnap.docs.map((d) => deleteDoc(doc(db, 'blocks', d.id)));
      await Promise.all(blockDeletes);

      // Delete all contacts from Firestore
      try {
        const contactsSnap = await getDocs(collection(db, 'contacts'));
        const contactDeletes = contactsSnap.docs.map((d) => deleteDoc(doc(db, 'contacts', d.id)));
        await Promise.all(contactDeletes);
      } catch (e) {}

      // Delete all ahl_al_quran_stats from Firestore
      try {
        const ahlSnap = await getDocs(collection(db, 'ahl_al_quran_stats'));
        const ahlDeletes = ahlSnap.docs.map((d) => deleteDoc(doc(db, 'ahl_al_quran_stats', d.id)));
        await Promise.all(ahlDeletes);
      } catch (e) {}

      // 4. Clear local memory and storage completely
      this.usersMap.clear();
      this.messagesList = [];
      this.blocksList = [];
      this.serverContactsList = [];

      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_USERS_ALL);
      localStorage.removeItem(STORAGE_KEY_MESSAGES);
      localStorage.removeItem(STORAGE_KEY_BLOCKS);
      localStorage.removeItem(STORAGE_KEY_CONTACTS);

      // Reset current user object
      this.currentUser = {
        userId: 'usr_' + Math.random().toString(36).substr(2, 9),
        accountCode: this.generateAccountCode(),
        username: '',
        country: '',
        bio: '',
        avatarUrl: '',
        isOnline: true,
        createdAt: new Date().toISOString()
      };

      this.saveToLocalStorage();
      window.dispatchEvent(new CustomEvent('community_user_updated'));
      window.dispatchEvent(new CustomEvent('community_messages_updated'));
      window.dispatchEvent(new CustomEvent('community_block_updated'));
    } catch (e) {
      console.error('Error clearing all server data:', e);
    }
  }

  public async purgeExpiredServerMessages() {
    try {
      const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago for regular peer messages only
      const snapshot = await getDocs(collection(db, 'messages'));
      snapshot.forEach((docSnap) => {
        const msg = docSnap.data() as ChatMessage;
        if (msg && msg.createdAt) {
          // ALWAYS preserve support messages, violation reports, and broadcast announcements permanently on server!
          const isPermanentServerMessage = (
            msg.senderId === ADMIN_USER_ID ||
            msg.recipientId === ADMIN_USER_ID ||
            msg.isViolationReport ||
            msg.isBroadcast ||
            msg.messageId?.startsWith('msg_report_') ||
            msg.text?.includes('[بلاغ آلي - محتوى محظور]')
          );
          if (isPermanentServerMessage) {
            return; // Never auto-delete from server
          }

          const msgTime = new Date(msg.createdAt).getTime();
          if (!isNaN(msgTime) && msgTime < cutoffTime) {
            deleteDoc(doc(db, 'messages', docSnap.id)).catch(() => {});
          }
        }
      });
    } catch (e) {
      console.warn('Error purging expired messages:', e);
    }
  }

  private startPolling() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    // Initial light fetch of contacts once on boot
    this.fetchLatestContacts();

    // Background expiration cleanup after startup, then run once every 15 minutes
    setTimeout(() => {
      this.purgeExpiredServerMessages();
    }, 6000);

    // Light background sync interval (every 45s) for presence/heartbeat
    this.pollInterval = setInterval(() => {
      this.sendHeartbeat();
      // Periodically clean expired messages every ~15 minutes
      if (Math.random() < 0.05) {
        this.purgeExpiredServerMessages();
      }
    }, 45000);
  }

  public async fetchLatestUsers(): Promise<CommunityUser[]> {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const activeIds = new Set<string>();

      // Inject official Admin user
      activeIds.add(ADMIN_USER_ID);
      this.usersMap.set(ADMIN_USER_ID, ADMIN_USER);

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as CommunityUser;
        const uid = data?.userId || docSnap.id;
        if (data && uid && data.username && data.username.trim() && uid !== ADMIN_USER_ID) {
          activeIds.add(uid);
          this.usersMap.set(uid, {
            ...data,
            userId: uid
          });
        }
      });

      // Check if current user was deleted from Firestore (and is not Admin or empty profile)
      const currentUid = this.currentUser?.userId;
      if (currentUid && currentUid !== ADMIN_USER_ID && this.isProfileSetup()) {
        const currentUserExistsOnServer = activeIds.has(currentUid);
        if (!currentUserExistsOnServer && snapshot.size > 0) {
          console.warn('Current user was deleted from Firestore. Force resetting account...');
          this.logoutAccount();
          return Array.from(this.usersMap.values());
        }
      }

      // Remove stale users that are no longer in Firestore (except admin)
      for (const id of Array.from(this.usersMap.keys())) {
        if (!activeIds.has(id) && id !== ADMIN_USER_ID) {
          if (id === currentUid) {
            this.logoutAccount();
          }
          this.usersMap.delete(id);
          window.dispatchEvent(new CustomEvent('community_user_deleted', { detail: { userId: id } }));
        }
      }

      // Ensure current user is in usersMap only if they still exist in activeIds or if activeIds is empty (offline)
      if (this.currentUser && this.currentUser.userId && this.currentUser.username && this.currentUser.username.trim()) {
        if (activeIds.has(this.currentUser.userId) || snapshot.empty) {
          this.usersMap.set(this.currentUser.userId, this.currentUser);
        }
      }

      this.saveToLocalStorage();
      window.dispatchEvent(new CustomEvent('community_user_updated'));
    } catch (e) {
      console.warn('Firestore fetch users:', e);
    }
    return Array.from(this.usersMap.values());
  }

  public async fetchLatestMessages(): Promise<ChatMessage[]> {
    try {
      const myId = this.getCurrentUser().userId;
      const cutoffTime = Date.now() - (24 * 60 * 60 * 1000);
      const snapshot = await getDocs(collection(db, 'messages'));
      snapshot.forEach((docSnap) => {
        const msg = docSnap.data() as ChatMessage;
        if (msg && msg.messageId) {
          const msgTime = new Date(msg.createdAt).getTime();
          if (!isNaN(msgTime) && msgTime < cutoffTime) {
            deleteDoc(doc(db, 'messages', docSnap.id)).catch(() => {});
            return;
          }

          if (msg.recipientId === myId || msg.senderId === myId) {
            // Never pull automated violation reports into regular user accounts
            if (this.isViolationReportMessage(msg) && myId !== ADMIN_USER_ID) {
              return;
            }

            const exists = this.messagesList.some(m => m.messageId === msg.messageId);
            if (!exists) {
              this.messagesList.push(msg);
            } else {
              const idx = this.messagesList.findIndex(m => m.messageId === msg.messageId);
              if (idx >= 0) this.messagesList[idx] = msg;
            }

            // Save chatted user contact on server to keep history of who spoke with whom
            this.saveChattedUser(msg.senderId, msg.recipientId);
            this.saveChattedUser(msg.recipientId, msg.senderId);
          }
        }
      });
      this.saveToLocalStorage();
      window.dispatchEvent(new CustomEvent('community_messages_updated'));
    } catch (e) {
      console.warn('Firestore fetch messages:', e);
    }
    return this.messagesList;
  }

  public async saveChattedUser(userId: string, partnerId: string) {
    if (!userId || !partnerId || userId === partnerId) return;
    try {
      const existing = this.serverContactsList.find(c => 
        (c.userId === userId && c.partnerId === partnerId) ||
        (c.userId === partnerId && c.partnerId === userId)
      );
      if (existing) return;

      const sorted = [userId, partnerId].sort();
      const contactId = `contact_${sorted[0]}_${sorted[1]}`;
      await setDoc(doc(db, 'contacts', contactId), {
        userId,
        partnerId,
        status: 'accepted',
        createdAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Error saving contact to firestore:', e);
    }
  }

  public async fetchLatestContacts() {
    try {
      const current = this.getCurrentUser();
      if (!current || !current.userId) return;
      const snapshot = await getDocs(collection(db, 'contacts'));
      const list: ServerContact[] = [];
      snapshot.forEach((docSnap) => {
        const c = docSnap.data() as ServerContact;
        if (c && c.userId && c.partnerId) {
          list.push({
            contactId: docSnap.id,
            ...c,
            status: c.status || 'accepted'
          });
        }
      });
      this.serverContactsList = list;
      this.saveToLocalStorage();
      window.dispatchEvent(new CustomEvent('community_messages_updated'));
      window.dispatchEvent(new CustomEvent('community_contacts_updated'));
    } catch (e) {
      console.warn('Error fetching server contacts:', e);
    }
  }

  private setupFirestoreListeners() {
    try {
      onSnapshot(collection(db, 'users'), (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'removed') {
            this.usersMap.delete(change.doc.id);
            window.dispatchEvent(new CustomEvent('community_user_deleted', { detail: { userId: change.doc.id } }));
          }
        });

        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as CommunityUser;
          const uid = data?.userId || docSnap.id;
          if (data && uid && data.username && data.username.trim()) {
            this.usersMap.set(uid, {
              ...data,
              userId: uid
            });
          }
        });
        this.saveToLocalStorage();
        window.dispatchEvent(new CustomEvent('community_user_updated'));
      }, (err) => console.warn('Firestore Users Listener:', err));
    } catch (e) {}

    try {
      onSnapshot(collection(db, 'messages'), (snapshot) => {
        const myId = this.getCurrentUser().userId;

        snapshot.docChanges().forEach((change) => {
          const msg = change.doc.data() as ChatMessage;
          const msgId = msg?.messageId || change.doc.id;

          if (change.type === 'removed') {
            this.allServerMessagesMap.delete(msgId);
            this.messagesList = this.messagesList.filter(m => m.messageId !== msgId);
            return;
          }

          if (msg && msgId) {
            this.allServerMessagesMap.set(msgId, { ...msg, messageId: msgId });
          }

          if (msg && msg.messageId) {
            if (change.type === 'added') {
              if (msg.recipientId === myId || msg.senderId === myId) {
                const exists = this.messagesList.some(m => m.messageId === msg.messageId);
                if (!exists) {
                  this.messagesList.push(msg);
                  if (msg.recipientId === myId && !msg.isRead) {
                    const sender = this.usersMap.get(msg.senderId) || {
                      userId: msg.senderId,
                      username: 'مستخدم المصحف',
                      country: 'غير محدد',
                      isOnline: true,
                      createdAt: new Date().toISOString()
                    };
                    this.notifyIncomingMessage(msg, sender);
                  }
                }

                // Save chatted user contact on server to keep history of who spoke with whom
                this.saveChattedUser(msg.senderId, msg.recipientId);
                this.saveChattedUser(msg.recipientId, msg.senderId);
              }
            } else if (change.type === 'modified') {
              const idx = this.messagesList.findIndex(m => m.messageId === msg.messageId);
              if (idx >= 0) this.messagesList[idx] = msg;
            }
          }
        });
        this.saveToLocalStorage();
        window.dispatchEvent(new CustomEvent('community_messages_updated'));
      }, (err) => console.warn('Firestore Messages Listener:', err));
    } catch (e) {}

    try {
      onSnapshot(collection(db, 'blocks'), (snapshot) => {
        const newBlocks: BlockRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as BlockRecord;
          if (data && data.blockerId) newBlocks.push(data);
        });
        this.blocksList = newBlocks;
        this.saveToLocalStorage();
        window.dispatchEvent(new CustomEvent('community_block_updated'));
      }, (err) => console.warn('Firestore Blocks Listener:', err));
    } catch (e) {}

    try {
      onSnapshot(collection(db, 'contacts'), (snapshot) => {
        const list: ServerContact[] = [];
        snapshot.forEach((docSnap) => {
          const c = docSnap.data() as ServerContact;
          if (c && c.userId && c.partnerId) {
            list.push({
              contactId: docSnap.id,
              ...c,
              status: c.status || 'accepted'
            });
          }
        });
        this.serverContactsList = list;
        this.saveToLocalStorage();
        window.dispatchEvent(new CustomEvent('community_messages_updated'));
        window.dispatchEvent(new CustomEvent('community_contacts_updated'));
      }, (err) => console.warn('Firestore Contacts Listener:', err));
    } catch (e) {}

    try {
      onSnapshot(collection(db, 'group_chats'), (snapshot) => {
        const list: GroupChat[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as GroupChat;
          if (data && (data.groupId || docSnap.id)) {
            list.push({ ...data, groupId: data.groupId || docSnap.id });
          }
        });
        const map = new Map<string, GroupChat>();
        this.getDefaultStarterGroups().forEach(g => map.set(g.groupId, g));
        list.forEach(g => map.set(g.groupId, g));
        this.groupsList = Array.from(map.values());
        this.saveToLocalStorage();
        window.dispatchEvent(new CustomEvent('community_groups_updated'));
      }, (err) => console.warn('Firestore Group Chats Listener:', err));
    } catch (e) {}

    try {
      onSnapshot(collection(db, 'group_messages'), (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const msg = change.doc.data() as GroupMessage;
          const msgId = msg?.messageId || change.doc.id;
          if (change.type === 'removed') {
            this.groupMessagesList = this.groupMessagesList.filter(m => m.messageId !== msgId);
          } else if (msg && msgId) {
            const cleanMsg = { ...msg, messageId: msgId };
            const idx = this.groupMessagesList.findIndex(m => m.messageId === msgId);
            if (idx >= 0) {
              this.groupMessagesList[idx] = cleanMsg;
            } else {
              this.groupMessagesList.push(cleanMsg);
            }
          }
        });
        this.saveToLocalStorage();
        window.dispatchEvent(new CustomEvent('community_group_messages_updated'));
      }, (err) => console.warn('Firestore Group Messages Listener:', err));
    } catch (e) {}
  }

  public async setTypingStatus(partnerUserId: string, isTyping: boolean) {
    const user = this.getCurrentUser();
    user.typingToUserId = isTyping ? partnerUserId : undefined;
    this.usersMap.set(user.userId, user);

    try {
      await updateDoc(doc(db, 'users', user.userId), {
        typingToUserId: isTyping ? partnerUserId : null
      });
    } catch (e) {}
  }

  public getBlocks(): BlockRecord[] {
    return this.blocksList;
  }

  public isBlockedMutually(otherUserId: string): boolean {
    const current = this.getCurrentUser();
    return this.blocksList.some(
      b => (b.blockerId === current.userId && b.blockedId === otherUserId) ||
           (b.blockerId === otherUserId && b.blockedId === current.userId)
    );
  }

  public isSelf(user?: CommunityUser | null): boolean {
    if (!user) return false;
    const current = this.getCurrentUser();
    return Boolean(
      (user.userId && current.userId && user.userId === current.userId) ||
      (current.accountCode && user.accountCode && user.accountCode.toUpperCase() === current.accountCode.toUpperCase())
    );
  }

  public getOtherUsersCount(): number {
    const current = this.getCurrentUser();
    return Array.from(this.usersMap.values()).filter(u => 
      !this.isLegacyGoogleUser(u) && 
      u.username && 
      u.username.trim().length > 0 && 
      u.userId !== ADMIN_USER_ID &&
      (!current || u.userId !== current.userId)
    ).length;
  }

  public getTotalRegisteredCount(): number {
    return this.getOtherUsersCount();
  }

  public getAllUsers(): CommunityUser[] {
    return Array.from(this.usersMap.values()).filter(u => 
      u && u.userId && u.username && u.username.trim() && u.userId !== ADMIN_USER_ID
    );
  }

  public getVisibleUsers(searchQuery: string = '', includeSelf: boolean = false): CommunityUser[] {
    const current = this.getCurrentUser();
    const queryLower = searchQuery.trim().toLowerCase();

    // Ensure current user is in usersMap if they have a valid username
    if (current && current.userId && current.username && current.username.trim()) {
      this.usersMap.set(current.userId, current);
    }

    const allUsersArray = Array.from(this.usersMap.values());

    return allUsersArray.filter(u => {
      // 1. Completely exclude legacy Google auth accounts / Alaa Ahmed
      if (this.isLegacyGoogleUser(u)) return false;

      // 2. Technical Support only appears in chats tab, not in members directory
      if (u.userId === ADMIN_USER_ID) return false;

      // 3. Filter out self (current user) unless explicitly requested
      const isCurrentSelf = this.isSelf(u);
      if (!includeSelf && isCurrentSelf) return false;
      
      // 4. Must have valid username
      if (!u.username || !u.username.trim()) return false;

      // 5. Exclude blocked users (unless self)
      if (!isCurrentSelf && this.isBlockedMutually(u.userId)) return false;

      // 6. Search query matching
      if (queryLower) {
        const matchesName = u.username.toLowerCase().includes(queryLower);
        const matchesCountry = u.country?.toLowerCase().includes(queryLower);
        const matchesBio = u.bio?.toLowerCase().includes(queryLower);
        const matchesCode = u.accountCode?.toLowerCase().includes(queryLower);
        return Boolean(matchesName || matchesCountry || matchesBio || matchesCode);
      }

      return true;
    }).sort((a, b) => {
      // 1. Current user always pinned at top if included
      const aSelf = this.isSelf(a);
      const bSelf = this.isSelf(b);
      if (aSelf && !bSelf) return -1;
      if (!aSelf && bSelf) return 1;

      // 2. Online users strictly first at the top
      const aOnline = this.isUserOnline(a);
      const bOnline = this.isUserOnline(b);
      if (aOnline && !bOnline) return -1;
      if (!aOnline && bOnline) return 1;

      // 3. Most recently active / joined
      const bTime = new Date(b.lastSeen || b.createdAt || 0).getTime();
      const aTime = new Date(a.lastSeen || a.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }

  public getMyBlockedUsers(): { blockedId: string; user?: CommunityUser; createdAt: string }[] {
    const current = this.getCurrentUser();
    return this.blocksList
      .filter(b => b.blockerId === current.userId)
      .map(b => ({
        blockedId: b.blockedId,
        user: this.usersMap.get(b.blockedId),
        createdAt: b.createdAt
      }));
  }

  public async blockUser(targetUserId: string) {
    const current = this.getCurrentUser();
    if (!current || !current.userId || !targetUserId) return;

    const blockId = `${current.userId}_${targetUserId}`;
    const newBlock: BlockRecord = {
      blockerId: current.userId,
      blockedId: targetUserId,
      createdAt: new Date().toISOString()
    };

    // Filter out previous entry if any to avoid duplicates
    this.blocksList = this.blocksList.filter(
      b => !(b.blockerId === current.userId && b.blockedId === targetUserId)
    );
    this.blocksList.push(newBlock);
    this.saveToLocalStorage();

    try {
      const payload = this.cleanPayload(newBlock);
      await setDoc(doc(db, 'blocks', blockId), payload);
    } catch (e) {
      console.warn('Error saving block to firestore:', e);
    }

    window.dispatchEvent(new CustomEvent('community_block_updated'));
    window.dispatchEvent(new CustomEvent('community_user_updated'));
    window.dispatchEvent(new CustomEvent('community_messages_updated'));
  }

  public async unblockUser(targetUserId: string) {
    const current = this.getCurrentUser();
    if (!current || !current.userId || !targetUserId) return;

    const blockId = `${current.userId}_${targetUserId}`;
    this.blocksList = this.blocksList.filter(b => !(b.blockerId === current.userId && b.blockedId === targetUserId));
    this.saveToLocalStorage();

    try {
      await deleteDoc(doc(db, 'blocks', blockId));
    } catch (e) {
      console.warn('Error deleting block from firestore:', e);
    }

    window.dispatchEvent(new CustomEvent('community_block_updated'));
    window.dispatchEvent(new CustomEvent('community_user_updated'));
    window.dispatchEvent(new CustomEvent('community_messages_updated'));
  }

  private getChatId(userA: string, userB: string): string {
    return [userA, userB].sort().join('_chat_');
  }

  public isViolationReportMessage(msg: ChatMessage | null | undefined): boolean {
    if (!msg) return false;
    return Boolean(
      msg.isViolationReport ||
      msg.messageId?.startsWith('msg_report_') ||
      msg.text?.includes('[بلاغ آلي - محتوى محظور]')
    );
  }

  public getMessagesForChat(partnerUserId: string): ChatMessage[] {
    const current = this.getCurrentUser();
    const chatId = this.getChatId(current.userId, partnerUserId);

    return this.messagesList
      .filter(m => m.chatId === chatId && !this.isViolationReportMessage(m))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public async sendMessage(
    recipientId: string, 
    text: string, 
    verseData?: QuranVerseAttachment, 
    audioUrl?: string,
    attachment?: ChatAttachment
  ): Promise<ChatMessage> {
    const current = this.getCurrentUser();
    if (!this.isProfileComplete()) {
      throw new Error('عفواً، يرجى حفظ اسمك وبياناتك وصورتك الشخصية أولاً لبدء إرسال الرسائل.');
    }

    // --- Automated Content Moderation Check (Option 1: Block message + Send report to Admin /alaa.ahmed) ---
    const checkText = (text || '') + (verseData?.customNote ? ' ' + verseData.customNote : '');
    const modResult = checkContentModeration(checkText);

    if (modResult.isViolating) {
      // 1. Send automated report to Technical Support (/alaa.ahmed - ADMIN_USER_ID) using the offending user's account
      const supportChatId = this.getChatId(current.userId, ADMIN_USER_ID);
      const reportMsgId = 'msg_report_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      const categoryLabel = modResult.category === 'political' ? 'سياسية/تحريضية' : 'مسيئة وخادشة للحياء';
      
      const targetUser = this.getUserById(recipientId);
      const targetDisplayName = targetUser?.username || 'قارئ';
      const targetCode = targetUser?.accountCode || recipientId;

      const reportText = `⚠️ [بلاغ آلي - محتوى محظور]
تم حجب محاولة إرسال رسالة تحتوي على كلمات ${categoryLabel}.

• المستخدم المخالف: ${current.username} (كود الحساب: ${current.accountCode || 'غير محدد'})
• المرسل إليه: ${targetDisplayName} (كود الحساب: ${targetCode})
• معرّف الحساب (UID): ${current.userId}
• الدولة: ${current.country || 'غير محددة'}
• الكلمات المكتشفة: ${modResult.detectedWords.join(' ، ')}
• نص الرسالة المحجوبة:
"${text.trim()}"
• الوقت: ${new Date().toLocaleString('ar-EG')}`;

      const reportMsg: ChatMessage = {
        messageId: reportMsgId,
        chatId: supportChatId,
        senderId: current.userId,
        recipientId: ADMIN_USER_ID,
        targetRecipientId: recipientId,
        text: reportText,
        isViolationReport: true,
        isRead: false,
        createdAt: new Date().toISOString()
      };

      // Send report to Firestore exclusively for the admin dashboard (/alaa.ahmed)
      // It must NEVER appear in the offending user's own technical support messages
      try {
        const payload = this.cleanPayload(reportMsg);
        await setDoc(doc(db, 'messages', reportMsgId), payload);
      } catch (e) {
        console.error('Error sending moderation report to Firestore:', e);
      }

      this.saveChattedUser(ADMIN_USER_ID, current.userId);

      window.dispatchEvent(new CustomEvent('community_messages_updated'));

      // 2. Throw error to block the message from being sent to the recipient in normal chat
      throw new Error('عفواً، تحتوي الرسالة على كلمات غير لائقة مخالفة لشروط الاستخدام.');
    }

    const chatId = this.getChatId(current.userId, recipientId);
    const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    // Check friendship/request status for direct 1-on-1 messages
    if (recipientId !== ADMIN_USER_ID && current.userId !== ADMIN_USER_ID) {
      const friendship = this.getFriendshipStatus(recipientId);
      if (friendship.status === 'rejected' && friendship.isRequester) {
        throw new Error('تم رفض طلب الإضافة من هذا العضو. لا يمكنك إرسال رسائل.');
      }
      if (friendship.status === 'none') {
        throw new Error('يجب إرسال طلب إضافة أولاً قبل إرسال أي رسالة.');
      }
      if (friendship.status === 'pending' && friendship.isRequester) {
        const sentCount = this.getSentMessagesCountToUser(recipientId);
        if (sentCount >= 1) {
          throw new Error('لا يمكنك إرسال أكثر من رسالة تعريفية واحدة حتى يتم قبول طلب الإضافة من العضو.');
        }
      }
    }

    const newMsg: ChatMessage = {
      messageId: msgId,
      chatId,
      senderId: current.userId,
      recipientId,
      text: text.trim(),
      verseData,
      audioUrl,
      attachment,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    this.messagesList.push(newMsg);
    this.saveToLocalStorage();

    this.setTypingStatus(recipientId, false);

    // Save chatted user contact on server to keep history of who spoke with whom
    if (recipientId === ADMIN_USER_ID || current.userId === ADMIN_USER_ID) {
      this.saveChattedUser(current.userId, recipientId);
      this.saveChattedUser(recipientId, current.userId);
    } else {
      const friendship = this.getFriendshipStatus(recipientId);
      if (friendship.status === 'accepted') {
        this.saveChattedUser(current.userId, recipientId);
      } else if (friendship.status === 'pending' && friendship.contact) {
        friendship.contact.introMessage = text.trim();
        this.saveToLocalStorage();
        try {
          updateDoc(doc(db, 'contacts', friendship.contact.contactId || ''), {
            introMessage: text.trim(),
            updatedAt: new Date().toISOString()
          }).catch(() => {});
        } catch (e) {}
      }
    }

    try {
      const payload = this.cleanPayload(newMsg);
      await setDoc(doc(db, 'messages', msgId), payload);
    } catch (e) {
      console.error('Error sending message to Firestore:', e);
    }

    return newMsg;
  }

  public async markMessagesAsRead(partnerUserId: string) {
    const current = this.getCurrentUser();
    const chatId = this.getChatId(current.userId, partnerUserId);

    let updatedAny = false;
    this.messagesList.forEach(m => {
      if (m.chatId === chatId && m.recipientId === current.userId && !m.isRead) {
        m.isRead = true;
        updatedAny = true;
        try {
          updateDoc(doc(db, 'messages', m.messageId), { isRead: true });
        } catch (e) {}
      }
    });

    if (updatedAny) {
      this.saveToLocalStorage();
      window.dispatchEvent(new CustomEvent('community_messages_updated'));
    }
  }

  public async deleteSingleMessage(messageId: string) {
    this.messagesList = this.messagesList.filter(m => m.messageId !== messageId);
    this.saveToLocalStorage();

    try {
      await deleteDoc(doc(db, 'messages', messageId));
    } catch (e) {}

    window.dispatchEvent(new CustomEvent('community_messages_updated'));
  }

  public async deleteReadMessages(partnerUserId: string) {
    const current = this.getCurrentUser();
    const chatId = this.getChatId(current.userId, partnerUserId);

    const toDelete = this.messagesList.filter(m => m.chatId === chatId && m.isRead);
    this.messagesList = this.messagesList.filter(m => !(m.chatId === chatId && m.isRead));
    this.saveToLocalStorage();

    toDelete.forEach(async (m) => {
      try {
        await deleteDoc(doc(db, 'messages', m.messageId));
      } catch (e) {}
    });

    window.dispatchEvent(new CustomEvent('community_messages_updated'));
  }

  public async clearConversation(partnerUserId: string) {
    const current = this.getCurrentUser();
    const chatId = this.getChatId(current.userId, partnerUserId);
    const adminChatId = this.getChatId(ADMIN_USER_ID, partnerUserId);

    const toDeleteMsgIds = new Set<string>();
    this.messagesList.forEach(m => {
      if (
        m.chatId === chatId ||
        m.chatId === adminChatId ||
        (m.senderId === current.userId && m.recipientId === partnerUserId) ||
        (m.senderId === partnerUserId && m.recipientId === current.userId) ||
        (m.senderId === ADMIN_USER_ID && m.recipientId === partnerUserId) ||
        (m.senderId === partnerUserId && m.recipientId === ADMIN_USER_ID)
      ) {
        toDeleteMsgIds.add(m.messageId);
      }
    });

    this.messagesList = this.messagesList.filter(m => !toDeleteMsgIds.has(m.messageId));
    toDeleteMsgIds.forEach(id => this.allServerMessagesMap.delete(id));
    this.saveToLocalStorage();

    try {
      const docRefsToDelete = new Map<string, any>();
      toDeleteMsgIds.forEach(id => {
        docRefsToDelete.set(`messages/${id}`, doc(db, 'messages', id));
      });

      const [chatSnap, adminChatSnap] = await Promise.allSettled([
        getDocs(query(collection(db, 'messages'), where('chatId', '==', chatId))),
        getDocs(query(collection(db, 'messages'), where('chatId', '==', adminChatId)))
      ]);

      if (chatSnap.status === 'fulfilled') {
        chatSnap.value.docs.forEach(d => docRefsToDelete.set(d.ref.path, d.ref));
      }
      if (adminChatSnap.status === 'fulfilled') {
        adminChatSnap.value.docs.forEach(d => docRefsToDelete.set(d.ref.path, d.ref));
      }

      const allRefs = Array.from(docRefsToDelete.values());
      const CHUNK_SIZE = 400;
      for (let i = 0; i < allRefs.length; i += CHUNK_SIZE) {
        const batch = writeBatch(db);
        const chunk = allRefs.slice(i, i + CHUNK_SIZE);
        chunk.forEach(ref => batch.delete(ref));
        await batch.commit();
      }
    } catch (e) {
      console.warn('Error clearing conversation from Firestore:', e);
    }

    window.dispatchEvent(new CustomEvent('community_messages_updated'));
  }

  public async clearSupportConversation(partnerUserId: string) {
    const adminChatId = this.getChatId(ADMIN_USER_ID, partnerUserId);
    const current = this.getCurrentUser();
    const currentChatId = this.getChatId(current.userId, partnerUserId);

    const toDeleteMsgIds = new Set<string>();
    this.messagesList.forEach(m => {
      if (
        m.chatId === adminChatId ||
        m.chatId === currentChatId ||
        (m.senderId === ADMIN_USER_ID && m.recipientId === partnerUserId) ||
        (m.senderId === partnerUserId && m.recipientId === ADMIN_USER_ID)
      ) {
        toDeleteMsgIds.add(m.messageId);
      }
    });

    this.messagesList = this.messagesList.filter(m => !toDeleteMsgIds.has(m.messageId));
    toDeleteMsgIds.forEach(id => this.allServerMessagesMap.delete(id));
    this.saveToLocalStorage();

    try {
      const docRefsToDelete = new Map<string, any>();
      toDeleteMsgIds.forEach(id => {
        docRefsToDelete.set(`messages/${id}`, doc(db, 'messages', id));
      });

      const [adminChatSnap, curChatSnap] = await Promise.allSettled([
        getDocs(query(collection(db, 'messages'), where('chatId', '==', adminChatId))),
        getDocs(query(collection(db, 'messages'), where('chatId', '==', currentChatId)))
      ]);

      if (adminChatSnap.status === 'fulfilled') {
        adminChatSnap.value.docs.forEach(d => docRefsToDelete.set(d.ref.path, d.ref));
      }
      if (curChatSnap.status === 'fulfilled') {
        curChatSnap.value.docs.forEach(d => docRefsToDelete.set(d.ref.path, d.ref));
      }

      const allRefs = Array.from(docRefsToDelete.values());
      const CHUNK_SIZE = 400;
      for (let i = 0; i < allRefs.length; i += CHUNK_SIZE) {
        const batch = writeBatch(db);
        const chunk = allRefs.slice(i, i + CHUNK_SIZE);
        chunk.forEach(ref => batch.delete(ref));
        await batch.commit();
      }
    } catch (e) {
      console.warn('Error clearing support conversation from Firestore:', e);
    }

    window.dispatchEvent(new CustomEvent('community_messages_updated'));
  }

  public getActiveConversations(): ChatConversation[] {
    const current = this.getCurrentUser();
    const partnersMap = new Map<string, { lastMsg: ChatMessage | null; unread: number; time: string }>();

    // 1. Ensure Technical Support always appears at the top of the chats tab for users
    if (current.userId !== ADMIN_USER_ID) {
      partnersMap.set(ADMIN_USER_ID, {
        lastMsg: null,
        unread: 0,
        time: new Date('2099-12-31').toISOString()
      });
    }

    this.messagesList.forEach(m => {
      // Never show automated violation reports in user's chat preview, unread counts, or technical support preview
      if (this.isViolationReportMessage(m)) {
        return;
      }

      let partnerId = '';
      if (m.senderId === current.userId) partnerId = m.recipientId;
      else if (m.recipientId === current.userId) partnerId = m.senderId;

      if (!partnerId) return;

      if (this.isBlockedMutually(partnerId)) return;

      const existing = partnersMap.get(partnerId);
      const isUnread = m.recipientId === current.userId && !m.isRead;
      const isPinnedAdmin = partnerId === ADMIN_USER_ID;
      const msgTime = m.createdAt;

      if (!existing || isPinnedAdmin || new Date(m.createdAt).getTime() > new Date(existing.time).getTime()) {
        partnersMap.set(partnerId, {
          lastMsg: m,
          unread: (existing?.unread || 0) + (isUnread ? 1 : 0),
          time: isPinnedAdmin ? new Date('2099-12-31').toISOString() : msgTime
        });
      } else if (isUnread) {
        existing.unread += 1;
      }
    });

    // Populate from server contacts list (if contact was initiated)
    this.serverContactsList.forEach(c => {
      if (c.userId === current.userId) {
        const partnerId = c.partnerId;
        if (this.isBlockedMutually(partnerId)) return;

        if (!partnersMap.has(partnerId)) {
          partnersMap.set(partnerId, {
            lastMsg: null,
            unread: 0,
            time: partnerId === ADMIN_USER_ID ? new Date('2099-12-31').toISOString() : (c.createdAt || new Date(0).toISOString())
          });
        }
      }
    });

    const conversations: ChatConversation[] = [];
    partnersMap.forEach((val, partnerId) => {
      const partnerUser = partnerId === ADMIN_USER_ID ? ADMIN_USER : (this.usersMap.get(partnerId) || {
        userId: partnerId,
        username: 'مستخدم المصحف',
        country: 'غير محدد',
        isOnline: false,
        createdAt: new Date().toISOString()
      });

      conversations.push({
        chatId: this.getChatId(current.userId, partnerId),
        partner: partnerUser,
        lastMessage: val.lastMsg 
          ? (val.lastMsg.text || (val.lastMsg.attachment ? (val.lastMsg.attachment.type === 'image' ? 'صورة 📷' : val.lastMsg.attachment.type === 'video' ? 'فيديو 🎥' : `ملف: ${val.lastMsg.attachment.fileName || 'مستند'} 📄`) : (val.lastMsg.verseData ? `آية من سورة ${val.lastMsg.verseData.surahName}` : 'مقطع صوتي 🎙️')))
          : (partnerId === ADMIN_USER_ID ? 'تواصل مع إدارة التطبيق للدعم الفني والشكاوى ✉️' : 'لا توجد رسائل (تم حذفها من السيرفر)'),
        lastMessageTime: val.time,
        unreadCount: val.unread
      });
    });

    return conversations.sort((a, b) => new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime());
  }

  public getTotalUnreadCount(): number {
    const current = this.getCurrentUser();
    if (!current || !current.userId) return 0;

    let total = 0;
    this.messagesList.forEach(m => {
      if (this.isViolationReportMessage(m)) return;
      if (m.recipientId === current.userId && !m.isRead) {
        if (!this.isBlockedMutually(m.senderId)) {
          total += 1;
        }
      }
    });

    return total;
  }

  public getRawContacts(): ServerContact[] {
    return this.serverContactsList;
  }

  // Get friendship / add request status between current user and partner
  public getFriendshipStatus(partnerId: string): {
    status: ContactRequestStatus;
    isRequester: boolean;
    contact?: ServerContact;
  } {
    const current = this.getCurrentUser();
    if (!current || !current.userId || !partnerId) {
      return { status: 'none', isRequester: false };
    }

    // Official support is always accepted
    if (partnerId === ADMIN_USER_ID || current.userId === ADMIN_USER_ID) {
      return { status: 'accepted', isRequester: false };
    }

    const contact = this.serverContactsList.find(c => 
      (c.userId === current.userId && c.partnerId === partnerId) ||
      (c.userId === partnerId && c.partnerId === current.userId)
    );

    if (!contact) {
      return { status: 'none', isRequester: false };
    }

    const isRequester = contact.userId === current.userId;
    const status: ContactRequestStatus = contact.status || 'accepted';

    return { status, isRequester, contact };
  }

  // Count messages current user sent to this partner
  public getSentMessagesCountToUser(partnerUserId: string): number {
    const current = this.getCurrentUser();
    if (!current || !current.userId) return 0;
    const chatId = this.getChatId(current.userId, partnerUserId);
    return this.messagesList.filter(m => 
      m.chatId === chatId && 
      m.senderId === current.userId && 
      !this.isViolationReportMessage(m)
    ).length;
  }

  // Send add / friend request to a member
  public async sendFriendRequest(targetUserId: string, introMessage?: string): Promise<ServerContact> {
    const current = this.getCurrentUser();
    if (!current || !current.userId) {
      throw new Error('يرجى حفظ اسمك وبياناتك أولاً لإرسال طلب إضافة.');
    }
    if (targetUserId === current.userId) {
      throw new Error('لا يمكنك إرسال طلب إضافة لنفسك.');
    }

    const sortedIds = [current.userId, targetUserId].sort();
    const contactId = `contact_${sortedIds[0]}_${sortedIds[1]}`;
    const now = new Date().toISOString();

    const newContact: ServerContact = {
      contactId,
      userId: current.userId,
      partnerId: targetUserId,
      status: 'pending',
      introMessage: introMessage || '',
      createdAt: now,
      updatedAt: now
    };

    // Replace old entry if any in local list
    this.serverContactsList = this.serverContactsList.filter(c =>
      !((c.userId === current.userId && c.partnerId === targetUserId) ||
        (c.userId === targetUserId && c.partnerId === current.userId))
    );
    this.serverContactsList.unshift(newContact);
    this.saveToLocalStorage();

    try {
      await setDoc(doc(db, 'contacts', contactId), newContact, { merge: true });
    } catch (e) {
      console.warn('Error saving friend request to Firestore:', e);
    }

    window.dispatchEvent(new CustomEvent('community_contacts_updated'));
    window.dispatchEvent(new CustomEvent('community_messages_updated'));
    return newContact;
  }

  // Accept incoming friend request
  public async acceptFriendRequest(partnerUserId: string): Promise<void> {
    const current = this.getCurrentUser();
    if (!current || !current.userId) return;

    const contact = this.serverContactsList.find(c => 
      (c.userId === current.userId && c.partnerId === partnerUserId) ||
      (c.userId === partnerUserId && c.partnerId === current.userId)
    );

    const now = new Date().toISOString();
    if (contact) {
      contact.status = 'accepted';
      contact.updatedAt = now;
    }

    const sortedIds = [current.userId, partnerUserId].sort();
    const contactId = contact?.contactId || `contact_${sortedIds[0]}_${sortedIds[1]}`;

    this.saveToLocalStorage();

    try {
      await setDoc(doc(db, 'contacts', contactId), {
        userId: contact?.userId || partnerUserId,
        partnerId: contact?.partnerId || current.userId,
        status: 'accepted',
        updatedAt: now
      }, { merge: true });
    } catch (e) {
      console.warn('Error accepting friend request in Firestore:', e);
    }

    window.dispatchEvent(new CustomEvent('community_contacts_updated'));
    window.dispatchEvent(new CustomEvent('community_messages_updated'));
  }

  // Reject incoming friend request
  public async rejectFriendRequest(partnerUserId: string): Promise<void> {
    const current = this.getCurrentUser();
    if (!current || !current.userId) return;

    const contact = this.serverContactsList.find(c => 
      (c.userId === current.userId && c.partnerId === partnerUserId) ||
      (c.userId === partnerUserId && c.partnerId === current.userId)
    );

    const now = new Date().toISOString();
    if (contact) {
      contact.status = 'rejected';
      contact.updatedAt = now;
    }

    const sortedIds = [current.userId, partnerUserId].sort();
    const contactId = contact?.contactId || `contact_${sortedIds[0]}_${sortedIds[1]}`;

    this.saveToLocalStorage();

    try {
      await setDoc(doc(db, 'contacts', contactId), {
        userId: contact?.userId || partnerUserId,
        partnerId: contact?.partnerId || current.userId,
        status: 'rejected',
        updatedAt: now
      }, { merge: true });
    } catch (e) {
      console.warn('Error rejecting friend request in Firestore:', e);
    }

    window.dispatchEvent(new CustomEvent('community_contacts_updated'));
    window.dispatchEvent(new CustomEvent('community_messages_updated'));
  }

  // Get pending friend requests received by current user
  public getPendingFriendRequests(): { user: CommunityUser; contact: ServerContact }[] {
    const current = this.getCurrentUser();
    if (!current || !current.userId) return [];

    const list: { user: CommunityUser; contact: ServerContact }[] = [];
    this.serverContactsList.forEach(c => {
      if (c.partnerId === current.userId && c.status === 'pending') {
        const u = this.getUserById(c.userId);
        if (u) {
          list.push({ user: u, contact: c });
        }
      }
    });
    return list;
  }

  public async deleteUser(userId: string): Promise<void> {
    if (!userId) return;

    // 1. Instant Optimistic local state purge across ALL private messages, group messages, groups & contacts
    this.usersMap.delete(userId);
    this.messagesList = this.messagesList.filter(m => m.senderId !== userId && m.recipientId !== userId);
    this.blocksList = this.blocksList.filter(b => b.blockerId !== userId && b.blockedId !== userId);
    this.serverContactsList = this.serverContactsList.filter(c => c.userId !== userId && c.partnerId !== userId);

    // Purge ALL group messages authored by this user from in-memory state
    this.groupMessagesList = this.groupMessagesList.filter(gm => gm.senderId !== userId);

    // Remove user from all groups in local memory (members, invited, rejected, left, exitTimes)
    this.groupsList.forEach(grp => {
      let modified = false;
      if (Array.isArray(grp.members) && grp.members.includes(userId)) {
        grp.members = grp.members.filter(m => m !== userId);
        grp.memberCount = grp.members.length;
        modified = true;
      }
      if (Array.isArray(grp.invitedMembers) && grp.invitedMembers.includes(userId)) {
        grp.invitedMembers = grp.invitedMembers.filter(m => m !== userId);
        modified = true;
      }
      if (Array.isArray(grp.rejectedMembers) && grp.rejectedMembers.includes(userId)) {
        grp.rejectedMembers = grp.rejectedMembers.filter(m => m !== userId);
        modified = true;
      }
      if (Array.isArray(grp.leftMembers) && grp.leftMembers.includes(userId)) {
        grp.leftMembers = grp.leftMembers.filter(m => m !== userId);
        modified = true;
      }
      if (grp.memberExitTimes && grp.memberExitTimes[userId]) {
        delete grp.memberExitTimes[userId];
        modified = true;
      }
      // If the last message displayed on the group card was from this deleted user, clear or sanitize it
      if (grp.lastMessageSenderName && (grp.lastMessageSenderName === this.getUserById(userId)?.username || grp.createdBy === userId)) {
        const remainingGroupMsgs = this.groupMessagesList
          .filter(m => m.groupId === grp.groupId)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        const lastMsg = remainingGroupMsgs[remainingGroupMsgs.length - 1];
        if (lastMsg) {
          grp.lastMessage = lastMsg.text;
          grp.lastMessageSenderName = lastMsg.senderName;
          grp.lastMessageTime = lastMsg.createdAt;
        } else {
          grp.lastMessage = '';
          grp.lastMessageSenderName = '';
          grp.lastMessageTime = grp.createdAt;
        }
      }
      if (modified) {
        this.groupExitTimesMap.delete(`${grp.groupId}_${userId}`);
        this.hiddenGroupsSet.delete(`${grp.groupId}_${userId}`);
      }
    });

    // Purge from allServerMessagesMap cache
    for (const [mId, msg] of Array.from(this.allServerMessagesMap.entries())) {
      if (msg.senderId === userId || msg.recipientId === userId) {
        this.allServerMessagesMap.delete(mId);
      }
    }

    // If deleted user was active current user, clear profile
    if (this.currentUser && this.currentUser.userId === userId) {
      this.logoutAccount();
    }

    // If impersonating this user, exit impersonation
    if (this.isImpersonating()) {
      const stored = localStorage.getItem('mushaf_community_original_owner');
      if (stored) {
        try {
          const original = JSON.parse(stored);
          if (original.userId === userId) {
            localStorage.removeItem('mushaf_community_original_owner');
          }
        } catch (e) {}
      }
    }

    this.saveToLocalStorage();

    // 2. High-speed comprehensive targeted parallel queries & batch delete in Firestore
    // Thoroughly deletes:
    // - User document (/users/{userId})
    // - Ahl Al-Quran leaderboard & reading stats document (/ahl_al_quran_stats/{userId})
    // - All direct messages sent by the user (messages where senderId == userId)
    // - All direct messages received by the user (messages where recipientId == userId)
    // - All group messages sent by the user in ANY group (group_messages where senderId == userId)
    // - All contact records (contacts where userId == userId or partnerId == userId)
    // - All block records (blocks where blockerId == userId or blockedId == userId)
    // - Updates all groups where the user is a member to remove them from members array and recalculate memberCount
    try {
      const docRefsToDelete = new Map<string, any>();

      // Target the user document directly and their Ahl Al-Quran stats document
      docRefsToDelete.set(`users/${userId}`, doc(db, 'users', userId));
      docRefsToDelete.set(`ahl_al_quran_stats/${userId}`, doc(db, 'ahl_al_quran_stats', userId));

      // Targeted parallel queries strictly matching all user traces on the server
      const queries = [
        getDocs(query(collection(db, 'messages'), where('senderId', '==', userId))),
        getDocs(query(collection(db, 'messages'), where('recipientId', '==', userId))),
        getDocs(query(collection(db, 'group_messages'), where('senderId', '==', userId))),
        getDocs(query(collection(db, 'contacts'), where('userId', '==', userId))),
        getDocs(query(collection(db, 'contacts'), where('partnerId', '==', userId))),
        getDocs(query(collection(db, 'blocks'), where('blockerId', '==', userId))),
        getDocs(query(collection(db, 'blocks'), where('blockedId', '==', userId))),
        getDocs(query(collection(db, 'group_chats'), where('members', 'array-contains', userId)))
      ];

      const queryResults = await Promise.allSettled(queries);
      
      // Index 0: messages sent
      if (queryResults[0].status === 'fulfilled' && queryResults[0].value?.docs) {
        queryResults[0].value.docs.forEach((docSnap) => docRefsToDelete.set(docSnap.ref.path, docSnap.ref));
      }
      // Index 1: messages received
      if (queryResults[1].status === 'fulfilled' && queryResults[1].value?.docs) {
        queryResults[1].value.docs.forEach((docSnap) => docRefsToDelete.set(docSnap.ref.path, docSnap.ref));
      }
      // Index 2: group messages sent by user
      if (queryResults[2].status === 'fulfilled' && queryResults[2].value?.docs) {
        queryResults[2].value.docs.forEach((docSnap) => docRefsToDelete.set(docSnap.ref.path, docSnap.ref));
      }
      // Index 3 & 4: contacts
      if (queryResults[3].status === 'fulfilled' && queryResults[3].value?.docs) {
        queryResults[3].value.docs.forEach((docSnap) => docRefsToDelete.set(docSnap.ref.path, docSnap.ref));
      }
      if (queryResults[4].status === 'fulfilled' && queryResults[4].value?.docs) {
        queryResults[4].value.docs.forEach((docSnap) => docRefsToDelete.set(docSnap.ref.path, docSnap.ref));
      }
      // Index 5 & 6: blocks
      if (queryResults[5].status === 'fulfilled' && queryResults[5].value?.docs) {
        queryResults[5].value.docs.forEach((docSnap) => docRefsToDelete.set(docSnap.ref.path, docSnap.ref));
      }
      if (queryResults[6].status === 'fulfilled' && queryResults[6].value?.docs) {
        queryResults[6].value.docs.forEach((docSnap) => docRefsToDelete.set(docSnap.ref.path, docSnap.ref));
      }

      // Index 7: update group_chats documents on Firestore where user was a member
      if (queryResults[7].status === 'fulfilled' && queryResults[7].value?.docs) {
        const groupUpdatePromises = queryResults[7].value.docs.map(async (grpDoc) => {
          try {
            const grpData = grpDoc.data() as GroupChat;
            const updatedMembers = (grpData.members || []).filter(m => m !== userId);
            const updatedInvited = (grpData.invitedMembers || []).filter(m => m !== userId);
            const updatedRejected = (grpData.rejectedMembers || []).filter(m => m !== userId);
            const updatedLeft = (grpData.leftMembers || []).filter(m => m !== userId);
            const updatedExitTimes = { ...(grpData.memberExitTimes || {}) };
            delete updatedExitTimes[userId];

            await updateDoc(grpDoc.ref, {
              members: updatedMembers,
              memberCount: updatedMembers.length,
              invitedMembers: updatedInvited,
              rejectedMembers: updatedRejected,
              leftMembers: updatedLeft,
              memberExitTimes: updatedExitTimes
            });
          } catch (err) {
            console.warn('Error updating group after member deletion:', err);
          }
        });
        await Promise.allSettled(groupUpdatePromises);
      }

      // Also clean any groups where user was the creator or invited in Firestore
      try {
        const extraGroupsQuery = await getDocs(query(collection(db, 'group_chats'), where('invitedMembers', 'array-contains', userId)));
        const extraPromises = extraGroupsQuery.docs.map(async (gDoc) => {
          try {
            const gData = gDoc.data() as GroupChat;
            const updatedInvited = (gData.invitedMembers || []).filter(m => m !== userId);
            await updateDoc(gDoc.ref, { invitedMembers: updatedInvited });
          } catch (e) {}
        });
        await Promise.allSettled(extraPromises);
      } catch (e) {}

      // Commit all deletions atomically using writeBatch in chunks of up to 400 docs
      const allRefs = Array.from(docRefsToDelete.values());
      const CHUNK_SIZE = 400;
      for (let i = 0; i < allRefs.length; i += CHUNK_SIZE) {
        const batch = writeBatch(db);
        const chunk = allRefs.slice(i, i + CHUNK_SIZE);
        chunk.forEach((ref) => batch.delete(ref));
        await batch.commit();
      }
    } catch (e) {
      console.error('Error during batch deleteUser in Firestore:', e);
      // Fallback single doc delete in case of any network or index glitch
      try {
        await deleteDoc(doc(db, 'users', userId));
      } catch (err) {}
      try {
        await deleteDoc(doc(db, 'ahl_al_quran_stats', userId));
      } catch (err) {}
    }

    // 3. Dispatch events once at the end across community, messages, groups, group messages and stats
    window.dispatchEvent(new CustomEvent('community_user_deleted', { detail: { userId } }));
    window.dispatchEvent(new CustomEvent('community_user_updated'));
    window.dispatchEvent(new CustomEvent('community_messages_updated'));
    window.dispatchEvent(new CustomEvent('community_groups_updated'));
    window.dispatchEvent(new CustomEvent('community_group_messages_updated'));
    window.dispatchEvent(new CustomEvent('community_block_updated'));
    window.dispatchEvent(new CustomEvent('ahl_al_quran_updated'));
  }

  public async fetchAllServerMessages(forceRefresh: boolean = false): Promise<ChatMessage[]> {
    if (!forceRefresh && this.allServerMessagesMap.size > 0) {
      return Array.from(this.allServerMessagesMap.values()).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    try {
      const snapshot = await getDocs(collection(db, 'messages'));
      this.allServerMessagesMap.clear();
      snapshot.forEach((docSnap) => {
        const msg = docSnap.data() as ChatMessage;
        const mId = msg?.messageId || docSnap.id;
        if (msg && mId) {
          this.allServerMessagesMap.set(mId, { ...msg, messageId: mId });
        }
      });
      return Array.from(this.allServerMessagesMap.values()).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } catch (e) {
      console.warn('Error fetching all server messages:', e);
      return Array.from(this.allServerMessagesMap.values());
    }
  }

  public async deleteServerMessage(messageId: string) {
    this.allServerMessagesMap.delete(messageId);
    this.messagesList = this.messagesList.filter(m => m.messageId !== messageId);
    this.saveToLocalStorage();
    try {
      await deleteDoc(doc(db, 'messages', messageId));
    } catch (e) {
      console.warn('Error deleting server message:', e);
    }
  }

  public async sendAdminReply(recipientId: string, text: string): Promise<ChatMessage> {
    const chatId = this.getChatId(ADMIN_USER_ID, recipientId);
    const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    const newMsg: ChatMessage = {
      messageId: msgId,
      chatId,
      senderId: ADMIN_USER_ID,
      recipientId,
      text: text.trim(),
      isRead: false,
      createdAt: new Date().toISOString()
    };

    this.messagesList.push(newMsg);
    this.saveToLocalStorage();
    this.saveChattedUser(ADMIN_USER_ID, recipientId);
    this.saveChattedUser(recipientId, ADMIN_USER_ID);

    try {
      const payload = this.cleanPayload(newMsg);
      await setDoc(doc(db, 'messages', msgId), payload);
    } catch (e) {
      console.error('Error sending admin reply to Firestore:', e);
    }

    window.dispatchEvent(new CustomEvent('community_messages_updated'));
    return newMsg;
  }

  public async sendBroadcastAdminMessage(text: string): Promise<number> {
    const cleanText = text.trim();
    if (!cleanText) return 0;

    // 1. Fetch latest users list
    const allUsers = await this.fetchLatestUsers();
    // Exclude official admin user
    const targetUsers = allUsers.filter(u => u.userId !== ADMIN_USER_ID);

    if (targetUsers.length === 0) return 0;

    const nowIso = new Date().toISOString();
    const batchId = 'batch_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    let sentCount = 0;

    // Send message to every user's support chat
    for (const targetUser of targetUsers) {
      const chatId = this.getChatId(ADMIN_USER_ID, targetUser.userId);
      const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6) + '_' + sentCount;

      const newMsg: ChatMessage = {
        messageId: msgId,
        chatId,
        senderId: ADMIN_USER_ID,
        recipientId: targetUser.userId,
        text: cleanText,
        isBroadcast: true,
        broadcastBatchId: batchId,
        isRead: false,
        createdAt: nowIso
      };

      this.messagesList.push(newMsg);

      // Save contact mapping so Technical Support chat appears in their conversation list
      this.saveChattedUser(ADMIN_USER_ID, targetUser.userId);
      this.saveChattedUser(targetUser.userId, ADMIN_USER_ID);

      try {
        const payload = this.cleanPayload(newMsg);
        await setDoc(doc(db, 'messages', msgId), payload);
      } catch (e) {
        console.error('Error sending broadcast message to user:', targetUser.userId, e);
      }

      sentCount++;
    }

    this.saveToLocalStorage();
    window.dispatchEvent(new CustomEvent('community_messages_updated'));

    return sentCount;
  }

  public async deleteBroadcastBatch(batchIdOrText: string) {
    const toDelete = this.messagesList.filter(m => 
      (m.isBroadcast && m.broadcastBatchId === batchIdOrText) || 
      (m.senderId === ADMIN_USER_ID && m.text === batchIdOrText)
    );
    this.messagesList = this.messagesList.filter(m => 
      !((m.isBroadcast && m.broadcastBatchId === batchIdOrText) || 
        (m.senderId === ADMIN_USER_ID && m.text === batchIdOrText))
    );
    this.saveToLocalStorage();

    toDelete.forEach(async (m) => {
      try {
        await deleteDoc(doc(db, 'messages', m.messageId));
      } catch (e) {}
    });

    window.dispatchEvent(new CustomEvent('community_messages_updated'));
  }

  public impersonateUser(user: CommunityUser) {
    if (typeof localStorage === 'undefined') return;
    try {
      // Store current user as original owner if not already impersonating
      if (!this.isImpersonating()) {
        const original = this.getCurrentUser();
        localStorage.setItem('mushaf_community_original_owner', JSON.stringify(original));
      }
      this.currentUser = user;
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      this.usersMap.set(user.userId, user);
      
      // Trigger update events
      window.dispatchEvent(new CustomEvent('community_user_updated', { detail: user }));
      window.dispatchEvent(new CustomEvent('community_messages_updated'));
    } catch (e) {
      console.warn('Error impersonating user:', e);
    }
  }

  public exitImpersonate() {
    if (typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem('mushaf_community_original_owner');
      if (stored) {
        const original = JSON.parse(stored);
        this.currentUser = original;
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(original));
        localStorage.removeItem('mushaf_community_original_owner');
        this.usersMap.set(original.userId, original);
        
        // Trigger update events
        window.dispatchEvent(new CustomEvent('community_user_updated', { detail: original }));
        window.dispatchEvent(new CustomEvent('community_messages_updated'));
      }
    } catch (e) {
      console.warn('Error exiting impersonation:', e);
    }
  }

  public isImpersonating(): boolean {
    if (typeof localStorage === 'undefined') return false;
    return !!localStorage.getItem('mushaf_community_original_owner');
  }

  public getOriginalOwnerName(): string {
    if (typeof localStorage === 'undefined') return 'الإدارة';
    try {
      const stored = localStorage.getItem('mushaf_community_original_owner');
      if (stored) {
        const original = JSON.parse(stored);
        return original.username || 'الإدارة';
      }
    } catch (e) {}
    return 'الإدارة';
  }

  public async markAdminMessagesAsRead(userId: string) {
    try {
      const snapshot = await getDocs(collection(db, 'messages'));
      snapshot.forEach(async (docSnap) => {
        const msg = docSnap.data() as ChatMessage;
        if (msg && msg.senderId === userId && msg.recipientId === ADMIN_USER_ID && !msg.isRead) {
          await updateDoc(doc(db, 'messages', docSnap.id), { isRead: true }).catch(() => {});
        }
      });
      // Also mark locally inside messagesList
      this.messagesList.forEach(m => {
        if (m.senderId === userId && m.recipientId === ADMIN_USER_ID) {
          m.isRead = true;
        }
      });
      this.saveToLocalStorage();
      window.dispatchEvent(new CustomEvent('community_messages_updated'));
    } catch (e) {
      console.warn('Error marking admin messages as read:', e);
    }
  }

  // ==========================================
  // --- Group Chat Methods (المحادثات الجماعية) ---
  // ==========================================

  public getDefaultStarterGroups(): GroupChat[] {
    return [
      {
        groupId: 'group_default_quran_readers',
        name: 'حلقة أهل القرآن العامة 📖',
        description: 'ملتقى مبارك لمدارسة وتلاوة القرآن الكريم وتبادل الفوائد القرآنية بين جميع أفراد المجتمع.',
        avatarUrl: '',
        createdBy: ADMIN_USER_ID,
        creatorName: 'المشرف العام',
        members: [ADMIN_USER_ID],
        memberCount: 256,
        invitedMembers: [],
        rejectedMembers: [],
        lastMessage: 'مرحباً بكم في حلقة أهل القرآن العامة 📖، نسأل الله أن يجمعنا على كتابه الكريم.',
        lastMessageSenderName: 'المشرف العام',
        lastMessageTime: '2025-01-01T00:00:00.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
        isPublic: true
      },
      {
        groupId: 'group_default_tadabbur',
        name: 'مجلس الذكر وتدبر الآيات 🌿',
        description: 'مجلس إيماني لتدبر معاني الآيات العظيمة، واستنباط الهدايات والخواطر الإيمانية النافعة.',
        avatarUrl: '',
        createdBy: ADMIN_USER_ID,
        creatorName: 'المشرف العام',
        members: [ADMIN_USER_ID],
        memberCount: 189,
        invitedMembers: [],
        rejectedMembers: [],
        lastMessage: 'أهلاً بكم في مجلس الذكر وتدبر الآيات 🌿، شاركونا نفحات وتدبرات كتاب الله.',
        lastMessageSenderName: 'المشرف العام',
        lastMessageTime: '2025-01-01T00:00:00.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
        isPublic: true
      }
    ];
  }

  public ensureStarterGroupsExist(): void {
    const starters = this.getDefaultStarterGroups();
    starters.forEach(sg => {
      const idx = this.groupsList.findIndex(g => g.groupId === sg.groupId);
      if (idx === -1) {
        this.groupsList.push(sg);
      } else {
        // Ensure name and public flags are preserved
        this.groupsList[idx].isPublic = true;
        if (!this.groupsList[idx].name || this.groupsList[idx].name.length < 3) {
          this.groupsList[idx].name = sg.name;
        }
      }
    });
  }

  public async fetchLatestGroups(): Promise<GroupChat[]> {
    try {
      this.ensureStarterGroupsExist();

      const snapshot = await getDocs(collection(db, 'group_chats'));
      const firestoreList: GroupChat[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as GroupChat;
        if (data && (data.groupId || docSnap.id)) {
          firestoreList.push({ ...data, groupId: data.groupId || docSnap.id });
        }
      });

      const map = new Map<string, GroupChat>();
      // 1. Starter groups first
      this.getDefaultStarterGroups().forEach(g => map.set(g.groupId, g));
      // 2. Authoritative Firestore groups
      firestoreList.forEach(g => map.set(g.groupId, g));

      this.groupsList = Array.from(map.values());
      this.saveToLocalStorage();
      window.dispatchEvent(new CustomEvent('community_groups_updated'));
    } catch (e) {
      console.warn('Error fetching group chats from Firestore:', e);
    }
    return this.groupsList;
  }

  public async fetchLatestGroupMessages(groupId?: string): Promise<GroupMessage[]> {
    try {
      const snapshot = await getDocs(collection(db, 'group_messages'));
      const list: GroupMessage[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as GroupMessage;
        if (data && (data.messageId || docSnap.id) && data.groupId) {
          list.push({ ...data, messageId: data.messageId || docSnap.id });
        }
      });

      this.groupMessagesList = list;
      this.saveToLocalStorage();
      window.dispatchEvent(new CustomEvent('community_group_messages_updated', { detail: { groupId } }));
    } catch (e) {
      console.warn('Error fetching group messages:', e);
    }
    return groupId ? this.getGroupMessages(groupId) : this.groupMessagesList;
  }

  public recordExitTime(groupId: string, userId: string, exitTimeIso?: string): void {
    if (!groupId || !userId) return;
    const time = exitTimeIso || new Date().toISOString();
    this.groupExitTimesMap.set(`${groupId}_${userId}`, time);
    this.saveToLocalStorage();
  }

  public getMemberExitTime(groupId: string, userId?: string): string | undefined {
    const uid = userId || this.getCurrentUser()?.userId;
    if (!uid) return undefined;

    const local = this.groupExitTimesMap.get(`${groupId}_${uid}`);
    if (local) return local;

    const group = this.getGroupById(groupId);
    if (group?.memberExitTimes && group.memberExitTimes[uid]) {
      return group.memberExitTimes[uid];
    }

    return undefined;
  }

  public hasUserLeftOrBeenRemoved(group: GroupChat, userId?: string): boolean {
    if (!group) return false;
    // Default starter groups are open to all
    if (group.groupId === 'group_default_quran_readers' || group.groupId === 'group_default_tadabbur') {
      return false;
    }
    const uid = userId || this.getCurrentUser()?.userId;
    if (!uid) return false;

    // Creator is never considered removed
    if (group.createdBy === uid) return false;

    if (Array.isArray(group.leftMembers) && group.leftMembers.includes(uid)) return true;
    if (group.memberExitTimes && group.memberExitTimes[uid]) return true;
    if (this.groupExitTimesMap.has(`${group.groupId}_${uid}`)) return true;

    return false;
  }

  public hideGroupFromMyPage(groupId: string): void {
    if (groupId === 'group_default_quran_readers' || groupId === 'group_default_tadabbur') {
      return; // Starter groups CAN NEVER be hidden!
    }
    const current = this.getCurrentUser();
    if (!current?.userId) return;

    this.hiddenGroupsSet.add(`${groupId}_${current.userId}`);
    this.saveToLocalStorage();
    window.dispatchEvent(new CustomEvent('community_groups_updated'));
  }

  public isGroupHiddenForUser(groupId: string, userId?: string): boolean {
    if (groupId === 'group_default_quran_readers' || groupId === 'group_default_tadabbur') {
      return false; // Starter groups are ALWAYS visible!
    }
    const uid = userId || this.getCurrentUser()?.userId;
    if (!uid) return false;
    return this.hiddenGroupsSet.has(`${groupId}_${uid}`);
  }

  public unhideGroupForUser(groupId: string): void {
    const current = this.getCurrentUser();
    if (!current?.userId) return;

    this.hiddenGroupsSet.delete(`${groupId}_${current.userId}`);
    this.saveToLocalStorage();
    window.dispatchEvent(new CustomEvent('community_groups_updated'));
  }

  public getGroups(): GroupChat[] {
    const current = this.getCurrentUser();
    this.ensureStarterGroupsExist();

    return this.groupsList.filter(g => {
      // 1. Starter public groups ALWAYS appear for ALL members - NEVER HIDDEN!
      if (g.groupId === 'group_default_quran_readers' || g.groupId === 'group_default_tadabbur') {
        return true;
      }

      if (!current || !current.userId) return false;

      // 2. If user explicitly removed / hid this group from their page, DO NOT show it in community tab
      if (this.isGroupHiddenForUser(g.groupId, current.userId)) {
        return false;
      }

      // If user explicitly rejected invitation, don't show it
      const isRejected = Array.isArray(g.rejectedMembers) && g.rejectedMembers.includes(current.userId);
      if (isRejected) return false;

      // 3. User is creator, member, invited, or has left/been removed (and hasn't hidden it yet)
      const isCreator = this.isGroupCreator(g, current);
      const isMember = Array.isArray(g.members) && g.members.includes(current.userId);
      const isInvited = Array.isArray(g.invitedMembers) && g.invitedMembers.includes(current.userId);

      // CRITICAL: If user has a pending invitation and is not yet a member,
      // DO NOT show it in getGroups()! It is exclusively displayed in getPendingGroupInvitations()
      // at the top of the Community page to avoid showing duplicate cards.
      if (isInvited && !isMember) {
        return false;
      }

      const hasLeftOrRemoved = this.hasUserLeftOrBeenRemoved(g, current.userId);

      if (g.isPublic) return true;

      return isCreator || isMember || hasLeftOrRemoved;
    }).sort((a, b) => new Date(b.lastMessageTime || b.createdAt || 0).getTime() - new Date(a.lastMessageTime || a.createdAt || 0).getTime());
  }

  public getGroupById(groupId: string): GroupChat | undefined {
    this.ensureStarterGroupsExist();
    return this.groupsList.find(g => g.groupId === groupId);
  }

  // Get members with whom the current user had previous 1-on-1 chats
  public getDirectChatPartners(): CommunityUser[] {
    const current = this.getCurrentUser();
    if (!current || !current.userId) return [];

    const partnerIds = new Set<string>();

    // 1. From messages list
    this.messagesList.forEach(m => {
      if (this.isViolationReportMessage(m)) return;
      if (m.senderId === current.userId && m.recipientId && m.recipientId !== current.userId) {
        partnerIds.add(m.recipientId);
      } else if (m.recipientId === current.userId && m.senderId && m.senderId !== current.userId) {
        partnerIds.add(m.senderId);
      }
    });

    // 2. From contacts list
    this.serverContactsList.forEach(c => {
      if (c.userId === current.userId && c.partnerId && c.partnerId !== current.userId) {
        partnerIds.add(c.partnerId);
      }
    });

    // Exclude current user & official support
    partnerIds.delete(current.userId);
    partnerIds.delete(ADMIN_USER_ID);

    const partners: CommunityUser[] = [];
    partnerIds.forEach(id => {
      if (this.isBlockedMutually(id)) return;
      const u = this.usersMap.get(id);
      if (u) {
        partners.push(u);
      } else {
        partners.push({
          userId: id,
          username: 'مستخدم المصحف',
          country: 'غير محدد',
          isOnline: false,
          createdAt: new Date().toISOString()
        });
      }
    });

    return partners;
  }

  // Get pending invitations for the current user
  public getPendingGroupInvitations(): GroupChat[] {
    const current = this.getCurrentUser();
    if (!current || !current.userId) return [];

    const seenGroupIds = new Set<string>();
    const seenGroupNames = new Set<string>();

    return this.groupsList.filter(g => {
      if (!g || !g.groupId) return false;
      const isInvited = Array.isArray(g.invitedMembers) && g.invitedMembers.includes(current.userId);
      const isMember = Array.isArray(g.members) && g.members.includes(current.userId);
      const isRejected = Array.isArray(g.rejectedMembers) && g.rejectedMembers.includes(current.userId);
      if (!isInvited || isMember || isRejected) return false;

      // Keep only one request per group ID
      if (seenGroupIds.has(g.groupId)) return false;
      seenGroupIds.add(g.groupId);

      // Also prevent duplicate requests if duplicate groups with same name/creator exist
      const normName = (this.cleanGroupName(g.name) || '').trim().toLowerCase();
      const creatorKey = `${g.createdBy || (g as any).creatorId || ''}_${normName}`;
      if (normName && seenGroupNames.has(creatorKey)) return false;
      if (normName) seenGroupNames.add(creatorKey);

      return true;
    });
  }

  // Accept group invitation
  public async acceptGroupInvitation(groupId: string): Promise<void> {
    const current = this.getCurrentUser();
    if (!current || !current.userId) return;

    const group = this.getGroupById(groupId);
    if (!group) return;

    const members = new Set<string>(group.members || []);
    members.add(current.userId);
    group.members = Array.from(members);
    group.memberCount = members.size;

    if (group.invitedMembers) {
      group.invitedMembers = group.invitedMembers.filter(id => id !== current.userId);
    }
    if (group.rejectedMembers) {
      group.rejectedMembers = group.rejectedMembers.filter(id => id !== current.userId);
    }
    if (group.leftMembers) {
      group.leftMembers = group.leftMembers.filter(id => id !== current.userId);
    }
    if (group.memberExitTimes) {
      delete group.memberExitTimes[current.userId];
    }
    this.groupExitTimesMap.delete(`${groupId}_${current.userId}`);

    this.saveToLocalStorage();

    try {
      await updateDoc(doc(db, 'group_chats', groupId), {
        members: group.members,
        memberCount: group.memberCount,
        invitedMembers: group.invitedMembers || [],
        rejectedMembers: group.rejectedMembers || [],
        leftMembers: group.leftMembers || [],
        memberExitTimes: group.memberExitTimes || {}
      });
    } catch (e) {
      try {
        await setDoc(doc(db, 'group_chats', groupId), this.cleanPayload(group), { merge: true });
      } catch (err) {}
    }

    window.dispatchEvent(new CustomEvent('community_groups_updated'));
  }

  // Decline / Reject group invitation
  public async declineGroupInvitation(groupId: string): Promise<void> {
    const current = this.getCurrentUser();
    if (!current || !current.userId) return;

    const group = this.getGroupById(groupId);
    if (!group) return;

    if (group.invitedMembers) {
      group.invitedMembers = group.invitedMembers.filter(id => id !== current.userId);
    }
    const rejected = new Set<string>(group.rejectedMembers || []);
    rejected.add(current.userId);
    group.rejectedMembers = Array.from(rejected);

    // Also remove from members just in case
    if (group.members) {
      group.members = group.members.filter(id => id !== current.userId);
      group.memberCount = group.members.length;
    }

    this.saveToLocalStorage();

    try {
      await updateDoc(doc(db, 'group_chats', groupId), {
        members: group.members || [],
        memberCount: group.memberCount || 0,
        invitedMembers: group.invitedMembers || [],
        rejectedMembers: group.rejectedMembers || []
      });
    } catch (e) {
      try {
        await setDoc(doc(db, 'group_chats', groupId), this.cleanPayload(group), { merge: true });
      } catch (err) {}
    }

    window.dispatchEvent(new CustomEvent('community_groups_updated'));
  }

  public async createGroup(
    name: string,
    description: string = '',
    invitedMemberIds: string[] = [],
    avatarUrl?: string,
    isPublic: boolean = false
  ): Promise<GroupChat> {
    const current = this.getCurrentUser();
    if (!this.isProfileComplete()) {
      throw new Error('يرجى حفظ اسمك وبيانات ملفك الشخصي أولاً قبل إنشاء محادثة جماعية.');
    }
    const rawName = (name || '').trim();
    // Strip emojis from the name text so the icon remains purely as the group's avatar/icon
    const cleanName = rawName.replace(/[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim() || rawName;
    if (cleanName.length < 2) {
      throw new Error('يرجى كتابة اسم مناسب للمحادثة الجماعية (حرفين على الأقل).');
    }

    const uniqueInvited = Array.from(new Set(invitedMemberIds)).filter(id => id && id !== current.userId);

    const groupId = 'group_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
    const newGroup: GroupChat = {
      groupId,
      name: cleanName,
      description: description.trim(),
      avatarUrl: (avatarUrl && avatarUrl.trim()) ? avatarUrl.trim() : '📖',
      createdBy: current.userId,
      creatorName: current.username,
      members: [current.userId],
      memberCount: 1,
      invitedMembers: uniqueInvited,
      rejectedMembers: [],
      lastMessage: '',
      lastMessageSenderName: current.username,
      lastMessageTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isPublic
    };

    this.groupsList.unshift(newGroup);
    this.saveToLocalStorage();

    try {
      const payload = this.cleanPayload(newGroup);
      await setDoc(doc(db, 'group_chats', groupId), payload);
    } catch (e: any) {
      console.warn('Error saving group to firestore:', e);
    }

    window.dispatchEvent(new CustomEvent('community_groups_updated'));

    // Send direct invitation message to each invited member
    if (uniqueInvited.length > 0) {
      for (const invitedId of uniqueInvited) {
        try {
          const inviteText = `السلام عليكم ورحمة الله، أدعوك للانضمام إلى مجموعة "${cleanName}". يمكنك قبول الدعوة من قسم المجموعات بالضغط على قبول والانضمام 🌿`;
          this.sendMessage(invitedId, inviteText).catch(() => {});
        } catch (err) {
          console.warn('Error sending invite message:', err);
        }
      }
    }

    return newGroup;
  }

  public cleanGroupName(name?: string): string {
    if (!name) return '';
    return name.replace(/[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim() || name;
  }

  public async updateGroup(
    groupId: string,
    updates: { name?: string; avatarUrl?: string; description?: string }
  ): Promise<GroupChat> {
    const current = this.getCurrentUser();
    const group = this.getGroupById(groupId);
    if (!group) {
      throw new Error('المجموعة غير موجودة.');
    }

    if (!this.isGroupCreator(group, current)) {
      throw new Error('فقط منشئ المجموعة يمكنه تعديل بيانات المجموعة.');
    }

    const firestoreUpdates: Record<string, any> = {};

    if (updates.name !== undefined) {
      const rawName = (updates.name || '').trim();
      const cleanName = rawName.replace(/[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim() || rawName;
      if (cleanName.length < 2) {
        throw new Error('يرجى كتابة اسم مناسب للمحادثة الجماعية (حرفين على الأقل).');
      }
      group.name = cleanName;
      firestoreUpdates.name = cleanName;
    }

    if (updates.avatarUrl !== undefined) {
      const cleanAvatar = updates.avatarUrl.trim() || '📖';
      group.avatarUrl = cleanAvatar;
      firestoreUpdates.avatarUrl = cleanAvatar;
    }

    if (updates.description !== undefined) {
      const cleanDesc = updates.description.trim();
      group.description = cleanDesc;
      firestoreUpdates.description = cleanDesc;
    }

    this.saveToLocalStorage();

    try {
      await updateDoc(doc(db, 'group_chats', groupId), firestoreUpdates);
    } catch (e: any) {
      try {
        await setDoc(doc(db, 'group_chats', groupId), this.cleanPayload(group), { merge: true });
      } catch (err: any) {
        console.warn('Error updating group in firestore:', err);
      }
    }

    window.dispatchEvent(new CustomEvent('community_groups_updated', { detail: { groupId } }));
    return group;
  }

  public async joinGroup(groupId: string): Promise<void> {
    const current = this.getCurrentUser();
    if (!current || !current.userId) return;

    const group = this.getGroupById(groupId);
    if (!group) return;

    // Check if user rejected
    if (group.rejectedMembers && group.rejectedMembers.includes(current.userId)) {
      return;
    }

    const members = new Set<string>(group.members || []);
    if (!members.has(current.userId)) {
      members.add(current.userId);
      group.members = Array.from(members);
      group.memberCount = members.size;
      if (group.invitedMembers) {
        group.invitedMembers = group.invitedMembers.filter(id => id !== current.userId);
      }
      this.saveToLocalStorage();

      try {
        await updateDoc(doc(db, 'group_chats', groupId), {
          members: group.members,
          memberCount: group.members.length,
          invitedMembers: group.invitedMembers || []
        });
      } catch (e) {
        try {
          await setDoc(doc(db, 'group_chats', groupId), this.cleanPayload(group), { merge: true });
        } catch (err) {}
      }

      window.dispatchEvent(new CustomEvent('community_groups_updated'));
    }
  }

  public async leaveGroup(groupId: string): Promise<void> {
    const current = this.getCurrentUser();
    if (!current || !current.userId) return;

    const group = this.getGroupById(groupId);
    if (!group) return;

    // Starter groups cannot be left
    if (group.groupId === 'group_default_quran_readers' || group.groupId === 'group_default_tadabbur') {
      return;
    }

    const nowIso = new Date().toISOString();
    const members = new Set<string>(group.members || []);
    members.delete(current.userId);
    group.members = Array.from(members);
    group.memberCount = members.size;

    if (!group.leftMembers) group.leftMembers = [];
    if (!group.leftMembers.includes(current.userId)) {
      group.leftMembers.push(current.userId);
    }
    if (!group.memberExitTimes) group.memberExitTimes = {};
    group.memberExitTimes[current.userId] = nowIso;

    this.recordExitTime(groupId, current.userId, nowIso);
    this.saveToLocalStorage();

    try {
      await updateDoc(doc(db, 'group_chats', groupId), {
        members: group.members,
        memberCount: group.members.length,
        leftMembers: group.leftMembers,
        memberExitTimes: group.memberExitTimes
      });
    } catch (e) {
      try {
        await setDoc(doc(db, 'group_chats', groupId), this.cleanPayload(group), { merge: true });
      } catch (err) {}
    }

    window.dispatchEvent(new CustomEvent('community_groups_updated'));
    window.dispatchEvent(new CustomEvent('community_group_messages_updated', { detail: { groupId } }));
  }

  public async addMemberToGroup(groupId: string, targetUserId: string): Promise<void> {
    const current = this.getCurrentUser();
    if (!current || !current.userId) return;

    const group = this.getGroupById(groupId);
    if (!group) return;

    const isCreator = group.createdBy === current.userId;
    const isAdmin = current.userId === ADMIN_USER_ID;

    if (!isCreator && !isAdmin) {
      throw new Error('لا يحق إلا لمنشئ المجموعة فقط إضافة ودعوة أصدقاء للمجموعة.');
    }

    if (group.members && group.members.includes(targetUserId)) {
      throw new Error('المستخدم عضو بالفعل في هذه المجموعة.');
    }

    if (!group.invitedMembers) {
      group.invitedMembers = [];
    }

    if (!group.invitedMembers.includes(targetUserId)) {
      group.invitedMembers.push(targetUserId);
    }

    if (group.rejectedMembers) {
      group.rejectedMembers = group.rejectedMembers.filter(id => id !== targetUserId);
    }
    if (group.leftMembers) {
      group.leftMembers = group.leftMembers.filter(id => id !== targetUserId);
    }
    if (group.memberExitTimes) {
      delete group.memberExitTimes[targetUserId];
    }
    this.groupExitTimesMap.delete(`${groupId}_${targetUserId}`);

    this.saveToLocalStorage();

    try {
      await updateDoc(doc(db, 'group_chats', groupId), {
        invitedMembers: group.invitedMembers || [],
        rejectedMembers: group.rejectedMembers || [],
        leftMembers: group.leftMembers || [],
        memberExitTimes: group.memberExitTimes || {}
      });
    } catch (e) {
      try {
        await setDoc(doc(db, 'group_chats', groupId), this.cleanPayload(group), { merge: true });
      } catch (err) {}
    }

    // Send direct invitation message to the target user
    try {
      const cleanName = this.cleanGroupName(group.name);
      const inviterName = current.username || 'أحد الأعضاء';
      const inviteText = `السلام عليكم ورحمة الله، أدعوك للانضمام إلى مجموعة "${cleanName}". يمكنك قبول الدعوة بالضغط على "قبول والانضمام" في قسم المجموعات 🌿`;
      this.sendMessage(targetUserId, inviteText).catch(() => {});
    } catch (err) {
      console.warn('Failed to send private invitation message to user:', err);
    }

    window.dispatchEvent(new CustomEvent('community_groups_updated'));
  }

  public async removeMemberFromGroup(groupId: string, targetUserId: string): Promise<void> {
    const current = this.getCurrentUser();
    if (!current || !current.userId) return;

    const group = this.getGroupById(groupId);
    if (!group) return;

    if (group.createdBy !== current.userId && current.userId !== ADMIN_USER_ID) {
      throw new Error('فقط منشئ المجموعة أو الإدارة يمكنه إزالة أعضاء.');
    }

    if (targetUserId === group.createdBy) {
      throw new Error('لا يمكن إزالة منشئ المجموعة.');
    }

    const nowIso = new Date().toISOString();
    const members = new Set<string>(group.members || []);
    members.delete(targetUserId);
    group.members = Array.from(members);
    group.memberCount = members.size;

    if (group.invitedMembers) {
      group.invitedMembers = group.invitedMembers.filter(id => id !== targetUserId);
    }

    if (!group.leftMembers) group.leftMembers = [];
    if (!group.leftMembers.includes(targetUserId)) {
      group.leftMembers.push(targetUserId);
    }
    if (!group.memberExitTimes) group.memberExitTimes = {};
    group.memberExitTimes[targetUserId] = nowIso;

    this.recordExitTime(groupId, targetUserId, nowIso);
    this.saveToLocalStorage();

    try {
      await updateDoc(doc(db, 'group_chats', groupId), {
        members: group.members,
        memberCount: group.members.length,
        invitedMembers: group.invitedMembers || [],
        leftMembers: group.leftMembers,
        memberExitTimes: group.memberExitTimes
      });
    } catch (e) {
      try {
        await setDoc(doc(db, 'group_chats', groupId), this.cleanPayload(group), { merge: true });
      } catch (err) {}
    }

    window.dispatchEvent(new CustomEvent('community_groups_updated'));
    window.dispatchEvent(new CustomEvent('community_group_messages_updated', { detail: { groupId } }));
  }

  public setAdminSession(active: boolean) {
    if (typeof sessionStorage !== 'undefined') {
      if (active) sessionStorage.setItem('mushaf_admin_session', 'true');
      else sessionStorage.removeItem('mushaf_admin_session');
    }
    if (typeof localStorage !== 'undefined') {
      if (active) localStorage.setItem('mushaf_admin_session_flag', 'true');
      else localStorage.removeItem('mushaf_admin_session_flag');
    }
  }

  public isUserAdminSession(): boolean {
    const cur = this.getCurrentUser();
    if (cur && cur.userId === ADMIN_USER_ID) return true;
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('mushaf_admin_session') === 'true') {
      return true;
    }
    if (typeof localStorage !== 'undefined' && localStorage.getItem('mushaf_admin_session_flag') === 'true') {
      return true;
    }
    return false;
  }

  public isCurrentUserAdmin(): boolean {
    const current = this.getCurrentUser();
    return !!(current && current.userId === ADMIN_USER_ID) || this.isUserAdminSession();
  }

  public isGroupCreator(group?: GroupChat | null, user?: CommunityUser | null): boolean {
    if (!group) return false;
    const current = user || this.getCurrentUser();
    if (!current || !current.userId) return false;

    // Admin has full creator powers over any group
    if (current.userId === ADMIN_USER_ID || this.isUserAdminSession()) return true;

    // Starter groups cannot be deleted by normal users
    if (group.groupId === 'group_default_quran_readers' || group.groupId === 'group_default_tadabbur') {
      return false;
    }

    const curId = String(current.userId || '').trim();
    const curName = String(current.username || '').trim().toLowerCase();
    const grpCreatorId = String(group.createdBy || '').trim();
    const grpCreatorName = String(group.creatorName || '').trim().toLowerCase();

    // Match by creator userId
    if (grpCreatorId && grpCreatorId === curId) return true;
    // Match by creator username
    if (grpCreatorName && curName && grpCreatorName === curName) return true;
    // Fallback if createdBy is empty or first member is user
    if (!grpCreatorId && Array.isArray(group.members) && group.members[0] === curId) return true;

    return false;
  }

  /**
   * Returns all community groups for the admin dashboard (/alaa.ahmed)
   * Without any user filtering so every single group created by users is visible.
   */
  public getAllGroupsForAdmin(): GroupChat[] {
    this.ensureStarterGroupsExist();
    return [...this.groupsList].sort((a, b) => 
      new Date(b.lastMessageTime || b.createdAt || 0).getTime() - new Date(a.lastMessageTime || a.createdAt || 0).getTime()
    );
  }

  /**
   * Unrestricted group deletion for admin
   */
  public async adminDeleteGroup(groupId: string): Promise<void> {
    const group = this.getGroupById(groupId);
    if (!group) return;

    // 1. Remove from in-memory state
    this.groupsList = this.groupsList.filter(g => g.groupId !== groupId);
    this.groupMessagesList = this.groupMessagesList.filter(m => m.groupId !== groupId);
    this.saveToLocalStorage();

    // 2. Delete the group document from Firestore
    try {
      await deleteDoc(doc(db, 'group_chats', groupId));
    } catch (e) {
      console.warn('Error deleting group from Firestore:', e);
    }

    // 3. Delete all associated messages from Firestore
    try {
      const q = query(collection(db, 'group_messages'), where('groupId', '==', groupId));
      const snap = await getDocs(q);
      const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
    } catch (e) {
      console.warn('Error deleting group messages from Firestore:', e);
    }

    // 4. Dispatch events to notify all active components
    window.dispatchEvent(new CustomEvent('community_groups_updated'));
    window.dispatchEvent(new CustomEvent('community_group_messages_updated', { detail: { groupId } }));
  }

  /**
   * Delete single group message by admin
   */
  public async adminDeleteGroupMessage(messageId: string): Promise<void> {
    const msg = this.groupMessagesList.find(m => m.messageId === messageId);
    const groupId = msg?.groupId;

    this.groupMessagesList = this.groupMessagesList.filter(m => m.messageId !== messageId);
    this.saveToLocalStorage();

    try {
      await deleteDoc(doc(db, 'group_messages', messageId));
    } catch (e) {
      console.warn('Error deleting group message:', e);
    }

    window.dispatchEvent(new CustomEvent('community_group_messages_updated', { detail: { groupId } }));
  }

  /**
   * Clear all messages inside a group by admin
   */
  public async adminClearGroupMessages(groupId: string): Promise<void> {
    this.groupMessagesList = this.groupMessagesList.filter(m => m.groupId !== groupId);
    this.saveToLocalStorage();

    try {
      const q = query(collection(db, 'group_messages'), where('groupId', '==', groupId));
      const snap = await getDocs(q);
      const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
    } catch (e) {
      console.warn('Error clearing group messages:', e);
    }

    window.dispatchEvent(new CustomEvent('community_group_messages_updated', { detail: { groupId } }));
  }

  /**
   * Remove member from group by admin
   */
  public async adminRemoveMemberFromGroup(groupId: string, targetUserId: string): Promise<void> {
    const group = this.getGroupById(groupId);
    if (!group) return;

    const nowIso = new Date().toISOString();
    const members = new Set<string>(group.members || []);
    members.delete(targetUserId);
    group.members = Array.from(members);
    group.memberCount = members.size;

    if (group.invitedMembers) {
      group.invitedMembers = group.invitedMembers.filter(id => id !== targetUserId);
    }
    if (!group.leftMembers) group.leftMembers = [];
    if (!group.leftMembers.includes(targetUserId)) {
      group.leftMembers.push(targetUserId);
    }
    if (!group.memberExitTimes) group.memberExitTimes = {};
    group.memberExitTimes[targetUserId] = nowIso;

    this.recordExitTime(groupId, targetUserId, nowIso);
    this.saveToLocalStorage();

    try {
      await updateDoc(doc(db, 'group_chats', groupId), {
        members: group.members,
        memberCount: group.members.length,
        invitedMembers: group.invitedMembers || [],
        leftMembers: group.leftMembers,
        memberExitTimes: group.memberExitTimes
      });
    } catch (e) {
      try {
        await setDoc(doc(db, 'group_chats', groupId), this.cleanPayload(group), { merge: true });
      } catch (err) {}
    }

    window.dispatchEvent(new CustomEvent('community_groups_updated'));
    window.dispatchEvent(new CustomEvent('community_group_messages_updated', { detail: { groupId } }));
  }

  /**
   * Send official admin announcement or message into any group
   */
  public async adminSendGroupMessage(
    groupId: string,
    text: string,
    senderName: string = 'الإدارة العامة 🛡️'
  ): Promise<GroupMessage> {
    const group = this.getGroupById(groupId);
    const messageId = 'gmsg_admin_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
    const newMsg: GroupMessage = {
      messageId,
      groupId,
      senderId: ADMIN_USER_ID,
      senderName,
      senderAvatarUrl: '',
      senderCountry: 'الإدارة 🛡️',
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    this.groupMessagesList.push(newMsg);
    if (group) {
      group.lastMessage = text.trim();
      group.lastMessageSenderName = senderName;
      group.lastMessageTime = newMsg.createdAt;
    }
    this.saveToLocalStorage();

    try {
      const payload = this.cleanPayload(newMsg);
      await setDoc(doc(db, 'group_messages', messageId), payload);
      if (group) {
        await updateDoc(doc(db, 'group_chats', groupId), {
          lastMessage: group.lastMessage,
          lastMessageSenderName: group.lastMessageSenderName,
          lastMessageTime: group.lastMessageTime
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Error sending admin group message:', e);
    }

    window.dispatchEvent(new CustomEvent('community_group_messages_updated', { detail: { groupId } }));
    window.dispatchEvent(new CustomEvent('community_groups_updated'));
    return newMsg;
  }

  /**
   * Update any group details as admin
   */
  public async adminUpdateGroup(
    groupId: string,
    updates: { name?: string; avatarUrl?: string; description?: string }
  ): Promise<GroupChat> {
    const group = this.getGroupById(groupId);
    if (!group) throw new Error('المجموعة غير موجودة');

    const firestoreUpdates: Record<string, any> = {};
    if (updates.name !== undefined) {
      const rawName = (updates.name || '').trim();
      const cleanName = this.cleanGroupName(rawName) || rawName;
      group.name = cleanName;
      firestoreUpdates.name = cleanName;
    }
    if (updates.avatarUrl !== undefined) {
      const cleanAvatar = updates.avatarUrl.trim() || '📖';
      group.avatarUrl = cleanAvatar;
      firestoreUpdates.avatarUrl = cleanAvatar;
    }
    if (updates.description !== undefined) {
      group.description = updates.description.trim();
      firestoreUpdates.description = updates.description.trim();
    }

    this.saveToLocalStorage();
    try {
      await updateDoc(doc(db, 'group_chats', groupId), firestoreUpdates);
    } catch (e) {
      try {
        await setDoc(doc(db, 'group_chats', groupId), this.cleanPayload(group), { merge: true });
      } catch (err) {}
    }

    window.dispatchEvent(new CustomEvent('community_groups_updated', { detail: { groupId } }));
    return group;
  }

  public async deleteGroup(groupId: string): Promise<void> {
    const current = this.getCurrentUser();
    const group = this.getGroupById(groupId);
    if (!group) return;

    if (!this.isGroupCreator(group, current)) {
      throw new Error('فقط منشئ المجموعة يمكنه حذف هذه المجموعة.');
    }

    // 1. Remove from in-memory state
    this.groupsList = this.groupsList.filter(g => g.groupId !== groupId);
    this.groupMessagesList = this.groupMessagesList.filter(m => m.groupId !== groupId);
    this.saveToLocalStorage();

    // 2. Delete the group document from Firestore
    try {
      await deleteDoc(doc(db, 'group_chats', groupId));
    } catch (e) {
      console.warn('Error deleting group from Firestore:', e);
    }

    // 3. Delete all associated messages from Firestore
    try {
      const q = query(collection(db, 'group_messages'), where('groupId', '==', groupId));
      const snap = await getDocs(q);
      const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
    } catch (e) {
      console.warn('Error deleting group messages from Firestore:', e);
    }

    // 4. Dispatch events to notify all active components
    window.dispatchEvent(new CustomEvent('community_groups_updated'));
    window.dispatchEvent(new CustomEvent('community_group_messages_updated', { detail: { groupId } }));
  }

  public getGroupMessages(groupId: string): GroupMessage[] {
    // 1. Starter public groups: ALWAYS accessible to ALL users with ALL messages!
    if (groupId === 'group_default_quran_readers' || groupId === 'group_default_tadabbur') {
      return this.groupMessagesList
        .filter(m => m.groupId === groupId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    const current = this.getCurrentUser();
    const group = this.getGroupById(groupId);

    // If user has left or was removed from this custom group:
    if (current?.userId && group && !this.isGroupCreator(group, current) && current.userId !== ADMIN_USER_ID) {
      const isMember = Array.isArray(group.members) && group.members.includes(current.userId);
      if (!isMember) {
        let exitTime = this.getMemberExitTime(groupId, current.userId);
        if (!exitTime) {
          const nowIso = new Date().toISOString();
          this.recordExitTime(groupId, current.userId, nowIso);
          exitTime = nowIso;
        }
        const exitTimeMs = new Date(exitTime).getTime();
        return this.groupMessagesList
          .filter(m => {
            if (m.groupId !== groupId) return false;
            // Do NOT show any messages sent AFTER exit time!
            const msgTime = new Date(m.createdAt).getTime();
            return msgTime <= exitTimeMs;
          })
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
    }

    return this.groupMessagesList
      .filter(m => m.groupId === groupId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public async sendGroupMessage(
    groupId: string,
    text: string,
    verseData?: QuranVerseAttachment,
    audioUrl?: string,
    audioDuration?: number,
    attachment?: ChatAttachment
  ): Promise<GroupMessage> {
    const current = this.getCurrentUser();
    if (!this.isProfileComplete()) {
      throw new Error('يرجى حفظ اسمك وبيانات ملفك الشخصي أولاً قبل إرسال الرسائل.');
    }

    const isStarter = groupId === 'group_default_quran_readers' || groupId === 'group_default_tadabbur';
    const group = this.getGroupById(groupId);
    if (!isStarter && group) {
      const isMember = Array.isArray(group.members) && group.members.includes(current.userId);
      const isCreator = this.isGroupCreator(group, current);
      if (!isMember && !isCreator && !this.isUserAdminSession()) {
        throw new Error('لا يمكنك إرسال رسائل جديدة لأنك لست عضواً في هذه المجموعة.');
      }
    }

    const checkText = (text || '') + (verseData?.customNote ? ' ' + verseData.customNote : '');
    const modResult = checkContentModeration(checkText);
    if (modResult.isViolating) {
      throw new Error('عفواً، تحتوي الرسالة على كلمات غير لائقة مخالفة لشروط الاستخدام.');
    }

    const messageId = 'gmsg_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
    const newMsg: GroupMessage = {
      messageId,
      groupId,
      senderId: current.userId,
      senderName: current.username,
      senderAvatarUrl: current.avatarUrl,
      senderCountry: current.country,
      text: text.trim(),
      verseData,
      audioUrl,
      audioDuration,
      attachment,
      createdAt: new Date().toISOString()
    };

    this.groupMessagesList.push(newMsg);

    if (group) {
      group.lastMessage = text.trim() || (attachment ? (attachment.type === 'image' ? 'صورة 📷' : attachment.type === 'video' ? 'فيديو 🎥' : `ملف: ${attachment.fileName || 'مستند'} 📄`) : (verseData ? `آية من سورة ${verseData.surahName}` : audioUrl ? 'مقطع صوتي 🎙️' : 'رسالة جديدة'));
      group.lastMessageSenderName = current.username;
      group.lastMessageTime = newMsg.createdAt;
      if (!group.members) group.members = [];
      if (!group.members.includes(current.userId)) {
        group.members.push(current.userId);
        group.memberCount = group.members.length;
      }
    }

    this.saveToLocalStorage();

    try {
      const payload = this.cleanPayload(newMsg);
      await setDoc(doc(db, 'group_messages', messageId), payload);

      if (group) {
        await updateDoc(doc(db, 'group_chats', groupId), {
          lastMessage: group.lastMessage,
          lastMessageSenderName: group.lastMessageSenderName,
          lastMessageTime: group.lastMessageTime,
          members: group.members,
          memberCount: group.memberCount || group.members.length
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Error sending group message to Firestore:', e);
    }

    window.dispatchEvent(new CustomEvent('community_group_messages_updated', { detail: { groupId } }));
    window.dispatchEvent(new CustomEvent('community_groups_updated'));

    return newMsg;
  }

  public async deleteGroupMessage(messageId: string): Promise<void> {
    const msg = this.groupMessagesList.find(m => m.messageId === messageId);
    const groupId = msg?.groupId;

    this.groupMessagesList = this.groupMessagesList.filter(m => m.messageId !== messageId);
    this.saveToLocalStorage();

    try {
      await deleteDoc(doc(db, 'group_messages', messageId));
    } catch (e) {}

    window.dispatchEvent(new CustomEvent('community_group_messages_updated', { detail: { groupId } }));
  }

  public async clearGroupMessages(groupId: string): Promise<void> {
    this.groupMessagesList = this.groupMessagesList.filter(m => m.groupId !== groupId);
    this.saveToLocalStorage();

    try {
      const q = query(collection(db, 'group_messages'), where('groupId', '==', groupId));
      const snap = await getDocs(q);
      snap.forEach(d => deleteDoc(d.ref).catch(() => {}));
    } catch (e) {}

    window.dispatchEvent(new CustomEvent('community_group_messages_updated', { detail: { groupId } }));
  }
}

export const communityService = new CommunityService();
