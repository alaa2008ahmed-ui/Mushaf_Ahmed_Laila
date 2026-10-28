
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
  const { isEnabled, toggleEnabled, isListening, showVoiceIcon } = useVoiceControl();
  const { theme, themeKey } = useTheme();

  if (!showVoiceIcon) return null;

  // User explicitly requested: "ايقونه الواتساب وايقونه التحكم الصوتى باللون البنفسجى"
  const isBlackTheme = theme.bgColor === '#000000';
  const themePurpleColor = isBlackTheme 
    ? '#000000' 
    : (themeKey === 'default' 
        ? '#8B5CF6' 
        : (theme.palette[1] || '#8B5CF6'));

  let bgColor = themePurpleColor;
  
  if (isEnabled) {
    bgColor = '#ef4444'; // Red when enabled
  }

  const isBgWhite = !isEnabled && (bgColor.toLowerCase() === '#ffffff' || bgColor.toLowerCase() === 'white' || bgColor.toLowerCase() === 'rgb(255, 255, 255)');
  const iconColor = isBgWhite ? '#000000' : '#ffffff';
  const borderColor = isBgWhite ? '#cccccc' : '#ffffff';

  return (
    <motion.button
      id="voice-control-btn"
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95, y: 2 }}
      onClick={toggleEnabled}
      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all relative overflow-hidden group ${isEnabled ? 'animate-pulse' : ''} ${className || ''}`}
      style={{ 
        ...style,
        backgroundColor: bgColor,
        border: '1px solid rgba(255, 255, 255, 0.85)',
        boxShadow: isBlackTheme 
          ? '0 5px 0 #111111, 0 8px 18px rgba(0,0,0,0.6), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.4)' 
          : '0 5px 0 rgba(0, 0, 0, 0.25), 0 8px 20px -2px rgba(0, 0, 0, 0.2), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.75), inset 0 -2px 4px rgba(0, 0, 0, 0.15)'
      }}
      title={isEnabled ? 'تعطيل التحكم الصوتي' : 'تفعيل التحكم الصوتي'}
    >
      {/* 3D Glossy specular sheen */}
      <div className="absolute inset-x-1 top-0.5 h-[48%] rounded-t-full bg-gradient-to-b from-white/45 via-white/15 to-transparent pointer-events-none"></div>

      {isEnabled ? <Mic className="w-5 h-5 relative z-10 drop-shadow-md" style={{ color: iconColor }} /> : <MicOff className="w-5 h-5 relative z-10 drop-shadow-md" style={{ color: iconColor }} />}
      
      {isEnabled && (
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-red-500 -z-10"
        />
      )}
    </motion.button>
  );
};

export default VoiceControlToggle;
