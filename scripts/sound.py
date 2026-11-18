import numpy as np, subprocess, wave, re, json
SR=44100; DUR=78.9; N=int(SR*DUR)
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
# --- сердцебиение с 20 с, ускоряется ---
t=20.0
while t<DUR-1:
    bpm=70+60*(t-20)/(DUR-20); per=60/bpm
    th=tone(52,0.25,1,dec=14,harm=(1,.5)); add(music,th,t,0.22*min(1,(t-20)/10))
    add(music,tone(48,0.22,1,dec=16,harm=(1,.5)),t+0.19,0.15*min(1,(t-20)/10))
    t+=per
# --- звонок: дзынь-донг ---
def bell(t0,g=0.5):
    add(sfx,tone(880,1.0,1,dec=3.5,harm=(1,.5,.25,.12)),t0,g); add(sfx,tone(660,1.4,1,dec=3,harm=(1,.5,.25)),t0+0.38,g)
bell(1.48); bell(8.44,0.6)
# --- чашка гремит ---
for k in range(14):
    t0=6.45+k*0.13+rng.random()*0.04
    add(sfx,tone(3300+rng.random()*900,0.12,1,dec=40,harm=(1,.3))*0.6+hp(noise(0.05),3000)[:int(SR*0.05)].mean(),t0,0.18)
# --- сообщения ---
def ping(t0,f=1200,g=0.35): add(sfx,tone(f,0.5,1,dec=7,harm=(1,.3)),t0,g); add(sfx,tone(f*1.5,0.5,1,dec=7,harm=(1,.3)),t0+0.09,g)
ping(25.9,900,0.3); ping(27.5,1250); ping(28.2,1250); ping(29.25,1400,0.45)
# вибрация телефона
for k in range(6): add(sfx,lp(noise(0.12),180)*np.hanning(int(SR*0.12)),29.2+k*0.16,0.7)
# --- удары правил ---
def boom(t0,g=0.9):
    t=tt(1.6); f=70*np.exp(-t*1.2)+38; ph=2*np.pi*np.cumsum(f)/SR
    add(sfx,np.sin(ph)*np.exp(-t*2.2),t0,g)
    add(sfx,hp(noise(0.4),2000)*np.exp(-tt(0.4)*12),t0,0.35)
boom(13.7); boom(31.9)
# нарастающий свист перед ударом
def riser(t0,d,g=0.25):
    t=tt(d); f=300+1800*(t/d)**2; ph=2*np.pi*np.cumsum(f)/SR
    add(sfx,np.sin(ph)*(t/d)**2*0.6+hp(noise(d),1500)*(t/d)**2*0.2,t0,g)
riser(12.9,0.8); riser(31.1,0.8); riser(69.3,1.2,0.3)
# --- щелчок замка ---
add(sfx,tone(1800,0.05,1,dec=60,harm=(1,.5)),40.95,0.6); add(sfx,tone(900,0.08,1,dec=40,harm=(1,.5)),41.05,0.6)
# --- лёд/холод в ванной 42-47.7 ---
w=hp(lp(noise(5.5),2400),500)*np.hanning(int(SR*5.5))*0.8
add(sfx,w,42.2,0.18)
for t0 in (44.1,45.78): add(sfx,tone(180,0.6,1,dec=4,harm=(1,.6,.3))*np.hanning(int(SR*0.6)),t0,0.08)
# --- шкатулка (воспоминание) ---
for i,f in enumerate([784,880,988,784,659]): add(sfx,tone(f,0.7,1,dec=5,harm=(1,.3,.1)),50.0+i*0.28,0.18)
# --- глаз в глазке: скрип ---
add(sfx,lp(noise(0.9),600)*np.sin(2*np.pi*3*tt(0.9))**2,38.62,0.25)
# --- щель / чай / ключ ---
add(sfx,tone(2400,0.3,1,dec=9,harm=(1,.5,.2)),63.14,0.25); add(sfx,tone(3200,0.3,1,dec=9,harm=(1,.5,.2)),63.2,0.18)
# --- свист воздуха на каждый склейке ---
cuts=[0,1.48,4.45,6.4,8.4,9.88,11.8,13.7,15.0,18.9,20.34,24.42,29.02,31.9,33.24,37.3,40.2,42.2,47.75,49.96,51.48,53.45,56.8,60.5,65.3,70.6,75.5]
for c in cuts[1:]:
    d=0.22; w=hp(noise(d),1200)*np.hanning(int(SR*d)); add(sfx,w,c-0.08,0.07)
# --- удар в конце ---
boom(75.5,0.35)
# --- сведение: голос + музыка с даккингом ---
subprocess.run(['ffmpeg','-v','error','-y','-i','public/voice.mp3','-ar',str(SR),'-ac','1','/tmp/voice44.wav'],check=True)
w=wave.open('/tmp/voice44.wav'); v=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float64)/32768
voice=np.zeros(N); voice[:min(N,len(v))]=v[:N]
envv=lp(np.abs(voice),8); envv=np.clip(envv*14,0,1)
duck=1-0.55*envv
mix=voice*1.0+music*duck*1.0+sfx*(1-0.25*envv)
mix=np.tanh(mix*1.1)
mix/= max(1e-6,np.abs(mix).max()); mix*=0.9
st=np.stack([mix,mix*0.98],1)
with wave.open('out/mix.wav','wb') as o:
    o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes((st*32767).astype(np.int16).tobytes())
print('done',len(mix)/SR)
