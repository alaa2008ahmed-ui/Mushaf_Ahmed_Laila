import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Reply, Mic, Image as ImageIcon, Video, FileText, BookOpen } from 'lucide-react';
import type { QuotedReplyMessage } from '../../services/communityService';
export type { QuotedReplyMessage };
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// WhatsApp default reaction emojis matching 01.jpg
export const WHATSAPP_REACTION_EMOJIS = ['😏', '🙏', '😢', '😮', '😂', '❤️', '👍'];

interface MessageReactionsBarProps {
  onSelectEmoji: (emoji: string) => void;
  onOpenMoreEmojis?: () => void;
  onOpenMoreEmoji?: () => void;
  onClose?: () => void;
  userReaction?: string;
  isMe: boolean;
}

export const MessageReactionsBar: React.FC<MessageReactionsBarProps> = ({
  onSelectEmoji,
  onOpenMoreEmojis,
  onOpenMoreEmoji,
  onClose,
  userReaction,
  isMe
}) => {
  const handleOpenMore = () => {
    if (onOpenMoreEmojis) onOpenMoreEmojis();
    else if (onOpenMoreEmoji) onOpenMoreEmoji();
  };
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0, y: 8 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.5, opacity: 0, y: 8 }}
      transition={{ type: 'spring', damping: 22, stiffness: 350 }}
      className={`absolute bottom-full mb-2.5 ${isMe ? 'right-0' : 'left-0'} z-50 flex items-center gap-1.5 bg-white dark:bg-slate-800 rounded-full px-2 py-1.5 shadow-2xl border border-slate-200/90 dark:border-slate-700 select-none backdrop-blur-md`}
      onClick={(e) => e.stopPropagation()}
      dir="ltr"
    >
      {/* Plus button to open full emoji reaction picker */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          handleOpenMore();
        }}
        className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors shadow-xs cursor-pointer shrink-0"
        title="المزيد من التفاعلات"
      >
        <Plus size={18} strokeWidth={2.5} />
      </motion.button>

      {/* Main WhatsApp emojis matching user image */}
      <div className="flex items-center gap-1 sm:gap-1.5 px-0.5">
        {WHATSAPP_REACTION_EMOJIS.map((emoji) => {
          const isSelected = userReaction === emoji;
          return (
            <motion.button
              key={emoji}
              type="button"
              whileHover={{ scale: 1.35, y: -4 }}
              whileTap={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              onClick={(e) => {
                e.stopPropagation();
                try {
                  if (Capacitor.isNativePlatform()) {
                    Haptics.impact({ style: ImpactStyle.Light });
                  }
                } catch (err) {}
                onSelectEmoji(emoji);
              }}
              className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-xl sm:text-2xl rounded-full transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-emerald-500/20 ring-2 ring-emerald-500 scale-110 shadow-xs' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700/60'
              }`}
            >
              <span className="leading-none drop-shadow-xs">{emoji}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

// WhatsApp Reaction Badge shown at bottom corner of message bubble
interface MessageReactionBadgeProps {
  reactions?: { [userId: string]: string };
  currentUserId: string;
  onClick: () => void;
  isMe: boolean;
}

export const MessageReactionBadge: React.FC<MessageReactionBadgeProps> = ({
  reactions,
  currentUserId,
  onClick,
  isMe
}) => {
  if (!reactions || Object.keys(reactions).length === 0) return null;

  const reactionEntries = Object.entries(reactions);
  const totalCount = reactionEntries.length;
  if (totalCount === 0) return null;

  // Find unique emojis
  const uniqueEmojis = Array.from(new Set(reactionEntries.map(([_, emoji]) => emoji)));
  const myReaction = reactions[currentUserId];

  return (
    <motion.button
      type="button"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`absolute -bottom-2.5 ${isMe ? 'right-2' : 'left-2'} z-20 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold shadow-md select-none transition-all cursor-pointer ${
        myReaction
          ? 'bg-emerald-50 dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border-2 border-emerald-500/80 shadow-emerald-500/10'
          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-black/10'
      }`}
      title={myReaction ? `تفاعلت بـ ${myReaction} (اضغط للإلغاء)` : 'تفاعلات الأعضاء'}
      dir="ltr"
    >
      <div className="flex items-center -space-x-1">
        {uniqueEmojis.slice(0, 3).map((emoji, idx) => (
          <span key={idx} className="text-sm leading-none drop-shadow-xs">{emoji}</span>
        ))}
      </div>
      {totalCount > 1 && (
        <span className="text-[11px] font-bold opacity-80 pl-0.5">{totalCount}</span>
      )}
    </motion.button>
  );
};

// WhatsApp Swipe Right to Reply & Long Press Wrapper
interface SwipeableMessageWrapperProps {
  children: React.ReactNode;
  isMe: boolean;
  onSwipeReply: () => void;
  onLongPress: () => void;
  disabled?: boolean;
}

export const SwipeableMessageWrapper: React.FC<SwipeableMessageWrapperProps> = ({
  children,
  isMe,
  onSwipeReply,
  onLongPress,
  disabled = false
}) => {
  const [dragX, setDragX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const longPressTimerRef = useRef<any>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const isLongPressTriggeredRef = useRef(false);
  const thresholdPassedRef = useRef(false);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const triggerHaptic = (style: ImpactStyle = ImpactStyle.Light) => {
    try {
      if (Capacitor.isNativePlatform()) {
        Haptics.impact({ style });
      }
    } catch (e) {}
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    isLongPressTriggeredRef.current = false;
    thresholdPassedRef.current = false;

    clearLongPressTimer();
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      triggerHaptic(ImpactStyle.Medium);
      onLongPress();
    }, 420);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPosRef.current || isLongPressTriggeredRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartPosRef.current.x;
    const dy = touch.clientY - touchStartPosRef.current.y;

    // If vertical movement exceeds 10px, it's a page scroll -> cancel long press & swipe
    if (Math.abs(dy) > 10) {
      clearLongPressTimer();
      if (!isSwiping) return;
    }

    // If swiping right (dx > 8)
    if (dx > 8 && Math.abs(dx) > Math.abs(dy)) {
      clearLongPressTimer();
      setIsSwiping(true);
      const clampedX = Math.min(Math.max(0, dx * 0.75), 75);
      setDragX(clampedX);

      if (clampedX >= 45 && !thresholdPassedRef.current) {
        thresholdPassedRef.current = true;
        triggerHaptic(ImpactStyle.Light);
      } else if (clampedX < 45) {
        thresholdPassedRef.current = false;
      }
    }
  };

  const handleTouchEnd = () => {
    clearLongPressTimer();
    touchStartPosRef.current = null;

    if (thresholdPassedRef.current) {
      triggerHaptic(ImpactStyle.Medium);
      onSwipeReply();
    }

    setDragX(0);
    setIsSwiping(false);
    thresholdPassedRef.current = false;
  };

  // Mouse handlers for desktop support
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || e.button !== 0) return;
    touchStartPosRef.current = { x: e.clientX, y: e.clientY };
    isLongPressTriggeredRef.current = false;
    thresholdPassedRef.current = false;

    clearLongPressTimer();
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      triggerHaptic(ImpactStyle.Medium);
      onLongPress();
    }, 450);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!touchStartPosRef.current || isLongPressTriggeredRef.current || e.buttons !== 1) return;
    const dx = e.clientX - touchStartPosRef.current.x;
    const dy = e.clientY - touchStartPosRef.current.y;

    if (Math.abs(dy) > 12) {
      clearLongPressTimer();
      return;
    }

    if (dx > 10) {
      clearLongPressTimer();
      setIsSwiping(true);
      const clampedX = Math.min(Math.max(0, dx * 0.7), 75);
      setDragX(clampedX);

      if (clampedX >= 45 && !thresholdPassedRef.current) {
        thresholdPassedRef.current = true;
      } else if (clampedX < 45) {
        thresholdPassedRef.current = false;
      }
    }
  };

  const handleMouseUp = () => {
    clearLongPressTimer();
    touchStartPosRef.current = null;

    if (thresholdPassedRef.current) {
      onSwipeReply();
    }

    setDragX(0);
    setIsSwiping(false);
    thresholdPassedRef.current = false;
  };

  const swipeProgress = Math.min(dragX / 45, 1);

  return (
    <div
      className="relative flex items-center select-none w-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => {
        // Desktop right-click triggers reaction bar
        e.preventDefault();
        onLongPress();
      }}
    >
      {/* Animated Reply icon indicator on the left side during swipe */}
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none z-10 transition-transform duration-75 flex items-center justify-center"
        style={{
          opacity: swipeProgress,
          transform: `translateY(-50%) scale(${0.5 + swipeProgress * 0.6})`,
          width: '36px',
          height: '36px'
        }}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md transition-colors ${
          thresholdPassedRef.current ? 'bg-emerald-600 scale-110' : 'bg-slate-400 dark:bg-slate-600'
        }`}>
          <Reply size={16} className="rotate-180" />
        </div>
      </div>

      {/* Message content sliding smoothly */}
      <div
        className="w-full flex transition-transform ease-out"
        style={{
          transform: `translateX(${dragX}px)`,
          transitionDuration: isSwiping ? '0ms' : '220ms',
          justifyContent: isMe ? 'flex-start' : 'flex-end'
        }}
      >
        {children}
      </div>
    </div>
  );
};

// WhatsApp Quoted Reply Preview Bar shown above Chat Input Box (Matches 02.jpg)
interface ReplyPreviewBarProps {
  replyTo: QuotedReplyMessage;
  onCancel: () => void;
  isEn?: boolean;
}

export const ReplyPreviewBar: React.FC<ReplyPreviewBarProps> = ({
  replyTo,
  onCancel,
  isEn = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: 12, height: 0 }}
      transition={{ type: 'spring', damping: 24, stiffness: 350 }}
      className="mb-2 p-2.5 px-3 rounded-2xl bg-slate-100/95 dark:bg-slate-800/95 border border-slate-200/90 dark:border-slate-700/80 shadow-sm flex items-center justify-between gap-3 relative overflow-hidden backdrop-blur-md"
      dir={isEn ? "ltr" : "rtl"}
    >
      {/* Vertical Accent Stripe on the edge (Matches Image 02.jpg) */}
      <div className={`w-1.5 self-stretch bg-emerald-600 dark:bg-emerald-500 rounded-full shrink-0 ${isEn ? 'mr-1' : 'ml-1'}`} />

      {/* Text / media content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-bold text-xs text-emerald-700 dark:text-emerald-400 truncate">
            {replyTo.senderName || (isEn ? 'User' : 'القارئ')}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {isEn ? 'Replying to' : 'الرد على'}
          </span>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300 truncate flex items-center gap-1 font-medium">
          {replyTo.hasAudio ? (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Mic size={13} />
              <span>{isEn ? 'Voice message' : 'رسالة صوتية'}</span>
            </span>
          ) : replyTo.hasAttachment ? (
            replyTo.attachmentType === 'image' ? (
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <ImageIcon size={13} />
                <span>{isEn ? 'Photo' : 'صورة'}</span>
              </span>
            ) : replyTo.attachmentType === 'video' ? (
              <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                <Video size={13} />
                <span>{isEn ? 'Video' : 'مقطع مرئي'}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <FileText size={13} />
                <span>{isEn ? 'Document' : 'ملف / مستند'}</span>
              </span>
            )
          ) : replyTo.hasVerse ? (
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
              <BookOpen size={13} />
              <span>{isEn ? `Quran verse (${replyTo.surahName || ''})` : `آية من سورة ${replyTo.surahName || 'القرآن'}`}</span>
            </span>
          ) : (
            <span className="truncate">{replyTo.text || (isEn ? 'Message' : 'رسالة')}</span>
          )}
        </div>
      </div>

      {/* Close button (Matches Image 02.jpg on the opposite side) */}
      <button
        type="button"
        onClick={onCancel}
        className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer shrink-0"
        title={isEn ? "Cancel reply" : "إلغاء الرد"}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

// WhatsApp Quoted Message Block rendered inside message bubble
interface QuotedMessageBlockProps {
  replyTo?: QuotedReplyMessage;
  onClick?: () => void;
  isMe: boolean;
  isEn?: boolean;
}

export const QuotedMessageBlock: React.FC<QuotedMessageBlockProps> = ({
  replyTo,
  onClick,
  isMe,
  isEn = false
}) => {
  if (!replyTo) return null;

  return (
    <div
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
      className={`mb-2 p-2 px-2.5 rounded-xl text-xs transition-opacity hover:opacity-90 active:scale-[0.99] cursor-pointer relative overflow-hidden select-none border-r-4 ${
        isMe
          ? 'bg-black/15 text-white/95 border-emerald-300'
          : 'bg-black/5 dark:bg-black/25 text-slate-800 dark:text-slate-200 border-emerald-600 dark:border-emerald-500'
      }`}
      dir={isEn ? "ltr" : "rtl"}
    >
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <span className={`font-bold text-[11px] truncate ${isMe ? 'text-emerald-200' : 'text-emerald-700 dark:text-emerald-400'}`}>
          {replyTo.senderName || (isEn ? 'User' : 'القارئ')}
        </span>
      </div>

      <div className="truncate opacity-85 text-[11px] leading-relaxed flex items-center gap-1">
        {replyTo.hasAudio ? (
          <span className="flex items-center gap-1">
            <Mic size={12} />
            <span>{isEn ? 'Voice message' : 'رسالة صوتية'}</span>
          </span>
        ) : replyTo.hasAttachment ? (
          replyTo.attachmentType === 'image' ? (
            <span className="flex items-center gap-1">
              <ImageIcon size={12} />
              <span>{isEn ? 'Photo' : 'صورة'}</span>
            </span>
          ) : replyTo.attachmentType === 'video' ? (
            <span className="flex items-center gap-1">
              <Video size={12} />
              <span>{isEn ? 'Video' : 'مقطع مرئي'}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <FileText size={12} />
              <span>{isEn ? 'Document' : 'مستند'}</span>
            </span>
          )
        ) : replyTo.hasVerse ? (
          <span className="flex items-center gap-1">
            <BookOpen size={12} />
            <span>{isEn ? `Quran verse (${replyTo.surahName || ''})` : `آية من سورة ${replyTo.surahName || ''}`}</span>
          </span>
        ) : (
          <span className="truncate">{replyTo.text || (isEn ? 'Message' : 'رسالة')}</span>
        )}
      </div>
    </div>
  );
};
