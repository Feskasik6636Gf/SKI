import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Atmosphere} from './Details';
import {Bunny, Cup, Defs, Key, MomBack, MomFace, MomTurn, P, Waves, GirlBack, GirlFace, GirlShoulders, INK, mod, rnd} from './Chars';
import {BathDoor, Hall, Kitchen} from './Sets';
import {ACC, Banner, Cam, EQ, FONT_FAMILY as fontFamily, HUD, RuleCard, Subs, Tag, Vig, buildChunks, wave} from './Story';
import type {CamCfg, W} from './Story';
import words2 from './words2.json';

export const FPS2 = 30;
export const DURATION2 = 76.4;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CH2 = buildChunks(words2 as W[]);

const Bubble: React.FC<{x: number; y: number; text: string; size?: number; color?: string; fg?: string; tail?: 'down' | 'left' | 'right'; scale?: number; rot?: number}> = ({x, y, text, size = 56, color = '#fff', fg = '#10141b', tail = 'down', scale = 1, rot = 0}) => {
  const lines = text.split('\n');
  const w = Math.max(...lines.map((l) => l.length)) * size * 0.72 + 80;
  const h = lines.length * size * 1.2 + 40;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="38" fill={color} stroke="#0a0d14" strokeWidth="7" />
      {tail === 'down' && <path d={`M${-w * 0.18} ${h / 2 - 2} L ${-w * 0.28} ${h / 2 + 50} L ${w * 0.02} ${h / 2 - 2} Z`} fill={color} stroke="#0a0d14" strokeWidth="7" strokeLinejoin="round" />}
      {tail === 'down' && <rect x={-w * 0.26} y={h / 2 - 12} width={w * 0.26} height="14" fill={color} />}
      {lines.map((l, i) => <text key={i} textAnchor="middle" y={-h / 2 + 20 + size * 0.9 + i * size * 1.2} fontFamily={fontFamily} fontWeight="900" fontSize={size} fill={fg}>{l}</text>)}
    </g>
  );
};
const pop = (lt: number, at: number, k = 6) => Math.min(1, Math.max(0, (lt - at) * k));

type Ctx = {t: number; lt: number; d: number};
type Shot = {a: number; b: number; loc: string; hud?: boolean; sub?: number; nobanner?: boolean; cam?: CamCfg; vig?: number; render: (c: Ctx) => React.ReactNode};

// ---------- две мамы: сплит ----------
const SplitMoms: React.FC<{t: number; bubbleAt: number | null; sync: number; q?: boolean}> = ({t, bubbleAt, sync, q}) => {
  const b = bubbleAt !== null && t >= bubbleAt;
  const bp = bubbleAt !== null ? pop(t, bubbleAt, 7) : 0;
  return (
    <g>
      <rect width="1080" height="1920" fill="#06080c" />
      <clipPath id="sp1"><rect x="40" y="380" width="1000" height="570" rx="26" /></clipPath>
      <clipPath id="sp2"><rect x="40" y="990" width="1000" height="570" rx="26" /></clipPath>
      <g clipPath="url(#sp1)"><g transform="translate(540 665) scale(0.85) translate(-540 -1000)"><Kitchen t={t} /><g transform="translate(540 1560)"><MomBack t={t} /></g></g></g>
      <rect x="40" y="380" width="1000" height="570" rx="26" fill="none" stroke={ACC} strokeWidth="8" />
      <g clipPath="url(#sp2)"><g transform="translate(540 1275) scale(0.8) translate(-540 -700)"><Hall t={t} lamp={0.6} feet={1} /></g></g>
      <rect x="40" y="990" width="1000" height="570" rx="26" fill="none" stroke="#9fd8ff" strokeWidth="8" />
      <Tag x={250} y={380} text="НА КУХНЕ" size={30} color="#26324a" /><Tag x={250} y={990} text="ЗА ДВЕРЬЮ" size={30} color="#26324a" />
      {q && <><Bubble x={800} y={560} text="?" size={90} scale={bp || 1} tail="left" /><Bubble x={800} y={1180} text="?" size={90} scale={bp || 1} tail="left" /></>}
      {b && <><Bubble x={790} y={560} text="ЗАЙЦЕМ" size={60} scale={bp} color="#fff" /><Bubble x={790} y={1170} text="ЗАЙЦЕМ" size={60} scale={bp} color="#cfeaff" /></>}
      {sync > 0 && (
        <g transform="translate(540 930)" opacity={sync}>
          <rect x="-330" y="-66" width="660" height="132" rx="26" fill="rgba(10,13,20,0.9)" stroke={ACC} strokeWidth="4" />
          <g transform="translate(-300 -18)"><path d={wave(2.1, 56, 600, 22)} stroke="#7dffb2" strokeWidth="5" fill="none" /></g>
          <g transform="translate(-300 24)"><path d={wave(2.1, 56, 600, 22)} stroke={ACC} strokeWidth="5" fill="none" /></g>
        </g>
      )}
    </g>
  );
};

// ---------- мини-карточка «Часть 1» ----------
const Polaroid: React.FC<{id: string; x: number; y: number; rot: number; children: React.ReactNode; label: string; delay: number; lt: number}> = ({id, x, y, rot, children, label, delay, lt}) => {
  const p = pop(lt, delay, 5);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${p})`}>
      <rect x="-250" y="-190" width="500" height="410" rx="10" fill="#f4efe4" stroke="#0a0d14" strokeWidth="6" />
      <clipPath id={id}><rect x="-226" y="-166" width="452" height="320" /></clipPath>
      <g clipPath={`url(#${id})`}>{children}</g>
      <text x="0" y="194" textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="30" fill="#10141b">{label}</text>
    </g>
  );
};

const waveSync = (seed: number, off: number) => wave(seed + off, 70, 760, 56);

const SHOTS: Shot[] = [
  {a: 0, b: 2.55, loc: 'ПРИХОЖАЯ', hud: true, sub: 1640, nobanner: true, cam: {s: [1, 1.04]}, render: ({t}) => <SplitMoms t={t} bubbleAt={null} sync={0} q />},
  {a: 2.55, b: 5.28, loc: 'ПРИХОЖАЯ', hud: true, sub: 1640, nobanner: true, cam: {s: [1.02, 1.06]}, render: ({t}) => <SplitMoms t={t} bubbleAt={2.62} sync={Math.min(1, Math.max(0, (t - 3.4) * 3))} />},
  // рецап
  {a: 5.28, b: 7.28, loc: 'ПЕРЕМОТКА', hud: true, nobanner: true, sub: 1640, cam: {s: [1, 1.05]}, vig: 1, render: ({t, lt}) => (
    <g>
      <rect width="1080" height="1920" fill="#0b0e15" />
      {Array.from({length: 26}).map((_, i) => <rect key={i} x="0" y={mod(i * 90 + t * 900, 1920)} width="1080" height={6 + rnd(i) * 22} fill="#fff" opacity={0.05 + rnd(i + 3) * 0.06} />)}
      <Polaroid id="pa" x={380} y={640} rot={-6} lt={lt} delay={0.1} label="ПРИХОЖАЯ"><g transform="translate(0 -60) scale(0.38) translate(-540 -900)"><Hall t={t} /></g></Polaroid>
      <Polaroid id="pb" x={710} y={970} rot={5} lt={lt} delay={0.5} label="КУХНЯ"><g transform="translate(0 -40) scale(0.4) translate(-540 -1100)"><Kitchen t={t} /><g transform="translate(540 1560)"><MomBack t={t} /></g></g></Polaroid>
      <Polaroid id="pc" x={400} y={1290} rot={-4} lt={lt} delay={0.9} label="ВАННАЯ"><g transform="translate(0 -40) scale(0.38) translate(-540 -900)"><BathDoor t={t} lock={1} /></g></Polaroid>
      <g transform="translate(540 440)"><text textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="86" fill="#fff" stroke="#0a0d14" strokeWidth="14" paintOrder="stroke">⏪ ЧАСТЬ 1</text></g>
    </g>
  )},
  {a: 7.28, b: 8.5, loc: 'КВАРТИРА', cam: {s: [1, 1.12]}, render: ({t, lt}) => (
    <g><Hall t={t} /><g transform="translate(540 1520) scale(0.62)"><GirlBack tilt={Math.sin(t * 1.4) * 1.5} /></g><Tag x={540} y={1010} text="ДОМА ОДНА" scale={pop(lt, 0, 5)} rot={-3} color="#26324a" /></g>
  )},
  {a: 8.5, b: 9.88, loc: 'ПРИХОЖАЯ', cam: {s: [1, 1.1], shake: 0.1}, render: ({t, lt}) => (
    <g><Hall t={t} bell={lt < 1.0 ? 1 : 0} feet={0.7} /><Waves x={540} y={1100} t={t} color="#fff" n={3} maxR={260} width={6} /><EQ x={540} y={1300} t={t} on label="МАМА ЗВОНИТ" color="#7dffb2" />{lt < 1 && <Tag x={850} y={500} text="ДЗЫНЬ!" rot={8} color="#ff4a3a" />}</g>
  )},
  {a: 9.88, b: 12.0, loc: 'ПРИХОЖАЯ', cam: {s: [1.04, 1.14], shake: 0.5}, render: ({t, lt}) => (
    <g><Hall t={t} doorShake={0.8} feet={0.9} bell={0} /><Bubble x={540} y={760} text={'ОТКРОЙ!\nЗАБЫЛА КЛЮЧИ!'} size={46} scale={pop(lt, 0.05, 8)} tail="down" /></g>
  )},
  {a: 12.0, b: 14.28, loc: 'КУХНЯ', cam: {s: [1, 1.3], y: [0, 200]}, vig: 1, render: ({t}) => (
    <g><Kitchen t={t} /><g transform="translate(540 1580) scale(1.0)"><MomBack t={t} /></g></g>
  )},
  {a: 14.28, b: 15.66, loc: 'ВАННАЯ', cam: {s: [1, 1.08], shake: 0.15}, render: ({t, lt}) => {
    const lock = Math.min(1, Math.max(0, (lt - 0.55) / 0.35));
    return (<g><BathDoor t={t} lock={lock} /><g transform="translate(240 1560) scale(0.55)"><GirlBack tilt={-4} /></g>{lock > 0.9 && <Tag x={700} y={500} text="ЩЁЛК" rot={-6} color="#26324a" />}</g>);
  }},
  {a: 15.66, b: 17.1, loc: 'ВАННАЯ', cam: {s: [1, 1.1]}, vig: 1, render: ({t}) => (
    <g><rect width="1080" height="1920" fill="#16222b" /><rect width="1080" height="1920" fill="url(#tileDark)" opacity="0.4" />
      <g transform="translate(560 1130) rotate(5) scale(1.05)"><GirlShoulders /><GirlFace lookX={22} lookY={0} mouth="o" brow={8} blink={mod(t, 3) > 2.9 ? 1 : 0} /></g>
      <Waves x={960} y={800} t={t} color="#fff" n={3} maxR={150} width={4} /></g>
  )},
  {a: 17.1, b: 19.9, loc: 'ВАННАЯ', cam: {s: [1, 1.1]}, vig: 1, render: ({t, lt}) => (
    <g><BathDoor t={t} lock={1} /><g transform="translate(240 1560) scale(0.55)"><GirlBack tilt={-5} /></g>
      <Bubble x={540} y={640} text={'Как ты звала\nменя в детстве?'} size={50} color="#e8e4f6" scale={pop(lt, 0.05, 6)} tail="down" />
      {t > 18.98 && <Tag x={540} y={1000} text="ТИШИНА…" size={50} color="#10141b" scale={pop(t, 18.98, 4)} rot={-2} />}</g>
  )},
  {a: 19.9, b: 24.6, loc: 'КУХНЯ', cam: {s: [1, 1.35], y: [0, 220]}, vig: 1, render: ({t}) => (
    <g><Kitchen t={t} /><g transform="translate(540 1590)"><MomBack t={t} /></g>
      {t > 22.3 && <Bubble x={800} y={640} text="ЗАЙЦЕМ" size={66} scale={pop(t, 22.3, 7)} tail="down" />}</g>
  )},
  {a: 24.6, b: 25.64, loc: 'КУХНЯ', cam: {s: [1.2, 1.1]}, vig: 1, render: ({t, lt}) => (
    <g><Kitchen t={t} /><g transform="translate(540 1590)"><MomBack t={t} /></g><rect width="1080" height="1920" fill="#06150c" opacity="0.4" />
      <g transform={`translate(540 760) scale(${pop(lt, 0, 7)})`}><circle r="190" fill="#2e9a5a" stroke="#0a0d14" strokeWidth="10" /><path d="M-90 10 L -30 70 L 90 -60" stroke="#fff" strokeWidth="34" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g></g>
  )},
  {a: 25.64, b: 27.0, loc: 'ВАННАЯ', cam: {s: [1, 1.1]}, vig: 1, render: ({t, lt}) => (
    <g><rect width="1080" height="1920" fill="#16222b" /><rect width="1080" height="1920" fill="url(#tileDark)" opacity="0.4" />
      <g transform="translate(540 1130) scale(1.05)"><GirlShoulders /><GirlFace lookX={0} lookY={6} mouth="closed" brow={-6} blink={lt > 0.3 && lt < 0.45 ? 1 : 0} /></g>
      {[0, 1, 2].map((k) => { const p = mod(lt * 0.9 + k / 3, 1); return <ellipse key={k} cx={540 + (k - 1) * 40} cy={1250 - p * 120} rx={30 + p * 50} ry={16 + p * 24} fill="#dff3ff" opacity={0.28 * (1 - p)} />; })}</g>
  )},
  {a: 27.0, b: 29.82, loc: 'ВАННАЯ', cam: {s: [1, 1.12], shake: 0.1}, vig: 1, render: ({t, lt}) => {
    const cold = Math.min(1, lt / 1.0);
    return (<g><BathDoor t={t} lock={1} cold={cold} /><g transform="translate(240 1560) scale(0.55)"><GirlBack tilt={-6} /></g><g opacity={cold}><Waves x={540} y={700} t={t} color={P.cold} n={4} maxR={330} width={8} /></g>
      {t > 28.55 && <Bubble x={560} y={500} text="ЗАЙЦЕМ" size={64} color="#cfeaff" scale={pop(t, 28.55, 7)} tail="down" />}
      <EQ x={540} y={1300} t={t} on={t > 28.4} color="#9fd8ff" label="ГОЛОС ЗА ДВЕРЬЮ" /></g>);
  }},
  {a: 29.82, b: 32.9, loc: 'ПРИХОЖАЯ', hud: true, cam: {s: [1, 1.04]}, vig: 1, render: ({t, lt, d}) => {
    const pct = Math.round(Math.min(100, (lt / 2.2) * 100));
    return (<g><BathDoor t={t} lock={1} cold={1} /><rect width="1080" height="1920" fill="#05070c" opacity="0.7" />
      <g transform="translate(540 820)"><rect x="-430" y="-330" width="860" height="660" rx="30" fill="#0e1422" stroke={ACC} strokeWidth="4" />
        <text y="-260" textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="44" fill="#fff" letterSpacing="3">КТО ПЕРВЫЙ?</text>
        {[0, 1].map((r) => (<g key={r} transform={`translate(-380 ${-130 + r * 190})`}><text y="-70" fontFamily={fontFamily} fontWeight="800" fontSize="28" fill="#9db0cc">{r ? 'ГОЛОС ЗА ДВЕРЬЮ' : 'ГОЛОС С КУХНИ'}</text><path d={waveSync(1.7, 0)} stroke={r ? ACC : '#7dffb2'} strokeWidth="5" fill="none" strokeLinejoin="round" /></g>))}
        <text y="290" textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="56" fill={pct >= 100 ? '#ff4a3a' : '#fff'}>ЗАДЕРЖКА 0.00 с · {pct}%</text></g></g>);
  }},
  {a: 32.9, b: 33.44, loc: 'ПРИХОЖАЯ', hud: false, nobanner: true, render: ({t, lt}) => (
    <g><rect width="1080" height="1920" fill="#07090e" />
      {[0, 1].map((i) => <text key={i} x={540 + (i ? 8 : -8) * (1 + Math.sin(lt * 80))} y={900 + i * 14} textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="170" fill={i ? '#9fd8ff' : '#fff'} opacity={i ? 0.7 : 1} stroke="#0a0d14" strokeWidth="14" paintOrder="stroke">ЗАЙЦЕМ</text>)}</g>
  )},
  {a: 33.44, b: 34.7, loc: 'ПРАВИЛА', hud: false, nobanner: true, render: ({lt}) => <RuleCard n={3} lt={lt} />},
  // диаграмма «один повторяет»
  {a: 34.7, b: 39.4, loc: 'ПРАВИЛА', hud: true, sub: 1500, cam: {s: [1, 1.05]}, vig: 1, render: ({t, lt}) => {
    const said = t > 35.9; const copy = t > 37.3;
    const head = (x: number, c: string, lab: string) => (<g transform={`translate(${x} 780)`}><ellipse cy="40" rx="150" ry="24" fill="#000" opacity="0.4" /><path d="M-120 20 Q -130 -150 -60 -190 L 60 -190 Q 130 -150 120 20 Z" fill={c} /><circle cy="-260" r="100" fill={c} /><circle cx="-34" cy="-270" r="10" fill="#e9f0dc" /><circle cx="34" cy="-270" r="10" fill="#e9f0dc" /><text y="110" textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="46" fill="#fff">{lab}</text></g>);
    return (<g><rect width="1080" height="1920" fill="#0b0e15" /><rect width="1080" height="1920" fill="url(#wp)" opacity="0.18" />
      {head(270, '#2a4a6a', 'ГОЛОС А')}{head(810, copy ? '#6a2a2a' : '#2a4a6a', 'ГОЛОС Б')}
      {said && <Bubble x={270} y={400} text="ЗАЙЦЕМ" size={44} scale={pop(t, 35.9, 8)} />}
      {said && <Bubble x={810} y={400} text="ЗАЙЦЕМ" size={44} scale={pop(t, 35.95, 8)} color={copy ? '#ffc8c8' : '#fff'} />}
      <path d="M390 780 H 690" stroke="#fff" strokeWidth="10" strokeDasharray="20 14" opacity="0.6" />
      {copy && <g transform={`translate(540 700) scale(${pop(t, 37.3, 6)})`}><path d="M-100 0 H 100 M60 -30 L 100 0 L 60 30" stroke="#ff4a3a" strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>}
      {copy && <Tag x={540} y={1000} text="Б КОПИРУЕТ А" size={52} color="#c23b3b" scale={pop(t, 37.5, 6)} rot={-2} />}</g>);
  }},
  {a: 39.4, b: 41.0, loc: 'ВАННАЯ', cam: {s: [1, 1.1]}, vig: 1, render: ({t, lt}) => (
    <g><BathDoor t={t} lock={1} cold={1} /><g transform="translate(240 1560) scale(0.55)"><GirlBack tilt={-6} /></g><Waves x={540} y={700} t={t * 0.7} color="#bfe6ff" n={3} maxR={200} width={4} /><Tag x={540} y={500} text="ШЁПОТ…" size={50} color="#26324a" scale={pop(lt, 0.1, 5)} /></g>
  )},
  {a: 41.0, b: 43.15, loc: 'ВАННАЯ', cam: {s: [1, 1.14]}, vig: 1, render: ({t}) => (
    <g><rect width="1080" height="1920" fill="#101a22" /><rect width="1080" height="1920" fill="url(#tileDark)" opacity="0.3" />
      <g transform="translate(500 1130) rotate(-4) scale(1.05)"><GirlShoulders /><GirlFace lookX={-20} lookY={-4} mouth="worry" brow={12} sweat={mod(t * 0.6, 1)} blink={mod(t, 3.4) > 3.3 ? 1 : 0} /></g></g>
  )},
  {a: 43.15, b: 46.3, loc: 'КУХНЯ', cam: {s: [1, 1.1]}, vig: 1, render: ({t, lt}) => {
    const w = 80 + lt * 12;
    return (<g><rect width="1080" height="1920" fill="#06080c" /><clipPath id="slit2"><rect x={540 - w / 2} y="0" width={w} height="1920" /></clipPath>
      <g clipPath="url(#slit2)"><g transform="translate(540 960) scale(1.1) translate(-540 -960)"><Kitchen t={t} /><g transform="translate(540 1560) scale(0.9)"><MomBack t={t} /></g></g></g>
      <g transform="translate(860 700)"><circle r="110" fill="#10141b" stroke="#ff4a3a" strokeWidth="8" /><path d="M-30 -10 Q -30 -60 10 -60 Q 54 -60 54 -14 Q 54 18 28 40 Q 14 54 14 72" stroke="#fff" strokeWidth="12" fill="none" strokeLinecap="round" /><circle cx="14" cy="96" r="0" /></g>
      <Tag x={860} y={900} text="СЛЫШИТ ВСЁ" size={34} color="#c23b3b" scale={pop(lt, 0.2, 5)} /></g>);
  }},
  {a: 46.3, b: 48.7, loc: 'ВОСПОМИНАНИЕ', hud: true, nobanner: true, cam: {s: [1.05, 1.0]}, vig: 1, render: ({t, lt}) => (
    <g><Hall t={t} lamp={0.7} bell={1} /><rect width="1080" height="1920" fill="#202020" opacity="0.35" />
      {Array.from({length: 18}).map((_, i) => <rect key={i} x="0" y={mod(i * 110 + t * 500, 1920)} width="1080" height={4 + rnd(i) * 10} fill="#fff" opacity="0.08" />)}
      <Tag x={540} y={500} text="ПЕРВЫЙ ЗВОНОК" size={50} color="#26324a" scale={pop(lt, 0.1, 5)} />
      {lt > 1.7 && <Tag x={540} y={1300} text="*КХЕ-КХЕ*" size={64} color="#26324a" rot={4} scale={pop(lt, 1.7, 6)} />}</g>
  )},
  {a: 48.7, b: 49.86, loc: 'ВОСПОМИНАНИЕ', hud: true, nobanner: true, cam: {s: [2.0, 2.3], y: [330, 340]}, vig: 1, render: ({t, lt}) => (
    <g><Hall t={t} lamp={0.5} /><g transform="translate(540 1415) scale(0.56)"><Key glow={1} t={t} /></g></g>
  )},
  {a: 49.86, b: 51.46, loc: 'КВАРТИРА', hud: true, nobanner: true, sub: 1560, vig: 1, render: ({t, lt}) => (
    <g><rect width="1080" height="1920" fill="#0b0e15" /><rect width="1080" height="1920" fill="url(#wp)" opacity="0.2" />
      {['ЗВОНОК', 'КАШЕЛЬ', 'ФРАЗА ПРО КЛЮЧИ'].map((s, i) => { const p = pop(lt, 0.15 + i * 0.35, 6); return (<g key={s} transform={`translate(540 ${640 + i * 220}) scale(${p})`}><rect x="-420" y="-80" width="840" height="160" rx="26" fill="#18233a" stroke="#7dffb2" strokeWidth="5" /><circle cx="-340" cy="0" r="50" fill="#2e9a5a" /><path d="M-364 2 L -346 22 L -314 -18" stroke="#fff" strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round" /><text x="-250" y="20" fontFamily={fontFamily} fontWeight="900" fontSize="56" fill="#fff">{s}</text></g>); })}</g>
  )},
  {a: 51.46, b: 55.66, loc: 'КВАРТИРА', hud: true, nobanner: true, sub: 1600, vig: 1, render: ({t, lt}) => {
    const items = [
      {y: 560, at: 0.45, lab: 'ТЕЛЕФОН', sub: '«У двери.»', c: '#6c57a8'},
      {y: 860, at: 1.3, lab: 'КУХНЯ', sub: 'экран горит', c: '#2d6a8f'},
      {y: 1160, at: 2.5, lab: 'ЗВОНОК МАМЫ', sub: 'ПОЗЖЕ ВСЕГО', c: '#c23b3b'},
    ];
    return (<g><rect width="1080" height="1920" fill="#0b0e15" /><rect width="1080" height="1920" fill="url(#wp)" opacity="0.18" />
      <path d="M200 480 V 1260" stroke="#fff" strokeWidth="8" strokeDasharray="16 12" opacity="0.4" />
      {items.map((it, i) => { const p = pop(lt, it.at, 6); return (<g key={i} transform={`translate(560 ${it.y}) scale(${p})`}><rect x="-380" y="-100" width="760" height="200" rx="30" fill={it.c} stroke="#0a0d14" strokeWidth="6" /><text x="-340" y="-10" fontFamily={fontFamily} fontWeight="900" fontSize="60" fill="#fff">{it.lab}</text><text x="-340" y="66" fontFamily={fontFamily} fontWeight="700" fontSize="40" fill="#fff" opacity="0.85">{it.sub}</text></g>); })}
      {items.map((it, i) => <circle key={i} cx="200" cy={it.y} r={lt > it.at ? 22 : 0} fill="#ff8a1f" stroke="#0a0d14" strokeWidth="5" />)}
      {lt > 2.9 && <Tag x={560} y={1400} text="РАНЬШЕ, ЧЕМ ПОЗВОНИЛА" size={42} color="#10141b" scale={pop(lt, 2.9, 5)} rot={-2} />}</g>);
  }},
  {a: 55.66, b: 57.5, loc: 'КУХНЯ', cam: {s: [1, 1.4], y: [0, 260]}, vig: 1, render: ({t}) => (
    <g><Kitchen t={t} /><g transform="translate(540 1590)"><MomBack t={t} /></g></g>
  )},
  // поворот головы
  {a: 57.5, b: 60.8, loc: 'КУХНЯ', cam: {s: [1, 1.12]}, vig: 1, render: ({t, lt}) => {
    const th = interpolate(lt, [0.3, 2.7], [0, 180], {...clamp});
    return (<g><rect width="1080" height="1920" fill="#171b27" /><rect width="1080" height="1920" fill="url(#wp)" opacity="0.4" /><ellipse cx="540" cy="900" rx="520" ry="560" fill="url(#warmGlow)" opacity="0.3" />
      <g transform="translate(540 1000) scale(1.0)"><MomTurn theta={th} t={t} smile={0} /></g></g>);
  }},
  {a: 60.8, b: 64.72, loc: 'КУХНЯ', cam: {s: [1, 1.18]}, vig: 1, render: ({t, lt}) => {
    const sm = 0.4 + 0.6 * Math.abs(Math.sin(lt * 1.2)) * Math.min(1, lt / 1.3);
    return (<g><rect width="1080" height="1920" fill="#171b27" /><rect width="1080" height="1920" fill="url(#wp)" opacity="0.4" />
      <g transform="translate(540 1010) scale(1.05)"><MomTurn theta={180} t={t} smile={sm} /></g></g>);
  }},
  {a: 64.72, b: 66.9, loc: 'ПРИХОЖАЯ', cam: {s: [2.2, 2.7], y: [330, 360]}, vig: 1, render: ({t}) => (
    <g><Hall t={t} lamp={0.5} /><g transform="translate(540 1415) scale(0.56)"><Key glow={1} t={t} /></g></g>
  )},
  {a: 66.9, b: 69.26, loc: 'ПРИХОЖАЯ', cam: {s: [1, 1.1]}, vig: 1, render: ({t, lt}) => (
    <g><Hall t={t} lamp={0.4} feet={1} />
      <g transform="translate(540 1340) scale(0.6)"><Key glow={1} t={t} /></g>
      <Tag x={250} y={560} text="НА КУХНЕ" size={40} color="#26324a" scale={pop(lt, 0.7, 5)} rot={-4} /><Tag x={830} y={560} text="ЗА ДВЕРЬЮ" size={40} color="#26324a" scale={pop(lt, 1.1, 5)} rot={4} /></g>
  )},
  {a: 69.26, b: 73.18, loc: 'КВАРТИРА', cam: {s: [1, 1.06]}, vig: 1, sub: 990, render: ({t, lt}) => (
    <g><rect width="1080" height="1920" fill="#16222b" /><rect width="1080" height="1920" fill="url(#tileDark)" opacity="0.35" />
      <g transform="translate(540 700) scale(0.6)"><GirlShoulders /><GirlFace lookX={Math.sin(t * 2) * 14} mouth="worry" brow={8} blink={mod(t, 3) > 2.9 ? 1 : 0} sweat={mod(lt * 0.5, 1)} /></g></g>
  )},
  {a: 73.18, b: 76.4, loc: 'ЧАСТЬ 2', hud: false, nobanner: true, sub: 1470, render: ({t, lt}) => {
    const p = Math.min(1, lt * 3);
    return (<g>
      <defs><linearGradient id="endBg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1b1030" /><stop offset="1" stopColor="#0a0d14" /></linearGradient></defs>
      <rect width="1080" height="1920" fill="url(#endBg2)" /><rect width="1080" height="1920" fill="url(#wp)" opacity="0.15" />
      <g transform="translate(540 560) scale(0.5)"><MomTurn theta={180} t={t} smile={0.9} /></g>
      <g transform={`translate(540 980) scale(${0.6 + 0.4 * p})`}><text textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="200" fill="#fff" stroke="#0a0d14" strokeWidth="18" paintOrder="stroke">ЧАСТЬ <tspan fill={ACC}>3</tspan></text></g>
      <g transform="translate(540 1180)"><Tag x={0} y={0} text={'ПИШИ «3» В КОММЕНТАРИЯХ'} size={40} color="#6c57a8" scale={pop(lt, 0.4, 4)} /></g>
      <g transform={`translate(540 ${1330 + Math.sin(t * 7) * 12})`} opacity={Math.min(1, lt)}><path d="M-40 -30 L 0 20 L 40 -30" stroke="#fff" strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g></g>);
  }},
];

const ChoiceCards2: React.FC<{t: number}> = ({t}) => {
  const {fps} = useVideoConfig();
  const lt = t - 70.0;
  if (lt < 0) return null;
  const p = Math.min(1, Math.max(0, spring({frame: Math.round(lt * fps), fps, config: {damping: 13, stiffness: 160}})));
  const left = Math.max(0, 3 - (t - 70.2)); const n = Math.max(1, Math.ceil(left)); const frac = left % 1 || (left >= 3 ? 1 : 0);
  const card = (label: string, color: string, x: number) => (
    <div style={{position: 'absolute', left: x, top: 1290, width: 460, height: 210, borderRadius: 30, background: color, border: '6px solid #0a0d14', boxShadow: '0 14px 0 #0a0d14', color: '#fff', fontFamily, fontWeight: 900, fontSize: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', lineHeight: 1.1, padding: 20, transform: `translateY(${(1 - p) * 300}px) scale(${0.8 + 0.2 * p})`}}>{label}</div>
  );
  return (<>
    {card('ОТКРЫТЬ ДВЕРЬ', '#d9482b', 60)}{card('ЖДАТЬ, ПОКА ПОДОЙДЁТ', '#2d6a8f', 560)}
    {t > 70.2 && (<svg style={{position: 'absolute', left: 450, top: 1590}} width="180" height="180" viewBox="-90 -90 180 180"><circle r="70" fill="rgba(10,13,20,0.85)" stroke="#fff" strokeOpacity="0.2" strokeWidth="12" /><circle r="70" fill="none" stroke={ACC} strokeWidth="12" strokeLinecap="round" strokeDasharray={2 * Math.PI * 70} strokeDashoffset={(1 - frac) * 2 * Math.PI * 70} transform="rotate(-90)" /><text y="22" textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize="68" fill="#fff">{n}</text></svg>)}
  </>);
};

export const Story2: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS2;
  const shot = SHOTS.find((s) => t >= s.a && t < s.b) ?? SHOTS[SHOTS.length - 1];
  const lt = t - shot.a, d = shot.b - shot.a;
  const rules = t > 33.44 ? 3 : 2;
  const dip = interpolate(lt, [0, 0.16], [0.75, 0], clamp);
  const fadeEnd = interpolate(t, [DURATION2 - 0.4, DURATION2], [0, 1], clamp);
  const fadeStart = interpolate(t, [0, 0.3], [1, 0], clamp);
  const hudOn = shot.hud !== false;
  const bannerOn = t >= 34.7 && t < 62 && hudOn && !shot.nobanner && shot.loc !== 'ПРАВИЛА';
  return (
    <AbsoluteFill style={{backgroundColor: '#0a0d14'}}>
      <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{position: 'absolute'}}>
        <Defs />
        <Cam lt={lt} d={d} c={shot.cam}>{shot.render({t, lt, d})}</Cam>
        <Vig o={shot.vig ?? 0.6} />
      </svg>
      {hudOn && <HUD t={t} loc={shot.loc} rules={rules} total={3} clock={18 * 3600 + 50 * 60 + 30} duration={DURATION2} />}
      {bannerOn && <Banner text="ОДИН ИЗ ГОЛОСОВ ПОВТОРЯЕТ" n={3} lt={t - 34.7} />}
      {t >= 69.8 && t < 73.18 && <ChoiceCards2 t={t} />}
      <Subs t={t} y={shot.sub ?? 1420} chunks={CH2} />
      <Atmosphere t={t} frame={frame} />
      <AbsoluteFill style={{backgroundColor: '#000', opacity: Math.max(dip, fadeEnd, fadeStart), pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
