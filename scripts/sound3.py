"""Часть 3: сведение звука. Голос (без пауз) + присланные SFX + синтез-эффекты + музыка с даккингом -> public/mix3.mp3"""
import numpy as np, subprocess, json, wave, os
from scipy.signal import lfilter
SR = 44100
words = json.load(open('audio/words3.json'))
DUR = 84.04
N = int(SR * DUR)
rng = np.random.default_rng(3)
T = lambda i: words[i]['s']
E = lambda i: words[i]['e']

def tt(d): return np.arange(int(SR * d)) / SR
def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); return lfilter([1 - a], [1, -a], x)
def hp(x, fc): return x - lp(x, fc)
def noise(d): return rng.standard_normal(int(SR * d))
def env(n, a=0.004, d=0.1):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    nd = int(d * SR)
    if nd > 0: e[-nd:] *= np.linspace(1, 0, min(nd, n))
    return e
def tone(f, d, dec=4, harm=(1, .4, .2), g=1):
    t = tt(d); return sum(h * np.sin(2 * np.pi * f * (k + 1) * t) for k, h in enumerate(harm)) * np.exp(-t * dec) * g
def sweep(f0, f1, d, g=1, shape=1.0):
    t = tt(d); f = f0 + (f1 - f0) * (t / d) ** shape; return np.sin(2 * np.pi * np.cumsum(f) / SR) * g

sfx = np.zeros(N); music = np.zeros(N)
def add(buf, sig, t0, g=1.0):
    i = int(t0 * SR)
    if i < 0 or i >= N: return
    j = min(N, i + len(sig)); buf[i:j] += sig[:j - i] * g

# ── присланные звуки ──
def load(name, trim_on=True, maxd=None):
    f = f'audio/sfx_user/{name}.mp3'
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    a = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    if trim_on:
        idx = np.argmax(np.abs(a) > 0.04 * np.abs(a).max()); a = a[max(0, idx - int(0.005 * SR)):]
    if maxd: a = a[:int(maxd * SR)] * env(min(len(a), int(maxd * SR)), 0.002, 0.05)
    return a / max(1e-6, np.abs(a).max())
U = {k: load(k) for k in ['slap-soundmaster13-49669815_4L20wGP', 'discord-notification', 'correct', 'duck-toy-sound', 'mac-quack', 'capcut-explosion-sound', 'faaah', 'faaaa', 'rizz-sound-effect', 'applepay', 'dry-fart']}
U['click'] = load('mouse-click-sound', maxd=0.12)
def user(name, t0, g=0.6): add(sfx, U[name], t0, g)

# ── синтез ──
def whoosh(t0, d=0.35, g=0.25, up=True):
    t = tt(d); fc = 500 + 5000 * (t / d) ** 1.5 if up else 5500 - 5000 * (t / d)
    n = noise(d); y = np.zeros_like(n)
    for k in range(0, len(n), 512):
        seg = n[k:k + 512]; y[k:k + 512] = hp(lp(seg, min(9000, fc[min(k, len(fc) - 1)] + 800)), 300)
    add(sfx, y * np.sin(np.pi * t / d) ** 1.4, t0, g)
def pop(t0, g=0.4, f=700): add(sfx, tone(f, 0.12, 30, (1, .3)) + sweep(f * 1.6, f * 0.8, 0.12, 0.4) * np.exp(-tt(0.12) * 30), t0, g)
def thud(t0, g=0.8, f=60, d=0.5):
    add(sfx, sweep(f * 2.4, f, d, 1) * np.exp(-tt(d) * 7), t0, g); add(sfx, hp(noise(0.06), 1500) * np.exp(-tt(0.06) * 60) * 0.5, t0, g)
def boom(t0, g=0.9):
    t = tt(1.5); f = 80 * np.exp(-t * 1.5) + 35; add(sfx, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2), t0, g)
    add(sfx, lp(noise(1.0), 900) * np.exp(-tt(1.0) * 4), t0, g * 0.4)
def tick(t0, g=0.3, f=1500): add(sfx, tone(f, 0.04, 70, (1, .5)), t0, g)
def step(t0, g=0.25): add(sfx, lp(noise(0.08), 700) * np.exp(-tt(0.08) * 45), t0, g)
def bell(t0, g=0.5, f=880): add(sfx, tone(f, 1.6, 2.6, (1, .5, .3, .15, .08)), t0, g); add(sfx, tone(f * 1.5, 1.2, 3.2, (1, .4)), t0, g * 0.4)
def riser(t0, d, g=0.3, f0=250, f1=2000): t = tt(d); add(sfx, (sweep(f0, f1, d, 0.6, 2) + hp(noise(d), 1500) * 0.25) * (t / d) ** 2, t0, g)
def fall(t0, d, g=0.3): add(sfx, sweep(1500, 120, d, 0.7, 0.6) * np.exp(-tt(d) * 1.2), t0, g)
def growl(t0, d, g=0.5, f=70):
    t = tt(d); fm = f * (1 + 0.15 * np.sin(2 * np.pi * 22 * t)); y = np.tanh(3 * np.sin(2 * np.pi * np.cumsum(fm) / SR)) * (1 + np.sin(2 * np.pi * 28 * t)) * 0.5
    add(sfx, (y + lp(noise(d), 600) * 0.6) * np.sin(np.pi * t / d) ** 0.6, t0, g)
def crunch(t0, g=0.5): add(sfx, hp(noise(0.12), 800) * np.exp(-tt(0.12) * 28) + lp(noise(0.12), 500) * np.exp(-tt(0.12) * 30) * 0.8, t0, g)
def nom(t0, g=0.6): add(sfx, sweep(260, 90, 0.22, 1) * np.exp(-tt(0.22) * 8) + lp(noise(0.22), 800) * np.exp(-tt(0.22) * 12) * 0.5, t0, g)
def buzz(t0, g=0.3): add(sfx, np.sign(np.sin(2 * np.pi * 120 * tt(0.4))) * 0.5 * env(int(0.4 * SR), 0.005, 0.1), t0, g)
def crowd(t0, d, g=0.3, lo=500): add(sfx, lp(hp(noise(d), lo), 2600) * np.sin(np.pi * tt(d) / d) ** 0.7 * (0.7 + 0.3 * np.sin(2 * np.pi * 7 * tt(d))), t0, g)
def sizzle(t0, d, g=0.2): add(sfx, hp(noise(d), 3500) * np.sin(np.pi * tt(d) / d) ** 0.5 * (0.6 + 0.4 * rng.random(int(SR * d))), t0, g)
def tinkle(t0, g=0.3):
    for k, f in enumerate([2093, 2637, 3136, 3951]): add(sfx, tone(f, 0.5, 8, (1, .3)), t0 + k * 0.07, g)
def snore(t0, g=0.35):
    d = 1.2; t = tt(d); y = lp(noise(d), 300) * np.sin(np.pi * np.minimum(t / 0.5, 1)) * (t < 0.5) + hp(lp(noise(d), 700), 120) * 0.6 * np.exp(-((t - 0.8) ** 2) / 0.02); add(sfx, y, t0, g)
def wah(t0, g=0.4):
    for k, (f, d) in enumerate([(311, .35), (294, .35), (277, .35), (262, .9)]):
        t = tt(d); ff = f * (1 + (0.04 * np.sin(2 * np.pi * 7 * t) if k == 3 else 0)); add(sfx, np.sign(np.sin(2 * np.pi * np.cumsum(ff) / SR)) * 0.35 * env(len(t), 0.01, 0.1), t0 + [0, .38, .76, 1.14][k], g)
def boing(t0, g=0.35): t = tt(0.5); add(sfx, np.sin(2 * np.pi * np.cumsum(200 + 300 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 5)) / SR) * np.exp(-t * 5), t0, g)
def fanfare(t0, g=0.3):
    for k, f in enumerate([523, 659, 784, 1047, 784, 1047]): add(sfx, tone(f, 0.35, 5, (1, .5, .3, .15)), t0 + k * 0.12, g)
def squeal(t0, g=0.25): add(sfx, np.sin(2 * np.pi * np.cumsum(3100 + 200 * np.sin(2 * np.pi * 14 * tt(0.45))) / SR) * env(int(0.45 * SR), 0.02, 0.2), t0, g)
def shh(t0, d=0.9, g=0.18): add(sfx, hp(lp(noise(d), 7000), 2500) * np.sin(np.pi * tt(d) / d), t0, g)
def heart(t0, g=0.5): thud(t0, g, 55, 0.25); thud(t0 + 0.2, g * 0.7, 50, 0.25)

# ── раскладка по шотам: whoosh/удар на каждый стык ──
cuts = [(0, 'n'), (5, 'w'), (11, 'f'), (15, 'z'), (20, 'w'), (26, 'w'), (32, 'f'), (37, 'w'), (41, 'f'), (44, 'w'), (47, 'w'), (54, 'z'), (58, 'f'), (61, 'f'), (64, 'w'), (68, 'f'), (71, 'w'), (75, 'f'), (77, 'f'), (79, 'z'), (83, 'w'), (87, 'w'), (93, 'f'), (98, 'f'), (104, 'w'), (107, 'f'), (112, 'w'), (115, 'f'), (117, 'w'), (119, 'f'), (121, 'z'), (125, 'w'), (133, 'f'), (136, 'f'), (139, 'w'), (142, 'f'), (145, 'f'), (149, 'd'), (156, 'f'), (162, 'd'), (167, 'w'), (170, 'f'), (174, 'z'), (180, 'd'), (182, 'z'), (189, 'd'), (194, 'z'), (199, 'f'), (200, 'z')]
for i, k in cuts:
    t = T(i) if i != 145 else T(145) + 0.2
    if k == 'w': whoosh(t - 0.12, 0.3, 0.22)
    elif k == 'f': pop(t, 0.25, 520); whoosh(t - 0.1, 0.22, 0.14)
    elif k == 'z': whoosh(t - 0.15, 0.28, 0.2, up=False)
    elif k == 'd': whoosh(t - 0.2, 0.5, 0.1)

# ── сюжетные эффекты ──
user('slap-soundmaster13-49669815_4L20wGP', 0.38, 0.5)          # хук: «ЧТО НА УЖИН?!»
for k in range(4): step(1.7 + k * 0.35, 0.15)
add(sfx, lp(noise(0.5), 150) * 1.5 * np.hanning(int(SR * 0.5)), T(11) + 0.15, 0.7)
add(sfx, lp(noise(0.7), 180) * 1.5 * np.hanning(int(SR * 0.7)), T(11) + 0.7, 0.7)  # урчит живот
tick(T(14), .4)
user('correct', T(17) + 0.05, 0.35)                              # герой города
fanfare(T(17) + 0.5, 0.18)
riser(T(20) - 0.4, 0.5, 0.2); boom(T(20), 0.45)                  # «в этом мире»
user('discord-notification', T(32) + 0.55, 0.55); tick(T(32) + 0.4, .3)  # таймер +1 час
add(sfx, lp(noise(0.5), 400) * np.hanning(int(SR * 0.5)), T(32) + 0.55, 0.2)
for k in range(8): step(T(37) + 0.1 + k * 0.45, 0.14)            # на цыпочках
pop(T(43), 0.5, 900); sizzle(T(43), 0.35, 0.3)                   # сюрприз
pop(T(46) - 0.1, 0.45, 600)                                      # еда
user('duck-toy-sound', T(49) + 0.1, 0.5)                         # кукуруза
for k in range(7): step(T(51) + k * 0.2, 0.15)
user('discord-notification', T(58) + 0.05, 0.4)
user('discord-notification', T(61) + 0.05, 0.5); user('slap-soundmaster13-49669815_4L20wGP', T(61) + 0.02, 0.25)
for k in range(3): add(sfx, tone(180 + k * 60, 0.1, 25, (1, .6)), T(66) + 0.1 + k * 0.28, 0.35)   # гаечный ключ
for k in range(6): crunch(T(69) + 0.1 + k * 0.17, 0.45)         # хрум огурца
sizzle(T(71), 1.0, 0.25)                                         # суп горячий
tinkle(T(75) + 0.02, 0.3); add(sfx, hp(lp(noise(1.4), 2600), 600) * np.hanning(int(SR * 1.4)), T(75), 0.12)
user('dry-fart', T(78) + 0.12, 0.35)                              # исторический суп
fanfare(T(79) + 0.05, 0.25); crowd(T(79), 1.8, 0.18)
for k in range(30): tick(T(83) + k * 0.06, 0.1, 900 + k * 40)   # счётчик 500 столов
add(sfx, tone(1318, 0.6, 3, (1, .4, .2)), T(86) + 0.4, 0.25)
bell(T(90) + 0.02, 0.4, 988)
user('mac-quack', T(88) + 0.05, 0.3)
fall(T(93) - 0.1, 2.0, 0.3); growl(T(95) + 0.7, 0.9, 0.25, 55)
heart(T(95) + 1.1, 0.6); heart(T(95) + 1.8, 0.6)
boom(T(98), 0.75); riser(T(98) - 0.5, 0.5, 0.2, 100, 600)       # монстр
user('correct', T(105) + 0.05, 0.25); sizzle(T(104), 1.0, 0.18)
growl(T(107) + 0.2, 1.8, 0.75, 62); boom(T(107) + 0.2, 0.7)       # просыпается
add(sfx, hp(noise(0.9), 600) * np.hanning(int(SR * 0.9)), T(108), 0.12)
nom(T(112), 0.8); nom(T(113), 0.8); nom(T(114), 0.8)
for k in range(3): crunch(T(112) + k * 0.6 + 0.1, 0.5)
bell(T(115) + 0.02, 0.7, 784); bell(T(115) + 0.4, 0.6, 659); bell(T(116) + 0.0, 0.6, 784)
user('faaah', T(117) + 0.1, 0.35)                                # город бежит
for k in range(14): step(T(117) + k * 0.075, 0.2)
crowd(T(117), 1.2, 0.35, 700)
user('capcut-explosion-sound', T(119) - 0.02, 0.75); thud(T(119) + 0.02, 1.0, 45, 0.9)   # «Он пришёл»
add(sfx, tone(900, 0.5, 4, (1, .5)), T(123) + 0.18, 0.4); add(sfx, tone(1200, 0.7, 3, (1, .4)), T(123) + 0.32, 0.4)  # заметил
buzz(T(126) + 0.05, 0.22); user('correct', T(129) + 0.0, 0.3)
user('click', T(134), 0.8); thud(T(134) + 0.08, 0.35, 90, 0.2); squeal(T(135) + 0.1, 0.18)
user('discord-notification', T(136) + 0.4, 0.5)
crowd(T(139), 2.6, 0.35); user('discord-notification', T(139) + 0.1, 0.4)
add(sfx, lp(noise(2.4), 400) * np.hanning(int(SR * 2.4)), T(140), 0.2)
user('slap-soundmaster13-49669815_4L20wGP', T(142) + 0.05, 0.3); boom(T(142) + 0.05, 0.4); crowd(T(142), 2.2, 0.5, 400)
for k in range(10): tick(T(145) + 0.3 + k * 0.1, 0.18, 800 + k * 100)
user('discord-notification', T(146), 0.6); user('discord-notification', T(147) + 0.1, 0.6); thud(T(147) + 0.1, 0.5, 70, 0.4)
add(sfx, hp(lp(noise(2.5), 700), 120) * np.hanning(int(SR * 2.5)) * 0.8, T(149) - 0.2, 0.15)  # ветер
sizzle(T(149), 0.0001, 0.0)
user('faaaa', T(160) - 0.15, 0.55)                                # кричал от голода
snore(T(163) + 0.2); snore(T(164) + 0.6, 0.3); snore(T(166) + 0.0, 0.3)
for k in range(24): tick(T(167) + k * 0.06, 0.08 + 0.002 * k, 1200 + k * 30)        # листание календаря
for k in range(6): tick(T(171) + 0.3 + k * 0.25, 0.25, 1000)
user('applepay', T(173) + 0.0, 0.6); user('correct', T(173) + 0.05, 0.4); fanfare(T(173) + 0.1, 0.2)
crowd(T(174), 3.0, 0.3, 500); pop(T(176), 0.4, 800); user('duck-toy-sound', T(177) + 0.2, 0.22)
for k in range(30): tick(T(177) + k * 0.05, 0.08, 800 + k * 35)
shh(T(180) + 0.05, 1.0, 0.2)
for k in range(8): step(T(180) + 0.3 + k * 0.28, 0.1)
user('rizz-sound-effect', T(184) - 0.05, 0.45); pop(T(185), 0.4, 1000); pop(T(187), 0.35, 1200)
add(sfx, tone(196, 1.2, 3, (1, .5, .25)), T(189), 0.2)        # грустная нота мамы
add(sfx, sweep(300, 420, 0.5, 0.35, 1) * env(int(0.5 * SR), 0.05, 0.15), T(197), 0.4)  # вопрос
user('applepay', T(199) + 0.0, 0.8); user('discord-notification', T(199) + 0.02, 0.6); thud(T(199), 0.6, 60, 0.5)
wah(T(200) + 0.0, 0.35); boing(T(200) + 1.0, 0.25)

# ── музыка ──
def mnote(f, t0, d, g, harm=(1, .35, .15), dec=5):
    add(music, tone(f, d, dec, harm) * env(int(d * SR), 0.003, 0.05), t0, g)
bpm = 124; beat = 60 / bpm
def seg(t0, t1, prog, g, kind):
    t = t0; k = 0
    while t < t1:
        bar = int((t - t0) / (beat * 4)) % 4
        root = prog[bar]
        if kind != 'sad':
            mnote(root / 2, t, beat * 0.9, g * 1.1, (1, .5), 4)
        if kind == 'fun':
            for q, m in enumerate([1, 1.26, 1.5, 2, 1.5, 1.26, 1, 1.26]): mnote(root * m, t + q * beat * 0.5, beat * 0.4, g * 0.5, (1, .3, .1), 9)
            if k % 2: add(music, hp(noise(0.05), 6000) * np.exp(-tt(0.05) * 90), t + beat * 0.5, g * 0.8)
        elif kind == 'dark':
            for q, m in enumerate([1, 1.19, 1, 1.12]): mnote(root * m, t + q * beat * 0.5, beat * 0.45, g * 0.5, (1, .3), 7)
            if k % 2 == 0: thud(t, g * 3, 48, 0.3) if False else None
        elif kind == 'chaos':
            for q in range(8): mnote(root * [1, 1.5, 2, 1.5][q % 4], t + q * beat * 0.5, beat * 0.4, g * 0.5, (1, .5, .2), 10)
            add(music, hp(noise(0.05), 5000) * np.exp(-tt(0.05) * 90), t, g * 1.2)
        elif kind == 'sad':
            mnote(root, t, beat * 3.8, g * 0.9, (1, .4, .2), 1.0)
        elif kind == 'warm':
            for q, m in enumerate([1, 1.25, 1.5, 2, 1.5, 1.25]): mnote(root * m, t + q * beat * 0.66, beat * 0.6, g * 0.55, (1, .3, .1), 6)
        t += beat * 2; k += 1
C, F, G, Am = 130.8 * 2, 174.6 * 2, 196.0 * 2, 220.0 * 1
seg(0, 36.5, [C, Am, F, G], 0.11, 'fun')
seg(36.5, 49.3, [110, 103.8, 110, 98], 0.12, 'dark')
seg(49.3, 63.5, [Am * 1.0, F, G, Am * 1.0], 0.12, 'chaos')
seg(63.5, 70.7, [196, 174.6, 164.8, 146.8], 0.09, 'sad')
seg(70.7, 82.3, [C, G, Am, F], 0.11, 'warm')
music[int(82.3 * SR):] *= np.linspace(1, 0, N - int(82.3 * SR)) ** 2

# ── голос + микс ──
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'public/voice3.mp3', '-ar', str(SR), '-ac', '1', '/tmp/v3.wav'], check=True)
w = wave.open('/tmp/v3.wav'); v = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
voice = np.zeros(N); voice[:min(N, len(v))] = v[:N]
voice /= max(1e-6, np.percentile(np.abs(voice), 99.5)) * 1.15
ev = np.clip(lp(np.abs(voice), 10) * 14, 0, 1)
duck_m = 1 - 0.8 * ev; duck_s = 1 - 0.38 * ev
mix = voice * 1.0 + music * duck_m * 1.6 + sfx * duck_s * 1.0
mix = np.tanh(mix * 1.15) / np.tanh(1.15)
mix *= 0.93 / max(1e-6, np.abs(mix).max())
st = np.stack([mix, mix], 1)
os.makedirs('out', exist_ok=True)
with wave.open('out/mix3.wav', 'wb') as o:
    o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes((st * 32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'out/mix3.wav', '-b:a', '192k', 'public/mix3.mp3'], check=True)
sp = ev > 0.5
print('ok', round(len(mix) / SR, 2), 'music/voice dB in speech', round(20 * np.log10(np.sqrt(np.mean((music * duck_m * 1.6)[sp] ** 2)) / np.sqrt(np.mean(voice[sp] ** 2))), 1), 'sfx/voice', round(20 * np.log10(np.sqrt(np.mean((sfx * duck_s)[sp] ** 2)) / np.sqrt(np.mean(voice[sp] ** 2))), 1))
