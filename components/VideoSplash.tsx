import React, { useEffect, useRef, useState, useCallback } from 'react';

const VIDEO_ASPECT_RATIO = 720 / 1280; // 9:16 (0.5625)

interface VideoSplashProps {
  onEnded: () => void;
}

const VideoSplash: React.FC<VideoSplashProps> = ({ onEnded }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [isWiderViewport, setIsWiderViewport] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth / Math.max(1, window.innerHeight) > VIDEO_ASPECT_RATIO;
  });

  const hasEndedCalledRef = useRef(false);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  const handleEnded = useCallback(() => {
    if (hasEndedCalledRef.current) return;
    hasEndedCalledRef.current = true;
    setIsFading(true);
    setTimeout(() => {
      onEndedRef.current();
    }, 250);
  }, []);

  // متابعة أبعاد الشاشة لضمان التوافق التام مع جميع الهواتف الصغيرة والكبيرة والأجهزة اللوحية
  useEffect(() => {
    const updateViewportMode = () => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      setIsWiderViewport(w / h > VIDEO_ASPECT_RATIO);
    };

    updateViewportMode();
    window.addEventListener('resize', updateViewportMode);
    window.addEventListener('orientationchange', updateViewportMode);
    return () => {
      window.removeEventListener('resize', updateViewportMode);
      window.removeEventListener('orientationchange', updateViewportMode);
    };
  }, []);

  // رسم امتداد حواف الفيديو لحظياً لملء كامل الشاشة بسلاسة تامة دون أي أشرطة سوداء أو اقتصاص
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let rafId: number | null = null;
    let isActive = true;

    const renderAmbientBackdrop = () => {
      if (!isActive) return;

      if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        const viewW = Math.max(1, window.innerWidth);
        const viewH = Math.max(1, window.innerHeight);
        const screenRatio = viewW / viewH;

        const cw = 96;
        const ch = Math.max(64, Math.round(cw / screenRatio));

        if (canvas.width !== cw || canvas.height !== ch) {
          canvas.width = cw;
          canvas.height = ch;
        }

        const srcW = video.videoWidth;
        const srcH = video.videoHeight;
        const videoRatio = srcW / srcH;

        if (screenRatio < videoRatio) {
          // الشاشات الطولية الحديثة (مثل 9:19.5 و 9:20 و 9:21): تمديد الحافة العلوية والسفلية للفيديو
          const drawH = cw / videoRatio;
          const drawY = (ch - drawH) / 2;
          const edgeStripH = Math.max(4, Math.round(srcH * 0.025));

          // امتداد الجزء العلوي
          if (drawY > 0) {
            ctx.drawImage(video, 0, 0, srcW, edgeStripH, 0, 0, cw, Math.ceil(drawY + 4));
          }
          // امتداد الجزء السفلي
          if (ch - (drawY + drawH) > 0) {
            ctx.drawImage(
              video,
              0,
              srcH - edgeStripH,
              srcW,
              edgeStripH,
              0,
              Math.floor(drawY + drawH - 4),
              cw,
              Math.ceil(ch - (drawY + drawH) + 4)
            );
          }
          // قلب الفيديو في المنتصف لمطابقة الإضاءة
          ctx.drawImage(video, 0, 0, srcW, srcH, 0, drawY, cw, drawH);
        } else {
          // الشاشات الأعرض أو الصغيرة القصيرة والأجهزة اللوحية: تمديد الحافة اليمنى واليسرى للفيديو
          const drawW = ch * videoRatio;
          const drawX = (cw - drawW) / 2;
          const edgeStripW = Math.max(2, Math.round(srcW * 0.01));

          // امتداد الجانب الأيسر
          if (drawX > 0) {
            ctx.drawImage(video, 0, 0, edgeStripW, srcH, 0, 0, Math.ceil(drawX + 4), ch);
          }
          // امتداد الجانب الأيمن
          if (cw - (drawX + drawW) > 0) {
            ctx.drawImage(
              video,
              srcW - edgeStripW,
              0,
              edgeStripW,
              srcH,
              Math.floor(drawX + drawW - 4),
              0,
              Math.ceil(cw - (drawX + drawW) + 4),
              ch
            );
          }
          // قلب الفيديو في المنتصف
          ctx.drawImage(video, 0, 0, srcW, srcH, drawX, 0, drawW, ch);
        }
      }

      rafId = window.requestAnimationFrame(renderAmbientBackdrop);
    };

    rafId = window.requestAnimationFrame(renderAmbientBackdrop);

    return () => {
      isActive = false;
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isMounted = true;

    // ضبط الخصائص مباشرة على عنصر DOM لضمان تشغيل الفيديو تلقائياً في جميع المتصفحات والويب فيو
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', 'true');

    if (video.readyState >= 2) {
      setIsReady(true);
    }

    const startPlay = async () => {
      if (!video) return;
      try {
        if (video.paused) {
          await video.play();
        }
        if (isMounted) {
          setIsReady(true);
        }
      } catch (err: any) {
        console.warn('VideoSplash autoplay attempt:', err);
        if (video && video.paused) {
          try {
            video.muted = true;
            await video.play();
            if (isMounted) setIsReady(true);
            return;
          } catch (retryErr) {
            console.warn('VideoSplash retry error:', retryErr);
          }
        }
        if (isMounted && !hasEndedCalledRef.current) {
          handleEnded();
        }
      }
    };

    startPlay();

    // مؤقت أمان احتياطي بعد انتهاء مدة الفيديو الفعلية (5.87 ثانية) لضمان عدم تقطيع نهايته أو تعليق التطبيق
    const safetyTimeout = setTimeout(() => {
      if (isMounted && !hasEndedCalledRef.current) {
        handleEnded();
      }
    }, 8000);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
    };
  }, [handleEnded]);

  // دمج ناعم جداً لأقصى أطراف الفيديو الفارغة مع خلفية الامتداد لضمان عدم ظهور أي خط فاصل
  const seamlessMask = isWiderViewport
    ? 'linear-gradient(to right, transparent 0%, black 1.6%, black 98.4%, transparent 100%)'
    : 'linear-gradient(to bottom, transparent 0%, black 3%, black 97%, transparent 100%)';

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden transition-opacity duration-300 pointer-events-none select-none ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(180deg, #e7e8d7 0%, #e4e5d5 50%, #e4e5d6 100%)',
        width: '100%',
        height: '100dvh',
        minHeight: '100vh',
      }}
    >
      {/* طبقة الامتداد الذكي لخلفية الفيديو لملء كامل الشاشة من الحافة للحافة في جميع مقاسات الهواتف */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 ${
          isReady ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          filter: 'blur(14px)',
          transform: 'scale(1.06)',
        }}
      />

      {/* الفيديو الأساسي الكامل بدون أي اقتصاص نهائياً لجميع النصوص والعناصر */}
      <video
        ref={videoRef}
        className={`relative z-10 w-full h-full object-contain object-center pointer-events-none transition-opacity duration-200 ${
          isReady ? 'opacity-100' : 'opacity-0'
        }`}
        src="/splash.mp4"
        autoPlay
        muted
        playsInline
        webkit-playsinline="true"
        preload="auto"
        disablePictureInPicture
        controls={false}
        onLoadedData={() => setIsReady(true)}
        onCanPlay={() => setIsReady(true)}
        onEnded={handleEnded}
        onError={() => {
          console.warn('Video splash encountered an error, continuing');
          handleEnded();
        }}
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          objectPosition: 'center center',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
          WebkitMaskImage: seamlessMask,
          maskImage: seamlessMask,
        }}
      />
    </div>
  );
};

export default VideoSplash;
