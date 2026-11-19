import numpy as np, subprocess, wave, re, json
SR=44100; DUR=88.9; N=int(SR*DUR)
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
t=22.0
while t<DUR-1:
    bpm=72+60*(t-22)/(DUR-22); per=60/bpm
    th=tone(52,0.25,1,dec=14,harm=(1,.5)); add(music,th,t,0.22*min(1,(t-22)/8))
    add(music,tone(48,0.22,1,dec=16,harm=(1,.5)),t+0.19,0.15*min(1,(t-22)/8))
    t+=per

def boom(t0,g=0.9):
    t=tt(1.6); f=70*np.exp(-t*1.2)+38; ph=2*np.pi*np.cumsum(f)/SR
    add(sfx,np.sin(ph)*np.exp(-t*2.2),t0,g); add(sfx,hp(noise(0.4),2000)*np.exp(-tt(0.4)*12),t0,0.35)
def riser(t0,d,g=0.25):
    t=tt(d); f=300+1800*(t/d)**2; ph=2*np.pi*np.cumsum(f)/SR
    add(sfx,np.sin(ph)*(t/d)**2*0.6+hp(noise(d),1500)*(t/d)**2*0.2,t0,g)
def tick(t0,g=0.3): add(sfx,tone(1500,0.04,1,dec=70,harm=(1,.5)),t0,g)
def jingle(t0,g=0.22):
    for i,f in enumerate([2600,3100,2800,3300,2500]): add(sfx,tone(f,0.25,1,dec=14,harm=(1,.5,.2)),t0+i*0.07,g)
def step(t0,g=0.5): add(sfx,tone(70,0.18,1,dec=18,harm=(1,.5))+lp(noise(0.1),400)[:int(SR*0.18)].mean(),t0,g)
def whoosh(t0,d=0.6,g=0.25):
    w=hp(lp(noise(d),3500),400)*np.hanning(int(SR*d)); add(sfx,w,t0,g)
# открыть дверь: скрип
t=tt(1.7); f=180+120*(t/1.7)**2+8*np.sin(2*np.pi*14*t); ph=2*np.pi*np.cumsum(f)/SR
add(sfx,(np.sin(ph)*0.5+lp(noise(1.7),900)*0.5)*np.hanning(len(t)),15.55,0.2); riser(14.6,0.9,0.18)
boom(0.1,0.5); jingle(1.7,0.2)
for k in range(int((15.5-13.1)/0.5)): tick(13.1+k*0.5)
boom(5.95,0.5)
add(sfx,lp(noise(1.9),300)*(0.5+0.5*np.sin(2*np.pi*11*tt(1.9)))*np.hanning(int(SR*1.9)),19.7,0.3)
jingle(21.6,0.25); jingle(27.3,0.2)
whoosh(30.7,0.7,0.35)
add(sfx,tone(60,2.0,1,dec=1.5,harm=(1,.5,.3)),38.84,0.35)
for k in range(5): add(sfx,tone(500+k*150,0.05,1,dec=30,harm=(1,.6,.3)),40.0+k*0.04,0.28); add(sfx,tone(480+k*140,0.05,1,dec=30,harm=(1,.6,.3)),41.0+k*0.04,0.28)
for k in range(int((46.7-43.9)/0.62)): add(sfx,tone(55,0.3,1,dec=10,harm=(1,.6)),43.9+k*0.62,0.35)
# тишина: нарастающий свист и обрыв
d=5.1; t=tt(d); f=300+2200*(t/d)**2.2; ph=2*np.pi*np.cumsum(f)/SR; add(sfx,np.sin(ph)*(t/d)**1.5*0.5+hp(noise(d),2000)*(t/d)**2*0.15,49.45,0.3)
boom(54.94,1.0)
for k in range(5): add(sfx,tone(600+k*120,0.05,1,dec=30,harm=(1,.6,.3)),57.6+k*0.05,0.25)
add(sfx,hp(noise(0.8),1000)*np.hanning(int(SR*0.8)),59.5,0.3); boom(60.4,0.7)
step(62.9); step(64.82); step(65.0,0.35); whoosh(66.2,0.5,0.2); whoosh(67.7,0.5,0.2)
d=2.5; t=tt(d); f=900-500*(t/d); ph=2*np.pi*np.cumsum(f)/SR; add(sfx,np.sin(ph)*np.hanning(len(t))*0.25+hp(noise(d),1500)*np.hanning(len(t))*0.1,69.1,0.22)
for t0 in (72.9,73.55,74.15): whoosh(t0,0.3,0.4)
boom(84.78,0.5)
cuts=[0,2.6,5.0,6.94,10.84,13.1,15.5,17.46,19.7,21.6,23.08,27.1,30.78,32.42,33.96,36.72,39.66,43.88,46.78,49.44,54.94,56.18,62.02,64.08,65.98,67.54,69.06,72.52,75.18,78.2,81.6,84.78]
for c in cuts[1:]:
    d=0.22; w=hp(noise(d),1200)*np.hanning(int(SR*d)); add(sfx,w,c-0.08,0.07)
# обрыв музыки перед правилом
g0,g1=int(54.45*SR),int(54.94*SR); music[g0:g1]*=0.03
# --- сведение: голос + музыка с даккингом ---
subprocess.run(['ffmpeg','-v','error','-y','-i','public/voice3.mp3','-ar',str(SR),'-ac','1','/tmp/voice44.wav'],check=True)
w=wave.open('/tmp/voice44.wav'); v=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float64)/32768
voice=np.zeros(N); voice[:min(N,len(v))]=v[:N]
envv=lp(np.abs(voice),8); envv=np.clip(envv*14,0,1)
duck=1-0.35*envv
mix=voice*1.0+music*duck*0.34+sfx*(1-0.25*envv)
mix=np.tanh(mix*1.1)
mix/= max(1e-6,np.abs(mix).max()); mix*=0.9
st=np.stack([mix,mix*0.98],1)
with wave.open('out/mix3.wav','wb') as o:
    o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes((st*32767).astype(np.int16).tobytes())
sp=envv>0.5
rv=np.sqrt(np.mean((voice[sp])**2)); rm=np.sqrt(np.mean((music*duck*0.34)[sp]**2))
print('done',len(mix)/SR,'music/voice dB during speech:',round(20*np.log10(rm/rv),1))
