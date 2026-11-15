export const gregorianMonths = [
    { id: 1, name: 'يناير' }, { id: 2, name: 'فبراير' }, { id: 3, name: 'مارس' },
    { id: 4, name: 'أبريل' }, { id: 5, name: 'مايو' }, { id: 6, name: 'يونيو' },
    { id: 7, name: 'يوليو' }, { id: 8, name: 'أغسطس' }, { id: 9, name: 'سبتمبر' },
    { id: 10, name: 'أكتوبر' }, { id: 11, name: 'نوفمبر' }, { id: 12, name: 'ديسمبر' }
];

export const hijriMonths = [
    { id: 1, name: 'محرم' }, { id: 2, name: 'صفر' }, { id: 3, name: 'ربيع الأول' },
    { id: 4, name: 'ربيع الآخر' }, { id: 5, name: 'جمادى الأولى' }, { id: 6, name: 'جمادى الآخرة' },
    { id: 7, name: 'رجب' }, { id: 8, name: 'شعبان' }, { id: 9, name: 'رمضان' },
    { id: 10, name: 'شوال' }, { id: 11, name: 'ذو القعدة' }, { id: 12, name: 'ذو الحجة' }
];

export interface IslamicEvent {
    id: string;
    day: number;
    month: number; // Hijri month (1-12)
    name: string;
    description: string;
    isPrimary?: boolean;
    historicalYearAr?: string;
    historicalYearEn?: string;
}

export const islamicEvents: IslamicEvent[] = [
    // محرم (Muharram)
    { id: '1', day: 1, month: 1, name: 'رأس السنة الهجرية', description: 'بداية العام الهجري الجديد والافتتاح بالأشهر الحرم', isPrimary: true, historicalYearAr: '1 هـ - 622 م', historicalYearEn: '1 AH - 622 AD' },
    { id: '2', day: 9, month: 1, name: 'يوم تاسوعاء', description: 'مستحب صيامه مع يوم عاشوراء مخالفة لأهل الكتاب', isPrimary: false, historicalYearAr: '61 هـ - 680 م', historicalYearEn: '61 AH - 680 AD' },
    { id: '3', day: 10, month: 1, name: 'يوم عاشوراء المبارك', description: 'اليوم الذي نجَّى الله فيه موسى عليه السلام وقومه من فرعون', isPrimary: true, historicalYearAr: '1 هـ - 622 م', historicalYearEn: '1 AH - 622 AD' },
    { id: '4', day: 17, month: 1, name: 'غزوة خيبر المباركة', description: 'انتصار المسلمين وفتح حصون خيبر المنيعة', isPrimary: false, historicalYearAr: '7 هـ - 628 م', historicalYearEn: '7 AH - 628 AD' },

    // صفر (Safar)
    { id: '5', day: 1, month: 2, name: 'تجهيز جيش أسامة بن زيد', description: 'أمر النبي ﷺ بتجهيز الجيش العظيم لنشر الإسلام', isPrimary: false, historicalYearAr: '11 هـ - 632 م', historicalYearEn: '11 AH - 632 AD' },
    { id: '6', day: 20, month: 2, name: 'ذكرى استشهاد الإمام الحسين', description: 'ذكرى واقعة كربلاء الخالدة في قلوب المؤمنين', isPrimary: false, historicalYearAr: '61 هـ - 680 م', historicalYearEn: '61 AH - 680 AD' },
    { id: '7', day: 27, month: 2, name: 'هجرة النبي إلى غار ثور', description: 'بدء الرحلة النبوية المباركة من مكة متوجهاً للمدينة', isPrimary: true, historicalYearAr: '1 هـ - 622 م', historicalYearEn: '1 AH - 622 AD' },

    // ربيع الأول (Rabi' al-Awwal)
    { id: '8', day: 1, month: 3, name: 'خروج النبي من غار ثور', description: 'انطلاق النبي ﷺ وأبي بكر الصديق نحو يثرب', isPrimary: false, historicalYearAr: '1 هـ - 622 م', historicalYearEn: '1 AH - 622 AD' },
    { id: '9', day: 8, month: 3, name: 'بناء أول مسجد (مسجد قباء)', description: 'وصول النبي ﷺ لقُباء وتأسيس أول مسجد أُسس على التقوى', isPrimary: true, historicalYearAr: '1 هـ - 622 م', historicalYearEn: '1 AH - 622 AD' },
    { id: '10', day: 12, month: 3, name: 'المولد النبوي الشريف', description: 'ذكرى ميلاد الرحمة المهداة نبينا محمد ﷺ', isPrimary: true, historicalYearAr: 'عام الفيل - 571 م', historicalYearEn: 'Year of the Elephant - 571 AD' },
    { id: '11', day: 12, month: 3, name: 'دخول النبي ﷺ المدينة المنورة', description: 'إشراق المدينة المنورة بقدوم المصطفى ﷺ ونصرة الأنصار', isPrimary: false, historicalYearAr: '1 هـ - 622 م', historicalYearEn: '1 AH - 622 AD' },

    // ربيع الآخر (Rabi' al-Thani)
    { id: '12', day: 10, month: 4, name: 'بناء الجامع الأزهر الشريف', description: 'افتتاح الجامع الأزهر كمنارة علمية وثقافية للأمة الإسلامية', isPrimary: false, historicalYearAr: '361 هـ - 972 م', historicalYearEn: '361 AH - 972 AD' },
    { id: '13', day: 15, month: 4, name: 'معركة النهروان', description: 'حفظ وحدة الأمة وصيانة الصف الإسلامي', isPrimary: false, historicalYearAr: '38 هـ - 658 م', historicalYearEn: '38 AH - 658 AD' },

    // جمادى الأولى (Jumada al-Awwal)
    { id: '14', day: 6, month: 5, name: 'غزوة مؤتة العظيمة', description: 'أول مواجهة بين المسلمين والروم واستبسال قادة الإسلام', isPrimary: true, historicalYearAr: '8 هـ - 629 م', historicalYearEn: '8 AH - 629 AD' },
    { id: '15', day: 20, month: 5, name: 'فتح القسطنطينية التاريخي', description: 'بشارة النبي ﷺ على يد السلطان محمد الفاتح', isPrimary: true, historicalYearAr: '857 هـ - 1453 م', historicalYearEn: '857 AH - 1453 AD' },

    // جمادى الآخرة (Jumada al-Thani)
    { id: '16', day: 3, month: 6, name: 'ذكرى وفاة فاطمة الزهراء', description: 'سيدة نساء أهل الجنة وبنت رسول الله ﷺ', isPrimary: false, historicalYearAr: '11 هـ - 632 م', historicalYearEn: '11 AH - 632 AD' },
    { id: '17', day: 22, month: 6, name: 'تولي عمر بن الخطاب الخلافة', description: 'بداية العصر الفتحي العظيم والعدل الفاروقي', isPrimary: true, historicalYearAr: '13 هـ - 634 م', historicalYearEn: '13 AH - 634 AD' },

    // رجب (Rajab)
    { id: '18', day: 1, month: 7, name: 'دخول شهر رجب الأصب', description: 'بداية الأشهر الحرم والاستعداد والتهيؤ لرمضان', isPrimary: true, historicalYearAr: 'من الأشهر الحرم العظام', historicalYearEn: 'Sacred Month' },
    { id: '19', day: 27, month: 7, name: 'ذكرى الإسراء والمعراج الشريفة', description: 'معجزة الإسراء بالنبي ﷺ وفرض الصلوات الخمس', isPrimary: true, historicalYearAr: 'قبل الهجرة بثلاث سنين - 621 م', historicalYearEn: '3 Years Before Hijrah - 621 AD' },
    { id: '20', day: 27, month: 7, name: 'تحرير بيت المقدس (صلاح الدين)', description: 'استرداد القدس الشريف في معركة حطين الخالدة', isPrimary: true, historicalYearAr: '583 هـ - 1187 م', historicalYearEn: '583 AH - 1187 AD' },

    // شعبان (Sha'ban)
    { id: '21', day: 1, month: 8, name: 'دخول شهر شعبان', description: 'شهر تُرفع فيه الأعمال إلى الله استجابة لرغبة النبي ﷺ', isPrimary: false, historicalYearAr: '2 هـ - 624 م', historicalYearEn: '2 AH - 624 AD' },
    { id: '22', day: 15, month: 8, name: 'ليلة النصف من شعبان', description: 'ليلة مباركة تم فيها تحويل القبلة من القدس إلى الكعبة', isPrimary: true, historicalYearAr: '2 هـ - 624 م', historicalYearEn: '2 AH - 624 AD' },

    // رمضان (Ramadan)
    { id: '23', day: 1, month: 9, name: 'أول أيام شهر رمضان المبارك', description: 'بدء شهر الصيام والقيام ونزول القرآن الكريم', isPrimary: true, historicalYearAr: '2 هـ - 624 م', historicalYearEn: '2 AH - 624 AD' },
    { id: '24', day: 10, month: 9, name: 'ذكرى وفاة أم المؤمنين خديجة', description: 'وفاة السيدة خديجة بنت خويلد ناصرة الرسول ﷺ', isPrimary: false, historicalYearAr: '3 قبل الهجرة - 619 م', historicalYearEn: '3 Before Hijrah - 619 AD' },
    { id: '25', day: 17, month: 9, name: 'غزوة بدر الكبرى (يوم الفرقان)', description: 'أول نصر فاصل بين الحق والباطل في التاريخ الإسلامي', isPrimary: true, historicalYearAr: '2 هـ - 624 م', historicalYearEn: '2 AH - 624 AD' },
    { id: '26', day: 20, month: 9, name: 'فتح مكة المكرمة العظيم', description: 'دخول النبي ﷺ مكة فاتحاً وتطهير الكعبة المشرفة من الأصنام', isPrimary: true, historicalYearAr: '8 هـ - 630 م', historicalYearEn: '8 AH - 630 AD' },
    { id: '27', day: 27, month: 9, name: 'ليلة القدر المباركة', description: 'ليلة القدر خير من ألف شهر وتنزل الملائكة فيها والروح', isPrimary: true, historicalYearAr: 'بدء نزول القرآن - 610 م', historicalYearEn: 'Beginning of Quran Revelation - 610 AD' },

    // شوال (Shawwal)
    { id: '28', day: 1, month: 10, name: 'عيد الفطر المبارك', description: 'فرحة المسلمين بإتمام صيام رمضان والتكفير عن السيئات', isPrimary: true, historicalYearAr: '2 هـ - 624 م', historicalYearEn: '2 AH - 624 AD' },
    { id: '29', day: 2, month: 10, name: 'بدء صيام الأيام الست من شوال', description: 'فضل صيام ستة أيام من شوال بعد رمضان كصيام الدهر', isPrimary: false, historicalYearAr: '2 هـ - 624 م', historicalYearEn: '2 AH - 624 AD' },
    { id: '30', day: 15, month: 10, name: 'غزوة أحد المباركة', description: 'ذكرى استشهاد أسد الله حمزة بن عبدالمطلب', isPrimary: true, historicalYearAr: '3 هـ - 625 م', historicalYearEn: '3 AH - 625 AD' },

    // ذو القعدة (Dhu al-Qi'dah)
    { id: '31', day: 1, month: 11, name: 'بداية الأشهر الحرم للحج', description: 'افتتاح أشهر الحج المباركة والاستعداد لبيت الله الحرام', isPrimary: false, historicalYearAr: '10 هـ - 632 م', historicalYearEn: '10 AH - 632 AD' },
    { id: '32', day: 6, month: 11, name: 'صلح الحديبية التاريخي', description: 'الفتح المبين وإقرار السلام والتمهيد لانتشار الإسلام', isPrimary: true, historicalYearAr: '6 هـ - 628 م', historicalYearEn: '6 AH - 628 AD' },

    // ذو الحجة (Dhu al-Hijjah)
    { id: '33', day: 1, month: 12, name: 'أول عشر ذي الحجة المباركة', description: 'أفضل أيام الدنيا والعمل الصالح فيها أحب إلى الله', isPrimary: true, historicalYearAr: '10 هـ - 632 م', historicalYearEn: '10 AH - 632 AD' },
    { id: '34', day: 8, month: 12, name: 'يوم التروية بالحج', description: 'انطلاق الحجاج إلى منى وتجهيز النفس للوقوف بعرفة', isPrimary: false, historicalYearAr: '10 هـ - 632 م', historicalYearEn: '10 AH - 632 AD' },
    { id: '35', day: 9, month: 12, name: 'يوم عرفة المبارك', description: 'ركن الحج الأعظم ويوم يباهي الله فيه ملائكته بعاده', isPrimary: true, historicalYearAr: '10 هـ - 632 م', historicalYearEn: '10 AH - 632 AD' },
    { id: '36', day: 10, month: 12, name: 'عيد الأضحى المبارك (يوم النحر)', description: 'عيد الأضحى الكبير وذكرى أضحية إبراهيم الخليل عليه السلام', isPrimary: true, historicalYearAr: '2 هـ - 624 م', historicalYearEn: '2 AH - 624 AD' },
    { id: '37', day: 11, month: 12, name: 'أيام التشريق المباركة', description: 'أيام أكل وشرب وذكر لله تعالى في منى', isPrimary: false, historicalYearAr: '10 هـ - 632 م', historicalYearEn: '10 AH - 632 AD' },
];
