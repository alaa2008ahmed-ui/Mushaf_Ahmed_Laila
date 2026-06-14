
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

  // Define colors based on state and theme
  let bgColor = 'rgb(156, 163, 175)'; // Gray-400 equivalent
  
  if (isEnabled) {
    if (isListening) {
      bgColor = '#ef4444'; // red-500
    } else {
      // Use theme color
      bgColor = themeKey === 'olive_grove' ? '#65A30D' : (theme.palette[0] || '#22c55e');
    }
  }

  return (
    <motion.button
      id="voice-control-btn"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleEnabled}
      className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-colors border-2 border-white ${isEnabled && isListening ? 'animate-pulse' : ''} ${className || ''}`}
      style={{ 
        ...style,
        backgroundColor: bgColor
      }}
      title={isEnabled ? 'تعطيل التحكم الصوتي' : 'تفعيل التحكم الصوتي'}
    >
      {isEnabled ? <Mic className="text-white w-5 h-5" /> : <MicOff className="text-white w-5 h-5" />}
      
      {isEnabled && isListening && (
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-red-500 -z-10"
        />
      )}
    </motion.button>
  );
};

export default VoiceControlToggle;
