"""Finish the bracelet video: mix audio (voice + sfx cues + music), Titan One white captions, mux.
python tools/finish_bw.py <slug> [--video-in chunks.mp4] [--cap-size 84]
video source: --video-in (already encoded video-only mp4) else videos/<slug>/frames/%04d.png"""
import argparse, json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
ap = argparse.ArgumentParser(); ap.add_argument("slug"); ap.add_argument("--video-in", default="")
ap.add_argument("--cap-size", type=int, default=84); ap.add_argument("--cap-y", type=int, default=1480)
ap.add_argument("--music-db", default="-14"); ap.add_argument("--sfx-db", default="-10")
o = ap.parse_args()
vdir = os.path.join(ROOT, "videos", o.slug); adir = os.path.join(vdir, "audio"); odir = os.path.join(vdir, "out"); os.makedirs(odir, exist_ok=True)
subprocess.run([sys.executable, os.path.join(HERE, "mix.py"), "--video", o.slug, "--music-db", o.music_db, "--sfx-db", o.sfx_db], check=True)
words = json.load(open(os.path.join(adir, "words.json"), encoding="utf-8"))

def ts(t):
    cs = int(round(max(t, 0) * 100)); return f"{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}"
head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Titan One,{o.cap_size},&H00FFFFFF,&H00FFFFFF,&H00101010,&H90000000,0,0,0,0,100,100,1,0,1,8,4,5,40,40,40,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
# chunks: up to 3 words / 20 chars, cut after punctuation
chunks, cur = [], []
for i, w in enumerate(words):
    txt = re.sub(r"[^\w'$%,.!?]", "", w["word"]).upper()
    if not txt: continue
    L = sum(len(x[1]) + 1 for x in cur) + len(txt)
    if cur and (len(cur) >= 3 or L > 20): chunks.append(cur); cur = []
    cur.append((i, txt))
    if txt[-1] in ".!?," and len(cur) >= 1 and (txt[-1] != "," or len(cur) >= 2): chunks.append(cur); cur = []
if cur: chunks.append(cur)
lines = []
LAG = 0.0
for ci, ch in enumerate(chunks):
    nxt = words[chunks[ci + 1][0][0]]["start"] if ci + 1 < len(chunks) else words[-1]["end"] + 0.5
    for p, (wi, _) in enumerate(ch):
        s = 0.0 if wi == 0 else words[wi]["start"] + LAG
        e = (words[ch[p + 1][0]]["start"] + LAG) if p + 1 < len(ch) else min(nxt, words[wi]["end"] + 0.35)
        if e <= s + 0.02: e = s + 0.05
        parts = []
        for q, (wj, tx) in enumerate(ch):
            tx = tx.rstrip(".,!?") if tx.rstrip(".,!?") else tx
            if q > p: parts.append("{\\alpha&HFF&}" + tx)
            elif q == p: parts.append("{\\fscx116\\fscy116}" + tx + "{\\fscx100\\fscy100}")
            else: parts.append(tx)
        pop = "{\\fscx72\\fscy72\\t(0,90,\\fscx108\\fscy108)\\t(90,170,\\fscx100\\fscy100)}" if p == 0 else ""
        lines.append(f"Dialogue: 0,{ts(s)},{ts(e)},Cap,,0,0,0,,{{\\an5\\pos(540,{o.cap_y})}}{pop}" + " ".join(parts))
open(os.path.join(vdir, "captions.ass"), "w", encoding="utf-8").write(head + "\n".join(lines) + "\n")
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", os.path.join(adir, "mix.m4a")], capture_output=True, text=True).stdout)
os.chdir(vdir)
src = (["-i", o.video_in] if o.video_in else ["-framerate", "30", "-i", os.path.join("frames", "%04d.png")])
fonts = os.path.join(ROOT, "assets", "fonts")
enc = ["-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-t", f"{dur:.3f}", "-movflags", "+faststart"]
subprocess.run(["ffmpeg", "-v", "error", "-y"] + src + ["-i", os.path.join("audio", "mix.m4a"), "-vf", f"ass=captions.ass:fontsdir={fonts}", "-map", "0:v", "-map", "1:a"] + enc + [os.path.join("out", "final.mp4")], check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y"] + src + ["-i", os.path.join("audio", "mix.m4a"), "-map", "0:v", "-map", "1:a"] + enc + [os.path.join("out", "final_nocaptions.mp4")], check=True)
vbr = max(900, int(24 * 8 * 1024 / dur) - 160)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join("out", "final.mp4"), "-vf", "scale=720:1280", "-c:v", "libx264", "-preset", "slow", "-b:v", f"{vbr}k",
                "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", os.path.join("out", "final_phone.mp4")], check=True)
print("done", os.path.join(vdir, "out", "final.mp4"), f"{dur:.2f}s")
