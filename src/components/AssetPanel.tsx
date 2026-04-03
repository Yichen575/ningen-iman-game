import { useRef, useState } from 'react';
import type { GameState, ItemType, CharacterProfile, CharacterPose } from '../types';
import CharacterProfileModal from './CharacterProfileModal';

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
      if (format === 'jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
      }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(format === 'jpeg'
        ? canvas.toDataURL('image/jpeg', quality)
        : canvas.toDataURL('image/png'),
      );
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
  const charTypes = state.itemTypes.filter((t) => t.kind === 'image' && t.category === 'character');

  async function handleBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activeScene) return;
    const compressed = await compressImage(file, 1920, 'jpeg');
    onUpdateSceneBackground(activeScene.id, compressed);
    e.target.value = '';
  }

  async function handleItemUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file, 800, 'png');
    const label = file.name.replace(/\.[^.]+$/, '').slice(0, 16) || '新物品';
    onAddImageItem(label, compressed, 'item');
    e.target.value = '';
  }

  async function handleCharUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file, 800, 'png');
    const label = file.name.replace(/\.[^.]+$/, '').slice(0, 16) || '新人物';
    onAddImageItem(label, compressed, 'character');
    e.target.value = '';
  }

  async function handlePoseUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !poseTargetTypeId) return;
    const compressed = await compressImage(file, 800, 'png');
    const poseName = file.name.replace(/\.[^.]+$/, '').slice(0, 12) || '新姿态';
    const pose: CharacterPose = {
      id: `pose-${crypto.randomUUID()}`,
      name: poseName,
      imageUrl: compressed,
    };
    onAddCharacterPose(poseTargetTypeId, pose);
    setPoseTargetTypeId(null);
    e.target.value = '';
  }

  function startRename(typeId: string, currentLabel: string) {
    setRenamingId(typeId);
    setRenameValue(currentLabel);
  }

  function commitRename(typeId: string) {
    const trimmed = renameValue.trim();
    if (trimmed) onRenameItemType(typeId, trimmed);
    setRenamingId(null);
    setExpandedId(null);
  }

  function renderTypeList(types: ItemType[], addLabel: string, isCharacter = false) {
    return (
      <>
        {types.length === 0 && (
          <div style={{ padding: '6px 10px 10px', fontSize: 11, color: '#444', lineHeight: 1.8 }}>
            {addLabel}
          </div>
        )}
        {types.map((t) => {
          const expanded = expandedId === t.id;
          const renaming = renamingId === t.id;
          return (
            <div key={t.id} style={{ marginBottom: 2, borderRadius: 4, background: expanded ? '#1a1e2c' : 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 4px' }}>
                <div
                  title="点击放入场景"
                  onClick={() => onAddItem(t)}
                  style={{ flexShrink: 0, cursor: 'pointer' }}
                >
                  {t.imageUrl && (
                    <img
                      src={t.imageUrl} alt={t.label}
                      style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 2, display: 'block' }}
                    />
                  )}
                </div>

                {renaming ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename(t.id);
                      if (e.key === 'Escape') { setRenamingId(null); setExpandedId(null); }
                    }}
                    onBlur={() => commitRename(t.id)}
                    style={{
                      flex: 1, background: '#0e1218', color: '#e8e0c0',
                      border: '1px solid #ffd84a', borderRadius: 3,
                      padding: '2px 6px', fontSize: 12, outline: 'none', minWidth: 0,
                    }}
                  />
                ) : (
                  <span style={{
                    flex: 1, fontSize: 11, color: '#ccc',
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
                      color: expanded ? '#ffd84a' : '#446', cursor: 'pointer',
                      fontSize: 16, lineHeight: 1, padding: '0 2px',
                    }}
                  >
                    ⋯
                  </button>
                )}
              </div>

              {expanded && !renaming && (
                <div style={{ padding: '0 8px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button
                    onClick={() => { onAddItem(t); setExpandedId(null); }}
                    style={{ ...actionBtn, color: '#66cc66', borderColor: '#336633', background: '#1a2a1a' }}
                  >
                    + 放入当前场景
                  </button>
                  {isCharacter && (
                    <button
                      onClick={() => { setProfileTypeId(t.id); setExpandedId(null); }}
                      style={{ ...actionBtn, color: '#d4c0f0', borderColor: '#5a3a8a', background: '#201a30' }}
                    >
                      ✦ 编辑人设档案
                    </button>
                  )}
                  <button
                    onClick={() => startRename(t.id, t.label)}
                    style={{ ...actionBtn, color: '#88aaff', borderColor: '#334488', background: '#1a1a2a' }}
                  >
                    ✎ 更改名称
                  </button>
                  <button
                    onClick={() => { onDeleteItemType(t.id); setExpandedId(null); }}
                    style={{ ...actionBtn, color: '#ff6060', borderColor: '#662222', background: '#2a1a1a' }}
                  >
                    ✕ 删除此素材
                  </button>

                  {/* ── Pose switcher (characters only) ───────────────────── */}
                  {isCharacter && t.poses && t.poses.length > 0 && (
                    <div style={{ marginTop: 4 }}>
                      <div style={{ fontSize: 10, color: '#776688', marginBottom: 5 }}>姿态切换</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {t.poses.map((pose) => {
                          // Find first active-scene item of this type to show active highlight
                          const sceneItems = state.items.filter(
                            (i) => i.itemTypeId === t.id && i.sceneId === state.activeSceneId && !i.trashed
                          );
                          const isActive = sceneItems.length > 0 &&
                            (sceneItems[0].currentPoseId === pose.id ||
                             (!sceneItems[0].currentPoseId && pose.id === t.poses![0].id));
                          return (
                            <div key={pose.id} style={{ position: 'relative' }}>
                              <img
                                src={pose.imageUrl}
                                alt={pose.name}
                                title={pose.name}
                                onClick={() => {
                                  sceneItems.forEach((i) => onSetItemPose(i.id, pose.id));
                                }}
                                style={{
                                  width: 34, height: 34, objectFit: 'contain',
                                  borderRadius: 3, cursor: 'pointer',
                                  background: '#0a0c12',
                                  border: isActive ? '1.5px solid #b8a0e0' : '1px solid #2a2a3a',
                                  boxSizing: 'border-box',
                                  display: 'block',
                                }}
                              />
                              {t.poses!.length > 1 && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); onRemoveCharacterPose(t.id, pose.id); }}
                                  title="删除此姿态"
                                  style={{
                                    position: 'absolute', top: -5, right: -5,
                                    width: 14, height: 14, borderRadius: '50%',
                                    background: '#2a1010', border: '1px solid #882222',
                                    color: '#ff6060', fontSize: 9, lineHeight: 1,
                                    cursor: 'pointer', padding: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          );
                        })}
                        {/* Add pose button */}
                        <button
                          onClick={() => { setPoseTargetTypeId(t.id); poseInputRef.current?.click(); }}
                          title="添加姿态"
                          style={{
                            width: 34, height: 34, borderRadius: 3,
                            background: '#12151e', border: '1px dashed #3a3a50',
                            color: '#446', fontSize: 18, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          +
                        </button>
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
      width: 200, flexShrink: 0, background: '#0e1016',
      borderLeft: '2px solid #2a2a3a', display: 'flex',
      flexDirection: 'column', height: '100%', overflowY: 'auto',
    }}>
      <div style={{ padding: '12px 10px', borderBottom: '1px solid #2a2a3a', fontSize: 13, fontWeight: 600, color: '#ffd84a' }}>
        素材管理
      </div>

      {/* Scene background */}
      <div style={{ padding: '12px 10px', borderBottom: '1px solid #1a1a2a' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#ccc', marginBottom: 6 }}>更换场景背景</div>
        <div style={{ fontSize: 11, color: '#666', marginBottom: 10 }}>当前：{activeScene?.name ?? '—'}</div>
        <button onClick={() => bgInputRef.current?.click()} style={btnStyle}>上传背景图</button>
        <input ref={bgInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBgUpload} />
        <div style={{ fontSize: 10, color: '#444', marginTop: 5 }}>超过 1920px 自动压缩</div>
      </div>

      {/* ── Characters ── */}
      <div style={{ padding: '12px 10px', borderBottom: '1px solid #1a1a2a' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#b8a0e0', marginBottom: 8 }}>
          人物
        </div>
        <button onClick={() => charInputRef.current?.click()} style={{ ...btnStyle, borderColor: '#4a3a6a', color: '#b8a0e0' }}>
          上传人物立绘
        </button>
        <input ref={charInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCharUpload} />
        <input ref={poseInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePoseUpload} />
        <div style={{ fontSize: 10, color: '#444', marginTop: 5, marginBottom: charTypes.length ? 8 : 0 }}>
          建议使用透明背景 PNG
        </div>
        {renderTypeList(charTypes, '上传人物立绘后可放入场景', true)}
      </div>

      {/* ── Props / Items ── */}
      <div style={{ padding: '12px 10px 0' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#ccc', marginBottom: 8 }}>
          道具
        </div>
        <button onClick={() => itemInputRef.current?.click()} style={btnStyle}>
          上传道具图片
        </button>
        <input ref={itemInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleItemUpload} />
        <div style={{ fontSize: 10, color: '#444', marginTop: 5, marginBottom: itemTypes.length ? 8 : 0 }}>
          超过 800px 自动压缩
        </div>
        {renderTypeList(itemTypes, '上传图片后可放入场景')}
      </div>
    </div>
    </>
  );
}

const btnStyle: React.CSSProperties = {
  width: '100%', background: '#1a2030', border: '1px solid #3a4060',
  color: '#88aacc', cursor: 'pointer', fontSize: 12,
  padding: '8px 0', borderRadius: 4,
};

const actionBtn: React.CSSProperties = {
  width: '100%', background: 'transparent', border: '1px solid #333',
  color: '#aaa', cursor: 'pointer', fontSize: 11,
  padding: '5px 8px', borderRadius: 3, textAlign: 'left',
};
