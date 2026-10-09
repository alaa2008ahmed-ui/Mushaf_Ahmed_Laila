import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Video, FileText, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface MediaAttachmentPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelected: (file: File) => void;
}

export const MediaAttachmentPicker: React.FC<MediaAttachmentPickerProps> = ({
  isOpen,
  onClose,
  onFileSelected
}) => {
  const { theme } = useTheme();
  const isBlackTheme = theme.bgColor === '#000000';
  const cardBg = isBlackTheme ? '#181818' : (theme.cardBg || (theme.isDark ? '#1e293b' : '#ffffff'));
  const cardBorder = isBlackTheme ? '#333333' : (theme.cardBorder || (theme.isDark ? '#334155' : '#e2e8f0'));
  const textColor = theme.textColor || (theme.isDark ? '#ffffff' : '#000000');
  const textMuted = isBlackTheme ? '#9ca3af' : (theme.isDark ? '#94a3b8' : '#64748b');

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
      onClose();
    }
    e.target.value = '';
  };

  return (
    <>
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={videoInputRef}
        accept="video/*"
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={docInputRef}
        accept=".pdf,.doc,.docx,.txt,.zip,.rar,.xls,.xlsx,.ppt,.pptx,application/*"
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />

      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs"
            onClick={onClose}
            dir="rtl"
            style={{ fontFamily: theme.font }}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl border shadow-2xl p-5 space-y-4"
              style={{
                backgroundColor: cardBg,
                borderColor: cardBorder,
                color: textColor
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: cardBorder }}>
                <div>
                  <h4 className="text-sm font-bold" style={{ color: textColor }}>
                    إرفاق واسترداد وسائط للمحادثة
                  </h4>
                  <p className="text-[11px]" style={{ color: textMuted }}>
                    اختر نوع الملف أو الوسائط لمشاركتها وحفظها
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all active:scale-95 cursor-pointer"
                  style={{ borderColor: cardBorder, color: textMuted }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Options */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {/* 1. Photo */}
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all active:scale-95 cursor-pointer hover:bg-emerald-500/10 hover:border-emerald-500/30 group"
                  style={{ borderColor: cardBorder }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <ImageIcon size={22} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: textColor }}>
                    صورة
                  </span>
                  <span className="text-[10px] mt-0.5" style={{ color: textMuted }}>
                    معرض / كاميرا
                  </span>
                </button>

                {/* 2. Video */}
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all active:scale-95 cursor-pointer hover:bg-blue-500/10 hover:border-blue-500/30 group"
                  style={{ borderColor: cardBorder }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Video size={22} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: textColor }}>
                    فيديو
                  </span>
                  <span className="text-[10px] mt-0.5" style={{ color: textMuted }}>
                    مقطع مرئي
                  </span>
                </button>

                {/* 3. Document / File */}
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all active:scale-95 cursor-pointer hover:bg-amber-500/10 hover:border-amber-500/30 group"
                  style={{ borderColor: cardBorder }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <FileText size={22} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: textColor }}>
                    ملف / مستند
                  </span>
                  <span className="text-[10px] mt-0.5" style={{ color: textMuted }}>
                    PDF / Word
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
