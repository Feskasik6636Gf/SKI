"""Signs for the bracelet story (Pillow, Titan One). python tools/make_textures_bracelet.py"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "tex"); os.makedirs(OUT, exist_ok=True)
FONT = os.path.join(ROOT, "assets", "fonts", "TitanOne-Regular.ttf")
f = lambda s: ImageFont.truetype(FONT, s)


def sign(name, lines, bg, fg, size, w=2000, h=700, border=None, stroke=None, shadow=True, pattern=None):
    im = Image.new("RGB", (w, h), bg); d = ImageDraw.Draw(im)
    if pattern == "stripes":
        for i in range(-h, w, 110): d.polygon([(i, 0), (i + 55, 0), (i + 55 + h, h), (i + h, h)], fill=tuple(min(255, c + 14) for c in bg))
    if border: d.rectangle([14, 14, w - 15, h - 15], outline=border, width=26)
    n = len(lines); gap = h / (n + 1)
    for i, (ln, col) in enumerate(lines):
        y = gap * (i + 1)
        if shadow: d.text((w / 2 + 8, y + 10), ln, font=f(size), fill=(0, 0, 0), anchor="mm")
        d.text((w / 2, y), ln, font=f(size), fill=col or fg, anchor="mm", stroke_width=8 if stroke else 0, stroke_fill=stroke)
    im.save(os.path.join(OUT, name + ".png"))


sign("sign_wordbank", [("WORD BANK", (255, 226, 120)), ("buy extra words", (255, 255, 255))], (18, 110, 70), (255, 226, 120), 270, border=(255, 226, 120))
sign("sign_bakery", [("BAKERY", (255, 255, 255))], (214, 96, 62), (255, 255, 255), 330, pattern="stripes", border=(255, 236, 190), stroke=(120, 40, 20))
sign("sign_double", [("WORDS COST", (255, 255, 255)), ("DOUBLE!", (255, 232, 70))], (205, 45, 45), (255, 255, 255), 290, border=(255, 255, 255), stroke=(90, 10, 10))
sign("sign_save", [("WORDS RUN OUT,", (40, 30, 20)), ("SO SAVE THEM.", (150, 20, 20))], (236, 214, 160), (40, 30, 20), 250, border=(110, 70, 40))
sign("banner_bday", [("HAPPY BIRTHDAY!", (255, 255, 255))], (240, 110, 170), (255, 255, 255), 230, w=2400, h=420, pattern="stripes", stroke=(120, 30, 70))
sign("sign_tower", [("MAYOR", (255, 255, 255))], (30, 40, 70), (255, 255, 255), 250, w=1200, h=420, border=(230, 190, 70))
print("ok")
