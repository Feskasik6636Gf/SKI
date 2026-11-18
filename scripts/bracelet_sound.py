"""Микс: голос (без пауз) + музыка + SFX из пака пользователя и синтезированные. -> public/bracelet_mix.mp3"""
import numpy as np, subprocess, wave, json
from scipy.signal import lfilter
SR=44100
W=json.load(open('src/bracelet_words.json')); CUTS=json.load(open('src/bracelet_cuts.json'))
DUR=W[-1]['e']+0.45; N=int(SR*DUR)
rng=np.random.default_rng(3)
def load(f):
    r=subprocess.run(['ffmpeg','-v','error','-i',f,'-f','s16le','-ac','1','-ar',str(SR),'-'],capture_output=True).stdout
    return np.frombuffer(r,dtype=np.int16).astype(np.float64)/32768
def tt(d): return np.arange(int(SR*d))/SR
def add(buf,sig,t0,g=1.0):
    i=int(max(0,t0)*SR); j=min(N,i+len(sig))
    if i<N and j>i: buf[i:j]+=sig[:j-i]*g
def lp(x,fc): a=np.exp(-2*np.pi*fc/SR); return lfilter([1-a],[1,-a],x)
def hp(x,fc): return x-lp(x,fc)
def tone(f,d,dec=4,harm=(1,.4,.2)): t=tt(d); return sum(h*np.sin(2*np.pi*f*(k+1)*t) for k,h in enumerate(harm))*np.exp(-t*dec)
def noise(d): return rng.standard_normal(int(SR*d))
def trim(x,a,b,fo=0.03):
    y=x[int(a*SR):int(b*SR)].copy(); n=min(int(fo*SR),len(y)//2); y[-n:]*=np.linspace(1,0,n); return y
ws=lambda i: W[i]['s']; we=lambda i: W[i]['e']
S={n:load(f'public/sfx/{n}.mp3') for n in ['applepay','buzz108','click','correct','discord','duck','explosion','faaaa','faaah','fart','movie_1','quack','rizz','slap']}
sfx=np.zeros(N); music=np.zeros(N)
# --- синтез ---
def whoosh(t0,d=0.28,g=0.28,up=True):
    n=int(SR*d); x=noise(d); f=np.linspace(400,3500,n) if up else np.linspace(3500,400,n)
    y=lfilter([1],[1],x)*np.sin(np.pi*np.arange(n)/n)**2
    y=hp(lp(y,2600),500)*1.0; add(sfx,y,t0,g)
def pop(t0,g=.3): add(sfx,tone(520,0.12,28,(1,.3))*1.2,t0,g)
def thud(t0,g=.6):
    t=tt(0.5); f=110*np.exp(-t*9)+45; add(sfx,np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*8),t0,g)
def bzzt(t0,d=0.7,g=.3):
    t=tt(d); x=np.sign(np.sin(2*np.pi*95*t))*0.6+np.sign(np.sin(2*np.pi*190*t+1))*0.3
    x*=(0.6+0.4*np.sign(np.sin(2*np.pi*22*t)))*np.minimum(1,(d-t)*12); add(sfx,lp(x,3500),t0,g)
def coin(t0,g=.25): add(sfx,tone(1760,0.35,9,(1,.5,.25))+tone(2349,0.35,9,(1,.4))*0.8,t0,g)
def riser(t0,d,g=.2):
    t=tt(d); f=250+2400*(t/d)**2; y=np.sin(2*np.pi*np.cumsum(f)/SR)*(t/d)**2*.5+hp(noise(d),1500)*(t/d)**2*.25; add(sfx,y,t0,g)
def ding(t0,g=.3,f=1320): add(sfx,tone(f,0.9,4,(1,.5,.25,.1)),t0,g)
def hb(t0,g=.3): thud(t0,g); thud(t0+0.2,g*0.7)
# --- звуки пользователя в нужных местах ---
def U(name,t0,g=.6,lead=0.0,dur=None,fo=0.05):
    x=S[name]; x=trim(x,0,dur,fo) if dur else x; add(sfx,x,t0-lead,g)
buz=trim(S['buzz108'],0.35,1.15,0.08)
def BUZ(t0,g=.5): add(sfx,buz,t0,g)
# ============ расстановка по словам ============
U('movie_1',ws(0)-0.05,.5)                                    # хук: удар
U('discord',ws(6)+0.05,.5); thud(ws(7)-0.02,.5)               # 100 words
for k in range(4): pop(ws(3)+0.15*k,.22)
for i,k in enumerate(range(8)): add(sfx,S['click'][int(0.95*SR):int(1.35*SR)],ws(10)+0.28*i,0.5) if i<5 else None  # счётчик тикает
U('discord',ws(14),.4)                                         # blue
U('correct',ws(17)+0.55,.35)                                   # age 9
for i in range(5): add(sfx,S['click'][int(0.95*SR):int(1.35*SR)],ws(22)+0.18+i*0.22,0.55)  # пальцы
U('rizz',ws(28),.45,lead=0.25,dur=1.2)                         # rich kids
U('applepay',ws(30)+0.1,.9); coin(ws(31)); coin(ws(31)+0.12); coin(ws(32)+0.05)
U('applepay',ws(35)+0.1,.9)
U('slap',ws(37)-0.05,.35,lead=0.1); U('duck',ws(41)-0.05,.7)    # Leo 200
U('quack',ws(43)+0.1,.55); U('fart',ws(46),.35)                 # radio
riser(ws(47)-0.9,0.8,.18); BUZ(ws(51)-0.05,.7); U('explosion',ws(51)-0.05,.22,dur=1.2)   # buzz
U('slap',ws(54),.5,lead=0.12)                                   # everyone stares
add(sfx,tone(150,1.0,3,(1,.4)),ws(54),.12)
U('discord',ws(56)+0.1,.35)                                     # grandpa
ding(ws(63)-0.1,.2,880); ding(ws(63)+0.15,.18,1109)             # flashback
U('correct',ws(74),.4)                                          # hour
for i in range(4): add(sfx,S['click'][int(0.95*SR):int(1.2*SR)],ws(72)+i*0.3,.4)
U('slap',ws(77),.3,lead=0.1); U('quack',ws(82),.4)              # tower complain
U('duck',ws(85),.5); U('duck',ws(86)+0.25,.45)                  # laughed
U('movie_1',ws(92)-0.05,.45); thud(ws(92),.4)                   # sign
U('duck',ws(99),.35)                                            # mom
U('discord',ws(104),.5); U('discord',ws(104)+0.5,.4)            # phone
for i in range(3): ding(ws(107)+i*0.35,.15,[784,988,1175][i])   # sing
BUZ(ws(111)+0.35,.01)
U('correct',ws(113),.4)                                         # still 71
U('faaah',ws(116)-0.05,.3,dur=1.0)                              # weird thing
for i,tt_ in enumerate([ws(120),ws(124)]): BUZ(tt_,.45); 
U('click',ws(126)-0.9,.5,dur=None) if False else None           # (not when I talk)
U('discord',ws(129),.5)
for i in range(3): U('correct',ws(132)+0.01+i*0.0,.0); coin(ws(131)+i*0.38,.35)
U('slap',ws(135),.3,lead=0.1); thud(ws(138),.35)                # sign hung
U('movie_1',ws(142)-0.05,.5); riser(ws(142)-0.7,0.65,.2)        # double!
U('applepay',ws(147),.8); U('faaaa',ws(148),.14,dur=1.4)        # ring sold
U('duck',ws(153),.35); ding(ws(155),.22,1568)                   # birthday
U('slap',ws(159),.35,lead=0.1); U('faaah',ws(160),.28,dur=1.1)  # never counted
BUZ(ws(165),.5)                                                 # mayor buzzes
BUZ(ws(170),.5)
U('discord',ws(172),.3); pop(ws(175)); 
for i in range(5): add(sfx,hp(noise(0.12),2500)*np.hanning(int(SR*.12)),ws(179)+0.12+i*0.2,.22)  # шуршание фольги
U('duck',ws(186),.45)                                           # burrito
pop(ws(187)+0.05,.3)
pop(ws(197),.35); U('quack',ws(197),.35); pop(ws(199),.35); pop(ws(201),.35)   # dog, shoes, hour
U('movie_1',ws(202)-0.05,.4); U('applepay',ws(203),.8)          # 300 words
U('correct',ws(204),.6)                                         # no buzz
U('rizz',ws(206)-0.1,.35,dur=1.1)                               # Leo saw me
U('quack',ws(212),.4)                                           # wrapper
riser(ws(217)-0.3,.8,.12)
U('explosion',ws(222),.14,dur=1.5)                              # yelling
U('fart',ws(228),.3)                                            # forgot
riser(ws(233)-0.6,.6,.2); hb(ws(236))                           # red light
U('slap',ws(238),.35); 
for tt_ in (ws(241)+0.8,): pass
BUZ(ws(245),.7); U('explosion',ws(245),.24,dur=1.8)             # buzzed anyway
U('faaah',ws(247),.16,dur=1.2)
ding(we(250)-0.3,.35,1976); ding(we(250)-0.3,.15,1568)          # name
# --- whoosh на каждый склейке ---
for k,i in enumerate(CUTS[1:],1):
    a=ws(i)-0.05; whoosh(a-0.06,0.26,.22,up=(k%2==0))
# --- музыка: энергичная петля 120bpm, Am-F-C-G ---
bpm=124; beat=60/bpm; prog=np.clip(np.arange(N)/SR/DUR,0,1)
chords=[(220,261.6,329.6),(174.6,220,261.6),(261.6,329.6,392),(196,246.9,392)]
bassn=[55,43.65,65.4,49]
for bar in range(int(DUR/(beat*4))+1):
    t0=bar*beat*4; ch=chords[bar%4]; g=0.55+0.45*min(1,bar/6)
    for st in range(8):
        tn=t0+st*beat/2; f=bassn[bar%4]*(2 if st%4==3 else 1)
        add(music,tone(f,beat*0.5,5,(1,.5,.25))*0.5,tn,g*0.5)
    for st in range(4):
        add(music,sum(tone(f,beat*0.9,3.5,(1,.3)) for f in ch)*0.18,t0+st*beat,g*0.5)
    for st in range(8):
        n=ch[(st*3)%3]*2*(2 if st%2 else 1)
        add(music,tone(n,beat*0.45,6,(1,.25))*0.22,t0+st*beat/2,g*0.45)
    for st in range(4):
        add(music,hp(noise(0.05),6000)*np.exp(-tt(0.05)*60)*0.4,t0+st*beat+beat/2,g*0.5)   # hat
        if st%2==0: add(music,np.sin(2*np.pi*np.cumsum(60*np.exp(-tt(0.18)*18)+42)/SR)*np.exp(-tt(0.18)*14),t0+st*beat,g*0.7)  # kick
        else: add(music,hp(noise(0.12),1500)*np.exp(-tt(0.12)*25)*0.5,t0+st*beat,g*0.5)  # snare
# --- сведение ---
v=load('audio/bracelet_voice_cut.wav') if False else None
w=wave.open('audio/bracelet_voice_cut.wav'); v=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float64)/32768
voice=np.zeros(N); voice[:min(N,len(v))]=v[:N]
voice=np.tanh(voice*1.6)/np.tanh(1.6)*0.9
envv=np.clip(lp(np.abs(voice),9)*14,0,1)
mix=voice+music*(1-0.7*envv)*0.20+sfx*(1-0.45*envv)*0.8
mix=np.tanh(mix*1.05); mix/=np.abs(mix).max(); mix*=0.92
mix[:int(.02*SR)]*=np.linspace(0,1,int(.02*SR)); mix[-int(.5*SR):]*=np.linspace(1,0,int(.5*SR))
st=np.stack([mix,mix],1)
with wave.open('/tmp/mix.wav','wb') as o:
    o.setnchannels(2);o.setsampwidth(2);o.setframerate(SR);o.writeframes((st*32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg','-v','error','-y','-i','/tmp/mix.wav','-af','loudnorm=I=-14:TP=-1.5','-b:a','192k','public/bracelet_mix.mp3'],check=True)
sp=envv>.5
print('dur',DUR,'voice rms',np.sqrt(np.mean(voice[sp]**2)).round(3),'music during speech dB',round(20*np.log10(np.sqrt(np.mean((music*(1-.7*envv)*.2)[sp]**2))/np.sqrt(np.mean(voice[sp]**2))),1),'sfx dB',round(20*np.log10(np.sqrt(np.mean((sfx*(1-.45*envv))[sp]**2))/np.sqrt(np.mean(voice[sp]**2))),1))
