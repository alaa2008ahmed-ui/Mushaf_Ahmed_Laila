import subprocess
import os

source_jpg = 'android/app/src/main/res/drawable-nodpi/app_logo_large.jpg'
master_clean_png = '/tmp/master_clean_icon_1024.png'
master_foreground_png = '/tmp/master_foreground_1024.png'

raw = subprocess.check_output(['ffmpeg', '-i', source_jpg, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], stderr=subprocess.DEVNULL)
w, h = 1024, 1024

crop_x1 = 120
crop_x2 = 904
crop_y1 = 100
crop_y2 = 926
cw = crop_x2 - crop_x1
ch = crop_y2 - crop_y1

cropped = bytearray(cw * ch * 4)

for cy in range(ch):
    y = crop_y1 + cy
    for cx in range(cw):
        x = crop_x1 + cx
        s_idx = (y * w + x) * 4
        c_idx = (cy * cw + cx) * 4
        
        # Check if in empty margins outside components
        is_outside = False
        if y < 295 and (x < 170 or x > 850):
            is_outside = True
        elif y > 845 and (x < 125 or x > 895):
            is_outside = True
        elif 295 <= y <= 315 and (x < 170 or x > 850):
            is_outside = True
        elif y > 835 and x < 150:
            is_outside = True
            
        if is_outside:
            cropped[c_idx] = 255
            cropped[c_idx+1] = 255
            cropped[c_idx+2] = 255
            cropped[c_idx+3] = 255
            continue
            
        r = raw[s_idx]
        g = raw[s_idx+1]
        b = raw[s_idx+2]
        
        # Feather left shadow smoothly so no hard edge exists
        if 500 <= y <= 840 and 120 <= x < 215:
            if min(r, g, b) > 150 and abs(r - g) < 15 and abs(r - b) < 15:
                fx = min(1.0, max(0.0, (x - 120.0) / 95.0))
                fade = fx * fx * (3.0 - 2.0 * fx)
                if y > 800:
                    fy = min(1.0, max(0.0, (840.0 - y) / 40.0))
                    fade *= (fy * fy * (3.0 - 2.0 * fy))
                r = int(255 - (255 - r) * fade)
                g = int(255 - (255 - g) * fade)
                b = int(255 - (255 - b) * fade)
        
        # Whitening curve:
        # Background is neutral off-white >= 226
        if min(r, g, b) >= 226 and abs(r - g) < 10 and abs(r - b) < 10:
            r, g, b = 255, 255, 255
        elif min(r, g, b) >= 190 and abs(r - g) < 14 and abs(r - b) < 14:
            v = min(r, g, b)
            t = (v - 190) / (226.0 - 190.0)
            boost = (255 - v) * (t ** 1.3)
            r = min(255, int(r + boost))
            g = min(255, int(g + boost))
            b = min(255, int(b + boost))
            
        cropped[c_idx]   = r
        cropped[c_idx+1] = g
        cropped[c_idx+2] = b
        cropped[c_idx+3] = 255

# 1. Master 1024x1024 clean icon for standard launchers, web PWA, notifications
# Scaled to fill ~90% of height and ~85% of width on pure white background
target_h = 918
target_w = int(target_h * (cw / ch))
pad_x = (1024 - target_w) // 2
pad_y = (1024 - target_h) // 2

proc = subprocess.Popen([
    'ffmpeg', '-y',
    '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{cw}x{ch}', '-i', '-',
    '-vf', f'scale={target_w}:{target_h}:flags=lanczos,pad=1024:1024:{pad_x}:{pad_y}:color=white',
    master_clean_png
], stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
proc.communicate(input=cropped)
print('Master 1024x1024 clean icon generated!')

# 2. Master Foreground for Android Adaptive Icons (fits safe zone 72dp inside 108dp)
fg_h = 700
fg_w = int(fg_h * (cw / ch))
fg_pad_x = (1024 - fg_w) // 2
fg_pad_y = (1024 - fg_h) // 2

proc = subprocess.Popen([
    'ffmpeg', '-y',
    '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{cw}x{ch}', '-i', '-',
    '-vf', f'scale={fg_w}:{fg_h}:flags=lanczos,pad=1024:1024:{fg_pad_x}:{fg_pad_y}:color=white',
    master_foreground_png
], stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
proc.communicate(input=cropped)
print('Master 1024x1024 foreground generated!')

# Target destinations and sizes
destinations = [
    # Web & PWA
    ('public/app_icon.png', 512),
    ('android/app/src/main/assets/public/app_icon.png', 512),
    
    # Android Drawables
    ('android/app/src/main/res/drawable/app_logo_large.png', 512),
    
    # Android Mipmaps - ic_launcher
    ('android/app/src/main/res/mipmap-mdpi/ic_launcher.png', 48),
    ('android/app/src/main/res/mipmap-hdpi/ic_launcher.png', 72),
    ('android/app/src/main/res/mipmap-xhdpi/ic_launcher.png', 96),
    ('android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png', 144),
    ('android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png', 192),
    
    # Android Mipmaps - ic_launcher_round
    ('android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png', 48),
    ('android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png', 72),
    ('android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png', 96),
    ('android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png', 144),
    ('android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png', 192),
    
    # Android Mipmaps - app_logo_large
    ('android/app/src/main/res/mipmap-mdpi/app_logo_large.png', 48),
    ('android/app/src/main/res/mipmap-hdpi/app_logo_large.png', 72),
    ('android/app/src/main/res/mipmap-xhdpi/app_logo_large.png', 96),
    ('android/app/src/main/res/mipmap-xxhdpi/app_logo_large.png', 144),
    ('android/app/src/main/res/mipmap-xxxhdpi/app_logo_large.png', 192),
]

for dest, sz in destinations:
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    subprocess.run([
        'ffmpeg', '-y', '-i', master_clean_png,
        '-vf', f'scale={sz}:{sz}:flags=lanczos',
        dest
    ], check=True, stderr=subprocess.DEVNULL)
    print(f'Rendered: {dest} ({sz}x{sz})')

# Foreground icons for adaptive icons
foreground_destinations = [
    ('android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png', 108),
    ('android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png', 162),
    ('android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png', 216),
    ('android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png', 324),
    ('android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png', 432),
]

for dest, sz in foreground_destinations:
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    subprocess.run([
        'ffmpeg', '-y', '-i', master_foreground_png,
        '-vf', f'scale={sz}:{sz}:flags=lanczos',
        dest
    ], check=True, stderr=subprocess.DEVNULL)
    print(f'Rendered foreground: {dest} ({sz}x{sz})')

# Update android/app/src/main/res/drawable-nodpi/app_logo_large.jpg with clean master (as high quality JPG)
subprocess.run([
    'ffmpeg', '-y', '-i', master_clean_png,
    '-q:v', '2',
    'android/app/src/main/res/drawable-nodpi/app_logo_large.jpg'
], check=True, stderr=subprocess.DEVNULL)
print('Updated android/app/src/main/res/drawable-nodpi/app_logo_large.jpg!')

print('\nAll icon assets updated successfully!')
