
import React, { useEffect, useRef, useState } from 'react';

interface VideoSplashProps {
  onEnded: () => void;
}

const VideoSplash: React.FC<VideoSplashProps> = ({ onEnded }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      // If video is already loaded enough, show it
      if (videoRef.current.readyState >= 2) {
        setIsReady(true);
      }
      
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          if (error.name !== 'AbortError') {
            console.error("Video play failed:", error);
            onEnded();
          }
        });
      }
    }
  }, [onEnded]);

  const handleEnded = () => {
    setIsFading(true);
    // Remove the splash slightly before the fade ends to ensure the home page is visible
    setTimeout(onEnded, 450); 
  };

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}
      style={{ backgroundColor: 'black' }}
    >
      <video
        ref={videoRef}
        className={`w-full h-full object-cover pointer-events-none transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}
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
        onStalled={onEnded}
        onError={onEnded}
        style={{ 
          WebkitMaskImage: '-webkit-radial-gradient(white, black)',
          backgroundColor: 'black'
        }} 
      />
    </div>
  );
};

export default VideoSplash;
