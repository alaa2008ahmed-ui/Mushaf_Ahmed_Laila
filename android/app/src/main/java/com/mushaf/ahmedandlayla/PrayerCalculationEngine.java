package com.mushaf.ahmedandlayla;

import java.util.Calendar;
import java.util.Date;
import java.util.TimeZone;

public class PrayerCalculationEngine {

    public static class PrayerResult {
        public String fajr;
        public String sunrise;
        public String dhuhr;
        public String asr;
        public String maghrib;
        public String isha;
        public String midnight;
        public String lastThird;

        public long fajrMillis;
        public long sunriseMillis;
        public long dhuhrMillis;
        public long asrMillis;
        public long maghribMillis;
        public long ishaMillis;
        public long midnightMillis;
        public long lastThirdMillis;

        public String hijriDate;
        public String gregorianDate;
        public String dayName;
    }

    public static PrayerResult calculate(
            Date date,
            double latitude,
            double longitude,
            int methodId,
            boolean isHanafi,
            int[] offsets,
            boolean isArabic,
            long baseDateMillis,
            String baseHijri,
            String baseGregorian
    ) {
        PrayerResult result = new PrayerResult();
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);

        int year = cal.get(Calendar.YEAR);
        int month = cal.get(Calendar.MONTH) + 1;
        int day = cal.get(Calendar.DAY_OF_MONTH);

        TimeZone tz = cal.getTimeZone();
        double tzOffsetHours = tz.getOffset(date.getTime()) / 3600000.0;

        // Determine parameters based on methodId
        double fajrAngle = 18.0;
        double ishaAngle = 18.0;
        boolean ishaIsMinutes = false;
        int ishaMinutes = 90;

        switch (methodId) {
            case 1: // Karachi
                fajrAngle = 18.0;
                ishaAngle = 18.0;
                break;
            case 2: // North America
                fajrAngle = 15.0;
                ishaAngle = 15.0;
                break;
            case 4: // Umm Al-Qura (Makkah)
                fajrAngle = 18.5;
                ishaIsMinutes = true;
                ishaMinutes = 90;
                break;
            case 5: // Egyptian General Authority
                fajrAngle = 19.5;
                ishaAngle = 17.5;
                break;
            case 9: // Kuwait
                fajrAngle = 18.0;
                ishaAngle = 17.5;
                break;
            case 10: // Qatar
                fajrAngle = 18.0;
                ishaIsMinutes = true;
                ishaMinutes = 90;
                break;
            case 16: // Dubai
                fajrAngle = 18.2;
                ishaAngle = 18.2;
                break;
            case 3: // Muslim World League
            default:
                fajrAngle = 18.0;
                ishaAngle = 17.0;
                break;
        }

        // Astronomical calculations
        double jd = julianDate(year, month, day);
        double t = (jd - 2451545.0) / 36525.0;

        double l0 = 280.46646 + t * (36000.76983 + 0.0003032 * t);
        l0 = fixAngle(l0);

        double m = 357.52911 + t * (35999.05029 - 0.0001537 * t);
        m = fixAngle(m);

        double e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);

        double c = Math.sin(Math.toRadians(m)) * (1.914602 - t * (0.004817 + 0.000014 * t))
                + Math.sin(Math.toRadians(2 * m)) * (0.019993 - 0.000101 * t)
                + Math.sin(Math.toRadians(3 * m)) * 0.000289;

        double trueLong = l0 + c;
        double appLong = trueLong - 0.00569 - 0.00478 * Math.sin(Math.toRadians(125.04 - 1934.136 * t));

        double obliq = 23.439291 - 0.0130042 * t;
        double dec = Math.toDegrees(Math.asin(Math.sin(Math.toRadians(obliq)) * Math.sin(Math.toRadians(appLong))));

        double y = Math.tan(Math.toRadians(obliq / 2.0));
        y *= y;

        double eot = 4.0 * Math.toDegrees(y * Math.sin(2 * Math.toRadians(l0))
                - 2 * e * Math.sin(Math.toRadians(m))
                + 4 * e * y * Math.sin(Math.toRadians(m)) * Math.cos(2 * Math.toRadians(l0))
                - 0.5 * y * y * Math.sin(4 * Math.toRadians(l0))
                - 1.25 * e * e * Math.sin(2 * Math.toRadians(m)));

        double noon = 12.0 + tzOffsetHours - (longitude / 15.0) - (eot / 60.0);

        double sunriseHour = noon - hourAngle(-0.8333, latitude, dec);
        double sunsetHour = noon + hourAngle(-0.8333, latitude, dec);
        double fajrHour = noon - hourAngle(-fajrAngle, latitude, dec);
        double dhuhrHour = noon + (1.0 / 60.0); // + 1 minute past transit

        // Asr calculation
        double shadowFactor = isHanafi ? 2.0 : 1.0;
        double asrAngle = Math.toDegrees(Math.atan(1.0 / (shadowFactor + Math.tan(Math.toRadians(Math.abs(latitude - dec))))));
        double asrHour = noon + hourAngle(asrAngle, latitude, dec);

        // Isha calculation
        double ishaHour;
        if (ishaIsMinutes) {
            ishaHour = sunsetHour + (ishaMinutes / 60.0);
        } else {
            ishaHour = noon + hourAngle(-ishaAngle, latitude, dec);
        }

        // Apply offsets if available (fajr, sunrise, dhuhr, asr, maghrib, isha)
        if (offsets != null && offsets.length >= 6) {
            fajrHour += offsets[0] / 60.0;
            sunriseHour += offsets[1] / 60.0;
            dhuhrHour += offsets[2] / 60.0;
            asrHour += offsets[3] / 60.0;
            sunsetHour += offsets[4] / 60.0;
            ishaHour += offsets[5] / 60.0;
        }

        // Convert hours to absolute Date / Milliseconds
        result.fajrMillis = hourToMillis(cal, fajrHour);
        result.sunriseMillis = hourToMillis(cal, sunriseHour);
        result.dhuhrMillis = hourToMillis(cal, dhuhrHour);
        result.asrMillis = hourToMillis(cal, asrHour);
        result.maghribMillis = hourToMillis(cal, sunsetHour);
        result.ishaMillis = hourToMillis(cal, ishaHour);

        // Next day Fajr estimate for midnight and last third
        double nextFajrHour = fajrHour + 24.0;
        double nightDuration = nextFajrHour - sunsetHour;
        double midnightHour = sunsetHour + (nightDuration / 2.0);
        double lastThirdHour = sunsetHour + (nightDuration * 2.0 / 3.0);

        result.midnightMillis = hourToMillis(cal, midnightHour);
        result.lastThirdMillis = hourToMillis(cal, lastThirdHour);

        result.fajr = formatTime(result.fajrMillis);
        result.sunrise = formatTime(result.sunriseMillis);
        result.dhuhr = formatTime(result.dhuhrMillis);
        result.asr = formatTime(result.asrMillis);
        result.maghrib = formatTime(result.maghribMillis);
        result.isha = formatTime(result.ishaMillis);
        result.midnight = formatTime(result.midnightMillis);
        result.lastThird = formatTime(result.lastThirdMillis);

        // Calculate Hijri & Gregorian Dates
        int dayOfWeek = cal.get(Calendar.DAY_OF_WEEK);
        result.dayName = getDayName(dayOfWeek, isArabic);

        String[] hijriComputed = computeHijriDate(cal, date.getTime(), baseDateMillis, baseHijri, isArabic);
        result.hijriDate = hijriComputed[0];
        result.gregorianDate = computeGregorianDate(cal, isArabic);

        return result;
    }

    private static double hourAngle(double angle, double lat, double dec) {
        double latRad = Math.toRadians(lat);
        double decRad = Math.toRadians(dec);
        double angleRad = Math.toRadians(angle);

        double cosHA = (Math.sin(angleRad) - Math.sin(latRad) * Math.sin(decRad)) / (Math.cos(latRad) * Math.cos(decRad));
        if (cosHA > 1.0) cosHA = 1.0;
        if (cosHA < -1.0) cosHA = -1.0;

        return Math.toDegrees(Math.acos(cosHA)) / 15.0;
    }

    private static double fixAngle(double angle) {
        angle = angle - 360.0 * Math.floor(angle / 360.0);
        return angle < 0 ? angle + 360.0 : angle;
    }

    private static double julianDate(int year, int month, int day) {
        if (month <= 2) {
            year -= 1;
            month += 12;
        }
        double a = Math.floor(year / 100.0);
        double b = 2 - a + Math.floor(a / 4.0);
        return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
    }

    private static long hourToMillis(Calendar baseCal, double hour) {
        Calendar c = (Calendar) baseCal.clone();
        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);

        long startOfDay = c.getTimeInMillis();
        long millis = (long) (hour * 3600.0 * 1000.0);
        return startOfDay + millis;
    }

    private static String formatTime(long millis) {
        Calendar c = Calendar.getInstance();
        c.setTimeInMillis(millis);
        int h = c.get(Calendar.HOUR);
        if (h == 0) h = 12;
        int m = c.get(Calendar.MINUTE);
        return String.format(java.util.Locale.US, "%02d:%02d", h, m);
    }

    public static String getDayName(int dayOfWeek, boolean isArabic) {
        if (isArabic) {
            switch (dayOfWeek) {
                case Calendar.SUNDAY: return "الأحد";
                case Calendar.MONDAY: return "الإثنين";
                case Calendar.TUESDAY: return "الثلاثاء";
                case Calendar.WEDNESDAY: return "الأربعاء";
                case Calendar.THURSDAY: return "الخميس";
                case Calendar.FRIDAY: return "الجمعة";
                case Calendar.SATURDAY: return "السبت";
            }
        } else {
            switch (dayOfWeek) {
                case Calendar.SUNDAY: return "Sunday";
                case Calendar.MONDAY: return "Monday";
                case Calendar.TUESDAY: return "Tuesday";
                case Calendar.WEDNESDAY: return "Wednesday";
                case Calendar.THURSDAY: return "Thursday";
                case Calendar.FRIDAY: return "Friday";
                case Calendar.SATURDAY: return "Saturday";
            }
        }
        return "";
    }

    private static String computeGregorianDate(Calendar cal, boolean isArabic) {
        int d = cal.get(Calendar.DAY_OF_MONTH);
        int m = cal.get(Calendar.MONTH);
        int y = cal.get(Calendar.YEAR);

        String[] monthsAr = {"يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"};
        String[] monthsEn = {"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"};

        String monthName = isArabic ? monthsAr[m] : monthsEn[m];
        return d + " " + monthName + " " + y;
    }

    private static String[] computeHijriDate(Calendar cal, long nowMillis, long baseDateMillis, String baseHijri, boolean isArabic) {
        String[] hijriMonthsAr = {
            "المحرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
            "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
        };
        String[] hijriMonthsEn = {
            "Muharram", "Safar", "Rabi' 1", "Rabi' 2", "Jumada 1", "Jumada 2",
            "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhul-Qadah", "Dhul-Hijjah"
        };

        if (baseDateMillis > 0 && baseHijri != null && !baseHijri.trim().isEmpty()) {
            try {
                long diffMillis = nowMillis - baseDateMillis;
                int diffDays = (int) Math.round(diffMillis / (86400000.0));

                String clean = baseHijri.trim();
                String[] parts = clean.split("\\s+");
                if (parts.length >= 3) {
                    int hDay = Integer.parseInt(parts[0].replaceAll("[^0-9]", ""));
                    String hMonthRaw = parts[1];
                    int hYear = Integer.parseInt(parts[2].replaceAll("[^0-9]", ""));

                    hDay += diffDays;
                    while (hDay > 30) {
                        hDay -= 30;
                    }
                    while (hDay < 1) {
                        hDay += 29;
                    }

                    if (!isArabic) {
                        String translatedMonth = translateHijriMonth(hMonthRaw);
                        return new String[]{hDay + " " + translatedMonth + " " + hYear};
                    } else {
                        return new String[]{hDay + " " + hMonthRaw + " " + hYear};
                    }
                }
            } catch (Exception ignored) {}
        }

        // Algorithmic fallback
        double jd = julianDate(cal.get(Calendar.YEAR), cal.get(Calendar.MONTH) + 1, cal.get(Calendar.DAY_OF_MONTH));
        int l = (int) jd - 1948440 + 10632;
        int n = (int) ((l - 1) / 10631.0);
        l = l - 10631 * n + 354;
        int j = (int) ((10985 - l) / 5316.0) * (int) ((50 * l) / 17719.0) + (int) (l / 5670.0) * (int) ((43 * l) / 15238.0);
        l = l - (int) ((30 - j) / 15.0) * (int) ((17719 * j) / 50.0) - (int) (j / 16.0) * (int) ((15238 * j) / 43.0) + 29;
        int hMonth = (int) ((24 * l) / 709.0);
        int hDay = l - (int) ((709 * hMonth) / 24.0);
        int hYear = 30 * n + j - 30;

        int mIdx = Math.max(0, Math.min(11, hMonth - 1));
        String monthStr = isArabic ? hijriMonthsAr[mIdx] : hijriMonthsEn[mIdx];
        return new String[]{hDay + " " + monthStr + " " + hYear};
    }

    public static String translateHijriMonth(String arabicMonth) {
        if (arabicMonth == null) return "";
        String clean = arabicMonth.replaceAll("[\\u064B-\\u065F\\u0670]", "").trim();
        if (clean.contains("محرم")) return "Muharram";
        if (clean.contains("صفر")) return "Safar";
        if (clean.contains("ربيع") && (clean.contains("أول") || clean.contains("اول"))) return "Rabi' 1";
        if (clean.contains("ربيع") && (clean.contains("آخر") || clean.contains("اخر") || clean.contains("ثاني"))) return "Rabi' 2";
        if (clean.contains("جماد") && (clean.contains("أول") || clean.contains("اول") || clean.contains("أولى") || clean.contains("اولى"))) return "Jumada 1";
        if (clean.contains("جماد") && (clean.contains("آخر") || clean.contains("اخر") || clean.contains("ثاني") || clean.contains("أخيرة") || clean.contains("اخيرة"))) return "Jumada 2";
        if (clean.contains("رجب")) return "Rajab";
        if (clean.contains("شعبان")) return "Sha'ban";
        if (clean.contains("رمضان")) return "Ramadan";
        if (clean.contains("شوال")) return "Shawwal";
        if (clean.contains("قعدة") || clean.contains("قعده")) return "Dhul-Qadah";
        if (clean.contains("حجة") || clean.contains("حجه")) return "Dhul-Hijjah";
        return clean;
    }
}
