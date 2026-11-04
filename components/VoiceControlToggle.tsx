
import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import { useVoiceControl } from '../context/VoiceControlContext';
import { useTheme } from '../context/ThemeContext';

interface VoiceControlToggleProps {
    className?: string;
    style?: React.CSSProperties;
}

const VoiceControlToggle: React.FC<VoiceControlToggleProps> = ({ className, style }) => {
  const { isEnabled, toggleEnabled, showVoiceIcon } = useVoiceControl();
  const { isNightMode, homeThemeVariant } = useTheme();

  if (!showVoiceIcon) return null;

  const isSkyTheme = !isNightMode && homeThemeVariant === 'sky';
  const isEmeraldTheme = !isNightMode && homeThemeVariant === 'emerald';

  const iconColor = isNightMode 
    ? '#F59E0B' 
    : (isSkyTheme 
        ? '#0369a1' 
        : (isEmeraldTheme 
            ? '#047857' 
            : '#C25E00'));

  const pingColor = isNightMode 
    ? '#FBBF24' 
    : (isSkyTheme 
        ? '#38BDF8' 
        : (isEmeraldTheme 
            ? '#34D399' 
            : '#F59E0B'));

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
          <Mic className="w-6 h-6 drop-shadow-md" style={{ color: iconColor }} strokeWidth={2.4} />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: pingColor }}></span>
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: iconColor }}></span>
          </span>
        </div>
      ) : (
        <div className="relative flex items-center justify-center">
          <MicOff className="w-6 h-6 drop-shadow-md" style={{ color: iconColor }} strokeWidth={2.4} />
        </div>
      )}
    </motion.button>
  );
};

export default VoiceControlToggle;
