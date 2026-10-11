# Turns generated icons (white background) into 320x320 transparent PNGs.
# usage: python3 tools/cutout-icons.py <dir-with-.raw-files> public/icons
import sys, glob, os
from PIL import Image, ImageDraw, ImageFilter, ImageChops
src, dst = sys.argv[1], sys.argv[2]
for f in sorted(glob.glob(os.path.join(src, "*.raw"))):
    im = Image.open(f).convert("RGB")
    w, h = im.size
    r, g, b = im.split()
    mn = ImageChops.darker(ImageChops.darker(r, g), b)
    thr = mn.point(lambda v: 255 if v > 238 else 0)  # near-white
    mask = thr.copy()
    for xy in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]:
        if mask.getpixel(xy) == 255:
            ImageDraw.floodfill(mask, xy, 128)
    bg = mask.point(lambda v: 255 if v == 128 else 0)
    alpha = ImageChops.invert(bg).filter(ImageFilter.GaussianBlur(0.8))
    out = im.convert("RGBA"); out.putalpha(alpha)
    bbox = alpha.point(lambda v: 255 if v > 20 else 0).getbbox()
    out = out.crop(bbox)
    side = int(max(out.size) / 0.82)
    canvas = Image.new("RGBA", (side, side), (255, 255, 255, 0))
    canvas.paste(out, ((side - out.size[0]) // 2, (side - out.size[1]) // 2), out)
    canvas = canvas.resize((320, 320), Image.LANCZOS)
    name = os.path.splitext(os.path.basename(f))[0]
    canvas.save(os.path.join(dst, name + ".png"), optimize=True)
    print(name, os.path.getsize(os.path.join(dst, name + ".png")) // 1024, "KB")
