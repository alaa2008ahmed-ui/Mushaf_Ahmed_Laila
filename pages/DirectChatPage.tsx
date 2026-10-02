import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, Send, Smile, MoreVertical, Trash2, ShieldOff, Check, 
  CheckCheck, Ban, User, Sparkles, AlertCircle, BookOpen, Play, Pause, Volume2,
  Download, Share2, Copy, FileText, Image as ImageIcon, CheckCircle2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { safeHtml2Canvas } from '../utils/canvasHelper';
import { Share as CapacitorShare } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { communityService, CommunityUser, ChatMessage, QuranVerseAttachment } from '../services/communityService';
import EmojiPicker from '../components/Community/EmojiPicker';
import QuranVerseModal from '../components/Community/QuranVerseModal';

interface DirectChatPageProps {
  partnerUserId: string;
  onBack: () => void;
  onNavigate: (pageId: string, params?: any) => void;
}

// Frame overlay component for Chat Verse Cards
const FrameOverlay: React.FC<{ frameType?: string; frameColor?: string }> = ({ frameType, frameColor = '#FFD700' }) => {
  if (!frameType || frameType === 'none') return null;

  if (frameType === 'double') {
    return (
      <div 
        className="absolute inset-2 border-2 pointer-events-none rounded-xl z-10"
        style={{ borderStyle: 'double', borderColor: frameColor, borderWidth: '3px' }}
      />
    );
  }

  if (frameType === 'mihrab') {
    return (
      <div 
        className="absolute inset-2 border-2 pointer-events-none rounded-t-full rounded-b-xl z-10"
        style={{ borderColor: frameColor }}
      />
    );
  }

  if (frameType === 'elegant') {
    return (
      <div className="absolute inset-2 border pointer-events-none rounded-xl z-10" style={{ borderColor: frameColor }}>
        <div className="absolute inset-1 border opacity-50 rounded-lg" style={{ borderColor: frameColor }} />
      </div>
    );
  }

  return null;
};

// Render exact matching Quran Verse Attachment inside chat message
const ChatQuranCard: React.FC<{
  verseData: QuranVerseAttachment;
  playingAudioUrl: string | null;
  onToggleAudio: (url?: string) => void;
}> = ({ verseData, playingAudioUrl, onToggleAudio }) => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const toArabicDigits = (str: number | string) => {
    return String(str).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (verseData.shareType === 'audio' && verseData.audioUrl) {
      const a = document.createElement('a');
      a.href = verseData.audioUrl;
      a.download = `sura_${verseData.surahName}_ayah_${verseData.ayahNumber}.mp3`;
      a.target = '_blank';
      a.click();
      showToast('جاري تحميل التلاوة الصوتية... 🎵');
      return;
    }

    if (!cardRef.current || isProcessing) return;
    setIsProcessing(true);

    try {
      const canvas = await safeHtml2Canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false
      });

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `quran_card_${verseData.surahNumber}_${verseData.ayahNumber}.png`;
      a.click();
      showToast('تم تحميل بطاقة الآية كصورة بنجاح 🖼️');
    } catch (err) {
      console.error('Download card error:', err);
      // Fallback text download
      const textContent = `سورة ${verseData.surahName} (الآية ${verseData.ayahNumber})\n\n﴿ ${verseData.text} ﴾\n\nمصحف احمد وليلي`;
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quran_verse_${verseData.surahNumber}_${verseData.ayahNumber}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('تم تحميل الآية كملف نصي 📄');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShareExternal = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isProcessing) return;
    setIsProcessing(true);

    const verseRangeLabel = verseData.fromAyah && verseData.toAyah && verseData.fromAyah !== verseData.toAyah
      ? `سورة ${verseData.surahName} (الآيات ${toArabicDigits(verseData.fromAyah)} إلى ${toArabicDigits(verseData.toAyah)})`
      : `سورة ${verseData.surahName} (آية ${toArabicDigits(verseData.ayahNumber)})`;

    const shareText = `﴿ ${verseData.text} ﴾\n- ${verseRangeLabel}\nمن تطبيق مصحف احمد وليلي`;

    try {
      if (verseData.shareType === 'audio' && verseData.audioUrl) {
        if (navigator.share) {
          await navigator.share({
            title: `سورة ${verseData.surahName}`,
            text: shareText,
            url: verseData.audioUrl
          });
        } else {
          navigator.clipboard.writeText(shareText);
          showToast('تم نسخ التلاوة للمشاركة 🎵');
        }
      } else if (cardRef.current) {
        // Capture image using safeHtml2Canvas and share via native app picker
        const canvas = await safeHtml2Canvas(cardRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: null,
          logging: false
        });

        const dataUrl = canvas.toDataURL('image/png');
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `quran_verse_${verseData.surahNumber}.png`, { type: 'image/png' });

        if (Capacitor.isNativePlatform()) {
          await CapacitorShare.share({
            title: `سورة ${verseData.surahName}`,
            text: shareText,
            dialogTitle: 'مشاركة بطاقة الآية عبر'
          });
        } else if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `سورة ${verseData.surahName}`,
            text: shareText,
            files: [file]
          });
        } else if (navigator.share) {
          await navigator.share({
            title: `سورة ${verseData.surahName}`,
            text: shareText
          });
        } else {
          navigator.clipboard.writeText(shareText);
          showToast('تم نسخ نص الآية للمشاركة للتطبيقات 📋');
        }
      }
    } catch (err) {
      console.log('External share cancelled or failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const shareType = verseData.shareType || 'image';

  return (
    <div className="mb-2 relative w-full overflow-hidden rounded-2xl shadow-md transition-all">
      {/* Toast popup */}
      {toastMsg && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900/90 text-emerald-400 text-[11px] font-bold px-3 py-1 rounded-full shadow-lg border border-emerald-500/30 z-30 flex items-center gap-1">
          <CheckCircle2 size={13} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Captured Card View */}
      <div ref={cardRef}>
        {/* Render based on selected shareType */}
        {shareType === 'text' ? (
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center text-slate-900 dark:text-white">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">
              سورة {verseData.surahName} ({verseData.fromAyah && verseData.toAyah && verseData.fromAyah !== verseData.toAyah ? `الآيات ${toArabicDigits(verseData.fromAyah)} إلى ${toArabicDigits(verseData.toAyah)}` : `الآية ${toArabicDigits(verseData.ayahNumber)}`})
            </div>
            <p className={`text-base font-bold leading-loose ${verseData.fontClass || 'font-serif'}`} style={{ color: verseData.textColor }}>
              ﴿ {verseData.text} ﴾
            </p>
            {verseData.customNote && (
              <p className="text-xs italic text-amber-600 dark:text-amber-400 mt-2 border-t pt-1.5 border-slate-200 dark:border-slate-700">
                "{verseData.customNote}"
              </p>
            )}
          </div>
        ) : shareType === 'audio' ? (
          <div className="p-5 rounded-2xl bg-emerald-950 text-white border border-emerald-500/40 text-center flex flex-col items-center justify-center gap-2">
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-bold text-emerald-400">
                سورة {verseData.surahName} (آية {toArabicDigits(verseData.ayahNumber)})
              </span>
              {verseData.audioUrl && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleAudio(verseData.audioUrl);
                  }}
                  className="p-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition-transform active:scale-95"
                >
                  {playingAudioUrl === verseData.audioUrl ? <Pause size={16} /> : <Play size={16} />}
                </button>
              )}
            </div>
            <p className="font-serif text-sm text-slate-200 line-clamp-2">
              ﴿ {verseData.text} ﴾
            </p>
            <span className="text-[10px] text-amber-300 font-bold">بصوت الشيخ مشاري العفاسي 🎙️</span>
          </div>
        ) : shareType === 'page' ? (
          <div className="p-5 rounded-2xl bg-amber-50 dark:bg-slate-900 border-2 border-amber-500/40 text-center shadow-md flex flex-col items-center justify-between gap-2">
            <div className="border-b border-amber-500/20 pb-1.5 w-full text-center">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-400">
                صفحة مصحف - سورة {verseData.surahName} ({verseData.fromAyah && verseData.toAyah && verseData.fromAyah !== verseData.toAyah ? `الآيات ${toArabicDigits(verseData.fromAyah)} إلى ${toArabicDigits(verseData.toAyah)}` : `آية ${toArabicDigits(verseData.ayahNumber)}`})
              </span>
            </div>
            <p className={`font-serif text-base leading-loose font-bold text-slate-900 dark:text-amber-100 ${verseData.fontClass || ''}`} style={{ color: verseData.textColor }}>
              ﴿ {verseData.text} ﴾
            </p>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold pt-1.5 border-t border-amber-500/20 w-full">
              مصحف احمد وليلي • صفحة قراءة
            </div>
          </div>
        ) : (
          /* Image Card mode matching preview */
          <div
            className="relative min-h-[180px] p-5 rounded-2xl shadow-lg flex flex-col items-center justify-between text-center overflow-hidden border border-slate-200 dark:border-slate-800"
            style={{
              background: verseData.bgValue || '#ffffff',
              color: verseData.textColor || '#000000'
            }}
          >
            <FrameOverlay frameType={verseData.frameType} frameColor={verseData.frameColor} />

            <div className="text-center font-serif text-xs font-bold opacity-80 mb-1" style={{ color: verseData.textColor }}>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </div>

            <div
              className={`text-center font-bold leading-loose my-2 px-1 ${verseData.fontClass || 'font-serif'}`}
              style={{
                fontSize: verseData.fontSize ? `${verseData.fontSize}px` : '18px',
                color: verseData.textColor || '#000000'
              }}
            >
              ﴿ {verseData.text} ﴾
            </div>

            {verseData.customNote && (
              <div className="text-xs italic opacity-90 my-1 font-medium" style={{ color: verseData.textColor }}>
                "{verseData.customNote}"
              </div>
            )}

            <div className="text-[10px] font-bold tracking-wide opacity-70 mt-1 font-serif" style={{ color: verseData.textColor }}>
              سورة {verseData.surahName} ({verseData.fromAyah && verseData.toAyah && verseData.fromAyah !== verseData.toAyah ? `الآيات ${toArabicDigits(verseData.fromAyah)}-${toArabicDigits(verseData.toAyah)}` : `آية ${toArabicDigits(verseData.ayahNumber)}`}) • مصحف احمد وليلي
            </div>
          </div>
        )}
      </div>

      {/* Action Toolbar: تحميل & مشاركة */}
      <div className="mt-1.5 pt-1.5 border-t border-black/10 dark:border-white/10 flex items-center justify-between px-2 text-[11px] font-bold">
        <button
          onClick={handleDownload}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors disabled:opacity-50"
          title="تحميل"
        >
          <Download size={13} />
          <span>تحميل</span>
        </button>

        <button
          onClick={handleShareExternal}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors disabled:opacity-50"
          title="مشاركة للتطبيقات الأخرى"
        >
          <Share2 size={13} />
          <span>مشاركة</span>
        </button>
      </div>
    </div>
  );
};

const DirectChatPage: React.FC<DirectChatPageProps> = ({ partnerUserId, onBack, onNavigate }) => {
  const currentUser = communityService.getCurrentUser();
  const [partner, setPartner] = useState<CommunityUser | null>(null);
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = () => {
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

    const chatMsgs = communityService.getMessagesForChat(partnerUserId);
    setMessages(chatMsgs);
    communityService.markMessagesAsRead(partnerUserId);
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('community_messages_updated', handleUpdate);
    window.addEventListener('community_block_updated', handleUpdate);
    window.addEventListener('community_user_updated', handleUpdate);

    return () => {
      window.removeEventListener('community_messages_updated', handleUpdate);
      window.removeEventListener('community_block_updated', handleUpdate);
      window.removeEventListener('community_user_updated', handleUpdate);
    };
  }, [partnerUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isBlocked) return;

    communityService.sendMessage(partnerUserId, inputText);
    setInputText('');
    setShowEmojiPicker(false);
    communityService.setTypingStatus(partnerUserId, false);
    loadData();
  };

  const handleSendVerse = (verse: QuranVerseAttachment) => {
    if (isBlocked) return;
    communityService.sendMessage(partnerUserId, '', verse);
    setShowVerseModal(false);
    loadData();
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

  const handleEmojiSelect = (emoji: string) => {
    setInputText(prev => prev + emoji);
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col font-sans" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm">
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
                {partner?.avatarUrl ? (
                  <img src={partner.avatarUrl} alt={partner.username} className="w-full h-full object-cover" />
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
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreVertical size={20} />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute left-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 text-xs font-bold"
              >
                <button
                  onClick={handleDeleteReadMessages}
                  className="w-full px-4 py-2.5 text-right flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <Trash2 size={16} className="text-amber-500" />
                  <span>حذف الرسائل المقروءة</span>
                </button>

                <button
                  onClick={handleClearConversation}
                  className="w-full px-4 py-2.5 text-right flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <Trash2 size={16} className="text-rose-500" />
                  <span>حذف المحادثة بالكامل</span>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                <button
                  onClick={handleBlockUser}
                  className="w-full px-4 py-2.5 text-right flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                >
                  <Ban size={16} />
                  <span>حظر المستخدم</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Notice Banner if blocked */}
      {isBlocked && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 px-4 py-2.5 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-2">
          <AlertCircle size={16} />
          <span>تم حظر التواصل مع هذا المستخدم</span>
        </div>
      )}

      {/* Messages Feed */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto max-w-3xl w-full mx-auto">
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
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.userId;
            const isSelected = selectedMsgId === msg.messageId;
            const timeStr = new Date(msg.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={msg.messageId}
                className={`flex flex-col ${isMe ? 'items-start' : 'items-end'} relative group`}
              >
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

                  {msg.text && <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>}

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
                </div>

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
      <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 z-30">
        <div className="max-w-3xl mx-auto relative">
          <AnimatePresence>
            {showEmojiPicker && (
              <div className="absolute bottom-16 right-0 z-50">
                <EmojiPicker
                  onSelectEmoji={handleEmojiSelect}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSend} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowVerseModal(true)}
              className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl transition-colors flex items-center gap-1 font-bold text-xs"
              title="مشاركة آية قرآنية"
            >
              <BookOpen size={18} />
              <span className="hidden sm:inline">آية</span>
            </button>

            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Smile size={20} />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              disabled={isBlocked}
              placeholder={isBlocked ? 'التواصل معطل بسبب الحظر' : 'اكتب رسالة مباركة...'}
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isBlocked}
              className="p-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center"
            >
              <Send size={18} className="rotate-180" />
            </button>
          </form>
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
