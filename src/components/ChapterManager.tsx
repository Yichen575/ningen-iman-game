import { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { Chapter, GameState } from '../types';
import STORY_DATA from './landing/storyData';
import type { Volume as StoryVolume, Chapter as StoryChapter } from './landing/storyData';

// ── Warm palette (matches Sidebar) ───────────────────────────────────────────
const C = {
  panelBg:    '#1c1309',
  sectionBg:  '#231808',
  border:     '#4e3418',
  borderLt:   '#362410',
  textPri:    '#f0e0b8',
  textSec:    '#a08858',
  textMuted:  '#5a4028',
  gold:       '#d4a030',
  goldLight:  '#e8c060',
  hoverBg:    '#2e2010',
  activeBg:   '#3a2810',
  activeBdr:  '#c4922a',
  danger:     '#bb4422',
  dangerBg:   '#2a1008',
  dangerBdr:  '#6a2010',
} as const;

interface Props {
  state: GameState;
  onClose: () => void;
  onActivate: (chapterId: string | null) => void;   // triggers black-fade transition
  onAdd: (chapter: Chapter) => void;
  onUpdate: (chapter: Chapter) => void;
  onDelete: (id: string) => void;
}

const EMPTY_CHAPTER: Omit<Chapter, 'id'> = {
  name: '',
  description: '',
  backgroundUrl: '',
  allowedCharacters: [],
  systemPromptModifier: '',
  themeColor: '#c4922a',
};

function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const maxW = 1280;
      let w = img.naturalWidth, h = img.naturalHeight;
      if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = url;
  });
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ChapterManager({ state, onClose, onActivate, onAdd, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState<Chapter | null>(null);
  const [form, setForm] = useState<Omit<Chapter, 'id'>>(EMPTY_CHAPTER);
  const [showImport, setShowImport] = useState(false);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const chars = state.itemTypes.filter((t) => t.kind === 'image' && t.category === 'character');
  const activeChapter = state.chapters.find((c) => c.id === state.activeChapterId) ?? null;

  function openNew() {
    setEditing({ id: '', ...EMPTY_CHAPTER });
    setForm(EMPTY_CHAPTER);
  }

  function openEdit(ch: Chapter) {
    setEditing(ch);
    setForm({ name: ch.name, description: ch.description, backgroundUrl: ch.backgroundUrl ?? '',
      allowedCharacters: [...ch.allowedCharacters], systemPromptModifier: ch.systemPromptModifier,
      themeColor: ch.themeColor ?? '#c4922a' });
  }

  function saveForm() {
    if (!form.name.trim()) return;
    if (editing!.id) {
      onUpdate({ ...editing!, ...form });
    } else {
      onAdd({ id: `ch-${crypto.randomUUID()}`, ...form });
    }
    setEditing(null);
  }

  function toggleChar(id: string) {
    setForm((f) => ({
      ...f,
      allowedCharacters: f.allowedCharacters.includes(id)
        ? f.allowedCharacters.filter((x) => x !== id)
        : [...f.allowedCharacters, id],
    }));
  }

  async function handleBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const url = await compressImage(file);
    setForm((f) => ({ ...f, backgroundUrl: url }));
    e.target.value = '';
  }

  function handleImportStoryChapter(vol: StoryVolume, ch: StoryChapter) {
    const newChapter: Chapter = {
      id: `ch-${crypto.randomUUID()}`,
      name: ch.title.trim() || ch.subtitle,
      description: [ch.subtitle, vol.blurb.split('\n')[0]].filter(Boolean).join('　'),
      themeColor: vol.accent,
      backgroundUrl: '',
      allowedCharacters: [],
      systemPromptModifier: '',
    };
    onAdd(newChapter);
    setShowImport(false);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: '#140e06', color: C.textPri,
    border: `1px solid ${C.border}`, borderRadius: 4,
    padding: '7px 10px', fontSize: 12, outline: 'none', fontFamily: 'inherit',
  };

  return ReactDOM.createPortal(
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: 'rgba(0,0,0,0.82)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: C.panelBg, border: `2px solid ${C.border}`,
        borderRadius: 10, width: 680, maxWidth: '94vw', maxHeight: '88vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: `0 0 60px ${C.gold}18`,
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px 14px',
          borderBottom: `1px solid ${C.border}`,
          background: `linear-gradient(to bottom, #281c0a, ${C.panelBg})`,
          borderRadius: '8px 8px 0 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.gold, letterSpacing: 1.5 }}>篇章管理</div>
            <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2, letterSpacing: 0.8 }}>
              {activeChapter ? `当前篇章：${activeChapter.name}` : '未选择篇章'}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: C.textMuted,
            fontSize: 18, cursor: 'pointer', lineHeight: 1,
          }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>

          {/* ── Import picker ── */}
          <AnimatePresence>
            {showImport && (
              <motion.div
                key="import-picker"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <button onClick={() => setShowImport(false)} style={{
                    background: 'none', border: `1px solid ${C.borderLt}`, color: C.textMuted,
                    cursor: 'pointer', fontSize: 11, padding: '5px 10px', borderRadius: 4,
                  }}>← 返回</button>
                  <span style={{ fontSize: 12, color: C.textSec, letterSpacing: 0.6 }}>从物語导入篇章</span>
                </div>
                {STORY_DATA.map((vol) => (
                  <div key={vol.id} style={{ marginBottom: 20 }}>
                    <div style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: 1.2, marginBottom: 8,
                      color: vol.accent, borderBottom: `1px solid ${C.borderLt}`, paddingBottom: 6,
                    }}>
                      {vol.indexCh} · {vol.title}
                      <span style={{ color: C.textMuted, fontWeight: 400, marginLeft: 8 }}>{vol.titleEn}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {vol.chapters.map((ch) => (
                        <div key={ch.id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 12px', borderRadius: 5,
                          background: C.sectionBg, border: `1px solid ${C.borderLt}`,
                        }}>
                          <div>
                            <span style={{ fontSize: 12, color: C.textPri, marginRight: 8 }}>
                              第{ch.num}章　{ch.title}
                            </span>
                            {ch.subtitle && (
                              <span style={{ fontSize: 10, color: C.textMuted }}>{ch.subtitle}</span>
                            )}
                          </div>
                          <button onClick={() => handleImportStoryChapter(vol, ch)} style={{
                            background: `${vol.accent}18`, border: `1px solid ${vol.accent}66`,
                            color: vol.accent, cursor: 'pointer', fontSize: 10,
                            padding: '4px 10px', borderRadius: 4, whiteSpace: 'nowrap', flexShrink: 0,
                          }}>导入</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Edit form ── */}
          <AnimatePresence>
            {editing && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: C.sectionBg, border: `1px solid ${C.activeBdr}`,
                  borderRadius: 8, padding: 18, marginBottom: 20,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: C.goldLight, marginBottom: 14, letterSpacing: 0.8 }}>
                  {editing.id ? '编辑篇章' : '新建篇章'}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div>
                    <Label>篇章名称</Label>
                    <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="例：根（忍界大战）" style={inputStyle} />
                  </div>
                  <div>
                    <Label>主题色</Label>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="color" value={form.themeColor ?? '#c4922a'}
                        onChange={(e) => setForm((f) => ({ ...f, themeColor: e.target.value }))}
                        style={{ width: 32, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'none', padding: 0 }} />
                      <div style={{ flex: 1, height: 32, borderRadius: 4, background: form.themeColor ?? '#c4922a', opacity: 0.6 }} />
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <Label>简介</Label>
                  <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="这个篇章发生了什么……" rows={2}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }} />
                </div>

                <div style={{ marginBottom: 10 }}>
                  <Label>AI 性格修饰词（注入系统提示词）</Label>
                  <textarea value={form.systemPromptModifier}
                    onChange={(e) => setForm((f) => ({ ...f, systemPromptModifier: e.target.value }))}
                    placeholder="例：此时阿伦处于『根』时期，性格更冷血、机械，情感几乎全部压制，极少流露个人立场……"
                    rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }} />
                </div>

                <div style={{ marginBottom: 10 }}>
                  <Label>篇章背景图</Label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button onClick={() => bgInputRef.current?.click()} style={{
                      background: '#2e1e0c', border: `1px solid ${C.border}`, color: C.textSec,
                      fontSize: 11, padding: '6px 12px', borderRadius: 4, cursor: 'pointer',
                    }}>
                      {form.backgroundUrl ? '更换图片' : '上传背景图'}
                    </button>
                    {form.backgroundUrl && (
                      <img src={form.backgroundUrl} alt="" style={{
                        height: 36, width: 64, objectFit: 'cover', borderRadius: 3,
                        border: `1px solid ${C.border}`,
                      }} />
                    )}
                    {form.backgroundUrl && (
                      <button onClick={() => setForm((f) => ({ ...f, backgroundUrl: '' }))}
                        style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: 12 }}>
                        移除
                      </button>
                    )}
                  </div>
                  <input ref={bgInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBgUpload} />
                </div>

                {chars.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <Label>可出现人物（不选 = 全部允许）</Label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                      {chars.map((t) => {
                        const sel = form.allowedCharacters.includes(t.id);
                        const avatar = t.characterProfile?.avatarMap?.Default ?? t.poses?.[0]?.imageUrl ?? t.imageUrl;
                        return (
                          <div key={t.id} onClick={() => toggleChar(t.id)} style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '4px 8px', borderRadius: 5, cursor: 'pointer',
                            background: sel ? `${form.themeColor ?? C.activeBdr}22` : '#140e06',
                            border: `1px solid ${sel ? (form.themeColor ?? C.activeBdr) : C.borderLt}`,
                            transition: 'all 0.15s',
                          }}>
                            {avatar && <img src={avatar} alt="" style={{ width: 22, height: 22, objectFit: 'contain', borderRadius: 2 }} />}
                            <span style={{ fontSize: 11, color: sel ? C.goldLight : C.textSec }}>
                              {t.characterProfile?.name || t.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button onClick={() => setEditing(null)} style={{
                    background: 'none', border: `1px solid ${C.borderLt}`, color: C.textMuted,
                    cursor: 'pointer', fontSize: 12, padding: '6px 14px', borderRadius: 4,
                  }}>取消</button>
                  <button onClick={saveForm} disabled={!form.name.trim()} style={{
                    background: '#2e1e0c', border: `1px solid ${C.activeBdr}`, color: C.gold,
                    cursor: 'pointer', fontSize: 12, padding: '6px 16px', borderRadius: 4,
                    opacity: form.name.trim() ? 1 : 0.4,
                  }}>保存篇章</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Chapter cards ── */}
          {!showImport && state.chapters.length === 0 && !editing && (
            <div style={{ fontSize: 12, color: C.textMuted, padding: '20px 0', textAlign: 'center' }}>
              还没有篇章，点击下方按钮创建第一个。
            </div>
          )}

          <div style={{ display: showImport ? 'none' : 'flex', flexDirection: 'column', gap: 10 }}>
            {state.chapters.map((ch) => {
              const isActive = ch.id === state.activeChapterId;
              const color = ch.themeColor ?? C.activeBdr;
              const allowedNames = ch.allowedCharacters.length === 0
                ? '全部人物'
                : ch.allowedCharacters
                    .map((id) => {
                      const t = chars.find((c) => c.id === id);
                      return t?.characterProfile?.name || t?.label || id;
                    })
                    .join('、');
              return (
                <motion.div
                  key={ch.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    borderRadius: 7,
                    border: `1.5px solid ${isActive ? color : C.borderLt}`,
                    background: isActive ? `${color}12` : C.sectionBg,
                    overflow: 'hidden',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                >
                  <div style={{ display: 'flex' }}>
                    {/* Background thumbnail */}
                    {ch.backgroundUrl && (
                      <div style={{
                        width: 90, flexShrink: 0,
                        backgroundImage: `url(${ch.backgroundUrl})`,
                        backgroundSize: 'cover', backgroundPosition: 'center',
                      }} />
                    )}
                    {!ch.backgroundUrl && (
                      <div style={{
                        width: 6, flexShrink: 0,
                        background: color, opacity: isActive ? 0.9 : 0.4,
                      }} />
                    )}

                    <div style={{ flex: 1, padding: '12px 14px', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? color : C.textPri }}>
                          {ch.name}
                        </div>
                        {isActive && (
                          <div style={{ fontSize: 10, color, background: `${color}22`,
                            border: `1px solid ${color}44`, borderRadius: 3, padding: '1px 6px' }}>
                            进行中
                          </div>
                        )}
                      </div>
                      {ch.description && (
                        <div style={{ fontSize: 11, color: C.textSec, marginBottom: 5, lineHeight: 1.6,
                          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {ch.description}
                        </div>
                      )}
                      <div style={{ fontSize: 10, color: C.textMuted }}>人物：{allowedNames}</div>
                    </div>

                    {/* Actions */}
                    <div style={{
                      display: 'flex', flexDirection: 'column',
                      justifyContent: 'center', gap: 5, padding: '10px 12px',
                      borderLeft: `1px solid ${C.borderLt}`, flexShrink: 0,
                    }}>
                      <button
                        onClick={() => onActivate(isActive ? null : ch.id)}
                        style={{
                          background: isActive ? `${color}22` : '#2e1e0c',
                          border: `1px solid ${isActive ? color : C.border}`,
                          color: isActive ? color : C.textSec,
                          cursor: 'pointer', fontSize: 11, padding: '5px 10px', borderRadius: 4,
                          whiteSpace: 'nowrap',
                        }}>
                        {isActive ? '退出篇章' : '进入篇章'}
                      </button>
                      <button onClick={() => openEdit(ch)} style={{
                        background: 'none', border: `1px solid ${C.borderLt}`,
                        color: C.textMuted, cursor: 'pointer', fontSize: 11,
                        padding: '5px 10px', borderRadius: 4,
                      }}>编辑</button>
                      <button onClick={() => onDelete(ch.id)} style={{
                        background: 'none', border: `1px solid ${C.dangerBdr}`,
                        color: C.danger, cursor: 'pointer', fontSize: 11,
                        padding: '5px 10px', borderRadius: 4, opacity: 0.6, transition: 'opacity 0.15s',
                      }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.6'; }}>
                        删除
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px', borderTop: `1px solid ${C.borderLt}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: `linear-gradient(to top, #281c0a, ${C.panelBg})`,
          borderRadius: '0 0 8px 8px',
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={openNew}
              disabled={!!editing || showImport}
              style={{
                background: '#2e1e0c', border: `1px dashed ${C.border}`, color: C.textSec,
                cursor: (editing || showImport) ? 'not-allowed' : 'pointer', fontSize: 12,
                padding: '8px 18px', borderRadius: 5, opacity: (editing || showImport) ? 0.4 : 1,
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!editing && !showImport) {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.borderColor = C.gold; b.style.color = C.gold;
                }
              }}
              onMouseLeave={(e) => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.borderColor = C.border; b.style.color = C.textSec;
              }}
            >
              ＋ 新建篇章
            </button>
            <button
              onClick={() => { setShowImport((v) => !v); setEditing(null); }}
              style={{
                background: showImport ? '#2e1e0c' : 'transparent',
                border: `1px solid ${showImport ? C.gold : C.borderLt}`,
                color: showImport ? C.gold : C.textMuted,
                cursor: 'pointer', fontSize: 12,
                padding: '8px 14px', borderRadius: 5,
                transition: 'all 0.15s',
              }}
            >
              ↓ 从物語导入
            </button>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: `1px solid ${C.borderLt}`, color: C.textMuted,
            cursor: 'pointer', fontSize: 12, padding: '8px 16px', borderRadius: 5,
          }}>关闭</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, color: '#5a4028', letterSpacing: 0.8, marginBottom: 5, fontWeight: 600 }}>
      {children}
    </div>
  );
}
