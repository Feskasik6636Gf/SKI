import numpy as np, subprocess, wave, re, json
SR=44100; DUR=76.4; N=int(SR*DUR)
rng=np.random.default_rng(7)
def tt(d): return np.arange(int(SR*d))/SR
def env(n,a=0.005,d=0.2):
    e=np.ones(n); na=int(a*SR); e[:na]=np.linspace(0,1,na); nd=int(d*SR); 
    if nd>0: e[-nd:]*=np.linspace(1,0,nd)
    return e
def add(buf,sig,t0,g=1.0):
    i=int(t0*SR); j=min(N,i+len(sig))
    if i<N: buf[i:j]+=sig[:j-i]*g
def lp(x,fc):
    a=np.exp(-2*np.pi*fc/SR); y=np.zeros_like(x); s=0
    # fast one-pole via cumulative filter
    from scipy.signal import lfilter
    return lfilter([1-a],[1,-a],x)
def hp(x,fc): return x-lp(x,fc)
def tone(f,d,g=1,dec=3.0,harm=(1,.4,.2)):
    t=tt(d); return sum(h*np.sin(2*np.pi*f*(k+1)*t) for k,h in enumerate(harm))*np.exp(-t*dec)*g
def noise(d): return rng.standard_normal(int(SR*d))
music=np.zeros(N); sfx=np.zeros(N)
T=np.arange(N)/SR
# --- гул: тёмный пад, нарастает ---
prog=np.clip(T/DUR,0,1)
lfo=0.5+0.5*np.sin(2*np.pi*T/9)
drone=(np.sin(2*np.pi*55*T)+0.6*np.sin(2*np.pi*82.4*T+0.5*np.sin(2*np.pi*0.13*T))+0.35*np.sin(2*np.pi*110.5*T))*(0.35+0.4*lfo)
drone+=lp(noise(DUR),220)*6*(0.4+0.6*prog)
drone*=0.05+0.08*prog**1.2
# диссонанс ближе к концу
drone+=0.03*np.sin(2*np.pi*58.3*T)*np.clip((T-50)/20,0,1)
music+=drone
# --- музыка: аккорды (Am - F - C - E) и редкие ноты ---
def pad(freqs,t0,d,g):
    t=tt(d); e=np.minimum(t/2.5,1)*np.minimum((d-t)/2.5,1)
    sig=sum(np.sin(2*np.pi*f*t)+0.4*np.sin(2*np.pi*f*2*t+0.3)+0.15*np.sin(2*np.pi*f*3.01*t) for f in freqs)*e
    sig*=(0.7+0.3*np.sin(2*np.pi*0.25*t))
    add(music,sig,t0,g)
chords=[(110,164.8,220,261.6),(87.3,130.8,174.6,261.6),(130.8,196,261.6,329.6),(82.4,123.5,164.8,207.7)]
mg=np.interp(np.arange(0,DUR,8),[0,30,55,DUR],[0.05,0.06,0.075,0.08])
for i,t0 in enumerate(np.arange(0,DUR,8.0)): pad(chords[i%4],t0,9.5,mg[i]/4)
notes=[440,523.3,659.3,523.3,587.3,493.9,659.3,880]
t0=4.0;k=0
while t0<DUR-2:
    f=notes[(k*3+k//4)%len(notes)]*(0.5 if k%5==0 else 1)
    add(music,tone(f,2.2,1,dec=2.2,harm=(1,.25,.1))*0.9,t0,0.05*min(1,(t0-3)/10)); t0+=1.5+0.5*(k%3); k+=1
# --- сердцебиение с 20 с, ускоряется ---
t=30.0
while t<DUR-1:
    bpm=75+55*(t-30)/(DUR-30); per=60/bpm
    th=tone(52,0.25,1,dec=14,harm=(1,.5)); add(music,th,t,0.22*min(1,(t-30)/8))
    add(music,tone(48,0.22,1,dec=16,harm=(1,.5)),t+0.19,0.15*min(1,(t-30)/8))
    t+=per

def bell(t0,g=0.5):
    add(sfx,tone(880,1.0,1,dec=3.5,harm=(1,.5,.25,.12)),t0,g); add(sfx,tone(660,1.4,1,dec=3,harm=(1,.5,.25)),t0+0.38,g)
def boom(t0,g=0.9):
    t=tt(1.6); f=70*np.exp(-t*1.2)+38; ph=2*np.pi*np.cumsum(f)/SR
    add(sfx,np.sin(ph)*np.exp(-t*2.2),t0,g); add(sfx,hp(noise(0.4),2000)*np.exp(-tt(0.4)*12),t0,0.35)
def riser(t0,d,g=0.25):
    t=tt(d); f=300+1800*(t/d)**2; ph=2*np.pi*np.cumsum(f)/SR
    add(sfx,np.sin(ph)*(t/d)**2*0.6+hp(noise(d),1500)*(t/d)**2*0.2,t0,g)
def tick(t0,g=0.3): add(sfx,tone(1500,0.04,1,dec=70,harm=(1,.5)),t0,g)
# перемотка
d=1.2; t=tt(d); f=2400-1800*(t/d); ph=2*np.pi*np.cumsum(f)/SR; add(sfx,np.sin(ph)*np.hanning(len(t))*0.3+hp(noise(d),2000)*np.hanning(len(t))*0.25,5.28,0.35)
bell(8.5); bell(9.9,0.5)
add(sfx,tone(1800,0.05,1,dec=60,harm=(1,.5)),14.85,0.6); add(sfx,tone(900,0.08,1,dec=40,harm=(1,.5)),14.95,0.6)
# «правильно» — светлый звон, потом фальшивая нота
for i,f in enumerate([880,1108]): add(sfx,tone(f,0.9,1,dec=4,harm=(1,.3,.1)),24.65+i*0.15,0.3)
add(sfx,tone(1170,1.2,1,dec=3,harm=(1,.3)),25.1,0.12)
# выдох
add(sfx,lp(hp(noise(1.2),600),3000)*np.hanning(int(SR*1.2)),25.8,0.18)
# холодный ветер за дверью
add(sfx,hp(lp(noise(3.0),2400),500)*np.hanning(int(SR*3.0)),27.0,0.2)
riser(31.4,1.5,0.3); boom(32.9,0.8); boom(33.44,0.9)
# цифровой «глитч» повтора
for k in range(6): add(sfx,tone(600+k*140,0.05,1,dec=30,harm=(1,.6,.3)),37.3+k*0.05,0.3)
add(sfx,hp(lp(noise(5),2600),700)*np.hanning(int(SR*5)),39.4,0.14)
# воспоминание: звонок, кашель, ключи
bell(46.5,0.35); add(sfx,lp(noise(0.25),900)*np.hanning(int(SR*0.25)),48.0,0.5); add(sfx,lp(noise(0.2),900)*np.hanning(int(SR*0.2)),48.35,0.4)
for i,f in enumerate([2600,3100,2800,3300]): add(sfx,tone(f,0.25,1,dec=14,harm=(1,.5,.2)),48.75+i*0.09,0.2)
for k in range(int((55.5-51.46)/0.5)): tick(51.46+k*0.5)
# медленный скрип и поворот головы
t=tt(3.0); f=55+40*(t/3.0)**1.5; ph=2*np.pi*np.cumsum(f)/SR; add(sfx,np.sin(ph)*np.hanning(len(t))*0.5+lp(noise(3.0),700)*np.hanning(len(t))*0.4,57.5,0.2)
boom(59.7,0.7); riser(58.5,1.2,0.25)
# неживая улыбка: дрожащие высокие ноты
t=tt(3.9); f=520+25*np.sin(2*np.pi*5*t)+60*(t/3.9); ph=2*np.pi*np.cumsum(f)/SR; add(sfx,np.sin(ph)*np.hanning(len(t))*0.4,60.8,0.1)
t=tt(3.9); f=553+25*np.sin(2*np.pi*4.7*t)+62*(t/3.9); ph=2*np.pi*np.cumsum(f)/SR; add(sfx,np.sin(ph)*np.hanning(len(t))*0.4,60.8,0.1)
for i,f in enumerate([2400,3200]): add(sfx,tone(f,0.35,1,dec=9,harm=(1,.5,.2)),64.8+i*0.07,0.22)
for t0 in (70.2,71.2,72.2): tick(t0,0.35)
boom(73.18,0.4)
cuts=[0,2.55,5.28,7.28,8.5,9.88,12.0,14.28,15.66,17.1,19.9,24.6,25.64,27.0,29.82,32.9,33.44,34.7,39.4,41.0,43.15,46.3,48.7,49.86,51.46,55.66,57.5,60.8,64.72,66.9,69.26,73.18]
for c in cuts[1:]:
    d=0.22; w=hp(noise(d),1200)*np.hanning(int(SR*d)); add(sfx,w,c-0.08,0.07)
# --- сведение: голос + музыка с даккингом ---
subprocess.run(['ffmpeg','-v','error','-y','-i','public/voice2.mp3','-ar',str(SR),'-ac','1','/tmp/voice44.wav'],check=True)
w=wave.open('/tmp/voice44.wav'); v=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float64)/32768
voice=np.zeros(N); voice[:min(N,len(v))]=v[:N]
envv=lp(np.abs(voice),8); envv=np.clip(envv*14,0,1)
duck=1-0.35*envv
mix=voice*1.0+music*duck*0.34+sfx*(1-0.25*envv)
mix=np.tanh(mix*1.1)
mix/= max(1e-6,np.abs(mix).max()); mix*=0.9
st=np.stack([mix,mix*0.98],1)
with wave.open('out/mix2.wav','wb') as o:
    o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes((st*32767).astype(np.int16).tobytes())
sp=envv>0.5
rv=np.sqrt(np.mean((voice[sp])**2)); rm=np.sqrt(np.mean((music*duck*0.34)[sp]**2))
print('done',len(mix)/SR,'music/voice dB during speech:',round(20*np.log10(rm/rv),1))
