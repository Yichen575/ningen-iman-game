interface Props { onPlay: () => void; }

export default function LandingFooter({ onPlay }: Props) {
  return (
    <footer style={{
      position: 'relative', padding: '120px 48px 40px',
      background: `
        radial-gradient(ellipse at 50% 0%, rgba(255,107,26,0.2) 0%, transparent 50%),
        linear-gradient(180deg, #0b0f0c 0%, #000 100%)
      `,
      borderTop: '1px solid rgba(127,176,105,0.2)', overflow: 'hidden',
    }}>
      <div className="jp" style={{
        position: 'absolute', bottom: '-40%', left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 540, fontWeight: 800,
        color: 'rgba(255,107,26,0.04)', lineHeight: 1, pointerEvents: 'none',
      }}>忍</div>

      <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.4em', color: 'var(--orange)', marginBottom: 24 }}>
          ⊹ READY TO BEGIN?
        </div>
        <h2 className="jp" style={{ fontSize: 128, fontWeight: 800, lineHeight: 0.9, letterSpacing: '-0.03em', marginBottom: 32 }}>
          解き明かせ。
        </h2>
        <p className="serif" style={{
          fontSize: 24, fontStyle: 'italic', color: 'var(--paper-dim)',
          lineHeight: 1.5, maxWidth: 620, margin: '0 auto 48px',
        } as React.CSSProperties}>
          Unravel it. The first chapter is free, plays in your browser,
          and no account is ever required.
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 88 }}>
          <button onClick={onPlay} style={{
            background: 'var(--orange)', color: 'var(--ink)', border: 'none',
            padding: '20px 44px', fontFamily: 'Cormorant Garamond, serif',
            fontSize: 18, fontWeight: 700, letterSpacing: '0.25em',
            textTransform: 'uppercase', cursor: 'pointer',
            clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)',
            boxShadow: '0 0 60px rgba(255,107,26,0.4)',
            transition: 'background 150ms',
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--orange-bright)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--orange)'; }}
          >▶ Play Chapter 01</button>
          <button style={{
            background: 'transparent', color: 'var(--paper)',
            border: '1px solid rgba(242,239,230,0.3)',
            padding: '20px 32px', fontFamily: 'Cormorant Garamond, serif',
            fontSize: 15, letterSpacing: '0.25em', textTransform: 'uppercase', cursor: 'pointer',
          }}>Join Discord</button>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 32, borderTop: '1px solid rgba(127,176,105,0.15)',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
          letterSpacing: '0.3em', color: 'var(--paper-dim)', opacity: 0.6,
        }}>
          <span>人間未満 · NINGEN IMAN · © MMXXVI</span>
          <span>A NON-COMMERCIAL NARUTO FANWORK</span>
          <span>TWITTER · DISCORD · ITCH.IO</span>
        </div>
      </div>
    </footer>
  );
}
