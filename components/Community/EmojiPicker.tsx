import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Smile, Heart, Hand, Moon, Sparkles, MessageCircle, Sun } from 'lucide-react';

interface EmojiPickerProps {
  onSelectEmoji: (emojiOrText: string) => void;
  onClose: () => void;
}

interface Category {
  id: string;
  name: string;
  icon: any;
  type: 'emoji' | 'text';
  items: string[];
}

const CATEGORIES: Category[] = [
  {
    id: 'islamic_text',
    name: 'أذكار وعبارات 🕌',
    icon: Moon,
    type: 'text',
    items: [
      'الحمد لله 🤲',
      'الله أكبر 🌟',
      'سبحان الله وبحمده ✨',
      'لا إله إلا الله 🕊️',
      'لا حول ولا قوة إلا بالله 💎',
      'أستغفر الله العظيم 🌿',
      'اللهم صلِّ وسلِّم على نبينا محمد ﷺ',
      'ما شاء الله تبارك الله 🌸',
      'حسبي الله ونعم الوكيل 🛡️',
      'توكلت على الله 💫',
      'إنّا لله وإنّا إليه راجعون 🤍',
      'جزاك الله خيراً 🌹',
      'بارك الله فيك ونفع بك 🌷',
      'وفقك الله وسدد خطاك 💐',
      'تقبل الله منا ومنكم 🤲',
      'اللهم اغفر لنا وارحمنا 🌙',
      'يا حي يا قيوم برحمتك أستغيث 🌸',
      'رب اشرح لي صدري 🕊️'
    ]
  },
  {
    id: 'greetings_text',
    name: 'تحيات وترحيب 🌸',
    icon: Sun,
    type: 'text',
    items: [
      'السلام عليكم ورحمة الله وبركاته 🤍',
      'وعليكم السلام ورحمة الله وبركاته 🌿',
      'صباح الخير والبركة ☀️',
      'صباح النور والسرور 🌸',
      'مساء الخير والأنوار 🌙',
      'مساء الورد والياسمين 🌹',
      'جمعة مباركة طيبة 🕌',
      'تقبل الله طاعتكم 🤲',
      'أهلاً وسهلاً بك 💐',
      'في أمان الله وحفظه 🕊️',
      'دمتم بخير وعافية 💎',
      'مبارك عليكم وعلينا 🌟',
      'جعلها الله في ميزان حسناتك ✨',
      'أسعد الله جميع أوقاتكم 🌺',
      'طابت أوقاتكم بكل خير 🌷'
    ]
  },
  {
    id: 'feelings',
    name: 'تعبيرات 😄',
    icon: Smile,
    type: 'emoji',
    items: [
      '😄', '😃', '😀', '😊', '😍', '🥰', '😌', '😇',
      '🤲', '😎', '🤗', '🤩', '🥳', '🥹', '☺️', '😚',
      '😋', '🧐', '🤓', '🤠', '🤐', '🤫', '🤔', '🫡',
      '🤤', '😻', '😺', '😽', '😴', '🥺', '💖', '✨'
    ]
  },
  {
    id: 'reactions',
    name: 'تفاعلات 👍',
    icon: Hand,
    type: 'emoji',
    items: [
      '👍', '👌', '🤝', '👏', '🙌', '🙏', '✌️', '🤟',
      '💯', '🔥', '⭐', '🌟', '💎', '🏆', '🎖️', '🎯',
      '📌', '💫', '🕊️', '👑', '🛡️', '💡', '🏷️', '📢',
      '🔔', '🎁', '🎉', '💪', '🌱', '🌿', '🌾', '🌴'
    ]
  },
  {
    id: 'hearts',
    name: 'قلوب ومشاعر ❤️',
    icon: Heart,
    type: 'emoji',
    items: [
      '❤️', '💚', '🤍', '💙', '💜', '💛', '🧡', '🤎',
      '💖', '💗', '💓', '💞', '💕', '💘', '💝', '🌹',
      '🌸', '🌷', '💐', '🌺', '🌻', '🏵️', '🥀', '🌿',
      '✨', '💫', '🕊️', '💌', '💎', '🎀', '🪄', '🔮'
    ]
  },
  {
    id: 'islamic_symbols',
    name: 'رموز ومصحف 🌙',
    icon: Sparkles,
    type: 'emoji',
    items: [
      '🕌', '🕋', '📖', '📿', '🌙', '⭐', '🕯️', '📜',
      '🕊️', '🌴', '🌿', '🌾', '💧', '⛅', '☀️', '🌈',
      '🏛️', '🗝️', '🪔', '🏮', '🕋', '🤲', '🤍', '✨'
    ]
  }
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelectEmoji, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('islamic_text');

  const currentCategory = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.94 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-3.5 w-80 sm:w-96 z-50 overflow-hidden"
      dir="rtl"
    >
      {/* Category Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-2.5 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={14} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Content View: Text Stickers vs Emojis Grid */}
      <div className="max-h-56 overflow-y-auto pr-1 space-y-1.5" style={{ WebkitOverflowScrolling: 'touch' }}>
        {currentCategory.type === 'text' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {currentCategory.items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectEmoji(item);
                  onClose();
                }}
                className="p-2.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/40 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 text-xs font-bold text-right transition-all active:scale-95 shadow-sm leading-relaxed"
              >
                {item}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-8 gap-1 p-1">
            {currentCategory.items.map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectEmoji(emoji);
                }}
                className="text-2xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-transform active:scale-125 flex items-center justify-center"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EmojiPicker;
