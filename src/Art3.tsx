import React from 'react';
import {loadFont as loadTitan} from '@remotion/google-fonts/TitanOne';
import {loadFont as loadNunito} from '@remotion/google-fonts/Nunito';

// Titan One — только латиница/цифры. Кириллицу подхватывает самый похожий круглый жирный шрифт (Nunito 900).
loadTitan('normal', {weights: ['400'], subsets: ['latin', 'latin-ext']});
loadNunito('normal', {weights: ['900'], subsets: ['cyrillic', 'cyrillic-ext', 'latin']});
export const FONT = "'Titan One', 'Nunito', sans-serif";
export const OUT = '#1b1730';
export const clampN = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const ease = (p: number) => 1 - Math.pow(1 - clampN(p), 3);
export const popS = (t: number, at: number, k = 6) => {
  const x = clampN((t - at) * k);
  if (x <= 0) return 0;
  const c1 = 1.9, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
export const rnd = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

const St = {stroke: OUT, strokeWidth: 7, strokeLinejoin: 'round', strokeLinecap: 'round'} as const;

// ───────── человечек ─────────
export type EyeK = 'open' | 'happy' | 'shock' | 'closed' | 'angry' | 'sad' | 'spiral';
export type MouthK = 'smile' | 'open' | 'o' | 'frown' | 'grin' | 'zip' | 'tongue' | 'wide' | 'flat';
export type HairK = 'short' | 'bun' | 'long' | 'bald' | 'beard' | 'cap' | 'curl' | 'hat' | 'gran' | 'kid';
export type PersonP = {
  x: number; y: number; s?: number; t: number; skin?: string; hair?: string; style?: HairK; shirt?: string; pants?: string;
  eyes?: EyeK; mouth?: MouthK; look?: number; brow?: number; al?: number; ar?: number; flip?: boolean; bob?: number;
  tilt?: number; holdL?: React.ReactNode; holdR?: React.ReactNode; headTilt?: number; talk?: boolean; walk?: number; blush?: boolean; extra?: React.ReactNode;
};
const Arm: React.FC<{sg: number; a: number; shirt: string; skin: string; hold?: React.ReactNode}> = ({sg, a, shirt, skin, hold}) => {
  const r = (a * Math.PI) / 180, L = 100;
  const sx = sg * 68, sy = -165;
  const ex = sx + sg * Math.sin(r) * L, ey = sy + Math.cos(r) * L;
  return (
    <g>
      <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={OUT} strokeWidth="46" strokeLinecap="round" />
      <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={shirt} strokeWidth="32" strokeLinecap="round" />
      <circle cx={ex} cy={ey} r="24" fill={skin} {...St} />
      {hold && <g transform={`translate(${ex} ${ey})`}>{hold}</g>}
    </g>
  );
};
export const Person: React.FC<PersonP> = ({x, y, s = 1, t, skin = '#ffd0a6', hair = '#4a2c1a', style = 'short', shirt = '#ff8a3d', pants = '#2b3a67', eyes = 'open', mouth = 'smile', look = 0, brow = 0, al = 14, ar = 14, flip, bob = 1, tilt = 0, holdL, holdR, headTilt = 0, talk, walk, blush, extra}) => {
  const bobY = Math.sin(t * 6.2 + x * 0.01) * 4 * bob;
  const wk = walk ?? 0;
  const mo: MouthK = talk ? (Math.floor(t * 9) % 2 ? 'open' : 'smile') : mouth;
  const blink = (t * 1.0 + x * 0.003) % 3.1 > 3.0;
  const eyeY = -292;
  const eye = (sg: number) => {
    const ex = sg * 36;
    if (eyes === 'happy') return <path d={`M${ex - 20} ${eyeY + 8} Q${ex} ${eyeY - 22} ${ex + 20} ${eyeY + 8}`} fill="none" {...St} strokeWidth="8" />;
    if (eyes === 'closed' || blink) return <path d={`M${ex - 20} ${eyeY} Q${ex} ${eyeY + 14} ${ex + 20} ${eyeY}`} fill="none" {...St} strokeWidth="8" />;
    if (eyes === 'spiral') return <g transform={`translate(${ex} ${eyeY}) rotate(${t * 400})`}><path d="M0 0 m0 -4 a4 4 0 1 1 -2 7 a10 10 0 1 1 6 -12 a16 16 0 1 1 -14 18" fill="none" stroke={OUT} strokeWidth="5" /></g>;
    const big = eyes === 'shock' ? 1.25 : 1;
    const pr = eyes === 'shock' ? 7 : 12;
    return (
      <g transform={`translate(${ex} ${eyeY})`}>
        <ellipse rx={23 * big} ry={29 * big} fill="#fff" {...St} strokeWidth="6" />
        <circle cx={look * 9} cy={eyes === 'sad' ? 6 : 2} r={pr} fill={OUT} />
        <circle cx={look * 9 + 4} cy={-3} r="4" fill="#fff" />
        {eyes === 'sad' && <path d={`M${-sg * 4} 24 q${-sg * 4} 24 0 44`} fill="none" stroke="#7fd4ff" strokeWidth="9" strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(t * 9)} />}
      </g>
    );
  };
  const b = brow + (eyes === 'angry' ? -1 : eyes === 'sad' ? 1 : eyes === 'shock' ? 0.6 : 0);
  const brows = (sg: number) => <line x1={sg * 36 - 22} y1={-334 - (eyes === 'shock' ? 8 : 0) + (sg * b * 9)} x2={sg * 36 + 22} y2={-334 - (eyes === 'shock' ? 8 : 0) - (sg * b * 9)} {...St} strokeWidth="8" />;
  const mouthEl = () => {
    const my = -236;
    switch (mo) {
      case 'open': return <g transform={`translate(0 ${my})`}><path d="M-28 -4 Q0 50 28 -4 Z" fill="#7a1f2e" {...St} strokeWidth="6" /><path d="M-16 20 Q0 8 16 20 Q0 34 -16 20Z" fill="#ff7b8a" /></g>;
      case 'wide': return <g transform={`translate(0 ${my})`}><path d="M-44 -12 Q0 78 44 -12 Z" fill="#7a1f2e" {...St} strokeWidth="6" /><path d="M-26 28 Q0 6 26 28 Q0 52 -26 28Z" fill="#ff7b8a" /></g>;
      case 'o': return <ellipse cx="0" cy={my + 10} rx="15" ry="20" fill="#7a1f2e" {...St} strokeWidth="6" />;
      case 'frown': return <path d={`M-28 ${my + 18} Q0 ${my - 8} 28 ${my + 18}`} fill="none" {...St} strokeWidth="8" />;
      case 'grin': return <g transform={`translate(0 ${my})`}><path d="M-36 -6 Q0 44 36 -6 Z" fill="#fff" {...St} strokeWidth="6" /><line x1="-30" y1="6" x2="30" y2="6" stroke={OUT} strokeWidth="3" /></g>;
      case 'zip': return <g transform={`translate(0 ${my + 6})`}><line x1="-40" y1="0" x2="40" y2="0" {...St} strokeWidth="9" />{[-30, -15, 0, 15, 30].map((k) => <line key={k} x1={k} y1="-8" x2={k} y2="8" stroke={OUT} strokeWidth="5" />)}</g>;
      case 'tongue': return <g transform={`translate(0 ${my})`}><path d="M-30 -2 Q0 36 30 -2 Z" fill="#7a1f2e" {...St} strokeWidth="6" /><ellipse cx="0" cy="22" rx="14" ry="16" fill="#ff7b8a" {...St} strokeWidth="4" /></g>;
      case 'flat': return <line x1="-22" y1={my + 6} x2="22" y2={my + 6} {...St} strokeWidth="8" />;
      default: return <path d={`M-30 ${my - 2} Q0 ${my + 36} 30 ${my - 2}`} fill="none" {...St} strokeWidth="8" />;
    }
  };
  const hairBack = () => {
    if (style === 'long') return <path d="M-105 -270 Q-120 -190 -96 -110 L-60 -120 L-60 -250 L60 -250 L60 -120 L96 -110 Q120 -190 105 -270 Q100 -400 0 -400 Q-100 -400 -105 -270Z" fill={hair} {...St} />;
    if (style === 'bun' || style === 'gran') return <circle cx="0" cy="-402" r="42" fill={hair} {...St} />;
    return null;
  };
  const hairFront = () => {
    switch (style) {
      case 'bald': return null;
      case 'cap': return <g><path d="M-98 -310 Q-96 -400 0 -402 Q96 -400 98 -310 Q40 -338 -98 -310Z" fill={hair} {...St} /><path d="M40 -330 Q130 -330 140 -300 Q80 -310 40 -312Z" fill={hair} {...St} /></g>;
      case 'hat': return <g><rect x="-120" y="-380" width="240" height="26" rx="10" fill="#222" {...St} /><rect x="-70" y="-500" width="140" height="130" rx="10" fill="#222" {...St} /><rect x="-70" y="-405" width="140" height="26" fill="#d9482b" stroke={OUT} strokeWidth="5" /></g>;
      case 'curl': return <g fill={hair} {...St}>{[-70, -35, 0, 35, 70].map((k, i) => <circle key={k} cx={k} cy={-372 + Math.abs(k) * 0.28 + (i % 2) * -8} r="36" />)}</g>;
      case 'kid': return <path d="M-98 -300 Q-100 -402 0 -402 Q100 -402 98 -300 Q70 -350 20 -346 Q-30 -338 -48 -326 Q-70 -332 -98 -300Z" fill={hair} {...St} />;
      case 'gran': return <path d="M-100 -300 Q-96 -396 0 -396 Q96 -396 100 -300 Q60 -352 0 -350 Q-60 -352 -100 -300Z" fill={hair} {...St} />;
      default: return <path d="M-100 -296 Q-104 -396 0 -398 Q104 -396 100 -296 Q70 -356 0 -350 Q-70 -356 -100 -296Z" fill={hair} {...St} />;
    }
  };
  const beard = style === 'beard' ? <path d="M-92 -262 Q-96 -170 0 -170 Q96 -170 92 -262 Q50 -226 0 -228 Q-50 -226 -92 -262Z" fill={hair} {...St} /> : null;
  const glasses = style === 'gran' ? <g fill="none" stroke={OUT} strokeWidth="6"><circle cx="-36" cy={eyeY} r="34" /><circle cx="36" cy={eyeY} r="34" /><line x1="-2" y1={eyeY} x2="2" y2={eyeY} /></g> : null;
  const legL = Math.sin(wk) * 14, legR = -Math.sin(wk) * 14;
  return (
    <g transform={`translate(${x} ${y + bobY}) rotate(${tilt}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      <ellipse cx="0" cy="0" rx="110" ry="14" fill="#000" opacity="0.18" />
      <g>
        <rect x="-62" y={-76} width="46" height="72" rx="16" fill={pants} {...St} transform={`translate(${legL} 0)`} />
        <rect x="16" y={-76} width="46" height="72" rx="16" fill={pants} {...St} transform={`translate(${legR} 0)`} />
        <ellipse cx={-40 + legL} cy="-2" rx="36" ry="16" fill="#f4f1ea" {...St} />
        <ellipse cx={40 + legR} cy="-2" rx="36" ry="16" fill="#f4f1ea" {...St} />
      </g>
      <Arm sg={-1} a={al} shirt={shirt} skin={skin} hold={holdL} />
      <rect x="-78" y="-198" width="156" height="140" rx="46" fill={shirt} {...St} />
      <rect x="-30" y="-198" width="60" height="22" rx="10" fill="#fff" opacity="0.18" />
      <Arm sg={1} a={ar} shirt={shirt} skin={skin} hold={holdR} />
      <g transform={`rotate(${headTilt} 0 -200)`}>
        {hairBack()}
        <circle cx="0" cy="-290" r="98" fill={skin} {...St} />
        <circle cx="-98" cy="-282" r="18" fill={skin} {...St} /><circle cx="98" cy="-282" r="18" fill={skin} {...St} />
        {blush !== false && <><ellipse cx="-62" cy="-246" rx="20" ry="11" fill="#ff7a7a" opacity="0.35" /><ellipse cx="62" cy="-246" rx="20" ry="11" fill="#ff7a7a" opacity="0.35" /></>}
        {beard}
        {hairFront()}
        {eye(-1)}{eye(1)}{brows(-1)}{brows(1)}
        {mouthEl()}
        {glasses}
        {extra}
      </g>
    </g>
  );
};

// ───────── монстр-«Столоед» ─────────
export const Monster: React.FC<{x: number; y: number; s?: number; t: number; mouth?: number; eyes?: 'sleep' | 'open' | 'angry' | 'cry' | 'happy' | 'hungry'; napkin?: boolean; zzz?: boolean; stomp?: number}> = ({x, y, s = 1, t, mouth = 0, eyes = 'open', napkin = true, zzz, stomp = 0}) => {
  const br = Math.sin(t * (eyes === 'sleep' ? 2 : 5)) * (eyes === 'sleep' ? 10 : 5);
  const my = 60 + mouth * 110;
  return (
    <g transform={`translate(${x} ${y + stomp * Math.abs(Math.sin(t * 7)) * -16}) scale(${s})`}>
      <ellipse cx="0" cy="0" rx="380" ry="40" fill="#000" opacity="0.2" />
      <g transform={`scale(1 ${1 + br / 600})`}>
        <path d="M-330 0 Q-370 -380 -260 -620 Q-120 -820 0 -820 Q120 -820 260 -620 Q370 -380 330 0 Z" fill="#8a5cf0" {...St} strokeWidth="10" />
        <path d="M-210 -40 Q-250 -300 -150 -480 Q0 -560 150 -480 Q250 -300 210 -40Z" fill="#b497ff" opacity="0.85" />
        {[-190, -70, 70, 190].map((k, i) => <circle key={k} cx={k} cy={-250 + (i % 2) * 90} r="22" fill="#7448d8" opacity="0.7" />)}
        {/* рожки */}
        <path d="M-200 -780 L-250 -900 L-130 -810Z" fill="#ffe8a8" {...St} /><path d="M200 -780 L250 -900 L130 -810Z" fill="#ffe8a8" {...St} />
        {/* глаза */}
        {[-1, 1].map((sg) => (
          <g key={sg} transform={`translate(${sg * 100} -640)`}>
            {eyes === 'sleep' ? <path d="M-46 0 Q0 30 46 0" fill="none" {...St} strokeWidth="10" /> : eyes === 'happy' ? <path d="M-46 10 Q0 -34 46 10" fill="none" {...St} strokeWidth="10" /> : (
              <g><circle r="60" fill="#fff0a0" {...St} strokeWidth="8" /><circle cx={eyes === 'hungry' ? 0 : sg * -6} cy={eyes === 'hungry' ? 18 : 4} r="24" fill={OUT} /><circle cx="8" cy="-4" r="7" fill="#fff" />
                {eyes === 'angry' && <line x1={-sg * 60} y1="-76" x2={sg * 60} y2="-40" {...St} strokeWidth="14" />}
                {eyes === 'cry' && <g><path d="M-30 50 q-12 60 0 110 q18 -50 0 -110" fill="#7fd4ff" opacity="0.8" /><path d="M30 50 q12 60 0 110 q-18 -50 0 -110" fill="#7fd4ff" opacity="0.8" /></g>}
              </g>)}
          </g>
        ))}
        {eyes === 'cry' && [-1, 1].map((sg) => <ellipse key={sg} cx={sg * 100} cy={-520 + ((t * 300) % 200)} rx="12" ry="20" fill="#7fd4ff" opacity="0.8" />)}
        {/* пасть */}
        <g transform={`translate(0 ${-450})`}>
          <path d={`M-170 0 Q0 ${my + 40} 170 0 Q0 ${-30 + (mouth > 0.3 ? 0 : 20)} -170 0Z`} fill="#4a0f2e" {...St} strokeWidth="9" />
          <path d={`M-110 ${my * 0.45} Q0 ${my * 0.95} 110 ${my * 0.45} Q0 ${my * 0.3} -110 ${my * 0.45}Z`} fill="#ff7b9a" opacity={mouth > 0.2 ? 1 : 0} />
          {[-120, -70, -20, 30, 80, 125].map((k, i) => <path key={k} d={`M${k} ${i % 2 ? 4 : 0} l16 ${24 + mouth * 14} l16 ${-24 - mouth * 14}Z`} fill="#fff" stroke={OUT} strokeWidth="4" />)}
          {mouth < 0.12 && eyes !== 'sleep' && <path d="M-110 28 Q0 60 110 28" fill="none" stroke={OUT} strokeWidth="9" strokeLinecap="round" />}
        </g>
        {/* салфетка */}
        {napkin && (
          <g>
            <path d="M-140 -330 L140 -330 L96 -190 Q0 -150 -96 -190Z" fill="#fff" {...St} strokeWidth="9" />
            {[-80, -27, 27, 80].map((k, i) => <line key={i} x1={k} y1="-322" x2={k * 0.7} y2="-176" stroke="#e24a4a" strokeWidth="9" opacity="0.8" />)}
            <line x1="-130" y1="-262" x2="130" y2="-262" stroke="#e24a4a" strokeWidth="9" opacity="0.8" />
          </g>
        )}
        {/* ручки */}
        <path d="M-300 -330 Q-390 -230 -350 -120" fill="none" stroke={OUT} strokeWidth="64" strokeLinecap="round" /><path d="M-300 -330 Q-390 -230 -350 -120" fill="none" stroke="#8a5cf0" strokeWidth="50" strokeLinecap="round" />
        <path d="M300 -330 Q390 -230 350 -120" fill="none" stroke={OUT} strokeWidth="64" strokeLinecap="round" /><path d="M300 -330 Q390 -230 350 -120" fill="none" stroke="#8a5cf0" strokeWidth="50" strokeLinecap="round" />
        {/* вилка и нож */}
        <g transform="translate(-352 -120) rotate(-10)"><rect x="-8" y="-200" width="16" height="170" fill="#d9d9e6" {...St} strokeWidth="5" />{[-20, -7, 7, 20].map((k) => <rect key={k} x={k - 3} y="-290" width="6" height="96" fill="#d9d9e6" stroke={OUT} strokeWidth="4" />)}</g>
        <g transform="translate(352 -120) rotate(10)"><rect x="-8" y="-200" width="16" height="170" fill="#d9d9e6" {...St} strokeWidth="5" /><path d="M-8 -200 Q50 -240 8 -330 L-8 -330Z" fill="#d9d9e6" {...St} strokeWidth="5" /></g>
      </g>
      {/* ножки */}
      <ellipse cx="-150" cy="-6" rx="110" ry="40" fill="#6b43d0" {...St} /><ellipse cx="150" cy="-6" rx="110" ry="40" fill="#6b43d0" {...St} />
      {zzz && [0, 1, 2].map((i) => <text key={i} x={230 + i * 60 + Math.sin(t * 2 + i) * 10} y={-760 - i * 90 - ((t * 40) % 40)} fontFamily={FONT} fontSize={70 + i * 24} fill="#fff" stroke={OUT} strokeWidth="9" paintOrder="stroke" opacity={0.95 - i * 0.18}>Z</text>)}
    </g>
  );
};

// ───────── предметы ─────────
export const Table: React.FC<{x: number; y: number; w?: number; plates?: number; food?: 'none' | 'soup' | 'pasta' | 'cake' | 'steam'; t?: number; color?: string; scale?: number}> = ({x, y, w = 560, plates = 2, food = 'none', t = 0, color = '#c98a4b', scale = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-w / 2 + 30} y="30" width="30" height="190" fill="#9a6733" {...St} /><rect x={w / 2 - 60} y="30" width="30" height="190" fill="#9a6733" {...St} />
    <rect x={-w / 2} y="-20" width={w} height="60" rx="14" fill={color} {...St} />
    <rect x={-w / 2 + 12} y="-12" width={w - 24} height="12" rx="6" fill="#fff" opacity="0.25" />
    {Array.from({length: plates}).map((_, i) => {
      const px = plates === 1 ? 0 : -w / 2 + 90 + (i * (w - 180)) / (plates - 1);
      return (
        <g key={i} transform={`translate(${px} -24)`}>
          <ellipse cx="0" cy="0" rx="62" ry="16" fill="#fff" {...St} strokeWidth="5" /><ellipse cx="0" cy="-2" rx="40" ry="9" fill="#e9e9f4" />
          {food === 'soup' && <g><ellipse cx="0" cy="-6" rx="46" ry="10" fill="#ff9a3a" stroke={OUT} strokeWidth="4" />{[0, 1, 2].map((k) => <circle key={k} cx={-14 + k * 14} cy={-30 - ((t * 30 + k * 13) % 36)} r="7" fill="#fff" opacity="0.6" />)}</g>}
          {food === 'pasta' && <g><path d="M-44 -4 Q-30 -54 0 -50 Q30 -54 44 -4Z" fill="#ffd45a" {...St} strokeWidth="5" /><circle cx="0" cy="-52" r="12" fill="#e24a4a" {...St} strokeWidth="4" /></g>}
          {food === 'cake' && <g><rect x="-34" y="-50" width="68" height="46" rx="8" fill="#ff8fb8" {...St} strokeWidth="5" /><rect x="-34" y="-50" width="68" height="14" rx="7" fill="#fff" stroke={OUT} strokeWidth="4" /><rect x="-4" y="-76" width="8" height="26" fill="#ffe14d" stroke={OUT} strokeWidth="3" /></g>}
          {food === 'none' && <g><line x1="-84" y1="-8" x2="-84" y2="14" stroke={OUT} strokeWidth="6" /><line x1="84" y1="-8" x2="84" y2="14" stroke={OUT} strokeWidth="6" /></g>}
        </g>
      );
    })}
  </g>
);

export const Timer: React.FC<{x: number; y: number; s?: number; text: string; pulse?: number; color?: string; t?: number; ring?: boolean}> = ({x, y, s = 1, text, pulse = 0, color = '#ff4a3a', t = 0, ring}) => (
  <g transform={`translate(${x} ${y}) scale(${s * (1 + pulse * 0.12)}) rotate(${ring ? Math.sin(t * 60) * 5 : 0})`}>
    <rect x="-180" y="-110" width="360" height="220" rx="34" fill="#eadfcf" {...St} strokeWidth="9" />
    <rect x="-150" y="-80" width="300" height="110" rx="14" fill="#1a2a24" {...St} strokeWidth="6" />
    <text x="0" y="3" textAnchor="middle" fontFamily={FONT} fontSize={text.length > 5 ? Math.round(84 * 5.2 / text.length) : 84} fill={color} style={{filter: `drop-shadow(0 0 12px ${color})`}}>{text}</text>
    <circle cx="-90" cy="72" r="18" fill="#ff7b3a" {...St} strokeWidth="5" /><circle cx="-30" cy="72" r="18" fill="#ffd13a" {...St} strokeWidth="5" /><circle cx="30" cy="72" r="18" fill="#7be07b" {...St} strokeWidth="5" />
    <rect x="70" y="58" width="70" height="28" rx="14" fill="#fff" {...St} strokeWidth="5" />
    <circle cx="-110" cy="-126" r="20" fill="#d9482b" {...St} strokeWidth="6" /><circle cx="110" cy="-126" r="20" fill="#d9482b" {...St} strokeWidth="6" />
  </g>
);

export const Bell: React.FC<{x: number; y: number; s?: number; swing?: number}> = ({x, y, s = 1, swing = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${swing})`}>
    <rect x="-8" y="-200" width="16" height="60" fill="#9a6733" {...St} strokeWidth="5" />
    <path d="M-110 20 Q-100 -130 0 -140 Q100 -130 110 20 Z" fill="#ffcf3a" {...St} strokeWidth="8" />
    <rect x="-126" y="14" width="252" height="26" rx="13" fill="#ffb41f" {...St} strokeWidth="7" />
    <circle cx="0" cy={54 + swing * 0.4} r="20" fill="#8a5a2b" {...St} strokeWidth="6" />
    <path d="M-60 -70 Q-56 -100 -30 -110" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" opacity="0.7" />
  </g>
);

export const Mic: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s}) rotate(-20)`}><rect x="-12" y="-10" width="24" height="120" rx="12" fill="#444" {...St} strokeWidth="5" /><circle cx="0" cy="-34" r="44" fill="#9aa0b4" {...St} strokeWidth="6" />{[-1, 0, 1].map((k) => <line key={k} x1={-30} x2={30} y1={-34 + k * 18} y2={-34 + k * 18} stroke={OUT} strokeWidth="3" opacity="0.5" />)}</g>
);
export const Corn: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s}) rotate(-30)`}><path d="M0 -84 Q40 -40 28 60 Q0 84 -28 60 Q-40 -40 0 -84Z" fill="#ffd13a" {...St} strokeWidth="6" />{[-12, 0, 12].map((k) => <line key={k} x1={k} y1="-60" x2={k} y2="56" stroke="#d99b00" strokeWidth="4" />)}<path d="M-30 20 Q-60 -30 -10 60 Z" fill="#5ac26a" {...St} strokeWidth="5" /><path d="M30 20 Q60 -30 10 60Z" fill="#5ac26a" {...St} strokeWidth="5" /></g>
);
export const Cucumber: React.FC<{s?: number; bite?: boolean}> = ({s = 1, bite}) => (
  <g transform={`scale(${s}) rotate(-20)`}><rect x="-22" y="-80" width="44" height={bite ? 90 : 150} rx="22" fill="#52b85a" {...St} strokeWidth="6" />{[0, 1, 2, 3].map((k) => <circle key={k} cx={k % 2 ? -8 : 8} cy={-50 + k * 26} r="3" fill="#2d7a35" />)}</g>
);

// Электромобиль
export const Car: React.FC<{x: number; y: number; s?: number; t: number; hood?: boolean}> = ({x, y, s = 1, t, hood}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="40" rx="300" ry="26" fill="#000" opacity="0.2" />
    <path d="M-290 0 Q-290 -90 -200 -100 L-110 -190 Q-90 -210 -50 -210 L120 -210 Q160 -210 190 -170 L230 -100 Q290 -92 290 0 Z" fill="#32c4a1" {...St} strokeWidth="9" />
    <path d="M-100 -176 L-60 -196 L-10 -196 L-10 -110 L-150 -110Z" fill="#cdeeff" {...St} strokeWidth="6" /><path d="M20 -196 L120 -196 Q146 -190 160 -160 L190 -110 L20 -110Z" fill="#cdeeff" {...St} strokeWidth="6" />
    {hood && <path d="M-290 -10 L-190 -150 L-120 -110 L-120 -30Z" fill="#259c80" {...St} strokeWidth="7" />}
    {[-170, 170].map((k) => <g key={k} transform={`translate(${k} 10)`}><circle r="62" fill="#2b2b3d" {...St} strokeWidth="9" /><circle r="26" fill="#cfd3e6" stroke={OUT} strokeWidth="5" /><g transform={`rotate(${t * 40})`}><line x1="-26" x2="26" stroke={OUT} strokeWidth="4" /><line y1="-26" y2="26" stroke={OUT} strokeWidth="4" /></g></g>)}
    <g transform="translate(40 -120)"><path d="M-10 -22 L8 -22 L-4 -2 L10 -2 L-8 28 L-2 6 L-14 6Z" fill="#ffe14d" stroke={OUT} strokeWidth="4" /></g>
  </g>
);

export const Cake: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`}><ellipse cx="0" cy="10" rx="90" ry="20" fill="#fff" {...St} strokeWidth="6" /><rect x="-70" y="-60" width="140" height="70" rx="14" fill="#ff8fb8" {...St} strokeWidth="7" /><path d="M-70 -40 q18 24 35 0 q18 24 35 0 q18 24 35 0 q18 24 35 0" fill="#fff" stroke={OUT} strokeWidth="5" /><rect x="-6" y="-96" width="12" height="36" fill="#ffe14d" {...St} strokeWidth="4" /><ellipse cx="0" cy="-104" rx="9" ry="14" fill="#ff7b3a" /></g>
);

export const Spaghetti: React.FC<{s?: number; t?: number}> = ({s = 1, t = 0}) => (
  <g transform={`scale(${s})`}>
    <ellipse cx="0" cy="0" rx="150" ry="36" fill="#fff" {...St} strokeWidth="7" />
    <path d="M-110 -6 Q-80 -110 0 -112 Q80 -110 110 -6 Q0 20 -110 -6Z" fill="#ffd45a" {...St} strokeWidth="7" />
    {[-60, -20, 25, 62].map((k, i) => <path key={k} d={`M${k - 26} -20 Q${k} ${-86 + i * 6} ${k + 26} -14`} fill="none" stroke="#e8b02e" strokeWidth="6" strokeLinecap="round" />)}
    <circle cx="-30" cy="-100" r="22" fill="#e24a4a" {...St} strokeWidth="5" /><circle cx="26" cy="-92" r="20" fill="#e24a4a" {...St} strokeWidth="5" />
    {[0, 1].map((i) => <path key={i} d={`M${-30 + i * 60} -130 q-14 -30 0 -60 q14 -30 0 -60`} fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" opacity={0.5 + 0.3 * Math.sin(t * 6 + i)} />)}
  </g>
);

// ───────── звёзды, взрывы, текст ─────────
export const Burst: React.FC<{x: number; y: number; r: number; color?: string; spikes?: number; rot?: number}> = ({x, y, r, color = '#ffe14d', spikes = 14, rot = 0}) => {
  const pts = Array.from({length: spikes * 2}).map((_, i) => { const a = (i / (spikes * 2)) * Math.PI * 2; const rr = i % 2 ? r * 0.72 : r; return `${Math.cos(a) * rr},${Math.sin(a) * rr}`; }).join(' ');
  return <polygon points={pts} transform={`translate(${x} ${y}) rotate(${rot})`} fill={color} {...St} strokeWidth="8" />;
};
export const Pill: React.FC<{x: number; y: number; text: string; size?: number; bg?: string; fg?: string; rot?: number; scale?: number}> = ({x, y, text, size = 64, bg = '#ffe14d', fg = OUT, rot = 0, scale = 1}) => {
  const w = text.length * size * 0.78 + 70;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      <rect x={-w / 2} y={-size * 0.82} width={w} height={size * 1.64} rx={size * 0.5} fill={OUT} transform="translate(0 10)" />
      <rect x={-w / 2} y={-size * 0.82} width={w} height={size * 1.64} rx={size * 0.5} fill={bg} {...St} strokeWidth="7" />
      <text textAnchor="middle" y={size * 0.34} fontFamily={FONT} fontSize={size} fill={fg}>{text}</text>
    </g>
  );
};
export const BigText: React.FC<{x: number; y: number; text: string; size?: number; fill?: string; rot?: number; scale?: number; stroke?: number}> = ({x, y, text, size = 150, fill = '#fff', rot = 0, scale = 1, stroke = 22}) => (
  <text x={x} y={y} textAnchor="middle" transform={`rotate(${rot} ${x} ${y}) translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y})`} fontFamily={FONT} fontSize={size} fill={fill} stroke={OUT} strokeWidth={stroke} paintOrder="stroke" strokeLinejoin="round">{text}</text>
);
export const Bubble: React.FC<{x: number; y: number; text: string; size?: number; scale?: number; rot?: number; fg?: string; bg?: string; tail?: number}> = ({x, y, text, size = 64, scale = 1, rot = 0, fg = OUT, bg = '#fff', tail = -1}) => {
  const lines = text.split('\n');
  const w = Math.max(...lines.map((l) => l.length)) * size * 0.64 + 80, h = lines.length * size * 1.15 + 50;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      <path d={`M${tail * w * 0.25} ${h / 2 - 4} L${tail * w * 0.42} ${h / 2 + 70} L${tail * w * 0.08} ${h / 2 - 4}Z`} fill={bg} {...St} strokeWidth="8" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="44" fill={bg} {...St} strokeWidth="8" />
      <rect x={tail * w * 0.1} y={h / 2 - 10} width={w * 0.18} height="14" fill={bg} transform={`translate(${tail > 0 ? 0 : -w * 0.16} 0)`} />
      {lines.map((l, i) => <text key={i} textAnchor="middle" y={-h / 2 + 24 + size * 0.88 + i * size * 1.15} fontFamily={FONT} fontSize={size} fill={fg}>{l}</text>)}
    </g>
  );
};
export const Sparkle: React.FC<{x: number; y: number; r: number; t: number; seed?: number; color?: string}> = ({x, y, r, t, seed = 0, color = '#fff'}) => {
  const k = 0.6 + 0.4 * Math.sin(t * 8 + seed * 3);
  return <path d={`M0 ${-r * k} Q0 0 ${r * k} 0 Q0 0 0 ${r * k} Q0 0 ${-r * k} 0 Q0 0 0 ${-r * k}Z`} transform={`translate(${x} ${y}) rotate(${t * 40})`} fill={color} stroke={OUT} strokeWidth="3" />;
};
export const Heart: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = '#ff4a6a'}) => (
  <path d="M0 40 C-80 -10 -50 -70 0 -30 C50 -70 80 -10 0 40Z" transform={`translate(${x} ${y}) scale(${s})`} fill={color} {...St} strokeWidth="7" />
);
export const Speed: React.FC<{t: number; color?: string; n?: number; op?: number}> = ({t, color = '#fff', n = 26, op = 0.3}) => (
  <g opacity={op}>{Array.from({length: n}).map((_, i) => { const a = (i / n) * Math.PI * 2 + rnd(i) * 0.2; const r0 = 360 + rnd(i + 9) * 120 + ((t * 900 + i * 37) % 160); return <line key={i} x1={540 + Math.cos(a) * r0} y1={960 + Math.sin(a) * r0 * 1.5} x2={540 + Math.cos(a) * (r0 + 380)} y2={960 + Math.sin(a) * (r0 + 380) * 1.5} stroke={color} strokeWidth={6 + rnd(i + 4) * 8} strokeLinecap="round" />; })}</g>
);

// ───────── фоны ─────────
export const Sky: React.FC<{c1?: string; c2?: string}> = ({c1 = '#7fd0ff', c2 = '#e9f8ff'}) => (
  <g><defs><linearGradient id="sky3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} /></linearGradient></defs><rect width="1080" height="1920" fill="url(#sky3)" /></g>
);
export const Buildings: React.FC<{y: number; seed?: number; scale?: number; colors?: string[]; px?: number; lights?: boolean; t?: number; x?: number}> = ({y, seed = 1, scale = 1, colors = ['#f2a65a', '#e76f51', '#6c9bd2', '#9b7fe0', '#4fb89a'], x = 0, lights, t = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {Array.from({length: 9}).map((_, i) => {
      const w = 150 + rnd(seed + i) * 90, h = 260 + rnd(seed + i * 3) * 380, bx = -60 + i * 140;
      return (
        <g key={i}>
          <rect x={bx} y={-h} width={w} height={h} fill={colors[i % colors.length]} {...St} strokeWidth="8" />
          <rect x={bx} y={-h} width={w} height="26" fill="#000" opacity="0.15" />
          {Array.from({length: Math.floor(h / 90)}).map((_, r) => Array.from({length: 2}).map((_, c) => <rect key={r * 2 + c} x={bx + 24 + c * (w / 2 - 14)} y={-h + 56 + r * 80} width="44" height="48" rx="6" fill={lights && rnd(i * 7 + r + c) > 0.45 ? '#ffe9a0' : '#cdeeff'} stroke={OUT} strokeWidth="5" />))}
        </g>
      );
    })}
  </g>
);
export const Floor: React.FC<{y: number; c1?: string; c2?: string; h?: number}> = ({y, c1 = '#7a5a43', c2 = '#8b6a50', h = 900}) => (
  <g><rect x="0" y={y} width="1080" height={h} fill={c1} />{Array.from({length: 14}).map((_, i) => <rect key={i} x={(i % 2) * 0} y={y + i * 70} width="1080" height="70" fill={i % 2 ? c2 : c1} opacity="0.5" />)}<line x1="0" x2="1080" y1={y} y2={y} stroke={OUT} strokeWidth="8" /></g>
);
export const KitchenBG: React.FC<{t?: number; dark?: number}> = ({t = 0, dark = 0}) => (
  <g>
    <rect width="1080" height="1920" fill="#ffd9a8" />
    {Array.from({length: 12}).map((_, i) => <rect key={i} x={i * 100 - 20} y="0" width="50" height="1100" fill="#ffc98a" opacity="0.5" />)}
    <rect x="620" y="200" width="320" height="360" rx="20" fill="#9ad8ff" {...St} strokeWidth="9" /><line x1="780" y1="200" x2="780" y2="560" stroke={OUT} strokeWidth="8" /><line x1="620" y1="380" x2="940" y2="380" stroke={OUT} strokeWidth="8" />
    <circle cx="700" cy="300" r="34" fill="#fff" opacity="0.8" />
    <rect x="80" y="280" width="260" height="30" rx="8" fill="#b97b42" {...St} strokeWidth="6" />
    {[0, 1, 2].map((i) => <rect key={i} x={110 + i * 76} y="226" width="50" height="54" rx="8" fill={['#e24a4a', '#52b85a', '#ffd13a'][i]} {...St} strokeWidth="5" />)}
    <g transform="translate(200 120)"><circle r="64" fill="#fff" {...St} strokeWidth="8" /><line x1="0" y1="0" x2="0" y2="-40" stroke={OUT} strokeWidth="7" strokeLinecap="round" /><line x1="0" y1="0" x2="30" y2="14" stroke={OUT} strokeWidth="7" strokeLinecap="round" transform={`rotate(${t * 20} 0 0)`} /></g>
    <Floor y="1180" c1="#c68b5a" c2="#d49a68" />
    {dark > 0 && <rect width="1080" height="1920" fill="#06061a" opacity={dark} />}
  </g>
);
export const Crowd: React.FC<{x: number; y: number; cols: number; rows: number; gap?: number; s?: number; t: number; seed?: number; run?: boolean; mouth?: boolean}> = ({x, y, cols, rows, gap = 70, s = 1, t, seed = 0, run, mouth}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({length: rows}).map((_, r) => Array.from({length: cols}).map((_, c) => {
      const k = seed + r * 31 + c * 7;
      const jump = Math.abs(Math.sin(t * (run ? 14 : 6) + k)) * (run ? 18 : 10);
      const colr = ['#ff8a3d', '#ff5a7a', '#59c3ff', '#7be07b', '#ffd13a', '#b48cff'][Math.floor(rnd(k) * 6)];
      const skin = ['#ffd0a6', '#e8a878', '#c98a5c', '#fbe0c8'][Math.floor(rnd(k + 2) * 4)];
      const px = (c - (cols - 1) / 2) * gap + (rnd(k + 5) - 0.5) * 16, py = r * gap * 0.62 - jump;
      return (
        <g key={`${r}-${c}`} transform={`translate(${px} ${py})`}>
          <rect x="-20" y="14" width="40" height="42" rx="14" fill={colr} stroke={OUT} strokeWidth="4" />
          <circle cx="0" cy="-8" r="26" fill={skin} stroke={OUT} strokeWidth="4" />
          <circle cx="-9" cy="-10" r="4" fill={OUT} /><circle cx="9" cy="-10" r="4" fill={OUT} />
          {mouth ? <ellipse cx="0" cy="6" rx="8" ry={5 + 5 * Math.abs(Math.sin(t * 10 + k))} fill="#7a1f2e" stroke={OUT} strokeWidth="2.5" /> : <path d="M-8 4 Q0 12 8 4" fill="none" stroke={OUT} strokeWidth="3" />}
          <path d={`M-24 -14 Q0 -${46 + rnd(k + 8) * 6} 24 -14`} fill={['#3a2414', '#222', '#c87a2a', '#6b3a1a'][Math.floor(rnd(k + 3) * 4)]} stroke={OUT} strokeWidth="4" />
        </g>
      );
    }))}
  </g>
);
export const Bunting: React.FC<{y: number; t: number}> = ({y, t}) => (
  <g>
    <path d={`M-20 ${y} Q540 ${y + 120} 1100 ${y}`} fill="none" stroke={OUT} strokeWidth="7" />
    {Array.from({length: 11}).map((_, i) => { const x = 20 + i * 100; const yy = y + 116 * Math.sin((i / 10) * Math.PI) * 0.98; return <path key={i} d={`M${x - 30} ${yy} L${x + 30} ${yy} L${x} ${yy + 70 + Math.sin(t * 4 + i) * 6}Z`} fill={['#ff5a7a', '#ffd13a', '#59c3ff', '#7be07b'][i % 4]} {...St} strokeWidth="5" />; })}
  </g>
);
export const Grain: React.FC<{t: number}> = ({t}) => (
  <g pointerEvents="none"><rect width="1080" height="1920" fill="url(#vgn3)" /></g>
);
export const Zzz: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => (
  <g>{[0, 1, 2].map((i) => <text key={i} x={x + i * 46 + Math.sin(t * 2 + i) * 8} y={y - i * 70 - ((t * 36 + i * 30) % 60)} fontFamily={FONT} fontSize={60 + i * 20} fill="#fff" stroke={OUT} strokeWidth="8" paintOrder="stroke" opacity={1 - i * 0.2}>Z</text>)}</g>
);
