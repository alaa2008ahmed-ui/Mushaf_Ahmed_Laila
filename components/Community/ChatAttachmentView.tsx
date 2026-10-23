import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, FileText, Maximize2, X, File, FileArchive, Check, Share2 } from 'lucide-react';
import { ChatAttachment } from '../../services/communityService';
import { useLanguage } from '../../context/LanguageContext';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { registerBackInterceptor } from '../../hooks/useBackButton';

interface ChatAttachmentViewProps {
  attachment: ChatAttachment;
  isMe?: boolean;
}

// Helper to convert URL or Blob to Base64
const getBase64FromUrl = async (url: string): Promise<string> => {
  if (url.startsWith('data:')) {
    return url.split(',')[1];
  }
  const resp = await fetch(url);
  const blob = await resp.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = reader.result as string;
      resolve(res.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// 1. Save directly to phone filesystem / browser downloads WITHOUT opening share dialog
export const saveAttachmentToPhone = async (url: string, fileName?: string): Promise<boolean> => {
  const finalName = fileName || `mushaf_image_${Date.now()}.jpg`;
  try {
    if (Capacitor.isNativePlatform()) {
      const base64Data = await getBase64FromUrl(url);

      // Attempt saving to Documents, fallback to Cache/Data
      await Filesystem.writeFile({
        path: finalName,
        data: base64Data,
        directory: Directory.Documents
      }).catch(async () => {
        return await Filesystem.writeFile({
          path: finalName,
          data: base64Data,
          directory: Directory.Cache
        });
      });

      return true;
    }

    // Web / browser download
    const a = document.createElement('a');
    a.href = url;
    a.download = finalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch (err) {
    console.error('Error saving file to phone:', err);
    try {
      window.open(url, '_blank');
      return true;
    } catch (e) {
      return false;
    }
  }
};

// 2. Share image to other apps (Share sheet)
export const shareAttachment = async (url: string, fileName?: string): Promise<boolean> => {
  const finalName = fileName || `mushaf_image_${Date.now()}.jpg`;
  try {
    if (Capacitor.isNativePlatform()) {
      const base64Data = await getBase64FromUrl(url);
      const savedFile = await Filesystem.writeFile({
        path: finalName,
        data: base64Data,
        directory: Directory.Cache
      });

      await Share.share({
        title: finalName,
        url: savedFile.uri,
        dialogTitle: 'مشاركة الصورة'
      });
      return true;
    }

    if (navigator.share && (url.startsWith('http://') || url.startsWith('https://'))) {
      await navigator.share({
        title: finalName,
        url: url
      });
      return true;
    }

    // Fallback: download or open
    const a = document.createElement('a');
    a.href = url;
    a.download = finalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch (err) {
    console.error('Error sharing image:', err);
    return false;
  }
};

export const downloadAttachment = saveAttachmentToPhone;

export const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ك.ب`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} م.ب`;
};

export const ChatAttachmentView: React.FC<ChatAttachmentViewProps> = ({ attachment, isMe }) => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [showLightbox, setShowLightbox] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Close lightbox on hardware back button
  useEffect(() => {
    if (!showLightbox) return;
    const interceptor = () => {
      setShowLightbox(false);
      return true;
    };
    const unregister = registerBackInterceptor(interceptor);
    return unregister;
  }, [showLightbox]);

  // Close lightbox on Escape key
  useEffect(() => {
    if (!showLightbox) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowLightbox(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox]);

  const handleSaveToPhone = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await saveAttachmentToPhone(attachment.url, attachment.fileName);
    if (success) {
      setSaveSuccess(true);
      setStatusNotice(isEn ? 'Saved to phone 💾' : 'تم الحفظ على الهاتف بنجاح 💾');
      setTimeout(() => {
        setSaveSuccess(false);
        setStatusNotice(null);
      }, 2500);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await shareAttachment(attachment.url, attachment.fileName);
    if (success) {
      setShareSuccess(true);
      setStatusNotice(isEn ? 'Shared successfully' : 'تمت المشاركة بنجاح');
      setTimeout(() => {
        setShareSuccess(false);
        setStatusNotice(null);
      }, 2000);
    }
  };

  if (!attachment || !attachment.url) return null;

  // 1. Image Attachment
  if (attachment.type === 'image') {
    return (
      <div 
        className="mt-1.5 mb-1 flex flex-col items-start w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Clickable Image Container */}
        <div 
          className="relative group rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 max-w-full sm:max-w-xs shadow-xs cursor-pointer select-none"
          onClick={(e) => {
            e.stopPropagation();
            setShowLightbox(true);
          }}
          title={isEn ? "Click to view full image" : "اضغط لعرض الصورة بحجمها الكامل"}
        >
          <img
            src={attachment.url}
            alt={attachment.fileName || (isEn ? 'Attached Image' : 'صورة مرفقة')}
            className="w-full max-h-64 sm:max-h-72 object-cover cursor-pointer transition-transform duration-200 group-hover:scale-102 active:scale-98 block"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <div className="p-2 rounded-xl bg-black/60 text-white backdrop-blur-xs shadow-md">
              <Maximize2 size={18} />
            </div>
          </div>
        </div>

        {/* Fullscreen Lightbox Modal with 3 Compact Bottom Buttons */}
        <AnimatePresence>
          {showLightbox && (
            <div
              className="fixed inset-0 z-[100] flex flex-col justify-between items-center p-3 sm:p-4 bg-black/95 backdrop-blur-md select-none overflow-hidden"
              onClick={(e) => {
                e.stopPropagation();
                setShowLightbox(false);
              }}
              dir={isEn ? 'ltr' : 'rtl'}
            >
              {/* Top status notice if any */}
              <div className="w-full flex items-center justify-center pt-2 min-h-7">
                {statusNotice && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur-md flex items-center gap-1.5"
                  >
                    <Check size={13} className="text-emerald-400 stroke-[2.5]" />
                    <span>{statusNotice}</span>
                  </motion.div>
                )}
              </div>

              {/* Fullscreen Centered Image Display */}
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                className="relative w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden py-1"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={attachment.url}
                  alt={attachment.fileName || (isEn ? 'Attached Image' : 'صورة مرفقة')}
                  className="max-h-full max-w-full w-auto h-auto rounded-2xl shadow-2xl object-contain border border-white/10"
                />
              </motion.div>

              {/* Bottom 3 Compact Action Buttons: Share, Save to phone, Close */}
              <div 
                className="w-full max-w-sm pt-2 pb-2 flex items-center justify-center gap-2 shrink-0 z-10"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 1. زر مشاركة (Share) */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer border border-blue-400/30"
                  title={isEn ? "Share Image" : "مشاركة الصورة"}
                >
                  {shareSuccess ? (
                    <>
                      <Check size={14} className="stroke-[2.5]" />
                      <span>{isEn ? 'Shared' : 'تمت'}</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={14} className="stroke-[2.5]" />
                      <span>{isEn ? 'Share' : 'مشاركة'}</span>
                    </>
                  )}
                </button>

                {/* 2. زر حفظ (Save to phone) */}
                <button
                  type="button"
                  onClick={handleSaveToPhone}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer border border-emerald-400/30"
                  title={isEn ? "Save Image to Phone" : "حفظ الصورة على الهاتف"}
                >
                  {saveSuccess ? (
                    <>
                      <Check size={14} className="stroke-[2.5]" />
                      <span>{isEn ? 'Saved' : 'تم الحفظ'}</span>
                    </>
                  ) : (
                    <>
                      <Download size={14} className="stroke-[2.5]" />
                      <span>{isEn ? 'Save' : 'حفظ'}</span>
                    </>
                  )}
                </button>

                {/* 3. زر إغلاق (Close) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLightbox(false);
                  }}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer border border-rose-400/30"
                  title={isEn ? "Close and return" : "إغلاق والعودة للمحادثة"}
                >
                  <X size={14} className="stroke-[2.5]" />
                  <span>{isEn ? 'Close' : 'إغلاق'}</span>
                </button>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // 2. Video Attachment
  if (attachment.type === 'video') {
    return (
      <div 
        className="mt-1.5 mb-1 flex flex-col items-start w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 max-w-full sm:max-w-xs shadow-xs bg-black">
          <video
            src={attachment.url}
            controls
            playsInline
            preload="metadata"
            className="w-full max-h-64 sm:max-h-72 rounded-2xl"
          />
        </div>

        {/* Action bar below video */}
        <div className="flex items-center justify-between gap-2 w-full mt-1 px-1">
          <span className="text-[10px] opacity-75 truncate max-w-[140px]">
            {attachment.fileName || (isEn ? 'Video' : 'فيديو')} {attachment.fileSize ? `(${formatFileSize(attachment.fileSize)})` : ''}
          </span>
          <button
            type="button"
            onClick={handleSaveToPhone}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline active:scale-95 transition-all cursor-pointer"
            title={isEn ? "Save video to phone" : "حفظ الفيديو على الهاتف"}
          >
            {saveSuccess ? <Check size={12} /> : <Download size={12} />}
            <span>{saveSuccess ? (isEn ? 'Saved' : 'تم الحفظ') : (isEn ? 'Save' : 'حفظ')}</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Document / File Attachment
  const fileName = attachment.fileName || (isEn ? 'Attached File' : 'ملف مرفق');
  const isArchive = fileName.endsWith('.zip') || fileName.endsWith('.rar');
  const isPdf = fileName.endsWith('.pdf');

  return (
    <div 
      className="mt-1.5 mb-1 w-full max-w-full sm:max-w-xs"
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        onClick={handleSaveToPhone}
        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all shadow-xs active:scale-98 ${
          isMe 
            ? 'bg-white/15 hover:bg-white/20 border-white/25 text-white' 
            : 'bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20 text-slate-800 dark:text-slate-100'
        }`}
        title={isEn ? "Save file to phone" : "اضغط لحفظ الملف على الهاتف"}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            {isPdf ? (
              <FileText size={20} />
            ) : isArchive ? (
              <FileArchive size={20} />
            ) : (
              <File size={20} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-bold text-xs truncate leading-tight">
              {fileName}
            </p>
            <p className="text-[10px] opacity-75 mt-0.5">
              {formatFileSize(attachment.fileSize) || (isEn ? 'Document' : 'مستند')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveToPhone}
          className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 shadow-xs active:scale-95 transition-all cursor-pointer"
          title={isEn ? "Save file" : "حفظ الملف"}
        >
          {saveSuccess ? <Check size={15} /> : <Download size={15} />}
        </button>
      </div>

      <div className="flex items-center justify-end mt-1 px-1">
        <button
          type="button"
          onClick={handleSaveToPhone}
          className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Download size={11} />
          <span>{isEn ? 'Save file to phone' : 'حفظ الملف على الهاتف'}</span>
        </button>
      </div>
    </div>
  );
};
