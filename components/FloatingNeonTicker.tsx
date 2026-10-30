import React, { useEffect, useState } from 'react';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRDbre0eogQtQDlyPowjcNSii1jMqURYKK8UjFm9Y2zsZDU5oT9ZmOJgmbz_UarqXp3aduvrlHuGU5F/pub?output=csv';

interface FloatingNeonTickerProps {
  layoutMode?: 'classic' | 'modern';
  isGolden?: boolean;
}

const FloatingNeonTicker: React.FC<FloatingNeonTickerProps> = ({ layoutMode, isGolden }) => {
  const [tickerData, setTickerData] = useState<{ status: string; message: string } | null>(null);

  // تحقق تلقائي من وضع التصميم الذكي الذهبي (عبر prop أو فحص DOM للـ data-layout)
  const isModern = layoutMode === 'modern' || isGolden || (typeof document !== 'undefined' && document.querySelector('[data-layout="modern"]') !== null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;
    
    const fetchTicker = async () => {
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`${CSV_URL}&t=${timestamp}`);
        if (!response.ok) return; // تجاهل أخطاء الشبكة للحفاظ على حالة الشريط
        
        const text = await response.text();
        if (!isMounted) return;

        // حماية إضافية: إذا قامت جوجل بإرجاع صفحة خطأ (HTML) بدلاً من CSV بسبب كثرة الطلبات، نتجاهلها
        if (text.trim().toLowerCase().startsWith('<!doctype html>')) {
          return;
        }

        const rows = text.split(/\r?\n/).filter(row => row.trim() !== '');
        
        if (rows.length >= 2) {
          // استخدام طريقة آمنة جداً لفصل الحالة عن النص بدلاً من الـ Regex المعقد
          const firstCommaIndex = rows[1].indexOf(',');
          let status = '';
          let message = '';
          
          if (firstCommaIndex !== -1) {
            status = rows[1].substring(0, firstCommaIndex).trim().toUpperCase();
            message = rows[1].substring(firstCommaIndex + 1).trim();
            
            // إزالة علامات التنصيص المزدوجة التي يضيفها ملف الـ CSV
            if (message.startsWith('"') && message.endsWith('"')) {
              message = message.substring(1, message.length - 1);
            }
            message = message.replace(/""/g, '"');
          } else {
            status = rows[1].trim().toUpperCase();
          }
          
          // التنفيذ الصارم
          if (status === 'OFF') {
            setTickerData(null);
          } else if (status === 'ON') {
            setTickerData(prev => {
              if (prev?.message === message && prev?.status === status) return prev;
              return { status, message };
            });
          }
        }
      } catch (error) {
        // Ignore errors to prevent console spam during background polling
      }
    };

    fetchTicker();
    intervalId = setInterval(fetchTicker, 5000);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // لا نخفي الشريط إلا إذا كانت الحالة ليست ON
  if (!tickerData || tickerData.status !== 'ON') {
    return null;
  }

  return (
    <div 
      className="absolute top-0 left-0 right-0 z-10 w-full overflow-hidden rounded-full"
      style={{ height: '100%', minHeight: '27.5px' }}
    >
      <style>
        {`
          /* أنيميشن التصميم الكلاسيكي - ألوان النيون الأصلية بدون أي تغيير */
          @keyframes neon-ticker-scroll {
            0% { left: 0%; transform: translate(-100%, -50%); color: #39FF14; text-shadow: 0 0 10px #39FF14; }
            25% { color: #00FFFF; text-shadow: 0 0 10px #00FFFF; }
            50% { color: #FF00FF; text-shadow: 0 0 10px #FF00FF; }
            75% { color: #FFFF00; text-shadow: 0 0 10px #FFFF00; }
            100% { left: 100%; transform: translate(0, -50%); color: #39FF14; text-shadow: 0 0 10px #39FF14; }
          }
          @keyframes neon-border-glow {
            0%, 100% { border-color: #39FF14; box-shadow: 0 0 15px rgba(57, 255, 20, 0.7); }
            25% { border-color: #00FFFF; box-shadow: 0 0 15px rgba(0, 255, 255, 0.7); }
            50% { border-color: #FF00FF; box-shadow: 0 0 15px rgba(255, 0, 255, 0.7); }
            75% { border-color: #FFFF00; box-shadow: 0 0 15px rgba(255, 255, 0, 0.7); }
          }

          /* أنيميشن التصميم الذكي الحديث - متوافق كلياً مع البطاقات الذهبية 3D */
          @keyframes golden-ticker-scroll {
            0% { 
              left: 0%; 
              transform: translate(-100%, -50%); 
              color: #451A03; 
              text-shadow: 0 1px 1px rgba(255, 255, 255, 0.95), 0 0 1px rgba(120, 53, 15, 0.3); 
            }
            25% { 
              color: #78350F; 
              text-shadow: 0 1px 1px rgba(255, 255, 255, 0.95), 0 0 2px rgba(217, 119, 6, 0.4); 
            }
            50% { 
              color: #92400E; 
              text-shadow: 0 1px 1px rgba(255, 255, 255, 0.95), 0 0 2px rgba(245, 158, 11, 0.45); 
            }
            75% { 
              color: #B45309; 
              text-shadow: 0 1px 1px rgba(255, 255, 255, 0.95), 0 0 2px rgba(180, 83, 9, 0.4); 
            }
            100% { 
              left: 100%; 
              transform: translate(0, -50%); 
              color: #451A03; 
              text-shadow: 0 1px 1px rgba(255, 255, 255, 0.95), 0 0 1px rgba(120, 53, 15, 0.3); 
            }
          }
          @keyframes golden-border-glow {
            0%, 100% { 
              border-color: #D97706; 
              box-shadow: 0 3px 10px rgba(180, 115, 20, 0.28), inset 0 2px 2px rgba(255, 255, 255, 0.95), inset 0 -2px 3px rgba(146, 64, 14, 0.16); 
            }
            33% { 
              border-color: #F59E0B; 
              box-shadow: 0 3px 14px rgba(245, 158, 11, 0.38), inset 0 2px 2px rgba(255, 255, 255, 0.95), inset 0 -2px 3px rgba(146, 64, 14, 0.16); 
            }
            66% { 
              border-color: #B45309; 
              box-shadow: 0 3px 10px rgba(180, 83, 9, 0.32), inset 0 2px 2px rgba(255, 255, 255, 0.95), inset 0 -2px 3px rgba(146, 64, 14, 0.16); 
            }
          }

          .ticker-content {
            position: absolute;
            top: 50%;
            display: inline-block;
            white-space: nowrap;
            width: max-content;
          }

          .ticker-content-classic {
            animation: neon-ticker-scroll 40s linear infinite;
          }

          .ticker-content-modern {
            animation: golden-ticker-scroll 40s linear infinite;
          }

          /* حاوية النيون الكلاسيكية */
          .neon-ticker-container {
            position: absolute;
            inset: 0;
            z-index: 10;
            pointer-events: none;
            overflow: hidden;
            display: flex;
            align-items: center;
            background: #000000;
            backdrop-filter: blur(20px);
            border: 2px solid #39FF14;
            border-radius: 9999px;
            box-shadow: 0 0 20px rgba(57, 255, 20, 0.4);
            animation: neon-border-glow 8s linear infinite;
          }

          /* حاوية البطاقات الذهبية الحديثة */
          .golden-ticker-container {
            position: absolute;
            inset: 0;
            z-index: 10;
            pointer-events: none;
            overflow: hidden;
            display: flex;
            align-items: center;
            background: linear-gradient(140deg, #FFFDF7 0%, #FEF8E7 18%, #FCE8AB 50%, #F5D374 80%, #E8BE48 100%);
            border: 1.5px solid #D97706;
            border-radius: 9999px;
            animation: golden-border-glow 6s linear infinite;
          }

          .neon-text {
            font-weight: 900;
            font-size: 1.05rem;
            line-height: normal;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-family: 'Cairo', sans-serif;
            display: inline-block;
          }

          .golden-text {
            font-weight: 800;
            font-size: 1.05rem;
            line-height: normal;
            letter-spacing: 0.5px;
            font-family: 'Cairo', sans-serif;
            display: inline-block;
          }
        `}
      </style>
      <div 
        id="floating-neon-ticker" 
        className={isModern ? "golden-ticker-container" : "neon-ticker-container"}
      >
        <div className={`ticker-content ${isModern ? "ticker-content-modern" : "ticker-content-classic"}`}>
          <span 
            className={isModern ? "golden-text" : "neon-text"} 
            dangerouslySetInnerHTML={{ __html: tickerData.message }}
          ></span>
        </div>
      </div>
    </div>
  );
};

export default FloatingNeonTicker;
