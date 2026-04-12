const text = "تَرْتَاب[o[ُوٓ[s[اْ]‌ۖ] إِلّ[o[َآ]";
const stripped = text.replace(/\[[a-z](?::\d+)?\[/g, '').replace(/\]/g, '');
console.log(stripped);
