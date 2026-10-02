import { 
  db, auth, googleProvider, 
  signInWithPopup, signInWithRedirect, getRedirectResult, 
  signOut, onAuthStateChanged 
} from '../lib/firebase';
import { 
  collection, doc, setDoc, getDoc, getDocs, onSnapshot, 
  updateDoc, deleteDoc 
} from 'firebase/firestore';

export interface QuranVerseAttachment {
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  fromAyah?: number;
  toAyah?: number;
  text: string;
  audioUrl?: string;
  shareType?: 'text' | 'image' | 'page' | 'audio';
  bgValue?: string;
  bgText?: string;
  frameType?: string;
  frameColor?: string;
  textColor?: string;
  fontSize?: number;
  fontClass?: string;
  customNote?: string;
}

export interface CommunityUser {
  userId: string;
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

export interface ChatMessage {
  messageId: string;
  chatId: string;
  senderId: string;
  recipientId: string;
  text: string;
  verseData?: QuranVerseAttachment;
  audioUrl?: string;
  isRead: boolean;
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

const STORAGE_KEY_USER = 'mushaf_community_current_user_v8';
const STORAGE_KEY_USERS_ALL = 'mushaf_community_global_users_v8';
const STORAGE_KEY_MESSAGES = 'mushaf_community_messages_v8';
const STORAGE_KEY_BLOCKS = 'mushaf_community_blocks_v8';

class CommunityService {
  private currentUser: CommunityUser | null = null;
  private usersMap: Map<string, CommunityUser> = new Map();
  private messagesList: ChatMessage[] = [];
  private blocksList: BlockRecord[] = [];
  private pollInterval: any = null;
  private heartbeatInterval: any = null;

  constructor() {
    this.initCurrentUser();
    this.loadFromLocalStorage();
    this.setupFirestoreListeners();
    this.setupAuthListener();
    this.setupPresenceLifecycle();
    if (localStorage.getItem('server_purged_v3') !== 'true') {
      localStorage.setItem('server_purged_v3', 'true');
      this.clearAllServerData();
    } else {
      this.fetchLatestUsers();
    }
    this.startPolling();
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

  public initCurrentUser(): CommunityUser {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      if (stored) {
        this.currentUser = JSON.parse(stored);
        return this.currentUser!;
      }
    } catch (e) {}

    const randomId = 'usr_' + Math.random().toString(36).substr(2, 9);
    this.currentUser = {
      userId: randomId,
      username: '',
      country: '',
      bio: '',
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

  public async loginWithGoogleAccount(uid: string, displayName: string, avatarUrl: string, email?: string): Promise<CommunityUser> {
    let existingProfile: CommunityUser | null = null;
    try {
      const docSnap = await getDoc(doc(db, 'users', uid));
      if (docSnap.exists()) {
        existingProfile = docSnap.data() as CommunityUser;
      }
    } catch (e) {
      console.warn('Error fetching Google user profile:', e);
    }

    const nowIso = new Date().toISOString();
    if (existingProfile) {
      this.currentUser = {
        ...existingProfile,
        userId: uid,
        email: email || existingProfile.email,
        isGoogleAuth: true,
        isOnline: true,
        lastSeen: nowIso
      };
    } else {
      this.currentUser = {
        userId: uid,
        username: displayName || '',
        avatarUrl: avatarUrl || '',
        country: '',
        bio: '',
        email: email || undefined,
        isGoogleAuth: true,
        isOnline: true,
        lastSeen: nowIso,
        createdAt: nowIso
      };
    }

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.currentUser));
    this.usersMap.set(uid, this.currentUser);

    try {
      const payload = this.cleanPayload(this.currentUser);
      await setDoc(doc(db, 'users', uid), payload, { merge: true });
    } catch (e) {
      console.error('Error saving Google user to Firestore:', e);
    }

    window.dispatchEvent(new CustomEvent('community_user_updated', { detail: this.currentUser }));
    this.sendHeartbeat();
    return this.currentUser;
  }

  public async loginWithGoogle(useRedirect: boolean = false): Promise<CommunityUser> {
    if (useRedirect) {
      await signInWithRedirect(auth, googleProvider);
      return this.getCurrentUser();
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      return await this.loginWithGoogleAccount(
        fbUser.uid,
        fbUser.displayName || '',
        fbUser.photoURL || '',
        fbUser.email || undefined
      );
    } catch (e: any) {
      console.warn('signInWithPopup error:', e);
      // If popup was blocked or failed due to mobile / browser restrictions, trigger redirect
      if (
        e?.code === 'auth/popup-blocked' || 
        e?.code === 'auth/popup-closed-by-user' || 
        e?.code === 'auth/cancelled-popup-request' ||
        e?.code === 'auth/unauthorized-domain'
      ) {
        throw e;
      }
      throw e;
    }
  }

  public async loginWithGoogleRedirect(): Promise<void> {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (e) {
      console.error('signInWithRedirect error:', e);
      throw e;
    }
  }

  public async logoutGoogle(): Promise<void> {
    const userToSignOut = this.currentUser;
    if (userToSignOut && userToSignOut.userId) {
      // Do not use await here to prevent blocking if network or auth is in a bad state
      updateDoc(doc(db, 'users', userToSignOut.userId), {
        isOnline: false,
        lastSeen: new Date().toISOString()
      }).catch(() => {});
    }

    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signOut notice:', e);
    }
    
    // Clear stored authenticated user and re-initialize as anonymous guest
    localStorage.removeItem(STORAGE_KEY_USER);
    this.currentUser = null;
    const freshUser = this.initCurrentUser();
    window.dispatchEvent(new CustomEvent('community_user_updated', { detail: freshUser }));
  }

  private setupPresenceLifecycle() {
    if (typeof window === 'undefined') return;

    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    // Send heartbeat every 20 seconds while app is open and active
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 20000);

    window.addEventListener('beforeunload', () => {
      this.setOfflineStatusSync();
    });

    window.addEventListener('pagehide', () => {
      this.setOfflineStatusSync();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.sendHeartbeat();
      } else {
        this.updateLastSeen();
      }
    });
  }

  public getUserById(userId: string): CommunityUser | undefined {
    return this.usersMap.get(userId);
  }

  public async sendHeartbeat() {
    const user = this.currentUser;
    if (!user || !user.userId) return;
    const nowIso = new Date().toISOString();
    user.isOnline = true;
    user.lastSeen = nowIso;
    this.usersMap.set(user.userId, user);

    try {
      await updateDoc(doc(db, 'users', user.userId), {
        isOnline: true,
        lastSeen: nowIso
      });
    } catch (e) {}
  }

  public setOfflineStatusSync() {
    const user = this.currentUser;
    if (!user || !user.userId) return;
    user.isOnline = false;
    user.lastSeen = new Date().toISOString();
    try {
      updateDoc(doc(db, 'users', user.userId), {
        isOnline: false,
        lastSeen: user.lastSeen
      }).catch(() => {});
    } catch (e) {}
  }

  public async updateLastSeen() {
    const user = this.currentUser;
    if (!user || !user.userId) return;
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
    if (!user.isOnline) return false;
    if (!user.lastSeen) return false;

    const lastSeenTime = new Date(user.lastSeen).getTime();
    if (isNaN(lastSeenTime)) return false;

    // A user is considered online if lastSeen heartbeat was sent within last 50 seconds
    const diffSeconds = (Date.now() - lastSeenTime) / 1000;
    return diffSeconds <= 50;
  }

  public getUserStatusText(user?: CommunityUser | null): string {
    if (!user) return 'غير متصل';
    if (this.isUserOnline(user)) return 'متصل الآن';

    if (!user.lastSeen) return 'غير متصل';
    const lastSeenTime = new Date(user.lastSeen).getTime();
    if (isNaN(lastSeenTime)) return 'غير متصل';

    const diffSeconds = Math.max(0, Math.floor((Date.now() - lastSeenTime) / 1000));
    if (diffSeconds < 60) return 'نشط منذ لحظات';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `نشط منذ ${diffMinutes} د`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `نشط منذ ${diffHours} س`;
    const diffDays = Math.floor(diffHours / 24);
    return `آخر ظهور منذ ${diffDays} يوم`;
  }

  private setupAuthListener() {
    try {
      // Handle login redirect results if user returned from Google redirect sign-in
      getRedirectResult(auth).then(async (result) => {
        if (result && result.user) {
          const fbUser = result.user;
          await this.loginWithGoogleAccount(
            fbUser.uid,
            fbUser.displayName || '',
            fbUser.photoURL || '',
            fbUser.email || undefined
          );
        }
      }).catch((e) => {
        console.warn('getRedirectResult notice:', e);
      });

      onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const uid = fbUser.uid;
          try {
            const docSnap = await getDoc(doc(db, 'users', uid));
            if (docSnap.exists()) {
              const profile = docSnap.data() as CommunityUser;
              this.currentUser = {
                ...profile,
                userId: uid,
                isGoogleAuth: true,
                isOnline: true,
                lastSeen: new Date().toISOString()
              };
              localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.currentUser));
              this.usersMap.set(uid, this.currentUser);
              window.dispatchEvent(new CustomEvent('community_user_updated', { detail: this.currentUser }));
              this.sendHeartbeat();
            } else {
              // Initial Google user creation if first time
              await this.loginWithGoogleAccount(
                uid,
                fbUser.displayName || '',
                fbUser.photoURL || '',
                fbUser.email || undefined
              );
            }
          } catch (e) {
            console.warn('onAuthStateChanged profile fetch error:', e);
          }
        } else {
          // Firebase reports signed out
          if (this.currentUser && this.currentUser.isGoogleAuth) {
            localStorage.removeItem(STORAGE_KEY_USER);
            this.currentUser = null;
            const fresh = this.initCurrentUser();
            window.dispatchEvent(new CustomEvent('community_user_updated', { detail: fresh }));
          }
        }
      });
    } catch (e) {}
  }

  public isProfileComplete(): boolean {
    const user = this.getCurrentUser();
    return Boolean(
      user &&
      user.username && user.username.trim().length >= 2 &&
      user.country && user.country.trim().length > 0 &&
      user.avatarUrl && user.avatarUrl.trim().length > 0
    );
  }

  public isProfileSetup(): boolean {
    return this.isProfileComplete();
  }

  public async saveCurrentUser(username: string, country: string = '', bio?: string, avatarUrl?: string): Promise<CommunityUser> {
    const user = this.getCurrentUser();
    user.username = username.trim();
    user.country = country;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    user.isOnline = true;

    this.currentUser = user;
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      this.usersMap.set(user.userId, user);
      
      const payload = this.cleanPayload(user);
      await setDoc(doc(db, 'users', user.userId), payload, { merge: true });

      this.saveToLocalStorage();
      window.dispatchEvent(new CustomEvent('community_user_updated', { detail: user }));
    } catch (e) {
      console.error('Error saving user to Firestore:', e);
    }

    return user;
  }

  private loadFromLocalStorage() {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEY_USERS_ALL);
      if (storedUsers) {
        const arr: CommunityUser[] = JSON.parse(storedUsers);
        arr.forEach(u => {
          if (u && u.userId) this.usersMap.set(u.userId, u);
        });
      }

      const storedMsgs = localStorage.getItem(STORAGE_KEY_MESSAGES);
      if (storedMsgs) {
        this.messagesList = JSON.parse(storedMsgs);
      }

      const storedBlocks = localStorage.getItem(STORAGE_KEY_BLOCKS);
      if (storedBlocks) {
        this.blocksList = JSON.parse(storedBlocks);
      }
    } catch (e) {}
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_USERS_ALL, JSON.stringify(Array.from(this.usersMap.values())));
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(this.messagesList));
      localStorage.setItem(STORAGE_KEY_BLOCKS, JSON.stringify(this.blocksList));
    } catch (e) {}
  }

  private activeTab: 'users' | 'chats' | 'blocked' = 'users';

  public getActiveTab(): 'users' | 'chats' | 'blocked' {
    try {
      const saved = sessionStorage.getItem('community_active_tab') as any;
      if (saved && ['users', 'chats', 'blocked'].includes(saved)) {
        return saved;
      }
    } catch (e) {}
    return this.activeTab;
  }

  public setActiveTab(tab: 'users' | 'chats' | 'blocked') {
    this.activeTab = tab;
    try {
      sessionStorage.setItem('community_active_tab', tab);
    } catch (e) {}
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

      // 4. Clear local memory and storage completely
      this.usersMap.clear();
      this.messagesList = [];
      this.blocksList = [];

      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_USERS_ALL);
      localStorage.removeItem(STORAGE_KEY_MESSAGES);
      localStorage.removeItem(STORAGE_KEY_BLOCKS);

      // Reset current user object
      this.currentUser = {
        userId: 'usr_' + Math.random().toString(36).substr(2, 9),
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
      const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
      const snapshot = await getDocs(collection(db, 'messages'));
      snapshot.forEach((docSnap) => {
        const msg = docSnap.data() as ChatMessage;
        if (msg && msg.createdAt) {
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
    this.purgeExpiredServerMessages();
    this.pollInterval = setInterval(() => {
      this.fetchLatestUsers();
      this.fetchLatestMessages();
      this.purgeExpiredServerMessages();
    }, 5000);
  }

  public async fetchLatestUsers(): Promise<CommunityUser[]> {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as CommunityUser;
        if (data && data.userId && data.username && data.username.trim()) {
          this.usersMap.set(data.userId, data);
        }
      });
      this.saveToLocalStorage();
      window.dispatchEvent(new CustomEvent('community_user_updated'));
    } catch (e) {
      console.warn('Firestore fetch users:', e);
    }
    return Array.from(this.usersMap.values());
  }

  public async fetchLatestMessages(): Promise<ChatMessage[]> {
    try {
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

          const exists = this.messagesList.some(m => m.messageId === msg.messageId);
          if (!exists) {
            this.messagesList.push(msg);
          } else {
            const idx = this.messagesList.findIndex(m => m.messageId === msg.messageId);
            if (idx >= 0) this.messagesList[idx] = msg;
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

  private setupFirestoreListeners() {
    const current = this.getCurrentUser();

    try {
      onSnapshot(collection(db, 'users'), (snapshot) => {
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as CommunityUser;
          if (data && data.userId && data.username && data.username.trim()) {
            this.usersMap.set(data.userId, data);
          }
        });
        this.saveToLocalStorage();
        window.dispatchEvent(new CustomEvent('community_user_updated'));
      }, (err) => console.warn('Firestore Users Listener:', err));
    } catch (e) {}

    try {
      onSnapshot(collection(db, 'messages'), (snapshot) => {
        const cutoffTime = Date.now() - (24 * 60 * 60 * 1000);
        snapshot.docChanges().forEach((change) => {
          const msg = change.doc.data() as ChatMessage;
          if (msg && msg.messageId) {
            const msgTime = new Date(msg.createdAt).getTime();
            if (!isNaN(msgTime) && msgTime < cutoffTime) {
              deleteDoc(doc(db, 'messages', change.doc.id)).catch(() => {});
              return;
            }

            if (change.type === 'added') {
              if (msg.recipientId === current.userId || msg.senderId === current.userId) {
                const exists = this.messagesList.some(m => m.messageId === msg.messageId);
                if (!exists) {
                  this.messagesList.push(msg);
                  if (msg.recipientId === current.userId && !msg.isRead) {
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

  public getTotalRegisteredCount(): number {
    return Array.from(this.usersMap.values()).filter(u => u.username && u.username.trim().length > 0).length;
  }

  public getVisibleUsers(searchQuery: string = ''): CommunityUser[] {
    const current = this.getCurrentUser();
    const queryLower = searchQuery.trim().toLowerCase();

    const allUsersArray = Array.from(this.usersMap.values());

    return allUsersArray.filter(u => {
      if (u.userId === current.userId) return false;
      if (!u.username || !u.username.trim()) return false;
      if (this.isBlockedMutually(u.userId)) return false;

      if (queryLower) {
        const matchesName = u.username.toLowerCase().includes(queryLower);
        const matchesCountry = u.country.toLowerCase().includes(queryLower);
        const matchesBio = u.bio?.toLowerCase().includes(queryLower);
        return matchesName || matchesCountry || matchesBio;
      }

      return true;
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

  public getMessagesForChat(partnerUserId: string): ChatMessage[] {
    const current = this.getCurrentUser();
    const chatId = this.getChatId(current.userId, partnerUserId);

    return this.messagesList
      .filter(m => m.chatId === chatId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public async sendMessage(
    recipientId: string, 
    text: string, 
    verseData?: QuranVerseAttachment, 
    audioUrl?: string
  ): Promise<ChatMessage> {
    const current = this.getCurrentUser();
    if (!current.isGoogleAuth) {
      throw new Error('عفواً، يجب تسجيل الدخول باستخدام Google أولاً لبدء التراسل وإرسال الرسائل.');
    }
    const chatId = this.getChatId(current.userId, recipientId);
    const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    const newMsg: ChatMessage = {
      messageId: msgId,
      chatId,
      senderId: current.userId,
      recipientId,
      text: text.trim(),
      verseData,
      audioUrl,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    this.messagesList.push(newMsg);
    this.saveToLocalStorage();

    this.setTypingStatus(recipientId, false);

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

    const toDelete = this.messagesList.filter(m => m.chatId === chatId);
    this.messagesList = this.messagesList.filter(m => m.chatId !== chatId);
    this.saveToLocalStorage();

    toDelete.forEach(async (m) => {
      try {
        await deleteDoc(doc(db, 'messages', m.messageId));
      } catch (e) {}
    });

    window.dispatchEvent(new CustomEvent('community_messages_updated'));
  }

  public getActiveConversations(): ChatConversation[] {
    const current = this.getCurrentUser();
    const partnersMap = new Map<string, { lastMsg: ChatMessage; unread: number }>();

    this.messagesList.forEach(m => {
      let partnerId = '';
      if (m.senderId === current.userId) partnerId = m.recipientId;
      else if (m.recipientId === current.userId) partnerId = m.senderId;

      if (!partnerId) return;

      if (this.isBlockedMutually(partnerId)) return;

      const existing = partnersMap.get(partnerId);
      const isUnread = m.recipientId === current.userId && !m.isRead;

      if (!existing || new Date(m.createdAt).getTime() > new Date(existing.lastMsg.createdAt).getTime()) {
        partnersMap.set(partnerId, {
          lastMsg: m,
          unread: (existing?.unread || 0) + (isUnread ? 1 : 0)
        });
      } else if (isUnread) {
        existing.unread += 1;
      }
    });

    const conversations: ChatConversation[] = [];
    partnersMap.forEach((val, partnerId) => {
      const partnerUser = this.usersMap.get(partnerId) || {
        userId: partnerId,
        username: 'مستخدم المصحف',
        country: 'غير محدد',
        isOnline: false,
        createdAt: new Date().toISOString()
      };

      conversations.push({
        chatId: this.getChatId(current.userId, partnerId),
        partner: partnerUser,
        lastMessage: val.lastMsg.text || (val.lastMsg.verseData ? `آية من سورة ${val.lastMsg.verseData.surahName}` : 'مقطع صوتي 🎙️'),
        lastMessageTime: val.lastMsg.createdAt,
        unreadCount: val.unread
      });
    });

    return conversations.sort((a, b) => new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime());
  }
}

export const communityService = new CommunityService();
