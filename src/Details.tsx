import React from 'react';

export const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const mod = (a: number, b: number) => ((a % b) + b) % b;

// ======== Атмосфера поверх всего ========
export const Atmosphere: React.FC<{t: number; frame: number}> = ({t, frame}) => (
  <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{position: 'absolute', pointerEvents: 'none'}}>
    <defs>
      <filter id="grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 9} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
        <rect width="4" height="1.4" fill="#000" opacity="0.18" />
      </pattern>
      <radialGradient id="leak" cx="0" cy="0" r="1">
        <stop offset="0" stopColor="#ff9a3c" stopOpacity="0.22" />
        <stop offset="1" stopColor="#ff9a3c" stopOpacity="0" />
      </radialGradient>
    </defs>
    <ellipse cx="0" cy="0" rx="900" ry="700" fill="url(#leak)" />
    {Array.from({length: 80}).map((_, i) => {
      const x = mod(rnd(i) * 1080 + Math.sin(t * 0.7 + i) * 34 + t * (6 + rnd(i + 9) * 12), 1080);
      const y = mod(rnd(i + 3) * 1920 - t * (14 + rnd(i + 5) * 26), 1920);
      const r = 1 + rnd(i + 7) * 3.2;
      const tw = 0.5 + 0.5 * Math.sin(t * (1.5 + rnd(i) * 3) + i);
      return <circle key={i} cx={x} cy={y} r={r} fill="#ffe9c0" opacity={(0.1 + rnd(i + 2) * 0.35) * tw} />;
    })}
    <rect width="1080" height="1920" filter="url(#grain)" opacity="0.13" style={{mixBlendMode: 'overlay'}} />
    <rect width="1080" height="1920" fill="url(#scan)" />
    {/* рамка видоискателя */}
    {[
      'M40 190 V 160 H 70', 'M1010 160 H 1040 V 190', 'M40 1730 V 1760 H 70', 'M1040 1730 V 1760 H 1010',
    ].map((d) => (
      <path key={d} d={d} stroke="#fff" strokeOpacity="0.45" strokeWidth="4" fill="none" />
    ))}
    {Array.from({length: 24}).map((_, i) => (
      <line key={i} x1="0" x2={i % 4 === 0 ? 18 : 9} y1={260 + i * 56} y2={260 + i * 56} stroke="#fff" strokeOpacity="0.25" strokeWidth="2" />
    ))}
    <text x="48" y="1862" fontFamily="monospace" fontSize="22" fill="#fff" opacity="0.55">CAM-02 · {String(Math.floor(t * 24)).padStart(3, '0')} · ISO 1600</text>
    <circle cx="1020" cy="1850" r="9" fill="#ff3b3b" opacity={Math.floor(t * 2) % 2 ? 1 : 0.2} />
    <text x="985" y="1858" textAnchor="end" fontFamily="monospace" fontSize="24" fill="#fff" opacity="0.7">REC</text>
  </svg>
);

// ======== Улица: дальний план ========
export const FarDetails: React.FC<{t: number}> = ({t}) => (
  <g>
    {/* звёзды с мерцанием */}
    {Array.from({length: 70}).map((_, i) => (
      <circle key={i} cx={(i * 197) % 1080} cy={(i * 131) % 680} r={(i % 3) * 0.8 + 1.2} fill="#dfe8ff"
        opacity={(0.3 + (i % 4) * 0.15) * (0.55 + 0.45 * Math.sin(t * (1 + (i % 5) * 0.6) + i))} />
    ))}
    {/* самолёт */}
    <circle cx={mod(100 + t * 30, 1200) - 60} cy={210 + Math.sin(t) * 4} r="3" fill="#ff5252" opacity={Math.floor(t * 2) % 2 ? 1 : 0.2} />
    {/* облака */}
    {[0, 1, 2].map((i) => (
      <g key={i} opacity="0.2" transform={`translate(${mod(i * 420 + t * (10 + i * 4), 1500) - 250} ${180 + i * 90})`}>
        <ellipse rx="170" ry="26" fill="#9db0cc" />
        <ellipse cx="-60" cy="-18" rx="90" ry="24" fill="#9db0cc" />
        <ellipse cx="70" cy="-14" rx="70" ry="20" fill="#9db0cc" />
      </g>
    ))}
    {/* холмы и дальний город */}
    <path d="M0 800 Q 200 700 380 780 T 760 760 T 1080 780 V 1000 H 0 Z" fill="#161d29" />
    {Array.from({length: 22}).map((_, i) => {
      const x = i * 52 + 4;
      const h = 60 + rnd(i + 40) * 120;
      return (
        <g key={i}>
          <rect x={x} y={900 - h} width={40} height={h + 100} fill="#131a25" />
          {Array.from({length: 4}).map((__, k) => (
            <rect key={k} x={x + 6 + (k % 2) * 18} y={900 - h + 12 + Math.floor(k / 2) * 22} width="9" height="11"
              fill={rnd(i * 7 + k) > 0.6 ? '#ffd27a' : '#1e2736'} opacity="0.85" />
          ))}
        </g>
      );
    })}
    {/* провода */}
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M -20 ${430 + i * 16} Q 540 ${520 + i * 18 + Math.sin(t * 1.4 + i) * 3} 1100 ${440 + i * 14}`} stroke="#0b0f16" strokeWidth="3" fill="none" />
    ))}
    <rect x="1000" y="380" width="16" height="620" fill="#0b0f16" />
    <rect x="950" y="420" width="116" height="8" fill="#0b0f16" />
    <rect x="975" y="450" width="66" height="6" fill="#0b0f16" />
    {/* птицы на проводах */}
    {[250, 330, 700].map((x, i) => {
      const y = 470 + Math.sin((x / 1080) * Math.PI) * 38 + i;
      return <path key={x} d={`M${x - 10} ${y - 4} Q ${x} ${y - 20} ${x + 10} ${y - 4} Z`} fill="#0b0f16" />;
    })}
    {/* летящая птица */}
    {(() => {
      const x = mod(t * 90, 1400) - 150;
      const f = Math.sin(t * 14) * 8;
      return <path d={`M${x - 16} ${340 + f} Q ${x} ${326} ${x + 16} ${340 + f}`} stroke="#0b0f16" strokeWidth="4" fill="none" />;
    })()}
  </g>
);

// ======== Декор домов ========
export const HouseDecor: React.FC<{x: number; w: number; h: number; i: number; t: number}> = ({x, w, h, i, t}) => {
  const top = 1000 - h;
  return (
    <g>
      {Array.from({length: 6}).map((_, k) => {
        const wx = x + 30 + (k % 2) * 90;
        const wy = top + 50 + Math.floor(k / 2) * 110;
        return (
          <g key={k} stroke="#0d1118" strokeWidth="4">
            <rect x={wx - 3} y={wy - 3} width="62" height="76" fill="none" />
            <line x1={wx + 28} x2={wx + 28} y1={wy} y2={wy + 70} />
            <line x1={wx} x2={wx + 56} y1={wy + 34} y2={wy + 34} />
            <rect x={wx - 8} y={wy + 72} width="72" height="8" fill="#0d1118" stroke="none" />
            {k === 3 && i % 2 === 0 && <rect x={wx + 4} y={wy + 4} width="22" height="62" fill="#ffe0a0" opacity={0.15 + 0.1 * Math.sin(t * 40)} stroke="none" />}
          </g>
        );
      })}
      {/* антенна */}
      <g stroke="#0b0f16" strokeWidth="3">
        <line x1={x + w * 0.3} x2={x + w * 0.3} y1={top - 30} y2={top - 100} />
        {[0, 1, 2].map((k) => <line key={k} x1={x + w * 0.3 - 18 + k * 2} x2={x + w * 0.3 + 18 - k * 2} y1={top - 96 + k * 14} y2={top - 96 + k * 14} />)}
      </g>
      {/* труба и дым */}
      <rect x={x + w * 0.72} y={top - 60} width="28" height="60" fill="#10141b" />
      {i % 2 === 0 &&
        [0, 1, 2, 3].map((k) => {
          const p = mod(t * 0.35 + k * 0.25, 1);
          return <circle key={k} cx={x + w * 0.72 + 14 + Math.sin(p * 6 + k) * 14 + p * 30} cy={top - 70 - p * 120} r={8 + p * 22} fill="#9db0cc" opacity={0.28 * (1 - p)} />;
        })}
      {/* дверь + свет у крыльца */}
      <rect x={x + w / 2 - 26} y={1000 - 92} width="52" height="92" fill="#0f141c" stroke="#070a0f" strokeWidth="4" />
      <circle cx={x + w / 2 + 14} cy={1000 - 44} r="4" fill="#ffd27a" />
      {i % 2 === 1 && (
        <g>
          <circle cx={x + w / 2 + 44} cy={1000 - 110} r="9" fill="#ffe3a3" />
          <ellipse cx={x + w / 2 + 44} cy={1000 - 90} rx="46" ry="60" fill="#ffd98a" opacity="0.08" />
        </g>
      )}
      {/* водосток */}
      <line x1={x + w - 10} x2={x + w - 10} y1={top} y2={1000} stroke="#0d1118" strokeWidth="8" />
    </g>
  );
};

// ======== Улица: ближний план ========
export const NearDetails: React.FC<{t: number}> = ({t}) => {
  const flick = Math.sin(t * 37) > 0.93 ? 0.5 : 1;
  return (
    <g>
      {/* тротуары и бордюры */}
      <polygon points="380,1000 470,1000 80,1920 -300,1920" fill="#2f3a4c" />
      <polygon points="610,1000 700,1000 1380,1920 1000,1920" fill="#2f3a4c" />
      <line x1="470" y1="1000" x2="80" y2="1920" stroke="#566580" strokeWidth="5" />
      <line x1="610" y1="1000" x2="1000" y2="1920" stroke="#566580" strokeWidth="5" />
      {/* швы тротуара */}
      {Array.from({length: 9}).map((_, i) => {
        const k = (i + 1) / 10, y = 1000 + k * k * 920;
        return (
          <g key={i} stroke="#202a38" strokeWidth={1 + k * 5}>
            <line x1={380 - k * 780} y1={y} x2={470 - k * 390 - (k * 20)} y2={y} />
            <line x1={700 + k * 680} y1={y} x2={610 + k * 390 + k * 20} y2={y} />
          </g>
        );
      })}
      {/* трещины на асфальте */}
      <path d="M520 1180 l22 30 l-14 24 l30 40 l-10 36" stroke="#1b2330" strokeWidth="4" fill="none" />
      <path d="M600 1330 l-30 26 l12 28 l-34 30" stroke="#1b2330" strokeWidth="5" fill="none" />
      <path d="M420 1460 l36 14 l8 30 l36 12" stroke="#1b2330" strokeWidth="6" fill="none" />
      {/* люк */}
      <g transform="translate(560 1480)">
        <ellipse rx="92" ry="22" fill="#1a212d" />
        <ellipse rx="78" ry="17" fill="#232d3d" stroke="#0f141c" strokeWidth="3" />
        {[-48, -24, 0, 24, 48].map((x) => <line key={x} x1={x} x2={x} y1="-12" y2="12" stroke="#0f141c" strokeWidth="3" />)}
      </g>
      {/* лужи с бликами */}
      {[[690, 1300, 90], [380, 1610, 120]].map(([x, y, r], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx={r} ry={r * 0.2} fill="#415774" opacity="0.65" />
          <ellipse cx={x - r * 0.2} cy={y - 2} rx={r * 0.5} ry={r * 0.07} fill="#c8d8f0" opacity="0.25" />
          {[0, 1].map((k) => {
            const p = mod(t * 0.8 + k * 0.5 + i * 0.3, 1);
            return <ellipse key={k} cx={x + (k ? 20 : -26)} cy={y} rx={p * 28} ry={p * 6} fill="none" stroke="#dfe8ff" strokeWidth="2" opacity={0.5 * (1 - p)} />;
          })}
        </g>
      ))}
      {/* листья и мусор */}
      {Array.from({length: 18}).map((_, i) => {
        const y = 1060 + rnd(i) * 800;
        const x = 120 + rnd(i + 5) * 840;
        const s = 5 + (y - 1000) / 80;
        return <ellipse key={i} cx={x} cy={y} rx={s} ry={s * 0.45} fill={i % 3 ? '#6b5a2e' : '#8a4a2a'} opacity="0.7" transform={`rotate(${rnd(i + 8) * 180} ${x} ${y})`} />;
      })}
      {/* газета на ветру */}
      <g transform={`translate(${mod(t * 140, 1400) - 150} ${1650 - Math.abs(Math.sin(t * 6)) * 40}) rotate(${Math.sin(t * 9) * 25})`}>
        <rect x="-22" y="-14" width="44" height="28" fill="#e8e1cc" opacity="0.8" />
        {[-6, 0, 6].map((y) => <line key={y} x1="-16" x2="16" y1={y} y2={y} stroke="#555" strokeWidth="2" />)}
      </g>

      {/* забор слева */}
      <g>
        <rect x="0" y="925" width="380" height="8" fill="#10151e" />
        <rect x="0" y="965" width="380" height="8" fill="#10151e" />
        {Array.from({length: 16}).map((_, i) => (
          <polygon key={i} points={`${i * 24 + 2},1000 ${i * 24 + 2},905 ${i * 24 + 12},890 ${i * 24 + 22},905 ${i * 24 + 22},1000`} fill="#161d29" />
        ))}
        {/* глаза кота в щели */}
        {(() => {
          const open = mod(t, 3.2) > 0.2;
          return open ? (
            <g>
              <ellipse cx="288" cy="945" rx="5" ry="7" fill="#ffe36b" />
              <ellipse cx="308" cy="945" rx="5" ry="7" fill="#ffe36b" />
              <rect x="285" y="942" width="3" height="6" fill="#000" />
              <rect x="305" y="942" width="3" height="6" fill="#000" />
            </g>
          ) : null;
        })()}
      </g>
      {/* кусты */}
      {[[345, 1000], [715, 1000], [60, 1010]].map(([x, y], i) => (
        <g key={i} fill="#122019">
          <circle cx={x} cy={y - 24} r="34" /><circle cx={x + 30} cy={y - 16} r="28" /><circle cx={x - 28} cy={y - 14} r="26" />
        </g>
      ))}
      {/* мусорные баки */}
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${750 + i * 66} 1000)`}>
          <rect x="-26" y="-74" width="52" height="74" rx="6" fill={i ? '#2a4a3a' : '#2c3d5a'} stroke="#0b0f16" strokeWidth="3" />
          <rect x="-30" y="-84" width="60" height="14" rx="5" fill={i ? '#35604a' : '#3a5078'} stroke="#0b0f16" strokeWidth="3" />
          <line x1="-14" x2="-14" y1="-62" y2="-8" stroke="#0b0f16" strokeWidth="3" /><line x1="14" x2="14" y1="-62" y2="-8" stroke="#0b0f16" strokeWidth="3" />
        </g>
      ))}
      {/* машина справа */}
      <g transform="translate(900 1000)">
        <path d="M-150 -10 L -140 -70 Q -110 -118 -40 -120 L 60 -120 Q 110 -110 140 -62 L 170 -48 L 170 -10 Z" fill="#1e2a3e" stroke="#0b0f16" strokeWidth="4" />
        <path d="M-100 -68 L -60 -108 L 20 -108 L 20 -68 Z M 34 -68 L 34 -108 L 80 -100 L 112 -68 Z" fill="#0f1a2a" />
        <circle cx="-86" cy="-6" r="32" fill="#0b0f16" /><circle cx="-86" cy="-6" r="14" fill="#566580" />
        <circle cx="96" cy="-6" r="32" fill="#0b0f16" /><circle cx="96" cy="-6" r="14" fill="#566580" />
        <rect x="150" y="-52" width="22" height="12" rx="4" fill="#ffe3a3" />
        <polygon points="170,-46 340,-10 340,-80" fill="#ffe3a3" opacity="0.07" />
        <rect x="-150" y="-50" width="10" height="14" fill="#ff4a3a" opacity="0.85" />
      </g>
      {/* скамейка */}
      <g transform="translate(300 1290)" stroke="#0b0f16" strokeWidth="3">
        <rect x="-80" y="-60" width="160" height="12" fill="#5a3d2a" /><rect x="-80" y="-42" width="160" height="12" fill="#5a3d2a" />
        <rect x="-80" y="-20" width="160" height="12" fill="#6b4a33" />
        <rect x="-70" y="-20" width="10" height="46" fill="#0b0f16" /><rect x="60" y="-20" width="10" height="46" fill="#0b0f16" />
      </g>
      {/* фонарь: мерцание, мотыльки, пыль */}
      <g opacity={flick}>
        <circle cx="157" cy="750" r="70" fill="#ffd98a" opacity="0.12" />
        <circle cx="157" cy="750" r="120" fill="#ffd98a" opacity="0.06" />
      </g>
      {Array.from({length: 6}).map((_, i) => {
        const a = t * (2 + i * 0.5) + i * 1.7;
        const x = 157 + Math.cos(a) * (34 + i * 9), y = 750 + Math.sin(a * 1.3) * (22 + i * 6);
        const wing = Math.sin(t * 40 + i) * 4;
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <ellipse cx="-4" rx="4" ry={4 + wing * 0.3} fill="#f6ecd2" /><ellipse cx="4" rx="4" ry={4 - wing * 0.3} fill="#f6ecd2" />
          </g>
        );
      })}
      {/* туман */}
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx={mod(i * 520 + t * (14 + i * 6), 1700) - 300} cy={960 + i * 40} rx="420" ry="44" fill="#9db0cc" opacity="0.07" />
      ))}
      <rect y="900" width="1080" height="160" fill="#9db0cc" opacity="0.05" />
    </g>
  );
};

// ======== Комната: детали ========
export const RoomDetails: React.FC<{t: number}> = ({t}) => {
  const sway = Math.sin(t * 1.3);
  return (
    <g>
      {/* узор обоев */}
      {/* окно */}
      <g>
        <rect x="60" y="150" width="340" height="380" fill="#0d1524" stroke="#0a0e15" strokeWidth="14" />
        <rect x="60" y="150" width="340" height="380" fill="url(#moonSky)" />
        {[[110, 220], [300, 190], [340, 320], [150, 380]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.5" fill="#fff" opacity={0.5 + 0.5 * Math.sin(t * 2 + i)} />
        ))}
        <circle cx="300" cy="240" r="38" fill="#f1ead2" /><circle cx="314" cy="232" r="38" fill="#0d1524" opacity="0.2" />
        <line x1="230" x2="230" y1="150" y2="530" stroke="#0a0e15" strokeWidth="12" />
        <line x1="60" x2="400" y1="340" y2="340" stroke="#0a0e15" strokeWidth="12" />
        <rect x="40" y="528" width="380" height="20" fill="#2a3547" stroke="#0a0e15" strokeWidth="4" />
        {/* шторы */}
        <path d={`M30 130 H 140 Q ${150 + sway * 8} 330 ${110 + sway * 14} 560 H 30 Z`} fill="#4a3a5c" />
        <path d={`M430 130 H 320 Q ${310 - sway * 8} 330 ${350 - sway * 14} 560 H 430 Z`} fill="#4a3a5c" />
        {[50, 80, 110].map((x) => <path key={x} d={`M${x} 140 Q ${x + 8 + sway * 5} 340 ${x + sway * 10} 550`} stroke="#35294a" strokeWidth="5" fill="none" />)}
        <rect x="20" y="118" width="420" height="14" rx="7" fill="#2a2030" />
        {/* паутина */}
        <path d="M60 150 Q 90 170 130 150 M60 150 Q 80 190 60 230 M60 150 L 120 210 M60 150 Q 100 140 150 160" stroke="#cfd8e8" strokeWidth="1.5" opacity="0.35" fill="none" />
      </g>
      {/* лунный свет на полу */}
      <polygon points="130,960 400,960 720,1250 240,1250" fill="#bcd0ee" opacity={0.06 + 0.02 * Math.sin(t)} />
      {/* рамки */}
      {[[450, 285, 130, 90, -3], [470, 395, 100, 120, 2], [610, 330, 0, 0, 0]].slice(0, 2).map(([x, y, w, h, r], i) => (
        <g key={i} transform={`rotate(${r + Math.sin(t * 0.9 + i) * 0.6} ${x + w / 2} ${y})`}>
          <rect x={x} y={y} width={w} height={h} fill="#6b4a33" stroke="#0a0e15" strokeWidth="4" />
          <rect x={x + 10} y={y + 10} width={w - 20} height={h - 20} fill={i ? '#cdb892' : '#7aa4c8'} />
          {i === 0 ? (
            <g><polygon points={`${x + 10},${y + h - 10} ${x + 50},${y + 40} ${x + 90},${y + h - 10}`} fill="#3a5a45" /><circle cx={x + 95} cy={y + 30} r="9" fill="#ffe08a" /></g>
          ) : (
            <g><circle cx={x + 36} cy={y + 52} r="13" fill="#e9b48f" /><rect x={x + 26} y={y + 66} width="20" height="40" fill="#4d7c6f" /><circle cx={x + 66} cy={y + 70} r="9" fill="#e9b48f" /><rect x={x + 59} y={y + 80} width="14" height="26" fill="#d9a441" /></g>
          )}
          <line x1={x + w / 2} y1={y} x2={x + w / 2 - 30} y2={y - 40} stroke="#0a0e15" strokeWidth="2" opacity="0.6" />
        </g>
      ))}
      {/* часы */}
      <g transform="translate(515 210) scale(0.85)">
        <circle r="54" fill="#e8e1cc" stroke="#0a0e15" strokeWidth="8" />
        {Array.from({length: 12}).map((_, i) => <line key={i} x1="0" x2="0" y1="-46" y2={i % 3 === 0 ? -36 : -41} stroke="#0a0e15" strokeWidth={i % 3 === 0 ? 4 : 2} transform={`rotate(${i * 30})`} />)}
        <line y2="-26" stroke="#0a0e15" strokeWidth="6" strokeLinecap="round" transform="rotate(300)" />
        <line y2="-38" stroke="#0a0e15" strokeWidth="4" strokeLinecap="round" transform={`rotate(${(t / 60) * 360 + 120})`} />
        <line y2="-42" stroke="#d9482b" strokeWidth="2" transform={`rotate(${Math.floor(t) * 6})`} />
        <circle r="4" fill="#0a0e15" />
      </g>
      {/* полка */}
      <g>
        <rect x="40" y="640" width="380" height="16" fill="#5a3d2a" stroke="#0a0e15" strokeWidth="4" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const h = 70 + rnd(i + 11) * 50;
          return <rect key={i} x={62 + i * 22} y={640 - h} width="19" height={h} fill={['#d9482b', '#2d6a8f', '#d9a441', '#4d7c6f', '#7a4b8f', '#c9c2b0', '#3a3f55'][i]} stroke="#0a0e15" strokeWidth="2" transform={i === 6 ? `rotate(8 ${62 + i * 22} 640)` : undefined} />;
        })}
        {/* горшок с растением */}
        <g transform="translate(300 640)">
          <path d="M-26 0 L -20 -44 H 20 L 26 0 Z" fill="#b5663a" stroke="#0a0e15" strokeWidth="3" />
          {[-40, -20, 0, 20, 40].map((a, i) => <path key={i} d={`M0 -44 Q ${a * 1.6 + sway * 6} ${-90 - (i % 2) * 20} ${a * 2.2 + sway * 10} ${-110 + Math.abs(a)}`} stroke="#3f8a56" strokeWidth="10" strokeLinecap="round" fill="none" />)}
        </g>
        {/* кружка и пар */}
        <g transform="translate(380 640)">
          <rect x="-18" y="-34" width="32" height="34" rx="5" fill="#e8e1cc" stroke="#0a0e15" strokeWidth="3" />
          <path d="M14 -26 q 14 2 0 18" stroke="#0a0e15" strokeWidth="4" fill="none" />
          {[0, 1, 2].map((k) => {
            const p = mod(t * 0.7 + k / 3, 1);
            return <path key={k} d={`M${-8 + k * 8} -38 q ${6 * Math.sin(p * 6)} -14 0 -26`} stroke="#dfe8ff" strokeWidth="3" fill="none" opacity={0.5 * (1 - p)} transform={`translate(0 ${-p * 40})`} />;
          })}
        </g>
      </g>
      {/* розетка + провод, выключатель */}
      <g>
        <rect x="560" y="520" width="34" height="54" rx="6" fill="#d6cfbc" stroke="#0a0e15" strokeWidth="3" /><rect x="570" y="530" width="14" height="22" fill="#9a937f" />
        <rect x="530" y="870" width="46" height="46" rx="8" fill="#d6cfbc" stroke="#0a0e15" strokeWidth="3" />
        <circle cx="544" cy="893" r="3" fill="#0a0e15" /><circle cx="562" cy="893" r="3" fill="#0a0e15" />
        <path d="M553 916 Q 553 980 480 1010 T 330 1060" stroke="#0a0e15" strokeWidth="5" fill="none" />
      </g>
      {/* дверь: детали */}
      <g>
        {[220, 520, 800].map((y) => <rect key={y} x="632" y={y} width="12" height="46" fill="#c9a85a" stroke="#0a0e15" strokeWidth="2" />)}
        <circle cx="805" cy="330" r="13" fill="#0a0e15" /><circle cx="805" cy="330" r="7" fill="#7aa4c8" opacity="0.7" />
        <rect x="770" y="230" width="70" height="46" rx="6" fill="#c9a85a" stroke="#0a0e15" strokeWidth="3" />
        <text x="805" y="264" textAnchor="middle" fontFamily="Montserrat, Arial" fontWeight="900" fontSize="34" fill="#0a0e15">13</text>
        <rect x="900" y="540" width="14" height="60" rx="7" fill="#c9a85a" stroke="#0a0e15" strokeWidth="2" />
        <path d="M900 420 H 950 M900 420 V 450" stroke="#c9a85a" strokeWidth="5" />
        <circle cx="900" cy="456" r="7" fill="#c9a85a" />
        <path d="M690 700 l 30 40 M700 690 l 28 38 M860 330 l 12 70" stroke="#2a1f19" strokeWidth="3" opacity="0.7" />
        {/* пыль в луче света */}
        {Array.from({length: 14}).map((_, i) => {
          const p = mod(t * 0.2 + rnd(i) , 1);
          return <circle key={i} cx={650 + rnd(i + 20) * 320 + Math.sin(t + i) * 10} cy={950 - p * 220} r={1.5 + rnd(i + 4) * 2} fill="#ffe3a3" opacity={0.5 * (1 - p)} />;
        })}
      </g>
      {/* коврик, доски пола, плинтус */}
      <g>
        {Array.from({length: 7}).map((_, i) => <line key={i} x1="0" x2="1080" y1={970 + i * i * 14 + i * 8} y2={970 + i * i * 14 + i * 8} stroke="#0f151e" strokeWidth={2 + i} opacity="0.7" />)}
        <rect x="0" y="930" width="1080" height="32" fill="#2a3547" /><rect x="0" y="928" width="1080" height="5" fill="#3d4b62" />
        <rect x="610" y="1020" width="400" height="110" rx="10" fill="#6b2d3a" stroke="#0a0e15" strokeWidth="4" />
        {Array.from({length: 8}).map((_, i) => <line key={i} x1={640 + i * 46} x2={640 + i * 46} y1="1028" y2="1122" stroke="#8a4352" strokeWidth="5" />)}
        <rect x="628" y="1038" width="364" height="72" fill="none" stroke="#d9a441" strokeWidth="4" strokeDasharray="12 8" />
      </g>
      {/* нижняя панель стены */}
      <path d="M0 780 H 1080" stroke="#0a0e15" strokeWidth="6" opacity="0.5" />
    </g>
  );
};

// ======== Доп. элементы интерфейса ========
export const HudExtras: React.FC<{t: number}> = ({t}) => {
  const fear = Math.min(10, 3 + t * 0.7);
  const noise = Math.min(10, 1 + (t > 5 ? (t - 5) * 2.2 : t * 0.3));
  const bpm = Math.round(78 + t * 4 + Math.sin(t * 6) * 2);
  const pts: string[] = [];
  for (let x = 0; x <= 220; x += 4) {
    const ph = mod(x + t * 140, 110);
    const y = ph > 48 && ph < 56 ? -26 : ph > 56 && ph < 62 ? 22 : ph > 20 && ph < 32 ? -6 : 0;
    pts.push(`${x},${y}`);
  }
  const bar = (label: string, v: number, color: string) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
      <span style={{width: 92, fontSize: 18, letterSpacing: 1, opacity: 0.85}}>{label}</span>
      <span style={{display: 'flex', gap: 3}}>
        {Array.from({length: 10}).map((_, i) => <span key={i} style={{width: 12, height: 16, borderRadius: 2, background: i < v ? color : 'rgba(255,255,255,0.15)'}} />)}
      </span>
    </div>
  );
  return (
    <>
      <div style={{position: 'absolute', left: 48, top: 160, display: 'flex', gap: 16, alignItems: 'center', color: '#fff', fontFamily: 'Montserrat, Arial', fontWeight: 700, fontSize: 20, opacity: 0.9}}>
        <svg width="40" height="26" viewBox="0 0 40 26">
          {[0, 1, 2, 3].map((i) => <rect key={i} x={i * 10} y={20 - i * 6} width="7" height={6 + i * 6} rx="1.5" fill={i < 3 ? '#fff' : 'rgba(255,255,255,0.3)'} />)}
        </svg>
        <svg width="56" height="26" viewBox="0 0 56 26">
          <rect x="1" y="3" width="46" height="20" rx="4" fill="none" stroke="#fff" strokeWidth="2.5" /><rect x="48" y="9" width="5" height="8" rx="1" fill="#fff" />
          <rect x="5" y="7" width={(34 - t * 1.2) * 1} height="12" rx="2" fill="#ff8a1f" />
        </svg>
        <span>ФОНАРЬ {Math.round(34 - t * 1.2)}%</span>
      </div>
      <div style={{position: 'absolute', right: 48, top: 160, width: 380, padding: '14px 18px', borderRadius: 16, background: 'rgba(10,13,20,0.6)', border: '2px solid rgba(255,255,255,0.14)', color: '#fff', fontFamily: 'Montserrat, Arial', fontWeight: 800, display: 'flex', flexDirection: 'column', gap: 10}}>
        {bar('СТРАХ', Math.round(fear), '#ff5a3a')}
        {bar('ШУМ', Math.round(noise), '#ffc233')}
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <span style={{color: '#ff5a3a', fontSize: 26, transform: `scale(${1 + 0.15 * Math.max(0, Math.sin(t * 9))})`}}>♥</span>
          <span style={{fontSize: 26}}>{bpm}</span>
          <svg width="210" height="60" viewBox="0 -34 220 68"><polyline points={pts.join(' ')} fill="none" stroke="#7dffb2" strokeWidth="3" strokeLinejoin="round" /></svg>
        </div>
      </div>
    </>
  );
};
