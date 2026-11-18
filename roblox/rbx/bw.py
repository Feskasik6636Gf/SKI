"""Sets + props for the 'word bracelet' story: street (bakery / word bank / mayor's tower), interiors, bracelets."""
import math, os, random
import bpy
from mathutils import Vector
from .core import *            # noqa: F401,F403
from .core import D, F
from . import chars, sets, story, world as W
from .sets import wood, tiles, planks, set_obj_visible

TEX = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "tex")
FONT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "fonts", "TitanOne-Regular.ttf")
BLUE, RED, GREEN = "#2f7bff", "#ff3b3b", "#35e07a"
BAKERY_X, BANK_X = -17.0, 17.0           # building centre x; facades face the street (x = +-11)
TOWER = (0.0, 95.0, 0.0)


def sign_mat(name, rough=0.5, emit=0.0):
    return img_mat(name, os.path.join(TEX, name + ".png"), rough, emit)


# ------------------------------------------------------------------ cast
def ben(t0, t1, expr="neutral", **kw):
    return story.eddie(t0, t1, expr, **kw)


def baker(t0, t1, expr="happy", name="Baker"):
    B = chars.Char(name, skin="#efd2b4", shirt="#f6f6f4", pants="#6b5a4a", hair="bald", face="mustache", sleeves="long",
                   extras=("collar:#d9d9d4",))
    hat = cyl(name + "_hat", 0.62, 0.9, (0, 0.05, 1.45), mat("chef_white", hexc("#fbfbf8"), 0.7), 24, bev=0.2, parent=B.head, coll=B.coll)
    cyl(name + "_hat2", 0.5, 0.55, (0, 0.05, 0.95), mat("chef_white", hexc("#fbfbf8"), 0.7), 24, bev=0.15, parent=B.head, coll=B.coll)
    return story._live(B, t0, t1, expr)


def grandpa(t0, t1, expr="smile", name="Grandpa"):
    G = chars.Char(name, skin="#f0d6bb", shirt="#8a5a3a", pants="#4a4f5a", hair="bald", face="mustache", sleeves="long",
                   extras=("glasses", "beard"), vneck="#e8dcc6")
    for sx in (-1, 1):                                   # white hair tufts
        sphere(f"{name}_tuft{sx}", 0.24, (sx * 0.58, 0.1, 0.25), mat("gp_hair", hexc("#f2f2f2"), 0.8), parent=G.head, coll=G.coll)
    return story._live(G, t0, t1, expr)


def mom(t0, t1, expr="happy", name="Mom"):
    return story._live(chars.Char(name, skin="#e8c7a4", shirt="#e8577a", pants="#4a3f6a", hair="bun", hair_color="#4a2a1c", face="girl",
                                  sleeves="long", extras=("glasses",)), t0, t1, expr)


def leo_mom(t0, t1, expr="worried"):
    return story._live(chars.Char("LeoMom", skin="#d9b48f", shirt="#2fa86a", pants="#3a3f5a", hair="bob", hair_color="#1d1714", face="girl",
                                  sleeves="long"), t0, t1, expr)


def rich_kid(i, t0, t1, expr="smug"):
    return story._live(chars.kid(i, shirt="#f2c14e", pants="#2a2d36", extras=("glasses:#101010",)), t0, t1, expr)


# ------------------------------------------------------------------ bracelet
def bracelet(ch, color=BLUE, nums=(), side="L", foil=False, size=0.34, name=None):
    """Band + screen on the wrist. nums = [(t, "99"), ...] screen readings (shown from t until the next). Returns dict."""
    n = (name or ch.name) + "_br" + side
    piv = ch.shL if side == "L" else ch.shR
    if foil:
        M = mat("foil", (0.9, 0.9, 0.95), 0.18, metal=1.0)
        band = box(n + "_band", (1.28, 1.28, 0.7), (0, 0, -1.2), M, 0.18, parent=piv, coll=ch.coll)
        box(n + "_crumple", (1.34, 1.0, 0.45), (0.05, -0.05, -1.2), M, 0.2, parent=piv, coll=ch.coll, rot=(8, 6, 12))
        return dict(band=band, screens=[])
    Mb = mat("br_band", hexc("#20232b"), 0.3, metal=0.4)
    band = box(n + "_band", (1.18, 1.18, 0.55), (0, 0, -1.2), Mb, 0.1, parent=piv, coll=ch.coll)
    Ms = mat("br_scr_" + color, hexc(color), 0.3, emit=hexc(color), estr=2.6)
    box(n + "_scr", (0.92, 0.1, 0.38), (0, -0.62, -1.2), Ms, 0.04, parent=piv, coll=ch.coll)
    screens = []
    Mt = mat("br_txt", (1, 1, 1), 0.3, emit=(1, 1, 1), estr=4.0)
    for i, (t, s) in enumerate(nums):
        ob = text(f"{n}_t{i}", s, (0, -0.69, -1.2), size, Mt, rot=(90, 0, 0), coll=ch.coll, font=FONT, parent=piv)
        end = nums[i + 1][0] if i + 1 < len(nums) else 1e6
        set_obj_visible(ob, max(0.0, t - 0.04), False)
        set_obj_visible(ob, t, True)
        if end < 1e5:
            set_obj_visible(ob, end - 0.04, True)
            set_obj_visible(ob, end, False)
        screens.append(ob)
    return dict(band=band, screens=screens)


def flash_light(name, loc, t0, t1, color=(1.0, 0.15, 0.1), peak=9000, rate=2.2, size=1.5, coll=None):
    """Blinking point light (energy keys) for alarms / tower beacon."""
    lt = light(name, "POINT", loc, 0, color, size, coll=coll)
    t = t0; on = True
    while t < t1:
        lt.data.energy = peak if on else 0
        lt.data.keyframe_insert("energy", frame=F(t))
        t += 0.5 / rate; on = not on
    return lt


def pulse_emit(ob, t, color, hi=14.0, lo=1.5, dur=0.25):
    """Keyframe an emission pulse on the first material of ob."""
    m = ob.data.materials[0]
    b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    s = b.inputs["Emission Strength"]
    for tt, v in ((t - 0.04, lo), (t, hi), (t + dur, lo)):
        s.default_value = v
        s.keyframe_insert("default_value", frame=F(tt))


def beacon_blink(ob, t0, t1, rate=2.0, hi=18.0, lo=0.2):
    m = ob.data.materials[0]
    b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    s = b.inputs["Emission Strength"]
    t = t0; on = True
    while t < t1:
        s.default_value = hi if on else lo
        s.keyframe_insert("default_value", frame=F(t))
        t += 0.5 / rate; on = not on


# ------------------------------------------------------------------ street
def building(name, cx, w, d, h, color, roof, facing, coll, sign=None, door=True, awning=None, sx=None):
    """Shop block. facing = +1 means its street facade faces +X (building on the west side), -1 faces -X."""
    c = coll
    fx = cx + facing * w / 2
    box(name, (w, d, h), (cx, 0, h / 2), mat(name + "_wall", hexc(color), 0.75), 0.15, coll=c)
    box(name + "_roof", (w + 1.0, d + 1.0, 1.0), (cx, 0, h + 0.5), mat(name + "_roofm", hexc(roof), 0.7), 0.2, coll=c)
    if sign:
        card(name + "_sign", 13.0, 4.5, (fx + facing * 0.12, 0, h - 3.2), sign_mat(sign, 0.5, 0.35), "+X" if facing > 0 else "-X", coll=c)
    if door:
        card(name + "_door", 3.6, 7.0, (fx + facing * 0.1, -3.0, 3.5), mat(name + "_doorm", hexc("#6e4229"), 0.6), "+X" if facing > 0 else "-X", coll=c)
    Mg = mat("shopglass", hexc("#bfe6ff"), 0.1, emit=hexc("#bfe6ff"), estr=0.6)
    card(name + "_win", 7.0, 5.0, (fx + facing * 0.11, 3.6, 4.2), Mg, "+X" if facing > 0 else "-X", coll=c)
    if awning:
        box(name + "_awn", (3.2, 13.0, 0.5), (fx + facing * 1.5, 0, 8.4), mat(name + "_awnm", hexc(awning), 0.6), 0.1, coll=c, rot=(0, facing * -12, 0))


def street(night=False, tower_light=True):
    """Main street along +Y: bakery (west), word bank (east), mayor's tower at the end. Ground z=0."""
    c = collection("STREET")
    if night:
        W.sky(0.12, top=(0.01, 0.02, 0.1), bottom=(0.05, 0.07, 0.2))
        W.sun(0.6, rot=(60, 0, 30))
    else:
        W.sky(1.0)
        W.sun(4.0, rot=(52, 0, 30))
    box("st_lawn", (400, 400, 0.4), (0, 40, -0.26), mat("grass", hexc("#5fb04a"), 0.9), 0, coll=c)
    box("st_road", (11, 300, 0.1), (0, 50, 0.02), mat("asphalt_day", hexc("#55565e"), 0.8), 0, coll=c)
    for k in range(14):
        box(f"st_dash{k}", (0.3, 3.0, 0.02), (0, -20 + k * 12, 0.09), mat("road_line", hexc("#f2ecd0"), 0.7), 0, coll=c)
    for sx in (-1, 1):
        box(f"st_walk{sx}", (4.0, 300, 0.3), (sx * 7.6, 50, 0.12), mat("sidewalk", hexc("#c9c4b8"), 0.85), 0.03, coll=c)
    building("bakery", BAKERY_X, 12, 24, 11, "#f2c98a", "#a33b2f", +1, c, sign="sign_bakery", awning="#d9603e")
    building("bank", BANK_X, 12, 24, 13, "#d8d4c4", "#2f6a4a", -1, c, sign="sign_wordbank", awning="#1c7a52")
    # columns on the bank
    for k, y in enumerate((-8, -3, 3, 8)):
        cyl(f"bank_col{k}", 0.6, 11, (BANK_X - 6.3, y, 5.5), mat("marble", hexc("#f4f2ec"), 0.4), 20, bev=0.05, coll=c)
    rnd = random.Random(5)
    cols = ["#e2725b", "#f2c14e", "#6fb3e0", "#9b8fd6", "#f0f0f0", "#8fd18c", "#f59bb5"]
    for k in range(10):
        for sx in (-1, 1):
            y = 22 + k * 15 + rnd.uniform(-2, 2); hh = rnd.uniform(8, 20)
            w_ = rnd.uniform(9, 13)
            x = sx * (11 + w_ / 2 + 2)
            box(f"st_h{k}{sx}", (w_, 11, hh), (x, y, hh / 2), mat("house" + cols[(k + sx) % 7], hexc(cols[(k * 2 + sx) % 7]), 0.7), 0.15, coll=c)
            box(f"st_hr{k}{sx}", (w_ + 1, 12, 1.0), (x, y, hh + 0.5), mat("roofc", hexc("#7a4a2a"), 0.7), 0.2, coll=c)
    # extra buildings behind the shops (x +-30..) for aerial shots
    for k in range(6):
        for sx in (-1, 1):
            hh = rnd.uniform(10, 26)
            box(f"st_b{k}{sx}", (14, 14, hh), (sx * (40 + rnd.uniform(0, 14)), -10 + k * 26, hh / 2), mat("hb" + str(k % 4), hexc(cols[(k + 3) % 7]), 0.7), 0.2, coll=c)
    for k in range(9):
        for sx in (-1, 1):
            sphere(f"st_tree{k}{sx}", 2.4, (sx * 10.2, -14 + k * 18, 3.6), mat("bush", hexc("#3f8f3a"), 0.9), (1, 1, 1.25), coll=c)
            cyl(f"st_trunk{k}{sx}", 0.3, 1.8, (sx * 10.2, -14 + k * 18, 0.9), mat("trunk", hexc("#6e4a2a"), 0.8), 10, coll=c)
    # mayor's tower
    tx, ty, _ = TOWER
    cyl("tw_base", 7.5, 6, (tx, ty, 3), mat("tw_stone", hexc("#8c8f9c"), 0.7), 8, bev=0.2, coll=c)
    cyl("tw_shaft", 5.2, 60, (tx, ty, 36), mat("tw_stone2", hexc("#a9acb8"), 0.7), 8, bev=0.2, coll=c, r2=4.2)
    cyl("tw_top", 7.0, 6, (tx, ty, 69), mat("tw_stone", hexc("#8c8f9c"), 0.7), 8, bev=0.2, coll=c)
    cyl("tw_roof", 6.2, 8, (tx, ty, 76), mat("tw_roof", hexc("#7a2230"), 0.5), 8, bev=0.1, coll=c, r2=0.4)
    card("tw_sign", 9.0, 3.0, (tx, ty - 7.55, 4.0), sign_mat("sign_tower", 0.5, 0.3), "-Y", coll=c)
    Mred = mat("beacon", hexc("#ff2a1a"), 0.3, emit=hexc("#ff2a1a"), estr=0.4)
    beacon = sphere("tw_beacon", 2.2, (tx, ty, 81.5), Mred, coll=c)
    for sx in (-1, 1):
        box(f"tw_win{sx}", (1.4, 0.3, 3.2), (tx + sx * 2.4, ty - 5.9, 69), mat("tw_glass", hexc("#ffe9a8"), 0.3, emit=hexc("#ffe9a8"), estr=2.0), 0.1, coll=c)
    return dict(coll=c, beacon=beacon)


def sign_post(loc, tex, facing="-Y", w=6.0, h=2.2, coll=None):
    cyl("sp_post1", 0.18, 6.5, (loc[0] - w * 0.38, loc[1], 3.25), mat("sp_wood", hexc("#6e4229"), 0.7), 8, coll=coll)
    cyl("sp_post2", 0.18, 6.5, (loc[0] + w * 0.38, loc[1], 3.25), mat("sp_wood", hexc("#6e4229"), 0.7), 8, coll=coll)
    box("sp_back", (w + 0.4, 0.25, h + 0.4), (loc[0], loc[1] + 0.2, 5.0), mat("sp_wood", hexc("#6e4229"), 0.7), 0.06, coll=coll)
    return card("sp_card", w, h, (loc[0], loc[1] + 0.05, 5.0), sign_mat(tex, 0.5, 0.2), facing, coll=coll)


# ------------------------------------------------------------------ interiors
def room(name, w=22, d=22, h=13, wall="#f0e0c0", floor=None, night=False, light_color=(1.0, 0.95, 0.85), energy=9000):
    """Closed room, floor z=0, centred on x=0, y 0..d (front wall y=0 is open to the camera: no wall there)."""
    c = collection(name)
    Mw = mat(name + "_wall", hexc(wall), 0.85)
    box(name + "_floor", (w + 2, d + 2, 0.4), (0, d / 2, -0.2), floor or planks(name + "_pl", "#b5764e", "#a86a44", "#5c3a27"), 0, coll=c)
    box(name + "_ceil", (w + 2, d + 2, 0.4), (0, d / 2, h + 0.2), mat(name + "_ceilm", hexc("#f4f0e8"), 0.9), 0, coll=c)
    box(name + "_back", (w + 2, 0.5, h), (0, d + 0.25, h / 2), Mw, 0, coll=c)
    box(name + "_wl", (0.5, d + 1, h), (-w / 2 - 0.25, d / 2, h / 2), Mw, 0, coll=c)
    box(name + "_wr", (0.5, d + 1, h), (w / 2 + 0.25, d / 2, h / 2), Mw, 0, coll=c)
    light(name + "_key", "AREA", (0, d * 0.45, h - 0.5), energy * (0.35 if night else 1), light_color, 12, coll=c, target=(0, d * 0.5, 0), size_y=12)
    light(name + "_fill", "AREA", (0, -4, h * 0.6), 2500 * (0.4 if night else 1), (1, 0.97, 0.92), 12, coll=c, target=(0, d * 0.5, 3), size_y=10)
    return c


def bakery_int():
    c = room("BKI", wall="#f2dca8")
    world((0.9, 0.8, 0.65), 0.35)
    Mwd = wood("wood_cab", "#6e4229", "#a06a45", 2.0)
    box("bk_counter", (14, 3.2, 3.8), (0, 13, 1.9), Mwd, 0.08, coll=c)
    box("bk_counter_top", (14.6, 3.6, 0.3), (0, 13, 3.95), mat("bk_top", hexc("#f4efe4"), 0.4), 0.05, coll=c)
    box("bk_shelf", (16, 1.6, 9), (0, 20.8, 4.5), Mwd, 0.1, coll=c)
    Mb = [mat("bread" + str(i), hexc(col), 0.7) for i, col in enumerate(("#d9953f", "#c47a2a", "#e8b25a", "#b86a2a"))]
    for r in range(3):
        for k in range(6):
            sphere(f"bk_bread{r}{k}", 0.75, (-6.2 + k * 2.4, 19.8, 2.0 + r * 2.8), Mb[(r + k) % 4], (1.4, 0.8, 0.7), coll=c)
    card("bk_sign", 9, 3.2, (0, 21.5, 11.2), sign_mat("sign_bakery", 0.5, 0.4), "-Y", coll=c)
    return c


def bank_int():
    c = room("BNI", wall="#d9e6d6", floor=tiles("bn_floor", "#e8e6dc", "#a8a89c", 0.35, 1.2, 1.2, 0.3, axis="XY"))
    world((0.8, 0.9, 0.8), 0.35)
    Mm = mat("marble", hexc("#f4f2ec"), 0.4)
    box("bn_counter", (16, 3.0, 4.0), (0, 12, 2.0), Mm, 0.08, coll=c)
    box("bn_glass", (16, 0.2, 4.5), (0, 13.6, 6.2), mat("bn_gl", hexc("#bfe6ff"), 0.05, alpha=0.25, spec=1.0), 0, coll=c)
    Mg = mat("coin_gold", hexc("#ffd23a"), 0.25, metal=0.9)
    for k in range(5):
        for j in range(3 + k % 3):
            cyl(f"bn_coin{k}{j}", 0.5, 0.18, (-5.5 + k * 2.6, 11.2, 4.2 + j * 0.2), Mg, 20, coll=c)
    card("bn_sign", 12, 4.2, (0, 21.4, 9.6), sign_mat("sign_wordbank", 0.5, 0.5), "-Y", coll=c)
    return c


def kitchen_int():
    c = room("KTI", wall="#f6d9c4", floor=tiles("kt_floor", "#e9e2d2", "#b8b0a0", 0.4, 1.4, 1.4, 0.35, axis="XY"))
    world((0.95, 0.88, 0.8), 0.35)
    Mw = wood("wood_light", "#9a6440", "#c58d5f", 2.0)
    box("kt_cab", (22, 2.6, 4.0), (0, 20.2, 2.0), Mw, 0.08, coll=c)
    box("kt_top", (22.4, 3.0, 0.3), (0, 20.2, 4.1), mat("kt_topm", hexc("#f2efe8"), 0.4), 0.05, coll=c)
    box("kt_up", (22, 1.6, 3.2), (0, 21.0, 9.6), Mw, 0.08, coll=c)
    box("kt_fridge", (3.6, 3.2, 9.0), (-8.2, 17.8, 4.5), mat("fridge", hexc("#e8eef2"), 0.3, metal=0.2), 0.15, coll=c)
    box("kt_table", (6.5, 4.0, 0.4), (4.5, 8.5, 3.0), Mw, 0.06, coll=c)
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(f"kt_tl{sx}{sy}", (0.3, 0.3, 3.0), (4.5 + sx * 2.8, 8.5 + sy * 1.6, 1.5), Mw, 0.03, coll=c)
    return c


def shower_int():
    c = room("SHI", w=14, d=14, h=13, wall="#bfe4f2", floor=tiles("sh_floor", "#d9eef6", "#9ab8c4", 0.4, 1.2, 1.2, 0.2, axis="XY"), energy=7000)
    world((0.8, 0.9, 1.0), 0.35)
    Mt = tiles("sh_tile", "#e8f6fb", "#a8c8d4", 0.8, 1.3, 1.3, 0.2, axis="XZ")
    box("sh_wall", (14, 0.3, 13), (0, 13.6, 6.5), Mt, 0, coll=c)
    cyl("sh_pipe", 0.22, 7, (0, 13.0, 8.0), mat("chrome", hexc("#d0d4da"), 0.15, metal=1.0), 12, coll=c)
    cyl("sh_head", 1.2, 0.35, (0, 12.0, 11.3), mat("chrome", hexc("#d0d4da"), 0.15, metal=1.0), 24, coll=c, rot=(70, 0, 0))
    Mwt = mat("water", (0.7, 0.88, 1.0), 0.05, alpha=0.4, emit=(0.5, 0.75, 1.0), estr=0.5)
    drops = []
    rnd = random.Random(2)
    for i in range(34):
        x, y = rnd.uniform(-1.0, 1.0), 12.0 + rnd.uniform(-0.8, 0.2)
        ob = cyl(f"sh_drop{i}", 0.07, 0.9, (x, y, 10.8), Mwt, 8, coll=c)
        drops.append((ob, x, y, rnd.random()))
    return c, drops


def animate_drops(drops, t0, t1, fall=10.2, period=0.28):
    for ob, x, y, ph in drops:
        t = t0 + ph * period
        while t < t1:
            ob.location = (x, y, 10.8); ob.keyframe_insert("location", frame=F(t))
            ob.location = (x, y, 10.8 - fall); ob.keyframe_insert("location", frame=F(t + period * 0.95))
            t += period
        set_interp(ob, "location", F(t0), "LINEAR")


def tower_room():
    c = room("TWI", w=22, d=22, h=14, wall="#2c3350", floor=planks("tw_pl", "#4a3a30", "#3f3028", "#1d140e"), night=True, light_color=(0.75, 0.82, 1.0))
    world((0.1, 0.12, 0.25), 0.25)
    Mw = wood("wood_dark", "#4a2f1e", "#6e4a30", 2.0)
    box("tr_desk", (12, 4.0, 3.6), (0, 14, 1.8), Mw, 0.08, coll=c)
    box("tr_btn_base", (3.2, 3.2, 0.6), (0, 13.2, 3.9), mat("btn_base", hexc("#2a2d33"), 0.4, metal=0.4), 0.1, coll=c)
    btn = cyl("tr_btn", 1.1, 0.7, (0, 13.2, 4.45), mat("btn_red", hexc("#ff2a1a"), 0.3, emit=hexc("#ff2a1a"), estr=1.5), 28, bev=0.1, coll=c)
    box("tr_window", (14, 0.3, 7), (0, 21.8, 7.5), mat("tw_sky", hexc("#7fb8ff"), 0.2, emit=hexc("#7fb8ff"), estr=1.6), 0.05, coll=c)
    card("tr_town", 12, 3, (0, 21.6, 5.4), mat("tw_town", hexc("#2a3a5a"), 0.8), "-Y", coll=c)
    return c, btn


def party_int():
    c = room("PTI", wall="#ffd6e8", floor=planks("pt_pl", "#c48a58", "#b87a48", "#5c3a27"), energy=11000)
    world((1.0, 0.9, 0.95), 0.4)
    card("pt_banner", 14, 2.4, (0, 21.2, 10.0), sign_mat("banner_bday", 0.5, 0.35), "-Y", coll=c)
    rnd = random.Random(3)
    for i in range(16):
        col = ["#e8574a", "#4aa5e8", "#f2c14e", "#63c06a", "#9b6ad6", "#ff9a3c"][i % 6]
        b = sphere(f"pt_balloon{i}", 0.9, (rnd.uniform(-9, 9), rnd.uniform(14, 20), rnd.uniform(8, 12.4)), mat("bal" + col, hexc(col), 0.25, coat=0.5), (1, 1, 1.15), coll=c)
        noise(b, "location", 2, 0.25, 40)
    box("pt_table", (8, 4, 0.4), (0, 14, 3.0), wood("wood_light", "#9a6440", "#c58d5f", 2.0), 0.06, coll=c)
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(f"pt_tl{sx}{sy}", (0.3, 0.3, 3.0), (sx * 3.5, 14 + sy * 1.6, 1.5), mat("pt_leg", hexc("#6e4229"), 0.6), 0.03, coll=c)
    cyl("pt_cake", 1.6, 1.2, (0, 14, 3.8), mat("cake", hexc("#fff0f5"), 0.6), 28, bev=0.1, coll=c)
    cyl("pt_cake2", 1.1, 0.8, (0, 14, 4.8), mat("cake_pink", hexc("#ff8fb8"), 0.6), 28, bev=0.1, coll=c)
    for k in range(5):
        a = k / 5 * math.tau
        cyl(f"pt_candle{k}", 0.07, 0.6, (math.cos(a) * 0.55, 14 + math.sin(a) * 0.55, 5.5), mat("candle", hexc("#7fd6ff"), 0.5), 8, coll=c)
        sphere(f"pt_flame{k}", 0.11, (math.cos(a) * 0.55, 14 + math.sin(a) * 0.55, 5.95), mat("flame", hexc("#ffb830"), 0.3, emit=hexc("#ffb830"), estr=8), (1, 1, 1.5), coll=c)
    return c


def bedroom_night():
    c = room("BDN", w=18, d=18, h=12, wall="#8fa0cc", floor=planks("bd_pl", "#7a5a3e", "#6a4c34", "#2a1a12"), night=True, light_color=(0.6, 0.7, 1.0), energy=6000)
    world((0.12, 0.15, 0.3), 0.22)
    box("bd_bed", (6, 9, 1.6), (4.5, 12, 0.8), mat("bd_bedm", hexc("#3a6aa8"), 0.7), 0.15, coll=c)
    box("bd_pillow", (4.2, 1.8, 0.7), (4.5, 15.8, 1.9), mat("bd_pil", hexc("#f2f2f6"), 0.7), 0.3, coll=c)
    box("bd_blanket", (6.1, 5.5, 0.9), (4.5, 10.2, 1.5), mat("bd_blk", hexc("#6a8fd0"), 0.8), 0.25, coll=c)
    box("bd_window", (5, 0.3, 6), (-3.5, 18.2, 7.5), mat("bd_night", hexc("#1b2450"), 0.4, emit=hexc("#2a3a7a"), estr=1.6), 0.05, coll=c)
    sphere("bd_moon", 0.9, (-3.2, 18.0, 8.6), mat("bd_moonm", hexc("#fff8d0"), 0.4, emit=hexc("#fff8d0"), estr=6.0), coll=c)
    return c
