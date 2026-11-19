import React from 'react';

export const INK = '#10141b';
export const P = {
  skin: '#f2c3a1', skinShade: '#d79f7c', hair: '#2f2024', hairHi: '#5a3f46',
  hood: '#8b72c8', hoodShade: '#6c57a8', pants: '#3a3f66',
  momHair: '#5b3d33', momCard: '#6f8fa8', momCardShade: '#58758c', apron: '#e9d9b8', momSkin: '#e4b595',
  accent: '#ff8a1f', warm: '#ffd98a', cold: '#9fd8ff',
};
export const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const mod = (a: number, b: number) => ((a % b) + b) % b;

// Общие градиенты/паттерны — вставляется в каждый <svg>
export const Defs: React.FC = () => (
  <defs>
    <pattern id="wp" width="90" height="90" patternUnits="userSpaceOnUse">
      <rect width="90" height="90" fill="#1d2636" />
      <path d="M45 8 L 62 45 L 45 82 L 28 45 Z" fill="none" stroke="#2a3447" strokeWidth="3" />
      <circle cx="45" cy="45" r="4" fill="#2a3447" /><circle cx="0" cy="0" r="3" fill="#2a3447" /><circle cx="90" cy="90" r="3" fill="#2a3447" />
    </pattern>
    <pattern id="tile" width="90" height="90" patternUnits="userSpaceOnUse">
      <rect width="90" height="90" fill="#dfe6e3" /><rect x="3" y="3" width="84" height="84" rx="4" fill="#eef3f0" />
      <path d="M10 14 H 40" stroke="#fff" strokeWidth="4" opacity="0.8" />
    </pattern>
    <pattern id="tileDark" width="80" height="80" patternUnits="userSpaceOnUse">
      <rect width="80" height="80" fill="#3d5662" /><rect x="3" y="3" width="74" height="74" rx="4" fill="#4a6674" />
      <path d="M10 14 H 34" stroke="#7fa0ad" strokeWidth="3" opacity="0.6" />
    </pattern>
    <pattern id="planks" width="1080" height="70" patternUnits="userSpaceOnUse">
      <rect width="1080" height="70" fill="#2a2a33" /><rect y="66" width="1080" height="4" fill="#15151c" />
      <path d="M200 0 V 66 M560 0 V 66 M880 0 V 66" stroke="#15151c" strokeWidth="3" />
    </pattern>
    <filter id="cyanTint"><feColorMatrix type="matrix" values="0.55 0 0 0 0  0.3 0.9 0.3 0 0.05  0.3 0.3 1 0 0.1  0 0 0 1 0" /></filter>
    <linearGradient id="moonSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#101a30" /><stop offset="1" stopColor="#2b3d5c" /></linearGradient>
    <radialGradient id="vigD" cx="0.5" cy="0.5" r="0.75"><stop offset="0.45" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.78" /></radialGradient>
    <radialGradient id="warmGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffd98a" stopOpacity="0.55" /><stop offset="1" stopColor="#ffd98a" stopOpacity="0" /></radialGradient>
    <radialGradient id="coldGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#9fd8ff" stopOpacity="0.5" /><stop offset="1" stopColor="#9fd8ff" stopOpacity="0" /></radialGradient>
    <linearGradient id="upGlow" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#dff3ff" stopOpacity="0.55" /><stop offset="1" stopColor="#dff3ff" stopOpacity="0" /></linearGradient>
  </defs>
);

// ================= ЛИЦО ДЕВУШКИ =================
export type Mouth = 'closed' | 'worry' | 'open' | 'o' | 'hidden';
export const GirlFace: React.FC<{
  lookX?: number; lookY?: number; blink?: number; mouth?: Mouth; brow?: number; sweat?: number; pupil?: number; tear?: number;
}> = ({lookX = 0, lookY = 0, blink = 0, mouth = 'closed', brow = 0, sweat = 0, pupil = 1, tear = 0}) => (
  <g>
    <defs><clipPath id="gClip"><ellipse cx="0" cy="0" rx="230" ry="260" /></clipPath></defs>
    {/* волосы сзади */}
    <path d="M-256 -40 C -318 120 -300 320 -236 450 L 236 450 C 300 320 318 120 256 -40 Z" fill={P.hair} />
    <path d="M-290 120 Q -280 300 -232 420 M 290 120 Q 280 300 232 420 M-250 200 Q -245 320 -200 420" stroke={P.hairHi} strokeWidth="6" fill="none" opacity="0.6" strokeLinecap="round" />
    {/* голова */}
    <ellipse cx="0" cy="0" rx="230" ry="260" fill={P.skin} />
    <g clipPath="url(#gClip)">
      <path d="M40 -280 C 120 -120, 120 120, 40 280 L 300 280 L 300 -280 Z" fill={P.skinShade} opacity="0.5" />
      {/* чёлка */}
      <path d="M-248 -10 C -262 -262 -60 -304 30 -298 C 196 -290 262 -200 248 -10 C 204 -118 150 -104 96 -146 C 60 -72 -18 -112 -74 -150 C -112 -92 -190 -94 -248 -10 Z" fill={P.hair} />
      <path d="M-150 -240 Q -110 -190 -100 -140 M-20 -270 Q 10 -210 10 -150 M120 -250 Q 150 -200 140 -140" stroke={P.hairHi} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.8" />
    </g>
    {/* заколка */}
    <g transform="translate(150 -150) rotate(20)"><rect x="-34" y="-10" width="68" height="20" rx="10" fill={P.accent} stroke={INK} strokeWidth="3" /><circle cx="-20" cy="0" r="4" fill="#fff" /><circle cx="0" cy="0" r="4" fill="#fff" /><circle cx="20" cy="0" r="4" fill="#fff" /></g>
    {/* веснушки и румянец */}
    <ellipse cx="-124" cy="96" rx="40" ry="22" fill="#ff8f7a" opacity="0.3" /><ellipse cx="124" cy="96" rx="40" ry="22" fill="#c2685a" opacity="0.26" />
    {Array.from({length: 14}).map((_, i) => <circle key={i} cx={(i % 2 ? 1 : -1) * (70 + rnd(i) * 70)} cy={52 + rnd(i + 3) * 38} r={2.6 + rnd(i + 7) * 2} fill="#b9714f" opacity="0.65" />)}
    {/* брови */}
    <path d={`M-150 ${-66 + brow} Q -96 ${-98 + brow * 1.6} -42 ${-68 - brow}`} stroke={P.hair} strokeWidth="13" strokeLinecap="round" fill="none" />
    <path d={`M42 ${-68 - brow} Q 96 ${-98 + brow * 1.6} 150 ${-66 + brow}`} stroke={P.hair} strokeWidth="13" strokeLinecap="round" fill="none" />
    {/* глаза */}
    {[-92, 92].map((x) => (
      <g key={x} transform={`translate(${x} -8)`}>
        <ellipse cx="0" cy="0" rx="46" ry={40 * (1 - blink)} fill="#fff" />
        <ellipse cx={lookX} cy={lookY} rx="23" ry={23 * (1 - blink)} fill="#6b4630" />
        <ellipse cx={lookX} cy={lookY} rx={12 * pupil} ry={12 * pupil * (1 - blink)} fill={INK} />
        <circle cx={lookX + 8} cy={lookY - 9} r="6" fill="#fff" opacity={1 - blink} />
        <circle cx={lookX - 8} cy={lookY + 8} r="3" fill="#fff" opacity={(1 - blink) * 0.8} />
        <path d={`M${-46} ${-4 + blink * 18} Q 0 ${-52 + blink * 34} ${46} ${-4 + blink * 18}`} stroke={INK} strokeWidth="7" fill="none" strokeLinecap="round" />
        {/* ресницы */}
        {(x < 0 ? [[-46, -6, -64, -22], [-40, -22, -54, -40], [-28, -34, -36, -54]] : [[46, -6, 64, -22], [40, -22, 54, -40], [28, -34, 36, -54]]).map(([a, b, c, d], i) => (
          <path key={i} d={`M${a} ${b + blink * 18} L ${c} ${d + blink * 18}`} stroke={INK} strokeWidth="5" strokeLinecap="round" />
        ))}
        <path d="M-40 40 Q 0 62 40 40" stroke="#c28a68" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.7" />
      </g>
    ))}
    {tear > 0 && <path d="M-110 40 Q -118 100 -108 150" stroke="#bfe6ff" strokeWidth="9" fill="none" strokeLinecap="round" opacity={tear} />}
    {/* нос */}
    <path d="M-6 52 Q 14 84 -10 92" stroke="#c28a68" strokeWidth="9" strokeLinecap="round" fill="none" />
    {/* рот */}
    {mouth === 'closed' && <path d="M-46 160 Q 0 182 46 160" stroke="#b8504c" strokeWidth="14" strokeLinecap="round" fill="none" />}
    {mouth === 'worry' && <path d="M-46 176 Q 0 146 46 176" stroke="#b8504c" strokeWidth="14" strokeLinecap="round" fill="none" />}
    {mouth === 'o' && <ellipse cx="0" cy="168" rx="20" ry="26" fill="#6a2328" />}
    {mouth === 'open' && <g><ellipse cx="0" cy="170" rx="40" ry="32" fill="#6a2328" /><path d="M-26 152 Q 0 144 26 152 L 22 162 L -22 162 Z" fill="#fff" /></g>}
    {sweat > 0 && <path d="M200 -70 Q 218 -34 200 -16 Q 182 -34 200 -70 Z" fill="#bfe6ff" stroke="#6fa8d6" strokeWidth="3" transform={`translate(0 ${sweat * 80})`} opacity={1 - sweat * 0.5} />}
  </g>
);

// Палец у губ
export const FingerOnLips: React.FC = () => (
  <g transform="translate(0 150)">
    <rect x="-24" y="-30" width="48" height="300" rx="24" fill={P.skin} stroke="#b57d5a" strokeWidth="5" />
    <path d="M-14 -22 q 14 -10 28 0" stroke="#e48a8a" strokeWidth="8" fill="none" strokeLinecap="round" />
    <path d="M-6 40 H 6 M-6 70 H 6" stroke="#c28a68" strokeWidth="4" />
    <ellipse cx="0" cy="290" rx="110" ry="80" fill={P.skin} stroke="#b57d5a" strokeWidth="5" />
    {[-70, -35, 0, 35].map((x) => <path key={x} d={`M${x + 30} 240 q 0 40 -14 56`} stroke="#c28a68" strokeWidth="5" fill="none" strokeLinecap="round" />)}
  </g>
);

// Худи (плечи, шея), для крупных планов; начало координат = центр головы
export const GirlShoulders: React.FC<{t?: number}> = ({t = 0}) => (
  <g>
    <ellipse cx="0" cy="340" rx="260" ry="130" fill={P.hoodShade} />
    <rect x="-70" y="200" width="140" height="170" rx="40" fill={P.skinShade} />
    <path d="M-340 560 Q -320 340 -96 322 L 0 400 L 96 322 Q 320 340 340 560 L 340 1300 L -340 1300 Z" fill={P.hood} />
    <path d="M70 336 Q 320 346 340 560 L 340 1300 L 70 1300 Z" fill={P.hoodShade} opacity="0.7" />
    <path d="M-96 322 L 0 400 L 96 322 Q 0 304 -96 322 Z" fill="#4f3f86" />
    <path d="M-40 408 L -34 640 M 40 408 L 34 640" stroke="#efe9ff" strokeWidth="10" strokeLinecap="round" />
    <circle cx="-34" cy="646" r="9" fill="#cfc7e8" /><circle cx="34" cy="646" r="9" fill="#cfc7e8" />
    <g stroke="#53428f" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.8">
      <path d="M-230 660 Q -190 720 -210 800" /><path d="M-170 780 Q -120 840 -150 920" /><path d="M200 640 Q 250 720 220 810" /><path d="M-70 900 Q 0 940 70 900" />
    </g>
    <path d="M-300 620 V 1300 M300 620 V 1300" stroke="#53428f" strokeWidth="4" strokeDasharray="14 10" opacity="0.7" />
    <rect x="-50" y="900" width="100" height="60" rx="14" fill="#a894e0" stroke="#53428f" strokeWidth="4" />
    <path d="M0 912 l 8 16 l 18 3 l -13 13 l 3 18 l -16 -9 l -16 9 l 3 -18 l -13 -13 l 18 -3 Z" fill="#fff" opacity="0.9" />
  </g>
);

// Девушка со спины (в полный рост). Ступни в (0,0), высота ~900. Идёт: walk — фаза шага
export const GirlBack: React.FC<{walk?: number; amp?: number; tilt?: number}> = ({walk = 0, amp = 0, tilt = 0}) => {
  const a = Math.sin(walk) * 26 * amp;
  const bob = Math.abs(Math.cos(walk)) * 8 * amp;
  return (
    <g transform={`translate(0 ${-bob})`}>
      <ellipse cx="0" cy={bob + 6} rx="150" ry="26" fill="#000" opacity="0.35" />
      {/* ноги в пижаме */}
      <rect x="-82" y={-340} width="70" height={340 + a * 0.6} rx="30" fill={P.pants} />
      <rect x="12" y={-340} width="70" height={340 - a * 0.6} rx="30" fill={P.pants} />
      <path d="M-82 -240 H -12 M12 -240 H 82 M-82 -160 H -12 M12 -160 H 82" stroke="#4c5285" strokeWidth="8" />
      <ellipse cx="-47" cy={4 + a * 0.6} rx="48" ry="22" fill="#f2d7e3" /><ellipse cx="47" cy={4 - a * 0.6} rx="48" ry="22" fill="#f2d7e3" />
      {/* спина */}
      <rect x="-190" y="-640" width="62" height="300" rx="30" fill={P.hoodShade} transform={`rotate(${a * 0.4} -160 -620)`} />
      <rect x="128" y="-640" width="62" height="300" rx="30" fill={P.hoodShade} transform={`rotate(${-a * 0.4} 160 -620)`} />
      <path d="M-150 -640 Q 0 -690 150 -640 L 160 -300 Q 0 -270 -160 -300 Z" fill={P.hood} />
      <path d="M-110 -660 Q 0 -560 110 -660 Q 100 -600 0 -560 Q -100 -600 -110 -660 Z" fill={P.hoodShade} />
      <path d="M0 -580 V -330" stroke="#53428f" strokeWidth="5" strokeDasharray="12 8" />
      {/* голова и длинные волосы */}
      <g transform={`rotate(${tilt} 0 -700)`}>
        <ellipse cx="0" cy="-780" rx="118" ry="128" fill={P.hair} />
        <path d="M-116 -780 Q -130 -620 -90 -560 L 90 -560 Q 130 -620 116 -780" fill={P.hair} />
        <path d="M-60 -840 Q -40 -700 -50 -580 M 0 -860 Q 10 -700 0 -570 M 60 -840 Q 50 -700 55 -580" stroke={P.hairHi} strokeWidth="5" fill="none" opacity="0.7" strokeLinecap="round" />
        <g transform="translate(60 -850) rotate(20)"><rect x="-22" y="-7" width="44" height="14" rx="7" fill={P.accent} /></g>
      </g>
    </g>
  );
};

// Мама со спины. Ступни в (0,0), высота ~930
export const MomBack: React.FC<{t?: number}> = ({t = 0}) => {
  const br = 1 + Math.sin(t * 1.6) * 0.004;
  return (
    <g transform={`scale(1 ${br})`} >
      <ellipse cx="0" cy="8" rx="170" ry="28" fill="#000" opacity="0.35" />
      {/* юбка и ноги */}
      <path d="M-120 -420 L -150 -110 L 150 -110 L 120 -420 Z" fill="#41485e" />
      <path d="M-100 -330 L -110 -120 M -30 -340 L -34 -120 M 40 -340 L 44 -120 M 110 -330 L 118 -120" stroke="#2f364a" strokeWidth="5" />
      <rect x="-80" y="-130" width="50" height="120" rx="20" fill="#e4b595" /><rect x="30" y="-130" width="50" height="120" rx="20" fill="#e4b595" />
      <ellipse cx="-56" cy="-4" rx="52" ry="24" fill="#b5665a" /><ellipse cx="56" cy="-4" rx="52" ry="24" fill="#b5665a" />
      {/* кардиган */}
      <path d="M-150 -700 Q 0 -750 150 -700 L 130 -400 Q 0 -370 -130 -400 Z" fill={P.momCard} />
      <path d="M40 -710 Q 150 -700 150 -700 L 130 -400 Q 70 -390 40 -392 Z" fill={P.momCardShade} opacity="0.65" />
      <rect x="-178" y="-700" width="56" height="280" rx="28" fill={P.momCard} /><rect x="122" y="-700" width="56" height="280" rx="28" fill={P.momCardShade} />
      <path d="M0 -690 V -400" stroke="#4a6378" strokeWidth="5" strokeDasharray="12 8" />
      {/* фартук: завязки и бант */}
      <path d="M-132 -520 Q 0 -480 132 -520" stroke={P.apron} strokeWidth="14" fill="none" />
      <path d="M0 -500 Q -50 -520 -60 -470 Q -30 -480 0 -500 Q 40 -540 70 -490 Q 30 -480 0 -500" fill={P.apron} stroke="#b59d70" strokeWidth="3" />
      <path d="M-6 -496 Q -30 -430 -44 -380 M 6 -496 Q 30 -430 40 -370" stroke={P.apron} strokeWidth="12" fill="none" strokeLinecap="round" />
      {/* шея, голова, каре */}
      <rect x="-40" y="-800" width="80" height="120" rx="24" fill={P.momSkin} />
      <ellipse cx="-104" cy="-830" rx="18" ry="26" fill={P.momSkin} /><ellipse cx="104" cy="-830" rx="18" ry="26" fill={P.momSkin} />
      <circle cx="-104" cy="-798" r="8" fill="#e8d28a" /><circle cx="104" cy="-798" r="8" fill="#e8d28a" />
      <ellipse cx="0" cy="-850" rx="106" ry="118" fill={P.momHair} />
      <path d="M-106 -850 Q -118 -760 -86 -720 L 86 -720 Q 118 -760 106 -850" fill={P.momHair} />
      <path d="M-60 -930 Q -40 -820 -50 -730 M 0 -950 Q 8 -830 0 -724 M 60 -930 Q 50 -820 56 -730" stroke="#7a5648" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M-30 -900 Q -20 -840 -26 -800 M 36 -910 Q 30 -850 34 -810" stroke="#b8b0a8" strokeWidth="4" fill="none" opacity="0.8" strokeLinecap="round" />
    </g>
  );
};

// ================= ПРЕДМЕТЫ =================
export const Cup: React.FC<{steam?: number; t?: number; rattle?: number; s?: number}> = ({steam = 0, t = 0, rattle = 0, s = 1}) => {
  const dx = Math.sin(t * 60) * rattle * 4;
  return (
    <g transform={`translate(${dx} 0) scale(${s})`}>
      <ellipse cx="0" cy="8" rx="84" ry="16" fill="#000" opacity="0.3" />
      <ellipse cx="0" cy="-2" rx="78" ry="14" fill="#cfc7b6" stroke={INK} strokeWidth="3" />
      <path d="M-62 -110 L -52 -8 Q 0 14 52 -8 L 62 -110 Z" fill="#efe9db" stroke={INK} strokeWidth="4" />
      <path d="M-58 -70 L -54 -40 Q 0 -22 54 -40 L 58 -70 Q 0 -52 -58 -70 Z" fill="#d9482b" opacity="0.8" />
      <path d="M62 -96 Q 112 -92 100 -54 Q 90 -30 56 -34" stroke={INK} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M62 -96 Q 108 -92 96 -56 Q 88 -34 56 -36" stroke="#efe9db" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="0" cy="-110" rx="62" ry="14" fill="#a96a36" stroke={INK} strokeWidth="4" />
      <ellipse cx="-14" cy="-112" rx="26" ry="4" fill="#d9a06a" opacity="0.6" />
      {[0, 1, 2].map((k) => {
        const p = mod(t * 0.6 + k / 3, 1);
        return <path key={k} d={`M${-26 + k * 26} -120 q ${14 * Math.sin(p * 7 + k)} -26 0 -52`} stroke="#dfe8ff" strokeWidth="6" strokeLinecap="round" fill="none" opacity={steam * 0.6 * (1 - p)} transform={`translate(0 ${-p * 70})`} />;
      })}
    </g>
  );
};

export const Key: React.FC<{glow?: number; t?: number}> = ({glow = 0, t = 0}) => (
  <g>
    <ellipse cx="0" cy="40" rx="230" ry="26" fill="#000" opacity="0.4" />
    {glow > 0 && <ellipse cx="0" cy="0" rx={260 + Math.sin(t * 8) * 8} ry="120" fill="url(#warmGlow)" opacity={glow} />}
    {/* цепочка и брелок-зайчик */}
    <path d="M-150 -10 Q -220 30 -250 -20 Q -280 -60 -330 -30" stroke="#c9c2b0" strokeWidth="6" fill="none" />
    <g transform="translate(-350 -30) rotate(-20)">
      <ellipse cx="-12" cy="-52" rx="13" ry="34" fill="#f4dce4" stroke={INK} strokeWidth="3" /><ellipse cx="14" cy="-52" rx="13" ry="34" fill="#f4dce4" stroke={INK} strokeWidth="3" />
      <circle cx="0" cy="0" r="34" fill="#f4dce4" stroke={INK} strokeWidth="3" />
      <circle cx="-11" cy="-4" r="4" fill={INK} /><circle cx="11" cy="-4" r="4" fill={INK} /><path d="M-6 8 Q 0 14 6 8" stroke={INK} strokeWidth="3" fill="none" />
    </g>
    {/* ключ */}
    <circle cx="-110" cy="0" r="46" fill="none" stroke="#d9a441" strokeWidth="18" />
    <rect x="-70" y="-12" width="250" height="24" rx="10" fill="#d9a441" stroke={INK} strokeWidth="3" />
    <path d="M120 12 V 52 H 144 V 12 M 152 12 V 40 H 172 V 12" fill="#d9a441" stroke={INK} strokeWidth="3" />
    <path d="M-60 -6 H 160" stroke="#f3d27a" strokeWidth="5" opacity="0.8" />
  </g>
);

export const Waves: React.FC<{x: number; y: number; t: number; color?: string; n?: number; maxR?: number; width?: number}> = ({x, y, t, color = '#fff', n = 4, maxR = 280, width = 8}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const p = mod(t * 0.9 + i / n, 1);
      return <circle key={i} cx={x} cy={y} r={20 + p * maxR} fill="none" stroke={color} strokeWidth={width * (1 - p * 0.6)} opacity={(1 - p) * 0.8} />;
    })}
  </g>
);

export const Eye: React.FC<{t: number; look?: number}> = ({t, look = 0}) => {
  const blink = mod(t, 2.6) > 2.5 ? 0.9 : 0;
  return (
    <g>
      <ellipse cx="0" cy="0" rx="160" ry={120 * (1 - blink)} fill="#e9f0dc" stroke="#16200f" strokeWidth="6" />
      {Array.from({length: 12}).map((_, i) => { const a = (i / 12) * Math.PI * 2; return <path key={i} d={`M${Math.cos(a) * 150} ${Math.sin(a) * 110} Q ${Math.cos(a) * 100} ${Math.sin(a) * 70} ${Math.cos(a) * 62} ${Math.sin(a) * 44}`} stroke="#c23b3b" strokeWidth="3" fill="none" opacity="0.6" />; })}
      <circle cx={look * 30 + Math.sin(t * 5) * 3} cy={Math.cos(t * 4) * 3} r="62" fill="#b9d6a0" stroke="#16200f" strokeWidth="4" />
      <circle cx={look * 30 + Math.sin(t * 5) * 3} cy={Math.cos(t * 4) * 3} r="22" fill="#05070a" />
      <circle cx={look * 30 + 16} cy="-18" r="9" fill="#fff" opacity="0.8" />
      <path d="M-170 0 Q 0 -170 170 0" stroke="#16200f" strokeWidth="14" fill="none" />
    </g>
  );
};

export const Bunny: React.FC<{color?: string}> = ({color = '#ff9ab5'}) => (
  <g fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round">
    <path d="M-40 -100 Q -70 -250 -30 -270 Q 10 -260 -6 -100" /><path d="M20 -100 Q 30 -250 70 -262 Q 100 -240 60 -96" />
    <path d="M-60 -90 Q -90 -30 -50 10 Q 0 36 56 10 Q 96 -30 66 -90 Q 0 -120 -60 -90 Z" />
    <circle cx="-22" cy="-44" r="6" fill={color} /><circle cx="30" cy="-44" r="6" fill={color} />
    <path d="M-8 -22 Q 4 -12 14 -22" />
    <path d="M-50 10 Q -90 90 -50 150 Q 0 180 56 150 Q 96 90 56 10" />
    <path d="M-86 -20 L -130 -34 M-86 -8 L -134 0 M 94 -20 L 138 -34 M 94 -8 L 140 0" strokeWidth="8" />
    <path d="M90 120 q 30 -10 36 -40 q -30 -4 -36 40 Z" fill="#ff5a7a" stroke="#ff5a7a" strokeWidth="6" transform="translate(40 -10)" />
  </g>
);

// ================= ЛИЦО МАМЫ (жуткая улыбка) =================
export const MomFace: React.FC<{smile?: number; eyeX?: number; t?: number; stare?: number; real?: boolean; blink?: number; tear?: number; talk?: number}> = ({smile = 0, eyeX = 0, t = 0, stare = 1, real = false, blink = 0, tear = 0, talk = 0}) => {
  const teethOpen = 20 + smile * 34;
  const wob = Math.sin(t * 5) * 1.5;
  return (
    <g>
      <defs><clipPath id="mClip"><ellipse cx="0" cy="0" rx="236" ry="262" /></clipPath></defs>
      {/* каре сзади */}
      <path d="M-262 -40 C -300 120 -290 300 -240 400 L 240 400 C 290 300 300 120 262 -40 Z" fill={P.momHair} />
      <ellipse cx="0" cy="0" rx="236" ry="262" fill={P.momSkin} />
      <g clipPath="url(#mClip)">
        <path d="M40 -280 C 120 -120, 120 120, 40 280 L 300 280 L 300 -280 Z" fill="#c79672" opacity="0.5" />
        <path d="M-256 -10 C -270 -266 -60 -306 30 -300 C 200 -292 270 -200 256 -10 C 210 -130 140 -110 80 -156 C 20 -90 -70 -120 -120 -160 C -150 -100 -210 -90 -256 -10 Z" fill={P.momHair} />
        <path d="M-110 -250 Q -70 -190 -60 -140 M60 -260 Q 90 -200 80 -150" stroke="#b8b0a8" strokeWidth="5" fill="none" opacity="0.7" strokeLinecap="round" />
      </g>
      {/* серьги */}
      <circle cx="-238" cy="70" r="11" fill="#e8d28a" /><circle cx="238" cy="70" r="11" fill="#e8d28a" />
      {/* брови */}
      {real ? (<><path d="M-150 -60 Q -96 -84 -42 -96" stroke="#4a3128" strokeWidth="10" strokeLinecap="round" fill="none" /><path d="M42 -96 Q 96 -84 150 -60" stroke="#4a3128" strokeWidth="10" strokeLinecap="round" fill="none" /></>) : (<><path d="M-150 -78 Q -96 -108 -42 -80" stroke="#4a3128" strokeWidth="10" strokeLinecap="round" fill="none" /><path d="M42 -80 Q 96 -108 150 -78" stroke="#4a3128" strokeWidth="10" strokeLinecap="round" fill="none" /></>)}
      {/* морщины */}
      <path d="M-120 -128 Q 0 -150 120 -128 M-100 -112 Q 0 -128 100 -112" stroke="#b57d5a" strokeWidth="4" fill="none" opacity="0.6" />
      <path d="M-150 30 Q -130 90 -100 130 M150 30 Q 130 90 100 130" stroke="#b57d5a" strokeWidth="5" fill="none" opacity="0.7" strokeLinecap="round" />
      {/* глаза: широкие, не моргают */}
      {[-92, 92].map((x) => (
        <g key={x} transform={`translate(${x} -12)`}>
          <ellipse cx="0" cy="0" rx={real ? 46 : 50} ry={(real ? 40 : 46 * stare) * (1 - blink)} fill="#fbfbf4" stroke="#8a6a58" strokeWidth="3" />
          <circle cx={eyeX + (real ? 0 : wob)} cy="2" r={real ? 22 : 18} fill="#3a2a22" opacity={1 - blink} />
          <circle cx={eyeX + (real ? 0 : wob)} cy="2" r={real ? 11 : 7} fill="#05070a" opacity={1 - blink} />
          <circle cx={eyeX + wob + 6} cy="-6" r="4" fill="#fff" opacity="0.8" />
          <path d="M-50 -6 Q 0 -58 50 -6" stroke="#4a3128" strokeWidth="6" fill="none" />
          <path d="M-40 52 Q 0 70 40 52" stroke="#b57d5a" strokeWidth="5" fill="none" opacity="0.7" />
        </g>
      ))}
      <ellipse cx="-130" cy="104" rx="42" ry="24" fill="#e8808a" opacity="0.35" /><ellipse cx="130" cy="104" rx="42" ry="24" fill="#e8808a" opacity="0.35" />
      <path d="M-6 56 Q 16 90 -10 98" stroke="#b57d5a" strokeWidth="9" strokeLinecap="round" fill="none" />
      {real && tear > 0 && <path d="M-110 50 Q -118 110 -106 160 M110 50 Q 118 110 106 160" stroke="#bfe6ff" strokeWidth="8" fill="none" strokeLinecap="round" opacity={tear} />}
      {real ? (
        <g transform="translate(0 176)">
          {talk > 0 ? <ellipse cx="0" cy="0" rx={26 + Math.abs(Math.sin(t * 14)) * 12} ry={10 + Math.abs(Math.sin(t * 11)) * 18} fill="#5a1f1f" /> : <path d="M-52 10 Q 0 -18 52 10" stroke="#9a4a42" strokeWidth="12" fill="none" strokeLinecap="round" />}
        </g>
      ) : (
      <g transform="translate(0 168)">
        <path d={`M-126 -22 Q 0 ${teethOpen + 40} 126 -22 Q 0 ${-6 + smile * 10} -126 -22 Z`} fill="#4a1a22" stroke="#7a3b32" strokeWidth="6" />
        <path d={`M-108 -14 Q 0 ${teethOpen + 18} 108 -14 L 108 -6 Q 0 ${teethOpen + 4} -108 -6 Z`} fill="#fbfbf4" />
        {Array.from({length: 13}).map((_, i) => <line key={i} x1={-96 + i * 16} x2={-96 + i * 16} y1="-12" y2={teethOpen * 0.75} stroke="#c9c2b0" strokeWidth="2" />)}
        <path d="M-134 -26 Q -150 -50 -140 -66 M134 -26 Q 150 -50 140 -66" stroke="#7a3b32" strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>
      )}
    </g>
  );
};

// Мама по пояс: сзади, голова поворачивается (theta: 0 = спиной, 180 = лицом)
export const MomTurn: React.FC<{theta: number; t?: number; smile?: number}> = ({theta, t = 0, smile = 0}) => {
  const rad = (theta * Math.PI) / 180;
  const sx = Math.max(0.04, Math.abs(Math.cos(rad)));
  const shift = Math.sin(rad) * 40;
  return (
    <g>
      <ellipse cx="0" cy="340" rx="270" ry="130" fill={P.momCardShade} />
      <rect x="-76" y="190" width="152" height="190" rx="44" fill="#c79672" />
      <path d="M-350 620 Q -330 340 -100 322 L 0 380 L 100 322 Q 330 340 350 620 L 350 1300 L -350 1300 Z" fill={P.momCard} />
      <path d="M70 336 Q 330 346 350 620 L 350 1300 L 70 1300 Z" fill={P.momCardShade} opacity="0.7" />
      <path d="M-100 322 L 0 380 L 100 322 Q 0 304 -100 322 Z" fill="#41576a" />
      <path d="M-260 640 Q -220 720 -240 820 M 230 640 Q 270 720 250 830" stroke="#41576a" strokeWidth="6" fill="none" opacity="0.8" />
      <path d="M0 400 V 1300" stroke="#41576a" strokeWidth="4" strokeDasharray="14 10" opacity="0.7" />
      <g transform={`translate(${shift} 0) scale(${sx} 1) rotate(${Math.sin(t * 0.7) * 1.2})`}>
        {theta < 90 ? (
          <g>
            <ellipse cx="0" cy="0" rx="236" ry="262" fill={P.momHair} />
            <path d="M-236 0 Q -250 160 -210 260 L 210 260 Q 250 160 236 0" fill={P.momHair} />
            <path d="M-100 -230 Q -70 -90 -80 120 M0 -258 Q 10 -100 0 130 M100 -230 Q 80 -90 90 120" stroke="#7a5648" strokeWidth="6" fill="none" strokeLinecap="round" />
            <circle cx="-236" cy="70" r="11" fill="#e8d28a" /><circle cx="236" cy="70" r="11" fill="#e8d28a" />
          </g>
        ) : (
          <MomFace smile={smile} t={t} />
        )}
      </g>
    </g>
  );
};

// Мама спереди по пояс (настоящая): начало координат — центр головы
export const MomFront: React.FC<{t?: number; blink?: number; tear?: number; talk?: number; shake?: number; keys?: boolean}> = ({t = 0, blink = 0, tear = 0, talk = 0, shake = 1, keys = true}) => {
  const tr = Math.sin(t * 38) * 3 * shake;
  return (
    <g>
      <ellipse cx="0" cy="340" rx="270" ry="130" fill={P.momCardShade} />
      <rect x="-76" y="190" width="152" height="190" rx="44" fill="#c79672" />
      <path d="M-350 620 Q -330 340 -100 322 L 0 420 L 100 322 Q 330 340 350 620 L 350 1500 L -350 1500 Z" fill={P.momCard} />
      <path d="M70 336 Q 330 346 350 620 L 350 1500 L 70 1500 Z" fill={P.momCardShade} opacity="0.7" />
      <path d="M-100 322 L 0 420 L 100 322 Q 0 300 -100 322 Z" fill="#e8e0cc" />
      <path d="M0 420 V 1500" stroke="#41576a" strokeWidth="4" />
      {[520, 680, 840, 1000].map((y) => <circle key={y} cx="-24" cy={y} r="14" fill="#e8d28a" stroke="#41576a" strokeWidth="3" />)}
      {/* карман с ключами */}
      <path d="M-250 940 H -80 V 1100 H -250 Z" fill={P.momCardShade} stroke="#41576a" strokeWidth="5" />
      {keys && <g transform="translate(-170 940)"><path d="M0 0 L -10 -60" stroke="#d9a441" strokeWidth="18" strokeLinecap="round" /><circle cx="-12" cy="-80" r="26" fill="none" stroke="#d9a441" strokeWidth="12" /><path d="M20 0 L 40 -50" stroke="#c9c2b0" strokeWidth="6" /><g transform="translate(48 -66)"><ellipse cx="-6" cy="-22" rx="7" ry="18" fill="#f4dce4" stroke={INK} strokeWidth="3" /><ellipse cx="9" cy="-22" rx="7" ry="18" fill="#f4dce4" stroke={INK} strokeWidth="3" /><circle r="20" fill="#f4dce4" stroke={INK} strokeWidth="3" /></g></g>}
      {/* руки (бледные, трясутся) */}
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`translate(${sd * 190 + tr * sd} ${760 + tr * 0.5})`}>
          <rect x="-46" y="-120" width="92" height="300" rx="46" fill={P.momCard} />
          <rect x="-50" y="130" width="100" height="90" rx="40" fill="#efd9cf" stroke="#a8714f" strokeWidth="5" />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={-48 + i * 25} y="190" width="22" height={78 - Math.abs(i - 1.5) * 8} rx="11" fill="#efd9cf" stroke="#a8714f" strokeWidth="4" />)}
          <rect x={sd > 0 ? -66 : 44} y="150" width="22" height="64" rx="11" fill="#efd9cf" stroke="#a8714f" strokeWidth="4" transform={`rotate(${sd * 14} 0 170)`} />
        </g>
      ))}
      <MomFace real t={t} blink={blink} tear={tear} talk={talk} />
    </g>
  );
};

export const HandUp: React.FC<{t?: number; color?: string}> = ({t = 0, color = P.skin}) => (
  <g>
    <rect x="-60" y="120" width="120" height="400" rx="50" fill={P.hood} />
    <ellipse cx="0" cy="70" rx="95" ry="110" fill={color} stroke="#b57d5a" strokeWidth="6" />
    {[[-70, -10, -6], [-26, -60, -2], [22, -70, 2], [66, -40, 8]].map(([x, y, r], i) => <rect key={i} x={x - 22} y={y - 120} width="44" height="150" rx="22" fill={color} stroke="#b57d5a" strokeWidth="6" transform={`rotate(${r + Math.sin(t * 6 + i) * 1.5} ${x} ${y})`} />)}
    <rect x="-132" y="20" width="44" height="110" rx="22" fill={color} stroke="#b57d5a" strokeWidth="6" transform="rotate(-38 -110 80)" />
    <path d="M-30 90 Q 0 110 30 90" stroke="#c28a68" strokeWidth="5" fill="none" strokeLinecap="round" />
  </g>
);
