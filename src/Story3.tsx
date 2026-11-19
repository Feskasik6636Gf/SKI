import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import words3 from './words3.json';
import {
  Bell, Bubble, BigText, Buildings, Burst, Cake, Car, Corn, Crowd, Cucumber, FONT, Floor, Heart, KitchenBG, Mic, Monster, OUT, Person, Pill, Sky, Sparkle, Spaghetti, Speed, Table, Timer, Zzz, Bunting, clampN, popS, rnd, ease,
} from './Art3';
import type {PersonP} from './Art3';

export const FPS3 = 30;
export const DURATION3 = 84.04;
type W = {w: string; s: number; e: number};
const WD = words3 as W[];
const T = (i: number) => WD[i].s;
const E = (i: number) => WD[i].e;

// ───────── герои ─────────
const HERO = {skin: '#ffd0a6', hair: '#3a2416', style: 'kid', shirt: '#ffcf2e', pants: '#3a58b8'} as const;
const MOM = {skin: '#ffd0a6', hair: '#b8431f', style: 'bun', shirt: '#e8467f', pants: '#5b3a8a'} as const;
const DAD = {skin: '#f0b98a', hair: '#3a2a1a', style: 'beard', shirt: '#3f84e0', pants: '#2c3558'} as const;
const BRO = {skin: '#ffd0a6', hair: '#2e8b4a', style: 'cap', shirt: '#3fb46a', pants: '#3a3a52'} as const;
const GRANPA = {skin: '#f0c9a0', hair: '#dcdce8', style: 'beard', shirt: '#8d6ae0', pants: '#4a4a62'} as const;
const GRANNY = {skin: '#f6cfa8', hair: '#d8d8e6', style: 'gran', shirt: '#f0a0cc', pants: '#6a4a8a'} as const;
const MAYOR = {skin: '#ffd0a6', hair: '#222', style: 'hat', shirt: '#d9482b', pants: '#222a44'} as const;
const P = (p: Partial<PersonP> & {x: number; y: number; t: number}, base: Record<string, string>) => <Person {...(base as any)} {...p} />;

// ───────── камера ─────────
export type Cfg = {s?: [number, number]; x?: [number, number]; y?: [number, number]; r?: [number, number]; shake?: number; punch?: number; hand?: number; lin?: boolean};
const Cam: React.FC<{lt: number; d: number; c?: Cfg; children: React.ReactNode}> = ({lt, d, c = {}, children}) => {
  const raw = clampN(lt / d);
  const p = c.lin ? raw : raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
  const L = (a: [number, number] | undefined, def: number) => (a ? a[0] + (a[1] - a[0]) * p : def);
  const punch = (c.punch ?? 0.07) * Math.exp(-lt * 11);
  const hand = c.hand ?? 1;
  const sh = (c.shake ?? 0) * Math.exp(-Math.max(0, lt - 0.0) * 1.2 * 0) ;
  const sx = Math.sin(lt * 61) * sh * 9 + Math.sin(lt * 2.3) * 5 * hand, sy = Math.cos(lt * 53) * sh * 9 + Math.cos(lt * 1.9) * 4 * hand;
  const s = L(c.s, 1) * (1 + punch);
  return <g transform={`translate(540 960) rotate(${L(c.r, 0) + Math.sin(lt * 1.3) * 0.4 * hand + Math.sin(lt * 47) * sh * 0.25}) scale(${s}) translate(${-540 - L(c.x, 0) + sx} ${-960 - L(c.y, 0) + sy})`}>{children}</g>;
};

// ───────── субтитры (Titan One, строго белые) ─────────
type Chunk = {words: W[]; a: number; b: number};
const buildChunks = (ws: W[]): Chunk[] => {
  const out: Chunk[] = []; let cur: W[] = [];
  const flush = () => { if (cur.length) { out.push({words: cur, a: cur[0].s, b: cur[cur.length - 1].e}); cur = []; } };
  ws.forEach((w) => {
    const len = cur.reduce((n, x) => n + x.w.length + 1, 0) + w.w.length;
    if (cur.length >= 3 || len > 19) flush();
    cur.push(w);
    if (/[.?!,]["»”]?$/.test(w.w)) flush();
  });
  flush();
  return out;
};
const CHUNKS = buildChunks(WD);
const Subs: React.FC<{t: number; y?: number}> = ({t, y = 1500}) => {
  const ci = CHUNKS.findIndex((c) => t >= c.a - 0.03 && t < (CHUNKS[CHUNKS.indexOf(c) + 1]?.a ?? c.b + 0.3) - 0.0 && t < c.b + 0.28);
  const ch = CHUNKS[ci];
  if (!ch) return null;
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: y, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 36px', fontFamily: FONT, fontWeight: 900, fontSize: 82, lineHeight: 1.12, textAlign: 'center', letterSpacing: 1, fontSynthesis: 'none'}}>
      {ch.words.map((w, i) => {
        const age = t - w.s;
        const active = t >= w.s && t < w.e;
        const p = clampN(age / 0.11);
        const sc = (0.72 + 0.28 * p) * (active ? 1.07 : 1);
        return (
          <span key={i} style={{display: 'inline-block', opacity: age >= -0.02 ? 1 : 0, color: '#ffffff', transform: `scale(${sc}) translateY(${(1 - p) * 14}px)`, WebkitTextStroke: '11px #1b1730', paintOrder: 'stroke fill', textShadow: '0 7px 0 #1b1730'} as React.CSSProperties}>{w.w.replace(/[«»]/g, '').toUpperCase()}</span>
        );
      })}
    </div>
  );
};

// ───────── счётчик задержки ужина ─────────
const DELAYS: [number, number][] = [[0, 0], [10.18, 1], [21.37, 2], [22.2, 3], [54.52, 4], [55.82, 5], [58.17, 6], [61.5, 503], [73.06, 0], [81.675, 1], [82.5, 2]];
const delayAt = (t: number) => {
  let v = 0, at = 0;
  DELAYS.forEach(([a, n]) => { if (t >= a) { v = n; at = a; } });
  if (v === 503 || v === 6 || v === 5) {
    const k = clampN((t - 61.5) / 1.6);
    if (v === 503) return {n: Math.round(6 + k * 497), at};
  }
  return {n: v, at};
};
const DelayHUD: React.FC<{t: number}> = ({t}) => {
  if (t < 9.9 || t > 83.9) return null;
  const {n, at} = delayAt(t);
  const pulse = Math.exp(-(t - at) * 6);
  return (
    <div style={{position: 'absolute', right: 40, top: 64, transform: `scale(${1 + pulse * 0.25})`, transformOrigin: '100% 0', fontFamily: FONT, fontSize: 40, color: '#fff', background: 'rgba(27,23,48,0.88)', border: '4px solid #fff', borderRadius: 26, padding: '10px 24px', display: 'flex', gap: 14, alignItems: 'center', boxShadow: '0 6px 0 #1b1730', fontWeight: 900}}>
      <span style={{fontSize: 34}}>⏰</span><span>УЖИН +{n} ЧАС</span>
    </div>
  );
};

// ───────── общие кусочки сцен ─────────
type Ctx = {t: number; lt: number; d: number};
type Shot = {a: number; b: number; tr?: 'flash' | 'whip' | 'dip' | 'zoom' | 'none'; cam?: Cfg; dark?: number; sub?: number; render: (c: Ctx) => React.ReactNode};
const Confetti: React.FC<{t: number; lt: number; n?: number}> = ({t, lt, n = 40}) => (
  <g>{Array.from({length: n}).map((_, i) => {
    const x = rnd(i) * 1080, v = 300 + rnd(i + 3) * 500, y = -100 + lt * v + Math.sin(lt * 5 + i) * 20;
    return <rect key={i} x={x} y={y % 2000} width="22" height="34" rx="4" fill={['#ff5a7a', '#ffd13a', '#59c3ff', '#7be07b', '#b48cff'][i % 5]} stroke={OUT} strokeWidth="3" transform={`rotate(${lt * 300 * (rnd(i + 6) - 0.5) * 3} ${x} ${y % 2000})`} />;
  })}</g>
);
const Flash: React.FC<{lt: number; color?: string; k?: number}> = ({lt, color = '#fff', k = 9}) => <rect width="1080" height="1920" fill={color} opacity={Math.exp(-lt * k) * 0.9} />;
const Tiny: React.FC<{x: number; y: number; text: string; size?: number; rot?: number; t: number; at: number; bg?: string; fg?: string}> = ({x, y, text, size = 56, rot = -4, t, at, bg = '#ffe14d', fg = OUT}) => {
  const sc = popS(t, at, 6);
  return sc > 0 ? <Pill x={x} y={y} text={text} size={size} rot={rot} scale={sc} bg={bg} fg={fg} /> : null;
};
const Say: React.FC<{x: number; y: number; text: string; t: number; at: number; size?: number; tail?: number; bg?: string; fg?: string; rot?: number}> = ({x, y, text, t, at, size = 70, tail = -1, bg, fg, rot = 0}) => {
  const sc = popS(t, at, 7);
  return sc > 0 ? <Bubble x={x} y={y} text={text} size={size} scale={sc} tail={tail} bg={bg} fg={fg} rot={rot} /> : null;
};
const StreetBG: React.FC<{t: number; lights?: boolean; sky?: [string, string]; px?: number}> = ({t, lights, sky = ['#74c9ff', '#e8f8ff'], px = 0}) => (
  <g>
    <Sky c1={sky[0]} c2={sky[1]} />
    <circle cx="880" cy="260" r="96" fill="#ffe66d" stroke={OUT} strokeWidth="8" />
    {[0, 1, 2].map((i) => <g key={i} transform={`translate(${(i * 420 + t * 12 + px) % 1500 - 200} ${180 + i * 150})`}><ellipse rx="120" ry="44" fill="#fff" stroke={OUT} strokeWidth="6" /><ellipse cx="-70" cy="10" rx="70" ry="34" fill="#fff" stroke={OUT} strokeWidth="6" /><ellipse cx="60" cy="14" rx="80" ry="36" fill="#fff" /></g>)}
    <Buildings y={1060} seed={4} lights={lights} t={t} x={-40 + px * 0.3} />
    <Floor y={1060} c1="#9aa3b8" c2="#a9b1c4" />
    <rect x="0" y="1060" width="1080" height="22" fill="#6e7690" />
  </g>
);
const NightBG: React.FC<{t: number}> = ({t}) => (
  <g>
    <rect width="1080" height="1920" fill="#1b1f4a" />
    {Array.from({length: 40}).map((_, i) => <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 9) * 900} r={2 + rnd(i + 2) * 4} fill="#fff" opacity={0.5 + 0.5 * Math.sin(t * 3 + i)} />)}
    <circle cx="820" cy="260" r="110" fill="#fff4b8" stroke={OUT} strokeWidth="8" /><circle cx="860" cy="230" r="100" fill="#1b1f4a" />
    <Buildings y={1060} seed={4} lights t={t} colors={['#4a4f8a', '#3a3f78', '#5a4f9a', '#334', '#4a5f8a']} />
    <Floor y={1060} c1="#2b2f5a" c2="#33386a" />
  </g>
);

// ───────── СЦЕНЫ ─────────
const SHOTS: Shot[] = [
  // 0 хук: «Что на ужин?»
  {a: 0, b: T(5), tr: 'none', cam: {s: [1.3, 1.1], r: [-5, 2], punch: 0.12}, render: ({t, lt}) => (
    <g><KitchenBG t={t} />
      <Speed t={t} color="#fff7c2" op={0.35} />
      <Burst x={540} y={640} r={520} color="#ffe14d" rot={t * 20} />
      {P({x: 540, y: 1220, s: 2.1, t, eyes: 'angry', mouth: 'wide', brow: 0.4, al: 150, ar: 150, talk: false}, HERO)}
      <Say x={540} y={480} text={'ЧТО НА\nУЖИН?!'} t={t} at={0.36} size={92} tail={0} rot={-3} />
    </g>
  )},
  // 1 вся семья голодная за столом
  {a: T(5), b: T(11), tr: 'whip', cam: {s: [1.05, 1.28], x: [-60, 80]}, render: ({t, lt}) => (
    <g><KitchenBG t={t} />
      <Table x={540} y={1060} w={900} plates={4} food="none" />
      {P({x: 160, y: 1040, s: 0.95, t, eyes: 'sad', mouth: 'frown', al: 30, ar: 30}, GRANNY)}
      {P({x: 380, y: 1040, s: 0.95, t, eyes: 'sad', mouth: 'frown', headTilt: 8}, MOM)}
      {P({x: 700, y: 1040, s: 0.95, t, eyes: 'sad', mouth: 'flat', headTilt: -8}, DAD)}
      {P({x: 920, y: 1040, s: 0.95, t, eyes: 'closed', mouth: 'frown', headTilt: 12}, BRO)}
      {P({x: 540, y: 1250, s: 1.35, t, eyes: 'angry', mouth: 'wide', al: 150, ar: 150, flip: false}, HERO)}
      <Say x={540} y={420} text="ЕСТЬ ХОЧУ!" t={t} at={0.25} size={64} tail={0} />
    </g>
  )},
  // 2 живот и часы «с утра»
  {a: T(11), b: T(15), tr: 'flash', cam: {s: [1.0, 1.45], r: [3, -3]}, render: ({t, lt}) => (
    <g><rect width="1080" height="1920" fill="#ffd9a8" />
      <Speed t={t} color="#ffb74d" op={0.25} />
      <g transform={`translate(540 880) scale(${1 + 0.04 * Math.sin(t * 20)})`}>
        <ellipse cx="0" cy="0" rx="260" ry="300" fill="#ffd0a6" stroke={OUT} strokeWidth="9" />
        <circle cx="0" cy="-10" r="26" fill="#e8a070" stroke={OUT} strokeWidth="6" />
        <path d="M-120 110 Q0 160 120 110" fill="none" stroke={OUT} strokeWidth="8" strokeLinecap="round" />
      </g>
      {['УРРР', 'БУРРР', 'ГРРР'].map((s, i) => <BigText key={i} x={200 + i * 320} y={400 + (i % 2) * 120} text={s + '!'} size={92} fill="#ffe14d" rot={-10 + i * 10} scale={popS(t, T(11) + 0.1 + i * 0.25)} />)}
      <g transform="translate(870 360)"><circle r="120" fill="#fff" stroke={OUT} strokeWidth="9" /><line x1="0" y1="0" x2="0" y2="-80" stroke={OUT} strokeWidth="9" strokeLinecap="round" transform={`rotate(${lt * 300})`} /><line x1="0" y1="0" x2="50" y2="0" stroke={OUT} strokeWidth="9" strokeLinecap="round" transform={`rotate(${lt * 25})`} /></g>
      <Tiny x={540} y={1150} text="С УТРА НИЧЕГО!" t={t} at={T(12)} size={64} rot={-3} />
    </g>
  )},
  // 3 «И это спасло весь город» — герой-спаситель
  {a: T(15), b: T(20), tr: 'zoom', cam: {s: [1.5, 1.0], r: [-4, 0], y: [140, 0]}, render: ({t, lt}) => (
    <g><StreetBG t={t} />
      <Speed t={t} color="#ffffff" op={0.35} />
      <g transform="translate(540 1140)">
        <path d={`M-70 -170 Q-190 ${-90 + Math.sin(t * 8) * 30} -150 ${60 + Math.sin(t * 8) * 20} L-40 -40Z`} fill="#e24a4a" stroke={OUT} strokeWidth="7" />
      </g>
      {P({x: 540, y: 1180, s: 1.7, t, eyes: 'happy', mouth: 'grin', al: 20, ar: 160}, HERO)}
      {[0, 1, 2, 3, 4].map((i) => <Sparkle key={i} x={200 + i * 170} y={420 + (i % 2) * 160} r={46} t={t} seed={i} color="#ffe14d" />)}
      <Tiny x={540} y={360} text="ГЕРОЙ ГОРОДА" t={t} at={T(17) + 0.05} size={68} rot={-4} />
    </g>
  )},
  // 4 «Видите, в этом мире»
  {a: T(20), b: T(26), tr: 'whip', cam: {s: [1.5, 1.0], r: [6, 0]}, render: ({t, lt}) => (
    <g><rect width="1080" height="1920" fill="#2a2370" />
      {Array.from({length: 18}).map((_, i) => <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 5) * 1700} r={3 + rnd(i + 1) * 6} fill="#fff" opacity={0.4 + 0.5 * Math.sin(t * 2 + i)} />)}
      <g transform={`translate(540 800) rotate(${t * 6})`}>
        <circle r="330" fill="#4fb6ff" stroke={OUT} strokeWidth="10" />
        <path d="M-200 -120 Q-120 -260 0 -200 Q60 -120 -40 -40 Q-160 0 -200 -120Z" fill="#6bd16b" stroke={OUT} strokeWidth="8" />
        <path d="M60 80 Q200 40 250 180 Q160 280 40 220Z" fill="#6bd16b" stroke={OUT} strokeWidth="8" />
        <ellipse cx="-100" cy="-170" rx="70" ry="22" fill="#fff" opacity="0.7" />
      </g>
      <BigText x={540} y={330} text="В ЭТОМ МИРЕ" size={118} fill="#fff" rot={-3} scale={popS(t, T(20) + 0.1, 5)} />
      <Tiny x={540} y={1280} text="ЕСТЬ ОДНO ПРАВИЛО" t={t} at={T(24)} size={56} rot={2} />
    </g>
  )},
  // 5 кто-то спрашивает
  {a: T(26), b: T(32), tr: 'whip', cam: {s: [1.0, 1.3], x: [-40, 60]}, render: ({t, lt}) => (
    <g><KitchenBG t={t} />
      <Table x={720} y={1130} w={520} plates={2} food="soup" t={t} />
      {P({x: 300, y: 1200, s: 1.45, t, eyes: 'open', mouth: 'open', al: 30, ar: 130, talk: true, look: 1}, DAD)}
      <Say x={410} y={440} text={'ЧТО\nНА УЖИН?'} t={t} at={T(29)} size={74} tail={-1} />
    </g>
  )},
  // 6 ужин откладывается на 1 час
  {a: T(32), b: T(37), tr: 'flash', cam: {s: [1.5, 1.0], r: [-3, 3], shake: 0.5}, render: ({t, lt}) => {
    const k = clampN((lt - 0.55) * 4);
    return (
      <g><KitchenBG t={t} />
        <rect width="1080" height="1920" fill="#ff4a3a" opacity={0.12 * Math.exp(-lt * 2)} />
        <Timer x={540} y={760} s={2.0} text={k > 0.5 ? '+1:00' : '0:05'} pulse={Math.exp(-(lt - 0.55) * 7) * (lt > 0.55 ? 1 : 0)} ring={lt < 0.55} t={t} color={k > 0.5 ? '#ff4a3a' : '#7dffb2'} />
        {k > 0 && <BigText x={540} y={1180} text="+1 ЧАС" size={150} fill="#ffe14d" rot={-4} scale={popS(lt, 0.55, 5)} />}
        {lt > 0.55 && <Confetti t={t} lt={lt - 0.55} n={18} />}
      </g>
    );
  }},
  // 7 все осторожны
  {a: T(37), b: T(41), tr: 'whip', cam: {s: [1.1, 1.1], x: [-220, 180], lin: true}, render: ({t, lt}) => (
    <g><StreetBG t={t} px={lt * -60} />
      {[0, 1, 2, 3].map((i) => {
        const bases = [MOM, DAD, GRANNY, BRO];
        return <g key={i}>{P({x: 100 + i * 330, y: 1230 + (i % 2) * 36, s: 1.05, t: t + i, eyes: 'open', mouth: 'zip', look: -1, walk: t * 7 + i, al: 40, ar: 20 + i * 8, bob: 1.6}, bases[i] as any)}</g>;
      })}
      <Tiny x={540} y={420} text="ТИХО!" t={t} at={T(39)} size={96} rot={-3} bg="#fff" />
    </g>
  )},
  // 8 мамы: сюрприз
  {a: T(41), b: T(44), tr: 'flash', cam: {s: [1.2, 1.0], r: [-4, 2]}, render: ({t, lt}) => (
    <g><KitchenBG t={t} />
      {P({x: 540, y: 1220, s: 1.75, t, eyes: 'happy', mouth: 'grin', al: 160, ar: 160, talk: true, holdR: <Cake s={1.3} />, holdL: null}, MOM)}
      <Say x={540} y={400} text="СЮРПРИЗ!" t={t} at={T(43) - 0.05} size={96} tail={0} />
      <Confetti t={t} lt={Math.max(0, lt - 0.3)} n={34} />
    </g>
  )},
  // 9 деды: еда
  {a: T(44), b: T(47), tr: 'whip', cam: {s: [1.0, 1.35], x: [60, -40]}, render: ({t, lt}) => (
    <g><KitchenBG t={t} />
      <Table x={720} y={1150} w={500} plates={2} food="pasta" t={t} />
      {P({x: 330, y: 1220, s: 1.7, t, eyes: 'open', mouth: 'open', al: 20, ar: 130, talk: true, look: 1}, GRANPA)}
      <Say x={400} y={430} text="ЕДА!" t={t} at={T(46) - 0.1} size={110} tail={-1} />
    </g>
  )},
  // 10 бабушки: кукуруза и уходят
  {a: T(47), b: T(54), tr: 'whip', cam: {s: [1.2, 1.0], x: [0, 80]}, render: ({t, lt, d}) => {
    const walkP = clampN((lt - 1.6) / (d - 1.6));
    return (
      <g><StreetBG t={t} />
        {P({x: 420 + walkP * 760, y: 1220, s: 1.55, t, eyes: 'happy', mouth: 'smile', al: 25, ar: 25, walk: walkP > 0 ? t * 9 : 0, flip: walkP > 0}, GRANNY)}
        {P({x: 840 - walkP * 100, y: 1230, s: 1.3, t, eyes: 'open', mouth: 'o', al: lt < 1.6 ? 150 : 20, ar: 20, holdL: lt < 1.6 ? null : <Corn s={1.2} />, look: -1, flip: true}, HERO)}
        {lt < 1.6 && <g transform={`translate(${420 + 250 - ease(lt) * 0}, ${1000 - Math.sin(lt * 3) * 6})`}><Corn s={1.4} /></g>}
        <Say x={560} y={470} text="ДЕРЖИ КУКУРУЗУ" t={t} at={T(49)} size={58} tail={-1} />
      </g>
    );
  }},
  // 11 «Но я всегда спрашиваю» — хитрый герой
  {a: T(54), b: T(58), tr: 'zoom', cam: {s: [1.0, 1.7], y: [0, 160]}, render: ({t, lt}) => (
    <g><KitchenBG t={t} dark={0.12} />
      {P({x: 540, y: 1260, s: 1.9, t, eyes: 'open', mouth: 'grin', look: 1, brow: -0.7, al: 20, ar: 150}, HERO)}
      <Tiny x={540} y={380} text="НО Я ВСЁ РАВНО..." t={t} at={T(56)} size={62} rot={-3} />
    </g>
  )},
  // 12 «Что на ужин?» — раз
  {a: T(58), b: T(61), tr: 'flash', cam: {s: [1.3, 1.05], r: [4, -2], shake: 0.4}, render: ({t, lt}) => (
    <g><KitchenBG t={t} />
      <Speed t={t} color="#fff7c2" op={0.25} />
      {P({x: 540, y: 1220, s: 1.9, t, eyes: 'happy', mouth: 'wide', al: 150, ar: 150, talk: true}, HERO)}
      <Say x={540} y={480} text={'ЧТО НА\nУЖИН?'} t={t} at={T(58)} size={90} tail={0} />
      <Timer x={880} y={900} s={0.7} text="+1:00" pulse={Math.exp(-lt * 6)} t={t} />
    </g>
  )},
  // 13 «Что на ужин?» — два
  {a: T(61), b: T(64), tr: 'flash', cam: {s: [1.4, 1.1], r: [-5, 3], shake: 0.7}, render: ({t, lt}) => (
    <g><KitchenBG t={t} />
      <Burst x={540} y={640} r={560} color="#ff9a3a" rot={-t * 30} />
      {P({x: 540, y: 1220, s: 2.1, t, eyes: 'angry', mouth: 'wide', al: 160, ar: 160, talk: true, brow: 0.5}, HERO)}
      <Say x={540} y={480} text={'ЧТО НА\nУЖИН?!'} t={t} at={T(61) + 0.12} size={100} tail={0} rot={-3} />
      <Timer x={200} y={960} s={0.62} text="+2:00" pulse={Math.exp(-lt * 6)} t={t} />
    </g>
  )},
  // 14 брат чинит электромобиль
  {a: T(64), b: T(68), tr: 'whip', cam: {s: [1.3, 1.0], x: [160, -60]}, render: ({t, lt}) => (
    <g><StreetBG t={t} />
      <Car x={620} y={1130} s={1.25} t={t} hood />
      {P({x: 240, y: 1220, s: 1.55, t, eyes: 'open', mouth: 'grin', al: 140, ar: 20, headTilt: Math.sin(t * 9) * 6, holdL: <g transform="rotate(30)"><rect x="-8" y="-70" width="16" height="90" rx="8" fill="#c9ced9" stroke={OUT} strokeWidth="5" /><circle cy="-76" r="22" fill="#c9ced9" stroke={OUT} strokeWidth="5" /></g>}, BRO)}
      {[0, 1, 2].map((i) => <Sparkle key={i} x={420 + i * 80} y={760 + (i % 2) * 50} r={36} t={t} seed={i} color="#ffe14d" />)}
      <Tiny x={600} y={420} text="ЧИНИТ ЭЛЕКТРОМОБИЛЬ" t={t} at={T(66)} size={52} rot={-2} />
    </g>
  )},
  // 15 папа ест огурец
  {a: T(68), b: T(71), tr: 'flash', cam: {s: [1.0, 1.55], y: [0, 110]}, render: ({t, lt}) => {
    const bite = Math.abs(Math.sin(t * 9));
    return (
      <g><KitchenBG t={t} />
        {P({x: 540, y: 1260, s: 1.9, t, eyes: 'happy', mouth: bite > 0.6 ? 'open' : 'smile', al: 150, ar: 20, holdL: <g transform="translate(40 -50) rotate(80)"><Cucumber s={1.5} bite={lt > 0.5} /></g>, bob: 1.8, headTilt: Math.sin(t * 9) * 3}, DAD)}
        <BigText x={850} y={520} text="ХРУМ!" size={110} fill="#a8ff6a" rot={8} scale={bite > 0.7 ? 1.15 : 0.95} />
      </g>
    );
  }},
  // 16a суп горячий
  {a: T(71), b: T(75), tr: 'whip', cam: {s: [1.0, 1.4], y: [0, 100]}, render: ({t, lt}) => (
    <g><KitchenBG t={t} />
      <Table x={540} y={1180} w={760} plates={1} food="soup" t={t} scale={1.6} />
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${400 + i * 70} ${960 - ((t * 120 + i * 50) % 200)} q-24 -40 0 -80 q24 -40 0 -80`} fill="none" stroke="#fff" strokeWidth="12" strokeLinecap="round" opacity="0.65" />)}
      <Tiny x={540} y={380} text="СУП МАМЫ" t={t} at={T(71)} size={72} rot={-3} bg="#fff" />
      <Tiny x={540} y={1450 - 0} text="ГОРЯЧИЙ 🔥" t={t} at={T(74)} size={60} rot={2} bg="#ff7b3a" fg="#fff" />
    </g>
  )},
  // 16b суп холодный
  {a: T(75), b: T(77), tr: 'flash', cam: {s: [1.2, 1.0], r: [-3, 3]}, render: ({t, lt}) => (
    <g><rect width="1080" height="1920" fill="#bfe8ff" />
      <KitchenBG t={t} dark={0} />
      <rect width="1080" height="1920" fill="#7fc8ff" opacity="0.45" />
      <Table x={540} y={1180} w={760} plates={1} food="soup" t={0} scale={1.6} />
      {Array.from({length: 22}).map((_, i) => <text key={i} x={rnd(i) * 1080} y={(rnd(i + 2) * 2000 + t * 160) % 2000 - 60} fontSize={50 + rnd(i) * 40} fill="#fff" stroke={OUT} strokeWidth="4" fontFamily={FONT}>❄</text>)}
      <Tiny x={540} y={440} text="ХОЛОДНЫЙ ❄" t={t} at={T(75)} size={86} rot={-3} bg="#d9f4ff" />
    </g>
  )},
  // 16c суп исторический
  {a: T(77), b: T(79), tr: 'flash', cam: {s: [1.0, 1.35], r: [2, -2]}, render: ({t, lt}) => (
    <g><rect width="1080" height="1920" fill="#d6c08a" />
      <rect x="40" y="120" width="1000" height="1500" fill="none" stroke="#6b4a22" strokeWidth="18" />
      <Table x={540} y={1200} w={760} plates={1} food="none" scale={1.6} color="#9a7a4a" />
      <g transform="translate(540 1060)"><ellipse rx="150" ry="36" fill="#e2d3a8" stroke={OUT} strokeWidth="7" /><path d="M-60 -10 q20 -30 40 0 M20 -10 q20 -30 40 0" stroke={OUT} strokeWidth="6" fill="none" /><rect x="-10" y="-70" width="20" height="60" fill="#f4eed8" stroke={OUT} strokeWidth="6" /></g>
      {[0, 1, 2].map((i) => <path key={i} d={`M${120 + i * 300} 160 Q${200 + i * 300} 300 ${160 + i * 300} 420 M${120 + i * 300} 160 Q${60 + i * 300} 280 ${100 + i * 300} 360`} stroke="#fff" strokeWidth="5" fill="none" opacity="0.8" />)}
      <Pill x={540} y={380} text="МУЗЕЙ. 1485 ГОД" size={64} rot={-2} bg="#fff" scale={popS(t, T(77), 6)} />
      <BigText x={540} y={640} text="ИСТОРИЧЕСКИЙ" size={92} fill="#fff" rot={3} scale={popS(t, T(78), 6)} />
      {Array.from({length: 18}).map((_, i) => <circle key={i} cx={rnd(i) * 1080} cy={(rnd(i + 3) * 1800 + t * 40) % 1800} r={3 + rnd(i) * 5} fill="#fff" opacity="0.5" />)}
    </g>
  )},
  // 17 фестиваль города
  {a: T(79), b: T(83), tr: 'zoom', cam: {s: [1.0, 1.0], y: [220, -40], r: [0, 0]}, render: ({t, lt}) => (
    <g><StreetBG t={t} lights />
      <Bunting y={150} t={t} />
      <g transform="translate(540 600)"><rect x="-380" y="-70" width="760" height="140" rx="30" fill="#e8467f" stroke={OUT} strokeWidth="9" transform={`scale(${popS(t, T(79) + 0.1, 5)})`} /><text y="34" textAnchor="middle" fontFamily={FONT} fontSize="100" fill="#fff" stroke={OUT} strokeWidth="12" paintOrder="stroke" transform={`scale(${popS(t, T(79) + 0.2, 5)})`}>ФЕСТИВАЛЬ</text></g>
      {[0, 1, 2, 3, 4].map((i) => <g key={i} transform={`translate(${130 + i * 205} ${900 - lt * 60 - (i % 2) * 90})`}><ellipse rx="50" ry="62" fill={['#ff5a7a', '#ffd13a', '#59c3ff', '#7be07b', '#b48cff'][i]} stroke={OUT} strokeWidth="6" /><path d="M0 62 q-14 60 8 140" stroke={OUT} strokeWidth="5" fill="none" /></g>)}
      <Crowd x={540} y={1180} cols={7} rows={2} gap={150} s={0.9} t={t} seed={3} />
      <Confetti t={t} lt={lt} n={30} />
    </g>
  )},
  // 18 500 столов
  {a: T(83), b: T(87), tr: 'whip', cam: {s: [1.3, 0.95], y: [100, -60]}, render: ({t, lt, d}) => {
    const n = Math.round(clampN(lt / (d * 0.8)) * 500);
    return (
      <g><StreetBG t={t} />
        <rect x="0" y="1060" width="1080" height="860" fill="#b5a081" />
        {Array.from({length: 5}).map((_, r) => Array.from({length: 7}).map((_, c) => { const sc = 0.18 + r * 0.07; return <g key={`${r}-${c}`} transform={`translate(${540 + (c - 3) * (130 + r * 40)} ${1120 + r * 130}) scale(${sc * 1.5})`}><Table x={0} y={0} w={400} plates={2} food={(r + c) % 3 === 0 ? 'cake' : 'pasta'} /></g>; }))}
        <BigText x={540} y={500} text={String(n)} size={280} fill="#ffe14d" scale={1 + 0.06 * Math.sin(lt * 20)} />
        <BigText x={540} y={680} text="СТОЛОВ" size={110} fill="#fff" rot={-3} />
      </g>
    );
  }},
  // 19 мэр
  {a: T(87), b: T(93), tr: 'whip', cam: {s: [1.0, 1.35], x: [-80, 60]}, render: ({t, lt}) => (
    <g><StreetBG t={t} lights />
      <Bunting y={100} t={t} />
      <Crowd x={540} y={1130} cols={8} rows={1} gap={140} s={0.8} t={t} seed={5} />
      {P({x: 540, y: 1260, s: 1.75, t, eyes: 'happy', mouth: 'grin', al: 150, ar: 20, talk: true, holdL: <g transform="translate(0 -60) rotate(-20)"><Bell x={0} y={0} s={0.45} swing={Math.sin(t * 20) * 12} /></g>}, MAYOR)}
      <Say x={540} y={380} text={'ВСЕХ ЗОВУ\nНА ПИР!'} t={t} at={T(90)} size={70} tail={0} />
    </g>
  )},
  // 20 под городом — спуск камеры
  {a: T(93), b: T(98), tr: 'flash', cam: {s: [1.0, 1.0], y: [-1100, 280], lin: false, hand: 0.3}, render: ({t, lt}) => (
    <g>
      <rect y="-900" width="1080" height="1100" fill="#74c9ff" />
      <Buildings y={200} seed={4} lights t={t} />
      <rect y="200" width="1080" height="1820" fill="#5a3a22" />
      {Array.from({length: 22}).map((_, i) => <ellipse key={i} cx={rnd(i) * 1080} cy={300 + rnd(i + 1) * 1500} rx={20 + rnd(i + 2) * 40} ry={12 + rnd(i + 3) * 20} fill={['#7a5230', '#4a2e18', '#8a6240'][i % 3]} stroke={OUT} strokeWidth="5" />)}
      <rect y="1100" width="1080" height="900" fill="#1a0e2a" opacity="0.7" />
      <g transform="translate(540 1500)">
        {[-1, 1].map((sg) => <g key={sg}><circle cx={sg * 120} cy="0" r="62" fill="#fff0a0" stroke={OUT} strokeWidth="8" opacity={0.4 + 0.6 * clampN((lt - 1.4) * 2)} /><circle cx={sg * 120} cy="10" r="26" fill={OUT} opacity={clampN((lt - 1.4) * 2)} /></g>)}
      </g>
      <Tiny x={540} y={900} text="НО ПОД ГОРОДОМ..." t={t} at={T(94)} size={60} rot={-3} bg="#fff" />
    </g>
  )},
  // 21 монстр — раскрытие
  {a: T(98), b: T(104), tr: 'flash', cam: {s: [1.6, 0.95], y: [-380, 40], r: [4, 0], shake: 0.3}, render: ({t, lt}) => (
    <g><rect width="1080" height="1920" fill="#2a1250" />
      {Array.from({length: 18}).map((_, i) => <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 4) * 1700} r={3 + rnd(i) * 7} fill="#b48cff" opacity="0.4" />)}
      <rect y="1240" width="1080" height="700" fill="#3a2060" />
      <Monster x={540} y={1320} s={1.05} t={t} eyes="open" mouth={0} />
      <Pill x={540} y={440} text="СТОЛОЕД" size={100} rot={-3} bg="#ff6a8a" fg="#fff" scale={popS(t, T(99) - 0.05, 5)} />
      <Tiny x={540} y={1500} text="САЛФЕТКА НА ШЕЕ" t={t} at={T(101)} size={50} rot={3} bg="#fff" />
    </g>
  )},
  // 22 «Когда стол готовится» — стол с едой, глаза под полом
  {a: T(104), b: T(107), tr: 'whip', cam: {s: [1.0, 1.3], x: [0, 0]}, render: ({t, lt}) => (
    <g><StreetBG t={t} />
      <Table x={540} y={1180} w={760} plates={3} food="pasta" t={t} scale={1.5} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${340 + i * 200} ${980 - ((t * 120 + i * 60) % 200)} q-20 -40 0 -80 q20 -40 0 -80`} fill="none" stroke="#fff" strokeWidth="12" strokeLinecap="round" opacity="0.7" />)}
      <Tiny x={540} y={440} text="СТОЛ ГОТОВ!" t={t} at={T(105)} size={90} rot={-3} bg="#7dff9a" />
      <g opacity={clampN((lt - 0.8) * 2)}><circle cx="440" cy="1500" r="26" fill="#ffe14d" stroke={OUT} strokeWidth="6" /><circle cx="640" cy="1500" r="26" fill="#ffe14d" stroke={OUT} strokeWidth="6" /></g>
    </g>
  )},
  // 23 просыпается, ест всё
  {a: T(107), b: T(112), tr: 'flash', cam: {s: [1.0, 1.25], shake: 1.1, punch: 0.15}, render: ({t, lt}) => {
    const open = clampN((lt - 0.2) * 3);
    return (
      <g><rect width="1080" height="1920" fill="#4a0f2e" /><Speed t={t} color="#ff5a7a" op={0.4} />
        <Monster x={540} y={1500} s={1.5} t={t} eyes="angry" mouth={open} />
        <BigText x={540} y={470} text="РРРРР!" size={150} fill="#ffe14d" rot={-4} scale={1 + 0.07 * Math.sin(t * 40)} />
        <Flash lt={lt} color="#ff3a5a" k={5} />
      </g>
    );
  }},
  // 24 тарелки, столы, люди
  {a: T(112), b: T(115), tr: 'whip', cam: {s: [1.2, 1.0], shake: 0.6}, render: ({t, lt}) => {
    const items = [{at: T(112), kind: 'plate'}, {at: T(113), kind: 'table'}, {at: T(114), kind: 'person'}];
    return (
      <g><rect width="1080" height="1920" fill="#2a1250" />
        <Monster x={540} y={1500} s={1.5} t={t} eyes="angry" mouth={0.5 + 0.5 * Math.abs(Math.sin(t * 9))} />
        {items.map((it, i) => {
          const k = clampN((t - it.at) / 0.55);
          if (t < it.at) return null;
          const x = (i === 1 ? 800 : i === 0 ? 240 : 540) + (540 - (i === 1 ? 800 : i === 0 ? 240 : 540)) * k, y = 480 + (950 - 480) * k * k;
          return <g key={i} transform={`translate(${x} ${y}) rotate(${k * 360}) scale(${1.3 - k * 0.6})`}>{it.kind === 'plate' ? <><ellipse rx="100" ry="30" fill="#fff" stroke={OUT} strokeWidth="7" /></> : it.kind === 'table' ? <Table x={0} y={0} w={260} plates={1} food="pasta" /> : <g>{P({x: 0, y: 160, s: 0.9, t, eyes: 'shock', mouth: 'o', al: 150, ar: 150}, MOM)}</g>}</g>;
        })}
        {items.map((it, i) => t >= it.at && t < it.at + 0.5 ? <BigText key={i} x={540} y={300 + i * 120} text={['ОМ!', 'НЯМ!', 'ХРУСЬ!'][i]} size={110} fill="#ffe14d" rot={-5 + i * 5} /> : null)}
      </g>
    );
  }},
  // 25 звонок
  {a: T(115), b: T(117), tr: 'flash', cam: {s: [1.0, 1.15], r: [-4, 4], shake: 0.9}, render: ({t, lt}) => (
    <g><rect width="1080" height="1920" fill="#ffe9a0" />
      <Speed t={t} color="#ffb41f" op={0.45} />
      <Bell x={540} y={880} s={2.6} swing={Math.sin(lt * 34) * 28} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${130 + i * 6} ${600 - i * 70} q-60 160 0 320`} transform={`translate(${i * 4} 0)`} stroke={OUT} strokeWidth="9" fill="none" strokeLinecap="round" opacity={0.8 - i * 0.2} />)}
      <BigText x={540} y={470} text="ДИНГ-ДОНГ!" size={112} fill="#fff" rot={-5} scale={1 + 0.08 * Math.sin(t * 40)} />
    </g>
  )},
  // 26 город бежал
  {a: T(117), b: T(119), tr: 'whip', cam: {s: [1.0, 1.25], shake: 1.0}, render: ({t, lt}) => (
    <g><StreetBG t={t} />
      <Speed t={t} color="#fff" op={0.3} />
      <Crowd x={540} y={1060} cols={7} rows={4} gap={150} s={1.0 + lt * 0.5} t={t} seed={11} run mouth />
      <BigText x={540} y={380} text="БЕЖИМ!!!" size={150} fill="#fff" rot={-4} scale={1 + 0.08 * Math.sin(t * 30)} />
    </g>
  )},
  // 27 он пришёл
  {a: T(119), b: T(121), tr: 'flash', cam: {s: [1.15, 1.0], y: [-120, 40], shake: 1.4, punch: 0.18}, render: ({t, lt}) => (
    <g><StreetBG t={t} />
      <Monster x={540} y={1380} s={1.45 - lt * 0.1} t={t} eyes="angry" mouth={0.8} stomp={1} />
      {[0, 1, 2, 3, 4, 5].map((i) => <ellipse key={i} cx={120 + i * 170} cy={1360 + (i % 2) * 20} rx={60 + lt * 40} ry={24} fill="#8d7a68" opacity={0.6 * Math.exp(-lt * 1.5)} />)}
      <BigText x={540} y={470} text="БУМ!" size={210} fill="#ffe14d" rot={-4} scale={popS(lt, 0.05, 8)} />
      <Flash lt={lt} k={7} />
    </g>
  )},
  // 28 я заметил
  {a: T(121), b: T(125), tr: 'zoom', cam: {s: [1.0, 1.7], y: [0, 120]}, render: ({t, lt}) => (
    <g><rect width="1080" height="1920" fill="#3a2a6a" /><Speed t={t} color="#7a6ad8" op={0.25} />
      {P({x: 540, y: 1260, s: 1.9, t, eyes: 'open', mouth: 'o', look: 1, brow: 0.5, al: 20, ar: 140, headTilt: 5}, HERO)}
      <g transform={`translate(790 520) scale(${popS(t, T(123) + 0.15, 6)})`}><circle r="110" fill="#ffe14d" stroke={OUT} strokeWidth="9" /><text y="52" textAnchor="middle" fontSize="150" fontFamily={FONT} fill={OUT}>!</text></g>
    </g>
  )},
  // 29 может есть только готовый стол
  {a: T(125), b: T(133), tr: 'whip', cam: {s: [1.0, 1.0], x: [-260, 260]}, render: ({t, lt, d}) => {
    const k = clampN(lt / d);
    return (
      <g><StreetBG t={t} />
        <Monster x={540} y={940} s={0.62} t={t} eyes="hungry" mouth={0.2 + 0.2 * Math.sin(t * 4)} />
        <Table x={220} y={1280} w={420} plates={2} food="none" scale={1.1} />
        <Table x={860} y={1280} w={420} plates={2} food="pasta" t={t} scale={1.1} />
        <Pill x={860} y={1020} text="ГОТОВ ✓" size={54} bg="#7dff9a" rot={3} scale={popS(t, T(129), 6)} />
        <Pill x={220} y={1020} text="ПУСТОЙ ✗" size={54} bg="#ff8a8a" rot={-3} scale={popS(t, T(126), 6)} />
        <g transform={`translate(${220 + 640 * clampN((lt - 2.2) / 1.6)} 1180)`}><path d="M0 0" /></g>
      </g>
    );
  }},
  // 30 я взял микрофон
  {a: T(133), b: T(136), tr: 'flash', cam: {s: [1.0, 1.6], y: [0, 140], punch: 0.12}, render: ({t, lt}) => (
    <g><rect width="1080" height="1920" fill="#2a1250" /><Speed t={t} color="#b48cff" op={0.25} />
      {P({x: 540, y: 1250, s: 1.9, t, eyes: 'angry', mouth: 'grin', brow: -0.3, al: 20, ar: 150, holdR: <g transform="translate(10 -50) scale(1.6)"><Mic /></g>}, HERO)}
      <Tiny x={540} y={360} text="ДАЙ СЮДА!" t={t} at={T(134)} size={78} rot={-4} />
    </g>
  )},
  // 31 «Что на ужин?» в микрофон
  {a: T(136), b: T(139), tr: 'flash', cam: {s: [1.5, 1.1], r: [-4, 2], shake: 0.9}, render: ({t, lt}) => (
    <g><rect width="1080" height="1920" fill="#7a2fd0" /><Burst x={540} y={700} r={600} color="#b48cff" rot={t * 30} />
      {P({x: 540, y: 1240, s: 2.0, t, eyes: 'angry', mouth: 'wide', al: 20, ar: 150, talk: true, holdR: <g transform="translate(0 -30) scale(1.6)"><Mic /></g>}, HERO)}
      <Say x={540} y={470} text={'ЧТО НА\nУЖИН?!'} t={t} at={T(137) - 0.2} size={100} tail={0} rot={-3} />
      {[0, 1, 2].map((i) => <circle key={i} cx={540} cy={640} r={200 + ((lt * 800 + i * 200) % 600)} fill="none" stroke="#fff" strokeWidth="8" opacity={0.6 - ((lt * 800 + i * 200) % 600) / 1000} />)}
    </g>
  )},
  // 32 500 людей присоединились
  {a: T(139), b: T(142), tr: 'whip', cam: {s: [1.4, 0.9], y: [260, -40]}, render: ({t, lt, d}) => {
    const n = Math.round(clampN(lt / (d * 0.75)) * 500);
    return (
      <g><StreetBG t={t} lights />
        <Crowd x={540} y={900} cols={13} rows={8} gap={82} s={1.0} t={t} seed={7} mouth />
        <BigText x={540} y={520} text={String(n)} size={260} fill="#ffe14d" />
        <BigText x={540} y={660} text="ЛЮДЕЙ!" size={120} fill="#fff" rot={-3} />
      </g>
    );
  }},
  // 33 хором «Что на ужин?!»
  {a: T(142), b: T(145) + 0.2, tr: 'flash', cam: {s: [1.0, 1.3], shake: 1.5, punch: 0.14, r: [-2, 2]}, render: ({t, lt}) => (
    <g><rect width="1080" height="1920" fill="#ff6a3a" /><Speed t={t} color="#ffe14d" op={0.5} />
      <Crowd x={540} y={1000} cols={9} rows={6} gap={115} s={1.0} t={t} seed={21} mouth />
      <g transform={`translate(540 480) scale(${1 + 0.06 * Math.sin(t * 36)})`}><BigText x={0} y={0} text={'ЧТО НА'} size={140} fill="#fff" rot={-3} /><BigText x={0} y={170} text={'УЖИН?!'} size={170} fill="#ffe14d" rot={3} /></g>
      <Flash lt={lt} k={6} />
    </g>
  )},
  // 34 ужин отложен на 500 часов
  {a: T(145) + 0.2, b: T(149), tr: 'flash', cam: {s: [1.4, 1.0], r: [5, -3]}, render: ({t, lt, d}) => {
    const n = Math.round(clampN(lt / (d * 0.65)) * 500);
    return (
      <g><KitchenBG t={t} dark={0.25} />
        <Timer x={540} y={760} s={2.2} text={`+${n}:00`} pulse={Math.exp(-lt * 3)} color="#ff4a3a" t={t} />
        {Array.from({length: 14}).map((_, i) => <g key={i} transform={`translate(${rnd(i) * 1080} ${(rnd(i + 2) * 2000 + t * 300 * (0.5 + rnd(i))) % 2000 - 80}) rotate(${t * 60 * (rnd(i + 5) - 0.5) * 3})`}><rect x="-50" y="-60" width="100" height="120" rx="10" fill="#fff" stroke={OUT} strokeWidth="6" /><rect x="-50" y="-60" width="100" height="34" rx="10" fill="#e24a4a" stroke={OUT} strokeWidth="6" /><text y="40" textAnchor="middle" fontFamily={FONT} fontSize="56" fill={OUT}>{(i % 28) + 1}</text></g>)}
        <BigText x={540} y={1240} text="+500 ЧАСОВ" size={140} fill="#ffe14d" rot={-3} scale={popS(lt, 0.3, 4)} />
      </g>
    );
  }},
  // 35 монстр смотрит на пустые столы
  {a: T(149), b: T(156), tr: 'dip', cam: {s: [1.0, 1.3], y: [0, 60], hand: 0.5}, render: ({t, lt}) => (
    <g><StreetBG t={t} sky={['#c9b99a', '#efe3cc']} />
      <Monster x={540} y={1180} s={0.95} t={t} eyes="hungry" mouth={0} />
      <Table x={170} y={1340} w={300} plates={1} food="none" scale={1.0} /><Table x={910} y={1340} w={300} plates={1} food="none" />
      <g transform={`translate(${(t * 140) % 1500 - 200} 1300) rotate(${t * 200})`}><circle r="40" fill="#b8a05a" stroke={OUT} strokeWidth="5" /><path d="M-30 -10 L30 10 M-30 10 L30 -10 M0 -40 L0 40" stroke={OUT} strokeWidth="4" /></g>
      <Pill x={540} y={380} text="ВСЕ СТОЛЫ ПУСТЫ" size={62} bg="#fff" rot={-2} scale={popS(t, T(152), 5)} />
    </g>
  )},
  // 36 кричал от голода
  {a: T(156), b: T(162), tr: 'flash', cam: {s: [1.4, 1.2], shake: 1.2, r: [-3, 3]}, render: ({t, lt}) => (
    <g><rect width="1080" height="1920" fill="#3a1a70" /><Speed t={t} color="#7a5ad8" op={0.3} />
      <Monster x={540} y={1380} s={1.3} t={t} eyes="cry" mouth={0.9 + 0.1 * Math.sin(t * 25)} />
      <BigText x={540} y={470} text="ААААА!!!" size={150} fill="#fff" rot={-4} scale={1 + 0.06 * Math.sin(t * 30)} />
    </g>
  )},
  // 37 спит
  {a: T(162), b: T(167), tr: 'dip', cam: {s: [1.5, 1.0], y: [-100, 0], hand: 0.4}, render: ({t, lt}) => (
    <g><NightBG t={t} />
      <Monster x={540} y={1250} s={0.9} t={t} eyes="sleep" mouth={0.05} zzz />
      <Pill x={540} y={400} text="СПИТ В СТОЛОВОЙ" size={60} bg="#cfd7ff" rot={-2} scale={popS(t, T(165), 5)} />
    </g>
  )},
  // 38a три недели
  {a: T(167), b: T(170), tr: 'whip', cam: {s: [1.15, 1.0], r: [4, 0]}, render: ({t, lt}) => (
    <g><rect width="1080" height="1920" fill="#2f9e8a" />
      <g transform={`translate(540 800) rotate(${Math.sin(lt * 8) * 4})`}>
        <rect x="-340" y="-420" width="680" height="800" rx="40" fill="#fff" stroke={OUT} strokeWidth="10" /><rect x="-340" y="-420" width="680" height="170" rx="40" fill="#e24a4a" stroke={OUT} strokeWidth="10" />
        <text y="-290" textAnchor="middle" fontFamily={FONT} fontSize="96" fill="#fff" stroke={OUT} strokeWidth="9" paintOrder="stroke">3 НЕДЕЛИ</text>
        {Array.from({length: 21}).map((_, i) => <g key={i}><text x={-270 + (i % 7) * 90} y={-150 + Math.floor(i / 7) * 130} textAnchor="middle" fontFamily={FONT} fontSize="56" fill={OUT}>{i + 1}</text>{lt * 14 > i && <path d={`M${-300 + (i % 7) * 90} ${-190 + Math.floor(i / 7) * 130} l60 60 m0 -60 l-60 60`} stroke="#e24a4a" strokeWidth="10" strokeLinecap="round" />}</g>)}
      </g>
    </g>
  )},
  // 38b часы дошли до нуля
  {a: T(170), b: T(174), tr: 'flash', cam: {s: [1.0, 1.4], r: [0, 0], shake: 0.3}, render: ({t, lt, d}) => {
    const k = clampN(lt / (d * 0.7));
    const hrs = Math.round((1 - k) * 500);
    const done = k >= 1;
    return (
      <g><KitchenBG t={t} dark={0.1} />
        <Timer x={540} y={760} s={2.2} text={done ? '0:00' : `${hrs}:00`} pulse={done ? Math.exp(-(lt - d * 0.7) * 5) : 0} color={done ? '#7dffb2' : '#ff4a3a'} t={t} ring={done} />
        {done && <BigText x={540} y={1200} text="ГОТОВО!" size={150} fill="#7dff9a" rot={-3} scale={popS(lt, d * 0.7, 5)} />}
        {done && [0, 1, 2, 3, 4, 5].map((i) => <Sparkle key={i} x={140 + i * 160} y={400 + (i % 2) * 400} r={50} t={t} seed={i} color="#ffe14d" />)}
        {done && <Flash lt={lt - d * 0.7} k={8} />}
      </g>
    );
  }},
  // 39 спагетти на 3000
  {a: T(174), b: T(180), tr: 'zoom', cam: {s: [1.2, 0.95], x: [-80, 80], y: [160, -60]}, render: ({t, lt, d}) => {
    const n = Math.round(clampN(lt / (d * 0.7)) * 3000);
    return (
      <g><StreetBG t={t} lights />
        <Bunting y={110} t={t} />
        {[0, 1, 2, 3].map((r) => <g key={r} transform={`translate(0 ${1090 + r * 150})`}>{[0, 1, 2, 3, 4].map((c) => <g key={c} transform={`translate(${130 + c * 205} 0) scale(${0.5 + r * 0.12})`}><Spaghetti s={0.55} t={t + c} /></g>)}</g>)}
        <Crowd x={540} y={940} cols={10} rows={2} gap={105} s={0.9} t={t} seed={31} />
        <BigText x={540} y={520} text={String(n)} size={250} fill="#ffe14d" />
        <BigText x={540} y={660} text="ПОРЦИЙ" size={110} fill="#fff" rot={-3} />
      </g>
    );
  }},
  // 40 очень-очень тихо
  {a: T(180), b: T(182), tr: 'dip', cam: {s: [1.0, 1.25], hand: 0.3, y: [0, 30]}, render: ({t, lt}) => (
    <g><StreetBG t={t} sky={['#8fa6c9', '#d8e2f2']} />
      {P({x: 220, y: 1230, s: 1.2, t, eyes: 'open', mouth: 'zip', walk: t * 3, al: 150, ar: 20, look: 1, bob: 0.5}, MOM)}
      {P({x: 440, y: 1240, s: 1.2, t, eyes: 'open', mouth: 'zip', walk: t * 3, al: 20, ar: 150, look: 1, bob: 0.5}, DAD)}
      {P({x: 640, y: 1240, s: 1.2, t, eyes: 'open', mouth: 'zip', walk: t * 3, al: 150, ar: 150, look: -1, bob: 0.5}, BRO)}
      {P({x: 860, y: 1230, s: 1.2, t, eyes: 'open', mouth: 'zip', walk: t * 3, al: 150, ar: 20, look: -1, bob: 0.5}, GRANNY)}
      <Monster x={540} y={1000} s={0.35} t={t} eyes="hungry" mouth={0} />
      <BigText x={540} y={420} text="ТССС..." size={180} fill="#fff" rot={-3} scale={1 + 0.03 * Math.sin(t * 5)} />
    </g>
  )},
  // 41 лучшая еда
  {a: T(182), b: T(189), tr: 'zoom', cam: {s: [1.0, 1.55], y: [0, 120]}, render: ({t, lt}) => {
    const chew = Math.abs(Math.sin(t * 8));
    return (
      <g><KitchenBG t={t} />
        <Table x={540} y={1330} w={800} plates={1} food="pasta" t={t} scale={1.3} />
        {P({x: 540, y: 1230, s: 1.9, t, eyes: 'happy', mouth: chew > 0.5 ? 'open' : 'grin', al: 40, ar: 40, bob: 1.2}, HERO)}
        {[0, 1, 2, 3].map((i) => <Heart key={i} x={200 + i * 230} y={420 + ((t * 60 + i * 70) % 160) * -1 + (i % 2) * 100} s={1.1 + 0.15 * Math.sin(t * 6 + i)} />)}
        {[0, 1, 2, 3, 4].map((i) => <Sparkle key={i} x={120 + i * 210} y={560 + (i % 3) * 120} r={40} t={t} seed={i} color="#ffe14d" />)}
        <Tiny x={540} y={500} text="ЛУЧШАЯ ЕДА!" t={t} at={T(184)} size={64} rot={-3} />
      </g>
    );
  }},
  // 42 мама смотрит на пустой стол
  {a: T(189), b: T(194), tr: 'dip', cam: {s: [1.0, 1.4], x: [60, -40]}, render: ({t, lt}) => (
    <g><KitchenBG t={t} dark={0.22} />
      <Table x={720} y={1170} w={520} plates={2} food="none" scale={1.2} />
      {P({x: 300, y: 1230, s: 1.65, t, eyes: 'sad', mouth: 'flat', look: 1, al: 20, ar: 20, headTilt: -5}, MOM)}
      <Timer x={880} y={400} s={0.9} text="0:00" t={t} color="#7dffb2" />
    </g>
  )},
  // 43 «Милый, что на ужин завтра?»
  {a: T(194), b: T(199), tr: 'zoom', cam: {s: [1.0, 1.4], y: [0, 110]}, render: ({t, lt}) => (
    <g><KitchenBG t={t} dark={0.18} />
      {P({x: 540, y: 1260, s: 1.9, t, eyes: 'happy', mouth: 'smile', al: 20, ar: 140, talk: true, brow: -0.1}, MOM)}
      <Say x={540} y={560} text={'ЧТО НА УЖИН\nЗАВТРА?'} t={t} at={T(195)} size={62} tail={0} />
    </g>
  )},
  // 44 ДИНГ
  {a: T(199), b: T(200), tr: 'flash', cam: {s: [1.4, 1.0], shake: 1.0, punch: 0.2}, render: ({t, lt}) => (
    <g><KitchenBG t={t} dark={0.1} />
      <Timer x={540} y={760} s={2.2} text="+1:00" pulse={Math.exp(-lt * 6)} ring t={t} />
      <BigText x={540} y={1180} text="ДИНГ!" size={220} fill="#ffe14d" rot={-4} scale={popS(lt, 0.02, 8)} />
      <Flash lt={lt} k={7} />
    </g>
  )},
  // 45 Ещё час
  {a: T(200), b: DURATION3, tr: 'zoom', cam: {s: [1.0, 1.25], hand: 1.5}, render: ({t, lt}) => (
    <g><rect width="1080" height="1920" fill="#2a2370" /><Speed t={t} color="#6a5ae0" op={0.3} />
      <Table x={540} y={1260} w={900} plates={4} food="none" />
      {P({x: 160, y: 1130, s: 0.95, t, eyes: 'closed', mouth: 'frown', headTilt: 12}, GRANNY)}
      {P({x: 380, y: 1130, s: 0.95, t, eyes: 'sad', mouth: 'frown', headTilt: -10}, MOM)}
      {P({x: 700, y: 1130, s: 0.95, t, eyes: 'sad', mouth: 'flat', headTilt: 8}, DAD)}
      {P({x: 920, y: 1130, s: 0.95, t, eyes: 'spiral', mouth: 'open'}, BRO)}
      <BigText x={540} y={600} text="ЕЩЁ ЧАС" size={190} fill="#fff" rot={-3} scale={popS(lt, 0.1, 5)} />
    </g>
  )},
];

const Vig: React.FC = () => (
  <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{position: 'absolute', pointerEvents: 'none'}}>
    <defs><radialGradient id="vg3" cx="50%" cy="50%" r="75%"><stop offset="60%" stopColor="#000" stopOpacity="0" /><stop offset="100%" stopColor="#000" stopOpacity="0.38" /></radialGradient></defs>
    <rect width="1080" height="1920" fill="url(#vg3)" />
  </svg>
);

export const Story3: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS3;
  let si = SHOTS.findIndex((s) => t >= s.a && t < s.b);
  if (si < 0) si = SHOTS.length - 1;
  const shot = SHOTS[si];
  const lt = t - shot.a, d = shot.b - shot.a;
  const tr = shot.tr ?? 'flash';
  const fadeStart = interpolate(t, [0, 0.25], [1, 0], {extrapolateRight: 'clamp'});
  const fadeEnd = interpolate(t, [DURATION3 - 0.35, DURATION3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const whip = tr === 'whip' ? Math.exp(-lt * 16) : 0;
  const flash = tr === 'flash' ? Math.exp(-lt * 14) * 0.7 : tr === 'zoom' ? Math.exp(-lt * 18) * 0.35 : 0;
  const dip = tr === 'dip' ? interpolate(lt, [0, 0.22], [0.9, 0], {extrapolateRight: 'clamp'}) : 0;
  const prog = clampN(t / DURATION3);
  return (
    <AbsoluteFill style={{backgroundColor: '#1b1730', fontFamily: FONT}}>
      <Audio src={staticFile('mix3.mp3')} />
      <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{position: 'absolute', filter: whip > 0.01 ? `blur(${whip * 22}px)` : undefined, transform: whip > 0.01 ? `translateX(${whip * 140}px)` : undefined}}>
        <Cam lt={lt} d={d} c={shot.cam}>{shot.render({t, lt, d})}</Cam>
      </svg>
      <Vig />
      <DelayHUD t={t} />
      <Subs t={t} y={shot.sub ?? 1480} />
      <div style={{position: 'absolute', left: 0, top: 0, width: `${prog * 100}%`, height: 10, background: '#ffe14d', boxShadow: '0 0 12px #ffe14d'}} />
      <AbsoluteFill style={{backgroundColor: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <AbsoluteFill style={{backgroundColor: '#000', opacity: Math.max(dip, fadeEnd, fadeStart), pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
