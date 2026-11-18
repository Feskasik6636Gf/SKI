"""Import the user's sound-effect pack (mp3 folder) into sfx/ as pack wavs + pack.json entries."""
import glob, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sfxprep as P
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
src = sys.argv[1]
MAP = {  # file stem -> (pack name, kwargs for prep, gain dB)
    "capcut-explosion-sound": ("ubig", dict(max_len=2.2, events=1), 0),
    "correct": ("uding", dict(max_len=1.2, events=0), -3),
    "slap-soundmaster13-49669815_4L20wGP": ("uslap", dict(max_len=0.8, events=1), -4),
    "discord-notification": ("uping", dict(max_len=0.6, events=0), -2),
    "applepay": ("uchime", dict(max_len=1.3, events=0, onset_db=-20), 2),
    "mouse-click-sound": ("uclick", dict(max_len=0.4, events=1), 0),
    "mac-quack": ("uquack", dict(max_len=1.1, events=0), -4),
    "duck-toy-sound": ("uduck", dict(max_len=0.9, events=0), -4),
    "faaah": ("ufaah", dict(max_len=1.9, events=0), -3),
    "faaaa": ("ufaaa", dict(max_len=2.5, events=0), -3),
    "rizz-sound-effect": ("urizz", dict(max_len=1.9, events=0), -2),
    "dry-fart": ("ufart", dict(max_len=0.4, events=0), -4),
    "movie_1": ("ustinger", dict(max_len=0.85, events=0), -3),
    "1-108": ("urise", dict(max_len=2.2, events=0, onset_db=-30), -5),
}
conf = json.load(open(os.path.join(ROOT, "sfx", "pack.json")))
for f in sorted(glob.glob(os.path.join(src, "*.mp3"))):
    stem = os.path.splitext(os.path.basename(f))[0]
    if stem not in MAP: print("skip", stem); continue
    name, kw, gain = MAP[stem]
    x = P.prep(P.load(f), **kw)
    P.save(os.path.join(ROOT, "sfx", name + ".wav"), x)
    conf[name] = {"gain": gain}
    print(name, round(len(x) / P.SR, 2), "s")
json.dump(conf, open(os.path.join(ROOT, "sfx", "pack.json"), "w"), indent=2)
