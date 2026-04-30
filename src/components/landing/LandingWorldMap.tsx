import { useState } from 'react';

type VillageKey = 'leaf' | 'sand' | 'mist' | 'rain' | 'end';

const villages: Record<VillageKey, {
  jp: string; romaji: string; en: string; chapter: string;
  color: string; x: number; y: number; desc: string; tags: string[];
}> = {
  leaf: {
    jp: '木ノ葉隠れ', romaji: 'Konohagakure', en: 'Hidden Leaf', chapter: 'CH. 01–04',
    color: 'var(--leaf-glow)', x: 48, y: 58,
    desc: "The case begins here. A shinobi is dead in the archives and the Hokage's office wants the story buried before dawn. Every rooftop, bathhouse, and ramen counter is a potential witness.",
    tags: ['ARCHIVES', 'HOKAGE TOWER', 'ICHIRAKU', '24 NPCs'],
  },
  sand: {
    jp: '砂隠れ', romaji: 'Sunagakure', en: 'Hidden Sand', chapter: 'CH. 05',
    color: '#e8c05a', x: 28, y: 72,
    desc: 'A desert outpost, a Kazekage who owes your victim a favor, and a sandstorm that rewrites the cipher every night at moonrise.',
    tags: ['DESERT', 'BAZAAR', 'CIPHER SHIFT'],
  },
  mist: {
    jp: '霧隠れ', romaji: 'Kirigakure', en: 'Hidden Mist', chapter: 'CH. 06',
    color: '#7cc4d9', x: 72, y: 28,
    desc: "The village that stopped answering its mail. Expect fog so thick the sidescroller turns into silhouettes, and names you're not supposed to remember.",
    tags: ['FOG', 'SEVEN BLADES', 'SILHOUETTE LVL'],
  },
  rain: {
    jp: '雨隠れ', romaji: 'Amegakure', en: 'Hidden Rain', chapter: 'CH. 07',
    color: '#9f7fb8', x: 58, y: 22,
    desc: "The neon-soaked arcology where the cipher was forged. Rainfall never stops, chakra-conduit wires run under every street, and the Archivist's handler is waiting.",
    tags: ['NEON', 'CYBERPUNK', 'ARCOLOGY'],
  },
  end: {
    jp: '終末の谷', romaji: 'Shūmatsu no Tani', en: "Valley's End", chapter: 'CH. 08 · FINALE',
    color: 'var(--orange)', x: 50, y: 48,
    desc: "Where the rivers of all five nations used to meet. A cliff, a statue, and the answer to the last of the twenty-four kanji. You should come alone. You should come ready.",
    tags: ['FINALE', 'BOSS PUZZLE', 'NO CHECKPOINT'],
  },
};

export default function LandingWorldMap() {
  const [selected, setSelected] = useState<VillageKey>('leaf');
  const v = villages[selected];

  return (
    <section id="world" style={{
      position: 'relative', padding: '140px 48px 140px',
      background: `
        radial-gradient(ellipse at 30% 50%, rgba(31,69,48,0.25) 0%, transparent 60%),
        linear-gradient(180deg, #121814 0%, #0b0f0c 100%)
      `,
      borderTop: '1px solid rgba(127,176,105,0.15)',
    }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto',
          alignItems: 'end', gap: 40, marginBottom: 72,
          paddingBottom: 32, borderBottom: '1px solid rgba(127,176,105,0.25)',
        }}>
          <div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: '0.35em', color: 'var(--orange)', marginBottom: 18 }}>
              ⊹ FIVE GREAT NATIONS · CASE GEOGRAPHY
            </div>
            <h2 className="jp" style={{ fontSize: 96, fontWeight: 800, lineHeight: 0.95, letterSpacing: '-0.02em' }}>
              世界地図<span style={{ color: 'var(--orange)', fontSize: 72, verticalAlign: 'middle', marginLeft: 20, opacity: 0.7 }}>— THE WORLD</span>
            </h2>
          </div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.3em', color: 'var(--paper-dim)', opacity: 0.6, textAlign: 'right', lineHeight: 1.8 }}>
            SECTION 03 / 04<br />
            <span style={{ color: 'var(--leaf-glow)' }}>◉ SELECT A VILLAGE</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 48, alignItems: 'start' }}>
          {/* MAP */}
          <div style={{
            position: 'relative', aspectRatio: '4/3',
            border: '1px solid rgba(127,176,105,0.35)',
            background: `
              radial-gradient(ellipse at 35% 60%, rgba(127,176,105,0.12), transparent 60%),
              radial-gradient(ellipse at 70% 30%, rgba(124,196,217,0.06), transparent 55%),
              linear-gradient(135deg, #0f1612, #1a2320)
            `,
            overflow: 'hidden',
          }}>
            <svg viewBox="0 0 800 600" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
              <defs>
                <filter id="roughen" x="-10%" y="-10%" width="120%" height="120%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" />
                  <feDisplacementMap in="SourceGraphic" scale="6" />
                </filter>
              </defs>
              <path d="M 80 180 Q 200 120 340 140 Q 480 100 600 170 Q 720 210 700 340 Q 660 470 520 490 Q 380 530 260 480 Q 120 460 70 340 Z"
                fill="rgba(31,69,48,0.35)" stroke="rgba(127,176,105,0.45)" strokeWidth="1.5" filter="url(#roughen)" />
              <path d="M 400 340 Q 420 420 460 480" stroke="rgba(124,196,217,0.4)" strokeWidth="2" fill="none" filter="url(#roughen)" />
              <path d="M 400 340 Q 380 280 350 220" stroke="rgba(124,196,217,0.4)" strokeWidth="2" fill="none" filter="url(#roughen)" />
              <path d="M 400 340 Q 470 310 540 280" stroke="rgba(124,196,217,0.4)" strokeWidth="2" fill="none" filter="url(#roughen)" />
              <path d="M 150 380 Q 220 440 300 430 Q 250 500 170 470 Z" fill="rgba(232,192,90,0.15)" filter="url(#roughen)" />
              <g stroke="rgba(127,176,105,0.4)" strokeWidth="1" fill="none">
                <path d="M 500 170 L 515 150 L 530 170 M 540 180 L 555 155 L 570 180" />
                <path d="M 420 220 L 435 195 L 450 220 M 460 230 L 475 205 L 490 230" />
              </g>
              {Array.from({ length: 18 }).map((_, i) => (
                <circle key={i} cx={200 + (i * 37) % 420} cy={260 + (i * 53) % 180} r={2 + (i % 3)} fill="rgba(127,176,105,0.3)" />
              ))}
            </svg>

            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `
                linear-gradient(rgba(127,176,105,0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(127,176,105,0.08) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px', pointerEvents: 'none',
            }} />

            <div style={{
              position: 'absolute', top: 18, right: 18, width: 56, height: 56,
              border: '1px solid var(--leaf-glow)', borderRadius: '50%',
              display: 'grid', placeItems: 'center',
              color: 'var(--leaf-glow)', fontFamily: 'Shippori Mincho, serif',
              fontSize: 11, letterSpacing: '0.2em',
            }}>
              <div style={{ position: 'absolute', top: 4, fontSize: 10 }}>北</div>
              <div style={{ position: 'absolute', bottom: 4, fontSize: 10 }}>南</div>
              <div style={{ position: 'absolute', left: 5, fontSize: 10 }}>西</div>
              <div style={{ position: 'absolute', right: 5, fontSize: 10 }}>東</div>
              <div style={{ fontSize: 14, color: 'var(--orange)' }}>◆</div>
            </div>

            <div className="mono" style={{ position: 'absolute', bottom: 18, left: 18, fontSize: 9, color: 'var(--paper-dim)', letterSpacing: '0.2em', opacity: 0.7 }}>
              ─ ─ ─ · 500 里 · 1250 KM
            </div>
            <div className="mono" style={{ position: 'absolute', bottom: 18, right: 18, fontSize: 9, color: 'var(--paper-dim)', letterSpacing: '0.2em', opacity: 0.7 }}>
              CARTOGRAPHY · Y·27 · CONFIDENTIAL
            </div>

            {(Object.entries(villages) as [VillageKey, typeof villages[VillageKey]][]).map(([key, vv]) => {
              const active = key === selected;
              return (
                <button key={key} onClick={() => setSelected(key)} style={{
                  position: 'absolute', left: `${vv.x}%`, top: `${vv.y}%`,
                  transform: 'translate(-50%, -50%)',
                  background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                  zIndex: active ? 5 : 2,
                }}>
                  {active && (
                    <div style={{
                      position: 'absolute', inset: -20,
                      border: `1px solid ${vv.color}`,
                      borderRadius: '50%', animation: 'pulse 2s infinite',
                    }} />
                  )}
                  <div style={{
                    width: active ? 20 : 12, height: active ? 20 : 12,
                    borderRadius: '50%',
                    background: active ? vv.color : 'transparent',
                    border: `2px solid ${vv.color}`,
                    boxShadow: active ? `0 0 24px ${vv.color}` : 'none',
                    transition: 'all 200ms',
                  }} />
                  <div className="jp" style={{
                    position: 'absolute', top: '100%', left: '50%',
                    transform: 'translateX(-50%)', marginTop: 8,
                    fontSize: active ? 13 : 11, fontWeight: active ? 700 : 500,
                    color: active ? vv.color : 'var(--paper-dim)',
                    whiteSpace: 'nowrap', letterSpacing: '0.15em',
                  }}>{vv.jp}</div>
                </button>
              );
            })}

            <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d={`M ${villages.leaf.x} ${villages.leaf.y} L ${villages.sand.x} ${villages.sand.y} L ${villages.mist.x} ${villages.mist.y} L ${villages.rain.x} ${villages.rain.y} L ${villages.end.x} ${villages.end.y}`}
                stroke="var(--blood)" strokeWidth="0.3" strokeDasharray="1 1.2" fill="none" opacity="0.7" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>

          {/* DETAIL PANEL */}
          <div style={{
            position: 'relative', padding: '36px 32px',
            border: '1px solid rgba(127,176,105,0.3)',
            background: 'rgba(15,22,18,0.8)',
            clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))',
          }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.3em', color: v.color, marginBottom: 10 }}>▚ {v.chapter} · DOSSIER</div>
            <div className="jp" style={{ fontSize: 56, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 6 }}>{v.jp}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, paddingBottom: 20, marginBottom: 20, borderBottom: '1px solid rgba(127,176,105,0.2)' }}>
              <span className="serif" style={{ fontSize: 22, fontStyle: 'italic', color: v.color }}>{v.romaji}</span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--paper-dim)', opacity: 0.7, letterSpacing: '0.2em' }}>"{v.en}"</span>
            </div>
            <p className="serif" style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--paper-dim)', fontStyle: 'italic', marginBottom: 24, minHeight: 130 } as React.CSSProperties}>{v.desc}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {v.tags.map((t, i) => (
                <span key={i} className="mono" style={{
                  fontSize: 9, letterSpacing: '0.2em', padding: '8px 12px',
                  lineHeight: 1.4, whiteSpace: 'nowrap', display: 'inline-block',
                  border: `1px solid ${v.color}`, color: v.color, opacity: 0.9,
                }}>◆ {t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.1; transform: scale(1.4); }
        }
      `}</style>
    </section>
  );
}
