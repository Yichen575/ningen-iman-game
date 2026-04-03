import { useState, useRef, useEffect } from 'react';
import type { GameState } from '../types';
import CreateSceneModal from './CreateSceneModal';

interface Props {
  state: GameState;
  onSetActiveScene: (id: string) => void;
  onAddScene: (name: string) => void;
  onRestoreItem: (itemId: string) => void;
  onRenameItem: (itemId: string, label: string) => void;
  onPermanentlyDeleteItem: (itemId: string) => void;
}

export default function Sidebar({
  state, onSetActiveScene, onAddScene,
  onRestoreItem, onRenameItem, onPermanentlyDeleteItem,
}: Props) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [trashOpen, setTrashOpen] = useState(true);
  // Which stashed item is expanded (showing action buttons)
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Which item is in rename mode
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const trashedItems = state.items.filter((i) => i.trashed);

  // ── Audio player state ────────────────────────────────────────────────────
  const [tracks, setTracks] = useState<Array<{ name: string; url: string }>>([]);
  const [trackIdx, setTrackIdx] = useState(0);
  const [muted, setMuted] = useState(false);
  const [looping, setLooping] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep audio src in sync with trackIdx
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || tracks.length === 0) return;
    const src = tracks[trackIdx]?.url;
    if (!src) return;
    audio.src = src;
    audio.load();
    audio.play().then(() => setSpinning(true)).catch(() => {});
  }, [trackIdx, tracks]);

  // Sync muted
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const newTracks = files.map((f) => ({
      name: f.name.replace(/\.[^.]+$/, '').slice(0, 24),
      url: URL.createObjectURL(f),
    }));
    setTracks((prev) => {
      const next = [...prev, ...newTracks];
      // If no track playing yet, start from first new track
      if (prev.length === 0) {
        setTimeout(() => {
          const audio = audioRef.current;
          if (audio && next[0]) {
            audio.src = next[0].url;
            audio.load();
            audio.play().then(() => setSpinning(true)).catch(() => {});
          }
        }, 0);
      }
      return next;
    });
    e.target.value = '';
  }

  function playNext() {
    if (tracks.length === 0) return;
    setTrackIdx((i) => (i + 1) % tracks.length);
  }

  function handleEnded() {
    if (!looping) return;   // stop after last track if loop is off
    playNext();
  }

  function startRename(itemId: string, currentLabel: string) {
    setRenamingId(itemId);
    setRenameValue(currentLabel);
  }

  function commitRename(itemId: string) {
    const trimmed = renameValue.trim();
    if (trimmed) onRenameItem(itemId, trimmed);
    setRenamingId(null);
    setExpandedId(null);
  }

  return (
    <div style={{
      width: 200,
      flexShrink: 0,
      background: '#0e1016',
      borderRight: '2px solid #2a2a3a',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 12px',
        borderBottom: '1px solid #2a2a3a',
        fontSize: 14, fontWeight: 700, color: '#ffd84a', letterSpacing: 0.5,
      }}>
        人间未满
      </div>

      {/* Scene list */}
      <div style={{ padding: '6px 0', borderBottom: '1px solid #1a1a2a' }}>
        <div style={{ padding: '6px 12px', fontSize: 11, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>
          场景
        </div>
        {state.scenes.map((scene) => {
          const active = scene.id === state.activeSceneId;
          return (
            <div
              key={scene.id}
              onClick={() => onSetActiveScene(scene.id)}
              style={{
                padding: '10px 12px', cursor: 'pointer', fontSize: 13,
                color: active ? '#ffd84a' : '#aaa',
                background: active ? '#1e2438' : 'transparent',
                borderLeft: `3px solid ${active ? '#ffd84a' : 'transparent'}`,
                lineHeight: 1.4, transition: 'all 0.1s', wordBreak: 'break-all',
              }}
            >
              {scene.name}
            </div>
          );
        })}
        <div
          onClick={() => setShowCreateModal(true)}
          style={{ padding: '10px 12px', cursor: 'pointer', fontSize: 13, color: '#556', borderLeft: '3px solid transparent', marginTop: 2 }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#889'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#556'; }}
        >
          + 新建场景
        </div>
      </div>

      {/* Stash */}
      <div style={{ padding: '4px 0' }}>
        <div
          onClick={() => setTrashOpen((v) => !v)}
          style={{
            padding: '10px 12px', cursor: 'pointer', fontSize: 12, color: '#668',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            userSelect: 'none',
          }}
        >
          <span>物品暂存箱{trashedItems.length > 0 ? ` (${trashedItems.length})` : ''}</span>
          <span style={{ fontSize: 10 }}>{trashOpen ? '▲' : '▼'}</span>
        </div>

        {trashOpen && (
          <div>
            {trashedItems.length === 0 && (
              <div style={{ padding: '8px 12px', fontSize: 12, color: '#444' }}>暂存箱为空</div>
            )}
            {trashedItems.map((item) => {
              const expanded = expandedId === item.id;
              const renaming = renamingId === item.id;

              return (
                <div key={item.id} style={{ borderBottom: '1px solid #161620' }}>
                  {/* Main row */}
                  <div
                    style={{
                      padding: '8px 12px', display: 'flex', alignItems: 'center',
                      gap: 6, cursor: 'pointer',
                      background: expanded ? '#1a1e2c' : 'transparent',
                    }}
                    onClick={() => {
                      if (renaming) return;
                      setExpandedId(expanded ? null : item.id);
                    }}
                  >
                    {renaming ? (
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitRename(item.id);
                          if (e.key === 'Escape') { setRenamingId(null); setExpandedId(null); }
                        }}
                        onBlur={() => commitRename(item.id)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          flex: 1, background: '#0e1218', color: '#e8e0c0',
                          border: '1px solid #ffd84a', borderRadius: 3,
                          padding: '2px 6px', fontSize: 12, outline: 'none',
                        }}
                      />
                    ) : (
                      <span style={{
                        flex: 1, fontSize: 12, color: expanded ? '#ddd' : '#999',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {item.label}
                      </span>
                    )}
                    {!renaming && (
                      <span style={{ fontSize: 10, color: '#446', flexShrink: 0 }}>
                        {expanded ? '▲' : '▼'}
                      </span>
                    )}
                  </div>

                  {/* Expanded actions */}
                  {expanded && !renaming && (
                    <div style={{ padding: '0 12px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <button
                        onClick={() => onRestoreItem(item.id)}
                        style={{ ...actionBtn, color: '#66cc66', borderColor: '#336633', background: '#1a2a1a' }}
                      >
                        ↩ 放回当前场景
                      </button>
                      <button
                        onClick={() => startRename(item.id, item.label)}
                        style={{ ...actionBtn, color: '#88aaff', borderColor: '#334488', background: '#1a1a2a' }}
                      >
                        ✎ 更改名称
                      </button>
                      <button
                        onClick={() => {
                          onPermanentlyDeleteItem(item.id);
                          setExpandedId(null);
                        }}
                        style={{ ...actionBtn, color: '#ff6060', borderColor: '#662222', background: '#2a1a1a' }}
                      >
                        ✕ 永久删除
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Audio player ─────────────────────────────────────────────── */}
      <div style={{ marginTop: 'auto', borderTop: '1px solid #1a1a2a', padding: '10px 12px 12px' }}>
        {/* Hidden audio element */}
        <audio ref={audioRef} loop={looping && tracks.length <= 1} onEnded={handleEnded} />

        {/* Disc + controls row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Spinning disc icon */}
          <div
            onClick={() => {
              if (tracks.length === 0) { fileInputRef.current?.click(); return; }
              const audio = audioRef.current;
              if (!audio) return;
              if (audio.paused) {
                audio.play().then(() => setSpinning(true)).catch(() => {});
              } else {
                audio.pause();
                setSpinning(false);
              }
            }}
            title={tracks.length === 0 ? '点击上传音乐' : spinning ? '暂停' : '播放'}
            style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: 'conic-gradient(#1e1a2e 0%, #2a2040 40%, #1a1628 60%, #2e2444 100%)',
              border: '2px solid #2e2444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative', overflow: 'hidden',
              boxShadow: spinning ? '0 0 8px rgba(180,140,240,0.3)' : 'none',
              animation: spinning ? 'discSpin 3s linear infinite' : 'none',
              transition: 'box-shadow 0.3s',
            }}
          >
            {/* Centre hole */}
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#0e0c18', border: '1px solid #3a3050',
            }} />
          </div>

          {/* Track name */}
          <div style={{
            flex: 1, minWidth: 0,
            fontSize: 10, color: tracks.length > 0 ? '#887799' : '#332244',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {tracks.length > 0
              ? tracks[trackIdx]?.name
              : '点击光盘上传音乐'}
          </div>

          {/* Loop toggle */}
          {tracks.length > 0 && (
            <button
              onClick={() => setLooping((v) => !v)}
              title={looping ? '关闭循环' : '开启循环'}
              style={{
                background: 'none', border: 'none',
                color: looping ? '#b8a0e0' : '#332244',
                fontSize: 13, cursor: 'pointer', padding: 0, flexShrink: 0,
                lineHeight: 1,
              }}
            >
              🔁
            </button>
          )}

          {/* Mute toggle */}
          {tracks.length > 0 && (
            <button
              onClick={() => setMuted((v) => !v)}
              title={muted ? '取消静音' : '静音'}
              style={{
                background: 'none', border: 'none',
                color: muted ? '#442244' : '#665577',
                fontSize: 14, cursor: 'pointer', padding: 0, flexShrink: 0,
                lineHeight: 1,
              }}
            >
              {muted ? '🔇' : '🔊'}
            </button>
          )}

          {/* Next track (shown when >1 tracks) */}
          {tracks.length > 1 && (
            <button
              onClick={playNext}
              title="下一首"
              style={{
                background: 'none', border: 'none',
                color: '#443355', fontSize: 13, cursor: 'pointer',
                padding: 0, flexShrink: 0, lineHeight: 1,
              }}
            >
              ⏭
            </button>
          )}

          {/* Upload more */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="添加音乐"
            style={{
              background: 'none', border: 'none',
              color: '#332244', fontSize: 14, cursor: 'pointer',
              padding: 0, flexShrink: 0, lineHeight: 1,
            }}
          >
            ＋
          </button>
        </div>

        {/* Track list (only when >1) */}
        {tracks.length > 1 && (
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tracks.map((t, i) => (
              <div
                key={i}
                onClick={() => setTrackIdx(i)}
                style={{
                  fontSize: 10, padding: '2px 4px', borderRadius: 3, cursor: 'pointer',
                  color: i === trackIdx ? '#b8a0e0' : '#3a2a4a',
                  background: i === trackIdx ? '#1e1630' : 'transparent',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
              >
                {i === trackIdx ? '▶ ' : '  '}{t.name}
              </div>
            ))}
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="audio/*" multiple style={{ display: 'none' }} onChange={handleUpload} />
      </div>

      <style>{`@keyframes discSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

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

const actionBtn: React.CSSProperties = {
  width: '100%', background: 'transparent',
  border: '1px solid #333', color: '#aaa',
  cursor: 'pointer', fontSize: 11,
  padding: '5px 8px', borderRadius: 3,
  textAlign: 'left',
};
