export default function LandingLore() {
  return (
    <section id="lore" style={{
      position: 'relative', padding: '160px 48px 140px',
      background: `linear-gradient(180deg, #0b0f0c 0%, #0f1612 40%, #121814 100%)`,
      overflow: 'hidden', borderTop: '1px solid rgba(127,176,105,0.15)',
    }}>
      <div className="jp" style={{
        position: 'absolute', top: '10%', right: '-8%',
        fontSize: 620, fontWeight: 800,
        color: 'rgba(255,107,26,0.025)', lineHeight: 0.85,
        pointerEvents: 'none', userSelect: 'none',
      }}>謎</div>

      <div style={{ position: 'relative', maxWidth: 1440, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto',
          alignItems: 'end', gap: 40, marginBottom: 96,
          paddingBottom: 32, borderBottom: '1px solid rgba(127,176,105,0.25)',
        }}>
          <div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: '0.35em', color: 'var(--orange)', marginBottom: 18 }}>
              ⊹ CHAPTER · 00 · PROLOGUE
            </div>
            <h2 className="jp" style={{ fontSize: 96, fontWeight: 800, lineHeight: 0.95, letterSpacing: '-0.02em' }}>
              物語<span style={{ color: 'var(--orange)', fontSize: 72, verticalAlign: 'middle', marginLeft: 20, opacity: 0.7 }}>— THE STORY</span>
            </h2>
          </div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.3em', color: 'var(--paper-dim)', opacity: 0.6, textAlign: 'right', lineHeight: 1.8 }}>
            SECTION 02 / 04<br />
            <span style={{ color: 'var(--leaf-glow)' }}>◉ LEAF · Y·27</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 64, alignItems: 'start' }}>
          <div>
            <div className="jp" style={{ fontSize: 14, letterSpacing: '0.4em', color: 'var(--leaf-glow)', marginBottom: 24 }}>一 · 事件</div>
            <p className="serif" style={{ fontSize: 30, lineHeight: 1.45, fontStyle: 'italic', color: 'var(--paper)', marginBottom: 28 } as React.CSSProperties}>
              "They found <span style={{ color: 'var(--orange)', fontStyle: 'normal' }}>Watanabe Nakamura</span> slumped
              against the C-rank shelves, a brush still in his hand and
              <span style={{ color: 'var(--orange)', fontStyle: 'normal' }}> twenty-four kanji</span>
              burned into his ribs like a confession he could not finish."
            </p>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.3em', color: 'var(--paper-dim)', opacity: 0.7, paddingLeft: 20, borderLeft: '2px solid var(--orange)' }}>
              — CORONER'S SCROLL · 04·17·Y·27<br />
              <span style={{ opacity: 0.6 }}>FILED BY: HATAKE. K.</span>
            </div>
          </div>

          <div>
            <div className="jp" style={{ fontSize: 14, letterSpacing: '0.4em', color: 'var(--leaf-glow)', marginBottom: 24 }}>二 · 任務</div>
            <p className="serif" style={{ fontSize: 18, lineHeight: 1.7, color: 'var(--paper-dim)' } as React.CSSProperties}>
              You are <span style={{ color: 'var(--paper)', fontWeight: 600 }}>Inspector Kuon</span>,
              a low-ranked Chūnin from the cryptography corps, handed this case because
              no one above you wants their name on it. The Hokage's office has given you
              <span style={{ color: 'var(--orange)' }}> three weeks</span> before the scandal
              reaches Suna. You have a notebook, a cipher key burned at one corner, and a
              feeling the archives are watching you back.
            </p>
          </div>

          <div>
            <div className="jp" style={{ fontSize: 14, letterSpacing: '0.4em', color: 'var(--leaf-glow)', marginBottom: 24 }}>三 · 遊び方</div>
            <p className="serif" style={{ fontSize: 18, lineHeight: 1.7, color: 'var(--paper-dim)', marginBottom: 24 } as React.CSSProperties}>
              Interrogate. Decrypt. Sneak across the rooftops at dusk to read a scroll
              before it burns. Every chapter is a locked room; every side-scrolling
              stealth section is a piece you'll need to read the next one.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 18px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.15em', color: 'var(--paper-dim)' }}>
              <span style={{ color: 'var(--orange)' }}>◆</span> <span>Visual novel + 2D stealth</span>
              <span style={{ color: 'var(--orange)' }}>◆</span> <span>Kanji cipher puzzles</span>
              <span style={{ color: 'var(--orange)' }}>◆</span> <span>Branching interrogations</span>
              <span style={{ color: 'var(--orange)' }}>◆</span> <span>12+ hour mystery</span>
            </div>
          </div>
        </div>

        <div style={{
          marginTop: 120, padding: '36px 0',
          borderTop: '1px solid rgba(127,176,105,0.2)',
          borderBottom: '1px solid rgba(127,176,105,0.2)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: 20, overflow: 'hidden',
        }}>
          {'謎·影·忍·刃·雨·夢·血·器·闇·月·刀·眼'.split('·').map((g, i) => (
            <div key={i} className="jp" style={{
              fontSize: 42, fontWeight: 700,
              color: i % 3 === 0 ? 'var(--orange)' : 'var(--leaf-glow)',
              opacity: i % 3 === 0 ? 0.9 : 0.3,
              letterSpacing: '0.05em',
            }}>{g}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
