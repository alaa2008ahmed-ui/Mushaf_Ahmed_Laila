export interface WorldLocationEntry {
    id: string;
    type: 'city' | 'country' | 'region';
    nameAr: string;
    nameEn: string;
    regionAr?: string;
    regionEn?: string;
    countryAr: string;
    countryEn: string;
    countryCode: string;
    lat: number;
    lng: number;
    aliasesAr?: string[];
    aliasesEn?: string[];
    priority?: number;
}

export const WORLD_LOCATIONS_DATA: WorldLocationEntry[] = [
    // ==================== COUNTRIES ====================
    {
        id: 'country-eg', type: 'country',
        nameAr: 'جمهورية مصر العربية', nameEn: 'Egypt',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 30.0444, lng: 31.2357,
        aliasesAr: ['مصر', 'جمهورية مصر'], aliasesEn: ['Egypt', 'Arab Republic of Egypt'],
        priority: 100
    },
    {
        id: 'country-sa', type: 'country',
        nameAr: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia',
        countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', countryCode: 'sa',
        lat: 24.7136, lng: 46.6753,
        aliasesAr: ['السعودية', 'السعوديه'], aliasesEn: ['KSA', 'Kingdom of Saudi Arabia'],
        priority: 100
    },
    {
        id: 'country-ae', type: 'country',
        nameAr: 'الإمارات العربية المتحدة', nameEn: 'United Arab Emirates',
        countryAr: 'الإمارات العربية المتحدة', countryEn: 'United Arab Emirates', countryCode: 'ae',
        lat: 24.4539, lng: 54.3773,
        aliasesAr: ['الإمارات', 'الامارات'], aliasesEn: ['UAE', 'Emirates'],
        priority: 95
    },
    {
        id: 'country-kw', type: 'country',
        nameAr: 'دولة الكويت', nameEn: 'Kuwait',
        countryAr: 'دولة الكويت', countryEn: 'Kuwait', countryCode: 'kw',
        lat: 29.3759, lng: 47.9774,
        aliasesAr: ['الكويت'], aliasesEn: ['Kuwait'],
        priority: 92
    },
    {
        id: 'country-qa', type: 'country',
        nameAr: 'دولة قطر', nameEn: 'Qatar',
        countryAr: 'دولة قطر', countryEn: 'Qatar', countryCode: 'qa',
        lat: 25.2854, lng: 51.5310,
        aliasesAr: ['قطر'], aliasesEn: ['Qatar'],
        priority: 92
    },
    {
        id: 'country-bh', type: 'country',
        nameAr: 'مملكة البحرين', nameEn: 'Bahrain',
        countryAr: 'مملكة البحرين', countryEn: 'Bahrain', countryCode: 'bh',
        lat: 26.2285, lng: 50.5860,
        aliasesAr: ['البحرين'], aliasesEn: ['Bahrain'],
        priority: 90
    },
    {
        id: 'country-om', type: 'country',
        nameAr: 'سلطنة عمان', nameEn: 'Oman',
        countryAr: 'سلطنة عمان', countryEn: 'Oman', countryCode: 'om',
        lat: 23.5880, lng: 58.3829,
        aliasesAr: ['عمان', 'سلطنة عُمان'], aliasesEn: ['Oman', 'Sultanate of Oman'],
        priority: 90
    },
    {
        id: 'country-jo', type: 'country',
        nameAr: 'المملكة الأردنية الهاشمية', nameEn: 'Jordan',
        countryAr: 'المملكة الأردنية الهاشمية', countryEn: 'Jordan', countryCode: 'jo',
        lat: 31.9454, lng: 35.9284,
        aliasesAr: ['الأردن', 'الاردن'], aliasesEn: ['Jordan'],
        priority: 92
    },
    {
        id: 'country-ps', type: 'country',
        nameAr: 'دولة فلسطين', nameEn: 'Palestine',
        countryAr: 'دولة فلسطين', countryEn: 'Palestine', countryCode: 'ps',
        lat: 31.7683, lng: 35.2137,
        aliasesAr: ['فلسطين'], aliasesEn: ['Palestine'],
        priority: 95
    },
    {
        id: 'country-iq', type: 'country',
        nameAr: 'جمهورية العراق', nameEn: 'Iraq',
        countryAr: 'جمهورية العراق', countryEn: 'Iraq', countryCode: 'iq',
        lat: 33.3152, lng: 44.3661,
        aliasesAr: ['العراق'], aliasesEn: ['Iraq'],
        priority: 92
    },
    {
        id: 'country-sy', type: 'country',
        nameAr: 'الجمهورية العربية السورية', nameEn: 'Syria',
        countryAr: 'الجمهورية العربية السورية', countryEn: 'Syria', countryCode: 'sy',
        lat: 33.5138, lng: 36.2765,
        aliasesAr: ['سوريا', 'سورية'], aliasesEn: ['Syria'],
        priority: 90
    },
    {
        id: 'country-lb', type: 'country',
        nameAr: 'الجمهورية اللبنانية', nameEn: 'Lebanon',
        countryAr: 'الجمهورية اللبنانية', countryEn: 'Lebanon', countryCode: 'lb',
        lat: 33.8938, lng: 35.5018,
        aliasesAr: ['لبنان'], aliasesEn: ['Lebanon'],
        priority: 90
    },
    {
        id: 'country-ye', type: 'country',
        nameAr: 'الجمهورية اليمنية', nameEn: 'Yemen',
        countryAr: 'الجمهورية اليمنية', countryEn: 'Yemen', countryCode: 'ye',
        lat: 15.3694, lng: 44.1910,
        aliasesAr: ['اليمن'], aliasesEn: ['Yemen'],
        priority: 90
    },
    {
        id: 'country-sd', type: 'country',
        nameAr: 'جمهورية السودان', nameEn: 'Sudan',
        countryAr: 'جمهورية السودان', countryEn: 'Sudan', countryCode: 'sd',
        lat: 15.5007, lng: 32.5599,
        aliasesAr: ['السودان'], aliasesEn: ['Sudan'],
        priority: 90
    },
    {
        id: 'country-ly', type: 'country',
        nameAr: 'دولة ليبيا', nameEn: 'Libya',
        countryAr: 'دولة ليبيا', countryEn: 'Libya', countryCode: 'ly',
        lat: 32.8872, lng: 13.1913,
        aliasesAr: ['ليبيا'], aliasesEn: ['Libya'],
        priority: 90
    },
    {
        id: 'country-tn', type: 'country',
        nameAr: 'الجمهورية التونسية', nameEn: 'Tunisia',
        countryAr: 'الجمهورية التونسية', countryEn: 'Tunisia', countryCode: 'tn',
        lat: 36.8065, lng: 10.1815,
        aliasesAr: ['تونس'], aliasesEn: ['Tunisia'],
        priority: 90
    },
    {
        id: 'country-dz', type: 'country',
        nameAr: 'الجمهورية الجزائرية الديمقراطية الشعبية', nameEn: 'Algeria',
        countryAr: 'الجمهورية الجزائرية الديمقراطية الشعبية', countryEn: 'Algeria', countryCode: 'dz',
        lat: 36.7538, lng: 3.0588,
        aliasesAr: ['الجزائر'], aliasesEn: ['Algeria'],
        priority: 92
    },
    {
        id: 'country-ma', type: 'country',
        nameAr: 'المملكة المغربية', nameEn: 'Morocco',
        countryAr: 'المملكة المغربية', countryEn: 'Morocco', countryCode: 'ma',
        lat: 34.0209, lng: -6.8416,
        aliasesAr: ['المغرب'], aliasesEn: ['Morocco'],
        priority: 92
    },
    {
        id: 'country-mr', type: 'country',
        nameAr: 'الجمهورية الإسلامية الموريتانية', nameEn: 'Mauritania',
        countryAr: 'الجمهورية الإسلامية الموريتانية', countryEn: 'Mauritania', countryCode: 'mr',
        lat: 18.0735, lng: -15.9582,
        aliasesAr: ['موريتانيا'], aliasesEn: ['Mauritania'],
        priority: 85
    },
    {
        id: 'country-so', type: 'country',
        nameAr: 'جمهورية الصومال الفيدرالية', nameEn: 'Somalia',
        countryAr: 'جمهورية الصومال الفيدرالية', countryEn: 'Somalia', countryCode: 'so',
        lat: 2.0469, lng: 45.3182,
        aliasesAr: ['الصومال'], aliasesEn: ['Somalia'],
        priority: 85
    },
    {
        id: 'country-dj', type: 'country',
        nameAr: 'جمهورية جيبوتي', nameEn: 'Djibouti',
        countryAr: 'جمهورية جيبوتي', countryEn: 'Djibouti', countryCode: 'dj',
        lat: 11.8251, lng: 42.5903,
        aliasesAr: ['جيبوتي'], aliasesEn: ['Djibouti'],
        priority: 80
    },
    {
        id: 'country-km', type: 'country',
        nameAr: 'جزر القمر', nameEn: 'Comoros',
        countryAr: 'جزر القمر', countryEn: 'Comoros', countryCode: 'km',
        lat: -11.7172, lng: 43.2473,
        aliasesAr: ['جزر القمر'], aliasesEn: ['Comoros'],
        priority: 80
    },
    {
        id: 'country-tr', type: 'country',
        nameAr: 'تركيا', nameEn: 'Turkey',
        countryAr: 'تركيا', countryEn: 'Turkey', countryCode: 'tr',
        lat: 39.9334, lng: 32.8597,
        aliasesAr: ['الجمهورية التركية'], aliasesEn: ['Turkiye', 'Türkiye'],
        priority: 92
    },
    {
        id: 'country-pk', type: 'country',
        nameAr: 'باكستان', nameEn: 'Pakistan',
        countryAr: 'باكستان', countryEn: 'Pakistan', countryCode: 'pk',
        lat: 33.6844, lng: 73.0479,
        aliasesAr: ['باكستان'], aliasesEn: ['Pakistan'],
        priority: 88
    },
    {
        id: 'country-id', type: 'country',
        nameAr: 'إندونيسيا', nameEn: 'Indonesia',
        countryAr: 'إندونيسيا', countryEn: 'Indonesia', countryCode: 'id',
        lat: -6.2088, lng: 106.8456,
        aliasesAr: ['اندونيسيا'], aliasesEn: ['Indonesia'],
        priority: 88
    },
    {
        id: 'country-my', type: 'country',
        nameAr: 'ماليزيا', nameEn: 'Malaysia',
        countryAr: 'ماليزيا', countryEn: 'Malaysia', countryCode: 'my',
        lat: 3.1390, lng: 101.6869,
        aliasesAr: ['ماليزيا'], aliasesEn: ['Malaysia'],
        priority: 88
    },
    {
        id: 'country-in', type: 'country',
        nameAr: 'الهند', nameEn: 'India',
        countryAr: 'الهند', countryEn: 'India', countryCode: 'in',
        lat: 28.6139, lng: 77.2090,
        aliasesAr: ['الهند'], aliasesEn: ['India'],
        priority: 86
    },
    {
        id: 'country-bd', type: 'country',
        nameAr: 'بنغلاديش', nameEn: 'Bangladesh',
        countryAr: 'بنغلاديش', countryEn: 'Bangladesh', countryCode: 'bd',
        lat: 23.8103, lng: 90.4125,
        aliasesAr: ['بنجلاديش'], aliasesEn: ['Bangladesh'],
        priority: 84
    },
    {
        id: 'country-gb', type: 'country',
        nameAr: 'المملكة المتحدة', nameEn: 'United Kingdom',
        countryAr: 'المملكة المتحدة', countryEn: 'United Kingdom', countryCode: 'gb',
        lat: 51.5072, lng: -0.1276,
        aliasesAr: ['بريطانيا', 'انجلترا', 'إنجلترا'], aliasesEn: ['UK', 'Britain', 'Great Britain', 'England'],
        priority: 90
    },
    {
        id: 'country-us', type: 'country',
        nameAr: 'الولايات المتحدة الأمريكية', nameEn: 'United States',
        countryAr: 'الولايات المتحدة الأمريكية', countryEn: 'United States', countryCode: 'us',
        lat: 38.9072, lng: -77.0369,
        aliasesAr: ['أمريكا', 'امريكا', 'الولايات المتحدة'], aliasesEn: ['USA', 'US', 'America', 'United States of America'],
        priority: 90
    },
    {
        id: 'country-fr', type: 'country',
        nameAr: 'فرنسا', nameEn: 'France',
        countryAr: 'فرنسا', countryEn: 'France', countryCode: 'fr',
        lat: 48.8566, lng: 2.3522,
        aliasesAr: ['فرنسا'], aliasesEn: ['France'],
        priority: 88
    },
    {
        id: 'country-de', type: 'country',
        nameAr: 'ألمانيا', nameEn: 'Germany',
        countryAr: 'ألمانيا', countryEn: 'Germany', countryCode: 'de',
        lat: 52.5200, lng: 13.4050,
        aliasesAr: ['المانيا'], aliasesEn: ['Germany', 'Deutschland'],
        priority: 88
    },
    {
        id: 'country-es', type: 'country',
        nameAr: 'إسبانيا', nameEn: 'Spain',
        countryAr: 'إسبانيا', countryEn: 'Spain', countryCode: 'es',
        lat: 40.4168, lng: -3.7038,
        aliasesAr: ['اسبانيا'], aliasesEn: ['Spain'],
        priority: 86
    },
    {
        id: 'country-it', type: 'country',
        nameAr: 'إيطاليا', nameEn: 'Italy',
        countryAr: 'إيطاليا', countryEn: 'Italy', countryCode: 'it',
        lat: 41.9028, lng: 12.4964,
        aliasesAr: ['ايطاليا'], aliasesEn: ['Italy'],
        priority: 86
    },
    {
        id: 'country-ca', type: 'country',
        nameAr: 'كندا', nameEn: 'Canada',
        countryAr: 'كندا', countryEn: 'Canada', countryCode: 'ca',
        lat: 45.4215, lng: -75.6972,
        aliasesAr: ['كندا'], aliasesEn: ['Canada'],
        priority: 86
    },
    {
        id: 'country-au', type: 'country',
        nameAr: 'أستراليا', nameEn: 'Australia',
        countryAr: 'أستراليا', countryEn: 'Australia', countryCode: 'au',
        lat: -35.2809, lng: 149.1300,
        aliasesAr: ['استراليا'], aliasesEn: ['Australia'],
        priority: 85
    },
    {
        id: 'country-nl', type: 'country',
        nameAr: 'هولندا', nameEn: 'Netherlands',
        countryAr: 'هولندا', countryEn: 'Netherlands', countryCode: 'nl',
        lat: 52.3676, lng: 4.9041,
        aliasesAr: ['هولندا'], aliasesEn: ['Holland', 'Netherlands'],
        priority: 84
    },
    {
        id: 'country-be', type: 'country',
        nameAr: 'بلجيكا', nameEn: 'Belgium',
        countryAr: 'بلجيكا', countryEn: 'Belgium', countryCode: 'be',
        lat: 50.8503, lng: 4.3517,
        aliasesAr: ['بلجيكا'], aliasesEn: ['Belgium'],
        priority: 82
    },
    {
        id: 'country-ch', type: 'country',
        nameAr: 'سويسرا', nameEn: 'Switzerland',
        countryAr: 'سويسرا', countryEn: 'Switzerland', countryCode: 'ch',
        lat: 46.9480, lng: 7.4474,
        aliasesAr: ['سويسرا'], aliasesEn: ['Switzerland'],
        priority: 82
    },
    {
        id: 'country-at', type: 'country',
        nameAr: 'النمسا', nameEn: 'Austria',
        countryAr: 'النمسا', countryEn: 'Austria', countryCode: 'at',
        lat: 48.2082, lng: 16.3738,
        aliasesAr: ['النمسا'], aliasesEn: ['Austria'],
        priority: 82
    },
    {
        id: 'country-se', type: 'country',
        nameAr: 'السويد', nameEn: 'Sweden',
        countryAr: 'السويد', countryEn: 'Sweden', countryCode: 'se',
        lat: 59.3293, lng: 18.0686,
        aliasesAr: ['السويد'], aliasesEn: ['Sweden'],
        priority: 82
    },
    {
        id: 'country-ru', type: 'country',
        nameAr: 'روسيا', nameEn: 'Russia',
        countryAr: 'روسيا', countryEn: 'Russia', countryCode: 'ru',
        lat: 55.7558, lng: 37.6173,
        aliasesAr: ['روسيا'], aliasesEn: ['Russia'],
        priority: 82
    },
    {
        id: 'country-ba', type: 'country',
        nameAr: 'البوسنة والهرسك', nameEn: 'Bosnia and Herzegovina',
        countryAr: 'البوسنة والهرسك', countryEn: 'Bosnia and Herzegovina', countryCode: 'ba',
        lat: 43.8563, lng: 18.4131,
        aliasesAr: ['البوسنة'], aliasesEn: ['Bosnia'],
        priority: 80
    },
    {
        id: 'country-cn', type: 'country',
        nameAr: 'الصين', nameEn: 'China',
        countryAr: 'الصين', countryEn: 'China', countryCode: 'cn',
        lat: 39.9042, lng: 116.4074,
        aliasesAr: ['الصين'], aliasesEn: ['China'],
        priority: 80
    },
    {
        id: 'country-jp', type: 'country',
        nameAr: 'اليابان', nameEn: 'Japan',
        countryAr: 'اليابان', countryEn: 'Japan', countryCode: 'jp',
        lat: 35.6762, lng: 139.6503,
        aliasesAr: ['اليابان'], aliasesEn: ['Japan'],
        priority: 80
    },
    {
        id: 'country-ng', type: 'country',
        nameAr: 'نيجيريا', nameEn: 'Nigeria',
        countryAr: 'نيجيريا', countryEn: 'Nigeria', countryCode: 'ng',
        lat: 9.0765, lng: 7.3986,
        aliasesAr: ['نيجيريا'], aliasesEn: ['Nigeria'],
        priority: 80
    },
    {
        id: 'country-za', type: 'country',
        nameAr: 'جنوب أفريقيا', nameEn: 'South Africa',
        countryAr: 'جنوب أفريقيا', countryEn: 'South Africa', countryCode: 'za',
        lat: -25.7479, lng: 28.2293,
        aliasesAr: ['جنوب افريقيا'], aliasesEn: ['South Africa'],
        priority: 80
    },
    {
        id: 'country-br', type: 'country',
        nameAr: 'البرازيل', nameEn: 'Brazil',
        countryAr: 'البرازيل', countryEn: 'Brazil', countryCode: 'br',
        lat: -15.7975, lng: -47.8919,
        aliasesAr: ['البرازيل'], aliasesEn: ['Brazil'],
        priority: 78
    },

    // ==================== SAUDI ARABIA CITIES ====================
    {
        id: 'sa-makkah', type: 'city',
        nameAr: 'مكة المكرمة', nameEn: 'Makkah',
        regionAr: 'منطقة مكة المكرمة', regionEn: 'Makkah Region',
        countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', countryCode: 'sa',
        lat: 21.4225, lng: 39.8262,
        aliasesAr: ['مكة', 'مكه', 'مكه المكرمه'], aliasesEn: ['Mecca', 'Makkah Al-Mukarramah'],
        priority: 100
    },
    {
        id: 'sa-madinah', type: 'city',
        nameAr: 'المدينة المنورة', nameEn: 'Madinah',
        regionAr: 'منطقة المدينة المنورة', regionEn: 'Madinah Region',
        countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', countryCode: 'sa',
        lat: 24.4672, lng: 39.6111,
        aliasesAr: ['المدينة', 'المدينه', 'المدينه المنوره'], aliasesEn: ['Medina', 'Al Madinah'],
        priority: 100
    },
    {
        id: 'sa-riyadh', type: 'city',
        nameAr: 'الرياض', nameEn: 'Riyadh',
        regionAr: 'منطقة الرياض', regionEn: 'Riyadh Region',
        countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', countryCode: 'sa',
        lat: 24.7136, lng: 46.6753,
        aliasesAr: ['مدينة الرياض'], aliasesEn: ['Riyadh City'],
        priority: 98
    },
    {
        id: 'sa-jeddah', type: 'city',
        nameAr: 'جدة', nameEn: 'Jeddah',
        regionAr: 'منطقة مكة المكرمة', regionEn: 'Makkah Region',
        countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', countryCode: 'sa',
        lat: 21.4858, lng: 39.1925,
        aliasesAr: ['جده'], aliasesEn: ['Jiddah'],
        priority: 96
    },
    {
        id: 'sa-dammam', type: 'city',
        nameAr: 'الدمام', nameEn: 'Dammam',
        regionAr: 'المنطقة الشرقية', regionEn: 'Eastern Province',
        countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', countryCode: 'sa',
        lat: 26.4207, lng: 50.0888,
        aliasesAr: ['الدمام'], aliasesEn: ['Ad Dammam'],
        priority: 95
    },
    {
        id: 'sa-khobar', type: 'city',
        nameAr: 'الخبر', nameEn: 'Khobar',
        regionAr: 'المنطقة الشرقية', regionEn: 'Eastern Province',
        countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', countryCode: 'sa',
        lat: 26.2172, lng: 50.1971,
        aliasesAr: ['الخبر'], aliasesEn: ['Al Khobar', 'Al-Khobar'],
        priority: 92
    },
    {
        id: 'sa-dhahran', type: 'city',
        nameAr: 'الظهران', nameEn: 'Dhahran',
        regionAr: 'المنطقة الشرقية', regionEn: 'Eastern Province',
        countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', countryCode: 'sa',
        lat: 26.2361, lng: 50.0393,
        aliasesAr: ['الظهران'], aliasesEn: ['Az Zahran'],
        priority: 90
    },
    {
        id: 'sa-ahsa', type: 'city',
        nameAr: 'الأحساء', nameEn: 'Al-Ahsa',
        regionAr: 'المنطقة الشرقية', regionEn: 'Eastern Province',
        countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', countryCode: 'sa',
        lat: 25.3833, lng: 49.5833,
        aliasesAr: ['الاحساء', 'الهفوف', 'المبرز'], aliasesEn: ['Al Ahsa', 'Hofuf', 'Al-Hofuf'],
        priority: 88
    },
    {
        id: 'sa-jubail', type: 'city',
        nameAr: 'الجبيل', nameEn: 'Jubail',
        regionAr: 'المنطقة الشرقية', regionEn: 'Eastern Province',
        countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', countryCode: 'sa',
        lat: 27.0112, lng: 49.6583,
        aliasesAr: ['الجبيل الصناعية'], aliasesEn: ['Al Jubail'],
        priority: 86
    },
    {
        id: 'sa-qatif', type: 'city',
        nameAr: 'القطيف', nameEn: 'Al-Qatif',
        regionAr: 'المنطقة الشرقية', regionEn: 'Eastern Province',
        countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', countryCode: 'sa',
        lat: 26.5654, lng: 50.0089,
        aliasesAr: ['القطيف'], aliasesEn: ['Qatif'],
        priority: 84
    },
    {
        id: 'sa-taif', type: 'city',
        nameAr: 'الطائف', nameEn: 'Taif',
        regionAr: 'منطقة مكة المكرمة', regionEn: 'Makkah Region',
        countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', countryCode: 'sa',
        lat: 21.2703, lng: 40.4158,
        aliasesAr: ['الطايف'], aliasesEn: ['At Taif'],
        priority: 90
    },
    {
        id: 'sa-buraidah', type: 'city',
        nameAr: 'بريدة', nameEn: 'Buraidah',
        regionAr: 'منطقة القصيم', regionEn: 'Al-Qassim Region',
        countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', countryCode: 'sa',
        lat: 26.3260, lng: 43.9750,
        aliasesAr: ['بريده', 'القصيم'], aliasesEn: ['Buraydah', 'Qassim', 'Al-Qassim'],
        priority: 88
    },
    {
        id: 'sa-unaizah', type: 'city',
        nameAr: 'عنيزة', nameEn: 'Unaizah',
        regionAr: 'منطقة القصيم', regionEn: 'Al-Qassim Region',
        countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', countryCode: 'sa',
        lat: 26.0840, lng: 43.9936,
        aliasesAr: ['عنيزه'], aliasesEn: ['Unayzah'],
        priority: 84
    },
    {
        id: 'sa-tabuk', type: 'city',
        nameAr: 'تبوك', nameEn: 'Tabuk',
        regionAr: 'منطقة تبوك', regionEn: 'Tabuk Region',
        countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', countryCode: 'sa',
        lat: 28.3835, lng: 36.5662,
        aliasesAr: ['تبوك'], aliasesEn: ['Tabouk'],
        priority: 88
    },
    {
        id: 'sa-hail', type: 'city',
        nameAr: 'حائل', nameEn: 'Hail',
        regionAr: 'منطقة حائل', regionEn: 'Hail Region',
        countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', countryCode: 'sa',
        lat: 27.5114, lng: 41.7208,
        aliasesAr: ['حايل'], aliasesEn: ['Ha\'il'],
        priority: 86
    },
    {
        id: 'sa-abha', type: 'city',
        nameAr: 'أبها', nameEn: 'Abha',
        regionAr: 'منطقة عسير', regionEn: 'Asir Region',
        countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', countryCode: 'sa',
        lat: 18.2164, lng: 42.5053,
        aliasesAr: ['ابها', 'عسير'], aliasesEn: ['Abha', 'Asir'],
        priority: 88
    },
    {
        id: 'sa-khamis', type: 'city',
        nameAr: 'خميس مشيط', nameEn: 'Khamis Mushait',
        regionAr: 'منطقة عسير', regionEn: 'Asir Region',
        countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', countryCode: 'sa',
        lat: 18.3060, lng: 42.7294,
        aliasesAr: ['خميس مشيط'], aliasesEn: ['Khamis Mushayt'],
        priority: 86
    },
    {
        id: 'sa-jazan', type: 'city',
        nameAr: 'جازان', nameEn: 'Jazan',
        regionAr: 'منطقة جازان', regionEn: 'Jazan Region',
        countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', countryCode: 'sa',
        lat: 16.8892, lng: 42.5511,
        aliasesAr: ['جيزان'], aliasesEn: ['Jizan'],
        priority: 86
    },
    {
        id: 'sa-najran', type: 'city',
        nameAr: 'نجران', nameEn: 'Najran',
        regionAr: 'منطقة نجران', regionEn: 'Najran Region',
        countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', countryCode: 'sa',
        lat: 17.5656, lng: 44.2289,
        aliasesAr: ['نجران'], aliasesEn: ['Najran'],
        priority: 84
    },
    {
        id: 'sa-baha', type: 'city',
        nameAr: 'الباحة', nameEn: 'Al-Baha',
        regionAr: 'منطقة الباحة', regionEn: 'Al-Baha Region',
        countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', countryCode: 'sa',
        lat: 20.0129, lng: 41.4677,
        aliasesAr: ['الباحه'], aliasesEn: ['Al Bahah'],
        priority: 82
    },
    {
        id: 'sa-yanbu', type: 'city',
        nameAr: 'ينبع', nameEn: 'Yanbu',
        regionAr: 'منطقة المدينة المنورة', regionEn: 'Madinah Region',
        countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', countryCode: 'sa',
        lat: 24.0895, lng: 38.0618,
        aliasesAr: ['ينبع البحر'], aliasesEn: ['Yanbu al Bahr'],
        priority: 84
    },
    {
        id: 'sa-hafar', type: 'city',
        nameAr: 'حفر الباطن', nameEn: 'Hafar Al-Batin',
        regionAr: 'المنطقة الشرقية', regionEn: 'Eastern Province',
        countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', countryCode: 'sa',
        lat: 28.4342, lng: 45.9636,
        aliasesAr: ['حفر الباطن'], aliasesEn: ['Hafar Al Batin'],
        priority: 82
    },
    {
        id: 'sa-arar', type: 'city',
        nameAr: 'عرعر', nameEn: 'Arar',
        regionAr: 'منطقة الحدود الشمالية', regionEn: 'Northern Borders Region',
        countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', countryCode: 'sa',
        lat: 30.9753, lng: 41.0381,
        aliasesAr: ['عرعر'], aliasesEn: ['Arar'],
        priority: 80
    },
    {
        id: 'sa-sakaka', type: 'city',
        nameAr: 'سكاكا', nameEn: 'Sakaka',
        regionAr: 'منطقة الجوف', regionEn: 'Al-Jawf Region',
        countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', countryCode: 'sa',
        lat: 29.9697, lng: 40.2064,
        aliasesAr: ['الجوف', 'سكاكا'], aliasesEn: ['Sakakah', 'Al Jawf'],
        priority: 80
    },
    {
        id: 'sa-alula', type: 'city',
        nameAr: 'العلا', nameEn: 'AlUla',
        regionAr: 'منطقة المدينة المنورة', regionEn: 'Madinah Region',
        countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', countryCode: 'sa',
        lat: 26.6085, lng: 37.9232,
        aliasesAr: ['العلا'], aliasesEn: ['Al-Ula'],
        priority: 82
    },

    // ==================== EGYPT CITIES & GOVERNORATES ====================
    {
        id: 'eg-cairo', type: 'city',
        nameAr: 'القاهرة', nameEn: 'Cairo',
        regionAr: 'محافظة القاهرة', regionEn: 'Cairo Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 30.0444, lng: 31.2357,
        aliasesAr: ['القاهره', 'القاهرة الجديدة', 'مدينة نصر', 'المعادي'], aliasesEn: ['Al Qahirah', 'New Cairo'],
        priority: 100
    },
    {
        id: 'eg-giza', type: 'city',
        nameAr: 'الجيزة', nameEn: 'Giza',
        regionAr: 'محافظة الجيزة', regionEn: 'Giza Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 30.0131, lng: 31.2089,
        aliasesAr: ['الجيزه', 'السادس من أكتوبر', 'الشيخ زايد'], aliasesEn: ['El Giza', '6th of October'],
        priority: 96
    },
    {
        id: 'eg-alexandria', type: 'city',
        nameAr: 'الإسكندرية', nameEn: 'Alexandria',
        regionAr: 'محافظة الإسكندرية', regionEn: 'Alexandria Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 31.2001, lng: 29.9187,
        aliasesAr: ['الاسكندرية', 'اسكندرية', 'اسكندريه'], aliasesEn: ['Alex'],
        priority: 98
    },
    {
        id: 'eg-tanta', type: 'city',
        nameAr: 'طنطا', nameEn: 'Tanta',
        regionAr: 'محافظة الغربية', regionEn: 'Gharbia Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 30.7865, lng: 31.0004,
        aliasesAr: ['طنطا', 'الغربية', 'الغربيه'], aliasesEn: ['Tanta', 'Gharbia'],
        priority: 95
    },
    {
        id: 'eg-mahalla', type: 'city',
        nameAr: 'المحلة الكبرى', nameEn: 'Al Mahalla Al Kubra',
        regionAr: 'محافظة الغربية', regionEn: 'Gharbia Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 30.9756, lng: 31.1669,
        aliasesAr: ['المحلة', 'المحله الكبري'], aliasesEn: ['Mahalla', 'El Mahalla El Kubra'],
        priority: 88
    },
    {
        id: 'eg-kafrzayat', type: 'city',
        nameAr: 'كفر الزيات', nameEn: 'Kafr El Zayat',
        regionAr: 'محافظة الغربية', regionEn: 'Gharbia Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 30.8253, lng: 30.8181,
        aliasesAr: ['كفر الزيات'], aliasesEn: ['Kafr Al Zayat'],
        priority: 80
    },
    {
        id: 'eg-zefta', type: 'city',
        nameAr: 'زفتى', nameEn: 'Zefta',
        regionAr: 'محافظة الغربية', regionEn: 'Gharbia Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 30.7136, lng: 31.2422,
        aliasesAr: ['زفتي'], aliasesEn: ['Zifta'],
        priority: 78
    },
    {
        id: 'eg-mansoura', type: 'city',
        nameAr: 'المنصورة', nameEn: 'Mansoura',
        regionAr: 'محافظة الدقهلية', regionEn: 'Dakahlia Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 31.0409, lng: 31.3785,
        aliasesAr: ['المنصوره', 'الدقهلية', 'الدقهليه'], aliasesEn: ['El Mansoura', 'Dakahlia'],
        priority: 94
    },
    {
        id: 'eg-zagazig', type: 'city',
        nameAr: 'الزقازيق', nameEn: 'Zagazig',
        regionAr: 'محافظة الشرقية', regionEn: 'Sharqia Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 30.5877, lng: 31.5020,
        aliasesAr: ['الزقازيق', 'الشرقية'], aliasesEn: ['El Zagazig', 'Sharqia'],
        priority: 92
    },
    {
        id: 'eg-banha', type: 'city',
        nameAr: 'بنها', nameEn: 'Banha',
        regionAr: 'محافظة القليوبية', regionEn: 'Qalyubia Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 30.4660, lng: 31.1848,
        aliasesAr: ['بنها', 'القليوبية'], aliasesEn: ['Benha', 'Qalyubia'],
        priority: 88
    },
    {
        id: 'eg-shubra', type: 'city',
        nameAr: 'شبرا الخيمة', nameEn: 'Shubra El-Kheima',
        regionAr: 'محافظة القليوبية', regionEn: 'Qalyubia Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 30.1286, lng: 31.2422,
        aliasesAr: ['شبرا الخيمه'], aliasesEn: ['Shubra El Kheima'],
        priority: 86
    },
    {
        id: 'eg-shibin', type: 'city',
        nameAr: 'شبين الكوم', nameEn: 'Shibin El Kom',
        regionAr: 'محافظة المنوفية', regionEn: 'Monufia Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 30.5586, lng: 31.0119,
        aliasesAr: ['شبين الكوم', 'المنوفية', 'المنوفيه'], aliasesEn: ['Shebin El Kom', 'Monufia'],
        priority: 88
    },
    {
        id: 'eg-damanhour', type: 'city',
        nameAr: 'دمنهور', nameEn: 'Damanhour',
        regionAr: 'محافظة البحيرة', regionEn: 'Beheira Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 31.0341, lng: 30.4682,
        aliasesAr: ['دمنهور', 'البحيرة'], aliasesEn: ['Damanhur', 'Beheira'],
        priority: 88
    },
    {
        id: 'eg-kafrelsheikh', type: 'city',
        nameAr: 'كفر الشيخ', nameEn: 'Kafr El Sheikh',
        regionAr: 'محافظة كفر الشيخ', regionEn: 'Kafr El Sheikh Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 31.1107, lng: 30.9388,
        aliasesAr: ['كفر الشيخ', 'دسوق'], aliasesEn: ['Kafr El-Sheikh'],
        priority: 88
    },
    {
        id: 'eg-damietta', type: 'city',
        nameAr: 'دمياط', nameEn: 'Damietta',
        regionAr: 'محافظة دمياط', regionEn: 'Damietta Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 31.4175, lng: 31.8144,
        aliasesAr: ['دمياط', 'رأس البر'], aliasesEn: ['Dumyat'],
        priority: 88
    },
    {
        id: 'eg-portsaid', type: 'city',
        nameAr: 'بورسعيد', nameEn: 'Port Said',
        regionAr: 'محافظة بورسعيد', regionEn: 'Port Said Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 31.2653, lng: 32.3019,
        aliasesAr: ['بور سعيد'], aliasesEn: ['Port-Said'],
        priority: 92
    },
    {
        id: 'eg-ismailia', type: 'city',
        nameAr: 'الإسماعيلية', nameEn: 'Ismailia',
        regionAr: 'محافظة الإسماعيلية', regionEn: 'Ismailia Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 30.5965, lng: 32.2715,
        aliasesAr: ['الاسماعيلية', 'الاسماعيليه'], aliasesEn: ['Ismailia'],
        priority: 90
    },
    {
        id: 'eg-suez', type: 'city',
        nameAr: 'السويس', nameEn: 'Suez',
        regionAr: 'محافظة السويس', regionEn: 'Suez Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 29.9668, lng: 32.5498,
        aliasesAr: ['السويس'], aliasesEn: ['As Suways'],
        priority: 90
    },
    {
        id: 'eg-fayoum', type: 'city',
        nameAr: 'الفيوم', nameEn: 'Fayoum',
        regionAr: 'محافظة الفيوم', regionEn: 'Fayoum Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 29.3084, lng: 30.8428,
        aliasesAr: ['الفيوم'], aliasesEn: ['Faiyum', 'El Faiyum'],
        priority: 88
    },
    {
        id: 'eg-benisuef', type: 'city',
        nameAr: 'بني سويف', nameEn: 'Beni Suef',
        regionAr: 'محافظة بني سويف', regionEn: 'Beni Suef Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 29.0661, lng: 31.0994,
        aliasesAr: ['بني سويف'], aliasesEn: ['Bani Suwayf'],
        priority: 88
    },
    {
        id: 'eg-minya', type: 'city',
        nameAr: 'المنيا', nameEn: 'Minya',
        regionAr: 'محافظة المنيا', regionEn: 'Minya Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 28.0871, lng: 30.7618,
        aliasesAr: ['المنيا'], aliasesEn: ['Al Minya', 'El Minya'],
        priority: 88
    },
    {
        id: 'eg-asyut', type: 'city',
        nameAr: 'أسيوط', nameEn: 'Asyut',
        regionAr: 'محافظة أسيوط', regionEn: 'Asyut Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 27.1809, lng: 31.1837,
        aliasesAr: ['اسيوط'], aliasesEn: ['Assiut'],
        priority: 90
    },
    {
        id: 'eg-sohag', type: 'city',
        nameAr: 'سوهاج', nameEn: 'Sohag',
        regionAr: 'محافظة سوهاج', regionEn: 'Sohag Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 26.5569, lng: 31.6948,
        aliasesAr: ['سوهاج'], aliasesEn: ['Suhaj'],
        priority: 88
    },
    {
        id: 'eg-qena', type: 'city',
        nameAr: 'قنا', nameEn: 'Qena',
        regionAr: 'محافظة قنا', regionEn: 'Qena Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 26.1551, lng: 32.7160,
        aliasesAr: ['قنا'], aliasesEn: ['Qina'],
        priority: 86
    },
    {
        id: 'eg-luxor', type: 'city',
        nameAr: 'الأقصر', nameEn: 'Luxor',
        regionAr: 'محافظة الأقصر', regionEn: 'Luxor Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 25.6872, lng: 32.6396,
        aliasesAr: ['الاقصر'], aliasesEn: ['Luxor'],
        priority: 92
    },
    {
        id: 'eg-aswan', type: 'city',
        nameAr: 'أسوان', nameEn: 'Aswan',
        regionAr: 'محافظة أسوان', regionEn: 'Aswan Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 24.0889, lng: 32.8998,
        aliasesAr: ['اسوان'], aliasesEn: ['Assuan'],
        priority: 92
    },
    {
        id: 'eg-hurghada', type: 'city',
        nameAr: 'الغردقة', nameEn: 'Hurghada',
        regionAr: 'محافظة البحر الأحمر', regionEn: 'Red Sea Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 27.2579, lng: 33.8116,
        aliasesAr: ['الغردقه', 'البحر الأحمر'], aliasesEn: ['Hurghada', 'Red Sea'],
        priority: 88
    },
    {
        id: 'eg-sharm', type: 'city',
        nameAr: 'شرم الشيخ', nameEn: 'Sharm El Sheikh',
        regionAr: 'محافظة جنوب سيناء', regionEn: 'South Sinai Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 27.9158, lng: 34.3300,
        aliasesAr: ['شرم الشيخ', 'جنوب سيناء'], aliasesEn: ['Sharm El-Sheikh'],
        priority: 88
    },
    {
        id: 'eg-matruh', type: 'city',
        nameAr: 'مرسى مطروح', nameEn: 'Marsa Matruh',
        regionAr: 'محافظة مطروح', regionEn: 'Matrouh Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 31.3543, lng: 27.2373,
        aliasesAr: ['مطروح', 'مرسي مطروح'], aliasesEn: ['Matrouh', 'Marsa Matrouh'],
        priority: 86
    },
    {
        id: 'eg-arish', type: 'city',
        nameAr: 'العريش', nameEn: 'Arish',
        regionAr: 'محافظة شمال سيناء', regionEn: 'North Sinai Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 31.1321, lng: 33.8033,
        aliasesAr: ['العريش', 'شمال سيناء'], aliasesEn: ['Al Arish', 'El Arish'],
        priority: 84
    },
    {
        id: 'eg-kharga', type: 'city',
        nameAr: 'الخارجة', nameEn: 'Kharga',
        regionAr: 'محافظة الوادي الجديد', regionEn: 'New Valley Governorate',
        countryAr: 'جمهورية مصر العربية', countryEn: 'Egypt', countryCode: 'eg',
        lat: 25.4390, lng: 30.5586,
        aliasesAr: ['الوادي الجديد', 'الخارجه'], aliasesEn: ['New Valley', 'El Kharga'],
        priority: 82
    },

    // ==================== UAE, KUWAIT, QATAR, BAHRAIN, OMAN ====================
    {
        id: 'ae-dubai', type: 'city',
        nameAr: 'دبي', nameEn: 'Dubai',
        regionAr: 'إمارة دبي', regionEn: 'Dubai Emirate',
        countryAr: 'الإمارات العربية المتحدة', countryEn: 'United Arab Emirates', countryCode: 'ae',
        lat: 25.2048, lng: 55.2708,
        priority: 98
    },
    {
        id: 'ae-abudhabi', type: 'city',
        nameAr: 'أبو ظبي', nameEn: 'Abu Dhabi',
        regionAr: 'إمارة أبو ظبي', regionEn: 'Abu Dhabi Emirate',
        countryAr: 'الإمارات العربية المتحدة', countryEn: 'United Arab Emirates', countryCode: 'ae',
        lat: 24.4539, lng: 54.3773,
        aliasesAr: ['ابوظبي', 'أبوظبي', 'ابو ظبي'], aliasesEn: ['Abu Dhabi'],
        priority: 96
    },
    {
        id: 'ae-sharjah', type: 'city',
        nameAr: 'الشارقة', nameEn: 'Sharjah',
        regionAr: 'إمارة الشارقة', regionEn: 'Sharjah Emirate',
        countryAr: 'الإمارات العربية المتحدة', countryEn: 'United Arab Emirates', countryCode: 'ae',
        lat: 25.3463, lng: 55.4209,
        aliasesAr: ['الشارقه'],
        priority: 92
    },
    {
        id: 'ae-alain', type: 'city',
        nameAr: 'العين', nameEn: 'Al Ain',
        regionAr: 'إمارة أبو ظبي', regionEn: 'Abu Dhabi Emirate',
        countryAr: 'الإمارات العربية المتحدة', countryEn: 'United Arab Emirates', countryCode: 'ae',
        lat: 24.1302, lng: 55.8023,
        priority: 88
    },
    {
        id: 'ae-ajman', type: 'city',
        nameAr: 'عجمان', nameEn: 'Ajman',
        regionAr: 'إمارة عجمان', regionEn: 'Ajman Emirate',
        countryAr: 'الإمارات العربية المتحدة', countryEn: 'United Arab Emirates', countryCode: 'ae',
        lat: 25.4052, lng: 55.5136,
        priority: 86
    },
    {
        id: 'ae-rak', type: 'city',
        nameAr: 'رأس الخيمة', nameEn: 'Ras Al Khaimah',
        regionAr: 'إمارة رأس الخيمة', regionEn: 'Ras Al Khaimah Emirate',
        countryAr: 'الإمارات العربية المتحدة', countryEn: 'United Arab Emirates', countryCode: 'ae',
        lat: 25.8007, lng: 55.9762,
        aliasesAr: ['راس الخيمة'],
        priority: 85
    },
    {
        id: 'ae-fujairah', type: 'city',
        nameAr: 'الفجيرة', nameEn: 'Fujairah',
        regionAr: 'إمارة الفجيرة', regionEn: 'Fujairah Emirate',
        countryAr: 'الإمارات العربية المتحدة', countryEn: 'United Arab Emirates', countryCode: 'ae',
        lat: 25.1288, lng: 56.3265,
        aliasesAr: ['الفجيره'],
        priority: 84
    },
    {
        id: 'kw-city', type: 'city',
        nameAr: 'مدينة الكويت', nameEn: 'Kuwait City',
        regionAr: 'العاصمة', regionEn: 'Al Asimah',
        countryAr: 'دولة الكويت', countryEn: 'Kuwait', countryCode: 'kw',
        lat: 29.3759, lng: 47.9774,
        aliasesAr: ['الكويت', 'حولي', 'السالمية'], aliasesEn: ['Kuwait', 'Hawalli', 'Salmiya'],
        priority: 94
    },
    {
        id: 'qa-doha', type: 'city',
        nameAr: 'الدوحة', nameEn: 'Doha',
        regionAr: 'بلدية الدوحة', regionEn: 'Doha Municipality',
        countryAr: 'دولة قطر', countryEn: 'Qatar', countryCode: 'qa',
        lat: 25.2854, lng: 51.5310,
        aliasesAr: ['الدوحه', 'الوكرة', 'الريان'], aliasesEn: ['Ad Dawhah'],
        priority: 94
    },
    {
        id: 'bh-manama', type: 'city',
        nameAr: 'المنامة', nameEn: 'Manama',
        regionAr: 'محافظة العاصمة', regionEn: 'Capital Governorate',
        countryAr: 'مملكة البحرين', countryEn: 'Bahrain', countryCode: 'bh',
        lat: 26.2285, lng: 50.5860,
        aliasesAr: ['المنامه', 'المحرق', 'الرفاع'], aliasesEn: ['Al Manamah', 'Muharraq'],
        priority: 92
    },
    {
        id: 'om-muscat', type: 'city',
        nameAr: 'مسقط', nameEn: 'Muscat',
        regionAr: 'محافظة مسقط', regionEn: 'Muscat Governorate',
        countryAr: 'سلطنة عمان', countryEn: 'Oman', countryCode: 'om',
        lat: 23.5880, lng: 58.3829,
        priority: 92
    },
    {
        id: 'om-salalah', type: 'city',
        nameAr: 'صلالة', nameEn: 'Salalah',
        regionAr: 'ظفار', regionEn: 'Dhofar',
        countryAr: 'سلطنة عمان', countryEn: 'Oman', countryCode: 'om',
        lat: 17.0151, lng: 54.0924,
        aliasesAr: ['صلاله'],
        priority: 86
    },
    {
        id: 'om-sohar', type: 'city',
        nameAr: 'صحار', nameEn: 'Sohar',
        regionAr: 'شمال الباطنة', regionEn: 'Al Batinah North',
        countryAr: 'سلطنة عمان', countryEn: 'Oman', countryCode: 'om',
        lat: 24.3461, lng: 56.7075,
        priority: 84
    },

    // ==================== LEVANT, IRAQ, YEMEN ====================
    {
        id: 'ps-jerusalem', type: 'city',
        nameAr: 'القدس الشريف', nameEn: 'Jerusalem',
        regionAr: 'القدس', regionEn: 'Jerusalem Governorate',
        countryAr: 'دولة فلسطين', countryEn: 'Palestine', countryCode: 'ps',
        lat: 31.7683, lng: 35.2137,
        aliasesAr: ['القدس', 'بيت المقدس'], aliasesEn: ['Al Quds', 'Al-Quds'],
        priority: 98
    },
    {
        id: 'ps-gaza', type: 'city',
        nameAr: 'غزة', nameEn: 'Gaza',
        regionAr: 'قطاع غزة', regionEn: 'Gaza Strip',
        countryAr: 'دولة فلسطين', countryEn: 'Palestine', countryCode: 'ps',
        lat: 31.5017, lng: 34.4668,
        aliasesAr: ['غزه'],
        priority: 94
    },
    {
        id: 'ps-ramallah', type: 'city',
        nameAr: 'رام الله', nameEn: 'Ramallah',
        countryAr: 'دولة فلسطين', countryEn: 'Palestine', countryCode: 'ps',
        lat: 31.9038, lng: 35.2034,
        priority: 88
    },
    {
        id: 'ps-nablus', type: 'city',
        nameAr: 'نابلس', nameEn: 'Nablus',
        countryAr: 'دولة فلسطين', countryEn: 'Palestine', countryCode: 'ps',
        lat: 32.2211, lng: 35.2544,
        priority: 86
    },
    {
        id: 'ps-hebron', type: 'city',
        nameAr: 'الخليل', nameEn: 'Hebron',
        countryAr: 'دولة فلسطين', countryEn: 'Palestine', countryCode: 'ps',
        lat: 31.5326, lng: 35.0998,
        priority: 86
    },
    {
        id: 'jo-amman', type: 'city',
        nameAr: 'عمّان', nameEn: 'Amman',
        regionAr: 'محافظة العاصمة', regionEn: 'Amman Governorate',
        countryAr: 'المملكة الأردنية الهاشمية', countryEn: 'Jordan', countryCode: 'jo',
        lat: 31.9454, lng: 35.9284,
        aliasesAr: ['عمان'],
        priority: 94
    },
    {
        id: 'jo-irbid', type: 'city',
        nameAr: 'إربد', nameEn: 'Irbid',
        countryAr: 'المملكة الأردنية الهاشمية', countryEn: 'Jordan', countryCode: 'jo',
        lat: 32.5568, lng: 35.8469,
        aliasesAr: ['اربد'],
        priority: 86
    },
    {
        id: 'jo-zarqa', type: 'city',
        nameAr: 'الزرقاء', nameEn: 'Zarqa',
        countryAr: 'المملكة الأردنية الهاشمية', countryEn: 'Jordan', countryCode: 'jo',
        lat: 32.0728, lng: 36.0880,
        priority: 86
    },
    {
        id: 'jo-aqaba', type: 'city',
        nameAr: 'العقبة', nameEn: 'Aqaba',
        countryAr: 'المملكة الأردنية الهاشمية', countryEn: 'Jordan', countryCode: 'jo',
        lat: 29.5321, lng: 35.0063,
        aliasesAr: ['العقبه'],
        priority: 84
    },
    {
        id: 'iq-baghdad', type: 'city',
        nameAr: 'بغداد', nameEn: 'Baghdad',
        countryAr: 'جمهورية العراق', countryEn: 'Iraq', countryCode: 'iq',
        lat: 33.3152, lng: 44.3661,
        priority: 95
    },
    {
        id: 'iq-basra', type: 'city',
        nameAr: 'البصرة', nameEn: 'Basra',
        countryAr: 'جمهورية العراق', countryEn: 'Iraq', countryCode: 'iq',
        lat: 30.5085, lng: 47.7804,
        aliasesAr: ['البصره'],
        priority: 90
    },
    {
        id: 'iq-mosul', type: 'city',
        nameAr: 'الموصل', nameEn: 'Mosul',
        countryAr: 'جمهورية العراق', countryEn: 'Iraq', countryCode: 'iq',
        lat: 36.3489, lng: 43.1577,
        priority: 90
    },
    {
        id: 'iq-erbil', type: 'city',
        nameAr: 'أربيل', nameEn: 'Erbil',
        countryAr: 'جمهورية العراق', countryEn: 'Iraq', countryCode: 'iq',
        lat: 36.1911, lng: 44.0092,
        aliasesAr: ['اربيل'],
        priority: 88
    },
    {
        id: 'sy-damascus', type: 'city',
        nameAr: 'دمشق', nameEn: 'Damascus',
        countryAr: 'الجمهورية العربية السورية', countryEn: 'Syria', countryCode: 'sy',
        lat: 33.5138, lng: 36.2765,
        aliasesAr: ['الشام'],
        priority: 94
    },
    {
        id: 'sy-aleppo', type: 'city',
        nameAr: 'حلب', nameEn: 'Aleppo',
        countryAr: 'الجمهورية العربية السورية', countryEn: 'Syria', countryCode: 'sy',
        lat: 36.2021, lng: 37.1343,
        priority: 90
    },
    {
        id: 'sy-homs', type: 'city',
        nameAr: 'حمص', nameEn: 'Homs',
        countryAr: 'الجمهورية العربية السورية', countryEn: 'Syria', countryCode: 'sy',
        lat: 34.7324, lng: 36.7137,
        priority: 86
    },
    {
        id: 'lb-beirut', type: 'city',
        nameAr: 'بيروت', nameEn: 'Beirut',
        countryAr: 'الجمهورية اللبنانية', countryEn: 'Lebanon', countryCode: 'lb',
        lat: 33.8938, lng: 35.5018,
        priority: 92
    },
    {
        id: 'lb-tripoli', type: 'city',
        nameAr: 'طرابلس', nameEn: 'Tripoli',
        regionAr: 'لبنان', regionEn: 'North Governorate',
        countryAr: 'الجمهورية اللبنانية', countryEn: 'Lebanon', countryCode: 'lb',
        lat: 34.4367, lng: 35.8497,
        priority: 84
    },
    {
        id: 'ye-sanaa', type: 'city',
        nameAr: 'صنعاء', nameEn: 'Sanaa',
        countryAr: 'الجمهورية اليمنية', countryEn: 'Yemen', countryCode: 'ye',
        lat: 15.3694, lng: 44.1910,
        priority: 92
    },
    {
        id: 'ye-aden', type: 'city',
        nameAr: 'عدن', nameEn: 'Aden',
        countryAr: 'الجمهورية اليمنية', countryEn: 'Yemen', countryCode: 'ye',
        lat: 12.7855, lng: 45.0187,
        priority: 88
    },
    {
        id: 'ye-taiz', type: 'city',
        nameAr: 'تعز', nameEn: 'Taiz',
        countryAr: 'الجمهورية اليمنية', countryEn: 'Yemen', countryCode: 'ye',
        lat: 13.5795, lng: 44.0209,
        priority: 86
    },

    // ==================== NORTH AFRICA & SUDAN ====================
    {
        id: 'sd-khartoum', type: 'city',
        nameAr: 'الخرطوم', nameEn: 'Khartoum',
        countryAr: 'جمهورية السودان', countryEn: 'Sudan', countryCode: 'sd',
        lat: 15.5007, lng: 32.5599,
        aliasesAr: ['أم درمان', 'ام درمان'],
        priority: 92
    },
    {
        id: 'sd-portsudan', type: 'city',
        nameAr: 'بورتسودان', nameEn: 'Port Sudan',
        countryAr: 'جمهورية السودان', countryEn: 'Sudan', countryCode: 'sd',
        lat: 19.6158, lng: 37.2164,
        priority: 84
    },
    {
        id: 'ly-tripoli', type: 'city',
        nameAr: 'طرابلس', nameEn: 'Tripoli',
        countryAr: 'دولة ليبيا', countryEn: 'Libya', countryCode: 'ly',
        lat: 32.8872, lng: 13.1913,
        priority: 92
    },
    {
        id: 'ly-benghazi', type: 'city',
        nameAr: 'بنغازي', nameEn: 'Benghazi',
        countryAr: 'دولة ليبيا', countryEn: 'Libya', countryCode: 'ly',
        lat: 32.1194, lng: 20.0868,
        priority: 88
    },
    {
        id: 'tn-tunis', type: 'city',
        nameAr: 'تونس العاصمة', nameEn: 'Tunis',
        countryAr: 'الجمهورية التونسية', countryEn: 'Tunisia', countryCode: 'tn',
        lat: 36.8065, lng: 10.1815,
        aliasesAr: ['تونس'],
        priority: 92
    },
    {
        id: 'tn-sfax', type: 'city',
        nameAr: 'صفاقس', nameEn: 'Sfax',
        countryAr: 'الجمهورية التونسية', countryEn: 'Tunisia', countryCode: 'tn',
        lat: 34.7406, lng: 10.7603,
        priority: 86
    },
    {
        id: 'tn-kairouan', type: 'city',
        nameAr: 'القيروان', nameEn: 'Kairouan',
        countryAr: 'الجمهورية التونسية', countryEn: 'Tunisia', countryCode: 'tn',
        lat: 35.6781, lng: 10.0963,
        priority: 86
    },
    {
        id: 'dz-algiers', type: 'city',
        nameAr: 'الجزائر العاصمة', nameEn: 'Algiers',
        countryAr: 'الجمهورية الجزائرية الديمقراطية الشعبية', countryEn: 'Algeria', countryCode: 'dz',
        lat: 36.7538, lng: 3.0588,
        aliasesAr: ['الجزائر'],
        priority: 94
    },
    {
        id: 'dz-oran', type: 'city',
        nameAr: 'وهران', nameEn: 'Oran',
        countryAr: 'الجمهورية الجزائرية الديمقراطية الشعبية', countryEn: 'Algeria', countryCode: 'dz',
        lat: 35.6977, lng: -0.6308,
        priority: 90
    },
    {
        id: 'dz-constantine', type: 'city',
        nameAr: 'قسنطينة', nameEn: 'Constantine',
        countryAr: 'الجمهورية الجزائرية الديمقراطية الشعبية', countryEn: 'Algeria', countryCode: 'dz',
        lat: 36.3650, lng: 6.6147,
        aliasesAr: ['قسنطينه'],
        priority: 88
    },
    {
        id: 'ma-rabat', type: 'city',
        nameAr: 'الرباط', nameEn: 'Rabat',
        countryAr: 'المملكة المغربية', countryEn: 'Morocco', countryCode: 'ma',
        lat: 34.0209, lng: -6.8416,
        priority: 92
    },
    {
        id: 'ma-casablanca', type: 'city',
        nameAr: 'الدار البيضاء', nameEn: 'Casablanca',
        countryAr: 'المملكة المغربية', countryEn: 'Morocco', countryCode: 'ma',
        lat: 33.5731, lng: -7.5898,
        aliasesAr: ['كازابلانكا'],
        priority: 96
    },
    {
        id: 'ma-marrakech', type: 'city',
        nameAr: 'مراكش', nameEn: 'Marrakech',
        countryAr: 'المملكة المغربية', countryEn: 'Morocco', countryCode: 'ma',
        lat: 31.6295, lng: -7.9811,
        priority: 90
    },
    {
        id: 'ma-fez', type: 'city',
        nameAr: 'فاس', nameEn: 'Fez',
        countryAr: 'المملكة المغربية', countryEn: 'Morocco', countryCode: 'ma',
        lat: 34.0181, lng: -5.0078,
        aliasesAr: ['فاس'], aliasesEn: ['Fes'],
        priority: 88
    },
    {
        id: 'ma-tangier', type: 'city',
        nameAr: 'طنجة', nameEn: 'Tangier',
        countryAr: 'المملكة المغربية', countryEn: 'Morocco', countryCode: 'ma',
        lat: 35.7595, lng: -5.8340,
        aliasesAr: ['طنجه'],
        priority: 88
    },

    // ==================== TURKEY & GLOBAL CITIES ====================
    {
        id: 'tr-istanbul', type: 'city',
        nameAr: 'إسطنبول', nameEn: 'Istanbul',
        countryAr: 'تركيا', countryEn: 'Turkey', countryCode: 'tr',
        lat: 41.0082, lng: 28.9784,
        aliasesAr: ['اسطنبول'],
        priority: 96
    },
    {
        id: 'tr-ankara', type: 'city',
        nameAr: 'أنقرة', nameEn: 'Ankara',
        countryAr: 'تركيا', countryEn: 'Turkey', countryCode: 'tr',
        lat: 39.9334, lng: 32.8597,
        aliasesAr: ['انقره'],
        priority: 90
    },
    {
        id: 'tr-izmir', type: 'city',
        nameAr: 'إزمير', nameEn: 'Izmir',
        countryAr: 'تركيا', countryEn: 'Turkey', countryCode: 'tr',
        lat: 38.4237, lng: 27.1428,
        aliasesAr: ['ازمير'],
        priority: 86
    },
    {
        id: 'tr-bursa', type: 'city',
        nameAr: 'بورصة', nameEn: 'Bursa',
        countryAr: 'تركيا', countryEn: 'Turkey', countryCode: 'tr',
        lat: 40.1885, lng: 29.0610,
        priority: 84
    },
    {
        id: 'gb-london', type: 'city',
        nameAr: 'لندن', nameEn: 'London',
        countryAr: 'المملكة المتحدة', countryEn: 'United Kingdom', countryCode: 'gb',
        lat: 51.5072, lng: -0.1276,
        priority: 96
    },
    {
        id: 'gb-manchester', type: 'city',
        nameAr: 'مانشستر', nameEn: 'Manchester',
        countryAr: 'المملكة المتحدة', countryEn: 'United Kingdom', countryCode: 'gb',
        lat: 53.4808, lng: -2.2426,
        priority: 86
    },
    {
        id: 'gb-birmingham', type: 'city',
        nameAr: 'برمنغهام', nameEn: 'Birmingham',
        countryAr: 'المملكة المتحدة', countryEn: 'United Kingdom', countryCode: 'gb',
        lat: 52.4862, lng: -1.8904,
        priority: 84
    },
    {
        id: 'fr-paris', type: 'city',
        nameAr: 'باريس', nameEn: 'Paris',
        countryAr: 'فرنسا', countryEn: 'France', countryCode: 'fr',
        lat: 48.8566, lng: 2.3522,
        priority: 95
    },
    {
        id: 'fr-marseille', type: 'city',
        nameAr: 'مرسيليا', nameEn: 'Marseille',
        countryAr: 'فرنسا', countryEn: 'France', countryCode: 'fr',
        lat: 43.2965, lng: 5.3698,
        priority: 84
    },
    {
        id: 'de-berlin', type: 'city',
        nameAr: 'برلين', nameEn: 'Berlin',
        countryAr: 'ألمانيا', countryEn: 'Germany', countryCode: 'de',
        lat: 52.5200, lng: 13.4050,
        priority: 92
    },
    {
        id: 'de-munich', type: 'city',
        nameAr: 'ميونخ', nameEn: 'Munich',
        countryAr: 'ألمانيا', countryEn: 'Germany', countryCode: 'de',
        lat: 48.1351, lng: 11.5820,
        priority: 86
    },
    {
        id: 'de-frankfurt', type: 'city',
        nameAr: 'فرانكفورت', nameEn: 'Frankfurt',
        countryAr: 'ألمانيا', countryEn: 'Germany', countryCode: 'de',
        lat: 50.1109, lng: 8.6821,
        priority: 86
    },
    {
        id: 'es-madrid', type: 'city',
        nameAr: 'مدريد', nameEn: 'Madrid',
        countryAr: 'إسبانيا', countryEn: 'Spain', countryCode: 'es',
        lat: 40.4168, lng: -3.7038,
        priority: 90
    },
    {
        id: 'es-barcelona', type: 'city',
        nameAr: 'برشلونة', nameEn: 'Barcelona',
        countryAr: 'إسبانيا', countryEn: 'Spain', countryCode: 'es',
        lat: 41.3874, lng: 2.1686,
        priority: 88
    },
    {
        id: 'it-rome', type: 'city',
        nameAr: 'روما', nameEn: 'Rome',
        countryAr: 'إيطاليا', countryEn: 'Italy', countryCode: 'it',
        lat: 41.9028, lng: 12.4964,
        priority: 90
    },
    {
        id: 'nl-amsterdam', type: 'city',
        nameAr: 'أمستردام', nameEn: 'Amsterdam',
        countryAr: 'هولندا', countryEn: 'Netherlands', countryCode: 'nl',
        lat: 52.3676, lng: 4.9041,
        aliasesAr: ['امستردام'],
        priority: 88
    },
    {
        id: 'be-brussels', type: 'city',
        nameAr: 'بروكسل', nameEn: 'Brussels',
        countryAr: 'بلجيكا', countryEn: 'Belgium', countryCode: 'be',
        lat: 50.8503, lng: 4.3517,
        priority: 86
    },
    {
        id: 'at-vienna', type: 'city',
        nameAr: 'فيينا', nameEn: 'Vienna',
        countryAr: 'النمسا', countryEn: 'Austria', countryCode: 'at',
        lat: 48.2082, lng: 16.3738,
        priority: 86
    },
    {
        id: 'ch-geneva', type: 'city',
        nameAr: 'جنيف', nameEn: 'Geneva',
        countryAr: 'سويسرا', countryEn: 'Switzerland', countryCode: 'ch',
        lat: 46.2044, lng: 6.1432,
        priority: 84
    },
    {
        id: 'se-stockholm', type: 'city',
        nameAr: 'ستوكهولم', nameEn: 'Stockholm',
        countryAr: 'السويد', countryEn: 'Sweden', countryCode: 'se',
        lat: 59.3293, lng: 18.0686,
        priority: 84
    },
    {
        id: 'us-ny', type: 'city',
        nameAr: 'نيويورك', nameEn: 'New York',
        countryAr: 'الولايات المتحدة الأمريكية', countryEn: 'United States', countryCode: 'us',
        lat: 40.7128, lng: -74.0060,
        aliasesAr: ['نيو يورك'], aliasesEn: ['NYC', 'New York City'],
        priority: 95
    },
    {
        id: 'us-dc', type: 'city',
        nameAr: 'واشنطن', nameEn: 'Washington',
        countryAr: 'الولايات المتحدة الأمريكية', countryEn: 'United States', countryCode: 'us',
        lat: 38.9072, lng: -77.0369,
        aliasesEn: ['Washington DC'],
        priority: 88
    },
    {
        id: 'us-la', type: 'city',
        nameAr: 'لوس أنجلوس', nameEn: 'Los Angeles',
        countryAr: 'الولايات المتحدة الأمريكية', countryEn: 'United States', countryCode: 'us',
        lat: 34.0522, lng: -118.2437,
        aliasesAr: ['لوس انجلوس'], aliasesEn: ['LA'],
        priority: 88
    },
    {
        id: 'us-chicago', type: 'city',
        nameAr: 'شيكاغو', nameEn: 'Chicago',
        countryAr: 'الولايات المتحدة الأمريكية', countryEn: 'United States', countryCode: 'us',
        lat: 41.8781, lng: -87.6298,
        priority: 86
    },
    {
        id: 'us-houston', type: 'city',
        nameAr: 'هيوستن', nameEn: 'Houston',
        countryAr: 'الولايات المتحدة الأمريكية', countryEn: 'United States', countryCode: 'us',
        lat: 29.7604, lng: -95.3698,
        priority: 84
    },
    {
        id: 'ca-toronto', type: 'city',
        nameAr: 'تورونتو', nameEn: 'Toronto',
        countryAr: 'كندا', countryEn: 'Canada', countryCode: 'ca',
        lat: 43.6532, lng: -79.3832,
        priority: 88
    },
    {
        id: 'ca-montreal', type: 'city',
        nameAr: 'مونتريال', nameEn: 'Montreal',
        countryAr: 'كندا', countryEn: 'Canada', countryCode: 'ca',
        lat: 45.5017, lng: -73.5673,
        priority: 86
    },
    {
        id: 'au-sydney', type: 'city',
        nameAr: 'سيدني', nameEn: 'Sydney',
        countryAr: 'أستراليا', countryEn: 'Australia', countryCode: 'au',
        lat: -33.8688, lng: 151.2093,
        priority: 88
    },
    {
        id: 'au-melbourne', type: 'city',
        nameAr: 'ملبورن', nameEn: 'Melbourne',
        countryAr: 'أستراليا', countryEn: 'Australia', countryCode: 'au',
        lat: -37.8136, lng: 144.9631,
        priority: 86
    },
    {
        id: 'my-kl', type: 'city',
        nameAr: 'كوالالمبور', nameEn: 'Kuala Lumpur',
        countryAr: 'ماليزيا', countryEn: 'Malaysia', countryCode: 'my',
        lat: 3.1390, lng: 101.6869,
        priority: 92
    },
    {
        id: 'id-jakarta', type: 'city',
        nameAr: 'جاكرتا', nameEn: 'Jakarta',
        countryAr: 'إندونيسيا', countryEn: 'Indonesia', countryCode: 'id',
        lat: -6.2088, lng: 106.8456,
        priority: 92
    },
    {
        id: 'pk-karachi', type: 'city',
        nameAr: 'كراتشي', nameEn: 'Karachi',
        countryAr: 'باكستان', countryEn: 'Pakistan', countryCode: 'pk',
        lat: 24.8607, lng: 67.0011,
        priority: 90
    },
    {
        id: 'pk-lahore', type: 'city',
        nameAr: 'لاهور', nameEn: 'Lahore',
        countryAr: 'باكستان', countryEn: 'Pakistan', countryCode: 'pk',
        lat: 31.5204, lng: 74.3587,
        priority: 88
    },
    {
        id: 'pk-islamabad', type: 'city',
        nameAr: 'إسلام آباد', nameEn: 'Islamabad',
        countryAr: 'باكستان', countryEn: 'Pakistan', countryCode: 'pk',
        lat: 33.6844, lng: 73.0479,
        aliasesAr: ['اسلام اباد'],
        priority: 88
    },
    {
        id: 'bd-dhaka', type: 'city',
        nameAr: 'دكا', nameEn: 'Dhaka',
        countryAr: 'بنغلاديش', countryEn: 'Bangladesh', countryCode: 'bd',
        lat: 23.8103, lng: 90.4125,
        priority: 88
    },
    {
        id: 'in-delhi', type: 'city',
        nameAr: 'نيودلهي', nameEn: 'New Delhi',
        countryAr: 'الهند', countryEn: 'India', countryCode: 'in',
        lat: 28.6139, lng: 77.2090,
        priority: 88
    },
    {
        id: 'in-mumbai', type: 'city',
        nameAr: 'مومباي', nameEn: 'Mumbai',
        countryAr: 'الهند', countryEn: 'India', countryCode: 'in',
        lat: 19.0760, lng: 72.8777,
        priority: 88
    }
];
