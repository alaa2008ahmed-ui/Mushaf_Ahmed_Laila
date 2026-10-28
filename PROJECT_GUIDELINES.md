# إرشادات وقواعد المشروع الإلزامية | Mandatory Project Guidelines

> **تنبيه هام وإلزامي (CRITICAL MANDATORY RULE):**
> يجب قراءة ومراجعة هذا الملف **أولاً وقبل البدء بأي طلب أو تعديل** يُطلَب في هذا التطبيق، والالتزام الحرفي بجميع البنود الواردة فيه دون استثناء.
>
> **This file MUST be reviewed first before executing ANY user request or code change in this repository. Every rule below is strictly mandatory.**

---

## أولاً: الدعم التلقائي للغتين (العربية والإنجليزية) وتطابق التصميم الكامل
### 1. First Rule: Automatic Bilingual Support (Arabic & English) & Exact Design Consistency

1. **الدعم التلقائي للغتين العربية والإنجليزية (`ar` / `en`):**
   - عند إنشاء أي **صفحة جديدة**، أو **قائمة / نافذة منبثقة جديدة**، أو كتابة **أي نص جديد** (عناوين، أزرار، تنبيهات، حقول بحث، رسائل حالة، إشعارات)، يجب **تلقائياً ودون الحاجة لطلب خاص** دعم اللغتين **العربية والإنجليزية** معاً.
   - يجب ربط النصوص بنظام اللغات في التطبيق عبر `useLanguage()` من `context/LanguageContext.tsx` (`language`, `t`, `isRTL`, `dir`) وإضافة المفاتيح المقابلة في كلٍ من القاموس العربي (`ar`) والقاموس الإنجليزي (`en`).
   - مراعاة اتجاه الواجهة (`dir={dir}` و `isRTL`) وتنسيق الأرقام والأوقات والتواريخ والأيقونات الاتجاهية بما يتوافق مع اللغة المختارة.
   - *English Summary:* Every new page, menu, modal, button, or text string MUST automatically include full Arabic (`ar`) and English (`en`) translations via `LanguageContext`, including proper `dir`/`isRTL` layout, directional icons, and localized numerals/times/dates.

2. **الالتزام التام بهوية وتصميم التطبيق الحالي:**
   - يجب أن تتبع أي صفحة جديدة أو قائمة جديدة أو زر جديد **نفس تصميم الصفحات والقوائم والأزرار الموجودة في صفحات التطبيق الأخرى تماماً** بدون أي شذوذ بصري.
   - يشمل ذلك الالتزام بـ:
     - الشريط العلوي الموحد (`app-top-bar`، زر الرجوع، العنوان في المنتصف، `ThemePageLock`، زر الصفحة الرئيسية، ودليل الاستخدام إن وجد).
     - أنماط البطاقات والأزرار المجسمة والمرتفعة ونوافذ القوائم (`modal-skinned`, `quran-raised-btn`, `quran-raised-card`, `quran-3d-icon`, إلخ).
     - نظام الثيمات الديناميكي الكامل عبر `useTheme()` ومتغيرات CSS (`--qr-*`, `--bg-color`, `--text-color`, إلخ) ودعم الثيم الأسود الداكن (`deep_black`).
     - نفس الخطوط المعتمدة (`font-cairo`, `font-kufi`, إلخ) والمسافات والظلال والانحناءات.
   - *English Summary:* Every new page, menu, modal, card, or button MUST strictly match the exact UI/UX design patterns, header layout (`app-top-bar`), 3D/raised button styles, typography, spacing, and dynamic theme variables (`useTheme`, `deep_black` handling) used across existing pages.

---

## ثانياً: منع حذف أي أكواد أو أوامر إلا بطلب مباشر أو استئذان مسبق
### 2. Second Rule: Strict Prohibition of Unauthorized Code or Command Deletion

1. **عدم الحذف النهائي بدون أمر صريح:**
   - عند الإضافة أو التعديل على الكود أو التطبيق، **يُمنع منعاً باتاً حذف أي أكواد أو دوال أو أوامر أو مكونات أو خصائص موجودة في ملفات الكود نهائياً**، إلا إذا طلب المستخدم حذفها **بشكل مباشر وصريح**.
   - *English Summary:* When adding or modifying features/code, NEVER delete any existing code, functions, commands, handlers, styles, or logic from any file unless explicitly and directly instructed to do so by the user.

2. **الاستئذان المسبق الإلزامي عند الحاجة للحذف:**
   - إذا تطلّب تنفيذ تعديل معين حذف أي جزء من الكود أو الأوامر الموجودة، **يجب التوقف وسؤال المستخدم أولاً قبل إجراء الحذف**، مع توضيح الجزء المراد حذفه وسببه، وانتظار موافقته الصريحة قبل المساس به.
   - *English Summary:* If a change genuinely requires removing existing code or commands and the user did not explicitly request that deletion, you MUST stop and ask the user for confirmation first before removing anything.

---

## قائمة التحقق السريعة قبل تنفيذ أي طلب | Pre-Execution Checklist
- [ ] هل تمت مراجعة ملف `PROJECT_GUIDELINES.md` قبل البدء؟
- [ ] هل جميع النصوص أو القوائم أو الصفحات الجديدة تدعم اللغتين العربية والإنجليزية تلقائياً؟
- [ ] هل التصميم الجديد مطابق تماماً لتصميم الصفحات والقوائم والأزرار والثيمات في بقية التطبيق؟
- [ ] هل تم التأكد من **عدم حذف أي كود أو أمر موجود** لم يطلب المستخدم حذفه صراحةً (أو تم استئذانه أولاً)؟
