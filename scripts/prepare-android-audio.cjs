const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_DIR = path.join(__dirname, '../public/assets/audio');
const DEST_DIR = path.join(__dirname, '../android/app/src/main/res/raw');

async function prepareAudio() {
    console.log('--- Starting Audio Preparation ---');
    
    if (!fs.existsSync(SOURCE_DIR)) {
        console.log(`Creating directory: ${SOURCE_DIR}`);
        fs.mkdirSync(SOURCE_DIR, { recursive: true });
    }

    try {
        if (!fs.existsSync(DEST_DIR)) {
            fs.mkdirSync(DEST_DIR, { recursive: true });
        }
        
        const files = fs.readdirSync(SOURCE_DIR);
        files.forEach(file => {
            if (file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.ogg')) {
                const sourcePath = path.join(SOURCE_DIR, file);
                let destFilename = file.toLowerCase()
                    .replace(/\s+/g, '_')
                    .replace(/[^a-z0-9_.]/g, '');
                    
                if (/^\d/.test(destFilename)) {
                    destFilename = 'sound_' + destFilename;
                }

                const destPath = path.join(DEST_DIR, destFilename);
                fs.copyFileSync(sourcePath, destPath);
                console.log(`Copied: ${file} -> res/raw/${destFilename}`);
            }
        });
    } catch (e) {
        console.warn(`Warning: Could not copy to Android dir. This is normal if the Android platform is not added yet.`);
    }
    
    console.log('--- Audio Preparation Complete ---');
}

prepareAudio();
