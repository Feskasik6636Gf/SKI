"""Часть 3: режем паузы в озвучке, чиним текст субтитров, пересчитываем тайминги слов."""
import json, subprocess, re
SIL = [(4.68018,5.13664),(6.89782,7.37707),(13.5471,13.8061),(15.1328,15.4428),(20.7815,21.1454),(22.5915,22.9219),(25.7775,26.2315),(27.6962,28.0949),(29.1341,29.5591),(32.8025,33.2325),(35.0519,35.3073),(39.3149,39.648),(44.4417,44.795),(47.8189,48.118),(50.0519,50.4135),(51.1235,51.3767),(52.3215,52.6338),(53.3424,53.8002),(55.2004,55.5226),(57.6307,57.9719),(58.895,59.1972),(60.3329,60.5902),(62.8573,63.1128),(66.01,66.3336),(68.8077,69.1501),(71.8752,72.2007),(74.0911,74.4355),(76.3814,76.7715),(79.0176,79.3795),(81.7589,82.1207),(83.5933,83.9938),(85.7108,86.1522),(87.359,87.7211),(89.2455,89.5354),(90.0064,90.262)]
KEEP = 0.07   # оставляем по 70 мс тишины с каждой стороны паузы
TOTAL = 91.3502
segs=[]; prev=0.0
for a,b in SIL:
    segs.append((prev, a+KEEP)); prev=b-KEEP
segs.append((prev, TOTAL))
# карта старое->новое время
acc=0.0; mp=[]
for a,b in segs:
    mp.append((a,b,acc)); acc+=b-a
NEW_DUR=acc
def remap(t):
    for a,b,o in mp:
        if t<=b: return o+max(0,t-a) if t>=a else o
    return NEW_DUR
parts=''.join(f"[0:a]atrim={a:.4f}:{b:.4f},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st={max(0,b-a-0.012):.4f}:d=0.012[s{i}];" for i,(a,b) in enumerate(segs))
fc=parts+''.join(f"[s{i}]" for i in range(len(segs)))+f"concat=n={len(segs)}:v=0:a=1[o]"
subprocess.run(['ffmpeg','-v','error','-y','-i','audio/voice3_raw.mp3','-filter_complex',fc,'-map','[o]','-ar','44100','-b:a','192k','public/voice3.mp3'],check=True)
# исправленный текст (по индексам распознавания)
FIX={8:'раз,',15:'утра.',36:'откладывается',37:'на',38:'один',46:'«сюрприз',47:'!»',50:'«еда!».',48:'деды',72:'чинил',79:'горячим,',80:'горячим,',81:'потом',82:'холодным,',93:'Мэр',96:'звать',103:'столоед,',107:'салфеткой',110:'шеи.',119:'Тарелки,',125:'бежал.',156:'отложился на',176:'столовой.',180:'часы',181:'дошли',183:'нуля.',205:'«Милый,'}
FIX[80]='горячим,'; FIX[79]='был'; FIX[82]='холодным,'; FIX[86]='начался'; FIX[109]=''
FIX[50]='«еда».'; FIX[175]='в'; FIX[163]='на'
asr=json.load(open('audio/words3_asr.json'))
out=[]
for i,w in enumerate(asr):
    txt=FIX.get(i,w['w'])
    s_,e_=round(remap(w['s']),3),round(remap(w['e']),3)
    if txt=='' and out: out[-1]['e']=e_; continue
    if out and (re.match(r'^[\-?!».,]',txt)): out[-1]['w']=(out[-1]['w']+txt.replace('-то','-то')).strip(); out[-1]['e']=e_; continue
    out.append({'w':txt,'s':s_,'e':e_})
# гарантируем монотонность и минимальную длину
for i,w in enumerate(out):
    if w['e']<=w['s']: w['e']=w['s']+0.05
    if i+1<len(out) and w['e']>out[i+1]['s']: w['e']=max(w['s']+0.04,out[i+1]['s'])
json.dump(out,open('audio/words3.json','w'),ensure_ascii=False)
json.dump(out,open('src/words3.json','w'),ensure_ascii=False)
json.dump([{'a':round(remap(a),3),'b':round(remap(b),3)} for a,b in SIL],open('audio/gaps3.json','w'))
print('new duration',round(NEW_DUR,2)); print(' '.join(w['w'] for w in out))
