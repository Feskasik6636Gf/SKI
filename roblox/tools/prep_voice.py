"""Prepare a user-supplied voiceover: cut pauses (keep short natural ones), optional speed-up, write
audio/voice.wav + audio/words.json (word/start/end) from raw whisper words.
python tools/prep_voice.py <slug> <voice.mp3> <raw_words.json> [--speed 1.08]"""
import json, os, subprocess, sys
import numpy as np
SR = 48000
slug, src, rawj = sys.argv[1:4]
speed = float(sys.argv[sys.argv.index("--speed") + 1]) if "--speed" in sys.argv else 1.0
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
adir = os.path.join(ROOT, "videos", slug, "audio"); os.makedirs(adir, exist_ok=True)
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                                 stdout=subprocess.PIPE, check=True).stdout, np.float32).copy()
raw = json.load(open(rawj, encoding="utf-8"))
raw[0]["s"] = 0.0 if raw[0]["s"] < 0.3 else raw[0]["s"] - 0.1
GAP_IN, GAP_END = 0.13, 0.24         # silence kept inside a sentence / after . ? !
segs = []; words = []; out_t = 0.0; cur = 0.0   # cur = source time already consumed
chunks = []
def put(a, b):
    global out_t
    s = x[int(a * SR):int(b * SR)].copy(); n = min(len(s) // 2, int(0.012 * SR))
    if n: s[:n] *= np.linspace(0, 1, n); s[-n:] *= np.linspace(1, 0, n)
    chunks.append(s); r = out_t; out_t += len(s) / SR; return r
# lead-in: from first word start - 0.04
first = max(0.0, raw[0]["s"] - 0.04); cur_src = first; run_start = first; shift = 0.0
prev_end = raw[0]["s"]
mapped = []  # (word, new_start, new_end)
seg_a = first; seg_out0 = 0.0; pending = []
def flush(b):
    global seg_a, out_t
    r0 = put(seg_a, b)
    for (w, s, e) in pending: mapped.append((w, r0 + (s - seg_a), r0 + (e - seg_a)))
    pending.clear()
for i, w in enumerate(raw):
    if i > 0:
        gap = w["s"] - raw[i - 1]["e"]
        tgt = GAP_END if raw[i - 1]["w"].rstrip('"»”)').endswith((".", "?", "!")) else GAP_IN
        if gap > tgt + 0.06:
            keep = tgt / 2
            flush(raw[i - 1]["e"] + keep)
            seg_a = w["s"] - keep
            # silence of exactly tgt: both halves are contiguous in output
    pending.append((w["w"], w["s"], w["e"]))
flush(min(raw[-1]["e"] + 0.45, len(x) / SR))
y = np.concatenate(chunks)
tmp = os.path.join(adir, "_cut.wav")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", tmp], input=y.astype("<f4").tobytes(), check=True)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", tmp, "-af", f"atempo={speed}" if speed != 1 else "anull", "-ar", str(SR), "-ac", "1",
                os.path.join(adir, "voice.wav")], check=True)
os.remove(tmp)
res = [{"word": w, "start": round(s / speed, 3), "end": round(e / speed, 3)} for (w, s, e) in mapped]
for i in range(len(res) - 1):
    if res[i]["end"] > res[i + 1]["start"]: res[i]["end"] = res[i + 1]["start"]
json.dump(res, open(os.path.join(adir, "words.json"), "w", encoding="utf-8"), indent=0)
print(f"words {len(res)}, in {len(x)/SR:.1f}s -> out {len(y)/SR/speed:.1f}s, wpm {len(res)/(len(y)/SR/speed)*60:.0f}")
