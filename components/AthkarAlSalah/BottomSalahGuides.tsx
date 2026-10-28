import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { shareAsImage } from '../../utils/shareAsImage';

interface BottomSalahGuidesProps {
    theme: any;
    themeKey: string;
    cardBorderColor: string;
    isBlackTheme: boolean;
    isEn: boolean;
    onZoom: (data: any) => void;
    setToastMessage: (msg: string) => void;
}

export const BottomSalahGuides: React.FC<BottomSalahGuidesProps> = ({
    theme,
    themeKey,
    cardBorderColor,
    isBlackTheme,
    isEn,
    onZoom,
    setToastMessage
}) => {
    const isBlack = isBlackTheme || theme?.bgColor === '#000000' || theme?.name === 'أبيض وأسود' || theme?.name === 'اسود';
    const primaryColor = isBlack ? '#FFFFFF' : (theme?.palette?.[0] || theme?.accent || '#2E7D5E');
    const tintedBg = isBlack ? 'rgba(255, 255, 255, 0.05)' : `${primaryColor}14`;

    // All cards are folded (collapsed) by default as requested
    const [openCards, setOpenCards] = useState<{ [key: string]: boolean }>({});

    const toggleCard = (id: string) => {
        setOpenCards(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleCopy = (text: string, title: string) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        const cleanText = tempDiv.textContent || tempDiv.innerText || text;
        navigator.clipboard.writeText(`${title}\n\n${cleanText}\n\nمصحف أحمد و ليلى`);
        setToastMessage(isEn ? 'Copied to clipboard 📋' : 'تم النسخ إلى الحافظة 📋');
    };

    // --- Content for Sunan Rawatib ---
    const sunanTitle = isEn ? 'Daily Sunnah Prayers (Rawatib)' : 'سنن الصلوات (الرواتب)';
    const sunanSummary = isEn ? '12 Confirmed Daily Rak\'ahs' : '١٢ ركعة مؤكدة يومياً';
    const sunanHtmlAr = `
        <div class="space-y-4 text-xl md:text-2xl" dir="rtl">
            <div class="flex justify-between border-b border-black/10 dark:border-white/10 pb-2"><span>صلاة الفجر:</span> <b>٢ ركعة قبلية</b></div>
            <div class="flex justify-between border-b border-black/10 dark:border-white/10 pb-2"><span>صلاة الظهر:</span> <b>٤ قبلية و ٢ بعدية</b></div>
            <div class="flex justify-between border-b border-black/10 dark:border-white/10 pb-2"><span>صلاة العصر:</span> <i class="opacity-60">ليس لها سنة راتبة</i></div>
            <div class="flex justify-between border-b border-black/10 dark:border-white/10 pb-2"><span>صلاة المغرب:</span> <b>٢ ركعة بعدية</b></div>
            <div class="flex justify-between border-b border-black/10 dark:border-white/10 pb-2"><span>صلاة العشاء:</span> <b>٢ ركعة بعدية</b></div>
            <div class="pt-2 text-center font-bold text-lg" style="color: ${theme.palette[0]};">المجموع: ١٢ ركعة في اليوم والليلة</div>
        </div>
    `;
    const sunanHtmlEn = `
        <div class="space-y-4 text-lg md:text-xl text-left" dir="ltr">
            <div class="flex justify-between border-b border-black/10 dark:border-white/10 pb-2"><span>Fajr:</span> <b>2 Rak'ahs Before</b></div>
            <div class="flex justify-between border-b border-black/10 dark:border-white/10 pb-2"><span>Dhuhr:</span> <b>4 Before & 2 After</b></div>
            <div class="flex justify-between border-b border-black/10 dark:border-white/10 pb-2"><span>Asr:</span> <i class="opacity-60">No confirmed Sunnah</i></div>
            <div class="flex justify-between border-b border-black/10 dark:border-white/10 pb-2"><span>Maghrib:</span> <b>2 Rak'ahs After</b></div>
            <div class="flex justify-between border-b border-black/10 dark:border-white/10 pb-2"><span>Isha:</span> <b>2 Rak'ahs After</b></div>
            <div class="pt-3 text-center font-bold text-lg" style="color: ${theme.palette[0]};">Total: 12 Rak'ahs daily</div>
        </div>
    `;

    // --- Content for Hadiths on Sunan ---
    const hadithsTitle = isEn ? 'Hadiths on the Virtues of Sunan' : 'أحاديث في فضل السنن';
    const hadithsSummary = isEn ? '4 Authentic Prophetic Hadiths' : '٤ أحاديث نبوية صحيحة';
    const hadithsHtmlAr = `
        <div class="space-y-6 text-xl md:text-2xl text-right font-amiri" dir="rtl">
            <div class="border-b border-black/5 dark:border-white/5 pb-4 p-2 rounded-lg">
                <p class="leading-relaxed">عن أم حبيبة رضي الله عنها قالت: سمعت رسول الله ﷺ يقول: <span style="color: ${theme.palette[0]}; font-weight: bold;">"مَنْ صَلَّى فِي يَوْمٍ وَلَيْلَةٍ ثِنْتَيْ عَشْرَةَ رَكْعَةً بُنِيَ لَهُ بَيْتٌ فِي الْجَنَّةِ"</span>.</p>
                <p class="text-sm mt-2 opacity-60 font-sans">- رواه مسلم</p>
            </div>
            <div class="border-b border-black/5 dark:border-white/5 pb-4 p-2 rounded-lg">
                <p class="leading-relaxed">عن عائشة رضي الله عنها عن النبي ﷺ قال: <span style="color: ${theme.palette[1]}; font-weight: bold;">"رَكْعَتَا الْفَجْرِ خَيْرٌ مِنَ الدُّنْيَا وَمَا فِيهَا"</span>.</p>
                <p class="text-sm mt-2 opacity-60 font-sans">- رواه مسلم</p>
            </div>
            <div class="border-b border-black/5 dark:border-white/5 pb-4 p-2 rounded-lg">
                <p class="leading-relaxed">عن ابن عمر رضي الله عنهما أن النبي ﷺ قال: <span style="color: ${theme.palette[0]}; font-weight: bold;">"رَحِمَ اللَّهُ امْرَأً صَلَّى قَبْلَ الْعَصْرِ أَرْبَعًا"</span>.</p>
                <p class="text-sm mt-2 opacity-60 font-sans">- رواه الترمذي وأبو داود</p>
            </div>
            <div class="border-b border-black/5 dark:border-white/5 pb-4 p-2 rounded-lg">
                <p class="leading-relaxed">عن أم حبيبة رضي الله عنها قالت: قال رسول الله ﷺ: <span style="color: ${theme.palette[1]}; font-weight: bold;">"مَنْ حَافَظَ عَلَى أَرْبَعِ رَكَعَاتٍ قَبْلَ الظُّهْرِ وَأَرْبَعٍ بَعْدَهَا حَرَّمَهُ اللَّهُ عَلَى النَّارِ"</span>.</p>
                <p class="text-sm mt-2 opacity-60 font-sans">- رواه الترمذي وأبو داود</p>
            </div>
        </div>
    `;
    const hadithsHtmlEn = `
        <div class="space-y-6 text-lg md:text-xl text-left" dir="ltr">
            <div class="border-b border-black/5 dark:border-white/5 pb-4 p-2 rounded-lg">
                <p class="leading-relaxed">Umm Habibah (may Allah be pleased with her) reported: I heard the Messenger of Allah ﷺ say: <span style="color: ${theme.palette[0]}; font-weight: bold;">"Whoever prays twelve Rak'ahs during the day and night, a house will be built for him in Paradise."</span></p>
                <p class="text-sm mt-2 opacity-60 font-sans">- Sahih Muslim</p>
            </div>
            <div class="border-b border-black/5 dark:border-white/5 pb-4 p-2 rounded-lg">
                <p class="leading-relaxed">Aisha (may Allah be pleased with her) reported that the Prophet ﷺ said: <span style="color: ${theme.palette[1]}; font-weight: bold;">"The two Rak'ahs before Fajr are better than this world and everything in it."</span></p>
                <p class="text-sm mt-2 opacity-60 font-sans">- Sahih Muslim</p>
            </div>
            <div class="border-b border-black/5 dark:border-white/5 pb-4 p-2 rounded-lg">
                <p class="leading-relaxed">Ibn Umar (may Allah be pleased with them) reported that the Prophet ﷺ said: <span style="color: ${theme.palette[0]}; font-weight: bold;">"May Allah have mercy on a person who prays four Rak'ahs before Asr."</span></p>
                <p class="text-sm mt-2 opacity-60 font-sans">- At-Tirmidhi & Abu Dawud</p>
            </div>
            <div class="border-b border-black/5 dark:border-white/5 pb-4 p-2 rounded-lg">
                <p class="leading-relaxed">Umm Habibah (may Allah be pleased with her) reported: The Messenger of Allah ﷺ said: <span style="color: ${theme.palette[1]}; font-weight: bold;">"Whoever guards four Rak'ahs before Dhuhr and four after it, Allah will forbid him from the Fire."</span></p>
                <p class="text-sm mt-2 opacity-60 font-sans">- At-Tirmidhi & Abu Dawud</p>
            </div>
        </div>
    `;

    // --- Content for Sujood As-Sahw (سهو الصلاة) ---
    const sahwTitle = isEn ? 'Sujood As-Sahw' : 'سهو الصلاة';
    const sahwSummary = isEn ? 'Comprehensive Guide, Timings & Rulings' : 'أسبابه ومواضعه وأحكامه بالتفصيل';
    
    const sahwHtmlAr = `
        <div class="space-y-6 text-right font-amiri text-lg md:text-xl leading-relaxed" dir="rtl">
            <div class="bg-black/5 dark:bg-white/5 p-4 rounded-xl border-r-4" style="border-right-color: ${theme.palette[0]};">
                <h4 class="font-bold text-xl mb-1" style="color: ${theme.palette[0]};">ما هو سجود السهو وحكمه؟</h4>
                <p class="opacity-90 leading-relaxed">
                    هو سجدتان يسجدهما المصلي قبل السلام أو بعده لجبر خلل طرأ على صلاته سهواً (بزيادة أو نقص أو شك). وهو سنة مؤكدة واجبة في بعض الأحوال لجبر النقص وإرغام الشيطان وإرضاء الرحمن.
                </p>
            </div>

            <div class="space-y-3">
                <h4 class="font-bold text-xl" style="color: ${theme.palette[1]};">الأسباب الثلاثة لسجود السهو:</h4>
                
                <div class="p-3.5 rounded-xl bg-card-bg-hover border border-black/5 dark:border-white/10">
                    <div class="flex items-center gap-2 font-bold mb-1.5" style="color: ${theme.palette[0]};">
                        <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white" style="background-color: ${theme.palette[0]};">١</span>
                        <span>الزيادة في الصلاة (سجوده بعد السلام):</span>
                    </div>
                    <p class="text-base opacity-90 leading-relaxed">
                        إذا زاد المصلي في صلاته سهواً ركوعاً أو سجوداً أو قياماً أو ركعة خامسة في صلاة رباعية: متى تذكّر جلس فوراً وأتمّ صلاته، ثم يسجد سجدتين <b>بعد السلام</b> ويسلم.
                    </p>
                </div>

                <div class="p-3.5 rounded-xl bg-card-bg-hover border border-black/5 dark:border-white/10">
                    <div class="flex items-center gap-2 font-bold mb-1.5" style="color: ${theme.palette[1]};">
                        <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white" style="background-color: ${theme.palette[1]};">٢</span>
                        <span>النقص في الصلاة (سجوده قبل السلام):</span>
                    </div>
                    <p class="text-base opacity-90 leading-relaxed">
                        <b>نقص الواجبات:</b> كنسيان التشهد الأول، أو تكبيرات الانتقال، أو التسبيح في الركوع والسجود. يسقط بالسهو ويُجبر بسجدتين <b>قبل السلام</b>.<br/>
                        <b>نقص الأركان:</b> كالركوع أو السجود أو الفاتحة؛ فالركن لا يسقط بالسهو ولا يجبره السهو بمفرده، بل لابد من الإتيان بالركن ثم سجود السهو.
                    </p>
                </div>

                <div class="p-3.5 rounded-xl bg-card-bg-hover border border-black/5 dark:border-white/10">
                    <div class="flex items-center gap-2 font-bold mb-1.5" style="color: ${theme.palette[0]};">
                        <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white" style="background-color: ${theme.palette[0]};">٣</span>
                        <span>الشك في عدد الركعات:</span>
                    </div>
                    <p class="text-base opacity-90 leading-relaxed">
                        <b>إذا ترجح عنده أحد الأمرين (غلبة الظن):</b> يبني على ما ترجح عنده ويتم صلاته ويسجد <b>بعد السلام</b>.<br/>
                        <b>إذا تساوى الأمران دون ترجيح:</b> يبني على اليقين وهو الأقل (مثلاً شك هل صلى ٣ أم ٤؟ يجعلها ٣)، ويكمل ما بقي ويسجد <b>قبل السلام</b>.
                    </p>
                </div>
            </div>

            <div class="p-4 rounded-xl border-2" style="border-color: ${theme.palette[0]}50; background: linear-gradient(to bottom, ${theme.palette[0]}10, transparent);">
                <h4 class="font-bold text-xl text-center mb-3" style="color: ${theme.palette[0]};">⭐ القاعدة الذهبية: متى يكون قبل السلام ومتى بعده؟</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-base">
                    <div class="bg-black/5 dark:bg-white/5 p-3 rounded-lg border-t-2" style="border-top-color: ${theme.palette[0]};">
                        <b class="text-lg block mb-1" style="color: ${theme.palette[0]};">سجدتان قَبْلَ السلام:</b>
                        <ul class="list-disc list-inside space-y-1 opacity-90 text-sm">
                            <li>عند <b>النقص</b> في الصلاة (كنسيان التشهد الأول).</li>
                            <li>عند <b>الشك دون ترجيح</b> (البناء على الأقل).</li>
                        </ul>
                    </div>
                    <div class="bg-black/5 dark:bg-white/5 p-3 rounded-lg border-t-2" style="border-top-color: ${theme.palette[1]};">
                        <b class="text-lg block mb-1" style="color: ${theme.palette[1]};">سجدتان بَعْدَ السلام:</b>
                        <ul class="list-disc list-inside space-y-1 opacity-90 text-sm">
                            <li>عند <b>الزيادة</b> في الصلاة (كركعة خامسة سهواً).</li>
                            <li>عند <b>الشك مع غلبة الظن والترجيح</b>.</li>
                            <li>إذا سلّم المصلي ناسياً قبل تمام صلاته ثم أتمها.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="p-4 rounded-xl bg-black/5 dark:bg-white/5">
                <h4 class="font-bold text-xl mb-2" style="color: ${theme.palette[1]};">كيفية سجوده وما يقال فيه:</h4>
                <p class="text-base opacity-90 leading-relaxed">
                    يسجد سجدتين كسجدات الصلاة يكبر عند الهبوط والرفع، ويقول فيهما ما يقول في سجود الصلاة: <b>«سُبْحَانَ رَبِّيَ الأَعْلَى»</b> ثلاثاً، ويستحب فيهما الدعاء.<br/>
                    ويجلس بين السجدتين ويقول: <b>«رَبِّ اغْفِرْ لِي»</b>.<br/>
                    ثم يسلم تسليمتين (عن يمينه وعن يساره).
                </p>
            </div>

            <div class="space-y-2 text-base">
                <h4 class="font-bold text-xl mb-1" style="color: ${theme.palette[0]};">مسائل وفتاوى شائعة:</h4>
                <div class="p-2.5 rounded-lg bg-card-bg-hover">
                    <b>نسيان التشهد الأول:</b> إن تذكر قبل أن يستتم قائماً رجع وجلس، وإن استتم قائماً مضى في صلاته ولا يرجع ويسجد قبل السلام.
                </div>
                <div class="p-2.5 rounded-lg bg-card-bg-hover">
                    <b>سهو المأموم خلف الإمام:</b> الإمام يحمل سهو المأموم، فلا يسجد المأموم إن سها وحده. أما إذا سها الإمام فيجب على المأموم متابعته في سجود السهو.
                </div>
                <div class="p-2.5 rounded-lg bg-card-bg-hover">
                    <b>نسيان سجود السهو:</b> إن نسي سجود السهو وطال الفصل سقطت عنه الصلاة وصحت صلاته إن شاء الله ولا إعادة عليه.
                </div>
            </div>
        </div>
    `;

    const sahwHtmlEn = `
        <div class="space-y-6 text-left text-base md:text-lg leading-relaxed font-sans" dir="ltr">
            <div class="bg-black/5 dark:bg-white/5 p-4 rounded-xl border-l-4" style="border-left-color: ${theme.palette[0]};">
                <h4 class="font-bold text-lg mb-1" style="color: ${theme.palette[0]};">What is Sujood As-Sahw?</h4>
                <p class="opacity-90 leading-relaxed">
                    It consists of two prostrations performed either before or after Tasleem to compensate for accidental errors in prayer (due to addition, omission, or doubt), demonstrating Allah's mercy and easing hardship.
                </p>
            </div>

            <div class="space-y-3">
                <h4 class="font-bold text-lg" style="color: ${theme.palette[1]};">The Three Causes of Sujood As-Sahw:</h4>
                <div class="p-3.5 rounded-xl bg-card-bg-hover border border-black/5 dark:border-white/10">
                    <b style="color: ${theme.palette[0]};">1. Addition (Az-Ziyadah) — Done AFTER Tasleem:</b>
                    <p class="text-sm mt-1 opacity-90 leading-relaxed">
                        If one accidentally adds an extra bow, prostration, or 5th Rak'ah in a 4-Rak'ah prayer: as soon as one realizes, sit down immediately, finish the prayer, and perform two prostrations <b>after Tasleem</b>.
                    </p>
                </div>
                <div class="p-3.5 rounded-xl bg-card-bg-hover border border-black/5 dark:border-white/10">
                    <b style="color: ${theme.palette[1]};">2. Omission (An-Naqs) — Done BEFORE Tasleem:</b>
                    <p class="text-sm mt-1 opacity-90 leading-relaxed">
                        <b>Missing an Obligatory Act (Wajib):</b> such as forgetting the first Tashahhud or transition Takbeers. This is compensated by two prostrations <b>before Tasleem</b>.<br/>
                        <b>Missing a Pillar (Rukn):</b> like forgetting Ruku' or Sujood. A pillar cannot be compensated by forgetfulness prostrations alone; one must perform the missing pillar first.
                    </p>
                </div>
                <div class="p-3.5 rounded-xl bg-card-bg-hover border border-black/5 dark:border-white/10">
                    <b style="color: ${theme.palette[0]};">3. Doubt (Ash-Shakk):</b>
                    <p class="text-sm mt-1 opacity-90 leading-relaxed">
                        <b>With prevailing certainty:</b> act upon what is most likely and prostrate <b>after Tasleem</b>.<br/>
                        <b>With equal doubt (50/50):</b> build upon the lower number with certainty, complete the prayer, and prostrate <b>before Tasleem</b>.
                    </p>
                </div>
            </div>

            <div class="p-4 rounded-xl border-2" style="border-color: ${theme.palette[0]}50; background: linear-gradient(to bottom, ${theme.palette[0]}10, transparent);">
                <h4 class="font-bold text-lg text-center mb-2" style="color: ${theme.palette[0]};">⭐ Golden Rule: Before or After Tasleem?</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div class="bg-black/5 dark:bg-white/5 p-3 rounded-lg border-t-2" style="border-top-color: ${theme.palette[0]};">
                        <b class="text-base block mb-1" style="color: ${theme.palette[0]};">BEFORE Tasleem:</b>
                        <ul class="list-disc list-inside space-y-1 opacity-90">
                            <li>Upon <b>Omission</b> (e.g. forgetting first Tashahhud).</li>
                            <li>Upon <b>Unresolved Doubt</b> (building on the lesser count).</li>
                        </ul>
                    </div>
                    <div class="bg-black/5 dark:bg-white/5 p-3 rounded-lg border-t-2" style="border-top-color: ${theme.palette[1]};">
                        <b class="text-base block mb-1" style="color: ${theme.palette[1]};">AFTER Tasleem:</b>
                        <ul class="list-disc list-inside space-y-1 opacity-90">
                            <li>Upon <b>Addition</b> (e.g. accidental extra Rak'ah).</li>
                            <li>Upon <b>Resolved Doubt</b> with prevailing certainty.</li>
                            <li>If one made Tasleem prematurely by mistake, then remembered and completed it.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="p-4 rounded-xl bg-black/5 dark:bg-white/5">
                <h4 class="font-bold text-lg mb-1" style="color: ${theme.palette[1]};">How to Perform & What to Say:</h4>
                <p class="text-sm opacity-90 leading-relaxed">
                    Make Takbeer and prostrate twice just like normal prayer prostrations. Say: <b>"Subhana Rabbiyal-A'la"</b> (Glory be to my Lord, the Most High) three times, sit between them saying <b>"Rabbighfir li"</b> (My Lord, forgive me), and conclude with Tasleem.
                </p>
            </div>
        </div>
    `;

    const handleShareCard = async (title: string, htmlContent: string) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        const textContent = tempDiv.textContent || tempDiv.innerText || title;

        await shareAsImage({
            text: textContent,
            title: title,
            source: isEn ? 'Fiqh of Prayer' : 'فقه الصلاة وسجود السهو',
            category: isEn ? 'Prayer Guides' : 'أذكار الصلاة وفقهها',
            theme,
            isEn,
            language: isEn ? 'en' : 'ar',
            setToastMessage
        });
    };

    return (
        <div className="mt-8 pt-4 space-y-4">
            {/* Section Divider Header */}
            <div className="flex items-center gap-3 px-1 mb-2">
                <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                    {isEn ? 'Prayer Guides & Sunan' : 'إرشادات الصلاة والسنن'}
                </span>
                <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
            </div>

            {/* --- CARD 1: Sunan Rawatib --- */}
            <div
                className="rounded-2xl transition-all duration-300 overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-md border border-slate-100/60 dark:border-white/5"
                style={{
                    backgroundColor: tintedBg
                }}
            >
                {/* Header (Accordion Toggle) - No arrows */}
                <button
                    onClick={() => toggleCard('sunan')}
                    className="w-full p-4 flex items-center justify-between gap-3 text-right cursor-pointer select-none transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    dir={isEn ? 'ltr' : 'rtl'}
                    aria-expanded={!!openCards['sunan']}
                >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                            style={{
                                backgroundColor: isBlack ? '#27272a' : `${primaryColor}20`,
                                color: primaryColor
                            }}
                        >
                            <i className="fa-solid fa-mosque text-lg"></i>
                        </div>
                        <div className="min-w-0 text-right" dir={isEn ? 'ltr' : 'rtl'}>
                            <h3 className="font-bold text-sm sm:text-base leading-snug truncate" style={{ color: primaryColor }}>
                                {sunanTitle}
                            </h3>
                            <p className="text-xs opacity-75 truncate mt-0.5">
                                {sunanSummary}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <span
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                            style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                        >
                            {openCards['sunan'] ? (isEn ? 'Hide' : 'إخفاء') : (isEn ? 'View' : 'عرض')}
                        </span>
                    </div>
                </button>

                {/* Collapsible Content */}
                <AnimatePresence initial={false}>
                    {openCards['sunan'] && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: 'easeInOut' }}
                            className="overflow-hidden border-t border-black/5 dark:border-white/5 bg-white/80 dark:bg-slate-900/40 backdrop-blur-sm"
                        >
                            <div className="p-4 sm:p-5">
                                <div className={`space-y-2 text-sm ${isEn ? 'font-sans' : 'font-amiri'} themed-text-muted`} dir={isEn ? 'ltr' : 'rtl'}>
                                    <div className="flex justify-between border-b border-card-border pb-1.5">
                                        <span>{isEn ? 'Fajr Prayer:' : 'صلاة الفجر:'}</span>
                                        <span className="font-bold">{isEn ? "2 Rak'ahs Before" : "٢ ركعة قبلية"}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-card-border pb-1.5">
                                        <span>{isEn ? 'Dhuhr Prayer:' : 'صلاة الظهر:'}</span>
                                        <span className="font-bold">{isEn ? "4 Before & 2 After" : "٤ قبلية و ٢ بعدية"}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-card-border pb-1.5">
                                        <span>{isEn ? 'Asr Prayer:' : 'صلاة العصر:'}</span>
                                        <span className="opacity-60 italic">{isEn ? "No confirmed Sunnah" : "ليس لها سنة راتبة"}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-card-border pb-1.5">
                                        <span>{isEn ? 'Maghrib Prayer:' : 'صلاة المغرب:'}</span>
                                        <span className="font-bold">{isEn ? "2 Rak'ahs After" : "٢ ركعة بعدية"}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-card-border pb-1.5">
                                        <span>{isEn ? 'Isha Prayer:' : 'صلاة العشاء:'}</span>
                                        <span className="font-bold">{isEn ? "2 Rak'ahs After" : "٢ ركعة بعدية"}</span>
                                    </div>
                                    <div className="pt-2 text-center font-bold text-base" style={{ color: theme.palette[0] }}>
                                        {isEn ? 'Total: 12 Rak\'ahs daily' : 'المجموع: ١٢ ركعة في اليوم والليلة'}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-card-border gap-2">
                                    <button
                                        onClick={() => onZoom({
                                            title: sunanTitle,
                                            titleEn: sunanTitle,
                                            text: sunanHtmlAr,
                                            textEn: sunanHtmlEn,
                                            note: isEn ? "Confirmed Daily Sunan" : "الرواتب المؤكدة",
                                            noteEn: "Confirmed Daily Sunan"
                                        })}
                                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors"
                                        title={isEn ? "Zoom" : "تكبير وقراءة"}
                                    >
                                        <i className="fa-solid fa-magnifying-glass-plus"></i>
                                        <span>{isEn ? 'Zoom' : 'تكبير وقراءة'}</span>
                                    </button>
                                    <button
                                        onClick={() => handleShareCard(sunanTitle, isEn ? sunanHtmlEn : sunanHtmlAr)}
                                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-white shadow-sm transition-opacity hover:opacity-90"
                                        style={{ backgroundColor: theme.palette[0] }}
                                        title={isEn ? "Share Image" : "مشاركة كصورة"}
                                    >
                                        <i className="fa-solid fa-share-nodes"></i>
                                        <span>{isEn ? 'Share Image' : 'مشاركة كصورة'}</span>
                                    </button>
                                    <button
                                        onClick={() => handleCopy(isEn ? sunanHtmlEn : sunanHtmlAr, sunanTitle)}
                                        className="py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors"
                                        title={isEn ? "Copy" : "نسخ"}
                                    >
                                        <i className="fa-regular fa-copy"></i>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- CARD 2: Hadiths on Sunan --- */}
            <div
                className="rounded-2xl transition-all duration-300 overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-md border border-slate-100/60 dark:border-white/5"
                style={{
                    backgroundColor: tintedBg
                }}
            >
                {/* Header (Accordion Toggle) - No arrows */}
                <button
                    onClick={() => toggleCard('hadiths')}
                    className="w-full p-4 flex items-center justify-between gap-3 text-right cursor-pointer select-none transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    dir={isEn ? 'ltr' : 'rtl'}
                    aria-expanded={!!openCards['hadiths']}
                >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                            style={{
                                backgroundColor: isBlack ? '#27272a' : `${primaryColor}20`,
                                color: primaryColor
                            }}
                        >
                            <i className="fa-solid fa-scroll text-lg"></i>
                        </div>
                        <div className="min-w-0 text-right" dir={isEn ? 'ltr' : 'rtl'}>
                            <h3 className="font-bold text-sm sm:text-base leading-snug truncate" style={{ color: primaryColor }}>
                                {hadithsTitle}
                            </h3>
                            <p className="text-xs opacity-75 truncate mt-0.5">
                                {hadithsSummary}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <span
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                            style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                        >
                            {openCards['hadiths'] ? (isEn ? 'Hide' : 'إخفاء') : (isEn ? 'View' : 'عرض')}
                        </span>
                    </div>
                </button>

                {/* Collapsible Content */}
                <AnimatePresence initial={false}>
                    {openCards['hadiths'] && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: 'easeInOut' }}
                            className="overflow-hidden border-t border-black/5 dark:border-white/5 bg-white/80 dark:bg-slate-900/40 backdrop-blur-sm"
                        >
                            <div className="p-4 sm:p-5">
                                <div className={`space-y-4 text-sm ${isEn ? 'font-sans' : 'font-amiri'} themed-text-muted`} dir={isEn ? 'ltr' : 'rtl'}>
                                    <div className={`bg-card-bg-hover p-3 rounded-xl ${isEn ? 'border-l-3' : 'border-r-3'}`} style={isEn ? { borderLeftColor: theme.palette[0] } : { borderRightColor: theme.palette[0] }}>
                                        <p className="leading-relaxed">
                                            {isEn ? (
                                                <>Umm Habibah (may Allah be pleased with her) reported: I heard the Messenger of Allah ﷺ say: <span className="font-bold" style={{ color: theme.palette[0] }}>"Whoever prays twelve Rak'ahs during the day and night, a house will be built for him in Paradise."</span></>
                                            ) : (
                                                <>عن أم حبيبة رضي الله عنها قالت: سمعت رسول الله ﷺ يقول: <span className="font-bold" style={{ color: theme.palette[0] }}>"مَنْ صَلَّى فِي يَوْمٍ وَلَيْلَةٍ ثِنْتَيْ عَشْرَةَ رَكْعَةً بُنِيَ لَهُ بَيْتٌ فِي الْجَنَّةِ"</span>.</>
                                            )}
                                        </p>
                                        <p className={`${isEn ? 'text-right' : 'text-left'} text-[11px] mt-1.5 opacity-70`}>{isEn ? '- Sahih Muslim' : '- رواه مسلم'}</p>
                                    </div>
                                    
                                    <div className={`bg-card-bg-hover p-3 rounded-xl ${isEn ? 'border-l-3' : 'border-r-3'}`} style={isEn ? { borderLeftColor: theme.palette[1] } : { borderRightColor: theme.palette[1] }}>
                                        <p className="leading-relaxed">
                                            {isEn ? (
                                                <>Aisha (may Allah be pleased with her) reported that the Prophet ﷺ said: <span className="font-bold" style={{ color: theme.palette[1] }}>"The two Rak'ahs before Fajr are better than this world and everything in it."</span></>
                                            ) : (
                                                <>عن عائشة رضي الله عنها عن النبي ﷺ قال: <span className="font-bold" style={{ color: theme.palette[1] }}>"رَكْعَتَا الْفَجْرِ خَيْرٌ مِنَ الدُّنْيَا وَمَا فِيهَا"</span>.</>
                                            )}
                                        </p>
                                        <p className={`${isEn ? 'text-right' : 'text-left'} text-[11px] mt-1.5 opacity-70`}>{isEn ? '- Sahih Muslim' : '- رواه مسلم'}</p>
                                    </div>

                                    <div className={`bg-card-bg-hover p-3 rounded-xl ${isEn ? 'border-l-3' : 'border-r-3'}`} style={isEn ? { borderLeftColor: theme.palette[0] } : { borderRightColor: theme.palette[0] }}>
                                        <p className="leading-relaxed">
                                            {isEn ? (
                                                <>Ibn Umar (may Allah be pleased with them) reported that the Prophet ﷺ said: <span className="font-bold" style={{ color: theme.palette[0] }}>"May Allah have mercy on a person who prays four Rak'ahs before Asr."</span></>
                                            ) : (
                                                <>عن ابن عمر رضي الله عنهما أن النبي ﷺ قال: <span className="font-bold" style={{ color: theme.palette[0] }}>"رَحِمَ اللَّهُ امْرَأً صَلَّى قَبْلَ الْعَصْرِ أَرْبَعًا"</span>.</>
                                            )}
                                        </p>
                                        <p className={`${isEn ? 'text-right' : 'text-left'} text-[11px] mt-1.5 opacity-70`}>{isEn ? '- At-Tirmidhi & Abu Dawud' : '- رواه الترمذي وأبو داود'}</p>
                                    </div>

                                    <div className={`bg-card-bg-hover p-3 rounded-xl ${isEn ? 'border-l-3' : 'border-r-3'}`} style={isEn ? { borderLeftColor: theme.palette[1] } : { borderRightColor: theme.palette[1] }}>
                                        <p className="leading-relaxed">
                                            {isEn ? (
                                                <>Umm Habibah (may Allah be pleased with her) reported: The Messenger of Allah ﷺ said: <span className="font-bold" style={{ color: theme.palette[1] }}>"Whoever guards four Rak'ahs before Dhuhr and four after it, Allah will forbid him from the Fire."</span></>
                                            ) : (
                                                <>عن أم حبيبة رضي الله عنها قالت: قال رسول الله ﷺ: <span className="font-bold" style={{ color: theme.palette[1] }}>"مَنْ حَافَظَ عَلَى أَرْبَعِ رَكَعَاتٍ قَبْلَ الظُّهْرِ وَأَرْبَعٍ بَعْدَهَا حَرَّمَهُ اللَّهُ عَلَى النَّارِ"</span>.</>
                                            )}
                                        </p>
                                        <p className={`${isEn ? 'text-right' : 'text-left'} text-[11px] mt-1.5 opacity-70`}>{isEn ? '- At-Tirmidhi & Abu Dawud' : '- رواه الترمذي وأبو داود'}</p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-card-border gap-2">
                                    <button
                                        onClick={() => onZoom({
                                            title: hadithsTitle,
                                            titleEn: hadithsTitle,
                                            text: hadithsHtmlAr,
                                            textEn: hadithsHtmlEn,
                                            note: isEn ? "Authentic Hadiths" : "أحاديث صحيحة",
                                            noteEn: "Authentic Hadiths"
                                        })}
                                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors"
                                        title={isEn ? "Zoom" : "تكبير وقراءة"}
                                    >
                                        <i className="fa-solid fa-magnifying-glass-plus"></i>
                                        <span>{isEn ? 'Zoom' : 'تكبير وقراءة'}</span>
                                    </button>
                                    <button
                                        onClick={() => handleShareCard(hadithsTitle, isEn ? hadithsHtmlEn : hadithsHtmlAr)}
                                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-white shadow-sm transition-opacity hover:opacity-90"
                                        style={{ backgroundColor: theme.palette[1] }}
                                        title={isEn ? "Share Image" : "مشاركة كصورة"}
                                    >
                                        <i className="fa-solid fa-share-nodes"></i>
                                        <span>{isEn ? 'Share Image' : 'مشاركة كصورة'}</span>
                                    </button>
                                    <button
                                        onClick={() => handleCopy(isEn ? hadithsHtmlEn : hadithsHtmlAr, hadithsTitle)}
                                        className="py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors"
                                        title={isEn ? "Copy" : "نسخ"}
                                    >
                                        <i className="fa-regular fa-copy"></i>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- CARD 3: Sujood As-Sahw (سهو الصلاة) - NEW FEATURE --- */}
            <div
                className="rounded-2xl transition-all duration-300 overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-md border border-slate-100/60 dark:border-white/5"
                style={{
                    backgroundColor: tintedBg
                }}
            >
                {/* Header (Accordion Toggle) - No arrows */}
                <button
                    onClick={() => toggleCard('sahw')}
                    className="w-full p-4 flex items-center justify-between gap-3 text-right cursor-pointer select-none transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    dir={isEn ? 'ltr' : 'rtl'}
                    aria-expanded={!!openCards['sahw']}
                >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                            style={{
                                backgroundColor: isBlack ? '#27272a' : `${primaryColor}20`,
                                color: primaryColor
                            }}
                        >
                            <i className="fa-solid fa-scale-balanced text-lg"></i>
                        </div>
                        <div className="min-w-0 text-right" dir={isEn ? 'ltr' : 'rtl'}>
                            <h3 className="font-bold text-sm sm:text-base leading-snug truncate" style={{ color: primaryColor }}>
                                {sahwTitle}
                            </h3>
                            <p className="text-xs opacity-75 truncate mt-0.5">
                                {sahwSummary}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <span
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                            style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                        >
                            {openCards['sahw'] ? (isEn ? 'Hide' : 'إخفاء') : (isEn ? 'View' : 'عرض')}
                        </span>
                    </div>
                </button>

                {/* Collapsible Content */}
                <AnimatePresence initial={false}>
                    {openCards['sahw'] && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: 'easeInOut' }}
                            className="overflow-hidden border-t border-black/5 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 backdrop-blur-sm"
                        >
                            <div className="p-4 sm:p-5">
                                <div 
                                    dangerouslySetInnerHTML={{ __html: isEn ? sahwHtmlEn : sahwHtmlAr }}
                                />

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-card-border gap-2">
                                    <button
                                        onClick={() => onZoom({
                                            title: sahwTitle,
                                            titleEn: sahwTitle,
                                            text: sahwHtmlAr,
                                            textEn: sahwHtmlEn,
                                            note: isEn ? "Fiqh of Salah & Sujood As-Sahw" : "فقه الصلاة وأحكام سجود السهو",
                                            noteEn: "Fiqh of Salah & Sujood As-Sahw"
                                        })}
                                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors"
                                        title={isEn ? "Zoom" : "تكبير وقراءة موسعة"}
                                    >
                                        <i className="fa-solid fa-magnifying-glass-plus"></i>
                                        <span>{isEn ? 'Zoom' : 'تكبير وقراءة'}</span>
                                    </button>
                                    <button
                                        onClick={() => handleShareCard(sahwTitle, isEn ? sahwHtmlEn : sahwHtmlAr)}
                                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-white shadow-sm transition-opacity hover:opacity-90"
                                        style={{ backgroundColor: theme.palette[0] }}
                                        title={isEn ? "Share Image" : "مشاركة كصورة"}
                                    >
                                        <i className="fa-solid fa-share-nodes"></i>
                                        <span>{isEn ? 'Share Image' : 'مشاركة كصورة'}</span>
                                    </button>
                                    <button
                                        onClick={() => handleCopy(isEn ? sahwHtmlEn : sahwHtmlAr, sahwTitle)}
                                        className="py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors"
                                        title={isEn ? "Copy" : "نسخ النص"}
                                    >
                                        <i className="fa-regular fa-copy"></i>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
