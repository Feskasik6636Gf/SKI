"""Режет паузы в озвучке и пересчитывает тайминги слов. -> audio/bracelet_words.json, audio/bracelet_voice_cut.wav"""
import json, subprocess, wave, numpy as np
SR = 44100
raw = json.load(open('audio/bracelet_words_raw.json'))
subprocess.run(['ffmpeg','-v','error','-y','-i','audio/bracelet_voice_raw.mp3','-ar',str(SR),'-ac','1','/tmp/bv.wav'],check=True)
w = wave.open('/tmp/bv.wav'); v = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64)/32768
TAIL, HEAD = 0.05, 0.04            # сколько тишины оставляем у слов
SENT, COMMA, WORD = 0.20, 0.11, 0.05   # максимум паузы после ./?!  после ,  между словами
segs = []; words = []; out = 0.0
pieces = []
cur_src = 0.0
def sec(a,b): return v[int(a*SR):int(b*SR)]
fade = int(0.006*SR)
t_out = 0.0
chunks = []
start_src = max(0, raw[0]['s']-0.03)
chunk_start = start_src
for i, wd in enumerate(raw):
    last = i == len(raw)-1
    gap = 9 if last else raw[i+1]['s'] - wd['e']
    punct = wd['w'][-1]
    cap = SENT if punct in '.?!' else COMMA if punct == ',' else WORD
    keep = min(gap, cap)
    if last: keep = 0.3
    if gap > cap + TAIL + HEAD:       # режем: оставляем хвост, потом голову следующего
        end_src = wd['e'] + max(TAIL, keep/2)
        chunks.append((chunk_start, end_src, keep - max(TAIL, keep/2) if not last else 0))
        chunk_start = raw[i+1]['s'] - max(HEAD, keep - max(TAIL, keep/2)) if not last else None
if chunk_start is not None: chunks.append((chunk_start, raw[-1]['e']+0.3, 0))
# склейка
audio = []; mapping = []   # (src_start, src_end, out_start)
pos = 0.0
for (a, b, _) in chunks:
    x = sec(a, b).copy()
    n = len(x); f = min(fade, n//2)
    x[:f] *= np.linspace(0,1,f); x[-f:] *= np.linspace(1,0,f)
    mapping.append((a, b, pos)); audio.append(x); pos += n/SR
y = np.concatenate(audio)
def mp(t):
    for a,b,o in mapping:
        if a-1e-6 <= t <= b+1e-6: return o + (t-a)
    # в вырезанной зоне -> начало следующего куска
    for a,b,o in mapping:
        if t < a: return o
    return pos
nw = [{'w': wd['w'], 's': round(mp(wd['s']),3), 'e': round(mp(wd['e']),3)} for wd in raw]
for i in range(len(nw)):   # ничего не перекрывается
    if i and nw[i]['s'] < nw[i-1]['e']: nw[i]['s'] = nw[i-1]['e']
json.dump(nw, open('audio/bracelet_words.json','w'), ensure_ascii=False)
json.dump(nw, open('src/bracelet_words.json','w'), ensure_ascii=False)
with wave.open('audio/bracelet_voice_cut.wav','wb') as o:
    o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes((np.clip(y,-1,1)*32767).astype(np.int16).tobytes())
print('src', len(v)/SR, '-> cut', len(y)/SR, 'words end', nw[-1]['e'])
