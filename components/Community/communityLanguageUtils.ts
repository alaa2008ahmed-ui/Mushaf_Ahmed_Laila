import { CommunityUser, GroupChat, ADMIN_USER_ID, communityService } from '../../services/communityService';

export const COUNTRY_EN_MAP: Record<string, string> = {
  'السعودية 🇸🇦': 'Saudi Arabia 🇸🇦',
  'مصر 🇪🇬': 'Egypt 🇪🇬',
  'الإمارات 🇦🇪': 'UAE 🇦🇪',
  'الكويت 🇰🇼': 'Kuwait 🇰🇼',
  'قطر 🇶🇦': 'Qatar 🇶🇦',
  'عُمان 🇴🇲': 'Oman 🇴🇲',
  'البحرين 🇧🇭': 'Bahrain 🇧🇭',
  'الأردن 🇯🇴': 'Jordan 🇯🇴',
  'فلسطين 🇵🇸': 'Palestine 🇵🇸',
  'العراق 🇮🇶': 'Iraq 🇮🇶',
  'سوريا 🇸🇾': 'Syria 🇸🇾',
  'لبنان 🇱🇧': 'Lebanon 🇱🇧',
  'اليمن 🇾🇪': 'Yemen 🇾🇪',
  'المغرب 🇲🇦': 'Morocco 🇲🇦',
  'الجزائر 🇩🇿': 'Algeria 🇩🇿',
  'تونس 🇹🇳': 'Tunisia 🇹🇳',
  'ليبيا 🇱🇾': 'Libya 🇱🇾',
  'السودان 🇸🇩': 'Sudan 🇸🇩',
  'موريتانيا 🇲🇷': 'Mauritania 🇲🇷',
  'الصومال 🇸🇴': 'Somalia 🇸🇴',
  'جيبوتي 🇩🇯': 'Djibouti 🇩🇯',
  'جزر القمر 🇰🇲': 'Comoros 🇰🇲',
  'تركيا 🇹🇷': 'Turkey 🇹🇷',
  'إندونيسيا 🇮🇩': 'Indonesia 🇮🇩',
  'ماليزيا 🇲🇾': 'Malaysia 🇲🇾',
  'باكستان 🇵🇰': 'Pakistan 🇵🇰',
  'بنغلاديش 🇧🇩': 'Bangladesh 🇧🇩',
  'إيران 🇮🇷': 'Iran 🇮🇷',
  'أفغانستان 🇦🇫': 'Afghanistan 🇦🇫',
  'نيجيريا 🇳🇬': 'Nigeria 🇳🇬',
  'السنغال 🇸🇳': 'Senegal 🇸🇳',
  'تشاد 🇹🇩': 'Chad 🇹🇩',
  'مالي 🇲🇱': 'Mali 🇲🇱',
  'النيجر 🇳🇪': 'Niger 🇳🇪',
  'غينيا 🇬🇳': 'Guinea 🇬🇳',
  'كوت ديفوار 🇨🇮': 'Ivory Coast 🇨🇮',
  'بوركينا فاسو 🇧🇫': 'Burkina Faso 🇧🇫',
  'سيراليون 🇸🇱': 'Sierra Leone 🇸🇱',
  'غامبيا 🇬🇲': 'Gambia 🇬🇲',
  'كازاخستان 🇰🇿': 'Kazakhstan 🇰🇿',
  'أوزبكستان 🇺🇿': 'Uzbekistan 🇺🇿',
  'تركمانستان 🇹🇲': 'Turkmenistan 🇹🇲',
  'قيرغيزستان 🇰🇬': 'Kyrgyzstan 🇰🇬',
  'طاجيكستان 🇹🇯': 'Tajikistan 🇹🇯',
  'أذربيجان 🇦🇿': 'Azerbaijan 🇦🇿',
  'ألبانيا 🇦🇱': 'Albania 🇦🇱',
  'البوسنة والهرسك 🇧🇦': 'Bosnia & Herzegovina 🇧🇦',
  'كوسوفو 🇽🇰': 'Kosovo 🇽🇰',
  'بروناي 🇧🇳': 'Brunei 🇧🇳',
  'المالديف 🇲🇻': 'Maldives 🇲🇻',
  'الهند 🇮🇳': 'India 🇮🇳',
  'المملكة المتحدة 🇬🇧': 'United Kingdom 🇬🇧',
  'فرنسا 🇫🇷': 'France 🇫🇷',
  'ألمانيا 🇩🇪': 'Germany 🇩🇪',
  'الولايات المتحدة 🇺🇸': 'United States 🇺🇸',
  'كندا 🇨🇦': 'Canada 🇨🇦',
  'أستراليا 🇦🇺': 'Australia 🇦🇺',
  'روسيا 🇷🇺': 'Russia 🇷🇺',
  'الصين 🇨🇳': 'China 🇨🇳',
  'السويد 🇸🇪': 'Sweden 🇸🇪',
  'هولندا 🇳🇱': 'Netherlands 🇳🇱',
  'بلجيكا 🇧🇪': 'Belgium 🇧🇪',
  'إيطاليا 🇮🇹': 'Italy 🇮🇹',
  'إسبانيا 🇪🇸': 'Spain 🇪🇸',
  'سويسرا 🇨🇭': 'Switzerland 🇨🇭',
  'النمسا 🇦🇹': 'Austria 🇦🇹',
  'النرويج 🇳🇴': 'Norway 🇳🇴',
  'الدنمارك 🇩🇰': 'Denmark 🇩🇰',
  'اليابان 🇯🇵': 'Japan 🇯🇵',
  'كوريا الجنوبية 🇰🇷': 'South Korea 🇰🇷',
  'البرازيل 🇧🇷': 'Brazil 🇧🇷',
  'الأرجنتين 🇦🇷': 'Argentina 🇦🇷',
  'جنوب إفريقيا 🇿🇦': 'South Africa 🇿🇦',
  'دولة أخرى / كتابة يدوية ✍️': 'Other Country / Custom ✍️',
  'دولة أخرى 🌍': 'Other country 🌍',
  'دولة أخرى': 'Other country',
  'الإدارة 🛡️': 'Admin 🛡️',
  'الإدارة': 'Admin'
};

export const formatCountryName = (country?: string, isEn?: boolean): string => {
  if (!country) return isEn ? 'Other country 🌍' : 'دولة أخرى 🌍';
  if (!isEn) return country;
  if (COUNTRY_EN_MAP[country]) return COUNTRY_EN_MAP[country];
  const trimmed = country.trim();
  if (COUNTRY_EN_MAP[trimmed]) return COUNTRY_EN_MAP[trimmed];
  return country;
};

export const formatUsername = (user: { userId?: string; username?: string } | null | undefined, isEn?: boolean): string => {
  if (!user) return isEn ? 'Unknown User' : 'مستخدم';
  if (user.userId === ADMIN_USER_ID) {
    return isEn ? 'Technical Support (Admin)' : (user.username || 'الدعم الفني (الإدارة)');
  }
  if (isEn && user.username) {
    if (user.username.includes('الدعم الفني') || user.username.includes('الإدارة')) {
      return 'Technical Support (Admin)';
    }
  }
  return user.username || (isEn ? 'Unknown User' : 'مستخدم');
};

export const formatUserBio = (user: { userId?: string; bio?: string } | null | undefined, isEn?: boolean): string => {
  if (!user) return '';
  if (user.userId === ADMIN_USER_ID && isEn) {
    return 'Welcome! Contact us here if you have any questions or feedback.';
  }
  return user.bio || '';
};

export const formatUserStatusText = (user: CommunityUser | null | undefined, isEn?: boolean): string => {
  if (!user) return isEn ? 'Offline' : 'غير متصل';
  if (communityService.isUserOnline(user)) return isEn ? 'Online' : 'متصل الآن';

  if (!user.lastSeen) return isEn ? 'Offline' : 'غير متصل';
  const lastSeenTime = new Date(user.lastSeen).getTime();
  if (isNaN(lastSeenTime)) return isEn ? 'Offline' : 'غير متصل';

  const diffSeconds = Math.max(0, Math.floor((Date.now() - lastSeenTime) / 1000));
  if (diffSeconds < 60) return isEn ? 'Just now' : 'متوقف منذ لحظات';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return isEn ? `${diffMinutes}m ago` : `متوقف منذ ${diffMinutes} د`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return isEn ? `${diffHours}h ago` : `متوقف منذ ${diffHours} س`;
  const diffDays = Math.floor(diffHours / 24);
  return isEn ? `${diffDays}d ago` : `متوقف منذ ${diffDays} يوم`;
};

export const formatGroupName = (group: { groupId?: string; name?: string } | null | undefined, isEn?: boolean): string => {
  if (!group || !group.name) return '';
  if (isEn) {
    if (
      group.groupId === 'group_default_quran_readers' || 
      group.name.includes('قراء ومحبي القرآن') || 
      group.name.includes('قراء ومحبي')
    ) {
      return 'Quran Readers & Lovers 📖';
    }
    if (
      group.groupId === 'group_default_tadabbur' || 
      group.name.includes('مجلس الذكر وتدبر الآيات') || 
      group.name.includes('مجلس الذكر') ||
      group.name.includes('تدبر الآيات')
    ) {
      return 'Quran Contemplation Circle 🌿';
    }
  }
  return group.name;
};

export const formatGroupDescription = (group: { groupId?: string; description?: string; name?: string } | null | undefined, isEn?: boolean): string => {
  if (!group) return '';
  if (isEn) {
    if (
      group.groupId === 'group_default_quran_readers' || 
      group.description?.includes('مجموعة مباركة لتدارس') || 
      group.description?.includes('share verses') ||
      group.name?.includes('قراء ومحبي') ||
      group.name?.includes('Quran Readers')
    ) {
      return 'A blessed group to share verses, reflections, and recite together';
    }
    if (
      group.groupId === 'group_default_tadabbur' || 
      group.description?.includes('مجلس إيماني لتدبر') || 
      group.description?.includes('معاني الآيات العظيمة') ||
      group.description?.includes('meditating on meanings') ||
      group.name?.includes('تدبر الآيات') ||
      group.name?.includes('مجلس الذكر') ||
      group.name?.includes('Quran Contemplation')
    ) {
      return 'A blessed space for meditating on meanings of the Noble Quran';
    }
  }
  return group.description || '';
};

export const formatLastMessageText = (lastMsg: string | any, isEn?: boolean, partnerUserId?: string): string => {
  const text = typeof lastMsg === 'string' ? lastMsg : (lastMsg?.text || '');
  if (!text) {
    if (partnerUserId === ADMIN_USER_ID) {
      return isEn 
        ? 'Contact app support for help & feedback ✉️' 
        : 'تواصل مع إدارة التطبيق للدعم الفني والشكاوى ✉️';
    }
    return isEn ? 'Start chatting' : 'بدء المحادثة';
  }
  if (isEn) {
    if (text.includes('تواصل مع إدارة التطبيق للدعم الفني')) {
      return 'Contact app support for help & feedback ✉️';
    }
    if (text.includes('لا توجد رسائل (تم حذفها من السيرفر)')) {
      return 'No messages (cleared from server)';
    }
    if (text === 'بدء المحادثة') {
      return 'Start chatting';
    }
  }
  return text;
};
