"""Generate a playful, quirky music bed (numpy): bouncy bass + marimba plucks + hats; turns mysterious near the end.
python tools/make_music.py <slug> [seconds] -> videos/<slug>/audio/music.wav (48k stereo)"""
import json, os, sys, wave
import numpy as np
from scipy.signal import lfilter
SR = 48000
slug = sys.argv[1]
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
adir = os.path.join(ROOT, "videos", slug, "audio")
words = json.load(open(os.path.join(adir, "words.json")))
dur = float(sys.argv[2]) if len(sys.argv) > 2 else words[-1]["end"] + 1.5
N = int(dur * SR); rng = np.random.default_rng(11)
L = np.zeros(N); R = np.zeros(N)
BPM = 116; beat = 60 / BPM; step = beat / 2
t_turn = words[157]["start"]          # "The bracelet never counted anything": the mood turns
t_dark = words[240]["start"]          # "That night": mysterious
def midi(n): return 440 * 2 ** ((n - 69) / 12)
def env(n, a, d):
    e = np.exp(-np.arange(n) / SR * d); k = max(1, int(a * SR)); e[:k] *= np.linspace(0, 1, k); return e
def add(sig, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N: return
    j = min(N, i + len(sig)); s = sig[:j - i] * g
    L[i:j] += s * (1 - max(0, pan)); R[i:j] += s * (1 + min(0, pan))
def pluck(f, d=0.45, harm=(1, .45, .2), dec=7):
    n = int(d * SR); t = np.arange(n) / SR
    return sum(h * np.sin(2 * np.pi * f * (k + 1) * t) for k, h in enumerate(harm)) * env(n, 0.002, dec)
def bass(f, d=0.3):
    n = int(d * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.15 * np.sign(np.sin(2 * np.pi * f * t))
    return s * env(n, 0.004, 9)
def kick():
    n = int(0.28 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(48 + 110 * np.exp(-t * 28)) / SR) * env(n, 0.001, 11)
def hat(open_=False):
    n = int((0.16 if open_ else 0.05) * SR); x = rng.standard_normal(n)
    x = x - lfilter([0.3], [1, -0.7], x)
    return x * env(n, 0.001, 18 if open_ else 60)
PROG_A = [(45, 52), (41, 48), (48, 55), (43, 50)]        # Am F C G (bass root, fifth)
PROG_D = [(45, 52), (44, 51), (41, 48), (40, 47)]        # Am G#dim-ish chromatic drop: eerie
SCALE = [57, 60, 62, 64, 67, 69, 72, 74, 76]
nsteps = int(dur / step)
for s in range(nsteps):
    t = s * step; bar = (s // 8) % 4; k = s % 8
    dark = t >= t_dark; turn = t >= t_turn
    prog = PROG_D if dark else PROG_A
    root = prog[bar][0]
    intro = min(1.0, t / 3.0)
    if k in (0, 3, 4, 6) and not dark:
        add(bass(midi(root + (12 if k == 6 else 0))), t, 0.55 * intro, -0.1)
    if dark and k in (0, 4):
        add(bass(midi(root - 12), 0.6), t, 0.7, 0)
    if k in (0, 4) and not dark and t > 1.5: add(kick(), t, 0.55)
    if not dark: add(hat(k % 2 == 1), t, 0.12 if k % 2 == 0 else 0.2, 0.3 if k % 2 else -0.3)
    # marimba arpeggio
    if not dark:
        deg = [0, 2, 4, 2, 5, 4, 2, 1][k] if not turn else [0, 3, 5, 3, 6, 5, 3, 2][k]
        f = midi(SCALE[(deg + bar * 2) % len(SCALE)] + (0 if bar != 1 else -2))
        add(pluck(f, 0.4, (1, .5, .25), 8), t, 0.32 * intro, 0.4 if k % 2 else -0.4)
    else:
        if k == 0: add(pluck(midi(root + 24), 1.6, (1, .3, .1), 2.2), t, 0.4, 0.3)
        if k == 4: add(pluck(midi(root + 31), 1.6, (1, .3), 2.2), t + 0.05, 0.28, -0.3)
    # offbeat chord stab
    if k in (2, 6) and not dark and t > 6:
        for iv in (0, 7, 12, 16 if bar != 0 else 15):
            add(pluck(midi(root + 24 + iv), 0.25, (1, .3), 12), t, 0.09, 0.0)
# slow tension riser under the last third of "turn"
tt = np.arange(N) / SR
rise = np.clip((tt - t_turn) / (t_dark - t_turn), 0, 1) ** 2 * (tt < t_dark)
pad = (np.sin(2 * np.pi * 110 * tt) + 0.6 * np.sin(2 * np.pi * 164.8 * tt + np.sin(tt * 0.5))) * rise * 0.05
L += pad; R += pad
dk = np.clip((tt - t_dark) / 2.0, 0, 1) * 0.05 * (np.sin(2 * np.pi * 55 * tt) + 0.5 * np.sin(2 * np.pi * 58.3 * tt))
L += dk; R += dk
m = np.stack([L, R], 1); m /= max(1e-6, np.abs(m).max()); m *= 0.8
fade = int(1.2 * SR); m[-fade:] *= np.linspace(1, 0, fade)[:, None]
out = os.path.join(adir, "music.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((m * 32767).astype("<i2").tobytes())
print("music", out, round(dur, 1), "s")
