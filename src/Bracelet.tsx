import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Bubble, Brace, C, Coin, Hand, House, Person, Room, Sky, Street, TITAN, Tag, Tower, Txt, OUT, back, clamp01, ease, rnd} from './bkit';
import words from './bracelet_words.json';
import cuts from './bracelet_cuts.json';

export const FPS = 30;
type W = {w: string; s: number; e: number};
const WORDS = words as W[];
export const DURATION = WORDS[WORDS.length - 1].e + 0.45;
const START = cuts.map((i, k) => (k === 0 ? 0 : Math.max(0, WORDS[i].s - 0.05)));

// ---------- общие эффекты ----------
const Burst: React.FC<{t: number; c1: string; c2: string; n?: number}> = ({t, c1, c2, n = 16}) => (
  <g>
    <rect width="1080" height="1920" fill={c1} />
    <g transform={`translate(540 900) rotate(${t * 12})`}>
      {Array.from({length: n}).map((_, i) => <path key={i} d={`M0 0 L ${-170} -1700 L ${170} -1700 Z`} fill={c2} opacity="0.55" transform={`rotate(${(360 / n) * i})`} />)}
    </g>
  </g>
);
const Dots: React.FC<{t: number; n?: number; c?: string; sp?: number}> = ({t, n = 18, c = '#fff', sp = 1}) => (
  <g>{Array.from({length: n}).map((_, i) => <circle key={i} cx={rnd(i) * 1080} cy={((rnd(i + 5) * 2200 - t * 90 * sp * (0.5 + rnd(i + 2))) % 2200 + 2200) % 2200 - 150} r={4 + rnd(i + 8) * 10} fill={c} opacity={0.35} />)}</g>
);
const Lines: React.FC<{t: number; c?: string}> = ({t, c = '#fff'}) => (
  <g opacity="0.6">{Array.from({length: 14}).map((_, i) => { const a = (i / 14) * Math.PI * 2 + Math.floor(t * 20) * 0.1; const r1 = 420 + rnd(i + Math.floor(t * 20)) * 120; return <line key={i} x1={540 + Math.cos(a) * r1} y1={900 + Math.sin(a) * r1} x2={540 + Math.cos(a) * 1500} y2={900 + Math.sin(a) * 1500} stroke={c} strokeWidth={6 + rnd(i) * 10} />; })}</g>
);
const Crowd: React.FC<{t: number; y: number; n: number; seed?: number; s?: number; talk?: boolean; stare?: boolean; span?: number; yell?: boolean}> = ({t, y, n, seed = 0, s = 0.3, talk, stare, span = 1000, yell}) => (
  <g>{Array.from({length: n}).map((_, i) => {
    const xx = 40 + (span / n) * (i + 0.5) + rnd(i + seed) * 24; const yy = y + (i % 3) * 36 - (i % 2) * 18;
    const cols = [C.pink, C.green, C.gold, C.purple, C.orange, '#35c6e0'];
    const bob = Math.abs(Math.sin(t * (stare ? 0 : 6 + rnd(i) * 3) + i)) * 14;
    return <Person key={i} x={xx} y={yy - bob} s={s} shirt={cols[(i + seed) % 6]} skin={i % 3 === 0 ? '#f0b88f' : C.skin} style={['short', 'spike', 'bun', 'long', 'cap'][(i + seed) % 5] as any}
      hair={['#3a2a22', '#222', '#a0522d', '#d9a441'][i % 4]} full brace={['#2f8cff', '#ff3b4a', '#3fd17a'][i % 3]} btext={String(Math.floor(rnd(i + 3) * 99))} arm={0.9}
      mouth={yell ? 'open' : talk ? 'talk' : stare ? 'flat' : 'smile'} look={stare ? 0 : 0} t={t + i * 0.37} />;
  })}</g>
);
const Spark: React.FC<{x: number; y: number; s?: number; t: number; c?: string}> = ({x, y, s = 1, t, c = '#fff'}) => (
  <path d="M0 -50 L 12 -12 L 50 0 L 12 12 L 0 50 L -12 12 L -50 0 L -12 -12 Z" fill={c} stroke={OUT} strokeWidth="5" transform={`translate(${x} ${y}) rotate(${t * 60}) scale(${s * (0.8 + 0.2 * Math.sin(t * 9))})`} />
);

type Ctx = {t: number; lt: number; d: number; p: number};
type CamCfg = {s?: [number, number]; x?: [number, number]; y?: [number, number]; r?: [number, number]; shake?: number};
type Tr = 'punch' | 'whip' | 'flash' | 'zoom' | 'spin';
type Shot = {cam: CamCfg; tr?: Tr; sub?: number; hud?: boolean; render: (c: Ctx) => React.ReactNode};

const bg = (t: number, c1: string) => <rect width="1080" height="1920" fill={c1} />;

// ---------- 49 планов ----------
const SHOTS: Shot[] = [
  // 0 «In this town,»
  {cam: {s: [1, 1.7], x: [0, 190], y: [0, -250], shake: 0.4}, tr: 'zoom', render: ({t}) => (<g><Street t={t} shift={Math.sin(t) * 20} />
    <Crowd t={t} y={1520} n={4} seed={1} s={0.42} span={1060} /></g>)},
  // 3 «everyone gets exactly»
  {cam: {s: [1.25, 1], x: [-120, 60]}, tr: 'whip', render: ({t, lt}) => (<g><Street t={t} />
    <Crowd t={t} y={1430} n={7} seed={2} s={0.34} />
    {[0, 1, 2, 3].map((i) => <Bubble key={i} x={160 + i * 260} y={1000 - Math.sin(t * 3 + i) * 12} text="100" s={46} sc={back((lt - i * 0.12) * 3.5)} rot={i % 2 ? 6 : -6} />)}</g>)},
  // 7 «100 words a day.»
  {cam: {s: [0.9, 1.12], shake: 0.5}, tr: 'flash', sub: 1560, render: ({t, lt}) => (<g><Burst t={t} c1="#3b82f6" c2="#60a5fa" />
    <g transform={`translate(540 760) scale(${0.6 + 0.4 * back(lt * 4)})`}><Txt y="0" s="400" fill={C.gold} sw={28}>100</Txt><Txt y="190" s="150" sw={20}>WORDS / DAY</Txt></g>
    <Dots t={t} c="#fff" /></g>)},
  // 10 «A bracelet counts them.»
  {cam: {s: [1, 1.35], r: [-6, 4], shake: 0.2}, tr: 'whip', render: ({t, lt}) => {
    const n = Math.max(78, 100 - Math.floor(lt * 14));
    return (<g><Room c1="#bfe9ff" c2="#7aa8c8" window={false} /><Hand x={540} y={1080} s={1.6} fingers={0} />
      <Brace x={540} y={880} s={1.9} text={String(n)} glow={0.7 + 0.3 * Math.sin(t * 8)} /><Dots t={t} c="#fff" /></g>);
  }},
  // 14 «Mine is blue.»
  {cam: {s: [1.3, 1], y: [160, 0]}, tr: 'punch', render: ({t, lt}) => (<g>{bg(t, '#9ad8ff')}<Dots t={t} />
    <Person x={540} y={820} s={2.0} style="short" shirt={C.blue} mouth="grin" arm={1} brace={C.blue} bglow={1} t={t} look={0.3} />
    <Tag x={540} y={300} text="BLUE" s={130} sc={back((lt - 0.15) * 4)} color={C.blue} rot={-3} /></g>)},
  // 17 «I'm Ben, I'm 9,»
  {cam: {s: [1.5, 1.1], x: [0, 0], y: [0, 40], r: [2, -2]}, tr: 'whip', render: ({t, lt}) => (<g><Burst t={t} c1="#ffd166" c2="#ffe6a3" />
    <Person x={540} y={900} s={2.1} style="short" shirt={C.blue} mouth="talk" t={t} brow={0.2} />
    <Tag x={330} y={330} text="BEN" s={120} sc={back(lt * 4)} rot={-5} color={C.blue} />
    <Tag x={760} y={460} text="AGE 9" s={80} sc={back((lt - 0.5) * 4)} rot={5} color={C.orange} /></g>)},
  // 22 «and I count mine on my fingers.»
  {cam: {s: [1, 1.5], y: [0, 120], shake: 0.3}, tr: 'flash', render: ({t, lt}) => {
    const k = Math.min(5, Math.floor(lt * 4.5) + 1);
    return (<g>{bg(t, '#ffe1a8')}<Dots t={t} c="#fff" /><Hand x={540} y={1080} s={2} fingers={k} />
      <Txt x={540} y={400} s={300} fill={C.orange} sw={26}>{String(k)}</Txt>
      <Brace x={540} y={1560} s={1.1} text={String(100 - k * 3)} /></g>);
  }},
  // 28 «Rich kids buy extra words»
  {cam: {s: [1.3, 1], x: [-80, 60], shake: 0.2}, tr: 'zoom', render: ({t, lt}) => (<g><Street t={t} />
    {[0, 1, 2].map((i) => <Person key={i} x={220 + i * 320} y={900 - Math.abs(Math.sin(t * 5 + i)) * 20} s={0.95} style={i === 1 ? 'hat' : 'spike'} shirt={['#ffd24a', '#ff7ab6', '#9b6bff'][i]} glass mouth="grin" arm={1} brace={C.gold} btext="999" bglow={1} t={t} full />)}
    {Array.from({length: 8}).map((_, i) => <Coin key={i} x={100 + i * 130} y={((lt * 380 + i * 170) % 900) + 160} t={t + i} s={0.7} />)}</g>)},
  // 32 «at the word bank.»
  {cam: {s: [1, 1.4], x: [0, 0], y: [200, -60]}, tr: 'whip', render: ({t, lt}) => (<g><Sky t={t} />
    <rect y="1240" width="1080" height="700" fill="#8da0c8" />
    <rect x="130" y="620" width="820" height="640" rx="20" fill="#f4e7c8" stroke={OUT} strokeWidth="9" />
    <path d="M90 640 L 540 400 L 990 640 Z" fill="#c9475b" stroke={OUT} strokeWidth="9" strokeLinejoin="round" />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={190 + i * 190} y="680" width="70" height="440" fill="#fff" stroke={OUT} strokeWidth="6" />)}
    <Tag x={540} y={560} text="WORD BANK" s={74} color={C.green} sc={back(lt * 4)} />
    <rect x="450" y="1000" width="180" height="260" rx="14" fill="#6b3f2a" stroke={OUT} strokeWidth="7" />
    <Crowd t={t} y={1520} n={4} seed={4} s={0.34} span={900} /></g>)},
  // 37 «My friend Leo bought 200.»
  {cam: {s: [1.4, 1.05], x: [-100, 0]}, tr: 'punch', render: ({t, lt}) => (<g><Burst t={t} c1="#ffb703" c2="#ffd166" />
    <Person x={520} y={880} s={2} style="spike" hair="#b86c00" shirt={C.gold} mouth="grin" arm={1} brace={C.gold} btext="200" bglow={1} glass t={t} />
    <Tag x={300} y={320} text="LEO" s={120} color="#ff7a1f" rot={-4} sc={back(lt * 4)} />
    <Txt x={800} y={460} s={230} fill="#fff" sw={22} rot={6}>200!</Txt></g>)},
  // 42 «He talks like a radio.»
  {cam: {s: [1, 1.3], r: [-3, 3], shake: 0.6}, tr: 'whip', render: ({t}) => (<g>{bg(t, '#2d1b69')}<Dots t={t} c="#c4b5fd" sp={2} />
    {Array.from({length: 5}).map((_, i) => <circle key={i} cx="540" cy="780" r={170 + ((t * 260 + i * 120) % 600)} fill="none" stroke="#fff" strokeWidth="10" opacity={1 - ((t * 260 + i * 120) % 600) / 600} />)}
    <Person x={540} y={800} s={1.9} style="spike" hair="#b86c00" shirt={C.gold} mouth="talk" t={t} glass brow={0.3} />
    {['BLAH', 'BLAH', 'BLAH', 'BLAH'].map((s, i) => <Bubble key={i} x={160 + (i % 2) * 760} y={420 + i * 300 + Math.sin(t * 6 + i) * 14} text={s} s={46} rot={i % 2 ? 7 : -7} tail={i % 2 ? 1 : -1} />)}</g>)},
  // 47 «At zero, your bracelet buzzes loud»
  {cam: {s: [1, 1.6], shake: 1.6}, tr: 'flash', render: ({t, lt}) => {
    const z = lt > 0.45; const sh = z ? Math.sin(t * 90) * 14 : 0;
    return (<g>{bg(t, z ? '#4a0d16' : '#162133')}{z && <Lines t={t} c="#ff3b4a" />}
      <Brace x={540} y={900} s={2.4} color={z ? C.red : C.blue} text={z ? '0' : String(Math.max(1, Math.ceil(5 - lt * 11)))} tc={z ? '#ffd0d4' : '#bdffd8'} shake={sh} glow={z ? 1 : 0.3} />
      {z && <Txt x={540} y={350} s={190} fill={C.red} sw={26} rot={-4}>BZZZT!</Txt>}</g>);
  }},
  // 53 «and everyone stares.»
  {cam: {s: [1.5, 1], r: [0, 0]}, tr: 'zoom', render: ({t, lt}) => (<g>{bg(t, '#10141b')}
    {Array.from({length: 14}).map((_, i) => { const x = 90 + (i % 4) * 300 + (Math.floor(i / 4) % 2) * 100, y = 330 + Math.floor(i / 4) * 350; const sc = back((lt - i * 0.05) * 5);
      return <g key={i} transform={`translate(${x} ${y}) scale(${sc})`}><ellipse rx="100" ry="70" fill="#fff" stroke={OUT} strokeWidth="6" /><circle cx={Math.sin(t * 2 + i) * 10} cy="0" r="38" fill={C.blue} /><circle cx={Math.sin(t * 2 + i) * 10} cy="0" r="16" fill={OUT} /></g>; })}
    <Txt x={540} y={1300} s={150} fill="#fff" sw={22}>*STARE*</Txt></g>)},
  // 56 «Grandpa says it wasn't always like this.»
  {cam: {s: [1.5, 1.1], y: [60, 0]}, tr: 'whip', render: ({t, lt}) => (<g><Room c1="#e7d3b0" c2="#8a6a4a" t={t} />
    <Person x={540} y={900} s={2} style="bald" hair="#d9d9d9" skin="#f1c3a0" shirt="#6aa56a" stache mouth="talk" t={t} brow={0.3} />
    <Tag x={540} y={310} text="GRANDPA" s={100} color="#6aa56a" rot={-3} sc={back(lt * 4)} /></g>)},
  // 63 «before bracelets, he talked to the baker»
  {cam: {s: [1.05, 1.35], x: [-80, 80], r: [-1.5, 1.5]}, tr: 'flash', render: ({t}) => (<g><rect width="1080" height="1920" fill="#f2d9a6" /><Dots t={t} c="#c89f5a" />
    <rect y="1380" width="1080" height="540" fill="#a8743f" />
    <rect x="80" y="1180" width="920" height="220" rx="16" fill="#e8b66b" stroke={OUT} strokeWidth="8" />
    <rect x="80" y="1160" width="920" height="40" rx="16" fill="#f7d28f" stroke={OUT} strokeWidth="8" />
    {[0, 1, 2].map((i) => <ellipse key={i} cx={260 + i * 260} cy="1130" rx="80" ry="40" fill="#e09f4a" stroke={OUT} strokeWidth="6" />)}
    <Person x={280} y={760} s={1.5} style="bald" hair="#d9d9d9" shirt="#6aa56a" stache mouth="talk" t={t} noArm />
    <Person x={800} y={760} s={1.5} style="hat" shirt="#fff" skin="#f0b88f" mouth="talk" t={t + 1.4} noArm flip />
    <rect width="1080" height="1920" fill="#8a5a1a" opacity="0.18" /></g>)},
  // 72 «for an hour every day.»
  {cam: {s: [1.5, 0.95], r: [10, 0]}, tr: 'spin', render: ({t, lt}) => (<g>{bg(t, '#fde68a')}<Burst t={t} c1="#fde68a" c2="#fff3bf" />
    <g transform="translate(540 820)"><circle r="340" fill="#fff" stroke={OUT} strokeWidth="14" />
      {Array.from({length: 12}).map((_, i) => <line key={i} x1="0" y1="-290" x2="0" y2="-320" stroke={OUT} strokeWidth="10" transform={`rotate(${i * 30})`} />)}
      <line x1="0" y1="0" x2="0" y2="-200" stroke={OUT} strokeWidth="16" strokeLinecap="round" transform={`rotate(${lt * 270})`} />
      <line x1="0" y1="0" x2="0" y2="-130" stroke={C.red} strokeWidth="22" strokeLinecap="round" transform={`rotate(${lt * 22})`} /><circle r="22" fill={OUT} /></g>
    <Txt x={540} y={1330} s={190} fill={C.orange} sw={24}>1 HOUR</Txt></g>)},
  // 77 «They complained about the mayor's tower»
  {cam: {s: [1, 1.5], x: [-100, 100], y: [0, -200]}, tr: 'whip', render: ({t, lt}) => (<g><Street t={t} towerLight="yellow" />
    <Person x={260} y={1000} s={0.8} style="bald" hair="#d9d9d9" shirt="#6aa56a" stache mouth="open" t={t} brow={0.7} />
    <Person x={470} y={1010} s={0.8} style="hat" shirt="#fff" skin="#f0b88f" mouth="open" t={t} brow={0.7} flip />
    <Bubble x={320} y={720} text="UGLY!" s={50} sc={back((lt - 0.2) * 4)} /><Bubble x={470} y={560} text="TOO TALL!" s={44} sc={back((lt - 0.6) * 4)} rot={5} tail={1} /></g>)},
  // 83 «and they laughed a lot.»
  {cam: {s: [1, 1.25], r: [-4, 4], shake: 1.0}, tr: 'punch', render: ({t}) => (<g>{bg(t, '#ffe29a')}<Dots t={t} c="#fff" sp={2} />
    <Person x={290} y={900 + Math.sin(t * 22) * 14} s={1.35} style="bald" hair="#d9d9d9" shirt="#6aa56a" stache mouth="grin" t={t} rot={Math.sin(t * 20) * 3} />
    <Person x={800} y={900 + Math.sin(t * 22 + 1) * 14} s={1.35} style="hat" shirt="#fff" skin="#f0b88f" mouth="grin" t={t} flip rot={Math.sin(t * 20 + 2) * 3} />
    <Txt x={290} y={520} s={90} fill={C.pink} sw={16} rot={-8}>HA HA</Txt><Txt x={820} y={470} s={90} fill={C.pink} sw={16} rot={8}>HA HA</Txt></g>)},
  // 88 «The mayor's sign says, words run out, so save them.»
  {cam: {s: [1.3, 1], y: [-120, 0], shake: 0.3}, tr: 'flash', render: ({t, lt}) => (<g><Street t={t} />
    <rect x="130" y="760" width="40" height="560" fill="#6b3f2a" stroke={OUT} strokeWidth="7" /><rect x="910" y="760" width="40" height="560" fill="#6b3f2a" stroke={OUT} strokeWidth="7" />
    <g transform={`translate(540 640) rotate(${Math.sin(t * 2) * 1.5}) scale(${back(lt * 3.5)})`}><rect x="-460" y="-300" width="920" height="600" rx="30" fill="#fff4dc" stroke={OUT} strokeWidth="10" />
      <Txt y="-110" s="110" fill={C.red} sw={0}>WORDS</Txt><Txt y="20" s="110" fill={C.red} sw={0}>RUN OUT!</Txt><Txt y="190" s="84" fill={OUT} sw={0}>SAVE THEM</Txt></g>
    <Person x={540} y={1230} s={0.6} style="hat" shirt="#7b4cd1" mouth="grin" t={t} arm={0.8} noArm={false} /></g>)},
  // 98 «But mom talks all day.»
  {cam: {s: [1.25, 1], x: [60, -40], shake: 0.4}, tr: 'whip', render: ({t, lt}) => (<g><Room c1="#ffd6e8" c2="#c98ab0" t={t} />
    <Person x={540} y={880} s={1.9} style="bun" hair="#7a3b2a" shirt={C.pink} mouth="talk" t={t} brow={0.2} />
    {['BLAH', 'BLAH', 'BLAH', 'BLAH', 'BLAH'].map((s, i) => <Bubble key={i} x={150 + (i % 2) * 780} y={300 + i * 250 + Math.sin(t * 5 + i) * 12} text={s} s={40} sc={back((lt - i * 0.16) * 4)} rot={i % 2 ? 7 : -7} tail={i % 2 ? 1 : -1} />)}</g>)},
  // 103 «She calls grandma»
  {cam: {s: [1.5, 1], x: [90, 0], r: [4, -2]}, tr: 'punch', render: ({t, lt}) => (<g><Room c1="#ffd6e8" c2="#c98ab0" t={t} />
    <Person x={440} y={900} s={1.8} style="bun" hair="#7a3b2a" shirt={C.pink} mouth="talk" t={t} arm={1} />
    <g transform={`translate(660 520) rotate(18)`}><rect x="-60" y="-110" width="120" height="220" rx="24" fill="#222" stroke={OUT} strokeWidth="7" /><rect x="-46" y="-92" width="92" height="170" rx="12" fill="#7dd3fc" /></g>
    <Bubble x={820} y={330} text="HELLO?" s={44} rot={5} sc={back(lt * 4)} tail={-1} fill="#e0f2fe" /></g>)},
  // 107 «and sings in the shower.»
  {cam: {s: [1, 1.35], r: [-3, 3], shake: 0.5}, tr: 'whip', render: ({t}) => (<g><rect width="1080" height="1920" fill="#bde7ee" />
    {Array.from({length: 7}).map((_, i) => <rect key={i} x={20 + i * 150} y="0" width="10" height="1920" fill="#fff" opacity="0.25" />)}
    {Array.from({length: 40}).map((_, i) => <ellipse key={i} cx={rnd(i) * 1080} cy={((rnd(i + 3) * 1900 + t * 900) % 1900)} rx="6" ry="22" fill="#fff" opacity="0.7" />)}
    <rect x="200" y="140" width="680" height="34" rx="14" fill="#9aa8b8" stroke={OUT} strokeWidth="7" />
    <Person x={540} y={940} s={1.7} style="bun" hair="#7a3b2a" shirt="#fff" mouth="o" t={t} arm={1} cheek />
    {['♪', '♫', '♪'].map((s, i) => <Txt key={i} x={150 + i * 380} y={520 + Math.sin(t * 4 + i) * 40 - ((t * 120 + i * 80) % 200)} s={140} fill={C.pink} sw={14}>{s}</Txt>)}</g>)},
  // 111 «Her bracelet still says 71.»
  {cam: {s: [1, 1.4], y: [0, -60], shake: 0.1}, tr: 'flash', render: ({t, lt}) => (<g>{bg(t, '#fff0f6')}<Dots t={t} c={C.pink} />
    <Hand x={540} y={1100} s={1.6} fingers={0} skin="#f0b88f" /><Brace x={540} y={880} s={1.9} color={C.pink} text="71" glow={0.8} />
    <Tag x={540} y={360} text="STILL 71" s={110} color={C.green} rot={-3} sc={back(lt * 4)} /></g>)},
  // 116 «Weird thing.»
  {cam: {s: [1.6, 1.2], r: [-4, 4]}, tr: 'zoom', sub: 1560, render: ({t, lt}) => (<g>{bg(t, '#1f2a44')}<Dots t={t} />
    <Person x={540} y={900} s={2.1} style="short" shirt={C.blue} mouth="worry" brow={0.9} look={Math.sin(t * 4)} t={t} sweat={(t * 0.7) % 1} />
    {[0, 1, 2].map((i) => <Txt key={i} x={200 + i * 340} y={380 + (i % 2) * 100} s={200} fill={C.gold} sw={22} rot={i * 9 - 9}>?</Txt>).map((e, i) => <g key={i} transform={`scale(${back((lt - i * 0.15) * 4)})`} style={{transformOrigin: '540px 400px'}}>{e}</g>)}</g>)},
  // 118 «My bracelet buzzes when the mayor's light blinks.»
  {cam: {s: [1, 1.2], shake: 0.7}, tr: 'whip', render: ({t}) => { const on = Math.sin(t * 7) > 0; return (<g><Sky t={t} night />
    <Tower x={540} y={1100} s={1.15} t={t} night /><rect y="1100" width="1080" height="820" fill="#2a3050" />
    <Brace x={540} y={1500} s={1.5} color={C.blue} text={on ? '!!' : '71'} shake={on ? Math.sin(t * 80) * 10 : 0} glow={on ? 1 : 0} tc={on ? '#ffe9a0' : '#bdffd8'} />
    {on && <Txt x={800} y={1180} s={90} fill={C.gold} sw={14} rot={10}>BZZT</Txt>}</g>); }},
  // 126 «Not when I talk.»
  {cam: {s: [1.5, 1.15], x: [0, 20]}, tr: 'punch', render: ({t, lt}) => (<g>{bg(t, '#bfe0ff')}<Dots t={t} />
    <Person x={540} y={820} s={2} style="short" shirt={C.blue} mouth="talk" t={t} arm={0.95} brace={C.blue} btext="71" brow={0.2} />
    <Tag x={540} y={320} text="NO BUZZ" s={110} color={C.green} rot={3} sc={back((lt - 0.2) * 4)} /></g>)},
  // 130 «I checked three times.»
  {cam: {s: [1, 1.3], r: [2, -2]}, tr: 'flash', render: ({t, lt}) => (<g>{bg(t, '#fff7d6')}
    <Brace x={540} y={560} s={1.4} text="71" />
    {[0, 1, 2].map((i) => <g key={i} transform={`translate(${220 + i * 320} 1150) scale(${back((lt - 0.2 - i * 0.4) * 5)})`}><circle r="130" fill="#fff" stroke={OUT} strokeWidth="9" /><path d="M-60 0 L -15 50 L 65 -50" stroke={C.green} strokeWidth="30" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>)}</g>)},
  // 134 «Then the word bank put up a sign.»
  {cam: {s: [1.2, 1.05], y: [-150, 0]}, tr: 'whip', render: ({t, lt}) => (<g><Sky t={t} /><rect y="1240" width="1080" height="700" fill="#8da0c8" />
    <rect x="130" y="620" width="820" height="640" rx="20" fill="#f4e7c8" stroke={OUT} strokeWidth="9" /><path d="M90 640 L 540 400 L 990 640 Z" fill="#c9475b" stroke={OUT} strokeWidth="9" strokeLinejoin="round" />
    <Tag x={540} y={560} text="WORD BANK" s={74} color={C.green} />
    <g transform={`translate(540 ${1000 - ease(lt * 2.2) * 0}) translate(0 ${(1 - back(lt * 2.5)) * -700})`}><rect x="-300" y="-110" width="600" height="220" rx="24" fill="#fff4dc" stroke={OUT} strokeWidth="9" /><Txt y="30" s="100" fill={C.red} sw={0}>NEW PRICES</Txt></g></g>)},
  // 142 «Words cost double.»
  {cam: {s: [0.9, 1.3], shake: 2}, tr: 'flash', sub: 1580, render: ({t, lt}) => (<g><Burst t={t} c1="#e11d48" c2="#fb7185" />
    <g transform={`translate(540 760) rotate(-6) scale(${0.4 + 0.6 * back(lt * 5)})`}><Txt s="480" fill="#fff" sw={34}>x2</Txt></g>
    {Array.from({length: 6}).map((_, i) => <Coin key={i} x={120 + i * 170} y={1300 + Math.sin(t * 4 + i) * 40} s={0.9} t={t + i} />)}</g>)},
  // 145 «Leo's mom sold her ring»
  {cam: {s: [1, 1.5], r: [-5, 5], y: [60, -20]}, tr: 'whip', render: ({t, lt}) => (<g>{bg(t, '#ffe9f3')}<Dots t={t} c="#fff" />
    <g transform={`translate(540 900) rotate(${Math.sin(t * 3) * 6})`}><circle r="200" fill="none" stroke={C.gold} strokeWidth="64" /><circle r="200" fill="none" stroke={OUT} strokeWidth="8" /><circle r="236" fill="none" stroke={OUT} strokeWidth="8" opacity="0.0" />
      <path d="M0 -240 l 60 -60 l 60 60 l -60 90 z" fill="#7de3ff" stroke={OUT} strokeWidth="8" transform="translate(-60 -30) scale(1.3)" /></g>
    <Spark x={720} y={600} t={t} s={1.5} c="#fff" /><Spark x={380} y={560} t={t + 1} s={1} c="#fff" />
    <Tag x={540} y={1300} text="SOLD" s={150} color={C.red} rot={-6} sc={back((lt - 0.5) * 4)} /></g>)},
  // 150 «so Leo could talk at his birthday.»
  {cam: {s: [1.3, 1], x: [-60, 60], shake: 0.3}, tr: 'punch', sub: 1700, render: ({t, lt}) => (<g><Room c1="#ffe0f0" c2="#e08ab0" t={t} />
    {Array.from({length: 12}).map((_, i) => <path key={i} d="M0 0 L 40 0 L 20 60 Z" fill={[C.pink, C.gold, C.blue, C.green][i % 4]} stroke={OUT} strokeWidth="4" transform={`translate(${80 + i * 85} ${180 + Math.sin(i) * 40 + (i % 2) * 30})`} />)}
    <Person x={540} y={880} s={1.7} style="spike" hair="#b86c00" shirt={C.gold} mouth="talk" t={t} glass arm={1} brace={C.gold} btext="2" />
    <g transform="translate(540 1500)"><rect x="-200" y="-90" width="400" height="190" rx="24" fill="#fff" stroke={OUT} strokeWidth="9" /><rect x="-200" y="-90" width="400" height="70" rx="24" fill={C.pink} stroke={OUT} strokeWidth="9" />
      {[-90, 0, 90].map((x) => <g key={x}><rect x={x - 8} y="-160" width="16" height="64" fill={C.blue} stroke={OUT} strokeWidth="5" /><ellipse cx={x} cy={-176 + Math.sin(t * 12 + x) * 3} rx="12" ry="20" fill={C.orange} /></g>)}</g>
    <Txt x={540} y={260} s={120} fill={C.gold} sw={18} rot={-3}>HAPPY BIRTHDAY</Txt></g>)},
  // 157 «The bracelet never counted anything.»
  {cam: {s: [1.1, 1.5], r: [0, -8]}, tr: 'flash', render: ({t, lt}) => (<g>{bg(t, '#0e1424')}<Dots t={t} c="#7aa2ff" />
    <Brace x={540} y={850} s={2.3} color={C.blue} text="???" glow={0.6} />
    {[0, 1, 2].map((i) => <Txt key={i} x={170 + i * 370} y={400 + (i % 2) * 80} s={200} fill={C.gold} sw={22} rot={i * 8 - 8}>?</Txt>)}
    <path d={`M${190} 700 L 900 1010`} stroke={C.red} strokeWidth={26 * clamp01(lt * 2.5)} strokeLinecap="round" />
    <Txt x={540} y={1280} s={110} fill={C.red} sw={16}>FAKE!</Txt></g>)},
  // 162 «The mayor just buzzes it when the town gets loud.»
  {cam: {s: [1.2, 1], x: [60, -60], shake: 0.6}, tr: 'whip', sub: 1720, render: ({t, lt}) => { const b = (lt * 3) % 1 > 0.5; return (<g><Room c1="#d9c8ff" c2="#6a4cc4" window={false} t={t} />
    <Person x={540} y={880} s={1.7} style="hat" shirt="#7b4cd1" mouth="grin" t={t} glass={false} brow={0.8} arm={0.7} />
    <g transform="translate(540 1560)"><rect x="-260" y="-70" width="520" height="190" rx="24" fill="#3b2f6e" stroke={OUT} strokeWidth="9" /><circle cy={-20 + (b ? 18 : 0)} r="100" fill={C.red} stroke={OUT} strokeWidth="9" /><ellipse cy="-60" rx="60" ry="22" fill="#fff" opacity="0.4" /></g>
    {b && <Txt x={540} y={300} s={150} fill={C.red} sw={20} rot={-4}>BZZZT!</Txt>}</g>); }},
  // 172 «I had a sandwich wrapped in foil.»
  {cam: {s: [1.3, 1], r: [4, -2]}, tr: 'punch', render: ({t, lt}) => (<g>{bg(t, '#ffe9bd')}<Dots t={t} c="#fff" />
    <g transform={`translate(540 900) rotate(${Math.sin(t * 2) * 3}) scale(${0.7 + 0.3 * back(lt * 3)})`}>
      <path d="M-300 120 L -240 -140 L 240 -140 L 300 120 Z" fill="#d7dce6" stroke={OUT} strokeWidth="10" strokeLinejoin="round" />
      {Array.from({length: 8}).map((_, i) => <path key={i} d={`M${-250 + i * 70} -130 l -20 240`} stroke="#fff" strokeWidth="10" opacity="0.8" />)}
      <rect x="-290" y="120" width="580" height="90" rx="30" fill="#c9d0de" stroke={OUT} strokeWidth="10" /></g>
    <Spark x={820} y={560} t={t} s={1.6} /><Spark x={260} y={640} t={t + 2} s={1} /></g>)},
  // 179 «I wrapped my bracelet tight, like a burrito.»
  {cam: {s: [1, 1.6], r: [-6, 3], shake: 0.4}, tr: 'zoom', render: ({t, lt}) => { const w = clamp01(lt / 1.8); return (<g>{bg(t, '#d6efff')}<Dots t={t} />
    <Hand x={540} y={1120} s={1.6} fingers={0} />
    <Brace x={540} y={900} s={1.9} color={C.blue} text="71" foil={w > 0.5} glow={0.4} />
    {Array.from({length: 4}).map((_, i) => <rect key={i} x="-215" y={-80 + i * 40} width="430" height="46" rx="20" fill="#d8dde6" stroke={OUT} strokeWidth="7" opacity={clamp01(w * 4 - i)} transform={`translate(540 ${880 - 20 + i * 4}) rotate(${i % 2 ? 2 : -2})`} />)}
    {w > 0.8 && <Txt x={540} y={400} s={150} fill={C.orange} sw={22} rot={-4}>TIGHT!</Txt>}</g>); }},
  // 187 «Then I walked into the bakery and talked.»
  {cam: {s: [1, 1.3], x: [-100, 80]}, tr: 'whip', render: ({t, lt}) => (<g><rect width="1080" height="1920" fill="#ffe7b0" /><Dots t={t} c="#fff" />
    <rect y="1380" width="1080" height="540" fill="#c8924a" />
    <rect x="80" y="1130" width="920" height="260" rx="16" fill="#f0c27a" stroke={OUT} strokeWidth="8" />
    {[0, 1, 2].map((i) => <ellipse key={i} cx={260 + i * 260} cy="1080" rx="90" ry="46" fill="#e09f4a" stroke={OUT} strokeWidth="6" />)}
    <Tag x={540} y={420} text="BAKERY" s={110} color={C.orange} sc={back(lt * 4)} rot={-3} />
    <Person x={-100 + ease(lt / 1.6) * 640} y={800} s={1.4} style="short" shirt={C.blue} mouth="talk" t={t} arm={0.9} brace="#d8dde6" bfoil btext="" />
    <Person x={860} y={780} s={1.3} style="hat" shirt="#fff" skin="#f0b88f" mouth="smile" t={t} flip noArm /></g>)},
  // 195 «About my dog,»
  {cam: {s: [1.6, 1.15], r: [-4, 3]}, tr: 'punch', render: ({t, lt}) => (<g><Burst t={t} c1="#bbf7d0" c2="#dcfce7" /><g transform={`translate(540 880) scale(${back(lt * 4)}) rotate(${Math.sin(t * 8) * 4})`}>
      <ellipse rx="230" ry="200" fill="#d9a066" stroke={OUT} strokeWidth="10" /><ellipse cx="-190" cy="-60" rx="70" ry="150" fill="#a8703a" stroke={OUT} strokeWidth="10" transform="rotate(14 -190 -60)" /><ellipse cx="190" cy="-60" rx="70" ry="150" fill="#a8703a" stroke={OUT} strokeWidth="10" transform="rotate(-14 190 -60)" />
      <circle cx="-80" cy="-30" r="30" fill="#fff" stroke={OUT} strokeWidth="6" /><circle cx="80" cy="-30" r="30" fill="#fff" stroke={OUT} strokeWidth="6" /><circle cx="-76" cy="-26" r="14" fill={OUT} /><circle cx="84" cy="-26" r="14" fill={OUT} />
      <ellipse cy="60" rx="70" ry="50" fill="#f6dcc0" stroke={OUT} strokeWidth="7" /><ellipse cy="40" rx="30" ry="20" fill={OUT} /><path d="M0 60 V 100 M-30 110 Q 0 140 30 110" stroke={OUT} strokeWidth="7" fill="none" /><path d="M-30 100 Q 0 190 30 100" fill="#ff7a9a" stroke={OUT} strokeWidth="6" /></g>
    <Txt x={540} y={1290} s={170} fill={C.green} sw={22}>MY DOG!</Txt></g>)},
  // 198 «my shoes,»
  {cam: {s: [1.5, 1.1], r: [5, -3]}, tr: 'flash', render: ({t, lt}) => (<g><Burst t={t} c1="#fecdd3" c2="#ffe4e6" /><g transform={`translate(540 900) scale(${back(lt * 4)}) rotate(${Math.sin(t * 8) * 3})`}>
      {[-1, 1].map((sd) => <g key={sd} transform={`translate(${sd * 190} 0) scale(${sd} 1)`}><path d="M-120 -140 H 40 V 0 Q 200 10 220 90 V 150 H -120 Z" fill={C.red} stroke={OUT} strokeWidth="10" strokeLinejoin="round" /><rect x="-120" y="110" width="340" height="60" rx="22" fill="#fff" stroke={OUT} strokeWidth="10" /><path d="M-60 -90 h 80 M-60 -50 h 80 M-60 -10 h 80" stroke="#fff" strokeWidth="12" strokeLinecap="round" /></g>)}</g>
    <Txt x={540} y={1290} s={150} fill={C.red} sw={22}>MY SHOES!</Txt></g>)},
  // 200 «grandpa's hour.»
  {cam: {s: [1.2, 1.7], r: [3, -3]}, tr: 'punch', render: ({t, lt}) => (<g><Room c1="#e7d3b0" c2="#8a6a4a" t={t} />
    <Person x={540} y={900} s={1.7} style="bald" hair="#d9d9d9" skin="#f1c3a0" shirt="#6aa56a" stache mouth="grin" t={t} />
    <g transform={`translate(840 440) scale(${back(lt * 4)})`}><circle r="130" fill="#fff" stroke={OUT} strokeWidth="9" /><line y2="-90" stroke={OUT} strokeWidth="12" strokeLinecap="round" transform={`rotate(${lt * 300})`} /><line y2="-60" stroke={C.red} strokeWidth="14" strokeLinecap="round" transform={`rotate(${lt * 25})`} /></g>
    <Txt x={540} y={1290} s={100} fill={C.orange} sw={18}>GRANDPA'S HOUR</Txt></g>)},
  // 202 «300 words.»
  {cam: {s: [0.85, 1.25], shake: 1.2}, tr: 'flash', sub: 1580, render: ({t, lt}) => (<g><Burst t={t} c1="#16a34a" c2="#4ade80" />
    <g transform={`translate(540 800) scale(${0.5 + 0.5 * back(lt * 4)})`}><Txt s="440" fill={C.gold} sw={30}>300</Txt><Txt y="190" s="160" sw={22}>WORDS</Txt></g><Dots t={t} sp={2} /></g>)},
  // 204 «No buzz.»
  {cam: {s: [1.5, 1], r: [0, 0], shake: 0.2}, tr: 'punch', render: ({t, lt}) => (<g>{bg(t, '#dcfce7')}<Dots t={t} c="#4ade80" />
    <Brace x={540} y={800} s={2.1} color="#d8dde6" foil text="..." glow={0.5} />
    <g transform={`translate(540 1250) rotate(-4) scale(${back(lt * 5)})`}><circle r="170" fill="#fff" stroke={OUT} strokeWidth="12" /><circle r="125" fill="none" stroke={C.red} strokeWidth="26" /><path d="M-90 -90 L 90 90" stroke={C.red} strokeWidth="26" /><Txt y="30" s="64" fill={OUT} sw={0}>BZZ</Txt></g>
    <Tag x={540} y={300} text="NO BUZZ!" s={130} color={C.green} rot={-3} /></g>)},
  // 206 «Leo saw me.»
  {cam: {s: [1.2, 1.55], x: [-60, 0], y: [0, -40]}, tr: 'whip', render: ({t, lt}) => (<g><Street t={t} />
    <rect x="620" y="760" width="440" height="540" fill="#ffe07a" stroke={OUT} strokeWidth="9" />
    <Person x={660 - ease(lt / 0.3) * 0 + (1 - ease(lt * 3)) * 140} y={920} s={1.2} style="spike" hair="#b86c00" shirt={C.gold} glass mouth="o" look={-1} t={t} brow={0.8} flip noArm />
    <Person x={260} y={1120} s={0.95} style="short" shirt={C.blue} mouth="smile" t={t} arm={0.9} brace="#d8dde6" bfoil btext="" /></g>)},
  // 209 «He wrapped his wrist in a gum wrapper.»
  {cam: {s: [1, 1.5], r: [-5, 3], shake: 0.4}, tr: 'flash', render: ({t, lt}) => (<g>{bg(t, '#ffd6e8')}<Dots t={t} c="#fff" />
    <Hand x={540} y={1150} s={1.6} fingers={0} skin={C.skin} />
    <g transform={`translate(540 ${880}) rotate(${Math.sin(t * 3) * 2})`}><rect x="-210" y="-70" width="420" height="140" rx="30" fill={C.pink} stroke={OUT} strokeWidth="9" /><rect x="-210" y="-70" width="420" height="40" rx="20" fill="#fff" opacity="0.5" />
      <Txt y="26" s="76" fill="#fff" sw={10}>BUBBLE</Txt></g>
    <Txt x={540} y={430} s={140} fill={C.pink} sw={20} rot={-4}>COPYCAT!</Txt></g>)},
  // 217 «Soon the whole street was yelling about the tower.»
  {cam: {s: [1, 1.5], x: [-80, 120], y: [0, -150], shake: 1.2}, tr: 'zoom', render: ({t, lt}) => (<g><Street t={t} towerLight="yellow" />
    <Crowd t={t} y={1400} n={8} seed={6} s={0.4} yell span={1060} />
    {['TOWER!', 'TOO TALL!', 'UGLY!', 'FIX IT!'].map((s, i) => <Bubble key={i} x={180 + (i % 2) * 560} y={850 + Math.floor(i / 2) * 200} text={s} s={44} sc={back((lt - i * 0.35) * 4)} rot={i % 2 ? 6 : -6} tail={i % 2 ? 1 : -1} />)}</g>)},
  // 226 «I forgot to count on my fingers.»
  {cam: {s: [1.5, 1.1], r: [2, -2]}, tr: 'punch', render: ({t, lt}) => (<g>{bg(t, '#e0f2fe')}<Dots t={t} />
    <Person x={540} y={820} s={2} style="short" shirt={C.blue} mouth="o" t={t} arm={0.1} brace="#d8dde6" bfoil btext="" brow={0.6} />
    <Hand x={880} y={1250} s={0.8} fingers={5} rot={-12} />
    <Txt x={540} y={300} s={130} fill={C.orange} sw={20} rot={-3}>OOPS!</Txt></g>)},
  // 233 «The mayor's light blinked red.»
  {cam: {s: [1, 1.5], y: [0, -260], shake: 1.0}, tr: 'flash', render: ({t, lt}) => (<g><Street t={t} towerLight="red" red={0.6 + 0.4 * Math.sin(t * 10)} />
    <Txt x={540} y={1300} s={130} fill={C.red} sw={22}>RED ALERT!</Txt></g>)},
  // 238 «Nothing buzzed.»
  {cam: {s: [1.1, 1], x: [-40, 40]}, tr: 'punch', render: ({t, lt}) => (<g><Street t={t} towerLight="red" red={0.3} />
    <Crowd t={t} y={1450} n={6} seed={8} s={0.46} stare />
    <Txt x={540} y={500} s={150} fill="#fff" sw={22}>...</Txt></g>)},
  // 240 «That night, my foil bracelet buzzed anyway.»
  {cam: {s: [1, 1.4], shake: 1.5, r: [-2, 2]}, tr: 'flash', render: ({t, lt}) => { const sh = Math.sin(t * 90) * (lt > 0.7 ? 12 : 0); return (<g><Sky t={t} night /><rect y="1200" width="1080" height="720" fill="#161a3c" />
    <House x={200} y={1260} w={240} h={240} c="#4a3a8a" night /><House x={900} y={1260} w={240} h={240} c="#3a4a8a" night />
    <g transform="translate(540 820)"><ellipse rx={420 + (lt > 0.7 ? 40 * Math.sin(t * 30) : 0)} ry="320" fill="#9fe3ff" opacity={lt > 0.7 ? 0.35 : 0.15} />
      <Brace s={2.2} foil text={lt > 0.7 ? '!!' : '...'} shake={sh} glow={lt > 0.7 ? 1 : 0.2} tc="#9fe3ff" /></g>
    {lt > 0.7 && <Txt x={540} y={330} s={150} fill="#9fe3ff" sw={22} rot={-4}>BZZZT!</Txt>}</g>); }},
  // 247 «It spelled my name.»
  {cam: {s: [1.5, 0.95], r: [4, 0], shake: 0.3}, tr: 'zoom', sub: 1560, render: ({t, lt}) => (<g>{bg(t, '#070a1c')}<Dots t={t} c="#9fe3ff" sp={0.6} />
    <ellipse cx="540" cy="780" rx="480" ry="360" fill="#9fe3ff" opacity={0.18 + 0.08 * Math.sin(t * 6)} />
    <Brace x={540} y={780} s={2.2} foil text={lt > 0.6 ? 'BEN' : '...'} glow={1} tc="#9fe3ff" />
    {['B', 'E', 'N'].map((ch, i) => <g key={i} transform={`translate(${340 + i * 200} 1260) scale(${back((lt - 0.55 - i * 0.22) * 4)})`}><Txt s="230" fill={C.gold} sw={24}>{ch}</Txt></g>)}</g>)},
];

if (SHOTS.length !== cuts.length) throw new Error(`shots ${SHOTS.length} != cuts ${cuts.length}`);

// ---------- камера ----------
const EMPH = new Set([6, 11, 16, 20, 41, 51, 66, 82, 94, 115, 125, 133, 144, 149, 161, 171, 186, 205, 237, 239, 246, 250]);
const emphT = [...EMPH].map((i) => WORDS[i].s);
const Cam: React.FC<{lt: number; t: number; d: number; c: CamCfg; tr: Tr; children: React.ReactNode}> = ({lt, t, d, c, tr, children}) => {
  const q = clamp01(lt / Math.max(0.5, d));
  const p = q * q * (3 - 2 * q) * 0.5 + q * 0.5;
  const L = (a: [number, number] | undefined, def: number) => (a ? a[0] + (a[1] - a[0]) * p : def);
  const punch = (tr === 'punch' ? 0.1 : 0.04) * Math.exp(-lt * 11);
  const pulse = emphT.reduce((m, ts) => { const dt = t - ts; return dt >= 0 && dt < 0.5 ? Math.max(m, 0.055 * Math.exp(-dt * 9)) : m; }, 0);
  const sh = c.shake ?? 0.25;
  const hx = Math.sin(t * 1.7) * 7 + Math.sin(t * 53) * sh * 7 + Math.sin(t * 91) * sh * 3;
  const hy = Math.cos(t * 1.3) * 6 + Math.cos(t * 47) * sh * 7;
  const hr = Math.sin(t * 0.9) * 0.5 + Math.sin(t * 37) * sh * 0.5;
  const s = L(c.s, 1) * (1 + punch + pulse);
  return <g transform={`translate(540 960) rotate(${L(c.r, 0) + hr}) scale(${s}) translate(${-540 - L(c.x, 0) + hx} ${-960 - L(c.y, 0) + hy})`}>{children}</g>;
};

// ---------- субтитры (Titan One, белые) ----------
type Chunk = {words: W[]; a: number; b: number};
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = []; let cur: W[] = [];
  const flush = () => { if (cur.length) { out.push({words: cur, a: cur[0].s, b: cur[cur.length - 1].e}); cur = []; } };
  WORDS.forEach((w) => {
    const len = cur.reduce((n, x) => n + x.w.length + 1, 0) + w.w.length;
    if (cur.length >= 3 || len > 17) flush();
    cur.push(w);
    if (/[.?!,]$/.test(w.w)) flush();
  });
  flush(); return out;
})();
const Subs: React.FC<{t: number; y: number}> = ({t, y}) => {
  const ch = CHUNKS.find((c) => t >= c.a - 0.03 && t < c.b + 0.12);
  if (!ch) return null;
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: y, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 22px', fontFamily: TITAN, fontSize: 74, lineHeight: 1.15, textAlign: 'center', textTransform: 'uppercase'}}>
      {ch.words.map((w, i) => {
        const age = t - w.s; const pop = clamp01(age / 0.1); const active = t >= w.s && t < w.e;
        return <span key={i} style={{opacity: age >= -0.02 ? 1 : 0, color: '#ffffff', display: 'inline-block', transform: `scale(${0.72 + 0.28 * pop + (active ? 0.07 : 0)}) translateY(${(1 - pop) * 14}px)`,
          WebkitTextStroke: '11px #10141b', paintOrder: 'stroke fill', textShadow: '0 7px 0 #10141b'}}>{w.w}</span>;
      })}
    </div>
  );
};

// ---------- главная композиция ----------
export const Bracelet: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  let k = START.length - 1; for (let i = 0; i < START.length; i++) if (t < START[i + 1] || i === START.length - 1) { k = i; break; }
  const shot = SHOTS[k];
  const a = START[k], b = k + 1 < START.length ? START[k + 1] : DURATION;
  const lt = t - a, d = b - a;
  const dir = k % 2 ? 1 : -1; const tr = shot.tr ?? 'punch';
  const e = clamp01(lt / 0.2);
  let wrap: React.CSSProperties = {};
  if (tr === 'whip') wrap = {transform: `translateX(${dir * (1 - ease(e)) * 620}px)`, filter: `blur(${(1 - e) * 16}px)`};
  if (tr === 'zoom') wrap = {transform: `scale(${1 + (1 - ease(e)) * 0.4})`, filter: `blur(${(1 - e) * 10}px)`};
  if (tr === 'spin') wrap = {transform: `rotate(${dir * (1 - ease(e)) * 10}deg) scale(${1 + (1 - ease(e)) * 0.2})`, filter: `blur(${(1 - e) * 8}px)`};
  const flash = tr === 'flash' ? Math.max(0, 0.85 - lt * 6) : 0;
  const fadeIn = interpolate(t, [0, 0.25], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeOut = interpolate(t, [DURATION - 0.5, DURATION], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: '#10141b'}}>
      <Audio src={staticFile('bracelet_mix.mp3')} />
      <AbsoluteFill style={wrap}>
        <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{position: 'absolute'}}>
          <defs><radialGradient id="vg" cx="0.5" cy="0.5" r="0.75"><stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.45" /></radialGradient></defs>
          <Cam lt={lt} t={t} d={d} c={shot.cam} tr={tr}>{shot.render({t, lt, d, p: lt / d})}</Cam>
          <rect width="1080" height="1920" fill="url(#vg)" />
        </svg>
      </AbsoluteFill>
      <Subs t={t} y={shot.sub ?? 1480} />
      <div style={{position: 'absolute', left: 0, top: 0, height: 10, width: `${(t / DURATION) * 100}%`, background: C.gold}} />
      <AbsoluteFill style={{backgroundColor: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <AbsoluteFill style={{backgroundColor: '#000', opacity: Math.max(fadeIn, fadeOut), pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
