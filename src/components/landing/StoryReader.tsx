import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import STORY_DATA from './storyData';
import type { Volume, Chapter } from './storyData';
import { PaperTexture, Mudra, Kunai, HankoSeal, Fuuda, Shuriken } from './ShinobiAssets';

const LS_PREFS = 'ningen.readerPrefs.v2';

interface ViewState {
  level: 'A' | 'B' | 'C';
  volId: string | null;
  chapId: string | null;
}

interface Prefs {
  fontSize: number;
  fontFamily: string;
}

const HEI_STACK = "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', sans-serif";

const FONT_OPTIONS = [
  { id: 'hei',   label: 'Gothic · 黑体',   stack: HEI_STACK },
  { id: 'serif', label: 'Garamond · 衬线', stack: "'Cormorant Garamond', 'Shippori Mincho', serif" },
  { id: 'jp',    label: 'Mincho · 明朝',   stack: "'Shippori Mincho', 'Noto Serif JP', serif" },
  { id: 'mono',  label: 'Mono · 等宽',     stack: "'JetBrains Mono', monospace" },
];

const ctrlBtn: React.CSSProperties = {
  background: 'transparent', border: '1px solid rgba(127,176,105,0.3)',
  color: 'var(--paper)', cursor: 'pointer', padding: '6px 10px',
  fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.2em',
};

const navBtn = (right: boolean): React.CSSProperties => ({
  textAlign: right ? 'right' : 'left',
  padding: '20px 22px',
  background: 'transparent',
  border: '1px solid rgba(127,176,105,0.25)',
  color: 'var(--paper)', cursor: 'pointer', fontFamily: 'inherit',
});

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(LS_PREFS);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return { fontSize: 20, fontFamily: 'hei' };
}

function savePrefs(p: Prefs) {
  try { localStorage.setItem(LS_PREFS, JSON.stringify(p)); } catch (_) {}
}

interface EditableProps {
  value: string;
  onChange: (text: string) => void;
  style?: React.CSSProperties;
  multiline?: boolean;
  tag?: React.ElementType;
  className?: string;
  editMode: boolean;
}

function Editable({ value, onChange, style, multiline = false, tag = 'span', className, editMode }: EditableProps) {
  const Tag = tag as React.ElementType;
  const onBlur = (e: React.FocusEvent<HTMLElement>) => {
    const raw = e.currentTarget.innerText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    onChange(multiline ? raw : raw.replace(/\n/g, ' '));
  };
  const onKey = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!multiline && e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); }
  };
  if (!editMode) return (
    <Tag
      style={multiline ? { ...style, whiteSpace: 'pre-wrap', wordBreak: 'break-word' } : style}
      className={className}
    >{value}</Tag>
  );
  return (
    <Tag
      contentEditable suppressContentEditableWarning
      onBlur={onBlur} onKeyDown={onKey}
      className={className}
      style={{
        ...style,
        outline: '1px dashed rgba(127,176,105,0.55)',
        outlineOffset: 4, cursor: 'text',
        background: 'rgba(127,176,105,0.06)',
        whiteSpace: multiline ? 'pre-wrap' : 'normal',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
      }}
    >{value}</Tag>
  );
}

export default function StoryReader({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [data, setData] = useState<Volume[]>(() => JSON.parse(JSON.stringify(STORY_DATA)));
  const [view, setView] = useState<ViewState>({ level: 'A', volId: null, chapId: null });
  const [editMode, setEditMode] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [visible, setVisible] = useState(true);

  // Chapter body loaded on demand from markdown files via server
  const [chapterBody, setChapterBody] = useState<string[]>([]);
  const [bodyLoading, setBodyLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) setView({ level: 'A', volId: null, chapId: null });
  }, [open]);

  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    setVisible(false);
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    fadeTimer.current = setTimeout(() => setVisible(true), 30);
    return () => { if (fadeTimer.current) clearTimeout(fadeTimer.current); };
  }, [view]);

  // Load chapter body from server whenever we enter a chapter
  useEffect(() => {
    if (view.level !== 'C' || !view.volId || !view.chapId) return;
    setBodyLoading(true);
    setChapterBody([]);
    fetch(`/api/story/${view.volId}/${view.chapId}`)
      .then(r => r.json())
      .then(({ text }: { text: string }) => {
        setChapterBody(text ? text.split('\n\n') : ['']);
      })
      .catch(() => setChapterBody(['（正文加载失败，请确认服务器正在运行）']))
      .finally(() => setBodyLoading(false));
  }, [view.level, view.volId, view.chapId]);

  useEffect(() => { savePrefs(prefs); }, [prefs]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (editMode) return;
      if (view.level === 'C') setView(v => ({ ...v, level: 'B', chapId: null }));
      else if (view.level === 'B') setView({ level: 'A', volId: null, chapId: null });
      else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, view, onClose, editMode]);

  if (!open) return null;

  const vol = data.find(v => v.id === view.volId);
  const chap = vol?.chapters.find(c => c.id === view.chapId);
  const fontStack = FONT_OPTIONS.find(f => f.id === prefs.fontFamily)?.stack ?? FONT_OPTIONS[0].stack;

  const updateVolume = (volId: string, patch: Partial<Volume>) =>
    setData(d => d.map(v => v.id === volId ? { ...v, ...patch } : v));

  const updateChapter = (volId: string, chapId: string, patch: Partial<Chapter>) =>
    setData(d => d.map(v => v.id === volId
      ? { ...v, chapters: v.chapters.map(c => c.id === chapId ? { ...c, ...patch } : c) }
      : v));

  const addChapter = (volId: string) => {
    const newCh: Chapter = { id: 'c' + Date.now(), num: '新', title: '新章节', subtitle: 'New Chapter', date: '——' };
    setData(d => d.map(v => v.id === volId ? { ...v, chapters: [...v.chapters, newCh] } : v));
  };

  const deleteChapter = (volId: string, chapId: string) => {
    if (!confirm('删除此章节？此操作不可恢复。')) return;
    setData(d => d.map(v => v.id === volId ? { ...v, chapters: v.chapters.filter(c => c.id !== chapId) } : v));
    if (view.chapId === chapId) setView(v => ({ ...v, level: 'B', chapId: null }));
  };

  const resetData = () => {
    if (!confirm('重置元数据为默认？（正文内容不受影响）')) return;
    setData(JSON.parse(JSON.stringify(STORY_DATA)));
  };

  const saveToFile = async () => {
    setSaveState('saving');
    try {
      // Save metadata to storyData.ts
      const metaRes = await fetch('/api/save-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!metaRes.ok) throw new Error('metadata save failed');

      // If in chapter view, also save the body to its markdown file
      if (view.level === 'C' && view.volId && view.chapId) {
        const bodyRes = await fetch(`/api/story/${view.volId}/${view.chapId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: chapterBody.join('\n\n') }),
        });
        if (!bodyRes.ok) throw new Error('body save failed');
      }

      setSaveState('ok');
    } catch {
      setSaveState('err');
    }
    setTimeout(() => setSaveState('idle'), 2000);
  };

  const E = (props: Omit<EditableProps, 'editMode'>) => <Editable {...props} editMode={editMode} />;

  // ===== Header =====
  const Header = () => (
    <div style={{
      position: 'sticky', top: 0, zIndex: 10,
      padding: '18px 48px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(11,15,12,0.92)',
      backdropFilter: 'blur(18px)',
      borderBottom: '1px solid rgba(127,176,105,0.18)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        {view.level !== 'A' && (
          <button onClick={() => {
            if (view.level === 'C') setView(v => ({ ...v, level: 'B', chapId: null }));
            else setView({ level: 'A', volId: null, chapId: null });
          }} style={{
            background: 'transparent', border: '1px solid rgba(127,176,105,0.35)',
            color: 'var(--paper)', cursor: 'pointer',
            padding: '8px 14px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11, letterSpacing: '0.25em',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>← {view.level === 'C' ? '目录' : '篇章'}</button>
        )}
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.3em', color: 'var(--paper-dim)', opacity: 0.6 }}>
          {view.level === 'A' && '⊹ 物語 · STORY · LIB·00'}
          {view.level === 'B' && vol && `${vol.indexNum} · ${vol.indexCh} · 目录`}
          {view.level === 'C' && vol && chap && `${vol.indexNum} · ${chap.num} · 正文`}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {view.level === 'C' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingRight: 12, borderRight: '1px solid rgba(127,176,105,0.2)' }}>
            <button onClick={() => setPrefs(p => ({ ...p, fontSize: Math.max(14, p.fontSize - 2) }))} style={ctrlBtn}>A−</button>
            <span className="mono" style={{ fontSize: 10, color: 'var(--paper-dim)', minWidth: 28, textAlign: 'center' }}>{prefs.fontSize}</span>
            <button onClick={() => setPrefs(p => ({ ...p, fontSize: Math.min(32, p.fontSize + 2) }))} style={ctrlBtn}>A+</button>
            <select value={prefs.fontFamily} onChange={e => setPrefs(p => ({ ...p, fontFamily: e.target.value }))} style={{
              background: 'transparent', color: 'var(--paper)', border: '1px solid rgba(127,176,105,0.3)',
              padding: '6px 8px', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.2em',
            }}>
              {FONT_OPTIONS.map(f => <option key={f.id} value={f.id} style={{ background: '#0b0f0c' }}>{f.label}</option>)}
            </select>
          </div>
        )}

        <button onClick={() => setEditMode(m => !m)} style={{
          background: editMode ? 'var(--orange)' : 'transparent',
          color: editMode ? 'var(--ink)' : 'var(--paper)',
          border: '1px solid var(--orange)',
          cursor: 'pointer', padding: '8px 14px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11, letterSpacing: '0.25em', fontWeight: 700,
        }}>{editMode ? '✎ EDITING' : '✎ EDIT'}</button>

        {editMode && <button onClick={resetData} style={{ ...ctrlBtn, color: 'var(--blood)', borderColor: 'rgba(193,18,31,0.4)' }}>RESET</button>}
        {editMode && (
          <button onClick={saveToFile} disabled={saveState === 'saving'} style={{
            ...ctrlBtn,
            color: saveState === 'ok' ? 'var(--leaf-glow)' : saveState === 'err' ? 'var(--blood)' : 'var(--orange)',
            borderColor: saveState === 'ok' ? 'rgba(127,176,105,0.5)' : saveState === 'err' ? 'rgba(193,18,31,0.4)' : 'rgba(255,107,26,0.5)',
            fontWeight: 700,
          }}>
            {saveState === 'saving' ? 'SAVING…' : saveState === 'ok' ? 'SAVED ✓' : saveState === 'err' ? 'ERROR ✗' : '↓ SAVE'}
          </button>
        )}

        <span className="mono" style={{ fontSize: 9, letterSpacing: '0.3em', color: 'var(--leaf-glow)', opacity: 0.7 }}>ESC</span>
        <button onClick={onClose} style={{
          background: 'transparent', border: '1px solid rgba(242,239,230,0.25)',
          color: 'var(--paper)', cursor: 'pointer',
          width: 32, height: 32, display: 'grid', placeItems: 'center',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 14,
        }}>×</button>
      </div>
    </div>
  );

  // ===== Level A: volume picker =====
  const LevelA = () => (
    <div style={{ padding: '80px 48px 120px', position: 'relative' }}>
      <PaperTexture opacity={0.22} />
      <div style={{ position: 'absolute', top: 60, right: 80, opacity: 0.5 }}><Mudra size={120} /></div>
      <div style={{ position: 'absolute', bottom: 80, left: 60 }}><Kunai size={140} rotate={-32} /></div>

      <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto' }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.4em', color: 'var(--orange)', marginBottom: 18 }}>
          ⊹ THREE VOLUMES · ONE STORY
        </div>
        <h1 className="jp" style={{ fontSize: 112, fontWeight: 800, lineHeight: 0.92, letterSpacing: '-0.02em', marginBottom: 24 }}>
          物語<span style={{ color: 'var(--orange)', fontSize: 64, marginLeft: 18, opacity: 0.7 }}>— THE NARRATIVE</span>
        </h1>
        <p className="serif" style={{ fontSize: 21, fontStyle: 'italic', color: 'var(--paper-dim)', maxWidth: 720, lineHeight: 1.55, marginBottom: 72 } as React.CSSProperties}>
          A trilogy spanning sixteen years of one shinobi's life. Choose a volume to enter — each is a different shape of silence.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
          {data.map((v) => (
            <div key={v.id} style={{
              position: 'relative',
              background: 'rgba(15,22,18,0.78)',
              border: '1px solid rgba(127,176,105,0.25)',
              padding: '36px 30px 30px',
              minHeight: 460, display: 'flex', flexDirection: 'column',
              clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))',
              cursor: editMode ? 'default' : 'pointer',
              transition: 'all 240ms ease',
            }}
              onClick={() => { if (!editMode) setView({ level: 'B', volId: v.id, chapId: null }); }}
              onMouseEnter={e => { if (editMode) return; (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.borderColor = v.accent; (e.currentTarget as HTMLElement).style.boxShadow = `0 24px 60px -20px ${v.accent}55`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(127,176,105,0.25)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
            >
              <PaperTexture opacity={0.14} />
              <div style={{ position: 'absolute', top: -14, right: -14, opacity: 0.55 }}>
                <HankoSeal char={v.indexNum} size={48} color={v.accent} rotate={6} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28, position: 'relative' }}>
                <div className="mono" style={{ fontSize: 11, letterSpacing: '0.3em', color: v.accent }}>▚ VOL · {v.indexNum}</div>
                <div className="jp" style={{ fontSize: 11, letterSpacing: '0.3em', color: 'var(--paper-dim)', opacity: 0.6 }}>{v.indexCh}</div>
              </div>

              <E tag="div" value={v.title} onChange={(t) => updateVolume(v.id, { title: t })}
                className="jp" style={{ fontSize: 56, fontWeight: 800, lineHeight: 0.95, marginBottom: 14, color: 'var(--paper)' }} />
              <E tag="div" value={v.titleEn} onChange={(t) => updateVolume(v.id, { titleEn: t })}
                className="serif" style={{ fontSize: 17, fontStyle: 'italic', color: v.accent, marginBottom: 18 }} />
              <E tag="div" value={v.subtitle} onChange={(t) => updateVolume(v.id, { subtitle: t })}
                className="jp" style={{ fontSize: 12, letterSpacing: '0.2em', color: 'var(--paper-dim)', opacity: 0.7, marginBottom: 22 }} />
              <E tag="p" value={v.blurb} onChange={(t) => updateVolume(v.id, { blurb: t })} multiline
                className="serif" style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--paper-dim)', fontStyle: 'italic', flex: 1 }} />

              <div style={{
                marginTop: 28, paddingTop: 18, borderTop: '1px solid rgba(127,176,105,0.15)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.2em', color: 'var(--paper-dim)',
              }}>
                <span>◆ {v.chapters.length} CHAPTERS</span>
                <span style={{ color: v.accent }}>{editMode ? '编辑中' : 'READ →'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ===== Level B: chapter timeline =====
  const LevelB = () => {
    if (!vol) return null;
    return (
      <div style={{ padding: '70px 48px 120px', position: 'relative' }}>
        <PaperTexture opacity={0.18} />
        <div style={{ position: 'absolute', top: 60, right: 60 }}><Fuuda size={130} rotate={6} /></div>
        <div style={{ position: 'absolute', bottom: 60, right: 100 }}><Shuriken size={110} rotate={18} color={vol.accent} /></div>

        <div className="jp" style={{ position: 'absolute', top: 20, right: 56, fontSize: 460, fontWeight: 800, color: `${vol.accent}0e`, lineHeight: 0.8, pointerEvents: 'none' }}>{vol.indexCh.charAt(1)}</div>

        <div style={{ position: 'relative', maxWidth: 980, margin: '0 auto' }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.4em', color: vol.accent, marginBottom: 16 }}>
            ▚ {vol.indexNum} · {vol.indexJp} · {vol.chapters.length} CHAPTERS
          </div>

          <E tag="h1" value={vol.title} onChange={(t) => updateVolume(vol.id, { title: t })}
            className="jp" style={{ fontSize: 124, fontWeight: 800, lineHeight: 0.9, letterSpacing: '-0.02em', marginBottom: 14 }} />

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginBottom: 24 }}>
            <E tag="span" value={vol.titleEn} onChange={(t) => updateVolume(vol.id, { titleEn: t })}
              className="serif" style={{ fontSize: 26, fontStyle: 'italic', color: vol.accent }} />
            <span className="jp" style={{ fontSize: 13, letterSpacing: '0.3em', color: 'var(--paper-dim)', opacity: 0.6 }}>· {vol.indexCh}</span>
          </div>

          <E tag="p" value={vol.blurb} onChange={(t) => updateVolume(vol.id, { blurb: t })} multiline
            className="serif" style={{ fontSize: 19, fontStyle: 'italic', color: 'var(--paper-dim)', lineHeight: 1.55, maxWidth: 700, marginBottom: 56 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.3em', color: 'var(--paper-dim)', opacity: 0.7 }}>目次 · TIMELINE</div>
            <div style={{ flex: 1, height: 1, background: 'rgba(127,176,105,0.18)' }} />
            {editMode && (
              <button onClick={() => addChapter(vol.id)} style={{
                background: vol.accent, color: 'var(--ink)', border: 'none', cursor: 'pointer',
                padding: '8px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.2em', fontWeight: 700,
              }}>+ 新章节</button>
            )}
          </div>

          <div style={{ position: 'relative', paddingLeft: 36 }}>
            <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 1, background: `linear-gradient(180deg, transparent, ${vol.accent}55, transparent)` }} />

            {vol.chapters.map((c) => (
              <div key={c.id} style={{ position: 'relative', paddingBottom: 24 }}>
                <div style={{
                  position: 'absolute', left: -36, top: 8, width: 16, height: 16,
                  borderRadius: '50%', background: 'var(--ink)',
                  border: `2px solid ${vol.accent}`,
                  boxShadow: `0 0 0 4px rgba(11,15,12,1), 0 0 12px ${vol.accent}66`,
                }} />
                <div
                  onClick={() => { if (!editMode) setView({ level: 'C', volId: vol.id, chapId: c.id }); }}
                  style={{
                    display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 24, alignItems: 'center',
                    padding: '18px 20px', background: 'rgba(15,22,18,0.6)',
                    border: '1px solid rgba(127,176,105,0.18)',
                    cursor: editMode ? 'default' : 'pointer',
                    transition: 'all 180ms',
                  }}
                  onMouseEnter={e => { if (editMode) return; (e.currentTarget as HTMLElement).style.background = `${vol.accent}14`; (e.currentTarget as HTMLElement).style.borderColor = vol.accent; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(15,22,18,0.6)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(127,176,105,0.18)'; }}
                >
                  <E tag="div" value={c.num} onChange={(t) => updateChapter(vol.id, c.id, { num: t })}
                    className="jp" style={{ fontSize: 44, fontWeight: 800, lineHeight: 1, color: vol.accent, textAlign: 'center' }} />
                  <div>
                    <E tag="div" value={c.title} onChange={(t) => updateChapter(vol.id, c.id, { title: t })}
                      style={{ fontSize: 22, fontWeight: 600, marginBottom: 4, fontFamily: HEI_STACK }} />
                    <E tag="div" value={c.subtitle} onChange={(t) => updateChapter(vol.id, c.id, { subtitle: t })}
                      className="serif" style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--paper-dim)', opacity: 0.75 }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <E tag="div" value={c.date} onChange={(t) => updateChapter(vol.id, c.id, { date: t })}
                      className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--paper-dim)', opacity: 0.6, textAlign: 'right', whiteSpace: 'nowrap' }} />
                    {editMode && (
                      <button onClick={(e) => { e.stopPropagation(); deleteChapter(vol.id, c.id); }} style={{
                        background: 'transparent', border: '1px solid rgba(193,18,31,0.4)',
                        color: 'var(--blood)', cursor: 'pointer', padding: '4px 8px',
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.2em',
                      }}>×</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ===== Level C: reader =====
  const LevelC = () => {
    if (!vol || !chap) return null;
    const idx = vol.chapters.findIndex(c => c.id === chap.id);
    const prev = vol.chapters[idx - 1];
    const next = vol.chapters[idx + 1];
    const pullQuote = (chap.pullQuote && chap.pullQuote.trim()) || (chapterBody[0] || '').slice(0, 60).split('。')[0];

    const updateBodyLine = (i: number, text: string) => {
      const newBody = chapterBody.slice(); newBody[i] = text;
      setChapterBody(newBody);
    };
    const addParagraph = (i: number) => {
      const newBody = chapterBody.slice(); newBody.splice(i + 1, 0, '');
      setChapterBody(newBody);
    };
    const deleteParagraph = (i: number) => {
      if (chapterBody.length <= 1) return;
      const newBody = chapterBody.slice(); newBody.splice(i, 1);
      setChapterBody(newBody);
    };

    if (bodyLoading) return (
      <div style={{ display: 'grid', placeItems: 'center', height: '60vh' }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.3em', color: 'var(--paper-dim)', opacity: 0.5 }}>
          LOADING…
        </div>
      </div>
    );

    return (
      <div style={{ padding: '60px 24px 120px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 120, left: 'calc(50% - 520px)' }}><Kunai size={120} rotate={20} /></div>
        <div style={{ position: 'absolute', top: 200, right: 'calc(50% - 520px)' }}><Fuuda size={110} rotate={-8} /></div>

        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.3em', color: 'var(--paper-dim)', opacity: 0.65, marginBottom: 32 }}>
            <span style={{ cursor: 'pointer' }} onClick={() => setView({ level: 'A', volId: null, chapId: null })}>物語</span>
            <span style={{ margin: '0 10px', opacity: 0.4 }}>›</span>
            <span style={{ cursor: 'pointer', color: vol.accent }} onClick={() => setView({ level: 'B', volId: vol.id, chapId: null })}>{vol.title}</span>
            <span style={{ margin: '0 10px', opacity: 0.4 }}>›</span>
            <span style={{ color: 'var(--paper)' }}>第 {chap.num} 章</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: `${vol.accent}55` }} />
            <span className="jp" style={{ fontSize: 13, color: vol.accent, letterSpacing: '0.3em' }}>{vol.indexCh} · 第 {chap.num} 章</span>
            <div style={{ flex: 1, height: 1, background: `${vol.accent}55` }} />
          </div>

          <E tag="h1" value={chap.title} onChange={(t) => updateChapter(vol.id, chap.id, { title: t })}
            className="jp" style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.01em', marginBottom: 12, textAlign: 'center' }} />

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 16, paddingBottom: 18, marginBottom: 36, borderBottom: `1px solid ${vol.accent}55` }}>
            <E tag="span" value={chap.subtitle} onChange={(t) => updateChapter(vol.id, chap.id, { subtitle: t })}
              className="serif" style={{ fontSize: 20, fontStyle: 'italic', color: vol.accent }} />
            <E tag="span" value={chap.date} onChange={(t) => updateChapter(vol.id, chap.id, { date: t })}
              className="mono" style={{ fontSize: 10, letterSpacing: '0.3em', color: 'var(--paper-dim)', opacity: 0.6 }} />
          </div>

          {pullQuote && !editMode && (
            <blockquote className="jp" style={{
              position: 'relative',
              fontSize: 22, fontWeight: 600, lineHeight: 1.5,
              color: vol.accent,
              padding: '20px 28px',
              margin: '0 0 44px',
              borderLeft: `2px solid ${vol.accent}`,
              fontStyle: 'italic', letterSpacing: '0.04em',
              background: `${vol.accent}0a`,
            }}>「{pullQuote}」</blockquote>
          )}

          <div style={{ fontFamily: fontStack, fontSize: prefs.fontSize, lineHeight: 1.9 }}>
            {chapterBody.map((para, i) => {
              const showDropCap = i === 0 && !editMode && para.length > 0 && !para.includes('\n');
              const first = showDropCap ? para.charAt(0) : '';
              const rest = showDropCap ? para.slice(1) : para;
              return (
                <div key={i} style={{ position: 'relative', marginBottom: 24 }}>
                  {editMode && (
                    <div style={{ position: 'absolute', left: -64, top: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <button onClick={() => addParagraph(i)} style={{ ...ctrlBtn, padding: '2px 6px', fontSize: 10 }}>+</button>
                      <button onClick={() => deleteParagraph(i)} style={{ ...ctrlBtn, padding: '2px 6px', fontSize: 10, color: 'var(--blood)', borderColor: 'rgba(193,18,31,0.4)' }}>−</button>
                    </div>
                  )}
                  {showDropCap ? (
                    <p style={{ color: 'var(--paper)', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      <span className="jp" style={{
                        float: 'left', fontSize: prefs.fontSize * 4.4, fontWeight: 800, lineHeight: 0.85,
                        marginRight: 12, marginTop: 6, color: vol.accent,
                      }}>{first}</span>
                      {rest}
                    </p>
                  ) : (
                    <E tag="p" value={para} onChange={(t) => updateBodyLine(i, t)} multiline
                      style={{ color: 'var(--paper)', margin: 0 }} />
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ margin: '72px auto 80px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
            <div style={{ flex: 1, height: 1, background: `${vol.accent}55`, maxWidth: 140 }} />
            <HankoSeal char="了" size={56} color="#c1121f" rotate={-6} />
            <HankoSeal char="完" size={56} color={vol.accent} rotate={4} />
            <div style={{ flex: 1, height: 1, background: `${vol.accent}55`, maxWidth: 140 }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {prev ? (
              <button onClick={() => setView({ level: 'C', volId: vol.id, chapId: prev.id })} style={navBtn(false)}>
                <div className="mono" style={{ fontSize: 9, letterSpacing: '0.3em', color: 'var(--paper-dim)', opacity: 0.7, marginBottom: 6 }}>← 前章 · PREV</div>
                <div className="jp" style={{ fontSize: 16, fontWeight: 600 }}>{prev.num} · {prev.title}</div>
              </button>
            ) : <div />}
            {next ? (
              <button onClick={() => setView({ level: 'C', volId: vol.id, chapId: next.id })} style={{ ...navBtn(true), borderColor: vol.accent }}>
                <div className="mono" style={{ fontSize: 9, letterSpacing: '0.3em', color: vol.accent, marginBottom: 6 }}>次章 · NEXT →</div>
                <div className="jp" style={{ fontSize: 16, fontWeight: 600 }}>{next.num} · {next.title}</div>
              </button>
            ) : (
              <button onClick={() => setView({ level: 'B', volId: vol.id, chapId: null })} style={{ ...navBtn(true), borderColor: vol.accent }}>
                <div className="mono" style={{ fontSize: 9, letterSpacing: '0.3em', color: vol.accent, marginBottom: 6 }}>返回目录 · CONTENTS</div>
                <div className="jp" style={{ fontSize: 16, fontWeight: 600 }}>{vol.title}</div>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 150,
      background: 'rgba(7,10,8,0.86)',
      backdropFilter: 'blur(10px)',
    }}>
      <div ref={scrollRef} style={{
        width: '100%', height: '100%',
        background: `
          radial-gradient(ellipse at 50% 0%, rgba(31,69,48,0.22), transparent 50%),
          linear-gradient(180deg, #0b0f0c 0%, #0f1612 100%)
        `,
        overflow: 'auto', position: 'relative',
      }}>
        <Header />
        <div style={{
          position: 'relative',
          opacity: visible ? 1 : 0,
          transition: visible ? 'opacity 320ms ease-out' : 'none',
        }}>
          {view.level === 'A' && <LevelA />}
          {view.level === 'B' && <LevelB />}
          {view.level === 'C' && <LevelC />}
        </div>
      </div>
    </div>
  );
}
