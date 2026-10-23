import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit3, X, Check, Camera, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { communityService, GroupChat } from '../../services/communityService';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { PRESET_GROUP_IMAGES, PRESET_ICONS } from './CreateGroupModal';

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: GroupChat | null;
  onUpdated?: (updatedGroup: GroupChat) => void;
  onDelete?: () => void;
}

const compressAvatar = (dataUrl: string, maxDim = 512, quality = 0.9): Promise<string> => {
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
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
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
  const { theme, themeKey } = useTheme();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const isDefaultTheme = themeKey === 'default' || !themeKey || theme.name?.includes('الافتراضي') || theme.name === 'Default';
  const isDeepBlack = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود' || themeKey === 'deep_black';
  const cardBorderColor = isDefaultTheme 
    ? '#000000' 
    : (isDeepBlack 
        ? '#FFFFFF' 
        : (theme.palette?.[0] || theme.accent || '#000000'));
  const isBlackTheme = isDeepBlack;
  const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.palette?.[0] || '#10b981');
  const primaryTextColor = isBlackTheme ? '#000000' : (theme.btnText || '#FFFFFF');
  const cardBg = isBlackTheme ? '#111111' : (theme.cardBg || (theme.isDark ? '#1e293b' : '#ffffff'));
  const cardBorder = cardBorderColor;
  const secondaryBg = isBlackTheme ? '#1a1a1a' : (theme.isDark ? '#0f172a' : '#f8fafc');
  const textColor = theme.textColor || (theme.isDark ? '#ffffff' : '#000000');
  const textMuted = isBlackTheme ? '#9ca3af' : (theme.isDark ? '#94a3b8' : '#64748b');

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(PRESET_GROUP_IMAGES[0].url);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (group) {
      const cleanName = (group.name || '').replace(/[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim() || group.name || '';
      setGroupName(cleanName);
      setDescription(group.description || '');
      setSelectedAvatar(group.avatarUrl || PRESET_GROUP_IMAGES[0].url);
      setErrorMsg(null);
    }
  }, [group, isOpen]);

  if (!isOpen || !group) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const raw = reader.result as string;
        const compressed = await compressAvatar(raw, 220, 0.85);
        setSelectedAvatar(compressed);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error reading group image file:', err);
    }
  };

  const handlePickImage = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        try {
          const image = await CapCamera.getPhoto({
            quality: 85,
            allowEditing: false,
            resultType: CameraResultType.DataUrl,
            source: CameraSource.Prompt
          });
          if (image?.dataUrl) {
            const compressed = await compressAvatar(image.dataUrl, 220, 0.85);
            setSelectedAvatar(compressed);
            return;
          }
        } catch (camErr: any) {
          const msg = (camErr?.message || '').toLowerCase();
          if (msg.includes('cancel') || msg.includes('user cancelled')) return;
          console.warn('Native camera failed, falling back to file input:', camErr);
        }
      }
      fileInputRef.current?.click();
    } catch (err) {
      console.warn('Error picking group image:', err);
      fileInputRef.current?.click();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || groupName.trim().length < 2) {
      setErrorMsg(isEn ? 'Please enter a valid group name (at least 2 characters)' : 'يرجى إدخال اسم المجموعة (حرفين على الأقل)');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await communityService.updateGroup(group.groupId, {
        name: groupName.trim(),
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
      setErrorMsg(err?.message || (isEn ? 'An error occurred while updating group' : 'حدث خطأ أثناء تعديل بيانات المجموعة'));
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[120] flex items-start sm:items-center justify-center p-3 sm:p-4 pt-6 sm:pt-4 pb-36 sm:pb-16 bg-black/70 backdrop-blur-md overflow-y-auto overscroll-contain" 
        dir={isEn ? 'ltr' : 'rtl'}
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
            borderWidth: '1.5px',
            borderStyle: 'solid',
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
                  {isEn ? 'Edit Group Details & Icon' : 'تعديل اسم وصورة المجموعة'}
                </h3>
                <p className="text-xs" style={{ color: textMuted }}>
                  {isEn ? 'Update official group name, description, and icon' : 'تحديث بيانات وأيقونة المحادثة الجماعية الرسمية'}
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
                style={{ display: 'none' }}
              />

              {/* Main Avatar Preview */}
              <div className="relative group mb-3">
                <div 
                  onClick={handlePickImage}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl border-2 shadow-md flex items-center justify-center overflow-hidden cursor-pointer transition-all hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    borderColor: primaryColor
                  }}
                  title={isEn ? "Click to pick image from device" : "اضغط لاختيار صورة مخصصة من جهازك"}
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
                  onClick={handlePickImage}
                  className={`absolute -bottom-1 ${isEn ? '-right-1' : '-left-1'} w-7 h-7 rounded-xl border flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer`}
                  style={{
                    backgroundColor: primaryColor,
                    borderColor: cardBorder,
                    color: primaryTextColor
                  }}
                  title={isEn ? "Upload photo from device" : "رفع صورة من جهازك"}
                >
                  <Camera size={13} strokeWidth={2.5} />
                </button>
              </div>

              <span className="text-[11px] font-bold mb-2" style={{ color: textMuted }}>
                {isEn ? 'Official Group Icon or Photo' : 'الأيقونة أو الصورة الرسمية للمجموعة'}
              </span>

              {/* Preset Islamic Photos */}
              <div className="w-full">
                <div className="flex items-center justify-between mb-1.5 px-0.5">
                  <span className="text-[11px] font-bold" style={{ color: textMuted }}>
                    {isEn ? 'Suggested Islamic Photos' : 'صور إسلامية مقترحة'}
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    style={{ color: primaryColor }}
                  >
                    <Camera size={12} />
                    <span>{isEn ? 'Upload custom image' : 'رفع صورة خاصة'}</span>
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
                        title={isEn ? imgItem.labelEn : imgItem.label}
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
                  {isEn ? 'Or Choose an Icon' : 'أو اختر رمـزاً'}
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

            {/* Group Name input */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: textColor }}>
                {isEn ? 'Group Name *' : 'اسم المحادثة الجماعية *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder={isEn ? "e.g., Quran Circle, Surah Al-Kahf Reflection..." : "مثال: حلقة أهل القرآن، تدبر سورة الكهف..."}
                  maxLength={40}
                  className="w-full px-3.5 py-3 rounded-2xl border text-xs sm:text-sm font-bold focus:outline-none transition-all shadow-xs"
                  style={{
                    backgroundColor: secondaryBg,
                    borderColor: cardBorder,
                    color: textColor
                  }}
                  required
                />
              </div>
              <p className={`text-[10px] mt-1 ${isEn ? 'ml-1' : 'mr-1'}`} style={{ color: textMuted }}>
                {isEn 
                  ? 'The chosen official icon will appear as the group avatar.' 
                  : 'الأيقونة الرسمية المختارة ستظهر كصورة للمجموعة بدون تكرارها بنص الاسم.'}
              </p>
            </div>

            {/* Description input */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: textColor }}>
                {isEn ? 'Group Description (Optional)' : 'وصف المجموعة (اختياري)'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isEn ? "Brief description about group purpose or schedule..." : "نبذة عن موضوع المحادثة الجماعية أو أهدافها..."}
                rows={2}
                maxLength={200}
                className="w-full px-3.5 py-2.5 rounded-2xl border text-xs font-medium focus:outline-none transition-all resize-none shadow-xs"
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
                <span>{isSubmitting ? (isEn ? 'Saving...' : 'جارٍ الحفظ...') : (isEn ? 'Save Changes' : 'حفظ التعديلات')}</span>
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
                {isEn ? 'Cancel' : 'إلغاء'}
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
                  <span>{isEn ? 'Permanently Delete This Group' : 'حذف هذه المجموعة نهائياً'}</span>
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
