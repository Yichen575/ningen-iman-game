import { useState, useEffect } from 'react';

interface Props { onPlay: () => void; onOpenStory?: () => void; }

export default function LandingNav({ onPlay, onOpenStory }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = document.getElementById('landing-scroll');
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 20);
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position: 'sticky', top: 0, left: 0, right: 0,
      zIndex: 50,
      padding: '18px 48px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: scrolled ? 'rgba(11,15,12,0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(14px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(127,176,105,0.15)' : '1px solid transparent',
      transition: 'all 220ms ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 36, height: 36,
          border: '1.5px solid var(--leaf-glow)',
          borderRadius: '50%',
          display: 'grid', placeItems: 'center',
          position: 'relative',
        }}>
          <span className="jp" style={{ color: 'var(--leaf-glow)', fontSize: 18, fontWeight: 700, lineHeight: 1 }}>忍</span>
          <div style={{ position: 'absolute', inset: -4, border: '1px solid rgba(127,176,105,0.25)', borderRadius: '50%' }} />
        </div>
        <div style={{ lineHeight: 1 }}>
          <div className="jp" style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.15em' }}>人間未満</div>
          <div className="mono" style={{ fontSize: 9, color: 'var(--paper-dim)', opacity: 0.7, marginTop: 3, letterSpacing: '0.3em' }}>NINGEN·IMAN</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 38 }}>
        {[
          { jp: '物語', en: 'STORY', action: 'story' as const },
          { jp: '世界', en: 'WORLD', action: 'world' as const },
          { jp: '謎解き', en: 'PUZZLE', action: null },
          { jp: '開発', en: 'DEV·LOG', action: null },
        ].map((item, i) => (
          <a key={i}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (item.action === 'story') {
                onOpenStory?.();
              } else if (item.action === 'world') {
                const scroller = document.getElementById('landing-scroll');
                const target = document.getElementById('world');
                if (scroller && target) scroller.scrollTo({ top: target.offsetTop - 72, behavior: 'smooth' });
              }
            }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              color: 'var(--paper)', textDecoration: 'none',
              transition: 'color 150ms', cursor: 'pointer',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--orange)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--paper)'; }}
          >
            <span className="jp" style={{ fontSize: 13, fontWeight: 500 }}>{item.jp}</span>
            <span className="mono" style={{ fontSize: 9, opacity: 0.5, letterSpacing: '0.2em' }}>{item.en}</span>
          </a>
        ))}
      </div>

      <button onClick={onPlay} style={{
        background: 'var(--orange)',
        color: 'var(--ink)',
        border: 'none',
        padding: '10px 22px',
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: 15, fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        cursor: 'pointer',
        clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%, 10px 50%)',
        transition: 'background 150ms',
      }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--orange-bright)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--orange)'; }}
      >
        ▶ Play Now
      </button>
    </nav>
  );
}
