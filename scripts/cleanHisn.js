const fs = require('fs');

let fileContent = fs.readFileSync('./data/hisnAlmuslimTranslationsEn.ts', 'utf8');

// 1. Fix Arabic in text
fileContent = fileContent.replace(/Allah تعالى replace it/g, 'Allah the Exalted replace it');

// 2. Fix hisn_133 items
fileContent = fileContent.replace(
  /\"hisn_133_1\": \{[\s\S]*?\"title\": \"Supplication 2\",[\s\S]*?\"text\": \"[\s\S]*?\",[\s\S]*?\"source\": \"[\s\S]*?\"\s*\}/,
  '\"hisn_133_1\": {\n        \"title\": \"Hadith 1\",\n        \"text\": \"Every good deed is a charity. Indeed, it is part of good deeds to meet your brother with a cheerful face, and to pour from your bucket into your brother\'s vessel.\",\n        \"source\": \"Narrated by At-Tirmidhi no. (1970) and Ahmad; authenticated by At-Tirmidhi and Al-Albani\"\n    }'
);

fileContent = fileContent.replace(
  /\"hisn_133_2\": \{[\s\S]*?\"title\": \"Supplication 3\",[\s\S]*?\"text\": \"[\s\S]*?\",[\s\S]*?\"source\": \"[\s\S]*?\"\s*\}/,
  '\"hisn_133_2\": {\n        \"title\": \"Hadith 2\",\n        \"text\": \"Your smiling in the face of your brother is charity for you. Your enjoining good and forbidding evil is charity. Your guiding a man in an unfamiliar land is charity. Your helping a man with poor eyesight is charity. Your removing a stone, a thorn, or a bone from the path is charity for you.\",\n        \"source\": \"Narrated by At-Tirmidhi no. (1956) and authenticated by Al-Albani\"\n    }'
);

fileContent = fileContent.replace(
  /\"hisn_133_3\": \{[\s\S]*?\"title\": \"Supplication 4\",[\s\S]*?\"text\": \"[\s\S]*?\",[\s\S]*?\"source\": \"[\s\S]*?\"\s*\}/,
  '\"hisn_133_3\": {\n        \"title\": \"Remembrance 2\",\n        \"text\": \"Two phrases are light on the tongue, heavy on the scale, and beloved to the Most Merciful: \'Subhan Allahi wa bihamdihi, Subhan Allahil-Azeem\' (Glory be to Allah and His praise, Glory be to Allah the Magnificent).\",\n        \"source\": \"Narrated by Al-Bukhari no. (6406) and Muslim no. (2694)\"\n    }'
);

fileContent = fileContent.replace(
  /\"hisn_133_4\": \{[\s\S]*?\"title\": \"Supplication 5\",[\s\S]*?\"text\": \"[\s\S]*?\",[\s\S]*?\"source\": \"[\s\S]*?\"\s*\}/,
  '\"hisn_133_4\": {\n        \"title\": \"Remembrance 3\",\n        \"text\": \"The most beloved words to Allah are four: Subhan Allah (Glory be to Allah), Al-Hamdulillah (All praise is due to Allah), La ilaha illa Allah (There is no god but Allah), and Allahu Akbar (Allah is the Greatest). It does not matter with which of them you begin.\",\n        \"source\": \"Narrated by Muslim in his Sahih no. (2137)\"\n    }'
);

fs.writeFileSync('./data/hisnAlmuslimTranslationsEn.ts', fileContent, 'utf8');
console.log('Successfully updated text and hisn_133 in hisnAlmuslimTranslationsEn.ts');
