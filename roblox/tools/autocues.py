"""Add soft transition whooshes on shot cuts that have no sound of their own. python tools/autocues.py <slug>"""
import json, os, sys
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
a = os.path.join(ROOT, "videos", sys.argv[1], "audio")
cues = json.load(open(os.path.join(a, "cues.json"))); shots = json.load(open(os.path.join(a, "shots.json")))
loud = {"whoosh", "poof", "ustinger", "ubig", "uslap", "boom", "buzzer", "uriser", "urise", "ding", "uding", "uchime", "thud"}
add = 0
for s in shots:
    if s["id"] == 1: continue
    near = [c for c in cues if s["t0"] - 0.25 <= c["t"] <= s["t0"] + 0.35 and c["name"] in loud]
    if not near and s["id"] % 2 == 0:
        cues.append({"t": round(s["t0"] - 0.03, 3), "name": "whoosh", "vol": 0.32, "shot": s["id"]}); add += 1
cues.sort(key=lambda c: c["t"])
json.dump(cues, open(os.path.join(a, "cues.json"), "w"), indent=1)
print("autocues +", add, "total", len(cues))
