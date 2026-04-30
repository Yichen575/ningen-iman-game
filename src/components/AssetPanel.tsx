import { useRef, useState } from 'react';
import type { GameState, ItemType, CharacterProfile, CharacterPose } from '../types';
import CharacterProfileModal from './CharacterProfileModal';

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
  hoverBg:     'rgba(127,176,105,0.08)',
  activeBg:    'rgba(127,176,105,0.12)',
  btnBg:       '#0f1612',
  btnBorder:   'rgba(127,176,105,0.2)',
  btnHover:    'rgba(127,176,105,0.1)',
  charAccent:  '#ff6b1a',
  charBorder:  'rgba(255,107,26,0.3)',
  poseBorder:  '#ff6b1a',
  success:     '#7fb069',
  successBg:   'rgba(127,176,105,0.08)',
  successBdr:  'rgba(127,176,105,0.3)',
  danger:      '#c1121f',
  dangerBg:    'rgba(193,18,31,0.1)',
  dangerBdr:   'rgba(193,18,31,0.35)',
  info:        '#d8d2c2',
  infoBg:      'rgba(242,239,230,0.05)',
  infoBdr:     'rgba(242,239,230,0.15)',
  purpleBg:    'rgba(127,176,105,0.06)',
  purpleBdr:   'rgba(127,176,105,0.2)',
  purpleText:  '#7fb069',
} as const;
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  state: GameState;
  onAddItem: (itemType: ItemType) => void;
  onAddImageItem: (label: string, imageUrl: string, category: 'item' | 'character') => void;
  onUpdateSceneBackground: (sceneId: string, imageUrl: string) => void;
  onRenameItemType: (typeId: string, label: string) => void;
  onDeleteItemType: (typeId: string) => void;
  onUpdateCharacterProfile: (typeId: string, profile: CharacterProfile) => void;
  onAddCharacterPose: (typeId: string, pose: CharacterPose) => void;
  onRemoveCharacterPose: (typeId: string, poseId: string) => void;
  onSetItemPose: (itemId: string, poseId: string) => void;
}

function compressImage(
  file: File,
  maxWidth: number,
  format: 'jpeg' | 'png' = 'jpeg',
  quality = 0.85,
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let w = img.naturalWidth, h = img.naturalHeight;
      if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      if (format === 'jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h); }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(format === 'jpeg' ? canvas.toDataURL('image/jpeg', quality) : canvas.toDataURL('image/png'));
    };
    img.src = url;
  });
}

export default function AssetPanel({
  state, onAddItem, onAddImageItem, onUpdateSceneBackground,
  onRenameItemType, onDeleteItemType, onUpdateCharacterProfile,
  onAddCharacterPose, onRemoveCharacterPose, onSetItemPose,
}: Props) {
  const bgInputRef = useRef<HTMLInputElement>(null);
  const itemInputRef = useRef<HTMLInputElement>(null);
  const charInputRef = useRef<HTMLInputElement>(null);
  const poseInputRef = useRef<HTMLInputElement>(null);
  const [poseTargetTypeId, setPoseTargetTypeId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [profileTypeId, setProfileTypeId] = useState<string | null>(null);

  const activeScene = state.scenes.find((s) => s.id === state.activeSceneId);
  const itemTypes = state.itemTypes.filter((t) => t.kind === 'image' && (t.category ?? 'item') === 'item');
  const charTypes = state.itemTypes.filter((t) => t.kind === 'image' && t.category === 'character' && !(t as ItemType & { _chapterHidden?: boolean })._chapterHidden);

  async function handleBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || !activeScene) return;
    onUpdateSceneBackground(activeScene.id, await compressImage(file, 1920, 'jpeg'));
    e.target.value = '';
  }
  async function handleItemUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    onAddImageItem(file.name.replace(/\.[^.]+$/, '').slice(0, 16) || '新物品', await compressImage(file, 800, 'png'), 'item');
    e.target.value = '';
  }
  async function handleCharUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    onAddImageItem(file.name.replace(/\.[^.]+$/, '').slice(0, 16) || '新人物', await compressImage(file, 800, 'png'), 'character');
    e.target.value = '';
  }
  async function handlePoseUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || !poseTargetTypeId) return;
    const pose: CharacterPose = {
      id: `pose-${crypto.randomUUID()}`,
      name: file.name.replace(/\.[^.]+$/, '').slice(0, 12) || '新姿态',
      imageUrl: await compressImage(file, 800, 'png'),
    };
    onAddCharacterPose(poseTargetTypeId, pose);
    setPoseTargetTypeId(null); e.target.value = '';
  }

  function startRename(typeId: string, currentLabel: string) {
    setRenamingId(typeId); setRenameValue(currentLabel);
  }
  function commitRename(typeId: string) {
    const trimmed = renameValue.trim();
    if (trimmed) onRenameItemType(typeId, trimmed);
    setRenamingId(null); setExpandedId(null);
  }

  function renderTypeList(types: ItemType[], addLabel: string, isCharacter = false) {
    return (
      <>
        {types.length === 0 && (
          <div style={{ padding: '6px 4px 10px', fontSize: 11, color: C.textMuted, lineHeight: 1.8 }}>
            {addLabel}
          </div>
        )}
        {types.map((t) => {
          const expanded = expandedId === t.id;
          const renaming = renamingId === t.id;
          const thumb = t.poses?.[0]?.imageUrl ?? t.imageUrl;
          return (
            <div
              key={t.id}
              style={{
                marginBottom: 3, borderRadius: 5,
                background: expanded ? C.activeBg : 'transparent',
                border: expanded ? `1px solid ${C.border}` : '1px solid transparent',
                transition: 'background 0.15s',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 6px' }}
                onMouseEnter={(e) => { if (!expanded) (e.currentTarget as HTMLDivElement).style.background = C.hoverBg; }}
                onMouseLeave={(e) => { if (!expanded) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                {/* Thumbnail */}
                <div
                  title="点击放入场景"
                  onClick={() => onAddItem(t)}
                  style={{
                    flexShrink: 0, cursor: 'pointer',
                    width: 36, height: 36, borderRadius: 4,
                    border: `1.5px solid ${C.border}`,
                    background: '#070a07', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = C.gold; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = C.border; }}
                >
                  {thumb && (
                    <img src={thumb} alt={t.label}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                  )}
                </div>

                {renaming ? (
                  <input
                    autoFocus value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename(t.id);
                      if (e.key === 'Escape') { setRenamingId(null); setExpandedId(null); }
                    }}
                    onBlur={() => commitRename(t.id)}
                    style={{
                      flex: 1, background: 'rgba(0,0,0,0.6)', color: C.textPri,
                      border: `1px solid ${C.gold}`, borderRadius: 0,
                      padding: '2px 6px', fontSize: 12, outline: 'none', minWidth: 0,
                    }}
                  />
                ) : (
                  <span style={{
                    flex: 1, fontSize: 11, color: expanded ? C.textPri : C.textSec,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {t.label}
                  </span>
                )}

                {!renaming && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setExpandedId(expanded ? null : t.id); }}
                    title="选项"
                    style={{
                      flexShrink: 0, background: 'none', border: 'none',
                      color: expanded ? C.gold : C.textMuted, cursor: 'pointer',
                      fontSize: 16, lineHeight: 1, padding: '0 2px',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = C.goldLight; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = expanded ? C.gold : C.textMuted; }}
                  >
                    ⋯
                  </button>
                )}
              </div>

              {expanded && !renaming && (
                <div style={{ padding: '0 8px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button onClick={() => { onAddItem(t); setExpandedId(null); }}
                    style={{ ...actionBtn, color: C.success, borderColor: C.successBdr, background: C.successBg }}>
                    + 放入当前场景
                  </button>
                  {isCharacter && (
                    <button onClick={() => { setProfileTypeId(t.id); setExpandedId(null); }}
                      style={{ ...actionBtn, color: C.purpleText, borderColor: C.purpleBdr, background: C.purpleBg }}>
                      ✦ 编辑人设档案
                    </button>
                  )}
                  <button onClick={() => startRename(t.id, t.label)}
                    style={{ ...actionBtn, color: C.info, borderColor: C.infoBdr, background: C.infoBg }}>
                    ✎ 更改名称
                  </button>
                  <button onClick={() => { onDeleteItemType(t.id); setExpandedId(null); }}
                    style={{ ...actionBtn, color: C.danger, borderColor: C.dangerBdr, background: C.dangerBg }}>
                    ✕ 删除此素材
                  </button>

                  {/* Pose switcher */}
                  {isCharacter && t.poses && t.poses.length > 0 && (
                    <div style={{ marginTop: 4 }}>
                      <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 5 }}>姿态切换</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {t.poses.map((pose) => {
                          const sceneItems = state.items.filter(
                            (i) => i.itemTypeId === t.id && i.sceneId === state.activeSceneId && !i.trashed
                          );
                          const isActive = sceneItems.length > 0 &&
                            (sceneItems[0].currentPoseId === pose.id ||
                             (!sceneItems[0].currentPoseId && pose.id === t.poses![0].id));
                          return (
                            <div key={pose.id} style={{ position: 'relative' }}>
                              <img
                                src={pose.imageUrl} alt={pose.name} title={pose.name}
                                onClick={() => { sceneItems.forEach((i) => onSetItemPose(i.id, pose.id)); }}
                                style={{
                                  width: 34, height: 34, objectFit: 'contain',
                                  borderRadius: 3, cursor: 'pointer', background: '#070a07',
                                  border: isActive ? `1.5px solid ${C.poseBorder}` : `1px solid ${C.border}`,
                                  boxSizing: 'border-box', display: 'block',
                                  transition: 'border-color 0.15s',
                                }}
                              />
                              {t.poses!.length > 1 && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); onRemoveCharacterPose(t.id, pose.id); }}
                                  title="删除此姿态"
                                  style={{
                                    position: 'absolute', top: -5, right: -5,
                                    width: 14, height: 14, borderRadius: '50%',
                                    background: C.dangerBg, border: `1px solid ${C.dangerBdr}`,
                                    color: C.danger, fontSize: 9, lineHeight: 1,
                                    cursor: 'pointer', padding: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}
                                >×</button>
                              )}
                            </div>
                          );
                        })}
                        <button
                          onClick={() => { setPoseTargetTypeId(t.id); poseInputRef.current?.click(); }}
                          title="添加姿态"
                          style={{
                            width: 34, height: 34, borderRadius: 3,
                            background: '#070a07', border: `1px dashed ${C.border}`,
                            color: C.textMuted, fontSize: 18, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, transition: 'border-color 0.15s, color 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = C.gold;
                            (e.currentTarget as HTMLButtonElement).style.color = C.gold;
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = C.border;
                            (e.currentTarget as HTMLButtonElement).style.color = C.textMuted;
                          }}
                        >+</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  }

  const profileType = profileTypeId ? state.itemTypes.find((t) => t.id === profileTypeId) : null;

  return (
    <>
      {profileType && (
        <CharacterProfileModal
          itemType={profileType}
          onSave={(profile) => onUpdateCharacterProfile(profileType.id, profile)}
          onClose={() => setProfileTypeId(null)}
        />
      )}
      <div style={{
        width: 200, flexShrink: 0,
        background: C.panelBg,
        borderLeft: `2px solid ${C.border}`,
        display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto',
      }}>
        {/* Panel header */}
        <div style={{
          padding: '14px 12px 12px',
          borderBottom: `1px solid ${C.border}`,
          background: `linear-gradient(to bottom, #1a2320, ${C.panelBg})`,
          backgroundImage: `
            linear-gradient(rgba(127,176,105,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(127,176,105,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, #1a2320, ${C.panelBg})
          `,
          backgroundSize: '16px 16px, 16px 16px, 100% 100%',
        }}>
          <div style={{
            fontSize: 9, fontWeight: 700, color: '#7fb069',
            letterSpacing: '0.35em', textTransform: 'uppercase',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            · 素 材 管 理
          </div>
        </div>

        {/* Scene background */}
        <Section label="场景背景">
          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8 }}>
            当前：{activeScene?.name ?? '—'}
          </div>
          <UploadBtn onClick={() => bgInputRef.current?.click()}>上传背景图</UploadBtn>
          <input ref={bgInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBgUpload} />
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 5 }}>超过 1920px 自动压缩</div>
        </Section>

        {/* Characters */}
        <Section label="人 物" accent={C.charAccent} borderColor={C.charBorder} last={false}>
          <UploadBtn
            onClick={() => charInputRef.current?.click()}
            color={C.charAccent} borderColor={C.charBorder}
          >
            上传人物立绘
          </UploadBtn>
          <input ref={charInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCharUpload} />
          <input ref={poseInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePoseUpload} />
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 5, marginBottom: charTypes.length ? 8 : 0 }}>
            建议使用透明背景 PNG
          </div>
          {renderTypeList(charTypes, '上传人物立绘后可放入场景', true)}
        </Section>

        {/* Props / Items */}
        <Section label="道 具" last>
          <UploadBtn onClick={() => itemInputRef.current?.click()}>上传道具图片</UploadBtn>
          <input ref={itemInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleItemUpload} />
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 5, marginBottom: itemTypes.length ? 8 : 0 }}>
            超过 800px 自动压缩
          </div>
          {renderTypeList(itemTypes, '上传图片后可放入场景')}
        </Section>
      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({
  label, accent, borderColor, last, children,
}: {
  label: string;
  accent?: string;
  borderColor?: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      padding: '11px 10px',
      borderBottom: last ? 'none' : `1px solid rgba(127,176,105,0.12)`,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
        color: accent ?? '#d8d2c2',
        marginBottom: 8,
        paddingBottom: 5,
        borderBottom: `1px solid ${borderColor ?? 'rgba(127,176,105,0.12)'}`,
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function UploadBtn({
  onClick, color, borderColor, children,
}: {
  onClick: () => void;
  color?: string;
  borderColor?: string;
  children: React.ReactNode;
}) {
  const base: React.CSSProperties = {
    width: '100%', background: 'rgba(11,15,12,0.8)',
    border: `1px solid ${borderColor ?? 'rgba(127,176,105,0.2)'}`,
    color: color ?? '#d8d2c2',
    cursor: 'pointer', fontSize: 11,
    padding: '7px 0', borderRadius: 0,
    transition: 'background 0.15s, color 0.15s, border-color 0.15s',
    letterSpacing: '0.15em',
    fontFamily: "'JetBrains Mono', monospace",
  };
  return (
    <button
      onClick={onClick}
      style={base}
      onMouseEnter={(e) => {
        const b = e.currentTarget as HTMLButtonElement;
        b.style.background = 'rgba(127,176,105,0.1)';
        b.style.color = color ? '#ff8a3d' : '#7fb069';
        b.style.borderColor = color ? 'rgba(255,107,26,0.5)' : 'rgba(127,176,105,0.5)';
      }}
      onMouseLeave={(e) => {
        const b = e.currentTarget as HTMLButtonElement;
        b.style.background = 'rgba(11,15,12,0.8)';
        b.style.color = color ?? '#d8d2c2';
        b.style.borderColor = borderColor ?? 'rgba(127,176,105,0.2)';
      }}
    >
      {children}
    </button>
  );
}

const actionBtn: React.CSSProperties = {
  width: '100%', background: 'transparent',
  border: '1px solid rgba(127,176,105,0.15)', color: '#d8d2c2',
  cursor: 'pointer', fontSize: 10,
  padding: '5px 8px', borderRadius: 0, textAlign: 'left',
  transition: 'background 0.12s, color 0.12s',
  fontFamily: "'JetBrains Mono', monospace",
  letterSpacing: '0.1em',
};
