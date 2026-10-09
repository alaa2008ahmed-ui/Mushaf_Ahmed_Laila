import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, Send, Smile, MoreVertical, Trash2, Check, 
  CheckCheck, Ban, User, Sparkles, AlertCircle, BookOpen, Play, Pause, CheckCircle2,
  Mic, Volume2, Loader2, UserPlus, Clock, X
} from 'lucide-react';
import { communityService, CommunityUser, ChatMessage, QuranVerseAttachment, ADMIN_USER_ID } from '../services/communityService';
import { SUPPORT_AVATAR_BASE64 } from '../src/supportAvatarBase64';
import EmojiPicker from '../components/Community/EmojiPicker';
import QuranVerseModal from '../components/Community/QuranVerseModal';
import { Capacitor } from '@capacitor/core';
import { registerBackInterceptor } from '../hooks/useBackButton';

interface DirectChatPageProps {
  partnerUserId: string;
  onBack: () => void;
  onNavigate: (pageId: string, params?: any) => void;
}

// Frame overlay component for Chat Verse Cards
export const FrameOverlay: React.FC<{ frameType?: string; frameColor?: string }> = ({ frameType, frameColor = '#FFD700' }) => {
  if (!frameType || frameType === 'none') return null;

  if (frameType === 'double') {
    return (
      <div 
        className="absolute inset-2 pointer-events-none rounded-xl z-10"
        style={{ border: `3px double ${frameColor}` }}
      />
    );
  }

  if (frameType === 'corner-diamonds') {
    return (
      <div className="absolute inset-3 pointer-events-none z-10" style={{ border: `1px solid ${frameColor}` }}>
        <div style={{ position: 'absolute', top: '-4px', left: '-4px', width: '8px', height: '8px', backgroundColor: frameColor, transform: 'rotate(45deg)' }} />
        <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', backgroundColor: frameColor, transform: 'rotate(45deg)' }} />
        <div style={{ position: 'absolute', bottom: '-4px', left: '-4px', width: '8px', height: '8px', backgroundColor: frameColor, transform: 'rotate(45deg)' }} />
        <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '8px', height: '8px', backgroundColor: frameColor, transform: 'rotate(45deg)' }} />
      </div>
    );
  }

  if (frameType === 'mihrab') {
    return (
      <div 
        className="absolute inset-2 pointer-events-none rounded-t-full rounded-b-xl z-10"
        style={{ border: `2px solid ${frameColor}` }}
      />
    );
  }

  if (frameType === 'elegant') {
    return (
      <div className="absolute inset-2 pointer-events-none rounded-xl z-10" style={{ border: `1px solid ${frameColor}` }}>
        <div className="absolute inset-1 rounded-lg opacity-50" style={{ border: `1px solid ${frameColor}` }} />
      </div>
    );
  }

  if (frameType === 'mihrab-double') {
    return (
      <div className="absolute inset-2 pointer-events-none rounded-t-full rounded-b-xl z-10" style={{ border: `2px solid ${frameColor}` }}>
        <div className="absolute inset-1 rounded-t-full rounded-b-lg opacity-60" style={{ border: `1px dashed ${frameColor}` }} />
      </div>
    );
  }

  if (frameType === 'classic-islamic') {
    return (
      <div className="absolute inset-2 pointer-events-none z-10" style={{ border: `1px solid ${frameColor}` }}>
        <div className="absolute inset-1" style={{ border: `2px solid ${frameColor}`, opacity: 0.9 }} />
      </div>
    );
  }

  return null;
};

// Render exact matching Quran Verse Attachment inside chat message
export const ChatQuranCard: React.FC<{
  verseData: QuranVerseAttachment;
  playingAudioUrl: string | null;
  onToggleAudio: (url?: string) => void;
}> = ({ verseData, playingAudioUrl, onToggleAudio }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const toArabicDigits = (str: number | string) => {
    return String(str).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
  };

  const shareType = verseData.shareType || 'image';

  return (
    <div className="mb-2 relative w-full overflow-hidden rounded-2xl transition-all" dir="rtl">
      {/* Captured Card View matching images exactly */}
      <div ref={cardRef} style={{ letterSpacing: '0px', wordSpacing: 'normal' }}>
        {/* Render based on selected shareType */}
        {shareType === 'text' ? (
          <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-center shadow-sm" style={{ letterSpacing: '0px' }}>
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2" style={{ letterSpacing: '0px' }}>
              سورة {verseData.surahName} ({verseData.fromAyah && verseData.toAyah && verseData.fromAyah !== verseData.toAyah ? `الآيات ${toArabicDigits(verseData.fromAyah)} إلى ${toArabicDigits(verseData.toAyah)}` : `الآية ${toArabicDigits(verseData.ayahNumber)}`})
            </div>
            <p className="text-base font-bold leading-loose px-2" style={{ letterSpacing: '0px', fontFamily: 'var(--font-amiri-quran), "Noto Naskh Arabic", serif' }}>
              ﴿ {verseData.text} ﴾
            </p>
            {verseData.customNote && (
              <p className="text-xs italic text-amber-600 dark:text-amber-400 mt-2 border-t pt-1.5 border-slate-200 dark:border-slate-700" style={{ letterSpacing: '0px' }}>
                "{verseData.customNote}"
              </p>
            )}
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-2 pt-1 border-t border-slate-100 dark:border-slate-800" style={{ letterSpacing: '0px' }}>
              مصحف احمد وليلي
            </div>
          </div>
        ) : shareType === 'audio' ? (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white border border-emerald-500/40 text-center flex flex-col items-center justify-center gap-2 shadow-sm" style={{ letterSpacing: '0px' }}>
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-bold text-emerald-300" style={{ letterSpacing: '0px' }}>
                سورة {verseData.surahName} (آية {toArabicDigits(verseData.ayahNumber)})
              </span>
              {verseData.audioUrl && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleAudio(verseData.audioUrl);
                  }}
                  className="p-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition-transform active:scale-95 flex items-center justify-center"
                >
                  {playingAudioUrl === verseData.audioUrl ? <Pause size={16} /> : <Play size={16} />}
                </button>
              )}
            </div>
            <p className="text-sm text-slate-100 line-clamp-3 leading-relaxed" style={{ letterSpacing: '0px', fontFamily: 'var(--font-amiri-quran), "Noto Naskh Arabic", serif' }}>
              ﴿ {verseData.text} ﴾
            </p>
            <span className="text-[10px] text-amber-300 font-bold" style={{ letterSpacing: '0px' }}>بصوت الشيخ مشاري العفاسي 🎙️</span>
          </div>
        ) : shareType === 'page' ? (
          /* Exact Match with Image 1 & Image 3 for Page Share */
          <div className="p-5 rounded-2xl bg-[#FFFDF5] text-[#292524] border border-amber-500/30 text-center shadow-sm flex flex-col items-center justify-between gap-3" dir="rtl" style={{ letterSpacing: '0px', wordSpacing: 'normal' }}>
            <div className="text-xs font-bold text-[#9A3412]" style={{ letterSpacing: '0px' }}>
              صفحة مصحف - سورة {verseData.surahName} ({verseData.fromAyah && verseData.toAyah && verseData.fromAyah !== verseData.toAyah ? `الآيات ${toArabicDigits(verseData.fromAyah)} إلى ${toArabicDigits(verseData.toAyah)}` : `آية ${toArabicDigits(verseData.ayahNumber)}`})
            </div>
            <div className="w-full h-[1px] bg-[#E7E5E4]" />
            <p 
              className="text-base leading-loose font-bold text-[#1C1917] px-2"
              style={{
                fontFamily: verseData.fontFamily || 'var(--font-amiri-quran), var(--font-hafs), "Noto Naskh Arabic", serif',
                fontSize: verseData.fontSize ? `${verseData.fontSize}px` : '18px',
                letterSpacing: '0px',
                wordSpacing: 'normal'
              }}
            >
              ﴿ {verseData.text} ﴾
            </p>
            <div className="w-full h-[1px] bg-[#E7E5E4]" />
            <div className="text-[11px] text-[#78716C] font-bold" style={{ letterSpacing: '0px' }}>
              مصحف احمد وليلي • صفحة قراءة
            </div>
          </div>
        ) : (
          /* Image Card mode matching preview */
          <div
            className="relative min-h-[180px] p-5 rounded-2xl shadow-sm flex flex-col items-center justify-between text-center overflow-hidden border border-slate-200 dark:border-slate-800"
            dir="rtl"
            style={{
              background: verseData.bgValue || '#ffffff',
              color: verseData.textColor || '#000000',
              letterSpacing: '0px',
              wordSpacing: 'normal'
            }}
          >
            <FrameOverlay frameType={verseData.frameType} frameColor={verseData.frameColor} />

            <div className="text-center text-xs font-bold opacity-80 mb-1" style={{ color: verseData.textColor, letterSpacing: '0px', fontFamily: 'var(--font-amiri-quran), "Noto Naskh Arabic", serif' }}>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </div>

            <div
              className="text-center font-bold leading-loose my-2 px-1"
              style={{
                fontSize: verseData.fontSize ? `${verseData.fontSize}px` : '18px',
                fontFamily: verseData.fontFamily || 'var(--font-amiri-quran), var(--font-hafs), "Noto Naskh Arabic", serif',
                color: verseData.textColor || '#000000',
                letterSpacing: '0px',
                wordSpacing: 'normal'
              }}
            >
              ﴿ {verseData.text} ﴾
            </div>

            {verseData.customNote && (
              <div className="text-xs italic opacity-90 my-1 font-medium" style={{ color: verseData.textColor, letterSpacing: '0px' }}>
                "{verseData.customNote}"
              </div>
            )}

            <div 
              className="text-[11px] font-bold mt-1" 
              style={{ 
                color: verseData.textColor, 
                letterSpacing: '0px', 
                wordSpacing: 'normal',
                fontFamily: 'var(--font-cairo), "Noto Naskh Arabic", Arial, sans-serif' 
              }}
            >
              سورة {verseData.surahName} ({verseData.fromAyah && verseData.toAyah && verseData.fromAyah !== verseData.toAyah ? `الآيات ${toArabicDigits(verseData.fromAyah)}-${toArabicDigits(verseData.toAyah)}` : `آية ${toArabicDigits(verseData.ayahNumber)}`}) • مصحف احمد وليلي
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Voice message player for chat messages
export const ChatMessageAudioPlayer: React.FC<{
  audioUrl: string;
  isMe: boolean;
  audioDuration?: number;
  timeStr?: string;
  isRead?: boolean;
}> = ({ audioUrl, isMe, audioDuration, timeStr, isRead }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(audioDuration || 0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      } else {
        // WebM MediaRecorder duration fix trick for browsers/WebViews
        audio.currentTime = 1e101;
      }
    };

    const handleTimeUpdate = () => {
      // If we jumped to 1e101 to extract duration, reset to 0 once duration is resolved
      if (audio.currentTime > 10000) {
        if (audio.duration && isFinite(audio.duration) && !isNaN(audio.duration) && audio.duration > 0) {
          setDuration(audio.duration);
        }
        audio.currentTime = 0;
        return;
      }

      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    // Fast Web Audio API duration calculation for base64 / WebM voice notes
    let isCancelled = false;
    if (!audioDuration || audioDuration <= 0) {
      try {
        fetch(audioUrl)
          .then(res => res.arrayBuffer())
          .then(buffer => {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
              const ctx = new AudioContextClass();
              return ctx.decodeAudioData(buffer);
            }
          })
          .then(decoded => {
            if (!isCancelled && decoded && decoded.duration && isFinite(decoded.duration) && decoded.duration > 0) {
              setDuration(decoded.duration);
            }
          })
          .catch(() => {});
      } catch (e) {}
    }

    return () => {
      isCancelled = true;
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, audioDuration]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('Audio playback error:', err);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    const seekTime = parseFloat(e.target.value);
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0 || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div 
      className={`relative flex flex-col p-3 px-3.5 rounded-2xl min-w-[210px] sm:min-w-[240px] max-w-[290px] shadow-sm transition-all cursor-pointer ${
        isMe 
          ? 'bg-emerald-600 text-white rounded-tr-none' 
          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/70 rounded-tl-none'
      }`} 
      dir="rtl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center transition-all active:scale-90 shadow-md ${
            isMe
              ? 'bg-white text-emerald-600 hover:bg-slate-100'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
          title={isPlaying ? 'إيقاف موقت' : 'تشغيل الرسالة الصوتية'}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-[-1px]" />}
        </button>

        <div className="flex-1 flex flex-col justify-center gap-1.5 min-w-0">
          <div className="flex items-center justify-between text-[11px] font-bold opacity-90">
            <span className="flex items-center gap-1">
              <Mic size={12} className={isMe ? 'text-emerald-200' : 'text-emerald-500'} />
              <span>تسجيل صوتي</span>
            </span>
            <span className="font-mono text-[11px]">
              {isPlaying ? formatTime(currentTime) : formatTime(duration)}
            </span>
          </div>

          {/* Progress Bar & Seek Slider */}
          <div className="relative w-full h-2 rounded-full bg-black/15 dark:bg-white/20 overflow-hidden flex items-center">
            <div 
              className={`h-full rounded-full transition-all ${isMe ? 'bg-white' : 'bg-emerald-500'}`}
              style={{ width: `${progressPercent}%` }}
            />
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
          </div>
        </div>
      </div>

      {/* Timestamp and Read Status INSIDE the card */}
      {timeStr && (
        <div className={`flex items-center gap-1 justify-end mt-1.5 text-[10px] ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>
          <span>{timeStr}</span>
          {isMe && (
            isRead ? (
              <CheckCheck size={13} className="text-sky-300" />
            ) : (
              <Check size={13} className="opacity-70" />
            )
          )}
        </div>
      )}
    </div>
  );
};

const DirectChatPage: React.FC<DirectChatPageProps> = ({ partnerUserId, onBack, onNavigate }) => {
  const currentUser = communityService.getCurrentUser();
  const [partner, setPartner] = useState<CommunityUser | null>(null);
  const [friendship, setFriendship] = useState(() => communityService.getFriendshipStatus(partnerUserId));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showVerseModal, setShowVerseModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showDeleteReadModal, setShowDeleteReadModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuDropdownRef = useRef<HTMLDivElement>(null);
  const emojiPickerContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);
  const isFirstLoadRef = useRef<boolean>(true);
  const userIsNearBottomRef = useRef<boolean>(true);
  const prevMsgCountRef = useRef<number>(0);

  // Clean up recording timers & tracks on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        try {
          mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
        } catch (e) {}
      }
    };
  }, []);

  // Global click & touch outside listeners to guarantee immediate closing when tapping or clicking anywhere on screen
  useEffect(() => {
    if (!showMenu && !showEmojiPicker) return;

    const handleGlobalClickOutside = (event: MouseEvent | TouchEvent | PointerEvent) => {
      const target = event.target as Node;
      if (showMenu) {
        if (menuDropdownRef.current && menuDropdownRef.current.contains(target)) {
          return;
        }
        if (menuButtonRef.current && menuButtonRef.current.contains(target)) {
          return;
        }
        setShowMenu(false);
      }
      if (showEmojiPicker && emojiPickerContainerRef.current && !emojiPickerContainerRef.current.contains(target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('pointerdown', handleGlobalClickOutside, true);
    document.addEventListener('touchstart', handleGlobalClickOutside, true);
    document.addEventListener('mousedown', handleGlobalClickOutside, true);

    return () => {
      document.removeEventListener('pointerdown', handleGlobalClickOutside, true);
      document.removeEventListener('touchstart', handleGlobalClickOutside, true);
      document.removeEventListener('mousedown', handleGlobalClickOutside, true);
    };
  }, [showMenu, showEmojiPicker]);

  // Back interceptor for device/phone back button (Capacitor/Android & browser back)
  useEffect(() => {
    const interceptor = () => {
      // 1. Close verse modal
      if (showVerseModal) {
        setShowVerseModal(false);
        return true;
      }
      // 2. Close emoji picker
      if (showEmojiPicker) {
        setShowEmojiPicker(false);
        return true;
      }
      // 3. Close 3-dots top menu
      if (showMenu) {
        setShowMenu(false);
        return true;
      }
      // 4. Close confirmation modals
      if (showBlockModal) {
        setShowBlockModal(false);
        return true;
      }
      if (showDeleteReadModal) {
        setShowDeleteReadModal(false);
        return true;
      }
      if (showClearModal) {
        setShowClearModal(false);
        return true;
      }
      if (selectedMsgId) {
        setSelectedMsgId(null);
        return true;
      }
      // 5. Exit chat to previous screen (Community Page)
      onBack();
      return true;
    };

    const unregister = registerBackInterceptor(interceptor);
    return unregister;
  }, [showVerseModal, showEmojiPicker, showMenu, showBlockModal, showDeleteReadModal, showClearModal, selectedMsgId, onBack]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior
      });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    // User is considered near bottom if within 120px from bottom
    const isNear = scrollHeight - scrollTop - clientHeight < 120;
    userIsNearBottomRef.current = isNear;
  };

  const loadData = (shouldScrollIfNear: boolean = false) => {
    if (!communityService.isProfileComplete()) {
      showToast('عفواً، يجب استكمال بيانات ملفك الشخصي أولاً');
      onBack();
      return;
    }

    const found = communityService.getUserById(partnerUserId);
    if (found) {
      setPartner(found);
    } else {
      setPartner({
        userId: partnerUserId,
        username: 'مستخدم المصحف',
        country: 'غير محدد',
        isOnline: false,
        createdAt: new Date().toISOString()
      });
    }

    const blocked = communityService.isBlockedMutually(partnerUserId);
    setIsBlocked(blocked);

    const fStatus = communityService.getFriendshipStatus(partnerUserId);
    setFriendship(fStatus);

    const chatMsgs = communityService.getMessagesForChat(partnerUserId);
    
    setMessages(prev => {
      // Check if messages actually changed
      const isDifferent = prev.length !== chatMsgs.length || 
        (chatMsgs.length > 0 && prev.length > 0 && prev[prev.length - 1]?.messageId !== chatMsgs[chatMsgs.length - 1]?.messageId);
      
      if (isDifferent || isFirstLoadRef.current) {
        if (isFirstLoadRef.current) {
          setTimeout(() => {
            scrollToBottom('auto');
            isFirstLoadRef.current = false;
          }, 50);
        } else if (shouldScrollIfNear && userIsNearBottomRef.current) {
          setTimeout(() => {
            scrollToBottom('smooth');
          }, 50);
        }
        return chatMsgs;
      }
      return prev;
    });

    communityService.markMessagesAsRead(partnerUserId);
  };

  useEffect(() => {
    isFirstLoadRef.current = true;
    userIsNearBottomRef.current = true;
    loadData(true);

    const handleUpdate = () => {
      loadData(true);
    };

    window.addEventListener('community_contacts_updated', handleUpdate);

    const presenceInterval = setInterval(() => {
      // Periodic presence refresh without force scrolling
      loadData(false);
    }, 4000);

    window.addEventListener('community_messages_updated', handleUpdate);
    window.addEventListener('community_block_updated', handleUpdate);
    window.addEventListener('community_user_updated', handleUpdate);

    return () => {
      clearInterval(presenceInterval);
      window.removeEventListener('community_messages_updated', handleUpdate);
      window.removeEventListener('community_block_updated', handleUpdate);
      window.removeEventListener('community_contacts_updated', handleUpdate);
      window.removeEventListener('community_user_updated', handleUpdate);
    };
  }, [partnerUserId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (!isBlocked) {
      communityService.setTypingStatus(partnerUserId, true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        communityService.setTypingStatus(partnerUserId, false);
      }, 2000);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isBlocked) return;

    const textToSend = inputText;
    // Automatically clear the written text immediately from the message input box
    setInputText('');
    setShowEmojiPicker(false);

    try {
      await communityService.sendMessage(partnerUserId, textToSend);
      communityService.setTypingStatus(partnerUserId, false);
      loadData(true);
      setTimeout(() => scrollToBottom('smooth'), 50);
    } catch (err: any) {
      communityService.setTypingStatus(partnerUserId, false);
      showToast(err?.message || 'عفواً، تعذر إرسال الرسالة');
    }
  };

  const handleSendVerse = async (verse: QuranVerseAttachment) => {
    if (isBlocked) return;
    try {
      await communityService.sendMessage(partnerUserId, '', verse);
      setShowVerseModal(false);
      loadData(true);
      setTimeout(() => scrollToBottom('smooth'), 50);
    } catch (err: any) {
      showToast(err?.message || 'عفواً، تعذر إرسال الرسالة');
    }
  };

  const handleToggleAudio = (url?: string) => {
    if (!url) return;
    if (playingAudioUrl === url) {
      audioPlayer?.pause();
      setPlayingAudioUrl(null);
    } else {
      audioPlayer?.pause();
      const newAudio = new Audio(url);
      newAudio.play();
      setAudioPlayer(newAudio);
      setPlayingAudioUrl(url);
      newAudio.onended = () => setPlayingAudioUrl(null);
    }
  };

  const handleEmojiSelect = (emojiOrText: string) => {
    setInputText(prev => {
      if (!prev) return emojiOrText;
      // If it's a long phrase / text sticker, add space before
      if (emojiOrText.length > 2) {
        return prev + (prev.endsWith(' ') ? '' : ' ') + emojiOrText;
      }
      return prev + emojiOrText;
    });
  };

  const getSupportedMimeType = () => {
    if (typeof MediaRecorder === 'undefined') return '';
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/ogg'
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  };

  const startRecording = async () => {
    if (isBlocked) return;

    // Direct native platform permission prompt trigger
    if (Capacitor.isNativePlatform()) {
      try {
        const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
        const checkPerm = await SpeechRecognition.checkPermissions();
        if (checkPerm.speechRecognition !== 'granted') {
          await SpeechRecognition.requestPermissions();
        }
      } catch (permError) {
        console.warn('Native speech recognition permission check failed (proceeding to web API):', permError);
      }
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast('عفواً، تسجيل الصوت غير مدعوم في متصفحك أو هذا الجهاز');
        return;
      }

      let stream: MediaStream | null = null;

      // Request microphone permission & audio stream directly
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e: any) {
        console.warn('Audio stream request failed:', e?.name || e);
        const errName = e?.name || '';
        const errMsg = e?.message?.toLowerCase() || '';

        if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError' || errMsg.includes('denied') || errMsg.includes('not allowed')) {
          showToast('يرجى السماح بإذن الميكروفون للتطبيق من إعدادات الهاتف (الأذونات -> الميكروفون) 🎙️');
        } else if (errName === 'NotFoundError' || errMsg.includes('not found')) {
          showToast('لم يتم العثور على ميكروفون متصل بهذا الجهاز');
        } else {
          showToast('تعذر تشغيل الميكروفون على هذا الجهاز');
        }
        return;
      }

      if (!stream) return;

      audioChunksRef.current = [];
      const mimeType = getSupportedMimeType();

      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      } catch (err) {
        // Fallback without mimeType options if browser/WebView rejects it
        mediaRecorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingDuration(0);

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Unexpected error starting audio recording:', err);
      showToast('تعذر بدء التسجيل الصوتي');
    }
  };

  const stopAndSendRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    setIsProcessingAudio(true);

    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

    const mediaRecorder = mediaRecorderRef.current;

    mediaRecorder.onstop = async () => {
      try {
        if (mediaRecorder.stream) {
          mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }

        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });

        if (blob.size < 200) {
          showToast('التسجيل قصير جداً');
          setIsRecording(false);
          setIsProcessingAudio(false);
          return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          await communityService.sendMessage(partnerUserId, '', undefined, base64Audio);
          setIsRecording(false);
          setIsProcessingAudio(false);
          setRecordingDuration(0);
          loadData(true);
          setTimeout(() => scrollToBottom('smooth'), 50);
          showToast('تم إرسال التسجيل الصوتي بنجاح 🎙️');
        };
      } catch (err) {
        console.error('Error processing voice message:', err);
        showToast('حدث خطأ أثناء معالجة التسجيل الصوتي');
        setIsRecording(false);
        setIsProcessingAudio(false);
      }
    };

    try {
      mediaRecorder.stop();
    } catch (e) {
      setIsRecording(false);
      setIsProcessingAudio(false);
    }
  };

  const cancelRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.onstop = null;
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
        if (mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
      } catch (e) {}
    }
    setIsRecording(false);
    setIsProcessingAudio(false);
    setRecordingDuration(0);
    audioChunksRef.current = [];
    showToast('تم إلغاء التسجيل الصوتي');
  };

  const formatRecordingTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleBlockUser = () => {
    setShowMenu(false);
    setShowBlockModal(true);
  };

  const confirmBlockUser = async () => {
    setShowBlockModal(false);
    await communityService.blockUser(partnerUserId);
    showToast('تم حظر المستخدم بنجاح');
    setTimeout(() => {
      onBack();
    }, 400);
  };

  const handleDeleteReadMessages = () => {
    setShowMenu(false);
    setShowDeleteReadModal(true);
  };

  const confirmDeleteReadMessages = async () => {
    setShowDeleteReadModal(false);
    await communityService.deleteReadMessages(partnerUserId);
    loadData();
    showToast('تم حذف الرسائل المقروءة بنجاح');
  };

  const handleClearConversation = () => {
    setShowMenu(false);
    setShowClearModal(true);
  };

  const confirmClearConversation = async () => {
    setShowClearModal(false);
    await communityService.clearConversation(partnerUserId);
    loadData();
    showToast('تم مسح سجل المحادثة بالكامل');
  };

  const handleDeleteSingleMessage = (msgId: string) => {
    communityService.deleteSingleMessage(msgId);
    setSelectedMsgId(null);
    loadData();
  };

  const isPartnerTyping = partner?.typingToUserId === currentUser.userId;

  const isPendingAsRequester = Boolean(friendship.status === 'pending' && friendship.isRequester);
  const isPendingAsReceiver = Boolean(friendship.status === 'pending' && !friendship.isRequester);
  const isRejectedAsRequester = Boolean(friendship.status === 'rejected' && friendship.isRequester);

  const mySentMessagesCount = useMemo(() => {
    return messages.filter(m => m.senderId === currentUser.userId && !communityService.isViolationReportMessage(m)).length;
  }, [messages, currentUser.userId]);

  const isIntroMessageSent = isPendingAsRequester && mySentMessagesCount >= 1;
  const canSendIntroMessage = isPendingAsRequester && mySentMessagesCount === 0;

  if (isRejectedAsRequester) {
    return (
      <div className="h-[100dvh] max-h-[100dvh] overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col items-center justify-center p-6 text-center font-sans" dir="rtl">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 border border-rose-500/20 shadow-inner">
          <Ban size={36} />
        </div>
        <h3 className="font-bold text-base mb-1.5">
          تم رفض طلب الإضافة
        </h3>
        <p className="text-xs max-w-sm mb-6 leading-relaxed text-slate-500 dark:text-slate-400">
          قام العضو برفض طلب الإضافة. لا يمكن الدخول إلى صفحة الدردشة أو إرسال رسائل طالما لم يتم قبول الإضافة.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <ArrowRight size={16} />
          <span>العودة لصفحة المجتمع</span>
        </button>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col font-sans" dir="rtl">
      {/* Header */}
      <div 
        className="shrink-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 pb-3.5 flex items-center justify-between shadow-sm"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.25rem)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowRight size={20} />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/20 text-sm overflow-hidden">
                {(partner?.userId === ADMIN_USER_ID ? SUPPORT_AVATAR_BASE64 : partner?.avatarUrl) ? (
                  <img 
                    src={partner?.userId === ADMIN_USER_ID ? SUPPORT_AVATAR_BASE64 : partner?.avatarUrl} 
                    alt={partner?.username} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      if (partner?.userId === ADMIN_USER_ID) {
                        e.currentTarget.src = SUPPORT_AVATAR_BASE64;
                      }
                    }}
                  />
                ) : (
                  <User size={20} />
                )}
              </div>
              {communityService.isUserOnline(partner) ? (
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" title="متصل الآن" />
              ) : (
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-slate-400 border-2 border-white dark:border-slate-900 opacity-60" title="غير متصل" />
              )}
            </div>

            <div>
              <h2 className="font-bold text-sm leading-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{partner?.username || 'مستخدم'}</span>
                <span className="text-xs font-normal opacity-70">{partner?.country}</span>
              </h2>
              <p className="text-[11px] font-medium">
                {isPartnerTyping ? (
                  <span className="animate-pulse text-amber-500 font-bold">جاري الكتابة الآن... ✍️</span>
                ) : communityService.isUserOnline(partner) ? (
                  <span className="text-emerald-500 font-bold">متصل الآن</span>
                ) : (
                  <span className="text-slate-400">{communityService.getUserStatusText(partner)}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Options */}
        <div className="relative" ref={menuContainerRef}>
          <button
            ref={menuButtonRef}
            onClick={() => setShowMenu(prev => !prev)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative z-50 cursor-pointer"
            title="خيارات إضافية"
          >
            <MoreVertical size={20} />
          </button>

          <AnimatePresence>
            {showMenu && (
              <>
                {/* Full screen backdrop for click/tap outside dismissal */}
                <div 
                  className="fixed inset-0 z-40 bg-transparent cursor-default" 
                  onClick={() => setShowMenu(false)} 
                  onTouchStart={() => setShowMenu(false)}
                  onPointerDown={() => setShowMenu(false)}
                />
                <motion.div
                  ref={menuDropdownRef}
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute left-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 text-xs font-bold"
                >
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleDeleteReadMessages();
                    }}
                    className="w-full px-4 py-2.5 text-right flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <Trash2 size={16} className="text-amber-500" />
                    <span>حذف الرسائل المقروءة</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleClearConversation();
                    }}
                    className="w-full px-4 py-2.5 text-right flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <Trash2 size={16} className="text-rose-500" />
                    <span>حذف المحادثة بالكامل</span>
                  </button>

                  {partnerUserId !== 'usr_admin_official' && (
                    <>
                      <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                      <button
                        onClick={() => {
                          setShowMenu(false);
                          handleBlockUser();
                        }}
                        className="w-full px-4 py-2.5 text-right flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                      >
                        <Ban size={16} />
                        <span>حظر المستخدم</span>
                      </button>
                    </>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Notice Banner if blocked */}
      {isBlocked && (
        <div className="shrink-0 bg-rose-500/10 border-b border-rose-500/20 px-4 py-2.5 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-2">
          <AlertCircle size={16} />
          <span>تم حظر التواصل مع هذا المستخدم</span>
        </div>
      )}

      {/* Notice Banner if pending as receiver (with Accept / Reject actions) */}
      {!isBlocked && isPendingAsReceiver && (
        <div className="shrink-0 bg-emerald-500/10 border-b border-emerald-500/25 px-4 py-3 text-xs font-bold shadow-xs">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <UserPlus size={16} />
              </div>
              <div className="min-w-0">
                <span className="text-slate-900 dark:text-white">أرسل لك {partner?.username} طلب إضافة ومحادثة 🌿</span>
                <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400 truncate">
                  {friendship.contact?.introMessage ? `رسالة التعريف: «${friendship.contact.introMessage}»` : 'هل ترغب في قبول الطلب لبدء التواصل؟'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={async () => {
                  await communityService.acceptFriendRequest(partnerUserId);
                  setFriendship(communityService.getFriendshipStatus(partnerUserId));
                  showToast('تم قبول طلب الإضافة بنجاح 🌿');
                }}
                className="flex-1 sm:flex-initial px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-sm active:scale-95 cursor-pointer"
              >
                <span>قبول</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  await communityService.rejectFriendRequest(partnerUserId);
                  showToast('تم رفض طلب الإضافة');
                  onBack();
                }}
                className="flex-1 sm:flex-initial px-4 py-1.5 rounded-xl text-xs font-bold border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 active:scale-95 flex items-center justify-center cursor-pointer"
              >
                <span>رفض</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notice Banner if pending as requester */}
      {!isBlocked && isPendingAsRequester && (
        <div className={`shrink-0 border-b px-4 py-2.5 text-xs font-bold flex items-center justify-between gap-2 ${
          isIntroMessageSent 
            ? 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400'
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
        }`}>
          <div className="max-w-3xl mx-auto flex items-center gap-2 w-full">
            {isIntroMessageSent ? (
              <>
                <Clock size={16} className="shrink-0 text-amber-500" />
                <span>تم إرسال رسالة التعريف بنجاح. خانة الكتابة معطلة حتى يقبل {partner?.username} طلب الإضافة ⏳</span>
              </>
            ) : (
              <>
                <Sparkles size={16} className="shrink-0 text-emerald-500" />
                <span>طلب الإضافة قيد الانتظار. مسموح لك بإرسال رسالة واحدة فقط للتعريف بنفسك حتى يتم قبول الطلب 🌿</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Notice Banner if none and not admin */}
      {!isBlocked && friendship.status === 'none' && partnerUserId !== ADMIN_USER_ID && (
        <div className="shrink-0 bg-blue-500/10 border-b border-blue-500/20 px-4 py-2.5 text-blue-700 dark:text-blue-300 text-xs font-bold">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <UserPlus size={16} className="shrink-0" />
              <span>لبدء المحادثة، يجب إرسال طلب إضافة أولاً 🌿</span>
            </div>
            <button
              type="button"
              onClick={async () => {
                await communityService.sendFriendRequest(partnerUserId);
                setFriendship(communityService.getFriendshipStatus(partnerUserId));
                showToast('تم إرسال طلب الإضافة 🌿 يمكنك الآن كتابة رسالة تعريفية واحدة.');
              }}
              className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold active:scale-95 cursor-pointer"
            >
              إرسال طلب إضافة
            </button>
          </div>
        </div>
      )}

      {/* Messages Feed - Freely Scrollable */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 p-4 space-y-3 overflow-y-auto overscroll-y-contain max-w-3xl w-full mx-auto"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {messages.length === 0 ? (
          <div className="text-center py-16 opacity-60">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3">
              <Sparkles size={32} />
            </div>
            <p className="text-sm font-bold">بداية المحادثة المباركة ✨</p>
            <p className="text-xs text-slate-500 mt-1">
              أرسل رسالة أو آية قرآنية طيبة لتبدأ التراسل مع {partner?.username}
            </p>
          </div>
        ) : (
          messages
            .filter((msg) => !communityService.isViolationReportMessage(msg))
            .map((msg) => {
            const isMe = msg.senderId === currentUser.userId;
            const isSelected = selectedMsgId === msg.messageId;
            const timeStr = new Date(msg.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
            const isPureAudio = Boolean(msg.audioUrl && !msg.text && !msg.verseData);

            return (
              <div
                key={msg.messageId}
                className={`flex flex-col ${isMe ? 'items-start' : 'items-end'} relative group`}
              >
                {isPureAudio ? (
                  <div onClick={() => setSelectedMsgId(isSelected ? null : msg.messageId)}>
                    <ChatMessageAudioPlayer
                      audioUrl={msg.audioUrl!}
                      isMe={isMe}
                      timeStr={timeStr}
                      isRead={msg.isRead}
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => setSelectedMsgId(isSelected ? null : msg.messageId)}
                    className={`max-w-[90%] sm:max-w-[80%] p-3.5 rounded-2xl shadow-sm text-sm font-medium relative cursor-pointer transition-all ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/60 rounded-tl-none'
                    }`}
                  >
                    {/* Custom Quran Attachment Card with identical preview */}
                    {msg.verseData && (
                      <ChatQuranCard
                        verseData={msg.verseData}
                        playingAudioUrl={playingAudioUrl}
                        onToggleAudio={handleToggleAudio}
                      />
                    )}

                    {/* Voice Note Audio Player */}
                    {msg.audioUrl && (
                      <ChatMessageAudioPlayer
                        audioUrl={msg.audioUrl}
                        isMe={isMe}
                        timeStr={timeStr}
                        isRead={msg.isRead}
                      />
                    )}

                    {msg.text && <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>}

                    {!msg.audioUrl && (
                      <div className={`flex items-center gap-1.5 justify-end mt-1 text-[10px] ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>
                        <span>{timeStr}</span>
                        {isMe && (
                          msg.isRead ? (
                            <CheckCheck size={14} className="text-sky-300" />
                          ) : (
                            <Check size={14} className="opacity-70" />
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Individual Message Delete Action Popover */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="mt-1 flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-lg text-xs z-20"
                    >
                      <button
                        onClick={() => handleDeleteSingleMessage(msg.messageId)}
                        className="flex items-center gap-1 hover:text-rose-400 text-rose-300 font-bold"
                      >
                        <Trash2 size={13} />
                        <span>حذف الرسالة</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer Bar */}
      <div 
        className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-3 pt-3 pb-8 sm:pb-4 sm:px-4 z-30 shadow-md"
        style={{ paddingBottom: 'max(2.25rem, calc(env(safe-area-inset-bottom, 0px) + 2rem))' }}
      >
        <div className="max-w-3xl mx-auto relative">
          <div ref={emojiPickerContainerRef}>
            <AnimatePresence>
              {showEmojiPicker && (
                <>
                  {/* Backdrop to close Emoji picker on tap outside */}
                  <div 
                    className="fixed inset-0 z-40 bg-transparent cursor-default" 
                    onClick={() => setShowEmojiPicker(false)} 
                  />
                  <div className="absolute bottom-full mb-3 right-0 z-50">
                    <EmojiPicker
                      onSelectEmoji={handleEmojiSelect}
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  </div>
                </>
              )}
            </AnimatePresence>
          </div>

          {isRecording ? (
            /* Active Voice Recording Panel */
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 p-2 px-3 rounded-2xl shadow-inner animate-fadeIn">
              <button
                type="button"
                onClick={cancelRecording}
                className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all active:scale-95 shrink-0"
                title="إلغاء التسجيل"
              >
                <Trash2 size={20} />
              </button>

              <div className="flex-1 flex items-center justify-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                </div>
                <span className="text-sm font-bold text-emerald-900 dark:text-emerald-200 font-mono">
                  {formatRecordingTime(recordingDuration)}
                </span>
                {/* Waveform visual animation */}
                <div className="hidden sm:flex items-center gap-1 opacity-75">
                  <span className="w-1 h-3 bg-emerald-500 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1 h-5 bg-emerald-600 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:300ms]" />
                  <span className="w-1 h-4 bg-emerald-600 rounded-full animate-bounce [animation-delay:450ms]" />
                </div>
              </div>

              <button
                type="button"
                onClick={stopAndSendRecording}
                disabled={isProcessingAudio}
                className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 font-bold text-xs shrink-0 disabled:opacity-50"
              >
                {isProcessingAudio ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Send size={16} className="rotate-180" />
                    <span>إرسال</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Normal Input Bar with Mic button */
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowVerseModal(true)}
                disabled={isBlocked || isIntroMessageSent || (friendship.status === 'none' && partnerUserId !== ADMIN_USER_ID)}
                className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl transition-colors flex items-center justify-center shrink-0 disabled:opacity-40"
                title="مشاركة آية قرآنية"
              >
                <BookOpen size={18} />
              </button>

              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={isBlocked || isIntroMessageSent || (friendship.status === 'none' && partnerUserId !== ADMIN_USER_ID)}
                className="p-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 disabled:opacity-40"
              >
                <Smile size={20} />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                disabled={isBlocked || isIntroMessageSent || (friendship.status === 'none' && partnerUserId !== ADMIN_USER_ID)}
                placeholder={
                  isBlocked
                    ? 'التواصل معطل بسبب الحظر'
                    : isIntroMessageSent
                      ? 'بانتظار قبول طلب الإضافة لمواصلة المحادثة...'
                      : canSendIntroMessage
                        ? 'اكتب رسالة للتعريف بنفسك (رسالة واحدة فقط)...'
                        : (friendship.status === 'none' && partnerUserId !== ADMIN_USER_ID)
                          ? 'يجب إرسال طلب إضافة أولاً...'
                          : 'اكتب رسالة مباركة...'
                }
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white disabled:opacity-50"
              />

              {/* Mic recording button when input is empty, or Send button when text exists */}
              {!inputText.trim() ? (
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={isBlocked || isIntroMessageSent || (friendship.status === 'none' && partnerUserId !== ADMIN_USER_ID)}
                  className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center shrink-0 disabled:opacity-40"
                  title="تسجيل صوتي"
                >
                  <Mic size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputText.trim() || isBlocked || isIntroMessageSent || (friendship.status === 'none' && partnerUserId !== ADMIN_USER_ID)}
                  className="p-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center shrink-0"
                >
                  <Send size={18} className="rotate-180" />
                </button>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Quran Verse Picker Modal */}
      <QuranVerseModal
        isOpen={showVerseModal}
        onClose={() => setShowVerseModal(false)}
        onSendVerse={handleSendVerse}
      />

      {/* Block User Confirmation Modal */}
      <AnimatePresence>
        {showBlockModal && partner && (
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
                ({partner.username}) {partner.country ? `• ${partner.country}` : ''}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                عند الحظر، لن يظهر اسم هذا المستخدم لك ولن تتمكنا من تبادل أي رسائل، وسيتم تحويلك إلى قائمة المجتمع.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
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

      {/* Delete Read Messages Modal */}
      <AnimatePresence>
        {showDeleteReadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-center"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                <Trash2 size={24} />
              </div>

              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2">
                حذف الرسائل المقروءة
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                هل أنت متأكد من رغبتك في حذف كافة الرسائل المقروءة في هذه المحادثة؟
              </p>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDeleteReadModal(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteReadMessages}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20"
                >
                  تأكيد الحذف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clear Entire Conversation Modal */}
      <AnimatePresence>
        {showClearModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-center"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-3">
                <Trash2 size={24} />
              </div>

              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2">
                مسح المحادثة بالكامل
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                هل أنت متأكد من حذف كافة الرسائل وسجل المحادثة نهائياً؟
              </p>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowClearModal(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={confirmClearConversation}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20"
                >
                  مسح السجل
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating In-App Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 px-5 py-3 rounded-full text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-2 pointer-events-none"
          >
            <CheckCircle2 size={16} className="text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DirectChatPage;
