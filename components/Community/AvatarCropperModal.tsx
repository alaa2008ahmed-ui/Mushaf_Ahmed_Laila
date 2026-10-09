import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, ZoomIn, ZoomOut, RotateCw, Move, Sparkles } from 'lucide-react';

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
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number>(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset transform whenever a new image is loaded
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  // Touch and Mouse Drag handlers
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

  // Perform crop on canvas
  const handleConfirmCrop = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;

    const cropOutputSize = 256;
    const canvas = document.createElement('canvas');
    canvas.width = cropOutputSize;
    canvas.height = cropOutputSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Viewport box is 260px x 260px on screen
    const boxSize = 260;

    ctx.save();
    // Move to center of canvas
    ctx.translate(cropOutputSize / 2, cropOutputSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Calculate scale factor relative to container
    const scaleFactor = cropOutputSize / boxSize;
    const currentZoom = zoom * scaleFactor;

    // Determine aspect ratio fit
    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawWidth = boxSize;
    let drawHeight = boxSize;

    if (imgAspect > 1) {
      drawWidth = boxSize * imgAspect;
    } else {
      drawHeight = boxSize / imgAspect;
    }

    const drawX = (pan.x * scaleFactor) - (drawWidth * currentZoom) / 2;
    const drawY = (pan.y * scaleFactor) - (drawHeight * currentZoom) / 2;

    ctx.drawImage(
      img,
      drawX,
      drawY,
      drawWidth * currentZoom,
      drawHeight * currentZoom
    );

    ctx.restore();

    try {
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      onCropComplete(croppedDataUrl);
    } catch (e) {
      console.error('Failed to export crop:', e);
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
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
            <p className="text-xs text-slate-500 dark:text-slate-400">
              حرّك الصورة واسحبها أو استخدم التكبير لاختيار الجزء المناسب للوجه
            </p>
          </div>

          {/* Cropper Viewport */}
          <div className="relative my-3 flex items-center justify-center">
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="relative w-[260px] h-[260px] rounded-full overflow-hidden bg-slate-950 shadow-inner cursor-grab active:cursor-grabbing border-4 border-emerald-500/40 select-none touch-none flex items-center justify-center"
              style={{
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
              }}
            >
              {/* Target Image */}
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                draggable={false}
                className="max-w-none pointer-events-none transition-transform duration-75 ease-out"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  width: '260px',
                  height: '260px',
                  objectFit: 'contain',
                }}
              />

              {/* Grid Guides Overlay */}
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20 border border-white/40">
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-white" />
                <div className="border-r border-white" />
                <div />
              </div>

              {/* Center crosshair */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                <Move size={28} className="text-white" />
              </div>
            </div>
          </div>

          {/* Controls toolbar */}
          <div className="px-5 py-2 flex flex-col gap-2.5">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/80 p-2 px-3 rounded-2xl">
              <ZoomOut size={16} className="text-slate-400 flex-shrink-0" />
              <input
                type="range"
                min="0.8"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-emerald-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <ZoomIn size={16} className="text-slate-400 flex-shrink-0" />
            </div>

            {/* Actions: Rotate & Reset */}
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors active:scale-95"
              >
                <RotateCw size={14} />
                <span>تدوير 90°</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setRotation(0);
                  setPan({ x: 0, y: 0 });
                }}
                className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors active:scale-95"
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
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Check size={18} />
              <span>قص وتأكيد الصورة</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-sm active:scale-95 transition-all"
            >
              إلغاء
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
