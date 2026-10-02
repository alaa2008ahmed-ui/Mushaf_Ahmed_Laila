import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Smile, Heart, Sparkles, MessageSquare, Hand, Moon } from 'lucide-react';

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}

const EMOJI_CATEGORIES = [
  {
    id: 'islamic',
    name: 'إسلامية 🕌',
    icon: Moon,
    emojis: ['🕌', '🌙', '🤲', '✨', '📖', '🕋', '📿', '⭐', '🌸', '🌹', '❤️', '💚', '🤍', '🕊️']
  },
  {
    id: 'feelings',
    name: 'تعبيرات 😄',
    icon: Smile,
    emojis: ['😄', '😊', '😍', '🥰', '😌', '😇', '🤲', '😎', '🤗', '👍', '👏', '🙌', '🙏', '💯']
  },
  {
    id: 'reactions',
    name: 'تفاعلات 👍',
    icon: Hand,
    emojis: ['👍', '👌', '🤝', '👏', '🙌', '❤️', '💖', '⭐', '🔥', '✨', '🎁', '🎉', '💪', '📌']
  },
  {
    id: 'hearts',
    name: 'قلوب ❤️',
    icon: Heart,
    emojis: ['❤️', '💚', '💙', '💜', '🤍', '🧡', '🤎', '💖', '💗', '💓', '💞', '💕', '💘', '💝']
  }
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelectEmoji, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('islamic');

  const currentCategory = EMOJI_CATEGORIES.find((c) => c.id === activeCategory) || EMOJI_CATEGORIES[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 w-72 sm:w-80 z-50 overflow-hidden"
      dir="rtl"
    >
      {/* Category Tabs */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2 overflow-x-auto">
        {EMOJI_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon size={14} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Emoji Grid */}
      <div className="grid grid-cols-7 gap-1.5 max-h-48 overflow-y-auto p-1">
        {currentCategory.emojis.map((emoji, idx) => (
          <button
            key={idx}
            onClick={() => onSelectEmoji(emoji)}
            className="text-2xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-transform active:scale-125 flex items-center justify-center"
          >
            {emoji}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default EmojiPicker;
