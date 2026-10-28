import subprocess

with open('/tmp/img02.ppm', 'rb') as f:
    f.readline()
    dims = f.readline().decode().strip()
    while dims.startswith('#'):
        dims = f.readline().decode().strip()
    w, h = [int(x) for x in dims.split()]
    f.readline()
    raw = f.read()

min_x, max_x = 44, 1247
min_y, max_y = 7, 933
cw = max_x - min_x + 1
ch = max_y - min_y + 1

rgba = bytearray(cw * ch * 4)
for cy in range(ch):
    y = min_y + cy
    for cx in range(cw):
        x = min_x + cx
        v = raw[(y * w + x) * 3]
        idx = (cy * cw + cx) * 4
        
        if y >= 936:
            a = 0
        elif v <= 182:
            a = 0
        elif v >= 230:
            a = 255
        else:
            t = (v - 182) / (230 - 182)
            a = int(255 * (t * t * (3 - 2 * t)))
        
        rgba[idx] = 255
        rgba[idx+1] = 255
        rgba[idx+2] = 255
        rgba[idx+3] = a

header = f"P7\nWIDTH {cw}\nHEIGHT {ch}\nDEPTH 4\nMAXVAL 255\nTUPLTYPE RGB_ALPHA\nENDHDR\n"
with open('/tmp/master.pam', 'wb') as pf:
    pf.write(header.encode('ascii'))
    pf.write(rgba)

print(f"Master PAM written: {cw}x{ch}")
