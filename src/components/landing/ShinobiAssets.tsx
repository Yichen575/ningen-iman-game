import React from 'react';

export function PaperTexture({ opacity = 0.18 }: { opacity?: number }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      opacity,
      mixBlendMode: 'overlay' as React.CSSProperties['mixBlendMode'],
      backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(`
        <svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
          <filter id='n'>
            <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='4'/>
            <feColorMatrix values='0 0 0 0 0.05  0 0 0 0 0.05  0 0 0 0 0.05  0 0 0 0.6 0'/>
          </filter>
          <rect width='100%' height='100%' filter='url(#n)' opacity='0.9'/>
        </svg>
      `)}")`,
    }} />
  );
}

export function HankoSeal({ char = '了', size = 64, color = '#c1121f', rotate = -8 }: {
  char?: string; size?: number; color?: string; rotate?: number;
}) {
  return (
    <div style={{
      width: size, height: size,
      display: 'inline-grid', placeItems: 'center',
      transform: `rotate(${rotate}deg)`,
      position: 'relative',
    }}>
      <svg viewBox="0 0 80 80" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <filter id={`seal-${char}-${size}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" />
            <feDisplacementMap in="SourceGraphic" scale="2" />
          </filter>
        </defs>
        <rect x="6" y="6" width="68" height="68" fill={color} filter={`url(#seal-${char}-${size})`} opacity="0.92" />
        <rect x="10" y="10" width="60" height="60" fill="none" stroke="#fff5e6" strokeWidth="1.5" opacity="0.6" />
      </svg>
      <span className="jp" style={{
        position: 'relative', zIndex: 1,
        color: '#fff5e6',
        fontSize: size * 0.55, fontWeight: 800,
        lineHeight: 1,
      }}>{char}</span>
    </div>
  );
}

export function Kunai({ size = 80, rotate = 0, color = '#7fb069', opacity = 0.28 }: {
  size?: number; rotate?: number; color?: string; opacity?: number;
}) {
  return (
    <svg viewBox="0 0 40 100" style={{ width: size * 0.4, height: size, transform: `rotate(${rotate}deg)`, opacity }}>
      <path d="M20 4 L28 22 L24 24 L24 64 L26 64 L26 70 L14 70 L14 64 L16 64 L16 24 L12 22 Z"
        fill={color} stroke={color} strokeWidth="0.5" />
      <rect x="17" y="70" width="6" height="14" fill={color} />
      <path d="M14 84 Q20 90 26 84 L26 92 Q20 98 14 92 Z" fill="none" stroke={color} strokeWidth="1" />
      <circle cx="20" cy="14" r="1.5" fill="#0b0f0c" />
    </svg>
  );
}

export function Shuriken({ size = 60, rotate = 0, color = '#ff6b1a', opacity = 0.22 }: {
  size?: number; rotate?: number; color?: string; opacity?: number;
}) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size, transform: `rotate(${rotate}deg)`, opacity }}>
      <path d="M50 10 L58 42 L90 50 L58 58 L50 90 L42 58 L10 50 L42 42 Z"
        fill={color} stroke={color} strokeWidth="1" />
      <circle cx="50" cy="50" r="6" fill="#0b0f0c" stroke={color} strokeWidth="1" />
    </svg>
  );
}

export function Fuuda({ size = 80, rotate = 0, opacity = 0.26 }: {
  size?: number; rotate?: number; opacity?: number;
}) {
  return (
    <svg viewBox="0 0 60 110" style={{ width: size * 0.55, height: size, transform: `rotate(${rotate}deg)`, opacity }}>
      <defs>
        <filter id={`fuuda-${rotate}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" />
          <feDisplacementMap in="SourceGraphic" scale="3" />
        </filter>
      </defs>
      <path d="M8 4 L52 4 L52 100 L30 108 L8 100 Z" fill="#e8dfc9" stroke="#7a6a4a" strokeWidth="0.8" filter={`url(#fuuda-${rotate})`} />
      <text x="30" y="32" textAnchor="middle" fill="#c1121f" fontSize="20" fontWeight="800" fontFamily="serif">封</text>
      <text x="30" y="58" textAnchor="middle" fill="#c1121f" fontSize="18" fontWeight="800" fontFamily="serif">印</text>
      <line x1="14" y1="72" x2="46" y2="72" stroke="#c1121f" strokeWidth="0.6" />
      <text x="30" y="86" textAnchor="middle" fill="#7a6a4a" fontSize="9" fontFamily="monospace">04·17</text>
    </svg>
  );
}

export function Mudra({ size = 70, color = '#7fb069', opacity = 0.25 }: {
  size?: number; color?: string; opacity?: number;
}) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size, opacity }}>
      <circle cx="50" cy="50" r="44" fill="none" stroke={color} strokeWidth="0.8" />
      <circle cx="50" cy="50" r="36" fill="none" stroke={color} strokeWidth="0.4" />
      <path d="M50 14 L50 86 M14 50 L86 50 M24 24 L76 76 M76 24 L24 76" stroke={color} strokeWidth="0.5" />
      <text x="50" y="56" textAnchor="middle" fill={color} fontSize="22" fontWeight="800" fontFamily="serif">印</text>
    </svg>
  );
}
