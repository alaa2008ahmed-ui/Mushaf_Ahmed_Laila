import React, { FC } from 'react';
import { toArabic } from './constants';

const SajdahCardModal: FC<{
    info: { show: boolean, surah: string, ayah: number, juz: number, page: number },
    onClose: () => void,
    isLandscape?: boolean,
    currentTheme?: any
}> = ({ info, onClose, isLandscape, currentTheme }) => {
    if (!info.show) return null;

    const accentColor = currentTheme?.accent || '#38bdf8';
    const btnBg = currentTheme?.btnBg || accentColor;
    const btnText = currentTheme?.btnText || '#ffffff';
    const btnBorder = currentTheme?.btnBorder || 'transparent';

    return (
        <div className={`fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={onClose}>
            <div 
                className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-md rounded-3xl max-h-[90vh]'} shadow-2xl flex flex-col border-0 overflow-hidden animate-modal-enter`} 
                onClick={e => e.stopPropagation()}
                style={{ fontFamily: currentTheme?.font, border: 'none', outline: 'none' }}
            >
                <div className="p-5 overflow-y-auto text-right leading-relaxed space-y-4 text-sm flex-1 custom-scrollbar">
                    <div>
                        <p className="font-black text-base mb-1" style={{ color: accentColor }}>1. تعريف سجود التلاوة</p>
                        <p className="mt-1">هو سجود يؤديه القارئ أو المستمع عند قراءة آية من آيات السجود في القرآن الكريم، تعظيماً لله تعالى وإظهاراً للعبودية. وقد ثبت في صحيح مسلم عن أبي هريرة رضي الله عنه قال: قال رسول الله ﷺ:</p>
                        <blockquote 
                            className="mt-2.5 p-3 text-sm italic rounded-2xl quran-raised-card border-0"
                        >
                            "إذَا قَرَأَ ابنُ آدَمَ السَّجْدَةَ فَسَجَدَ، اعْتَزَلَ الشَّيْطَانُ يَبْكِي، يقولُ: يا وَيْلَهُ، أُمِرَ ابنُ آدَمَ بالسُّجُودِ فَسَجَدَ فَلَهُ الجَنَّةُ، وأُمِرْتُ بالسُّجُودِ فأبَيْتُ فَلِيَ النَّارُ".
                        </blockquote>
                    </div>

                    <div>
                        <p className="font-black text-base mb-1" style={{ color: accentColor }}>2. عدد آيات السجدة ومواضعها</p>
                        <p className="mt-1 mb-2">اتفق جمهور العلماء على وجود آيات السجود في القرآن، وأشهر الآراء أنها 15 سجدة، وهي موزعة كالآتي:</p>
                        <div className={`grid ${isLandscape ? 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5' : 'grid-cols-2'} gap-x-4 gap-y-2 text-xs p-4 rounded-2xl quran-raised-card border-0`}>
                            <div className="text-right">الأعراف: <b>{toArabic(206)}</b></div>
                            <div className="text-right">النمل: <b>{toArabic(26)}</b></div>
                            <div className="text-right">الرعد: <b>{toArabic(15)}</b></div>
                            <div className="text-right">السجدة: <b>{toArabic(15)}</b></div>
                            <div className="text-right">النحل: <b>{toArabic(50)}</b></div>
                            <div className="text-right">ص: <b>{toArabic(24)}</b></div>
                            <div className="text-right">الإسراء: <b>{toArabic(109)}</b></div>
                            <div className="text-right">فصلت: <b>{toArabic(38)}</b></div>
                            <div className="text-right">مريم: <b>{toArabic(58)}</b></div>
                            <div className="text-right">النجم: <b>{toArabic(62)}</b></div>
                            <div className="text-right">الحج (سجدتان): <b>{toArabic(18)} و {toArabic(77)}</b></div>
                            <div className="text-right">الانشقاق: <b>{toArabic(21)}</b></div>
                            <div className="text-right">الفرقان: <b>{toArabic(60)}</b></div>
                            <div className="text-right">العلق: <b>{toArabic(19)}</b></div>
                        </div>
                    </div>

                    <div>
                        <p className="font-black text-base mb-1" style={{ color: accentColor }}>3. حكم سجود التلاوة</p>
                        <p className="mt-1 mb-2">اختلف الفقهاء في حكمها على قولين مشهورين:</p>
                        <ul className="list-disc pr-5 space-y-2">
                            <li><b>جمهور العلماء (الشافعية والمالكية والحنابلة):</b> أنها سُنّة مؤكدة وليست واجبة؛ واستدلوا بأن عمر بن الخطاب رضي الله عنه قرأ السجدة يوم الجمعة على المنبر فنزل وسجد، ثم قرأها في الجمعة التالية فلم يسجد وقال: "إن الله لم يفرض علينا السجود إلا أن نشاء".</li>
                            <li><b>الحنفية:</b> ذهبوا إلى أنها واجبة على القارئ والمستمع.</li>
                        </ul>
                    </div>

                    <div>
                        <p className="font-black text-base mb-1" style={{ color: accentColor }}>4. شروط وكيفية سجود التلاوة</p>
                        <div className="space-y-3 mt-1">
                            <p><b>الشروط:</b><br/>يشترط لها عند جمهور الفقهاء ما يشترط للصلاة (الطهارة، استقبال القبلة، ستر العورة)، بينما ذهب بعض العلماء (مثل ابن تيمية والشوكاني) إلى أنه يجوز السجود دون طهارة (مثل سجود الشكر) لأنها ليست صلاة كاملة، لكن الأفضل والأحوط هو التطهر.</p>
                            <div>
                                <p><b>الكيفية:</b></p>
                                <ul className="list-disc pr-5 space-y-2 mt-1">
                                    <li><b>التكبير:</b> يُكبر الساجد عند الهويّ للسجود (وعند الرفع منه إذا كان داخل الصلاة).</li>
                                    <li><b>السجود:</b> سجدة واحدة كسجدة الصلاة.</li>
                                    <li>
                                        <b>الدعاء:</b> يُشرع فيها ما يقال في سجود الصلاة "سبحان ربي الأعلى"، ويُستحب الدعاء المأثور:
                                        <blockquote 
                                            className="mt-2 p-2.5 rounded-xl text-sm italic quran-raised-card border-0"
                                        >
                                            "سَجَدَ وَجْهِي لِلَّذِي خَلَقَهُ، وَشَقَّ سَمْعَهُ وَبَصَرَهُ، بِحَوْلِهِ وَقُوَّتِهِ".
                                        </blockquote>
                                        <blockquote 
                                            className="mt-2 p-2.5 rounded-xl text-sm italic quran-raised-card border-0"
                                        >
                                            "اللَّهُمَّ اكْتُبْ لِي بِهَا عِنْدَكَ أَجْرًا، وَضَعْ عَنِّي بِهَا وِزْرًا، وَاجْعَلْهَا لِي عِنْدَكَ ذُخْرًا، وَتَقَبَّلْهَا مِنِّي كَمَا تَقَبَّلْتَهَا مِنْ عَبْدِكَ دَاوُدَ".
                                        </blockquote>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="font-black text-base mb-1" style={{ color: accentColor }}>5. ملاحظات هامة</p>
                        <ul className="list-disc pr-5 space-y-2 mt-1">
                            <li><b>داخل الصلاة:</b> إذا قرأ الإمام آية سجدة، يسجد ويسجد المأمومون معه.</li>
                            <li><b>للمستمع:</b> يشرع السجود للمستمع الذي يقصد سماع القرآن، أما "السامع" (من مرّ صدفة أو سمعها في مكان عام دون قصد) فلا يجب عليه السجود عند كثير من الفقهاء.</li>
                            <li><b>العجز عن السجود:</b> من لم يستطع السجود لسبب ما (كأن يكون في وسيلة مواصلات)، يمكنه الإيماء برأسه أو الاكتفاء بالذكر.</li>
                        </ul>
                    </div>
                </div>
                <div className="p-4 border-0 themed-card-bg rounded-b-3xl">
                    <button 
                        onClick={onClose} 
                        className="w-full py-3.5 rounded-2xl font-bold transition-all active:scale-95 border-0 quran-raised-btn-selected shadow-md"
                        style={{ 
                            backgroundColor: btnBg, 
                            color: btnText,
                        }}
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SajdahCardModal;
