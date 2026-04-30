import { useState, useRef, useEffect } from 'react';
import localforage from 'localforage';
import type { GameState, SceneNote } from '../types';
import CreateSceneModal from './CreateSceneModal';

const MUSIC_STORAGE_KEY = 'music-tracks';

interface StoredTrack {
  name: string;
  buffer: ArrayBuffer;
  mimeType: string;
}

function readFileAsBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// ── Cipher palette (landing page aesthetic) ───────────────────────────────────
const C = {
  panelBg:     '#0b0f0c',
  sectionBg:   '#0f1612',
  border:      'rgba(127,176,105,0.25)',
  borderLight: 'rgba(127,176,105,0.12)',
  textPri:     '#f2efe6',
  textSec:     '#d8d2c2',
  textMuted:   'rgba(242,239,230,0.35)',
  gold:        '#ff6b1a',
  goldLight:   '#ff8a3d',
  hoverBg:     'rgba(127,176,105,0.06)',
  activeBg:    'rgba(127,176,105,0.12)',
  activeBorder:'#7fb069',
  success:     '#7fb069',
  successBg:   'rgba(127,176,105,0.08)',
  successBdr:  'rgba(127,176,105,0.3)',
  danger:      '#c1121f',
  dangerBg:    'rgba(193,18,31,0.1)',
  dangerBdr:   'rgba(193,18,31,0.35)',
  info:        '#d8d2c2',
  infoBg:      'rgba(242,239,230,0.05)',
  infoBdr:     'rgba(242,239,230,0.15)',
} as const;
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  state: GameState;
  onSetActiveScene: (id: string) => void;
  onAddScene: (name: string) => void;
  onRestoreItem: (itemId: string) => void;
  onRenameItem: (itemId: string, label: string) => void;
  onPermanentlyDeleteItem: (itemId: string) => void;
  onAddSceneNote: (sceneId: string, note: SceneNote) => void;
  onUpdateSceneNote: (sceneId: string, note: SceneNote) => void;
  onDeleteSceneNote: (sceneId: string, noteId: string) => void;
}

export default function Sidebar({
  state, onSetActiveScene, onAddScene,
  onRestoreItem, onRenameItem, onPermanentlyDeleteItem,
  onAddSceneNote, onUpdateSceneNote, onDeleteSceneNote,
}: Props) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notesSceneId, setNotesSceneId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [formChapter, setFormChapter] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [trashOpen, setTrashOpen] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // ── Audio ────────────────────────────────────────────────────────────────
  const [tracks, setTracks] = useState<Array<{ name: string; url: string }>>([]);
  const [trackIdx, setTrackIdx] = useState(0);
  const [muted, setMuted] = useState(false);
  const [looping, setLooping] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load persisted tracks from IndexedDB on mount
  useEffect(() => {
    localforage.getItem<StoredTrack[]>(MUSIC_STORAGE_KEY).then((saved) => {
      if (!saved || saved.length === 0) return;
      const loaded = saved.map((t) => ({
        name: t.name,
        url: URL.createObjectURL(new Blob([t.buffer], { type: t.mimeType })),
      }));
      setTracks(loaded);
    });
  }, []);

  // Play whenever trackIdx or tracks change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || tracks.length === 0) return;
    const src = tracks[trackIdx]?.url; if (!src) return;
    audio.src = src; audio.load();
    audio.play().then(() => setSpinning(true)).catch(() => {});
  }, [trackIdx, tracks]);

  useEffect(() => { if (audioRef.current) audioRef.current.muted = muted; }, [muted]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []); if (!files.length) return;

    // Read each file as ArrayBuffer for IndexedDB persistence
    const newStoredTracks: StoredTrack[] = await Promise.all(
      files.map(async (f) => ({
        name: f.name.replace(/\.[^.]+$/, '').slice(0, 24),
        buffer: await readFileAsBuffer(f),
        mimeType: f.type || 'audio/mpeg',
      }))
    );

    const newTracks = newStoredTracks.map((t) => ({
      name: t.name,
      url: URL.createObjectURL(new Blob([t.buffer], { type: t.mimeType })),
    }));

    // Persist to IndexedDB
    localforage.getItem<StoredTrack[]>(MUSIC_STORAGE_KEY).then((existing) => {
      const merged = [...(existing ?? []), ...newStoredTracks];
      localforage.setItem(MUSIC_STORAGE_KEY, merged);
    });

    setTracks((prev) => {
      const next = [...prev, ...newTracks];
      if (prev.length === 0) {
        setTimeout(() => {
          const audio = audioRef.current;
          if (audio && next[0]) { audio.src = next[0].url; audio.load(); audio.play().then(() => setSpinning(true)).catch(() => {}); }
        }, 0);
      }
      return next;
    });
    e.target.value = '';
  }
  function playNext() { if (tracks.length === 0) return; setTrackIdx((i) => (i + 1) % tracks.length); }
  function handleEnded() { if (!looping) return; playNext(); }

  // ── Notes form ───────────────────────────────────────────────────────────
  function openAddForm() { setEditingNoteId(null); setFormChapter(''); setFormSummary(''); setFormOpen(true); }
  function openEditForm(note: SceneNote) { setEditingNoteId(note.id); setFormChapter(note.chapter); setFormSummary(note.summary); setFormOpen(true); }
  function cancelForm() { setFormOpen(false); setEditingNoteId(null); setFormChapter(''); setFormSummary(''); }
  function saveNote() {
    if (!notesSceneId) return;
    const chapter = formChapter.trim(); const summary = formSummary.trim();
    if (!chapter && !summary) return;
    if (editingNoteId) {
      const scene = state.scenes.find((s) => s.id === notesSceneId);
      const original = scene?.notes?.find((n) => n.id === editingNoteId);
      if (original) onUpdateSceneNote(notesSceneId, { ...original, chapter, summary });
    } else {
      onAddSceneNote(notesSceneId, { id: `note-${crypto.randomUUID()}`, chapter, summary, createdAt: Date.now() });
    }
    cancelForm();
  }

  function startRename(itemId: string, label: string) { setRenamingId(itemId); setRenameValue(label); }
  function commitRename(itemId: string) {
    const t = renameValue.trim(); if (t) onRenameItem(itemId, t);
    setRenamingId(null); setExpandedId(null);
  }

  const trashedItems = state.items.filter((i) => i.trashed);

  return (
    <div style={{
      width: 200, flexShrink: 0,
      background: C.panelBg,
      borderRight: `2px solid ${C.border}`,
      display: 'flex', flexDirection: 'column',
      height: '100%', overflowY: 'auto',
    }}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{
        padding: '14px 14px 12px',
        background: `linear-gradient(to bottom, #1a2320, ${C.panelBg})`,
        borderBottom: `1px solid ${C.border}`,
        backgroundImage: `
          linear-gradient(rgba(127,176,105,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(127,176,105,0.04) 1px, transparent 1px),
          linear-gradient(to bottom, #1a2320, ${C.panelBg})
        `,
        backgroundSize: '16px 16px, 16px 16px, 100% 100%',
      }}>
        <div style={{
          fontSize: 14, fontWeight: 800, color: C.gold,
          letterSpacing: '0.15em', lineHeight: 1,
          fontFamily: "'Shippori Mincho', 'Noto Serif JP', serif",
        }}>
          人間未満
        </div>
        <div style={{
          fontSize: 9, color: C.activeBorder, marginTop: 5,
          letterSpacing: '0.35em', opacity: 0.7,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          NINGEN · IMAN · STUDIO
        </div>
      </div>

      {/* ── Scene list ──────────────────────────────────────────────────── */}
      <div style={{ borderBottom: `1px solid ${C.borderLight}` }}>
        <div style={{
          padding: '8px 12px 5px',
          fontSize: 9, color: C.activeBorder, opacity: 0.8,
          fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          场 景
        </div>

        {state.scenes.map((scene) => {
          const active = scene.id === state.activeSceneId;
          const hasNotes = (scene.notes?.length ?? 0) > 0;
          return (
            <div
              key={scene.id}
              style={{
                display: 'flex', alignItems: 'center',
                background: active ? C.activeBg : 'transparent',
                borderLeft: `3px solid ${active ? C.activeBorder : 'transparent'}`,
                transition: 'background 0.12s, border-color 0.12s',
              }}
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              <div
                onClick={() => onSetActiveScene(scene.id)}
                style={{
                  flex: 1, padding: '9px 6px 9px 11px', cursor: 'pointer', fontSize: 13,
                  color: active ? C.goldLight : C.textSec,
                  lineHeight: 1.4, wordBreak: 'break-all', minWidth: 0,
                  fontWeight: active ? 600 : 400,
                  transition: 'color 0.12s',
                }}
              >
                {scene.name}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setNotesSceneId(scene.id); }}
                title="场景注记"
                style={{
                  flexShrink: 0, background: 'none', border: 'none',
                  cursor: 'pointer', padding: '0 10px 0 2px',
                  fontSize: 12, lineHeight: 1, opacity: hasNotes ? 0.7 : 0.2,
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = hasNotes ? '0.7' : '0.2'; }}
              >
                📝
              </button>
            </div>
          );
        })}

        <div
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '9px 14px', cursor: 'pointer', fontSize: 12,
            color: C.textMuted, borderLeft: '3px solid transparent',
            transition: 'color 0.12s, background 0.12s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.color = C.gold;
            (e.currentTarget as HTMLDivElement).style.background = C.hoverBg;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.color = C.textMuted;
            (e.currentTarget as HTMLDivElement).style.background = 'transparent';
          }}
        >
          ＋ 新建场景
        </div>
      </div>

      {/* ── Stash ───────────────────────────────────────────────────────── */}
      <div>
        <div
          onClick={() => setTrashOpen((v) => !v)}
          style={{
            padding: '9px 12px', cursor: 'pointer', fontSize: 11,
            color: C.textMuted, fontWeight: 600, letterSpacing: 0.8,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            userSelect: 'none', transition: 'color 0.12s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.color = C.textSec; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.color = C.textMuted; }}
        >
          <span>暂存箱{trashedItems.length > 0 ? ` · ${trashedItems.length}` : ''}</span>
          <span style={{ fontSize: 9 }}>{trashOpen ? '▲' : '▼'}</span>
        </div>

        {trashOpen && (
          <div>
            {trashedItems.length === 0 && (
              <div style={{ padding: '6px 14px 10px', fontSize: 11, color: C.textMuted }}>暂存箱为空</div>
            )}
            {trashedItems.map((item) => {
              const expanded = expandedId === item.id;
              const renaming = renamingId === item.id;
              return (
                <div
                  key={item.id}
                  style={{ borderBottom: `1px solid ${C.borderLight}` }}
                >
                  <div
                    style={{
                      padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 6,
                      cursor: 'pointer',
                      background: expanded ? C.activeBg : 'transparent',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) => { if (!expanded) (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
                    onMouseLeave={(e) => { if (!expanded) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                    onClick={() => { if (renaming) return; setExpandedId(expanded ? null : item.id); }}
                  >
                    {renaming ? (
                      <input
                        autoFocus value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitRename(item.id);
                          if (e.key === 'Escape') { setRenamingId(null); setExpandedId(null); }
                        }}
                        onBlur={() => commitRename(item.id)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          flex: 1, background: 'rgba(0,0,0,0.6)', color: C.textPri,
                          border: `1px solid ${C.gold}`, borderRadius: 0,
                          padding: '2px 6px', fontSize: 12, outline: 'none',
                        }}
                      />
                    ) : (
                      <span style={{
                        flex: 1, fontSize: 12,
                        color: expanded ? C.textPri : C.textSec,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {item.label}
                      </span>
                    )}
                    {!renaming && (
                      <span style={{ fontSize: 9, color: C.textMuted, flexShrink: 0 }}>
                        {expanded ? '▲' : '▼'}
                      </span>
                    )}
                  </div>

                  {expanded && !renaming && (
                    <div style={{ padding: '0 10px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <SidebarActionBtn color={C.success} bg={C.successBg} border={C.successBdr}
                        onClick={() => onRestoreItem(item.id)}>↩ 放回当前场景</SidebarActionBtn>
                      <SidebarActionBtn color={C.info} bg={C.infoBg} border={C.infoBdr}
                        onClick={() => startRename(item.id, item.label)}>✎ 更改名称</SidebarActionBtn>
                      <SidebarActionBtn color={C.danger} bg={C.dangerBg} border={C.dangerBdr}
                        onClick={() => { onPermanentlyDeleteItem(item.id); setExpandedId(null); }}>✕ 永久删除</SidebarActionBtn>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Audio player ─────────────────────────────────────────────────── */}
      <div style={{
        marginTop: 'auto',
        borderTop: `1px solid ${C.borderLight}`,
        padding: '10px 12px 12px',
        background: `linear-gradient(to top, #1a2320, ${C.panelBg})`,
      }}>
        <audio ref={audioRef} loop={looping && tracks.length <= 1} onEnded={handleEnded} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {/* Disc */}
          <div
            onClick={() => {
              if (tracks.length === 0) { fileInputRef.current?.click(); return; }
              const audio = audioRef.current; if (!audio) return;
              if (audio.paused) { audio.play().then(() => setSpinning(true)).catch(() => {}); }
              else { audio.pause(); setSpinning(false); }
            }}
            title={tracks.length === 0 ? '点击上传音乐' : spinning ? '暂停' : '播放'}
            style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: `conic-gradient(#070a07 0%, ${C.activeBg} 35%, #0b0f0c 60%, #0f1612 100%)`,
              border: `1.5px solid ${spinning ? C.activeBorder : C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: spinning ? `0 0 8px ${C.activeBorder}55` : 'none',
              animation: spinning ? 'discSpin 3s linear infinite' : 'none',
              transition: 'border-color 0.3s, box-shadow 0.3s',
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0b0f0c', border: `1px solid ${C.border}` }} />
          </div>

          {/* Track name */}
          <div style={{
            flex: 1, minWidth: 0, fontSize: 10,
            color: tracks.length > 0 ? C.textSec : C.textMuted,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {tracks.length > 0 ? tracks[trackIdx]?.name : '点击光盘上传音乐'}
          </div>

          {tracks.length > 0 && (
            <button onClick={() => setLooping((v) => !v)} title={looping ? '关闭循环' : '开启循环'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
                fontSize: 12, lineHeight: 1, opacity: looping ? 0.9 : 0.3, transition: 'opacity 0.15s' }}>
              🔁
            </button>
          )}
          {tracks.length > 0 && (
            <button onClick={() => setMuted((v) => !v)} title={muted ? '取消静音' : '静音'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
                fontSize: 13, lineHeight: 1, opacity: muted ? 0.35 : 0.7, transition: 'opacity 0.15s' }}>
              {muted ? '🔇' : '🔊'}
            </button>
          )}
          {tracks.length > 1 && (
            <button onClick={playNext} title="下一首"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
                fontSize: 12, lineHeight: 1, color: C.textMuted, transition: 'color 0.15s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = C.gold; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = C.textMuted; }}>
              ⏭
            </button>
          )}
          <button onClick={() => fileInputRef.current?.click()} title="添加音乐"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
              fontSize: 14, lineHeight: 1, color: C.textMuted, transition: 'color 0.15s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = C.gold; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = C.textMuted; }}>
            ＋
          </button>
        </div>

        {tracks.length > 1 && (
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tracks.map((t, i) => (
              <div key={i} onClick={() => setTrackIdx(i)} style={{
                fontSize: 10, padding: '2px 5px', borderRadius: 3, cursor: 'pointer',
                color: i === trackIdx ? C.gold : C.textMuted,
                background: i === trackIdx ? C.activeBg : 'transparent',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                transition: 'background 0.12s, color 0.12s',
              }}>
                {i === trackIdx ? '▶ ' : '　'}{t.name}
              </div>
            ))}
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="audio/*" multiple style={{ display: 'none' }} onChange={handleUpload} />
      </div>

      <style>{`@keyframes discSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* ── Scene notes modal ────────────────────────────────────────────── */}
      {notesSceneId && (() => {
        const scene = state.scenes.find((s) => s.id === notesSceneId);
        if (!scene) return null;
        const sorted = [...(scene.notes ?? [])].sort((a, b) => a.createdAt - b.createdAt);
        const inputStyle: React.CSSProperties = {
          width: '100%', boxSizing: 'border-box',
          background: 'rgba(0,0,0,0.6)', color: C.textPri,
          border: `1px solid ${C.border}`, borderRadius: 0,
          padding: '7px 10px', fontSize: 12, outline: 'none', fontFamily: 'inherit',
        };
        return (
          <div onClick={() => { setNotesSceneId(null); cancelForm(); }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div onClick={(e) => e.stopPropagation()}
              style={{
                background: '#0b0f0c', border: `1px solid ${C.border}`,
                borderRadius: 0, padding: 22, width: 500, maxWidth: '92vw',
                maxHeight: '85vh', display: 'flex', flexDirection: 'column',
                boxShadow: `0 0 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(127,176,105,0.1)`,
              }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.gold, marginBottom: 14, flexShrink: 0 }}>
                📝　{scene.name}
              </div>

              <div style={{ flex: 1, overflowY: 'auto', marginBottom: 12 }}>
                {sorted.length === 0 && !formOpen && (
                  <div style={{ fontSize: 12, color: C.textMuted, padding: '8px 0 16px' }}>
                    还没有记录，点击下方按钮添加第一条。
                  </div>
                )}
                {sorted.map((note) => (
                  <div key={note.id} style={{
                    marginBottom: 8, padding: '10px 12px',
                    background: C.sectionBg, borderRadius: 5,
                    border: `1px solid ${C.borderLight}`,
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.goldLight, marginBottom: 4 }}>
                        {note.chapter || '（无章节）'}
                      </div>
                      <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                        {note.summary}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                      <button onClick={() => openEditForm(note)} title="编辑"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: '2px 4px', opacity: 0.3, transition: 'opacity 0.15s' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.3'; }}>✏️</button>
                      <button onClick={() => onDeleteSceneNote(notesSceneId, note.id)} title="删除"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: '2px 4px', opacity: 0.3, transition: 'opacity 0.15s' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.3'; }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>

              {formOpen ? (
                <div style={{ flexShrink: 0, borderTop: `1px solid ${C.borderLight}`, paddingTop: 12 }}>
                  <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 8, letterSpacing: 0.8 }}>
                    {editingNoteId ? '编辑记录' : '新建记录'}
                  </div>
                  <input autoFocus value={formChapter} onChange={(e) => setFormChapter(e.target.value)}
                    placeholder='章节位置，例如：第3章' style={{ ...inputStyle, marginBottom: 8 }} />
                  <textarea value={formSummary} onChange={(e) => setFormSummary(e.target.value)}
                    placeholder='这个场景里发生了什么……' rows={4}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7, marginBottom: 10 }} />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button onClick={cancelForm}
                      style={{ background: 'none', border: `1px solid ${C.borderLight}`, color: C.textMuted,
                        cursor: 'pointer', fontSize: 12, padding: '6px 14px', borderRadius: 4 }}>取消</button>
                    <button onClick={saveNote} disabled={!formChapter.trim() && !formSummary.trim()}
                      style={{ background: 'rgba(255,107,26,0.12)', border: `1px solid ${C.gold}`, color: C.gold,
                        cursor: 'pointer', fontSize: 12, padding: '6px 14px', borderRadius: 0,
                        opacity: (!formChapter.trim() && !formSummary.trim()) ? 0.4 : 1 }}>保存这条记录</button>
                  </div>
                </div>
              ) : (
                <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={openAddForm}
                    style={{ background: C.sectionBg, border: `1px dashed ${C.border}`, color: C.textSec,
                      cursor: 'pointer', fontSize: 12, padding: '7px 16px', borderRadius: 4,
                      transition: 'border-color 0.15s, color 0.15s' }}
                    onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = C.gold; b.style.color = C.gold; }}
                    onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = C.border; b.style.color = C.textSec; }}>
                    ＋ 添加记录
                  </button>
                  <button onClick={() => setNotesSceneId(null)}
                    style={{ background: 'none', border: `1px solid ${C.borderLight}`, color: C.textMuted,
                      cursor: 'pointer', fontSize: 12, padding: '7px 14px', borderRadius: 4 }}>关闭</button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {showCreateModal && (
        <CreateSceneModal
          existingNames={state.scenes.map((s) => s.name)}
          onConfirm={onAddScene}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

function SidebarActionBtn({ color, bg, border, onClick, children }: {
  color: string; bg: string; border: string; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick}
      style={{
        width: '100%', background: bg, border: `1px solid ${border}`,
        color, cursor: 'pointer', fontSize: 11,
        padding: '5px 8px', borderRadius: 4, textAlign: 'left',
        transition: 'filter 0.12s',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.2)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1)'; }}
    >
      {children}
    </button>
  );
}
