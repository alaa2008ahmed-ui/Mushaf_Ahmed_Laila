
import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import { useVoiceControl } from '../context/VoiceControlContext';

interface VoiceControlToggleProps {
    className?: string;
    style?: React.CSSProperties;
}

const VoiceControlToggle: React.FC<VoiceControlToggleProps> = ({ className, style }) => {
  const { isEnabled, toggleEnabled, showVoiceIcon } = useVoiceControl();

  if (!showVoiceIcon) return null;

  return (
    <motion.button
      id="voice-control-btn"
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleEnabled}
      className={`p-1.5 flex items-center justify-center transition-all bg-transparent border-none outline-none cursor-pointer select-none shrink-0 ${className || ''}`}
      style={style}
      title={isEnabled ? 'تعطيل التحكم الصوتي' : 'تفعيل التحكم الصوتي'}
    >
      {isEnabled ? (
        <div className="relative flex items-center justify-center">
          <Mic className="w-6 h-6 text-amber-500 dark:text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]" strokeWidth={2.4} />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
        </div>
      ) : (
        <div className="relative flex items-center justify-center">
          <MicOff className="w-6 h-6 text-amber-600 dark:text-amber-400 hover:text-amber-700 drop-shadow-[0_1px_3px_rgba(217,119,6,0.4)]" strokeWidth={2.4} />
        </div>
      )}
    </motion.button>
  );
};

export default VoiceControlToggle;
