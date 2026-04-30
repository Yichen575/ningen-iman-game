import { useState } from 'react';

interface Props { onPlay: () => void; }

export default function LandingHeroB({ onPlay }: Props) {
  const [hover, setHover] = useState<number | null>(null);

  const glyphs = [
    '謎', '影', '忍', '刃', '雨', '夢', '血', '器',
    '闇', '月', '蛇', '刀', '眼', '魂', '音', '鎖',
    '炎', '風', '水', '雷', '土', '霧', '毒', '縁'
  ];

  return (
    <section style={{
      position: 'relative', minHeight: '100vh',
      background: 'linear-gradient(180deg, #0b0f0c 0%, #0f1612 60%, #0b0f0c 100%)',
      overflow: 'hidden', paddingTop: 80,
    }}>
      <div style={{
        position: 'relative', display: 'grid',
        gridTemplateColumns: '0.9fr 1.1fr',
        minHeight: 'calc(100vh - 80px)',
      }}>
        {/* LEFT */}
        <div style={{
          padding: '130px 48px 60px 80px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          borderRight: '1px solid rgba(127,176,105,0.2)', position: 'relative',
        }}>
          <div className="mono" style={{
            position: 'absolute', top: 44, left: 80,
            fontSize: 10, letterSpacing: '0.3em', color: 'var(--orange)',
          }}>▚ CASE · 04 · THE ARCHIVIST</div>

          <div className="jp" style={{ fontSize: 13, color: 'var(--leaf-glow)', letterSpacing: '0.5em', marginBottom: 28, opacity: 0.9 }}>
            木ノ葉隠れの里 · 第四話
          </div>

          <h1 className="jp" style={{ fontSize: 118, lineHeight: 0.88, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 20 }}>
            人間<br />
            <span style={{ color: 'var(--orange)', WebkitTextStroke: '2px var(--orange)', WebkitTextFillColor: 'transparent' } as React.CSSProperties}>未満</span>
          </h1>

          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 16,
            borderBottom: '1px solid rgba(242,239,230,0.15)',
            paddingBottom: 20, marginBottom: 28,
          }}>
            <span className="serif" style={{ fontSize: 28, fontStyle: 'italic' }}>Ningen Iman</span>
            <span className="mono" style={{ fontSize: 10, opacity: 0.5, letterSpacing: '0.2em' }}>NOT·YET·HUMAN</span>
          </div>

          <p className="serif" style={{
            fontSize: 19, lineHeight: 1.6, color: 'var(--paper-dim)',
            fontStyle: 'italic', marginBottom: 36, maxWidth: 460,
          } as React.CSSProperties}>
            Decrypt the ribs. Interrogate the ghosts. Twenty-four kanji stand between
            you and the name of the thing wearing your Hokage's face.
          </p>

          <div style={{ display: 'flex', gap: 12, marginBottom: 48 }}>
            <button onClick={onPlay} style={{
              background: 'var(--orange)', color: 'var(--ink)', border: 'none',
              padding: '16px 28px', fontFamily: 'Cormorant Garamond, serif',
              fontSize: 16, fontWeight: 700, letterSpacing: '0.2em',
              textTransform: 'uppercase', cursor: 'pointer',
              clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%, 10px 50%)',
            }}>▶ Begin Investigation</button>
            <button style={{
              background: 'transparent', color: 'var(--paper)',
              border: '1px solid rgba(242,239,230,0.25)',
              padding: '16px 22px', fontFamily: 'Cormorant Garamond, serif',
              fontSize: 14, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer',
            }}>Read Prologue</button>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20, paddingTop: 24,
            borderTop: '1px solid rgba(127,176,105,0.2)',
          }}>
            {[{ n: '8', l: 'CHAPTERS' }, { n: '127', l: 'PUZZLES' }, { n: '∞', l: 'CIPHERS' }].map((s, i) => (
              <div key={i}>
                <div className="jp" style={{ fontSize: 38, fontWeight: 800, color: 'var(--paper)', lineHeight: 1 }}>{s.n}</div>
                <div className="mono" style={{ fontSize: 9, color: 'var(--paper-dim)', letterSpacing: '0.3em', marginTop: 8, opacity: 0.7 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: cipher grid */}
        <div style={{
          position: 'relative', padding: '130px 48px 140px',
          background: `
            radial-gradient(ellipse at 80% 20%, rgba(255,107,26,0.1), transparent 50%),
            linear-gradient(135deg, #0f1612, #1a2320)
          `,
        }}>
          <div className="mono" style={{
            position: 'absolute', top: 44, left: 48, right: 48,
            fontSize: 10, letterSpacing: '0.3em', color: 'var(--leaf-glow)',
            display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
          }}>
            <span>EVIDENCE · CIPHER GRID · 24/24</span>
            <span style={{ color: 'var(--paper-dim)', opacity: 0.6 }}>◉ HOVER TO DECRYPT</span>
          </div>

          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'grid', gridTemplateColumns: 'repeat(6, 72px)', gap: 6,
          }}>
            {glyphs.map((g, i) => {
              const isKey = [2, 7, 14, 19].includes(i);
              const isHov = hover === i;
              return (
                <div key={i}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  style={{
                    aspectRatio: '1', display: 'grid', placeItems: 'center',
                    border: `1px solid ${isKey ? 'var(--orange)' : 'rgba(127,176,105,0.25)'}`,
                    background: isHov ? 'var(--orange)' : isKey ? 'rgba(255,107,26,0.08)' : 'rgba(11,15,12,0.5)',
                    color: isHov ? 'var(--ink)' : isKey ? 'var(--orange)' : 'var(--paper)',
                    fontFamily: 'Shippori Mincho, serif',
                    fontSize: 36, fontWeight: 800,
                    cursor: 'pointer', position: 'relative', transition: 'all 150ms',
                  }}>
                  {g}
                  {isKey && <div className="mono" style={{ position: 'absolute', top: 4, right: 5, fontSize: 7, letterSpacing: '0.1em', color: isHov ? 'var(--ink)' : 'var(--orange)' }}>◆</div>}
                  <div className="mono" style={{ position: 'absolute', bottom: 3, left: 5, fontSize: 7, opacity: isHov ? 0.8 : 0.35 }}>{String(i + 1).padStart(2, '0')}</div>
                </div>
              );
            })}
          </div>

          <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} width="100%" height="100%">
            <line x1="30%" y1="38%" x2="68%" y2="52%" stroke="var(--blood)" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
            <line x1="42%" y1="40%" x2="58%" y2="68%" stroke="var(--blood)" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
            <circle cx="30%" cy="38%" r="4" fill="none" stroke="var(--blood)" strokeWidth="1" />
            <circle cx="68%" cy="52%" r="4" fill="none" stroke="var(--blood)" strokeWidth="1" />
          </svg>

          <div style={{
            position: 'absolute', bottom: 48, left: 48, right: 48,
            padding: '14px 18px',
            border: '1px solid rgba(127,176,105,0.3)',
            background: 'rgba(11,15,12,0.7)',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
            letterSpacing: '0.15em', color: 'var(--leaf-glow)',
          }}>
            <span style={{ opacity: 0.5 }}>DECODING {'>'} </span>
            <span className="jp" style={{ color: 'var(--orange)' }}>忍は人間未満</span>
            <span style={{ opacity: 0.5 }}> / </span>
            <span>THE SHINOBI IS NOT YET HUMAN</span>
            <span style={{ float: 'right', color: 'var(--orange)', opacity: 0.7 }}>◆ 4/24</span>
          </div>
        </div>
      </div>
    </section>
  );
}
