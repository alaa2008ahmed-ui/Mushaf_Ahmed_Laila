import subprocess
import os

sizes = {
    'android/app/src/main/res/drawable-mdpi/ic_stat_name.png': 24,
    'android/app/src/main/res/drawable-hdpi/ic_stat_name.png': 36,
    'android/app/src/main/res/drawable-xhdpi/ic_stat_name.png': 48,
    'android/app/src/main/res/drawable-xxhdpi/ic_stat_name.png': 72,
    'android/app/src/main/res/drawable-xxxhdpi/ic_stat_name.png': 96,
    'android/app/src/main/res/drawable/ic_stat_name.png': 96,
    
    'android/app/src/main/res/drawable-mdpi/notification_icon.png': 24,
    'android/app/src/main/res/drawable-hdpi/notification_icon.png': 36,
    'android/app/src/main/res/drawable-xhdpi/notification_icon.png': 48,
    'android/app/src/main/res/drawable-xxhdpi/notification_icon.png': 72,
    'android/app/src/main/res/drawable-xxxhdpi/notification_icon.png': 96,
    'android/app/src/main/res/drawable/notification_icon.png': 96,
    'android/app/src/main/res/drawable-nodpi/notification_icon.png': 192,
    
    'public/assets/notification_icon.png': 192,
    'public/notification_icon.png': 192,
    'android/app/src/main/assets/public/assets/notification_icon.png': 192,
    'android/app/src/main/assets/public/notification_icon.png': 192,
}

for dest, sz in sizes.items():
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    cmd = [
        'convert', '/tmp/master_icon.png',
        '-filter', 'Lanczos',
        '-resize', f'{sz}x{sz}',
        '-gravity', 'center',
        '-background', 'none',
        '-extent', f'{sz}x{sz}',
        '-define', 'png:color-type=6',
        dest
    ]
    subprocess.run(cmd, check=True)
    print(f"Generated {dest} ({sz}x{sz})")

print("All notification icon drawables successfully updated!")
