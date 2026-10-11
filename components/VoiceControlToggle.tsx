
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

  // Define colors based on state and theme:
  // When inactive (!isEnabled): WhatsApp green / theme color (changes according to selected theme)
  // When active (isEnabled): current red color (#ef4444)
  const isBlackTheme = theme.bgColor === '#000000';
  const themePrimaryColor = isBlackTheme 
    ? '#000000' 
    : (themeKey === 'olive_grove' 
        ? '#65A30D' 
        : (theme.palette[0] || '#10b981'));

  let bgColor = themePrimaryColor;
  
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
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleEnabled}
      className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-colors border-2 ${isEnabled ? 'animate-pulse' : ''} ${className || ''}`}
      style={{ 
        ...style,
        backgroundColor: bgColor,
        borderColor: borderColor
      }}
      title={isEnabled ? 'تعطيل التحكم الصوتي' : 'تفعيل التحكم الصوتي'}
    >
      {isEnabled ? <Mic className="w-5 h-5" style={{ color: iconColor }} /> : <MicOff className="w-5 h-5" style={{ color: iconColor }} />}
      
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
