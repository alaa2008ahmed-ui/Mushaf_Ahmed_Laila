import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, MessageSquare, Users, Ban, User, Edit3, 
  Sparkles, Globe, Shield, CheckCircle2, UserX, RefreshCw, Trash2, KeyRound, Copy,
  BookOpen, Trophy, Check, X, EyeOff, UserPlus, Clock, ShieldCheck
} from 'lucide-react';
import { communityService, CommunityUser, ChatConversation, GroupChat, ADMIN_USER_ID } from '../services/communityService';
import { SUPPORT_AVATAR_BASE64 } from '../src/supportAvatarBase64';
import UsernameModal from '../components/Community/UsernameModal';
import { AdminDashboardModal } from '../components/Community/AdminDashboardModal';
import CreateGroupModal from '../components/Community/CreateGroupModal';
import EditGroupModal from '../components/Community/EditGroupModal';
import BottomBar from '../components/BottomBar';
import TutorialOverlay, { TutorialStep } from '../components/Tutorial/TutorialOverlay';
import { useTheme } from '../context/ThemeContext';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { useShowNewBadge } from '../utils/badgeManager';

interface CommunityPageProps {
  onBack: () => void;
  onNavigate: (pageId: string, params?: any) => void;
  initialTab?: 'users' | 'chats' | 'community' | 'blocked';
}

const CommunityPage: React.FC<CommunityPageProps> = ({ onBack, onNavigate, initialTab }) => {
  const { theme, themeKey } = useTheme();
  const showNewBadge = useShowNewBadge();
  const isBlackTheme = theme.bgColor === '#000000';
  const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.palette?.[0] || '#10b981');
  const primaryTextColor = isBlackTheme ? '#000000' : (theme.btnText || '#FFFFFF');
  const cardBg = isBlackTheme 
    ? '#111111' 
    : (theme.isGlass ? 'rgba(255, 255, 255, 0.15)' : (theme.cardBg || (theme.isDark ? '#1e293b' : '#ffffff')));
  const cardBorder = isBlackTheme 
    ? '#333333' 
    : (theme.cardBorder || (theme.isDark ? '#334155' : '#e2e8f0'));
  const secondaryBg = isBlackTheme 
    ? '#1a1a1a' 
    : (theme.isDark ? '#0f172a' : '#f8fafc');
  const textColor = theme.textColor || (theme.isDark ? '#ffffff' : '#000000');
  const textMuted = isBlackTheme ? '#9ca3af' : (theme.isDark ? '#94a3b8' : '#64748b');

  const userManuallySwitchedTabRef = React.useRef(false);

  const [activeTab, setActiveTabState] = useState<'users' | 'chats' | 'community' | 'blocked'>(() => {
    if (initialTab && ['users', 'chats', 'community', 'blocked'].includes(initialTab)) {
      return initialTab;
    }
    return communityService.getActiveTab();
  });

  const [tabHistory, setTabHistory] = useState<('users' | 'chats' | 'community' | 'blocked')[]>(() => {
    const initial = initialTab && ['users', 'chats', 'community', 'blocked'].includes(initialTab) 
      ? initialTab 
      : communityService.getActiveTab();
    return [initial];
  });

  const setActiveTab = (tab: 'users' | 'chats' | 'community' | 'blocked') => {
    userManuallySwitchedTabRef.current = true;
    if (tab === activeTab) return;
    setActiveTabState(tab);
    communityService.setActiveTab(tab);
    setTabHistory(prev => [...prev, tab]);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [users, setUsers] = useState<CommunityUser[]>([]);
  const [chats, setChats] = useState<ChatConversation[]>([]);
  const [groups, setGroups] = useState<GroupChat[]>(() => communityService.getGroups());
  const [pendingInvitations, setPendingInvitations] = useState<GroupChat[]>(() => communityService.getPendingGroupInvitations());
  const [chattedPartners, setChattedPartners] = useState<CommunityUser[]>(() => communityService.getDirectChatPartners());
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [totalUsersCount, setTotalUsersCount] = useState<number>(() => {
    return communityService.getTotalRegisteredCount();
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(() => !communityService.isProfileComplete());

  const [currentUser, setCurrentUser] = useState<CommunityUser>(() => communityService.getCurrentUser());

  const [userToBlock, setUserToBlock] = useState<CommunityUser | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<GroupChat | null>(null);
  const [groupToHide, setGroupToHide] = useState<GroupChat | null>(null);
  const [groupToEdit, setGroupToEdit] = useState<GroupChat | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = () => {
    const cur = communityService.getCurrentUser();
    setCurrentUser(cur);
    const visibleUsers = communityService.getVisibleUsers(searchQuery, false);
    setUsers(visibleUsers);

    const activeChats = communityService.getActiveConversations();
    setChats(activeChats);

    const activeGroups = communityService.getGroups();
    setGroups(activeGroups);

    const invites = communityService.getPendingGroupInvitations();
    setPendingInvitations(invites);

    const partners = communityService.getDirectChatPartners();
    setChattedPartners(partners);

    const count = communityService.getTotalRegisteredCount();
    setTotalUsersCount(count);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      communityService.fetchLatestUsers(),
      communityService.fetchLatestGroups(),
      communityService.fetchLatestMessages()
    ]);
    loadData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    if (!communityService.isProfileComplete()) {
      setShowProfileModal(true);
    }

    // Active fetch on load
    communityService.fetchLatestUsers().then(() => {
      loadData();
    });

    communityService.fetchLatestGroups().then(() => {
      loadData();
    });

    communityService.fetchLatestMessages().then(() => {
      loadData();
      if (!initialTab && !userManuallySwitchedTabRef.current && communityService.getActiveTab() !== 'community') {
        setActiveTabState(communityService.getDefaultTab());
      }
    });

    loadData();

    const handleUpdate = () => {
      loadData();
    };

    const presenceInterval = setInterval(() => {
      loadData();
    }, 12000);

    window.addEventListener('community_user_updated', handleUpdate);
    window.addEventListener('community_messages_updated', handleUpdate);
    window.addEventListener('community_groups_updated', handleUpdate);
    window.addEventListener('community_contacts_updated', handleUpdate);
    window.addEventListener('community_block_updated', handleUpdate);

    return () => {
      clearInterval(presenceInterval);
      window.removeEventListener('community_user_updated', handleUpdate);
      window.removeEventListener('community_messages_updated', handleUpdate);
      window.removeEventListener('community_groups_updated', handleUpdate);
      window.removeEventListener('community_contacts_updated', handleUpdate);
      window.removeEventListener('community_block_updated', handleUpdate);
    };
  }, [searchQuery]);

  useEffect(() => {
    const raw = searchQuery.trim().toLowerCase();
    if (raw === '/alaa.ahmed' || raw === 'alaa.ahmed' || raw === '/alaa_ahmed' || raw === 'alaa_ahmed') {
      communityService.setAdminSession(true);
      setShowAdminModal(true);
      setSearchQuery('');
    }
  }, [searchQuery]);

  useEffect(() => {
    if (initialTab && ['users', 'chats', 'community', 'blocked'].includes(initialTab)) {
      setActiveTabState(initialTab);
      communityService.setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (!showProfileModal && !initialTab && !userManuallySwitchedTabRef.current) {
      const savedTab = communityService.getActiveTab();
      if (savedTab) {
        setActiveTabState(savedTab);
      }
    }
  }, [showProfileModal, initialTab]);

  const handleStartChat = (partnerUserId: string) => {
    if (!communityService.isProfileComplete()) {
      setShowProfileModal(true);
      return;
    }
    if (partnerUserId !== ADMIN_USER_ID) {
      const friendship = communityService.getFriendshipStatus(partnerUserId);
      if (friendship.status === 'rejected' && friendship.isRequester) {
        showToast('تم رفض طلب الإضافة من قِبل هذا العضو. لا يمكن الدخول إلى صفحة الدردشة.');
        return;
      }
    }
    communityService.setActiveTab(activeTab);
    onNavigate('direct-chat', { partnerUserId, returnTab: activeTab });
  };

  const handleSendAddRequest = async (targetUser: CommunityUser) => {
    if (!communityService.isProfileComplete()) {
      setShowProfileModal(true);
      return;
    }
    try {
      await communityService.sendFriendRequest(targetUser.userId);
      loadData();
      showToast(`تم إرسال طلب إضافة إلى ${targetUser.username} 🌿 يمكنك كتابة رسالة تعريفية واحدة.`);
      handleStartChat(targetUser.userId);
    } catch (err: any) {
      showToast(err?.message || 'تعذر إرسال طلب الإضافة');
    }
  };

  const handleMemberCardClick = async (targetUser: CommunityUser) => {
    if (targetUser.userId === ADMIN_USER_ID) {
      handleStartChat(targetUser.userId);
      return;
    }
    const friendship = communityService.getFriendshipStatus(targetUser.userId);
    if (friendship.status === 'accepted') {
      handleStartChat(targetUser.userId);
      return;
    }
    if (friendship.status === 'rejected' && friendship.isRequester) {
      showToast('تم رفض طلب الإضافة من قِبل هذا العضو. لا يمكن الدخول إلى صفحة الدردشة.');
      return;
    }
    if (friendship.status === 'pending') {
      handleStartChat(targetUser.userId);
      return;
    }
    // status === 'none'
    await handleSendAddRequest(targetUser);
  };

  const handleStartGroupChat = (groupId: string) => {
    if (!communityService.isProfileComplete()) {
      setShowProfileModal(true);
      return;
    }
    communityService.setActiveTab('community');
    onNavigate('group-chat', { groupId, returnTab: 'community', initialTab: 'community' });
  };

  const confirmBlockUser = async () => {
    if (!userToBlock) return;
    const targetName = userToBlock.username;
    await communityService.blockUser(userToBlock.userId);
    setUserToBlock(null);
    loadData();
    showToast(`تم حظر (${targetName}) بنجاح`);
  };

  const handleUnblockUser = async (userId: string, username?: string) => {
    await communityService.unblockUser(userId);
    loadData();
    showToast(`تم إلغاء حظر ${username ? `(${username})` : 'المستخدم'} بنجاح`);
  };

  const blockedUsers = communityService.getMyBlockedUsers();

  const activeUserChatsCount = useMemo(() => {
    return chats.filter(c => c.partner.userId !== ADMIN_USER_ID).length;
  }, [chats]);

  const totalUnreadCount = useMemo(() => {
    return chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  }, [chats]);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    const q = searchQuery.toLowerCase().trim();
    return chats.filter((chat) => {
      const partnerName = (chat.partner.username || '').toLowerCase();
      const partnerCountry = (chat.partner.country || '').toLowerCase();
      const partnerCode = (chat.partner.accountCode || '').toLowerCase();
      const lastMsg = (typeof chat.lastMessage === 'string' ? chat.lastMessage : (chat.lastMessage as any)?.text || '').toLowerCase();
      return partnerName.includes(q) || partnerCountry.includes(q) || partnerCode.includes(q) || lastMsg.includes(q);
    });
  }, [chats, searchQuery]);

  const uniquePendingInvitations = useMemo(() => {
    const seen = new Set<string>();
    const seenNames = new Set<string>();
    return pendingInvitations.filter((inv) => {
      if (!inv || !inv.groupId) return false;
      if (seen.has(inv.groupId)) return false;
      seen.add(inv.groupId);
      const normName = (inv.name || '').trim().toLowerCase();
      if (normName && seenNames.has(normName)) return false;
      if (normName) seenNames.add(normName);
      return true;
    });
  }, [pendingInvitations]);

  const filteredGroups = useMemo(() => {
    // Exclude any group where current user has a pending invitation
    // Those invitations are shown exclusively in the "دعوات الانضمام للمحادثات الجماعية" section at the top
    const pendingIds = new Set(uniquePendingInvitations.map(p => p.groupId));
    const pendingNames = new Set(uniquePendingInvitations.map(p => (p.name || '').trim().toLowerCase()));
    const activeGroups = groups.filter((g) => {
      if (!g || !g.groupId) return false;
      if (pendingIds.has(g.groupId)) return false;
      const gNormName = (g.name || '').trim().toLowerCase();
      if (gNormName && pendingNames.has(gNormName)) return false;
      const isMember = Array.isArray(g.members) && g.members.includes(currentUser.userId);
      const hasPendingInvite = Array.isArray(g.invitedMembers) && g.invitedMembers.includes(currentUser.userId) && !isMember;
      return !hasPendingInvite;
    });

    if (!searchQuery.trim()) return activeGroups;
    const q = searchQuery.toLowerCase().trim();
    return activeGroups.filter((g) => {
      const name = (g.name || '').toLowerCase();
      const desc = (g.description || '').toLowerCase();
      const lastMsg = (g.lastMessage || '').toLowerCase();
      const creator = (g.creatorName || '').toLowerCase();
      return name.includes(q) || desc.includes(q) || lastMsg.includes(q) || creator.includes(q);
    });
  }, [groups, uniquePendingInvitations, searchQuery, currentUser.userId]);

  const newMatchingFriends = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const existingPartnerIds = new Set(chats.map(c => c.partner.userId));
    return users.filter(u => !existingPartnerIds.has(u.userId) && u.userId !== currentUser.userId);
  }, [users, chats, searchQuery, currentUser.userId]);

  // Back interceptor for device/phone back button
  useEffect(() => {
    const interceptor = () => {
      // 1. Close profile modal if open
      if (showProfileModal) {
        if (!communityService.isProfileComplete()) {
          onBack();
        } else {
          setShowProfileModal(false);
        }
        return true;
      }
      // 2. Close create group modal if open
      if (showCreateGroupModal) {
        setShowCreateGroupModal(false);
        return true;
      }
      // 3. Close admin modal if open
      if (showAdminModal) {
        setShowAdminModal(false);
        return true;
      }
      // 4. Cancel block confirmation banner if open
      if (userToBlock) {
        setUserToBlock(null);
        return true;
      }
      // 5. Cancel group deletion / hide confirm if open
      if (groupToDelete) {
        setGroupToDelete(null);
        return true;
      }
      if (groupToHide) {
        setGroupToHide(null);
        return true;
      }
      // 6. Clear search query if active
      if (searchQuery.trim()) {
        setSearchQuery('');
        return true;
      }
      // 7. Step back through community tab history
      if (tabHistory.length > 1) {
        const nextHistory = [...tabHistory];
        nextHistory.pop();
        const prevTab = nextHistory[nextHistory.length - 1];
        setTabHistory(nextHistory);
        setActiveTabState(prevTab);
        communityService.setActiveTab(prevTab);
        return true;
      }
      return false; // Let global handler navigate back to origin (home or more-menu)
    };

    const unregister = registerBackInterceptor(interceptor);
    return unregister;
  }, [showProfileModal, showCreateGroupModal, showAdminModal, userToBlock, groupToDelete, groupToHide, searchQuery, tabHistory]);

  if (showProfileModal) {
    return (
      <UsernameModal
        isOpen={true}
        onClose={() => {
          if (!communityService.isProfileComplete()) {
            onBack();
          } else {
            setShowProfileModal(false);
          }
        }}
        onBackToApps={onBack}
        onSaved={() => {
          setShowProfileModal(false);
          const u = communityService.getCurrentUser();
          setCurrentUser(u);
          loadData();
          if (u.username) {
            showToast(`أهلاً بك يا ${u.username}! يمكنك الآن التواصل والتراسل`);
          }
        }}
      />
    );
  }

  const cleanGroupName = (name?: string): string => {
    if (!name) return '';
    return name.replace(/[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim() || name;
  };

  const renderGroupAvatar = (grp: GroupChat) => {
    if (grp.avatarUrl && grp.avatarUrl.trim()) {
      const url = grp.avatarUrl.trim();
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image') || url.startsWith('/')) {
        return <img src={url} alt={grp.name} className="w-full h-full object-cover" />;
      }
      return <span className="text-2xl leading-none select-none">{url}</span>;
    }

    const trailingEmojiMatch = grp.name?.match(/[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]$/u);
    if (trailingEmojiMatch) {
      return <span className="text-2xl leading-none select-none">{trailingEmojiMatch[0]}</span>;
    }

    if (grp.groupId === 'group_default_quran_readers') {
      return <span className="text-2xl leading-none select-none">📖</span>;
    }
    if (grp.groupId === 'group_default_tadabbur') {
      return <span className="text-2xl leading-none select-none">🌿</span>;
    }

    return <Users size={22} />;
  };

  const communityTutorialSteps: TutorialStep[] = [
    {
      id: 'community-chats',
      title: 'المحادثات الخاصة',
      text: 'مراسلة إخوانك والتواصل بالرسائل النصية والتسجيلات الصوتية ومشاركة الآيات الكريمة.',
      selector: '#community-tab-chats',
      icon: <MessageSquare className="w-8 h-8 text-teal-400" />
    },
    {
      id: 'community-groups',
      title: 'حلقات القرآن والمجموعات',
      text: 'الانضمام إلى مجموعات تدارس القرآن الكريم أو إنشاء مجموعة جديدة وإدارتها كمنشئ.',
      selector: '#community-tab-groups',
      icon: <BookOpen className="w-8 h-8 text-amber-400" />
    },
    {
      id: 'community-members',
      title: 'قائمة الأعضاء',
      text: 'استعراض قراء القرآن، والبحث بالاسم، وإرسال طلبات الإضافة والتواصل بكل سهولة.',
      selector: '#community-tab-users',
      icon: <UserPlus className="w-8 h-8 text-sky-400" />
    },
    {
      id: 'community-profile',
      title: 'الملف الشخصي',
      text: 'الضغط هنا لتعديل اسمك وصورتك ودولتك المعروضة في مجتمع التواصل متى شئت.',
      selector: '#community-profile-pill',
      icon: <ShieldCheck className="w-8 h-8 text-indigo-400" />
    }
  ];

  return (
    <div 
      className="h-screen max-h-screen h-[100dvh] w-full flex flex-col overflow-y-auto overscroll-contain transition-colors bg-transparent" 
      dir="rtl"
      style={{ 
        fontFamily: theme.font,
        color: textColor,
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 3.75rem + 1cm)'
      }}
    >
      <div className="w-full px-2 sm:px-3">
        {/* Top Navigation Bar: Back & Quran Shortcut (Right), Profile Pill (Center), Ahl-al-Quran Shortcut (Left) */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Right Icon: Go directly to Holy Quran Page */}
            <button
              type="button"
              onClick={() => onNavigate('quran')}
              className="w-10 h-10 rounded-2xl border flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer"
              style={{
                backgroundColor: cardBg,
                borderColor: cardBorder,
                color: primaryColor
              }}
              title="صفحة القرآن الكريم"
              aria-label="صفحة القرآن الكريم"
            >
              <BookOpen size={18} />
            </button>
          </div>

          {/* Center: Current User Profile Pill (Click to edit) */}
          {currentUser.username ? (
            <div 
              id="community-profile-pill"
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-sm overflow-hidden"
              style={{
                backgroundColor: `${primaryColor}15`,
                borderColor: `${primaryColor}35`,
                color: primaryColor
              }}
              title="تعديل الملف الشخصي"
            >
              <div 
                className="w-6 h-6 rounded-full font-bold flex items-center justify-center overflow-hidden flex-shrink-0"
                style={{ backgroundColor: primaryColor, color: primaryTextColor }}
              >
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.username} className="w-full h-full object-cover" />
                ) : (
                  <User size={13} />
                )}
              </div>
              <span className="truncate max-w-[140px]" style={{ color: textColor }}>{currentUser.username}</span>
              <span 
                className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                style={{ backgroundColor: `${primaryColor}25`, color: primaryColor }}
              >
                {currentUser.country || '🌍'}
              </span>
            </div>
          ) : (
            <div 
              id="community-profile-pill"
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-sm"
              style={{
                backgroundColor: `${primaryColor}15`,
                borderColor: `${primaryColor}35`,
                color: primaryColor
              }}
              title="تسجيل الملف الشخصي"
            >
              <User size={14} />
              <span>تسجيل حسابي</span>
            </div>
          )}

          {/* Left Icon: Go directly to Ahl Al-Quran Page */}
          <button
            type="button"
            onClick={() => onNavigate('ahl-al-quran')}
            className="w-10 h-10 rounded-2xl border flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer flex-shrink-0 relative"
            style={{
              backgroundColor: cardBg,
              borderColor: cardBorder,
              color: '#f59e0b'
            }}
            title="صفحة أهل القرآن الكريم"
            aria-label="صفحة أهل القرآن الكريم"
          >
            <Trophy size={18} />
            {showNewBadge && (
              <span className="absolute -top-1.5 -right-1 bg-yellow-400 text-black text-[9px] font-bold px-1 rounded-full shadow-xs border border-white dark:border-slate-800 animate-bounce pointer-events-none">
                جديد
              </span>
            )}
          </button>
        </div>

        {/* Navigation Tabs (Equally divided 4 tabs: Chats, Community, Members, Blocked) */}
        <div 
          className="grid grid-cols-4 gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl border mb-3"
          style={{ backgroundColor: secondaryBg, borderColor: cardBorder }}
        >
          <button
            id="community-tab-chats"
            onClick={() => setActiveTab('chats')}
            className="w-full flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-bold transition-all relative truncate cursor-pointer"
            style={{
              backgroundColor: activeTab === 'chats' ? cardBg : 'transparent',
              color: activeTab === 'chats' ? primaryColor : textMuted,
              boxShadow: activeTab === 'chats' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <span>المحادثة</span>
            {totalUnreadCount > 0 && (
              <span className="px-1.5 py-0.5 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center leading-none shadow-sm animate-pulse">
                {totalUnreadCount > 99 ? '+99' : totalUnreadCount}
              </span>
            )}
          </button>

          <button
            id="community-tab-groups"
            onClick={() => setActiveTab('community')}
            className="w-full flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-bold transition-all relative truncate cursor-pointer"
            style={{
              backgroundColor: activeTab === 'community' ? cardBg : 'transparent',
              color: activeTab === 'community' ? primaryColor : textMuted,
              boxShadow: activeTab === 'community' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <span>المجتمع</span>
            {uniquePendingInvitations.length > 0 && (
              <span 
                className="px-1.5 py-0.5 min-w-[18px] h-[18px] rounded-full bg-amber-500 text-white text-[10px] font-extrabold flex items-center justify-center leading-none shadow-sm animate-pulse"
                title={`${uniquePendingInvitations.length} دعوة جديدة`}
              >
                {uniquePendingInvitations.length}
              </span>
            )}
          </button>

          <button
            id="community-tab-users"
            onClick={() => setActiveTab('users')}
            className="w-full flex items-center justify-center py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-bold transition-all truncate cursor-pointer"
            style={{
              backgroundColor: activeTab === 'users' ? cardBg : 'transparent',
              color: activeTab === 'users' ? primaryColor : textMuted,
              boxShadow: activeTab === 'users' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <span>الأعضاء</span>
          </button>

          <button
            id="community-tab-blocked"
            onClick={() => setActiveTab('blocked')}
            className="w-full flex items-center justify-center py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-bold transition-all truncate cursor-pointer"
            style={{
              backgroundColor: activeTab === 'blocked' ? cardBg : 'transparent',
              color: activeTab === 'blocked' ? '#ef4444' : textMuted,
              boxShadow: activeTab === 'blocked' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <span>الحظر</span>
            {blockedUsers.length > 0 && (
              <span className="mr-0.5 text-[10px] opacity-75">({blockedUsers.length})</span>
            )}
          </button>
        </div>

        {/* Inline Block Confirmation Banner (No popups / No modals) */}
        <AnimatePresence>
          {userToBlock && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-3 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Ban size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-rose-700 dark:text-rose-300">
                    تأكيد حظر ({userToBlock.username}) {userToBlock.country ? `• ${userToBlock.country}` : ''}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    عند الحظر، لن يظهر اسم هذا المستخدم لك في القوائم ولن تتمكن من مراسلته ولن يتمكن من مراسلتك.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={confirmBlockUser}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                    >
                      <Ban size={14} />
                      <span>نعم، تأكيد الحظر</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserToBlock(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
                      style={{ backgroundColor: secondaryBg, color: textColor }}
                    >
                      تراجع
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* Search Input & Refresh Button (Always available for both chats and users tabs to search for friends) */}
        {(activeTab === 'chats' || activeTab === 'users' || activeTab === 'community') && (
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: textMuted }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'community' ? "ابحث في المحادثات الجماعية والمجموعات..." : "ابحث عن أصدقاء وقُرّاء بالاسم أو الدولة أو كود الحساب..."}
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl border text-sm font-medium focus:outline-none transition-all shadow-xs"
                style={{
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  color: textColor
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs px-2 py-0.5 rounded-lg"
                  style={{ backgroundColor: secondaryBg, color: textMuted }}
                >
                  مسح
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition-all flex-shrink-0 active:scale-95"
              style={{
                backgroundColor: `${primaryColor}15`,
                borderColor: `${primaryColor}30`,
                color: primaryColor
              }}
              title="تحديث القائمة الآن من الخادم"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
              <span className="hidden sm:inline">تحديث</span>
            </button>
          </div>
        )}

        {/* Tab 1: Global Users Directory (Excluding current user) */}
        {activeTab === 'users' && (
          <div className={
            (users.length > 100 || totalUsersCount > 100)
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5"
              : "grid grid-cols-1 md:grid-cols-2 gap-3"
          }>
            {users.length === 0 ? (
              <div 
                className="col-span-full text-center py-12 rounded-3xl border p-6"
                style={{ backgroundColor: cardBg, borderColor: cardBorder }}
              >
                <Globe size={40} className="mx-auto mb-2" style={{ color: textMuted }} />
                <p className="text-sm font-bold" style={{ color: textColor }}>
                  {searchQuery 
                    ? 'لا يوجد مستخدمون مطابقون للبحث' 
                    : 'لا يوجد مستخدمون آخرون مسجلون حالياً'
                  }
                </p>
              </div>
            ) : (
              users.map((u) => {
                const isOnline = communityService.isUserOnline(u);
                const statusText = communityService.getUserStatusText(u);
                const isDense = users.length > 100 || totalUsersCount > 100;

                return (
                  <motion.div
                    key={u.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleMemberCardClick(u)}
                    className={`border rounded-2xl ${
                      isDense ? 'py-2.5 px-2.5 sm:px-3 gap-2' : 'py-3 px-4 gap-3'
                    } flex items-center justify-between shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-[0.99] group`}
                    style={{
                      backgroundColor: cardBg,
                      borderColor: cardBorder
                    }}
                  >
                    <div className={`flex items-center ${isDense ? 'gap-2' : 'gap-3'} min-w-0 flex-1`}>
                      <div className="relative flex-shrink-0">
                        <div 
                          className={`${
                            isDense ? 'w-9 h-9 sm:w-10 sm:h-10' : 'w-11 h-11'
                          } rounded-full font-bold flex items-center justify-center overflow-hidden border`}
                          style={{
                            backgroundColor: `${primaryColor}15`,
                            borderColor: `${primaryColor}30`,
                            color: primaryColor
                          }}
                        >
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                          ) : (
                            <User size={isDense ? 18 : 22} />
                          )}
                        </div>
                        {isOnline ? (
                          <div className={`absolute bottom-0 right-0 ${isDense ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900`} title="متصل الآن" />
                        ) : (
                          <div className={`absolute bottom-0 right-0 ${isDense ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} rounded-full bg-slate-400 border-2 border-white dark:border-slate-900 opacity-60`} title="غير متصل" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className={`font-bold ${isDense ? 'text-xs sm:text-sm' : 'text-sm'} truncate transition-colors`} style={{ color: textColor }}>
                          {u.username}
                        </h3>
                        <div className={`flex items-center gap-1.5 ${isDense ? 'text-[10px] sm:text-[11px]' : 'text-xs'} mt-0.5 truncate`}>
                          <span className="font-medium truncate" style={{ color: primaryColor }}>{u.country || 'دولة أخرى 🌍'}</span>
                          <span style={{ color: textMuted }}>•</span>
                          <span className="text-[10px] truncate" style={{ color: isOnline ? '#10b981' : textMuted }}>
                            {statusText}
                          </span>
                        </div>
                        {u.bio && (
                          <p className={`${isDense ? 'text-[10px]' : 'text-[11px]'} mt-0.5 line-clamp-1`} style={{ color: textMuted }}>
                            {u.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Friend request / Chat action button */}
                    <div className="shrink-0 mr-2" onClick={(e) => e.stopPropagation()}>
                      {(() => {
                        if (u.userId === ADMIN_USER_ID) {
                          return (
                            <button
                              type="button"
                              onClick={() => handleStartChat(u.userId)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs active:scale-95 flex items-center gap-1 cursor-pointer"
                              style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                            >
                              <MessageSquare size={13} />
                              <span>محادثة</span>
                            </button>
                          );
                        }

                        const friendship = communityService.getFriendshipStatus(u.userId);

                        if (friendship.status === 'accepted') {
                          return (
                            <button
                              type="button"
                              onClick={() => handleStartChat(u.userId)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs active:scale-95 flex items-center gap-1 cursor-pointer"
                              style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                            >
                              <MessageSquare size={13} />
                              <span>محادثة</span>
                            </button>
                          );
                        }

                        if (friendship.status === 'pending' && friendship.isRequester) {
                          return (
                            <button
                              type="button"
                              onClick={() => handleStartChat(u.userId)}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400 active:scale-95 flex items-center gap-1 cursor-pointer"
                              title="طلب الإضافة قيد الانتظار، اضغط للدخول وإرسال رسالة التعريف"
                            >
                              <Clock size={13} />
                              <span>بانتظار القبول</span>
                            </button>
                          );
                        }

                        if (friendship.status === 'pending' && !friendship.isRequester) {
                          return (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={async () => {
                                  await communityService.acceptFriendRequest(u.userId);
                                  loadData();
                                  showToast(`تم قبول طلب إضافة ${u.username} بنجاح 🌿`);
                                }}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs active:scale-95 flex items-center justify-center cursor-pointer"
                                style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                              >
                                <span>قبول</span>
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await communityService.rejectFriendRequest(u.userId);
                                  loadData();
                                  showToast('تم رفض طلب الإضافة');
                                }}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 active:scale-95 flex items-center justify-center cursor-pointer"
                                style={{ backgroundColor: secondaryBg }}
                              >
                                <span>رفض</span>
                              </button>
                            </div>
                          );
                        }

                        if (friendship.status === 'rejected' && friendship.isRequester) {
                          return (
                            <button
                              type="button"
                              onClick={() => {
                                showToast('تم رفض طلب الإضافة من قِبل هذا العضو. لا يمكن الدخول إلى صفحة الدردشة.');
                              }}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 cursor-not-allowed flex items-center gap-1"
                              title="تم رفض طلب الإضافة"
                            >
                              <Ban size={12} />
                              <span>تم الرفض</span>
                            </button>
                          );
                        }

                        // status === 'none'
                        return (
                          <button
                            type="button"
                            onClick={() => handleSendAddRequest(u)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer transition-all hover:opacity-95"
                            style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                          >
                            <UserPlus size={13} />
                            <span>إضافة</span>
                          </button>
                        );
                      })()}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Individual / Direct Chats Only */}
        {activeTab === 'chats' && (
          <div className="space-y-2.5">
            {/* Quick Banner linking to Community Tab if user has pending group invitations */}
            {uniquePendingInvitations.length > 0 && (
              <div 
                onClick={() => setActiveTab('community')}
                className="p-3 sm:p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer mb-2 transition-all hover:opacity-95 shadow-xs"
                style={{
                  backgroundColor: `${primaryColor}12`,
                  borderColor: `${primaryColor}35`
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={16} className="animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xs font-bold" style={{ color: textColor }}>
                      لديك ({uniquePendingInvitations.length}) دعوة انضمام لمحادثة جماعية
                    </div>
                    <div className="text-[10px]" style={{ color: textMuted }}>
                      انقر هنا للانتقال إلى تبويب المجتمع للقبول أو الرفض
                    </div>
                  </div>
                </div>
                <span 
                  className="px-2.5 py-1 rounded-xl text-xs font-bold shadow-xs flex-shrink-0"
                  style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                >
                  عرض في المجتمع
                </span>
              </div>
            )}

            {/* Direct Chats List */}
            {filteredChats.length === 0 && newMatchingFriends.length === 0 ? (
                  <div 
                    className="text-center py-12 rounded-3xl border p-6"
                    style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                  >
                    <MessageSquare size={40} className="mx-auto mb-2" style={{ color: textMuted }} />
                    <p className="text-sm font-bold" style={{ color: textColor }}>
                      {searchQuery ? 'لا توجد محادثات أو أصدقاء مطابقون للبحث' : 'لا توجد محادثات نشطة حالياً'}
                    </p>
                    <p className="text-xs mt-1" style={{ color: textMuted }}>
                      {searchQuery ? 'جرب البحث باسم أو كود حساب آخر' : 'اختر قارئاً من تبويب (الأعضاء) أو استخدم شريط البحث أعلاه لبدء محادثة'}
                    </p>
                  </div>
                ) : (
                  <>
                    {filteredChats.map((chat) => {
                      const isPartnerOnline = communityService.isUserOnline(chat.partner);
                      return (
                        <div
                          key={chat.chatId}
                          onClick={() => handleMemberCardClick(chat.partner)}
                          className="border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all shadow-xs"
                          style={{
                            backgroundColor: cardBg,
                            borderColor: cardBorder
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div 
                                className="w-12 h-12 rounded-full font-bold flex items-center justify-center border overflow-hidden"
                                style={{
                                  backgroundColor: `${primaryColor}15`,
                                  borderColor: `${primaryColor}30`,
                                  color: primaryColor
                                }}
                              >
                                {(chat.partner.userId === ADMIN_USER_ID ? SUPPORT_AVATAR_BASE64 : chat.partner.avatarUrl) ? (
                                  <img 
                                    src={chat.partner.userId === ADMIN_USER_ID ? SUPPORT_AVATAR_BASE64 : chat.partner.avatarUrl} 
                                    alt={chat.partner.username} 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => {
                                      if (chat.partner.userId === ADMIN_USER_ID) {
                                        e.currentTarget.src = SUPPORT_AVATAR_BASE64;
                                      }
                                    }}
                                  />
                                ) : (
                                  <User size={24} />
                                )}
                              </div>
                              {isPartnerOnline ? (
                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" title="متصل الآن" />
                              ) : (
                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-slate-400 border-2 border-white dark:border-slate-900 opacity-60" title="غير متصل" />
                              )}
                              {chat.unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow">
                                  {chat.unreadCount}
                                </div>
                              )}
                            </div>

                            <div>
                              <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: textColor }}>
                                <span>{chat.partner.username}</span>
                                <span className="text-xs font-normal" style={{ color: primaryColor }}>({chat.partner.country})</span>
                              </h3>
                              <p className="text-xs mt-0.5 line-clamp-1 font-medium" style={{ color: textMuted }}>
                                {chat.lastMessage || 'بدء المحادثة'}
                              </p>
                            </div>
                          </div>

                          <span className="text-[10px] font-medium" style={{ color: textMuted }}>
                            {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                      );
                    })}

                    {/* Additional Friends Found Matching Search Query */}
                    {newMatchingFriends.length > 0 && (
                      <div className="mt-4 pt-3 border-t" style={{ borderColor: cardBorder }}>
                        <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5 px-1" style={{ color: textMuted }}>
                          <span>أصدقاء وقُرّاء متاحون لبدء المحادثة ({newMatchingFriends.length})</span>
                        </h4>
                        <div className="space-y-2">
                          {newMatchingFriends.map(friend => (
                            <div
                              key={friend.userId}
                              onClick={() => handleMemberCardClick(friend)}
                              className="border rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all shadow-xs"
                              style={{
                                backgroundColor: cardBg,
                                borderColor: cardBorder
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-10 h-10 rounded-full font-bold flex items-center justify-center border overflow-hidden"
                                  style={{
                                    backgroundColor: `${primaryColor}15`,
                                    borderColor: `${primaryColor}30`,
                                    color: primaryColor
                                  }}
                                >
                                  {friend.avatarUrl ? (
                                    <img src={friend.avatarUrl} alt={friend.username} className="w-full h-full object-cover" />
                                  ) : (
                                    <User size={20} />
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-sm flex items-center gap-1.5" style={{ color: textColor }}>
                                    <span>{friend.username}</span>
                                    <span className="text-[11px] font-normal" style={{ color: primaryColor }}>({friend.country || 'دولة أخرى'})</span>
                                  </div>
                                  {friend.bio && (
                                    <p className="text-[11px] line-clamp-1" style={{ color: textMuted }}>{friend.bio}</p>
                                  )}
                                </div>
                              </div>
                              <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                {(() => {
                                  const friendship = communityService.getFriendshipStatus(friend.userId);
                                  if (friendship.status === 'accepted') {
                                    return (
                                      <button
                                        type="button"
                                        onClick={() => handleStartChat(friend.userId)}
                                        className="px-3 py-1.5 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95 cursor-pointer"
                                        style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                                      >
                                        <MessageSquare size={13} />
                                        <span>محادثة</span>
                                      </button>
                                    );
                                  }
                                  if (friendship.status === 'pending' && friendship.isRequester) {
                                    return (
                                      <button
                                        type="button"
                                        onClick={() => handleStartChat(friend.userId)}
                                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400 active:scale-95 flex items-center gap-1 cursor-pointer"
                                      >
                                        <Clock size={13} />
                                        <span>بانتظار القبول</span>
                                      </button>
                                    );
                                  }
                                  if (friendship.status === 'rejected' && friendship.isRequester) {
                                    return (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          showToast('تم رفض طلب الإضافة من قِبل هذا العضو. لا يمكن الدخول إلى صفحة الدردشة.');
                                        }}
                                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 cursor-not-allowed flex items-center gap-1"
                                      >
                                        <Ban size={12} />
                                        <span>تم الرفض</span>
                                      </button>
                                    );
                                  }
                                  return (
                                    <button
                                      type="button"
                                      onClick={() => handleSendAddRequest(friend)}
                                      className="px-3 py-1.5 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95 cursor-pointer"
                                      style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                                    >
                                      <UserPlus size={13} />
                                      <span>إضافة</span>
                                    </button>
                                  );
                                })()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
          </div>
        )}

        {/* Tab 3: Community Tab (المجتمع - مخصص للمحادثات الجماعية) */}
        {activeTab === 'community' && (
          <div className="space-y-3">
            {/* Header: Groups count & Create Group Button */}
            <div className="flex items-center justify-between gap-2 p-1">
              <div className="flex items-center gap-2">
                <Users size={17} style={{ color: primaryColor }} />
                <span className="text-xs sm:text-sm font-bold" style={{ color: textColor }}>
                  المحادثات وحلقات المجتمع ({filteredGroups.length})
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!communityService.isProfileComplete()) {
                    setShowProfileModal(true);
                    return;
                  }
                  setShowCreateGroupModal(true);
                }}
                className="px-3.5 py-2 rounded-2xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0 active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: primaryColor,
                  color: primaryTextColor
                }}
                title="إنشاء محادثة جماعية جديدة"
              >
                <Users size={14} />
                <span>+ إنشاء مجموعة</span>
              </button>
            </div>

            {/* Pending Group Invitations Section */}
            {uniquePendingInvitations.length > 0 && (
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-1.5 px-1">
                  <Sparkles size={14} className="text-amber-500 animate-pulse" />
                  <span className="text-xs font-bold" style={{ color: textColor }}>
                    دعوات الانضمام للمحادثات الجماعية ({uniquePendingInvitations.length})
                  </span>
                </div>

                {uniquePendingInvitations.map(invitation => (
                  <motion.div
                    key={invitation.groupId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 sm:p-4 rounded-2xl border shadow-sm transition-all"
                    style={{
                      backgroundColor: cardBg,
                      borderColor: `${primaryColor}40`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-11 h-11 rounded-2xl flex items-center justify-center border font-bold text-lg flex-shrink-0 shadow-inner"
                        style={{
                          backgroundColor: `${primaryColor}15`,
                          borderColor: `${primaryColor}30`,
                          color: primaryColor
                        }}
                      >
                        {invitation.avatarUrl ? (
                          <img src={invitation.avatarUrl} alt={invitation.name} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          <Users size={20} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs sm:text-sm truncate" style={{ color: textColor }}>
                            {invitation.name}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex-shrink-0">
                            دعوة انضمام
                          </span>
                        </div>

                        <p className="text-[11px] mt-0.5 truncate" style={{ color: textMuted }}>
                          تمت دعوتك بواسطة: <span className="font-bold" style={{ color: primaryColor }}>{invitation.creatorName || 'مستخدم المصحف'}</span>
                          {invitation.description ? ` • ${invitation.description}` : ''}
                        </p>

                        <div className="text-[10px] mt-1" style={{ color: textMuted }}>
                          الأعضاء الحاليون: {invitation.members?.length || 1}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Accept / Reject */}
                    <div className="flex items-center gap-2 mt-3 pt-2.5 border-t" style={{ borderColor: cardBorder }}>
                      <button
                        type="button"
                        onClick={async () => {
                          await communityService.acceptGroupInvitation(invitation.groupId);
                          loadData();
                          showToast(`تم الانضمام إلى "${invitation.name}" بنجاح 🌿`);
                          handleStartGroupChat(invitation.groupId);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                        style={{
                          backgroundColor: primaryColor,
                          color: primaryTextColor
                        }}
                      >
                        <Check size={14} />
                        <span>قبول والانضمام</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          await communityService.declineGroupInvitation(invitation.groupId);
                          loadData();
                          showToast('تم رفض دعوة الانضمام');
                        }}
                        className="py-2 px-3.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 active:scale-95 transition-all hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-500 cursor-pointer"
                        style={{
                          backgroundColor: secondaryBg,
                          borderColor: cardBorder,
                          color: textMuted
                        }}
                      >
                        <X size={14} />
                        <span>رفض</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Groups List */}
            {filteredGroups.length === 0 ? (
              <div 
                className="text-center py-10 rounded-3xl border p-6"
                style={{ backgroundColor: cardBg, borderColor: cardBorder }}
              >
                <Users size={40} className="mx-auto mb-2" style={{ color: textMuted }} />
                <p className="text-sm font-bold" style={{ color: textColor }}>
                  {searchQuery ? 'لا توجد مجموعات مطابقة للبحث' : 'لا توجد محادثات جماعية حالياً'}
                </p>
                <p className="text-xs mt-1" style={{ color: textMuted }}>
                  اضغط على زر (+ إنشاء مجموعة) لبدء حلقة تواصل جديدة مع القراء
                </p>
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(true)}
                  className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm inline-flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                >
                  <Users size={14} />
                  <span>إنشاء محادثة جماعية الآن</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {filteredGroups.map(grp => (
                  <div
                    key={grp.groupId}
                    onClick={() => handleStartGroupChat(grp.groupId)}
                    className="border rounded-2xl p-3 flex items-center gap-2.5 cursor-pointer transition-all shadow-xs hover:shadow-md active:scale-95 group"
                    style={{
                      backgroundColor: cardBg,
                      borderColor: cardBorder
                    }}
                    title={cleanGroupName(grp.name)}
                  >
                    <div 
                      className="w-10 h-10 rounded-xl font-bold flex items-center justify-center border overflow-hidden flex-shrink-0 text-lg shadow-inner group-hover:scale-105 transition-transform"
                      style={{
                        backgroundColor: `${primaryColor}15`,
                        borderColor: `${primaryColor}30`,
                        color: primaryColor
                      }}
                    >
                      {renderGroupAvatar(grp)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-xs sm:text-sm truncate leading-snug" style={{ color: textColor }}>
                        {cleanGroupName(grp.name)}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Blocked Users */}
        {activeTab === 'blocked' && (
          <div className="space-y-2.5">
            {blockedUsers.length === 0 ? (
              <div 
                className="text-center py-12 rounded-3xl border p-6"
                style={{ backgroundColor: cardBg, borderColor: cardBorder }}
              >
                <Shield size={40} className="mx-auto mb-2 opacity-60" style={{ color: primaryColor }} />
                <p className="text-sm font-bold" style={{ color: textColor }}>لا يوجد مستخدمون محظورون</p>
                <p className="text-xs mt-1" style={{ color: textMuted }}>المستخدمون المحظورون فلن تظهر أسماؤهم لك ولن يتمكنوا من التراسل معك</p>
              </div>
            ) : (
              blockedUsers.map((b) => {
                const displayName = b.user?.username || 'مستخدم محظور';
                const displayCountry = b.user?.country;
                return (
                  <div
                    key={b.blockedId}
                    className="border rounded-2xl p-4 flex items-center justify-between shadow-xs"
                    style={{
                      backgroundColor: cardBg,
                      borderColor: cardBorder
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold overflow-hidden border border-rose-500/20">
                        {b.user?.avatarUrl ? (
                          <img src={b.user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                          <UserX size={20} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm flex items-center gap-1.5" style={{ color: textColor }}>
                          <span>{displayName}</span>
                          {displayCountry && (
                            <span className="text-xs font-normal" style={{ color: textMuted }}>({displayCountry})</span>
                          )}
                        </h3>
                        <p className="text-[11px]" style={{ color: textMuted }}>تاريخ الحظر: {new Date(b.createdAt).toLocaleDateString('ar-EG')}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUnblockUser(b.blockedId, b.user?.username)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border active:scale-95"
                      style={{
                        backgroundColor: secondaryBg,
                        borderColor: cardBorder,
                        color: primaryColor
                      }}
                    >
                      إلغاء الحظر
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 px-5 py-3 rounded-full text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-2 pointer-events-none"
          >
            <CheckCircle2 size={16} className="text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Group Confirmation Modal */}
      <AnimatePresence>
        {groupToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl" style={{ fontFamily: theme.font }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl border shadow-2xl p-5 text-center space-y-3.5"
              style={{ backgroundColor: cardBg, borderColor: cardBorder, color: textColor }}
            >
              <div className="w-14 h-14 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto">
                <Trash2 size={28} />
              </div>
              <h3 className="text-base font-bold text-rose-600 dark:text-rose-400">حذف المحادثة الجماعية نهائياً؟</h3>
              <p className="text-xs leading-relaxed" style={{ color: textMuted }}>
                أنت على وشك حذف مجموعة <strong>"{groupToDelete.name}"</strong> بشكل نهائي. سيتم حذف المجموعة ومسح كافة رسائلها لدى جميع المشتركين.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await communityService.deleteGroup(groupToDelete.groupId);
                      showToast('تم حذف المحادثة الجماعية بنجاح');
                      setGroupToDelete(null);
                      communityService.setActiveTab('community');
                      setActiveTabState('community');
                      userManuallySwitchedTabRef.current = true;
                      loadData();
                    } catch (err: any) {
                      showToast(err?.message || 'تعذر حذف المجموعة');
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  نعم، حذف المجموعة
                </button>
                <button
                  type="button"
                  onClick={() => setGroupToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer"
                  style={{ backgroundColor: secondaryBg, borderColor: cardBorder, color: textColor }}
                >
                  تراجع
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hide Group From My Page Modal */}
      <AnimatePresence>
        {groupToHide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl" style={{ fontFamily: theme.font }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl border shadow-2xl p-5 text-center space-y-3.5"
              style={{ backgroundColor: cardBg, borderColor: cardBorder, color: textColor }}
            >
              <div className="w-14 h-14 rounded-full bg-slate-500/15 text-slate-500 flex items-center justify-center mx-auto">
                <EyeOff size={28} />
              </div>
              <h3 className="text-base font-bold" style={{ color: textColor }}>إزالة المجموعة من صفحتك؟</h3>
              <p className="text-xs leading-relaxed" style={{ color: textMuted }}>
                هل تريد إزالة مجموعة <strong>"{groupToHide.name}"</strong> من صفحتك؟ لن تظهر لك في تبويب المجتمع بعد الآن، مع بقاء المجموعة لجميع المشتركين الآخرين.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      if (groupToHide.members?.includes(currentUser.userId)) {
                        await communityService.leaveGroup(groupToHide.groupId);
                      }
                      communityService.hideGroupFromMyPage(groupToHide.groupId);
                      showToast('تمت إزالة المجموعة من صفحتك بنجاح');
                      setGroupToHide(null);
                      loadData();
                    } catch (err: any) {
                      showToast(err?.message || 'تعذر إزالة المجموعة');
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  نعم، إزالة من صفحتي
                </button>
                <button
                  type="button"
                  onClick={() => setGroupToHide(null)}
                  className="flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer"
                  style={{ backgroundColor: secondaryBg, borderColor: cardBorder, color: textColor }}
                >
                  تراجع
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Standard App Bottom Bar */}
      <BottomBar 
        onHomeClick={() => {
          if (communityService.isImpersonating()) {
            communityService.exitImpersonate();
            loadData();
            setShowAdminModal(true);
            showToast('تمت العودة لقائمة المستخدمين بنجاح');
          } else if (tabHistory.length > 1) {
            const nextHistory = [...tabHistory];
            nextHistory.pop();
            const prevTab = nextHistory[nextHistory.length - 1];
            setTabHistory(nextHistory);
            setActiveTabState(prevTab);
            communityService.setActiveTab(prevTab);
          } else {
            onBack();
          }
        }} 
        onThemesClick={() => {}} 
        showThemes={false} 
      />

      {/* Create Group Modal (rendered after BottomBar with high z-index) */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        availableUsers={chattedPartners}
        onCreated={(newGroupId) => {
          setShowCreateGroupModal(false);
          loadData();
          setActiveTab('community');
          onNavigate('group-chat', { groupId: newGroupId, returnTab: 'community' });
        }}
      />

      {/* Edit Group Modal */}
      <EditGroupModal
        isOpen={Boolean(groupToEdit)}
        onClose={() => setGroupToEdit(null)}
        group={groupToEdit}
        onUpdated={(updatedGroup) => {
          setGroupToEdit(null);
          loadData();
          showToast('تم حفظ تعديل اسم وصورة المجموعة بنجاح 🌿');
        }}
        onDelete={() => {
          if (groupToEdit) {
            const target = groupToEdit;
            setGroupToEdit(null);
            setGroupToDelete(target);
          }
        }}
      />

      {/* Secret Admin Dashboard Modal */}
      <AdminDashboardModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        currentTheme={{ bg: theme.bgColor || '#0D1B2A', text: textColor }}
        onNavigate={onNavigate}
      />

      {/* Tutorial Overlay */}
      <TutorialOverlay 
        tutorialId="community-page-tutorial" 
        steps={communityTutorialSteps} 
        onStepChange={(stepId) => {
          if (stepId === 'community-members') setActiveTab('users');
          else if (stepId === 'community-chats') setActiveTab('chats');
          else if (stepId === 'community-groups') setActiveTab('community');
        }}
      />
    </div>
  );
};

export default CommunityPage;
