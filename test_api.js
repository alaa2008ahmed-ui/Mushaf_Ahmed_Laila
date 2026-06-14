async function run() {
    try {
        const res = await fetch('https://api.wikimedia.org/feed/v1/wikipedia/ar/onthisday/events/05/20', {
            headers: { 'User-Agent': 'IslamicApp/1.0 (fahd11211fahd@gmail.com)' }
        });
        const data = await res.json();
        console.log(data);
    } catch(e){
        console.error(e);
    }
}
run();
