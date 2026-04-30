interface Props { onPlay: () => void; }

export default function LandingHeroC({ onPlay }: Props) {
  return (
    <section style={{
      position: 'relative', minHeight: '100vh',
      background: `
        radial-gradient(ellipse at center, rgba(31,69,48,0.4) 0%, transparent 60%),
        radial-gradient(ellipse at 50% 100%, rgba(255,107,26,0.18) 0%, transparent 50%),
        linear-gradient(180deg, #0b0f0c, #0f1612)
      `,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      paddingTop: 110, paddingBottom: 56,
    }}>
      <div className="jp" style={{
        position: 'absolute', top: '42%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: 'clamp(320px, 46vw, 640px)',
        fontWeight: 800, color: 'rgba(127,176,105,0.035)',
        lineHeight: 0.85, letterSpacing: '-0.05em',
        pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap',
      }}>未満</div>

      <div style={{
        position: 'relative', padding: '0 48px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
        letterSpacing: '0.35em', color: 'var(--paper-dim)', opacity: 0.6,
        flexWrap: 'wrap', gap: 16, zIndex: 3,
      }}>
        <span>⊹ AN INTERACTIVE NARRATIVE PUZZLE</span>
        <span style={{ color: 'var(--orange)' }}>◉ NOW IN PUBLIC BETA</span>
        <span>MMXXVI · CHAPTER ONE</span>
      </div>

      <div style={{
        position: 'relative', flex: '0 0 auto', width: '100%',
        padding: '40px 48px',
        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center', gap: 'clamp(16px, 3vw, 48px)', zIndex: 2,
      }}>
        <div style={{ textAlign: 'right', minWidth: 0 }}>
          <div className="jp" style={{ fontSize: 'clamp(72px, 12vw, 200px)', fontWeight: 800, lineHeight: 0.82, letterSpacing: '-0.04em', color: 'var(--paper)' }}>人間</div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.35em', color: 'var(--leaf-glow)', marginTop: 12, opacity: 0.8 }}>NIN · GEN</div>
        </div>

        {/* CENTER frame */}
        <div style={{ width: 'clamp(180px, 20vw, 260px)', aspectRatio: '2/3', position: 'relative', flexShrink: 0 }}>
          <div style={{ position: 'absolute', inset: -14, border: '1px solid rgba(127,176,105,0.35)' }} />
          <div style={{
            position: 'absolute', inset: 0, border: '1px solid var(--orange)',
            background: `
              radial-gradient(ellipse at center 30%, rgba(255,107,26,0.3), transparent 60%),
              linear-gradient(180deg, #1a2320, #0b0f0c)
            `,
            overflow: 'hidden',
          }}>
            <svg viewBox="0 0 200 300" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
              <defs>
                <radialGradient id="sunC2" cx="0.5" cy="0.4" r="0.7">
                  <stop offset="0%" stopColor="#ffb371" />
                  <stop offset="100%" stopColor="#c94a0a" />
                </radialGradient>
              </defs>
              <circle cx="100" cy="105" r="70" fill="url(#sunC2)" />
              <text x="100" y="125" textAnchor="middle" fill="#1a2320" fontSize="62" fontWeight="800" fontFamily="Shippori Mincho, serif" opacity="0.4">謎</text>
              <circle cx="128" cy="92" r="68" fill="#0b0f0c" opacity="0.92" />
              <g fill="#0b0f0c">
                <path d="M55 140 L68 105 L85 128 L95 110 L108 130 L120 108 L132 130 L148 115 L148 165 L55 165 Z" />
                <path d="M60 165 L140 165 L150 300 L50 300 Z" />
              </g>
              <rect x="55" y="148" width="90" height="10" fill="#0b0f0c" />
              <rect x="55" y="148" width="90" height="2.5" fill="#2d5e3e" />
              <circle cx="100" cy="153" r="5" fill="none" stroke="#c1121f" strokeWidth="1.2" />
              <circle cx="86" cy="175" r="1.5" fill="#ff6b1a" />
              <circle cx="114" cy="175" r="1.5" fill="#ff6b1a" />
            </svg>
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '18px 14px 12px',
              background: 'linear-gradient(180deg, transparent, rgba(11,15,12,0.95))',
              textAlign: 'center',
            }}>
              <div className="jp" style={{ fontSize: 13, color: 'var(--orange)', fontWeight: 700, letterSpacing: '0.25em' }}>被疑者·01</div>
              <div className="mono" style={{ fontSize: 8, color: 'var(--paper-dim)', letterSpacing: '0.3em', marginTop: 4 }}>SUSPECT·01 · "ARCHIVIST"</div>
            </div>
          </div>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              position: 'absolute',
              top: i < 2 ? -18 : 'auto', bottom: i >= 2 ? -18 : 'auto',
              left: i % 2 === 0 ? -18 : 'auto', right: i % 2 === 1 ? -18 : 'auto',
              width: 14, height: 14,
              borderTop: i < 2 ? '2px solid var(--orange)' : 'none',
              borderBottom: i >= 2 ? '2px solid var(--orange)' : 'none',
              borderLeft: i % 2 === 0 ? '2px solid var(--orange)' : 'none',
              borderRight: i % 2 === 1 ? '2px solid var(--orange)' : 'none',
            }} />
          ))}
        </div>

        <div style={{ minWidth: 0 }}>
          <div className="jp" style={{ fontSize: 'clamp(72px, 12vw, 200px)', fontWeight: 800, lineHeight: 0.82, letterSpacing: '-0.04em', color: 'var(--orange)' }}>未満</div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.35em', color: 'var(--leaf-glow)', marginTop: 12, opacity: 0.8, textAlign: 'right' }}>I · MAN</div>
        </div>
      </div>

      <div style={{ position: 'relative', padding: '48px 48px 0', textAlign: 'center', zIndex: 5 }}>
        <p className="serif" style={{
          fontSize: 22, fontStyle: 'italic', color: 'var(--paper-dim)',
          lineHeight: 1.55, marginBottom: 28, maxWidth: 640,
          marginLeft: 'auto', marginRight: 'auto',
        } as React.CSSProperties}>
          A puzzle of chakra, memory, and twenty-four forbidden kanji.<br />
          Solve the village. Become less than human.
        </p>
        <button onClick={onPlay} style={{
          background: 'var(--orange)', color: 'var(--ink)', border: 'none',
          padding: '18px 44px', fontFamily: 'Cormorant Garamond, serif',
          fontSize: 17, fontWeight: 700, letterSpacing: '0.3em',
          textTransform: 'uppercase', cursor: 'pointer',
          clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)',
          boxShadow: '0 0 60px rgba(255,107,26,0.35)',
          transition: 'background 150ms',
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--orange-bright)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--orange)'; }}
        >▶ Enter the Village</button>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{
        position: 'relative', padding: '24px 48px 0', marginTop: 32,
        borderTop: '1px solid rgba(127,176,105,0.2)',
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
        letterSpacing: '0.3em', color: 'var(--paper-dim)', opacity: 0.6,
        flexWrap: 'wrap', gap: 16,
      }}>
        <span>FAN WORK · NON-COMMERCIAL</span>
        <span>↓ 物語を追え · FOLLOW THE STORY</span>
        <span>◉ 1,247 ONLINE</span>
      </div>
    </section>
  );
}
