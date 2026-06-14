
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
}

export const islamicEvents: IslamicEvent[] = [
    { id: '1', day: 1, month: 1, name: 'رأس السنة الهجرية', description: 'بداية العام الهجري الجديد', isPrimary: true },
    { id: '2', day: 10, month: 1, name: 'يوم عاشوراء', description: 'اليوم الذي نجى الله فيه موسى عليه السلام', isPrimary: false },
    { id: '3', day: 12, month: 3, name: 'المولد النبوي الشريف', description: 'ذكرى مولد النبي محمد ﷺ', isPrimary: true },
    { id: '4', day: 27, month: 7, name: 'الإسراء والمعراج', description: 'ذكرى رحلة الإسراء والمعراج', isPrimary: true },
    { id: '5', day: 15, month: 8, name: 'ليلة النصف من شعبان', description: 'ليلة مباركة يتم فيها تحويل القبلة', isPrimary: false },
    { id: '6', day: 1, month: 9, name: 'بداية شهر رمضان', description: 'بداية شهر الصيام الفضيل', isPrimary: true },
    { id: '7', day: 27, month: 9, name: 'ليلة القدر (تقديرياً)', description: 'خير من ألف شهر', isPrimary: true },
    { id: '8', day: 1, month: 10, name: 'عيد الفطر المبارك', description: 'عيد الإفطار بعد انتهاء شهر رمضان', isPrimary: true },
    { id: '9', day: 1, month: 12, name: 'بداية ذي الحجة', description: 'بداية العشر الأوائل من ذي الحجة', isPrimary: false },
    { id: '10', day: 9, month: 12, name: 'يوم عرفة', description: 'الوقوف بعرفة وهو ركن الحج الأعظم', isPrimary: true },
    { id: '11', day: 10, month: 12, name: 'عيد الأضحى المبارك', description: 'عيد الحج الكبير وذكرى تضحية إبراهيم عليه السلام', isPrimary: true },
];
