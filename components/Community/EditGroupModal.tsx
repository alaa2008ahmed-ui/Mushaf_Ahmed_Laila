import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit3, X, Check, Camera, Image as ImageIcon, Trash2 } from 'lucide-react';
import { communityService, GroupChat } from '../../services/communityService';
import { useTheme } from '../../context/ThemeContext';
import { PRESET_GROUP_IMAGES, PRESET_ICONS } from './CreateGroupModal';

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: GroupChat | null;
  onUpdated?: (updatedGroup: GroupChat) => void;
  onDelete?: () => void;
}

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

export const EditGroupModal: React.FC<EditGroupModalProps> = ({
  isOpen,
  onClose,
  group,
  onUpdated,
  onDelete
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
  const [selectedAvatar, setSelectedAvatar] = useState<string>('📖');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (group && isOpen) {
      const cleanName = (group.name || '').replace(/[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim() || group.name;
      setGroupName(cleanName);
      setDescription(group.description || '');
      setSelectedAvatar(group.avatarUrl || '📖');
      setErrorMsg(null);
    }
  }, [group, isOpen]);

  if (!isOpen || !group) return null;

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const rawName = groupName.trim();
    const cleanName = rawName.replace(/[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim() || rawName;
    if (!cleanName || cleanName.length < 2) {
      setErrorMsg('يرجى إدخال اسم مناسب للمجموعة (حرفين على الأقل)');
      return;
    }

    try {
      setIsSubmitting(true);
      const updated = await communityService.updateGroup(group.groupId, {
        name: cleanName,
        avatarUrl: selectedAvatar,
        description: description.trim()
      });
      setIsSubmitting(false);
      if (onUpdated) {
        onUpdated(updated);
      }
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'حدث خطأ أثناء تعديل بيانات المجموعة');
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
                <Edit3 size={18} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold" style={{ color: textColor }}>
                  تعديل اسم وصورة المجموعة
                </h3>
                <p className="text-xs" style={{ color: textMuted }}>
                  تحديث بيانات وأيقونة المحادثة الجماعية الرسمية
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-95 cursor-pointer"
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

          <form onSubmit={handleSave} className="space-y-4">
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
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border-2 shadow-md flex items-center justify-center overflow-hidden cursor-pointer transition-all hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    borderColor: primaryColor
                  }}
                  title="اضغط لتغيير الصورة من جهازك"
                >
                  {selectedAvatar.startsWith('data:image') || selectedAvatar.startsWith('http') || selectedAvatar.startsWith('/') ? (
                    <img 
                      src={selectedAvatar} 
                      alt="صورة المجموعة" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl sm:text-4xl leading-none select-none">
                      {selectedAvatar}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1.5 -left-1.5 w-8 h-8 rounded-full border shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-90 cursor-pointer"
                  style={{
                    backgroundColor: primaryColor,
                    color: primaryTextColor,
                    borderColor: cardBg
                  }}
                  title="رفع صورة مخصصة من جهازك"
                >
                  <Camera size={14} />
                </button>
              </div>

              <span className="text-[11px] font-bold mb-2" style={{ color: textMuted }}>
                الأيقونة أو الصورة الرسمية للمجموعة
              </span>

              {/* Preset Islamic Photos Grid */}
              <div className="w-full mt-1">
                <div className="text-[11px] font-bold mb-1.5 flex items-center justify-between" style={{ color: textMuted }}>
                  <span>صور مختارة للمجموعة:</span>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-opacity hover:opacity-80"
                    style={{ color: primaryColor }}
                  >
                    <ImageIcon size={12} />
                    <span>صورة من جهازك</span>
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_GROUP_IMAGES.map((img, idx) => {
                    const isSelected = selectedAvatar === img.url;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedAvatar(img.url)}
                        className="relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all hover:scale-105 active:scale-95 shadow-xs"
                        style={{
                          borderColor: isSelected ? primaryColor : 'transparent',
                          boxShadow: isSelected ? `0 0 0 2px ${primaryColor}` : 'none'
                        }}
                        title={img.label}
                      >
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div 
                            className="absolute inset-0 flex items-center justify-center bg-black/40"
                            style={{ color: '#FFFFFF' }}
                          >
                            <Check size={14} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Preset Icons Selection */}
              <div className="w-full mt-2.5">
                <span className="text-[11px] font-bold mb-1.5 block" style={{ color: textMuted }}>
                  أو اختر أيقونة رسمية للمجموعة:
                </span>
                <div className="flex items-center justify-center flex-wrap gap-1.5">
                  {PRESET_ICONS.map((icon, idx) => {
                    const isSelected = selectedAvatar === icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvatar(icon)}
                        className="w-9 h-9 rounded-xl border flex items-center justify-center text-lg transition-all hover:scale-110 active:scale-90 cursor-pointer"
                        style={{
                          backgroundColor: isSelected ? `${primaryColor}25` : secondaryBg,
                          borderColor: isSelected ? primaryColor : cardBorder,
                          transform: isSelected ? 'scale(1.1)' : 'scale(1)'
                        }}
                      >
                        <span>{icon}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Group Name input */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: textColor }}>
                اسم المحادثة الجماعية <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="مثال: حلقة أهل القرآن، تدبر سورة الكهف..."
                  maxLength={40}
                  className="w-full px-3.5 py-3 rounded-2xl border text-xs sm:text-sm font-bold focus:outline-none transition-all"
                  style={{
                    backgroundColor: secondaryBg,
                    borderColor: cardBorder,
                    color: textColor
                  }}
                  required
                />
              </div>
              <p className="text-[10px] mt-1 mr-1" style={{ color: textMuted }}>
                الأيقونة الرسمية المختارة ستظهر كصورة للمجموعة بدون تكرارها بنص الاسم.
              </p>
            </div>

            {/* Description input */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: textColor }}>
                وصف المجموعة (اختياري)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="نبذة عن موضوع المحادثة الجماعية أو أهدافها..."
                rows={2}
                maxLength={200}
                className="w-full px-3.5 py-2.5 rounded-2xl border text-xs font-medium focus:outline-none transition-all resize-none"
                style={{
                  backgroundColor: secondaryBg,
                  borderColor: cardBorder,
                  color: textColor
                }}
              />
            </div>

            {/* Action buttons with increased bottom spacing */}
            <div className="flex items-center gap-2.5 pt-4 pb-3 mb-2">
              <button
                type="submit"
                disabled={isSubmitting || !groupName.trim()}
                className="flex-1 py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                style={{
                  backgroundColor: primaryColor,
                  color: primaryTextColor
                }}
              >
                <Check size={18} />
                <span>{isSubmitting ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}</span>
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

            {onDelete && (
              <div className="pt-2 border-t mt-2 flex justify-center" style={{ borderColor: cardBorder }}>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onDelete();
                  }}
                  className="w-full py-2.5 rounded-2xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 border border-rose-500/30 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>حذف هذه المجموعة نهائياً</span>
                </button>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditGroupModal;
