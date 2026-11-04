package com.mushaf.ahmedandlayla;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProviderInfo;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.ScrollView;
import android.widget.SeekBar;
import android.widget.TextView;

public class WidgetConfigureActivity extends Activity {

    private int mAppWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
    private String mWidgetType = "classic"; // "classic", "compact"

    // Preview Layouts
    private LinearLayout previewClassicCard;
    private LinearLayout previewCompactCard;

    // Classic Preview Details
    private RelativeLayout previewTopRightBox;
    private LinearLayout previewLeftDateBox;
    private TextView tvPreviewNextPrayer;
    private TextView tvPreviewDate;

    private FrameLayout previewStrip1;
    private FrameLayout previewStrip2;
    private FrameLayout previewStrip3;
    private FrameLayout previewStrip4;

    private LinearLayout previewMiddleGrid;
    private TextView pNameFajr, pTimeFajr;
    private TextView pNameSunrise, pTimeSunrise;
    private TextView pNameDhuhr, pTimeDhuhr;
    private TextView pNameAsr, pTimeAsr;
    private TextView pNameMaghrib, pTimeMaghrib;
    private TextView pNameIsha, pTimeIsha;

    private FrameLayout previewSep1, previewSep2, previewSep3, previewSep4, previewSep5;
    private LinearLayout previewNightStrip;
    private TextView tvPreviewNight;

    // Compact Preview Details
    private TextView tvCompactPreviewDate;
    private LinearLayout previewCompactPrevBox;
    private TextView tvCompactPrevLabel, tvCompactPrevName, tvCompactPrevTime;
    private LinearLayout previewCompactNextBox;
    private TextView tvCompactNextLabel, tvCompactNextName, tvCompactNextTime;
    private LinearLayout previewCompactRibbon;
    private TextView tvCompactPreviewCountdown;



    // Transparency Controls (Slider Only)
    private SeekBar sbTransparency;
    private TextView tvTransparencyVal;

    // 16 Active Themes (2 per row in settings, single-word names)
    private LinearLayout cardThemeRoyalGold3d;
    private ImageView ivRadioRoyalGold3d;
    private TextView tvThemeRoyalGold3dTitle;

    private LinearLayout cardThemeAntiqueBronze3d;
    private ImageView ivRadioAntiqueBronze3d;
    private TextView tvThemeAntiqueBronze3dTitle;

    private LinearLayout cardThemeRoyalMarble3d;
    private ImageView ivRadioRoyalMarble3d;
    private TextView tvThemeRoyalMarble3dTitle;

    private LinearLayout cardThemePearlWhite3d;
    private ImageView ivRadioPearlWhite3d;
    private TextView tvThemePearlWhite3dTitle;

    private LinearLayout cardThemeGoldenTrio;
    private ImageView ivRadioGoldenTrio;
    private TextView tvThemeGoldenTrioTitle;

    private LinearLayout cardThemeVioletGreenLight;
    private ImageView ivRadioVioletGreenLight;
    private TextView tvThemeVioletGreenLightTitle;

    private LinearLayout cardThemeSkyBlueLight;
    private ImageView ivRadioSkyBlueLight;
    private TextView tvThemeSkyBlueLightTitle;

    private LinearLayout cardThemeRosePeachLight;
    private ImageView ivRadioRosePeachLight;
    private TextView tvThemeRosePeachLightTitle;

    private LinearLayout cardThemeEmeraldMintLight;
    private ImageView ivRadioEmeraldMintLight;
    private TextView tvThemeEmeraldMintLightTitle;

    private LinearLayout cardThemeEmerald3d;
    private ImageView ivRadioEmerald3d;
    private TextView tvThemeEmerald3dTitle;

    private LinearLayout cardThemeCyberNeon3d;
    private ImageView ivRadioCyberNeon3d;
    private TextView tvThemeCyberNeon3dTitle;

    private LinearLayout cardThemeVioletAmethyst3d;
    private ImageView ivRadioVioletAmethyst3d;
    private TextView tvThemeVioletAmethyst3dTitle;

    private LinearLayout cardThemeAzureCrystal3d;
    private ImageView ivRadioAzureCrystal3d;
    private TextView tvThemeAzureCrystal3dTitle;

    private LinearLayout cardThemeEmerald;
    private ImageView ivRadioEmerald;
    private TextView tvThemeEmeraldTitle;

    private LinearLayout cardThemeNavy;
    private ImageView ivRadioNavy;
    private TextView tvThemeNavyTitle;

    private LinearLayout cardThemeBlack;
    private ImageView ivRadioBlack;
    private TextView tvThemeBlackTitle;

    // Action Buttons & Headers
    private Button btnSave;
    private Button btnCancel;
    private TextView tvMainTitle;
    private TextView tvTransHeader;
    private TextView tvThemeHeader;

    private int selectedTransparency = 100;
    private String selectedTheme = "royal_gold_3d";
    private boolean isArabic = true;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setResult(RESULT_CANCELED);

        Intent intent = getIntent();
        Bundle extras = intent.getExtras();
        if (extras != null) {
            mAppWidgetId = extras.getInt(
                    AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
        }

        if (mAppWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            finish();
            return;
        }

        setContentView(R.layout.activity_widget_configure);

        // System Window Insets: Top inset to fixed top bar, bottom inset to fixed bottom action bar
        View root = findViewById(R.id.config_root_view);
        if (root != null && android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT_WATCH) {
            root.setOnApplyWindowInsetsListener((v, insets) -> {
                int topInset = insets.getSystemWindowInsetTop();
                int bottomInset = insets.getSystemWindowInsetBottom();
                int density = Math.round(getResources().getDisplayMetrics().density);

                View fixedTop = findViewById(R.id.config_fixed_top);
                if (fixedTop != null) {
                    fixedTop.setPadding(
                            fixedTop.getPaddingLeft(),
                            Math.max(topInset + (8 * density), 14 * density),
                            fixedTop.getPaddingRight(),
                            fixedTop.getPaddingBottom()
                    );
                }

                View fixedBottom = findViewById(R.id.config_fixed_bottom);
                if (fixedBottom != null) {
                    fixedBottom.setPadding(
                            fixedBottom.getPaddingLeft(),
                            fixedBottom.getPaddingTop(),
                            fixedBottom.getPaddingRight(),
                            Math.max(bottomInset + (10 * density), 14 * density)
                    );
                }
                return insets;
            });
        }

        // Determine which of the 2 widgets is being configured
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(this);
        AppWidgetProviderInfo info = appWidgetManager.getAppWidgetInfo(mAppWidgetId);
        String providerName = (info != null && info.provider != null) ? info.provider.getClassName() : "";
        if (providerName.contains("Compact")) {
            mWidgetType = "compact";
        } else {
            mWidgetType = "classic";
        }

        // Load saved preferences: first check this widget ID, then check this widget's type, then default
        SharedPreferences prefs = getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        selectedTransparency = prefs.getInt("widget_transparency_" + mAppWidgetId, prefs.getInt("widget_" + mWidgetType + "_transparency", 95));
        selectedTheme = prefs.getString("widget_theme_" + mAppWidgetId, prefs.getString("widget_" + mWidgetType + "_theme", "royal_gold_3d"));

        String appLang = prefs.getString("app_language", "ar");
        isArabic = !"en".equalsIgnoreCase(appLang);

        bindViews();
        setupLanguage();
        setupPreviewVisibility();
        setupListeners();
        updatePreview();

        // Auto-scroll controls directly to the currently selected theme
        final ScrollView scrollView = findViewById(R.id.config_scroll_controls);
        if (scrollView != null) {
            scrollView.post(() -> {
                View targetCard = getCardForTheme(selectedTheme);
                if (targetCard != null) {
                    int[] scrollLoc = new int[2];
                    scrollView.getLocationOnScreen(scrollLoc);
                    int[] cardLoc = new int[2];
                    targetCard.getLocationOnScreen(cardLoc);
                    int targetY = cardLoc[1] - scrollLoc[1] + scrollView.getScrollY();
                    scrollView.smoothScrollTo(0, Math.max(0, targetY - 40));
                }
            });
        }
    }

    private View getCardForTheme(String theme) {
        if (theme == null) return cardThemeRoyalGold3d;
        switch (theme.toLowerCase()) {
            case "royal_gold_3d": return cardThemeRoyalGold3d;
            case "antique_bronze_3d": return cardThemeAntiqueBronze3d;
            case "royal_marble_3d": return cardThemeRoyalMarble3d;
            case "pearl_white_3d": return cardThemePearlWhite3d;
            case "golden_trio": return cardThemeGoldenTrio;
            case "violet_green_light": return cardThemeVioletGreenLight;
            case "sky_blue_light": return cardThemeSkyBlueLight;
            case "rose_peach_light": return cardThemeRosePeachLight;
            case "emerald_mint_light": return cardThemeEmeraldMintLight;
            case "emerald_3d": return cardThemeEmerald3d;
            case "cyber_neon_3d": return cardThemeCyberNeon3d;
            case "violet_amethyst_3d": return cardThemeVioletAmethyst3d;
            case "azure_crystal_3d": return cardThemeAzureCrystal3d;
            case "emerald": return cardThemeEmerald;
            case "navy": return cardThemeNavy;
            case "black": return cardThemeBlack;
            default: return cardThemeRoyalGold3d;
        }
    }

    private void bindViews() {
        tvMainTitle = findViewById(R.id.tv_main_title);

        previewClassicCard = findViewById(R.id.preview_classic_card);
        previewCompactCard = findViewById(R.id.preview_compact_card);


        // Classic preview views
        previewTopRightBox = findViewById(R.id.preview_top_right_box);
        previewLeftDateBox = findViewById(R.id.preview_left_date_box);
        tvPreviewNextPrayer = findViewById(R.id.tv_preview_next_prayer);
        tvPreviewDate = findViewById(R.id.tv_preview_date);

        previewStrip1 = findViewById(R.id.preview_strip_1);
        previewStrip2 = findViewById(R.id.preview_strip_2);
        previewStrip3 = findViewById(R.id.preview_strip_3);
        previewStrip4 = findViewById(R.id.preview_strip_4);

        previewMiddleGrid = findViewById(R.id.preview_middle_grid);
        pNameFajr = findViewById(R.id.p_name_fajr);
        pTimeFajr = findViewById(R.id.p_time_fajr);
        pNameSunrise = findViewById(R.id.p_name_sunrise);
        pTimeSunrise = findViewById(R.id.p_time_sunrise);
        pNameDhuhr = findViewById(R.id.p_name_dhuhr);
        pTimeDhuhr = findViewById(R.id.p_time_dhuhr);
        pNameAsr = findViewById(R.id.p_name_asr);
        pTimeAsr = findViewById(R.id.p_time_asr);
        pNameMaghrib = findViewById(R.id.p_name_maghrib);
        pTimeMaghrib = findViewById(R.id.p_time_maghrib);
        pNameIsha = findViewById(R.id.p_name_isha);
        pTimeIsha = findViewById(R.id.p_time_isha);

        previewSep1 = findViewById(R.id.preview_sep_1);
        previewSep2 = findViewById(R.id.preview_sep_2);
        previewSep3 = findViewById(R.id.preview_sep_3);
        previewSep4 = findViewById(R.id.preview_sep_4);
        previewSep5 = findViewById(R.id.preview_sep_5);

        previewNightStrip = findViewById(R.id.preview_night_strip);
        tvPreviewNight = findViewById(R.id.tv_preview_night);

        // Compact preview views
        tvCompactPreviewDate = findViewById(R.id.tv_compact_preview_date);
        previewCompactPrevBox = findViewById(R.id.preview_compact_prev_box);
        tvCompactPrevLabel = findViewById(R.id.tv_compact_prev_label);
        tvCompactPrevName = findViewById(R.id.tv_compact_prev_name);
        tvCompactPrevTime = findViewById(R.id.tv_compact_prev_time);

        previewCompactNextBox = findViewById(R.id.preview_compact_next_box);
        tvCompactNextLabel = findViewById(R.id.tv_compact_next_label);
        tvCompactNextName = findViewById(R.id.tv_compact_next_name);
        tvCompactNextTime = findViewById(R.id.tv_compact_next_time);

        previewCompactRibbon = findViewById(R.id.preview_compact_ribbon);
        tvCompactPreviewCountdown = findViewById(R.id.tv_compact_preview_countdown);



        // Transparency Views
        tvTransHeader = findViewById(R.id.tv_trans_header);
        tvTransparencyVal = findViewById(R.id.tv_transparency_val);
        sbTransparency = findViewById(R.id.sb_transparency);

        // Theme Cards
        tvThemeHeader = findViewById(R.id.tv_theme_header);

        // 16 Theme Cards
        cardThemeRoyalGold3d = findViewById(R.id.card_theme_royal_gold_3d);
        ivRadioRoyalGold3d = findViewById(R.id.iv_radio_royal_gold_3d);
        tvThemeRoyalGold3dTitle = findViewById(R.id.tv_theme_royal_gold_3d_title);

        cardThemeAntiqueBronze3d = findViewById(R.id.card_theme_antique_bronze_3d);
        ivRadioAntiqueBronze3d = findViewById(R.id.iv_radio_antique_bronze_3d);
        tvThemeAntiqueBronze3dTitle = findViewById(R.id.tv_theme_antique_bronze_3d_title);

        cardThemeRoyalMarble3d = findViewById(R.id.card_theme_royal_marble_3d);
        ivRadioRoyalMarble3d = findViewById(R.id.iv_radio_royal_marble_3d);
        tvThemeRoyalMarble3dTitle = findViewById(R.id.tv_theme_royal_marble_3d_title);

        cardThemePearlWhite3d = findViewById(R.id.card_theme_pearl_white_3d);
        ivRadioPearlWhite3d = findViewById(R.id.iv_radio_pearl_white_3d);
        tvThemePearlWhite3dTitle = findViewById(R.id.tv_theme_pearl_white_3d_title);

        cardThemeGoldenTrio = findViewById(R.id.card_theme_golden_trio);
        ivRadioGoldenTrio = findViewById(R.id.iv_radio_golden_trio);
        tvThemeGoldenTrioTitle = findViewById(R.id.tv_theme_golden_trio_title);

        cardThemeVioletGreenLight = findViewById(R.id.card_theme_violet_green_light);
        ivRadioVioletGreenLight = findViewById(R.id.iv_radio_violet_green_light);
        tvThemeVioletGreenLightTitle = findViewById(R.id.tv_theme_violet_green_light_title);

        cardThemeSkyBlueLight = findViewById(R.id.card_theme_sky_blue_light);
        ivRadioSkyBlueLight = findViewById(R.id.iv_radio_sky_blue_light);
        tvThemeSkyBlueLightTitle = findViewById(R.id.tv_theme_sky_blue_light_title);

        cardThemeRosePeachLight = findViewById(R.id.card_theme_rose_peach_light);
        ivRadioRosePeachLight = findViewById(R.id.iv_radio_rose_peach_light);
        tvThemeRosePeachLightTitle = findViewById(R.id.tv_theme_rose_peach_light_title);

        cardThemeEmeraldMintLight = findViewById(R.id.card_theme_emerald_mint_light);
        ivRadioEmeraldMintLight = findViewById(R.id.iv_radio_emerald_mint_light);
        tvThemeEmeraldMintLightTitle = findViewById(R.id.tv_theme_emerald_mint_light_title);

        cardThemeEmerald3d = findViewById(R.id.card_theme_emerald_3d);
        ivRadioEmerald3d = findViewById(R.id.iv_radio_emerald_3d);
        tvThemeEmerald3dTitle = findViewById(R.id.tv_theme_emerald_3d_title);

        cardThemeCyberNeon3d = findViewById(R.id.card_theme_cyber_neon_3d);
        ivRadioCyberNeon3d = findViewById(R.id.iv_radio_cyber_neon_3d);
        tvThemeCyberNeon3dTitle = findViewById(R.id.tv_theme_cyber_neon_3d_title);

        cardThemeVioletAmethyst3d = findViewById(R.id.card_theme_violet_amethyst_3d);
        ivRadioVioletAmethyst3d = findViewById(R.id.iv_radio_violet_amethyst_3d);
        tvThemeVioletAmethyst3dTitle = findViewById(R.id.tv_theme_violet_amethyst_3d_title);

        cardThemeAzureCrystal3d = findViewById(R.id.card_theme_azure_crystal_3d);
        ivRadioAzureCrystal3d = findViewById(R.id.iv_radio_azure_crystal_3d);
        tvThemeAzureCrystal3dTitle = findViewById(R.id.tv_theme_azure_crystal_3d_title);

        cardThemeEmerald = findViewById(R.id.card_theme_emerald);
        ivRadioEmerald = findViewById(R.id.iv_radio_emerald);
        tvThemeEmeraldTitle = findViewById(R.id.tv_theme_emerald_title);

        cardThemeNavy = findViewById(R.id.card_theme_navy);
        ivRadioNavy = findViewById(R.id.iv_radio_navy);
        tvThemeNavyTitle = findViewById(R.id.tv_theme_navy_title);

        cardThemeBlack = findViewById(R.id.card_theme_black);
        ivRadioBlack = findViewById(R.id.iv_radio_black);
        tvThemeBlackTitle = findViewById(R.id.tv_theme_black_title);

        // Actions
        btnSave = findViewById(R.id.btn_save);
        btnCancel = findViewById(R.id.btn_cancel);
    }

    private void setupLanguage() {
        if (!isArabic) {
            tvMainTitle.setText("Widget Settings");
            tvTransHeader.setText("Transparency");
            tvThemeHeader.setText("Color Theme");

            btnSave.setText("Save & Apply");
            btnCancel.setText("Cancel");

            // 16 Themes (Single-word English titles)
            if (tvThemeRoyalGold3dTitle != null) tvThemeRoyalGold3dTitle.setText("Gold");
            if (tvThemeAntiqueBronze3dTitle != null) tvThemeAntiqueBronze3dTitle.setText("Bronze");
            if (tvThemeRoyalMarble3dTitle != null) tvThemeRoyalMarble3dTitle.setText("Marble");
            if (tvThemePearlWhite3dTitle != null) tvThemePearlWhite3dTitle.setText("Pearl");
            if (tvThemeGoldenTrioTitle != null) tvThemeGoldenTrioTitle.setText("Amber");
            if (tvThemeVioletGreenLightTitle != null) tvThemeVioletGreenLightTitle.setText("Lilac");
            if (tvThemeSkyBlueLightTitle != null) tvThemeSkyBlueLightTitle.setText("Sky");
            if (tvThemeRosePeachLightTitle != null) tvThemeRosePeachLightTitle.setText("Rose");
            if (tvThemeEmeraldMintLightTitle != null) tvThemeEmeraldMintLightTitle.setText("Mint");
            if (tvThemeEmerald3dTitle != null) tvThemeEmerald3dTitle.setText("Emerald");
            if (tvThemeCyberNeon3dTitle != null) tvThemeCyberNeon3dTitle.setText("Neon");
            if (tvThemeVioletAmethyst3dTitle != null) tvThemeVioletAmethyst3dTitle.setText("Violet");
            if (tvThemeAzureCrystal3dTitle != null) tvThemeAzureCrystal3dTitle.setText("Azure");
            if (tvThemeEmeraldTitle != null) tvThemeEmeraldTitle.setText("Green");
            if (tvThemeNavyTitle != null) tvThemeNavyTitle.setText("Navy");
            if (tvThemeBlackTitle != null) tvThemeBlackTitle.setText("Black");

            // Preview Texts
            if (tvPreviewNextPrayer != null) tvPreviewNextPrayer.setText("Fajr in 08:35:12");
            if (tvPreviewDate != null) tvPreviewDate.setText("Mon, 22 Jumada 1 1448");
            if (tvPreviewNight != null) tvPreviewNight.setText("First: 08:47  |  Midnight: 10:43  |  Last Third: 12:38");

            if (pNameFajr != null) pNameFajr.setText("Fajr");
            if (pNameSunrise != null) pNameSunrise.setText("Sunrise");
            if (pNameDhuhr != null) pNameDhuhr.setText("Dhuhr");
            if (pNameAsr != null) pNameAsr.setText("Asr");
            if (pNameMaghrib != null) pNameMaghrib.setText("Maghrib");
            if (pNameIsha != null) pNameIsha.setText("Isha");

            if (tvCompactPreviewDate != null) tvCompactPreviewDate.setText("Mon, 22 Jumada 1 1448");
            if (tvCompactPrevLabel != null) tvCompactPrevLabel.setText("Previous Prayer");
            if (tvCompactPrevName != null) tvCompactPrevName.setText("Dhuhr");
            if (tvCompactNextLabel != null) tvCompactNextLabel.setText("Next Prayer");
            if (tvCompactNextName != null) tvCompactNextName.setText("Asr");
            if (tvCompactPreviewCountdown != null) tvCompactPreviewCountdown.setText("Next Adhan in: 01:15:30");

        } else {
            tvMainTitle.setText("ضبط إعدادات التطبيق المصغر");
            tvTransHeader.setText("درجة الشفافية");
            tvThemeHeader.setText("لون وثيم الخلفية");

            btnSave.setText("حفظ وتطبيق");
            btnCancel.setText("إلغاء");

            // 16 Themes (Single-word Arabic titles)
            if (tvThemeRoyalGold3dTitle != null) tvThemeRoyalGold3dTitle.setText("ذهبي");
            if (tvThemeAntiqueBronze3dTitle != null) tvThemeAntiqueBronze3dTitle.setText("برونزي");
            if (tvThemeRoyalMarble3dTitle != null) tvThemeRoyalMarble3dTitle.setText("رخامي");
            if (tvThemePearlWhite3dTitle != null) tvThemePearlWhite3dTitle.setText("لؤلؤي");
            if (tvThemeGoldenTrioTitle != null) tvThemeGoldenTrioTitle.setText("عنبري");
            if (tvThemeVioletGreenLightTitle != null) tvThemeVioletGreenLightTitle.setText("ليلكي");
            if (tvThemeSkyBlueLightTitle != null) tvThemeSkyBlueLightTitle.setText("سماوي");
            if (tvThemeRosePeachLightTitle != null) tvThemeRosePeachLightTitle.setText("وردي");
            if (tvThemeEmeraldMintLightTitle != null) tvThemeEmeraldMintLightTitle.setText("نعناعي");
            if (tvThemeEmerald3dTitle != null) tvThemeEmerald3dTitle.setText("زمردي");
            if (tvThemeCyberNeon3dTitle != null) tvThemeCyberNeon3dTitle.setText("نيون");
            if (tvThemeVioletAmethyst3dTitle != null) tvThemeVioletAmethyst3dTitle.setText("بنفسجي");
            if (tvThemeAzureCrystal3dTitle != null) tvThemeAzureCrystal3dTitle.setText("لازوردي");
            if (tvThemeEmeraldTitle != null) tvThemeEmeraldTitle.setText("أخضر");
            if (tvThemeNavyTitle != null) tvThemeNavyTitle.setText("كحلي");
            if (tvThemeBlackTitle != null) tvThemeBlackTitle.setText("أسود");

            // Preview Texts
            if (tvPreviewNextPrayer != null) tvPreviewNextPrayer.setText("الفجر بعد 8:35:12");
            if (tvPreviewDate != null) tvPreviewDate.setText("الإثنين، ٢٢ جمادى الأولى ١٤٤٨ هـ");
            if (tvPreviewNight != null) tvPreviewNight.setText("أول الليل : 08:47  |  منتصف الليل : 10:43  |  الثلث الأخير : 12:38");

            if (pNameFajr != null) pNameFajr.setText("الفجر");
            if (pNameSunrise != null) pNameSunrise.setText("الشروق");
            if (pNameDhuhr != null) pNameDhuhr.setText("الظهر");
            if (pNameAsr != null) pNameAsr.setText("العصر");
            if (pNameMaghrib != null) pNameMaghrib.setText("المغرب");
            if (pNameIsha != null) pNameIsha.setText("العشاء");

            if (tvCompactPreviewDate != null) tvCompactPreviewDate.setText("الإثنين، ٢٢ جمادى الأولى ١٤٤٨ هـ");
            if (tvCompactPrevLabel != null) tvCompactPrevLabel.setText("الصلاة السابقة");
            if (tvCompactPrevName != null) tvCompactPrevName.setText("الظهر");
            if (tvCompactNextLabel != null) tvCompactNextLabel.setText("الصلاة القادمة");
            if (tvCompactNextName != null) tvCompactNextName.setText("العصر");
            if (tvCompactPreviewCountdown != null) tvCompactPreviewCountdown.setText("متبقي على الأذان: 01:15:30");

        }
    }

    private void setupPreviewVisibility() {
        if (previewClassicCard != null) previewClassicCard.setVisibility(View.GONE);
        if (previewCompactCard != null) previewCompactCard.setVisibility(View.GONE);

        if ("compact".equals(mWidgetType) && previewCompactCard != null) {
            previewCompactCard.setVisibility(View.VISIBLE);
        } else if (previewClassicCard != null) {
            previewClassicCard.setVisibility(View.VISIBLE);
        }
    }

    private void setupListeners() {
        sbTransparency.setProgress(selectedTransparency);
        updateTransparencyBadge();

        sbTransparency.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                selectedTransparency = progress;
                updateTransparencyBadge();
                updatePreview();
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {}

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {}
        });

        if (cardThemeRoyalGold3d != null) cardThemeRoyalGold3d.setOnClickListener(v -> selectTheme("royal_gold_3d"));
        if (cardThemeAntiqueBronze3d != null) cardThemeAntiqueBronze3d.setOnClickListener(v -> selectTheme("antique_bronze_3d"));
        if (cardThemeRoyalMarble3d != null) cardThemeRoyalMarble3d.setOnClickListener(v -> selectTheme("royal_marble_3d"));
        if (cardThemePearlWhite3d != null) cardThemePearlWhite3d.setOnClickListener(v -> selectTheme("pearl_white_3d"));
        if (cardThemeGoldenTrio != null) cardThemeGoldenTrio.setOnClickListener(v -> selectTheme("golden_trio"));
        if (cardThemeVioletGreenLight != null) cardThemeVioletGreenLight.setOnClickListener(v -> selectTheme("violet_green_light"));
        if (cardThemeSkyBlueLight != null) cardThemeSkyBlueLight.setOnClickListener(v -> selectTheme("sky_blue_light"));
        if (cardThemeRosePeachLight != null) cardThemeRosePeachLight.setOnClickListener(v -> selectTheme("rose_peach_light"));
        if (cardThemeEmeraldMintLight != null) cardThemeEmeraldMintLight.setOnClickListener(v -> selectTheme("emerald_mint_light"));
        if (cardThemeEmerald3d != null) cardThemeEmerald3d.setOnClickListener(v -> selectTheme("emerald_3d"));
        if (cardThemeCyberNeon3d != null) cardThemeCyberNeon3d.setOnClickListener(v -> selectTheme("cyber_neon_3d"));
        if (cardThemeVioletAmethyst3d != null) cardThemeVioletAmethyst3d.setOnClickListener(v -> selectTheme("violet_amethyst_3d"));
        if (cardThemeAzureCrystal3d != null) cardThemeAzureCrystal3d.setOnClickListener(v -> selectTheme("azure_crystal_3d"));
        if (cardThemeEmerald != null) cardThemeEmerald.setOnClickListener(v -> selectTheme("emerald"));
        if (cardThemeNavy != null) cardThemeNavy.setOnClickListener(v -> selectTheme("navy"));
        if (cardThemeBlack != null) cardThemeBlack.setOnClickListener(v -> selectTheme("black"));

        btnSave.setOnClickListener(v -> saveAndFinish());
        btnCancel.setOnClickListener(v -> finish());
    }

    private void selectTheme(String theme) {
        selectedTheme = theme;
        updatePreview();
    }

    private void updateTransparencyBadge() {
        String label = selectedTransparency + "%";
        if (selectedTransparency == 100) label += isArabic ? " معتم" : " Solid";
        else if (selectedTransparency >= 70) label += isArabic ? " متوازن" : " Balanced";
        else if (selectedTransparency >= 40) label += isArabic ? " زجاجي" : " Glass";
        else label += isArabic ? " شفاف" : " Clear";

        if (tvTransparencyVal != null) {
            tvTransparencyVal.setText(label);
        }
    }

    private void updatePreview() {
        // Highlight active theme card and radio indicator
        int selectedBg = R.drawable.theme_card_bg_selected;
        int normalBg = R.drawable.theme_card_bg;
        int checkedIcon = R.drawable.ic_radio_checked;
        int uncheckedIcon = R.drawable.ic_radio_unchecked;

        boolean isRoyalGold3d = "royal_gold_3d".equalsIgnoreCase(selectedTheme);
        boolean isEmeraldPrism3d = "emerald_prism_3d".equalsIgnoreCase(selectedTheme);
        boolean isRubyGem3d = "ruby_gem_3d".equalsIgnoreCase(selectedTheme);
        boolean isAntiqueBronze3d = "antique_bronze_3d".equalsIgnoreCase(selectedTheme);
        boolean isRoyalMarble3d = "royal_marble_3d".equalsIgnoreCase(selectedTheme);
        boolean isTitanium3d = "titanium_3d".equalsIgnoreCase(selectedTheme);
        boolean isEmerald3d = "emerald_3d".equalsIgnoreCase(selectedTheme);
        boolean isSapphire3d = "sapphire_3d".equalsIgnoreCase(selectedTheme);
        boolean isGoldIngot3d = "gold_ingot_3d".equalsIgnoreCase(selectedTheme);
        boolean isRubyVelvet3d = "ruby_velvet_3d".equalsIgnoreCase(selectedTheme);
        boolean isCyberNeon3d = "cyber_neon_3d".equalsIgnoreCase(selectedTheme);
        boolean isVioletAmethyst3d = "violet_amethyst_3d".equalsIgnoreCase(selectedTheme);
        boolean isCopperBronze3d = "copper_bronze_3d".equalsIgnoreCase(selectedTheme);
        boolean isAzureCrystal3d = "azure_crystal_3d".equalsIgnoreCase(selectedTheme);
        boolean isDesertAmber3d = "desert_amber_3d".equalsIgnoreCase(selectedTheme);
        boolean isMintFrost3d = "mint_frost_3d".equalsIgnoreCase(selectedTheme);
        boolean isPearlWhite3d = "pearl_white_3d".equalsIgnoreCase(selectedTheme);
        boolean isGoldenTrio = "golden_trio".equalsIgnoreCase(selectedTheme);
        boolean isVioletGreenLight = "violet_green_light".equalsIgnoreCase(selectedTheme);
        boolean isSkyBlueLight = "sky_blue_light".equalsIgnoreCase(selectedTheme);
        boolean isRosePeachLight = "rose_peach_light".equalsIgnoreCase(selectedTheme);
        boolean isEmeraldMintLight = "emerald_mint_light".equalsIgnoreCase(selectedTheme);
        boolean isEmerald = "emerald".equalsIgnoreCase(selectedTheme);
        boolean isNavy = "navy".equalsIgnoreCase(selectedTheme) || "dark".equalsIgnoreCase(selectedTheme);
        boolean isBlack = "black".equalsIgnoreCase(selectedTheme);
        boolean isGold = "gold".equalsIgnoreCase(selectedTheme);
        boolean isSky = "sky".equalsIgnoreCase(selectedTheme);

        if (cardThemeRoyalGold3d != null) {
            cardThemeRoyalGold3d.setBackgroundResource(isRoyalGold3d ? selectedBg : normalBg);
            ivRadioRoyalGold3d.setImageResource(isRoyalGold3d ? checkedIcon : uncheckedIcon);
        }
        if (cardThemeAntiqueBronze3d != null) {
            cardThemeAntiqueBronze3d.setBackgroundResource(isAntiqueBronze3d ? selectedBg : normalBg);
            ivRadioAntiqueBronze3d.setImageResource(isAntiqueBronze3d ? checkedIcon : uncheckedIcon);
        }
        if (cardThemeRoyalMarble3d != null) {
            cardThemeRoyalMarble3d.setBackgroundResource(isRoyalMarble3d ? selectedBg : normalBg);
            ivRadioRoyalMarble3d.setImageResource(isRoyalMarble3d ? checkedIcon : uncheckedIcon);
        }
        if (cardThemePearlWhite3d != null) {
            cardThemePearlWhite3d.setBackgroundResource(isPearlWhite3d ? selectedBg : normalBg);
            ivRadioPearlWhite3d.setImageResource(isPearlWhite3d ? checkedIcon : uncheckedIcon);
        }
        if (cardThemeGoldenTrio != null) {
            cardThemeGoldenTrio.setBackgroundResource(isGoldenTrio ? selectedBg : normalBg);
            ivRadioGoldenTrio.setImageResource(isGoldenTrio ? checkedIcon : uncheckedIcon);
        }
        if (cardThemeVioletGreenLight != null) {
            cardThemeVioletGreenLight.setBackgroundResource(isVioletGreenLight ? selectedBg : normalBg);
            ivRadioVioletGreenLight.setImageResource(isVioletGreenLight ? checkedIcon : uncheckedIcon);
        }
        if (cardThemeSkyBlueLight != null) {
            cardThemeSkyBlueLight.setBackgroundResource(isSkyBlueLight ? selectedBg : normalBg);
            ivRadioSkyBlueLight.setImageResource(isSkyBlueLight ? checkedIcon : uncheckedIcon);
        }
        if (cardThemeRosePeachLight != null) {
            cardThemeRosePeachLight.setBackgroundResource(isRosePeachLight ? selectedBg : normalBg);
            ivRadioRosePeachLight.setImageResource(isRosePeachLight ? checkedIcon : uncheckedIcon);
        }
        if (cardThemeEmeraldMintLight != null) {
            cardThemeEmeraldMintLight.setBackgroundResource(isEmeraldMintLight ? selectedBg : normalBg);
            ivRadioEmeraldMintLight.setImageResource(isEmeraldMintLight ? checkedIcon : uncheckedIcon);
        }
        if (cardThemeEmerald3d != null) {
            cardThemeEmerald3d.setBackgroundResource(isEmerald3d ? selectedBg : normalBg);
            ivRadioEmerald3d.setImageResource(isEmerald3d ? checkedIcon : uncheckedIcon);
        }
        if (cardThemeCyberNeon3d != null) {
            cardThemeCyberNeon3d.setBackgroundResource(isCyberNeon3d ? selectedBg : normalBg);
            ivRadioCyberNeon3d.setImageResource(isCyberNeon3d ? checkedIcon : uncheckedIcon);
        }
        if (cardThemeVioletAmethyst3d != null) {
            cardThemeVioletAmethyst3d.setBackgroundResource(isVioletAmethyst3d ? selectedBg : normalBg);
            ivRadioVioletAmethyst3d.setImageResource(isVioletAmethyst3d ? checkedIcon : uncheckedIcon);
        }
        if (cardThemeAzureCrystal3d != null) {
            cardThemeAzureCrystal3d.setBackgroundResource(isAzureCrystal3d ? selectedBg : normalBg);
            ivRadioAzureCrystal3d.setImageResource(isAzureCrystal3d ? checkedIcon : uncheckedIcon);
        }
        if (cardThemeEmerald != null) {
            cardThemeEmerald.setBackgroundResource(isEmerald ? selectedBg : normalBg);
            ivRadioEmerald.setImageResource(isEmerald ? checkedIcon : uncheckedIcon);
        }
        if (cardThemeNavy != null) {
            cardThemeNavy.setBackgroundResource(isNavy ? selectedBg : normalBg);
            ivRadioNavy.setImageResource(isNavy ? checkedIcon : uncheckedIcon);
        }
        if (cardThemeBlack != null) {
            cardThemeBlack.setBackgroundResource(isBlack ? selectedBg : normalBg);
            ivRadioBlack.setImageResource(isBlack ? checkedIcon : uncheckedIcon);
        }

        int alpha = Math.round((selectedTransparency / 100.0f) * 255);

        // Bold, Powerful Multi-Color Palettes that completely transform widget appearance
        int rootBg, topBoxBg, dateBoxBg, dateText, nextPrayerColor, countdownColor;
        int strip1, strip2, strip3, strip4;
        int gridBg, gridNameColor, gridTimeColor, gridHighlightColor, sepColor;
        int nightBg, nightText;

        if (isRoyalGold3d) {
            // 1. NEW: 3D Royal Gold (ذهب ملكي مجسم)
            rootBg = Color.parseColor("#2D1600");
            topBoxBg = Color.parseColor("#5E2E00");
            dateBoxBg = Color.parseColor("#5E2E00");
            dateText = Color.parseColor("#FDE68A");
            nextPrayerColor = Color.parseColor("#FBBF24");
            countdownColor = Color.parseColor("#FFFFFF");
            strip1 = Color.parseColor("#F59E0B");
            strip2 = Color.parseColor("#D97706");
            strip3 = Color.parseColor("#FBBF24");
            strip4 = Color.parseColor("#B45309");
            gridBg = Color.parseColor("#1C0D00");
            gridNameColor = Color.parseColor("#FDE68A");
            gridTimeColor = Color.parseColor("#FFFFFF");
            gridHighlightColor = Color.parseColor("#F59E0B");
            sepColor = Color.parseColor("#78350F");
            nightBg = Color.parseColor("#451A03");
            nightText = Color.parseColor("#FEF08A");

        } else if (isEmeraldPrism3d) {
            // 2. NEW: 3D Emerald Prism (زمرد نافذ مجسم)
            rootBg = Color.parseColor("#022C22");
            topBoxBg = Color.parseColor("#064E3B");
            dateBoxBg = Color.parseColor("#064E3B");
            dateText = Color.parseColor("#6EE7B7");
            nextPrayerColor = Color.parseColor("#34D399");
            countdownColor = Color.parseColor("#FFFFFF");
            strip1 = Color.parseColor("#10B981");
            strip2 = Color.parseColor("#059669");
            strip3 = Color.parseColor("#34D399");
            strip4 = Color.parseColor("#047857");
            gridBg = Color.parseColor("#011712");
            gridNameColor = Color.parseColor("#A7F3D0");
            gridTimeColor = Color.parseColor("#FFFFFF");
            gridHighlightColor = Color.parseColor("#34D399");
            sepColor = Color.parseColor("#065F46");
            nightBg = Color.parseColor("#064E3B");
            nightText = Color.parseColor("#A7F3D0");

        } else if (isRubyGem3d) {
            // 3. NEW: 3D Ruby Gem (ياقوت ملكي مجسم)
            rootBg = Color.parseColor("#4C0519");
            topBoxBg = Color.parseColor("#881337");
            dateBoxBg = Color.parseColor("#881337");
            dateText = Color.parseColor("#FECDD3");
            nextPrayerColor = Color.parseColor("#FB7185");
            countdownColor = Color.parseColor("#FFFFFF");
            strip1 = Color.parseColor("#F43F5E");
            strip2 = Color.parseColor("#E11D48");
            strip3 = Color.parseColor("#FDA4AF");
            strip4 = Color.parseColor("#BE123C");
            gridBg = Color.parseColor("#2B000C");
            gridNameColor = Color.parseColor("#FECDD3");
            gridTimeColor = Color.parseColor("#FFFFFF");
            gridHighlightColor = Color.parseColor("#FB7185");
            sepColor = Color.parseColor("#9F1239");
            nightBg = Color.parseColor("#70092B");
            nightText = Color.parseColor("#FFE4E6");

        } else if (isAntiqueBronze3d) {
            // 4. NEW: 3D Antique Bronze (برونز عتيق مجسم)
            rootBg = Color.parseColor("#261A12");
            topBoxBg = Color.parseColor("#4D3321");
            dateBoxBg = Color.parseColor("#4D3321");
            dateText = Color.parseColor("#E5C39E");
            nextPrayerColor = Color.parseColor("#D4AF37");
            countdownColor = Color.parseColor("#FFFFFF");
            strip1 = Color.parseColor("#D4AF37");
            strip2 = Color.parseColor("#8C531B");
            strip3 = Color.parseColor("#B8860B");
            strip4 = Color.parseColor("#6E3F15");
            gridBg = Color.parseColor("#180F0A");
            gridNameColor = Color.parseColor("#D4BFA6");
            gridTimeColor = Color.parseColor("#FFFFFF");
            gridHighlightColor = Color.parseColor("#F5D77F");
            sepColor = Color.parseColor("#5C3D26");
            nightBg = Color.parseColor("#3D2718");
            nightText = Color.parseColor("#F5D77F");

        } else if (isRoyalMarble3d) {
            // 5. NEW: 3D Royal Marble (رخام ملكي مجسم)
            rootBg = Color.parseColor("#F8FAFC");
            topBoxBg = Color.parseColor("#FEF3C7");
            dateBoxBg = Color.parseColor("#FEF3C7");
            dateText = Color.parseColor("#78350F");
            nextPrayerColor = Color.parseColor("#B45309");
            countdownColor = Color.parseColor("#78350F");
            strip1 = Color.parseColor("#D97706");
            strip2 = Color.parseColor("#F59E0B");
            strip3 = Color.parseColor("#B45309");
            strip4 = Color.parseColor("#D4AF37");
            gridBg = Color.parseColor("#FFFFFF");
            gridNameColor = Color.parseColor("#475569");
            gridTimeColor = Color.parseColor("#0F172A");
            gridHighlightColor = Color.parseColor("#B45309");
            sepColor = Color.parseColor("#E2E8F0");
            nightBg = Color.parseColor("#FEF3C7");
            nightText = Color.parseColor("#78350F");

        } else if (isTitanium3d) {
            // 3D Titanium Carbon
            rootBg = Color.parseColor("#0F172A");
            topBoxBg = Color.parseColor("#1E293B");
            dateBoxBg = Color.parseColor("#1E293B");
            dateText = Color.parseColor("#94A3B8");
            nextPrayerColor = Color.parseColor("#38BDF8");
            countdownColor = Color.parseColor("#FFFFFF");
            strip1 = Color.parseColor("#38BDF8");
            strip2 = Color.parseColor("#0284C7");
            strip3 = Color.parseColor("#64748B");
            strip4 = Color.parseColor("#94A3B8");
            gridBg = Color.parseColor("#0B1120");
            gridNameColor = Color.parseColor("#94A3B8");
            gridTimeColor = Color.parseColor("#FFFFFF");
            gridHighlightColor = Color.parseColor("#38BDF8");
            sepColor = Color.parseColor("#334155");
            nightBg = Color.parseColor("#1E293B");
            nightText = Color.parseColor("#38BDF8");

        } else if (isEmerald3d) {
            // 3D Royal Emerald
            rootBg = Color.parseColor("#022C22");
            topBoxBg = Color.parseColor("#064E3B");
            dateBoxBg = Color.parseColor("#064E3B");
            dateText = Color.parseColor("#6EE7B7");
            nextPrayerColor = Color.parseColor("#34D399");
            countdownColor = Color.parseColor("#FFFFFF");
            strip1 = Color.parseColor("#10B981");
            strip2 = Color.parseColor("#059669");
            strip3 = Color.parseColor("#F59E0B");
            strip4 = Color.parseColor("#34D399");
            gridBg = Color.parseColor("#011C15");
            gridNameColor = Color.parseColor("#A7F3D0");
            gridTimeColor = Color.parseColor("#FFFFFF");
            gridHighlightColor = Color.parseColor("#34D399");
            sepColor = Color.parseColor("#064E3B");
            nightBg = Color.parseColor("#064E3B");
            nightText = Color.parseColor("#FDE68A");

        } else if (isSapphire3d) {
            // 3D Sapphire Gem
            rootBg = Color.parseColor("#0B192C");
            topBoxBg = Color.parseColor("#1E3E62");
            dateBoxBg = Color.parseColor("#1E3E62");
            dateText = Color.parseColor("#60A5FA");
            nextPrayerColor = Color.parseColor("#38BDF8");
            countdownColor = Color.parseColor("#FFFFFF");
            strip1 = Color.parseColor("#2563EB");
            strip2 = Color.parseColor("#38BDF8");
            strip3 = Color.parseColor("#60A5FA");
            strip4 = Color.parseColor("#1D4ED8");
            gridBg = Color.parseColor("#071220");
            gridNameColor = Color.parseColor("#93C5FD");
            gridTimeColor = Color.parseColor("#FFFFFF");
            gridHighlightColor = Color.parseColor("#38BDF8");
            sepColor = Color.parseColor("#1E3E62");
            nightBg = Color.parseColor("#1E3E62");
            nightText = Color.parseColor("#93C5FD");

        } else if (isGoldIngot3d) {
            // 3D Pure Gold Ingot
            rootBg = Color.parseColor("#2A1800");
            topBoxBg = Color.parseColor("#452600");
            dateBoxBg = Color.parseColor("#452600");
            dateText = Color.parseColor("#FDE68A");
            nextPrayerColor = Color.parseColor("#FBBF24");
            countdownColor = Color.parseColor("#FFFFFF");
            strip1 = Color.parseColor("#F59E0B");
            strip2 = Color.parseColor("#D97706");
            strip3 = Color.parseColor("#FBBF24");
            strip4 = Color.parseColor("#B45309");
            gridBg = Color.parseColor("#1A0E00");
            gridNameColor = Color.parseColor("#FDE68A");
            gridTimeColor = Color.parseColor("#FFFFFF");
            gridHighlightColor = Color.parseColor("#FDE047");
            sepColor = Color.parseColor("#5A3200");
            nightBg = Color.parseColor("#452600");
            nightText = Color.parseColor("#FDE68A");

        } else if (isRubyVelvet3d) {
            // 3D Royal Ruby
            rootBg = Color.parseColor("#2A080C");
            topBoxBg = Color.parseColor("#4C0519");
            dateBoxBg = Color.parseColor("#4C0519");
            dateText = Color.parseColor("#FDA4AF");
            nextPrayerColor = Color.parseColor("#FB7185");
            countdownColor = Color.parseColor("#FFFFFF");
            strip1 = Color.parseColor("#E11D48");
            strip2 = Color.parseColor("#BE123C");
            strip3 = Color.parseColor("#F43F5E");
            strip4 = Color.parseColor("#9F1239");
            gridBg = Color.parseColor("#180306");
            gridNameColor = Color.parseColor("#FECDD3");
            gridTimeColor = Color.parseColor("#FFFFFF");
            gridHighlightColor = Color.parseColor("#FDA4AF");
            sepColor = Color.parseColor("#4C0519");
            nightBg = Color.parseColor("#4C0519");
            nightText = Color.parseColor("#FECDD3");

        } else if (isCyberNeon3d) {
            // 3D Cyber Neon
            rootBg = Color.parseColor("#050814");
            topBoxBg = Color.parseColor("#0F172A");
            dateBoxBg = Color.parseColor("#0F172A");
            dateText = Color.parseColor("#00F5D4");
            nextPrayerColor = Color.parseColor("#00F5D4");
            countdownColor = Color.parseColor("#FFFFFF");
            strip1 = Color.parseColor("#00F5D4");
            strip2 = Color.parseColor("#7B2CBF");
            strip3 = Color.parseColor("#00BBF9");
            strip4 = Color.parseColor("#F15BB5");
            gridBg = Color.parseColor("#02030A");
            gridNameColor = Color.parseColor("#94A3B8");
            gridTimeColor = Color.parseColor("#FFFFFF");
            gridHighlightColor = Color.parseColor("#00F5D4");
            sepColor = Color.parseColor("#1E293B");
            nightBg = Color.parseColor("#0F172A");
            nightText = Color.parseColor("#00F5D4");

        } else if (isVioletAmethyst3d) {
            // 3D Royal Amethyst
            rootBg = Color.parseColor("#1E112A");
            topBoxBg = Color.parseColor("#3B1D54");
            dateBoxBg = Color.parseColor("#3B1D54");
            dateText = Color.parseColor("#E9D5FF");
            nextPrayerColor = Color.parseColor("#C084FC");
            countdownColor = Color.parseColor("#FFFFFF");
            strip1 = Color.parseColor("#A855F7");
            strip2 = Color.parseColor("#9333EA");
            strip3 = Color.parseColor("#C084FC");
            strip4 = Color.parseColor("#7E22CE");
            gridBg = Color.parseColor("#130A1C");
            gridNameColor = Color.parseColor("#DDD6FE");
            gridTimeColor = Color.parseColor("#FFFFFF");
            gridHighlightColor = Color.parseColor("#E9D5FF");
            sepColor = Color.parseColor("#4C1D95");
            nightBg = Color.parseColor("#3B1D54");
            nightText = Color.parseColor("#E9D5FF");

        } else if (isCopperBronze3d) {
            // 3D Antique Copper
            rootBg = Color.parseColor("#26140D");
            topBoxBg = Color.parseColor("#452317");
            dateBoxBg = Color.parseColor("#452317");
            dateText = Color.parseColor("#FED7AA");
            nextPrayerColor = Color.parseColor("#FB923C");
            countdownColor = Color.parseColor("#FFFFFF");
            strip1 = Color.parseColor("#EA580C");
            strip2 = Color.parseColor("#C2410C");
            strip3 = Color.parseColor("#F97316");
            strip4 = Color.parseColor("#9A3412");
            gridBg = Color.parseColor("#170B06");
            gridNameColor = Color.parseColor("#FFEDD5");
            gridTimeColor = Color.parseColor("#FFFFFF");
            gridHighlightColor = Color.parseColor("#FED7AA");
            sepColor = Color.parseColor("#5A2D1F");
            nightBg = Color.parseColor("#452317");
            nightText = Color.parseColor("#FED7AA");

        } else if (isAzureCrystal3d) {
            // 3D Azure Crystal
            rootBg = Color.parseColor("#0A1F33");
            topBoxBg = Color.parseColor("#113254");
            dateBoxBg = Color.parseColor("#113254");
            dateText = Color.parseColor("#BAE6FD");
            nextPrayerColor = Color.parseColor("#38BDF8");
            countdownColor = Color.parseColor("#FFFFFF");
            strip1 = Color.parseColor("#0284C7");
            strip2 = Color.parseColor("#0369A1");
            strip3 = Color.parseColor("#38BDF8");
            strip4 = Color.parseColor("#075985");
            gridBg = Color.parseColor("#061421");
            gridNameColor = Color.parseColor("#E0F2FE");
            gridTimeColor = Color.parseColor("#FFFFFF");
            gridHighlightColor = Color.parseColor("#7DD3FC");
            sepColor = Color.parseColor("#164E63");
            nightBg = Color.parseColor("#113254");
            nightText = Color.parseColor("#BAE6FD");

        } else if (isDesertAmber3d) {
            // 3D Desert Amber
            rootBg = Color.parseColor("#2E1C0C");
            topBoxBg = Color.parseColor("#4D2E14");
            dateBoxBg = Color.parseColor("#4D2E14");
            dateText = Color.parseColor("#FEF08A");
            nextPrayerColor = Color.parseColor("#FACC15");
            countdownColor = Color.parseColor("#FFFFFF");
            strip1 = Color.parseColor("#CA8A04");
            strip2 = Color.parseColor("#A16207");
            strip3 = Color.parseColor("#EAB308");
            strip4 = Color.parseColor("#854D0E");
            gridBg = Color.parseColor("#1C1006");
            gridNameColor = Color.parseColor("#FEF9C3");
            gridTimeColor = Color.parseColor("#FFFFFF");
            gridHighlightColor = Color.parseColor("#FEF08A");
            sepColor = Color.parseColor("#5F3717");
            nightBg = Color.parseColor("#4D2E14");
            nightText = Color.parseColor("#FEF08A");

        } else if (isMintFrost3d) {
            // 3D Mint Frost
            rootBg = Color.parseColor("#062421");
            topBoxBg = Color.parseColor("#0C3D38");
            dateBoxBg = Color.parseColor("#0C3D38");
            dateText = Color.parseColor("#CCFBF1");
            nextPrayerColor = Color.parseColor("#2DD4BF");
            countdownColor = Color.parseColor("#FFFFFF");
            strip1 = Color.parseColor("#0D9488");
            strip2 = Color.parseColor("#0F766E");
            strip3 = Color.parseColor("#2DD4BF");
            strip4 = Color.parseColor("#115E59");
            gridBg = Color.parseColor("#031715");
            gridNameColor = Color.parseColor("#E6FFFA");
            gridTimeColor = Color.parseColor("#FFFFFF");
            gridHighlightColor = Color.parseColor("#5EEAD4");
            sepColor = Color.parseColor("#134E48");
            nightBg = Color.parseColor("#0C3D38");
            nightText = Color.parseColor("#CCFBF1");

        } else if (isPearlWhite3d) {
            // Lustrous Pearl (Clean Light, Black/Dark Slate Text)
            rootBg = Color.parseColor("#F1F5F9");
            topBoxBg = Color.parseColor("#E2E8F0");
            dateBoxBg = Color.parseColor("#E2E8F0");
            dateText = Color.parseColor("#0F172A");
            nextPrayerColor = Color.parseColor("#0284C7");
            countdownColor = Color.parseColor("#0F172A");
            strip1 = Color.parseColor("#0284C7");
            strip2 = Color.parseColor("#D97706");
            strip3 = Color.parseColor("#059669");
            strip4 = Color.parseColor("#7C3AED");
            gridBg = Color.parseColor("#FFFFFF");
            gridNameColor = Color.parseColor("#475569");
            gridTimeColor = Color.parseColor("#000000");
            gridHighlightColor = Color.parseColor("#0284C7");
            sepColor = Color.parseColor("#CBD5E1");
            nightBg = Color.parseColor("#E2E8F0");
            nightText = Color.parseColor("#000000");

        } else if (isGoldenTrio) {
            // Trio Gold: Soft Gold Cream (#F8DE8A), Burnt Gold Amber (#C86400), Pure White (#FFFFFF)
            // ALL TEXTS STRICTLY DEEP BLACK (#000000)
            rootBg = Color.parseColor("#F8DE8A");
            topBoxBg = Color.parseColor("#C86400");
            dateBoxBg = Color.parseColor("#C86400");
            dateText = Color.parseColor("#FFFFFF");
            nextPrayerColor = Color.parseColor("#FFFFFF");
            countdownColor = Color.parseColor("#FFFFFF");
            strip1 = Color.parseColor("#C86400");
            strip2 = Color.parseColor("#F8DE8A");
            strip3 = Color.parseColor("#D97706");
            strip4 = Color.parseColor("#B45309");
            gridBg = Color.parseColor("#FFFFFF");
            gridNameColor = Color.parseColor("#334155");
            gridTimeColor = Color.parseColor("#000000");
            gridHighlightColor = Color.parseColor("#C86400");
            sepColor = Color.parseColor("#F1F5F9");
            nightBg = Color.parseColor("#F8DE8A");
            nightText = Color.parseColor("#000000");

        } else if (isVioletGreenLight) {
            // Lilac & Mint Light (Pastel Violet + Mint Green + White, Black Text)
            rootBg = Color.parseColor("#F3E8FF");
            topBoxBg = Color.parseColor("#D1FAE5");
            dateBoxBg = Color.parseColor("#D1FAE5");
            dateText = Color.parseColor("#065F46");
            nextPrayerColor = Color.parseColor("#065F46");
            countdownColor = Color.parseColor("#065F46");
            strip1 = Color.parseColor("#7C3AED");
            strip2 = Color.parseColor("#10B981");
            strip3 = Color.parseColor("#A855F7");
            strip4 = Color.parseColor("#059669");
            gridBg = Color.parseColor("#FFFFFF");
            gridNameColor = Color.parseColor("#4B5563");
            gridTimeColor = Color.parseColor("#000000");
            gridHighlightColor = Color.parseColor("#7C3AED");
            sepColor = Color.parseColor("#EDE9FE");
            nightBg = Color.parseColor("#EDE9FE");
            nightText = Color.parseColor("#1E1B4B");

        } else if (isSkyBlueLight) {
            // Sky & White Light (Ice Sky Blue + White, Black Text)
            rootBg = Color.parseColor("#E0F2FE");
            topBoxBg = Color.parseColor("#BAE6FD");
            dateBoxBg = Color.parseColor("#BAE6FD");
            dateText = Color.parseColor("#0369A1");
            nextPrayerColor = Color.parseColor("#0284C7");
            countdownColor = Color.parseColor("#075985");
            strip1 = Color.parseColor("#0284C7");
            strip2 = Color.parseColor("#38BDF8");
            strip3 = Color.parseColor("#0EA5E9");
            strip4 = Color.parseColor("#0369A1");
            gridBg = Color.parseColor("#FFFFFF");
            gridNameColor = Color.parseColor("#475569");
            gridTimeColor = Color.parseColor("#000000");
            gridHighlightColor = Color.parseColor("#0284C7");
            sepColor = Color.parseColor("#E2E8F0");
            nightBg = Color.parseColor("#F0F9FF");
            nightText = Color.parseColor("#0F172A");

        } else if (isRosePeachLight) {
            // Peach & Rose Light (Pastel Peach + White, Black Text)
            rootBg = Color.parseColor("#FFF1F2");
            topBoxBg = Color.parseColor("#FFE4E6");
            dateBoxBg = Color.parseColor("#FFE4E6");
            dateText = Color.parseColor("#9F1239");
            nextPrayerColor = Color.parseColor("#BE123C");
            countdownColor = Color.parseColor("#881337");
            strip1 = Color.parseColor("#E11D48");
            strip2 = Color.parseColor("#FB7185");
            strip3 = Color.parseColor("#F43F5E");
            strip4 = Color.parseColor("#BE123C");
            gridBg = Color.parseColor("#FFFFFF");
            gridNameColor = Color.parseColor("#4C0519");
            gridTimeColor = Color.parseColor("#000000");
            gridHighlightColor = Color.parseColor("#E11D48");
            sepColor = Color.parseColor("#FFE4E6");
            nightBg = Color.parseColor("#FFFBEB");
            nightText = Color.parseColor("#1F080C");

        } else if (isEmeraldMintLight) {
            // Mint & Sage Light (Soft Sage Mint + White, Black Text)
            rootBg = Color.parseColor("#ECFDF5");
            topBoxBg = Color.parseColor("#D1FAE5");
            dateBoxBg = Color.parseColor("#D1FAE5");
            dateText = Color.parseColor("#065F46");
            nextPrayerColor = Color.parseColor("#047857");
            countdownColor = Color.parseColor("#064E3B");
            strip1 = Color.parseColor("#059669");
            strip2 = Color.parseColor("#34D399");
            strip3 = Color.parseColor("#10B981");
            strip4 = Color.parseColor("#047857");
            gridBg = Color.parseColor("#FFFFFF");
            gridNameColor = Color.parseColor("#374151");
            gridTimeColor = Color.parseColor("#000000");
            gridHighlightColor = Color.parseColor("#059669");
            sepColor = Color.parseColor("#D1FAE5");
            nightBg = Color.parseColor("#F0FDFA");
            nightText = Color.parseColor("#022C22");

        } else if (isNavy) {
            // Royal Navy: Deep sapphire navy background with bright cyan & gold highlights
            rootBg = Color.parseColor("#0F172A");
            topBoxBg = Color.parseColor("#1E293B");
            dateBoxBg = Color.parseColor("#1E293B");
            dateText = Color.parseColor("#38BDF8");
            nextPrayerColor = Color.parseColor("#38BDF8");
            countdownColor = Color.parseColor("#FFFFFF");

            strip1 = Color.parseColor("#F59E0B");
            strip2 = Color.parseColor("#0284C7");
            strip3 = Color.parseColor("#38BDF8");
            strip4 = Color.parseColor("#D97706");

            gridBg = Color.parseColor("#0F172A");
            gridNameColor = Color.parseColor("#94A3B8");
            gridTimeColor = Color.parseColor("#FFFFFF");
            gridHighlightColor = Color.parseColor("#38BDF8");
            sepColor = Color.parseColor("#334155");

            nightBg = Color.parseColor("#1E293B");
            nightText = Color.parseColor("#7DD3FC");

        } else if (isBlack) {
            // Obsidian Black: Pure black OLED with brilliant gold accents
            rootBg = Color.parseColor("#000000");
            topBoxBg = Color.parseColor("#121212");
            dateBoxBg = Color.parseColor("#121212");
            dateText = Color.parseColor("#F59E0B");
            nextPrayerColor = Color.parseColor("#FBBF24");
            countdownColor = Color.parseColor("#FFFFFF");

            strip1 = Color.parseColor("#F59E0B");
            strip2 = Color.parseColor("#D97706");
            strip3 = Color.parseColor("#B45309");
            strip4 = Color.parseColor("#FDE047");

            gridBg = Color.parseColor("#000000");
            gridNameColor = Color.parseColor("#A1A1AA");
            gridTimeColor = Color.parseColor("#FFFFFF");
            gridHighlightColor = Color.parseColor("#FBBF24");
            sepColor = Color.parseColor("#27272A");

            nightBg = Color.parseColor("#18181B");
            nightText = Color.parseColor("#FDE68A");

        } else if (isEmerald) {
            // Islamic Emerald: Rich deep imperial forest green with mint & gold accents
            rootBg = Color.parseColor("#064E3B");
            topBoxBg = Color.parseColor("#065F46");
            dateBoxBg = Color.parseColor("#065F46");
            dateText = Color.parseColor("#A7F3D0");
            nextPrayerColor = Color.parseColor("#6EE7B7");
            countdownColor = Color.parseColor("#FFFFFF");

            strip1 = Color.parseColor("#059669");
            strip2 = Color.parseColor("#F59E0B");
            strip3 = Color.parseColor("#34D399");
            strip4 = Color.parseColor("#D97706");

            gridBg = Color.parseColor("#043628");
            gridNameColor = Color.parseColor("#A7F3D0");
            gridTimeColor = Color.parseColor("#FFFFFF");
            gridHighlightColor = Color.parseColor("#34D399");
            sepColor = Color.parseColor("#065F46");

            nightBg = Color.parseColor("#022C22");
            nightText = Color.parseColor("#FEF08A");

        } else if (isGold) {
            // Andalusian Gold: Warm rich bronze & ochre with golden amber accents
            rootBg = Color.parseColor("#451A03");
            topBoxBg = Color.parseColor("#78350F");
            dateBoxBg = Color.parseColor("#78350F");
            dateText = Color.parseColor("#FBBF24");
            nextPrayerColor = Color.parseColor("#FDE68A");
            countdownColor = Color.parseColor("#FFFFFF");

            strip1 = Color.parseColor("#F59E0B");
            strip2 = Color.parseColor("#B45309");
            strip3 = Color.parseColor("#D97706");
            strip4 = Color.parseColor("#FDE68A");

            gridBg = Color.parseColor("#291002");
            gridNameColor = Color.parseColor("#FDE68A");
            gridTimeColor = Color.parseColor("#FFFFFF");
            gridHighlightColor = Color.parseColor("#FBBF24");
            sepColor = Color.parseColor("#78350F");

            nightBg = Color.parseColor("#78350F");
            nightText = Color.parseColor("#FDE68A");

        } else if (isSky) {
            // Ocean Cyan: Deep oceanic blue with bright sky cyan highlights
            rootBg = Color.parseColor("#0C4A6E");
            topBoxBg = Color.parseColor("#075985");
            dateBoxBg = Color.parseColor("#075985");
            dateText = Color.parseColor("#7DD3FC");
            nextPrayerColor = Color.parseColor("#E0F2FE");
            countdownColor = Color.parseColor("#FFFFFF");

            strip1 = Color.parseColor("#06B6D4");
            strip2 = Color.parseColor("#0284C7");
            strip3 = Color.parseColor("#6366F1");
            strip4 = Color.parseColor("#14B8A6");

            gridBg = Color.parseColor("#082F49");
            gridNameColor = Color.parseColor("#BAE6FD");
            gridTimeColor = Color.parseColor("#FFFFFF");
            gridHighlightColor = Color.parseColor("#38BDF8");
            sepColor = Color.parseColor("#075985");

            nightBg = Color.parseColor("#075985");
            nightText = Color.parseColor("#BAE6FD");

        } else {
            // Default Vibrant Theme: Deep obsidian emerald with luminous mint, radiant gold and crisp white text
            rootBg = Color.parseColor("#0F1714");
            topBoxBg = Color.parseColor("#064E3B");
            dateBoxBg = Color.parseColor("#064E3B");
            dateText = Color.parseColor("#6EE7B7");
            nextPrayerColor = Color.parseColor("#6EE7B7");
            countdownColor = Color.parseColor("#FFFFFF");

            strip1 = Color.parseColor("#059669");
            strip2 = Color.parseColor("#F59E0B");
            strip3 = Color.parseColor("#34D399");
            strip4 = Color.parseColor("#D97706");

            gridBg = Color.parseColor("#0A110E");
            gridNameColor = Color.parseColor("#CBD5E1");
            gridTimeColor = Color.parseColor("#FFFFFF");
            gridHighlightColor = Color.parseColor("#FBBF24");
            sepColor = Color.parseColor("#1B2E24");

            nightBg = Color.parseColor("#042F24");
            nightText = Color.parseColor("#FDE68A");
        }

        // Apply Transparency Alpha
        int alphaRootBg = Color.argb(alpha, Color.red(rootBg), Color.green(rootBg), Color.blue(rootBg));
        int alphaTopBoxBg = Color.argb(alpha, Color.red(topBoxBg), Color.green(topBoxBg), Color.blue(topBoxBg));
        int alphaDateBoxBg = Color.argb(alpha, Color.red(dateBoxBg), Color.green(dateBoxBg), Color.blue(dateBoxBg));
        int alphaGridBg = Color.argb(alpha, Color.red(gridBg), Color.green(gridBg), Color.blue(gridBg));
        int alphaNightBg = Color.argb(alpha, Color.red(nightBg), Color.green(nightBg), Color.blue(nightBg));

        // 1. Classic Preview Updates
        if (previewClassicCard != null) {
            previewClassicCard.setBackgroundColor(alphaRootBg);
        }
        if (previewTopRightBox != null) {
            previewTopRightBox.setBackgroundColor(alphaTopBoxBg);
        }
        if (previewLeftDateBox != null) {
            previewLeftDateBox.setBackgroundColor(alphaDateBoxBg);
        }
        if (tvPreviewNextPrayer != null) {
            tvPreviewNextPrayer.setTextColor(nextPrayerColor);
        }
        if (tvPreviewDate != null) {
            tvPreviewDate.setTextColor(dateText);
        }

        // 4 Accent Strips
        if (previewStrip1 != null) previewStrip1.setBackgroundColor(strip1);
        if (previewStrip2 != null) previewStrip2.setBackgroundColor(strip2);
        if (previewStrip3 != null) previewStrip3.setBackgroundColor(strip3);
        if (previewStrip4 != null) previewStrip4.setBackgroundColor(strip4);

        // Middle Grid
        if (previewMiddleGrid != null) {
            previewMiddleGrid.setBackgroundColor(alphaGridBg);
        }
        if (pNameFajr != null) {
            pNameFajr.setTextColor(gridHighlightColor);
            pTimeFajr.setTextColor(gridHighlightColor);

            pNameSunrise.setTextColor(gridNameColor);
            pTimeSunrise.setTextColor(gridTimeColor);

            pNameDhuhr.setTextColor(gridNameColor);
            pTimeDhuhr.setTextColor(gridTimeColor);

            pNameAsr.setTextColor(gridNameColor);
            pTimeAsr.setTextColor(gridTimeColor);

            pNameMaghrib.setTextColor(gridNameColor);
            pTimeMaghrib.setTextColor(gridTimeColor);

            pNameIsha.setTextColor(gridNameColor);
            pTimeIsha.setTextColor(gridTimeColor);
        }

        // Separators
        if (previewSep1 != null) previewSep1.setBackgroundColor(sepColor);
        if (previewSep2 != null) previewSep2.setBackgroundColor(sepColor);
        if (previewSep3 != null) previewSep3.setBackgroundColor(sepColor);
        if (previewSep4 != null) previewSep4.setBackgroundColor(sepColor);
        if (previewSep5 != null) previewSep5.setBackgroundColor(sepColor);

        // Night Strip
        if (previewNightStrip != null) {
            previewNightStrip.setBackgroundColor(alphaNightBg);
        }
        if (tvPreviewNight != null) {
            tvPreviewNight.setTextColor(nightText);
        }

        // 2. Compact Preview Updates
        if (previewCompactCard != null) {
            previewCompactCard.setBackgroundColor(alphaRootBg);
        }
        if (tvCompactPreviewDate != null) {
            tvCompactPreviewDate.setTextColor(dateText);
        }
        if (previewCompactPrevBox != null) {
            previewCompactPrevBox.setBackgroundColor(alphaGridBg);
        }
        if (tvCompactPrevLabel != null) tvCompactPrevLabel.setTextColor(gridNameColor);
        if (tvCompactPrevName != null) tvCompactPrevName.setTextColor(gridTimeColor);
        if (tvCompactPrevTime != null) tvCompactPrevTime.setTextColor(gridNameColor);

        if (previewCompactNextBox != null) {
            previewCompactNextBox.setBackgroundColor(alphaTopBoxBg);
        }
        if (tvCompactNextLabel != null) tvCompactNextLabel.setTextColor(nextPrayerColor);
        if (tvCompactNextName != null) tvCompactNextName.setTextColor(countdownColor);
        if (tvCompactNextTime != null) tvCompactNextTime.setTextColor(nextPrayerColor);

        if (previewCompactRibbon != null) {
            previewCompactRibbon.setBackgroundColor(alphaNightBg);
        }
        if (tvCompactPreviewCountdown != null) {
            tvCompactPreviewCountdown.setTextColor(nightText);
        }


    }

    private void saveAndFinish() {
        SharedPreferences prefs = getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();

        // 1. Strictly isolate settings per this appWidgetId
        editor.putInt("widget_transparency_" + mAppWidgetId, selectedTransparency);
        editor.putString("widget_theme_" + mAppWidgetId, selectedTheme);
        editor.putString("widget_type_" + mAppWidgetId, mWidgetType);

        // 2. Also save for this specific widget type default for newly added widgets of this type
        editor.putInt("widget_" + mWidgetType + "_transparency", selectedTransparency);
        editor.putString("widget_" + mWidgetType + "_theme", selectedTheme);

        // 3. Fallback defaults only if not yet set (do NOT overwrite other existing widgets!)
        if (!prefs.contains("widget_transparency")) {
            editor.putInt("widget_transparency", selectedTransparency);
        }
        if (!prefs.contains("widget_theme")) {
            editor.putString("widget_theme", selectedTheme);
        }

        editor.apply();

        // Refresh all widgets immediately across all providers
        try {
            PrayerWidgetProvider.updateAllWidgets(this);
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Return RESULT_OK to Android Launcher
        Intent resultValue = new Intent();
        resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, mAppWidgetId);
        setResult(RESULT_OK, resultValue);
        finish();
    }

    @Override
    public void onBackPressed() {
        setResult(RESULT_CANCELED);
        super.onBackPressed();
    }
}
