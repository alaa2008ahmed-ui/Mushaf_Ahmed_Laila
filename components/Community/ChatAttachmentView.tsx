import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, FileText, Maximize2, X, File, FileArchive, Check } from 'lucide-react';
import { ChatAttachment } from '../../services/communityService';

interface ChatAttachmentViewProps {
  attachment: ChatAttachment;
  isMe?: boolean;
}

export const downloadAttachment = (url: string, fileName?: string) => {
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `mushaf_file_${Date.now()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error('Error downloading file:', err);
    window.open(url, '_blank');
  }
};

export const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ك.ب`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} م.ب`;
};

export const ChatAttachmentView: React.FC<ChatAttachmentViewProps> = ({ attachment, isMe }) => {
  const [showLightbox, setShowLightbox] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadAttachment(attachment.url, attachment.fileName);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  if (!attachment || !attachment.url) return null;

  // 1. Image Attachment
  if (attachment.type === 'image') {
    return (
      <div className="mt-1.5 mb-1 flex flex-col items-start w-full">
        <div className="relative group rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 max-w-full sm:max-w-xs shadow-xs">
          <img
            src={attachment.url}
            alt={attachment.fileName || 'صورة مرفقة'}
            onClick={() => setShowLightbox(true)}
            className="w-full max-h-64 sm:max-h-72 object-cover cursor-pointer transition-transform duration-200 group-hover:scale-102 active:scale-98"
            loading="lazy"
          />

          {/* Quick overlay buttons */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
            <button
              type="button"
              onClick={() => setShowLightbox(true)}
              className="p-2 rounded-xl bg-white/90 text-slate-800 shadow-md pointer-events-auto active:scale-95 transition-all"
              title="تكبير الصورة"
            >
              <Maximize2 size={16} />
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="p-2 rounded-xl bg-emerald-600 text-white shadow-md pointer-events-auto active:scale-95 transition-all"
              title="استرداد / تنزيل الصورة"
            >
              {downloadSuccess ? <Check size={16} /> : <Download size={16} />}
            </button>
          </div>
        </div>

        {/* Action bar below image */}
        <div className="flex items-center justify-between gap-2 w-full mt-1 px-1">
          <span className="text-[10px] opacity-75 truncate max-w-[140px]">
            {attachment.fileName || 'صورة'} {attachment.fileSize ? `(${formatFileSize(attachment.fileSize)})` : ''}
          </span>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline active:scale-95 transition-all cursor-pointer"
            title="استرداد وحفظ الصورة على جهازك"
          >
            {downloadSuccess ? <Check size={12} /> : <Download size={12} />}
            <span>{downloadSuccess ? 'تم الحفظ' : 'استرداد الصورة'}</span>
          </button>
        </div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {showLightbox && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md"
              onClick={() => setShowLightbox(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative max-w-3xl max-h-[90vh] flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute -top-12 left-0 right-0 flex items-center justify-between px-2 text-white">
                  <span className="text-xs font-bold truncate max-w-[200px]">
                    {attachment.fileName || 'معاينة الصورة'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-lg active:scale-95 transition-all"
                    >
                      {downloadSuccess ? <Check size={14} /> : <Download size={14} />}
                      <span>{downloadSuccess ? 'تم الحفظ!' : 'استرداد وتنزيل'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLightbox(false)}
                      className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <img
                  src={attachment.url}
                  alt={attachment.fileName || 'صورة'}
                  className="max-h-[80vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border border-white/10"
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // 2. Video Attachment
  if (attachment.type === 'video') {
    return (
      <div className="mt-1.5 mb-1 flex flex-col items-start w-full">
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
            {attachment.fileName || 'فيديو'} {attachment.fileSize ? `(${formatFileSize(attachment.fileSize)})` : ''}
          </span>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline active:scale-95 transition-all cursor-pointer"
            title="استرداد وحفظ الفيديو على جهازك"
          >
            {downloadSuccess ? <Check size={12} /> : <Download size={12} />}
            <span>{downloadSuccess ? 'تم الحفظ' : 'استرداد الفيديو'}</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Document / File Attachment
  const fileName = attachment.fileName || 'ملف مرفق';
  const isArchive = fileName.endsWith('.zip') || fileName.endsWith('.rar');
  const isPdf = fileName.endsWith('.pdf');

  return (
    <div className="mt-1.5 mb-1 w-full max-w-full sm:max-w-xs">
      <div 
        onClick={handleDownload}
        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all shadow-xs active:scale-98 ${
          isMe 
            ? 'bg-white/15 hover:bg-white/20 border-white/25 text-white' 
            : 'bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20 text-slate-800 dark:text-slate-100'
        }`}
        title="اضغط لاسترداد وتحميل الملف على جهازك"
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
              {formatFileSize(attachment.fileSize) || 'مستند'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 shadow-xs active:scale-95 transition-all cursor-pointer"
          title="استرداد وتحميل الملف"
        >
          {downloadSuccess ? <Check size={15} /> : <Download size={15} />}
        </button>
      </div>

      <div className="flex items-center justify-end mt-1 px-1">
        <button
          type="button"
          onClick={handleDownload}
          className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Download size={11} />
          <span>استرداد وتحميل الملف</span>
        </button>
      </div>
    </div>
  );
};
