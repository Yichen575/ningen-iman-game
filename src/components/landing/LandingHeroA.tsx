import { useState, useEffect } from 'react';

interface Props { onPlay: () => void; }

export default function LandingHeroA({ onPlay }: Props) {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [time, setTime] = useState(0);

  useEffect(() => {
    const handler = (e: MouseEvent) => setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener('mousemove', handler);
    const id = setInterval(() => setTime(t => t + 1), 80);
    return () => { window.removeEventListener('mousemove', handler); clearInterval(id); };
  }, []);

  const parallax = (amt: number) => ({
    transform: `translate(${(mouse.x - 0.5) * amt}px, ${(mouse.y - 0.5) * amt}px)`
  });

  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse at 30% 20%, rgba(255,107,26,0.12) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 80%, rgba(127,176,105,0.15) 0%, transparent 55%),
        linear-gradient(180deg, #0b0f0c 0%, #121814 100%)
      `,
      overflow: 'hidden',
    }}>
      {/* grid backdrop */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(127,176,105,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(127,176,105,0.06) 1px, transparent 1px)
        `,
        backgroundSize: '64px 64px',
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
      } as React.CSSProperties} />

      {/* floating cipher glyphs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {['謎', '影', '忍', '刃', '雨', '夢', '血', '器'].map((g, i) => (
          <div key={i} className="jp" style={{
            position: 'absolute',
            left: `${(i * 137) % 100}%`,
            top: `${(i * 83) % 100}%`,
            fontSize: 24 + (i % 4) * 18,
            color: 'rgba(127,176,105,0.07)',
            fontWeight: 800,
            transform: `translate(-50%, -50%) rotate(${(i * 23) % 30 - 15}deg) translate(${(mouse.x - 0.5) * ((i % 3) * 4 + 2)}px, ${(mouse.y - 0.5) * ((i % 3) * 4 + 2)}px)`,
          }}>{g}</div>
        ))}
      </div>

      {/* Top metadata strip */}
      <div style={{
        position: 'absolute', top: 92, left: 48, right: 48,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
        color: 'var(--paper-dim)', opacity: 0.55, letterSpacing: '0.3em',
      }}>
        <span>◉ CH.00 — PROLOGUE</span>
        <span>機密 / CLASSIFIED</span>
        <span>木ノ葉隠れの里 · HIDDEN.LEAF</span>
      </div>

      {/* Main content grid */}
      <div style={{
        position: 'relative', maxWidth: 1440, margin: '0 auto',
        padding: '160px 48px 80px',
        display: 'grid', gridTemplateColumns: '1.3fr 1fr',
        gap: 64, alignItems: 'center', minHeight: '100vh',
      }}>
        {/* LEFT */}
        <div style={{ position: 'relative', ...parallax(-6) }}>
          <div className="jp" style={{
            position: 'absolute', left: -8, top: -20,
            writingMode: 'vertical-rl', fontSize: 11,
            letterSpacing: '0.8em', color: 'var(--orange)',
            opacity: 0.85, fontWeight: 600,
          }}>謎を解け · 人を識れ</div>

          <div style={{ paddingLeft: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 42, height: 1, background: 'var(--orange)' }} />
              <span className="mono" style={{ fontSize: 11, letterSpacing: '0.35em', color: 'var(--orange)', fontWeight: 500 }}>
                A NARUTO FANWORK · PUZZLE NARRATIVE
              </span>
            </div>

            <h1 className="jp" style={{
              fontSize: 148, lineHeight: 0.88, fontWeight: 800,
              color: 'var(--paper)', letterSpacing: '-0.02em', marginBottom: 8,
              textShadow: '0 0 60px rgba(255,107,26,0.15)',
            }}>
              人間<span style={{ color: 'var(--orange)' }}>未満</span>
            </h1>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginBottom: 36 }}>
              <h2 className="serif" style={{ fontSize: 38, fontStyle: 'italic', fontWeight: 400, color: 'var(--paper)', letterSpacing: '0.02em' }}>
                Ningen Iman
              </h2>
              <span className="mono" style={{ fontSize: 11, color: 'var(--paper-dim)', opacity: 0.6, letterSpacing: '0.25em' }}>
                /ニン·ゲン·イ·マン/ <span style={{ color: 'var(--leaf-glow)', opacity: 0.8 }}>— "not yet human"</span>
              </span>
            </div>

            <p className="serif" style={{
              fontFamily: "'Times New Roman', Times, serif",
              fontSize: 16, lineHeight: 1.55, color: 'var(--paper-dim)',
              maxWidth: 520, fontStyle: 'italic', marginBottom: 44,
            } as React.CSSProperties}>
            
              若能重新来过 <br />
              你还会压上同等重量的筹码吗（笑） <br />
               
            </p>

            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <button onClick={onPlay} style={{
                background: 'var(--orange)', color: 'var(--ink)', border: 'none',
                padding: '18px 32px', fontFamily: 'Cormorant Garamond, serif',
                fontSize: 17, fontWeight: 700, letterSpacing: '0.2em',
                textTransform: 'uppercase', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)',
                boxShadow: '0 0 40px rgba(255,107,26,0.3)', transition: 'all 200ms',
              }}
                onMouseEnter={(e) => { const b = e.currentTarget as HTMLElement; b.style.background = 'var(--orange-bright)'; b.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { const b = e.currentTarget as HTMLElement; b.style.background = 'var(--orange)'; b.style.transform = 'translateY(0)'; }}
              >
                <span style={{ fontSize: 12 }}>▶</span>
                <span>Play Free in Browser</span>
              </button>
              <button style={{
                background: 'transparent', color: 'var(--paper)',
                border: '1px solid rgba(242,239,230,0.3)',
                padding: '18px 24px', fontFamily: 'Cormorant Garamond, serif',
                fontSize: 15, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer',
              }}>Watch Trailer</button>
            </div>

            <div style={{
              marginTop: 56, display: 'flex', alignItems: 'center', gap: 20,
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              letterSpacing: '0.2em', color: 'var(--paper-dim)',
            }}>
              <span style={{ color: 'var(--leaf-glow)' }}>●</span>
              <span>8 CHAPTERS</span>
              <span style={{ opacity: 0.3 }}>│</span>
              <span>~12 HOURS</span>
              <span style={{ opacity: 0.3 }}>│</span>
              <span>FREE · BROWSER · 2026</span>
              <span style={{ opacity: 0.3 }}>│</span>
              <span style={{ color: 'var(--cyan)' }}>▚ NEW CIPHER WEEKLY</span>
            </div>
          </div>
        </div>

        {/* RIGHT: cipher plate */}
        <div style={{ position: 'relative', aspectRatio: '3/4', ...parallax(12) }}>
          <div style={{
            position: 'absolute', inset: 0,
            border: '1px solid rgba(127,176,105,0.4)',
            clipPath: 'polygon(0 20px, 20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)',
            background: `
              repeating-linear-gradient(0deg, transparent 0, transparent 22px, rgba(127,176,105,0.04) 22px, rgba(127,176,105,0.04) 23px),
              linear-gradient(135deg, rgba(18,24,20,0.9), rgba(11,15,12,0.7))
            `,
          }} />

          {([
            { top: 6, left: 6, t: 'TRANSOM · 0417' },
            { top: 6, right: 6, t: 'CASE #04' },
            { bottom: 6, left: 6, t: 'W. NAKAMURA †' },
            { bottom: 6, right: 6, t: 'ENC · LEAF ‡' },
          ] as Array<React.CSSProperties & { t: string }>).map((c, i) => {
            const { t, ...style } = c;
            return (
              <div key={i} className="mono" style={{
                position: 'absolute', ...style,
                fontSize: 8, letterSpacing: '0.2em',
                color: 'var(--leaf-glow)', opacity: 0.7,
              }}>◇ {t}</div>
            );
          })}

          <div style={{
            position: 'absolute', inset: 24,
            background: `
              radial-gradient(ellipse at center 40%, rgba(255,107,26,0.22), transparent 60%),
              linear-gradient(180deg, #1a2320 0%, #0b0f0c 100%)
            `,
            overflow: 'hidden', display: 'grid', placeItems: 'center',
          }}>
            <svg viewBox="0 0 300 420" style={{ width: '85%', height: '85%' }} preserveAspectRatio="xMidYMid meet">
              <defs>
                <radialGradient id="sunGradA" cx="0.35" cy="0.3" r="0.8">
                  <stop offset="0%" stopColor="#ffb371" />
                  <stop offset="70%" stopColor="#ff6b1a" />
                  <stop offset="100%" stopColor="#c94a0a" />
                </radialGradient>
                <linearGradient id="figGradA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0b0f0c" />
                  <stop offset="100%" stopColor="#1a2320" />
                </linearGradient>
              </defs>
              <circle cx="150" cy="160" r="95" fill="url(#sunGradA)" />
              <text x="150" y="180" textAnchor="middle" fill="#1a2320" fontSize="72" fontWeight="800" fontFamily="Shippori Mincho, serif" opacity="0.35">謎</text>
              <circle cx="188" cy="145" r="92" fill="#0b0f0c" opacity="0.85" />
              <rect x="62" y="208" width="176" height="18" fill="#0b0f0c" />
              <rect x="62" y="208" width="176" height="4" fill="#2d5e3e" />
              <circle cx="150" cy="217" r="10" fill="none" stroke="#c1121f" strokeWidth="2" />
              <path d="M146 213 Q152 215 154 219 Q150 222 146 220 Q147 216 146 213" fill="#c1121f" />
              <g fill="url(#figGradA)" stroke="#0b0f0c">
                <path d="M85 195 L95 150 L115 175 L125 155 L140 180 L155 150 L170 182 L185 158 L200 178 L215 155 L215 205 Z" />
                <path d="M95 205 L95 260 Q95 290 120 300 L180 300 Q205 290 205 260 L205 205 Z" fill="#1a2320" />
                <path d="M60 300 L95 288 L120 305 L150 298 L180 305 L205 288 L240 300 L255 420 L45 420 Z" />
                <path d="M128 300 L150 315 L172 300 L172 345 L128 345 Z" fill="#2d5e3e" />
              </g>
              <circle cx="132" cy="250" r="2.5" fill="#ff6b1a" />
              <circle cx="168" cy="250" r="2.5" fill="#ff6b1a" />
              <text x="150" y="370" textAnchor="middle" fill="#7fb069" fontSize="11" fontFamily="Shippori Mincho, serif" opacity="0.6" letterSpacing="4">影 謎 人 未</text>
              <text x="150" y="390" textAnchor="middle" fill="#7fb069" fontSize="9" fontFamily="JetBrains Mono, monospace" opacity="0.4" letterSpacing="3">04·17·Y·27</text>
            </svg>
          </div>

          {/* scan line */}
          <div style={{
            position: 'absolute', left: 24, right: 24,
            top: `${24 + (time * 2) % 100}%`,
            height: 1,
            background: 'linear-gradient(90deg, transparent, var(--cyan), transparent)',
            opacity: 0.4, pointerEvents: 'none',
          }} />

          <div style={{
            position: 'absolute', right: -8, top: '52%',
            transform: 'rotate(90deg) translateX(50%)',
            transformOrigin: 'right center',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
            letterSpacing: '0.4em', color: 'var(--orange)',
          }}>▚ EVIDENCE · SUBJECT·01 · "THE ARCHIVIST" ▚</div>
        </div>
      </div>

      {/* Bottom strip */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '18px 48px',
        borderTop: '1px solid rgba(127,176,105,0.2)',
        background: 'rgba(11,15,12,0.7)', backdropFilter: 'blur(8px)',
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
        letterSpacing: '0.25em', color: 'var(--paper-dim)',
      }}>
        <span>↓ SCROLL · 下へ</span>
        <span style={{ color: 'var(--leaf-glow)' }}>● SERVER ONLINE · 1,247 PLAYING NOW</span>
        <span>v0.4.1 · BUILD 04·17</span>
      </div>
    </section>
  );
}
