// موسوعة أسباب النزول والقصص القرآنية لجميع سور القرآن الكريم الـ 114 سورة
// تتضمن التفاصيل الكاملة لأسباب النزول النبوية، وقصص الأنبياء والأمم السابقة،
// والعبر والأحكام الإيمانية المفصلة والموثقة من أمهات كتب التفسير والحديث والسيرة النبوية.

export interface SurahEncyclopediaStory {
  surahNumber: number;
  surahNameAr: string;
  surahNameEn: string;
  storyTitleAr: string;
  storyTitleEn: string;
  causeAr: string;
  causeEn: string;
  sourceAr: string;
  sourceEn: string;
  lessonAr: string;
  lessonEn: string;
}

import { SURAH_STORIES_PART_1 } from './surahStoriesPart1';
import { SURAH_STORIES_PART_2 } from './surahStoriesPart2';
import { SURAH_STORIES_PART_3 } from './surahStoriesPart3';
import { SURAH_STORIES_PART_4 } from './surahStoriesPart4';

export const ALL_SURAHS_STORY_ENCYCLOPEDIA: Record<number, SurahEncyclopediaStory> = {
  ...SURAH_STORIES_PART_1,
  ...SURAH_STORIES_PART_2,
  ...SURAH_STORIES_PART_3,
  ...SURAH_STORIES_PART_4,
};
