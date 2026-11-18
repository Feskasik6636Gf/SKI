import React from 'react';
import {INK, P, Waves, Cup, Eye, rnd, mod} from './Chars';

const FONT = 'Montserrat, Arial, sans-serif';

// ================= ПРИХОЖАЯ / ВХОДНАЯ ДВЕРЬ =================
export const Hall: React.FC<{t: number; lamp?: number; feet?: number; bell?: number; doorShake?: number}> = ({t, lamp = 1, feet = 0, bell = 0, doorShake = 0}) => {
  const sh = Math.sin(t * 70) * doorShake * 5;
  return (
    <g>
      <rect width="1080" height="1920" fill="#1b2433" />
      <rect width="1080" height="1180" fill="url(#wp)" />
      <rect y="860" width="1080" height="320" fill="#26334a" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={30 + i * 160} y="885" width="130" height="260" rx="6" fill="none" stroke="#1a2436" strokeWidth="6" />)}
      <rect y="850" width="1080" height="12" fill="#3a4a66" /><rect y="1150" width="1080" height="34" fill="#35445e" /><rect y="1148" width="1080" height="5" fill="#4a5c7c" />
      {/* потолочный плинтус */}
      <rect width="1080" height="30" fill="#2a3750" /><rect y="30" width="1080" height="6" fill="#161e2c" />

      {/* вешалка слева */}
      <g>
        <rect x="40" y="430" width="250" height="26" rx="8" fill="#5a3d2a" stroke={INK} strokeWidth="3" />
        {[70, 140, 210, 270].map((x) => <circle key={x} cx={x} cy="443" r="8" fill="#c9a85a" />)}
        <path d="M80 450 Q 40 640 70 880 L 150 880 Q 160 640 110 450 Z" fill="#7a3b3b" stroke={INK} strokeWidth="3" />
        <path d="M150 450 Q 120 700 150 940 L 232 940 Q 250 700 190 450 Z" fill="#3b5a7a" stroke={INK} strokeWidth="3" />
        <path d="M245 460 Q 215 560 240 600 L 280 600 Q 296 540 276 460 Z" fill="#d9a441" stroke={INK} strokeWidth="3" />
        <ellipse cx="260" cy="650" rx="34" ry="40" fill="#8a5a3c" stroke={INK} strokeWidth="3" />
        <path d="M232 670 H 290" stroke={INK} strokeWidth="3" />
        <ellipse cx="70" cy="405" rx="52" ry="18" fill="#c23b3b" stroke={INK} strokeWidth="3" /><rect x="40" y="395" width="60" height="14" rx="7" fill="#c23b3b" />
      </g>
      {/* зеркало и крючки для ключей справа */}
      <g>
        <ellipse cx="925" cy="330" rx="100" ry="150" fill="#12192a" stroke="#c9a85a" strokeWidth="12" />
        <ellipse cx="925" cy="330" rx="86" ry="136" fill="#243349" />
        <path d="M870 240 Q 890 220 930 200" stroke="#fff" strokeWidth="10" strokeLinecap="round" opacity="0.18" fill="none" />
        <rect x="830" y="560" width="190" height="56" rx="12" fill="#5a3d2a" stroke={INK} strokeWidth="3" />
        {[860, 925, 990].map((x, i) => <g key={x}><path d={`M${x} 575 v 22`} stroke="#c9a85a" strokeWidth="6" /><circle cx={x} cy="600" r="7" fill="#c9a85a" />{i !== 1 && <path d={`M${x} 607 v 34`} stroke="#9aa" strokeWidth="4" />}</g>)}
        <circle cx="925" cy="590" r="0" />
        <rect x="860" y="660" width="130" height="86" rx="8" fill="#e8e1cc" stroke={INK} strokeWidth="3" transform="rotate(3 925 700)" />
        <path d="M876 684 H 972 M876 704 H 950 M876 724 H 962" stroke="#8a8470" strokeWidth="4" />
      </g>
      {/* бра */}
      <g>
        <rect x="840" y="150" width="14" height="60" fill="#0a0e15" />
        <path d="M806 214 L 888 214 L 872 160 L 822 160 Z" fill="#e8d28a" stroke={INK} strokeWidth="3" />
      </g>

      {/* ДВЕРЬ */}
      <g transform={`translate(${sh} 0)`}>
        <rect x="280" y="170" width="520" height="990" fill="#120c09" />
        <rect x="300" y="190" width="480" height="970" fill="#4a3528" />
        {[[326, 220, 190, 350], [546, 220, 210, 350], [326, 610, 190, 450], [546, 610, 210, 450]].map(([x, y, w, h], i) => (
          <g key={i}><rect x={x} y={y} width={w} height={h} fill="#573e2f" stroke="#2a1d15" strokeWidth="5" /><rect x={x + 14} y={y + 14} width={w - 28} height={h - 28} fill="none" stroke="#6b4e3b" strokeWidth="3" /></g>
        ))}
        {Array.from({length: 18}).map((_, i) => <path key={i} d={`M${340 + rnd(i) * 420} ${240 + rnd(i + 5) * 880} q 30 6 60 0`} stroke="#3b2a1f" strokeWidth="2" opacity="0.7" />)}
        {/* петли */}
        {[250, 600, 960].map((y) => <rect key={y} x="296" y={y} width="14" height="54" fill="#c9a85a" stroke={INK} strokeWidth="2" />)}
        {/* глазок */}
        <circle cx="540" cy="440" r="22" fill="#c9a85a" stroke={INK} strokeWidth="3" /><circle cx="540" cy="440" r="11" fill="#0a0e15" /><circle cx="536" cy="436" r="3.5" fill="#9fd8ff" opacity="0.8" />
        {/* табличка */}
        <rect x="498" y="296" width="84" height="52" rx="8" fill="#c9a85a" stroke={INK} strokeWidth="3" />
        <text x="540" y="334" textAnchor="middle" fontFamily={FONT} fontWeight="900" fontSize="36" fill={INK}>13</text>
        {/* замки, цепочка, ручка */}
        <rect x="700" y="640" width="44" height="76" rx="12" fill="#c9a85a" stroke={INK} strokeWidth="3" /><circle cx="722" cy="668" r="9" fill="#0a0e15" /><rect x="716" y="668" width="12" height="30" rx="5" fill="#0a0e15" />
        <rect x="684" y="748" width="82" height="16" rx="8" fill="#c9a85a" stroke={INK} strokeWidth="3" />
        <rect x="740" y="760" width="16" height="70" rx="8" fill="#c9a85a" stroke={INK} strokeWidth="3" />
        <path d="M706 520 H 770" stroke="#c9a85a" strokeWidth="6" /><path d="M706 520 q -14 20 0 36 M718 520 q 0 22 8 34" stroke="#c9a85a" strokeWidth="4" fill="none" />
        <circle cx="770" cy="520" r="7" fill="#c9a85a" />
        {/* звонок рядом */}
        <g transform="translate(850 600)">
          <rect x="-34" y="-50" width="68" height="100" rx="12" fill="#d6cfbc" stroke={INK} strokeWidth="3" />
          <circle cx="0" cy="-8" r="20" fill={bell > 0 ? '#ff4a3a' : '#a8a08a'} stroke={INK} strokeWidth="3" />
          <rect x="-20" y="22" width="40" height="14" rx="3" fill="#fff" /><path d="M-14 29 H 14" stroke="#555" strokeWidth="2" />
        </g>
        {/* сколы и царапины */}
        <path d="M600 900 l 30 40 M 612 892 l 26 36" stroke="#2a1d15" strokeWidth="3" opacity="0.7" />
      </g>
      {/* свет из-под двери (подъезд) */}
      <rect x="300" y="1148" width="480" height="12" fill="#cfe9b0" opacity="0.85" />
      <polygon points="300,1160 780,1160 940,1330 150,1330" fill="#cfe9b0" opacity="0.1" />
      {feet > 0 && [440, 640].map((x, i) => <ellipse key={x} cx={x + Math.sin(t * 3 + i) * 3} cy="1154" rx="46" ry="6" fill="#05070a" opacity={feet * 0.9} />)}
      {bell > 0 && <Waves x={850} y={600} t={t * 3} color="#ff6a5a" n={3} maxR={220} />}

      {/* пол: доски, коврик, обувь, зонт */}
      <rect y="1180" width="1080" height="740" fill="url(#planks)" />
      <rect y="1180" width="1080" height="740" fill="#15161c" opacity="0.45" />
      {Array.from({length: 7}).map((_, i) => <line key={i} x1="0" x2="1080" y1={1180 + i * i * 16 + i * 12} y2={1180 + i * i * 16 + i * 12} stroke="#0c0d12" strokeWidth={2 + i} opacity="0.8" />)}
      <rect x="360" y="1230" width="360" height="130" rx="14" fill="#6b2d3a" stroke={INK} strokeWidth="4" />
      <rect x="380" y="1246" width="320" height="98" fill="none" stroke="#d9a441" strokeWidth="4" strokeDasharray="12 8" />
      <text x="540" y="1312" textAnchor="middle" fontFamily={FONT} fontWeight="900" fontSize="44" fill="#d9a441" opacity="0.85">ДОМ</text>
      <g transform="translate(60 1210)">
        <path d="M0 40 Q 10 0 70 8 L 90 30 L 0 46 Z" fill="#e8e1cc" stroke={INK} strokeWidth="3" /><path d="M110 46 Q 124 4 180 14 L 200 38 L 110 52 Z" fill="#c23b3b" stroke={INK} strokeWidth="3" />
        <ellipse cx="60" cy="90" rx="44" ry="18" fill="#f2d7e3" stroke={INK} strokeWidth="3" /><ellipse cx="130" cy="94" rx="44" ry="18" fill="#f2d7e3" stroke={INK} strokeWidth="3" />
      </g>
      <g transform="translate(940 1180)">
        <path d="M-18 0 L -12 -190 H 12 L 18 0 Z" fill="#35445e" stroke={INK} strokeWidth="3" /><path d="M0 -190 V -280" stroke="#c9a85a" strokeWidth="7" />
      </g>

      {/* свет бра — управляется lamp */}
      <ellipse cx="850" cy="220" rx={300 * lamp} ry={380 * lamp} fill="url(#warmGlow)" opacity={lamp * 0.8} />
      <rect width="1080" height="1920" fill="#04060b" opacity={(1 - lamp) * 0.84} />
    </g>
  );
};

// ================= КУХНЯ =================
export const Kitchen: React.FC<{t: number; momX?: number; cupRattle?: number; phoneGlow?: number}> = ({t, cupRattle = 0, phoneGlow = 0}) => {
  const sway = Math.sin(t * 1.2);
  return (
    <g>
      <rect width="1080" height="1920" fill="#2a2f3d" />
      {/* плитка над столешницей */}
      <rect x="0" y="560" width="1080" height="420" fill="url(#tileDark)" opacity="0.55" />
      <rect y="0" width="1080" height="560" fill="url(#wp)" opacity="0.8" />
      {/* окно */}
      <g>
        <rect x="560" y="120" width="300" height="340" fill="url(#moonSky)" stroke="#0a0e15" strokeWidth="14" />
        <line x1="710" x2="710" y1="120" y2="460" stroke="#0a0e15" strokeWidth="10" /><line x1="560" x2="860" y1="290" y2="290" stroke="#0a0e15" strokeWidth="10" />
        <circle cx="800" cy="190" r="26" fill="#f1ead2" />
        <path d={`M530 100 H 620 Q ${620 + sway * 6} 280 ${590 + sway * 10} 480 H 530 Z`} fill="#c97a54" /><path d={`M890 100 H 800 Q ${800 - sway * 6} 280 ${830 - sway * 10} 480 H 890 Z`} fill="#c97a54" />
        <rect x="520" y="92" width="380" height="12" rx="6" fill="#2a2030" />
      </g>
      {/* вытяжка + плита */}
      <path d="M270 380 L 330 180 H 470 L 530 380 Z" fill="#505a6e" stroke={INK} strokeWidth="4" />
      <rect x="330" y="360" width="140" height="22" fill="#ffd98a" opacity="0.7" />
      <ellipse cx="400" cy="460" rx="260" ry="120" fill="url(#warmGlow)" opacity="0.5" />
      {/* полки с банками */}
      <g>
        <rect x="40" y="260" width="200" height="14" fill="#5a3d2a" stroke={INK} strokeWidth="3" />
        {[0, 1, 2, 3].map((i) => <g key={i}><rect x={56 + i * 46} y={206} width="36" height="54" rx="6" fill={['#d9a441', '#c23b3b', '#6aa66a', '#c9c2b0'][i]} stroke={INK} strokeWidth="3" /><rect x={56 + i * 46} y={198} width="36" height="10" rx="3" fill="#2a2a33" /></g>)}
        <rect x="40" y="420" width="200" height="14" fill="#5a3d2a" stroke={INK} strokeWidth="3" />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={54 + i * 36} y={380} width="28" height="40" rx="4" fill="#efe9db" stroke={INK} strokeWidth="3" />)}
      </g>
      {/* часы */}
      <g transform="translate(300 90)"><circle r="42" fill="#e8e1cc" stroke={INK} strokeWidth="6" /><line y2="-24" stroke={INK} strokeWidth="5" transform="rotate(200)" /><line y2="-32" stroke={INK} strokeWidth="3" transform="rotate(300)" /><line y2="-34" stroke="#d9482b" strokeWidth="2" transform={`rotate(${Math.floor(t) * 6})`} /></g>
      {/* столешница и шкафы */}
      <rect x="0" y="940" width="1080" height="40" fill="#8a8a96" stroke={INK} strokeWidth="4" />
      <rect x="0" y="980" width="1080" height="230" fill="#4b5873" stroke={INK} strokeWidth="4" />
      {[0, 1, 2, 3, 4].map((i) => <g key={i}><rect x={20 + i * 210} y="1000" width="190" height="190" rx="8" fill="#56658a" stroke="#2f3a52" strokeWidth="4" /><rect x={96 + i * 210} y="1010" width="38" height="10" rx="5" fill="#c9c2b0" /></g>)}
      {/* плита */}
      <rect x="270" y="900" width="260" height="42" rx="6" fill="#2a2d36" stroke={INK} strokeWidth="4" />
      {[320, 480].map((x) => <ellipse key={x} cx={x} cy="904" rx="40" ry="8" fill="#12141a" />)}
      <g transform="translate(400 900)">
        <path d="M-60 0 L -52 -120 H 52 L 60 0 Z" fill="#9aa3b8" stroke={INK} strokeWidth="4" /><rect x="-70" y="-132" width="140" height="14" rx="6" fill="#7f889c" stroke={INK} strokeWidth="3" />
        <path d="M60 -90 H 110" stroke={INK} strokeWidth="9" strokeLinecap="round" />
        {[0, 1, 2].map((k) => { const p = mod(t * 0.5 + k / 3, 1); return <circle key={k} cx={Math.sin(p * 6 + k) * 18} cy={-150 - p * 140} r={14 + p * 26} fill="#dfe8ff" opacity={0.2 * (1 - p)} />; })}
      </g>
      {/* чашка на столешнице */}
      <g transform="translate(760 940) scale(0.9)"><Cup rattle={cupRattle} t={t} steam={0.8} /></g>
      <g transform="translate(940 940)"><rect x="-40" y="-90" width="80" height="90" rx="8" fill="#c23b3b" stroke={INK} strokeWidth="3" /><rect x="-46" y="-102" width="92" height="14" rx="5" fill="#2a2a33" /><circle cx="0" cy="-46" r="14" fill="#fff" /></g>
      {/* холодильник */}
      <g>
        <rect x="850" y="420" width="260" height="790" rx="14" fill="#d6dce6" stroke={INK} strokeWidth="5" />
        <line x1="850" x2="1110" y1="640" y2="640" stroke="#8a93a6" strokeWidth="6" />
        <rect x="878" y="520" width="14" height="90" rx="7" fill="#8a93a6" /><rect x="878" y="680" width="14" height="150" rx="7" fill="#8a93a6" />
        <rect x="920" y="470" width="140" height="100" fill="#fff8d6" stroke="#b5a76a" strokeWidth="3" transform="rotate(-3 990 520)" />
        <path d="M936 500 H 1040 M936 520 H 1020 M936 540 H 1030" stroke="#8a8470" strokeWidth="4" transform="rotate(-3 990 520)" />
        <g transform="translate(1000 700)"><ellipse cx="-8" cy="-26" rx="8" ry="20" fill="#ff9ab5" /><ellipse cx="10" cy="-26" rx="8" ry="20" fill="#ff9ab5" /><circle cx="0" cy="0" r="22" fill="#ff9ab5" stroke={INK} strokeWidth="3" /><circle cx="-7" cy="-2" r="3" fill={INK} /><circle cx="7" cy="-2" r="3" fill={INK} /></g>
        <rect x="920" y="760" width="90" height="120" fill="#bfe6ff" stroke={INK} strokeWidth="3" transform="rotate(4 965 820)" />
      </g>
      {/* пол — шахматка */}
      <rect y="1210" width="1080" height="710" fill="#23232c" />
      {Array.from({length: 9}).map((_, r) => Array.from({length: 12}).map((__, c) => (r + c) % 2 ? <rect key={`${r}-${c}`} x={c * 90} y={1210 + r * (50 + r * 6)} width="90" height={50 + r * 6} fill="#2e2e39" /> : null))}
      {/* стол с телефоном (передний план) */}
      <g>
        <path d="M-40 1520 L 360 1520 L 420 1660 L -100 1660 Z" fill="#6b4a33" stroke={INK} strokeWidth="5" transform="translate(0 0)" />
        <g transform="translate(150 1540) rotate(-8)">
          <rect x="-60" y="-14" width="120" height="30" rx="8" fill={phoneGlow > 0 ? '#e8f4ff' : '#0f131b'} stroke={INK} strokeWidth="3" />
        </g>
      </g>
      <ellipse cx="700" cy="1100" rx="520" ry="300" fill="url(#warmGlow)" opacity="0.18" />
    </g>
  );
};

// ================= ВАННАЯ: дверь изнутри =================
export const BathDoor: React.FC<{t: number; lock?: number; cold?: number}> = ({t, lock = 0, cold = 0}) => (
  <g>
    <rect width="1080" height="1920" fill="#2c4a58" />
    <rect width="1080" height="1180" fill="url(#tileDark)" />
    <rect y="1170" width="1080" height="750" fill="#1d2a33" />
    {Array.from({length: 14}).map((_, i) => <line key={i} x1="0" x2="1080" y1={1180 + i * i * 6 + i * 20} y2={1180 + i * i * 6 + i * 20} stroke="#0f171d" strokeWidth={2 + i * 0.5} />)}
    {/* ванна и занавеска */}
    <path d="M0 520 H 190 Q 210 800 190 1120 H 0 Z" fill="#7aa4c8" stroke={INK} strokeWidth="4" />
    {Array.from({length: 6}).map((_, i) => <g key={i}><circle cx={30 + (i % 3) * 56} cy={600 + Math.floor(i / 3) * 260} r="14" fill="#e8f4ff" opacity="0.8" /><path d={`M${40 + i * 24} 540 Q ${50 + i * 24} 800 ${40 + i * 24} 1110`} stroke="#5f8aae" strokeWidth="4" fill="none" /></g>)}
    {/* раковина и зеркальный шкафчик */}
    <g transform="translate(900 700)">
      <rect x="-120" y="-250" width="240" height="320" rx="10" fill="#d6dce6" stroke={INK} strokeWidth="4" /><rect x="-100" y="-230" width="200" height="280" fill="#3d566a" />
      <path d="M-70 -180 L -20 -230" stroke="#fff" strokeWidth="10" opacity="0.2" />
      <path d="M-140 120 H 140 L 110 270 H -110 Z" fill="#e8e8f0" stroke={INK} strokeWidth="4" /><rect x="-12" y="70" width="24" height="50" fill="#9aa3b8" />
    </g>
    {/* дверь */}
    <rect x="300" y="200" width="480" height="990" fill="#0f171d" />
    <rect x="316" y="216" width="448" height="974" fill="#e6e0d0" stroke="#8a8470" strokeWidth="6" />
    {[[342, 244, 396, 330], [342, 604, 396, 540]].map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} fill="#dcd5c3" stroke="#a69f88" strokeWidth="5" />)}
    {/* щеколда */}
    <g transform="translate(700 640)">
      <rect x="-30" y="-76" width="60" height="150" rx="10" fill="#9aa3b8" stroke={INK} strokeWidth="3" />
      <circle cx="0" cy="0" r="20" fill="#c9c2b0" stroke={INK} strokeWidth="3" />
      <rect x="-8" y="-6" width="16" height="64" rx="6" fill="#5a6076" stroke={INK} strokeWidth="3" transform={`rotate(${lock * 90})`} />
      <rect x="-14" y="-62" width="28" height="18" rx="4" fill={lock > 0.5 ? '#ff4a3a' : '#2e9a5a'} />
      <text x="0" y="-48" textAnchor="middle" fontFamily={FONT} fontWeight="900" fontSize="12" fill="#fff">{lock > 0.5 ? 'ЗАНЯТО' : 'ВХОД'}</text>
    </g>
    <circle cx="730" cy="820" r="0" />
    <rect x="716" y="860" width="22" height="90" rx="11" fill="#c9c2b0" stroke={INK} strokeWidth="3" />
    {/* щель под дверью */}
    <rect x="316" y="1186" width="448" height="12" fill={cold > 0 ? '#bfe6ff' : '#ffd98a'} opacity="0.9" />
    <polygon points="316,1198 764,1198 920,1360 160,1360" fill={cold > 0 ? '#bfe6ff' : '#ffd98a'} opacity="0.09" />
    {/* тень шагов */}
    {[460, 620].map((x, i) => <ellipse key={x} cx={x + Math.sin(t * 2 + i) * 4} cy="1192" rx="38" ry="5" fill="#05070a" opacity="0.8" />)}
    {/* ледяной туман под дверью */}
    {cold > 0 && Array.from({length: 10}).map((_, i) => {
      const p = mod(t * 0.35 + i * 0.13, 1);
      return <ellipse key={i} cx={360 + rnd(i) * 360 + Math.sin(p * 5 + i) * 26} cy={1220 + p * 120} rx={40 + p * 70} ry={10 + p * 14} fill="#dff3ff" opacity={cold * 0.22 * (1 - p)} />;
    })}
    {cold > 0 && <g stroke="#dff3ff" strokeWidth="3" fill="none" opacity={cold * 0.6} strokeLinecap="round">
      <path d="M320 1170 l 30 -60 l 12 -40 M 350 1110 l 36 -10 M 362 1070 l -28 -26" /><path d="M760 1170 l -34 -80 l -10 -30 M 726 1090 l -34 -4" /><path d="M540 1180 l 8 -50 l -16 -34" />
    </g>}
  </g>
);

// ================= ГЛАЗОК, ЩЕЛЬ, ПРОЧЕЕ =================
export const Peephole: React.FC<{t: number; reveal?: number}> = ({t, reveal = 0}) => (
  <g>
    <rect width="1080" height="1920" fill="#2a1d15" />
    {Array.from({length: 30}).map((_, i) => <path key={i} d={`M${rnd(i) * 1080} ${rnd(i + 3) * 1920} q 80 14 170 0`} stroke="#3b2a1f" strokeWidth="3" opacity="0.7" fill="none" />)}
    {/* латунное кольцо */}
    <circle cx="540" cy="900" r="270" fill="#c9a85a" stroke={INK} strokeWidth="8" />
    <circle cx="540" cy="900" r="240" fill="#a8873a" stroke={INK} strokeWidth="5" />
    <path d="M330 760 A 240 240 0 0 1 560 660" stroke="#f3d27a" strokeWidth="14" fill="none" strokeLinecap="round" opacity="0.7" />
    {/* линза */}
    <circle cx="540" cy="900" r="196" fill="#05070a" stroke={INK} strokeWidth="6" />
    <clipPath id="lens"><circle cx="540" cy="900" r="192" /></clipPath>
    <g clipPath="url(#lens)">
      <rect x="340" y="700" width="400" height="400" fill="#0a1210" />
      <ellipse cx="540" cy="900" rx="190" ry="190" fill="url(#coldGlow)" opacity={0.25 + reveal * 0.2} />
      {/* лестничная площадка — искажённая */}
      <path d="M350 1000 Q 540 940 730 1000 L 730 1100 L 350 1100 Z" fill="#17211c" />
      <path d="M350 760 Q 540 810 730 760" stroke="#2a3a32" strokeWidth="6" fill="none" />
      <g opacity={reveal} transform={`translate(540 900) scale(${0.55 + reveal * 0.45})`}>
        <Eye t={t} look={Math.sin(t * 1.5)} />
      </g>
    </g>
    <circle cx="540" cy="900" r="196" fill="none" stroke="#fff" strokeWidth="3" opacity="0.18" />
    <path d="M430 800 A 150 150 0 0 1 560 760" stroke="#fff" strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.15" />
  </g>
);

// ================= ТЕЛЕФОН =================
export const PhoneShell: React.FC<{children: React.ReactNode; glow?: number}> = ({children, glow = 1}) => (
  <g>
    <ellipse cx="540" cy="1000" rx="520" ry="760" fill="url(#coldGlow)" opacity={0.28 * glow} />
    <rect x="200" y="260" width="680" height="1240" rx="76" fill="#0a0d14" stroke="#2a3140" strokeWidth="10" />
    <rect x="898" y="520" width="8" height="130" rx="4" fill="#2a3140" /><rect x="174" y="470" width="8" height="90" rx="4" fill="#2a3140" />
    <clipPath id="scr"><rect x="222" y="282" width="636" height="1196" rx="58" /></clipPath>
    <g clipPath="url(#scr)">{children}</g>
    <rect x="460" y="300" width="160" height="38" rx="19" fill="#0a0d14" />
    {/* рука: пальцы справа и большой слева */}
    <g>
      <rect x="840" y="560" width="120" height="70" rx="35" fill={P.skin} stroke="#b57d5a" strokeWidth="5" />
      <rect x="846" y="650" width="120" height="70" rx="35" fill={P.skin} stroke="#b57d5a" strokeWidth="5" />
      <rect x="840" y="740" width="116" height="66" rx="33" fill={P.skin} stroke="#b57d5a" strokeWidth="5" />
      <path d="M180 1380 Q 160 1500 300 1580 L 780 1580 Q 940 1500 900 1360 Q 880 1480 780 1500 L 300 1500 Q 200 1480 180 1380 Z" fill={P.skin} stroke="#b57d5a" strokeWidth="5" />
      <rect x="130" y="1180" width="110" height="64" rx="32" fill={P.skin} stroke="#b57d5a" strokeWidth="5" transform="rotate(-14 185 1212)" />
    </g>
  </g>
);

export const ChatUI: React.FC<{t: number; lt: number}> = ({t, lt}) => {
  // lt — локальное время относительно начала кадра (24.42)
  const msgs: {side: 'in' | 'out'; text: string; at: number}[] = [
    {side: 'out', text: 'Ты где?', at: 1.45},
    {side: 'in', text: 'У двери.', at: 3.05},
    {side: 'in', text: 'Открывай.', at: 3.8},
  ];
  let y = 440;
  const typing = lt > 1.95 && lt < 3.05;
  return (
    <g>
      <rect x="222" y="282" width="636" height="1196" fill="#101725" />
      <rect x="222" y="282" width="636" height="190" fill="#18233a" />
      <circle cx="300" cy="400" r="34" fill="#e4b595" /><path d="M268 392 Q 300 360 332 392 L 332 380 Q 300 350 268 380 Z" fill="#5b3d33" />
      <text x="356" y="396" fontFamily={FONT} fontWeight="800" fontSize="34" fill="#fff">Мама ♥</text>
      <text x="356" y="432" fontFamily={FONT} fontWeight="600" fontSize="24" fill={typing ? '#7dffb2' : '#7a88a8'}>{typing ? 'печатает…' : 'в сети'}</text>
      {msgs.map((m, i) => {
        if (lt < m.at) return null;
        const p = Math.min(1, (lt - m.at) / 0.18);
        const w = 90 + m.text.length * 24;
        const yy = y; y += 100;
        const x = m.side === 'out' ? 858 - 30 - w : 252;
        return (
          <g key={i} opacity={p} transform={`translate(0 ${(1 - p) * 20})`}>
            <rect x={x} y={yy} width={w} height="72" rx="26" fill={m.side === 'out' ? '#6c57a8' : '#26324a'} />
            <text x={x + 24} y={yy + 47} fontFamily={FONT} fontWeight="700" fontSize="32" fill="#fff">{m.text}</text>
            <text x={x + w - 70} y={yy + 66} fontFamily={FONT} fontWeight="600" fontSize="14" fill="#fff" opacity="0.5">18:46</text>
          </g>
        );
      })}
      {typing && (
        <g transform={`translate(252 ${y})`}>
          <rect width="130" height="64" rx="24" fill="#26324a" />
          {[0, 1, 2].map((i) => <circle key={i} cx={36 + i * 30} cy="32" r="8" fill="#9db0cc" opacity={0.4 + 0.6 * Math.max(0, Math.sin(t * 9 - i * 1.2))} />)}
        </g>
      )}
      <rect x="252" y="1340" width="576" height="84" rx="42" fill="#18233a" />
      <text x="290" y="1394" fontFamily={FONT} fontWeight="600" fontSize="28" fill="#5d6c88">Сообщение…</text>
    </g>
  );
};
