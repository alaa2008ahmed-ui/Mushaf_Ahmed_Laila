import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, ArrowLeft, Volume2, BookOpen } from 'lucide-react';
import { ChatMessage, CommunityUser } from '../services/communityService';

interface InAppChatNotificationProps {
  currentPage: string;
  navParams?: any;
  onNavigate: (pageId: string, params?: any) => void;
}

interface NotificationItem {
  id: string;
  message: ChatMessage;
  sender: CommunityUser;
}

export const InAppChatNotification: React.FC<InAppChatNotificationProps> = ({
  currentPage,
  navParams,
  onNavigate
}) => {
  const [currentNotification, setCurrentNotification] = useState<NotificationItem | null>(null);

  useEffect(() => {
    const handleIncomingMessage = (e: any) => {
      const { message, sender } = e.detail || {};
      if (!message || !sender) return;

      // If user is currently looking at the direct chat with this exact partner, don't show the popup banner
      if (currentPage === 'direct-chat' && navParams?.partnerUserId === sender.userId) {
        return;
      }

      const item: NotificationItem = {
        id: `${message.messageId || Date.now()}`,
        message,
        sender
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
    const partnerId = currentNotification.sender.userId;
    setCurrentNotification(null);
    onNavigate('direct-chat', { partnerUserId: partnerId });
  };

  const renderContentPreview = (msg: ChatMessage) => {
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
    return <span className="line-clamp-1">{msg.text || 'رسالة جديدة'}</span>;
  };

  return (
    <AnimatePresence>
      {currentNotification && (
        <div className="fixed top-4 inset-x-0 z-[9999] flex justify-center px-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="pointer-events-auto w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 rounded-2xl shadow-2xl p-3.5 flex items-center justify-between gap-3 text-slate-800 dark:text-white"
          >
            {/* Sender info & message body */}
            <div
              onClick={handleOpenChat}
              className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
            >
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

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs sm:text-sm truncate">
                    {currentNotification.sender.username}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md font-medium">
                    {currentNotification.sender.country}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-300 mt-0.5 truncate">
                  {renderContentPreview(currentNotification.message)}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleOpenChat}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1 transition-all active:scale-95"
              >
                <span>رد</span>
                <ArrowLeft size={13} />
              </button>

              <button
                onClick={() => setCurrentNotification(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
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
