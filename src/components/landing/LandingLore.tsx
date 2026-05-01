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
            <div className="jp" style={{ fontSize: 20, letterSpacing: '0.4em', color: 'var(--leaf-glow)', marginBottom: 24 }}>§ 嘘の者</div>
            <p style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: 18, lineHeight: 1.7, color: 'var(--paper)', marginBottom: 20 }}>
              
              她捂住了脸，<span style={{ color: 'var(--orange)', fontStyle: 'normal' ,fontSize: 30}}>長嘆</span>一声，暗紅色的眼睛从指缝之间透出来，好像绷着一层灰色的缎子。
              <br />
              <br />
              她又继续默默坐了一会，然后站起身。<br />
              <br />
              如果这便是你想要的……我一定会让事情<span style={{ color: 'var(--orange)', fontStyle: 'normal' ,fontSize: 30}}>結束</span>。<br />
              她垂眼，最后看了一眼那<span style={{ color: 'var(--orange)', fontStyle: 'normal' ,fontSize: 30}}>埋葬</span>了她所有依靠和希望的地方，然后慢慢朝前走去<br />
               <br />
             
              <span style={{ color: 'var(--orange)', fontStyle: 'normal' ,fontSize: 30}}></span><br />
           </p>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.3em', color: 'var(--paper-dim)', opacity: 0.7, paddingLeft: 20, borderLeft: '2px solid var(--orange)' }}>
              — CORONER'S SCROLL · 04·17·Y·27<br />
              <span style={{ opacity: 0.6 }}>FILED BY: HATAKE. K.</span>
            </div>
          </div>

          <div>
            <div className="jp" style={{ fontSize: 20, letterSpacing: '0.4em', color: 'var(--leaf-glow)', marginBottom: 24 }}>§ 失去な者</div>
            <p style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: 18, lineHeight: 1.7, color: 'var(--paper-dim)' }}>
              我跪在山坡上，蜷縮佝偻起<span style={{ color: 'var(--orange)', fontStyle: 'normal' ,fontSize: 30}}>身體</span>，像一隻受傷的小獸，發出<span style={{ color: 'var(--orange)', fontStyle: 'normal' ,fontSize: 30}}>壓抑</span>到极点的喑哑嗚咽声。 <br />
               <br />
              滾燙的额头貼著<span style={{ fontStyle: 'normal' ,fontSize: 30}}>潮濕的草葉</span>，手指摳爛了泥土裡的草根，淚已經流乾，胸腔裡只能發出最後一聲嘶哑的请求。 <br />
               <br />
              别把我留在没有你的<span style={{ color: 'var(--orange)', fontStyle: 'normal' ,fontSize: 30}}>地狱</span>里啊……
            </p>
          </div>

          <div>
            <div className="jp" style={{ fontSize: 20, letterSpacing: '0.4em', color: 'var(--leaf-glow)', marginBottom: 24 }}>§ 魂を返せ</div>
            <p style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: 18, lineHeight: 1.7, color: 'var(--paper-dim)', marginBottom: 24 }}>
              即便知道復仇之路的<span style={{ color: 'var(--orange)', fontStyle: 'normal' ,fontSize: 30}}>盡頭</span>空無一物，我還是會走上那條路。 <br />
              
              有些事情，彷彿不去做就不行呢，你明白嗎⋯⋯  <br />
               <br />
              她吐出一口<span style={{ color: 'var(--orange)', fontStyle: 'normal' ,fontSize: 30}}>煙霧</span>。  <br />
               <br />
              至少⋯⋯我得做點什麼，來解釋我為什麼<span style={{ color: 'var(--orange)', fontStyle: 'normal' ,fontSize: 30}}>苟活</span>到現在的事
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
          {'幻·影·忍·刃·雨·夢·血·器·闇·慾·術·眼'.split('·').map((g, i) => (
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
