import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Printer } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { GOOGLE_PLAY_URL } from '../../constants';

interface ShareAppQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAppQrModal: React.FC<ShareAppQrModalProps> = ({ isOpen, onClose }) => {
  const { language, dir, t } = useLanguage();
  const { theme, themeKey } = useTheme();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  const isNative = Capacitor.isNativePlatform();

  const isBlackTheme =
    themeKey === 'deep_black' ||
    theme.bgColor === '#000000' ||
    theme.name === 'اسود' ||
    theme.name === 'black';

  const primaryColor = isBlackTheme ? '#f59e0b' : '#b45309';

  // Generate QR Code with black color and center logo without damaging QR readability (ECC High)
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const canvas = document.createElement('canvas');
    const size = 600;
    canvas.width = size;
    canvas.height = size;

    QRCode.toCanvas(canvas, GOOGLE_PLAY_URL, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000', // أسود تماماً
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H', // دعم تصحيح الأخطاء العالي ليسمح بوضع شعار بالمنتصف دون اتلاف الرمز
    }, (error) => {
      if (error) {
        console.error('Failed to generate QR Code:', error);
        if (isMounted) setLoading(false);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        if (isMounted) {
          setQrCodeDataUrl(canvas.toDataURL());
          setLoading(false);
        }
        return;
      }

      // Load app logo / icon to place in the center
      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      logo.src = '/app_icon.png';
      logo.onload = () => {
        const logoSize = size * 0.22; // 22% من حجم الكيو ار
        const center = (size - logoSize) / 2;

        // Draw white square/rounded background for logo to make it clear
        ctx.save();
        const radius = 12;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(center - 6, center - 6, logoSize + 12, logoSize + 12, radius);
        } else {
          ctx.rect(center - 6, center - 6, logoSize + 12, logoSize + 12);
        }
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = isBlackTheme ? '#f59e0b' : '#d97706';
        ctx.stroke();
        ctx.restore();

        // Draw logo in center as square with rounded corners matching Google Play icon style
        ctx.save();
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(center, center, logoSize, logoSize, 8);
        } else {
          ctx.rect(center, center, logoSize, logoSize);
        }
        ctx.clip();
        ctx.drawImage(logo, center, center, logoSize, logoSize);
        ctx.restore();

        if (isMounted) {
          setQrCodeDataUrl(canvas.toDataURL());
          setLoading(false);
        }
      };

      logo.onerror = () => {
        // If logo fails to load, just use QR code without logo
        if (isMounted) {
          setQrCodeDataUrl(canvas.toDataURL());
          setLoading(false);
        }
      };
    });

    return () => {
      isMounted = false;
    };
  }, [isBlackTheme]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showPrintModal) {
          setShowPrintModal(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showPrintModal, onClose]);

  const handlePrint = (size: 'A4' | 'A5') => {
    setShowPrintModal(false);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert(language === 'en' ? 'Please allow popups for printing' : 'يرجى السماح بفتح النوافذ المنبثقة للطباعة');
      return;
    }

    const widthCss = size === 'A4' ? '210mm' : '148mm';
    const heightCss = size === 'A4' ? '297mm' : '210mm';

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="${language}" dir="${dir}">
        <head>
          <meta charset="UTF-8" />
          <title>${language === 'en' ? 'Print QR Code' : 'طباعة رمز الاستجابة'} - ${size}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
          <style>
            @page {
              size: ${size} portrait;
              margin: 0;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: 'Cairo', sans-serif !important;
              background-color: #ffffff;
              color: #0f172a;
              width: ${widthCss};
              height: ${heightCss};
              display: flex;
              align-items: center;
              justify-content: center;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-page {
              width: ${widthCss};
              height: ${heightCss};
              padding: 12mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              background: #ffffff;
              position: relative;
            }
            .double-border {
              position: absolute;
              top: 6mm;
              bottom: 6mm;
              left: 6mm;
              right: 6mm;
              border: 2px solid #b45309;
              pointer-events: none;
            }
            .inner-border {
              position: absolute;
              top: 8mm;
              bottom: 8mm;
              left: 8mm;
              right: 8mm;
              border: 1px solid #d97706;
              pointer-events: none;
            }
            .header-section {
              text-align: center;
              z-index: 2;
              margin-top: 4mm;
            }
            .bismillah {
              font-family: 'Cairo', sans-serif !important;
              font-size: ${size === 'A4' ? '24pt' : '16pt'};
              font-weight: 700;
              color: #78350f;
              margin-bottom: 2mm;
            }
            .hadith {
              font-family: 'Cairo', sans-serif !important;
              font-size: ${size === 'A4' ? '13pt' : '9.5pt'};
              color: #92400e;
              margin-bottom: 4mm;
            }
            .app-title {
              font-family: 'Cairo', sans-serif !important;
              font-size: ${size === 'A4' ? '30pt' : '20pt'};
              font-weight: 900;
              color: #b45309;
              margin-bottom: 2mm;
            }
            .app-subtitle {
              font-family: 'Cairo', sans-serif !important;
              font-size: ${size === 'A4' ? '14pt' : '10pt'};
              color: #78350f;
              font-weight: 600;
            }
            .qr-container {
              z-index: 2;
              border: 3px solid #b45309;
              border-radius: 24px;
              padding: 10mm;
              background: #ffffff;
              box-shadow: 0 10px 30px rgba(180, 83, 9, 0.1);
              display: flex;
              flex-direction: column;
              align-items: center;
              margin: 4mm 0;
            }
            .qr-image {
              width: ${size === 'A4' ? '110mm' : '70mm'};
              height: ${size === 'A4' ? '110mm' : '70mm'};
              object-fit: contain;
            }
            .scan-badge {
              margin-top: 5mm;
              background-color: #b45309;
              color: #ffffff;
              padding: 3mm 8mm;
              border-radius: 50px;
              font-family: 'Cairo', sans-serif !important;
              font-size: ${size === 'A4' ? '12pt' : '8.5pt'};
              font-weight: bold;
            }
            .footer-section {
              text-align: center;
              z-index: 2;
              margin-bottom: 4mm;
            }
            .footer-title {
              font-family: 'Cairo', sans-serif !important;
              font-size: ${size === 'A4' ? '15pt' : '10.5pt'};
              font-weight: bold;
              color: #78350f;
              margin-bottom: 1mm;
            }
            .footer-id {
              font-family: 'Cairo', sans-serif !important;
              font-size: ${size === 'A4' ? '12pt' : '8.5pt'};
              color: #b45309;
              font-weight: bold;
              margin-bottom: 1mm;
            }
            .footer-desc {
              font-family: 'Cairo', sans-serif !important;
              font-size: ${size === 'A4' ? '10.5pt' : '7.5pt'};
              color: #92400e;
              margin-bottom: 1mm;
            }
            .footer-dua {
              font-family: 'Cairo', sans-serif !important;
              font-size: ${size === 'A4' ? '11.5pt' : '8pt'};
              color: #b45309;
              font-weight: bold;
            }
            .url-bottom {
              font-family: 'Cairo', sans-serif !important;
              font-size: 7pt;
              color: #b45309;
              margin-top: 1mm;
            }
          </style>
        </head>
        <body>
          <div class="print-page">
            <div class="double-border"></div>
            <div class="inner-border"></div>

            <div class="header-section">
              <div class="bismillah">بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</div>
              <div class="hadith">« خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ »</div>
              <div class="app-title">${language === 'en' ? 'Mushaf Ahmed & Laial' : 'مصحف أحمد وليلى'}</div>
              <div class="app-subtitle">${language === 'en' ? 'Holy Quran, Prayer Times, Azan & Prophetic Biography' : 'مواقيت الصلاة والأذان والأدعية والسيرة النبوية وغيرها الكثير'}</div>
            </div>

            <div class="qr-container">
              <img src="${qrCodeDataUrl}" class="qr-image" alt="QR Code" />
              <div class="scan-badge">📷 وجه كاميرا هاتفك نحو الرمز للتحميل المباشر</div>
            </div>

            <div class="footer-section">
              <div class="footer-title">Google Play متاح مجاناً على متجر</div>
              <div class="footer-id">ID: com.AhmedLaila.Quran</div>
              <div class="footer-desc">عمل بكاميرا الهاتف الافتراضية لأندرويد وآيفون دون تطبيقات إضافية</div>
              <div class="footer-dua">الدَّالُّ عَلَى الْخَيْرِ كَفَاعِلِهِ • صدقة جارية</div>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 400);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        dir={dir}
        className={`fixed inset-0 z-[9999] flex flex-col justify-between w-full h-full overflow-hidden animate-in fade-in duration-200 select-none font-['Cairo'] ${
          isBlackTheme ? 'bg-[#09090b] text-white' : 'bg-[#fffdfa] text-slate-800'
        }`}
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          fontFamily: "'Cairo', sans-serif",
        }}
      >
        {/* بطاقة الكيو ار تملأ الشاشة تماماً */}
        <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 text-center">
          <div
            className={`w-full h-full rounded-none sm:rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center transition-all ${
              isBlackTheme
                ? 'bg-[#18181b] border-0 sm:border sm:border-amber-500/20'
                : 'bg-white border-0 sm:border sm:border-amber-200/80 shadow-xl'
            }`}
          >
            {/* اسم التطبيق قبل نص رمز الاستجابة السريعة - بالتنسيق الذهبي الفاخر */}
            <div className="mb-2 text-center">
              <h2
                className={`text-xl sm:text-2xl font-black font-['Cairo'] tracking-wide ${
                  isBlackTheme ? 'text-amber-400' : 'text-amber-900'
                }`}
                style={{
                  color: isBlackTheme ? '#f59e0b' : '#78350f',
                  textShadow: isBlackTheme ? '0 1px 4px rgba(245, 158, 11, 0.2)' : '0 1px 2px rgba(255, 255, 255, 0.9), 0 2px 4px rgba(180, 83, 9, 0.15)'
                }}
              >
                {language === 'en' ? 'Mushaf Ahmed & Laial' : 'مصحف أحمد وليلى'}
              </h2>
            </div>

            {/* عنوان الكيو ار */}
            <h3
              className={`text-base sm:text-lg font-bold mb-2 font-['Cairo'] ${
                isBlackTheme ? 'text-zinc-200' : 'text-amber-950'
              }`}
            >
              {t('app_share.qr_page_title', 'رمز الاستجابة السريعة (QR Code)')}
            </h3>

            <p
              className={`text-xs sm:text-sm font-semibold leading-relaxed mb-6 max-w-md px-2 font-['Cairo'] ${
                isBlackTheme ? 'text-zinc-300' : 'text-amber-900/80'
              }`}
            >
              {t(
                'app_share.qr_page_subtitle',
                'امسح رمز الاستجابة السريعة بكاميرا هاتفك للوصول المباشر إلى التطبيق على متجر جوجل بلاي'
              )}
            </p>

            {/* إطار رمز الكيو ار */}
            <div className={`relative p-4 sm:p-5 rounded-3xl bg-white shadow-xl flex items-center justify-center border-2 ${
              isBlackTheme ? 'border-amber-500/30 shadow-amber-900/10' : 'border-amber-300/80 shadow-amber-900/10'
            }`}>
              {loading ? (
                <div className="w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
                  <div
                    className="w-12 h-12 border-4 rounded-full animate-spin"
                    style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}
                  />
                </div>
              ) : qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="Google Play QR Code"
                  className="w-64 h-64 sm:w-80 sm:h-80 object-contain rounded-xl"
                />
              ) : (
                <div className="w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center text-xs text-red-500 font-['Cairo']">
                  {language === 'en' ? 'Failed to generate QR code' : 'تعذر إنشاء رمز الكيو ار'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* أزرار الطباعة والإغلاق في أسفل الصفحة بالتنسيق الذهبي الراقٍ */}
        <div className="w-full p-4 sm:p-6 bg-transparent">
          <div className={`w-full max-w-md mx-auto ${!isNative ? 'grid grid-cols-2 gap-3' : 'flex justify-center'}`}>
            {/* زر الطباعة - يظهر فقط عندما يعمل التطبيق على المتصفح */}
            {!isNative && (
              <button
                type="button"
                onClick={() => setShowPrintModal(true)}
                className="py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer text-white font-['Cairo']"
                style={{
                  background: 'linear-gradient(180deg, #d97706 0%, #b45309 100%)',
                  boxShadow: '0 4px 12px rgba(180, 83, 9, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
                  color: '#ffffff',
                  fontFamily: "'Cairo', sans-serif",
                }}
                title={t('app_share.print', 'طباعة')}
              >
                <Printer className="w-5 h-5" />
                <span>{t('app_share.print', 'طباعة')}</span>
              </button>
            )}

            {/* زر الإغلاق بالتصميم الذهبي الداكن الراقٍ */}
            <button
              type="button"
              onClick={onClose}
              className={`py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center shadow-lg active:scale-98 transition-all cursor-pointer font-['Cairo'] ${
                !isNative ? 'w-full' : 'w-full max-w-xs'
              }`}
              style={{
                background: isBlackTheme ? 'linear-gradient(180deg, #27272a 0%, #18181b 100%)' : 'linear-gradient(180deg, #78350f 0%, #451a03 100%)',
                color: isBlackTheme ? '#fef3c7' : '#ffffff',
                border: isBlackTheme ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(180, 83, 9, 0.4)',
                boxShadow: isBlackTheme ? '0 4px 12px rgba(0, 0, 0, 0.5)' : '0 4px 12px rgba(69, 26, 3, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                fontFamily: "'Cairo', sans-serif",
              }}
              title={t('common.close', 'إغلاق')}
            >
              <span>{t('common.close', 'إغلاق')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* نافذة اختيار حجم الطباعة (A4 أو A5) */}
      {showPrintModal && (
        <div
          dir={dir}
          className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in font-['Cairo']"
          onClick={() => setShowPrintModal(false)}
        >
          <div
            className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-center font-['Cairo'] ${
              isBlackTheme ? 'bg-[#18181b] text-white border border-amber-500/20' : 'bg-white text-slate-800 border border-amber-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold font-['Cairo']" style={{ color: isBlackTheme ? '#f59e0b' : '#78350f' }}>
              {language === 'en' ? 'Select Print Paper Size' : 'اختر حجم ورقة الطباعة'}
            </h3>
            <p className={`text-xs font-['Cairo'] ${isBlackTheme ? 'text-zinc-300' : 'text-amber-900/80'}`}>
              {language === 'en' ? 'Choose A4 or A5 format for the document' : 'يرجى تحديد حجم الورق المناسب للطباعة (A4 أو A5)'}
            </p>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                type="button"
                onClick={() => handlePrint('A4')}
                className="py-3 px-4 rounded-xl font-bold text-white active:scale-95 transition-all shadow-md cursor-pointer font-['Cairo']"
                style={{
                  background: 'linear-gradient(180deg, #d97706 0%, #b45309 100%)',
                }}
              >
                {t('app_share.print_a4', 'طباعة A4')}
              </button>
              <button
                type="button"
                onClick={() => handlePrint('A5')}
                className="py-3 px-4 rounded-xl font-bold text-white active:scale-95 transition-all shadow-md cursor-pointer font-['Cairo']"
                style={{
                  background: 'linear-gradient(180deg, #d97706 0%, #b45309 100%)',
                }}
              >
                {t('app_share.print_a5', 'طباعة A5')}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowPrintModal(false)}
              className={`mt-2 py-2 px-4 rounded-xl text-xs font-semibold font-['Cairo'] cursor-pointer ${
                isBlackTheme ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-amber-100/60 text-amber-900 hover:bg-amber-100'
              }`}
            >
              {t('common.cancel', 'إلغاء')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareAppQrModal;
