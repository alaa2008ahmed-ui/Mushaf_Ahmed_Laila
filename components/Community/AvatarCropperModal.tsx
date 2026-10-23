import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, ZoomIn, ZoomOut, RotateCw, Sparkles, Wand2 } from 'lucide-react';

interface AvatarCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onCropComplete: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

export const AvatarCropperModal: React.FC<AvatarCropperModalProps> = ({
  isOpen,
  imageSrc,
  onCropComplete,
  onCancel,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [imgNaturalSize, setImgNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number>(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Viewport circle size in pixels on screen
  const boxSize = 270;

  // Reset transform whenever a new image is loaded
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setIsEnhanced(false);
    }
  }, [isOpen, imageSrc]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const naturalWidth = e.currentTarget.naturalWidth || 1;
    const naturalHeight = e.currentTarget.naturalHeight || 1;
    setImgNaturalSize({ width: naturalWidth, height: naturalHeight });
  };

  // Compute base cover dimensions so the image fills the circle perfectly with maximum sharpness
  const imgAspect = imgNaturalSize.width && imgNaturalSize.height 
    ? imgNaturalSize.width / imgNaturalSize.height 
    : 1;

  let baseWidth = boxSize;
  let baseHeight = boxSize;
  if (imgAspect >= 1) {
    baseHeight = boxSize;
    baseWidth = Math.round(boxSize * imgAspect);
  } else {
    baseWidth = boxSize;
    baseHeight = Math.round(boxSize / imgAspect);
  }

  // Mouse Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Touch handlers (Drag & Pinch to Zoom)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { ...pan };
      pinchStartDistRef.current = null;
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartDistRef.current = dist;
      pinchStartZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      });
    } else if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / pinchStartDistRef.current;
      const newZoom = Math.min(Math.max(pinchStartZoomRef.current * ratio, 0.8), 3.5);
      setZoom(newZoom);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    pinchStartDistRef.current = null;
  };

  // Perform ultra-crisp crop on high-resolution canvas (512x512)
  const handleConfirmCrop = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;

    const cropOutputSize = 512;
    const canvas = document.createElement('canvas');
    canvas.width = cropOutputSize;
    canvas.height = cropOutputSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Optional clarity and color boost filter if enabled
    if (isEnhanced) {
      ctx.filter = 'contrast(1.08) brightness(1.06) saturate(1.06)';
    }

    ctx.save();
    // Move to center of canvas
    ctx.translate(cropOutputSize / 2, cropOutputSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    const scaleFactor = cropOutputSize / boxSize;
    const drawWidth = baseWidth * zoom * scaleFactor;
    const drawHeight = baseHeight * zoom * scaleFactor;
    const drawX = (pan.x * scaleFactor) - (drawWidth / 2);
    const drawY = (pan.y * scaleFactor) - (drawHeight / 2);

    ctx.drawImage(
      img,
      drawX,
      drawY,
      drawWidth,
      drawHeight
    );

    ctx.restore();

    try {
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      onCropComplete(croppedDataUrl);
    } catch (e) {
      console.error('Failed to export crop:', e);
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Sparkles size={16} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                تحديد وقص الصورة الشخصية
              </h3>
            </div>
            <button
              onClick={onCancel}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Hint */}
          <div className="px-4 pt-2.5 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              اسحب الصورة أو استخدم شريط التكبير لاختيار الجزء المناسب للوجه
            </p>
          </div>

          {/* Cropper Viewport Container with clean backdrop */}
          <div className="relative my-3 flex items-center justify-center overflow-hidden py-1">
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="relative w-[270px] h-[270px] rounded-full overflow-hidden bg-slate-900 cursor-grab active:cursor-grabbing border-2 border-emerald-500 shadow-2xl select-none touch-none flex items-center justify-center ring-4 ring-emerald-500/25"
              style={{
                boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.72)',
              }}
            >
              {/* Target Image - rendered with full natural sharpness */}
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={handleImageLoad}
                draggable={false}
                className="max-w-none pointer-events-none"
                style={{
                  width: `${baseWidth}px`,
                  height: `${baseHeight}px`,
                  transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  filter: isEnhanced ? 'contrast(1.08) brightness(1.06) saturate(1.06)' : 'none',
                  imageRendering: 'auto',
                  willChange: 'transform',
                }}
              />

              {/* Faint Grid Guides - ONLY visible while actively dragging/zooming, never obscuring faces */}
              <div 
                className={`absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 transition-opacity duration-200 ${
                  isDragging ? 'opacity-35' : 'opacity-0'
                }`}
              >
                <div className="border-r border-b border-white/60" />
                <div className="border-r border-b border-white/60" />
                <div className="border-b border-white/60" />
                <div className="border-r border-b border-white/60" />
                <div className="border-r border-b border-white/60" />
                <div className="border-b border-white/60" />
                <div className="border-r border-white/60" />
                <div className="border-r border-white/60" />
                <div />
              </div>
            </div>
          </div>

          {/* Controls toolbar */}
          <div className="px-5 py-2 flex flex-col gap-2.5">
            {/* Zoom Slider with + and - quick buttons */}
            <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-800/80 p-2 px-3 rounded-2xl">
              <button
                type="button"
                onClick={() => setZoom(z => Math.max(0.8, Number((z - 0.15).toFixed(2))))}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 active:scale-95"
                title="تصغير"
              >
                <ZoomOut size={16} />
              </button>
              <input
                type="range"
                min="0.8"
                max="3.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-emerald-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setZoom(z => Math.min(3.5, Number((z + 0.15).toFixed(2))))}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 active:scale-95"
                title="تكبير"
              >
                <ZoomIn size={16} />
              </button>
            </div>

            {/* Actions: Rotate, Clarity Boost, and Reset */}
            <div className="flex items-center justify-between gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors active:scale-95"
              >
                <RotateCw size={13} />
                <span>تدوير 90°</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEnhanced(!isEnhanced)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-bold rounded-xl transition-all active:scale-95 ${
                  isEnhanced 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="تحسين إضاءة وألوان الصورة تلقائياً"
              >
                <Wand2 size={13} />
                <span>{isEnhanced ? 'تم التوضيح ✨' : 'توضيح الألوان'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setRotation(0);
                  setPan({ x: 0, y: 0 });
                  setIsEnhanced(false);
                }}
                className="py-1.5 px-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl transition-colors active:scale-95"
              >
                إعادة ضبط
              </button>
            </div>
          </div>

          {/* Bottom Actions (Confirm & Cancel) */}
          <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <button
              type="button"
              onClick={handleConfirmCrop}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <Check size={18} />
              <span>قص وتأكيد الصورة</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-sm active:scale-95 transition-all cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
