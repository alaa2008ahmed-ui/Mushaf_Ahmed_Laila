const fs = require('fs');

async function updateHisn() {
    const res = await fetch('https://raw.githubusercontent.com/asellam/HisnElMuslim/master/hisn.json');
    const data = await res.json();
    
    const categories = [];
    const hisnData = {};
    
    let i = 1;
    for (const [title, content] of Object.entries(data)) {
        const id = 'hisn_' + i;
        
        let icon = 'fa-book-open';
        if (title.includes('نوم') || title.includes('استيقاظ')) icon = 'fa-bed';
        else if (title.includes('ثوب') || title.includes('لبس')) icon = 'fa-shirt';
        else if (title.includes('خلاء')) icon = 'fa-toilet';
        else if (title.includes('وضوء')) icon = 'fa-droplet';
        else if (title.includes('مسجد')) icon = 'fa-mosque';
        else if (title.includes('أذان')) icon = 'fa-bullhorn';
        else if (title.includes('صلاة') || title.includes('ركوع') || title.includes('سجود') || title.includes('تشهد')) icon = 'fa-person-praying';
        else if (title.includes('صباح') || title.includes('مساء')) icon = 'fa-sun';
        else if (title.includes('طعام') || title.includes('أكل') || title.includes('شرب')) icon = 'fa-utensils';
        else if (title.includes('سفر') || title.includes('دابة')) icon = 'fa-plane';
        else if (title.includes('مريض') || title.includes('مرض')) icon = 'fa-bed-pulse';
        else if (title.includes('ميت') || title.includes('قبر') || title.includes('جنازة')) icon = 'fa-book-quran';
        else if (title.includes('مطر') || title.includes('رعد') || title.includes('ريح')) icon = 'fa-cloud-rain';
        else if (title.includes('زواج') || title.includes('متزوج')) icon = 'fa-ring';
        else if (title.includes('هم') || title.includes('حزن') || title.includes('كرب')) icon = 'fa-face-sad-tear';
        else if (title.includes('غضب')) icon = 'fa-fire';
        else if (title.includes('منزل') || title.includes('بيت')) icon = 'fa-house';
        
        categories.push({
            id,
            title: title.replace(/[\u064B-\u065F]/g, ''), // remove tashkeel for title
            icon
        });
        
        hisnData[id] = content.Adhkar.map((adhkar, index) => {
            return {
                type: 'dhikr',
                title: `الذكر ${index + 1}`,
                text: adhkar.Text,
                source: adhkar.Reference || '',
                count: adhkar.Count || 1
            };
        });
        
        i++;
    }
    
    const fileContent = `export const HISN_ALMUSLIM_CATEGORIES = ${JSON.stringify(categories, null, 4)};\n\nexport const HISN_ALMUSLIM_DATA = ${JSON.stringify(hisnData, null, 4)};\n`;
    
    fs.writeFileSync('./data/hisnAlmuslimData.ts', fileContent);
    console.log('Done! Categories:', categories.length, 'Total Adhkar:', Object.values(hisnData).flat().length);
}

updateHisn().catch(console.error);
