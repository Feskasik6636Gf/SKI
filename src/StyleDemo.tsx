import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Montserrat';

const {fontFamily} = loadFont('normal', {weights: ['700', '800', '900'], subsets: ['cyrillic', 'latin']});

const C = {
  ink: '#10141b',
  night1: '#141b26',
  night2: '#2a3646',
  accent: '#ff8a1f',
  skin: '#e9b48f',
  skinShade: '#c98f69',
  hoodie: '#4d7c6f',
  hoodieShade: '#3b6358',
  pants: '#26324a',
  paper: '#f4efe4',
};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------- Персонаж ----------
const Head: React.FC<{lookX?: number; lookY?: number; blink?: number; mouth?: 'closed' | 'open' | 'worry'; brow?: number}> = ({
  lookX = 0, lookY = 0, blink = 0, mouth = 'closed', brow = 0,
}) => (
  <g>
    <defs>
      <clipPath id="headClip"><ellipse cx="0" cy="0" rx="230" ry="260" /></clipPath>
    </defs>
    {/* уши */}
    <ellipse cx="-228" cy="20" rx="34" ry="48" fill={C.skinShade} />
    <ellipse cx="228" cy="20" rx="34" ry="48" fill={C.skinShade} />
    {/* голова + плоская тень справа */}
    <ellipse cx="0" cy="0" rx="230" ry="260" fill={C.skin} />
    <g clipPath="url(#headClip)">
      <path d="M40 -280 C 120 -120, 120 120, 40 280 L 300 280 L 300 -280 Z" fill={C.skinShade} opacity="0.55" />
      {/* волосы */}
      <path d="M-250 -40 C -260 -260, -80 -300, 40 -290 C 200 -280, 260 -200, 250 -30 C 200 -120, 120 -150, 0 -150 C -120 -150, -190 -110, -250 -40 Z" fill="#2b2320" />
    </g>
    {/* брови */}
    <path d={`M-150 ${-62 + brow} Q -95 ${-95 + brow * 1.6} -40 ${-62 - brow}`} stroke="#2b2320" strokeWidth="20" strokeLinecap="round" fill="none" />
    <path d={`M40 ${-62 - brow} Q 95 ${-95 + brow * 1.6} 150 ${-62 + brow}`} stroke="#2b2320" strokeWidth="20" strokeLinecap="round" fill="none" />
    {/* глаза */}
    {[-92, 92].map((x) => (
      <g key={x} transform={`translate(${x} -10)`}>
        <ellipse cx="0" cy="0" rx="42" ry={36 * (1 - blink)} fill="#fff" />
        <ellipse cx={lookX} cy={lookY} rx="19" ry={19 * (1 - blink)} fill={C.ink} />
        <circle cx={lookX + 6} cy={lookY - 6} r="5" fill="#fff" opacity={1 - blink} />
      </g>
    ))}
    {/* нос */}
    <path d="M-8 50 Q 18 90 -14 98" stroke={C.skinShade} strokeWidth="12" strokeLinecap="round" fill="none" />
    {/* щетина-точки */}
    {Array.from({length: 26}).map((_, i) => (
      <circle key={i} cx={-110 + (i % 9) * 28 + (i % 2) * 8} cy={140 + Math.floor(i / 9) * 26 + (i % 3) * 5} r="3.5" fill="#6b4a36" opacity="0.55" />
    ))}
    {/* рот */}
    {mouth === 'closed' && <path d="M-60 165 Q 0 180 60 165" stroke="#7a3b32" strokeWidth="14" strokeLinecap="round" fill="none" />}
    {mouth === 'worry' && <path d="M-60 180 Q 0 150 60 180" stroke="#7a3b32" strokeWidth="14" strokeLinecap="round" fill="none" />}
    {mouth === 'open' && (
      <g>
        <ellipse cx="0" cy="175" rx="42" ry="30" fill="#5a1f1f" />
        <path d="M-30 160 Q 0 150 30 160 L 26 168 L -26 168 Z" fill="#fff" />
      </g>
    )}
  </g>
);

const Body: React.FC<{walk?: number}> = ({walk = 0}) => (
  <g>
    {/* ноги */}
    <rect x="-70" y="330" width="62" height="330" rx="22" fill={C.pants} transform={`rotate(${walk * 6} -40 330)`} />
    <rect x="8" y="330" width="62" height="330" rx="22" fill={C.pants} transform={`rotate(${-walk * 6} 40 330)`} />
    <ellipse cx="-44" cy="668" rx="52" ry="22" fill="#e9e6df" />
    <ellipse cx="44" cy="668" rx="52" ry="22" fill="#e9e6df" />
    {/* руки */}
    <rect x="-190" y="60" width="64" height="290" rx="30" fill={C.hoodie} />
    <rect x="126" y="60" width="64" height="290" rx="30" fill={C.hoodieShade} />
    {/* худи */}
    <path d="M-140 40 Q 0 -10 140 40 L 150 380 Q 0 410 -150 380 Z" fill={C.hoodie} />
    <path d="M30 20 L 140 40 L 150 380 Q 80 395 30 392 Z" fill={C.hoodieShade} opacity="0.7" />
    <path d="M-30 30 L -22 150 M 30 30 L 22 150" stroke="#e9e6df" strokeWidth="8" strokeLinecap="round" />
    <rect x="-70" y="250" width="140" height="70" rx="18" fill="none" stroke={C.hoodieShade} strokeWidth="8" />
  </g>
);

// ---------- Фоны ----------
const Stars: React.FC = () => (
  <g fill="#cfd8e8" opacity="0.7">
    {Array.from({length: 40}).map((_, i) => (
      <circle key={i} cx={(i * 197) % 1080} cy={(i * 131) % 700} r={(i % 3) + 1.5} opacity={0.4 + (i % 4) * 0.15} />
    ))}
  </g>
);

const Street: React.FC<{t: number}> = ({t}) => {
  const houses = [
    {x: -40, w: 260, h: 520, c: '#1b2230'},
    {x: 200, w: 200, h: 400, c: '#222b3a'},
    {x: 700, w: 220, h: 430, c: '#222b3a'},
    {x: 880, w: 260, h: 560, c: '#1b2230'},
  ];
  return (
    <g>
      <rect width="1080" height="1920" fill="url(#sky)" />
      <Stars />
      <circle cx="820" cy="260" r="80" fill="#f1ead2" opacity="0.9" />
      <circle cx="850" cy="240" r="80" fill="#141b26" opacity="0.18" />
      {houses.map((h, i) => (
        <g key={i}>
          <rect x={h.x} y={1000 - h.h} width={h.w} height={h.h} fill={h.c} />
          <polygon points={`${h.x - 12},${1000 - h.h} ${h.x + h.w / 2},${1000 - h.h - 90} ${h.x + h.w + 12},${1000 - h.h}`} fill="#10141b" />
          {Array.from({length: 6}).map((_, k) => {
            const lit = (i + k + Math.floor(t / 1.2)) % 3 === 0;
            return (
              <rect key={k} x={h.x + 30 + (k % 2) * 90} y={1000 - h.h + 50 + Math.floor(k / 2) * 110} width="56" height="70" rx="6"
                fill={lit ? '#ffc86b' : '#2f3b50'} opacity={lit ? 0.95 : 1} />
            );
          })}
        </g>
      ))}
      {/* земля */}
      <rect y="1000" width="1080" height="920" fill="#202a38" />
      {/* дорога в перспективе */}
      <polygon points="470,1000 610,1000 1000,1920 80,1920" fill="#2c3646" />
      {[0, 1, 2, 3, 4].map((i) => {
        const k = ((i + (t * 0.35) % 1) / 5);
        const y = 1000 + k * k * 920;
        const w = 4 + k * k * 34;
        return <rect key={i} x={540 - w / 2} y={y} width={w} height={10 + k * k * 120} fill="#d9d2b8" opacity="0.8" />;
      })}
      {/* фонарь */}
      <g>
        <rect x="150" y="760" width="14" height="520" fill="#0d1118" />
        <circle cx="157" cy="750" r="26" fill="#ffd98a" />
        <ellipse cx="157" cy="1290" rx="150" ry="40" fill="#ffd98a" opacity="0.12" />
        <polygon points="157,760 40,1290 280,1290" fill="#ffd98a" opacity="0.08" />
      </g>
    </g>
  );
};

const Room: React.FC<{t: number}> = ({t}) => {
  const glow = 0.5 + Math.sin(t * 5) * 0.15;
  return (
    <g>
      <rect width="1080" height="1920" fill="#1c2330" />
      {/* обои — полосы */}
      {Array.from({length: 9}).map((_, i) => (
        <rect key={i} x={i * 130} y="0" width="65" height="1920" fill="#202938" />
      ))}
      {/* дверь */}
      <rect x="640" y="140" width="330" height="820" rx="6" fill="#3a2c24" />
      <rect x="670" y="180" width="120" height="300" fill="#44342b" />
      <rect x="820" y="180" width="120" height="300" fill="#44342b" />
      <rect x="670" y="520" width="120" height="340" fill="#44342b" />
      <rect x="820" y="520" width="120" height="340" fill="#44342b" />
      <circle cx="660" cy="580" r="14" fill="#c9a85a" />
      {/* свет из-под двери */}
      <rect x="640" y="948" width="330" height="12" fill="#ffd98a" opacity={glow + 0.3} />
      <polygon points="640,960 970,960 1100,1100 560,1100" fill="#ffd98a" opacity={glow * 0.18} />
      {/* тень шагов под дверью */}
      <rect x={760 + Math.sin(t * 3) * 40} y="948" width="46" height="12" fill="#10141b" opacity="0.8" />
      {/* пол */}
      <rect y="960" width="1080" height="960" fill="#18202c" />
    </g>
  );
};

// ---------- Интерфейс ----------
const Pill: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 26px', borderRadius: 18,
    background: 'rgba(10,13,20,0.72)', border: '2px solid rgba(255,138,31,0.6)',
    color: '#fff', fontFamily, fontWeight: 800, fontSize: 34, letterSpacing: 1, ...style,
  }}>{children}</div>
);

const HUD: React.FC<{t: number; choice: number}> = ({t, choice}) => {
  const secs = 21 * 3600 + 40 * 60 + Math.floor(t * 20);
  const hh = String(Math.floor(secs / 3600)).padStart(2, '0');
  const mm = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  const blink = Math.floor(t * 2) % 2 === 0;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 48, top: 70}}>
        <Pill>
          <span style={{width: 18, height: 18, borderRadius: 9, background: '#ff3b3b', opacity: blink ? 1 : 0.25}} />
          <span>НОЧЬ 1</span>
          <span style={{color: C.accent}}>{t < 3.2 ? 'ДВОР' : 'ДОМ'}</span>
          <span style={{opacity: 0.9, marginLeft: 8}}>{hh}:{mm}:{ss}</span>
        </Pill>
      </div>
      <div style={{position: 'absolute', right: 48, top: 70}}>
        <Pill style={{fontSize: 28}}>
          <span>ВЫБОР</span>
          <span style={{display: 'flex', gap: 8}}>
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} style={{width: 24, height: 24, borderRadius: 6, border: '3px solid #fff', background: i < choice ? C.accent : 'transparent'}} />
            ))}
          </span>
        </Pill>
      </div>
    </AbsoluteFill>
  );
};

type Word = {w: string; hl?: boolean};
const Subtitle: React.FC<{words: Word[]; start: number; end: number; t: number; y: number}> = ({words, start, end, t, y}) => {
  const {fps} = useVideoConfig();
  if (t < start || t >= end) return null;
  const per = Math.min(0.28, (end - start - 0.3) / words.length);
  return (
    <div style={{
      position: 'absolute', left: 60, right: 60, top: y, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 26px',
      fontFamily, fontWeight: 900, fontSize: 112, lineHeight: 1.1, textAlign: 'center',
    }}>
      {words.map((x, i) => {
        const p = spring({frame: Math.round((t - start - i * per) * fps), fps, config: {damping: 12, stiffness: 220}});
        const shown = t >= start + i * per;
        return (
          <span key={i} style={{
            opacity: shown ? 1 : 0, transform: `scale(${0.6 + 0.4 * p}) translateY(${(1 - p) * 20}px)`,
            color: x.hl ? C.accent : '#fff', WebkitTextStroke: '14px #0a0d14', paintOrder: 'stroke fill',
            textShadow: x.hl ? '0 0 40px rgba(255,138,31,0.55)' : 'none',
          } as React.CSSProperties}>{x.w}</span>
        );
      })}
    </div>
  );
};

const ChoiceCard: React.FC<{label: string; color: string; x: number; t: number}> = ({label, color, x, t}) => {
  const {fps} = useVideoConfig();
  const p = spring({frame: Math.round((t - 7.4) * fps), fps, config: {damping: 13, stiffness: 160}});
  return (
    <div style={{
      position: 'absolute', left: x, top: 1370, width: 460, height: 200, borderRadius: 30, background: color,
      border: '6px solid #0a0d14', boxShadow: '0 14px 0 #0a0d14', color: '#fff', fontFamily, fontWeight: 900, fontSize: 58,
      display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', lineHeight: 1.1, padding: 20,
      transform: `translateY(${(1 - Math.max(0, Math.min(1, p))) * 300}px) scale(${0.8 + 0.2 * Math.max(0, Math.min(1, p))})`,
    }}>{label}</div>
  );
};

const Countdown: React.FC<{t: number}> = ({t}) => {
  const left = Math.max(0, 3 - (t - 7.4));
  const n = Math.ceil(left);
  const frac = (left % 1) || (left === 3 ? 1 : 0);
  const R = 70;
  return (
    <div style={{position: 'absolute', left: 540 - 90, top: 1640, width: 180, height: 180}}>
      <svg width="180" height="180" viewBox="-90 -90 180 180">
        <circle r={R} fill="rgba(10,13,20,0.85)" stroke="#fff" strokeOpacity="0.2" strokeWidth="12" />
        <circle r={R} fill="none" stroke={C.accent} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={2 * Math.PI * R} strokeDashoffset={(1 - frac) * 2 * Math.PI * R} transform="rotate(-90)" />
        <text y="22" textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize="68" fill="#fff">{n}</text>
      </svg>
    </div>
  );
};

// ---------- Сцены ----------
const SceneWide: React.FC<{t: number}> = ({t}) => {
  const k = interpolate(t, [0, 3.2], [1, 1.12], {...clamp, easing: Easing.out(Easing.quad)});
  const walk = Math.sin(t * 5);
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{position: 'absolute'}}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f1520" />
          <stop offset="0.55" stopColor="#2a3646" />
          <stop offset="1" stopColor="#3b4a5e" />
        </linearGradient>
        <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.5" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.65" />
        </radialGradient>
      </defs>
      <g transform={`translate(540 1000) scale(${k}) translate(-540 -1000)`}>
        <Street t={t} />
        <g transform="translate(540 1070) scale(0.38)">
          <ellipse cx="0" cy="690" rx="190" ry="34" fill="#000" opacity="0.35" />
          <Body walk={walk * 0.2} />
          <g transform="translate(0 -170) scale(0.62)"><Head lookX={Math.sin(t * 1.5) * 8} blink={Math.sin(t * 2.3) > 0.97 ? 1 : 0} /></g>
        </g>
      </g>
      <rect width="1080" height="1920" fill="url(#vig)" />
    </svg>
  );
};

const SceneClose: React.FC<{t: number; t0: number; tight?: boolean}> = ({t, t0, tight}) => {
  const k = interpolate(t, [t0, t0 + 3.4], tight ? [0.62, 0.56] : [1.05, 1.22], clamp);
  const lx = Math.sin((t - t0) * 2.1) * 12;
  const looking = t - t0 > 1.4 ? 15 : lx;
  const blink = Math.sin(t * 3.1) > 0.985 ? 1 : 0;
  const mouth: 'closed' | 'worry' | 'open' = t - t0 < 1.5 ? 'closed' : t < 6.8 ? 'worry' : 'open';
  const brow = t - t0 > 1.4 ? 14 : 0;
  const y = tight ? 640 : 900;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{position: 'absolute'}}>
      <defs>
        <radialGradient id="vig2" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.45" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.75" />
        </radialGradient>
      </defs>
      <Room t={t} />
      <g transform={`translate(${tight ? 420 : 540} ${y}) scale(${k})`}>
        <rect x="-75" y="190" width="150" height="190" rx="40" fill={C.skinShade} />
        <path d="M-340 560 Q -320 330 -90 318 L 0 395 L 90 318 Q 320 330 340 560 L 340 1300 L -340 1300 Z" fill={C.hoodie} />
        <path d="M70 330 Q 320 340 340 560 L 340 1300 L 70 1300 Z" fill={C.hoodieShade} opacity="0.7" />
        <path d="M-90 318 L 0 395 L 90 318 Q 0 300 -90 318 Z" fill="#2b4a42" />
        <path d="M-40 400 L -34 600 M 40 400 L 34 600" stroke="#e9e6df" strokeWidth="10" strokeLinecap="round" />
        <Head lookX={looking} lookY={t - t0 > 1.4 ? -4 : 0} blink={blink} mouth={mouth} brow={brow} />
      </g>
      <rect width="1080" height="1920" fill="url(#vig2)" />
    </svg>
  );
};

export const StyleDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const flash = (at: number) => interpolate(t, [at - 0.08, at, at + 0.12], [0, 1, 0], clamp);
  const dip = Math.max(flash(3.2), flash(6.8));
  const fadeInOut = interpolate(t, [0, 0.4, 9.6, 10], [1, 0, 0, 1], clamp);

  return (
    <AbsoluteFill style={{backgroundColor: C.night1}}>
      {t < 3.2 && <SceneWide t={t} />}
      {t >= 3.2 && t < 6.8 && <SceneClose t={t} t0={3.2} />}
      {t >= 6.8 && <SceneClose t={t} t0={6.8} tight />}
      <HUD t={t} choice={t < 6.8 ? 0 : 1} />

      <Subtitle t={t} start={0.3} end={1.7} y={1380} words={[{w: 'ТЫ'}, {w: 'ОСТАЁШЬСЯ'}]} />
      <Subtitle t={t} start={1.7} end={3.2} y={1380} words={[{w: 'ОДИН'}, {w: 'НА'}, {w: 'НОЧЬ', hl: true}]} />
      <Subtitle t={t} start={3.3} end={5} y={1560} words={[{w: 'ЗА'}, {w: 'ДВЕРЬЮ'}]} />
      <Subtitle t={t} start={5} end={6.8} y={1560} words={[{w: 'СЛЫШНЫ'}, {w: 'ШАГИ', hl: true}]} />
      <Subtitle t={t} start={6.9} end={10} y={1090} words={[{w: 'ТВОЙ'}, {w: 'ВЫБОР', hl: true}]} />

      {t >= 7.4 && <ChoiceCard t={t} x={60} label="ОТКРЫТЬ ДВЕРЬ" color="#d9482b" />}
      {t >= 7.4 && <ChoiceCard t={t} x={560} label="ЖДАТЬ ТИХО" color="#2d6a8f" />}
      {t >= 7.4 && <Countdown t={t} />}

      <AbsoluteFill style={{backgroundColor: '#000', opacity: Math.max(dip * 0.9, fadeInOut), pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
