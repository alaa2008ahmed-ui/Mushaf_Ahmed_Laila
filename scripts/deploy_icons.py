import subprocess
import os

# Clean, bold, solid Open Holy Quran on Rehal (Islamic wooden stand)
# Designed specifically for Android status bar notification icons:
# - Solid filled white pages with clear negative space scripture lines and center spine
# - Sturdy crossed Rehal stand with authentic Islamic arch cutout and feet
# - Bounding box filling ~88-92% of the canvas to match the height and visual weight of system icons (bell, clock)
# - Pure #FFFFFF with 255 RGB and clean alpha mask for 100% brightness under all status bar themes

svg_code = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="384" height="384">
  <defs>
    <mask id="quran-mask">
      <!-- White base: keep everything -->
      <rect width="96" height="96" fill="#FFFFFF" />
      
      <g transform="translate(48, 48) scale(1.08) translate(-48, -48)">
        <!-- Central vertical spine gap -->
        <rect x="46.5" y="8" width="3" height="48" rx="1.5" fill="#000000" />
        
        <!-- Left page scripture verse lines -->
        <line x1="14" y1="23" x2="39" y2="21" stroke="#000000" stroke-width="2.8" stroke-linecap="round" />
        <line x1="14" y1="31" x2="39" y2="29" stroke="#000000" stroke-width="2.8" stroke-linecap="round" />
        <line x1="14" y1="39" x2="39" y2="38" stroke="#000000" stroke-width="2.8" stroke-linecap="round" />

        <!-- Right page scripture verse lines -->
        <line x1="57" y1="21" x2="82" y2="23" stroke="#000000" stroke-width="2.8" stroke-linecap="round" />
        <line x1="57" y1="29" x2="82" y2="31" stroke="#000000" stroke-width="2.8" stroke-linecap="round" />
        <line x1="57" y1="38" x2="82" y2="39" stroke="#000000" stroke-width="2.8" stroke-linecap="round" />

        <!-- Page bottom separation gap -->
        <path d="M 5 50.5 C 19 53, 34 52.5, 46 56.5 L 46 59 C 34 55, 19 55.5, 5 53 Z" fill="#000000" />
        <path d="M 91 50.5 C 77 53, 62 52.5, 50 56.5 L 50 59 C 62 55, 77 55.5, 91 53 Z" fill="#000000" />
        
        <!-- Rehal crossed leg separation slit -->
        <line x1="43" y1="62" x2="53" y2="71" stroke="#000000" stroke-width="3" stroke-linecap="round" />
        
        <!-- Ribbon border outline for crisp definition -->
        <path d="M 45 53 L 45 69.5 L 48 67 L 51 69.5 L 51 53" fill="none" stroke="#000000" stroke-width="1.8" />
      </g>
    </mask>
  </defs>

  <g fill="#FFFFFF" mask="url(#quran-mask)">
    <g transform="translate(48, 48) scale(1.08) translate(-48, -48)">
      <!-- LEFT PAGE OF QURAN -->
      <path d="
        M 48 15
        C 35 11, 20 8, 7 11.5
        C 5.5 12, 4.5 13.5, 4.5 15
        L 4.5 49
        C 4.5 50.5, 5.5 51.8, 7 52
        C 20 54.5, 35 53.5, 48 58
        Z
      "/>
      
      <!-- RIGHT PAGE OF QURAN -->
      <path d="
        M 48 15
        C 61 11, 76 8, 89 11.5
        C 90.5 12, 91.5 13.5, 91.5 15
        L 91.5 49
        C 91.5 50.5, 90.5 51.8, 89 52
        C 76 54.5, 61 53.5, 48 58
        Z
      "/>

      <!-- PAGE LOWER BASE / THICKNESS -->
      <path d="
        M 4.5 49
        L 4.5 55.5
        C 4.5 57, 5.5 58, 7.5 58
        C 20 59, 35 59.5, 47 62
        L 47 57.5
        Z
      "/>
      <path d="
        M 91.5 49
        L 91.5 55.5
        C 91.5 57, 90.5 58, 88.5 58
        C 76 59, 61 59.5, 49 62
        L 49 57.5
        Z
      "/>

      <!-- REHAL / WOODEN STAND (Crossed Legs) -->
      <!-- Front Plank (top-left to bottom-right foot) -->
      <path d="
        M 26 57
        L 37 57
        L 74 81.5
        L 84 86
        C 85.5 86.5, 87 85.5, 87 84
        C 87 82.5, 85.5 81, 82.5 79
        L 48 57
        Z
      "/>
      <!-- Back Plank (top-right to bottom-left foot) -->
      <path d="
        M 70 57
        L 59 57
        L 22 81.5
        L 12 86
        C 10.5 86.5, 9 85.5, 9 84
        C 9 82.5, 10.5 81, 13.5 79
        L 48 57
        Z
      "/>

      <!-- Sturdy Wooden Feet Pads & Central Islamic Arch -->
      <path d="
        M 11 86
        L 26 86
        C 36 74, 60 74, 70 86
        L 85 86
        C 80 79, 65 74, 48 74
        C 31 74, 16 79, 11 86
        Z
      "/>
      
      <!-- Central Bookmark Ribbon (hanging below pages) -->
      <polygon points="46,53 50,53 50,69 48,67 46,69" />
    </g>
  </g>
</svg>'''

master_svg_path = '/tmp/master_quran_notification.svg'
master_png_path = '/tmp/master_quran_notification_384.png'

with open(master_svg_path, 'w') as f:
    f.write(svg_code)

# Render master at 384x384
subprocess.run(['ffmpeg', '-y', '-i', master_svg_path, master_png_path], check=True, stderr=subprocess.DEVNULL)
print("Rendered master 384x384 PNG successfully!")

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
    temp_scaled = f'/tmp/temp_scaled_{sz}.png'
    
    # 1. Scale with high-quality Lanczos filter
    subprocess.run([
        'ffmpeg', '-y', '-i', master_png_path,
        '-vf', f'scale={sz}:{sz}:flags=lanczos',
        temp_scaled
    ], check=True, stderr=subprocess.DEVNULL)
    
    # 2. Extract raw RGBA and enforce pure white (R=255, G=255, B=255) for all visible pixels
    raw_rgba = subprocess.check_output([
        'ffmpeg', '-i', temp_scaled,
        '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'
    ], stderr=subprocess.DEVNULL)
    
    buf = bytearray(len(raw_rgba))
    for i in range(0, len(raw_rgba), 4):
        a = raw_rgba[i+3]
        if a < 25:
            a = 0
        buf[i] = 255      # Red
        buf[i+1] = 255    # Green
        buf[i+2] = 255    # Blue
        buf[i+3] = a      # Alpha
        
    # 3. Write back to destination PNG
    p = subprocess.Popen([
        'ffmpeg', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba',
        '-s', f'{sz}x{sz}', '-i', '-', dest
    ], stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
    p.communicate(input=buf)
    
    print(f"Generated {dest} ({sz}x{sz}) with pure white alpha channel!")

print("\nAll notification icon files updated and deployed successfully!")
