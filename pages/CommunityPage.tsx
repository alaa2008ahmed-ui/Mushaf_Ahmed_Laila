import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, Search, MessageSquare, Users, Ban, User, Edit3, 
  Sparkles, Globe, Shield, CheckCircle2, UserX, RefreshCw, Trash2
} from 'lucide-react';
import { communityService, CommunityUser, ChatConversation } from '../services/communityService';
import UsernameModal from '../components/Community/UsernameModal';

interface CommunityPageProps {
  onBack: () => void;
  onNavigate: (pageId: string, params?: any) => void;
  initialTab?: 'users' | 'chats' | 'blocked';
}

const CommunityPage: React.FC<CommunityPageProps> = ({ onBack, onNavigate, initialTab }) => {
  const [activeTab, setActiveTabState] = useState<'users' | 'chats' | 'blocked'>(() => {
    if (initialTab && ['users', 'chats', 'blocked'].includes(initialTab)) {
      return initialTab;
    }
    return communityService.getActiveTab();
  });

  const setActiveTab = (tab: 'users' | 'chats' | 'blocked') => {
    setActiveTabState(tab);
    communityService.setActiveTab(tab);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<CommunityUser[]>([]);
  const [chats, setChats] = useState<ChatConversation[]>([]);
  const [totalUsersCount, setTotalUsersCount] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const currentUser = communityService.getCurrentUser();

  const [userToBlock, setUserToBlock] = useState<CommunityUser | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = () => {
    const visibleUsers = communityService.getVisibleUsers(searchQuery);
    setUsers(visibleUsers);

    const activeChats = communityService.getActiveConversations();
    setChats(activeChats);

    const count = communityService.getTotalRegisteredCount();
    setTotalUsersCount(count);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await communityService.fetchLatestUsers();
    loadData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    if (!communityService.isProfileSetup()) {
      setShowProfileModal(true);
    }

    // Active fetch on load
    communityService.fetchLatestUsers().then(() => {
      loadData();
    });

    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('community_user_updated', handleUpdate);
    window.addEventListener('community_messages_updated', handleUpdate);
    window.addEventListener('community_block_updated', handleUpdate);

    return () => {
      window.removeEventListener('community_user_updated', handleUpdate);
      window.removeEventListener('community_messages_updated', handleUpdate);
      window.removeEventListener('community_block_updated', handleUpdate);
    };
  }, [searchQuery]);

  const handleStartChat = (partnerUserId: string) => {
    if (!communityService.isProfileComplete()) {
      setShowProfileModal(true);
      return;
    }
    communityService.setActiveTab(activeTab);
    onNavigate('direct-chat', { partnerUserId, returnTab: activeTab });
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-12 font-sans" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowRight size={20} />
          </button>
          <div>
            <h1 className="font-bold text-base sm:text-lg flex items-center gap-2 text-slate-900 dark:text-white">
              <span>مجتمع المصحف الشريف</span>
              <Sparkles size={18} className="text-amber-500" />
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              تواصل وتراسل مع الحُفّاظ والقُرّاء حول العالم
            </p>
          </div>
        </div>

        {/* Current User Profile Edit */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-all"
          >
            <User size={15} />
            <span className="hidden sm:inline">{currentUser.username || 'ملفي الشخصي'}</span>
            <Edit3 size={13} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-200/60 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-300/50 dark:border-slate-800 mb-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users size={16} />
            <span>المستخدمون المسجلون ({totalUsersCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all relative ${
              activeTab === 'chats'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare size={16} />
            <span>المحادثات ({chats.length})</span>
            {chats.some(c => c.unreadCount > 0) && (
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 left-2" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('blocked')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'blocked'
                ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Ban size={15} />
            <span>المحظورون</span>
          </button>
        </div>

        {/* Current User Profile Badge Card */}
        {currentUser.username && (
          <div className="mb-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center overflow-hidden border border-emerald-400/40 flex-shrink-0">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.username} className="w-full h-full object-cover" />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.username}</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">(أنت)</span>
                  {currentUser.isGoogleAuth ? (
                    <span className="text-[10px] bg-sky-500/20 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Shield size={10} />
                      <span>موثق Google</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setShowProfileModal(true)}
                      className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 hover:bg-amber-500/30 transition-all"
                    >
                      <span>ربط مع Google وحفظ الحساب</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.country} • {currentUser.bio || 'محب للقرآن'}</p>
              </div>
            </div>

            <button
              onClick={() => setShowProfileModal(true)}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 self-end sm:self-center bg-white/60 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-emerald-500/20"
            >
              <Edit3 size={13} />
              <span>تعديل الملف</span>
            </button>
          </div>
        )}

        {/* Search Input (For Users tab) */}
        {activeTab === 'users' && (
          <div className="relative mb-4">
            <Search size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن قارئ بالاسم أو الدولة..."
              className="w-full pl-4 pr-10 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        )}

        {/* Tab 1: Global Users Directory */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {users.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                <Globe size={40} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {searchQuery 
                    ? 'لا يوجد مستخدمون مطابقون للبحث' 
                    : totalUsersCount <= 1 
                      ? 'أنت أول المنضمين لمجتمع المصحف حالياً! ✨' 
                      : 'لا يوجد مستخدمون آخرون مسجلون حالياً'
                  }
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {searchQuery 
                    ? 'تأكد من كتابة الاسم بشكل صحيح' 
                    : 'عند فتح التطبيق من حاسوب/متصفح آخر وتسجيل اسم مستخدم جديد، سيظهر فوراً هنا للبدء في التراسل والتواصل.'
                  }
                </p>
              </div>
            ) : (
              users.map((u) => {
                const isOnline = communityService.isUserOnline(u);
                const statusText = communityService.getUserStatusText(u);

                return (
                  <motion.div
                    key={u.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/20 overflow-hidden">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                          ) : (
                            <User size={24} />
                          )}
                        </div>
                        {isOnline ? (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" title="متصل الآن" />
                        ) : (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-slate-400 border-2 border-white dark:border-slate-900 opacity-60" title="غير متصل" />
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{u.username}</span>
                        </h3>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">{u.country}</span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className={isOnline ? "text-emerald-500 font-medium text-[11px]" : "text-slate-400 text-[11px]"}>
                            {statusText}
                          </span>
                        </div>
                        {u.bio && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {u.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStartChat(u.userId)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                      >
                        <MessageSquare size={14} />
                        <span>محادثة</span>
                      </button>

                      <button
                        onClick={() => setUserToBlock(u)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors active:scale-95"
                        title="حظر المستخدم"
                      >
                        <Ban size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Active Chats */}
        {activeTab === 'chats' && (
          <div className="space-y-2.5">
            {chats.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                <MessageSquare size={40} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">لا توجد محادثات نشطة حالياً</p>
                <p className="text-xs text-slate-500 mt-1">اختر قاريء من تبويب (المستخدمون المسجلون) لبدء المحادثة معه</p>
              </div>
            ) : (
              chats.map((chat) => {
                const isPartnerOnline = communityService.isUserOnline(chat.partner);
                return (
                  <div
                    key={chat.chatId}
                    onClick={() => handleStartChat(chat.partner.userId)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/20 overflow-hidden">
                          {chat.partner.avatarUrl ? (
                            <img src={chat.partner.avatarUrl} alt={chat.partner.username} className="w-full h-full object-cover" />
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
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{chat.partner.username}</span>
                          <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400">({chat.partner.country})</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 font-medium">
                          {chat.lastMessage || 'بدء المحادثة'}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 font-medium">
                      {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 3: Blocked Users */}
        {activeTab === 'blocked' && (
          <div className="space-y-2.5">
            {blockedUsers.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                <Shield size={40} className="mx-auto text-emerald-500 mb-2 opacity-60" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">لا يوجد مستخدمون محظورون</p>
                <p className="text-xs text-slate-500 mt-1">المستخدمون المحظورون فلن تظهر أسماؤهم لك ولن يتمكنوا من التراسل معك</p>
              </div>
            ) : (
              blockedUsers.map((b) => {
                const displayName = b.user?.username || 'مستخدم محظور';
                const displayCountry = b.user?.country;
                return (
                  <div
                    key={b.blockedId}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm"
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
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{displayName}</span>
                          {displayCountry && (
                            <span className="text-xs font-normal text-slate-400">({displayCountry})</span>
                          )}
                        </h3>
                        <p className="text-[11px] text-slate-400">تاريخ الحظر: {new Date(b.createdAt).toLocaleDateString('ar-EG')}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUnblockUser(b.blockedId, b.user?.username)}
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-emerald-500/30 active:scale-95"
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

      {/* Block Confirmation Modal */}
      <AnimatePresence>
        {userToBlock && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-center"
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
                <Ban size={28} />
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
                تأكيد حظر المستخدم
              </h2>

              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                ({userToBlock.username}) {userToBlock.country ? `• ${userToBlock.country}` : ''}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                عند الحظر، لن يظهر اسم هذا المستخدم لك في القوائم، ولن تظهر أنت له، ولن يتمكن أي منكما من إرسال أو استقبال الرسائل.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setUserToBlock(null)}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  تراجع
                </button>
                <button
                  type="button"
                  onClick={confirmBlockUser}
                  className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-lg shadow-rose-600/20 active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Ban size={15} />
                  <span>تأكيد الحظر</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

      {/* Username Setup / Edit Modal */}
      <UsernameModal
        isOpen={showProfileModal}
        onClose={() => {
          if (!communityService.isProfileComplete()) {
            onBack();
          } else {
            setShowProfileModal(false);
          }
        }}
        onBackToApps={onBack}
        onSaved={() => loadData()}
      />
    </div>
  );
};

export default CommunityPage;
