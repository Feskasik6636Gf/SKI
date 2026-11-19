import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Montserrat';
import {Atmosphere} from './Details';
import {Bunny, Cup, Defs, Eye, FingerOnLips, GirlBack, GirlFace, GirlShoulders, INK, Key, MomBack, P, Waves, mod, rnd} from './Chars';
import {BathDoor, ChatUI, Hall, Kitchen, Peephole, PhoneShell} from './Sets';
import words from './words.json';

const {fontFamily} = loadFont('normal', {weights: ['600', '700', '800', '900'], subsets: ['cyrillic', 'latin']});
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const FPS = 30;
export const DURATION = 78.9;
export const ACC = '#ff8a1f';
export const FONT_FAMILY = fontFamily;

export type W = {w: string; s: number; e: number};
const W_ALL = words as W[];

// ---------- мелкие элементы ----------
export const Tag: React.FC<{x: number; y: number; text: string; color?: string; size?: number; rot?: number; scale?: number; fg?: string}> = ({x, y, text, color = '#d9482b', size = 40, rot = 0, scale = 1, fg = '#fff'}) => {
  const w = text.length * size * 0.66 + 56;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.9} rx="18" fill={color} stroke="#0a0d14" strokeWidth="6" />
      <rect x={-w / 2} y={size * 0.98} width={w} height="10" rx="5" fill="#0a0d14" />
      <text textAnchor="middle" y={size * 0.36} fontFamily={fontFamily} fontWeight="900" fontSize={size} fill={fg}>{text}</text>
    </g>
  );
};

export const EQ: React.FC<{x: number; y: number; t: number; on: boolean; color: string; label: string}> = ({x, y, t, on, color, label}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x="-300" y="-70" width="600" height="150" rx="26" fill="rgba(10,13,20,0.78)" stroke={color} strokeWidth="3" opacity="0.95" />
    {Array.from({length: 26}).map((_, i) => {
      const h = on ? 12 + Math.abs(Math.sin(t * 11 + i * 0.7) * 30 + Math.sin(t * 7 + i * 1.9) * 18) : 6;
      return <rect key={i} x={-270 + i * 21} y={-h / 2 - 10} width="12" height={h} rx="6" fill={color} />;
    })}
    <text x="0" y="60" textAnchor="middle" fontFamily={fontFamily} fontWeight="800" fontSize="22" letterSpacing="3" fill="#fff" opacity="0.85">{label}</text>
  </g>
);

export const Vig: React.FC<{o?: number}> = ({o = 1}) => <rect width="1080" height="1920" fill="url(#vigD)" opacity={o} />;

// ---------- камера ----------
export type CamCfg = {s?: [number, number]; x?: [number, number]; y?: [number, number]; r?: [number, number]; shake?: number};
export const Cam: React.FC<{lt: number; d: number; c?: CamCfg; children: React.ReactNode}> = ({lt, d, c = {}, children}) => {
  const p = Easing.inOut(Easing.quad)(Math.min(1, Math.max(0, lt / d)));
  const L = (a?: [number, number], def = 0) => (a ? a[0] + (a[1] - a[0]) * p : def);
  const punch = 0.045 * Math.exp(-lt * 12);
  const s = L(c.s, 1) * (1 + punch);
  const sh = (c.shake ?? 0.0);
  const sx = Math.sin(lt * 53) * sh * 6, sy = Math.cos(lt * 47) * sh * 6;
  return <g transform={`translate(540 960) rotate(${L(c.r, 0)}) scale(${s}) translate(${-540 - L(c.x, 0) + sx} ${-960 - L(c.y, 0) + sy})`}>{children}</g>;
};

// ---------- карточка «ПРАВИЛО» ----------
export const RuleCard: React.FC<{n: number; lt: number}> = ({n, lt}) => {
  const {fps} = useVideoConfig();
  const p = spring({frame: Math.round(lt * fps), fps, config: {damping: 11, stiffness: 150}});
  const q = Math.min(1, Math.max(0, p));
  return (
    <g>
      <rect width="1080" height="1920" fill="#0b0e15" />
      <rect width="1080" height="1920" fill="url(#wp)" opacity="0.25" />
      <g transform={`translate(540 900) rotate(${-4 + (1 - q) * 10}) scale(${0.5 + 0.5 * q})`}>
        <rect x="-400" y="-340" width="800" height="680" rx="14" fill="#f4efe4" stroke="#0a0d14" strokeWidth="8" />
        {Array.from({length: 9}).map((_, i) => <line key={i} x1="-380" x2="380" y1={-250 + i * 70} y2={-250 + i * 70} stroke="#9dbbe0" strokeWidth="3" />)}
        <line x1="-300" x2="-300" y1="-340" y2="340" stroke="#e08a8a" strokeWidth="4" />
        <rect x="-120" y="-380" width="240" height="64" fill="#e8d28a" opacity="0.9" transform="rotate(-3)" />
        <circle cx="0" cy="-322" r="0" />
        <text x="30" y="-120" textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="118" fill="#10141b">ПРАВИЛО</text>
        <circle cx="0" cy="130" r="120" fill={ACC} stroke="#10141b" strokeWidth="8" />
        <text x="0" y="190" textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="180" fill="#fff" stroke="#10141b" strokeWidth="10" paintOrder="stroke">{n}</text>
        <g transform="translate(300 210) rotate(-12)"><rect x="-120" y="-34" width="240" height="68" rx="8" fill="none" stroke="#c23b3b" strokeWidth="8" /><text textAnchor="middle" y="16" fontFamily={fontFamily} fontWeight="900" fontSize="38" fill="#c23b3b">ЗАПОМНИ</text></g>
      </g>
    </g>
  );
};

// ---------- сцены (каждая рисуется внутри Cam) ----------
type Ctx = {t: number; lt: number; d: number};
type Shot = {nobanner?: boolean; a: number; b: number; loc: string; hud?: boolean; sub?: number; cam?: CamCfg; vig?: number; render: (c: Ctx) => React.ReactNode};

export const wave = (seed: number, n: number, w: number, h: number) =>
  Array.from({length: n + 1}).map((_, i) => `${i === 0 ? 'M' : 'L'}${(i / n) * w} ${Math.sin(i * 0.9 + seed) * h * (0.35 + 0.65 * Math.abs(Math.sin(i * 0.31 + seed * 2)))}`).join(' ');

const SHOTS: Shot[] = [
  // 1. Ты одна дома
  {a: 0, b: 1.48, loc: 'КВАРТИРА', cam: {s: [1, 1.12]}, render: ({t, lt}) => (
    <g><Hall t={t} />
      <g transform="translate(540 1520) scale(0.62)"><GirlBack tilt={Math.sin(t * 1.4) * 1.5} /></g>
      <Tag x={540} y={1010} text="ДОМА ОДНА" scale={Math.min(1, lt / 0.25)} rot={-3} color="#26324a" /></g>
  )},
  // 2. Звонит мама / Открой, я забыла ключи
  {a: 1.48, b: 4.45, loc: 'ПРИХОЖАЯ', cam: {s: [1, 1.1], shake: 0.1}, render: ({t, lt}) => {
    const talk = t > 2.58 && t < 4.2;
    return (<g><Hall t={t} bell={lt < 1.1 ? 1 : 0} feet={0.7} />
      {talk && <Waves x={540} y={1100} t={t} color="#fff" n={3} maxR={260} width={6} />}
      <EQ x={540} y={1300} t={t} on={talk} color="#7dffb2" label="ГОЛОС ЗА ДВЕРЬЮ" />
      {lt < 1.1 && <Tag x={850} y={500} text="ДЗЫНЬ!" rot={8} scale={1 + Math.sin(lt * 40) * 0.06} color="#ff4a3a" />}</g>);
  }},
  // 3a. Идёшь к двери
  {a: 4.45, b: 6.4, loc: 'ПРИХОЖАЯ', cam: {s: [1, 1.08]}, render: ({t, lt, d}) => {
    const p = lt / d; const sc = 0.9 - p * 0.38; const y = 1640 - p * 330;
    return (<g><Hall t={t} /><g transform={`translate(540 ${y}) scale(${sc})`}><GirlBack walk={t * 7} amp={1} /></g></g>);
  }},
  // 3b. Мама на кухне гремит чашкой
  {a: 6.4, b: 8.4, loc: 'КУХНЯ', cam: {s: [1.02, 1.12], shake: 0.3}, render: ({t}) => (
    <g><Kitchen t={t} cupRattle={1} /><g transform="translate(400 1540) scale(0.85)"><MomBack t={t} /></g>
      <Tag x={800} y={700} text="*ДЗЫНЬ*" rot={-6} scale={1 + Math.sin(t * 50) * 0.05} color="#26324a" /></g>
  )},
  // 4. Звонок повторяется
  {a: 8.4, b: 9.88, loc: 'ПРИХОЖАЯ', cam: {s: [1.05, 1.15], shake: 0.6}, render: ({t, lt}) => (
    <g><Hall t={t} bell={1} doorShake={1} feet={0.9} />
      <Tag x={540} y={1290} text="ЗВОНОК 2" color="#d9482b" scale={Math.min(1, lt / 0.2)} /></g>
  )},
  // 5. Тот же голос
  {a: 9.88, b: 11.8, loc: 'ПРИХОЖАЯ', hud: true, vig: 1, render: ({t, lt, d}) => {
    const pct = Math.round(Math.min(100, (lt / 1.2) * 100));
    return (<g><Hall t={t} lamp={0.55} /><rect width="1080" height="1920" fill="#05070c" opacity="0.7" />
      <g transform="translate(540 820)">
        <rect x="-430" y="-330" width="860" height="660" rx="30" fill="#0e1422" stroke={ACC} strokeWidth="4" />
        <text x="0" y="-260" textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="44" fill="#fff" letterSpacing="3">СРАВНЕНИЕ ГОЛОСА</text>
        {[0, 1].map((r) => (
          <g key={r} transform={`translate(-380 ${-130 + r * 190})`}>
            <text y="-70" fontFamily={fontFamily} fontWeight="800" fontSize="28" fill="#9db0cc">{r ? 'ЗВОНОК 2' : 'ЗВОНОК 1'}</text>
            <path d={wave(1.3, 70, 760, 56)} stroke={r ? '#ff8a1f' : '#7dffb2'} strokeWidth="5" fill="none" strokeLinejoin="round" />
          </g>
        ))}
        <rect x={-380 + (lt / d) * 760 * 1.5 % 760} y="-190" width="4" height="380" fill="#fff" opacity="0.7" />
        <text x="0" y="290" textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="64" fill={pct >= 100 ? '#ff4a3a' : '#fff'}>СОВПАДЕНИЕ {pct}%</text>
      </g></g>);
  }},
  // 6. Он даже кашляет как мама (ухо у двери)
  {a: 11.8, b: 13.7, loc: 'ПРИХОЖАЯ', cam: {s: [1, 1.08], r: [-2, 2]}, vig: 1, render: ({t, lt}) => (
    <g>
      <rect width="1080" height="1920" fill="#2a1d15" />
      {[[40, 100, 460, 760], [560, 100, 480, 760], [40, 960, 460, 800], [560, 960, 480, 800]].map(([x, y, w, h], i) => <g key={i}><rect x={x} y={y} width={w} height={h} fill="#4a3528" stroke="#2a1d15" strokeWidth="8" /><rect x={x + 24} y={y + 24} width={w - 48} height={h - 48} fill="none" stroke="#5a4333" strokeWidth="4" /></g>)}
      <g transform="translate(470 1040) rotate(-6) scale(0.98)"><GirlShoulders /><GirlFace lookX={-18} lookY={4} mouth="worry" brow={6} blink={mod(t, 3) > 2.9 ? 1 : 0} /></g>
      {lt > 0.5 && <g transform={`translate(860 560) scale(${Math.min(1, (lt - 0.5) * 6)})`}><Tag x={0} y={0} text="*КХЕ-КХЕ*" rot={7} color="#26324a" /></g>}
      <Waves x={900} y={900} t={t} color="#fff" n={3} maxR={160} width={5} />
    </g>
  )},
  // 7. ПРАВИЛО 1
  {a: 13.7, b: 15.0, loc: 'ПРАВИЛА', hud: false, render: ({lt}) => <RuleCard n={1} lt={lt} />},
  // 8. Не отвечай вслух
  {a: 15.0, b: 18.9, loc: 'ПРИХОЖАЯ', cam: {s: [1, 1.1]}, vig: 1, render: ({t, lt}) => (
    <g><Hall t={t} lamp={0.6} /><rect width="1080" height="1920" fill="#05070c" opacity="0.5" />
      <g transform="translate(540 1180) scale(1.05)">
        <GirlShoulders /><GirlFace lookX={lt > 1.6 ? 14 : 0} lookY={0} mouth="hidden" brow={4} blink={mod(t, 3.3) > 3.2 ? 1 : 0} />
        <g transform={`translate(0 ${Math.max(0, 20 - lt * 60)})`}><FingerOnLips /></g>
      </g>
      <g transform="translate(850 560)"><circle r="90" fill="#10141b" stroke="#c23b3b" strokeWidth="8" /><path d="M-36 -22 v 44 M-12 -40 v 80 M12 -26 v 52 M36 -12 v 24" stroke="#fff" strokeWidth="9" strokeLinecap="round" /><line x1="-70" y1="-70" x2="70" y2="70" stroke="#c23b3b" strokeWidth="12" strokeLinecap="round" /></g></g>
  )},
  // 9. Не говори, что ты дома (гаснет свет)
  {a: 18.9, b: 20.34, loc: 'ПРИХОЖАЯ', cam: {s: [1, 1.1]}, render: ({t, lt}) => {
    const lamp = lt < 0.35 ? 1 : lt < 0.6 ? 0.5 + 0.5 * Math.sin(lt * 60) : 0.08;
    return (<g><Hall t={t} lamp={lamp} /><g transform="translate(540 1500) scale(0.62)"><GirlBack tilt={Math.sin(t * 6) * 1.5} /></g></g>);
  }},
  // 10. Проверяй тихо — лицо в свете экрана
  {a: 20.34, b: 24.42, loc: 'ПРИХОЖАЯ', cam: {s: [1, 1.08]}, vig: 1, render: ({t, lt}) => (
    <g><Hall t={t} lamp={0.08} />
      <g transform="translate(540 1180) scale(1.05)"><GirlShoulders /><GirlFace lookX={0} lookY={16} mouth="closed" brow={3} blink={mod(t, 3.1) > 3 ? 1 : 0} /></g>
      <polygon points="120,1920 960,1920 780,900 300,900" fill="url(#upGlow)" opacity={0.5 + Math.sin(t * 20) * 0.03} />
      <ellipse cx="540" cy="1100" rx="520" ry="600" fill="url(#coldGlow)" opacity="0.25" />
      <g transform={`translate(540 560) rotate(-2) scale(${Math.min(1, lt * 4)})`}>
        <rect x="-400" y="-84" width="800" height="168" rx="12" fill="#f4efe4" stroke="#0a0d14" strokeWidth="6" />
        <rect x="-60" y="-100" width="120" height="34" fill="#e8d28a" opacity="0.9" />
        <text x="0" y="-8" textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="46" fill="#10141b">ЧТО ЗНАЕТ ТОЛЬКО</text>
        <text x="0" y="48" textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="46" fill="#d9482b">НАСТОЯЩАЯ МАМА?</text>
      </g></g>
  )},
  // 11. Переписка
  {a: 24.42, b: 29.02, loc: 'ПРИХОЖАЯ', nobanner: true, sub: 1640, cam: {s: [1, 1.1], y: [0, 40]}, vig: 1, render: ({t, lt}) => (
    <g><Hall t={t} lamp={0.05} /><rect width="1080" height="1920" fill="#05070c" opacity="0.55" />
      <PhoneShell><ChatUI t={t} lt={lt} /></PhoneShell></g>
  )},
  // 12. На кухне загорается экран телефона
  {a: 29.02, b: 31.9, loc: 'КУХНЯ', cam: {s: [1, 1.5], x: [0, -330], y: [0, 380]}, vig: 1, render: ({t, lt}) => {
    const on = lt > 0.3;
    return (<g>
      <Kitchen t={t} phoneGlow={on ? 1 : 0} />
      <g transform="translate(640 1480) scale(0.85)"><MomBack t={t} /></g>
      {on && <ellipse cx="150" cy="1540" rx={300 + Math.sin(t * 9) * 10} ry="200" fill="url(#coldGlow)" opacity="0.9" />}
      {on && (<g transform="translate(150 1400)"><rect x="-190" y="-56" width="380" height="96" rx="22" fill="#18233a" stroke="#7a88a8" strokeWidth="3" /><text x="-160" y="-14" fontFamily={fontFamily} fontWeight="800" fontSize="22" fill="#9db0cc">ДОЧКА ♥</text><text x="-160" y="22" fontFamily={fontFamily} fontWeight="700" fontSize="30" fill="#fff">Ты где?</text></g>)}
    </g>);
  }},
  // 13. ПРАВИЛО 2
  {a: 31.9, b: 33.24, loc: 'ПРАВИЛА', hud: false, render: ({lt}) => <RuleCard n={2} lt={lt} />},
  // 14. Дольше минуты
  {a: 33.24, b: 37.3, loc: 'ПРИХОЖАЯ', cam: {s: [1, 1.12], y: [0, 120]}, render: ({t, lt, d}) => {
    const sec = Math.min(60, Math.floor((lt / (d - 0.2)) * 60));
    return (<g><Hall t={t} feet={1} lamp={0.45} />
      <g transform="translate(540 820)"><circle r="190" fill="rgba(10,13,20,0.82)" stroke={sec >= 60 ? '#ff4a3a' : ACC} strokeWidth="10" />
        <circle r="190" fill="none" stroke="#fff" strokeWidth="10" strokeDasharray={2 * Math.PI * 190} strokeDashoffset={(1 - sec / 60) * 2 * Math.PI * 190} transform="rotate(-90)" opacity="0.8" />
        <text y="26" textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="100" fill={sec >= 60 ? '#ff4a3a' : '#fff'}>{sec >= 60 ? '1:00' : `0:${String(sec).padStart(2, '0')}`}</text>
        <text y="120" textAnchor="middle" fontFamily={fontFamily} fontWeight="800" fontSize="28" fill="#9db0cc" letterSpacing="2">ОН СТОИТ</text></g></g>);
  }},
  // 15. Глазок
  {a: 37.3, b: 40.2, loc: 'ПРИХОЖАЯ', cam: {s: [1, 1.18]}, vig: 1, render: ({t}) => {
    const rev = t < 38.62 ? 0 : Math.min(1, (t - 38.62) * 2.2);
    return (<g><Peephole t={t} reveal={rev} /></g>);
  }},
  // 16. Запираешься в ванной
  {a: 40.2, b: 42.2, loc: 'ВАННАЯ', cam: {s: [1, 1.08], shake: 0.15}, render: ({t, lt}) => {
    const lock = Math.min(1, Math.max(0, (lt - 0.7) / 0.35));
    return (<g><BathDoor t={t} lock={lock} /><g transform="translate(240 1560) scale(0.55)"><GirlBack tilt={-4} /></g>
      {lock > 0.9 && <Tag x={700} y={500} text="ЩЁЛК" rot={-6} color="#26324a" />}</g>);
  }},
  // 17. Голос за дверью меняется
  {a: 42.2, b: 47.75, loc: 'ВАННАЯ', cam: {s: [1, 1.14], shake: 0.12}, vig: 1, render: ({t, lt}) => {
    const cold = Math.min(1, lt / 1.8);
    const talk = (t > 44.1 && t < 45.6) || (t > 45.78 && t < 47.4);
    return (<g><BathDoor t={t} lock={1} cold={cold} /><g transform="translate(240 1560) scale(0.55)"><GirlBack tilt={-6} /></g>
      <g opacity={cold}><Waves x={540} y={700} t={t} color={P.cold} n={4} maxR={330} width={8} /></g>
      <EQ x={540} y={1300} t={t} on={talk} color={cold > 0.5 ? '#9fd8ff' : '#7dffb2'} label={lt < 1.8 ? 'ГОЛОС ИЗМЕНИЛСЯ' : 'ГОЛОС ЗА ДВЕРЬЮ'} />
    </g>);
  }},
  // 18. Мама никогда не звала тебя малышом
  {a: 47.75, b: 49.96, loc: 'ВАННАЯ', cam: {s: [1, 1.15]}, vig: 1, render: ({t, lt}) => (
    <g><rect width="1080" height="1920" fill="#16222b" /><rect width="1080" height="1920" fill="url(#tileDark)" opacity="0.4" />
      <g transform="translate(540 1050) scale(1.05)"><GirlShoulders />
        <GirlFace lookX={0} lookY={-4} mouth="o" brow={14} pupil={Math.max(0.45, 1 - lt * 0.5)} sweat={mod(lt * 0.7, 1)} tear={0.8} blink={mod(t, 4) > 3.9 ? 1 : 0} /></g>
      <Tag x={540} y={540} text="«МАЛЫШ» ✗" color="#c23b3b" scale={Math.min(1, lt * 5)} rot={-3} />
    </g>
  )},
  // 19. Она звала тебя зайцем — детский рисунок
  {a: 49.96, b: 51.48, loc: 'ВОСПОМИНАНИЕ', hud: false, cam: {s: [1.05, 1], r: [1.5, -1.5]}, render: ({t, lt}) => (
    <g>
      <rect width="1080" height="1920" fill="#f1e3c3" />
      {Array.from({length: 40}).map((_, i) => <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 2) * 1920} r={3 + rnd(i + 5) * 10} fill="#d9c79a" opacity="0.35" />)}
      <g transform="translate(540 960) rotate(-3)">
        <rect x="-420" y="-640" width="840" height="1280" fill="#fffaf0" stroke="#d9c79a" strokeWidth="6" />
        <rect x="-110" y="-690" width="220" height="60" fill="#e8d28a" opacity="0.9" transform="rotate(2)" />
        <g transform={`translate(0 30) scale(${1.4 + Math.sin(lt * 5) * 0.01})`}><Bunny /></g>
        <path d="M-340 -480 q 40 -60 80 0 q 40 -60 80 0 q -80 100 -160 0 Z" fill="#ff5a7a" opacity="0.9" transform="translate(440 200) scale(0.7)" />
        <path d="M200 -520 l 14 40 l 42 4 l -32 28 l 10 42 l -34 -22 l -36 22 l 10 -42 l -32 -28 l 42 -4 Z" fill="#ffc233" />
        <text x="0" y="-520" textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="60" fill="#e0602a" transform="rotate(-2)">для мамы ♥</text>
      </g>
      <rect width="1080" height="1920" fill="url(#warmGlow)" opacity="0.25" />
    </g>
  )},
  // 20. Смотришь на кухню через щель
  {a: 51.48, b: 53.45, loc: 'ВАННАЯ', cam: {s: [1, 1.1]}, vig: 1, render: ({t, lt}) => {
    const w = 70 + Math.sin(lt * 2) * 6 + lt * 14;
    return (<g>
      <rect width="1080" height="1920" fill="#06080c" />
      <clipPath id="slit"><rect x={540 - w / 2} y="0" width={w} height="1920" /></clipPath>
      <g clipPath="url(#slit)"><g transform="translate(540 960) scale(1.1) translate(-540 -960)"><Kitchen t={t} /><g transform="translate(540 1560) scale(0.9)"><MomBack t={t} /></g></g></g>
      <rect x={540 - w / 2 - 6} y="0" width="6" height="1920" fill="#c9a85a" opacity="0.5" /><rect x={540 + w / 2} y="0" width="6" height="1920" fill="#c9a85a" opacity="0.5" />
    </g>);
  }},
  // 21. Мама стоит у плиты спиной
  {a: 53.45, b: 56.8, loc: 'КУХНЯ', cam: {s: [1, 1.45], y: [0, 380]}, vig: 1, render: ({t}) => (
    <g><Kitchen t={t} /><g transform="translate(540 1600) scale(1.05)"><MomBack t={t} /></g></g>
  )},
  // 22. Держит чашку. Чай остыл
  {a: 56.8, b: 60.5, loc: 'КУХНЯ', cam: {s: [1, 1.1]}, vig: 1, render: ({t, lt}) => (
    <g>
      <rect width="1080" height="1920" fill="#1b1f2b" /><rect width="1080" height="1920" fill="url(#wp)" opacity="0.5" />
      <ellipse cx="540" cy="900" rx="520" ry="560" fill="url(#warmGlow)" opacity="0.35" />
      <g transform="translate(540 1180) scale(2.3)"><Cup steam={0} t={t} /></g>
      {/* руки мамы */}
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`translate(${540 + sd * 250} 1010)`}>
          <ellipse cx={sd * -10} cy="60" rx="64" ry="124" fill={P.momSkin} stroke="#a8714f" strokeWidth="5" transform={`rotate(${sd * -8})`} />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M${sd * -50} ${-30 + i * 44} q ${sd * -60} 8 ${sd * -86} ${-6 + i * 3}`} stroke="#a8714f" strokeWidth="5" fill="none" strokeLinecap="round" />)}
          <path d={`M${sd * 10} -40 q ${sd * 24} 6 ${sd * 36} 28`} stroke="#c9a05a" strokeWidth="0" />
        </g>
      ))}
      <rect x="810" y="1040" width="30" height="14" rx="7" fill="#e8d28a" stroke={INK} strokeWidth="3" />
      {lt > 2.4 && (<g transform={`translate(540 620) scale(${Math.min(1, (lt - 2.4) * 5)})`}>
        <rect x="-300" y="-70" width="600" height="140" rx="26" fill="rgba(10,13,20,0.85)" stroke="#9fd8ff" strokeWidth="5" />
        <rect x="-250" y="-40" width="24" height="70" rx="12" fill="#9fd8ff" /><circle cx="-238" cy="46" r="22" fill="#9fd8ff" />
        <text x="30" y="22" textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="64" fill="#fff">ЧАЙ: 18°C</text></g>)}
    </g>
  )},
  // 23. Ключ на пороге
  {a: 60.5, b: 65.3, loc: 'ПРИХОЖАЯ', cam: {s: [2.2, 2.7], y: [330, 360]}, vig: 1, render: ({t}) => (
    <g><Hall t={t} lamp={0.5} />
      <g transform="translate(540 1415) scale(0.56)"><Key glow={t > 62.9 ? 1 : 0} t={t} /></g>
      {t > 63.14 && <g transform="translate(540 1262)"><Tag x={0} y={0} text="КЛЮЧ МАМЫ" color="#d9a441" fg="#10141b" size={24} rot={-4} scale={Math.min(1, (t - 63.14) * 6)} /></g>}
    </g>
  )},
  // 24. Снаружи / Внутри
  {a: 65.3, b: 70.6, loc: 'КВАРТИРА', hud: true, sub: 1640, render: ({t, lt}) => {
    const outHi = t < 68.4; const inHi = t >= 68.4;
    return (<g>
      <rect width="1080" height="1920" fill="#06080c" />
      <clipPath id="top"><rect x="40" y="380" width="1000" height="560" rx="26" /></clipPath>
      <clipPath id="bot"><rect x="40" y="980" width="1000" height="560" rx="26" /></clipPath>
      <g clipPath="url(#top)">
        <rect x="40" y="380" width="1000" height="560" fill="#0f1a22" />
        <ellipse cx="540" cy="900" rx="520" ry="300" fill="url(#coldGlow)" opacity="0.4" />
        <g transform="translate(540 960)"><ellipse cy="0" rx="260" ry="30" fill="#000" opacity="0.4" />
          <path d="M-200 0 Q -210 -250 -90 -310 L 90 -310 Q 210 -250 200 0 Z" fill="#05070a" /><ellipse cx="0" cy="-380" rx="110" ry="130" fill="#05070a" />
          <circle cx="-38" cy="-390" r="9" fill="#e9f0dc" /><circle cx="38" cy="-390" r="9" fill="#e9f0dc" /></g>
        <g transform={`translate(800 560) scale(${outHi ? 1 + Math.sin(t * 6) * 0.03 : 0.9})`}><ellipse rx="130" ry="90" fill="#fff" stroke="#10141b" strokeWidth="5" /><g transform="scale(0.5)"><Bunny color="#ff5a7a" /></g><circle cx="-110" cy="70" r="14" fill="#fff" /><circle cx="-150" cy="100" r="8" fill="#fff" /></g>
        <rect x="40" y="380" width="1000" height="560" rx="26" fill="none" stroke={outHi ? '#7dffb2' : '#2a3140'} strokeWidth="8" />
      </g>
      <g clipPath="url(#bot)"><g transform="translate(540 960) scale(0.9) translate(-540 -960) translate(0 -260)"><Kitchen t={t} /></g>
        <g transform="translate(540 1500) scale(0.6)"><MomBack t={t} /></g>
        <g transform={`translate(800 1080) scale(${inHi ? 1 + Math.sin(t * 6) * 0.03 : 0.9})`}><ellipse rx="110" ry="80" fill="#fff" stroke="#10141b" strokeWidth="5" /><text y="28" textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="96" fill="#c23b3b">?</text></g>
        <rect x="40" y="980" width="1000" height="560" rx="26" fill="none" stroke={inHi ? '#ff4a3a' : '#2a3140'} strokeWidth="8" /></g>
      <Tag x={240} y={360} text="СНАРУЖИ" size={30} color="#26324a" /><Tag x={230} y={960} text="ВНУТРИ" size={30} color="#26324a" />
      <Tag x={900} y={360} text="ЗНАЕТ ПРО ЗАЙЦА" size={26} color="#2e9a5a" /><Tag x={880} y={960} text="НЕ ЗНАЕТ" size={26} color="#c23b3b" />
    </g>);
  }},
  // 25. Выбор
  {a: 70.6, b: 75.5, loc: 'КВАРТИРА', cam: {s: [1, 1.06]}, vig: 1, sub: 990, render: ({t, lt}) => (
    <g><rect width="1080" height="1920" fill="#16222b" /><rect width="1080" height="1920" fill="url(#tileDark)" opacity="0.35" />
      <g transform="translate(540 700) scale(0.6)"><GirlShoulders /><GirlFace lookX={Math.sin(t * 2) * 14} lookY={0} mouth="worry" brow={8} blink={mod(t, 3) > 2.9 ? 1 : 0} sweat={mod(lt * 0.5, 1)} /></g></g>
  )},
  // 26. Финал
  {a: 75.5, b: 78.9, loc: 'ЧАСТЬ 1', hud: false, sub: 1470, render: ({t, lt}) => {
    const p = Math.min(1, lt * 3);
    return (<g>
      <defs><linearGradient id="endBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1b1030" /><stop offset="1" stopColor="#0a0d14" /></linearGradient></defs>
      <rect width="1080" height="1920" fill="url(#endBg)" /><rect width="1080" height="1920" fill="url(#wp)" opacity="0.15" />
      <g transform="translate(540 560) scale(0.5)"><GirlShoulders /><GirlFace lookX={Math.sin(t * 3) * 10} mouth="worry" brow={10} sweat={mod(lt * 0.4, 1)} /></g>
      <g transform={`translate(540 980) scale(${0.6 + 0.4 * p})`}><text textAnchor="middle" fontFamily={fontFamily} fontWeight="900" fontSize="200" fill="#fff" stroke="#0a0d14" strokeWidth="18" paintOrder="stroke">ЧАСТЬ <tspan fill={ACC}>2</tspan></text></g>
      <g transform="translate(540 1180)"><Tag x={0} y={0} text={'ПИШИ «2» В КОММЕНТАРИЯХ'} size={40} color="#6c57a8" scale={Math.min(1, Math.max(0, (lt - 0.4) * 4))} /></g>
      <g transform={`translate(540 ${1330 + Math.sin(t * 7) * 12})`} opacity={Math.min(1, lt)}><path d="M-40 -30 L 0 20 L 40 -30" stroke="#fff" strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
    </g>);
  }},
];

// ---------- субтитры ----------
export type Chunk = {words: W[]; a: number; b: number};
export const buildChunks = (W_ALL: W[]): Chunk[] => {
  const out: Chunk[] = []; let cur: W[] = [];
  const flush = () => { if (cur.length) { out.push({words: cur, a: cur[0].s, b: cur[cur.length - 1].e}); cur = []; } };
  W_ALL.forEach((w) => {
    const len = cur.reduce((n, x) => n + x.w.length + 1, 0) + w.w.length;
    if (cur.length >= 3 || len > 21) flush();
    cur.push(w);
    if (/[.?!,]$/.test(w.w)) flush();
  });
  flush(); return out;
};
const CHUNKS = buildChunks(W_ALL);
const KEY = ['ключ', 'зайц', 'глазк', 'двер', 'мам', 'малыш', 'голос', 'тихо', 'минут', 'кухн', 'правил', 'настоящ', 'ждать', 'жду'];

export const Subs: React.FC<{t: number; y: number; chunks?: Chunk[]}> = ({t, y, chunks = CHUNKS}) => {
  const ch = chunks.find((c) => t >= c.a - 0.04 && t < c.b + 0.22);
  if (!ch) return null;
  let hlDone = false;
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: y, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 24px', fontFamily, fontWeight: 900, fontSize: 100, lineHeight: 1.12, textAlign: 'center'}}>
      {ch.words.map((w, i) => {
        const clean = w.w.replace(/[.,?!]/g, '');
        const key = !hlDone && KEY.some((k) => clean.toLowerCase().startsWith(k));
        if (key) hlDone = true;
        const age = t - w.s;
        const shown = age >= -0.03;
        const pop = Math.min(1, Math.max(0, age / 0.12));
        const active = t >= w.s && t < w.e;
        return (
          <span key={i} style={{opacity: shown ? 1 : 0, transform: `scale(${0.7 + 0.3 * pop + (active ? 0.05 : 0)}) translateY(${(1 - pop) * 16}px)`, color: key ? ACC : '#fff', WebkitTextStroke: '13px #0a0d14', paintOrder: 'stroke fill', textShadow: key ? '0 0 40px rgba(255,138,31,0.5)' : 'none'} as React.CSSProperties}>{clean.toUpperCase()}{/[?!]$/.test(w.w) ? w.w.slice(-1) : ''}</span>
        );
      })}
    </div>
  );
};

// ---------- HUD ----------
export const Pill: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '14px 26px', borderRadius: 18, background: 'rgba(10,13,20,0.74)', border: '2px solid rgba(255,138,31,0.6)', color: '#fff', fontFamily, fontWeight: 800, fontSize: 32, letterSpacing: 1, ...style}}>{children}</div>
);

export const HUD: React.FC<{t: number; loc: string; rules: number; clock?: number; total?: number; duration?: number}> = ({t, loc, rules, clock = 18 * 3600 + 40 * 60, total = 2, duration = DURATION}) => {
  const secs = clock + Math.floor(t * 8);
  const hh = String(Math.floor(secs / 3600)).padStart(2, '0'), mm = String(Math.floor((secs % 3600) / 60)).padStart(2, '0'), ss = String(secs % 60).padStart(2, '0');
  const prog = t / duration;
  const fear = Math.round(2 + 8 * Math.pow(prog, 0.8)), noise = Math.round(1 + 7 * Math.max(0, Math.sin(prog * 9) * 0.5 + prog * 0.8));
  const bpm = Math.round(72 + prog * 60 + Math.sin(t * 6) * 2);
  const pts: string[] = [];
  for (let x = 0; x <= 220; x += 4) { const ph = mod(x + t * (110 + prog * 120), 110); pts.push(`${x},${ph > 48 && ph < 56 ? -26 : ph > 56 && ph < 62 ? 22 : ph > 20 && ph < 32 ? -6 : 0}`); }
  const bar = (label: string, v: number, color: string) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 8}}><span style={{width: 92, fontSize: 18, opacity: 0.85}}>{label}</span>
      <span style={{display: 'flex', gap: 3}}>{Array.from({length: 10}).map((_, i) => <span key={i} style={{width: 12, height: 16, borderRadius: 2, background: i < v ? color : 'rgba(255,255,255,0.15)'}} />)}</span></div>
  );
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 48, top: 70}}><Pill><span style={{width: 18, height: 18, borderRadius: 9, background: '#ff3b3b', opacity: Math.floor(t * 2) % 2 ? 1 : 0.25}} /><span>ВЕЧЕР</span><span style={{color: ACC}}>{loc}</span><span style={{opacity: 0.9, marginLeft: 6}}>{hh}:{mm}:{ss}</span></Pill></div>
      <div style={{position: 'absolute', right: 48, top: 70}}><Pill style={{fontSize: 26}}><span>ПРАВИЛА</span><span style={{display: 'flex', gap: 8}}>{Array.from({length: total}).map((_, i) => <span key={i} style={{width: 26, height: 26, borderRadius: 6, border: '3px solid #fff', background: i < rules ? ACC : 'transparent'}} />)}</span></Pill></div>
      <div style={{position: 'absolute', left: 48, top: 160, display: 'flex', gap: 14, alignItems: 'center', color: '#fff', fontFamily, fontWeight: 700, fontSize: 20, opacity: 0.9}}>
        <svg width="40" height="26" viewBox="0 0 40 26">{[0, 1, 2, 3].map((i) => <rect key={i} x={i * 10} y={20 - i * 6} width="7" height={6 + i * 6} rx="1.5" fill={i < 3 ? '#fff' : 'rgba(255,255,255,0.3)'} />)}</svg>
        <svg width="56" height="26" viewBox="0 0 56 26"><rect x="1" y="3" width="46" height="20" rx="4" fill="none" stroke="#fff" strokeWidth="2.5" /><rect x="48" y="9" width="5" height="8" rx="1" fill="#fff" /><rect x="5" y="7" width={Math.max(4, 36 - t * 0.4)} height="12" rx="2" fill={ACC} /></svg>
        <span>ТЕЛЕФОН {Math.max(4, Math.round(81 - t * 0.9))}%</span>
      </div>
      <div style={{position: 'absolute', right: 48, top: 160, width: 380, padding: '14px 18px', borderRadius: 16, background: 'rgba(10,13,20,0.6)', border: '2px solid rgba(255,255,255,0.14)', color: '#fff', fontFamily, fontWeight: 800, display: 'flex', flexDirection: 'column', gap: 10}}>
        {bar('СТРАХ', fear, '#ff5a3a')}{bar('ШУМ', Math.min(10, noise), '#ffc233')}
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}><span style={{color: '#ff5a3a', fontSize: 26, transform: `scale(${1 + 0.15 * Math.max(0, Math.sin(t * 9))})`}}>♥</span><span style={{fontSize: 26}}>{bpm}</span>
          <svg width="210" height="60" viewBox="0 -34 220 68"><polyline points={pts.join(' ')} fill="none" stroke="#7dffb2" strokeWidth="3" strokeLinejoin="round" /></svg></div>
      </div>
    </AbsoluteFill>
  );
};

export const Banner: React.FC<{text: string; n: number; lt: number}> = ({text, n, lt}) => {
  const p = Math.min(1, lt * 5);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 350, display: 'flex', justifyContent: 'center', transform: `translateY(${(1 - p) * -30}px)`, opacity: p}}>
      <div style={{display: 'flex', alignItems: 'stretch', borderRadius: 16, overflow: 'hidden', border: '4px solid #0a0d14', boxShadow: '0 8px 0 #0a0d14', fontFamily, fontWeight: 900, fontSize: 32}}>
        <div style={{background: ACC, color: '#10141b', padding: '14px 22px'}}>ПРАВИЛО {n}</div>
        <div style={{background: '#10141b', color: '#fff', padding: '14px 24px'}}>{text}</div>
      </div>
    </div>
  );
};

const ChoiceCards: React.FC<{t: number}> = ({t}) => {
  const {fps} = useVideoConfig();
  const lt = t - 71.2;
  if (lt < 0) return null;
  const p = Math.min(1, Math.max(0, spring({frame: Math.round(lt * fps), fps, config: {damping: 13, stiffness: 160}})));
  const left = Math.max(0, 3 - (t - 72.0)); const n = Math.max(1, Math.ceil(left)); const frac = left % 1 || (left >= 3 ? 1 : 0);
  const card = (label: string, color: string, x: number) => (
    <div style={{position: 'absolute', left: x, top: 1290, width: 460, height: 210, borderRadius: 30, background: color, border: '6px solid #0a0d14', boxShadow: '0 14px 0 #0a0d14', color: '#fff', fontFamily, fontWeight: 900, fontSize: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', lineHeight: 1.1, padding: 20, transform: `translateY(${(1 - p) * 300}px) scale(${0.8 + 0.2 * p})`}}>{label}</div>
  );
  return (
    <>
      {card('ОТКРЫТЬ ДВЕРЬ', '#d9482b', 60)}{card('СПРОСИТЬ У МАМЫ', '#2d6a8f', 560)}
      {t > 72.0 && (<svg style={{position: 'absolute', left: 450, top: 1590}} width="180" height="180" viewBox="-90 -90 180 180"><circle r="70" fill="rgba(10,13,20,0.85)" stroke="#fff" strokeOpacity="0.2" strokeWidth="12" /><circle r="70" fill="none" stroke={ACC} strokeWidth="12" strokeLinecap="round" strokeDasharray={2 * Math.PI * 70} strokeDashoffset={(1 - frac) * 2 * Math.PI * 70} transform="rotate(-90)" /><text y="22" textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize="68" fill="#fff">{n}</text></svg>)}
    </>
  );
};

// ---------- главная композиция ----------
export const Story: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const shot = SHOTS.find((s) => t >= s.a && t < s.b) ?? SHOTS[SHOTS.length - 1];
  const lt = t - shot.a, d = shot.b - shot.a;
  const rules = t > 31.9 ? 2 : t > 13.7 ? 1 : 0;
  const dip = interpolate(lt, [0, 0.16], [0.75, 0], clamp);
  const fadeEnd = interpolate(t, [DURATION - 0.4, DURATION], [0, 1], clamp);
  const fadeStart = interpolate(t, [0, 0.3], [1, 0], clamp);
  const hudOn = shot.hud !== false;
  const banner = t >= 15 && t < 31.8 ? {n: 1, text: 'НЕ ОТВЕЧАЙ ВСЛУХ', a: 15} : t >= 33.24 && t < 58 ? {n: 2, text: 'НЕ ПОДХОДИ К ГЛАЗКУ', a: 33.24} : null;
  const bannerOn = banner && shot.hud !== false && shot.loc !== 'ПРАВИЛА' && shot.loc !== 'ВОСПОМИНАНИЕ' && !shot.nobanner;
  return (
    <AbsoluteFill style={{backgroundColor: '#0a0d14'}}>
      <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{position: 'absolute'}}>
        <Defs />
        <Cam lt={lt} d={d} c={shot.cam}>{shot.render({t, lt, d})}</Cam>
        <Vig o={shot.vig ?? 0.6} />
      </svg>
      {hudOn && <HUD t={t} loc={shot.loc} rules={rules} />}
      {bannerOn && banner && <Banner text={banner.text} n={banner.n} lt={t - banner.a} />}
      {t >= 70.9 && t < 75.5 && <ChoiceCards t={t} />}
      <Subs t={t} y={shot.sub ?? 1420} />
      <Atmosphere t={t} frame={frame} />
      <AbsoluteFill style={{backgroundColor: '#000', opacity: Math.max(dip, fadeEnd, fadeStart), pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
