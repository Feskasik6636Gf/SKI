import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Atmosphere} from './Details';
import {Bunny, Cup, Defs, GirlBack, GirlFace, GirlShoulders, HandUp, INK, Key, MomFront, P, Waves, mod, rnd} from './Chars';
import {BathDoor, Hall, Kitchen} from './Sets';
import {ACC, Banner, Cam, FONT_FAMILY as fontFamily, HUD, RuleCard, Subs, Tag, Vig, buildChunks} from './Story';
import type {CamCfg, W} from './Story';
import {Bubble, SplitMoms, pop} from './Story2';
import words3 from './words3.json';

export const FPS3 = 30;
export const DURATION3 = 88.9;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CH3 = buildChunks(words3 as W[]);

type Ctx = {t: number; lt: number; d: number};
type Shot = {a: number; b: number; loc: string; hud?: boolean; sub?: number; nobanner?: boolean; cam?: CamCfg; vig?: number; render: (c: Ctx) => React.ReactNode};

const Bg: React.FC<{c?: string}> = ({c = '#16222b'}) => (<g><rect width="1080" height="1920" fill={c} /><rect width="1080" height="1920" fill="url(#tileDark)" opacity="0.3" /></g>);

// героиня + её копия рядом
const TwoGirls: React.FC<{t: number; sx?: number; y?: number; lt?: number; stepBack?: number; tilt?: boolean}> = ({t, sx = 0.5, y = 900, stepBack = 0}) => (
  <g>
    {[0, 1].map((i) => {
      const bl = mod(t - (i ? 0.12 : 0), 3) > 2.9 ? 1 : 0;
      const gl = i && Math.sin(t * 31) > 0.96 ? 8 : 0;
      return (
        <g key={i} transform={`translate(${i ? 790 + gl : 290} ${y}) scale(${sx * (1 - stepBack * 0.15)})`} filter={i ? 'url(#cyanTint)' : undefined}>
          <GirlShoulders /><GirlFace lookX={Math.sin(t * 1.4 - (i ? 0.2 : 0)) * 10} mouth="worry" brow={8} blink={bl} />
        </g>
      );
    })}
  </g>
);

// Дверь (прихожая) открывается: за ней — лестничная клетка
const Doorway: React.FC<{t: number; open: number; mom?: {s?: number; y?: number; x?: number; tear?: number; talk?: number}; dim?: number}> = ({t, open, mom, dim = 0.55}) => {
  const w = 480 * (1 - open) + 26;
  return (
    <g>
      <Hall t={t} lamp={dim} />
      {open > 0 && (<g>
        <clipPath id="dw"><rect x="300" y="190" width="480" height="970" /></clipPath>
        <g clipPath="url(#dw)">
          <rect x="300" y="190" width="480" height="970" fill="#0a1117" />
          <ellipse cx="540" cy="200" rx="260" ry="200" fill="url(#coldGlow)" opacity="0.55" />
          <rect x="300" y="1000" width="480" height="160" fill="#0f1a20" />
          {Array.from({length: 5}).map((_, i) => <rect key={i} x="300" y={1010 + i * 34} width="480" height="6" fill="#1c2e38" opacity="0.8" />)}
          <path d="M320 600 L 780 380" stroke="#2a3a44" strokeWidth="10" /><path d="M320 700 L 780 480" stroke="#2a3a44" strokeWidth="6" />
          {mom && (<g transform={`translate(${540 + (mom.x ?? 0)} ${mom.y ?? 520}) scale(${mom.s ?? 0.5})`} opacity={Math.min(1, open * 2)}><MomFront t={t} tear={mom.tear} talk={mom.talk} blink={mod(t, 3.2) > 3.1 ? 1 : 0} /></g>)}
          <polygon points="300,1160 780,1160 780,1010 300,1010" fill="url(#coldGlow)" opacity="0.2" />
        </g>
        <polygon points={`300,190 ${300 + w},${190 + 40 * open} ${300 + w},${1160 - 40 * open} 300,1160`} fill="#4a3528" stroke="#120c09" strokeWidth="8" />
        {open < 0.95 && <polygon points={`${326},${240} ${300 + w - 26},${260 + 40 * open} ${300 + w - 26},${620} ${326},${600}`} fill="#573e2f" opacity={1 - open} />}
        <polygon points="780,1160 940,1330 150,1330 300,1160" fill="#cfe9b0" opacity={0.08 * open} />
      </g>)}
    </g>
  );
};

const Clock: React.FC<{x: number; y: number; txt: string; sub: string; color?: string; scale?: number}> = ({x, y, txt, sub, color = ACC, scale = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <circle r="190" fill="rgba(10,13,20,0.85)" stroke={color} strokeWidth="10" />
    <text y="26" textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="96" fill="#fff">{txt}</text>
    <text y="116" textAnchor="middle" fontFamily={fontFamily} fontWeight="800" fontSize="28" fill="#9db0cc" letterSpacing="2">{sub}</text>
  </g>
);

const SHOTS: Shot[] = [
  {a: 0, b: 2.6, loc: 'ПРИХОЖАЯ', cam: {s: [1, 1.15]}, vig: 1, render: ({t}) => <Doorway t={t} open={1} mom={{s: 0.5, y: 500}} />},
  {a: 2.6, b: 5.0, loc: 'ПРИХОЖАЯ', cam: {s: [1.05, 1]}, vig: 1, render: ({t, lt}) => (<g><Bg /><TwoGirls t={t} /><Tag x={540} y={560} text="ДВЕ ДОЧЕРИ" size={56} color="#26324a" scale={pop(lt, 0.2, 5)} rot={-3} /></g>)},
  {a: 5.0, b: 6.94, loc: 'ПРИХОЖАЯ', cam: {s: [1, 1.12]}, vig: 1, render: ({t, lt}) => (<g><Bg c="#101a22" /><g transform="translate(540 1000) scale(1.0)"><MomFront t={t} tear={0.6} talk={lt > 0.5 ? 1 : 0} /></g><Bubble x={540} y={560} text={'КАКАЯ ИЗ\nВАС МОЯ?'} size={54} scale={pop(lt, 0.3, 6)} /></g>)},
  {a: 6.94, b: 10.84, loc: 'КВАРТИРА', nobanner: true, sub: 1640, cam: {s: [1, 1.04]}, render: ({t}) => <SplitMoms t={t} bubbleAt={null} sync={0} q />},
  {a: 10.84, b: 13.1, loc: 'КВАРТИРА', nobanner: true, sub: 1640, cam: {s: [1.02, 1.06]}, render: ({t}) => <SplitMoms t={t} bubbleAt={10.9} sync={Math.min(1, Math.max(0, (t - 11.5) * 3))} />},
  {a: 13.1, b: 15.5, loc: 'ВАННАЯ', cam: {s: [1, 1.1]}, vig: 1, render: ({t, lt}) => {
    const sec = Math.round(lt * 20);
    return (<g><BathDoor t={t} lock={1} /><g transform="translate(240 1560) scale(0.55)"><GirlBack tilt={-4} /></g>
      <Tag x={820} y={470} text={`ЖДЁШЬ 0:${String(Math.min(59, sec)).padStart(2, '0')}`} size={42} color="#26324a" scale={pop(lt, 0.4, 5)} /></g>);
  }},
  {a: 15.5, b: 17.46, loc: 'ПРИХОЖАЯ', cam: {s: [1, 1.12], shake: 0.1}, vig: 1, render: ({t, lt}) => <Doorway t={t} open={Math.min(1, Math.max(0, (lt - 0.15) / 1.5))} mom={{s: 0.5, y: 500}} />},
  {a: 17.46, b: 19.7, loc: 'ПРИХОЖАЯ', cam: {s: [1.1, 1.2]}, vig: 1, render: ({t, lt}) => (<g><Doorway t={t} open={1} mom={{s: 0.52, y: 500}} /><Tag x={540} y={1240} text="НАСТОЯЩАЯ МАМА" size={44} color="#2e9a5a" scale={pop(lt, 0.7, 5)} rot={-2} /></g>)},
  {a: 19.7, b: 21.6, loc: 'ПРИХОЖАЯ', cam: {s: [1, 1.08], shake: 0.4}, vig: 1, render: ({t}) => (<g><Bg c="#101a22" /><g transform="translate(540 -380) scale(1.5)"><MomFront t={t} shake={2} keys={false} /></g></g>)},
  {a: 21.6, b: 23.08, loc: 'ПРИХОЖАЯ', cam: {s: [1, 1.08]}, vig: 1, render: ({t, lt}) => (<g><Bg c="#101a22" /><g transform="translate(900 -1000) scale(2.0)"><MomFront t={t} shake={1} /></g><Waves x={650} y={760} t={t} color={ACC} n={3} maxR={180} width={5} /><Tag x={540} y={1180} text="КЛЮЧИ ЕЁ" size={46} color="#d9a441" fg="#10141b" scale={pop(lt, 0.3, 5)} rot={-3} /></g>)},
  {a: 23.08, b: 27.1, loc: 'ПРИХОЖАЯ', cam: {s: [1, 1.14]}, vig: 1, render: ({t, lt}) => (<g><Bg c="#101a22" /><g transform="translate(540 960) scale(1.05)"><MomFront t={t} tear={0.8} talk={1} blink={mod(t, 3.4) > 3.3 ? 1 : 0} /></g>
    {t > 25.98 && <Tag x={540} y={520} text="УЖЕ ЧАС" size={64} color="#c23b3b" scale={pop(t, 25.98, 6)} rot={2} />}</g>)},
  {a: 27.1, b: 30.78, loc: 'ПРИХОЖАЯ', cam: {s: [2.2, 2.7], y: [330, 360]}, vig: 1, render: ({t}) => (<g><Hall t={t} lamp={0.5} /><g transform="translate(540 1415) scale(0.56)"><Key glow={1} t={t} /></g>
    {t > 29.3 && <g transform="translate(540 1262)"><Tag x={0} y={0} text="ЭТО НЕ Я" size={26} color="#c23b3b" rot={-3} scale={pop(t, 29.3, 6)} /></g>}</g>)},
  {a: 30.78, b: 32.42, loc: 'КУХНЯ', cam: {s: [1.3, 1], r: [10, 0], x: [90, 0]}, vig: 1, render: ({t}) => (<g><Kitchen t={t} /></g>)},
  {a: 32.42, b: 33.96, loc: 'КУХНЯ', cam: {s: [1, 1.12], y: [0, 120]}, vig: 1, render: ({t, lt}) => (<g><Kitchen t={t} /><rect width="1920" height="1920" fill="#05070c" opacity="0.25" />{lt > 0.8 && <Tag x={540} y={900} text="ПУСТО" size={80} color="#26324a" scale={pop(lt, 0.8, 5)} rot={-3} />}</g>)},
  {a: 33.96, b: 36.72, loc: 'КУХНЯ', cam: {s: [1, 1.1]}, vig: 1, render: ({t, lt}) => (<g><rect width="1920" height="1920" fill="#1b1f2b" /><rect width="1080" height="1920" fill="url(#wp)" opacity="0.5" /><ellipse cx="540" cy="900" rx="520" ry="560" fill="url(#warmGlow)" opacity="0.3" />
    <g transform="translate(540 1120) scale(2.3)"><Cup steam={0} t={t} /></g>
    {t > 35.4 && (<g transform={`translate(540 620) scale(${pop(t, 35.4, 5)})`}><rect x="-300" y="-70" width="600" height="140" rx="26" fill="rgba(10,13,20,0.85)" stroke="#9fd8ff" strokeWidth="5" /><text x="0" y="22" textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="64" fill="#fff">ЧАЙ: 18°C</text></g>)}</g>)},
  {a: 36.72, b: 39.66, loc: 'ПРИХОЖАЯ', cam: {s: [1, 1.2]}, vig: 1, render: ({t, lt}) => (<g><Hall t={t} lamp={0.45} />
    <g transform="translate(360 1560) scale(0.62)"><GirlBack tilt={Math.sin(t * 1.4) * 1.5} /></g>
    <g transform="translate(720 1560) scale(0.62)" filter="url(#cyanTint)" opacity={pop(lt, 1.2, 3)}><GirlBack tilt={Math.sin(t * 1.4) * 1.5} /></g>
    {t > 38.84 && <Tag x={720} y={760} text="ОНА" size={60} color="#c23b3b" scale={pop(t, 38.84, 6)} rot={3} />}</g>)},
  {a: 39.66, b: 43.88, loc: 'ПРИХОЖАЯ', nobanner: true, vig: 1, render: ({t, lt}) => (<g><rect width="1080" height="1920" fill="#06080c" />
    <clipPath id="c1"><rect x="40" y="380" width="1000" height="570" rx="26" /></clipPath><clipPath id="c2"><rect x="40" y="990" width="1000" height="570" rx="26" /></clipPath>
    <g clipPath="url(#c1)"><rect x="40" y="380" width="1000" height="570" fill="#16222b" /><g transform="translate(540 700) scale(0.52)"><GirlShoulders /><GirlFace mouth="worry" brow={8} lookX={Math.sin(t * 1.4) * 10} blink={mod(t, 3) > 2.9 ? 1 : 0} /></g></g>
    <g clipPath="url(#c2)"><rect x="40" y="990" width="1000" height="570" fill="#16222b" /><g transform="translate(540 1310) scale(0.52)" filter="url(#cyanTint)"><GirlShoulders /><GirlFace mouth="worry" brow={8} lookX={Math.sin(t * 1.4 - 0.2) * 10} blink={mod(t - 0.12, 3) > 2.9 ? 1 : 0} /></g>
      <rect x="40" y={990 + mod(t * 300, 570)} width="1000" height="6" fill="#9fd8ff" opacity="0.4" /></g>
    <rect x="40" y="380" width="1000" height="570" rx="26" fill="none" stroke={ACC} strokeWidth="8" /><rect x="40" y="990" width="1000" height="570" rx="26" fill="none" stroke="#9fd8ff" strokeWidth="8" />
    <Tag x={220} y={380} text="ТЫ" size={32} color="#26324a" /><Tag x={220} y={990} text="ОНА" size={32} color="#c23b3b" />
    {t > 41.0 && <Tag x={820} y={600} text="ТВОЁ ЛИЦО" size={40} color="#26324a" scale={pop(t, 41.0, 6)} rot={3} />}
    {t > 42.18 && <Tag x={800} y={1210} text="ТВОЯ ОДЕЖДА" size={40} color="#26324a" scale={pop(t, 42.18, 6)} rot={-3} />}</g>)},
  {a: 43.88, b: 46.78, loc: 'ПРИХОЖАЯ', cam: {s: [1, 1.06]}, vig: 1, render: ({t, lt}) => {
    const w = Math.floor(lt / 0.62) % 2;
    return (<g><Bg c="#101a22" /><g transform="translate(540 1130) scale(1.05)" filter={w ? 'url(#cyanTint)' : undefined}><GirlShoulders /><GirlFace mouth="worry" brow={8} lookX={w ? 8 : -8} sweat={mod(t * 0.6, 1)} blink={mod(t, 3.2) > 3.1 ? 1 : 0} /></g>
      <g transform="translate(900 560)"><circle r="90" fill="#10141b" stroke={ACC} strokeWidth="6" /><ellipse rx="52" ry="34" fill="#fbfbf4" /><circle cx={w ? -16 : 16} r="18" fill="#3a2a22" /></g>
      <Tag x={w ? 250 : 830} y={420} text={w ? 'НА НЕЁ' : 'НА ТЕБЯ'} size={40} color="#26324a" /></g>);
  }},
  {a: 46.78, b: 49.44, loc: 'ПРИХОЖАЯ', cam: {s: [1, 1.12]}, vig: 1, render: ({t, lt}) => (<g><Bg c="#101a22" /><g transform="translate(540 1500) scale(2.2)" opacity="0.1"><Bunny /></g><g transform="translate(540 1000) scale(1.0)"><MomFront t={t} tear={0.8} talk={t > 47.5 ? 0.6 : 0} blink={mod(t, 3.2) > 3.1 ? 1 : 0} shake={0.6} /></g></g>)},
  {a: 49.44, b: 54.94, loc: 'ПРИХОЖАЯ', nobanner: true, sub: 1640, vig: 1, render: ({t, lt}) => {
    const n = Math.max(1, Math.ceil(5.4 - lt)); const frac = mod(5.4 - lt, 1);
    return (<g><Bg c="#0b1016" /><TwoGirls t={t} sx={0.4} y={1010} />
      <g transform="translate(540 540)"><circle r="170" fill="rgba(10,13,20,0.85)" stroke={ACC} strokeWidth="10" /><circle r="170" fill="none" stroke="#fff" strokeWidth="10" strokeDasharray={2 * Math.PI * 170} strokeDashoffset={(1 - frac) * 2 * Math.PI * 170} transform="rotate(-90)" opacity="0.8" /><text y="40" textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="130" fill="#fff">{lt < 5.3 ? n : ''}</text></g>
      <Tag x={540} y={800} text="ТИШИНА…" size={50} color="#10141b" /><rect width="1080" height="1920" fill="#000" opacity={0.0 + Math.max(0, Math.sin(t * 9)) * 0.1 * (lt / 5.5)} />
      {lt > 5.2 && <rect width="1080" height="1920" fill="#fff" opacity={(lt - 5.2) * 3} />}</g>);
  }},
  {a: 54.94, b: 56.18, loc: 'ПРАВИЛА', hud: false, nobanner: true, render: ({lt}) => <RuleCard n={4} lt={lt} />},
  {a: 56.18, b: 62.02, loc: 'ПРАВИЛА', sub: 1500, cam: {s: [1, 1.05]}, vig: 1, render: ({t, lt}) => {
    const said = t > 57.0, copyAt = t > 57.6, glitch = t > 59.5, stamp = t > 60.4;
    const head = (x: number, c: string, lab: string, filt?: boolean) => (<g transform={`translate(${x} 780)`} filter={filt ? 'url(#cyanTint)' : undefined}><ellipse cy="40" rx="150" ry="24" fill="#000" opacity="0.4" /><path d="M-120 20 Q -130 -150 -60 -190 L 60 -190 Q 130 -150 120 20 Z" fill={c} /><circle cy="-260" r="100" fill={c} /><circle cx="-34" cy="-270" r="10" fill="#e9f0dc" /><circle cx="34" cy="-270" r="10" fill="#e9f0dc" /><text y="110" textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="46" fill="#fff">{lab}</text></g>);
    return (<g><rect width="1080" height="1920" fill="#0b0e15" /><rect width="1080" height="1920" fill="url(#wp)" opacity="0.18" />
      {head(270, '#6a4a3a', 'ОРИГИНАЛ')}{head(810, '#6a4a3a', glitch ? 'КОПИЯ?' : 'ОН', glitch)}
      {said && <Bubble x={270} y={400} text="СЛОВО" size={44} scale={pop(t, 57.0, 8)} />}
      {copyAt && <Bubble x={810} y={400} text="СЛОВО" size={44} scale={pop(t, 57.6, 8)} color={glitch ? '#cfeaff' : '#fff'} />}
      <path d="M390 780 H 690" stroke="#fff" strokeWidth="10" strokeDasharray="20 14" opacity="0.6" />
      {stamp && <g transform={`translate(810 1010) rotate(-8) scale(${pop(t, 60.4, 6)})`}><rect x="-210" y="-54" width="420" height="108" rx="14" fill="none" stroke="#c23b3b" strokeWidth="10" /><text textAnchor="middle" y="26" fontFamily={fontFamily} fontWeight="900" fontSize="80" fill="#c23b3b">КОПИЯ</text></g>}</g>);
  }},
  {a: 62.02, b: 64.08, loc: 'ПРИХОЖАЯ', cam: {s: [1, 1.1]}, vig: 1, render: ({t, lt}) => <Doorway t={t} open={1} mom={{s: 0.5 - lt * 0.06, y: 500 + lt * 20}} />},
  {a: 64.08, b: 65.98, loc: 'ПРИХОЖАЯ', cam: {s: [1, 1.06]}, vig: 1, render: ({t, lt}) => (<g><Bg c="#0b1016" /><TwoGirls t={t} stepBack={Math.min(1, lt / 0.8)} />{lt > 0.9 && <Tag x={540} y={560} text="СИНХРОННО" size={56} color="#c23b3b" scale={pop(lt, 0.9, 6)} rot={-3} />}</g>)},
  {a: 65.98, b: 67.54, loc: 'ПРИХОЖАЯ', vig: 1, render: ({t, lt}) => (<g><Bg c="#101a22" /><g transform={`translate(540 ${1000 - Math.min(1, lt / 0.4) * 80}) scale(1.4)`}><HandUp t={t} color="#efd9cf" /></g><Tag x={540} y={540} text="МАМА" size={64} color="#26324a" rot={-3} /></g>)},
  {a: 67.54, b: 69.06, loc: 'ПРИХОЖАЯ', vig: 1, render: ({t, lt}) => (<g><Bg c="#101a22" />
    <g transform={`translate(300 ${1050 - Math.min(1, lt / 0.4) * 80}) scale(0.95)`}><HandUp t={t} /></g>
    <g transform={`translate(780 ${1050 - Math.min(1, lt / 0.4) * 80}) scale(0.95)`} filter="url(#cyanTint)"><HandUp t={t} /></g><Tag x={540} y={540} text="ВЫ" size={64} color="#c23b3b" rot={3} /></g>)},
  {a: 69.06, b: 72.52, loc: 'КВАРТИРА', cam: {s: [1, 1.1]}, vig: 1, render: ({t, lt}) => (<g><Bg c="#0e151b" />
    {[[250, 520, -6], [830, 540, 5], [260, 1400, 4], [820, 1380, -4]].map(([x, y, r], i) => { const fade = 1 - Math.min(1, Math.max(0, (lt - 0.4 - i * 0.7) / 0.8)); return (<g key={i} transform={`translate(${x} ${y}) rotate(${r})`} opacity={fade}><rect x="-150" y="-110" width="300" height="240" rx="8" fill="#f4efe4" stroke="#0a0d14" strokeWidth="5" /><rect x="-130" y="-90" width="260" height="170" fill="#7aa4c8" /><text y="60" textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="100" fill="#fff">?</text></g>); })}
    <g transform="translate(540 960) scale(0.9)"><GirlShoulders /><GirlFace lookX={0} lookY={0} mouth="o" brow={14} pupil={0.55} sweat={mod(lt * 0.6, 1)} tear={0.6} blink={mod(t, 4) > 3.9 ? 1 : 0} /></g></g>)},
  {a: 72.52, b: 75.18, loc: 'КВАРТИРА', sub: 1600, vig: 1, render: ({t, lt}) => {
    const items = [{y: 560, at: 0.2, lab: 'ШКОЛА'}, {y: 860, at: 0.86, lab: 'ДРУЗЬЯ'}, {y: 1160, at: 1.48, lab: 'ИМЯ'}];
    return (<g><rect width="1080" height="1920" fill="#0b0e15" /><rect width="1080" height="1920" fill="url(#wp)" opacity="0.18" />
      {items.map((it, i) => { const p = pop(lt, it.at, 6); const x = Math.min(1, Math.max(0, (lt - it.at - 0.25) / 0.2)); return (<g key={i} transform={`translate(540 ${it.y}) scale(${p})`}><rect x="-420" y="-100" width="840" height="200" rx="30" fill="#18233a" stroke="#6c57a8" strokeWidth="6" /><text x="-380" y="30" fontFamily={fontFamily} fontWeight="900" fontSize="84" fill="#fff">{it.lab}</text><text x="310" y="30" textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="90" fill="#9db0cc">?</text><line x1="-420" x2={-420 + 840 * x} y1="0" y2="0" stroke="#c23b3b" strokeWidth="16" strokeLinecap="round" /></g>); })}</g>);
  }},
  {a: 75.18, b: 78.2, loc: 'КВАРТИРА', vig: 1, render: ({t, lt}) => {
    const wordsL = ['ЗАЙЦЕМ', 'ОТКРОЙ!', 'ТЫ ГДЕ?', 'МАЛЫШ', 'КЛЮЧИ', 'ЧАЙ ОСТЫЛ', 'КАШЕЛЬ'];
    return (<g><Bg c="#0e151b" /><g transform="translate(540 940) scale(0.8)"><GirlShoulders /><GirlFace mouth="closed" pupil={0.7} lookX={Math.sin(t * 2) * 10} brow={6} blink={mod(t, 3) > 2.9 ? 1 : 0} /></g>
      {wordsL.map((w, i) => { const a = i * 0.9 + t * 0.5; const x = 540 + Math.cos(a) * (330 + (i % 2) * 90), y = 920 + Math.sin(a * 1.3) * (330 + (i % 3) * 60); return <g key={i} transform={`translate(${x} ${y}) rotate(${Math.sin(a) * 8})`} opacity={pop(lt, i * 0.2, 4)}><Tag x={0} y={0} text={w} size={32} color={i % 2 ? '#26324a' : '#6c57a8'} /></g>; })}</g>);
  }},
  {a: 78.2, b: 81.6, loc: 'ПРИХОЖАЯ', cam: {s: [1, 1.12]}, vig: 1, render: ({t, lt}) => (<g><Bg c="#101a22" />
    <g transform="translate(540 1000) scale(1.0)"><MomFront t={t} tear={0.6} talk={lt < 2.6 ? 1 : 0} shake={0.5} blink={mod(t, 3.2) > 3.1 ? 1 : 0} /></g>
    <g transform="translate(540 600)"><ellipse rx="150" ry="110" fill="#f4efe4" stroke="#0a0d14" strokeWidth="6" /><ellipse cx="-30" cy="-10" rx="50" ry="40" fill="#fff" stroke="#c9c2b0" strokeWidth="4" /><circle cx="-30" cy="-10" r="22" fill="#ffc233" /><rect x="40" y="-50" width="80" height="100" rx="12" fill="#d9a441" stroke="#8a5a2a" strokeWidth="4" /><text x="0" y="38" textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="120" fill="#c23b3b" opacity={0.85}>?</text></g></g>)},
  {a: 81.6, b: 84.78, loc: 'КВАРТИРА', cam: {s: [1, 1.2]}, vig: 1, render: ({t, lt}) => (<g><Bg c="#0e151b" />
    <g transform="translate(540 1050) scale(1.1)" filter={Math.sin(t * 17) > 0.8 ? 'url(#cyanTint)' : undefined}><GirlShoulders /><GirlFace mouth="open" pupil={0.5} brow={14} lookX={0} tear={0.7} sweat={mod(lt * 0.5, 1)} blink={mod(t, 4) > 3.9 ? 1 : 0} /></g>
    <g transform="translate(540 440)" opacity={Math.floor(t * 2.2) % 2 ? 1 : 0.35}><Bubble x={0} y={0} text="…" size={90} tail="down" /></g></g>)},
  {a: 84.78, b: 88.9, loc: 'КОНЕЦ', hud: false, nobanner: true, sub: 1470, render: ({t, lt}) => {
    const p = Math.min(1, lt * 3);
    return (<g>
      <defs><linearGradient id="endBg3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1b1030" /><stop offset="1" stopColor="#0a0d14" /></linearGradient></defs>
      <rect width="1080" height="1920" fill="url(#endBg3)" /><rect width="1080" height="1920" fill="url(#wp)" opacity="0.15" />
      <g transform="translate(540 560) scale(0.5)" filter={Math.sin(t * 9) > 0.7 ? 'url(#cyanTint)' : undefined}><GirlShoulders /><GirlFace mouth="o" pupil={0.6} brow={12} lookX={Math.sin(t * 3) * 10} /></g>
      <g transform={`translate(540 980) scale(${0.6 + 0.4 * p})`}><text textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="120" fill="#fff" stroke="#0a0d14" strokeWidth="14" paintOrder="stroke">ЧТО БЫЛО</text><text y="130" textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="150" fill={ACC} stroke="#0a0d14" strokeWidth="14" paintOrder="stroke">ПОТОМ?</text></g>
      <g transform="translate(540 1250)"><Tag x={0} y={0} text={'ПИШИ «ПОТОМ» В КОММЕНТАРИЯХ'} size={34} color="#6c57a8" scale={pop(lt, 0.4, 4)} /></g>
      <g transform={`translate(540 ${1380 + Math.sin(t * 7) * 12})`} opacity={Math.min(1, lt)}><path d="M-40 -30 L 0 20 L 40 -30" stroke="#fff" strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g></g>);
  }},
];

export const Story3: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS3;
  const shot = SHOTS.find((s) => t >= s.a && t < s.b) ?? SHOTS[SHOTS.length - 1];
  const lt = t - shot.a, d = shot.b - shot.a;
  const rules = t > 54.94 ? 4 : 3;
  const dip = interpolate(lt, [0, 0.16], [0.75, 0], clamp);
  const fadeEnd = interpolate(t, [DURATION3 - 0.4, DURATION3], [0, 1], clamp);
  const fadeStart = interpolate(t, [0, 0.3], [1, 0], clamp);
  const hudOn = shot.hud !== false;
  const bannerOn = t >= 56.18 && t < 81.6 && hudOn && !shot.nobanner && shot.loc !== 'ПРАВИЛА';
  return (
    <AbsoluteFill style={{backgroundColor: '#0a0d14'}}>
      <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{position: 'absolute'}}>
        <Defs />
        <Cam lt={lt} d={d} c={shot.cam}>{shot.render({t, lt, d})}</Cam>
        <Vig o={shot.vig ?? 0.6} />
      </svg>
      {hudOn && <HUD t={t} loc={shot.loc} rules={rules} total={4} clock={19 * 3600 + 2 * 60} duration={DURATION3} />}
      {bannerOn && <Banner text="КОПИЯ НЕ ЗНАЕТ, ЧТО ОНА КОПИЯ" n={4} lt={t - 56.18} />}
      <Subs t={t} y={shot.sub ?? 1420} chunks={CH3} />
      <Atmosphere t={t} frame={frame} />
      <AbsoluteFill style={{backgroundColor: '#000', opacity: Math.max(dip, fadeEnd, fadeStart), pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
