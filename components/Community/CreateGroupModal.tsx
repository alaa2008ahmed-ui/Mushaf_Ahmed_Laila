import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, X, Sparkles, Check, Camera, Image as ImageIcon } from 'lucide-react';
import { communityService, CommunityUser } from '../../services/communityService';
import { useTheme } from '../../context/ThemeContext';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (groupId: string) => void;
  availableUsers: CommunityUser[];
}

export const PRESET_GROUP_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=300', label: 'المصحف الشريف' },
  { url: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=300', label: 'الكعبة المشرفة' },
  { url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300', label: 'المسجد النبوي' },
  { url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=300', label: 'قبة المسجد' },
  { url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=300', label: 'فانوس إسلامي' },
  { url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=300', label: 'طبيعة وسلام' },
];

export const PRESET_ICONS = ['📖', '🌿', '🕌', '🕋', '💫', '🌸', '🤍', '🌟', '🌙', '🕊️'];

const compressAvatar = (dataUrl: string, maxDim = 180, quality = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      return resolve(dataUrl);
    }
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  availableUsers
}) => {
  const { theme } = useTheme();
  const isBlackTheme = theme.bgColor === '#000000';
  const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.palette?.[0] || '#10b981');
  const primaryTextColor = isBlackTheme ? '#000000' : (theme.btnText || '#FFFFFF');
  const cardBg = isBlackTheme ? '#111111' : (theme.cardBg || (theme.isDark ? '#1e293b' : '#ffffff'));
  const cardBorder = isBlackTheme ? '#333333' : (theme.cardBorder || (theme.isDark ? '#334155' : '#e2e8f0'));
  const secondaryBg = isBlackTheme ? '#1a1a1a' : (theme.isDark ? '#0f172a' : '#f8fafc');
  const textColor = theme.textColor || (theme.isDark ? '#ffffff' : '#000000');
  const textMuted = isBlackTheme ? '#9ca3af' : (theme.isDark ? '#94a3b8' : '#64748b');

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(PRESET_GROUP_IMAGES[0].url);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const toggleUser = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('يرجى اختيار ملف صورة صالح (JPG أو PNG أو WebP)');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 8 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const rawData = reader.result as string;
        const compressed = await compressAvatar(rawData);
        setSelectedAvatar(compressed);
        setErrorMsg(null);
      } catch {
        setErrorMsg('فشل ضغط وتحميل الصورة');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const rawName = groupName.trim();
    const cleanName = rawName.replace(/[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim() || rawName;
    if (!cleanName || cleanName.length < 2) {
      setErrorMsg('يرجى إدخال اسم للمحادثة الجماعية (حرفين على الأقل)');
      return;
    }

    try {
      setIsSubmitting(true);
      const group = await communityService.createGroup(
        cleanName,
        description.trim(),
        selectedUserIds,
        selectedAvatar,
        false
      );
      setIsSubmitting(false);
      onCreated(group.groupId);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'حدث خطأ أثناء إنشاء المجموعة');
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[120] flex items-start sm:items-center justify-center p-3 sm:p-4 pt-6 sm:pt-4 pb-36 sm:pb-16 bg-black/70 backdrop-blur-md overflow-y-auto overscroll-contain" 
        dir="rtl"
        style={{ fontFamily: theme.font }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg rounded-3xl border shadow-2xl p-5 sm:p-6 my-auto mb-12 sm:mb-auto"
          style={{
            backgroundColor: cardBg,
            borderColor: cardBorder,
            color: textColor
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b mb-4" style={{ borderColor: cardBorder }}>
            <div className="flex items-center gap-2.5">
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center border font-bold"
                style={{
                  backgroundColor: `${primaryColor}15`,
                  borderColor: `${primaryColor}30`,
                  color: primaryColor
                }}
              >
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold" style={{ color: textColor }}>
                  إنشاء محادثة جماعية جديدة
                </h3>
                <p className="text-xs" style={{ color: textMuted }}>
                  تواصل جماعي مبارك لتدارس القرآن وتبادل الفوائد
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-95"
              style={{
                backgroundColor: secondaryBg,
                borderColor: cardBorder,
                color: textMuted
              }}
            >
              <X size={18} />
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            {/* Group Avatar & Image Picker */}
            <div className="flex flex-col items-center justify-center pt-1 pb-2">
              <input 
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Main Avatar Preview */}
              <div className="relative group mb-3">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl border-2 shadow-md flex items-center justify-center overflow-hidden cursor-pointer transition-all hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    borderColor: primaryColor
                  }}
                  title="اضغط لاختيار صورة مخصصة من جهازك"
                >
                  {selectedAvatar.startsWith('data:image') || selectedAvatar.startsWith('http') || selectedAvatar.startsWith('/') ? (
                    <img src={selectedAvatar} alt="صورة المجموعة" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl sm:text-4xl select-none">{selectedAvatar}</span>
                  )}
                </div>

                {/* Camera upload badge */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -left-1 w-7 h-7 rounded-xl border flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: primaryColor,
                    borderColor: cardBorder,
                    color: primaryTextColor
                  }}
                  title="رفع صورة من جهازك"
                >
                  <Camera size={13} strokeWidth={2.5} />
                </button>
              </div>

              <span className="text-[11px] font-bold mb-2" style={{ color: textMuted }}>
                الأيقونة أو الصورة الرسمية للمجموعة
              </span>

              {/* Preset Islamic Photos */}
              <div className="w-full">
                <div className="flex items-center justify-between mb-1.5 px-0.5">
                  <span className="text-[11px] font-bold" style={{ color: textMuted }}>
                    صور إسلامية مقترحة
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    style={{ color: primaryColor }}
                  >
                    <Camera size={12} />
                    <span>رفع صورة خاصة</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none w-full">
                  {PRESET_GROUP_IMAGES.map((imgItem) => {
                    const isSelected = selectedAvatar === imgItem.url;
                    return (
                      <button
                        key={imgItem.url}
                        type="button"
                        onClick={() => setSelectedAvatar(imgItem.url)}
                        className="relative w-11 h-11 rounded-2xl border overflow-hidden flex-shrink-0 transition-all active:scale-95 cursor-pointer"
                        style={{
                          borderColor: isSelected ? primaryColor : cardBorder,
                          boxShadow: isSelected ? `0 0 0 2px ${primaryColor}` : 'none'
                        }}
                        title={imgItem.label}
                      >
                        <img src={imgItem.url} alt={imgItem.label} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div 
                            className="absolute inset-0 bg-black/30 flex items-center justify-center"
                            style={{ color: '#FFFFFF' }}
                          >
                            <Check size={14} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preset Emojis & Icons */}
              <div className="w-full mt-2">
                <span className="text-[11px] font-bold block mb-1.5 px-0.5" style={{ color: textMuted }}>
                  أو اختر رمـزاً
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full">
                  {PRESET_ICONS.map(icon => {
                    const isSelected = selectedAvatar === icon;
                    return (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setSelectedAvatar(icon)}
                        className="w-9 h-9 rounded-xl border text-base flex items-center justify-center transition-all flex-shrink-0 active:scale-95 cursor-pointer"
                        style={{
                          backgroundColor: isSelected ? `${primaryColor}25` : secondaryBg,
                          borderColor: isSelected ? primaryColor : cardBorder,
                          boxShadow: isSelected ? `0 0 0 2px ${primaryColor}` : 'none'
                        }}
                      >
                        {icon}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Group Name */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: textColor }}>
                اسم المحادثة الجماعية *
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="مثال: حلقة حفظ سورة البقرة، مجلس تدبر، أذكار الصباح..."
                className="w-full px-3.5 py-2.5 rounded-2xl border text-sm font-medium focus:outline-none transition-all shadow-xs"
                style={{
                  backgroundColor: secondaryBg,
                  borderColor: cardBorder,
                  color: textColor
                }}
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: textMuted }}>
                نبذة أو غرض المجموعة (اختياري)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف مختصر للهدف من الحلقة أو أوقات التدارس..."
                className="w-full px-3.5 py-2.5 rounded-2xl border text-sm font-medium focus:outline-none transition-all shadow-xs"
                style={{
                  backgroundColor: secondaryBg,
                  borderColor: cardBorder,
                  color: textColor
                }}
              />
            </div>

            {/* Initial Members Selection (Only users previously chatted with) */}
            {availableUsers.length === 0 ? (
              <div 
                className="p-3.5 rounded-2xl border text-center space-y-1"
                style={{ backgroundColor: secondaryBg, borderColor: cardBorder }}
              >
                <p className="text-xs font-bold" style={{ color: textColor }}>
                  لا يوجد أعضاء تم التحدث معهم سابقاً
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: textMuted }}>
                  تظهر هنا فقط الحسابات التي أجريت معها محادثات فردية سابقة. يمكنك بدء محادثة مع أي قارئ من تبويب (الأعضاء) أولاً لتتمكن من دعوته للمجموعات.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: textColor }}>
                  الأعضاء الذين تحدثت معهم سابقاً ({selectedUserIds.length} محددين)
                </label>
                <div 
                  className="max-h-40 overflow-y-auto space-y-1.5 p-2 rounded-2xl border"
                  style={{ backgroundColor: secondaryBg, borderColor: cardBorder }}
                >
                  {availableUsers.map(u => {
                    const isSelected = selectedUserIds.includes(u.userId);
                    return (
                      <div
                        key={u.userId}
                        onClick={() => toggleUser(u.userId)}
                        className="flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all border text-xs"
                        style={{
                          backgroundColor: isSelected ? `${primaryColor}15` : cardBg,
                          borderColor: isSelected ? `${primaryColor}40` : 'transparent'
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div 
                            className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs overflow-hidden flex-shrink-0"
                            style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                          >
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                            ) : (
                              u.username.charAt(0)
                            )}
                          </div>
                          <span className="font-bold truncate" style={{ color: textColor }}>{u.username}</span>
                          <span className="text-[10px]" style={{ color: textMuted }}>({u.country || '🌍'})</span>
                        </div>

                        <div 
                          className="w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: isSelected ? primaryColor : 'transparent',
                            borderColor: isSelected ? primaryColor : cardBorder,
                            color: primaryTextColor
                          }}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2.5 pt-3 pb-3 mb-2">
              <button
                type="submit"
                disabled={isSubmitting || !groupName.trim()}
                className="flex-1 py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                style={{
                  backgroundColor: primaryColor,
                  color: primaryTextColor
                }}
              >
                <Users size={18} />
                <span>{isSubmitting ? 'جارٍ الإنشاء...' : 'إنشاء المجموعة'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-bold border transition-all active:scale-95 cursor-pointer shadow-xs"
                style={{
                  backgroundColor: secondaryBg,
                  borderColor: cardBorder,
                  color: textColor
                }}
              >
                إلغاء
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default CreateGroupModal;
