"""bracelet: "In this town everyone gets exactly 100 words a day. A bracelet counts them." (word indices from audio/words.json)"""
from shotkit import *
from rbx import story, bw
from rbx.story import *
from rbx.bw import *
import math, random
from mathutils import Vector

V = Video(__file__)
story.bind(V)
CY = lambda *a, **k: None


# ------------------------------------------------------------------ helpers
def pop_text(name, body, loc, t, size=1.2, color="#ffffff", yaw=0.0, t_end=None, estr=6.0, rot_z=0.0):
    """Emissive floating text that pops in at t (and out at t_end)."""
    M = mat("pt_" + color + str(estr), hexc(color), 0.3, emit=hexc(color), estr=estr)
    ob = text(name, body, loc, size, M, rot=(90, 0, yaw + rot_z), font=bw.FONT, extrude=0.04)
    s = size
    set_obj_visible(ob, t - 0.04, False)
    set_obj_visible(ob, t, True)
    ob.scale = (0.2, 0.2, 0.2); ob.keyframe_insert("scale", frame=F(t))
    ob.scale = (1.25, 1.25, 1.25); ob.keyframe_insert("scale", frame=F(t + 0.1))
    ob.scale = (1, 1, 1); ob.keyframe_insert("scale", frame=F(t + 0.2))
    if t_end:
        set_obj_visible(ob, t_end - 0.04, True)
        set_obj_visible(ob, t_end, False)
    return ob


def walkers(t0, t1, n, seed=1, y0=30.0, y1=-12.0, spread=(-9.0, 9.0), rate=2.4, toward=True, bands=True, face_cam=True):
    rnd = random.Random(seed)
    out = []
    for i in range(n):
        k = townie(100 + seed * 10 + i, t0, t1)
        x = rnd.uniform(*spread)
        a, b = (y0 + rnd.uniform(-6, 6), y1 + rnd.uniform(-4, 4)) if toward else (y1, y0)
        rot = 0 if toward else 180
        k.walk(t0, t1, (x, a, 0), (x + rnd.uniform(-1.5, 1.5), b, 0), rate=rate * rnd.uniform(0.9, 1.1), face_dir=False)
        k.pose(t0, rot=rot)
        if bands:
            bw.bracelet(k, rnd.choice([BLUE, BLUE, "#35e07a", "#f2c14e", "#ff7ab8"]))
        out.append(k)
    return out


def stand(ch, loc, rot=0.0, t=0.0, **kw):
    ch.pose(t, loc=loc, rot=rot, **kw)
    return ch


def hold_up(ch, t, side="armL", fwd=100, out=-8, settle=0.25):
    """Raise the wrist toward the camera."""
    ch.pose(t, **{side: (fwd * 1.1, out)})
    ch.pose(t + settle, **{side: (fwd, out)})


def phone(ch, side="R"):
    obj = box(ch.name + "_phone", (0.5, 0.2, 0.9), (0, 0, 0), mat("phone_dark", hexc("#2a2d33"), 0.3), 0.05, coll=ch.coll)
    box(ch.name + "_phone_s", (0.4, 0.05, 0.75), (0, -0.12, 0), mat("phone_scr", hexc("#7fd6ff"), 0.3, emit=hexc("#7fd6ff"), estr=2.5), 0.02, parent=obj, coll=ch.coll)
    return locs_hand(ch, side, obj, (0, -0.6, -1.5))


def locs_hand(ch, side, obj, off):
    from rbx import locs
    return locs.hand_prop(ch, side, obj, off)


def shoes(loc):
    Ms = mat("shoe_red", hexc("#d9453a"), 0.5)
    for sx in (-1, 1):
        box(f"shoe{sx}", (1.1, 2.2, 0.9), (loc[0] + sx * 0.9, loc[1], loc[2] + 0.45), Ms, 0.25)
        box(f"sole{sx}", (1.15, 2.25, 0.25), (loc[0] + sx * 0.9, loc[1], loc[2] + 0.12), mat("sole", hexc("#f4f4f4"), 0.5), 0.05)


def table(loc, size=(8, 5), h=3.0, color="#9a6440"):
    M = wood("wood_light", color, "#c58d5f", 2.0)
    box("tbl_top", (size[0], size[1], 0.4), (loc[0], loc[1], h), M, 0.06)
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(f"tbl_l{sx}{sy}", (0.3, 0.3, h), (loc[0] + sx * (size[0] / 2 - 0.4), loc[1] + sy * (size[1] / 2 - 0.4), h / 2), M, 0.03)


def tick_nums(ch, t0, values, step, color=BLUE, side="L"):
    return bw.bracelet(ch, color, [(t0 + i * step, str(v)) for i, v in enumerate(values)], side)


def flash(t, color=(1.0, 0.1, 0.05), loc=(0, -3, 6), peak=14000, n=3, step=0.14):
    lt = light("flash_%d" % int(t * 100), "POINT", loc, 0, color, 2.0)
    for i in range(n):
        for dt, e in ((0, peak), (step * 0.5, 0)):
            lt.data.energy = e
            lt.data.keyframe_insert("energy", frame=F(t + i * step + dt))
    return lt


def cam_street(t0, t1, tgt, d0, d1, yaw=0, pitch=6, lens=28, yaw1=None, shake=1.0, fstop=3.2):
    cam = Cam()
    cam.push(t0, t1, tgt, d0, d1, yaw=yaw, pitch=pitch, lens=lens, yaw1=yaw1, fstop=fstop)
    cam.handheld(shake)
    return cam


# ================================================================== SHOTS
# ---- 1  In this town, everyone gets exactly 100 words a day.
@S(1, 0, 3, "HOOK: low fast dolly down the street, everyone walking, blue bracelets")
def s01(t0, t1):
    street()
    walkers(t0, t1, 9, seed=1, y0=26, y1=-14)
    cam = Cam()
    cam.key(t0, (-4, -22, 1.8), (1, 12, 4.0), lens=20, focus=24.0, fstop=6)
    cam.key(t1, (1.5, -2, 3.2), (0, 22, 4.2), lens=24, focus=14.0, fstop=6, ease="EASE_OUT")
    cam.crash(t0 + 0.05, 14, 22, 0.35)
    cam.handheld(1.4)
    sfx(t0 + 0.02, "whoosh", 0.9)


@S(2, 3, 7, "Ben raises his wrist: '100' glows")
def s02(t0, t1):
    street()
    B = ben(t0, t1, "happy")
    stand(B, (0, -4, 0), 0)
    tick_nums(B, 0.0, [100], 1.0)
    B.pose(t0, armL=(10, 15))
    ta = w(5) - 0.05
    hold_up(B, ta, "armL", 98, -6)
    B.look(ta, 0, 12)
    pop_text("h100", "100", (1.2, -8, 6.6), w(6), 1.6, "#6fb3ff", estr=7)
    cam = cam_street(t0, t1, (0.3, -4.4, 4.0), 6.8, 4.2, yaw=-18, pitch=4, lens=28, yaw1=16)
    cam.crash(ta, 28, 38, 0.1)
    sfx(ta, "ustinger", 0.7)
    sfx(w(6), "uping", 0.8)


@S(3, 7, 10, "kids chatting: words fly")
def s03(t0, t1):
    street()
    ks = []
    for i, (x, ro) in enumerate(((-3.0, 25), (0.0, 0), (3.0, -25))):
        k = townie(30 + i, t0, t1, "happy")
        stand(k, (x, -4 + abs(x) * 0.2, 0), ro + (180 if False else 0))
        bw.bracelet(k, BLUE)
        lips(k, t0, t1)
        k.act(t0, "shrug", 0.6)
        ks.append(k)
    for j, txt in enumerate(("blah", "bla bla", "chat!")):
        pop_text(f"bub{j}", txt, (-3 + j * 3, -6, 8.4 + (j % 2) * 0.9), t0 + 0.2 + j * 0.28, 0.8, "#ffffff", estr=3)
    cam = cam_street(t0, t1, (0, -4, 4.4), 10.0, 6.6, yaw=0, pitch=5, lens=26, yaw1=-14)
    sfx(t0, "chat", 0.8)


@S(4, 10, 14, "macro: the bracelet counts down")
def s04(t0, t1):
    street()
    B = ben(t0, t1, "neutral")
    stand(B, (0, -4, 0), 0)
    B.pose(t0, armL=(95, -8))
    ts = [t0 + 0.25, w(12) + 0.05, w(12) + 0.5, w(13) + 0.1]
    bw.bracelet(B, BLUE, [(0.0, "100"), (ts[1], "99"), (ts[2], "98"), (ts[3], "97")])
    B.look(t0, 0, 40)
    cam = Cam()
    cam.push(t0, t1, (1.5, -5.5, 4.6), 4.2, 2.2, yaw=-30, pitch=40, lens=40, yaw1=-10, fstop=2.0)
    cam.handheld(0.8)
    for tt in ts[1:]:
        sfx(tt, "uping", 0.8)


@S(5, 14, 17, "Mine is blue: Ben shows off")
def s05(t0, t1):
    street()
    B = ben(t0, t1, "smug")
    stand(B, (0, -4, 0), 0)
    bw.bracelet(B, BLUE, [(0.0, "100")])
    B.pose(t0, armL=(20, 20))
    hold_up(B, w(15), "armL", 105, -6)
    flash(w(16) - 0.1, (0.3, 0.5, 1.0), (1.5, -8, 5), 9000, 2, 0.2)
    cam = cam_street(t0, t1, (0.6, -4.5, 4.6), 6.2, 3.8, yaw=14, pitch=2, lens=30, yaw1=-12)
    sfx(w(16) - 0.1, "uchime", 0.8)


@S(6, 17, 19, "I'm Ben")
def s06(t0, t1):
    street()
    B = ben(t0, t1, "grin")
    stand(B, (0, -4, 0), 0)
    bw.bracelet(B, BLUE, [(0.0, "100")])
    B.act(t0, "wave")
    lips(B, t0, t1)
    cam = cam_street(t0, t1, (0, -4.6, 4.0), 5.0, 3.6, yaw=-8, pitch=0, lens=32, yaw1=8)
    cam.crash(t0, 32, 40, 0.1)
    sfx(t0, "pop", 0.6)


@S(7, 19, 22, "I'm 9")
def s07(t0, t1):
    street()
    B = ben(t0, t1, "happy")
    stand(B, (0, -4, 0), 0)
    bw.bracelet(B, BLUE, [(0.0, "100")])
    B.act(t0, "cheer", 0.8)
    pop_text("h9", "9", (-2.6, -7, 6.2), w(20), 2.4, "#ffd23a", estr=7)
    cam = cam_street(t0, t1, (0, -4.6, 4.2), 5.6, 4.0, yaw=24, pitch=-2, lens=26, yaw1=-10)
    sfx(w(20), "pop", 0.8)


@S(8, 22, 25, "counting on fingers")
def s08(t0, t1):
    street()
    B = ben(t0, t1, "neutral")
    stand(B, (0, -4, 0), 0)
    bw.bracelet(B, BLUE, [(0.0, "98")])
    B.pose(t0, armR=(80, -10))
    B.look(t0, 0, 32)
    for i in range(5):
        pop_text(f"c{i}", str(i + 1), (-2.2 + i * 1.1, -6.4, 7.0), t0 + 0.35 + i * 0.28, 0.95, "#ffffff", estr=4)
    cam = cam_street(t0, t1, (0, -4.6, 4.4), 4.6, 3.4, yaw=-10, pitch=18, lens=32, yaw1=10)
    for i in range(5):
        sfx(t0 + 0.35 + i * 0.28, "uclick", 0.6)


@S(9, 25, 28, "eyes: sus, thinking")
def s09(t0, t1):
    street()
    B = ben(t0, t1, "sus")
    stand(B, (0, -4, 0), 0)
    bw.bracelet(B, BLUE, [(0.0, "97")])
    B.look(t0, 20, 6)
    B.look(w(27) - 0.1, -20, 6)
    cam = Cam()
    cam.push(t0, t1, (0, -4.62, 4.5), 3.4, 2.5, yaw=-6, pitch=0, lens=36, yaw1=6)
    cam.handheld(0.8)


@S(10, 28, 33, "Rich kids strut with golden bags")
def s10(t0, t1):
    street()
    kk = []
    for i in range(3):
        k = bw.rich_kid(i, t0, t1)
        k.walk(t0, t1, (-6 + i * 5.2, 14 + i * 2, 0), (-5 + i * 5.0, -6 + i * 1.0, 0), rate=2.2, face_dir=False)
        k.pose(t0, rot=0)
        bw.bracelet(k, "#ffd23a")
        bag = box(f"bag{i}", (1.3, 0.5, 1.5), (0, 0, 0), mat("gold_bag", hexc("#ffd23a"), 0.25, metal=0.8), 0.15, coll=k.coll)
        locs_hand(k, "R", bag, (0, -0.7, -1.7))
        kk.append(k)
    cam = Cam()
    cam.track(kk[1], t0, t1, offset=(-5.5, -9, 1.6), look_up=4.2, lens=26)
    cam.handheld(0.9)
    sfx(w(30), "coin", 0.8)
    sfx(w(31) + 0.2, "coin", 0.7)


@S(11, 33, 37, "at the WORD BANK")
def s11(t0, t1):
    street()
    for i in range(5):
        k = bw.rich_kid(i + 5, t0, t1, "smile") if i % 2 == 0 else townie(50 + i, t0, t1, "happy")
        k.walk(t0, t1, (8 + i * 0.6, -26 + i * 1.5, 0), (8.5, 0 + i * 2.0 - 6, 0), rate=2.0, face_dir=False)
        k.pose(t0, rot=-90)
        bw.bracelet(k, BLUE)
    cam = Cam()
    cam.push(t0, t1, (BANK_X - 6, -3, 6.0), 40, 28, yaw=-72, pitch=8, lens=24, yaw1=-60, fstop=8)
    cam.handheld(0.9)
    sfx(w(35), "cashier", 0.8)


@S(12, 37, 42, "Leo bought 200")
def s12(t0, t1):
    street()
    L = story.leo(t0, t1, "smug")
    stand(L, (0, -4, 0), 0)
    bw.bracelet(L, "#35e07a", [(0.0, "200")])
    L.pose(t0, armL=(10, 15))
    hold_up(L, w(40), "armL", 100, -6)
    pop_text("h200", "200", (2.0, -8, 8.2), w(41), 1.6, "#35e07a", estr=7)
    cam = cam_street(t0, t1, (0.4, -4.6, 4.4), 6.8, 4.0, yaw=-16, pitch=3, lens=28, yaw1=14)
    cam.crash(w(41), 28, 38, 0.1)
    sfx(w(40), "coin", 0.9)
    sfx(w(41), "uding", 0.8)


@S(13, 42, 47, "He talks like a radio")
def s13(t0, t1):
    street()
    L = story.leo(t0, t1, "shout")
    stand(L, (0, -4, 0), 0)
    bw.bracelet(L, "#35e07a", [(0.0, "199")])
    L.talk(t0, t1, open_m="talk_wide", wide_m="scream", rest="grimace", syll=0.09)
    L.act(t0, "point", 0.7)
    rad = box("radio", (2.4, 0.9, 1.6), (4.5, -4, 1.0), mat("radio_b", hexc("#2a2d33"), 0.4), 0.2)
    for sx in (-1, 1):
        cyl(f"radio_sp{sx}", 0.45, 0.1, (4.5 + sx * 0.6, -4.5, 1.0), mat("radio_c", hexc("#9a9fa8"), 0.4, metal=0.6), 20, rot=(90, 0, 0))
    cyl("radio_ant", 0.04, 2.2, (5.4, -4, 2.9), mat("chrome", hexc("#d0d4da"), 0.15, metal=1.0), 8, rot=(0, 18, 0))
    for j in range(3):
        pop_text(f"w{j}", ("BLAH", "BLAH", "BLAH")[j], (-3.4 + j * 3.2, -6, 8.2 - (j % 2) * 0.9), t0 + 0.5 + j * 0.45, 0.95, "#ffffff", estr=4)
    cam = cam_street(t0, t1, (0.5, -4.6, 4.2), 6.0, 4.2, yaw=24, pitch=2, lens=26, yaw1=-8, shake=1.6)
    sfx(w(44), "uduck", 0.9)


@S(14, 47, 51, "At zero: the counter hits 0")
def s14(t0, t1):
    street()
    B = ben(t0, t1, "worried")
    stand(B, (0, -4, 0), 0)
    bw.bracelet(B, RED, [(0.0, "3"), (w(47) + 0.2, "2"), (w(48) + 0.3, "1"), (w(49) - 0.1, "0")])
    B.pose(t0, armL=(100, -8))
    B.look(t0, 0, 38)
    cam = Cam()
    cam.push(t0, t1, (1.3, -5.6, 4.6), 3.6, 1.7, yaw=-28, pitch=42, lens=40, fstop=2.0, yaw1=-8)
    cam.handheld(1.2)
    sfx(w(47), "urise", 0.8)
    for tt in (w(47) + 0.2, w(48) + 0.3):
        sfx(tt, "uping", 0.8)


@S(15, 51, 53, "BZZZ: bracelet buzzes loud")
def s15(t0, t1):
    street()
    B = ben(t0, t1, "scream")
    stand(B, (0, -4, 0), 0)
    bw.bracelet(B, RED, [(0.0, "0")])
    B.pose(t0, armL=(100, -8))
    for i in range(8):
        B.pose(t0 + i * 0.07, armL=(100 + (6 if i % 2 else -6), -8 + (4 if i % 2 else -4)))
    flash(t0, (1, 0.1, 0.05), (1, -8, 5), 16000, 7, 0.14)
    cam = Cam()
    cam.push(t0, t1, (1.0, -5.0, 4.7), 5.0, 3.0, yaw=-14, pitch=8, lens=30)
    cam.handheld(3.0)
    cam.crash(t0, 30, 42, 0.08)
    sfx(t0, "buzzer", 1.0)
    sfx(t0 + 0.3, "alarm", 0.5)


@S(16, 53, 56, "everyone stares")
def s16(t0, t1):
    street()
    rnd = random.Random(8)
    for r in range(2):
        for i in range(6):
            k = townie(60 + r * 6 + i, t0, t1, "side_l")
            stand(k, (-8.0 + i * 3.2 + r * 1.2, -2.0 - r * 3.2, 0), 180 if False else 0)
            k.face(t0 + 0.05, "sus")
            look_at(k, t0 + 0.1, (0, -30, 4.5))
            bw.bracelet(k, BLUE)
    B = ben(t0, t1, "terror")
    stand(B, (0, -9, 0), 180)
    cam = Cam()
    cam.push(t0, t1, (0, -2, 4.4), 17, 12.0, yaw=0, pitch=4, lens=24, yaw1=-8)
    cam.handheld(1.0)
    sfx(w(54), "ufaah", 0.7)
    sfx(t0, "gasp", 0.6)


@S(17, 56, 60, "Grandpa says it wasn't always like this")
def s17(t0, t1):
    street()
    G = bw.grandpa(t0, t1, "smile")
    stand(G, (3, -4, 0), -20)
    G.act(t0, "idle")
    lips(G, t0, t1)
    G.act(w(58), "point", 0.5)
    cam = cam_street(t0, t1, (3, -4.6, 4.2), 7.0, 4.2, yaw=-6, pitch=3, lens=28, yaw1=14)


@S(18, 60, 63, "Ben listens")
def s18(t0, t1):
    street()
    B = ben(t0, t1, "happy")
    stand(B, (-2, -4, 0), 25)
    G = bw.grandpa(t0, t1, "smile")
    stand(G, (3, -4, 0), -25)
    bw.bracelet(B, BLUE, [(0.0, "96")])
    B.act(w(61), "think", 0.7)
    from rbx.acting import nod
    nod(B, w(61), 2)
    cam = cam_street(t0, t1, (0.5, -4.6, 4.6), 8.0, 5.0, yaw=8, pitch=3, lens=26, yaw1=-12)


@S(19, 63, 67, "FLASHBACK: bakery, grandpa and baker")
def s19(t0, t1):
    bw.bakery_int()
    G = bw.grandpa(t0, t1, "happy", "GrandpaY")
    stand(G, (-2.2, 9.5, 0), 150)
    Bk = bw.baker(t0, t1, "smile")
    stand(Bk, (2.4, 14.2, 0), 0)
    lips(G, t0, t1)
    cam = Cam()
    cam.push(t0, t1, (0, 12, 4.6), 13, 9.5, yaw=-18, pitch=4, lens=24, yaw1=-4)
    cam.handheld(0.9)
    sfx(t0, "sparkle", 0.6)
    sfx(t0 - 0.1, "whoosh", 0.7)


@S(20, 67, 72, "he talked to the baker for an hour")
def s20(t0, t1):
    bw.bakery_int()
    G = bw.grandpa(t0, t1, "happy", "GrandpaY")
    stand(G, (-2.2, 9.5, 0), 150)
    Bk = bw.baker(t0, t1, "smile")
    stand(Bk, (2.4, 14.2, 0), 0)
    lips(G, t0, t1)
    Bk.act(w(69), "shrug", 0.6)
    Bk.talk(w(70), t1)
    cam = Cam()
    cam.orbit(t0, t1, (0, 12, 4.6), 12, -34, 8, pitch=4, lens=24, fstop=6)
    cam.handheld(0.7)


@S(21, 72, 77, "every day: calendar flips")
def s21(t0, t1):
    world((0.1, 0.1, 0.2), 0.2)
    light("cal_key", "AREA", (0, -6, 8), 1500, (1, 0.95, 0.85), 8, target=(0, 0, 4))
    box("cal_bg", (20, 0.4, 24), (0, 3, 6), mat("cal_bgm", hexc("#2a3a5a"), 0.7), 0.05)
    for i in range(4):
        tt = t0 + 0.25 + i * 1.0
        pg = box(f"cal_pg{i}", (8, 0.3, 8), (0, 0.2 - i * 0.02, 5), mat("cal_page", hexc("#cfc6b0"), 0.7), 0.1)
        set_obj_visible(pg, tt - 0.04, False); set_obj_visible(pg, tt, True)
        pop_text(f"cal_t{i}", f"DAY {i + 1}", (0, -0.2 - i * 0.02, 5.0), tt, 1.7, "#d02a2a", estr=1.5)
    for i in range(4):
        pass
    cam = Cam()
    cam.push(t0, t1, (0, 0, 5), 14, 9, yaw=-12, pitch=2, lens=28, yaw1=10, fstop=8)
    cam.handheld(1.0)
    for i in range(4):
        sfx(t0 + 0.25 + i * 1.0, "paper", 0.7)


@S(22, 77, 83, "complained about the mayor's tower: hero tower")
def s22(t0, t1):
    st = street()
    for k in range(4):
        pass
    cam = Cam()
    cam.key(t0, (-6, -10, 3), (0, 95, 40), lens=22, focus=105.0, fstop=11)
    cam.key(t1, (3, 30, 6), (0, 95, 62), lens=24, focus=70.0, fstop=11, ease="EASE_IN_OUT")
    cam.handheld(0.8)
    bw.beacon_blink(st["beacon"], t0, t1, 1.2)
    sfx(t0, "whoosh", 0.6)


@S(23, 83, 88, "they laughed a lot")
def s23(t0, t1):
    bw.bakery_int()
    G = bw.grandpa(t0, t1, "joy", "GrandpaY")
    stand(G, (-2.2, 9.5, 0), 150)
    story.laugh(G, t0, t1, flail=False)
    Bk = bw.baker(t0, t1, "joy")
    stand(Bk, (2.4, 14.2, 0), 0)
    story.laugh(Bk, t0, t1, flail=False)
    cam = Cam()
    cam.push(t0, t1, (0, 12, 4.6), 12, 8.0, yaw=-16, pitch=3, lens=24, yaw1=-2)
    cam.handheld(1.4)
    sfx(t0, "kids_laugh", 0.6)


@S(24, 88, 92, "The mayor's sign says")
def s24(t0, t1):
    street()
    M = story.mayor(t0, t1, "smug")
    stand(M, (3.0, -6, 0), -10)
    M.act(t0, "cross", 0.8)
    lips(M, t0, t1)
    sign_post((-3.0, -4, 0), "sign_save", "-Y", 7.0, 2.6)
    cam = cam_street(t0, t1, (0, -5.5, 4.4), 12, 8.0, yaw=-10, pitch=3, lens=24, yaw1=10)
    sfx(t0, "whoosh", 0.6)


@S(25, 92, 98, "WORDS RUN OUT, SO SAVE THEM")
def s25(t0, t1):
    street()
    sign_post((0, -4, 0), "sign_save", "-Y", 7.0, 2.6)
    cam = Cam()
    cam.push(t0, t1, (0, -4.0, 5.0), 11, 6.2, yaw=0, pitch=0, lens=26, yaw1=6, fstop=8)
    cam.handheld(0.8)
    cam.crash(t0, 26, 34, 0.12)
    sfx(t0, "ustinger", 0.8)
    sfx(w(95), "boom", 0.6)


@S(26, 98, 103, "But mom talks all day")
def s26(t0, t1):
    bw.kitchen_int()
    M = bw.mom(t0, t1, "joy")
    stand(M, (0, 11, 0), 0)
    lips(M, t0, t1)
    M.act(t0, "wave", 0.8)
    for j in range(3):
        pop_text(f"mt{j}", ("yak", "yak yak", "yak!")[j], (-4 + j * 4, 8.5, 8.6 - (j % 2) * 0.8), t0 + 0.3 + j * 0.45, 0.8, "#ffffff", estr=3)
    cam = Cam()
    cam.orbit(t0, t1, (0, 11, 4.2), 9, 22, -22, pitch=3, lens=26, fstop=6)
    cam.handheld(1.0)
    sfx(t0, "uquack", 0.7)


@S(27, 103, 107, "She calls grandma")
def s27(t0, t1):
    bw.kitchen_int()
    M = bw.mom(t0, t1, "happy")
    stand(M, (0, 11, 0), 0)
    ph = phone(M, "R")
    M.pose(t0, armR=(150, -12))
    lips(M, t0, t1)
    cam = Cam()
    cam.push(t0, t1, (0, 10.6, 4.6), 6.5, 4.2, yaw=-12, pitch=2, lens=30, yaw1=10)
    cam.handheld(1.0)
    sfx(t0, "chat", 0.8)


@S(28, 107, 111, "...and sings in the shower")
def s28(t0, t1):
    c, drops = bw.shower_int()
    M = bw.mom(t0, t1, "joy")
    stand(M, (0, 9.5, 0), 0)
    M.act(t0, "cheer", 0.7)
    M.talk(t0, t1, open_m="laugh", wide_m="open_smile", rest="open_smile", syll=0.2)
    bw.animate_drops(drops, t0, t1)
    for j, tx in enumerate(("LA", "LA", "LAAA")):
        pop_text(f"sing{j}", tx, (-3.2 + j * 3.2, 7.5, 7.8 + (j % 2) * 1.2), t0 + 0.3 + j * 0.5, 1.0, "#ffd23a", estr=4)
    cam = Cam()
    cam.push(t0, t1, (0, 9.5, 4.8), 8.5, 5.2, yaw=14, pitch=2, lens=26, yaw1=-12)
    cam.handheld(1.2)
    sfx(t0, "sparkle", 0.6)


@S(29, 111, 116, "Her bracelet still says 71")
def s29(t0, t1):
    bw.kitchen_int()
    M = bw.mom(t0, t1, "happy")
    stand(M, (0, 11, 0), 0)
    bw.bracelet(M, BLUE, [(0.0, "71")], size=0.38)
    M.pose(t0, armL=(100, -8))
    cam = Cam()
    cam.push(t0, t1, (1.4, 9.6, 4.6), 4.0, 1.9, yaw=-24, pitch=40, lens=40, yaw1=-6, fstop=2.0)
    cam.handheld(0.8)
    cam.crash(w(115), 40, 52, 0.1)
    sfx(w(115), "uding", 0.9)


@S(30, 116, 118, "Weird thing.")
def s30(t0, t1):
    street()
    B = ben(t0, t1, "sus")
    stand(B, (0, -4, 0), 0)
    bw.bracelet(B, BLUE, [(0.0, "96")])
    B.look(t0, 0, 4)
    cam = Cam()
    cam.push(t0, t1, (0, -4.62, 4.5), 3.2, 2.3, yaw=8, pitch=-2, lens=38)
    cam.handheld(0.9)
    cam.crash(t0, 38, 50, 0.08)
    sfx(t0, "uquack", 0.6)


@S(31, 118, 121, "My bracelet buzzes")
def s31(t0, t1):
    street()
    B = ben(t0, t1, "worried")
    stand(B, (0, -4, 0), 0)
    bw.bracelet(B, BLUE, [(0.0, "96")])
    B.pose(t0, armL=(100, -8))
    B.look(t0, 0, 36)
    cam = Cam()
    cam.push(t0, t1, (1.3, -5.6, 4.6), 3.8, 2.2, yaw=-26, pitch=38, lens=40, yaw1=-6, fstop=2.0)
    cam.handheld(1.0)


@S(32, 121, 124, "when the mayor's light blinks: beacon")
def s32(t0, t1):
    st = street()
    bw.beacon_blink(st["beacon"], t0, t1, 2.4)
    cam = Cam()
    cam.key(t0, (4, 62, 60), (0, 95, 76), lens=40, focus=45.0, fstop=8)
    cam.key(t1, (3, 70, 66), (0, 95, 80), lens=40, focus=32.0, fstop=8)
    cam.handheld(1.2)
    sfx(t0 + 0.05, "uping", 0.9)
    sfx(t0 + 0.30, "uping", 0.9)
    sfx(t0 + 0.55, "uping", 0.9)


@S(33, 124, 126, "...and the bracelet buzzes red")
def s33(t0, t1):
    street()
    B = ben(t0, t1, "scream")
    stand(B, (0, -4, 0), 0)
    bw.bracelet(B, RED, [(0.0, "96")])
    for i in range(6):
        B.pose(t0 + i * 0.07, armL=(100 + (6 if i % 2 else -6), -8))
    flash(t0, (1, 0.1, 0.05), (1, -8, 5), 14000, 4, 0.14)
    cam = Cam()
    cam.push(t0, t1, (1.3, -5.6, 4.6), 3.0, 2.0, yaw=-20, pitch=36, lens=40, fstop=2.0)
    cam.handheld(3.2)
    sfx(t0, "buzzer", 0.9)


@S(34, 126, 130, "Not when I talk: calm green")
def s34(t0, t1):
    street()
    B = ben(t0, t1, "happy")
    stand(B, (0, -4, 0), 0)
    bw.bracelet(B, "#35e07a", [(0.0, "95")])
    lips(B, t0, t1)
    B.act(t0, "shrug", 0.6)
    cam = cam_street(t0, t1, (0, -4.5, 4.4), 5.8, 4.0, yaw=16, pitch=2, lens=28, yaw1=-12)
    sfx(w(127), "uclick", 0.7)


@S(35, 130, 132, "I checked")
def s35(t0, t1):
    street()
    B = ben(t0, t1, "determined")
    stand(B, (0, -4, 0), 0)
    bw.bracelet(B, BLUE, [(0.0, "95")])
    pad = box("pad", (0.9, 0.12, 1.2), (0, 0, 0), mat("pad_y", hexc("#f2e08a"), 0.6), 0.05, coll=B.coll)
    locs_hand(B, "R", pad, (0, -0.7, -1.5))
    B.pose(t0, armR=(95, -8))
    B.look(t0, 20, 25)
    cam = cam_street(t0, t1, (0, -4.6, 4.3), 5.0, 3.6, yaw=-14, pitch=10, lens=30, yaw1=10)
    sfx(t0, "click", 0.6)


@S(36, 132, 134, "three times: tallies")
def s36(t0, t1):
    world((0.12, 0.14, 0.25), 0.25)
    light("t_key", "AREA", (0, -8, 10), 9000, (1, 0.97, 0.9), 8, target=(0, 0, 5))
    box("t_bg", (30, 0.5, 30), (0, 4, 6), mat("t_bgm", hexc("#2a3a5a"), 0.8), 0.05)
    for i in range(3):
        pop_text(f"tal{i}", str(i + 1), (-3.4 + i * 3.4, 0, 5.2), t0 + 0.06 + i * 0.3, 2.6, "#35e07a", estr=6)
        sfx(t0 + 0.06 + i * 0.3, "uding", 0.7)
    cam = Cam()
    cam.push(t0, t1, (0, 0, 5.2), 14, 9, yaw=0, pitch=0, lens=28, fstop=8)
    cam.handheld(1.0)


@S(37, 134, 138, "Then the word bank put up")
def s37(t0, t1):
    street()
    for i in range(3):
        k = townie(80 + i, t0, t1, "happy")
        stand(k, (BANK_X - 12 + i * 2.5, -7 + i * 2.5, 0), -90)
        k.act(t0, "reach", 0.7)
    cam = Cam()
    cam.push(t0, t1, (BANK_X - 6.5, -2, 6.5), 22, 14, yaw=-62, pitch=8, lens=26, yaw1=-40, fstop=8)
    cam.handheld(1.0)
    sfx(w(136), "hammer", 0.8)
    sfx(w(137) + 0.1, "hammer", 0.7)


@S(38, 138, 142, "a sign")
def s38(t0, t1):
    street()
    s = sign_post((BANK_X - 14, -6, 0), "sign_double", "-Y", 7.0, 2.8)
    s.location = (BANK_X - 14, -6, 5.0 + 6)
    s.keyframe_insert("location", frame=F(t0))
    s.location = (BANK_X - 14, -6, 5.0)
    s.keyframe_insert("location", frame=F(t0 + 1.2))
    cam = Cam()
    cam.push(t0, t1, (BANK_X - 14, -6, 5), 15, 9, yaw=-12, pitch=-4, lens=26, yaw1=-24, fstop=8)
    cam.handheld(1.0)
    sfx(t0 + 1.1, "thud", 0.8)


@S(39, 142, 145, "WORDS COST DOUBLE!")
def s39(t0, t1):
    street()
    sign_post((0, -5, 0), "sign_double", "-Y", 7.0, 2.8)
    cam = Cam()
    cam.push(t0, t1, (0, -5, 5), 14, 6.8, yaw=0, pitch=0, lens=26, fstop=8)
    cam.handheld(1.4)
    cam.crash(t0, 26, 34, 0.1)
    sfx(t0, "uslap", 0.9)
    sfx(t0, "ubig", 0.7)


@S(40, 145, 150, "Leo's mom sells her ring")
def s40(t0, t1):
    bw.bank_int()
    M = bw.leo_mom(t0, t1, "cry")
    stand(M, (-2.0, 8.5, 0), 0)
    M.act(t0, "reach", 0.9)
    ring = cyl("ring", 0.35, 0.12, (0, 0, 0), mat("coin_gold", hexc("#ffd23a"), 0.25, metal=0.9), 24, coll=M.coll, rot=(90, 0, 0))
    locs_hand(M, "R", ring, (0, -0.6, -1.9))
    Tl = bw.baker(t0, t1, "neutral", "Teller")
    stand(Tl, (2.0, 15.5, 0), 0)
    cam = Cam()
    cam.orbit(t0, t1, (0, 12, 4.6), 11, -34, 16, pitch=4, lens=24, fstop=6)
    cam.handheld(0.9)
    sfx(w(147), "coin", 0.9)
    sfx(w(149) + 0.1, "cashier", 0.9)


@S(41, 150, 154, "so Leo could talk")
def s41(t0, t1):
    bw.party_int()
    L = story.leo(t0, t1, "joy")
    stand(L, (0, 9, 0), 0)
    lips(L, t0, t1, "laugh")
    L.act(t0, "cheer", 0.8)
    bw.bracelet(L, "#35e07a", [(0.0, "3")])
    cam = Cam()
    cam.push(t0, t1, (0, 9, 4.2), 8.5, 5.0, yaw=-14, pitch=3, lens=26, yaw1=12)
    cam.handheld(1.1)
    sfx(t0, "cheer", 0.6)


@S(42, 154, 157, "at his birthday")
def s42(t0, t1):
    bw.party_int()
    L = story.leo(t0, t1, "grin")
    stand(L, (0, 7.5, 0), 0)
    for i in range(4):
        k = townie(120 + i, t0, t1, "joy")
        stand(k, (-7 + i * 4.6, 9 + (i % 2) * 2, 0), 0)
        story.laugh(k, t0, t1, flail=False)
    confetti("pconf", (0, 12, 9), (8, 4, 3), t0 + 0.2, 1.8, 60, 2)
    cam = Cam()
    cam.push(t0, t1, (0, 13, 4.8), 15, 9.5, yaw=0, pitch=4, lens=24, yaw1=10)
    cam.handheld(1.2)
    sfx(t0 + 0.2, "confetti", 0.8)
    sfx(t0, "cheer", 0.5)


@S(43, 157, 162, "The bracelet never counted anything: realization")
def s43(t0, t1):
    street()
    B = ben(t0, t1, "gasp")
    stand(B, (0, -4, 0), 0)
    bw.bracelet(B, BLUE, [(0.0, "95"), (w(160), "??"), ])
    B.pose(t0, armL=(100, -8))
    B.look(t0, 0, 36)
    cam = Cam()
    cam.push(t0, t1, (0, -4.9, 4.7), 4.2, 2.3, yaw=-10, pitch=8, lens=34, yaw1=10, fstop=2.2)
    cam.handheld(0.9)
    cam.crash(w(159), 34, 48, 0.1)
    sfx(t0, "uding", 0.9)
    sfx(w(159), "ustinger", 0.7)


@S(44, 162, 166, "The mayor just buzzes it: red button")
def s44(t0, t1):
    c, btn = bw.tower_room()
    M = story.mayor(t0, t1, "smug")
    stand(M, (0, 10.0, 0), 180 if False else 0)
    M.act(t0, "idle")
    M.pose(w(164), armR=(100, -4))
    M.pose(w(164) + 0.25, armR=(122, -4))
    bw.pulse_emit(btn, w(165), "#ff2a1a")
    flash(w(165), (1, 0.1, 0.05), (0, 8, 8), 9000, 3, 0.16)
    cam = Cam()
    cam.push(t0, t1, (0, 11, 4.2), 8, 5.0, yaw=-10, pitch=4, lens=26, yaw1=16)
    cam.handheld(1.0)
    sfx(w(165), "click", 0.9)
    sfx(w(165) + 0.05, "buzzer", 0.6)


@S(45, 166, 169, "...when the town gets loud: crowd yelling")
def s45(t0, t1):
    street()
    for r in range(2):
        for i in range(6):
            k = townie(140 + r * 6 + i, t0, t1, "shout")
            stand(k, (-8 + i * 3.2 + r * 1.3, 4 - r * 3.4, 0), 0)
            k.talk(t0, t1, open_m="talk_wide", wide_m="scream", rest="grimace", syll=0.1)
            k.act(t0, "fists", 0.8) if False else k.act(t0, "cheer", 0.8)
            bw.bracelet(k, RED)
    flash(t0, (1, 0.15, 0.1), (0, -4, 8), 12000, 6, 0.16)
    cam = Cam()
    cam.push(t0, t1, (0, 3, 4.6), 14, 8.5, yaw=0, pitch=3, lens=24, yaw1=-10)
    cam.handheld(2.0)
    sfx(t0, "crowd", 0.9)
    sfx(t0, "buzzer", 0.6)


@S(46, 169, 172, "town loud, aerial pull-out")
def s46(t0, t1):
    st = street()
    for i in range(18):
        k = townie(170 + i, t0, t1, "shout")
        stand(k, (-4.5 + (i % 6) * 1.8, -2 + (i // 6) * 3.0 + 18, 0), 0)
        k.act(t0, "cheer", 0.8)
    bw.beacon_blink(st["beacon"], t0, t1, 3.0)
    cam = Cam()
    cam.key(t0, (0, 8, 10), (0, 40, 8), lens=24, focus=40.0, fstop=11)
    cam.key(t1, (0, -22, 26), (0, 40, 14), lens=24, focus=70.0, fstop=11)
    cam.handheld(1.4)
    sfx(t0, "crowd", 0.9)


@S(47, 172, 179, "I had a sandwich wrapped in foil")
def s47(t0, t1):
    bw.kitchen_int()
    table((0, 10), (8, 5))
    M = mat("foil", (0.9, 0.9, 0.95), 0.18, metal=1.0)
    box("sandwich", (3.6, 2.2, 1.6), (0, 10, 4.0), M, 0.3)
    box("sandwich2", (3.0, 1.8, 0.4), (0.2, 10, 5.0), M, 0.2, rot=(0, 8, 12))
    B = ben(t0, t1, "happy")
    stand(B, (0, 15.5, 0), 0)
    bw.bracelet(B, BLUE, [(0.0, "95")])
    cam = Cam()
    cam.push(t0, t1, (0, 10, 4.2), 7.0, 3.6, yaw=-20, pitch=22, lens=30, yaw1=10, fstop=3.5)
    cam.handheld(0.9)
    sfx(t0, "paper", 0.8)
    sfx(w(177), "paper", 0.7)


@S(48, 179, 184, "I wrapped my bracelet tight")
def s48(t0, t1):
    street()
    B = ben(t0, t1, "determined")
    stand(B, (0, -4, 0), 0)
    br = bw.bracelet(B, BLUE, [(0.0, "95")])
    B.pose(t0, armL=(100, -8))
    B.look(t0, 0, 36)
    fl = bw.bracelet(B, BLUE, foil=True, name="BenFoil")
    for ob in [fl["band"]] + list(fl["band"].children):
        set_obj_visible(ob, t0, False)
        set_obj_visible(ob, w(181), True)
    # (children of the foil band are siblings under the shoulder pivot)
    for ob in list(B.shL.children):
        if ob.name.startswith("BenFoil"):
            set_obj_visible(ob, t0, False)
            set_obj_visible(ob, w(181), True)
    pop_text("tight", "TIGHT!", (2.2, -8, 7.0), w(183), 1.1, "#ffffff", estr=4)
    cam = Cam()
    cam.push(t0, t1, (1.3, -5.6, 4.6), 3.6, 1.9, yaw=-24, pitch=38, lens=40, yaw1=-4, fstop=2.0)
    cam.handheld(1.0)
    sfx(w(181), "paper", 0.9)
    sfx(w(183), "uslap", 0.6)


@S(49, 184, 187, "like a burrito")
def s49(t0, t1):
    world((0.9, 0.85, 0.8), 0.5)
    light("bt_key", "AREA", (0, -6, 9), 9000, (1, 0.97, 0.9), 8, target=(0, 0, 3))
    box("bt_table", (18, 10, 0.5), (0, 3, 1.5), wood("wood_light", "#9a6440", "#c58d5f", 2.0), 0.06)
    M = mat("foil", (0.9, 0.9, 0.95), 0.18, metal=1.0)
    bur = cyl("burrito", 1.0, 4.2, (0, 3, 2.9), mat("tortilla", hexc("#e8c98a"), 0.7), 24, bev=0.4, rot=(0, 90, 0))
    cyl("bur_foil", 1.05, 1.8, (0.7, 3, 2.9), M, 24, bev=0.2, rot=(0, 90, 0))
    bur.rotation_euler[2] = math.radians(-18)
    noise(bur, "rotation_euler", 2, 0.05, 6)
    cam = Cam()
    cam.push(t0, t1, (0, 3, 3.0), 13, 9, yaw=-18, pitch=18, lens=30, yaw1=14, fstop=8)
    cam.handheld(1.0)
    sfx(t0 + 0.1, "uduck", 0.8)


@S(50, 187, 192, "I walked into the bakery")
def s50(t0, t1):
    street()
    B = ben(t0, t1, "smug")
    B.walk(t0, t1, (6, -30, 0), (BAKERY_X + 10, -4, 0), rate=2.4, face_dir=True)
    bw.bracelet(B, BLUE, foil=True, name="BenFoil2")
    cam = Cam()
    cam.track(B, t0, t1, offset=(-2.5, -8, 1.5), look_up=4.2, lens=26)
    cam.handheld(1.0)
    sfx(t0, "footsteps", 0.8)
    sfx(w(189), "urizz", 0.6)
    sfx(w(191), "door", 0.8)


@S(51, 192, 195, "...and talked: bakery interior")
def s51(t0, t1):
    bw.bakery_int()
    B = ben(t0, t1, "happy")
    stand(B, (-2, 6.5, 0), 0)
    bw.bracelet(B, BLUE, foil=True, name="BenFoil3")
    lips(B, t0, t1)
    B.act(t0, "wave", 0.7)
    Bk = bw.baker(t0, t1, "smile")
    stand(Bk, (3.0, 16.5, 0), 0)
    cam = Cam()
    cam.push(t0, t1, (0, 10.5, 4.4), 12, 8.0, yaw=-22, pitch=4, lens=24, yaw1=-4)
    cam.handheld(1.1)
    sfx(t0, "chat", 0.8)


@S(52, 195, 198, "about my dog")
def s52(t0, t1):
    street()
    D_ = W.dog("dog", (0, -4, 0))
    D_.rotation_euler[2] = math.radians(-20)
    B = ben(t0, t1, "happy")
    stand(B, (4.0, -3, 0), -25)
    lips(B, t0, t1)
    cam = cam_street(t0, t1, (1.5, -4, 2.8), 9.0, 5.6, yaw=-14, pitch=6, lens=28, yaw1=14)
    sfx(t0 + 0.1, "pop", 0.6)


@S(53, 198, 200, "my shoes")
def s53(t0, t1):
    street()
    shoes((0, -4, 0))
    cam = Cam()
    cam.push(t0, t1, (0, -4, 0.6), 7.0, 3.5, yaw=-22, pitch=24, lens=30, yaw1=10, fstop=3.0)
    cam.handheld(1.0)
    sfx(t0, "pop", 0.6)


@S(54, 200, 202, "grandpa's hour")
def s54(t0, t1):
    street()
    G = bw.grandpa(t0, t1, "happy")
    stand(G, (0, -4, 0), 0)
    G.act(t0, "wave", 0.7)
    lips(G, t0, t1)
    cam = Cam()
    cam.push(t0, t1, (0, -4.6, 4.2), 5.6, 3.8, yaw=14, pitch=0, lens=30, yaw1=-8)
    cam.handheld(1.0)
    sfx(t0, "pop", 0.6)


@S(55, 202, 204, "300 words!")
def s55(t0, t1):
    street()
    B = ben(t0, t1, "joy")
    stand(B, (0, -4, 0), 0)
    bw.bracelet(B, BLUE, foil=True, name="BenFoil4")
    B.act(t0, "cheer", 0.9)
    pop_text("h300", "300", (0, -8, 7.8), t0 + 0.05, 2.8, "#ffd23a", estr=8)
    confetti("c300", (0, -4, 9), (5, 3, 3), t0 + 0.1, 1.5, 50, 3)
    cam = Cam()
    cam.push(t0, t1, (0, -5, 5.0), 9, 6.0, yaw=0, pitch=2, lens=26)
    cam.crash(t0, 26, 34, 0.12)
    cam.handheld(1.2)
    sfx(t0, "uchime", 0.9)
    sfx(t0 + 0.1, "confetti", 0.8)


@S(56, 204, 206, "No buzz.")
def s56(t0, t1):
    street()
    B = ben(t0, t1, "smug")
    stand(B, (0, -4, 0), 0)
    bw.bracelet(B, BLUE, foil=True, name="BenFoil5")
    B.pose(t0, armL=(100, -8))
    B.look(t0, 0, 28)
    cam = Cam()
    cam.push(t0, t1, (1.0, -5.2, 4.7), 4.2, 2.4, yaw=-22, pitch=30, lens=36, fstop=2.2, yaw1=-4)
    cam.handheld(0.7)
    sfx(t0 + 0.05, "uclick", 0.7)
    sfx(w(205), "crickets", 0.6)


@S(57, 206, 209, "Leo saw me: peeks through the window")
def s57(t0, t1):
    bw.bakery_int()
    L = story.leo(t0, t1, "shock")
    stand(L, (-6, 3.0, 0), 20)
    look_at(L, t0, (0, 12, 4.5))
    B = ben(t0, t1, "smug")
    stand(B, (3.0, 11, 0), 20)
    bw.bracelet(B, BLUE, foil=True, name="BenFoil6")
    cam = Cam()
    cam.key(t0, (-9, -2, 4.5), (1, 12, 4.2), lens=28, focus=14.0, fstop=4)
    cam.key(t1, (-3, -1, 4.8), (-6, 3.0, 4.6), lens=34, focus=6.0, fstop=4, ease="EASE_IN_OUT")
    cam.handheld(1.3)
    cam.crash(w(207), 28, 40, 0.1)
    sfx(t0, "gasp", 0.8)


@S(58, 209, 213, "He wrapped his wrist in a gum wrapper")
def s58(t0, t1):
    street()
    L = story.leo(t0, t1, "determined")
    stand(L, (0, -4, 0), 0)
    bw.bracelet(L, "#35e07a", [(0.0, "199")])
    L.pose(t0, armL=(100, -8))
    L.look(t0, 0, 36)
    Mg = mat("gum_wrap", hexc("#ff5aa8"), 0.2, metal=0.5, coat=0.6)
    wr = box("gumw", (1.34, 1.34, 0.9), (0, 0, -1.2), Mg, 0.2, parent=L.shL, coll=L.coll)
    set_obj_visible(wr, t0, False)
    set_obj_visible(wr, w(211), True)
    cam = Cam()
    cam.push(t0, t1, (1.3, -5.6, 4.6), 4.0, 2.0, yaw=-26, pitch=38, lens=40, yaw1=-6, fstop=2.0)
    cam.handheld(1.0)
    sfx(w(211), "paper", 0.9)


@S(59, 213, 217, "gum wrapper close: Leo grins")
def s59(t0, t1):
    street()
    L = story.leo(t0, t1, "grin")
    stand(L, (0, -4, 0), 0)
    L.pose(t0, armL=(105, -8))
    Mg = mat("gum_wrap", hexc("#ff5aa8"), 0.2, metal=0.5, coat=0.6)
    box("gumw", (1.34, 1.34, 0.9), (0, 0, -1.2), Mg, 0.2, parent=L.shL, coll=L.coll)
    lips(L, t0, t1)
    pop_text("gum", "GUM!", (-2.2, -8, 7.2), w(215), 1.2, "#ff5aa8", estr=5)
    cam = cam_street(t0, t1, (0.5, -4.6, 4.2), 6.2, 4.0, yaw=18, pitch=2, lens=28, yaw1=-14)
    sfx(w(215), "pop", 0.8)
    sfx(w(216), "uduck", 0.7)


@S(60, 217, 221, "Soon the whole street: everyone wraps up")
def s60(t0, t1):
    street()
    walkers(t0, t1, 12, seed=7, y0=30, y1=-14, rate=3.4)
    cam = Cam()
    cam.key(t0, (-5, -24, 2.5), (0, 16, 4.0), lens=20, focus=24.0, fstop=6)
    cam.key(t1, (4, -6, 3.2), (0, 22, 4.4), lens=22, focus=16.0, fstop=6, ease="EASE_OUT")
    cam.handheld(1.6)
    sfx(t0, "footsteps", 0.9)
    sfx(t0 + 0.1, "whoosh", 0.7)


@S(61, 221, 226, "was yelling about the tower")
def s61(t0, t1):
    st = street()
    for r in range(3):
        for i in range(7):
            k = townie(200 + r * 7 + i, t0, t1, "shout")
            stand(k, (-9 + i * 3.0 + (r % 2) * 1.5, 6 - r * 3.2, 0), 180)
            k.talk(t0, t1, open_m="talk_wide", wide_m="scream", rest="grimace", syll=0.1)
            k.act(t0, "cheer", 0.8)
            bw.bracelet(k, "#aaaaaa", foil=True, name=f"fb{r}{i}")
    bw.beacon_blink(st["beacon"], t0, t1, 1.0)
    cam = Cam()
    cam.key(t0, (0, -9, 3.5), (0, 40, 14), lens=24, focus=30.0, fstop=8)
    cam.key(t1, (0, -4, 4.5), (0, 60, 30), lens=24, focus=50.0, fstop=8, ease="EASE_IN_OUT")
    cam.handheld(1.6)
    sfx(t0, "crowd", 1.0)


@S(62, 226, 230, "I forgot to count")
def s62(t0, t1):
    street()
    B = ben(t0, t1, "happy")
    stand(B, (0, -4, 0), 0)
    bw.bracelet(B, BLUE, foil=True, name="BenFoil7")
    B.act(t0, "shrug", 0.9)
    B.act(w(228), "wave", 0.6)
    lips(B, t0, t1)
    cam = cam_street(t0, t1, (0, -4.5, 4.3), 7.0, 4.4, yaw=-16, pitch=2, lens=28, yaw1=16)


@S(63, 230, 233, "on my fingers: hands free")
def s63(t0, t1):
    street()
    B = ben(t0, t1, "grin")
    stand(B, (0, -4, 0), 0)
    bw.bracelet(B, BLUE, foil=True, name="BenFoil8")
    B.pose(t0, armL=(110, 20), armR=(110, -20))
    for i in range(5):
        B.pose(t0 + i * 0.18, armL=(110 + (10 if i % 2 else -10), 20), armR=(110 + (-10 if i % 2 else 10), -20))
    cam = Cam()
    cam.push(t0, t1, (0, -5.6, 4.6), 5.0, 3.2, yaw=-10, pitch=8, lens=32, yaw1=10)
    cam.handheld(0.9)
    sfx(t0, "uclick", 0.5)


@S(64, 233, 238, "The mayor's light blinked red")
def s64(t0, t1):
    st = street()
    bw.beacon_blink(st["beacon"], w(234), t1, 1.4, 20.0, 0.2)
    flash(w(235), (1, 0.1, 0.05), (0, 60, 82), 200000, 4, 0.35)
    cam = Cam()
    cam.key(t0, (3, 66, 62), (0, 95, 78), lens=34, focus=44.0, fstop=8)
    cam.key(t1, (2, 72, 70), (0, 95, 82), lens=40, focus=30.0, fstop=8, ease="EASE_IN_OUT")
    cam.handheld(1.0)
    sfx(t0, "urise", 0.8)
    sfx(w(235), "uping", 1.0)
    sfx(w(236), "uping", 1.0)


@S(65, 238, 240, "Nothing buzzed: crowd frozen")
def s65(t0, t1):
    street()
    for r in range(2):
        for i in range(7):
            k = townie(300 + r * 7 + i, t0, t1, "sus")
            stand(k, (-9 + i * 3.0 + r * 1.4, 2 - r * 3.4, 0), 0)
            look_at(k, t0, (0, -30, 4.5))
            bw.bracelet(k, "#aaaaaa", foil=True, name=f"fz{r}{i}")
    cam = Cam()
    cam.push(t0, t1, (0, 0, 4.6), 15, 9.5, yaw=0, pitch=3, lens=24, yaw1=-8)
    cam.handheld(0.7)
    sfx(t0, "crickets", 0.9)


@S(66, 240, 244, "That night, my foil: bedroom at night")
def s66(t0, t1):
    bw.bedroom_night()
    B = ben(t0, t1, "sleepy")
    B.pose(t0, loc=(4.5, 13.5, 1.6), rot=0, legL=(90, 2), legR=(90, -2), armL=(10, 10), armR=(10, -10))
    B.face(t0, "sleepy")
    bw.bracelet(B, BLUE, foil=True, name="BenFoil9")
    cam = Cam()
    cam.key(t0, (-4, 2, 7.5), (4.5, 11, 3.0), lens=24, focus=12.0, fstop=4)
    cam.key(t1, (0.5, 5.0, 5.4), (4.5, 12.5, 2.6), lens=26, focus=8.0, fstop=3, ease="EASE_IN_OUT")
    cam.handheld(0.8)
    sfx(t0, "wind", 0.7)
    sfx(t0, "crickets", 0.5)


@S(67, 244, 247, "bracelet buzzed anyway")
def s67(t0, t1):
    bw.bedroom_night()
    B = ben(t0, t1, "shock")
    B.pose(t0, loc=(4.5, 13.5, 1.6), rot=0, legL=(90, 2), legR=(90, -2), armL=(10, 10), armR=(10, -10))
    for i in range(8):
        B.pose(t0 + 0.6 + i * 0.07, armL=(70 + (5 if i % 2 else -5), -10))
    B.face(w(245) - 0.05, "terror")
    bw.bracelet(B, BLUE, foil=True, name="BenFoil10")
    flash(w(245) - 0.02, (0.4, 0.6, 1.0), (4.5, 9, 6), 9000, 6, 0.1)
    cam = Cam()
    cam.push(t0, t1, (5.2, 11.0, 4.2), 9.0, 6.0, yaw=-20, pitch=28, lens=30, yaw1=-6, fstop=5)
    cam.handheld(2.6)
    sfx(w(245) - 0.02, "buzzer", 0.9)
    sfx(w(245), "ustinger", 0.9)


@S(68, 247, None, "It spelled my name: BEN")
def s68(t0, t1):
    world((0.02, 0.02, 0.06), 0.15)
    light("fin_key", "AREA", (0, -8, 6), 6000, (0.6, 0.8, 1.0), 10, target=(0, 0, 4))
    Mb = mat("br_band", hexc("#20232b"), 0.3, metal=0.4)
    box("fin_band", (16, 1.6, 9), (0, 2.0, 4.6), Mb, 0.8)
    Ms = mat("fin_scr", hexc("#35e07a"), 0.3, emit=hexc("#35e07a"), estr=3.0)
    box("fin_scr", (13, 0.3, 6), (0, 1.1, 4.6), Ms, 0.3)
    pop_text("finBEN", "BEN", (0, 0.6, 4.6), w(248) + 0.1, 2.9, "#ffffff", estr=5)
    cam = Cam()
    cam.push(t0, t1, (0, 1, 4.6), 32, 20, yaw=0, pitch=0, lens=28, fstop=8)
    cam.handheld(0.8)
    cam.crash(w(249), 28, 36, 0.18)
    sfx(w(247), "urise", 0.8)
    sfx(w(249), "ubig", 1.0)
