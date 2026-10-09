import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, Send, Smile, MoreVertical, Trash2, 
  User, Sparkles, BookOpen, Play, Pause, CheckCircle2,
  Mic, Volume2, Users, Info, Shield, LogOut, Check, X,
  UserPlus, UserMinus, Search, AlertTriangle, EyeOff, Edit3,
  MessageCircle, UserCheck, Clock, MapPin, Hash, Paperclip, Loader2, Video, FileText
} from 'lucide-react';
import { 
  communityService, 
  GroupChat, 
  GroupMessage, 
  QuranVerseAttachment, 
  ChatAttachment,
  CommunityUser,
  ADMIN_USER_ID 
} from '../services/communityService';
import { ChatQuranCard, ChatMessageAudioPlayer } from './DirectChatPage';
import EmojiPicker from '../components/Community/EmojiPicker';
import QuranVerseModal from '../components/Community/QuranVerseModal';
import EditGroupModal from '../components/Community/EditGroupModal';
import { ChatAttachmentView, formatFileSize } from '../components/Community/ChatAttachmentView';
import { MediaAttachmentPicker } from '../components/Community/MediaAttachmentPicker';
import { processFileForAttachment } from '../components/Community/mediaPickerUtils';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { useTheme } from '../context/ThemeContext';

interface GroupChatPageProps {
  groupId: string;
  onBack: () => void;
  onNavigate: (pageId: string, params?: any) => void;
}

const GroupChatPage: React.FC<GroupChatPageProps> = ({ groupId, onBack, onNavigate }) => {
  const { theme } = useTheme();
  const isBlackTheme = theme.bgColor === '#000000';
  const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.palette?.[0] || '#10b981');
  const primaryTextColor = isBlackTheme ? '#000000' : (theme.btnText || '#FFFFFF');
  const cardBg = isBlackTheme ? '#111111' : (theme.cardBg || (theme.isDark ? '#1e293b' : '#ffffff'));
  const cardBorder = isBlackTheme ? '#333333' : (theme.cardBorder || (theme.isDark ? '#334155' : '#e2e8f0'));
  const secondaryBg = isBlackTheme ? '#1a1a1a' : (theme.isDark ? '#0f172a' : '#f8fafc');
  const textColor = theme.textColor || (theme.isDark ? '#ffffff' : '#000000');
  const textMuted = isBlackTheme ? '#9ca3af' : (theme.isDark ? '#94a3b8' : '#64748b');

  const currentUser = communityService.getCurrentUser();
  const [group, setGroup] = useState<GroupChat | null>(() => communityService.getGroupById(groupId) || null);
  const [messages, setMessages] = useState<GroupMessage[]>(() => communityService.getGroupMessages(groupId));
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showVerseModal, setShowVerseModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteGroupConfirm, setShowDeleteGroupConfirm] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ userId: string; username: string } | null>(null);
  const [addMemberSearch, setAddMemberSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);

  // Media Attachment state (image, video, file)
  const [showAttachmentPicker, setShowAttachmentPicker] = useState(false);
  const [stagedAttachment, setStagedAttachment] = useState<ChatAttachment | null>(null);
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);

  // Selected Member Profile Modal State
  const [selectedMember, setSelectedMember] = useState<CommunityUser | null>(null);
  const [selectedMemberFriendship, setSelectedMemberFriendship] = useState<{
    status: 'none' | 'pending' | 'accepted' | 'rejected';
    isRequester: boolean;
    contact?: any;
  }>({ status: 'none', isRequester: false });

  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingDurationRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuDropdownRef = useRef<HTMLDivElement>(null);
  const hasExitedRef = useRef(false);

  // Global click & touch outside listeners to automatically dismiss the 3-dots menu when clicking anywhere on screen
  useEffect(() => {
    if (!showMenu) return;

    const handleGlobalClickOutside = (event: MouseEvent | TouchEvent | PointerEvent) => {
      const target = event.target as Node;
      // If clicking inside the dropdown menu itself, let the item's onClick handle it
      if (menuDropdownRef.current && menuDropdownRef.current.contains(target)) {
        return;
      }
      // If clicking the 3-dots button itself, toggle behavior is handled by button's onClick
      if (menuButtonRef.current && menuButtonRef.current.contains(target)) {
        return;
      }
      // Any other click or touch anywhere on the screen immediately dismisses the menu
      setShowMenu(false);
    };

    document.addEventListener('pointerdown', handleGlobalClickOutside, true);
    document.addEventListener('touchstart', handleGlobalClickOutside, true);
    document.addEventListener('mousedown', handleGlobalClickOutside, true);

    return () => {
      document.removeEventListener('pointerdown', handleGlobalClickOutside, true);
      document.removeEventListener('touchstart', handleGlobalClickOutside, true);
      document.removeEventListener('mousedown', handleGlobalClickOutside, true);
    };
  }, [showMenu]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenMemberProfile = (userId: string, fallbackName?: string, fallbackAvatar?: string, fallbackCountry?: string) => {
    let user = communityService.getUserById(userId);
    if (!user) {
      user = {
        userId,
        username: fallbackName || 'قارئ',
        avatarUrl: fallbackAvatar,
        country: fallbackCountry || 'غير محدد',
        isOnline: false,
        createdAt: new Date().toISOString()
      };
    }
    setSelectedMember(user);
    const fs = communityService.getFriendshipStatus(userId);
    setSelectedMemberFriendship(fs);
  };

  const handleSendFriendRequest = async (targetUserId: string) => {
    try {
      await communityService.sendFriendRequest(targetUserId);
      const updatedStatus = communityService.getFriendshipStatus(targetUserId);
      setSelectedMemberFriendship(updatedStatus);
      showToast('تم إرسال طلب إضافة بنجاح 🌿');
    } catch (err: any) {
      showToast(err?.message || 'تعذر إرسال طلب الإضافة');
    }
  };

  const handleAcceptFriendRequest = async (targetUserId: string) => {
    try {
      await communityService.acceptFriendRequest(targetUserId);
      const updatedStatus = communityService.getFriendshipStatus(targetUserId);
      setSelectedMemberFriendship(updatedStatus);
      showToast('تم قبول طلب الإضافة بنجاح 🌿');
    } catch (err: any) {
      showToast(err?.message || 'تعذر قبول طلب الإضافة');
    }
  };

  const handleStartDirectChat = (targetUserId: string) => {
    setSelectedMember(null);
    onNavigate('direct-chat', { partnerUserId: targetUserId, returnTab: 'community' });
  };

  // Back button interceptor to close Member Profile modal
  useEffect(() => {
    if (!selectedMember) return;
    const cleanup = registerBackInterceptor(() => {
      setSelectedMember(null);
      return true;
    });
    return cleanup;
  }, [selectedMember]);

  const handleBack = () => {
    if (hasExitedRef.current) return;
    hasExitedRef.current = true;
    communityService.setActiveTab('community');
    if (onNavigate) {
      onNavigate('community', { initialTab: 'community', returnTab: 'community' });
    } else {
      onBack();
    }
  };

  // Guarantee that community tab is set to community whenever group chat is open
  useEffect(() => {
    communityService.setActiveTab('community');
  }, []);

  const loadGroupData = () => {
    if (hasExitedRef.current) return;
    const g = communityService.getGroupById(groupId);
    if (!g) {
      hasExitedRef.current = true;
      showToast('تم حذف هذه المجموعة أو لم تعد متوفرة');
      communityService.setActiveTab('community');
      if (onNavigate) {
        onNavigate('community', { initialTab: 'community', returnTab: 'community' });
      } else {
        onBack();
      }
      return;
    }
    setGroup(g);
    const cur = communityService.getCurrentUser();
    const isStarterDefaultGroup = g.groupId === 'group_default_quran_readers' || g.groupId === 'group_default_tadabbur';
    if (isStarterDefaultGroup && cur?.userId && !g.members?.includes(cur.userId)) {
      communityService.joinGroup(groupId);
    }
    const msgs = communityService.getGroupMessages(groupId);
    setMessages(msgs);
  };

  // Load group data & listen for updates
  useEffect(() => {
    communityService.fetchLatestGroups().then(() => loadGroupData());
    communityService.fetchLatestGroupMessages(groupId).then(() => loadGroupData());

    const handleUpdate = () => {
      loadGroupData();
    };

    window.addEventListener('community_groups_updated', handleUpdate);
    window.addEventListener('community_group_messages_updated', handleUpdate);

    return () => {
      window.removeEventListener('community_groups_updated', handleUpdate);
      window.removeEventListener('community_group_messages_updated', handleUpdate);
    };
  }, [groupId]);

  // Clean up recording timers
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

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Back interceptor
  useEffect(() => {
    const interceptor = () => {
      if (showAttachmentPicker) {
        setShowAttachmentPicker(false);
        return true;
      }
      if (showEmojiPicker) {
        setShowEmojiPicker(false);
        return true;
      }
      if (showVerseModal) {
        setShowVerseModal(false);
        return true;
      }
      if (showAddMembersModal) {
        setShowAddMembersModal(false);
        return true;
      }
      if (memberToRemove) {
        setMemberToRemove(null);
        return true;
      }
      if (showDeleteGroupConfirm) {
        setShowDeleteGroupConfirm(false);
        return true;
      }
      if (showClearConfirm) {
        setShowClearConfirm(false);
        return true;
      }
      if (showInfoModal) {
        setShowInfoModal(false);
        return true;
      }
      if (showMenu) {
        setShowMenu(false);
        return true;
      }
      handleBack();
      return true;
    };
    return registerBackInterceptor(interceptor);
  }, [showEmojiPicker, showVerseModal, showAddMembersModal, memberToRemove, showDeleteGroupConfirm, showClearConfirm, showInfoModal, showMenu, onBack]);

  const handleFileSelected = async (file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      showToast('حجم الملف كبير جداً (أكثر من 15 ميجابايت).');
      return;
    }
    if (file.size > 800 * 1024 && !file.type.startsWith('image/')) {
      showToast('تنبيه: حجم الفيديو/الملف أكبر من 800 ك.ب. يُفضل اختيار ملف أصغر لسرعة الإرسال.');
    }
    setIsProcessingMedia(true);
    try {
      const att = await processFileForAttachment(file);
      setStagedAttachment(att);
    } catch (err) {
      showToast('تعذر تجهيز الملف للإرسال');
    } finally {
      setIsProcessingMedia(false);
    }
  };

  // Handle Send Text & Media Message
  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text && !stagedAttachment) return;

    const textToSend = text;
    const attachmentToSend = stagedAttachment;

    setInputText('');
    setStagedAttachment(null);
    setShowEmojiPicker(false);

    try {
      await communityService.sendGroupMessage(
        groupId,
        textToSend,
        undefined,
        undefined,
        undefined,
        attachmentToSend || undefined
      );
      loadGroupData();
    } catch (err: any) {
      showToast(err?.message || 'تعذر إرسال الرسالة');
    }
  };

  // Handle Send Quran Verse
  const handleSendVerse = async (verseData: QuranVerseAttachment) => {
    setShowVerseModal(false);
    try {
      await communityService.sendGroupMessage(
        groupId,
        `﴿ ${verseData.text} ﴾`,
        verseData
      );
      loadGroupData();
      showToast('تمت مشاركة الآية الكريمة في المجموعة');
    } catch (err: any) {
      showToast(err?.message || 'تعذر إرسال الآية');
    }
  };

  // Handle Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const durationSecs = recordingDurationRef.current;
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
            await communityService.sendGroupMessage(
              groupId,
              'تسجيل صوتي 🎙️',
              undefined,
              base64Audio,
              durationSecs
            );
            loadGroupData();
            showToast('تم إرسال التسجيل الصوتي بنجاح');
          } catch (err: any) {
            showToast(err?.message || 'تعذر إرسال التسجيل الصوتي');
          }
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingDuration(0);
      recordingDurationRef.current = 0;

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const next = prev + 1;
          recordingDurationRef.current = next;
          return next;
        });
      }, 1000);
    } catch (err) {
      console.error('Audio recording permission error:', err);
      showToast('تعذر الوصول إلى الميكروفون، يرجى منح الإذن');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      }
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setRecordingDuration(0);
      showToast('تم إلغاء التسجيل الصوتي');
    }
  };

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Toggle audio playback
  const handleToggleAudio = (url?: string) => {
    if (!url) return;
    if (playingAudioUrl === url) {
      setPlayingAudioUrl(null);
    } else {
      setPlayingAudioUrl(url);
    }
  };

  // Delete single message
  const handleDeleteMessage = async (msgId: string) => {
    await communityService.deleteGroupMessage(msgId);
    loadGroupData();
    showToast('تم حذف الرسالة');
  };

  // Clear group messages
  const handleClearMessages = async () => {
    await communityService.clearGroupMessages(groupId);
    setShowClearConfirm(false);
    setShowMenu(false);
    loadGroupData();
    showToast('تم مسح محادثات المجموعة');
  };

  // Leave group
  const handleLeaveGroup = async () => {
    if (hasExitedRef.current) return;
    hasExitedRef.current = true;
    await communityService.leaveGroup(groupId);
    showToast('تمت مغادرة المجموعة');
    communityService.setActiveTab('community');
    if (onNavigate) {
      onNavigate('community', { initialTab: 'community', returnTab: 'community' });
    } else {
      onBack();
    }
  };

  // Delete entire group
  const handleDeleteGroup = async () => {
    if (hasExitedRef.current) return;
    hasExitedRef.current = true;
    try {
      setShowDeleteGroupConfirm(false);
      setShowInfoModal(false);
      setShowMenu(false);
      communityService.setActiveTab('community');
      await communityService.deleteGroup(groupId);
      showToast('تم حذف المحادثة الجماعية بنجاح');
      if (onNavigate) {
        onNavigate('community', { initialTab: 'community', returnTab: 'community' });
      } else {
        onBack();
      }
    } catch (err: any) {
      hasExitedRef.current = false;
      showToast(err?.message || 'تعذر حذف المحادثة الجماعية');
    }
  };

  // Add member to group
  const handleAddMember = async (targetUser: CommunityUser) => {
    if (!isCreatorOrAdmin) {
      showToast('عذراً، إضافة الأعضاء مقتصرة على منشئ المجموعة فقط');
      return;
    }
    try {
      await communityService.addMemberToGroup(groupId, targetUser.userId);
      showToast(`تم إرسال دعوة انضمام ورسالة إلى ${targetUser.username} بنجاح 🌿`);
      loadGroupData();
    } catch (err: any) {
      showToast(err?.message || 'تعذر إرسال الدعوة');
    }
  };

  // Remove member from group
  const handleConfirmRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await communityService.removeMemberFromGroup(groupId, memberToRemove.userId);
      showToast(`تمت إزالة ${memberToRemove.username} من المجموعة`);
      setMemberToRemove(null);
      loadGroupData();
    } catch (err: any) {
      showToast(err?.message || 'تعذر إزالة العضو');
    }
  };

  const cleanGroupName = (name?: string): string => {
    if (!name) return '';
    return name.replace(/[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim() || name;
  };

  const groupDisplayName = cleanGroupName(group?.name || 'محادثة جماعية');
  const groupMembersCount = group?.members?.length || 1;
  const isSystemDefaultGroup = group?.groupId === 'group_default_quran_readers' || group?.groupId === 'group_default_tadabbur';
  const isCreator = Boolean(group && communityService.isGroupCreator(group, currentUser));
  const isCreatorOrAdmin = isCreator || currentUser.userId === ADMIN_USER_ID;
  const canDeleteGroup = (isCreator && !isSystemDefaultGroup) || currentUser.userId === ADMIN_USER_ID;
  const isCurrentMember = Boolean(group && Array.isArray(group.members) && group.members.includes(currentUser.userId));
  const hasPendingInvite = Boolean(group && Array.isArray(group.invitedMembers) && group.invitedMembers.includes(currentUser.userId) && !isCurrentMember);
  const hasLeftOrRemoved = !isSystemDefaultGroup && !isCreator && !isCurrentMember && !hasPendingInvite;

  const renderGroupAvatar = (size = 20) => {
    if (group?.avatarUrl && group.avatarUrl.trim()) {
      const url = group.avatarUrl.trim();
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image') || url.startsWith('/')) {
        return <img src={url} alt={groupDisplayName} className="w-full h-full object-cover" />;
      }
      return <span className="text-xl leading-none select-none">{url}</span>;
    }

    const trailingEmojiMatch = group?.name?.match(/[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]$/u);
    if (trailingEmojiMatch) {
      return <span className="text-xl leading-none select-none">{trailingEmojiMatch[0]}</span>;
    }

    if (groupId === 'group_default_quran_readers') {
      return <span className="text-xl leading-none select-none">📖</span>;
    }
    if (groupId === 'group_default_tadabbur') {
      return <span className="text-xl leading-none select-none">🌿</span>;
    }

    return <Users size={size} />;
  };

  // Resolve all current members
  const currentMembersList = useMemo(() => {
    if (!group || !Array.isArray(group.members)) return [];
    return group.members.map(memberId => {
      const found = communityService.getUserById(memberId);
      if (found) return found;
      return {
        userId: memberId,
        username: memberId === group.createdBy ? (group.creatorName || 'منشئ المجموعة') : 'عضو بالمجموعة',
        country: '🌍',
        isOnline: false,
        createdAt: group.createdAt
      } as CommunityUser;
    });
  }, [group]);

  // Available users to add (not in members and not current user)
  const availableUsersToAdd = useMemo(() => {
    const memberSet = new Set(group?.members || []);
    const q = addMemberSearch.trim().toLowerCase();
    return communityService.getVisibleUsers(q, false).filter(u => 
      !memberSet.has(u.userId) && u.userId !== currentUser.userId
    );
  }, [group, addMemberSearch, currentUser.userId]);

  return (
    <div 
      className="h-screen max-h-screen h-[100dvh] w-full flex flex-col overflow-hidden bg-transparent"
      dir="rtl"
      style={{ 
        fontFamily: theme.font,
        color: textColor,
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      {/* Top Header Bar */}
      <div 
        className="w-full px-3 py-2.5 border-b flex items-center justify-between shadow-xs z-30"
        style={{
          backgroundColor: cardBg,
          borderColor: cardBorder
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Back button */}
          <button
            type="button"
            onClick={handleBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-95 flex-shrink-0 cursor-pointer"
            style={{
              backgroundColor: secondaryBg,
              borderColor: cardBorder,
              color: textColor
            }}
            title="رجوع إلى تبويب المجتمع"
            aria-label="رجوع إلى تبويب المجتمع"
          >
            <ArrowRight size={18} />
          </button>

          {/* Group Avatar and Name (Click to open info) */}
          <div 
            onClick={() => setShowInfoModal(true)}
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
          >
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center border font-bold flex-shrink-0 text-lg shadow-inner overflow-hidden"
              style={{
                backgroundColor: `${primaryColor}15`,
                borderColor: `${primaryColor}30`,
                color: primaryColor
              }}
            >
              {renderGroupAvatar(20)}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-xs sm:text-sm font-bold truncate flex items-center gap-1.5" style={{ color: textColor }}>
                <span>{groupDisplayName}</span>
              </h2>
              <p className="text-[10px] sm:text-[11px] font-medium flex items-center gap-1.5 truncate" style={{ color: textMuted }}>
                <span className="flex items-center gap-1" style={{ color: primaryColor }}>
                  <Users size={12} />
                  <span>{groupMembersCount} عضو</span>
                </span>
                <span>•</span>
                <span className="truncate">تواصل جماعي مبارك 🌿</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Action Icons: Info & More (Delete and Edit are exclusively in the 3-dots menu) */}
        <div className="flex items-center gap-1.5 flex-shrink-0 relative">
          <button
            type="button"
            onClick={() => setShowInfoModal(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-95 cursor-pointer"
            style={{
              backgroundColor: secondaryBg,
              borderColor: cardBorder,
              color: primaryColor
            }}
            title="تفاصيل المجموعة والأعضاء"
          >
            <Info size={17} />
          </button>

          {/* 3-dots Menu Button & Dropdown */}
          <div className="relative" ref={menuContainerRef}>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setShowMenu(prev => !prev)}
              className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-95 cursor-pointer relative z-50"
              style={{
                backgroundColor: secondaryBg,
                borderColor: cardBorder,
                color: textColor
              }}
              title="خيارات إضافية"
            >
              <MoreVertical size={17} />
            </button>

            {/* Options Dropdown Menu */}
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
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    className="absolute left-0 top-11 w-44 sm:w-48 rounded-2xl border shadow-xl p-1.5 z-50 text-xs font-bold space-y-1"
                    style={{
                      backgroundColor: cardBg,
                      borderColor: cardBorder
                    }}
                  >
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    setShowInfoModal(true);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl transition-all hover:bg-slate-500/10 text-right cursor-pointer"
                  style={{ color: textColor }}
                >
                  <Users size={14} style={{ color: primaryColor }} />
                  <span>معلومات المجموعه</span>
                </button>

                {isCreatorOrAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowEditGroupModal(true);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl transition-all hover:bg-slate-500/10 text-right cursor-pointer"
                    style={{ color: textColor }}
                  >
                    <Edit3 size={14} style={{ color: primaryColor }} />
                    <span>تعديل المجموعه</span>
                  </button>
                )}

                {/* إضافة أعضاء: لمنشئ المجموعة فقط */}
                {isCreatorOrAdmin && !isSystemDefaultGroup && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowAddMembersModal(true);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl transition-all hover:bg-slate-500/10 text-right cursor-pointer"
                    style={{ color: textColor }}
                  >
                    <UserPlus size={14} style={{ color: primaryColor }} />
                    <span>اضافة اعضاء</span>
                  </button>
                )}

                {isCreatorOrAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowClearConfirm(true);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl transition-all hover:bg-slate-500/10 text-amber-500 text-right cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>مسح الرسائل</span>
                  </button>
                )}

                {canDeleteGroup && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteGroupConfirm(true);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl transition-all hover:bg-rose-500/15 text-rose-600 dark:text-rose-400 text-right cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>حذف المجموعه</span>
                  </button>
                )}

                {!isSystemDefaultGroup && !isCreator && (
                  <>
                    {/* عندما يكون عضواً في المجموعة يظهر له فقط خيار مغادرة المجموعة */}
                    {isCurrentMember && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          handleLeaveGroup();
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-xl transition-all hover:bg-slate-500/10 text-slate-500 hover:text-amber-500 text-right cursor-pointer"
                      >
                        <LogOut size={14} />
                        <span>مغادرة المجموعة</span>
                      </button>
                    )}

                    {/* لا يظهر خيار إزالة المجموعة من صفحتي إلا إذا تمت إزالته أو حذفه من المجموعة */}
                    {hasLeftOrRemoved && (
                      <button
                        type="button"
                        onClick={async () => {
                          setShowMenu(false);
                          communityService.hideGroupFromMyPage(groupId);
                          showToast('تمت إزالة المجموعة من صفحتك');
                          handleBack();
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-xl transition-all hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-right cursor-pointer"
                      >
                        <EyeOff size={14} />
                        <span>إزالة المجموعة من صفحتي</span>
                      </button>
                    )}
                  </>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  </div>

      {/* Departed / Removed Notice Banner */}
      {hasLeftOrRemoved && (
        <div 
          className="px-3 py-2.5 border-b flex items-center justify-between gap-2 text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400"
          style={{ borderColor: cardBorder }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <EyeOff size={15} className="shrink-0" />
            <span className="truncate">أنت لست عضواً في هذه المجموعة (يتوقف ظهور أي رسائل جديدة لك).</span>
          </div>
          <button
            type="button"
            onClick={() => {
              communityService.hideGroupFromMyPage(groupId);
              showToast('تمت إزالة المجموعة من صفحتك بنجاح');
              handleBack();
            }}
            className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 text-[11px] font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <Trash2 size={12} />
            <span>إزالة من صفحتي</span>
          </button>
        </div>
      )}

      {/* Messages List Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 overscroll-contain"
      >
        {/* Welcome Notice Banner */}
        <div 
          className="mx-auto max-w-md p-3.5 rounded-2xl border text-center shadow-xs mb-2"
          style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}25` }}
        >
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold mb-1" style={{ color: primaryColor }}>
            <Sparkles size={14} />
            <span>مرحباً بكم في {groupDisplayName}</span>
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: textMuted }}>
            {group?.description || 'مساحة إيمانية مباركة لتدارس كتاب الله وتبادل الفوائد والأذكار.'}
          </p>
        </div>

        {/* Pending Group Invitation Banner */}
        {Boolean(group && group.invitedMembers?.includes(currentUser.userId) && !group.members?.includes(currentUser.userId)) && (
          <div 
            className="mx-auto max-w-md p-4 rounded-3xl border shadow-md mb-3 text-center space-y-2.5"
            style={{ backgroundColor: cardBg, borderColor: `${primaryColor}50` }}
          >
            <div className="flex items-center justify-center gap-2 font-bold text-sm" style={{ color: primaryColor }}>
              <Sparkles size={16} />
              <span>دعوة للانضمام إلى هذه المحادثة الجماعية</span>
            </div>
            <p className="text-xs" style={{ color: textMuted }}>
              تمت دعوتك لهذه المجموعة بواسطة <span className="font-bold" style={{ color: textColor }}>{group?.creatorName || 'أحد الأعضاء'}</span>. هل ترغب في الانضمام والتواصل مع الأعضاء؟
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={async () => {
                  await communityService.acceptGroupInvitation(groupId);
                  loadGroupData();
                  showToast('تم الانضمام إلى المجموعة بنجاح 🌿');
                }}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                style={{ backgroundColor: primaryColor, color: primaryTextColor }}
              >
                <Check size={14} />
                <span>قبول والانضمام للمحادثة</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  await communityService.declineGroupInvitation(groupId);
                  showToast('تم رفض الدعوة');
                  handleBack();
                }}
                className="py-2 px-3.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 active:scale-95 text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                style={{ backgroundColor: secondaryBg, borderColor: cardBorder }}
              >
                <X size={14} />
                <span>رفض</span>
              </button>
            </div>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="text-center py-10" style={{ color: textMuted }}>
            <p className="text-xs font-bold">لا توجد رسائل سابقة في هذه الحلقة المباركة</p>
            <p className="text-[11px] mt-1">كن أول من يبدأ بالسلام أو بمشاركة آية كريمة 🌸</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.userId;
            const timeStr = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '';

            return (
              <div
                key={msg.messageId}
                className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {/* Sender Avatar (Only for others) */}
                {!isMe && (
                  <button 
                    type="button"
                    onClick={() => handleOpenMemberProfile(msg.senderId, msg.senderName, msg.senderAvatarUrl, msg.senderCountry)}
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border overflow-hidden flex-shrink-0 mb-1 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: `${primaryColor}20`,
                      borderColor: `${primaryColor}40`,
                      color: primaryColor
                    }}
                    title={`عرض بيانات ${msg.senderName}`}
                  >
                    {msg.senderAvatarUrl ? (
                      <img src={msg.senderAvatarUrl} alt={msg.senderName} className="w-full h-full object-cover" />
                    ) : (
                      (msg.senderName || 'ق').charAt(0)
                    )}
                  </button>
                )}

                {/* Message Bubble Container */}
                <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* Sender Name Badge for others */}
                  {!isMe && (
                    <button
                      type="button"
                      onClick={() => handleOpenMemberProfile(msg.senderId, msg.senderName, msg.senderAvatarUrl, msg.senderCountry)}
                      className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-bold cursor-pointer hover:opacity-80 transition-opacity text-right group"
                      title={`عرض بيانات ${msg.senderName}`}
                    >
                      <span style={{ color: primaryColor }} className="group-hover:underline">{msg.senderName}</span>
                      {msg.senderCountry && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md" style={{ backgroundColor: secondaryBg, color: textMuted }}>
                          {msg.senderCountry}
                        </span>
                      )}
                    </button>
                  )}

                  {/* Quran Card if present */}
                  {msg.verseData && (
                    <ChatQuranCard 
                      verseData={msg.verseData}
                      playingAudioUrl={playingAudioUrl}
                      onToggleAudio={handleToggleAudio}
                    />
                  )}

                  {/* Audio Player if present */}
                  {msg.audioUrl && (
                    <ChatMessageAudioPlayer 
                      audioUrl={msg.audioUrl}
                      isMe={isMe}
                      audioDuration={msg.audioDuration}
                      timeStr={timeStr}
                      isRead={true}
                    />
                  )}

                  {/* Media File / Image / Video Attachment */}
                  {msg.attachment && (
                    <div className="mb-1.5 w-full">
                      <ChatAttachmentView attachment={msg.attachment} isMe={isMe} />
                    </div>
                  )}

                  {/* Text Content */}
                  {msg.text && !msg.verseData && !msg.audioUrl && (
                    <div
                      className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs relative group ${
                        isMe 
                          ? 'rounded-bl-none text-white' 
                          : 'rounded-br-none border'
                      }`}
                      style={{
                        backgroundColor: isMe ? primaryColor : cardBg,
                        color: isMe ? primaryTextColor : textColor,
                        borderColor: isMe ? 'transparent' : cardBorder
                      }}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                      <div className="flex items-center justify-end gap-1.5 mt-1.5 text-[9px] opacity-75">
                        <span>{timeStr}</span>
                        {isMe && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.messageId)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-rose-300 hover:text-rose-100"
                            title="حذف رسالتي"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Attachment without text timestamp & delete button */}
                  {!msg.text && msg.attachment && (
                    <div className="flex items-center justify-end gap-1.5 mt-0.5 text-[9px] px-1" style={{ color: textMuted }}>
                      <span>{timeStr}</span>
                      {isMe && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.messageId)}
                          className="p-0.5 rounded hover:text-rose-500 transition-colors cursor-pointer"
                          title="حذف رسالتي"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Recording Active Bar */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="w-full px-4 py-3 border-t flex items-center justify-between shadow-lg"
            style={{ backgroundColor: cardBg, borderColor: cardBorder }}
          >
            <div className="flex items-center gap-2 text-rose-500 font-bold text-xs animate-pulse">
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <span>جارٍ التسجيل الصوتي... {formatSecs(recordingDuration)}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelRecording}
                className="px-3 py-1.5 rounded-xl border text-xs font-bold transition-all text-rose-500"
                style={{ backgroundColor: secondaryBg, borderColor: cardBorder }}
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={stopRecording}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1 active:scale-95"
                style={{ backgroundColor: primaryColor }}
              >
                <Send size={12} />
                <span>إرسال</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Message Input Bar or Pending Invitation Note */}
      {Boolean(group && group.invitedMembers?.includes(currentUser.userId) && !group.members?.includes(currentUser.userId)) ? (
        <div 
          className="w-full px-4 py-3 border-t flex items-center justify-center gap-2 shadow-sm z-30"
          style={{ backgroundColor: cardBg, borderColor: cardBorder }}
        >
          <span className="text-xs font-medium" style={{ color: textMuted }}>
            يرجى قبول دعوة الانضمام من البطاقة أعلاه للمشاركة في المحادثة
          </span>
        </div>
      ) : hasLeftOrRemoved ? (
        <div 
          className="w-full px-3 py-3 border-t flex flex-wrap items-center justify-between gap-2 shadow-md z-30 bg-amber-500/10"
          style={{ borderColor: cardBorder }}
        >
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
            <EyeOff size={16} />
            <span>لقد غادرت هذه المجموعة أو تمت إزالتك منها. يتوقف استلام أي رسائل جديدة.</span>
          </div>
          <button
            type="button"
            onClick={() => {
              communityService.hideGroupFromMyPage(groupId);
              showToast('تمت إزالة المجموعة من صفحتك بنجاح');
              handleBack();
            }}
            className="py-2 px-3 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
          >
            <Trash2 size={13} />
            <span>إزالة المجموعة من صفحتي</span>
          </button>
        </div>
      ) : !isRecording && (
        <div 
          className="w-full px-2 sm:px-3 py-2 border-t flex flex-col shadow-md z-30"
          style={{
            backgroundColor: cardBg,
            borderColor: cardBorder
          }}
        >
          {/* Staged Attachment Preview */}
          <AnimatePresence>
            {stagedAttachment && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-2 p-2.5 rounded-2xl border flex items-center justify-between gap-3 shadow-xs"
                style={{
                  backgroundColor: secondaryBg,
                  borderColor: `${primaryColor}40`
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {stagedAttachment.type === 'image' ? (
                    <img src={stagedAttachment.url} alt="معاينة" className="w-10 h-10 rounded-xl object-cover border" style={{ borderColor: cardBorder }} />
                  ) : stagedAttachment.type === 'video' ? (
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold">
                      <Video size={18} />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                      <FileText size={18} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color: textColor }}>
                      {stagedAttachment.fileName || (stagedAttachment.type === 'image' ? 'صورة مختارة' : stagedAttachment.type === 'video' ? 'مقطع مرئي' : 'ملف')}
                    </p>
                    <p className="text-[10px]" style={{ color: textMuted }}>
                      جاهز للإرسال والاسترداد • {formatFileSize(stagedAttachment.fileSize)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStagedAttachment(null)}
                  className="p-1.5 rounded-xl hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                  title="إلغاء المرفق"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-1 sm:gap-1.5 w-full max-w-full overflow-hidden">
            {/* Three action buttons clustered tightly with minimal spacing */}
            <div className="flex items-center gap-0 shrink-0">
              {/* Quran Verse Share Button */}
              <button
                type="button"
                onClick={() => setShowVerseModal(true)}
                className="w-7 h-8 sm:w-8 sm:h-8.5 rounded-r-xl rounded-l-none flex items-center justify-center border transition-all active:scale-95 flex-shrink-0 cursor-pointer p-0"
                style={{
                  backgroundColor: secondaryBg,
                  borderColor: cardBorder,
                  color: '#f59e0b'
                }}
                title="مشاركة آية كريمة في المجموعة"
              >
                <BookOpen size={16} />
              </button>

              {/* Paperclip Media Attachment Button */}
              <button
                type="button"
                onClick={() => setShowAttachmentPicker(true)}
                className="w-7 h-8 sm:w-8 sm:h-8.5 rounded-none flex items-center justify-center border transition-all active:scale-95 flex-shrink-0 cursor-pointer p-0"
                style={{
                  backgroundColor: secondaryBg,
                  borderColor: cardBorder,
                  color: primaryColor
                }}
                title="إرفاق واسترداد ملف أو صورة أو فيديو"
              >
                <Paperclip size={16} />
              </button>

              {/* Emoji / Adhkar Picker Button */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(prev => !prev)}
                className="w-7 h-8 sm:w-8 sm:h-8.5 rounded-l-xl rounded-r-none flex items-center justify-center border transition-all active:scale-95 flex-shrink-0 cursor-pointer p-0"
                style={{
                  backgroundColor: secondaryBg,
                  borderColor: cardBorder,
                  color: primaryColor
                }}
                title="إدراج أذكار وتعبيرات"
              >
                <Smile size={16} />
              </button>
            </div>

            {/* Text Input */}
            <div className="flex-1 relative min-w-0">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={stagedAttachment ? "أضف تعليقاً مع المرفق (اختياري)..." : "اكتب رسالتك للمجموعة..."}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-medium focus:outline-none transition-all shadow-inner min-w-0"
                style={{
                  backgroundColor: secondaryBg,
                  borderColor: cardBorder,
                  color: textColor
                }}
              />
            </div>

            {/* Voice Record or Send Button */}
            {inputText.trim() || stagedAttachment ? (
              <button
                type="button"
                onClick={handleSendMessage}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-white shadow-md transition-all active:scale-95 flex-shrink-0 cursor-pointer"
                style={{
                  backgroundColor: primaryColor,
                  color: primaryTextColor
                }}
                title="إرسال"
              >
                <Send size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl flex items-center justify-center border transition-all active:scale-95 flex-shrink-0 cursor-pointer"
                style={{
                  backgroundColor: secondaryBg,
                  borderColor: cardBorder,
                  color: primaryColor
                }}
                title="تسجيل رسالة صوتية"
              >
                <Mic size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Emoji & Adhkar Picker Modal/Popup */}
      {showEmojiPicker && (
        <EmojiPicker
          onSelectEmoji={(emojiOrText) => {
            setInputText(prev => prev + ' ' + emojiOrText);
            setShowEmojiPicker(false);
          }}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {/* Quran Verse Share Modal */}
      {showVerseModal && (
        <QuranVerseModal
          isOpen={true}
          onClose={() => setShowVerseModal(false)}
          onSendVerse={handleSendVerse}
        />
      )}

      {/* Group Info Modal */}
      <AnimatePresence>
        {showInfoModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            dir="rtl"
            style={{ fontFamily: theme.font }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto"
              style={{
                backgroundColor: cardBg,
                borderColor: cardBorder,
                color: textColor
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: cardBorder }}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div 
                    className="w-10 h-10 rounded-2xl flex items-center justify-center border font-bold flex-shrink-0 text-lg shadow-inner overflow-hidden cursor-pointer"
                    style={{ backgroundColor: `${primaryColor}15`, borderColor: `${primaryColor}30`, color: primaryColor }}
                    onClick={() => {
                      if (isCreatorOrAdmin) {
                        setShowInfoModal(false);
                        setShowEditGroupModal(true);
                      }
                    }}
                    title={isCreatorOrAdmin ? "اضغط لتعديل صورة واسم المجموعة" : undefined}
                  >
                    {renderGroupAvatar(20)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base truncate">{groupDisplayName}</h3>
                    <p className="text-[11px]" style={{ color: textMuted }}>معلومات المجموعة</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInfoModal(false)}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center cursor-pointer shrink-0"
                  style={{ backgroundColor: secondaryBg, borderColor: cardBorder, color: textMuted }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Description */}
              <div className="p-3.5 rounded-2xl border" style={{ backgroundColor: secondaryBg, borderColor: cardBorder }}>
                <h4 className="text-xs font-bold mb-1" style={{ color: primaryColor }}>وصف المجموعة</h4>
                <p className="text-xs leading-relaxed" style={{ color: textColor }}>
                  {group?.description || 'مجموعة مباركة لتدارس القرآن الكريم والتواصل بين القراء.'}
                </p>
              </div>

              {/* Creator info */}
              <div className="flex items-center justify-between text-xs px-1" style={{ color: textMuted }}>
                <span>المنشئ: {group?.creatorName || 'الإدارة'}</span>
                <span>تاريخ الإنشاء: {group?.createdAt ? new Date(group.createdAt).toLocaleDateString('ar-EG') : 'حديثاً'}</span>
              </div>

              {/* Members List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold flex items-center gap-1.5" style={{ color: primaryColor }}>
                    <Users size={14} />
                    <span>أعضاء المجموعة ({groupMembersCount})</span>
                  </h4>
                  {/* إضافة أعضاء: لمنشئ المجموعة فقط */}
                  {isCreatorOrAdmin && !isSystemDefaultGroup && (
                    <button
                      type="button"
                      onClick={() => setShowAddMembersModal(true)}
                      className="px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                      style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                    >
                      <UserPlus size={13} />
                      <span>دعوة أعضاء</span>
                    </button>
                  )}
                </div>

                <div 
                  className="max-h-56 overflow-y-auto space-y-1.5 p-2 rounded-2xl border"
                  style={{ backgroundColor: secondaryBg, borderColor: cardBorder }}
                >
                  {/* Current User */}
                  <div 
                    onClick={() => handleOpenMemberProfile(currentUser.userId, currentUser.username, currentUser.avatarUrl, currentUser.country)}
                    className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs cursor-pointer hover:bg-emerald-500/15 transition-all"
                    title="عرض حسابك الشخصي"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                        {currentUser.avatarUrl ? (
                          <img src={currentUser.avatarUrl} alt={currentUser.username} className="w-full h-full object-cover" />
                        ) : (
                          currentUser.username?.charAt(0) || 'أ'
                        )}
                      </div>
                      <div className="min-w-0 flex items-center gap-1.5 truncate">
                        <span className="font-bold truncate hover:underline" style={{ color: textColor }}>{currentUser.username} (أنت)</span>
                        {group?.createdBy === currentUser.userId && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold shrink-0">
                            منشئ 👑
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold shrink-0">عضو متصل</span>
                  </div>

                  {/* Other members */}
                  {currentMembersList
                    .filter(u => u.userId !== currentUser.userId)
                    .map(u => {
                      const isMemberCreator = u.userId === group?.createdBy;
                      return (
                        <div 
                          key={u.userId} 
                          onClick={() => handleOpenMemberProfile(u.userId, u.username, u.avatarUrl, u.country)}
                          className="flex items-center justify-between p-2 rounded-xl border text-xs gap-2 cursor-pointer transition-all hover:bg-slate-500/10 active:scale-[0.99]" 
                          style={{ borderColor: cardBorder }}
                          title={`عرض بيانات ${u.username}`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div 
                              className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs overflow-hidden shrink-0 border"
                              style={{ backgroundColor: `${primaryColor}20`, borderColor: `${primaryColor}40`, color: primaryColor }}
                            >
                              {u.avatarUrl ? (
                                <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                              ) : (
                                u.username.charAt(0)
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="font-bold truncate hover:underline" style={{ color: textColor }}>{u.username}</span>
                                {isMemberCreator && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold shrink-0">
                                    المنشئ 👑
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] block truncate" style={{ color: textMuted }}>({u.country || '🌍'})</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px]" style={{ color: communityService.isUserOnline(u) ? '#10b981' : textMuted }}>
                              {communityService.isUserOnline(u) ? 'متصل الآن' : 'عضو'}
                            </span>
                            {/* Remove member button for Creator */}
                            {isCreatorOrAdmin && !isMemberCreator && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMemberToRemove({ userId: u.userId, username: u.username });
                                }}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/15 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                                title={`إزالة ${u.username} من المجموعة`}
                              >
                                <UserMinus size={14} />
                                <span className="hidden sm:inline">إزالة</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  {currentMembersList.filter(u => u.userId !== currentUser.userId).length === 0 && (
                    <p className="text-center py-3 text-xs" style={{ color: textMuted }}>
                      لا يوجد أعضاء آخرين بعد. يمكنك دعوة أو إضافة مستخدمين للمجموعة!
                    </p>
                  )}
                </div>
              </div>

              {/* Creator Zone in Info Modal */}
              {canDeleteGroup && (
                <div className="p-3.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 space-y-1.5 text-right">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <Shield size={14} />
                      <span>إدارة المجموعة (خاص بالمنشئ)</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400">
                      أنت المنشئ 👑
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: textMuted }}>
                    بصفتك منشئ هذه المجموعة، تتوفر خيارات تعديل المجموعة وحذفها ودعوة الأعضاء من خلال قائمة الخيارات (الثلاث نقاط).
                  </p>
                </div>
              )}

              {/* Bottom Actions in Info Modal */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowInfoModal(false)}
                  className="w-full py-2.5 rounded-2xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                  style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Members Modal */}
      <AnimatePresence>
        {showAddMembersModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl" style={{ fontFamily: theme.font }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border shadow-2xl p-5 space-y-4 max-h-[85vh] flex flex-col"
              style={{
                backgroundColor: cardBg,
                borderColor: cardBorder,
                color: textColor
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: cardBorder }}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-9 h-9 rounded-2xl flex items-center justify-center border font-bold"
                    style={{ backgroundColor: `${primaryColor}15`, borderColor: `${primaryColor}30`, color: primaryColor }}
                  >
                    <UserPlus size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">دعوة مستخدمين للمجموعة</h3>
                    <p className="text-[11px]" style={{ color: textMuted }}>اختر من قراء المجتمع لإرسال دعوة انضمام ورسالة لهم لحلقة {groupDisplayName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMembersModal(false);
                    setAddMemberSearch('');
                  }}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center cursor-pointer"
                  style={{ backgroundColor: secondaryBg, borderColor: cardBorder, color: textMuted }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Search user */}
              <div className="relative">
                <Search size={16} className="absolute right-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={addMemberSearch}
                  onChange={(e) => setAddMemberSearch(e.target.value)}
                  placeholder="ابحث بالاسم أو الدولة..."
                  className="w-full pr-10 pl-3 py-2.5 rounded-xl border text-xs font-medium focus:outline-none"
                  style={{
                    backgroundColor: secondaryBg,
                    borderColor: cardBorder,
                    color: textColor
                  }}
                />
              </div>

              {/* Users list */}
              <div className="flex-1 overflow-y-auto space-y-2 min-h-[220px] max-h-[350px] pr-0.5">
                {availableUsersToAdd.length === 0 ? (
                  <div className="text-center py-10" style={{ color: textMuted }}>
                    <Users size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-bold">
                      {addMemberSearch ? 'لم يتم العثور على مستخدمين بهذا الاسم' : 'جميع المستخدمين مضافون بالفعل للمجموعة'}
                    </p>
                  </div>
                ) : (
                  availableUsersToAdd.map(u => {
                    const isAlreadyInvited = Boolean(group?.invitedMembers?.includes(u.userId));
                    return (
                      <div 
                        key={u.userId}
                        className="flex items-center justify-between p-2.5 rounded-2xl border text-xs transition-all hover:border-emerald-500/40"
                        style={{ backgroundColor: secondaryBg, borderColor: cardBorder }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs overflow-hidden shrink-0"
                            style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                          >
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                            ) : (
                              u.username.charAt(0)
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-bold truncate" style={{ color: textColor }}>{u.username}</h4>
                              {isAlreadyInvited && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold shrink-0">
                                  تم إرسال دعوة
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] truncate" style={{ color: textMuted }}>{u.country || '🌍'}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddMember(u)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs active:scale-95 flex items-center gap-1 cursor-pointer shrink-0 transition-all"
                          style={{
                            backgroundColor: isAlreadyInvited ? `${primaryColor}20` : primaryColor,
                            color: isAlreadyInvited ? primaryColor : primaryTextColor
                          }}
                          title={isAlreadyInvited ? 'تم إرسال دعوة بالفعل، اضغط لإعادة إرسال الدعوة والرسالة' : 'إرسال دعوة انضمام ورسالة للمستخدم'}
                        >
                          {isAlreadyInvited ? (
                            <>
                              <Check size={13} />
                              <span>إعادة الدعوة</span>
                            </>
                          ) : (
                            <>
                              <UserPlus size={13} />
                              <span>إرسال دعوة</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-2 border-t" style={{ borderColor: cardBorder }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMembersModal(false);
                    setAddMemberSearch('');
                  }}
                  className="w-full py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer"
                  style={{ backgroundColor: secondaryBg, borderColor: cardBorder, color: textColor }}
                >
                  تم الانتهاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Remove Member Confirmation Modal */}
      <AnimatePresence>
        {memberToRemove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl" style={{ fontFamily: theme.font }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl border shadow-xl p-5 text-center space-y-3"
              style={{ backgroundColor: cardBg, borderColor: cardBorder, color: textColor }}
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                <UserMinus size={24} />
              </div>
              <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">إزالة العضو من المجموعة؟</h3>
              <p className="text-xs leading-relaxed" style={{ color: textMuted }}>
                هل أنت متأكد من رغبتك في إزالة العضو <strong>"{memberToRemove.username}"</strong> من هذه المحادثة الجماعية؟ لن يتمكن من إرسال رسائل في المجموعة بعد الآن.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmRemoveMember}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  تأكيد الإزالة
                </button>
                <button
                  type="button"
                  onClick={() => setMemberToRemove(null)}
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

      {/* Delete Group Confirmation Modal */}
      <AnimatePresence>
        {showDeleteGroupConfirm && (
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
                أنت على وشك حذف مجموعة <strong>"{groupDisplayName}"</strong> بشكل نهائي. بصفتك منشئ هذه المجموعة، سيتم حذف المجموعة بالكامل ومسح كافة محادثاتها لجميع المشتركين تماماً.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleDeleteGroup}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  نعم، حذف المجموعة نهائياً
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteGroupConfirm(false)}
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

      {/* Clear Messages Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl border shadow-xl p-5 text-center space-y-3"
              style={{ backgroundColor: cardBg, borderColor: cardBorder, color: textColor }}
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>
              <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">مسح محادثات المجموعة؟</h3>
              <p className="text-xs" style={{ color: textMuted }}>
                سيتم حذف كافة الرسائل السابقة من هذه الحلقة لدى جميع الأعضاء.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClearMessages}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm"
                >
                  تأكيد المسح
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all"
                  style={{ backgroundColor: secondaryBg, borderColor: cardBorder, color: textColor }}
                >
                  تراجع
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Member Profile & Actions Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl" style={{ fontFamily: theme.font }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-sm rounded-3xl border shadow-2xl p-5 space-y-4"
              style={{
                backgroundColor: cardBg,
                borderColor: cardBorder,
                color: textColor
              }}
            >
              {/* Header with Close */}
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: cardBorder }}>
                <div className="flex items-center gap-1.5">
                  <User size={16} style={{ color: primaryColor }} />
                  <span className="text-xs font-bold" style={{ color: textColor }}>
                    بطاقة عضو المجموعة
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all active:scale-95 cursor-pointer"
                  style={{ backgroundColor: secondaryBg, borderColor: cardBorder, color: textMuted }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Avatar & Main Identity */}
              <div className="flex flex-col items-center text-center pt-1">
                <div className="relative mb-2.5">
                  <div 
                    className="w-20 h-20 rounded-3xl flex items-center justify-center font-bold text-2xl border-2 shadow-md overflow-hidden"
                    style={{
                      backgroundColor: `${primaryColor}15`,
                      borderColor: `${primaryColor}40`,
                      color: primaryColor
                    }}
                  >
                    {selectedMember.avatarUrl ? (
                      <img src={selectedMember.avatarUrl} alt={selectedMember.username} className="w-full h-full object-cover" />
                    ) : (
                      selectedMember.username?.charAt(0) || 'ق'
                    )}
                  </div>
                  {/* Online indicator */}
                  <div 
                    className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                      communityService.isUserOnline(selectedMember) ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                    title={communityService.isUserOnline(selectedMember) ? 'متصل الآن' : 'غير متصل'}
                  />
                </div>

                <h3 className="font-bold text-base sm:text-lg" style={{ color: textColor }}>
                  {selectedMember.username}
                </h3>

                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap justify-center">
                  {selectedMember.userId === group?.createdBy ? (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      منشئ المجموعة 👑
                    </span>
                  ) : (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      عضو في المجموعة 🌿
                    </span>
                  )}

                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    communityService.isUserOnline(selectedMember)
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-500/10 text-slate-500 border-slate-500/30'
                  }`}>
                    {communityService.isUserOnline(selectedMember) ? 'متصل الآن 🟢' : 'غير متصل ⚪'}
                  </span>
                </div>
              </div>

              {/* Info Details Grid */}
              <div className="space-y-2.5 p-3 rounded-2xl border text-xs" style={{ backgroundColor: secondaryBg, borderColor: cardBorder }}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium" style={{ color: textMuted }}>
                    <MapPin size={13} />
                    <span>الدولة / الإقامة:</span>
                  </span>
                  <span className="font-bold" style={{ color: textColor }}>
                    {selectedMember.country || 'غير محدد 🌍'}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Add Friend + Start Chat */}
              {selectedMember.userId === currentUser.userId ? (
                <div className="text-center py-2.5 px-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  ✨ هذا حسابك الشخصي في المجتمع
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  {/* زر الإضافة */}
                  {selectedMemberFriendship.status === 'accepted' ? (
                    <div className="w-full py-2.5 px-3 rounded-2xl text-xs font-bold border flex items-center justify-center gap-2 bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                      <UserCheck size={16} />
                      <span>أصدقاء في المجتمع بالفعل 🌿</span>
                    </div>
                  ) : selectedMemberFriendship.status === 'pending' && selectedMemberFriendship.isRequester ? (
                    <div className="w-full py-2.5 px-3 rounded-2xl text-xs font-bold border flex items-center justify-center gap-2 bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400">
                      <Clock size={16} />
                      <span>طلب الإضافة قيد الانتظار ⏳</span>
                    </div>
                  ) : selectedMemberFriendship.status === 'pending' && !selectedMemberFriendship.isRequester ? (
                    <button
                      type="button"
                      onClick={() => handleAcceptFriendRequest(selectedMember.userId)}
                      className="w-full py-2.5 px-3 rounded-2xl text-xs font-bold shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                      style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                    >
                      <Check size={16} />
                      <span>قبول طلب الإضافة الوارد</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendFriendRequest(selectedMember.userId)}
                      className="w-full py-2.5 px-3 rounded-2xl text-xs font-bold border shadow-xs flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-emerald-500/10 hover:border-emerald-500/30 cursor-pointer"
                      style={{
                        backgroundColor: secondaryBg,
                        borderColor: cardBorder,
                        color: textColor
                      }}
                    >
                      <UserPlus size={16} className="text-emerald-500" />
                      <span>إرسال طلب إضافة كصديق</span>
                    </button>
                  )}

                  {/* زر لإجراء محادثة */}
                  <button
                    type="button"
                    onClick={() => handleStartDirectChat(selectedMember.userId)}
                    className="w-full py-2.5 px-3 rounded-2xl text-xs font-bold shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                    style={{
                      backgroundColor: primaryColor,
                      color: primaryTextColor
                    }}
                  >
                    <MessageCircle size={16} />
                    <span>بدء محادثة خاصة 💬</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Group Modal */}
      <EditGroupModal
        isOpen={showEditGroupModal}
        onClose={() => setShowEditGroupModal(false)}
        group={group}
        onUpdated={(updatedGroup) => {
          setGroup(updatedGroup);
          showToast('تم حفظ تعديل اسم وصورة المجموعة بنجاح 🌿');
        }}
        onDelete={() => {
          setShowEditGroupModal(false);
          setShowDeleteGroupConfirm(true);
        }}
      />

      {/* Media Attachment Picker Modal (Photos, Videos, Files) */}
      <MediaAttachmentPicker
        isOpen={showAttachmentPicker}
        onClose={() => setShowAttachmentPicker(false)}
        onFileSelected={handleFileSelected}
      />

      {/* Media Processing Loading Overlay */}
      {isProcessingMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4" dir="rtl">
          <div 
            className="rounded-3xl p-5 shadow-2xl flex items-center gap-3 text-sm font-bold border"
            style={{
              backgroundColor: cardBg,
              borderColor: cardBorder,
              color: textColor
            }}
          >
            <Loader2 size={22} className="animate-spin text-emerald-500 shrink-0" />
            <span>جاري تجهيز واسترداد بيانات الملف للإرسال...</span>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-2 pointer-events-none"
          >
            <CheckCircle2 size={15} className="text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GroupChatPage;
