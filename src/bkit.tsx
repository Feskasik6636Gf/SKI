import React from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

// Titan One лежит в public/fonts — рендер не зависит от сети
export const TITAN = 'Titan One';
if (typeof document !== 'undefined') {
  const h = delayRender('font');
  const f = new FontFace(TITAN, `url(${staticFile('fonts/TitanOne.ttf')})`);
  f.load().then(() => { (document as any).fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
}
export const OUT = '#10141b';
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const ease = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const back = (x: number) => { const c = 1.9, k = clamp01(x) - 1; return 1 + (c + 1) * k * k * k + c * k * k; };

export const C = {
  sky1: '#59c3ff', sky2: '#c6ecff', night1: '#10163a', night2: '#2b2f6b',
  blue: '#2f8cff', gold: '#ffc233', red: '#ff3b4a', green: '#3fd17a', pink: '#ff7ab6', purple: '#8b5cf6',
  skin: '#ffd2ae', skin2: '#e8a77c', ink: OUT, cream: '#fff4dc', orange: '#ff8a1f',
};

// ---------- текст с обводкой ----------
export const Txt: React.FC<{x?: number; y?: number; s?: number; fill?: string; stroke?: string; sw?: number; anchor?: 'start' | 'middle' | 'end'; rot?: number; children: React.ReactNode}> =
  ({x = 0, y = 0, s = 80, fill = '#fff', stroke = OUT, sw = 14, anchor = 'middle', rot = 0, children}) => (
    <text x={x} y={y} textAnchor={anchor} fontFamily={TITAN} fontSize={s} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" paintOrder="stroke" transform={`rotate(${rot} ${x} ${y})`}>{children}</text>
  );

export const Bubble: React.FC<{x: number; y: number; text: string; s?: number; sc?: number; rot?: number; tail?: number; fill?: string; fg?: string}> =
  ({x, y, text, s = 54, sc = 1, rot = 0, tail = -1, fill = '#fff', fg = OUT}) => {
    const w = text.length * s * 0.58 + 70, h = s * 1.7;
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`}>
        <path d={`M${tail * 40} ${h / 2 - 6} l ${tail * 34} 56 l ${-tail * 70} -56 Z`} fill={fill} stroke={OUT} strokeWidth="7" strokeLinejoin="round" />
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={fill} stroke={OUT} strokeWidth="7" />
        <path d={`M${tail * 40 - 22} ${h / 2 - 3} h 56`} stroke={fill} strokeWidth="10" />
        <text y={s * 0.36} textAnchor="middle" fontFamily={TITAN} fontSize={s} fill={fg}>{text}</text>
      </g>
    );
  };

export const Tag: React.FC<{x: number; y: number; text: string; s?: number; sc?: number; rot?: number; color?: string; fg?: string}> =
  ({x, y, text, s = 64, sc = 1, rot = 0, color = C.red, fg = '#fff'}) => {
    const w = text.length * s * 0.6 + 60;
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`}>
        <rect x={-w / 2} y={-s * 0.9} width={w} height={s * 1.8 + 12} rx="22" fill={OUT} />
        <rect x={-w / 2} y={-s * 0.9 - 8} width={w} height={s * 1.8} rx="22" fill={color} stroke={OUT} strokeWidth="7" />
        <text y={s * 0.3 - 4} textAnchor="middle" fontFamily={TITAN} fontSize={s} fill={fg}>{text}</text>
      </g>
    );
  };

// ---------- браслет ----------
export const Brace: React.FC<{x?: number; y?: number; s?: number; color?: string; text?: string; glow?: number; shake?: number; rot?: number; foil?: boolean; tc?: string}> =
  ({x = 0, y = 0, s = 1, color = C.blue, text = '100', glow = 0, shake = 0, rot = 0, foil = false, tc = '#bdffd8'}) => (
    <g transform={`translate(${x + shake} ${y}) rotate(${rot}) scale(${s})`}>
      {glow > 0 && <ellipse rx={260} ry={200} fill={foil ? '#ffffff' : tc} opacity={0.35 * glow} />}
      <rect x="-190" y="-80" width="380" height="160" rx="64" fill={foil ? '#d8dde6' : color} stroke={OUT} strokeWidth="9" />
      {foil && Array.from({length: 7}).map((_, i) => <path key={i} d={`M${-170 + i * 56} -76 l 24 150`} stroke="#fff" strokeWidth="9" opacity="0.8" />)}
      <rect x="-108" y="-56" width="216" height="112" rx="22" fill="#0b1b24" stroke={OUT} strokeWidth="6" />
      <text y="30" textAnchor="middle" fontFamily={TITAN} fontSize={text.length > 3 ? 56 : 88} fill={tc}>{text}</text>
    </g>
  );

// ---------- персонаж ----------
export type Mouth = 'smile' | 'open' | 'o' | 'flat' | 'worry' | 'talk' | 'grin';
export type PP = {
  x: number; y: number; s?: number; skin?: string; shirt?: string; hair?: string; style?: 'short' | 'spike' | 'bald' | 'bun' | 'hat' | 'cap' | 'long';
  mouth?: Mouth; look?: number; lookY?: number; brow?: number; t?: number; arm?: number; brace?: string; btext?: string; bglow?: number; bshake?: number; bfoil?: boolean;
  full?: boolean; flip?: boolean; stache?: boolean; glass?: boolean; rot?: number; sweat?: number; cheek?: boolean; noArm?: boolean; wide?: boolean;
};
export const Person: React.FC<PP> = ({
  x, y, s = 1, skin = C.skin, shirt = C.blue, hair = '#3a2a22', style = 'short', mouth = 'smile', look = 0, lookY = 0, brow = 0, t = 0, arm = 0, brace, btext = '100',
  bglow = 0, bshake = 0, bfoil = false, full = false, flip = false, stache = false, glass = false, rot = 0, sweat = 0, cheek = true, noArm = false, wide = false,
}) => {
  const talk = mouth === 'talk' ? Math.abs(Math.sin(t * 17)) : 0;
  const blink = (t % 3.4) > 3.28 ? 0.1 : 1;
  const ax = 150 + arm * 40, ay = 330 - arm * 330; // конец руки
  const hx = ax, hy = ay;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}>
      {full && <g>
        <rect x="-70" y="360" width="50" height="150" rx="20" fill="#2f3a5a" stroke={OUT} strokeWidth="7" />
        <rect x="20" y="360" width="50" height="150" rx="20" fill="#2f3a5a" stroke={OUT} strokeWidth="7" />
        <ellipse cx="-50" cy="520" rx="50" ry="26" fill="#fff" stroke={OUT} strokeWidth="7" />
        <ellipse cx="50" cy="520" rx="50" ry="26" fill="#fff" stroke={OUT} strokeWidth="7" />
      </g>}
      {/* тело */}
      <path d="M-120 400 L-112 215 Q -108 130 0 130 Q 108 130 112 215 L 120 400 Z" fill={shirt} stroke={OUT} strokeWidth="8" strokeLinejoin="round" />
      <path d="M-30 132 Q 0 175 30 132" fill={skin} stroke={OUT} strokeWidth="6" />
      {/* левая рука (вдоль тела) */}
      {!noArm && <path d="M-105 190 Q -150 260 -128 340" stroke={shirt} strokeWidth="46" strokeLinecap="round" fill="none" />}
      {!noArm && <path d="M-105 190 Q -150 260 -128 340" stroke={OUT} strokeWidth="60" strokeLinecap="round" fill="none" opacity="0.0" />}
      {!noArm && <circle cx="-128" cy="350" r="30" fill={skin} stroke={OUT} strokeWidth="7" />}
      {/* правая рука */}
      {!noArm && <g>
        <path d={`M105 190 Q ${160 + arm * 20} ${240 - arm * 120} ${hx} ${hy + 20}`} stroke={OUT} strokeWidth="60" strokeLinecap="round" fill="none" />
        <path d={`M105 190 Q ${160 + arm * 20} ${240 - arm * 120} ${hx} ${hy + 20}`} stroke={shirt} strokeWidth="46" strokeLinecap="round" fill="none" />
        <circle cx={hx} cy={hy} r="32" fill={skin} stroke={OUT} strokeWidth="7" />
        {brace && <g transform={`translate(${hx - 4} ${hy + 40}) rotate(${arm > 0.5 ? 0 : 0})`}><Brace s={0.26} color={brace} text={btext} glow={bglow} shake={bshake} foil={bfoil} /></g>}
      </g>}
      {/* шея и голова */}
      <rect x="-26" y="90" width="52" height="60" fill={skin} stroke={OUT} strokeWidth="7" />
      {style === 'long' && <path d="M-132 0 Q -170 200 -110 300 L 110 300 Q 170 200 132 0 Z" fill={hair} stroke={OUT} strokeWidth="8" />}
      <ellipse cx="0" cy="0" rx={wide ? 150 : 128} ry="118" fill={skin} stroke={OUT} strokeWidth="8" />
      {/* волосы */}
      {style === 'short' && <path d="M-128 -10 Q -140 -130 0 -128 Q 140 -130 128 -10 Q 96 -70 20 -64 Q -60 -92 -128 -10 Z" fill={hair} stroke={OUT} strokeWidth="7" strokeLinejoin="round" />}
      {style === 'spike' && <path d="M-128 -10 L -110 -120 L -70 -80 L -40 -150 L 0 -92 L 40 -150 L 70 -80 L 112 -120 L 128 -10 Q 96 -60 0 -54 Q -90 -60 -128 -10 Z" fill={hair} stroke={OUT} strokeWidth="7" strokeLinejoin="round" />}
      {style === 'bald' && <g><circle cx="-124" cy="-8" r="26" fill={hair} stroke={OUT} strokeWidth="6" /><circle cx="124" cy="-8" r="26" fill={hair} stroke={OUT} strokeWidth="6" /></g>}
      {style === 'bun' && <g><circle cx="0" cy="-150" r="42" fill={hair} stroke={OUT} strokeWidth="7" /><path d="M-128 -6 Q -134 -130 0 -126 Q 134 -130 128 -6 Q 90 -66 0 -62 Q -90 -66 -128 -6 Z" fill={hair} stroke={OUT} strokeWidth="7" /></g>}
      {style === 'long' && <path d="M-130 0 Q -140 -132 0 -128 Q 140 -132 130 0 Q 80 -74 0 -66 Q -80 -74 -130 0 Z" fill={hair} stroke={OUT} strokeWidth="7" />}
      {style === 'hat' && <g><rect x="-96" y="-250" width="192" height="150" rx="14" fill="#3b2f6e" stroke={OUT} strokeWidth="8" /><rect x="-96" y="-150" width="192" height="26" fill={C.gold} /><rect x="-160" y="-110" width="320" height="30" rx="15" fill="#3b2f6e" stroke={OUT} strokeWidth="8" /></g>}
      {style === 'cap' && <g><path d="M-128 -20 Q -120 -140 0 -140 Q 120 -140 128 -20 Z" fill={C.red} stroke={OUT} strokeWidth="7" /><path d="M-20 -30 Q 100 -50 190 -20 L 186 0 Q 90 -14 -20 -4 Z" fill={C.red} stroke={OUT} strokeWidth="7" /></g>}
      {/* лицо */}
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`translate(${sd * 48} ${-6})`}>
          <ellipse rx="30" ry={36 * blink} fill="#fff" stroke={OUT} strokeWidth="5" />
          <circle cx={look * 10 * (flip ? -1 : 1)} cy={lookY * 10} r={13 * (blink > 0.5 ? 1 : 0.3)} fill={OUT} />
          <circle cx={look * 10 * (flip ? -1 : 1) + 4} cy={lookY * 10 - 5} r="4" fill="#fff" />
          <path d={`M${-34} ${-48 - brow * 8 + sd * brow * 5 * 0} L ${34} ${-52 - brow * 8 + sd * -brow * 6}`} stroke={OUT} strokeWidth="9" strokeLinecap="round" transform={`scale(${sd} 1)`} />
        </g>
      ))}
      {glass && <g fill="none" stroke={OUT} strokeWidth="7"><circle cx="-48" cy="-6" r="42" /><circle cx="48" cy="-6" r="42" /><path d="M-8 -8 h 16" /></g>}
      {cheek && <g fill="#ff8aa0" opacity="0.55"><ellipse cx="-86" cy="40" rx="18" ry="11" /><ellipse cx="86" cy="40" rx="18" ry="11" /></g>}
      {stache && <path d="M-60 36 Q -30 8 0 30 Q 30 8 60 36 Q 30 58 0 42 Q -30 58 -60 36 Z" fill={hair === '#3a2a22' ? '#d8d8d8' : hair} stroke={OUT} strokeWidth="6" />}
      {/* рот */}
      <g transform="translate(0 60)">
        {mouth === 'smile' && <path d="M-34 -6 Q 0 28 34 -6" fill="none" stroke={OUT} strokeWidth="8" strokeLinecap="round" />}
        {mouth === 'grin' && <path d="M-44 -8 Q 0 52 44 -8 Z" fill="#fff" stroke={OUT} strokeWidth="7" strokeLinejoin="round" />}
        {mouth === 'flat' && <path d="M-26 6 H 26" stroke={OUT} strokeWidth="8" strokeLinecap="round" />}
        {mouth === 'worry' && <path d="M-30 14 Q 0 -14 30 14" fill="none" stroke={OUT} strokeWidth="8" strokeLinecap="round" />}
        {mouth === 'o' && <ellipse cy="6" rx="20" ry="26" fill="#6b1d2a" stroke={OUT} strokeWidth="7" />}
        {mouth === 'open' && <path d="M-40 -8 Q 0 70 40 -8 Z" fill="#6b1d2a" stroke={OUT} strokeWidth="7" strokeLinejoin="round" />}
        {mouth === 'talk' && <ellipse cy={4 + talk * 4} rx={26 + talk * 8} ry={6 + talk * 26} fill="#6b1d2a" stroke={OUT} strokeWidth="7" />}
      </g>
      {sweat > 0 && <path d="M120 -60 q 14 28 0 40 q -14 -12 0 -40 Z" fill="#9fe0ff" stroke={OUT} strokeWidth="4" transform={`translate(0 ${sweat * 50})`} />}
    </g>
  );
};

// ---------- фоны ----------
export const Sky: React.FC<{t: number; night?: boolean; dusk?: boolean}> = ({t, night, dusk}) => (
  <g>
    <defs>
      <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={night ? C.night1 : dusk ? '#ff9a5a' : C.sky1} /><stop offset="1" stopColor={night ? C.night2 : dusk ? '#ffe0a8' : C.sky2} /></linearGradient>
    </defs>
    <rect width="1080" height="1920" fill="url(#skyG)" />
    {night ? Array.from({length: 40}).map((_, i) => <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 9) * 900} r={2 + rnd(i + 4) * 4} fill="#fff" opacity={0.5 + 0.5 * Math.sin(t * 3 + i)} />)
      : <circle cx="180" cy="300" r="110" fill="#fff6a8" stroke="#ffe066" strokeWidth="14" />}
    {night && <circle cx="860" cy="300" r="100" fill="#fff9d6" />}
    {[0, 1, 2, 3].map((i) => {
      const cx = ((rnd(i + 20) * 1500 + t * (14 + i * 6)) % 1500) - 200; const cy = 220 + i * 190;
      return <g key={i} transform={`translate(${cx} ${cy})`} opacity={night ? 0.15 : 0.95}><ellipse rx="120" ry="42" fill="#fff" /><ellipse cx="-60" cy="12" rx="70" ry="34" fill="#fff" /><ellipse cx="70" cy="14" rx="80" ry="36" fill="#fff" /></g>;
    })}
  </g>
);

export const Tower: React.FC<{x: number; y: number; s?: number; t: number; light?: 'blink' | 'red' | 'off' | 'yellow'; night?: boolean}> = ({x, y, s = 1, t, light = 'blink', night}) => {
  const on = light === 'blink' ? Math.sin(t * 7) > 0 : light !== 'off';
  const col = light === 'red' ? C.red : '#ffe34a';
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-110 0 L -70 -520 L 70 -520 L 110 0 Z" fill="#8a7bd6" stroke={OUT} strokeWidth="9" strokeLinejoin="round" />
      {[0, 1, 2, 3].map((i) => <rect key={i} x="-26" y={-440 + i * 110} width="52" height="60" rx="10" fill={night ? '#ffe9a0' : '#d6f1ff'} stroke={OUT} strokeWidth="6" />)}
      <rect x="-90" y="-570" width="180" height="60" rx="16" fill="#5b4cae" stroke={OUT} strokeWidth="8" />
      <path d="M-5 -570 V -700" stroke={OUT} strokeWidth="9" />
      {on && <circle cx="0" cy="-640" r="150" fill={col} opacity="0.35" />}
      <circle cx="0" cy="-640" r="52" fill={on ? col : '#6b6b7a'} stroke={OUT} strokeWidth="8" />
    </g>
  );
};

export const House: React.FC<{x: number; y: number; w?: number; h?: number; c?: string; night?: boolean}> = ({x, y, w = 240, h = 260, c = '#ff9f6a', night}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2} y={-h} width={w} height={h} rx="10" fill={c} stroke={OUT} strokeWidth="8" />
    <path d={`M${-w / 2 - 20} ${-h} L 0 ${-h - 110} L ${w / 2 + 20} ${-h} Z`} fill="#c9475b" stroke={OUT} strokeWidth="8" strokeLinejoin="round" />
    <rect x={-w / 2 + 34} y={-h + 50} width="60" height="70" rx="8" fill={night ? '#ffe9a0' : '#d6f1ff'} stroke={OUT} strokeWidth="6" />
    <rect x={w / 2 - 94} y={-h + 50} width="60" height="70" rx="8" fill={night ? '#ffe9a0' : '#d6f1ff'} stroke={OUT} strokeWidth="6" />
    <rect x="-34" y="-100" width="68" height="100" rx="10" fill="#6b3f2a" stroke={OUT} strokeWidth="6" />
  </g>
);

export const Street: React.FC<{t: number; night?: boolean; red?: number; towerLight?: 'blink' | 'red' | 'off' | 'yellow'; shift?: number}> = ({t, night, red = 0, towerLight = 'blink', shift = 0}) => (
  <g>
    <Sky t={t} night={night} />
    <g transform={`translate(${shift * 0.3} 0)`}>
      <House x={140} y={1180} w={220} h={240} c={night ? '#6a5aa8' : '#ffb27a'} night={night} />
      <House x={420} y={1200} w={200} h={200} c={night ? '#4a6aa8' : '#7ad9a6'} night={night} />
      <Tower x={780} y={1260} t={t} light={towerLight} night={night} />
      <House x={1010} y={1200} w={200} h={220} c={night ? '#a85a8a' : '#ffe07a'} night={night} />
    </g>
    <rect y="1240" width="1080" height="700" fill={night ? '#2a3050' : '#7c8bb0'} />
    <rect y="1240" width="1080" height="40" fill={night ? '#3b4470' : '#a8b4d4'} stroke={OUT} strokeWidth="6" />
    {Array.from({length: 7}).map((_, i) => <rect key={i} x={i * 190 - ((t * 60) % 190) * 0 - 20} y="1560" width="110" height="16" rx="8" fill="#fff" opacity="0.7" />)}
    {red > 0 && <rect width="1080" height="1920" fill={C.red} opacity={0.25 * red} />}
  </g>
);

export const Room: React.FC<{c1?: string; c2?: string; window?: boolean; t?: number; night?: boolean}> = ({c1 = '#ffd58a', c2 = '#c68a4e', window: win = true, t = 0, night}) => (
  <g>
    <rect width="1080" height="1920" fill={c1} />
    {Array.from({length: 8}).map((_, i) => <circle key={i} cx={90 + (i % 4) * 300} cy={150 + Math.floor(i / 4) * 300 + (i % 2) * 140} r="22" fill="#fff" opacity="0.25" />)}
    <rect y="1380" width="1080" height="540" fill={c2} />
    <rect y="1380" width="1080" height="20" fill="#00000030" />
    {win && <g><rect x="640" y="260" width="300" height="360" rx="20" fill={night ? '#1a2250' : '#bfe9ff'} stroke={OUT} strokeWidth="9" /><path d="M790 260 V 620 M640 440 H 940" stroke={OUT} strokeWidth="8" />
      {night && <circle cx="740" cy="360" r="34" fill="#fff9d6" />}</g>}
  </g>
);

export const Coin: React.FC<{x: number; y: number; s?: number; t?: number; rot?: number}> = ({x, y, s = 1, t = 0, rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}><ellipse rx={50 * Math.abs(Math.cos(t * 5))} ry="50" fill={C.gold} stroke={OUT} strokeWidth="7" /><text y="18" textAnchor="middle" fontFamily={TITAN} fontSize="48" fill="#b86c00" opacity={Math.abs(Math.cos(t * 5))}>W</text></g>
);

export const Hand: React.FC<{x: number; y: number; s?: number; fingers?: number; rot?: number; skin?: string}> = ({x, y, s = 1, fingers = 5, rot = 0, skin = C.skin}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x="-90" y="40" width="180" height="300" rx="50" fill={skin} stroke={OUT} strokeWidth="8" />
    <rect x="-108" y="-20" width="216" height="200" rx="60" fill={skin} stroke={OUT} strokeWidth="8" />
    {[-72, -26, 20, 66].map((fx, i) => {
      const up = i < fingers - 1; const hgt = up ? 150 + (i === 1 ? 20 : 0) : 30;
      return <rect key={i} x={fx - 22} y={-20 - hgt} width="44" height={hgt + 30} rx="22" fill={skin} stroke={OUT} strokeWidth="7" />;
    })}
    <rect x={-170} y={20} width={70} height={fingers >= 5 ? 130 : 40} rx="30" fill={skin} stroke={OUT} strokeWidth="7" transform="rotate(-30 -130 100)" />
  </g>
);
