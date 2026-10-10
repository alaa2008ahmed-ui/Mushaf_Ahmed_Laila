import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    X, Trash2, ShieldAlert, Users, Info, ShieldCheck, Mail, Send, Reply, 
    ArrowRight, User, Globe, Calendar, Activity, UserMinus, Eye, AlertTriangle, 
    CheckCircle2, Megaphone, Filter, Search, Ban, Clock, UserCheck, History,
    MessageSquarePlus, MessageSquare, ExternalLink, Edit3, MessageCircle, MoreVertical,
    LogIn, Volume2, FileText, ChevronLeft, ChevronRight, RefreshCw, Shield, Copy, Check,
    UserPlus, Play, Pause, Paperclip, Sparkles
} from 'lucide-react';
import { 
    communityService, 
    CommunityUser, 
    ServerContact, 
    ChatMessage, 
    GroupChat, 
    GroupMessage, 
    ADMIN_USER_ID 
} from '../../services/communityService';
import BottomBar from '../BottomBar';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import CreateGroupModal from './CreateGroupModal';
import { EditGroupModal } from './EditGroupModal';

interface AdminDashboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTheme: any;
    onNavigate?: (pageId: string, params?: any) => void;
}

interface ParsedViolationData {
    category: 'offensive' | 'political';
    country: string;
    detectedWords: string[];
    blockedText: string;
    recipientName?: string;
    recipientCode?: string;
    timeString: string;
}

interface NavigationSource {
    tab: 'users' | 'support' | 'violations' | 'broadcast' | 'community';
    violatorUserId?: string | null;
    supportUserId?: string | null;
    groupId?: string | null;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
    isOpen,
    onClose,
    currentTheme,
    onNavigate
}) => {
    const [users, setUsers] = useState<CommunityUser[]>([]);
    const [contacts, setContacts] = useState<ServerContact[]>([]);
    const [serverMessages, setServerMessages] = useState<ChatMessage[]>([]);
    const [activeTab, setActiveTab] = useState<'users' | 'support' | 'violations' | 'broadcast' | 'community'>('users');
    const [adminTabHistory, setAdminTabHistory] = useState<('users' | 'support' | 'violations' | 'broadcast' | 'community')[]>(['users']);

    const switchAdminTab = (tab: 'users' | 'support' | 'violations' | 'broadcast' | 'community') => {
        setSelectedInspectorUser(null);
        setSelectedUserForSupport(null);
        setSelectedViolatorUserId(null);
        setSelectedGroup(null);
        if (tab === activeTab) return;
        setActiveTab(tab);
        setAdminTabHistory(prev => [...prev, tab]);
    };
    
    // Detailed User Inspector State & Return Navigation
    const [selectedInspectorUser, setSelectedInspectorUser] = useState<CommunityUser | null>(null);
    const [inspectorReturnSource, setInspectorReturnSource] = useState<NavigationSource | null>(null);

    // Support tab reply states
    const [selectedUserForSupport, setSelectedUserForSupport] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    // Broadcast message states
    const [broadcastText, setBroadcastText] = useState('');
    const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

    // Violations Tab Grouping & Filter State
    const [selectedViolatorUserId, setSelectedViolatorUserId] = useState<string | null>(null);
    const [violationFilter, setViolationFilter] = useState<'all' | 'offensive' | 'political'>('all');
    const [violationSearchQuery, setViolationSearchQuery] = useState('');

    // Community / Groups Management State
    const [groups, setGroups] = useState<GroupChat[]>([]);
    const [groupSearchQuery, setGroupSearchQuery] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<GroupChat | null>(null);
    const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
    const [isLoadingGroupMessages, setIsLoadingGroupMessages] = useState(false);
    const [copiedGroupId, setCopiedGroupId] = useState(false);

    // Group Controls & Modals State
    const [showGroupOptionsDropdown, setShowGroupOptionsDropdown] = useState(false);
    const [selectedMessageForDetails, setSelectedMessageForDetails] = useState<GroupMessage | null>(null);
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const [showEditGroupModal, setShowEditGroupModal] = useState(false);
    const [showManageMembersModal, setShowManageMembersModal] = useState(false);
    const [showAddMembersModal, setShowAddMembersModal] = useState(false);
    const [showGroupInfoModal, setShowGroupInfoModal] = useState(false);
    const [manageMemberSearch, setManageMemberSearch] = useState('');
    const [addMemberSearch, setAddMemberSearch] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Group Deletion / Message Deletion Modals
    const [groupToDeleteConfirm, setGroupToDeleteConfirm] = useState<GroupChat | null>(null);
    const [isDeletingGroup, setIsDeletingGroup] = useState(false);
    const [msgToDeleteConfirm, setMsgToDeleteConfirm] = useState<GroupMessage | null>(null);
    const [isDeletingMsg, setIsDeletingMsg] = useState(false);
    const [showClearGroupMsgsConfirm, setShowClearGroupMsgsConfirm] = useState(false);
    const [isClearingGroupMsgs, setIsClearingGroupMsgs] = useState(false);
    const [memberToRemoveConfirm, setMemberToRemoveConfirm] = useState<{ userId: string; username: string } | null>(null);
    const [isRemovingMember, setIsRemovingMember] = useState(false);

    // Group editing state
    const [editGroupName, setEditGroupName] = useState('');
    const [editGroupDesc, setEditGroupDesc] = useState('');
    const [editGroupAvatar, setEditGroupAvatar] = useState('');
    const [isSavingGroupEdit, setIsSavingGroupEdit] = useState(false);

    // Admin official message in group
    const [adminGroupMessageText, setAdminGroupMessageText] = useState('');
    const [isSendingGroupMessage, setIsSendingGroupMessage] = useState(false);

    // In-app Confirmation Modal State
    const [userToDeleteConfirm, setUserToDeleteConfirm] = useState<CommunityUser | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Direct Support Message Modal state
    const [messagingUser, setMessagingUser] = useState<CommunityUser | null>(null);
    const [adminDirectMessageText, setAdminDirectMessageText] = useState('');
    const [isSendingDirectMessage, setIsSendingDirectMessage] = useState(false);

    const openSendMessageModal = (user: CommunityUser) => {
        setMessagingUser(user);
        setAdminDirectMessageText('');
    };

    const handleSendDirectMessage = async () => {
        if (!messagingUser || !adminDirectMessageText.trim()) return;
        setIsSendingDirectMessage(true);
        try {
            await communityService.sendAdminReply(messagingUser.userId, adminDirectMessageText);
            showAdminToast(`تم إرسال الرسالة إلى "${messagingUser.username || 'المستخدم'}" وستظهر في دعمه الفني ✅`);
            setMessagingUser(null);
            setAdminDirectMessageText('');
            await loadData();
        } catch (e) {
            console.error('Error sending direct message:', e);
            showAdminToast('حدث خطأ أثناء إرسال الرسالة');
        } finally {
            setIsSendingDirectMessage(false);
        }
    };

    const loadDebounceTimerRef = React.useRef<any>(null);

    const loadData = async (forceServerFetch = false) => {
        const uList = communityService.getAllUsers();
        // Remove official Admin from regular list
        const filteredUsers = uList.filter(u => u.userId !== ADMIN_USER_ID);
        setUsers(filteredUsers);
        setContacts(communityService.getRawContacts());
        
        const msgs = await communityService.fetchAllServerMessages(forceServerFetch);
        setServerMessages(msgs);

        if (forceServerFetch) {
            await communityService.fetchLatestGroups();
        }
        const grps = communityService.getAllGroupsForAdmin();
        setGroups(grps);

        if (selectedGroup) {
            const grpMsgs = communityService.getGroupMessages(selectedGroup.groupId);
            setGroupMessages(grpMsgs);
        }
    };

    const debouncedLoadData = () => {
        if (loadDebounceTimerRef.current) clearTimeout(loadDebounceTimerRef.current);
        loadDebounceTimerRef.current = setTimeout(() => {
            loadData(false);
        }, 250);
    };

    useEffect(() => {
        if (isOpen) {
            loadData(true);
            
            const handleUserUpdate = () => debouncedLoadData();
            const handleMsgUpdate = () => debouncedLoadData();
            const handleGroupsUpdate = () => debouncedLoadData();
            const handleGroupMsgsUpdate = () => debouncedLoadData();

            window.addEventListener('community_user_updated', handleUserUpdate);
            window.addEventListener('community_messages_updated', handleMsgUpdate);
            window.addEventListener('community_groups_updated', handleGroupsUpdate);
            window.addEventListener('community_group_messages_updated', handleGroupMsgsUpdate);

            return () => {
                if (loadDebounceTimerRef.current) clearTimeout(loadDebounceTimerRef.current);
                window.removeEventListener('community_user_updated', handleUserUpdate);
                window.removeEventListener('community_messages_updated', handleMsgUpdate);
                window.removeEventListener('community_groups_updated', handleGroupsUpdate);
                window.removeEventListener('community_group_messages_updated', handleGroupMsgsUpdate);
            };
        }
    }, [isOpen]);

    const showAdminToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

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
        return <span className="text-2xl leading-none select-none">💬</span>;
    };

    // Group Management Actions
    const handleSelectGroup = async (group: GroupChat) => {
        setSelectedGroup(group);
        setEditGroupName(group.name || '');
        setEditGroupDesc(group.description || '');
        setEditGroupAvatar(group.avatarUrl || '');
        setShowGroupOptionsDropdown(false);
        setSelectedMessageForDetails(null);
        setIsLoadingGroupMessages(true);
        try {
            await communityService.fetchLatestGroupMessages(group.groupId);
            const msgs = communityService.getGroupMessages(group.groupId);
            setGroupMessages(msgs);
        } catch (e) {
            console.error('Error loading group messages:', e);
        } finally {
            setIsLoadingGroupMessages(false);
        }
    };

    const handleAddMemberToGroup = async (targetUserId: string, username: string) => {
        if (!selectedGroup) return;
        try {
            await communityService.addMemberToGroup(selectedGroup.groupId, targetUserId);
            showAdminToast(`تمت إضافة "${username}" إلى المجموعة بنجاح 🌿`);
            const updated = communityService.getGroupById(selectedGroup.groupId);
            if (updated) setSelectedGroup(updated);
            loadData();
        } catch (e: any) {
            showAdminToast(e?.message || 'حدث خطأ أثناء إضافة العضو');
        }
    };

    const handleCopyGroupId = (gId: string) => {
        try {
            navigator.clipboard?.writeText(gId);
            setCopiedGroupId(true);
            setTimeout(() => setCopiedGroupId(false), 2000);
            showAdminToast('تم نسخ معرف المجموعة 📋');
        } catch {
            showAdminToast(gId);
        }
    };

    const executeDeleteGroup = async () => {
        if (!groupToDeleteConfirm) return;
        setIsDeletingGroup(true);
        try {
            const targetGid = groupToDeleteConfirm.groupId;
            const targetName = groupToDeleteConfirm.name || 'المجموعة';

            setGroups(prev => prev.filter(g => g.groupId !== targetGid));
            if (selectedGroup?.groupId === targetGid) {
                setSelectedGroup(null);
            }
            setGroupToDeleteConfirm(null);

            await communityService.adminDeleteGroup(targetGid);
            showAdminToast(`تم حذف مجموعة "${targetName}" وجميع محادثاتها بنجاح ✅`);
            loadData();
        } catch (e) {
            console.error('Error deleting group:', e);
            showAdminToast('حدث خطأ أثناء محاولة حذف المجموعة');
            loadData(true);
        } finally {
            setIsDeletingGroup(false);
        }
    };

    const executeDeleteGroupMessage = async () => {
        if (!msgToDeleteConfirm || !selectedGroup) return;
        setIsDeletingMsg(true);
        try {
            const mId = msgToDeleteConfirm.messageId;
            setGroupMessages(prev => prev.filter(m => m.messageId !== mId));
            setMsgToDeleteConfirm(null);

            await communityService.adminDeleteGroupMessage(mId);
            showAdminToast('تم حذف المحادثة من المجموعة بنجاح ✅');
            if (selectedGroup) {
                const refreshed = communityService.getGroupMessages(selectedGroup.groupId);
                setGroupMessages(refreshed);
            }
        } catch (e) {
            console.error('Error deleting group message:', e);
            showAdminToast('حدث خطأ أثناء حذف الرسالة');
        } finally {
            setIsDeletingMsg(false);
        }
    };

    const executeClearAllGroupMessages = async () => {
        if (!selectedGroup) return;
        setIsClearingGroupMsgs(true);
        try {
            setGroupMessages([]);
            setShowClearGroupMsgsConfirm(false);
            await communityService.adminClearGroupMessages(selectedGroup.groupId);
            showAdminToast('تم مسح جميع رسائل ومحادثات المجموعة بنجاح ✅');
        } catch (e) {
            console.error('Error clearing group messages:', e);
            showAdminToast('حدث خطأ أثناء مسح رسائل المجموعة');
        } finally {
            setIsClearingGroupMsgs(false);
        }
    };

    const executeRemoveMember = async () => {
        if (!memberToRemoveConfirm || !selectedGroup) return;
        setIsRemovingMember(true);
        try {
            const mId = memberToRemoveConfirm.userId;
            const mName = memberToRemoveConfirm.username;
            await communityService.adminRemoveMemberFromGroup(selectedGroup.groupId, mId);
            showAdminToast(`تمت إزالة العضو "${mName}" من المجموعة بنجاح ✅`);
            setMemberToRemoveConfirm(null);
            const updated = communityService.getGroupById(selectedGroup.groupId);
            if (updated) setSelectedGroup(updated);
            loadData();
        } catch (e) {
            console.error('Error removing member:', e);
            showAdminToast('حدث خطأ أثناء إزالة العضو');
        } finally {
            setIsRemovingMember(false);
        }
    };

    const handleSendAdminGroupMessage = async () => {
        if (!selectedGroup || !adminGroupMessageText.trim()) return;
        setIsSendingGroupMessage(true);
        try {
            await communityService.adminSendGroupMessage(selectedGroup.groupId, adminGroupMessageText.trim());
            setAdminGroupMessageText('');
            showAdminToast('تم إرسال الرسالة إلى المجموعة بنجاح 🛡️');
            const refreshed = communityService.getGroupMessages(selectedGroup.groupId);
            setGroupMessages(refreshed);
        } catch (e) {
            console.error('Error sending group message:', e);
            showAdminToast('حدث خطأ أثناء إرسال الرسالة');
        } finally {
            setIsSendingGroupMessage(false);
        }
    };

    const handleSaveGroupEdit = async () => {
        if (!selectedGroup || !editGroupName.trim()) return;
        setIsSavingGroupEdit(true);
        try {
            const updated = await communityService.adminUpdateGroup(selectedGroup.groupId, {
                name: editGroupName.trim(),
                description: editGroupDesc.trim(),
                avatarUrl: editGroupAvatar.trim()
            });
            setSelectedGroup(updated);
            showAdminToast('تم حفظ تعديلات المجموعة بنجاح 🌿');
            loadData();
        } catch (e: any) {
            showAdminToast(e?.message || 'حدث خطأ أثناء حفظ التعديلات');
        } finally {
            setIsSavingGroupEdit(false);
        }
    };

    const handleEnterGroupChat = (groupId: string) => {
        communityService.setAdminSession(true);
        onClose();
        if (onNavigate) {
            onNavigate('group-chat', { groupId, returnTab: 'community', adminMode: true });
        }
    };

    // Navigation: Open Inspector with precise back-tracking
    const openInspectorForUser = (user: CommunityUser, source?: NavigationSource) => {
        setInspectorReturnSource(source || {
            tab: activeTab,
            violatorUserId: selectedViolatorUserId,
            supportUserId: selectedUserForSupport
        });
        setSelectedInspectorUser(user);
        setActiveTab('users');
    };

    // Navigation: Close Inspector and restore previous exact tab and sub-selection
    const handleCloseInspector = () => {
        setSelectedInspectorUser(null);
        if (inspectorReturnSource) {
            setActiveTab(inspectorReturnSource.tab);
            if (inspectorReturnSource.violatorUserId !== undefined) {
                setSelectedViolatorUserId(inspectorReturnSource.violatorUserId);
            }
            if (inspectorReturnSource.supportUserId !== undefined) {
                setSelectedUserForSupport(inspectorReturnSource.supportUserId);
            }
            setInspectorReturnSource(null);
        }
    };

    // Navigation: Home click handles smart step-by-step back action
    const handleHomeClick = () => {
        // 1. If inside a group inspector, return to groups list
        if (selectedGroup) {
            setSelectedGroup(null);
            return;
        }
        // 2. If inside user inspector, return to previous inspector source
        if (selectedInspectorUser) {
            handleCloseInspector();
            return;
        }
        // 3. If inside user support chat, return to support list
        if (selectedUserForSupport) {
            setSelectedUserForSupport(null);
            return;
        }
        // 4. If inside violator reports, return to violations list
        if (selectedViolatorUserId) {
            setSelectedViolatorUserId(null);
            return;
        }
        // 5. If there is a tab history to step back through
        if (adminTabHistory.length > 1) {
            const nextHistory = [...adminTabHistory];
            nextHistory.pop();
            const prevTab = nextHistory[nextHistory.length - 1];
            setAdminTabHistory(nextHistory);
            setActiveTab(prevTab);
            return;
        }
        // 6. If currently on another tab than 'users', go to 'users' tab
        if (activeTab !== 'users') {
            setActiveTab('users');
            setAdminTabHistory(['users']);
            return;
        }
        // 7. At root of admin modal, close the modal
        onClose();
    };

    // Hardware & Gesture Back Button interceptor for step-by-step navigation
    useEffect(() => {
        if (!isOpen) return;
        const unregister = registerBackInterceptor(() => {
            if (selectedMessageForDetails) {
                setSelectedMessageForDetails(null);
                return true;
            }
            if (showManageMembersModal) {
                setShowManageMembersModal(false);
                return true;
            }
            if (showAddMembersModal) {
                setShowAddMembersModal(false);
                return true;
            }
            if (showGroupInfoModal) {
                setShowGroupInfoModal(false);
                return true;
            }
            if (showEditGroupModal) {
                setShowEditGroupModal(false);
                return true;
            }
            if (showCreateGroupModal) {
                setShowCreateGroupModal(false);
                return true;
            }
            if (showGroupOptionsDropdown) {
                setShowGroupOptionsDropdown(false);
                return true;
            }
            if (userToDeleteConfirm) {
                setUserToDeleteConfirm(null);
                return true;
            }
            if (groupToDeleteConfirm) {
                setGroupToDeleteConfirm(null);
                return true;
            }
            if (msgToDeleteConfirm) {
                setMsgToDeleteConfirm(null);
                return true;
            }
            if (showClearGroupMsgsConfirm) {
                setShowClearGroupMsgsConfirm(false);
                return true;
            }
            if (memberToRemoveConfirm) {
                setMemberToRemoveConfirm(null);
                return true;
            }
            if (messagingUser) {
                setMessagingUser(null);
                return true;
            }
            if (selectedGroup) {
                setSelectedGroup(null);
                return true;
            }
            handleHomeClick();
            return true;
        });
        return unregister;
    }, [isOpen, selectedGroup, selectedInspectorUser, selectedUserForSupport, selectedViolatorUserId, activeTab, adminTabHistory, userToDeleteConfirm, groupToDeleteConfirm, msgToDeleteConfirm, showClearGroupMsgsConfirm, memberToRemoveConfirm, messagingUser, selectedMessageForDetails, showManageMembersModal, showAddMembersModal, showGroupInfoModal, showEditGroupModal, showCreateGroupModal, showGroupOptionsDropdown]);

    const promptDeleteUser = (user: CommunityUser) => {
        setUserToDeleteConfirm(user);
    };

    const executeDeleteUser = async () => {
        if (!userToDeleteConfirm) return;
        setIsDeleting(true);
        try {
            const targetUid = userToDeleteConfirm.userId;
            const uName = userToDeleteConfirm.username || 'القارئ';

            // Optimistically remove user and messages from modal state immediately (0ms delay)
            setUsers(prev => prev.filter(u => u.userId !== targetUid));
            setServerMessages(prev => prev.filter(m => m.senderId !== targetUid && m.recipientId !== targetUid));
            setGroupMessages(prev => prev.filter(m => m.senderId !== targetUid));
            setUserToDeleteConfirm(null);
            setSelectedInspectorUser(null);
            setSelectedViolatorUserId(null);
            setSelectedUserForSupport(null);

            // Execute high-speed comprehensive batch deletion in Firestore
            await communityService.deleteUser(targetUid);
            showAdminToast(`تم حذف حساب القارئ "${uName}" ومسح جميع رسائله الخاصة وبالمجموعات نهائياً ✅`);
            loadData(false);
        } catch (e) {
            console.error('Error deleting user:', e);
            showAdminToast('حدث خطأ أثناء محاولة الحذف، يرجى المحاولة ثانية');
            loadData(true);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleImpersonate = (user: CommunityUser) => {
        communityService.impersonateUser(user);
        setSelectedInspectorUser(null);
        setSelectedUserForSupport(null);
        setSelectedViolatorUserId(null);
        setActiveTab('users');
        onClose();
    };

    const handleSendReply = async () => {
        if (!selectedUserForSupport || !replyText.trim()) return;
        setSendingReply(true);
        try {
            await communityService.sendAdminReply(selectedUserForSupport, replyText);
            setReplyText('');
            loadData();
        } catch (e) {
            console.error(e);
        } finally {
            setSendingReply(false);
        }
    };

    const handleSendBroadcast = async () => {
        if (!broadcastText.trim()) return;
        setIsSendingBroadcast(true);
        try {
            const sentCount = await communityService.sendBroadcastAdminMessage(broadcastText);
            setBroadcastText('');
            showAdminToast(`تم إرسال الرسالة الجماعية بنجاح إلى جميع القراء (${sentCount} قارئ) 🚀`);
            await loadData();
        } catch (e) {
            console.error('Error sending broadcast message:', e);
            showAdminToast('حدث خطأ أثناء إرسال الرسالة الجماعية');
        } finally {
            setIsSendingBroadcast(false);
        }
    };

    const handleDeleteViolationReport = async (messageId: string) => {
        try {
            await communityService.deleteSingleMessage(messageId);
            setServerMessages(prev => prev.filter(m => m.messageId !== messageId));
            showAdminToast('تم حذف البلاغ بنجاح ✅');
        } catch (e) {
            console.error('Error deleting violation message:', e);
            showAdminToast('حدث خطأ أثناء حذف البلاغ');
        }
    };

    const handleDeleteAllUserViolations = async (userId: string) => {
        try {
            const userReports = violationReports.filter(m => m.senderId === userId);
            for (const r of userReports) {
                await communityService.deleteSingleMessage(r.messageId);
            }
            setServerMessages(prev => prev.filter(m => !(m.senderId === userId && isViolationMessage(m))));
            setSelectedViolatorUserId(null);
            showAdminToast('تم حذف جميع بلاغات المستخدم بنجاح ✅');
        } catch (e) {
            console.error('Error deleting user violations:', e);
            showAdminToast('حدث خطأ أثناء حذف البلاغات');
        }
    };

    const handleClearSupportConversation = async (userId: string) => {
        try {
            await communityService.clearSupportConversation(userId);
            setServerMessages(prev => prev.filter(m => !(
                (m.senderId === userId && m.recipientId === ADMIN_USER_ID) || 
                (m.senderId === ADMIN_USER_ID && m.recipientId === userId) ||
                (m.chatId && m.chatId.includes(userId))
            )));
            await loadData();
            showAdminToast('تم حذف المحادثة بنجاح ✅');
        } catch (e) {
            console.error('Error clearing conversation:', e);
            showAdminToast('حدث خطأ أثناء حذف المحادثة');
        }
    };

    const handleDeleteBroadcastBatch = async (batchIdOrText: string) => {
        try {
            await communityService.deleteBroadcastBatch(batchIdOrText);
            await loadData();
            showAdminToast('تم حذف الرسالة الجماعية بنجاح ✅');
        } catch (e) {
            console.error('Error deleting broadcast message:', e);
            showAdminToast('حدث خطأ أثناء حذف الرسالة الجماعية');
        }
    };

    // Helper: is this a moderation/violation report?
    const isViolationMessage = (m: ChatMessage) => {
        return !!(
            m.isViolationReport || 
            m.messageId?.startsWith('msg_report_') || 
            m.text?.includes('[بلاغ آلي - محتوى محظور]')
        );
    };

    // 1. Separate regular Support messages (genuine user chats) from Violation reports
    const supportMessages = useMemo(() => {
        return serverMessages.filter(
            m => (m.recipientId === ADMIN_USER_ID || m.senderId === ADMIN_USER_ID) && !isViolationMessage(m)
        );
    }, [serverMessages]);

    // Group support messages by user
    const supportUserIds = useMemo(() => {
        return Array.from(new Set(
            supportMessages.map(m => m.senderId === ADMIN_USER_ID ? m.recipientId : m.senderId)
        )).filter(id => id && id !== ADMIN_USER_ID);
    }, [supportMessages]);

    // Helper to get robust user info
    const getUserData = (uid: string): CommunityUser => {
        const found = users.find(u => u.userId === uid) || communityService.getUserById(uid);
        if (found) return found;
        return {
            userId: uid,
            username: 'قارئ',
            accountCode: uid.startsWith('usr_') ? `MQ-${uid.substring(4, 9).toUpperCase()}` : uid,
            country: 'غير محدد 🌍',
            isOnline: false,
            createdAt: new Date().toISOString()
        };
    };

    // Parse raw violation report text cleanly
    const parseViolationText = (rawText: string, user?: CommunityUser, createdAt?: string, targetRecipientId?: string): ParsedViolationData => {
        const isPolitical = rawText.includes('سياسية') || rawText.includes('تحريضية');
        
        // Extract country
        const countryMatch = rawText.match(/•\s*الدولة:\s*([^\n\r]+)/);
        const country = countryMatch ? countryMatch[1].trim() : (user?.country || 'غير محدد 🌍');

        // Extract detected words
        const wordsMatch = rawText.match(/•\s*الكلمات المكتشفة:\s*([^\n\r]+)/);
        let detectedWords: string[] = [];
        if (wordsMatch) {
            detectedWords = wordsMatch[1].split(/[،,]/).map(w => w.trim()).filter(Boolean);
        }

        // Extract recipient user
        let recipientName = '';
        let recipientCode = '';
        const recipientMatch = rawText.match(/•\s*المرسل إليه(?:\s*\(المستلم\))?:\s*([^\n\r]+)/);
        if (recipientMatch) {
            const rawRecipient = recipientMatch[1].trim();
            const codeMatch = rawRecipient.match(/(.*?)\s*\(كود(?:\s*الحساب)?:\s*([^\)]+)\)/);
            if (codeMatch) {
                recipientName = codeMatch[1].trim();
                recipientCode = codeMatch[2].trim();
            } else {
                recipientName = rawRecipient;
            }
        } else if (targetRecipientId) {
            const targetUser = getUserData(targetRecipientId);
            recipientName = targetUser.username;
            recipientCode = targetUser.accountCode;
        }

        // Extract blocked message text
        let blockedText = '';
        const msgBlockMatch = rawText.match(/•\s*نص الرسالة المحجوبة:\s*[\r\n]+"?(.*?)"?(?=\s*•\s*الوقت:|$)/s);
        if (msgBlockMatch) {
            blockedText = msgBlockMatch[1].trim().replace(/^"|"$/g, '');
        } else {
            const lines = rawText.split('\n').filter(l => !l.startsWith('•') && !l.startsWith('⚠️') && !l.startsWith('تم حجب'));
            blockedText = lines.join(' ').trim().replace(/^"|"$/g, '') || rawText;
        }

        // Extract time
        const timeMatch = rawText.match(/•\s*الوقت:\s*([^\n\r]+)/);
        const timeString = timeMatch 
            ? timeMatch[1].trim() 
            : (createdAt ? new Date(createdAt).toLocaleString('ar-EG') : '');

        return {
            category: isPolitical ? 'political' : 'offensive',
            country,
            detectedWords,
            blockedText,
            recipientName: recipientName || undefined,
            recipientCode: recipientCode || undefined,
            timeString
        };
    };

    // 2. Violation Reports List
    const violationReports = useMemo(() => {
        return serverMessages
            .filter(m => isViolationMessage(m))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [serverMessages]);

    // Unique violating user IDs
    const violatingUserIds = useMemo(() => {
        const set = new Set<string>();
        violationReports.forEach(m => {
            if (m.senderId && m.senderId !== ADMIN_USER_ID) {
                set.add(m.senderId);
            }
        });
        return Array.from(set);
    }, [violationReports]);

    // Filtered list of violating users
    const filteredViolatingUserIds = useMemo(() => {
        return violatingUserIds.filter(uid => {
            const user = getUserData(uid);
            const userReports = violationReports.filter(m => m.senderId === uid);

            // Filter category
            if (violationFilter === 'offensive') {
                const hasOffensive = userReports.some(m => !m.text.includes('سياسية') && !m.text.includes('تحريضية'));
                if (!hasOffensive) return false;
            } else if (violationFilter === 'political') {
                const hasPolitical = userReports.some(m => m.text.includes('سياسية') || m.text.includes('تحريضية'));
                if (!hasPolitical) return false;
            }

            // Search query
            if (violationSearchQuery.trim()) {
                const q = violationSearchQuery.trim().toLowerCase();
                const userName = (user?.username || '').toLowerCase();
                const code = (user?.accountCode || '').toLowerCase();
                const hasTextMatch = userReports.some(m => m.text.toLowerCase().includes(q));
                return userName.includes(q) || code.includes(q) || hasTextMatch;
            }

            return true;
        });
    }, [violatingUserIds, violationReports, violationFilter, violationSearchQuery, users]);

    // Active violator user's reports
    const selectedViolatorReports = useMemo(() => {
        if (!selectedViolatorUserId) return [];
        return violationReports.filter(m => m.senderId === selectedViolatorUserId);
    }, [selectedViolatorUserId, violationReports]);

    // Count unread violations
    const unreadViolationsCount = useMemo(() => {
        return violationReports.filter(m => !m.isRead).length;
    }, [violationReports]);

    // Group broadcast batches
    const broadcastBatches = useMemo(() => {
        const map = new Map<string, { key: string; text: string; createdAt: string; count: number }>();
        serverMessages.forEach(m => {
            if (m.isBroadcast || (m.senderId === ADMIN_USER_ID && !m.isViolationReport && !m.messageId.startsWith('msg_report_'))) {
                const key = m.broadcastBatchId || m.text;
                if (!map.has(key)) {
                    map.set(key, {
                        key,
                        text: m.text,
                        createdAt: m.createdAt,
                        count: 1
                    });
                } else {
                    map.get(key)!.count++;
                }
            }
        });
        return Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [serverMessages]);

    // Filtered groups matching search query
    const filteredGroups = useMemo(() => {
        return groups.filter(g => {
            if (!groupSearchQuery.trim()) return true;
            const q = groupSearchQuery.trim().toLowerCase();
            return (g.name || '').toLowerCase().includes(q) || (g.description || '').toLowerCase().includes(q) || (g.groupId || '').toLowerCase().includes(q);
        });
    }, [groups, groupSearchQuery]);

    // Group Statistics for Info Tab
    const groupStats = useMemo(() => {
        if (!selectedGroup) return { totalMsgs: 0, verseMsgs: 0, audioMsgs: 0, mediaMsgs: 0, textMsgs: 0 };
        let verseMsgs = 0;
        let audioMsgs = 0;
        let mediaMsgs = 0;
        let textMsgs = 0;
        groupMessages.forEach(m => {
            if (m.verseData) verseMsgs++;
            else if (m.audioUrl) audioMsgs++;
            else if (m.attachment) mediaMsgs++;
            else textMsgs++;
        });
        return {
            totalMsgs: groupMessages.length,
            verseMsgs,
            audioMsgs,
            mediaMsgs,
            textMsgs
        };
    }, [selectedGroup, groupMessages]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1300] bg-white dark:bg-slate-950 flex flex-col animate-fadeIn overflow-hidden" dir="rtl" style={{ color: currentTheme.text }}>
            
            {/* Admin In-App Toast */}
            {toastMessage && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[1450] bg-emerald-600 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce border border-white/20">
                    <CheckCircle2 size={18} />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* In-App Delete Confirmation Modal (Native UI - No Window.confirm) */}
            {userToDeleteConfirm && (
                <div className="fixed inset-0 z-[1400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center animate-scaleUp">
                        <div className="w-16 h-16 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
                            <AlertTriangle size={34} />
                        </div>
                        
                        <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
                            تأكيد حذف الحساب ⚠️
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            هل أنت متأكد من رغبتك في حذف حساب القارئ <strong className="text-rose-600 dark:text-rose-400 underline font-bold">{userToDeleteConfirm.username || 'المستخدم'}</strong> نهائياً؟
                        </p>

                        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl text-[11px] text-rose-700 dark:text-rose-300 text-right leading-relaxed space-y-1">
                            <div>• سيتم مسح ملف الحساب بالكامل من السيرفر.</div>
                            <div>• سيتم حذف جميع رسائله الخاصة ورسائله بكل المجموعات نهائياً وكأنه لم يكن موجوداً.</div>
                            <div>• سيتم حذف جهات اتصاله وسجلاته وإحصائياته من السيرفر بالكامل.</div>
                        </div>

                        <div className="flex gap-2.5 pt-2">
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={executeDeleteUser}
                                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:opacity-50 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>جارٍ الحذف...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        <span>تأكيد الحذف</span>
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setUserToDeleteConfirm(null)}
                                className="py-3 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Direct Technical Support Message Modal */}
            {messagingUser && (
                <div className="fixed inset-0 z-[1400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 animate-scaleUp text-right" dir="rtl">
                        <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                                    <MessageSquarePlus size={22} />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                                        إرسال رسالة دعم فني ✉️
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        ستظهر هذه الرسالة مباشرة في محادثة الدعم الفني الخاصة بالمستخدم
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setMessagingUser(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* User Info Card */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs overflow-hidden">
                                    {messagingUser.avatarUrl ? (
                                        <img src={messagingUser.avatarUrl} alt={messagingUser.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{messagingUser.username ? messagingUser.username[0] : 'ق'}</span>
                                    )}
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-slate-900 dark:text-white">{messagingUser.username}</div>
                                    <div className="text-[11px] text-slate-400 font-mono">كود: {messagingUser.accountCode} • 🌍 {messagingUser.country || 'غير محدد'}</div>
                                </div>
                            </div>
                            <span className="text-[10px] px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full font-bold">
                                مستلم الرسالة
                            </span>
                        </div>

                        {/* Quick Templates */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                                نماذج رسائل سريعة (انقر للاختيار):
                            </label>
                            <div className="flex flex-col gap-1.5">
                                {[
                                    'تنبيه: نرجو الالتزام بآداب الحوار القرآني وتجنب الألفاظ غير اللائقة وفقاً لشروط الاستخدام.',
                                    'تحذير أخير: في حال تكرار إرسال رسائل مسيئة سيتم حظر حسابك نهائياً من التطبيق.',
                                    'السلام عليكم، تم رصد مخالفة في رسائلكم، نأمل التوضيح أو الالتزام بالضوابط الشرعية.'
                                ].map((tmpl, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setAdminDirectMessageText(tmpl)}
                                        className="text-[11px] bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-slate-300 hover:text-emerald-600 rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700 transition-all text-right leading-snug cursor-pointer"
                                    >
                                        {tmpl}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message Input */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                نص الرسالة:
                            </label>
                            <textarea
                                rows={4}
                                value={adminDirectMessageText}
                                onChange={(e) => setAdminDirectMessageText(e.target.value)}
                                placeholder="اكتب رسالتك أو التنبيه هنا..."
                                className="w-full p-3 text-xs sm:text-sm rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white resize-none"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                disabled={isSendingDirectMessage || !adminDirectMessageText.trim()}
                                onClick={handleSendDirectMessage}
                                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isSendingDirectMessage ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>جارٍ الإرسال...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={15} />
                                        <span>إرسال للدعم الفني</span>
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                disabled={isSendingDirectMessage}
                                onClick={() => setMessagingUser(null)}
                                className="py-3 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* In-App Delete Group Confirmation Modal */}
            {groupToDeleteConfirm && (
                <div className="fixed inset-0 z-[1400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center animate-scaleUp text-right" dir="rtl">
                        <div className="w-16 h-16 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
                            <Trash2 size={34} />
                        </div>
                        
                        <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white text-center">
                            تأكيد حذف المجموعة بالكامل ⚠️
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-center">
                            هل أنت متأكد من حذف مجموعة <strong className="text-rose-600 dark:text-rose-400 font-bold underline">"{groupToDeleteConfirm.name}"</strong> نهائياً من التطبيق؟
                        </p>

                        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl text-[11px] text-rose-700 dark:text-rose-300 text-right leading-relaxed space-y-1">
                            <div>• سيتم مسح المجموعة نهائياً من خادم التطبيق لجميع الأعضاء.</div>
                            <div>• سيتم مسح كافة الرسائل والمحادثات والصوتيات والمرفقات داخلها فوراً.</div>
                            <div>• يملك المشرف العام كامل الصلاحيات لحذف أي مجموعة منشأة.</div>
                        </div>

                        <div className="flex gap-2.5 pt-2">
                            <button
                                type="button"
                                disabled={isDeletingGroup}
                                onClick={executeDeleteGroup}
                                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:opacity-50 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isDeletingGroup ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>جارٍ حذف المجموعة...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        <span>تأكيد حذف المجموعة</span>
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                disabled={isDeletingGroup}
                                onClick={() => setGroupToDeleteConfirm(null)}
                                className="py-3 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* In-App Delete Single Group Message Modal */}
            {msgToDeleteConfirm && (
                <div className="fixed inset-0 z-[1400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4 animate-scaleUp text-right" dir="rtl">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 mx-auto flex items-center justify-center">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white text-center">
                            حذف هذه الرسالة من المجموعة؟ 🗑️
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                            سيتم حذف الرسالة نهائياً من محادثة المجموعة ولن تظهر لأي عضو.
                        </p>
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 line-clamp-3">
                            "{msgToDeleteConfirm.text || (msgToDeleteConfirm.verseData ? 'آية قرآنية' : msgToDeleteConfirm.audioUrl ? 'تسجيل صوتي' : 'مرفق')}"
                        </div>
                        <div className="flex gap-2 pt-1">
                            <button
                                type="button"
                                disabled={isDeletingMsg}
                                onClick={executeDeleteGroupMessage}
                                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md shadow-rose-600/20"
                            >
                                {isDeletingMsg ? 'جارٍ الحذف...' : 'حذف الرسالة'}
                            </button>
                            <button
                                type="button"
                                disabled={isDeletingMsg}
                                onClick={() => setMsgToDeleteConfirm(null)}
                                className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* In-App Clear All Group Messages Modal */}
            {showClearGroupMsgsConfirm && selectedGroup && (
                <div className="fixed inset-0 z-[1400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4 animate-scaleUp text-right" dir="rtl">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white text-center">
                            مسح جميع رسائل المجموعة؟ ⚠️
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                            سيتم مسح كافة الرسائل والمحادثات داخل مجموعة "{selectedGroup.name}" مع الإبقاء على المجموعة وأعضائها.
                        </p>
                        <div className="flex gap-2 pt-1">
                            <button
                                type="button"
                                disabled={isClearingGroupMsgs}
                                onClick={executeClearAllGroupMessages}
                                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md"
                            >
                                {isClearingGroupMsgs ? 'جارٍ المسح...' : 'تأكيد مسح الرسائل'}
                            </button>
                            <button
                                type="button"
                                disabled={isClearingGroupMsgs}
                                onClick={() => setShowClearGroupMsgsConfirm(false)}
                                className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* In-App Remove Member Modal */}
            {memberToRemoveConfirm && selectedGroup && (
                <div className="fixed inset-0 z-[1400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4 animate-scaleUp text-right" dir="rtl">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 mx-auto flex items-center justify-center">
                            <UserMinus size={24} />
                        </div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white text-center">
                            إزالة العضو من المجموعة؟
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                            هل تريد إزالة <strong className="text-slate-900 dark:text-white font-bold">"{memberToRemoveConfirm.username}"</strong> من مجموعة "{selectedGroup.name}"؟
                        </p>
                        <div className="flex gap-2 pt-1">
                            <button
                                type="button"
                                disabled={isRemovingMember}
                                onClick={executeRemoveMember}
                                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs cursor-pointer"
                            >
                                {isRemovingMember ? 'جارٍ الإزالة...' : 'تأكيد الإزالة'}
                            </button>
                            <button
                                type="button"
                                disabled={isRemovingMember}
                                onClick={() => setMemberToRemoveConfirm(null)}
                                className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sub-tabs & Return Button - Headerless Clean Full-Screen Layout */}
            <div 
                className="flex items-center border-b text-sm font-bold bg-white dark:bg-slate-900 px-3 py-2 shrink-0 shadow-sm gap-2" 
                style={{ 
                    borderColor: 'rgba(0,0,0,0.08)',
                    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)'
                }}
            >
                <div className="flex flex-1 items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl overflow-x-auto no-scrollbar">
                    {/* 1. Users Tab */}
                    <button 
                        onClick={() => switchAdminTab('users')}
                        className={`flex-1 py-2 px-2 text-center transition-all rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer ${
                            activeTab === 'users' 
                                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <span>إدارة المستخدمين</span>
                    </button>

                    {/* 2. Community / Groups Tab (المجتمع) */}
                    <button 
                        onClick={() => switchAdminTab('community')}
                        className={`flex-1 py-2 px-2 text-center transition-all rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer ${
                            activeTab === 'community' 
                                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Users size={14} className="opacity-80" />
                        <span>المجتمع</span>
                        {groups.length > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                activeTab === 'community' ? 'bg-indigo-600 text-white' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                            }`}>
                                {groups.length}
                            </span>
                        )}
                    </button>

                    {/* 3. Support Inbox Tab */}
                    <button 
                        onClick={() => switchAdminTab('support')}
                        className={`flex-1 py-2 px-2 text-center transition-all rounded-xl flex items-center justify-center gap-1.5 relative text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer ${
                            activeTab === 'support' 
                                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <span>وارد الدعم الفني</span>
                        {supportUserIds.length > 0 && (
                            <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                                {supportUserIds.length}
                            </span>
                        )}
                    </button>

                    {/* 4. Dedicated Violations / Flagged Offensive Messages Tab */}
                    <button 
                        onClick={() => switchAdminTab('violations')}
                        className={`flex-1 py-2 px-2 text-center transition-all rounded-xl flex items-center justify-center gap-1.5 relative text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer ${
                            activeTab === 'violations' 
                                ? 'bg-rose-500 text-white shadow-sm' 
                                : 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                        }`}
                    >
                        <span>الرسائل المسيئة والبلاغات</span>
                        {violationReports.length > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                activeTab === 'violations' ? 'bg-white text-rose-600' : 'bg-rose-50 text-white'
                            }`}>
                                {unreadViolationsCount > 0 ? unreadViolationsCount : violationReports.length}
                            </span>
                        )}
                    </button>

                    {/* 5. Broadcast Tab */}
                    <button 
                        onClick={() => switchAdminTab('broadcast')}
                        className={`flex-1 py-2 px-2 text-center transition-all rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer ${
                            activeTab === 'broadcast' 
                                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' 
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <span>إرسال جماعي 📢</span>
                    </button>
                </div>
            </div>

            {/* Main Full-Screen Layout Body */}
            <div 
                className="flex-1 overflow-hidden flex flex-col bg-slate-50/50 dark:bg-slate-950"
                style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 3.75rem + 1cm)' }}
            >
                
                {/* 1. USERS TAB */}
                {activeTab === 'users' && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {!selectedInspectorUser ? (
                            /* Users List Pane - Full screen width */
                            <div className="flex-1 flex flex-col overflow-y-auto p-4 w-full animate-fadeIn">
                                <div className="font-bold text-sm text-slate-500 dark:text-slate-400 mb-3">
                                    <span>قائمة القراء والمنضمين للتطبيق ({users.length})</span>
                                </div>

                                {users.length === 0 ? (
                                    <div className="text-center py-24 opacity-50 text-sm">لا يوجد مستخدمون مسجلون حالياً</div>
                                ) : (
                                    <div className={
                                        users.length > 100
                                            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"
                                            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5"
                                    }>
                                        {users.map((u) => {
                                            const isDense = users.length > 100;
                                            return (
                                                <button 
                                                    key={u.userId}
                                                    onClick={() => openInspectorForUser(u, { tab: 'users' })}
                                                    className={`${
                                                        isDense ? 'p-2.5 gap-2' : 'p-3.5 gap-3'
                                                    } rounded-2xl transition-all text-right flex items-center justify-between border bg-white dark:bg-slate-900 hover:bg-emerald-500/5 border-slate-200 dark:border-slate-800/60 shadow-xs cursor-pointer`}
                                                >
                                                    <div className={`flex items-center ${isDense ? 'gap-2' : 'gap-2.5'} min-w-0`}>
                                                        <div className={`${
                                                            isDense ? 'w-8 h-8' : 'w-10 h-10'
                                                        } rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0 overflow-hidden border border-emerald-500/15 shadow-xs`}>
                                                            {u.avatarUrl ? (
                                                                <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className={isDense ? "text-[10px]" : "text-xs"}>{u.username ? u.username[0] : 'ق'}</span>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className={`font-bold ${isDense ? 'text-xs' : 'text-xs sm:text-sm'} truncate leading-tight text-slate-900 dark:text-white`}>
                                                                {u.username || 'قارئ بدون اسم'}
                                                            </h4>
                                                            <div className={`${isDense ? 'text-[9px]' : 'text-[10px]'} opacity-70 mt-1 flex items-center gap-1 flex-wrap font-medium text-slate-600 dark:text-slate-400`}>
                                                                <span>🌍 {u.country || 'غير محدد'}</span>
                                                                <span>•</span>
                                                                <span className="font-mono">{u.accountCode}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        <span className={`w-2.5 h-2.5 rounded-full block ${u.isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300 dark:bg-slate-700"}`} />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* User Profile Inspector Pane */
                            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-y-auto p-5 sm:p-6 w-full animate-slideLeft">
                                
                                {/* Inspector Header */}
                                <div className="flex items-center justify-center mb-6 pb-4 border-b dark:border-slate-800">
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                                        معاينة وتحكم بالحساب
                                    </span>
                                </div>

                                {/* Simulated User Profile Screen */}
                                <div className="max-w-xl mx-auto w-full space-y-3">
                                    
                                    {/* Minimized Compact Avatar Card */}
                                    <div className="flex flex-col items-center text-center p-3 sm:p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border dark:border-slate-800 relative shadow-sm">
                                        <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-md mb-2">
                                            {selectedInspectorUser.avatarUrl ? (
                                                <img src={selectedInspectorUser.avatarUrl} alt={selectedInspectorUser.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{selectedInspectorUser.username ? selectedInspectorUser.username[0] : 'ق'}</span>
                                            )}
                                        </div>
                                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                                            <span>{selectedInspectorUser.username || 'قارئ بدون اسم'}</span>
                                            <span className={`w-2.5 h-2.5 rounded-full inline-block ${selectedInspectorUser.isOnline ? "bg-emerald-500" : "bg-slate-400"}`} />
                                        </h3>
                                        <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedInspectorUser.accountCode}</p>
                                    </div>

                                    {/* Info Grid Cards - Compact List Style */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border dark:border-slate-800 flex items-center gap-2">
                                            <Globe size={15} className="text-emerald-500 shrink-0" />
                                            <div className="text-right overflow-hidden">
                                                <div className="text-[10px] opacity-60">الدولة</div>
                                                <div className="font-bold text-xs truncate">{selectedInspectorUser.country || 'غير محدد'}</div>
                                            </div>
                                        </div>
                                        <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border dark:border-slate-800 flex items-center gap-2">
                                            <Activity size={15} className="text-emerald-500 shrink-0" />
                                            <div className="text-right overflow-hidden">
                                                <div className="text-[10px] opacity-60">حالة الاتصال</div>
                                                <div className="font-bold text-xs truncate">{selectedInspectorUser.isOnline ? 'متصل الآن 🟢' : 'غير متصل'}</div>
                                            </div>
                                        </div>
                                        <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border dark:border-slate-800 flex items-center gap-2">
                                            <Calendar size={15} className="text-emerald-500 shrink-0" />
                                            <div className="text-right overflow-hidden">
                                                <div className="text-[10px] opacity-60">تاريخ الانضمام</div>
                                                <div className="font-bold text-xs truncate">{new Date(selectedInspectorUser.createdAt).toLocaleDateString('ar-EG')}</div>
                                            </div>
                                        </div>
                                        <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border dark:border-slate-800 flex items-center gap-2">
                                            <UserCheck size={15} className="text-emerald-500 shrink-0" />
                                            <div className="text-right overflow-hidden">
                                                <div className="text-[10px] opacity-60">نوع الحساب</div>
                                                <div className="font-bold text-xs truncate">قارئ مسجل</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-2 flex flex-col gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openSendMessageModal(selectedInspectorUser)}
                                            className="w-full py-3 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-98 text-emerald-700 dark:text-emerald-300 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border border-emerald-500/25 cursor-pointer"
                                        >
                                            <MessageSquarePlus size={16} />
                                            <span>إرسال رسالة دعم فني للمستخدم</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleImpersonate(selectedInspectorUser)}
                                            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <Eye size={16} />
                                            <span>الدخول للحساب وتصفحه</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => promptDeleteUser(selectedInspectorUser)}
                                            className="w-full py-3 px-4 bg-rose-500/10 hover:bg-rose-500/20 active:scale-98 text-rose-600 dark:text-rose-400 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border border-rose-500/20 cursor-pointer"
                                        >
                                            <UserMinus size={16} />
                                            <span>حذف الحساب</span>
                                        </button>
                                    </div>

                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 2. SUPPORT INBOX TAB (Genuine User Inquiries Only) */}
                {activeTab === 'support' && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {!selectedUserForSupport ? (
                            /* Support User List */
                            <div className="flex-1 flex flex-col overflow-y-auto p-4 w-full animate-fadeIn">
                                
                                <div className="font-bold text-sm text-slate-500 dark:text-slate-400 mb-3">
                                    <span>صندوق الوارد (رسائل واستفسارات المستخدمين):</span>
                                </div>

                                {supportUserIds.length === 0 ? (
                                    <div className="text-center py-24 opacity-50 text-sm space-y-2">
                                        <Mail size={32} className="mx-auto opacity-40 mb-2" />
                                        <div>لا توجد رسائل دعم فني أو استفسارات حالياً</div>
                                        <p className="text-xs opacity-75">رسائل المخالفات والبلاغات معزولة في تبويبها الخاص.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                        {supportUserIds.map((uid) => {
                                            const user = getUserData(uid);
                                            const userMsgCount = supportMessages.filter(m => m.senderId === uid && !m.isRead).length;

                                            return (
                                                <button
                                                    key={uid}
                                                    onClick={() => {
                                                        setSelectedUserForSupport(uid);
                                                        communityService.markMessagesAsRead(uid);
                                                    }}
                                                    className="p-3.5 rounded-2xl transition-all text-right flex items-center justify-between gap-3 border bg-white dark:bg-slate-900 hover:bg-emerald-500/5 border-slate-200 dark:border-slate-800/60 shadow-xs cursor-pointer group"
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0 overflow-hidden border border-emerald-500/15 shadow-xs">
                                                            {user?.avatarUrl ? (
                                                                <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-xs">{user?.username ? user.username[0] : 'ق'}</span>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="font-bold text-xs sm:text-sm truncate leading-tight text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                                                {user?.username || 'قارئ بدون اسم'}
                                                            </h4>
                                                            <div className="text-[10px] opacity-70 mt-1 flex items-center gap-1.5 flex-wrap font-medium text-slate-600 dark:text-slate-400">
                                                                <span>🌍 {user?.country || 'غير محدد'}</span>
                                                                <span>•</span>
                                                                <span className="font-mono">{user?.accountCode}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        {/* Messages count badge (only unread) */}
                                                        {userMsgCount > 0 && (
                                                            <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex-shrink-0 min-w-5 text-center shadow-sm">
                                                                {userMsgCount}
                                                            </span>
                                                        )}
                                                        <span className={`w-2.5 h-2.5 rounded-full block ${user?.isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300 dark:bg-slate-700"}`} />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Chat Thread & Reply interface */
                            <div className="flex-1 flex flex-col justify-between overflow-hidden bg-white dark:bg-slate-900 p-4 sm:p-5 w-full animate-slideLeft">
                                
                                {/* Support Chat Header */}
                                <div className="flex items-center justify-between mb-4 pb-3 border-b dark:border-slate-800 flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                        {(() => {
                                            const targetUser = getUserData(selectedUserForSupport);
                                            return (
                                                <div 
                                                    onClick={() => openInspectorForUser(targetUser, { tab: 'support', supportUserId: selectedUserForSupport })}
                                                    className="flex items-center gap-2.5 mr-2 cursor-pointer hover:opacity-80 transition-opacity"
                                                    title="انقر لمعاينة الحساب"
                                                >
                                                    <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs overflow-hidden border border-emerald-500/15 shadow-xs">
                                                        {targetUser.avatarUrl ? (
                                                            <img src={targetUser.avatarUrl} alt={targetUser.username} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span>{targetUser.username ? targetUser.username[0] : 'ق'}</span>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                                                            <span>{targetUser.username || 'قارئ'}</span>
                                                            <span className={`w-2 h-2 rounded-full inline-block ${targetUser.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 font-mono">
                                                            {targetUser.accountCode} • {targetUser.country || 'غير محدد'}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Action: Clear Conversation */}
                                    <button
                                        onClick={() => handleClearSupportConversation(selectedUserForSupport)}
                                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                        title="حذف المحادثة"
                                    >
                                        <Trash2 size={13} />
                                        <span>حذف المحادثة</span>
                                    </button>
                                </div>

                                <div className="flex-1 flex flex-col justify-between overflow-hidden">
                                    <div className="flex-1 overflow-y-auto space-y-3 p-3 border rounded-2xl bg-slate-50 dark:bg-slate-950/40 mb-3 max-w-3xl mx-auto w-full">
                                        {supportMessages
                                            .filter(m => m.senderId === selectedUserForSupport || m.recipientId === selectedUserForSupport)
                                            .map((m) => {
                                                const isAdmin = m.senderId === ADMIN_USER_ID;

                                                return (
                                                    <div 
                                                        key={m.messageId}
                                                        className={`flex flex-col max-w-[85%] p-3.5 rounded-2xl text-xs group relative ${
                                                            isAdmin 
                                                                ? 'bg-emerald-600 text-white mr-auto rounded-tl-none' 
                                                                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 ml-auto rounded-tr-none border dark:border-slate-800 shadow-xs'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <div className="font-extrabold">
                                                                {isAdmin ? 'إدارة التطبيق (Admin)' : (getUserData(selectedUserForSupport).username || 'المستخدم')}
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteViolationReport(m.messageId)}
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-300 hover:text-rose-400 rounded-md cursor-pointer"
                                                                title="حذف الرسالة"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                        <p className="break-words font-medium text-sm leading-relaxed">{m.text}</p>
                                                        <span className="text-[8px] opacity-50 block text-left mt-1 font-mono">
                                                            {new Date(m.createdAt).toLocaleTimeString('ar-EG')}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                    </div>

                                    {/* Reply Box */}
                                    <div className="flex gap-2.5 items-center max-w-3xl mx-auto w-full">
                                        <input 
                                            type="text"
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleSendReply(); }}
                                            placeholder="اكتب رد كـ Admin وإدارة التطبيق..."
                                            className="flex-1 px-4 py-3.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white text-slate-900 dark:text-white"
                                        />
                                        <button
                                            onClick={handleSendReply}
                                            disabled={sendingReply || !replyText.trim()}
                                            className="px-5 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 active:scale-95 shadow-sm cursor-pointer"
                                        >
                                            <span>رد كـ Admin</span>
                                            <Send size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. DEDICATED VIOLATIONS & OFFENSIVE MESSAGES TAB */}
                {activeTab === 'violations' && (
                    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/70 dark:bg-slate-950 p-4 sm:p-6">
                        
                        {!selectedViolatorUserId ? (
                            /* --- View A: Violating Users Grouped List --- */
                            <div className="flex-1 flex flex-col overflow-hidden">
                                
                                {/* Violations Header Controls */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b dark:border-slate-800">
                                    <div>
                                        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                            <span className="text-rose-500">🚨</span>
                                            <span>الرسائل المسيئة</span>
                                            <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
                                                {violatingUserIds.length} مستخدم مخالف ({violationReports.length} بلاغ)
                                            </span>
                                        </h3>
                                    </div>

                                    {/* Filter Pills */}
                                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs self-stretch sm:self-auto">
                                        <button
                                            onClick={() => setViolationFilter('all')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                violationFilter === 'all' 
                                                    ? 'bg-rose-500 text-white shadow-xs' 
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            الكل ({violatingUserIds.length})
                                        </button>
                                        <button
                                            onClick={() => setViolationFilter('offensive')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                violationFilter === 'offensive' 
                                                    ? 'bg-rose-500 text-white shadow-xs' 
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            🚫 مسيئة
                                        </button>
                                        <button
                                            onClick={() => setViolationFilter('political')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                violationFilter === 'political' 
                                                    ? 'bg-amber-500 text-white shadow-xs' 
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            ⚠️ سياسية
                                        </button>
                                    </div>
                                </div>

                                {/* Search in violations */}
                                <div className="mt-3 mb-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={violationSearchQuery}
                                            onChange={(e) => setViolationSearchQuery(e.target.value)}
                                            placeholder="بحث باسم المستخدم المخالف، المستلم، كود الحساب، أو نص الرسالة..."
                                            className="w-full pl-4 pr-10 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                                        />
                                        <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>

                                {/* Grouped Violators Grid */}
                                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                                    {filteredViolatingUserIds.length === 0 ? (
                                        <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/80 p-8 space-y-3">
                                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
                                                <CheckCircle2 size={36} />
                                            </div>
                                            <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
                                                لا توجد بلاغات أو رسائل مسيئة مسجلة حالياً
                                            </h4>
                                            <p className="text-xs text-slate-400 max-w-md mx-auto">
                                                جميع البلاغات محفوظة ولا تُحذف إلا بطلبك اليدوي.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                            {filteredViolatingUserIds.map((uid) => {
                                                const user = getUserData(uid);
                                                const userReports = violationReports.filter(m => m.senderId === uid);
                                                const count = userReports.length;
                                                const latestReport = userReports[0];
                                                const latestParsed = latestReport ? parseViolationText(latestReport.text, user, latestReport.createdAt, latestReport.targetRecipientId) : null;

                                                return (
                                                    <button
                                                        key={uid}
                                                        onClick={() => setSelectedViolatorUserId(uid)}
                                                        className="p-3.5 rounded-2xl transition-all text-right flex items-center justify-between gap-3 border bg-white dark:bg-slate-900 hover:bg-rose-500/5 border-rose-200/80 dark:border-rose-950 shadow-xs cursor-pointer group"
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold flex-shrink-0 overflow-hidden border border-rose-500/20 shadow-xs">
                                                                {user?.avatarUrl ? (
                                                                    <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="text-xs">{user?.username ? user.username[0] : 'ق'}</span>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h4 className="font-bold text-xs sm:text-sm truncate leading-tight text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
                                                                    {user?.username || 'قارئ بدون اسم'}
                                                                </h4>
                                                                <div className="text-[10px] opacity-70 mt-1 flex items-center gap-1.5 flex-wrap font-medium text-slate-600 dark:text-slate-400">
                                                                    <span>🌍 {user?.country || 'غير محدد'}</span>
                                                                    <span>•</span>
                                                                    <span className="font-mono">{user?.accountCode}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                                            <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                                                                {count} {count === 1 ? 'مخالفة' : 'مخالفات'} 🚨
                                                            </span>
                                                            {latestParsed && (
                                                                <span className="text-[9px] text-slate-400 font-mono">
                                                                    {latestParsed.timeString.split(' ')[0] || ''}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* --- View B: Detailed User's Violations (Drill-down compact view with intended recipient) --- */
                            <div className="flex-1 flex flex-col overflow-hidden animate-slideLeft">
                                
                                {(() => {
                                    const violatorUser = getUserData(selectedViolatorUserId);
                                    
                                    return (
                                        <>
                                            {/* Drill-down Header */}
                                            <div className="flex items-center justify-between gap-3 pb-3 border-b dark:border-slate-800 mb-3 flex-wrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-2 mr-2">
                                                        <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold text-xs overflow-hidden border border-rose-500/20 shadow-xs">
                                                            {violatorUser.avatarUrl ? (
                                                                <img src={violatorUser.avatarUrl} alt={violatorUser.username} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span>{violatorUser.username ? violatorUser.username[0] : 'ق'}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                                                                <span>{violatorUser.username}</span>
                                                                <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] px-2 py-0.2 rounded-full font-bold">
                                                                    ({selectedViolatorReports.length} مخالفة)
                                                                </span>
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 font-mono">
                                                                كود: {violatorUser.accountCode} • 🌍 {violatorUser.country || 'غير محدد'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions on violator user */}
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <button
                                                        onClick={() => openSendMessageModal(violatorUser)}
                                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                                                        title="إرسال رسالة للمستخدم عبر الدعم الفني"
                                                    >
                                                        <MessageSquarePlus size={13} />
                                                        <span>مراسلة المستخدم ✉️</span>
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteAllUserViolations(violatorUser.userId)}
                                                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                                        title="حذف جميع بلاغات هذا المستخدم"
                                                    >
                                                        <Trash2 size={13} />
                                                        <span>حذف كل البلاغات</span>
                                                    </button>

                                                    <button
                                                        onClick={() => openInspectorForUser(violatorUser, { tab: 'violations', violatorUserId: selectedViolatorUserId })}
                                                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                                        title="معاينة وتحكم بالحساب"
                                                    >
                                                        <Eye size={13} />
                                                        <span>معاينة الحساب</span>
                                                    </button>

                                                    <button
                                                        onClick={() => promptDeleteUser(violatorUser)}
                                                        className="px-3 py-1.5 bg-rose-500 text-white hover:bg-rose-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                                                        title="حذف الحساب"
                                                    >
                                                        <UserMinus size={13} />
                                                        <span>حذف الحساب</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Compact Cards List */}
                                            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-w-3xl mx-auto w-full">
                                                {selectedViolatorReports.length === 0 ? (
                                                    <div className="text-center py-20 text-slate-400 text-xs">
                                                        تم حذف جميع بلاغات هذا المستخدم بنجاح.
                                                    </div>
                                                ) : (
                                                    selectedViolatorReports.map((report) => {
                                                        const parsed = parseViolationText(report.text, violatorUser, report.createdAt, report.targetRecipientId);

                                                        return (
                                                            <div 
                                                                key={report.messageId}
                                                                className="bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-950/80 rounded-2xl p-3 sm:p-3.5 shadow-xs space-y-2.5 transition-all hover:border-rose-400 dark:hover:border-rose-800 animate-fadeIn text-xs"
                                                            >
                                                                {/* Top Info Row: Type, Country, Time, and Delete Button */}
                                                                <div className="flex items-center justify-between gap-2 border-b dark:border-slate-800/80 pb-2">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                                                                            parsed.category === 'political'
                                                                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                                                                                : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
                                                                        }`}>
                                                                            <span>{parsed.category === 'political' ? '⚠️ سياسية' : '🚫 ألفاظ مسيئة'}</span>
                                                                        </span>

                                                                        {/* Country */}
                                                                        <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                                                                            🌍 {parsed.country}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center gap-1.5">
                                                                        {/* Time */}
                                                                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                                                                            <Clock size={11} />
                                                                            {parsed.timeString}
                                                                        </span>

                                                                        {/* Message violator button */}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => openSendMessageModal(violatorUser)}
                                                                            className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-lg transition-all cursor-pointer bg-emerald-500/10 flex items-center gap-1"
                                                                            title="إرسال رسالة لهذا المستخدم تظهر له في الدعم الفني"
                                                                        >
                                                                            <MessageSquarePlus size={14} />
                                                                        </button>

                                                                        {/* Delete single report */}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleDeleteViolationReport(report.messageId)}
                                                                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                                                                            title="حذف هذا البلاغ"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* Row 2: Intended Recipient & Detected Words */}
                                                                <div className="flex items-center justify-between gap-2 flex-wrap text-[11px] pt-0.5">
                                                                    {/* Intended Recipient User Active Button */}
                                                                    {(() => {
                                                                        const targetRecipientUser = (() => {
                                                                            if (report.targetRecipientId) {
                                                                                return getUserData(report.targetRecipientId);
                                                                            }
                                                                            if (parsed.recipientCode) {
                                                                                const found = users.find(u => u.accountCode === parsed.recipientCode);
                                                                                if (found) return found;
                                                                            }
                                                                            if (parsed.recipientName) {
                                                                                const found = users.find(u => u.username === parsed.recipientName);
                                                                                if (found) return found;
                                                                            }
                                                                            return null;
                                                                        })();

                                                                        if (parsed.recipientName) {
                                                                            return (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        if (targetRecipientUser) {
                                                                                            openInspectorForUser(targetRecipientUser, {
                                                                                                tab: 'violations',
                                                                                                violatorUserId: selectedViolatorUserId
                                                                                            });
                                                                                        } else {
                                                                                            showAdminToast('لم يتم العثور على ملف المستخدم');
                                                                                        }
                                                                                    }}
                                                                                    className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition-all cursor-pointer active:scale-95 shadow-2xs group"
                                                                                    title="انقر للدخول إلى حساب المرسل إليه مباشرة"
                                                                                >
                                                                                    <span className="text-slate-500 dark:text-slate-400 font-bold text-[10px]">المرسل إليه:</span>
                                                                                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 underline underline-offset-2 flex items-center gap-1">
                                                                                        <span>{parsed.recipientName}</span>
                                                                                        <Eye size={12} className="opacity-70 group-hover:opacity-100" />
                                                                                    </span>
                                                                                    {parsed.recipientCode && (
                                                                                        <span className="text-[10px] font-mono opacity-80 font-bold">({parsed.recipientCode})</span>
                                                                                    )}
                                                                                </button>
                                                                            );
                                                                        }

                                                                        return (
                                                                            <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                                                                                <span>المرسل إليه:</span>
                                                                                <span className="font-medium text-slate-500">محادثة خاصة</span>
                                                                            </div>
                                                                        );
                                                                    })()}

                                                                    {/* Detected words */}
                                                                    {parsed.detectedWords.length > 0 && (
                                                                        <div className="flex items-center gap-1 flex-wrap">
                                                                            <span className="text-[10px] text-slate-400 font-bold">الكلمات:</span>
                                                                            {parsed.detectedWords.map((word, idx) => (
                                                                                <span 
                                                                                    key={idx}
                                                                                    className="bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 text-[11px] font-bold px-2 py-0.5 rounded-md font-mono"
                                                                                >
                                                                                    {word}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Blocked message */}
                                                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-2">
                                                                    <span className="text-[10px] font-bold text-slate-400 flex-shrink-0 mt-0.5">نص الرسالة:</span>
                                                                    <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white break-words flex-1 leading-snug">
                                                                        "{parsed.blockedText}"
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                )}

                {/* 4. BROADCAST TAB */}
                {activeTab === 'broadcast' && (
                    <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 w-full max-w-3xl mx-auto animate-fadeIn space-y-6">
                        
                        {/* New Broadcast Card */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
                            
                            {/* Header Title */}
                            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                                    <Megaphone size={22} />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                                        إرسال رسالة جماعية رسمية لجميع القراء
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        ستصل الرسالة مباشرة إلى صندوق محادثة الدعم الفني لـ <strong className="text-emerald-600 font-bold">{users.length} قارئ مسجل</strong>.
                                    </p>
                                </div>
                            </div>

                            {/* Message Textarea */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                    نص الرسالة الجماعية:
                                </label>
                                <textarea
                                    rows={5}
                                    value={broadcastText}
                                    onChange={(e) => setBroadcastText(e.target.value)}
                                    placeholder="اكتب التنبيه، أو التهنئة، أو الرسالة الجماعية التي ترغب في إرسالها لجميع المستخدمين دفعة واحدة..."
                                    className="w-full p-4 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 dark:text-white leading-relaxed resize-y"
                                />
                            </div>

                            {/* Send Broadcast Button */}
                            <div className="pt-1">
                                <button
                                    type="button"
                                    disabled={isSendingBroadcast || !broadcastText.trim() || users.length === 0}
                                    onClick={handleSendBroadcast}
                                    className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-40 text-white rounded-2xl font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {isSendingBroadcast ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>جارٍ إرسال الرسالة الجماعية لـ ({users.length}) مستخدم...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            <span>إرسال جماعي لجميع المستخدمين ({users.length} مستخدم) 🚀</span>
                                        </>
                                    )}
                                </button>
                            </div>

                        </div>

                        {/* Broadcast History & Server Deletion Section */}
                        {broadcastBatches.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800">
                                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                                        <span>سجل الرسائل الجماعية ({broadcastBatches.length})</span>
                                    </h4>
                                    <span className="text-xs text-slate-400">
                                        الحذف يحذف الرسالة من صناديق المستلمين نهائياً
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {broadcastBatches.map((batch) => (
                                        <div 
                                            key={batch.key}
                                            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                                        >
                                            <div className="space-y-1.5 flex-1 min-w-0">
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={11} />
                                                        {new Date(batch.createdAt).toLocaleString('ar-EG')}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold font-sans">
                                                        أُرسلت لـ {batch.count} مستخدم
                                                    </span>
                                                </div>
                                                <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed break-words whitespace-pre-wrap">
                                                    {batch.text}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => handleDeleteBroadcastBatch(batch.key)}
                                                className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-all flex items-center gap-1 font-bold text-xs flex-shrink-0 cursor-pointer"
                                                title="حذف الرسالة الجماعية"
                                            >
                                                <Trash2 size={15} />
                                                <span className="hidden sm:inline">حذف</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                )}

                {/* 2. COMMUNITY / GROUPS MANAGEMENT TAB (المجتمع) */}
                {activeTab === 'community' && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {!selectedGroup ? (
                            /* --- Groups Grid List (Matching User Community Tab Exactly) --- */
                            <div className="flex-1 flex flex-col overflow-y-auto p-3.5 sm:p-5 w-full animate-fadeIn space-y-3.5">
                                {/* Header: Groups count & Create Group Button */}
                                <div className="flex items-center justify-between gap-2 p-1">
                                    <div className="flex items-center gap-2">
                                        <Users size={18} className="text-indigo-600 dark:text-indigo-400" />
                                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                            المحادثات وحلقات المجتمع ({filteredGroups.length})
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setShowCreateGroupModal(true)}
                                        className="px-3.5 py-2 rounded-2xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0 active:scale-95 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white"
                                        title="إنشاء محادثة جماعية جديدة"
                                    >
                                        <Users size={14} />
                                        <span>+ إنشاء مجموعة</span>
                                    </button>
                                </div>

                                {/* Search Bar */}
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={groupSearchQuery}
                                            onChange={(e) => setGroupSearchQuery(e.target.value)}
                                            placeholder="ابحث في المحادثات الجماعية والمجموعات..."
                                            className="w-full pr-10 pl-10 py-2.5 rounded-2xl border text-xs sm:text-sm font-medium focus:outline-none transition-all shadow-2xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                                        />
                                        {groupSearchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => setGroupSearchQuery('')}
                                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => loadData(true)}
                                        className="p-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                                        title="تحديث قائمة المجموعات"
                                    >
                                        <RefreshCw size={15} />
                                    </button>
                                </div>

                                {/* Groups Grid - Identical to User Community Tab */}
                                {filteredGroups.length === 0 ? (
                                    <div className="text-center py-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-2">
                                        <Users size={36} className="mx-auto text-slate-400 opacity-40" />
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                            {groupSearchQuery ? 'لا توجد مجموعات مطابقة للبحث' : 'لا توجد محادثات جماعية حالياً'}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateGroupModal(true)}
                                            className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm inline-flex items-center gap-1.5 active:scale-95 cursor-pointer"
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
                                                onClick={() => handleSelectGroup(grp)}
                                                className="border rounded-2xl p-3 flex items-center gap-2.5 cursor-pointer transition-all shadow-2xs hover:shadow-md active:scale-95 group text-right bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500/50"
                                                title={cleanGroupName(grp.name)}
                                            >
                                                <div 
                                                    className="w-10 h-10 rounded-xl font-bold flex items-center justify-center border overflow-hidden flex-shrink-0 text-lg shadow-inner group-hover:scale-105 transition-transform bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                                                >
                                                    {renderGroupAvatar(grp)}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-bold text-xs sm:text-sm truncate leading-snug text-slate-900 dark:text-white">
                                                        {cleanGroupName(grp.name)}
                                                    </h3>
                                                    <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                                                        {grp.members?.length || 1} عضو
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* --- Selected Group Chat View (Matching Group Chat Page Exactly) --- */
                            <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900 animate-slideLeft">
                                {/* Group Chat Header */}
                                <div className="p-3 sm:p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-2 relative z-30 shadow-2xs">
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedGroup(null)}
                                            className="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95 cursor-pointer shrink-0"
                                            title="العودة لقائمة المجموعات"
                                        >
                                            <ChevronRight size={18} />
                                        </button>

                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-indigo-500/20 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold text-lg overflow-hidden shrink-0 shadow-inner">
                                            {renderGroupAvatar(selectedGroup)}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                                {cleanGroupName(selectedGroup.name)}
                                            </h3>
                                            <p className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 font-medium">
                                                <span>{selectedGroup.members?.length || 1} عضو</span>
                                                <span>•</span>
                                                <span>{groupMessages.length} رسالة</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* 3-dots Menu Button */}
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setShowGroupOptionsDropdown(prev => !prev)}
                                            className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95 cursor-pointer"
                                            title="خيارات وعناصر التحكم بالمجموعة"
                                        >
                                            <MoreVertical size={17} />
                                        </button>

                                        {/* 3-dots Dropdown Menu (All Group Controls) */}
                                        {showGroupOptionsDropdown && (
                                            <>
                                                <div 
                                                    className="fixed inset-0 z-40 bg-transparent"
                                                    onClick={() => setShowGroupOptionsDropdown(false)}
                                                />
                                                <div className="absolute left-0 top-11 w-52 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-1.5 z-50 text-xs font-bold space-y-0.5 animate-scaleUp text-right" dir="rtl">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowGroupOptionsDropdown(false);
                                                            setShowGroupInfoModal(true);
                                                        }}
                                                        className="w-full flex items-center gap-2 p-2 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                                                    >
                                                        <Info size={15} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                                                        <span>معلومات وإحصائيات المجموعة</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowGroupOptionsDropdown(false);
                                                            setEditGroupName(selectedGroup.name || '');
                                                            setEditGroupDesc(selectedGroup.description || '');
                                                            setEditGroupAvatar(selectedGroup.avatarUrl || '');
                                                            setShowEditGroupModal(true);
                                                        }}
                                                        className="w-full flex items-center gap-2 p-2 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                                                    >
                                                        <Edit3 size={15} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                                                        <span>تعديل بيانات المجموعة</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowGroupOptionsDropdown(false);
                                                            setManageMemberSearch('');
                                                            setShowManageMembersModal(true);
                                                        }}
                                                        className="w-full flex items-center gap-2 p-2 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                                                    >
                                                        <Users size={15} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                                                        <span>إدارة وأعضاء المجموعة ({selectedGroup.members?.length || 1})</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowGroupOptionsDropdown(false);
                                                            setAddMemberSearch('');
                                                            setShowAddMembersModal(true);
                                                        }}
                                                        className="w-full flex items-center gap-2 p-2 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                                                    >
                                                        <UserPlus size={15} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                                                        <span>إضافة أعضاء جدد</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowGroupOptionsDropdown(false);
                                                            handleCopyGroupId(selectedGroup.groupId);
                                                        }}
                                                        className="w-full flex items-center gap-2 p-2 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                                                    >
                                                        <Copy size={15} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                                                        <span>نسخ معرّف المجموعة</span>
                                                    </button>

                                                    {onNavigate && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setShowGroupOptionsDropdown(false);
                                                                onClose();
                                                                onNavigate('group-chat', { groupId: selectedGroup.groupId, returnTab: 'community', initialTab: 'community' });
                                                            }}
                                                            className="w-full flex items-center gap-2 p-2 rounded-xl transition-all hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 cursor-pointer"
                                                        >
                                                            <ExternalLink size={15} className="shrink-0" />
                                                            <span>فتح شاشة المحادثة الكاملة</span>
                                                        </button>
                                                    )}

                                                    <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowGroupOptionsDropdown(false);
                                                            setShowClearGroupMsgsConfirm(true);
                                                        }}
                                                        className="w-full flex items-center gap-2 p-2 rounded-xl transition-all hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 cursor-pointer"
                                                    >
                                                        <Trash2 size={15} className="shrink-0" />
                                                        <span>مسح كافة رسائل المجموعة</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowGroupOptionsDropdown(false);
                                                            setGroupToDeleteConfirm(selectedGroup);
                                                        }}
                                                        className="w-full flex items-center gap-2 p-2 rounded-xl transition-all hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 cursor-pointer"
                                                    >
                                                        <Trash2 size={15} className="shrink-0" />
                                                        <span>حذف المجموعة نهائياً</span>
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Chat Messages Feed */}
                                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
                                    {isLoadingGroupMessages ? (
                                        <div className="text-center py-20 text-slate-400 text-xs sm:text-sm font-bold animate-pulse">
                                            جارٍ تحميل محادثات المجموعة...
                                        </div>
                                    ) : groupMessages.length === 0 ? (
                                        <div className="text-center py-20 text-slate-400 text-xs sm:text-sm space-y-2">
                                            <MessageSquare size={36} className="mx-auto opacity-40 mb-2 text-indigo-500" />
                                            <div className="font-bold text-slate-700 dark:text-slate-300">
                                                لا توجد رسائل في هذه المجموعة حتى الآن
                                            </div>
                                            <p className="text-[11px] opacity-75">
                                                يمكنك كتابة رسالة أو توجيه إداري في الأسفل أو إدارة أعضاء المجموعة من زر النقاط الثلاثة.
                                            </p>
                                        </div>
                                    ) : (
                                        groupMessages.map((msg) => {
                                            const isAdminMsg = msg.senderId === ADMIN_USER_ID;
                                            const senderUser = users.find(u => u.userId === msg.senderId);
                                            const senderName = msg.senderName || senderUser?.username || 'قارئ';
                                            const timeStr = new Date(msg.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

                                            return (
                                                <div
                                                    key={msg.messageId}
                                                    className={`flex items-end gap-2 ${isAdminMsg ? 'justify-start' : 'justify-end'}`}
                                                >
                                                    {/* Sender Avatar for non-admin members */}
                                                    {!isAdminMsg && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedMessageForDetails(msg)}
                                                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border overflow-hidden flex-shrink-0 mb-1 cursor-pointer transition-transform hover:scale-105 active:scale-95 bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400"
                                                            title={`عرض بيانات ${senderName} وإدارة الرسالة`}
                                                        >
                                                            {msg.senderAvatarUrl || senderUser?.avatarUrl ? (
                                                                <img src={msg.senderAvatarUrl || senderUser?.avatarUrl} alt={senderName} className="w-full h-full object-cover" />
                                                            ) : (
                                                                senderName.charAt(0) || 'ق'
                                                            )}
                                                        </button>
                                                    )}

                                                    {/* Bubble Container */}
                                                    <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${isAdminMsg ? 'items-start' : 'items-end'}`}>
                                                        {/* Sender Name header button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedMessageForDetails(msg)}
                                                            className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-bold cursor-pointer hover:opacity-80 transition-opacity text-right group"
                                                            title={`عرض بيانات ${senderName} والتحكم بالرسالة`}
                                                        >
                                                            <span className="text-indigo-600 dark:text-indigo-400 group-hover:underline">
                                                                {isAdminMsg ? 'الإدارة العامة 🛡️' : senderName}
                                                            </span>
                                                            {msg.senderCountry && !isAdminMsg && (
                                                                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-200/60 dark:bg-slate-800 text-slate-500">
                                                                    {msg.senderCountry}
                                                                </span>
                                                            )}
                                                        </button>

                                                        {/* Interactive message card - clicking it opens sender details + delete button */}
                                                        <div
                                                            onClick={() => setSelectedMessageForDetails(msg)}
                                                            className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs relative group cursor-pointer transition-all hover:opacity-95 active:scale-[0.99] ${
                                                                isAdminMsg
                                                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                                                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-bl-none'
                                                            }`}
                                                        >
                                                            {/* Quran Verse */}
                                                            {msg.verseData && (
                                                                <div className="mb-2 p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs">
                                                                    <div className="font-bold mb-0.5">📖 سورة {msg.verseData.surahName} (آية {msg.verseData.ayahNumber})</div>
                                                                    <p className="font-amiri leading-loose">"{msg.verseData.text}"</p>
                                                                </div>
                                                            )}

                                                            {/* Audio message */}
                                                            {msg.audioUrl && (
                                                                <div className="mb-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                                    <Volume2 size={16} className="text-emerald-500 shrink-0" />
                                                                    <audio controls src={msg.audioUrl} className="h-8 max-w-full" />
                                                                </div>
                                                            )}

                                                            {/* Attachment */}
                                                            {msg.attachment && (
                                                                <div className="mb-2" onClick={(e) => e.stopPropagation()}>
                                                                    {msg.attachment.type === 'image' ? (
                                                                        <img src={msg.attachment.url} alt="مرفق" className="max-h-40 rounded-xl object-contain" />
                                                                    ) : (
                                                                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-1.5 text-xs">
                                                                            <FileText size={14} />
                                                                            <span>ملف: {msg.attachment.fileName || 'مستند'}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Text */}
                                                            {msg.text && (
                                                                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                                                            )}

                                                            {/* Time & Quick trash icon */}
                                                            <div className="flex items-center justify-end gap-1.5 mt-1.5 text-[9px] opacity-75 font-mono">
                                                                <span>{timeStr}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setMsgToDeleteConfirm(msg);
                                                                    }}
                                                                    className="p-0.5 rounded text-rose-400 hover:text-rose-600 transition-colors cursor-pointer"
                                                                    title="حذف الرسالة مباشرة"
                                                                >
                                                                    <Trash2 size={11} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Bottom Chat Input Bar */}
                                <div className="p-2.5 sm:p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={adminGroupMessageText}
                                        onChange={(e) => setAdminGroupMessageText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSendAdminGroupMessage();
                                        }}
                                        placeholder="اكتب رسالة أو توجيهاً رسمياً في هذه المجموعة..."
                                        className="flex-1 p-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                    />
                                    <button
                                        type="button"
                                        disabled={isSendingGroupMessage || !adminGroupMessageText.trim()}
                                        onClick={handleSendAdminGroupMessage}
                                        className="py-2.5 px-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-600/25 shrink-0"
                                    >
                                        <Send size={14} />
                                        <span className="hidden sm:inline">إرسال كإدارة</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Modal 1: Message Details & Sender Profile & Delete Action */}
                        {selectedMessageForDetails && (() => {
                            const sender = users.find(u => u.userId === selectedMessageForDetails.senderId);
                            const isSenderCreator = selectedGroup && selectedMessageForDetails.senderId === selectedGroup.createdBy;
                            const isSenderAdmin = selectedMessageForDetails.senderId === ADMIN_USER_ID;
                            const msgTime = new Date(selectedMessageForDetails.createdAt).toLocaleString('ar-EG');

                            return (
                                <div className="fixed inset-0 z-[1400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-scaleUp text-right" dir="rtl">
                                        {/* Header */}
                                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                                                <User size={15} className="text-indigo-600 dark:text-indigo-400" />
                                                <span>بيانات المرسل والتحكم بالرسالة</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedMessageForDetails(null)}
                                                className="w-7 h-7 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                                            >
                                                <X size={15} />
                                            </button>
                                        </div>

                                        {/* Sender Identity */}
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-2xl overflow-hidden border border-indigo-500/20 mb-2">
                                                {selectedMessageForDetails.senderAvatarUrl || sender?.avatarUrl ? (
                                                    <img src={selectedMessageForDetails.senderAvatarUrl || sender?.avatarUrl} alt="صورة" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{selectedMessageForDetails.senderName?.charAt(0) || sender?.username?.charAt(0) || 'ق'}</span>
                                                )}
                                            </div>
                                            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                                                {selectedMessageForDetails.senderName || sender?.username || 'عضو بالمجموعة'}
                                            </h4>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                {isSenderAdmin ? (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                                                        الإدارة العامة 🛡️
                                                    </span>
                                                ) : isSenderCreator ? (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                                        منشئ المجموعة 👑
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                                        عضو بالمجموعة 🌿
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Details list */}
                                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-400 font-medium">كود الحساب:</span>
                                                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                                    {sender?.accountCode || selectedMessageForDetails.senderId}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-400 font-medium">الدولة / الإقامة:</span>
                                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                                    {sender?.country || selectedMessageForDetails.senderCountry || 'غير محدد 🌍'}
                                                </span>
                                            </div>
                                            {sender?.createdAt && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-400 font-medium">تاريخ التسجيل:</span>
                                                    <span className="text-slate-700 dark:text-slate-300">
                                                        {new Date(sender.createdAt).toLocaleDateString('ar-EG')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Message preview snippet */}
                                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                                                <span>محتوى الرسالة:</span>
                                                <span className="font-mono">{msgTime}</span>
                                            </div>
                                            <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed line-clamp-3">
                                                {selectedMessageForDetails.text || (selectedMessageForDetails.verseData ? '📖 آية قرآنية' : selectedMessageForDetails.audioUrl ? '🎤 تسجيل صوتي' : '📎 مرفق')}
                                            </p>
                                        </div>

                                        {/* Primary Action: Delete Message Button */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const target = selectedMessageForDetails;
                                                setSelectedMessageForDetails(null);
                                                setMsgToDeleteConfirm(target);
                                            }}
                                            className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-rose-600/20 transition-all"
                                        >
                                            <Trash2 size={16} />
                                            <span>حذف هذه الرسالة من المجموعة</span>
                                        </button>

                                        {/* Secondary Actions */}
                                        <div className="flex gap-2">
                                            {sender && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const target = sender;
                                                        setSelectedMessageForDetails(null);
                                                        openSendMessageModal(target);
                                                    }}
                                                    className="flex-1 py-2 px-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                                                >
                                                    <Mail size={13} />
                                                    <span>مراسلة بالدعم</span>
                                                </button>
                                            )}
                                            {!isSenderCreator && !isSenderAdmin && selectedGroup && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const sId = selectedMessageForDetails.senderId;
                                                        const sName = selectedMessageForDetails.senderName || sender?.username || 'العضو';
                                                        setSelectedMessageForDetails(null);
                                                        setMemberToRemoveConfirm({ userId: sId, username: sName });
                                                    }}
                                                    className="flex-1 py-2 px-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                                                >
                                                    <UserMinus size={13} />
                                                    <span>طرد العضو</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Modal 2: Manage Group Members Modal */}
                        {showManageMembersModal && selectedGroup && (() => {
                            const membersList = (selectedGroup.members || []).map(mId => {
                                const u = users.find(usr => usr.userId === mId);
                                return u || {
                                    userId: mId,
                                    username: 'عضو',
                                    avatarUrl: '',
                                    country: 'غير محدد',
                                    accountCode: mId.substring(0, 8),
                                    isOnline: false,
                                    createdAt: ''
                                };
                            }).filter(u => {
                                if (!manageMemberSearch.trim()) return true;
                                const q = manageMemberSearch.trim().toLowerCase();
                                return (u.username || '').toLowerCase().includes(q) || (u.accountCode || '').toLowerCase().includes(q) || (u.country || '').toLowerCase().includes(q);
                            });

                            return (
                                <div className="fixed inset-0 z-[1400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col text-right animate-scaleUp" dir="rtl">
                                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                                                <Users size={16} className="text-indigo-600 dark:text-indigo-400" />
                                                <span>أعضاء المجموعة ({selectedGroup.members?.length || 1})</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowManageMembersModal(false)}
                                                className="w-7 h-7 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                                            >
                                                <X size={15} />
                                            </button>
                                        </div>

                                        <div className="relative">
                                            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            <input
                                                type="text"
                                                value={manageMemberSearch}
                                                onChange={(e) => setManageMemberSearch(e.target.value)}
                                                placeholder="ابحث بالاسم أو كود الحساب أو الدولة..."
                                                className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            />
                                        </div>

                                        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                                            {membersList.length === 0 ? (
                                                <div className="text-center py-10 text-slate-400 text-xs font-bold">
                                                    لا يوجد أعضاء يطابقون بحثك
                                                </div>
                                            ) : (
                                                membersList.map(member => {
                                                    const isCreator = member.userId === selectedGroup.createdBy;
                                                    return (
                                                        <div
                                                            key={member.userId}
                                                            className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                                                        >
                                                            <div className="flex items-center gap-2.5 min-w-0">
                                                                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                                                                    {member.avatarUrl ? (
                                                                        <img src={member.avatarUrl} alt={member.username} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <span>{member.username?.charAt(0) || 'ق'}</span>
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="font-bold text-xs text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                                                                        <span>{member.username}</span>
                                                                        {isCreator && (
                                                                            <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                                                                                المنشئ 👑
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                                                                        {member.accountCode} • 🌍 {member.country}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-1 shrink-0">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setShowManageMembersModal(false);
                                                                        openInspectorForUser(member, { tab: 'community', groupId: selectedGroup.groupId });
                                                                    }}
                                                                    className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                                                                    title="معاينة ملف العضو"
                                                                >
                                                                    <Eye size={14} />
                                                                </button>
                                                                {!isCreator && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setShowManageMembersModal(false);
                                                                            setMemberToRemoveConfirm({ userId: member.userId, username: member.username });
                                                                        }}
                                                                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                                                                        title="طرد العضو من المجموعة"
                                                                    >
                                                                        <UserMinus size={14} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Modal 3: Add Members Modal */}
                        {showAddMembersModal && selectedGroup && (() => {
                            const availableToAdd = users.filter(u => !(selectedGroup.members || []).includes(u.userId)).filter(u => {
                                if (!addMemberSearch.trim()) return true;
                                const q = addMemberSearch.trim().toLowerCase();
                                return (u.username || '').toLowerCase().includes(q) || (u.accountCode || '').toLowerCase().includes(q) || (u.country || '').toLowerCase().includes(q);
                            });

                            return (
                                <div className="fixed inset-0 z-[1400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col text-right animate-scaleUp" dir="rtl">
                                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                                                <UserPlus size={16} className="text-indigo-600 dark:text-indigo-400" />
                                                <span>إضافة أعضاء جدد لمجموعة "{cleanGroupName(selectedGroup.name)}"</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowAddMembersModal(false)}
                                                className="w-7 h-7 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                                            >
                                                <X size={15} />
                                            </button>
                                        </div>

                                        <div className="relative">
                                            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            <input
                                                type="text"
                                                value={addMemberSearch}
                                                onChange={(e) => setAddMemberSearch(e.target.value)}
                                                placeholder="ابحث عن مستخدمين لإضافتهم..."
                                                className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            />
                                        </div>

                                        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                                            {availableToAdd.length === 0 ? (
                                                <div className="text-center py-10 text-slate-400 text-xs font-bold">
                                                    {addMemberSearch ? 'لا يوجد مستخدمون يطابقون بحثك' : 'جميع المستخدمين مضافون بالفعل في هذه المجموعة'}
                                                </div>
                                            ) : (
                                                availableToAdd.map(candidate => (
                                                    <div
                                                        key={candidate.userId}
                                                        className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                                                                {candidate.avatarUrl ? (
                                                                    <img src={candidate.avatarUrl} alt={candidate.username} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span>{candidate.username?.charAt(0) || 'ق'}</span>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                                                    {candidate.username}
                                                                </div>
                                                                <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                                                                    {candidate.accountCode} • 🌍 {candidate.country}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddMemberToGroup(candidate.userId, candidate.username)}
                                                            className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer shadow-xs shrink-0"
                                                        >
                                                            <UserPlus size={13} />
                                                            <span>إضافة</span>
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Modal 4: Group Info & Statistics Modal */}
                        {showGroupInfoModal && selectedGroup && (() => {
                            const creator = users.find(u => u.userId === selectedGroup.createdBy);
                            const audioCount = groupMessages.filter(m => !!m.audioUrl).length;
                            const verseCount = groupMessages.filter(m => !!m.verseData).length;

                            return (
                                <div className="fixed inset-0 z-[1400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4 animate-scaleUp text-right" dir="rtl">
                                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                                                <Info size={16} className="text-indigo-600 dark:text-indigo-400" />
                                                <span>بيانات وإحصائيات المجموعة</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowGroupInfoModal(false)}
                                                className="w-7 h-7 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                                            >
                                                <X size={15} />
                                            </button>
                                        </div>

                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-2xl overflow-hidden border border-indigo-500/20 mb-2">
                                                {renderGroupAvatar(selectedGroup)}
                                            </div>
                                            <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                                                {selectedGroup.name}
                                            </h4>
                                            {selectedGroup.description && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                                    {selectedGroup.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Statistics Grid */}
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50">
                                                <div className="font-black text-sm text-indigo-950 dark:text-indigo-100">{selectedGroup.members?.length || 1}</div>
                                                <div className="text-[10px] text-indigo-600 dark:text-indigo-300 font-bold">الأعضاء</div>
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                                                <div className="font-black text-sm text-emerald-950 dark:text-emerald-100">{groupMessages.length}</div>
                                                <div className="text-[10px] text-emerald-600 dark:text-emerald-300 font-bold">الرسائل</div>
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                                                <div className="font-black text-sm text-amber-950 dark:text-amber-100">{audioCount}</div>
                                                <div className="text-[10px] text-amber-600 dark:text-amber-300 font-bold">صوتيات</div>
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-400 font-medium">المنشئ:</span>
                                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                                    {selectedGroup.creatorName || creator?.username || 'المشرف'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-400 font-medium">تاريخ الإنشاء:</span>
                                                <span className="text-slate-700 dark:text-slate-300 font-mono">
                                                    {new Date(selectedGroup.createdAt).toLocaleDateString('ar-EG')}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-200 dark:border-slate-800">
                                                <span className="text-slate-400 font-medium">معرّف المجموعة:</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopyGroupId(selectedGroup.groupId)}
                                                    className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Copy size={11} />
                                                    <span>نسخ المعرّف</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Modal 5: Edit Group Details Modal */}
                        {showEditGroupModal && selectedGroup && (
                            <EditGroupModal
                                isOpen={showEditGroupModal}
                                onClose={() => setShowEditGroupModal(false)}
                                group={selectedGroup}
                                onUpdated={(updated) => {
                                    setSelectedGroup(updated);
                                    setShowEditGroupModal(false);
                                    loadData();
                                    showAdminToast('تم حفظ تعديلات المجموعة بنجاح 🌿');
                                }}
                                onDelete={() => {
                                    setShowEditGroupModal(false);
                                    setGroupToDeleteConfirm(selectedGroup);
                                }}
                            />
                        )}

                        {/* Modal 6: Create Group Modal */}
                        {showCreateGroupModal && (
                            <CreateGroupModal
                                isOpen={showCreateGroupModal}
                                onClose={() => setShowCreateGroupModal(false)}
                                availableUsers={users}
                                onCreated={async (newGid) => {
                                    setShowCreateGroupModal(false);
                                    await loadData(true);
                                    const created = communityService.getGroupById(newGid);
                                    if (created) {
                                        handleSelectGroup(created);
                                    }
                                    showAdminToast('تم إنشاء المجموعة بنجاح 🌿');
                                }}
                            />
                        )}
                    </div>
                )}

            </div>

            {/* Footer - Standard BottomBar matching all other pages */}
            <BottomBar onHomeClick={handleHomeClick} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
};
