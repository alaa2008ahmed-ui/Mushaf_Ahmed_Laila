import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, ArrowLeft, Volume2, BookOpen, Users, Image as ImageIcon, Paperclip } from 'lucide-react';
import { ChatMessage, GroupMessage, GroupChat, CommunityUser } from '../services/communityService';

interface InAppChatNotificationProps {
  currentPage: string;
  navParams?: any;
  onNavigate: (pageId: string, params?: any) => void;
}

interface NotificationItem {
  id: string;
  type: 'direct' | 'group';
  message: ChatMessage | GroupMessage;
  sender: CommunityUser;
  group?: GroupChat;
}

export const InAppChatNotification: React.FC<InAppChatNotificationProps> = ({
  currentPage,
  navParams,
  onNavigate
}) => {
  const [currentNotification, setCurrentNotification] = useState<NotificationItem | null>(null);

  useEffect(() => {
    const handleIncomingMessage = (e: any) => {
      const { message, sender, group, type } = e.detail || {};
      if (!message) return;

      // Do not show notifications on listen page
      if (currentPage === 'listen') {
        return;
      }

      // If direct chat and user is already chatting with this partner, skip
      if (type !== 'group' && currentPage === 'direct-chat' && navParams?.partnerUserId === sender?.userId) {
        return;
      }

      // If group chat and user is already currently open inside this exact group, skip
      if (type === 'group' && currentPage === 'group-chat' && navParams?.groupId === group?.groupId) {
        return;
      }

      const item: NotificationItem = {
        id: `${message.messageId || Date.now()}`,
        type: type === 'group' ? 'group' : 'direct',
        message,
        sender: sender || {
          userId: message.senderId,
          username: message.senderName || 'عضو في المجموعة',
          country: '',
          isOnline: true,
          createdAt: new Date().toISOString()
        },
        group
      };

      setCurrentNotification(item);
    };

    window.addEventListener('community_inapp_notification', handleIncomingMessage);
    return () => {
      window.removeEventListener('community_inapp_notification', handleIncomingMessage);
    };
  }, [currentPage, navParams]);

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (!currentNotification) return;

    const timer = setTimeout(() => {
      setCurrentNotification(null);
    }, 6000);

    return () => clearTimeout(timer);
  }, [currentNotification]);

  const handleOpenChat = () => {
    if (!currentNotification) return;
    if (currentNotification.type === 'group' && currentNotification.group?.groupId) {
      const gId = currentNotification.group.groupId;
      setCurrentNotification(null);
      onNavigate('group-chat', { groupId: gId, initialTab: 'community', returnTab: 'community' });
    } else {
      const partnerId = currentNotification.sender.userId;
      setCurrentNotification(null);
      onNavigate('direct-chat', { partnerUserId: partnerId });
    }
  };

  const renderContentPreview = (msg: ChatMessage | GroupMessage) => {
    if (msg.verseData) {
      return (
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
          <BookOpen size={13} />
          <span>آية من سورة {msg.verseData.surahName}</span>
        </span>
      );
    }
    if (msg.audioUrl) {
      return (
        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
          <Volume2 size={13} />
          <span>مقطع صوتي مسجل</span>
        </span>
      );
    }
    const att = (msg as any).attachment;
    if (att) {
      return (
        <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
          {att.type === 'image' ? <ImageIcon size={13} /> : <Paperclip size={13} />}
          <span>{att.type === 'image' ? 'صورة 📷' : att.type === 'video' ? 'مقطع مرئي 🎥' : `ملف: ${att.fileName || 'مستند'} 📄`}</span>
        </span>
      );
    }
    return <span className="line-clamp-1">{msg.text || 'رسالة جديدة'}</span>;
  };

  const renderAvatar = () => {
    if (!currentNotification) return null;

    if (currentNotification.type === 'group') {
      const grp = currentNotification.group;
      const avatar = grp?.avatarUrl?.trim();
      const isEmoji = avatar && !avatar.startsWith('http') && !avatar.startsWith('data:') && !avatar.startsWith('/');

      return (
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center border border-amber-500/30 overflow-hidden shadow-inner text-xl">
            {avatar && !isEmoji ? (
              <img src={avatar} alt={grp?.name} className="w-full h-full object-cover" />
            ) : isEmoji ? (
              <span>{avatar}</span>
            ) : grp?.groupId === 'group_default_quran_readers' ? (
              <span>📖</span>
            ) : grp?.groupId === 'group_default_tadabbur' ? (
              <span>🌿</span>
            ) : (
              <Users size={20} />
            )}
          </div>
          <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] shadow-sm font-bold border border-white dark:border-slate-900">
            <Users size={9} />
          </div>
        </div>
      );
    }

    return (
      <div className="relative flex-shrink-0">
        <div className="w-11 h-11 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/30 overflow-hidden shadow-inner">
          {currentNotification.sender.avatarUrl ? (
            <img
              src={currentNotification.sender.avatarUrl}
              alt={currentNotification.sender.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <MessageSquare size={20} />
          )}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
      </div>
    );
  };

  return (
    <AnimatePresence>
      {currentNotification && currentPage !== 'listen' && (
        <div className="fixed top-4 inset-x-0 z-[9999] flex justify-center px-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="pointer-events-auto w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-emerald-500/35 rounded-2xl shadow-2xl p-3.5 flex items-center justify-between gap-3 text-slate-800 dark:text-white"
          >
            {/* Sender / Group info & message body */}
            <div
              onClick={handleOpenChat}
              className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
            >
              {renderAvatar()}

              <div className="flex-1 min-w-0">
                {currentNotification.type === 'group' ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm truncate max-w-[140px] sm:max-w-[190px]">
                      {currentNotification.group?.name || 'مجموعة'}
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.2 rounded-md font-bold">
                      مجموعة
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate max-w-[110px]">
                      • {currentNotification.sender.username}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs sm:text-sm truncate">
                      {currentNotification.sender.username}
                    </span>
                    {currentNotification.sender.country && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md font-medium">
                        {currentNotification.sender.country}
                      </span>
                    )}
                  </div>
                )}

                <div className="text-xs text-slate-500 dark:text-slate-300 mt-0.5 truncate">
                  {renderContentPreview(currentNotification.message)}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={handleOpenChat}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              >
                <span>{currentNotification.type === 'group' ? 'انتقال' : 'رد'}</span>
                <ArrowLeft size={13} />
              </button>

              <button
                type="button"
                onClick={() => setCurrentNotification(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
